import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createAuth} from '../../Web/account/auth.mjs';
import {createStorage} from '../../Web/account/storage.mjs';
import {createApi} from '../../Web/account/api.mjs';
import {createBatchStorage} from '../../Web/account/batch-store.mjs';
import {digest} from '../../Web/account/codec.mjs';
import {splitState} from '../../Web/account/state-parts.mjs';
import {stateDelta} from '../../Web/account/state-delta.mjs';
import E from '../../Browser/engine.js';
import economy from '../../Browser/market-economy.js';
(async()=>{
 const db=new PGlite(),schema=['schema.sql',...['002-voyage-library','003-compact-journal','004-efficient-saves','005-batched-saves','006-single-active-voyage','007-linked-identities'].map(n=>'migrations/'+n+'.sql')];
 try{
 for(const f of schema)await db.exec(await readFile('Web/account/'+f,'utf8'));await db.exec('SET search_path=pg_catalog,spacetrader,pg_temp');
 const sql=(strings,...v)=>db.query(strings.reduce((s,t,i)=>s+(i?'$'+i:'')+t,''),v).then(r=>r.rows),origin='http://localhost:9382',limit=16777216,total=134217728,auth=createAuth({sql,origin,captainScope:true,linkedLogins:true}),opts={parse:E.parse,accountLimit:limit,totalLimit:total,compact:true,efficient:true,singleActive:true,linkedLogins:true},legacy=createStorage(sql,opts);
 let serial=0;const raw=name=>JSON.stringify(E.transact(E.fresh(),'create',{name,background:'trader',temperament:'measured'}));
 async function login(name){const l=await auth.establish(name+'@example.invalid'),s=await auth.current(new Request(origin+'/api/account/status',{headers:{cookie:'captain-session='+l.key}}));return{...s,login:l};}
 async function start(store,l,name,prior=null){const h=prior?await store.snapshot(l.account,prior,false):null;return store.createVoyage(l.account,{raw:raw(name),operation:'score-new-'+(++serial),restartFrom:prior,revision:h?.revision||null});}
 const a=await login('legacy-score'),first=await start(legacy,a,'First captain'),firstHead=await legacy.snapshot(a.account,first.id,false),expected=E.financialOverview(E.parse(firstHead.raw)).netWorth,second=await start(legacy,a,'Current captain',first.id),activeBefore=await legacy.snapshot(a.account,second.id,false),b=await login('other-score');await start(legacy,b,'Other captain');
 const migration=await readFile('Web/account/migrations/008-score-archives.sql','utf8');await db.exec(migration);await db.exec(migration);await db.exec('SET search_path=pg_catalog,spacetrader,pg_temp');
 const store=createStorage(sql,{...opts,scoreArchives:true,netWorth:s=>E.financialOverview(s).netWorth}),batch=createBatchStorage(sql,{parse:E.parse,accountLimit:limit,totalLimit:total});
 await assert.rejects(sql`SELECT spacetrader_retire_voyage(${b.account}::uuid,${first.id}::uuid,${firstHead.revision},${expected})`,/voyage_missing/);
 await assert.rejects(sql`SELECT spacetrader_retire_voyage(${a.account}::uuid,${second.id}::uuid,${activeBefore.revision},${expected})`,/retirement_conflict/);
 await sql`SELECT spacetrader_retire_voyage(${a.account}::uuid,${first.id}::uuid,${firstHead.revision},${expected})`;
 assert.equal((await store.snapshot(a.account,second.id,false)).raw,activeBefore.raw);
 let lib=await store.library(a.account);assert.equal(lib.voyages.length,1);assert.equal(lib.scores[0].netWorth,expected);assert.equal(lib.scores[0].id,first.id);assert.equal((await sql`SELECT id FROM spacetrader_voyages WHERE id=${first.id}::uuid`).length,0);
 assert((await sql`SELECT spacetrader_retire_voyage(${a.account}::uuid,${first.id}::uuid,${firstHead.revision},${expected}) AS r`)[0].r.replayed);
 let state=E.parse(activeBefore.raw),head=activeBefore,part=splitState(head.raw);
 // Exercise hot journal blocks, compressed archives, a retained checkpoint and a world component.
 for(let n=0;n<34;n++){
  const events=[];for(let i=0;i<32;i++){state=E.transact(state,'rename-ship',{id:state.flagshipID,name:'Fleet '+n+' '+i});const raw=JSON.stringify(state),next=splitState(raw);events.push({action:{id:'score-action-'+n+'-'+i,type:'rename-ship',args:{id:state.flagshipID,name:'Fleet '+n+' '+i},version:'score-test'},created:Date.now(),rawHash:digest(raw),patch:stateDelta(part.core,next.core),component:next.component===null?null:digest(next.component),...(next.component!==part.component&&next.component!==null?{part:next.component}:{})});part=next;}
  head={...head,...await batch.append(a.account,second.id,{id:'score-batch-'+n,parent:head.revision,events}),raw:JSON.stringify(state)};
 }
 state.exchangeStock=economy.createNetwork(state.day);for(const route of economy.routes)for(let due=state.day;due<=state.day+route.lead;due++)state.exchangeStock.transit.push({route:route.id,due,units:Math.PI});economy.compactNetwork(state.exchangeStock);state=E.transact(state,'wait');head=await store.append(a.account,{key:'auto',raw:JSON.stringify(state),revision:head.revision,action:{id:'score-world',type:'wait',args:{},version:'test'}},second.id);
 await legacy.checkpoint(a.account,{key:'slot1',raw:head.raw,revision:head.revision,expected:null},second.id);
 for(const table of ['spacetrader_entries','spacetrader_snapshot_slots','spacetrader_journal_chunks','spacetrader_journal_archives','spacetrader_world_components'])assert((await db.query('SELECT count(*)::int n FROM '+table+' WHERE voyage_id=$1',[second.id])).rows[0].n>0,table);
 const beforeBytes=Number((await sql`SELECT stored_bytes FROM spacetrader_accounts WHERE id=${a.account}`).at(0).stored_bytes),worth=E.financialOverview(E.parse(head.raw)).netWorth,op='atomic-score-restart',request={raw:raw('Replacement'),operation:op,restartFrom:second.id,revision:head.revision};
 const badStore=createStorage(sql,{...opts,scoreArchives:true,netWorth:()=>NaN});await assert.rejects(badStore.createVoyage(a.account,request),/Final net worth/);assert.equal((await store.snapshot(a.account,second.id,false)).raw,head.raw);
 const actualGlobal=Number((await sql`SELECT bytes FROM spacetrader_storage_usage`).at(0).bytes),oldBytes=Number((await sql`SELECT spacetrader_voyage_bytes(${second.id}::uuid) AS n`).at(0).n);
 await sql`UPDATE spacetrader_storage_usage SET bytes=${total+oldBytes}`;await assert.rejects(store.createVoyage(a.account,request),/storage_limit/);assert.equal((await store.snapshot(a.account,second.id,false)).raw,head.raw);assert.equal((await store.library(a.account)).scores.length,1);await sql`UPDATE spacetrader_storage_usage SET bytes=${actualGlobal}`;
 const replacement=await store.createVoyage(a.account,request);assert.equal(replacement.captainId,second.captainId);assert.equal((await store.createVoyage(a.account,request)).id,replacement.id);lib=await store.library(a.account);assert.equal(lib.voyages.length,1);assert.equal(lib.scores.length,2);assert.equal(lib.scores.find(s=>s.id===second.id).netWorth,worth);
 for(const table of ['spacetrader_entries','spacetrader_checkpoints','spacetrader_snapshot_slots','spacetrader_journal_chunks','spacetrader_journal_archives','spacetrader_world_components'])assert.equal((await db.query('SELECT 1 FROM '+table+' WHERE voyage_id=$1',[second.id])).rows.length,0,table);
 assert.equal((await sql`SELECT id FROM spacetrader_voyages WHERE id=${second.id}::uuid`).length,0);assert(Number((await sql`SELECT stored_bytes FROM spacetrader_accounts WHERE id=${a.account}`).at(0).stored_bytes)<beforeBytes);
 await assert.rejects(store.createVoyage(a.account,{...request,operation:'stale-restart'}),/changed/);
 const env={APP_ORIGIN:origin,SPACETRADER_ACCOUNTS_ENABLED:'1',SPACETRADER_IDENTITY_SCHEMA:'1',SPACETRADER_LINKED_LOGINS:'1',SPACETRADER_SCORE_ARCHIVES:'1',SPACETRADER_EFFICIENT_READS:'1',SPACETRADER_EFFICIENT_SAVES:'1',SPACETRADER_BATCH_SAVES:'1',SPACETRADER_ACCOUNT_STORAGE_BYTES:String(limit),SPACETRADER_TOTAL_STORAGE_BYTES:String(total)},api=createApi({env,sql,verifyWallet:async()=>false});
 const requestApi=(who,path,voyage,body)=>api(new Request(origin+path,{method:body?'POST':'GET',headers:{Origin:origin,cookie:'captain-session='+who.login.key,'X-Spacetrader':'shared-save-v1','X-Spacetrader-Storage':'compact-v1','X-Spacetrader-Account':who.account,...(voyage?{'X-Spacetrader-Voyage':voyage}:{})},...(body?{body:JSON.stringify(body)}:{})}));
 assert.equal((await requestApi(a,'/api/ledger',second.id)).status,410);assert.equal((await requestApi(b,'/api/ledger',second.id)).status,404);assert.equal((await requestApi(a,'/api/voyage',second.id)).status,409);assert.equal((await(await requestApi(a,'/api/voyages')).json()).voyages.length,1);
 const legacyApi=createApi({env:{...env,SPACETRADER_SCORE_ARCHIVES:'0'},sql,verifyWallet:async()=>false}),current=await store.snapshot(a.account,replacement.id,false);const oldResponse=await legacyApi(new Request(origin+'/api/voyages/new',{method:'POST',headers:{Origin:origin,cookie:'captain-session='+a.login.key,'X-Spacetrader':'shared-save-v1','X-Spacetrader-Account':a.account},body:JSON.stringify({operation:'old-writer',restartFrom:replacement.id,revision:current.revision})}));assert.equal(oldResponse.status,409);
 // Scores remain accessible after the same ownership merge used by email/Ethereum linking.
 const archivedOwner=await login('merged-scores'),ma=await start(store,archivedOwner,'Merged old'),mb=await start(store,archivedOwner,'Merged active',ma.id);
 // Use actual linking proof and commit; the unchosen active voyage receives no score.
 const wallet='0x'+'3'.repeat(40),walletLogin=await auth.establish(wallet),walletSession=await auth.current(new Request(origin+'/api/account/status',{headers:{cookie:'captain-session='+walletLogin.key}}));
 await start(store,{account:walletSession.account},'Chosen wallet');const source={...archivedOwner,login:archivedOwner.login},startResponse=await requestApi(source,'/api/account/link/start',null,{identity:wallet}),challenge=(await startResponse.json()).challenge;
 await sql`UPDATE spacetrader_link_challenges SET verified_at=now() WHERE hash=${digest(challenge)}`;
 assert.equal((await requestApi(source,'/api/account/link/review',null,{challenge})).status,200);
 const linked=await requestApi(source,'/api/account/link/commit',null,{challenge,choice:'other',confirmDelete:true});assert.equal(linked.status,200);assert.equal((await store.library(walletSession.account)).scores.length,1);assert.equal((await sql`SELECT id FROM spacetrader_voyages WHERE id=${mb.id}::uuid`).length,0);
 // Multi-page score ordering is stable and never includes old game payloads.
 let cursor=replacement.id;for(let i=0;i<22;i++){const next=await start(store,a,'Score '+i,cursor);cursor=next.id;}
 const page1=await store.library(a.account),page2=await store.library(a.account,page1.next);assert.equal(page1.scores.length,20);assert(page1.next);assert.equal(new Set([...page1.scores,...page2.scores].map(s=>s.id)).size,24);assert.equal(page1.voyages.length,1);
 // Per-account bytes equal active/staging payloads plus bounded 512-byte scores,
 // including the immutable ownership relation used after account linking.
 const check=await sql`SELECT a.id,a.stored_bytes,coalesce((SELECT sum(spacetrader_voyage_bytes(v.id)) FROM spacetrader_voyages v JOIN spacetrader_accounts x ON x.id=v.account_id WHERE x.id=a.id OR x.merged_into=a.id),0)+512*(SELECT count(*) FROM spacetrader_voyage_scores s JOIN spacetrader_accounts x ON x.id=s.account_id WHERE x.id=a.id OR x.merged_into=a.id) AS calculated FROM spacetrader_accounts a WHERE merged_into IS NULL`;
 check.forEach(r=>assert.equal(Number(r.stored_bytes),Number(r.calculated)));assert.equal(Number((await sql`SELECT bytes FROM spacetrader_storage_usage`).at(0).bytes),check.reduce((n,r)=>n+Number(r.stored_bytes),0));
 await db.exec('CREATE ROLE spacetrader_runtime NOLOGIN');for(const f of ['runtime-grants.sql',...['002-voyage-library','003-compact-journal','004-efficient-saves','005-batched-saves','006-single-active-voyage','007-linked-identities','008-score-archives'].map(n=>'migrations/'+n+'-grants.sql')])await db.exec(await readFile('Web/account/'+f,'utf8'));await db.exec('SET ROLE spacetrader_runtime;SET search_path=pg_catalog,spacetrader,pg_temp');
 const last=await start(store,a,'Restricted restart',cursor);assert(last.id);await assert.rejects(db.query('DELETE FROM spacetrader_voyage_scores'),/permission denied/);await assert.rejects(db.query('INSERT INTO spacetrader_link_deletions VALUES($1,txid_current())',[last.id]),/permission denied/);await assert.rejects(db.query('DELETE FROM spacetrader_entries WHERE voyage_id=$1',[last.id]),/permission denied|append-only/);await assert.rejects(sql`SELECT spacetrader_retire_voyage(${a.account}::uuid,${last.id}::uuid,${(await store.snapshot(a.account,last.id,false)).revision},${1})`,/retirement_conflict/);await db.exec('RESET ROLE');
 const receipt={passed:true,serverCalculatedFinalWorth:true,oneFullActiveVoyage:true,oldPayloadsPhysicallyDeleted:true,journalsCheckpointsComponentsDeleted:true,legacyArchivesConverted:true,activeStateUnchangedByConversion:true,restartAtomicQuotaRollback:true,retryIdempotent:true,staleDeviceRejected:true,crossAccountScoresPrivate:true,linkedAccountScoresPreserved:true,oldWriterCannotRetainArchive:true,scorePagination:true,countersExact:true,restrictedRuntimeVerified:true,migrationIdempotent:true};await mkdir('Research/ScoreArchives-2026-10-27',{recursive:true});await writeFile('Research/ScoreArchives-2026-10-27/backend.json',JSON.stringify(receipt,null,2)+'\n');console.log('PASS '+JSON.stringify(receipt));
 }finally{await db.close();}
})().catch(e=>{console.error(String(e.stack||e).slice(0,5000));process.exitCode=1;});
