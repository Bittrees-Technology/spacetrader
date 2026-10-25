'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'../..'),baseline=path.join(root,'Build/Rollbacks/Spacetrader-0.58.0-before-current-app/Browser'),current=path.join(root,'Browser');let checks=0;
function load(directory){let serial=0;const context=vm.createContext({TextEncoder,require:createRequire(path.join(directory,'engine.js')),module:{exports:{}},crypto:{randomUUID:()=>`00000000-0000-4000-8000-${String(++serial).padStart(12,'0')}`}});vm.runInContext(fs.readFileSync(path.join(directory,'engine.js'),'utf8'),context);return context.module.exports;}
// The requested unique desk assignments change character presentation only.
// Compare all mechanical fields, receipts, choices and effects, excluding the
// person/portrait profile and the spoken wording that follows that person.
let presentationNames=[],namePattern=null;
function neutral(value){
 if(typeof value==='string')return namePattern?value.replace(namePattern,'<host>'):value;
 if(Array.isArray(value))return value.map(neutral);
 if(!value||typeof value!=='object')return value;
 if(value.person&&value.species)return Object.fromEntries(['id','contactID','name','panel','role','species','seed','business'].filter(k=>k in value).map(k=>[k,value[k]]));
 const result={};for(const [key,v] of Object.entries(value)){
  if(('speaker' in value)&&['speaker','partner','text'].includes(key))continue;
  if(value.id==='tree-story'&&key==='name'){result[key]='How did you get here, <host>?';continue;}
  if(key==='host'&&typeof v==='string'){result[key]='<issuing host>';continue;}
  result[key]=neutral(v);
 }return result;
}
const old=load(baseline),now=load(current),equal=(a,b,label)=>{assert.deepEqual(neutral(JSON.parse(JSON.stringify(a))),neutral(JSON.parse(JSON.stringify(b))),label);checks++;};
for(const name of ['world.js','portraits.js','style.css']){assert.equal(fs.readFileSync(path.join(baseline,name),'utf8'),fs.readFileSync(path.join(current,name),'utf8'),name);checks++;}
let a=old.fresh(),b=now.fresh();equal(a,b,'new charter');
function act(type,args={}){a=old.transact(a,type,args);b=now.transact(b,type,args);equal(a,b,'action '+type);equal(old.parse(JSON.stringify(a)),now.parse(JSON.stringify(b)),'round trip '+type);}
act('create',{name:'Parity captain',background:'engineer',temperament:'measured'});
presentationNames=[...new Set(now.world.ports.flatMap(p=>[...old.establishments(p.id,false,a),...now.establishments(p.id,false,b),...old.stationContacts(p.id,'local',a),...now.stationContacts(p.id,'local',b)]).map(v=>v.person))].sort((a,b)=>b.length-a.length);
namePattern=new RegExp(presentationNames.map(name=>name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
for(const pid of now.world.ports.map(p=>p.id)){
 for(const day of [0,31,90,181,273,364,900,2319]){
  const x=old.clone(a),y=now.clone(b);x.location=y.location=pid;x.visited=y.visited=[...new Set(['earth',pid])];x.day=y.day=day;
  for(const good of now.allGoods)equal(old.marketState(x,good.id),now.marketState(y,good.id),`price ${pid} ${day} ${good.id}`);
  for(const method of ['marketSnapshot','bankOverview','creditAssessment','localLicenceOffers','portFacilities','underworldOverview','offers','piracyAssessment','inspectionChance']){
   const args=['portFacilities','inspectionChance'].includes(method)?[pid]:method==='piracyAssessment'?[x,'earth']: [x];const args2=['portFacilities','inspectionChance'].includes(method)?[pid]:method==='piracyAssessment'?[y,'earth']:[y];
   // Route assessments require their normal destination/quote arguments; checked by travel below.
   if(method==='piracyAssessment')continue;
   equal(old[method](...args),now[method](...args2),`${method} ${pid} ${day}`);
  }
 }
 const x=old.clone(a),y=now.clone(b);x.location=y.location=pid;x.visited=y.visited=[...new Set(['earth',pid])];
 equal(old.stationContacts(pid,'local',x),now.stationContacts(pid,'local',y),'cast '+pid);
 for(const venue of now.establishments(pid,false,y)){
  equal(old.establishmentVisit(x,venue.id),now.establishmentVisit(y,venue.id),'establishment '+pid+' '+venue.id);
  let tx=x,ty=y;for(const topic of ['tree-work','tree-careful','tree-back','tree-needs','tree-offer']){tx=old.transact(tx,'venue-talk',{id:venue.id,topic});ty=now.transact(ty,'venue-talk',{id:venue.id,topic});equal(tx,ty,'dialogue '+pid+' '+venue.id+' '+topic);}
 }
 for(const view of ['approach','service','profile'])equal(old.stationVisual(pid,view),now.stationVisual(pid,view),'station model '+pid+view);
}
for(const sh of now.ships)for(const upgraded of [false,true]){const v={shipID:sh.id,hull:73,upgrades:Object.fromEntries(now.upgradeCatalog.map(m=>[m.id,upgraded?1:0])),ammo:3};equal(old.shipVisual(v),now.shipVisual(v),'ship model '+sh.id);equal(old.shipOffer(a,sh.id),now.shipOffer(b,sh.id),'ship purchase '+sh.id);}
for(const xp of [0,99,100,299,300,699,700,1499,1500,102300,1000000])equal(old.skillProgressForXP(xp),now.skillProgressForXP(xp),'XP '+xp);
for(const rep of [-100,-50,0,50,100]){const x=old.clone(a),y=now.clone(b);x.profile.reputationScore=y.profile.reputationScore=rep;x.profile.relationships.earth=y.profile.relationships.earth=rep;equal(old.reputationData(x.profile),now.reputationData(y.profile),'rep '+rep);equal(old.bankOverview(x),now.bankOverview(y),'credit '+rep);}
act('buy',{good:'water',units:2});act('sell',{good:'water',units:1});act('venue-talk',{id:'market',topic:'tree-work'});act('venue-talk',{id:'market',topic:'tree-careful'});act('borrow',{amount:100});act('repay',{amount:100});act('accept',{id:now.offers(b)[0].id});
for(const seed of ['1','3','60','100','900']){a.seed=b.seed=seed;equal(old.quote(a,a.location==='earth'?'moon':'earth'),now.quote(b,b.location==='earth'?'moon':'earth'),'seeded quote');act('depart',{destination:b.location==='earth'?'moon':'earth'});if(b.incident)act('resolve',{choice:b.incident.kind==='pirate'?'pay':'spare'});}
console.log(`PASS ${checks} cross-edition comparisons (character presentation excluded): data, prices, establishment duties, branching dialogue effects, XP, reputation, ships, upgrades, licences, seeded travel and save round trips`);
