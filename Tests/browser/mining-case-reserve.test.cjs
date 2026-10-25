'use strict';
const assert=require('node:assert/strict'),E=require('../../Browser/engine');let count=0;
function test(name,fn){fn();count++;console.log('PASS '+name);}
function ready(shipID='kestrel',pid='earth'){
 const s=E.transact(E.fresh(),'create',{name:'Civilian review',background:'engineer',temperament:'measured'}),h=E.ships.find(h=>h.id===shipID);
 Object.assign(s,{castSeed:'44557788',credits:1000000,debt:0,shipID,shipName:h.name,fuel:h.tankTonnes,spares:h.maxSpares,location:pid,visited:[...new Set(['earth',pid])]});
 s.commodityDiscovery.known=E.goods.map(g=>g.id);s.profile.xp={commerce:100,diplomacy:100,navigation:700,engineering:300};return s;
}
function add(s,shipID,escort=true){const h=E.ships.find(h=>h.id===shipID),id='civilian-'+(s.fleet.length+1);s.fleet.push({id,name:h.name+' review',shipID,location:s.location,hull:100,fuel:h.tankTonnes*.25,spares:h.maxSpares,cargo:{},cargoBasis:{},upgrades:{...s.upgrades},ammo:0,ordnanceAmmo:0,fittingEdition:2,escort});return id;}
function discover(s,kind,venue){return require('../../Tests/browser/dialogue-introduction.cjs')(E,s,venue,'op-discover-'+kind);}
function permit(s,kind){return E.transact(s,'op-permit',{kind});}
function reject(s,type,args={}){const raw=JSON.stringify(s);assert.throws(()=>E.transact(s,type,args));assert.equal(JSON.stringify(s),raw);}
function roundtrip(s){assert.deepEqual(E.parse(JSON.stringify(s)),s);}
function move(s,pid){s.location=pid;s.visited=[...new Set([...s.visited,pid])];for(const v of s.fleet)if(v.escort)v.location=pid;return s;}
function mining(){let s=ready('sanderling','ceres');add(s,'heron');s=discover(s,'mining','relay');s=permit(s,'mining');return s;}
function passengers(){let s=ready('curlew');s=discover(s,'passengers','relay');return permit(s,'passengers');}
function carrier(){let s=ready('condor','earth-high');add(s,'swift',false);add(s,'kestrel',false);add(s,'merlin',false);s=discover(s,'carrier','fleet');return permit(s,'carrier');}
function settle(s){for(let n=0;n<3&&s.incident;n++)s=E.transact(s,'resolve',{choice:s.incident.kind==='pirate'?'pay':s.incident.kind==='asteroid'?'belt-wait':'spare'});return s;}

let s=mining();s=E.transact(s,'op-survey');s.oreUnits=150;s.oreCost=7500;s.cargo.water=8;E.validate(s);const blocked=E.civilianOverview(s).mining;assert.equal(blocked.yieldUnits,0);assert.equal(blocked.canExtract,false);reject(s,'op-extract');s.cargo={};E.validate(s);const offer=E.civilianOverview(s).mining;assert(offer.yieldUnits>0&&offer.yieldUnits<=6);s=E.transact(s,'op-extract');const quantity=s.oreUnits;assert(quantity<=156);while(s.oreUnits){s=E.transact(s,'op-refine',{ship:s.flagshipID});assert(E.shipCargoFits(s));roundtrip(s);}assert.equal(E.fleetQuantity(s,'metals'),quantity);assert(Math.abs(E.cargoMass(s)-quantity*.255)<1e-8);console.log(JSON.stringify({rawOreLots:quantity,refinedLots:E.fleetQuantity(s,'metals'),allRefiningBatchesFit:true,netMaterialPreserved:true},null,2));
