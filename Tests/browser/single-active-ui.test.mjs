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
const database=new PGlite();await database.exec(await readFile('Web/account/schema.sql','utf8'));await database.exec(await readFile('Web/account/migrations/002-voyage-library.sql','utf8'));await database.exec(await readFile('Web/account/migrations/003-compact-journal.sql','utf8'));await database.exec(await readFile('Web/account/migrations/004-efficient-saves.sql','utf8'));await database.exec(await readFile('Web/account/migrations/005-batched-saves.sql','utf8'));await database.exec(await readFile('Web/account/migrations/006-single-active-voyage.sql','utf8'));await database.exec('SET search_path=pg_catalog,spacetrader,pg_temp');
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
api=createApi({env:{APP_ORIGIN:origin,SPACETRADER_ACCOUNTS_ENABLED:'1',SPACETRADER_SINGLE_ACTIVE_VOYAGE:'1',SPACETRADER_BATCH_SAVES:'1',SPACETRADER_EFFICIENT_READS:'1',SPACETRADER_EFFICIENT_SAVES:'1',SPACETRADER_ACCOUNT_STORAGE_BYTES:'16777216',SPACETRADER_TOTAL_STORAGE_BYTES:'134217728',SPACETRADER_EMAIL_DAILY_LIMIT:'20',SPACETRADER_EMAIL_MONTHLY_LIMIT:'500'},sql,sendMail:async(email,code)=>codes.push({email,code}),verifyWallet:({message,signature})=>verifyMessage({message,signature,address:parseSiweMessage(message).address})});
const browserName=process.env.SPACETRADER_TEST_BROWSER==='webkit'?'webkit':'chromium',browserType=browserName==='webkit'?webkit:chromium;
const cache=join(homedir(),'Library/Caches/ms-playwright'),installations=(await readdir(cache)).filter(name=>name.startsWith(browserName==='webkit'?'webkit-':'chromium_headless_shell-')).sort().reverse();
assert(installations.length,'Existing test browser installation required; no browser download started.');
const executablePath=join(cache,installations[0],browserName==='webkit'?'pw_run.sh':'chrome-headless-shell-mac-arm64/chrome-headless-shell'),browser=await browserType.launch({headless:true,executablePath});

const output=resolve('Research/SingleVoyage-2026-10-27');await mkdir(output,{recursive:true});const errors=[];
try{
 const auth=createAuth({sql,origin,captainScope:true}),login=await auth.establish('single-browser@example.invalid'),[account]=await sql`SELECT id FROM spacetrader_accounts WHERE identity='single-browser@example.invalid'`;
 const saves=createStorage(sql,{parse:engine.parse,accountLimit:16777216,totalLimit:134217728,compact:true,efficient:true,singleActive:true});
 const seed=engine.transact(engine.fresh(),'create',{name:'Original captain',background:'trader',temperament:'measured'}),first=await saves.createVoyage(account.id,{raw:JSON.stringify(seed),operation:'single-browser-fixture',restartFrom:null,revision:null}),captain=first.captainId;
 async function context(){const c=await browser.newContext({viewport:{width:1440,height:900}});await c.addCookies([{name:'captain-session',value:login.key,url:origin,httpOnly:true,sameSite:'Lax'}]);return c;}
 const ctx=await context(),page=await ctx.newPage(),oldContext=await context(),old=await oldContext.newPage();for(const p of[page,old]){p.on('pageerror',e=>errors.push(e.message));await p.goto(origin+'/play/');await p.getByRole('button',{name:'Continue voyage',exact:false}).click();}
 assert(await old.evaluate(()=>sharedAction('rename-ship',{id:state.flagshipID,name:'Stale station actions'})));
 assert(await page.evaluate(()=>sharedAction('rename-ship',{id:state.flagshipID,name:'Before restart'})));const preserved=await page.evaluate(()=>JSON.stringify(state));
 await page.evaluate(()=>showGameMenu());await page.getByRole('button',{name:'New charter',exact:false}).click();await page.getByRole('button',{name:'Archive and restart',exact:true}).click();
 await page.locator('#captain-name').waitFor();assert.equal(await page.locator('#captain-name').inputValue(),'');await page.locator('#captain-name').fill('Restarted captain');await page.locator('#character-form').evaluate(form=>form.requestSubmit());await page.waitForFunction(()=>state?.profile.name==='Restarted captain'&&state.profile.created);await page.evaluate(()=>SpacetraderAccount.sync());const active=await page.evaluate(()=>sharedSession.snapshot.voyage);assert.notEqual(active,first.id);assert.equal((await auth.current(new Request(origin+'/api/account/status',{headers:{cookie:'captain-session='+login.key}}))).captainId,captain);assert.equal((await saves.snapshot(account.id,first.id,false)).raw,preserved);
 await page.evaluate(()=>SpacetraderAccount.open());const prior=page.getByRole('article',{name:'Voyage: Original captain',exact:true});await prior.getByRole('button',{name:'View archived journal',exact:true}).click();await page.getByRole('list',{name:'Archived action history',exact:true}).locator('li').first().waitFor();assert.equal(await page.evaluate(()=>sharedSession.snapshot.voyage),active);assert.equal(await page.evaluate(()=>state.profile.name),'Restarted captain');
 for(const [name,width,height]of[['desktop',1440,900],['ipad',768,1024],['phone',390,844]]){await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(name==='ipad')await page.screenshot({path:join(output,'archive-journal-'+browserName+'.png')});}
 await page.getByRole('button',{name:'Back to saved voyages',exact:true}).click();const rows=await saves.library(account.id);assert.equal(rows.voyages.filter(v=>!v.readOnly).length,1);assert.equal(await prior.getByRole('button',{name:'Load voyage',exact:true}).count(),0);
 await page.getByRole('button',{name:'Back to game',exact:true}).click();
 // An old tab cannot commit to or reactivate the previous voyage. Its local draft remains reviewable.
 assert(await old.evaluate(async()=>{try{await SpacetraderAccount.sync();return false;}catch{return true;}}));await old.getByRole('heading',{name:'Action needs review',exact:true}).waitFor();await old.getByRole('button',{name:'Keep latest account progress',exact:true}).click();await old.waitForFunction(()=>typeof state!=='undefined'&&state?.profile.name==='Restarted captain');assert.equal(await old.evaluate(()=>sharedSession.snapshot.voyage),active);
 // A new tab with the previous voyage preference always follows the account's active captain.
 await page.close();const reopened=await ctx.newPage();await reopened.goto(origin+'/play/');await reopened.getByRole('button',{name:'Continue voyage',exact:false}).click();assert.equal(await reopened.evaluate(()=>sharedSession.snapshot.voyage),active);
 await reopened.evaluate(()=>SpacetraderAccount.open());await reopened.getByRole('button',{name:'Restart voyage…',exact:true}).click();await reopened.getByRole('button',{name:'Archive and restart',exact:true}).click();await reopened.locator('#captain-name').waitFor();const next=await reopened.evaluate(()=>sharedSession.snapshot.voyage);assert.notEqual(next,active);const final=await saves.library(account.id);assert.equal(final.captainId,captain);assert.equal(final.voyages.filter(v=>!v.readOnly).length,1);assert.equal(final.voyages.filter(v=>v.readOnly).length,2);
 assert.deepEqual(errors,[]);const report={passed:true,browser:browserName,menuRestartArchives:true,accountRestartArchives:true,oneActiveVoyage:true,captainIdentityStable:true,archiveJournalReadOnly:true,oldTabDraftHeld:true,reopenFollowsActive:true,existingSavesPreserved:true,viewports:3,physicalDevice:false,errors};await writeFile(join(output,'browser-'+browserName+'.json'),JSON.stringify(report,null,2)+'\n');console.log('PASS '+JSON.stringify(report));
}finally{await browser.close();await new Promise(r=>server.close(r));await database.close();}
})().catch(e=>{console.error(String(e.stack||e).slice(0,5000));process.exitCode=1;});
