import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import {homedir} from 'node:os';
const require=createRequire(join(process.env.SPACETRADER_NODE_MODULES||join(homedir(),'.codex/.chatgpt-projects/g-p-6a6cafad42f48191ac7d11c61811b6e5/roles/node_modules'),'mobile-scroll.cjs'));
const {chromium,webkit}=require('playwright-core'),E=require(resolve('Browser/engine.js'));
const root=resolve('Web/.vercel/output/static'),out=resolve(process.env.REVIEW_OUTPUT||'Research/PurchasedFleet-2026-10-28');
// Synthetic local-browser voyage only. No account sign-in, server writes or player saves.
process.env.REVIEW_TAG ||= 'after';
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{try{if(req.url.startsWith('/api/')){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({configured:false,signedIn:false}));}let path=new URL(req.url,'http://local').pathname;if(path.endsWith('/'))path+='index.html';const file=resolve(root,'.'+decodeURIComponent(path));if(!file.startsWith(root+'/'))throw Error('Path');res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const engine=process.env.REVIEW_BROWSER||'webkit',cache=join(homedir(),'Library/Caches/ms-playwright'),installed=(await readdir(cache)).filter(n=>n.startsWith(engine==='webkit'?'webkit-':'chromium_headless_shell-')).sort().reverse()[0];
const browser=await({chromium,webkit}[engine]).launch({headless:true,executablePath:join(cache,installed,engine==='webkit'?'pw_run.sh':'chrome-headless-shell-mac-arm64/chrome-headless-shell')});
let fixture=E.transact(E.fresh(),'create',{name:'Purchase browser review',background:'engineer',temperament:'measured'});fixture.credits=2000000;
const results=[];try{for(const [size,width,height]of [['phone',390,740],['desktop',1440,900]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:size==='phone',isMobile:size==='phone'}),page=await context.newPage();
 await page.goto((process.env.REVIEW_ORIGIN||'http://127.0.0.1:'+server.address().port)+'/play/');await page.waitForFunction(()=>typeof sharedSession!=='undefined'&&!!sharedSession);
 async function load(s){await page.evaluate(async raw=>{await sharedSession.write('auto',raw);publicStartMenu=false;state=E.parse(raw);closeModal(true);render();registryBuySelection='registry-new:kestrel';registryMode='buy';visitVenue('fleet');},JSON.stringify(s));}
 async function click(sel){await page.locator(sel).first().click();await page.evaluate(async()=>await actionQueue);}
 await load(fixture);await click('[data-action="purchase-ship"][data-id="kestrel"]');await page.waitForFunction(()=>state.fleet.length===1);
 const id=await page.evaluate(()=>state.fleet[0].id);if(!await page.evaluate(()=>state.fleet[0].escort&&E.fleetOverview(state).count===2&&E.fleetStatus(state).berthedCount===0))throw Error('Purchase did not join');
 await page.evaluate(id=>{fleetRegisterSelections.set('Fleet overview',id);showUtility('Fleet overview');},id);
 await page.locator('[data-action="fleet-membership"]').filter({hasText:'Leave at this berth'}).click();await page.waitForFunction(()=>!state.fleet[0].escort);
 await page.evaluate(id=>{fleetRegisterSelections.set('At berth',id);showUtility('At berth');},id);await click('[data-action="fleet-membership"]');await page.waitForFunction(()=>state.fleet[0].escort);
 let r=E.transact(fixture,'purchase-ship',{ship:'kestrel'}),rid=r.fleet[0].id;r.fleet[0].hull=77;r=E.transact(r,'sell-ship',{id:rid});await load(r);await click('[data-action="registry-select"][data-id="'+rid+'"]');await click('[data-action="purchase-registry-ship"]');await page.waitForFunction(()=>state.fleet.length===1);if(!await page.evaluate(()=>state.fleet[0].escort&&state.fleet[0].hull===77))throw Error('Repurchase lost assignment/condition');
 await page.screenshot({path:join(out,'purchase-'+engine+'-'+size+'.png')});results.push({engine,size,purchase:true,explicitBerth:true,rejoin:true,repurchase:true});await context.close();
}}finally{await writeFile(join(out,'purchase-'+engine+'.json'),JSON.stringify(results,null,2));await browser.close();await new Promise(r=>server.close(r));}
console.log('PASS '+results.length+' browser purchase/berth/repurchase scenarios.');
