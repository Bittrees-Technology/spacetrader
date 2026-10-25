'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),E=require('../../Browser/engine.js');
const src=fs.readFileSync('Browser/app.js','utf8'),calls=[],pane={scrollTop:50};let renders=0;
const ctx={E,registryMode:'buy',registryBuySelection:'',registrySalePending:'',outfitID:'',modalKind:'establishment',venueID:'fleet',conversationVisit:1,fmt:n=>Math.round(n).toLocaleString('en'),dec:n=>n.toFixed(1),esc:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),btn:(text,action,args='',disabled=false)=>`<button data-action="${action}" ${args} ${disabled?'disabled':''}>${text}</button>`,campaignServices:()=>'',civilianServices:()=>'',refreshVisitModal:()=>{renders++;},$:()=>({querySelector:()=>pane})};
ctx.act=async(type,args)=>{calls.push({type,args});try{ctx.state=E.parse(JSON.stringify(E.transact(ctx.state,type,args)));return true;}catch(e){ctx.error=e.message;return false;}};
vm.createContext(ctx);require('./station-label-test-helpers.cjs')(ctx);
ctx.fleetRegisterSelections=new Map();ctx.showUtility=(name,filter)=>{ctx.opened={name,filter};};
for(const name of ['showRegistryShipSummary','fleetOwnedHull','fleetShipPreview','registryPreviewHull','registryInspection','registryUpgradePanel','registryShipList','handleRegistryAction','registryPanel']){const start=src.search(new RegExp('(?:async )?function '+name+'\\('));const rest=src.slice(start+1),end=rest.search(/\n(?:async )?function /);vm.runInContext(src.slice(start,end<0?undefined:start+1+end),ctx);}
function fixture(){let s=E.transact(E.fresh(),'create',{name:'Registry controls QA',background:'engineer',temperament:'measured'});s.credits=5000000;s.profile.xp.navigation=5000;for(const [id,shipID,location] of [['cheap','kestrel','earth'],['fitted','kestrel','earth'],['remote','tern','moon']]){const v=E.activeHull(s);Object.assign(v,{id,name:'Test '+id,shipID,location,escort:false,cargo:{},cargoBasis:{},fuel:0,spares:0});if(id==='fitted')v.upgrades.cargo=3;s.fleet.push(v);}s=E.transact(s,'sell-ship',{id:'fitted'});E.validate(s);return s;}
function click(action,id,extra={}){return ctx.handleRegistryAction(action,{dataset:{id,...extra},disabled:false,isConnected:false});}
function prices(html){return [...html.matchAll(/class="registry-choice-price">([\d,]+) cr/g)].map(m=>Number(m[1].replaceAll(',','')));}
function sorted(html){const p=prices(html);assert(p.length>0);assert.deepEqual(p,[...p].sort((a,b)=>a-b));assert(!html.includes('<select'));return p;}
(async()=>{
 ctx.state=fixture();fs.mkdirSync('Build/RegistryControlsReview/test-save',{recursive:true});fs.writeFileSync('Build/RegistryControlsReview/test-save/voyage.json',JSON.stringify(ctx.state));
 assert(src.includes('if(await handleRegistryAction(a,b))return;'),'Delegated click dispatcher must actually call registry handler');
 sorted(ctx.registryPanel());assert(ctx.registryPanel().includes('data-id="fitted"'));
 const baseline=JSON.stringify(ctx.state);await click('registry-mode','upgrades');assert.equal(ctx.registryMode,'upgrades');assert.equal(pane.scrollTop,0);assert.equal(prices(ctx.registryPanel()).length,0);assert(ctx.registryPanel().includes('0/27 upgrades'));await click('registry-select','cheap');assert.equal(ctx.outfitID,'cheap');assert.equal(JSON.stringify(ctx.state),baseline,'Presentation changes must not transact');
 for(const id of [ctx.state.flagshipID,'cheap']){
  ctx.outfitID=id;const html=ctx.registryPanel();assert(html.includes('data-action="registry-summary" data-id="'+id+'"'));const raw=JSON.stringify(ctx.state);
  ctx.showRegistryShipSummary(id);assert.deepEqual(ctx.opened,{name:'Fleet overview',filter:'all'});assert.equal(ctx.fleetRegisterSelections.get('Fleet overview'),id);assert.equal(JSON.stringify(ctx.state),raw);
 }
 // Another hull of the same class must not redirect a stale ship link.
 ctx.outfitID='cheap';ctx.opened=null;ctx.showRegistryShipSummary(ctx.state.flagshipID);assert.equal(ctx.opened,null);
 ctx.showRegistryShipSummary('missing');assert.equal(ctx.opened,null);
 ctx.registryMode='buy';assert(!ctx.registryPanel().includes('data-action="registry-summary"'));ctx.showRegistryShipSummary('cheap');assert.equal(ctx.opened,null);
 ctx.registryMode='upgrades';ctx.venueID='shipyard';ctx.showRegistryShipSummary('cheap');assert.equal(ctx.opened,null);ctx.venueID='fleet';ctx.modalKind='utility';ctx.showRegistryShipSummary('cheap');assert.equal(ctx.opened,null);ctx.modalKind='establishment';ctx.outfitID='cheap';
 assert(src.includes("if(a==='registry-summary'){showRegistryShipSummary(b.dataset.id);return;}"));
 const cost=E.fittingCosts('kestrel','cargo')[0],cash=ctx.state.credits;await click('fit-upgrade','cheap',{module:'cargo'});assert.equal(ctx.state.fleet.find(v=>v.id==='cheap').upgrades.cargo,1);assert.equal(ctx.state.credits,cash-cost);assert.equal(ctx.state.upgrades.cargo,0,'Upgrade must affect selected ship only');assert(ctx.registryPanel().includes('1/27 upgrades'));assert.equal(prices(ctx.registryPanel()).length,0);
 await click('registry-mode','sell');sorted(ctx.registryPanel());await click('registry-select','cheap');const before=JSON.stringify(ctx.state),q=E.registrySale(ctx.state,'cheap');await click('registry-sell-review','cheap');assert.equal(ctx.registrySalePending,'cheap');assert(ctx.registryPanel().includes('Confirm sale'));await click('registry-sell-cancel');assert.equal(JSON.stringify(ctx.state),before);
 await click('registry-sell-confirm','cheap',{price:q.salePrice});assert.equal(JSON.stringify(ctx.state),before,'Unreviewed confirmation must not sell');
 await click('registry-sell-review','cheap');await click('registry-sell-confirm','cheap',{price:q.salePrice-1});assert.match(ctx.error,/quote changed/);assert.equal(JSON.stringify(ctx.state),before);
 await click('registry-sell-confirm','cheap',{price:q.salePrice});assert(!ctx.state.fleet.some(v=>v.id==='cheap'));assert.equal(ctx.state.credits,JSON.parse(before).credits+q.salePrice);assert.equal(ctx.registrySalePending,'');
 await click('registry-mode','buy');await click('registry-select','cheap');sorted(ctx.registryPanel());const beforeBuy=ctx.state.credits;await click('purchase-registry-ship','cheap',{price:q.fullPrice});assert.equal(ctx.state.credits,beforeBuy-q.fullPrice);assert.equal(ctx.state.fleet.find(v=>v.id==='cheap').upgrades.cargo,1);
 const offer=E.shipMarket(ctx.state).ships.map(id=>E.shipOffer(ctx.state,id)).find(o=>o.canBuy);assert(offer);const n=ctx.state.fleet.length;await click('purchase-ship',offer.id||E.shipMarket(ctx.state).ships.find(id=>E.shipOffer(ctx.state,id).canBuy));assert.equal(ctx.state.fleet.length,n+1);
 const old=ctx.state.flagshipID;await click('registry-command','cheap');assert.equal(ctx.state.flagshipID,'cheap');assert(ctx.state.fleet.some(v=>v.id===old));
 await click('registry-mode','sell');ctx.registryPanel();assert(!ctx.registryPanel().includes('Test remote'));await click('registry-sell-review',ctx.state.flagshipID);assert.equal(ctx.registrySalePending,'');
 assert(renders>=10);assert.equal(await ctx.handleRegistryAction('not-registry',{dataset:{}}),false);console.log('PASS exact flagship/berthed vessel summary navigation, stale link protection, no preview link, read-only navigation; actual registry dispatcher wiring, tabs, selection, unified price order, upgrade charging, sale confirmation/cancel/stale quote, buyback, factory purchase, command transfer, remote/flagship protection, and save round-trip');
})().catch(e=>{console.error(e);process.exitCode=1;});
