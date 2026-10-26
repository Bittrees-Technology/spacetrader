'use strict';
// Public browser saves only. No server calls or player-data uploads.
(function(root){
 function installBrowserSaveSafety(host){
  const original=host.openBrowserVoyageLedger;
  if(typeof original!=='function')throw Error('The browser save ledger is unavailable.');
  const health={copy:'pending',protection:'checking',recovered:''};
  const storage=host.navigator?.storage;
  let protectionRequest=null,localQueue=Promise.resolve();
  function exclusive(job){
   if(host.navigator?.locks?.request)return host.navigator.locks.request('spacetrader-browser-recovery',job);
   const next=localQueue.then(job,job);localQueue=next.catch(()=>{});return next;
  }
  function renderHealth(){
   const copy=health.copy==='current'?'Current recovery copy saved on this device.':health.copy==='unavailable'?'Extra recovery copy unavailable; the action ledger remains the primary save.':'Checking the local recovery copy…';
   const protection={checking:'Checking browser storage protection…',granted:'Protection against automatic browser cleanup is enabled.',standard:'The browser has not granted protection against automatic cleanup.',unsupported:'This browser does not expose storage-protection controls.'}[health.protection];
   const recovery=health.recovered==='copy'?'<p>Recovered the latest voyage from the local copy. Earlier action history was unavailable.</p>':health.recovered==='history'?'<p>Recovered the latest recorded voyage; action history is retained.</p>':'';
   return '<details class="browser-save-health" id="browser-save-health"><summary>Browser save storage</summary><p>'+copy+'</p><p>'+protection+'</p>'+recovery+'<p>These saves stay in this browser on this device. Clearing its site data removes local saves.</p></details>';
  }
  function refreshHealth(){
   const el=host.document?.getElementById('browser-save-health');
   if(el){const open=el.open;el.outerHTML=renderHealth();host.document.getElementById('browser-save-health').open=open;}
  }
  async function checkProtection(){
   let result;
   try{result=!storage?.persisted?'unsupported':await storage.persisted()?'granted':'standard';}
   catch{result='unsupported';}
   if(!protectionRequest)health.protection=result;
   refreshHealth();
  }
  function requestProtection(){
   if(protectionRequest)return protectionRequest;
   protectionRequest=(async()=>{
    try{
     if(!storage?.persisted)health.protection='unsupported';
     else{
      const granted=await storage.persisted()||(storage.persist&&await storage.persist());
      health.protection=granted?'granted':'standard';
     }
    }
    catch{health.protection='standard';}
    refreshHealth();return health.protection;
   })();return protectionRequest;
  }
  host.spacetraderSaveHealthHTML=renderHealth;
  host.document?.addEventListener('click',event=>{
   if(event.isTrusted&&event.target?.closest?.('#app button,#modal button'))void requestProtection();
  },{capture:true,passive:true});
  void checkProtection();
  host.openBrowserVoyageLedger=async function(options={}){
   const legacy=options.legacy;
   // Reconcile the history before importing a recovery copy; never overwrite a valid head.
   const request=await original({...options,legacy:legacy?{...legacy,read:key=>key==='auto'?null:legacy.read(key)}:undefined});
   let initialCopy=true,priorCopyPreserved=false;
   async function call(path,init){const response=await request(path,init),body=await response.json();if(!response.ok)throw Error(body.error||'Browser save could not be read.');return body;}
   async function mirrorLatest(candidate){
    if(!legacy?.write){health.copy='unavailable';return;}
    try{
     await exclusive(async()=>{
      const current=await call('/api/voyage'+(candidate?.revision?'?since='+candidate.revision:''));
      const latest=current.unchanged?candidate:current;
      if(!latest.raw)return;
      host.Heliocline.parse(latest.raw);
      const previous=legacy.read('auto');
      if(initialCopy&&previous&&previous!==latest.raw&&!priorCopyPreserved){
       if(!legacy.backup)throw Error('The earlier browser save could not be preserved.');
       legacy.backup(previous);priorCopyPreserved=true;
      }
      if(legacy.read('auto')!==latest.raw)legacy.write('auto',latest.raw,false);
      if(legacy.read('auto')!==latest.raw)throw Error('Recovery copy could not be verified.');
      health.copy='current';initialCopy=false;
     });
    }catch{health.copy='unavailable';}
    refreshHealth();
   }
   await exclusive(async()=>{
    const current=await call('/api/voyage');if(current.raw)return;
    const history=await call('/api/ledger');let raw=null,from='';
    if(history.entries?.length){
     raw=(await call('/api/ledger/'+history.entries[0].sequence)).raw;from='history';
    }else{raw=legacy?.read('auto')||null;from='copy';}
    if(!raw)return;
    // Invalid/unreadable recovery data fails closed, preserving it for inspection.
    host.Heliocline.parse(raw);
    const id=host.crypto.randomUUID();
    await call('/api/voyage',{method:'POST',body:JSON.stringify({key:'auto',raw,revision:current.revision,preserve:true,action:{id,type:'restore',args:{label:'Recovered latest browser save',recoveredFrom:from},source:'browser',version:options.version||'unknown'}})});
    health.recovered=from;
   });
   await mirrorLatest();
   return async function(path,init={}){
    const response=await request(path,init);
    const body=await response.json();
    if(response.ok&&(init.method||'GET')==='POST'&&path==='/api/voyage')await mirrorLatest(body);
    return {ok:response.ok,status:response.status,json:async()=>body};
   };
  };
  return {health,requestProtection};
 }
 if(typeof module!=='undefined')module.exports={installBrowserSaveSafety};
 if(root.document&&root.openBrowserVoyageLedger)installBrowserSaveSafety(root);
})(typeof window==='undefined'?globalThis:window);
