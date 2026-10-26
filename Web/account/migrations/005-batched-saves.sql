-- One current head per ordered batch; every action still has its own journal row.
SET search_path=spacetrader,pg_catalog,pg_temp;
ALTER TABLE spacetrader_voyages ADD COLUMN IF NOT EXISTS batch_receipt jsonb;
CREATE OR REPLACE FUNCTION spacetrader_batch_append(
 owner_id uuid,target uuid,parent text,batch_op text,batch_hash text,event_count integer,
 head_hash text,core bytea,component text,component_prefix text,component_payload bytea,
 details jsonb,chunks jsonb,last_op text,last_event_hash text,max_account bigint,max_total bigint
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts;voyage spacetrader_voyages;prior spacetrader_journal_chunks;item jsonb;
 total bigint;additional bigint:=0;part_bytes bigint:=0;old_bytes bigint:=0;first_seq bigint;last_seq bigint;cursor_seq bigint;count_chunks integer:=0;
 receipt jsonb;packed text;found_first bigint;found_last bigint;found_hash text;found_parent text;
BEGIN
 IF event_count IS NULL OR batch_op IS NULL OR batch_hash IS NULL OR head_hash IS NULL OR last_op IS NULL OR last_event_hash IS NULL OR max_account IS NULL OR max_total IS NULL OR chunks IS NULL OR details IS NULL OR parent IS NULL OR event_count NOT BETWEEN 1 AND 32 OR batch_op !~ '^[A-Za-z0-9_-]{1,100}$' OR batch_hash !~ '^[a-f0-9]{64}$'
 OR head_hash !~ '^[a-f0-9]{64}$' OR last_op !~ '^[A-Za-z0-9_-]{1,100}$' OR last_event_hash !~ '^[a-f0-9]{64}$'
 OR core IS NULL OR octet_length(core)>=2000000 OR jsonb_typeof(chunks)<>'array' OR jsonb_array_length(chunks) NOT BETWEEN 1 AND 33
 OR jsonb_typeof(details)<>'object' OR octet_length(chunks::text)>16777216 OR octet_length(details::text)>16384 OR max_account<2000000 OR max_total<max_account
 THEN RAISE EXCEPTION 'invalid_batch';END IF;
 SELECT bytes INTO total FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 IF total IS NULL THEN RAISE EXCEPTION 'storage_unavailable';END IF;
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE id=target AND account_id=owner_id FOR UPDATE;
 IF account.id IS NULL OR voyage.id IS NULL OR (voyage.import_total IS NOT NULL AND voyage.completed_at IS NULL AND account.active_voyage IS DISTINCT FROM target) THEN RAISE EXCEPTION 'voyage_missing';END IF;
 IF voyage.batch_receipt->>'id'=batch_op THEN
  IF voyage.batch_receipt->>'digest'<>batch_hash THEN RAISE EXCEPTION 'operation_reused';END IF;
  RETURN voyage.batch_receipt||jsonb_build_object('replayed',true);
 END IF;
 IF voyage.revision IS DISTINCT FROM parent THEN RETURN jsonb_build_object('conflict',true);END IF;
 IF component IS NULL AND component_payload IS NOT NULL OR component IS NOT NULL AND (component !~ '^[a-f0-9]{64}$' OR component_prefix NOT IN ('','R1:','D1:','S') OR component_payload IS NOT NULL AND octet_length(component_payload)>=2000000) THEN RAISE EXCEPTION 'invalid_component';END IF;
 IF component IS NOT NULL THEN
  IF NOT EXISTS(SELECT 1 FROM spacetrader_world_components WHERE voyage_id=target AND digest=component) THEN
   IF component_payload IS NULL THEN RAISE EXCEPTION 'component_missing';END IF;
   part_bytes=octet_length(component_payload)+256;
  ELSIF component_payload IS NOT NULL AND NOT EXISTS(SELECT 1 FROM spacetrader_world_components WHERE voyage_id=target AND digest=component AND prefix=component_prefix AND payload=component_payload) THEN RAISE EXCEPTION 'component_mismatch';END IF;
 END IF;
 IF voyage.efficient_component IS NOT NULL AND voyage.efficient_component IS DISTINCT FROM component AND NOT EXISTS(SELECT 1 FROM spacetrader_snapshot_slots WHERE voyage_id=target AND efficient_component=voyage.efficient_component) THEN
  SELECT coalesce(octet_length(payload)+256,0) INTO old_bytes FROM spacetrader_world_components WHERE voyage_id=target AND digest=voyage.efficient_component;
 END IF;
 first_seq=voyage.sequence+1;last_seq=voyage.sequence+event_count;cursor_seq=voyage.sequence;
 FOR item IN SELECT value FROM jsonb_array_elements(chunks) LOOP
  found_first=(item->>'first')::bigint;found_last=(item->>'last')::bigint;found_hash=item->>'hash';found_parent=item->>'previous';packed=item->>'payload';
  IF jsonb_typeof(item)<>'object' OR found_first IS NULL OR found_last IS NULL OR found_hash IS NULL OR found_first<1 OR found_last<found_first OR found_last>=found_first+128 OR found_last<=cursor_seq OR found_last>last_seq OR found_hash !~ '^[a-f0-9]{64}$' OR packed IS NULL OR octet_length(packed)>=2000000 THEN RAISE EXCEPTION 'journal_sequence';END IF;
  SELECT * INTO prior FROM spacetrader_journal_chunks WHERE voyage_id=target AND first_sequence=found_first FOR UPDATE;
  IF count_chunks=0 AND found_first<=voyage.sequence THEN
   IF prior.voyage_id IS NULL OR prior.last_sequence<>voyage.sequence OR prior.digest IS DISTINCT FROM found_parent THEN RETURN jsonb_build_object('conflict',true);END IF;
  ELSIF found_first<>cursor_seq+1 OR prior.voyage_id IS NOT NULL OR found_parent IS NOT NULL THEN RAISE EXCEPTION 'journal_sequence';END IF;
  additional=additional+octet_length(packed)-coalesce(octet_length(prior.payload),0)+CASE WHEN prior.voyage_id IS NULL THEN 256 ELSE 0 END;
  cursor_seq=found_last;count_chunks=count_chunks+1;
 END LOOP;
 IF cursor_seq<>last_seq THEN RAISE EXCEPTION 'journal_sequence';END IF;
 receipt=jsonb_build_object('id',batch_op,'digest',batch_hash,'first',first_seq,'sequence',last_seq,'revision',head_hash||':'||last_seq,'rawDigest',head_hash,'voyage',target);
 additional=additional+octet_length(core)-coalesce(octet_length(voyage.efficient_core),0)+part_bytes-coalesce(old_bytes,0)
 +octet_length('E1')-coalesce(octet_length(voyage.head_payload),0)+octet_length(details::text)-coalesce(octet_length(voyage.compact_summary::text),0)
 +CASE WHEN voyage.compact_start IS NULL THEN 256 ELSE 0 END+octet_length(receipt::text)-coalesce(octet_length(voyage.batch_receipt::text),0);
 IF account.stored_bytes+additional>max_account OR total+additional>max_total THEN RAISE EXCEPTION 'storage_limit';END IF;
 IF part_bytes>0 THEN INSERT INTO spacetrader_world_components VALUES(target,component,component_prefix,component_payload);END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(chunks) LOOP
  INSERT INTO spacetrader_journal_chunks(voyage_id,first_sequence,last_sequence,digest,payload) VALUES(target,(item->>'first')::bigint,(item->>'last')::bigint,item->>'hash',item->>'payload')
  ON CONFLICT(voyage_id,first_sequence) DO UPDATE SET last_sequence=excluded.last_sequence,digest=excluded.digest,payload=excluded.payload;
 END LOOP;
 UPDATE spacetrader_voyages SET sequence=last_seq,revision=head_hash||':'||last_seq,head_digest=head_hash,head_payload='E1',efficient_core=core,efficient_component=component,
 compact_start=coalesce(compact_start,first_seq),compact_summary=details,compact_operation=last_op,compact_action_digest=last_event_hash,batch_receipt=receipt,updated_at=now() WHERE id=target;
 UPDATE spacetrader_accounts SET stored_bytes=stored_bytes+additional WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes+additional WHERE singleton;
 DELETE FROM spacetrader_world_components c WHERE c.voyage_id=target AND c.digest IS DISTINCT FROM component AND NOT EXISTS(SELECT 1 FROM spacetrader_snapshot_slots s WHERE s.voyage_id=target AND s.efficient_component=c.digest);
 RETURN receipt;
END $$;
REVOKE ALL ON FUNCTION spacetrader_batch_append(uuid,uuid,text,text,text,integer,text,bytea,text,text,bytea,jsonb,jsonb,text,text,bigint,bigint) FROM PUBLIC;
