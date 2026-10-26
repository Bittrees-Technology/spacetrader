import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import engine from '../../Browser/engine.js';
import J from '../../Browser/journal-feed.js';
import {createStorage} from '../../Web/account/storage.mjs';
import {createAuth} from '../../Web/account/auth.mjs';
import {digest} from '../../Web/account/codec.mjs';
import {journalRecord,readChunk,expandRecord} from '../../Web/account/compact.mjs';
import {installJournalReader} from '../../Web/account/journal-reader.mjs';

let activeDatabase;
(async()=>{
 const db=activeDatabase=new PGlite();
 for(const file of ['schema.sql','migrations/002-voyage-library.sql','migrations/003-compact-journal.sql'])await db.exec(await readFile('Web/account/'+file,'utf8'));
 await db.exec('SET search_path=pg_catalog,spacetrader,pg_temp');
 const sql=(strings,...values)=>db.query(strings.reduce((out,text,index)=>out+(index?'$'+index:'')+text,''),values).then(r=>r.rows);
 const options={parse:engine.parse,accountLimit:16777216,totalLimit:134217728},saves=createStorage(sql,{...options,compact:true}),legacy=createStorage(sql,options);
 const auth=createAuth({sql,origin:'https://captain.bittrees.org'});
 const identity=await auth.establish('compact-test@example.org'),otherIdentity=await auth.establish('compact-other@example.org');
 const who=async value=>(await auth.current(new Request('https://captain.bittrees.org/api/account/status',{headers:{cookie:value.cookies[0].split(';')[0]}}))).account;
 const owner=await who(identity),other=await who(otherIdentity);
 let state=engine.fresh();
 const voyage=await saves.createVoyage(owner,{raw:JSON.stringify(state),operation:'compact-charter'});
 const id=voyage.id;let head=await saves.snapshot(owner,id),last,expectedRecords=[];
 const bytes=async()=>Number((await sql`SELECT stored_bytes FROM spacetrader_accounts WHERE id=${owner}`)[0].stored_bytes);
 for(let i=0;i<270;i++){
  const before=state,args=i===0?{name:'Compact journal QA',background:'trader',temperament:'measured'}:{id:state.flagshipID,name:'Journal ship '+i},type=i===0?'create':'rename-ship';
  state=engine.transact(state,type,args);
  const action={id:'compact-'+i,type,args,version:'0.72.257'},raw=JSON.stringify(state);
  last={key:'auto',raw,revision:head.revision,action};head=await saves.append(owner,last,id);
  expectedRecords.push(journalRecord({sequence:head.sequence,type,args,created:0,name:state.profile.name,day:state.day,location:state.location},state,before));
 }
 assert.equal(head.sequence,271);assert.equal(head.restoreActions,false);assert.equal(head.checkpointLimit,2);
 assert.equal((await sql`SELECT count(*)::int AS n FROM spacetrader_entries WHERE voyage_id=${id}`)[0].n,1,'No new world-state payloads accumulate per action');
 const chunkRows=await sql`SELECT * FROM spacetrader_journal_chunks WHERE voyage_id=${id} ORDER BY first_sequence`;
 assert.equal(chunkRows.length,3);assert.equal(chunkRows.flatMap(readChunk).length,270);
 const savedBeforeReplay=await bytes(),replayed=await saves.append(owner,last,id);assert.equal(replayed.revision,head.revision);assert.equal(await bytes(),savedBeforeReplay);
 await assert.rejects(saves.append(owner,{...last,action:{...last.action,args:{changed:true}}},id),/operation_reused/);
 await assert.rejects(saves.append(owner,{...last,action:{...last.action,id:'stale'},revision:'old'},id),e=>e.status===409);
 await assert.rejects(saves.recorded(owner,30,id),e=>e.status===410);assert.equal((await saves.recorded(owner,271,id)).raw,JSON.stringify(state));
 assert.equal((await saves.history(other,undefined,id)).length,0);await assert.rejects(saves.readCheckpoint(other,'slot1',id));
 const all=[];let before;
 do{const page=await saves.history(owner,before,id);const visible=page.slice(0,30);all.push(...visible);before=visible.at(-1)?.sequence;if(page.length<=30)break;}while(true);
 assert.equal(all.length,271);assert.equal(new Set(all.map(r=>r.sequence)).size,271);
 assert(all.filter(r=>r.sequence>1).every(r=>r.record?.feedRows.length>0));
 const lastRecord=all[0].record;assert.equal(lastRecord.type,'rename-ship');assert(lastRecord.feedRows.some(r=>/Journal ship 269/.test(r.fullText)));
 // The new reader consumes saved receipts, not thirty reconstructed world states.
 const reader={...J};installJournalReader(reader);let recordedCalls=0;
 const session={snapshot:head,history:b=>saves.history(owner,b??undefined,id),recorded:async n=>{recordedCalls++;return (await saves.recorded(owner,n,id)).raw;}};
 const page=await reader.readPage(session,null,{engine});assert.equal(page.records.length,30);assert.equal(recordedCalls,0);assert.equal(page.records[0].sequence,271);
 // Two bounded manual slots overwrite in place. A third new slot is rejected.
 await saves.checkpoint(owner,{key:'slot1',raw:head.raw,expected:null,revision:head.revision},id);
 await saves.checkpoint(owner,{key:'slot2',raw:head.raw,expected:null,revision:head.revision},id);
 await assert.rejects(saves.checkpoint(owner,{key:'slot3',raw:head.raw,expected:null,revision:head.revision},id),/two checkpoint slots|checkpoint_slot/);
 for(let i=0;i<10;i++){
  const raw=JSON.stringify({...state,credits:state.credits+i+1}),previous=(await saves.snapshot(owner,id)).slots.slot1;
  await saves.checkpoint(owner,{key:'slot1',raw,expected:previous,revision:head.revision},id);
 }
 assert.equal((await sql`SELECT count(*)::int AS n FROM spacetrader_snapshot_slots WHERE voyage_id=${id}`)[0].n,2);
 assert.equal((await sql`SELECT count(*)::int AS n FROM spacetrader_checkpoints WHERE voyage_id=${id}`)[0].n,0);
 assert.equal((await saves.library(owner)).voyages[0].checkpoints,2);assert.equal((await saves.library(owner)).voyages[0].name,'Compact journal QA');
 const quotaBefore=await saves.snapshot(owner,id),used=(await sql`SELECT bytes FROM spacetrader_storage_usage WHERE singleton`)[0].bytes;
 await sql`UPDATE spacetrader_storage_usage SET bytes=${options.totalLimit} WHERE singleton`;
 await assert.rejects(saves.append(owner,{...last,revision:head.revision,action:{...last.action,id:'quota-event'}},id),/storage_limit/);
 assert.equal((await saves.snapshot(owner,id)).revision,quotaBefore.revision);await sql`UPDATE spacetrader_storage_usage SET bytes=${used} WHERE singleton`;
 // Published legacy histories and third slots stay readable after the format switch.
 let oldState=engine.fresh();const oldVoyage=await legacy.createVoyage(owner,{raw:JSON.stringify(oldState),operation:'legacy-charter'});
 let old=await legacy.snapshot(owner,oldVoyage.id);
 oldState=engine.transact(oldState,'create',{name:'Preserved legacy',background:'trader',temperament:'measured'});
 old=await legacy.append(owner,{key:'auto',raw:JSON.stringify(oldState),revision:old.revision,action:{id:'old-create',type:'create',args:{},version:'test'}},oldVoyage.id);
 await legacy.checkpoint(owner,{key:'slot3',raw:old.raw,expected:null,revision:old.revision},oldVoyage.id);
 const oldBytes=(await sql`SELECT payload FROM spacetrader_entries WHERE voyage_id=${oldVoyage.id} ORDER BY sequence`).map(v=>v.payload);
 const newState=engine.transact(oldState,'rename-ship',{id:oldState.flagshipID,name:'Compact successor'});
 const switched=await saves.append(owner,{key:'auto',raw:JSON.stringify(newState),revision:old.revision,action:{id:'switch-format',type:'rename-ship',args:{},version:'test'}},oldVoyage.id);
 assert.equal((await saves.readCheckpoint(owner,'slot3',oldVoyage.id)).raw,old.raw);
 assert.equal((await legacy.recorded(owner,2,oldVoyage.id)).raw,old.raw);
 assert.deepEqual((await sql`SELECT payload FROM spacetrader_entries WHERE voyage_id=${oldVoyage.id} ORDER BY sequence`).map(v=>v.payload),oldBytes);
 assert.equal((await saves.history(owner,undefined,oldVoyage.id)).length,3);
 await assert.rejects(legacy.append(owner,{key:'auto',raw:switched.raw,revision:switched.revision,action:{id:'old-server-after-format-switch',type:'legacy-save',args:{},version:'test'}},oldVoyage.id),/compact_format_required/);assert.equal((await saves.snapshot(owner,oldVoyage.id)).revision,switched.revision,'Older server rollback cannot append a broken replay chain');
 // Whole device histories transfer into receipt chunks and retain their final state.
 const importing=await saves.startImport(other,{source:'compact-device',total:2,hash:digest(JSON.stringify(newState))});
 const progress=await saves.importBatch(other,{id:importing.id,records:[{key:'auto',raw:old.raw,revision:null,action:{id:'import-1',type:'create',args:{},version:'test'}}]});
 await saves.importBatch(other,{id:importing.id,records:[{key:'auto',raw:JSON.stringify(newState),revision:progress.revision,action:{id:'import-2',type:'rename-ship',args:{},version:'test'}}]});
 await saves.finishImport(other,{id:importing.id,slots:{slot1:old.raw,slot3:old.raw}});
 assert.equal((await saves.snapshot(other,importing.id)).raw,JSON.stringify(newState));assert.equal((await saves.history(other,undefined,importing.id)).length,2);
 assert.equal((await sql`SELECT count(*)::int AS n FROM spacetrader_entries WHERE voyage_id=${importing.id}`)[0].n,0);
 // Private restricted runtime can use the additive functions, not delete history.
 await db.exec('CREATE ROLE spacetrader_runtime NOLOGIN');
 for(const file of ['runtime-grants.sql','migrations/002-voyage-library-grants.sql','migrations/003-compact-journal-grants.sql'])await db.exec(await readFile('Web/account/'+file,'utf8'));
 await db.exec('SET ROLE spacetrader_runtime; SET search_path=pg_catalog,spacetrader,pg_temp');
 assert.equal((await saves.snapshot(owner,id)).sequence,271);
 await saves.checkpoint(owner,{key:'slot2',raw:null,expected:head.raw,revision:head.revision},id);
 await assert.rejects(db.query('DELETE FROM spacetrader.spacetrader_journal_chunks'),/permission denied/);
 await assert.rejects(db.query('CREATE TABLE public.not_allowed(n int)'),/permission denied/);
 await db.exec('RESET ROLE');
 const afterMigration=await saves.snapshot(owner,id);await db.exec(await readFile('Web/account/migrations/003-compact-journal.sql','utf8'));assert.deepEqual(await saves.snapshot(owner,id),afterMigration);
 await db.close();console.log('PASS compact saves: 270 actions in3chunks with no historical world payloads, complete paginated journal, no state fetches for new history, CAS/idempotency/quota atomicity,2bounded checkpoint slots, legacy third-slot/history preservation, full imports and restricted grants.');
})().catch(async error=>{await activeDatabase?.close();console.error(String(error.stack||error).slice(0,3000));process.exitCode=1;});
