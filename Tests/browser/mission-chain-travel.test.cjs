'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),E=require('../../Browser/engine'),H=require('./mission-chains.test.cjs'),C=require('./combat-v2-balance.cjs');
function service(s){return E.dryDockOverview(s).total?E.transact(s,'service-all-ships'):s;}
function travel(s,destination){if(s.location===destination)return s;s=service(s);const problem=E.launchProblem(s,destination);assert.equal(problem,'',H.active(s)?.kind+': '+problem);s=E.transact(s,'depart',{destination});while(s.incident){if(s.battle?.stationBlockade){s=C.play(s);assert(!s.incident,'The route fixture must defeat its blockade to dock.');continue;}assert(!s.battle);s=E.transact(s,'resolve',{choice:s.incident.kind==='pirate'?'pay':s.incident.kind==='asteroid'?'belt-wait':s.spares?'spare':'isolate'});}return s;}
const rows=[];
for(const kind of Object.keys(H.cases))for(const seed of [123,456,789]){
 let s=H.accept(kind,String(seed));const cover=E.activeHull(C.ready('gyrfalcon',3,seed));Object.assign(cover,{id:'blockade-cover',name:'Route protection',escort:true,location:s.location});s.fleet.push(cover);E.validate(s);s=service(s);const j=H.active(s),id=j.id,initial=s.credits,start=s.day;let stages=0,usedSpares=0,med=0;
 while(E.missionJournal(s).active[0]?.objectives.some(o=>!o.done)){
  assert(++stages<12);let q=E.missionJournal(s).active[0].workQuote;s=travel(s,q.port);q=E.missionJournal(s).active[0].workQuote;assert(H.active(s),'expired during travel');
  if(q.task==='authenticate'||q.task==='courier-identify'){if(!q.canWork||q.task==='courier-identify')s=E.transact(s,'wait');}
  if(q.task==='ore-extract'&&!s.civilian.permits.some(p=>p.kind==='mining'&&p.port===s.location))s=E.transact(s,'op-permit',{kind:'mining'});
  if(q.task==='leader-confirm'){
   // Start the normal threat resolver using the mission's recorded region/leader.
   s=C.start(s,2);assert.equal(s.battle.faction.id,H.active(s).leader);
   const target=s.battle.enemies[0];s=E.transact(s,'battle-order',{actor:s.flagshipID,order:'identify',target:target.id});
   // A demanding fight, no fabricated objective flag; factory fleet must resolve it.
   s=C.play(s);assert.equal(s.battleHistory.at(-1).outcome,'victory');assert(H.active(s).leaderIdentified);assert.equal(H.active(s).leaderOutcome,'defeat');
   s=service(s);
  }
  q=E.missionJournal(s).active[0].workQuote;assert(q.canWork,kind+': '+q.reason);const beforeDay=s.day;s=E.transact(s,'mission-work',{id,kind:q.choices[0]});assert.equal(s.day-beforeDay,q.days,kind+' field-day quote');usedSpares+=q.units;med+=q.medicine;assert.deepEqual(E.parse(JSON.stringify(s)),s);
 }
 const reward=H.active(s).reward;s=E.transact(s,'mission-complete',{id});s=service(s);const days=Math.max(1,s.day-start),spareReplacement=usedSpares*180,medicineReplacement=med*420,capital=H.cases[kind].slice(1).reduce((n,id)=>n+E.ships.find(h=>h.id===id).price,0)+E.ships.find(h=>h.id==='gyrfalcon').price,capitalCharge=capital*.04*days/365.25,net=s.credits-initial-spareReplacement-medicineReplacement-capitalCharge;
 rows.push({kind,seed,days,ships:H.cases[kind].length,reward,netAfter4PercentCapital:Math.round(net),netPerShipDay:Math.round(net/days/H.cases[kind].length),scope:'Existing mission hulls plus a fully fitted Gyrfalcon escort for mandatory blockades; fuel/repairs/field charges and extortion paid in real transactions; consumed field stores replaced at baseline prices; 4% capital benchmark. Mining claim/survey included; no resale assumption.'});
 console.log('PASS actual travel '+kind+' seed '+seed+' · '+days+' days · net '+Math.round(net));
}
fs.writeFileSync('Build/MissionChainsReview/travel-economics.json',JSON.stringify({scenarios:rows.length,rows},null,2));console.log(rows.length+' actual travel/combat scenarios passed.');
