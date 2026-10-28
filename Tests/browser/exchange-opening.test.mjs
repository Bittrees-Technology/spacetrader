import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import {homedir} from 'node:os';
const require=createRequire(join(process.env.SPACETRADER_NODE_MODULES||join(homedir(),'.codex/.chatgpt-projects/g-p-6a6cafad42f48191ac7d11c61811b6e5/roles/node_modules'),'mobile-scroll.cjs'));
const {chromium,webkit}=require('playwright-core'),E=require(resolve('Browser/engine.js'));
const root=resolve('Web/.vercel/output/static'),out=resolve(process.env.REVIEW_OUTPUT||'Research/ExchangeFleetDefault-2026-10-28');
// Synthetic local-browser voyage only. No account sign-in, server writes or player saves.
process.env.REVIEW_TAG ||= 'after';
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{try{if(req.url.startsWith('/api/')){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({configured:false,signedIn:false}));}let path=new URL(req.url,'http://local').pathname;if(path.endsWith('/'))path+='index.html';const file=resolve(root,'.'+decodeURIComponent(path));if(!file.startsWith(root+'/'))throw Error('Path');res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const engine=process.env.REVIEW_BROWSER||'webkit',cache=join(homedir(),'Library/Caches/ms-playwright'),installed=(await readdir(cache)).filter(n=>n.startsWith(engine==='webkit'?'webkit-':'chromium_headless_shell-')).sort().reverse()[0];
const browser=await({chromium,webkit}[engine]).launch({headless:true,executablePath:join(cache,installed,engine==='webkit'?'pw_run.sh':'chrome-headless-shell-mac-arm64/chrome-headless-shell')});
let fixture=E.transact(E.fresh(),'create',{name:'Fleet inventory default',background:'engineer',temperament:'measured'});fixture.credits=2000000;fixture=E.transact(fixture,'warehouse-buy',{port:'earth'});fixture=E.transact(fixture,'buy',{good:'water',units:3});fixture=E.transact(fixture,'buy',{good:'water',units:7,delivery:{kind:'warehouse',port:'earth'}});
const results=[],errors=[];try{for(const [size,width,height]of [['phone',390,740],['desktop',1440,900]].filter(([name])=>!process.env.REVIEW_SIZES||process.env.REVIEW_SIZES.split(',').includes(name))){
 const context=await browser.newContext({viewport:{width,height},hasTouch:size==='phone',isMobile:size==='phone'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.REVIEW_ORIGIN||'http://127.0.0.1:'+server.address().port)+'/play/');await page.waitForFunction(()=>typeof sharedSession!=='undefined'&&!!sharedSession);
 await page.evaluate(async raw=>{await sharedSession.write('auto',raw);publicStartMenu=false;state=E.parse(raw);closeModal(true);render();visitVenue('market');},JSON.stringify(fixture));
 async function check(name,kind){const view=await page.evaluate(()=>({source:selectedMarketSource().kind,delivery:selectedMarketDelivery().kind,mode:marketMode(),pressed:[...document.querySelectorAll('[data-action="market-source"][aria-pressed="true"]')].map(e=>e.dataset.source)}));results.push({engine,size,name,expected:kind,...view});await writeFile(join(out,process.env.REVIEW_TAG+'-'+engine+'.json'),JSON.stringify({results,errors},null,2));if(view.source!==kind||view.delivery!==kind||!view.pressed.includes(kind))throw Error(name+': '+JSON.stringify(view));}
 async function click(selector){const b=page.locator(selector).first();if(size==='phone')await b.tap();else await b.click();await page.evaluate(async()=>await actionQueue);await page.waitForTimeout(80);}
 await check('first entry','fleet');
 for(const mode of ['buy','sell']){
  await click('[data-action="market-mode"][data-mode="'+mode+'"]');await click('[data-action="market-source"][data-source="warehouse"]');await check(mode+' explicit warehouse','warehouse');
  const before=await page.evaluate(()=>({fleet:E.fleetOverview(state).cargo.water||0,stored:state.warehouses.earth.cargo.water||0}));await click('[data-market-product="water"] [data-action="'+mode+'"]');await page.waitForFunction(({before,delta})=>(state.warehouses.earth.cargo.water||0)===before.stored+delta,{before,delta:mode==='buy'?1:-1});const after=await page.evaluate(()=>E.fleetOverview(state).cargo.water||0);if(after!==before.fleet)throw Error('Warehouse trade changed fleet cargo');await check(mode+' warehouse trade retained','warehouse');
  await click('[data-market-product="water"] [data-action="market-price"]');await click('[data-action="market-price-back"]');await check(mode+' price Back retains choice','warehouse');
  const beforeReopen=await page.evaluate(()=>JSON.stringify(state));await click('#modal [data-action="close"]');await click('[data-action="venue"][data-id="market"]');await check(mode+' reopened defaults to fleet','fleet');if(await page.evaluate(()=>marketMode())!==mode)throw Error('Opening inventory changed trade mode');if(await page.evaluate(()=>JSON.stringify(state))!==beforeReopen)throw Error('Opening Exchange changed game data');
 }
 await page.evaluate(()=>{closeModal(true);state.location='moon';marketSourcesByPort.set('moon','warehouse');marketDestinationsByPort.set('moon','warehouse');render();visitVenue('market');});await check('station without owned warehouse','fleet');await page.screenshot({path:join(out,process.env.REVIEW_TAG+'-'+engine+'-'+size+'.png')});await context.close();
}}
finally{await writeFile(join(out,process.env.REVIEW_TAG+'-'+engine+'.json'),JSON.stringify({results,errors},null,2));await browser.close();await new Promise(r=>server.close(r));}
if(errors.length)throw Error(errors.join('; '));console.log('PASS '+results.length+' fleet-default, explicit warehouse trade and return-navigation checks.');
