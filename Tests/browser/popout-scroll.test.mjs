import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import {homedir} from 'node:os';
const require=createRequire(join(process.env.SPACETRADER_NODE_MODULES||join(homedir(),'.codex/.chatgpt-projects/g-p-6a6cafad42f48191ac7d11c61811b6e5/roles/node_modules'),'mobile-scroll.cjs'));
const {chromium,webkit}=require('playwright-core'),E=require(resolve('Browser/engine.js'));
const root=resolve('Web/.vercel/output/static'),out=resolve(process.env.REVIEW_OUTPUT||'Research/ScrollButtonRegression-2026-10-27');
// Synthetic local-browser voyage only. No account sign-in, server writes or player saves.
process.env.REVIEW_TAG ||= 'after';
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{try{if(req.url.startsWith('/api/')){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({configured:false,signedIn:false}));}let path=new URL(req.url,'http://local').pathname;if(path.endsWith('/'))path+='index.html';const file=resolve(root,'.'+decodeURIComponent(path));if(!file.startsWith(root+'/'))throw Error('Path');res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const engine=process.env.REVIEW_BROWSER||'webkit',cache=join(homedir(),'Library/Caches/ms-playwright'),installed=(await readdir(cache)).filter(n=>n.startsWith(engine==='webkit'?'webkit-':'chromium_headless_shell-')).sort().reverse()[0];
const browser=await({chromium,webkit}[engine]).launch({headless:true,executablePath:join(cache,installed,engine==='webkit'?'pw_run.sh':'chrome-headless-shell-mac-arm64/chrome-headless-shell')});
let fixture=E.transact(E.fresh(),'create',{name:'Button scroll review',background:'engineer',temperament:'measured'});
fixture.credits=2000000;for(const key of Object.keys(fixture.profile.xp))fixture.profile.xp[key]=50000;
fixture.visited=fixture.unlocked=E.world.ports.map(p=>p.id);
fixture=E.transact(fixture,'warehouse-buy',{port:'earth'});fixture=E.transact(fixture,'deposit',{amount:10000});fixture=E.transact(fixture,'buy',{good:'water',units:4});fixture=E.transact(fixture,'buy',{good:'food',units:4});
fixture.hull=80;fixture.spares=0;fixture.stationServices={crewReadiness:75,reportedVoyages:0,supplyDays:{},researchDays:{},completedStudies:0};
for(let i=0;i<12;i++){const hull=E.activeHull(fixture);Object.assign(hull,{id:'scroll-ship-'+i,name:'Review ship '+i,location:'earth',escort:i===0,cargo:{},cargoBasis:{}});fixture.fleet.push(hull);}
fixture.warehouses.earth.cargo={food:5};fixture.warehouses.earth.cargoBasis={food:{units:5,cost:500}};E.validate(fixture);
const results=[],errors=[],skipped=[],inventory=[];
const owners=['#modal','.establishment-layout','.visit-people','.visit-services','.utility-content','.registry-content','.registry-list','.fleet-register-list','.fleet-register-detail','.dock-content','.exchange-list','.warehouse-list','.drive-archive','.audio-settings','.report-content'];
try{for(const [size,width,height] of [['phone',390,740],['landscape',844,390],['ipad',768,1024],['desktop',1440,900]].filter(([name])=>!process.env.REVIEW_SIZES||process.env.REVIEW_SIZES.split(',').includes(name))){
 const context=await browser.newContext({viewport:{width,height},isMobile:size!=='desktop',hasTouch:size!=='desktop'}),page=await context.newPage();let loads=0;page.on('load',()=>loads++);page.on('pageerror',e=>errors.push({size,message:e.message}));
 await page.goto((process.env.REVIEW_ORIGIN||'http://127.0.0.1:'+server.address().port)+'/play/');await page.waitForFunction(()=>typeof sharedSession!=='undefined'&&!!sharedSession);
 const measure=()=>page.evaluate(selectors=>({kind:modalKind,sequence:sharedSession.snapshot.sequence,panes:Object.fromEntries(selectors.map(s=>{const e=document.querySelector(s);return[s,e?{top:e.scrollTop,max:Math.max(0,e.scrollHeight-e.clientHeight)}:null];}))}),owners);
 const settle=async()=>{await page.evaluate(async()=>{await actionQueue;});await page.waitForFunction(()=>!sharedBusy&&!battleProfilePending,{timeout:8000});await page.waitForTimeout(100);};
 const save=()=>writeFile(join(out,process.env.REVIEW_TAG+'-'+engine+'.json'),JSON.stringify({results,errors,skipped,inventory},null,2));
 async function reset(venue){await page.evaluate(async({raw,venue})=>{await sharedSession.write('auto',raw);publicStartMenu=false;state=E.parse(raw);closeModal(true);render();if(venue)visitVenue(venue);},{raw:JSON.stringify(fixture),venue});await settle();}
 function compare(before,after,allowed=[]){return Object.keys(before.panes).filter(s=>!allowed.includes(s)&&before.panes[s]&&after.panes[s]&&Math.abs(after.panes[s].top-Math.min(before.panes[s].top,after.panes[s].max))>2);}
 async function click(name,selector,{navigate=false,allow=[],change,optional=false,expected,nudge=false}={}){
  const b=page.locator(selector).first();if(!await b.count()||!await b.isEnabled()){if(optional){skipped.push({size,name,reason:'Unavailable in the synthetic fixture'});return null;}throw Error(name+' is missing or disabled: '+selector);}
  await b.scrollIntoViewIfNeeded();if(nudge)await page.locator('#modal').evaluate(e=>{e.scrollTop=Math.min(20,e.scrollHeight-e.clientHeight);});await page.waitForTimeout(60);const before=await measure();
  if(change)await change(b);else if(size==='desktop')await b.click();else await b.tap();await settle();const after=await measure(),jumps=navigate?[]:compare(before,after,allow);
  const recordsAction=/conversation (first|follow-up)$|^exchange (buy|sell)$|^bank (deposit|withdraw)$|^borrow |^repay loan$|^warehouse (store|collect)$|^dock-(fill|repair|spares)$|^accept (bounty|freight)$|^coordinator briefing$|^clinic (recovery|research)$|^canteen round$|^profile (strategy|defaults)$/.test(name);if(recordsAction&&!(after.sequence>before.sequence))errors.push({size,name,message:'Action did not record a new game outcome'});if(expected)await expected();const row={size,name,before,after,jumps,navigate,loads};results.push(row);if(loads!==1)errors.push({size,name,message:'Unexpected document load'});if(jumps.length){console.log('JUMP',size,name,jumps);await page.screenshot({path:join(out,process.env.REVIEW_TAG+'-'+engine+'-'+size+'-'+name.replace(/[^a-z0-9]+/gi,'-')+'.png')});}await save();return before;
 }
 async function roundTrip(name,openSelector,backSelector){const before=await click(name+' open',openSelector,{navigate:true});if(!before)return;await click(name+' return',backSelector,{navigate:true});const after=await measure(),jumps=compare(before,after);results.push({size,name:name+' parent restored',before,after,jumps,navigate:false,loads});if(jumps.length){console.log('JUMP',size,name+' parent restored',jumps);await page.screenshot({path:join(out,process.env.REVIEW_TAG+'-'+engine+'-'+size+'-'+name.replace(/[^a-z0-9]+/gi,'-')+'-return.png')});}await save();}
 for(const venue of ['market','contracts','shipyard','fleet','security','relay','clinic','local','bank','authority','warehouse']){
  await reset(venue);inventory.push({size,venue,buttons:await page.locator('#modal button[data-action]').evaluateAll(xs=>xs.map(e=>({action:e.dataset.action,text:e.textContent,disabled:e.disabled})))});
  await click(venue+' conversation first','[data-action="venue-talk"]');await click(venue+' conversation follow-up','[data-action="venue-talk"]');
  await click(venue+' more replies','[data-action="exchange-replies"]',{optional:true});
  if(venue==='bank'){await roundTrip('staff portrait','[data-action="portrait"]','[data-action="close"]');}
 }
 await reset('market');for(const source of ['warehouse','fleet'])await click('exchange inventory '+source,'[data-action="market-source"][data-source="'+source+'"]');
 await click('exchange sell mode','[data-action="market-mode"][data-mode="sell"]');await click('exchange buy mode','[data-action="market-mode"][data-mode="buy"]');
 for(const delta of [1,-1])await click('exchange quantity '+delta,'[data-market-product="water"] [data-delta="'+delta+'"]');
 await click('exchange max','[data-market-product="water"] [data-action="market-max"]');await page.locator('[data-market-quantity="water"]').fill('1');await click('exchange buy','[data-market-product="water"] [data-action="buy"]');await click('exchange sell mode again','[data-action="market-mode"][data-mode="sell"]');await click('exchange sell','[data-market-product="water"] [data-action="sell"]');
 await roundTrip('price details','[data-market-product="food"] [data-action="market-price"]','[data-action="market-price-back"]');
 await reset('bank');await click('deposit amount plus','[data-action="bank-amount-step"][data-bank-scope="deposits"][data-delta="1000"]');await click('deposit amount minus','[data-action="bank-amount-step"][data-bank-scope="deposits"][data-delta="-1000"]');
 for(const kind of ['deposit','withdraw']){await page.locator('#bank-deposits-amount').fill('100');await click('bank '+kind,'[data-action="bank-action"][data-bank-manual="'+kind+'"]');}
 await click('bank borrow maximum fills','[data-action="bank-borrow-max"]');for(const mode of ['floating','fixed']){await page.locator('#bank-credit-amount').fill('100');await click('borrow '+mode,'[data-action="bank-action"][data-rate-mode="'+mode+'"]');}await page.locator('#bank-credit-amount').fill('100');await click('repay loan','[data-action="bank-action"][data-bank-manual="repay"]');
 await reset('warehouse');await click('warehouse select water','[data-action="warehouse-select"][data-id="water"]');await click('warehouse quantity plus','[data-action="warehouse-step"][data-delta="1"]');await click('warehouse quantity minus','[data-action="warehouse-step"][data-delta="-1"]');await click('warehouse max','[data-action="warehouse-max"]');await page.locator('[data-warehouse-quantity]').fill('1');await click('warehouse store','[data-action="warehouse-transfer"]');await click('warehouse collect mode','[data-action="warehouse-mode"][data-mode="collect"]');await click('warehouse select food','[data-action="warehouse-select"][data-id="food"]');await click('warehouse collect','[data-action="warehouse-transfer"]');
 await reset('shipyard');await click('dock ship selection','#dock-selection',{change:b=>b.selectOption('scroll-ship-1'),allow:['.dock-content']});await click('dock fleet selection','#dock-selection',{change:b=>b.selectOption('active'),allow:['.dock-content']});for(const id of ['dock-fill','dock-repair','dock-spares'])await click(id,'#'+id,{optional:true});
 await reset('security');await click('accept bounty','[data-action="accept-bounty"]:not([disabled])',{optional:true});await roundTrip('patrol report','[data-action="patrol-report"]','[data-action="establishment-return"]');
 await reset('contracts');await click('accept freight','[data-action="accept"]:not([disabled])',{optional:true});
 await reset('relay');await click('coordinator destination','#coordinator-destination',{change:async b=>{const option=await b.locator('option:not([disabled])').last().getAttribute('value');await b.selectOption(option);},optional:true});await click('coordinator briefing','[data-action="coordinator-brief"]',{optional:true});
 await reset('clinic');await click('clinic recovery','[data-action="clinic-recover"]',{optional:true});await click('clinic research','[data-action="clinic-research"]',{optional:true});
 await reset('local');await click('canteen round','[data-action="buy-round"]',{optional:true});
 await reset();await page.evaluate(()=>showUtility('Fleet overview','all'));await click('fleet select','[data-action="fleet-select"][data-id="scroll-ship-9"]');await roundTrip('battle profile','[data-action="ship-battle-profile"]','[data-action="profile-fleet-return"]');await click('profile open','[data-action="ship-battle-profile"]',{navigate:true});
 await click('profile strategy','[data-profile-field="priority"]',{change:b=>b.selectOption('weakest')});await click('profile defaults','[data-action="ship-profile-defaults"]');await click('profile close','[data-action="profile-fleet-return"]',{navigate:true});
 await reset();await page.evaluate(()=>showGameMenu());for(const [name,selector]of [['engine story','drive-story'],['audio','audio-settings'],['progress','ledger'],['restart confirmation','new']])await roundTrip('menu '+name,'[data-action="'+selector+'"]','[data-action="menu-back"]');
 await click('audio open','[data-action="audio-settings"]',{navigate:true});await click('audio mute','[data-action="audio-mute"]',{nudge:true});await click('audio unmute','[data-action="audio-mute"]');await click('audio volume','#audio-music',{change:async b=>{await b.fill('30');await b.dispatchEvent('input');}});await click('audio sample','[data-action="audio-test"]',{optional:true});await click('audio back','[data-action="menu-back"]',{navigate:true});
 await save();await context.close();
}}
finally{await writeFile(join(out,process.env.REVIEW_TAG+'-'+engine+'.json'),JSON.stringify({results,errors,skipped,inventory},null,2));await browser.close();await new Promise(r=>server.close(r));}
const jumps=results.filter(r=>r.jumps.length);console.log(JSON.stringify({checks:results.length,jumps:jumps.map(r=>({size:r.size,name:r.name,owners:r.jumps})),errors,skipped:skipped.length}));if(errors.length||jumps.length)process.exitCode=1;
