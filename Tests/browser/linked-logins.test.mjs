import assert from 'node:assert/strict';
import{readFile,writeFile,mkdir}from'node:fs/promises';
import{PGlite}from'@electric-sql/pglite';
import{createSiweMessage}from'viem/siwe';
import engine from'../../Browser/engine.js';
import{createApi}from'../../Web/account/api.mjs';
import{createAuth}from'../../Web/account/auth.mjs';
import{createStorage}from'../../Web/account/storage.mjs';
import{digest}from'../../Web/account/codec.mjs';
let db;
(async()=>{
 db=new PGlite();for(const f of['schema.sql','migrations/002-voyage-library.sql','migrations/003-compact-journal.sql','migrations/004-efficient-saves.sql','migrations/005-batched-saves.sql','migrations/006-single-active-voyage.sql','migrations/007-linked-identities.sql'])await db.exec(await readFile('Web/account/'+f,'utf8'));
 await db.exec(await readFile('Web/account/migrations/007-linked-identities.sql','utf8'));await db.exec('SET search_path=pg_catalog,spacetrader,pg_temp');
 const sql=(strings,...values)=>db.query(strings.reduce((s,t,i)=>s+(i?'$'+i:'')+t,''),values).then(r=>r.rows).catch(e=>{if(!['voyage_archived','link_proof_required','operation_reused','link_conflict'].some(t=>e.message.includes(t)))console.error('SQL CHECK:',e.message,e.detail||'');throw e;}),origin='http://localhost:9356',limit=16777216,total=134217728,mails=[];
 const auth=createAuth({sql,origin,captainScope:true,linkedLogins:true}),store=createStorage(sql,{parse:engine.parse,accountLimit:limit,totalLimit:total,compact:true,efficient:true,singleActive:true,linkedLogins:true});
 const env={APP_ORIGIN:origin,SPACETRADER_ACCOUNTS_ENABLED:'1',SPACETRADER_SINGLE_ACTIVE_VOYAGE:'1',SPACETRADER_LINKED_LOGINS:'1',SPACETRADER_IDENTITY_SCHEMA:'1',SPACETRADER_BATCH_SAVES:'1',SPACETRADER_EFFICIENT_SAVES:'1',SPACETRADER_EFFICIENT_READS:'1',SPACETRADER_EMAIL_DAILY_LIMIT:'100',SPACETRADER_EMAIL_MONTHLY_LIMIT:'1000',SPACETRADER_ACCOUNT_STORAGE_BYTES:String(limit),SPACETRADER_TOTAL_STORAGE_BYTES:String(total)};
 const api=createApi({sql,env,verifyWallet:async p=>p.signature==='valid',sendMail:async(email,code,purpose)=>mails.push({email,code,purpose})});
 const request=(login,path,body,extra={})=>new Request(origin+path,{method:body===undefined?'GET':'POST',headers:{cookie:'captain-session='+login.key,origin,'X-Spacetrader':'shared-save-v1','X-Spacetrader-Storage':'compact-v1','X-Spacetrader-Account':login.account,...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const call=(login,action,body)=>api(request(login,'/api/account/link/'+action,body));
 async function login(identity){const l=await auth.establish(identity);return{...l,...await auth.current(request(l,'/api/account/status'))};}
 const raw=name=>JSON.stringify(engine.transact(engine.fresh(),'create',{name,background:'trader',temperament:'measured'}));
 async function voyage(l,name,previous=null){const head=previous?await store.snapshot(l.account,previous,false):null;return store.createVoyage(l.account,{raw:raw(name),operation:'voyage-'+crypto.randomUUID(),restartFrom:previous,revision:head?.revision||null});}
 async function prove(l,target){const start=await call(l,'start',{identity:target});assert.equal(start.status,200);const c=await start.json();assert(!c.current&&!c.other,'No account/game information before target proof');let body;
  if(target.includes('@')){assert.equal(mails.at(-1).purpose,'link');body={challenge:c.challenge,code:mails.at(-1).code};}
  else body={challenge:c.challenge,message:createSiweMessage({address:target,domain:c.domain,uri:c.uri,nonce:c.nonce,chainId:1,version:'1',issuedAt:new Date(),statement:c.statement}),signature:'valid'};
  const response=await call(l,'verify',body);assert.equal(response.status,200,JSON.stringify(await response.clone().json()));return{...c,review:await response.json(),proof:body};}
 const email=await login('link-one@example.invalid'),first=await voyage(email,'Email captain'),wallet='0x'+'1'.repeat(40);
 const proof=await prove(email,wallet);assert.equal(proof.review.other,null);assert.equal((await call(email,'commit',{challenge:proof.challenge,choice:'current',confirmDelete:false})).status,428);
 const linked=await call(email,'commit',{challenge:proof.challenge,choice:'current',confirmDelete:true});assert.equal(linked.status,200);assert.equal((await linked.json()).captainId,first.captainId);
 assert.equal(await auth.current(request(email,'/api/account/status')),null,'All prior app sessions are revoked');
 const e2=await login('link-one@example.invalid'),w2=await login(wallet);assert.equal(e2.account,w2.account);assert.equal(w2.identity,wallet,'SSO must attest the wallet actually proved, never the primary email');assert.equal(e2.identity,'link-one@example.invalid');assert.equal(w2.captainId,first.captainId);
 const pausedLinks=createApi({sql,env:{...env,SPACETRADER_LINKED_LOGINS:'0'},verifyWallet:async()=>false});const pausedStatus=await(await pausedLinks(request(w2,'/api/account/status'))).json();assert.equal(pausedStatus.label,wallet,'Disabling new links cannot turn wallet proof into email proof');assert.equal(pausedStatus.linkedLogins,false);
 const replay=await call(email,'commit',{challenge:proof.challenge,choice:'current',confirmDelete:true});assert.equal(replay.status,200,'Lost response replays only the same session-bound result');assert.equal((await call(email,'commit',{challenge:proof.challenge,choice:'other',confirmDelete:true})).status,503);
 // Two accounts, retained archives, and choosing the OTHER captain.
 const left=await login('link-left@example.invalid'),right=await login('0x'+'2'.repeat(40));
 const oldLeft=await voyage(left,'Left archive'),leftActive=await voyage(left,'Delete this voyage',oldLeft.id),rightActive=await voyage(right,'Keep wallet captain');
 const beforeGlobal=Number((await sql`SELECT bytes FROM spacetrader_storage_usage`).at(0).bytes),doomedBytes=Number((await sql`SELECT spacetrader_voyage_bytes(${leftActive.id}::uuid) AS n`).at(0).n);
 const cp=await prove(left,right.identity);assert.equal(cp.review.current.voyage,leftActive.id);assert.equal(cp.review.other.voyage,rightActive.id);
 const after=await call(left,'commit',{challenge:cp.challenge,choice:'other',confirmDelete:true});assert.equal(after.status,200,JSON.stringify(await after.clone().json()));const result=await after.json();assert.equal(result.captainId,rightActive.captainId);assert.equal(result.deletedVoyage,leftActive.id);
 assert.equal((await sql`SELECT id FROM spacetrader_voyages WHERE id=${leftActive.id}::uuid`).length,0);for(const table of['spacetrader_entries','spacetrader_checkpoints','spacetrader_journal_chunks','spacetrader_journal_archives','spacetrader_snapshot_slots','spacetrader_world_components'])assert.equal((await db.query('SELECT 1 FROM '+table+' WHERE voyage_id=$1',[leftActive.id])).rows.length,0);
 const nowLeft=await login('link-left@example.invalid');assert.equal(nowLeft.account,right.account);assert.equal(nowLeft.identity,'link-left@example.invalid');assert.equal(nowLeft.activeVoyage,rightActive.id);
 const lib=await store.library(right.account);assert(lib.voyages.some(v=>v.id===oldLeft.id&&v.readOnly));assert.equal(lib.voyages.filter(v=>!v.readOnly).length,1);
 assert.equal((await api(request(nowLeft,'/api/ledger',undefined,{'X-Spacetrader-Voyage':oldLeft.id}))).status,200,'Older merged archives stay readable');
 assert.equal(Number((await sql`SELECT bytes FROM spacetrader_storage_usage`).at(0).bytes),beforeGlobal-doomedBytes);
 // Changed progress invalidates confirmation; review again before deleting.
 const changing=await login('changing@example.invalid'),changingVoyage=await voyage(changing,'Changing captain'),other=await login('0x'+'3'.repeat(40));await voyage(other,'Other changing captain');const staged=await prove(changing,other.identity),current=await store.snapshot(changing.account,changingVoyage.id,false);
 await store.append(changing.account,{key:'auto',raw:raw('Newer name'),revision:current.revision,action:{id:'newer-action',type:'rename-ship',args:{},version:'test'}},changingVoyage.id);
 const conflict=await call(changing,'commit',{challenge:staged.challenge,choice:'current',confirmDelete:true});assert.equal(conflict.status,409);assert.equal((await sql`SELECT id FROM spacetrader_voyages WHERE id=${staged.review.other.voyage}::uuid`).length,1);
 // Current identity also needs recent proof; target proof never changes sign-in.
 const stale=await login('stale-link@example.invalid');await sql`UPDATE spacetrader_sessions SET authenticated_at=now()-interval '11 minutes' WHERE hash=${digest(stale.key)}`;assert.equal((await call(stale,'start',{identity:'0x'+'4'.repeat(40)})).status,428);
 const noProof=await login('no-proof@example.invalid'),pending=await call(noProof,'start',{identity:'0x'+'5'.repeat(40)}),p=await pending.json();assert.equal((await call(noProof,'review',{challenge:p.challenge})).status,401);assert.equal((await call(noProof,'commit',{challenge:p.challenge,choice:'current',confirmDelete:true})).status,401);
 assert.equal((await call(changing,'verify',staged.proof)).status,401,'Proof is single-use');

 // Wallet-to-email with two saved games, keeping the wallet captain.
 const walletFirst=await login('0x'+'6'.repeat(40)),emailSecond=await login('wallet-to-email@example.invalid'),walletKeep=await voyage(walletFirst,'Wallet keeper'),emailLose=await voyage(emailSecond,'Email discard');
 const emailProof=await prove(walletFirst,emailSecond.identity);assert.equal(mails.at(-1).purpose,'link');
 assert.equal((await call(walletFirst,'commit',{challenge:emailProof.challenge,choice:'current',confirmDelete:true})).status,200);
 assert.equal((await login(emailSecond.identity)).captainId,walletKeep.captainId);assert.equal((await sql`SELECT id FROM spacetrader_voyages WHERE id=${emailLose.id}::uuid`).length,0);
 // Neither another session nor an ordinary sign-in challenge may substitute for linking proof.
 const guarded=await login('guarded@example.invalid'),intruder=await login('intruder@example.invalid'),g=await(await call(guarded,'start',{identity:'0x'+'7'.repeat(40)})).json();
 assert.equal((await call(intruder,'verify',{challenge:g.challenge,message:'bad',signature:'valid'})).status,401);
 assert.equal((await call(guarded,'verify',{challenge:g.challenge,message:createSiweMessage({address:'0x'+'7'.repeat(40),domain:g.domain,uri:g.uri,nonce:g.nonce,chainId:1,version:'1',issuedAt:new Date(),statement:'Sign in to Spacetrader'}),signature:'valid'})).status,401);
 await sql`UPDATE spacetrader_link_challenges SET expires_at=now()-interval '1 second' WHERE hash=${digest(g.challenge)}`;
 assert.equal((await call(guarded,'verify',{challenge:g.challenge,message:'bad',signature:'valid'})).status,401);
 // A failed storage-limit check must leave both voyages and all aliases intact.
 const quota=await login('quota-link@example.invalid'),quotaOther=await login('0x'+'8'.repeat(40));await voyage(quota,'Quota keep');const quotaDoomed=await voyage(quotaOther,'Quota keep too'),qp=await prove(quota,quotaOther.identity);
 await sql`UPDATE spacetrader_accounts SET stored_bytes=${limit} WHERE id=${quota.account}::uuid`;await sql`UPDATE spacetrader_accounts SET stored_bytes=${limit} WHERE id=${quotaOther.account}::uuid`;
 // Re-review captures the latest accounting cursor, then combined archives exceed the cap.
 await call(quota,'review',{challenge:qp.challenge});assert.equal((await call(quota,'commit',{challenge:qp.challenge,choice:'current',confirmDelete:true})).status,507);assert.equal((await sql`SELECT id FROM spacetrader_voyages WHERE id=${quotaDoomed.id}::uuid`).length,1);
 // Restore synthetic counters after the quota probe without touching any payload.
 await sql`UPDATE spacetrader_accounts SET stored_bytes=spacetrader_voyage_bytes(active_voyage) WHERE id IN(${quota.account}::uuid,${quotaOther.account}::uuid)`;
 await sql`UPDATE spacetrader_storage_usage SET bytes=(SELECT sum(stored_bytes) FROM spacetrader_accounts)`;
 const restrictedSource=await login('restricted-link@example.invalid'),restrictedTarget='0x'+'9'.repeat(40);
 await db.exec('CREATE ROLE spacetrader_runtime NOLOGIN');for(const f of['runtime-grants.sql','migrations/002-voyage-library-grants.sql','migrations/003-compact-journal-grants.sql','migrations/004-efficient-saves-grants.sql','migrations/005-batched-saves-grants.sql','migrations/006-single-active-voyage-grants.sql','migrations/007-linked-identities-grants.sql'])await db.exec(await readFile('Web/account/'+f,'utf8'));
 await db.exec('SET ROLE spacetrader_runtime;SET search_path=pg_catalog,spacetrader,pg_temp');await assert.rejects(sql`UPDATE spacetrader_identities SET account_id=${right.account}::uuid`,/permission denied/);await assert.rejects(sql`UPDATE spacetrader_captains SET account_id=${right.account}::uuid`,/permission denied/);const rp=await prove(restrictedSource,restrictedTarget);assert.equal((await call(restrictedSource,'commit',{challenge:rp.challenge,choice:'current',confirmDelete:true})).status,200);await assert.rejects(sql`INSERT INTO spacetrader_link_deletions VALUES(gen_random_uuid(),txid_current())`,/permission denied/);await db.exec('RESET ROLE');
 const sums=await sql`SELECT(SELECT sum(stored_bytes) FROM spacetrader_accounts) AS accounts,(SELECT bytes FROM spacetrader_storage_usage) AS total`;assert.equal(Number(sums[0].accounts),Number(sums[0].total));
 const receipt={passed:true,bothDirections:true,proofBeforeDisclosure:true,freshSourceProof:true,targetProofSingleUse:true,actualLoginIdentityPreserved:true,linkKillSwitchPreservesIdentityProof:true,explicitDeletionConfirmation:true,chosenCaptainUnchanged:true,losingActiveVoyagePhysicallyDeleted:true,olderArchivesPreserved:true,staleReviewRejected:true,retryIdempotent:true,sessionsRevoked:true,countersConserved:true,restrictedRuntimeLinking:true,sourceSessionBinding:true,wrongPurposeRejected:true,quotaRollback:true};await mkdir('Research/LinkedLogins-2026-10-27',{recursive:true});await writeFile('Research/LinkedLogins-2026-10-27/backend.json',JSON.stringify(receipt,null,2)+'\n');console.log('PASS '+JSON.stringify(receipt));
 await db.close();db=null;
})().catch(async e=>{await db?.close();console.error(String(e.stack||e).slice(0,5000));process.exitCode=1;});
