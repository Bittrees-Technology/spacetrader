'use strict';
const assert=require('node:assert/strict'),E=require('../../Browser/engine');
const talk=(s,id,topic,contact='')=>E.transact(s,'venue-talk',{id,topic,contact});
function ready(){const s=E.transact(E.fresh(),'create',{name:'Conversation review',background:'engineer',temperament:'measured'});s.profile.xp={commerce:5000,diplomacy:5000,navigation:5000,engineering:5000};s.credits=2000000;s.unlocked=E.world.ports.map(p=>p.id);return s;}
let desks=0,edges=0,personPaths=0;const nodes=new Set(),choices=new Set();
// Walk the actual offered graph, including paged specialist introductions. Every branch must return.
for(const v of E.establishments('mars',false,ready())){
 const base=ready();base.location='mars';base.visited.push('mars');
 const pending=[base],seen=new Set();
 while(pending.length){const s=pending.shift(),d=E.establishmentVisit(s,v.id),key=s.dialogueProgress?.sessions['mars:'+v.id+':']?.node||'root';if(seen.has(key))continue;seen.add(key);nodes.add(key);
  assert(d.topics.length>0&&d.topics.length<=(key==='root'?10:key.startsWith('career')?8:key==='crew'?7:['relics','relic-collectors','services'].includes(key)?6:['market-advice','work','story','craft','local','agreement'].includes(key)?5:4),v.id+' '+key);assert(d.topics.every(t=>t.detail===''));assert.equal(new Set(d.topics.map(t=>t.id)).size,d.topics.length);
  if(key!=='root')assert(d.topics.some(t=>['tree-back','tree-offer-later','tree-bounty-later'].includes(t.id)),v.id+' return from '+key+' '+d.topics.map(t=>t.id));
  for(const t of d.topics){if(t.disabled||['tree-relic-accept','tree-relic-sell','tree-crew-hire','tree-blockade-accept'].includes(t.id))continue;const n=talk(s,v.id,t.id);edges++;choices.add(t.id);E.validate(n);assert.deepEqual(E.parse(JSON.stringify(n)),n);const reply=E.establishmentVisit(n,v.id).conversation;assert.equal(reply.length,1);assert.equal(reply[0].speaker,d.host.person);assert(reply[0].text.trim().length>0); // A terse character may answer briefly.
assert(!/undefined|\[object Object\]/.test(reply[0].text));for(const k of ['day','credits','seed','fuel','cargo'])assert.deepEqual(n[k],s[k]);pending.push(n);}
 }
 const expected=['craft','practice','memory','interests','ambition','agreement',...(v.id==='authority'?['government','gov-history','gov-veyr','gov-ilyri','gov-detail']:['logistics','safety','sources'])];assert(expected.every(node=>seen.has(node)),v.id+' missing '+expected.filter(node=>!seen.has(node)).join(', '));desks++;
}
// Every staff identity and every canteen visitor can use the expanded personal branches.
for(const p of E.world.ports){const s=ready();s.location=p.id;s.visited=[...new Set(['earth',p.id])];for(const v of E.establishments(p.id,false,s)){
 const d=E.establishmentVisit(s,v.id);assert.equal(d.topics.length,5+Number(['local','relay','security','authority'].includes(v.id))+2*Number(v.id==='local')+Number(v.id==='authority')+Number(v.id==='security')+Number(v.id==='relay')+1+1+Number(['market','contracts','relay'].includes(v.id)));personPaths++;
}for(const v of E.stationContacts(p.id,'local',s)){
 let n=s;for(const topic of ['tree-story','tree-interests','tree-company','tree-support','tree-first-step'])n=talk(n,'local',topic,v.contactID||'');const d=E.establishmentVisit(n,'local',v.contactID||'');assert(d.conversation[0].text.includes(d.host.character.goal));personPaths++;
}}
// All qualified specialist offers remain reachable, rather than silently truncated after four choices.
for(const v of E.establishments('earth',false,ready())){
 let s=ready();const expected=[...E.operationDiscoveryChoices(s,v.id),...E.campaignIntroductions(s,v.id)].map(t=>t.id);if(!expected.length)continue;
 s=talk(talk(s,v.id,'tree-needs'),v.id,'tree-register');const found=new Set();for(let page=0;page<16;page++){const d=E.establishmentVisit(s,v.id);assert(d.topics.length<=4);for(const t of d.topics)if(expected.includes(t.id))found.add(t.id);if(!d.topics.some(t=>t.id==='tree-register-next'))break;s=talk(s,v.id,'tree-register-next');if(s.dialogueProgress.sessions['earth:'+v.id+':'].node==='register-0')break;}
 assert.deepEqual([...found].sort(),expected.sort());
}
console.log(JSON.stringify({desks,edges,personPaths,stages:[...nodes].sort(),distinctChoices:choices.size,maxVisibleChoices:4,allQualifiedIntroductionsReachable:true},null,2));
