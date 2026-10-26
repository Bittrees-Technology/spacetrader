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

(async()=>{
const database=new PGlite();await database.exec(await readFile('Web/account/schema.sql','utf8'));await database.exec('SET search_path=pg_catalog,spacetrader,pg_temp');
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
 await page.goto(origin+'/play/');await page.locator('#captain-name').fill('Persistence QA');await page.locator('#character-form').evaluate(form=>form.requestSubmit());
 await page.waitForFunction(()=>state?.profile.created);
 assert(await page.evaluate(()=>sharedCheckpoint('slot2',JSON.stringify(state))));
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
 const saves=createStorage(sql,{parse:engine.parse,accountLimit:16777216,totalLimit:134217728});assert.equal((await saves.snapshot(account.id)).raw,null,'Sign-in alone never uploads or replaces a voyage');
 const localSequence=await page.evaluate(()=>sharedSession.snapshot.sequence);
 await page.getByRole('button',{name:'Transfer device voyage & history',exact:true}).click();await page.waitForFunction(()=>window.SpacetraderAccount?.isCloud()&&state?.profile.name==='Persistence QA');
 assert.equal((await saves.snapshot(account.id)).sequence,localSequence);
 assert((await saves.snapshot(account.id)).slots.slot2,'Transfer includes the original device checkpoint');
 const timings=[];
 for(let i=0;i<5;i++){const started=Date.now();assert(await page.evaluate(()=>sharedAction('buy',{good:'water',units:1})));timings.push(Date.now()-started);}
 assert(await page.evaluate(()=>sharedCheckpoint('slot1',JSON.stringify(state))));
 const expected=await saves.snapshot(account.id);assert(expected.slots.slot1);
 await page.close();const reopened=await context.newPage();await reopened.goto(origin+'/play/');await reopened.waitForFunction(()=>window.SpacetraderAccount?.isCloud()&&state?.profile.name==='Persistence QA');
 assert.equal(await reopened.evaluate(()=>sharedSession.snapshot.revision),expected.revision,'Closing a game tab preserves its account voyage');
 const device=await browser.newContext({viewport:{width:768,height:1024}}),other=await device.newPage();await other.goto(origin+'/play/');await other.getByRole('button',{name:'Sign in for account saves',exact:true}).click();
 await other.getByLabel('Email address',{exact:true}).fill('persistence-qa@example.org');await other.getByRole('button',{name:'Send verification code',exact:true}).click();await other.getByLabel('Verification code',{exact:true}).fill(codes.at(-1).code);await other.getByRole('button',{name:'Verify and continue',exact:true}).click();await other.getByRole('button',{name:'Continue account voyage',exact:true}).click();
 await other.waitForFunction(()=>window.SpacetraderAccount?.isCloud()&&state?.profile.name==='Persistence QA');assert.equal(await other.evaluate(()=>sharedSession.snapshot.revision),expected.revision,'A separate browser device loads the same head and checkpoints');
 assert(await reopened.evaluate(()=>sharedAction('buy',{good:'water',units:1})));
 const fresh=await saves.snapshot(account.id);assert.equal(await other.evaluate(()=>sharedAction('buy',{good:'water',units:1})),false,'A stale device cannot repeat a choice against newer progress');
 assert.equal((await saves.snapshot(account.id)).sequence,fresh.sequence);
 assert.equal(await other.evaluate(()=>sharedSession.snapshot.revision),fresh.revision);
 const badWallet=await browser.newContext({viewport:{width:390,height:740}}),walletPage=await badWallet.newPage();await walletPage.clock.install();await walletPage.addInitScript(()=>{window.ethereum={request:()=>new Promise(()=>{})};});await walletPage.goto(origin+'/play/');await walletPage.getByRole('button',{name:'Sign in for account saves',exact:true}).click();await walletPage.getByRole('button',{name:'Sign in with Ethereum',exact:true}).click();await walletPage.clock.fastForward(61000);await walletPage.getByRole('alert').filter({hasText:'wallet did not respond'}).waitFor();assert(await walletPage.getByLabel('Email address',{exact:true}).isEnabled(),'Wallet timeout must restore email controls');
 assert.equal(errors.length,0,errors.join('; '));
 await writeFileSafe(join(output,'ui-verification.json'),{passed:true,layouts:4,closeTabPersistence:true,separateDevicePersistence:true,fullHistoryTransferred:true,checkpoints:true,staleDeviceRejected:true,walletTimeoutRecovery:true,localActionMilliseconds:timings,realEmailsSent:0,externalWalletRPCRequests:0,errors});
 console.log('PASS account UI: four responsive layouts, actual email flow, complete guest-history transfer, checkpoint persistence, closed-tab reopening, second device, stale-device rejection and wallet timeout recovery; zero live emails.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await database.close();}
})().catch(error=>{console.error(String(error.stack||error).slice(0,2500));process.exitCode=1;});
async function writeFileSafe(path,value){const {writeFile}=await import('node:fs/promises');await writeFile(path,JSON.stringify(value,null,2)+'\n');}
