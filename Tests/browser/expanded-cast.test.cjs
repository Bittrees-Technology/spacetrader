'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),E=require('../../Browser/engine');
const fixture=require('./cast-before-expansion-0.37.0.json');let count=0;
const test=(name,f)=>{f();count++;console.log('PASS '+name);};
const ready=(seed='591768122100002')=>{const s=E.transact(E.fresh(),'create',{name:'Expanded cast QA',background:'engineer',temperament:'measured'});s.castSeed=seed;return s;};
const rows=s=>E.world.ports.flatMap(p=>[...E.establishments(p.id,false,s),...E.stationContacts(p.id,'local',s).slice(1)].map(v=>({...v,port:p.id})));
const people=s=>[...new Map(rows(s).map(v=>[v.person,v])).values()];
const copy=v=>JSON.parse(JSON.stringify(v));
function oldSave(){const s=copy(fixture.state);delete s.castEdition;delete s.castV1Pins;return s;}
function identity(v){return {person:v.person,portraitKey:v.portraitKey,portraitVariant:v.portraitVariant};}
function coreTraits(v){return Object.fromEntries(['tone','opening','habit','habitSpoken','interest','history','goal','value'].map(k=>[k,v.character[k]]));}
test('128 new full-size designs add eight physical detail styles and four age groups per species',()=>{
 const art=E.expandedPortraitCatalog();assert.equal(art.length,128);assert.equal(new Set(art.map(v=>v.portraitKey)).size,128);const hashes=new Set();
 for(const sp of E.speciesCatalog){const group=art.filter(v=>v.species===sp.id);assert.equal(group.length,32);assert.equal(new Set(group.map(v=>v.detailStyle)).size,8);assert.equal(new Set(group.map(v=>v.ageStyle)).size,4);assert.equal(new Set(group.map(v=>v.appearanceNote)).size,32);}
 for(const v of art){const data=fs.readFileSync(__dirname+'/../../Browser/portraits/'+v.portraitKey+'.jpg');assert(data.length>15000);hashes.add(crypto.createHash('sha256').update(data).digest('hex'));assert(v.appearanceNote.length>40);assert.equal(v.featureEdition,2);}assert.equal(hashes.size,128);
});
test('expanded casts retain 360 distinct identities and faces across many independent voyage seeds',()=>{
 for(let i=0;i<40;i++){const s=ready(String(8981000+i)),p=people(s);assert.equal(p.length,360);assert.equal(new Set(p.map(v=>v.person)).size,360);assert.equal(new Set(p.map(v=>v.species+':'+v.portraitIndex)).size,360);assert(p.filter(v=>v.portraitKey.startsWith('portrait-frontier-')).length>40);}
});
test('wider name pools and syntaxes generate substantially more than a small recycled first-name list',()=>{
 const names=Object.fromEntries(E.speciesCatalog.map(sp=>[sp.id,new Set()])),starts=Object.fromEntries(E.speciesCatalog.map(sp=>[sp.id,new Set()]));
 for(let i=0;i<30;i++)for(const v of people(ready(String(721000+i))).filter(v=>v.contactID)){names[v.species].add(v.person);starts[v.species].add(v.person.split(/[ ,/·’-]/)[0]);}
 for(const sp of E.speciesCatalog){assert(names[sp.id].size>700,sp.id);assert(starts[sp.id].size>90,sp.id);}
 assert(![...names.robot].some(n=>/^(\w+) (?:of |\/ )?\1$/.test(n)));assert([...names.robot].some(n=>/\[[A-F0-9]+\]/.test(n)));assert(![...names.robot].some(n=>/Iteration/i.test(n)));assert([...names.human].some(n=>/, /.test(n)));assert([...names.ilyri].some(n=>/·/.test(n)));assert([...names.veyr].some(n=>/ \/ /.test(n)));
});
test('traits vary independently with broad speech, habit, interest, history and ambition combinations',()=>{
 const p=people(ready()),limits={tone:27,habit:42,interest:42,history:38,goal:38,value:25,cadence:15};
 for(const [key,min] of Object.entries(limits))assert(new Set(p.map(v=>v.character[key])).size>=min,key);assert(new Set(p.map(v=>v.profileNote)).size>180);
 for(const v of p){assert(v.character.habitSpoken.startsWith('I '));assert(!/^I (keeps|practices|repairs|leaves|builds|wears|matches|rereads|sews|writes)\b/.test(v.character.habitSpoken));}
});
test('the legacy pinned catalogue is preserved while dedicated desk assignments survive migration',()=>{
 let s=oldSave();const known=fixture.cast.filter((v,i)=>i%7===0&&(!v.contactID||/-(0|1)$/.test(v.contactID)));
 s.topics=known.map(v=>v.port+':venue:'+v.id+(v.contactID?':'+v.contactID:'')+':intro');const raw=JSON.stringify(s),before=rows(s);
 const archived=v=>E.castPerson(s,v.contactID?E.stationContacts(v.port,'local').find(x=>x.contactID===v.contactID):E.establishments(v.port).find(x=>x.id===v.id));
 for(const v of known){const now=archived(v);assert.deepEqual(identity(now),identity(v));assert.deepEqual(coreTraits(now),coreTraits(v));}assert.equal(JSON.stringify(s),raw);
 s=E.transact(s,'wait');assert.equal(s.castEdition,2);assert(s.castV1Pins.length>20);const loaded=E.parse(JSON.stringify(s));
 assert.deepEqual(rows(loaded).map(identity),before.map(identity));
 for(const v of known){const now=archived(v);assert.deepEqual(identity(now),identity(v));assert.deepEqual(coreTraits(now),coreTraits(v));}
});
test('old transcripts and paid canteen receipts pin contacts even if their topic receipt is missing',()=>{
 const s=oldSave(),old=fixture.cast.find(v=>v.port==='earth'&&v.id==='market'),guest=fixture.cast.find(v=>v.port==='earth'&&v.contactID==='visitor-earth-2');s.topics=[];s.dialogue=[{id:'remembered',day:0,port:'earth',speaker:old.person,text:'Remember our last arrival.',venue:'market',partner:old.person,contact:''}];s.canteenRounds=[{id:'round-pin',port:'earth',day:0,cost:180,speaker:guest.person,contact:guest.contactID,heard:false,category:'none',title:'A quiet round',text:'No useful news.'}];
 assert.equal(E.castPerson(s,E.establishments('earth')[0]).person,old.person);for(const v of [guest])assert.equal(rows(s).find(x=>x.port===v.port&&x.id===v.id&&(x.contactID||'')===(v.contactID||'')).person,v.person);
});
test('mixed old and new casts reserve familiar names and artwork and keep every unmigrated first contact stable',()=>{
 let s=oldSave();s.topics=fixture.cast.filter((v,i)=>i%5===0).map(v=>v.port+':venue:'+v.id+(v.contactID?':'+v.contactID:'')+':intro');const a=rows(s),persons=[...new Map(a.map(v=>[v.person,v])).values()];assert.equal(persons.length,360);assert.equal(new Set(persons.map(v=>v.species+':'+v.portraitIndex)).size,360);
 const market=a.find(v=>v.port==='earth'&&v.id==='market');s=E.transact(s,'venue-talk',{id:'market',topic:'intro'});assert.equal(s.dialogue.at(-1).speaker,market.person);assert.deepEqual(rows(s).map(identity),a.map(identity));s=E.transact(s,'venue-talk',{id:'market',topic:'personal'});assert.equal(s.dialogue.at(-1).speaker,market.person);assert(s.dialogue.at(-1).text.includes(market.character.history));assert.deepEqual(rows(E.parse(JSON.stringify(s))).map(identity),a.map(identity));
});
test('physical descriptions and personality remain consistent when one person works across several establishments',()=>{
 const s=ready(),known=new Map();for(const v of rows(s)){const summary={person:v.person,portraitKey:v.portraitKey,appearanceNote:v.appearanceNote,profileNote:v.profileNote,character:v.character};if(known.has(v.person))assert.deepEqual(summary,known.get(v.person));else known.set(v.person,summary);}assert.equal(known.size,360);
});
test('browsing the expanded cast leaves cargo, cash, calendar, encounter randomness and the original save untouched',()=>{
 for(const s of [ready(),oldSave()]){const raw=JSON.stringify(s);rows(s);for(const p of E.world.ports){E.stationContacts(p.id,'local',s);E.establishments(p.id,false,s);}assert.equal(JSON.stringify(s),raw);assert.deepEqual(E.parse(raw),s);}
});
test('cast editions and preserved identities reject malformed, unknown or duplicated metadata',()=>{
 for(const change of [s=>s.castEdition=3,s=>s.castEdition='2',s=>delete s.castV1Pins,s=>s.castV1Pins=['missing'],s=>s.castV1Pins=['slot-visitor-earth-2','slot-visitor-earth-2'],s=>delete s.castSeed,s=>{delete s.castEdition;s.castV1Pins=[];}]){const s=ready();change(s);assert.throws(()=>E.parse(JSON.stringify(s)));}
});
console.log(`${count} expanded cast and familiar-contact continuity scenarios passed.`);
