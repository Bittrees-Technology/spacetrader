'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),E=require('../../Browser/engine');let count=0;
const test=(name,fn)=>{fn();count++;console.log('PASS '+name);};
function ready(location='earth'){const s=E.transact(E.fresh(),'create',{name:'Route refresh QA',background:'engineer',temperament:'measured'});s.location=location;s.visited=[...new Set(['earth',location])];s.unlocked=['earth','moon','earth-high','mars'];s.credits=100000;return s;}
function route(s,destination){return E.freightRouteSchedule(s,destination);}
function present(s,destination){return E.offers(s).some(o=>o.destination===destination);}
test('issuing station and route length both change refresh cadence',()=>{
 const s=ready();assert.equal(route(s,'moon').refreshDays,90);assert.equal(route(s,'mars').refreshDays,120);assert.equal(route(ready('moon'),'earth').refreshDays,105);assert.equal(route(ready('mars'),'earth').refreshDays,150);assert.equal(route(ready('triton'),'earth').refreshDays,630);
 assert(route(s,'triton').refreshDays>route(s,'mars').refreshDays);assert(route(ready('triton'),'earth').refreshDays>route(s,'triton').refreshDays);
});
test('completed short and longer routes replenish independently at their own boundaries',()=>{
 const s=ready();const initial=E.offers(s);s.completed.push(...initial.map(o=>o.id));
 for(const day of [29,30,60,89]){s.day=day;assert(!present(s,'moon'));assert(!present(s,'mars'));}
 s.day=90;assert.equal(route(s,'moon').cycle,1);assert(!present(s,'mars'));assert.equal(E.freightBoardSchedule(s).nextRefresh,120);
 s.day=119;assert(!present(s,'mars'));s.day=120;assert.equal(route(s,'mars').cycle,1);for(const c of E.offers(s).filter(o=>o.destination==='mars'))assert.equal(c.id,'freight-v4-earth-mars-1-0');E.validate(s);
});
test('another station uses its own dispatch clock, without global replenishment',()=>{
 const s=ready('moon');s.completed.push(...E.offers(s).map(o=>o.id));s.day=90;assert(!present(s,'earth'));s.day=104;assert(!present(s,'earth'));s.day=105;assert.equal(route(s,'earth').cycle,1);assert.equal(route(s,'earth').nextRefresh,210);
});
test('reloads, captain XP, changed ships and date-dependent orbital positions do not reroll route clocks',()=>{
 const s=ready();s.day=63;const expected=route(s,'mars'),raw=JSON.stringify(s);assert.deepEqual(route(E.parse(raw),'mars'),expected);assert.equal(JSON.stringify(s),raw);
 const changed=E.clone(s);changed.shipID='swift';changed.fuel=0;changed.profile.xp.navigation=12700;assert.deepEqual(route(changed,'mars'),expected);
 for(const day of [64,75,89,90,119])assert.equal(route({...s,day},'mars').nextRefresh,120);
});
test('legacy active and consumed 90-day offers retain terms and cannot refill immediately after update',()=>{
 let s=ready();const offer=E.offers(s).find(o=>o.destination==='moon');s=E.transact(s,'accept',{id:offer.id});s.contract.id='freight-v2-earth-moon-0';s.freightCargo.contractID=s.contract.id;
 const raw=JSON.stringify(s);assert.deepEqual(E.parse(raw),s);assert(!present(s,'moon'));assert.equal(JSON.stringify(s),raw);s.day=90;assert(!present(s,'moon'),'An active route remains reserved after refresh');s.contract=null;delete s.freightCargo;s.cargo={};assert.equal(route(s,'moon').cycle,1);
 const done=ready();done.day=110;done.completed.push('freight-v2-earth-mars-1');assert(!present(done,'mars'));done.day=120;assert.equal(route(done,'mars').cycle,1);
 const broken=ready();broken.topics.push('broken-contract:freight-v2-earth-mars-0');assert(!present(broken,'mars'));broken.day=120;assert.equal(route(broken,'mars').cycle,1);
});
test('route schedules reveal licensed destinations only and agree with every displayed offer',()=>{
 const s=ready();s.unlocked=['earth','moon'];let board=E.freightBoardSchedule(s);assert.deepEqual(board.routes.map(r=>r.destination),['moon']);
 s.unlocked=['earth','moon','earth-high','mars'];board=E.freightBoardSchedule(s);for(const o of E.offers(s)){const r=board.routes.find(r=>r.destination===o.destination);assert(r);for(const key of ['refreshDays','nextRefresh','remaining','cycleStart'])assert.equal(o[key],r[key]);}
 const source=fs.readFileSync(require.resolve('../../Browser/app.js'),'utf8'),ctx=vm.createContext({E,state:s,fmt:String,dec:String,esc:String,btn:()=>''});require('./station-label-test-helpers.cjs')(ctx);vm.runInContext(source.slice(source.indexOf('function freightPanel('),source.indexOf('function skillProgressCard(')),ctx);const html=ctx.freightPanel();assert(!html.includes('Route refresh schedule'));assert(!html.includes('freight-board-status'));for(const offer of E.offers(s))assert(html.includes('data-offer-id="'+offer.id+'"'));assert(!html.includes('New offers every 90 game days'));
});
test('all 650 directed station routes have bounded finite cycles and consistent next dates',()=>{
 let n=0;for(const a of E.world.ports)for(const b of E.world.ports)if(a.id!==b.id){const s={location:a.id,day:1179},r=route(s,b.id);assert(Number.isInteger(r.refreshDays)&&r.refreshDays>=90&&r.refreshDays<=630);assert(r.nextRefresh>s.day&&r.remaining===r.nextRefresh-s.day);assert.equal(route({...s,day:r.nextRefresh},b.id).cycle,r.cycle+1);const end=route({...s,day:365249},b.id);assert.equal(end.remaining,0);n++;}assert.equal(n,650);
});
console.log(count+' station and route refresh scenarios passed.');
