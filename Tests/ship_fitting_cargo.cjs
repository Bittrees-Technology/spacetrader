'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),M=require('../Local/ship-catalogue/catalogue-model.js');
const max=Object.fromEntries(M.modules.map(m=>[m.id,3])),spaceIDs=['laser','weapons','ordnance','shield','sensors'];
let states=0;const report={scope:'Catalogue fitting cargo reservation',hulls:[]};
for(const h of M.hulls){
 const standard=M.stats({shipID:h.id,upgrades:M.empty()});
 assert.equal(standard.cargoSpace.reservedTonnes,0);assert.equal(standard.ship.cargoTonnes,h.cargoTonnes);
 // All 1,024 internal-system combinations, with and without hold expansion.
 for(let code=0;code<4**spaceIDs.length;code++)for(const cargo of [0,3]){
  const u=M.empty();let value=code;for(const id of spaceIDs){u[id]=value%4;value=Math.floor(value/4);}u.cargo=cargo;
  const a=M.cargoAllocation({shipID:h.id,upgrades:u});
  assert.equal(a.reservedTonnes,a.fittings.reduce((n,f)=>n+f.tonnes,0));assert.equal(a.usableTonnes,a.grossTonnes-a.reservedTonnes);assert(a.usableTonnes>0);assert(Number.isInteger(a.usableTonnes*4));states++;
 }
 for(const m of M.modules){let previous=0;for(let level=0;level<=3;level++){
  const a=M.cargoAllocation({shipID:h.id,upgrades:{[m.id]:level}});
  assert(a.reservedTonnes>=previous);previous=a.reservedTonnes;
  if(spaceIDs.includes(m.id)&&m.id!=='laser'&&level)assert(a.reservedTonnes>0);else assert.equal(a.reservedTonnes,0);
 }}
 const config={shipID:h.id,upgrades:max},full=M.stats(config,{cargoPercent:100,fuelPercent:100,ammo:24,ordnanceAmmo:16});
 assert.equal(full.ship.cargoTonnes,full.cargoSpace.usableTonnes);assert.equal(full.cargoMass,full.cargoSpace.usableTonnes);assert.equal(full.wetMass,full.ship.dryMass+full.cargoMass+full.v.fuel);
 assert.equal(M.stats(config,{cargoPercent:0}).cargoSpace.reservedTonnes,full.cargoSpace.reservedTonnes,'Empty magazines still reserve services space');
 assert.equal(M.cargoAllocation({shipID:h.id,upgrades:M.empty()}).usableTonnes,h.cargoTonnes,'Removing fittings restores the hold');
 report.hulls.push({id:h.id,standardCargo:h.cargoTonnes,...full.cargoSpace});
}
const sample=M.cargoAllocation({shipID:'kestrel',upgrades:max});assert.equal(sample.grossTonnes,10.25);assert.equal(sample.reservedTonnes,3);assert.equal(sample.usableTonnes,7.25);
const baseline=require('../Build/Rollbacks/fitting-cargo-20261020/ship-specs.js'),specs=require('../Local/ship-catalogue/ship-specs.js');
for(const key of ['balance','weaponTypes','prototypes','hullPriceMultiplier','carrierPolicies'])assert.deepEqual(specs[key],baseline[key],key+' unchanged');
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../Browser/engine.js','file://'+__filename))).digest('hex'),'8bc2f6b3695036feb77e1b5cc19d2f36b80937d746aabc4e277abf535d16b5bc');
report.states=states;fs.writeFileSync(new URL('../Build/ship-fitting-cargo-verification.json','file://'+__filename),JSON.stringify(report,null,2)+'\n');
console.log('Passed '+states+' space combinations across 20 classes; load mass, reversibility, rounding, unchanged prices/weapons and game engine.');
