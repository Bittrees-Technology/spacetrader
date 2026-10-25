'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),E=require('../../Browser/engine'),V=require('../../Browser/dialogue-voices');
const talk=(s,id,topic,contact='')=>E.transact(s,'venue-talk',{id,topic,contact});
const ready=()=>{const s=E.transact(E.fresh(),'create',{name:'Voice review',background:'engineer',temperament:'measured'});s.profile.xp={commerce:5000,diplomacy:5000,navigation:5000,engineering:5000};s.unlocked=E.world.ports.map(p=>p.id);return s;};
let staff=0,visitors=0;const roots=new Set(),work=new Set(),stories=new Set(),tones=new Set();const samples=[];
for(const p of E.world.ports){const s=ready();s.location=p.id;s.visited=[...new Set(['earth',p.id])];for(const v of E.establishments(p.id,false,s)){
 const raw=JSON.stringify(s),d=E.establishmentVisit(s,v.id);assert.equal(d.topics.length,5+Number(['local','relay','security','authority'].includes(v.id))+2*Number(v.id==='local')+Number(v.id==='authority')+Number(v.id==='security')+Number(v.id==='relay')+1+1+Number(['market','contracts','relay'].includes(v.id)));assert.deepEqual(E.establishmentVisit(s,v.id),d);assert.equal(JSON.stringify(s),raw);roots.add(d.topics.map(t=>t.name).join('|'));tones.add(v.character.tone);
 const w=talk(s,v.id,'tree-work'),r=E.establishmentVisit(w,v.id).conversation[0].text;assert.equal(w.seed,s.seed);assert.equal(w.day,s.day);assert.equal(w.credits,s.credits);assert.deepEqual(w.profile.xp,s.profile.xp);assert.equal(r,E.establishmentVisit(talk(s,v.id,'tree-work'),v.id).conversation[0].text);assert(r.length<2500&&!/undefined|\[object Object\]/.test(r));work.add(r);
 const n=talk(s,v.id,'tree-story'),story=E.establishmentVisit(n,v.id).conversation[0].text;assert(story.includes(v.character.history));stories.add(story);
 if(['mars','mercury','triton'].includes(p.id)&&['market','shipyard','clinic'].includes(v.id))samples.push({station:p.name,person:v.person,role:v.role,tone:v.character.tone,choices:d.topics.map(t=>t.name),response:r});staff++;
 }for(const h of E.stationContacts(p.id,'local',s).filter(h=>h.contactID)){
 const n=talk(s,'local','tree-work',h.contactID),d=E.establishmentVisit(n,'local',h.contactID);assert(d.conversation[0].text.includes('a '+h.role.toLowerCase()));assert(d.conversation[0].text.includes('rather than running this room'));assert(d.topics.length<=10);visitors++;
 }}
assert.equal(staff,256);assert.equal(roots.size,staff);assert.equal(work.size,staff);assert(stories.size>staff*.9);
// Isolate personality from name, artwork, profession and station: the body of the answer must change.
const h=E.establishments('mars',false,ready()).find(v=>v.id==='market'),s=ready();s.location='mars';
const hash=key=>{let n=2166136261n;for(const c of key)n=BigInt.asUintN(64,(n^BigInt(c.charCodeAt(0)))*16777619n);return n;};
const voice=V.create({port:E.port,placeStories:{mars:['Founded by crews.','Imported instrumentation.','A leaf on the arrivals board.']},hash,homePort:()=>'',crewReadiness:()=>100});
const distinct=new Set();for(const tone of ['blunt','formal','warm','wry','curious','reflective','lively']){const host=E.clone(h);host.character.tone=tone;const reply=voice.response(s,'market',host,'tree-work','fallback',{rapport:0});distinct.add(reply);assert(reply.includes('cargo')||reply.includes('manifest')||reply.includes('certificate')||reply.includes('buyer'));assert.notEqual(voice.choice(s,'market',host,'tree-work','fallback'),'fallback');}assert.equal(distinct.size,7);
// Exact gameplay parity with the previous engine along respectful, hostile, personal and discovery paths.
const prior=process.env.SPACETRADER_VOICE_BASELINE||path.resolve(__dirname,'../../Build/ConversationRecommendations212/before/Browser/engine.js');
if(fs.existsSync(prior)){
 const file=path.resolve(__dirname,'../../Browser/engine.js'),m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(fs.readFileSync(prior,'utf8'),file);const old=m.exports;
 const mechanical=s=>{const n=E.clone(s);delete n.dialogue;delete n.log;delete n.profile.decisions;if(n.lastJournalEntry){delete n.lastJournalEntry.notes;delete n.lastJournalEntry.title;delete n.lastJournalEntry.outcome;}if(n.dialogueProgress)for(const v of Object.values(n.dialogueProgress.sessions))delete v.memory;for(const a of ['stationReputationHistory','reputationHistory'])if(n[a])for(const row of n[a])delete row.reason;return JSON.stringify(n).replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,'<id>');};
 for(const [id,route] of [['market',['work','careful','followup','back','story','listen','support','first-step']],['shipyard',['work','craft','pressure','apologize','patron','needs','offer']],['security',['local','risk','verify']],['local',['story','interests','company','support']]]){
  let a=ready(),b=E.clone(a);for(const choice of route){if(choice==='pressure'&&old.establishmentVisit(a,id).topics.some(t=>t.id==='tree-challenge-craft'))a=old.transact(a,'venue-talk',{id,topic:'tree-challenge-craft'});a=old.transact(a,'venue-talk',{id,topic:'tree-'+choice});if(choice==='pressure')b=talk(b,id,'tree-challenge-craft');b=talk(b,id,'tree-'+choice);assert.equal(mechanical(a),mechanical(b),id+' '+choice);}
 }
}
console.log(JSON.stringify({staff,visitors,uniqueRootSets:roots.size,uniqueWorkResponses:work.size,uniqueStoryResponses:stories.size,personalityTones:tones.size,isolatedDistinctVoiceBodies:distinct.size,samples},null,2));
