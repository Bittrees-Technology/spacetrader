import {splitState,joinState} from './state-parts.mjs';
import {stateDelta,applyStateDelta} from './state-delta.mjs';
const bytes=v=>new TextEncoder().encode(v).length;
const defaultHash=async raw=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw))),v=>v.toString(16).padStart(2,'0')).join('');
const uuid=()=>crypto.randomUUID();
const response=value=>new Response(JSON.stringify(value),{status:200,headers:{'Content-Type':'application/json'}});
const tail=record=>({...record.batch.base,...record.batch.latest,raw:record.body.raw,batchSaves:true,checkpointLimit:0,pending:record.batch.events.length});
export function createBatchTransport({fallback,fetch:send,outbox,owner,voyage:initial,onStatus=()=>{},onConflict=()=>{},hash=defaultHash,delay=2500,schedule=setTimeout,cancel=clearTimeout}){
 let voyage=initial,current=null,enabled=false,inFlight=null,timer=null,retries=0,disposed=false,blocked=false,lastError=null,status={pending:0,syncing:false,conflict:false,error:null};
 function notify(record,error=blocked?lastError:null){status={pending:record?.batch?.events.length||0,syncing:Boolean(inFlight),conflict:record?.status==='conflict',error:error?.message||null};onStatus(status);}
 function plan(record){
  let core=splitState(record.batch.base.raw).core,frame=splitState(record.batch.base.raw).component,raw,events=[];
  const flight=record.batch.flight;
  let expanded=0;
  for(const event of record.batch.events.slice(0,flight?.count||32)){
   const next=[...events,event],request={id:flight?.id||'x'.repeat(36),parent:record.batch.base.revision,events:next};
   if(!flight&&bytes(JSON.stringify(request))>3_800_000)break;
   const nextCore=applyStateDelta(core,event.patch),nextFrame=event.component===null?null:event.part===undefined?frame:event.part,nextRaw=joinState(nextCore,nextFrame),size=bytes(nextRaw);
   if(!flight&&expanded+size>32*1024*1024)break;
   core=nextCore;frame=nextFrame;raw=nextRaw;expanded+=size;events=next;
  }
  if(!events.length)throw Error('This action exceeds the background save limit. Your device progress is retained.');
  return {request:{id:flight?.id||uuid(),parent:record.batch.base.revision,events},raw,count:events.length,revision:events.at(-1).rawHash+':'+(record.batch.base.sequence+events.length)};
 }
 function later(ms=delay){if(disposed||blocked||timer!==null)return;timer=schedule(()=>{timer=null;void flush().catch(()=>{});},ms);}
 async function enqueue(body){
  if(!current||!voyage||body.key!=='auto'||!body.action?.id||typeof body.raw!=='string'||bytes(body.raw)>=2_000_000)throw Error('Reconnect to the selected voyage before continuing.');
  if(body.preserve||['restore','new-voyage'].includes(body.action.type))throw Error('Account voyages keep their latest progress. Start another voyage from Saved voyages.');
  const prior=await outbox.get(owner,voyage),base=prior?.batch?tail(prior):current;
  if(prior&&!prior.batch)throw Error('An earlier save must finish before background saving can start.');
  if(base.revision!==body.revision)throw Error('Another tab changed this voyage. Reload to review its latest progress.');
  const previous=splitState(base.raw),next=splitState(body.raw),ref=next.component===null?null:await hash(next.component),oldRef=previous.component===null?null:await hash(previous.component),rawHash=await hash(body.raw);
  const event={action:body.action,created:Date.now(),rawHash,patch:stateDelta(previous.core,next.core),component:ref,...(ref!==oldRef&&ref!==null?{part:next.component}:{})};
  if(joinState(applyStateDelta(previous.core,event.patch),next.component)!==body.raw)throw Error('The device save failed its integrity check.');
  const record=await outbox.change(owner,voyage,existing=>{
   if(existing?.status==='conflict')throw Error('Pending actions need review in Account & saves before continuing.');
   if(existing&&!existing.batch||existing?.batch&&existing.batch.latest.revision!==base.revision)throw Error('Another tab recorded a newer action. Reload before continuing.');
   const value=existing||{created:Date.now(),status:'pending',batch:{base:{...base,raw:base.raw},events:[],latest:{revision:base.revision,sequence:base.sequence},flight:null}};
   if(value.batch.events.length>=32)throw Error('Pending device saves are full. Sync progress before continuing.');
   const sequence=base.sequence+1;
   return {...value,body:{raw:body.raw,action:body.action},batch:{...value.batch,events:[...value.batch.events,event],latest:{revision:rawHash+':'+sequence,sequence}}};
  });
  current=tail(record);notify(record);later(record.batch.events.length>=16?0:delay);return response(current);
 }
 async function perform(){
  const opening=await outbox.get(owner,voyage),target=opening?.batch?.latest.sequence||0;
  while(!disposed){
   let record=await outbox.get(owner,voyage);if(!record?.batch){notify(null);return current;}
   if(record.status==='conflict')throw Error('Pending actions need review in Account & saves.');
   if(!record.batch.flight){const proposed=plan(record);record=await outbox.change(owner,voyage,value=>value?.batch&&!value.batch.flight?{...value,batch:{...value.batch,flight:{id:proposed.request.id,count:proposed.count,revision:proposed.revision}}}:value);if(!record?.batch)continue;}
   const flight=plan(record);notify(record);
   const result=await send('/api/voyage/batch',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','X-Spacetrader':'shared-save-v1','X-Spacetrader-Storage':'compact-v1','X-Spacetrader-Account':owner,'X-Spacetrader-Voyage':voyage},body:JSON.stringify(flight.request)}),value=await result.json();
   if(!result.ok){
    if(result.status===409){await outbox.hold(owner,voyage);onConflict();}
    throw Object.assign(Error(value.error||'Cloud synchronization is delayed. Device progress is preserved.'),{status:result.status});
   }
   if(value.id!==flight.request.id||value.voyage!==voyage||value.revision!==flight.revision||value.rawDigest!==await hash(flight.raw))throw Error('Cloud save acknowledgement failed its integrity check.');
   const remaining=await outbox.change(owner,voyage,latest=>{
    // Another tab may already have acknowledged this exact immutable flight.
    if(!latest?.batch||latest.batch.flight?.id!==flight.request.id)return latest;
    if(JSON.stringify(latest.batch.events.slice(0,flight.count))!==JSON.stringify(flight.request.events))throw Error('Pending save sequence changed. Existing progress is preserved.');
    const events=latest.batch.events.slice(flight.count);if(!events.length)return null;
    return {...latest,batch:{...latest.batch,base:{...latest.batch.base,raw:flight.raw,revision:value.revision,sequence:value.sequence},events,flight:null}};
   });
   // An acknowledgement for a prefix must never roll back newer local actions.
   if(remaining?.batch)current=tail(remaining);
   else if(!current||current.sequence<=value.sequence)current={...current,raw:flight.raw,revision:value.revision,sequence:value.sequence,pending:0};
   retries=0;lastError=null;blocked=false;notify(remaining);if(value.sequence>=target){if(remaining?.batch)later();return current;}
  }
 }
 function flush(){
  if(inFlight)return inFlight;if(blocked)return Promise.reject(lastError||Error('Sync needs attention.'));if(!voyage||disposed)return Promise.resolve(current);
  if(timer!==null){cancel(timer);timer=null;}
  inFlight=perform().catch(async error=>{lastError=error;blocked=[400,401,403,404,413,428,507].includes(error.status);const record=await outbox.get(owner,voyage);notify(record,error);if(record?.batch&&record.status!=='conflict'&&![400,401,403,404,413,428,507].includes(error.status))later([3000,10000,30000,60000][Math.min(retries++,3)]);throw error;}).finally(()=>{inFlight=null;status={...status,syncing:false};onStatus(status);});return inFlight;
 }
 async function request(path,options={}){
  const isRead=path.split('?')[0]==='/api/voyage'&&options.method!=='POST';
  if(isRead&&!current&&voyage){const pending=await outbox.get(owner,voyage);if(pending?.batch){enabled=true;current=tail(pending);notify(pending);if(pending.status==='conflict')onConflict();else later(0);return response(current);}}
  if(options.method==='POST'&&path==='/api/voyage'&&enabled)return enqueue(JSON.parse(options.body));
  if(isRead&&enabled){const pending=await outbox.get(owner,voyage);if(pending?.batch){try{await flush();}catch{}const remaining=await outbox.get(owner,voyage);if(remaining?.batch)return response(tail(remaining));}}
  else if(enabled){await request.flush();const remaining=await outbox.get(owner,voyage);if(remaining?.batch)throw Error('Sync pending progress before opening account history or changing voyages.');}
  const result=await fallback(path,options),value=await result.clone().json();
  if(result.ok&&isRead){voyage=value.voyage||voyage;enabled=Boolean(value.batchSaves);current={...current,...value};if(voyage){const pending=await outbox.get(owner,voyage);if(pending?.batch){enabled=true;current=tail(pending);notify(pending);if(pending.status==='conflict')onConflict();else later(0);return response(current);}}}
  return result;
 }
 request.flush=async()=>{blocked=false;lastError=null;const record=voyage?await outbox.get(owner,voyage):null,target=record?.batch?.latest.sequence||0;await flush();while(voyage){const pending=await outbox.get(owner,voyage);if(!pending?.batch||pending.batch.base.sequence>=target)return current;await flush();}};request.status=()=>status;request.dispose=()=>{disposed=true;if(timer!==null)cancel(timer);};return request;
}
