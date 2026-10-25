'use strict';
const assert=require('node:assert/strict'),{performance}=require('node:perf_hooks'),E=require('../../Browser/engine');
const fresh=()=>E.transact(E.fresh(),'create',{name:'Broker review',background:'trader',temperament:'measured'});
const talk=(s,topic,opening=false)=>E.transact(s,'venue-talk',{id:'market',topic,opening});
const reply=s=>E.establishmentVisit(s,'market').conversation[0].text;
const funds=s=>JSON.stringify([s.day,s.credits,s.seed,s.profile.xp,s.profile.relationships,s.cargo,s.fleet,s.debt,s.exchangeStock,s.unlocked]);
let checked=0,discounts=0,premiums=0,none=0,worst=0;
for(const p of E.world.ports)for(const day of [0,90,180,270]){
 let s=fresh();s.location=p.id;s.day=day;s.visited=[...new Set(['earth',p.id])];s.unlocked=[...E.world.ports.map(p=>p.id)];s.profile.xp={commerce:1500,navigation:1500,engineering:1500,diplomacy:1500};
 const saved=JSON.stringify(s),start=performance.now(),b=E.brokerMarketBriefing(s);worst=Math.max(worst,performance.now()-start);assert.equal(JSON.stringify(s),saved);
 for(const r of b.bargains){assert(r.canBuy&&r.stock>0);assert.equal(r.quote.buy,E.marketState(s,r.good).buy);assert.equal(r.stock,E.marketStock(s,r.good).available);assert(!E.contrabandGoods.some(g=>g.id===r.good));}
 assert(b.bargains.every((r,i,a)=>!i||a[i-1].buyRatio<=r.buyRatio));assert(b.premiums.every((r,i,a)=>!i||a[i-1].buyRatio>=r.buyRatio));
 if(b.route)assert(s.visited.includes(b.route.target)&&E.accessiblePorts(s).includes(b.route.target));
 const before=funds(s);s=talk(s,'tree-market',true);assert.equal(funds(s),before);assert.equal(E.establishmentVisit(s,'market').topics.length,4);
 for(const key of ['tree-market-bargains','tree-market-premiums','tree-market-selling','tree-market-route','tree-market']){s=talk(s,key);assert.equal(funds(s),before);assert(E.establishmentVisit(s,'market').topics.length<=4);assert(!/undefined|NaN|\[object Object\]/.test(reply(s)));assert.deepEqual(E.parse(JSON.stringify(s)),s);}
 if(b.bargains[0]?.buyRatio<=.94){discounts++;s=talk(s,'tree-market-bargains');assert(reply(s).includes('below'));assert(reply(s).includes(b.bargains[0].quote.buy.toLocaleString('en-US')));}
 if(b.premiums[0]?.buyRatio>=1.06){premiums++;s=talk(s,'tree-market-premiums');assert(reply(s).includes('above'));}
 if(b.bargains[0]?.buyRatio>=.94){none++;s=talk(s,'tree-market-bargains');assert(reply(s).includes('no deep discount'));}
 checked++;
}
// The quieter seasonal baseline need not cross the old six-percent threshold.
// Real surplus deliveries and reserve depletion must still produce both branches.
for(const factor of [.1,2]){let x=fresh();x.profile.xp={commerce:1500,navigation:1500,engineering:1500,diplomacy:1500};x.commodityDiscovery.known=E.goods.map(g=>g.id);x.exchangeStock={version:1,entries:Object.fromEntries(E.goods.map(g=>['earth:'+g.id,{day:x.day,quantity:E.marketStock(x,g.id).quantity*factor}]))};const b=E.brokerMarketBriefing(x);if(factor>1){assert(b.bargains[0].buyRatio<=.94);discounts++;}else{assert(b.premiums[0].buyRatio>=1.06);premiums++;}}
assert(discounts&&premiums&&none);
let s=fresh();const b=E.brokerMarketBriefing(s);assert.equal(b.route,null);assert(b.bargains.every(r=>E.marketAccess(s,r.good).canBuy));
s.exchangeStock={version:1,entries:Object.fromEntries(E.goods.map(g=>['earth:'+g.id,{day:0,quantity:0}]))};assert.equal(E.brokerMarketBriefing(s).bargains.length,0);s=talk(s,'tree-market',true);assert.match(reply(s),/no stocked lot/);
s=fresh();s=E.transact(s,'buy',{good:'food',units:1});s=talk(s,'tree-market',true);s=talk(s,'tree-market-selling');assert.match(reply(s),/recorded purchase cost in your travelling holds/);assert.match(reply(s),/below/);assert(E.brokerMarketBriefing(s).cargo.some(r=>r.good==='food'&&r.assessment.status==='loss'));
const day0=E.brokerMarketBriefing(s).bargains.map(r=>[r.good,r.quote.buy]);s.day=180;assert.notDeepEqual(E.brokerMarketBriefing(s).bargains.map(r=>[r.good,r.quote.buy]),day0);
console.log(JSON.stringify({passed:true,stationDays:checked,discountBoards:discounts,premiumBoards:premiums,noDeepDiscountBoards:none,maxBriefingMs:Math.round(worst*100)/100,quotesAndStockMatched:true,noRNGMoneyTimeXPorPriceChanges:true,unknownStationsHidden:true},null,2));
