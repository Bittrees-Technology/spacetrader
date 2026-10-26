-- Additive rollout: existing single-voyage functions remain unchanged until
-- all browser clients use explicit voyage IDs. No saves/history are deleted.
SET search_path=spacetrader,pg_catalog,pg_temp;
ALTER TABLE spacetrader_voyages ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE spacetrader_voyages ADD COLUMN IF NOT EXISTS creation_key text;
CREATE UNIQUE INDEX IF NOT EXISTS spacetrader_voyage_creation ON spacetrader_voyages(account_id,creation_key) WHERE creation_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS spacetrader_voyage_library ON spacetrader_voyages(account_id,created_at DESC,id DESC);
UPDATE spacetrader_voyages v SET completed_at=v.updated_at FROM spacetrader_accounts a
 WHERE a.active_voyage=v.id AND v.completed_at IS NULL AND v.import_total IS NOT NULL
 AND v.sequence>=v.import_total AND (v.sequence>v.import_total OR v.head_digest=v.import_digest);

CREATE OR REPLACE FUNCTION spacetrader_create_voyage(
 owner_id uuid, op text, hash text, packed text, action jsonb, details jsonb,
 created bigint, max_account bigint, max_total bigint
) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts; voyage spacetrader_voyages; total bigint; additional bigint;
BEGIN
 SELECT bytes INTO total FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 IF account.id IS NULL THEN RAISE EXCEPTION 'account_missing'; END IF;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE account_id=owner_id AND creation_key=op;
 IF voyage.id IS NOT NULL THEN RETURN jsonb_build_object('id',voyage.id,'replayed',true); END IF;
 additional=2*octet_length(packed)+octet_length(action::text)+octet_length(details::text)+512;
 IF account.stored_bytes+additional>max_account OR total+additional>max_total THEN RAISE EXCEPTION 'storage_limit'; END IF;
 UPDATE spacetrader_voyages SET completed_at=updated_at WHERE id=account.active_voyage AND import_total IS NOT NULL AND completed_at IS NULL AND sequence>=import_total AND (sequence>import_total OR head_digest=import_digest);
 INSERT INTO spacetrader_voyages(account_id,sequence,revision,head_payload,head_digest,completed_at,creation_key)
 VALUES(owner_id,1,hash||':1',packed,hash,now(),op) RETURNING * INTO voyage;
 INSERT INTO spacetrader_entries VALUES(voyage.id,1,op,hash,'full',packed,action,details,created);
 UPDATE spacetrader_accounts SET active_voyage=voyage.id,stored_bytes=stored_bytes+additional WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes+additional WHERE singleton;
 RETURN jsonb_build_object('id',voyage.id,'replayed',false);
END $$;

CREATE OR REPLACE FUNCTION spacetrader_append_v2(
 owner_id uuid, target uuid, parent text, op text, hash text, encoding text, packed text,
 head text, action jsonb, details jsonb, created bigint, max_account bigint, max_total bigint,
 importing boolean
) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts; voyage spacetrader_voyages; prior spacetrader_entries;
 additional bigint; total bigint; next_seq bigint;
BEGIN
 SELECT bytes INTO total FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE id=target AND account_id=owner_id FOR UPDATE;
 IF account.id IS NULL OR voyage.id IS NULL THEN RAISE EXCEPTION 'voyage_missing'; END IF;
 IF NOT importing AND voyage.import_total IS NOT NULL AND voyage.completed_at IS NULL AND account.active_voyage IS DISTINCT FROM target THEN RAISE EXCEPTION 'invalid_import'; END IF;
 SELECT * INTO prior FROM spacetrader_entries WHERE voyage_id=target AND operation=op;
 IF prior.operation IS NOT NULL THEN
  IF prior.digest<>hash OR prior.event<>action THEN RAISE EXCEPTION 'operation_reused'; END IF;
  RETURN jsonb_build_object('replayed',true,'voyage',target);
 END IF;
 IF voyage.revision IS DISTINCT FROM parent THEN RETURN jsonb_build_object('conflict',true,'voyage',target); END IF;
 IF importing AND (voyage.import_total IS NULL OR voyage.completed_at IS NOT NULL OR account.active_voyage=target) THEN RAISE EXCEPTION 'invalid_import'; END IF;
 IF importing AND voyage.sequence>=voyage.import_total THEN RAISE EXCEPTION 'import_full'; END IF;
 additional=octet_length(packed)+octet_length(action::text)+octet_length(details::text)+256+octet_length(head)-coalesce(octet_length(voyage.head_payload),0);
 IF account.stored_bytes+additional>max_account OR total+additional>max_total THEN RAISE EXCEPTION 'storage_limit'; END IF;
 next_seq=voyage.sequence+1;
 INSERT INTO spacetrader_entries VALUES(target,next_seq,op,hash,encoding,packed,action,details,created);
 UPDATE spacetrader_voyages SET sequence=next_seq,revision=hash||':'||next_seq,head_payload=head,head_digest=hash,updated_at=now() WHERE id=target;
 UPDATE spacetrader_accounts SET stored_bytes=stored_bytes+additional WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes+additional WHERE singleton;
 RETURN jsonb_build_object('voyage',target,'sequence',next_seq);
END $$;

CREATE OR REPLACE FUNCTION spacetrader_checkpoint_v2(
 owner_id uuid,parent text,slot_name text,expected_hash text,next_hash text,packed text,
 max_account bigint,max_total bigint,target uuid,importing boolean
) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts; voyage spacetrader_voyages; prior spacetrader_checkpoints; total bigint; additional bigint;
BEGIN
 SELECT bytes INTO total FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE id=target AND account_id=owner_id FOR UPDATE;
 IF voyage.id IS NULL THEN RAISE EXCEPTION 'voyage_missing'; END IF;
 IF importing AND (voyage.import_total IS NULL OR voyage.completed_at IS NOT NULL OR account.active_voyage=target) THEN RAISE EXCEPTION 'invalid_import'; END IF;
 IF NOT importing AND voyage.import_total IS NOT NULL AND voyage.completed_at IS NULL AND account.active_voyage IS DISTINCT FROM target THEN RAISE EXCEPTION 'invalid_import'; END IF;
 SELECT * INTO prior FROM spacetrader_checkpoints WHERE voyage_id=target AND slot=slot_name AND current FOR UPDATE;
 IF voyage.revision IS DISTINCT FROM parent OR prior.digest IS DISTINCT FROM expected_hash THEN RETURN jsonb_build_object('conflict',true); END IF;
 IF prior.digest IS NOT DISTINCT FROM next_hash THEN RETURN jsonb_build_object('unchanged',true); END IF;
 additional=coalesce(octet_length(packed),0)+256;
 IF account.stored_bytes+additional>max_account OR total+additional>max_total THEN RAISE EXCEPTION 'storage_limit'; END IF;
 UPDATE spacetrader_checkpoints SET current=false WHERE id=prior.id;
 INSERT INTO spacetrader_checkpoints(voyage_id,slot,digest,payload,created_ms) VALUES(target,slot_name,next_hash,packed,(extract(epoch FROM now())*1000)::bigint);
 UPDATE spacetrader_accounts SET stored_bytes=stored_bytes+additional WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes+additional WHERE singleton;
 RETURN jsonb_build_object('saved',true);
END $$;

CREATE OR REPLACE FUNCTION spacetrader_start_import_v2(owner_id uuid,source_key text,total_count bigint,head_hash text,max_account bigint,max_total bigint) RETURNS jsonb
LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts; voyage spacetrader_voyages; total bigint; pending integer;
BEGIN
 SELECT bytes INTO total FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 IF account.id IS NULL THEN RAISE EXCEPTION 'account_missing'; END IF;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE account_id=owner_id AND import_source=source_key;
 IF voyage.id IS NOT NULL THEN
  IF voyage.import_total<>total_count OR voyage.import_digest<>head_hash THEN RAISE EXCEPTION 'import_changed'; END IF;
  RETURN jsonb_build_object('id',voyage.id,'sequence',voyage.sequence,'revision',voyage.revision,'complete',voyage.completed_at IS NOT NULL OR account.active_voyage=voyage.id);
 END IF;
 SELECT count(*) INTO pending FROM spacetrader_voyages WHERE account_id=owner_id AND import_total IS NOT NULL AND completed_at IS NULL AND id IS DISTINCT FROM account.active_voyage;
 IF pending>=3 THEN RAISE EXCEPTION 'transfer_limit'; END IF;
 IF account.stored_bytes+512>max_account OR total+512>max_total THEN RAISE EXCEPTION 'storage_limit'; END IF;
 INSERT INTO spacetrader_voyages(account_id,import_total,import_digest,import_source) VALUES(owner_id,total_count,head_hash,source_key) RETURNING * INTO voyage;
 UPDATE spacetrader_accounts SET stored_bytes=stored_bytes+512 WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes+512 WHERE singleton;
 RETURN jsonb_build_object('id',voyage.id,'sequence',voyage.sequence,'revision',voyage.revision,'complete',false);
END $$;

CREATE OR REPLACE FUNCTION spacetrader_finish_import_v2(owner_id uuid,target uuid) RETURNS boolean LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts; voyage spacetrader_voyages;
BEGIN
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE id=target AND account_id=owner_id FOR UPDATE;
 IF voyage.id IS NULL OR voyage.import_total IS NULL THEN RETURN false; END IF;
 IF voyage.completed_at IS NOT NULL THEN RETURN true; END IF;
 IF voyage.sequence<>voyage.import_total OR voyage.head_digest<>voyage.import_digest THEN RETURN false; END IF;
 UPDATE spacetrader_voyages SET completed_at=updated_at WHERE id=account.active_voyage AND import_total IS NOT NULL AND completed_at IS NULL AND sequence>=import_total AND (sequence>import_total OR head_digest=import_digest);
 UPDATE spacetrader_voyages SET completed_at=coalesce(completed_at,now()) WHERE id=target;
 UPDATE spacetrader_accounts SET active_voyage=target WHERE id=owner_id;
 RETURN true;
END $$;

CREATE OR REPLACE FUNCTION spacetrader_select_voyage(owner_id uuid,target uuid) RETURNS boolean LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts; voyage spacetrader_voyages;
BEGIN
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE id=target AND account_id=owner_id FOR UPDATE;
 IF voyage.id IS NULL OR voyage.sequence<1 OR (voyage.import_total IS NOT NULL AND voyage.completed_at IS NULL AND account.active_voyage IS DISTINCT FROM target) THEN RETURN false; END IF;
 UPDATE spacetrader_voyages SET completed_at=updated_at WHERE id=account.active_voyage AND import_total IS NOT NULL AND completed_at IS NULL AND sequence>=import_total AND (sequence>import_total OR head_digest=import_digest);
 UPDATE spacetrader_accounts SET active_voyage=target WHERE id=owner_id;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION spacetrader_create_voyage(uuid,text,text,text,jsonb,jsonb,bigint,bigint,bigint),spacetrader_append_v2(uuid,uuid,text,text,text,text,text,text,jsonb,jsonb,bigint,bigint,bigint,boolean),spacetrader_checkpoint_v2(uuid,text,text,text,text,text,bigint,bigint,uuid,boolean),spacetrader_start_import_v2(uuid,text,bigint,text,bigint,bigint),spacetrader_finish_import_v2(uuid,uuid),spacetrader_select_voyage(uuid,uuid) FROM PUBLIC;
