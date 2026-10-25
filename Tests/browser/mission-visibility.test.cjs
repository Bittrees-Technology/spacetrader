'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),E=require('../../Browser/engine');
const source=fs.readFileSync(require.resolve('../../Browser/app.js'),'utf8');
const context=vm.createContext({E,SpacetraderPatrolReports:require('../../Browser/patrol-reports'),date:d=>'Date '+d,stationLabel:id=>E.world.ports.find(p=>p.id===id)?.name||String(id??''),SpacetraderExchanges:require('../../Browser/conversation-exchanges'),esc:x=>String(x??''),fmt:x=>String(x),dec:x=>String(x),btn:(label,type)=>`<button data-action="${type}">${label}</button>`,campaignContractCard:j=>`<article>${j.title}</article>`,relicCabinetPanel:()=>'',state:null});
for(const name of ['objectiveText','objectiveTerms','objectiveCost','campaignServices','privateProjectStepsHTML','commissionCardHTML','visibleMissionTopics','secretJobsPanel','raidCard','patrolReportPanel','raidsPanel']){
 const lines=source.slice(source.indexOf('function '+name+'(')).split('\n');
 const end=lines[0].endsWith('}')?1:lines.findIndex((line,i)=>i>0&&line==='}')+1;
 assert(end>0,name);vm.runInContext(lines.slice(0,end).join('\n'),context);
}
const ready=()=>E.transact(E.fresh(),'create',{name:'Visibility QA',background:'engineer',temperament:'measured'});
let checks=0;function test(name,fn){fn();checks++;console.log('PASS '+name);}
const campaign=s=>{s.campaign={version:1,known:['survey','signals'],jobs:[],receipts:[],standing:{patrol:0,industrial:0,scientific:0,relief:0,underworld:0},leads:[],raiders:[],concessions:[],surveys:[],lastFieldDay:null,suspendedUntil:0};s.credits=100000;return s;};
test('specialist offers appear only when earned XP qualifies, without changing their acceptance rules',()=>{
 const s=campaign(ready());context.state=s;const before=JSON.stringify(s),raw=E.missionOffers(s,'relay');assert(raw.some(o=>o.kind==='signals'&&!o.canAccept));let html=context.campaignServices('relay');assert(!html.includes('Two-observation signal study'));assert(html.includes('Survey archive commission'));assert.equal(JSON.stringify(s),before);
 s.profile.xp.navigation=700;html=context.campaignServices('relay');assert(html.includes('Two-observation signal study'));assert(E.missionOffers(s,'relay').find(o=>o.kind==='signals').canAccept);
});
test('licence and certificate requirements hide offers until qualified',()=>{
 const s=campaign(ready());s.campaign.known=['sealed'];s.profile.relationships.earth=30;context.state=s;assert(!context.campaignServices('contracts').includes('Sealed diplomatic case'));
 s.campaign.known.push('certificate:sealed');assert(context.campaignServices('contracts').includes('Sealed diplomatic case'));
 s.unlocked=[];const offers=E.missionOffers(s,'contracts');assert(offers.every(o=>E.destinationAccess(s,o.destination).open));assert(E.offers(s).every(o=>E.destinationAccess(s,o.destination).open));
});
test('completed and failed personal cards disappear, while active and eligible offered cards remain',()=>{
 const q={title:'Personal test',description:'Supplies',terms:'Quoted terms'};
 for(const status of ['completed','failed'])assert.equal(context.commissionCardHTML({...q,status}), '');
 assert.equal(context.commissionCardHTML({...q,status:'offered',canAccept:false}),'');
 assert(context.commissionCardHTML({...q,status:'offered',canAccept:true}).includes(q.title));
 assert(context.commissionCardHTML({...q,status:'active',canComplete:false}).includes(q.title));
 const topics=['tree-offer','tree-needs','tree-receipt','tree-back'].map(id=>({id}));
 assert.deepEqual(Array.from(context.visibleMissionTopics({tree:{commission:{status:'completed'}},topics}),o=>o.id),['tree-back']);
});
test('active specialist missions stay visible even if prerequisites or cash are subsequently lost',()=>{
 const s=campaign(ready()),offer=E.missionOffers(s,'relay').find(o=>o.kind==='survey');let active=E.transact(s,'mission-accept',{id:offer.id,venue:'relay'});active.credits=0;context.state=active;assert(context.campaignServices('relay').includes(offer.title));
 // Completed entries remain saved for progression but never render as mission cards.
 active.campaign.jobs[0].status='completed';active.campaign.jobs[0].closedDay=active.day;assert(!context.campaignServices('relay').includes(offer.title));assert.equal(active.campaign.jobs[0].status,'completed');
});
test('secret commission lists show active work only, preserving saved outcomes',()=>{
 const original=context.E;context.E={underworldOverview:()=>({quests:[{id:'old',title:'Already finished',status:'completed'},{id:'failed',title:'Expired test',status:'failed'},{id:'live',title:'Current test',status:'active',originName:'Earth',targetName:'Moon',reward:100,relicName:'Lens'}]})};
 const html=context.secretJobsPanel();assert(html.includes('Current test'));assert(!html.includes('Already finished'));assert(!html.includes('Expired test'));context.E=original;
});
test('patrol cards exclude closed bounties and unlicensed or nonlocal sightings',()=>{
 const s=ready();context.state=s;const all=E.raidOffers(s),html=context.raidsPanel();for(const r of all.filter(r=>!r.availableHere||!r.suspectedPort||!E.destinationAccess(s,r.suspectedPort).open))assert(!html.includes('<h3>'+r.title+'</h3>'));
 s.claimedBounties=E.notoriousRaiders().map(r=>r.id);for(const r of E.raidOffers(s).filter(r=>r.bountyID))assert(!context.raidsPanel().includes('<h3>'+r.title+'</h3>'));
});
console.log(checks+' mission visibility scenarios passed.');
