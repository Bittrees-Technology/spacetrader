-- Retired voyages retain only a compact final-net-worth score. Active payloads stay exact.
SET search_path=spacetrader,pg_catalog,pg_temp;
CREATE TABLE IF NOT EXISTS spacetrader_voyage_scores(
 voyage_id uuid PRIMARY KEY,account_id uuid NOT NULL REFERENCES spacetrader_accounts(id),
 captain_id uuid NOT NULL REFERENCES spacetrader_captains(id),
 name text NOT NULL CHECK(length(name)<=80),day bigint NOT NULL CHECK(day>=0),
 net_worth bigint NOT NULL CHECK(net_worth BETWEEN -9007199254740991 AND 9007199254740991),
 ended_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS spacetrader_scores_account ON spacetrader_voyage_scores(account_id,net_worth DESC,ended_at DESC,voyage_id);
REVOKE ALL ON spacetrader_voyage_scores FROM PUBLIC;
CREATE OR REPLACE FUNCTION spacetrader_checkpoint_active_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE target uuid;active uuid;owner_id uuid;merged uuid;v spacetrader_voyages;
BEGIN
 IF TG_OP='DELETE' THEN target=OLD.voyage_id;ELSE target=NEW.voyage_id;END IF;
 -- Only reviewed definer functions can create a transaction-bound deletion witness.
 IF TG_OP='DELETE' AND EXISTS(SELECT 1 FROM spacetrader_link_deletions WHERE voyage_id=target AND transaction_id=txid_current()) THEN RETURN OLD;END IF;
 PERFORM 1 FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT account_id INTO owner_id FROM spacetrader_voyages WHERE id=target;
 SELECT active_voyage,merged_into INTO active,merged FROM spacetrader_accounts WHERE id=owner_id FOR UPDATE;
 SELECT * INTO v FROM spacetrader_voyages WHERE id=target FOR UPDATE;
 IF merged IS NOT NULL OR v.id IS NULL OR v.archived_at IS NOT NULL OR(active IS DISTINCT FROM target AND NOT(active IS NULL AND v.import_total IS NOT NULL AND v.completed_at IS NULL)) THEN RAISE EXCEPTION 'voyage_archived';END IF;
 IF TG_OP='UPDATE' AND NEW.voyage_id<>OLD.voyage_id THEN RAISE EXCEPTION 'voyage_archived';END IF;
 IF TG_OP='DELETE' THEN RETURN OLD;ELSE RETURN NEW;END IF;
END $$;
CREATE OR REPLACE FUNCTION spacetrader_restart_retained_voyage(
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
 UPDATE spacetrader_accounts SET active_voyage=voyage.id,stored_bytes=stored_bytes+additional WHERE id=owner_id;
 INSERT INTO spacetrader_entries(voyage_id,sequence,operation,digest,codec,payload,event,summary,created_ms) VALUES(voyage.id,1,op,hash,'full',packed,action,details,created);
 UPDATE spacetrader_storage_usage SET bytes=bytes+additional WHERE singleton;
 RETURN jsonb_build_object('id',voyage.id,'captainId',voyage.captain_id,'archived',expected,'replayed',false);
END $$;

-- No payload or journal DELETE privileges are granted to the runtime role.
-- Existing merge-deletion witnesses are owner-only and scoped to this transaction.
CREATE OR REPLACE FUNCTION spacetrader_retire_voyage(owner_id uuid,target uuid,parent text,final_worth bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE account spacetrader_accounts;v spacetrader_voyages;prior spacetrader_voyage_scores;
 removed bigint;added bigint:=0;details jsonb;total bigint;ended timestamptz;
BEGIN
 SELECT bytes INTO total FROM spacetrader_storage_usage WHERE singleton FOR UPDATE;
 SELECT * INTO account FROM spacetrader_accounts WHERE id=owner_id AND merged_into IS NULL FOR UPDATE;
 IF account.id IS NULL OR total IS NULL THEN RAISE EXCEPTION 'account_missing';END IF;
 SELECT s.* INTO prior FROM spacetrader_voyage_scores s JOIN spacetrader_accounts a ON a.id=s.account_id WHERE s.voyage_id=target AND(a.id=owner_id OR a.merged_into=owner_id);
 SELECT x.* INTO v FROM spacetrader_voyages x JOIN spacetrader_accounts a ON a.id=x.account_id WHERE x.id=target AND(a.id=owner_id OR a.merged_into=owner_id) FOR UPDATE OF x;
 IF v.id IS NULL THEN
  IF prior.voyage_id IS NOT NULL AND prior.net_worth IS NOT DISTINCT FROM final_worth THEN RETURN jsonb_build_object('replayed',true,'score',target);END IF;
  RAISE EXCEPTION 'voyage_missing';
 END IF;
 IF v.id=account.active_voyage OR EXISTS(SELECT 1 FROM spacetrader_accounts WHERE active_voyage=v.id) OR v.revision IS DISTINCT FROM parent OR(v.archived_at IS NULL AND(v.import_total IS NULL OR v.completed_at IS NULL)) THEN RAISE EXCEPTION 'retirement_conflict';END IF;
 SELECT coalesce(v.compact_summary,e.summary) INTO details FROM spacetrader_entries e WHERE e.voyage_id=v.id AND e.sequence=v.sequence;
 details=coalesce(v.compact_summary,details,'{}'::jsonb);
 IF final_worth IS NULL AND details->>'created'='true' THEN RAISE EXCEPTION 'final_score_required';END IF;
 removed=spacetrader_voyage_bytes(v.id);
 IF removed>account.stored_bytes OR removed>total THEN RAISE EXCEPTION 'retirement_accounting';END IF;
 IF final_worth IS NOT NULL THEN
  IF final_worth NOT BETWEEN -9007199254740991 AND 9007199254740991 THEN RAISE EXCEPTION 'invalid_final_score';END IF;
  ended=coalesce(v.archived_at,v.updated_at);
  INSERT INTO spacetrader_voyage_scores(voyage_id,account_id,captain_id,name,day,net_worth,ended_at)
  VALUES(v.id,v.account_id,v.captain_id,left(coalesce(details->>'name','Captain'),80),coalesce((details->>'day')::bigint,0),final_worth,ended);
  added=512; -- Fixed conservative charge for the bounded score row and identifying metadata.
 END IF;
 INSERT INTO spacetrader_link_deletions(voyage_id,transaction_id) VALUES(v.id,txid_current());
 DELETE FROM spacetrader_entries WHERE voyage_id=v.id;
 DELETE FROM spacetrader_checkpoints WHERE voyage_id=v.id;
 DELETE FROM spacetrader_journal_chunks WHERE voyage_id=v.id;
 DELETE FROM spacetrader_journal_archives WHERE voyage_id=v.id;
 DELETE FROM spacetrader_snapshot_slots WHERE voyage_id=v.id;
 DELETE FROM spacetrader_world_components WHERE voyage_id=v.id;
 DELETE FROM spacetrader_voyages WHERE id=v.id;
 DELETE FROM spacetrader_link_deletions WHERE voyage_id=v.id;
 UPDATE spacetrader_accounts SET stored_bytes=stored_bytes-removed+added WHERE id=owner_id;
 UPDATE spacetrader_storage_usage SET bytes=bytes-removed+added WHERE singleton;
 RETURN jsonb_build_object('retired',target,'score',CASE WHEN added>0 THEN target ELSE NULL END,'releasedBytes',removed-added,'replayed',false);
END $$;
CREATE OR REPLACE FUNCTION spacetrader_restart_scored_voyage(
 owner_id uuid,expected uuid,parent text,op text,hash text,packed text,action jsonb,details jsonb,
 created bigint,max_account bigint,max_total bigint,final_worth bigint
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
DECLARE result jsonb;retired jsonb;
BEGIN
 IF max_account IS NULL OR max_total IS NULL OR max_account<2000000 OR max_total<max_account THEN RAISE EXCEPTION 'invalid_restart';END IF;
 -- The retained helper and retirement are one transaction under the global lock.
 -- Test quotas on the final result, so replacing a full account can free its old data.
 result=spacetrader_restart_retained_voyage(owner_id,expected,parent,op,hash,packed,action,details,created,9223372036854775807,9223372036854775807);
 IF coalesce((result->>'replayed')::boolean,false) THEN RETURN result;END IF;
 IF expected IS NOT NULL THEN retired=spacetrader_retire_voyage(owner_id,expected,parent,final_worth);END IF;
 IF(SELECT stored_bytes FROM spacetrader_accounts WHERE id=owner_id)>max_account OR(SELECT bytes FROM spacetrader_storage_usage WHERE singleton)>max_total THEN RAISE EXCEPTION 'storage_limit';END IF;
 RETURN result||jsonb_build_object('scoreArchives',true,'retirement',retired);
END $$;
-- Old writers may initialize empty accounts, but cannot keep full archives after cutover.
CREATE OR REPLACE FUNCTION spacetrader_restart_voyage(
 owner_id uuid,expected uuid,parent text,op text,hash text,packed text,action jsonb,details jsonb,
 created bigint,max_account bigint,max_total bigint
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
BEGIN
 IF expected IS NOT NULL THEN RAISE EXCEPTION 'score_archive_writer_required';END IF;
 RETURN spacetrader_restart_scored_voyage(owner_id,expected,parent,op,hash,packed,action,details,created,max_account,max_total,NULL);
END $$;
REVOKE ALL ON FUNCTION spacetrader_restart_retained_voyage(uuid,uuid,text,text,text,text,jsonb,jsonb,bigint,bigint,bigint),spacetrader_retire_voyage(uuid,uuid,text,bigint),spacetrader_restart_scored_voyage(uuid,uuid,text,text,text,text,jsonb,jsonb,bigint,bigint,bigint,bigint) FROM PUBLIC;
CREATE OR REPLACE FUNCTION spacetrader_link_state(owner_id uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,spacetrader,pg_temp AS $$
 SELECT jsonb_build_object('account',a.id,'identity',a.identity,'captainId',c.id,'voyage',a.active_voyage,'revision',v.revision,'storedBytes',a.stored_bytes,'scoreArchives',true,'archives',(SELECT count(*) FROM spacetrader_voyage_scores x JOIN spacetrader_accounts y ON y.id=x.account_id WHERE y.id=a.id OR y.merged_into=a.id),'name',CASE WHEN coalesce(v.compact_summary,e.summary)->>'created'='false' THEN 'New captain' ELSE coalesce(coalesce(v.compact_summary,e.summary)->>'name','No saved voyage') END,'day',coalesce(v.compact_summary,e.summary)->'day','location',coalesce(v.compact_summary,e.summary)->>'location','sequence',v.sequence)
 FROM spacetrader_accounts a JOIN spacetrader_captains c ON c.account_id=a.id LEFT JOIN spacetrader_voyages v ON v.id=a.active_voyage LEFT JOIN spacetrader_entries e ON e.voyage_id=v.id AND e.sequence=v.sequence WHERE a.id=owner_id AND a.merged_into IS NULL
$$;
