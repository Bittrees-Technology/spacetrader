import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir,readdir,mkdtemp,rm} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import {homedir,tmpdir} from 'node:os';
import {PGlite} from '@electric-sql/pglite';
import {chromium,webkit} from 'playwright-core';
import {verifyMessage} from 'viem';
import {parseSiweMessage} from 'viem/siwe';
import {createApi} from '../../Web/account/api.mjs';
import {createAuth} from '../../Web/account/auth.mjs';
import {createStorage} from '../../Web/account/storage.mjs';
import engine from '../../Browser/engine.js';
import combatFixture from './combat-v2-balance.cjs';

(async()=>{
const database=new PGlite();await database.exec(await readFile('Web/account/schema.sql','utf8'));await database.exec(await readFile('Web/account/migrations/002-voyage-library.sql','utf8'));await database.exec(await readFile('Web/account/migrations/003-compact-journal.sql','utf8'));await database.exec(await readFile('Web/account/migrations/004-efficient-saves.sql','utf8'));await database.exec(await readFile('Web/account/migrations/005-batched-saves.sql','utf8'));await database.exec('SET search_path=pg_catalog,spacetrader,pg_temp');
const sql=(strings,...values)=>database.query(strings.reduce((out,text,index)=>out+(index?'$'+index:'')+text,''),values).then(result=>result.rows);
let batchDelay=1200;const requests=[];
const staticRoot=resolve('Web/.vercel/output/static'),codes=[];let api,origin;
const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json','.txt':'text/plain'};
const server=createServer(async(req,res)=>{
 try{
  if(req.url.startsWith('/api/')){requests.push(req.url);if(req.url==='/api/voyage/batch')await new Promise(r=>setTimeout(r,batchDelay));
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
api=createApi({env:{APP_ORIGIN:origin,SPACETRADER_ACCOUNTS_ENABLED:'1',SPACETRADER_BATCH_SAVES:'1',SPACETRADER_EFFICIENT_READS:'1',SPACETRADER_EFFICIENT_SAVES:'1',SPACETRADER_ACCOUNT_STORAGE_BYTES:'16777216',SPACETRADER_TOTAL_STORAGE_BYTES:'134217728',SPACETRADER_EMAIL_DAILY_LIMIT:'20',SPACETRADER_EMAIL_MONTHLY_LIMIT:'500'},sql,sendMail:async(email,code)=>codes.push({email,code}),verifyWallet:({message,signature})=>verifyMessage({message,signature,address:parseSiweMessage(message).address})});
const browserName=process.env.SPACETRADER_TEST_BROWSER==='webkit'?'webkit':'chromium',browserType=browserName==='webkit'?webkit:chromium;
const cache=join(homedir(),'Library/Caches/ms-playwright'),installations=(await readdir(cache)).filter(name=>name.startsWith(browserName==='webkit'?'webkit-':'chromium_headless_shell-')).sort().reverse();
assert(installations.length,'Existing test browser installation required; no browser download started.');
const executablePath=join(cache,installations[0],browserName==='webkit'?'pw_run.sh':'chrome-headless-shell-mac-arm64/chrome-headless-shell'),browser=await browserType.launch({headless:true,executablePath});
const output=resolve('Research/SaveResume-2026-10-26');await mkdir(output,{recursive:true});
const errors=[];let restartContext;const restartProfile=await mkdtemp(join(tmpdir(),'spacetrader-save-resume-'));
try{
 const auth=createAuth({sql,origin}),login=await auth.establish('batch-browser@example.invalid'),[account]=await sql`SELECT id FROM spacetrader_accounts WHERE identity='batch-browser@example.invalid'`;
 const saves=createStorage(sql,{parse:engine.parse,accountLimit:16777216,totalLimit:134217728,compact:true,efficient:true});
 const state=engine.transact(engine.fresh(),'create',{name:'Batched browser QA',background:'trader',temperament:'measured'}),created=await saves.createVoyage(account.id,{raw:JSON.stringify(state),operation:'browser-batch-fixture'});
 async function context(viewport){const ctx=await browser.newContext({viewport});await ctx.addCookies([{name:'captain-session',value:login.key,url:origin,httpOnly:true,sameSite:'Lax'}]);await ctx.addInitScript(()=>{window.testDurability=[];const transaction=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(...args){if(this.name==='spacetrader-account-outbox'&&args[1]==='readwrite')testDurability.push(args[2]?.durability);return transaction.apply(this,args);};window.testKeepalive=[];const send=window.fetch;window.fetch=(path,options)=>{if(path==='/api/voyage/batch')testKeepalive.push({enabled:options.keepalive,bytes:new TextEncoder().encode(options.body).length});return send(path,options);};window.testIntervals=[];const original=window.setInterval;window.setInterval=(fn,ms,...args)=>{window.testIntervals.push(ms);return original(fn,ms,...args);};});return ctx;}
 const ctx=await context({width:768,height:1024});let page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/play/');await page.getByRole('button',{name:'Continue voyage',exact:false}).click();await page.locator('.game-shell').waitFor();
 assert(await page.evaluate(()=>testIntervals.includes(60000)),'Cloud interval is one minute');
 const baseline=await saves.snapshot(account.id,created.id),timings=[];
 for(let i=0;i<12;i++){const value=await page.evaluate(async i=>{const started=performance.now(),ok=await sharedAction(i%2?'sell':'buy',{good:'water',units:1});return {ok,ms:performance.now()-started};},i);assert(value.ok);timings.push(value.ms);}
 assert(Math.max(...timings)<1000,'Local actions do not wait for the deliberately delayed cloud response');
 assert.equal((await saves.snapshot(account.id,created.id)).sequence,baseline.sequence,'Cloud request is deferred while actions are recorded locally');
 assert.equal(await page.evaluate(()=>SpacetraderAccount.syncStatus().pending),12);await page.evaluate(()=>SpacetraderAccount.sync());
 assert.equal((await saves.snapshot(account.id,created.id)).sequence,baseline.sequence+12);assert.equal(requests.filter(x=>x==='/api/voyage/batch').length,1,'Twelve actions share one cloud request');assert(await page.evaluate(()=>testDurability.length>=12&&testDurability.every(x=>x==='strict')),'Device writes request strict durability');assert(await page.evaluate(()=>testKeepalive.length===1&&testKeepalive[0].enabled&&testKeepalive[0].bytes<=60000),'Small saves use navigation-safe fetch');
 await page.evaluate(()=>showGameMenu());assert.equal(await page.getByRole('button',{name:'Save checkpoint',exact:false}).count(),0);assert.equal(await page.getByRole('button',{name:'Load',exact:true}).count(),0);await page.getByRole('button',{name:'Sync now',exact:false}).click();
 for(const [name,width,height]of [['phone',390,844],['ipad-portrait',768,1024],['ipad-landscape',1024,680],['desktop',1440,900]]){await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(name==='ipad-portrait')await page.screenshot({path:join(output,'latest-progress-menu-ipad-'+browserName+'.png')});}
 await page.evaluate(()=>closeModal(true));
 // Another device loads before the current device writes again.
 const second=await context({width:390,height:844}),other=await second.newPage();await other.goto(origin+'/play/');await other.getByRole('button',{name:'Continue voyage',exact:false}).click();await other.locator('.game-shell').waitFor();
 batchDelay=4000;assert(await page.evaluate(()=>sharedAction('buy',{good:'water',units:1})));assert(await page.evaluate(()=>sharedAction('sell',{good:'water',units:1})));const expected=await page.evaluate(()=>JSON.stringify(state));
 await page.close();page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/play/');await page.waitForFunction(()=>typeof state!=='undefined'&&state?.profile?.name==='Batched browser QA');assert.equal(await page.evaluate(()=>JSON.stringify(state)),expected,'Reopening immediately displays the durable local tail before the cloud responds');await page.evaluate(()=>SpacetraderAccount.sync());
 assert.equal((await saves.snapshot(account.id,created.id)).raw,expected,'Tab-close recovery retains both individual actions');assert.equal((await saves.snapshot(account.id,created.id)).sequence,baseline.sequence+14);
 // Hiding during an action also drains the action that finishes its device write afterward.
 const beforeHidden=requests.filter(x=>x==='/api/voyage/batch').length;
 assert(await page.evaluate(async()=>{const action=sharedAction('buy',{good:'water',units:1});Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));return action;}));
 await page.waitForFunction(()=>SpacetraderAccount.syncStatus().pending===0,null,{timeout:10000});
 assert.equal((await saves.snapshot(account.id,created.id)).sequence,baseline.sequence+15,'Backgrounding flushes an action still committing locally');assert.equal(requests.filter(x=>x==='/api/voyage/batch').length,beforeHidden+1,'No duplicate lifecycle uploads');
 await page.evaluate(()=>{delete document.hidden;});
 const remote=(await saves.snapshot(account.id,created.id)).raw;
 assert(await other.evaluate(()=>sharedAction('buy',{good:'water',units:1})),'A stale device first secures its attempted action locally');
 const conflict=await other.evaluate(async()=>{try{await SpacetraderAccount.sync();return false;}catch{return true;}});assert(conflict);assert(await other.evaluate(()=>SpacetraderAccount.syncStatus().conflict));assert.equal((await saves.snapshot(account.id,created.id)).raw,remote);await other.getByRole('heading',{name:'Action needs review',exact:true}).waitFor();assert.equal(await other.getByRole('button',{name:'Download pending actions',exact:true}).count(),1);
 await other.getByRole('button',{name:'Keep latest account progress',exact:true}).click();await other.waitForFunction(()=>typeof state!=='undefined'&&state?.profile?.name==='Batched browser QA'&&SpacetraderAccount.syncStatus().pending===0);assert.equal(await other.evaluate(()=>JSON.stringify(state)),remote);
 const history=await saves.history(account.id,Number.MAX_SAFE_INTEGER,created.id);assert.equal(history[0].sequence,baseline.sequence+15);
 await other.getByRole('button',{name:'New charter',exact:false}).click();await other.getByRole('button',{name:'Begin new voyage',exact:true}).click();await other.locator('#captain-name').waitFor();assert.equal(await other.locator('#captain-name').inputValue(),'');await other.locator('#captain-name').fill('New batched charter');await other.locator('#character-form').evaluate(form=>form.requestSubmit());await other.waitForFunction(()=>typeof state!=='undefined'&&state?.profile?.name==='New batched charter'&&state.profile.created);const newId=await other.evaluate(()=>sharedSession.snapshot.voyage);assert.notEqual(newId,created.id);await other.evaluate(()=>SpacetraderAccount.sync());assert.equal(engine.parse((await saves.snapshot(account.id,newId)).raw).profile.name,'New batched charter');assert.equal((await saves.snapshot(account.id,created.id)).raw,remote,'A new charter keeps the previous voyage and journal');
 // A full browser-process restart retains the final offline actions and the selected voyage.
 await other.close();
 async function persistent(signIn=false){const c=await browserType.launchPersistentContext(restartProfile,{headless:true,executablePath,viewport:{width:768,height:1024}});if(signIn)await c.addCookies([{name:'captain-session',value:login.key,url:origin,httpOnly:true,sameSite:'Lax',expires:Math.floor(Date.now()/1000)+3600}]);return c;}
 restartContext=await persistent(true);let restartPage=restartContext.pages()[0];await restartPage.goto(origin+'/play/');await restartPage.getByRole('button',{name:'Continue voyage',exact:false}).click();
 const beforeRestart=(await saves.snapshot(account.id,newId)).sequence;await restartContext.setOffline(true);
 assert(await restartPage.evaluate(()=>sharedAction('buy',{good:'water',units:1})));assert(await restartPage.evaluate(()=>sharedAction('sell',{good:'water',units:1})));const restartRaw=await restartPage.evaluate(()=>JSON.stringify(state));
 await restartContext.close();restartContext=null;assert.equal((await saves.snapshot(account.id,newId)).sequence,beforeRestart,'Offline closing cannot upload progress');
 restartContext=await persistent();restartPage=restartContext.pages()[0];await restartPage.goto(origin+'/play/');await restartPage.waitForFunction(()=>typeof state!=='undefined'&&state?.profile?.name==='New batched charter');assert.equal(await restartPage.evaluate(()=>JSON.stringify(state)),restartRaw,'A new browser process immediately recovers the final device actions');await restartPage.evaluate(()=>SpacetraderAccount.sync());assert.equal((await saves.snapshot(account.id,newId)).sequence,beforeRestart+2);assert.equal((await saves.snapshot(account.id,newId)).raw,restartRaw);await restartContext.close();restartContext=null;
 let battle=combatFixture.start(combatFixture.ready('osprey',3,2),2);battle=engine.transact(battle,'battle-plan',{battle:battle.battle.id,step:0,revision:0,realtime:true,engage:true});const battleVoyage=await saves.createVoyage(account.id,{raw:JSON.stringify(battle),operation:'browser-live-battle'}),battleContext=await context({width:1024,height:768}),battlePage=await battleContext.newPage();battlePage.on('pageerror',e=>errors.push(e.message));await battlePage.goto(origin+'/play/');await battlePage.getByRole('button',{name:'Continue voyage',exact:false}).waitFor();await new Promise(r=>setTimeout(r,1100));assert.equal((await saves.snapshot(account.id,battleVoyage.id)).sequence,1,'An idle battle on the entry menu records no ticks');await battlePage.getByRole('button',{name:'Continue voyage',exact:false}).click();await battlePage.waitForFunction(()=>typeof state!=='undefined'&&state.battle?.live?.step>=4,null,{timeout:4500});const battleDraft=await battlePage.evaluate(()=>{pauseLiveBattle('QA batch test complete');return JSON.stringify(state);});assert.equal((await saves.snapshot(account.id,battleVoyage.id)).sequence,1,'Combat advances locally while the deliberately slow cloud save is outstanding');await battlePage.evaluate(()=>SpacetraderAccount.sync());assert.equal((await saves.snapshot(account.id,battleVoyage.id)).raw,battleDraft);const battleTicks=JSON.parse(battleDraft).battle.live.step;
 // This device remembers its own selected charter even after another device changes the account default.
 const restoredOther=await second.newPage();await restoredOther.goto(origin+'/play/');await restoredOther.waitForFunction(()=>typeof state!=='undefined'&&state?.profile?.name==='New batched charter');assert.equal(await restoredOther.evaluate(()=>sharedSession.snapshot.voyage),newId);assert.equal(await restoredOther.evaluate(()=>JSON.stringify(state)),restartRaw);
 assert.deepEqual(errors,[]);await writeFile(join(output,browserName==='webkit'?'browser-webkit-tests.json':'browser-tests.json'),JSON.stringify({passed:true,browser:browserName,actionTimesMs:timings,artificialCloudDelayMs:1200,closeRecoveryDelayMs:batchDelay,cloudRequestsFor12Actions:1,checkpointButtonsAbsent:true,minutePolling:true,closedTabRecovered:true,browserProcessRestartRecovered:true,offlineFinalActionsRecovered:2,backgroundDuringDeviceWriteSynced:true,persistentVoyageSelection:true,strictDeviceDurability:true,smallBatchKeepalive:true,staleDeviceHeld:true,battleTicksRecorded:battleTicks,battleCloudDelayMs:batchDelay,battleIdleOnMenu:true,newCharterBatched:true,independentVoyages:true,viewports:4,physicalIPad:false},null,2)+'\n');console.log('PASS latest-progress browser:12 immediate durable actions/one delayed batch;closed-tab recovery;stale-device review;no checkpoint controls;60-second polling;four layouts;strict device writes;background saves;full browser-process restart;account-scoped voyage selection.');
}finally{await restartContext?.close();await rm(restartProfile,{recursive:true,force:true});await browser.close();await new Promise(r=>server.close(r));await database.close();}
})().catch(e=>{console.error(String(e.stack||e).slice(0,4000));process.exitCode=1;});
