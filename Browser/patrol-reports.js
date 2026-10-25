'use strict';
// A read-only patrol circular. Reuses dated sightings and the existing piracy model;
// Background traffic accounts use a separate deterministic sample of that risk.
// No player RNG, time, cargo, intelligence register or encounter outcome is changed.
(function(root){
 const recentDays=120; // Same shelf life as the station patrol-intelligence register.
 const bands=[{key:'low',label:'Low',ceiling:.12},{key:'guarded',label:'Guarded',ceiling:.22},{key:'high',label:'High',ceiling:.35},{key:'severe',label:'Severe',ceiling:Infinity}];
 const level=risk=>bands.find(b=>risk<b.ceiling);
 const rank=key=>['low','guarded','high','severe','critical'].indexOf(key);
 // Stable report sampling, independent of the player's encounter RNG and screen refreshes.
 function draw(key){let h=2166136261;for(let i=0;i<key.length;i++){h^=key.charCodeAt(i);h=Math.imul(h,16777619);}h^=h>>>16;h=Math.imul(h,0x85ebca6b);h^=h>>>13;h=Math.imul(h,0xc2b2ae35);h^=h>>>16;return (h>>>0)/4294967296;}
 const watchCache=new Map();
 function securityWatch(E,s,destination,arrivalDay=s.day){
  const issuedDay=Math.floor(s.day/30)*30,key=String(s.castSeed||'legacy')+':'+destination+':'+issuedDay;
  let watch=watchCache.get(key);
  if(!watch){const p=E.port(destination),earth=E.port('earth'),daily=[];let expected=0,reports=0;
   for(let day=Math.max(0,issuedDay-29);day<=issuedDay;day++){const angle=p.phase+2*Math.PI*day/p.period-(earth.phase+2*Math.PI*day/earth.period),au=p.group==='earth'?0:Math.sqrt(Math.max(0,p.au*p.au+1-2*p.au*Math.cos(angle))),risk=Math.min(.35,.02+.11*Math.log1p(au)/Math.log(32)+Math.max(0,p.piracy-.04)*.2),reported=draw('traffic-raid:'+String(s.castSeed||'legacy')+':'+p.id+':'+day)<risk;daily.push({day,risk,reported});expected+=risk;reports+=Number(reported);}
   const samples=daily.length,adjustment=Math.max(-.04,Math.min(.04,(reports-expected)/(samples+30)));
   watch=Object.freeze({issuedDay,daily:Object.freeze(daily.map(Object.freeze)),samples,reports,expected,adjustment});watchCache.set(key,watch);if(watchCache.size>512)watchCache.delete(watchCache.keys().next().value);
  }
  const freshness=Math.max(0,1-Math.max(0,arrivalDay-issuedDay)/120);return {...watch,adjustment:watch.adjustment*freshness};
 }
 function knownPorts(E,s){return E.world.ports.filter(p=>p.id===s.location||(s.visited||[]).includes(p.id)||E.destinationAccess(s,p.id).open);}
 // A current local watch is separate from the older raid circular and mission offers.
 // Patrol reports every known cordon in this planetary system, including uncommissioned ones.
 function localBlockades(E,s){
  const current=E.port(s.location),group=current.group,name=E.world.systems.find(p=>p.id===group)?.name||group,stations=knownPorts(E,s).filter(p=>p.group===group),active=[],liberated=[];
  for(const p of stations){const b=E.blockadeStation(s,p.id);if(b?.status==='blockaded')active.push({port:p.id});else if(b?.status==='liberated'&&Number.isInteger(b.day)&&b.day<=s.day&&s.day-b.day<=recentDays)liberated.push({port:p.id,day:b.day});}
  liberated.sort((a,b)=>b.day-a.day||a.port.localeCompare(b.port));
  return {group,name,checkedDay:s.day,stations:stations.map(p=>p.id),active,liberated};
 }
 function blockadeBriefing(E,s,pid=null){
  const watch=localBlockades(E,s),place=id=>{const p=E.port(id),parent=E.world.systems.find(g=>g.id===p.group).name;return [p.name,p.body===parent?'Orbit':p.body===parent+' high orbit'?'High orbit':p.body,parent].join(' · ');};
  if(pid){const active=watch.active.find(p=>p.port===pid);if(!active)return `That station is not on our current local blockade watch. Ask for the latest situation before choosing your route.`;
   return `**${place(pid)}** is under blockade. Armed craft are holding the civilian approaches; you will be intercepted if you travel there, whether or not you have accepted a mission.\n\nThe station remains closed until the raiders are defeated. The Port Authority handles liberation commissions and any agreed payment; this patrol briefing makes no commitment on your behalf.`;
  }
  const opening=watch.active.length?`Our **${watch.name} sector** watch lists ${watch.active.length===1?'an active blockade at':'active blockades at'} **${watch.active.map(p=>place(p.port)).join('; ')}**. Arrivals there are contested; the civilian docks remain closed while the cordon holds.`:`No active blockade is reported among the **${watch.name} sector** stations on your charts.`;
  const clearance=watch.liberated.length?` Our latest local clearance is **${place(watch.liberated[0].port)}**; its blockade has been broken.`:'';
  return `${opening}${clearance}\n\n${watch.active.length?'I can go through an affected station with you. The Port Authority handles liberation commissions; travelling into a cordon will bring an interception even without one.':'That is a current local watch, not a promise that every route will stay clear. Check with patrol again before a later departure.'}`;
 }
 function assessment(E,s){
  const ports=E.world.ports,byID=new Map(ports.map(p=>[p.id,p])),known=new Set(knownPorts(E,s).map(p=>p.id));
  const current=byID.get(s.location),groups=new Set([...known].map(id=>byID.get(id).group)),cutoff=Math.max(0,s.day-recentDays),validDay=day=>Number.isInteger(day)&&day>=cutoff&&day<=s.day;
  // The existing patrol postings supply the edition date, including legacy saves.
  const localPostings=E.raidOffers(s),editionDay=Math.max(0,...localPostings.filter(r=>Number.isInteger(r.observedDay)&&r.observedDay<=s.day).map(r=>r.observedDay));
  const sightings=(s.patrolIntel||[]).filter(r=>known.has(r.port)&&validDay(r.observedDay)&&(r.recordedDay??r.observedDay)<=s.day&&r.expiresDay>s.day&&(!r.bountyID||!E.bountyOffers(s).some(b=>b.bountyID===r.bountyID&&(b.completed||b.captured))));
  const crews=(s.campaign?.raiders||[]).filter(r=>groups.has(r.group)&&validDay(r.day));
  const events=[];
  for(const b of s.battleHistory||[]){
   if(!validDay(b.day))continue;
   const entry=(s.log||[]).find(l=>l.day===b.day&&l.text.startsWith(b.title+': '+b.outcome+'.'));
   const pid=b.stationBlockade||(s.blockades?.jobs||[]).find(j=>j.id===b.blockadeID)?.destination||b.destination||entry?.port;
   if(!known.has(pid))continue;const p=byID.get(pid);
   const outcome={victory:'The engagement ended in victory. This records the result of that contact; it does not clear every nearby route.',defeat:'The engagement ended in defeat and emergency recovery. Patrol has issued no clearance for the surrounding approaches.',withdrawal:'The captain withdrew from the engagement. The hostile force was not confirmed destroyed.',surrender:'The engagement ended in surrender. The report does not establish that the route is clear.'}[b.outcome]||'The contact ended without a verified clearance of the surrounding routes.';
   events.push({id:'engagement:'+b.id,day:b.day,group:p.group,port:pid,title:b.encounterPhase==='route'?'Recorded corridor engagement':'Recorded engagement',...(b.encounterPhase==='route'?{route:{from:b.originPort,to:b.destination}}:{}),text:outcome,source:'Captain’s flight record'});
  }
  for(const r of crews){
   if(events.some(e=>e.group===r.group&&Math.abs(e.day-r.day)<=1))continue;
   events.push({id:'crew:'+r.id,day:r.day,group:r.group,port:null,title:r.captured?'Raider force neutralized':'Raider contact recorded',text:r.captured?`The regional register records ${r.leader}’s force as neutralized. That engagement reduced the immediate threat at the time, although other groups may still be active.`:`The regional register identifies ${r.leader} after a raider contact. No later capture is recorded, and its present position remains unconfirmed.`,source:'Regional raider register'});
  }
  const issuedDay=Math.max(editionDay,...events.map(e=>e.day),...sightings.map(r=>Math.min(s.day,r.recordedDay??r.observedDay)));
  // A public sector watch excludes the captain's personal creditor exposure.
  const view={...s,day:issuedDay,debt:0,bank:{...(s.bank||{}),loans:[],legacyDebt:0},patrolIntel:sightings};
  const assess=(origin,destination,day=issuedDay)=>{const snapshot={...view,location:origin,day,patrolIntel:sightings.filter(r=>r.observedDay<=day&&(r.recordedDay??r.observedDay)<=day),campaign:{...(s.campaign||{}),raiders:(s.campaign?.raiders||[]).filter(r=>r.day<=day),jobs:(s.campaign?.jobs||[]).filter(j=>j.acceptedDay==null||j.acceptedDay<=day)}};const q=E.piracyAssessment(snapshot,destination,{coastDays:0,waitDays:0});return q.risk;};
  // One reference arrival per station/day in the completed circular window. These
  // are unverified background traffic accounts, never invented player victories/losses.
  const traffic=[],trafficStatistics=new Map();
  for(const p of ports){
   if(!known.has(p.id))continue;
   const origin=ports.filter(q=>q.id!==p.id).sort((a,b)=>Number(b.group===p.group)-Number(a.group===p.group)||E.patrolSeparation(a.id,p.id,0)-E.patrolSeparation(b.id,p.id,0)||a.id.localeCompare(b.id))[0];
   if(!origin||!known.has(origin.id))continue;
   const stats={samples:0,reports:0,expected:0};trafficStatistics.set(p.id,stats);
   for(const observation of securityWatch(E,{...s,day:editionDay},p.id).daily){
    const {day,risk,reported}=observation;stats.samples++;stats.expected+=risk;
    if(!reported)continue;stats.reports++;
    const descriptions=['A freight crew reported an armed challenge on the receiving approach and a demand to stop for an unauthorized toll. Station control is checking the account; the report does not establish a verified cargo loss.','A civilian watch reported a boarding tender shadowing inbound traffic and attempting to divert a vessel from its cleared approach. Patrol has requested independent witness accounts.','A passing crew relayed a report of armed craft obstructing an arrival corridor. The account describes an attempted interception, but neither the attackers’ identity nor the final outcome has been independently confirmed.'];
    traffic.push({id:'traffic:'+p.id+':'+day,day,group:p.group,port:p.id,route:{from:origin.id,to:p.id},title:'Reported approach raid',text:descriptions[Math.floor(draw('traffic-wording:'+String(s.castSeed||'legacy')+':'+p.id+':'+day)*descriptions.length)],source:'Traffic relay · unverified account',reported:true});
   }
  }
  return {ports,byID,known,current,groups,cutoff,editionDay,sightings,events,issuedDay,view,assess,traffic,trafficStatistics};
 }
 const pricingRules=Object.freeze({quoteBasis:'actual-voyage-probability',priorArrivals:30,maximumOrdinaryIndex:.55,blockadeIndex:1});
 function routeAssessment(E,s,destination,prepared=assessment(E,s),publicOnly=false){
  const c=prepared,model=publicOnly?E.piracyAssessment(c.view,destination,{coastDays:0,waitDays:0}):E.piracyAssessment(s,destination),baseline=model.risk,stats=c.trafficStatistics.get(destination)||{samples:0,reports:0,expected:0};
  const expected=stats.samples?stats.expected/stats.samples:baseline;
  // Shared voyage encounter probability, including dated public traffic observations: one circular's prior
  // smooths the excess/shortfall in the same background accounts shown by Patrol.
  const activity=stats.samples?(stats.reports+expected*pricingRules.priorArrivals)/(stats.samples+pricingRules.priorArrivals)-expected:0;
  const blockade=E.blockadeStation(s,destination,model.arrivalDay)?.status==='blockaded',index=blockade?pricingRules.blockadeIndex:baseline,band=blockade?{key:'critical',label:'Critical'}:level(index);
  return {origin:s.location,destination,baseline,risk:index,routeRisk:model.routeRisk,approachRisk:model.approachRisk,...band,blockade,reportDay:c.issuedDay,editionDay:c.editionDay,reports:stats.reports,samples:stats.samples,activity};
 }
 function build(E,s){
  const context=assessment(E,s),{ports,byID,known,current,groups,cutoff,editionDay,sightings,events,issuedDay,view,assess,traffic}=context;
  const stations=ports.filter(p=>known.has(p.id)).map(p=>{
   const assessed=routeAssessment(E,s,p.id,context,true),risk=assessed.risk,blockade=E.blockadeStation(s,p.id),band={key:assessed.key,label:assessed.label};
   const hereSightings=sightings.filter(r=>r.port===p.id),postings=E.raidOffers({...view,location:p.id}).filter(r=>!r.bountyID&&known.has(r.suspectedPort));
   const tier=risk<.15?1:risk<.30?2:3,posting=postings.find(r=>r.tier===tier)||postings[0]||null;
   return {port:p.id,group:p.group,risk,...band,blockade:blockade?.status==='blockaded',clearedDay:blockade?.status==='liberated'?blockade.day:null,sightings:hereSightings,posting};
  });
  const sectors=[...groups].map(group=>{
   const local=stations.filter(p=>p.group===group),worst=[...local].sort((a,b)=>rank(b.key)-rank(a.key)||b.risk-a.risk)[0],name=E.world.systems.find(p=>p.id===group)?.name||group;
   const active=local.filter(p=>p.blockade),leads=local.flatMap(p=>p.sightings),posting=[...local].sort((a,b)=>b.risk-a.risk).find(p=>p.posting)?.posting;
   const affected=[...new Set([...active.map(p=>p.port),...leads.map(r=>r.port),...(posting?[posting.suspectedPort]:[])])];
   const approach=local.filter(p=>p.port!==s.location).sort((a,b)=>b.risk-a.risk)[0];
   const previous=approach?assess(s.location,approach.port,Math.max(0,editionDay-30)):worst.risk,change=approach?approach.risk-previous:0;
   const trend=change>.02?'The outlook has worsened since the preceding circular.':change<-.02?'The outlook has eased since the preceding circular; caution is still advised.':'';
   const narrative=active.length?'An armed cordon remains reported on the listed station approaches. Civilian traffic should treat those arrivals as contested.':worst.key==='severe'?'The outer approaches remain exposed, with limited patrol cover between settlements. Crews should arrange a coordinated passage and keep an alternative arrival plan.':worst.key==='high'?'The watch remains heightened around these approaches. Reports of armed traffic warrant a checked arrival plan and close contact with station control.':worst.key==='guarded'?'Patrol is maintaining a guarded watch. Crews should confirm their receiving contact before approaching and report any attempt to divert or stop traffic.':'Patrol coverage remains comparatively strong. No blanket clearance is implied; isolated approaches and unverified contacts still require attention.';
   const unconfirmed=leads.length?'Dated sightings have been received near the listed locations; the reports do not establish a current intercept position.':posting?'Traffic crews describe possible armed activity near the listed location. The sighting remains unverified and is not a confirmed raid.':'No current sighting gives a precise location in this sector.';
   return {group,name,stations:local.map(p=>p.port),affected,route:approach?{from:s.location,to:approach.port}:null,key:worst.key,label:worst.label,risk:worst.risk,narrative,unconfirmed,trend,observedDay:Math.max(editionDay,...leads.map(r=>r.observedDay)),local:group===current?.group};
  }).sort((a,b)=>rank(b.key)-rank(a.key)||b.risk-a.risk||a.name.localeCompare(b.name));
  const priority=sectors.slice(0,3);if(sectors.some(p=>p.local)&&!priority.some(p=>p.local)&&priority.length)priority[priority.length-1]=sectors.find(p=>p.local);
  const orderedTraffic=traffic.sort((a,b)=>b.day-a.day||a.id.localeCompare(b.id)),featured=[];
  for(const e of orderedTraffic)if(!featured.some(f=>f.group===e.group)&&featured.length<3)featured.push(e);
  for(const e of orderedTraffic)if(!featured.includes(e)&&featured.length<3)featured.push(e);
  const rest=sectors.filter(p=>!priority.includes(p)),recorded=events.sort((a,b)=>b.day-a.day||a.id.localeCompare(b.id)).slice(0,1),recent=[...recorded,...featured.slice(0,recorded.length?2:3)].sort((a,b)=>b.day-a.day||Number(!!a.reported)-Number(!!b.reported)||a.id.localeCompare(b.id)),worst=sectors[0]||{key:'low',label:'Low'};
  return {editionDay,issuedDay,fromDay:cutoff,throughDay:s.day,key:worst.key,label:worst.label,knownPorts:[...known],localBlockades:localBlockades(E,s),recent,sectors:priority,otherSectors:rest.map(p=>({group:p.group,name:p.name,key:p.key,label:p.label})),intro:recent.length?'The latest circular brings together recent traffic accounts, recorded encounters and patrol sightings. Unverified accounts are identified below; a reported attack does not establish a confirmed loss or a current intercept position.':'No recent engagement with a verified location is held in the available records. The watch below concerns reported activity and exposed routes; it does not confirm that an attack has taken place.',closing:'This circular covers stations already on your charts. Contact the receiving coordinator before departure; older sightings may no longer describe the situation on arrival.'};
 }
 const api={build,draw,securityWatch,assessment,routeAssessment,pricingRules,localBlockades,blockadeBriefing};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.SpacetraderPatrolReports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
