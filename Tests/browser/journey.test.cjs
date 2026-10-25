'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const E=require('../../Browser/engine.js');
const source=fs.readFileSync(path.join(__dirname,'../../Browser/app.js'),'utf8');
const sampleSource=source.slice(source.indexOf('function journeySample('),source.indexOf('function showJourney('));
const context=vm.createContext({});vm.runInContext(sampleSource,context);
const sample=context.journeySample;
const state=E.fresh(),before=JSON.stringify(state);let routes=0;
for(const from of E.world.ports)for(const to of E.world.ports){if(from.id===to.id)continue;
 state.location=from.id;const q=E.quote(state,to.id),plan={q};let previous=-1;
 for(let i=0;i<=100;i++){
  const v=sample(plan,i/100);for(const k of ['p','u','elapsed','x','y','heading'])assert(Number.isFinite(v[k]),k);
  assert(v.elapsed>=previous);previous=v.elapsed;assert(v.elapsed<=q.waitDays+q.coastDays+1e-8);
  if(v.stage==='Traffic clearance'||v.stage==='Approach complete')assert.equal(v.burn,false);else assert.equal(v.burn,true);
 }
 const a=sample(plan,-1),b=sample(plan,2);assert.equal(a.x,140);assert.equal(b.x,760);assert.equal(a.elapsed,0);assert.equal(b.elapsed,q.waitDays+q.coastDays);assert.equal(b.burn,false);routes++;
}
state.location=JSON.parse(before).location;assert.equal(JSON.stringify(state),before,'sampling must not mutate simulation');
const waitPlan={q:{waitDays:500,coastDays:259}};assert.equal(sample(waitPlan,.06).elapsed,250);assert.equal(sample(waitPlan,.06).stage,'Traffic clearance');assert.equal(sample(waitPlan,.12).stage,'Outbound acceleration');assert.equal(sample(waitPlan,.56).stage,'Midpoint turnover');assert.equal(sample(waitPlan,.95).stage,'Arrival braking');
console.log(`PASS ${routes} route animations: finite geometry, monotonic calendar, accurate total days, acceleration, turnover and braking, clamping and no simulation mutation`);
