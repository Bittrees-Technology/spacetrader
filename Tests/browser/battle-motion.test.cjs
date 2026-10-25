'use strict';
const assert=require('node:assert/strict'),V=require('../../Browser/battle-stage'),E=require('../../Browser/engine'),{ready,start}=require('./combat-v2-balance.cjs');
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS '+name);};
const near=(a,b,tolerance=1e-8)=>assert(Math.abs(a-b)<tolerance,`${a} != ${b}`);
function fixture(reduced=false){
 let clock=0,frameID=0,resize;const pending=new Map(),contacts=[],segments=[];
 const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),moveTo(x,y){segments.push([x,y]);}},{get:(o,k)=>k in o?o[k]:()=>{}});
 const models={getContext:()=>null,addEventListener(){}},effects={getContext:()=>ctx},labels={append(label){contacts.push(label);}},span={};
 const element={dataset:{},isConnected:true,setAttribute(){},getBoundingClientRect:()=>({width:1000,height:500}),querySelector:s=>s==='.battle-space-models'?models:s==='.battle-space-effects'?effects:s==='.battle-space-labels'?labels:span};
 const preference={matches:reduced,addEventListener(k,fn){this.change=fn;},removeEventListener(){}};
 global.document={hidden:false,createElement:type=>type==='section'?element:{style:{},dataset:{},setAttribute(){},classList:{toggle(){}},remove(){this.removed=true;}}};
 global.window={devicePixelRatio:2,matchMedia:()=>preference};global.performance={now:()=>clock};global.ResizeObserver=class{constructor(fn){resize=fn;}observe(){}disconnect(){}};
 global.requestAnimationFrame=fn=>{pending.set(++frameID,fn);return frameID;};global.cancelAnimationFrame=id=>pending.delete(id);
 const stage=V.create({battle:'motion',model(){throw Error('No mesh needed in fallback');}});
 const scene={units:[{id:'ship',friendly:true,name:'Ship',hull:100,x:.2,y:.4,scale:1,targetID:'raider'},{id:'raider',friendly:false,name:'Raider',hull:100,x:.8,y:.6,scale:1,targetID:'ship'}],shots:[]};
 const draw=t=>{clock=t;const frames=[...pending.values()];pending.clear();for(const fn of frames)fn(t);};
 const at=(t,fn)=>{clock=t;fn();};
 return {stage,scene,draw,at,contacts,segments,preference,pending,resize,element};
}
const snapshot=f=>f.contacts.filter(c=>!c.removed).map(c=>({id:c.dataset.id,transform:c.style.transform,heading:c.dataset.heading}));
test('holding position stays exact across ninety seconds of half-second health and selection updates',()=>{
 const f=fixture();f.stage.update(f.scene,{running:true,step:0});const original=snapshot(f),input=JSON.stringify(f.scene);
 for(let t=40;t<=90000;t+=40){f.draw(t);if(t%1000===0)for(let i=0;i<2;i++)f.stage.update(f.scene,{running:true,step:t/500+i,selected:i?'raider':'ship'});assert.deepEqual(snapshot(f),original);}
 assert.equal(JSON.stringify(f.scene),input);assert.equal(f.pending.size,1);f.stage.dispose();assert.equal(f.pending.size,0);
});
test('course changes preserve position and velocity and do not oscillate about a stationary destination',()=>{
 const course={start:[0,0,0],target:[4,-2,1],velocity:[0,0,0],at:100};let previous=[0,0,0];
 for(let t=100;t<=5100;t+=10){const sample=V.sampleCourse(course,t);for(let i=0;i<3;i++){assert(sample.position[i]>=Math.min(0,course.target[i])-1e-10&&sample.position[i]<=Math.max(0,course.target[i])+1e-10);assert(Math.abs(course.target[i]-sample.position[i])<=Math.abs(course.target[i]-previous[i])+1e-10);}previous=sample.position;}
 const before=V.sampleCourse(course,440),revised={start:before.position,velocity:before.velocity,target:[-2,1,0],at:440};assert.deepEqual(V.sampleCourse(revised,440),before);
 const after=V.sampleCourse(revised,440.001);for(let i=0;i<3;i++)near((after.position[i]-before.position[i])/.000001,before.velocity[i],.001);
});
test('actual renderer continues a maneuver through unchanged ticks and selection without restarting or jumping',()=>{
 const a=fixture();a.stage.update(a.scene,{running:true,step:0});a.scene.units[0].x=.4;a.at(100,()=>a.stage.update(a.scene,{running:true,step:1}));
 const trace=[];for(let t=140;t<=2100;t+=40){a.draw(t);if(t%500===100){const before=snapshot(a);a.stage.update(a.scene,{running:true,step:t/500,selected:'ship'});assert.deepEqual(snapshot(a),before);}trace.push(snapshot(a));}a.stage.dispose();
 const b=fixture();b.stage.update(b.scene,{running:true,step:0});b.scene.units[0].x=.4;b.at(100,()=>b.stage.update(b.scene,{running:true,step:1}));let i=0;
 for(let t=140;t<=2100;t+=40){b.draw(t);assert.deepEqual(snapshot(b),trace[i++]);}b.stage.dispose();
});
test('camera and depth lanes stay fixed when ships are removed or the unit array is reordered',()=>{
 const f=fixture();f.stage.update(f.scene,{running:true,step:0});const initial=snapshot(f),grid=f.segments.slice(0,5);
 f.stage.update({...f.scene,units:[...f.scene.units].reverse()},{running:true,step:1});assert.deepEqual(snapshot(f),initial);
 f.segments.length=0;f.stage.update({...f.scene,units:[f.scene.units[0]]},{running:true,step:2});assert.deepEqual(snapshot(f),[initial[0]]);assert.deepEqual(f.segments.slice(0,5),grid);f.stage.dispose();
});
test('turns use the shortest arc with bounded angular speed and acceleration, then settle without rocking',()=>{
 for(const scale of [.48,1]){let angle=3.12,velocity=0,previousVelocity=0;const target=-2.9,rate=1.05/Math.max(.7,scale);let error=Math.abs(Math.atan2(Math.sin(target-angle),Math.cos(target-angle)));
 for(let i=0;i<150;i++){const next=V.steerHeading(angle,velocity,target,40,scale);assert(Math.abs(next.angle-angle)<=rate*.04+1e-10);assert(Math.abs(next.velocity)<=rate+1e-10);assert(Math.abs(next.velocity-previousVelocity)<=rate*2*.04+1e-6);angle=next.angle;velocity=next.velocity;previousVelocity=velocity;const e=Math.abs(Math.atan2(Math.sin(target-angle),Math.cos(target-angle)));assert(e<=error+1e-10);error=e;}
 assert(error<1e-7);}
});
test('reduced motion immediately follows real positions with no animation and stays settled when changed live',()=>{
 const f=fixture(true);f.stage.update(f.scene,{running:true,step:0});f.scene.units[0].x=.4;f.stage.update(f.scene,{running:true,step:1});const final=snapshot(f);assert.equal(f.pending.size,0);
 f.preference.matches=false;f.preference.change();f.draw(40);assert.deepEqual(snapshot(f),final);f.stage.dispose();
 const g=fixture();g.stage.update(g.scene,{running:true,step:0});g.scene.units[0].x=.4;g.stage.update(g.scene,{running:true,step:1});g.draw(200);g.preference.matches=true;g.preference.change();const settled=snapshot(g);assert.equal(g.pending.size,0);g.preference.matches=false;g.preference.change();g.draw(240);assert.deepEqual(snapshot(g),settled);g.stage.dispose();
});
test('destroyed hulls stop moving and turning without relocating surviving contacts',()=>{
 const f=fixture();f.stage.update(f.scene,{running:true,step:0});f.scene.units[0].x=.4;f.stage.update(f.scene,{running:true,step:1});f.draw(240);const before=snapshot(f);f.scene.units[0].hull=0;f.scene.units[0].x=.7;f.stage.update(f.scene,{running:true,step:2});f.draw(1500);assert.deepEqual(snapshot(f),before);f.stage.dispose();
});
test('real engine battles render without changing saved combat state or leaking animation frames',()=>{
 let ticks=0;for(const ship of ['kestrel','osprey','nightjar'])for(const seed of [1,7,17]){let state=start(ready(ship,2,seed),2);state=E.transact(state,'battle-plan',{battle:state.battle.id,step:0,revision:state.battle.live?.revision||0,realtime:true,engage:true});const f=fixture();
 for(let step=0;step<180&&state.battle;step++){const before=state;state=E.transact(state,'battle-tick',{battle:state.battle.id,step:state.battle.live.step,revision:state.battle.live.revision});const raw=JSON.stringify(state),scene=E.combatScene(before,state,{live:true});f.at(step*500,()=>f.stage.update(scene,{running:!!state.battle,step}));for(let frame=40;frame<500;frame+=40)f.draw(step*500+frame);assert.equal(JSON.stringify(state),raw);for(const label of snapshot(f))assert(!/NaN|Infinity/.test(label.transform));ticks++;}
 f.stage.dispose();assert.equal(f.pending.size,0);E.validate(state);}
 assert(ticks>=40);console.log('Rendered '+ticks+' real half-second combat ticks.');
});
console.log(checks+' battle motion scenarios passed.');
