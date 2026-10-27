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
const output=resolve('Research/TransitSaving-2026-10-27');await mkdir(output,{recursive:true});
const errors=[];let restartContext;const restartProfile=await mkdtemp(join(tmpdir(),'spacetrader-save-resume-'));
try{
 const auth=createAuth({sql,origin}),login=await auth.establish('transit-browser@example.invalid'),[account]=await sql`SELECT id FROM spacetrader_accounts WHERE identity='transit-browser@example.invalid'`;
 const saves=createStorage(sql,{parse:engine.parse,accountLimit:16777216,totalLimit:134217728,compact:true,efficient:true});
 const seedState=engine.transact(engine.fresh(),'create',{name:'Transit browser QA',background:'trader',temperament:'measured'}),created=await saves.createVoyage(account.id,{raw:JSON.stringify(seedState),operation:'visible-transit-fixture'});
 const ctx=await browser.newContext({viewport:{width:1440,height:900}});await ctx.addCookies([{name:'captain-session',value:login.key,url:origin,httpOnly:true,sameSite:'Lax'}]);
 await ctx.addInitScript(()=>{window.saveWindows=[];const send=window.fetch;window.fetch=(path,options)=>{if(path==='/api/voyage/batch')saveWindows.push({visible:SpacetraderAccountBridge.inTransit(),preview:journey?.preview,kind:modalKind,hidden:document.hidden,painted:document.querySelector('#journey-chart')?.getBoundingClientRect().height>0});return send(path,options);};});
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/play/');await page.getByRole('button',{name:'Continue voyage',exact:false}).click();await page.locator('.game-shell').waitFor();
 const baseline=await saves.snapshot(account.id,created.id),timings=[];
 for(let i=0;i<12;i++){const value=await page.evaluate(async i=>{const t=performance.now(),ok=await sharedAction(i%2?'sell':'buy',{good:'water',units:1});return {ok,ms:performance.now()-t};},i);assert(value.ok);timings.push(value.ms);}
 assert(Math.max(...timings)<1000);assert.equal(await page.evaluate(()=>SpacetraderAccount.syncStatus().unsaved),12);
 await page.evaluate(async()=>{await sharedSession.history();await sharedPoll();showGameMenu();window.dispatchEvent(new Event('pagehide'));window.dispatchEvent(new Event('online'));document.dispatchEvent(new Event('visibilitychange'));});
 assert.equal(await page.locator('[data-action="account-sync"]').count(),0,'Menu has no manual save control');
 await page.evaluate(()=>SpacetraderAccount.open());await page.getByRole('heading',{name:'Saved voyages',exact:true}).waitFor();await page.getByRole('button',{name:'Back to game',exact:true}).click();await page.evaluate(()=>closeModal(true));
 assert(await page.evaluate(async()=>{try{await SpacetraderAccount.sync();return false;}catch{return true;}}),'Direct station flush is rejected');
 await page.evaluate(()=>{showJourney(journeyPlan('moon',true));});assert.equal(await page.locator('[data-action="journey-skip"]').count(),1,'Preview can return to flight plan');await page.getByRole('button',{name:'Return to flight plan',exact:true}).click();
 await new Promise(r=>setTimeout(r,2800));assert.equal((await saves.snapshot(account.id,created.id)).sequence,baseline.sequence);assert.equal(requests.filter(x=>x==='/api/voyage/batch').length,0,'Station actions, journal, menus, lifecycle events, timers and previews never save');
 // Closing a station visit intentionally resumes the last confirmed save.
 const disposable=await ctx.newPage();await disposable.goto(origin+'/play/');await disposable.getByRole('button',{name:'Continue voyage',exact:false}).click();assert(await disposable.evaluate(()=>sharedAction('rename-ship',{id:state.flagshipID,name:'Unsaved visit'})));await disposable.close();const reopened=await ctx.newPage();await reopened.goto(origin+'/play/');await reopened.getByRole('button',{name:'Continue voyage',exact:false}).click();assert.equal(await reopened.evaluate(()=>JSON.stringify(state)),baseline.raw);await reopened.close();
 // Select the destination and use the real Depart control. No request can precede its painted animation.
 batchDelay=10000;await page.route('**/api/voyage/batch',route=>route.abort('failed'));
 await page.evaluate(()=>{selectNavigation('moon');screen='map';render();});const beforeDepart=requests.filter(x=>x==='/api/voyage/batch').length;assert.equal(beforeDepart,0);
 await page.locator('[data-action="depart"]').first().click();await page.waitForFunction(()=>!!journey&&modalKind==='journey');assert.equal(await page.locator('[data-action="journey-skip"]').count(),0);
 await page.getByRole('button',{name:'Retry save',exact:true}).waitFor();await page.evaluate(()=>{finishJourney();closeModal(true);});await page.keyboard.press('Escape');assert(await page.evaluate(()=>!!journey),'Direct close, finish and Escape cannot skip travel');
 await page.getByRole('button',{name:'Account & saves',exact:true}).click();await page.getByRole('heading',{name:'Saved voyages',exact:true}).waitFor();await page.getByRole('button',{name:'Back to game',exact:true}).click();
 await page.unroute('**/api/voyage/batch');await page.getByRole('button',{name:'Retry save',exact:true}).click();await page.waitForFunction(()=>journey&&journey.progress>=journeyStopProgress(journey),null,{timeout:12000});assert(await page.evaluate(()=>journey.savePending),'Slow saving holds the travel screen after playback');
 await page.screenshot({path:join(output,'transit-save-'+browserName+'.png')});await page.waitForFunction(()=>!journey,null,{timeout:15000});
 const arrived=await page.evaluate(()=>JSON.stringify(state));assert.equal((await saves.snapshot(account.id,created.id)).sequence,baseline.sequence+13);assert.equal((await saves.snapshot(account.id,created.id)).raw,arrived);
 const windows=await page.evaluate(()=>saveWindows);assert(windows.length>=2);assert(windows.every(w=>w.visible&&w.painted&&!w.preview&&w.kind==='journey'&&!w.hidden));
 const count=requests.filter(x=>x==='/api/voyage/batch').length;await page.evaluate(()=>{window.dispatchEvent(new Event('online'));window.dispatchEvent(new Event('pagehide'));});await new Promise(r=>setTimeout(r,3200));assert.equal(requests.filter(x=>x==='/api/voyage/batch').length,count,'No retry leaks after arrival');
 // Combat is not an autosave window, even though it is logically in transit.
 batchDelay=1200;let battle=combatFixture.start(combatFixture.ready('osprey',3,2),2);battle=engine.transact(battle,'battle-plan',{battle:battle.battle.id,step:0,revision:0,realtime:true,engage:true});const battleVoyage=await saves.createVoyage(account.id,{raw:JSON.stringify(battle),operation:'transit-battle'}),battleContext=await browser.newContext({viewport:{width:1024,height:768}});await battleContext.addCookies([{name:'captain-session',value:login.key,url:origin,httpOnly:true,sameSite:'Lax'}]);const battlePage=await battleContext.newPage();battlePage.on('pageerror',e=>errors.push(e.message));await battlePage.goto(origin+'/play/');await battlePage.getByRole('button',{name:'Continue voyage',exact:false}).click();await battlePage.waitForFunction(()=>state.battle?.live?.step>=4,null,{timeout:12000}).catch(async e=>{console.log(await battlePage.evaluate(()=>({step:state.battle?.live?.step,modal:modalKind,busy:sharedBusy,queued:queuedActions,save:saveState,error:document.querySelector('#toast')?.textContent,incident:state.incident?.kind})));throw e;});await battlePage.evaluate(()=>pauseLiveBattle('QA complete'));assert.equal(await battlePage.evaluate(()=>SpacetraderAccountBridge.inTransit()),false);await new Promise(r=>setTimeout(r,2800));assert.equal((await saves.snapshot(account.id,battleVoyage.id)).sequence,1,'Battle ticks stay volatile until the next travel animation');await battleContext.close();
 // Guest departures also have no skip control; route previews still return normally.
 const guest=await browser.newContext({viewport:{width:768,height:1024}}),guestPage=await guest.newPage();await guestPage.goto(origin+'/play/');await guestPage.waitForFunction(()=>typeof showJourney==='function'&&!!state);await guestPage.evaluate(()=>{publicStartMenu=false;state=E.transact(E.fresh(),'create',{name:'Guest QA',background:'trader',temperament:'measured'});render();showJourney(journeyPlan('moon',false));});assert.equal(await guestPage.locator('[data-action="journey-skip"]').count(),0);await guest.close();
 assert.deepEqual(errors,[]);await writeFile(join(output,'transit-'+browserName+'.json'),JSON.stringify({passed:true,browser:browserName,actionTimesMs:timings,saveWindows:windows,stationWrites:0,actionsSavedInTransit:13,slowSaveWait:true,failedUploadRetry:true,combatWrites:0,guestSkipRemoved:true,physicalIPad:false},null,2)+'\n');console.log('PASS visible-transit-only browser regression: station/menu/journal/lifecycle/preview/idle timers cannot save; real Depart paints before saving; slow and failed saves hold travel; Escape/skip blocked; combat stays volatile; guest skip removed.');await ctx.close();
}finally{await restartContext?.close();await rm(restartProfile,{recursive:true,force:true});await browser.close();await new Promise(r=>server.close(r));await database.close();}
})().catch(e=>{console.error(String(e.stack||e).slice(0,4000));process.exitCode=1;});
