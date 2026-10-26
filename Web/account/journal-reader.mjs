// Account journal pages contain compact, already resolved receipts. Legacy
// pages still use the approved state reader, without fetching new world states.
export function installJournalReader(feed){
 const original=feed.readPage;
 feed.readPage=async(session,before,context)=>{
  const list=await session.history(before),visible=list.slice(0,30),older=list.filter(r=>!r.record);
  const legacy=older.length?await original({snapshot:session.snapshot,history:async()=>older,recorded:n=>session.recorded(n)},null,context):{records:[]};
  const records=new Map(legacy.records.map(r=>[r.sequence,r]));
  return {records:visible.map(m=>m.record||records.get(m.sequence)),more:list.length>30,before:visible.at(-1)?.sequence,imported:legacy.imported};
 };
}
