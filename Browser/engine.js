'use strict';
/* Shared, offline game engine used by the browser and native Mac window. */
(function(root) {
const MAX_FLEET=32,MAX_CARGO_LOTS=2000;
const patrolReports=typeof module!=='undefined'?require('./patrol-reports.js'):root.SpacetraderPatrolReports;
const journalModel=typeof module!=='undefined'?require('./journal.js'):root.SpacetraderJournal;
const shipNames=typeof module!=='undefined'?require('./ship-names.js'):root.SpacetraderShipNames;
const shipSpecs=typeof module!=='undefined'?require('./ship-specs.js'):root.SpacetraderShipSpecs;
const shipRulesFactory=typeof module!=='undefined'?require('./ship-rules.js'):root.SpacetraderShipRules;
const shipGraphics=typeof module!=='undefined'?require('./ship-graphics.js'):root.SpacetraderShipGraphics;
const careerDevelopmentFactory=typeof module!=='undefined'?require('./career-development.js'):root.SpacetraderCareerDevelopment;
const careerConversationFactory=typeof module!=='undefined'?require('./career-conversations.js'):root.SpacetraderCareerConversations;
const dialogueMemoryFactory=typeof module!=='undefined'?require('./dialogue-memory.js'):root.SpacetraderDialogueMemory;
const storyConversationFactory=typeof module!=='undefined'?require('./story-conversations.js'):root.SpacetraderStoryConversations;
const dialogueVoiceFactory=typeof module!=='undefined'?require('./dialogue-voices.js'):root.SpacetraderDialogueVoices;
const combatFactory=typeof module!=='undefined'?require('./combat-rules.js'):root.SpacetraderCombat;
const fixedStationCast=typeof STATION_CAST!=='undefined'?STATION_CAST:require('./station-cast.js');
const fixedStationCastByKey=new Map(fixedStationCast.rows.map(v=>[v.assignmentKey,v]));
const world = typeof WORLD !== 'undefined' ? WORLD : require('./world.js');
const marketEconomy=typeof module!=='undefined'?require('./market-economy.js'):root.SpacetraderEconomy;
const stockPricing=typeof module!=='undefined'?require('./stock-pricing.js'):root.SpacetraderStockPricing;
const cargoSpecs=typeof module!=='undefined'?require('./cargo-specs.js'):root.SpacetraderCargo;
const cargoPacking=typeof module!=='undefined'?require('./cargo-packing.js'):root.SpacetraderCargoPacking;
const goods = [
 {id:'water',name:'Water ice',base:90,note:'Life support, shielding and industrial feedstock. Purification, electrolysis and hydrogen liquefaction require power.'},
 {id:'food',name:'Staple provisions',base:160,note:'Packaged staple crops cultivated from water, carbon dioxide and nutrients in powered farms; greenhouse produce is a separate premium crop.'},
 {id:'metals',name:'Refined metal stock',base:210,note:'Certified mixed metal stock from eight refined constituents. Reclamation recovers those constituents with a material loss.'},
 {id:'electronics',name:'Electronics',base:520,note:'Radiation-tolerant sensors, computers and control systems.'},
 {id:'medicine',name:'Medical supplies',base:420,note:'Sterile supplies and medicines, supplied by established manufacturing.'},
 {id:'machinery',name:'Machinery',base:340,note:'Pumps, heat exchangers, actuators and spare assemblies.'}
].map(marketEconomy.priceProduct);
const stapleGoods=goods.slice();
goods.push(...marketEconomy.products);
// Discreet dealers have finite two-week inventories, independent of legal freight contracts.
const contrabandGoods=[
 {id:'ai-cores',name:'Restricted AI cores',base:1700,note:'Unregistered autonomous targeting systems. Prohibited freight; subject to seizure.'},
 {id:'combat-drones',name:'Unlicensed combat drones',base:2400,note:'Combat hardware without Compact export clearance. Subject to seizure.'},
 {id:'biocultures',name:'Banned biocultures',base:1250,note:'Uncertified biological cultures barred from public habitats. Subject to seizure.'}
].map(marketEconomy.priceProduct);
const allGoods=[...goods,...contrabandGoods];
const illicitSuppliers={phobos:['ai-cores','combat-drones'],ceres:['combat-drones','biocultures'],callisto:['ai-cores'],rhea:['combat-drones'],iapetus:['ai-cores','combat-drones','biocultures'],oberon:['ai-cores','biocultures'],triton:['biocultures']};
function illicitBase(pid,id,cycle){
 const allowed=(illicitSuppliers[pid]||[]).includes(id),h=hash('illicit:'+pid+':'+id+':'+cycle),open=allowed&&Number(h%100n)<64;
 return {open,stock:open&&Number(h/101n%5n)!==0?2+Number(h/503n%11n):0,demand:open&&Number(h/211n%5n)!==0?4+Number(h/719n%17n):0};
}
function illicitQuote(s,id,pid=s.location){
 const g=contrabandGoods.find(g=>g.id===id);check(g,'Unknown restricted cargo.');const cycle=Math.floor(s.day/14),base=illicitBase(pid,id,cycle),r=(s.contrabandLedger||[]).find(r=>r.port===pid&&r.good===id&&r.cycle===cycle),stock=base.stock-(r?.bought||0)+(r?.sold||0),demand=base.demand-(r?.sold||0)+(r?.bought||0),h=hash('illicit-price:'+pid+':'+id+':'+cycle);
 const availability=base.stock/8,{supply,spread}=supplyTier(availability),price=Math.round(g.base*(.8+Number(h%70n)/100));
 return {price,buy:Math.ceil(price*(1+spread)),sell:Math.floor(price*(1-spread)),availability,spread,supply,day:s.day,season:'Discreet supply cycle',competition:'Restricted',stock,demand,open:base.open,restockDay:(cycle+1)*14};
}
function contrabandMarket(s){
 const ids=illicitSuppliers[s.location]||[],held=contrabandGoods.filter(g=>fleetQuantity(s,g.id)>0).map(g=>({id:g.id,name:g.name,units:fleetQuantity(s,g.id)}));
 return {supplier:ids.length>0,held,offers:ids.map(id=>({...contrabandGoods.find(g=>g.id===id),...illicitQuote(s,id)})),restockDay:(Math.floor(s.day/14)+1)*14,inspectionRisk:inspectionChance(s.location,s)};
}
function settleContraband(s,id,n,buy){
 if(!contrabandGoods.some(g=>g.id===id))return;
 const q=illicitQuote(s,id);check(q.open,'No discreet dealer is trading this cargo here today.');check(n<=(buy?q.stock:q.demand),buy?'The dealer does not have that much restricted stock.':'The dealer cannot take that much restricted cargo.');
 if(!s.contrabandLedger)s.contrabandLedger=[];const cycle=Math.floor(s.day/14);let r=s.contrabandLedger.find(r=>r.port===s.location&&r.good===id&&r.cycle===cycle);
 if(!r){r={port:s.location,good:id,cycle,bought:0,sold:0};s.contrabandLedger.push(r);}r[buy?'bought':'sold']+=n;
 // Old cycles no longer affect any quote. Keep all current-cycle receipts, bounded by 26 ports × 3 goods.
 s.contrabandLedger=s.contrabandLedger.filter(r=>r.cycle===cycle);
}
const customsPacks=[
 {id:'spectral-liner',name:'Spectral cargo liners',mass:.25,price:900,detail:'Single-inspection packing that muffles electronic signatures; strongest against AI cores and combat drones.'},
 {id:'thermal-sleeve',name:'Thermal packing sleeves',mass:.5,price:1250,detail:'Single-inspection packing that masks thermal and biological traces; strongest against biocultures.'}
];
const customsMethods=[{id:'manifest',name:'Manifest spot check',detection:.50,hulls:.65},{id:'scanner',name:'Wideband scan',detection:.76,hulls:.82},{id:'boarding',name:'Physical hold search',detection:.97,hulls:1}];
// Wider trust follows the captain; the receiving station also keeps its own record.
// Snapshot these values before seizures can resolve a mission or alter either reputation.
function customsStanding(s,pid=s.location){
 const publicScore=reputationData(s.profile).score,localScore=s.profile.relationships[pid]||0,trust=publicScore*.75+localScore*.25,penalty=score=>Math.round(6+Math.max(0,score)*.06+Math.min(0,score)*.03);
 return {publicScore,localScore,trust,selectionFactor:1-trust*.005,publicPenalty:penalty(publicScore),localPenalty:penalty(localScore)};
}
function inspectionChance(pid,s=null){
 const p=port(pid),base=p.group==='earth'?.42:['mercury','venus','mars'].includes(p.group)?.30:['ceres','jupiter','saturn'].includes(p.group)?.22:.16;
 if(!s)return base;
 const activity=.65+Number(hash('customs-duty:'+pid+':'+Math.floor(s.day/7))%71n)/100,practice=Math.min(.20,(earnedLevel(s,'navigation')+earnedLevel(s,'commerce'))*.012),recent=(s.cargoInspections||[]).some(r=>r.port===pid&&(r.seized||r.antiquityCases)&&s.day-r.day<=60);
 return Math.max(.06,Math.min(.75,base*activity*(1-practice)*customsStanding(s,pid).selectionFactor+(recent?.10:0)));
}
// Packages occupy a real active hold, but protection is pooled across the convoy.
function screeningLots(v,id){return (v.missionCargo||[]).filter(l=>l.kind==='screening'&&(!id||l.screening===id));}
function screeningRoom(s,p,vessels=fleetMembers(s)){return vessels.reduce((n,v)=>n+Math.max(0,Math.min(3-screeningLots(v,p.id).length,100-(v.missionCargo||[]).length,Math.floor(Math.min((effectiveShip(v).cargoTonnes-cargoMass(v)+1e-8)/p.mass,(effectiveShip(v).cargoM3-cargoVolume(v)+1e-8)/(p.mass*2))))),0);}
function loadScreeningLots(s,p,lots,vessels=fleetMembers(s)){
 check(lots.length<=screeningRoom(s,p,vessels),'Free space in the active fleet is required for these packages.');
 for(const v of vessels){const n=Math.max(0,Math.min(lots.length,3-screeningLots(v,p.id).length,100-(v.missionCargo||[]).length,Math.floor(Math.min((effectiveShip(v).cargoTonnes-cargoMass(v)+1e-8)/p.mass,(effectiveShip(v).cargoM3-cargoVolume(v)+1e-8)/(p.mass*2)))));if(n)(v.missionCargo||(v.missionCargo=[])).push(...lots.splice(0,n));if(!lots.length)break;}
}
function takeScreeningLots(s,id,n,vessels=fleetMembers(s)){const lots=[];for(const v of vessels){for(const l of screeningLots(v,id).slice(0,n-lots.length)){v.missionCargo=v.missionCargo.filter(x=>x!==l);lots.push(l);}if(lots.length===n)break;}check(lots.length===n,'Not enough packages in the active fleet.');return lots;}
function customsPreparation(s){
 const e=secretContact(s),trading=e?.kind==='cargo'&&secretSession(s,e)?.node==='trade',stock=trading?secretStock(s,e).screening:[],safe=s.profile.created&&!s.incident&&!s.battle&&!s.fleetLoss;
 return {available:!!trading,packs:stock.map(p=>{const count=fleetMembers(s).reduce((n,v)=>n+screeningLots(v,p.id).length,0),reason=!safe?'Finish the current encounter first.':!p.stock?'This traveller has no more packages of this type.':!screeningRoom(s,p)?'Free space in the active fleet is required.':s.credits<p.cost?'Not enough available funds.':'';return {...p,count,canBuy:!reason,reason};})};
}
function customsPackingAction(s,arg){
 // Legacy direct purchase requests must never recreate the former dry-dock shop.
 check(arg.kind==='discard','Cargo-screening packages are sold only by visiting canteen traders.');
 const p=customsPacks.find(p=>p.id===arg.item);check(p&&s.profile.created&&!s.incident&&!s.battle&&!s.fleetLoss,'Resolve the encounter before handling packages.');takeScreeningLots(s,p.id,1);record(s,'Discarded one '+p.name.toLowerCase()+' package from the active fleet.');
}
function customsDetectionChance(s,tag,units,method,gear){
 const practice=Math.min(.18,(earnedLevel(s,'commerce')+earnedLevel(s,'engineering'))*.01),electronic=['ai-cores','combat-drones'].includes(tag),liner=gear.has('spectral-liner')?(electronic?.22:.10):0,sleeve=gear.has('thermal-sleeve')?(tag==='biocultures'?.24:.10):0,packing=(liner+sleeve)*(method.id==='boarding'?.3:1),bulk=Math.min(.10,Math.max(0,units-2)*.012);return Math.max(.16,Math.min(.995,method.detection+bulk-practice-packing));
}
function inspectArrival(s,dest,inspectionIDs){
 if(s.fleetLoss)return;
 const standing=customsStanding(s,dest);
 const key='customs-v2:'+s.seed+':'+(s.castSeed||'legacy')+':'+s.day+':'+dest+':'+s.flagshipID+':'+s.profile.stats.voyages+':'+s.profile.stats.battles,draw=tag=>Number(hash(key+':'+tag)%1000000n)/1000000;
 if(draw('selected')>=inspectionChance(dest,s))return;
 const method=customsMethods[draw('method')<.35?0:draw('method')<.8?1:2],arriving=inspectionIDs?[s,...s.fleet].filter(v=>inspectionIDs.includes(actorID(s,v))):[s,...s.fleet.filter(v=>v.escort||(v.carrierID||v.towID)&&fleetMembers(s).some(c=>actorID(s,c)===(v.carrierID||v.towID)))];
 if(!arriving.length)return;
 const checked=arriving.filter(v=>draw('hull:'+actorID(s,v))<method.hulls);if(!checked.length)checked.push(arriving[Math.floor(draw('fallback')*arriving.length)]);
 const items=[],packingUsed=[],gear=new Set();
 // Use one package per type for the whole arriving convoy, even if its carrying hull is not checked.
 for(const p of customsPacks){const carrier=arriving.find(v=>screeningLots(v,p.id).length);if(carrier){const lot=screeningLots(carrier,p.id)[0];carrier.missionCargo=carrier.missionCargo.filter(l=>l!==lot);gear.add(p.id);packingUsed.push({shipID:actorID(s,carrier),item:p.id});}}
 const detected=(v,tag,units,gear)=>draw('find:'+actorID(s,v)+':'+tag)<customsDetectionChance(s,tag,units,method,gear);

 let seizedCases=0;
 for(const v of checked){
  for(const g of contrabandGoods){const units=v.cargo[g.id]||0;if(units&&detected(v,g.id,units,gear)){items.push({shipID:actorID(s,v),shipName:actorName(s,v),good:g.id,units});removeCargo(v,g.id,units);}}
  for(const j of s.campaign?.jobs||[])if(j.chain&&j.status==='active'&&j.illicit&&(v.missionCargo||[]).some(l=>l.id===j.artifactID)&&detected(v,'antiquity:'+j.id,1,gear)){v.missionCargo=v.missionCargo.filter(l=>l.id!==j.artifactID);seizedCases++;missionFail(s,j,'illicit antiquity seized by customs');record(s,'Port authority seized the patron’s illicit antiquity case.');}
 }
 const seized=items.reduce((a,r)=>a+r.units,0),r={id:uuid(),day:s.day,port:dest,ships:checked.length,seized,items,antiquityCases:seizedCases,method:method.id,packingUsed,packingScope:'fleet'};s.cargoInspections=[...(s.cargoInspections||[]),r].slice(-80);
 if(seized||seizedCases){changeStationReputation(s,dest,-standing.localPenalty,'Restricted cargo seized on arrival.');changeReputation(s,-standing.publicPenalty,'Port authority seized '+seized+' restricted cargo units and '+seizedCases+' illicit antiquity cases at '+port(dest).name+'.');record(s,method.name+' at '+port(dest).name+': '+checked.length+' ships checked; '+seized+' restricted cargo units and '+seizedCases+' illicit antiquity cases seized.');}
 else record(s,method.name+' at '+port(dest).name+': '+checked.length+' ships cleared; no restricted freight detected.');
 if(packingUsed.length)record(s,'Cargo-screening packages used for the arriving fleet: '+packingUsed.map(p=>customsPacks.find(c=>c.id===p.item).name).join(', ')+'.');
 // Removing packing changes loaded carrier/tow mass; settle those physical totals before save validation.
 civilianSync(s);
}
function validateContraband(s){
 if(s.contrabandLedger!==undefined&&s.contrabandLedger!==null){const seen=new Set();check(Array.isArray(s.contrabandLedger)&&s.contrabandLedger.length<=78&&s.contrabandLedger.every(r=>{if(!r||!world.ports.some(p=>p.id===r.port)||!contrabandGoods.some(g=>g.id===r.good)||!integer(r.cycle,0,Math.floor(s.day/14))||!integer(r.bought,0,1000000)||!integer(r.sold,0,1000000))return false;const b=illicitBase(r.port,r.good,r.cycle),key=r.port+':'+r.good+':'+r.cycle;if(seen.has(key)||!b.open||b.stock-r.bought+r.sold<0||b.demand-r.sold+r.bought<0)return false;seen.add(key);return true;}),'Invalid restricted-market receipts.');}
 if(s.cargoInspections!==undefined&&s.cargoInspections!==null){const ids=new Set();check(Array.isArray(s.cargoInspections)&&s.cargoInspections.length<=80&&s.cargoInspections.every(r=>{if(!r||!str(r.id,80)||!r.id||ids.has(r.id)||!integer(r.day,0,s.day)||!world.ports.some(p=>p.id===r.port)||!integer(r.ships,1,MAX_FLEET)||!integer(r.seized,0,MAX_FLEET*MAX_CARGO_LOTS)||(r.antiquityCases!==undefined&&!integer(r.antiquityCases,0,3))||!Array.isArray(r.items)||r.items.length>MAX_FLEET*3)return false;ids.add(r.id);if(r.method!==undefined&&!customsMethods.some(m=>m.id===r.method))return false;if(r.packingScope!==undefined&&r.packingScope!=='fleet')return false;if(r.packingScope==='fleet'&&r.packingUsed&&new Set(r.packingUsed.map(p=>p?.item)).size!==r.packingUsed.length)return false;if(r.packingUsed!==undefined&&(!Array.isArray(r.packingUsed)||r.packingUsed.length>(r.packingScope==='fleet'?2:r.ships*2)||new Set(r.packingUsed.map(p=>p?.shipID+':'+p?.item)).size!==r.packingUsed.length||!r.packingUsed.every(p=>p&&str(p.shipID,80)&&p.shipID&&customsPacks.some(c=>c.id===p.item))||new Set(r.packingUsed.map(p=>p.shipID)).size>(r.packingScope==='fleet'?2:r.ships)))return false;const items=new Set();return r.items.every(i=>{if(!i||!str(i.shipID,80)||!i.shipID||!str(i.shipName,60)||!i.shipName||!contrabandGoods.some(g=>g.id===i.good)||!integer(i.units,1,1000))return false;const key=i.shipID+':'+i.good;if(items.has(key))return false;items.add(key);return true;})&&r.items.reduce((a,i)=>a+i.units,0)===r.seized&&new Set(r.items.map(i=>i.shipID)).size<=r.ships;}),'Invalid cargo inspection history.');}
}

// Catalogue prices rise by capability: couriers, working specialists, heavy hulls.
const ships = [
 {id:'kestrel',name:'Kestrel',role:'Cislunar courier',dryMass:12,cargoTonnes:8,tankTonnes:22,isp:50000,price:18000,maxSpares:3},
 {id:'peregrine',name:'Peregrine',role:'Interplanetary freighter',dryMass:28,cargoTonnes:30,tankTonnes:95,isp:52500,price:150000,maxSpares:4},
 {id:'albatross',name:'Albatross',role:'Deep-system freighter',dryMass:70,cargoTonnes:100,tankTonnes:350,isp:55000,price:900000,maxSpares:6}
];
ships.push(
 {id:'osprey',name:'Osprey',role:'Armed escort cutter',dryMass:18,cargoTonnes:4,tankTonnes:38,isp:52500,price:65000,maxSpares:4},
 {id:'petrel',name:'Petrel',role:'Long-range tanker',dryMass:22,cargoTonnes:12,tankTonnes:140,isp:50000,price:120000,maxSpares:4},
 {id:'gannet',name:'Gannet',role:'Heavy convoy escort',dryMass:48,cargoTonnes:16,tankTonnes:150,isp:55000,price:420000,maxSpares:6}
);
// Specialist hulls share the same mass, fuel, trading and combat rules.
ships.push(
 {id:'swift',thrustFactor:1.18,name:'Swift',role:'Express courier',dryMass:8,cargoTonnes:3,tankTonnes:18,isp:51500,price:26000,maxSpares:3},
 {id:'heron',thrustFactor:.92,name:'Heron',role:'Survey and research vessel',dryMass:14,cargoTonnes:6,tankTonnes:55,isp:54000,price:78000,maxSpares:5},
 {id:'tern',thrustFactor:.94,name:'Tern',role:'Refrigerated freighter',dryMass:25,cargoTonnes:22,tankTonnes:82,isp:52500,price:180000,maxSpares:4},
 {id:'cormorant',thrustFactor:.85,name:'Cormorant',role:'Industrial cargo tug',dryMass:38,cargoTonnes:45,tankTonnes:170,isp:53500,price:300000,maxSpares:6},
 {id:'pelican',thrustFactor:.78,name:'Pelican',role:'Bulk cargo carrier',dryMass:110,cargoTonnes:180,tankTonnes:480,isp:54000,price:1500000,maxSpares:7},
 {id:'gyrfalcon',thrustFactor:1.10,name:'Gyrfalcon',role:'Long-range patrol frigate',dryMass:62,cargoTonnes:10,tankTonnes:230,isp:55000,price:750000,maxSpares:6}
);
ships.push(...shipSpecs.prototypes.map(h=>({...h})));
for(const h of ships){if(!shipSpecs.prototypes.some(p=>p.id===h.id))h.price=shipSpecs.priceOverrides[h.id]??Math.round(h.price*shipSpecs.hullPriceMultiplier);h.balance=shipSpecs.balance[h.id];h.cargoTonnes=cargoSpecs.holds[h.id].tonnes;h.cargoM3=cargoSpecs.holds[h.id].m3;}
ships.sort((a,b)=>a.price-b.price);
const STARTER_LOAN=ships.find(h=>h.id==='kestrel').price,CHARTER_CREDIT_SCALE=STARTER_LOAN/4000;
const shipRules=shipRulesFactory.forHulls(ships);
const fittingCosts=(shipID,id)=>shipRules.fittingCosts(shipID,id);
const hullNotes={
 kestrel:'A compact working courier with paired drive nacelles, a panelled pressure hull and a recessed forward cockpit. Balanced for early freight runs.',
 peregrine:'Shielded container bays and paired heat radiators surround a reinforced service hull. More cargo room than a courier without bulk-carrier costs.',
 albatross:'A deep-system cargo lattice with large reserves and multiple container berths. High purchase and resupply costs reward planned routes.',
 osprey:'A compact armored cutter with reinforced gun mounts. Stronger standard lasers and combat systems trade cargo room for patrol work.',
 petrel:'Jacketed propellant drums dominate this tanker. Its large tank and modest hold suit long routes and low-volume cargo.',
 gannet:'A broad armored escort with paired engine pods. Heavy combat systems and reserves leave a smaller freight hold.',
 swift:'A light pressure cabin, narrow radiator vanes and clustered engines. An uprated drive suits small urgent cargoes; only three tonnes of hold space.',
 heron:'An instrument truss, large communication dish and survey cabin. Long endurance and extra spares, with little commercial hold space.',
 tern:'White insulated cargo pods and dedicated thermal panels protect temperature-sensitive freight. Refrigeration is included in the hull; cargo uses the standard market rules.',
 cormorant:'A reinforced handling fork, grapples and a low cargo cradle. A middleweight freight hauler with an industrial silhouette; no separate salvage system is required.',
 pelican:'Large cylindrical bulk modules on a reinforced cargo cradle. The largest hold in the fleet comes with substantial dry mass, slower acceleration and an expensive propellant load.',
 gyrfalcon:'Twin drive booms, a reinforced command citadel and patrol laser mounts. The strongest standard combat fit in the catalog, with limited freight capacity.'
};
for(const hull of ships)hull.description=hullNotes[hull.id]||hull.description;
const DRIVE = {name:"Asterion",acceleration:.04,playbackSeconds:32};
const driveStory = {"title": "The Asterion breakthrough", "subtitle": "How a rescue experiment opened the Solar System", "sections": [{"title": "2068 · The long way home", "text": "When a coolant failure stranded the survey ship Oriole beyond Jupiter, rescuers could carry replacement parts or enough propellant to arrive in time. They could not carry both. The crew survived in a moon depot, waiting through two transfer seasons. Their recordings became the case for a different kind of engine: one that could keep pushing, rather than spend a short burn committing a crew to years of coasting."}, {"title": "2074 · A nozzle that could survive", "text": "At Kepler Shipyard, engineer Mira Sen and plasma physicist Tomás Ibarra built a lattice magnetic nozzle that kept a pulsed fusion exhaust away from the engine walls. Earlier prototypes eroded before they could make a useful voyage. Their breakthrough combined replaceable field coils, active exhaust control and a pellet injector that could run for weeks. They named the prototype Asterion after the navigation star painted on the workshop door."}, {"title": "2081 · Accelerate, turn, brake", "text": "A crewed courier crossed from Earth to Mars in weeks. For the first half of the flight it accelerated; near the midpoint it turned its engine toward its destination and spent the second half slowing down. The achievement was sustained thrust with a very fast exhaust. It created no shortcut through space, and stopping still required as much planning as speeding up."}, {"title": "2083 · The visitors at Neptune", "text": "A decelerating ark appeared beyond Neptune after a journey measured in generations. Its Ilyri and Veyr passengers had crossed between stars by ordinary sublight travel. Asterion freighters brought supplies while orbital habitats prepared berths, humid rooms and new communications equipment. Visitors, human settlers and independent synthetic citizens began sharing the same docks. No species brought an instant answer to scarcity; everyone needed reliable neighbors."}, {"title": "2085 · The Open Drive Compact", "text": "Earth yards and the outer-moon cooperatives traded manufacturing rights for common safety standards. Retrofit kits reached old couriers as well as new freighters. Common fittings kept old couriers useful long after their original engines became obsolete. Hydrogen reaction mass and prepared fusion pellets are sold as one certified propellant load. Ice still needs refining, power and specialist processing."}, {"title": "2089 · Your independent charter", "text": "Faster ships made small independent cargo runs possible, but they did not erase scarcity. Habitats still need food, clinics need sterile supplies, and an empty tank can strand a fortune. Faster trade also gave armed crews more opportunities to extort arrivals. Your Kestrel is a used courier with a Compact conversion, a loan and a chance to build a reputation. The Solar System is closer. Making a living in it is still your job."}], "boundary": "Asterion and its inventors are original science fiction. The game assumes high-thrust fusion propulsion and heat management that do not exist as operational spacecraft technology. Distances, finite acceleration, braking, cargo mass and rocket-equation propellant still matter; there is no faster-than-light travel."};
const governmentHistory={"title": "Governments & treaties", "introduction": "A system of local governments, shared obligations and negotiated belonging.", "sections": [{"title": "2038 · The launch states", "text": "Earth’s national governments and regional unions still controlled launch licences, while their orbital facilities used separate rules for rescue and cargo liability. The Orbital Service Charter made a distress call a shared obligation and required every dock to name a civil authority; it did not create a government for the whole planet."}, {"title": "2051 · People who stayed", "text": "Lunar workers won elected habitat councils after remote owners tried to suspend water deliveries during a contract dispute. The Shackleton Articles separated life-support access from employment and recognised independent synthetic citizens as persons, establishing the principle that a resident’s rights could not belong to the company operating their berth."}, {"title": "2064 · A system of neighbours", "text": "Martian settlements formed a council for surface supplies and orbital arrivals, while Belt habitats pooled rescue ships without surrendering their own assemblies. The Jovian and Saturnian settlements later adopted mutual-aid leagues because instructions from Earth could arrive too late to settle a failing pump, a missing shipment or an evacuation."}, {"title": "2079 · The Interplanetary Compact", "text": "The Oriole rescue crisis and the first Asterion tests exposed the limits of separate emergency agreements. The Interplanetary Compact gave participating governments a joint assembly for rescue obligations, traffic standards and cross-border mediation; Earth’s launch administrations, lunar commons, Martian councils and habitat leagues kept their own civil law and budgets."}, {"title": "2083 · The Neptune Reception Covenant", "text": "The ark arriving beyond Neptune carried both Veyr and Ilyri communities after generations of sublight travel. A provisional covenant guaranteed emergency supplies, interpreters and the right to refuse settlement or biological examination, while elected ark delegates negotiated with human governments and synthetic citizens rather than surrendering their passengers to a single host state."}, {"title": "2084 · The Veyr Transit Accord", "text": "Veyr route houses and convoy assemblies negotiated recognition of shipboard civic records, translated manifests and crew representation in port hearings. In return, signatory crews accepted declared armaments, traceable cargo ownership and the receiving habitat’s safety rules; an oath between route houses could support testimony but could not replace evidence or a local access licence."}, {"title": "2085 · The Open Drive Compact", "text": "The manufacturing agreement described in the Asterion records exchanged retrofit rights for common fittings and safety standards. It gave old couriers a place in the new trade network, but remained a technical agreement distinct from the Interplanetary Compact and the later three-peoples settlement."}, {"title": "2086 · The Ilyri Habitat & Exchange Convention", "text": "Ilyri habitat circles and memory custodians sought control over living samples, medical consent and the records inherited from the ark. The convention established sealed biological cargo protocols, reciprocal habitat inspection by consent and stewardship claims for living collections; ownership of a sample did not grant ownership of the people or histories associated with it."}, {"title": "2087 · The Three Peoples Concord", "text": "Human government delegates, Veyr assemblies and Ilyri circles ratified equal civil standing for their residents, with synthetic citizens represented through their existing councils rather than assigned to a biological people. The Concord created a standing translation secretariat and mixed arbitration panels, while protecting each community’s choice of representatives and each habitat’s local jurisdiction."}, {"title": "2088 · The Arrival & Arbitration Protocol", "text": "A contested seizure exposed how easily a translated cargo declaration could become an accusation. The protocol required a named receiving authority, a dated record and access to an interpreter or mixed panel in treaty disputes; it also confirmed that access qualifications, customs restrictions and lawful local debt proceedings remained matters for the receiving port."}, {"title": "2089 · The desk between governments", "text": "Port authorities now serve as the Compact’s local liaison offices alongside their licensing and customs duties. Residents bring questions about which council can hear a dispute, what a treaty recognises and which office holds the evidence; independent captains carry that network’s daily promises between settlements that still disagree about power, resources and the cost of mutual aid."}]};
const governmentRegions={"earth": {"name": "Earth Orbital Commission", "mandate": "Earth’s launch administrations delegate orbital traffic coordination to the Commission; elected station councils handle resident services.", "tension": "Surface launch states still disagree over who should fund rescue capacity used by ships departing for distant settlements."}, "moon": {"name": "Lunar Commons Council", "mandate": "The lunar commons govern settlement services and water stewardship through elected habitat delegates.", "tension": "The Shackleton Articles are remembered here whenever a water supplier tries to make access to life support part of an employment bargain."}, "mars": {"name": "Martian Settlement Council", "mandate": "Surface settlement delegates and orbital residents share responsibility for food transfers, quarantine notices and arrivals.", "tension": "Local councils want treaty inspections to respect greenhouse isolation while offworld crews want records they can challenge without returning to Earth."}, "ceres": {"name": "Belt Free Habitats Assembly", "mandate": "Independent habitat assemblies fund a shared rescue pool and send rotating delegates to Compact hearings.", "tension": "Small docks worry that the cost of meeting common standards could leave them dependent on the largest freight combines."}, "jupiter": {"name": "Jovian Mutual Aid League", "mandate": "Moon settlements coordinate radiation shelter, emergency berths and rescue responsibilities through a mutual-aid league.", "tension": "Rescue cover matters more than a distant promise here, and every proposal is asked which crew will actually answer the distress call."}, "saturn": {"name": "Saturn Habitat Council", "mandate": "Separate moon and orbital councils share a treaty secretariat for biological containment, research exchange and rescue.", "tension": "Living collections and disputed sample custody keep the Ilyri convention in daily use without making every Ilyri resident a custodian."}, "uranus": {"name": "Outer Habitats Mutual Aid Assembly", "mandate": "Distant habitats retain their councils and pool interpreters, rescue stores and delegates through the outer assembly.", "tension": "Residents question whether Earth-centred meeting schedules give distant communities a practical voice when replies take so long."}, "neptune": {"name": "Outer Habitats Mutual Aid Assembly", "mandate": "Outer habitat councils share liaison staff with the ark communities that helped negotiate the Reception Covenant.", "tension": "The ark’s reception is living memory here, and residents still disagree over how temporary aid became lasting settlement obligations."}, "mercury": {"name": "Inner Habitats Cooperative", "mandate": "Local habitat councils share heat-safety standards and traffic representation through the inner cooperative.", "tension": "Industrial operators press for faster certification while residents insist that a distant customer cannot waive the risks carried by a local crew."}, "venus": {"name": "Inner Habitats Cooperative", "mandate": "Local habitat councils appoint delegates for traffic, environmental isolation and shared inner-system services.", "tension": "Treaty recognition is welcome here, but the receiving habitat still decides what can safely enter its closed environment."}};
const governmentTopics={"tree-government": {"node": "government", "question": "What does being a government liaison involve?", "text": "I carry questions between this port’s civil authority and the Interplanetary Compact, alongside the ordinary clearance work. I can explain the government records and the Veyr and Ilyri agreements, and identify which office is responsible for a dispute."}, "tree-gov-origins": {"node": "gov-history", "question": "How did the interplanetary governments take shape?", "text": "The early docks answered to Earth’s launch states and their owners, until permanent residents demanded councils of their own. The 2079 Interplanetary Compact linked those governments for rescue, traffic and mediation without replacing their local assemblies."}, "tree-gov-founding": {"node": "gov-detail", "question": "What made the settlements demand their own councils?", "text": "The 2051 lunar water dispute made it impossible to pretend a habitat was only a workplace. The Shackleton Articles protected life support from employment bargains and recognised synthetic personhood, and later Martian and Belt settlements built their own forms of representation around the people who stayed."}, "tree-gov-compact": {"node": "gov-detail", "question": "Who actually holds power in the Compact?", "text": "Member governments send accountable delegates to a joint assembly, and the Compact coordinates the obligations they have agreed to share. It has no single sovereign ruler of the Solar System; local councils retain civil law while cross-border disputes can be referred to mixed panels."}, "tree-gov-arrival": {"node": "gov-detail", "question": "How did the Veyr and Ilyri first arrive?", "text": "They arrived together beyond Neptune in 2083 aboard an ark whose voyage had lasted generations at sublight speed. The Reception Covenant arranged aid and interpreters while protecting each passenger’s choice to remain aboard, settle or refuse medical examination."}, "tree-gov-veyr": {"node": "gov-veyr", "question": "How was the agreement with the Veyr brokered?", "text": "The Veyr delegates wanted their crews recognised as people with records and representation, rather than treated as unregistered cargo on somebody else’s ship. Route houses and convoy assemblies negotiated the 2084 Transit Accord with Compact envoys, while disagreeing among themselves about how much authority to give any single delegation."}, "tree-gov-veyr-terms": {"node": "gov-detail", "question": "What did the Veyr Transit Accord actually recognise?", "text": "It recognised translated shipboard records, a crew’s right to representation and a hearing before the receiving authority. Veyr signatories accepted declared weapons, traceable ownership and local safety checks, so a route-house oath cannot substitute for a manifest or permission to enter a port."}, "tree-gov-veyr-disputes": {"node": "gov-detail", "question": "Where do Veyr and local authorities still disagree?", "text": "Some route houses consider a witnessed oath binding between crews, while receiving councils require an ownership trail another office can examine. The 2088 protocol gives both sides interpreters and an arbitration route, but neither a shared ancestry nor a good introduction settles the evidence."}, "tree-gov-ilyri": {"node": "gov-ilyri", "question": "How was the agreement with the Ilyri brokered?", "text": "The Ilyri circles asked whether a gift of a living sample would also surrender the memory and obligations carried with it. Habitat representatives, medical teams and custodians spent three years turning emergency reception arrangements into the 2086 Habitat and Exchange Convention, with individual consent kept separate from a circle’s collective decision."}, "tree-gov-ilyri-terms": {"node": "gov-detail", "question": "What protections did the Ilyri convention establish?", "text": "The convention protects medical consent and the custody of living collections and inherited records. A sealed specimen may be traded under agreed containment rules, but that transaction does not sell its custodian’s history or authorise unrestricted study of an Ilyri resident."}, "tree-gov-ilyri-disputes": {"node": "gov-detail", "question": "Where do Ilyri stewardship claims cause disputes?", "text": "A habitat may recognise private ownership of a specimen while its original custodians still claim a duty to prevent contamination or destruction. Mixed panels compare the actual exchange agreement and its translations, rather than assuming every Ilyri circle holds the same view of stewardship."}, "tree-gov-concord": {"node": "gov-detail", "question": "How do the three peoples share representation?", "text": "The 2087 Three Peoples Concord gave human, Veyr and Ilyri residents equal civil standing and a mixed forum for treaty disputes. Synthetic citizens participate through their own elected councils and local institutions, and no community’s delegate can consent on behalf of every person who shares its origin."}, "tree-gov-limits": {"node": "gov-detail", "question": "Does a treaty replace local clearances?", "text": "A treaty gives a recognised way to bring a claim and ask who must answer it. It does not issue a destination licence, waive a vessel qualification or cancel customs restrictions and local obligations."}, "tree-gov-local": {"node": "gov-detail", "question": "Which government does this port answer to?", "text": ""}};
function governmentBriefing(pid){const p=port(pid),r=governmentRegions[p.id==='moon'?'moon':p.group];check(r,'Unknown government jurisdiction.');return {station:p.name,body:p.body,government:r.name,mandate:r.mandate,tension:r.tension,local:`At ${p.name}, I serve as the local link to the ${r.name}. ${r.mandate}\n\n${r.tension}`};}
function governmentReply(s,host,topic){const entry=governmentTopics[topic];check(entry,'Unknown government record.');const b=governmentBriefing(s.location);return topic==='tree-gov-local'?b.local:entry.text;}
// Finite diplomatic assignments. Views are pure; all choices and outcomes use the ordinary action ledger.
const diplomaticParties=Object.fromEntries([...new Set(Object.values(governmentRegions).map(r=>r.name))].map(name=>['gov-'+name.toLowerCase().replace(/[^a-z]+/g,'-'),name]).concat([['veyr','Veyr assemblies'],['ilyri','Ilyri circles']]));
function governmentKey(pid){const name=governmentBriefing(pid).government;return Object.keys(diplomaticParties).find(k=>diplomaticParties[k]===name);}
const diplomaticRecipes={
 transit:{tier:1,accessRegion:'saturn',title:'A manifest in two traditions',people:'veyr',description:'A Veyr convoy’s witnessed ownership declaration conflicts with the receiving council’s register. Visit the receiving liaison, agree how the evidence will be heard, then bring the settlement back.',choices:[
  {id:'witness',title:'Recognise the convoy’s witnessed declaration',text:'Give the route-house witnesses priority over the disputed registry entry.',days:1,origin:-2,target:-1,veyr:6,reply:'The convoy witnesses will have the first hearing, and the Veyr delegates appreciate being taken seriously. The councils have recorded their concern that this leaves the ownership register unresolved.'},
  {id:'reconcile',title:'Reconcile both accounts with independent translation',text:'Give both crews a hearing and preserve the disputed entries while the translations are checked.',days:2,origin:3,target:3,veyr:3,reply:'Both records will remain available while the translated testimony is checked against the registry. Neither delegation received everything it asked for, but both are willing to continue the discussion.'},
  {id:'registry',title:'Give the receiving register precedence',text:'Require the convoy to satisfy the receiving council’s documentary standard.',days:1,origin:2,target:6,veyr:-5,reply:'The receiving council accepts your defence of its register and will retain that standard for this dispute. The Veyr delegates consider the hearing unequal and have withdrawn their offer of an informal introduction.'}]},
 stewardship:{tier:2,accessRegion:'uranus',title:'The sample and its memory',people:'ilyri',description:'An Ilyri custodian and a receiving laboratory disagree about what a purchased living sample permits. Hear the receiving authority, negotiate the custody record, then return with its decision.',choices:[
  {id:'custody',title:'Uphold the custodians’ restricted consent',text:'Keep the sample under its original stewardship terms until a new agreement is signed.',days:1,origin:1,target:-2,ilyri:6,reply:'The custodians retain control of the sample under the original consent record. The Ilyri circle is relieved, while the laboratory’s council objects to the interruption of its work.'},
  {id:'reciprocal',title:'Negotiate a limited reciprocal study',text:'Agree a narrow study with shared records, containment conditions and a right to stop.',days:2,origin:3,target:3,ilyri:3,reply:'The laboratory and custodians have signed a limited study with shared records and a right to stop. It took longer than either side wanted, but the Ilyri delegates and both councils will support another exchange.'},
  {id:'purchase',title:'Recognise the laboratory’s purchase claim',text:'Treat the documented sale as granting the laboratory control of this specimen’s study.',days:1,origin:-1,target:6,ilyri:-6,reply:'The receiving council has recognised the laboratory’s purchase claim over this specimen. The Ilyri custodians dispute that interpretation and will be reluctant to entrust another collection to your negotiations.'}]},
 concord:{tier:3,accessRegion:'neptune',title:'A corridor held in common',people:'joint',description:'Two governments and Veyr and Ilyri delegates are negotiating responsibility for a shared relief corridor. Your earlier negotiations have brought you into the talks; hear the receiving authority and return with a proposal the issuing council can register.',choices:[
  {id:'open',title:'Publish a shared oversight agreement',text:'Give both councils and both delegations access to the corridor’s decisions and records.',days:2,origin:4,target:4,veyr:2,ilyri:2,reply:'The councils and both delegations have accepted shared access to the corridor’s oversight records. Nobody has sole control, and the next meeting will begin from an agreement they can all inspect.'},
  {id:'council',title:'Leave control with the issuing council',text:'Ask the other parties to rely on the issuing government’s existing oversight.',days:1,origin:6,target:-3,veyr:-2,ilyri:-2,reply:'Your issuing council welcomes the stronger control you secured for it. The receiving government and both delegations consider the corridor less independent and will be cautious about future talks.'},
  {id:'delegates',title:'Support joint Veyr–Ilyri stewardship',text:'Give the two delegations responsibility for the corridor’s common records and priorities.',days:1,origin:-4,target:-2,veyr:5,ilyri:5,reply:'The Veyr and Ilyri delegates welcome your support for their joint stewardship proposal. Both councils have recorded reservations about transferring that responsibility outside their own institutions.'}]}
};
function diplomaticStanding(s,party){return s.diplomacy?.standing[party]||0;}
function diplomaticState(s){return s.diplomacy||(s.diplomacy={version:1,standing:Object.fromEntries(Object.keys(diplomaticParties).map(k=>[k,0])),missions:[]});}
function diplomaticReady(s){return s.profile.created&&(earnedLevel(s,'diplomacy')>=1||earnedLevel(s,'navigation')>=1);}
function diplomaticChange(s,changes){const d=diplomaticState(s),receipt=[];for(const [party,n] of Object.entries(changes)){const old=d.standing[party];d.standing[party]=Math.max(-100,Math.min(100,old+n));receipt.push({party,change:d.standing[party]-old,score:d.standing[party]});}return receipt;}
function diplomaticOffers(s){
 if(!diplomaticReady(s)||s.incident||s.fleetLoss||(s.diplomacy?.missions.filter(j=>j.status==='active').length||0)>=2)return [];
 const originParty=governmentKey(s.location),standing=diplomaticStanding(s,originParty);if(standing<=-15)return [];
 const destinations=world.ports.filter(p=>p.id!==s.location&&s.visited.includes(p.id)&&destinationAccess(s,p.id).open&&governmentKey(p.id)!==originParty&&diplomaticStanding(s,governmentKey(p.id))>-15).map(p=>({id:p.id,days:routeTransfer(s,p.id).coastDays})).sort((a,b)=>a.days-b.days||a.id.localeCompare(b.id));
 if(!destinations.length)return [];
 return Object.entries(diplomaticRecipes).flatMap(([kind,r])=>{
  if(!systemAccess(s,r.accessRegion).open)return [];
  const id=originParty+':'+kind;if(s.diplomacy?.missions.some(j=>j.id===id))return [];
  if(r.people!=='joint'&&diplomaticStanding(s,r.people)<=-15)return [];
  if(kind==='concord'&&(earnedLevel(s,'diplomacy')<2||standing<0||(s.diplomacy?.missions.filter(j=>j.status==='completed').length||0)<2||Math.max(diplomaticStanding(s,'veyr'),diplomaticStanding(s,'ilyri'))<5||Math.min(diplomaticStanding(s,'veyr'),diplomaticStanding(s,'ilyri'))<=-15))return [];
  const destination=destinations[Number(hash(id)%BigInt(Math.min(3,destinations.length)))].id,cost=serviceRouteCost(s,destination,{returnTrip:true,workDays:3}),duration=Math.ceil(cost.days*1.5+90),premium=1+Math.min(.15,Math.max(0,standing)*.001+Math.max(0,diplomaticStanding(s,r.people))* .001),reward=Math.ceil(serviceReward(cost,{work:3,extra:180})*premium*(1+captainPerk(s,'diplomaticFee')));
  if(s.day+duration>=365250||reward>10000000)return [];
  return [{id,kind,tier:r.tier,accessRegion:r.accessRegion,title:r.title,description:r.description,origin:s.location,destination,originParty,targetParty:governmentKey(destination),reward,duration,deadline:s.day+duration,terms:'Visit '+port(destination).name+' after accepting, negotiate at its Port Authority, then return to this desk by day '+(s.day+duration)+'. Hearing: 1–2 days and 60–120 cr, depending on your approach. '+reward+' cr on reporting back; '+(kind==='concord'?18:12)+' diplomacy XP. Failure or withdrawal damages diplomatic trust; no goods are loaded.'}];
 });
}
function diplomaticChoices(s,j){if(j.status!=='active'||j.choice||j.visitedDay===null||s.location!==j.destination||s.incident||s.fleetLoss||s.day>j.deadline)return [];return diplomaticRecipes[j.kind].choices.map(c=>({...c,cost:c.days*60,canChoose:s.credits>=c.days*60&&s.day+c.days<=j.deadline}));}
function diplomaticView(s,j){const r=diplomaticRecipes[j.kind],canReport=j.status==='active'&&!!j.choice&&j.returnedDay!==null&&s.location===j.origin&&!s.incident&&!s.fleetLoss&&s.day<=j.deadline;return {...clone(j),tier:r.tier,accessRegion:r.accessRegion,station:port(j.origin).name,receivingStation:port(j.destination).name,originGovernment:diplomaticParties[j.originParty],targetGovernment:diplomaticParties[j.targetParty],choices:diplomaticChoices(s,j),canReport,nextPort:j.choice?j.origin:j.destination,progress:j.status!=='active'?j.summary:j.choice?'Return to the issuing liaison with the agreed position.':j.visitedDay!==null?'The receiving liaison is ready to hear your position.':'Travel to the receiving authority after acceptance.',remaining:Math.max(0,j.deadline-s.day),choiceTitle:j.choice?(j.positionTitle||r.choices.find(c=>c.id===j.choice).title):''};}
function diplomaticOverview(s){const known=new Set(s.visited.map(governmentKey));return {standing:Object.entries(diplomaticParties).filter(([id])=>known.has(id)||['veyr','ilyri'].includes(id)).map(([id,name])=>({id,name,score:diplomaticStanding(s,id)})),offers:diplomaticOffers(s),active:(s.diplomacy?.missions||[]).filter(j=>j.status==='active').map(j=>diplomaticView(s,j)),history:(s.diplomacy?.missions||[]).filter(j=>j.status!=='active').map(j=>diplomaticView(s,j))};}
function diplomaticReply(s,text){const host=stationContacts(s.location,'authority',s).find(h=>!h.contactID);if(host)s.dialogue.push({id:uuid(),day:s.day,port:s.location,speaker:host.person,text,venue:'authority',contact:'',partner:host.person});s.dialogue=s.dialogue.slice(-160);}
function diplomaticClose(s,j,status){if(j.status!=='active')return;j.status=status;j.closedDay=s.day;j.failureEffects=diplomaticChange(s,{[j.originParty]:-4,[j.targetParty]:-2,...(diplomaticRecipes[j.kind].people==='joint'?{veyr:-2,ilyri:-2}:{[diplomaticRecipes[j.kind].people]:-2})});j.summary=status==='expired'?'The promised report did not arrive before the deadline; the delegations have closed the assignment.':'You withdrew from the assignment; the delegations have recorded the broken commitment.';record(s,j.title+': '+j.summary);}
function diplomaticAdvance(s){for(const j of s.diplomacy?.missions||[])if(j.status==='active'&&s.day>j.deadline)diplomaticClose(s,j,'expired');}
function diplomaticArrival(s,pid){for(const j of s.diplomacy?.missions||[])if(j.status==='active'&&s.day<=j.deadline){if(!j.choice&&pid===j.destination&&j.visitedDay===null)j.visitedDay=s.day;if(j.choice&&pid===j.origin&&j.returnedDay===null)j.returnedDay=s.day;}}
function diplomaticAction(s,type,arg){
 check(s.profile.created,'Sign your captain charter first.');
 if(type==='diplomatic-accept'){const o=diplomaticOffers(s).find(o=>o.id===arg.id);check(o,'This diplomatic assignment is not available.');diplomaticState(s).missions.push({...o,status:'active',acceptedDay:s.day,visitedDay:null,choice:null,positionTitle:null,choiceDay:null,returnedDay:null,closedDay:null,effects:[],failureEffects:[],summary:''});record(s,'Accepted diplomatic assignment: '+o.title+'. '+o.terms);diplomaticReply(s,'I have recorded your mandate and the return deadline. The receiving liaison will hear your position after your next arrival there.');return;}
 const j=s.diplomacy?.missions.find(j=>j.id===arg.id&&j.status==='active');check(j,'This diplomatic assignment is no longer active.');check(s.day<=j.deadline,'This diplomatic mandate has expired.');
 if(type==='diplomatic-abandon'){diplomaticClose(s,j,'withdrawn');diplomaticReply(s,'I have recorded your withdrawal and notified the other delegation. They will judge another invitation against this unfinished commitment.');return;}
 if(type==='diplomatic-negotiate'){const c=diplomaticChoices(s,j).find(c=>c.id===arg.choice);check(c&&c.canChoose,'This negotiating position is not available here.');s.credits-=c.cost;advance(s,c.days);j.choice=c.id;j.positionTitle=c.title;j.choiceDay=s.day;j.effects=diplomaticChange(s,{[j.originParty]:c.origin,[j.targetParty]:c.target,...(c.veyr?{veyr:c.veyr}:{}),...(c.ilyri?{ilyri:c.ilyri}:{})});j.summary=c.reply;record(s,j.title+': '+c.title+'. '+c.reply);diplomaticReply(s,c.reply);decision(s,'Diplomatic position at '+port(s.location).name+': '+c.title+'.');return;}
 check(type==='diplomatic-report'&&diplomaticView(s,j).canReport,'Return to the issuing liaison after the receiving hearing.');const xp=j.kind==='concord'?18:12;check(s.credits+j.reward<=999999999,'There is no room for the full mission payment.');s.credits+=j.reward;earn(s,'diplomacy',xp);changeStationReputation(s,j.origin,1,'Reported a completed diplomatic mandate.');j.status='completed';j.closedDay=s.day;record(s,j.title+': report accepted, '+j.reward+' cr and '+xp+' diplomacy XP. '+j.summary);diplomaticReply(s,'Your report is registered and the agreed mission fee has been transferred. The delegations will remember the position you took when they decide whom to invite next.');
}
function diplomaticGreeting(s,h,original){const government=diplomaticStanding(s,governmentKey(s.location)),people=['veyr','ilyri'].includes(h.species)?diplomaticStanding(s,h.species):0;if(!s.diplomacy||Math.abs(government)<5&&Math.abs(people)<5)return original;const first=original.match(/^.*?[.!?](?:\s|$)/)?.[0].trim()||'Welcome, Captain.';const feeling=government<=-5?'I still handle your public clearances, but our council is cautious after the positions you took in its negotiations.':people<=-5?'Our public desk remains open, but my community has reservations about the treaty positions you have supported.':government>=5?'Our council remembers your work at the negotiating table, and I am glad to discuss what comes next.':'The delegates from my community remember your support, and that gives this meeting a warmer beginning.';return first+' '+feeling;}
function validateDiplomacy(s){
 const d=s.diplomacy;if(d===undefined)return;const parties=Object.keys(diplomaticParties),keys=d&&d.standing&&Object.keys(d.standing);check(d&&d.version===1&&keys&&keys.length===parties.length&&keys.every(k=>parties.includes(k)&&integer(d.standing[k],-100,100))&&Array.isArray(d.missions)&&d.missions.length<=24,'Invalid diplomatic record.');const ids=new Set();let active=0;
 for(const j of d.missions){const recipe=diplomaticRecipes[j.kind];check(recipe&&typeof j.id==='string'&&!ids.has(j.id)&&world.ports.some(p=>p.id===j.origin)&&world.ports.some(p=>p.id===j.destination)&&j.origin!==j.destination&&j.originParty===governmentKey(j.origin)&&j.targetParty===governmentKey(j.destination)&&j.originParty!==j.targetParty&&j.id===j.originParty+':'+j.kind,'Invalid diplomatic mandate.');ids.add(j.id);check((j.tier===undefined||j.tier===recipe.tier)&&(j.accessRegion===undefined||j.accessRegion===recipe.accessRegion),'Invalid diplomatic tier.');check(str(j.title,200)&&j.title.length>0&&str(j.description,1000)&&str(j.terms,1200)&&integer(j.reward,1,10000000)&&integer(j.acceptedDay,0,s.day)&&integer(j.duration,1,100000)&&j.deadline===j.acceptedDay+j.duration&&j.deadline<365250&&['active','completed','expired','withdrawn'].includes(j.status)&&str(j.summary,1200),'Invalid diplomatic terms.');const dated=v=>v===null||integer(v,j.acceptedDay,s.day);check([j.visitedDay,j.choiceDay,j.returnedDay,j.closedDay].every(dated)&&(!j.choice||recipe.choices.some(c=>c.id===j.choice))&&(j.choice===null?j.positionTitle===null&&j.choiceDay===null&&j.returnedDay===null:str(j.positionTitle,200)&&j.positionTitle.length>0&&j.visitedDay!==null&&j.choiceDay>=j.visitedDay)&&(j.returnedDay===null||j.returnedDay>=j.choiceDay),'Invalid diplomatic hearing.');check(j.status==='active'?j.closedDay===null&&s.day<=j.deadline:j.closedDay!==null&&(j.status!=='completed'||j.choice&&j.returnedDay!==null&&j.closedDay>=j.returnedDay&&j.closedDay<=j.deadline),'Invalid diplomatic settlement.');for(const rows of [j.effects,j.failureEffects])check(Array.isArray(rows)&&rows.length<=4&&new Set(rows.map(r=>r.party)).size===rows.length&&rows.every(r=>parties.includes(r.party)&&integer(r.change,-100,100)&&integer(r.score,-100,100)),'Invalid diplomatic consequences.');check(j.choice?j.effects.length>=3:j.effects.length===0,'Missing diplomatic position record.');if(j.status==='active')active++;}
 check(active<=2,'Too many diplomatic mandates.');
}

const backgrounds = {
 trader:{name:'Freight broker',description:'You know supply chains and contract terms.',skill:'commerce'},
 engineer:{name:'Flight engineer',description:'You learned your trade keeping isolated outposts alive.',skill:'engineering'},
 navigator:{name:'Flight planner',description:'You build careful trajectories and contingency plans.',skill:'navigation'},
 mediator:{name:'Cooperative liaison',description:'You settle disputes between crews and stations.',skill:'diplomacy'},
 quartermaster:{name:'Station quartermaster',description:'You kept habitat stores supplied through late arrivals and lean seasons.',skill:'commerce'},
 appraiser:{name:'Salvage appraiser',description:'You learned to distinguish a valuable recovered component from expensive scrap.',skill:'commerce'},
 analyst:{name:'Market analyst',description:'You followed procurement cycles and compared cargo prices for independent crews.',skill:'commerce'},
 mechanic:{name:'Dockyard mechanic',description:'You rebuilt worn drives and kept visiting ships fit for their next departure.',skill:'engineering'},
 reactor:{name:'Reactor technician',description:'You tended power systems where a missed warning could darken an entire habitat.',skill:'engineering'},
 lifesupport:{name:'Life-support specialist',description:'You maintained the air, water and thermal loops that made station life possible.',skill:'engineering'},
 surveyor:{name:'Survey pilot',description:'You charted working approaches and brought unfamiliar routes into usable flight records.',skill:'navigation'},
 convoy:{name:'Convoy pilot',description:'You kept freight formations together through changing departure windows and long crossings.',skill:'navigation'},
 beltscout:{name:'Belt scout',description:'You mapped mining corridors, watched debris tracks and learned when to take the longer approach.',skill:'navigation'},
 clinician:{name:'Clinic coordinator',description:'You arranged care and scarce medical supplies while listening to frightened crews.',skill:'diplomacy'},
 steward:{name:'Port steward',description:'You worked between dock crews, residents and visiting captains to keep disputes from escalating.',skill:'diplomacy'},
 interpreter:{name:'Treaty interpreter',description:'You helped human, Veyr and Ilyri representatives understand the promises behind each translated agreement.',skill:'diplomacy'}
};
// Outlook families organize setup choices; each outlook has a distinct permanent advantage.
const temperamentInfo={
 measured:{name:'Measured',style:'measured',description:'You weigh the situation before committing yourself.'},
 cautious:{name:'Cautious',style:'measured',description:'You look for the failure point and keep a reserve in hand.'},
 analytical:{name:'Analytical',style:'measured',description:'You prefer a checked figure and a clear explanation to a convincing hunch.'},
 pragmatic:{name:'Pragmatic',style:'measured',description:'You look for a workable answer with the resources actually aboard.'},
 bold:{name:'Bold',style:'bold',description:'You are willing to commit when the moment calls for a clear decision.'},
 resolute:{name:'Resolute',style:'bold',description:'You hold your course through pressure and take responsibility for the choice.'},
 adventurous:{name:'Adventurous',style:'bold',description:'An unfamiliar destination feels like an invitation to find out more.'},
 independent:{name:'Independent',style:'bold',description:'You value choosing your own course and making your own judgment.'},
 empathetic:{name:'Empathetic',style:'empathetic',description:'You listen for what another person needs before deciding how to answer.'},
 diplomatic:{name:'Diplomatic',style:'empathetic',description:'You look for language that leaves room for both sides to reach an agreement.'},
 patient:{name:'Patient',style:'empathetic',description:'You give a tense conversation time to become a useful one.'},
 generous:{name:'Generous',style:'empathetic',description:'You are inclined to make room for another crew’s needs as well as your own.'}
};
// Permanent expertise is derived from the signed profile; reading a save grants no money or XP.
for(const [id,perk] of Object.entries({"trader":{"benefit":"New freight delivery fees are 8% higher.","effects":{"freightFee":0.08}},"engineer":{"benefit":"Engineering spares cost 10% less.","effects":{"spareDiscount":0.1}},"navigator":{"benefit":"Departure briefings cost 15% less.","effects":{"briefingDiscount":0.15}},"mediator":{"benefit":"Pirate negotiation success gains 5 percentage points.","effects":{"negotiation":0.05}},"quartermaster":{"benefit":"Local warehouse bays cost 10% less.","effects":{"warehouseDiscount":0.1}},"appraiser":{"benefit":"New recovery and assay mission service fees are 10% higher.","effects":{"salvageFee":0.1}},"analyst":{"benefit":"Earn 15% more Commerce XP from rewards, rounded down.","effects":{"commerceXP":0.15}},"mechanic":{"benefit":"Dry-dock hull repairs cost 12% less after local discounts.","effects":{"repairDiscount":0.12}},"reactor":{"benefit":"Fleet laser banks generate 2 less heat when fired.","effects":{"laserCooling":2}},"lifesupport":{"benefit":"Travel crew fatigue is 20% lower, rounded to whole points; minimum 1 per voyage.","effects":{"travelFatigue":0.2}},"surveyor":{"benefit":"Earn 15% more Navigation XP from rewards, rounded down.","effects":{"navigationXP":0.15}},"convoy":{"benefit":"Basic voyage provisions cost 10% less with at least one travelling escort.","effects":{"convoyProvisions":0.1}},"beltscout":{"benefit":"Belt debris and mining-traffic advisory chance is 25% lower.","effects":{"beltRisk":0.25}},"clinician":{"benefit":"Clinic recovery and full treatment cost 12% less.","effects":{"clinicDiscount":0.12}},"steward":{"benefit":"Access licences cost 8% less after earned discounts; minimum fees still apply.","effects":{"licenceDiscount":0.08}},"interpreter":{"benefit":"New diplomatic mission fees are 10% higher.","effects":{"diplomaticFee":0.1}}}))Object.assign(backgrounds[id],perk);
for(const [id,perk] of Object.entries({"measured":{"benefit":"Guard reduces incoming hull damage by 60% instead of 55%.","effects":{"guardBonus":0.05}},"cautious":{"benefit":"Equipment-incident chance is 10% lower; the 3% minimum still applies.","effects":{"incidentRisk":0.1}},"analytical":{"benefit":"Earn 10% more Engineering XP from rewards, rounded down.","effects":{"engineeringXP":0.1}},"pragmatic":{"benefit":"Battlefield repairs restore 3 additional integrity, up to full hull.","effects":{"fieldRepair":3}},"bold":{"benefit":"Fleet weapon hit chance gains 3 percentage points, within normal accuracy limits.","effects":{"accuracy":0.03}},"resolute":{"benefit":"Crew disruption from combat or encounter damage is 25% lower, rounded up.","effects":{"combatFatigue":0.25}},"adventurous":{"benefit":"First arrival at each new station earns 10 additional Navigation XP.","effects":{"discoveryXP":10}},"independent":{"benefit":"Basic voyage provisions cost 8% less when travelling without escorts.","effects":{"soloProvisions":0.08}},"empathetic":{"benefit":"New rewarded positive conversation choices gain 1 additional personal rapport, up to the usual cap.","effects":{"rapport":1}},"diplomatic":{"benefit":"Pirate negotiation success gains 3 percentage points.","effects":{"negotiation":0.03}},"patient":{"benefit":"Earn 10% more Diplomacy XP from rewards, rounded down.","effects":{"diplomacyXP":0.1}},"generous":{"benefit":"Completed clinic supply donations earn 1 additional public reputation point.","effects":{"clinicReputation":1}}}))Object.assign(temperamentInfo[id],perk);
function captainPerk(s,key){if(!s.profile?.created)return 0;return (backgrounds[s.profile.background]?.effects?.[key]||0)+(temperamentInfo[s.profile.temperament]?.effects?.[key]||0)+supportEffect(s,key);}
function captainAdvantages(s){return s.profile?.created?{background:{name:backgrounds[s.profile.background].name,benefit:backgrounds[s.profile.background].benefit},disposition:{name:temperamentInfo[s.profile.temperament].name,benefit:temperamentInfo[s.profile.temperament].benefit}}:null;}
const temperaments=Object.fromEntries(Object.entries(temperamentInfo).map(([id,v])=>[id,v.name]));
function negotiationChance(s,destination){return Math.max(.05,Math.min(.98,.45+level(s,'diplomacy')*.035+Math.min(.15,(s.profile.relationships[destination]||0)*.01)+captainPerk(s,'negotiation')));}

const skillNames={commerce:'Commerce',navigation:'Navigation',engineering:'Engineering',diplomacy:'Diplomacy'};
const clone=x=>JSON.parse(JSON.stringify(x));
const port=id=>{const p=world.ports.find(p=>p.id===id);if(!p)throw Error('Unknown destination.');return p;};
const system=id=>world.systems.find(s=>s.id===id);
const good=id=>{const g=allGoods.find(g=>g.id===id);if(!g)throw Error('Unknown cargo.');return g;};
const ship=s=>effectiveShip(s);
const mod=x=>((x%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
const hash=t=>{let h=1469598103934665603n;for(const c of new TextEncoder().encode(t))h=BigInt.asUintN(64,(h^BigInt(c))*1099511628211n);return h;};
const uuid=()=>globalThis.crypto?.randomUUID?.()||'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.floor(Math.random()*16);return(c==='x'?r:(r&3|8)).toString(16);});
function rng(s){s.seed=BigInt.asUintN(64,BigInt(s.seed)+0x9E3779B97F4A7C15n).toString();let z=BigInt(s.seed);z=BigInt.asUintN(64,(z^(z>>30n))*0xBF58476D1CE4E5B9n);z=BigInt.asUintN(64,(z^(z>>27n))*0x94D049BB133111EBn);z^=z>>31n;return Number(z>>11n)/9007199254740992;}
function captain(name='Alex Rivera',background='trader',temperament='measured'){
 if(!backgrounds[background]||!temperaments[temperament])throw Error('Choose a background and disposition.');
 const xp={commerce:0,navigation:0,engineering:0,diplomacy:0};xp[backgrounds[background].skill]=100;
 return {name:name.trim()||'Alex Rivera',species:'human',background,temperament,xp,traits:{caution:0,resolve:0,empathy:0},stats:{voyages:0,unitsSold:0,deliveries:0,repairs:0,negotiations:0,pirates:0,aid:0},relationships:{},decisions:[],created:false,migrated:false};
}
function fresh(){return initFleet({version:2,cargoPackingEdition:2,castSeed:hash(uuid()).toString(),castEdition:2,castV1Pins:[],day:0,credits:16000,debt:STARTER_LOAN,homeBase:{port:'earth',moves:[]},location:'earth',shipID:'kestrel',hull:100,fuel:16,spares:3,cargo:{},cargoBasis:{},pressure:{},visited:['earth'],commodityDiscovery:{version:3,known:[],entries:[]},completed:[],contract:null,incident:null,seed:'79522652315785',profile:captain(),dialogue:[],topics:[],log:[{id:uuid(),day:0,text:'A new charter at Meridian Station. Check the freight office for client shipments to the Moon and the exchange for your own return cargo.'}]});}
function parse(text){
 if(typeof text!=='string'||text.length>2000000)throw Error('The save must be a JSON file smaller than 2 MB.');
 // Preserve the full UInt64 RNG state in saves made by the original Swift prototype.
 text=text.replace(/("seed"\s*:\s*)(\d+)/,'$1"$2"');
 let s=JSON.parse(text);if(!s||Array.isArray(s))throw Error('This is not a voyage save.');
 if(s.version===1){s.version=2;s.seed=String(s.seed);s.profile=captain();s.profile.created=false;s.profile.migrated=true;s.profile.stats.voyages=Math.max(0,(s.visited||[]).length-1);s.profile.stats.deliveries=(s.completed||[]).length;s.dialogue=[];s.topics=[];s.incident=s.incident||null;s.contract=s.contract||null;record(s,'Voyage upgraded. Existing money, cargo and calendar preserved. Earlier visits are retained; detailed captain progression starts now.');}
 if(s.version===2){validate({...initFleet(clone(s)),version:3});initFleet(s);record(s,'Fleet registry initialized. Your existing ship, cargo, money and history are retained; upgrades and extra ships can be purchased at the yard.');}
 cargoPackingMigration(s);validate(s);retireMerchantAgreements(s);initializeShipNames(s);return s;
}
// Cosmetic names never draw from the gameplay RNG. Existing non-default names survive.
function generatedShipName(s,classID,id,previous=''){
 const names=[s.shipName,...s.fleet.map(v=>v.name),...(s.registryShips||[]).map(r=>r.vessel.name),previous].filter(Boolean);
 return shipNames.generate(classID,[s.castSeed||s.seed,id,previous].join(':'),names);
}
function initializeShipNames(s){
 if(s.shipNamesEdition===1)return s;
 const namedByPlayer=name=>(s.log||[]).some(l=>l.text.startsWith('Renamed ')&&l.text.endsWith(' to '+name+'.'));
 for(const v of [s,...s.fleet]){const flagship=v===s,name=flagship?s.shipName:v.name,base=ships.find(h=>h.id===v.shipID).name;
  if((name===base||new RegExp('^'+base+' \\d+$').test(name))&&!namedByPlayer(name)){
   const next=generatedShipName(s,v.shipID,flagship?s.flagshipID:v.id,name);if(flagship)s.shipName=next;else v.name=next;
  }
 }
 s.shipNamesEdition=1;return s;
}
function record(s,text){s.log.push({id:uuid(),day:s.day,port:s.location,who:s.profile.name,text});s.log=s.log.slice(-100);}
function check(ok,message){if(!ok)throw Error(message);}
const integer=(v,min,max)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const str=(v,max)=>typeof v==='string'&&v.length<=max;
function validate(s){
 combat2.validateDoctrine(s);
 validateTradeCareer(s);validateMerchant(s);
 check(s.shipNamesEdition===undefined||s.shipNamesEdition===1,'Invalid ship naming edition.');
 check(s.version===3,'Unsupported save version. The original file has been preserved.');
 check(s.castSeed===undefined||typeof s.castSeed==='string'&&(s.castSeed==='legacy'||/^\d{1,20}$/.test(s.castSeed)&&BigInt(s.castSeed)<=18446744073709551615n),'Invalid character cast seed.');
 check(s.castLegacyPins===undefined||s.castSeed==='legacy'&&Array.isArray(s.castLegacyPins)&&s.castLegacyPins.length<=196&&new Set(s.castLegacyPins).size===s.castLegacyPins.length&&s.castLegacyPins.every(key=>castCatalog().identities.some(v=>v.key===key)),'Invalid preserved character identities.');
 check(s.castEdition===undefined||s.castEdition===2&&s.castSeed!==undefined,'Invalid character cast edition.');
 check(s.castEdition===undefined&&s.castV1Pins===undefined||s.castEdition===2&&Array.isArray(s.castV1Pins)&&s.castV1Pins.length<=192&&new Set(s.castV1Pins).size===s.castV1Pins.length&&s.castV1Pins.every(key=>castCatalog().identities.some(v=>v.key===key)),'Invalid established character identities.');
 check(world.ports.some(p=>p.id===s.location)&&ships.some(x=>x.id===s.shipID),'Invalid saved station or ship.');
 validateFleet(s);validateRegistryShips(s);validateShipStock(s);validateCargoBasis(s);const sh=ship(s),ids=new Set(world.ports.map(p=>p.id));
 check(integer(s.day,0,365249)&&integer(s.credits,0,999999999)&&integer(s.debt,0,999999999)&&integer(s.hull,0,100)&&finite(s.fuel,0,sh.tankTonnes+.001)&&integer(s.spares,0,sh.maxSpares),'Invalid saved ship or account values.');
 check(s.cargo&&typeof s.cargo==='object'&&!Array.isArray(s.cargo)&&Object.keys(s.cargo).every(k=>allGoods.some(g=>g.id===k)&&integer(s.cargo[k],0,MAX_CARGO_LOTS))&&shipCargoFits(s,true),'Invalid saved cargo.');
 check(s.pressure&&typeof s.pressure==='object'&&!Array.isArray(s.pressure)&&Object.entries(s.pressure).every(([k,v])=>world.ports.some(p=>allGoods.some(g=>k===p.id+':'+g.id))&&finite(v,-.31,.31)),'Invalid market history.');
 check(Array.isArray(s.visited)&&s.visited.length<=ids.size&&s.visited.every(k=>ids.has(k))&&new Set(s.visited).size===s.visited.length&&(s.visited.includes(s.location)||blockadeWorldEntry(s,s.location)?.clearedDay===null&&(s.battle?.stationBlockade===s.location&&s.incident?.kind==='battle'||s.incident?.kind==='blockade'&&s.incident.destination===s.location||s.fleetLoss?.port===s.location)||s.incident?.kind==='battle-summary'&&s.incident.destination===s.location&&s.battleHistory?.at(-1)?.stationBlockade===s.location),'Invalid destination history.');
 check(s.unlocked===undefined||(Array.isArray(s.unlocked)&&s.unlocked.length<=ids.size&&s.unlocked.every(id=>ids.has(id))&&new Set(s.unlocked).size===s.unlocked.length),'Invalid destination charters.');
 check(s.licences===undefined||(Array.isArray(s.licences)&&s.licences.length<charters.length&&new Set(s.licences.map(l=>l?.id)).size===s.licences.length&&s.licences.every(l=>l&&charters.some(c=>c.id===l.id&&c.id!=='home')&&integer(l.cost,1,Math.max(...charters.map(c=>c.fee)))&&integer(l.day,0,s.day)&&ids.has(l.issuer))),'Invalid access licence receipts.');
 check(Array.isArray(s.completed)&&s.completed.length<=10000&&s.completed.every(k=>str(k,120)),'Invalid delivery history.');
 check(typeof s.seed==='string'&&/^\d{1,20}$/.test(s.seed)&&BigInt(s.seed)<=18446744073709551615n,'Invalid random state.');
 for(const c of activeContracts(s)){check(str(c.id,120)&&ids.has(c.destination)&&goods.some(g=>g.id===c.good)&&integer(c.quantity,1,400)&&integer(c.reward,1,999999999)&&integer(c.deadline,s.day,365249),'Invalid saved contract.');}
 if(s.incident){const i=s.incident;check(str(i.id,80)&&ids.has(i.destination)&&str(i.title,200)&&str(i.detail,2500)&&integer(i.damage,0,100)&&integer(i.delay,0,100)&&(i.phase===undefined||['route','approach'].includes(i.phase))&&(i.progress===undefined||finite(i.progress,0,1))&&(i.phase!=='route'||!!s.voyage)&&(!i.kind||['pirate','equipment','battle','asteroid','blockade','battle-summary'].includes(i.kind)),'Invalid encounter.');}
 const p=s.profile;for(const [field,options] of [['sex',identityCatalog.sexes],['gender',identityCatalog.genders],['pronouns',identityCatalog.pronouns]])check(p?.[field]===undefined||p[field]===null||options.some(v=>v.id===p[field]),'Invalid captain '+field+'.');check(p?.species===undefined||p.species===null||speciesCatalog.some(x=>x.id===p.species),'Invalid captain species.');check(p&&str(p.name,60)&&p.name.trim().length>0&&backgrounds[p.background]&&temperaments[p.temperament]&&typeof p.created==='boolean'&&typeof p.migrated==='boolean','Invalid captain profile.');
 check(p.xp&&Object.keys(skillNames).every(k=>integer(p.xp[k],0,1000000))&&p.traits&&['caution','resolve','empathy'].every(k=>integer(p.traits[k],0,1000000))&&p.stats&&['voyages','unitsSold','deliveries','repairs','negotiations','pirates','aid'].every(k=>integer(p.stats[k],0,1000000)),'Invalid captain progression.');
 check(p.relationships&&Object.entries(p.relationships).every(([k,v])=>ids.has(k)&&integer(v,-100,100))&&Array.isArray(p.decisions)&&p.decisions.length<=100&&p.decisions.every(d=>integer(d.day,0,s.day)&&str(d.text,500)),'Invalid captain history.');
 check(Array.isArray(s.log)&&s.log.length<=100&&s.log.every(l=>str(l.id,80)&&integer(l.day,0,s.day)&&str(l.text,2500)),'Invalid ship log.');
 check(Array.isArray(s.topics)&&s.topics.length<=4000&&s.topics.every(t=>str(t,120)),'Invalid conversation topics.');
 check(Array.isArray(s.dialogue)&&s.dialogue.length<=160&&s.dialogue.every(d=>str(d.id,80)&&integer(d.day,0,s.day)&&ids.has(d.port)&&str(d.speaker,100)&&str(d.text,4000)&&(d.venue===undefined||(['warehouse','crew'].includes(d.venue)||venueTypes.some(v=>v[0]===d.venue)))&&(d.contact===undefined||typeof d.contact==='string'&&d.contact.length<=80)&&(d.partner===undefined||str(d.partner,100))),'Invalid conversation history.');
 validateVoyage(s);validateShipLosses(s);validateContraband(s);validateExchangeStock(s);validateReputation(s);validatePatrolIntel(s);validateCanteen(s);validateTradeRumors(s);validateCommodityDiscoveries(s);validateBank(s);validateFreight(s);validateStationServices(s);validateDialogueProgress(s);check(careerDevelopment.validate(s),'Invalid continuing career record.');check(careerConversations.validate(s),'Invalid conversation career memory.');validateDebtCollections(s);validateHomeAndStanding(s);validateWarehouses(s);validateCantina(s);validateRelicHunts(s);validateNamedCrew(s);validateCrewEncounters(s);validateCivilian(s);validateCampaign(s);validateDiplomacy(s);validateBlockades(s);journalModel.validate(s.lastJournalEntry,s,world.ports.map(p=>p.id));return s;
}
const used=s=>Object.values(s.cargo).reduce((a,b)=>a+b,0);
function cargoLoad(v){return cargoSpecs.load(v.cargo||{});}
function cargoMass(v){return cargoLoad(v).grossTonnes;}
function cargoVolume(v){return cargoLoad(v).volumeM3;}
function shipCargoFits(v,legacy=false){const sh=effectiveShip(v),load=cargoLoad(v),raw=v.fittingEdition===2?shipRules.effectiveShip(v):legacyEffectiveShip(v),specialFits=(v.oreUnits||0)*.25+missionHold(v)<=raw.cargoTonnes+1e-8&&specialVolume(v)<=(raw.cargoM3??cargoSpecs.holds[v.shipID].m3)+1e-8;if(specialFits&&cargoSpecs.fits(sh.cargoTonnes,sh.cargoM3,load))return true;const grant=legacy&&v.legacyCargo;return !!grant&&finite(grant.tonnes,0,1000)&&finite(grant.m3,0,20000)&&load.grossTonnes<=grant.tonnes+1e-8&&load.volumeM3<=grant.m3+1e-8;}
function shipCargoRoom(v,id){if(!cargoCompatible(v,id))return 0;const sh=effectiveShip(v),load=cargoLoad(v);return cargoSpecs.room(sh.cargoTonnes-load.grossTonnes,sh.cargoM3-load.volumeM3,id);}
function specialVolume(v){return (v.oreUnits||0)*.2+(v.missionCargo||[]).filter(l=>l.kind!=='fuel').reduce((n,l)=>n+l.mass*(l.kind==='patients'?10:['component','antiquity'].includes(l.kind)?4:2),0);}
function physicalRoom(v,mass,m3=mass*2){const sh=effectiveShip(v),load=cargoLoad(v);return load.grossTonnes+mass<=sh.cargoTonnes+1e-8&&load.volumeM3+m3<=sh.cargoM3+1e-8;}
function cargoPackingMigration(s){
 for(const v of [s,...(s.fleet||[])]){if(v.cargoPackingEdition===undefined){const load=cargoLoad(v);if(!shipCargoFits(v)){v.cargoPackingEdition=1;v.legacyCargo={tonnes:load.grossTonnes,m3:load.volumeM3};}}else check([1,2].includes(v.cargoPackingEdition),'Invalid cargo packing edition.');}
 for(const w of Object.values(s.warehouses||{}))if(w.cargoPackingEdition===undefined&&(warehouseMass(w)>w.blocks*10000+1e-8||warehouseVolume(w)>w.blocks*cargoSpecs.warehouseM3PerBay+1e-8)){w.cargoPackingEdition=1;w.legacyCargo={kg:warehouseMass(w),m3:warehouseVolume(w)};}
}

// Shared convoy stores retain physical per-hull manifests for mass and destruction losses.
function fleetMembers(s){return s.fleetLoss?[]:[s,...s.fleet.filter(v=>v.escort&&v.location===s.location&&v.hull>0)];}
function fleetOverview(s){
 const members=fleetMembers(s),cargo={},cargoBasis={};let capacityUnits=0,usedUnits=0,fuel=0,tankTonnes=0,cargoGross=0,cargoNet=0,volumeM3=0,capacityM3=0;
 for(const v of members){const sh=effectiveShip(v);capacityUnits+=Math.round(sh.cargoTonnes*4);usedUnits+=used(v);cargoGross+=cargoMass(v);cargoNet+=used(v)*.25;volumeM3+=cargoVolume(v);capacityM3+=sh.cargoM3;fuel+=v.fuel;tankTonnes+=sh.tankTonnes;for(const [id,n] of Object.entries(v.cargo))cargo[id]=(cargo[id]||0)+n;for(const [id,r] of Object.entries(v.cargoBasis||{})){const prev=cargoBasis[id]||{units:0,cost:0};cargoBasis[id]={units:prev.units+r.units,cost:prev.cost+r.cost};}}
 return {count:members.length,capacityUnits,usedUnits,freeUnits:Math.max(0,Math.floor((capacityUnits*.25-cargoGross)*4+1e-8)),cargoTonnes:capacityUnits*.25,cargoMass:cargoGross,cargoNetMass:cargoNet,cargoM3:volumeM3,capacityM3,fuel,tankTonnes,cargo,cargoBasis};
}
// A read-only register: travelling pools exclude every ship left in a berth.
function fleetStatus(s){
 const pool=fleetOverview(s),active=new Set(fleetMembers(s).map(v=>actorID(s,v))),all=[...(s.fleetLoss?[]:[activeHull(s)]),...s.fleet];
 const vessels=all.map(v=>{const sh=effectiveShip(v),travelling=active.has(v.id),flagship=v.id===s.flagshipID,p=port(v.location),cargo=allGoods.filter(g=>(v.cargo[g.id]||0)>0).map(g=>({id:g.id,name:g.name,units:v.cargo[g.id],tonnes:v.cargo[g.id]*cargoSpecs.packing(g.id).grossKgPerLot/1000,netTonnes:v.cargo[g.id]*.25,volumeM3:v.cargo[g.id]*cargoSpecs.packing(g.id).m3PerLot,clientUnits:freightUnits(v,g.id)})),cargoMass=cargoLoad(v).grossTonnes;
  return {id:v.id,name:v.name,shipID:v.shipID,shipClass:sh.name,role:sh.role,flagship,travelling,carrierID:v.carrierID||null,oreUnits:v.oreUnits||0,passengers:v.passengers?.count||0,carriedMass:v.carrierMass||0,status:v.towID?'Under tow':v.carrierID?'Embarked':flagship?'Flagship':travelling?'Escort':v.escort?'Escort unavailable':'Berthed',port:p.id,station:p.name,body:p.body,local:p.id===s.location,hull:v.hull,condition:v.hull<35?'Repairs required before departure':v.hull<70?'Hull damage — service recommended':'Serviceable',specialCargo:(v.missionCargo||[]).map(l=>({kind:l.kind==='screening'?customsPacks.find(p=>p.id===l.screening).name:l.kind,mass:l.mass,owner:l.owner})),towID:v.towID||null,towMass:v.towMass||0,cargoMass,cargoNetMass:used(v)*.25,cargoM3:cargoVolume(v),capacityM3:sh.cargoM3,cargoTonnes:sh.cargoTonnes,freeCargo:Math.max(0,sh.cargoTonnes-cargoMass),fuel:v.fuel,tankTonnes:sh.tankTonnes,freeTank:Math.max(0,sh.tankTonnes-v.fuel),isp:sh.isp,spares:v.spares,maxSpares:sh.maxSpares,laser:laserPower(v),ammo:v.ammo,berthFee:reserveShipFee(s,v),upgrades:upgradeCatalog.filter(u=>(v.upgrades[u.id]||0)>0).map(u=>({id:u.id,name:u.name,level:v.upgrades[u.id],detail:u.detail})),cargo};
 });
 const travelling=vessels.filter(v=>v.travelling),berthed=vessels.filter(v=>!v.travelling&&!v.carrierID&&!v.towID),berths=[];
 for(const v of berthed){let group=berths.find(b=>b.port===v.port);if(!group){group={port:v.port,station:v.station,body:v.body,local:v.local,fee:0,ships:[]};berths.push(group);}group.ships.push(v);group.fee+=v.berthFee;}
 return {ownedCount:vessels.length,travellingCount:travelling.length,escortCount:travelling.filter(v=>!v.flagship).length,berthedCount:berthed.length,embarkedCount:vessels.filter(v=>v.carrierID).length,carried:vessels.filter(v=>v.carrierID),towed:vessels.filter(v=>v.towID),berthFee:reserveFee(s,1),flagshipID:s.flagshipID,station:port(s.location).name,body:port(s.location).body,pool,travelling,berths,note:'Cargo and propellant are shared across the travelling fleet. Per-ship figures show the current hold and tank allocation. Integrity, weapons and upgrades belong to each hull. Berthed ships and their stores are excluded from travelling totals.'};
}
function fleetQuantity(s,id){return fleetMembers(s).reduce((n,v)=>n+(v.cargo[id]||0),0);}
function cargoCompatible(v,id){const g=goods.find(g=>g.id===id);return !g?.handling||g.handling.some(cap=>classCapabilities[v.shipID]?.includes(cap));}
function cargoRoom(s,id){return fleetMembers(s).reduce((n,v)=>n+shipCargoRoom(v,id),0);}
function addFleetCargo(s,id,n,receipt={units:0,cost:0}){const plan=freightLoadPlan(s,{},[{good:id,quantity:n}]);check(plan.complete,'This cargo needs free weight and volume in compatible travelling ships.');for(const a of plan.allocations)addCargo(a.v,id,a.units,{units:receipt.units*a.units/n,cost:receipt.cost*a.units/n});}
function removeFleetCargo(s,id,n,ownedOnly=false){check(n<=(ownedOnly?tradableQuantity(s,id):fleetQuantity(s,id)),'Not enough eligible cargo aboard the travelling fleet.');let receipt={units:0,cost:0};for(const v of fleetMembers(s)){const part=Math.min(n,(v.cargo[id]||0)-(ownedOnly?freightUnits(v,id):0));if(part>0){const r=removeCargo(v,id,part);receipt.units+=r.units;receipt.cost+=r.cost;n-=part;}if(!n)break;}return receipt;}
function setFleetFuel(s,total){const pool=fleetOverview(s);check(finite(total,0,pool.tankTonnes+1e-7),'Choose a propellant target within the fleet tank capacity.');total=Math.min(total,pool.tankTonnes);for(const v of fleetMembers(s))v.fuel=pool.count===1?total:pool.tankTonnes?total*effectiveShip(v).tankTonnes/pool.tankTonnes:0;}
function spendFleetFuel(s,amount){const pool=fleetOverview(s);check(amount<=pool.fuel+1e-8,'The travelling fleet needs more propellant.');setFleetFuel(s,Math.max(0,pool.fuel-amount));}
// Fuel is redistributed between compatible tanks as required. Integrating each hull's
// rocket-equation demand against its tank share keeps different Isp values and cargo mass.
function fleetFuelPlan(s,deltaV){if(fleetMembers(s).length===1)return soloQuote(s,{deltaV});const pool=fleetOverview(s);let a=0,b=0;for(const v of fleetMembers(s)){const sh=effectiveShip(v),ve=sh.isp*.00980665;a+=(sh.dryMass+cargoMass(v))/ve;b+=(sh.tankTonnes/pool.tankTonnes)/ve;}const minimumFuel=b?a/b*Math.expm1(b*deltaV):a*deltaV,burn=b?(pool.fuel+a/b)*(-Math.expm1(-b*deltaV)):a*deltaV;return {minimumFuel,burn};}
function fleetManeuverFuel(s,deltaV){return fleetFuelPlan(s,deltaV).burn;}
const routeFuelRules=Object.freeze({arrivalReserveDeltaV:.4,minimumArrivalReserve:.15,solverSteps:44});
const routeFuelCache=new Map();
// Compile unchanged hull data once: solving a load must not clone saves or repeat
// fitting/manifest work on every iteration. Never cache player cash or permissions.
function routeFuelLoadingPlan(s,dest){
 if(s.location===dest){const fuel=fleetOverview(s).fuel;return {feasible:true,minimumDepartureFuel:0,target:fuel,requiredReserve:0,reserveCovered:true,expectedBurn:0,arrivalFuel:fuel,days:0};}
 const members=fleetMembers(s),pool=fleetOverview(s),parts=members.map(v=>{const sh=effectiveShip(v),h=ships.find(h=>h.id===v.shipID);return {dry:sh.dryMass+cargoMass(v),tank:sh.tankTonnes,ve:sh.isp*.00980665,thrust:DRIVE.acceleration*(h.thrustFactor||1)*(h.dryMass+h.cargoTonnes*.5+h.tankTonnes*.5)};}),key=JSON.stringify([s.location,dest,s.day,pool.fuel,parts]);
 if(routeFuelCache.has(key))return {...routeFuelCache.get(key)};
 const tank=pool.tankTonnes;let a=0,b=0;for(const p of parts){p.share=tank?p.tank/tank:0;a+=p.dry/p.ve;b+=p.share/p.ve;}
 const evaluate=fuel=>{const acceleration=parts.length?Math.min(...parts.map(p=>Math.max(.001,Math.min(.1,p.thrust/(p.dry+fuel*p.share))))):DRIVE.acceleration,t=transfer(port(s.location),port(dest),s.day,acceleration),burn=b?(fuel+a/b)*(-Math.expm1(-b*t.deltaV)):a*t.deltaV;return {burn,arrival:fuel-burn,days:t.coastDays+t.waitDays};};
 const reserve=Math.max(routeFuelRules.minimumArrivalReserve,b?a/b*Math.expm1(b*routeFuelRules.arrivalReserveDeltaV):0),full=evaluate(tank),feasible=parts.length>0&&tank>0&&full.arrival>=-1e-8;
 const solve=arrival=>{let lo=0,hi=tank;for(let i=0;i<routeFuelRules.solverSteps;i++){const mid=(lo+hi)/2;if(evaluate(mid).arrival>=arrival)hi=mid;else lo=mid;}return Math.min(tank,hi+1e-7);};
 const minimumDepartureFuel=feasible?solve(0):null,reserveCovered=feasible&&full.arrival+1e-8>=reserve,target=feasible?Math.max(pool.fuel,reserveCovered?solve(reserve):tank):pool.fuel,loaded=evaluate(target);
 const result=Object.freeze({feasible,minimumDepartureFuel:s.location===dest?0:minimumDepartureFuel,target:s.location===dest?pool.fuel:target,requiredReserve:reserve,reserveCovered,expectedBurn:loaded.burn,arrivalFuel:Math.max(0,loaded.arrival),days:loaded.days});
 if(routeFuelCache.size>=128)routeFuelCache.delete(routeFuelCache.keys().next().value);routeFuelCache.set(key,result);return {...result};
}
function validateShipLosses(s){
 check(s.fleetLoss===undefined||s.fleetLoss===null||s.fleetLoss&&integer(s.fleetLoss.day,0,s.day)&&world.ports.some(p=>p.id===s.fleetLoss.port)&&s.hull===0&&s.fuel===0&&used(s)===0&&(!s.incident||s.incident.kind==='battle-summary')&&!s.battle&&(s.fleetLoss.reason==null||s.fleetLoss.reason==='repossession'),'Invalid lost-fleet state.');
 check(s.shipLosses===undefined||s.shipLosses===null||Array.isArray(s.shipLosses)&&s.shipLosses.length<=80&&new Set(s.shipLosses.map(v=>v.id)).size===s.shipLosses.length&&s.shipLosses.every(v=>str(v.id,80)&&v.id&&str(v.name,60)&&ships.some(x=>x.id===v.shipID)&&integer(v.day,0,s.day)&&world.ports.some(p=>p.id===v.port)&&finite(v.fuel,0,1000)&&v.cargo&&typeof v.cargo==='object'&&!Array.isArray(v.cargo)&&Object.entries(v.cargo).every(([k,n])=>allGoods.some(g=>g.id===k)&&integer(n,0,1000))),'Invalid destroyed-ship history.');
}
function copyCivilianHull(to,from){for(const key of ['passengers','oreUnits','oreCost','carrierMass','missionCargo','duty','towMass','contractTow','cargoPackingEdition','legacyCargo']){if(from[key]!==undefined)to[key]=clone(from[key]);else delete to[key];}}
function promoteShip(s,next){copyCivilianHull(s,next);s.fleet=s.fleet.filter(v=>v.id!==next.id);s.flagshipID=next.id;s.shipName=next.name;for(const k of ['shipID','hull','fuel','spares','cargo','upgrades','ammo'])s[k]=clone(next[k]);s.ordnanceAmmo=next.ordnanceAmmo||0;s.fittingEdition=next.fittingEdition||1;s.cargoBasis=clone(next.cargoBasis||{});if(next.freightCargo)s.freightCargo=clone(next.freightCargo);else delete s.freightCargo;}
function destroyShip(s,v){
 civilianShipLoss(s,v);
 const id=actorID(s,v),name=actorName(s,v),b=s.battle,units=used(v);s.shipLosses=[...(s.shipLosses||[]),{id,name,shipID:v.shipID,day:s.day,port:b.destination,cargo:clone(v.cargo),fuel:v.fuel}].slice(-80);
 combatLog(s,`${name} destroyed. ${units} cargo units, its remaining propellant and all fitted equipment lost.`);record(s,`${name} destroyed near ${port(b.destination).name}. ${units} cargo units lost with the hull.`);
 for(const k of ['acted','guarded','evaded'])b[k]=b[k].filter(x=>x!==id);delete b.heat[id];
 if(v!==s){s.fleet=s.fleet.filter(x=>x.id!==id);reconcileFreightLoss(s);return;}
 const next=s.fleet.find(x=>x.escort&&x.hull>0);
 if(next){promoteShip(s,next);reconcileFreightLoss(s);combatLog(s,`Command transferred to ${s.shipName}.`);}
 else {s.fuel=0;s.cargo={};s.cargoBasis={};delete s.freightCargo;s.upgrades=emptyUpgrades();s.ammo=0;s.ordnanceAmmo=0;s.spares=0;delete s.missionCargo;delete s.duty;s.fleetLoss={day:s.day,port:b.destination};reconcileFreightLoss(s);finishBattle(s,'defeat');}
}
// Each additional level costs twice as much XP as the previous step; level 10 remains the cap.
function xpThreshold(n){check(integer(n,0,10),'Invalid skill level.');return 100*(2**n-1);}
function skillProgressForXP(xp){check(integer(xp,0,1000000),'Invalid skill experience.');let level=0;while(level<10&&xp>=xpThreshold(level+1))level++;const lower=xpThreshold(level),next=level<10?xpThreshold(level+1):null,step=next===null?0:next-lower;return {level,xp,lower,next,step,remaining:next===null?0:next-xp,fraction:next===null?1:(xp-lower)/step};}
const level=(s,k)=>Math.min(10,skillProgressForXP(s.profile.xp[k]).level+Math.max(relicBonuses(s)[k],crewBonus(s,k)));
function earn(s,k,n,bonuses=true){const before=s.profile.xp[k],gain=n>0&&bonuses?Math.floor(n*(1+captainPerk(s,k+'XP'))+1e-9):n;s.profile.xp[k]=Math.max(0,Math.min(1000000,before+gain));return s.profile.xp[k]-before;}
function decision(s,text,trait){s.profile.decisions.push({day:s.day,port:s.location,who:s.profile.name,text});s.profile.decisions=s.profile.decisions.slice(-100);if(trait)s.profile.traits[trait]++;}
function disposition(p){const t=p.traits,m=Math.max(t.caution,t.resolve,t.empathy);return m===0?'A reputation still unwritten':m===t.empathy?'A captain who helps others':m===t.caution?'A careful, prepared captain':'A captain who holds their course';}
function journalContext(){return {names:Object.fromEntries([...allGoods,...ships,...world.ports,...relicCatalog,...customsPacks,...warehouseAmmunition].flatMap(x=>[[x.id,x.name],...(x.type?[[x.type,x.name]]:[])])),weaponType:(v,slot)=>shipRules.weaponFits(v).find(f=>f.slot===slot)?.type||'unsorted',reputation:reputationData,levelForXP:n=>skillProgressForXP(n).level};}
function journalEntry(before,after,event={}){
 const entry=journalModel.entry(before,after,event,journalContext());
 if(event.recording&&entry.venue){const traveller=event.type.startsWith('secret-')?secretContact(after):null,host=event.type.startsWith('secret-')?(traveller&&traveller.key===event.args?.key?secretHost(after,traveller):null):stationContacts(entry.origin,entry.venue,after).find(h=>(h.contactID||'')===(event.args?.contact||''));if(host&&!entry.who.includes(host.person))entry.who.push(host.person);}
 const member=[...(before?.namedCrew?.members||[]),...(after.namedCrew?.members||[])].find(m=>m.id===event.args?.id);if(member&&!entry.who.includes(member.name))entry.who.push(member.name);
 return entry;
}
function journalChanges(before,after){return journalModel.changes(before,after,journalContext());}
// Integer scores retain their original save/history contract; fractional merit is saved separately.
function reputationStep(score,local=false){return local?200+10*Math.max(0,score)+5*Math.max(0,score-60)**2:400+20*Math.max(0,score)+10*Math.max(0,score-70)**2;}
function reputationSupport(p){const scores=Object.values(p.relationships||{});return {established:scores.filter(n=>n>=20).length,strong:scores.filter(n=>n>=30).length,devoted:scores.filter(n=>n>=40).length};}
function reputationCeiling(p){const n=reputationSupport(p);return n.established<3?90:n.strong<6?97:n.devoted<10?99:100;}
function reputationData(p){
 const score=p.reputationScore??Math.min(100,p.stats.deliveries*3+p.stats.aid*5+(p.stats.victories||0)*4),label=score>=90?'Exceptional reputation':score>=70?'Distinguished reputation':score>=30?'Trusted reputation':score>0?'Good reputation':score<=-30?'Notorious reputation':score<0?'Bad reputation':'Neutral reputation';
 const support=reputationSupport(p),ceiling=reputationCeiling(p),progress=p.reputationProgress||0,required=reputationStep(score);
 return {score,label,progress,required,ceiling,support,detail:'Good deeds build saved reputation progress. Gains slow as your record grows, and local trust strengthens endorsements. Above 90 requires trust 20 at three stations; above 97 requires trust 30 at six; reaching 100 requires trust 40 at ten. Setbacks apply immediately and erase unearned progress. Dated canteen reports can spread real deeds or misconduct to other stations, with limited one-time consequences. Existing earned scores are retained.',history:p.reputationHistory||[]};
}
function reputationProfile(p){return reputationData(p).label+' · '+disposition(p);}
function reputation(s){return reputationProfile(s.profile);}
function validateReputation(s){
 const p=s.profile;check(p.reputationProgress===undefined||integer(p.reputationProgress,0,reputationStep(reputationData(p).score)-1),'Invalid reputation progress.');
 check(p.localReputationProgress===undefined||p.localReputationProgress&&typeof p.localReputationProgress==='object'&&!Array.isArray(p.localReputationProgress)&&Object.entries(p.localReputationProgress).every(([pid,n])=>world.ports.some(p=>p.id===pid)&&integer(n,0,reputationStep(p.relationships[pid]||0,true)-1)),'Invalid local reputation progress.');
 validateReputationRumors(s);
 check(p.reputationScore===undefined||p.reputationScore===null||integer(p.reputationScore,-100,100),'Invalid public reputation.');
 if(p.reputationHistory===undefined||p.reputationHistory===null)return;
 check(integer(p.reputationScore,-100,100)&&Array.isArray(p.reputationHistory)&&p.reputationHistory.length<=100&&p.reputationHistory.every((r,i,list)=>r&&integer(r.day,0,s.day)&&world.ports.some(p=>p.id===r.port)&&integer(r.change,-100,100)&&r.change!==0&&str(r.reason,200)&&r.reason.length>0&&integer(r.score,-100,100)&&integer(r.score-r.change,-100,100)&&(!i||r.day>=list[i-1].day&&r.score===list[i-1].score+r.change))&&(!p.reputationHistory.length||p.reputationHistory.at(-1).score===p.reputationScore),'Invalid reputation history.');
}
function changeReputation(s,points,reason){
 if(!points)return;
 const p=s.profile,old=reputationData(p).score;let score=old;
 if(points>0){const local=p.relationships[s.location]||0,endorsement=Math.max(.5,Math.min(1.5,1+local/100));let merit=(p.reputationProgress||0)+Math.round(points*100*endorsement),ceiling=Math.max(old,reputationCeiling(p));while(score<ceiling&&merit>=reputationStep(score)){merit-=reputationStep(score);score++;}p.reputationProgress=Math.min(merit,reputationStep(score)-1);}
 else {score=Math.max(-100,old+points);p.reputationProgress=0;}
 p.reputationScore=score;
 if(score===old){if(points>0&&old<100)record(s,'Reputation progress: '+reason+' Standing '+score+'; '+p.reputationProgress+' / '+reputationStep(score)+' toward the next point'+(score>=reputationCeiling(p)?'; wider station support required.':'.'));return;}
 const entry={day:s.day,port:s.location,change:score-old,reason,score};p.reputationHistory=[...(p.reputationHistory||[]),entry].slice(-100);record(s,`Reputation ${entry.change>0?'+':''}${entry.change}: ${reason} Standing ${score}.`);
}
// Reports carry dated, verified deeds, never a purchased endorsement or a new source made from gossip.
function reputationRumorSources(s){
 const publicRows=(s.profile.reputationHistory||[]).filter(r=>!r.reason.startsWith('Dockside report:')).map(r=>({...r,kind:'public'}));
 const localRows=(s.stationReputationHistory||[]).filter(r=>!r.reason.startsWith('Dockside report:')&&/deliver|freight|clinic|medical|passenger|charter|raider|commission|liberat|mandate|seiz|cargo|debt|false|promise/i.test(r.reason)).map(r=>({...r,kind:'local'}));
 return [...publicRows,...localRows].filter(r=>s.day-r.day<=180).map(r=>({...r,key:hash(JSON.stringify([r.day,r.port,Math.sign(r.change)])).toString(16)})).sort((a,b)=>b.day-a.day||Math.sign(a.change)-Math.sign(b.change)||a.key.localeCompare(b.key));
}
function reputationRumorView(s){
 const receipts=s.reputationRumors||[],recent=receipts.filter(r=>r.port===s.location).at(-1),sources=reputationRumorSources(s),lastBad=Math.max(-1,...sources.filter(r=>r.change<0).map(r=>r.day)),blocked=recent&&s.day-recent.day<30;
 const source=!blocked&&receipts.length<2600?sources.find(r=>r.port!==s.location&&(r.change<0||r.day>lastBad)&&!receipts.some(q=>q.key===r.key&&q.port===s.location)&&receipts.filter(q=>q.key===r.key).length<3):null;
 const standing=stationStanding(s),welcome=standing.effective>=20?'Your record earns a warm reception here.':standing.effective<=-20?'People are cautious about trusting your promises here.':'People here are still weighing your record.';
 return {source:source||null,recent:recent||null,canSpread:!!source,text:source?'A dated report from '+port(source.port).name+' is being discussed: “'+source.reason+'” (day '+source.day+'). '+(source.change>0?'A credible introduction can slowly build local and wider trust.':'The warning damages local trust and your wider standing.'):blocked?'We have already discussed the latest report here. New accounts are considered after day '+(recent.day+30)+'.':'There is no fresh, independently recorded account of your work to pass on here. Reports are considered for 180 days and reach at most three other stations.',welcome};
}
function discussReputationRumor(s){
 const view=reputationRumorView(s),r=view.source;if(!r)return view.welcome+'\n\n'+view.text;
 const sign=Math.sign(r.change),reason=('Dockside report: '+port(r.port).name+' · day '+r.day+' · '+r.reason).slice(0,200),before=reputationData(s.profile).score,localBefore=s.profile.relationships[s.location]||0;
 changeReputation(s,sign,reason);changeStationReputation(s,s.location,sign*2,reason);
 const receipt={key:r.key,port:s.location,origin:r.port,day:s.day,sourceDay:r.day,sign,publicChange:reputationData(s.profile).score-before,localChange:(s.profile.relationships[s.location]||0)-localBefore,reason:r.reason};
 if(!s.reputationRumors)s.reputationRumors=[];s.reputationRumors.push(receipt);record(s,'Dockside report from '+port(r.port).name+' (day '+r.day+'): '+r.reason+' Heard at '+port(s.location).name+'. Local trust '+(receipt.localChange>0?'+':'')+receipt.localChange+'; wider reputation '+(receipt.publicChange>0?'+':'')+receipt.publicChange+'.');
 return view.welcome+'\n\n'+view.text+'\n\n'+(sign>0?'The account is recorded as reputation progress; goodwill still has to be earned.':'The warning is recorded: −2 local trust and −1 wider reputation, subject to the score floor.');
}
function validateReputationRumors(s){
 if(s.reputationRumors===undefined)return;const seen=new Set(),counts=new Map(),last=new Map();
 check(Array.isArray(s.reputationRumors)&&s.reputationRumors.length<=2600&&s.reputationRumors.every(r=>{if(!r||!str(r.key,16)||!/^[0-9a-f]+$/.test(r.key)||!world.ports.some(p=>p.id===r.port)||!world.ports.some(p=>p.id===r.origin)||r.port===r.origin||!integer(r.day,0,s.day)||!integer(r.sourceDay,Math.max(0,r.day-180),r.day)||![-1,1].includes(r.sign)||!integer(r.publicChange,r.sign<0?-1:0,r.sign>0?1:0)||!integer(r.localChange,r.sign<0?-2:0,r.sign>0?1:0)||!str(r.reason,200)||!r.reason||seen.has(r.key+':'+r.port)||(counts.get(r.key)||0)>=3||r.day-(last.get(r.port)??-30)<30)return false;seen.add(r.key+':'+r.port);counts.set(r.key,(counts.get(r.key)||0)+1);last.set(r.port,r.day);return true;}),'Invalid reputation rumour receipts.');
}

function closeBrokenContract(s,c){const key='broken-contract:'+c.id;if(!s.topics.includes(key))s.topics.push(key);}

// Consigned freight occupies real holds, but belongs to the client until it is
// delivered, reimbursed after a breach, or deliberately stolen with a restitution claim.
// Keep the original single-job save slot; additional jobs and manifests are
// addressed by contract ID. Existing saves stay byte-for-byte stable on read.
// Station dispatch capacity and fixed route distance govern independent freight cycles.
// Orbital phase, captain skills, fleet choice and reloads never reroll an offer clock.
const freightStationDays={earth:90,moon:105,'earth-high':105,mars:120,phobos:135,deimos:150,ceres:150,mercury:150,venus:120,callisto:165,jupiter:180,io:195,europa:180,ganymede:165,titan:195,saturn:210,enceladus:225,rhea:210,iapetus:240,uranus:270,miranda:300,ariel:285,titania:270,oberon:285,neptune:330,triton:360};
// Dispatch uses the broker's actual reserves and the receiving client's unfilled needs.
function freightDispatchRoutes(s){
 const known=new Set(goods.map(g=>g.id)),members=fleetMembers(s),book=marketBook(s),lead=marketEconomy.stationProfiles[s.location].lead;
 const source=goods.filter(g=>known.has(g.id)&&marketEconomy.listed(s.location,g.id)&&members.some(v=>cargoCompatible(v,g.id))).map(g=>{
  const flow=marketEconomy.supply(s.location,g.id,s.day),stock=marketStock(s,g.id,s.location,false),reserve=Math.ceil(stock.consumption*Math.max(3,Math.min(30,lead/4)));
  return {g,stock:stock.wholesaleAvailable,physicalStock:stock.quantity,reserve,excess:Math.min(stock.wholesaleAvailable,Math.max(0,stock.quantity-Math.max(reserve,stock.protectedStock))),flow,net:(flow.dailyProduction-flow.dailyConsumption)*g.inventoryScale};
 }).filter(x=>x.excess>0);
 const routes=[];
 for(const p of world.ports.filter(p=>p.id!==s.location&&destinationAccess(s,p.id).open)){
  const t=routeTransfer(s,p.id),schedule=freightRouteSchedule(s,p.id),base=`freight-v4-${s.location}-${p.id}-${schedule.cycle}`;
  const candidates=source.map(x=>{
   const target=marketStock(s,x.g.id,p.id,false),flow=marketEconomy.supply(p.id,x.g.id,s.day),net=(flow.dailyConsumption-flow.dailyProduction)*x.g.inventoryScale;
   const inbound=activeContracts(s).filter(c=>c.destination===p.id).reduce((n,c)=>n+freightLines(c).filter(l=>l.good===x.g.id).reduce((a,l)=>a+l.quantity,0),0),credit=book?.demandCredits?.[p.id+':'+x.g.id]||0;
   const deficit=Math.max(0,target.baseline-target.quantity),need=Math.max(0,Math.floor(deficit+Math.max(0,net)*30-Math.max(0,target.quantity-target.baseline)-inbound-credit));
   const score=(net>0?1:0)+(x.net>0?.75:0)+Math.min(3,deficit/Math.max(1,target.baseline))+Math.min(2,need/Math.max(6,target.baseline*.1));
   return {...x,need,targetStock:target.quantity,targetNet:net,score,limit:Math.min(x.excess,need)};
  }).filter(x=>x.limit>=6).sort((a,b)=>b.score-a.score||Number(hash(base+':'+a.g.id)%1000n)-Number(hash(base+':'+b.g.id)%1000n));
  if(candidates.length&&s.day+t.coastDays+t.waitDays<365249)routes.push({p,t,schedule,base,candidates,score:candidates[0].score/(1+Math.log1p(t.coastDays+t.waitDays)/4)});
 }
 // Modest regional diversity avoids replacing three neighbouring destinations with six neighbours.
 const ranked=[],groups={};while(routes.length){routes.sort((a,b)=>b.score/(1+(groups[b.p.group]||0)*.35)-a.score/(1+(groups[a.p.group]||0)*.35)||a.t.coastDays-b.t.coastDays||a.p.id.localeCompare(b.p.id));const next=routes.shift();ranked.push(next);groups[next.p.group]=(groups[next.p.group]||0)+1;}
 return ranked;
}
function freightDestinations(s){return freightDispatchRoutes(s).map(r=>r.p);}

function freightRouteSchedule(s,destination){const origin=port(s.location),target=port(destination),stationDays=freightStationDays[origin.id],gap=Math.abs(target.au-origin.au),routeDays=target.group===origin.group?0:gap<1?30:gap<3?60:gap<8?120:gap<15?180:270,refreshDays=stationDays+routeDays,cycle=Math.floor(s.day/refreshDays),cycleStart=cycle*refreshDays,nextRefresh=Math.min(365249,cycleStart+refreshDays);return {origin:origin.id,destination,stationDays,routeDays,refreshDays,cycle,cycleStart,nextRefresh,remaining:nextRefresh-s.day};}
function freightRouteTaken(s,offer){const ids=[...activeContracts(s).map(c=>c.id),...s.completed,...s.topics.filter(t=>t.startsWith('broken-contract:')).map(t=>t.slice('broken-contract:'.length))];return ids.some(id=>{if(id===offer.id||id.startsWith(`freight-v4-${offer.origin}-${offer.destination}-${offer.cycle}-`))return true;const v3=`freight-v3-${offer.origin}-${offer.destination}-`;if(id.startsWith(v3))return Number(id.slice(v3.length))===offer.cycle;const prefix='freight-v2-'+offer.origin+'-'+offer.destination+'-';if(!id.startsWith(prefix))return false;const cycle=Number(id.slice(prefix.length));return Number.isInteger(cycle)&&cycle>=0&&cycle*90>=offer.cycleStart&&cycle*90<offer.nextRefresh;});}
const freightTiers=Object.freeze([
 Object.freeze({id:0,name:'Parcel',level:0,access:2,units:6,products:1,ships:1,reference:'kestrel'}),
 Object.freeze({id:1,name:'Mixed freight',level:1,access:4,units:24,products:2,ships:1,reference:'heron'}),
 Object.freeze({id:2,name:'Regional freight',level:2,access:8,units:96,products:3,ships:1,reference:'peregrine',standing:2}),
 Object.freeze({id:3,name:'Fleet charter',level:3,access:16,units:320,products:4,ships:2,reference:'albatross',standing:3})
]);
function freightLines(c){return c.lines||[{good:c.good,quantity:c.quantity,cargoValue:c.cargoValue||0}];}
function freightDescription(c){return freightLines(c).map(l=>l.quantity+' units of '+good(l.good).name.toLowerCase()).join(', ');}
function freightCareer(s){const pool=fleetOverview(s);return {level:Math.max(earnedLevel(s,'commerce'),earnedLevel(s,'navigation')),access:accessiblePorts(s).length,capacity:Math.floor(pool.cargoTonnes*4),ships:fleetMembers(s).length,standing:commercialStanding(s)};}
// A small maximum-flow plan reserves compatible holds before any cargo is moved.
// General-purpose space cannot crowd out cargo that needs a specialist hull.
function freightLoadPlan(s,c,lines=freightLines(c)){
 const vessels=fleetMembers(s),bins=vessels.map(v=>{const sh=effectiveShip(v),load=cargoLoad(v);return {grams:Math.max(0,Math.round((sh.cargoTonnes-load.grossTonnes)*1e6)),litres:Math.max(0,Math.round((sh.cargoM3-load.volumeM3)*1000)),accepts:lines.filter(l=>cargoCompatible(v,l.good)).map(l=>l.good),rank:goods.filter(g=>g.handling&&cargoCompatible(v,g.id)).length};});
 const result=cargoPacking.plan(bins,lines.map(l=>{const p=cargoSpecs.packing(l.good);return {...l,grams:Math.round(p.grossKgPerLot*1000),litres:Math.round(p.m3PerLot*1000)};}));
 return {...result,allocations:result.allocations.map(a=>({v:vessels[a.index],good:a.good,units:a.units}))};
}
function activeContracts(s){return [...(s.contract?[s.contract]:[]),...(s.freightContracts||[])];}
function freightContract(s,id){const jobs=activeContracts(s);return id===undefined?(jobs.length===1?jobs[0]:null):jobs.find(c=>c.id===id);}
function addFreightContract(s,c){if(!s.contract)s.contract=c;else s.freightContracts=[...(s.freightContracts||[]),c];}
function removeFreightContract(s,c){const jobs=activeContracts(s).filter(j=>j.id!==c.id);s.contract=jobs.shift()||null;if(jobs.length)s.freightContracts=jobs;else delete s.freightContracts;}
function freightManifests(v){return !v.freightCargo?[]:Array.isArray(v.freightCargo)?v.freightCargo:[v.freightCargo];}
function setFreightManifests(v,rows){if(!rows.length)delete v.freightCargo;else v.freightCargo=rows.length===1?rows[0]:rows;}
function freightUnits(v,id){return freightManifests(v).reduce((n,f)=>n+(f.good===id?f.units:0),0);}
function tradableQuantity(s,id){return fleetMembers(s).reduce((n,v)=>n+(v.cargo[id]||0)-freightUnits(v,id),0);}
function freightQuantity(s,travelling=false,contractID){const ids=new Set(activeContracts(s).filter(c=>contractID===undefined||c.id===contractID).map(c=>c.id));return (travelling?fleetMembers(s):[s,...s.fleet]).reduce((n,v)=>n+freightManifests(v).reduce((n,f)=>n+(ids.has(f.contractID)?f.units:0),0),0);}
function freightBoardSchedule(s){const routes=freightDestinations(s).map(p=>freightRouteSchedule(s,p.id)),nextRefresh=routes.length?Math.min(...routes.map(r=>r.nextRefresh)):null;return {stationDays:freightStationDays[s.location],routes,nextRefresh,remaining:nextRefresh===null?null:nextRefresh-s.day};}
function freightCounts(vessels){const totals=new Map();for(const v of vessels)for(const f of freightManifests(v))totals.set(f.contractID,(totals.get(f.contractID)||0)+f.units);return totals;}
function freightOverview(s){
 const days=Math.max(0,(s.freightStanding?.suspendedUntil||0)-s.day),counts=freightCounts(fleetMembers(s)),jobs=activeContracts(s).map(c=>{const aboard=c.fulfilment==='consignment'?(counts.get(c.id)||0):tradableQuantity(s,c.good);return {...c,payable:freightPayout(c),supplied:c.fulfilment==='consignment',aboard,required:c.quantity,liability:(c.cargoValue||0)+(c.breachFee||0),theft:freightTheftOffer(s,c.id,aboard,c)};});
 return {returns:freightReturnOverview(s),suspensionDays:days,suspendedUntil:s.freightStanding?.suspendedUntil||0,failures:s.freightStanding?.failures||0,history:s.freightStanding?.history||[],board:freightBoardSchedule(s),jobs,theft:jobs[0]?.theft||freightTheftOffer(s),active:jobs[0]||null};
}
function freightTheftOffer(s,id,aboard,knownContract){
 const c=knownContract||(id===undefined?s.contract:freightContract(s,id)),supplied=c?.fulfilment==='consignment',reason=s.fleetLoss?'Recover command of a surviving ship first.':s.incident?'Resolve the current encounter first.':!s.profile.created?'Sign your captain charter first.':!c?'There is no active client shipment.':!supplied?'This contract uses your own purchased goods; there is no client cargo to steal.':(aboard??freightQuantity(s,true,c.id))!==c.quantity?'Bring the entire client shipment into your travelling fleet first.':'';
 return {id:c?.id||null,canSteal:!reason,reason,quantity:supplied?c.quantity:0,goodName:supplied?freightDescription(c):'',charge:supplied?c.cargoValue+c.breachFee:0,reputation:-12,trustLoss:10,suspensionDays:60};
}
function loadFreight(s,c,n=c.quantity,id=null){
 const lines=id?[{good:id,quantity:n}]:freightLines(c),plan=freightLoadPlan(s,c,lines);check(plan.complete,'Make compatible hold space for the entire client shipment in your active fleet.');
 for(const {v,good:id,units} of plan.allocations){addCargo(v,id,units);const rows=freightManifests(v),prior=rows.find(f=>f.contractID===c.id&&f.good===id);if(prior)prior.units+=units;else rows.push({contractID:c.id,good:id,units});setFreightManifests(v,rows);}
}
function unloadFreight(s,c){for(const v of fleetMembers(s)){const rows=freightManifests(v);for(const f of rows)if(f.contractID===c.id)v.cargo[f.good]-=f.units;setFreightManifests(v,rows.filter(f=>f.contractID!==c.id));}}
// Failed consignments stay client property until physically returned. Only missing
// cargo is invoiced; an explicit theft alone transfers custody with restitution basis.
function freightLossValue(c,lost){return freightLines(c).reduce((n,l)=>n+Math.ceil(l.cargoValue*(lost[l.good]||0)/l.quantity),0);}
function freightReturnJobs(s){return s.freightReturns||[];}
function freightReturnOverview(s){return freightReturnJobs(s).map(c=>{const aboard=[s,...s.fleet].reduce((n,v)=>n+freightManifests(v).filter(f=>f.contractID===c.id).reduce((a,f)=>a+f.units,0),0),local=[s,...s.fleet.filter(v=>v.location===s.location)].reduce((n,v)=>n+freightManifests(v).filter(f=>f.contractID===c.id).reduce((a,f)=>a+f.units,0),0);return {...c,aboard,local,canReturn:local>0&&!s.incident&&!s.battle&&!s.voyage};});}
function freightExitQuote(s,c,reason='abandoned'){
 const counts=Object.fromEntries(freightLines(c).map(l=>[l.good,[s,...s.fleet].reduce((n,v)=>n+freightManifests(v).filter(f=>f.contractID===c.id&&f.good===l.good).reduce((a,f)=>a+f.units,0),0)])),lost=Object.fromEntries(freightLines(c).map(l=>[l.good,Math.max(0,l.quantity-counts[l.good])])),stolen=reason==='stolen',cargoCharge=stolen?c.cargoValue:freightLossValue(c,lost),charge=cargoCharge+c.breachFee,paid=Math.min(s.credits,charge);
 return {cargoCharge,breachFee:c.breachFee,charge,paid,debt:charge-paid,lost,remaining:Object.values(counts).reduce((a,b)=>a+b,0)};
}
function updateFreightReturnReceipt(s,c,extra=0,paid=0){const h=s.freightStanding?.history.find(h=>h.contractID===c.id);if(!h||h.version!==2)return;h.unitsLost=Object.values(c.lost).reduce((a,b)=>a+b,0);h.returnedUnits=Object.values(c.returned).reduce((a,b)=>a+b,0);h.cargoCharge=c.lossCharge;h.charge+=extra;h.paid+=paid;h.debt+=extra-paid;}
function clearFreightReturn(s,c){if(freightLines(c).every(l=>(c.lost[l.good]||0)+(c.returned[l.good]||0)===l.quantity)){s.freightReturns=freightReturnJobs(s).filter(r=>r.id!==c.id);if(!s.freightReturns.length)delete s.freightReturns;}}
function returnFreight(s,id){
 const c=freightReturnJobs(s).find(c=>c.id===id);check(c,'That client return has already been settled.');check(!s.incident&&!s.battle&&!s.voyage,'Return sealed freight while safely docked.');check(establishments(s.location,false,s).some(v=>v.id==='contracts'),'A freight office is required to return client cargo.');let units=0;const returned=[];
 for(const v of [s,...s.fleet.filter(v=>v.location===s.location)]){const rows=freightManifests(v);for(const f of rows)if(f.contractID===c.id){v.cargo[f.good]-=f.units;c.returned[f.good]=(c.returned[f.good]||0)+f.units;units+=f.units;returned.push(f.units+' '+good(f.good).name);}setFreightManifests(v,rows.filter(f=>f.contractID!==c.id));}
 check(units>0,'Bring a ship carrying this client cargo to the local freight office.');updateFreightReturnReceipt(s,c);clearFreightReturn(s,c);record(s,`Returned sealed client cargo at ${port(s.location).name}: ${returned.join(', ')}. No purchase, freight reward or extra cargo charge. Original breach fee and any missing-cargo bill remain settled as recorded.`);
}
function reconcileFreightLoss(s){
 const counts=freightCounts([s,...s.fleet]);for(const c of activeContracts(s))if(c.fulfilment==='consignment'&&(counts.get(c.id)||0)<c.quantity)failFreight(s,'lost',c);
 for(const c of [...freightReturnJobs(s)]){for(const l of freightLines(c)){const held=[s,...s.fleet].reduce((n,v)=>n+freightManifests(v).filter(f=>f.contractID===c.id&&f.good===l.good).reduce((a,f)=>a+f.units,0),0),expected=l.quantity-(c.returned[l.good]||0)-(c.lost[l.good]||0);if(held<expected)c.lost[l.good]=(c.lost[l.good]||0)+expected-held;}const value=freightLossValue(c,c.lost),extra=value-c.lossCharge;if(extra>0){const paid=Math.min(s.credits,extra);invoice(s,extra);c.lossCharge=value;updateFreightReturnReceipt(s,c,extra,paid);record(s,`Client return cargo lost: ${extra} cr additional restitution; paid ${paid} cr, ${extra-paid} cr added to original charter debt at Meridian Station. No second breach fee or reputation penalty.`);}else updateFreightReturnReceipt(s,c);clearFreightReturn(s,c);}
}
function failFreight(s,reason,c=s.contract){
 if(!c||!activeContracts(s).some(j=>j.id===c.id))return;closeBrokenContract(s,c);
 if(c.fulfilment!=='consignment'){const rep=reason==='late'?-3:-8;removeFreightContract(s,c);changeReputation(s,rep,reason==='late'?'Missed a delivery deadline for '+port(c.destination).name+'.':'Broke the delivery promise to '+port(c.destination).name+'.');record(s,`Existing purchase contract ${reason==='late'?'expired':'abandoned'}. Reputation ${rep}; original cargo and financial terms retained.`);return;}
 const q=freightExitQuote(s,c,reason),stolen=reason==='stolen',rep=stolen?-12:reason==='late'?-6:reason==='abandoned'?-8:-10,suspensionDays=stolen?60:30;invoice(s,q.charge);
 if(stolen){for(const v of [s,...s.fleet]){const rows=freightManifests(v);for(const f of rows)if(f.contractID===c.id){const l=freightLines(c).find(l=>l.good===f.good),prior=v.cargoBasis?.[f.good]||{units:0,cost:0};if(!v.cargoBasis)v.cargoBasis={};v.cargoBasis[f.good]={units:prior.units+f.units,cost:prior.cost+l.cargoValue*f.units/l.quantity};}setFreightManifests(v,rows.filter(f=>f.contractID!==c.id));}}
 else if(q.remaining>0){s.freightReturns=[...freightReturnJobs(s),{id:c.id,origin:c.origin,destination:c.destination,good:c.good,quantity:c.quantity,cargoValue:c.cargoValue,lines:clone(freightLines(c)),failedDay:s.day,reason,lost:q.lost,returned:{},lossCharge:q.cargoCharge}];}
 const previous=s.freightStanding||{failures:0,suspendedUntil:0,history:[]},suspendedUntil=Math.max(previous.suspendedUntil,Math.min(365249,s.day+suspensionDays));
 s.freightStanding={failures:previous.failures+1,suspendedUntil,history:[...previous.history,{version:2,contractID:c.id,day:s.day,reason,origin:c.origin,destination:c.destination,charge:q.charge,cargoCharge:q.cargoCharge,breachFee:c.breachFee,paid:q.paid,debt:q.debt,reputation:rep,suspendedUntil,unitsLost:c.quantity-q.remaining,returnedUnits:0}].slice(-50)};removeFreightContract(s,c);
 changeReputation(s,rep,`${stolen?'Stole client freight':reason==='late'?'Missed the deadline':reason==='abandoned'?'Abandoned client freight':'Lost client freight'} for ${port(c.destination).name}.`);for(const id of new Set([c.origin,c.destination]))changeStationReputation(s,id,stolen?-10:-5,'Freight breach: '+reason+'.');
 decision(s,`Freight ${stolen?'theft':reason}: ${q.charge} cr liability; paid ${q.paid} cr, ${q.debt} cr added to original charter debt. New freight jobs suspended for ${suspensionDays} days.`);
 record(s,`Freight ${stolen?'stolen':reason==='late'?'overdue':reason==='abandoned'?'abandoned':'lost'}: cargo restitution ${q.cargoCharge} cr + breach fee ${q.breachFee} cr = ${q.charge} cr; paid ${q.paid} cr, ${q.debt} cr added to original charter debt at Meridian Station. ${stolen?'The same physical goods are now tradable, with restitution as their acquisition basis.':q.remaining+' surviving units remain sealed client property, with no owned cost basis; return them at a freight office.'} No delivery reward or XP. New freight jobs suspended until day ${suspendedUntil}.`);
}
function validateFreight(s){
 const jobs=activeContracts(s),ports=new Set(world.ports.map(p=>p.id)),returns=freightReturnJobs(s),byID=new Map([...jobs,...returns.map(c=>({...c,fulfilment:'consignment'}))].map(c=>[c.id,c])),counts=freightCounts([s,...s.fleet]);
 check(s.freightReturns===undefined||Array.isArray(s.freightReturns)&&returns.length>0&&returns.length<=10000,'Invalid client return list.');
 check(new Set([...jobs,...returns].map(c=>c.id)).size===jobs.length+returns.length,'Duplicate client custody.');
 for(const c of returns){check(c&&str(c.id,120)&&ports.has(c.origin)&&ports.has(c.destination)&&c.origin!==c.destination&&integer(c.failedDay,0,s.day)&&['late','abandoned','lost'].includes(c.reason)&&Array.isArray(c.lines)&&c.lines.length>=1&&c.lines.length<=4&&new Set(c.lines.map(l=>l.good)).size===c.lines.length&&c.good===c.lines[0].good&&c.lines.every(l=>goods.some(g=>g.id===l.good)&&integer(l.quantity,1,400)&&integer(l.cargoValue,1,999999999))&&c.lines.reduce((n,l)=>n+l.quantity,0)===c.quantity&&c.lines.reduce((n,l)=>n+l.cargoValue,0)===c.cargoValue&&s.topics.includes('broken-contract:'+c.id),'Invalid client return terms.');for(const key of ['lost','returned'])check(c[key]&&typeof c[key]==='object'&&!Array.isArray(c[key])&&Object.entries(c[key]).every(([g,n])=>c.lines.some(l=>l.good===g&&integer(n,0,l.quantity))),'Invalid client return quantities.');check(c.lossCharge===freightLossValue(c,c.lost),'Invalid client return restitution.');for(const l of c.lines)check([s,...s.fleet].reduce((n,v)=>n+freightManifests(v).filter(f=>f.contractID===c.id&&f.good===l.good).reduce((a,f)=>a+f.units,0),0)===l.quantity-(c.lost[l.good]||0)-(c.returned[l.good]||0),'Incomplete client return custody.');check((counts.get(c.id)||0)>0,'Empty client return must be closed.');}
 check(s.freightContracts===undefined||Array.isArray(s.freightContracts)&&s.freightContracts.length>0&&s.freightContracts.length<=10000&&!!s.contract,'Invalid additional freight jobs.');
 check(new Set(jobs.map(c=>c.id)).size===jobs.length&&jobs.every(c=>!s.completed.includes(c.id)&&!s.topics.includes('broken-contract:'+c.id)),'Invalid active freight IDs.');
 for(const c of jobs){if(c.pricing!==undefined){const p=c.pricing;const common=p&&ships.some(h=>h.id===p.reference)&&p.reward===c.reward&&integer(p.reward,1,999999999)&&finite(p.multiplier,1,2)&&finite(p.risk,0,1)&&['Low','Guarded','High','Severe','Critical'].includes(p.riskLabel)&&['low','guarded','high','severe','critical'].includes(p.riskKey)&&typeof p.blockade==='boolean'&&integer(p.reportDay,0,c.acceptedDay)&&integer(p.reportCount,0,30)&&integer(p.sampleCount,0,30)&&p.reportCount<=p.sampleCount;
 const legacy=p?.version===1&&['base','handling','valueFee','riskPremium','subtotal'].every(k=>integer(p[k],k==='riskPremium'?0:1,999999999))&&p.subtotal===p.base+p.handling+p.valueFee+p.riskPremium&&p.reward===Math.ceil(p.subtotal*p.multiplier);
 const current=p?.version===2&&['sourceCost','destinationValue'].every(k=>integer(p[k],1,999999999))&&['operating','capital','expenses','profitPool','commission','stationProfit'].every(k=>integer(p[k],0,999999999))&&p.expenses===p.operating&&integer(c.expensesAccrued,0,p.expenses)&&p.profitPool===Math.max(0,p.destinationValue-p.sourceCost-p.expenses)&&p.stationProfit===p.profitPool-p.commission&&p.maximumProfitShare===freightRewardRules.maximumProfitShare&&finite(p.share,0,p.maximumProfitShare)&&finite(p.urgency,0,1)&&finite(p.duration,0,1)&&integer(p.products,1,4)&&p.products===freightLines(c).length&&p.handling===(p.products-1)/3&&integer(p.days,0,365249)&&p.duration===Math.min(1,p.days/180)&&p.share===Math.min(p.maximumProfitShare,(freightRewardRules.baseProfitShare+freightRewardRules.riskProfitShare*p.risk+freightRewardRules.urgencyProfitShare*p.urgency+freightRewardRules.durationProfitShare*p.duration+freightRewardRules.handlingProfitShare*p.handling)*p.multiplier)&&p.commission===Math.floor(p.profitPool*p.share/(1+p.share))&&p.commission<=Math.floor(p.stationProfit*p.maximumProfitShare)&&p.reward===p.expenses+p.commission;
 check(common&&(legacy||current),'Invalid signed freight pricing.');}if(c.lines!==undefined)check(c.freightEdition===2&&integer(c.tier,0,3)&&Array.isArray(c.lines)&&c.lines.length>=1&&c.lines.length<=4&&new Set(c.lines.map(l=>l.good)).size===c.lines.length&&c.good===c.lines[0].good&&c.lines.every(l=>goods.some(g=>g.id===l.good)&&integer(l.quantity,1,400)&&integer(l.cargoValue,1,999999999))&&c.lines.reduce((n,l)=>n+l.quantity,0)===c.quantity&&c.lines.reduce((n,l)=>n+l.cargoValue,0)===c.cargoValue,'Invalid mixed freight terms.');const supplied=c.fulfilment==='consignment';check(c.fulfilment===undefined||c.fulfilment===null||supplied,'Invalid freight fulfilment method.');if(supplied)check(ports.has(c.origin)&&c.origin!==c.destination&&integer(c.acceptedDay,0,s.day)&&integer(c.cargoValue,1,999999999)&&integer(c.breachFee,1,999999999),'Invalid client freight terms.');}
 for(const v of [s,...s.fleet]){
  const rows=freightManifests(v);check(v.freightCargo==null||typeof v.freightCargo==='object'&&(!Array.isArray(v.freightCargo)||rows.length>0),'Invalid client freight manifest.');check(new Set(rows.map(f=>f?.contractID+':'+f?.good)).size===rows.length,'Duplicate client manifest.');
  for(const f of rows){const c=byID.get(f?.contractID);check(f&&typeof f==='object'&&!Array.isArray(f)&&c?.fulfilment==='consignment'&&freightLines(c).some(l=>l.good===f.good&&integer(f.units,1,l.quantity)),'Invalid client freight manifest.');}
  for(const id of new Set(rows.map(f=>f.good))){const reserved=freightUnits(v,id),basis=v.cargoBasis?.[id];check(reserved<=(v.cargo[id]||0)&&(!basis||basis.units<=(v.cargo[id]||0)-reserved+1e-7),'Client freight cannot have an owned purchase receipt.');}
 }
 for(const c of jobs)if(c.fulfilment==='consignment'){check(counts.get(c.id)===c.quantity,'The saved client shipment is incomplete.');for(const l of freightLines(c))check([s,...s.fleet].reduce((n,v)=>n+freightManifests(v).filter(f=>f.contractID===c.id&&f.good===l.good).reduce((a,f)=>a+f.units,0),0)===l.quantity,'The saved client product manifest is incomplete.');}
 const f=s.freightStanding;if(f===undefined||f===null)return;
 check(f&&integer(f.failures,1,1000000)&&integer(f.suspendedUntil,0,365249)&&Array.isArray(f.history)&&f.history.length<=50&&f.history.length<=f.failures&&new Set(f.history.map(h=>h.contractID)).size===f.history.length&&f.history.every((h,i,list)=>h&&str(h.contractID,120)&&h.contractID.length>0&&integer(h.day,0,s.day)&&(!i||h.day>=list[i-1].day)&&['late','abandoned','lost','stolen'].includes(h.reason)&&ports.has(h.origin)&&ports.has(h.destination)&&integer(h.charge,1,1999999998)&&integer(h.paid,0,h.charge)&&integer(h.debt,0,h.charge)&&h.paid+h.debt===h.charge&&h.reputation===({late:-6,abandoned:-8,lost:-10,stolen:-12})[h.reason]&&integer(h.suspendedUntil,h.day,365249)&&integer(h.unitsLost,0,400)),'Invalid freight failure history.');
 check(f.history.every(h=>h.reason!=='stolen'||((h.version===2||h.paid===0&&h.debt===h.charge)&&h.unitsLost===0&&h.suspendedUntil===Math.min(365249,h.day+60))),'Invalid cargo theft receipt.');
 check(f.history.every(h=>h.version===undefined||h.version===2&&integer(h.cargoCharge,0,h.charge)&&integer(h.breachFee,1,h.charge)&&h.charge===h.cargoCharge+h.breachFee&&integer(h.returnedUnits,0,400)&&h.returnedUnits+h.unitsLost<=400),'Invalid freight settlement receipt.');
 check(!f.history.length||f.suspendedUntil===f.history.at(-1).suspendedUntil,'Invalid freight suspension.');
}

// Compact charters are gameplay progression, independent of the physical route calculation.
// Permanent regional access becomes a major investment beyond the main belt.
const charters=[
 {id:'home',name:'Earth–Moon licence',ports:['earth','moon'],fee:0,issuers:[],minXP:0,shipTypes:[]},
 {id:'yard',name:'Kepler Shipyard licence',ports:['earth-high'],fee:600,issuers:['earth','moon'],minXP:0,shipTypes:[]},
 {id:'mars',name:'Mars freight licence',ports:['mars'],fee:2500,issuers:['earth','moon','earth-high'],minXP:0,shipTypes:[]},
 {id:'mars-moons',name:'Martian moons licence',ports:['phobos','deimos'],fee:1500,issuers:['mars'],minXP:0,shipTypes:[]},
 {id:'venus',name:'Venus science licence',ports:['venus'],fee:4500,issuers:['earth','earth-high'],minXP:40,shipTypes:[]},
 {id:'mercury',name:'Solar research licence',ports:['mercury'],fee:9000,issuers:['venus','earth-high'],minXP:0,shipTypes:['osprey','gannet','gyrfalcon']},
 {id:'belt',name:'Main-belt licence',ports:['ceres'],fee:14000,issuers:['mars','phobos','deimos'],minXP:40,shipTypes:[]},
 {id:'jupiter',name:'Jovian convoy licence',ports:['jupiter','callisto','ganymede'],fee:48000,issuers:['ceres'],minXP:80,shipTypes:['peregrine','albatross','petrel','gannet','tern','cormorant','pelican','gyrfalcon']},
 {id:'radiation',name:'Jovian research licence',ports:['io','europa'],fee:32000,issuers:['callisto','ganymede'],minXP:120,shipTypes:['osprey','gannet','heron','gyrfalcon']},
 {id:'saturn',name:'Saturn system licence',ports:['saturn','titan','enceladus','rhea','iapetus'],fee:110000,issuers:['ceres','jupiter','callisto','ganymede'],minXP:140,shipTypes:['albatross','petrel','gannet','cormorant','pelican','gyrfalcon']},
 {id:'uranus',name:'Uranus system licence',ports:['uranus','miranda','ariel','titania','oberon'],fee:240000,issuers:['saturn','titan','rhea','iapetus'],minXP:220,shipTypes:['albatross','petrel','pelican','gyrfalcon']},
 {id:'neptune',name:'Neptune expedition licence',ports:['neptune','triton'],fee:480000,issuers:['uranus','titania','oberon'],minXP:320,shipTypes:['albatross','petrel','pelican']}
];
function progression(s){
 const st=s.profile.stats,work=st.deliveries+st.aid+(st.victories||0),hulls=[s,...s.fleet].filter(v=>v.hull>=35);
 return {reputation:st.deliveries*10+st.aid*8+(st.victories||0)*8+Math.max(0,s.visited.length-1)*2,experience:s.profile.xp.navigation,voyages:st.voyages,work,ships:hulls.length,tank:Math.max(0,...hulls.map(v=>effectiveShip(v).tankTonnes))};
}
function establishedAccess(s,id){return id===s.location||s.visited.includes(id)||activeContracts(s).some(c=>c.destination===id)||s.incident?.destination===id||s.fleet.some(v=>v.location===id);}
function hasAccess(s,id){const c=charters.find(c=>c.ports.includes(id));return c.id==='home'||(s.unlocked||[]).includes(id)||establishedAccess(s,id)||(s.licences||[]).some(l=>l.id===c.id);}
function licenceDiscount(s){const p=progression(s);const earned=Math.min(30,Math.min(15,Math.floor(p.reputation/20))+Math.min(10,Math.floor(p.experience/100))+Math.min(5,Math.max(0,p.ships-1)*2));return Math.max(0,earned-Math.ceil(Math.max(0,-reputationData(s.profile).score)/10));}
const classCapabilities={
 swift:['local','express'],kestrel:['local'],osprey:['local','patrol','solar','radiation'],heron:['local','survey','radiation','convoy','outer','deep'],merlin:['local','patrol','intercept'],petrel:['local','convoy','outer','deep','tanker'],peregrine:['local','convoy','industrial'],tern:['local','convoy','cold'],curlew:['local','convoy','outer','passenger'],cormorant:['local','convoy','outer','industrial','recovery'],sanderling:['local','convoy','outer','industrial','mining'],gannet:['local','patrol','solar','radiation','convoy','outer'],rook:['local','convoy','outer','recovery'],ibis:['local','convoy','outer','deep','radiation','medical'],gyrfalcon:['local','patrol','solar','radiation','convoy','outer','deep'],albatross:['local','convoy','outer','deep','cargo'],crane:['local','convoy','outer','deep','industrial','workshop'],nightjar:['local','convoy','outer','deep','solar','radiation','signals'],pelican:['local','convoy','outer','deep','cargo'],condor:['local','convoy','outer','deep','solar','radiation','carrier']};
const charterCapability={mercury:'solar',jupiter:'convoy',radiation:'radiation',saturn:'outer',uranus:'deep',neptune:'deep'};
function capabilityShips(cap){return ships.filter(h=>classCapabilities[h.id]?.includes(cap)).map(h=>h.id);}
function serviceDiscount(s,v=null){const p=stationStanding(s),concession=v&&(s.campaign?.concessions||[]).some(c=>c.port===s.location&&c.stage>=3&&c.expires>=s.day)?.05:0,localKestrel=v?.shipID==='kestrel'&&['earth','moon'].includes(s.location)&&(s.campaign?.localDeliveries?.[s.location]||0)>=3&&p.score>=10?.05:0;return Math.max(-.1,Math.min(.3,p.serviceDiscount+concession+localKestrel));}
function repairQuote(s,v=s){const unit=Math.max(10,Math.ceil(ships.find(h=>h.id===v.shipID).price*.0005)),missing=100-v.hull,discount=1-(1-serviceDiscount(s,v))*(1-captainPerk(s,'repairDiscount'));return {unit,missing,discount,cost:Math.max(0,Math.ceil(missing*unit*(1-discount)-1e-8)),spares:Math.max(1,Math.ceil(ships.find(h=>h.id===v.shipID).dryMass/25))};}
function sparePrice(s){return Math.ceil((Math.ceil((180*(1+Math.min(1,Math.max(0,system(port(s.location).group).au-1)*.025)))/10)*10)*(1-captainPerk(s,'spareDiscount'))-1e-9);}
function provisionsCost(s,days,dest){const discount=captainPerk(s,fleetMembers(s).length>1?'convoyProvisions':'soloProvisions');return Math.ceil((1-discount)*fleetMembers(s).reduce((n,v)=>n+Math.ceil(days*12*(v.hull>=50&&v.shipID==='kestrel'&&port(s.location).group==='earth'&&port(dest).group==='earth'?.9:v.hull>=50&&v.shipID==='albatross'&&days>=60?.85:1)),0)-1e-9);}
function licenceOffer(s,c){
 const remaining=c.ports.filter(id=>!hasAccess(s,id)),discount=licenceDiscount(s),open=remaining.length===0;
 const price=open?0:Math.max(100,Math.ceil(c.fee*remaining.length/c.ports.length*(1-discount/100)*(1-captainPerk(s,'licenceDiscount'))/10)*10);
 const issuedHere=c.issuers.includes(s.location),issuers=c.issuers.map(id=>`${port(id).name} (${port(id).body})`).join(', ');
 const requirements=[];
 if(c.minXP)requirements.push({label:`Navigation experience: ${s.profile.xp.navigation} / ${c.minXP} XP`,met:s.profile.xp.navigation>=c.minXP});
 const certified=charterCapability[c.id]?capabilityShips(charterCapability[c.id]):c.shipTypes;
 if(certified.length){
  const qualified=[s,...s.fleet.filter(v=>v.escort&&v.location===s.location)].some(v=>v.hull>=35&&!v.carrierID&&certified.includes(v.shipID));
  requirements.push({label:`Flagship or assigned local escort: ${charterCapability[c.id]||'reviewed'} certificate (${certified.map(id=>ships.find(v=>v.id===id).name).join(', ')}); at least 35% integrity`,met:qualified});
 }
 const eligible=requirements.every(r=>r.met),canPurchase=!open&&issuedHere&&eligible;
 const blockers=[...(!issuedHere&&!open?[`Apply at ${issuers}.`]:[]),...requirements.filter(r=>!r.met).map(r=>r.label+'.')];
 return {id:c.id,name:c.name,ports:c.ports.map(id=>port(id).body).join(', '),coverage:c.ports,remaining:remaining.map(id=>port(id).body).join(', '),price,basePrice:c.fee,discount,open,issuerIDs:c.issuers,issuers,issuedHere,requirements,eligible,canPurchase,blockingReason:blockers.join(' ')};
}
function licenceOffers(s){return charters.map(c=>licenceOffer(s,c));}
// Player-facing counters reveal only this authority's unpurchased offers.
function localLicenceOffers(s){return licenceOffers(s).filter(o=>o.issuedHere&&!o.open).map(o=>({...o,issuerIDs:[s.location],issuers:`${port(s.location).name} (${port(s.location).body})`}));}
function issuedLicenceHistory(s){return (s.licences||[]).slice().reverse().map(l=>({...l,name:charters.find(c=>c.id===l.id).name}));}
function visibleDestinationAccess(s,id){
 const a=destinationAccess(s,id),offeredHere=localLicenceOffers(s).some(o=>o.id===a.licenceID);
 return a.open||offeredHere?{...a,offeredHere}:{id,open:false,charter:'Regional access required',licenceID:'',price:0,offeredHere:false,reason:'This authority does not offer access to that destination. Discover new licences at port authorities as you travel.'};
}
function destinationAccess(s,id){
 port(id);const c=charters.find(c=>c.ports.includes(id));check(c,'No licence covers this destination.');const offer=licenceOffer(s,c),open=hasAccess(s,id),purchased=(s.licences||[]).some(l=>l.id===c.id);
 return {id,open,charter:c.name,licenceID:c.id,price:open?0:offer.price,reason:c.id==='home'?'Included in your starting licence':purchased?'Permanent licence purchased':(s.unlocked||[]).includes(id)?'Previously earned access retained':establishedAccess(s,id)?'Existing route preserved':`Purchase an access licence. ${offer.canPurchase?'Available at this port authority.':offer.blockingReason}`};
}
// A local system can be opened when at least one of its ports is licensed.
function systemAccess(s,id){
 const sys=system(id),ports=world.ports.filter(p=>p.group===id&&hasAccess(s,p.id));
 return {id:sys.id,open:ports.length>0,destination:ports.find(p=>p.id===id)?.id||ports[0]?.id||null};
}
function accessiblePorts(s){return world.ports.filter(p=>hasAccess(s,p.id)).map(p=>p.id);}
function charterProgress(s){return licenceOffers(s);}
function accessSummary(s){return `${accessiblePorts(s).length} / ${world.ports.length} destinations available · ${licenceDiscount(s)}% career discount on licence fees`;}
// Nearby docks share regional supply networks; local production advantages remain modest.
const dealerCompetition={earth:.88,moon:.65,'earth-high':.78,mars:.72,phobos:.56,deimos:.42,ceres:.74,mercury:.38,venus:.48,jupiter:.65,callisto:.78,ganymede:.70,io:.22,europa:.32,saturn:.66,titan:.76,enceladus:.34,rhea:.55,iapetus:.30,uranus:.47,miranda:.20,ariel:.40,titania:.58,oberon:.25,neptune:.34,triton:.22};
const regionalMarketCache=new Map();
function regionalMarket(pid,id){
 const p=port(pid),key=p.group+':'+id;
 if(!regionalMarketCache.has(key)){
  const neighbors=world.ports.filter(v=>v.group===p.group),g=good(id),producer=neighbors.some(v=>marketEconomy.commodityProfile(v.id,id).role==='export'),factor=g.proxy?(producer?.90+Math.log1p(p.au)*.025:1.04+Math.log1p(p.au)*.055):Math.exp(neighbors.reduce((a,v)=>a+Math.log(v.factors[id]||1),0)/neighbors.length);
  regionalMarketCache.set(key,{factor});
 }
 return regionalMarketCache.get(key);
}
function marketConditions(s,pid=s.location){
 const p=port(pid),phase=Number(hash('dealers:'+pid)%100000n)/100000*2*Math.PI,year=s.day/marketEconomy.cycleDays*2*Math.PI;
 const competition=Math.max(.08,Math.min(.98,dealerCompetition[pid]+.20*Math.sin(year+phase)+.055*Math.sin(2*year+phase*.7)));
 const competitionName=competition>=.72?'Active':competition>=.43?'Mixed':'Limited';
 return {competition,competitionName,summary:competitionName+' dealer activity · daily supply tiers set trading margins',detail:'Nearby ports share regional supply. Procurement-cycle freight contracts and resupply schedules shift daily prices and availability. Each day uses a fixed Limited, Steady or Plentiful spread.'};
}
// Baseline quotes depend only on station, commodity and ship-day. A finite local
// recovery premium after liberation is applied outside the shared baseline cache.
// Keep a bounded, disposable cache; saved voyages never depend on this process-local state.
const dailyQuoteCache=new Map();
const manufacturingCostFloors=Object.freeze(['metals','textiles','filters','magnesium']);
function industrialProcessValue(p,day){return marketEconomy.processValue(p,day,id=>marketState({day},id,p.port));}
function supplyTier(availability){const supply=availability>=1.35?'Plentiful':availability>=1?'Steady':'Limited';return {supply,spread:stockPricing.rules.discreetSpreads[supply]};}
const exchangeRules=stockPricing.rules;
function exchangeQuoteAt(s,id,pid,base,stock,quantity){
 const quote={...base,...stockPricing.quote(base.price,base.spread,stock.curveCenter??stock.baseline,stock.depth,quantity),basePrice:base.price,stock:quantity,depth:stock.depth,baselineStock:stock.curveCenter??stock.baseline};
 return blockadeSaleQuote(s,id,pid,quote);
}
const commercialCurveCache=new Map();
function quoteStock(s,id,pid,flow=null){const key=pid+':'+id,g=good(id);let curve=commercialCurveCache.get(key);if(!curve){const capacity=marketEconomy.storageCapacity(pid,id);curve={baseline:capacity/2,curveCenter:capacity/2,depth:capacity/2};commercialCurveCache.set(key,curve);}const book=marketBook(s),quantity=book?.entries[key]?.quantity??(flow||marketEconomy.supply(pid,id,s.day)).inventory*g.inventoryScale;return {...curve,quantity};}
function exchangeQuote(s,id,pid,base,flow=null){const stock=quoteStock(s,id,pid,flow);return exchangeQuoteAt(s,id,pid,base,stock,stock.quantity);}
function marketState(s,id,pid=s.location){
 if(contrabandGoods.some(g=>g.id===id))return illicitQuote(s,id,pid);
 const key=s.day+':'+pid+':'+id;if(dailyQuoteCache.has(key))return exchangeQuote(s,id,pid,dailyQuoteCache.get(key));
 const p=port(pid),g=good(id),regional=regionalMarket(pid,id);
 const localWeight=.16+.12*Math.min(1,Math.sqrt(p.radius/1000000));
 const localFactor=g.proxy?regional.factor:(p.factors[id]||1),factor=regional.factor**.8*(localFactor/regional.factor)**localWeight;
 const flow=marketEconomy.supply(pid,id,s.day),annual=flow.seasonalPrice;
 // Logistics are a modest overlay; the physical coverage curve carries scarcity.
 const localPrice=1+.018*Math.tanh(Math.log(factor))+.01*Math.tanh(Math.log1p(p.au)/3),availability=flow.availability,conditions=marketConditions(s,pid);
 const {supply}=supplyTier(availability),spread=exchangeRules.spreads[supply];
 const bounded=localPrice<.6?.4+.2*Math.exp((localPrice-.6)/.2):localPrice>2.4?2.4+.6*(1-Math.exp(-(localPrice-2.4)/.6)):localPrice;
 let price=Math.max(5,Math.round(g.base*bounded));
 // Targeted acyclic manufacturing floors use public dated ingredient asks.
 // Utility conversion/recovery has explicit station funding instead; reversible
 // chemistry cannot make both directions profitable by raising every output.
 if(manufacturingCostFloors.includes(id)){
  const ingredients=marketEconomy.factoryRecipes[id],material=Object.entries(ingredients).reduce((n,[input,units])=>n+marketState({day:s.day},input,pid).buy*units,0),meter=marketEconomy.processServiceCost({id:'quote:'+id,outputs:{[id]:1}}),services=meter.energy+meter.maintenance;
  price=Math.max(price,Math.ceil((material+services+1)/(1-spread)*Math.exp(exchangeRules.impact*.5/exchangeRules.minimumDepth)));
 }
 const season=annual<-.025?'Resupply season':annual>.025?'Demand season':'Between supply cycles';
 const quote={price,buy:Math.ceil(price*(1+spread)),sell:Math.max(1,Math.floor(price*(1-spread))),availability,spread,supply,day:s.day,season,competition:conditions.competitionName};
 if(dailyQuoteCache.size>=512)dailyQuoteCache.clear();dailyQuoteCache.set(key,quote);return exchangeQuote(s,id,pid,quote,flow);
}
function market(s,id,pid=s.location){return marketState(s,id,pid).price;}
// Every lot clears at its marginal half-lot reserve. Splitting orders cannot
// bypass price impact, and reversing a trade crosses the same curve plus spread.
const exchangeOrderCache=new Map();
function tradeTotal(s,id,n,buying){
 if(!integer(n,1,MAX_FLEET*MAX_CARGO_LOTS))return 0;
 if(contrabandGoods.some(g=>g.id===id)){const q=marketState(s,id);return n*(buying?q.buy:q.sell);}
 const q=marketState(s,id),stock=marketStock(s,id,s.location,false),side=buying?'buy':'sell',key=[s.day,s.location,id,stock.quantity,q.basePrice,q.spread,q.recoveryPremium||0,q.recoveryDays||0,q.sell,q.buy,side].join(':');
 let row=exchangeOrderCache.get(key);if(!row){if(exchangeOrderCache.size>=64)exchangeOrderCache.clear();row=[0];exchangeOrderCache.set(key,row);}
 const base={...q,price:q.basePrice};for(let i=row.length-1;i<n;i++){const quantity=Math.max(0,Math.min(MAX_EXCHANGE_STOCK,stock.quantity+(buying?-i:i))),v=exchangeQuoteAt(s,id,s.location,base,stock,quantity);row.push(row.at(-1)+v[side]);}
 return row[n];
}
// Qualification is earned experience; relics and browsing never unlock a purchase or alter a quote.
function marketDestination(s,id,target={kind:'fleet'},withRoom=true){
 check(target&&typeof target==='object'&&!Array.isArray(target)&&['fleet','ship','warehouse'].includes(target.kind),'Choose a valid purchase destination.');
 const legal=goods.some(g=>g.id===id),wrongPort=target.port!==undefined&&target.port!==s.location;
 if(wrongPort)return {kind:target.kind,room:0,qualified:false,reason:'The purchase destination is at a different station.'};
 if(target.kind==='warehouse'){
  const w=s.warehouses?.[s.location],facility=warehouseFacility(s.location),reason=!legal?'Restricted cargo cannot be sent to a public warehouse.':target.port!==s.location?'Select this station’s warehouse.':!facility?'This station has no warehouse.':!w?'Purchase local warehouse space first.':'';
  return {kind:'warehouse',room:reason||!withRoom?0:warehouseCargoRoom(w,id),qualified:!reason,reason};
 }
 if(target.kind==='ship'){
  const v=fleetMembers(s).find(v=>actorID(s,v)===target.ship),reason=!v?'Choose a ship in the local travelling fleet.':!cargoCompatible(v,id)?'This ship cannot handle that cargo.':'';
  return {kind:'ship',room:reason||!withRoom?0:shipCargoRoom(v,id),qualified:!reason,reason,vessel:v};
 }
 const qualified=fleetMembers(s).some(v=>cargoCompatible(v,id));return {kind:'fleet',room:withRoom?cargoRoom(s,id):0,qualified,reason:qualified?'':'Bring a ship equipped to handle this cargo.'};
}
function marketDestinations(s){
 const members=fleetMembers(s),facility=warehouseFacility(s.location),w=s.warehouses?.[s.location],options=[{value:'fleet',label:members.length===1?actorName(s,members[0]):'Travelling fleet',delivery:{kind:'fleet',port:s.location}}];
 if(members.length>1)for(const v of members)options.push({value:'ship:'+actorID(s,v),label:actorName(s,v),delivery:{kind:'ship',port:s.location,ship:actorID(s,v)}});
 if(facility)options.push({value:'warehouse',label:w?'Local warehouse':'Warehouse · storage needed',disabled:!w,delivery:{kind:'warehouse',port:s.location}});
 return {options,warehouse:!!facility,owned:!!w,capacityKg:w?w.blocks*10000:0,usedKg:w?warehouseMass(w):0,freeKg:w?Math.max(0,w.blocks*10000-warehouseMass(w)):0};
}
// Discovery receipts are written with the action that earns access, never while browsing/loading.
const commodityMilestones=Object.freeze([
 Object.freeze({stage:0,name:'General cargo',xp:0,visited:1,accessible:2}),
 Object.freeze({stage:1,name:'Materials account',xp:1200,visited:2,accessible:2}),
 Object.freeze({stage:2,name:'Industrial account',xp:3000,visited:4,accessible:4}),
 Object.freeze({stage:3,name:'Specialist account',xp:7000,visited:6,accessible:6}),
 Object.freeze({stage:4,name:'Advanced account',xp:14000,visited:8,accessible:8})
]);
function commodityProgress(s){
 const xp=s.profile.xp.commerce,visited=new Set(s.visited).size,accessible=accessiblePorts(s).length;
 const stage=commodityMilestones.reduce((n,m)=>xp>=m.xp&&visited>=m.visited&&accessible>=m.accessible?m.stage:n,0),next=commodityMilestones[stage+1];
 return {stage,xp,visited,accessible,account:commodityMilestones[stage].name,next:next?{...next,xpNeeded:Math.max(0,next.xp-xp),visitsNeeded:Math.max(0,next.visited-visited)}:null};
}
// Wholesale accounts grant eligibility, not an entire catalogue at once.
const commodityDiscoveryRules=Object.freeze({version:3,maxPerRelease:2,commerceBetweenReleases:120});
const commodityUnlockSchedule=Object.freeze([
 ['iron-ore','iron'],['silicate-ore','silicon'],['aluminum-ore','aluminum'],['copper-ore','copper'],['magnesium-ore','magnesium'],['textiles','seals'],['filters','fertilizer'],['metals','ceramics'],['nickel-ore','cobalt-ore'],['titanium-ore','sulfur'],['carbon-dioxide','ammonia'],['brines','sodium-salts'],['carbonates','argon'],['methane','ethane'],['helium'],
 ['machinery','lubricants'],['coolants','hydrogen'],['produce','batteries'],['nickel','cobalt'],['titanium','uranium-ore'],
 ['tools','shielding'],['electronics','solar-cells'],['optics','pharmaceuticals'],['silver','gold'],['platinum','catalysts'],
 ['cultures','bioreactors'],['reactor-parts','superconductors'],['isotopes']
].flatMap((ids,index)=>{const stage=index<15?1:index<20?2:index<25?3:4,offset=index-({1:0,2:15,3:20,4:25})[stage],xp=commodityMilestones[stage].xp+offset*({1:120,2:600,3:1200,4:2000})[stage];return ids.map(id=>Object.freeze({id,stage,xp}));}));
function legacyCommodityKnowledge(s){
 if(s.commodityDiscovery?.version===3||!s.profile.created)return [];
 const rank=s.commodityDiscovery?.version===2?commodityProgress(s).stage:Math.max(skillProgressForXP(s.profile.xp.commerce).level,skillProgressForXP(s.profile.xp.navigation).level);
 return goods.filter(g=>(g.discoveryLevel||0)<=rank).map(g=>g.id);
}
function qualifiedCommodities(s){const known=new Set([...(s.commodityDiscovery?.known||[]),...legacyCommodityKnowledge(s)]);return goods.filter(g=>!g.discoveryLevel||known.has(g.id));}
function commodityUnlocks(before,next){const known=new Set([...(before.commodityDiscovery?.known||[]),...(before.profile.created?qualifiedCommodities(before):goods.filter(g=>!g.discoveryLevel)).map(g=>g.id)]);return (next.commodityDiscovery?.entries||[]).filter(r=>!known.has(r.good)).map(r=>({...r,name:good(r.good).name}));}
function recordCommodityDiscoveries(before,s){
 const baseline=before.profile.created?qualifiedCommodities(before):goods.filter(g=>!g.discoveryLevel),known=new Set([...(before.commodityDiscovery?.known||[]),...baseline.map(g=>g.id)]),entries=(before.commodityDiscovery?.entries||[]).map(r=>({...r}));
 s.commodityDiscovery={version:3,known:[...known],entries};
 const progress=commodityProgress(s),previous=[...entries].reverse().find(r=>r.rule===3),arrived=new Set(s.visited).size>new Set(before.visited).size,earned=s.profile.xp.commerce>before.profile.xp.commerce;
 // No unlocks from browsing, waiting, loading, buying XP boosts, or repeating
 // zero-XP actions. A newly visited station can release the next eligible pair.
 const spaced=!previous||s.profile.xp.commerce>=previous.xp+commodityDiscoveryRules.commerceBetweenReleases;
 const fresh=(arrived||earned&&spaced)?commodityUnlockSchedule.filter(r=>!known.has(r.id)&&r.stage<=progress.stage&&r.xp<=progress.xp).slice(0,commodityDiscoveryRules.maxPerRelease):[];
 for(const rule of fresh){const g=good(rule.id),xp=s.profile.xp.commerce;entries.push({good:g.id,day:s.day,port:s.location,skill:'commerce',xp,level:skillProgressForXP(xp).level,stage:g.discoveryLevel,visited:progress.visited,accessible:progress.accessible,rule:3,unlockXP:rule.xp});known.add(g.id);}
 s.commodityDiscovery.known=[...known];
 if(fresh.length)record(s,'Commodities unlocked: '+fresh.map(r=>good(r.id).name).join(', ')+'. Your discoveries are recorded in the Journal.');
}
function commodityJournal(s){const visited=new Set(s.visited),stations=world.ports.filter(p=>visited.has(p.id)),known=qualifiedCommodities(s).map(g=>({id:g.id,name:g.name,level:g.discoveryLevel||0,specialist:!!g.handling?.length,stations:stations.map(p=>{const trade=marketEconomy.commodityProfile(p.id,g.id);return {id:p.id,name:p.name,body:p.body,buy:trade.stationSells,sell:trade.stationBuys,stationBuys:trade.stationBuys,stationSells:trade.stationSells};})}));return {known,history:(s.commodityDiscovery?.entries||[]).slice().reverse().map(r=>({...r,name:good(r.good).name,station:port(r.port).name,skillName:skillNames[r.skill]}))};}
function validateCommodityDiscoveries(s){
 const d=s.commodityDiscovery;if(d===undefined)return;
 const legal=id=>goods.find(g=>g.id===id);
 check(d&&[1,2,3].includes(d.version)&&Array.isArray(d.known)&&d.known.length<=goods.length&&new Set(d.known).size===d.known.length&&d.known.every(legal),'Invalid commodity discoveries.');
 check(Array.isArray(d.entries)&&d.entries.length<=goods.length&&new Set(d.entries.map(r=>r?.good)).size===d.entries.length&&d.entries.every(r=>{
  const g=r&&legal(r.good);if(!g||!(g.discoveryLevel>0)||!d.known.includes(r.good)||!integer(r.day,0,s.day)||!world.ports.some(p=>p.id===r.port)||!['commerce','navigation'].includes(r.skill)||!integer(r.xp,0,1000000)||r.level!==skillProgressForXP(r.xp).level)return false;
  if(r.stage===undefined)return r.xp>=xpThreshold(g.discoveryLevel);
  const m=commodityMilestones[g.discoveryLevel],rule=commodityUnlockSchedule.find(v=>v.id===g.id);return [2,3].includes(d.version)&&r.stage===g.discoveryLevel&&r.xp>=m.xp&&integer(r.visited,m.visited,s.visited.length)&&integer(r.accessible,m.accessible,world.ports.length)&&(r.rule===undefined||d.version===3&&r.rule===3&&r.skill==='commerce'&&r.unlockXP===rule?.xp&&r.xp>=rule.xp);
 }),'Invalid commodity discovery receipts.');
}
function marketAccess(s,id,delivery={kind:'fleet'},resolved=null){
 const g=good(id),legal=goods.some(v=>v.id===id),listed=!legal||marketEconomy.listed(s.location,id),discoveryLevel=g.discoveryLevel||0,experience=!legal||qualifiedCommodities(s).some(v=>v.id===id),destination=resolved||marketDestination(s,id,delivery,false);
 const reason=!listed?'This exchange does not offer that product.':!experience?'Build Commerce experience and explore new exchanges to discover this good.':!destination.qualified?destination.reason:'';
 return {listed,stationSells:listed,stationBuys:legal?marketEconomy.commodityProfile(s.location,id).stationBuys:true,discovered:experience,discoveryLevel,qualified:experience&&destination.qualified,canBuy:!reason,reason};
}
function receiveMarketPurchase(s,id,n,receipt,delivery={kind:'fleet'}){
 const destination=marketDestination(s,id,delivery);check(destination.qualified,destination.reason);check(n<=destination.room,'The purchase will not fit at the selected destination.');
 if(destination.kind==='warehouse')addCargo(s.warehouses[s.location],id,n,receipt);
 else if(destination.kind==='ship')addCargo(destination.vessel,id,n,receipt);
 else addFleetCargo(s,id,n,receipt);
}
// Bounded physical market ledger: production, use and sourced delayed freight.
const MAX_EXCHANGE_STOCK=1e9,marketProjectionCache=new WeakMap(),marketNextCache=new WeakMap();
function marketBlockades(s,day=s.day){return new Set(world.ports.filter(p=>blockadeStation(s,p.id,day)?.status==='blockaded').map(p=>p.id));}
function marketBlockadeCalendar(s){return day=>marketBlockades(s,day);}
function marketBook(s){
 const old=s.exchangeStock;if(!old)return null;
 // A resolved current-day register already contains the day's blockade effects.
 // Avoid rebuilding the world calendar for every item in the same market view.
 if(old.version===2&&old.plan===51&&old.day===s.day)return old;
 const blocked=marketBlockades(s),signature=[s.day,s.castSeed||'legacy',s.blockadeWorld?.startDay??0,...(s.blockadeWorld?.stations||[]).map(w=>[w.port,w.firstDay,w.clearedDay,w.reliefDay].join('/')),...(s.blockades?.jobs||[]).map(j=>[j.destination,j.clearedDay].join('/')),...blocked].join(':');
 let dates=marketProjectionCache.get(old);if(!dates){dates=new Map();marketProjectionCache.set(old,dates);}if(dates.has(signature))return dates.get(signature);
 const prior=[...dates.values()].filter(b=>b.day<=s.day).sort((a,b)=>b.day-a.day)[0];
 let book;
 if(old.version===2){book=marketEconomy.upgradeNetwork(clone(prior||old));}
 else {
  // Legacy market receipts remain exact at migration; player cargo, money and
  // purchase basis are untouched. No new factory stock is credited to a captain.
  book=marketEconomy.createNetwork(s.day);
  for(const [key,v] of Object.entries(old.entries)){const [pid,id]=key.split(':');book.entries[key]={day:s.day,quantity:marketEconomy.legacyQuantity(pid,id,v,s.day)};}
 }
 if(book.day<s.day)marketEconomy.advanceNetwork(book,s.day,marketBlockadeCalendar(s),industrialProcessValue);if(dates.size>=32)dates.delete(dates.keys().next().value);dates.set(signature,book);return book;
}
function marketStock(s,id,pid=s.location,forecast=true){
 const g=goods.find(g=>g.id===id);check(g,'Choose a legal exchange product.');port(pid);
 const flow=marketEconomy.supply(pid,id,s.day),opening=flow.inventory*g.inventoryScale,baseline=commercialReserve(flow,g),book=marketBook(s),quantity=book?.entries[pid+':'+id]?.quantity??opening;
 let production=flow.dailyProduction*g.inventoryScale,consumption=flow.dailyConsumption*g.inventoryScale,networkFlow=flow.networkFlow*g.inventoryScale;
 if(forecast&&book&&s.day<365249){let next=marketNextCache.get(book);if(!next){next=marketEconomy.advanceNetwork(clone(book),s.day+1,marketBlockadeCalendar(s),industrialProcessValue);marketNextCache.set(book,next);}const i=Object.keys(marketEconomy.stationProfiles).indexOf(pid)*goods.length+marketEconomy.productIDs.indexOf(id);production=next.lastFlows.production[i];consumption=next.lastFlows.consumption[i];const q=next.entries[pid+':'+id]?.quantity??flow.nextInventory*g.inventoryScale;networkFlow=q-quantity-production+consumption;}
 const capacity=marketEconomy.storageCapacity(pid,id),receivingRoom=Math.max(0,Math.floor(capacity-quantity+1e-8));
 const profile=marketEconomy.commodityProfile(pid,id),protectedStock=Math.min(quantity,Math.max(0,profile.inputUse*3+profile.use*2)*g.inventoryScale),offered=Math.max(0,quantity-protectedStock),buyer=buyerAllocation(s,id,pid,flow,quantity,capacity);
 // Daily liquidity limits apply to net stock withdrawals; returned cargo can trade again.
 const wholesaleAllocation=Math.max(8,Math.floor((Math.max(0,flow.dailyProduction)+Math.max(0,flow.consumptionBase-flow.productionBase))*g.inventoryScale*2)),allocation=id==='medicine'&&s.profile?.created&&commodityProgress(s).stage<2?Math.min(commercialRules.medicalRetailLots,wholesaleAllocation):wholesaleAllocation,receipt=s.merchantBusiness?.purchases?.[pid+':'+id],bought=receipt?.day===s.day?(receipt.bought||0)-(receipt.units||0):0;
 return {available:Math.max(0,Math.min(Math.floor(offered+1e-8),allocation-bought)),saleAllocation:allocation,wholesaleAvailable:Math.max(0,Math.min(Math.floor(offered+1e-8),wholesaleAllocation-bought)),quantity,protectedStock,commercialStock:offered,capacity,receivingRoom,buyerAllowance:buyer.remaining,buyerBudget:buyer.total,coverageDays:flow.consumptionBase>0?quantity/(flow.consumptionBase*g.inventoryScale):null,baseline,curveCenter:capacity/2,depth:capacity/2,production,consumption,networkFlow,replenishmentDays:flow.replenishmentDays};
}
function settleExchangeStock(s,id,n,buy,client=false){
 if(!goods.some(g=>g.id===id))return;
 const stock=marketStock(s,id,s.location,false);check(!buy||n<=(client?stock.wholesaleAvailable:stock.available),'This exchange does not have that much stock.');check(buy||n<=stock.buyerAllowance,'This buyer has no remaining funded allowance today.');
 const projected=marketBook(s);s.exchangeStock=projected?clone(projected):marketEconomy.createNetwork(s.day);
 s.exchangeStock.entries[s.location+':'+id]={day:s.day,quantity:stock.quantity+(buy?-n:n)};
 {const r=merchantState(s),key=s.location+':'+id;pruneBuyerReceipts(s,r);const old=r.purchases[key];r.purchases[key]={day:s.day,units:(old?.day===s.day?old.units:0)+(buy?0:n),bought:(old?.day===s.day?(old.bought||0):0)+(buy?n:0)};}
}
function consumeClientFreight(s,c){
 const book=marketBook(s);s.exchangeStock=book?clone(book):marketEconomy.createNetwork(s.day);
 for(const line of freightLines(c)){const key=s.location+':'+line.good;if(marketEconomy.commodityProfile(s.location,line.good).use>0)s.exchangeStock.demandCredits[key]=(s.exchangeStock.demandCredits[key]||0)+line.quantity;s.exchangeStock.accounting.clientConsumed+=line.quantity;}
}
function advanceExchangeCalendar(s,end){if(s.exchangeStock){s.exchangeStock=clone(marketBook(s));marketEconomy.advanceNetwork(s.exchangeStock,end,marketBlockadeCalendar(s),industrialProcessValue);}}
function validateExchangeStock(s){
 const stock=s.exchangeStock;if(stock===undefined||stock===null)return;
 check(stock.plan===undefined||[44,45,47,48,50,51].includes(stock.plan),'Unknown exchange production plan.');
 const validKey=key=>{const parts=key.split(':');return parts.length===2&&world.ports.some(p=>p.id===parts[0])&&goods.some(g=>g.id===parts[1])&&(stock.version!==1||marketEconomy.legacyProductIDs.includes(parts[1]));};
 check(stock&&typeof stock==='object'&&!Array.isArray(stock)&&[1,2].includes(stock.version)&&stock.entries&&typeof stock.entries==='object'&&!Array.isArray(stock.entries),'Invalid exchange stock register.');
 check(Object.keys(stock.entries).length<=world.ports.length*goods.length&&Object.entries(stock.entries).every(([key,v])=>validKey(key)&&v&&typeof v==='object'&&!Array.isArray(v)&&integer(v.day,0,s.day)&&finite(v.quantity,0,stock.version===1?33000:MAX_EXCHANGE_STOCK)),'Invalid exchange stock entry.');
 if(stock.version===2){
  check(integer(stock.day,0,s.day)&&Object.values(stock.entries).every(v=>v.day===stock.day),'Invalid exchange calendar.');
  check(Array.isArray(stock.transit)&&stock.transit.length<=marketEconomy.routes.length*112&&new Set(stock.transit.map(v=>v.route+':'+v.due)).size===stock.transit.length&&stock.transit.every(v=>v&&integer(v.route,0,marketEconomy.routes.length-1)&&integer(v.due,stock.day,365360)&&finite(v.units,-MAX_EXCHANGE_STOCK,MAX_EXCHANGE_STOCK)&&(v.until===undefined||integer(v.until,v.due,stock.day+110))),'Invalid freight pipeline.');
  if(stock.pipeline!==undefined)marketEconomy.validateNetworkPipeline(stock);
  else {const occupied=new Set();for(const packet of stock.transit)for(let due=packet.due;due<=(packet.until??packet.due);due++){const key=packet.route+':'+due;check(!occupied.has(key),'Overlapping freight pipeline.');occupied.add(key);}}
  check(stock.demandCredits&&Object.keys(stock.demandCredits).length<=world.ports.length*goods.length&&Object.entries(stock.demandCredits).every(([key,n])=>validKey(key)&&finite(n,0,MAX_EXCHANGE_STOCK)),'Invalid client demand register.');
  for(const k of ['waste','primaryMaterial','processingEnergy','processingMaintenance','overtime'])check(stock.accounting?.[k]===undefined||finite(stock.accounting[k],0,1e15),'Invalid material accounting.');
  check(stock.accounting?.introducedStock===undefined||finite(stock.accounting.introducedStock,0,1e15),'Invalid resource opening inventory.');
  check(stock.accounting&&['produced','consumed','dispatched','arrived','clientConsumed','unmet','byproductOxygen'].every(k=>finite(stock.accounting[k],0,1e15)),'Invalid market flow totals.');
 }
}
// Sales have an independent source; stored goods never pass through a ship's hold.
function marketSaleSource(s,id,source={kind:'fleet'}){
 check(source&&typeof source==='object'&&!Array.isArray(source)&&['fleet','warehouse'].includes(source.kind),'Choose a valid sale source.');
 const local=source.port===undefined||source.port===s.location;
 if(source.kind==='fleet')return {kind:'fleet',owned:local?tradableQuantity(s,id):0,qualified:local,reason:local?'':'The sale source is at a different station.'};
 const w=s.warehouses?.[s.location],reason=source.port!==s.location?'Select this station’s warehouse.':!goods.some(g=>g.id===id)?'Restricted cargo cannot be sold from a public warehouse.':!warehouseFacility(s.location)||!w?'Purchase local warehouse space first.':'';
 return {kind:'warehouse',owned:reason?0:w.cargo[id]||0,qualified:!reason,reason,vessel:reason?null:w};
}
function marketOrderLimits(s,id,quote=marketState(s,id),delivery={kind:'fleet'},source={kind:'fleet'}){
 const destination=marketDestination(s,id,delivery),access=marketAccess(s,id,delivery,destination),restricted=contrabandGoods.some(g=>g.id===id),stock=restricted?(quote.open?Math.max(0,quote.stock):0):marketStock(s,id,s.location,false).available,demand=restricted?(quote.open?Math.max(0,quote.demand):0):access.stationBuys?marketStock(s,id,s.location,false).buyerAllowance:0,origin=marketSaleSource(s,id,source),owned=origin.owned,room=destination.room;
 const maximum=(limit,budget,buy)=>{let lo=0,hi=Math.max(0,Math.floor(limit));while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(tradeTotal(s,id,mid,buy)<=budget)lo=mid;else hi=mid-1;}return lo;};
 return {stock,storageCapacity:restricted?null:marketEconomy.storageCapacity(s.location,id),receivingRoom:restricted?demand:marketStock(s,id,s.location,false).receivingRoom,buyMax:access.canBuy?maximum(Math.min(MAX_FLEET*MAX_CARGO_LOTS,room,stock),s.credits,true):0,sellAll:maximum(Math.min(MAX_FLEET*MAX_CARGO_LOTS,owned,demand),999999999-s.credits,false),owned,room,stationBuys:restricted?!!quote.open&&demand>0:access.stationBuys,stationSells:restricted?!!quote.open:access.stationSells,canSell:origin.qualified&&demand>0,canBuy:access.canBuy};
}
function marketSnapshot(s,units=1,delivery={kind:'fleet'},source={kind:'fleet'}){
 check(integer(units,1,MAX_FLEET*MAX_CARGO_LOTS),'Choose a positive cargo quantity.');const pool=fleetOverview(s);
 const rows=goods.filter(g=>marketAccess(s,g.id,delivery).canBuy||fleetQuantity(s,g.id)>0||(s.warehouses?.[s.location]?.cargo[g.id]||0)>0).map(g=>{const quote=marketState(s,g.id),limits=marketOrderLimits(s,g.id,quote,delivery,source);return {id:g.id,quote,delivery,source,fleetOwned:tradableQuantity(s,g.id),stored:s.warehouses?.[s.location]?.cargo[g.id]||0,held:pool.cargo[g.id]||0,owned:limits.owned,buyTotal:tradeTotal(s,g.id,units,true),sellTotal:tradeTotal(s,g.id,units,false),margin:saleAssessment(s,g.id,units,s.location,source),...limits};}).sort((a,b)=>a.quote.sell-b.quote.sell||a.id.localeCompare(b.id));
 return {freeUnits:pool.freeUnits,rows};
}
// Weighted-average acquisition cost stays with the cargo, independently of market value.
// Older cargo with no receipt remains unknown; it must never display an invented profit.
function validateCargoBasis(v){
 const b=v.cargoBasis;if(b===undefined||b===null)return;
 check(b&&typeof b==='object'&&!Array.isArray(b)&&Object.entries(b).every(([id,r])=>allGoods.some(g=>g.id===id)&&r&&typeof r==='object'&&!Array.isArray(r)&&finite(r.units,0,(v.cargo[id]||0)+1e-7)&&finite(r.cost,0,1e12)&&(r.units>1e-8||r.cost<1e-7)),'Invalid cargo purchase costs.');
}
function addCargo(v,id,n,receipt={units:0,cost:0}){
 check(integer(n,0,MAX_FLEET*MAX_CARGO_LOTS),'Choose a valid cargo quantity.');if(v.shipID)check(n<=shipCargoRoom(v,id),'This shipment exceeds the receiving ship’s weight, volume or handling limits.');else if(v.blocks)check(n<=warehouseCargoRoom(v,id),'This shipment exceeds the warehouse weight or volume limit.');
 const prior=v.cargoBasis?.[id]||{units:0,cost:0};
 if(!v.cargoBasis)v.cargoBasis={};
 if(prior.units+receipt.units>1e-8)v.cargoBasis[id]={units:prior.units+receipt.units,cost:prior.cost+receipt.cost};
 v.cargo[id]=(v.cargo[id]||0)+n;
}
function removeCargo(v,id,n){
 const held=v.cargo[id]||0,reserved=freightUnits(v,id),owned=held-reserved,ownedRemoved=Math.min(n,owned),r=v.cargoBasis?.[id],fraction=owned>0?ownedRemoved/owned:0;
 const removed={units:(r?.units||0)*fraction,cost:(r?.cost||0)*fraction};
 if(r){if(ownedRemoved>=owned)delete v.cargoBasis[id];else v.cargoBasis[id]={units:r.units-removed.units,cost:r.cost-removed.cost};}
 if(reserved&&n>owned){let loss=n-owned;const rows=freightManifests(v);for(const f of rows)if(f.good===id&&loss>0){const part=Math.min(loss,f.units);f.units-=part;loss-=part;}setFreightManifests(v,rows.filter(f=>f.units>0));}v.cargo[id]=held-n;return removed;
}
// Read acquisition receipts directly: no cloning of the whole voyage on every market card.
function fleetCargoReceipt(s,id,n){let receipt={units:0,cost:0};for(const v of fleetMembers(s)){const owned=(v.cargo[id]||0)-freightUnits(v,id),part=Math.min(n,owned),r=v.cargoBasis?.[id];if(part>0&&r){receipt.units+=r.units*part/owned;receipt.cost+=r.cost*part/owned;}n-=part;if(!n)break;}return receipt;}
function saleAssessment(s,id,requested=1,pid=s.location,source={kind:'fleet'}){
 good(id);port(pid);const origin=marketSaleSource(s,id,source),held=origin.owned,units=Math.min(held,integer(requested,1,MAX_FLEET*MAX_CARGO_LOTS)?requested:1),r=held?(origin.kind==='warehouse'?{units:(origin.vessel.cargoBasis?.[id]?.units||0)*units/held,cost:(origin.vessel.cargoBasis?.[id]?.cost||0)*units/held}:fleetCargoReceipt(s,id,units)):null;
 const local={...s,location:pid},revenue=tradeTotal(local,id,units,false);
 if(!held&&origin.kind==='warehouse')return {status:'empty',units:0,revenue:0,label:'No cargo stored',detail:'No owned units of this product are stored at this station.'};
 if(!held)return {status:'empty',units:0,revenue:0,label:fleetQuantity(s,id)?'Client freight · reserved':'No cargo aboard',detail:fleetQuantity(s,id)?'This shipment belongs to the freight client and cannot be sold or donated.':'Purchase cargo to track its trading margin.'};
 if(!r||Math.abs(r.units-units)>1e-7)return {status:'unknown',units,revenue,label:'Purchase cost unavailable',detail:'Some cargo has no recorded purchase cost. Its profit or loss cannot be calculated.'};
 const averageCost=r.cost/units,cost=r.cost,profit=revenue-cost,status=profit>=.005?'profit':profit<=-.005?'loss':'even';
 const amount=Math.abs(profit).toLocaleString('en-US',{maximumFractionDigits:2}),average=averageCost.toLocaleString('en-US',{maximumFractionDigits:2});
 return {status,units,revenue,averageCost,cost,profit,label:status==='even'?`Break even · ${units} ${units===1?'unit':'units'}`:`${status==='profit'?'Profit +':'Loss −'}${amount} cr · ${units} ${units===1?'unit':'units'}`,detail:`Average paid ${average} cr / unit. Cargo margin excludes fuel, berth fees and repairs.`};
}
function orbitPeriod(p){return 2*Math.PI*Math.sqrt(p.radius**3/system(p.group).mu)/86400;}
function plane(p){if(p.id==='triton')return 157; if(p.id==='iapetus')return 15.5;return 0;}
function waitFor(a,b,time,day,local){
 const n1=(local&&plane(a)>90?-1:1)*2*Math.PI/(local?orbitPeriod(a):a.period),n2=(local&&plane(b)>90?-1:1)*2*Math.PI/(local?orbitPeriod(b):b.period),rate=n2-n1;
 if(Math.abs(rate)<1e-12)return 0;
 const pa=local?Number(hash(a.id)%6283n)/1000:a.phase,pb=local?Number(hash(b.id)%6283n)/1000:b.phase;
 const phase=mod(pb+n2*day-pa-n1*day),needed=mod(Math.PI-n2*time);
 if(Math.min(mod(phase-needed),mod(needed-phase))<Math.PI/180)return 0;
 return rate>0?mod(needed-phase)/rate:mod(phase-needed)/-rate;
}
function legacyTransfer(a,b,day){
 if(typeof a==='string')a=port(a);if(typeof b==='string')b=port(b);
 if(a.id===b.id)return {coastDays:0,waitDays:0,deltaV:0,description:'Already docked here'};
 const local=a.group===b.group,mu=local?system(a.group).mu:132712440018,r1=local?a.radius:a.au*149597870.7,r2=local?b.radius:b.au*149597870.7,axis=(r1+r2)/2;
 const time=Math.PI*Math.sqrt(axis**3/mu)/86400,v1=Math.sqrt(mu/r1),v2=Math.sqrt(mu/r2);
 const inf1=Math.abs(v1*(Math.sqrt(2*r2/(r1+r2))-1)),inf2=Math.abs(v2*(1-Math.sqrt(2*r1/(r1+r2))));
 const capture=(p,v)=>Math.sqrt(v*v+2*system(p.group).mu/p.radius)-Math.sqrt(system(p.group).mu/p.radius)+p.capture;
 // A separate plane-change allowance prevents retrograde/tilted moons becoming cheap coplanar stops.
 const planeCost=local?2*Math.min(v1,v2)*Math.sin(Math.abs(plane(a)-plane(b))*Math.PI/360):[a,b].reduce((t,p)=>t+(p.group==='uranus'?2*Math.sqrt(system(p.group).mu/p.radius)*Math.sin(97.8*Math.PI/360):0)+(p.id==='triton'?2*Math.sqrt(system(p.group).mu/p.radius)*Math.sin(157*Math.PI/360):0),0);
 return {coastDays:Math.max(1,Math.ceil(time)),waitDays:Math.ceil(waitFor(a,b,time,day,local)),deltaV:(local?inf1+inf2+a.capture+b.capture:capture(a,inf1)+capture(b,inf2))+planeCost,description:local?'Parent-centered transfer estimate':'Sun-centered Hohmann estimate'};
}
// Fictional continuous-thrust drive. Geometry is circular and schematic, not a solved trajectory.
function safeSolarDistance(r1,r2,angle){
 const theta=Math.min(mod(angle),mod(-angle)),exclusion=.25*149597870.7;
 const tangent1=Math.acos(Math.min(1,exclusion/r1)),tangent2=Math.acos(Math.min(1,exclusion/r2));
 if(theta<=tangent1+tangent2)return Math.sqrt(Math.max(0,r1*r1+r2*r2-2*r1*r2*Math.cos(theta)));
 return Math.sqrt(r1*r1-exclusion*exclusion)+Math.sqrt(r2*r2-exclusion*exclusion)+exclusion*(theta-tangent1-tangent2);
}
function transfer(a,b,day,acceleration=DRIVE.acceleration){
 if(typeof a==='string')a=port(a);if(typeof b==='string')b=port(b);
 check(finite(acceleration,.001,.1),'Invalid drive acceleration.');
 const legacy=legacyTransfer(a,b,day),local=a.group===b.group,waitDays=a.id===b.id?0:local?0:1;
 if(a.id===b.id)return {...legacy,acceleration,distanceKM:0,peakSpeed:0,legacyDays:0};
 let distanceKM,seconds;
 if(local){
  // Conservative half-ellipse corridor around the parent, rather than a chord through it.
  distanceKM=Math.PI*(a.radius+b.radius)/2;
  seconds=2*Math.sqrt(distanceKM*1000/acceleration);
 }else{
  const r1=a.au*149597870.7,r2=b.au*149597870.7,departDay=day+waitDays;
  const origin=a.phase+2*Math.PI*departDay/a.period;
  const distanceAt=t=>safeSolarDistance(r1,r2,b.phase+2*Math.PI*(departDay+t/86400)/b.period-origin);
  let lo=0,hi=2*Math.sqrt((r1+r2+Math.PI*.25*149597870.7)*1000/acceleration);
  for(let i=0;i<64;i++){const mid=(lo+hi)/2;if(acceleration*mid*mid/4>=distanceAt(mid)*1000)hi=mid;else lo=mid;}
  seconds=(lo+hi)/2;distanceKM=distanceAt(seconds);
 }
 const peakSpeed=acceleration*seconds/2000;
 return {coastDays:Math.max(1,Math.ceil(seconds/86400)),waitDays,deltaV:2*peakSpeed+legacy.deltaV,description:local?'Asterion · parent-centered powered flight':'Asterion · powered interplanetary flight',acceleration,distanceKM,peakSpeed,legacyDays:legacy.coastDays};
}
function hullAcceleration(v){
 const base=ships.find(x=>x.id===v.shipID),sh=effectiveShip(v);
 const ratedMass=base.dryMass+base.cargoTonnes*.5+base.tankTonnes*.5;
 const wetMass=sh.dryMass+cargoMass(v)+v.fuel;
 return Math.max(.001,Math.min(.1,DRIVE.acceleration*(base.thrustFactor||1)*ratedMass/wetMass));
}
function routeTransfer(s,dest){const members=fleetMembers(s),pool=fleetOverview(s);return transfer(port(s.location),port(dest),s.day,members.length?Math.min(...members.map(v=>hullAcceleration({...v,fuel:pool.tankTonnes?pool.fuel*effectiveShip(v).tankTonnes/pool.tankTonnes:0}))):DRIVE.acceleration);}
function piracyAssessment(s,dest,t=routeTransfer(s,dest)){
 const p=port(dest),from=port(s.location),earth=port('earth'),day=s.day+t.waitDays+t.coastDays;
 const earthDistance=(v,d)=>v.group==='earth'?0:Math.sqrt(Math.max(0,v.au*v.au+1-2*v.au*Math.cos(v.phase+2*Math.PI*d/v.period-(earth.phase+2*Math.PI*d/earth.period))));
 const distanceAU=earthDistance(p,day),originDistanceAU=earthDistance(from,s.day),crossing=beltCrossing(s,dest,t),nearBelt=[from,p].some(v=>v.au>=2.1&&v.au<=3.3);
 const activity=patrolActivity(s,dest,day),reportBonus=activity.bonus,debt=debtRaidRisk(s,dest,day),debtBonus=debt.bonus,baseRisk=.02,distanceRisk=.11*Math.log1p(distanceAU)/Math.log(32),localRisk=Math.max(0,p.piracy-.04)*.2,beltBonus=nearBelt?.14:crossing?.10:0;
 // Destination approaches depend on that station at arrival, not where its visitor started.
 const watch=patrolReports.securityWatch(api,s,dest,day),publicReportBonus=watch.adjustment,approachRisk=Math.max(.005,Math.min(.35,.02+distanceRisk+localRisk+reportBonus*.6+debtBonus*.65+publicReportBonus));
 const exposure=.25+.75*Math.min(1,Math.log1p(t.coastDays)/Math.log(365)),routeDistance=.11*Math.log1p(Math.max(distanceAU,originDistanceAU))/Math.log(32);
 const rawRoute=t.coastDays===0?0:Math.min(.4,.015+routeDistance*exposure+beltBonus+reportBonus*.4+debtBonus*.35+publicReportBonus*.5+campaignRisk(s,dest));
 const routeRisk=Math.max(0,Math.min(Math.max(0,rawRoute),(.55-approachRisk)/(1-approachRisk))),risk=1-(1-routeRisk)*(1-approachRisk);
 const detail=`${Math.round(routeRisk*100)}% corridor interception chance; ${Math.round(approachRisk*100)}% destination approach chance. Either, both or neither can occur. ${distanceAU.toFixed(1)} AU from Earth at arrival; patrol coverage thins outward.${beltBonus?' This route uses a reported main-belt corridor.':''} Dated traffic reports affect the forecast; their influence fades on long flights.${reportBonus?' Confirmed patrol intelligence is also included.':''} A safe trip does not clear the next voyage; equipment and debris incidents are separate.`;
 return {risk,routeRisk,approachRisk,arrivalDay:day,distanceAU,originDistanceAU,publicReportBonus,reportDay:watch.issuedDay,baseRisk,distanceRisk,localRisk,beltBonus,reportBonus,debtBonus,crossing,nearBelt,detail};
}

function quote(s,dest){const t=routeTransfer(s,dest),base=fleetFuelPlan(s,t.deltaV),escorts=fleetQuote(s,dest,t),security=piracyAssessment(s,dest,t),crewRisk=Math.max(0,60-crewReadiness(s))*.001,briefingApplied=hasDepartureBriefing(s,dest),incidentRisk=Math.max(.03,Math.min(.45,Math.max(.03,Math.min(.45,.12+t.coastDays/8000+(100-s.hull)/250)-level(s,'engineering')*.008)+crewRisk)*(briefingApplied?.75:1)*(1-captainPerk(s,'incidentRisk')));return {...t,...base,blockade:blockadeStation(s,dest,s.day+t.coastDays+t.waitDays)?.status==='blockaded',passengerProvisions:(t.coastDays+t.waitDays)*(passengerDaily(s)+missionPatientDaily(s)),crewWages:(t.coastDays+t.waitDays)*crewDaily(s),provisions:provisionsCost(s,t.coastDays,dest)+(t.coastDays+t.waitDays)*(passengerDaily(s)+missionPatientDaily(s)+crewDaily(s)),berth:t.waitDays*2*(1+escorts.length),incidentRisk,crewRisk,briefingApplied,routePiracyRisk:security.routeRisk,approachPiracyRisk:security.approachRisk,piracyRisk:security.risk,piracyDetail:security.detail,beltCrossing:security.crossing,beltRisk:security.crossing?(briefingApplied?.06:.12)*(1-captainPerk(s,'beltRisk')):0,escortCount:escorts.length,reserveFees:reserveFee(s,t.coastDays+t.waitDays)};}
function launchProblem(s,dest){if(s.fleetLoss)return 'Your travelling fleet was destroyed.';if(s.incident)return 'Resolve the current encounter first.';if(!s.profile.created)return 'Choose your captain’s background in the Captain panel.';if(s.location===dest)return 'Already docked here.';const access=visibleDestinationAccess(s,dest);if(!access.open)return access.offeredHere?'Purchase the '+access.charter+' at this port authority before departure.':'Purchase an access licence before departure. Discover offers at port authorities as you travel.';const q=quote(s,dest),pool=fleetOverview(s);for(const v of fleetMembers(s))if(!shipCargoFits(v))return 'Unload excess weight or volume from '+actorName(s,v)+' before departure.';else if(v.hull<35)return 'Repair '+actorName(s,v)+' to at least 35% integrity.';if(q.burn>pool.fuel+1e-8){if(!routeFuelLoadingPlan(s,dest).feasible)return 'This route exceeds shared fleet tank capacity. Reduce cargo or add a tanker.';return 'The travelling fleet lacks shared propellant for this route. Load more fuel.';}if(s.credits<q.provisions+q.berth)return 'Keep enough cash for provisions and launch-window berth fees.';return '';}

function crewReadiness(s){return s.stationServices?.crewReadiness??100;}
function serviceState(s){return s.stationServices||{crewReadiness:100,reportedVoyages:0,supplyDays:{},researchDays:{},completedStudies:0};}
function ensureServices(s){if(!s.stationServices)s.stationServices=clone(serviceState(s));return s.stationServices;}
function hasDepartureBriefing(s,dest){const b=s.stationServices?.briefing;return !!b&&b.origin===s.location&&b.destination===dest&&b.expires>=s.day;}
function careerLetterReply(position){return ({evidence:'I’d keep the evidence clear.',people:'I’d hear the people affected.',autonomy:'I’d leave room for choice.'})[position]||'I have read your account.';}
function coordinatorOverview(s,dest){
 const destinations=world.ports.filter(p=>p.id!==s.location&&destinationAccess(s,p.id).open).map(p=>({id:p.id,name:p.name,body:p.body}));
 if(!destinations.some(p=>p.id===dest))dest=destinations[0]?.id;
 const services=serviceState(s),q=quote(s,dest),pool=fleetOverview(s),briefingCost=Math.ceil(servicePrice(s,120+40*pool.count+Math.ceil(Math.log1p(port(s.location).au)*20))*(1-captainPerk(s,'briefingDiscount'))-1e-9),unreportedVoyages=Math.max(0,s.profile.stats.voyages-services.reportedVoyages),reportXP=careerDevelopment.reportXP(s),c=activeContracts(s).sort((a,b)=>a.deadline-b.deadline)[0];
 const briefingReason=q.briefingApplied?'This departure already has an active briefing.':s.credits<briefingCost?'Not enough cash for the departure briefing.':'';
 return {freightDispatch:freightDispatchBriefing(s,'relay'),destination:dest,destinations,routePiracyRisk:q.routePiracyRisk,approachPiracyRisk:q.approachPiracyRisk,days:q.coastDays+q.waitDays,fuelRequired:routeFuelLoadingPlan(s,dest).minimumDepartureFuel,fuelAboard:pool.fuel,travelCost:q.provisions+q.berth,incidentRisk:q.incidentRisk,piracyRisk:q.piracyRisk,beltRisk:q.beltRisk,crewReadiness:crewReadiness(s),crewRisk:q.crewRisk,launchProblem:launchProblem(s,dest),hazard:port(dest).hazard,briefingCost,briefingActive:q.briefingApplied,briefingExpires:q.briefingApplied?services.briefing.expires:null,briefingReason,existingBriefing:services.briefing&&services.briefing.expires>=s.day?`${port(services.briefing.origin).name} to ${port(services.briefing.destination).name}, valid through day ${services.briefing.expires}`:null,canBrief:!briefingReason,unreportedVoyages,reportXP,clientUnits:freightQuantity(s,true),restrictedUnits:fleetMembers(s).reduce((n,v)=>n+contrabandGoods.reduce((a,g)=>a+(v.cargo[g.id]||0),0),0),freightDeadline:c?.deadline??null,freightMargin:c?c.deadline-s.day-q.coastDays-q.waitDays:null,lastReport:services.lastReport||null};
}
function clinicOverview(s){
 const services=serviceState(s),readiness=crewReadiness(s),factor=port(s.location).factors.medicine||1,count=fleetMembers(s).length,initial=!s.topics.includes(s.location+':aid-done');
 const legacyAid=s.dialogue.filter(d=>d.port===s.location&&d.venue==='clinic'&&/Two medical parcels|Two medical units|Thank you, Captain/.test(d.text)).reduce((n,d)=>Math.max(n,d.day),0),lastSupply=services.supplyDays[s.location]??legacyAid;
 const supplyWait=initial?0:Math.max(0,lastSupply+60-s.day),slot=Number(hash(s.location+':clinic:'+Math.floor(s.day/60))%3n),id=initial?'medicine':['medicine','food','water'][slot],quantity=initial?2:[2,4,6][slot],owned=tradableQuantity(s,id),lastResearch=services.researchDays[s.location],researchWait=lastResearch===undefined?0:Math.max(0,lastResearch+60-s.day),researchReward=Math.min(1500,500+Math.round(good('food').base*.5+sparePrice(s)));
 const recoveryCost=Math.ceil(servicePrice(s,(180+40*count)*factor)*(1-captainPerk(s,'clinicDiscount'))-1e-9),treatmentCost=Math.ceil(servicePrice(s,(360+80*count)*factor)*(1-captainPerk(s,'clinicDiscount'))-1e-9),titles=['Habitat exposure study','Sterile cargo handling study','Mixed-crew life-support study'];
 return {readiness,condition:readiness>=85?'Fit for duty':readiness>=60?'Crew needs rest':'Crew is exhausted',riskPenalty:Math.max(0,60-readiness)*.001,recoveryCost,treatmentCost,recoveryGain:Math.min(40,100-readiness),canRecover:readiness<100&&s.credits>=recoveryCost,canTreat:readiness<100&&s.credits>=treatmentCost,supply:{good:id,name:good(id).name,quantity,owned,reputation:initial?5:2,waitDays:supplyWait,initial,canSupply:supplyWait===0&&owned>=quantity},researchTitle:titles[Number(hash(s.location)%3n)],researchReward,researchWait,canResearch:researchWait===0&&readiness>=60,completedStudies:services.completedStudies,lastTreatment:services.lastTreatment||null};
}
function stationServiceAction(s,type,arg){
 check(s.profile.created,'Sign your captain charter before booking station services.');
 if(type==='coordinator-brief'){
  check(world.ports.some(p=>p.id===arg.destination&&p.id!==s.location&&destinationAccess(s,p.id).open),'Choose a licensed destination for this briefing.');
  const data=coordinatorOverview(s,arg.destination);check(data.canBrief,data.briefingReason);s.credits-=data.briefingCost;advance(s,1);ensureServices(s).briefing={origin:s.location,destination:arg.destination,day:s.day,expires:Math.min(365249,s.day+30)};
  decision(s,'Booked a route-specific departure briefing with station control.','caution');record(s,`Departure briefing for ${port(arg.destination).name}: ${data.briefingCost} cr and one day. Next qualifying departure within 30 days has 25% lower equipment-incident chance and 50% lower belt-advisory chance. Pirate risk and physical travel remain unchanged.`);
 }else if(type==='coordinator-report'){
  const data=coordinatorOverview(s);check(data.unreportedVoyages>0,'No unreported voyages remain.');advance(s,1);const ledger=ensureServices(s);ledger.reportedVoyages=s.profile.stats.voyages;ledger.lastReport={edition:2,port:s.location,day:s.day,voyages:ledger.reportedVoyages,count:data.unreportedVoyages,xp:data.reportXP};earn(s,'navigation',data.reportXP);careerDevelopment.reported(s);changeReputation(s,data.reportXP>0?1:0,'Shared verified traffic observations at '+port(s.location).name+'.');changeStationReputation(s,s.location,data.reportXP>0?1:0,'Filed traffic observations.');decision(s,'Submitted completed voyage observations to station control.','caution');record(s,`Filed ${data.unreportedVoyages} unreported voyages: +${data.reportXP} navigation XP${data.reportXP?', reputation progress and local trust progress':'; repeated observations add no new reputation'}. One day at the communications desk; these voyages cannot be claimed again.`);
 }else if(type==='clinic-recover'||type==='clinic-treat'){
  const data=clinicOverview(s),full=type==='clinic-treat',cost=full?data.treatmentCost:data.recoveryCost,days=full?5:2;check(data.readiness<100,'Your travelling crew is already fully ready.');check(s.credits>=cost,'Not enough cash for this medical service.');s.credits-=cost;advance(s,days);const ledger=ensureServices(s),recovered=full?100-ledger.crewReadiness:Math.min(40,100-ledger.crewReadiness);ledger.crewReadiness+=recovered;ledger.lastTreatment={port:s.location,day:s.day,kind:full?'treatment':'recovery',cost,recovered};decision(s,full?'Arranged full treatment and recovery for the travelling crew.':'Booked clinic recovery berths for the travelling crew.','empathy');record(s,`${full?'Full medical treatment':'Crew recovery berths'} at ${port(s.location).name}: ${cost} cr, ${days} days, readiness +${recovered} to ${ledger.crewReadiness}/100. Ship hull repairs remain a dry-dock service.`);
 }else if(type==='clinic-supply'){
  const data=clinicOverview(s).supply;check(!data.initial,'This clinic’s first request is two medical units.');check(data.waitDays===0,`The next clinic request opens in ${data.waitDays} days.`);check(data.owned>=data.quantity,'Bring enough of your own requested goods; client freight cannot be donated.');removeFleetCargo(s,data.good,data.quantity,true);ensureServices(s).supplyDays[s.location]=s.day;changeReputation(s,2+captainPerk(s,'clinicReputation'),'Replenished the community clinic at '+port(s.location).name+'.');s.profile.stats.aid++;changeStationReputation(s,s.location,3,'Replenished the community clinic.');earn(s,'diplomacy',12);decision(s,`Supplied ${data.quantity} units of ${data.name.toLowerCase()} to a recurring clinic request.`,'empathy');record(s,`Clinic reserve replenished: ${data.quantity} ${data.name.toLowerCase()}, reputation progress, +12 diplomacy XP and local trust progress. New request in 60 days.`);
 }else if(type==='clinic-research'){
  const data=clinicOverview(s);check(data.researchWait===0,`The next study opens in ${data.researchWait} days.`);check(data.readiness>=60,'The clinic requires crew readiness of at least 60 for a research shift.');check(s.credits+data.researchReward<=999999999,'Deposit cash before receiving the research stipend.');advance(s,3);const ledger=ensureServices(s);ledger.researchDays[s.location]=s.day;ledger.completedStudies++;s.credits+=data.researchReward;earn(s,'engineering',12);earn(s,'diplomacy',8);changeReputation(s,1,'Completed a clinic research shift at '+port(s.location).name+'.');changeStationReputation(s,s.location,2,'Kept a local promise.');decision(s,'Volunteered three days for a supervised station medical study.','empathy');record(s,`${data.researchTitle}: three days, ${data.researchReward} cr stipend, +12 engineering XP, +8 diplomacy XP, reputation progress and local trust progress. Another study at this clinic opens in 60 days.`);
 }else throw Error('Unknown station service.');
}
function validateStationServices(s){
 const v=s.stationServices;if(v===undefined||v===null)return;const ports=new Set(world.ports.map(p=>p.id));
 check(v&&integer(v.crewReadiness,0,100)&&integer(v.reportedVoyages,0,s.profile.stats.voyages)&&integer(v.completedStudies,0,1000000),'Invalid station service record.');
 for(const map of [v.supplyDays,v.researchDays])check(map&&typeof map==='object'&&!Array.isArray(map)&&Object.keys(map).length<=ports.size&&Object.entries(map).every(([id,day])=>ports.has(id)&&integer(day,0,s.day)),'Invalid clinic service dates.');
 check(Object.keys(v.researchDays).length<=v.completedStudies,'Invalid clinic research count.');
 if(v.briefing!==undefined&&v.briefing!==null){const b=v.briefing;check(b&&ports.has(b.origin)&&ports.has(b.destination)&&b.origin!==b.destination&&integer(b.day,0,s.day)&&integer(b.expires,b.day,365249),'Invalid departure briefing.');}
 if(v.lastReport!==undefined&&v.lastReport!==null){const r=v.lastReport;check(r&&ports.has(r.port)&&integer(r.day,0,s.day)&&r.voyages===v.reportedVoyages&&integer(r.count,1,r.voyages)&&(r.edition===2?integer(r.xp,0,25):r.edition===undefined&&r.xp===Math.min(25,r.count*5)),'Invalid traffic report receipt.');}
 if(v.lastTreatment!==undefined&&v.lastTreatment!==null){const t=v.lastTreatment;check(t&&ports.has(t.port)&&integer(t.day,0,s.day)&&['treatment','recovery'].includes(t.kind)&&integer(t.cost,1,999999999)&&integer(t.recovered,1,100),'Invalid medical treatment receipt.');}
}
function advance(s,days,travelPaid=false){
 check(integer(days,0,100000)&&s.day+days<365250,'This journey exceeds the simulation calendar.');reconcileFreightLoss(s);
 if(!travelPaid&&crewDaily(s)&&days){const wages=crewDaily(s)*days;invoice(s,wages);record(s,'Named crew wages: '+wages+' cr over '+days+' days; unpaid cash obligations enter the original charter account.');}
 if(days&&s.exchangeStock?.version===1)s.exchangeStock=clone(marketBook(s));
 const dailyBank=advanceBankCalendar(s,days);
 // Collection quotes may read market stock during each bank day. Project lazily
 // for those reads, then persist the market only after the calendar reaches it.
 if(days)advanceExchangeCalendar(s,s.day);
 if(!dailyBank)for(const k of Object.keys(s.pressure))s.pressure[k]*=Math.exp(-days/60);for(const c of activeContracts(s))if(s.day>c.deadline)failFreight(s,'late',c);expireDialogueCommissions(s);expireSecretQuests(s);civilianAdvance(s,days,travelPaid);campaignAdvance(s,days,travelPaid);diplomaticAdvance(s);}

function validateVoyage(s){
 const v=s.voyage;if(v===undefined)return;
 check(v&&v.version===1&&v.origin===s.location&&world.ports.some(p=>p.id===v.destination)&&v.destination!==v.origin&&integer(v.startedDay,0,s.day)&&integer(v.remainingDays,1,100000)&&integer(v.remainingFatigue,0,35)&&integer(v.remainingWear,0,1000)&&integer(v.flightDays,0,99999)&&v.remainingDays+v.flightDays===v.coastDays&&Math.floor(v.coastDays*v.progress)===v.flightDays&&s.day>=v.startedDay+v.waitDays+v.flightDays&&integer(v.coastDays,1,100000)&&integer(v.waitDays,0,100000)&&v.playback&&['coastDays','waitDays','burn','acceleration','peakSpeed','deltaV'].every(k=>finite(v.playback[k],0,1e12))&&v.playback.coastDays===v.coastDays&&v.playback.waitDays===v.waitDays&&finite(v.progress,0,1)&&v.progress>0&&v.progress<1&&s.incident?.destination===v.destination&&['pirate','battle','battle-summary'].includes(s.incident?.kind),'Invalid in-transit voyage.');
}
function pirateEncounter(s,destination,phase,progress){
 const target=wantedArrival(s,destination),reported=patrolActivity(s,destination,s.day).reports.find(r=>!r.bountyID);
 s.incident={id:uuid(),kind:'pirate',destination,phase,progress,title:target?target.ship+' interception':phase==='route'?'Raider contact in transit':'Armed craft on approach',detail:(phase==='route'?'An armed craft cuts across your transfer corridor before the destination is reached. Your fleet breaks its flight sequence and awaits orders.':'An armed tug challenges your final approach before docking clearance. Station control is listening.')+(target?` Patrol identifies ${target.name}, wanted for ${target.reward.toLocaleString('en-US')} cr. Capture the group and report to patrol.`:''),damage:12,delay:3};
 if(target)s.incident.bountyID=target.id;else{const regional=blockadeTier(destination),tier=Math.min(regional,reported?.tier||regional);s.incident.encounterPlan=combat2.encounterPlan(s,tier);s.incident.reportTier=s.incident.encounterPlan.tier;}
 s.profile.stats.pirates++;record(s,`${phase==='route'?'En-route raider interception':'Destination approach raid'} before docking at ${port(destination).name}. Awaiting orders.`);
}
function finishVoyageApproach(s,dest){
 if(blockadeArrival(s,dest,s.location))return;
 const risk=piracyAssessment(s,dest,{waitDays:0,coastDays:0});
 if(!s.fleetLoss&&rng(s)<risk.approachRisk){pirateEncounter(s,dest,'approach',.94);return;}
 arrive(s,dest);
}
function continueVoyage(s,dest){
 const v=s.voyage;check(v&&v.destination===dest,'The saved voyage destination has changed.');
 delete s.voyage;advance(s,v.remainingDays,true);const crew=ensureServices(s);crew.crewReadiness=Math.max(0,crew.crewReadiness-v.remainingFatigue);for(const hull of fleetMembers(s))hull.hull=Math.max(1,hull.hull-v.remainingWear);record(s,`Resumed flight to ${port(dest).name}: ${v.remainingDays} remaining planned days completed. Combat or avoidance delays are additional.`);finishVoyageApproach(s,dest);
}
function arrive(s,dest,inspectionIDs){if(s.voyage&&s.voyage.destination!==dest){delete s.voyage;record(s,'The interrupted voyage ended in recovery at '+port(dest).name+'.');}if(s.voyage&&s.voyage.destination===dest){continueVoyage(s,dest);return;}if(s.location!==dest&&blockadeArrival(s,dest,s.location))return;s.location=dest;diplomaticArrival(s,dest);for(const v of s.fleet.filter(v=>v.escort))v.location=dest;if(!s.visited.includes(dest)){s.visited.push(dest);const bonus=captainPerk(s,'discoveryXP');if(bonus)earn(s,'navigation',bonus);}civilianSync(s);if(inspectionIDs)inspectionIDs=[...inspectionIDs,...s.fleet.filter(v=>(v.carrierID||v.towID)&&inspectionIDs.includes(v.carrierID||v.towID)).map(v=>v.id)];record(s,`Docked at ${port(dest).name}, ${port(dest).body}.`);inspectArrival(s,dest,inspectionIDs);enforceBranchDebt(s,dest);for(const q of s.dialogueProgress?.commissions||[])if(q.status==='active'&&q.kind==='survey'&&q.target===dest&&s.day<=q.deadline)q.visitedTarget=true;}
// Standard-contract estimates deliberately exclude unrelated escorts, cargo and luxury fittings.
// Bounded memoization keeps repeated desk renders independent of fleet size.
const serviceRouteCache=new Map();
function serviceRouteCost(s,destination,{shipID='kestrel',mass=0,returnTrip=false,stops=[],workDays=0,passengers=0}={}){
 const key=JSON.stringify([s.location,s.day,destination,shipID,mass,returnTrip,stops,workDays,passengers]);
 if(serviceRouteCache.has(key))return {...serviceRouteCache.get(key)};
 const x=fresh(),h=ships.find(h=>h.id===shipID);x.day=s.day;x.location=s.location;x.shipID=shipID;x.fuel=h.tankTonnes;x.spares=0;x.ammo=0;x.ordnanceAmmo=0;x.upgrades=Object.fromEntries(upgradeCatalog.map(m=>[m.id,0]));
 if(mass)x.contractTow={mission:'quote-only',mass};
 let operating=0,days=workDays;const itinerary=[destination,...stops,...(returnTrip?[s.location]:[])];
 for(const to of itinerary){if(to===x.location)continue;const q=quote(x,to),elapsed=q.coastDays+q.waitDays;operating+=fuelCost(q.burn,x.location)+q.provisions+q.berth+elapsed*passengers*2;days+=elapsed;x.day=Math.min(365249,x.day+elapsed);x.location=to;x.fuel=h.tankTonnes;}
 operating+=workDays*(12+passengers*2);const capital=Math.ceil(h.price*.04*(days+10)/365.25),result={operating:Math.ceil(operating),capital,days,hullValue:h.price};
 if(serviceRouteCache.size>=1024)serviceRouteCache.clear();serviceRouteCache.set(key,result);return {...result};
}
function serviceReward(cost,{cargoValue=0,work=0,extra=0,risk=.025}={}){
 return Math.ceil(cost.operating*1.15+cost.capital+750+Math.min(cost.hullValue*.08,cargoValue*risk)+cost.hullValue*.001*work+extra);
}
const freightRewardRules=Object.freeze({maximumProfitShare:.25,baseProfitShare:.08,riskProfitShare:.10,urgencyProfitShare:.04,durationProfitShare:.02,handlingProfitShare:.01,minimumBreachFee:100,breachProfitRate:.10});
function patrolRouteRisk(s,destination){return patrolReports.routeAssessment(api,s,destination);}
function freightPayout(c){return c.pricing?.version===2?c.pricing.commission+(c.expensesAccrued||0):c.reward;}
function accrueFreightExpenses(s,cost){const jobs=activeContracts(s).filter(c=>c.pricing?.version===2),mass=Math.max(.001,fleetOverview(s).cargoMass);for(const c of jobs){const held=fleetMembers(s).reduce((n,v)=>n+freightManifests(v).filter(l=>l.contractID===c.id).reduce((a,l)=>a+l.units*cargoSpecs.packing(l.good).grossKgPerLot/1000,0),0);if(held)c.expensesAccrued=Math.min(c.pricing.expenses,(c.expensesAccrued||0)+Math.floor(cost*held/mass));}}
function freightRewardQuote(s,destination,{quantity,cargoValue,sourceCost,destinationValue,urgency=0,products=1,reference='kestrel',mass=quantity*.25},risk=patrolRouteRisk(s,destination)){
 check(finite(mass,.001,1000)&&integer(quantity,1,400)&&integer(cargoValue,1,999999999)&&integer(sourceCost,1,999999999)&&integer(destinationValue,1,999999999)&&finite(urgency,0,1)&&integer(products,1,4)&&ships.some(h=>h.id===reference),'Invalid freight reward exposure.');
 const cost=serviceRouteCost(s,destination,{shipID:reference,mass}),r=freightRewardRules,expenses=cost.operating,profitPool=Math.max(0,destinationValue-sourceCost-expenses),multiplier=(1+Math.max(relicBonuses(s).commerce?.05:0,crewBonus(s,'commerce')*.05))*(1+captainPerk(s,'freightFee')),duration=Math.min(1,cost.days/180),handling=(products-1)/3,share=Math.min(r.maximumProfitShare,(r.baseProfitShare+r.riskProfitShare*risk.risk+r.urgencyProfitShare*urgency+r.durationProfitShare*duration+r.handlingProfitShare*handling)*multiplier),commission=Math.floor(profitPool*share/(1+share)),stationProfit=profitPool-commission;
 return {version:2,reference,sourceCost,destinationValue,urgency,duration,handling,products,days:cost.days,operating:cost.operating,capital:cost.capital,expenses,profitPool,share,multiplier,commission,stationProfit,maximumProfitShare:r.maximumProfitShare,reward:expenses+commission,risk:risk.risk,riskLabel:risk.label,riskKey:risk.key,reportDay:risk.reportDay,reportCount:risk.reports,sampleCount:risk.samples,blockade:risk.blockade};
}
// A dispatch cycle owns its deadline. Board reads never move it forward.
// Project only vessel stores, without copying or changing the voyage history.
function freightOfferTiming(s,destination,tier,lines,plan=freightLoadPlan(s,{},lines)){
 const schedule=freightRouteSchedule(s,destination),posted=serviceRouteCost({...s,day:schedule.cycleStart},destination,{shipID:tier.reference,mass:lines.reduce((n,l)=>n+l.quantity*cargoSpecs.packing(l.good).grossKgPerLot/1000,0)}),deadline=Math.min(365249,schedule.cycleStart+posted.days+90),projected={...s,cargo:{...s.cargo},fleet:s.fleet.map(v=>({...v,cargo:{...v.cargo}}))},copies=new Map([[s,projected],...s.fleet.map((v,i)=>[v,projected.fleet[i]])]),allocated={};
 for(const {v,good,units} of plan.allocations){const copy=copies.get(v);copy.cargo[good]=(copy.cargo[good]||0)+units;allocated[good]=(allocated[good]||0)+units;}
 // A disabled capacity offer still needs a conservative full-lot transit estimate.
 for(const l of lines){const remaining=l.quantity-(allocated[l.good]||0);if(remaining)projected.cargo[l.good]=(projected.cargo[l.good]||0)+remaining;}
 const travel=routeTransfer(projected,destination),travelDays=travel.waitDays+travel.coastDays,arrivalDay=s.day+travelDays;
 return {postedDay:schedule.cycleStart,deadline,travelDays,arrivalDay,marginDays:deadline-arrivalDay};
}
function offers(s){
 if((s.freightStanding?.suspendedUntil||0)>s.day)return [];
 const career=freightCareer(s),tiers=freightTiers.filter(t=>career.level>=t.level&&career.access>=t.access&&career.capacity>=t.units&&career.ships>=t.ships&&career.standing>=(t.standing||0)),patrol=patrolReports.assessment(api,s),result=[];let routeIndex=0;
 for(const route of freightDispatchRoutes(s)){
  const {p,t,schedule,base,candidates}=route,index=routeIndex++;
  if(activeContracts(s).some(c=>c.origin===s.location&&c.destination===p.id)||freightRouteTaken(s,{id:base+'-0',origin:s.location,destination:p.id,cycle:schedule.cycle,...schedule}))continue;
  const offset=(schedule.cycle+index)%Math.max(1,tiers.length),preferred=tiers.slice().reverse();if(preferred.length)preferred.push(...preferred.splice(0,offset));
  for(const tier of preferred){
   const quota=tier.units/tier.products,routeBudget=serviceRouteCost(s,p.id,{shipID:tier.reference,mass:tier.units*.25}).operating,eligible=candidates.filter(x=>x.limit>=quota).map(x=>({...x,sourceCost:tradeTotal(s,x.g.id,quota,false),destinationValue:tradeTotal({...s,location:p.id},x.g.id,quota,true)})).filter(x=>x.destinationValue-x.sourceCost>routeBudget/tier.products);let selected=[];
   for(const x of eligible){const trial=[...selected,x];if(freightLoadPlan(s,{},trial.map(v=>({good:v.g.id,quantity:quota}))).complete)selected=trial;if(selected.length===tier.products)break;}
   if(selected.length<tier.products)selected=eligible.slice(0,tier.products);if(selected.length<tier.products)continue;
   const lines=selected.map(x=>({good:x.g.id,quantity:quota,cargoValue:Math.max(tradeTotal(s,x.g.id,quota,true),tradeTotal({...s,location:p.id},x.g.id,quota,true))})),plan=freightLoadPlan(s,{},lines),fits=plan.complete,timing=freightOfferTiming(s,p.id,tier,lines,plan);if(timing.marginDays<0)continue;
   const cargoValue=lines.reduce((n,l)=>n+l.cargoValue,0),sourceCost=lines.reduce((n,l)=>n+tradeTotal(s,l.good,l.quantity,false),0),destinationValue=lines.reduce((n,l)=>n+tradeTotal({...s,location:p.id},l.good,l.quantity,true),0),routeRisk=patrolReports.routeAssessment(api,s,p.id,patrol),pricing=freightRewardQuote(s,p.id,{quantity:tier.units,mass:lines.reduce((n,l)=>n+l.quantity*cargoSpecs.packing(l.good).grossKgPerLot/1000,0),cargoValue,sourceCost,destinationValue,products:tier.products,urgency:selected.reduce((n,x)=>n+x.need/Math.max(1,x.need+x.targetStock),0)/selected.length,reference:tier.reference},routeRisk);
   if(pricing.profitPool<=0)continue;
   result.push({pricing,id:base+'-'+tier.id,...schedule,freightEdition:2,tier:tier.id,tierName:tier.name,lines,good:lines[0].good,quantity:tier.units,reward:pricing.reward,deadline:timing.deadline,fulfilment:'consignment',origin:s.location,cargoValue,breachFee:Math.max(freightRewardRules.minimumBreachFee,Math.ceil(pricing.stationProfit*freightRewardRules.breachProfitRate)),canAccept:fits,reason:fits?'':'Make compatible hold space for the entire shipment.',dispatch:{day:s.day,lines:selected.map(x=>({good:x.g.id,sourceStock:x.physicalStock,sourceOffered:x.stock,sourceReserve:x.reserve,sourceSurplus:x.net>0,destinationStock:x.targetStock,destinationNeed:x.need,destinationShortfall:x.targetNet>0}))}});
   break;
  }
  if(result.length===6)break;
 }
 return result;
}
function freightDispatchBriefing(s,venue='contracts'){
 const routes=offers(s),broker=establishments(s.location,false,s).find(h=>h.id==='market'),coordinator=establishments(s.location,false,s).find(h=>h.id==='relay'),dispatcher=establishments(s.location,false,s).find(h=>h.id==='contracts');
 return `${venue==='market'?`I check actual reserves for ${dispatcher.person}’s freight board; ${coordinator.person} checks the route.`:venue==='relay'?`I check the routes for ${dispatcher.person}’s freight board; ${broker.person} confirms the available cargo.`:`I coordinate with ${broker.person} at the exchange and ${coordinator.person} at communications.`} The broker checks cargo available beyond local reserves; dispatch matches receiving shortfalls, and the coordinator checks the route and patrol watch. The client reimburses recorded cargo-attributed voyage costs up to the signed route budget; your profit is a capped share of the station’s retained margin, not a percentage of cargo value. ${routes.length?`Today we have ${routes.length} distinct receiving ${routes.length===1?'station':'stations'} on the board.`:'There is no shipment we can safely allocate from current surplus to an eligible receiving need.'} Each destination has one shipment, sized for your current handling capacity. Accepting it reserves actual station goods; receiving clients consume them on handover.`;
}

function stationLabel(value,includeStation=true){const p=typeof value==='string'?world.ports.find(p=>p.id===value||p.name===value||p.body===value):value;if(!p?.group)return typeof value==='string'?value:String(value?.station||value?.name||'');const parent=world.systems.find(g=>g.id===p.group).name,location=p.body===parent?'Orbit':p.body===parent+' high orbit'?'High orbit':p.body;return [includeStation?p.name:null,location,parent].filter(Boolean).join(' · ');}
function dialogueLocations(text,here){let result=String(text);for(const p of world.ports.filter(p=>p.id!==here).sort((a,b)=>b.name.length-a.name.length)){result=result.split(p.name).map((part,i,parts)=>i<parts.length-1?part+(parts[i+1].startsWith(' · ')?p.name:stationLabel(p)):part).join('');}return result;}
function speak(s,speaker,text){text=dialogueLocations(text,s.location);s.dialogue.push({id:uuid(),day:s.day,port:s.location,speaker,text});s.dialogue=s.dialogue.slice(-160);}
function topic(s,id){
 const p=port(s.location),coordinator=establishments(s.location,false,s).find(v=>v.id==='relay').person,c=s.profile,first=!s.topics.includes(p.id+':'+id),rel=c.relationships[p.id]||0;
 const history=c.stats.deliveries?`Your ${c.stats.deliveries} completed ${c.stats.deliveries===1?'delivery has':'deliveries have'} made your name familiar.`:c.stats.voyages?`You have ${c.stats.voyages} recorded voyages behind you.`:'Your charter is new. The first run tells us more than a résumé.';
 const texts={
 welcome:`**${coordinator}** — ${p.role}\n\n“Welcome to **${p.name}**, Captain ${c.name}. ${history} ${rel>=3?'The cooperative remembers your help.':'We value crews who keep their word.'}”`,
 economy:`“${p.description}”\n\n**Supply desk:** ${goods.filter(g=>marketAccess(s,g.id).canBuy).sort((a,b)=>marketState(s,a.id).price/a.base-marketState(s,b.id).price/b.base).slice(0,2).map(g=>g.name).join(' and ')} have the lowest relative price factors here. That is a local comparison, not a promise of profit. Exchange goods are processed cargo, never free material scraped off a moon.`,
 safety:`“Our main concern is **${p.hazard.toLowerCase()}**. Equipment exposure accumulates during the flight. Raider groups can intercept a transfer corridor or challenge the final station approach. Both cost them propulsion, so route exposure and the local watch matter; a risky forecast does not guarantee contact.”\n\n${c.stats.pirates?'“After your encounter, we have attached the incident report to your transponder record.”':'“Keep contingency propellant and engineering spares. A distress call may buy protection, but not an instant rescue.”'}`,
 routes:`“**Asterion changed the timetable.** We accelerate for half the flight, turn over and brake for the rest. Earth–Mars now takes weeks, depending on geometry and ship mass; outer-system voyages take months rather than decades. There is a one-day interplanetary clearance, not a long Hohmann launch-window wait.”\n\n“Cargo, reaction mass and the slowest assigned escort affect acceleration. Your planner includes braking and propellant. We still have to reach a moving destination, keep clear of the Sun and pay for supplies.”`,
 engine:`**The Asterion breakthrough**\n\n“Sen and Ibarra stabilized a magnetic nozzle at Kepler Shipyard in 2074. By 2081, a courier could thrust all the way to Mars, turn halfway and brake into orbit. The Open Drive Compact brought those conversions to independent hulls like yours.”\n\n“Open the **Engine story** in your flight plan for the full archive. They shared the design so small crews could compete. Fast exhaust does not make fuel, spare parts or careful captains optional.”`,
 personal:`“${reputation(s)}. ${c.stats.aid?'You have given supplies when there was no commercial reason to do so. ':''}${c.stats.negotiations?'You have used words to get through a hostile approach. ':''}${c.stats.repairs?'Your maintenance record speaks well of the crew. ':''}You started as a **${backgrounds[c.background].name.toLowerCase()}**; what you do next will matter more.”`,
 aid:'“Our clinic can use a small emergency parcel. **Two units of medical supplies** would replenish the local reserve. There is no cash payment; the cooperative will remember the help.”'
 };
 check(texts[id],'Unknown conversation topic.');
 const prompts={welcome:'Open a channel.',economy:'What does this station produce?',safety:'What should we watch for?',routes:'Tell me about the new routes.',engine:'How was the Asterion drive invented?',personal:'How do people see my captain?',aid:'Does the cooperative need help?'};
 speak(s,c.name,prompts[id]);speak(s,coordinator,texts[id]);
 if(first){s.topics.push(p.id+':'+id);const venue=id==='economy'?'market':['personal','welcome'].includes(id)?'local':id==='aid'?'clinic':'relay',host=stationContacts(s.location,venue,s)[0];earn(s,dialogueSkill(venue),careerConversations.learning(s,venue,host,id==='welcome'?3:5));}
}
const commercialStandingRules=Object.freeze([
 Object.freeze({id:'industrial',netWorth:50000,description:'Industrial custody contacts'}),
 Object.freeze({id:'regional',netWorth:250000,description:'Regional commercial contacts'}),
 Object.freeze({id:'fleet',netWorth:1000000,description:'Fleet charter clients'})
]);
function commercialStanding(s){return commercialStandingRules.reduce((rank,r,i)=>s.topics.includes('commercial-standing:'+r.id)?i+1:rank,0);}
function recogniseCommercialStanding(s){
 if(!s.profile.created||s.incident||s.battle||s.fleetLoss||commercialStanding(s)===commercialStandingRules.length)return;
 const worth=netWorth(s),earned=commercialStandingRules.filter(r=>worth>=r.netWorth&&!s.topics.includes('commercial-standing:'+r.id));
 if(!earned.length)return;
 for(const r of earned)s.topics.push('commercial-standing:'+r.id);
 record(s,'Commercial introductions at '+port(s.location).name+': '+earned.map(r=>r.description.toLowerCase()).join(', ')+'. Contacts will remember this standing.');
}
function independentCharter(s){
 const earned=s.topics.includes('independent-charter:earned')||(s.profile.created&&s.debt===0&&s.visited.length>=5&&netWorth(s)>=100000);
 return {earned,pending:earned&&!s.topics.includes('independent-charter:acknowledged')};
}
function recordIndependentCharter(s){if(independentCharter(s).earned&&!s.topics.includes('independent-charter:earned')){s.topics.push('independent-charter:earned');record(s,'Independent charter earned.');}}
const tradeWorkRules=Object.freeze({experienceBudget:20,stationarySettlementDays:30,emergencyCredit:3000,seasoningStarts:80,seasoningVoyages:40,profitAdvance:.12,repaymentAdvance:.10});
// A bounded business ledger settles completed trading work, not button presses.
// Cost basis follows the goods; cash transfers, loans and capital sales are excluded.
function tradeCareer(s){return s.tradeCareer||(s.tradeCareer={version:1,startedDay:s.day,profitableVoyages:0,netOperating:0,earnedProfit:0,repaid:0,repaymentFloor:s.debt,settlements:0,legacyVoyages:s.profile.stats.voyages,work:{day:s.day,units:0,margin:0,cost:0,travelled:false}});}
function validateTradeCareer(s){const r=s.tradeCareer;if(r===undefined)return;check(r&&r.version===1&&integer(r.startedDay,0,s.day)&&['profitableVoyages','settlements'].every(k=>integer(r[k],0,10000000))&&finite(r.netOperating,-1e15,1e15)&&finite(r.earnedProfit,0,1e15)&&finite(r.repaid,0,1e15),'Invalid trading record.');check(r.legacyVoyages===undefined||integer(r.legacyVoyages,0,s.profile.stats.voyages),'Invalid earlier voyage record.');check(r.repaymentFloor===undefined||integer(r.repaymentFloor,0,999999999),'Invalid repayment record.');const w=r.work;check(w&&integer(w.day,0,s.day)&&finite(w.units,0,1e12)&&finite(w.margin,-1e15,1e15)&&finite(w.cost,0,1e15)&&(w.serviceRevenue===undefined||finite(w.serviceRevenue,0,1e15))&&typeof w.travelled==='boolean','Invalid unfinished trading work.');}
function settleTradeWork(s){const r=tradeCareer(s),w=r.work,net=w.margin+(w.serviceRevenue||0)-w.cost;if(w.units>0||w.cost>0||(w.serviceRevenue||0)>0){r.settlements++;r.netOperating+=net;if(net>.005){r.earnedProfit+=net;if(w.travelled)r.profitableVoyages++;const reward=Math.min(tradeWorkRules.experienceBudget,Math.floor(w.units+1e-7));if(reward){earn(s,'commerce',reward);record(s,'Trading work settled: '+reward+' Commerce XP; net operating result '+net.toFixed(2)+' cr after recorded transit, interest and service costs.');}}}r.work={day:s.day,units:0,margin:0,cost:0,travelled:false};}
function operatingExpense(s,amount){if(amount>0)tradeCareer(s).work.cost+=amount;}
function accountTradeAction(before,s,type){
 const earnedService=['deliver','claim-bounty','blockade-claim','mission-complete','op-passenger-deliver','diplomatic-report'].includes(type);
 if(!s.tradeCareer&&!earnedService)return;
 const r=tradeCareer(s),w=r.work;
 if(earnedService)w.serviceRevenue=(w.serviceRevenue||0)+Math.max(0,s.credits-before.credits);
 // Replacement borrowing cannot reset the lowest retired debt. Preserve older
 // credited history; start the new floor at the pre-action balance when absent.
 r.repaymentFloor??=before.debt;
 const retired=Math.max(0,r.repaymentFloor-s.debt);
 if(['repay','repay-local'].includes(type))r.repaid+=retired;
 r.repaymentFloor=Math.min(r.repaymentFloor,s.debt);
 const service=['clinic-recover','clinic-treat','clinic-supply','wait','resolve'];
 if(service.includes(type))operatingExpense(s,Math.max(0,before.credits-s.credits));
 if(!['borrow','repay','repay-local'].includes(type))operatingExpense(s,Math.max(0,s.debt-before.debt));
}
function transact(original,type,arg={}){
 const s=clone(original);validate(s);retireMerchantAgreements(s);initializeShipNames(s);check(!s.incident||s.incident.kind!=='battle-summary'||type==='battle-continue','Review the battle summary before continuing.');check(!s.fleetLoss||type==='resume-reserve'||type==='battle-continue',s.fleetLoss?.reason==='repossession'?'Your travelling ships were repossessed. Take passage to an owned reserve, or start a new voyage if no ships remain.':'Your travelling fleet was destroyed. Take passage to a surviving reserve, load a save or start a new voyage.');prepareCast(s);if(!s.blockadeWorld)s.blockadeWorld={version:1,startDay:0,stations:[]};const previousAccess=accessiblePorts(s);s.unlocked=previousAccess;if(['clinic-recover','clinic-treat','clinic-supply','wait','resolve'].includes(type))tradeCareer(s);
 const available=()=>check(!s.incident,'Resolve the encounter before using station services.');
 // Recognise balance-sheet standing during a real business conversation, never by browsing.
 if(type==='venue-talk'&&['bank','contracts','warehouse','local'].includes(arg.id))recogniseCommercialStanding(s);
 switch(type){
 case 'battle-continue':{continueAfterBattle(s,arg.report);break;}
 case 'merchant-accept':case 'merchant-deliver':case 'merchant-abandon':{available();merchantAction(s,type,arg);break;}
 case 'battle-profile':{combat2.saveProfile(s,arg);break;}
 case 'generate-ship-name':{available();check(s.profile.created&&!s.battle,'Finish the encounter before changing ship names.');const v=arg.id===s.flagshipID?s:s.fleet.find(v=>v.id===arg.id);check(v&&v.hull>0,'Choose a surviving ship you own.');const previous=v===s?s.shipName:v.name,name=generatedShipName(s,v.shipID,arg.id,previous);if(v===s)s.shipName=name;else v.name=name;record(s,`Registered ${previous} as ${name}.`);break;}
 case 'rename-ship':{available();check(s.profile.created&&!s.battle,'Finish the encounter before changing ship names.');const target=arg.id===s.flagshipID?s:s.fleet.find(v=>v.id===arg.id);check(target&&target.hull>0,'Choose a surviving ship you own.');check(str(arg.name,60)&&!/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(arg.name),'Enter a ship name of up to 60 characters on one line.');const name=arg.name.normalize('NFC').trim().replace(/ +/g,' ');check(name.length>0&&name.length<=60,'Enter a ship name of up to 60 characters.');const previous=target===s?s.shipName:target.name;if(name!==previous){if(target===s)s.shipName=name;else target.name=name;record(s,`Renamed ${previous} to ${name}.`);}break;}
 case 'charter-notice-dismiss':{check(independentCharter(s).earned,'The independent charter has not been earned.');recordIndependentCharter(s);if(!s.topics.includes('independent-charter:acknowledged'))s.topics.push('independent-charter:acknowledged');break;}
 case 'customs-pack':{available();customsPackingAction(s,arg);break;}
 case 'blockade-accept':case 'blockade-engage':case 'blockade-claim':case 'blockade-withdraw':{available();blockadeAction(s,type,arg);break;}
 case 'diplomatic-accept':case 'diplomatic-negotiate':case 'diplomatic-report':case 'diplomatic-abandon':{available();diplomaticAction(s,type,arg);break;}
 case 'signal-analyze':case 'mission-accept':case 'mission-work':case 'mission-complete':case 'mission-abandon':case 'mission-steal':case 'campaign-permit':{available();campaignAction(s,type,arg);break;}
 case 'artifact-analyze':case 'artifact-equip':case 'artifact-sell':case 'artifact-return':{available();antiquityAction(s,type,arg);break;}
 case 'component-buy':case 'field-install':case 'tow-attach':case 'tow-detach':{available();fieldEquipmentAction(s,type,arg);break;}
 case 'field-repair':case 'field-treatment':case 'duty-fit':{available();specialistServiceAction(s,type,arg);break;}
 case 'op-permit':case 'op-survey':case 'op-extract':case 'op-refine':case 'op-passenger-accept':case 'op-passenger-care':case 'op-passenger-deliver':case 'op-passenger-cancel':case 'op-carrier-embark':case 'op-carrier-deploy':{available();civilianAction(s,type,arg);break;}
 case 'resume-reserve':{check(s.fleetLoss,'No lost convoy is awaiting recovery.');const previousPort=s.fleetLoss.port,next=s.fleet.find(v=>v.id===arg.id&&v.hull>0&&!v.carrierID);check(next,'Choose a surviving reserve ship.');const t=transfer(s.fleetLoss.port,next.location,s.day),days=t.coastDays+t.waitDays,cost=100+days*12;invoice(s,cost);advance(s,days);if(!s.fleet.some(v=>v.id===next.id)){record(s,'Booked passage completed, but '+next.name+' was auctioned for overdue berth credit before command could transfer.');break;}promoteShip(s,next);s.location=next.location;if(!s.visited.includes(s.location))s.visited.push(s.location);delete s.fleetLoss;if(!blockadeArrival(s,s.location,previousPort))enforceBranchDebt(s,s.location);record(s,`Took booked passenger transport for ${days} days and ${cost} cr to ${port(s.location).name}; assumed command of ${s.shipName}. The reserve ship and its stores stayed at its berth.`);break;}
 case 'secret-talk':case 'secret-trade':case 'secret-accept':case 'secret-recover':case 'secret-complete':case 'secret-abandon':case 'relic-equip':{available();cantinaAction(s,type,arg);break;}
 case 'relic-hunt-recover':case 'relic-hunt-complete':{available();relicHuntAction(s,type,arg);break;}
 case 'career-letter':{available();check(!s.incident&&!s.battle,'Read correspondence while safely stopped.');const reply=careerDevelopment.mail(s,arg,(view,h,key)=>careerConversations.reply(view,h.id,h,key));speak(s,s.profile.name,careerLetterReply(arg.position));speak(s,reply.speaker,reply.text);break;}
 case 'career-mastery':{available();check(!s.incident&&!s.battle,'Speak to the coordinator while safely stopped.');const text=careerDevelopment.masteryAction(s,arg);speak(s,stationContacts(s.location,'relay',s)[0].person,text);record(s,text);break;}
 case 'crew-talk':{available();check(!s.incident&&!s.battle&&!s.fleetLoss,'Speak with your crew while safely stopped.');const reply=careerConversations.crewTalk(s,arg.id,arg.choice);speak(s,s.profile.name,reply.question);speak(s,reply.speaker,reply.response);for(const line of s.dialogue.slice(-2)){line.venue='crew';line.contact=arg.id;line.partner=reply.speaker;line.conversationChoice='crew-'+arg.choice;}break;}
 case 'crew-duty':case 'crew-release':{available();crewAction(s,type,arg);break;}
 case 'warehouse-lease-pack':{available();warehouseLeasePack(s,arg);break;}
 case 'warehouse-buy':case 'warehouse-store':case 'warehouse-take':{available();warehouseAction(s,type,arg);break;}
 case 'move-home':{available();moveHomeBase(s,arg);break;}
 case 'purchase-licence':{available();check(s.profile.created,'Choose your captain before purchasing a licence.');const c=charters.find(c=>c.id===arg.id);check(c,'Choose a valid access licence.');const offer=licenceOffer(s,c);check(!offer.open,'These destinations are already covered. No payment was taken.');check(offer.issuedHere,'This authority does not offer that licence. Visit port authorities as you travel to discover new access.');check(offer.eligible,'Licence requirements not met. '+offer.blockingReason);check(s.credits>=offer.price,'Not enough cash for this licence. Withdraw a deposit or arrange a loan at the bank.');s.credits-=offer.price;if(!s.licences)s.licences=[];s.licences.push({id:c.id,cost:offer.price,day:s.day,issuer:s.location});s.unlocked=[...new Set([...s.unlocked,...c.ports])];record(s,`Purchased ${c.name} from ${port(s.location).name} Port authority for ${offer.price} cr. Permanent access: ${offer.ports}.`);break;}
 case 'create': {
 available();check(!s.profile.created,'This captain’s background is already established.');check(str(arg.name,60)&&arg.name.trim(),'Enter a captain name (up to 60 characters).');const previous=s.profile;s.profile={...previous,name:arg.name.trim(),background:arg.background,temperament:arg.temperament,xp:{...previous.xp},created:true,species:arg.species||previous.species||'human'};check(speciesCatalog.some(x=>x.id===s.profile.species),'Choose a valid species.');check(backgrounds[arg.background]&&temperaments[arg.temperament],'Choose a valid background and disposition.');s.profile.xp[backgrounds[previous.background].skill]=Math.max(0,s.profile.xp[backgrounds[previous.background].skill]-100);s.profile.xp[backgrounds[arg.background].skill]+=100;record(s,`Captain ${s.profile.name} registered as a ${backgrounds[arg.background].name.toLowerCase()}.`);break;}
 case 'set-identity':{check(false,'This character edit action has been retired. Choose species when signing a new charter.');break;}
 case 'set-species':{available();check(!s.profile.created,'Identity is set when you sign the charter and cannot be changed during this voyage.');check(speciesCatalog.some(x=>x.id===arg.species),'Choose a valid species.');s.profile.species=arg.species;break;}
 case 'coordinator-brief':case 'coordinator-report':case 'clinic-recover':case 'clinic-treat':case 'clinic-supply':case 'clinic-research':{available();stationServiceAction(s,type,arg);break;}
 case 'accept-bounty':case 'claim-bounty':case 'refresh-bounty-intel':{available();fleetAction(s,type,arg);break;}
 case 'venue-talk':{available();venueTalk(s,arg.id,arg.topic,arg.contact,arg.opening===true);break;}
 case 'personal-project-step':{available();const text=performPrivateStep(s,arg),h=stationContacts(s.location,arg.venue,s).find(h=>(h.contactID||'')===(arg.contact||''));speak(s,h.person,text);Object.assign(s.dialogue.at(-1),{venue:arg.venue,contact:arg.contact||'',partner:h.person,service:'project'});break;}
 case 'patron-buy':{available();buyPersonalSupplies(s,arg);break;}
 case 'buy-round':{available();buyCanteenRound(s,arg.contact||'');break;}
 case 'buy':case 'sell':case 'buy-max':case 'sell-all': {
 available();good(arg.good);const buy=type==='buy'||type==='buy-max',q=marketState(s,arg.good),delivery=buy?(arg.delivery||{kind:'fleet'}):{kind:'fleet'},source=buy?{kind:'fleet'}:(arg.source||{kind:'fleet'}),origin=marketSaleSource(s,arg.good,source),limits=marketOrderLimits(s,arg.good,q,delivery,source),n=type==='buy-max'?limits.buyMax:type==='sell-all'?limits.sellAll:arg.units;
 if(!buy)check(origin.qualified,origin.reason);check(integer(n,1,MAX_FLEET*MAX_CARGO_LOTS),'Choose an available cargo quantity.');if(buy){const access=marketAccess(s,arg.good,delivery);check(access.canBuy,access.reason);}check(n<=(buy?limits.buyMax:limits.sellAll),buy?'Not enough credits, available stock or room at the purchase destination.':'Only available owned cargo may be sold; client freight is reserved.');
 const margin=!buy?saleAssessment(s,arg.good,n,s.location,source):null,total=tradeTotal(s,arg.good,n,buy);if(!buy&&margin.status!=='unknown'&&margin.status!=='empty'){const r=tradeCareer(s);if(!r.work.travelled&&s.day-r.work.day>=tradeWorkRules.stationarySettlementDays)settleTradeWork(s);r.work.units+=n;r.work.margin+=margin.profit;}if(!buy&&goods.some(g=>g.id===arg.good))merchantContribution(s,arg.good,n,margin?.profit||0);settleContraband(s,arg.good,n,buy);settleExchangeStock(s,arg.good,n,buy);s.credits+=buy?-total:total;if(buy)receiveMarketPurchase(s,arg.good,n,{units:n,cost:total},delivery);else if(origin.kind==='warehouse')removeCargo(origin.vessel,arg.good,n);else removeFleetCargo(s,arg.good,n,true);if(!buy)s.profile.stats.unitsSold+=n;record(s,`${buy?'Bought':'Sold'} ${n} units of ${good(arg.good).name.toLowerCase()} for ${total} cr.${buy&&delivery.kind==='warehouse'?' Delivered to the local warehouse.':buy&&delivery.kind==='ship'?' Delivered to '+actorName(s,marketDestination(s,arg.good,delivery).vessel)+'.':!buy&&origin.kind==='warehouse'?' Sold directly from the local warehouse.':''}`);break;}
 case 'refuel':{available();const pool=fleetOverview(s);check(finite(arg.target,pool.fuel+.0001,pool.tankTonnes+.0001),'Choose a propellant target within the fleet tank limit.');const cost=fleetFuelCost(s,arg.target);check(s.credits>=cost,'Not enough credits for propellant.');s.credits-=cost;setFleetFuel(s,Math.min(arg.target,pool.tankTonnes));record(s,`Loaded shared fleet propellant to ${arg.target.toFixed(1)} t for ${cost} cr.`);break;}
 case 'repair':{available();const cost=repairQuote(s).cost;check(cost>0&&s.credits>=cost,'Repairs are unnecessary or unaffordable.');operatingExpense(s,cost);s.credits-=cost;s.hull=100;s.profile.stats.repairs++;decision(s,'Ordered preventive dockside maintenance.','caution');record(s,`Repaired the ship for ${cost} cr.`);break;}
 case 'restock':{available();const n=ship(s).maxSpares-s.spares,cost=n*sparePrice(s);check(n>0&&s.credits>=cost,'Spares are full or unaffordable.');operatingExpense(s,cost);s.credits-=cost;s.spares+=n;record(s,`Loaded ${n} engineering spares for ${cost} cr.`);break;}
 case 'borrow':case 'repay':case 'repay-local':case 'deposit':case 'withdraw':{available();const maximum=arg.max===true&&['deposit','withdraw','borrow','repay-local'].includes(type);bankAction(s,type,maximum?bankOverview(s)[type==='repay-local'?'maxRepayLocal':'max'+type[0].toUpperCase()+type.slice(1)]:arg.amount,arg.rateMode===undefined?'floating':arg.rateMode);break;}
 case 'ship-reserve':case 'ship-order-cancel':{available();check(s.profile.created,'Sign your charter first.');shipReservationAction(s,type,arg);break;}
 case 'upgrade':{available();const offer=shipOffer(s,arg.ship);check(offer.canTrade,offer.tradeReason);const next=ships.find(x=>x.id===arg.ship),oldName=s.shipName,poolFuel=fleetOverview(s).fuel,oldCargo=clone(s.cargo),oldBasis=clone(s.cargoBasis||{}),oldFreight=clone(freightManifests(s));claimShipStock(s,next.id);s.credits-=offer.netCost;s.shipID=next.id;s.shipName=generatedShipName(s,next.id,s.flagshipID,s.shipName);s.upgrades=emptyUpgrades();s.cargoPackingEdition=2;delete s.legacyCargo;s.hull=100;s.fuel=0;s.cargo={};s.cargoBasis={};delete s.freightCargo;for(const [id,n] of Object.entries(oldCargo)){const owned=n-oldFreight.reduce((sum,f)=>sum+(f.good===id?f.units:0),0);if(owned)addFleetCargo(s,id,owned,oldBasis[id]||{units:0,cost:0});}for(const f of oldFreight)loadFreight(s,freightContract(s,f.contractID)||freightReturnJobs(s).find(c=>c.id===f.contractID),f.units,f.good);setFleetFuel(s,poolFuel);s.spares=next.maxSpares;record(s,`Replaced ${oldName} with ${next.name}: ${offer.pay?'paid '+offer.pay:'received '+offer.refund} cr after ${offer.hullCredit} cr hull and ${offer.equipmentCredit} cr equipment credit. Fleet remains ${s.fleet.length+1} ships. Cargo, ammunition and fuel transferred; old hull and fitted upgrades surrendered.`);break;}
 case 'accept':{available();check(s.profile.created,'Sign your captain charter before accepting freight.');const suspension=freightOverview(s).suspensionDays;check(!suspension,`Freight registry suspension: ${suspension} days remaining.`);const c=offers(s).find(c=>c.id===arg.id);check(c,'This offer is no longer available.');check(freightLoadPlan(s,c).complete,'Make compatible weight and volume space for the full shipment.');check(c.canAccept,c.reason);check(freightOfferTiming(s,c.destination,freightTiers[c.tier],freightLines(c)).arrivalDay<=c.deadline,'This freight cannot reach its destination before the deadline.');for(const l of freightLines(c))check(marketStock(s,l.good,s.location,false).wholesaleAvailable>=l.quantity,'The source station no longer has the full shipment in stock.');const accepted={...c,acceptedDay:s.day,...(c.pricing?.version===2?{expensesAccrued:0}:{})};delete accepted.canAccept;delete accepted.reason;for(const l of freightLines(c))settleExchangeStock(s,l.good,l.quantity,true,true);addFreightContract(s,accepted);loadFreight(s,accepted);record(s,`Freight office loaded ${freightDescription(c)} from the station’s available stock as client-owned cargo at no purchase cost. Deliver to ${port(c.destination).name} by day ${c.deadline} for ${c.pricing?.version===2?c.pricing.commission+' cr commission plus recorded voyage costs, up to '+c.pricing.expenses+' cr':c.reward+' cr'}, and reputation progress. Missing cargo restitution is capped at ${c.cargoValue} cr, plus the ${c.breachFee} cr breach fee; surviving goods stay client-owned until returned. Ordinary breach suspends new jobs for 30 days.`);break;}
 case 'steal-freight':{available();const offer=freightTheftOffer(s,arg.id);check(offer.canSteal,offer.reason);check(arg.id===offer.id,'The active delivery has changed. Review the shipment again.');failFreight(s,'stolen',freightContract(s,arg.id));break;}
 case 'abandon-contract':{available();const c=freightContract(s,arg.id);check(c,'Select an active delivery to abandon.');check(arg.id===undefined||arg.id===c.id,'The active delivery has changed.');failFreight(s,'abandoned',c);break;}
 case 'return-freight':{available();returnFreight(s,arg.id);break;}
 case 'deliver':{available();const c=freightContract(s,arg.id);check(c&&s.location===c.destination&&s.day<=c.deadline&&(c.fulfilment==='consignment'?freightQuantity(s,true,c.id):tradableQuantity(s,c.good))>=c.quantity,'Bring the complete shipment to its destination before the deadline.');const payment=freightPayout(c);check(s.credits+payment<=999999999,'Deposit cash before receiving this delivery fee.');if(c.fulfilment==='consignment')unloadFreight(s,c);else removeFleetCargo(s,c.good,c.quantity,true);consumeClientFreight(s,c);s.credits+=payment;s.completed.push(c.id);removeFreightContract(s,c);changeReputation(s,3,'Honored a delivery to '+port(s.location).name+'.');s.profile.stats.deliveries++;const local=campaignState(s);local.localDeliveries=local.localDeliveries||{};local.localDeliveries[s.location]=(local.localDeliveries[s.location]||0)+1;if(c.origin&&c.origin!==s.location)changeStationReputation(s,c.origin,1,'Client freight reached its destination.');earn(s,'commerce',40);earn(s,'diplomacy',15);changeStationReputation(s,s.location,2,'Kept a local promise.');decision(s,'Honored a delivery contract.','resolve');record(s,`Delivery completed: ${payment} cr${c.pricing?.version===2?' (commission '+c.pricing.commission+' + recorded route expenses '+c.expensesAccrued+')':''} ${c.fulfilment==='consignment'?'freight fee; client shipment consumed by the receiving client; no goods added to the destination exchange.':'including cargo payment under the existing purchase contract.'}`);break;}
 case 'wait':{available();check(s.credits>=14,'Keep enough cash for flagship berth fees.');s.credits-=14;advance(s,7);record(s,'Waited seven days in port. Orbital positions and markets moved.');break;}
 case 'depart':{
 available();check(s.profile.created,'Choose your captain’s background before departure.');const problem=launchProblem(s,arg.destination);check(!problem,problem);const q=quote(s,arg.destination);settleTradeWork(s);const work=tradeCareer(s).work;work.travelled=true;work.cost+=fuelCost(q.burn,s.location)+q.provisions+q.berth;accrueFreightExpenses(s,fuelCost(q.burn,s.location)+q.provisions+q.berth);if(q.briefingApplied){delete ensureServices(s).briefing;record(s,'Station departure briefing applied to this voyage and consumed.');}s.credits-=q.provisions+q.berth;if(q.crewWages)record(s,'Named crew transit wages prepaid once: '+q.crewWages+' cr, included in the quoted provisions.');spendFleetFuel(s,q.burn);const corridor=rng(s)<q.routePiracyRisk,progress=corridor?.25+rng(s)*.45:1,flightDays=corridor?Math.min(q.coastDays-1,Math.floor(q.coastDays*progress)):q.coastDays,startedDay=s.day;if(corridor)s.voyage={version:1,origin:s.location,destination:arg.destination,startedDay,coastDays:q.coastDays,waitDays:q.waitDays,remainingDays:q.coastDays-flightDays,flightDays,progress,playback:{coastDays:q.coastDays,waitDays:q.waitDays,burn:q.burn,acceleration:q.acceleration,peakSpeed:q.peakSpeed,deltaV:q.deltaV}};advance(s,q.waitDays+flightDays,true);const medical=ensureServices(s),fatigue=Math.max(1,Math.round(Math.min(35,Math.max(1,Math.ceil((q.coastDays+q.waitDays)/12)))*(1-captainPerk(s,'travelFatigue'))));const elapsedDays=q.waitDays+flightDays,totalDays=q.waitDays+q.coastDays,appliedFatigue=corridor?Math.floor(fatigue*elapsedDays/totalDays):fatigue,wear=Math.max(1,Math.floor(q.coastDays/180)),appliedWear=corridor?Math.floor(wear*elapsedDays/totalDays):wear;medical.crewReadiness=Math.max(0,medical.crewReadiness-appliedFatigue);for(const v of fleetMembers(s))v.hull=Math.max(1,v.hull-appliedWear);if(corridor){s.voyage.remainingFatigue=fatigue-appliedFatigue;s.voyage.remainingWear=wear-appliedWear;}record(s,`Travelling crew readiness ${medical.crewReadiness}/100 after ${elapsedDays} elapsed transit days. Clinics offer recovery berths and treatment.`);s.profile.stats.voyages++;earn(s,'navigation',careerDevelopment.navigationAward(s,arg.destination,q));record(s,`Departed ${port(s.location).body}: clearance ${q.waitDays} d; planned flight ${q.coastDays} d; ${q.burn.toFixed(1)} t propellant committed. ${corridor?'Contact interrupted the transfer before docking.':'Planned flight completed; awaiting approach clearance.'}`);
 if(corridor){pirateEncounter(s,arg.destination,'route',s.voyage.progress);break;}
 if(blockadeArrival(s,arg.destination,s.location))break;
 const pirate=rng(s)<q.approachPiracyRisk;
 if(pirate){pirateEncounter(s,arg.destination,'approach',.94);} else if(q.beltCrossing&&rng(s)<q.beltRisk){s.incident={id:uuid(),kind:'asteroid',destination:arg.destination,title:'Belt corridor advisory',detail:'A mining beacon reports fresh fragments near a surveyed working corridor in the main asteroid belt. Most of the belt is empty space. This is a local debris alert, not a wall of asteroids. Hold for a clear corridor, plot a correction, or continue behind the forward shielding.',damage:8,delay:4};record(s,'Main-belt debris advisory. Awaiting a routing decision.');}
 else if(rng(s)<q.incidentRisk){const titles=['Coolant-loop failure','Micrometeoroid puncture','Power-converter fault'];s.incident={id:uuid(),kind:'equipment',destination:arg.destination,title:titles[Math.floor(rng(s)*3)],detail:'A service assembly has failed. Fit an engineering spare, or isolate the system and accept damage and a delay before docking.',damage:18,delay:4};record(s,'Equipment incident. Awaiting your decision.');}else arrive(s,arg.destination);break;}
 case 'resolve':{
 const i=s.incident;check(i,'No encounter is waiting.');
 if(i.kind==='battle')throw Error('Issue tactical orders from the battle screen.');
 if(i.kind==='blockade'){if(arg.choice==='fight'){blockadeArrival(s,i.destination,blockadeWorldEntry(s,i.destination).returnPort);break;}check(arg.choice==='withdraw','Defeat the blockade to dock, or withdraw to your departure station.');const recovery=blockadeRecovery(s);invoice(s,recovery.cost);advance(s,recovery.days,true);s.incident=null;record(s,'Withdrew from the blockade of '+port(i.destination).name+'. Contracted recovery to '+port(recovery.port).name+': '+recovery.cost+' cr and '+recovery.days+' days. The station remains closed.');arrive(s,recovery.port);break;}
 if(i.kind==='asteroid'){
 if(arg.choice==='belt-wait'){advance(s,4);decision(s,'Held clear of an active belt worksite until traffic control cleared the corridor.','caution');}
 else if(arg.choice==='belt-detour'){spendFleetFuel(s,fleetManeuverFuel(s,.12));advance(s,2);earn(s,'navigation',12);decision(s,'Plotted a powered correction around a reported debris plume.','resolve');}
 else if(arg.choice==='belt-shield'){advance(s,1);for(const v of actors(s))v.hull=Math.max(15,v.hull-8);decision(s,'Accepted shielding damage while crossing a local debris advisory.','resolve');}
 else throw Error('Choose a belt-corridor response.');record(s,'Belt corridor cleared. Continuing to the destination.');
 }else if(i.kind==='pirate'){
 if(arg.choice==='fight'){startBattle(s,'defense');break;}
 const fee=pirateFee(s),evade=evasionFuel(s);
 if(arg.choice==='pay'){check(s.credits>=fee,'Not enough credits for the demanded fee.');s.credits-=fee;decision(s,`Paid a ${fee} cr pirate toll to protect the crew.`,'caution');record(s,`Paid the ${fee} cr extortion demand. Contact cleared without damage.`);}
 else if(arg.choice==='evade'){check(canEvade(s),'The fleet needs shared contingency propellant for the avoidance burn.');spendFleetFuel(s,evade);advance(s,2);earn(s,'navigation',18);decision(s,`Spent ${evade.toFixed(2)} t to break contact and resume the route.`,'resolve');record(s,'Used a 0.25 km/s avoidance maneuver. Contact cleared; added two days.');}
 else if(arg.choice==='negotiate'){const chance=negotiationChance(s,i.destination);s.profile.stats.negotiations++;earn(s,'diplomacy',18);advance(s,1);decision(s,'Broadcast the extortion demand and negotiated with station control.','resolve');if(rng(s)<chance){record(s,'Station control identified the tug. The pirates broke off.');}else{const paid=Math.min(s.credits,Math.ceil(fee*.5));s.credits-=paid;s.hull=Math.max(15,s.hull-8);advance(s,2);record(s,`Negotiation failed. Lost ${paid} cr and 8 integrity before patrol assistance cleared the contact.`);}}
 else if(arg.choice==='distress'){advance(s,7);s.hull=Math.max(15,s.hull-12);const g=Object.keys(s.cargo).find(k=>s.cargo[k]>0);if(g)removeCargo(s,g,Math.min(2,s.cargo[g]));decision(s,'Requested patrol assistance and accepted a delayed, damaged arrival.','caution');record(s,'Patrol assistance arrived after seven days. Lost 12 integrity and up to two cargo units.');}
 else throw Error('Choose a response to the pirates.');
 }else if(arg.choice==='spare'){check(s.spares>0,'No engineering spares remain.');s.spares--;advance(s,1);earn(s,'engineering',20);decision(s,'Installed a spare assembly during transit.','caution');record(s,'Installed a spare. Added one day; no additional integrity loss.');}
 else if(arg.choice==='isolate'){s.hull=Math.max(15,s.hull-i.damage);advance(s,i.delay);decision(s,'Isolated a failed assembly and continued on reduced systems.','resolve');record(s,`Isolated the fault: ${i.damage} integrity lost, ${i.delay} days added.`);}
 else throw Error('Choose an incident response.');
 s.incident=null;arrive(s,i.destination);break;}
 case 'talk':{available();topic(s,arg.topic);break;}
 case 'aid':{available();const key=s.location+':aid-done';check(!s.topics.includes(key),'You have already supplied this clinic.');check(tradableQuantity(s,'medicine')>=2,'Bring two units of your own medical supplies; client freight cannot be donated.');removeFleetCargo(s,'medicine',2,true);s.topics.push(key);ensureServices(s).supplyDays[s.location]=s.day;changeReputation(s,5+captainPerk(s,'clinicReputation'),'Supplied the clinic at '+port(s.location).name+'.');s.profile.stats.aid++;changeStationReputation(s,s.location,5,'Donated medical supplies.');earn(s,'diplomacy',25);decision(s,`Donated medical supplies at ${port(s.location).name}.`,'empathy');const medic=establishments(s.location,false,s).find(v=>v.id==='clinic');speak(s,medic.person,'“**Thank you, Captain.** Two medical parcels have reached the clinic. The cooperative has recorded your help.”');Object.assign(s.dialogue.at(-1),{venue:'clinic',contact:'',partner:medic.person,service:'clinic'});record(s,'Donated two medical units to the station clinic.');break;}
 default:fleetAction(s,type,arg);
 }
 if(['resolve','battle-order','battle-tick'].includes(type)){const after=new Map(fleetMembers(s).map(v=>[actorID(s,v),v.hull])),damage=fleetMembers(original).reduce((n,v)=>n+Math.max(0,v.hull-(after.get(actorID(original,v))??0)-(original.voyage&&!s.voyage&&after.has(actorID(original,v))?original.voyage.remainingWear:0)),0);if(damage){const medical=ensureServices(s),loss=Math.ceil(Math.min(20,Math.ceil(damage/5))*(1-captainPerk(s,'combatFatigue'))-1e-9);medical.crewReadiness=Math.max(0,medical.crewReadiness-loss);record(s,`Crew disruption after hull damage: readiness −${loss}, now ${medical.crewReadiness}/100. Medical care is available at station clinics.`);}}
 reconcileFreightLoss(s);
 const opened=accessiblePorts(s);s.unlocked=opened;const newPorts=opened.filter(id=>!previousAccess.includes(id));if(newPorts.length)record(s,'Access licensed: '+newPorts.map(id=>port(id).body).join(', ')+'. Access is permanent; check the flight plan for fuel and convoy readiness.');
 if(['steal-freight','mission-steal'].includes(type))for(const session of Object.values(s.dialogueProgress?.sessions||{}))breakPersonalTrust(s,session,'You deliberately stole client cargo.');campaignReconcile(s);civilianSync(s);if(s.crewEncounters)s.crewEncounters.classes=[...new Set([...crewAcquiredClasses(original),...crewAcquiredClasses(s)])].sort();if(['deposit','withdraw','borrow','repay','repay-local'].includes(type))bankerTransactionReply(original,s,type);accountTradeAction(original,s,type);expireMerchantContracts(s);recordCommodityDiscoveries(original,s);recordMarketObservation(s,type);recordIndependentCharter(s);if(s.battleDoctrine){const ids=new Set([s.flagshipID,...s.fleet.map(v=>v.id)]);for(const id of Object.keys(s.battleDoctrine.ships))if(!ids.has(id))delete s.battleDoctrine.ships[id];}autoEquipNewRelics(original,s);s.lastJournalEntry=journalEntry(original,s,{type,args:arg,recording:true});return validate(s);
}
// All accounts are fictional credits. Deposits stay at their originating branch;
// new loans may float or lock a quoted premium. Existing contracts retain their signed rate.
const bankRates={mercury:[.022,.067],venus:[.018,.058],earth:[.012,.04],mars:[.019,.06],ceres:[.025,.073],jupiter:[.027,.078],saturn:[.029,.085],uranus:[.032,.094],neptune:[.034,.102]};
// Branch budgets reflect commercial capacity; a captain's earned record adjusts them.
const branchCreditBases={earth:20000,moon:15000,mars:18000,phobos:10000,ceres:24000,callisto:22000,titan:26000,mercury:9000,venus:17000,'earth-high':30000,deimos:8000,jupiter:16000,io:7000,europa:12000,ganymede:25000,saturn:28000,enceladus:11000,rhea:14000,iapetus:6000,uranus:19000,miranda:6500,ariel:13000,titania:21000,oberon:9500,neptune:23000,triton:10500};
// Keep branch budgets proportional to the full starter-hull loan rather than the old 4,000-credit loan.
for(const pid of Object.keys(branchCreditBases))branchCreditBases[pid]=Math.round(branchCreditBases[pid]*CHARTER_CREDIT_SCALE/100)*100;
function creditAssessment(s,pid=s.location){
 const baseLimit=branchCreditBases[port(pid).id],earnedRanks=Object.keys(skillNames).reduce((n,k)=>n+skillProgressForXP(s.profile.xp[k]).level,0),experienceBonus=Math.max(0,earnedRanks-1)*.1,publicReputation=reputationData(s.profile).score,localReputation=s.profile.relationships[pid]||0,reputationFactor=Math.max(.3,1+publicReputation*.003+localReputation*.005),creditLimit=Math.max(1000,Math.round(baseLimit*(1+experienceBonus)*reputationFactor/100)*100);
 return {baseLimit,earnedRanks,experienceBonus,publicReputation,localReputation,reputationFactor,creditLimit,explanation:`Branch base ${baseLimit.toLocaleString('en-US')} cr · earned experience +${Math.round(experienceBonus*100)}% · wider reputation ${publicReputation>0?'+':''}${publicReputation} · local reputation ${localReputation>0?'+':''}${localReputation}. Experience raises your allowance; good reputation improves it and poor reputation reduces it. Limits are reviewed as your record changes. Relic bonuses do not count as earned experience. Fixed and earlier loan agreements retain their signed rates; new floating credit adjusts daily with rate momentum. Arrival collection applies to visiting ships; chargeable reserves are also reviewed daily for berth credit.`};
}
// Public daily wholesale samples drive a damped rate velocity, not quote jumps.
// A bounded 240-day warm-up reconstructs each quote independently of read order;
// cache only public seasonal signals and a handful of completed daily quotes.
const bankMarketCache=new Map(),bankSignalCache=new Map(),bankTargetCache=new Map();
const bankRateRules=Object.freeze({periodDays:1,yearDays:365.25,fundingLongDays:1440,fundingShortDays:330,momentumDays:240,rateResponse:.0144,rateDamping:.24,maxRateAcceleration:.000025,maxDailyRateChange:.00035,spreadMomentumWeight:.35,minimumCreditSpread:.008,maximumCreditSpread:.04,networkCarryBuffer:.001,fixedBasePremium:.015,fixedRemotePremium:.003,fixedDemandPremium:.002,fixedLeadPremium:.0025,fixedSmallBranchPremium:.0025,fixedLeadMin:24,fixedLeadRange:86,fixedSizeMax:22,fixedSizeRange:19,depositCeilingSpread:.008,depositFloor:.002,depositFundingDiscount:.006,loanFloor:.012,loanFundingMargin:.010,loanRegionalWeight:.4,loanOrbitWeight:.5,loanConsumptionWeight:.003,loanTradeWeight:.002});
const boundedRate=(n,a,b)=>Math.max(a,Math.min(b,n));
const quotedRate=n=>Math.round(n*10000)/10000;
function bankRateStep(level,velocity,target){
 const acceleration=boundedRate(bankRateRules.rateResponse*(target-level)-bankRateRules.rateDamping*velocity,-bankRateRules.maxRateAcceleration,bankRateRules.maxRateAcceleration),nextVelocity=boundedRate(velocity+acceleration,-bankRateRules.maxDailyRateChange,bankRateRules.maxDailyRateChange);
 return {level:level+nextVelocity,velocity:nextVelocity,acceleration:nextVelocity-velocity};
}
function bankDailySignals(day){
 // Public goods repeat after the approved pricing cycle. Store summaries only.
 const period=marketEconomy.periodDays,phase=((day%period)+period)%period;if(bankSignalCache.has(phase))return bankSignalCache.get(phase);
 const rows=new Map();for(const p of world.ports){
  const flows=goods.map(g=>({id:g.id,...marketEconomy.supply(p.id,g.id,phase),quote:marketState({day:phase},g.id,p.id)})),listed=flows.filter(f=>marketEconomy.listed(p.id,f.id)),balance=listed.reduce((n,f)=>n+(f.production-f.consumption)/Math.max(1,f.production+f.consumption),0)/Math.max(1,listed.length);
  rows.set(p.id,{flows,byGood:new Map(flows.map(f=>[f.id,f])),netBalance:balance,consumptionPressure:Math.max(0,-balance),surplusGoods:listed.filter(f=>f.production>f.consumption).length,consumptionGoods:listed.filter(f=>f.production<f.consumption).length});
 }
 const result=new Map();for(const p of world.ports){
  const r=rows.get(p.id),margins=[];
  for(const f of r.flows.filter(f=>f.production>f.consumption&&marketEconomy.listed(p.id,f.id))){
   let best=null;for(const dest of world.ports){if(dest.id===p.id)continue;const target=rows.get(dest.id).byGood.get(f.id);if(target.consumption<=target.production)continue;const margin=(target.quote.sell-f.quote.buy)/f.quote.buy;if(margin>0&&(!best||margin>best.margin))best={good:f.id,destination:dest.id,margin,buy:f.quote.buy,sell:target.quote.sell};}if(best)margins.push(best);
  }
  const tradeDemand=margins.reduce((n,r)=>n+Math.min(1,r.margin),0)/Math.max(1,r.surplusGoods),regional=bankRates[p.group][1]-.04,offset=p.id==='moon'?.003:p.id==='earth-high'?.001:p.kind==='moon'?.0015:0,profile=marketEconomy.stationProfiles[p.id],leadPressure=boundedRate((profile.lead-bankRateRules.fixedLeadMin)/bankRateRules.fixedLeadRange,0,1),smallBranchPressure=boundedRate((bankRateRules.fixedSizeMax-profile.size)/bankRateRules.fixedSizeRange,0,1),fixedBranchPremium=bankRateRules.fixedLeadPremium*leadPressure+bankRateRules.fixedSmallBranchPremium*smallBranchPressure;
  result.set(p.id,{netBalance:r.netBalance,consumptionPressure:r.consumptionPressure,surplusGoods:r.surplusGoods,consumptionGoods:r.consumptionGoods,tradeDemand,tradeExamples:margins.sort((a,b)=>b.margin-a.margin).slice(0,3),regional,offset,fixedBranchPremium,fixedPremium:quotedRate(bankRateRules.fixedBasePremium+bankRateRules.fixedRemotePremium*Math.min(1,regional/.062)+bankRateRules.fixedDemandPremium*r.consumptionPressure+fixedBranchPremium)});
 }
 bankSignalCache.set(phase,result);return result;
}
function bankRateTargets(day){
 if(bankTargetCache.has(day))return bankTargetCache.get(day);
 const funding=.026+.020*Math.sin(2*Math.PI*day/bankRateRules.fundingLongDays)+.006*Math.sin(2*Math.PI*day/bankRateRules.fundingShortDays),rows=bankDailySignals(day),result=new Map();
 for(const [id,r] of rows){
  const loan=Math.max(bankRateRules.loanFloor,funding+bankRateRules.loanFundingMargin+bankRateRules.loanRegionalWeight*r.regional+bankRateRules.loanOrbitWeight*r.offset+bankRateRules.loanConsumptionWeight*r.consumptionPressure+bankRateRules.loanTradeWeight*r.tradeDemand),deposit=boundedRate(funding-bankRateRules.depositFundingDiscount+r.regional*.2+r.offset+.005*r.consumptionPressure+.003*r.tradeDemand,bankRateRules.depositFloor,funding+bankRateRules.depositCeilingSpread);
  result.set(id,{loan,spread:loan-deposit,funding,signal:r});
 }
 bankTargetCache.set(day,result);if(bankTargetCache.size>512)bankTargetCache.delete(bankTargetCache.keys().next().value);return result;
}
function bankingMarket(day=0){
 const quoteDay=Math.floor(Math.max(0,day));if(bankMarketCache.has(quoteDay))return bankMarketCache.get(quoteDay);
 const first=Math.max(0,quoteDay-bankRateRules.momentumDays),motors=new Map([...bankRateTargets(first)].map(([id,t])=>[id,{rate:{level:t.loan,velocity:0,acceleration:0},spread:{level:t.spread,velocity:0,acceleration:0}}]));let targets=bankRateTargets(first);
 for(let d=first+1;d<=quoteDay;d++){targets=bankRateTargets(d);for(const [id,t] of targets){const m=motors.get(id);m.rate=bankRateStep(m.rate.level,m.rate.velocity,t.loan);m.spread=bankRateStep(m.spread.level,m.spread.velocity,t.spread);}}
 const result=new Map();for(const [id,t] of targets){
  const m=motors.get(id),momentum=boundedRate(m.rate.velocity/bankRateRules.maxDailyRateChange,-1,1),creditSpread=boundedRate(m.spread.level*(1+bankRateRules.spreadMomentumWeight*momentum),bankRateRules.minimumCreditSpread,bankRateRules.maximumCreditSpread),loanAPR=quotedRate(Math.max(bankRateRules.loanFloor,m.rate.level)),depositAPR=quotedRate(Math.max(bankRateRules.depositFloor,loanAPR-creditSpread));
  result.set(id,{...t.signal,depositAPR,loanAPR,fixedAPR:quotedRate(loanAPR+t.signal.fixedPremium),fundingAPR:t.funding,creditSpread:loanAPR-depositAPR,baseCreditSpread:m.spread.level,rateVelocity:m.rate.velocity,rateAcceleration:m.rate.acceleration,rateLevel:m.rate.level,quoteDay,nextRateDay:quoteDay+1,periodDays:1});
 }
 // No instantaneous cross-branch funded carry, even when branches move differently.
 const ceiling=quotedRate(Math.min(...[...result.values()].map(r=>r.loanAPR))-bankRateRules.networkCarryBuffer);
 for(const r of result.values()){r.depositAPR=Math.min(r.depositAPR,ceiling);r.creditSpread=r.loanAPR-r.depositAPR;}
 bankMarketCache.set(quoteDay,result);if(bankMarketCache.size>8)bankMarketCache.delete(bankMarketCache.keys().next().value);return result;
}
function bankTerms(id,s){const p=port(id),day=typeof s==='number'?s:(s?.day||0);return {id,name:p.name+' Credit Cooperative',...clone(bankingMarket(day).get(id)),...(s&&typeof s==='object'?creditAssessment(s,id):{baseLimit:branchCreditBases[id],creditLimit:branchCreditBases[id]})};}
// Conversation reads existing assessments only. Wealth never purchases trust or changes a quote.
function bankConversationReception(s){
 const local=s.profile.relationships[s.location]||0,publicScore=reputationData(s.profile).score,guarded=local<=-20||publicScore<=-30;
 const text=local<=-20?(publicScore>=30?'Your wider record is good, but we still have things to put right here.':'We still have some trust to rebuild at this station.'):publicScore<=-30?(local>=20?'You’ve treated this station well, but the wider reports still make me cautious.':'The reports reaching us leave me cautious about new promises.'):local>=20?'You’ve earned a hearing at this desk.':publicScore>=30?'Your name has reached us ahead of you.':local>0||publicScore>0?'There’s the beginning of a good record to work with.':'We’re still getting to know one another.';
 return {guarded,established:!guarded&&(local>=20||publicScore>=30),text};
}
function bankConversationProfile(s){
 const b=bankOverview(s),f=financialOverview(s),rank=skillProgressForXP(s.profile.xp.diplomacy).level,starter=ships.find(v=>v.id==='kestrel').price,experience=rank>=5?'seasoned':rank>=2?'practiced':'new',r=bankConversationReception(s),guarded=r.guarded,reception=r.text;
 const reserve=b.localDeposit>=b.baseLimit*.5?'substantial':b.localDeposit>0?'local':b.totalDeposits>0?'elsewhere':'none',reserves={substantial:'The reserve you keep with us gives you room to take your time.',local:'It helps to have something kept back here.',elsewhere:'You have reserves elsewhere, though they aren’t cash at this desk.',none:'With no reserve set aside, I’d leave a little room for a delayed return.'}[reserve];
 const usage=b.localDebt/Math.max(1,Math.min(b.approvedCreditLimit,b.localDebt+b.maxBorrow)),liquid=s.credits+b.totalDeposits;
 const borrowing=b.localDebt>b.creditLimit*1.1?'The borrowing here needs attention before another promise.':b.localDebt>b.creditLimit?'This branch’s borrowing has outgrown the room available.':b.maxBorrow<1?'There is no further borrowing available here under your current assessment.':usage>=.75?'There isn’t much room left around the loan you keep here.':b.localDebt>0?'The loan you keep here makes the timing of your return worth thinking through.':s.debt>0?'Keep the repayments you owe elsewhere in view as well.':'You have no borrowing hanging over the plan.';
 const assets=f.totalAssets<s.debt?'Your commitments are running ahead of what you own.':s.debt>0&&liquid<s.debt*.1?'There’s value in your holdings, but little ready money around the borrowing.':f.netWorth>=starter*8?'You’ve built up substantial holdings; keeping them sound matters as much as adding to them.':f.netWorth>=starter*3?'There’s some real weight behind your plans now.':'You’re still building the backing for longer voyages.';
 const money=s.debt>0?borrowing:reserve!=='none'?reserves:assets;
 return {experience,guarded,reception,reserves,borrowing,assets,money};
}
// Public conditions inform short spoken hints, adapted to the captain rather than report-style figures.
function bankOutlook(s,topic='rates'){
 const t=bankTerms(s.location,s.day),previous=bankTerms(s.location,Math.max(0,t.quoteDay-1)),c=bankConversationProfile(s),direction=n=>n>1e-9?'rising':n< -1e-9?'falling':'steady',pace=direction(t.rateVelocity),speeding=t.rateVelocity*t.rateAcceleration>0,experience=c.guarded?'new':c.experience;
 if(topic==='account')return `${c.reception} ${c.reserves} ${c.borrowing} ${c.assets}`;
 if(topic==='conditions'){
  const funding=direction(t.fundingAPR-previous.fundingAPR),network=funding==='rising'?'Money’s felt a little tighter across the cooperatives lately.':funding==='falling'?'It’s been a little easier to arrange funds with the other branches.':'Things have been fairly quiet between the branches.',local=t.netBalance< -1e-6?'We depend on what comes through the docks here, so a reserve rarely sits idle for long.':t.netBalance>1e-6?'There’s plenty to send out from here; getting it to a buyer is where the money gets tied up.':'Our own production keeps fairly close to what the station needs.',reading=experience==='new'?'I’d watch the supply ships before making a long promise.':t.tradeDemand>0?'Some distant buyers still make a long voyage look tempting.':'There’s less in the distant markets to tempt a new export voyage just now.';
  return `${network} ${local} ${c.guarded?c.reception:reading} ${c.assets}`;
 }
 if(topic==='fixed'){
  const terms=experience==='new'?'A settled bill can be easier to plan around, but you pay for that certainty.':experience==='practiced'?'You know the trade: room to follow the market, or a settled bill at a price.':'You’ve bargained enough to weigh the price of certainty against the freedom to wait.',reading=pace==='rising'?'With money getting dearer, I can see why you’d ask.':pace==='falling'?'While money is getting easier, I’d think carefully about tying your hands.':'With the desk fairly settled, I’d start with how long you expect to be away.';
  return `${terms} ${reading} ${c.guarded?c.reception:c.money} Anything you’ve already signed stays on its agreed terms.`;
 }
 const steady={new:'It feels fairly settled at the moment.',practiced:'There’s little movement at the desk just now.',seasoned:'I don’t see much conviction in either direction just now.'};
 const rise={new:'Money has been getting dearer',practiced:'Borrowing is still getting dearer',seasoned:'Borrowing is getting dearer; I’d be watching the shape of that climb'},fall={new:'Borrowing has been getting easier',practiced:'Borrowing is still getting easier',seasoned:'Borrowing is getting easier; I’d be watching how much life is left in that easing'};
 const ending=Math.abs(t.rateAcceleration)<1e-9?'at much the same pace.':speeding?'and that feeling has grown stronger lately.':'though the change feels less insistent than it did.';
 const hint=pace==='steady'?steady[experience]:`${(pace==='rising'?rise:fall)[experience]}, ${ending}`;
 return `${hint} ${c.money} ${c.reception}`;
}
function loanRate(loan,day){return loan.rateMode==='floating'?bankTerms(loan.port,day).loanAPR:loan.apr;}
const bankGrowthCache=new Map();
function bankGrowth(start,end){
 const key=start+':'+end;if(bankGrowthCache.has(key))return bankGrowthCache.get(key);
 const sums=new Map(world.ports.map(p=>[p.id,{deposit:0,loan:0}]));
 for(let from=start;from<end;){const to=Math.min(end,Math.floor(from)+1),rates=bankingMarket(from);for(const [id,v] of sums){const r=rates.get(id);v.deposit+=Math.log1p(r.depositAPR)*(to-from)/365.25;v.loan+=Math.log1p(r.loanAPR)*(to-from)/365.25;}from=to;}
 const result=new Map([...sums].map(([id,v])=>[id,{deposit:Math.exp(v.deposit),loan:Math.exp(v.loan)}]));bankGrowthCache.set(key,result);if(bankGrowthCache.size>8)bankGrowthCache.delete(bankGrowthCache.keys().next().value);return result;
}
function bankInterestFactor(pid,start,end,fixedAPR){return fixedAPR!==undefined?(1+fixedAPR)**((end-start)/365.25):bankGrowth(start,end).get(pid).deposit;}
function loanInterestFactor(loan,start,end){return loan.rateMode==='floating'?bankGrowth(start,end).get(loan.port).loan:bankInterestFactor(loan.port,start,end,loan.apr);}
function drawBankCredit(s,pid,amount,mode='floating'){
 const terms=bankTerms(pid,s),b=s.bank,id=pid+'-'+mode+(mode==='fixed'?'-'+Math.floor(s.day/30)+'-q'+Math.round(terms.fixedAPR*10000)+'-'+Math.round(terms.fixedPremium*10000):'');
 let loan=b.loans.find(l=>l.id===id);if(!loan){check(b.loans.length<1024,'Repay an existing loan before opening another agreement.');loan={id,port:pid,balance:0,rateMode:mode,apr:mode==='fixed'?terms.fixedAPR:terms.loanAPR,openedDay:s.day,...(mode==='fixed'?{marketAPR:terms.loanAPR,fixedPremium:terms.fixedPremium}:{})};b.loans.push(loan);}loan.balance+=amount;return loan;
}
function syncDebt(s){s.debt=Math.ceil(Math.max(0,s.bank.legacyDebt+s.bank.loans.reduce((a,l)=>a+l.balance,0)-1e-8));}
function validateBank(s){
 if(s.bank===undefined)return;const b=s.bank;check(b&&typeof b==='object'&&!Array.isArray(b)&&finite(b.legacyDebt,0,999999999)&&b.deposits&&typeof b.deposits==='object'&&!Array.isArray(b.deposits)&&Object.keys(b.deposits).length<=world.ports.length&&Object.entries(b.deposits).every(([id,value])=>world.ports.some(p=>p.id===id)&&finite(value,0,999999999)),'Invalid bank deposits.');
 check(Array.isArray(b.loans)&&b.loans.length<=1024&&new Set(b.loans.map(l=>l.id||l.port)).size===b.loans.length&&b.loans.every(l=>world.ports.some(p=>p.id===l.port)&&finite(l.balance,0,999999999)&&finite(l.apr,.01,.3)&&(l.rateMode===undefined||(l.rateMode==='floating'||l.rateMode==='fixed')&&(l.id===l.port+'-'+l.rateMode+(l.rateMode==='fixed'?'-'+Math.floor(l.openedDay/30):'')||l.rateMode==='fixed'&&l.id===l.port+'-fixed-'+Math.floor(l.openedDay/30)+'-q'+Math.round(l.apr*10000)+'-'+Math.round(l.fixedPremium*10000))&&integer(l.openedDay,0,s.day)&&(l.rateMode!=='fixed'||finite(l.marketAPR,.01,.3)&&finite(l.fixedPremium,.015,.03)&&Math.abs(l.apr-l.marketAPR-l.fixedPremium)<1e-8))),'Invalid bank loans.');check(Math.ceil(Math.max(0,b.legacyDebt+b.loans.reduce((a,l)=>a+l.balance,0)-1e-8))===s.debt,'Bank debts do not match the account total.');
}
function branchDebt(s,pid=s.location){const b=s.bank;return (b?.loans.filter(l=>l.port===pid).reduce((n,l)=>n+l.balance,0)||0)+(pid==='earth'?(b?.legacyDebt??s.debt):0);}
// A shared assessment prevents the same equity from being pledged independently at every bank.
// Keep this separate from branch enforcement and financialOverview to avoid recursive valuations.
function creditPortfolio(s){
 let hullValue=0,equipment=0,aboardCargo=0,warehouseCargo=0;const vessels=[],liquidated=new Map();
 const bulkValue=(pid,id,n)=>{if(n<=0)return 0;const key=pid+':'+id,prior=liquidated.get(key)||0,local={...s,location:pid},take=Math.max(0,Math.min(n,marketStock(s,id,pid,false).buyerAllowance-prior));liquidated.set(key,prior+take);return tradeTotal(local,id,Math.min(MAX_FLEET*MAX_CARGO_LOTS,prior+take),false)-tradeTotal(local,id,Math.min(MAX_FLEET*MAX_CARGO_LOTS,prior),false);};
 for(const v of [...(s.fleetLoss?[]:[activeHull(s)]),...s.fleet]){
  if(v.hull<=0)continue;
  const hull=Math.floor(ship(v).price*.75*v.hull/100),fittings=Math.floor(equipmentValue(v)*.5),cargo=goods.reduce((n,g)=>n+bulkValue(v.location,g.id,Math.max(0,(v.cargo[g.id]||0)-freightUnits(v,g.id))),0);
  hullValue+=hull;equipment+=fittings;aboardCargo+=cargo;vessels.push({id:v.id,name:v.name,port:v.location,flagship:v.id===s.flagshipID,berth:!v.escort&&v.id!==s.flagshipID,hull,fittings,cargo,total:hull+fittings+cargo});
 }
 const warehouses=[];for(const [pid,w] of Object.entries(s.warehouses||{})){
  const cargo=goods.reduce((n,g)=>n+bulkValue(pid,g.id,w.cargo[g.id]||0),0);warehouseCargo+=cargo;warehouses.push({port:pid,cargo});
 }
 const deposits=Object.values(s.bank?.deposits||{}).reduce((n,v)=>n+v,0),totalDebt=s.debt,totalAssets=s.credits+deposits+hullValue+equipment+aboardCargo+warehouseCargo,netEquity=Math.max(0,totalAssets-totalDebt);
 const earnedRanks=Object.keys(skillNames).reduce((n,k)=>n+skillProgressForXP(s.profile.xp[k]).level,0),recordFactor=1+Math.max(0,earnedRanks-1)*.1,standingFactor=Math.max(.3,1+reputationData(s.profile).score*.003);
 // Finance recoverable assets, then deduct outstanding debt once. Net equity is a
 // useful account total, but haircutting it before deducting debt again starved fleets of credit.
 // Borrowed cash/deposits cannot support another loan: borrowing or moving money
 // between accounts leaves unborrowedLiquidity and this lending ceiling unchanged.
 const unsecuredLimit=Math.max(1000,Math.round(branchCreditBases.earth*recordFactor*standingFactor/100)*100),hullAdvanceRate=.65,cargoAdvanceRate=.5,liquidAdvanceRate=.5;
 const unborrowedLiquidity=Math.max(0,s.credits+deposits-totalDebt),hullSupport=Math.floor((hullValue+equipment)*hullAdvanceRate),cargoSupport=Math.floor((aboardCargo+warehouseCargo)*cargoAdvanceRate),liquidSupport=Math.floor(unborrowedLiquidity*liquidAdvanceRate),equitySupport=hullSupport+cargoSupport+liquidSupport,assetLimit=Math.min(999999999,unsecuredLimit+equitySupport),career=s.tradeCareer,provenProfit=Math.max(0,career?.netOperating||0),seasoning=Math.min(1,Math.max(0,((career?.profitableVoyages||0)+(career?.legacyVoyages??(career?0:s.profile.stats.voyages))-tradeWorkRules.seasoningStarts)/tradeWorkRules.seasoningVoyages)),emergencyLimit=STARTER_LOAN+tradeWorkRules.emergencyCredit,expansionLimit=emergencyLimit+provenProfit*tradeWorkRules.profitAdvance*seasoning+Math.min(career?.repaid||0,provenProfit)*tradeWorkRules.repaymentAdvance*seasoning+Math.max(0,assetLimit-emergencyLimit)*seasoning,networkLimit=Math.min(assetLimit,Math.floor(expansionLimit)),networkHeadroom=Math.max(0,Math.floor(networkLimit-totalDebt+1e-8));
 return {hullValue,equipmentValue:equipment,aboardCargo,warehouseCargo,cash:s.credits,deposits,totalAssets,totalDebt,netEquity,hullAdvanceRate,cargoAdvanceRate,liquidAdvanceRate,unborrowedLiquidity,hullSupport,cargoSupport,liquidSupport,equitySupport,unsecuredLimit,assetLimit,emergencyLimit,expansionLimit,seasoning,provenProfit,networkLimit,networkHeadroom,vessels,warehouses};
}
function bankOverview(s){const terms=bankTerms(s.location,s),bank=s.bank||{deposits:{},loans:[],legacyDebt:s.debt},localDeposit=bank.deposits[s.location]||0,localDebt=branchDebt(s),portfolio=creditPortfolio(s),branchHeadroom=Math.max(0,Math.floor(terms.creditLimit-localDebt+1e-8)),remainingCredit=Math.min(branchHeadroom,portfolio.networkHeadroom),cashHeadroom=999999999-s.credits;return {...terms,portfolio,branchHeadroom,localDebt,overLimit:Math.max(0,localDebt-terms.creditLimit),seizureThreshold:terms.creditLimit*1.1,collectionTarget:terms.creditLimit-1,localDeposit,maxDeposit:Math.min(s.credits,Math.floor(999999999-localDeposit)),maxWithdraw:Math.min(Math.floor(localDeposit+1e-8),cashHeadroom),maxBorrow:Math.min(remainingCredit,cashHeadroom,999999999-s.debt),maxRepayLocal:Math.min(s.credits,Math.ceil(Math.max(0,localDebt-1e-8))),totalDeposits:Object.values(bank.deposits).reduce((a,b)=>a+b,0),legacyDebt:bank.legacyDebt,loans:bank.loans.map(l=>({...clone(l),apr:loanRate(l,s.day)})),accounts:Object.entries(bank.deposits).filter(([,balance])=>balance>0).map(([id,balance])=>({...bankTerms(id,s),balance,body:port(id).body,local:id===s.location})),remainingCredit,approvedCreditLimit:Math.max(0,Math.floor(Math.min(terms.creditLimit,localDebt+remainingCredit)+1e-8)),collections:(s.debtCollections||[]).filter(r=>r.port===s.location).slice(-4)};}
function bankAction(s,type,amount,rateMode='floating'){
 check(integer(amount,1,999999999),'Enter a whole-credit amount greater than zero.');check(['floating','fixed'].includes(rateMode),'Choose floating or fixed interest.');const terms=bankTerms(s.location,s);if(['borrow','repay','repay-local'].includes(type)){const r=tradeCareer(s);r.repaymentFloor??=s.debt;}if(!s.bank)s.bank={deposits:{},loans:[],legacyDebt:s.debt};const b=s.bank;
 if(type==='deposit'){check(amount<=s.credits,'Not enough cash for that deposit.');s.credits-=amount;b.deposits[s.location]=(b.deposits[s.location]||0)+amount;}
 else if(type==='withdraw'){check(amount<=Math.floor((b.deposits[s.location]||0)+1e-8),'Only deposits held at this station can be withdrawn here.');b.deposits[s.location]=Math.max(0,b.deposits[s.location]-amount);s.credits+=amount;}
 else if(type==='borrow'){check(branchDebt(s)+amount<=terms.creditLimit+1e-8,`This bank’s current borrowing limit is ${terms.creditLimit.toLocaleString('en-US')} cr, including any Earth charter balance owed here.`);const approved=bankOverview(s).maxBorrow;check(amount<=approved,`Your shared credit review allows ${approved.toLocaleString('en-US')} cr of new borrowing here after all outstanding balances and estimated recoverable assets.`);check(b.loans.length<998||b.loans.some(l=>l.id===s.location+'-'+rateMode+(rateMode==='fixed'?'-'+Math.floor(s.day/30):'')),'Repay an existing loan before opening another agreement.');drawBankCredit(s,s.location,amount,rateMode);s.credits+=amount;syncDebt(s);}
 else if(type==='repay-local'){check(amount<=s.credits&&amount<=Math.ceil(branchDebt(s)-1e-8),'Repayment exceeds your cash or this bank’s balance.');const paid=payBranchDebt(s,s.location,amount);s.credits-=amount;record(s,`Repaid ${amount} cr to ${terms.name}; ${paid.toFixed(2)} cr accrued balance settled.`);return;}
 else {check(amount<=s.credits&&amount<=s.debt,'Repayment exceeds your cash or debt.');let left=amount;const loans=[...b.loans.map(l=>({loan:l,apr:loanRate(l,s.day)})),{loan:null,apr:.04}].sort((a,b)=>b.apr-a.apr);for(const row of loans){const balance=row.loan?row.loan.balance:b.legacyDebt,paid=Math.min(left,balance);if(row.loan)row.loan.balance=Math.max(0,row.loan.balance-paid);else b.legacyDebt=Math.max(0,b.legacyDebt-paid);left-=paid;}s.credits-=amount;syncDebt(s);b.loans=b.loans.filter(l=>l.balance>1e-8);}
 record(s,`${type==='deposit'?'Deposited':type==='withdraw'?'Withdrew':type==='borrow'?'Borrowed':'Repaid'} ${amount} cr at ${port(s.location).name}${type==='borrow'?' · '+rateMode+' '+((rateMode==='fixed'?terms.fixedAPR:terms.loanAPR)*100).toFixed(2)+'% annual interest'+(rateMode==='fixed'?' (market '+(terms.loanAPR*100).toFixed(2)+'% + '+(terms.fixedPremium*100).toFixed(2)+' percentage points, locked for this draw)':' (adjusts daily)'):''}.`);
}
function bankerTransactionReply(before,s,type){
 const host=stationContacts(s.location,'bank',s).find(h=>!h.contactID);if(!host)return;
 const text=dialogueVoices.bankReaction(before,s,type,host);if(!text)return;
 speak(s,host.person,text);Object.assign(s.dialogue.at(-1),{venue:'bank',contact:'',partner:host.person,service:'bank'});
}
function merchantExposure(s){
 const pool=fleetOverview(s),value=goods.reduce((n,g)=>n+fleetQuantity(s,g.id)*marketState(s,g.id).sell,0)+contrabandGoods.reduce((n,g)=>n+fleetQuantity(s,g.id)*g.base,0),defense=fleetMembers(s).reduce((n,v)=>n+Math.max(0,combatPower(v)),0),escorts=Math.max(0,fleetMembers(s).length-1),mitigation=Math.min(.6,escorts*.1+Math.log1p(defense)*.035),threat=Math.max(.7,Math.min(1.6,1+port(s.location).au*.012)),fraction=.06*threat*(1-mitigation),fee=Math.min(999999999,Math.ceil(180+value*fraction));
 return {cargoValue:value,fee,fraction,mitigation,escorts};
}
function pirateFee(s){return merchantExposure(s).fee;}
function evasionFuel(s){return fleetManeuverFuel(s,.25);}
function canEvade(s){return fleetOverview(s).fuel+1e-8>=evasionFuel(s);}
// Per-hull equipment and a fleet of locally berthed or traveling escort ships.
const upgradeCatalog=shipSpecs.fittings.map(m=>({...m,costs:fittingCosts('kestrel',m.id)}));
// Station facilities are world data, never inferred from a captain's saved access.
const supplierCatalog={
 earth:[['kestrel','swift','peregrine','osprey'],['armor','drive','tank','cargo','sensors','laser','weapons']],
 moon:[['kestrel','petrel','heron'],['drive','tank','cargo','sensors','laser']],
 mars:[['peregrine','tern','swift','curlew'],['armor','drive','tank','cargo','sensors','laser']],
 phobos:[[],['armor','sensors','laser','weapons']],
 ceres:[['cormorant','peregrine','pelican','sanderling','rook','gannet'],['armor','drive','tank','cargo','sensors','laser','weapons']],
 callisto:[['petrel','albatross','gannet','osprey','rook','crane'],['armor','drive','tank','cargo','sensors','laser','weapons']],
 titan:[['tern','petrel','pelican','curlew'],['armor','drive','tank','cargo','sensors','laser']],
 mercury:[[],['drive','tank','sensors','laser']],
 venus:[[],['drive','sensors','laser']],
 'earth-high':[['kestrel','swift','peregrine','osprey','heron','merlin','ibis'],['armor','drive','tank','cargo','sensors','laser','weapons']],
 deimos:[[],['drive','tank','cargo']],
 jupiter:[[],['sensors','laser']],
 io:[[],['armor','sensors','laser','weapons']],
 europa:[[],['drive','sensors','laser']],
 ganymede:[['tern','peregrine','heron','kestrel'],['armor','drive','tank','cargo','sensors','laser']],
 saturn:[['curlew','petrel','albatross','tern'],['armor','drive','tank','cargo','sensors','laser','weapons']],
 enceladus:[[],['drive','sensors','laser']],
 rhea:[[],['armor','tank','cargo','laser','weapons']],
 iapetus:[['gyrfalcon','gannet','crane','nightjar','condor'],['armor','drive','tank','cargo','sensors','laser','weapons']],
 uranus:[[],['drive','tank','sensors','laser']],
 miranda:[[],['drive','cargo']],
 ariel:[[],['drive','tank','sensors']],
 titania:[['peregrine','petrel','heron','swift'],['drive','tank','cargo','sensors','laser']],
 oberon:[['cormorant','albatross','pelican','crane'],['armor','drive','tank','cargo']],
 neptune:[['heron','petrel','albatross','gyrfalcon'],['armor','drive','tank','cargo','sensors','laser','weapons']],
 triton:[[],['drive','sensors','laser']]
};
function hullFuelCost(s,v,tonnes){const discount=v.shipID==='petrel'&&v.hull>=50&&fleetMembers(s).some(h=>actorID(s,h)===actorID(s,v))&&['callisto','rhea','ceres','earth-high'].includes(s.location)?.08:0;return Math.ceil(Math.max(0,tonnes*port(s.location).fuelPrice*(1-discount)-1e-8));}
function fleetFuelCost(s,target){const p=fleetOverview(s),amount=Math.max(0,target-p.fuel);let remaining=amount,cost=0;for(const v of fleetMembers(s).filter(v=>v.shipID==='petrel')){const n=Math.min(remaining,Math.max(0,target*effectiveShip(v).tankTonnes/p.tankTonnes-v.fuel));cost+=hullFuelCost(s,v,n);remaining-=n;}return cost+fuelCost(remaining,s.location);}
function fuelCost(tonnes,pid){return Math.ceil(Math.max(0,tonnes*port(pid).fuelPrice-1e-8));}
supplierCatalog.ganymede[0].push('ibis');supplierCatalog.neptune[0].push('nightjar','condor');
for(const [pid,[hulls,modules]] of Object.entries(supplierCatalog))if(modules.includes('weapons'))modules.push('shield','ordnance');
function portFacilities(pid){const p=port(pid),[hulls,modules]=supplierCatalog[pid],heavy=['earth-high','ceres','callisto','iapetus','neptune'].includes(pid),ammoTypes=modules.includes('weapons')?['coil','cannon','missile',...(heavy?['rail','torpedo']:[])]:[];return {port:pid,name:p.name,body:p.body,spaceport:hulls.length>0,fuel:true,ships:[...hulls],upgrades:hulls.length?[...modules]:[],dockModules:[...modules],ammo:modules.includes('weapons')?['weapons','ordnance']:[],ammoTypes};}
function supplierDirectory(s){return world.ports.filter(p=>!s||p.id===s.location||s.visited.includes(p.id)).map(p=>{const f=portFacilities(p.id);return s?{...f,stockKnown:p.id===s.location,ships:p.id===s.location?shipMarket(s,p.id).ships:[]}:f;});}
// Each class has a fixed production cycle; browsing never consumes encounter RNG.
const LEGACY_SHIP_STOCK_DAYS=30;
const shipExperience={swift:0,kestrel:0,osprey:140,heron:160,peregrine:180,petrel:240,merlin:260,tern:320,curlew:420,cormorant:500,sanderling:650,gannet:800,rook:900,ibis:1050,albatross:1200,gyrfalcon:1300,crane:1600,pelican:1800,nightjar:1900,condor:2400};
function shipRestockDays(id){check(Object.hasOwn(shipExperience,id),'Choose a ship class.');const xp=shipExperience[id];return xp===0?60:xp<=160?90:xp<=420?120:xp<=1050?180:xp<=1900?240:360;}
function earnedShipExperience(s){return Object.keys(skillNames).reduce((n,key)=>n+s.profile.xp[key],0);}
function shipStockBatch(s,pid,id,cycle){
 const h=ships.find(h=>h.id===id),starter=['earth','earth-high','moon'].includes(pid)&&['swift','kestrel'].includes(id),chance=starter||['heron','peregrine'].includes(id)?1:id==='condor'?.32:h.price>=1000000?.44:h.price>=400000?.58:h.price>=120000?.72:.86;
 const draw=hash('registry-stock-v1:'+String(s.castSeed||'legacy')+':'+pid+':'+cycle+':'+id);
 return Number(draw%1000000n)/1000000<chance?(starter?4:h.price>=900000?1+Number(draw/1000003n%2n):2+Number(draw/1000003n%2n)):0;
}
function stockPurchases(s,pid,id,cycle){
 const stock=s.shipyardStock,key=pid+':'+id;if(!stock)return 0;
 if(stock.version===1)return Math.floor(stock.cycle*LEGACY_SHIP_STOCK_DAYS/shipRestockDays(id))===cycle?(stock.bought[key]||0):0;
 const entry=stock.purchases[key];return entry?.cycle===cycle?entry.bought:0;
}
function shipMarket(s,pid=s.location){
 const f=portFacilities(pid),experience=earnedShipExperience(s),qualified=f.ships.filter(id=>experience>=shipExperience[id]);
 const batches=qualified.map(id=>{const stockDays=shipRestockDays(id),cycle=Math.floor(s.day/stockDays);return {id,cycle,stockDays,restockDay:(cycle+1)*stockDays,remaining:Math.max(0,shipStockBatch(s,pid,id,cycle)-stockPurchases(s,pid,id,cycle))};});
 const reserved=s.shipReservation;if(reserved?.port===pid&&s.day>=reserved.readyDay){const batch=batches.find(o=>o.id===reserved.ship);if(batch){batch.reserved=true;batch.remaining=Math.max(1,batch.remaining);}}const offers=batches.filter(o=>o.remaining>0);
 return {port:pid,spaceport:f.spaceport,cycle:Math.floor(s.day/shipRestockDays('kestrel')),experience,stockDays:shipRestockDays('kestrel'),restockDay:batches.length?Math.min(...batches.map(o=>o.restockDay)):null,ships:offers.map(o=>o.id),offers};
}
function claimShipStock(s,id){
 const offer=shipMarket(s).offers.find(o=>o.id===id);check(offer,'This ship is not currently offered by this registry.');
 if(s.shipyardStock?.version!==2){const old=s.shipyardStock,purchases={};if(old)for(const [key,bought] of Object.entries(old.bought)){const shipID=key.split(':')[1];purchases[key]={cycle:Math.floor(old.cycle*LEGACY_SHIP_STOCK_DAYS/shipRestockDays(shipID)),bought};}s.shipyardStock={version:2,purchases};}
 const held=s.shipReservation;if(held?.port===s.location&&held.ship===id&&s.day>=held.readyDay){delete s.shipReservation;if(held.readyDay<offer.cycle*offer.stockDays)return;}const key=s.location+':'+id,previous=s.shipyardStock.purchases[key];s.shipyardStock.purchases[key]={cycle:offer.cycle,bought:(previous?.cycle===offer.cycle?previous.bought:0)+1};
}
function shipReservations(s,pid=s.location){const order=s.shipReservation;return portFacilities(pid).ships.filter(id=>['kestrel','swift','heron','peregrine'].includes(id)&&earnedShipExperience(s)>=shipExperience[id]).map(id=>{const stockDays=shipRestockDays(id),held=order?.port===pid&&order.ship===id?order:null;return {id,price:ships.find(h=>h.id===id).price,order:held,ready:!!held&&s.day>=held.readyDay,readyDay:held?.readyDay??(Math.floor(s.day/stockDays)+1)*stockDays,canReserve:!order&&!shipMarket(s,pid).ships.includes(id)};});}
function shipReservationAction(s,type,arg){if(type==='ship-order-cancel'){check(s.shipReservation,'No hull is reserved.');const r=s.shipReservation;delete s.shipReservation;record(s,'Cancelled the '+ships.find(h=>h.id===r.ship).name+' hull reservation at '+port(r.port).name+'. No payment or refund.');return;}check(!s.shipReservation,'Collect or cancel your existing hull reservation first.');const offer=shipReservations(s).find(r=>r.id===arg.ship);check(offer?.canReserve,'Only a qualified, out-of-stock basic hull may be reserved at its supplying registry.');s.shipReservation={port:s.location,ship:offer.id,placedDay:s.day,readyDay:offer.readyDay};record(s,'Reserved '+ships.find(h=>h.id===offer.id).name+' at '+port(s.location).name+' for delivery on day '+offer.readyDay+'. No deposit; full catalogue price is due at collection.');}
function validateShipStock(s){
 const order=s.shipReservation;if(order!==undefined)check(order&&portFacilities(order.port).ships.includes(order.ship)&&['kestrel','swift','heron','peregrine'].includes(order.ship)&&integer(order.placedDay,0,s.day)&&order.readyDay===(Math.floor(order.placedDay/shipRestockDays(order.ship))+1)*shipRestockDays(order.ship),'Invalid ship reservation.');
 const stock=s.shipyardStock;if(stock===undefined)return;
 const validKey=key=>{const [pid,id,...extra]=key.split(':');return !extra.length&&world.ports.some(p=>p.id===pid)&&portFacilities(pid).ships.includes(id);};
 check(stock&&[1,2].includes(stock.version),'Invalid fleet-registry stock record.');
 if(stock.version===1){check(integer(stock.cycle,0,Math.floor(s.day/LEGACY_SHIP_STOCK_DAYS))&&stock.bought&&typeof stock.bought==='object'&&!Array.isArray(stock.bought)&&Object.keys(stock.bought).length<=world.ports.length*ships.length,'Invalid fleet-registry stock record.');check(Object.entries(stock.bought).every(([key,n])=>validKey(key)&&integer(n,1,4)),'Invalid fleet-registry purchase quantity.');}
 else{check(stock.purchases&&typeof stock.purchases==='object'&&!Array.isArray(stock.purchases)&&Object.keys(stock.purchases).length<=world.ports.length*ships.length,'Invalid class-specific stock record.');check(Object.entries(stock.purchases).every(([key,r])=>validKey(key)&&r&&typeof r==='object'&&!Array.isArray(r)&&integer(r.cycle,0,Math.floor(s.day/shipRestockDays(key.split(':')[1])))&&integer(r.bought,1,4)),'Invalid class-specific purchase quantity.');}
}
function requireShipSupplier(s,id){check(shipMarket(s).ships.includes(id),'This ship is not currently offered by this registry.');}

const emptyUpgrades=()=>Object.fromEntries(upgradeCatalog.map(u=>[u.id,0]));
function initFleet(s){s.version=3;s.flagshipID='flagship-001';s.shipName=shipNames.generate(s.shipID,s.castSeed+':'+s.flagshipID);s.shipNamesEdition=1;s.upgrades=emptyUpgrades();s.ammo=0;s.ordnanceAmmo=0;s.fittingEdition=2;s.fleet=[];s.completedRaids=[];s.battle=null;s.battleHistory=[];Object.assign(s.profile.stats,{battles:0,victories:0,raids:0});return s;}
function legacyLaserPower(v){return ({kestrel:8,peregrine:9,albatross:10,osprey:11,petrel:8,gannet:12,swift:7,heron:8,tern:9,cormorant:10,pelican:10,gyrfalcon:16}[v.shipID]||8)+(v.upgrades.laser||0)*6;}
function legacyCombatPower(v){return ({kestrel:10,peregrine:11,albatross:12,osprey:14,petrel:10,gannet:18,swift:9,heron:10,tern:11,cormorant:14,pelican:13,gyrfalcon:24}[v.shipID]||10)+v.upgrades.weapons*10;}
function legacyEffectiveShip(v){const base=ships.find(x=>x.id===v.shipID);if(!base)return null;const u=v.upgrades||emptyUpgrades();return {...base,cargoM3:base.cargoM3*(1+.1*u.cargo),cargoTonnes:Math.floor(base.cargoTonnes*4*(1+.1*u.cargo))*.25,tankTonnes:base.tankTonnes*(1+.15*u.tank),isp:base.isp*(1+.025*u.drive),dryMass:base.dryMass*(1+.06*u.armor+.01*u.drive+.02*u.tank+.03*u.cargo)+.1*u.sensors+.4*u.weapons+.25*(u.laser||0)+(v.ammo||0)*.015};}
function laserPower(v){return shipRules.weaponFits(v)[0].bank;}
function combatPower(v){return shipRules.weaponFits(v)[1].bank;}
function effectiveShip(v){const base=ships.find(h=>h.id===v.shipID),sh=v.fittingEdition===2?shipRules.effectiveShip(v,base):legacyEffectiveShip(v);return {...sh,cargoM3:Math.max(0,(sh.cargoM3??cargoSpecs.holds[v.shipID].m3*(1+.1*(v.upgrades?.cargo||0)))-specialVolume(v)),cargoTonnes:Math.max(0,sh.cargoTonnes-(v.oreUnits||0)*.25-Math.ceil(missionHold(v)*4-1e-8)*.25),dryMass:sh.dryMass+(v.spares||0)*.05+(v.oreUnits||0)*.25+(v.passengers?.count||0)*.1+(v.carrierMass||0)+(v.towMass||0)+(v.contractTow?.mass||0)+missionMass(v),tankTonnes:Math.max(0,sh.tankTonnes-missionFuel(v))};}
function equipmentValue(v){return upgradeCatalog.reduce((total,u)=>total+fittingCosts(v.shipID,u.id).slice(0,v.upgrades[u.id]||0).reduce((a,b)=>a+b,0),0);}
// Registry bids use the established liquidation model; asking prices include every fitted level.
// Sold hulls are physical, station-local stock, separate from replenishing factory batches.
const MAX_REGISTRY_SHIPS=2048;
const registryPriceHistory=Object.freeze({peregrine:Object.freeze([180000])});
const registryHistoricalRules=new Map();
function registryValueAtPrice(v,hull){
 const current=ships.find(h=>h.id===v.shipID).price;
 let rules=shipRules;
 if(hull!==current){check(registryPriceHistory[v.shipID]?.includes(hull),'Unknown registry catalogue price.');const key=v.shipID+':'+hull;if(!registryHistoricalRules.has(key))registryHistoricalRules.set(key,shipRulesFactory.forHulls(ships.map(h=>h.id===v.shipID?{...h,price:hull}:h)));rules=registryHistoricalRules.get(key);}
 const equipment=upgradeCatalog.reduce((n,u)=>n+rules.fittingCosts(v.shipID,u.id).slice(0,v.upgrades[u.id]||0).reduce((a,b)=>a+b,0),0)+(v.duty?Math.ceil(hull*.03):0);
 return {hull,equipment,fullPrice:hull+equipment,hullCredit:Math.floor(hull*.75*v.hull/100),equipmentCredit:Math.floor(equipment*.5),salePrice:Math.floor(hull*.75*v.hull/100)+Math.floor(equipment*.5)};
}
function registryValue(v){return registryValueAtPrice(v,ships.find(h=>h.id===v.shipID).price);}
function registrySale(s,id){
 const v=id===s.flagshipID?activeHull(s):s.fleet.find(v=>v.id===id),value=v?registryValue(v):null;
 const reason=!v?'This ship is no longer owned.':!s.profile.created?'Sign your captain charter first.':s.fleetLoss?'Recover command of a surviving ship first.':s.incident||s.battle?'Resolve the encounter before selling a ship.':!portFacilities(s.location).spaceport?'Ship sales require a fleet registry.':v.location!==s.location?'Travel to this ship’s station before selling it.':id===s.flagshipID?'Take command of another local ship before selling your flagship.':v.carrierID||v.towID||v.carrierMass||v.towMass||s.fleet.some(x=>x.carrierID===id||x.towID===id)?'Deploy carried craft and detach tows before selling this ship.':(s.campaign?.jobs||[]).some(j=>j.status==='active'&&(j.assigned===id||Object.values(j.bindings||{}).includes(id)))||[s,...s.fleet,...Object.values(s.warehouses||{})].some(x=>(x.missionCargo||[]).some(l=>l.kind==='component'&&l.component?.target===id))||v.passengers||v.contractTow||v.oreUnits||used(v)>0||(v.missionCargo||[]).length||freightManifests(v).some(l=>l.units>0)?'Clear this ship’s cargo, passengers and assignments before selling it.':v.hull<=0?'A destroyed ship cannot be sold.':(s.registryShips||[]).length>=MAX_REGISTRY_SHIPS?'The registries cannot accept another stored hull until one is purchased.':s.credits+value.salePrice>999999999?'Deposit cash before receiving the sale proceeds.':'';
 return {id,vessel:v?clone(v):null,...value,canSell:!reason,reason};
}
function registryShips(s,pid=s.location){
 return (s.registryShips||[]).filter(r=>r.vessel.location===pid).map(r=>{
 const reason=pid!==s.location?'Travel to this registry to purchase the ship.':!s.profile.created?'Sign your captain charter first.':s.fleetLoss?'Recover command of a surviving ship first.':s.incident||s.battle?'Resolve the encounter before buying a ship.':!portFacilities(pid).spaceport?'This station has no fleet registry.':earnedShipExperience(s)<shipExperience[r.vessel.shipID]?'More flight experience is needed for this ship class.':s.fleet.length>=MAX_FLEET-1?`Your registry supports up to ${MAX_FLEET} ships.`:s.credits<r.price?'Not enough available funds for this ship.':'';
 return {...clone(r),id:r.vessel.id,canBuy:!reason,reason};
 });
}
function registryHull(v){
 return Object.fromEntries(['id','name','shipID','location','hull','fuel','spares','cargo','cargoBasis','upgrades','ammo','ordnanceAmmo','fittingEdition','cargoPackingEdition','legacyCargo','escort','duty'].filter(k=>v[k]!==undefined).map(k=>[k,clone(v[k])]));
}
function validateRegistryShips(s){
 if(s.registryShips===undefined)return;
 check(Array.isArray(s.registryShips)&&s.registryShips.length<=MAX_REGISTRY_SHIPS,'Invalid registry ship inventory.');
 const ids=new Set([s.flagshipID,...s.fleet.map(v=>v.id)]),allowed=['id','name','shipID','location','hull','fuel','spares','cargo','cargoBasis','upgrades','ammo','ordnanceAmmo','fittingEdition','cargoPackingEdition','legacyCargo','escort','duty'];
 for(const r of s.registryShips){
 const v=r?.vessel;
 check(r&&Object.keys(r).every(k=>['vessel','price','proceeds','day','cataloguePrice'].includes(k))&&v&&Object.keys(v).every(k=>allowed.includes(k))&&typeof v.id==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(v.id)&&!ids.has(v.id)&&str(v.name,60)&&v.name.length>0&&ships.some(h=>h.id===v.shipID)&&world.ports.some(p=>p.id===v.location&&portFacilities(p.id).spaceport)&&v.escort===false,'Invalid registered hull.');ids.add(v.id);
 check(v.upgrades&&typeof v.upgrades==='object'&&!Array.isArray(v.upgrades)&&Object.keys(v.upgrades).every(k=>upgradeCatalog.some(m=>m.id===k))&&upgradeCatalog.every(m=>integer(['laser','shield','ordnance'].includes(m.id)?v.upgrades[m.id]??0:v.upgrades[m.id],0,3)),'Invalid registered fittings.');
 check(v.cargo&&typeof v.cargo==='object'&&!Array.isArray(v.cargo)&&Object.keys(v.cargo).length===0&&v.cargoBasis&&typeof v.cargoBasis==='object'&&!Array.isArray(v.cargoBasis)&&Object.keys(v.cargoBasis).length===0,'Registered ships must have empty holds.');
 const sh=effectiveShip(v);
 check(integer(v.hull,1,100)&&finite(v.fuel,0,sh.tankTonnes+.001)&&integer(v.spares,0,sh.maxSpares)&&[1,2].includes(v.fittingEdition)&&integer(v.ammo,0,v.fittingEdition===2?shipRules.weaponFits(v)[1].magazine:192)&&integer(v.ordnanceAmmo,0,32)&&(v.fittingEdition!==2||shipRules.cargoAllocation(v).loadoutFits&&v.ordnanceAmmo<=shipRules.weaponFits(v)[2].magazine),'Invalid registered stores.');
 check(v.duty===undefined||v.shipID==='osprey'&&v.duty==='thermal'||v.shipID==='gannet'&&v.duty==='interception','Invalid registered specialization.');
 const current=ships.find(h=>h.id===v.shipID).price,prices=r.cataloguePrice===undefined?[current,...(registryPriceHistory[v.shipID]||[])]:[r.cataloguePrice];check(prices.every(price=>price===current||registryPriceHistory[v.shipID]?.includes(price))&&integer(r.day,0,s.day)&&prices.some(price=>{const q=registryValueAtPrice(v,price);return r.price===q.fullPrice&&r.proceeds===q.salePrice;}),'Invalid registry sale receipt.');
 }
}
function shipOffer(s,id){
 const next=ships.find(x=>x.id===id);check(next,'Choose a ship class.');const f=portFacilities(s.location),hullCredit=Math.floor(ship(s).price*.75*s.hull/100),equipmentCredit=Math.floor(equipmentValue(s)*.5),tradeCredit=hullCredit+equipmentCredit,netCost=next.price-tradeCredit,pay=Math.max(0,netCost),refund=Math.max(0,-netCost);
 const market=shipMarket(s),stock=market.offers.find(o=>o.id===id);
 const common=!s.profile.created?'Sign your captain charter before purchasing ships.':s.incident?'Resolve the encounter before using station services.':!f.spaceport?'This station has no spaceport ship sales.':!stock?'This ship is not currently offered by this registry.':'';
 const buyReason=common||(s.fleet.length>=MAX_FLEET-1?`Your registry supports up to ${MAX_FLEET} ships.`:s.credits<next.price?'Not enough cash to add this ship to your fleet.':'');
 const replacement={...s,shipID:id,upgrades:emptyUpgrades()},replacementCapacity=effectiveShip(replacement).cargoTonnes,replacementBanks=shipRules.weaponFits(replacement),currentBanks=shipRules.weaponFits(s);
 const ammunitionReason=(s.fittingEdition===2&&s.ammo>replacementBanks[1].magazine)?'Unload excess regular ammunition before this exchange.':((s.ordnanceAmmo||0)>replacementBanks[2].magazine||((s.ordnanceAmmo||0)>0&&currentBanks[2].type!==replacementBanks[2].type))?'Unload ordnance before exchanging to this weapon package.':'';
 const tradeReason=common||(s.passengers||s.oreUnits||s.carrierMass||s.towMass||s.contractTow||(s.missionCargo||[]).length?'Disembark passengers, refine ore and deploy embarked craft before replacing this flagship.':'')||ammunitionReason||(id===s.shipID?'This is already your flagship class. Add another to your fleet instead.':!shipCargoFits(replacement)?'Transfer or sell excess fleet cargo before this exchange.':fleetOverview(s).fuel>fleetOverview(s).tankTonnes-ship(s).tankTonnes+next.tankTonnes+1e-8?'Use excess fleet propellant before this exchange.':s.credits<pay?'Not enough cash for this exchange.':s.credits+refund>999999999?'Deposit cash before receiving this trade-in refund.':'');
 return {id,name:next.name,price:next.price,hullCredit,equipmentCredit,tradeCredit,netCost,pay,refund,available:!!stock,remaining:stock?.remaining||0,stockDays:stock?.stockDays||null,restockDay:stock?.restockDay||null,canBuy:!buyReason,canTrade:!tradeReason,buyReason,tradeReason};
}
function tradeInCost(s,id){return ships.some(x=>x.id===id)?shipOffer(s,id).netCost:0;}
function financialOverview(s){
 const bank=bankOverview(s),deposits=bank.accounts.map(a=>({id:a.id,name:a.name,body:a.body,balance:a.balance,apr:a.depositAPR,local:a.local}));
 const loans=bank.loans.filter(l=>l.balance>0).map(l=>({id:l.id||l.port,port:l.port,name:bankTerms(l.port,s).name,body:port(l.port).body,balance:l.balance,apr:l.apr,rateMode:l.rateMode||'fixed',fixedPremium:l.fixedPremium,openedDay:l.openedDay,legacy:l.rateMode===undefined,local:l.port===s.location}));
 if(bank.legacyDebt>0)loans.unshift({id:'charter',name:'Original charter loan',body:'Charter account',balance:bank.legacyDebt,apr:.04,rateMode:'fixed',local:s.location==='earth'});
 const vessels=[...(s.fleetLoss?[]:[activeHull(s)]),...s.fleet].map(v=>{
  const localState={...s,location:v.location};
  const cargo=allGoods.filter(g=>(v.cargo[g.id]||0)-freightUnits(v,g.id)>0).map(g=>{const units=v.cargo[g.id]-freightUnits(v,g.id);return {id:g.id,name:g.name,units,value:tradeTotal(localState,g.id,units,false)};});
  for(const l of v.missionCargo||[])if(l.owner==='captain')cargo.push({id:l.id,name:l.kind==='antiquity'?'Antiquity case':'Owned component',units:1,value:l.kind==='antiquity'?Math.round((2500+l.artifact.condition*100)*(l.artifact.appraised?(l.artifact.genuine?1:.15):.5)):(l.component?.price||0)});
  if(v.oreUnits)cargo.push({id:'raw-ore',name:'Extracted raw ore',units:v.oreUnits,value:Math.max(0,marketState(localState,'metals').sell-45)*v.oreUnits});
  const equipment=upgradeCatalog.filter(u=>(v.upgrades[u.id]||0)>0).map(u=>({id:u.id,name:u.name,level:v.upgrades[u.id],value:fittingCosts(v.shipID,u.id).slice(0,v.upgrades[u.id]).reduce((a,b)=>a+b,0)}));
  const hullValue=ships.find(sh=>sh.id===v.shipID).price,equipmentEstimate=equipment.reduce((a,u)=>a+u.value,0),cargoEstimate=cargo.reduce((a,g)=>a+g.value,0);
  return {id:v.id,name:v.name,ship:ships.find(sh=>sh.id===v.shipID).name,port:v.location,station:port(v.location).name,body:port(v.location).body,flagship:v.id===s.flagshipID,hull:v.hull,hullValue,equipmentValue:equipmentEstimate,cargoValue:cargoEstimate,total:hullValue+equipmentEstimate+cargoEstimate,equipment,cargo};
 });
 const hullValue=vessels.reduce((a,v)=>a+v.hullValue,0),equipmentEstimate=vessels.reduce((a,v)=>a+v.equipmentValue,0),cargoEstimate=vessels.reduce((a,v)=>a+v.cargoValue,0),warehouses=warehouseAssets(s),warehouseValue=warehouses.reduce((n,w)=>n+w.total,0),relicValue=(s.cantina?.relics||[]).reduce((n,id)=>n+Math.floor(relicCatalog.find(r=>r.id===id).price*.45),0),assets=relicValue+warehouseValue+s.credits+bank.totalDeposits+hullValue+equipmentEstimate+cargoEstimate;
 return {day:s.day,cash:s.credits,totalDeposits:bank.totalDeposits,totalDebt:s.debt,accruedDebt:loans.reduce((a,l)=>a+l.balance,0),depositCount:deposits.length,loanCount:loans.length,hullValue,equipmentValue:equipmentEstimate,cargoValue:cargoEstimate,totalAssets:assets,netWorth:Math.floor(assets-s.debt),deposits,loans,vessels,warehouses,warehouseValue,relicValue,valuationNote:'Hull estimates use catalogue prices; installed equipment uses its fitting cost. Cargo uses today’s fixed daily sell quote at its physical station. Owned warehouse bays are valued at their purchase cost and stored cargo at local sell rates; these values are not cash or a buyback offer. Relics use estimated antiquarian buyback values. These are estimates, not guaranteed resale offers. Client-owned freight, fuel, ammunition and engineering spares are excluded.'};
}
function netWorth(s){return financialOverview(s).netWorth;}
function activeHull(s){return {...Object.fromEntries(['passengers','oreUnits','oreCost','carrierMass','missionCargo','duty','towMass','contractTow','cargoPackingEdition','legacyCargo'].filter(k=>s[k]!==undefined).map(k=>[k,clone(s[k])])),id:s.flagshipID,name:s.shipName,shipID:s.shipID,location:s.location,hull:s.hull,fuel:s.fuel,spares:s.spares,cargo:clone(s.cargo),cargoBasis:clone(s.cargoBasis||{}),...(s.freightCargo?{freightCargo:clone(s.freightCargo)}:{}),upgrades:clone(s.upgrades),ammo:s.ammo,ordnanceAmmo:s.ordnanceAmmo||0,fittingEdition:s.fittingEdition||1,escort:false};}
function actors(s){return [s,...s.fleet.filter(v=>v.escort&&v.hull>0)];}
function actorID(s,v){return v===s?s.flagshipID:v.id;}
function actorName(s,v){return v===s?s.shipName:v.name;}
function owned(s,id){if(id===s.flagshipID)return s;const v=s.fleet.find(v=>v.id===id);check(v,'This ship is not in your fleet.');return v;}
const stationBerthRates={earth:2,moon:2,mars:2,phobos:1,ceres:2,callisto:2,titan:3,mercury:4,venus:4,'earth-high':3,deimos:1,jupiter:3,io:5,europa:5,ganymede:2,saturn:3,enceladus:4,rhea:1,iapetus:3,uranus:3,miranda:4,ariel:2,titania:3,oberon:3,neptune:5,triton:5};
function berthRate(pid){return stationBerthRates[port(pid).id];}
function reserveShipFee(s,v){return v.id===s.flagshipID||v.escort||v.carrierID||v.towID||v.location===homePort(s)?0:berthRate(v.location);}
function reserveFee(s,days){return s.fleet.reduce((sum,v)=>sum+reserveShipFee(s,v),0)*days;}
// Reserve fees are daily obligations at the hull's physical branch, never cash invoices.
function accrueBankInterest(s,days){
 if(s.bank){const from=s.day-days;s.bank.legacyDebt*=1.04**(days/365.25);for(const loan of s.bank.loans){loan.balance*=loanInterestFactor(loan,from,s.day);if(loan.rateMode==='floating')loan.apr=loanRate(loan,s.day);}for(const id of Object.keys(s.bank.deposits))s.bank.deposits[id]*=bankInterestFactor(id,from,s.day);syncDebt(s);}
 else s.debt=Math.ceil(s.debt*1.04**(days/365.25));
}
function billStationAccount(s,pid,amount){
 if(!s.bank)s.bank={deposits:{},loans:[],legacyDebt:s.debt};const b=s.bank,deposit=Math.min(amount,b.deposits[pid]||0),credit=amount-deposit;b.deposits[pid]=Math.max(0,(b.deposits[pid]||0)-deposit);
 if(credit>0)drawBankCredit(s,pid,credit,'floating');syncDebt(s);return {deposit,credit};
}
function advanceBankCalendar(s,days){
 if(!days)return;
 if(!reserveFee(s,1)&&!hasWarehouseLeaseAccounting(s)){s.day+=days;accrueBankInterest(s,days);return;}
 if(!s.bank)s.bank={deposits:{},loans:[],legacyDebt:s.debt};
 const billed=new Map();
 for(let day=0;day<days;day++){
  s.day++;accrueBankInterest(s,1);for(const key of Object.keys(s.pressure))s.pressure[key]*=Math.exp(-1/60);
  const fees=new Map();for(const v of s.fleet){const rate=reserveShipFee(s,v);if(rate)fees.set(v.location,(fees.get(v.location)||0)+rate);}
  for(const [pid,fee] of fees){
   const {deposit,credit}=billStationAccount(s,pid,fee);if(s.tradeCareer)s.tradeCareer.work.cost+=deposit;const row=billed.get(pid)||{fee:0,deposit:0,credit:0};row.fee+=fee;row.deposit+=deposit;row.credit+=credit;billed.set(pid,row);
  }
  // Bill every station before any auction changes reputation, collateral or reserve ownership.
  for(const pid of fees.keys())enforceBerthDebt(s,pid);
  advanceWarehouseLeases(s);
 }
 for(const [pid,row] of billed)record(s,`Reserve berth fees at ${port(pid).name}: ${row.fee} cr over ${days} ${days===1?'day':'days'}; ${row.deposit.toFixed(2)} cr from local bank deposits, ${row.credit.toFixed(2)} cr charged to local credit.`);
 return true;
}
function berthAuctionValue(s,v,pid=v.location){
 const at={...s,location:pid},cargo=goods.reduce((sum,g)=>sum+tradeTotal(at,g.id,Math.max(0,(v.cargo[g.id]||0)-freightUnits(v,g.id)),false),0),ordnance=shipRules.weaponFits(v)[2];
 return registryValue(v).salePrice+cargo+Math.floor(v.fuel*port(pid).fuelPrice*.5)+v.spares*90+v.ammo*10+Math.floor((v.ordnanceAmmo||0)*(ordnance.type==='torpedo'?240:90)*.5);
}
function enforceBerthDebt(s,pid){
 const before=branchDebt(s,pid),limit=bankTerms(pid,s).creditLimit;
 if(before<=limit*1.1+1e-7)return;
 const reserves=()=>s.fleet.filter(v=>v.location===pid&&!v.escort&&!v.carrierID&&!v.towID).sort((a,b)=>berthAuctionValue(s,a,pid)-berthAuctionValue(s,b,pid)||a.id.localeCompare(b.id));
 if(!reserves().length)return;
 const receipt={id:uuid(),day:s.day,port:pid,source:'berth',limit,before,after:before,cashTaken:0,saleProceeds:0,paid:0,surplus:0,newCharges:0,items:[],summary:''};
 while(branchDebt(s,pid)>1e-8){
  const v=reserves()[0];if(!v)break;
  const contracts=[...new Set(freightManifests(v).map(f=>f.contractID))],prior=branchDebt(s,pid);
  for(const id of contracts){const c=freightContract(s,id);if(c)failFreight(s,'lost',c);}
  for(const f of freightManifests(v)){const pending=freightReturnJobs(s).find(c=>c.id===f.contractID);v.cargo[f.good]-=f.units;if(pending)pending.returned[f.good]=(pending.returned[f.good]||0)+f.units;receipt.items.push({kind:'client-return',name:good(f.good).name+' returned to client',shipID:v.id,quantity:f.units,value:0});}setFreightManifests(v,[]);
  for(const id of contracts){const c=freightReturnJobs(s).find(c=>c.id===id);if(c){updateFreightReturnReceipt(s,c);clearFreightReturn(s,c);}}
  for(const g of contrabandGoods){const n=v.cargo[g.id]||0;if(!n)continue;removeCargo(v,g.id,n);receipt.items.push({kind:'confiscated',name:g.name,shipID:v.id,quantity:n,value:0});changeStationReputation(s,pid,-6,'Restricted cargo seized during debt enforcement.');changeReputation(s,-6,'Restricted cargo confiscated during debt enforcement at '+port(pid).name+'.');}
  const value=berthAuctionValue(s,v,pid),name=v.name,id=v.id;
  for(const g of goods){const n=v.cargo[g.id]||0;if(n)s.pressure[pid+':'+g.id]=Math.max(-.3,(s.pressure[pid+':'+g.id]||0)-n*.0015);}
  civilianShipLoss(s,v,true,pid);s.fleet=s.fleet.filter(x=>x.id!==id);receipt.newCharges+=Math.max(0,branchDebt(s,pid)-prior);
  receipt.items.push({kind:'ship',name:name+' (hull, fittings and owned legal stores)',shipID:id,quantity:1,value});receipt.saleProceeds+=value;
  const paid=payBranchDebt(s,pid,value),surplus=Math.max(0,value-paid);receipt.paid+=paid;receipt.surplus+=surplus;s.bank.deposits[pid]=(s.bank.deposits[pid]||0)+surplus;
  record(s,`Berth auction at ${port(pid).name}: ${name} sold for ${value} cr; ${paid.toFixed(2)} cr paid to local credit, ${surplus.toFixed(2)} cr deposited at this bank.`);
 }
 receipt.after=branchDebt(s,pid);receipt.summary=`${port(pid).name}: berth credit exceeded 110% of the ${limit.toLocaleString('en-US')} cr limit. Lowest-value berthed ships auctioned first: ${receipt.saleProceeds} cr proceeds, ${receipt.paid.toFixed(2)} cr paid to this bank, ${receipt.surplus.toFixed(2)} cr surplus deposited here. Local debt ${receipt.before.toFixed(2)} → ${receipt.after.toFixed(2)} cr.${receipt.newCharges?' Additional charter or freight claim: '+receipt.newCharges.toFixed(2)+' cr.':''}${receipt.after>0?' No further local reserve ships are available for auction.':''}`;
 changeStationReputation(s,pid,-2,'Overdue berth credit required an authority auction.');s.debtCollections=[...(s.debtCollections||[]),receipt].slice(-12);decision(s,'Station bank auctioned overdue berthed ships at '+port(pid).name+'.');
}

function invoice(s,amount){const cash=Math.min(s.credits,amount);s.credits-=cash;if(s.bank){s.bank.legacyDebt+=amount-cash;syncDebt(s);}else s.debt+=amount-cash;}
function burnFor(v,deltaV){return (effectiveShip(v).dryMass+cargoMass(v)+v.fuel)*(1-Math.exp(-deltaV/(effectiveShip(v).isp*.00980665)));}
function soloQuote(v,t){const sh=effectiveShip(v),dry=sh.dryMass+cargoMass(v);return {minimumFuel:dry*Math.expm1(t.deltaV/(sh.isp*.00980665)),burn:burnFor(v,t.deltaV)};}
function fleetQuote(s,dest,t=routeTransfer(s,dest)){
 const members=fleetMembers(s);if(members.length<2)return [];const pool=fleetOverview(s),plan=fleetFuelPlan(s,t.deltaV);
 const rows=members.map(v=>{const sh=effectiveShip(v);return {v,tank:sh.tankTonnes,share:pool.tankTonnes?sh.tankTonnes/pool.tankTonnes:0,a:(sh.dryMass+cargoMass(v))/(sh.isp*.00980665),b:pool.tankTonnes?sh.tankTonnes/pool.tankTonnes/(sh.isp*.00980665):0};}),a=rows.reduce((n,r)=>n+r.a,0),b=rows.reduce((n,r)=>n+r.b,0),x=b*t.deltaV;
 const phi1=x?-Math.expm1(-x)/x:1,phi2=Math.abs(x)<1e-4?.5-x/6+x*x/24-x*x*x/120:(x+Math.expm1(-x))/(x*x),integral=pool.fuel*t.deltaV*phi1-a*t.deltaV*t.deltaV*phi2;
 const feasible=plan.burn<=pool.fuel+1e-8,weight=rows.reduce((n,r)=>n+r.a+r.b*pool.fuel,0);
 return rows.slice(1).map(r=>({id:r.v.id,name:r.v.name,burn:feasible?Math.max(0,r.a*t.deltaV+r.b*integral):plan.burn*(r.a+r.b*pool.fuel)/weight,minimumFuel:plan.minimumFuel*r.share,fuel:r.v.fuel,tank:r.tank,hull:r.v.hull}));
}
function validateFleet(s){
 const ids=new Set([s.flagshipID]);const upgrades=u=>u&&typeof u==='object'&&!Array.isArray(u)&&Object.keys(u).every(k=>upgradeCatalog.some(m=>m.id===k))&&upgradeCatalog.every(m=>integer(['laser','shield','ordnance'].includes(m.id)?(u[m.id]??0):u[m.id],0,3));
 const cargo=v=>v.cargo&&typeof v.cargo==='object'&&!Array.isArray(v.cargo)&&Object.entries(v.cargo).every(([k,n])=>allGoods.some(g=>g.id===k)&&integer(n,0,MAX_CARGO_LOTS))&&shipCargoFits(v,true);
 check(typeof s.flagshipID==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(s.flagshipID)&&str(s.shipName,60)&&s.shipName.length>0&&upgrades(s.upgrades)&&integer(s.ammo,0,s.fittingEdition===2?shipRules.weaponFits(s)[1].magazine:192)&&integer(s.ordnanceAmmo??0,0,32),'Invalid flagship equipment.');
 check((s.fittingEdition==null||[1,2].includes(s.fittingEdition))&&(s.fittingEdition!==2||(shipRules.cargoAllocation(s).loadoutFits&&(s.ordnanceAmmo||0)<=shipRules.weaponFits(s)[2].magazine)),'Invalid flagship ammunition allocation.');
 check(Array.isArray(s.fleet)&&s.fleet.length<MAX_FLEET,`A fleet may contain at most ${MAX_FLEET} ships.`);
 for(const v of s.fleet){check(v&&typeof v.id==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(v.id)&&!ids.has(v.id)&&str(v.name,60)&&v.name.length>0&&ships.some(x=>x.id===v.shipID)&&upgrades(v.upgrades)&&world.ports.some(p=>p.id===v.location),'Invalid fleet vessel.');ids.add(v.id);check((v.fittingEdition==null||[1,2].includes(v.fittingEdition))&&(v.fittingEdition!==2||(shipRules.cargoAllocation(v).loadoutFits&&(v.ordnanceAmmo||0)<=shipRules.weaponFits(v)[2].magazine)),'Invalid fleet ammunition allocation.');validateCargoBasis(v);const sh=effectiveShip(v);check(integer(v.hull,0,100)&&finite(v.fuel,0,sh.tankTonnes+.001)&&integer(v.spares,0,sh.maxSpares)&&integer(v.ammo,0,v.fittingEdition===2?shipRules.weaponFits(v)[1].magazine:192)&&integer(v.ordnanceAmmo??0,0,32)&&cargo(v)&&typeof v.escort==='boolean'&&(!v.escort||v.location===s.location),'Invalid fleet stores or escort position.');}
 check(Array.isArray(s.completedRaids)&&s.completedRaids.length<=10000&&s.completedRaids.every(k=>str(k,120)),'Invalid raid history.');
 check(s.claimedBounties===undefined||s.claimedBounties===null||Array.isArray(s.claimedBounties)&&s.claimedBounties.length<=notoriousRaiders.length&&new Set(s.claimedBounties).size===s.claimedBounties.length&&s.claimedBounties.every(id=>bountyTarget(id)),'Invalid bounty claims.');
 if(s.capturedBounties!==undefined){const ids=new Set();check(Array.isArray(s.capturedBounties)&&s.capturedBounties.length<=7&&s.capturedBounties.every(r=>{const target=r&&bountyTarget(r.id);if(!target||ids.has(r.id)||!claimedBounty(s,r.id)||!integer(r.day,0,s.day)||!world.ports.some(p=>p.id===r.port&&target.groups.includes(p.group))||!str(r.battleID,120)||typeof r.premium!=='boolean'||r.baseReward!==target.reward||r.reward!==Math.round(r.baseReward*(r.premium?1.15:1)))return false;ids.add(r.id);return true;}),'Invalid captured bounty receipts.');}
 if(s.battle?.bountySettlement!==undefined)check(s.battle.bountySettlement==='claim'&&!!s.battle.bountyID&&s.battle.economyEdition===2,'Invalid bounty settlement.');
 if(s.incident?.encounterPlan!==undefined){check(s.incident.kind==='pirate'&&!s.incident.bountyID,'Invalid planned raider contact.');combat2.validateEncounterPlan(s.incident.encounterPlan);}
 if(s.incident?.reportTier!=null)check(s.incident.kind==='pirate'&&integer(s.incident.reportTier,1,3)&&!s.incident.bountyID,'Invalid patrol encounter tier.');
 if(s.incident?.bountyID!=null)check(['pirate','battle'].includes(s.incident.kind)&&bountyTarget(s.incident.bountyID)?.groups.includes(port(s.incident.destination).group)&&!claimedBounty(s,s.incident.bountyID),'Invalid wanted-raider encounter.');
 check(['battles','victories','raids'].every(k=>integer(s.profile.stats[k],0,1000000)),'Invalid battle progression.');
 check(Array.isArray(s.battleHistory)&&s.battleHistory.length<=30&&s.battleHistory.every(r=>str(r.id,80)&&integer(r.day,0,s.day)&&str(r.title,150)&&['victory','escaped','defeat','inconclusive'].includes(r.outcome)&&integer(r.reward,0,1000000)&&integer(r.rounds,1,30)&&str(r.summary,2000)),'Invalid battle reports.');
 if(s.battle?.participants!==undefined)check(Array.isArray(s.battle.participants)&&s.battle.participants.length<=1001&&new Set(s.battle.participants).size===s.battle.participants.length&&s.battle.participants.every(id=>str(id,80)),'Invalid battle participants.');
 for(const r of s.battleHistory){if(r.durationSeconds!==undefined)check(finite(r.durationSeconds,0,90),'Invalid battle duration.');if(r.ships!==undefined)check(Array.isArray(r.ships)&&r.ships.length<=1001&&new Set(r.ships.map(v=>v.id)).size===r.ships.length&&r.ships.every(v=>str(v.id,80)&&str(v.name,60)&&ships.some(h=>h.id===v.shipID)&&integer(v.hull,0,100)&&['operational','disabled','destroyed'].includes(v.status)),'Invalid battle fleet report.');}
 if(s.incident?.kind==='battle-summary'){const i=s.incident,r=s.battleHistory.at(-1),ownedIDs=new Set([s.flagshipID,...s.fleet.map(v=>v.id)]);check(!s.battle&&r&&i.reportID===r.id&&i.destination===r.destination&&Array.isArray(i.inspectionIDs)&&i.inspectionIDs.length<=ownedIDs.size&&new Set(i.inspectionIDs).size===i.inspectionIDs.length&&i.inspectionIDs.every(id=>ownedIDs.has(id)),'Invalid pending battle summary.');}
 if(s.battle?.rulesVersion===2){if(s.battle.bountyID){const target=bountyTarget(s.battle.bountyID);check(target&&!claimedBounty(s,target.id)&&validBountyReward(s.battle,target)&&target.groups.includes(port(s.battle.destination).group),'Invalid active bounty.');}combat2.validate(s);return;}
 if(s.battle){const b=s.battle;check(s.incident?.kind==='battle'&&['raid','defense'].includes(b.origin)&&str(b.id,120)&&str(b.title,150)&&b.destination===s.incident.destination&&integer(b.round,1,12)&&finite(b.range,50,2000)&&integer(b.reward,0,1000000),'Invalid battle state.');
 if(b.bountyID!=null){const target=bountyTarget(b.bountyID);check(target&&!claimedBounty(s,b.bountyID)&&target.groups.includes(port(b.destination).group)&&validBountyReward(b,target),'Invalid active bounty.');}
 check(s.hull>0&&actors(s).some(v=>!b.acted.includes(actorID(s,v))),'An active battle requires an operational ship with a pending order.');
 const knownActors=new Set(actors(s).map(v=>actorID(s,v)));knownActors.add(s.flagshipID);for(const v of s.fleet.filter(v=>v.escort))knownActors.add(v.id);
 for(const list of [b.acted,b.guarded,b.evaded])check(Array.isArray(list)&&new Set(list).size===list.length&&list.every(id=>knownActors.has(id)),'Invalid battle orders.');
 check(b.heat&&Object.entries(b.heat).every(([id,h])=>knownActors.has(id)&&integer(h,0,100))&&Array.isArray(b.log)&&b.log.length<=40&&b.log.every(t=>str(t,500)),'Invalid battle heat or transmissions.');
 check(Array.isArray(b.enemies)&&b.enemies.length>=1&&b.enemies.length<=3&&b.enemies.some(e=>e.hull>0)&&new Set(b.enemies.map(e=>e.id)).size===b.enemies.length&&b.enemies.every(e=>typeof e.id==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(e.id)&&str(e.name,80)&&integer(e.hull,0,100)&&integer(e.maxHull,1,100)&&e.hull<=e.maxHull&&integer(e.armor,0,3)&&integer(e.damage,1,30)&&integer(e.ammo,0,20)&&integer(e.heat,0,100)&&['press','flank','cool'].includes(e.intent)),'Invalid hostile vessels.');
 }else check(s.incident?.kind!=='battle','A saved battle is missing its tactical state.');
}
const notoriousRaiders=[
 {id:'red-wake',shipID:'osprey',name:'Eira Voss — Red Wake',ship:'Red Wake',groups:['earth','venus','mercury'],tier:1,reward:6500,detail:'Hijacks medical freight under forged rescue credentials. Commands the cutter Red Wake.'},
 {id:'lockjaw',shipID:'cormorant',name:'Sable Venn — Lockjaw',ship:'Lockjaw',groups:['mars'],tier:2,reward:12000,detail:'Seizes tug crews and sells stolen berth clearances around Mars. Commands the armored tug Lockjaw.'},
 {id:'cinder-queen',shipID:'petrel',name:'Mara Kade — Cinder Queen',ship:'Cinder Queen',groups:['ceres','mars'],tier:2,reward:19000,detail:'Extorts mining convoys and strips working beacons in the main belt. Commands the tender Cinder Queen.'},
 {id:'glass-jackal',shipID:'gyrfalcon',name:'Rook-9 — Glass Jackal',ship:'Glass Jackal',groups:['jupiter'],tier:3,reward:28000,detail:'Ambushes Jovian resupply traffic using stolen survey transponders. Commands the gunship Glass Jackal.'},
 {id:'ringbreaker',shipID:'gannet',name:'Iska Ren — Ringbreaker',ship:'Ringbreaker',groups:['saturn'],tier:3,reward:36000,detail:'Runs a protection racket against Saturnian ice haulers. Commands the heavy cutter Ringbreaker.'},
 {id:'pale-knife',shipID:'gyrfalcon',name:'Veyra Sol — Pale Knife',ship:'Pale Knife',groups:['uranus'],tier:3,reward:44000,detail:'Captures remote depot supplies and holds engineering crews for ransom. Commands the frigate Pale Knife.'},
 {id:'last-signal',shipID:'albatross',name:'Quiet Array — Last Signal',ship:'Last Signal',groups:['neptune'],tier:3,reward:52000,detail:'Lures deepwatch freighters with counterfeit distress signals. Commands the raider carrier Last Signal.'}
];
const legacyBountyRewards=Object.freeze({'red-wake':6500,lockjaw:12000,'cinder-queen':19000,'glass-jackal':28000,ringbreaker:36000,'pale-knife':44000,'last-signal':52000});
function validBountyReward(b,target){return (b.economyEdition===2||b.economyEdition===undefined)&&b.reward===target.reward||(b.economyEdition===undefined&&b.reward===legacyBountyRewards[target.id]);}
// Warrants fund a reference patrol's route, repairs and ammunition, plus a threat award.
let previousWarrant=0;
for(const r of notoriousRaiders){const base=ships.find(h=>h.id===r.shipID),reference=ships.find(h=>h.id===(r.tier===1?'osprey':r.tier===2?'gannet':'gyrfalcon')),outer=r.groups.includes('uranus')?1.15:r.groups.includes('neptune')?1.3:1;
 r.reward=Math.ceil(Math.max(previousWarrant+5000,(reference.price*.12+base.price*.035+fittingCosts(reference.id,'laser')[0]+fittingCosts(reference.id,'armor')[0])*outer)/100)*100;previousWarrant=r.reward;}
function bountyTarget(id){return notoriousRaiders.find(v=>v.id===id);}
function claimedBounty(s,id){return (s.claimedBounties||[]).includes(id);}
function bountyTerritory(v){return v.groups.map(id=>system(id).name).join(', ');}
function capturedBounty(s,id){return (s.capturedBounties||[]).find(r=>r.id===id);}
function bountyOffers(s){return notoriousRaiders.map(v=>{const capture=capturedBounty(s,v.id);return patrolOffer(s,{accepted:(s.acceptedBounties||[]).some(a=>a.id===v.id),captured:!!capture,claimReward:capture?.reward??null,id:'bounty-'+v.id,bountyID:v.id,tier:v.tier,title:v.name,detail:v.detail+' Known territory: '+bountyTerritory(v)+'. The posted bounty is collected at a patrol office after confirmed capture.',reward:v.reward,completed:claimedBounty(s,v.id)&&!capture});});}
function raidOffers(s){return [
 {tier:1,title:'Possible raider cutters',detail:'Traffic crews report small armed craft around a cargo approach. Their intentions have not been confirmed.',reward:Math.round(ships.find(h=>h.id==='osprey').price*.08)},
 {tier:2,title:'Reported toll craft',detail:'Unverified transmissions mention an organized extortion group. A prepared convoy should remain watchful.',reward:Math.round(ships.find(h=>h.id==='gannet').price*.09)},
 {tier:3,title:'Unconfirmed support tender',detail:'Several crews think they saw reinforced vessels and a support tender. Patrol has no confirmed intercept position.',reward:Math.round(ships.find(h=>h.id==='gyrfalcon').price*.1)}
 ].map(r=>patrolOffer(s,{...r,id:`${s.location}-raid-${r.tier}-${Math.floor(s.day/90)}`,completed:s.completedRaids.includes(`${s.location}-raid-${r.tier}-${Math.floor(s.day/90)}`)})).concat(bountyOffers(s).filter(r=>!r.captured));}
function startBattle(s,origin,offer=null){
 const encounterPhase=origin==='defense'?(s.incident.phase||'approach'):'approach',destination=origin==='defense'?s.incident.destination:s.location;
 const target=bountyTarget(offer?.bountyID||(origin==='defense'?s.incident.bountyID:null));
 if(target)check(!claimedBounty(s,target.id)&&target.groups.includes(port(destination).group),'This bounty is no longer available here.');
 const escortJob=s.campaign?.jobs.find(j=>j.status==='active'&&j.kind==='escort'&&j.destination===destination);
 const tier=target?.tier||offer?.tier||escortJob?.threatTier||(origin==='defense'?(s.incident.encounterPlan?.tier||s.incident.reportTier):0)||1,title=target?'Intercept '+target.name:offer?.title||(encounterPhase==='route'?'Defend the transfer corridor':'Defend the arrival corridor');
 const configs=tier===1?[[38,7],[32,6]]:tier===2?[[60,9],[55,8],[45,7]]:[[85,12],[70,10],[60,9]];
 const names=target?[target.ship,'Black Kite escort','Corsair support tender']:['Cutlass cutter','Black Kite tug','Corsair tender'];
 s.battle={id:offer?.id||uuid(),origin,encounterPhase,title,destination,round:1,range:600,economyEdition:2,reward:target?.reward??offer?.reward??Math.round(ships.find(h=>h.id===(tier===1?'osprey':tier===2?'gannet':'gyrfalcon')).price*[0,.04,.06,.08][tier]),acted:[],guarded:[],evaded:[],heat:{},enemies:configs.map(([h,d],i)=>({id:'hostile-'+i,name:names[i],hull:h,maxHull:h,armor:tier-1,damage:d,ammo:12,heat:0,intent:i===1?'flank':'press'})),log:['Contact at 600 km. One order per operational friendly ship; hostiles respond after all friendly orders.']};
 if(target){s.battle.bountyID=target.id;s.battle.bountySettlement='claim';s.battle.log.push(`Warrant confirmed: ${target.name}. ${target.reward} cr on capture of the group.`);}
 const escortCombat=!!escortJob,blockadeCombat=!!offer?.id?.startsWith('blockade-');if(!target&&!escortCombat){if(blockadeCombat)s.battle.encounterPlan=combat2.encounterPlan(s,tier,'blockade');else if(origin==='defense'&&s.incident.encounterPlan)s.battle.encounterPlan=clone(s.incident.encounterPlan);}
 s.battle.participants=actors(s).map(v=>actorID(s,v));combat2.initialize(s,tier,target);
 s.incident={id:uuid(),kind:'battle',phase:encounterPhase,progress:s.voyage?.progress??.94,destination,title,detail:'A tactical engagement before docking. Ten minutes per round; maneuver geometry and projectile flight are abstracted.',damage:0,delay:0};s.profile.stats.battles++;record(s,`Battle stations: ${title.toLowerCase()}.`);
}
function combatLog(s,text){s.battle.log.push(text);s.battle.log=s.battle.log.slice(-40);if(s.battle.liveResolving)record(s,text);}
function stagedRecovery(s,pid,base){const j=s.campaign?.jobs.find(j=>j.kind==='staging'&&j.status==='completed'&&operationShips(s).some(v=>actorID(s,v)===j.assigned&&v.hull>=60)&&j.destination===pid&&(j.lastRecovery===undefined||s.day>=j.lastRecovery+30));if(!j)return base;j.lastRecovery=s.day;record(s,'Expedition recovery point applied: emergency recovery fee reduced by 20%, available again after 30 days. Destroyed hulls and cargo remain lost.');return Math.ceil(base*.8);}
function finishBattle(s,outcome){
 const b=s.battle,encounterOrigin=s.voyage?.origin||s.location;blockadeBattleOutcome(s,b,outcome);campaignBattleOutcome(s,b,outcome);relicBattleReward(s,b,outcome);const inspectionIDs=[s.flagshipID,...s.fleet.filter(v=>v.escort).map(v=>v.id)];let reward=0,summary='',delay=1;const damaged=s.fleet.filter(v=>v.escort&&v.hull===0);
 if(outcome==='victory'){const target=bountyTarget(b.bountyID);if(target){check(!claimedBounty(s,target.id),'This bounty has already been claimed.');s.claimedBounties=[...(s.claimedBounties||[]),target.id];}reward=b.reward;if(b.rulesVersion===2&&target&&reputationData(s.profile).score>=0&&actors(s).some(v=>v.shipID==='gyrfalcon'&&v.hull>=35))reward=Math.round(reward*1.15);const pending=target&&b.bountySettlement==='claim';if(pending){s.capturedBounties=[...(s.capturedBounties||[]),{id:target.id,day:s.day,port:b.destination,reward,baseReward:b.reward,premium:reward!==b.reward,battleID:b.id}];reward=0;}s.credits+=reward;changeReputation(s,4,'Protected traffic during '+b.title+'.');s.profile.stats.victories++;earn(s,'navigation',35);earn(s,'engineering',15);if(b.origin==='raid'){s.completedRaids.push(b.id);s.profile.stats.raids++;}changeStationReputation(s,b.destination,3,'Protected the station approach from raiders.');decision(s,`Disabled pirate vessels during ${b.title.toLowerCase()}.`,'resolve');summary=target?(pending?`Captured ${target.name}. Claim the confirmed ${capturedBounty(s,target.id).reward} cr bounty at a patrol office.`:`Captured ${target.name}. ${reward} cr bounty transferred automatically after patrol handover. This warrant is permanently closed.`):`Hostile ships disabled. Received ${reward} cr; crews handed over to local patrols.`;}
 else if(outcome==='defeat'&&s.fleetLoss){invoice(s,1400);delay=4;summary='The travelling fleet was destroyed. Lost hulls, their cargo, propellant, weapons and upgrades are gone. Lifeboat rescue cost 1,400 cr; surviving reserves remain at their recorded berths.';}
 else if(outcome==='defeat'){const recoveryCharge=stagedRecovery(s,b.destination,1400);s.hull=Math.max(15,s.hull);for(const v of s.fleet.filter(v=>v.escort))v.hull=v.hull===0?0:Math.max(1,v.hull-8);let lost=0;for(const g of allGoods){const n=Math.min(s.cargo[g.id]||0,Math.max(0,6-lost));removeCargo(s,g.id,n);lost+=n;}invoice(s,recoveryCharge);delay=4;summary=`Emergency stabilization and local tow: ${recoveryCharge} cr, up to six cargo units lost. The flagship survives at ${s.hull}% integrity.`;decision(s,'Called off an engagement and accepted emergency recovery.','caution');}
 else if(outcome==='escaped'&&b.enemyWithdrew){summary='The identified raiders withdrew with surviving hulls. No bounty paid; their regional record is retained.';}
 else if(outcome==='escaped'){delay=2;summary='Broke contact under station cover. No bounty; avoidance propellant has been spent.';decision(s,'Spent reserve propellant to withdraw the fleet.','caution');}
 else {summary=b.live?.quietSteps>=32?'Neither formation could maintain a firing solution; contact broken. No objective completed or bounty paid.':'Contact broken before the objective was secured. No bounty paid.';}
 if(b.blockadeID||b.stationBlockade){const j=s.blockades?.jobs.find(j=>j.id===b.blockadeID);summary=outcome==='victory'?'Blockade broken: '+port(b.destination).name+' is liberated. Temporary exchange recovery premiums are now available.'+(j?' Claim '+j.reward+' cr at '+port(j.origin).name+' Port Authority.':''):summary+' The blockade remains; docking is closed.';}
 // Disabled hulls stay owned and are recovered locally, rather than disappearing or teleporting between planets.
 for(const v of s.fleet.filter(v=>v.escort&&v.hull===0)){v.escort=false;v.location=b.destination;invoice(s,900);delay=Math.max(delay,4);summary+=` ${v.name} recovered disabled for 900 cr; repair before assigning it again.`;}
 advance(s,delay);s.incident=null;s.battle=null;
 const report={id:uuid(),day:s.day,encounterPhase:b.encounterPhase||'approach',originPort:encounterOrigin,destination:b.destination,title:b.title,outcome,reward,rounds:b.round,summary,...(b.blockadeID?{blockadeID:b.blockadeID}:{}),...(b.stationBlockade?{stationBlockade:b.stationBlockade}:{})};const ownedShips=[activeHull(s),...s.fleet],losses=s.shipLosses||[];report.ships=(b.participants||inspectionIDs).map(id=>{const v=ownedShips.find(v=>v.id===id),lost=losses.find(v=>v.id===id);return lost?{id,name:lost.name,shipID:lost.shipID,hull:0,status:'destroyed'}:v?{id,name:v.name,shipID:v.shipID,hull:v.hull,status:v.hull>0?'operational':'disabled'}:null;}).filter(Boolean);if(b.live?.edition===2)report.durationSeconds=b.live.step*.5;s.battleHistory.push(report);s.battleHistory=s.battleHistory.slice(-30);record(s,`${b.title}: ${outcome}. ${summary}`);s.incident={id:uuid(),kind:'battle-summary',destination:b.destination,title:'Battle summary',detail:summary,damage:0,delay:0,phase:s.voyage?'route':'approach',reportID:report.id,inspectionIDs};
}
function continueAfterBattle(s,reportID){
 const i=s.incident,r=s.battleHistory.at(-1);check(i?.kind==='battle-summary'&&r&&i.reportID===r.id&&reportID===r.id,'This battle summary is no longer waiting.');s.incident=null;record(s,'Reviewed battle summary: '+r.title+'.');if(s.fleetLoss){delete s.voyage;s.location=r.destination;if(!s.visited.includes(r.destination))s.visited.push(r.destination);record(s,'Surviving crew recovered near '+port(r.destination).name+'. The voyage has ended; command recovery is required.');return;}if((r.blockadeID||r.stationBlockade)&&r.outcome!=='victory'){blockadeHoldingIncident(s,r.destination);return;}arrive(s,r.destination,i.inspectionIDs);
}

function battleOrder(s,arg){
 if(s.battle?.rulesVersion===2){combat2.order(s,arg);return;}
 const b=s.battle;check(b,'There is no active battle.');const v=owned(s,arg.actor),id=actorID(s,v);check(v===s||v.escort,'Only the flagship and assigned escorts can fight.');check(v.hull>0,'This vessel is disabled.');
 if(arg.order==='retreat'||arg.order==='surrender'){
 check(v===s,'The flagship issues fleet-wide withdrawal orders.');
 if(arg.order==='retreat'){spendFleetFuel(s,fleetManeuverFuel(s,.15));finishBattle(s,'escaped');}
 else finishBattle(s,'defeat');return;
 }
 check(!b.acted.includes(id),'This ship has already acted this round.');const heat=b.heat[id]||0,sh=effectiveShip(v);
 if(arg.order==='laser'){
 const target=b.enemies.find(e=>e.id===arg.target&&e.hull>0);check(target,'Select an operational hostile ship.');check(heat+26<=100,'Laser cooling limit reached. Guard to shed heat.');b.heat[id]=heat+26;const chance=Math.min(.95,Math.max(.3,.84+v.upgrades.sensors*.05+level(s,'navigation')*.01-(b.range>500?.12:0)-heat*.001));
 if(rng(s)<chance){const damage=Math.max(1,Math.round(legacyLaserPower(v)*(.9+rng(s)*.2)*(1-.08*target.armor)));target.hull=Math.max(0,target.hull-damage);combatLog(s,`${actorName(s,v)} laser hit ${target.name} for ${damage}${target.hull===0?' — disabled':''}.`);}else combatLog(s,`${actorName(s,v)} laser missed ${target.name}.`);earn(s,'navigation',2);
 }else if(arg.order==='fire'||arg.order==='salvo'){
 check(v.upgrades.weapons>=1,'Fit an optional coilgun battery to use kinetic orders. The standard laser is always available.');const salvo=arg.order==='salvo',ammo=salvo?2:1,heatCost=salvo?45:32,target=b.enemies.find(e=>e.id===arg.target&&e.hull>0);check(target,'Select an operational hostile ship.');check(v.ammo>=ammo,'Not enough ammunition for this order.');check(heat+heatCost<=100,'Weapons are too hot. Guard to cool the battery.');
 v.ammo-=ammo;b.heat[id]=heat+heatCost;const chance=Math.min(.95,Math.max(.25,(salvo?.76:.72)+v.upgrades.sensors*.05+level(s,'navigation')*.01-(b.range>500?.1:0)-heat*.001));
 if(rng(s)<chance){const base=legacyCombatPower(v)*(salvo?1.6:1),damage=Math.max(1,Math.round(base*(.85+rng(s)*.3)*(1-.08*target.armor)));target.hull=Math.max(0,target.hull-damage);combatLog(s,`${actorName(s,v)} hit ${target.name} for ${damage}${target.hull===0?' — disabled':''}.`);}
 else combatLog(s,`${actorName(s,v)} missed ${target.name}.`);earn(s,'navigation',2);
 }else if(arg.order==='guard'){b.guarded.push(id);b.heat[id]=Math.max(0,heat-30);combatLog(s,`${actorName(s,v)} guards its approach and cools weapons.`);}
 else if(arg.order==='repair'){check(v.spares>0&&v.hull<100,'A spare assembly and damage are required.');v.spares--;const repair=Math.min(100-v.hull,18+level(s,'engineering'));v.hull+=repair;b.heat[id]=Math.max(0,heat-10);earn(s,'engineering',6);combatLog(s,`${actorName(s,v)} restored ${repair} integrity using a spare.`);}
 else if(arg.order==='burn'){const burn=fleetManeuverFuel(s,.05);spendFleetFuel(s,burn);b.evaded.push(...actors(s).map(v=>actorID(s,v)));b.heat[id]=Math.max(0,heat-10);b.range=Math.min(2000,b.range+30);combatLog(s,`${actorName(s,v)} spent ${burn.toFixed(2)} t on an evasive correction.`);}
 else throw Error('Choose a tactical order.');
 b.acted.push(id);
 if(b.enemies.every(e=>e.hull===0)){finishBattle(s,'victory');return;}
 if(actors(s).every(a=>b.acted.includes(actorID(s,a))))enemyTurn(s);
}
function enemyTurn(s){
 const b=s.battle;
 for(const enemy of b.enemies.filter(e=>e.hull>0)){
 if(enemy.heat>=70||enemy.intent==='cool'||enemy.ammo===0){enemy.heat=Math.max(0,enemy.heat-35);combatLog(s,`${enemy.name} cooled its battery.`);continue;}
 const escorts=s.fleet.filter(v=>v.escort&&v.hull>0),v=enemy.intent==='flank'&&escorts.length?escorts[Math.floor(rng(s)*escorts.length)]:s,id=actorID(s,v);
 enemy.ammo--;enemy.heat=Math.min(100,enemy.heat+30);const chance=.68-(b.guarded.includes(id)?.20:0)-(b.evaded.includes(id)?.20:0);
 if(rng(s)<chance){const damage=Math.max(1,Math.round(enemy.damage*(.85+rng(s)*.3)*(1-.12*v.upgrades.armor)*(b.guarded.includes(id)?.45:1)));v.hull=Math.max(0,v.hull-damage);combatLog(s,`${enemy.name} hit ${actorName(s,v)} for ${damage}${v.hull===0?' — destroyed':''}.`);if(v.hull===0){destroyShip(s,v);if(!s.battle)return;}}
 else combatLog(s,`${enemy.name} missed ${actorName(s,v)}.`);
 }
 if(b.round>=12){finishBattle(s,'inconclusive');return;}
 b.round++;b.acted=[];b.guarded=[];b.evaded=[];
 for(const id of Object.keys(b.heat))b.heat[id]=Math.max(0,b.heat[id]-15);
 b.enemies.forEach((e,i)=>{e.heat=Math.max(0,e.heat-10);e.intent=(b.round+i)%4===0?'cool':i%2?'flank':'press';});
}
// One station-local selection governs every dock service. Bulk jobs reuse the
// ordinary per-hull service rules and charges, committing as one transaction.
function dryDockSelection(s,selection='all'){
 const local=s.fleetLoss?[]:[activeHull(s),...s.fleet].filter(v=>v.location===s.location),active=local.filter(v=>v.id===s.flagshipID||(v.escort&&v.hull>0)),berthed=local.filter(v=>!active.some(a=>a.id===v.id)),vessels=selection==='all'?local:selection==='active'?active:selection==='berthed'?berthed:local.filter(v=>v.id===selection);
 const reason=!s.profile.created?'Sign your captain charter first.':s.fleetLoss?'Recover command of a surviving ship first.':s.incident||s.battle?'Resolve the encounter before using the dry dock.':!vessels.length?'Choose a ship at this station.':'';
 return {selection,local,active,berthed,vessels,reason};
}
function dryDockAmmo(s,selection='all'){
 const selected=dryDockSelection(s,selection),types=[];
 for(const v of selected.vessels)for(const w of shipRules.weaponFits(v).filter(w=>w.slot!=='laser'&&w.count))if(!types.includes(w.type))types.push(w.type);
 return types.map(type=>{const hulls=selected.vessels.map(v=>({v,w:shipRules.weaponFits(v).find(w=>w.type===type&&w.count)})).filter(x=>x.w),name={coil:'Coilgun rounds',rail:'Railgun rounds',cannon:'Cannon rounds',missile:'Guided missiles',torpedo:'Heavy torpedoes'}[type];return {type,name,ships:hulls.length,aboard:hulls.reduce((n,{v,w})=>n+(v[w.slot==='weapons'?'ammo':'ordnanceAmmo']||0),0),capacity:hulls.reduce((n,{w})=>n+w.magazine,0),stocked:portFacilities(s.location).ammoTypes.includes(type)};});
}
function dryDockQuote(s,selection,service,{amount,fill=false}={}){
 const selected=dryDockSelection(s,selection),operations=[];let reason=selected.reason,units=0;
 if(!['fuel','repair','spares','ammo-coil','ammo-rail','ammo-cannon','ammo-missile','ammo-torpedo'].includes(service))reason=reason||'Choose a dry-dock service.';
 if(!reason&&service==='fuel'){
 const room=selected.vessels.reduce((n,v)=>n+Math.max(0,effectiveShip(v).tankTonnes-v.fuel),0),total=fill?room:finite(amount,.0001,100000000)?Math.min(amount,room):0;
 if(!fill&&!total)reason='Enter a positive amount of propellant.';
 for(const v of selected.vessels){const space=Math.max(0,effectiveShip(v).tankTonnes-v.fuel),load=room?total*space/room:0;if(load>.0001){operations.push({id:v.id,service:'fuel',target:Math.min(effectiveShip(v).tankTonnes,v.fuel+load),cost:hullFuelCost(s,v,load),units:load});units+=load;}}
 if(!operations.length)reason=reason||(room<.0001?'Selected tanks are full.':'Choose a larger propellant load.');
 }else if(!reason&&service==='repair'){
 for(const v of selected.vessels)if(v.hull<100){const cost=repairQuote(s,v).cost;if(cost)operations.push({id:v.id,service:'repair',cost,units:1});}units=operations.length;
 if(!units)reason='Selected hulls are intact.';
 }else if(!reason&&service==='spares'){
 for(const v of selected.vessels){const n=effectiveShip(v).maxSpares-v.spares;if(n>0){operations.push({id:v.id,service:'spares',cost:n*sparePrice(s),units:n});units+=n;}}
 if(!units)reason='Selected spare stores are full.';
 }else if(!reason&&service.startsWith('ammo-')){
 const type=service.slice(5);if(!portFacilities(s.location).ammoTypes.includes(type))reason='This dry dock does not stock this ammunition.';
 else for(const v of selected.vessels){const w=shipRules.weaponFits(v).find(w=>w.type===type&&w.count);if(!w)continue;const field=w.slot==='weapons'?'ammo':'ordnanceAmmo',have=v[field]||0;let n=Math.max(0,Math.min(w.magazine-have,fill?w.magazine:1));
 while(n>0&&v.fittingEdition===2){const candidate={...v,[field]:have+n};if(shipRules.cargoAllocation(candidate).loadoutFits&&shipCargoFits(candidate))break;n--;}
 if(n>0){operations.push({id:v.id,service:w.slot==='weapons'?'ammo':'ordnance',amount:have+n,cost:n*(w.slot==='weapons'?20:type==='torpedo'?240:90),units:n});units+=n;}}
 if(!units&&!reason)reason='No compatible magazine space is available.';
 }
 const cost=operations.reduce((n,o)=>n+o.cost,0);if(!reason&&s.credits<cost)reason='Not enough available funds.';
 return {selection,service,operations,units,cost,shipCount:selected.vessels.length,servicedCount:operations.length,canService:!reason,reason};
}
function dryDockOverview(s){
 const local=s.fleetLoss?[]:[s,...s.fleet.filter(v=>v.location===s.location)],fuelTonnes=local.reduce((n,v)=>n+Math.max(0,effectiveShip(v).tankTonnes-v.fuel),0),fuelCharge=local.reduce((n,v)=>n+hullFuelCost(s,v,Math.max(0,effectiveShip(v).tankTonnes-v.fuel)),0),repairCharge=local.reduce((n,v)=>n+repairQuote(s,v).cost,0),repairCount=local.filter(v=>v.hull<100).length,total=fuelCharge+repairCharge;
 const reason=s.fleetLoss?'Recover command of a surviving reserve first.':s.incident?'Resolve the encounter before using the dry dock.':!total?'All ships at this station are fully fuelled and repaired.':s.credits<total?'Need '+(total-s.credits)+' more cr to refuel and repair all local ships.':'';
 return {shipIDs:local.map(v=>actorID(s,v)),shipCount:local.length,fuelTonnes,fuelCharge,repairCharge,repairCount,total,canService:!reason,reason};
}
function escortRoster(s){
 const assigned=s.fleet.filter(v=>v.escort).length,ready=s.fleet.filter(v=>!v.escort&&!v.carrierID&&!v.towID&&v.location===s.location&&v.hull>=35),blocked=s.fleet.filter(v=>!v.escort&&(v.carrierID||v.location!==s.location||v.hull<35)).map(v=>({id:v.id,name:v.name,reason:v.carrierID?'Deploy this craft from its carrier first.':v.location!==s.location?'Rendezvous at '+port(v.location).name+' · '+port(v.location).body+' before assigning this ship.':'Repair this hull to at least 35% integrity before assigning it.'}));
 const reason=s.fleetLoss?'Recover command of a surviving reserve first.':s.incident?'Resolve the encounter before changing escorts.':!ready.length?(blocked.length?'Other ships must be at your station with at least 35% integrity.':'All ready local ships are already assigned.'):'';
 return {assigned,maxEscorts:MAX_FLEET-1,readyIDs:ready.map(v=>v.id),blocked,canAssign:!reason,reason};
}
function fleetAction(s,type,arg){
 if(type==='battle-plan'){combat2.configureLive(s,arg);return;}
 if(type==='battle-tick'){combat2.tickLive(s,arg);return;}
 if(type==='battle-order'){check(!s.battle?.live,'Pause and use live command controls for this engagement.');battleOrder(s,arg);return;}
 check(!s.incident,'Resolve the encounter before using fleet services.');
 const target=arg.id?s.fleet.find(v=>v.id===arg.id):null;if(target?.towID)check(type==='service-ship','Detach a towed hull before changing command, cargo or fittings.');if(target?.carrierID)check(type==='service-ship','Deploy an embarked craft at a safe port before changing its command, cargo or fittings.');
 if(type==='dry-dock-service'){
 const q=dryDockQuote(s,arg.selection,arg.service,{amount:arg.amount,fill:arg.fill===true});check(q.canService,q.reason);check(arg.cost===undefined||arg.cost===q.cost,'The service quote changed; review it again.');
 // All funds, physical space and local suppliers are checked before any hull changes.
 const before=s.credits;for(const operation of q.operations)fleetAction(s,'service-ship',operation);check(before-s.credits===q.cost,'Dry-dock charge does not match its quote.');
 record(s,`Dry dock completed ${arg.service.startsWith('ammo-')?'ammunition loading':arg.service} for ${q.servicedCount} local ${q.servicedCount===1?'ship':'ships'}: ${q.cost} cr.`);
 }
 else if(type==='sell-ship'){
 const offer=registrySale(s,arg.id);check(offer.canSell,offer.reason);check(arg.price===undefined||arg.price===offer.salePrice,'The sale quote changed; review it again.');
 const v=registryHull(offer.vessel);v.escort=false;v.cargo={};v.cargoBasis={};v.ordnanceAmmo=v.ordnanceAmmo||0;v.fittingEdition=v.fittingEdition||1;
 (s.registryShips||(s.registryShips=[])).push({vessel:v,price:offer.fullPrice,proceeds:offer.salePrice,day:s.day,cataloguePrice:offer.hull});s.fleet=s.fleet.filter(x=>x.id!==v.id);s.credits+=offer.salePrice;
 record(s,`Sold ${v.name} at ${port(s.location).name} for ${offer.salePrice} cr, including ${offer.equipmentCredit} cr fitted-equipment credit. Its hull, condition and fittings remain at this registry; repurchase costs ${offer.fullPrice} cr.`);
 }
 else if(type==='purchase-registry-ship'){
 const offer=registryShips(s).find(r=>r.id===arg.id);check(offer,'This registered ship is no longer available here.');check(offer.canBuy,offer.reason);check(arg.price===undefined||arg.price===offer.price,'The purchase quote changed; review it again.');
 s.credits-=offer.price;const purchased=clone(offer.vessel);purchased.escort=true;s.fleet.push(purchased);s.registryShips=s.registryShips.filter(r=>r.vessel.id!==arg.id);
 record(s,`Purchased ${offer.vessel.name} from ${port(s.location).name} for ${offer.price} cr including its installed fittings. Condition and stores retained; ship joined the travelling fleet.`);
 }
 else if(type==='purchase-ship'){const offer=shipOffer(s,arg.ship);check(offer.canBuy,offer.buyReason);const base=ships.find(x=>x.id===arg.ship);claimShipStock(s,base.id);s.credits-=base.price;const id=uuid();s.fleet.push({id,name:generatedShipName(s,base.id,id),shipID:base.id,location:s.location,hull:100,fuel:base.tankTonnes*.25,spares:base.maxSpares,cargo:{},cargoBasis:{},upgrades:emptyUpgrades(),ammo:0,ordnanceAmmo:0,fittingEdition:2,escort:true});record(s,`Purchased ${s.fleet.at(-1).name} for ${base.price} cr at ${port(s.location).name}. Fleet now ${s.fleet.length+1} ships; existing flagship retained. New ship joined the travelling fleet with 25% fuel and standard laser.`);}
 else if(type==='switch-ship'){const next=s.fleet.find(v=>v.id===arg.id);check(next&&next.location===s.location,'Travel to the same station before switching ships.');check(next.hull>=15,'Repair the disabled ship before taking command.');const old=activeHull(s);copyCivilianHull(s,next);old.escort=true;const index=s.fleet.findIndex(v=>v.id===arg.id);s.fleet.splice(index,1,old);s.flagshipID=next.id;s.shipName=next.name;for(const k of ['shipID','hull','fuel','spares','cargo','upgrades','ammo'])s[k]=clone(next[k]);s.ordnanceAmmo=next.ordnanceAmmo||0;s.fittingEdition=next.fittingEdition||1;s.cargoBasis=clone(next.cargoBasis||{});if(next.freightCargo)s.freightCargo=clone(next.freightCargo);else delete s.freightCargo;record(s,`Transferred command to ${s.shipName}. Both ships keep their own stores and equipment.`);}
 else if(type==='assign-local-escorts'){const roster=escortRoster(s);check(roster.canAssign,roster.reason);for(const v of s.fleet)if(roster.readyIDs.includes(v.id))v.escort=true;record(s,`Assigned ${roster.readyIDs.length} ready local ships to the travelling fleet. ${roster.assigned+roster.readyIDs.length} escorts now accompany ${s.shipName}; cargo and fuel are shared. Ships at other stations remain berthed.`);}
 else if(type==='escort'){const v=s.fleet.find(v=>v.id===arg.id);check(v&&v.location===s.location,'An escort must be at your current station.');check(v.escort||v.hull>=35,'Repair escort integrity to at least 35%.');check(!v.passengers||v.escort===false,'Disembark passengers before berthing their ship.');v.escort=!v.escort;record(s,`${v.name} ${v.escort?'assigned as a traveling escort':'berthed at '+port(s.location).name}.`);}
 else if(type==='fit-upgrade'){const v=owned(s,arg.id||s.flagshipID);check(v===s||v.location===s.location,'This ship is at a different station.');const module=upgradeCatalog.find(u=>u.id===arg.module);check(module,'Choose an upgrade.');const supplier=portFacilities(s.location);check(supplier.spaceport,'Upgrades require a spaceport fleet registry.');check(supplier.upgrades.includes(module.id),'This fleet registry does not stock that upgrade type. Consult the ship & equipment directory.');const current=v.upgrades[module.id]||0;check(current<3,'This upgrade is already at its maximum level.');const cost=fittingCosts(v.shipID,module.id)[current];check(s.credits>=cost,'Not enough credits for this upgrade.');const candidate={...v,fittingEdition:2,upgrades:{...v.upgrades,[module.id]:current+1}};check(shipCargoFits(candidate),'Move or sell cargo before fitting equipment that reserves this hold space.');check(v.ammo<=shipRules.weaponFits(candidate)[1].magazine,'Unload excess regular ammunition before this refit.');check(shipRules.cargoAllocation(candidate).loadoutFits,'Unload ammunition before this refit.');s.credits-=cost;v.upgrades[module.id]=current+1;v.fittingEdition=2;record(s,`${actorName(s,v)}: fitted ${module.name.toLowerCase()} level ${current+1} for ${cost} cr.`);}
 else if(type==='service-all-ships'){const q=dryDockOverview(s);check(q.canService,q.reason);operatingExpense(s,q.repairCharge);s.credits-=q.total;for(const v of [s,...s.fleet.filter(v=>v.location===s.location)]){v.fuel=effectiveShip(v).tankTonnes;if(v.hull<100){v.hull=100;s.profile.stats.repairs++;}}record(s,`Dry dock refuelled and repaired all ${q.shipCount} local ships for ${q.total} cr: ${q.fuelCharge} cr propellant and ${q.repairCharge} cr hull repairs. Tanks full; integrity 100%.`);}
 else if(type==='service-ship'){const v=owned(s,arg.id||s.flagshipID);check(v===s||v.location===s.location,'This ship is at another station.');const sh=effectiveShip(v);let cost=0;
 if(arg.service==='fuel'){const target=arg.target===undefined?sh.tankTonnes:arg.target;check(finite(target,v.fuel+.0001,sh.tankTonnes+.0001),'Choose a propellant target within the tank limit.');cost=hullFuelCost(s,v,target-v.fuel);check(s.credits>=cost,'Not enough credits for this propellant load.');v.fuel=Math.min(target,sh.tankTonnes);}
 else if(arg.service==='repair'){cost=repairQuote(s,v).cost;check(cost>0&&s.credits>=cost,'Repairs are unnecessary or unaffordable.');v.hull=100;s.profile.stats.repairs++;}
 else if(arg.service==='ammo'||arg.service==='ordnance'){const slot=arg.service==='ammo'?'weapons':'ordnance',w=shipRules.weaponFits(v).find(w=>w.slot===slot),field=slot==='weapons'?'ammo':'ordnanceAmmo',have=v[field]||0;check(w.count>0,'This ship has no fitted weapon bank of that type.');check(portFacilities(s.location).ammoTypes.includes(w.type),'This dry dock does not stock '+w.name.toLowerCase()+' ammunition.');const target=arg.amount===undefined?w.magazine:arg.amount;check(integer(target,have+1,w.magazine),'Choose a load above the current quantity and within the magazine limit.');cost=(target-have)*(slot==='weapons'?20:w.type==='torpedo'?240:90);check(s.credits>=cost,'Not enough credits for ammunition.');const candidate={...v,[field]:target};if(v.fittingEdition===2)check(shipRules.cargoAllocation(candidate).loadoutFits&&shipCargoFits(candidate),'This ammunition would exceed the available cargo space. Choose a smaller load or unload goods.');v[field]=target;}
 else if(arg.service==='spares'){cost=(sh.maxSpares-v.spares)*sparePrice(s);check(cost>0&&s.credits>=cost,'Spares are full or unaffordable.');v.spares=sh.maxSpares;}
 else throw Error('Choose a service.');if(arg.service!=='fuel')operatingExpense(s,cost);s.credits-=cost;record(s,`${actorName(s,v)}: ${arg.service} service cost ${cost} cr.`);}
 else if(type==='transfer-cargo'){const v=s.fleet.find(v=>v.id===arg.id);check(v&&v.location===s.location,'Cargo can move only between ships at the same station.');good(arg.good);check(integer(arg.units,1,1000),'Choose a positive cargo quantity.');check(['to-flagship','to-reserve'].includes(arg.direction),'Choose a cargo transfer direction.');const from=arg.direction==='to-flagship'?v:s,to=arg.direction==='to-flagship'?s:v;check((from.cargo[arg.good]||0)-freightUnits(from,arg.good)>=arg.units,'Only owned cargo can be transferred manually; client freight stays with its carrying hull.');check(arg.units<=shipCargoRoom(to,arg.good),'The receiving hold is too small.');check(cargoCompatible(to,arg.good),'The receiving ship cannot handle this cargo.');const receipt=removeCargo(from,arg.good,arg.units);addCargo(to,arg.good,arg.units,receipt);record(s,`Transferred ${arg.units} units of ${good(arg.good).name.toLowerCase()} between locally docked ships.`);}
 else if(type==='accept-bounty'){acceptBounty(s,arg.id);}
 else if(type==='claim-bounty'){claimBounty(s,arg.id);}
 else if(type==='refresh-bounty-intel'){const r=localBounties(s).find(r=>r.id===arg.id&&r.accepted);check(r,'Accept this bounty before requesting updated intelligence.');recordPatrolLead(s,r.id);}
 else if(type==='start-raid'||type==='record-patrol-lead'){recordPatrolLead(s,arg.id);}
 else throw Error('Unknown fleet action.');
}

// Unconfirmed station reports guide normal arrival encounters; taking a report never launches combat.
function validatePatrolIntel(s){
 if(s.acceptedBounties!==undefined){const ids=new Set();check(Array.isArray(s.acceptedBounties)&&s.acceptedBounties.length<=7&&s.acceptedBounties.every(a=>{if(!a||!bountyTarget(a.id)||ids.has(a.id)||!integer(a.day,0,s.day)||!world.ports.some(p=>p.id===a.port)||!bountyTarget(a.id).groups.includes(port(a.port).group))return false;ids.add(a.id);return true;}),'Invalid accepted bounty register.');}

 if(s.patrolIntel===undefined||s.patrolIntel===null)return;const keys=new Set();
 check(Array.isArray(s.patrolIntel)&&s.patrolIntel.length<=128&&s.patrolIntel.every(r=>{
  if(!r||!world.ports.some(p=>p.id===r.port)||!world.ports.some(p=>p.id===r.source)||!integer(r.observedDay,0,s.day)||!integer(r.recordedDay,r.observedDay,s.day)||r.expiresDay!==r.observedDay+120||!integer(r.tier,1,3)||!str(r.id,120))return false;
  const target=r.bountyID==null?null:bountyTarget(r.bountyID),generic=r.bountyID==null&&r.id===`${r.source}-raid-${r.tier}-${Math.floor(r.observedDay/90)}`&&port(r.source).group===port(r.port).group;
  if(!generic&&(!target||r.id!=='bounty-'+target.id||r.tier!==target.tier||!target.groups.includes(port(r.port).group)||!target.groups.includes(port(r.source).group)))return false;
  const key=r.id+':'+r.observedDay+':'+r.source;if(keys.has(key))return false;keys.add(key);return true;
 }),'Invalid patrol sighting history.');
}
function patrolOffer(s,r){
 const availableHere=!r.bountyID||bountyTarget(r.bountyID).groups.includes(port(s.location).group),observedDay=Math.floor(s.day/30)*30;
 if(!availableHere||r.completed)return {...r,availableHere,recorded:false,suspectedPort:null,observedDay:null,expiresDay:null};
 const nearby=world.ports.filter(p=>p.group===port(s.location).group),seed=hash('patrol:'+r.id.replace(s.location+'-','')+':'+port(s.location).group+':'+observedDay),suspect=nearby[Number(seed%BigInt(nearby.length))];
 const recorded=(s.patrolIntel||[]).some(v=>v.id===r.id&&v.observedDay===observedDay&&v.port===suspect.id&&v.expiresDay>s.day);
 return {...r,availableHere,recorded,suspectedPort:suspect.id,observedDay,expiresDay:observedDay+120,detail:r.detail+` We think these raiders may be operating close to ${suspect.name}, above ${suspect.body}. Last report: day ${observedDay}. Their position is uncertain and may change. Watch for them on ordinary voyages; their position is unconfirmed.`};
}
function localBounties(s){return bountyOffers(s).filter(r=>r.availableHere&&!r.completed&&!r.captured&&r.suspectedPort&&hasAccess(s,r.suspectedPort));}
// Local postings plus the captain's already accepted warrants. Remote conversations
// may repeat saved dated intelligence, never fabricate a fresh remote sighting.
function conversationBounties(s){const local=localBounties(s),known=new Set(local.map(r=>r.id));return local.concat(bountyOffers(s).filter(r=>r.accepted&&!r.completed&&!r.captured&&!known.has(r.id)).map(r=>{const last=(s.patrolIntel||[]).filter(v=>v.bountyID===r.bountyID).sort((a,b)=>b.observedDay-a.observedDay)[0];return {...r,remote:true,recorded:true,suspectedPort:last?.port??null,observedDay:last?.observedDay??null};}));}
function acceptBounty(s,id){
 check(s.profile.created,'Sign your charter before accepting a bounty.');const r=localBounties(s).find(r=>r.id===id);check(r,'This warrant is not available at this patrol office.');check(!r.accepted,'You have already accepted this bounty.');
 if(!r.recorded)recordPatrolLead(s,r.id);s.acceptedBounties=[...(s.acceptedBounties||[]),{id:r.bountyID,day:s.day,port:s.location}];
 record(s,`Accepted bounty: ${r.title}. Posted payment ${r.reward} cr after confirmed capture. Last known activity near ${port(r.suspectedPort).name}. The warrant remains accepted until capture; location intelligence can expire.`);return r;
}
function claimBounty(s,id){
 check(s.profile.created,'Sign your charter before claiming a bounty.');check(establishments(s.location,false,s).some(v=>v.id==='security'),'Bounties are claimed at a patrol office.');
 const r=bountyOffers(s).find(v=>v.id===id),capture=r&&capturedBounty(s,r.bountyID);check(capture,'There is no unpaid confirmed capture for this bounty.');check(s.credits+capture.reward<=999999999,'Make room in available funds before collecting this bounty.');
 s.credits+=capture.reward;s.capturedBounties=s.capturedBounties.filter(v=>v.id!==capture.id);record(s,`Claimed bounty: ${r.title}. ${capture.reward} cr paid at ${port(s.location).name} for the capture confirmed on day ${capture.day}. This warrant is permanently settled.`);
}
function bountyConversation(s,node){const id=node?.startsWith('bounty-')?node:null;return id?conversationBounties(s).find(r=>r.id===id)||null:null;}
function recordPatrolLead(s,id){
 check(s.profile.created,'Choose your captain before receiving patrol intelligence.');const r=raidOffers(s).find(r=>r.id===id&&!r.completed&&r.availableHere);check(r&&r.suspectedPort,'No current local report is available for that group.');check(!r.recorded,'You already have the current target intelligence.');
 if(!s.patrolIntel)s.patrolIntel=[];s.patrolIntel.push({id:r.id,port:r.suspectedPort,source:s.location,observedDay:r.observedDay,recordedDay:s.day,expiresDay:r.expiresDay,tier:r.tier,...(r.bountyID?{bountyID:r.bountyID}:{})});s.patrolIntel=s.patrolIntel.slice(-128);
 record(s,`Patrol intelligence received: ${r.title}. Possible activity near ${port(r.suspectedPort).name}; report from day ${r.observedDay}. No launch or engagement ordered.`);
}
function patrolSeparation(a,b,day){
 a=port(a);b=port(b);if(a.id===b.id)return 0;
 const pos=(p,local)=>{const angle=local?Number(hash(p.id)%6283n)/1000+2*Math.PI*day/orbitPeriod(p):p.phase+2*Math.PI*day/p.period,r=local?p.radius:p.au*149597870.7;return [r*Math.cos(angle),r*Math.sin(angle)];};
 const local=a.group===b.group,x=pos(a,local),y=pos(b,local);return Math.hypot(x[0]-y[0],x[1]-y[1]);
}
function patrolActivity(s,dest,arrivalDay=s.day){
 port(dest);const latest=new Map();for(const r of s.patrolIntel||[]){if(r.expiresDay<=arrivalDay||r.bountyID&&claimedBounty(s,r.bountyID))continue;const key=r.bountyID||r.id,old=latest.get(key);if(!old||r.observedDay>=old.observedDay)latest.set(key,r);}
 const reports=[...latest.values()].map(r=>{const distanceKM=patrolSeparation(dest,r.port,arrivalDay),freshness=Math.max(0,1-(arrivalDay-r.observedDay)/120),proximity=distanceKM>3200000?0:1/(1+(distanceKM/400000)**2),score=freshness*proximity;return {...r,distanceKM,freshness,proximity,score};}).filter(r=>r.score>.001).sort((a,b)=>b.score-a.score);
 return {bonus:reports.length?.18*reports[0].score:0,reports};
}
function wantedArrival(s,dest){
 const activity=patrolActivity(s,dest,s.day),targets=notoriousRaiders.filter(v=>v.groups.includes(port(dest).group)&&!claimedBounty(s,v.id));
 if(!targets.length)return null;const eligible=targets.filter(v=>combat2.namedEligible(s,v));if(!eligible.length)return null;
 const scores=new Map(activity.reports.filter(r=>r.bountyID).map(r=>[r.bountyID,r.score])),best=Math.max(0,...eligible.map(v=>scores.get(v.id)||0));
 if(rng(s)>=.45+.45*best)return null;const weights=eligible.map(v=>1+12*(scores.get(v.id)||0)),total=weights.reduce((a,b)=>a+b,0);let draw=rng(s)*total;for(let i=0;i<eligible.length;i++){draw-=weights[i];if(draw<=0)return eligible[i];}return eligible.at(-1);
}

// Paid dockside leads use saved simulation randomness and never grant access or rewards.
function validateCanteen(s){
 if(s.canteenRounds===undefined||s.canteenRounds===null)return;
 const ids=new Set(),days=new Set();
 check(Array.isArray(s.canteenRounds)&&s.canteenRounds.length<=80&&s.canteenRounds.every(r=>{
  if(!r||!str(r.id,80)||!r.id||ids.has(r.id)||!world.ports.some(p=>p.id===r.port)||!integer(r.day,0,s.day)||!integer(r.cost,1,200)||!str(r.speaker,100)||!r.speaker||!str(r.contact,80)||!str(r.title,160)||!str(r.text,4000)||typeof r.heard!=='boolean'||!['none','routes','stations','pirates','prices'].includes(r.category)||r.heard!==(r.category!=='none')||(r.target!==undefined&&r.target!==null&&!world.ports.some(p=>p.id===r.target))||(r.good!==undefined&&r.good!==null&&!goods.some(g=>g.id===r.good))||days.has(r.port+':'+r.day))return false;
  ids.add(r.id);days.add(r.port+':'+r.day);return true;
 }),'Invalid canteen round history.');
}
// Original heard reports are snapshots, never refreshed from today's markets on a journal read.
const MAX_TRADE_RUMORS=120;
function tradeRumorKey(r){return JSON.stringify([r.day,r.port,r.speaker,r.contact,r.good,r.target]);}
function rumorHistoryID(kind,id){return kind+':'+hash(id).toString(16);}
function validateTradeRumors(s){
 if(s.tradeRumors===undefined||s.tradeRumors===null)return;
 const ids=new Set();check(Array.isArray(s.tradeRumors)&&s.tradeRumors.length<=MAX_TRADE_RUMORS&&s.tradeRumors.every(r=>{
  if(!r||!str(r.id,80)||!r.id||ids.has(r.id)||!integer(r.day,0,s.day)||!world.ports.some(p=>p.id===r.port)||!world.ports.some(p=>p.id===r.target)||!goods.some(g=>g.id===r.good)||!str(r.speaker,100)||!r.speaker||!str(r.contact,80)||!str(r.venue,160)||!r.venue||!str(r.title,160)||!str(r.text,4000)||!['conversation','overheard','round'].includes(r.source))return false;
  ids.add(r.id);return true;
 }),'Invalid trade rumor journal.');
}
function tradeRumorJournal(s){
 const rows=(s.tradeRumors||[]).map(r=>({...r})),venueAt=pid=>establishments(pid,false,s).find(v=>v.id==='local').name;
 for(const r of s.canteenRounds||[])if(r.category==='prices'&&r.good)rows.push({id:rumorHistoryID('round',r.id),day:r.day,port:r.port,venue:venueAt(r.port),speaker:r.speaker,contact:r.contact,source:'round',title:r.title,text:r.text,good:r.good,target:r.target||r.port});
 // Compatibility for retained authored conversations: recover only explicit original cargo reports.
 for(const d of s.dialogue||[]){
  if(d.venue!=='local'||d.speaker===s.profile.name||!d.text.includes('prices may change')||!['A crew from **','I heard **','A supplier mentioned **'].some(prefix=>d.text.includes(prefix)))continue;
  const g=goods.slice().sort((a,b)=>b.name.length-a.name.length).find(g=>d.text.toLowerCase().includes('**'+g.name.toLowerCase()+'**'));if(!g)continue;
  const target=world.ports.find(p=>d.text.includes('A crew from **'+p.name+'**')||d.text.includes('A crew from **'+stationLabel(p)+'**')||d.text.includes('I heard **'+p.name+'**')||d.text.includes('I heard **'+stationLabel(p)+'**'));
  rows.push({id:rumorHistoryID('dialogue',d.id),day:d.day,port:d.port,venue:venueAt(d.port),speaker:d.speaker,contact:d.contact||'',source:'conversation',title:'A cargo-price lead',text:d.text,good:g.id,target:target?.id||d.port});
 }
 const unique=new Map();for(const r of rows){const key=tradeRumorKey(r);if(!unique.has(key))unique.set(key,r);}
 return [...unique.values()].map((r,i)=>({...r,order:i})).sort((a,b)=>b.day-a.day||b.order-a.order).slice(0,MAX_TRADE_RUMORS).map(({order,...r})=>({...r,ageDays:s.day-r.day,station:port(r.port).name,body:port(r.port).body,commodity:good(r.good).name,dealStation:port(r.target).name,dealBody:port(r.target).body}));
}
function rememberTradeRumor(s,lead,host,contact,source,id=uuid()){
 if(!lead.good)return;
 if(!s.tradeRumors)s.tradeRumors=tradeRumorJournal(s).map(({ageDays,station,body,commodity,dealStation,dealBody,...r})=>r).reverse();
 const row={id,day:s.day,port:s.location,venue:establishments(s.location,false,s).find(v=>v.id==='local').name,speaker:host.person,contact,source,title:lead.title,text:lead.text,good:lead.good,target:lead.target||s.location};
 if(!s.tradeRumors.some(r=>tradeRumorKey(r)===tradeRumorKey(row)))s.tradeRumors.push(row);
 s.tradeRumors=s.tradeRumors.slice(-MAX_TRADE_RUMORS);
}
function canteenOffer(s){
 const cost=45+Math.ceil(8*Math.log2(1+system(port(s.location).group).au))+(port(s.location).kind==='moon'?5:0),boughtToday=(s.canteenRounds||[]).some(r=>r.port===s.location&&r.day===s.day);
 const reason=s.incident?'Resolve the current encounter first.':!s.profile.created?'Choose your captain before visiting the canteen.':boughtToday?'You already bought a round here today. Fresh news may arrive when the ship’s calendar advances.':s.credits<cost?'Not enough cash for this round.':'';
 return {cost,boughtToday,canPurchase:!reason,reason,recent:(s.canteenRounds||[]).filter(r=>r.port===s.location).slice(-3).reverse()};
}
// Rank obtainable, stocked legal cargo only. Forecasts follow the same yearly calendar as the exchange.
function marketRumorLeads(s){
 const eligible=goods.filter(g=>marketAccess(s,g.id).canBuy&&marketStock(s,g.id,s.location,false).available>0),targets=world.ports.filter(p=>p.id!==s.location&&hasAccess(s,p.id));
 const here=new Map(eligible.map(g=>[g.id,marketState(s,g.id)])),leads=[],tank=fleetOverview(s).tankTonnes;
 for(const p of targets){const flight=quote(s,p.id);if(flight.minimumFuel>tank)continue;const arrival=s.day+flight.coastDays+flight.waitDays;if(arrival>365250)continue;
  for(const g of eligible){const from=here.get(g.id),now=marketState(s,g.id,p.id),forecast=now,stock=marketStock(s,g.id,s.location,false).available,margin=(forecast.sell-from.buy)/from.buy;
   leads.push({target:p.id,good:g.id,buy:from.buy,sell:now.sell,forecastSell:forecast.sell,arrival,stock,margin,observedDay:s.day,estimate:true,season:from.season});
  }
 }
 return leads.sort((a,b)=>b.margin-a.margin||a.target.localeCompare(b.target)||a.good.localeCompare(b.good));
}
// Broker guidance is derived only when asked: exchange transactions retain their cached daily quotes.
// Compare like-for-like local quotes across the full pricing cycle, never a cheap unit with an expensive commodity.
// Read the same local reserve and procurement model used by actual exchange orders.
function productionBriefing(s,pid=s.location,day=s.day){
 const model=marketEconomy,book=marketBook({...s,day}),local=model.processes.filter(p=>p.port===pid);
 let next;if(book&&day<365249){next=marketNextCache.get(book);if(!next){next=model.advanceNetwork(clone(book),day+1,marketBlockadeCalendar(s),industrialProcessValue);marketNextCache.set(book,next);}}
 return local.map(p=>{const flow=next?.lastFlows?.processes.find(f=>f.process===p.id),planned=model.processActivity(p,day),actual=flow?.actual??planned;return {id:p.id,good:p.good,kind:p.kind,tier:p.tier,inputs:Object.keys(p.inputs),outputs:Object.keys(p.outputs),planned,actual,limited:actual<planned-1e-6,storageLimited:!!flow?.storageLimited,missing:actual<planned-1e-6?(flow?.missing||[]):[]};});
}
function productionTalk(s){
 const rows=productionBriefing(s),limited=rows.filter(p=>p.limited),names=ids=>[...new Set(ids)].map(id=>good(id).name.toLowerCase()).join(', ');
 if(limited.length){const p=limited.sort((a,b)=>a.actual/Math.max(1e-9,a.planned)-b.actual/Math.max(1e-9,b.planned)||a.id.localeCompare(b.id))[0];if(p.storageLimited)return `The **${good(p.good).name.toLowerCase()}** line is ${p.actual<1e-6?'idle':'running below schedule'} because its output stores are filling. We hold the batch and its ingredients until there is room for every coproduct. Local use and outgoing cargo free space; more feedstock will not remove that bottleneck.`;return `The **${good(p.good).name.toLowerCase()}** line is ${p.actual<1e-6?'idle':'running below schedule'}. We are short of **${names(p.missing)||names(p.inputs)}**. Those ingredients must reach our local stores before the next daily batch can run.\n\nYou can sell suitable cargo to this exchange; a cargo tip or a client’s sealed freight is not a supply delivery. Other lines keep working if they have their own inputs. Missed batches are not made up for free.`;}
 const p=rows.filter(p=>p.inputs.length).sort((a,b)=>b.planned-a.planned)[0];return p?`Our lines have their required feedstock for the next batch. **${good(p.good).name.toLowerCase()}** uses **${names(p.inputs)}**; its output is planned around those deliveries.\n\nA shortage can still slow or stop a line. We use the ingredients already in stores, recover useful byproducts from the same batch, and wait for the next day before using newly made materials in another plant. The Guide lists the full recipes.${rows.some(p=>marketEconomy.utilityFunding.goods.includes(p.good))?' Essential treatment services receive station funding when their sale tariff cannot cover the work.':''}`:'This station’s collection contracts bring in primary resources. The powered collectors still have a daily capacity; a full shelf is not an unlimited deposit.';
}
function marketSupplyBriefing(s,id,pid=s.location,day=s.day){
 const g=good(id),flow=marketEconomy.supply(pid,id,day),profile=marketEconomy.stationProfiles[pid],stock=marketStock({...s,day},id,pid),later=Math.min(365250,day+30),future=marketEconomy.supply(pid,id,later),quote=marketState({...s,day},id,pid);
 return {good:id,name:g.name,port:pid,station:port(pid).name,day,role:flow.role,industry:profile.description,stock:stock.quantity,offeredStock:stock.available,capacity:stock.capacity,storageFull:stock.receivingRoom===0,production:stock.production,consumption:stock.consumption,networkFlow:stock.networkFlow,reserve:stock.quantity/Math.max(1,stock.baseline),normalStock:stock.baseline,smallReserve:profile.size<=6,slowRestock:flow.turnoverDays>=60,leadDays:profile.lead,season:quote.season,supply:quote.supply,reserveTrend:future.reserve-flow.reserve,lines:productionBriefing(s,pid,day).filter(p=>p.outputs.includes(id))};
}
function marketSupplyStory(f,voice='broker'){
 const subject=`**${f.name.toLowerCase()}**`,where=voice==='broker'?'here':`at **${f.station}**`,role=f.role==='export'?`Consignments of ${subject} are produced for export ${where}; output exceeds local use`:f.role==='import'?`Consignments of ${subject} are brought in ${where} to meet local consumption`:f.role==='transit'?`Consignments of ${subject} pass through ${where} for redistribution rather than local production`:`The ${subject} quote ${where} is for resale cargo, rather than part of the regular supply catalogue`;
 const limited=f.lines?.some(p=>p.limited),full=f.lines?.some(p=>p.storageLimited),factory=full?' Some local output is paused for storage space; outgoing cargo or local use can restart it.':limited?' Some local output is curtailed by missing feedstock. Selling the required ingredients here can restart later daily batches.':'';
 const reserves=f.storageFull?'The local stores are full; production and new purchases wait for storage room':f.stock===0?'The physical stores are exhausted':f.stock<Math.max(1,f.normalStock*.35)?'The physical reserves have been drawn down':f.reserve<.9?'Consumption and the supply schedule have left reserves low':f.reserve>1.1?'Reserves are well supplied':'Reserves are holding near their usual level';
 const schedule=f.reserveTrend>.025?'The regular production and delivery schedule points toward fuller reserves over the next month':f.reserveTrend<-.025?'The regular production and delivery schedule points toward tighter reserves over the next month':'The regular production and delivery schedule points toward fairly level reserves over the next month';
 return `${role}.${factory} ${reserves}${f.role==='resale'?'; I would not promise a new wholesale lot':f.slowRestock?'; replenishment takes longer here than at a major terminal':f.smallReserve?'; the small local reserve can be emptied by a few cargoes':''}.\n\n${schedule}; that is an outlook, not a promised shipment.`;
}
function marketTalkOpening(host){
 const families={direct:['blunt','forthright','brisk','taciturn','pragmatic'],precise:['meticulous','methodical','exacting','deliberate','formal'],warm:['warm','hospitable','reassuring','patient','protective'],wry:['wry','deadpan','self-deprecating','irreverent','playful'],curious:['curious','skeptical'],lively:['lively','animated','enthusiastic','optimistic','competitive']},style=Object.keys(families).find(k=>families[k].includes(host.character.tone))||'reflective';
 return {direct:'Let’s look at what is actually moving.',precise:'I would check the reserve against the supply record.',warm:'Let’s make sure the cargo fits what people here need.',wry:'A full warehouse makes a better story than an empty promise.',curious:'The useful question is where the cargo comes from and who uses it.',reflective:'A station’s needs outlast any one arrival.',lively:'There is a pattern in those deliveries if you watch it.'}[style];
}
function marketLogisticsTalk(s,contact='',season=false,venue='local'){
 const heard=venue==='local'?tradeRumorJournal(s).find(r=>r.port===s.location&&r.contact===contact&&r.day===s.day):null,eligible=goods.filter(g=>marketAccess(s,g.id).canBuy),selected=heard?good(heard.good):eligible.map(g=>({g,f:marketSupplyBriefing(s,g.id)})).sort((a,b)=>a.f.reserve-b.f.reserve||a.g.id.localeCompare(b.g.id))[0]?.g;
 if(!selected)return 'I have no cleared commodity to discuss against this board today.';
 const pid=heard?.target||s.location,f=marketSupplyBriefing(s,selected.id,pid),context=heard?`The report you heard on **day ${heard.day}** concerns **${selected.name.toLowerCase()}** at **${f.station}**.`:`At **${f.station}**, ${f.industry}`;
 return context+'\n\n'+marketSupplyStory(f,'canteen')+(season?'\n\nLoading and unloading change both the lots left and later quotes. A large order clears progressively against the stock curve; check the total before committing.':'');
}
function brokerMarketBriefing(s){
 const rows=goods.filter(g=>marketAccess(s,g.id).canBuy||tradableQuantity(s,g.id)>0||(s.warehouses?.[s.location]?.cargo[g.id]||0)>0).map(g=>{
  const quote=marketState(s,g.id),samples=Array.from({length:12},(_,m)=>marketState({day:Math.min(365250,Math.floor((Math.floor(s.day/marketEconomy.cycleDays)+m/12)*marketEconomy.cycleDays))},g.id,s.location));
  const median=key=>samples.map(q=>q[key]).sort((a,b)=>a-b).slice(5,7).reduce((a,b)=>a+b,0)/2;
  const usualBuy=median('buy'),usualSell=median('sell'),stock=marketStock(s,g.id,s.location,false).available,fleet=tradableQuantity(s,g.id),warehouse=s.warehouses?.[s.location]?.cargo[g.id]||0;
  return {good:g.id,name:g.name,quote,usualBuy,usualSell,buyRatio:quote.buy/usualBuy,sellRatio:quote.sell/usualSell,stock,fleet,warehouse,supplyContext:marketSupplyBriefing(s,g.id),canBuy:marketAccess(s,g.id).canBuy};
 });
 const bargains=rows.filter(r=>r.canBuy&&r.stock>0).sort((a,b)=>a.buyRatio-b.buyRatio||a.good.localeCompare(b.good)),premiums=rows.slice().sort((a,b)=>b.buyRatio-a.buyRatio||a.good.localeCompare(b.good));
 const cargo=rows.filter(r=>r.fleet+r.warehouse>0).map(r=>({...r,assessment:saleAssessment(s,r.good,1,s.location,{kind:r.fleet?'fleet':'warehouse'})})).sort((a,b)=>b.sellRatio-a.sellRatio||a.good.localeCompare(b.good));
 const known=world.ports.filter(p=>p.id!==s.location&&s.visited.includes(p.id)&&hasAccess(s,p.id));let route=null;
 for(const r of bargains)for(const p of known){const bid=marketState(s,r.good,p.id).sell,margin=bid-r.quote.buy;if(margin>0&&(!route||margin/r.quote.buy>route.margin/route.buy))route={good:r.good,name:r.name,target:p.id,station:p.name,buy:r.quote.buy,sell:bid,margin};}
 return {day:s.day,station:port(s.location).name,bargains,premiums,cargo,route};
}
function brokerMarketAdvice(s,topic){
 if(topic==='tree-market-production')return productionTalk(s);
 const b=brokerMarketBriefing(s),money=n=>n.toLocaleString('en-US'),buy=r=>`the asking price for **${r.name.toLowerCase()}** is **${money(r.quote.buy)} cr per unit**`,discount=r=>Math.round((1-r.buyRatio)*100),premium=r=>Math.round((r.buyRatio-1)*100),stamp=`Here at **${b.station}**, on **day ${b.day}**`;
 if(topic==='tree-market-route'){
  const r=b.route;return r?`**${r.station}** is currently bidding **${money(r.sell)} cr per unit** for **${r.name.toLowerCase()}**, while this exchange asks **${money(r.buy)} cr** on **day ${b.day}**.

You have visited that port; compare the route fuel and provisions before loading, because its price can move before you arrive.`:'I have no worthwhile outward price difference to point out among the ports you have visited and can enter today. Keep your cash for a better lot instead of filling a hold just to leave it full.';
 }
 if(topic==='tree-market-selling'){
  const r=b.cargo[0];if(!r)return 'You have no unreserved trade goods in your travelling holds or local warehouse for me to price. Buy a modest lot first, and keep enough cash for the voyage; another client’s sealed freight is not yours to sell.';
  const a=r.assessment,source=r.fleet?'travelling holds':'local warehouse',basis=['profit','loss','even'].includes(a.status)?` ${a.profit>0?'That is above':a.profit<0?'That is below':'That matches'} the recorded purchase cost in your ${source}${a.profit?' by **'+money(Math.abs(a.profit))+' cr per unit**':''}, before voyage expenses.`:'';
  return `I would look at your **${r.name.toLowerCase()}** first: we pay **${money(r.quote.sell)} cr per unit** on **day ${b.day}**, and you have **${r.fleet+r.warehouse} units** between your travelling holds and local warehouse.${basis}

You can sell directly from the ${source}; choose the quantity rather than unloading everything by habit.`;
 }
 if(topic==='tree-market-premiums'){
  const r=b.premiums[0];if(!r)return 'There are no goods on your cleared trading list for me to quote yet.';
  return `${stamp}, ${buy(r)}${r.buyRatio>=1.06?`, about **${premium(r)}% above** its usual local buying price`:'; none of your cleared goods is sharply above its usual local buying price today'}.

${r.buyRatio>=1.06?`I would buy only what you need; if you already own some, we pay **${money(r.quote.sell)} cr**.`:'Keep an eye on the spread, even on an ordinary day.'}${!r.stock?' The listed lot is sold out just now.':''}\n\n${marketSupplyStory(r.supplyContext)}`;
 }
 const r=b.bargains[0];if(!r)return 'There is no stocked lot on your cleared trading list that I would point you toward today. Keep hold space and cash for the next supply run.';
 if(topic==='tree-market-bargains')return `${stamp}, ${buy(r)}${r.buyRatio<=.94?`, about **${discount(r)}% below** its usual local buying price`:'; that is the closest to a bargain on your cleared list, though there is no deep discount today'}.

There are **${r.stock} units** left${r.quote.supply==='Plentiful'?', with plenty of supply keeping the trading spread narrow':''}; start with what your cash and hold can spare, then check a buyer before you commit.\n\n${marketSupplyStory(r.supplyContext)}\n\nAs cargo leaves the shelf, later asks can rise; check your order total.`;
 const expensive=b.premiums[0];return `${stamp}, I would start by checking **${r.name.toLowerCase()}** at **${money(r.quote.buy)} cr per unit**${r.buyRatio<=.94?`—about **${discount(r)}% below** its usual local price`:`, although I would not call today's board a clearance sale`}.

${expensive&&expensive.buyRatio>=1.06?`The **${expensive.name.toLowerCase()}** quote is running high at **${money(expensive.quote.buy)} cr**; worth checking your own holds before buying more.`:'Tell me whether you are looking to load cargo or sell what you brought, and I can narrow it down.'}\n\n${marketSupplyStory(r.supplyContext)}`;
}
function tradeRumorText(s,lead){
 if(!lead){const local=goods.filter(g=>marketAccess(s,g.id).canBuy&&marketStock(s,g.id,s.location,false).available>0).map(g=>({g,q:marketState(s,g.id)})).sort((a,b)=>a.q.price/a.g.base-b.q.price/b.g.base)[0];
  return {title:'A cautious market tip',...(local?{good:local.g.id}:{}),text:local?`A supplier mentioned **${local.g.name.toLowerCase()}** at **${local.q.buy} cr per unit** here on **day ${s.day}**, during ${local.q.season.toLowerCase()}. I have no worthwhile licensed outward deal to recommend; prices may change before you find a buyer.\n\n${marketSupplyStory(marketSupplyBriefing(s,local.g.id),'canteen')}\n\nQuotes respond as the available lots change; a dated tip is not a standing offer.`:'No stocked cargo lead fits your current access and ship today. Crews are waiting for the next supply run rather than promising an easy profit.'};
 }
 const g=good(lead.good),p=port(lead.target),trend=marketEconomy.supply(p.id,g.id,lead.arrival+30).seasonalPrice-marketEconomy.supply(p.id,g.id,lead.arrival).seasonalPrice;
 const origin=marketSupplyBriefing(s,g.id),receiving=marketSupplyBriefing(s,g.id,p.id,s.day);
 return {title:lead.margin>.04?'A promising seasonal cargo lead':'A warning about a thin margin',target:p.id,good:g.id,text:`A crew from **${p.name}** says their exchange is paying **${lead.sell} cr per unit** for **${g.name.toLowerCase()}**, against **${lead.buy} cr** here on **day ${s.day}**. There are **${lead.stock} units** on this exchange’s board.

That is a report from **day ${s.day}**, not a bid held for your arrival. Check the voyage planner for the loaded route budget and a fresh outlook; a promising spread can disappear into fuel, delays or a buyer’s limited allowance.

${marketSupplyStory(origin,'canteen')}\n\nAt **${p.name}**, ${receiving.role==='export'?'local production supplies this commodity':receiving.role==='import'?'local consumption depends on imported lots':receiving.role==='transit'?'the exchange redistributes arriving consignments':'the exchange can buy resale cargo without regularly stocking it'}. ${receiving.slowRestock?'Their reserves take longer to rebuild than a major terminal’s. ':receiving.smallReserve?'They keep only a small local reserve. ':''}\n\nThese are dated reports; prices may change while you travel. Quotes can move within a ship-day as lots are bought or sold. Fuel, provisions and delays come out of that margin, and the receiving exchange makes the final offer.`};
}
function canteenTradeTalk(s,contact=''){
 const cycle=Math.floor(s.day/14),h=hash('trade-talk:'+s.location+':'+cycle);
 if(Number(h%100n)>=62)return {title:'Nothing firm from the tables',text:'Most of the cargo talk today is old news. I would rather wait for a recent supplier’s account than send you across the system on a stale price.'};
 const leads=marketRumorLeads(s),pool=leads.slice(0,4),lead=pool.length?pool[Number(hash(contact+':'+s.location+':'+cycle)%BigInt(pool.length))]:null;
 const rumor=tradeRumorText(s,lead);return {...rumor,text:dialogueLocations(rumor.text,s.location)};
}
function canteenRumor(s,category){
 const p=port(s.location),known=new Set([...accessiblePorts(s),...localLicenceOffers(s).flatMap(o=>o.coverage)]),candidates=world.ports.filter(q=>q.id!==p.id&&known.has(q.id));
 const pick=list=>list[Math.floor(rng(s)*list.length)],nearby=candidates.filter(q=>q.group===p.group),targets=nearby.length?nearby:candidates;
 if(category==='pirates'){
  const wanted=notoriousRaiders.filter(r=>r.groups.includes(p.group)&&!claimedBounty(s,r.id));
  if(wanted.length){const r=pick(wanted);return {title:'A name passed around the table',text:`“Crews have been talking about **${r.name}**, commanding **${r.ship}**, in the ${system(p.group).name} approaches. Patrol’s posted warrant is **${r.reward.toLocaleString('en-US')} cr**. ${r.detail} Ask the local patrol office before going looking; a story over drinks is not a fresh sighting.”`};}
  const target=pick(targets),q=quote(s,target.id),risk=Math.round(q.piracyRisk*100);
  return {title:'Trouble along the approach',target:target.id,text:`“A crew headed toward **${target.name}** was comparing patrol coverage. Today’s flight planner puts the chance of a raider encounter on that leg near **${risk}%**.${q.beltCrossing?' That route crosses the main belt, where mining traffic gives raiders more opportunities.':''} Keep maneuver fuel and check your escorts. It is a route risk, not a promise that pirates will appear.”`};
 }
 if(category==='prices'){
  const leads=marketRumorLeads(s),lead=leads.length?pick(leads.slice(0,4)):null;
  const rumor=tradeRumorText(s,lead);return {...rumor,text:dialogueLocations(rumor.text,s.location)};
 }
 const target=pick(targets);
 if(category==='routes'){
  const q=quote(s,target.id),reachable=q.minimumFuel<=fleetOverview(s).tankTonnes;
  return {title:'A pilot’s route note',target:target.id,text:`“The run to **${target.name}**, above **${target.body}**, is about **${q.coastDays} flight days** plus **${q.waitDays} clearance days** at today’s geometry and ship load. The planner calls for at least **${q.minimumFuel.toFixed(1)} t propellant**.${reachable?' Keep extra fuel for an arrival problem.':' That is beyond this ship’s tank; a larger hull or another staging point is needed.'}${hasAccess(s,target.id)?'':' Your clearance is still required; the local authority can explain the licence offered here.'} Recheck the route when you are ready; cargo, escorts and orbital positions change the figures.”`};
 }
 const facility=portFacilities(target.id),hulls=facility.ships.slice(0,2).map(id=>ships.find(sh=>sh.id===id).name).join(' and ');
 return {title:'Word from another dock',target:target.id,text:`“A crew came through from **${target.name}**, above **${target.body}**. ${target.description} ${facility.spaceport?`Their fleet registry stocks hulls including **${hulls}**, and handles the fittings it supplies.`:'There is no ship-sales registry there, but crews can still refuel and use the dry dock.'} They mentioned **${target.hazard.toLowerCase()}** around the approaches.${hasAccess(s,target.id)?'':' Ask this port authority about the local licence before setting out.'} It sounds worth checking when your route takes you that way.”`};
}
function buyCanteenRound(s,contact=''){
 const offer=canteenOffer(s);check(offer.canPurchase,offer.reason);const v=stationContacts(s.location,'local',s).find(v=>(v.contactID||'')===contact);check(v,'Choose someone at this canteen.');
 s.credits-=offer.cost;const heard=rng(s)<.68,category=heard?['routes','stations','pirates','prices'][Math.floor(rng(s)*4)]:'none';
 const lead=heard?canteenRumor(s,category):{title:'A pleasant round, no useful news',text:'“Thank you for the round, Captain. Tonight the talk is about an old card game, someone’s repaired kettle and whose shift begins first. Nothing useful about cargo, routes or raiders reaches your table.”'};
 const result={id:uuid(),port:s.location,day:s.day,cost:offer.cost,speaker:v.person,contact,heard,category,...lead};
 if(category==='prices')rememberTradeRumor(s,lead,v,contact,'round',rumorHistoryID('round',result.id));
 if(!s.canteenRounds)s.canteenRounds=[];s.canteenRounds.push(result);s.canteenRounds=s.canteenRounds.slice(-80);
 speak(s,s.profile.name,`A round for the room · **${offer.cost} cr**.`);speak(s,v.person,`**${lead.title}**\n\n“${v.character.opening}”\n\n${lead.text}\n\n${heard?'A dockside lead, recorded on day '+s.day+'. It may be out of date by arrival.':'The round is paid for, but useful news is never guaranteed.'}`);
 for(const line of s.dialogue.slice(-2)){line.venue='local';line.contact=contact;line.partner=v.person;}
 record(s,`Bought a round at ${establishments(s.location,false,s).find(v=>v.id==='local').name} for ${offer.cost} cr. ${heard?'Heard a '+({routes:'route',stations:'station',pirates:'pirate',prices:'price'}[category])+' rumour: '+lead.title+'.':'No useful rumour this time.'}`);
}

// Original people, station businesses, navigation scenes and sparse-belt events.
const speciesCatalog=[
 {id:'human',name:'Human',detail:'Solar-born people from Earth and its settlements.'},
 {id:'robot',name:'Robot',detail:'Independent synthetic citizens, with replaceable bodies and their own identities.'},
 {id:'ilyri',name:'Ilyri · alien',detail:'Amphibious visitors whose habitats use humid air and shaded light.'},
 {id:'veyr',name:'Veyr · alien',detail:'Silicate-bodied visitors who communicate through voice and luminous crest patterns.'}
];
// Compatibility data for old saves and archived portrait donors; no active identity choices.
const identityCatalog={
 sexes:[{id:'unspecified',name:'Undisclosed'},{id:'female',name:'Female'},{id:'male',name:'Male'},{id:'intersex',name:'Intersex'},{id:'sexless',name:'Sexless'},{id:'synthetic',name:'Synthetic · no biological sex'}],
 genders:[{id:'unspecified',name:'Undisclosed'},{id:'woman',name:'Woman'},{id:'man',name:'Man'},{id:'nonbinary',name:'Non-binary'},{id:'genderless',name:'Genderless'}],
 pronouns:[{id:'they',name:'They / them'},{id:'she',name:'She / her'},{id:'he',name:'He / him'},{id:'she-they',name:'She / they'},{id:'he-they',name:'He / they'},{id:'name',name:'Use my name'}]
};
function identitySummary(v){return [identityCatalog.genders.find(x=>x.id===v.gender)?.name,identityCatalog.pronouns.find(x=>x.id===v.pronouns)?.name].filter(Boolean).join(' · ');}
function characterIdentity(person,species){
 const seed=Number(hash(person+':identity')%100000n),g=person==='Telu of the Reeds'?7:person==='Yeri of the Reeds'?6:seed%8;
 const gender=species==='robot'?(g<4?'genderless':g<6?'nonbinary':g===6?'woman':'man'):(g<3?'woman':g<6?'man':g===6?'nonbinary':'genderless');
 const sex=species==='robot'?'synthetic':species==='veyr'&&seed%3===0?'sexless':seed%11===0?'intersex':seed%2===0?'female':'male';
 const pronouns=gender==='woman'?(seed%5===0?'she-they':'she'):gender==='man'?(seed%5===0?'he-they':'he'):seed%4===0?'name':'they';
 const identity={sex,gender,pronouns,sexName:identityCatalog.sexes.find(x=>x.id===sex).name,appearance:['soft','angular','balanced'][Math.floor(seed/8)%3]};return {...identity,identitySummary:identitySummary(identity)};
}
// Stable cast generation uses its own seed; browsing or talking never rerolls people.
const castNameParts={
 humanFirst:['Amara','Idris','Tamsin','Leila','Cassian','Nadia','Mateo','Sana','Rowan','Inez','Noor','Jules','Dara','Ari','Samira','Theo','Mira','Remy','Anika','Elian','Cleo','Kiran','Luz','Zuri','Tariq','Nico','Yara','Oren','Esme','Soraya','Luca','Nia','Basil','Anouk','Ilya','Milan','Ada','Ren','Lina','Safiya','Akira','Dev','Sol','Mina','Rafi','Tala','Emil','Vera'],
 humanLast:['Okafor','Silva','Nakamura','Haddad','Mensah','Kovacs','Rao','Ortiz','Chen','Diallo','Patel','Navarro','Sato','Ibrahim','Park','Bennett','Nwosu','Costa','Adebayo','Moreau','Lin','Reyes','Volkov','Aziz','Laurent','Tran','Amini','Sundaram','Almeida','Duarte','Kim','Varga','Tanaka','Faruqi','Delgado','Kaur','Marin','Osei','Kapoor','Rossi','Elbaz','Mbeki','Bashir','Lind','Saidi','Vega','Dlamini','Yilmaz'],
 machine:['Caliper','Sundial','Morrow','Quill','Tessera','Bracken','Cobalt','Pollen','Tangent','Kest','Chorus','Lattice','Skein','Fable','Harbor','Mica','Saffron','Thimble','Prism','Cairn','Anvil','Folio','Hush','Cadence','Nacre','Spindle','Aster','Rivet','Cinder','Helix','Vesper','Peregrin','Mosaic','Ember','Mote','Keel','Wick','Axiom','Loom','Canticle'],
 ilyriStart:['Ae','Iri','Sha','Tae','Oru','Nae','Miri','Vae','Lio','Eru','Yalu','Sae','Ulo','Rei','Asha','Ni','Elo','Mai','Sela','Tha'],
 ilyriEnd:['ri','len','sha','vai','nu','reth','mei','lu','ara','wen','sia','ren','lo','tiri','en','u','ya','nei','ru','li'],
 ilyriFamily:['Amarei','Talune','Ishara','Nerathi','Ulen','Vaeliri','Sorune','Maeri','Elush','Thaluen','Nimari','Aruven','Yashai','Saelun','Liora','Erunei','Ameth','Velune','Shaliri','Oshara'],
 veyrStart:['Kesh','Vel','Or','Istr','Nesh','Tal','Cery','Alv','Shor','Reth','Voss','Thren','Ash','Oryn','Esh','Keral','Sav','Tesh','Vyr','Lor'],
 veyrEnd:['ren','vek','al','esh','ryn','or','eth','ai','ra','ven','ir','osh','an','el','eshra','une','ar','sen','ev','is'],
 veyrFamily:['Saresh','Ithral','Osvren','Velkar','Thess','Koryn','Iskrel','Arven','Nareth','Shal','Teryn','Othrel','Veshar','Kaleth','Rhune','Ceshra','Avren','Skelor','Varys','Thal']
};
// Keep the first edition's pools intact so an established contact never changes identity.
const expandedCastNames=Object.fromEntries(Object.entries(castNameParts).map(([key,parts])=>[key,[...parts,...{
 humanFirst:'Amina Ayodele Beatriz Dalia Edda Farah Gabriel Hana Ismail Jacinta Kamal Leonie Mahir Naledi Oksana Priya Qasim Rania Soren Thandi Uma Valeria Wren Xia Youssef Zola Aiko Belen Cato Dione Enzo Fionn Greta Hadi Indira Joao Kenji Laleh Marisol Neema Omari Petra Riku Saskia Tenzin Usha Vivek Wen Ximena Yasmin Zephyr Adisa Bao Chandra Davi Esi Feray Gita Hyejin Inaya Jovan Keziah Luan Malika Nuru Olena Pema Roshni Selam Taavi Unathi Vian Yuki Zahra'.split(' '),
 humanLast:'Abebe Abiola Acharya Aguiar Aksoy Alvarado Arslan Balogun Barbosa Bekele Bhatt Bui Cabrera Carvalho Chao Choudhury Daoud Das Devereux Diop Dossantos Ekwueme Eren Espinoza Fedorova Ferreira Ghosh Haddadi Hamid Hartmann Hasegawa Huerta Ionescu Iskandar Jafari Jensen Khumalo Khatri Kobayashi Kowalska Leclerc Mahfouz Makonnen Mbatha Mehta Mthembu Mwangi Naidoo Nakano Ndlovu Nguyen Nishimura Oliveira Owusu Paredes Perera Petrovic Pham Qureshi Rahmani Ribeiro Rojas Sakamoto Salgado Sarr Sengupta Shimizu Singh Suleiman Takahashi Tesfaye Trabelsi Ueda Vasquez Villanueva Wang Watanabe Yamada Yusuf Zoric'.split(' '),
 machine:'Abacus Alcove Almanac Ampere Aperture Aquarelle Astrolabe Ballast Beacon Bobbin Bower Brevet Capstan Carillon Catenary Chalcedony Chisel Clasp Compass Conduit Corbel Crucible Datum Dovetail Drift Eclogue Filigree Flume Gimbal Halcyon Ingot Interleaf Jacquard Juncture Kestrel Kiln Lantern Lenticel Lodestar Loomwork Mantle Meridian Motif Notch Oriel Palisade Parallax Peridot Plumb Polestar Quarry Reedwork Relay Rill Rondo Scribe Semaphore Sepal Shale Shuttle Sirocco Socket Spire Stave Tiller Tracery Trestle Umbel Undercroft Vernier Vestry Weft Whetstone Whorl Yarrow Zenith'.split(' '),
 ilyriStart:'Aeli Auri Eili Enu Esha Hae Hira Ia Iola Isu Jae Kaeli Kio Lae Luma Meya Mio Nalu Nio Oali Oshi Pela Pio Raeli Riu Sio Suma Tali Tei Umei Uri Vali Vei Wae Yali Zae'.split(' '),
 ilyriEnd:'ae aeli ano aru avo eia elu ena eri esha ia ila ilo irei isa ive lae lino luma mara mio nae nalu noa oshi ova pela rei rima rua sae senu thae uli umo vara viri wa yae'.split(' '),
 ilyriFamily:'Aelune Aruai Enaleth Eshauri Halia Iolune Iravae Kaeluma Kiorai Laenuri Lioresh Lumari Maelai Meruai Nalieth Nioru Oalae Oshirel Pelauri Raelune Reiva Saerumi Shionai Sulari Taeluma Teirani Uluai Umareth Vaeli Vioresh Waelun Yalume Zaerai'.split(' '),
 veyrStart:'Brek Cev Dresh Draev Ek Fesh Graev Hesh Ivek Jhar Khar Krel Leth Mesk Mor Nask Osk Praev Qesh Ral Rhav Sker Sorn Trev Ur Vesk Vraev Wesh Xal Yev Zhar Zvek'.split(' '),
 veyrEnd:'aek ak ara av ekh esk evra hev ik ira isk kar kra len naek nek nor raek rek rith rok shar sk thra ul uth vaek vek vor vra xel yek'.split(' '),
 veyrFamily:'Akrath Brevash Cevrak Drelith Ekrun Feshkar Grevath Heskor Ivrash Jharesh Kharvek Krelash Lethrek Meskal Naskreth Oskavar Praeveth Qeshral Ralvek Rhavorn Skervath Sornesh Trevkar Urkesh Veskral Vraevash Weshkar Xalreth Yevrak Zharven'.split(' ')
 }[key]]]));
const castPersonality={
 tones:[['patient','A patient listener who leaves room for a careful answer.','Take your time; I would rather hear the whole question.'],['wry','Dry humor slips into even the most ordinary conversation.','There is usually a sensible answer hiding behind the paperwork.'],['brisk','Speaks quickly and likes a question with a clear purpose.','Give me the essentials and we can work through them.'],['reserved','Keeps a little distance until a captain has earned some trust.','I listen first. Promises are easier to judge afterward.'],['warm','Makes newcomers feel as though someone was expecting them.','Come in, Captain. We can make a little room.'],['meticulous','Notices small discrepancies and checks an answer twice.','Let us get the details right before we get excited.'],['curious','Follows every practical question with another question.','I would like to know how you arrived at that plan.'],['forthright','Prefers a plain answer, even when it is inconvenient.','I will tell you what I know and where my knowledge ends.'],['reflective','Often pauses to find exactly the right words.','Some questions deserve a quieter answer.'],['lively','Tells a story with quick gestures and infectious energy.','You have arrived at an interesting moment.'],['formal','Treats a routine handover with deliberate courtesy.','Welcome, Captain. Let us attend to your business.'],['pragmatic','Brings wandering conversations back to what can actually be done.','What matters is the next step we can finish.'],['skeptical','Tests a confident claim before accepting it.','I have heard impressive claims before. Show me the workable part.'],['soft-spoken','Speaks softly enough that people lean in to listen.','The station can make enough noise for both of us.'],['optimistic','Looks for an opening when others see only a delay.','A setback is still useful if we learn where it began.'],['blunt','Uses very few words to make an unmistakable point.','Ask directly. I will answer the same way.'],['playful','Turns small inconveniences into shared jokes.','If the clock is against us, at least we can argue with it together.'],['reassuring','Explains difficult news without making it feel like a verdict.','We can work through the choices one at a time.']],
 habits:['Keeps a worn notebook close at hand.','Straightens small objects while thinking.','Checks a faded wrist chronometer between questions.','Sketches tiny orbital paths on scrap packaging.','Remembers the names of passing freighters.','Collects unusual stamps from cargo seals.','Lets a thoughtful silence settle before replying.','Taps out an old work song while waiting.','Keeps a small plant in a carefully repaired container.','Saves handwritten thank-you notes.','Carries a lucky washer from a first posting.','Rebuilds discarded mechanical clocks.','Keeps every pen until it can no longer be repaired.','Offers a seat before discussing business.','Sorts tools by the sounds they make.','Hums fragments of songs learned from travelers.','Quotes an old supervisor with affectionate irritation.','Names the station’s maintenance carts.','Makes tea with a timer more precise than necessary.','Keeps a folded star chart in a pocket.','Watches arrivals whenever a shift allows it.','Adds a hand-drawn mark to every finished task.','Collects recipes that can survive a long flight.','Checks on the people working the late shift.'],
 interests:['growing herbs under spare cabin lamps','recording the sounds of working stations','restoring old navigation instruments','playing slow correspondence games','learning songs in unfamiliar languages','keeping an illustrated journal of arrivals','making miniature models from packing material','collecting stories about first voyages','cooking meals from limited provisions','mapping quiet corners of the habitat','writing short mysteries for the local bulletin','photographing reflections in observation windows','organizing informal repair lessons','translating old letters with friends','teaching children to read star charts','following amateur zero-gravity sports','studying the history of ordinary tools','making paper art from obsolete manifests','comparing greenhouse seed varieties','keeping a tiny library of recorded poetry','designing cooperative board games','drawing portraits of visiting crews','learning to tune string instruments','cataloguing unusual cargo labels'],
 histories:['An apprenticeship ended with a long night repairing a pressure door. The lesson was to ask for help early.','A first independent assignment went badly because the instructions were technically correct and completely unclear.','An older sibling taught me to repair things before teaching me to throw them away.','I spent years on temporary contracts before finding a place where people expected me to return.','A rescue crew once gave up its own berth so I could get home. I have never forgotten their names.','I began as the person who carried messages between departments that refused to speak to each other.','My first supervisor trusted a handwritten checklist more than an elegant explanation. Eventually I understood why.','I once traveled with a crate of seed samples that seemed more carefully protected than the passengers.','I learned this trade from someone who could recognize an approaching problem by sound.','I arrived on a short contract with almost no luggage. Most of what I own was made or repaired here.','A damaged shipment nearly ended a friendship. We fixed the paperwork first and the friendship much later.','For a while I kept records for a crew that changed ships more often than it changed its promises.','I used to think a distant posting would be quiet. It turned out to be a small place full of everyone’s unfinished stories.','A teacher made me describe every mistake without using the word accident. That habit has stayed with me.','I helped build a communal workshop from equipment no single crew could afford to replace.','A long delay taught me that having somewhere to wait can matter as much as having somewhere to go.','I once delivered an important apology because its author could not find the courage to send it.','My first paid work was tedious and useful. It took years to appreciate the second part.','I learned to negotiate by sharing a crowded cabin with people who all thought they were quiet sleepers.','An old colleague left me a box of unfinished projects. I am still discovering which ones were jokes.','I changed careers after realizing that I enjoyed explaining a problem more than winning an argument about it.','I worked a relief shift that became a whole season. By the end, the station felt like a neighborhood.','A mentor insisted that every good solution should leave a clear note for the next shift.','I used to collect departure tickets. These days I keep the messages people send when they arrive safely.'],
 goals:['start a shared workshop with no membership fee','train an apprentice who will eventually disagree with me intelligently','finish a collection of ordinary people’s voyage stories','build a small greenhouse that belongs to the whole shift','take a year to visit the people I usually only hear over a radio','restore an instrument that has outlived three stations','give the next generation a less precarious first job','put together a reliable emergency supply cooperative','open a quiet reading room beside the busiest corridor','finish a project without taking it home every night','learn enough languages to stop relying on rushed translations','help a scattered family meet at one table again','leave a better maintenance archive than the one I inherited','organize a festival that every shift can attend','save enough to refuse the next dishonest contract','make a useful invention simple enough for anyone to repair','build a recording archive before old voices disappear','teach a class where no one feels embarrassed to ask a basic question','turn a temporary residence into a home worth returning to','plan a journey for pleasure instead of a deadline','make the station’s first-job training kinder and more practical','bring a long-running neighborhood project to completion','pay back a kindness that cannot be measured in credits','make room for someone who has not yet found where they belong'],
 values:['Clear records protect the person who has to act on them.','A useful promise includes the difficult details.','No schedule is worth treating a crew as disposable.','A careful question can save more time than a hurried answer.','I would rather admit a limit than sell someone confidence I do not have.','Good work leaves the next shift with fewer mysteries.','I judge a plan by what happens when one part fails.','Fair treatment is a habit, not a special favor.','A quiet warning deserves the same attention as a loud one.','Keeping someone informed is part of keeping them safe.','People remember who stayed to help after the formal handover.','An honest small job is better than a grand unfinished promise.','The best procedures explain the reason behind the rule.','Trust grows when the ordinary work is done reliably.','Useful experience includes remembering what you once did not know.','A good bargain leaves both crews able to make the next voyage.'],
 moods:['The shift has been steady, and I am enjoying the rare breathing room.','We have had several late arrivals; I am keeping one eye on the corridor.','A colleague brought good news today. It has improved the whole room.','I have been covering a few extra duties, so I appreciate a clear question.','Something finally got repaired after weeks of patient improvisation.','The station feels unusually quiet. I am still deciding whether that is restful.','I have a small personal project waiting when this shift ends.','There is a busy handover coming, but we have time to talk.']
};
const expandedPersonality={...castPersonality,
 tones:[...castPersonality.tones,
 ['deadpan','Delivers improbable observations with a perfectly straight face.','The universe has supplied another form to fill in.'],
 ['exacting','Asks for a measurement whenever someone offers a guess.','Tell me what you measured, then tell me what you assumed.'],
 ['hospitable','Remembers a visitor’s preferred corner and makes room for them.','There is a free chair, and I can spare a few minutes.'],
 ['storyteller','Explains things through vivid accounts of people and places.','That reminds me of a departure that nearly became a permanent stay.'],
 ['taciturn','Wastes few words, but attends closely to each answer.','I am listening. Go on.'],
 ['enthusiastic','Finds fresh interest in a problem everyone else has grown tired of.','There is something rather interesting in that question.'],
 ['deliberate','Separates each part of a problem before making a recommendation.','First the facts. Then the choices. Then the signatures.'],
 ['irreverent','Finds the absurdity in ceremony without neglecting the work.','A grand title will not mend a valve, but the right tools might.'],
 ['protective','Quietly checks that tired crews have understood the risks.','Before we settle anything, have you had a proper rest?'],
 ['competitive','Treats a difficult task as a friendly challenge.','Let us see whether we can improve on the last solution.'],
 ['philosophical','Connects practical work with patient questions about what matters.','A long journey leaves plenty of time to reconsider a short answer.'],
 ['self-deprecating','Shares mistakes readily and finds humor in personal shortcomings.','I have already made several of the mistakes you are considering.'],
 ['methodical','Works through an orderly sequence and explains every step.','We will start at the beginning; it tends to save a return trip.'],
 ['animated','Changes pace and expression as soon as a subject catches interest.','Come closer; this is the part I wanted someone to ask about.']],
 habits:[...castPersonality.habits,'Folds receipt paper into little cranes.','Repairs chipped ceramic cups with colored resin.','Turns a carved bead over while listening.','Measures each pause against the turning habitat wheel.','Keeps an illustrated list of plants that survived the last move.','Pins apprentice sketches beside official notices.','Writes reminders on reusable strips of fabric.','Matches incoming crews with the ships remembered from earlier visits.','Polishes one old brass button on an otherwise practical coat.','Practices unfamiliar names quietly before using them.','Counts cargo seals twice and then tells a joke.','Keeps a collection of failed prototypes on a narrow shelf.','Offers visitors a small puzzle while a terminal finishes its checks.','Tests new ink colors on obsolete freight labels.','Keeps a handwritten list of who still needs a proper day off.','Traces repaired seams on a much-traveled satchel.','Sews station badges onto a communal quilt.','Rereads letters from a former apprentice between arrivals.','Builds balanced little sculptures from spare fasteners.','Leaves anonymous notes of thanks after a difficult shift.','Marks birthdays in a calendar shared across three time zones.','Carries a pocket magnifier repaired with bright wire.','Keeps a drawer of orphaned keys for locks long since replaced.','Wears a different handmade pin for each station holiday.'],
 interests:[...castPersonality.interests,'composing music from pressure-pump rhythms','learning the craft of making paper by hand','growing mushrooms in reclaimed shipping insulation','racing tiny solar-powered model boats in a habitat tank','designing tactile maps for visitors','embroidering imaginary constellations onto work clothes','practicing calligraphy with homemade inks','building harmless mechanical automata','recording oral histories of retired freight crews','restoring a collection of early lunar photographs','breeding ornamental algae in sealed glass loops','writing radio plays with the night-shift cast','experimenting with low-gravity bread recipes','studying meteorite thin sections through a borrowed microscope','carving miniature doorways from packaging offcuts','organizing a choir that rehearses between pressure checks','designing accessible cabin interiors','comparing old maps with modern survey records','weaving rugs from retired safety webbing','making noncompetitive puzzles for the station newsletter','building a lending library of well-used instruments','teaching patient newcomers to juggle in low gravity','studying how familiar accents change between settlements','restoring broken clocks without replacing their original mechanisms'],
 histories:[...castPersonality.histories,
 'My family ran a repair stall beside a noisy lift shaft. I learned to read lips and invoices at the same time.',
 'I trained for a surface posting and ended up happier in orbit. A changed plan does not always mean a failed one.',
 'I spent a winter translating manuals whose diagrams had been printed backward. People still send me troublesome pages.',
 'A station election once came down to whether our workshop would stay open after midnight. I learned how much small rules matter.',
 'I crossed the belt with a theater company that paid part of its passage in performances. I was responsible for the lighting.',
 'My first independent repair passed every test and still rattled. A patient colleague taught me to listen after the checklist ended.',
 'I helped inventory an abandoned observatory. The most valuable things were the notes its workers had left for their successors.',
 'A delayed pay packet kept me here long enough to meet the people who became my closest friends.',
 'I used to restore antique instruments for collectors. Working equipment seemed a better use of the same patience.',
 'I once organized a supply exchange between two crews that had stopped trusting one another. They now share a workshop.',
 'I grew up counting arrivals from a greenhouse window. Each new ship meant someone had kept a very long appointment.',
 'An apprenticeship took me through three unrelated departments. I still know who to ask when a problem crosses boundaries.',
 'I spent several months caring for someone who could no longer travel. It changed how I think about access and distance.',
 'A modest invention of mine failed commercially and became useful as a teaching aid. I am rather pleased with that ending.',
 'I learned my present trade after an injury ended a different career. The people who made room for a beginner mattered most.',
 'For years I worked opposite shifts from my closest friend. We left each other increasingly elaborate drawings at handover.',
 'I joined a survey crew expecting adventure and discovered the satisfaction of a carefully labeled sample.',
 'I once inherited responsibility for a communal garden I knew nothing about. The neighbors taught me one plant at a time.',
 'An argument over a missing part lasted longer than finding it. These days I check the storage rack before assigning blame.',
 'A stranger returned a lost notebook after carrying it halfway across the system. The pages were worth more than my luggage.'],
 goals:[...castPersonality.goals,'build a quiet room that anyone between contracts can use','complete a guide to repairing the equipment smaller stations cannot replace','help an apprentice open a business of their own','record an album with musicians who have never shared one room','restore the old public observation gallery','make the station’s emergency instructions understandable without a specialist','learn how to sail on an actual sea','design a habitat garden that needs very little imported water','reunite the surviving members of a long-retired survey crew','fund a small traveling exhibition of ordinary station life','finish a mechanical model that has occupied a corner of my cabin for years','make an accessible instrument for a friend who misses playing','negotiate a fairer roster for people caring for family','open an archive where workers can record problems without fear of blame','take a former mentor to the place described in all those old stories','leave enough spare parts for the next person to improvise safely','write a cookbook that explains why each substitution works','restore a family heirloom without erasing the marks of its repairs','build a cooperative that shares emergency transport costs','learn a difficult craft slowly enough to enjoy being a beginner'],
 values:[...castPersonality.values,'Expertise should make a room easier to enter.','A repair is successful when another person can understand it.','I listen carefully to the person who usually gets interrupted.','A good record includes who did the quiet work.','Nobody becomes experienced without being allowed a first attempt.','The cheapest offer can leave someone else paying the real cost.','I try to leave enough room in a plan for somebody to be tired.','An explanation is part of the service, not an optional extra.','Small kindnesses survive long journeys surprisingly well.','I trust a colleague who corrects a mistake in public.','Being useful matters more to me than appearing indispensable.','A shared tool should come back cleaner than it left.'],
 moods:[...castPersonality.moods,'An old friend has an arrival slot today. I keep checking the board.','The apprentices solved a fault without my help. I am trying not to look too pleased.','We have just finished a lively neighborhood meeting; I am enjoying a simpler question.','A letter arrived after a very long journey. Some messages are worth the delay.','My personal project failed in an interesting way, which almost counts as progress.','Someone remembered to bring fresh herbs for the shared kitchen. The corridor smells wonderful.','A quiet disagreement has finally been settled. The room feels larger today.','I am looking forward to an entire shift with nothing more dramatic than routine work.']
};
function castPick(list,key){return list[Number(hash(key)%BigInt(list.length))];}
function castHashMixed(key){let x=hash(key);x=BigInt.asUintN(64,(x^(x>>30n))*13787848793156543929n);x=BigInt.asUintN(64,(x^(x>>27n))*10723151780598845931n);return x^(x>>31n);}
function castPickMixed(list,key){return list[Number(castHashMixed(key)%BigInt(list.length))];}
const portraitDetails={
 human:['a small optical aid set into one temple','a scattering of freckles across the cheeks','a soft-edged birthmark beside one eye','a fine healed scar crossing one eyebrow','thin oval spectacles','a pair of mismatched ear ornaments','a discreet hearing device','a curved metallic cheek inlay'],
 robot:['a long illuminated visor','three independently mounted optical lenses','a central telescopic camera','a circular light-ring display','a broad segmented sensor band','two offset camera apertures','a compact domed optical housing','a narrow vertical sensor array'],
 ilyri:['broad scalloped ear fans','fine trailing gill filaments','a short fan-shaped crest','pearlescent markings along the brow','swept-back temple fins','mottled cheek markings','a low arched brow ridge','small luminous points along the cheekbones'],
 veyr:['a low crown of mineral plates','a tall split crystal crest','broad overlapping facial facets','fine gold-colored mineral veins','a swept fan of translucent crystal','a stepped ridge of dark mineral','asymmetric pale mineral inclusions','a semicircle of polished crest points']
};
let expandedPortraitsCache=null;
function expandedPortraitCatalog(){
 if(expandedPortraitsCache)return expandedPortraitsCache;
 return expandedPortraitsCache=speciesCatalog.flatMap(sp=>Array.from({length:32},(_,i)=>{
  const portraitKey=`portrait-frontier-${sp.id}-${String(i).padStart(2,'0')}`,seed=Number(hash(portraitKey+':art')%100000n),detailStyle=i%8,ageStyle=Math.floor(i/8),identity=characterIdentity(portraitKey,sp.id);
  return {person:portraitKey,species:sp.id,portraitKey,portraitVariant:portraitKey,seed,...identity,featureEdition:2,detailStyle,ageStyle,appearanceNote:`${(sp.id==='robot'?['A pristine metal chassis','A well-kept metal chassis','A scuffed metal chassis','A patched metal chassis']:['A youthful face','A composed face','A weathered face','A face lined by long service'])[ageStyle]} with ${portraitDetails[sp.id][detailStyle]}.`};
 }));
}
let extraPortraitsCache=null;
function extraPortraitCatalog(){if(extraPortraitsCache)return extraPortraitsCache;return extraPortraitsCache=speciesCatalog.flatMap(sp=>Array.from({length:24},(_,i)=>{const portraitKey=`portrait-cast-${sp.id}-${String(i).padStart(2,'0')}`,seed=Number(hash(portraitKey+':art')%100000n);return {person:portraitKey,species:sp.id,portraitKey,portraitVariant:portraitKey,seed,...characterIdentity(portraitKey,sp.id)};}));}
function extraVisitors(pid,host){return [2,3].map(i=>{const contactID=`visitor-${pid}-${i}`,species=speciesCatalog[Number(hash(contactID)%4n)].id,art=extraPortraitCatalog().filter(v=>v.species===species)[Number(hash(contactID+':art')%24n)],role=castPick(['Station historian','Apprentice drive technician','Habitat gardener','Independent surveyor','Emergency coordinator','Cargo investigator','Signal researcher','Freight cook','Transit musician','Materials analyst','Instrument restorer','Community teacher'],contactID+':role');return {...host,...art,contactID,castKey:'slot-'+contactID,role,business:`I am a ${role.toLowerCase()} who regularly returns to ${port(pid).name}.`,greeting:`There is room here, Captain.`};});}
let castCatalogCache=null;
function castCatalog(){
 if(castCatalogCache)return castCatalogCache;
 const identities=new Map(),prefixes=new Map(),names=new Map();
 function add(v,pid){const key=v.castKey||v.portraitKey;let entry=identities.get(key);if(!entry){entry={...v,key,variants:{}};identities.set(key,entry);names.set(v.person,key);}if(!entry.variants[v.id])entry.variants[v.id]=[];entry.variants[v.id].push(v.portraitVariant);prefixes.set(pid+':venue:'+v.id+(v.contactID?':'+v.contactID:''),key);}
 for(const p of world.ports){for(const v of establishments(p.id,true))add(v,p.id);const host=establishments(p.id).find(v=>v.id==='local');for(const v of [...stationContacts(p.id,'local').slice(1),...extraVisitors(p.id,host)])add(v,p.id);}
 return castCatalogCache={identities:[...identities.values()].sort((a,b)=>a.key.localeCompare(b.key)),prefixes,names};
}
function legacyCastPins(s){const c=castCatalog(),pins=new Set();for(const t of s.topics||[]){let key=c.prefixes.get(t.slice(0,t.lastIndexOf(':')));const parts=t.split(':');if(!key&&parts.length===2&&world.ports.some(p=>p.id===parts[0]))key=establishments(parts[0]).find(v=>v.id==='relay').portraitKey;if(key)pins.add(key);}for(const d of s.dialogue||[]){for(const name of [d.partner,d.speaker])if(c.names.has(name))pins.add(c.names.get(name));}return [...pins].sort();}
function firstEditionPins(s){
 if(s.castV1Pins!==undefined)return s.castV1Pins;
 const c=castCatalog(),old=generatedCast(s.castSeed||'legacy',1),names=new Map([...old].map(([key,v])=>[v.person,key])),pins=new Set(legacyCastPins(s));
 for(const d of s.dialogue||[])for(const name of [d.partner,d.speaker])if(names.has(name))pins.add(names.get(name));
 for(const round of s.canteenRounds||[])if(names.has(round.speaker))pins.add(names.get(round.speaker));
 return [...pins].sort();
}
function prepareCast(s){
 if(s.castSeed===undefined){s.castSeed='legacy';s.castLegacyPins=legacyCastPins(s);}
 if(s.castEdition===undefined){s.castV1Pins=firstEditionPins(s);s.castEdition=2;}
}
const castCache=new Map();
function generatedCast(seed,edition=1,pins=[],legacyPins=[]){
 const cacheKey=JSON.stringify([seed,edition,pins,legacyPins]);if(castCache.has(cacheKey))return castCache.get(cacheKey);
 const catalog=castCatalog(),old=edition===2?generatedCast(seed,1):null,used=new Set([...catalog.identities.map(v=>v.person),...(old?[...old.values()].map(v=>v.person):[])]),result=new Map(),reserved=new Set();
 if(edition===2)for(const base of catalog.identities){
  if(legacyPins.includes(base.key)){result.set(base.key,{person:base.person,donor:base});reserved.add(base.portraitKey);}
  else if(pins.includes(base.key)){const v=old.get(base.key);result.set(base.key,v);reserved.add(v.donor.portraitKey);}
 }
 for(const species of speciesCatalog){
  const people=catalog.identities.filter(v=>v.species===species.id),pool=[...people,...extraPortraitCatalog().filter(v=>v.species===species.id),...(edition===2?expandedPortraitCatalog().filter(v=>v.species===species.id):[])],donors=[...new Map(pool.map(v=>[v.portraitKey,v])).values()].filter(v=>!reserved.has(v.portraitKey)).sort((a,b)=>{const draw=edition===2?castHashMixed:hash,x=draw(seed+':face:'+a.key+a.portraitKey),y=draw(seed+':face:'+b.key+b.portraitKey);return x<y?-1:x>y?1:0;});let face=0;
  for(let i=0;i<people.length;i++){const base=people[i];if(result.has(base.key))continue;const key=seed+':'+base.key;let person='';for(let attempt=0;attempt<100;attempt++){const k=key+':'+attempt,n=edition===2?expandedCastNames:castNameParts,pick=edition===2?castPickMixed:castPick;
   if(species.id==='human'){const first=pick(n.humanFirst,k+':first'),last=pick(n.humanLast,k+':last'),style=Number(hash(k+':style')%BigInt(edition===2?12:8));person=edition===2&&style===8?last+', '+first:edition===2&&style===9?first+' '+pick(n.humanFirst,k+':middle').slice(0,1)+'. '+last:first+(style===0?' '+pick(n.humanFirst,k+':middle'):'')+' '+last+(style===1?'-'+pick(n.humanLast,k+':second'):'');}
   else if(species.id==='robot'){const first=pick(n.machine,k+':first'),second=pick(edition===2?n.machine.filter(part=>part!==first):n.machine,k+':second'),serial=Number(hash(k+':serial')%8999n)+1000,styles=[`${first}-${serial}`,`${first} ${String(serial).slice(0,2)}.${String(serial).slice(2)}`,`${first} ${second}`,`${first}/${serial}`,`${first} of ${second}`];if(edition===2)styles.push(`${first} [${serial.toString(16).toUpperCase()}]`,`${first} / ${second}`,`${String(serial).slice(0,2)}-${first}`,`${first} Iteration ${serial%97+1}`,`${first} : ${second} ${serial%100}`);person=styles[Number(hash(k+':style')%BigInt(styles.length))];}
   else {const il=species.id==='ilyri',first=pick(il?n.ilyriStart:n.veyrStart,k+':first')+pick(il?n.ilyriEnd:n.veyrEnd,k+':end'),last=pick(il?n.ilyriFamily:n.veyrFamily,k+':family'),style=Number(hash(k+':style')%BigInt(edition===2?9:5));person=style===0?first+'-'+last:style===1?first+"’"+last:style===2?first+' '+last:style===3?last+' '+first:style===4?first+' of '+last:style===5?first+' '+last+'-'+pick(il?n.ilyriEnd:n.veyrEnd,k+':line'):style===6?last+' / '+first:style===7?first+'·'+last:first+' '+pick(il?n.ilyriStart:n.veyrStart,k+':middle').toLowerCase()+' '+last;}
   if(!used.has(person))break;
  }used.add(person);result.set(base.key,{person,donor:donors[face++%donors.length]});}
 }
 if(castCache.size>=12)castCache.delete(castCache.keys().next().value);castCache.set(cacheKey,result);return result;
}
function spokenHabit(text){const verbs={Keeps:'keep',Straightens:'straighten',Checks:'check',Sketches:'sketch',Remembers:'remember',Collects:'collect',Lets:'let',Taps:'tap',Saves:'save',Carries:'carry',Rebuilds:'rebuild',Offers:'offer',Sorts:'sort',Hums:'hum',Quotes:'quote',Names:'name',Makes:'make',Watches:'watch',Adds:'add',Folds:'fold',Repairs:'repair',Turns:'turn',Measures:'measure',Pins:'pin',Writes:'write',Matches:'match',Polishes:'polish',Practices:'practice',Counts:'count',Tests:'test',Traces:'trace',Sews:'sew',Rereads:'reread',Builds:'build',Leaves:'leave',Marks:'mark',Wears:'wear'};return text.replace(/^([A-Za-z]+)/,word=>'I '+(verbs[word]||word.toLowerCase()));}
function castPerson(s,v){
 const key=v.castKey||v.portraitKey,seed=s.castSeed||'legacy',originalPins=s.castLegacyPins||(!s.castSeed?legacyCastPins(s):[]),pins=firstEditionPins(s),pinned=originalPins.includes(key),entry=generatedCast(seed,2,pins,originalPins).get(key),donor=pinned?v:entry.donor;
 const person=pinned?v.person:entry.person,portraitKey=donor.portraitKey,variants=donor.variants?.[v.id],portraitVariant=pinned?v.portraitVariant:variants?.length?castPick(variants,seed+':'+key+':'+v.id):portraitKey;
 const traits=pinned||pins.includes(key)?castPersonality:expandedPersonality,pick=pinned||pins.includes(key)?castPick:castPickMixed,traitKey=seed+':'+key,voice=pick(traits.tones,traitKey+':tone'),habit=pick(traits.habits,traitKey+':habit'),interest=pick(traits.interests,traitKey+':interest'),history=pick(traits.histories,traitKey+':past'),goal=pick(traits.goals,traitKey+':goal'),value=pick(traits.values,traitKey+':value'),mood=pick(traits.moods,traitKey+':week:'+Math.floor(s.day/7));
 const cadence=castPickMixed(['Speaks in short, considered phrases.','Often answers with a thoughtful follow-up question.','A quiet laugh lightens otherwise serious answers.','Tells a story with small, precise gestures.','Finds a concrete example for every explanation.','Pauses briefly before sharing a personal memory.','Has a resonant voice that carries over a busy room.','Keeps an even, gentle pace when explaining difficult choices.','Brightens noticeably when someone asks about a favorite subject.','Enjoys wordplay and waits for a visitor to notice.','Uses understated humor when a shift gets difficult.','Listens without interrupting, even during a busy handover.','Uses expressive hands and an unusually still gaze.','Chooses words carefully, then delivers them with conviction.','Explains complicated things through familiar household objects.','Frequently recalls a useful lesson from an unlikely source.'],traitKey+':cadence');
 return {...v,person,portraitKey,portraitVariant,sex:donor.sex,gender:donor.gender,pronouns:donor.pronouns,sexName:donor.sexName,identitySummary:donor.identitySummary,appearanceNote:donor.appearanceNote||'',profileNote:voice[1]+' '+habit+' '+cadence,personalDetail:'Outside work, '+person+' enjoys '+interest+'.',character:{tone:voice[0],opening:voice[2],habit,habitSpoken:spokenHabit(habit),interest,history,goal,value,mood,cadence},greeting:`${voice[2]} I’m ${person}. Welcome to ${v.name}.`};
}


// Each actual desk has its own person. The historical identity catalogue above stays
// unchanged so save pins and dialogue receipts retain their original meanings.
const assignmentCache=new Map(),portraitPools={robot:4096,human:3072,veyr:2048,ilyri:1024};
function portraitHash(s){let n=2166136261;for(const c of String(s)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}n^=n>>>16;n=Math.imul(n,0x7feb352d);n^=n>>>15;return n>>>0;}
function staffName(species,key,attempt){
 const n=expandedCastNames,k=key+':replacement:'+attempt,pick=(list,tag)=>castPickMixed(list,k+':'+tag);
 if(species==='human')return pick(n.humanFirst,'first')+' '+pick(n.humanLast,'last');
 if(species==='robot')return pick(n.machine,'first')+' / '+(1000+Number(castHashMixed(k)%9000n));
 const il=species==='ilyri';return pick(il?n.ilyriStart:n.veyrStart,'first')+pick(il?n.ilyriEnd:n.veyrEnd,'end')+' '+pick(il?n.ilyriFamily:n.veyrFamily,'family');
}
function assignedWorld(s){
 const seed=s.castSeed||'legacy',legacy=s.castLegacyPins||(!s.castSeed?legacyCastPins(s):[]),pins=firstEditionPins(s),cacheKey=JSON.stringify([seed,legacy,pins]);
 if(assignmentCache.has(cacheKey))return assignmentCache.get(cacheKey);
 const rows=[],names=new Set(),faces=Object.fromEntries(Object.keys(portraitPools).map(k=>[k,new Set()])),frozen={...s,day:0};
 // Coordinators get first claim on their familiar identity when a licensing desk
 // previously shared it. Other repeated jobs receive independent replacements.
 for(const p of world.ports){const venues=establishments(p.id),host=venues.find(v=>v.id==='local');
  for(const v of [...venues,...stationContacts(p.id,'local').slice(1),...extraVisitors(p.id,host)])rows.push({port:p.id,...castPerson(frozen,v),assignmentKey:p.id+':'+v.id+':'+(v.contactID||''),moodKey:seed+':'+(v.castKey||v.portraitKey),expandedMood:!legacy.includes(v.castKey||v.portraitKey)&&!pins.includes(v.castKey||v.portraitKey)});
 }
 const priority=[...rows].sort((a,b)=>(a.id==='relay'?-1:0)-(b.id==='relay'?-1:0));
 for(const v of priority){const duplicate=names.has(v.person);if(duplicate){const key=seed+':staff:'+v.assignmentKey;let attempt=0,name;do{name=staffName(v.species,key,attempt++);}while(names.has(name));v.person=name;Object.assign(v,characterIdentity(name,v.species));
   const t=expandedPersonality,pick=(list,tag)=>castPickMixed(list,key+':'+tag),voice=pick(t.tones,'tone'),habit=pick(t.habits,'habit');
   v.character={tone:voice[0],opening:voice[2],habit,habitSpoken:spokenHabit(habit),interest:pick(t.interests,'interest'),history:pick(t.histories,'past'),goal:pick(t.goals,'goal'),value:pick(t.values,'value'),mood:pick(t.moods,'week:0'),cadence:castPickMixed(rows.map(r=>r.character.cadence),key+':cadence')};
   v.profileNote=voice[1]+' '+habit+' '+v.character.cadence;v.personalDetail='Outside work, '+name+' enjoys '+v.character.interest+'.';v.moodKey=key;v.expandedMood=true;
  }
  names.add(v.person);v.greeting=v.character.opening+' I’m '+v.person+'. Welcome to '+v.name+'.';
  const sp=v.species,pool=portraitPools[sp],key=sp+'|'+(v.portraitKey||v.castKey||'')+'|'+v.person;let index=portraitHash(key)%pool;while(faces[sp].has(index))index=(index+1)%pool;faces[sp].add(index);v.portraitIndex=index;
 }
 // Approved staff are fixed to the station/desk, independently of a voyage's cast seed.
 // Travelling guests stay procedural, with approved staff names and faces reserved.
 const reservedNames=new Set(),reservedFaces=Object.fromEntries(Object.keys(portraitPools).map(k=>[k,new Set()]));
 for(const v of rows.filter(v=>!v.contactID)){const fixed=fixedStationCastByKey.get(v.assignmentKey);if(!fixed)throw Error('Missing approved establishment character: '+v.assignmentKey);Object.assign(v,clone(fixed));v.greeting=v.character.opening+' I’m '+v.person+'. Welcome to '+v.name+'.';reservedNames.add(v.person);reservedFaces[v.species].add(v.portraitIndex);}
 for(const v of rows.filter(v=>v.contactID)){const old=v.person;v.person=v.person.replace(/\biteration\b\s*/gi,'').replace(/\s+/g,' ').trim();let attempt=0;while(reservedNames.has(v.person))v.person=staffName(v.species,seed+':guest:'+v.assignmentKey,attempt++);if(old!==v.person){v.portraitPerson=old;v.personalDetail=v.personalDetail.split(old).join(v.person);v.greeting=v.character.opening+' I’m '+v.person+'. Welcome to '+v.name+'.';}reservedNames.add(v.person);let index=v.portraitIndex;while(reservedFaces[v.species].has(index))index=(index+1)%portraitPools[v.species];v.portraitIndex=index;reservedFaces[v.species].add(index);}
 if(assignmentCache.size>=8)assignmentCache.delete(assignmentCache.keys().next().value);assignmentCache.set(cacheKey,rows);return rows;
}
function portraitStyleFor(v){if(v.portraitStyle)return clone(v.portraitStyle);const key=v.species+'|'+(v.portraitKey||v.castKey||'')+'|'+(v.portraitPerson||v.person||''),g=portraitHash(key+'|'+(v.gender||'unspecified')+'|'+(v.appearance||'balanced'));return {body:portraitHash(key+'|body|'+(v.sex||'unspecified'))%4,presentation:g%6,ornament:(g>>>5)%4,wardrobe:(portraitHash(key+'|wardrobe')+g)%4};}
function characterView(v){const row=clone(v);if(row.id==='authority'&&!row.contactID){row.role='Port & government liaison';row.business='I handle this port’s access records and its liaison with the Interplanetary Compact, including the Veyr and Ilyri treaty records.';}row.portraitStyle=portraitStyleFor(row);for(const key of ['sex','gender','pronouns','sexName','identitySummary'])delete row[key];return row;}
function assignedRow(s,v){const row=characterView(v),pick=row.expandedMood?castPickMixed:castPick;row.character.mood=pick((row.expandedMood?expandedPersonality:castPersonality).moods,row.moodKey+':week:'+Math.floor(s.day/7));delete row.moodKey;delete row.expandedMood;return {...row,station:port(row.port).name,body:port(row.port).body,guest:!!row.contactID};}
function characterRoster(s){return assignedWorld(s).map(v=>assignedRow(s,v));}
function assignedContacts(s,pid,venue){return assignedWorld(s).filter(v=>v.port===pid&&(venue?v.id===venue:!v.contactID)).map(v=>assignedRow(s,v));}

function stationContacts(pid,venue,s=null){
 if(s)return assignedContacts(s,pid,venue);
 if(venue==='warehouse')return warehouseFacility(pid)?stationContacts(pid,'market',s).map(warehouseHost):[];
 const host=establishments(pid).find(v=>v.id===venue);if(!host)return [];if(venue!=='local')return [s?castPerson(s,host):host];
 const p=port(pid),index=world.ports.findIndex(p=>p.id===pid),names={
 human:['Sana Nwosu','Mateo Silva','Jules Park','Nadia Volkov','Rowan Okafor','Ines Tran','Eli Nakamura','Amara Patel','Noor Castillo','Remy Diallo','Dara Kovacs','Morgan Lin','Ari Haddad'],
 robot:['Aster','Pollen','Chime','Weft','Cairn','Prism','Morrow','Skein','Fable','Helix','Glint','Quill','Sable'],
 ilyri:['Amri','Yalu','Eru','Nima','Shuri','Loen','Iri','Telu','Asha','Miri','Ralu','Ena','Yeri'],
 veyr:['Sivren','Orvek','Nesh','Istral','Velsh','Ceryn','Keshra','Oryn','Talvek','Eshra','Virel','Shoren','Alven']};
 const roles=['Visiting navigator','Habitat botanist','Hull technician','Ice surveyor','Freight pilot','Communications specialist','Rescue medic','Cargo archivist'];
 const people=[host,...[0,1].map(i=>{const n=index*2+i,species=speciesCatalog[n%4].id,j=Math.floor(n/4),person=names[species][j]+(species==='robot'?'-'+String(110+n):species==='ilyri'?' of the Reeds':species==='veyr'?' of Amber':''),role=roles[Number(hash(person+':role')%BigInt(roles.length))],contactID='visitor-'+pid+'-'+i,portraitKey='portrait-'+contactID;
 return {...host,contactID,person,species,role,portraitKey,portraitVariant:portraitKey,seed:Number(hash(person)%100000n),...characterIdentity(person,species),business:`I am a ${role.toLowerCase()} staying at ${p.name}. Between assignments, I trade stories with crews here at ${host.name}.`,greeting:`There is room at this table, Captain. I am ${person}, a ${role.toLowerCase()}.`};})];return s?[...people,...extraVisitors(pid,host)].map(v=>castPerson(s,v)):people;
}
const venueTypes=[['market','Exchange','Market','Cargo broker'],['contracts','Freight office','Contracts','Charter dispatcher'],['shipyard','Dry dock','Shipyard','Drive engineer'],['fleet','Fleet registry','Fleet','Harbormaster'],['security','Patrol office','Raids','Security liaison'],['relay','Communications','Comms','Station coordinator'],['clinic','Clinic','Comms','Medical coordinator'],['local','Commons','Comms','Community host'],['bank','Credit Cooperative','Bank','Bank manager'],['authority','Port authority','Port authority','Port & government liaison']];
function establishments(pid,includeUnavailable=false,s=null){
 if(s&&!includeUnavailable)return assignedContacts(s,pid);
 const p=port(pid),themes={mercury:'Sunshade',venus:'Cloudline',earth:'Meridian',mars:'Red Basin',ceres:'Beltstone',jupiter:'Galilean',saturn:'Ringlight',uranus:'Blue Night',neptune:'Far Lantern'},theme=themes[p.group]||p.body;
 const localNames={mercury:'Night-side café',venus:'Cloud garden',earth:'Dockside canteen',mars:'Greenhouse commons',ceres:'Ore assay room',jupiter:'Radiation observatory',saturn:'Ice assay room',uranus:'Polar observatory',neptune:'Deepwatch lounge'};
 const entries=venueTypes.map(([id,label,panel,role],i)=>{
  const seed=Number(hash(p.id+':'+id)%100000n),species=['relay','authority'].includes(id)?'human':speciesCatalog[(seed+i)%4].id;
  const names={human:['Mara Vale','Idris Chen','Leila Ortiz','Theo Mensah','Anika Rao','Jonas Reed'],robot:['Rook','Lumen','Kite','Mica','Echo','Relay'],ilyri:['Sela','Neri','Tavi','Oru','Vela','Issa'],veyr:['Keshr','Aven','Thren','Voss','Esh','Keral']};
  const person=['relay','authority'].includes(id)?p.contact:names[species][seed%6]+(species==='robot'?'-'+String(seed%100).padStart(2,'0'):species==='human'?'':species==='ilyri'?' of the Tides':' of Glass');
  const name=id==='local'?localNames[p.group]:theme+' '+label+(id==='market'?' · '+p.body:'');
  const business=id==='authority'?'We issue a local selection of permanent access licences. Ask about the licences offered at this desk and their navigation or ship requirements. Earth and the Moon are included, and prior access is retained.':id==='market'?`We trade processed cargo. ${p.description}`:id==='contracts'?'We acquire and load client freight at no purchase cost. Deliver the sealed shipment for a fee and reputation. Ordinary breaches bill only missing cargo plus a breach fee and suspend new jobs for 30 days. Surviving sealed cargo stays with the client until returned. Theft bills full restitution, costs 12 reputation and suspends new jobs for 60 days. Available funds pay first; unpaid charges go to the original charter account at Meridian. Keep a fuel reserve.':id==='shipyard'?'Refuel locally berthed ships, repair hulls and replenish engineering spares. Specialist ammunition follows this dry dock’s supply catalogue.':id==='fleet'?'Buy locally stocked hulls and install the upgrades supplied by this spaceport. Manage your owned fleet at any station; weapon ammunition is supplied by compatible dry docks.':id==='bank'?`We hold local deposits at ${(bankTerms(pid,s).depositAPR*100).toFixed(2)}% and offer floating loans at ${(bankTerms(pid,s).loanAPR*100).toFixed(2)}% per Earth year. Quotes adjust daily with momentum; fixed loans add a disclosed premium. Deposits stay here; repayments clear across the network.`:id==='security'?'We collect uncertain sightings near station approaches. Record a lead and watch during ordinary travel; we do not launch an immediate engagement. Ammunition and maneuver propellant remain your responsibility.':id==='clinic'?'We provide recovery berths, full crew treatment, recurring reserve requests and supervised medical research. Services quote their credit cost and ship-days; client freight remains reserved.':id==='relay'?`Station control watches for ${p.hazard.toLowerCase()}. Review licensed routes, book a departure briefing or file completed voyage observations. We also check your cargo manifest and delivery timetable.`:p.group==='ceres'?'We assay refined metals and certify mining cargo; raw rock still requires processing.':p.group==='saturn'?'We trace processed ice shipments and protect research sites from unlicensed extraction.':`Crews meet here between runs. Outside is ${p.hazard.toLowerCase()}; inside there is time to exchange news.`;
  return {id,name,panel,role,person,species,...characterIdentity(person,species),tint:p.tint,portraitKey:'portrait-'+String(hash(person+':'+species)%100000000n),business,greeting:`Welcome to ${name}, Captain. I’m ${person}.`,seed,portraitVariant:'portrait-'+String(hash(person+':'+species)%100000000n)+'-'+p.id+'-'+id};
 }).filter(v=>includeUnavailable||v.id!=='fleet'||portFacilities(pid).spaceport).map(v=>s?castPerson(s,v):v);
 // The unassigned archive preserves the original cast catalogue for older save pins.
 if(!includeUnavailable&&warehouseFacility(pid))entries.push(warehouseHost(entries.find(v=>v.id==='market')));return entries;
}
const placeStories={
 earth:['Meridian began as a relay for surface freight; independent captains later bought their own berths.','Every meal has already paid for a ride through Earth’s gravity well.','A garden window is reserved for crews returning from their first outer-system run.'],
 moon:['Shackleton’s first water contracts paid for insulation before they paid for larger tanks.','Polar workers send ice upward, but purification and propellant processing still consume power.','The canteen keeps Earthrise on a wall display; this orbit does not offer the same view every shift.'],
 'earth-high':['Kepler’s maintenance workers sheltered the first Asterion nozzle behind a borrowed test shield.','Lifted hardware arrives in batches, and a delayed coil can hold up an entire conversion.','A scorched injector from the 2074 tests hangs outside the apprentice workshop.'],
 mars:['Valles grew from a resupply anchorage into a settlement-owned freight exchange.','Greenhouses trade produce for sensors, medicine and machinery they cannot easily manufacture.','Families mark successful arrivals with a fresh leaf in the communal notice board.'],
 phobos:['Stickney’s first repair shed was assembled from retired cargo frames.','Low gravity helps move a load; it does not make rotating machinery safe.','The yard runs silent handover periods so every worker can hear a pressure alarm.'],
 deimos:['Swift began as a rendezvous point for crews avoiding the busier inner-moon yards.','We import water under measured contracts rather than assuming every small moon has an ice mine.','Crews leave handmade route sketches in the common room. None replace a flight clearance.'],
 mercury:['Caloris was founded by instrument teams who needed a sunward observing post.','Sunshades and cooling loops determine when exposed equipment can be serviced.','Workers call the shaded maintenance corridor the longest street on Mercury.'],
 venus:['Aphrodite’s residents argued for an orbital science dock instead of a speculative surface mine.','Water and food arrive by freighter. The hostile surface is not a convenient supply depot.','The cloud garden is a sealed room of imported plants, tended by volunteers between shifts.'],
 ceres:['Occator’s cooperatives pooled their assays so buyers could trust a common quality certificate.','Water-rich material still needs excavation, separation, power and reliable processing.','Assay crews keep rejected sample jars above the bar as reminders of expensive assumptions.'],
 jupiter:['Zephyr was built as a distant relay so supply ships did not have to dive into the inner moon corridors.','Jupiter has no solid surface dock; every crate here came through an orbital supply chain.','The observatory posts radiation-weather briefings next to the breakfast menu.'],
 callisto:['Valhalla became a staging point because Callisto lies beyond the most intense inner radiation belts.','Farther out is safer than Io; it is still not an unshielded holiday destination.','Crews returning from the inner moons get the quiet bunks before the regular shift change.'],
 ganymede:['Galileo’s earliest habitat modules arrived on separate contracts a year apart.','A large icy moon still needs specialist extraction and protected life-support systems.','The common room’s old cargo clock counts arrivals rather than departures.'],
 europa:['Conamara’s charter put scientific stewardship ahead of speculative extraction.','An ocean beneath ice does not make an open water market; research samples are not cargo.','The research kitchen names dishes after instruments that finally passed calibration.'],
 io:['Pele Watch was designed around shielding, remote work and short exposed maintenance tasks.','Radiation sets the work roster. Imported water is guarded as carefully as electronics.','The observatory’s colorful maps are measurements, not photographs of a safe walking route.'],
 saturn:['Cassini’s relay crews connected the separate moon depots into a supply network.','Every transfer needs another burn and another inspection, even with the rings in view.','The station broadcasts a quiet ring panorama at the end of the night shift.'],
 titan:['Kraken grew around specialist tugs supplying surface and atmospheric teams.','Your freighter stays in orbit; local vehicles handle the difficult descent and return.','New arrivals are invited to a weather briefing before the welcome dinner.'],
 enceladus:['The first plume-watch teams brought their own water while they learned how to protect the research site.','Interesting ice chemistry is not permission to scoop free propellant.','The ice assay room displays contamination-control badges alongside family portraits.'],
 rhea:['The relay at Rhea expanded when crews needed a quieter reserve depot in the Saturn system.','Stored ice needs dependable seals, power and stock records before anyone can promise delivery.','Neighbors trade old insulation patches as souvenirs of stations they helped repair.'],
 iapetus:['The remote yard survived its early years by sharing spare assemblies between unrelated crews.','A distant berth can be useful, but it also means a longer wait for the right component.','The common room keeps a guestbook for captains who carried an urgent spare without a reward.'],
 uranus:['The high-orbit relay was assembled by crews who knew each missed resupply could cost a season.','The planet’s tilted system complicates route planning; a larger engine does not erase geometry.','The observatory’s blue lamps dim for a shared hour when every shift can exchange messages.'],
 miranda:['Miranda’s outpost began as an instrument shelter, then gained a small maintenance dock.','Small shipments matter here: one failed pump can use the entire spare stock.','The kitchen gives an empty chair to each crew still inbound.'],
 ariel:['Ariel’s cooperative opened its freight ledger to neighboring habitats after a supply dispute.','Trade works when cargo certificates and actual delivered mass agree.','A repair crew carved the first shift roster into a discarded crate panel.'],
 titania:['Titania became a regional stores hub because several settlements could share its inventory.','A larger warehouse still cannot promise a component that has not arrived.','The common room runs a radio reading circle for crews too far apart to meet.'],
 oberon:['Oberon’s crews built a reserve berth to support surveys at the edge of the local network.','Supplies are scheduled carefully; emergency replacement parts travel the same distance as anything else.','A lamp is kept lit for every inbound registered vessel.'],
 neptune:['Le Verrier’s relay helped receive the visitor ark in 2083. Welcome required berths, water and patient translation.','At this distance, navigation mistakes turn into long supply problems rather than quick detours.','The deepwatch lounge keeps the ark’s first docking request in four written languages.'],
 triton:['Lassell’s scientists asked for a protected research dock before any commercial settlement plans were accepted.','Triton’s retrograde orbit adds real maneuver cost; a short line on the map can still be an expensive flight.','The lounge has humid rooms for Ilyri guests and low-glare alcoves for Veyr families.']
};
const conversationTopics=[{id:'intro',name:'Introduce yourself'},{id:'business',name:'Ask about the work'},{id:'personal',name:'Their story'},{id:'offduty',name:'What do you enjoy outside work?'},{id:'ambition',name:'What are you working toward?'},{id:'place',name:'Life at this station'},{id:'advice',name:'Advice for my captain'},{id:'rumor',name:'What are crews talking about?'},{id:'history',name:'What does my record tell you?'},{id:'help',name:'How can I help here?'}];
function hostAdvice(s,v){
 if(v.id==='warehouse'){const w=warehouseOverview(s);return `You have **${(w.capacityKg/1000).toFixed(0)} tonnes of local storage**, with **${(w.freeKg/1000).toFixed(2)} tonnes free**. ${w.nextTier?`The next upgrade is **${w.nextTier.label}: ${w.nextTier.capacityKg/1000} tonnes for ${w.price} cr**.`:'This warehouse is fully upgraded.'} Store or collect your own goods in the panel. Tenant lots remain client-owned; ask in the canteen about leases and review their liability before agreeing.`;}
 const securityLead=v.id==='security'?raidOffers(s).find(r=>r.availableHere&&!r.completed):null;
 const p=port(s.location),sh=ship(s),rates=bankTerms(s.location,s);
 return v.id==='authority'?`This authority issues **${localLicenceOffers(s).map(o=>o.name).join(', ')||'no new regional licences; this is a local registry desk'}**. New offers are discovered at port authorities as you travel. Some require navigation experience or a qualifying flagship or assigned escort present here, with at least 35% integrity. Your record earns a **${licenceDiscount(s)}% fee discount**. Licences have no expiry and cover their listed destinations. Your existing visits and earlier access remain valid. Keep enough cash for fuel after paying the fee. ${accessSummary(s)}.`:v.id==='bank'?`This branch currently pays **${(rates.depositAPR*100).toFixed(2)}% a year** on deposits and quotes **${(rates.loanAPR*100).toFixed(2)}%** for a new floating loan. A fixed draw adds **${(rates.fixedPremium*100).toFixed(2)} percentage points** and keeps its agreed rate. Floating rates adjust daily. Your available credit is shown in Loan; ask about the outlook or consult the Guide for the lending rules.`:
 v.id==='market'?brokerMarketAdvice(s,'tree-market-bargains')+' Freight dispatch uses these same exchange reserves and receiving needs; communications supplies the route-security forecast.':
 v.id==='contracts'?freightDispatchBriefing(s)+' '+(activeContracts(s).length?`You have **${activeContracts(s).length} active ${activeContracts(s).length===1?'delivery':'deliveries'}**. ${activeContracts(s).slice(0,3).map(c=>`**${freightDescription(c)}** for **${port(c.destination).name}**, due day ${c.deadline}.`).join(' ')} You may accept more while your travelling fleet has space. Every client consignment has its own cargo bill and breach fee, including loss with a destroyed ship. Keep enough fuel and time for all deadlines.`:`Each destination route has its own refresh cycle, based on this station’s dispatch capacity and route distance. Only destinations covered by your access licences appear; each route lists its next refresh. We load client-owned cargo at no purchase cost. Accept several jobs if your fleet has room. You have completed **${s.profile.stats.deliveries} deliveries**; successful deliveries earn experience and reputation.`):
 v.id==='shipyard'?`Your ${sh.name} has **${s.hull}% integrity** and **${fleetOverview(s).fuel.toFixed(1)} t shared fleet propellant**. Refuel any locally berthed ship here, including partial loads. ${portFacilities(p.id).ammoTypes.length?'This dock supplies '+portFacilities(p.id).ammoTypes.map(id=>({coil:'coilgun ammunition',cannon:'autocannon ammunition',missile:'guided missiles',rail:'railgun ammunition',torpedo:'torpedoes'})[id]).join(', ')+' for compatible fitted weapons.':'This dock has no ammunition supply; check the supplier directory.'} Every travelling hull needs at least 35% integrity to depart. Berthed reserves keep their own stores. Tank upgrades add empty capacity; they do not fill themselves. Armor and weapons add mass, so check the new flight plan after fitting them.`:
 v.id==='fleet'?`You own **${1+s.fleet.length} ships**. Serviceable fleet ships improve your licence discount, even when berthed. An assigned escort needs its own propellant and provisions. Your flagship carries a standard laser. ${shipMarket(s).ships.length?'This registry currently offers '+shipMarket(s).ships.map(id=>ships.find(sh=>sh.id===id).name).join(', ')+'.':'This registry has no ship offers at present.'} Stock follows each class’s production cycle; advanced hulls take longer to return, and offers depend on your earned experience. New modules are installed only at spaceports; ammunition comes from compatible dry docks. Use Manage fleet at any station for command, escorts and local cargo transfers.`:
 v.id==='security'?`Every ship carries a **standard laser**. It uses reactor power rather than ammunition, but heat can still force you to guard and cool. Coilguns are optional and consume salvos. Your record shows **${s.profile.stats.victories} victories**; prepare your formation before entering a reported danger area. ${securityLead?`We think **${securityLead.title}** may be close to **${port(securityLead.suspectedPort).name}**, above ${port(securityLead.suspectedPort).body}. Last report: day ${securityLead.observedDay}. `:''}Our target intelligence is unconfirmed; accepting a warrant does not order a launch. Accepting a bounty costs no credits or propellant. Normal voyages near a reported station carry greater encounter risk, especially while a report is fresh. Named warrants pay once after a confirmed capture and patrol handover.`:
 v.id==='clinic'?(()=>{const c=clinicOverview(s);return `Your travelling crew is at **${c.readiness}/100 readiness**: ${c.condition.toLowerCase()}. Recovery berths cost **${c.recoveryCost} cr and two days** for up to 40 readiness; full treatment costs **${c.treatmentCost} cr and five days** to restore 100. ${c.supply.waitDays?`Our next supply request opens in ${c.supply.waitDays} days.`:`The reserve needs **${c.supply.quantity} units of ${c.supply.name.toLowerCase()}**; you own ${c.supply.owned} eligible units.`} Client freight cannot be donated. ${c.researchWait?`Another research shift opens in ${c.researchWait} days.`:`A supervised three-day study pays ${c.researchReward} cr, experience and reputation progress.`} Freight deadlines and bank interest keep running during care.`;})():
 v.id==='relay'?(()=>{const c=coordinatorOverview(s);return `For this dock, remember **${p.hazard.toLowerCase()}**. Your crew readiness is **${c.crewReadiness}/100**. A route-specific departure briefing costs **${c.briefingCost} cr and one day**; it reduces the next qualifying voyage’s equipment-incident chance by 25% and belt-advisory chance by 50%, and expires after 30 days. Pirate risk and physical transfer times remain as quoted. You have **${c.unreportedVoyages} unreported voyages**; filing them takes one day and earns up to 25 navigation XP, reputation progress and local trust. Your manifest includes ${c.clientUnits} client-owned units and ${c.restrictedUnits} restricted units. ${accessSummary(s)}`;})():
 `Your next departure should leave room for an unexpected delay. People at ${p.name} remember a kept promise longer than a dramatic arrival. ${s.profile.stats.aid?'The clinics already know you have helped without a cash reward.':'A small medical donation can introduce you to people beyond the freight desk.'}`;
}
// A visit is presentation data only; opening a door never advances the simulation.
function venueConversationOptions(pid,id,contact='',s=null){
 const p=port(pid),v=stationContacts(pid,id,s).find(v=>(v.contactID||'')===contact);check(v,'Unknown establishment contact.');
 const work={market:'How does this exchange price cargo?',contracts:'What freight is waiting here?',shipyard:'What can this dock repair?',fleet:'How do I expand and outfit my fleet?',security:'Where might the raiders be?',relay:'Can you coordinate escorts and passenger transport?',clinic:'What does this clinic need?',local:'What brings people to this room?',bank:'Explain this branch’s rates and terms.',authority:'Which licences can this authority issue?'};
 const advice={market:'What should I check before trading?',contracts:'Can my current delivery still be completed?',shipyard:'How is my ship holding up?',fleet:'Is my fleet ready to travel?',security:'Is my ship ready for a raider encounter?',relay:'What hazards affect our next departure?',clinic:'Can my cargo help the medical reserve?',local:'What would you tell a visiting captain?',bank:'How should I plan around my current debt?',authority:'Does my record qualify for more access?'};
 return conversationTopics.map(t=>({...t,name:t.id==='intro'?'Introduce yourself to '+v.person:t.id==='business'?work[id]:t.id==='personal'?'Ask '+v.person+' about their past':t.id==='place'?'How is life above '+p.body+'?':t.id==='advice'?advice[id]:t.id==='rumor'?'What is being discussed at '+v.name+'?':t.name})).concat(id==='clinic'?[{id:'service-care',name:'Review my crew’s recovery options'},{id:'service-supply',name:'Which supplies does the clinic need now?'},{id:'service-research',name:'Tell me about the supervised study'}]:id==='relay'?[{id:'service-briefing',name:'What does a departure briefing change?'},{id:'service-report',name:'Can I submit my voyage observations?'},{id:'service-manifest',name:'Check my manifest and delivery timetable'}]:[]);
}
function establishmentVisit(s,id,contact='',opening=false){
 const p=port(s.location),host=stationContacts(p.id,id,s).find(v=>(v.contactID||'')===contact);check(host,'Unknown establishment contact.');
 const sh=ship(s),facilities=portFacilities(p.id),lore=placeStories[p.id],features=[],add=(title,text)=>features.push({title,text});
 if(id==='market'){const supplies=goods.map(g=>({g,q:marketState(s,g.id)})),conditions=marketConditions(s);add('Local trading conditions',conditions.summary+'. '+conditions.detail);add('Today’s cargo conditions',supplies.map(({g,q})=>g.name+': '+q.supply.toLowerCase()).join(' · ')+'.');add('Shared fleet holds','Each accounting lot contains 250 kg of material. Packaging adds loaded weight and takes hold space; both limits apply. Buy and sell prices reflect this station’s changing supply.');}
 else if(id==='contracts'){const suspension=freightOverview(s).suspensionDays;if(suspension)add('Freight registry suspension',`${suspension} days remaining after a freight breach. New jobs reopen on day ${s.freightStanding.suspendedUntil}.`);add('Freight dispatch',activeContracts(s).length?activeContracts(s).slice(0,3).map(c=>`${freightDescription(c)} for ${port(c.destination).name}, due on day ${c.deadline}.`).join(' '):'We provide client-owned cargo for deliveries to ports covered by your current licences.');add('Local logistics',lore[1]);}
 else if(id==='warehouse'){const w=warehouseOverview(s);add('Permanent local storage',`${w.tierLabel}: ${w.capacityKg/1000} tonnes owned. ${w.nextTier?`${w.nextTier.label} increases it to ${w.nextTier.capacityKg/1000} tonnes for ${w.price} cr.`:'Fully upgraded.'} No recurring rent.`);add('Local collection only','Stored goods stay at this station until you collect them. Client freight and restricted goods are not accepted.');}
 else if(id==='shipyard'){add('Your ship at this dock',`${sh.name}: ${s.hull}% integrity, ${fleetOverview(s).fuel.toFixed(1)} t shared fleet propellant, ${s.spares} engineering spares.`);add('Certified propellant',`${p.fuelPrice} cr per tonne at ${p.name}. Full and partial refueling is available for every ship berthed here.`);add('Specialist supply',facilities.ammo.length?'Coilgun ammunition supplied here. Lasers draw reactor power and need no ammunition.':'No coilgun ammunition at this dry dock. Lasers draw reactor power and need no ammunition.');}
 else if(id==='fleet'){add('Registered vessels',`${s.fleet.length+1} of ${MAX_FLEET} hulls owned. Cargo and fuel are shared by the travelling fleet; integrity and fitted equipment stay per hull. Berthed reserves keep their supplies at their port.`);add('Ships offered now',shipMarket(s).ships.length?shipMarket(s).ships.map(id=>ships.find(sh=>sh.id===id).name).join(', ')+'.':'No current hull offers.');add('Upgrades sold here',facilities.upgrades.map(id=>upgradeCatalog.find(m=>m.id===id).name).join(', ')+'.');}
 else if(id==='security'){add('Patrol jurisdiction',`${p.name} approach corridors. The local concern is ${p.hazard.toLowerCase()}.`);add('Wanted warrants',`${(s.claimedBounties||[]).length} of seven notorious-raider bounties collected. Accept a warrant with this officer; confirmed captures receive the posted payment.`);add('Your service record',`${s.profile.stats.victories} combat victories. Every hull has a standard laser. Sightings are unconfirmed; named warrants pay only after capture.`);}
 else if(id==='bank'){const terms=bankTerms(p.id,s);add('This branch’s annual rates',`${(terms.depositAPR*100).toFixed(2)}% on local deposits; ${(terms.loanAPR*100).toFixed(2)}% floating credit; ${(terms.fixedAPR*100).toFixed(2)}% fixed (+${(terms.fixedPremium*100).toFixed(2)} percentage points). Floating rates adjust daily with momentum. Fixed and earlier loans retain their terms. ${terms.surplusGoods} locally surplus goods and ${terms.consumptionGoods} net-consumption goods influence funding demand.`);add('This bank’s credit',`${Math.ceil(branchDebt(s)).toLocaleString('en-US')} cr owed here / ${terms.creditLimit.toLocaleString('en-US')} cr current limit. ${terms.explanation} Each bank keeps its own limit and rate; new loans also require a shared debt and asset review. Total network debt: ${s.debt.toLocaleString('en-US')} cr. Deposits remain at this branch.`);}
 else if(id==='authority'){const offers=localLicenceOffers(s);add('Available at this authority',offers.map(o=>o.name).join(', ')||'No new licences are available at this desk. Your existing access remains valid.');add('Your standing',`${licenceDiscount(s)}% career discount. Experience and qualifying ships are checked separately for each licence.`);}
 else if(id==='clinic'){const c=clinicOverview(s);add('Travelling crew',`${c.readiness}/100 readiness · ${c.condition}. Fatigue from voyages and disruption after hull damage lower readiness; below 60, equipment incidents become more likely.`);add('Community reserve',c.supply.waitDays?`Next request in ${c.supply.waitDays} days.`:`${c.supply.quantity} units of ${c.supply.name.toLowerCase()} requested. You own ${c.supply.owned} eligible units.`);}
 else if(id==='relay'){const c=coordinatorOverview(s);add('Arrival advisory',p.hazard+'. '+lore[1]);add('Station dispatch',`${c.unreportedVoyages} unreported voyages. Crew readiness ${c.crewReadiness}/100. Review your route, cargo and delivery deadline before booking a departure briefing.`);}
 else {add('Around the tables',lore[2]);add('A local perspective',lore[1]);}
 const history=s.dialogue.filter(d=>d.port===p.id&&(d.venue?d.venue===id&&(d.contact||'')===contact&&d.partner===host.person:d.speaker===host.person&&d.text.includes('**'+p.name+' · '+host.name+'**')));
 const last=history.findLast(d=>d.speaker===host.person),conversation=last?[last]:[];
 return {host:{...host,greeting:careerConversations.greeting(s,id,host,id==='authority'?diplomaticGreeting(s,host,dialogueVoices.greeting(s,id,host)):dialogueVoices.greeting(s,id,host))},standing:stationStanding(s),station:p.name,body:p.body,features,topics:dialogueChoices(s,id,contact,opening),tree:dialogueTree(s,id,contact),opportunities:relationshipOpportunities(s,id,contact),memory:dialogueMemory.overview(s,id,host),conversation:opening?[]:conversation};
}

function venueTalk(s,id,topic,contact='',opening=false){
 if(typeof topic==='string'&&(topic.startsWith('tree-')||topic.startsWith('op-discover-')||topic.startsWith('campaign-intro-')))return treeTalk(s,id,topic,contact||'',opening);
 const v=stationContacts(s.location,id,s).find(v=>(v.contactID||'')===(contact||''));check(v,'Unknown establishment.');const option=venueConversationOptions(s.location,id,contact||'',s).find(t=>t.id===topic);check(option,'Choose a conversation topic.');
 const p=port(s.location),key=s.location+':venue:'+id+(v.contactID?':'+v.contactID:'')+':'+topic,seen=s.topics.includes(key),lore=placeStories[p.id],n=Number(hash(v.person)%6n),crew=v.character.history;
 const duties={market:'A mislabeled crate can become someone else’s missing meal.',contracts:'I would rather negotiate a smaller promise than record a broken one.',shipyard:'Maintenance is a conversation with the person who last touched the assembly.',fleet:'A fleet is a collection of crews with their own stores, not extra icons around a flagship.',security:'We want crews brought home alive, including crews who made bad choices.',relay:'Clear communications save propellant, time and sometimes lives.',clinic:'A sterile seal and an honest manifest matter as much as a generous gesture.',authority:'I can quote a destination licence here before your crew commits to the flight.',bank:'A ledger is a record of promises. I explain the interest before I accept a signature.',local:'The commons is where a stranger gets a name before they get a reputation.'};
 let text;
 if(topic.startsWith('service-')){const data=id==='clinic'?clinicOverview(s):coordinatorOverview(s);text=`**${v.person} · ${v.name}**\n\n“${hostAdvice(s,v)}”\n\n“${topic==='service-supply'?`Every accepted reserve delivery is recorded. Your next request here opens after 60 ship-days. We accept your own goods, never a freight client’s shipment.`:topic==='service-research'?`Our current project is **${data.researchTitle}**. It is supervised station work, takes three days and requires crew readiness of at least 60. The stipend is **${data.researchReward} cr**. The same clinic offers another shift after 60 days.`:topic==='service-report'?`We record each voyage once across the station network. You have **${data.unreportedVoyages}** not yet filed; a report earns **${data.reportXP} navigation XP** and reputation progress. Reviewing the observations occupies one ship-day.`:topic==='service-manifest'?`Your travelling fleet carries **${data.clientUnits} client freight units** and **${data.restrictedUnits} restricted units**. ${data.freightDeadline===null?'No freight deadline is active.':`The active delivery is due on day **${data.freightDeadline}**. For the displayed route to ${port(data.destination).name}, projected margin is ${data.freightMargin} days. A detour still needs its own delivery plan.`} A manifest review does not grant a licence or exempt cargo from inspection.`:topic==='service-briefing'?`A briefing is tied to **this station and one licensed destination**, lasts 30 days and is used by one departure. Booking a different route replaces the prior briefing. The traffic report is a separate public-service record.`:`Readiness represents fatigue and minor injuries across your travelling crew. Recovery services restore that readiness; ship integrity, propellant and equipment are serviced by the dry dock.`}”`;}
 else if(topic==='intro')text=`**${v.person} · ${v.role}**\n\n“${seen?'Good to see you again, Captain '+s.profile.name+'.':v.greeting} This is **${v.name}**, at **${p.name}** above ${p.body}. ${duties[id]}”\n\n“${v.character.value} You have ${s.profile.stats.voyages} voyages behind you. ${s.profile.stats.deliveries?'Your record of kept deliveries gives us something practical to talk about.':'A first delivery is a better introduction than a grand promise.'}”`;
 else if(topic==='business')text=`**${v.name}**\n\n“${v.business}”\n\n“${lore[1]} ${duties[id]} ${v.character.value}”\n\n**For your ship:** ${hostAdvice(s,v)}`;
 else if(topic==='personal')text=`**${v.person} shares a memory.**\n\n“${crew}”\n\n“${v.character.habitSpoken} People notice the habit before they ask where it came from. ${v.character.value}”\n\n“${lore[2]} Living above ${p.body} has given that memory a different setting. ${v.character.mood}”`;
 else if(topic==='offduty')text=`**A life beyond ${v.name}**\n\n“I spend some of my free time ${v.character.interest}. A station can make every conversation about the next shift, so I try to keep one corner of the week for something that has no delivery deadline.”\n\n“${v.character.habitSpoken} ${v.character.mood} ${v.character.value}”`;
 else if(topic==='ambition')text=`**${v.person} looks ahead.**\n\n“I would like to ${v.character.goal}. It is a personal plan, rather than a job I can put on your freight board. I work on it between shifts here at ${p.name}.”\n\n“${v.character.history} That experience is part of why this matters to me. ${s.profile.stats.aid?'I noticed your help with medical supplies; practical kindness tends to travel farther than a speech.':s.profile.stats.deliveries?'A captain who keeps deliveries understands the value of finishing a small piece of a larger plan.':'Some ambitions begin with nothing more impressive than keeping the next small promise.'}”`;
 else if(topic==='place')text=`**A window onto ${p.body}**\n\n“${lore[0]}”\n\n“${lore[1]} My work at ${v.name} is one small part of keeping that arrangement alive. ${lore[2]}”`;
 else if(topic==='advice')text=`**${v.person} checks your transponder record.**\n\n“${v.character.value} ${hostAdvice(s,v)}”\n\n“${duties[id]}”`;
 else if(topic==='rumor'){const news=[`A crew brought a replacement assembly instead of extra sale cargo. The repair shop is still telling that story.`,`People are comparing convoy rosters. A second hull is useful only when someone has paid for its fuel and maintenance.`,`The latest common-room debate is whether a charter should follow a captain or a corporation. Most independent crews vote for the captain.`][(Math.floor(s.day/90)+n)%3];text=`**News around ${v.name}**\n\n“${news}”\n\n“Here at ${p.name}, the serious subject is ${p.hazard.toLowerCase()}. ${lore[1]} Check the actual freight board before acting on a dockside rumor; I cannot promise a price or an available contract.”`;}
 else if(topic==='history')text=`**A reputation made of actions**\n\n“${reputation(s)}. Your public record lists **${s.profile.stats.deliveries} deliveries**, **${s.profile.stats.aid} clinic donations** and **${s.profile.stats.victories} combat victories**. ${s.profile.relationships[p.id]>0?'Our station has its own record of your help.':'Our local relationship is still taking shape.'}”\n\n“${s.visited.length>3?'You have worked beyond your first few docks. People notice a captain who returns.':'Keep a few nearby promises before chasing a distant reputation.'} ${hostAdvice(s,v)}”`;
 else text=`**A practical favor**\n\n“${id==='clinic'?'The medical reserve is the most direct way to help.':id==='bank'?'Keep enough cash outside a deposit to pay for your next flight. We do not lock interest behind a fee.':id==='security'?'Record a sighting, then stay alert on your regular routes. Reported positions are uncertain; only a confirmed capture closes a warrant.':id==='contracts'?'A completed delivery puts useful supplies where somebody is waiting for them.':'Accurate manifests and promised supplies help this whole station.'} ${lore[1]}”\n\n“${hostAdvice(s,v)}”`;
 speak(s,s.profile.name,option.name+(/[.!?]$/.test(option.name)?'':'.'));speak(s,v.person,`**${p.name} · ${v.name}**\n\n${text}`);for(const line of s.dialogue.slice(-2)){line.venue=id;line.contact=contact||'';line.partner=v.person;}if(!seen){s.topics.push(key);earn(s,dialogueSkill(id),careerConversations.learning(s,id,v,3));}if(id==='clinic'&&['business','help'].includes(topic)&&!s.topics.includes(s.location+':aid'))s.topics.push(s.location+':aid');
}

function beltCrossing(s,dest,t){
 const a=port(s.location),b=port(dest);if(a.group===b.group)return false;
 const pa=a.phase+2*Math.PI*(s.day+t.waitDays)/a.period,pb=b.phase+2*Math.PI*(s.day+t.waitDays+t.coastDays)/b.period;
 const ax=a.au*Math.cos(pa),ay=a.au*Math.sin(pa),bx=b.au*Math.cos(pb),by=b.au*Math.sin(pb),dx=bx-ax,dy=by-ay;
 const f=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/(dx*dx+dy*dy||1))),near=Math.hypot(ax+f*dx,ay+f*dy);
 return near<3.3&&Math.max(a.au,b.au)>2.1;
}
function mapScene(s,dest,mode='inner'){
 check(['close','inner','outer','local'].includes(mode),'Unknown map scale.');const selected=port(dest),local=mode==='local',sys=system(selected.group),limit=local?Math.max(...world.ports.filter(p=>p.group===selected.group).map(p=>p.radius))*1.16:mode==='close'?2:mode==='inner'?6:33;
 const rows=local?world.ports.filter(p=>p.group===selected.group):world.systems;
 const nodes=rows.map(p=>{const radius=local?p.radius:p.au,period=local?orbitPeriod(p):p.period,phase=local?Number(hash(p.id)%6283n)/1000:p.phase,angle=phase+(local&&plane(p)>90?-1:1)*2*Math.PI*s.day/period;return {id:p.id,name:local?p.body:p.name,x:radius*Math.cos(angle)/limit,y:-radius*Math.sin(angle)/limit,radius:radius/limit,value:radius,tint:p.tint,locked:local?!destinationAccess(s,p.id).open:!world.ports.some(v=>v.group===p.id&&destinationAccess(s,v.id).open),visible:radius<=limit,selected:p.id===(local?dest:selected.group),docked:p.id===(local?s.location:port(s.location).group)};});
 return {mode,limit,unit:local?'km':'AU',center:local?sys.name:'Sun',nodes,description:local?'Linear orbital radii around '+sys.name:'Linear mean orbital radii around the Sun',note:'Circular orbit estimates at the ship’s date; phases illustrative, symbols enlarged. Not current ephemerides.',beltInner:local?0:2.1/limit,beltOuter:local?0:3.3/limit};
}
// Display-only ephemeris approximation. Never used for fuel, timing, prices or RNG.
function celestialMotion(id,day=0,localOrbit=false){
 const data=world.mapAstronomy,moon=data.moons[id],sys=world.systems.find(s=>s.id===id),jd=2440587.5+Date.UTC(2089,0,1)/86400000+day;
 if(moon){const period=Math.abs(moon[0]),direction=Math.sign(moon[0]),angle=Number(hash(id)%6283n)/1000+direction*2*Math.PI*day/period;return {kind:'moon',angle,period,direction,spinDays:moon[0],spinAngle:angle+Math.PI,tidallyLocked:true,inclination:moon[1],accuracy:'Illustrative phase; mean circular orbit',frame:'Parent spin pole'};}
 if(!sys||localOrbit){const p=port(id),period=orbitPeriod(p),angle=Number(hash(id)%6283n)/1000+2*Math.PI*day/period;return {kind:'station',angle,period,direction:1,tidallyLocked:false,accuracy:'Illustrative station orbit',frame:'Parent spin pole'};}
 let vector,accuracy='JPL approximate planetary position',valid=jd>=625674.5&&jd<=2817152.5;
 const solve=(a,e,i,L,peri,node)=>{const rad=Math.PI/180,M=mod((L-peri)*rad+Math.PI)-Math.PI;let ecc=M;for(let k=0;k<12;k++){const delta=(ecc-e*Math.sin(ecc)-M)/(1-e*Math.cos(ecc));ecc-=delta;if(Math.abs(delta)<1e-12)break;}const x=a*(Math.cos(ecc)-e),y=a*Math.sqrt(1-e*e)*Math.sin(ecc),w=(peri-node)*rad,O=node*rad,I=i*rad;return {x:(Math.cos(w)*Math.cos(O)-Math.sin(w)*Math.sin(O)*Math.cos(I))*x+(-Math.sin(w)*Math.cos(O)-Math.cos(w)*Math.sin(O)*Math.cos(I))*y,y:(Math.cos(w)*Math.sin(O)+Math.sin(w)*Math.cos(O)*Math.cos(I))*x+(-Math.sin(w)*Math.sin(O)+Math.cos(w)*Math.cos(O)*Math.cos(I))*y,z:Math.sin(w)*Math.sin(I)*x+Math.cos(w)*Math.sin(I)*y};};
 if(id==='ceres'){const c=data.ceres;vector=solve(c.a,c.e,c.i,c.ma+c.n*(jd-c.epoch)+c.w+c.om,c.w+c.om,c.om);accuracy='Ceres two-body estimate; perturbations omitted';}
 else if(valid){const [base,rates,terms]=data.planetElements[id],T=(jd-2451545)/36525,v=base.map((a,i)=>a+rates[i]*T);if(terms){const [b,c,s,f]=terms;v[3]+=b*T*T+c*Math.cos(f*T*Math.PI/180)+s*Math.sin(f*T*Math.PI/180);}vector=solve(...v);}
 else {const a=sys.phase+2*Math.PI*day/sys.period;vector={x:sys.au*Math.cos(a),y:sys.au*Math.sin(a),z:0};accuracy='Outside JPL model range; illustrative circular orbit';}
 return {kind:id==='ceres'?'dwarf planet':'planet',angle:Math.atan2(vector.y,vector.x),vector,period:id==='ceres'?data.ceres.per:sys.period,direction:1,spinDays:data.spinDays[id],tilt:data.axialTilt[id],tidallyLocked:false,accuracy,frame:'Ecliptic north'};
}
// Deterministic screen-space label placement, including lock badge and Sun exclusion.
function placeMapLabels(nodes,frame){
 const {cx,cy,rx,ry,width,height}=frame,occupied=[{x:cx-36,y:cy-30,w:72,h:70},...nodes.map(n=>({x:cx+n.plotX*rx-(n.id==='saturn'?33:24),y:cy+n.plotY*ry-24,w:n.id==='saturn'?66:48,h:48}))];
 const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
 for(const n of nodes){const bx=cx+n.plotX*rx,by=cy+n.plotY*ry,w=n.name.length*10.4+28+(n.locked?24:0),h=32,candidates=[];
  for(const distance of [39,59,83,109,139,169])for(let j=0;j<24;j++){const a=-Math.PI/2+j*Math.PI/12,dx=Math.cos(a),dy=Math.sin(a),x=bx+dx*(distance+w/2),y=by+dy*(distance+h/2),box={x:x-w/2,y:y-h/2,w,h};if(box.x<16||box.x+w>width-16||box.y<42||box.y+h>height-16)continue;const area=occupied.reduce((sum,o)=>sum+overlap(box,o),0);candidates.push({box,x,y,score:area*10000+Math.hypot(x-bx,y-by)+(j?1:0)});}
  candidates.sort((a,b)=>a.score-b.score);const best=candidates[0];n.labelBox=best.box;n.labelX=(best.x-cx)/rx;n.labelY=(best.y-cy)/ry;n.labelAnchor='middle';occupied.push({x:best.box.x-4,y:best.box.y-4,w:w+8,h:h+8});
 }
}
// Separate radial lanes preserve longitude while making conjunctions readable.
function navigationScene(s,dest,mode='outer'){
 const scene=mapScene(s,dest,mode),local=mode==='local',ordered=scene.nodes.filter(n=>n.visible).slice().sort((a,b)=>a.value-b.value),frame={cx:500,cy:300,rx:local?205:390,ry:local?185:235,width:1000,height:600},lanes=new Map(ordered.map((n,i)=>[n.id,ordered.length===1?.82:(local?.30:.16)+i*(local?.65:.96)/(ordered.length-1)]));
 const localSlots={1:[[-1.75,0]],2:[[-1.75,-.55],[1.75,.55]],3:[[-1.75,-.85],[1.75,-.85],[1.75,.85]],4:[[-1.75,-.85],[1.75,-.85],[-1.75,.85],[1.75,.85]],5:[[-1.75,-.95],[1.75,-.95],[-1.75,0],[1.75,0],[1.75,.95]]},slots=localSlots[ordered.length],rank=new Map(ordered.map((n,i)=>[n.id,i]));
 const nodes=scene.nodes.map(n=>{const motion=celestialMotion(n.id,s.day,local),radius=lanes.get(n.id)||n.radius,plotX=radius*Math.cos(motion.angle),plotY=-radius*Math.sin(motion.angle),slot=slots?.[rank.get(n.id)];return {...n,motion,radius,x:plotX,y:plotY,plotX,plotY,cardX:slot?.[0],cardY:slot?.[1],stationName:local?port(n.id).name:'',labelX:plotX,labelY:plotY-.15,labelAnchor:'middle'};});
 if(!local)placeMapLabels(nodes.filter(n=>n.visible),frame);
 const projectRadius=value=>{const points=[{value:0,r:0},...ordered.map(n=>({value:n.radius,r:lanes.get(n.id)}))];for(let i=1;i<points.length;i++)if(value<=points[i].value){const a=points[i-1],b=points[i];return a.r+(b.r-a.r)*(value-a.value)/(b.value-a.value);}return points.at(-1).r;};
 return {...scene,frame,nodes,beltInner:scene.beltInner?projectRadius(scene.beltInner):0,beltOuter:scene.beltOuter?projectRadius(scene.beltOuter):0,centerMotion:local?celestialMotion(port(dest).group,s.day):null,description:local?scene.center+' · moons and stations':'Solar System',note:local?'Moon motion uses real orbital periods; starting phases are illustrative. Station cards are linked to their orbital markers. Radii are compressed.':(nodes.some(n=>n.motion.accuracy.startsWith('Outside'))?'Beyond the JPL model’s date range; positions are illustrative.':'Planet longitudes follow the ship’s calendar using JPL approximations.')+' Orbital lanes are compressed; symbols are enlarged.',navigation:true};
}
function journeyFormation(count){
 check(integer(count,1,MAX_FLEET),'Choose a valid fleet formation.');
 if(count<=8)return Array.from({length:count},(_,i)=>({dx:-i*7,dy:i?(i%2?-1:1)*(22+Math.floor((i-1)/2)*18):0,scale:1,cluster:false}));
 const columns=Math.ceil(Math.sqrt(count*1.4)),rows=Math.ceil(count/columns),gap=count<=16?38:28,scale=count<=16?.4:.3;
 return Array.from({length:count},(_,i)=>({dx:(i%columns-(columns-1)/2)*gap,dy:(Math.floor(i/columns)-(rows-1)/2)*gap*.72,scale,cluster:true}));
}
function tacticalFormation(count){
 check(integer(count,1,MAX_FLEET),'Choose a valid fleet formation.');
 const columns=count<=4?1:count<=12?2:count<=24?3:4,rows=Math.ceil(count/columns),scale=Math.min(1,(760*.36/columns-10)/130,(550*.72/rows-6)/115);
 return Array.from({length:count},(_,i)=>({x:.08+(i%columns+.5)*.36/columns,y:.12+(Math.floor(i/columns)+.5)*.72/rows,scale}));
}

function combatScene(before,after,args={}){
 const current=after.battle||before.battle;if(!current)return {units:[],shots:[],order:args.order||'',caption:'No active engagement.'};
 const owned=[activeHull(after),...after.fleet.filter(v=>v.escort)],oldOwned=[activeHull(before),...before.fleet.filter(v=>v.escort)],victory=!after.battle&&after.battleHistory.at(-1)?.outcome==='victory';
 const enemies=after.battle?.enemies||before.battle.enemies.map(v=>({...v,hull:victory?0:v.hull}));
 const friendlyLayout=tacticalFormation(owned.length);
 const unit=(v,i,friendly)=>({currentShield:current.units?.[v.id]?.shield||0,shieldMax:shipRules.profile(v).shield,role:current.live?.ships?.[v.id]?.role||'engage',id:v.id,name:v.name,hull:v.hull,maxHull:friendly?100:v.maxHull,friendly,shipID:friendly?v.shipID:(v.shipID||(i===0?(bountyTarget(current.bountyID)?.shipID||'osprey'):'osprey')),upgrades:friendly?v.upgrades:(v.upgrades||{...emptyUpgrades(),weapons:1,armor:v.armor}),x:friendly?friendlyLayout[i].x:.8,y:friendly?friendlyLayout[i].y:.16+(i+.5)*.68/Math.max(1,enemies.length),scale:friendly?friendlyLayout[i].scale:1,selected:args.actor===v.id||args.target===v.id});
 const units=[...owned.map((v,i)=>unit(v,i,true)),...enemies.map((v,i)=>unit(v,i,false))],shots=[];
 if(current.live){const live=current.live;for(const u of units){if(u.friendly){const range=live.ranges[u.id]??current.range;u.x=.72-range/30;const index=owned.findIndex(v=>v.id===u.id);u.y=.16+(index+.5)*.68/Math.max(1,owned.length);u.scale=Math.min(1,5/Math.max(1,owned.length));if(live.fleet.formation==='spread')u.y=.12+(index+.5)*.76/Math.max(1,owned.length);if(live.fleet.formation==='screen'&&u.id!==after.flagshipID)u.x+=.035;}else u.x=.83;}for(const u of units){const last=live.events.findLast(e=>e.from===u.id);u.targetID=last?.to||(u.friendly&&after.battle?combat2.targetID(after,u.id):enemies.find(e=>e.id===u.id)?.ordnanceLock?.target||after.flagshipID);}if(args.live||args.order==='live')for(const e of live.events)shots.push({...e,friendly:!e.from.startsWith('hostile-'),weapon:e.weapon==='laser'?'laser':e.weapon==='ordnance'?'ordnance':'kinetic'});return {units,shots,order:'live',caption:after.battle?.log.slice(-2).join(' ')||after.battleHistory.at(-1)?.summary||current.title};}
 if(['laser','fire','salvo','ordnance'].includes(args.order)){
  const prev=before.battle?.enemies.find(v=>v.id===args.target),next=enemies.find(v=>v.id===args.target);shots.push({from:args.actor,to:args.target,hit:!!prev&&!!next&&(next.hull<prev.hull||(before.battle?.units?.[args.target]?.shield??0)>(after.battle?.units?.[args.target]?.shield??0)),friendly:true,weapon:args.order==='laser'?'laser':args.order==='ordnance'?'ordnance':'kinetic'});
 }
 if(after.battle&&before.battle&&after.battle.round>before.battle.round){
  const damaged=owned.filter(v=>v.hull<(oldOwned.find(o=>o.id===v.id)?.hull??v.hull));
  const shooter=enemies.find(v=>(before.battle.enemies.find(o=>o.id===v.id)?.ammo??v.ammo)>v.ammo);
  if(shooter)shots.push({from:shooter.id,to:(damaged[0]||owned[0]).id,hit:damaged.length>0,friendly:false,weapon:'kinetic'});
 }
 return {units,shots,order:args.order||'',caption:after.battle?.log.slice(-2).join(' ')||after.battleHistory.at(-1)?.summary||current.title};
}

// Original spacecraft, built from panelled pressure hulls and serviceable machinery.
// Every in-game hull now uses the frozen catalogue's current geometry and fitting design.
const shipVisualCache=new Map();let shipVisualBytes=0;
function shipVisual(v){
 const u={...emptyUpgrades(),...v.upgrades},base=ships.find(h=>h.id===v.shipID);check(base,'Unknown ship model.');
 const key='catalogue9:'+v.shipID+':'+upgradeCatalog.map(m=>u[m.id]).join('')+':'+(v.hull<35?2:v.hull<60?1:0);
 if(shipVisualCache.has(key)){const model=shipVisualCache.get(key);shipVisualCache.delete(key);shipVisualCache.set(key,model);return model;}
 check(shipGraphics&&shipGraphics.revision===9,'Current ship graphics are unavailable.');
 const caption=base.name+' · standard laser'+upgradeCatalog.filter(m=>u[m.id]>0).map(m=>' · '+m.name+' '+u[m.id]).join(''),model=shipGraphics.model({...v,upgrades:u},caption,key);
 while(shipVisualCache.size&&(shipVisualCache.size>=16||shipVisualBytes+model.bytes>64*1024*1024)){const oldest=shipVisualCache.keys().next().value;shipVisualBytes-=shipVisualCache.get(oldest).bytes;shipVisualCache.delete(oldest);}
 shipVisualCache.set(key,model);shipVisualBytes+=model.bytes;return model;
}

// Orbital infrastructure: original editable models, independent of solar-system bodies.
const stationVisualCache=new Map();
function stationVisual(pid,view='approach'){
 check(['approach','service','profile'].includes(view),'Choose a station viewpoint.');const cacheKey=pid+':'+view;
 if(stationVisualCache.has(cacheKey))return stationVisualCache.get(cacheKey);
 const p=port(pid),n=Number(hash(pid+':architecture')%17n);
 const profiles={
 earth:['wheel','Meridian metropolitan wheel',82,121,0,'B5B9AD'],
 moon:['pair','Shackleton terraced twin habitat',61,135,10,'AAA89A'],
 mars:['citadel','Valles armored commercial citadel',62,114,-10,'B98262'],
 phobos:['outpost','Stickney freight interchange',34,135,4,'A38E72'],
 ceres:['refinery','Occator refinery and bulk terminal',54,145,-5,'A58B61'],
 callisto:['pair','Valhalla convoy harbor',74,157,-12,'8F9FA6'],
 titan:['drum','Kraken enclosed drum colony',47,166,9,'A99270'],
 mercury:['shield','Caloris heat-shield bastion',73,99,-5,'B9A070'],
 venus:['shield','Aphrodite folded-shield science court',66,130,16,'C5AA7A'],
 'earth-high':['yard','Kepler three-cradle capital yard',41,225,4,'A4ADB0'],
 deimos:['outpost','Swift asymmetric service dock',27,165,-14,'9AA7A4'],
 jupiter:['cross','Zephyr radial research exchange',55,147,-9,'B6B5A5'],
 io:['fort','Pele radiation-shielded bastion',53,105,16,'A48F78'],
 europa:['cross','Conamara ice-science complex',43,163,6,'B4C3BF'],
 ganymede:['garden','Galileo broad garden ring',96,136,-11,'9AAE99'],
 saturn:['triad','Cassini stepped ring exchange',75,175,7,'B6AE91'],
 enceladus:['vertical','Tiger Stripe vertical research port',49,135,-4,'B8C7C4'],
 rhea:['refinery','Tirawa protected cargo vault',44,165,12,'A6AAA0'],
 iapetus:['yard','Cassini Ridge split-level gantry',36,245,-10,'A9A28E'],
 uranus:['spindle','Herschel stacked habitat spindle',58,180,7,'94AAA8'],
 miranda:['outpost','Verona assembled cross-terminal',39,111,16,'A7B3BA'],
 ariel:['sail','Ariel sail-array observatory',58,175,-11,'A8C0C1'],
 titania:['garden','Messina crown habitat',77,155,18,'9DADB6'],
 oberon:['yard','Mommur enclosed heavy drydock',46,183,12,'9DAAB0'],
 neptune:['observatory','Le Verrier deepwatch aperture',73,155,-6,'94A5B5'],
 triton:['ark','Lassell ark-derived research spine',64,201,10,'B4B6AE']
 };
 const [family,design,R,length,yaw,trim]=profiles[pid];
 const positions=[],normals=[],colors=[],surfaces=[],uvs=[],polys=[];
 const paint='889598',metal='485B66',dark='1B2931',gold='B49A60',accent=p.tint;
 const mats={paint:[.48,.48,0],metal:[.29,.86,0],glass:[.25,.62,0],dark:[.64,.25,0],glow:[.28,.15,1]};
 const sub=(a,b)=>a.map((v,i)=>v-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>{const d=Math.hypot(...a)||1;return a.map(v=>v/d);},rgb=h=>[16,8,0].map(b=>((parseInt(h,16)>>b)&255)/255);
 function face(pts,c,mat='paint'){
  const col=rgb(c);let normal;
  for(let i=1;i<pts.length-1;i++){const raw=cross(sub(pts[i],pts[0]),sub(pts[i+1],pts[0]));if(Math.hypot(...raw)<1e-7)continue;const nn=unit(raw);normal=nn;for(const j of [0,i,i+1]){positions.push(...pts[j]);normals.push(...nn);colors.push(...col);surfaces.push(...mats[mat]);uvs.push(j===1||j===2?1:0,j>=2?1:0,0);}}
  if(normal){const t=mats[mat][2]?1:.3+.7*Math.max(0,normal[2]*.84-normal[1]*.45-normal[0]*.3);polys.push({raw:pts,fill:col.map(v=>Math.min(255,Math.round(v*255*t)).toString(16).padStart(2,'0')).join(''),depth:pts.reduce((s,v)=>s+.562*v[0]+.721*v[1]+.408*v[2],0)/pts.length});}
 }
 function box(x,y,z,w,d,h,c=paint,mat='paint'){const pts=[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]];for(const f of [[0,3,2,1],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]])face(f.map(i=>pts[i]),c,mat);}
 function beam(a,b,r=2,c=metal,mat='metal',count=12){const dir=unit(sub(b,a)),u=unit(cross(dir,Math.abs(dir[2])<.9?[0,0,1]:[0,1,0])),v=cross(dir,u),ring=q=>Array.from({length:count},(_,i)=>q.map((x,j)=>x+r*(Math.cos(i*2*Math.PI/count)*u[j]+Math.sin(i*2*Math.PI/count)*v[j]))),aa=ring(a),bb=ring(b);face([...aa].reverse(),c,mat);face(bb,c,mat);for(let i=0;i<count;i++)face([aa[i],aa[(i+1)%count],bb[(i+1)%count],bb[i]],c,mat);}
 function torus(x,y,z,R,r=5,axis='x',window=true){const N=R<18?24:64,M=r<2?6:10,pt=(a,b)=>{const q=[r*Math.cos(b),(R+r*Math.sin(b))*Math.cos(a),(R+r*Math.sin(b))*Math.sin(a)];return axis==='z'?[x+q[1],y+q[2],z+q[0]]:[x+q[0],y+q[1],z+q[2]];};for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*2*Math.PI/N,b=(i+1)*2*Math.PI/N,c=j*2*Math.PI/M,d=(j+1)*2*Math.PI/M;face([pt(a,c),pt(a,d),pt(b,d),pt(b,c)],i%8===0?metal:i%8===1?accent:paint);}
  if(window)for(let i=0;i<N;i++){const a=(i+.15)*2*Math.PI/N,b=(i+.7)*2*Math.PI/N;let pts=[[r+.2,(R-1.1)*Math.cos(a),(R-1.1)*Math.sin(a)],[r+.2,(R-1.1)*Math.cos(b),(R-1.1)*Math.sin(b)],[r+.2,(R+1.1)*Math.cos(b),(R+1.1)*Math.sin(b)],[r+.2,(R+1.1)*Math.cos(a),(R+1.1)*Math.sin(a)]];pts=pts.map(q=>axis==='z'?[x+q[1],y+q[2],z+q[0]]:[x+q[0],y+q[1],z+q[2]]);face([...pts].reverse(),i%7===0?'CDD7C1':'70A7B5','glow');}
 }
 function truss(a,b,r=3){beam(a,b,r,dark);const length=Math.hypot(...sub(b,a)),count=Math.max(2,Math.floor(length/15));for(let i=0;i<count;i++){const t=i/count,tt=(i+1)/count,at=a.map((x,j)=>x+(b[j]-x)*t),bt=a.map((x,j)=>x+(b[j]-x)*tt);beam([at[0],at[1]-r*2,at[2]-r],[bt[0],bt[1]+r*2,bt[2]+r],.8,paint);beam([at[0],at[1]+r*2,at[2]-r],[bt[0],bt[1]-r*2,bt[2]+r],.8,paint);}}
 function panel(x,y,z,w,d){box(x-1,y-1,z,w+2,d+2,1.2,metal,'metal');for(let i=0;i<8;i++)for(let j=0;j<4;j++)box(x+i*w/8+.25,y+j*d/4+.25,z+1.3,w/8-.5,d/4-.5,.2,['28475D','35566B','3C5D72'][(i+j+n)%3],'glass');for(let i=0;i<4;i++)box(x,y+i*d/4,z+1.6,w,.18,.2,gold,'metal');}
 function module(x,y,z,l=28,r=7){beam([x,y,z],[x+l,y,z],r,paint,'paint',16);for(let a of [1,l-2])torus(x+a,y,z,r+.2,.7,'x',false);box(x+l*.25,y-r-.4,z-2,l*.45,.5,3,dark,'glass');box(x+l*.3,y-r-.7,z-1,l*.3,.3,.7,'9DC5CE','glow');}
 function dock(x,y,z){module(x,y,z,18,6);torus(x+19,y,z,7.5,1.4,'x',false);beam([x+19.3,y,z],[x+19.8,y,z],5.8,dark,'dark',16);for(let s of [-1,1])box(x+20,y+s*8-1,z-1,1,2,2,s<0?'C2715A':'90BDAD','glow');}
 function cargo(x,y,z,c=accent){box(x,y,z,18,12,13,c);for(let j=0;j<5;j++)box(x+2+j*3,y-.25,z+1,.5,.4,11,metal);box(x+1,y,z+13,16,12,.4,metal,'metal');}
 function dish(x,y,z,R=30){const N=40;for(let j=0;j<5;j++)for(let i=0;i<N;i++){const a=i*2*Math.PI/N,b=(i+1)*2*Math.PI/N,r=j*R/5,rr=(j+1)*R/5,pt=(r,t)=>[x+r*r/R*.25,y+r*Math.cos(t),z+r*Math.sin(t)];face([pt(r,a),pt(rr,a),pt(rr,b),pt(r,b)],j%2?paint:'CBD1C8','metal');}for(let i=0;i<8;i++){const a=i*Math.PI/4;beam([x,y,z],[x+R*.25,y+R*Math.cos(a),z+R*Math.sin(a)],.6,metal);beam([x+R*.25,y+R*Math.cos(a),z+R*Math.sin(a)],[x+R*.65,y,z],.45,paint);}beam([x-12,y,z],[x+R*.7,y,z],1.2,metal);}
 // District-scale architecture, recessed docking spaces and service equipment.
 const counts={hangars:0,habitatDistricts:0,trafficCraft:0};
 function slab(x,y,z,w,d,h,c=paint){const e=Math.min(d*.14,h*.25),ring=xx=>[[xx,y+e,z],[xx,y+d-e,z],[xx,y+d,z+e],[xx,y+d,z+h-e],[xx,y+d-e,z+h],[xx,y+e,z+h],[xx,y,z+h-e],[xx,y,z+e]],a=ring(x),b=ring(x+w);face([...a].reverse(),c);face(b,c);for(let j=0;j<8;j++)face([a[j],a[(j+1)%8],b[(j+1)%8],b[j]],j%3===0?metal:c);}
 function ribs(x,y,z,w,d){box(x,y,z,w,d,.7,dark,'dark');for(let i=0;i<7;i++)box(x+.5+i*(w-1)/7,y+.4,z+.8,.45,d-.8,.3,metal,'metal');}
 function serviceDeck(x,y,z,w=28,d=20){slab(x,y,z,w,d,2,metal);for(let i=0;i<3;i++){slab(x+2+i*8,y+2,z+2,6,d*.36,3,[paint,metal,trim][i]);ribs(x+2+i*8,y+d*.5,z+2,6,d*.4);}beam([x+2,y+d-2,z+3],[x+w-2,y+d-2,z+3],.45,gold);}
 function tinyShip(x,y,z,size=1){counts.trafficCraft++;const pt=(a,b,c)=>[x+a*size,y+b*size,z+c*size],v=[pt(-5,-2,0),pt(-5,2,0),pt(5,0,.2),pt(-3,0,2)];for(const f of [[0,1,2],[0,3,1],[0,2,3],[1,3,2]])face(f.map(i=>v[i]),'9BABA9','metal');face([pt(-5.1,-1,.3),pt(-5.1,1,.3),pt(-5.1,0,1.4)],'8EBCC7','glow');}
 function hangar(x,y,z,w=28,h=18,depth=27){counts.hangars++;const a=y-w/2,b=y+w/2,lo=z-h/2,hi=z+h/2;
  // Four walls and a rear bulkhead leave a genuinely recessed open entrance.
  box(x-depth,a-2,lo-2,depth+3,w+4,2,metal,'metal');box(x-depth,a-2,hi,depth+3,w+4,2,metal,'metal');box(x-depth,a-2,lo,depth+3,2,h,dark,'dark');box(x-depth,b,lo,depth+3,2,h,dark,'dark');box(x-depth-.3,a,lo,.5,w,h,'17252D','dark');
  for(let j=0;j<5;j++){const xx=x-depth+3+j*(depth-4)/5;box(xx,a+.8,lo+.2,2,h*.025,.2,'BBAC7B','glow');box(xx,b-1.3,lo+.2,2,.5,.2,'BBAC7B','glow');box(xx,a+.3,hi-1.2,.8,.4,.7,'B5C5C2','glow');box(xx,b-.7,hi-1.2,.8,.4,.7,'B5C5C2','glow');}
  slab(x-.5,a-4,lo-4,3,w+8,3,trim);slab(x-.5,a-4,hi+1,3,w+8,3,trim);slab(x-.5,a-4,lo-1,3,3,h+2,paint);slab(x-.5,b+1,lo-1,3,3,h+2,paint);
  for(let j=0;j<Math.floor(w/3);j++)box(x+2.6,a+j*3,lo-3.9,.3,1.5,2.7,j%2?gold:dark);
  for(let side of [-1,1])box(x+3,y+side*(w/2+3)-.8,z-1.3,.8,1.6,2.6,side<0?'BD5F44':'72B69F','glow');
  box(x-depth+4,y-3,lo+.2,9,6,.2,'4F6269');for(let i=0;i<3;i++)box(x-depth+4+i*3,y-3,lo+.5,1,6,.1,gold);tinyShip(x-depth+8,y,lo+.9,.65);
  // An attached external freight apron and rail-mounted service equipment.
  slab(x+1,a-4,lo-5,20,w+8,1.5,metal);for(let yy of [a-3,b+3]){beam([x+2,yy,lo-3],[x+19,yy,lo-3],.35,paint);for(let dx of [3,11,18])beam([x+dx,yy,lo-4],[x+dx,yy,lo-2.5],.23,paint);}
 }
 function core(x,length,r=25){beam([x,0,0],[x+length,0,0],r,dark,'dark',16);for(let k=0;k<8;k++){const xx=x+k*length/8;for(let j=0;j<16;j++){const a=j*Math.PI/8,b=(j+1)*Math.PI/8,rr=r+.13,pt=(at,t)=>[at,rr*Math.cos(t),rr*Math.sin(t)];face([pt(xx+.2,a+.015),pt(xx+.2,b-.015),pt(xx+length/8-.2,b-.015),pt(xx+length/8-.2,a+.015)],(j+k)%7===0?trim:(j+k)%4===0?metal:paint);}}
  torus(x+5,0,0,r+.6,1.2,'x',false);torus(x+length-6,0,0,r+.6,1.2,'x',false);for(let k=0;k<3;k++)serviceDeck(x+9+k*length*.21,-8,r-1,length*.18,16);
 }
 function ringHab(x,R,width=13,sections=32,green=false){
  torus(x,0,0,R,width*.55,'x',false);
  const at=(xx,r,t)=>[xx,r*Math.cos(t),r*Math.sin(t)];
  for(let j=0;j<sections;j++){counts.habitatDistricts++;const a=(j+.025)*2*Math.PI/sections,b=(j+.975)*2*Math.PI/sections,inner=R-width*.54,outer=R+width*.7+(j%4===0?2:0),back=x-width*.6,front=x+width*.65;
   const pts=[at(back,inner,a),at(back,outer,a),at(back,outer,b),at(back,inner,b),at(front,inner,a),at(front,outer,a),at(front,outer,b),at(front,inner,b)];for(const f of [[0,3,2,1],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]])face(f.map(i=>pts[i]),j%8===0?trim:j%3===0?'8B9698':paint);
   // Window rows and narrow unlit service strips give habitat districts a human scale.
   for(let row=0;row<3;row++)for(let pane=0;pane<4;pane++){const aa=a+(b-a)*(.08+pane*.22),bb=aa+(b-a)*.12,rr=inner+2.2+row*width*.25;face([at(front+.15,rr,aa),at(front+.15,rr+width*.10,aa),at(front+.15,rr+width*.10,bb),at(front+.15,rr,bb)],(j+pane+row)%5===0?'253842':green&&row===2?'75958C':(j+row)%3===0?'CFB58B':'A6BBBC',(j+pane+row)%5===0?'dark':'glow');}
   if(j%3===0){const rr=outer+.3;face([at(back+2,rr,a+.02),at(front-1,rr,a+.02),at(front-1,rr,b-.02),at(back+2,rr,b-.02)],green?'4F7068':dark,green?'glass':'dark');}
  }
  for(let j=0;j<6;j++){const a=j*Math.PI/3,y=R*Math.cos(a),z=R*Math.sin(a);beam([x,0,0],[x,y,z],2.6,metal);beam([x-7,y*.15,z*.15],[x-2,y*.96,z*.96],.7,gold);}
 }
 function finRadiator(x,y,z,w,d){beam([x+w*.5,0,z],[x+w*.5,y+(y<0?d:0),z],1.3,metal);box(x,y,z,w,d,.6,dark);for(let i=0;i<10;i++){box(x+1+i*(w-2)/10,y+.6,z+.8,.6,d-1.2,.3,'65594C','metal');}beam([x,y,z],[x+w,y,z],.5,metal);beam([x,y+d,z],[x+w,y+d,z],.5,metal);}
 function yard(bays=3,length=195,width=85,levels=1){
  core(-length*.6,40,19);const back=-length*.4,front=length*.5;
  for(let bay=0;bay<bays;bay++){const y=(bay-(bays-1)/2)*width;truss([back,y,0],[front,y,0],3.5);beam([back,0,0],[back,y,0],3);for(let j=0;j<5;j++){const xx=back+j*(front-back)/4;for(let side of [-1,1]){beam([xx,y+side*25,0],[xx,y+side*25,45+levels*8],1.5,metal);beam([xx,y,0],[xx,y+side*25,0],1.5,metal);beam([xx,y+side*25,45+levels*8],[xx,y+side*8,45+levels*8],1.2,paint);slab(xx-4,y+side*25-3,40+levels*8,9,6,6,trim);}if(j%2===0){serviceDeck(xx-6,y-17,1,12,15);cargo(xx-8,y+6,2,trim);}}tinyShip(front-25,y,9,2.5);hangar(back-2,y,4,23,17,18);}
  for(let side of [-1,1]){truss([back,0,-7],[back,side*(bays*width*.52),-7],2);finRadiator(back-15,side<0?-bays*width*.52-30:bays*width*.52,-8,65,28);}
 }
 function silo(x,y,z,r=10,height=55){beam([x,y,z],[x,y,z+height],r,'8F9996','paint',20);for(let zz of [z+3,z+height-3]){torus(x,y,zz,r+.3,.8,'z',false);}beam([x-r,y,z+4],[x-r,y,z+height-4],.45,gold);serviceDeck(x-r,y-r,z+height,r*2,r*2);}
 // Individually configured ports share construction primitives, not a single layout.
 if(family==='wheel'||family==='pair'||family==='garden'||family==='triad'){
  core(-length*.62,length,26);hangar(length*.38+24,0,0,35,23,24);
  const rings=family==='pair'?[[ -31,R*.86],[35,R]]:family==='triad'?[[-53,R*.67],[-8,R*.91],[43,R*1.12]]:[[family==='garden'?-18:-15,R]];
  for(const [x,r] of rings)ringHab(x,r,family==='garden'?17:13,family==='garden'?40:32,family==='garden');
  const arm=R+28;for(let side of [-1,1]){beam([-length*.55,side*17,-8],[-length*.55,side*arm,-8],2.5,metal);finRadiator(-length*.62,side<0?-arm-36:arm,-10,51,33);}
  if(pid==='earth'){for(let i=0;i<4;i++){const a=i*Math.PI/2+.3,y=(R+12)*Math.cos(a),z=(R+12)*Math.sin(a);module(-27,y,z,28,8);beam([-18,y*.8,z*.8],[-18,y,z],1.7,metal);}}
  if(pid==='titania')for(let i=0;i<8;i++){const a=i*Math.PI/4;slab(-37,(R+9)*Math.cos(a)-6,(R+9)*Math.sin(a)-7,28,12,14,trim);}
  for(let side of [-1,1]){beam([-45,side*18,-10],[-39,side*36,-30],2);slab(-63,side<0?-56:29,-34,38,27,14,trim);serviceDeck(-57,side<0?-52:33,-20,27,18);}
 }else if(family==='citadel'||family==='fort'){
  const sides=family==='fort'?8:6;beam([-length*.6,0,0],[length*.25,0,0],R,dark,'dark',sides);
  // Replace large featureless hull faces with inset armor bays and service seams.
  for(let j=0;j<sides;j++){const a=(j+.5)*2*Math.PI/sides,rr=R*Math.cos(Math.PI/sides)+.25,half=R*Math.sin(Math.PI/sides),at=(x,t)=>[x,rr*Math.cos(a)-t*Math.sin(a),rr*Math.sin(a)+t*Math.cos(a)];for(let row=0;row<3;row++)for(let col=0;col<6;col++){const x=-length*.59+col*length*.137,t=-half+1+row*(half*2-2)/3,w=length*.13,h=(half*2-2)/3-1;face([at(x,t),at(x,t+h),at(x+w,t+h),at(x+w,t)],(j+row+col)%9===0?trim:(j+col)%4===0?metal:paint);}}

  for(let j=0;j<sides;j++){const a=(j+.5)*2*Math.PI/sides,rr=R*.9,y=rr*Math.cos(a),z=rr*Math.sin(a);module(-length*.48,y,z,length*.57,9);slab(-length*.35,y-10,z-8,length*.47,20,16,j%2?trim:paint);for(let i=0;i<3;i++)serviceDeck(-length*.3+i*19,y-5,z+8,13,9);}
  core(-length*.2,length*.48,R*.45);hangar(length*.28+25,0,0,38,26,26);ringHab(-length*.6,R*.68,9,24);
  for(let side of [-1,1]){beam([-24,side*R*.6,0],[-24,side*(R+43),0],3);finRadiator(-48,side<0?-R-80:R+45,-6,64,31);}
  if(family==='fort'){for(let side of [-1,1])slab(-length*.55,side<0?-R-6:R-9,-R*.5,length*.7,15,R*.9,trim);}
 }else if(family==='yard'){
  yard(pid==='earth-high'?3:pid==='iapetus'?2:1,length,pid==='earth-high'?69:82,pid==='iapetus'?2:1);
  if(pid==='oberon'){for(let side of [-1,1]){slab(-42,side<0?-42:30,-5,132,12,64,trim);for(let i=0;i<5;i++)ribs(-37+i*25,side<0?-43:42,48,16,4);}hangar(94,0,18,45,31,34);}
  else hangar(-length*.6+41,0,-11,29,19,21);
 }else if(family==='outpost'){
  core(-length*.55,length*.66,18);hangar(length*.11+21,0,0,29,20,21);
  const branches=pid==='phobos'?3:pid==='deimos'?2:4;
  for(let j=0;j<branches;j++){const a=j*2*Math.PI/branches+.4,yy=(R+15)*Math.cos(a),zz=(R+15)*Math.sin(a);beam([-35,0,0],[-35,yy,zz],2.5,metal);slab(-65,yy-14,zz-11,49+j*7,28,22,j%2?trim:paint);serviceDeck(-57,yy-11,zz+11,26,21);hangar(5+j*5,yy,zz,21,15,18);}
  for(let side of [-1,1])finRadiator(-90,side<0?-R-72:R+32,-17,78,36);
  if(pid==='deimos'){slab(-70,-57,-28,118,31,24,trim);for(let j=0;j<5;j++)cargo(-64+j*21,-54,-2);}
 }else if(family==='refinery'){
  core(-length*.56,length*.64,29);hangar(length*.08+26,0,0,35,24,26);
  const rows=pid==='ceres'?3:2;
  for(let i=0;i<rows;i++)for(let side of [-1,1]){const x=-length*.39+i*42,y=side*(R+10);beam([x,0,0],[x,y,0],3);slab(x-18,y-17,-15,37,34,7,metal);silo(x,y,-8,pid==='ceres'?12:16,51+i*6);for(let j=0;j<2;j++)cargo(x-16+j*18,y-13,50+i*6,j%2?trim:metal);}
  for(let side of [-1,1])finRadiator(-length*.4,side<0?-R-78:R+47,-26,length*.72,27);ringHab(-length*.6,R*.67,9,24);
 }else if(family==='shield'){
  const layers=pid==='mercury'?3:2;
  for(let layer=0;layer<layers;layer++)for(let j=0;j<12;j++){const a=j*Math.PI/6,b=(j+1)*Math.PI/6,r=R-layer*5,x=-53-layer*7,pt=(rr,t)=>[x+rr*.1,rr*Math.cos(t),rr*Math.sin(t)];face([pt(10,a),pt(r,a+.005),pt(r,b-.005),pt(10,b)],j%2?'A38B5B':'C2AA73','metal');face([pt(10,b),pt(r,b-.005),pt(r,a+.005),pt(10,a)],'655F4B','metal');beam([x,0,0],pt(r,a),.8,metal);}
  core(-48,length*.73,20);hangar(-48+length*.73+21,0,0,27,19,21);
  for(let side of [-1,1]){module(-28,side*30,7,39,9);beam([-21,0,0],[-21,side*30,7],2);finRadiator(-37,side<0?-R-58:R+16,-16,pid==='venus'?104:76,32);}
  if(pid==='venus'){for(let i=0;i<3;i++){module(-29+i*20,0,33,17,8);beam([-22+i*20,0,18],[-22+i*20,0,33],2);}dish(15,0,55,15);}
 }else if(family==='cross'||family==='sail'){
  core(-length*.42,length*.65,22);hangar(length*.23+23,0,0,29,19,23);
  for(let j=0;j<(family==='sail'?2:4);j++){const a=j*Math.PI/2+.3,y=(R+10)*Math.cos(a),z=(R+10)*Math.sin(a);truss([-34,0,0],[-34,y,z],3);slab(-61,y-13,z-9,63,26,18,trim);serviceDeck(-55,y-10,z+9,43,19);for(let t=0;t<3;t++)module(-57+t*20,y,z+17,17,5);}
  for(let side of [-1,1]){panel(-length*.48,side<0?-R-76:R+26,-25,family==='sail'?144:84,42);beam([-55,side*20,-10],[-55,side*(R+35),-25],2.5,metal);}
  dish(-length*.4,0,42,pid==='europa'?30:23);
 }else if(family==='drum'){
  truss([-length*.55,0,-12],[length*.47,0,-12],6);
  for(let j=-1;j<=1;j++){const y=j*41;module(-length*.43,y,17,length*.74,17);for(let i=0;i<6;i++){const xx=-length*.4+i*length*.11;torus(xx,y,17,18,.75,'x',false);serviceDeck(xx,y-8,34,12,16);}beam([-length*.45,0,-12],[-length*.45,y,17],3);beam([length*.3,0,-12],[length*.3,y,17],3);hangar(length*.31+23,y,17,27,20,23);}
  for(let side of [-1,1])finRadiator(-72,side<0?-119:81,-18,133,32);ringHab(-length*.57,R,10,28);
 }else if(family==='vertical'||family==='spindle'){
  truss([0,0,-length*.55],[0,0,length*.5],6);
  for(let i=0;i<(family==='spindle'?3:2);i++){const zz=-length*.35+i*length*.29,rr=R*(.72+i*.15);torus(0,0,zz,rr,8,'z');for(let j=0;j<4;j++){const a=j*Math.PI/2,y=rr*Math.cos(a),x=rr*Math.sin(a);beam([0,0,zz],[x,y,zz],2.5,metal);slab(x-8,y-8,zz,16,16,13,trim);serviceDeck(x-6,y-6,zz+13,12,12);}}
  core(-27,54,19);hangar(53,0,0,32,22,26);for(let side of [-1,1])finRadiator(-47,side<0?-100:65,8,94,30);dish(0,0,length*.54,25);
 }else if(family==='observatory'){
  core(-length*.58,length*.67,23);hangar(length*.09+24,0,-7,31,21,24);ringHab(-length*.49,42,10,28);
  dish(-3,0,38,R);for(let side of [-1,1]){beam([-56,side*16,0],[-56,side*63,17],3);module(-77,side*63,17,47,10);dish(-50,side*65,35,21);panel(-88,side<0?-127:91,-15,94,31);beam([-53,side*60,12],[-53,side*94,-15],2,metal);}
 }else if(family==='ark'){
  core(-length*.56,length*.76,27);hangar(length*.2+28,0,0,38,25,28);ringHab(-length*.41,R,14,36);ringHab(length*.02,R*.71,11,28);
  for(let side of [-1,1]){slab(-length*.31,side<0?-50:24,-18,length*.47,26,36,trim);serviceDeck(-length*.24,side<0?-46:28,18,length*.33,18);panel(-length*.35,side<0?-R-61:R+24,-22,102,31);beam([-length*.2,side*35,-15],[-length*.2,side*(R+30),-22],2,metal);dish(-60,side*48,39,23);}
 }
 // Connected antenna towers, running lights and small craft make scale legible.
 for(let side of [-1,1]){beam([-length*.35,side*10,20],[-length*.35,side*10,53],.8,metal);box(-length*.35-1,side*10-1,53,2,2,2,'C8D0BC','glow');}tinyShip(length*.55+27,11,-12,.8);tinyShip(length*.55+41,-7,5,.55);
 const angle=(yaw+(view==='service'?155:view==='profile'?77:0))*Math.PI/180,cs=Math.cos(angle),sn=Math.sin(angle),rot=v=>[v[0]*cs-v[1]*sn,v[0]*sn+v[1]*cs,v[2]];
 for(const array of [positions,normals])for(let i=0;i<array.length;i+=3){const x=array[i],y=array[i+1];array[i]=x*cs-y*sn;array[i+1]=x*sn+y*cs;}for(const f of polys){f.raw=f.raw.map(rot);f.depth=f.raw.reduce((s,v)=>s+.562*v[0]+.721*v[1]+.408*v[2],0)/f.raw.length;}
 const pr=v=>[.788*v[0]-.615*v[1],-.251*v[0]-.321*v[1]+.913*v[2]];let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;for(const f of polys)for(const v of f.raw){const q=pr(v);minX=Math.min(minX,q[0]);maxX=Math.max(maxX,q[0]);minY=Math.min(minY,q[1]);maxY=Math.max(maxY,q[1]);}
 const scale=Math.min(354/(maxX-minX),203/(maxY-minY)),cx=(minX+maxX)/2,cy=(minY+maxY)/2;polys.sort((a,b)=>a.depth-b.depth);
 const features=[counts.hangars>1?counts.hangars+' recessed docking halls':'Recessed docking hall and approach apron',counts.habitatDistricts?counts.habitatDistricts+' segmented habitat districts':'Industrial pressure modules and service decks','Heat radiators, maintenance equipment and cargo traffic'];
 const model={key:'station16:'+pid+':'+view,mesh:{positions,normals,colors,surfaces,uvs},projection:{scale,cx,cy},polygons:polys.map(f=>({points:f.raw.map(v=>{const q=pr(v);return [200+(q[0]-cx)*scale,122.5-(q[1]-cy)*scale];}),fill:f.fill})),width:400,height:245,design,family,counts,features,view,caption:p.name+' · '+design};
 if(stationVisualCache.size>=6)stationVisualCache.delete(stationVisualCache.keys().next().value);stationVisualCache.set(cacheKey,model);return model;
}

// Presentation only: keep older saved conversations intact while updating dockside copy.
function immersiveText(value){
 return String(value).replace(/\*\*Behind the counter at ([^\n*]+)\*\*/gi,'**$1**').replace(/; this industry is fictional\./gi,'.')
  .replace(/\ba fictional (?=[aeiou])/gi,match=>match[0]==='A'?'An ':'an ')
  .replace(/\bfictional\s+/gi,'');
}

// Saved conversation cursors and one-time consequences. Reading a visit is pure.
const dialogueNodes=['freight-dispatch',...careerConversationFactory.nodes,...storyConversationFactory.nodes,'patrol-blockades',...world.ports.map(p=>'patrol-blockade-'+p.id),'project-review','challenge-craft','challenge-story','challenge-needs','bank-outlook','reputation-rumor','blockades',...world.ports.map(p=>'blockade-'+p.id),'relics','relic-collectors','relic-sale-surveyor','relic-sale-annealer','relic-sale-accord','relic-sale-charter','relic-discovery','relic-battle','relic-authority','crew',...Array.from({length:6},(_,i)=>'crew-candidate-'+i),'services','storage','storage-ordinary','storage-bonded','storage-discreet','government','gov-history','gov-veyr','gov-ilyri','gov-detail','root','bounties','bounties-1','bounties-2','bounties-3','bounty-red-wake','bounty-lockjaw','bounty-cinder-queen','bounty-glass-jackal','bounty-ringbreaker','bounty-pale-knife','bounty-last-signal','market-advice','market-selling','work','detail','story','values','local','needs','terms','risk','guarded','remember','record','confidence','relationship','craft','practice','memory','interests','ambition','logistics','safety','sources','trade-lead','agreement','patron','project','supply-offer',...Array.from({length:16},(_,i)=>'register-'+i)];
const dialogueEffects={
 'tree-careful':['work',4,1],'tree-followup':['work',4,0],
 'tree-listen':['diplomacy',4,1],'tree-support':['diplomacy',4,1],
 'tree-logistics':['navigation',4,0],'tree-safety':['engineering',4,0],
 'tree-offer':['work',3,1],'tree-pressure':['diplomacy',-4,-2],
 'tree-pry':['diplomacy',-3,-2],'tree-threat':['diplomacy',-6,-3]
};
function dialogueSkill(id){return ['market','warehouse','contracts','bank'].includes(id)?'commerce':['shipyard','fleet','clinic'].includes(id)?'engineering':['relay','authority','security'].includes(id)?'navigation':'diplomacy';}
function dialogueKey(s,id,contact=''){return s.location+':'+id+':'+contact;}
function dialogueSession(s,id,contact=''){return s.dialogueProgress?.sessions[dialogueKey(s,id,contact)]||{node:'root',rapport:0,resolved:[],outcome:'',insight:false};}
function ensureDialogue(s){if(!s.dialogueProgress)s.dialogueProgress={sessions:{},commissions:[]};return s.dialogueProgress;}
function dialogueCommission(s,id,contact=''){return s.dialogueProgress?.commissions.findLast(q=>q.context===dialogueKey(s,id,contact))||null;}
// Captain-facing words only. Stable topic IDs, eligibility and transaction terms are unchanged.
function captainReplyLabel(topic,fallback){
 const replies={
  'tree-services':'What other matters do you handle here?',
  'tree-project-verify':'Let’s get an independent check first.',
  'tree-project-care':'Let’s hear the crew out and find a way to put this right.',
  'tree-project-shortcut':'Let’s skip the full check and move this along.',
  'tree-project-open':'I’ll file the full account, including anything we skipped.',
  'tree-project-confidential':'I’d rather keep the crew’s account with this desk.',
  'tree-project-falsify':'I’ll say every check passed, even though that isn’t true.',
  'tree-project-work':'Can we go through my part of the project?',
  'tree-project-review':'What do I need to do next?',
  'tree-offer-decline':'No, I’ll leave this one.',
  'tree-clarify':'Could we go over the terms once more?',
  'tree-challenge-craft':'Do we really need all these checks?',
  'tree-challenge-story':'There’s more to that story, isn’t there?',
  'tree-challenge-needs':'Surely you can find something for me?',
  'tree-crew':'Is anyone here looking for a berth?',
  'tree-crew-planning':'What should I think about before taking someone on?',
  'tree-storage-conceal':'I’ll lease the space with the matching concealment.',
  'tree-relic-accept':'I’ll follow up on this lead.',
  'tree-service-open':'Let’s have a look at what’s available here.'
 };
 if(topic==='tree-crew'&&fallback==='Other candidates.')return 'Who else is looking for a berth?';
 if(Object.hasOwn(replies,topic))return replies[topic];
 if(topic==='tree-project-confirm')return 'I’m ready. Let’s do the work we agreed on.';
 if(topic==='tree-check-promise')return fallback==='Return for payment.'?'Both stages are signed. Can we settle up?':'Can we go over the job we agreed on?';
 if(topic==='tree-complete')return /supplies/i.test(fallback)?'Here are the supplies we agreed on.':'I’m ready to give you my report.';
 if(topic==='tree-back'&&['Another subject.','Something else.'].includes(fallback))return 'Let’s talk about something else.';
 if(/^tree-crew-(?:first|second|third|fourth|fifth|sixth)$/.test(topic))return fallback.replace(/^Meet (.*?) · (.*)$/,'Could you introduce me to $1? · $2');
 if(topic==='tree-crew-hire')return fallback.replace(/^Hire (.*?) · (.*)$/,'I’d like $1 to join my crew. · $2');
 if(topic==='tree-relic-sell')return fallback.replace(/^Sell relic · (.*)$/,'Yes, I’ll sell it for $1.');
 if(topic==='tree-relic-collectors'&&fallback==='Other relics.')return 'What other relics would you consider?';
 if(topic==='tree-storage-accept')return fallback.replace(/^Lease the space · (.*)$/,'Yes, I’ll lease the space for $1.');
 if(topic==='tree-blockade-accept')return /^Resume/.test(fallback)?'I’m ready to resume the liberation mission.':'I’ll take on this liberation mission.';
 if(topic==='tree-blockades'&&fallback==='Other blockade reports.')return 'Are there any other blockades I should know about?';
 return fallback;
}
function dialogueReportSignature(s,id,host,topic){
 let report=null;
 if(id==='bank'&&topic==='tree-bank-rates')report=bankOutlook(s,'rates');
 else if(id==='security'&&topic==='tree-patrol-blockades')report=patrolReports.blockadeBriefing(api,s);
 else if(id==='local'&&topic==='tree-reputation-rumor'){const view=reputationRumorView(s);report=view.welcome+'\n'+view.text;}
 else if(['tree-career-travellers','tree-career-outside'].includes(topic))report=careerConversations.report(s,id,host,topic);
 return report?hash(report).toString(16):null;
}
function dialogueChoices(s,id,contact='',opening=false){
 const host=stationContacts(s.location,id,s).find(v=>(v.contactID||'')===contact);check(host,'Unknown establishment contact.');
 const session=dialogueSession(s,id,contact),node=opening?'root':session.node,unfolding=careerConversations.options(s,id,host,node)||storyConversations.choices(s,id,host,node),choices=[],memory=dialogueMemory.overview(s,id,host,session),patron=relationshipOpportunities(s,id,contact);
 const add=(key,name,disabled=false)=>choices.push({id:key,name:privateProjectChoice(s,id,host,key,dialogueMemory.choice(s,id,host,key,dialogueVoices.choice(s,id,host,key,name))),detail:'',disabled});
 if(node==='root'){
  if(['contracts','relay','market'].includes(id))add('tree-freight-dispatch',id==='contracts'?'How are you matching these shipments?':id==='market'?'How do these reserves fit the freight board?':'How are you coordinating the freight routes?');
  add('tree-work','What is the work like here?');
  const second=['strained','wary','disappointed'].includes(memory.relation)?'tree-relationship':id==='market'&&memory.events.length?'tree-market':id==='security'&&memory.events.length?'tree-record':memory.personal?'tree-reconnect':'tree-story';
  add(second,second==='tree-market'?'What’s worth trading today?':'How did you come here?');
  add(['security','local'].includes(id)?'tree-bounties':id==='authority'?'tree-government':id==='bank'?'tree-bank-rates':memory.events.length?'tree-record':id==='market'?'tree-market':'tree-local',id==='security'?'What is the latest word on the bounties?':id==='local'?'Heard anything about the wanted raiders?':id==='market'?'What’s worth trading today?':id==='authority'?'What does being a government liaison involve?':id==='bank'?'How are rates moving?':'What should I know about this station?');
  if(id==='local'&&warehouseFacility(s.location)&&s.warehouses?.[s.location]&&!['active','offered'].includes(memory.commission)&&!personalProjectsHere(s,id,contact).length)add('tree-storage','Any tenants for my spare warehouse space?');
  else add(personalProjectsHere(s,id,contact).length?'tree-project-work':memory.commission==='active'?'tree-check-promise':privateProjectAtDesk(s,id,contact)?.status==='active'?'tree-project-review':memory.commission==='offered'?'tree-offer':patron.visible?'tree-patron':['completed','failed'].includes(memory.commission)&&second!=='tree-relationship'?'tree-relationship':'tree-offer','Is there anything I could help with?');
  if(id==='relay'&&(operationDiscoveryChoices(s,id).length||campaignIntroductions(s,id).length))add('tree-register','Discuss passenger transport and ship or fleet escorts.');
  if(id==='local')add('tree-reputation-rumor','What are people saying about my reputation?');
  if(id==='security')add('tree-patrol-blockades','Are any local stations under blockade?');
  if(id==='authority')add('tree-blockades','Does any station need help breaking a blockade?');
  if(['local','relay','security','authority'].includes(id))add('tree-relics','Do you know of any relics or lost instruments?');
  if(id==='local'&&!contact)add('tree-crew','Is anyone looking to join a travelling crew?');
  add('tree-services','Show me the work and services available here.');
  add('tree-lore','There’s something about this place I wanted to understand.');
  add('tree-career','Could we continue your own story?');
  if(memory.events.length&&!choices.some(t=>t.id==='tree-record'))add('tree-record','There are changes in my record I wanted to discuss.');
 }else if(unfolding){for(const t of unfolding)add(t.id,t.name,t.disabled);
 }else if(id==='security'&&(node==='patrol-blockades'||node.startsWith('patrol-blockade-'))){
  if(node==='patrol-blockades')for(const p of patrolReports.localBlockades(api,s).active)add('tree-patrol-blockade-'+p.port,'Tell me about the blockade at '+port(p.port).name+'.');
  add('tree-patrol-blockades','What is the latest local blockade situation?');
 }else if(id==='bank'&&node==='bank-outlook'){
  add('tree-bank-rates','How are rates moving now?');
  add('tree-bank-conditions','What is driving financial conditions here?');
  add('tree-bank-fixed','What should I consider before fixing a rate?');
 }else if(node==='freight-dispatch'){
  if(['market','contracts'].includes(id))add('tree-merchant-supply','Is anyone buying supplies for their own stores?');
  add(id==='contracts'?'tree-service-open':id==='market'?'tree-market-production':'tree-services',id==='contracts'?'Let me review the shipment board.':id==='market'?'Which inputs are the production lines missing?':'Let’s review a departure route.');
 }else if(node==='services'){
  add('tree-service-open','Open this establishment’s services.');
  if(id!=='authority'&&id!=='local')add('tree-local','What should I know about life and routes at this station?');
  if(operationDiscoveryChoices(s,id).length||campaignIntroductions(s,id).length)add('tree-register','Who can introduce specialist work?');
  if(['local','relay','security','authority'].includes(id))add('tree-relics','Any leads on a lost relic?');
  if(id==='local'&&!contact)add('tree-crew','Introduce me to a prospective crewmate.');
 }else if(id==='local'&&node==='reputation-rumor'){
  add('tree-reputation-rumor','Any newer accounts of my work?');add('tree-local','What is happening around this station?');
 }else if(id==='local'&&node==='relic-collectors'){
  for(const q of relicCollectorOverview(s).offers)add('tree-relic-sale-'+q.id,'Offer '+q.name+' · '+q.price+' cr',!q.available);if(!choices.length)add('tree-relics','Tell me about finding a relic.');
 }else if(id==='local'&&node.startsWith('relic-sale-')){
  const q=relicCollectorOverview(s).offers.find(q=>'relic-sale-'+q.id===node);if(q)add('tree-relic-sell','Sell relic · '+q.price+' cr',!q.available);add('tree-relic-collectors','Other relics.');
 }else if(id==='authority'&&node==='blockades'){
  for(const q of blockadeOffers(s))add('tree-blockade-'+q.destination,q.title);
  if(blockadeOverview(s).active.length)add('tree-blockade-status','What is the status of my liberation mission?');
  add('tree-service-open','Show me the authority’s mission register.');
 }else if(id==='authority'&&node.startsWith('blockade-')){
  const q=blockadeOffers(s).find(q=>'blockade-'+q.destination===node);if(q)add('tree-blockade-accept',q.resuming?'Resume this liberation mission':'Accept this liberation mission',!q.canAccept);add('tree-blockades','Other blockade reports.');
 }else if(node==='relics'){
  if(id==='local')add('tree-relic-collectors','Who here collects relics?');
  for(const q of relicHuntOverview(s,id).offers)add('tree-relic-'+q.method,q.title,!q.canAccept);
  for(const q of relicHuntOverview(s,id).jobs.filter(q=>q.status==='active'&&q.origin===s.location&&q.venue===id))add('tree-relic-report-'+q.relic,'Report on '+q.name,!q.canComplete);
 }else if(node.startsWith('relic-')){
  const q=relicHuntOffer(s,id,node.slice(6));if(q)add('tree-relic-accept','Accept this relic lead',!q.canAccept);add('tree-relics','Other relic leads.');
 }else if(id==='local'&&!contact&&node==='crew'){
  for(const c of crewOverview(s).candidates)add('tree-crew-'+['first','second','third','fourth','fifth','sixth'][c.index],'Meet '+c.name+' · '+crewTier(c).name+' '+c.role,crewOverview(s).members.length>=4);
   add('tree-crew-planning','What should I consider before hiring?');
 }else if(id==='local'&&!contact&&node.startsWith('crew-candidate-')){
  const c=crewOverview(s).candidates.find(c=>c.index===Number(node.slice(15)));if(c)add('tree-crew-hire','Hire '+c.name+' · '+c.fee+' cr',s.credits<c.fee||crewOverview(s).members.length>=4);add('tree-crew','Other candidates.');
 }else if(id==='local'&&node==='storage'){
  for(const q of warehouseLeaseOverview(s).offers)add('tree-storage-'+q.route,q.name+(q.canAccept?' · '+q.reward+' cr':''),!q.canAccept);
 }else if(id==='local'&&node.startsWith('storage-')){
  const q=warehouseLeaseOverview(s).offers.find(q=>'storage-'+q.route===node);
  if(q){add('tree-storage-accept','Lease the space · '+q.reward+' cr',!q.canAccept);if(q.illegal)add('tree-storage-conceal','Lease with matching warehouse packing',!q.canConceal);add('tree-storage','Show me the other arrangements.');}
 }else if(id==='authority'&&['government','gov-history','gov-veyr','gov-ilyri','gov-detail'].includes(node)){
  const branches={government:['origins','veyr','ilyri'],'gov-history':['founding','compact','local'],'gov-veyr':['arrival','veyr-terms','veyr-disputes'],'gov-ilyri':['arrival','ilyri-terms','ilyri-disputes'],'gov-detail':['concord','limits','government']};
  for(const topic of branches[node]){const key=topic==='government'?'tree-government':'tree-gov-'+topic;add(key,governmentTopics[key].question);}
 }else if(['security','local'].includes(id)&&(node==='bounties'||node.startsWith('bounties-'))){
  const reports=conversationBounties(s),pages=Math.max(1,Math.ceil(reports.length/2)),page=(node==='bounties'?0:Number(node.slice(9)))%pages;
  for(const r of reports.slice(page*2,page*2+2))add('tree-'+r.id,'What have you heard about '+r.title+'?');
  if(reports.length>2)add('tree-bounties-next','Any word on the other bounties?');else if(choices.length<3)add('tree-local','What is happening on the local routes?');
 }else if(['security','local'].includes(id)&&node.startsWith('bounty-')){
  const r=bountyConversation(s,node);
  if(r&&!r.accepted&&id==='security'){add('tree-bounty-accept','Yes, I’ll accept this bounty.');add('tree-bounty-later','Not right now.');add('tree-bounty-decline','No, I’ll pass.');}
  else {if(r?.accepted&&!r.recorded)add('tree-bounty-refresh','Bring me up to date on the target.');add('tree-bounties','Show me the other bounties.');}
 }else if(id==='market'&&node==='market-advice'){
  add('tree-market-bargains','What is a good buy today?');
  add('tree-merchant-supply','Are any customers waiting for supplies?');
  add('tree-market-production','What are local factories waiting for?');
  add('tree-market-selling','What about the cargo I already own?');
 }else if(id==='market'&&node==='market-selling'){
  add('tree-market-route','Do you know a buyer along my routes?');
  add('tree-market','Let’s look at the buying prices again.');
  add('tree-market-production','How are the production lines running?');
 }else if(node==='project-review'){
  if(personalProjectsHere(s,id,contact).length)add('tree-project-work','Review the stage assigned here.');
  const q=dialogueCommission(s,id,contact);if(q?.status==='active')add('tree-check-promise',q.project?.steps.every(x=>x.doneDay!==null)?'Return for payment.':'Review the signed agreement.');
  add('tree-work','Let’s discuss your usual work.');
 }else if(node==='project'){
  const task=personalProjectsHere(s,id,contact)[0];
  if(task?.step.options.length){for(const o of task.step.options)add('tree-project-'+o.id,o.name,!o.canWork);}else{if(task)add('tree-project-confirm',task.step.task,!task.step.canWork);else add('tree-project-review','Where next? Review this agreement.');add('tree-work','Tell me how this fits into your work.');}
 }else if(node==='patron'){
  if(patron.blocked){add('tree-repair-trust','What would it take to put this right?');if(session.patron?.apologized&&session.rapport>=0)add('tree-needs','Could I start with a small promise I can keep?');}
  else {
   if(patron.nextTier)add('tree-private-offer','Is there something you would entrust to me personally?');
   if(patron.canIntroduce)add('tree-introduce','Would you introduce me to someone you trust here?');
   if(patron.deal)add('tree-patron-deal','Tell me about the supplies you set aside.');
   if(choices.length<3)add('tree-needs','Could we start with an ordinary commission?');
  }
 }else if(node==='remember'){
  add(memory.topics['tree-interests']?'tree-recall-interest':'tree-interests','How is your interest going?');
  add(memory.topics['tree-support']?'tree-recall-goal':'tree-support','What comes next for your plan?');
  add(memory.trusted?'tree-confide':'tree-relationship','How are things between us?');
 }else if(node==='record'){
  if(memory.events.length)add('tree-next-record','There is another event I wanted to discuss.');
  add('tree-acknowledge','I wanted to acknowledge that.');
  add('tree-explain','What does that change?');
  add(id==='market'?'tree-market':'tree-reassure',id==='market'?'What’s worth trading today?':'I would rather be judged by what I do next.');
 }else if(node==='relationship'){
  if(session.rapport<0||patron.blocked&&!session.patron?.apologized)add('tree-apologize','I owe you an apology.');
  else add(patron.blocked?'tree-repair-trust':memory.trusted?'tree-confide':'tree-reassure','Can we talk about where we stand?');
  add('tree-story','There is more I wanted to ask about your earlier life.');
  add('tree-work','Let’s keep this professional.');
 }else if(node==='confidence'&&!memory.trusted){
  add('tree-relationship','Can we talk about where we stand?');
  add('tree-work','Let’s keep this professional.');
 }else if(node==='confidence'){
  add('tree-regret','What still troubles you about your work?');
  add('tree-boundary','What would make you lose trust?');
  add('tree-relationship','How are things between us?');
 }else if(node==='work'){
  add('tree-case','Could we talk through a difficult example?');
  add('tree-careful','What matters most in your work?');
  if(id==='local'&&warehouseFacility(s.location)&&s.warehouses?.[s.location])add('tree-storage','Any tenants for my spare warehouse space?');else add('tree-detail','Could we look over my fleet’s situation?');
  add('tree-craft','How did you learn to do this?');
 }else if(node==='craft'){
  add('tree-case','Could you show me why those checks matter?');
  add('tree-mistake','Was there a mistake you still remember?');
  add('tree-handover','What do you leave for the next shift?');
  add('tree-challenge-craft','Challenge these safeguards…');
 }else if(node==='practice'){
  add('tree-recovery','What did you do when it went wrong?');
  add('tree-mentor','Did someone help you learn that?');
  add('tree-detail','How would you handle my situation?');
 }else if(node==='detail'){
  add('tree-followup','Let’s go through the details carefully.');
  add('tree-work','What else should I know about your work?');
  add('tree-needs','Could I put that knowledge to use here?');
 }else if(node==='story'){
  add('tree-lore-station','How does your story fit into this station’s history?');
  add('tree-listen','What stayed with you from that time?');
  add('tree-interests','What do you make time for outside work?');
  if(memory.trusted)add('tree-confide','Would you tell me more?');else add('tree-challenge-story','Press for private details…');
 }else if(node==='values'){
  add('tree-support','What are you hoping to do next?');
  add('tree-roots','What was it like when you first arrived?');
  add('tree-needs','Is there a practical way I could help?');
 }else if(node==='memory'){
  add('tree-first-voyage','What do you remember of that first journey?');
  add('tree-home','Does this place feel like home now?');
  add('tree-lesson','Would you make the same choice again?');
 }else if(node==='interests'){
  add('tree-quiet','Do you prefer time to yourself?');
  add('tree-company','Is there someone you share that with?');
  add('tree-support','Is there something you want to do with it?');
 }else if(node==='ambition'){
  add('tree-first-step','What would be the first step?');
  add('tree-goal-doubt','What makes that difficult here?');
  add('tree-needs','Could a visiting captain lend a hand?');
 }else if(node==='local'){
  add('tree-lore','Could you tell me more about this place?');
  add('tree-logistics','What keeps this station supplied?');
  add('tree-safety','What should my crew watch for?');
  add('tree-risk','What have crews been hearing on the routes?');
 }else if(node==='logistics'){
  add('tree-shortage','What happens when a shipment does not arrive?');
  add('tree-season','Does the rhythm of trade change much?');
  add('tree-needs','Is there work I could help with?');
 }else if(node==='safety'){
  add('tree-readiness','What does a tired crew tend to miss?');
  add('tree-contingency','What would you keep in reserve?');
  add('tree-risk','Have there been reliable reports of trouble?');
 }else if(node==='needs'){
  add('tree-offer','Tell me what you need before I promise.');
  if(session.rapport>=0&&(operationDiscoveryChoices(s,id).length||campaignIntroductions(s,id).length))add('tree-register','What other work is being discussed here?');
  else add('tree-work','Let me understand your work first.');
  add('tree-challenge-needs','Challenge the refusal…');
 }else if(node.startsWith('challenge-')){
  add(node==='challenge-craft'?'tree-case':node==='challenge-story'?'tree-story':'tree-services',node==='challenge-craft'?'Let’s talk through an example before I judge.':node==='challenge-story'?'Tell me only what you’re comfortable sharing.':'Then let’s look at what is actually available.');
  add('tree-back','Let’s change the subject.');
  add(node==='challenge-craft'?'tree-pressure':node==='challenge-story'?'tree-pry':'tree-threat',node==='challenge-craft'?'Demand an unsafe shortcut.':node==='challenge-story'?'Demand the private details.':'Threaten this contact.');
 }else if(node==='supply-offer'){
  const deal=patron.deal;
  add('tree-patron-buy','Yes, I’ll buy that lot.',!deal?.canBuy);
  add('tree-offer-later','Not right now.');
  add('tree-offer-decline','No, I’ll pass.');
 }else if(node==='terms'&&dialogueCommission(s,id,contact)?.status==='offered'){
  const offer=commissionView(s,dialogueCommission(s,id,contact));
  add('tree-accept','Yes, I’ll take the job.',!offer.canAccept);
  add('tree-offer-later','Not right now.');
  add('tree-offer-decline','No, I’ll pass.');
  add('tree-clarify','Could you explain the details?');
 }else if(node==='terms'){
  const q=dialogueCommission(s,id,contact);
  if(q){const offer=commissionView(s,q);if(q.status==='offered')add('tree-accept','I accept those terms.',!offer.canAccept);else if(q.status==='active'){if(q.project&&!offer.canComplete&&personalProjectsHere(s,id,contact).length)add('tree-project-work','Let’s review the next part of the project.');else add('tree-complete','I’m ready to report back.',!offer.canComplete);}else add('tree-receipt','How did that commission end?');}
  add('tree-clarify','Let me be sure I understand the arrangement.');
  if(q?.status!=='active')add('tree-detail','Could we review my fleet’s situation?');
 }else if(node==='agreement'){
  add('tree-agreement-context','Can I ask why you need this and who is waiting?');
  add('tree-custody','Whose supplies would I be carrying?');
  add('tree-timing','What if I cannot finish in time?');
  add('tree-offer','Let’s look at the terms again.');
 }else if(node==='risk'){
  if(id==='local')add('tree-trade-rumour','Has anyone heard of a worthwhile cargo deal?');else add('tree-verify','Which reports can you actually verify?');
  const lead=id==='security'?raidOffers(s).find(r=>r.availableHere&&!r.completed&&!r.recorded):null;
  if(id==='security')add('tree-bounties','Which bounties can I take on?');
  else add('tree-sources','How do you decide which accounts to trust?');
  add(id==='security'?'tree-sources':'tree-local',id==='security'?'How do you judge the target intelligence?':'What does this mean for ordinary traffic?');
 }else if(node==='trade-lead'){
  add('tree-season','Does the supply schedule support that story?');
  add('tree-logistics','What keeps this station supplied?');
  add('tree-risk','What else have crews been hearing?');
 }else if(node==='sources'){
  add('tree-evidence','What would count as a useful observation?');
  add('tree-doubt','What if two crews tell different stories?');
  add('tree-verify','Let’s look at what you have confirmed.');
 }else if(node==='guarded'){
  add('tree-apologize','I pushed too far. Let’s start again.');
 }else if(node.startsWith('register-')){
  const entries=session.rapport>=0?[...operationDiscoveryChoices(s,id),...campaignIntroductions(s,id)]:[],pages=Math.max(1,Math.ceil(entries.length/2)),page=Number(node.slice(9))%pages;
  for(const o of entries.slice(page*2,page*2+2))add(o.id,o.name);
  if(pages>1)add('tree-register-next','What else is being discussed?');
  if(!entries.length)add('tree-work','Tell me about the ordinary work instead.');
 }
 if(node!=='root'&&!choices.some(o=>o.id==='tree-back')&&!(id==='security'&&node.startsWith('bounty-')&&bountyConversation(s,node)&&!bountyConversation(s,node).accepted)&&!(node==='terms'&&dialogueCommission(s,id,contact)?.status==='offered'))add('tree-back','Let’s talk about something else.');
 if(node==='root'){for(const option of choices){if(option.id==='tree-offer')option.name='Is there a job I could help with?';if(option.id==='tree-check-promise')option.name=dialogueCommission(s,id,contact)?.project?.steps.every(x=>x.doneDay!==null)?'Return for payment.':'Let’s review my current job.';if(option.id==='tree-project-work')option.name='Let’s work on the next step.';}}
 if(node==='terms'&&dialogueCommission(s,id,contact)?.status==='active'){for(const option of choices){if(option.id==='tree-complete')option.name=dialogueCommission(s,id,contact).kind==='supply'?'Hand over the supplies.':'Here is my report.';if(option.id==='tree-clarify')option.name='Review the job.';if(option.id==='tree-back')option.name='Something else.';}}
 for(const choice of choices){choice.name=captainReplyLabel(choice.id,choice.name);const previous=session.memory?.reports?.[choice.id];if(previous&&previous.signature===dialogueReportSignature(s,id,host,choice.id)){choice.unchanged=true;choice.lastDiscussedDay=previous.day;}}
 return choices;
}
// Additional conversations use the established person, job and station without new rewards or RNG draws.
const dialogueWorkStories={
 market:{lesson:'A manifest can balance perfectly while the wrong crate sits on the pallet.',mistake:'I once trusted a supplier’s label instead of matching the seal to the receiving list.',handover:'The next broker gets the seal numbers, outstanding collections and a note about anything I could not verify.'},
 contracts:{lesson:'A dispatch promise needs a destination, a real hold and enough time for the return message.',mistake:'I once copied an arrival date without checking which calendar the sender had used.',handover:'I leave the delivery clock, the client’s seal record and the last confirmed position together.'},
 shipyard:{lesson:'A clean casing tells you very little about a bearing beneath it.',mistake:'An assembly passed the bench test, but I had not checked it under the load the crew actually used.',handover:'The next engineer gets the measured clearances and the unresolved fault, rather than a reassuring guess.'},
 fleet:{lesson:'A vessel on a register is a crew, a maintenance history and a set of physical limits.',mistake:'A transfer looked simple until we found that the receiving berth had the wrong service connections.',handover:'Every hull’s location and open fitting work goes into the handover. Nobody should discover a missing part at departure.'},
 security:{lesson:'A convincing account still needs a time, a position and something another crew can check.',mistake:'I treated two retellings of the same sighting as independent reports.',handover:'I separate confirmed observations from assumptions, so the next watch knows where certainty ends.'},
 relay:{lesson:'A short message is useful only if the receiving crew understands the same thing.',mistake:'I relayed a correction without its original timestamp. Two perfectly reasonable crews followed different plans.',handover:'The queue includes acknowledgements still missing and the route each correction actually concerns.'},
 clinic:{lesson:'Care starts with listening to what the patient is trying to tell you.',mistake:'I concentrated on a neat set of readings and nearly missed how exhausted the patient was.',handover:'The next shift gets the patient’s own concerns alongside observations, supplies and care already given.'},
 authority:{lesson:'A licence applies to a particular destination and a particular set of qualifications.',mistake:'A clearance looked complete until someone noticed it described a different hull.',handover:'I leave the unresolved qualification beside the application, so the captain does not have to tell the whole story twice.'},
 bank:{lesson:'A credit balance is only useful if the captain understands the obligation attached to it.',mistake:'I explained a yearly rate without asking whether the crew was planning a journey lasting years.',handover:'The next manager gets the agreed loan terms and unresolved questions, separately from a new credit assessment.'},
 local:{lesson:'A commons has to make room for the quiet table as well as the loud one.',mistake:'I mistook someone’s silence for contentment when they were waiting for news of a late ship.',handover:'I leave a note about expected crews, meals held aside and anyone waiting for a message.'},
 warehouse:{lesson:'A stored crate needs a recorded owner and a location someone else can find.',mistake:'Two similar containers arrived together, and I nearly recorded the seal against the wrong bay.',handover:'The next custodian gets the bay ledger, collection permissions and every seal that needs another look.'}
};
function expandedDialogueReply(s,id,host,choice,session){
 const p=port(s.location),c=host.character,lore=placeStories[p.id],job=dialogueWorkStories[id]||dialogueWorkStories.local,q=dialogueCommission(s,id,host.contactID||'');
 const replies={
  'tree-craft':['craft',`${c.history}\n\n${job.lesson} You learn the routine first. Learning when to stop and ask someone else takes longer.`],
  'tree-mistake':['practice',`${job.mistake} We caught it, but someone had to wait while I put it right.\n\n${c.value} I remember the person at the other end more clearly than the paperwork.`],
  'tree-handover':['practice',`${job.handover}\n\n${c.habitSpoken} It gives the next person a place to start without pretending I finished everything.`],
  'tree-recovery':['practice',`I stopped the handover, told the people affected and checked the last point we could still trust. Quietly correcting the record would have left the next crew working from the wrong assumptions.\n\n${job.lesson}`],
  'tree-mentor':['craft',`There was someone willing to ask why I thought I was finished. At the time, I found that irritating. Now I hear the same question in my own voice.\n\n${c.value}`],
  'tree-roots':['memory',`${c.history}\n\nOn an unfamiliar station, the first things you learn are the sounds: which door is yours, when the shift changes, and whether a pause in the machinery means anything.`],
  'tree-first-voyage':['memory',`I remember waiting for a message saying someone had arrived safely. The journey had ended, but the worry had not caught up with that fact.\n\n${lore[2]} Small rituals make more sense after a trip like that.`],
  'tree-home':['memory',`Home became the place where someone noticed I was late for a meal. ${p.name} is still demanding, but it stopped feeling temporary.\n\n${lore[2]}`],
  'tree-lesson':['values',`I would ask more questions before leaving, and make fewer promises about when I would be back. I think I would still come.\n\n${c.value} What about you: is the next port a destination, or just another departure?`],
  'tree-quiet':['interests',`Sometimes. I spend enough of a shift answering questions that a little time ${c.interest} feels like having my own thoughts back.\n\n${c.mood} Company is welcome when it does not turn every quiet moment into another obligation.`],
  'tree-company':['interests',`A few people here share the interest. Others simply remember to ask how it is going. Both matter.\n\n${c.habitSpoken} That is usually how a conversation starts when I am away from this desk.`],
  'tree-first-step':['ambition',`First I need a little uninterrupted time to ${c.goal}. I can plan something ambitious on a quiet shift; keeping the small appointment is harder.\n\n${c.value}`],
  'tree-goal-doubt':['ambition',`The next urgent shift always has a stronger claim on my time. ${lore[1]}\n\nI do not resent the work. I just want the rest of my life to receive the same care I give this desk.`],
  'tree-shortage':['logistics',`${lore[1]} When something is late, people start finding out which jobs can wait and which cannot. A missing ordinary component can hold up something that sounds far more important.\n\nAsk the receiving crew before assuming a substitute will do.`],
  'tree-season':['logistics',`Supply schedules and demand change through the supply cycle. Nearby ports share some pressures; their stores and trading margins can still differ.\n\n${lore[1]} I would check the actual exchange board again before committing to a return cargo.`],
  'tree-readiness':['safety',`Usually something familiar: a seal checked twice in their head and never checked by hand, or a message read as the one they expected.\n\nYour travelling crew is at **${crewReadiness(s)}/100** readiness. The clinic can discuss recovery; a sound hull does not tell you how tired its crew is.`],
  'tree-contingency':['safety',`Enough propellant for the plan you are actually flying, time for a delay, and a repair option you have checked rather than assumed.\n\nHere the approach concern is **${p.hazard.toLowerCase()}**. Talk to the coordinator about the route and the dry dock about the hull before you commit.`],
  'tree-sources':['sources',`I start with when and where, then ask which details the speaker actually saw. A report repeated in several canteens can still come from one frightened crew.\n\n${c.value} A confident voice is not another observation.`],
  'tree-evidence':['sources',`Keep the time, location and what your instruments or crew observed. Separate that from what you think it meant.\n\nThe coordinator can review voyage observations; the patrol office handles raider sightings. An alarming account alone does not identify a particular ship.`],
  'tree-doubt':['sources',`Keep both accounts until you can explain the difference. They may have seen the same event at different times, or mistaken ordinary traffic for something else.\n\nI would rather leave a gap in a report than fill it with a story that sounds tidy.`],
  'tree-clarify':['agreement',q?`${q.description}\n\nWe agree the task before you accept it. The service panel holds the fee and deadline so neither of us has to rely on memory.`:`There is no agreement yet. We can look at a suitable commission, or talk through your fleet’s situation first.`],
  'tree-custody':['agreement',q?.project?'Any goods and engineering spares listed for this project must be yours. Work is signed by the named collaborators; the issuing character pays after the agreed handovers. Sealed freight belonging to another client cannot be used as an input.':q?.kind==='supply'?`This personal commission uses supplies you own. Sealed freight belonging to another client cannot be handed over to me.\n\nThe freight office’s delivery shipments are a separate arrangement; those goods remain the client’s until delivered.`:`Keep your own stores separate from anything carried for a client. This commission concerns ${q?.kind==='patrol'?'a new patrol result':'new traffic observations'}, rather than handing over someone else’s shipment.\n\nThe agreed task is written in the service panel.`],
  'tree-timing':['agreement',q?`The allowance is **${q.duration} ship-days** from acceptance. If it is already active, the actual deadline is in Tasks.\n\nIf you miss it, there is no payment. The broken promise affects your standing and experience; this personal commission carries no cash fine.`:`We have not set a deadline. Let’s first find a commission that suits your current access and fleet.`]
 };
 if(choice==='tree-register'||choice==='tree-register-next'){
  const entries=session.rapport>=0?[...operationDiscoveryChoices(s,id),...campaignIntroductions(s,id)]:[],pages=Math.max(1,Math.ceil(entries.length/2));
  const page=choice==='tree-register'?0:(Number(session.node.slice(9))+1)%pages;
  return {node:'register-'+page,text:entries.length?`There are a few conversations I can put you in touch with. Ask about the work that interests you, and we can go through what it would involve. ${job.lesson}`:`Nothing new is being discussed at this desk just now. We can still talk about the ordinary work.`};
 }
 const reply=replies[choice];return reply?{node:reply[0],text:reply[1]}:null;
}
function conversationServiceSummary(s,id){const descriptions={clinic:'The clinic provides crew recovery, treatment, reserve donations and supervised research. Review the quoted cost and service days; deadlines, interest and berth fees continue during care.',shipyard:'The dry dock repairs and refuels the selected active or locally berthed ships, and supplies compatible ammunition and engineering spares. Check each hull’s service quote; fitting upgrades is handled by the fleet registry.',market:'Use Buy or Sell in the exchange panel. Current bids and asks respond to available stock, including trades today; check the total for your selected quantity. Only in-stock purchases and your own saleable goods are listed. A conversation never submits a trade.',contracts:'The freight board accepts physical client consignments and handles delivery. Each offer states its deadline, payment and breach liability. Accept or deliver explicitly on the board.',bank:'The bank panel shows deposits, agreed loan rates, total allowance and current available credit. Borrowing, repayment and withdrawal require an explicit amount or Max action; conversation alone never moves money.',local:'The commons can introduce personal commissions, relic leads, visiting dealers, named crew and warehouse tenants. Ask the station coordinator at Communications to arrange escort contracts and passenger transportation. Each agreement is accepted separately. A rumour or introduction is not a booking.',security:'Accept or claim a named bounty in the patrol panel. Rumours update leads without starting a battle. The station coordinator at Communications arranges merchant escorts; patrol rescue and investigation work remains in this register.',authority:'The authority handles licences, liaison missions and public-service relic rewards. Review the actual qualifications, destination, payment and duties before accepting. It does not lend money or hire crew.',warehouse:'Store and Collect transfer your own eligible inventory. Tenant leases are negotiated at the canteen; client lots cannot be collected or sold as your own.',fleet:'Purchase, upgrade and sell owned hulls in their separate registry sections. Owned-ship escort assignment is in Fleet. Client protection work is a separate accepted escort mission.',relay:'The station coordinator arranges ship and fleet escorts, passenger charters, medical transfers and evacuation flotillas. Book and hand over at Communications; clinics provide treatment and authorities issue certificates. Survey, signals and departure services are also here. Review assigned hulls, destinations, deadlines and costs before accepting.'};return descriptions[id]||'This service panel lists the available station work and its quoted costs. Accept each service or commission explicitly; an introduction makes no purchase or booking.';}
function dialogueTree(s,id,contact=''){
 const v=dialogueSession(s,id,contact),q=dialogueCommission(s,id,contact),labels={'patrol-blockades':'Local blockade watch','bank-outlook':'Rates & financial conditions',root:'Opening conversation',work:'The work',detail:'Practical details',story:'Their story',values:'What matters to them',local:'Life at this port',needs:'A possible introduction',terms:'A personal commission',risk:'Reports and rumours',guarded:'A strained conversation'};
 return {stage:labels[v.node]||(v.node.startsWith('patrol-blockade-')?'Blockade briefing':v.node.startsWith('register-')?'Work introductions':'Conversation'),outcome:v.outcome,rapport:v.rapport,insight:v.insight?{title:'Dated route briefing',text:`Day ${s.day}: ${port(s.location).hazard}. ${placeStories[s.location][1]} ${id==='security'?'An accepted bounty includes patrol intelligence about the target’s possible location. Encounters remain part of ordinary travel.':'Check the station coordinator’s route briefing and current flight plan before committing fuel. Unverified dockside talk is not a guaranteed forecast.'}`} :null,commission:q?commissionView(s,q):null};
}
function makeDialogueCommission(s,id,contact){
 const ledger=ensureDialogue(s),context=dialogueKey(s,id,contact);if(ledger.commissions.some(q=>q.context===context))return;
 const survey=['relay','authority','bank'].includes(id),patrol=id==='security',kind=patrol?'patrol':survey?'survey':'supply',skill=dialogueSkill(id);
 let target=null,goodID=null,quantity=0,reward=serviceReward(serviceRouteCost(s,s.location,{shipID:'osprey',workDays:3}),{work:3}),duration=120;
 if(survey){const choices=world.ports.filter(p=>p.id!==s.location&&destinationAccess(s,p.id).open).map(p=>({id:p.id,days:transfer(s.location,p.id,s.day).coastDays+transfer(s.location,p.id,s.day).waitDays})).sort((a,b)=>a.days-b.days||a.id.localeCompare(b.id));if(!choices.length)return;target=choices[0].id;const outward=transfer(s.location,target,s.day),returning=transfer(target,s.location,s.day+outward.coastDays+outward.waitDays);duration=Math.min(2000,outward.coastDays+outward.waitDays+returning.coastDays+returning.waitDays+120);reward=serviceReward(serviceRouteCost(s,target,{returnTrip:true,workDays:1}),{work:1});}
 else if(!patrol){goodID=({clinic:'medicine',shipyard:'machinery',fleet:'electronics',market:'food',contracts:'metals',local:'water'})[id]||'food';if(!marketAccess(s,goodID).discovered)goodID=({shipyard:'carbon',fleet:'polymers',contracts:'food'})[id]||'food';quantity=2+Number(hash(context)%3n);reward=Math.ceil(tradeTotal(s,goodID,quantity,true)*1.12)+220;}
 const title=kind==='supply'?`Reserve supplies for ${port(s.location).name}`:kind==='survey'?`Traffic observations: ${stationLabel(target)}`:'Patrol support commission';
 const description=kind==='supply'?`Bring ${quantity} units of your own ${good(goodID).name.toLowerCase()} back to this host. Purchase or carry them yourself; sealed client freight is never accepted.`:kind==='survey'?`After accepting, visit ${stationLabel(target)}, then return to this host with new traffic observations. An earlier visit does not count. Your access licence is already valid.`:'After accepting, defeat a raider group encountered during normal travel, then return to this officer to collect the agreed payment.';
 ledger.commissions.push({id:uuid(),context,port:s.location,venue:id,contact,kind,title,description,good:goodID,quantity,target,reward,skill,duration,status:'offered',acceptedDay:null,deadline:null,visitedTarget:false,baselineVictories:0,completedDay:null});
}
function commissionView(s,q){
 const here=s.location===q.port,active=(s.dialogueProgress?.commissions||[]).filter(x=>x.status==='active').length,remaining=q.deadline==null?null:Math.max(0,q.deadline-s.day),progress=q.project?`${q.project.steps.filter(x=>x.doneDay!==null).length} / ${q.project.steps.length} signed project steps${q.project.steps.every(x=>x.doneDay!==null)?'; return to the issuing character':': '+q.project.steps.find(x=>x.doneDay===null).task+' at '+port(q.project.steps.find(x=>x.doneDay===null).port).name}`:q.kind==='supply'?`${tradableQuantity(s,q.good)} / ${q.quantity} eligible units aboard the travelling fleet`:q.kind==='survey'?(q.visitedTarget?'Destination visit recorded; return to the issuing host':'New destination visit still needed'):`${Math.max(0,s.profile.stats.victories-q.baselineVictories)} / 1 new raider victories`;
 const fulfilled=q.project?q.project.steps.every(x=>x.doneDay!==null):q.kind==='supply'?tradableQuantity(s,q.good)>=q.quantity:q.kind==='survey'?q.visitedTarget:s.profile.stats.victories>q.baselineVictories;
 const canAccept=q.status==='offered'&&here&&s.profile.created&&!s.incident&&!s.fleetLoss&&active<3&&s.day+q.duration<365250&&(!(q.tier>1)||privateCommissionEligible(s,q));
 const canComplete=q.status==='active'&&here&&!s.incident&&!s.fleetLoss&&s.day<=q.deadline&&fulfilled&&s.credits+q.reward<=999999999;
 let reason=q.status==='offered'?q.tier>1&&!privateCommissionEligible(s,q)?'This private offer is suspended until personal trust and station standing are restored.':!s.profile.created?'Sign your captain charter first.':!here?'Return to the issuing host.':active>=3?'Complete a commission first; at most three may be active.':s.day+q.duration>=365250?'The deadline exceeds the simulation calendar.':'':q.status==='active'?!here?'Return to '+port(q.port).name+' to report.':!fulfilled?progress:s.credits+q.reward>999999999?'Deposit cash before collecting.':'':q.status==='completed'?'Commission completed; reward already paid.':q.failureReason==='falsified'?'False certification ended this project; no payment and personal recommendations withdrawn.':'Deadline missed; no reward. Reputation -2 and up to 3 experience lost.';
 return {...q,steps:q.project?q.project.steps.map((_,i)=>privateStepView(s,q,i)):[],station:port(q.port).name,host:stationContacts(q.port,q.venue,s).find(v=>(v.contactID||'')===q.contact)?.person||'Issuing host',skillName:skillNames[q.skill],progress,remaining,canAccept,canComplete,reason,terms:`${q.reward} cr · +10 ${skillNames[q.skill]} XP · reputation progress · local trust progress. ${q.duration} days from acceptance. Missing the deadline: -2 reputation, up to -3 ${skillNames[q.skill]} XP; no cash fine.`};
}
function commissionJournal(s){return (s.dialogueProgress?.commissions||[]).filter(q=>q.status==='active').map(q=>commissionView(s,q));}
function expireDialogueCommissions(s){for(const q of s.dialogueProgress?.commissions||[]){if(q.status!=='active'||s.day<=q.deadline)continue;q.status='failed';q.completedDay=s.day;breakPersonalTrust(s,s.dialogueProgress.sessions[q.context],'A personal commission missed its deadline.');const before=s.profile.xp[q.skill];s.profile.xp[q.skill]=Math.max(0,before-3);changeStationReputation(s,q.port,-2,'Missed a personal commission deadline.');changeReputation(s,-2,'Missed a personal commission for '+port(q.port).name+'.');record(s,`${q.title}: deadline missed; no reward. ${skillNames[q.skill]} XP ${s.profile.xp[q.skill]-before}. Return to ${port(q.port).name} to review the record.`);}}
function applyCommission(s,id,contact,operation){
 const q=dialogueCommission(s,id,contact);check(q,'This host has not offered you a commission.');const view=commissionView(s,q);
 if(operation==='accept'){
  check(view.canAccept,view.reason||'This commission cannot be accepted now.');q.status='active';q.acceptedDay=s.day;q.deadline=s.day+q.duration;q.baselineVictories=s.profile.stats.victories;if(q.project?.steps[0].kind==='patrol')q.project.steps[0].baselineVictories=s.profile.stats.victories;
  record(s,`Accepted ${q.title} from ${view.host}, ${view.station}. Due day ${q.deadline}. ${view.terms}`);return `We have an agreement. Report back to me here by **day ${q.deadline}**. ${q.description}`;
 }
 check(view.canComplete,view.reason||'This commission is not ready for handover.');if(q.kind==='supply')removeFleetCargo(s,q.good,q.quantity,true);q.status='completed';q.completedDay=s.day;const session=dialogueSession(s,id,contact);session.rapport=Math.min(6,session.rapport+1);s.credits+=q.reward;earn(s,q.skill,10);changeReputation(s,2,'Completed a personal commission for '+port(q.port).name+'.');changeStationReputation(s,q.port,2,'Completed a personal commission.');decision(s,'Kept a personal promise: '+q.title+'.','empathy');record(s,`${q.title}: paid ${q.reward} cr, +10 ${skillNames[q.skill]} XP, reputation progress and local trust progress.`);return `**${q.title}** is complete; **${q.reward} cr** transferred.\n\n`+(q.project?privateProjectCompletion(s,q,stationContacts(s.location,id,s).find(h=>(h.contactID||'')===contact)):'Thank you for coming back, Captain.');
}
function treeTalk(s,id,choice,contact='',opening=false){
 check(s.profile.created,'Sign your captain charter before making conversation choices.');const availableReplies=dialogueChoices(s,id,contact,opening),option=availableReplies.find(o=>o.id===choice)||(['security','local'].includes(id)&&choice.startsWith('tree-bounty-')&&conversationBounties(s).some(r=>'tree-'+r.id===choice)?{id:choice,name:'Tell me about '+conversationBounties(s).find(r=>'tree-'+r.id===choice).title+'.',disabled:false}:null)||(choice==='tree-needs'&&availableReplies.some(o=>o.id==='tree-offer')?{id:choice,name:'Is there anything I could help with?',disabled:false}:choice==='tree-local'&&(id==='market'&&availableReplies.some(o=>o.id==='tree-market')||['security','local'].includes(id)&&availableReplies.some(o=>o.id==='tree-bounties'))?{id:choice,name:'What should I know about this station?',disabled:false}:null);check(option&&!option.disabled,'That reply is not available in this branch.');
 const host=stationContacts(s.location,id,s).find(v=>(v.contactID||'')===contact),p=port(s.location),ledger=ensureDialogue(s),key=dialogueKey(s,id,contact);if(!ledger.sessions[key]){check(Object.keys(ledger.sessions).length<1024,'This voyage has reached its conversation limit.');ledger.sessions[key]={node:'root',rapport:0,resolved:[],outcome:'',insight:false};}const session=ledger.sessions[key];if(!session.patron)session.patron=personalTrustState(s,id,contact);let text='',node=opening?'root':session.node;session.outcome='';
 const careerReply=careerConversations.reply(s,id,host,choice);
 if(careerReply){node=careerReply.node;text=careerReply.text;}
 else if(choice==='tree-freight-dispatch'){node='freight-dispatch';text=freightDispatchBriefing(s,id);}
 else if(id==='local'&&choice==='tree-reputation-rumor'){node='reputation-rumor';text=discussReputationRumor(s);}
 else if(id==='security'&&choice==='tree-patrol-blockades'){node='patrol-blockades';text=patrolReports.blockadeBriefing(api,s);}
 else if(id==='security'&&choice.startsWith('tree-patrol-blockade-')){const pid=choice.slice('tree-patrol-blockade-'.length);node='patrol-blockade-'+pid;text=patrolReports.blockadeBriefing(api,s,pid);}
 else if(id==='authority'&&choice==='tree-blockades'){node='blockades';text='Civil authorities commission prepared captains to break armed station blockades. Travelling to a blockaded station forces a battle before docking, even without a commission. Accepting a named commission secures the authority’s reward. Victory frees the station and opens temporary exchange recovery premiums; claim the agreed payment on return to this issuing desk. Retreat is not liberation. These finite commissions have no expiry.';}
 else if(id==='authority'&&choice==='tree-blockade-status'){node='blockades';const j=blockadeOverview(s).active[0];text=j?j.title+': '+j.progress:'You have no active liberation commission.';}
 else if(id==='authority'&&choice==='tree-blockade-accept'){const q=blockadeOffers(s).find(q=>'blockade-'+q.destination===node);blockadeAction(s,'blockade-accept',{id:q?.id,venue:'authority'});node='blockades';text='The liberation commission is recorded. Travel to '+port(q.destination).name+' where the blockade will intercept your arrival. Your task list records the destination and agreed payment.';}
 else if(id==='authority'&&choice.startsWith('tree-blockade-')){const q=blockadeOffers(s).find(q=>'tree-blockade-'+q.destination===choice);check(q,'This blockade report is no longer available.');node='blockade-'+q.destination;text=q.description+'\n\nHostile formation: '+(q.tier===1?2:3)+' ships, threat '+q.tier+' / 3. Reference patrol: '+q.referenceShip+'. Payment: '+q.reward+' cr on return after confirmed liberation. No expiry. '+(q.reason||'Review your fleet and fuel before accepting.');}
 else if(choice==='tree-services'||choice==='tree-service-open'){node='services';text=conversationServiceSummary(s,id);}
 else if(choice==='tree-relics'){node='relics';const o=relicHuntOverview(s,id);text=o.offers.length?'There are instruments with an unresolved history. We can discuss a salvage lead, recovered raider property, or a public-service award where this desk handles it. Each lead names the work and reward before you agree. None has an expiry date.':o.jobs.some(q=>q.status==='active')?'Your accepted relic leads remain open in Tasks. Report to the issuing contact after completing the work; battle recovery is recorded automatically.':'I have no unclaimed instruments to introduce. A travelling antiquarian may still buy or sell relics; ask at the quiet table when one is present.';}
 else if(id==='local'&&choice==='tree-relic-collectors'){node='relic-collectors';const c=relicCollectorOverview(s),traveller=underworldOverview(s).contact;text=c.host?(c.host.contact===(host.contactID||'')?'I keep a private collection. I pay ':c.host.name+' keeps a private collection. They pay ')+'45% of the catalogue value for one of each named relic per 30-day trading period. The next period begins on day '+((Math.floor(s.day/30)+1)*30)+'. Review the exact offer before selling; an equipped relic immediately loses its bonus. '+(c.offers.length?'Which relic would you like to offer?':'You have no named relics to sell yet.'):traveller?.host.role==='Travelling antiquarian'?'An antiquarian named '+traveller.host.person+' is at the quiet table now. Join them and ask about trade; they buy owned relics.':'I know of no collector buying here today. Scholars at Meridian, Shackleton, Kepler, Occator, Callisto, Kraken and Triton often collect. Travelling antiquarians also come through canteens; their presence is intermittent.';}
 else if(id==='local'&&choice.startsWith('tree-relic-sale-')){node=choice.slice(5);const c=relicCollectorOverview(s),q=c.offers.find(q=>'tree-relic-sale-'+q.id===choice);text=c.host.name+' offers **'+q.price+' cr** for '+q.name+'. Selling transfers ownership and ends any equipped bonus immediately. Shall I record the sale?';}
 else if(id==='local'&&choice==='tree-relic-sell'){const relic=node.slice(11);sellCollectorRelic(s,relic);node='relic-collectors';text='The collector has paid the agreed price and taken custody. Your remaining relics and active effects are shown in Captain’s record.';}
 else if(/^tree-relic-(discovery|battle|authority)$/.test(choice)){node=choice.slice(5);const q=relicHuntOffer(s,id,choice.slice(11));text=q.description+'\n\n'+q.terms+'\n\nThe reward equips automatically if a relic slot is free; your current loadout is kept. One documented free grant of each named relic per voyage.';}
 else if(choice==='tree-relic-accept'){const q=acceptRelicHunt(s,id,node.slice(6));node='relics';text='Agreed. '+q.description+' '+q.terms+'. Your accepted lead is now in Tasks.';}
 else if(choice.startsWith('tree-relic-report-')){const relic=choice.slice(18);relicHuntAction(s,'relic-hunt-complete',{id:'relic-hunt-'+relic,venue:id});node='relics';text='The work and custody record are complete. The relic is now in your collection in Captain’s record.';}
 else if(id==='local'&&!contact&&choice==='tree-crew'){node='crew';const recruits=discoverCrew(s).candidates;text=recruits.length?'There '+(recruits.length===1?'is someone':'are travellers')+' passing through who may consider joining you. These are brief visits; I cannot promise they will still be here later. More experienced recruits offer stronger benefits at higher signing fees and daily wages. Review a person before making an offer.':'Nobody here is seeking a travelling berth today. We can discuss the skills your crew needs and the wages you would be taking on.';}
 else if(id==='local'&&!contact&&/^tree-crew-(first|second|third|fourth|fifth|sixth)$/.test(choice)){node='crew-candidate-'+(['first','second','third','fourth','fifth','sixth'].indexOf(choice.slice(10)));const c=crewOverview(s).candidates.find(c=>c.index===(['first','second','third','fourth','fifth','sixth'].indexOf(choice.slice(10))));text=c.name+' is a '+crewTier(c).name.toLowerCase()+' '+c.role.toLowerCase()+'. '+crewBenefit(c).detail+' Visiting through ship-day '+c.visitUntil+'. Signing fee: **'+c.fee+' cr**. Wages: **'+c.daily+' cr per ship-day**, travelling or stopped, including off-duty days. Travel wages are included in the flight estimate. Other unpaid wages use the original charter account. Release at a station stops future wages with no refund.';}
 else if(id==='local'&&!contact&&choice==='tree-crew-planning'){node='crew';text='Start with the work your fleet actually does: navigation for routes, engineering for upkeep, or specialist support for trading and crew care. Compare each person’s benefit with their signing fee and daily wage. Wages continue while stopped and off duty; Captain’s record shows the people already aboard.';}
 else if(id==='local'&&!contact&&choice==='tree-crew-hire'){const c=crewOverview(s).candidates.find(c=>c.index===Number(node.slice(15)));const member=hireCrew(s,c?.id);node='crew';text=member.name+' signs on. Review duties and wages in Captain’s record → Named crew.';}
 else if(id==='local'&&choice==='tree-storage'){node='storage';const v=warehouseLeaseOverview(s),available=v.offers.filter(q=>q.canAccept);text=available.length?`There are crews here who need a temporary store. You have **${(v.freeKg/1000).toFixed(2)} t** unleased at **${port(s.location).name}**. One provisioner needs declared goods kept dry; another handles sealed industrial supplies. A discreet factor pays more for a restricted lot and asks fewer comfortable questions. Which arrangement shall I introduce?`:`No tenant can sign here just now. ${v.offers.map(q=>q.name+': '+(q.reason||'Available')).join(' ')} Existing tenant space remains reserved until its collection date.`;}
 else if(id==='local'&&/^tree-storage-(ordinary|bonded|discreet)$/.test(choice)){node=choice.slice(5);const q=warehouseLeaseOverview(s).offers.find(q=>'tree-storage-'+q.route===choice);text=warehouseLeaseTerms(s,q);}
 else if(id==='local'&&['tree-storage-accept','tree-storage-conceal'].includes(choice)){const route=node.slice(8),j=acceptWarehouseLease(s,route,choice==='tree-storage-conceal');node='storage';text=`${j.tenant} signs for **${j.units*.25} t** until **day ${j.endsDay}**. **${j.reward} cr** is due to this station’s bank deposit after the full term. The tenant lot is now reserved in your warehouse. ${j.cover?'Matching warehouse packing is configured; keep replacement packages here for later inspections.':''}`;}
 else if(['security','local'].includes(id)&&conversationBounties(s).some(r=>'tree-'+r.id===choice)){const r=conversationBounties(s).find(r=>'tree-'+r.id===choice);node=r.id;text=r.remote?`**${r.title}** remains on your accepted warrant. ${r.suspectedPort?`The last account you brought was from **day ${r.observedDay}**, near **${port(r.suspectedPort).name}**.`:'There is no location report in your records.'}\n\nI have heard no fresh local sighting that would update it. Ask crews in the target’s known territory before committing to a chase.`:id==='local'?`Crews passing through have been talking about **${r.title}**: ${bountyTarget(r.bountyID).detail}\n\nOne account puts the ship near **${port(r.suspectedPort).name}**, dated **day ${r.observedDay}**. It is dockside gossip; I would check with patrol before chasing it.`:`**${r.title}** is wanted for capture. ${bountyTarget(r.bountyID).detail} The posted payment is **${r.reward} cr**.\n\nOur latest unconfirmed report places the target near **${port(r.suspectedPort).name}**, as of **day ${r.observedDay}**. ${r.accepted?'Your bounty is already accepted.':'Will you take the bounty?'} Encounters happen on ordinary voyages.`;}
 else if(/^tree-project-(verify|care|shortcut|open|confidential|falsify)$/.test(choice)){const task=personalProjectsHere(s,id,contact)[0];check(task,'There is no project stage awaiting this character.');text=performPrivateStep(s,{project:task.id,step:task.step.index,venue:id,contact,choice:choice.slice(13)});node='project';}
 else if(choice==='tree-lore'||choice.startsWith('tree-lore-')||choice==='tree-case'||choice.startsWith('tree-case-')||choice.startsWith('tree-view-')||choice.startsWith('tree-agreement-')){const reply=storyConversations.reply(s,id,host,choice);check(reply,'Unknown conversation follow-up.');node=reply.node;text=reply.text;}
 else if(choice.startsWith('campaign-intro-')){text=campaignIntroduce(s,choice.slice(15),id);session.outcome='Specialist work register introduced';node='work';}
 else if(choice.startsWith('op-discover-')){text=operationDiscovery(s,choice.slice(12),id);session.outcome='Specialist work introduced · +5 '+(choice.endsWith('passengers')?'diplomacy':'navigation')+' XP';node='work';}
 else if(id==='authority'&&Object.hasOwn(governmentTopics,choice)){node=governmentTopics[choice].node;text=governmentReply(s,host,choice);}
 else switch(choice){
 case 'tree-bounties':node='bounties';{const list=conversationBounties(s);text=list.length?'Choose a target and I can share the latest unconfirmed reports.':'I have no current reports about an open local bounty today.';}break;
 case 'tree-bounties-next':{const pages=Math.max(1,Math.ceil(conversationBounties(s).length/2)),current=node==='bounties'?0:Number(node.slice(9)),page=(current+1)%pages;node=page?'bounties-'+page:'bounties';text='Let’s look at the other names being discussed.';}break;
 case 'tree-bounty-accept':{const r=bountyConversation(s,node);check(r,'This warrant is no longer available.');acceptBounty(s,r.id);text=`You have accepted the bounty on **${r.title}**: **${r.reward} cr** after confirmed capture.\n\nOur latest information places the target near **${port(r.suspectedPort).name}**, updated **day ${r.observedDay}**. Travel when you are ready; I am not ordering an immediate engagement.`;}break;
 case 'tree-bounty-refresh':{const r=bountyConversation(s,node);check(r?.accepted,'Accept this warrant first.');recordPatrolLead(s,r.id);text=`Your accepted bounty on **${r.title}** remains open. The latest update places the target near **${port(r.suspectedPort).name}**, as of **day ${r.observedDay}**.`;}break;
 case 'tree-bounty-later':case 'tree-bounty-decline':node='root';text=choice==='tree-bounty-later'?'No commitment, Captain. Ask again when you are ready.':'Understood. I have not put you down for this bounty.';break;
 case 'tree-project-review':node='project-review';text=privateProjectReview(s,id,contact);break;
 case 'tree-challenge-craft':case 'tree-challenge-story':case 'tree-challenge-needs':node=choice.slice(5);text=choice==='tree-challenge-craft'?'Those checks protect the next crew as well as this one. We can talk through an example. Asking why is fair; ordering me to ignore them would be a different matter.':choice==='tree-challenge-story'?'Some of it is personal. I can tell you the part I am comfortable sharing; I need you to leave the rest with me.':'I can explain what is available and what it requires. I cannot promise a job just to end a difficult conversation. We can look at the actual work without threats.';break;
 case 'tree-project-work':{const task=personalProjectsHere(s,id,contact)[0];node='project';text=task?`${privateStepGreeting(s,id,host)} This stage of **${task.title}** is assigned here.\n\nHere we need to **${task.step.task.toLowerCase()}**. ${task.step.terms}. ${task.step.reason||'If you are ready, we can do this together.'}${task.step.options.length?'\n\n'+task.step.options.map(o=>`**${o.name}** ${o.terms}.`).join('\n\n'):''} ${task.step.options.length?'Choose an approach below. The receiving character may respond differently from the sponsor. A false certification ends the project without payment and withdraws personal trust.':'This signs one step; the issuing character handles the final payment.'}`:privateProjectReview(s,id,contact);}break;
 case 'tree-project-confirm':{const task=personalProjectsHere(s,id,contact)[0];check(task,'There is no project step awaiting this character.');text=performPrivateStep(s,{project:task.id,step:task.step.index,venue:id,contact});node='project';}break;
 case 'tree-patron':node='patron';text=personalOpportunityReply(s,id,contact);break;
 case 'tree-private-offer':makePrivateCommission(s,id,contact);node='terms';{const q=dialogueCommission(s,id,contact);text=`${q.description}${q.project?'\n\n'+q.project.steps.map((x,i)=>`${i+1}. **${x.task}** — ${privateHandover(s,x)}. ${privateStepView(s,q,i).terms}.`).join('\n\n'):''}\n\n**The terms:** ${commissionView(s,q).terms}\n\nThis is a personal introduction, not a waiver of licences or operating requirements. An unaccepted offer closes if our trust breaks; an accepted agreement keeps its quoted payment.`;}break;
 case 'tree-introduce':{const v=relationshipOpportunities(s,id,contact);check(v.canIntroduce,'This personal introduction is not available.');session.patron.introducedTo=v.introduction.id;session.patron.introducedDay=s.day;node='patron';text=privateReferralReply(s,id,host,v.introduction);break;}
 case 'tree-patron-deal':node='supply-offer';{const d=relationshipOpportunities(s,id,contact).deal;check(d,'No personal supply offer is available.');text=`Following your reliable help with our earlier work, I have set aside **${d.quantity} units of ${d.name.toLowerCase()}** at **${d.unitPrice} cr each**, ${d.total} cr total. This is one lot at this relationship level, bought with your own cash and hold space. The quote is for this lot; tell me if you want it.`;}break;
 case 'tree-repair-trust':node='patron';{const v=relationshipOpportunities(s,id,contact);if(!v.canRepair){text=v.repairTerms;break;}session.patron.blocked=false;session.patron.reason='';session.rapport=Math.max(3,session.rapport);text='You acknowledged what happened, and your subsequent actions have given me a reason to reconsider. I am willing to recommend you again. Finished work stays finished; an old supply allowance cannot be claimed twice.';}break;

 case 'tree-reconnect':case 'tree-recall-interest':case 'tree-recall-goal':node='remember';text='Continue the remembered conversation.';break;
 case 'tree-record':case 'tree-next-record':case 'tree-acknowledge':node='record';text='Discuss the current record.';break;
 case 'tree-relationship':case 'tree-explain':case 'tree-reassure':node='relationship';text='Discuss the relationship.';break;
 case 'tree-confide':case 'tree-regret':case 'tree-boundary':node='confidence';text='Continue a conversation in confidence.';break;
 case 'tree-check-promise':node='terms';{const q=dialogueCommission(s,id,contact);check(q?.status==='active','There is no active personal commission.');text=`${q.description}\n\n${commissionView(s,q).progress}. The agreed deadline is **day ${q.deadline}**.`;}break;
 case 'tree-merchant-supply':{check(['market','contracts'].includes(id),'Ask the broker or dispatcher about commercial supplies.');node=id==='market'?'market-selling':'freight-dispatch';const business=merchantOverview(s),job=business.contracts.find(c=>c.line.port===s.location)||business.offers[0],customer=business.relationships.find(r=>r.port===s.location);text=(customer?`Your earlier deliveries have supplied **${customer.units} useful lots** here. ${customer.trust>=3?'The receiving teams know your work.':'We are beginning to build a receiving record together.'}\n\n`:'')+(job?`The receiving stores are waiting for **${(job.line||job.lines[0]).units} lots of ${good((job.line||job.lines[0]).good).name.toLowerCase()}** at **${stationLabel((job.line||job.lines[0]).port)}**. This is a purchase of your own cargo, not a free consignment. The exchange lists the dated agreement and each stop’s payment; already completed stops are paid once. Bring supplies by the due date, or end the promise if your route changes.`:'There is no shortage-backed purchase agreement I can responsibly offer today. The regular exchange still buys within its daily allowance; check whether a buyer needs the cargo before setting off.');break;}
 case 'tree-market-production':case 'tree-market':case 'tree-market-bargains':case 'tree-market-premiums':case 'tree-market-selling':case 'tree-market-route':check(id==='market','Ask the cargo broker for exchange advice.');node=['tree-market-selling','tree-market-route'].includes(choice)?'market-selling':'market-advice';text=brokerMarketAdvice(s,choice);break;
 case 'tree-bank-rates':case 'tree-bank-conditions':case 'tree-bank-fixed':check(id==='bank','Ask a bank manager about rates.');node='bank-outlook';text=bankOutlook(s,choice==='tree-bank-conditions'?'conditions':choice==='tree-bank-fixed'?'fixed':'rates');break;
 case 'tree-work':node='work';text=`${host.business} ${host.character.value} What would you like to know about the work?`;break;
 case 'tree-careful':node='detail';text=`That is a useful question. ${host.character.habitSpoken} ${hostAdvice(s,host)}`;break;
 case 'tree-detail':node='detail';text=id==='bank'&&!contact?bankOutlook(s,'account'):hostAdvice(s,host);break;
 case 'tree-followup':node='detail';session.insight=true;text=`Good. Check the figures against your actual departure plan, not someone else’s old itinerary. ${placeStories[p.id][1]} I have added a dated local briefing to your visit notes.`;break;
 case 'tree-story':node='story';text=`${host.character.history} ${host.character.mood} There is a longer story there, if you have time.`;break;
 case 'tree-listen':node='values';text=`${host.character.value} Living above ${p.body} gave that lesson a different meaning. ${host.character.habitSpoken} Thank you for listening before asking for something.`;break;
 case 'tree-interests':node='interests';text=`Between shifts I spend time ${host.character.interest}. It gives me a life beyond ${host.name}. What do you make room for between voyages?`;break;
 case 'tree-support':node='ambition';text=`I would like to ${host.character.goal}. ${host.character.history} It will take patience. A captain who keeps a small promise is someone I can work with.`;break;
 case 'tree-local':node='local';text=`${placeStories[p.id][0]} ${placeStories[p.id][2]} Do you want to know about the logistics, or keeping a crew safe?`;break;
 case 'tree-logistics':node='logistics';text=`${placeStories[p.id][1]} ${marketConditions(s).summary}. Keep your freight deadline separate from any personal commission; both clocks continue while you travel.`;break;
 case 'tree-safety':node='safety';text=`The approach advisory is **${p.hazard.toLowerCase()}**. Your crew readiness is **${crewReadiness(s)}/100**. The clinic handles fatigue and injury; the dry dock handles damaged hulls. A coordinator briefing is tied to one route and expires after 30 days.`;break;
 case 'tree-needs':node='needs';text=session.rapport<0?'I will hear you out, but our last exchange did not inspire confidence. Acknowledge the terms and keep this professional.':`There is something a visiting captain might do. It is a personal commission through this desk, separate from a freight-office shipment. I need someone who will listen before promising.`;break;
 case 'tree-offer':node='terms';if(dialogueCommission(s,id,contact)?.tier>1&&!privateCommissionEligible(s,dialogueCommission(s,id,contact))){node='guarded';text='That private offer is suspended. I need a restored personal relationship or an active recommendation before accepting a new agreement. Public services and already accepted jobs keep their normal terms.';break;}if(session.rapport<0||stationStanding(s).effective<=-20){node='guarded';text=stationStanding(s).effective<=-20?'Your station record and wider reputation need work before I can offer a personal commission. Keep deliveries, help the clinic, or share useful traffic reports. Public services remain open.':'We need to clear the air first. An apology would help more than another promise.';break;}makeDialogueCommission(s,id,contact);const q=dialogueCommission(s,id,contact);text=q?`${q.description}\n\n**The terms:** ${q.reward} cr on completion. ${q.duration} ship-days from acceptance. Missing the deadline means no payment, a reputation penalty and some experience lost; there is no cash fine.\n\nRead them, then decide. Nothing is accepted just by asking.`:'I have no suitable licensed route to offer at present. Ask again after you have gained access to another destination.';break;
 case 'tree-offer-later':node='root';text='Take your time, Captain. We have not made an agreement; ask me again when you are ready.';break;
 case 'tree-offer-decline':node='root';text='Understood, Captain. I will leave it there; we can talk about something else.';break;
 case 'tree-patron-buy':{const deal=relationshipOpportunities(s,id,contact).deal;check(deal?.canBuy,'This reserved lot is not available to purchase.');buyPersonalSupplies(s,{id,contact,total:deal.total});node='patron';text=`The ${deal.quantity} units are in your hold. I have received **${deal.total} cr**; thank you, Captain.`;}break;
 case 'tree-accept':text=applyCommission(s,id,contact,'accept');break;
 case 'tree-complete':text=applyCommission(s,id,contact,'complete');session.outcome='Commission complete · reward paid once';break;
 case 'tree-receipt':{const q=dialogueCommission(s,id,contact);text=commissionView(s,q).reason;break;}
 case 'tree-trade-rumour':{check(id==='local','Trade gossip belongs in the canteen.');node='trade-lead';const lead=canteenTradeTalk(s,contact);rememberTradeRumor(s,lead,host,contact,'conversation');text=lead.text;}break;
 case 'tree-risk':node='risk';text=`Crews hear plenty around ${host.name}. I can help you distinguish a dated report from a story that has passed through three cargo holds. Verify it before changing your route.`;break;
 case 'tree-verify':{session.insight=true;node='risk';const r=id==='security'?raidOffers(s).find(r=>r.availableHere&&!r.completed):null;text=r?`${r.detail}\n\nAsk me about the open warrants if you want to take on a bounty. Your next voyage stays under your command.`:`${p.hazard}. ${placeStories[p.id][1]} This is a local advisory, not a confirmed pirate position. Ask the patrol office for a dated sighting. I have added this briefing to your visit notes.`;session.outcome='Unlocked: dated local briefing';break;}
 case 'tree-record-lead':{const r=raidOffers(s).find(r=>r.availableHere&&!r.completed&&!r.recorded);check(r,'That report is no longer available.');recordPatrolLead(s,r.id);text=`Recorded **${r.title}**, reported near **${port(r.suspectedPort).name}** on day ${r.observedDay}. Normal voyages closer to that station now carry a greater chance of encountering this group while the report is fresh. No battle has been launched.`;session.outcome='Patrol lead recorded · ordinary travel may bring danger';break;}
 case 'tree-pressure':case 'tree-pry':case 'tree-threat':breakPersonalTrust(s,session,choice==='tree-pry'?'You pressed a personal boundary.':choice==='tree-threat'?'You threatened this contact.':'You demanded unsafe shortcuts.');node='guarded';text=choice==='tree-pry'?`My private life is not part of a docking contract. Respect that boundary if you want this conversation to continue.`:choice==='tree-threat'?`Threats end this discussion. The public services remain open, but I will not offer personal work until you change your approach.`:`The safeguards protect people who rely on this station. You can ask about them; you cannot order me to ignore them.`;break;
 case 'tree-apologize':session.patron.apologized=true;session.rapport=Math.max(0,session.rapport);node='root';text=`Accepted. Let’s start with a clear question and leave the threats behind us. What did you want to discuss?`;session.outcome='Conversation reopened · no experience reward';break;
 case 'tree-back':node='root';text=homePort(s)===s.location?`Of course, Captain. You are among your home-port crew. What else would you like to discuss?`:`Of course, Captain. What else would you like to discuss?`;break;
 default:{const reply=expandedDialogueReply(s,id,host,choice,session);check(reply,'Unknown dialogue reply.');node=reply.node;text=reply.text;}
 }
 if(!careerReply)text=dialogueVoices.response(s,id,host,choice,text,session);
 if(['market','local'].includes(id)&&['tree-logistics','tree-season','tree-shortage'].includes(choice))text=marketTalkOpening(host)+'\n\n'+(choice==='tree-shortage'?productionTalk(s):marketLogisticsTalk(s,contact,choice==='tree-season',id));
 if(choice==='tree-risk'){const report=patrolReports.build(api,s),sector=report.sectors.find(g=>g.local),place=sector?.affected?.[0];text=`The patrol circular is dated **day ${report.issuedDay}**. ${sector?`The ${sector.name} watch is **${sector.label.toLowerCase()}**.${place?' Reported activity affects '+stationLabel(place)+'.':''}`:report.intro} Ask which observations are confirmed before changing course. The patrol office holds the full route report and blockade watch.`;}
 if(!careerReply)text=dialogueMemory.reply(s,id,host,choice,text,session);if(choice==='tree-work'&&(session.memory?.topics['tree-work']?.count||0)>=3){const next=storyConversations.reply(s,id,host,'tree-case');node=next.node;text=next.text;}if(['tree-relationship','tree-reconnect','tree-patron'].includes(choice)){const memory=privateOutcomeMemory(s,id,host);if(memory)text+='\n\n'+memory;}


 const effect=dialogueEffects[choice];if(effect&&!session.resolved.includes(choice)){
  const skill=effect[0]==='work'?dialogueSkill(id):effect[0],before=s.profile.xp[skill],old=s.profile.relationships[p.id]||0;earn(s,skill,effect[1]>0?careerConversations.learning(s,id,host,effect[1]):effect[1]);changeStationReputation(s,p.id,effect[2],option.name);session.rapport=Math.max(-6,Math.min(6,session.rapport+effect[2]+(effect[2]>0?captainPerk(s,'rapport'):0)));session.resolved.push(choice);session.outcome=`${s.profile.xp[skill]-before>=0?'+':''}${s.profile.xp[skill]-before} ${skillNames[skill]} XP${effect[2]?` · ${(s.profile.relationships[p.id]||0)-old>=0?'+':''}${(s.profile.relationships[p.id]||0)-old} local trust`:''}${choice==='tree-offer'&&dialogueCommission(s,id,contact)?' · Unlocked: personal commission':''}`;decision(s,`${host.person}, ${p.name}: ${option.name} (${session.outcome}).`,effect[1]>0?'empathy':null);
 }
 dialogueMemory.remember(s,id,host,session,choice);storyConversations.remember(s,id,host,session,choice);careerConversations.record(s,id,host,choice);if(choice==='tree-apologize'&&session.patron.blocked)text+='\n\n'+relationshipOpportunities(s,id,contact).repairTerms;session.node=node;speak(s,s.profile.name,option.name);speak(s,host.person,text);for(const line of s.dialogue.slice(-2)){line.venue=id;line.contact=contact;line.partner=host.person;line.conversationChoice=choice;}
}
// Personal opportunities are finite per identity. Views are pure; only player actions write.
function personalGoodDeeds(s){return (s.profile.stats.deliveries||0)+(s.profile.stats.aid||0)+(s.dialogueProgress?.commissions||[]).filter(q=>q.status==='completed').length;}
function personalTrustState(s,id,contact=''){
 const session=dialogueSession(s,id,contact);if(session.patron)return {...session.patron};
 const broken=session.rapport<0||dialogueCommission(s,id,contact)?.status==='failed';
 return {blocked:broken,reason:broken?'An earlier personal exchange or promise damaged trust.':'',breachDay:broken?s.day:null,repairBaseline:personalGoodDeeds(s),apologized:false,introducedTo:null,introducedDay:null,claimedTier:0};
}
function breakPersonalTrust(s,session,reason){
 if(!session)return;
 const old=session.patron||{introducedTo:null,introducedDay:null,claimedTier:0};
 session.patron={...old,blocked:true,reason,breachDay:s.day,repairBaseline:personalGoodDeeds(s),apologized:false};
}
function personalRecommendation(s,id){
 for(const [key,session] of Object.entries(s.dialogueProgress?.sessions||{})){
  const [pid,venue,contact]=key.split(':'),t=session.patron;if(pid!==s.location||venue===id||t?.introducedTo!==id||t.blocked||session.rapport<3||privateRecommendationHeld(s,pid,venue,contact))continue;
  const r=stationStanding(s);if(r.effective<=-20)continue;
  // A recommendation has to remain backed by an actual kept promise, not a dialogue-only score.
  if(!s.dialogueProgress.commissions.some(q=>q.context===key&&q.status==='completed'))continue;
  const host=stationContacts(pid,venue,s).find(h=>(h.contactID||'')===contact);if(host)return {person:host.person,venue,contact,reason:privateIntroduction(s,venue,host,id)?.reason||'',outcome:privateOutcomeFor(s,pid,venue,contact)?.outcome||null};
 }
 return null;
}
function relationshipOpportunities(s,id,contact=''){
 const session=dialogueSession(s,id,contact),t=personalTrustState(s,id,contact),key=dialogueKey(s,id,contact),quests=(s.dialogueProgress?.commissions||[]).filter(q=>q.context===key),kept=quests.filter(q=>q.status==='completed'),recommendation=contact?null:personalRecommendation(s,id),standing=stationStanding(s),blocked=t.blocked,eligible=!blocked&&session.rapport>=0&&standing.effective>-20;
 const ending=privateOutcomeFor(s,s.location,id,contact),needsRepair=privateRecommendationHeld(s,s.location,id,contact),trusted=eligible&&((session.rapport>=3&&kept.length>0)||!!recommendation),close=trusted&&(session.rapport>=4||needsRepair&&session.rapport>=3)&&quests.some(q=>q.tier===2&&(q.status==='completed'||q.failureReason==='falsified')),tier=close?2:trusted?1:0;
 const latest=quests.at(-1),settled=!latest||['completed','failed'].includes(latest.status),nextTier=eligible&&settled?(close&&!quests.some(q=>q.tier===3)?3:trusted&&!quests.some(q=>q.tier===2)?2:0):0;
 const host=stationContacts(s.location,id,s).find(h=>(h.contactID||'')===contact);check(host,'Unknown establishment contact.');
 const introduction=privateIntroduction(s,id,host,t.introducedTo);
 let deal=null;if(tier>t.claimedTier){const gid=({clinic:'medicine',shipyard:'machinery',fleet:'electronics',market:'food',contracts:'metals',local:'water',authority:'electronics',relay:'electronics',security:'machinery',bank:'metals',warehouse:'food'})[id]||'food',q=marketState(s,gid),quantity=2,discount=tier===2?5:3,unitPrice=Math.max(q.sell+1,Math.ceil(q.buy*(1-discount/100))),total=quantity*unitPrice;
  // Never sell below the local bid: a private allowance cannot become a same-desk cash exploit.
  if(unitPrice<q.buy)deal={good:gid,name:good(gid).name,quantity,discount,unitPrice,total,tier,canBuy:s.profile.created&&!s.incident&&!s.fleetLoss&&s.credits>=total&&cargoRoom(s,gid)>=quantity};
 }
 const deeds=Math.max(0,personalGoodDeeds(s)-t.repairBaseline),wait=blocked?Math.max(0,t.breachDay+7-s.day):0,canRepair=blocked&&t.apologized&&deeds>=2&&!wait&&standing.effective>-20;
 const repairTerms=blocked?`${t.reason} Private work, supply allowances and my introductions are suspended. Acknowledge it with an apology, then complete two new deliveries, clinic contributions or personal commissions, and let seven ship-days pass after the breach. Your effective station standing must be above -20. Progress: ${Math.min(2,deeds)}/2 commitments; ${wait} days still to wait; ${t.apologized?'apology acknowledged':'apology still needed'}. Accepted commissions keep their original payment and obligations.`:'';
 return {visible:blocked||kept.length>0||!!recommendation,blocked,eligible,trusted,close,tier,nextTier,recommendation,introduction,lastProject:ending,recommendationHeld:needsRepair,canIntroduce:trusted&&!needsRepair&&!!introduction&&!t.introducedTo,deal,canRepair,repairTerms,conditions:'Trusted opportunities require rapport built through respectful conversation and a completed personal commission, or an active introduction from someone whose commission you completed. Close contacts require stronger rapport and their first private commission completed. Three personal commissions may be active at once. Licences and public specialist qualifications still apply.'};
}
function privateCommissionEligible(s,q){const v=relationshipOpportunities(s,q.venue,q.contact);return q.tier===3?v.close:v.trusted;}
function personalOpportunityReply(s,id,contact){
 const v=relationshipOpportunities(s,id,contact),h=stationContacts(s.location,id,s).find(h=>(h.contactID||'')===contact);
 if(v.blocked)return v.repairTerms;
 if(!v.eligible)return 'Your effective station standing needs to be above -20 before I can offer private work, recommend you or set aside a personal supply allowance. Public services remain available, and accepted commissions keep their agreed payment.';
 return `${v.recommendation?`${v.recommendation.person} sent a recommendation: ${v.recommendation.reason} I will choose a project that lets us work together rather than ask you to repeat their errand.`:v.close?'You have kept a private promise as well as taking the time to understand my work.':v.trusted?'You came back and kept your word. I am willing to put my name behind yours.':'I like the way we have talked, but I need to see a personal promise kept before putting my own name behind yours.'}\n\nMy plan is still to ${h.character.goal}. ${v.trusted?'There may be a private commission, an introduction to another desk here, or a small supply allowance. These are personal offers; an unaccepted offer or recommendation closes if our trust breaks. Accepted agreements keep their terms.'+(v.recommendationHeld?' My personal recommendations are currently on hold; the next private project is a chance to restore confidence.':''):'Start with a small commission here and finish it. An introduction from an established contact can also open that door.'}`;
}
// Authored private projects: distinct work sequences, selected by identity and voice, never simulation RNG.
// Step shorthand: [desk, task, owned good, units, engineering spares, work days, processing fee, remote].
const privateProjectRecipes={
 market:[['Assay before signature','A buyer needs evidence about condition rather than another reassuring certificate.',[['shipyard','Bench-test a sealed instrument sample','electronics',2,0,1,80],['market','Reconcile the assay with the receiving certificate',null,0,0,1,60]]],['The broken custody trail','Two handovers disagree about who last checked the seals.',[['warehouse','Trace the custody ledger with the storekeeper',null,0,0,1,90],['clinic','Check the care-reserve receiving record',null,0,0,1,60]]],['A buyer beyond the timetable','A receiving broker needs someone to check the local handling conditions in person.',[['market','Compare the receiving broker’s handling records',null,0,0,1,80,true],['warehouse','Set aside a certified replacement lot','metals',2,0,1,0]]]],
 contracts:[['The dispatch that stalled','A delayed handover needs a practical fix before another captain inherits the problem.',[['relay','Reconstruct the dispatch timeline',null,0,0,1,80],['clinic','Deliver replacement reserve packs','medicine',2,0,1,0]]],['Whose seal was it?','The loading crew and custodian kept different copies of the same seal record.',[['warehouse','Inspect the disputed seal entries',null,0,0,2,90],['authority','Reconcile the clearance copy',null,0,0,1,60]]],['The receiver’s version','The sender’s paperwork cannot tell us what the receiving crew actually saw.',[['contracts','Take a receiving dispatcher’s signed account',null,0,0,1,100,true],['relay','Compare both dispatch timestamps',null,0,0,1,80]]]],
 shipyard:[['A loaded calibration','A bench result has to survive a real maintenance handover.',[['shipyard','Calibrate the loaded drive test rig',null,0,1,2,80],['relay','Cross-check the departure sensor log',null,0,0,1,60]]],['The actuator nobody signed for','A replacement assembly is waiting on a measured fit rather than a hurried signature.',[['shipyard','Fit and measure a replacement actuator','machinery',2,0,2,0],['fleet','Witness the vessel’s maintenance handover',null,0,0,1,60]]],['Two workshops, one reading','A second workshop can show whether the fault belongs to the instrument or the procedure.',[['shipyard','Compare a second workshop’s calibration standard',null,0,0,2,100,true],['shipyard','Recheck the local instrument under load','electronics',2,0,1,0]]]],
 fleet:[['The berth handover','Berth dimensions on paper are no substitute for a receiving crew’s inspection.',[['warehouse','Check berth-service connection records',null,0,0,1,80],['shipyard','Witness a safe connection test',null,0,1,1,60]]],['A registry with a witness','A vessel’s ownership record needs an independent condition report.',[['shipyard','Inspect the registered hull’s service record',null,0,0,2,100],['authority','Compare the hull identity and clearance',null,0,0,1,70]]],['The receiving harbormaster','A distant registry has to accept the same vessel described in the local handover.',[['fleet','Reconcile the receiving berth specification',null,0,0,1,120,true],['relay','Check the approach briefing against that specification',null,0,0,1,80]]]],
 security:[['An account that holds up','A witness deserves to be heard before another story becomes a patrol assumption.',[['local','Take the waiting crew’s witness account',null,0,0,1,50],['security','Corroborate the account with one new ordinary-travel raider victory',null,0,0,0,0,'patrol']]],['Evidence without a shortcut','The seal history matters as much as the allegation written beside it.',[['warehouse','Audit the evidence locker’s seal trail',null,0,0,2,90],['authority','Compare the dated custody receipt',null,0,0,1,70]]],['A second patrol’s account','Two stations may be repeating the same sighting rather than observing two groups.',[['security','Compare the other patrol’s original sighting record',null,0,0,1,100,true],['relay','Separate relayed reports from independent observations',null,0,0,1,70]]]],
 relay:[['A clock between crews','A correction is useful only if both ends agree on when it applied.',[['relay','Compare the receiving relay’s clock and acknowledgement log',null,0,0,1,80,true],['authority','Reconcile the local clearance timestamp',null,0,0,1,60]]],['The silent queue','A missing acknowledgement has left a crew waiting on a message that appears complete.',[['fleet','Trace the vessel’s unanswered handover',null,0,0,1,70],['relay','Service the acknowledgement receiver','electronics',2,0,2,0]]],['A reference that survives the journey','The receiving coordinator needs an independent instrument reference.',[['shipyard','Prepare a reference sensor pack','electronics',2,0,1,0],['relay','Compare the receiving station’s instrument log',null,0,0,1,90,true]]]],
 clinic:[['Care after the shift','A full supply shelf is not the same as a crew having time to help use it.',[['clinic','Work a supervised reserve-care shift','medicine',2,0,3,0],['local','Prepare provisions for recovering crews','food',2,0,1,0]]],['Where the cold chain broke','A clean manifest does not show how a parcel was handled between doors.',[['warehouse','Review cold-store temperature and custody logs',null,0,0,2,80],['clinic','Rebuild the affected reserve with owned sealed supplies','medicine',2,0,1,0]]],['The next care handover','The receiving medic needs the patient-care procedure explained by someone who has read it.',[['clinic','Review the receiving clinic’s handover practice',null,0,0,2,80,true],['clinic','Work through the differences in a supervised study shift',null,0,0,2,60]]]],
 authority:[['The hull behind the form','A clearance has to describe the vessel that will actually leave this berth.',[['fleet','Match the registered hull to the application',null,0,0,1,80],['shipyard','Witness the service-connection verification',null,0,0,2,70]]],['One clearance, two clocks','The launch record and approach acknowledgement disagree by a shift.',[['relay','Compare the launch and approach timestamps',null,0,0,2,70],['authority','Reconcile the application with its original evidence',null,0,0,1,60]]],['The receiving authority','A distant office needs the underlying evidence rather than an inherited assumption.',[['authority','Compare the receiving authority’s clearance practice',null,0,0,1,100,true],['fleet','Check that the local registry can satisfy the receiving requirement',null,0,0,1,80]]]],
 bank:[['The care fund’s missing line','A community contribution should reach the reserve named in the accounts.',[['clinic','Check the reserve’s actual receiving ledger',null,0,0,1,60],['bank','Reconcile the cooperative’s matching entry',null,0,0,2,80]]],['The reserve behind the valuation','A balance-sheet entry needs a physical reserve and a custodian willing to sign for it.',[['warehouse','Place an owned certified reserve lot','metals',2,0,1,0],['market','Review the reserve’s independent assay record',null,0,0,1,80]]],['An account at the other end','The two branches should be explaining the same obligation to the arriving crew.',[['bank','Compare the receiving cooperative’s reconciliation record',null,0,0,2,100,true],['relay','Verify when the branch correction was acknowledged',null,0,0,1,60]]]],
 local:[['A table held open','Returning crews need a welcome somebody has actually prepared.',[['local','Cook and serve a shared meal for late crews','food',2,0,2,0],['clinic','Deliver a sealed recovery reserve','medicine',2,0,1,0]]],['The story before it changes','Someone at another commons remembers the event differently from the version told here.',[['local','Record the other commons host’s first-hand account',null,0,0,2,50,true],['relay','Check the story’s voyage dates against the log',null,0,0,1,60]]],['Repairing the shared room','A room for crews needs working fittings as well as good intentions.',[['shipyard','Prepare a repair kit for the shared room','machinery',2,0,1,0],['local','Help the host complete the room handover',null,0,0,2,40]]]],
 warehouse:[['A seal somebody else can read','A good storage record lets the next custodian repeat the check.',[['shipyard','Calibrate a seal-reading instrument','electronics',2,0,1,0],['warehouse','Audit the instrument against the bay ledger',null,0,0,2,70]]],['The bay with two owners','Similar container markings have produced two plausible claims on one bay.',[['warehouse','Reconcile the disputed bay register',null,0,0,2,90],['market','Compare the owner’s receiving certificate',null,0,0,1,60]]],['A reserve worth finding','The clinic needs its reserve recorded where the next shift can actually locate it.',[['clinic','Hand over an owned sealed medical reserve','medicine',2,0,1,0],['warehouse','Reconcile the reserve’s bay and collection permissions',null,0,0,1,60]]]]
};
const privateReferralPeers={market:['warehouse','shipyard','contracts'],contracts:['relay','warehouse','clinic'],shipyard:['fleet','relay','warehouse'],fleet:['shipyard','authority','relay'],security:['authority','warehouse','relay'],relay:['authority','fleet','shipyard'],clinic:['warehouse','local','bank'],authority:['fleet','relay','security'],bank:['warehouse','clinic','market'],local:['clinic','shipyard','relay'],warehouse:['market','clinic','shipyard']};
function privateCharacterContext(s,id,h){return dialogueVoices.context(s,id,h);}
function privateProjectFocus(h,voice){
 const goal=h.character.goal.toLowerCase();
 if(/journey|sail|former mentor|scattered family|traveling exhibition/.test(goal))return 2;
 if(/restore|repair|invention|workshop|greenhouse|garden|observation gallery/.test(goal))return 0;
 if(/archive|guide|teach|class|train|apprentice|first-job/.test(goal))return 1;
 // Remaining ambitions let the established working style settle the emphasis.
 if(voice.style==='precise')return 1;
 if(voice.style==='curious')return 2;
 return null;
}
function privateProjectChoice(s,id,h,key,fallback){
 const v=privateCharacterContext(s,id,h),target=key==='tree-introduce'?privateIntroduction(s,id,h):null;
 if(key==='tree-introduce'&&target)return ({direct:`Will you introduce me to ${target.person}?`,precise:`Could ${target.person} help us check the other side of this?`,warm:`Would you feel comfortable introducing me to ${target.person}?`,wry:`Would ${target.person} tolerate another captain asking useful questions?`,curious:`Could I hear ${target.person}’s perspective on this?`,reflective:`Would you put your name behind an introduction to ${target.person}?`,lively:`Could you connect me with ${target.person}?`})[v.style];
 if(key==='tree-private-offer')return ({direct:`What needs doing beyond the routine ${v.job.subject}?`,precise:`Is there an unresolved case in ${v.job.subject} we could investigate?`,warm:'Is there a personal project I could help you see through?',wry:`Which part of ${v.job.subject} needs more than another optimistic signature?`,curious:`Is there something about ${v.job.subject} you would like us to test?`,reflective:'Is there a practical next step toward the plan you told me about?',lively:'What could we get moving together beyond the ordinary desk work?'})[v.style];
 if(key==='tree-project-work')return fallback;
 return fallback;
}
function privateIntroduction(s,id,h,existing=null){
 const voice=privateCharacterContext(s,id,h),outcome=privateOutcomeFor(s,s.location,id,h.contactID||''),peers=outcome?privateEndings[outcome.outcome].peers:privateReferralPeers[voice.role]||privateReferralPeers.local,all=establishments(s.location,false,s).filter(v=>v.id!==id),ranked=all.filter(v=>peers.includes(v.id));
 const pool=ranked.length?ranked:all;if(!pool.length)return null;
 const target=all.find(v=>v.id===existing)||pool[Number(hash(h.person+':'+h.character.tone+':'+h.character.goal)%BigInt(pool.length))],reason=({warehouse:'Their custody records can settle the questions my own desk cannot.',shipyard:'They can test the hardware that the paperwork only describes.',contracts:'They know which receiving crews are actually waiting on a promise.',relay:'They can distinguish a dated observation from a message passed between crews.',clinic:'They see what these decisions mean for the people arriving with them.',fleet:'They know the vessel, berth and crew behind a registry entry.',authority:'They can check the clearance evidence without pretending a friendship is a licence.',security:'They can compare an allegation with the original patrol evidence.',bank:'They can trace whether the promised support reached the intended reserve.',market:'They can match an owner’s certificate to the goods actually received.',local:'They hear the first-hand crew accounts that never fit neatly on our forms.'})[target.id];
 return {...target,reason,connection:`${voice.job.subject} at ${port(s.location).name}`};
}
function privateReferralReply(s,id,h,target){
 const {style,site}=privateCharacterContext(s,id,h),lead=({direct:'I will put my name to this introduction.',precise:'I can give a specific reason for recommending you.',warm:'There is someone I would be glad for you to meet.',wry:'I know someone who asks an inconveniently useful second question.',curious:'There is another perspective I think you should hear.',reflective:'We have worked beside one another long enough that this recommendation means something.',lively:'Let me connect you with the person I call when my own desk runs out of answers.'})[style];
 return `${lead} **${target.person}**, ${target.role}, works at **${target.name}**, here in **${port(s.location).name}**. ${target.reason}\n\n${site.strain.charAt(0).toUpperCase()+site.strain.slice(1)}. I told them you completed the work we agreed and came back to report. My personal hope to ${h.character.goal} is a separate, longer-term matter. Ask them about a private project; they will choose the work and quote their own terms. This is my personal recommendation. I will withdraw it if our trust breaks; licences and specialist qualifications still apply.`;
}
function makePrivateCommission(s,id,contact){
 const v=relationshipOpportunities(s,id,contact);check(v.nextTier,'No new private commission is available.');
 const ledger=ensureDialogue(s),context=dialogueKey(s,id,contact),h=stationContacts(s.location,id,s).find(h=>(h.contactID||'')===contact),voice=privateCharacterContext(s,id,h),tier=v.nextTier,role=Object.hasOwn(privateProjectRecipes,voice.role)?voice.role:'local',recipes=privateProjectRecipes[role];
 const history=privateOutcomeFor(s,s.location,id,contact),prior=history?.outcome||v.recommendation?.outcome,focus=prior?privateEndings[prior].focus:privateProjectFocus(h,voice),index=focus===null?Number(hash([h.person,h.character.tone,h.character.goal,s.location].join('|'))%BigInt(recipes.length)):focus,previous=ledger.commissions.findLast(q=>q.context===context&&q.project),recipeIndex=prior?(previous?.project.recipe===role+':'+index?(index+1)%recipes.length:index):(index+tier-2)%recipes.length,recipe=recipes[recipeIndex],ports=world.ports.filter(p=>p.id!==s.location&&destinationAccess(s,p.id).open).map(p=>({id:p.id,days:transfer(s.location,p.id,s.day).coastDays+transfer(s.location,p.id,s.day).waitDays})).sort((a,b)=>a.days-b.days||a.id.localeCompare(b.id)),remote=ports.length?ports[Number(hash(h.person+':route')%BigInt(Math.min(3,ports.length)))].id:null;
 const steps=recipe[2].map(([desk,task,gid,quantity,spares,days,fee,away],i)=>{
  const pid=away===true&&remote?remote:s.location,deskHost=establishments(pid,false,s).find(v=>v.id===desk)||establishments(pid,false,s).find(v=>v.id===id)||establishments(pid,false,s)[0],isIssuer=pid===s.location&&deskHost.id===id;
  return {task,port:pid,venue:deskHost.id,contact:isIssuer?contact:'',person:isIssuer?h.person:deskHost.person,good:gid||null,quantity,spares,days,fee,kind:away==='patrol'?'patrol':gid?'supply':spares?'calibration':'review',doneDay:null,baselineVictories:null};
 });
 let travelDays=0,from=s.location;for(const step of [...steps,{port:s.location}])if(step.port!==from){const route=transfer(from,step.port,s.day+travelDays);travelDays+=route.coastDays+route.waitDays;from=step.port;}
 check(travelDays+steps.reduce((n,x)=>n+x.days,0)+120<=2000,'This private itinerary needs a shorter licensed route.');
 const premium=tier===3?35:20,cost=steps.reduce((n,x)=>n+x.fee+x.spares*sparePrice(s)+(x.good?tradeTotal({...s,location:x.port},x.good,x.quantity,true)*1.12:0),0),workDays=steps.reduce((n,x)=>n+x.days,0),reward=Math.ceil((cost+220+workDays*40+serviceRouteCost(s,s.location,{stops:[...steps.map(x=>x.port),s.location],workDays}).operating+serviceRouteCost(s,s.location,{stops:[...steps.map(x=>x.port),s.location],workDays}).capital)*(1+premium/100)),duration=Math.max(180,travelDays+workDays+120);
 const lead=({direct:'I need the work done in this order.',precise:'The discrepancy needs two independent checks.',warm:'I would trust you with the people at the other end of this.',wry:'This needs more than a handsome certificate and an optimistic signature.',curious:'I want to test what we think we know against what another crew can show us.',reflective:'This is one practical step toward the thing I told you I hoped to do.',lively:'There are two people I need you to bring into the same conversation.'})[voice.style];
 const description=`${prior?'Our last project ended with '+privateEndings[prior].title.toLowerCase()+'. '+(['compromised','falsified'].includes(prior)?'This follow-up must restore a record someone else can trust. ':'I have chosen this follow-up with that experience in mind. '):''}${lead} Away from this desk, I hope to ${h.character.goal}. This paid project concerns my professional work; it is not a promise to complete that personal ambition. ${recipe[1]} At ${port(s.location).name}, the work has local complications: ${voice.site.strain}. Return to me after both steps. The fee includes a ${premium}% personal premium; your own supplies, work time and processing charges are listed below. At each stage you choose the handling approach. False certification forfeits the fee and ends the project; other completed approaches retain the agreed payment.`;
 check(ledger.commissions.length<1200,'The personal commission ledger is full.');ledger.commissions.push({id:uuid(),context,port:s.location,venue:id,contact,tier,kind:'project',title:`${h.person} · ${recipe[0]}`,description,good:null,quantity:0,target:null,reward,skill:dialogueSkill(role),duration,status:'offered',acceptedDay:null,deadline:null,visitedTarget:false,baselineVictories:0,completedDay:null,project:{edition:3,recipe:role+':'+recipeIndex,style:voice.style,steps,nextPlan:clone(steps[1]),branch:{first:null,report:null,outcome:null,settledDay:null}}});
}
function privateStepGreeting(s,id,h){const {style,job}=privateCharacterContext(s,id,h);return ({direct:`We will check the actual ${job.subject}.`,precise:`I want to keep the evidence about ${job.subject} separate from the assumption.`,warm:'Come through. We can take time with the people affected by this.',wry:'Let’s see which part survives contact with a real receiving desk.',curious:'Which part could we verify independently? That is where I would start.',reflective:'The next shift will need something they can check without asking us to retell it.',lively:'Good, let’s put the people and the records in the same room.'})[style];}
function privateProjectCompletion(s,q,h){
 const {style,role}=privateCharacterContext(s,q.venue,h),result=({market:'The buyer now has a receiving record that can be checked against the goods.',contracts:'The dispatcher can hand over the evidence without making the next crew inherit an unresolved promise.',shipyard:'The workshop can leave a measured result for the crew taking over the equipment.',fleet:'The register now has people willing to stand behind the vessel’s handover.',security:'The patrol has a corroborated account, with the uncertain parts kept separate from the evidence.',relay:'The message and the original observation can now be followed across both handovers.',clinic:'The care team has a practical handover instead of another unexplained gap in its reserve record.',authority:'The clearance evidence can now be read by someone who was not in the room.',bank:'The cooperative can connect its accounting entry with the people and reserve behind it.',local:'The shared room has something useful to offer the crews returning through it.',warehouse:'The next custodian can follow the owner, seal and receiving record together.'})[role]||'The signed steps now support a handover another person can repeat.';
 const lead=({direct:'That is a result I can put my name to.',precise:'Both checks are signed, and the evidence agrees.',warm:'You made time for the people I asked you to help. Thank you.',wry:'An actual finished project. I may have to revise my opinion of optimistic plans.',curious:'Now we have an answer we can test, rather than a story we merely liked.',reflective:'This is the small beginning I hoped we could make.',lively:'We got the right people talking, and you came back with the work finished.'})[style];
 if(q.project.branch?.outcome==='compromised')return `I will pay for the completed handling work, but the disputed record was never opened to wider scrutiny. I will not put my name behind another introduction until a clean follow-up restores confidence.`;
 return `${q.project.branch?.outcome==='repaired'?'You acknowledged the shortcut instead of trying to pass it off as a complete check. I can work with an honest account of the limits.':lead} ${result}${q.project.branch?.outcome?'\n\n'+privateEndings[q.project.branch.outcome].text:''}\n\nThat settles our professional agreement. My hope to ${h.character.goal} remains a separate personal plan.`;
}
function privateStepView(s,q,index){
 const x=q.project.steps[index],options=privateBranchOptions(s,q,index),readiness=privateStepReadiness(s,q,index,x.days,x.fee),decision=q.project.branch?.[index===0?'first':'report']?.choice,chosen=options.find(o=>o.id===decision);
 return {...x,index,station:port(x.port).name,goodName:x.good?good(x.good).name:null,...readiness,terms:chosen?.terms||readiness.terms,chosen:chosen?{id:chosen.id,name:chosen.name}:null,options,canWork:options.length?options.some(o=>o.canWork):readiness.canWork,reason:options.length?(options.some(o=>o.canWork)?'':options[0].reason):readiness.reason};
}
function personalProjectsHere(s,id,contact=''){
 return (s.dialogueProgress?.commissions||[]).filter(q=>q.status==='active'&&q.project).map(q=>{const i=q.project.steps.findIndex(x=>x.doneDay===null);return i<0?null:{q,step:privateStepView(s,q,i)};}).filter(v=>v&&v.step.port===s.location&&v.step.venue===id&&v.step.contact===contact).map(({q,step})=>({id:q.id,title:q.title,sponsor:stationContacts(q.port,q.venue,s).find(h=>(h.contactID||'')===q.contact).person,step}));
}
function privateHandover(s,x){const venue=establishments(x.port,false,s).find(v=>v.id===x.venue);return `${venue.name} → ${stationLabel(x.port)} → ${x.person}`;}
function privateProjectAtDesk(s,id,contact=''){
 return (s.dialogueProgress?.commissions||[]).findLast(q=>q.project&&(q.port===s.location&&q.venue===id&&q.contact===contact||q.project.steps.some(x=>x.port===s.location&&x.venue===id&&x.contact===contact)))||null;
}
function privateProjectReview(s,id,contact=''){
 const q=privateProjectAtDesk(s,id,contact);if(!q)return 'No private agreement is recorded with this desk.';
 if(q.status==='failed')return `**${q.title}** ended without payment. ${q.failureReason==='falsified'?'The final certification was false; the affected contacts withdrew personal trust.':'The agreed deadline was missed.'} Discuss the breach with the issuing character before asking to rebuild trust.`;
 if(q.status==='completed')return `**${q.title}** is settled. The issuing character paid the agreed fee; the signed stages remain in your record.`;
 const next=q.project.steps.find(x=>x.doneDay===null),done=q.project.steps.filter(x=>x.doneDay!==null).length;
 if(q.status==='offered')return `The quote for **${q.title}** is unaccepted. Ask the issuing character to review the terms before any work begins.`;
 return `${done} of ${q.project.steps.length} stages signed for **${q.title}**. `+(next?`Next: **${next.task}**. Handover: **${privateHandover(s,next)}**.`:`Both stages are signed. Return for payment: **${privateHandover(s,{port:q.port,venue:q.venue,person:stationContacts(q.port,q.venue,s).find(h=>(h.contactID||'')===q.contact).person})}**.`);
}
function performPrivateStep(s,arg){
 const q=s.dialogueProgress?.commissions.find(q=>q.id===arg.project),i=arg.step;check(q?.project&&integer(i,0,1),'Choose an active personal project step.');const x=q.project.steps[i],v=privateStepView(s,q,i),choice=q.project.edition>=2?v.options.find(o=>o.id===arg.choice):null;
 check(q.project.edition<2||choice,'Choose how to handle this stage of the private project.');check(choice?choice.canWork:v.canWork,choice?.reason||v.reason);check(arg.venue===x.venue&&(arg.contact||'')===x.contact,'This work belongs with the named character at its listed establishment.');
 if(x.good)removeFleetCargo(s,x.good,x.quantity,true);let spares=x.spares;for(const ship of fleetMembers(s)){const n=Math.min(spares,ship.spares);ship.spares-=n;spares-=n;}s.credits-=choice?choice.fee:x.fee;advance(s,choice?choice.days:x.days);x.doneDay=s.day;
 let ending='';if(choice){q.project.branch[i===0?'first':'report']={choice:choice.id,day:s.day};if(i===0)q.project.steps[1]=privateForkNext(s,q,choice.id);else ending=resolvePrivateEnding(s,q);}
 const next=q.project.steps[i+1];if(next?.kind==='patrol')next.baselineVictories=s.profile.stats.victories;
 const host=stationContacts(x.port,x.venue,s).find(h=>(h.contactID||'')===x.contact),voice=privateCharacterContext(s,x.venue,host),line=choice?.id==='falsify'?'You filed an account I cannot endorse. I have told the issuing character why I will not back it.':({direct:'That check is done. I have signed the result.',precise:'The observation and handover are recorded together.',warm:'Thank you for taking time with the people behind the request.',wry:'A real result. Considerably more useful than another reassuring rumour.',curious:'Now we have something the next person can check for themselves.',reflective:'This is a handover I would be willing to leave for the next shift.',lively:'Good. We have the work and the record in the same place now.'})[voice.style];
 record(s,`${q.title}: ${x.task}, recorded by ${x.person} at ${port(x.port).name}. ${choice?choice.name+' '+choice.terms:v.terms}.`);
 return `${choice?.id==='shortcut'?'You chose to move on without the full check. The disputed record will go to another desk.':line} **${x.task}** is recorded. ${ending?ending+'\n\n':''}${next?`Next: ${next.task}, **${privateHandover(s,next)}**. ${privateStepView(s,q,i+1).terms}.`:q.failureReason==='falsified'?'The project is closed without payment. Both contacts will remember the false certification.':`Both stages are recorded. Return for the agreed payment: **${privateHandover(s,{port:q.port,venue:q.venue,person:stationContacts(q.port,q.venue,s).find(h=>(h.contactID||'')===q.contact).person})}**.`}`;
}
// Edition 2 keeps the quote and both decisions in the voyage ledger. Edition 1 remains unchanged.
const privateEndings={
 evidence:{title:'Independently verified',text:'The findings were independently checked and openly handed over.',focus:1,peers:['authority','relay','shipyard']},
 discreet:{title:'Evidence kept in confidence',text:'The checks were completed, while personal details stayed with the named receiving desk.',focus:1,peers:['warehouse','bank','authority']},
 shared:{title:'A shared remedy',text:'The affected crew helped shape the remedy, and the final account was shared openly.',focus:0,peers:['local','clinic','contracts']},
 protected:{title:'Crew confidence protected',text:'The affected crew agreed a remedy without their personal account being circulated.',focus:0,peers:['clinic','local','warehouse']},
 repaired:{title:'Shortcuts acknowledged',text:'The shortcut was disclosed and the receiving desk recorded the limits of the work.',focus:1,peers:['authority','shipyard','relay']},
 compromised:{title:'An unresolved handover',text:'The shortcut was left out of the wider report. Recommendations are held until a clean follow-up restores confidence.',focus:1,peers:['authority','warehouse','relay']},
 falsified:{title:'False certification',text:'A false certification ended the project without payment. Personal trust and recommendations were withdrawn.',focus:1,peers:['authority','security','warehouse']}
};
function privateEnding(first,report){return report==='falsify'?'falsified':first==='shortcut'?(report==='open'?'repaired':'compromised'):first==='verify'?(report==='open'?'evidence':'discreet'):(report==='open'?'shared':'protected');}
function privateOutcomeFor(s,pid,id,contact=''){return s.dialogueProgress?.sessions[pid+':'+id+':'+contact]?.patron?.lastProject||null;}
function privateRecommendationHeld(s,pid,id,contact=''){return ['compromised','falsified'].includes(privateOutcomeFor(s,pid,id,contact)?.outcome);}
function privateOutcomeMemory(s,id,h){const m=privateOutcomeFor(s,s.location,id,h.contactID||'');if(!m)return '';return `I remember **${m.title}**. ${privateEndings[m.outcome].text} ${m.role==='sponsor'?'That is part of how I will judge the next undertaking I entrust to you.':'I will remember how you handled the people at my desk when another captain asks for a recommendation.'}`;}
function privateForkLegacy(s,q,first){
 const original=q.project.nextPlan,role=q.project.recipe.split(':')[0],wanted=first==='verify'?({clinic:'warehouse',local:'relay',market:'shipyard',contracts:'authority',shipyard:'fleet',fleet:'shipyard',security:'authority',relay:'authority',authority:'fleet',bank:'warehouse',warehouse:'market'})[role]:first==='care'?({clinic:'local',local:'clinic',market:'contracts',contracts:'clinic',shipyard:'fleet',fleet:'local',security:'local',relay:'contracts',authority:'local',bank:'clinic',warehouse:'clinic'})[role]:'authority',all=establishments(original.port,false,s),h=all.find(h=>h.id===wanted)||all.find(h=>h.id===original.venue)||all[0],issuer=original.port===q.port&&h.id===q.venue,host=issuer?stationContacts(q.port,q.venue,s).find(h=>(h.contactID||'')===q.contact):h;
 const prefix=first==='verify'?'Independently confirm: ':first==='care'?'Agree a crew-led remedy: ':'Review the disputed handover: ';
 return {...original,venue:h.id,contact:issuer?q.contact:'',person:host.person,task:(prefix+original.task.charAt(0).toLowerCase()+original.task.slice(1)).slice(0,150),doneDay:null,baselineVictories:null};
}
// Edition 3 pairs the receiving professional with work they can actually attest.
// The signed input lot, fees and stopped days remain exactly those of the quoted plan.
function privateForkNext(s,q,first){
 const next=privateForkLegacy(s,q,first);if(q.project.edition<3)return next;
 const subject=({market:'receiving evidence',contracts:'dispatch evidence',shipyard:'maintenance evidence',fleet:'vessel records',security:'witness evidence',relay:'message records',clinic:'care records',authority:'clearance evidence',bank:'accounting evidence',local:'shared-room work',warehouse:'custody evidence'})[q.project.recipe.split(':')[0]],
 duties={market:['Compare the independent assay with','Agree the buyer’s receiving remedy for'],contracts:['Reconcile the receiving crew’s dispatch record with','Agree the receiving crew’s delivery handover for'],shipyard:['Check instrument and service evidence supporting','Agree a safe equipment handover supporting'],fleet:['Check registered hull and berth evidence supporting','Agree the crew and vessel handover supporting'],security:['Corroborate the original observation supporting','Record affected crews’ safety concerns about'],relay:['Verify timestamps and acknowledgement of','Agree the receiving crew’s readback of'],clinic:['Check the care team’s receiving record against','Agree a supervised care handover supported by'],authority:['Audit clearance and signatory authority for','Agree the permitted receiving procedure for'],bank:['Reconcile the reserve’s ledger with','Agree the reserve’s accountable handover using'],local:['Record an independent crew account of','Agree the shared-room crew’s practical remedy for'],warehouse:['Match the physical lot and custodian to','Agree the bay and collection handover for']},
 duty=first==='shortcut'?'Record the disputed evidence and its limits for':duties[next.venue][first==='verify'?0:1],
 input=next.good?' using the quoted owned '+good(next.good).name.toLowerCase()+' lot':next.spares?' using the quoted engineering spare':'';
 return {...next,task:(duty+' '+subject+input).slice(0,150)};
}
function privateBranchDefinitions(s,q,index){
 const x=q.project.steps[index],role=q.project.recipe.split(':')[0],subjects={market:'the receiving certificate',contracts:'the dispatch promise',shipyard:'the maintenance handover',fleet:'the berth and hull record',security:'the witness account',relay:'the original message',clinic:'the care handover',authority:'the clearance evidence',bank:'the cooperative’s account',local:'the crew’s shared project',warehouse:'the custody record'},subject=subjects[role];
 return index===0?[
  {id:'verify',name:'Obtain an independent check of '+subject+'.',detail:'Ask a separate professional to verify the findings before the final handover.',days:x.days+1,fee:x.fee+80},
  {id:'care',name:'Hear the affected crew and agree a practical remedy.',detail:'Bring the crew’s concerns to a different receiving desk; the final report can still be open or confidential.',days:x.days+1,fee:x.fee},
  {id:'shortcut',name:'Skip the full check and move the handover along.',detail:'The next desk will receive a disputed record. You will have to decide whether to admit its limits.',days:Math.max(0,x.days-1),fee:x.fee}
 ]:[
  {id:'open',name:'File the findings openly, including anything we skipped.',detail:'Share the findings and their limits with the issuing character and the receiving desk.',days:x.days,fee:x.fee},
  {id:'confidential',name:'Keep the crew’s account with the named receiving desk.',detail:'Use a confidential handover. Characters may disagree about privacy versus independent scrutiny.',days:x.days+1,fee:x.fee},
  {id:'falsify',name:'Certify that every check passed, regardless of the record.',detail:'This is a false certification: the project loses its payment and both contacts withdraw their trust.',days:0,fee:x.fee}
 ];
}
function privateStepReadiness(s,q,index,days,fee){
 const x=q.project.steps[index],current=q.project.steps.findIndex(x=>x.doneDay===null),spares=fleetMembers(s).reduce((n,v)=>n+v.spares,0),price=fee,newVictory=x.kind!=='patrol'||x.baselineVictories!==null&&s.profile.stats.victories>x.baselineVictories;
 const reason=q.status!=='active'?'Accept this project with its issuing character first.':current!==index?'Complete the preceding step first.':s.location!==x.port?'Travel to '+port(x.port).name+'.':s.incident?'Resolve the encounter first.':s.fleetLoss?'A serviceable travelling fleet is required.':s.day+days>q.deadline?'There is not enough time before this project’s deadline.':x.good&&tradableQuantity(s,x.good)<x.quantity?'Bring '+x.quantity+' units of your own '+good(x.good).name.toLowerCase()+'. Client freight is not accepted.':spares<x.spares?'Bring '+x.spares+' engineering spare aboard the travelling fleet.':s.credits<price?'Keep '+price+' cr available for processing.':!newVictory?'One new raider victory after the preceding interview is required, encountered through ordinary travel.':'';
 const terms=[x.good?x.quantity+' owned units of '+good(x.good).name.toLowerCase():null,x.spares?x.spares+' engineering spare':null,days?days+' stopped '+(days===1?'day':'days'):'No stopped work days',fee?fee+' cr processing':null,x.kind==='patrol'?'A new ordinary-travel raider victory after the interview; no battle is spawned':null].filter(Boolean).join(' · ');
 return {canWork:!reason,reason,cost:price,terms};
}
function privateBranchOptions(s,q,index){return q.project.edition>=2?privateBranchDefinitions(s,q,index).map(o=>({...o,...privateStepReadiness(s,q,index,o.days,o.fee)})):[];}
function projectOutcomeSession(s,pid,id,contact){
 const ledger=ensureDialogue(s),key=pid+':'+id+':'+contact;if(!ledger.sessions[key]){check(Object.keys(ledger.sessions).length<1024,'This voyage has reached its conversation limit.');ledger.sessions[key]={node:'root',rapport:0,resolved:[],outcome:'',insight:false};}const session=ledger.sessions[key];if(!session.patron)session.patron=personalTrustState({...s,location:pid},id,contact);return session;
}
function resolvePrivateEnding(s,q){
 const b=q.project.branch;check(b.outcome===null,'This private-project outcome has already been recorded.');const ending=privateEnding(b.first.choice,b.report.choice);b.outcome=ending;b.settledDay=s.day;
 const sponsor=stationContacts(q.port,q.venue,s).find(h=>(h.contactID||'')===q.contact),targets=[{port:q.port,venue:q.venue,contact:q.contact,person:sponsor.person,role:'sponsor'},...q.project.steps.map(x=>({...x,role:'collaborator'}))],seen=new Set();
 for(const t of targets){const key=t.port+':'+t.venue+':'+t.contact;if(seen.has(key))continue;seen.add(key);const session=projectOutcomeSession(s,t.port,t.venue,t.contact),host=stationContacts(t.port,t.venue,s).find(h=>(h.contactID||'')===t.contact),style=privateCharacterContext({...s,location:t.port},t.venue,host).style;
  const preferred=ending==='evidence'?['precise','direct','curious']:ending==='protected'?['warm','reflective','lively']:ending==='shared'?['warm','lively','curious']:['reflective','precise'];
  const delta=ending==='falsified'?-3:ending==='compromised'?(t.role==='sponsor'?-2:-1):ending==='repaired'?0:preferred.includes(style)?2:1;
  session.rapport=Math.max(-6,Math.min(6,session.rapport+delta));session.patron.lastProject={id:q.id,title:q.title,day:s.day,outcome:ending,role:t.role};if(ending==='falsified')breakPersonalTrust(s,session,'You filed a false certification on '+q.title+'.');
 }
 if(ending==='falsified'){q.status='failed';q.completedDay=s.day;q.failureReason='falsified';s.profile.xp[q.skill]=Math.max(0,s.profile.xp[q.skill]-3);changeReputation(s,-4,'Filed false evidence on a private project.');changeStationReputation(s,q.port,-3,'A private project ended in false certification.');}
 record(s,`${q.title}: ${privateEndings[ending].title}. ${privateEndings[ending].text}`);
 return privateEndings[ending].text;
}
function validPrivateBranch(q,s){
 const p=q.project;if(p.edition===1)return p.branch===undefined&&p.nextPlan===undefined;
 if(![2,3].includes(p.edition)||!p.branch||!p.nextPlan)return false;const b=p.branch,first=b.first,report=b.report,plan=p.nextPlan;
 if(!str(plan.task,150)||!world.ports.some(v=>v.id===plan.port)||!str(plan.venue,40)||!str(plan.contact,80)||!str(plan.person,120)||!['supply','calibration','review','patrol'].includes(plan.kind)||!integer(plan.days,0,3)||!integer(plan.fee,0,200)||!integer(plan.spares,0,1)||(plan.good?!goods.some(g=>g.id===plan.good)||!integer(plan.quantity,2,4):plan.quantity!==0)||plan.doneDay!==null||plan.baselineVictories!==null)return false;
 for(const [v,allowed,i] of [[first,['verify','care','shortcut'],0],[report,['open','confidential','falsify'],1]])if(v===null?p.steps[i].doneDay!==null:!v||!allowed.includes(v.choice)||v.day!==p.steps[i].doneDay||!integer(v.day,q.acceptedDay??0,s.day))return false;
 if(report&&!first)return false;
 if(!first){if(Object.keys(plan).some(k=>p.steps[1][k]!==plan[k]))return false;}
 else {const expected=privateForkNext(s,q,first.choice),actual=p.steps[1];for(const key of ['task','port','venue','contact','person','good','quantity','spares','days','fee','kind'])if(actual[key]!==expected[key])return false;}
 if(!report)return b.outcome===null&&b.settledDay===null&&q.failureReason===undefined;
 const ending=privateEnding(first.choice,report.choice);if(b.outcome!==ending||b.settledDay!==report.day)return false;
 return ending==='falsified'?q.status==='failed'&&q.failureReason==='falsified'&&q.completedDay===b.settledDay:q.failureReason===undefined;
}

function validPrivateProject(q,s){
 if(!q.project)return q.kind!=='project';const p=q.project;
 if(q.kind!=='project'||q.tier<2||!p||![1,2,3].includes(p.edition)||!str(p.recipe,60)||!Object.entries(privateProjectRecipes).some(([k,v])=>v.some((_,i)=>p.recipe===k+':'+i))||!['direct','precise','warm','wry','curious','reflective','lively'].includes(p.style)||!Array.isArray(p.steps)||p.steps.length!==2)return false;
 let previous=q.acceptedDay??0,unfinished=false;for(const [i,x] of p.steps.entries()){
  if(!x||!str(x.task,150)||!world.ports.some(v=>v.id===x.port)||!['supply','calibration','review','patrol'].includes(x.kind)||!integer(x.days,0,3)||!integer(x.fee,0,200)||!integer(x.spares,0,1)||!str(x.contact,80)||!str(x.person,120))return false;
  const host=stationContacts(x.port,x.venue,s).find(h=>(h.contactID||'')===x.contact);if(!host||host.person!==x.person)return false;
  if(x.good?!goods.some(g=>g.id===x.good)||!integer(x.quantity,2,4):x.quantity!==0)return false;
  if(x.kind==='patrol'?x.baselineVictories!==null&&!integer(x.baselineVictories,0,s.profile.stats.victories):x.baselineVictories!==null)return false;
  if(x.doneDay===null)unfinished=true;else {if(unfinished||q.status==='offered'||!integer(x.doneDay,previous,s.day)||x.doneDay>q.deadline)return false;previous=x.doneDay;}
  if(x.kind==='patrol'&&q.status!=='offered'&&(i===0||p.steps[i-1].doneDay!==null)&&x.baselineVictories===null)return false;
 }
 return (q.status!=='completed'||!unfinished)&&validPrivateBranch(q,s);
}

function buyPersonalSupplies(s,arg){
 const id=arg.id,contact=arg.contact||'',v=relationshipOpportunities(s,id,contact),d=v.deal;check(d&&d.canBuy,'This personal supply allowance is unavailable, unaffordable or will not fit.');check(arg.total===d.total,'The supply quote has changed; review today’s offer.');
 const ledger=ensureDialogue(s),key=dialogueKey(s,id,contact);if(!ledger.sessions[key]){check(Object.keys(ledger.sessions).length<1024,'This voyage has reached its conversation limit.');ledger.sessions[key]={node:'root',rapport:0,resolved:[],outcome:'',insight:false};}const session=ledger.sessions[key];if(!session.patron)session.patron=personalTrustState(s,id,contact);s.credits-=d.total;addFleetCargo(s,d.good,d.quantity,{units:d.quantity,cost:d.total});session.patron.claimedTier=d.tier;record(s,`Personal supply allowance from ${stationContacts(s.location,id,s).find(h=>(h.contactID||'')===contact).person}: ${d.quantity} units of ${d.name.toLowerCase()} for ${d.total} cr. This relationship allowance has been used.`);
}
function validPrivateOutcomeMemory(m,s){if(m===undefined)return true;const q=s.dialogueProgress?.commissions.find(q=>q.id===m?.id);return !!q&&m.title===q.title&&Object.hasOwn(privateEndings,m.outcome)&&q.project?.branch?.outcome===m.outcome&&m.day===q.project.branch.settledDay&&['sponsor','collaborator'].includes(m.role);}
function validPersonalTrust(t,s){
 if(t===undefined)return true;
 return t&&typeof t==='object'&&!Array.isArray(t)&&typeof t.blocked==='boolean'&&typeof t.apologized==='boolean'&&str(t.reason,200)&&integer(t.repairBaseline,0,3001200)&&integer(t.claimedTier,0,2)&&validPrivateOutcomeMemory(t.lastProject,s)&&(t.breachDay===null||integer(t.breachDay,0,s.day))&&(!t.blocked||t.breachDay!==null)&&(t.introducedTo===null?t.introducedDay===null:(venueTypes.some(v=>v[0]===t.introducedTo)||t.introducedTo==='warehouse')&&integer(t.introducedDay,0,s.day));
}

function validateDialogueProgress(s){
 const d=s.dialogueProgress;if(d===undefined||d===null)return;
 check(d&&d.sessions&&typeof d.sessions==='object'&&!Array.isArray(d.sessions)&&Object.keys(d.sessions).length<=1024&&Array.isArray(d.commissions)&&d.commissions.length<=3072,'Invalid dialogue progress.');
 const validContext=key=>{if(typeof key!=='string')return false;const [pid,venue,...rest]=key.split(':');return world.ports.some(p=>p.id===pid)&&(venue==='warehouse'&&!!warehouseFacility(pid)||venueTypes.some(v=>v[0]===venue))&&rest.length===1&&rest[0].length<=80&&/^[a-z0-9-]*$/.test(rest[0]);};
 for(const [key,v] of Object.entries(d.sessions))check(validContext(key)&&v&&(dialogueNodes.includes(v.node)||relicCatalog.some(r=>v.node==='relic-sale-'+r.id))&&integer(v.rapport,-6,6)&&typeof v.insight==='boolean'&&typeof v.outcome==='string'&&v.outcome.length<=500&&Array.isArray(v.resolved)&&v.resolved.length<=Object.keys(dialogueEffects).length&&new Set(v.resolved).size===v.resolved.length&&v.resolved.every(k=>Object.hasOwn(dialogueEffects,k))&&dialogueMemory.valid(v.memory,s)&&validPersonalTrust(v.patron,s),'Invalid dialogue session.');
 check(new Set(d.commissions.map(q=>q.id)).size===d.commissions.length&&new Set(d.commissions.map(q=>q.context+':'+(q.tier||1))).size===d.commissions.length&&d.commissions.filter(q=>q.status==='active').length<=3,'Invalid personal commission ledger.');
 for(const q of d.commissions){check(q&&str(q.id,80)&&validContext(q.context)&&q.context===q.port+':'+q.venue+':'+q.contact&&Object.hasOwn(d.sessions,q.context)&&integer(q.tier||1,1,3)&&['supply','survey','patrol','project'].includes(q.kind)&&str(q.title,200)&&str(q.description,q.project?2000:1000)&&Object.hasOwn(skillNames,q.skill)&&integer(q.reward,1,10000000)&&integer(q.duration,1,2000)&&['offered','active','completed','failed'].includes(q.status)&&typeof q.visitedTarget==='boolean'&&integer(q.baselineVictories,0,1000000),'Invalid personal commission.');
  check(q.kind==='supply'?goods.some(g=>g.id===q.good)&&integer(q.quantity,2,4)&&q.target==null:q.good==null&&q.quantity===0&&(q.kind==='survey'?world.ports.some(p=>p.id===q.target)&&q.target!==q.port:q.target==null),'Invalid commission objective.');check(validPrivateProject(q,s),'Invalid private project.');
  check(q.status==='offered'?q.acceptedDay==null&&q.deadline==null&&q.completedDay==null:integer(q.acceptedDay,0,s.day)&&q.deadline===q.acceptedDay+q.duration&&integer(q.deadline,0,365249)&&(q.status==='active'?q.completedDay==null&&s.day<=q.deadline:integer(q.completedDay,q.acceptedDay,s.day)&&(q.status==='completed'?q.completedDay<=q.deadline:q.failureReason==='falsified'?q.project?.branch?.outcome==='falsified'&&q.completedDay===q.project.branch.settledDay:q.completedDay>q.deadline)),'Invalid commission dates.');
 }
}

// Local creditors enforce their own balance only; visits and previews never collect.
function payBranchDebt(s,pid,amount){
 if(!s.bank)s.bank={deposits:{},loans:[],legacyDebt:s.debt};const b=s.bank,rows=b.loans.filter(l=>l.port===pid).map(loan=>({loan,apr:loanRate(loan,s.day)}));if(pid==='earth')rows.push({loan:null,apr:.04});rows.sort((a,b)=>b.apr-a.apr);let left=amount,paid=0;
 for(const row of rows){const balance=row.loan?row.loan.balance:b.legacyDebt,take=Math.min(left,balance);if(row.loan)row.loan.balance=Math.max(0,balance-take);else b.legacyDebt=Math.max(0,balance-take);left-=take;paid+=take;if(left<1e-8)break;}b.loans=b.loans.filter(l=>l.balance>1e-8);syncDebt(s);return paid;
}
function debtRaidRisk(s,dest,arrivalDay=s.day){
 const b=s.bank||{loans:[],legacyDebt:s.debt},elapsed=Math.max(0,arrivalDay-s.day),balances=new Map();
 for(const l of b.loans)balances.set(l.port,(balances.get(l.port)||0)+l.balance*loanInterestFactor(l,s.day,arrivalDay));if(b.legacyDebt)balances.set('earth',(balances.get('earth')||0)+b.legacyDebt*1.04**(elapsed/365.25));
 const reports=[];for(const [pid,balance] of balances){const limit=bankTerms(pid,s).creditLimit;if(balance<=limit*1.1+1e-7)continue;const distanceKM=patrolSeparation(dest,pid,arrivalDay),proximity=distanceKM>3200000?0:1/(1+(distanceKM/400000)**2),excess=balance/limit-1,bonus=(.03+.22*Math.min(1,(excess-.1)/.9))*proximity;if(bonus>1e-8)reports.push({port:pid,balance,limit,distanceKM,proximity,bonus});}
 reports.sort((a,b)=>b.bonus-a.bonus);return {bonus:reports[0]?.bonus||0,reports};
}
function debtPolicy(s){const limit=bankTerms(s.location,s).creditLimit,fmt=n=>n.toLocaleString('en-US');return `This bank’s current limit is ${fmt(limit)} cr, based on its branch budget and your earned experience, wider reputation and local reputation. Limits can rise or fall as your record changes. Earth also handles original charter and restitution debt. On arrival, cash is collected if this bank is over its limit, targeting ${fmt(limit-1)} cr. If the balance still exceeds ${fmt(limit*1.1)} cr (110% of this limit) after cash collection, owned legal cargo, optional upgrades and then locally berthed ships may be sold until the balance is below the assessed limit. Sales pay this creditor; surplus returns to cash. Restricted cargo is confiscated without credit. Client freight is not sold as your property; losing its carrying ship triggers the existing freight-breach terms. Arrival collection does not seize remote assets. At each chargeable berth, daily fees draw local deposits first, then floating-rate local credit. Earlier fixed agreements remain separate. Above 110% of that branch limit, its lowest-value reserve ships are auctioned to clear that branch debt; surplus becomes a local deposit. Debt more than 10% over this bank’s current limit also raises normal raid risk nearby. Losing every ship ends this voyage.`;}
function debtCollectionOverview(s){const localDebt=branchDebt(s),limit=bankTerms(s.location,s).creditLimit;return {localDebt,limit,target:limit-1,threshold:limit*1.1,overLimit:Math.max(0,localDebt-limit),policy:debtPolicy(s),reports:(s.debtCollections||[]).filter(r=>r.port===s.location).slice(-4),last:(s.debtCollections||[]).at(-1)||null};}
function enforceBranchDebt(s,pid){
 if(s.fleetLoss||branchDebt(s,pid)<=bankTerms(pid,s).creditLimit+1e-8)return;
 const limit=bankTerms(pid,s).creditLimit,target=limit-1,before=branchDebt(s,pid),receipt={id:uuid(),day:s.day,port:pid,limit,before,after:before,cashTaken:0,saleProceeds:0,paid:0,surplus:0,newCharges:0,items:[],summary:''};
 const cash=Math.min(s.credits,Math.ceil(Math.max(0,before-target-1e-8)));s.credits-=cash;receipt.cashTaken=cash;receipt.paid+=payBranchDebt(s,pid,cash);
 const needsSale=branchDebt(s,pid)>limit*1.1+1e-7;
 const locals=()=>[...(s.fleetLoss?[]:[s]),...s.fleet.filter(v=>v.location===pid)];
 const sell=(kind,name,shipID,quantity,value)=>{receipt.items.push({kind,name,shipID,quantity,value});receipt.saleProceeds+=value;const payment=Math.min(value,Math.ceil(Math.max(0,branchDebt(s,pid)-target-1e-8)));receipt.paid+=payBranchDebt(s,pid,payment);const surplus=value-payment;s.credits+=surplus;receipt.surplus+=surplus;};
 // Every pass removes goods, an upgrade level or a hull, so this loop is bounded.
 for(let step=0;needsSale&&branchDebt(s,pid)>target+1e-8&&step<1200;step++){
  const vessels=locals();let handled=false;
  for(const v of vessels){const g=goods.find(g=>(v.cargo[g.id]||0)>freightUnits(v,g.id));if(!g)continue;const available=v.cargo[g.id]-freightUnits(v,g.id),needed=branchDebt(s,pid)-target;let n=available;
   if(tradeTotal(s,g.id,available,false)>=needed){let lo=1,hi=available;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(tradeTotal(s,g.id,mid,false)>=needed)hi=mid;else lo=mid+1;}n=lo;}
   const value=tradeTotal(s,g.id,n,false),name=good(g.id).name;removeCargo(v,g.id,n);s.pressure[pid+':'+g.id]=Math.max(-.3,(s.pressure[pid+':'+g.id]||0)-n*.0015);sell('cargo',name,actorID(s,v),n,value);handled=true;break;
  }
  if(handled)continue;
  for(const v of vessels){for(const u of upgradeCatalog){const level=v.upgrades[u.id]||0;if(!level)continue;const candidate={...v,upgrades:{...v.upgrades,[u.id]:level-1}},next=effectiveShip(candidate);if(!shipCargoFits(candidate)||v.fuel>next.tankTonnes+.001||v.fittingEdition===2&&(v.ammo>shipRules.weaponFits(candidate)[1].magazine||(v.ordnanceAmmo||0)>shipRules.weaponFits(candidate)[2].magazine||!shipRules.cargoAllocation(candidate).loadoutFits))continue;v.upgrades[u.id]--;sell('upgrade',u.name+' level '+level,actorID(s,v),1,Math.floor(fittingCosts(v.shipID,u.id)[level-1]*.5));handled=true;break;}if(handled)break;}
  if(handled)continue;
  const v=vessels.filter(v=>v!==s).sort((a,b)=>Number(a.escort)-Number(b.escort)||effectiveShip(a).price-effectiveShip(b).price)[0]||vessels.find(v=>v===s);if(!v)break;
  if(freightManifests(v).length){const first=freightManifests(v)[0],c=freightContract(s,first.contractID),prior=branchDebt(s,pid);if(c)failFreight(s,'lost',c);const pending=freightReturnJobs(s).find(c=>c.id===first.contractID),returned=freightManifests(v).filter(row=>row.contractID===first.contractID);for(const f of returned){v.cargo[f.good]-=f.units;if(pending)pending.returned[f.good]=(pending.returned[f.good]||0)+f.units;receipt.items.push({kind:'client-return',name:good(f.good).name+' returned to client',shipID:actorID(s,v),quantity:f.units,value:0});}setFreightManifests(v,freightManifests(v).filter(row=>row.contractID!==first.contractID));if(pending){updateFreightReturnReceipt(s,pending);clearFreightReturn(s,pending);}receipt.newCharges+=Math.max(0,branchDebt(s,pid)-prior);continue;}
  for(const g of contrabandGoods){const n=v.cargo[g.id]||0;if(!n)continue;removeCargo(v,g.id,n);receipt.items.push({kind:'confiscated',name:g.name,shipID:actorID(s,v),quantity:n,value:0});changeStationReputation(s,pid,-6,'Restricted cargo seized during debt enforcement.');changeReputation(s,-6,'Restricted cargo confiscated during debt enforcement at '+port(pid).name+'.');}
  const id=actorID(s,v),name=actorName(s,v),value=Math.floor(effectiveShip(v).price*.75*v.hull/100)+Math.floor(equipmentValue(v)*.5)+Math.floor(v.fuel*port(pid).fuelPrice*.5)+v.spares*90+v.ammo*10;
  civilianShipLoss(s,v,true);sell('ship',name+' (hull, remaining fittings and stores)',id,1,value);
  if(v!==s)s.fleet=s.fleet.filter(x=>x.id!==v.id);
  else {const next=s.fleet.find(x=>x.location===pid&&x.hull>0);if(next){promoteShip(s,next);record(s,'Flagship repossessed; command transferred to '+s.shipName+'.');}else{s.hull=0;s.fuel=0;s.cargo={};s.cargoBasis={};delete s.freightCargo;s.upgrades=emptyUpgrades();s.ammo=0;s.spares=0;s.incident=null;s.battle=null;s.fleetLoss={day:s.day,port:pid,reason:'repossession'};}}
 }
 receipt.after=branchDebt(s,pid);receipt.summary=`${port(pid).name}: assessed limit ${limit.toLocaleString('en-US')} cr; collected ${receipt.cashTaken} cr cash; auction proceeds ${receipt.saleProceeds} cr; applied ${receipt.paid.toFixed(2)} cr to this bank; ${receipt.surplus} cr surplus returned. Local debt ${receipt.before.toFixed(2)} → ${receipt.after.toFixed(2)} cr.${receipt.newCharges?' Additional freight claim: '+receipt.newCharges.toFixed(2)+' cr.':''}${s.fleetLoss?(s.fleet.length?' Travelling hulls repossessed; surviving reserves remain at their berths.':' No ships remain. This voyage has ended; begin a new voyage.'):(receipt.after>limit?' Balance remains over limit; further interest and nearby debt-related raid risk may apply.':' Balance is below this bank’s limit.')}`;
 if(receipt.items.some(i=>['cargo','upgrade','ship'].includes(i.kind)))changeStationReputation(s,pid,-2,'Overdue debt required an authority auction.');s.debtCollections=[...(s.debtCollections||[]),receipt].slice(-12);record(s,'Port authority debt enforcement: '+receipt.summary);decision(s,'Port authority collected overdue debt at '+port(pid).name+'.');
}
function validateDebtCollections(s){
 const list=s.debtCollections;if(list==null)return;check(Array.isArray(list)&&list.length<=12&&new Set(list.map(r=>r?.id)).size===list.length,'Invalid debt collection ledger.');
 for(const r of list){check(r&&str(r.id,80)&&integer(r.day,0,s.day)&&world.ports.some(p=>p.id===r.port)&&finite(r.before,0,999999999)&&(r.limit==null||integer(r.limit,1000,Math.max(500000,Math.ceil(500000*CHARTER_CREDIT_SCALE)))&&r.before>r.limit)&&finite(r.after,0,999999999)&&integer(r.cashTaken,0,999999999)&&integer(r.saleProceeds,0,999999999)&&finite(r.paid,0,999999999)&&(r.source==='berth'?finite(r.surplus,0,r.saleProceeds):integer(r.surplus,0,r.saleProceeds))&&(r.source===undefined||r.source==='berth')&&(r.source!=='berth'||r.cashTaken===0&&Math.abs(r.saleProceeds-r.paid-r.surplus)<.001)&&finite(r.newCharges,0,999999999)&&Math.abs(r.before+r.newCharges-r.paid-r.after)<.001&&str(r.summary,2000)&&Array.isArray(r.items)&&r.items.length<=1000&&r.items.every(i=>i&&['cargo','upgrade','ship','confiscated','client-return'].includes(i.kind)&&str(i.name,200)&&str(i.shipID,80)&&integer(i.quantity,1,1000)&&integer(i.value,0,999999999))&&r.items.reduce((n,i)=>n+i.value,0)===r.saleProceeds,'Invalid debt collection receipt.');}
}

// Home registration never relocates ships, clears debts or resets local standing.
function homePort(s){return s.homeBase?.port||'earth';}
function stationStanding(s,pid=s.location){
 const score=s.profile.relationships[pid]||0,publicScore=reputationData(s.profile).score,effective=Math.max(-100,Math.min(100,score+Math.round(publicScore*.25))),home=homePort(s)===pid;
 const label=score>=20?'Trusted locally':score>0?'Good local reputation':score<=-20?'Poor local reputation':score<0?'Strained local reputation':'Neutral local reputation';
 const serviceDiscount=Math.max(-.1,Math.min(.3,(home?.2:0)+(effective>=20?.1:effective<=-20?-.1:0)));
 const reception=effective>=20?'Your record earns a warm welcome and preferred service quotes.':effective<=-20?'Staff are cautious about personal introductions. Public services remain available.':'Staff judge you by your wider record and the promises you keep here.';
 return {port:pid,station:port(pid).name,body:port(pid).body,score,label,publicScore,effective,home,serviceDiscount,reception:(home?'Welcome home, Captain. ':'')+reception,history:(s.stationReputationHistory||[]).filter(r=>r.port===pid).slice(-6)};
}
function changeStationReputation(s,pid,points,reason){
 if(!points)return;
 const p=s.profile,old=p.relationships[pid]||0;let score=old;if(!p.localReputationProgress)p.localReputationProgress={};
 if(points>0){let merit=(p.localReputationProgress[pid]||0)+points*100;while(score<100&&merit>=reputationStep(score,true)){merit-=reputationStep(score,true);score++;}p.localReputationProgress[pid]=Math.min(merit,reputationStep(score,true)-1);}
 else {score=Math.max(-100,old+points);p.localReputationProgress[pid]=0;}
 if(score===old)return;p.relationships[pid]=score;s.stationReputationHistory=[...(s.stationReputationHistory||[]),{day:s.day,port:pid,change:score-old,score,reason}].slice(-100);
}
function servicePrice(s,base){return Math.max(1,Math.ceil(base*(1-serviceDiscount(s))-1e-8));}
function homeBaseOverview(s){
 const id=homePort(s),last=s.homeBase?.moves.at(-1),waitDays=last?Math.max(0,last.day+30-s.day):0,local=stationStanding(s),fee=2500;
 const reason=s.fleetLoss?'Recover command of an owned ship first.':s.incident?'Resolve the current encounter first.':!s.profile.created?'Sign your captain charter first.':id===s.location?'This is already your registered home base.':!destinationAccess(s,s.location).open?'A valid access licence is required.':waitDays?`You can move home again in ${waitDays} days.`:s.credits<fee?'Keep 2,500 cr available for the registry fee.':'';
 return {port:id,station:port(id).name,body:port(id).body,here:id===s.location,fee,waitDays,canMove:!reason,reason,local,benefits:'Reserve ships berth free at your home station. Home clinic care and departure briefings receive a 20% discount, with further service adjustments for reputation. Staff recognize you as a resident. Other fees, access requirements, loans and debt enforcement remain in force.',moves:s.homeBase?.moves||[]};
}
function reputationRoster(s){const known=new Set([...s.visited,...Object.keys(s.profile.relationships),homePort(s)]);return world.ports.filter(p=>known.has(p.id)).map(p=>stationStanding(s,p.id));}
function moveHomeBase(s,arg){
 check(arg.port===s.location,'Register a new home only while docked at that station.');const data=homeBaseOverview(s);check(data.canMove,data.reason);const old=homePort(s);s.credits-=data.fee;s.homeBase={port:s.location,moves:[...(s.homeBase?.moves||[]),{from:old,to:s.location,day:s.day,cost:data.fee}].slice(-40)};record(s,`Home base moved from ${port(old).name} to ${port(s.location).name} for ${data.fee} cr. Local reputation, loans, cargo and ship locations retained. Home reserve berths are free; clinic care and departure briefings receive a 20% resident discount. Next move available on day ${Math.min(365249,s.day+30)}.`);decision(s,'Registered '+port(s.location).name+' as home base.');
}
function validateHomeAndStanding(s){
 const h=s.homeBase;if(h!=null){check(h&&world.ports.some(p=>p.id===h.port)&&Array.isArray(h.moves)&&h.moves.length<=40&&h.moves.every((m,i,a)=>m&&world.ports.some(p=>p.id===m.from)&&world.ports.some(p=>p.id===m.to)&&m.from!==m.to&&m.cost===2500&&integer(m.day,0,s.day)&&(!i||m.day>=a[i-1].day+30&&m.from===a[i-1].to))&&(!h.moves.length||h.moves.at(-1).to===h.port),'Invalid home registration.');}
 const history=s.stationReputationHistory;if(history!=null)check(Array.isArray(history)&&history.length<=100&&history.every((r,i,a)=>r&&integer(r.day,0,s.day)&&(!i||r.day>=a[i-1].day)&&world.ports.some(p=>p.id===r.port)&&integer(r.change,-100,100)&&r.change!==0&&integer(r.score,-100,100)&&integer(r.score-r.change,-100,100)&&str(r.reason,200)),'Invalid station reputation history.');
}


// Tenant consignments remain client-owned and reserve real warehouse capacity.
const warehouseLeaseRecipes={ordinary:{name:'Ordinary storage',goods:['water','food','metals'],level:0,illegal:false},bonded:{name:'Sealed industrial lot',goods:['medicine','electronics','machinery'],level:2,illegal:false},discreet:{name:'Discreet storage',goods:['ai-cores','combat-drones','biocultures'],level:2,illegal:true}};
function warehouseTenantKg(w){return (w?.leaseBook?.contracts||[]).filter(j=>j.status==='active').reduce((n,j)=>n+j.units*cargoSpecs.packing(j.good).grossKgPerLot,0);}
function warehouseLeaseQuote(s,pid,route,cycle=Math.floor(s.day/30)){
 const recipe=warehouseLeaseRecipes[route],facility=warehouseFacility(pid);check(recipe&&facility,'No warehouse lease is offered here.');
 const key=`warehouse-lease-v1:${s.castSeed||'legacy'}:${pid}:${route}:${cycle}`,h=hash(key),id=`lease-v1-${pid}-${route}-${cycle}`,goodID=recipe.goods[Number(h%BigInt(recipe.goods.length))],units=4+4*Number(h/17n%4n),duration=[14,30,60][Number(h/31n%3n)],quotedDay=cycle*30;
 // Monthly fixed terms use the dated public quote, never a later live stock
 // register or a captain's trading/relief receipts. Validation must reproduce
 // signed terms after trading, travel, collection and save/reload.
 const at={...s,location:pid,day:quotedDay},reference={day:quotedDay,location:pid},value=units*(recipe.illegal?illicitQuote(reference,goodID,pid):marketState(reference,goodID,pid)).buy,capital=facility.price*units/40;
 const cost=serviceRouteCost(at,pid,{mass:units*.25}),cap=serviceReward(cost,{cargoValue:value,risk:recipe.illegal?.05:.005}),ordinary=Math.ceil(capital*.24*duration/365.25+Math.min(capital*.12,value*.003)*duration/30),reward=Math.max(10,Math.min(cap,recipe.illegal?Math.ceil(ordinary*3+Math.min(cap*.8,value*.012)*duration/30):ordinary));
 const pack=recipe.illegal?(goodID==='biocultures'?'thermal-sleeve':'spectral-liner'):null,tenant=secretHost(at,{key,port:pid,seed:h,kind:'cargo'}).person;
 return {id,port:pid,route,cycle,good:goodID,name:recipe.name,tenant,units,netKg:units*250,kg:units*cargoSpecs.packing(goodID).grossKgPerLot,volumeM3:units*cargoSpecs.packing(goodID).m3PerLot,duration,reward,value,liability:recipe.illegal?Math.min(value,reward*2):0,illegal:recipe.illegal,pack,open:Number(h/71n%100n)<70};
}
function warehouseLeaseOverview(s,pid=s.location){
 const w=s.warehouses?.[pid],book=w?.leaseBook,contracts=book?.contracts||[],freeKg=w?w.blocks*10000-warehouseMass(w):0,facility=warehouseFacility(pid),local=pid===s.location;
 const active=contracts.filter(j=>['active','due'].includes(j.status)).map(j=>{const q=warehouseLeaseQuote(s,pid,j.route,j.cycle),packCount=q.pack?screeningLots(w,q.pack).length:0,packReady=!!j.cover&&packCount>0;return {...j,name:q.name,illegal:q.illegal,pack:q.pack,packReady,packCount,packing:j.cover?(packReady?'Packing ready · '+packCount:'Packing depleted'):'Unconcealed',canPack:local&&s.profile.created&&j.status==='active'&&q.illegal&&screeningLots(w,q.pack).length>0&&!s.incident&&!s.battle&&!s.fleetLoss};});
 const offers=facility?Object.keys(warehouseLeaseRecipes).map(route=>{const q=warehouseLeaseQuote(s,pid,route),recipe=warehouseLeaseRecipes[route],reason=!local?'Visit this station’s canteen to meet the tenant.':!s.profile.created?'Sign your captain charter first.':s.incident||s.battle||s.fleetLoss?'Resolve the encounter first.':!w?'Purchase local storage here first.':!q.open?'No tenant for this arrangement this month.':earnedLevel(s,'commerce')<recipe.level?'Commerce level '+recipe.level+' required.':route==='bonded'&&commercialStanding(s)<1?'These industrial clients are still working through established operators.':!q.illegal&&!(s.commodityDiscovery?.known||[]).includes(q.good)?'Discover this commodity first.':book?.used[route]===q.cycle?'This month’s tenant has already signed or finished.':contracts.some(j=>j.route===route&&['active','due'].includes(j.status))?'An existing agreement on this route is still open.':freeKg<q.kg||warehouseVolume(w)+q.volumeM3>w.blocks*cargoSpecs.warehouseM3PerBay+1e-8?'Not enough unleased warehouse weight or volume.':s.day+q.duration>=365250?'The term exceeds the simulation calendar.':'';return {...q,reason,canAccept:!reason,canConceal:!reason&&!!q.pack&&screeningLots(w||{},q.pack).length>0};}):[];
 return {port:pid,capacityKg:(w?.blocks||0)*10000,usedKg:w?warehouseMass(w):0,volumeM3:w?warehouseVolume(w):0,capacityM3:(w?.blocks||0)*cargoSpecs.warehouseM3PerBay,leasedKg:warehouseTenantKg(w),freeKg,active,history:contracts.filter(j=>!['active','due'].includes(j.status)),offers};
}
function warehouseLeaseTerms(s,q){
 const pack=q.pack?customsPacks.find(p=>p.id===q.pack).name:'';
 const story=q.route==='ordinary'?'A provisioner is waiting for the next local supply run and needs a dry bay between shifts.':q.route==='bonded'?'An industrial crew needs its sealed maintenance stock held while their workshop is refitted.':'A discreet factor wants an unregistered lot kept off the ordinary forwarding manifest. The host warns that the warehouse owner carries the risk.';
 return story+`\n\n**${q.tenant}** asks to lease **${(q.kg/1000).toFixed(1)} t** at **${port(q.port).name}** for **${q.duration} days**, storing **${q.units} units of ${good(q.good).name.toLowerCase()}**.\n\nThe fixed rent is **${q.reward} cr**, paid to that station’s bank deposit when the tenant collects the lot at term end. The goods remain theirs: you cannot sell, withdraw or pledge them. The space stays reserved until collection.${q.illegal?`\n\nThis is **contraband**. Weekly warehouse checks use local customs activity and your reputation. If caught, the goods are seized, the rent is lost, normal reputation penalties apply, and **${q.liability} cr** liability bills local deposits first, then local credit. **${pack}** stored in this warehouse can conceal this lot; one matching package is consumed per selected inspection and covers all configured tenant lots of that type. Concealment reduces detection; it is not immunity. Once packing runs out, later checks are unprotected.`:'\n\nThe tenant provides a declared legal consignment. No concealment is required.'}${q.reason?'\n\n'+q.reason:''}`;
}
function acceptWarehouseLease(s,route,concealed=false){
 const q=warehouseLeaseOverview(s).offers.find(q=>q.route===route);check(q?.canAccept,q?.reason||'No lease is available.');check(!concealed||q.canConceal,'Store the matching concealment package in this warehouse first.');
 const w=s.warehouses[s.location];if(!w.leaseBook)w.leaseBook={version:1,used:{},contracts:[],lastAuditDay:-1};const book=w.leaseBook;
 book.contracts=[...book.contracts.filter(j=>['active','due'].includes(j.status)),...book.contracts.filter(j=>!['active','due'].includes(j.status)).slice(-24)];
 book.used[route]=q.cycle;const j={id:q.id,route,cycle:q.cycle,good:q.good,tenant:q.tenant,units:q.units,duration:q.duration,reward:q.reward,value:q.value,liability:q.liability,startsDay:s.day,endsDay:s.day+q.duration,status:'active',closedDay:null,paid:0,penalty:0,cover:concealed?q.pack:null};book.contracts.push(j);
 record(s,`Warehouse lease at ${port(s.location).name}: ${q.tenant}, ${q.units} units of ${good(q.good).name}, ${q.kg/1000} t until day ${j.endsDay}; ${q.reward} cr rent due at collection.${q.illegal?' Restricted cargo; '+(concealed?'matching warehouse packing configured.':'accepted without concealment.'):''}`);return j;
}
function warehouseLeasePack(s,arg){
 check(s.profile.created&&arg.port===s.location&&!s.incident&&!s.battle&&!s.fleetLoss,'Visit the local warehouse after resolving the encounter.');const q=warehouseLeaseOverview(s).active.find(j=>j.id===arg.id);check(q?.canPack,'Store a matching concealment package here before configuring this lease.');s.warehouses[s.location].leaseBook.contracts.find(j=>j.id===q.id).cover=q.pack;record(s,`Configured ${customsPacks.find(p=>p.id===q.pack).name} for ${q.tenant}’s warehouse lot at ${port(s.location).name}; packages are consumed only by a selected warehouse inspection.`);
}
function hasWarehouseLeaseAccounting(s){return Object.values(s.warehouses||{}).some(w=>w.leaseBook?.contracts.some(j=>['active','due'].includes(j.status)));}
function advanceWarehouseLeases(s){
 for(const [pid,w] of Object.entries(s.warehouses||{})){
  const book=w.leaseBook;if(!book)continue;
  for(const j of book.contracts){
   if(j.status==='active'&&s.day>=j.endsDay){j.status='due';j.closedDay=j.endsDay;record(s,`Warehouse tenant ${j.tenant} collected ${j.units} units of ${good(j.good).name} at ${port(pid).name}; ${j.units*.25} t released.`);}
   if(j.status==='due'&&(s.bank.deposits[pid]||0)+j.reward<=999999999){s.bank.deposits[pid]=(s.bank.deposits[pid]||0)+j.reward;j.paid=j.reward;j.status='completed';record(s,`Warehouse rent settled at ${port(pid).name}: ${j.reward} cr deposited for ${j.tenant}’s completed lease.`);}
  }
  const illegal=book.contracts.filter(j=>j.status==='active'&&warehouseLeaseRecipes[j.route].illegal),week=Math.floor(s.day/7),auditDay=week*7+Number(hash('warehouse-audit-day:'+pid)%7n);
  if(!illegal.length||s.day!==auditDay||book.lastAuditDay===s.day)continue;book.lastAuditDay=s.day;
  const key=`warehouse-audit-v1:${s.castSeed||'legacy'}:${pid}:${week}`,draw=tag=>Number(hash(key+':'+tag)%1000000n)/1000000;if(draw('selected')>=inspectionChance(pid,s))continue;
  const method=customsMethods[draw('method')<.35?0:draw('method')<.8?1:2],standing=customsStanding(s,pid),gear=new Set();
  for(const p of customsPacks)if(illegal.some(j=>j.cover===p.id)&&screeningLots(w,p.id).length){const lot=screeningLots(w,p.id)[0];w.missionCargo=w.missionCargo.filter(l=>l!==lot);gear.add(p.id);}
  const seized=[];for(const j of illegal){const protectedGear=j.cover&&gear.has(j.cover)?new Set([j.cover]):new Set(),detected=draw('find:'+j.id)<customsDetectionChance(s,j.good,j.units,method,protectedGear);j.inspectedDay=s.day;j.inspection=method.id;j.packingUsed=protectedGear.size?j.cover:null;if(!detected)continue;j.status='seized';j.closedDay=s.day;j.penalty=j.liability;billStationAccount(s,pid,j.liability);seized.push(j);record(s,`Warehouse seizure at ${port(pid).name}: ${j.tenant}’s ${j.units} units of ${good(j.good).name}; rent forfeited, ${j.liability} cr charged to the station bank. ${j.units*.25} t released.`);}
  if(seized.length){changeStationReputation(s,pid,-standing.localPenalty,'Restricted tenant goods seized in your warehouse.');changeReputation(s,-standing.publicPenalty,'Port authority seized contraband from your warehouse at '+port(pid).name+'.');}
  record(s,`${method.name} at ${port(pid).name} warehouse: ${illegal.length} restricted tenant ${illegal.length===1?'lot':'lots'} checked; ${seized.length} seized.${gear.size?' Concealment used: '+[...gear].map(id=>customsPacks.find(p=>p.id===id).name).join(', ')+'.':''}`);
 }
}
function validateWarehouseLeases(s,pid,w){
 const book=w.leaseBook;if(book===undefined)return;
 check(book&&book.version===1&&book.used&&typeof book.used==='object'&&!Array.isArray(book.used)&&Object.entries(book.used).every(([route,cycle])=>warehouseLeaseRecipes[route]&&integer(cycle,0,Math.floor(s.day/30)))&&Array.isArray(book.contracts)&&book.contracts.length<=28&&integer(book.lastAuditDay,-1,s.day),'Invalid warehouse lease register.');
 const ids=new Set(),openRoutes=new Set();for(const j of book.contracts){
  check(j&&warehouseLeaseRecipes[j.route]&&integer(j.cycle,0,Math.floor(s.day/30)),'Invalid lease route.');const q=warehouseLeaseQuote(s,pid,j.route,j.cycle);
  check(j.id===q.id&&!ids.has(j.id)&&q.open&&book.used[j.route]>=j.cycle&&j.good===q.good&&j.units===q.units&&j.duration===q.duration&&j.reward===q.reward&&j.value===q.value&&j.liability===q.liability&&str(j.tenant,100)&&j.tenant.length>0&&integer(j.startsDay,j.cycle*30,Math.min(s.day,j.cycle*30+29))&&j.endsDay===j.startsDay+j.duration&&j.endsDay<365250&&['active','due','completed','seized'].includes(j.status),'Invalid warehouse lease terms.');ids.add(j.id);
  check(j.cover===null||q.illegal&&j.cover===q.pack,'Invalid lease concealment.');check(j.inspectedDay===undefined||integer(j.inspectedDay,j.startsDay+1,Math.min(s.day,j.endsDay-1))&&customsMethods.some(m=>m.id===j.inspection)&&(j.packingUsed===null||j.packingUsed===q.pack),'Invalid warehouse inspection receipt.');
  if(['active','due'].includes(j.status)){check(!openRoutes.has(j.route),'Duplicate open warehouse lease.');openRoutes.add(j.route);}
  check(j.status==='active'?s.day<j.endsDay&&j.closedDay===null&&j.paid===0&&j.penalty===0:j.status==='seized'?q.illegal&&j.closedDay===j.inspectedDay&&integer(j.closedDay,j.startsDay+1,j.endsDay-1)&&j.paid===0&&j.penalty===q.liability:s.day>=j.endsDay&&j.closedDay===j.endsDay&&j.penalty===0&&j.paid===(j.status==='completed'?q.reward:0),'Invalid warehouse lease settlement.');
 }
}

// Stored blocks remain 10-tonne capacity units, including legacy bay purchases.
const warehouseSites={earth:[3500,12],moon:[4500,8],'earth-high':[5000,10],mars:[6500,10],ceres:[7000,12],callisto:[9000,10],ganymede:[10000,8],titan:[11000,10],neptune:[15000,6]};
const warehouseTiers=Object.freeze([
 {tier:1,label:'Tier I',name:'Storage bay',blocks:2,costMultiplier:1},
 {tier:2,label:'Tier II',name:'Storehouse',blocks:8,costMultiplier:5},
 {tier:3,label:'Tier III',name:'Warehouse',blocks:24,costMultiplier:18},
 {tier:4,label:'Tier IV',name:'Freight depot',blocks:80,costMultiplier:65},
 {tier:5,label:'Tier V',name:'Logistics hub',blocks:240,costMultiplier:240}
].map(Object.freeze));
function warehouseFacility(pid){port(pid);const site=warehouseSites[pid];return site?{port:pid,price:site[0],legacyMaxBlocks:site[1],maxBlocks:warehouseTiers.at(-1).blocks,maxTier:warehouseTiers.length,blockKg:10000,blockM3:cargoSpecs.warehouseM3PerBay}:null;}
function warehouseListCost(blocks){const next=warehouseTiers.find(t=>t.blocks>=blocks)||warehouseTiers.at(-1),previous=warehouseTiers[next.tier-2];return (previous?.costMultiplier||0)+(next.costMultiplier-(previous?.costMultiplier||0))*(blocks-(previous?.blocks||0))/(next.blocks-(previous?.blocks||0));}
function warehouseTier(w){return warehouseTiers.filter(t=>t.blocks<=(w?.blocks||0)).at(-1)||{tier:0,label:w?'Legacy storage':'No storage',name:'',blocks:0,costMultiplier:0};}
function warehouseUpgradeQuote(s){
 const f=warehouseFacility(s.location),blocks=s.warehouses?.[s.location]?.blocks||0,target=f?warehouseTiers.find(t=>t.blocks>blocks):null;if(!target)return {target:null,price:0,listPrice:0};
 const listPrice=Math.ceil(f.price*(target.costMultiplier-warehouseListCost(blocks))-1e-9),project=(s.campaign?.concessions||[]).some(c=>c.port===s.location&&c.stage===3&&c.expires>=s.day)?Math.floor(listPrice*.05):0,specialist=s.shipID==='peregrine'&&s.hull>=50&&stationStanding(s).effective>=0?Math.min(5000,Math.floor(listPrice*.15)):0;
 return {target:{...target,capacityKg:target.blocks*10000,capacityM3:target.blocks*cargoSpecs.warehouseM3PerBay,addedKg:(target.blocks-blocks)*10000,addedM3:(target.blocks-blocks)*cargoSpecs.warehouseM3PerBay},listPrice,price:Math.max(1,Math.ceil((listPrice-project-specialist)*(1-captainPerk(s,'warehouseDiscount'))-1e-9))};
}
function warehouseBayPrice(s){return warehouseUpgradeQuote(s).price;}
const warehouseAmmunition=[
 {id:'ammo-coil',type:'coil',name:'Coilgun rounds',slot:'weapons',field:'ammo',kg:shipSpecs.cargoSpace.ammunitionTonnes.round*1000},
 {id:'ammo-cannon',type:'cannon',name:'Autocannon rounds',slot:'weapons',field:'ammo',kg:shipSpecs.cargoSpace.ammunitionTonnes.round*1000},
 {id:'ammo-rail',type:'rail',name:'Railgun rounds',slot:'weapons',field:'ammo',kg:shipSpecs.cargoSpace.ammunitionTonnes.round*1000},
 {id:'ammo-missile',type:'missile',name:'Guided missiles',slot:'ordnance',field:'ordnanceAmmo',kg:shipSpecs.cargoSpace.ammunitionTonnes.missile*1000},
 {id:'ammo-torpedo',type:'torpedo',name:'Heavy torpedoes',slot:'ordnance',field:'ordnanceAmmo',kg:shipSpecs.cargoSpace.ammunitionTonnes.torpedo*1000}
];
function warehouseAmmunitionStock(w){return warehouseAmmunition.map(a=>({id:a.id,type:a.type,name:a.name,units:w.ammunition?.[a.type]||0})).filter(a=>a.units>0).concat(w.ammo>0?[{id:'ammo',type:'legacy',name:'Unsorted kinetic rounds',units:w.ammo}]:[]);}
function warehouseMass(w){return warehouseTenantKg(w)+cargoMass(w)*1000+w.spares*50+w.ammo*15+warehouseAmmunition.reduce((n,a)=>n+(w.ammunition?.[a.type]||0)*a.kg,0)+screeningLots(w).reduce((n,l)=>n+l.mass*1000,0);}
function warehouseVolume(w){return cargoVolume(w)+(w.leaseBook?.contracts||[]).filter(j=>j.status==='active').reduce((n,j)=>n+j.units*cargoSpecs.packing(j.good).m3PerLot,0)+(w.spares||0)*.08+(w.ammo||0)*.03+warehouseAmmunition.reduce((n,a)=>n+(w.ammunition?.[a.type]||0)*a.kg/500,0)+screeningLots(w).reduce((n,l)=>n+l.mass*2,0);}
function warehouseCargoRoom(w,id){return cargoSpecs.room(w.blocks*10-warehouseMass(w)/1000,w.blocks*cargoSpecs.warehouseM3PerBay-warehouseVolume(w),id);}
function warehouseFits(w,legacy=false){if(warehouseMass(w)<=w.blocks*10000+1e-8&&warehouseVolume(w)<=w.blocks*cargoSpecs.warehouseM3PerBay+1e-8)return true;const g=legacy&&w.legacyCargo;return !!g&&finite(g.kg,0,1000000)&&finite(g.m3,0,20000)&&warehouseMass(w)<=g.kg+1e-8&&warehouseVolume(w)<=g.m3+1e-8;}

function warehouseAssets(s){return Object.entries(s.warehouses||{}).map(([pid,w])=>{const facility=warehouseFacility(pid),cargo=goods.filter(g=>(w.cargo[g.id]||0)>0).map(g=>({id:g.id,name:g.name,units:w.cargo[g.id],value:marketState(s,g.id,pid).sell*w.cargo[g.id]})),propertyValue=w.purchaseValue??w.blocks*facility.price,cargoValue=cargo.reduce((n,g)=>n+g.value,0);return {id:pid,station:port(pid).name,body:port(pid).body,blocks:w.blocks,capacityKg:w.blocks*10000,capacityM3:w.blocks*cargoSpecs.warehouseM3PerBay,volumeM3:warehouseVolume(w),usedKg:warehouseMass(w),leasedKg:warehouseTenantKg(w),freeKg:w.blocks*10000-warehouseMass(w),leases:warehouseLeaseOverview(s,pid).active,propertyValue,cargoValue,total:propertyValue+cargoValue,spares:w.spares,ammo:w.ammo,ammunition:warehouseAmmunitionStock(w),screening:customsPacks.map(p=>({id:p.id,name:p.name,count:screeningLots(w,p.id).length})),cargo};});}
function warehouseHost(v){return {...v,id:'warehouse',name:v.name.replace('Exchange','Warehouse'),panel:'Warehouse',role:'Warehouse custodian',business:'Exchange-operated storage for your own legal cargo, cargo-screening packages, engineering spares, coilgun rounds, autocannon rounds, railgun rounds, guided missiles and heavy torpedoes. Buy or upgrade permanent local storage, then load or unload while docked. Ordinary transfers accept your own legal stores. Tenant lots are introduced through canteen lease agreements. No recurring rent.',greeting:`Welcome to our warehouse, Captain. I’m ${v.person}. Your stores stay here until you collect them.`};}
function warehouseVessels(s,selection='active'){
 const local=s.fleetLoss?[]:[s,...s.fleet].filter(v=>(v===s?s.location:v.location)===s.location&&v.hull>0);
 return selection==='active'?local.filter(v=>v===s||v.escort):local.filter(v=>actorID(s,v)===selection);
}
function warehouseItemRoom(s,v,row){
 if(row.kind==='cargo')return shipCargoRoom(v,row.id);
 if(row.kind==='screening')return screeningRoom(s,customsPacks.find(p=>p.id===row.id),[v]);
 if(row.id==='spares')return Math.max(0,effectiveShip(v).maxSpares-v.spares);
 const fit=shipRules.weaponFits(v).find(f=>f.slot===(row.slot||'weapons')),field=row.field||'ammo';if(!fit?.count||row.type&&fit.type!==row.type)return 0;let room=Math.max(0,fit.magazine-(v[field]||0));
 if(v.fittingEdition===2)while(room>0){const candidate={...v,[field]:(v[field]||0)+room};if(shipCargoFits(candidate)&&shipRules.cargoAllocation(candidate).loadoutFits)break;room--;}
 return room;
}
function warehouseOverview(s,selection='active'){
 const facility=warehouseFacility(s.location),w=s.warehouses?.[s.location],upgrade=warehouseUpgradeQuote(s),tier=warehouseTier(w),freeKg=w?w.blocks*10000-warehouseMass(w):0,targets=warehouseVessels(s,selection),local=s.fleetLoss?[]:[s,...s.fleet].filter(v=>(v===s?s.location:v.location)===s.location&&v.hull>0);
 const shipsHere=local.map(v=>({id:actorID(s,v),name:actorName(s,v),active:v===s||v.escort,spares:v.spares,maxSpares:effectiveShip(v).maxSpares,ammo:v.ammo,coilgun:shipRules.weaponFits(v)[1].count>0,magazine:shipRules.weaponFits(v)[1].magazine}));
 const rows=goods.map(g=>({id:g.id,name:g.name,kind:'cargo',kg:cargoSpecs.packing(g.id).grossKgPerLot,m3:cargoSpecs.packing(g.id).m3PerLot,aboard:targets.reduce((n,v)=>n+Math.max(0,(v.cargo[g.id]||0)-freightUnits(v,g.id)),0),stored:w?.cargo[g.id]||0}));
 rows.push({id:'spares',name:'Engineering spares',kind:'supply',kg:50,m3:.08,aboard:targets.reduce((n,v)=>n+v.spares,0),stored:w?.spares||0});
 for(const a of warehouseAmmunition)rows.push({...a,m3:a.kg/500,kind:'ammunition',aboard:targets.reduce((n,v)=>n+(shipRules.weaponFits(v).find(f=>f.slot===a.slot).type===a.type?(v[a.field]||0):0),0),stored:w?.ammunition?.[a.type]||0});
 if(w?.ammo>0)rows.push({id:'ammo',name:'Unsorted kinetic rounds',kind:'legacy-ammunition',slot:'weapons',field:'ammo',kg:15,aboard:0,stored:w.ammo});
 for(const p of customsPacks)rows.push({id:p.id,name:p.name,kind:'screening',kg:p.mass*1000,m3:p.mass*2,aboard:targets.reduce((n,v)=>n+screeningLots(v,p.id).length,0),stored:screeningLots(w||{},p.id).length});
 for(const row of rows){row.maxStore=w&&targets.length&&row.kind!=='legacy-ammunition'?Math.max(0,Math.min(1000,row.aboard,Math.floor(freeKg/row.kg+1e-8),Math.floor(((w?.blocks||0)*cargoSpecs.warehouseM3PerBay-(w?warehouseVolume(w):0))/(row.m3||row.kg/500)+1e-8))):0;if(row.kind==='screening')row.maxStore=Math.min(row.maxStore,100-(w?.missionCargo||[]).length);row.maxTake=w?Math.min(1000,row.stored,targets.reduce((n,v)=>n+warehouseItemRoom(s,v,row),0)):0;}
 const reason=!facility?'This station has no warehouse.':!s.profile.created?'Sign your captain charter first.':s.incident||s.battle||s.fleetLoss?'Resolve the encounter before using station services.':!upgrade.target?'This warehouse is fully upgraded.':s.credits<warehouseBayPrice(s)?'Not enough credits for this storage upgrade.':'';
 return {available:!!facility,port:s.location,station:port(s.location).name,body:port(s.location).body,blocks:w?.blocks||0,maxBlocks:facility?.maxBlocks||0,tier:tier.tier,tierLabel:[tier.label,tier.name].filter(Boolean).join(' · '),maxTier:facility?.maxTier||0,nextTier:upgrade.target,price:upgrade.price,capacityKg:(w?.blocks||0)*10000,usedKg:w?warehouseMass(w):0,volumeM3:w?warehouseVolume(w):0,capacityM3:(w?.blocks||0)*cargoSpecs.warehouseM3PerBay,leasedKg:warehouseTenantKg(w),leases:warehouseLeaseOverview(s).active,freeKg,canBuy:!reason,reason,ships:shipsHere,activeCount:shipsHere.filter(v=>v.active).length,selectedShip:targets.length?selection:'',rows,owned:warehouseAssets(s),terms:'Permanent local storage has five tiers: 20, 80, 240, 800 and 2,400 tonnes, each with four cubic metres per tonne. Upgrade one tier at a time; the quoted price buys the additional space, and varies by station and eligible discounts. Existing cargo and supplies stay in place. There is no recurring rent. Choose the whole active fleet or one owned ship physically at this station; that selection applies to legal cargo, cargo-screening packages, engineering spares and each separate ammunition type. Fleet transfers use compatible holds while preserving specialist space where possible, while individual transfers touch only the selected hull. Transfer quantities are totals for the selection. Cargo purchase costs and package provenance stay with the goods. Packages stored in a warehouse or berthed ship provide no protection to the active fleet. Coilgun rounds, autocannon rounds, railgun rounds, guided missiles and heavy torpedoes stay separate. Ammunition can only be collected into a matching fitted weapon within magazine and remaining hold capacity. Old unsorted kinetic stock remains available for compatible kinetic weapons; new deposits always retain their type. Lasers use ship energy and have no ammunition to store; spares cannot exceed each ship’s allowance. These are your existing supplies, not new purchases. Client-owned freight, restricted goods, installed upgrades and propellant are not accepted. Stores remain local and are excluded from travelling cargo and ship-loss damage. Tenant consignments introduced at the canteen reserve separate space; rent and any inspection liability settle at this station’s bank.'};
}
function warehouseAction(s,type,arg){
 check(arg.port===s.location,'Visit the station whose warehouse you want to use.');const f=warehouseFacility(s.location);check(f,'This station has no warehouse.');check(s.profile.created,'Sign your captain charter first.');check(!s.incident&&!s.battle&&!s.fleetLoss,'Resolve the encounter before using station services.');
 if(type==='warehouse-buy'){
  const quote=warehouseUpgradeQuote(s),price=quote.price,target=quote.target,old=s.warehouses?.[s.location],blocks=old?.blocks||0;check(target,'This warehouse is fully upgraded.');check(arg.tier===undefined||arg.tier===target.tier,'Storage changed. Review the next upgrade.');check(arg.blocks===undefined||arg.blocks===blocks,'Storage changed. Review the next upgrade.');check(arg.price===undefined||arg.price===price,'The storage quote changed. Review the new price.');check(s.credits>=price,'Not enough credits for this storage upgrade.');s.credits-=price;if(!s.warehouses)s.warehouses={};if(!old)s.warehouses[s.location]={blocks:0,cargo:{},cargoBasis:{},cargoPackingEdition:2,spares:0,ammo:0,purchasedDay:s.day};const w=s.warehouses[s.location];
  if(w.storageEdition!==2){w.legacyBlocks=w.blocks;w.legacyPurchaseValue=w.purchaseValue??w.blocks*f.price;w.storageEdition=2;}
  w.purchaseValue=(w.purchaseValue??w.blocks*f.price)+price;w.blocks=target.blocks;record(s,`Purchased ${target.label} ${target.name.toLowerCase()} at ${port(s.location).name}: ${target.capacityKg/1000} t and ${target.capacityM3} m³ total; added ${target.addedKg/1000} t for ${price} cr. Permanent local storage; no recurring rent.`);return;
 }
 const w=s.warehouses?.[s.location];check(w,'Purchase local storage here first.');check(['warehouse-store','warehouse-take'].includes(type),'Unknown warehouse action.');const n=arg.units;check(integer(n,1,1000),'Choose a positive storage quantity.');const selection=arg.ship||'active',targets=warehouseVessels(s,selection);check(targets.length,'Select an owned ship at this station or the active fleet.');const overview=warehouseOverview(s,selection),row=overview.rows.find(r=>r.id===arg.item);check(row,'This warehouse accepts legal trade goods, cargo-screening packages, spares and compatible ammunition only.');const storing=type==='warehouse-store';check(n<=(storing?row.maxStore:row.maxTake),storing?'Not enough owned supplies or free warehouse space.':'Not enough stored items, cargo space or compatible magazine capacity.');
 if(row.kind==='screening'){const p=customsPacks.find(p=>p.id===row.id);if(storing)(w.missionCargo||(w.missionCargo=[])).push(...takeScreeningLots(s,row.id,n,targets));else{const lots=screeningLots(w,row.id).slice(0,n);w.missionCargo=w.missionCargo.filter(l=>!lots.includes(l));loadScreeningLots(s,p,lots,targets);}}
 else if(row.kind==='cargo'){
  let remaining=n;const receipt=storing?null:removeCargo(w,row.id,n);
  for(const v of targets){const room=storing?Math.max(0,(v.cargo[row.id]||0)-freightUnits(v,row.id)):warehouseItemRoom(s,v,row),part=Math.min(remaining,room);if(part>0){if(storing)addCargo(w,row.id,part,removeCargo(v,row.id,part));else addCargo(v,row.id,part,{units:receipt.units*part/n,cost:receipt.cost*part/n});remaining-=part;}if(!remaining)break;}
  check(!remaining,'Selected cargo capacity changed.');
 }else if(row.kind==='ammunition'||row.kind==='legacy-ammunition'){
  if(row.kind==='ammunition'&&!w.ammunition)w.ammunition={};let remaining=n;
  for(const v of targets){const fit=shipRules.weaponFits(v).find(f=>f.slot===row.slot);if(row.type&&fit.type!==row.type)continue;const part=Math.min(remaining,storing?(v[row.field]||0):warehouseItemRoom(s,v,row));if(part){v[row.field]=(v[row.field]||0)+(storing?-part:part);if(row.kind==='legacy-ammunition')w.ammo-=part;else w.ammunition[row.type]=(w.ammunition[row.type]||0)+(storing?part:-part);remaining-=part;}if(!remaining)break;}check(!remaining,'Selected ammunition capacity changed.');
 }else{
  let remaining=n;for(const v of targets){const part=Math.min(remaining,storing?v[row.id]:warehouseItemRoom(s,v,row));if(part){v[row.id]+=storing?-part:part;w[row.id]+=storing?part:-part;remaining-=part;}if(!remaining)break;}check(!remaining,'Selected supply capacity changed.');
 }

 record(s,`${storing?'Stored':'Collected'} ${n} ${row.name.toLowerCase()} at ${port(s.location).name}. ${storing?'Warehouse':'Ship'} inventory updated; no time or credits charged.`);
}
function validateWarehouses(s){
 if(s.warehouses===undefined||s.warehouses===null)return;const sites=s.warehouses;check(sites&&typeof sites==='object'&&!Array.isArray(sites)&&Object.keys(sites).length<=Object.keys(warehouseSites).length,'Invalid warehouse register.');
 for(const [pid,w] of Object.entries(sites)){const f=warehouseSites[pid];validateWarehouseLeases(s,pid,w);check(w&&typeof w==='object'&&!Array.isArray(w),'Invalid warehouse contents.');check(w.ammunition===undefined||w.ammunition&&typeof w.ammunition==='object'&&!Array.isArray(w.ammunition)&&Object.entries(w.ammunition).every(([type,n])=>{const a=warehouseAmmunition.find(a=>a.type===type);return a&&integer(n,0,Math.floor(w.blocks*10000/a.kg));}),'Invalid warehouse ammunition.');const facility=warehouseFacility(pid),tiered=w.storageEdition===2;check(w.storageEdition===undefined||tiered,'Invalid warehouse storage edition.');if(tiered)check(integer(w.legacyBlocks,0,f?.[1]||0)&&integer(w.legacyPurchaseValue,0,w.legacyBlocks*(f?.[0]||0))&&warehouseTiers.some(t=>t.blocks===w.blocks)&&w.blocks>w.legacyBlocks,'Invalid warehouse upgrade record.');
  check(f&&w&&typeof w==='object'&&!Array.isArray(w)&&integer(w.blocks,1,tiered?facility.maxBlocks:f[1])&&integer(w.purchasedDay,0,s.day)&&w.cargo&&typeof w.cargo==='object'&&!Array.isArray(w.cargo)&&Object.entries(w.cargo).every(([id,n])=>goods.some(g=>g.id===id)&&integer(n,0,w.blocks*40))&&integer(w.spares,0,w.blocks*200)&&integer(w.ammo,0,Math.floor(w.blocks*10000/15))&&warehouseFits(w,true),'Invalid warehouse capacity or contents.');check(w.purchaseValue===undefined&&!tiered||integer(w.purchaseValue,tiered?Math.max(1,w.legacyPurchaseValue):1,tiered?w.legacyPurchaseValue+Math.ceil(f[0]*(warehouseListCost(w.blocks)-warehouseListCost(w.legacyBlocks))-1e-9):w.blocks*f[0]),'Invalid warehouse purchase value.');validateCargoBasis(w);}
}


const relicCollectorSites=['earth','moon','earth-high','ceres','callisto','titan','triton'];
function relicCollectorOverview(s,pid=s.location){const host=relicCollectorSites.includes(pid)?stationContacts(pid,'local',s).find(v=>v.contactID):null,cycle=Math.floor(s.day/30),sales=s.cantina?.collectorSales||[];return {port:pid,cycle,host:host?{name:host.person,contact:host.contactID}:null,offers:host?(s.cantina?.relics||[]).map(id=>{const r=relicCatalog.find(r=>r.id===id),sold=sales.some(v=>v.port===pid&&v.cycle===cycle&&v.relic===id);return {id,name:r.name,price:Math.floor(r.price*.45),available:!sold};}):[]};}
function sellNamedRelic(s,id,buyer){const c=ensureCantina(s),r=relicCatalog.find(r=>r.id===id);check(r&&c.relics.includes(id),'You no longer own that relic.');const price=Math.floor(r.price*.45);check(s.credits+price<=999999999,'Deposit cash before selling this relic.');c.grants=[...relicGrants(s)];c.relics=c.relics.filter(r=>r!==id);c.equipped=c.equipped.filter(r=>r!==id);s.credits+=price;record(s,'Sold '+r.name+' to '+buyer+' for '+price+' cr; ownership and its active bonus ended.');return price;}
function sellCollectorRelic(s,id){const c=relicCollectorOverview(s),r=c.offers.find(r=>r.id===id);check(c.host&&r?.available,'This collector cannot take another copy of that relic this month.');sellNamedRelic(s,id,c.host.name);const book=ensureCantina(s);(book.collectorSales||(book.collectorSales=[])).push({port:s.location,cycle:c.cycle,relic:id,day:s.day,price:r.price});book.collectorSales=[...book.collectorSales.filter(v=>v.cycle!==c.cycle).slice(-24),...book.collectorSales.filter(v=>v.cycle===c.cycle)];}

// Persistent, finite relic leads and named travelling specialists. Browsing is read-only.
function relicGrants(s){return new Set([...(s.cantina?.grants||[]),...(s.cantina?.relics||[]),...(s.cantina?.deals||[]).flatMap(d=>d.soldRelics||[])]);}
// Settle equipment with the acquisition, not with browsing or a later unrelated action.
function autoEquipNewRelics(before,s){
 const previous=new Set(before.cantina?.relics||[]),ships=operationShips(s);
 let used=(s.cantina?.equipped.length||0)+ships.reduce((n,v)=>n+(v.missionCargo||[]).filter(l=>l.kind==='antiquity'&&l.artifact.equipped).length,0);
 const activate=(name,equip)=>{if(used>=2){record(s,name+' stowed; both relic slots are in use.');return;}equip();used++;record(s,'Automatically equipped '+name+'.');};
 for(const id of s.cantina?.relics||[])if(!previous.has(id)&&!s.cantina.equipped.includes(id))activate(relicCatalog.find(r=>r.id===id).name,()=>s.cantina.equipped.push(id));
 const eligible=(state,lot)=>lot.kind==='antiquity'&&lot.artifact.appraised&&lot.artifact.genuine&&!state.campaign?.jobs.some(j=>j.chain&&j.status==='active'&&j.artifactID===lot.id);
 const identified=new Set(operationShips(before).flatMap(v=>(v.missionCargo||[]).filter(l=>eligible(before,l)).map(l=>l.id)));
 for(const v of ships)for(const lot of v.missionCargo||[])if(eligible(s,lot)&&!identified.has(lot.id)&&!lot.artifact.equipped)activate('recovered antiquity aboard '+actorName(s,v),()=>{lot.artifact.equipped=true;});
}
function grantRelic(s,id,source){const c=ensureCantina(s),grants=relicGrants(s),fresh=!grants.has(id);c.grants=[...new Set([...grants,id])];if(fresh)c.relics.push(id);record(s,(fresh?'Acquired ':'Already catalogued: ')+relicCatalog.find(r=>r.id===id).name+' · '+source+'. '+(fresh?'Added to the captain’s collection.':'No duplicate relic or cash substitution.'));return fresh;}
function relicHuntQuote(s,method,relic,target,origin=s.location,day=s.day){const r=relicCatalog.find(r=>r.id===relic),state={...s,location:origin,day};const value=Math.floor(r.price*.45),budget=serviceReward(serviceRouteCost(state,method==='discovery'?target:origin,{shipID:method==='battle'?'osprey':'kestrel',returnTrip:method==='discovery',workDays:method==='battle'?3:1}),{work:method==='battle'?3:1,cargoValue:method==='battle'?r.price:0,risk:.1}),required=method==='discovery'?1:Math.max(3,Math.ceil(value/budget)),fee=method==='discovery'?Math.max(150,value-budget):0;return {value,budget,required,fee};}
function relicHuntOffer(s,venue,method){
 if(!['local','relay','security','authority'].includes(venue)||!['discovery','battle','authority'].includes(method)||method==='authority'&&venue!=='authority'||method==='battle'&&!['local','security'].includes(venue)||method==='discovery'&&!['local','relay'].includes(venue))return null;
 const grants=relicGrants(s),pending=new Set((s.cantina?.hunts||[]).map(q=>q.relic)),pool=relicCatalog.filter(r=>!grants.has(r.id)&&!pending.has(r.id));if(!pool.length)return null;
 const r=pool[Number(hash('relic-lead:'+s.castSeed+':'+s.location+':'+method)%BigInt(pool.length))],targets=accessiblePorts(s).filter(p=>p!==s.location).sort((a,b)=>Number(hash('relic-site:'+s.location+':'+a)%1000n)-Number(hash('relic-site:'+s.location+':'+b)%1000n)),target=targets[0];if(!target)return null;
 const {value,budget,required,fee}=relicHuntQuote(s,method,r.id,target);
 const reason=!s.profile.created?'Sign your captain charter first.':(s.cantina?.hunts||[]).some(q=>q.status==='active'&&q.method===method)?'Finish the current '+method+' lead first.':method==='discovery'&&earnedLevel(s,'engineering')<2?'Engineering level 2 is required to restore the instrument.':method==='authority'&&(reputationData(s.profile).score<20||stationStanding(s,s.location).score<10)?'The authority requires 20 wider reputation and 10 local trust.':s.credits<fee?'Keep the quoted restoration contribution available.':'';
 return {id:'relic-hunt-'+r.id,relic:r.id,name:r.name,method,origin:s.location,venue,target:method==='discovery'?target:s.location,required,fee,deadline:null,budget,title:method==='discovery'?'A lost calibration instrument':method==='battle'?'Instruments in raider custody':'A cooperative service distinction',description:method==='discovery'?`Search the archived salvage register at ${stationLabel(target)}, spend one day restoring the instrument, then return it to this ${venue==='relay'?'coordinator':'canteen host'} to document ownership.`:method==='battle'?`Win ${required} new defensive battles encountered during ordinary travel after accepting this lead. Patrol releases ${r.name} from the recovered caches after the final victory. Paid or escaped encounters do not count.`:`Complete ${required} new freight-office deliveries after accepting, then report to this port authority. The cooperative awards ${r.name} for the recorded service.`,terms:method==='discovery'?`${fee} cr restoration contribution paid at acceptance · one work day at the target · ${r.name} on return · No deadline`:`${required} new ${method==='battle'?'defensive victories':'freight deliveries'} · ${r.name} · No deadline`,canAccept:!reason,reason};
}
function relicHuntView(s,q){const progress=q.method==='battle'?q.wins:q.method==='authority'?Math.min(q.required,Math.max(0,s.profile.stats.deliveries-q.baselineDeliveries)):q.found?1:0,here=s.location===q.origin,canRecover=q.status==='active'&&q.method==='discovery'&&!q.found&&s.location===q.target&&s.profile.stats.voyages>q.baselineVoyages;
 return {...q,name:relicCatalog.find(r=>r.id===q.relic).name,progress,canRecover,canComplete:q.status==='active'&&q.method!=='battle'&&here&&progress>=q.required,progressText:q.method==='discovery'?(q.found?'Instrument restored; return to the issuing contact':'Find and restore the instrument at '+port(q.target).name):progress+' / '+q.required+' new '+(q.method==='battle'?'defensive victories':'freight deliveries')};}
function relicHuntOverview(s,venue='local'){return {offers:['discovery','battle','authority'].map(m=>relicHuntOffer(s,venue,m)).filter(Boolean),jobs:(s.cantina?.hunts||[]).map(q=>relicHuntView(s,q))};}
function relicHuntAction(s,type,arg){
 check(s.profile.created&&!s.incident&&!s.battle&&!s.fleetLoss,'Resolve the encounter before handling a relic lead.');const q=s.cantina?.hunts?.find(q=>q.id===arg.id);check(q&&q.status==='active','This relic lead is not active.');const view=relicHuntView(s,q);
 if(type==='relic-hunt-recover'){check(view.canRecover,'Travel to the named target after acceptance and recover the instrument there.');advance(s,1);q.found=true;record(s,'Restored '+view.name+' at '+port(s.location).name+'. Return to '+port(q.origin).name+' to record ownership.');return;}
 check(type==='relic-hunt-complete'&&view.canComplete&&arg.venue===q.venue,'Report to the issuing establishment with the completed objective.');q.status='completed';q.completedDay=s.day;grantRelic(s,q.relic,q.method==='authority'?'port-authority service award':'documented discovery');
}
function acceptRelicHunt(s,venue,method){const q=relicHuntOffer(s,venue,method);check(q?.canAccept,q?.reason||'No unclaimed relic lead is available.');const c=ensureCantina(s);s.credits-=q.fee;const job={...q,acceptedDay:s.day,baselineVoyages:s.profile.stats.voyages,baselineDeliveries:s.profile.stats.deliveries,found:false,wins:0,status:'active',completedDay:null};delete job.reason;delete job.canAccept;(c.hunts||(c.hunts=[])).push(job);record(s,'Accepted '+q.title+': '+q.description+' '+q.terms+'.');return q;}
function relicBattleReward(s,b,outcome){if(outcome!=='victory'||b.origin!=='defense')return;const q=s.cantina?.hunts?.find(q=>q.status==='active'&&q.method==='battle');if(!q)return;q.wins++;if(q.wins>=q.required){q.status='completed';q.completedDay=s.day;grantRelic(s,q.relic,'recovered from raider custody after '+q.required+' defensive victories');}else record(s,'Relic recovery lead: '+q.wins+' / '+q.required+' defensive victories.');}
function validateRelicHunts(s){const c=s.cantina;if(!c)return;const ids=relicCatalog.map(r=>r.id);check(c.grants===undefined||Array.isArray(c.grants)&&c.grants.length<=ids.length&&new Set(c.grants).size===c.grants.length&&c.grants.every(id=>ids.includes(id)),'Invalid relic provenance register.');check(c.collectorSales===undefined||Array.isArray(c.collectorSales)&&c.collectorSales.length<=128&&new Set(c.collectorSales.map(v=>v.port+':'+v.cycle+':'+v.relic)).size===c.collectorSales.length&&c.collectorSales.every(v=>relicCollectorSites.includes(v.port)&&integer(v.cycle,0,Math.floor(s.day/30))&&ids.includes(v.relic)&&integer(v.day,v.cycle*30,Math.min(s.day,v.cycle*30+29))&&v.price===Math.floor(relicCatalog.find(r=>r.id===v.relic).price*.45)),'Invalid collector sales.');if(c.hunts===undefined)return;check(Array.isArray(c.hunts)&&c.hunts.length<=ids.length&&new Set(c.hunts.map(q=>q?.relic)).size===c.hunts.length,'Invalid relic leads.');for(const q of c.hunts){check(q&&q.id==='relic-hunt-'+q.relic&&ids.includes(q.relic)&&['discovery','battle','authority'].includes(q.method)&&world.ports.some(p=>p.id===q.origin)&&world.ports.some(p=>p.id===q.target)&&['local','relay','security','authority'].includes(q.venue)&&q.deadline===null&&integer(q.fee,0,20000)&&integer(q.required,1,100)&&integer(q.acceptedDay,0,s.day)&&integer(q.baselineVoyages,0,s.profile.stats.voyages)&&integer(q.baselineDeliveries,0,s.profile.stats.deliveries)&&integer(q.wins,0,q.required)&&typeof q.found==='boolean'&&str(q.title,200)&&str(q.description,2000)&&str(q.terms,1500)&&['active','completed'].includes(q.status)&&(q.status==='active'?q.completedDay===null:integer(q.completedDay,q.acceptedDay,s.day)&&(c.grants||[]).includes(q.relic)),'Invalid relic lead objective or receipt.');const quote=relicHuntQuote(s,q.method,q.relic,q.target,q.origin,q.acceptedDay);check(q.fee===quote.fee&&q.required===quote.required&&q.budget===quote.budget&&(q.method==='discovery'?q.target!==q.origin:q.target===q.origin)&&(q.method==='authority'?q.venue==='authority':q.method==='battle'?['local','security'].includes(q.venue):['local','relay'].includes(q.venue)),'Relic lead differs from its fixed quote.');}}
// Operational support is independent of earned skills and uses the strongest source per ability.
// Old signed crew agreements are generated by their original edition, unchanged.
const supportSpecialties=[
 {id:'medic',skill:'diplomacy',role:'Ship’s medic',effect:'travelFatigue',step:.08,short:'Crew wellbeing',detail:'Keeps the travelling crew rested and reduces fatigue on long journeys.',history:'Served on a relief tender, organising rest and preventative care through long passages.'},
 {id:'counsellor',skill:'diplomacy',role:'Crew counsellor',effect:'combatFatigue',step:.08,short:'Recovery after combat',detail:'Helps the crew stay ready after the fleet takes hull damage.',history:'Supported rescue crews after difficult recoveries and learned how to keep a shaken watch working together.'},
 {id:'watchkeeper',skill:'engineering',role:'Systems watchkeeper',effect:'incidentRisk',step:.06,short:'Equipment safety',detail:'Spots developing faults and reduces the risk of equipment incidents during travel.',history:'Monitored habitat machinery on remote shifts, catching small faults before they became emergencies.'},
 {id:'belt-pilot',skill:'navigation',role:'Belt pilot',effect:'beltRisk',step:.08,short:'Safer belt crossings',detail:'Helps the fleet avoid debris incidents when crossing an asteroid belt.',history:'Escorted working tenders through drifting rubble and maintained a personal register of dangerous crossings.'},
 {id:'gunner',skill:'navigation',role:'Gunnery officer',effect:'accuracy',step:.01,short:'Weapon accuracy',detail:'Improves the accuracy of the fleet’s attacks in tactical combat.',history:'Trained cooperative patrol crews to identify firing windows while keeping civilian traffic clear.'},
 {id:'marshal',skill:'engineering',role:'Defence marshal',effect:'guardBonus',step:.015,short:'Stronger guard',detail:'Helps guarding ships absorb less hull damage in combat.',history:'Coordinated defensive watches aboard vulnerable supply convoys and practised protecting a damaged hull.'},
 {id:'thermal',skill:'engineering',role:'Thermal technician',effect:'laserCooling',step:1,short:'Cooler weapons',detail:'Reduces the heat generated by laser fire during combat.',history:'Maintained experimental radiator assemblies, then brought those cooling routines to working ships.'},
 {id:'damage-control',skill:'engineering',role:'Damage-control chief',effect:'fieldRepair',step:1,short:'Emergency repairs',detail:'Restores more hull integrity when a ship uses its combat repair action.',history:'Led repair parties on a salvage tender where every spare assembly had to earn its place.'}
];
function crewBenefit(m){const specialty=supportSpecialties.find(v=>v.id===m.specialty);if(specialty)return {short:specialty.short,detail:specialty.detail};return {navigation:{short:'Tactical navigation',detail:'Improves targeting and helps with navigation-based licence discounts.'},engineering:{short:'Prevention & repair',detail:'Helps prevent equipment incidents and improves emergency hull repairs.'},commerce:{short:'Freight negotiation',detail:'Secures better fees on newly accepted freight-office contracts.'},diplomacy:{short:'Peaceful negotiation',detail:'Improves the chance of talking your way past a pirate encounter.'}}[m.skill];}
function supportEffect(s,key){if(s.fleetLoss)return 0;const crew=Math.max(0,...(s.namedCrew?.members||[]).filter(m=>m.releasedDay===null&&m.onDuty&&m.termsVersion===3).map(m=>{const a=supportSpecialties.find(a=>a.id===m.specialty);return a?.effect===key?a.step*crewTier(m).rank:0;})),relic=Math.max(0,...(s.cantina?.equipped||[]).filter(id=>s.cantina.relics.includes(id)).map(id=>{const r=relicCatalog.find(r=>r.id===id);return r?.effect===key?r.power:0;}));return Math.max(crew,relic);}
const crewGrades=[{id:'specialist',name:'Specialist',rank:1,costMultiplier:1},{id:'veteran',name:'Veteran',rank:2,costMultiplier:2},{id:'elite',name:'Elite',rank:3,costMultiplier:4}];
function crewTier(m){return [2,3].includes(m.termsVersion)?crewGrades.find(t=>t.id===m.tier)||crewGrades[0]:crewGrades[0];}
function crewCandidate(s,pid,cycle,index,termsVersion=index<2?2:3){
 const key=pid+':'+cycle+':'+index,h=hash('named-crew:'+s.castSeed+':'+key),skills=Object.keys(skillNames),skill=skills[Number(h%4n)],species=speciesCatalog[Number(h/31n%4n)].id,reserved=new Set(assignedWorld(s).map(v=>v.person));let attempt=0,name;do{name=staffName(species,'crew:'+s.castSeed+':'+key,attempt++);}while(reserved.has(name));
 const budget=serviceReward(serviceRouteCost({...s,location:pid,day:cycle*30},pid,{workDays:7}),{work:7}),roles={navigation:'Navigator',engineering:'Engineer',commerce:'Quartermaster',diplomacy:'Liaison'};
 const common={id:'crew:'+key,port:pid,cycle,index,name,skill,role:roles[skill],species},legacy={fee:Math.ceil(budget*.5),daily:Math.ceil(budget/90),benefit:'+1 effective '+skillNames[skill]+' while on duty; shares the +1-per-skill cap with relics.'};
 if(termsVersion===1)return {...common,...legacy};
 const draw=Number(h/7919n%100n),tier=crewGrades[draw<55?0:draw<85?1:2];
 if(termsVersion===3){const a=supportSpecialties[(Number(hash('crew-specialties:'+s.castSeed+':'+pid+':'+cycle)%8n)+(index-2)*3)%supportSpecialties.length];return {...common,skill:a.skill,role:a.role,termsVersion:3,specialty:a.id,tier:tier.id,fee:legacy.fee*tier.costMultiplier,daily:legacy.daily*tier.costMultiplier,benefit:a.detail};}
 return {...common,termsVersion:2,tier:tier.id,fee:legacy.fee*tier.costMultiplier,daily:legacy.daily*tier.costMultiplier,benefit:'+'+tier.rank+' effective '+skillNames[skill]+' while on duty; the strongest crew or relic bonus applies, up to effective level 10.'};
}
function blockadeQuote(s,origin,destination,day){
 const au=system(port(destination).group).au,tier=au<=2?1:au<=12?2:3,shipID=['','osprey','gannet','gyrfalcon'][tier],workDays=tier+1,reference=ships.find(h=>h.id===shipID),cost=serviceRouteCost({...s,location:origin,day},destination,{shipID,returnTrip:true,workDays});
 const combatReserve=Math.ceil(reference.price*.03)+sparePrice({...s,location:origin})*Math.max(1,Math.ceil(reference.dryMass/25)),reward=Math.ceil(serviceReward(cost,{cargoValue:reference.price,work:workDays,risk:.1,extra:combatReserve})/100)*100;
 return {tier,referenceShip:reference.name,reward,referenceDays:cost.days,combatReserve};
}
const blockadeLifecycle={cycleDays:180,minimumDuration:21,maximumDuration:45,cooldownDays:90,introProtectionDays:365,legacyReliefDays:60};
const blockadeEpisodeCache=new Map(),blockadePhaseCache=new Map();
function blockadeEpisode(s,pid,day=s.day){const r=blockadeLifecycle,start=s.blockadeWorld?.startDay??0;if(day<start||port(pid).group==='earth'&&day<start+r.introProtectionDays)return null;const seed=String(s.castSeed||'legacy'),phaseKey=seed+':'+pid;let phase=blockadePhaseCache.get(phaseKey);if(phase===undefined){if(blockadePhaseCache.size>=4096)blockadePhaseCache.clear();phase=Number(castHashMixed('blockade-phase:'+phaseKey)%BigInt(r.cycleDays));blockadePhaseCache.set(phaseKey,phase);}const cycle=Math.floor((day+phase)/r.cycleDays),key=phaseKey+':'+start+':'+cycle;let episode=blockadeEpisodeCache.get(key);if(episode===undefined){if(blockadeEpisodeCache.size>=4096)blockadeEpisodeCache.clear();const firstDay=cycle*r.cycleDays-phase,end=firstDay+r.minimumDuration+Number(castHashMixed('blockade-duration:'+phaseKey+':'+cycle)%BigInt(r.maximumDuration-r.minimumDuration+1)),risk=blockadeRisk(s,pid,Math.max(start,firstDay)),draw=Number(castHashMixed('blockade-episode:'+phaseKey+':'+cycle)%1000000n)/1000000;episode={firstDay,end,cycle,reported:firstDay>=start&&draw<risk.chance};blockadeEpisodeCache.set(key,episode);}return episode.reported&&day<episode.end?{firstDay:episode.firstDay,end:episode.end,cycle}:null;}
function blockadePresence(s,pid,day=s.day){return !!blockadeEpisode(s,pid,day);}
function blockadeTier(pid){const au=system(port(pid).group).au;return au<=2?1:au<=12?2:3;}
const blockadeRecoveryRules={days:30,maximumPremium:.20,minimumDemandWeight:.5,maximumDemandWeight:1.5};
function blockadeWorldEntry(s,pid){return s.blockadeWorld?.stations.find(e=>e.port===pid);}
function blockadeStation(s,pid,day=s.day){
 const j=s.blockades?.jobs.find(j=>j.destination===pid),w=blockadeWorldEntry(s,pid),cleared=w?.clearedDay??j?.clearedDay,episode=blockadeEpisode(s,pid,day),inBattle=day===s.day&&(s.battle?.stationBlockade===pid||s.incident?.kind==='blockade'&&s.incident.destination===pid);
 if(inBattle)return {status:'blockaded',day:null,id:j?.id,tier:w?.tier||blockadeTier(pid)};
 if(cleared!=null&&day>=cleared&&(!episode||episode.firstDay<cleared+blockadeLifecycle.cooldownDays))return {status:'liberated',day:cleared,origin:j?.origin,id:j?.id,tier:w?.tier||j?.tier||blockadeTier(pid)};
 const relief=w?.reliefDay??(w?.firstDay||0)+blockadeLifecycle.legacyReliefDays,legacy=w&&day>=w.firstDay&&day<Math.min(relief,w.clearedDay??Infinity);
 if(legacy||episode)return {status:'blockaded',day:null,origin:j?.origin,id:j?.id,tier:w?.tier||j?.tier||blockadeTier(pid),reliefDay:legacy?relief:episode.end};
 return null;
}
function blockadePremium(s,pid=s.location){const w=blockadeWorldEntry(s,pid),r=blockadeRecoveryRules,age=w?.clearedDay==null?null:s.day-w.clearedDay;return age!==null&&age>=0&&age<r.days?{daysRemaining:r.days-age,factor:r.maximumPremium*(1-age/r.days),clearedDay:w.clearedDay}:null;}
function blockadeSaleQuote(s,id,pid,quote){
 const recovery=blockadePremium(s,pid);if(!recovery)return {...quote};
 const f=marketEconomy.supply(pid,id,s.day),demand=Math.max(blockadeRecoveryRules.minimumDemandWeight,Math.min(blockadeRecoveryRules.maximumDemandWeight,1+(f.consumption-f.production)/Math.max(1,f.consumption+f.production))),sell=Math.min(quote.buy-1,quote.sellAskCap??quote.buy-1,Math.floor(quote.sell*(1+recovery.factor*demand)));
 return {...quote,sell:Math.max(quote.sell,sell),recoveryPremium:Math.max(0,sell-quote.sell),recoveryDays:recovery.daysRemaining};
}
function blockadeArrival(s,dest,origin){
 if(s.fleetLoss||blockadeStation(s,dest)?.status!=='blockaded')return false;
 const book=s.blockadeWorld||(s.blockadeWorld={version:1,startDay:s.day,stations:[]});let w=blockadeWorldEntry(s,dest);
 if(w&&(w.clearedDay!==null||s.day>=(w.reliefDay??w.firstDay+blockadeLifecycle.legacyReliefDays))){w.firstDay=s.day;w.clearedDay=null;w.attempts=0;}if(!w){w={port:dest,tier:blockadeTier(dest),firstDay:s.day,clearedDay:null,attempts:0,returnPort:origin===dest?(dest==='earth'?'moon':'earth'):origin};book.stations.push(w);}
 if(w.reliefDay===undefined||w.attempts===0)w.reliefDay=blockadeEpisode(s,dest)?.end??w.firstDay+blockadeLifecycle.legacyReliefDays;if(origin!==dest)w.returnPort=origin;check(w.attempts<10000,'This blockade sortie register is full.');w.attempts++;
 s.location=dest;for(const v of s.fleet.filter(v=>v.escort))v.location=dest;
 const j=s.blockades?.jobs.find(j=>j.destination===dest&&['active','withdrawn'].includes(j.status));if(j){check(j.attempts<10000,'This sortie register is full.');j.attempts++;}
 startBattle(s,'raid',{id:'blockade-'+dest+'-sortie',tier:w.tier,title:'Break the blockade of '+port(dest).name,reward:0});s.battle.stationBlockade=dest;if(j)s.battle.blockadeID=j.id;
 s.battle.log.push('Station blockade: destroy the entire hostile formation to dock. Commission acceptance does not affect this encounter.');record(s,'Arrival intercepted by the blockade of '+port(dest).name+'. Station services remain closed until every raider is defeated.');return true;
}
function blockadeRecovery(s){const w=blockadeWorldEntry(s,s.incident?.destination||s.location);check(w&&w.clearedDay===null,'No blockade withdrawal is waiting.');const q=quote(s,w.returnPort),days=q.coastDays+q.waitDays,cost=Math.ceil(fuelCost(q.burn,s.location)+q.provisions+q.berth+900*actors(s).length);return {port:w.returnPort,days,cost};}
function blockadeHoldingIncident(s,pid){s.incident={id:uuid(),kind:'blockade',destination:pid,title:'Blockade still holds',detail:'The civilian docks at '+port(pid).name+' remain closed. Defeat every blockading raider to enter. You can launch another attempt, or arrange a paid withdrawal to your departure station. A retreat, surrender or dispersed formation does not liberate the station.',damage:0,delay:0};}

function blockadeReason(s){return !s.profile.created?'Sign your captain charter first.':s.incident||s.battle||s.fleetLoss?'Resolve the current encounter first.':earnedLevel(s,'navigation')<1?'Navigation level 1 is required.':s.hull<50?'Repair the flagship to at least 50% integrity.':!actors(s).some(v=>v.hull>=50&&shipRules.weaponFits(v).some(w=>w.count>0))?'Bring an operational armed ship at 50% integrity or better.':'';}
// Public station reports use an independent fixed draw per reporting period.
// Earth distance uses the same orbital geometry as patrol coverage; inner Earth
// stations share the protected local area. Accepted missions never expire here.
const blockadeRiskRules={reportDays:30,minimumChance:.025,maximumChance:.60,distanceScaleAU:8};
function blockadeRisk(s,pid,day=s.day){const r=blockadeRiskRules,period=Math.floor(day/r.reportDays),reportDay=period*r.reportDays,distanceAU=port(pid).group==='earth'?0:patrolSeparation('earth',pid,reportDay)/149597870.7,chance=r.minimumChance+(r.maximumChance-r.minimumChance)*(1-Math.exp(-distanceAU/r.distanceScaleAU));return {period,reportDay,distanceAU,chance};}
function blockadeReport(s,pid){const risk=blockadeRisk(s,pid);return {...risk,reported:blockadeStation(s,pid)?.status==='blockaded',reliefDay:blockadeStation(s,pid)?.reliefDay??null};}
function blockadeOffers(s){
 if(!s.profile.created)return [];const busy=(s.blockades?.jobs||[]).some(j=>['active','cleared'].includes(j.status)),jobs=s.blockades?.jobs||[],reason=blockadeReason(s);
 const resumable=jobs.filter(j=>j.status==='withdrawn'&&j.origin===s.location).map(j=>port(j.destination)),nearby=world.ports.filter(p=>p.id!==s.location&&destinationAccess(s,p.id).open&&!jobs.some(j=>j.destination===p.id)&&blockadeWorldEntry(s,p.id)?.clearedDay==null).map(p=>({p,days:routeTransfer(s,p.id).coastDays})).sort((a,b)=>a.days-b.days||a.p.id.localeCompare(b.p.id)).slice(0,2).map(v=>v.p).filter(p=>blockadeStation(s,p.id)?.status==='blockaded');return [...resumable,...nearby].flatMap(p=>{
  const previous=jobs.find(j=>j.destination===p.id);if(previous&&previous.origin!==s.location)return [];
  const quote=previous?{tier:previous.tier,referenceShip:previous.referenceShip,reward:previous.reward,referenceDays:previous.referenceDays,combatReserve:previous.combatReserve}:blockadeQuote(s,s.location,p.id,s.day),blocked=busy?'Finish or withdraw from your current liberation mission.':reason;
  return [{id:'blockade-'+p.id,title:'Liberate '+p.name,origin:s.location,destination:p.id,...quote,deadline:null,description:'An armed cordon is holding the civilian approaches to '+p.name+'. Arrival at this station forces a battle with the blockade, whether or not you accept a commission. Defeat every raider before docking. Destroy the entire hostile formation and return to the issuing authority for payment.',resuming:!!previous,canAccept:!blocked,reason:blocked}];
 });
}
function blockadeView(s,j){const here=s.location===j.destination,reason=blockadeReason(s);return {...clone(j),title:'Liberate '+port(j.destination).name,deadline:null,nextPort:j.status==='cleared'?j.origin:j.destination,canEngage:j.status==='active'&&here&&!reason&&blockadeStation(s,j.destination)?.status==='blockaded',canClaim:j.status==='cleared'&&s.location===j.origin&&!s.incident&&!s.battle&&!s.fleetLoss,reason:reason||(!here?'Travel to the blockaded station.':''),progress:['active','withdrawn'].includes(j.status)&&blockadeStation(s,j.destination)?.status!=='blockaded'?'Patrol relief has reopened the approach. This commission remains unpaid; return if a new blockade forms.':j.status==='cleared'?'Station liberated. Return to '+port(j.origin).name+' to claim the agreed payment.':j.status==='completed'?'Station liberated; authority payment received.':j.status==='withdrawn'?'Mission withdrawn; the blockade remains. Resume at '+port(j.origin).name+'.':'Defeat the '+(j.tier===1?2:3)+' blockading ships at '+port(j.destination).name+'. Retreating or dispersing the enemy does not free the station.'};}
function blockadeOverview(s){const jobs=(s.blockades?.jobs||[]).map(j=>blockadeView(s,j));return {offers:blockadeOffers(s),active:jobs.filter(j=>['active','cleared'].includes(j.status)),history:jobs.filter(j=>j.status==='completed'),withdrawn:jobs.filter(j=>j.status==='withdrawn'),liberated:new Set([...jobs.filter(j=>j.clearedDay!==null).map(j=>j.destination),...(s.blockadeWorld?.stations||[]).filter(w=>w.clearedDay!==null).map(w=>w.port)]).size};}
function blockadeAction(s,type,arg){
 check(!blockadeReason(s)||type==='blockade-claim'||type==='blockade-withdraw',blockadeReason(s));check(s.profile.created&&!s.incident&&!s.battle&&!s.fleetLoss,'Handle liberation missions while safely docked.');
 if(type==='blockade-accept'){check(arg.venue==='authority','Accept this commission at the Port Authority.');const offer=blockadeOffers(s).find(j=>j.id===arg.id);check(offer?.canAccept,offer?.reason||'This liberation mission is not available at this authority.');const register=s.blockades||(s.blockades={version:1,jobs:[]}),prior=register.jobs.find(j=>j.id===offer.id);if(prior)prior.status='active';else register.jobs.push({id:offer.id,origin:offer.origin,destination:offer.destination,tier:offer.tier,referenceShip:offer.referenceShip,reward:offer.reward,referenceDays:offer.referenceDays,combatReserve:offer.combatReserve,acceptedDay:s.day,status:'active',attempts:0,clearedDay:null,paidDay:null});record(s,(prior?'Resumed':'Accepted')+' liberation commission: free '+port(offer.destination).name+' from its blockade. '+offer.reward+' cr on return to '+port(offer.origin).name+' after confirmed victory. No expiry.');return;}
 const j=s.blockades?.jobs.find(j=>j.id===arg.id);check(j,'Unknown liberation mission.');
 if(type==='blockade-withdraw'){check(j.status==='active'&&arg.venue==='authority','Withdraw from an active mission at a Port Authority.');j.status='withdrawn';record(s,'Withdrew from the liberation of '+port(j.destination).name+'. The blockade remains; the issuing authority can resume the same commission.');return;}
 if(type==='blockade-engage'){check(blockadeStation(s,j.destination)?.status==='blockaded','Patrol relief has reopened this station. The commission can resume if a new blockade forms.');check(arg.venue==='authority'&&blockadeView(s,j).canEngage,'Travel to the target Port Authority with an operational armed fleet.');check(j.attempts<10000,'This sortie register is full.');j.attempts++;startBattle(s,'raid',{id:j.id+'-sortie',tier:j.tier,title:'Break the blockade of '+port(j.destination).name,reward:0});s.battle.blockadeID=j.id;s.battle.log.push('Liberation commission: destroy every hostile ship. Authority payment is claimed separately after victory.');return;}
 check(type==='blockade-claim'&&arg.venue==='authority'&&blockadeView(s,j).canClaim,'Return to the issuing Port Authority after freeing the station.');check(s.credits+j.reward<=999999999,'Deposit cash before claiming the full payment.');s.credits+=j.reward;j.status='completed';j.paidDay=s.day;changeReputation(s,2,'Completed the liberation of '+port(j.destination).name+'.');changeStationReputation(s,j.origin,2,'Reported a liberated station.');earn(s,'diplomacy',15);record(s,'Liberation complete: '+port(j.destination).name+' is free. '+port(j.origin).name+' paid '+j.reward+' cr. This station’s liberation commission is permanently settled.');
}
function blockadeBattleOutcome(s,b,outcome){
 if(!b.blockadeID&&!b.stationBlockade)return;
 const j=b.blockadeID?s.blockades?.jobs.find(j=>j.id===b.blockadeID):null;
 if(b.blockadeID)check(j&&['active','withdrawn'].includes(j.status)&&j.destination===b.destination,'The blockade battle has no matching commission.');
 const book=s.blockadeWorld||(s.blockadeWorld={version:1,startDay:s.day,stations:[]});let w=blockadeWorldEntry(s,b.destination);
 if(!w){w={port:b.destination,tier:blockadeTier(b.destination),firstDay:s.day,clearedDay:null,attempts:1,returnPort:j.origin};book.stations.push(w);}
 if(outcome==='victory'){w.clearedDay=s.day;if(j){j.status='cleared';j.clearedDay=s.day;}record(s,'Blockade broken: '+port(b.destination).name+' is liberated. Exchange recovery premiums last '+blockadeRecoveryRules.days+' days, taper with time and reflect local consumption.'+(j?' Claim '+j.reward+' cr at '+port(j.origin).name+' Port Authority.':''));}
 else record(s,'The blockade of '+port(b.destination).name+' remains. No docking, recovery premium or liberation payment earned.');
}
function validateBlockadeWorld(s){
 const r=s.blockadeWorld,ports=new Set(world.ports.map(p=>p.id));
 if(r===undefined){check(!s.battle?.stationBlockade&&s.incident?.kind!=='blockade','Missing station blockade state.');return;}
 check(r&&r.version===1&&integer(r.startDay,0,s.day)&&Array.isArray(r.stations)&&r.stations.length<=ports.size&&new Set(r.stations.map(w=>w?.port)).size===r.stations.length,'Invalid station blockade register.');
 for(const w of r.stations){check(w&&ports.has(w.port)&&ports.has(w.returnPort)&&w.port!==w.returnPort&&w.tier===blockadeTier(w.port)&&integer(w.firstDay,r.startDay,s.day)&&integer(w.attempts,1,10000)&&(w.clearedDay===null||integer(w.clearedDay,w.firstDay,s.day)&&s.completedRaids.includes('blockade-'+w.port+'-sortie')),'Invalid station blockade receipt.');check(w.reliefDay===undefined||integer(w.reliefDay,w.firstDay+1,w.firstDay+blockadeLifecycle.legacyReliefDays),'Invalid blockade relief schedule.');const j=s.blockades?.jobs.find(j=>j.destination===w.port);if(j&&w.clearedDay!==null&&j.status!=='completed')check(j.clearedDay===w.clearedDay,'Station and commission liberation dates disagree.');}
 if(s.battle?.stationBlockade){const b=s.battle,w=blockadeWorldEntry(s,b.stationBlockade);check(w&&w.clearedDay===null&&s.location===w.port&&b.destination===w.port&&b.origin==='raid'&&b.id==='blockade-'+w.port+'-sortie'&&b.reward===0&&!b.bountyID,'Invalid mandatory blockade battle.');}
 if(s.incident?.kind==='blockade'){const w=blockadeWorldEntry(s,s.incident.destination);check(w&&w.clearedDay===null&&s.location===w.port&&!s.battle&&!s.fleetLoss,'Invalid blockade holding approach.');}
}

function validateBlockades(s){
 validateBlockadeWorld(s);
 const r=s.blockades;if(r===undefined){check(!s.battle?.blockadeID,'Missing blockade commission.');return;}check(r&&r.version===1&&Array.isArray(r.jobs)&&r.jobs.length<=world.ports.length&&new Set(r.jobs.map(j=>j?.destination)).size===r.jobs.length,'Invalid blockade register.');
 for(const j of r.jobs){check(j&&world.ports.some(p=>p.id===j.origin)&&world.ports.some(p=>p.id===j.destination)&&j.origin!==j.destination&&j.id==='blockade-'+j.destination&&integer(j.acceptedDay,0,s.day)&&integer(j.attempts,0,10000)&&['active','cleared','completed','withdrawn'].includes(j.status),'Invalid liberation commission.');const q=blockadeQuote(s,j.origin,j.destination,j.acceptedDay);check(['tier','referenceShip','reward','referenceDays','combatReserve'].every(k=>j[k]===q[k]),'Liberation payment differs from its accepted service budget.');const freed=['cleared','completed'].includes(j.status);check(freed?integer(j.clearedDay,j.acceptedDay,s.day)&&j.attempts>0&&s.completedRaids.includes(j.id+'-sortie'):j.clearedDay===null,'Invalid liberation receipt.');check(j.status==='completed'?integer(j.paidDay,j.clearedDay,s.day):j.paidDay===null,'Invalid liberation payment receipt.');}
 check(r.jobs.filter(j=>j.status==='active').length<=1,'Only one liberation commission may be active.');if(s.battle?.blockadeID){const b=s.battle,j=r.jobs.find(j=>j.id===b.blockadeID);check(j&&['active','withdrawn'].includes(j.status)&&s.location===j.destination&&b.origin==='raid'&&b.destination===j.destination&&b.id===j.id+'-sortie'&&b.reward===0&&!b.bountyID,'Invalid blockade sortie.');}
}
// Each traveller has one brief visit in a monthly identity batch. The first enquiry
// records the captain's career for this ten-day window, so browsing cannot reroll it.
const crewEncounterRules={windowDays:10,visitMinDays:3,visitMaxDays:7,maxVisitors:2,baseChance:.28,experienceWeight:.12,eventWeight:.14,shipHistoryWeight:.10,reputationWeight:.08,localTrustWeight:.04,poorReputationPenalty:.12,breachPenalty:.08,baseMinimum:.12,baseMaximum:.78,finalMinimum:.02,finalMaximum:.9};
function crewAcquiredClasses(s){const stock=s.shipyardStock,keys=stock?.version===1?Object.keys(stock.bought):Object.keys(stock?.purchases||{});return [...new Set([...(s.crewEncounters?.classes||[]),s.shipID,...(s.fleet||[]).map(v=>v.shipID),...(s.registryShips||[]).map(r=>r.vessel.shipID),...(s.shipLosses||[]).map(v=>v.shipID),...keys.map(k=>k.split(':')[1])])].filter(id=>ships.some(h=>h.id===id)).sort();}
function crewEncounterContext(s){const p=s.profile,stats=p.stats,completed=(s.campaign?.jobs||[]).filter(j=>j.status==='completed'),classes=crewAcquiredClasses(s);return {levels:Object.fromEntries(Object.keys(skillNames).map(k=>[k,earnedLevel(s,k)])),events:{voyages:stats.voyages,deliveries:stats.deliveries,victories:stats.victories||0,battles:stats.battles||0,repairs:stats.repairs,aid:stats.aid,negotiations:stats.negotiations,tradeLots:Math.floor(stats.unitsSold/20),passengers:s.civilian?.completedPassengers||0,studies:s.stationServices?.completedStudies||0,liberations:new Set([...(s.blockades?.jobs||[]).filter(j=>j.clearedDay!==null).map(j=>j.destination),...(s.blockadeWorld?.stations||[]).filter(w=>w.clearedDay!==null).map(w=>w.port)]).size,commissions:(s.dialogueProgress?.commissions||[]).filter(j=>j.status==='completed').length+(s.cantina?.quests||[]).filter(j=>j.status==='completed').length+completed.length,rescues:completed.filter(j=>j.patient||['response','recovery','medical-evacuation','convoy-rescue'].includes(j.kind)).length,surveys:(s.civilian?.sites||[]).length+(s.cantina?.hunts||[]).filter(j=>j.method==='discovery'&&j.status==='completed').length,losses:(s.shipLosses||[]).length,breaches:s.freightStanding?.failures||0},classes,reputation:reputationData(p).score,localTrust:stationStanding(s,s.location).score};}
function crewEncounterChance(context,c){
 const r=crewEncounterRules,e=context.events,l=context.levels,cap=n=>Math.max(0,Math.min(1,n)),career=cap((e.voyages+e.deliveries+e.victories+e.aid+e.passengers+e.liberations*3+e.commissions)/40),experience=Math.max(...Object.values(l))/10;
 const base=Math.max(r.baseMinimum,Math.min(r.baseMaximum,r.baseChance+r.experienceWeight*experience+r.eventWeight*career+r.shipHistoryWeight*cap((context.classes.length-1)/7)+r.reputationWeight*cap(context.reputation/100)+r.localTrustWeight*cap(context.localTrust/100)-r.poorReputationPenalty*cap(-context.reputation/100)-r.breachPenalty*cap(e.breaches/4)));
 const role=c.specialty||c.skill,activity={navigation:e.voyages+e.surveys,engineering:e.repairs+e.studies,commerce:e.deliveries+e.tradeLots+e.passengers,diplomacy:e.aid+e.negotiations+e.commissions,medic:e.aid+e.studies+e.passengers+e.rescues,counsellor:e.battles+e.rescues+e.losses*2,watchkeeper:e.repairs+e.studies,'belt-pilot':e.voyages+e.surveys,gunner:e.victories+e.liberations*3,marshal:e.victories+e.rescues+e.liberations,thermal:e.repairs+e.victories,'damage-control':e.repairs+e.battles+e.rescues+e.losses}[role]||0;
 const hulls={navigation:['swift','kestrel','merlin'],engineering:['crane','cormorant','osprey','rook'],commerce:['peregrine','pelican','albatross','tern'],diplomacy:['curlew','ibis','condor'],medic:['ibis'],counsellor:['curlew','pelican','ibis'],watchkeeper:['crane','cormorant'],'belt-pilot':['heron','sanderling','petrel'],gunner:['gyrfalcon','merlin','osprey','nightjar'],marshal:['gannet','condor'],thermal:['osprey','crane'],'damage-control':['crane','cormorant','gannet']}[role]||[];
 const affinity=1+.6*cap(activity/10)+.35*Number(context.classes.some(id=>hulls.includes(id))),skill=.75+.05*l[c.skill],rank=crewTier(c).rank,grade=rank===1?1:rank===2?.5+.5*experience+.1*career:.12+.7*experience+.18*career;
 return Math.max(r.finalMinimum,Math.min(r.finalMaximum,base*affinity*skill*grade));
}
function crewEncounterModel(s){
 const r=crewEncounterRules,window=Math.floor(s.day/r.windowDays),prior=s.crewEncounters?.visits.find(v=>v.port===s.location&&v.window===window),context=prior?.context||crewEncounterContext(s),cycle=Math.floor(s.day/30),pool=Array.from({length:6},(_,i)=>crewCandidate(s,s.location,cycle,i)),order=pool.map(c=>({index:c.index,h:hash('crew-visit-order:'+s.castSeed+':'+s.location+':'+cycle+':'+c.index)})).sort((a,b)=>a.h<b.h?-1:a.h>b.h?1:a.index-b.index),phase=window%3;
 const visits=order.slice(phase*2,phase*2+2).map(({index})=>{const c=pool[index],key='crew-visit:'+s.castSeed+':'+s.location+':'+cycle+':'+index,h=hash(key),duration=r.visitMinDays+Number(hash(key+':duration')%BigInt(r.visitMaxDays-r.visitMinDays+1)),starts=window*r.windowDays+Number(hash(key+':arrival')%BigInt(r.windowDays-duration+1)),ends=Math.min(365249,starts+duration-1),chance=crewEncounterChance(context,c),draw=Number(h%1000000n)/1000000;return {...c,visitFrom:starts,visitUntil:ends,chance,appears:draw<chance};});
 return {window,port:s.location,context,frozen:!!prior,visits,candidates:visits.filter(c=>commercialStanding(s)>=crewTier(c).rank-1&&c.appears&&s.day>=c.visitFrom&&s.day<=c.visitUntil&&!(s.namedCrew?.hired||[]).includes(c.id)).map(({chance,appears,...c})=>c)};
}
function discoverCrew(s){const model=crewEncounterModel(s),book=s.crewEncounters||(s.crewEncounters={version:1,classes:crewAcquiredClasses(s),visits:[]});book.classes=crewAcquiredClasses(s);if(!model.frozen){book.visits.push({port:s.location,window:model.window,day:s.day,context:clone(model.context)});book.visits=[...book.visits.filter(v=>v.window!==model.window).slice(-78),...book.visits.filter(v=>v.window===model.window)];for(const c of model.candidates)record(s,'Met '+c.name+', '+c.role.toLowerCase()+', through the commons at '+port(s.location).name+'. Visiting through day '+c.visitUntil+'; no hiring agreement yet.');}return crewOverview(s);}
function validateCrewEncounters(s){const b=s.crewEncounters;if(b===undefined)return;const known=id=>ships.some(h=>h.id===id),classes=a=>Array.isArray(a)&&a.length<=ships.length&&new Set(a).size===a.length&&a.every(known);check(b&&b.version===1&&classes(b.classes)&&Array.isArray(b.visits)&&b.visits.length<=104&&new Set(b.visits.map(v=>v?.port+':'+v?.window)).size===b.visits.length,'Invalid crew encounter register.');for(const v of b.visits){const c=v?.context;check(v&&world.ports.some(p=>p.id===v.port)&&integer(v.window,0,Math.floor(s.day/10))&&integer(v.day,v.window*10,Math.min(s.day,v.window*10+9))&&c&&classes(c.classes)&&c.classes.every(id=>b.classes.includes(id))&&c.levels&&Object.keys(c.levels).length===4&&Object.keys(skillNames).every(k=>integer(c.levels[k],0,10))&&c.events&&Object.keys(c.events).length===16&&['voyages','deliveries','victories','battles','repairs','aid','negotiations','tradeLots','passengers','studies','liberations','commissions','rescues','surveys','losses','breaches'].every(k=>integer(c.events[k],0,1000000))&&integer(c.reputation,-100,100)&&integer(c.localTrust,-100,100),'Invalid frozen crew encounter context.');}}
function crewDaily(s){return (s.namedCrew?.members||[]).filter(m=>m.releasedDay===null).reduce((n,m)=>n+m.daily,0);}
function crewBonus(s,skill){return s.fleetLoss?0:Math.max(0,...(s.namedCrew?.members||[]).filter(m=>m.releasedDay===null&&m.onDuty&&m.termsVersion!==3&&m.skill===skill).map(m=>crewTier(m).rank));}
function crewOverview(s){const members=(s.namedCrew?.members||[]).filter(m=>m.releasedDay===null),encounter=crewEncounterModel(s);return {slots:4,dutySlots:2,members,daily:crewDaily(s),candidates:encounter.candidates};}
function hireCrew(s,id){const c=crewOverview(s).candidates.find(c=>c.id===id);check(c,'That candidate has left or has already signed on.');check(crewOverview(s).members.length<4,'There are four named crew berths. Release a specialist before hiring another.');check(s.credits>=c.fee,'Keep the quoted signing fee available.');check((s.namedCrew?.hired.length||0)<500,'The named crew hiring register is full.');const roster=s.namedCrew||(s.namedCrew={members:[],hired:[]}),onDuty=roster.members.filter(m=>m.releasedDay===null&&m.onDuty).length<2&&!roster.members.some(m=>m.releasedDay===null&&m.onDuty&&m.skill===c.skill);s.credits-=c.fee;roster.members.push({...crewCandidate(s,c.port,c.cycle,c.index,c.termsVersion),hiredDay:s.day,releasedDay:null,onDuty});roster.hired.push(id);careerDevelopment.hired(s,roster.members.at(-1));roster.members=[...roster.members.filter(m=>m.releasedDay!==null).slice(-40),...roster.members.filter(m=>m.releasedDay===null)];record(s,c.name+' signed on as '+crewTier(c).name.toLowerCase()+' '+c.role.toLowerCase()+' for '+c.fee+' cr; '+c.daily+' cr per day, including off-duty days. '+(onDuty?'Assigned to duty.':'Off duty until assigned.'));return c;}
function crewAction(s,type,arg){check(s.profile.created&&!s.incident&&!s.battle&&!s.fleetLoss,'Handle crew assignments while safely docked.');const m=s.namedCrew?.members.find(m=>m.id===arg.id&&m.releasedDay===null);check(m,'That person is not aboard your travelling crew.');if(type==='crew-release'){m.releasedDay=s.day;m.onDuty=false;record(s,m.name+' left the crew at '+port(s.location).name+'. No signing fee refund; future wages stop.');return;}check(type==='crew-duty','Unknown crew action.');if(!m.onDuty){check(crewOverview(s).members.filter(m=>m.onDuty).length<2,'Two specialists may be on duty.');check(!crewOverview(s).members.some(v=>v.onDuty&&v.skill===m.skill),'A specialist already covers that duty.');}m.onDuty=!m.onDuty;record(s,m.name+(m.onDuty?' assigned to duty.':' stood down; daily wages continue.'));}
function validateNamedCrew(s){if(s.namedCrew===undefined)return;const c=s.namedCrew;check(c&&Array.isArray(c.members)&&c.members.length<=44&&Array.isArray(c.hired)&&c.hired.length<=500&&new Set(c.hired).size===c.hired.length&&c.hired.every(id=>typeof id==='string'&&/^crew:[a-z-]+:\d+:[0-5]$/.test(id))&&new Set(c.members.map(m=>m?.id)).size===c.members.length,'Invalid named crew register.');for(const m of c.members){check(m&&world.ports.some(p=>p.id===m.port)&&integer(m.cycle,0,Math.floor(s.day/30))&&integer(m.index,0,5),'Invalid crew origin.');check(m.termsVersion===undefined&&m.tier===undefined&&m.index<2&&m.specialty===undefined||[2,3].includes(m.termsVersion)&&crewGrades.some(t=>t.id===m.tier)&&((m.termsVersion===2&&m.index<2&&m.specialty===undefined)||(m.termsVersion===3&&m.index>=2)),'Invalid crew tier or agreement version.');const quoted=crewCandidate(s,m.port,m.cycle,m.index,[2,3].includes(m.termsVersion)?m.termsVersion:1);check(['id','name','skill','role','species','fee','daily','benefit',...([2,3].includes(m.termsVersion)?['termsVersion','tier']:[]),...(m.termsVersion===3?['specialty']:[])].every(k=>m[k]===quoted[k])&&c.hired.includes(m.id)&&integer(m.hiredDay,m.cycle*30,Math.min(s.day,m.cycle*30+29))&&(m.releasedDay===null||integer(m.releasedDay,m.hiredDay,s.day))&&typeof m.onDuty==='boolean'&&(m.releasedDay===null||!m.onDuty),'Invalid named crew agreement.');}const active=c.members.filter(m=>m.releasedDay===null),duty=active.filter(m=>m.onDuty);check(active.length<=4&&duty.length<=2&&new Set(duty.map(m=>m.skill)).size===duty.length,'Invalid crew duty allocation.');}

// Rare travellers use a stable voyage/port/window draw. Looking never consumes encounter RNG.
const secretPorts=['earth','moon','mars','phobos','ceres','callisto','ganymede','titan','iapetus','oberon','triton','neptune'];
const relicCatalog=[
 {
  "id": "surveyor",
  "name": "Surveyor’s ephemeris lattice",
  "skill": "navigation",
  "price": 18000,
  "detail": "Improves tactical targeting and helps with navigation-based licence discounts.",
  "lore": "A pre-Compact optical lattice stores unusually precise calibration references."
 },
 {
  "id": "annealer",
  "name": "Oriole diagnostic prism",
  "skill": "engineering",
  "price": 22000,
  "detail": "Helps prevent equipment incidents and improves emergency hull repairs.",
  "lore": "An early rescue-program instrument reveals fractures beneath thermal shielding."
 },
 {
  "id": "accord",
  "name": "Accord translation archive",
  "skill": "diplomacy",
  "price": 20000,
  "detail": "Improves the chance of negotiating a peaceful passage past pirates.",
  "lore": "A carefully annotated record of the first human, synthetic and visiting-species negotiations."
 },
 {
  "id": "charter",
  "name": "Founders’ freight seal",
  "skill": "commerce",
  "price": 26000,
  "detail": "Secures better fees on newly accepted freight-office contracts.",
  "lore": "A signed cooperative registry verifies the provenance of independent consignments."
 },
 {
  "id": "haven",
  "name": "Haven watch chime",
  "effect": "travelFatigue",
  "power": 0.16,
  "price": 24000,
  "detail": "Reduces crew fatigue during long journeys.",
  "lore": "A quiet timing instrument once used to coordinate rest aboard generation ships."
 },
 {
  "id": "anchor",
  "name": "Stillwater memory stone",
  "effect": "combatFatigue",
  "power": 0.16,
  "price": 22000,
  "detail": "Helps the crew remain ready after hull damage in combat.",
  "lore": "Its layered recordings preserve calming routines from an old rescue fleet."
 },
 {
  "id": "sentinel",
  "name": "Sentinel fault lens",
  "effect": "incidentRisk",
  "power": 0.12,
  "price": 28000,
  "detail": "Helps prevent equipment incidents during travel.",
  "lore": "A spectral lens compares live machinery noise with archived failure patterns."
 },
 {
  "id": "waystone",
  "name": "Beltwarden waystone",
  "effect": "beltRisk",
  "power": 0.16,
  "price": 24000,
  "detail": "Reduces the risk of debris incidents during asteroid-belt crossings.",
  "lore": "Etched vectors record the patient observations of early belt pilots."
 },
 {
  "id": "reticle",
  "name": "Farwatch reticle",
  "effect": "accuracy",
  "power": 0.02,
  "price": 28000,
  "detail": "Improves the accuracy of fleet attacks in tactical combat.",
  "lore": "An old optical sight keeps precise references under difficult firing conditions."
 },
 {
  "id": "aegis",
  "name": "Aegis response drum",
  "effect": "guardBonus",
  "power": 0.03,
  "price": 30000,
  "detail": "Reduces hull damage while ships are guarding in combat.",
  "lore": "A compact predictor reproduces the defensive drills of a long-retired convoy."
 },
 {
  "id": "radiant",
  "name": "Radiant sink lattice",
  "effect": "laserCooling",
  "power": 2,
  "price": 26000,
  "detail": "Reduces the heat generated by laser fire.",
  "lore": "A branching heat-flow archive preserves the work of a pioneering radiator designer."
 },
 {
  "id": "mender",
  "name": "Mender’s assembly key",
  "effect": "fieldRepair",
  "power": 2,
  "price": 30000,
  "detail": "Improves hull restoration from combat repair actions.",
  "lore": "Its stored repair sequences guide a damage-control party through emergency work."
 }
];
function relicBonuses(s){const b=artifactBonuses(s);for(const id of s.cantina?.equipped||[]){const r=relicCatalog.find(r=>r.id===id);if(r?.skill)b[r.skill]=1;}return b;}
function secretDraw(s,pid=s.location,cycle=Math.floor(s.day/30)){
 const p=port(pid);if(!secretPorts.includes(pid))return null;const au=system(p.group).au,chance=.06+.44*Math.max(0,Math.min(1,Math.log2(Math.max(1,au))/Math.log2(30))),key=pid+':'+cycle,h=hash('quiet-table:'+String(s.castSeed||'legacy')+':'+key),number=Number(h%1000000n)/1000000,starts=cycle*30+Number(h/1000003n%23n);
 if(number>=chance)return null;return {key,port:pid,cycle,starts,ends:starts+7,kind:['relic','cargo','survey'][Number(h/7919n%3n)],seed:h};
}
function secretContact(s){const e=secretDraw(s);return e&&s.day>=e.starts&&s.day<=e.ends?e:null;}
function secretHost(s,e){
 const base=stationContacts(e.port,'local',s)[0],pool=[...extraPortraitCatalog(),...expandedPortraitCatalog()],donor=pool[Number(e.seed/331n%BigInt(pool.length))],species=donor.species,k=String(e.seed),pick=(list,tag)=>list[Number(hash(k+':'+tag)%BigInt(list.length))],person=species==='human'?pick(expandedCastNames.humanFirst,'first')+' '+pick(expandedCastNames.humanLast,'last'):species==='robot'?pick(expandedCastNames.machine,'name')+' / '+String(Number(e.seed%9000n)+1000):pick(species==='ilyri'?expandedCastNames.ilyriStart:expandedCastNames.veyrStart,'first')+pick(species==='ilyri'?expandedCastNames.ilyriEnd:expandedCastNames.veyrEnd,'end')+' '+pick(species==='ilyri'?expandedCastNames.ilyriFamily:expandedCastNames.veyrFamily,'family');
 return characterView({...base,portraitStyle:undefined,portraitIndex:undefined,portraitPerson:undefined,stationPortrait:undefined,assignmentKey:undefined,person,species,sex:donor.sex||base.sex,gender:donor.gender||base.gender,pronouns:donor.pronouns||base.pronouns,sexName:donor.sexName||base.sexName,identitySummary:donor.identitySummary||base.identitySummary,appearanceNote:donor.appearanceNote||'',portraitKey:donor.portraitKey,portraitVariant:donor.portraitKey,role:e.kind==='relic'?'Travelling antiquarian':e.kind==='cargo'?'Discreet cargo factor':'Independent archive hunter',name:'A quiet table',greeting:'There is room for one more at this table. Keep your voice down.',business:'A traveller staying only a few ship-days. Their offers remain the same until they leave.'});
}
function ensureCantina(s){if(!s.cantina)s.cantina={relics:[],equipped:[],deals:[],sessions:[],quests:[]};return s.cantina;}
function secretDeal(s,e){return s.cantina?.deals.find(d=>d.key===e.key)||{key:e.key,port:e.port,cycle:e.cycle,edition:2,relicBought:false,bought:0,sold:0,soldRelics:[]};}
function secretSession(s,e){return s.cantina?.sessions.find(d=>d.key===e.key)||null;}
function travellerRelicPool(s,e){const prior=secretSession(s,e)||s.cantina?.deals.find(d=>d.key===e.key);return prior&&prior.edition===undefined?relicCatalog.slice(0,4):relicCatalog;}
function cargoFactorPrices(g,local=null,minimumAsk=null){const margin=exchangeRules.travellerMargin,buy=Math.ceil(g.base*(1+margin)),sell=Math.floor(g.base*(1-margin));return local?{buy:Math.max(buy,local.sell+1),sell:Math.max(1,Math.min(sell,(minimumAsk??local.buy)-1))}:{buy,sell};}
function cargoTraderQuote(s,g,pid=s.location){const illegal=contrabandGoods.some(v=>v.id===g.id),q=marketState(s,g.id,pid);if(illegal)return q.open?cargoFactorPrices({...g,base:q.price},q):cargoFactorPrices(g);const capacity=marketEconomy.storageCapacity(pid,g.id),minimumAsk=stockPricing.quote(q.basePrice,q.spread,capacity/2,capacity/2,capacity).buy;return cargoFactorPrices(g,q,minimumAsk);}
function secretStock(s,e){const d=secretDeal(s,e),pool=travellerRelicPool(s,e),r=pool[Number(e.seed/47n%BigInt(pool.length))],g=e.kind==='cargo'?(Number(e.seed/107n%10n)<7?contrabandGoods[Number(e.seed/131n%3n)]:stapleGoods[Number(e.seed/131n%BigInt(stapleGoods.length))]):null,price=Math.ceil(r.price*(.85+Number(e.seed/193n%31n)/100)),stock=3+Number(e.seed/271n%6n)-d.bought+d.sold,demand=4+Number(e.seed/313n%5n)-d.sold+d.bought;
 return {screening:e.kind==='cargo'?customsPacks.map((p,i)=>({...p,cost:p.price,stock:1+Number(e.seed/BigInt(359+i*42)%3n)-(d.screeningBought?.[p.id]||0)})):[],relic:{...r,buy:price,available:!d.relicBought&&!s.cantina?.relics.includes(r.id)},good:g?{id:g.id,name:g.name,illegal:contrabandGoods.some(v=>v.id===g.id),stock,demand,...cargoTraderQuote(s,g,e.port||s.location),aboard:tradableQuantity(s,g.id)}:null};
}
function secretRelicAdvice(s,e){const q=secretQuestOffer(s,e),r=relicCatalog.find(r=>r.id===(q?.relic||secretStock(s,e).relic.id));return `${r.name}: ${r.benefit||r.detail||r.description}. It equips automatically when acquired if a relic slot is free; overlapping benefits use the strongest source. It offers no guarantee of survival.`;}
function secretQuestOffer(s,e){
 const candidates=accessiblePorts(s).filter(id=>id!==s.location).sort((a,b)=>Number(port(b).group===port(s.location).group)-Number(port(a).group===port(s.location).group)||Number(hash(e.key+a)%1000n)-Number(hash(e.key+b)%1000n));if(!candidates.length)return null;
 const target=candidates[0],t=routeTransfer(s,target),days=t.coastDays+t.waitDays;if(days*2+90>2000||s.day+days*2+90>365249)return null;
 const stock=secretStock(s,e),kind=e.kind==='cargo'&&stock.good?.illegal?'delivery':'survey',goodID=kind==='delivery'?stock.good.id:null,quantity=kind==='delivery'?2:0,reward=serviceReward(serviceRouteCost(s,target,{mass:quantity?(quantity*cargoSpecs.packing(goodID).grossKgPerLot/1000):0,returnTrip:kind==='survey',workDays:kind==='survey'?1:0}),{work:kind==='survey'?1:0})+(kind==='delivery'?Math.ceil(stock.good.buy*quantity*1.2):0),pool=travellerRelicPool(s,e),relic=pool[Number(e.seed/419n%BigInt(pool.length))].id,duration=Math.max(30,days*2+90);
 return {id:e.key,key:e.key,origin:e.port,target,kind,good:goodID,quantity,reward,relic,duration,title:(kind==='delivery'?['An unlisted delivery','A sealed side agreement','The last case aboard']:['The missing survey archive','Echoes of the Oriole','A map no one filed'])[Number(e.seed/937n%3n)],description:kind==='delivery'?`Source ${quantity} units of your own ${good(goodID).name.toLowerCase()} and deliver them to the canteen at ${stationLabel(target)}. You pay for the goods; cargo inspections can seize them. Success pays the agreed fee and a relic but costs 2 wider reputation.`:`Travel to ${stationLabel(target)}, recover its encrypted survey archive, then return it to this canteen. The archive is data, requiring no cargo space. Success earns 2 wider reputation and a relic.`,terms:'One secret job at a time. No deadline. Abandoning costs 2 wider reputation and 3 trust at the issuing station. A canteen dead drop accepts handover even after the traveller leaves. No licences are granted. Already-owned relics do not grant duplicate copies or extra cash.'};
}
function relicOverview(s){const bonuses=relicBonuses(s);return {slots:2,equipped:(s.cantina?.equipped.length||0)+operationShips(s).reduce((n,v)=>n+(v.missionCargo||[]).filter(l=>l.kind==='antiquity'&&l.artifact.equipped).length,0),artifacts:operationShips(s).flatMap(v=>(v.missionCargo||[]).filter(l=>l.kind==='antiquity').map(l=>({id:l.id,ship:actorID(s,v),shipName:actorName(s,v),port:v===s?s.location:v.location,appraised:l.artifact.appraised,equipped:l.artifact.equipped,detail:l.artifact.appraised?(l.artifact.genuine?'Supports '+skillNames[l.artifact.skill].toLowerCase()+' while equipped.':'No effective skill benefit; reproduction.'):'Appraise this physical case to identify its possible benefit.'}))),bonuses,owned:(s.cantina?.relics||[]).map(id=>{const r=relicCatalog.find(r=>r.id===id);return {...r,equipped:s.cantina.equipped.includes(id),value:Math.floor(r.price*.45),...(r.skill?{baseLevel:skillProgressForXP(s.profile.xp[r.skill]).level,effectiveLevel:level(s,r.skill)}:{})};}),note:'New relics equip automatically when a slot is free; appraise recovered cases first. The strongest source of the same benefit applies; earned XP is retained. Configure them while docked, outside encounters. Relics are captain equipment and remain with you when you change ships.'};}
function secretQuestView(s,q){const recovered=q.recovered,local=s.location===(q.kind==='delivery'?q.target:q.origin),ready=q.kind==='delivery'?tradableQuantity(s,q.good)>=q.quantity:recovered;return {...q,originName:stationLabel(q.origin),targetName:stationLabel(q.target),relicName:relicCatalog.find(r=>r.id===q.relic).name,deadline:null,remaining:null,canRecover:q.status==='active'&&q.kind==='survey'&&!recovered&&s.location===q.target&&s.profile.stats.voyages>q.baselineVoyages,canComplete:q.status==='active'&&local&&ready,progress:q.kind==='delivery'?`${tradableQuantity(s,q.good)} / ${q.quantity} eligible cargo units aboard`:(recovered?'Archive recovered; return to issuing canteen':'Travel to the target after acceptance, then recover the archive')};}
function underworldOverview(s){const e=secretContact(s),session=e?secretSession(s,e):null,stock=e?secretStock(s,e):null,quest=e?secretQuestOffer(s,e):null,active=s.cantina?.quests.some(q=>q.status==='active'),taken=e?s.cantina?.quests.some(q=>q.key===e.key):false;return {contact:e?{key:e.key,ends:e.ends,host:secretHost(s,e),node:session?.node||'hidden',question:session?.question||'',response:session?.response||'',choices:session?.node==='trade'?[{id:'work',name:'Any work that does not go on the public board?'},{id:'risk',name:'What are the risks?'},{id:'back',name:'Let’s talk about something else.'}]:session?.node==='work'?[{id:'trade',name:'What are you buying or selling?'},{id:'risk',name:'What are the risks?'},{id:'back',name:'Let’s talk about something else.'}]:[{id:'trade',name:'What are you buying or selling?'},{id:'work',name:'Do you know of any hidden work?'},{id:'risk',name:'What should I know before agreeing?'}],relic:session?.node==='trade'&&e.kind==='relic'?stock.relic:null,good:session?.node==='trade'&&e.kind==='cargo'?stock.good:null,screening:session?.node==='trade'&&e.kind==='cargo'?stock.screening:[],buybacks:session?.node==='trade'&&e.kind==='relic'?(s.cantina?.relics||[]).map(id=>({id,name:relicCatalog.find(r=>r.id===id).name,price:Math.floor(relicCatalog.find(r=>r.id===id).price*.45)})):[],quest:session?.node==='work'&&quest?{...quest,relicName:relicCatalog.find(r=>r.id===quest.relic).name,canAccept:!active&&!taken,reason:active?'Complete or abandon your active secret job first.':taken?'You already took this traveller’s job.':''}:null}:null,quests:(s.cantina?.quests||[]).slice().reverse().map(q=>secretQuestView(s,q))};}
function expireSecretQuests(s){} // Relic-bearing private assignments have no expiration; historical outcomes remain intact.
function failSecretQuest(s,q,why){q.status='failed';q.completedDay=s.day;changeReputation(s,-2,'Secret job '+why+'.');changeStationReputation(s,q.origin,-3,'Secret job '+why+'.');record(s,`${q.title} ${why}. Wider reputation −2; issuing station trust −3. Owned goods remain yours.`);}
function cantinaAction(s,type,arg){
 check(s.profile.created,'Sign your captain charter first.');check(!s.incident&&!s.battle&&!s.fleetLoss,'Resolve the encounter first.');
 if(type==='relic-equip'){const c=ensureCantina(s);check(c.relics.includes(arg.relic),'You do not own that relic.');const equipped=c.equipped.includes(arg.relic);check(equipped||c.equipped.length+operationShips(s).reduce((n,v)=>n+(v.missionCargo||[]).filter(l=>l.kind==='antiquity'&&l.artifact.equipped).length,0)<2,'Unequip a relic first; you have two active slots.');c.equipped=equipped?c.equipped.filter(id=>id!==arg.relic):[...c.equipped,arg.relic];record(s,`${equipped?'Stowed':'Equipped'} ${relicCatalog.find(r=>r.id===arg.relic).name}. Earned XP unchanged.`);return;}
 if(['secret-recover','secret-complete','secret-abandon'].includes(type)){
  const q=s.cantina?.quests.find(q=>q.id===arg.quest);check(q&&q.status==='active','That secret job is not active.');const v=secretQuestView(s,q);
  if(type==='secret-abandon'){failSecretQuest(s,q,'was abandoned');return;}
  if(type==='secret-recover'){check(v.canRecover,'Visit the survey target after accepting the job.');q.recovered=true;record(s,`Recovered the encrypted archive at ${port(s.location).name}. Return to ${port(q.origin).name}.`);return;}
  check(v.canComplete,'Visit the handover canteen with the required archive or your own cargo.');check(s.credits+q.reward<=999999999,'Deposit cash before receiving this reward.');if(q.kind==='delivery')removeFleetCargo(s,q.good,q.quantity,true);q.status='completed';q.completedDay=s.day;s.credits+=q.reward;grantRelic(s,q.relic,'private canteen commission');earn(s,q.kind==='delivery'?'commerce':'navigation',20);changeReputation(s,q.kind==='delivery'?-2:2,q.kind==='delivery'?'Completed an illicit delivery.':'Recovered a missing survey archive.');changeStationReputation(s,q.origin,2,'Kept a secret commission promise.');record(s,`${q.title} completed: ${q.reward} cr, 20 ${q.kind==='delivery'?'Commerce':'Navigation'} XP and ${relicCatalog.find(r=>r.id===q.relic).name}. Duplicate relics are not awarded. ${q.kind==='delivery'?'Wider reputation −2 for illicit work.':'Wider reputation progress recorded.'}`);return;
 }
 const e=secretContact(s);check(e&&arg.key===e.key,'That traveller has left, or this offer belongs to another station.');const c=ensureCantina(s);
 if(type==='secret-talk'){check(['intro','trade','work','risk','back','later','decline'].includes(arg.choice),'Choose an available reply.');const questions={intro:'May I join you?',trade:'What are you buying or selling?',work:'Do you know of any hidden work?',risk:'What should I know before agreeing?',back:'Let’s talk about something else.',later:'Not right now.',decline:'No, I’ll pass.'},node=['intro','back','risk','later','decline'].includes(arg.choice)?'root':arg.choice,answers={intro:`Keep your voice down. I am ${secretHost(s,e).person}. I leave after day ${e.ends}; there may be something here worth your time.`,trade:e.kind==='relic'?'I deal in old instruments with useful calibration archives. One is available; I also buy relics you already own. A new instrument takes a free active slot automatically; I will not replace anything you are already using.':e.kind==='cargo'?'I have a small consignment and cargo-screening packages for a travelling convoy. There are only a few sets in my cases; ask for what you need before I move on.':'I trade in information rather than cargo. Ask about work; the archive could lead to a rare instrument.',work:secretQuestOffer(s,e)?.description||'I have no job suited to your currently licensed routes. More access may open another lead.',risk:`No promised passage, licence or immunity. Relic jobs have no deadline. Read the agreed costs and reward. Restricted goods can be seized. Failure costs reputation at the issuing station and across the network. ${secretRelicAdvice(s,e)}`,back:'We can talk about trade, work, or the risks. Your choice.',later:'No agreement yet, Captain. Ask again while I am still here if you change your mind.',decline:'Understood. I will leave that job with someone else; we can talk about trade instead.'};let session=c.sessions.find(v=>v.key===e.key);if(!session){session={key:e.key,port:e.port,cycle:e.cycle,edition:2,node:'root',question:'',response:''};c.sessions.push(session);c.sessions=c.sessions.slice(-40);}Object.assign(session,{node,question:questions[arg.choice],response:answers[arg.choice]});return;}
 check(secretSession(s,e),'Speak to this traveller first.');
 if(type==='secret-accept'){check(secretSession(s,e).node==='work','Ask about the job before accepting it.');check(!c.quests.some(q=>q.status==='active'),'Finish your active secret job first.');check(!c.quests.some(q=>q.key===e.key),'You already took this traveller’s job.');const offer=secretQuestOffer(s,e);check(offer,'No suitable licensed route is available.');c.quests.push({...offer,acceptedDay:s.day,deadline:null,baselineVoyages:s.profile.stats.voyages,recovered:false,status:'active',completedDay:null});c.quests=c.quests.slice(-20);Object.assign(secretSession(s,e),{node:'root',question:'Yes, I’ll take the job.',response:`Agreed, Captain. **${offer.reward} cr** and ${relicCatalog.find(r=>r.id===offer.relic).name} on delivery; there is **no deadline**.`});record(s,`Accepted ${offer.title}: ${offer.description} No deadline. ${offer.terms}`);return;}
 check(type==='secret-trade'&&secretSession(s,e).node==='trade','Ask about trade before placing an order.');const stock=secretStock(s,e);let d=c.deals.find(d=>d.key===e.key);if(!d){d=secretDeal(s,e);c.deals.push(d);c.deals=c.deals.slice(-80);}
 if(arg.kind==='buy-screening'){const p=customsPreparation(s).packs.find(p=>p.id===arg.item);check(e.kind==='cargo'&&p?.canBuy,p?.reason||'This traveller has no cargo-screening package to offer.');s.credits-=p.cost;loadScreeningLots(s,p,[{id:'screening:'+uuid(),mission:null,kind:'screening',screening:p.id,mass:p.mass,owner:'captain',origin:s.location,day:s.day}]);if(!d.screeningBought)d.screeningBought={};d.screeningBought[p.id]=(d.screeningBought[p.id]||0)+1;record(s,'Bought '+p.name.toLowerCase()+' for the active fleet from a canteen traveller for '+p.cost+' cr.');return;}
 if(arg.kind==='buy-relic'){check(e.kind==='relic'&&arg.item===stock.relic.id&&stock.relic.available,'That relic is unavailable or already owned.');check(s.credits>=stock.relic.buy,'Not enough credits for this relic.');s.credits-=stock.relic.buy;c.relics.push(arg.item);d.relicBought=true;record(s,`Bought ${stock.relic.name} from a canteen traveller for ${stock.relic.buy} cr. Added to your relic collection.`);return;}
 if(arg.kind==='sell-relic'){check(e.kind==='relic'&&c.relics.includes(arg.item),'This trader cannot buy that relic.');sellNamedRelic(s,arg.item,secretHost(s,e).person);d.soldRelics.push(arg.item);d.soldRelics=[...new Set(d.soldRelics)];return;}
 check(e.kind==='cargo'&&stock.good&&arg.item===stock.good.id&&['buy','sell'].includes(arg.kind),'This traveller does not trade that merchandise.');const n=arg.units,buy=arg.kind==='buy';check(integer(n,1,1000),'Choose a positive trade quantity.');check(n<=(buy?stock.good.stock:stock.good.demand),'That exceeds the traveller’s remaining stock or buying capacity.');check(n<=(buy?cargoRoom(s,arg.item):tradableQuantity(s,arg.item)),buy?'Not enough cargo space.':'Only your own cargo can be sold.');const total=n*(buy?stock.good.buy:stock.good.sell);check(buy?s.credits>=total:s.credits+total<=999999999,buy?'Not enough credits.':'Deposit cash before selling cargo.');s.credits+=buy?-total:total;if(buy)addFleetCargo(s,arg.item,n,{units:n,cost:total});else removeFleetCargo(s,arg.item,n,true);d[buy?'bought':'sold']+=n;record(s,`${buy?'Bought':'Sold'} ${n} ${stock.good.name.toLowerCase()} through a canteen factor for ${total} cr. Restricted cargo has no inspection exemption.`);
}
function validateCantina(s){
 const c=s.cantina;if(c===undefined||c===null)return;const ids=relicCatalog.map(r=>r.id),key=(v)=>v&&secretPorts.includes(v.port)&&integer(v.cycle,0,Math.floor(s.day/30))&&v.key===v.port+':'+v.cycle&&!!secretDraw(s,v.port,v.cycle)&&secretDraw(s,v.port,v.cycle).starts<=s.day;
 check(c&&Array.isArray(c.relics)&&c.relics.length<=ids.length&&new Set(c.relics).size===c.relics.length&&c.relics.every(id=>ids.includes(id))&&Array.isArray(c.equipped)&&c.equipped.length<=2&&new Set(c.equipped).size===c.equipped.length&&c.equipped.every(id=>c.relics.includes(id)),'Invalid relic cabinet.');
 check(Array.isArray(c.deals)&&c.deals.length<=80&&new Set(c.deals.map(v=>v?.key)).size===c.deals.length&&c.deals.every(v=>key(v)&&(v.edition===undefined||v.edition===2)&&typeof v.relicBought==='boolean'&&integer(v.bought,0,10000)&&integer(v.sold,0,10000)&&Array.isArray(v.soldRelics)&&v.soldRelics.length<=ids.length&&new Set(v.soldRelics).size===v.soldRelics.length&&v.soldRelics.every(id=>ids.includes(id))&&(()=>{const e=secretDraw(s,v.port,v.cycle),stock=secretStock(s,e);if(v.screeningBought!==undefined&&(!v.screeningBought||typeof v.screeningBought!=='object'||Array.isArray(v.screeningBought)||!Object.entries(v.screeningBought).every(([id,n])=>e.kind==='cargo'&&customsPacks.some(p=>p.id===id)&&integer(n,0,3))||stock.screening.some(p=>p.stock<0)))return false;return stock.good?stock.good.stock>=0&&stock.good.demand>=0&&!v.relicBought&&!v.soldRelics.length:v.bought===0&&v.sold===0;})()),'Invalid traveller trade ledger.');
 check(Array.isArray(c.sessions)&&c.sessions.length<=40&&new Set(c.sessions.map(v=>v?.key)).size===c.sessions.length&&c.sessions.every(v=>key(v)&&(v.edition===undefined||v.edition===2)&&['root','trade','work'].includes(v.node)&&str(v.question,300)&&str(v.response,4000)),'Invalid traveller conversations.');
 check(Array.isArray(c.quests)&&c.quests.length<=20&&c.quests.filter(q=>q?.status==='active').length<=1&&new Set(c.quests.map(q=>q?.id)).size===c.quests.length,'Invalid secret job register.');
 for(const q of c.quests){check(q&&q.id===q.key&&secretPorts.includes(q.origin)&&/^\w[\w-]*:\d+$/.test(q.key)&&q.key.startsWith(q.origin+':')&&world.ports.some(p=>p.id===q.target)&&q.target!==q.origin&&['survey','delivery'].includes(q.kind)&&str(q.title,160)&&str(q.description,2500)&&str(q.terms,2000)&&integer(q.reward,1,10000000)&&ids.includes(q.relic)&&integer(q.duration,30,2000)&&integer(q.acceptedDay,0,s.day)&&(q.deadline===null||q.deadline===q.acceptedDay+q.duration&&q.deadline<=365249)&&integer(q.baselineVoyages,0,s.profile.stats.voyages)&&typeof q.recovered==='boolean'&&['active','completed','failed'].includes(q.status)&&(q.status==='active'?q.completedDay==null:integer(q.completedDay,q.acceptedDay,s.day))&&(q.kind==='delivery'?contrabandGoods.some(g=>g.id===q.good)&&q.quantity===2:q.good==null&&q.quantity===0),'Invalid secret mission.');}
}

// Civilian operations remain local, finite and tied to physical vessels.
const fieldPorts={moon:'ore',phobos:'ore',deimos:'ore',ceres:'ore',callisto:'ice',europa:'ice',enceladus:'ice',rhea:'ice',iapetus:'ice',ariel:'ice',oberon:'ore',triton:'ice'};
const operationKinds=['mining','passengers','carrier'];
const operationShips=s=>s.fleetLoss?s.fleet:[s,...s.fleet];
const earnedLevel=(s,k)=>skillProgressForXP(s.profile.xp[k]).level;
const operationKnown=(s,kind)=>!!s.civilian?.discoveries.some(d=>d.kind===kind);
const operationPermit=(s,kind,pid=s.location)=>!!s.civilian?.permits.some(p=>p.kind===kind&&(kind!=='mining'||p.port===pid));
function ensureCivilian(s){return s.civilian||(s.civilian={version:1,discoveries:[],permits:[],sites:[],taken:[],history:[],completedPassengers:0});}
function civilianRecord(s,kind,text){const c=ensureCivilian(s);c.history.push({day:s.day,port:s.location,kind,text});c.history=c.history.slice(-80);record(s,text);}
function operationDiscoveryChoices(s,venue){
 if(!s.profile.created)return [];
 const all=operationShips(s),qualified=kind=>kind==='mining'?venue==='relay'&&fieldPorts[s.location]&&(s.profile.xp.navigation>=100||all.some(v=>v.shipID==='heron')):kind==='passengers'?venue==='relay'&&(s.profile.stats.deliveries>0||s.profile.xp.commerce>=100||all.some(v=>['curlew','ibis'].includes(v.shipID))):venue==='fleet'&&(all.some(v=>v.shipID==='condor')||earnedShipExperience(s)>=1000);
 return operationKinds.filter(k=>qualified(k)&&!operationKnown(s,k)).map(kind=>({id:'op-discover-'+kind,name:({mining:'Could my fleet take on survey and extraction work?',passengers:'How do passenger and medical transport charters work?',carrier:'How can a carrier take small craft on an expedition?'})[kind],detail:'Ask about specialist work and its requirements'}));
}
function operationDiscovery(s,kind,venue){
 check(operationDiscoveryChoices(s,venue).some(v=>v.id==='op-discover-'+kind),'This introduction is not available here.');
 ensureCivilian(s).discoveries.push({kind,port:s.location,day:s.day});earn(s,kind==='passengers'?'diplomacy':'navigation',5);
 return {mining:'I have introduced you to the survey register. A Heron or a ship with level 2 sensors can survey local deposits. Extraction needs a Sanderling with its factory mining rig, engineering level 2, a local claim from the authority and a spare assembly. Deposits are finite. Raw ore occupies real hold space and needs paid refining before it becomes metal.',passengers:'Passenger and medical transport bookings are now at Communications with the station coordinator. A Curlew has 24 dedicated berths; an Ibis can carry eight medical travellers. The authority issues a welfare certificate after commerce and diplomacy level 1. Passengers add mass and cost 2 cr per person per day, including layovers. Deadlines, distress and lost hulls have consequences. Clinic studies and completed charters can open medical transfers.',carrier:'Carrier operations are now registered at your fleet desk. The authority issues an expedition certificate at navigation level 3. A Condor has two hangar berths for owned Swift, Kestrel or Merlin craft within the approved mass and clearance limits. Embarked craft add their loaded mass; they provide no shared tanks, holds or combat turns. Embark or deploy only while safely stopped at a licensed port.'}[kind];
}
function operationPermitOffers(s){
 return operationKinds.filter(k=>operationKnown(s,k)&&!operationPermit(s,k)&&(k!=='mining'||fieldPorts[s.location])&&(k!=='carrier'||portFacilities(s.location).spaceport)).map(kind=>{
  const price=servicePrice(s,{mining:900,passengers:1200,carrier:4000}[kind]),requirements={mining:'Engineering level 2 (300 earned XP); this claim covers only the local deposit.',passengers:'Commerce and diplomacy level 1 (100 earned XP each).',carrier:'Navigation level 3 (700 earned XP).'}[kind];
  const trained=kind==='mining'?earnedLevel(s,'engineering')>=2:kind==='passengers'?earnedLevel(s,'commerce')>=1&&earnedLevel(s,'diplomacy')>=1:earnedLevel(s,'navigation')>=3;
  const reason=!destinationAccess(s,s.location).open?'A local access licence is required.':!trained?requirements:s.credits<price?'Not enough available credits.':'';
  return {kind,title:{mining:'Local extraction claim',passengers:'Passenger welfare certificate',carrier:'Carrier expedition certificate'}[kind],price,requirements,reason,canBuy:!reason};
 });
}
function siteDraw(s,pid=s.location){const h=hash('finite-site-v1:'+s.castSeed+':'+pid);return {port:pid,kind:fieldPorts[pid],total:24+Number(h%57n),quality:60+Number(h/71n%36n)};}
function civilianMining(s){
 if(!operationKnown(s,'mining')||!fieldPorts[s.location])return null;
 const site=s.civilian?.sites.find(v=>v.port===s.location),draw=siteDraw(s),surveyShip=fleetMembers(s).find(v=>v.hull>=50&&(v.shipID==='heron'||(v.upgrades.sensors||0)>=2)),miner=fleetMembers(s).find(v=>v.shipID==='sanderling'&&v.hull>=50),remaining=site?draw.total-site.extracted:0;
 const surveyCost=servicePrice(s,450),yieldUnits=site&&miner?Math.max(0,Math.min(remaining,4+Math.floor(site.quality/12),draw.kind==='ice'?shipCargoRoom(miner,'water'):Math.floor(Math.min((effectiveShip(miner).cargoTonnes-cargoMass(miner)-(miner.oreUnits||0)*(cargoSpecs.packing('metals').grossKgPerLot/1000-.25))/(cargoSpecs.packing('metals').grossKgPerLot/1000),(effectiveShip(miner).cargoM3-cargoVolume(miner))/.2)+1e-8))):0;
 const extractCost=servicePrice(s,120+yieldUnits*15),hazard=site?Number(hash('extraction:'+s.castSeed+':'+s.location+':'+site.extracted)%100n)<15:false;
 const surveyReason=site?'This deposit has already been surveyed.':!surveyShip?'Assign a Heron or a ship with level 2 sensors, at 50% integrity or better.':earnedLevel(s,'navigation')<1?'Earn navigation level 1 (100 XP).':s.credits<surveyCost?'Not enough credits for the survey.':'';
 const extractionReason=!site?'Survey this deposit first.':!operationPermit(s,'mining')?'Purchase this station’s extraction claim at the authority.':!miner?'Assign a Sanderling with at least 50% integrity.':earnedLevel(s,'engineering')<2?'Earn engineering level 2 (300 XP).':miner.spares<1?'Load an engineering spare for the mining rig.':!remaining?'This deposit is exhausted.':!yieldUnits?'Free cargo space on the mining vessel.':s.credits<extractCost?'Not enough credits for extraction services.':'';
 return {site:site?{...site,remaining,total:draw.total}:null,kind:draw.kind,surveyCost,surveyShip:surveyShip?actorID(s,surveyShip):null,surveyReason,canSurvey:!surveyReason,miner:miner?actorID(s,miner):null,yieldUnits,extractCost,extractionReason,canExtract:!extractionReason,hazard};
}
function passengerOffers(s,medical=false){
 if(!operationKnown(s,'passengers')||!operationPermit(s,'passengers')||s.incident)return [];
 if(medical&&!((s.civilian?.completedPassengers||0)>0&&(s.stationServices?.completedStudies||0)>0))return [];
 const vessels=fleetMembers(s).filter(v=>!v.passengers&&!(v.missionCargo||[]).some(l=>l.kind==='patients')&&v.hull>=70&&(medical?v.shipID==='ibis':v.shipID==='curlew'));
 if(!vessels.length||crewReadiness(s)<70)return [];
 const cycle=Math.floor(s.day/30),h=hash('passenger-board:'+s.castSeed+':'+s.location+':'+cycle+':'+medical),destinations=world.ports.filter(p=>p.id!==s.location&&destinationAccess(s,p.id).open);
 if(!destinations.length)return [];
 return [0,1].slice(0,Math.min(2,destinations.length)).map(n=>{
  const destination=destinations[(Number(h%100000n)+n)%destinations.length].id,id=s.location+':'+cycle+':'+(medical?'medical':'passenger')+':'+n,count=medical?2+Number(h/53n%7n):4+Number(h/71n%21n),q=quote(s,destination),duration=transfer(s.location,destination,s.day,.001).coastDays+40,reward=serviceReward(serviceRouteCost(s,destination,{shipID:medical?'ibis':'curlew',mass:count*.2,passengers:count}),{extra:medical?tradeTotal(s,'medicine',2,true):0,risk:0})+Math.round(count*ships.find(h=>h.id===(medical?'ibis':'curlew')).price*.0005);
  const reason=s.civilian?.taken.includes(id)?'This charter has already been booked.':s.day+duration>=365250?'This charter exceeds the calendar.':medical&&tradableQuantity(s,'medicine')<2?'Carry two owned units of medical supplies for the transfer.':'';
  const delegation=!medical&&count>=6&&(s.profile.relationships[s.location]||0)>=15,delegationBonus=delegation?Math.min(5000,Math.round(reward*.1)):0;return {id,origin:s.location,destination,count,medical,duration,reward:reward+delegationBonus,delegation,delegationBonus,ship:actorID(s,vessels[0]),reason,canAccept:!reason};
 }).filter(o=>!s.civilian?.taken.includes(o.id));
}
function passengerManifest(s){return operationShips(s).filter(v=>v.passengers).map(v=>({...v.passengers,ship:actorID(s,v),shipName:actorName(s,v),local:v===s||v.location===s.location,travelling:fleetMembers(s).includes(v),canDeliver:!s.incident&&v.passengers.destination===s.location&&(v===s||v.location===s.location)}));}
const passengerDaily=s=>operationShips(s).reduce((n,v)=>n+(v.passengers?.count||0)*2,0);
function passengerEnd(s,v,outcome){
 const j=v.passengers;if(!j)return;
 const success=outcome==='completed',pay=success?Math.floor((j.reward-((j.delegation&& (j.late||j.welfare<70||crewReadiness(s)<70||fleetMembers(s).some(v=>contrabandGoods.some(g=>(v.cargo[g.id]||0)>0))))?(j.delegationBonus||0):0))*(j.late?.25:1)*(j.welfare<50?.5:1)):0;
 check(s.credits+pay<=999999999,'Deposit cash before receiving the charter fee.');s.credits+=pay;
 if(success){earn(s,'commerce',j.late?8:35);earn(s,'diplomacy',j.late?4:20);if(!j.late&&j.welfare>=50){ensureCivilian(s).completedPassengers=(s.civilian.completedPassengers||0)+1;changeReputation(s,3,'Completed a passenger charter.');changeStationReputation(s,j.origin,2,'Passengers arrived safely.');changeStationReputation(s,s.location,2,'Welcomed a safe passenger arrival.');}}
 if(success&&j.welfare<50)changeReputation(s,-2,'Passenger welfare fell below safe standards.');
 else if(!success){changeReputation(s,outcome==='lost'?-10:-6,'Passenger charter '+outcome+'.');changeStationReputation(s,j.origin,-5,'Passenger charter '+outcome+'.');if(outcome!=='lost')invoice(s,j.count*100);}
 civilianRecord(s,success?'passenger-complete':'passenger-failed',`${j.medical?'Medical transfer':'Passenger charter'} ${j.id}: ${outcome}; ${j.count} travellers, ${pay} cr paid.${j.late?' Late-arrival fee reduced to 25%.':''}${j.welfare<50?' Welfare reduction: half of the remaining fee.':''}${!success&&outcome!=='lost'?' Emergency accommodation charged at 100 cr per traveller.':''}`);delete v.passengers;
}
function civilianAdvance(s,days,travelPaid){
 const all=operationShips(s),travelling=new Set(fleetMembers(s));
 invoice(s,all.reduce((n,v)=>n+(v.passengers&&!(travelPaid&&travelling.has(v))?v.passengers.count*2*days:0),0));
 for(const v of all){const j=v.passengers;if(!j)continue;if(s.day>j.deadline&&!j.late){j.late=true;changeReputation(s,-3,'Missed passenger charter deadline.');changeStationReputation(s,j.origin,-3,'Passenger transfer delayed.');civilianRecord(s,'passenger-late','Passenger charter '+j.id+' missed its deadline. Deliver the travellers safely; the remaining fee is 25%.');}
  if(crewReadiness(s)<50||v.hull<50)j.welfare=Math.max(0,j.welfare-Math.max(1,Math.ceil(days/4)));
 }
}
function civilianSync(s){
 const all=operationShips(s);for(const v of all){delete v.carrierMass;delete v.towMass;}
 for(const v of s.fleet.filter(v=>v.towID)){const tug=all.find(t=>actorID(s,t)===v.towID);check(tug&&tug.shipID==='cormorant','A tow requires its owned tug.');v.location=tug===s?s.location:tug.location;tug.towMass=effectiveShip(v).dryMass+cargoMass(v)+v.fuel;}
 for(const v of s.fleet.filter(v=>v.carrierID)){const carrier=all.find(c=>actorID(s,c)===v.carrierID);check(carrier&&carrier.shipID==='condor','A carried craft requires its surviving carrier.');v.location=carrier===s?s.location:carrier.location;const mass=effectiveShip(v).dryMass+cargoMass(v)+v.fuel;carrier.carrierMass=(carrier.carrierMass||0)+mass;}
}
function civilianShipLoss(s,v,repossessed=false,recoveryPort=s.location){
 for(const t of s.fleet.filter(t=>t.towID===actorID(s,v))){delete t.towID;t.location=repossessed?recoveryPort:s.battle?.destination||s.location;t.escort=false;record(s,t.name+' released to emergency recovery after losing its tug.');}delete v.towMass;delete v.contractTow;delete v.missionCargo;delete v.duty;passengerEnd(s,v,repossessed?'repossessed':'lost');delete v.oreUnits;delete v.oreCost;const id=actorID(s,v),craft=s.fleet.filter(c=>c.carrierID===id);
 for(const c of craft){if(repossessed){delete c.carrierID;c.escort=false;c.location=recoveryPort;}else{s.shipLosses=[...(s.shipLosses||[]),{id:c.id,name:c.name,shipID:c.shipID,day:s.day,port:s.battle?.destination||s.location,cargo:clone(c.cargo),fuel:c.fuel}].slice(-80);s.fleet=s.fleet.filter(x=>x.id!==c.id);record(s,c.name+' and its stores were lost inside '+actorName(s,v)+'.');}}
 delete v.carrierMass;
}
function carrierOverview(s){
 if(!operationKnown(s,'carrier'))return null;
 const all=operationShips(s),carriers=all.filter(v=>v.shipID==='condor'&&(v===s||v.location===s.location));
 return carriers.map(v=>{const id=actorID(s,v),stored=s.fleet.filter(c=>c.carrierID===id),envelopes={swift:{length:31.6,height:5.9,beam:15.2},kestrel:{length:35.2,height:10.7,beam:24},merlin:{length:41.6,height:10.4,beam:25.8}},aperture={length:213.87,height:24.12,beam:27.68},policy=shipSpecs.carrierPolicies.condor;
  const candidates=s.fleet.filter(c=>!c.carrierID&&!c.towID&&c.id!==id&&c.location===s.location).map(c=>{const envelope=envelopes[c.shipID],base=ships.find(h=>h.id===c.shipID),reason=!policy.allowedShipIDs.includes(c.shipID)||base.dryMass>policy.baseDryMassLimit?'This class is outside the approved hangar list.':Object.keys(aperture).some(k=>aperture[k]-envelope[k]<=policy.clearanceMargin)?'This fitting envelope does not clear the hangar.':stored.length>=policy.berths?'Both hangar berths are occupied.':v.hull<60||c.hull<35?'Carrier needs 60% and craft 35% integrity.':c.passengers?'Disembark passengers before stowing this craft.':c.freightCargo||(c.missionCargo||[]).some(l=>l.owner==='client')?'Deliver client freight before stowing its carrying hull.':!operationPermit(s,'carrier')?'Obtain the carrier expedition certificate.':s.credits<200?'Keep 200 cr for safe handling.':'';return {id:c.id,name:c.name,shipID:c.shipID,canEmbark:!reason,reason};});
  return {id,name:actorName(s,v),mass:v.carrierMass||0,stored:stored.map(c=>({id:c.id,name:c.name,shipID:c.shipID,mass:effectiveShip(c).dryMass+cargoMass(c)+c.fuel,canDeploy:v.hull>=35&&c.hull>=35&&s.credits>=200})),candidates};
 });
}
function civilianAction(s,type,arg){
 check(s.profile.created,'Sign your captain charter first.');check(destinationAccess(s,s.location).open,'A local access licence is required.');
 if(type==='op-permit'){const o=operationPermitOffers(s).find(o=>o.kind===arg.kind);check(o&&o.canBuy,o?.reason||'This authority has no such certificate offer.');s.credits-=o.price;ensureCivilian(s).permits.push({kind:o.kind,port:s.location,day:s.day,price:o.price});civilianRecord(s,'permit','Issued '+o.title+' for '+o.price+' cr.');return;}
 if(type==='op-survey'){const m=civilianMining(s);check(m?.canSurvey,m?.surveyReason||'No surveyed work is offered here.');s.credits-=m.surveyCost;advance(s,2);const draw=siteDraw(s);ensureCivilian(s).sites.push({...draw,day:s.day,extracted:0,paid:false});earn(s,'navigation',20);civilianRecord(s,'survey',`Surveyed local ${draw.kind==='ore'?'mineral':'ice'} deposit: ${draw.total} units, assay quality ${draw.quality}%. Two work days; finite reserve registered.`);return;}
 if(type==='op-extract'){const m=civilianMining(s);check(m?.canExtract,m?.extractionReason||'No extraction work is offered here.');const v=owned(s,m.miner),site=s.civilian.sites.find(v=>v.port===s.location);s.credits-=m.extractCost;v.spares--;site.extracted+=m.yieldUnits;if(m.kind==='ice')addCargo(v,'water',m.yieldUnits,{units:m.yieldUnits,cost:m.extractCost+180});else {v.oreUnits=(v.oreUnits||0)+m.yieldUnits;v.oreCost=(v.oreCost||0)+m.extractCost+180;}advance(s,2);if(m.hazard){v.hull=Math.max(1,v.hull-6);record(s,'Extraction vibration damaged the mining hull: −6 integrity.');}civilianRecord(s,'extraction',`Extracted ${m.yieldUnits} units of ${m.kind==='ice'?'water ice':'raw ore'}; ${m.extractCost} cr, one spare and two days. ${site.total-site.extracted} units remain. Each ore unit occupies 250 kg and is not refined metal.`);return;}
 if(type==='op-refine'){const v=owned(s,arg.ship);let n=Math.min(v.oreUnits||0,12);while(n>0){const trial={...v,oreUnits:v.oreUnits-n,cargo:{...v.cargo,metals:(v.cargo.metals||0)+n}};if(shipCargoFits(trial))break;n--;}const cost=servicePrice(s,n*45);check(portFacilities(s.location).spaceport&&(v.oreUnits||0)>0&&(v===s||v.location===s.location),'Bring extracted ore to a spaceport refinery desk.');check(n>0,'Free weight and volume for the refined goods and transport cases first.');check(s.credits>=cost,'Not enough credits to refine ore.');const basis=(v.oreCost||0)*n/v.oreUnits;s.credits-=cost;v.oreUnits-=n;v.oreCost=Math.max(0,(v.oreCost||0)-basis);addCargo(v,'metals',n,{units:n,cost:cost+basis});advance(s,2);earn(s,'engineering',5);civilianRecord(s,'refining',`Refined ${n} raw ore units into ${n} units of metal alloys for ${cost} cr over two days. Net material is conserved; transport cases add loaded weight.`);return;}
 if(type==='op-passenger-accept'){const offer=[...passengerOffers(s),...passengerOffers(s,true)].find(o=>o.id===arg.id);check(offer?.canAccept,offer?.reason||'This charter is no longer available for your operational fleet.');check(ensureCivilian(s).taken.length<2000,'This voyage has reached its charter booking limit.');const v=owned(s,offer.ship);if(offer.medical)removeFleetCargo(s,'medicine',2,true);v.passengers={id:offer.id,origin:offer.origin,destination:offer.destination,count:offer.count,medical:offer.medical,reward:offer.reward,delegation:offer.delegation,delegationBonus:offer.delegationBonus,acceptedDay:s.day,deadline:s.day+offer.duration,welfare:100,late:false};s.civilian.taken.push(offer.id);civilianRecord(s,'passenger-booked',`Booked ${offer.count} travellers aboard ${actorName(s,v)} for ${port(offer.destination).name}; ${offer.reward} cr on delivery by day ${v.passengers.deadline}. ${offer.delegation?'Delegation premium '+offer.delegationBonus+' cr requires on-time arrival, welfare/readiness 70+, and no illicit cargo. ':''}Care costs 2 cr per traveller per day; late, poor-welfare or emergency arrivals reduce payment and reputation.`);return;}
 if(type==='op-passenger-care'){const v=owned(s,arg.ship),j=v.passengers,cost=j?servicePrice(s,j.count*8):0;check(j&&(v===s||v.location===s.location)&&j.welfare<100,'Bring a passenger manifest needing medical care.');check(tradableQuantity(s,'medicine')>=1&&s.credits>=cost,'Care needs one owned medical unit and the quoted fee.');s.credits-=cost;removeFleetCargo(s,'medicine',1,true);advance(s,1);j.welfare=Math.min(100,j.welfare+40);civilianRecord(s,'passenger-care','Clinic treated '+j.count+' travellers for '+cost+' cr, one medical unit and one day; welfare +40.');return;}
 if(type==='op-passenger-deliver'||type==='op-passenger-cancel'){const v=owned(s,arg.ship);check(v.passengers&&(v===s||v.location===s.location),'Bring the passenger ship to this station.');if(type.endsWith('deliver'))check(s.location===v.passengers.destination,'Disembark at the booked destination.');passengerEnd(s,v,type.endsWith('deliver')?'completed':'disembarked');return;}
 if(type==='op-carrier-embark'||type==='op-carrier-deploy'){const c=carrierOverview(s)?.find(c=>c.id===arg.carrier);check(c&&operationPermit(s,'carrier'),'A local Condor and an expedition certificate are required.');const v=s.fleet.find(v=>v.id===arg.ship);check(v,'Choose an owned small craft.');if(type.endsWith('embark')){const o=c.candidates.find(o=>o.id===v.id);check(o?.canEmbark,o?.reason||'This craft cannot embark.');v.escort=false;v.carrierID=c.id;}else{const o=c.stored.find(o=>o.id===v.id);check(o?.canDeploy,'Both hulls need serviceable integrity and 200 cr for safe deployment.');delete v.carrierID;v.escort=true;v.location=s.location;}s.credits-=200;civilianSync(s);advance(s,1);civilianRecord(s,'carrier',`${actorName(s,v)} ${type.endsWith('embark')?'secured inside':'deployed from'} ${c.name}. One stopped day and 200 cr handling. Stored craft do not fight or add shared stores.`);return;}
 check(false,'Unknown civilian operation.');
}
function civilianOverview(s){return {known:operationKinds.filter(k=>operationKnown(s,k)),permits:operationPermitOffers(s),mining:civilianMining(s),passengers:passengerManifest(s),offers:passengerOffers(s),medicalOffers:passengerOffers(s,true),carriers:carrierOverview(s),ore:operationShips(s).filter(v=>v.oreUnits&&(v===s||v.location===s.location)).map(v=>({ship:actorID(s,v),name:actorName(s,v),units:v.oreUnits,cost:servicePrice(s,Math.min(12,v.oreUnits)*45)})),history:s.civilian?.history||[]};}
function validateCivilian(s){
 const c=s.civilian,all=operationShips(s),ids=new Map(all.map(v=>[actorID(s,v),v]));
 if(c!==undefined){check(c&&integer(c.completedPassengers??0,0,2000),'Invalid completed civilian service record.');check(c&&c.version===1&&Array.isArray(c.discoveries)&&c.discoveries.length<=3&&new Set(c.discoveries.map(d=>d.kind)).size===c.discoveries.length&&c.discoveries.every(d=>operationKinds.includes(d.kind)&&world.ports.some(p=>p.id===d.port)&&integer(d.day,0,s.day)),'Invalid specialist introductions.');check(Array.isArray(c.permits)&&c.permits.length<=28&&new Set(c.permits.map(p=>p.kind==='mining'?p.kind+':'+p.port:p.kind)).size===c.permits.length&&c.permits.every(p=>operationKnown(s,p.kind)&&world.ports.some(w=>w.id===p.port)&&integer(p.day,0,s.day)&&integer(p.price,1,10000)&&(p.kind!=='mining'||fieldPorts[p.port])),'Invalid operating certificates.');check(Array.isArray(c.sites)&&c.sites.length<=26&&new Set(c.sites.map(v=>v.port)).size===c.sites.length&&c.sites.every(v=>{const d=siteDraw(s,v.port);return fieldPorts[v.port]&&v.kind===d.kind&&v.total===d.total&&v.quality===d.quality&&integer(v.extracted,0,v.total)&&integer(v.day,0,s.day)&&v.paid===false;}),'Invalid finite deposit register.');check(Array.isArray(c.taken)&&c.taken.length<=2000&&new Set(c.taken).size===c.taken.length&&c.taken.every(id=>typeof id==='string'&&/^[a-z-]+:\d+:(passenger|medical):[01]$/.test(id))&&Array.isArray(c.history)&&c.history.length<=80&&c.history.every(h=>integer(h.day,0,s.day)&&world.ports.some(p=>p.id===h.port)&&str(h.kind,40)&&str(h.text,2000)),'Invalid civilian mission history.');}
 for(const v of all){check(v.oreUnits===undefined? v.oreCost===undefined:integer(v.oreUnits,0,1000)&&finite(v.oreCost,0,10000000)&&(v.oreUnits>0||v.oreCost<1e-7),'Invalid extracted ore manifest.');const j=v.passengers;if(j!==undefined)check(c&&c.taken.includes(j.id)&&operationPermit(s,'passengers')&&['curlew','ibis'].includes(v.shipID)&&typeof j.medical==='boolean'&&(j.medical?v.shipID==='ibis':v.shipID==='curlew')&&world.ports.some(p=>p.id===j.origin)&&world.ports.some(p=>p.id===j.destination)&&j.origin!==j.destination&&integer(j.count,1,j.medical?8:24)&&integer(j.reward,1,100000000)&&integer(j.acceptedDay,0,s.day)&&integer(j.deadline,j.acceptedDay,365249)&&integer(j.welfare,0,100)&&typeof j.late==='boolean'&&(s.day<=j.deadline||j.late),'Invalid passenger manifest.');
  if(v.carrierID!==undefined){const carrier=ids.get(v.carrierID),policy=shipSpecs.carrierPolicies.condor;check(v!==s&&carrier&&carrier.shipID==='condor'&&policy.allowedShipIDs.includes(v.shipID)&&ships.find(h=>h.id===v.shipID).dryMass<=policy.baseDryMassLimit&&!v.escort&&!j&&v.location===(carrier===s?s.location:carrier.location)&&operationPermit(s,'carrier'),'Invalid embarked craft.');}
  const carried=all.filter(x=>x.carrierID===actorID(s,v)),mass=carried.reduce((n,x)=>n+effectiveShip(x).dryMass+cargoMass(x)+x.fuel,0);check(carried.length<=2&&finite(v.carrierMass||0,0,10000)&&Math.abs((v.carrierMass||0)-mass)<1e-7,'Invalid carrier payload mass.');
 }
 check(new Set(all.filter(v=>v.passengers).map(v=>v.passengers.id)).size===all.filter(v=>v.passengers).length,'Duplicated passenger charter.');
}

const stationSpecialties={earth:'civil','moon':'industry',mars:'industry',phobos:'recovery',ceres:'industry',callisto:'fuel',titan:'cold',mercury:'science',venus:'science','earth-high':'engineering',deimos:'recovery',jupiter:'patrol',io:'science',europa:'science',ganymede:'relief',saturn:'civil',enceladus:'science',rhea:'fuel',iapetus:'patrol',uranus:'survey',miranda:'recovery',ariel:'industry',titania:'engineering',oberon:'industry',neptune:'signals',triton:'archives'};
const missionRecipes=[
 {kind:'local',title:'Neighborhood supply',venue:'contracts',ships:['kestrel'],faction:'industrial',good:'food',units:4,local:true,owned:true,trust:10,deliveries:3},
 {kind:'express',title:'Priority dispatch',venue:'contracts',ships:['swift'],faction:'industrial',good:'electronics',units:6,premium:.15,cap:4000},
 {kind:'sealed',title:'Sealed diplomatic case',venue:'contracts',ships:['swift'],faction:'scientific',good:'electronics',units:1,trust:15,certificate:'sealed'},
 {kind:'consolidated',title:'Consolidated freight',venue:'contracts',ships:['peregrine'],faction:'industrial',good:'machinery',units:20,premium:.05,cap:3000},
 {kind:'cold',title:'Certified cold-chain freight',venue:'contracts',ships:['tern'],faction:'relief',good:'medicine',units:20,certificate:'cold',premium:.2,cap:6000},
 {kind:'industrial',title:'Oversized machinery',venue:'contracts',ships:['cormorant'],faction:'industrial',good:'machinery',units:48,certificate:'industrial',premium:.12,cap:6000},
 {kind:'bulk',title:'Bulk supply charter',venue:'contracts',ships:['pelican'],faction:'industrial',good:'water',units:80},
 {kind:'depot',title:'Remote depot supply',venue:'contracts',ships:['albatross'],faction:'industrial',good:'machinery',units:40,premium:.1,cap:10000},
 {kind:'fuel',title:'Stranded convoy supply',venue:'contracts',ships:['petrel'],faction:'relief',units:12,tank:true},
 {kind:'escort',title:'Protected merchant passage',venue:'relay',ships:['osprey','gannet'],faction:'patrol',units:0,premium:.1,cap:3000},
 {kind:'response',title:'Rapid response warrant',venue:'security',ships:['merlin'],faction:'patrol',units:0,work:true,premium:.1,cap:3000,short:true},
 {kind:'investigation',title:'Raider investigation chain',venue:'security',ships:['gyrfalcon'],faction:'patrol',units:4,work:true,rank:3,standing:15,certificate:'recovery'},
 {kind:'survey',title:'Survey archive commission',venue:'relay',ships:['heron'],faction:'scientific',units:1,work:true},
 {kind:'signals',title:'Two-observation signal study',venue:'relay',ships:['nightjar'],faction:'scientific',units:1,work:true,rank:3},
 {kind:'recovery',title:'Lawful wreck recovery',venue:'relay',ships:['rook'],faction:'industrial',units:8,work:true,certificate:'recovery'},
 {kind:'evidence',title:'Sealed site evidence',venue:'security',ships:['rook'],faction:'patrol',units:4,work:true,certificate:'recovery'},
 {kind:'cold-store',title:'Cold-store handling',venue:'contracts',ships:['tern'],faction:'industrial',good:'medicine',units:12,local:true,work:true,certificate:'cold'},
 {kind:'assay',title:'Assayed ore supply',venue:'contracts',ships:['sanderling'],faction:'industrial',units:12,local:true,owned:true,premium:.1,cap:5000},
 {kind:'relief',title:'Field stabilization and evacuation',venue:'relay',ships:['ibis'],faction:'relief',units:8,work:true,patient:true},
 {kind:'workshop',title:'Station machinery restoration',venue:'shipyard',ships:['crane'],faction:'industrial',units:4,work:true},
 {kind:'staging',title:'Expedition recovery point',venue:'relay',ships:['condor'],faction:'scientific',units:4,work:true},
 {kind:'project',title:'Station construction milestone',venue:'relay',ships:['pelican','cormorant','crane'],faction:'industrial',good:'machinery',units:24,local:true,owned:true,project:true}
];
// Dispatch moved to Communications; preserve the issuing desk on signed legacy contracts.
const transportLegacyVenues={'escort':'security','relief':'clinic','cold-relief':'clinic','medical-evacuation':'clinic','delegation-followup':'contracts'};
function missionCoordinationVenue(j){return Object.hasOwn(transportLegacyVenues,j.kind)?'relay':j.venue;}
function campaignState(s){return s.campaign||(s.campaign={version:1,known:[],jobs:[],receipts:[],standing:{patrol:0,industrial:0,scientific:0,relief:0,underworld:0},leads:[],raiders:[],concessions:[],surveys:[],lastFieldDay:null,suspendedUntil:0});}
const campaignKnown=(s,k)=>!!s.campaign?.known.includes(k);
function factionStanding(s,id){return s.campaign?.standing[id]||0;}
function campaignStanding(s,id,n){const c=campaignState(s);c.standing[id]=Math.max(-100,Math.min(100,c.standing[id]+n));}
function campaignReceipt(s,id,kind,text){const c=campaignState(s);check(!c.receipts.some(r=>r.id===id),'That objective has already been settled.');c.receipts.push({id,kind,day:s.day,port:s.location,text});record(s,text);}
function campaignIntroductions(s,venue){
 if(!s.profile.created)return [];
 return missionRecipes.filter(r=>r.venue===venue&&!campaignKnown(s,r.kind)&&(!r.chain||!expeditionPrerequisite(s,r))&&(earnedShipExperience(s)>=200&&s.profile.stats.voyages>=3||(r.chain?r.ships.every(id=>fleetMembers(s).some(v=>v.shipID===id)):fleetMembers(s).some(v=>r.ships.includes(v.shipID))))).map(r=>({id:'campaign-intro-'+r.kind,name:'Tell me about '+r.title.toLowerCase()+'.',detail:'Discover the requirements and quoted work'}));
}
function campaignIntroduce(s,kind,venue){const r=missionRecipes.find(r=>r.kind===kind&&r.venue===venue);check(r&&campaignIntroductions(s,venue).some(o=>o.id==='campaign-intro-'+kind),'This introduction is not available here.');campaignState(s).known.push(kind);return `${r.title} is now in this desk’s work register. ${r.ships.map(id=>ships.find(h=>h.id===id).name).join(r.chain?' + ':' or ')} crews can provide the specialist service; ${r.chain?'this linked expedition requires each assigned role. Solo crews can continue using the individual charters.':'a quoted station contractor is available for most solo charters.'} Review the assigned vessels, cargo ownership, destination, time, reward and liability before accepting. No offer is accepted through this conversation.`;}
function missionPatientDaily(s){return (s.campaign?.jobs||[]).filter(j=>j.chain&&j.status==='active').reduce((n,j)=>n+j.manifest.filter(m=>m.kind==='patients'&&fleetMembers(s).some(v=>actorID(s,v)===m.ship)).reduce((a,m)=>a+m.count*2,0),0)+ (s.campaign?.jobs||[]).filter(j=>j.status==='active'&&j.patient&&j.stage>0&&fleetMembers(s).some(v=>actorID(s,v)===(j.assigned||s.flagshipID))).reduce((n,j)=>n+j.units*2,0);}
function missionMass(v){return (v.missionCargo||[]).reduce((n,l)=>n+l.mass,0);}
function missionFuel(v){return (v.missionCargo||[]).filter(l=>l.kind==='fuel').reduce((n,l)=>n+l.mass,0);}
function missionHold(v){return (v.missionCargo||[]).filter(l=>l.kind!=='fuel').reduce((n,l)=>n+l.mass,0);}
function missionLot(s,v,j,kind,mass,owner='client'){const list=v.missionCargo||(v.missionCargo=[]);check(list.length<100,'This hull’s special-cargo register is full.');check(kind==='fuel'?v.fuel+missionFuel(v)+mass<=shipRules.effectiveShip(v).tankTonnes+1e-7:physicalRoom(v,mass,mass*(kind==='patients'?10:['component','antiquity'].includes(kind)?4:2)),'This physical shipment does not fit its assigned hull.');list.push({id:j.id+':'+list.length,mission:j.id,kind,mass,owner,origin:j.origin,day:s.day});}
function removeMissionLots(s,id){for(const v of operationShips(s)){v.missionCargo=(v.missionCargo||[]).filter(l=>l.mission!==id);if(!v.missionCargo.length)delete v.missionCargo;}}
function missionCargoMass(s,id){return operationShips(s).reduce((n,v)=>n+(v.missionCargo||[]).filter(l=>l.mission===id).reduce((a,l)=>a+l.mass,0),0);}
function missionShips(s,r){return fleetMembers(s).filter(v=>r.ships.includes(v.shipID)&&v.hull>=50&&!v.carrierID&&!v.towID);}
function missionCertificate(s,kind){return !!s.campaign?.known.includes('certificate:'+kind);}
function missionPermitOffers(s){const definitions=[['recovery','Lawful recovery',1800,2],['industrial','Industrial handling',1500,1],['cold','Cold-chain handling',1800,1],['sealed','Sealed dispatch handling',2200,1]];return definitions.filter(([k])=>!missionCertificate(s,k)&&missionRecipes.some(r=>r.certificate===k&&campaignKnown(s,r.kind))).map(([kind,title,fee,rank])=>{const price=servicePrice(s,fee),reason=earnedLevel(s,'engineering')<rank?'Engineering level '+rank+' is required.':stationStanding(s).effective<0?'Restore nonnegative local standing.':s.credits<price?'Not enough credits.':'';return {kind,title,price,reason,canBuy:!reason};});}
function missionOffers(s,venue){
 const active=s.campaign?.jobs.filter(j=>j.status==='active')||[],cycle=Math.floor(s.day/30),here=s.location;
 if(s.incident||!s.profile.created||(s.campaign?.suspendedUntil||0)>s.day)return [];
 const destinations=world.ports.filter(p=>p.id!==here&&destinationAccess(s,p.id).open).sort((a,b)=>routeTransfer(s,a.id).coastDays-routeTransfer(s,b.id).coastDays);
 return missionRecipes.filter(r=>!r.chain&&r.venue===venue&&campaignKnown(s,r.kind)).flatMap(r=>r.kind==='consolidated'?[{...r,client:0},{...r,client:1},{...r,client:2}]:[{...r,client:0}]).map(r=>{
  const leads=(s.campaign?.leads||[]).filter(l=>l.kind==='wreck'&&!l.used&&destinationAccess(s,l.port).open);const eligible=destinations.filter(p=>r.kind==='cold'?['earth','moon','mars','titan','europa','enceladus','ganymede'].includes(p.id):r.kind==='industrial'?portFacilities(p.id).spaceport:true);
  const h=hash('specialist-v1:'+s.castSeed+':'+here+':'+cycle+':'+r.kind+':'+r.client);if(r.kind==='bulk')r.units=40+Number(h%81n);if(r.patient)r.units=4+Number(h/53n%9n);const evidenceCrew=(s.campaign?.raiders||[]).find(c=>!s.campaign.jobs.some(j=>j.kind==='evidence'&&j.crew===c.id)&&destinationAccess(s,world.ports.find(p=>p.group===c.group).id).open),remote=destinations.filter(p=>system(p.group).au>=2&&p.group!==port(here).group),stagingSite=(s.campaign?.surveys||[]).find(pid=>destinationAccess(s,pid).open&&pid!==here),destination=r.kind==='evidence'?(evidenceCrew?world.ports.find(p=>p.group===evidenceCrew.group).id:null):r.kind==='staging'?(stagingSite||null):r.kind==='depot'?(remote[0]?.id||null):r.kind==='recovery'?(leads[0]?.port||null):r.local?here:eligible.length?eligible[Number(h%BigInt(Math.min(4,eligible.length)))].id:null;
  if(!destination)return null;
  if(['cold','cold-store'].includes(r.kind)&&!['earth','moon','mars','titan','europa','enceladus','ganymede'].includes(here))return null;
  if(r.kind==='industrial'&&!portFacilities(here).spaceport)return null;
  if(r.kind==='recovery'&&!(s.campaign?.leads||[]).some(l=>l.kind==='wreck'&&!l.used&&l.port===destination))return null;
  const threatTier=system(port(destination).group).au>=10?3:system(port(destination).group).au>=2?2:1,threatBudget=[0,2,5,8][threatTier];
  if(r.kind==='depot'&&remote.length<2)return null;
  const id=here+':'+cycle+':'+r.kind+(r.kind==='consolidated'?':'+r.client:r.kind==='evidence'?':'+evidenceCrew.id:''),tools=missionShips(s,r).filter(v=>r.kind!=='express'||v===s),specialist=tools[0],baseDays=destination===here?2:routeTransfer(s,destination).coastDays+routeTransfer(s,destination).waitDays+(r.kind==='depot'?routeTransfer({...s,location:destination},remote[1].id).coastDays:0),duration=r.kind==='depot'?baseDays+180:r.short?baseDays+15:r.work?baseDays*2+120:baseDays+90,cargoValue=r.good?Math.max(tradeTotal(s,r.good,Math.max(1,r.units),true),tradeTotal({...s,location:destination},r.good,Math.max(1,r.units),true)):r.tank?r.units*port(here).fuelPrice:r.units*300,grade=s.civilian?.sites.find(v=>v.port===here),stage=s.campaign?.concessions.find(c=>c.port===here)?.stage||0;
  const reference=specialist?.shipID||r.ships[0],workDays=r.work?(['survey','signals','staging','cold-store','response'].includes(r.kind)?1:2):r.local?2:0,cost=serviceRouteCost(s,destination,{shipID:reference,mass:r.patient?r.units*.2:r.units*.25,returnTrip:!!r.work&&!r.local,stops:r.kind==='depot'?[remote[1].id]:[],workDays,passengers:r.patient?r.units:0}),supply=r.patient?tradeTotal(s,'medicine',Math.ceil(r.units/4)*workDays,true):r.work?sparePrice(s)*(r.kind==='workshop'?Math.ceil(ships.find(h=>h.id===reference).dryMass/25):1):0,bulkCost=cost.operating,fee=Math.ceil(serviceReward(cost,{cargoValue,work:workDays,extra:supply+(specialist?0:servicePrice(s,r.work?600:350))})*(1+(['recovery','assay'].includes(r.kind)?captainPerk(s,'salvageFee'):0))),bonus=specialist&&r.kind!=='consolidated'?Math.min(Math.max(r.cap||0,Math.ceil(cost.hullValue*.025)),Math.round(fee*(r.premium||0))):0,lease=specialist?0:servicePrice(s,r.work?600:350);
  const required=r.patient?r.units*.2:r.units*.25,hasSpace=r.owned||r.work&&r.kind!=='cold-store'||r.units===0||(specialist&&['cold','cold-store','industrial','fuel','bulk','depot'].includes(r.kind)?[specialist]:fleetMembers(s)).some(v=>r.tank?v.fuel+missionFuel(v)+required<=shipRules.effectiveShip(v).tankTonnes:physicalRoom(v,required,required*(r.patient?10:2)));
  const reason=['cold','cold-store','industrial','fuel','bulk','depot','evidence','relief'].includes(r.kind)&&!specialist?'Bring an operational '+r.ships.map(id=>ships.find(h=>h.id===id).name).join(' or ')+' for this specialist allocation.':fee+bonus>9000000?'This route exceeds the charter budget.':r.kind==='recovery'&&destination===here?'Travel to another port to commission this discovered wreck.':r.kind==='cold'&&!['earth','moon','mars','titan','europa','enceladus','ganymede'].includes(destination)?'The receiving port has no certified cold store.':r.kind==='industrial'&&!portFacilities(destination).spaceport?'The receiving port has no heavy handling facility.':s.campaign?.jobs.some(j=>j.id===id)?'Already accepted or settled.':active.length>=3?'At most three specialist contracts may be active.':r.rank&&earnedLevel(s,'navigation')<r.rank?'Navigation level '+r.rank+' is required.':r.trust&&(s.profile.relationships[here]||0)<r.trust?'Local trust +'+r.trust+' is required.':r.deliveries&&(s.campaign?.localDeliveries?.[here]||0)<r.deliveries?'Complete '+r.deliveries+' deliveries first.':r.standing&&factionStanding(s,r.faction)<r.standing?'Earn '+r.standing+' '+r.faction+' standing first.':r.certificate&&!missionCertificate(s,r.certificate)?'Ask the authority about '+r.certificate+' certification.':r.kind==='assay'&&(!grade||grade.kind!=='ore'||grade.total-grade.extracted<r.units)?'A surveyed ore deposit with enough unextracted reserve is required.':r.kind==='staging'&&(!specialist||specialist.hull<60||!fleetMembers(s).some(v=>['kestrel','swift','merlin'].includes(v.shipID)&&v.hull>=35))?'Bring a Condor and an operational deployed small craft.':r.kind==='staging'&&s.campaign?.jobs.some(j=>j.kind==='staging'&&j.status==='completed'&&operationShips(s).some(v=>actorID(s,v)===j.assigned&&v.hull>=60))?'An expedition recovery point is already established.':r.project&&stage>=3?'This station project is complete.':!hasSpace?'Free the quoted shipment space in one eligible hull.':s.credits<lease?'Not enough credits for the quoted station contractor.':s.day+duration>=365250?'Deadline exceeds the calendar.':'';
  return {id,bulkCost,crew:r.kind==='evidence'?evidenceCrew.id:null,stops:r.kind==='depot'?[destination,remote[1].id]:null,threatTier,threatBudget,client:here+':client:'+r.client,kind:r.kind,title:r.title,venue,origin:here,destination,units:r.units,mass:required,good:r.good||null,owner:r.owned?'captain':'client',work:!!r.work,patient:!!r.patient,tank:!!r.tank,local:!!r.local,faction:r.faction,reward:fee+bonus+(r.owned?(r.good?cargoValue:r.kind==='assay'?tradeTotal(s,'metals',r.units,false):0):0),bonus,lease,liability:r.owned?200:Math.ceil(cargoValue*1.2),duration,assigned:specialist?actorID(s,specialist):null,baselineExtraction:grade?.extracted||0,projectStage:r.project?stage+1:0,reason,canAccept:!reason,description:r.kind==='escort'?'Escort the protected merchant to the receiving station. The merchant must survive; report to the station coordinator at Communications for payment.':r.kind==='response'?'Reach '+port(destination).name+' and stabilize the named disabled civilian vessel Merchant '+['Aster','Cairn','Hearth'][Number(hash(id)%3n)]+'. Perform the rescue, then report to the receiving patrol; arrival alone does not earn payment.':r.work?'Visit the named destination, perform the work, and return to this issuing desk.':r.local?'Supply your own eligible goods to this local desk.':'Deliver the physical sealed consignment to the receiving station.',terms:`${fee+bonus} cr service fee (${bonus} cr class premium)${r.owned?' plus '+(r.good?cargoValue:r.kind==='assay'?tradeTotal(s,'metals',r.units,false):0)+' cr quoted supply reimbursement':''}; ${lease} cr station-contractor charge; ${duration} days from acceptance. Failure: −4 reputation, −5 issuing trust and ${r.owned?200:Math.ceil(cargoValue*1.2)} cr liability. ${r.owned?'Provide and hand over your own supplies.':'Client lots remain reserved and are not your property.'}${r.kind==='consolidated'?' A shared 5% batch premium, capped at 3,000 cr, pays once after two distinct clients accepted on the same day are completed.':''}${r.kind==='escort'?' Protected merchant must survive. The class premium requires arrival above 70% integrity; declared threat budget '+threatBudget+'.':''}${r.work?' Field work takes '+(['survey','signals','staging','cold-store','response'].includes(r.kind)?1:2)+' stopped day(s)'+(['recovery','evidence','staging','response'].includes(r.kind)?' and one engineering spare on the assigned specialist (a paid station contractor supplies its own)' :r.kind==='workshop'?' and hull-scaled workshop spares':'')+'. Work-lot space must remain free.':''}${r.patient?' Temporary ward capacity: 12. Stabilization needs one owned medical unit per four patients, rounded up, per treatment day; subsequent care costs 2 cr per patient per stopped or travelling day until clinic handover.':''}${r.kind==='sealed'?' Deliberately abandoning or opening a diplomatic case is theft (−12 reputation, −10 trust and 60-day suspension).':''}${r.kind==='bulk'?' Direct route cost estimate '+bulkCost+' cr, operating allowance with 15% margin; '+r.units+' sealed units.':''}${r.kind==='depot'?' Two mandatory stops, in order: '+port(destination).name+' then '+port(remote[1].id).name+'. Half the physical lot is handed over at each stop; the total fee pays only after both legs.':''}${r.project?' The final local concession is 5% on basic repairs and warehouse bays, expires after 180 days and stays within discount caps.':''}${r.kind==='cold'?' The cold-chain premium is forfeited if its specialist falls below 50% integrity.':''}`};
 }).filter(Boolean).filter(o=>!s.campaign?.jobs.some(j=>j.id===o.id)).concat(expeditionOffers(s,venue));
}
function missionFail(s,j,reason){if(j.status!=='active')return;j.status=reason==='theft'?'stolen':'failed';j.closedDay=s.day;removeMissionLots(s,j.id);if(j.chain){expeditionCleanup(s,j);j.manifest=[];j.mass=0;}invoice(s,j.liability);changeReputation(s,reason==='theft'?-12:-4,'Specialist charter '+reason+'.');changeStationReputation(s,j.origin,reason==='theft'?-10:-5,'Specialist charter '+reason+'.');campaignStanding(s,j.faction,-4);if(reason==='theft'){campaignStanding(s,'underworld',4);campaignState(s).suspendedUntil=s.day+60;}campaignReceipt(s,j.id,'failure',j.title+': '+reason+'. '+j.liability+' cr liability charged; no reward.');}
function campaignAdvance(s,days,travelPaid){for(const j of s.campaign?.jobs||[])if(j.chain&&j.status==='active'){for(const m of j.manifest.filter(m=>m.kind==='patients')){if(!(travelPaid&&fleetMembers(s).some(v=>actorID(s,v)===m.ship)))invoice(s,m.count*2*days);}if(crewReadiness(s)<50)j.premiumIntact=false;}for(const j of s.campaign?.jobs||[])if(j.status==='active'&&j.patient&&j.stage>0&&!(travelPaid&&fleetMembers(s).some(v=>actorID(s,v)===(j.assigned||s.flagshipID))))invoice(s,j.units*2*days);for(const j of s.campaign?.jobs||[])if(j.status==='active'&&s.day>j.deadline)missionFail(s,j,'expired');}
function campaignReconcile(s){for(const j of s.campaign?.jobs||[]){if(j.status!=='active')continue;if(j.chain){expeditionReconcile(s,j);continue;}if(j.assigned&&!operationShips(s).some(v=>actorID(s,v)===j.assigned)){missionFail(s,j,'assigned hull lost');continue;}if(j.kind==='cold'&&j.assigned&&!operationShips(s).some(v=>actorID(s,v)===j.assigned&&v.hull>=50))j.coldIntact=false;const needed=j.work?(j.kind==='cold-store'||j.stage>0)&&j.units>0:j.owner==='client'&&j.units>0;if(needed&&missionCargoMass(s,j.id)+1e-7<j.mass)missionFail(s,j,'reserved shipment lost');}}
function missionWorkQuote(s,j){
 if(j.chain)return expeditionQuote(s,j);
 const r=missionRecipes.find(r=>r.kind===j.kind),tool=j.assigned?operationShips(s).find(v=>actorID(s,v)===j.assigned):null,local=tool&&(tool===s||tool.location===s.location)&&fleetMembers(s).includes(tool),days=['signals','staging','survey','cold-store','response'].includes(j.kind)?1:2,units=j.assigned&&tool&&['recovery','evidence','staging','response'].includes(j.kind)?1:j.assigned&&tool&&j.kind==='workshop'?Math.max(1,Math.ceil(ships.find(h=>h.id===tool.shipID).dryMass/25)):0,medicine=j.patient?Math.ceil(j.units/4)*days:0;
 const reason=j.patient&&(tool?.missionCargo||[]).filter(l=>l.kind==='patients').reduce((n,l)=>n+l.mass/.2,0)+j.units>12?'Only twelve temporary patient berths fit this Ibis.':j.kind==='staging'&&(!tool||tool.hull<60||!fleetMembers(s).some(v=>['swift','kestrel','merlin'].includes(v.shipID)&&v.hull>=35))?'Keep the Condor at 60% and one approved small craft deployed.':j.stage===0&&j.kind!=='cold-store'&&j.units>0&&!physicalRoom(tool||s,j.mass,j.mass*(j.patient?10:2))?'Free the quoted work-lot space on the working hull first.':s.day+days>j.deadline?'There is not enough time before the deadline.':j.kind==='signals'&&j.stage>=2?'Both observations are already recorded.':j.status!=='active'?'This work is no longer active.':s.location!==j.destination?'Travel to the work location.':j.assigned&&!local?'Bring the assigned specialist hull in the active fleet.':tool&&tool.hull<50?'Repair the assigned specialist hull to 50%.':j.stage>0&&j.kind!=='signals'?'This field objective has already been completed.':j.kind==='signals'&&j.stage===1&&s.profile.stats.voyages<=(j.observedVoyages??j.baselineVoyages)&&s.day<j.lastObservation+7?'Separate observations by one completed route leg or seven days.':units&&tool.spares<units?'Need '+units+' interchangeable engineering spares on the specialist.':medicine>tradableQuantity(s,'medicine')?'Supply '+medicine+' owned medical units.':j.kind==='staging'&&operationShips(s).some(v=>v.passengers)?'Disembark passenger charters before staging heavy recovery work.':'';
 return {days,units,medicine,reason,canWork:!reason};
}
function missionCompleteReason(s,j){if(j.chain)return expeditionCompleteReason(s,j);const r=missionRecipes.find(r=>r.kind===j.kind),end=j.work&&j.kind!=='response'?j.origin:j.destination;if(j.status!=='active')return 'Already settled.';if(j.assigned&&!fleetMembers(s).some(v=>actorID(s,v)===j.assigned&&v.hull>=50))return 'Bring the assigned specialist hull at 50% integrity or better.';if(j.kind==='express'&&j.bonus>0&&j.assigned!==s.flagshipID)return 'The assigned Swift must remain flagship for its express premium.';if(s.location!==end)return 'Report at '+port(end).name+'.';if(j.kind==='escort'&&j.protectedHull<=0)return 'The protected merchant was lost.';if(j.work&&j.stage<(j.kind==='signals'?2:1))return 'Complete the field objective first.';if(j.kind==='escort'||j.kind==='response')if(s.profile.stats.voyages<=j.baselineVoyages)return 'Complete a new voyage to the receiving station.';if(j.owner==='captain'&&j.good&&tradableQuantity(s,j.good)<j.units)return 'Supply the quoted quantity of your own cargo.';if(j.kind==='assay'){const site=s.civilian?.sites.find(v=>v.port===j.origin);if(!site||site.extracted-j.baselineExtraction<j.units||fleetMembers(s).reduce((n,v)=>n+(v.oreUnits||0),0)<j.units)return 'Extract the contracted ore after accepting this assay order.';}if(j.kind==='investigation'&&!(s.campaign?.raiders.find(r=>r.id===j.leader)?.captured))return 'Confirm the leader, then encounter and defeat that crew in ordinary travel.';return '';}
function missionJournal(s){const entries=(s.campaign?.jobs||[]).map(j=>({...j,coordinationVenue:missionCoordinationVenue(j),...(j.chain?{objectives:expeditionSteps(s,j).map((step,i)=>({title:step.title,port:step.port,done:i<j.stepIndex})),nextPort:expeditionSteps(s,j)[j.stepIndex]?.port||expeditionSteps(s,j).at(-1).port,physicalManifest:expeditionLoads(s,j),assignedShips:expeditionDef(j).ships.map(role=>({role:ships.find(h=>h.id===role).role,id:j.bindings[role],name:expeditionHull(s,j,role)?actorName(s,expeditionHull(s,j,role)):'Lost'}))}:{}),station:port(j.origin).name,receivingStation:port(j.destination).name,remaining:j.deadline-s.day,canComplete:!missionCompleteReason(s,j),completeReason:missionCompleteReason(s,j),canAnalyzeSignal:j.kind==='signals'&&j.stage===2&&!j.signalAnalysis&&s.location===j.origin&&earnedLevel(s,'engineering')>=2&&s.credits>=150,workQuote:j.work?missionWorkQuote(s,j):null}));return {legacy:[...activeContracts(s).map(c=>({id:c.id,title:'Client freight to '+port(c.destination).name,deadline:c.deadline,source:'freight office'})),...passengerManifest(s).map(j=>({id:j.id,title:j.medical?'Medical transfer':'Passenger charter',deadline:j.deadline,source:'passenger dispatch'})),...commissionJournal(s).map(j=>({id:j.id,title:j.title,deadline:j.deadline,source:'personal commission'})),...(s.cantina?.quests||[]).filter(j=>j.status==='active').map(j=>({id:j.id,title:j.title,deadline:j.deadline,source:'secret commission'}))],active:entries.filter(j=>j.status==='active'),history:entries.filter(j=>j.status!=='active'),intel:(s.campaign?.raiders||[]).filter(r=>r.group===port(s.location).group).map(r=>({...r})),staging:(s.campaign?.jobs||[]).filter(j=>j.kind==='staging'&&j.status==='completed').map(j=>({port:j.destination,availableDay:(j.lastRecovery??-30)+30})),standing:s.campaign?.standing||{},receipts:s.campaign?.receipts||[],specialty:stationSpecialties[s.location]};}
function campaignAction(s,type,arg){
 check(s.profile.created&&!s.incident&&!s.fleetLoss,'Use station and field services only while safely stopped.');
 if(type==='campaign-permit'){const o=missionPermitOffers(s).find(o=>o.kind===arg.kind);check(o?.canBuy,o?.reason||'No such certificate is offered.');s.credits-=o.price;campaignState(s).known.push('certificate:'+o.kind);record(s,o.title+' certificate issued for '+o.price+' cr.');return;}
 if(type==='mission-accept'){const offer=missionOffers(s,arg.venue).find(o=>o.id===arg.id);check(offer?.canAccept,offer?.reason||'This offer is no longer available.');const c=campaignState(s);check(c.jobs.length<500&&c.receipts.length<2000,'This voyage’s specialist register is full.');s.credits-=offer.lease;const j={...offer,coldIntact:true,protectedHull:100,protectedName:'Merchant '+['Aster','Cairn','Hearth'][Number(hash(offer.id)%3n)],status:'active',acceptedDay:s.day,deadline:s.day+offer.duration,stage:0,closedDay:null,baselineVoyages:s.profile.stats.voyages,lastObservation:s.day};delete j.reason;delete j.canAccept;
  if(j.chain){j.premiumIntact=true;j.manifest=[];j.stepIndex=0;c.jobs.push(j);record(s,'Accepted '+j.title+'. '+j.terms);return;}
  if(j.kind==='recovery'){const lead=c.leads.find(l=>l.kind==='wreck'&&!l.used&&l.port===j.destination);check(lead,'Survey a finite wreck lead first.');lead.used=true;j.lead=lead.id;}
  if(j.kind==='depot'){j.stopIndex=0;j.legDeadlines=[j.acceptedDay+routeTransfer(s,j.stops[0]).coastDays+90,j.deadline];j.deadline=j.legDeadlines[0];}
  if((!j.work||j.kind==='cold-store')&&j.owner==='client'&&j.units){const preferred=j.assigned?fleetMembers(s).find(v=>actorID(s,v)===j.assigned):null;const v=[...(preferred?[preferred]:[]),...fleetMembers(s).filter(v=>v!==preferred&&(!['cold','cold-store','fuel','industrial','bulk','depot'].includes(j.kind)||!preferred))].find(v=>j.tank?v.fuel+missionFuel(v)+j.mass<=shipRules.effectiveShip(v).tankTonnes:physicalRoom(v,j.mass));check(v,'The reserved shipment no longer fits.');missionLot(s,v,j,j.tank?'fuel':'sealed',j.mass);j.carrying=actorID(s,v);}c.jobs.push(j);record(s,'Accepted '+j.title+'. '+j.terms);return;}
 const j=s.campaign?.jobs.find(j=>j.id===arg.id);check(j&&j.status==='active','Choose an active specialist contract.');
 if(j.chain){expeditionAction(s,type,arg,j);return;}
 if(type==='signal-analyze'){check(j.kind==='signals'&&j.stage===2&&!j.signalAnalysis&&s.location===j.origin&&earnedLevel(s,'engineering')>=2&&s.credits>=150,'Return both observations; analysis requires engineering level 2, one day and 150 cr.');s.credits-=150;advance(s,1);j.signalAnalysis={day:s.day,confidence:Math.min(90,60+(fleetMembers(s).some(v=>v.shipID==='heron'&&v.hull>=50)?25:0)+(j.assigned?15:0)),genuine:Number(hash('signal:'+s.castSeed+':'+j.id)%100n)>=20};earn(s,'engineering',5);record(s,'Signal provenance analyzed once: '+j.signalAnalysis.confidence+'% confidence; '+(j.signalAnalysis.genuine?'a consistent transmitter signature':'possible beacon spoofing')+'. Filed before handover; not a guaranteed-safe route.');return;}
 if(type==='mission-abandon'||type==='mission-steal'){const steal=type==='mission-steal',diplomaticBreach=j.kind==='sealed',mass=missionCargoMass(s,j.id);check(!steal||mass>0&&j.owner==='client','There is no client shipment to steal.');removeMissionLots(s,j.id);if(steal&&j.good)addFleetCargo(s,j.good,j.units,{units:0,cost:0});missionFail(s,j,steal||diplomaticBreach?'theft':'abandoned');return;}
 if(type==='mission-work'){const q=missionWorkQuote(s,j);check(q.canWork,q.reason);const v=j.assigned?owned(s,j.assigned):s;if(q.units)v.spares-=q.units;if(q.medicine)removeFleetCargo(s,'medicine',q.medicine,true);if(j.kind==='signals'){if(!j.stage)missionLot(s,v,j,'evidence',j.mass);advance(s,1);j.stage++;if(j.stage===2){j.signalKind=Number(hash(j.id)%2n)?'raider':'archive';if(j.signalKind==='raider')j.leader=encounterProfile(s,2,null).id;else if(!campaignState(s).leads.some(l=>l.id==='signal:'+j.id))campaignState(s).leads.push({id:'signal:'+j.id,port:j.destination,day:s.day,kind:'wreck',used:false});}j.lastObservation=s.day;j.observedVoyages=s.profile.stats.voyages;record(s,j.stage===1?'First signal observation recorded. A second independent observation is required.':'Signal triangulated; return the recorded observations to the issuer.');return;}
  if(j.units&&j.kind!=='cold-store')missionLot(s,v,j,j.patient?'patients':j.kind==='recovery'?'recovery':'evidence',j.mass);advance(s,q.days);j.stage=1;
  if(j.kind==='survey'&&!campaignState(s).surveys.includes(j.destination)){s.campaign.surveys.push(j.destination);earn(s,'navigation',5);campaignState(s).leads.push({id:'survey:'+j.destination,port:j.destination,day:s.day,kind:'wreck',used:false});}
  if(j.kind==='investigation'){const crew=encounterProfile(s,2,null);j.leader=crew.id;record(s,'Evidence identifies '+crew.leader+' near '+port(j.destination).name+'. This raises ordinary approach encounter odds while the lead is fresh; no battle is launched.');}
  if(j.kind==='recovery'&&Number(hash('wreck-hazard:'+s.castSeed+':'+j.id)%100n)<15){v.hull=Math.max(1,v.hull-6);record(s,'A saved wreck hazard caused 6 integrity damage; the physical recovery lot is retained.');}
  if(j.kind==='recovery')recoverAntiquity(s,v,j);
  record(s,j.kind==='response'?'Recorded rescue: '+j.protectedName+' stabilized at '+port(j.destination).name+'. One stopped day and the quoted service supplies consumed. Report to the receiving patrol for the one-time fee.':j.title+': field work completed. Return the physical lot to '+port(j.origin).name+'.');return;}
 if(type==='mission-complete'){const reason=missionCompleteReason(s,j);check(!reason,reason);if(j.kind==='depot'&&j.stops&&j.stopIndex===0){removeMissionLots(s,j.id);j.units/=2;j.mass/=2;j.stopIndex=1;j.stage=1;j.destination=j.stops[1];j.deadline=j.legDeadlines[1];missionLot(s,owned(s,j.carrying),j,'sealed',j.mass);record(s,'First depot handover recorded. Remaining client lot: '+j.units+' units, '+j.mass+' t. Continue to '+port(j.destination).name+'; the one-time fee remains unpaid until final handover.');return;}let premium=j.bonus||0;if(j.kind==='cold'&&!j.coldIntact)premium=0;if(j.kind==='escort'&&j.protectedHull<=70)premium=0;let payout=j.reward-(j.bonus||0)+premium,batchBonus=0;const batch=j.kind==='consolidated'?s.campaign.jobs.filter(o=>o.kind===j.kind&&o.origin===j.origin&&o.acceptedDay===j.acceptedDay&&o.assigned===j.assigned&&o.status==='completed'):[];if(j.kind==='consolidated'&&j.assigned&&batch.length&&!batch.some(o=>o.batchPaid)&&new Set([...batch.map(o=>o.client),j.client]).size>=2){batchBonus=Math.min(3000,Math.floor((j.reward+batch.reduce((n,o)=>n+o.reward,0))*.05));j.batchPaid=true;payout+=batchBonus;}check(s.credits+payout<=999999999,'Deposit cash before collecting.');const r=missionRecipes.find(r=>r.kind===j.kind);if(j.owner==='captain'&&j.good)removeFleetCargo(s,j.good,j.units,true);if(j.kind==='assay'){let n=j.units;for(const v of fleetMembers(s)){const k=Math.min(n,v.oreUnits||0);if(k){const fraction=k/v.oreUnits;v.oreCost*=1-fraction;v.oreUnits-=k;n-=k;}}}removeMissionLots(s,j.id);j.status='completed';j.closedDay=s.day;s.credits+=payout;j.paid=payout;earn(s,j.faction==='scientific'&&j.kind!=='sealed'?'navigation':'commerce',25);earn(s,'diplomacy',10);changeReputation(s,3,'Completed '+j.title+'.');changeStationReputation(s,j.origin,3,'Kept a specialist charter promise.');campaignStanding(s,j.faction,5);if(j.projectStage){const c=campaignState(s);let p=c.concessions.find(p=>p.port===j.origin);if(!p){p={port:j.origin,stage:0};c.concessions.push(p);}p.stage=Math.max(p.stage,j.projectStage);if(p.stage===3)p.expires=Math.min(365249,s.day+180);}campaignReceipt(s,j.id,'completed',j.title+': '+payout+' cr'+(batchBonus?' including one '+batchBonus+' cr consolidated-batch premium':'')+', 25 objective XP, 10 diplomacy XP and +5 '+j.faction+' standing.');return;}
 check(false,'Unknown mission action.');
}
// Linked expeditions share the contract ledger, physical holds and transactional action path.
// Each stage is persisted. Viewing a board never rolls outcomes or advances an objective.
const expeditionDefinitions=[
 {kind:'cold-relief',title:'Clinic relief convoy',venue:'relay',ships:['tern','ibis','gannet'],faction:'relief',certificate:'cold',premium:.25},
 {kind:'survey-mine',title:'Survey and extraction expedition',venue:'relay',ships:['heron','sanderling','peregrine'],faction:'industrial'},
 {kind:'wreck-archive',title:'Archive recovery partnership',venue:'relay',ships:['heron','rook','nightjar'],faction:'scientific',certificate:'recovery'},
 {kind:'industrial-rescue',title:'Industrial recovery charter',venue:'shipyard',ships:['cormorant','crane','petrel'],faction:'industrial',certificate:'recovery'},
 {kind:'medical-evacuation',title:'Civilian evacuation flotilla',venue:'relay',ships:['curlew','ibis','merlin'],faction:'relief',premium:.25},
 {kind:'warrant-team',title:'Courier-to-leader investigation',venue:'security',ships:['gyrfalcon','nightjar','merlin','rook'],faction:'patrol',certificate:'recovery'},
 {kind:'outer-supply',title:'Depot and return-load charter',venue:'contracts',ships:['albatross','petrel','crane','gannet'],faction:'industrial',premium:.1},
 {kind:'construction',title:'Construction and installation convoy',venue:'relay',ships:['pelican','cormorant','crane'],faction:'industrial',certificate:'industrial',premium:.1},
 {kind:'carrier-recovery',title:'Carrier away-team retrieval',venue:'relay',ships:['condor','merlin','kestrel','rook','ibis'],faction:'relief',certificate:'recovery'},
 {kind:'discreet-archive',title:'Antiquarian patron commission',venue:'local',ships:['heron','swift','nightjar'],faction:'scientific'},
 {kind:'diplomatic-followup',title:'The patron’s reply',venue:'contracts',ships:['swift'],faction:'scientific',certificate:'sealed',premium:.1},
 {kind:'delegation-followup',title:'Delegation return charter',venue:'relay',ships:['curlew'],faction:'scientific',premium:.1},
 {kind:'convoy-rescue',title:'Stranded convoy rendezvous',venue:'contracts',ships:['petrel'],faction:'relief'}
];
missionRecipes.push(...expeditionDefinitions.map(d=>({...d,chain:true})));
function expeditionDef(j){return expeditionDefinitions.find(d=>d.kind===j.kind);}
function expeditionHull(s,j,role){return operationShips(s).find(v=>actorID(s,v)===j.bindings[role]);}
function expeditionPresent(s,v){return !!v&&(fleetMembers(s).includes(v)||v.carrierID&&fleetMembers(s).some(c=>actorID(s,c)===v.carrierID));}
function expeditionLoads(s,j){return operationShips(s).flatMap(v=>(v.missionCargo||[]).filter(l=>l.mission===j.id).map(l=>({...l,ship:actorID(s,v)})));}
function expeditionPut(s,j,role,key,kind,mass,count=0,good=null){
 const v=expeditionHull(s,j,role);check(expeditionPresent(s,v)&&!v.carrierID,'Deploy the assigned '+role+' before loading.');
 if(kind==='patients'){const capacity=role==='curlew'?24:role==='ibis'?12:8,occupied=(v.passengers?.count||0)+(v.missionCargo||[]).filter(l=>l.kind==='patients').reduce((n,l)=>{const job=s.campaign?.jobs.find(j=>j.id===l.mission),m=job?.chain?job.manifest.find(m=>l.id===job.id+':'+m.key):null;return n+(m?.count||Math.round(l.mass/.2));},0);check(occupied+count<=capacity,'Free the assigned vessel’s patient or passenger berths first.');}
 missionLot(s,v,j,kind,mass);const lot=v.missionCargo.at(-1);lot.id=j.id+':'+key;
 j.manifest.push({key,ship:actorID(s,v),kind,mass,count,good});j.mass=j.manifest.reduce((n,l)=>n+l.mass,0);
}
function expeditionUnload(s,j,key){const m=j.manifest.find(l=>l.key===key);check(m,'Missing shipment.');const v=operationShips(s).find(v=>actorID(s,v)===m.ship);check(expeditionPresent(s,v),'Bring the carrying hull to the handover.');v.missionCargo=v.missionCargo.filter(l=>l.id!==j.id+':'+key);if(!v.missionCargo.length)delete v.missionCargo;j.manifest=j.manifest.filter(l=>l!==m);j.mass=j.manifest.reduce((n,l)=>n+l.mass,0);}
function expeditionSteps(s,j){
 const O=j.origin,D=j.destination,step=(title,port,roles,task,extra={})=>({title,port,roles,task,...extra});
 switch(j.kind){
 case 'cold-relief':return [step('Receive the clinic’s sealed cold shipment',O,['tern'],'cold-load'),step('Stabilize the patients at '+j.targetName,D,['ibis','gannet'],'cold-rescue',{days:1,spareRole:'ibis',medicine:2}),step('Handover to the receiving clinic',D,['tern','ibis','gannet'],'clinic-handover')];
 case 'medical-evacuation':return [step('Register healthy and critical evacuees',D,['curlew','ibis','merlin'],'evac-load',{days:1,spareRole:'ibis',medicine:2}),step('Clinic reception and passenger disembarkation',O,['curlew','ibis','merlin'],'clinic-handover')];
 case 'survey-mine':return [step('Register the finite local assay',D,['heron'],'ore-survey'),step('Extract newly assayed ore',D,['sanderling'],'ore-extract'),step('Transfer the assayed lot to the hauler',D,['sanderling','peregrine'],'ore-transfer',{days:1}),step('Deliver the raw-ore manifest',O,['peregrine'],'ore-deliver')];
 case 'wreck-archive':return [step('Observe the archive beacon',D,['nightjar'],'observe',{days:1}),step('Authenticate an independent observation',D,['heron'],'authenticate',{days:1}),step('Retrieve the registered archive case',D,['rook'],'archive-recover',{days:2,spareRole:'rook'}),step('Choose the archive’s custodian',O,['heron','rook','nightjar'],'archive-choice',{choices:['public','patron']})];
 case 'industrial-rescue':return [step('Stabilize '+j.targetName,D,['crane','petrel'],'npc-stabilize',{days:1,spareRole:'crane'}),step('Attach the lawful external tow',D,['cormorant'],'npc-tow',{days:1,spareRole:'cormorant'}),step('Deliver the disabled vessel to dry dock',O,['cormorant'],'npc-deliver')];
 case 'warrant-team':return [step('Triangulate the courier’s signal',D,['nightjar'],'courier-trace',{days:1}),step('Identify the courier through an independent scan',D,['merlin'],'courier-identify',{days:1}),step('Collect the courier’s evidence and name the leader',D,['rook'],'courier-evidence',{days:2,spareRole:'rook'}),step('Encounter and identify the leader during ordinary travel',D,['gyrfalcon','merlin'],'leader-confirm'),step('Recover evidence after the encounter',D,['rook'],'leader-evidence',{days:2,spareRole:'rook'}),step('Submit the sealed evidence to patrol',O,['gyrfalcon','rook'],'warrant-deliver')];
 case 'outer-supply':return [step('Load the depot’s outbound machinery',O,['albatross'],'outbound-load'),step('Deliver and service the remote depot',D,['albatross','petrel','crane','gannet'],'depot-service',{days:2,spareRole:'crane'}),step('Accept the contracted return load',D,['albatross'],'return-load'),step('Return the depot’s used equipment',O,['albatross'],'return-deliver')];
 case 'construction':return [step('Load project materials and indivisible machinery',O,['pelican','cormorant'],'construction-load'),step('Receive the construction lots at the project',D,['pelican','cormorant'],'construction-deliver'),step('Install and commission with the contracted team',D,['crane'],'construction-install',{days:3,spareRole:'crane'})];
 case 'carrier-recovery':return [step('Stage the two approved small craft',O,['condor','kestrel','merlin'],'carrier-stage',{days:1}),step('Deploy and secure the safe retrieval area',D,['condor','kestrel','merlin'],'carrier-deploy',{days:1}),step('Recover the away-team cargo and survivors',D,['rook','ibis','condor'],'away-recover',{days:2,spareRole:'rook',medicine:2}),step('Retrieve both small craft into the Condor',D,['condor','kestrel','merlin'],'carrier-retrieve',{days:1}),step('Return the survivors and recovered cargo',O,['condor','rook','ibis'],'away-deliver')];
 case 'discreet-archive':return [step('Authenticate the recovered item for the patron',O,['heron','nightjar'],'artifact-authenticate',{days:1}),step('Choose museum custody or illicit delivery',O,['swift'],'artifact-choice',{choices:['museum','illicit']}),step('Deliver the physical item to its chosen custodian',D,['swift'],'artifact-deliver')];
 case 'diplomatic-followup':return [step('Receive the patron’s sealed reply',O,['swift'],'reply-load'),step('Discuss the patron’s proposal with the receiving envoy',D,['swift'],'diplomatic-talk',{choices:['cooperate','discreet']}),step('Return the envoy’s signed response',O,['swift'],'reply-deliver')];
 case 'delegation-followup':return [step('Receive the returning delegation',D,['curlew'],'delegation-load'),step('Discuss the delegation’s next commitment',O,['curlew'],'delegation-talk',{choices:['public','private']})];
 case 'convoy-rescue':return [step('Supply 3 t into the client’s separate propellant reserve',O,['petrel'],'fuel-load'),step('Verify and reach '+j.targetName,D,['petrel'],'convoy-verify',{days:1}),step('Refuel the verified stranded convoy',D,['petrel'],'convoy-refuel',{days:1,spareRole:'petrel'}),step('File the convoy’s signed rescue receipt',O,['petrel'],'receipt-deliver')];
 }
}
function expeditionPrerequisite(s,d){
 if(d.kind==='diplomatic-followup'&&!s.campaign?.jobs.some(j=>j.kind==='sealed'&&j.status==='completed'))return 'Complete a sealed diplomatic delivery for a patron first.';
 if(d.kind==='delegation-followup'&&!(s.civilian?.completedPassengers>0))return 'Complete a passenger charter before seeking a delegation patron.';
 if(d.kind==='discreet-archive'&&!s.cantina?.sessions.length&&!s.conversationCareer?.threads.some(t=>t.status==='completed')&&!Object.values(s.careerDevelopment?.regions||{}).some(r=>r.scenes.length>=3))return 'Complete a regional receiving inquiry or meet a traveller at a quiet canteen table before seeking an antiquarian patron.';
 if(d.kind==='discreet-archive'&&!antiquityOffers(s).length)return 'Recover a physical antiquity before asking for this introduction.';
 if(d.kind==='wreck-archive'&&!s.campaign?.leads.some(l=>!l.used))return 'Discover an unused wreck or archive lead first.';
 if(d.kind==='warrant-team'&&factionStanding(s,'patrol')<15)return 'Earn +15 patrol standing first.';
 if(d.kind==='construction'&&s.campaign?.jobs.some(j=>j.kind===d.kind&&j.origin===s.location&&j.status==='completed'))return 'This issuing station’s construction commission is complete.';
 return '';
}
function expeditionOffers(s,venue){
 if(!s.profile.created||s.incident||(s.campaign?.suspendedUntil||0)>s.day)return [];
 const destinations=world.ports.filter(p=>p.id!==s.location&&destinationAccess(s,p.id).open).sort((a,b)=>routeTransfer(s,a.id).coastDays-routeTransfer(s,b.id).coastDays);
 return expeditionDefinitions.filter(d=>d.venue===venue&&campaignKnown(s,d.kind)&&!expeditionPrerequisite(s,d)).map(d=>{
  let eligible=destinations;
  if(d.kind==='survey-mine')eligible=destinations.filter(p=>fieldPorts[p.id]==='ore'&&(!s.civilian?.sites.find(v=>v.port===p.id)||s.civilian.sites.find(v=>v.port===p.id).total-s.civilian.sites.find(v=>v.port===p.id).extracted>=4));
  if(d.kind==='wreck-archive')eligible=destinations.filter(p=>s.campaign.leads.some(l=>l.port===p.id&&!l.used));
  if(d.kind==='construction'||d.kind==='industrial-rescue')eligible=destinations.filter(p=>portFacilities(p.id).spaceport&&(d.kind!=='construction'||!s.campaign?.jobs.some(j=>j.kind==='construction'&&j.destination===p.id&&j.status==='completed')));
  if(d.kind==='outer-supply')eligible=destinations.filter(p=>system(p.group).au>=2);
  if(d.kind==='cold-relief')eligible=destinations.filter(p=>['earth','moon','mars','titan','europa','enceladus','ganymede'].includes(p.id));
  if(d.kind==='discreet-archive')eligible=destinations.filter(p=>['science','archives','survey'].includes(stationSpecialties[p.id]));
  if(!eligible.length)return null;
  const destination=eligible[0].id,cycle=Math.floor(s.day/90),id=s.location+':'+cycle+':'+d.kind;
  if(s.campaign?.jobs.some(j=>j.id===id))return null;
  const bindings={};for(const role of d.ships){const v=operationShips(s).find(v=>v.shipID===role&&v.hull>=50&&expeditionPresent(s,v)&&!v.towID);if(v)bindings[role]=actorID(s,v);}
  const route=routeTransfer(s,destination),back=routeTransfer({...s,location:destination},s.location),duration=route.coastDays+route.waitDays+back.coastDays+back.waitDays+180;
  const reason=d.ships.some(r=>!bindings[r])?'Bring the assigned '+d.ships.filter(r=>!bindings[r]).join(', ')+' at 50% integrity or better.':(s.campaign?.jobs.filter(j=>j.status==='active').length||0)>=3?'At most three specialist contracts may be active.':earnedLevel(s,'navigation')<2?'Navigation level 2 is required.':d.certificate&&!missionCertificate(s,d.certificate)?'Obtain '+d.certificate+' certification at the authority.':['medical-evacuation','delegation-followup'].includes(d.kind)&&!operationPermit(s,'passengers')?'Obtain the passenger welfare certificate.':d.kind==='carrier-recovery'&&!operationPermit(s,'carrier')?'Obtain the carrier expedition certificate.':s.day+duration>=365250?'Deadline exceeds the calendar.':'';
  // Quote the physical loaded outbound/return fleet, not an unladen fast flagship.
  const x=clone(s),payload=d.kind==='construction'?20:d.kind==='outer-supply'?10:d.kind==='industrial-rescue'?18:3;
  if(bindings[d.ships[0]]&&bindings[d.ships[0]]!==x.flagshipID)fleetAction(x,'switch-ship',{id:bindings[d.ships[0]]});x.fleet=x.fleet.filter(v=>Object.values(bindings).includes(v.id));for(const v of x.fleet){delete v.carrierID;delete v.towID;v.escort=true;}if(x.campaign)x.campaign.jobs=[];
  for(const v of operationShips(x)){v.cargo={};v.cargoBasis={};delete v.freightCargo;delete v.missionCargo;delete v.oreUnits;delete v.oreCost;delete v.passengers;delete v.contractTow;v.fuel=shipRules.effectiveShip(v).tankTonnes;}
  if(d.kind==='carrier-recovery')for(const role of ['merlin','kestrel']){const craft=operationShips(x).find(v=>actorID(x,v)===bindings[role]);if(craft&&craft!==x){craft.carrierID=bindings.condor;craft.escort=false;}}civilianSync(x);
  const loadRole=d.ships[0],tool=operationShips(x).find(v=>actorID(x,v)===bindings[loadRole]);
  if(tool)tool.contractTow={mission:'quote-only',mass:payload};
  const out=quote(x,destination);x.day=Math.min(365249,x.day+out.coastDays+out.waitDays+20);x.location=destination;for(const v of x.fleet)if(v.escort)v.location=destination;const ret=quote(x,s.location);
  const operatingEstimate=out.provisions+out.berth+fuelCost(out.burn,s.location)+ret.provisions+ret.berth+fuelCost(ret.burn,destination)+d.ships.reduce((n,id)=>n+sparePrice(s),0)+2000+(['cold-relief','medical-evacuation','carrier-recovery'].includes(d.kind)?tradeTotal(s,'medicine',2,true):0)+(d.kind==='medical-evacuation'?(ret.coastDays+ret.waitDays)*32:d.kind==='carrier-recovery'?(ret.coastDays+ret.waitDays)*16:0)+(['industrial-rescue','outer-supply'].includes(d.kind)?fuelCost(2,s.location):0)+(d.kind==='convoy-rescue'?fuelCost(3,s.location):0);
  const capitalAllowance=Math.ceil(d.ships.reduce((n,id)=>n+ships.find(h=>h.id===id).price,0)*.04*(out.coastDays+out.waitDays+ret.coastDays+ret.waitDays+20)/365.25),baseFee=Math.ceil(operatingEstimate*1.15+capitalAllowance)+1200,bonus=Math.min(Math.ceil(d.ships.reduce((n,id)=>n+ships.find(h=>h.id===id).price,0)*.025),Math.floor(baseFee*(d.premium||0))),reward=baseFee+bonus;
  const j={id,kind:d.kind,chain:1,title:d.title,patronName:establishments(s.location,false,s).find(v=>v.id===venue)?.person||'Duty coordinator',venue,origin:s.location,destination,units:0,mass:0,good:null,owner:'client',work:true,patient:false,faction:d.faction,bindings,assigned:bindings[d.ships[0]]||null,reward,bonus,lease:0,liability:Math.min(40000,Math.max(1500,Math.floor(reward*.3))),duration,operatingEstimate,capitalAllowance,targetName:['Oriole','Aster','Cairn','Hearth'][Number(hash('expedition:'+s.castSeed+':'+id)%4n)],manifest:[],stepIndex:0,stage:0,reason,canAccept:!reason&&baseFee<7500000,description:d.ships.map(id=>ships.find(h=>h.id===id).name).join(' + ')+'. A linked commission with named handovers, staged work and one final payment.',terms:reward+' cr total fee, including '+bonus+' cr specialist premium; estimated round-trip operating allowance '+operatingEstimate+' cr for full tanks and the mission load, plus '+capitalAllowance+' cr fleet-capital allowance at a 4% annual benchmark (extra cargo, battle damage, detours and higher borrowing costs extra). '+duration+' days; '+Math.min(40000,Math.max(1500,Math.floor(reward*.3)))+' cr breach liability. All work uses the assigned present hulls. Cargo, patients and fuel occupy physical space; owned medicine is separate. Premiums total at most 25% of the base fee and 2.5% of the assigned classes’ purchase value. '+(d.kind==='wreck-archive'?'A counterfeit beacon pays only the 40% survey-and-warning allowance. ':'')+(d.kind==='convoy-rescue'?'Supply 3 t of your loaded fuel into the client reserve; its replacement cost is included in the quoted allowance. ':'')+''+(d.kind==='warrant-team'?'Identify the leader in combat before defeating it. Approach intel lasts 60 days; refreshing costs one Nightjar spare and one stopped day. ':'')+'No payment until all stages are verified.'};
  if(d.kind==='discreet-archive'){const item=antiquityOffers(s)[0];j.artifactID=item.id;j.artifactShip=item.ship;}
  if(baseFee>=7500000){j.reason='The route exceeds this commission’s fee budget. Seek a nearer issuing port.';j.canAccept=false;}
  j.previewSteps=expeditionSteps(s,j).map(x=>x.title);return j;
 }).filter(Boolean);
}
function expeditionQuote(s,j){
 const step=expeditionSteps(s,j)[j.stepIndex];if(!step)return {days:0,units:0,medicine:0,canWork:false,reason:'All objectives verified; collect the one-time fee.'};
 const tool=step.spareRole&&expeditionHull(s,j,step.spareRole),workDays=step.days||0,handlingDays=['carrier-stage','carrier-retrieve'].includes(step.task)?['kestrel','merlin'].filter(role=>!expeditionHull(s,j,role)?.carrierID).length:step.task==='carrier-deploy'?2:step.task==='ore-extract'?2:step.task==='ore-survey'&&!s.civilian?.sites.some(v=>v.port===step.port)?2:0,days=workDays+handlingDays,units=step.spareRole?1:0,medicine=step.medicine||0;
 let reason=s.location!==step.port?'Travel to '+port(step.port).name+'.':step.roles.some(role=>{const v=expeditionHull(s,j,role);return !expeditionPresent(s,v)||v.hull<(role==='condor'?60:50)||(v.carrierID&&!['carrier-stage','carrier-deploy','carrier-retrieve'].includes(step.task));})?'Bring and deploy the assigned '+step.roles.join(', ')+' in serviceable condition.':s.day+days>j.deadline?'The field work would exceed the deadline.':units&&tool.spares<units?'Load one engineering spare on the '+step.spareRole+'.':medicine>tradableQuantity(s,'medicine')?'Supply '+medicine+' owned medical units; sealed client medicine cannot be used.':'';
 if(!reason&&step.task==='authenticate'&&s.profile.stats.voyages<=j.observedVoyages&&s.day<j.observationDay+7)reason='Separate the observations by a completed route leg or seven days.';
 if(!reason&&step.task==='leader-confirm'&&(!j.leaderOutcome||!j.leaderIdentified))reason='Encounter and identify the named leader during ordinary travel, then resolve the encounter.';
 if(!reason&&step.task==='ore-extract'){const m=civilianMining(s);if(!m?.canExtract)reason=m?.extractionReason||'Discover mining and purchase this local extraction claim.';}
 if(!reason&&step.task==='ore-survey'&&!s.civilian?.sites.some(v=>v.port===s.location)&&!civilianMining(s)?.canSurvey)reason=civilianMining(s)?.surveyReason||'Ask the coordinator about survey work first.';
 return {days,workDays,units,medicine,reason,canRefresh:step.task==='leader-confirm'&&!j.leaderOutcome&&s.day>j.leadDay+60&&s.location===j.destination&&expeditionPresent(s,expeditionHull(s,j,'nightjar'))&&expeditionHull(s,j,'nightjar').hull>=50&&expeditionHull(s,j,'nightjar').spares>0&&s.day<j.deadline,canWork:!reason,title:step.title,port:step.port,choices:step.choices||[],task:step.task};
}
function expeditionReconcile(s,j){
 if(expeditionDef(j).ships.some(role=>!expeditionHull(s,j,role))){missionFail(s,j,'assigned hull lost');return;}
 for(const m of j.manifest){const v=operationShips(s).find(v=>actorID(s,v)===m.ship),lot=v?.missionCargo?.find(l=>l.id===j.id+':'+m.key);if(!lot||Math.abs(lot.mass-m.mass)>1e-7){missionFail(s,j,'reserved shipment lost');return;}}
 if(j.kind==='discreet-archive'&&j.stepIndex<3&&!operationShips(s).some(v=>(v.missionCargo||[]).some(l=>l.id===j.artifactID))){missionFail(s,j,'recovered item lost');return;}
 if(j.manifest.some(m=>m.kind==='patients')&&expeditionDef(j).ships.some(role=>expeditionHull(s,j,role)?.hull<50))j.premiumIntact=false;
 if(j.kind==='cold-relief'&&expeditionHull(s,j,'tern')?.hull<50)j.premiumIntact=false;
}
function expeditionCleanup(s,j){for(const v of operationShips(s))if(v.contractTow?.mission===j.id)delete v.contractTow;}
function expeditionWork(s,j,choice){
 const q=expeditionQuote(s,j);check(q.canWork,q.reason);const step=expeditionSteps(s,j)[j.stepIndex];if(step.choices)check(step.choices.includes(choice),'Choose the named conversation response.');
 const hull=role=>expeditionHull(s,j,role),put=(...a)=>expeditionPut(s,j,...a),drop=key=>expeditionUnload(s,j,key);
 // Operations run inside transact's cloned state: a capacity/cost failure rolls back every stage.
 if(q.units)hull(step.spareRole).spares--;if(q.medicine)removeFleetCargo(s,'medicine',q.medicine,true);
 switch(step.task){
 case 'cold-load':put('tern','cold','sealed',3,12,'medicine');break;
 case 'cold-rescue':put('ibis','patients','patients',.8,4);break;
 case 'evac-load':check(!hull('curlew').passengers&&!hull('ibis').passengers,'Free both passenger manifests first.');put('curlew','evacuees','patients',1.2,12);put('ibis','patients','patients',.8,4);break;
 case 'clinic-handover':for(const m of [...j.manifest])drop(m.key);j.handover=establishments(s.location,false,s).find(v=>v.id==='clinic')?.person||'Receiving clinic';break;
 case 'ore-survey':if(!s.civilian?.sites.some(v=>v.port===s.location))civilianAction(s,'op-survey',{});{const site=s.civilian.sites.find(v=>v.port===s.location);j.sample={port:s.location,quality:site.quality,baseline:site.extracted,units:Math.min(8,site.total-site.extracted)};check(j.sample.units>=4,'The remaining ore reserve is too small.');}break;
 case 'ore-extract':{const site=s.civilian.sites.find(v=>v.port===s.location);check(site.extracted===j.sample.baseline,'This sample’s extraction lot has changed; arrange a new assay.');civilianAction(s,'op-extract',{});j.sample.units=Math.min(j.sample.units,site.extracted-j.sample.baseline);j.sample.cost=hull('sanderling').oreCost*j.sample.units/hull('sanderling').oreUnits;break;}
 case 'ore-transfer':{const a=hull('sanderling'),b=hull('peregrine'),n=j.sample.units;check(a.oreUnits>=n,'Bring the newly extracted ore to the transfer.');const cost=a.oreCost*n/a.oreUnits;a.oreUnits-=n;a.oreCost-=cost;put('peregrine','sample','sealed',n*.25,n);j.sample.cost=cost;break;}
 case 'ore-deliver':drop('sample');break;
 case 'observe':j.observationDay=s.day;j.observedVoyages=s.profile.stats.voyages;break;
 case 'authenticate':j.beaconGenuine=Number(hash('archive-beacon:'+s.castSeed+':'+j.id)%5n)!==0;put('heron','identity','evidence',.25);break;
 case 'archive-recover':if(!j.beaconGenuine){j.spoofReported=true;j.reward=Math.max(1,Math.floor((j.reward-j.bonus)*.4));j.bonus=0;record(s,'The independent observation exposed a counterfeit beacon. Filed the evidence; no wreck, artifact or recovery premium is fabricated. The quoted recovery fee is reduced to the 40% survey-and-warning allowance.');break;}{const lead=s.campaign.leads.find(l=>l.port===j.destination&&!l.used);check(lead,'The lawful wreck lead is no longer available.');lead.used=true;put('rook','archive','recovery',1);recoverAntiquity(s,hull('rook'),j);}break;
 case 'archive-choice':j.branch=choice;for(const m of [...j.manifest])drop(m.key);campaignStanding(s,choice==='public'?'scientific':'industrial',3);break;
 case 'npc-stabilize':check(!hull('cormorant').contractTow&&!hull('cormorant').towMass,'This tug already has a tow.');check(hull('petrel').fuel>=2,'Reserve 2 t of burnable Petrel propellant for stabilization.');hull('petrel').fuel-=2;j.stabilized=true;break;
 case 'npc-tow':hull('cormorant').contractTow={mission:j.id,mass:18};j.towAttached=true;break;
 case 'npc-deliver':check(hull('cormorant').contractTow?.mission===j.id,'Deliver the actual attached tow.');delete hull('cormorant').contractTow;j.towDelivered=true;break;
 case 'courier-trace':j.observationDay=s.day;j.observedVoyages=s.profile.stats.voyages;break;
 case 'courier-identify':check(s.profile.stats.voyages>j.observedVoyages||s.day>=j.observationDay+7,'Separate the courier observations by a route leg or seven days.');j.courier='Courier '+j.targetName;break;
 case 'courier-evidence':{put('rook','evidence','evidence',1);const fake={...s,location:j.destination,incident:null,campaign:s.campaign},crew=encounterProfile(fake,2,null);j.leader=crew.id;j.leaderName=crew.leader;j.leadDay=s.day;break;}
 case 'leader-confirm':break;
 case 'leader-evidence':j.evidenceRecovered=true;break;
 case 'warrant-deliver':drop('evidence');break;
 case 'outbound-load':put('albatross','outbound','sealed',10,40,'machinery');break;
 case 'depot-service':drop('outbound');check(hull('petrel').fuel>=2,'Reserve 2 t Petrel propellant for the depot service.');hull('petrel').fuel-=2;break;
 case 'return-load':put('albatross','return','sealed',6,24,'machinery');break;
 case 'return-deliver':drop('return');break;
 case 'construction-load':put('pelican','bulk','sealed',6,24,'metals');put('cormorant','machine','sealed',12,48,'machinery');put('crane','team','patients',.4,4);break;
 case 'construction-deliver':drop('bulk');drop('machine');break;
 case 'construction-install':drop('team');break;
 case 'carrier-stage':case 'carrier-retrieve':for(const role of ['kestrel','merlin']){const v=hull(role);if(!v.carrierID)civilianAction(s,'op-carrier-embark',{carrier:j.bindings.condor,ship:actorID(s,v)});check(v.carrierID===j.bindings.condor,'Both assigned craft must be secured in this Condor.');}break;
 case 'carrier-deploy':for(const role of ['kestrel','merlin']){const v=hull(role);check(v.carrierID===j.bindings.condor,'Arrive with both small craft aboard the Condor.');civilianAction(s,'op-carrier-deploy',{carrier:j.bindings.condor,ship:actorID(s,v)});}break;
 case 'away-recover':check(hull('kestrel').escort&&hull('merlin').escort,'Keep both deployed craft in the retrieval area.');put('rook','recovered','recovery',2);put('ibis','patients','patients',.8,4);break;
 case 'away-deliver':for(const role of ['kestrel','merlin'])check(hull(role).carrierID===j.bindings.condor,'Retrieve both craft before leaving the away team.');for(const m of [...j.manifest])drop(m.key);break;
 case 'artifact-authenticate':{const v=operationShips(s).find(v=>(v.missionCargo||[]).some(l=>l.id===j.artifactID));check(expeditionPresent(s,v),'Bring the recovered antiquity to the patron.');const l=v.missionCargo.find(l=>l.id===j.artifactID);if(!l.artifact.appraised){check(s.credits>=150,'Keep 150 cr for provenance analysis.');s.credits-=150;l.artifact.appraised=true;l.artifact.confidence=85;}j.artifactLegal=l.artifact.legal;j.artifactGenuine=l.artifact.genuine;break;}
 case 'artifact-choice':{const a=operationShips(s).find(v=>(v.missionCargo||[]).some(l=>l.id===j.artifactID)),lot=a.missionCargo.find(l=>l.id===j.artifactID),b=hull('swift');if(a!==b){check(physicalRoom(b,lot.mass,lot.mass*4),'Free 0.25 t on the courier.');a.missionCargo=a.missionCargo.filter(l=>l!==lot);(b.missionCargo||(b.missionCargo=[])).push(lot);}j.artifactShip=j.bindings.swift;j.branch=choice;j.illicit=choice==='illicit';break;}
 case 'artifact-deliver':{const v=hull('swift'),lot=v.missionCargo?.find(l=>l.id===j.artifactID);check(lot,'Bring the actual recovered item.');v.missionCargo=v.missionCargo.filter(l=>l!==lot);if(j.branch==='illicit'){changeReputation(s,-5,'Transferred an antiquity through an illicit patron.');changeStationReputation(s,j.origin,-5,'Diverted the patron’s recovered item.');campaignStanding(s,'underworld',8);campaignStanding(s,'patrol',-5);}else if(lot.artifact.genuine){changeReputation(s,3,'Returned a recovered antiquity to museum custody.');campaignStanding(s,'scientific',5);}break;}
 case 'reply-load':put('swift','reply','sealed',.25,1,'electronics');break;
 case 'diplomatic-talk':j.branch=choice;drop('reply');put('swift','response','sealed',.25,1,'electronics');campaignStanding(s,choice==='cooperate'?'scientific':'industrial',2);break;
 case 'reply-deliver':drop('response');break;
 case 'delegation-load':check(!hull('curlew').passengers,'Disembark the current charter before accepting the delegation.');put('curlew','delegation','patients',.6,6);break;
 case 'delegation-talk':j.branch=choice;drop('delegation');campaignStanding(s,choice==='public'?'scientific':'industrial',2);break;
 case 'fuel-load':check(hull('petrel').fuel>=3,'Load 3 t of owned Petrel propellant before allocating the client reserve.');hull('petrel').fuel-=3;put('petrel','fuel','fuel',3,12);break;
 case 'convoy-verify':j.transponderVerified=true;break;
 case 'convoy-refuel':check(j.transponderVerified,'Verify the named convoy transponder first.');drop('fuel');put('petrel','receipt','evidence',.25);break;
 case 'receipt-deliver':drop('receipt');break;
 default:check(false,'Unknown expedition objective.');
 }
 if(q.workDays)advance(s,q.workDays);check(j.status==='active','The commission expired during field work.');j.stepIndex++;j.stage=0;j.lastObjectiveDay=s.day;
 const venue=missionCoordinationVenue(j),contact=establishments(s.location,false,s).find(v=>v.id===venue)?.person||'Duty coordinator';
 const reply=step.choices?'“'+(choice==='illicit'?'The private transfer is on your record. Customs can still seize the item.':choice==='museum'||choice==='public'?'The archive will record public custody and your contribution.':'The patron’s instructions and your response are recorded.')+'”':'“'+step.title+' verified. '+(expeditionSteps(s,j)[j.stepIndex]?.title||'All objectives are complete; collect your agreed fee.')+'”';
 speak(s,s.profile.name,step.choices?({public:'File this openly with the archive.',patron:'Introduce me to the licensed patron.',museum:'Return it to the museum.',illicit:'Arrange the illicit handover.',cooperate:'Support the open agreement.',discreet:'Keep the reply confidential.',private:'Arrange a private charter.'}[choice]):step.title+'.');speak(s,contact,reply);for(const line of s.dialogue.slice(-2))Object.assign(line,{venue,contact:'',partner:contact});record(s,j.title+': '+step.title+' verified'+(choice?' ('+choice+')':'')+'.');
}
function expeditionCompleteReason(s,j){
 if(j.status!=='active')return 'Already settled.';if(j.stepIndex<expeditionSteps(s,j).length)return 'Complete every named stage before collecting payment.';
 const end=expeditionSteps(s,j).at(-1).port;if(s.location!==end)return 'Collect from '+port(end).name+'.';if(j.manifest.length)return 'Hand over all client lots first.';return '';
}
function expeditionAction(s,type,arg,j){
 if(type==='mission-work'){if(arg.kind==='refresh'){check(expeditionQuote(s,j).canRefresh,'A stale leader trace can be refreshed locally by the assigned Nightjar with one spare and one day.');expeditionHull(s,j,'nightjar').spares--;advance(s,1);check(j.status==='active','The charter expired.');j.leadDay=s.day;record(s,'Leader trace refreshed for 60 days; one Nightjar spare and one stopped day, no XP.');return;}expeditionWork(s,j,arg.kind);return;}
 if(type==='mission-abandon'||type==='mission-steal'){
  if(type==='mission-steal'){const lots=j.manifest.filter(m=>m.good);check(lots.length,'This commission has no merchandise to steal.');removeMissionLots(s,j.id);for(const m of lots)addFleetCargo(s,m.good,m.count,{units:0,cost:0});}
  missionFail(s,j,type==='mission-steal'||j.kind==='diplomatic-followup'?'theft':'abandoned');return;
 }
 check(type==='mission-complete','Choose a valid expedition action.');check(!expeditionCompleteReason(s,j),expeditionCompleteReason(s,j));
 const premium=j.premiumIntact&&(crewReadiness(s)>=70)&&expeditionDef(j).ships.every(role=>{const v=expeditionHull(s,j,role);return expeditionPresent(s,v)&&v.hull>=50;})?j.bonus:0;
 const payout=j.reward-j.bonus+premium;check(s.credits+payout<=999999999,'Deposit cash before collecting.');s.credits+=payout;j.paid=payout;j.status='completed';j.closedDay=s.day;expeditionCleanup(s,j);
 earn(s,j.faction==='scientific'?'navigation':'commerce',35);earn(s,'diplomacy',15);
 if(!(j.kind==='discreet-archive'&&(j.illicit||!j.artifactGenuine))){changeReputation(s,3,'Completed '+j.title+'.');changeStationReputation(s,j.origin,3,'Completed a linked commission.');campaignStanding(s,j.faction,5);}
 if(j.kind==='construction'){let c=campaignState(s).concessions.find(c=>c.port===j.destination);if(!c){c={port:j.destination,stage:3};s.campaign.concessions.push(c);}c.stage=3;c.expires=Math.min(365249,s.day+180);}
 campaignReceipt(s,j.id,'completed',j.title+': every stage verified; '+payout+' cr paid once, including '+premium+' cr shared premium; 35 objective XP and 15 diplomacy XP.');
}
function validateExpedition(s,j){
 const d=expeditionDef(j);check(j.units===0&&j.work===true&&j.owner==='client','Invalid expedition ownership.');check(j.chain===1&&d&&(j.venue===d.venue||Object.hasOwn(transportLegacyVenues,j.kind)&&j.venue===transportLegacyVenues[j.kind])&&j.assigned===j.bindings?.[d.ships[0]]&&j.bindings&&Object.keys(j.bindings).length===d.ships.length&&d.ships.every(role=>str(j.bindings[role],80))&&new Set(Object.values(j.bindings)).size===d.ships.length,'Invalid expedition assignments.');
 check(integer(j.stepIndex,0,expeditionSteps(s,j).length)&&typeof j.premiumIntact==='boolean'&&Array.isArray(j.manifest)&&j.manifest.length<=5&&new Set(j.manifest.map(l=>l.key)).size===j.manifest.length&&j.manifest.every(l=>str(l.key,40)&&str(l.ship,80)&&['sealed','patients','fuel','recovery','evidence'].includes(l.kind)&&finite(l.mass,.01,250)&&integer(l.count,0,100)&&(!l.good||goods.some(g=>g.id===l.good)))&&Math.abs(j.manifest.reduce((n,l)=>n+l.mass,0)-j.mass)<1e-7,'Invalid expedition stages or manifest.');
 for(const role of d.ships){const v=expeditionHull(s,j,role);if(j.status==='active')check(v&&v.shipID===role,'Missing expedition role.');}
 
 if(j.status==='active'){const lots=expeditionLoads(s,j);check(lots.length===j.manifest.length&&j.manifest.every(m=>lots.some(l=>l.id===j.id+':'+m.key&&l.ship===m.ship&&l.kind===m.kind&&Math.abs(l.mass-m.mass)<1e-7)),'Expedition custody disagrees with its physical holds.');}
 check(j.branch===undefined||['public','patron','museum','illicit','cooperate','discreet','private'].includes(j.branch),'Invalid expedition dialogue choice.');
 for(const key of ['beaconGenuine','spoofReported','stabilized','towAttached','towDelivered','leaderIdentified','evidenceRecovered','artifactLegal','artifactGenuine','illicit','transponderVerified'])check(j[key]===undefined||typeof j[key]==='boolean','Invalid expedition result.');
 if(j.leaderOutcome!==undefined)check(['capture','defeat'].includes(j.leaderOutcome),'Invalid leader outcome.');if(j.leadDay!==undefined)check(integer(j.leadDay,j.acceptedDay,s.day),'Invalid lead date.');
 if(j.sample)check(world.ports.some(p=>p.id===j.sample.port)&&integer(j.sample.quality,60,95)&&integer(j.sample.baseline,0,1000)&&integer(j.sample.units,1,80),'Invalid ore sample provenance.');
}

function encounterProfile(s,tier,target){
 const group=port(s.incident?.destination||s.location).group,c=campaignState(s),cycle=Math.floor(s.day/180),baseID=target?'wanted:'+target.id:((s.campaign?.jobs||[]).find(j=>j.chain&&j.status==='active'&&j.kind==='warrant-team'&&j.leader&&!j.leaderOutcome&&port(j.destination).group===group&&s.day<=j.leadDay+60)?.leader||group+':'+cycle);let index=0,id=baseID,r=c.raiders.find(r=>r.id===id);while(r?.captured&&!target){index++;id=baseID+':'+index;r=c.raiders.find(r=>r.id===id);}
 if(!r){const h=hash('crew:'+s.castSeed+':'+id);r={id,group,leader:target?.name||['Kade Venn','Mira Tal','Sable Orr','Tess Khor','Cinder-7','Rook Vale'][Number(h%6n)],heat:0,day:s.day,captured:false,survivor:100};c.raiders.push(r);c.raiders=c.raiders.slice(-60);}
 return {...r,intent:target?'wanted leader':tier===1?'extort and flee':tier===2?'seize cargo':'disable and screen leader',budget:tier===1?2:tier===2?5:8};
}
function campaignBattleOutcome(s,b,outcome){
 for(const j of s.campaign?.jobs||[])if(j.chain&&j.status==='active'&&j.kind==='warrant-team'&&j.leader===b.faction?.id){j.leaderIdentified=!!(j.leaderIdentified||b.progress?.scanned?.[b.enemies[0]?.id]);if(outcome==='victory'){j.leaderOutcome=b.progress?.captures?.length?'capture':'defeat';j.leaderResolvedDay=s.day;if(!j.leaderIdentified)missionFail(s,j,'leader defeated without the required identification');}}
 for(const j of s.campaign?.jobs||[])if(j.status==='active'&&j.kind==='escort'&&j.destination===b.destination&&b.protected?.mission===j.id){j.protectedHull=b.protected.hull;if(j.protectedHull<=0)missionFail(s,j,'protected merchant destroyed');}
 if(!b.faction)return;const c=campaignState(s),r=c.raiders.find(r=>r.id===b.faction.id);if(!r)return;r.day=s.day;r.heat=Math.min(100,r.heat+(outcome==='victory'?20:5));r.survivor=Math.min(...b.enemies.filter(e=>e.hull>0).map(e=>e.hull),100);if(outcome==='victory')r.captured=true;
 if(outcome==='victory')campaignStanding(s,'patrol',3);
}
function protectedMerchant(s,dest){const j=s.campaign?.jobs.find(j=>j.status==='active'&&j.kind==='escort'&&j.destination===dest);return j?{mission:j.id,id:'protected-merchant',name:j.protectedName,shipID:'kestrel',hull:j.protectedHull,maxHull:100,upgrades:emptyUpgrades(),ammo:0,ordnanceAmmo:0}:null;}
function campaignRisk(s,dest){const recent=(s.campaign?.raiders||[]).some(r=>r.group===port(dest).group&&r.captured&&s.day<r.day+14);const expeditionLead=(s.campaign?.jobs||[]).some(j=>j.chain&&j.kind==='warrant-team'&&j.status==='active'&&j.leader&&!j.leaderOutcome&&port(j.destination).group===port(dest).group&&s.day<=j.leadDay+60);return (recent?-.03:0)+(expeditionLead?.1:0)+Math.min(.1,(s.campaign?.jobs||[]).some(j=>(j.kind==='investigation'||j.kind==='signals'&&j.signalKind==='raider'&&j.stage===2&&s.day<=j.lastObservation+30)&&j.status==='active'&&j.stage>0&&port(j.destination).group===port(dest).group&&s.day<=j.deadline)?.1:0);}
function recoverAntiquity(s,v,j){
 const h=hash('recovery-relic:'+s.castSeed+':'+j.id),chance=Math.min(.4,.1+system(port(j.destination).group).au*.01);if(Number(h%10000n)/10000>=chance)return;
 const id='antiquity:'+j.id;if(operationShips(s).some(x=>(x.missionCargo||[]).some(l=>l.id===id)))return;
 if(!physicalRoom(v,.25,1))return;
 (v.missionCargo||(v.missionCargo=[])).push({id,mission:null,kind:'antiquity',mass:.25,owner:'captain',origin:j.destination,day:s.day,artifact:{condition:40+Number(h/101n%61n),genuine:Number(h/701n%100n)<75,skill:['navigation','engineering','diplomacy','commerce'][Number(h/1901n%4n)],appraised:false,confidence:0,equipped:false,legal:Number(h/2503n%4n)!==0}});record(s,'Recovered a sealed antiquity case. A canteen broker or station scholar can inspect its provenance.');
}
function artifactBonuses(s){const b={navigation:0,engineering:0,diplomacy:0,commerce:0};for(const v of fleetMembers(s))for(const l of v.missionCargo||[])if(l.kind==='antiquity'&&l.artifact.equipped&&l.artifact.genuine)b[l.artifact.skill]=1;return b;}
function antiquityOffers(s){return operationShips(s).filter(v=>v===s||v.location===s.location).flatMap(v=>(v.missionCargo||[]).filter(l=>l.kind==='antiquity').map(l=>{const a=l.artifact,base=Math.round((2500+a.condition*100)*(a.appraised?(a.genuine?1:.15):.5)),scholar=['science','archives','survey'].includes(stationSpecialties[s.location]);return {id:l.id,ship:actorID(s,v),origin:port(l.origin).name,condition:a.condition,appraised:a.appraised,confidence:a.confidence,legal:a.appraised?a.legal:null,skill:a.appraised?a.skill:null,equipped:a.equipped,price:Math.floor(base*(scholar?1.1:.85)),scholar,canAnalyze:!a.appraised&&earnedLevel(s,'engineering')>=2,canEquip:a.appraised&&a.genuine,analysisCost:150};}));}
function antiquityAction(s,type,arg){const v=operationShips(s).find(v=>actorID(s,v)===arg.ship&&(v===s||v.location===s.location)),lot=v?.missionCargo?.find(l=>l.id===arg.id&&l.kind==='antiquity');check(lot,'Bring that physical antiquity to this port.');const a=lot.artifact,o=antiquityOffers(s).find(o=>o.id===arg.id);check(!s.campaign?.jobs.some(j=>j.chain&&j.status==='active'&&j.artifactID===lot.id),'This item is pledged to an active patron commission; deliver or abandon that commission first.');
 if(type==='artifact-analyze'){check(o.canAnalyze&&s.credits>=150,'Analysis requires engineering level 2 and 150 cr.');s.credits-=150;advance(s,1);a.appraised=true;a.confidence=Math.min(90,60+(fleetMembers(s).some(v=>v.shipID==='heron'&&v.hull>=50)?25:0));earn(s,'engineering',5);record(s,'Provenance analysis recorded once: '+a.confidence+'% confidence, '+(a.legal?'lawful salvage':'an unresolved ownership claim')+'.');return;}
 if(type==='artifact-equip'){check(o.canEquip,'Authenticate a genuine instrument before equipping it.');const used=(s.cantina?.equipped.length||0)+operationShips(s).reduce((n,v)=>n+(v.missionCargo||[]).filter(l=>l.kind==='antiquity'&&l.artifact.equipped).length,0);check(a.equipped||used<2,'Only two relics may be active across both collections.');a.equipped=!a.equipped;record(s,'Antiquity '+(a.equipped?'equipped':'stowed')+'; total effective bonus remains capped at +1 per skill.');return;}
 if(type==='artifact-sell'||type==='artifact-return'){const museum=type==='artifact-return';check(!museum||o.scholar,'A science or archive station handles museum returns.');const pay=museum?0:o.price;check(s.credits+pay<=999999999,'Deposit cash before selling.');s.credits+=pay;v.missionCargo=v.missionCargo.filter(l=>l!==lot);if(museum&&a.genuine){changeReputation(s,5,'Returned an antiquity to public archives.');campaignStanding(s,'scientific',8);}else if(!museum&&(!a.legal||!a.genuine)){changeReputation(s,-3,'Traded a disputed or forged antiquity.');campaignStanding(s,'underworld',5);}else if(!museum)campaignStanding(s,'industrial',2);campaignReceipt(s,lot.id,'antiquity',museum?(a.genuine?'Genuine antiquity returned to public custody; no sale proceeds.':'Forgery catalogued in public custody; no sale proceeds, authenticity XP or reputation reward.'):'Antiquity sold for '+pay+' cr; custody transferred permanently.');return;}
 check(false,'Unknown antiquity service.');
}
function fieldEquipment(s){
 const here=operationShips(s).filter(v=>(v===s||v.location===s.location)&&!v.carrierID&&!v.towID),active=fleetMembers(s),crane=active.find(v=>v.shipID==='crane'&&v.hull>=50),tug=active.find(v=>v.shipID==='cormorant'&&v.hull>=50),facility=portFacilities(s.location);
 const crates=here.flatMap(v=>(v.missionCargo||[]).filter(l=>l.kind==='component').map(l=>{const target=here.find(h=>actorID(s,h)===l.component.target),c=l.component,cost=Math.ceil(c.price*.05),reason=!crane?'Bring an active Crane at 50% integrity.':earnedLevel(s,'engineering')<3?'Engineering level 3 is required.':crane.spares<1?'Load one engineering spare on the Crane.':!target||target.shipID!==c.shipID||target.upgrades[c.module]+1!==c.level?'Bring the assigned hull at the preceding upgrade level.':s.credits<cost?'Keep the 5% field fitting charge.':'';return {id:l.id,carrying:actorID(s,v),target:c.target,name:upgradeCatalog.find(u=>u.id===c.module).name+' '+c.level,cost,reason,canInstall:!reason};}));
 const purchases=facility.spaceport&&crane?here.flatMap(v=>facility.upgrades.filter(id=>v.upgrades[id]<3).map(module=>{const level=v.upgrades[module]+1,cost=fittingCosts(v.shipID,module)[level-1];return {target:actorID(s,v),module,level,cost,mass:.5,name:actorName(s,v)+' · '+upgradeCatalog.find(u=>u.id===module).name+' '+level,canBuy:s.credits>=cost&&physicalRoom(crane,.5,2)&&!crates.some(c=>c.target===actorID(s,v)&&c.name===upgradeCatalog.find(u=>u.id===module).name+' '+level)};})):[];
 const tows=tug?s.fleet.filter(v=>v!==tug&&v.location===s.location&&!v.carrierID).map(v=>{const mass=effectiveShip(v).dryMass+cargoMass(v)+v.fuel,attached=v.towID===actorID(s,tug),reason=attached?'':v.towID?'Already attached to another tug.':v.hull>=35?'Only disabled hulls below 35% integrity need a tow.':v.passengers||v.carrierMass||v.towMass||v.contractTow?'Unload passenger and carried payloads before towing.':tug.contractTow||s.fleet.some(x=>x.towID===actorID(s,tug))?'One disabled hull per tug.':mass>ships.find(h=>h.id===tug.shipID).dryMass*1.5?'Loaded hull exceeds 1.5 times the tug’s base mass.':tug.spares<1?'One spare is required for attachment.':'';return {id:v.id,name:v.name,mass,attached,reason,canAttach:!reason};}):[];
 return {crane:crane?actorID(s,crane):null,tug:tug?actorID(s,tug):null,crates,purchases,tows};
}
function fieldEquipmentAction(s,type,arg){
 check(s.profile.created&&!s.incident&&!s.fleetLoss,'Use field services only while safely stopped.');const o=fieldEquipment(s);
 if(type==='tow-attach'||type==='tow-detach'){const q=o.tows.find(q=>q.id===arg.ship);check(q&&(type==='tow-detach'?q.attached:q.canAttach),q?.reason||'No eligible owned hull to tow.');const v=owned(s,q.id);if(type==='tow-detach'){delete v.towID;record(s,v.name+' detached locally; its stores remain separate.');}else{owned(s,o.tug).spares--;v.escort=false;v.towID=o.tug;advance(s,1);record(s,v.name+' attached to Cormorant tow: '+q.mass.toFixed(2)+' t payload, one spare and one day. Its tanks, holds and weapons are unavailable to the travelling fleet.');}civilianSync(s);return;}
 if(type==='component-buy'){const q=o.purchases.find(q=>q.target===arg.ship&&q.module===arg.module);check(q?.canBuy,'That physical upgrade crate is not supplied here or will not fit.');const v=owned(s,o.crane),target=owned(s,q.target);s.credits-=q.cost;(v.missionCargo||(v.missionCargo=[])).push({id:'component:'+uuid(),mission:null,kind:'component',mass:.5,owner:'captain',origin:s.location,day:s.day,component:{target:q.target,shipID:target.shipID,module:q.module,level:q.level,price:q.cost}});record(s,'Purchased '+q.name+' as a physical 0.5 t crate for '+q.cost+' cr; it is not installed.');return;}
 if(type==='field-install'){const q=o.crates.find(q=>q.id===arg.id);check(q?.canInstall,q?.reason||'No owned component crate.');const carrying=owned(s,q.carrying),lot=carrying.missionCargo.find(l=>l.id===q.id),c=lot.component,v=owned(s,c.target),crane=owned(s,o.crane);carrying.missionCargo=carrying.missionCargo.filter(l=>l!==lot);const candidate={...v,fittingEdition:2,upgrades:{...v.upgrades,[c.module]:c.level}};check(shipCargoFits(candidate)&&v.fuel<=effectiveShip(candidate).tankTonnes&&shipRules.cargoAllocation(candidate).loadoutFits&&v.ammo<=shipRules.weaponFits(candidate)[1].magazine,'Unload excess goods, propellant or ammunition before fitting.');crane.spares--;s.credits-=q.cost;v.upgrades[c.module]=c.level;v.fittingEdition=2;advance(s,1);record(s,q.name+' installed from your owned crate: one Crane spare, one day and '+q.cost+' cr field fitting. No ammunition or repeat XP created.');return;}
 check(false,'Unknown field equipment action.');
}
function specialistServiceOverview(s){
 const active=fleetMembers(s),crane=active.find(v=>v.shipID==='crane'&&v.hull>=50),ibis=active.find(v=>v.shipID==='ibis'&&v.hull>=50),medicalUnits=Math.max(1,Math.ceil(active.length/4));
 return {crane:crane?actorID(s,crane):null,ibis:ibis?actorID(s,ibis):null,medicalUnits,canTreat:!!ibis&&crewReadiness(s)<100&&tradableQuantity(s,'medicine')>=medicalUnits,repairs:crane?active.filter(v=>v.hull<100).map(v=>({ship:actorID(s,v),name:actorName(s,v),gain:Math.min(12,100-v.hull),units:repairQuote(s,v).spares,canRepair:crane.spares>=repairQuote(s,v).spares})):[],duties:operationShips(s).filter(v=>(v===s||v.location===s.location)&&!v.carrierID&&['osprey','gannet'].includes(v.shipID)&&!v.duty).map(v=>({ship:actorID(s,v),name:actorName(s,v),duty:v.shipID==='osprey'?'thermal':'interception',cost:Math.ceil(ships.find(h=>h.id===v.shipID).price*.03),canFit:portFacilities(s.location).spaceport&&earnedLevel(s,'engineering')>=2}))};
}
function specialistServiceAction(s,type,arg){
 const o=specialistServiceOverview(s);check(s.profile.created,'Sign your charter first.');
 if(type==='field-treatment'){check(o.canTreat,'An active Ibis, crew fatigue and the quoted owned medicines are required.');removeFleetCargo(s,'medicine',o.medicalUnits,true);advance(s,1);ensureServices(s).crewReadiness=Math.min(100,crewReadiness(s)+10);record(s,'Ibis field wards: one stopped day, '+o.medicalUnits+' owned medical units, crew readiness +10. No repeat service XP.');return;}
 if(type==='field-repair'){const q=o.repairs.find(q=>q.ship===arg.ship);check(q?.canRepair,'A present Crane and the target’s hull-scaled spare lot are required.');const crane=owned(s,o.crane),v=owned(s,q.ship);crane.spares-=q.units;v.hull+=q.gain;advance(s,1);record(s,'Crane field repair: '+actorName(s,v)+' integrity +'+q.gain+', '+q.units+' spares and one stopped day.');return;}
 if(type==='duty-fit'){const q=o.duties.find(q=>q.ship===arg.ship);check(q?.canFit&&s.credits>=q.cost,'A spaceport, engineering level 2 and the specialization fee are required.');s.credits-=q.cost;owned(s,q.ship).duty=q.duty;record(s,'Fitted '+q.duty+' specialization to '+q.name+' for '+q.cost+' cr. It replaces that ship’s normal action when used.');return;}
 check(false,'Unknown specialist service.');
}
function validateCampaign(s){
 const c=s.campaign;if(c!==undefined){check(c&&c.version===1&&Array.isArray(c.known)&&c.known.length<=80&&new Set(c.known).size===c.known.length&&c.known.every(k=>missionRecipes.some(r=>r.kind===k)||['recovery','industrial','cold','sealed'].some(k2=>k==='certificate:'+k2)),'Invalid specialist discoveries.');check(c.standing&&['patrol','industrial','scientific','relief','underworld'].every(k=>integer(c.standing[k],-100,100))&&Array.isArray(c.jobs)&&c.jobs.length<=500&&c.jobs.filter(j=>j.status==='active').length<=3&&new Set(c.jobs.map(j=>j.id)).size===c.jobs.length,'Invalid specialist mission ledger.');
  for(const j of c.jobs){if(j.chain)validateExpedition(s,j);check(missionRecipes.some(r=>r.kind===j.kind)&&str(j.id,160)&&world.ports.some(p=>p.id===j.origin)&&world.ports.some(p=>p.id===j.destination)&&['active','completed','failed','stolen'].includes(j.status)&&integer(j.reward,1,10000000)&&integer(j.liability,0,10000000)&&integer(j.units,0,1000)&&finite(j.mass,0,250)&&integer(j.acceptedDay,0,s.day)&&integer(j.deadline,j.acceptedDay,365249)&&integer(j.stage,0,2)&&(j.stops===undefined||j.stops===null||j.kind==='depot'&&Array.isArray(j.stops)&&j.stops.length===2&&j.stops[0]!==j.stops[1]&&j.stops.every(id=>world.ports.some(p=>p.id===id))&&integer(j.stopIndex,0,1)&&j.destination===j.stops[j.stopIndex]&&Array.isArray(j.legDeadlines)&&j.legDeadlines.length===2&&j.legDeadlines.every(d=>integer(d,j.acceptedDay,365249)))&&integer(j.baselineVoyages,0,s.profile.stats.voyages)&&(j.observedVoyages===undefined||integer(j.observedVoyages,j.baselineVoyages,s.profile.stats.voyages))&&(j.signalAnalysis===undefined||j.kind==='signals'&&j.stage===2&&integer(j.signalAnalysis.day,j.acceptedDay,s.day)&&integer(j.signalAnalysis.confidence,0,90)&&typeof j.signalAnalysis.genuine==='boolean')&&(j.status==='active'?j.closedDay===null&&s.day<=j.deadline:integer(j.closedDay,j.acceptedDay,s.day)),'Invalid specialist contract.');}
  check(c.localDeliveries===undefined||Object.entries(c.localDeliveries).every(([p,n])=>world.ports.some(w=>w.id===p)&&integer(n,0,1000000)),'Invalid local delivery record.');
  check(Array.isArray(c.receipts)&&c.receipts.length<=2000&&new Set(c.receipts.map(r=>r.id)).size===c.receipts.length&&c.receipts.every(r=>str(r.id,200)&&str(r.kind,40)&&integer(r.day,0,s.day)&&world.ports.some(p=>p.id===r.port)&&str(r.text,2500)),'Invalid reward receipts.');check(Array.isArray(c.leads)&&c.leads.length<=100&&new Set(c.leads.map(l=>l.id)).size===c.leads.length&&c.leads.every(l=>str(l.id,150)&&world.ports.some(p=>p.id===l.port)&&integer(l.day,0,s.day)&&l.kind==='wreck'&&typeof l.used==='boolean')&&Array.isArray(c.raiders)&&c.raiders.length<=60&&c.raiders.every(r=>str(r.id,100)&&world.ports.some(p=>p.group===r.group)&&str(r.leader,80)&&integer(r.day,0,s.day)&&integer(r.heat,0,100)&&integer(r.survivor,0,100)&&typeof r.captured==='boolean')&&Array.isArray(c.concessions)&&c.concessions.length<=26&&new Set(c.concessions.map(c=>c.port)).size===c.concessions.length&&c.concessions.every(c=>world.ports.some(p=>p.id===c.port)&&integer(c.stage,1,3)&&(c.expires===undefined||integer(c.expires,0,365249)))&&Array.isArray(c.surveys)&&c.surveys.length<=26&&c.surveys.every(id=>world.ports.some(p=>p.id===id))&&integer(c.suspendedUntil,0,365249),'Invalid campaign discovery records.');}
 const ids=new Set();for(const w of Object.values(s.warehouses||{})){check(w.missionCargo===undefined||Array.isArray(w.missionCargo)&&w.missionCargo.length<=100,'Invalid stored screening register.');for(const l of w.missionCargo||[]){const p=customsPacks.find(p=>p.id===l.screening);check(p&&str(l.id,200)&&!ids.has(l.id)&&l.kind==='screening'&&l.owner==='captain'&&l.mission===null&&l.mass===p.mass&&world.ports.some(p=>p.id===l.origin)&&integer(l.day,0,s.day),'Invalid stored screening package.');ids.add(l.id);}}let equipped=s.cantina?.equipped.length||0;
 for(const v of operationShips(s)){check(v.duty===undefined||v.shipID==='osprey'&&v.duty==='thermal'||v.shipID==='gannet'&&v.duty==='interception','Invalid hull specialization.');check(v.missionCargo===undefined||Array.isArray(v.missionCargo)&&v.missionCargo.length<=100,'Invalid special hold.');for(const l of v.missionCargo||[]){check(str(l.id,200)&&!ids.has(l.id)&&['client','captain'].includes(l.owner)&&['fuel','sealed','patients','recovery','evidence','antiquity','component','screening'].includes(l.kind)&&finite(l.mass,.01,250)&&world.ports.some(p=>p.id===l.origin)&&integer(l.day,0,s.day),'Invalid owned physical lot.');ids.add(l.id);if(l.kind==='antiquity'){const a=l.artifact;check(a&&integer(a.condition,0,100)&&typeof a.genuine==='boolean'&&typeof a.appraised==='boolean'&&typeof a.legal==='boolean'&&typeof a.equipped==='boolean'&&integer(a.confidence,0,90)&&Object.hasOwn(skillNames,a.skill)&&(!a.equipped||a.appraised),'Invalid antiquity provenance.');if(a.equipped)equipped++;}else if(l.kind==='screening'){const p=customsPacks.find(p=>p.id===l.screening);check(p&&l.owner==='captain'&&l.mission===null&&l.mass===p.mass&&(v.missionCargo||[]).filter(x=>x.kind==='screening'&&x.screening===p.id).length<=3,'Invalid cargo-screening pack.');}else if(l.kind==='component'){const a=l.component;check(l.owner==='captain'&&l.mission===null&&a&&str(a.target,80)&&ships.some(h=>h.id===a.shipID)&&upgradeCatalog.some(u=>u.id===a.module)&&integer(a.level,1,3)&&a.price===fittingCosts(a.shipID,a.module)[a.level-1]&&l.mass===.5,'Invalid purchased fitting crate.');}else check(c&&c.jobs.some(j=>j.id===l.mission&&j.status==='active'),'Orphaned contract cargo.');if(l.mission){const j=c.jobs.find(j=>j.id===l.mission);check(l.owner==='client'&&l.origin===j.origin&&(j.chain||Math.abs(l.mass-j.mass)<1e-8),'Contract ownership or physical mass disagrees with the ledger.');}}check(v.fuel+missionFuel(v)<=shipRules.effectiveShip(v).tankTonnes+.001,'Reserved propellant exceeds tank capacity.');}
 for(const v of operationShips(s)){if(v.contractTow)check(str(v.contractTow.mission,160)&&finite(v.contractTow.mass,18,18)&&c?.jobs.some(j=>j.chain&&j.status==='active'&&j.id===v.contractTow.mission&&j.kind==='industrial-rescue'&&j.bindings.cormorant===actorID(s,v)),'Invalid contracted tow.');const t=s.fleet.filter(x=>x.towID===actorID(s,v));check(t.length<=1&&Math.abs((v.towMass||0)-t.reduce((n,x)=>n+effectiveShip(x).dryMass+cargoMass(x)+x.fuel,0))<1e-7,'Invalid external tow mass.');if(v.towID){const tug=operationShips(s).find(t=>actorID(s,t)===v.towID);check(v!==s&&tug?.shipID==='cormorant'&&!v.escort&&!v.carrierID&&!v.towMass&&v.location===(tug===s?s.location:tug.location),'Invalid towed hull.');}}
 for(const j of c?.jobs||[])if(j.status==='active'&&!j.chain){check(j.assigned===null||operationShips(s).some(v=>actorID(s,v)===j.assigned),'Missing specialist hull.');const needed=j.units>0&&(j.work?(j.kind==='cold-store'||j.stage>0):j.owner==='client');check(Math.abs(missionCargoMass(s,j.id)-(needed?j.mass:0))<1e-7,'Missing or duplicated physical client shipment.');}
 for(const v of operationShips(s)){if(!(v.missionCargo||[]).some(l=>l.kind==='patients'&&c?.jobs.some(j=>j.chain&&j.id===l.mission)))continue;const people=(v.passengers?.count||0)+(v.missionCargo||[]).filter(l=>l.kind==='patients').reduce((n,l)=>{const job=c.jobs.find(j=>j.id===l.mission);return n+(job?.chain?(job.manifest.find(m=>l.id===job.id+':'+m.key)?.count||0):Math.round(l.mass/.2));},0);check(people<=(v.shipID==='curlew'?24:v.shipID==='ibis'?12:8),'Passenger or ward capacity exceeded.');}
 check(equipped<=2,'At most two active relics across all collections.');
}

// Commercial allocations share the industrial stock ledger; reserves never create cargo.
function recordMarketObservation(s,type){if(s.incident||s.battle||!['create','buy','sell','buy-max','sell-all','depart','resolve','merchant-deliver'].includes(type))return;const r=merchantState(s);r.observations??={};r.observations[s.location]={day:s.day,goods:Object.fromEntries(qualifiedCommodities(s).map(g=>{const q=marketState(s,g.id),stock=marketStock(s,g.id,s.location,false);return [g.id,{bid:q.sell,ask:q.buy,offered:stock.available,buyer:stock.buyerAllowance}];}))};}
const commercialRules=Object.freeze({medicalRetailLots:2,inputDays:3,lifeSupportDays:2,buyerDays:2,exportDays:1,workingReserve:1500,contractDays:180,maxContracts:3,maxLines:3,trustVolume:100,trustCap:12});
function commercialReserve(flow,g){return Math.max(80,((flow.consumptionBase||0)*Math.min(30,flow.replenishmentDays)+(flow.productionBase||0)*5)*g.inventoryScale);}
function merchantState(s){return s.merchantBusiness||(s.merchantBusiness={version:1,purchases:{},customers:{},contracts:[],closed:{},deliveries:0,units:0});}
function pruneBuyerReceipts(s,r){for(const [k,v] of Object.entries(r.purchases))if(v.day!==s.day)delete r.purchases[k];}
function buyerAllocation(s,id,pid,flow,quantity,capacity){
 // Net stock receipts also let buyers accept cargo again after a captain buys it back.
 const g=good(id),local=marketEconomy.commodityProfile(pid,id),exported=Math.max(0,flow.productionBase-flow.consumptionBase),activity=(flow.consumptionBase*commercialRules.buyerDays+exported*commercialRules.exportDays)*g.inventoryScale;
 const capacityLeft=Math.max(0,Math.floor(capacity-quantity+1e-8)),reserve=commercialReserve(flow,g),stockFactor=Math.max(.05,Math.min(1.5,reserve/Math.max(1,quantity))),total=local.stationBuys?Math.max(1,Math.floor(activity*stockFactor)):0,receipt=s.merchantBusiness?.purchases?.[pid+':'+id],spent=receipt?.day===s.day?(receipt.units||0)-(receipt.bought||0):0;
 return {total,remaining:Math.max(0,Math.min(capacityLeft,total-spent))};
}
function merchantContribution(s,id,n,profit){
 const g=good(id),f=marketEconomy.supply(s.location,id,s.day),stock=marketStock(s,id,s.location,false);if(profit<=0||f.consumptionBase<=0||stock.quantity>=stock.baseline)return;
 const r=merchantState(s),old=r.customers[s.location]||{units:0,profit:0,trust:0,day:s.day},useful=Math.min(n,Math.max(0,Math.floor(stock.baseline-stock.quantity)));if(useful<1)return;
 const previous=old.trust;old.units+=useful;old.profit+=profit*useful/n;old.day=s.day;old.trust=Math.min(commercialRules.trustCap,Math.floor(Math.log1p(old.units/commercialRules.trustVolume)*3));r.customers[s.location]=old;r.units+=useful;
 if(old.trust>previous){changeStationReputation(s,s.location,Math.min(1,old.trust-previous),'Supplied useful commercial cargo.');record(s,'Commercial relationship improved at '+stationLabel(s.location)+': useful '+g.name.toLowerCase()+' deliveries.');}
}
// Exchange purchasing orders were retired: ordinary Buy/Sell is the only cargo exchange.
function merchantOffers(s){return [];}
function retireMerchantAgreements(s){
 const r=s.merchantBusiness;if(!r?.contracts?.length)return;
 const count=r.contracts.length;r.contracts=[];
 record(s,'Closed '+count+' retired exchange supply agreement'+(count===1?'':'s')+'. No fee or reputation penalty; owned cargo and funds retained.');
}
function merchantOverview(s){const r=s.merchantBusiness;return {offers:merchantOffers(s),contracts:(r?.contracts||[]).filter(c=>c.status==='active').map(c=>({...clone(c),line:c.lines[c.stage],deliverable:c.lines[c.stage].port===s.location&&tradableQuantity(s,c.lines[c.stage].good)>=c.lines[c.stage].units&&s.day<=c.deadline})),relationships:Object.entries(r?.customers||{}).map(([pid,v])=>({port:pid,...v})),deliveries:r?.deliveries||0,units:r?.units||0,objectives:[{name:'Reliable local supplier',value:Object.values(r?.customers||{}).filter(v=>v.trust>=3).length,target:3},{name:'Regional trading network',value:Object.values(r?.customers||{}).filter(v=>v.trust>=6).length,target:8}]};}
function merchantAction(s,type,arg){check(false,'Exchange supply agreements have been retired. Use Buy or Sell to trade owned cargo.');}
function expireMerchantContracts(s){retireMerchantAgreements(s);}
function validateMerchant(s){const r=s.merchantBusiness;if(r===undefined)return;const key=k=>{const [p,g,...extra]=k.split(':');return !extra.length&&world.ports.some(v=>v.id===p)&&goods.some(v=>v.id===g);};check(r&&r.version===1&&r.purchases&&Object.keys(r.purchases).length<=world.ports.length*goods.length&&Object.entries(r.purchases).every(([k,v])=>key(k)&&integer(v.day,0,s.day)&&integer(v.units,0,1e9)&&(v.bought===undefined||integer(v.bought,0,1e9))),'Invalid commercial buying register.');check(r.customers&&Object.keys(r.customers).length<=world.ports.length&&Object.entries(r.customers).every(([p,v])=>world.ports.some(x=>x.id===p)&&integer(v.units,0,1e12)&&finite(v.profit,0,1e15)&&integer(v.trust,0,12)&&integer(v.day,0,s.day)),'Invalid commercial relationships.');check(r.closed&&Object.keys(r.closed).length<=world.ports.length*2&&Object.entries(r.closed).every(([k,v])=>{const [p,kind]=k.split(':');return world.ports.some(x=>x.id===p)&&['procurement','circuit'].includes(kind)&&integer(v,0,Math.floor(s.day/30));}),'Invalid supply agreement receipts.');check(Array.isArray(r.contracts)&&r.contracts.length<=3&&new Set(r.contracts.map(c=>c.id)).size===r.contracts.length&&r.contracts.every(c=>typeof c.id==='string'&&c.id.length<120&&c.status==='active'&&integer(c.stage,0,c.lines.length-1)&&integer(c.deadline,0,365249)&&finite(c.paid,0,1e12)&&Array.isArray(c.lines)&&c.lines.length>=1&&c.lines.length<=3&&c.lines.every(l=>key(l.port+':'+l.good)&&integer(l.units,1,40)&&integer(l.unitPrice,1,1e8))),'Invalid supply agreement.');if(r.observations!==undefined)check(Object.keys(r.observations).length<=world.ports.length&&Object.entries(r.observations).every(([p,v])=>world.ports.some(x=>x.id===p)&&integer(v.day,0,s.day)&&Object.keys(v.goods).length<=goods.length&&Object.entries(v.goods).every(([g,q])=>key(p+':'+g)&&['bid','ask','offered','buyer'].every(k=>integer(q[k],0,1e9)))),'Invalid dated market observations.');check(integer(r.deliveries,0,1e9)&&integer(r.units,0,1e12),'Invalid commercial totals.');}
function merchantShipRole(s,v=s){const h=effectiveShip(v),roles=classCapabilities[v.shipID]||[];return {ship:actorID(s,v),name:actorName(s,v),cargoTonnes:h.cargoTonnes,cargoM3:h.cargoM3,roles,provisionsPerDay:12,spares:ships.find(h=>h.id===v.shipID).maxSpares};}
// A dated outlook, never a promise or a live remote observation.
function merchantPlan(s,{good:id,units=1,destination:to,returnGood=null,returnUnits=1}){
 check(goods.some(g=>g.id===id)&&integer(units,1,32000),'Choose a legal good and whole quantity.');check(to!==s.location&&hasAccess(s,to),'Choose an accessible destination.');
 const buy=tradeTotal(s,id,units,true),g=good(id),loaded=clone(s),fit=cargoRoom(s,id)>=units;if(fit)addFleetCargo(loaded,id,units,{units,cost:buy});const q=quote(loaded,to),fuel=routeFuelLoadingPlan(loaded,to),days=q.coastDays+q.waitDays,arrival=s.day+days;
 const loadingStock=marketStock(s,id,s.location,false);loaded.exchangeStock=clone(marketBook(s)||marketEconomy.createNetwork(s.day));loaded.exchangeStock.entries[s.location+':'+id]={day:s.day,quantity:Math.max(0,loadingStock.quantity-units)};
 const target={...loaded,location:to,day:Math.min(365249,arrival)},observed=marketStock(s,id,to,false),forecast=marketStock(target,id,to,false),bid=marketState(s,id,to),sale=tradeTotal(target,id,units,false),propellant=fuel.feasible?fuelCost(fuel.expectedBurn,s.location):null,interest=Math.ceil((s.bank?.legacyDebt??s.debt)*(1.04**(days/365.25)-1)+(s.bank?.loans||[]).reduce((n,l)=>n+l.balance*(loanInterestFactor(l,s.day,Math.min(365249,arrival))-1),0)),crewWages=q.crewWages||0,provisions=Math.max(0,q.provisions-crewWages),berth=q.berth,exposure=merchantExposure(loaded),expectedRisk=Math.ceil(q.piracyRisk*exposure.fee),delay=Math.ceil((q.incidentRisk||0)*2*(12*fleetMembers(s).length+crewWages/Math.max(1,days))),expenses=(propellant||0)+provisions+crewWages+berth+interest+delay+expectedRisk,net=sale-buy-expenses,workingReserve=Math.max(commercialRules.workingReserve,Math.ceil(expenses*1.5)),fuelTopUp=fuel.feasible&&fuel.target>fleetOverview(s).fuel?fleetFuelCost(loaded,fuel.target):0,cashAfterLoading=s.credits-buy-fuelTopUp-q.provisions-q.berth;
 const returnGoods=qualifiedCommodities(s).filter(x=>marketEconomy.listed(to,x.id)&&cargoCompatible(s,x.id)).map(x=>({good:x.id,buy:marketState(target,x.id,to).buy,sell:marketState(target,x.id,s.location).sell})).filter(x=>x.sell>x.buy).sort((a,b)=>(b.sell-b.buy)-(a.sell-a.buy)).slice(0,3);
 let returnPlan=null;if(returnGood&&fit&&fuel.feasible){check(goods.some(g=>g.id===returnGood)&&integer(returnUnits,1,32000),'Choose a legal return manifest.');const home=s.location,back=clone(loaded);back.location=to;back.day=Math.min(365249,arrival);back.exchangeStock=clone(marketBook(target)||marketEconomy.createNetwork(back.day));back.exchangeStock.entries[to+':'+id]={day:back.day,quantity:forecast.quantity+units};removeFleetCargo(back,id,units,true);back.credits=Math.max(0,Math.floor(cashAfterLoading+sale));setFleetFuel(back,Math.max(0,Math.max(fleetOverview(s).fuel,fuel.target)-fuel.expectedBurn));returnPlan=merchantPlan(back,{good:returnGood,units:returnUnits,destination:home});}
 const observation=s.merchantBusiness?.observations?.[to];
 return {good:id,units,destination:to,observedDay:observation?.goods?.[id]?observation.day:null,arrival,days,fit,feasible:fit&&fuel.feasible&&arrival<=365249,buy,sale,averageBuy:buy/units,averageSale:sale/units,observedBid:observation?.goods?.[id]?.bid??null,returnPlan,circuitNet:returnPlan?net+returnPlan.net:null,buyerAllowance:forecast.buyerAllowance,observedAllowance:observed.buyerAllowance,protectedStock:marketStock(s,id,s.location,false).protectedStock,tonnes:units*cargoSpecs.packing(id).grossKgPerLot/1000,m3:units*cargoSpecs.packing(id).m3PerLot,expenses,breakdown:{propellant,provisions,crewWages,berth,interest,delay,expectedRisk},net,low:Math.floor(sale*.9-buy-expenses-exposure.fee*q.piracyRisk),high:Math.ceil(sale*1.08-buy-expenses+expectedRisk),risk:q.piracyRisk,workingReserve,cashAfterLoading,returnGoods,warning:units>loadingStock.available?'This order exceeds the station’s offered allocation.':!marketAccess(s,id).discovered?'This wholesale account is not open yet.':!fit?'Cargo exceeds compatible hold space.':!fuel.feasible?'Beyond the loaded fleet’s fuel range.':units>forecast.buyerAllowance?'The projected buyer cannot absorb this full order today.':cashAfterLoading<workingReserve?'This load leaves too little working cash.':net<=0?'The spread does not cover the estimated voyage budget.':''};
}
const dialogueVoices=dialogueVoiceFactory.create({port,placeStories,hash:castHashMixed,homePort,crewReadiness,bankOverview,bankReception:bankConversationReception});
const careerDevelopment=careerDevelopmentFactory.create(()=>api,{sessionFor:dialogueSession,voices:dialogueVoices,record,advance});
const careerConversations=careerConversationFactory.create(()=>api,{sessionFor:dialogueSession,voices:dialogueVoices,secretDraw,secretHost,personalDeeds:personalGoodDeeds,continuing:careerDevelopment});
const storyConversations=storyConversationFactory.create({caseIndex:(s,id,h,n)=>careerConversations.caseIndex(s,id,h,n),port,stationLabel,establishments,placeStories,driveStory,governmentBriefing,voices:dialogueVoices,commissionFor:dialogueCommission,sessionFor:dialogueSession,privateHandover,privateOutcomeFor});
const dialogueMemory=dialogueMemoryFactory.create({port,standing:stationStanding,sessionFor:dialogueSession,commissionFor:dialogueCommission,voices:dialogueVoices,discussionValid:storyConversationFactory.validDiscussion,reportContext:dialogueReportSignature});
function combatAssessment(s){if(s.battle?.rulesVersion===2)return combat2.assessment(s);if(s.incident?.kind!=='pirate')return null;const preview=clone(s);startBattle(preview,'defense');return combat2.assessment(preview);}
const combat2=combatFactory.create({check,rng,actors,actorID,actorName,owned,combatLog,finishBattle,destroyShip,spendFleetFuel,burnFor,fleetManeuverFuel,level,earn:(s,k,n)=>earn(s,k,n,false),captainPerk,repairUnits:v=>Math.max(1,Math.ceil(ships.find(h=>h.id===v.shipID).dryMass/25)),encounterProfile,protectedMerchant,recordCommand:(s,t)=>record(s,t),hullInfo:id=>ships.find(h=>h.id===id)},shipRules);
const api={warehouseTiers,warehouseTier,warehouseUpgradeQuote,commercialStandingRules,commercialStanding,commercialRules,commercialReserve,buyerAllocation,merchantExposure,merchantOverview,merchantOffers,merchantPlan,merchantShipRole,cargoSpecs,cargoLoad,cargoMass,cargoVolume,shipCargoRoom,shipCargoFits,physicalRoom,warehouseVolume,warehouseCargoRoom,freightOfferTiming,freightPayout,freightExitQuote,freightReturnOverview,freightDispatchRoutes,freightDispatchBriefing,routeFuelLoadingPlan,routeFuelRules,fleetManeuverFuel,careerLetterReply,careerDevelopment:s=>careerDevelopment.overview(s),careerRegional:s=>careerDevelopment.regional(s),careerNavigationAward:(s,dest,q)=>careerDevelopment.navigationAward(s,dest,q),crewCharacter:m=>careerConversations.crewProfile(m),careerOverview:s=>careerConversations.overview(s),crewConversation:(s,id)=>careerConversations.crewView(s,id),careerChapter:(s,id,contact='')=>careerConversations.chapter(s,id,stationContacts(s.location,id,s).find(h=>(h.contactID||'')===contact)),captainReplyLabel,stationLabel,manufacturingCostFloors,industrialProcessValue,tradeWorkRules,tradeCareerSummary:s=>s.tradeCareer?clone(s.tradeCareer):null,blockadeLifecycle,blockadeEpisode,shipReservations,productionBriefing,productionTalk,freightRewardRules,freightRewardQuote,patrolRouteRisk,freightTiers,freightLines,freightDescription,freightCareer,freightLoadPlan,exchangeRules,blockadeRiskRules,blockadeRisk,blockadeReport,blockadeRecoveryRules,blockadePremium,blockadeRecovery,crewEncounterRules,crewEncounterContext,crewEncounterChance,crewEncounterModel,bankRateRules,bankRateStep,bankInterestFactor,loanInterestFactor,loanRate,journalEntry,journalChanges,journalText:journalModel.text,journalChangeText:journalModel.changeText,reputationRumorView,reputationStep,blockadeOverview,blockadeStation,crewBenefit:m=>clone(crewBenefit(m)),supportEffect,crewSpecialties:()=>clone(supportSpecialties),crewTier:m=>clone(crewTier(m)),crewTiers:()=>clone(crewGrades),relicCollectorSites:()=>[...relicCollectorSites],relicCollectorOverview,relicHuntOverview,crewOverview,warehouseLeaseOverview,shipNameBank:shipNames.pools,shipNameThemes:shipNames.themes,dryDockSelection,dryDockQuote,dryDockAmmo,registryValue,registrySale,registryShips,independentCharter,marketSupplyBriefing,customsStanding,creditPortfolio,commodityProgress,commodityMilestones,commodityDiscoveryRules,commodityUnlockSchedule,captainAdvantages,captainPerk,temperamentInfo,negotiationChance,localBounties,brokerMarketBriefing,customsPreparation,customsMethods,diplomaticOverview,diplomaticStanding,governmentKey,governmentHistory:()=>clone(governmentHistory),governmentBriefing,commodityJournal,commodityUnlocks,serviceRouteCost,serviceReward,tradeRumorJournal,marketRumorLeads,canteenTradeTalk,marketSaleSource,marketDestinations,marketDestination,marketStock,marketAccess,marketOrderLimits,cargoCompatible,cargoRoom,marketEconomy,privateEndingSummary:id=>privateEndings[id]?.text||'',personalProjectsHere,relationshipOpportunities,activeContracts,freightRouteSchedule,freightBoardSchedule,shipRestockDays,fieldEquipment,hullFuelCost,fleetFuelCost,missionOffers,missionJournal,missionPermitOffers,antiquityOffers,campaignIntroductions,stationSpecialties,factionStanding,specialistServiceOverview,classCapabilities,capabilityShips,repairQuote,sparePrice,serviceDiscount,civilianOverview,carrierOverview,passengerManifest,operationDiscoveryChoices,shipMarket,earnedShipExperience,combatEdition:2,combatAssessment,liveCombatView:s=>combat2.liveView(s),battleProfile:(s,id)=>combat2.profile(s,id),battleProfileOptions:(s,id)=>combat2.profileInfo(s,id),fittingCosts,weaponFits:shipRules.weaponFits,cargoAllocation:shipRules.cargoAllocation,combatProfile:shipRules.profile,combatReadiness:(s,v)=>combat2.readiness(s,v),combatEscapeChance:s=>combat2.escapeChance(s),characterRoster,creditAssessment,relicCatalog:()=>clone(relicCatalog),relicBonuses,relicOverview,underworldOverview,warehouseFacility,warehouseOverview,warehouseAssets,homePort,homeBaseOverview,stationStanding,reputationRoster,branchDebt,debtRaidRisk,debtCollectionOverview,dialogueTree,commissionJournal,fleetStatus,systemAccess,clinicOverview,coordinatorOverview,crewReadiness,freightOverview,freightQuantity,tradableQuantity,freightUnits,dryDockOverview,escortRoster,fleetOverview,fleetQuantity,fleetFuelPlan,fleetMembers,shipOffer,allGoods,contrabandGoods,contrabandMarket,inspectionChance,xpThreshold,skillProgressForXP,reputationData,reputationProfile,patrolSeparation,patrolActivity,canteenOffer,marketConditions,localLicenceOffers,issuedLicenceHistory,visibleDestinationAccess,saleAssessment,expandedPortraitCatalog,extraPortraitCatalog,castPerson,financialOverview,piracyAssessment,bountyOffers,notoriousRaiders:()=>clone(notoriousRaiders),fleetCapacity:()=>MAX_FLEET,journeyFormation,tacticalFormation,fuelCost,archivedEstablishments:pid=>establishments(pid,true),portFacilities,supplierDirectory,establishmentVisit,venueConversationOptions,stationVisual,stationContacts,marketState,marketSnapshot,navigationScene,celestialMotion,immersiveText,licenceOffers,licenceDiscount,conversationOptions:()=>conversationTopics,shipVisual,bankTerms,bankOverview,laserPower,progression,destinationAccess,accessiblePorts,charterProgress,accessSummary,speciesOptions:()=>speciesCatalog,speciesCatalog,establishments,mapScene,combatScene,beltCrossing,driveArchive:()=>clone(driveStory),driveData:()=>clone(DRIVE),legacyTransfer,hullAcceleration,routeTransfer,shipCatalog:()=>ships,upgradeOptions:()=>upgradeCatalog,combatPower,canEvade,upgradeCatalog,equipmentValue,tradeInCost,netWorth,activeHull,actors,actorID,actorName,effectiveShip,raidOffers,fleetQuote,berthRate,reserveFee,burnFor,world,goods,ships,backgrounds,temperaments,skillNames,fresh,parse,validate,transact,port,ship,used,market,tradeTotal,quote,transfer,launchProblem,offers,level,reputation,pirateFee,evasionFuel,clone};
root.Heliocline=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
