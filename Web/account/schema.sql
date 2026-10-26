-- Isolated application tables; run only against the reviewed existing database.
CREATE SCHEMA IF NOT EXISTS spacetrader;
-- DDL must target the application schema; runtime/function lookup prefers builtins.
SET search_path=spacetrader,pg_catalog,pg_temp;
CREATE TABLE IF NOT EXISTS spacetrader_accounts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), identity text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now(), active_voyage uuid,
 stored_bytes bigint NOT NULL DEFAULT 0 CHECK(stored_bytes>=0)
);
CREATE TABLE IF NOT EXISTS spacetrader_sessions (
 hash text PRIMARY KEY, account_id uuid NOT NULL REFERENCES spacetrader_accounts(id),
 authenticated_at timestamptz NOT NULL, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS spacetrader_sessions_expiry ON spacetrader_sessions(expires_at);
CREATE TABLE IF NOT EXISTS spacetrader_challenges (
 hash text PRIMARY KEY, kind text NOT NULL CHECK(kind IN ('email','wallet')),
 identity text, code_hash text, attempts integer NOT NULL DEFAULT 0,
 expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS spacetrader_rate_limits (
 key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS spacetrader_challenges_expiry ON spacetrader_challenges(expires_at);
CREATE INDEX IF NOT EXISTS spacetrader_rate_limits_expiry ON spacetrader_rate_limits(expires_at);
CREATE TABLE IF NOT EXISTS spacetrader_storage_usage (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton), bytes bigint NOT NULL DEFAULT 0 CHECK(bytes>=0)
);
INSERT INTO spacetrader_storage_usage(singleton) VALUES(true) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS spacetrader_voyages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), account_id uuid NOT NULL REFERENCES spacetrader_accounts(id),
 sequence bigint NOT NULL DEFAULT 0, revision text, head_payload text, head_digest text,
 import_total bigint, import_digest text, import_source text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS spacetrader_voyages_account ON spacetrader_voyages(account_id);
CREATE UNIQUE INDEX IF NOT EXISTS spacetrader_import_source ON spacetrader_voyages(account_id,import_source) WHERE import_source IS NOT NULL;
CREATE TABLE IF NOT EXISTS spacetrader_entries (
 voyage_id uuid NOT NULL REFERENCES spacetrader_voyages(id), sequence bigint NOT NULL,
 operation text NOT NULL, digest text NOT NULL, codec text NOT NULL CHECK(codec IN ('full','delta','json')),
 payload text NOT NULL, event jsonb NOT NULL, summary jsonb NOT NULL,
 created_ms bigint NOT NULL, PRIMARY KEY(voyage_id,sequence), UNIQUE(voyage_id,operation)
);
CREATE TABLE IF NOT EXISTS spacetrader_checkpoints (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, voyage_id uuid NOT NULL REFERENCES spacetrader_voyages(id),
 slot text NOT NULL CHECK(slot IN ('slot1','slot2','slot3')), digest text, payload text,
 created_ms bigint NOT NULL, current boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX IF NOT EXISTS spacetrader_checkpoints_current ON spacetrader_checkpoints(voyage_id,slot) WHERE current;

-- One lock order for writes: aggregate usage, account, voyage. Compare-and-swap
-- and idempotency live in the same transaction as the durable resolved outcome.
CREATE OR REPLACE FUNCTION spacetrader_append(
 owner_id uuid, target uuid, parent text, op text, hash text, encoding text, packed text,
 head text, action jsonb, details jsonb, created bigint, max_account bigint, max_total bigint
) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts; voyage spacetrader_voyages; prior spacetrader_entries;
 additional bigint; total bigint; next_seq bigint;
BEGIN
 SELECT bytes INTO total FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 IF account.id IS NULL THEN RAISE EXCEPTION 'account_missing'; END IF;
 IF target IS NULL THEN
  IF account.active_voyage IS NULL THEN
   IF parent IS NOT NULL THEN RETURN jsonb_build_object('conflict',true); END IF;
   INSERT INTO spacetrader_voyages(account_id) VALUES(owner_id) RETURNING * INTO voyage;
   UPDATE spacetrader_accounts SET active_voyage=voyage.id WHERE id=owner_id;
  ELSE SELECT * INTO voyage FROM spacetrader_voyages WHERE id=account.active_voyage FOR UPDATE; END IF;
 ELSE SELECT * INTO voyage FROM spacetrader_voyages WHERE id=target AND account_id=owner_id FOR UPDATE; END IF;
 IF voyage.id IS NULL THEN RAISE EXCEPTION 'voyage_missing'; END IF;
 SELECT * INTO prior FROM spacetrader_entries WHERE voyage_id=voyage.id AND operation=op;
 IF prior.operation IS NOT NULL THEN
  IF prior.digest<>hash OR prior.event<>action THEN RAISE EXCEPTION 'operation_reused'; END IF;
  RETURN jsonb_build_object('replayed',true,'voyage',voyage.id);
 END IF;
 IF voyage.revision IS DISTINCT FROM parent THEN RETURN jsonb_build_object('conflict',true,'voyage',voyage.id); END IF;
 IF target IS NOT NULL AND (voyage.import_total IS NULL OR account.active_voyage=target) THEN RAISE EXCEPTION 'invalid_import'; END IF;
 IF target IS NOT NULL AND voyage.sequence>=voyage.import_total THEN RAISE EXCEPTION 'import_full'; END IF;
 additional=octet_length(packed)+octet_length(action::text)+octet_length(details::text)+256+octet_length(head)-coalesce(octet_length(voyage.head_payload),0);
 IF account.stored_bytes+additional>max_account OR total+additional>max_total THEN RAISE EXCEPTION 'storage_limit'; END IF;
 next_seq=voyage.sequence+1;
 INSERT INTO spacetrader_entries VALUES(voyage.id,next_seq,op,hash,encoding,packed,action,details,created);
 UPDATE spacetrader_voyages SET sequence=next_seq,revision=hash||':'||next_seq,head_payload=head,head_digest=hash,updated_at=now() WHERE id=voyage.id;
 UPDATE spacetrader_accounts SET stored_bytes=stored_bytes+additional WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes+additional WHERE singleton;
 RETURN jsonb_build_object('voyage',voyage.id,'sequence',next_seq);
END $$;

CREATE OR REPLACE FUNCTION spacetrader_checkpoint(
 owner_id uuid, parent text, slot_name text, expected_hash text, next_hash text, packed text,
 max_account bigint, max_total bigint, target uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts; voyage spacetrader_voyages; prior spacetrader_checkpoints; total bigint; additional bigint;
BEGIN
 SELECT bytes INTO total FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE id=coalesce(target,account.active_voyage) AND account_id=owner_id FOR UPDATE;
 IF target IS NOT NULL AND (voyage.import_total IS NULL OR (account.active_voyage IS NOT NULL AND account.active_voyage<>target)) THEN RAISE EXCEPTION 'invalid_import'; END IF;
 SELECT * INTO prior FROM spacetrader_checkpoints WHERE voyage_id=voyage.id AND slot=slot_name AND current FOR UPDATE;
 IF voyage.id IS NULL OR voyage.revision IS DISTINCT FROM parent OR prior.digest IS DISTINCT FROM expected_hash THEN RETURN jsonb_build_object('conflict',true); END IF;
 IF prior.digest IS NOT DISTINCT FROM next_hash THEN RETURN jsonb_build_object('unchanged',true); END IF;
 additional=coalesce(octet_length(packed),0)+256;
 IF account.stored_bytes+additional>max_account OR total+additional>max_total THEN RAISE EXCEPTION 'storage_limit'; END IF;
 UPDATE spacetrader_checkpoints SET current=false WHERE id=prior.id;
 INSERT INTO spacetrader_checkpoints(voyage_id,slot,digest,payload,created_ms) VALUES(voyage.id,slot_name,next_hash,packed,(extract(epoch FROM now())*1000)::bigint);
 UPDATE spacetrader_accounts SET stored_bytes=stored_bytes+additional WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes+additional WHERE singleton;
 RETURN jsonb_build_object('saved',true);
END $$;

CREATE OR REPLACE FUNCTION spacetrader_finish_import(owner_id uuid,target uuid) RETURNS boolean LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts; voyage spacetrader_voyages;
BEGIN
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE id=target AND account_id=owner_id FOR UPDATE;
 IF account.active_voyage=target THEN RETURN true; END IF;
 IF account.active_voyage IS NOT NULL OR voyage.id IS NULL OR voyage.sequence<>voyage.import_total OR voyage.head_digest<>voyage.import_digest THEN RETURN false; END IF;
 UPDATE spacetrader_accounts SET active_voyage=target WHERE id=owner_id;
 RETURN true;
END $$;

CREATE OR REPLACE FUNCTION spacetrader_start_import(owner_id uuid,source_key text,total_count bigint,head_hash text,max_account bigint,max_total bigint) RETURNS jsonb
LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts; voyage spacetrader_voyages; total bigint; pending integer;
BEGIN
 SELECT bytes INTO total FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 IF account.id IS NULL OR account.active_voyage IS NOT NULL THEN RAISE EXCEPTION 'active_voyage_exists'; END IF;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE account_id=owner_id AND import_source=source_key;
 IF voyage.id IS NOT NULL THEN
  IF voyage.import_total<>total_count OR voyage.import_digest<>head_hash THEN RAISE EXCEPTION 'import_changed'; END IF;
  RETURN jsonb_build_object('id',voyage.id,'sequence',voyage.sequence,'revision',voyage.revision);
 END IF;
 SELECT count(*) INTO pending FROM spacetrader_voyages WHERE account_id=owner_id AND import_source IS NOT NULL;
 IF pending>=3 THEN RAISE EXCEPTION 'transfer_limit'; END IF;
 IF account.stored_bytes+512>max_account OR total+512>max_total THEN RAISE EXCEPTION 'storage_limit'; END IF;
 INSERT INTO spacetrader_voyages(account_id,import_total,import_digest,import_source) VALUES(owner_id,total_count,head_hash,source_key) RETURNING * INTO voyage;
 UPDATE spacetrader_accounts SET stored_bytes=stored_bytes+512 WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes+512 WHERE singleton;
 RETURN jsonb_build_object('id',voyage.id,'sequence',voyage.sequence,'revision',voyage.revision);
END $$;

CREATE OR REPLACE FUNCTION spacetrader_history_immutable() RETURNS trigger LANGUAGE plpgsql
SET search_path=pg_catalog,spacetrader,pg_temp AS $$ BEGIN RAISE EXCEPTION 'Action history is append-only'; END $$;
DROP TRIGGER IF EXISTS spacetrader_entries_immutable ON spacetrader_entries;
CREATE TRIGGER spacetrader_entries_immutable BEFORE UPDATE OR DELETE ON spacetrader_entries FOR EACH ROW EXECUTE FUNCTION spacetrader_history_immutable();

CREATE OR REPLACE FUNCTION spacetrader_account_session(actor text,session_hash text,auth_ms bigint,max_accounts integer) RETURNS void
LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts; count_accounts bigint;
BEGIN
 PERFORM bytes FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO account FROM spacetrader_accounts WHERE identity=actor FOR UPDATE;
 IF account.id IS NULL THEN
  SELECT count(*) INTO count_accounts FROM spacetrader_accounts;
  IF max_accounts<1 OR count_accounts>=max_accounts THEN RAISE EXCEPTION 'account_capacity'; END IF;
  INSERT INTO spacetrader_accounts(identity) VALUES(actor) RETURNING * INTO account;
 END IF;
 INSERT INTO spacetrader_sessions(hash,account_id,authenticated_at,expires_at) VALUES(session_hash,account.id,to_timestamp(auth_ms/1000.0),to_timestamp((auth_ms+604800000)/1000.0));
 DELETE FROM spacetrader_sessions WHERE hash IN(SELECT hash FROM spacetrader_sessions WHERE account_id=account.id ORDER BY created_at DESC,hash LIMIT ALL OFFSET 10);
END $$;
REVOKE ALL ON SCHEMA spacetrader FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA spacetrader FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA spacetrader FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA spacetrader FROM PUBLIC;
-- The service owner grants only the reviewed runtime role's necessary privileges.
