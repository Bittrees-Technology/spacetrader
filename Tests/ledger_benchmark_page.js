'use strict';
document.getElementById('run').onclick=async()=>{
 const output=document.getElementById('results'),button=document.getElementById('run');button.disabled=true;output.textContent='Measuring…';let running=true,previous=performance.now(),gaps=[];
 const frame=now=>{gaps.push(now-previous);previous=now;if(running)requestAnimationFrame(frame);};requestAnimationFrame(frame);
 try{
 const browserOnly=new URLSearchParams(location.search).get('mode')==='browser',request=browserOnly?await openBrowserVoyageLedger({key:'spacetrader.benchmark-ledger.v1',version:'0.68.0'}):(...args)=>fetch(...args),client=createSharedVoyageClient(request);
 await client.read();let state=await(await fetch('/benchmark-fixture')).json();const event=(type,args={})=>({id:crypto.randomUUID(),type,args,version:'0.68.0',source:'browser'});
 await client.write('auto',JSON.stringify(state),true,event('benchmark-start'));
 const durations=[],base=[];
 for(let i=0;i<100;i++){const type=i%2?'sell':'buy',args={good:'water',units:1},t=performance.now();const next=Heliocline.transact(state,type,args),raw=JSON.stringify(next);base.push(performance.now()-t);const started=performance.now();await client.write('auto',raw,false,event(type,args));durations.push(performance.now()-started);state=next;if(i%20===19)output.textContent='Recorded '+(i+1)+' / 100 actions';}
 const expected=JSON.stringify(state);await client.read();if(client.snapshot.raw!==expected)throw Error('Latest recorded outcome differs from live state.');
 const history=await client.history();if(history.length!==31)throw Error('History pagination failed.');
 const stats=a=>{const s=[...a].sort((a,b)=>a-b);return {medianMs:+s[Math.floor(s.length*.5)].toFixed(2),p95Ms:+s[Math.floor(s.length*.95)].toFixed(2),maximumMs:+s.at(-1).toFixed(2)};};
 const result={mode:browserOnly?'browser IndexedDB':'shared local HTTP ledger',ships:state.fleet.length+1,actions:100,stateBytes:new TextEncoder().encode(expected).length,engineAndSerialization:stats(base),durableRecording:stats(durations),observedFrameIntervals:stats(gaps.length?gaps:[0]),frames:gaps.length,frameGapsOver50ms:gaps.filter(n=>n>50).length,latestOutcomeExact:true,historyPaged:true};
 output.textContent=JSON.stringify(result,null,2);output.dataset.complete='true';
 }catch(e){output.textContent='ERROR: '+e.message;output.dataset.failed='true';}finally{running=false;button.disabled=false;}
};

document.getElementById('safety').onclick=async()=>{
 const output=document.getElementById('safetyResults');output.textContent='Checking…';const passed=[];const check=(ok,text)=>{if(!ok)throw Error(text);passed.push(text);};
 try{
  const original=JSON.stringify(await(await fetch('/benchmark-fixture')).json()),key='spacetrader.safety-'+crypto.randomUUID(),legacy={read:k=>k==='auto'?original:null,backups:()=>[]};
  const a=createSharedVoyageClient(await openBrowserVoyageLedger({key,legacy,version:'0.68.0'})),b=createSharedVoyageClient(await openBrowserVoyageLedger({key,legacy,version:'0.68.0'}));await a.read();await b.read();check(a.snapshot.sequence===1&&a.snapshot.raw===original,'Legacy browser outcome imported exactly once');
  let next=JSON.parse(original);next.credits--;const raw=JSON.stringify(next),event={id:crypto.randomUUID(),type:'buy',args:{good:'water',units:1},source:'browser',version:'0.68.0'};await a.write('auto',raw,false,event);
  let conflict=false;try{await b.write('auto',original,false,{...event,id:crypto.randomUUID()});}catch(e){conflict=e.snapshot?.sequence===2;}check(conflict,'Stale browser tab cannot replace a newer entry');
  await a.write('auto',raw,false,event);check(a.snapshot.sequence===2,'Lost-response retry does not duplicate an action');
  const transaction=IDBDatabase.prototype.transaction;
  IDBDatabase.prototype.transaction=function(...args){const tx=transaction.apply(this,args);if(args[1]==='readwrite')queueMicrotask(()=>{try{tx.abort();}catch{}});return tx;};
  let failed=false;try{await a.write('auto',original,false,{...event,id:crypto.randomUUID()});}catch{failed=true;}finally{IDBDatabase.prototype.transaction=transaction;}
  await a.read();check(failed&&a.snapshot.sequence===2&&a.snapshot.raw===raw,'Aborted transaction leaves latest committed state unchanged');
  const put=IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put=function(...args){if(this.name==='meta')throw new DOMException('Simulated write failure','QuotaExceededError');return put.apply(this,args);};
  failed=false;try{await a.write('auto',original,false,{...event,id:crypto.randomUUID()});}catch{failed=true;}finally{IDBObjectStore.prototype.put=put;}
  await a.read(true);check(failed&&a.snapshot.sequence===2&&(await a.history()).length===2,'Failure between entry and head update rolls back both');
  await a.write('auto',original,true,{id:crypto.randomUUID(),type:'restore',args:{sequence:1},source:'browser',version:'0.68.0'});check(a.snapshot.sequence===3&&a.snapshot.raw===original&&(await a.recorded(2))===raw,'Restoring an earlier point preserves later action history');
  check(legacy.read('auto')===original,'Original legacy progress remains unchanged');output.textContent=passed.map(p=>'PASS '+p).join('\n');output.dataset.complete='true';
 }catch(e){output.textContent=passed.join('\n')+'\nERROR: '+e.message;output.dataset.failed='true';}
};
