'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),M=require('../Local/ship-catalogue/catalogue-model.js');
const close=(a,b)=>assert(Math.abs(a-b)<1e-9,`${a} != ${b}`),max=Object.fromEntries(M.modules.map(m=>[m.id,3])),report=[];
for(const hull of M.hulls){
 const config={shipID:hull.id,upgrades:max},fits=M.weaponFits(config),empty=M.stats(config,{cargoPercent:100}),regular=M.stats(config,{cargoPercent:100,ammo:1}),ordnance=M.stats(config,{cargoPercent:100,ordnanceAmmo:1}),full=M.stats(config,{cargoPercent:100,ammo:fits[1].magazine,ordnanceAmmo:fits[2].magazine});
 close(regular.cargoSpace.ammunition.tonnes,.015);close(ordnance.cargoSpace.ammunition.tonnes,fits[2].type==='torpedo'?.35:.08);
 assert(ordnance.cargoSpace.ammunition.tonnes>regular.cargoSpace.ammunition.tonnes);
 close(regular.ship.dryMass-empty.ship.dryMass,.015);close(ordnance.ship.dryMass-empty.ship.dryMass,ordnance.cargoSpace.ammunition.tonnes);
 for(const sample of [empty,regular,ordnance,full]){
  const space=sample.cargoSpace;
  close(space.ammunition.tonnes,space.ammunition.roundTonnes+space.ammunition.ordnanceTonnes);
  assert.equal(space.loadoutFits,space.reservedTonnes+space.ammunition.tonnes<=space.grossTonnes+1e-9);
  assert.equal(sample.cargoMass,space.usableTonnes);assert(Number.isInteger(space.usableTonnes*4));
  if(space.loadoutFits)assert(space.reservedTonnes+space.ammunition.tonnes+sample.cargoMass<=space.grossTonnes+1e-9);
  close(sample.wetMass,sample.ship.dryMass+sample.cargoMass+sample.v.fuel);
 }
 // Changing laser tier never affects cargo. Unloading frees space without changing fittings.
 const noLaser=M.cargoAllocation({shipID:hull.id,upgrades:{...max,laser:0}});
 close(noLaser.usableTonnes,empty.cargoSpace.usableTonnes);assert.equal(empty.cargoSpace.fittings.find(f=>f.id==='laser').tonnes,0);
 assert(full.cargoSpace.usableTonnes<=empty.cargoSpace.usableTonnes);
 const clamped=M.vessel(config,{ammo:1e9,ordnanceAmmo:1e9});assert.equal(clamped.ammo,fits[1].magazine);assert.equal(clamped.ordnanceAmmo,fits[2].magazine);
 const fractional=M.vessel(config,{ammo:1.9,ordnanceAmmo:-1});assert.equal(fractional.ammo,1);assert.equal(fractional.ordnanceAmmo,0);
 report.push({id:hull.id,ammunitionType:fits[2].type,emptyCapacity:empty.ship.cargoTonnes,fullAmmunition:full.cargoSpace.ammunition.tonnes,fullCapacity:full.ship.cargoTonnes,loadoutFits:full.cargoSpace.loadoutFits});
}
const example=M.stats({shipID:'kestrel',upgrades:max},{ammo:24,ordnanceAmmo:8});close(example.cargoSpace.ammunition.tonnes,1);close(example.cargoSpace.usableTonnes,6.25);
const overloaded=M.stats({shipID:'gyrfalcon',upgrades:max},{ammo:144,ordnanceAmmo:24});assert.equal(overloaded.cargoSpace.loadoutFits,false);assert(overloaded.cargoSpace.overloadTonnes>0);assert.equal(overloaded.cargoSpace.usableTonnes,0);
const unfitted=M.vessel({shipID:'kestrel',upgrades:M.empty()},{ammo:24,ordnanceAmmo:8});assert.equal(unfitted.ammo,0);assert.equal(unfitted.ordnanceAmmo,0);
fs.writeFileSync(new URL('../Build/ammunition-cargo-verification.json','file://'+__filename),JSON.stringify({scope:'Catalogue ammunition allocation; installed game unchanged',rates:M.ammunitionTonnes,hulls:report},null,2)+'\n');
console.log('Passed: all 20 classes, ammunition weight order, laser exemption, capacity/overflow, whole cargo units, magazine limits and mass counted once.');
