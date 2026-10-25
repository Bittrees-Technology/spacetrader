'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),E=require('../../Browser/engine'),{createSharedVoyageClient}=require('../../Browser/shared-save');
const source=fs.readFileSync('Browser/app.js','utf8'),queue=source.slice(source.indexOf('let actionQueue='),source.indexOf('async function sharedCheckpoint'));
let count=0;const test=async(name,f)=>{await f();count++;console.log('PASS '+name);};
async function fixture({fail=false,conflict=false,lost=false}={}){
 const initial=E.parse(fs.readFileSync('Build/ActionLedgerQA/voyage.json','utf8')),writes=[],receipts=new Map();let server={revision:'0',raw:JSON.stringify(initial),ledger:true,slots:{},sequence:0},attempts=0;
 const c=createSharedVoyageClient(async(path,options)=>{
  if(!options.method)return {ok:true,status:200,json:async()=>server};
  const body=JSON.parse(options.body);attempts++;await new Promise(r=>setTimeout(r,2));
  if(fail)return {ok:false,status:503,json:async()=>({error:'full disk'})};
  if(conflict){const next=E.clone(initial);next.location='moon';next.visited.push('moon');server={...server,revision:'newer',raw:JSON.stringify(next)};return {ok:false,status:409,json:async()=>({...server,error:'Newer progress'})};}
  if(receipts.has(body.action.id))return {ok:true,status:200,json:async()=>server};
  assert.equal(body.revision,server.revision);assert.equal(body.action.version,'0.68.0');server={...server,revision:String(server.sequence+1),sequence:server.sequence+1,raw:body.raw};writes.push(body);receipts.set(body.action.id,body.raw);
  if(lost&&writes.length===1)throw Error('lost reply');return {ok:true,status:200,json:async()=>server};
 });await c.read();const messages=[],context={E,crypto:crypto.webcrypto,window:{spacetraderStandalone:false},GAME_VERSION:'0.68.0',state:E.clone(initial),sharedSession:c,sharedPollPending:null,sharedBusy:false,saveState:'recorded',toast:m=>messages.push(m),updateSaveLabel:()=>{},sharedSlots:()=>{},ensureSharedWatchers:()=>{},sharedBackups:new Map(),saveFeedback:'',saveFeedbackError:false};
 vm.runInNewContext(queue+`\nfunction applyAction(type,args,next){state=next;saveState='recorded';return true;}
 function acceptShared(value){state=E.parse(value.raw);actionEpoch++;sharedSession.adopt(value);saveState='recorded';}
 async function sharedFailure(error){if(error.snapshot)acceptShared(error.snapshot);else saveState='Save failed';}
 function publishLoaded(next){state=next;actionEpoch++;saveState='recorded';}
 this.actions={sharedAction,sharedLoad,finished:()=>actionQueue};`,context);
 return {context,c,writes,messages,attempts:()=>attempts,initial};
}
(async()=>{
 await test('rapid clicks serialize every valid action instead of dropping busy clicks',async()=>{const f=await fixture(),before=E.fleetQuantity(f.context.state,'water');const result=await Promise.all(Array.from({length:8},()=>f.context.actions.sharedAction('buy',{good:'water',units:1})));assert(result.every(Boolean));assert.equal(f.writes.length,8);assert.equal(new Set(f.writes.map(w=>w.action.id)).size,8);assert.equal(E.fleetQuantity(f.context.state,'water'),before+8);assert.equal(f.c.snapshot.sequence,8);});
 await test('a rejected gameplay selection does not mark storage failed or block the next action',async()=>{const f=await fixture();assert.equal(await f.context.actions.sharedAction('buy',{good:'water',units:999999}),false);assert.equal(f.context.saveState,'recorded');assert.equal(await f.context.actions.sharedAction('buy',{good:'water',units:1}),true);assert.equal(f.writes.length,1);});
 await test('one lost reply retries the identical resolved outcome and operation ID exactly once',async()=>{const f=await fixture({lost:true});assert.equal(await f.context.actions.sharedAction('buy',{good:'water',units:1}),true);assert.equal(f.attempts(),2);assert.equal(f.writes.length,1);assert.equal(f.context.state.seed,JSON.parse(f.writes[0].raw).seed);});
 await test('a real storage failure stops subsequent queued changes at the last committed state',async()=>{const f=await fixture({fail:true}),before=JSON.stringify(f.context.state);const r=await Promise.all([1,2].map(()=>f.context.actions.sharedAction('buy',{good:'water',units:1})));assert(r.every(v=>!v));assert.equal(f.attempts(),1);assert.equal(JSON.stringify(f.context.state),before);assert.match(f.context.saveState,/Save failed/);});
 await test('a newer voyage cancels queued choices made in the old station context',async()=>{const f=await fixture({conflict:true});const r=await Promise.all([1,2].map(()=>f.context.actions.sharedAction('buy',{good:'water',units:1})));assert(r.every(v=>!v));assert.equal(f.attempts(),1);assert.equal(f.context.state.location,'moon');});
 await test('restore and gameplay share one queue and cancel old-context selections',async()=>{const f=await fixture(),buy=f.context.actions.sharedAction('buy',{good:'water',units:1}),restore=f.context.actions.sharedLoad(JSON.stringify(f.initial),'Recorded action',{sequence:1}),old=f.context.actions.sharedAction('buy',{good:'water',units:1});assert.deepEqual(await Promise.all([buy,restore,old]),[true,true,false]);assert.equal(f.writes.length,2);assert.equal(f.writes[1].action.type,'restore');assert.equal(f.writes[1].action.args.sequence,1);assert.deepEqual(JSON.parse(f.c.snapshot.raw),f.initial);});
 await test('history listing and selected outcome reads never write or advance the transport cursor',async()=>{const paths=[],c=createSharedVoyageClient(async(path,options)=>{assert.equal(options.method,undefined);paths.push(path);return {ok:true,status:200,json:async()=>path==='/api/voyage'?{revision:'R'}:path.includes('/api/ledger/')?{raw:'recorded'}:{entries:[{sequence:3}]}};});await c.read();assert.equal((await c.history(4))[0].sequence,3);assert.equal(await c.recorded(3),'recorded');assert.equal(c.snapshot.revision,'R');assert.deepEqual(paths,['/api/voyage','/api/ledger?before=4','/api/ledger/3']);});
 console.log(count+' action-ledger client/queue scenarios passed.');
})().catch(e=>{console.error(e);process.exit(1)});
