-- App-local verified sign-in aliases. This does not merge Roles profiles or grants.
SET search_path=spacetrader,pg_catalog,pg_temp;
ALTER TABLE spacetrader_accounts ADD COLUMN IF NOT EXISTS merged_into uuid REFERENCES spacetrader_accounts(id);
ALTER TABLE spacetrader_sessions ADD COLUMN IF NOT EXISTS login_identity text;
UPDATE spacetrader_sessions s SET login_identity=a.identity FROM spacetrader_accounts a WHERE a.id=s.account_id AND s.login_identity IS NULL;
CREATE TABLE IF NOT EXISTS spacetrader_identities(
 identity text PRIMARY KEY,account_id uuid NOT NULL REFERENCES spacetrader_accounts(id),
 kind text NOT NULL CHECK(kind IN('email','wallet')),verified_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(account_id,kind),CHECK((kind='wallet' AND identity~'^0x[0-9a-f]{40}$') OR(kind='email' AND position('@' in identity)>1))
);
INSERT INTO spacetrader_identities(identity,account_id,kind) SELECT identity,id,CASE WHEN identity ~'^0x[0-9a-f]{40}$' THEN 'wallet' ELSE 'email' END FROM spacetrader_accounts WHERE merged_into IS NULL ON CONFLICT(identity) DO NOTHING;
CREATE OR REPLACE FUNCTION spacetrader_identity_created() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
BEGIN INSERT INTO spacetrader_identities(identity,account_id,kind) VALUES(NEW.identity,NEW.id,CASE WHEN NEW.identity ~'^0x[0-9a-f]{40}$' THEN 'wallet' ELSE 'email' END);RETURN NEW;END $$;
DROP TRIGGER IF EXISTS spacetrader_identity_created ON spacetrader_accounts;
CREATE TRIGGER spacetrader_identity_created AFTER INSERT ON spacetrader_accounts FOR EACH ROW EXECUTE FUNCTION spacetrader_identity_created();
CREATE TABLE IF NOT EXISTS spacetrader_link_challenges(
 hash text PRIMARY KEY,session_hash text NOT NULL,account_id uuid NOT NULL REFERENCES spacetrader_accounts(id),
 source_identity text NOT NULL,target text NOT NULL,nonce text NOT NULL,code_hash text,
 attempts integer NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 5),expires_at timestamptz NOT NULL,
 source_authenticated_at timestamptz NOT NULL,verified_at timestamptz,preview jsonb,result jsonb,
 UNIQUE(session_hash,target)
);
CREATE INDEX IF NOT EXISTS spacetrader_link_expiry ON spacetrader_link_challenges(expires_at);
CREATE OR REPLACE FUNCTION spacetrader_account_session(actor text,session_hash text,auth_ms bigint,max_accounts integer) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts;count_accounts bigint;
BEGIN
 PERFORM bytes FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT a.* INTO account FROM spacetrader_accounts a JOIN spacetrader_identities i ON i.account_id=a.id WHERE i.identity=actor FOR UPDATE OF a;
 IF account.id IS NULL THEN
  SELECT count(*) INTO count_accounts FROM spacetrader_accounts WHERE merged_into IS NULL;
  IF max_accounts<1 OR count_accounts>=max_accounts THEN RAISE EXCEPTION 'account_capacity';END IF;
  INSERT INTO spacetrader_accounts(identity) VALUES(actor) RETURNING * INTO account;
 END IF;
 IF account.merged_into IS NOT NULL THEN RAISE EXCEPTION 'account_merged';END IF;
 INSERT INTO spacetrader_sessions(hash,account_id,authenticated_at,expires_at,login_identity) VALUES(session_hash,account.id,to_timestamp(auth_ms/1000.0),to_timestamp((auth_ms+604800000)/1000.0),actor);
 DELETE FROM spacetrader_sessions WHERE hash IN(SELECT hash FROM spacetrader_sessions WHERE account_id=account.id ORDER BY created_at DESC,hash LIMIT ALL OFFSET 10);
END $$;
-- A merged account is retained only as an ownership record for older archives.
CREATE OR REPLACE FUNCTION spacetrader_account_active_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE target spacetrader_voyages;
BEGIN
 IF OLD.merged_into IS NOT NULL AND NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'account_merged';END IF;
 IF NEW.merged_into IS NOT NULL THEN
  IF NEW.merged_into=NEW.id OR NEW.active_voyage IS NOT NULL OR NOT EXISTS(SELECT 1 FROM spacetrader_accounts WHERE id=NEW.merged_into AND merged_into IS NULL) OR EXISTS(SELECT 1 FROM spacetrader_voyages WHERE id=OLD.active_voyage) THEN RAISE EXCEPTION 'invalid_account_merge';END IF;
  RETURN NEW;
 END IF;
 IF OLD.active_voyage IS NOT DISTINCT FROM NEW.active_voyage THEN RETURN NEW;END IF;
 IF NEW.active_voyage IS NULL THEN RAISE EXCEPTION 'active_voyage_required';END IF;
 SELECT * INTO target FROM spacetrader_voyages WHERE id=NEW.active_voyage AND account_id=NEW.id;
 IF target.id IS NULL OR target.archived_at IS NOT NULL THEN RAISE EXCEPTION 'voyage_archived';END IF;
 IF OLD.active_voyage IS NOT NULL THEN UPDATE spacetrader_voyages SET archived_at=coalesce(archived_at,now()) WHERE id=OLD.active_voyage;END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS spacetrader_account_active_guard ON spacetrader_accounts;
CREATE TRIGGER spacetrader_account_active_guard BEFORE UPDATE ON spacetrader_accounts FOR EACH ROW EXECUTE FUNCTION spacetrader_account_active_guard();
CREATE OR REPLACE FUNCTION spacetrader_checkpoint_active_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE target uuid;active uuid;owner_id uuid;merged uuid;v spacetrader_voyages;
BEGIN
 IF TG_OP='DELETE' THEN target=OLD.voyage_id;ELSE target=NEW.voyage_id;END IF;
 PERFORM 1 FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT account_id INTO owner_id FROM spacetrader_voyages WHERE id=target;
 SELECT active_voyage,merged_into INTO active,merged FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO v FROM spacetrader_voyages WHERE id=target FOR UPDATE;
 IF merged IS NOT NULL OR v.id IS NULL OR v.archived_at IS NOT NULL OR(active IS DISTINCT FROM target AND NOT(active IS NULL AND v.import_total IS NOT NULL AND v.completed_at IS NULL)) THEN RAISE EXCEPTION 'voyage_archived';END IF;
 IF TG_OP='UPDATE' AND NEW.voyage_id<>OLD.voyage_id THEN RAISE EXCEPTION 'voyage_archived';END IF;
 IF TG_OP='DELETE' THEN RETURN OLD;ELSE RETURN NEW;END IF;
END $$;
CREATE OR REPLACE FUNCTION spacetrader_merged_voyage_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
BEGIN IF EXISTS(SELECT 1 FROM spacetrader_accounts WHERE id=NEW.account_id AND merged_into IS NOT NULL) THEN RAISE EXCEPTION 'account_merged';END IF;RETURN NEW;END $$;
DROP TRIGGER IF EXISTS spacetrader_merged_voyage_guard ON spacetrader_voyages;
CREATE TRIGGER spacetrader_merged_voyage_guard BEFORE INSERT OR UPDATE ON spacetrader_voyages FOR EACH ROW EXECUTE FUNCTION spacetrader_merged_voyage_guard();
-- Same charged-byte model used by existing append, checkpoint and compression RPCs.
CREATE OR REPLACE FUNCTION spacetrader_voyage_bytes(target uuid) RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
 SELECT coalesce((SELECT coalesce(octet_length(v.head_payload),0)+coalesce(octet_length(v.efficient_core),0)+coalesce(octet_length(v.compact_summary::text),0)+coalesce(octet_length(v.batch_receipt::text),0)+CASE WHEN v.compact_start IS NULL THEN 0 ELSE 256 END+CASE WHEN v.creation_key IS NOT NULL THEN 256 WHEN v.import_total IS NOT NULL THEN 512 ELSE 0 END FROM spacetrader_voyages v WHERE v.id=target),0)
 +coalesce((SELECT sum(octet_length(payload)+octet_length(event::text)+octet_length(summary::text)+256) FROM spacetrader_entries WHERE voyage_id=target),0)
 +coalesce((SELECT sum(octet_length(payload)+256) FROM spacetrader_journal_chunks WHERE voyage_id=target),0)
 +coalesce((SELECT sum(octet_length(payload)+256) FROM spacetrader_journal_archives WHERE voyage_id=target),0)
 +coalesce((SELECT sum(octet_length(payload)+256) FROM spacetrader_world_components WHERE voyage_id=target),0)
 +coalesce((SELECT sum(coalesce(octet_length(payload),0)+coalesce(octet_length(efficient_core),0)+256) FROM spacetrader_snapshot_slots WHERE voyage_id=target),0)
 +coalesce((SELECT sum(coalesce(octet_length(payload),0)+256) FROM spacetrader_checkpoints WHERE voyage_id=target),0)
$$;
-- Owner-only, transaction-scoped deletion witness. Ordinary journal writes remain append-only.
CREATE TABLE IF NOT EXISTS spacetrader_link_deletions(voyage_id uuid PRIMARY KEY,transaction_id bigint NOT NULL);
REVOKE ALL ON spacetrader_link_deletions FROM PUBLIC;
CREATE OR REPLACE FUNCTION spacetrader_history_immutable() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
BEGIN
 IF TG_OP='DELETE' AND EXISTS(SELECT 1 FROM spacetrader_link_deletions WHERE voyage_id=OLD.voyage_id AND transaction_id=txid_current()) THEN RETURN OLD;END IF;
 RAISE EXCEPTION 'Action history is append-only';
END $$;
CREATE OR REPLACE FUNCTION spacetrader_link_state(owner_id uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
 SELECT jsonb_build_object('account',a.id,'identity',a.identity,'captainId',c.id,'voyage',a.active_voyage,'revision',v.revision,'storedBytes',a.stored_bytes,'archives',(SELECT count(*) FROM spacetrader_voyages x JOIN spacetrader_accounts y ON y.id=x.account_id WHERE(y.id=a.id OR y.merged_into=a.id) AND x.id IS DISTINCT FROM a.active_voyage AND(x.import_total IS NULL OR x.completed_at IS NOT NULL)),'name',CASE WHEN coalesce(v.compact_summary,e.summary)->>'created'='false' THEN 'New captain' ELSE coalesce(coalesce(v.compact_summary,e.summary)->>'name','No saved voyage') END,'day',coalesce(v.compact_summary,e.summary)->'day','location',coalesce(v.compact_summary,e.summary)->>'location','sequence',v.sequence)
 FROM spacetrader_accounts a JOIN spacetrader_captains c ON c.account_id=a.id LEFT JOIN spacetrader_voyages v ON v.id=a.active_voyage LEFT JOIN spacetrader_entries e ON e.voyage_id=v.id AND e.sequence=v.sequence WHERE a.id=owner_id AND a.merged_into IS NULL
$$;
CREATE OR REPLACE FUNCTION spacetrader_link_review(challenge text,session_key text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE c spacetrader_link_challenges;s spacetrader_sessions;other_id uuid;review jsonb;
BEGIN
 PERFORM 1 FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO c FROM spacetrader_link_challenges WHERE hash=challenge AND session_hash=session_key AND expires_at>now() FOR UPDATE;
 SELECT * INTO s FROM spacetrader_sessions WHERE hash=session_key AND expires_at>now();
 IF c.hash IS NULL OR c.verified_at IS NULL OR c.result IS NOT NULL OR s.account_id IS DISTINCT FROM c.account_id OR s.login_identity IS DISTINCT FROM c.source_identity OR s.authenticated_at<now()-interval '10 minutes' THEN RAISE EXCEPTION 'link_proof_required';END IF;
 SELECT account_id INTO other_id FROM spacetrader_identities WHERE identity=c.target;
 IF other_id=c.account_id THEN RETURN jsonb_build_object('alreadyLinked',true);END IF;
 IF EXISTS(SELECT 1 FROM spacetrader_identities WHERE account_id=c.account_id AND kind=CASE WHEN c.target ~'^0x[0-9a-f]{40}$' THEN 'wallet' ELSE 'email' END) OR (other_id IS NOT NULL AND (SELECT count(*) FROM spacetrader_identities WHERE account_id=other_id)>1) THEN RAISE EXCEPTION 'identity_already_linked';END IF;
 PERFORM 1 FROM spacetrader_accounts WHERE id IN(c.account_id,other_id) ORDER BY id FOR UPDATE;
 review=jsonb_build_object('current',spacetrader_link_state(c.account_id),'other',spacetrader_link_state(other_id),'target',c.target);
 IF review->'current'='null'::jsonb OR(other_id IS NOT NULL AND review->'other'='null'::jsonb) THEN RAISE EXCEPTION 'link_conflict';END IF;
 UPDATE spacetrader_link_challenges SET preview=review WHERE hash=challenge;
 RETURN review;
END $$;
CREATE OR REPLACE FUNCTION spacetrader_link_commit(challenge text,session_key text,choice text,delete_confirmed boolean,max_account bigint) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE c spacetrader_link_challenges;s spacetrader_sessions;other_id uuid;winner uuid;loser uuid;doomed uuid;removed bigint:=0;combined bigint;actual jsonb;outcome jsonb;
BEGIN
 PERFORM 1 FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO c FROM spacetrader_link_challenges WHERE hash=challenge AND session_hash=session_key AND expires_at>now() FOR UPDATE;
 IF c.hash IS NULL OR c.verified_at IS NULL OR c.preview IS NULL THEN RAISE EXCEPTION 'link_proof_required';END IF;
 IF c.result IS NOT NULL THEN
  IF c.result->>'choice' IS DISTINCT FROM choice OR delete_confirmed IS DISTINCT FROM true THEN RAISE EXCEPTION 'operation_reused';END IF;RETURN c.result;
 END IF;
 SELECT * INTO s FROM spacetrader_sessions WHERE hash=session_key AND expires_at>now();
 IF s.account_id IS DISTINCT FROM c.account_id OR s.login_identity IS DISTINCT FROM c.source_identity OR s.authenticated_at<now()-interval '10 minutes' OR c.verified_at<now()-interval '5 minutes' THEN RAISE EXCEPTION 'link_proof_required';END IF;
 IF max_account IS NULL OR max_account<2000000 THEN RAISE EXCEPTION 'link_storage_limit';END IF;
 IF choice IS NULL OR choice NOT IN('current','other') OR delete_confirmed IS DISTINCT FROM true THEN RAISE EXCEPTION 'link_confirmation_required';END IF;
 SELECT account_id INTO other_id FROM spacetrader_identities WHERE identity=c.target;
 PERFORM 1 FROM spacetrader_accounts WHERE id IN(c.account_id,other_id) ORDER BY id FOR UPDATE;
 actual=jsonb_build_object('current',spacetrader_link_state(c.account_id),'other',spacetrader_link_state(other_id),'target',c.target);
 IF actual IS DISTINCT FROM c.preview THEN RAISE EXCEPTION 'link_conflict';END IF;
 IF other_id=c.account_id OR EXISTS(SELECT 1 FROM spacetrader_identities WHERE account_id=c.account_id AND kind=CASE WHEN c.target ~'^0x[0-9a-f]{40}$' THEN 'wallet' ELSE 'email' END) OR (other_id IS NOT NULL AND (SELECT count(*) FROM spacetrader_identities WHERE account_id=other_id)>1) THEN RAISE EXCEPTION 'identity_already_linked';END IF;
 IF choice='other' AND other_id IS NULL THEN RAISE EXCEPTION 'link_confirmation_required';END IF;
 winner=CASE WHEN choice='current' THEN c.account_id ELSE other_id END;
 loser=CASE WHEN choice='current' THEN other_id ELSE c.account_id END;
 IF loser IS NOT NULL THEN
  SELECT active_voyage INTO doomed FROM spacetrader_accounts WHERE id=loser;
  IF doomed IS NOT NULL THEN removed=spacetrader_voyage_bytes(doomed);END IF;
  SELECT sum(stored_bytes)-removed INTO combined FROM spacetrader_accounts WHERE id IN(winner,loser);
  IF combined>max_account OR combined<0 OR removed>(SELECT stored_bytes FROM spacetrader_accounts WHERE id=loser) THEN RAISE EXCEPTION 'link_storage_limit';END IF;
  IF doomed IS NOT NULL THEN
   INSERT INTO spacetrader_link_deletions VALUES(doomed,txid_current());
   DELETE FROM spacetrader_entries WHERE voyage_id=doomed;
   DELETE FROM spacetrader_checkpoints WHERE voyage_id=doomed;
   DELETE FROM spacetrader_journal_chunks WHERE voyage_id=doomed;
   DELETE FROM spacetrader_journal_archives WHERE voyage_id=doomed;
   DELETE FROM spacetrader_snapshot_slots WHERE voyage_id=doomed;
   DELETE FROM spacetrader_world_components WHERE voyage_id=doomed;
   DELETE FROM spacetrader_voyages WHERE id=doomed;
   DELETE FROM spacetrader_link_deletions WHERE voyage_id=doomed;
  END IF;
  UPDATE spacetrader_identities SET account_id=winner WHERE account_id=loser;
  UPDATE spacetrader_accounts SET active_voyage=NULL,merged_into=winner,stored_bytes=0 WHERE id=loser;
  UPDATE spacetrader_accounts SET stored_bytes=combined WHERE id=winner;
  UPDATE spacetrader_storage_usage SET bytes=bytes-removed WHERE singleton;
 ELSE
  INSERT INTO spacetrader_identities(identity,account_id,kind) VALUES(c.target,winner,CASE WHEN c.target ~'^0x[0-9a-f]{40}$' THEN 'wallet' ELSE 'email' END);
 END IF;
 DELETE FROM spacetrader_sessions WHERE account_id IN(winner,loser);
 outcome=jsonb_build_object('account',winner,'captainId',(SELECT id FROM spacetrader_captains WHERE account_id=winner),'voyage',(SELECT active_voyage FROM spacetrader_accounts WHERE id=winner),'deletedVoyage',doomed,'choice',choice,'identity',c.source_identity,'authTime',extract(epoch FROM c.source_authenticated_at)*1000);
 UPDATE spacetrader_link_challenges SET result=outcome WHERE hash=challenge;
 RETURN outcome;
END $$;
REVOKE ALL ON spacetrader_identities,spacetrader_link_challenges FROM PUBLIC;
REVOKE ALL ON FUNCTION spacetrader_identity_created(),spacetrader_merged_voyage_guard(),spacetrader_voyage_bytes(uuid),spacetrader_link_state(uuid),spacetrader_link_review(text,text),spacetrader_link_commit(text,text,text,boolean,bigint) FROM PUBLIC;
