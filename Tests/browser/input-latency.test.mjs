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
let batchDelay=1200,readDelay=0;const requests=[];
const staticRoot=resolve('Web/.vercel/output/static'),codes=[];let api,origin;
const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json','.txt':'text/plain'};
const server=createServer(async(req,res)=>{
 try{
  if(req.url.startsWith('/api/')){requests.push(req.url);if(req.url.startsWith('/api/voyage?since='))await new Promise(r=>setTimeout(r,readDelay));if(req.url==='/api/voyage/batch')await new Promise(r=>setTimeout(r,batchDelay));
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

const output=resolve('Research/ButtonLatency-2026-10-27');await mkdir(output,{recursive:true});
const results=[],errors=[],baseline=process.env.SPACETRADER_INPUT_BASELINE==='1';
try{
 const auth=createAuth({sql,origin}),login=await auth.establish('input-latency@example.invalid'),[account]=await sql`SELECT id FROM spacetrader_accounts WHERE identity='input-latency@example.invalid'`;
 const saves=createStorage(sql,{parse:engine.parse,accountLimit:16777216,totalLimit:134217728,compact:true,efficient:true});
 for(const [name,fixture]of [['fresh',null],['century','Research/LongDurationSaves-2026-10-26/pairs-50/final-snapshot.json']]){
  const state=fixture?engine.parse((await readFile(fixture,'utf8')).trim()):engine.transact(engine.fresh(),'create',{name:'Input latency QA',background:'trader',temperament:'measured'});
  const created=await saves.createVoyage(account.id,{raw:JSON.stringify(state),operation:'input-'+name});
  const ctx=await browser.newContext({viewport:{width:1440,height:900}});await ctx.addCookies([{name:'captain-session',value:login.key,url:origin,httpOnly:true,sameSite:'Lax'}]);
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/play/');await page.getByRole('button',{name:'Continue voyage',exact:false}).click();await page.locator('.game-shell').waitFor();
  await page.evaluate(()=>{window.samples={engine:[],write:[],render:[]};const transact=E.transact;E.transact=(...a)=>{const t=performance.now();try{return transact(...a);}finally{samples.engine.push(performance.now()-t);}};const write=sharedSession.write.bind(sharedSession);sharedSession.write=async(...a)=>{const t=performance.now();try{return await write(...a);}finally{samples.write.push(performance.now()-t);}};const draw=render;render=(...a)=>{const t=performance.now();try{return draw(...a);}finally{samples.render.push(performance.now()-t);}};});
  const timings=[];for(let i=0;i<6;i++)timings.push(await page.evaluate(async i=>{const t=performance.now(),ok=await sharedAction('rename-ship',{id:state.flagshipID,name:'Latency '+i});return{ok,ms:performance.now()-t};},i));assert(timings.every(x=>x.ok));await page.evaluate(()=>actionQueue);
  // Slow network polling must not occupy the action cursor or discard a later local commit.
  readDelay=1800;await page.evaluate(()=>{window.testPoll=sharedPoll();});// Unsaved drafts satisfy polling locally without starting a network read.
  const focused=await page.evaluate(async()=>{const busy=sharedBusy,t=performance.now(),ok=await sharedAction('rename-ship',{id:state.flagshipID,name:'After focus'});return{ok,busy,ms:performance.now()-t,raw:JSON.stringify(state)};});assert(focused.ok);
  await page.evaluate(()=>testPoll);await page.evaluate(()=>actionQueue);assert.equal(await page.evaluate(()=>JSON.stringify(state)),focused.raw,'A delayed poll cannot replace a later local action');assert.equal((await saves.snapshot(account.id,created.id)).sequence,1,'Latency checks stay unsaved at the station');
  if(!baseline){assert.equal(focused.busy,false,'Cloud polling leaves action buttons enabled');assert(focused.ms<800,'Action does not wait for the 1.8-second cloud refresh');}
  readDelay=0;
  await page.evaluate(()=>{screen='station';render();visitVenue('market');});await page.locator('.exchange-console').waitFor();await page.waitForFunction(()=>!sharedBusy&&queuedActions===0);await page.evaluate(()=>actionQueue);
  const water=page.locator('[data-market-product="water"] button[data-action="buy"]');const trades=[];
  if(await water.count()&&await water.isEnabled()){
   for(let i=0;i<3;i++)trades.push(await page.evaluate(async()=>{const seq=sharedSession.snapshot.sequence,t=performance.now();document.querySelector('[data-market-product="water"] button[data-action="buy"]').click();while(sharedSession.snapshot.sequence===seq)await new Promise(r=>setTimeout(r,5));await actionQueue;return performance.now()-t;}));
   await page.evaluate(()=>actionQueue);
  }
  const result={name,browser:browserName,stateBytes:Buffer.byteLength(JSON.stringify(state)),renameMs:timings.map(x=>x.ms),slowFocusPollActionMs:focused.ms,pollMarkedButtonsBusy:focused.busy,tradeClickMs:trades,stages:await page.evaluate(()=>samples),cloudDelayMs:readDelay};results.push(result);
  await ctx.close();
 }
 assert.deepEqual(errors,[]);const report={baseline,browser:browserName,passed:true,pollDelayMs:1800,results,errors,physicalDevice:false};await writeFile(join(output,(baseline?'baseline-':'candidate-')+browserName+'.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser.close();await new Promise(r=>server.close(r));await database.close();}
})().catch(e=>{console.error(String(e.stack||e).slice(0,4000));process.exitCode=1;});
