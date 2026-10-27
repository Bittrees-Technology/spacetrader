import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import engine from '../../Browser/engine.js';
import {createAuth} from '../../Web/account/auth.mjs';
import {createStorage} from '../../Web/account/storage.mjs';
import {createApi} from '../../Web/account/api.mjs';
import {digest} from '../../Web/account/codec.mjs';

let db;
(async()=>{
 db=new PGlite();for(const file of ['schema.sql','migrations/002-voyage-library.sql','migrations/003-compact-journal.sql','migrations/004-efficient-saves.sql','migrations/005-batched-saves.sql'])await db.exec(await readFile('Web/account/'+file,'utf8'));
 await db.exec('SET search_path=pg_catalog,spacetrader,pg_temp');
 const sql=(strings,...values)=>db.query(strings.reduce((s,t,i)=>s+(i?'$'+i:'')+t,''),values).then(r=>r.rows),origin='http://localhost:9355',limit=16777216,total=134217728;
 const legacyAuth=createAuth({sql,origin}),login=await legacyAuth.establish('single-captain@example.invalid'),otherLogin=await legacyAuth.establish('other-captain@example.invalid');
 const req=(key,path='/api/account/status')=>new Request(origin+path,{headers:{cookie:'captain-session='+key}}),owner=(await legacyAuth.current(req(login.key))).account,other=(await legacyAuth.current(req(otherLogin.key))).account;
 const raw=name=>JSON.stringify(engine.transact(engine.fresh(),'create',{name,background:'trader',temperament:'measured'}));
 const oldStore=createStorage(sql,{parse:engine.parse,accountLimit:limit,totalLimit:total,compact:true,efficient:true});
 const a=await oldStore.createVoyage(owner,{raw:raw('Earlier charter'),operation:'earlier-charter'}),b=await oldStore.createVoyage(owner,{raw:raw('Current charter'),operation:'current-charter'}),aBefore=await oldStore.snapshot(owner,a.id,false),bBefore=await oldStore.snapshot(owner,b.id,false);
 const migration=await readFile('Web/account/migrations/006-single-active-voyage.sql','utf8');await db.exec(migration);await db.exec(migration);await db.exec('SET search_path=pg_catalog,spacetrader,pg_temp');
 const auth=createAuth({sql,origin,captainScope:true}),session=await auth.current(req(login.key)),captain=session.captainId;assert(captain);assert.equal(session.activeVoyage,b.id);assert.notEqual((await auth.current(req(otherLogin.key))).captainId,captain);
 const store=createStorage(sql,{parse:engine.parse,accountLimit:limit,totalLimit:total,compact:true,efficient:true,singleActive:true});
 const library=await store.library(owner);assert.equal(library.voyages.filter(v=>!v.readOnly).length,1);assert(library.voyages.find(v=>v.id===a.id).readOnly);assert.equal((await store.snapshot(owner,a.id,false)).raw,aBefore.raw);assert.equal((await store.snapshot(owner,b.id,false)).raw,bBefore.raw);
 const env={APP_ORIGIN:origin,SPACETRADER_ACCOUNTS_ENABLED:'1',SPACETRADER_SINGLE_ACTIVE_VOYAGE:'1',SPACETRADER_BATCH_SAVES:'1',SPACETRADER_EFFICIENT_SAVES:'1',SPACETRADER_EFFICIENT_READS:'1',SPACETRADER_ACCOUNT_STORAGE_BYTES:String(limit),SPACETRADER_TOTAL_STORAGE_BYTES:String(total)},api=createApi({sql,env,verifyWallet:async()=>false});
 async function call(path,body,header=null,key=login.key,account=owner){return api(new Request(origin+path,{method:body===undefined?'GET':'POST',headers:{cookie:'captain-session='+key,origin,'X-Spacetrader':'shared-save-v1','X-Spacetrader-Storage':'compact-v1','X-Spacetrader-Account':account,...(header?{'X-Spacetrader-Voyage':header}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})}));}
 const status=await(await call('/api/account/status')).json();assert.equal(status.captainId,captain);assert(status.singleActiveVoyage);
 assert.equal((await call('/api/voyages/new',{operation:'missing-confirmation',version:'test'})).status,428);
 assert.equal((await call('/api/voyages/new',{operation:'stale-confirmation',version:'test',restartFrom:b.id,revision:'stale'})).status,409);
 const restart={operation:'confirmed-restart',version:'test',restartFrom:b.id,revision:bBefore.revision},changed=await call('/api/voyages/new',restart);assert.equal(changed.status,200);const c=await changed.json();assert.equal(c.captainId,captain);assert.notEqual(c.id,b.id);assert.equal((await(await call('/api/voyages/new',restart)).json()).id,c.id,'A lost acknowledgement cannot create another voyage');
 assert.equal((await call('/api/voyage',undefined,b.id)).status,409);assert.equal((await call('/api/voyages/select',{id:b.id})).status,409);assert.equal((await call('/api/voyage/batch',{id:'stale-batch',parent:bBefore.revision,events:[]},b.id)).status,409);
 const archivedHistory=await call('/api/ledger',undefined,b.id);assert.equal(archivedHistory.status,200);const archivedInitial=(await archivedHistory.json()).entries.find(e=>e.sequence===1);assert.equal(archivedInitial.type,'new-voyage');assert(Number.isSafeInteger(archivedInitial.created)&&archivedInitial.created>946684800000,'Profile-created flag cannot overwrite the action timestamp');assert.equal((await call('/api/ledger',undefined,b.id,otherLogin.key,other)).status,404);
 assert.equal((await call('/api/import/start',{source:'blocked-import',total:1,hash:'a'.repeat(64)})).status,409);
 await assert.rejects(oldStore.append(owner,{key:'auto',raw:raw('Attempted archive write'),revision:bBefore.revision,action:{id:'archived-write',type:'rename-ship',args:{},version:'test'}},b.id),/voyage_archived/);
 await assert.rejects(sql`UPDATE spacetrader_voyages SET archived_at=NULL WHERE id=${b.id}::uuid`,/voyage_archived/);
 const afterArchive=await store.snapshot(owner,b.id,false);assert.equal(afterArchive.raw,bBefore.raw);assert.equal(afterArchive.sequence,bBefore.sequence);
 const current=await store.snapshot(owner,c.id,false),start=engine.transact(engine.parse(current.raw),'create',{name:'Restarted captain',background:'trader',temperament:'measured'});
 const posted=await call('/api/voyage',{key:'auto',raw:JSON.stringify(start),revision:current.revision,action:{id:'current-create',type:'create',args:{name:'Restarted captain'},version:'test'}},c.id);assert.equal(posted.status,200);
 const latest=await store.snapshot(owner,c.id,false);assert.equal(engine.parse(latest.raw).profile.name,'Restarted captain');
 assert.equal((await call('/api/voyages/new',{operation:'old-revision',version:'test',restartFrom:c.id,revision:current.revision})).status,409,'A newly saved action invalidates a stale restart');
 // A different login cannot steal a captain or archive the victim's voyage.
 assert.equal((await call('/api/voyages/new',{operation:'foreign-restart',version:'test',restartFrom:c.id,revision:latest.revision},null,otherLogin.key,other)).status,409);
 assert.equal((await call('/api/voyage',undefined,c.id,otherLogin.key,other)).status,409);
 await db.exec('CREATE ROLE spacetrader_runtime NOLOGIN');for(const f of ['runtime-grants.sql','migrations/002-voyage-library-grants.sql','migrations/003-compact-journal-grants.sql','migrations/004-efficient-saves-grants.sql','migrations/005-batched-saves-grants.sql','migrations/006-single-active-voyage-grants.sql'])await db.exec(await readFile('Web/account/'+f,'utf8'));
 await db.exec('SET ROLE spacetrader_runtime;SET search_path=pg_catalog,spacetrader,pg_temp');
 await assert.rejects(sql`UPDATE spacetrader_captains SET account_id=${other}::uuid WHERE id=${captain}::uuid`,/permission denied/);
 const final=await store.createVoyage(owner,{raw:raw('Third voyage'),operation:'restricted-restart',restartFrom:c.id,revision:latest.revision});assert.equal(final.captainId,captain);assert.equal((await store.library(owner)).voyages.filter(v=>!v.readOnly).length,1);
 assert.equal((await call('/api/voyages/new',restart)).status,409,'Old operation retries never reactivate an archived replacement');
 // Exercise the actual table grants, rather than only the guarded application RPCs.
 await assert.rejects(sql`INSERT INTO spacetrader_journal_chunks(voyage_id,first_sequence,last_sequence,digest,payload) VALUES(${c.id}::uuid,8000,8000,${'a'.repeat(64)},'blocked')`,/voyage_archived/);
 await assert.rejects(sql`UPDATE spacetrader_journal_chunks SET payload='blocked' WHERE voyage_id=${c.id}::uuid`,/voyage_archived/);
 await assert.rejects(sql`INSERT INTO spacetrader_entries(voyage_id,sequence,operation,digest,codec,payload,event,summary,created_ms) SELECT voyage_id,8000,'blocked-direct',digest,codec,payload,event,summary,created_ms FROM spacetrader_entries WHERE voyage_id=${b.id}::uuid LIMIT 1`,/voyage_archived/);
 // Empty-account imports may stage journal/checkpoint data before activation.
 const importRaw=raw('Transferred captain'),staged=await store.startImport(other,{source:'empty-account-import',total:1,hash:digest(importRaw)});
 await store.importBatch(other,{id:staged.id,records:[{key:'auto',raw:importRaw,revision:null,action:{id:'import-create',type:'create',args:{name:'Transferred captain'},version:'test'}}]});
 await store.finishImport(other,{id:staged.id,slots:{slot1:importRaw}});
 assert.equal((await store.library(other)).selected,staged.id);
 assert.equal((await store.snapshot(other,staged.id)).raw,importRaw);
 // A second abandoned import is frozen once any voyage becomes active.
 const pendingLogin=await auth.establish('pending-import@example.invalid'),pendingOwner=(await auth.current(req(pendingLogin.key))).account;
 const pending=await store.startImport(pendingOwner,{source:'pending-import',total:1,hash:digest(importRaw)});
 await store.createVoyage(pendingOwner,{raw:raw('New instead of import'),operation:'replace-pending',restartFrom:null,revision:null});
 await assert.rejects(sql`INSERT INTO spacetrader_journal_chunks(voyage_id,first_sequence,last_sequence,digest,payload) VALUES(${pending.id}::uuid,1,1,${'a'.repeat(64)},'blocked')`,/voyage_archived/);

 await db.exec('RESET ROLE');const sums=await sql`SELECT (SELECT sum(stored_bytes) FROM spacetrader_accounts) AS accounts,(SELECT bytes FROM spacetrader_storage_usage) AS total`;assert.equal(Number(sums[0].accounts),Number(sums[0].total));
 const result={passed:true,captainIdStableAcrossRestarts:true,legacyVoyagesPreserved:true,oneWritableVoyage:true,archiveWritesRejected:true,archiveReactivationRejected:true,staleRestartRejected:true,interruptedRestartIdempotent:true,crossAccountIsolation:true,guestImportCannotReplaceActive:true,restrictedRuntimeRestart:true,runtimeCannotRebindCaptains:true,directArchivedJournalWritesRejected:true,emptyAccountImportPreserved:true,abandonedImportFrozen:true,storageCountersConserved:true,migrationIdempotent:true};await mkdir('Research/SingleVoyage-2026-10-27',{recursive:true});await writeFile('Research/SingleVoyage-2026-10-27/backend-tests.json',JSON.stringify(result,null,2)+'\n');console.log('PASS '+JSON.stringify(result));
 await db.close();db=null;
})().catch(async e=>{await db?.close();console.error(String(e.stack||e).slice(0,5000));process.exitCode=1;});
