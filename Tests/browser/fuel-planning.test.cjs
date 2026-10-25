'use strict';
const assert=require('node:assert/strict'),E=require('../../Browser/engine'),{ready,start}=require('./combat-v2-balance.cjs');
function fixture(id='kestrel',count=1){let s=ready(id,0,7);s.ammo=0;s.ordnanceAmmo=0;s.fuel=0;s.unlocked=E.world.ports.map(p=>p.id);for(let i=1;i<count;i++){const h=E.ships.find(h=>h.id===id);s.fleet.push({id:'audit-'+i,name:'Fuel audit',shipID:id,location:s.location,hull:100,fuel:0,spares:h.maxSpares,cargo:{},cargoBasis:{},upgrades:{...s.upgrades},ammo:0,ordnanceAmmo:0,fittingEdition:2,escort:true});}return s;}
function load(s,to){const p=E.routeFuelLoadingPlan(s,to);assert(p.feasible);if(p.target>E.fleetOverview(s).fuel+.0001)s=E.transact(s,'refuel',{target:p.target});assert.equal(E.launchProblem(s,to),'');const q=E.quote(s,to);assert(Math.abs(E.fleetOverview(s).fuel-q.burn-p.arrivalFuel)<1e-6);if(p.reserveCovered)assert(E.fleetOverview(s).fuel-q.burn+1e-7>=p.requiredReserve);return {s,p,q};}
let s=fixture(),raw=JSON.stringify(s),p=E.routeFuelLoadingPlan(s,'callisto');assert.equal(JSON.stringify(s),raw);assert(p.target<22&&p.target>14);assert(E.launchProblem(s,'callisto').includes('Load more fuel'));load(s,'callisto');
s=fixture('peregrine');load(s,'neptune');s=fixture('kestrel');assert(!E.routeFuelLoadingPlan(s,'neptune').feasible);assert(E.launchProblem(s,'neptune').includes('tank capacity'));
for(const [id,count,from,to] of [['condor',8,'earth','earth-high'],['peregrine',24,'earth','moon'],['condor',24,'mars','phobos']]){s=fixture(id,count);s.location=from;s.visited=[from];s.fleet.forEach(v=>v.location=from);const r=load(s,to);assert(r.p.requiredReserve>.15);let remaining=r.p.arrivalFuel;for(const v of E.fleetMembers(r.s))v.fuel=remaining*E.effectiveShip(v).tankTonnes/E.fleetOverview(r.s).tankTonnes;assert(E.canEvade(r.s));remaining-=E.evasionFuel(r.s);for(const v of E.fleetMembers(r.s))v.fuel=remaining*E.effectiveShip(v).tankTonnes/E.fleetOverview(r.s).tankTonnes;assert(remaining+1e-7>=E.fleetManeuverFuel(r.s,.15));}
// Switching command does not change the cost of moving the same formation.
const costs=[];for(const id of ['swift','condor']){s=fixture(id);s.fuel=E.effectiveShip(s).tankTonnes*.5;const other=fixture(id==='swift'?'condor':'swift');s.fleet.push({id:'other',name:'Companion',shipID:other.shipID,location:s.location,hull:100,fuel:E.effectiveShip(other).tankTonnes*.5,spares:other.spares,cargo:{},cargoBasis:{},upgrades:other.upgrades,ammo:0,ordnanceAmmo:0,fittingEdition:2,escort:true});s=start(s,1);const fuel=E.fleetOverview(s).fuel,cost=E.fleetManeuverFuel(s,.05);s=E.transact(s,'battle-order',{actor:s.flagshipID,order:'approach'});assert(Math.abs(fuel-E.fleetOverview(s).fuel-cost)<1e-8);costs.push(cost);}assert(Math.abs(costs[0]-costs[1])<1e-10);
s=start(fixture('kestrel',2),1);assert(E.combatReadiness(s,s).movementReason.includes('propellant'));raw=JSON.stringify(s);assert.throws(()=>E.transact(s,'battle-order',{actor:s.flagshipID,order:'approach'}));assert.equal(JSON.stringify(s),raw);
// Cached answers are isolated and invalidated by changes to manifests, dates and hulls.
s=fixture('peregrine');p=E.routeFuelLoadingPlan(s,'mars');p.target=0;assert(E.routeFuelLoadingPlan(s,'mars').target>0);const initial=E.routeFuelLoadingPlan(s,'mars').target;s.cargo={water:40};assert(E.routeFuelLoadingPlan(s,'mars').target>initial);const loaded=E.routeFuelLoadingPlan(s,'mars');s.upgrades.drive=3;assert.notEqual(E.routeFuelLoadingPlan(s,'mars').target,loaded.target);s.day=100;assert.notEqual(E.routeFuelLoadingPlan(s,'mars').days,loaded.days);
// Per-hull shared-flight allocations agree with independent numeric integration.
s=fixture('condor',2);s.fleet[0].shipID='kestrel';s.fuel=300;s.fleet[0].fuel=22;const q=E.quote(s,'mars'),detail=E.fleetQuote(s,'mars',q),v=s.fleet[0],sh=E.effectiveShip(v),pool=E.fleetOverview(s),share=sh.tankTonnes/pool.tankTonnes;let fuel=pool.fuel,burn=0;const steps=20000,dv=q.deltaV/steps;for(let i=0;i<steps;i++){const total=E.fleetMembers(s).reduce((n,h)=>{const e=E.effectiveShip(h);return n+(e.dryMass+E.used(h)*.25+fuel*e.tankTonnes/pool.tankTonnes)/(e.isp*.00980665);},0);burn+=(sh.dryMass+fuel*share)/(sh.isp*.00980665)*dv;fuel-=total*dv;}assert(Math.abs(detail[0].burn-burn)<.002);
console.log('PASS: self-consistent fuel loading, scalable reserves, flagship invariance, zero-fuel rejection, cache isolation and mixed-Isp allocations.');
// An unreachable route has no solved load; Communications must render the
// unavailable state rather than formatting null as a numeric fuel requirement.
{
 const fs=require('fs'),vm=require('vm'),src=fs.readFileSync('Browser/app.js','utf8'),state=fixture();
 const c=vm.createContext({E,state,coordinatorDestination:'neptune',destination:'moon',careerCommunicationsPanel:()=>'',stationLabel:p=>E.stationLabel(typeof p==='string'?p:p.id),esc:String,fmt:String,btn:()=>'',date:String});
 const a=src.indexOf('function coordinatorPanel('),b=src.indexOf('\nfunction ',a+1);vm.runInContext(src.slice(a,b),c);
 assert.equal(E.coordinatorOverview(state,'neptune').fuelRequired,null);assert(c.coordinatorPanel().includes('Beyond tank range'));
 const same=E.routeFuelLoadingPlan(state,state.location);assert.equal(same.target,state.fuel);assert.equal(same.arrivalFuel,state.fuel);assert.equal(same.requiredReserve,0);
 console.log('PASS: unreachable Communications route and same-station loading.');
}
{
 const z=fixture('petrel',2);for(const v of E.fleetMembers(z))v.missionCargo=[{kind:'fuel',mass:E.effectiveShip(v).tankTonnes}];
 assert.equal(E.fleetOverview(z).tankTonnes,0);assert(!E.routeFuelLoadingPlan(z,'moon').feasible);
 assert(Number.isFinite(E.quote(z,'moon').burn));assert(E.launchProblem(z,'moon').includes('tank capacity'));
 console.log('PASS: fully reserved tanks produce an unavailable route, without division by zero.');
}
