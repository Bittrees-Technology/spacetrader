'use strict';
importScripts('./goods-codec.js','./quote-prices.js','./goods-view.js');
let records=new Map(),chunks=[],periodDays=0;const loaded=new Map(),outcomes={},snapshots=new Map();
async function loadChunk(chunk){
 if(loaded.has(chunk.url))return loaded.get(chunk.url);
 const task=(async()=>{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
  let value;try{const response=await fetch(chunk.url,{signal:controller.signal});if(!response.ok)throw Error('Statistics unavailable.');value=await response.json();}finally{clearTimeout(timer);}
  if(value.dailyPriceSnapshots?.basis!=='daily-station-price-snapshots'||value.dailyPriceSnapshots.periodDays!==periodDays)throw Error('Invalid statistics.');
  Object.assign(outcomes,value.quotePairOutcomes);for(const row of value.dailyPriceSnapshots.rows)snapshots.set(row.key,row);
 })();loaded.set(chunk.url,task);
 try{await task;}catch(error){loaded.delete(chunk.url);throw error;}
}
self.onmessage=async event=>{
 const {type,payload,id,keys}=event.data||{};
 try{
  if(type==='init'){records=new Map(SpacetraderGoodsCodec.decode(payload).map(r=>[r.key,r]));chunks=payload.statistics;periodDays=payload.periodDays;return;}
  if(type!=='summary')return;
  const rows=keys.map(key=>{if(!records.has(key))throw Error('Unknown catalogue row.');return records.get(key);}),items=new Set(rows.filter(r=>r.exchangeFrequency).map(r=>r.item));
  const needed=chunks.filter(c=>c.items.some(item=>items.has(item)));let cursor=0;
  await Promise.all(Array.from({length:Math.min(3,needed.length)},async()=>{while(cursor<needed.length)await loadChunk(needed[cursor++]);}));
  const result=SpacetraderGoodsView.aggregateItems(rows,outcomes,{basis:'daily-station-price-snapshots',periodDays,rows:[...snapshots.values()]});
  self.postMessage({id,rows:result});
 }catch(error){self.postMessage({id,error:'Item statistics could not be loaded. Retry to continue.'});}
};
