'use strict';
(function(root){
// Seconds per bank salvo; fractional deadlines retain upgrade benefits on a 0.5s clock.
function weaponTiming(w){const base=({pulse:2,beam:3,burst:2.5,defensive:1.5,cannon:1.5,coil:4,rail:5,missile:7,torpedo:10})[w.type]||(w.slot==='laser'?2.5:w.slot==='weapons'?4:7);return {seconds:base/(1+.08*Math.max(0,Math.min(3,w.level||0))),upgradePercent:8};}
// One deterministic combat implementation for both desktop and browser.
const liveTiming=Object.freeze({tickSeconds:.5,stepsPerRound:6,maximumRounds:30,maximumSteps:180});
function create(host,rules){
 const {check,rng,actors,actorID,actorName,owned,combatLog,finishBattle,destroyShip,spendFleetFuel,burnFor,level,earn}=host;
 const formationFuel=(s,dv)=>host.fleetManeuverFuel?host.fleetManeuverFuel(s,dv):actors(s).reduce((n,v)=>n+burnFor(v,dv),0);
 const profile=v=>rules.profile(v),unitID=(s,v)=>v.id&&v!==s?v.id:actorID(s,v),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const unit=(v)=>{const p=profile(v);return {hp:p.hullPoints*v.hull/100,shield:p.shield,lastHit:-2,ready:{laser:1,weapons:1,ordnance:1}};};
 function progress(b){return b.progress||(b.progress={navigation:0,engineering:0,tags:[],scanned:{},disabled:{},vented:[],captures:[]});}
 function actionXP(s,skill,n,tag){const p=progress(s.battle);if(p.tags.includes(tag))return;const gain=Math.min(n,10-(p[skill]||0));p.tags.push(tag);if(gain>0){p[skill]=(p[skill]||0)+gain;earn(s,skill,gain);}}
 // Encounter bands use factory class capability, never cash, cargo,
 // current damage or empty magazines. Preparations remain valuable; raiders
 // do not mirror an upgrade as soon as the captain installs it.
 function capability(v){const p=profile(v),weapons=p.weapons.filter(w=>w.count),dps=weapons.reduce((n,w)=>n+w.bank/weaponTiming(w).seconds,0);return Math.sqrt((p.hullPoints/(1-p.armor)+p.shield)*Math.max(0,dps));}
 const templates={solo:{tier:1,ids:['kestrel']},skirmish:{tier:1,ids:['merlin']},raiders:{tier:1,ids:['osprey','swift']},reinforced:{tier:1,ids:['osprey','merlin']},regional:{tier:2,ids:['osprey','heron']},organized:{tier:2,ids:['osprey','heron','merlin']},frontier:{tier:3,ids:['gyrfalcon','nightjar','merlin']},'inner-blockade':{tier:1,ids:['merlin','swift']},'regional-blockade':{tier:2,ids:['gannet','heron','swift']},'outer-blockade':{tier:3,ids:['gyrfalcon','gannet','osprey']}};
 function hostileFittings(tier){const upgrades=rules.empty();if(tier>=2){upgrades.armor=tier-1;upgrades.sensors=tier-1;upgrades.laser=1;}if(tier===3){upgrades.weapons=1;upgrades.ordnance=1;}return upgrades;}
 // Ordinary contacts follow the flagship's factory class. Escorts and refits
 // are preparation, not an immediate enemy tax. Overlapping class bands avoid
 // a deterministic fleet wipe at a single capability boundary. The contact's
 // recorded seed fixes the draw; previews do not advance the random stream.
 function encounterPlan(s,tier,kind='ambient'){
  if(kind==='blockade')return {edition:1,kind,band:tier===1?'inner-blockade':tier===2?'regional-blockade':'outer-blockade',tier};
  const power=capability({...s,upgrades:rules.empty()}),smooth=(a,b)=>{const x=clamp((power-a)/(b-a),0,1);return x*x*(3-2*x);};
  let hash=2166136261;for(const c of String(s.seed))hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;const draw=hash/4294967296;
  const band=tier===3?(draw<smooth(120,240)?'frontier':'regional'):tier===2?(draw<smooth(120,240)?'organized':draw<smooth(60,120)?'regional':'skirmish'):(draw<smooth(120,240)?'reinforced':draw<smooth(60,120)?'raiders':draw<smooth(25,55)?'skirmish':'solo');
  return {edition:1,kind:'ambient',band,tier:templates[band].tier};
 }
 function namedEligible(s,target){if((s.acceptedBounties||[]).some(a=>a.id===target.id))return true;const experienced=(s.profile.xp.navigation||0)>=100||s.profile.stats.voyages>=6||s.profile.stats.victories>0;if(!experienced)return false;const opponents=(target.tier===1?[target.shipID,'kestrel']:target.tier===2?[target.shipID,'heron','merlin']:[target.shipID,'gannet','osprey']).map(shipID=>({shipID,upgrades:hostileFittings(target.tier)})),enemy=opponents.reduce((n,v)=>n+capability(v),0),friendly=actors(s).reduce((n,v)=>n+capability(v),0);return friendly>=enemy*.9;}
 function validateEncounterPlan(p){check(p&&p.edition===1&&Object.keys(p).length===4&&['ambient','blockade'].includes(p.kind)&&templates[p.band]&&p.tier===templates[p.band].tier&&(p.kind==='blockade')===p.band.endsWith('-blockade'),'Invalid encounter formation plan.');}
 function initialize(s,tier,target){
  const b=s.battle;b.rulesVersion=2;b.range=6;b.units={};b.jammerID=null;b.escapeScreenID=null;
  const info=host.encounterProfile?host.encounterProfile(s,tier,target):null;if(info)b.faction=info;
  const alternate=info&&[...info.leader].reduce((n,c)=>n+c.charCodeAt(0),0)%2;let ids=tier===1?(alternate?['kestrel','swift']:['swift','kestrel']):tier===2?(alternate?['osprey','merlin','swift']:['osprey','heron','merlin']):alternate?['gyrfalcon','gannet','osprey']:['gyrfalcon','nightjar','merlin'];
  if(b.encounterPlan){validateEncounterPlan(b.encounterPlan);const t=templates[b.encounterPlan.band];tier=t.tier;ids=t.ids;b.enemies=b.enemies.slice(0,ids.length);if(ids.length>b.enemies.length)throw Error('Encounter template exceeds the formation.');}
  b.enemies=b.enemies.map((e,i)=>{const shipID=i===0&&target?target.shipID:ids[i],upgrades=hostileFittings(tier);
   const hull=100,v={...e,shipID,upgrades,hull,maxHull:100,ammo:0,ordnanceAmmo:0,heat:0},fits=rules.weaponFits(v);v.ammo=Math.min(fits[1].magazine,48);v.ordnanceAmmo=Math.min(fits[2].magazine,tier===3?8:4);v.damage=fits[0].bank;v.armor=upgrades.armor;v.name=i===0&&target?target.ship:(host.hullInfo?.(shipID)?.name||shipID)+' raider';return v;});
  if(b.encounterPlan?.kind==='ambient')b.reward=Math.min(b.reward,Math.round(b.enemies.reduce((n,e)=>n+(host.hullInfo?.(e.shipID)?.price||0),0)*.025));
  b.protected=host.protectedMerchant?host.protectedMerchant(s,b.destination):null;if(b.protected)b.units[b.protected.id]=unit(b.protected);
  for(const v of actors(s))b.units[actorID(s,v)]=unit(v);for(const e of b.enemies)b.units[e.id]=unit(e);
  if(info&&!target)b.enemies[0].name=info.leader+' · '+b.enemies[0].name;
  b.log=['Contact at 6 km. One weapon bank, maneuver or support opportunity per ship each exchange. Maneuvers consume propellant.'];
  if(s.battleDoctrine)configureLive(s,{battle:b.id,step:0,revision:0,engage:true});
 }
 function heatCost(v,w,bonus=0){return Math.max(0,w.heat-(v.shipID==='osprey'&&w.slot==='laser'?3:0)-(w.slot==='laser'?bonus:0));}
 function escapeChance(s){const b=s.battle,screen=actors(s).some(v=>actorID(s,v)===b.escapeScreenID&&v.hull>=35)? .1:0;return clamp(.6+(s.upgrades.drive||0)*.035+level(s,'navigation')*.012+screen,.35,.95);}
 function canSupport(s,id){return actors(s).some(v=>actorID(s,v)===id&&v.hull>=35);}
 function readiness(s,v){
  const b=s.battle,p=profile(v),id=unitID(s,v),u=b?.units?.[id],range=b?.live?.ranges?.[id]??b?.range,heat=b?.heat?.[id]||0,acted=b?.acted?.includes(id),base=acted?'This ship has already acted this round.':v.hull<=0?'This ship is disabled.':'';
  const weapons=p.weapons.map(w=>({...w,heatCost:heatCost(v,w,host.captainPerk?.(s,'laserCooling')||0),availableRound:u?.ready[w.slot]||1,ammoRequired:w.count*w.ammo,reason:base||(!w.count?'Not fitted.':(b?.live?.edition===2?(u?.cooldowns?.[w.slot]||0)>b.live.step*.5:(u?.ready[w.slot]||1)>(b?.round||1))?(b?.live?.edition===2?'Reloading · '+Math.max(0,u.cooldowns[w.slot]-b.live.step*.5).toFixed(1)+' s remaining.':'Reloading until round '+u.ready[w.slot]+'.'):b&&range>w.range?'Out of range: close to '+w.range+' km.':heat+heatCost(v,w,host.captainPerk?.(s,'laserCooling')||0)>100?'Guard to cool weapons.':w.slot==='weapons'&&(v.ammo||0)<w.count*w.ammo?'Not enough regular rounds.':w.slot==='ordnance'&&(v.ordnanceAmmo||0)<w.count*w.ammo?'Not enough missiles or torpedoes.':'')}));
  const movementReason=base||(id!==actorID(s,s)?'The flagship commands formation movement.':b?.maneuverRound===b?.round?'Formation already maneuvered this round.':actors(s).reduce((n,v)=>n+v.fuel,0)+1e-8<formationFuel(s,.05)?'The fleet needs shared propellant for formation movement.':'');
  return {...p,id,heat,acted:!!acted,movementReason,repairUnits:host.repairUnits?host.repairUnits(v):1,hp:u?.hp??p.hullPoints*v.hull/100,currentShield:u?.shield??p.shield,weapons,escapeChance:b?escapeChance(s):0};
 }
 function damage(s,v,id,w,raw,guarded=false,hullLimit=Infinity){
  const b=s.battle,u=b.units[id],p=profile(v);let shieldDamage=0,hullDamage=0;
  if(u.shield>0){shieldDamage=Math.min(u.shield,raw*w.shield);u.shield-=shieldDamage;raw=Math.max(0,raw-shieldDamage/w.shield);}
  if(raw>0){hullDamage=Math.min(u.hp,hullLimit,raw*w.armor*(1-p.armor)*(guarded?Math.max(.3,.45-(host.captainPerk?.(s,'guardBonus')||0)):1));u.hp=Math.max(0,u.hp-hullDamage);v.hull=u.hp<=1e-8?0:Math.min(100,Math.ceil(u.hp/p.hullPoints*100-1e-9));}
  u.lastHit=b.round;return {shieldDamage,hullDamage};
 }
 function fire(s,shooter,id,target,targetID,w,friendly,accuracyPenalty=0,received=null,exchange=null){
  const b=s.battle,u=b.units[id],heat=friendly?(b.heat[id]||0):shooter.heat;
  if(w.slot==='weapons')shooter.ammo-=w.count*w.ammo;if(w.slot==='ordnance')shooter.ordnanceAmmo-=w.count*w.ammo;
  if(friendly)b.heat[id]=heat+heatCost(shooter,w,host.captainPerk?.(s,'laserCooling')||0);else shooter.heat=heat+heatCost(shooter,w);u.ready[w.slot]=b.round+w.reload;if(b.live?.edition===2){const time=b.live.step*.5;u.cooldowns??={laser:0,weapons:0,ordnance:0};u.cooldowns[w.slot]=Math.max(u.cooldowns[w.slot],time-.5)+weaponTiming(w).seconds;}
  const jam=!friendly&&canSupport(s,b.jammerID)?.1:0,guard=b.guarded.includes(targetID),evade=b.evaded.includes(targetID),chance=clamp((friendly?.82:.72)+(shooter.upgrades.sensors||0)*.05+(friendly?level(s,'navigation')*.01+(host.captainPerk?.(s,'accuracy')||0):0)-heat*.001-(guard?.14:0)-(evade?.2:0)-jam-accuracyPenalty,.25,.95);
  const who=friendly?actorName(s,shooter):shooter.name,whom=friendly?target.name:actorName(s,target);
  if(rng(s)>=chance){if(exchange)exchange.events.push({from:id,to:targetID,weapon:w.slot,hit:false});combatLog(s,`${who}: ${w.name} missed ${whom}.`);return;}
  const brace=!friendly&&b.bracedTarget===targetID&&canSupport(s,b.bracedBy)?.1:0;
  if(w.slot==='ordnance'&&rng(s)<Math.min(.4,profile(target).intercept/100+brace)){if(exchange)exchange.events.push({from:id,to:targetID,weapon:w.slot,hit:false,intercepted:true});combatLog(s,`${whom} intercepted ${who}'s ${w.name.toLowerCase()} salvo.`);return;}
  const screen=!friendly&&actors(s).some(v=>v.shipID==='gannet'&&actorID(s,v)!==targetID&&v.hull>=35&&b.guarded.includes(actorID(s,v)))?.9:1;
  // Hostile salvos have a bounded hull-damage cadence, independent of current integrity.
  // Large banks remain dangerous without erasing a healthy small hull in one response.
  const hp=profile(target).hullPoints,limit=friendly?Infinity:Math.max(0,Math.min(hp*.25*(guard?Math.max(.3,.45-(host.captainPerk?.(s,'guardBonus')||0)):1)*screen,hp*.4*screen-(received?.[targetID]||0)));
  const raw=w.bank*(.9+rng(s)*.2)*screen*(friendly?1:w.slot==='ordnance'?.65:.8);
  if(exchange){exchange.hits.push({shooter,id,target,targetID,w,friendly,raw,guard,limit,budget:hp*.4*screen,who,whom});return true;}
  const result=damage(s,target,targetID,w,raw,guard,limit);
  if(received)received[targetID]=(received[targetID]||0)+result.hullDamage;
  combatLog(s,`${who}: ${w.name} hit ${whom}; ${result.shieldDamage.toFixed(1)} shield / ${result.hullDamage.toFixed(1)} hull damage${target.hull===0?' — destroyed':''}.`);
  if(!friendly&&target.hull===0&&target!==b.protected){delete b.units[targetID];for(const e of b.enemies)if(e.ordnanceLock?.target===targetID)delete e.ordnanceLock;destroyShip(s,target);}
  return result.shieldDamage+result.hullDamage>0;
 }
 function recharge(s){
  const b=s.battle;
  for(const v of [...actors(s),...b.enemies.filter(e=>e.hull>0)]){const friendly=!b.enemies.includes(v),id=friendly?actorID(s,v):v.id,u=b.units[id],p=profile(v),heat=friendly?(b.heat[id]||0):v.heat;if(u&&p.shield&&b.round-u.lastHit>=2&&heat<80)u.shield=Math.min(p.shield,u.shield+p.shieldRecharge);}
 }
 function enemyTurn(s){
  const b=s.battle,received={};
  for(const e of b.enemies.filter(e=>e.hull>0)){
   const u=b.units[e.id],fits=profile(e).weapons;
   const disabled=b.progress?.disabled[e.id];
   if(e.hull<20&&!b.bountyID&&b.range>=10){combatLog(s,`${e.name} breaks contact; its surviving crew will remain active in this region.`);b.enemyWithdrew=true;finishBattle(s,'escaped');return;}
   const usable=fits.filter(w=>w.slot!==disabled?.slot&&w.count&&u.ready[w.slot]<=b.round&&b.range<=w.range&&e.heat+heatCost(e,w)<=100&&(w.slot==='laser'||(w.slot==='weapons'?e.ammo:e.ordnanceAmmo)>=w.count*w.ammo));
   if(e.heat>=75||!usable.length){e.heat=Math.max(0,e.heat-30);if(disabled?.slot!=='drive'&&b.enemyManeuverRound!==b.round&&fits.some(w=>w.count&&w.range<b.range&&(w.slot==='laser'||(w.slot==='weapons'?e.ammo:e.ordnanceAmmo)>=w.count*w.ammo))){b.range=Math.max(.5,b.range-1);b.enemyManeuverRound=b.round;}combatLog(s,`${e.name} cools and adjusts its approach.`);continue;}
   const targets=actors(s),allTargets=[...targets,...(b.protected?.hull>0?[b.protected]:[])],locked=allTargets.find(v=>unitID(s,v)===e.ordnanceLock?.target);
   if(e.ordnanceLock&&!locked)delete e.ordnanceLock;
   const cargoTarget=targets.slice().sort((a,c)=>Object.values(c.cargo).reduce((n,q)=>n+q,0)-Object.values(a.cargo).reduce((n,q)=>n+q,0))[0],escorts=targets.filter(v=>v!==s),target=locked||(b.protected?.hull>0&&rng(s)<.35?b.protected:b.faction?.intent==='seize cargo'&&rng(s)<.5?cargoTarget:e.intent==='flank'&&escorts.length?escorts[Math.floor(rng(s)*escorts.length)]:s),targetID=unitID(s,target);
   const targetShield=b.units[targetID].shield,score=w=>w.bank*(targetShield>0?w.shield:w.armor)/(1+Math.max(0,w.reload-1)*.2);let w=usable.sort((a,b)=>score(b)-score(a))[0];if(e.ordnanceLock&&e.ordnanceLock.round<=b.round){const salvo=usable.find(w=>w.slot==='ordnance');if(salvo)w=salvo;}
   if(w.slot==='ordnance'){
    const disrupted=b.evaded.includes(targetID)||canSupport(s,b.jammerID);
    if(disrupted){delete e.ordnanceLock;combatLog(s,`${e.name}: missile lock disrupted by evasive movement or targeting interference.`);}
    else if(!e.ordnanceLock){e.ordnanceLock={target:targetID,round:b.round+1};combatLog(s,`${e.name} is locking ${target===b.protected?target.name:actorName(s,target)} for a missile / torpedo salvo next round. Guard, evade, jam or withdraw.`);}
    if(disrupted||e.ordnanceLock.round>b.round){w=usable.filter(w=>w.slot!=='ordnance').sort((a,b)=>score(b)-score(a))[0];if(!w){e.heat=Math.max(0,e.heat-15);continue;}}
   }
   if(w.slot==='ordnance')delete e.ordnanceLock;
   fire(s,e,e.id,target,targetID,w,false,0,received);if(!s.battle)return;
  }
  recharge(s);if(b.round>=12){finishBattle(s,'inconclusive');return;}
  b.round++;b.acted=[];b.guarded=[];b.evaded=[];b.jammerID=null;b.escapeScreenID=null;b.bracedTarget=null;b.bracedBy=null;
  for(const id of Object.keys(b.heat))b.heat[id]=Math.max(0,b.heat[id]-15);
  b.enemies.forEach((e,i)=>{e.heat=Math.max(0,e.heat-10);e.intent=i%2?'flank':'press';});
 }
 function order(s,arg){
  const b=s.battle,v=owned(s,arg.actor),id=actorID(s,v);check(v===s||v.escort,'Only the flagship and assigned escorts can fight.');check(v.hull>0,'This ship is disabled.');
  if(arg.order==='surrender'){check(v===s,'The flagship requests recovery.');finishBattle(s,'defeat');return;}
  check(!b.acted.includes(id),'This ship has already acted this round.');const heat=b.heat[id]||0,p=progress(b);
  if(arg.order==='retreat'){check(v===s,'The flagship orders fleet withdrawal.');spendFleetFuel(s,formationFuel(s,.15));if(rng(s)<escapeChance(s)){finishBattle(s,'escaped');return;}combatLog(s,'The withdrawal corridor is blocked. Propellant spent; the flagship action is used.');}
  else if(['laser','fire','salvo','ordnance'].includes(arg.order)){
   const slot=arg.order==='laser'?'laser':arg.order==='ordnance'?'ordnance':'weapons',w=readiness(s,v).weapons.find(w=>w.slot===slot),target=b.enemies.find(e=>e.id===arg.target&&e.hull>0);check(target,'Select an operational hostile.');check(!w.reason,w.reason);if(fire(s,v,id,target,target.id,w,true))actionXP(s,'navigation',2,'hit:'+target.id+':'+slot);
  }else if(arg.order==='guard'){b.guarded.push(id);b.heat[id]=Math.max(0,heat-30);combatLog(s,`${actorName(s,v)} guards and cools${v.shipID==='gannet'&&v.hull>=35?'; convoy screen reduces damage to companions by 10%':''}.`);}
  else if(arg.order==='jam'){check(v.shipID==='nightjar'&&v.hull>=35,'An operational Nightjar is required.');check(!b.jammerID,'Interference cannot stack.');check(heat+30<=100,'Guard to cool first.');b.jammerID=id;b.heat[id]=heat+30;combatLog(s,`${actorName(s,v)} jams enemy targeting by 10 percentage points this round.`);}
  else if(arg.order==='screen'){check(v.shipID==='merlin'&&v.hull>=35,'An operational Merlin is required.');check(!b.escapeScreenID,'Escape screens cannot stack.');check(heat+20<=100,'Guard to cool first.');b.escapeScreenID=id;b.heat[id]=heat+20;combatLog(s,`${actorName(s,v)} screens fleet withdrawal: +10 percentage points this round.`);if(v===s){spendFleetFuel(s,formationFuel(s,.15));if(rng(s)<escapeChance(s)){finishBattle(s,'escaped');return;}combatLog(s,'The screened withdrawal was blocked; the flagship action and propellant are spent.');}}
  else if(arg.order==='approach'||arg.order==='burn'){check(!readiness(s,v).movementReason,readiness(s,v).movementReason);check(arg.order==='approach'?b.range>.5:b.range<20,'The formation is already at that range limit.');spendFleetFuel(s,formationFuel(s,.05));b.maneuverRound=b.round;if(arg.order==='approach')b.range=Math.max(.5,b.range-2);else{b.evaded.push(...actors(s).map(v=>actorID(s,v)));b.range=Math.min(20,b.range+2);}b.heat[id]=Math.max(0,heat-5);combatLog(s,`${actorName(s,v)} orders the round’s formation maneuver; separation ${b.range.toFixed(1)} km.`);}
  else if(arg.order==='repair'){const units=host.repairUnits?host.repairUnits(v):1;check(v.spares>=units&&v.hull<100,units+' spares and hull damage are required.');const repair=Math.min(100-v.hull,18+level(s,'engineering')+(host.captainPerk?.(s,'fieldRepair')||0));v.spares-=units;v.hull+=repair;b.units[id].hp=Math.min(profile(v).hullPoints,b.units[id].hp+profile(v).hullPoints*repair/100);b.heat[id]=Math.max(0,heat-10);if(b.units[id].lastHit>0)actionXP(s,'engineering',4,'repair:'+id);combatLog(s,`${actorName(s,v)} repairs ${repair} integrity using ${units} spares.`);}
  else if(arg.order==='vent'){check(v.shipID==='osprey'&&v.hull>=35&&v.duty==='thermal'&&heat>0&&!p.vented.includes(id),'A fitted Osprey thermal specialization may vent once per engagement.');p.vented.push(id);b.heat[id]=Math.max(0,heat-40);b.units[id].lastHit=b.round;combatLog(s,actorName(s,v)+' vents 40 heat; shield recharge and guard protection are unavailable this turn.');}
  else if(arg.order==='brace'){check(v.shipID==='gannet'&&v.duty==='interception'&&profile(v).weapons[0].type==='defensive'&&v.hull>=35&&heat<=80&&!b.bracedTarget,'A certified Gannet may protect one companion per round.');const companion=actors(s).find(x=>actorID(s,x)===arg.target&&x!==v);check(companion,'Choose another travelling hull.');b.bracedTarget=arg.target;b.bracedBy=id;b.heat[id]=heat+20;combatLog(s,actorName(s,v)+' spends its firing opportunity intercepting missiles for '+actorName(s,companion)+'.');}
  else if(arg.order==='identify'){check((['merlin','gyrfalcon','nightjar'].includes(v.shipID)||(v.upgrades.sensors||0)>0)&&v.hull>=35&&heat<=80,'An operational reconnaissance ship or fitted sensors and 20 heat capacity are required.');const target=b.enemies.find(x=>x.id===arg.target&&x.hull>0);check(target,'Choose a surviving hostile.');check((p.scanned[target.id]||0)<b.round,'This identification is still current.');spendFleetFuel(s,burnFor(v,.05));b.heat[id]=heat+20;p.scanned[target.id]=b.round+2;actionXP(s,'navigation',2,'identify:'+target.id);combatLog(s,'Identified '+target.name+'; tracking remains current through round '+(b.round+2)+'.');}
  else if(arg.order==='disable'){check(v.shipID==='gyrfalcon'&&v.hull>=35,'An operational Gyrfalcon is required.');const target=b.enemies.find(x=>x.id===arg.target&&x.hull>0),u=target&&b.units[target.id];check(target&&target.hull<40&&u.shield<profile(target).shield*.2+.001&&(p.scanned[target.id]||0)>=b.round&&!p.disabled[target.id],'Identify a hostile below 40% hull and 20% shields; only one subsystem may be disabled.');const w=readiness(s,v).weapons.find(w=>w.slot==='weapons');check(!w.reason,w.reason);check(['drive','weapons'].includes(arg.subsystem),'Choose drive or kinetic bank.');const hit=fire(s,v,id,target,target.id,{...w,bank:w.bank*.2},true,.15);if(hit){p.disabled[target.id]={slot:arg.subsystem,round:b.round};actionXP(s,'engineering',2,'disable:'+target.id);combatLog(s,target.name+': '+arg.subsystem+' subsystem disabled.');}else combatLog(s,'The subsystem shot did not disable its target.');}
  else if(arg.order==='capture'){const target=b.enemies.find(x=>x.id===arg.target&&x.hull>0),u=target&&b.units[target.id];check(v===s&&target&&target.hull<25&&u.shield<=profile(target).shield*.1+.001&&(p.scanned[target.id]||0)>=b.round,'Flagship may demand surrender from an identified hostile below 25% hull and 10% shields.');if(rng(s)<.75){target.hull=0;u.hp=0;u.shield=0;p.captures.push(target.id);combatLog(s,target.name+' surrendered. Crew secured for patrol handover; no ship is added to your fleet.');}else combatLog(s,target.name+' rejected the surrender demand.');}
  else throw Error('Choose a tactical order.');
  b.acted.push(id);if(b.liveResolving)return;if(b.enemies.every(e=>e.hull===0)){finishBattle(s,'victory');return;}if(actors(s).every(a=>b.acted.includes(actorID(s,a))))enemyTurn(s);
 }
 // Live command keeps the existing bank, support, resource and settlement models.
 // Commands are durable; wall-clock animation and the running flag are never saved.
 const liveStrategies=['balanced','focus','defensive','conserve'],liveRoles=['engage','guard','support','reserve'],liveWeapons=['auto','laser','weapons','ordnance'],liveFormations=['line','screen','spread'];
 const priorities=['fleet','weakest','strongest','leader'];
 const defaultPlan=()=>({role:'engage',weapon:'auto',range:0,target:'',priority:'fleet',fallback:'best',ammoReserve:0,repairBelow:0,coolAt:75});
 const defaultFleet=()=>({strategy:'balanced',formation:'screen',range:6});
 function doctrine(s){return s.battleDoctrine||{edition:1,fleet:defaultFleet(),ships:{}};}
 function recommended(s,v){const p=defaultPlan(),fits=profile(v).weapons,combat=['osprey','merlin','gannet','gyrfalcon','nightjar'].includes(v.shipID);if(!combat){p.fallback=fits.some(w=>w.slot==='laser'&&w.count)?'energy':'best';p.ammoReserve=fits.some(w=>w.slot!=='laser'&&w.count)?25:0;p.repairBelow=(v.upgrades.armor||0)>=2||(v.upgrades.shield||0)>=2?35:60;p.coolAt=55;}if(v.shipID==='merlin')p.priority='weakest';if(v.shipID==='gyrfalcon')p.priority='strongest';if(v.shipID==='nightjar'){p.priority='leader';if(v!==s&&actors(s).length>1)p.role='support';}if(v.shipID==='osprey'&&v.duty==='thermal')p.coolAt=90;if(v.shipID==='gannet')p.repairBelow=35;return p;}
 function savedPlan(s,id){const stored=doctrine(s).ships[id],v=owned(s,id);return {...(stored?defaultPlan():recommended(s,v)),...stored,target:''};}
 function profileInfo(s,id){const v=owned(s,id);check(v,'Choose a ship you own.');const hull=host.hullInfo?.(v.shipID)||{},p=profile(v),repairUnits=host.repairUnits?host.repairUnits(v):1,abilities=[{key:'repair',name:'Field repair',detail:repairUnits+' spares per action'}];
  if(v.shipID==='nightjar')abilities.push({key:'jam',name:'Targeting interference',detail:'Support repairs first, then jams while operational'});
  if(v.shipID==='merlin')abilities.push({key:'screen',name:'Withdrawal screen',detail:'Queue before ordering fleet withdrawal'});
  if(v.shipID==='gannet')abilities.push({key:'convoy',name:'Convoy screen',detail:'Guard reduces incoming damage to companions'});
  if(v.shipID==='gannet'&&v.duty==='interception'&&p.weapons[0].type==='defensive')abilities.push({key:'brace',name:'Certified interception',detail:'Protect one travelling companion from ordnance'});
  if(v.shipID==='osprey'&&v.duty==='thermal')abilities.push({key:'vent',name:'Emergency vent',detail:'Once per engagement; replaces firing'});
  if(['merlin','gyrfalcon','nightjar'].includes(v.shipID)||(v.upgrades.sensors||0)>0)abilities.push({key:'identify',name:'Target identification',detail:'Uses an action, heat and maneuver propellant'});
  if(v.shipID==='gyrfalcon'&&p.weapons.some(w=>w.slot==='weapons'&&w.count))abilities.push({key:'disable',name:'Subsystem attack',detail:'Identify and weaken the target before disabling it'});
  const plan=recommended(s,v);delete plan.target;return {shipID:v.shipID,className:hull.name||v.shipID,classRole:hull.role||'',armor:p.armor,shield:p.shield,repairUnits,spares:v.spares,sensors:v.upgrades.sensors||0,hasAmmunitionBanks:p.weapons.some(w=>w.slot!=='laser'&&w.count),weapons:p.weapons.filter(w=>w.count).map(w=>({...w,stock:w.slot==='laser'?null:w.slot==='weapons'?v.ammo:v.ordnanceAmmo||0})),roles:[['engage','Engage'],['guard',v.shipID==='gannet'?'Convoy guard':'Guard & cool'],['support',v.shipID==='nightjar'?'Repair / electronic warfare':'Self repair'],['reserve','Hold in reserve']],abilities,recommended:plan,customized:!!doctrine(s).ships[id]};}

 const profileKeys=['role','weapon','range','priority','fallback','ammoReserve','repairBelow','coolAt'];
 function validPlan(p,partial=false){return p&&Object.keys(p).every(k=>profileKeys.includes(k))&&(partial||['role','weapon','range','priority'].every(k=>Object.hasOwn(p,k)))&&liveRoles.includes(p.role)&&liveWeapons.includes(p.weapon)&&[0,2,6,10,16].includes(p.range)&&priorities.includes(p.priority)&&(!Object.hasOwn(p,'fallback')||['best','energy','hold'].includes(p.fallback))&&(!Object.hasOwn(p,'ammoReserve')||[0,25,50].includes(p.ammoReserve))&&(!Object.hasOwn(p,'repairBelow')||[0,35,60].includes(p.repairBelow))&&(!Object.hasOwn(p,'coolAt')||[55,75,90].includes(p.coolAt));}
 function validateDoctrine(s){const d=s.battleDoctrine;if(d===undefined)return;const ids=[s.flagshipID,...s.fleet.map(v=>v.id)];check(d&&d.edition===1&&Object.keys(d).every(k=>['edition','fleet','ships'].includes(k))&&d.fleet&&Object.keys(d.fleet).length===3&&liveStrategies.includes(d.fleet.strategy)&&liveFormations.includes(d.fleet.formation)&&[2,6,10,16].includes(d.fleet.range)&&d.ships&&typeof d.ships==='object'&&!Array.isArray(d.ships)&&Object.keys(d.ships).length<=32&&Object.keys(d.ships).every(id=>ids.includes(id)),'Invalid saved battle profiles.');for(const p of Object.values(d.ships))check(validPlan(p),'Invalid remembered ship orders.');}
 function remember(s,id,p){s.battleDoctrine??={edition:1,fleet:defaultFleet(),ships:{}};const full={...defaultPlan(),...p};s.battleDoctrine.ships[id]=Object.fromEntries(profileKeys.map(k=>[k,full[k]]));}
 function saveProfile(s,arg){check(!s.battle&&!s.incident,'Set standing orders before the encounter, or change live orders in battle.');const v=owned(s,arg.ship);check(v&&v.hull>0,'Choose an operational ship you own.');const p={...savedPlan(s,arg.ship),...arg.plan};delete p.target;if(arg.plan?.weapon!==undefined)check(arg.plan.weapon==='auto'||profile(v).weapons.some(w=>w.slot===arg.plan.weapon&&w.count),'That weapon bank is not fitted to this ship.');check(arg.plan&&Object.keys(arg.plan).every(k=>profileKeys.includes(k))&&validPlan(p),'Choose valid standing orders.');remember(s,arg.ship,p);host.recordCommand?.(s,'Saved battle profile for '+actorName(s,v)+': '+Object.entries(s.battleDoctrine.ships[arg.ship]).map(([k,v])=>k+' '+v).join(', ')+'.');}
 function targetFor(s,v,p){const b=s.battle,l=b.live,living=b.enemies.filter(e=>e.hull>0),selected=living.find(e=>e.id===p.target);if(selected)return selected;if(p.priority==='strongest')return living.slice().sort((a,c)=>profile(c).hullPoints*c.hull-profile(a).hullPoints*a.hull||a.id.localeCompare(c.id))[0];if(p.priority==='leader')return living.slice().sort((a,c)=>a.id.localeCompare(c.id))[0];if(p.priority==='weakest'||l?.fleet.strategy==='focus')return living.slice().sort((a,c)=>a.hull-c.hull||a.id.localeCompare(c.id))[0];return living[actors(s).indexOf(v)%living.length];}

 function liveView(s){const b=s.battle;if(!b||b.rulesVersion!==2)return null;const l=b.live;return {enabled:!!l,canEnable:!l&&!b.acted.length,step:l?.step||0,revision:l?.revision||0,fleet:l?.fleet||doctrine(s).fleet,ships:actors(s).map(v=>({id:actorID(s,v),name:actorName(s,v),hull:v.hull,plan:{...defaultPlan(),...(l?.ships[actorID(s,v)]||savedPlan(s,actorID(s,v)))},range:l?.ranges[actorID(s,v)]??b.range,command:l?.commands[actorID(s,v)]||null})),events:l?.events||[]};}
 function validLiveToken(s,arg,enable=false){const b=s.battle;check(b?.rulesVersion===2&&arg.battle===b.id,'This engagement is no longer current.');check(Number.isSafeInteger(arg.step)&&arg.step===(b.live?.step||0)&&Number.isSafeInteger(arg.revision)&&arg.revision===(b.live?.revision||0),'The battle has changed. Review the current command state.');if(!enable)check(b.live,'Set your battle plan first.');return b;}
 function configureLive(s,arg){
  const b=validLiveToken(s,arg,true);check(b.live||!b.acted.length,'Finish this round before switching to live command.');
  if(!b.live)b.live={edition:1,step:0,revision:0,fleet:{...doctrine(s).fleet},engaged:false,ships:{},ranges:{},commands:{},events:[]};
  const l=b.live;if(arg.realtime===true&&l.edition!==2){check(l.step===0,'Continuous firing starts before the first exchange.');l.edition=2;for(const [index,v] of [...actors(s),...b.enemies,...(b.protected?[b.protected]:[])].entries()){const u=b.units[unitID(s,v)],phase=index%4*.25;u.cooldowns={laser:phase,weapons:phase+.5,ordnance:phase+1};u.actionAt=0;}}for(const v of actors(s)){const id=actorID(s,v);l.ships[id]??=savedPlan(s,id);l.ranges[id]??=b.range;}
  if(arg.fleet){const f=arg.fleet;check(Object.keys(f).every(k=>['strategy','formation','range'].includes(k)),'Unknown fleet instruction.');if(f.strategy!==undefined){check(liveStrategies.includes(f.strategy),'Choose a fleet strategy.');l.fleet.strategy=f.strategy;}if(f.formation!==undefined){check(liveFormations.includes(f.formation),'Choose a formation.');l.fleet.formation=f.formation;}if(f.range!==undefined){check([2,6,10,16].includes(f.range),'Choose a preferred range.');l.fleet.range=f.range;}}
  if(arg.ship){const v=actors(s).find(v=>actorID(s,v)===arg.ship);check(v,'Only ships in this encounter can receive orders.');const p=arg.plan||{};if(p.weapon!==undefined)check(p.weapon==='auto'||profile(v).weapons.some(w=>w.slot===p.weapon&&w.count),'That weapon bank is not fitted to this ship.');check(Object.keys(p).every(k=>[...profileKeys,'target'].includes(k)),'Unknown ship instruction.');const complete={...defaultPlan(),...l.ships[arg.ship],...p};delete complete.target;check(validPlan(complete),'Choose valid ship instructions.');if(p.target!==undefined)check(p.target===''||b.enemies.some(e=>e.id===p.target&&e.hull>0),'Select a surviving hostile.');Object.assign(l.ships[arg.ship],p);if(Object.keys(p).some(k=>k!=='target'))remember(s,arg.ship,l.ships[arg.ship]);
   if(arg.command!==undefined){if(arg.command===null)delete l.commands[arg.ship];else{check(['guard','repair','jam','vent','identify','disable','capture','brace','screen','retreat','surrender'].includes(arg.command.order),'Choose an available command.');check(Object.keys(arg.command).every(k=>['order','target','subsystem'].includes(k)),'Unknown command field.');const command={...arg.command,actor:arg.ship};const preview=JSON.parse(JSON.stringify(s));preview.battle.liveResolving=true;preview.battle.range=l.ranges[arg.ship];order(preview,command);l.commands[arg.ship]=command;}}
  }
  if(arg.fleet){s.battleDoctrine??={edition:1,fleet:defaultFleet(),ships:{}};s.battleDoctrine.fleet={...l.fleet};}if(arg.engage!==undefined){check(arg.engage===true,'An engaged battle cannot be paused.');l.engaged=true;s.battleDoctrine??={edition:1,fleet:defaultFleet(),ships:{}};s.battleDoctrine.fleet={...l.fleet};for(const v of actors(s)){const id=actorID(s,v);remember(s,id,l.ships[id]);}}
  l.revision++;const planText=arg.command?arg.command.order.replaceAll('-',' '):arg.command===null?'queued action cancelled':Object.entries(arg.plan||{}).map(([k,v])=>k==='range'?'preferred range '+(v?v+' km':'follow fleet'):k==='target'?'target '+(b.enemies.find(e=>e.id===v)?.name||'follow fleet'):k+' '+v).join('; ');const message='Battle orders: '+(arg.ship?actorName(s,owned(s,arg.ship))+' · '+planText:l.fleet.strategy+' strategy · '+l.fleet.formation+' formation · preferred '+l.fleet.range+' km')+'.';combatLog(s,message);host.recordCommand?.(s,message);
 }
 function tickLive(s,arg){
  const b=validLiveToken(s,arg),l=b.live,rt=l.edition===2;check(!b.acted.length,'Live exchanges begin at a fresh round.');const startActors=actors(s).slice(),living=b.enemies.filter(e=>e.hull>0),received={},exchange={hits:[],events:[]},volleys=[];b.liveResolving=true;l.events=[];
  if(rt)for(const v of startActors){const id=actorID(s,v),u=b.units[id];if(u.supportUntil>=l.step){if(u.supportOrder==='guard')b.guarded.push(id);if(u.supportOrder==='jam')b.jammerID=id;if(u.supportOrder==='screen')b.escapeScreenID=id;if(u.supportOrder==='brace'){b.bracedBy=id;b.bracedTarget=u.supportTarget;}if(u.supportOrder==='evade')b.evaded.push(id);}}
  if(rt)for(const [id,u] of Object.entries(b.units)){if(u.damageBucket!==Math.floor(l.step/6)){u.damageBucket=Math.floor(l.step/6);u.damageUsed=0;}received[id]=u.damageUsed||0;}
  const ids=new Set(startActors.map(v=>actorID(s,v)));
  const usable=(v,id,friendly,range)=>{const heat=friendly?(b.heat[id]||0):v.heat,u=b.units[id];return profile(v).weapons.filter(w=>w.count&&(rt?(u.cooldowns?.[w.slot]||0)<=l.step*.5:u.ready[w.slot]<=b.round)&&range<=w.range&&heat+heatCost(v,w,friendly?(host.captainPerk?.(s,'laserCooling')||0):0)<=100&&(w.slot==='laser'||(w.slot==='weapons'?v.ammo:v.ordnanceAmmo)>=w.count*w.ammo)&&!(friendly?false:b.progress?.disabled?.[id]?.slot===w.slot));};
  const score=(w,target)=>w.bank*(b.units[unitID(s,target)]?.shield>0?w.shield:w.armor)/(1+Math.max(0,w.reload-1)*.2);
  const support=(v,command)=>{const id=actorID(s,v),savedRange=b.range;b.range=l.ranges[id]??savedRange;order(s,{...command,actor:id});if(s.battle){b.range=savedRange;if(rt){const u=b.units[id];u.actionAt=l.step+6;u.supportOrder=command.order;u.supportUntil=l.step+5;if(command.target)u.supportTarget=command.target;}}};
  // Queued one-shot commands take the ship's next opportunity. Check on a copy
  // immediately before applying, so an obsolete command cannot partially spend resources.
  for(const v of startActors.slice().sort((a,c)=>(l.commands[actorID(s,c)]?.order==='screen')-(l.commands[actorID(s,a)]?.order==='screen'))){const id=actorID(s,v),c=l.commands[id];if(!c||rt&&(b.units[id].actionAt||0)>l.step&&!['retreat','surrender'].includes(c.order))continue;delete l.commands[id];const preview=JSON.parse(JSON.stringify(s));preview.battle.range=l.ranges[id];try{order(preview,c);}catch{combatLog(s,actorName(s,v)+': command unavailable; holding for this exchange.');support(v,{order:'guard'});continue;}support(v,c);if(!s.battle)return;}
  if(b.enemies.every(e=>e.hull===0)){delete b.liveResolving;finishBattle(s,'victory');return;}
  // Follow-fleet range is a preferred outer distance. Do not strand a ship
  // outside every eligible bank's reach. Ignore temporary heat/reload limits
  // here, so cooling and reloads cannot make the ship shuttle back and forth.
  const reachable=(v,p)=>profile(v).weapons.filter(w=>w.count&&(w.slot==='laser'||(w.slot==='weapons'?v.ammo:v.ordnanceAmmo)-w.count*w.ammo>=Math.ceil(w.magazine*p.ammoReserve/100))&&(p.weapon==='auto'||w.slot===p.weapon||p.fallback==='best'||p.fallback==='energy'&&w.slot==='laser'));
  for(const v of startActors){const id=actorID(s,v);if(b.acted.includes(id)||rt&&(b.units[id].actionAt||0)>l.step)continue;const p={...defaultPlan(),...l.ships[id]},heat=b.heat[id]||0,target=targetFor(s,v,p),reach=reachable(v,p),desired=p.range||(reach.length?Math.min(l.fleet.range,Math.max(...reach.map(w=>w.range))):l.fleet.range),range=l.ranges[id]??b.range;
   if(p.role==='guard'||p.role==='reserve'||l.fleet.strategy==='defensive'&&v.hull<50||heat>=p.coolAt){support(v,{order:'guard'});continue;}
   if(p.repairBelow&&v.hull<p.repairBelow&&v.spares>=(host.repairUnits?host.repairUnits(v):1)){support(v,{order:'repair'});continue;}
   if(p.role==='support'){if(v.hull<80&&v.spares>=(host.repairUnits?host.repairUnits(v):1))support(v,{order:'repair'});else if(v.shipID==='nightjar'&&v.hull>=35&&heat<=70&&!b.jammerID)support(v,{order:'jam'});else support(v,{order:'guard'});continue;}
   if(Math.abs(desired-range)>1||range>desired&&reach.length&&range>Math.max(...reach.map(w=>w.range))){const change=clamp(desired-range,-2,2),cost=burnFor(v,.05*Math.abs(change)/2),fuel=actors(s).reduce((n,v)=>n+v.fuel,0);if(fuel+1e-8>=cost){spendFleetFuel(s,cost);l.ranges[id]=clamp(range+change,.5,20);if(change>0)b.evaded.push(id);b.heat[id]=Math.max(0,heat-5);b.acted.push(id);if(rt){b.units[id].actionAt=l.step+6;if(change>0){b.units[id].supportOrder='evade';b.units[id].supportUntil=l.step+5;}}combatLog(s,actorName(s,v)+' maneuvers to '+l.ranges[id].toFixed(1)+' km.');continue;}}
   const banks=usable(v,id,true,l.ranges[id]).filter(w=>w.slot==='laser'||(w.slot==='weapons'?v.ammo:v.ordnanceAmmo)-w.count*w.ammo>=Math.ceil(w.magazine*p.ammoReserve/100)),preferred=banks.find(w=>w.slot===p.weapon),laser=banks.find(w=>w.slot==='laser');
   const best=()=>l.fleet.strategy==='conserve'&&laser?laser:banks.slice().sort((a,c)=>score(c,target)-score(a,target))[0];
   const w=p.weapon==='auto'?best():preferred||(p.fallback==='hold'?null:p.fallback==='energy'?laser:best());
   if(p.weapon!=='auto'&&!preferred){const bank=profile(v).weapons.find(w=>w.slot===p.weapon),ammo=p.weapon==='weapons'?v.ammo:v.ordnanceAmmo,reason=!bank?.count?'not fitted':bank.slot!=='laser'&&ammo<bank.count*bank.ammo?'insufficient ammunition':bank.slot!=='laser'&&ammo-bank.count*bank.ammo<Math.ceil(bank.magazine*p.ammoReserve/100)?'ammunition reserve':b.units[id].ready[bank.slot]>b.round?'reloading':l.ranges[id]>bank.range?'out of range':'heat limit';combatLog(s,actorName(s,v)+': preferred bank unavailable — '+reason+'; '+(w?'using '+w.name:'guarding and cooling')+'.');}
   if(w)volleys.push({v,id,target,targetID:target.id,w,friendly:true});else if(!rt||p.fallback==='hold')support(v,{order:'guard'});
  }
  // Hostiles choose from the same pre-impact state; announced missile locks
  // give a whole exchange for evasion, jamming, guard or withdrawal.
  for(const e of living.filter(e=>e.hull>0)){if(rt&&(b.units[e.id].actionAt||0)>l.step)continue;const candidates=[...startActors,...(b.protected?.hull>0?[b.protected]:[])],lock=e.ordnanceLock,locked=candidates.find(v=>unitID(s,v)===lock?.target),escorts=startActors.filter(v=>v!==s),cargo=startActors.slice().sort((a,c)=>Object.values(c.cargo).reduce((n,q)=>n+q,0)-Object.values(a.cargo).reduce((n,q)=>n+q,0))[0],target=locked||(b.protected?.hull>0&&rng(s)<.35?b.protected:b.faction?.intent==='seize cargo'&&rng(s)<.5?cargo:e.intent==='flank'&&escorts.length?escorts[Math.floor(rng(s)*escorts.length)]:s),id=unitID(s,target),range=l.ranges[id]??b.range;
   if(lock&&!locked)delete e.ordnanceLock;
   const loaded=profile(e).weapons.filter(w=>w.count&&b.progress?.disabled?.[e.id]?.slot!==w.slot&&(w.slot==='laser'||(w.slot==='weapons'?e.ammo:e.ordnanceAmmo)>=w.count*w.ammo));
   if(rt&&b.encounterPlan?.kind==='ambient'&&living.length===1&&e.hull<20&&range>=10&&!b.bountyID&&!b.encounterPlan?.band.endsWith('-blockade')&&!b.blockadeID&&!b.stationBlockade&&b.progress?.disabled?.[e.id]?.slot!=='drive'){
    combatLog(s,e.name+' abandons the attack and breaks contact.');b.enemyWithdrew=true;delete b.liveResolving;finishBattle(s,'escaped');return;
   }
   let banks=usable(e,e.id,false,range),w=banks.sort((a,c)=>score(c,target)-score(a,target))[0];
   if(e.heat>=75||!w){
    // A loaded bank in reach may simply be reloading. Empty/disabled launchers
    // cannot hold the ship outside the reach of its remaining weapons.
    if(rt&&!w&&e.heat<75&&loaded.some(w=>range<=w.range))continue;
    if(rt)b.units[e.id].actionAt=l.step+6;e.heat=Math.max(0,e.heat-30);
    if(b.progress?.disabled?.[e.id]?.slot!=='drive'&&b.enemyManeuverRound!==b.round&&loaded.length&&loaded.every(w=>w.range<range)){
     const reach=Math.max(...loaded.map(w=>w.range));for(const key of ids)l.ranges[key]=Math.min(l.ranges[key],Math.max(reach,l.ranges[key]-1));b.enemyManeuverRound=b.round;
    }
    combatLog(s,e.name+' cools and adjusts its approach.');continue;
   }
   if(lock&&lock.round<=b.round)w=banks.find(w=>w.slot==='ordnance')||w;
   if(w.slot==='ordnance'){const disrupted=b.evaded.includes(id)||canSupport(s,b.jammerID);if(disrupted){delete e.ordnanceLock;combatLog(s,e.name+': missile lock disrupted.');}else if(!e.ordnanceLock){e.ordnanceLock={target:id,round:b.round+1};combatLog(s,e.name+' is locking '+actorName(s,target)+' for a missile / torpedo salvo next exchange.');}if(disrupted||e.ordnanceLock.round>b.round){w=banks.filter(w=>w.slot!=='ordnance')[0];if(!w)continue;}else delete e.ordnanceLock;}
   volleys.push({v:e,id:e.id,target,targetID:id,w,friendly:false});
  }
  // All banks launch before any impact is applied, including mutual destruction.
  for(const q of volleys){fire(s,q.v,q.id,q.target,q.targetID,q.w,q.friendly,0,received,exchange);if(q.friendly)b.acted.push(q.id);}
  for(const q of exchange.hits){const hp=profile(q.target).hullPoints,limit=q.friendly?Infinity:Math.max(0,Math.min(q.limit,q.budget-(received[q.targetID]||0))),d=damage(s,q.target,q.targetID,q.w,q.raw,q.guard,limit);if(!q.friendly){received[q.targetID]=(received[q.targetID]||0)+d.hullDamage;if(rt)b.units[q.targetID].damageUsed=received[q.targetID];}exchange.events.push({from:q.id,to:q.targetID,weapon:q.w.slot,hit:true,shield:d.shieldDamage,hull:d.hullDamage});combatLog(s,q.who+': '+q.w.name+' hit '+q.whom+'; '+d.shieldDamage.toFixed(1)+' shield / '+d.hullDamage.toFixed(1)+' hull damage'+(q.target.hull===0?' — destroyed':'')+'.');if(q.friendly&&(d.shieldDamage+d.hullDamage)>0)actionXP(s,'navigation',2,'hit:'+q.targetID+':'+q.w.slot);}
  if(rt){const separation=Math.min(...Object.values(l.ranges));if(volleys.length||separation<(l.quietRange??b.range)-.001){l.quietSteps=0;l.quietRange=separation;}else{l.quietSteps=(l.quietSteps||0)+1;l.quietRange??=separation;}}
  l.events=exchange.events;l.step++;delete b.liveResolving;
  // Remove escorts first so command transfer never promotes a destroyed hull.
  const lost=startActors.filter(v=>v.hull===0).sort((a,c)=>(a===s)-(c===s));for(const v of lost){const id=actorID(s,v);delete b.units[id];for(const e of b.enemies)if(e.ordnanceLock?.target===id)delete e.ordnanceLock;destroyShip(s,v);if(!s.battle)return;}
  const survivors=new Set(actors(s).map(v=>actorID(s,v)));for(const key of Object.keys(l.ships))if(!survivors.has(key)){delete l.ships[key];delete l.ranges[key];delete l.commands[key];}
  if(b.enemies.every(e=>e.hull===0)){finishBattle(s,'victory');return;}
  if(b.protected?.hull===0){finishBattle(s,'defeat');return;}
  if(rt&&l.quietSteps>=32){combatLog(s,'No firing solution; the formations separate without securing the objective.');finishBattle(s,'inconclusive');return;}
  if(!rt||l.step%6===0){recharge(s);if(b.round>=(rt?liveTiming.maximumRounds:12)){finishBattle(s,'inconclusive');return;}b.round++;}b.acted=[];b.guarded=[];b.evaded=[];b.jammerID=null;b.escapeScreenID=null;b.bracedTarget=null;b.bracedBy=null;
  for(const id of Object.keys(b.heat))b.heat[id]=Math.max(0,b.heat[id]-(!rt||l.step%6===0?15:0));for(const e of b.enemies){e.heat=Math.max(0,e.heat-(!rt||l.step%6===0?10:0));if(e.hull===0)delete e.ordnanceLock;if(!survivors.has(e.ordnanceLock?.target)&&e.ordnanceLock?.target!==b.protected?.id)delete e.ordnanceLock;}
  b.range=l.ranges[s.flagshipID]??b.range;
 }
 function validateLive(s){const b=s.battle,l=b.live,integer=(n,a,c)=>Number.isSafeInteger(n)&&n>=a&&n<=c,finite=(n,a,c)=>typeof n==='number'&&Number.isFinite(n)&&n>=a&&n<=c,ids=actors(s).map(v=>actorID(s,v));check(l&&[1,2].includes(l.edition)&&(l.engaged===undefined||typeof l.engaged==='boolean')&&integer(l.step,0,l.edition===2?liveTiming.maximumSteps:12)&&integer(l.revision,1,100000)&&(l.quietSteps===undefined||integer(l.quietSteps,0,32)&&l.quietSteps<=l.step)&&(l.quietRange===undefined||finite(l.quietRange,.5,20))&&liveStrategies.includes(l.fleet?.strategy)&&liveFormations.includes(l.fleet?.formation)&&[2,6,10,16].includes(l.fleet.range)&&!b.liveResolving,'Invalid live command state.');for(const key of ['ships','ranges','commands'])check(l[key]&&typeof l[key]==='object'&&!Array.isArray(l[key])&&Object.keys(l[key]).every(id=>ids.includes(id)),'Invalid live fleet registry.');for(const id of ids){const p=l.ships[id],remembered={...defaultPlan(),...p};delete remembered.target;check(p&&validPlan(remembered)&&typeof p.target==='string'&&(p.target===''||b.enemies.some(e=>e.id===p.target))&&finite(l.ranges[id],.5,20),'Invalid ship battle plan.');const c=l.commands[id];if(c)check(c.actor===id&&['guard','repair','jam','vent','identify','disable','capture','brace','screen','retreat','surrender'].includes(c.order)&&Object.keys(c).every(k=>['order','actor','target','subsystem'].includes(k))&&(c.target===undefined||typeof c.target==='string'&&c.target.length<100)&&(c.subsystem===undefined||['drive','weapons'].includes(c.subsystem)),'Invalid queued battle command.');}check(Array.isArray(l.events)&&l.events.length<=35&&l.events.every(e=>typeof e.from==='string'&&typeof e.to==='string'&&e.from.length<100&&e.to.length<100&&['laser','weapons','ordnance'].includes(e.weapon)&&typeof e.hit==='boolean'&&(e.intercepted===undefined||typeof e.intercepted==='boolean')&&(e.shield===undefined||finite(e.shield,0,1000000))&&(e.hull===undefined||finite(e.hull,0,1000000))),'Invalid combat exchange events.');}

 function validate(s){
  if(s.battle.live!==undefined)validateLive(s);

  if(s.battle.encounterPlan)validateEncounterPlan(s.battle.encounterPlan);
  const b=s.battle,finite=(n,a,c)=>typeof n==='number'&&Number.isFinite(n)&&n>=a&&n<=c,int=(n,a,c)=>Number.isSafeInteger(n)&&n>=a&&n<=c;
  check(s.incident?.kind==='battle'&&b.rulesVersion===2&&['raid','defense'].includes(b.origin)&&typeof b.id==='string'&&b.id.length<=120&&typeof b.title==='string'&&b.title.length<=150&&b.destination===s.incident.destination&&int(b.round,1,b.live?.edition===2?liveTiming.maximumRounds:12)&&finite(b.range,.5,20)&&int(b.reward,0,1000000),'Invalid tactical engagement.');
  check(Array.isArray(b.enemies)&&b.enemies.length>=1&&b.enemies.length<=3&&b.enemies.some(e=>e.hull>0),'Invalid hostile formation.');
  if(b.protected)check(typeof b.protected.mission==='string'&&b.protected.id==='protected-merchant'&&typeof b.protected.name==='string'&&int(b.protected.hull,0,100)&&b.protected.shipID==='kestrel','Invalid protected merchant.');
  const all=[...actors(s),...b.enemies,...(b.protected?[b.protected]:[])],ids=all.map(v=>unitID(s,v));check(new Set(ids).size===ids.length,'Duplicate combat unit.');
  for(const e of b.enemies){check(typeof e.id==='string'&&/^hostile-[0-2]$/.test(e.id)&&typeof e.name==='string'&&e.name.length<=80&&int(e.hull,0,100)&&e.maxHull===100&&int(e.heat,0,100)&&int(e.ammo,0,192)&&int(e.ordnanceAmmo,0,32)&&['press','flank','cool'].includes(e.intent),'Invalid hostile equipment.');const p=profile(e);check(Object.keys(e.upgrades).every(k=>rules.empty()[k]!==undefined)&&Object.values(e.upgrades).every(n=>int(n,0,3))&&p.weapons.length===3,'Invalid hostile fittings.');}
  const known=new Set(ids),friendly=new Set(actors(s).map(v=>actorID(s,v)));
  for(const e of b.enemies)if(e.ordnanceLock!==undefined)check(e.ordnanceLock&&[...actors(s),...(b.protected?.hull>0?[b.protected]:[])].some(v=>unitID(s,v)===e.ordnanceLock.target)&&int(e.ordnanceLock.round,1,b.round+1),'Invalid hostile missile lock.');
  for(const key of ['acted','guarded','evaded'])check(Array.isArray(b[key])&&new Set(b[key]).size===b[key].length&&b[key].every(id=>friendly.has(id)),'Invalid tactical action state.');
  check(s.hull>0&&actors(s).every(v=>v.hull>0)&&actors(s).some(v=>!b.acted.includes(actorID(s,v))),'No pending friendly orders.');
  check(b.heat&&Object.entries(b.heat).every(([id,n])=>friendly.has(id)&&int(n,0,100)),'Invalid friendly heat.');
  check(b.units&&Object.keys(b.units).length===all.length&&Object.keys(b.units).every(id=>known.has(id)),'Invalid tactical unit registry.');
  for(const v of all){const id=unitID(s,v),u=b.units[id],p=profile(v);if(b.live?.edition===2){check(u&&u.cooldowns&&Object.keys(u.cooldowns).length===3&&['laser','weapons','ordnance'].every(k=>finite(u.cooldowns[k],0,liveTiming.maximumSteps*.5+15))&&(u.actionAt===undefined||int(u.actionAt,0,liveTiming.maximumSteps+6))&&(u.supportUntil===undefined||int(u.supportUntil,0,liveTiming.maximumSteps+6))&&(u.supportOrder===undefined||['guard','repair','jam','vent','identify','disable','capture','brace','screen','retreat','evade'].includes(u.supportOrder))&&(u.supportTarget===undefined||typeof u.supportTarget==='string'&&u.supportTarget.length<100)&&(u.damageUsed===undefined||finite(u.damageUsed,0,p.hullPoints))&&(u.damageBucket===undefined||int(u.damageBucket,0,liveTiming.maximumRounds)),'Invalid continuous weapon clock.');}check(u&&finite(u.hp,0,p.hullPoints)&&finite(u.shield,0,p.shield)&&int(u.lastHit,-2,b.round)&&u.ready&&['laser','weapons','ordnance'].every(k=>int(u.ready[k],1,b.round+3)),'Invalid hull, shield or reload state.');check(v.hull===(u.hp<=1e-8?0:Math.ceil(u.hp/p.hullPoints*100-1e-9)),'Hull integrity and combat damage disagree.');}
  for(const key of ['jammerID','escapeScreenID'])check(b[key]===null||typeof b[key]==='string'&&friendly.has(b[key]),'Invalid support order.');
  check(Array.isArray(b.log)&&b.log.length<=40&&b.log.every(t=>typeof t==='string'&&t.length<=500),'Invalid battle log.');
  for(const key of ['maneuverRound','enemyManeuverRound'])check(b[key]===undefined||int(b[key],1,b.round),'Invalid formation maneuver record.');
  if(b.progress){const p=b.progress;check(int(p.navigation,0,10)&&int(p.engineering,0,10)&&Array.isArray(p.tags)&&p.tags.length<=100&&new Set(p.tags).size===p.tags.length&&p.tags.every(t=>typeof t==='string'&&t.length<120)&&p.scanned&&Object.entries(p.scanned).every(([id,n])=>b.enemies.some(e=>e.id===id)&&int(n,1,b.round+2))&&p.disabled&&Object.entries(p.disabled).every(([id,d])=>b.enemies.some(e=>e.id===id)&&['drive','weapons'].includes(d.slot)&&int(d.round,1,b.round))&&Array.isArray(p.vented)&&p.vented.length<=32&&new Set(p.vented).size===p.vented.length&&p.vented.every(id=>typeof id==='string')&&Array.isArray(p.captures)&&p.captures.length<=3&&new Set(p.captures).size===p.captures.length&&p.captures.every(id=>b.enemies.some(e=>e.id===id&&e.hull===0)),'Invalid tactical objective or XP receipts.');}
 }
 function assessment(s){
  const b=s.battle;if(!b)return null;const warnings=[],fleet=b.live?.fleet||doctrine(s).fleet;
  const strength=(v,id,friendly)=>{
   const p=profile(v),u=b.units[id],plan=friendly?{...defaultPlan(),...savedPlan(s,id),...b.live?.ships[id]}:null;
   const loaded=p.weapons.filter(w=>w.count&&b.progress?.disabled?.[id]?.slot!==w.slot&&(w.slot==='laser'||(w.slot==='weapons'?v.ammo:v.ordnanceAmmo)-w.count*w.ammo>=Math.ceil(w.magazine*(plan?.ammoReserve||0)/100)));
   let banks=loaded,range=plan?.range||Math.min(fleet.range,Math.max(0,...loaded.map(w=>w.range)));
   if(plan){
    banks=loaded.filter(w=>plan.weapon==='auto'||w.slot===plan.weapon||plan.fallback==='best'||plan.fallback==='energy'&&w.slot==='laser');
    const name=actorName(s,v),preferred=p.weapons.find(w=>w.slot===plan.weapon),fires=!['guard','support','reserve'].includes(plan.role)&&!(fleet.strategy==='defensive'&&v.hull<50);
    if(v.hull<=35)warnings.push({id,text:name+': hull critically damaged.'});
    if(fires&&!banks.length)warnings.push({id,text:name+': no loaded weapon allowed by these orders.'});
    if(fires&&banks.length&&plan.range&&banks.every(w=>w.range<plan.range))warnings.push({id,text:name+': preferred range is beyond every permitted weapon.'});
    if(fires&&plan.weapon!=='auto'&&!banks.some(w=>w.slot===plan.weapon)&&preferred?.count)warnings.push({id,text:name+': preferred magazine is empty or reserved; '+(banks.length?'fallback weapons only.':'holding fire.')});
    if((plan.repairBelow||plan.role==='support')&&v.spares<(host.repairUnits?host.repairUnits(v):1))warnings.push({id,text:name+': insufficient spares for automatic repairs.'});
    if(!fires)banks=[];else if(plan.range)banks=banks.filter(w=>w.range>=range);
   }
   const accuracy=clamp((friendly?.82:.72)+(v.upgrades.sensors||0)*.05+(friendly?level(s,'navigation')*.01+(host.captainPerk?.(s,'accuracy')||0):0),.25,.95);
   let dps=banks.reduce((n,w)=>n+w.bank/weaponTiming(w).seconds*(friendly?1:w.slot==='ordnance'?.65:.8)*accuracy,0);
   const heat=banks.reduce((n,w)=>n+heatCost(v,w)/weaponTiming(w).seconds,0);dps*=Math.min(1,10/Math.max(1,heat));
   const repairs=plan&&!['guard','reserve'].includes(plan.role)&&(plan.repairBelow||plan.role==='support')?Math.min(2,Math.floor(v.spares/(host.repairUnits?host.repairUnits(v):1))):0;
   const hp=Math.max(0,(u?.hp||0)+repairs*p.hullPoints*Math.min(100-v.hull+36,36+level(s,'engineering')*2)/200);
   return {hp:hp/(1-p.armor)*(plan&&['guard','reserve'].includes(plan.role)?1/.45:1)+(u?.shield||0),dps};
  };
  const total=(vs,friendly)=>vs.map(v=>strength(v,friendly?actorID(s,v):v.id,friendly)).reduce((a,v)=>({hp:a.hp+v.hp,dps:a.dps+v.dps}),{hp:0,dps:0});
  const friendly=total(actors(s),true),hostile=total(b.enemies.filter(e=>e.hull>0),false),ratio=Math.sqrt(friendly.hp*friendly.dps)/Math.max(1,Math.sqrt(hostile.hp*hostile.dps)),label=!friendly.dps?'No firing plan':ratio<.45?'Severely outmatched':ratio<.7?'Outmatched':ratio<1.15?'Contested':'Favorable';
  return {label,ratio,warnings,detail:'Readiness estimate from standing orders, loaded weapons, hull, shields and repair supplies. Conditions can change during combat.',critical:actors(s).some(v=>v.hull<=35),locks:b.enemies.filter(e=>e.hull>0&&e.ordnanceLock).map(e=>({enemy:e.name,target:e.ordnanceLock.target,round:e.ordnanceLock.round}))};
 }

 return {encounterPlan,validateEncounterPlan,namedEligible,initialize,order,validate,validateDoctrine,saveProfile,profileInfo,profile:(s,id)=>savedPlan(s,id),targetID:(s,id)=>{const v=actors(s).find(v=>actorID(s,v)===id);return v?targetFor(s,v,{...defaultPlan(),...s.battle?.live?.ships[id]})?.id:null;},readiness,escapeChance,assessment,configureLive,tickLive,liveView};
}
const api={create,weaponTiming,liveTiming};root.SpacetraderCombat=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
