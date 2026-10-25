'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const E=require('../../Browser/engine.js');let checks=0;
function test(name,fn){fn();checks++;console.log('PASS '+name);}
function ready(){return E.transact(E.fresh(),'create',{name:'Drive Test',background:'engineer',temperament:'measured'});}
test('Asterion shortens interplanetary flights with finite clearance, never teleportation',()=>{
 for(const to of ['mars','jupiter','saturn','uranus','neptune']){const q=E.transfer('earth',to,0),old=E.legacyTransfer('earth',to,0);assert(q.coastDays<old.coastDays);assert.equal(q.waitDays,1);assert(q.coastDays>1);assert(q.peakSpeed>0&&q.peakSpeed<299792);assert(q.deltaV>=q.peakSpeed*2);}
 assert.equal(E.transfer('earth','moon',0).waitDays,0);assert.equal(E.transfer('earth','earth',0).coastDays,0);
});
test('all 2,600 directional route/date pairs obey finite-acceleration time and braking budgets',()=>{
 for(const day of [0,17,10000,100000])for(const a of E.world.ports)for(const b of E.world.ports){if(a.id===b.id)continue;const q=E.transfer(a,b,day),days=2*Math.sqrt(q.distanceKM*1000/q.acceleration)/86400;assert.equal(q.coastDays,Math.max(1,Math.ceil(days)));assert(q.deltaV>=2*q.peakSpeed);assert(q.distanceKM>0);assert(q.waitDays>=0&&q.waitDays<=1);}
});
test('fuel and equipment mass change acceleration while training cannot change propulsion',()=>{
 const s=ready(),q=E.quote(s,'neptune');s.cargo.metals=32;const loaded=E.quote(s,'neptune');assert(loaded.acceleration<q.acceleration);assert(loaded.coastDays>=q.coastDays);assert(loaded.minimumFuel>q.minimumFuel);s.profile.xp.navigation=10000;assert.equal(E.quote(s,'neptune').coastDays,loaded.coastDays);
});
test('the slowest hull sets convoy acceleration and shared propellant covers every hull mass',()=>{
 let s=ready();s.credits=5000000;s.location='earth-high';s.visited.push('earth-high');s=E.transact(s,'purchase-ship',{ship:'albatross'});const id=s.fleet[0].id;s=E.transact(s,'service-ship',{id,service:'fuel'});s.fleet[0].cargo.metals=400;s=E.transact(s,'escort',{id});const q=E.quote(s,'mars');assert.equal(q.acceleration,Math.min(...E.fleetMembers(s).map(v=>E.hullAcceleration({...v,fuel:E.fleetOverview(s).fuel*E.effectiveShip(v).tankTonnes/E.fleetOverview(s).tankTonnes}))));const escort=E.fleetQuote(s,'mars')[0];assert(escort.burn>0);assert(q.minimumFuel>E.fleetFuelPlan({...s,fleet:[]},q.deltaV).minimumFuel);assert.equal(q.minimumFuel,E.fleetFuelPlan(s,q.deltaV).minimumFuel);
});
test('long-range tanks remain a real limit despite the fictional drive',()=>{
 let s=ready();s.credits=5000000;s.unlocked=['neptune'];assert(E.quote(s,'neptune').minimumFuel>E.ship(s).tankTonnes);assert(E.launchProblem(s,'neptune').includes('tank'));s.shipID='albatross';s.fuel=350;s.spares=6;assert.equal(E.launchProblem(s,'neptune'),'');
});
test('old version-3 saves retain every saved value when the new rules are loaded',()=>{
 const raw=fs.readFileSync(path.join(__dirname,'version3-before-Asterion.json'),'utf8');const old=JSON.parse(raw),loaded=E.parse(raw);assert.deepEqual(loaded,old);const oldFuel=old.fuel;E.quote(loaded,'mars');assert.equal(loaded.fuel,oldFuel);assert.deepEqual(loaded,old);
});
test('departure charges the new calendar, provisions, interest and propellant exactly once',()=>{
 const s=ready(),q=E.quote(s,'moon'),next=E.transact(s,'depart',{destination:'moon'});assert.equal(next.day,s.day+q.waitDays+q.coastDays);assert.equal(next.credits,s.credits-q.provisions-q.berth);assert(Math.abs(next.fuel-(s.fuel-q.burn))<1e-9);assert.equal(next.profile.stats.voyages,1);assert.equal(next.debt,Math.ceil(s.debt*1.04**((q.waitDays+q.coastDays)/365.25)));assert(next.log.some(l=>l.text.includes('with Asterion')));
});
test('engine lore is complete, marked fiction, and conversation history saves without repeat XP',()=>{
 const story=E.driveArchive();assert.equal(story.sections.length,6);assert(story.sections[1].title.includes('2074'));assert(story.boundary.includes('science fiction'));let s=ready();s=E.transact(s,'talk',{topic:'engine'});assert(s.dialogue.at(-1).text.includes('Sen and Ibarra'));const xp=s.profile.xp.diplomacy;s=E.transact(s,'talk',{topic:'engine'});assert.equal(s.profile.xp.diplomacy,xp);assert.deepEqual(E.parse(JSON.stringify(s)),s);assert.equal(E.driveData().playbackSeconds,32);
});
console.log(`${checks} Asterion scenarios passed.`);
