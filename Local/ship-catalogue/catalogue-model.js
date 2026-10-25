'use strict';
(function(root){
 const A=typeof module!=='undefined'?require('./approved-ships.js'):root.SpacetraderApprovedShips;
 const C=typeof module!=='undefined'?require('./cargo-specs.js'):root.SpacetraderCargo;
 const S=typeof module!=='undefined'?require('./ship-specs.js'):root.SpacetraderShipSpecs;
 const Rules=typeof module!=='undefined'?require('./ship-rules.js'):root.SpacetraderShipRules;
 const modules=S.fittings,hulls=A.hulls.map(h=>({...h,prototype:S.prototypes.some(p=>p.id===h.id),sourcePrice:h.price,laserFit:S.specs[h.id],balance:S.balance[h.id]})).sort((a,b)=>a.price-b.price),levels=[0,1,2,3],steps=[0,1,3,7],R=Rules.forHulls(hulls);
 let orderedKey='',orderedCache=null;
 const empty=()=>Object.fromEntries(modules.map(m=>[m.id,0]));
 const hullFor=id=>{const h=hulls.find(h=>h.id===id);if(!h)throw Error('Unknown catalogue hull');return h;};
 function identifier(shipID,upgrades){return shipID.toUpperCase()+'-'+modules.map(m=>upgrades[m.id]||0).join('');}
 function decode(id){const match=String(id).toLowerCase().match(/^([a-z]+)-([0-3]{7}|[0-3]{9})$/);if(!match||!hulls.some(h=>h.id===match[1]))return null;return {shipID:match[1],upgrades:Object.fromEntries(modules.map((m,i)=>[m.id,+(match[2][i]||0)]))};}
 const fittingBasis=h=>Math.ceil(h.price/200)*200;
 const fittingCosts=(shipID,moduleID)=>{const h=hullFor(shipID),m=modules.find(m=>m.id===moduleID);if(!m)throw Error('Unknown fitting');return [1,2,4].map(n=>Math.round(fittingBasis(h)*m.rate*.005*n));};
 const fittingValue=(shipID,u)=>modules.reduce((sum,m)=>sum+fittingCosts(shipID,m.id).slice(0,u[m.id]||0).reduce((a,b)=>a+b,0),0);
 function selection(filters={},sortByCost=false){
  const cacheKey=JSON.stringify(filters);if(sortByCost&&cacheKey===orderedKey&&orderedCache)return orderedCache;
  const query=String(filters.search||'').trim().toLowerCase(),exact=decode(query);
  const ships=hulls.filter(h=>(!filters.hull||h.id===filters.hull)&&(!filters.status||(filters.status==='new'?h.prototype:!h.prototype))&&(!query||(exact?h.id===exact.shipID:(h.name+' '+h.role+' '+h.description).toLowerCase().includes(query))));
  const choices=modules.map(m=>filters[m.id]!==undefined&&filters[m.id]!==''?[Number(filters[m.id])]:exact?[exact.upgrades[m.id]]:levels);
  if(exact&&modules.some((m,i)=>!choices[i].includes(exact.upgrades[m.id])))return {ships:[],choices,perHull:0,total:0};
  if(choices.some(c=>c.some(n=>!levels.includes(n))))return {ships:[],choices,perHull:0,total:0};
  const perHull=choices.reduce((n,c)=>n*c.length,1),selected={ships,choices,perHull,total:ships.length*perHull};
  // Group equal half-percent fitting costs. Only 295 possible cost bands are sorted,
  // rather than allocating/sorting every one of the 5.2 million configurations.
  if(sortByCost&&selected.total){
   const buckets=new Map();for(let code=0;code<perHull;code++){let n=code,rate=0;for(let j=modules.length-1;j>=0;j--){const value=choices[j][n%choices[j].length];n=Math.floor(n/choices[j].length);rate+=modules[j].rate*steps[value];}if(!buckets.has(rate))buckets.set(rate,[]);buckets.get(rate).push(code);}
   const bands=[...buckets].map(([rate,codes])=>({rate,codes:Uint32Array.from(codes)}));selected.groups=ships.flatMap((ship,shipIndex)=>bands.map(band=>({...band,shipIndex,price:Math.round(ship.price+fittingBasis(ship)*band.rate*.005)}))).sort((a,b)=>a.price-b.price||a.shipIndex-b.shipIndex||a.rate-b.rate);
   let offset=0;for(const group of selected.groups){group.start=offset;offset+=group.codes.length;group.end=offset;}orderedKey=cacheKey;orderedCache=selected;
  }return selected;
 }
 function at(selection,ordinal){
  if(!Number.isInteger(ordinal)||ordinal<0||ordinal>=selection.total)return null;
  let shipIndex=Math.floor(ordinal/selection.perHull),code=ordinal%selection.perHull;
  if(selection.groups){let a=0,b=selection.groups.length-1;while(a<b){const m=(a+b)>>1;if(ordinal>=selection.groups[m].end)a=m+1;else b=m;}const g=selection.groups[a];shipIndex=g.shipIndex;code=g.codes[ordinal-g.start];}
  const shipID=selection.ships[shipIndex].id,upgrades={};let n=code;
  for(let i=modules.length-1;i>=0;i--){const choices=selection.choices[i];upgrades[modules[i].id]=choices[n%choices.length];n=Math.floor(n/choices.length);}
  return {shipID,upgrades};
 }
 const {weaponFits,ammunitionLoad,cargoAllocation,effectiveShip}=R;
 function acceleration(v,sh){const base=hullFor(v.shipID),rated=base.dryMass+base.cargoTonnes*.5+base.tankTonnes*.5,loaded=sh.dryMass+C.load(v.cargo).grossTonnes+v.fuel;return Math.max(.001,Math.min(.1,A.drive.acceleration*(base.thrustFactor||1)*rated/loaded));}
 function vessel(config,{integrity=100,fuelPercent=50,cargoPercent=50,ammo=0,ordnanceAmmo=0}={}){
  const upgrades={...empty(),...config.upgrades},load=ammunitionLoad({...config,upgrades,ammo,ordnanceAmmo}),v={shipID:config.shipID,upgrades,hull:integrity,ammo:load.rounds,ordnanceAmmo:load.ordnance,cargo:{},fuel:0};
  const ship=effectiveShip(v);v.fuel=ship.tankTonnes*fuelPercent/100;const units=Math.floor(C.room(ship.cargoTonnes,ship.cargoM3,'food')*cargoPercent/100);if(units)v.cargo.food=units;return v;
 }
 function stats(config,conditions){
  const v=vessel(config,conditions),hull=hullFor(config.shipID),ship=effectiveShip(v),equipment=fittingValue(v.shipID,v.upgrades),cargoUnits=Object.values(v.cargo).reduce((a,b)=>a+b,0),cargoMass=C.load(v.cargo).grossTonnes,cargoVolume=C.load(v.cargo).volumeM3,weapons=weaponFits(v),b=hull.balance,shield=Math.round(b.shieldBase+b.shieldRating*[0,1,2.2,3.6][v.upgrades.shield]);
  return {ship,v,equipment,cargoSpace:cargoAllocation(v),totalCost:ship.price+equipment,cargoUnits:Math.round(ship.cargoTonnes*4),cargoMass,cargoVolume,capacityM3:ship.cargoM3,wetMass:ship.dryMass+cargoMass+v.fuel,acceleration:acceleration(v,ship),weapons,weaponCount:weapons.reduce((n,w)=>n+w.count,0),laser:weapons[0].bank,kinetic:weapons[1].bank,ordnance:weapons[2].bank,baseArmor:b.armor,armorReduction:v.upgrades.armor?1-(1-b.armor)*.93**v.upgrades.armor:b.armor,hullPoints:b.hullPoints,remainingHull:Math.round(b.hullPoints*v.hull/100),shield,shieldRecharge:Math.round(shield*.1),shieldDelay:2,intercept:Math.min(40,weapons.reduce((n,w)=>n+w.intercept,0)),accuracyBonus:v.upgrades.sensors*.05,deltaV:ship.isp*.00980665*Math.log((ship.dryMass+cargoMass+v.fuel)/(ship.dryMass+cargoMass))};
 }
 // Catalogue admission rules: explicit certification precedes measured fit.
 // Envelopes come from the renderer, including the candidate's actual refits.
 function carrierEligibility(carrierID,shipID,envelope,aperture,occupied=0){
  const policy=Object.hasOwn(S.carrierPolicies,carrierID)?S.carrierPolicies[carrierID]:null,ship=hulls.find(h=>h.id===shipID);
  const reject=reason=>({allowed:false,reason});
  if(!policy)return reject('This class has no hangar berths.');
  if(!ship||!policy.allowedShipIDs.includes(shipID))return reject('Not on this carrier’s approved ship list.');
  if(ship.dryMass>policy.baseDryMassLimit)return reject('Exceeds the base dry-mass limit.');
  if(!Number.isInteger(occupied)||occupied<0)return reject('Invalid berth count.');
  if(occupied>=policy.berths)return reject('Both hangar berths are occupied.');
  const axes=['length','height','beam'];
  if(axes.some(k=>!Number.isFinite(envelope?.[k])||envelope[k]<=0||!Number.isFinite(aperture?.[k])||aperture[k]<=0))return reject('Measured fitting clearance is required.');
  const clearance=Object.fromEntries(axes.map(k=>[k,aperture[k]-envelope[k]]));
  if(axes.some(k=>clearance[k]<=policy.clearanceMargin))return {...reject('This refit exceeds safe hangar clearance.'),clearance};
  return {allowed:true,reason:'Approved class · clears the hangar',clearance};
 }
 const api={ammunitionLoad,ammunitionTonnes:S.cargoSpace.ammunitionTonnes,cargoAllocation,carrierPolicies:S.carrierPolicies,carrierEligibility,modules,hulls,effectiveShip,empty,identifier,decode,selection,at,vessel,stats,weaponFits,fittingCosts,fittingValue,total:hulls.length*4**modules.length};root.SpacetraderShips=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
