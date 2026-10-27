GRANT SELECT ON spacetrader.spacetrader_voyage_scores TO spacetrader_runtime;
GRANT EXECUTE ON FUNCTION spacetrader.spacetrader_restart_scored_voyage(uuid,uuid,text,text,text,text,jsonb,jsonb,bigint,bigint,bigint,bigint),spacetrader.spacetrader_retire_voyage(uuid,uuid,text,bigint) TO spacetrader_runtime;
REVOKE ALL ON FUNCTION spacetrader.spacetrader_restart_retained_voyage(uuid,uuid,text,text,text,text,jsonb,jsonb,bigint,bigint,bigint) FROM spacetrader_runtime;
