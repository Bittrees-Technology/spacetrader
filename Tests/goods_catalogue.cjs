'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),E=require('../Browser/engine');
const d=JSON.parse(fs.readFileSync('Build/GoodsCatalogueReview/data.json')),rows=d.rows;
assert.equal(new Set(rows.map(r=>r.key)).size,rows.length);
assert.equal(new Set(rows.map(r=>r.port)).size,26);
for(const g of E.allGoods)assert(rows.some(r=>r.item===g.id),g.id);
for(const r of rows){for(const k of ['lowBuy','lowSell','highBuy','highSell'])assert(r[k]===null||Number.isInteger(r[k])&&r[k]>=0,k+':'+r.key);if(r.lowBuy!==null)assert(r.lowBuy<=r.highBuy);if(r.lowSell!==null)assert(r.lowSell<=r.highSell);assert(['High','Medium','Low','N/A'].includes(r.rate));if(E.contrabandGoods.some(g=>g.id===r.item))assert.equal(r.scan,'Yes');}
let checked=0;
for(const g of E.goods)for(const p of E.world.ports){const r=rows.find(r=>r.item===g.id&&r.port===p.id&&r.channel==='Exchange');assert(r);assert.equal(r.availability,E.marketEconomy.listed(p.id,g.id)?'Buy & sell':'Sell only');for(const day of [0,55,100,205,365,730,1095,1460]){const q=E.marketState({day},g.id,p.id);assert(q.sell>=r.lowSell&&q.sell<=r.highSell);if(r.lowBuy!==null)assert(q.buy>=r.lowBuy&&q.buy<=r.highBuy);checked++;}const m=E.commodityMilestones[g.discoveryLevel||0];if(m.stage){assert(r.prerequisite.includes(m.xp+' Navigation'));assert(r.prerequisite.includes(m.visited+' stations'));assert(r.prerequisite.includes(m.accessible+' destinations'));}if(g.handling?.length)assert(r.prerequisite.includes('Compatible hold'));}
for(const r of rows.filter(r=>r.category==='Equipment crates'))assert(r.prerequisite.includes('Engineering level 3'));
assert(rows.some(r=>r.item==='antiquity-disputed'&&r.scan==='Yes'));
console.log(`PASS ${rows.length} rows, ${new Set(rows.map(r=>r.item)).size} items, 26 stations, ${checked} actual daily quotes, all current goods and restrictions.`);
