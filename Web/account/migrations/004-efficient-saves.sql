-- Exact binary components and bounded lossless journal archives. No quota changes.
SET search_path=spacetrader,pg_catalog,pg_temp;
ALTER TABLE spacetrader_voyages ADD COLUMN IF NOT EXISTS efficient_core bytea;
ALTER TABLE spacetrader_voyages ADD COLUMN IF NOT EXISTS efficient_component text;
ALTER TABLE spacetrader_snapshot_slots ADD COLUMN IF NOT EXISTS efficient_core bytea;
ALTER TABLE spacetrader_snapshot_slots ADD COLUMN IF NOT EXISTS efficient_component text;
CREATE TABLE IF NOT EXISTS spacetrader_world_components (
 voyage_id uuid NOT NULL REFERENCES spacetrader_voyages(id),digest text NOT NULL,
 prefix text NOT NULL CHECK(prefix IN ('','R1:','D1:','S')),payload bytea NOT NULL CHECK(octet_length(payload)<2000000),
 PRIMARY KEY(voyage_id,digest),CHECK(digest ~ '^[a-f0-9]{64}$')
);
CREATE TABLE IF NOT EXISTS spacetrader_journal_archives (
 voyage_id uuid NOT NULL REFERENCES spacetrader_voyages(id),first_sequence bigint NOT NULL,last_sequence bigint NOT NULL,
 digest text NOT NULL,payload_digest text NOT NULL,raw_bytes integer NOT NULL,payload bytea NOT NULL,
 PRIMARY KEY(voyage_id,first_sequence),CHECK(first_sequence>0 AND last_sequence>=first_sequence AND last_sequence<first_sequence+8192),
 CHECK(raw_bytes BETWEEN 1 AND 16777216 AND octet_length(payload)<2000000),
 CHECK(digest ~ '^[a-f0-9]{64}$' AND payload_digest ~ '^[a-f0-9]{64}$')
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
 IF voyage.head_payload='E1' AND head<>'E1' THEN RAISE EXCEPTION 'efficient_format_required';END IF;
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
 IF prior.payload='E1' AND prior.efficient_core IS NOT NULL THEN RAISE EXCEPTION 'efficient_format_required';END IF;
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

-- A narrow definer boundary replaces verified chunks and garbage-collects only
-- components no longer referenced by this voyage's current head or manual slots.
CREATE OR REPLACE FUNCTION spacetrader_efficient_append(
 owner_id uuid,target uuid,parent text,op text,event_hash text,head_hash text,core bytea,component text,component_prefix text,component_payload bytea,details jsonb,
 chunk_first bigint,chunk_last bigint,chunk_parent text,chunk_hash text,chunk_payload text,max_account bigint,max_total bigint,importing boolean
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts;voyage spacetrader_voyages;extra bigint;part_bytes bigint:=0;old_bytes bigint:=0;result jsonb;
BEGIN
 PERFORM 1 FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE id=target AND account_id=owner_id FOR UPDATE;
 IF account.id IS NULL OR voyage.id IS NULL THEN RAISE EXCEPTION 'voyage_missing'; END IF;
 IF voyage.compact_operation=op THEN
  IF voyage.head_digest<>head_hash OR voyage.compact_action_digest<>event_hash THEN RAISE EXCEPTION 'operation_reused'; END IF;
  RETURN jsonb_build_object('replayed',true,'voyage',target,'sequence',voyage.sequence);
 END IF;
 IF voyage.revision IS DISTINCT FROM parent THEN RETURN jsonb_build_object('conflict',true); END IF;
 IF core IS NULL OR octet_length(core)>=2000000 OR (component IS NULL AND component_payload IS NOT NULL) THEN RAISE EXCEPTION 'invalid_component'; END IF;
 IF component IS NOT NULL THEN
  IF NOT EXISTS(SELECT 1 FROM spacetrader_world_components WHERE voyage_id=target AND digest=component) THEN
   IF component_payload IS NULL THEN RAISE EXCEPTION 'component_missing';END IF;
   INSERT INTO spacetrader_world_components VALUES(target,component,component_prefix,component_payload);part_bytes=octet_length(component_payload)+256;
  ELSIF component_payload IS NOT NULL AND NOT EXISTS(SELECT 1 FROM spacetrader_world_components WHERE voyage_id=target AND digest=component AND prefix=component_prefix AND payload=component_payload) THEN RAISE EXCEPTION 'component_mismatch'; END IF;
 END IF;
 IF voyage.efficient_component IS DISTINCT FROM component AND voyage.efficient_component IS NOT NULL AND NOT EXISTS(SELECT 1 FROM spacetrader_snapshot_slots WHERE voyage_id=target AND efficient_component=voyage.efficient_component) THEN
  SELECT coalesce(octet_length(payload)+256,0) INTO old_bytes FROM spacetrader_world_components WHERE voyage_id=target AND digest=voyage.efficient_component;
 END IF;
 extra=octet_length(core)-coalesce(octet_length(voyage.efficient_core),0)+part_bytes-coalesce(old_bytes,0);
 UPDATE spacetrader_accounts SET stored_bytes=stored_bytes+extra WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes+extra WHERE singleton;
 result=spacetrader_compact_append(owner_id,target,parent,op,event_hash,head_hash,'E1',details,chunk_first,chunk_last,chunk_parent,chunk_hash,chunk_payload,max_account,max_total,importing);
 IF result ? 'conflict' THEN RAISE EXCEPTION 'concurrent_chunk'; END IF;
 UPDATE spacetrader_voyages SET efficient_core=core,efficient_component=component WHERE id=target;
 DELETE FROM spacetrader_world_components c WHERE c.voyage_id=target AND c.digest IS DISTINCT FROM component AND NOT EXISTS(SELECT 1 FROM spacetrader_snapshot_slots s WHERE s.voyage_id=target AND s.efficient_component=c.digest);
 RETURN result;
END $$;
CREATE OR REPLACE FUNCTION spacetrader_efficient_checkpoint(
 owner_id uuid,target uuid,parent text,slot_name text,expected_hash text,next_hash text,core bytea,component text,component_prefix text,component_payload bytea,max_account bigint,max_total bigint
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts;voyage spacetrader_voyages;prior spacetrader_snapshot_slots;prior_hash text;extra bigint;part_bytes bigint:=0;old_bytes bigint:=0;result jsonb;
BEGIN
 PERFORM 1 FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE id=target AND account_id=owner_id FOR UPDATE;
 IF account.id IS NULL OR voyage.id IS NULL THEN RAISE EXCEPTION 'voyage_missing'; END IF;
 IF slot_name NOT IN ('slot1','slot2','slot3') OR (slot_name='slot3' AND core IS NOT NULL) OR (next_hash IS NULL)<>(core IS NULL) OR (component IS NULL AND component_payload IS NOT NULL) OR octet_length(core)>=2000000 THEN RAISE EXCEPTION 'checkpoint_slot'; END IF;
 SELECT * INTO prior FROM spacetrader_snapshot_slots WHERE voyage_id=target AND slot=slot_name FOR UPDATE;
 prior_hash=prior.digest;IF prior.voyage_id IS NULL THEN SELECT digest INTO prior_hash FROM spacetrader_checkpoints WHERE voyage_id=target AND slot=slot_name AND current; END IF;
 IF voyage.revision IS DISTINCT FROM parent OR prior_hash IS DISTINCT FROM expected_hash THEN RETURN jsonb_build_object('conflict',true); END IF;
 IF prior_hash IS NOT DISTINCT FROM next_hash THEN RETURN jsonb_build_object('unchanged',true); END IF;
 IF component IS NOT NULL THEN
  IF NOT EXISTS(SELECT 1 FROM spacetrader_world_components WHERE voyage_id=target AND digest=component) THEN IF component_payload IS NULL THEN RAISE EXCEPTION 'component_missing';END IF;INSERT INTO spacetrader_world_components VALUES(target,component,component_prefix,component_payload);part_bytes=octet_length(component_payload)+256;
  ELSIF component_payload IS NOT NULL AND NOT EXISTS(SELECT 1 FROM spacetrader_world_components WHERE voyage_id=target AND digest=component AND prefix=component_prefix AND payload=component_payload) THEN RAISE EXCEPTION 'component_mismatch'; END IF;
 END IF;
 IF prior.efficient_component IS DISTINCT FROM component AND prior.efficient_component IS DISTINCT FROM voyage.efficient_component AND prior.efficient_component IS NOT NULL AND NOT EXISTS(SELECT 1 FROM spacetrader_snapshot_slots WHERE voyage_id=target AND slot<>slot_name AND efficient_component=prior.efficient_component) THEN SELECT coalesce(octet_length(payload)+256,0) INTO old_bytes FROM spacetrader_world_components WHERE voyage_id=target AND digest=prior.efficient_component;END IF;
 extra=coalesce(octet_length(core),0)-coalesce(octet_length(prior.efficient_core),0)+part_bytes-coalesce(old_bytes,0);
 UPDATE spacetrader_accounts SET stored_bytes=stored_bytes+extra WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes+extra WHERE singleton;
 UPDATE spacetrader_snapshot_slots SET efficient_core=NULL,efficient_component=NULL WHERE voyage_id=target AND slot=slot_name;
 result=spacetrader_compact_checkpoint(owner_id,target,parent,slot_name,expected_hash,next_hash,CASE WHEN core IS NULL THEN NULL ELSE 'E1' END,max_account,max_total);
 IF result ? 'conflict' THEN RAISE EXCEPTION 'concurrent_checkpoint'; END IF;
 UPDATE spacetrader_snapshot_slots SET efficient_core=core,efficient_component=component WHERE voyage_id=target AND slot=slot_name;
 DELETE FROM spacetrader_world_components c WHERE c.voyage_id=target AND c.digest IS DISTINCT FROM voyage.efficient_component AND NOT EXISTS(SELECT 1 FROM spacetrader_snapshot_slots s WHERE s.voyage_id=target AND s.efficient_component=c.digest);
 RETURN result;
END $$;
CREATE OR REPLACE FUNCTION spacetrader_archive_replace(owner_id uuid,target uuid,first_seq bigint,last_seq bigint,prior_hash text,expected jsonb,canonical_hash text,packed_hash text,canonical_bytes integer,packed bytea)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE voyage spacetrader_voyages;archive spacetrader_journal_archives;actual jsonb;removed bigint;additional bigint;next_first bigint;piece jsonb;
BEGIN
 PERFORM 1 FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 PERFORM 1 FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE id=target AND account_id=owner_id FOR UPDATE;
 IF voyage.id IS NULL THEN RAISE EXCEPTION 'voyage_missing';END IF;
 IF jsonb_typeof(expected)<>'array' OR jsonb_array_length(expected) NOT BETWEEN 1 AND 64 OR first_seq<1 OR last_seq>=voyage.sequence OR last_seq>=first_seq+8192 OR encode(sha256(packed),'hex')<>packed_hash THEN RAISE EXCEPTION 'invalid_archive';END IF;
 SELECT * INTO archive FROM spacetrader_journal_archives WHERE voyage_id=target AND first_sequence=first_seq FOR UPDATE;
 IF archive.digest IS DISTINCT FROM prior_hash THEN RETURN false;END IF;
 next_first=coalesce(archive.last_sequence+1,first_seq);
 FOR piece IN SELECT value FROM jsonb_array_elements(expected) LOOP
  IF (piece->>0)::bigint<>next_first THEN RAISE EXCEPTION 'archive_gap';END IF;next_first=(piece->>1)::bigint+1;
 END LOOP;
 IF next_first<>last_seq+1 THEN RAISE EXCEPTION 'archive_gap';END IF;
 SELECT jsonb_agg(jsonb_build_array(first_sequence,last_sequence,digest) ORDER BY first_sequence),sum(octet_length(payload)+256) INTO actual,removed FROM spacetrader_journal_chunks WHERE voyage_id=target AND first_sequence>=coalesce(archive.last_sequence+1,first_seq) AND last_sequence<=last_seq;
 IF actual IS DISTINCT FROM expected THEN RETURN false;END IF;
 IF EXISTS(SELECT 1 FROM spacetrader_journal_archives WHERE voyage_id=target AND first_sequence<>first_seq AND first_sequence<=last_seq AND last_sequence>=first_seq) THEN RAISE EXCEPTION 'archive_overlap';END IF;
 additional=octet_length(packed)+256-coalesce(octet_length(archive.payload)+256,0)-removed;
 -- Compaction is only allowed to shrink charged storage; it cannot bypass quotas.
 IF additional>0 THEN RETURN false;END IF;
 INSERT INTO spacetrader_journal_archives VALUES(target,first_seq,last_seq,canonical_hash,packed_hash,canonical_bytes,packed) ON CONFLICT(voyage_id,first_sequence) DO UPDATE SET last_sequence=excluded.last_sequence,digest=excluded.digest,payload_digest=excluded.payload_digest,raw_bytes=excluded.raw_bytes,payload=excluded.payload;
 DELETE FROM spacetrader_journal_chunks WHERE voyage_id=target AND first_sequence>=coalesce(archive.last_sequence+1,first_seq) AND last_sequence<=last_seq;
 UPDATE spacetrader_accounts SET stored_bytes=stored_bytes+additional WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes+additional WHERE singleton;
 RETURN true;
END $$;
REVOKE ALL ON spacetrader_world_components,spacetrader_journal_archives FROM PUBLIC;
REVOKE ALL ON FUNCTION spacetrader_efficient_append(uuid,uuid,text,text,text,text,bytea,text,text,bytea,jsonb,bigint,bigint,text,text,text,bigint,bigint,boolean),spacetrader_efficient_checkpoint(uuid,uuid,text,text,text,text,bytea,text,text,bytea,bigint,bigint),spacetrader_archive_replace(uuid,uuid,bigint,bigint,text,jsonb,text,text,integer,bytea) FROM PUBLIC;
