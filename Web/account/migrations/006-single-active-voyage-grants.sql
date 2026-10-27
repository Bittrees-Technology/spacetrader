GRANT SELECT ON spacetrader.spacetrader_captains TO spacetrader_runtime;
GRANT EXECUTE ON FUNCTION spacetrader.spacetrader_restart_voyage(uuid,uuid,text,text,text,text,jsonb,jsonb,bigint,bigint,bigint) TO spacetrader_runtime;
