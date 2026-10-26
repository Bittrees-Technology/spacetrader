import {splitState,joinState} from './state-parts.mjs';
const byteLength=value=>new TextEncoder().encode(value).length;
const hashDefault=async raw=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw))),v=>v.toString(16).padStart(2,'0')).join('');
export function createSaveOutbox(indexedDB=globalThis.indexedDB){
 let opened;
 function database(){return opened??=new Promise((resolve,reject)=>{if(!indexedDB){reject(Error('Persistent save recovery is unavailable in this browser.'));return;}const request=indexedDB.open('spacetrader-account-outbox',1),timer=setTimeout(()=>reject(Error('Save recovery storage is busy. Close duplicate game tabs and retry.')),5000);request.onupgradeneeded=()=>request.result.createObjectStore('pending',{keyPath:'key'});request.onsuccess=()=>{clearTimeout(timer);resolve(request.result);};request.onerror=()=>{clearTimeout(timer);reject(Error('Save recovery storage could not be opened.'));};request.onblocked=()=>{clearTimeout(timer);reject(Error('Save recovery storage is busy.'));};});}
 async function transact(mode,run){const db=await database();return new Promise((resolve,reject)=>{let tx;try{tx=db.transaction('pending',mode,mode==='readwrite'?{durability:'strict'}:{});}catch(error){if(!(error instanceof TypeError))throw error;tx=db.transaction('pending',mode);}const store=tx.objectStore('pending');let value;tx.oncomplete=()=>resolve(value);tx.onabort=tx.onerror=()=>reject(Error('The pending save could not be secured on this device.'));try{run(store,x=>{value=x;},tx,reject);}catch(e){tx.abort();reject(e);}});}
 const key=(owner,voyage)=>owner+':'+voyage;
 return {
  change:(owner,voyage,update)=>transact('readwrite',(s,done,tx,reject)=>{const r=s.getAll();r.onsuccess=()=>{try{const records=r.result,k=key(owner,voyage),prior=records.find(x=>x.key===k),next=update(prior||null);if(next){const value={...next,key:k,owner,voyage};if(!prior&&records.length>=16||records.filter(x=>x.key!==k).reduce((n,x)=>n+byteLength(JSON.stringify(x)),0)+byteLength(JSON.stringify(value))>16*1024*1024)throw Error('Device save recovery is full. Sync pending progress before continuing.');s.put(value);done(value);}else{s.delete(k);done(null);}}catch(e){tx.abort();reject(e);}};}),
  get:(owner,voyage)=>transact('readonly',(s,done)=>{const r=s.get(key(owner,voyage));r.onsuccess=()=>done(r.result||null);}),
  list:owner=>transact('readonly',(s,done)=>{const r=s.getAll();r.onsuccess=()=>done(r.result.filter(x=>x.owner===owner));}),
  async put(owner,voyage,body){
   if(!body?.action?.id||typeof body.raw!=='string'||byteLength(body.raw)>=2_000_000)throw Error('Invalid pending save.');
   return transact('readwrite',(s,done,tx)=>{const r=s.getAll();r.onsuccess=()=>{const records=r.result,k=key(owner,voyage),prior=records.find(x=>x.key===k);if(prior&&(prior.body.action.id!==body.action.id||JSON.stringify(prior.body)!==JSON.stringify(body))){tx.abort();return;}if(!prior&&(records.length>=16||records.reduce((n,x)=>n+byteLength(JSON.stringify(x)),0)+byteLength(JSON.stringify(body))>16*1024*1024)){tx.abort();return;}s.put({key:k,owner,voyage,body,created:prior?.created||Date.now(),status:prior?.status||'pending'});done(true);};});
  },
  hold:(owner,voyage)=>transact('readwrite',(s,done)=>{const r=s.get(key(owner,voyage));r.onsuccess=()=>{if(r.result)s.put({...r.result,status:'conflict'});done(true);};}),
  clear:(owner,voyage)=>transact('readwrite',(s,done)=>{s.delete(key(owner,voyage));done(true);})
 };
}
export function createSyncTransport({fetch:send,owner,voyage:initial=null,onVoyage=()=>{},outbox,hash=hashDefault,onConflict=()=>{}}){
 let voyage=initial,recovered=false;const components=new Map(),confirmed=new Set();
 function cache(id,part){if(!id)return;components.delete(id);components.set(id,part);while(components.size>3){const first=components.keys().next().value;components.delete(first);confirmed.delete(first);}}
 async function network(path,options={},forcePart=false){
  const headers={...options.headers,'X-Spacetrader-Account':owner,'X-Spacetrader-Storage':'compact-v1','X-Spacetrader-Wire':'parts-v1',...(voyage?{'X-Spacetrader-Voyage':voyage}:{})};
  // The newest known exact frame can be omitted from a load response.
  const known=[...components.keys()].at(-1);if(known)headers['X-Spacetrader-Component']=known;
  let original=null,body=options.body;
  if(body&&['/api/voyage','/api/checkpoint'].includes(path)){
   original=JSON.parse(body);
   if(typeof original.raw==='string'){
    const {core,component}=splitState(original.raw),id=component===null?null:await hash(component);cache(id,component);
    body=JSON.stringify({...original,raw:undefined,rawHash:await hash(original.raw),state:{core,component:id,...(id&&(!confirmed.has(id)||forcePart)?{part:component}:{})},...(Object.hasOwn(original,'expected')?{expected:undefined,expectedHash:original.expected===null?null:await hash(original.expected)}:{})});
   }
  }
  const response=await send(path,{...options,headers,body}),value=await response.json();
  if(response.status===428&&original?.raw&&!forcePart)return network(path,options,true);
  if(value.voyage){if(voyage&&value.voyage!==voyage)throw Error('The selected voyage changed. Reopen Saved voyages.');voyage=value.voyage;onVoyage(voyage);}
  if(value.state){
   const {core,component:id,part}=value.state;let frame=null;
   if(id){if(typeof part==='string'){if(await hash(part)!==id)throw Error('Economy component integrity check failed.');cache(id,part);}frame=components.get(id);if(typeof frame!=='string')throw Error('A saved economy component is missing. Reload before continuing.');}
   value.raw=joinState(core,frame);if(await hash(value.raw)!==value.rawDigest)throw Error('Saved voyage integrity check failed.');delete value.state;
  }
  if(value.accepted){if(!original?.raw||await hash(original.raw)!==value.rawDigest)throw Error('Save acknowledgement integrity check failed.');value.raw=original.raw;}
  if(response.ok&&value.componentStorage&&typeof value.raw==='string'){const part=splitState(value.raw).component;if(part!==null)confirmed.add(await hash(part));}
  return {response,value};
 }
 async function persist(body){if(!voyage)throw Error('Choose a saved voyage first.');const prior=await outbox.get(owner,voyage);if(prior?.status==='conflict')throw Error('An earlier action conflicts with another device. Review it in Account & saves.');await outbox.put(owner,voyage,body);}
 async function post(body){
  const result=await network('/api/voyage',{method:'POST',headers:{'Content-Type':'application/json','X-Spacetrader':'shared-save-v1'},body:JSON.stringify(body)});
  if(result.response.ok)await outbox.clear(owner,voyage);
  else if(result.response.status===409){await outbox.hold(owner,voyage);onConflict();}
  return result;
 }
 return async(path,options={})=>{
  let result;
  if(options.method==='POST'&&path==='/api/voyage'){
   const body=JSON.parse(options.body);await persist(body);result=await post(body);
  }else{
   result=await network(path,options);
   if(result.response.ok&&!recovered&&path.split('?')[0]==='/api/voyage'&&voyage){
    recovered=true;const pending=await outbox.get(owner,voyage);
    if(pending?.status==='pending'&&!pending.batch){
     const replay=await post(pending.body);
     if(replay.response.ok)result={response:replay.response,value:{...result.value,...replay.value}};
     else if(replay.response.status===409){const {error,...latest}=replay.value;result={response:new Response(null,{status:200}),value:{...result.value,...latest,recoveryConflict:true}};}
     else result=replay;
    }else if(pending?.status==='conflict'&&!pending.batch)onConflict();
   }
  }
  return new Response(JSON.stringify(result.value),{status:result.response.status,headers:result.response.headers});
 };
}
