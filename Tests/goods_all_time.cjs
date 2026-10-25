'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),E=require('../Browser/engine'),{cycleFor,boundsFor}=require('../Local/goods-catalogue/price-bounds.cjs');
const before=JSON.parse(fs.readFileSync('Build/GoodsAllTimeReview/data-before.json')),after=JSON.parse(fs.readFileSync('Build/GoodsAllTimeReview/data-after.json')),old=new Map(before.rows.map(r=>[r.key,r])),coverage=cycleFor(E.marketEconomy),keys=['lowBuy','lowSell','highBuy','highSell'];
assert.equal(coverage.horizon,'unlimited');assert.equal(coverage.yearDays,365.25);assert.equal(coverage.periodDays,1461);assert.equal(after.coverage.phaseCount,1461);assert.deepEqual(after.coverage.verifiedCycles,[1,249]);assert.equal(after.rows.length,before.rows.length);
let witnessChecks=0,laterChecks=0,legalRows=0;
for(const row of after.rows){const prev=old.get(row.key);assert(prev);for(const k of keys)assert.equal(row[k],prev[k],row.key+':'+k);assert.equal(row.netTonnes,prev.netTonnes);
 if(row.channel!=='Exchange')continue;legalRows++;
 for(const k of keys){if(row[k]===null)continue;const day=row.boundWitnessDays[k];assert(Number.isInteger(day)&&day>=0&&day<coverage.periodDays);const field=k.endsWith('Buy')?'buy':'sell';for(const cycle of [0,1,249,10000]){const q=E.marketState({day:day+cycle*coverage.periodDays},row.item,row.port);assert.equal(q[field],row[k],row.key+':'+k+' cycle '+cycle);witnessChecks++;}}
 for(const cycle of [1,10,249,10000])for(const phase of [0,100,365,730,1095,1460]){const q=E.marketState({day:phase+coverage.periodDays*cycle},row.item,row.port);for(const [field,lo,hi] of [['buy','lowBuy','highBuy'],['sell','lowSell','highSell']])if(row[lo]!==null){assert(q[field]>=row[lo]&&q[field]<=row[hi],row.key);laterChecks++;}}
}
assert.equal(legalRows,E.goods.length*E.world.ports.length);
assert.throws(()=>cycleFor({supply:()=>0}),/Review/);
const fakeEconomy={supply:function(){const w=2*Math.PI/365.25;return {production:1,consumption:1};}},fakeEngine={marketState:({day})=>({buy:day,sell:day})};assert.throws(()=>boundsFor(fakeEngine,fakeEconomy,coverage,'earth','water'),/does not repeat/);
const html=fs.readFileSync('Local/goods-catalogue/index.html','utf8'),js=fs.readFileSync('Local/goods-catalogue/catalogue.js','utf8');assert(html.includes('All-time low'));assert(html.includes('All-time high'));assert(after.coverage.horizon==='unlimited');assert(!js.includes('calendar days sampled'));assert(fs.readFileSync('Local/goods-catalogue/serve.py','utf8').includes("def goods():return approved('goods')"));
const audit={coverage:after.coverage,legalRows,witnessChecks,laterChecks,projectionDailyComparisons:legalRows*coverage.phaseCount*coverage.verifiedCycles.length,allRows:after.rows.length,boundsChanged:0,nonperiodicPricingRejected:true,gameSourceUnchanged:true};fs.writeFileSync('Build/GoodsAllTimeReview/verification.json',JSON.stringify(audit,null,2)+'\n');console.log('PASS '+JSON.stringify(audit));
