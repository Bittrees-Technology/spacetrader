GRANT SELECT,INSERT,UPDATE ON spacetrader.spacetrader_journal_chunks,spacetrader.spacetrader_snapshot_slots TO spacetrader_runtime;
GRANT EXECUTE ON FUNCTION spacetrader.spacetrader_compact_append(uuid,uuid,text,text,text,text,text,jsonb,bigint,bigint,text,text,text,bigint,bigint,boolean),spacetrader.spacetrader_compact_checkpoint(uuid,uuid,text,text,text,text,text,bigint,bigint) TO spacetrader_runtime;
GRANT EXECUTE ON FUNCTION spacetrader.spacetrader_compact_format_guard() TO spacetrader_runtime;
