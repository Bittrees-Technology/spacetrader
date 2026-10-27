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
const database=new PGlite();await database.exec(await readFile('Web/account/schema.sql','utf8'));await database.exec(await readFile('Web/account/migrations/002-voyage-library.sql','utf8'));await database.exec(await readFile('Web/account/migrations/003-compact-journal.sql','utf8'));await database.exec(await readFile('Web/account/migrations/004-efficient-saves.sql','utf8'));await database.exec(await readFile('Web/account/migrations/005-batched-saves.sql','utf8'));await database.exec(await readFile('Web/account/migrations/006-single-active-voyage.sql','utf8'));await database.exec(await readFile('Web/account/migrations/007-linked-identities.sql','utf8'));await database.exec(await readFile('Web/account/migrations/008-score-archives.sql','utf8'));await database.exec('SET search_path=pg_catalog,spacetrader,pg_temp');
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
api=createApi({env:{APP_ORIGIN:origin,SPACETRADER_ACCOUNTS_ENABLED:'1',SPACETRADER_SINGLE_ACTIVE_VOYAGE:'1',SPACETRADER_IDENTITY_SCHEMA:'1',SPACETRADER_LINKED_LOGINS:'1',SPACETRADER_SCORE_ARCHIVES:'1',SPACETRADER_BATCH_SAVES:'1',SPACETRADER_EFFICIENT_READS:'1',SPACETRADER_EFFICIENT_SAVES:'1',SPACETRADER_ACCOUNT_STORAGE_BYTES:'16777216',SPACETRADER_TOTAL_STORAGE_BYTES:'134217728',SPACETRADER_EMAIL_DAILY_LIMIT:'20',SPACETRADER_EMAIL_MONTHLY_LIMIT:'500'},sql,sendMail:async(email,code)=>codes.push({email,code}),verifyWallet:({message,signature})=>verifyMessage({message,signature,address:parseSiweMessage(message).address})});
const browserName=process.env.SPACETRADER_TEST_BROWSER==='webkit'?'webkit':'chromium',browserType=browserName==='webkit'?webkit:chromium;
const cache=join(homedir(),'Library/Caches/ms-playwright'),installations=(await readdir(cache)).filter(name=>name.startsWith(browserName==='webkit'?'webkit-':'chromium_headless_shell-')).sort().reverse();
assert(installations.length,'Existing test browser installation required; no browser download started.');
const executablePath=join(cache,installations[0],browserName==='webkit'?'pw_run.sh':'chrome-headless-shell-mac-arm64/chrome-headless-shell'),browser=await browserType.launch({headless:true,executablePath});

const output=resolve('Research/ScoreArchives-2026-10-27');await mkdir(output,{recursive:true});const errors=[];
try{
 const auth=createAuth({sql,origin,captainScope:true,linkedLogins:true}),login=await auth.establish('scores-ui@example.invalid'),session=await auth.current(new Request(origin+'/api/account/status',{headers:{cookie:'captain-session='+login.key}})),saves=createStorage(sql,{parse:engine.parse,accountLimit:16777216,totalLimit:134217728,compact:true,efficient:true,singleActive:true,linkedLogins:true,scoreArchives:true,netWorth:s=>engine.financialOverview(s).netWorth});
 let initial=engine.transact(engine.fresh(),'create',{name:'Finished captain',background:'trader',temperament:'measured'});for(let seed=1;seed<100;seed++){initial.seed=String(seed);const next=engine.transact(initial,'depart',{destination:'moon'});if(!next.incident&&!next.battle)break;}
 const first=await saves.createVoyage(session.account,{raw:JSON.stringify(initial),operation:'scores-ui',restartFrom:null,revision:null});
 async function context(key){const c=await browser.newContext({viewport:{width:1440,height:900}});await c.addCookies([{name:'captain-session',value:key,url:origin,httpOnly:true,sameSite:'Lax'}]);return c;}
 const ctx=await context(login.key),page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/play/');await page.getByRole('button',{name:'Continue voyage',exact:false}).click();await page.evaluate(()=>{selectNavigation('moon');screen='map';render();});await page.locator('[data-action="depart"]').first().click();await page.waitForFunction(()=>!journey);const completed=await page.evaluate(()=>JSON.stringify(state)),worth=engine.financialOverview(engine.parse(completed)).netWorth;
 await page.evaluate(()=>SpacetraderAccount.open());await page.getByRole('button',{name:'Restart voyage…',exact:true}).click();await page.getByRole('button',{name:'Finish and restart',exact:true}).waitFor();assert(await page.getByText(/saved game and journal will be deleted/).count());await page.getByRole('button',{name:'Keep current voyage',exact:true}).click();assert.equal((await saves.library(session.account)).scores.length,0);
 await page.getByRole('button',{name:'Restart voyage…',exact:true}).click();await page.getByRole('button',{name:'Finish and restart',exact:true}).click();await page.locator('#captain-name').waitFor();const active=await page.evaluate(()=>sharedSession.snapshot.voyage);assert.notEqual(active,first.id);const library=await saves.library(session.account);assert.equal(library.voyages.length,1);assert.equal(library.scores.length,1);assert.equal(library.scores[0].netWorth,worth);assert.equal((await sql`SELECT id FROM spacetrader_voyages WHERE id=${first.id}::uuid`).length,0);
 await page.locator('#captain-name').fill('Current captain');await page.locator('#character-form').evaluate(form=>form.requestSubmit());await page.waitForFunction(()=>state.profile.name==='Current captain'&&state.profile.created);assert(await page.evaluate(()=>sharedAction('depart',{destination:'moon'})));await page.waitForFunction(()=>!journey);const latest=await page.evaluate(()=>JSON.stringify(state));
 await page.evaluate(()=>SpacetraderAccount.open());await page.getByRole('heading',{name:'High scores',exact:true}).waitFor();const scores=page.getByRole('region',{name:'Finished voyage high scores'});assert(await scores.getByText('Finished captain',{exact:true}).count());assert(await scores.getByText(/Final net worth/).count());assert.equal(await page.getByRole('button',{name:'View archived journal',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'Load voyage',exact:true}).count(),1);
 for(const[name,width,height]of[['desktop',1440,900],['ipad',768,1024],['phone',390,844]]){await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:join(output,'scores-'+browserName+'-'+name+'.png')});}
 const secondLogin=await auth.establish('scores-ui@example.invalid'),other=await context(secondLogin.key),tablet=await other.newPage();await tablet.setViewportSize({width:768,height:1024});tablet.on('pageerror',e=>errors.push(e.message));await tablet.goto(origin+'/play/');await tablet.getByRole('button',{name:'Continue voyage',exact:false}).click();assert.equal(await tablet.evaluate(()=>JSON.stringify(state)),latest);await tablet.evaluate(()=>SpacetraderAccount.open());await tablet.getByRole('heading',{name:'High scores',exact:true}).waitFor();assert.equal(await tablet.getByRole('button',{name:'Load voyage',exact:true}).count(),1);assert.equal((await saves.snapshot(session.account,active,false)).raw,latest);assert.deepEqual(errors,[]);await other.close();await ctx.close();
 const report={passed:true,browser:browserName,oneLoadableVoyage:true,finalNetWorthMatchesEngine:true,restartWarnsAndCanCancel:true,retiredGameAndJournalDeleted:true,scoreOnlyArchiveUI:true,highScoresAcrossIndependentSessions:true,viewports:3,physicalDevice:false,errors};await writeFile(join(output,'browser-'+browserName+'.json'),JSON.stringify(report,null,2)+'\n');console.log('PASS '+JSON.stringify(report));
}finally{await browser.close();await new Promise(r=>server.close(r));await database.close();}
})().catch(e=>{console.error(String(e.stack||e).slice(0,5000));process.exitCode=1;});
