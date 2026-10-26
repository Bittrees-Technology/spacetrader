-- Apply only after creating the reviewed non-owner runtime role. No membership
-- in other application/owner roles, no CREATE in any application schema.
ALTER ROLE spacetrader_runtime SET search_path=pg_catalog,spacetrader,pg_temp;
GRANT USAGE ON SCHEMA spacetrader TO spacetrader_runtime;
GRANT SELECT,INSERT,UPDATE ON spacetrader.spacetrader_accounts,spacetrader.spacetrader_storage_usage,spacetrader.spacetrader_voyages,spacetrader.spacetrader_checkpoints TO spacetrader_runtime;
GRANT SELECT,INSERT ON spacetrader.spacetrader_entries TO spacetrader_runtime;
GRANT SELECT,INSERT,UPDATE,DELETE ON spacetrader.spacetrader_sessions,spacetrader.spacetrader_challenges,spacetrader.spacetrader_rate_limits TO spacetrader_runtime;
GRANT USAGE,SELECT ON SEQUENCE spacetrader.spacetrader_checkpoints_id_seq TO spacetrader_runtime;
GRANT EXECUTE ON FUNCTION spacetrader.spacetrader_append(uuid,uuid,text,text,text,text,text,text,jsonb,jsonb,bigint,bigint,bigint),spacetrader.spacetrader_checkpoint(uuid,text,text,text,text,text,bigint,bigint,uuid),spacetrader.spacetrader_finish_import(uuid,uuid),spacetrader.spacetrader_start_import(uuid,text,bigint,text,bigint,bigint),spacetrader.spacetrader_account_session(text,text,bigint,integer) TO spacetrader_runtime;
