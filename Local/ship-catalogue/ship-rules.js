'use strict';
(function(root){
 const S=typeof module!=='undefined'?require('./ship-specs.js'):root.SpacetraderShipSpecs;
 const C=typeof module!=='undefined'?require('./cargo-specs.js'):root.SpacetraderCargo;
 function forHulls(hulls){
 const modules=S.fittings,empty=()=>Object.fromEntries(modules.map(m=>[m.id,0]));
 const hullFor=id=>{const h=hulls.find(h=>h.id===id);if(!h)throw Error('Unknown ship class.');return h;};
 function weaponFits(config){const b=hullFor(config.shipID).balance,u={...empty(),...config.upgrades};return ['laser','weapons','ordnance'].map(slot=>{const p=b[slot],level=u[slot],count=p.counts[level],damage=p.strength[level],type=S.weaponTypes[p.type];return {slot,type:p.type,...type,level,count,damage,bank:count*damage,intercept:Math.min(40,(type.intercept||0)*count),magazine:slot==='ordnance'?count*4:slot==='weapons'?count*24:0};});}
 function ammunitionLoad(config){
  const fits=weaponFits(config),count=(value,limit)=>Math.min(limit,Math.max(0,Math.floor(Number(value)||0)));
  const rounds=count(config.ammo,fits[1].magazine),ordnance=count(config.ordnanceAmmo,fits[2].magazine),type=fits[2].type,rates=S.cargoSpace.ammunitionTonnes;
  return {rounds,ordnance,type,roundTonnes:rounds*rates.round,ordnanceTonnes:ordnance*rates[type],tonnes:rounds*rates.round+ordnance*rates[type]};
 }
 function cargoAllocation(config){
  const base=hullFor(config.shipID),u={...empty(),...config.upgrades};
  const fittings=Object.entries(S.cargoSpace.fractions).map(([id,rates])=>{
   const level=u[id],weapon=base.balance[id],factor=weapon?S.cargoSpace.weaponFactors[weapon.type]:1;
   // Round each installed system up to one existing 0.25 t cargo unit.
   const tonnes=rates[level]?Math.ceil((base.cargoTonnes*rates[level]*factor-1e-9)*4)/4:0;
   return {id,level,name:modules.find(m=>m.id===id).name,description:S.cargoSpace.descriptions[id],tonnes};
  });
  const grossTonnes=Math.floor(base.cargoTonnes*4*(1+.1*u.cargo))*.25,reservedTonnes=fittings.reduce((sum,f)=>sum+f.tonnes,0),ammunition=ammunitionLoad(config),availableTonnes=Math.max(0,grossTonnes-reservedTonnes-ammunition.tonnes),overloadTonnes=Math.max(0,reservedTonnes+ammunition.tonnes-grossTonnes);
  const holdM3=base.cargoM3??C.holds[base.id].m3,grossM3=holdM3*(1+.1*u.cargo),reservedM3=reservedTonnes/base.cargoTonnes*holdM3,ammunitionM3=ammunition.tonnes*2,availableM3=Math.max(0,grossM3-reservedM3-ammunitionM3);
  return {grossTonnes,grossM3,reservedTonnes,reservedM3,ammunition,ammunitionM3,availableTonnes,availableM3,overloadTonnes,loadoutFits:overloadTonnes<1e-9&&reservedM3+ammunitionM3<=grossM3+1e-9,usableTonnes:Math.floor((availableTonnes+1e-9)*4)/4,fittings};
 }
 function effectiveShip(v){
  const base=hullFor(v.shipID),u={...empty(),...v.upgrades},weaponMass=weaponFits(v).reduce((n,w)=>n+(w.slot==='laser'?.035:w.slot==='weapons'?.075:.09)*base.dryMass*.02*w.count*(1+u[w.slot]*.1),0),factoryWeaponMass=weaponFits({shipID:v.shipID,upgrades:empty()}).reduce((n,w)=>n+(w.slot==='laser'?.035:w.slot==='weapons'?.075:.09)*base.dryMass*.02*w.count,0);
  return {...base,cargoTonnes:cargoAllocation(v).usableTonnes,cargoM3:cargoAllocation(v).availableM3,tankTonnes:base.tankTonnes*(1+.15*u.tank),isp:base.isp*(1+.025*u.drive),dryMass:base.dryMass*(1+.06*u.armor+.01*u.drive+.02*u.tank+.03*u.cargo+.02*u.shield)+.1*u.sensors+Math.max(0,weaponMass-factoryWeaponMass)+ammunitionLoad(v).tonnes};
 }

 function profile(v){const b=hullFor(v.shipID).balance||S.balance[v.shipID],u={...empty(),...v.upgrades},weapons=weaponFits(v),shield=Math.round(b.shieldBase+b.shieldRating*[0,1,2.2,3.6][u.shield]);return {hullPoints:b.hullPoints,armor:1-(1-b.armor)*.93**u.armor,shield,shieldRecharge:Math.round(shield*.1),weapons,intercept:Math.min(40,weapons.reduce((n,w)=>n+w.intercept,0)),sensors:u.sensors,accuracyBonus:u.sensors*.05};}
 function fittingCosts(shipID,moduleID){const base=hullFor(shipID),m=modules.find(m=>m.id===moduleID);if(!m)throw Error('Unknown fitting.');return [1,2,4].map(n=>Math.round(Math.ceil(base.price/200)*200*m.rate*.005*n));}
 return {empty,weaponFits,ammunitionLoad,cargoAllocation,effectiveShip,profile,fittingCosts};
 }
 const api={forHulls};root.SpacetraderShipRules=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
