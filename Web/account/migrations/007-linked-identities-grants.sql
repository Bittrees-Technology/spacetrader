GRANT SELECT ON spacetrader.spacetrader_identities TO spacetrader_runtime;
GRANT SELECT,INSERT,UPDATE,DELETE ON spacetrader.spacetrader_link_challenges TO spacetrader_runtime;
GRANT EXECUTE ON FUNCTION spacetrader.spacetrader_link_review(text,text),spacetrader.spacetrader_link_commit(text,text,text,boolean,bigint) TO spacetrader_runtime;
