import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createStorage} from '../../Web/account/storage.mjs';
import {createApi} from '../../Web/account/api.mjs';
import {createSyncTransport} from '../../Web/account/sync-transport.mjs';
import {createAuth} from '../../Web/account/auth.mjs';
import engine from '../../Browser/engine.js';
import economy from '../../Browser/market-economy.js';
import {encodeArchive,decodeArchive,ARCHIVE_BYTES} from '../../Web/account/archive-codec.mjs';
import {componentPack,componentRead,statePack,createEfficient,readArchive} from '../../Web/account/efficient.mjs';
import {digest} from '../../Web/account/codec.mjs';
let db;
(async()=>{
 const rows=Array.from({length:8192},(_,i)=>JSON.parse('{"a":["trade",{"name":"旅 🪐 café"}],"r":{"sequence":'+(i+1)+',"float":'+(i*.125-12.375)+'},"at":'+(1793000000000+i*1733)+',"__proto__":{"safe":true},"constructor":"own"}'));
 const encoded=encodeArchive(rows);assert.equal(JSON.stringify(decodeArchive(encoded)),JSON.stringify(rows));
 for(const start of [0,30,4081,8161])assert.deepEqual(decodeArchive(encoded,start,31),rows.slice(start,start+31));
 const malformed=[{...encoded,o:[9999]}, {...encoded,g:[{...encoded.g[0],n:8191}]}, {v:3,o:[0],g:[{n:1,t:[2,['duplicate',0],['duplicate',0]],c:[[0,1],[0,2]]}]}, {v:3,o:[0,0],g:[{n:2,t:0,c:[[1,Number.MAX_SAFE_INTEGER,[1]]]}]}, {v:3,o:Array(8192).fill(0),g:[{n:8192,t:0,c:[[0,'x'.repeat(4000)]]}]}];
 for(const value of malformed)assert.throws(()=>decodeArchive(value));assert.equal({}.safe,undefined);
 // Varied nested receipts protect non-trading dialogue/quest/battle layouts.
 let seed=711;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function varied(depth=0){const choice=depth>4?0:Math.floor(random()*4);if(choice===1)return Array.from({length:Math.floor(random()*4)},()=>varied(depth+1));if(choice===2){const value={};for(let i=0;i<Math.floor(random()*4);i++)Object.defineProperty(value,['__proto__','constructor','note','outcome'][i],{value:varied(depth+1),enumerable:true});return value;}return [null,true,false,'独特 🪐 dialogue '+Math.floor(random()*50),random()*1e9,Math.floor(random()*100000)-50000][Math.floor(random()*6)];}
 for(let block=0;block<8;block++){const values=Array.from({length:256},(_,i)=>({r:{sequence:block*256+i+1},event:['dialogue','freight','battle','crew','relic','loan'][i%6],data:varied()}));const value=encodeArchive(values);assert.equal(JSON.stringify(decodeArchive(value)),JSON.stringify(values));assert.deepEqual(decodeArchive(value,117,31),values.slice(117,148));}
 for(const value of ['D1:'+Buffer.from('exact bytes').toString('base64'),'R1:'+Buffer.from('other bytes').toString('base64'),'legacy non-base64 🪐',''])assert.equal(componentRead({...componentPack(value),digest:digest(value)}),value);
 db=new PGlite();for(const file of ['schema.sql','migrations/002-voyage-library.sql','migrations/003-compact-journal.sql','migrations/004-efficient-saves.sql'])await db.exec(await readFile('Web/account/'+file,'utf8'));
 await db.exec('SET search_path=pg_catalog,spacetrader,pg_temp');
 const sql=(strings,...values)=>db.query(strings.reduce((out,text,index)=>out+(index?'$'+index:'')+text,''),values).then(r=>r.rows);
 const opts={parse:engine.parse,accountLimit:16777216,totalLimit:134217728,compact:true},saves=createStorage(sql,{...opts,efficient:true}),old=createStorage(sql,opts),parts=createEfficient(sql);
 const auth=createAuth({sql,origin:'https://captain.bittrees.org'});
 const ids=[],cookies=[];for(const email of ['efficient@example.org','other-efficient@example.org']){const identity=await auth.establish(email);cookies.push(identity.cookies[0].split(';')[0]);ids.push((await auth.current(new Request('https://captain.bittrees.org/api/account/status',{headers:{cookie:identity.cookies[0].split(';')[0]}}))).account);}
 const [owner,other]=ids;
 let state=engine.transact(engine.fresh(),'create',{name:'Efficient QA',background:'trader',temperament:'measured'});state.credits=500000000;
 state.exchangeStock=economy.createNetwork(0);for(const route of economy.routes)for(let due=0;due<=route.lead;due++)state.exchangeStock.transit.push({route:route.id,due,units:Math.PI});economy.compactNetwork(state.exchangeStock);engine.parse(JSON.stringify(state));
 const voyage=await saves.createVoyage(owner,{raw:JSON.stringify(state),operation:'efficient-new'}),id=voyage.id;
 let head=await saves.snapshot(owner,id),last;
 const usage=async()=>Number((await sql`SELECT stored_bytes FROM spacetrader_accounts WHERE id=${owner}`)[0].stored_bytes);
 const baseline=await usage();
 for(let i=0;i<1050;i++){
  const type='rename-ship',args={id:state.flagshipID,name:'Exact ship '+i};
  state=engine.transact(state,type,args);last={key:'auto',raw:JSON.stringify(state),revision:head.revision,action:{id:'efficient-'+i,type,args,version:'test'}};
  head=await saves.append(owner,last,id);
 }
 assert.equal(head.sequence,1051);assert.equal((await saves.snapshot(owner,id)).raw,JSON.stringify(state));
 assert.equal((await sql`SELECT count(*)::int AS n FROM spacetrader_world_components WHERE voyage_id=${id}`)[0].n,1);
 const archives=await sql`SELECT * FROM spacetrader_journal_archives WHERE voyage_id=${id}`;assert.equal(archives.length,1);assert.equal(readArchive(archives[0]).length,1024);
 assert.throws(()=>readArchive({...archives[0],payload_digest:'0'.repeat(64)}));
 const history=[];let before;
 do{const page=await saves.history(owner,before,id);history.push(...page.slice(0,30));before=page.slice(0,30).at(-1)?.sequence;if(page.length<=30)break;}while(true);
 assert.equal(history.length,1051);assert.equal(new Set(history.map(r=>r.sequence)).size,1051);assert.equal(history[0].record.feedRows.some(f=>f.fullText?.includes('Exact ship 1049')),true);
 assert.equal((await saves.history(other,undefined,id)).length,0);await assert.rejects(saves.selected(other,id));assert.equal(await parts.maintain(other,id),false);
 const used=await usage();assert.equal((await saves.append(owner,last,id)).revision,head.revision);assert.equal(await usage(),used);
 await assert.rejects(saves.append(owner,{...last,revision:'old',action:{...last.action,id:'stale'}},id),e=>e.status===409);
 await assert.rejects(saves.append(owner,{...last,action:{...last.action,args:{other:true}}},id),/operation_reused/);
 await assert.rejects(old.append(owner,{...last,revision:head.revision,action:{...last.action,id:'old-writer'}},id),/efficient_format_required/);
 await saves.checkpoint(owner,{key:'slot1',raw:head.raw,expected:null,revision:head.revision},id);
 await saves.checkpoint(owner,{key:'slot2',raw:head.raw,expected:null,revision:head.revision},id);
 assert.equal((await saves.readCheckpoint(owner,'slot1',id)).raw,head.raw);
 assert.equal((await saves.library(owner)).voyages[0].checkpoints,2);
 await assert.rejects(old.checkpoint(owner,{key:'slot1',raw:JSON.stringify({...state,credits:999}),expected:head.raw,revision:head.revision},id),/efficient_format_required/);
 await assert.rejects(saves.checkpoint(owner,{key:'slot3',raw:head.raw,expected:null,revision:head.revision},id));
 // Advancing the economy changes the component; checkpoint references retain the old frame.
 let next=engine.transact(state,'wait',{days:1});
 const advanced={key:'auto',raw:JSON.stringify(next),revision:head.revision,action:{id:'wait-new-component',type:'wait',args:{days:1},version:'test'}};head=await saves.append(owner,advanced,id);
 assert.equal((await sql`SELECT count(*)::int AS n FROM spacetrader_world_components WHERE voyage_id=${id}`)[0].n,2);
 assert.equal((await saves.snapshot(owner,id)).slots.slot1,JSON.stringify(state));
 for(const key of ['slot1','slot2'])await saves.checkpoint(owner,{key,raw:null,expected:JSON.stringify(state),revision:head.revision},id);
 assert.equal((await sql`SELECT count(*)::int AS n FROM spacetrader_world_components WHERE voyage_id=${id}`)[0].n,1,'Only unreferenced components collected');
 const beforeQuota=await saves.snapshot(owner,id),usageBefore=await usage(),global=Number((await sql`SELECT bytes FROM spacetrader_storage_usage WHERE singleton`)[0].bytes);
 await sql`UPDATE spacetrader_storage_usage SET bytes=${opts.totalLimit} WHERE singleton`;
 next=engine.transact(next,'wait',{days:2});await assert.rejects(saves.append(owner,{key:'auto',raw:JSON.stringify(next),revision:head.revision,action:{id:'quota',type:'wait',args:{days:2},version:'test'}},id),/storage_limit/);
 assert.deepEqual(await saves.snapshot(owner,id),beforeQuota);assert.equal(await usage(),usageBefore);assert.equal((await sql`SELECT count(*)::int AS n FROM spacetrader_world_components WHERE voyage_id=${id}`)[0].n,1);await sql`UPDATE spacetrader_storage_usage SET bytes=${global} WHERE singleton`;
 // Reinstall is additive/idempotent, reader rollback retains exact binary heads.
 await db.exec(await readFile('Web/account/migrations/004-efficient-saves.sql','utf8'));assert.equal((await old.snapshot(owner,id)).raw,beforeQuota.raw);
 const another=await old.createVoyage(other,{raw:JSON.stringify(engine.fresh()),operation:'old-charter'});assert((await saves.snapshot(other,another.id)).raw);
 await assert.rejects(parts.append(other,last,id,last.action,digest(JSON.stringify(last.action)),{}, {first:1,last:1,previous:null,hash:'x',payload:'x'},opts.accountLimit,opts.totalLimit,false),/voyage_missing/);
 // The actual authenticated API and browser adapter use small, owner-scoped messages.
 const env={APP_ORIGIN:'https://captain.bittrees.org',SPACETRADER_ACCOUNTS_ENABLED:'1',SPACETRADER_ACCOUNT_STORAGE_BYTES:String(opts.accountLimit),SPACETRADER_TOTAL_STORAGE_BYTES:String(opts.totalLimit),SPACETRADER_EFFICIENT_READS:'1',SPACETRADER_EFFICIENT_SAVES:'1'};
 const api=createApi({env,sql,verifyWallet:async()=>false}),queued=new Map(),sent=[];
 const outbox={get:async(o,v)=>queued.get(o+v)||null,put:async(o,v,body)=>{const key=o+v,prior=queued.get(key);if(prior&&JSON.stringify(prior.body)!==JSON.stringify(body))throw Error('Pending action exists');queued.set(key,{body:structuredClone(body),status:'pending'});},clear:async(o,v)=>{queued.delete(o+v);},hold:async(o,v)=>{queued.get(o+v).status='conflict';}};
 let failBefore=false,failAfter=false,conflicts=0;
 const send=async(path,options={})=>{sent.push({path,body:options.body?JSON.parse(options.body):null});if(failBefore){failBefore=false;throw Error('Disconnected before request');}const r=await api(new Request(env.APP_ORIGIN+path,{...options,headers:{...options.headers,origin:env.APP_ORIGIN,cookie:cookies[0]}}));if(failAfter){failAfter=false;throw Error('Connection lost after commit');}return r;};
 const transport=()=>createSyncTransport({fetch:send,owner,voyage:id,outbox,hash:async s=>digest(s),onConflict:()=>{conflicts++;}});
 let device=transport(),loaded=await (await device('/api/voyage')).json();assert.equal(loaded.raw,beforeQuota.raw);
 const write=async(t,prior,name)=>{const s=engine.transact(engine.parse(prior.raw),'rename-ship',{id:state.flagshipID,name}),body={key:'auto',raw:JSON.stringify(s),revision:prior.revision,action:{id:name,type:'rename-ship',args:{id:state.flagshipID,name},version:'test'}};return t('/api/voyage',{method:'POST',headers:{'Content-Type':'application/json','X-Spacetrader':'shared-save-v1'},body:JSON.stringify(body)});};
 loaded=await (await write(device,loaded,'wire-first')).json();assert.equal(sent.at(-1).body.raw,undefined);assert.equal(sent.at(-1).body.state.part,undefined,'Confirmed unchanged component is not uploaded again');assert.equal(queued.size,0);
 const seq=loaded.sequence;failAfter=true;await assert.rejects(write(device,loaded,'lost-response'),/lost/);assert.equal(queued.size,1);
 device=transport();loaded=await (await device('/api/voyage')).json();assert.equal(loaded.sequence,seq+1);assert.equal(queued.size,0,'Tab-close retry acknowledged without a second action');
 failBefore=true;await assert.rejects(write(device,loaded,'not-received'),/Disconnected/);device=transport();loaded=await (await device('/api/voyage')).json();assert.equal(loaded.sequence,seq+2);assert.equal(queued.size,0,'Unsent durable action recovers after reopening');
 const stale=loaded;loaded=await (await write(device,loaded,'device-one')).json();const rejected=await write(device,stale,'device-two-stale');assert.equal(rejected.status,409);assert.equal(queued.values().next().value.status,'conflict');assert(conflicts>0);device=transport();assert.equal((await (await device('/api/voyage')).json()).revision,loaded.revision);await outbox.clear(owner,id);
 const tampered=await send('/api/voyage',{method:'POST',headers:{'X-Spacetrader':'shared-save-v1','X-Spacetrader-Account':owner,'X-Spacetrader-Voyage':id,'X-Spacetrader-Storage':'compact-v1'},body:JSON.stringify({state:{core:'{}',component:'0'.repeat(64),part:'wrong'},rawHash:'0'.repeat(64)})});assert.equal(tampered.status,400);assert.equal((await saves.snapshot(owner,id)).revision,loaded.revision);
 await db.exec('CREATE ROLE spacetrader_runtime NOLOGIN');for(const file of ['runtime-grants.sql','migrations/002-voyage-library-grants.sql','migrations/003-compact-journal-grants.sql','migrations/004-efficient-saves-grants.sql'])await db.exec(await readFile('Web/account/'+file,'utf8'));
 await db.exec('SET ROLE spacetrader_runtime;SET search_path=pg_catalog,spacetrader,pg_temp');assert.equal((await saves.snapshot(owner,id)).raw,loaded.raw);
 for(const table of ['spacetrader_world_components','spacetrader_journal_archives','spacetrader_journal_chunks'])await assert.rejects(db.query('DELETE FROM spacetrader.'+table),/permission denied/);
 await saves.checkpoint(owner,{key:'slot1',raw:loaded.raw,expected:null,revision:loaded.revision},id);
 assert.equal((await saves.readCheckpoint(owner,'slot1',id)).raw,loaded.raw);
 await db.exec('RESET ROLE');await db.close();db=null;
 console.log('PASS efficient saves: exact8192-row columnar/Unicode/numeric/prototype pagination; malformed/expansion bounds;1050 engine actions; verified archive replacement; full history; binary heads/checkpoints; component reuse/GC; owner isolation; stale/retry/old-writer rejection; atomic quota rollback; legacy reads; actual API/wire reuse; lost response/reopen recovery; unsent retry; conflicting devices; tamper rejection; restricted grants.');
})().catch(async e=>{await db?.close();console.error(String(e.stack||e).slice(0,3500));process.exitCode=1;});
