'use strict';
// Browser-only equivalent of the shared native ledger. IndexedDB commits off the UI thread.
(function(root){
 async function openBrowserVoyageLedger({indexedDB:factory=root.indexedDB,legacy,key='spacetrader.action-ledger.v1',version='unknown'}={}){
  if(!factory)throw Error('This browser cannot open its game ledger. Existing progress is preserved.');
  const req=factory.open(key,1),db=await new Promise((resolve,reject)=>{req.onupgradeneeded=()=>{const d=req.result,entries=d.createObjectStore('entries',{keyPath:'sequence',autoIncrement:true});entries.createIndex('operation','operation',{unique:true});d.createObjectStore('meta');};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(Error('Close an older Spacetrader setup window before opening this ledger.'));});
  const request=q=>new Promise((resolve,reject)=>{q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
  function transaction(mode='readonly'){try{return db.transaction(['entries','meta'],mode,{durability:'strict'});}catch{return db.transaction(['entries','meta'],mode);}}
  const done=t=>{const result=new Promise((resolve,reject)=>{t.oncomplete=resolve;t.onerror=()=>reject(t.error||Error('The action was not recorded.'));t.onabort=()=>reject(t.error||Error('The action was not recorded.'));});result.catch(()=>{});return result;};
  const hash=async raw=>Array.from(new Uint8Array(await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw)))).map(n=>n.toString(16).padStart(2,'0')).join('');
  async function pack(raw){if(!root.CompressionStream)return {codec:'text',payload:raw};const stream=new Blob([raw]).stream().pipeThrough(new root.CompressionStream('deflate'));return {codec:'zlib',payload:await new Response(stream).arrayBuffer()};}
  async function unpack(row){if(!row)return null;const raw=row.codec==='text'?row.payload:await new Response(new Blob([row.payload]).stream().pipeThrough(new root.DecompressionStream('deflate'))).text();if(raw.length>=2000000||await hash(raw)!==row.digest)throw Error('Ledger integrity check failed; your history is preserved.');return raw;}
  async function row(){const t=transaction(),q=await request(t.objectStore('meta').get('head'));return q||null;}
  async function snapshot(includeSlots=true){const latest=await row(),slots={};for(const k of includeSlots?['checkpoint','slot1','slot2','slot3']:[]){const raw=legacy?.read(k);if(raw)slots[k]=raw;}return {revision:latest?.revision||null,sequence:latest?.sequence||0,raw:await unpack(latest),...(includeSlots?{slots}:{}),version,ledger:true};}
  async function append(body){
   if(body.key!=='auto')throw Error('New progress records automatically; earlier checkpoints are read-only.');
   if(typeof body.raw!=='string'||new TextEncoder().encode(body.raw).length>=2000000)throw Error('Invalid voyage outcome.');
   const parsed=root.Heliocline.parse(body.raw),event=body.action||{id:root.crypto.randomUUID(),type:'legacy-save',args:{},source:'browser',version};
   if(!/^[A-Za-z0-9_-]{1,100}$/.test(event.id)||!/^[A-Za-z0-9_-]{1,60}$/.test(event.type)||!event.args||typeof event.args!=='object'||Array.isArray(event.args)||JSON.stringify(event.args).length>16384)throw Error('Invalid action details.');
   const digest=await hash(body.raw),packed=await pack(body.raw),t=transaction('readwrite'),finished=done(t),entries=t.objectStore('entries'),meta=t.objectStore('meta');let response;
   // Keep the transaction alive through its own IndexedDB requests; no crypto or compression inside it.
   try{
   const existing=await request(entries.index('operation').get(event.id)),current=await request(meta.get('head'));
   if(existing){if(existing.digest!==digest||existing.event.type!==event.type||JSON.stringify(existing.event.args)!==JSON.stringify(event.args)){t.abort();await finished.catch(()=>{});throw Error('Action identifier was reused.');}await finished;return {status:200,body:await snapshot()};}
   if((current?.revision||null)!==body.revision){await finished;return {status:409,body:{...await snapshot(),error:'Newer progress is available. It has been loaded; try your action again.'}};}
   const entry={...packed,digest,event,operation:event.id,type:event.type,created:Date.now(),name:parsed.profile.name,day:parsed.day,location:parsed.location,credits:parsed.credits,fleet:parsed.fleet.length+1};
   const sequence=await request(entries.add(entry));entry.sequence=sequence;entry.revision=digest+':'+sequence;meta.put(entry,'head');await finished;
   response={revision:entry.revision,sequence,raw:body.raw,ledger:true,version,backup:body.preserve&&current?'ledger:'+current.sequence:null};return {status:200,body:response};
   }catch(error){try{t.abort();}catch{}await finished.catch(()=>{});throw error;}
  }
  async function checkpoint(body){
   if(!['slot1','slot2','slot3'].includes(body.key))throw Error('Unknown checkpoint slot.');
   if(body.expected!==null&&(typeof body.expected!=='string'||new TextEncoder().encode(body.expected).length>=2000000))throw Error('Invalid checkpoint selection.');
   if(body.raw!==null){if(typeof body.raw!=='string'||new TextEncoder().encode(body.raw).length>=2000000)throw Error('Invalid checkpoint.');root.Heliocline.parse(body.raw);}
   const t=transaction('readwrite'),finished=done(t);
   try{
    const current=await request(t.objectStore('meta').get('head'));
    if((current?.revision||null)!==body.revision||legacy.read(body.key)!==body.expected){await finished;return {status:409,body:{...await snapshot(),error:'That voyage or checkpoint changed. Review it before trying again.'}};}
    const backup=body.raw===null?legacy.remove(body.key):legacy.write(body.key,body.raw,true);
    await finished;return {status:200,body:{...await snapshot(),backup}};
   }catch(error){try{t.abort();}catch{}await finished.catch(()=>{});throw error;}
  }
  // Import old browser progress once. Original localStorage keys remain untouched.
  if(!await row()){const raw=legacy?.read('auto');if(raw){root.Heliocline.parse(raw);await append({key:'auto',raw,revision:null,action:{id:'legacy-import',type:'legacy-import',args:{},source:'browser',version}});}}
  return async function(path,options={}){let status=200,body;try{
   if((options.method||'GET')==='POST'&&path==='/api/checkpoint'){const result=await checkpoint(JSON.parse(options.body));status=result.status;body=result.body;}
   else if((options.method||'GET')==='POST'&&path==='/api/voyage'){const result=await append(JSON.parse(options.body));status=result.status;body=result.body;}
   else if((options.method||'GET')!=='GET')throw Error('Unsupported ledger request.');
   else if(path==='/api/voyage'||path.startsWith('/api/voyage?since=')){const current=await row(),since=path.split('=')[1];body=since&&since===current?.revision?{revision:current.revision,sequence:current.sequence,ledger:true,unchanged:true,version}:await snapshot(!since);}
   else if(path.startsWith('/api/backups')){const n=Number(new URL('http://local'+path).searchParams.get('offset')||0),keys=legacy?.backups()||[];body={backups:keys.slice(n,n+31).map(key=>({key,raw:root.localStorage.getItem(key)}))};}
   else if(path==='/api/ledger'||path.startsWith('/api/ledger?before=')){const before=path.includes('?')?Number(path.split('=')[1]):Number.MAX_SAFE_INTEGER;if(!Number.isSafeInteger(before)||before<1)throw Error('Invalid history page.');const t=transaction(),entries=[],q=t.objectStore('entries').openCursor(root.IDBKeyRange.upperBound(before,true),'prev');await new Promise((resolve,reject)=>{q.onerror=()=>reject(q.error);q.onsuccess=()=>{const c=q.result;if(!c||entries.length===31)return resolve();const v=c.value;entries.push({sequence:v.sequence||c.key,type:v.type,args:v.event?.args||{},created:v.created,name:v.name,day:v.day,location:v.location,credits:v.credits,fleet:v.fleet});c.continue();};});body={entries};}
   else if(/^\/api\/ledger\/[1-9]\d*$/.test(path)){const sequence=Number(path.split('/').at(-1)),t=transaction(),v=await request(t.objectStore('entries').get(sequence));if(!v)throw Error('That action is unavailable.');body={sequence,raw:await unpack(v)};}
   else {status=404;body={error:'Unknown game request.'};}
  }catch(e){status=503;body={error:e.message||'The action was not confirmed recorded.'};}return {ok:status>=200&&status<300,status,json:async()=>body};};
 }
 root.openBrowserVoyageLedger=openBrowserVoyageLedger;if(typeof module!=='undefined')module.exports={openBrowserVoyageLedger};
})(typeof window!=='undefined'?window:globalThis);
