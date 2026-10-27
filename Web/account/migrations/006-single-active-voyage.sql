-- One stable captain identity and one writable voyage per account.
-- Existing non-active voyages are preserved as read-only archives.
SET search_path=spacetrader,pg_catalog,pg_temp;
CREATE TABLE IF NOT EXISTS spacetrader_captains (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 account_id uuid NOT NULL UNIQUE REFERENCES spacetrader_accounts(id),
 created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO spacetrader_captains(account_id) SELECT id FROM spacetrader_accounts ON CONFLICT(account_id) DO NOTHING;
ALTER TABLE spacetrader_voyages ADD COLUMN IF NOT EXISTS captain_id uuid REFERENCES spacetrader_captains(id);
ALTER TABLE spacetrader_voyages ADD COLUMN IF NOT EXISTS archived_at timestamptz;
UPDATE spacetrader_voyages v SET captain_id=c.id FROM spacetrader_captains c WHERE c.account_id=v.account_id AND v.captain_id IS NULL;
ALTER TABLE spacetrader_voyages ALTER COLUMN captain_id SET NOT NULL;
UPDATE spacetrader_voyages v SET archived_at=v.updated_at FROM spacetrader_accounts a
 WHERE a.id=v.account_id AND a.active_voyage IS DISTINCT FROM v.id AND v.archived_at IS NULL
 AND (v.import_total IS NULL OR v.completed_at IS NOT NULL);
CREATE INDEX IF NOT EXISTS spacetrader_voyage_captain ON spacetrader_voyages(captain_id);

CREATE OR REPLACE FUNCTION spacetrader_captain_created() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
BEGIN INSERT INTO spacetrader_captains(account_id) VALUES(NEW.id) ON CONFLICT(account_id) DO NOTHING;RETURN NEW;END $$;
DROP TRIGGER IF EXISTS spacetrader_captain_created ON spacetrader_accounts;
CREATE TRIGGER spacetrader_captain_created AFTER INSERT ON spacetrader_accounts FOR EACH ROW EXECUTE FUNCTION spacetrader_captain_created();

CREATE OR REPLACE FUNCTION spacetrader_voyage_active_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE captain uuid; active uuid;
BEGIN
 SELECT c.id,a.active_voyage INTO captain,active FROM spacetrader_accounts a JOIN spacetrader_captains c ON c.account_id=a.id WHERE a.id=NEW.account_id;
 IF captain IS NULL THEN RAISE EXCEPTION 'captain_missing';END IF;
 IF TG_OP='INSERT' THEN
  IF NEW.captain_id IS NOT NULL AND NEW.captain_id<>captain THEN RAISE EXCEPTION 'captain_mismatch';END IF;
  NEW.captain_id=captain;
  IF NEW.import_total IS NOT NULL AND active IS NOT NULL THEN RAISE EXCEPTION 'active_voyage_exists';END IF;
 ELSE
  IF NEW.account_id<>OLD.account_id OR NEW.captain_id<>OLD.captain_id THEN RAISE EXCEPTION 'captain_mismatch';END IF;
  IF OLD.archived_at IS NOT NULL AND NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'voyage_archived';END IF;
  IF OLD.archived_at IS NULL AND NEW.archived_at IS NOT NULL THEN
   IF (to_jsonb(NEW)-'archived_at') IS DISTINCT FROM (to_jsonb(OLD)-'archived_at') THEN RAISE EXCEPTION 'invalid_archive';END IF;
  ELSIF active IS DISTINCT FROM OLD.id AND NOT(active IS NULL AND OLD.import_total IS NOT NULL AND OLD.completed_at IS NULL) THEN RAISE EXCEPTION 'voyage_archived';END IF;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS spacetrader_voyage_active_guard ON spacetrader_voyages;
CREATE TRIGGER spacetrader_voyage_active_guard BEFORE INSERT OR UPDATE ON spacetrader_voyages FOR EACH ROW EXECUTE FUNCTION spacetrader_voyage_active_guard();

CREATE OR REPLACE FUNCTION spacetrader_account_active_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE target spacetrader_voyages;
BEGIN
 IF OLD.active_voyage IS NOT DISTINCT FROM NEW.active_voyage THEN RETURN NEW;END IF;
 IF NEW.active_voyage IS NULL THEN RAISE EXCEPTION 'active_voyage_required';END IF;
 SELECT * INTO target FROM spacetrader_voyages WHERE id=NEW.active_voyage AND account_id=NEW.id;
 IF target.id IS NULL OR target.archived_at IS NOT NULL THEN RAISE EXCEPTION 'voyage_archived';END IF;
 IF OLD.active_voyage IS NOT NULL THEN UPDATE spacetrader_voyages SET archived_at=coalesce(archived_at,now()) WHERE id=OLD.active_voyage;END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS spacetrader_account_active_guard ON spacetrader_accounts;
CREATE TRIGGER spacetrader_account_active_guard BEFORE UPDATE OF active_voyage ON spacetrader_accounts FOR EACH ROW EXECUTE FUNCTION spacetrader_account_active_guard();

-- Pending guest imports legitimately stage slots before activation. The app blocks
-- imports into an account with an active voyage; the SQL guard also checks that.
CREATE OR REPLACE FUNCTION spacetrader_checkpoint_active_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE target uuid;active uuid;v spacetrader_voyages;
BEGIN
 IF TG_OP='DELETE' THEN target=OLD.voyage_id;ELSE target=NEW.voyage_id;END IF;
 SELECT * INTO v FROM spacetrader_voyages WHERE id=target;
 SELECT active_voyage INTO active FROM spacetrader_accounts WHERE id=v.account_id;
 IF v.id IS NULL OR v.archived_at IS NOT NULL OR(active IS DISTINCT FROM target AND NOT(active IS NULL AND v.import_total IS NOT NULL AND v.completed_at IS NULL)) THEN RAISE EXCEPTION 'voyage_archived';END IF;
 IF TG_OP='UPDATE' AND NEW.voyage_id<>OLD.voyage_id THEN RAISE EXCEPTION 'voyage_archived';END IF;
 IF TG_OP='DELETE' THEN RETURN OLD;ELSE RETURN NEW;END IF;
END $$;
DROP TRIGGER IF EXISTS spacetrader_checkpoint_active_guard ON spacetrader_checkpoints;
CREATE TRIGGER spacetrader_checkpoint_active_guard BEFORE INSERT OR UPDATE OR DELETE ON spacetrader_checkpoints FOR EACH ROW EXECUTE FUNCTION spacetrader_checkpoint_active_guard();
DROP TRIGGER IF EXISTS spacetrader_slot_active_guard ON spacetrader_snapshot_slots;
CREATE TRIGGER spacetrader_slot_active_guard BEFORE INSERT OR UPDATE OR DELETE ON spacetrader_snapshot_slots FOR EACH ROW EXECUTE FUNCTION spacetrader_checkpoint_active_guard();

CREATE OR REPLACE FUNCTION spacetrader_restart_voyage(
 owner_id uuid,expected uuid,parent text,op text,hash text,packed text,action jsonb,details jsonb,
 created bigint,max_account bigint,max_total bigint
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts;voyage spacetrader_voyages;old spacetrader_voyages;total bigint;additional bigint;
BEGIN
 SELECT bytes INTO total FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 IF total IS NULL THEN RAISE EXCEPTION 'storage_usage_missing';END IF;
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 IF account.id IS NULL THEN RAISE EXCEPTION 'account_missing';END IF;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE account_id=owner_id AND creation_key=op;
 IF voyage.id IS NOT NULL THEN
  IF voyage.id IS DISTINCT FROM account.active_voyage OR voyage.archived_at IS NOT NULL THEN RAISE EXCEPTION 'voyage_archived';END IF;
  RETURN jsonb_build_object('id',voyage.id,'captainId',voyage.captain_id,'replayed',true);
 END IF;
 IF account.active_voyage IS DISTINCT FROM expected THEN RAISE EXCEPTION 'restart_conflict';END IF;
 IF expected IS NOT NULL THEN
  SELECT * INTO old FROM spacetrader_voyages WHERE id=expected AND account_id=owner_id FOR UPDATE;
  IF old.id IS NULL OR old.archived_at IS NOT NULL OR old.revision IS DISTINCT FROM parent THEN RAISE EXCEPTION 'restart_conflict';END IF;
 ELSIF parent IS NOT NULL THEN RAISE EXCEPTION 'restart_conflict';END IF;
 IF max_account IS NULL OR max_total IS NULL OR max_account<2000000 OR max_total<max_account OR hash IS NULL OR action IS NULL OR details IS NULL OR created IS NULL OR op IS NULL OR length(op)<1 OR length(op)>100 OR hash!~'^[a-f0-9]{64}$' OR packed IS NULL OR octet_length(packed)>=4000000 OR action->>'id' IS DISTINCT FROM op OR action->>'type' IS DISTINCT FROM 'new-voyage' THEN RAISE EXCEPTION 'invalid_restart';END IF;
 additional=2*octet_length(packed)+octet_length(action::text)+octet_length(details::text)+512;
 IF account.stored_bytes+additional>max_account OR total+additional>max_total THEN RAISE EXCEPTION 'storage_limit';END IF;
 INSERT INTO spacetrader_voyages(account_id,sequence,revision,head_payload,head_digest,completed_at,creation_key)
 VALUES(owner_id,1,hash||':1',packed,hash,now(),op) RETURNING * INTO voyage;
 INSERT INTO spacetrader_entries(voyage_id,sequence,operation,digest,codec,payload,event,summary,created_ms) VALUES(voyage.id,1,op,hash,'full',packed,action,details,created);
 UPDATE spacetrader_accounts SET active_voyage=voyage.id,stored_bytes=stored_bytes+additional WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes+additional WHERE singleton;
 RETURN jsonb_build_object('id',voyage.id,'captainId',voyage.captain_id,'archived',expected,'replayed',false);
END $$;
-- Old clients may initialize an empty account, but cannot start an unconfirmed
-- replacement or reactivate an archive.
CREATE OR REPLACE FUNCTION spacetrader_create_voyage(owner_id uuid,op text,hash text,packed text,action jsonb,details jsonb,created bigint,max_account bigint,max_total bigint) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
BEGIN RETURN spacetrader_restart_voyage(owner_id,NULL,NULL,op,hash,packed,action,details,created,max_account,max_total);END $$;
CREATE OR REPLACE FUNCTION spacetrader_select_voyage(owner_id uuid,target uuid) RETURNS boolean LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
BEGIN RETURN EXISTS(SELECT 1 FROM spacetrader_accounts a JOIN spacetrader_voyages v ON v.id=a.active_voyage WHERE a.id=owner_id AND v.id=target AND v.archived_at IS NULL);END $$;
CREATE OR REPLACE FUNCTION spacetrader_finish_import_v2(owner_id uuid,target uuid) RETURNS boolean LANGUAGE plpgsql SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts;voyage spacetrader_voyages;
BEGIN
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO voyage FROM spacetrader_voyages WHERE id=target AND account_id=owner_id FOR UPDATE;
 IF voyage.id IS NULL OR voyage.import_total IS NULL OR voyage.archived_at IS NOT NULL THEN RETURN false;END IF;
 IF account.active_voyage=target THEN RETURN true;END IF;
 IF account.active_voyage IS NOT NULL OR voyage.completed_at IS NOT NULL OR voyage.sequence<>voyage.import_total OR voyage.head_digest<>voyage.import_digest THEN RETURN false;END IF;
 UPDATE spacetrader_voyages SET completed_at=now() WHERE id=target;
 UPDATE spacetrader_accounts SET active_voyage=target WHERE id=owner_id;
 RETURN true;
END $$;
REVOKE ALL ON spacetrader_captains FROM PUBLIC;
REVOKE ALL ON FUNCTION spacetrader_captain_created(),spacetrader_voyage_active_guard(),spacetrader_account_active_guard(),spacetrader_checkpoint_active_guard(),spacetrader_restart_voyage(uuid,uuid,text,text,text,text,jsonb,jsonb,bigint,bigint,bigint) FROM PUBLIC;
