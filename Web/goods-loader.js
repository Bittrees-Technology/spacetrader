'use strict';
(function(root){
 function create(indexURL,workerURL){
  let loaded=null,payload=null,worker=null,serial=0;const pending=new Map();
  async function load(){
   if(loaded)return loaded;
   loaded=(async()=>{const response=await fetch(indexURL);if(!response.ok)throw Error('Goods data could not be loaded. Reload to try again.');payload=await response.json();const rows=SpacetraderGoodsCodec.decode(payload);return {rows,approval:payload.approval,dailyPriceSnapshots:{periodDays:payload.periodDays}};})();
   try{return await loaded;}catch(error){loaded=null;payload=null;throw error;}
  }
  function reset(message){
   worker?.terminate();worker=null;for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error(message));}pending.clear();
  }
  function start(){
   if(worker)return worker;
   if(typeof Worker==='undefined')throw Error('Item summaries require a browser with worker support.');
   const instance=worker=new Worker(workerURL);
   instance.onmessage=event=>{const {id,rows,error}=event.data||{},p=pending.get(id);if(!p)return;clearTimeout(p.timer);pending.delete(id);error?p.reject(Error(error)):p.resolve(rows);};
   instance.onerror=()=>{if(worker===instance)reset('The item summary could not be prepared. Retry to continue.');};
   instance.postMessage({type:'init',payload});return instance;
  }
  async function summary(rows){
   await load();const instance=start(),id=++serial;
   return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{if(pending.has(id))reset('The item summary took too long. Retry to continue.');},60000);
    pending.set(id,{resolve,reject,timer});instance.postMessage({type:'summary',id,keys:rows.map(r=>r.key)});
   });
  }
  return {load,summary};
 }
 root.SpacetraderCatalogueData={create};
})(globalThis);
