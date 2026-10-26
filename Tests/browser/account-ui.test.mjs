import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,readdir} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import {homedir} from 'node:os';
import {PGlite} from '@electric-sql/pglite';
import {chromium} from 'playwright-core';
import {verifyMessage} from 'viem';
import {parseSiweMessage} from 'viem/siwe';
import {createApi} from '../../Web/account/api.mjs';
import {createStorage} from '../../Web/account/storage.mjs';
import engine from '../../Browser/engine.js';
import combatFixture from './combat-v2-balance.cjs';

(async()=>{
const database=new PGlite();await database.exec(await readFile('Web/account/schema.sql','utf8'));await database.exec(await readFile('Web/account/migrations/002-voyage-library.sql','utf8'));await database.exec(await readFile('Web/account/migrations/003-compact-journal.sql','utf8'));await database.exec('SET search_path=pg_catalog,spacetrader,pg_temp');
const sql=(strings,...values)=>database.query(strings.reduce((out,text,index)=>out+(index?'$'+index:'')+text,''),values).then(result=>result.rows);
const staticRoot=resolve('Web/.vercel/output/static'),codes=[];let api,origin;
const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json','.txt':'text/plain'};
const server=createServer(async(req,res)=>{
 try{
  if(req.url.startsWith('/api/')){
   const parts=[];let bytes=0;for await(const part of req){bytes+=part.length;if(bytes>4_200_000)throw Error('Too large');parts.push(part);}
   const response=await api(new Request(origin+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(parts)}:{})}));
   res.statusCode=response.status;for(const [key,value] of response.headers)if(key!=='set-cookie')res.setHeader(key,value);
   res.setHeader('Set-Cookie',response.headers.getSetCookie());res.end(await response.text());return;
  }
  let path=new URL(req.url,origin).pathname;if(path.endsWith('/'))path+='index.html';
  if(['/goods/curves','/goods/formulas','/goods/mechanics'].includes(path))path+='.html';
  const file=resolve(staticRoot,'.'+decodeURIComponent(path));if(!file.startsWith(staticRoot+'/'))throw Error('Invalid path');
  const data=await readFile(file);res.setHeader('Content-Type',type[extname(file)]||'application/octet-stream');res.end(data);
 }catch{res.statusCode=404;res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;
api=createApi({env:{APP_ORIGIN:origin,SPACETRADER_ACCOUNTS_ENABLED:'1',SPACETRADER_ACCOUNT_STORAGE_BYTES:'16777216',SPACETRADER_TOTAL_STORAGE_BYTES:'134217728',SPACETRADER_EMAIL_DAILY_LIMIT:'20',SPACETRADER_EMAIL_MONTHLY_LIMIT:'500'},sql,sendMail:async(email,code)=>codes.push({email,code}),verifyWallet:({message,signature})=>verifyMessage({message,signature,address:parseSiweMessage(message).address})});
const cache=join(homedir(),'Library/Caches/ms-playwright'),installations=(await readdir(cache)).filter(name=>name.startsWith('chromium_headless_shell-')).sort().reverse();
assert(installations.length,'Existing Chromium headless installation required; no browser download started.');
const browser=await chromium.launch({headless:true,executablePath:join(cache,installations[0],'chrome-headless-shell-mac-arm64/chrome-headless-shell')});
const output=resolve('Research/AccountSaves-2026-10-26');await mkdir(output,{recursive:true});
const errors=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 await page.goto(origin+'/play/');await page.getByRole('navigation',{name:'Game menu',exact:true}).waitFor();
 assert.equal(await page.locator('#character-form').count(),0);assert.equal(await page.locator('.game-shell').count(),0);
 for(const [name,width,height] of [['phone',390,844],['ipad-portrait',768,1024],['ipad-landscape',1024,680],['desktop',1440,900]]){
  await page.setViewportSize({width,height});await page.waitForFunction(()=>{const r=document.querySelector('#modal').getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;});
  assert(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth),'Entry menu fits the viewport');
  if(name==='phone'||name==='desktop')await page.screenshot({path:join(output,'menu-'+name+'.png')});
 }
 await page.getByRole('button',{name:'New charter',exact:false}).click();await page.locator('#captain-name').waitFor();assert.equal(await page.locator('#captain-name').inputValue(),'');
 await page.getByRole('button',{name:'Back to menu',exact:true}).click();await page.getByRole('navigation',{name:'Game menu',exact:true}).waitFor();
 await page.getByRole('button',{name:'New charter',exact:false}).click();await page.locator('#captain-name').fill('Persistence QA');await page.locator('#character-form').evaluate(form=>form.requestSubmit());
 await page.waitForFunction(()=>typeof state!=='undefined'&&state?.profile.created);
 assert(await page.evaluate(()=>sharedCheckpoint('slot2',JSON.stringify(state))));
 assert(await page.evaluate(()=>sharedCheckpoint('slot3',JSON.stringify(state))));
 await page.evaluate(()=>{closeModal(true);SpacetraderAccount.open();});
 await page.getByLabel('Email address',{exact:true}).waitFor();
 for(const [name,width,height] of [['phone',390,844],['ipad-portrait',768,1024],['ipad-landscape',1024,680],['desktop',1440,900]]){
  await page.setViewportSize({width,height});
  const metrics=await page.locator('#captain-account-dialog').evaluate(dialog=>{const r=dialog.getBoundingClientRect(),input=dialog.querySelector('input'),button=dialog.querySelector('.bt-login-email-submit');return {width:r.width,left:r.left,right:r.right,overflow:dialog.scrollWidth>dialog.clientWidth,font:getComputedStyle(input).fontSize,input:input.getBoundingClientRect().height,button:button.getBoundingClientRect().height};});
  assert(metrics.width<=440&&metrics.left>=0&&metrics.right<=width&&!metrics.overflow,JSON.stringify({name,metrics}));assert.equal(metrics.font,'16px');assert.equal(metrics.input,48);assert.equal(metrics.button,48);
  if(name==='phone'||name==='desktop')await page.screenshot({path:join(output,'login-'+name+'.png')});
 }
 await page.getByLabel('Email address',{exact:true}).fill('persistence-qa@example.org');await page.getByRole('button',{name:'Send verification code',exact:true}).click();
 await page.getByLabel('Verification code',{exact:true}).fill(codes.at(-1).code);await page.getByRole('button',{name:'Verify and continue',exact:true}).click();
 await page.getByRole('button',{name:'Transfer device voyage & history',exact:true}).waitFor();
 const [account]=await sql`SELECT id FROM spacetrader_accounts WHERE identity='persistence-qa@example.org'`;
 const saves=createStorage(sql,{parse:engine.parse,accountLimit:16777216,totalLimit:134217728,compact:true});assert.equal((await saves.snapshot(account.id)).raw,null,'Sign-in alone never uploads or replaces a voyage');
 const localSequence=await page.evaluate(()=>sharedSession.snapshot.sequence);
 await page.getByRole('button',{name:'Transfer device voyage & history',exact:true}).click();await page.waitForFunction(()=>window.SpacetraderAccount?.isCloud()&&state?.profile.name==='Persistence QA');
 await page.getByRole('button',{name:'Continue voyage',exact:false}).click();await page.locator('.game-shell').waitFor();
 assert.equal((await saves.snapshot(account.id)).sequence,localSequence);
 assert((await saves.snapshot(account.id)).slots.slot2,'Transfer includes the original device checkpoint');
 const timings=[];
 for(let i=0;i<5;i++){const started=Date.now();assert(await page.evaluate(()=>sharedAction('buy',{good:'water',units:1})));timings.push(Date.now()-started);}
 assert(await page.evaluate(()=>sharedCheckpoint('slot1',JSON.stringify(state))));
 const expected=await saves.snapshot(account.id);assert(expected.slots.slot1);
 await page.close();const reopened=await context.newPage();await reopened.goto(origin+'/play/');await reopened.waitForFunction(()=>window.SpacetraderAccount?.isCloud()&&state?.profile.name==='Persistence QA');
 assert.equal(await reopened.locator('.game-shell').count(),0);await reopened.getByRole('button',{name:'Load checkpoint',exact:false}).click();await reopened.getByRole('heading',{name:'Load checkpoint',exact:true}).waitFor();await reopened.getByRole('button',{name:'Back to previous popout',exact:true}).click();await reopened.getByRole('button',{name:'Continue voyage',exact:false}).click();await reopened.locator('.game-shell').waitFor();
 assert.equal(await reopened.evaluate(()=>sharedSession.snapshot.revision),expected.revision,'Closing a game tab preserves its account voyage');
 const device=await browser.newContext({viewport:{width:768,height:1024}}),other=await device.newPage();await other.goto(origin+'/play/');await other.getByRole('button',{name:'Sign in & load voyage',exact:false}).click();
 await other.getByLabel('Email address',{exact:true}).fill('persistence-qa@example.org');await other.getByRole('button',{name:'Send verification code',exact:true}).click();await other.getByLabel('Verification code',{exact:true}).fill(codes.at(-1).code);await other.getByRole('button',{name:'Verify and continue',exact:true}).click();await other.getByRole('button',{name:'Load voyage',exact:true}).click();
 await other.waitForFunction(()=>window.SpacetraderAccount?.isCloud()&&state?.profile.name==='Persistence QA');assert.equal(await other.evaluate(()=>sharedSession.snapshot.revision),expected.revision,'A separate browser device loads the same head and checkpoints');
 await other.getByRole('button',{name:'Continue voyage',exact:false}).click();await other.locator('.game-shell').waitFor();
 assert(await reopened.evaluate(()=>sharedAction('buy',{good:'water',units:1})));
 const fresh=await saves.snapshot(account.id);assert.equal(await other.evaluate(()=>sharedAction('buy',{good:'water',units:1})),false,'A stale device cannot repeat a choice against newer progress');
 assert.equal((await saves.snapshot(account.id)).sequence,fresh.sequence);
 assert.equal(await other.evaluate(()=>sharedSession.snapshot.revision),fresh.revision);
 // Loading from the entry menu uses the existing confirmed checkpoint flow.
 await other.reload();await other.getByRole('button',{name:'Load checkpoint',exact:false}).click();
 await other.locator('.checkpoint-slot').filter({has:other.getByRole('heading',{name:'Slot 1',exact:true})}).getByRole('button',{name:'Load…',exact:true}).click();
 await other.getByRole('button',{name:'Load checkpoint',exact:true}).click();await other.locator('.game-shell').waitFor();
 assert.equal(await other.evaluate(()=>state.credits),engine.parse(expected.slots.slot1).credits);
 assert((await saves.snapshot(account.id)).sequence>fresh.sequence,'A checkpoint restore records an action without losing later history');
 // Account library preserves distinct captains, checkpoints and simultaneous device destinations.
 const voyageA=(await saves.snapshot(account.id)).voyage;
 await reopened.reload();await reopened.getByRole('button',{name:'Saved voyages',exact:false}).click();
 await reopened.getByRole('button',{name:'New account voyage',exact:true}).click();
 await reopened.locator('#captain-name').waitFor();await reopened.locator('#captain-name').fill('Second voyage QA');await reopened.locator('#character-form').evaluate(form=>form.requestSubmit());
 await reopened.waitForFunction(()=>typeof state!=='undefined'&&state?.profile.name==='Second voyage QA'&&state.profile.created);
 const voyageB=await reopened.evaluate(()=>sharedSession.snapshot.voyage);assert.notEqual(voyageB,voyageA);
 assert(await reopened.evaluate(()=>sharedAction('buy',{good:'water',units:1})));
 assert(await reopened.evaluate(()=>sharedCheckpoint('slot1',JSON.stringify(state))));
 const recordedReads=[];reopened.on('request',request=>{const m=/\/api\/ledger\/(\d+)$/.exec(request.url());if(m)recordedReads.push(Number(m[1]));});
 await reopened.evaluate(()=>showCheckpointMenu('save'));await reopened.getByRole('heading',{name:'Save checkpoint',exact:true}).waitFor();assert.equal(await reopened.locator('.checkpoint-slot').count(),2,'New account voyages offer two bounded manual slots');await reopened.screenshot({path:join(output,'compact-checkpoints-phone.png')});
 await reopened.evaluate(()=>{closeModal(true);showLedger();});await reopened.waitForFunction(()=>document.querySelectorAll('.ledger-action').length>=3);assert.equal(await reopened.getByRole('button',{name:'Continue from here…',exact:true}).count(),0,'Account action history is read-only');
 assert(recordedReads.every(sequence=>sequence===1),'New journal receipts never fetch historical world snapshots');await reopened.screenshot({path:join(output,'compact-journal-phone.png')});await reopened.evaluate(()=>closeModal(true));
 const bHead=await saves.snapshot(account.id,voyageB),aHead=await saves.snapshot(account.id,voyageA);
 assert.equal(engine.parse(aHead.raw).profile.name,'Persistence QA');assert(aHead.slots.slot2,'Starting B preserves A checkpoints');
 assert(await other.evaluate(()=>sharedAction('buy',{good:'water',units:1})),'A device pinned to A can save while default B is selected');
 assert.equal((await saves.snapshot(account.id,voyageB)).revision,bHead.revision);
 await reopened.reload();await reopened.waitForFunction(()=>typeof state!=='undefined'&&state?.profile.name==='Second voyage QA');
 assert.equal(await reopened.evaluate(()=>sharedSession.snapshot.voyage),voyageB,'Tab reload keeps its pinned voyage');
 await reopened.getByRole('button',{name:'Saved voyages',exact:false}).click();
 for(const [name,width,height] of [['phone',390,844],['desktop',1440,900]]){
  await reopened.setViewportSize({width,height});
  assert(await reopened.locator('#captain-account-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth),'Voyage library has no horizontal overflow');
  await reopened.screenshot({path:join(output,'voyage-library-'+name+'.png')});
 }
 assert.equal(await reopened.getByRole('article',{name:'Voyage: Persistence QA',exact:true}).count(),1);assert.equal(await reopened.getByRole('article',{name:'Voyage: Second voyage QA',exact:true}).count(),1);
 await reopened.getByRole('article',{name:'Voyage: Persistence QA',exact:true}).getByRole('button',{name:'Load voyage',exact:true}).click();
 await reopened.waitForFunction(()=>typeof state!=='undefined'&&state?.profile.name==='Persistence QA');assert.equal(await reopened.evaluate(()=>sharedSession.snapshot.voyage),voyageA);
 assert.equal((await saves.snapshot(account.id,voyageB)).revision,bHead.revision);
 await reopened.evaluate(()=>showCheckpointMenu('save'));await reopened.getByRole('heading',{name:'Save checkpoint',exact:true}).waitFor();const legacyThird=reopened.locator('.checkpoint-slot').filter({has:reopened.getByRole('heading',{name:'Slot 3',exact:true})});assert.equal(await legacyThird.count(),1);assert(await legacyThird.getByRole('button',{name:'Overwrite…',exact:true}).isDisabled(),'Existing third checkpoint remains available but cannot receive new snapshots');await reopened.getByRole('button',{name:'Back to previous popout',exact:true}).click();
 // The existing Menu → New charter confirmation also creates a new UUID.
 const preservedA=await saves.snapshot(account.id,voyageA);
 await reopened.getByRole('button',{name:'New charter',exact:false}).click();await reopened.getByRole('button',{name:'Begin new voyage',exact:true}).click();
 await reopened.locator('#captain-name').waitFor();assert.equal(await reopened.locator('#captain-name').inputValue(),'');
 assert.notEqual(await reopened.evaluate(()=>sharedSession.snapshot.voyage),voyageA);assert.equal((await saves.snapshot(account.id,voyageA)).revision,preservedA.revision);
 await reopened.getByRole('button',{name:'Back to menu',exact:true}).click();await reopened.getByRole('button',{name:'Saved voyages',exact:false}).click();
 await reopened.getByRole('article',{name:'Voyage: Persistence QA',exact:true}).getByRole('button',{name:'Load voyage',exact:true}).click();await reopened.waitForFunction(()=>typeof state!=='undefined'&&state?.profile.name==='Persistence QA');
 // A saved live battle must not exchange fire on a menu or its Audio subpage.
 let battle=combatFixture.start(combatFixture.ready('osprey',3,2),2);
 battle=engine.transact(battle,'battle-plan',{battle:battle.battle.id,step:0,revision:0,realtime:true,engage:true});
 const beforeBattle=await saves.snapshot(account.id),idleBattle=await saves.append(account.id,{key:'auto',raw:JSON.stringify(battle),revision:beforeBattle.revision,action:{id:'qa-menu-battle',type:'qa-fixture',args:{},version:'0.72.257'}},beforeBattle.voyage);
 await reopened.reload();await reopened.getByRole('button',{name:'Continue voyage',exact:false}).waitFor();
 await reopened.getByRole('button',{name:'Audio',exact:false}).click();await reopened.getByRole('button',{name:'Back to previous popout',exact:true}).click();
 await new Promise(resolve=>setTimeout(resolve,1100));assert.equal((await saves.snapshot(account.id)).revision,idleBattle.revision);assert.equal(await reopened.evaluate(()=>state.battle.live.step),0);assert.equal(await reopened.locator('.game-shell').count(),0);assert(await reopened.evaluate(()=>SpacetraderAccountBridge.canSwitch()),'An idle saved battle does not block choosing an account at the entry menu');
 const expired=await browser.newContext(),expiredPage=await expired.newPage();await expiredPage.addInitScript(()=>localStorage.setItem('spacetrader.account-save-mode.v1','account'));await expiredPage.goto(origin+'/play/');
 await expiredPage.getByRole('button',{name:'Sign in & load voyage',exact:false}).waitFor();assert.equal(await expiredPage.locator('#character-form').count(),0);
 await expiredPage.getByRole('button',{name:'New charter',exact:false}).click();await expiredPage.locator('#captain-name').waitFor();assert.equal(await expiredPage.evaluate(()=>localStorage.getItem('spacetrader.account-save-mode.v1')),'device');
 const badWallet=await browser.newContext({viewport:{width:390,height:740}}),walletPage=await badWallet.newPage();await walletPage.clock.install();await walletPage.addInitScript(()=>{window.ethereum={request:()=>new Promise(()=>{})};});await walletPage.goto(origin+'/play/');await walletPage.getByRole('button',{name:'Sign in & load voyage',exact:false}).click();await walletPage.getByRole('button',{name:'Sign in with Ethereum',exact:true}).click();await walletPage.clock.fastForward(61000);await walletPage.getByRole('alert').filter({hasText:'wallet did not respond'}).waitFor();assert(await walletPage.getByLabel('Email address',{exact:true}).isEnabled(),'Wallet timeout must restore email controls');
 assert.equal(errors.length,0,errors.join('; '));
 await writeFileSafe(join(output,'ui-verification.json'),{passed:true,layouts:4,entryMenu:true,checkpointLoadFromMenu:true,battleIdleOnMenu:true,expiredSignInMenu:true,closeTabPersistence:true,compactAccountJournal:true,manualSlots:2,legacyThirdReadOnly:true,noPerActionRestore:true,noSnapshotReadsForNewJournal:true,multiVoyageLibrary:true,independentCheckpoints:true,pinnedDeviceIsolation:true,separateDevicePersistence:true,fullHistoryTransferred:true,checkpoints:true,staleDeviceRejected:true,walletTimeoutRecovery:true,localActionMilliseconds:timings,realEmailsSent:0,externalWalletRPCRequests:0,errors});
 console.log('PASS account UI: four responsive layouts, actual email flow, complete guest-history transfer, checkpoint persistence, closed-tab reopening, second device, stale-device rejection and wallet timeout recovery; zero live emails.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await database.close();}
})().catch(error=>{console.error(String(error.stack||error).slice(0,2500));process.exitCode=1;});
async function writeFileSafe(path,value){const {writeFile}=await import('node:fs/promises');await writeFile(path,JSON.stringify(value,null,2)+'\n');}
