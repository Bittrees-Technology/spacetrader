'use strict';
const assert=require('node:assert/strict'),{installBrowserSaveSafety}=require('../../Web/browser-save-safety');
const snapshot=(raw,sequence=1)=>({raw,sequence,revision:raw?'R:'+sequence:null,ledger:true,slots:{}});
function fixture({head=snapshot('{"name":"latest"}'),history=[],backup=null,quota=false,persisted=false,grant=true,readFailure=false,newerHeadOnWrite=false}={}){
 let current=head,stored=backup,permissionCalls=0;const writes=[],legacyWrites=[],reads=[],preserved=[];
 const legacy={read:key=>key==='auto'?stored:null,backups:()=>[],backup:raw=>preserved.push(raw),write(key,raw,preserve){assert.equal(key,'auto');assert.equal(preserve,false);if(quota)throw Error('QuotaExceededError');legacyWrites.push(raw);stored=raw;}};
 const host={Heliocline:{parse:JSON.parse},crypto:{randomUUID:()=>String(writes.length+1)},navigator:{storage:{persisted:async()=>persisted,persist:async()=>{permissionCalls++;return grant;}},locks:{request:async(_,job)=>job()}},
  openBrowserVoyageLedger:async options=>{
   assert.equal(options.legacy.read('auto'),null,'reconcile durable history before legacy import');
   return async(path,init={})=>{
    reads.push(path);let body,status=200;
    if(readFailure)return {ok:false,status:503,json:async()=>({error:'database unreadable'})};
    if(init.method==='POST'){
     const next=JSON.parse(init.body);if(next.revision!==current.revision){status=409;body={...current,error:'newer save'};}
     else{writes.push(next);current=snapshot(next.raw,current.sequence+1);body=current;if(newerHeadOnWrite)current=snapshot('{"name":"other tab newest"}',current.sequence+1);}
    }else if(path==='/api/ledger')body={entries:history.map((r,i)=>({sequence:i+1})).reverse()};
    else if(path.startsWith('/api/ledger/'))body={raw:history[Number(path.split('/').at(-1))-1]};
    else if(path==='/api/voyage?since='+current.revision)body={revision:current.revision,sequence:current.sequence,unchanged:true};
    else body=current;
    return {ok:status===200,status,json:async()=>body};
   };
  }};
 const safety=installBrowserSaveSafety(host);
 return {host,legacy,safety,writes,legacyWrites,reads,preserved,stored:()=>stored,current:()=>current,permissionCalls:()=>permissionCalls};
}
(async()=>{
 let f=fixture({backup:'{"name":"old"}'}),request=await f.host.openBrowserVoyageLedger({legacy:f.legacy,version:'test'});
 assert.equal(f.stored(),f.current().raw);assert.equal(f.writes.length,0,'opening a healthy save never restores old data');assert.deepEqual(f.preserved,['{"name":"old"}']);
 let response=await request('/api/voyage',{method:'POST',body:JSON.stringify({raw:'{"name":"new"}',revision:f.current().revision})});
 assert(response.ok);assert.equal(f.stored(),'{"name":"new"}');assert(f.reads.some(p=>p.startsWith('/api/voyage?since=')));
 assert.equal(f.preserved.length,1,'normal actions replace one current copy without accumulating backups');
 const confirmedCopy=f.stored();
 await request('/api/ledger/1');assert.equal(f.stored(),confirmedCopy,'reading earlier progress does not replace the current recovery copy');
 response=await request('/api/voyage',{method:'POST',body:JSON.stringify({raw:'{"name":"rejected"}',revision:'stale'})});
 assert.equal(response.status,409);assert.equal(f.stored(),confirmedCopy,'rejected actions do not enter the recovery copy');
 f=fixture({newerHeadOnWrite:true});request=await f.host.openBrowserVoyageLedger({legacy:f.legacy});
 await request('/api/voyage',{method:'POST',body:JSON.stringify({raw:'{"name":"older response"}',revision:f.current().revision})});assert.equal(f.stored(),'{"name":"other tab newest"}');
 f=fixture({head:snapshot(null,0),backup:'{"name":"recovered"}'});request=await f.host.openBrowserVoyageLedger({legacy:f.legacy,version:'test'});
 assert.equal(f.current().raw,'{"name":"recovered"}');assert.equal(f.writes[0].action.type,'restore');assert.equal(f.safety.health.recovered,'copy');
 f=fixture({head:snapshot(null,0),history:['{"name":"first"}','{"name":"newest"}'],backup:'{"name":"older"}'});
 await f.host.openBrowserVoyageLedger({legacy:f.legacy,version:'test'});assert.equal(f.current().raw,'{"name":"newest"}');assert.equal(f.safety.health.recovered,'history');
 f=fixture({head:snapshot(null,0),backup:'damaged backup'});await assert.rejects(f.host.openBrowserVoyageLedger({legacy:f.legacy}),SyntaxError);assert.equal(f.stored(),'damaged backup');assert.equal(f.writes.length,0);
 f=fixture({quota:true});request=await f.host.openBrowserVoyageLedger({legacy:f.legacy});
 response=await request('/api/voyage',{method:'POST',body:JSON.stringify({raw:'{"name":"committed"}',revision:f.current().revision})});assert(response.ok);assert.equal(f.current().raw,'{"name":"committed"}');assert.equal(f.safety.health.copy,'unavailable');
 f=fixture({readFailure:true,backup:'{"name":"keep"}'});await assert.rejects(f.host.openBrowserVoyageLedger({legacy:f.legacy}),/unreadable/);assert.equal(f.writes.length,0);assert.equal(f.stored(),'{"name":"keep"}');
 f=fixture({grant:false});assert.equal(await f.safety.requestProtection(),'standard');await f.safety.requestProtection();assert.equal(f.permissionCalls(),1);
 f=fixture({persisted:true});assert.equal(await f.safety.requestProtection(),'granted');assert.equal(f.permissionCalls(),0);
 console.log('PASS browser save safety: verified current copy, history-first recovery, damaged/read-failure preservation, nonfatal backup quota failure, one bounded persistence request.');
})().catch(e=>{console.error(e);process.exit(1)});
