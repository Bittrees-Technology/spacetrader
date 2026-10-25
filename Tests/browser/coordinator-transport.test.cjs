'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),E=require('../../Browser/engine');
// Synthetic contracts captured from the installed v0.72.157 engine before dispatch moved.
const legacy=require('./fixtures/coordinator-legacy.json');
const helperText=fs.readFileSync(require.resolve('./mission-chains.test.cjs'),'utf8').split('const results=[];')[0];
function helpers(engine){const context=vm.createContext({require:id=>id==='../../Browser/engine'?engine:require(id),module:{exports:{}},console});vm.runInContext(helperText+'\nmodule.exports={ready,objective,active,move};',context);return context.module.exports;}
const h=helpers(E),venues={escort:'security',relief:'clinic','cold-relief':'clinic','medical-evacuation':'clinic','delegation-followup':'contracts'};
function ready(kind){if(kind==='escort'||kind==='relief'){const s=h.ready(kind==='relief'?'cold-relief':'delegation-followup');s.campaign.known=[kind,'certificate:cold'];if(kind==='relief'){const v=s.fleet.find(v=>v.shipID==='ibis');v.cargo.medicine=12;v.cargoBasis.medicine={units:12,cost:5040};}return s;}return h.ready(kind);}
const offer=(engine,s,kind,venue)=>{const o=engine.missionOffers(s,venue).find(o=>o.kind===kind);assert(o,kind);assert(o.canAccept,o.reason);return o;};
const parsed=s=>JSON.parse(JSON.stringify(s));let count=0;
function test(name,run){run();count++;console.log('PASS '+name);}
function reject(s,action,args){const before=JSON.stringify(s);assert.throws(()=>E.transact(s,action,args));assert.equal(JSON.stringify(s),before);}
for(const [kind,former] of Object.entries(venues))test(kind+': new dispatch at Communications, signed legacy contract preserved and paid only once',()=>{
 let s=E.parse(JSON.stringify(legacy[kind].initial)),before=legacy[kind].offer;const after=offer(E,s,kind,'relay');
 for(const key of ['id','reward','bonus','lease','liability','duration','assigned','destination','units','mass','terms'])assert.deepEqual(parsed(after[key]),parsed(before[key]),kind+' '+key);
 assert(!E.missionOffers(s,former).some(o=>o.kind===kind));reject(s,'mission-accept',{id:after.id,venue:former});
 s=parsed(legacy[kind].signed);const signed=parsed(s.campaign.jobs[0]),raw=JSON.stringify(s);s=E.parse(raw);assert.deepEqual(parsed(s.campaign.jobs[0]),signed);assert.equal(E.missionJournal(s).active[0].coordinationVenue,'relay');assert.equal(s.campaign.jobs[0].venue,former);
 if(kind==='escort'){h.move(s,signed.destination);}else if(kind==='relief'){h.move(s,signed.destination);s=E.transact(s,'mission-work',{id:signed.id});h.move(s,signed.origin);}else {while(h.active(s).stepIndex<E.missionJournal(s).active[0].objectives.length)s=h.objective(s);}
 const cash=s.credits;s=E.transact(s,'mission-complete',{id:signed.id});assert(s.credits>cash);assert.equal(s.campaign.receipts.filter(r=>r.id===signed.id).length,1);reject(s,'mission-complete',{id:signed.id});assert.deepEqual(parsed(E.parse(JSON.stringify(s))),parsed(s));
});
test('old contracts expire once at their original liability; relocation adds no cargo or cash',()=>{
 let s=parsed(legacy.escort.signed),o=legacy.escort.offer;s.day=s.campaign.jobs[0].deadline;s=E.transact(s,'wait');assert.equal(s.campaign.jobs[0].status,'failed');assert.equal(s.campaign.receipts.filter(r=>r.id===o.id).length,1);reject(s,'mission-complete',{id:o.id});
});
test('passenger discovery belongs to every station coordinator and respects existing qualifications',()=>{
 for(const p of E.world.ports){let s=ready('delegation-followup');delete s.civilian;s.location=p.id;s.visited.push(p.id);for(const v of s.fleet)v.location=p.id;
  assert(E.establishments(p.id,false,s).some(v=>v.id==='relay'));assert(E.operationDiscoveryChoices(s,'relay').some(o=>o.id==='op-discover-passengers'));
  for(const venue of ['contracts','clinic','local'])assert(!E.operationDiscoveryChoices(s,venue).some(o=>o.id==='op-discover-passengers'));
 }
 let s=ready('delegation-followup');delete s.civilian;s=require('./dialogue-introduction.cjs')(E,s,'relay','op-discover-passengers');assert(E.civilianOverview(s).known.includes('passengers'));assert.match(s.dialogue.at(-1).text,/station coordinator/);assert.equal(E.civilianOverview(s).offers.length,0);
});
test('escort conversations and work introductions are at the coordinator, with no automatic acceptance',()=>{
 let s=ready('escort');s.campaign.known=[];assert(E.campaignIntroductions(s,'relay').some(o=>o.id==='campaign-intro-escort'));assert(!E.campaignIntroductions(s,'security').some(o=>o.id==='campaign-intro-escort'));s=require('./dialogue-introduction.cjs')(E,s,'relay','campaign-intro-escort');assert(s.campaign.known.includes('escort'));assert.equal(s.campaign.jobs.length,0);assert.match(s.dialogue.at(-1).text,/work register/);
});
const source=fs.readFileSync(require.resolve('../../Browser/app.js'),'utf8');
const ctx=vm.createContext({E,state:null,esc:s=>String(s??''),fmt:String,dec:String,stationLabel:id=>E.port(id).name,btn:(label,action,data='')=>`<button data-action="${action}" ${data}>${label}</button>`,campaignContractCard:j=>`<article>${j.title}</article>`,objectiveText:String,objectiveTerms:o=>o.terms,baseEstablishmentServices:v=>`<h3>Planning ${v.id}</h3>`,registryPanel:()=>'',dryDockPanel:()=>'',licencePanel:()=>''});
for(const name of ['civilianServices','campaignServices','establishmentServices']){const at=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',at+1);vm.runInContext(source.slice(at,end),ctx);}
test('Communications alone books and disembarks regular/medical passengers; clinics retain care',()=>{
 let s=ready('delegation-followup');s.stationServices={crewReadiness:100,reportedVoyages:0,supplyDays:{},researchDays:{earth:0},completedStudies:1};ctx.state=s;
 assert.match(ctx.civilianServices('relay'),/op-passenger-accept/);for(const venue of ['contracts','clinic','security'])assert(!ctx.civilianServices(venue).includes('op-passenger-accept'));
 const o=E.civilianOverview(s).offers[0];s=E.transact(s,'op-passenger-accept',{id:o.id});s.passengers.welfare=80;ctx.state=s;
 assert.match(ctx.civilianServices('relay'),/op-passenger-deliver/);assert.match(ctx.civilianServices('clinic'),/op-passenger-care/);assert(!ctx.civilianServices('clinic').includes('op-passenger-deliver'));assert(!ctx.civilianServices('contracts').includes('Passenger manifests'));
 const cash=s.credits;h.move(s,s.passengers.destination);s=E.transact(s,'op-passenger-deliver',{ship:s.flagshipID});assert.equal(s.credits,cash+o.reward);reject(s,'op-passenger-deliver',{ship:s.flagshipID});
});
test('signed legacy jobs appear at Communications and dispatch precedes departure planning',()=>{
 let s=parsed(legacy.escort.signed),o=legacy.escort.offer;ctx.state=s;assert(ctx.campaignServices('relay').includes(o.title));assert(!ctx.campaignServices('security').includes(o.title));const html=ctx.establishmentServices({id:'relay'});assert(html.indexOf(o.title)<html.indexOf('Planning relay'));
});
test('Tasks and cancellation routes use the coordination desk for old and new work',()=>{assert(source.includes("port,venue:j.coordinationVenue||j.venue"));assert(source.split('\n').find(l=>l.includes('for(const j of E.passengerManifest(state))')).includes("venue:'relay'"));assert(source.split('\n').find(l=>l.includes('for(const j of E.freightOverview(state).jobs)')).includes("venue:'contracts'"));assert(source.includes('Disembark with the station coordinator at Communications.'));assert(!source.includes('Disembark at the destination freight office.'));assert(source.includes("visitVenue(b.dataset.venue||'contracts')"));assert(source.includes('data-venue="${esc(j.coordinationVenue||j.venue)}"'));});
console.log(count+' coordinator transport scenarios passed.');
