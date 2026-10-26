-- Additive compact account saves. Existing full-history rows/checkpoint versions
-- remain untouched. New writes retain current state and compressed journal chunks.
SET search_path=spacetrader,pg_catalog,pg_temp;
ALTER TABLE spacetrader_voyages ADD COLUMN IF NOT EXISTS compact_start bigint;
ALTER TABLE spacetrader_voyages ADD COLUMN IF NOT EXISTS compact_summary jsonb;
ALTER TABLE spacetrader_voyages ADD COLUMN IF NOT EXISTS compact_operation text;
ALTER TABLE spacetrader_voyages ADD COLUMN IF NOT EXISTS compact_action_digest text;
CREATE TABLE IF NOT EXISTS spacetrader_journal_chunks (
 voyage_id uuid NOT NULL REFERENCES spacetrader_voyages(id),
 first_sequence bigint NOT NULL CHECK(first_sequence>0),last_sequence bigint NOT NULL,
 digest text NOT NULL,payload text NOT NULL,
 PRIMARY KEY(voyage_id,first_sequence),
 CHECK(last_sequence>=first_sequence AND last_sequence<first_sequence+128)
);
CREATE TABLE IF NOT EXISTS spacetrader_snapshot_slots (
 voyage_id uuid NOT NULL REFERENCES spacetrader_voyages(id),slot text NOT NULL,
 digest text,payload text,created_ms bigint NOT NULL,
 PRIMARY KEY(voyage_id,slot),
 CHECK(slot IN ('slot1','slot2','slot3')),
 CHECK(slot<>'slot3' OR payload IS NULL),
 CHECK((digest IS NULL)=(payload IS NULL))
);
CREATE OR REPLACE FUNCTION spacetrader_compact_append(
 owner_id uuid,target uuid,parent text,op text,event_hash text,head_hash text,head text,details jsonb,
 chunk_first bigint,chunk_last bigint,chunk_parent text,chunk_hash text,chunk_payload text,
 max_account bigint,max_total bigint,importing boolean
) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts;voyage spacetrader_voyages;chunk spacetrader_journal_chunks;
 total bigint;additional bigint;next_seq bigint;
BEGIN
 SELECT bytes INTO total FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE id=target AND account_id=owner_id FOR UPDATE;
 IF account.id IS NULL OR voyage.id IS NULL THEN RAISE EXCEPTION 'voyage_missing'; END IF;
 IF voyage.compact_operation=op THEN
  IF voyage.head_digest<>head_hash OR voyage.compact_action_digest<>event_hash THEN RAISE EXCEPTION 'operation_reused'; END IF;
  RETURN jsonb_build_object('replayed',true,'voyage',target,'sequence',voyage.sequence);
 END IF;
 IF voyage.revision IS DISTINCT FROM parent THEN RETURN jsonb_build_object('conflict',true); END IF;
 IF importing AND (voyage.import_total IS NULL OR voyage.completed_at IS NOT NULL OR account.active_voyage=target OR voyage.sequence>=voyage.import_total) THEN RAISE EXCEPTION 'invalid_import'; END IF;
 IF NOT importing AND voyage.import_total IS NOT NULL AND voyage.completed_at IS NULL AND account.active_voyage IS DISTINCT FROM target THEN RAISE EXCEPTION 'invalid_import'; END IF;
 next_seq=voyage.sequence+1;
 IF chunk_last<>next_seq OR chunk_first>next_seq OR chunk_first<1 OR chunk_last>=chunk_first+128 THEN RAISE EXCEPTION 'journal_sequence'; END IF;
 SELECT * INTO chunk FROM spacetrader_journal_chunks WHERE voyage_id=target AND first_sequence=chunk_first FOR UPDATE;
 IF chunk.digest IS DISTINCT FROM chunk_parent OR (chunk.voyage_id IS NULL AND chunk_first<>next_seq) OR (chunk.voyage_id IS NOT NULL AND chunk.last_sequence<>voyage.sequence) THEN RETURN jsonb_build_object('conflict',true); END IF;
 additional=octet_length(head)-coalesce(octet_length(voyage.head_payload),0)+octet_length(chunk_payload)-coalesce(octet_length(chunk.payload),0)+CASE WHEN chunk.voyage_id IS NULL THEN 256 ELSE 0 END+octet_length(details::text)-coalesce(octet_length(voyage.compact_summary::text),0)+CASE WHEN voyage.compact_start IS NULL THEN 256 ELSE 0 END;
 IF account.stored_bytes+additional>max_account OR total+additional>max_total THEN RAISE EXCEPTION 'storage_limit'; END IF;
 INSERT INTO spacetrader_journal_chunks(voyage_id,first_sequence,last_sequence,digest,payload) VALUES(target,chunk_first,chunk_last,chunk_hash,chunk_payload)
 ON CONFLICT(voyage_id,first_sequence) DO UPDATE SET last_sequence=excluded.last_sequence,digest=excluded.digest,payload=excluded.payload;
 UPDATE spacetrader_voyages SET sequence=next_seq,revision=head_hash||':'||next_seq,head_digest=head_hash,head_payload=head,compact_start=coalesce(compact_start,next_seq),compact_summary=details,compact_operation=op,compact_action_digest=event_hash,updated_at=now() WHERE id=target;
 UPDATE spacetrader_accounts SET stored_bytes=stored_bytes+additional WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes+additional WHERE singleton;
 RETURN jsonb_build_object('voyage',target,'sequence',next_seq);
END $$;
CREATE OR REPLACE FUNCTION spacetrader_compact_checkpoint(
 owner_id uuid,target uuid,parent text,slot_name text,expected_hash text,next_hash text,packed text,
 max_account bigint,max_total bigint
) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts;voyage spacetrader_voyages;prior spacetrader_snapshot_slots;
 prior_hash text;total bigint;additional bigint;
BEGIN
 SELECT bytes INTO total FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE id=target AND account_id=owner_id FOR UPDATE;
 IF voyage.id IS NULL OR (voyage.import_total IS NOT NULL AND voyage.completed_at IS NULL AND account.active_voyage IS DISTINCT FROM target) THEN RAISE EXCEPTION 'voyage_missing'; END IF;
 IF slot_name NOT IN ('slot1','slot2','slot3') OR (slot_name='slot3' AND packed IS NOT NULL) THEN RAISE EXCEPTION 'checkpoint_slot'; END IF;
 SELECT * INTO prior FROM spacetrader_snapshot_slots WHERE voyage_id=target AND slot=slot_name FOR UPDATE;
 prior_hash=prior.digest;
 IF prior.voyage_id IS NULL THEN SELECT digest INTO prior_hash FROM spacetrader_checkpoints WHERE voyage_id=target AND slot=slot_name AND current; END IF;
 IF voyage.revision IS DISTINCT FROM parent OR prior_hash IS DISTINCT FROM expected_hash THEN RETURN jsonb_build_object('conflict',true); END IF;
 IF prior_hash IS NOT DISTINCT FROM next_hash THEN RETURN jsonb_build_object('unchanged',true); END IF;
 additional=coalesce(octet_length(packed),0)-coalesce(octet_length(prior.payload),0)+CASE WHEN prior.voyage_id IS NULL THEN 256 ELSE 0 END;
 IF account.stored_bytes+additional>max_account OR total+additional>max_total THEN RAISE EXCEPTION 'storage_limit'; END IF;
 INSERT INTO spacetrader_snapshot_slots(voyage_id,slot,digest,payload,created_ms) VALUES(target,slot_name,next_hash,packed,(extract(epoch FROM now())*1000)::bigint)
 ON CONFLICT(voyage_id,slot) DO UPDATE SET digest=excluded.digest,payload=excluded.payload,created_ms=excluded.created_ms;
 UPDATE spacetrader_accounts SET stored_bytes=stored_bytes+additional WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes+additional WHERE singleton;
 RETURN jsonb_build_object('saved',true);
END $$;
REVOKE ALL ON spacetrader_journal_chunks,spacetrader_snapshot_slots FROM PUBLIC;
REVOKE ALL ON FUNCTION spacetrader_compact_append(uuid,uuid,text,text,text,text,text,jsonb,bigint,bigint,text,text,text,bigint,bigint,boolean),spacetrader_compact_checkpoint(uuid,uuid,text,text,text,text,text,bigint,bigint) FROM PUBLIC;
-- Fail closed if an older server is rolled back over a compact voyage. It must
-- not create a second, incomplete state-replay history after the format boundary.
CREATE OR REPLACE FUNCTION spacetrader_compact_format_guard() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM spacetrader_voyages WHERE id=NEW.voyage_id AND compact_start IS NOT NULL) THEN RAISE EXCEPTION 'compact_format_required'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS spacetrader_entries_compact_guard ON spacetrader_entries;
CREATE TRIGGER spacetrader_entries_compact_guard BEFORE INSERT ON spacetrader_entries FOR EACH ROW EXECUTE FUNCTION spacetrader_compact_format_guard();
REVOKE ALL ON FUNCTION spacetrader_compact_format_guard() FROM PUBLIC;
