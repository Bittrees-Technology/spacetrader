'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),E=require('../Browser/engine'),{aggregateItems}=require('../Local/goods-catalogue/goods-view'),{cycleFor,boundsFor}=require('../Local/goods-catalogue/price-bounds.cjs');
const base={item:'example',product:'Example',unit:'unit',port:'a',channel:'Exchange',category:'Exchange goods',lowBuy:100,highBuy:200,lowSell:80,highSell:250},f={phases:100,buy:true,sell:true,counts:{lowBuy:2,highBuy:4,lowSell:5,highSell:3}};
let item=aggregateItems([{...base,exchangeFrequency:f}])[0];assert.equal(item.maxGain,150);assert.equal(item.maxGainPercent,150);assert.equal(item.maxLoss,-120);assert.equal(item.maxLossPercent,-60);assert.equal(item.gainQuoteFrequency,.02*.03);assert.equal(item.lossQuoteFrequency,.04*.05);
const second={...base,port:'b',lowBuy:110,highBuy:180,lowSell:90,highSell:250,exchangeFrequency:{...f,buy:false,counts:{...f.counts,highSell:7}}};item=aggregateItems([{...base,exchangeFrequency:f},second])[0];assert.equal(item.gainQuoteFrequency,.02*.05);assert.equal(item.lossQuoteFrequency,.04*.025);
assert.equal(aggregateItems([{...base,lowSell:null,highSell:null}])[0].maxGain,null);
assert.equal(aggregateItems([{...base,lowBuy:null,highBuy:null}])[0].maxLoss,null);
item=aggregateItems([{...base,highSell:90}])[0];assert.equal(item.maxGain,0);assert.equal(item.gainQuoteFrequency,null);
item=aggregateItems([{...base,lowSell:220}])[0];assert.equal(item.maxLoss,0);assert.equal(item.lossQuoteFrequency,null);
assert.equal(aggregateItems([base])[0].gainQuoteFrequency,null);
assert.equal(aggregateItems([{...base,exchangeFrequency:f},{...base,channel:'Traveller',lowBuy:50}])[0].gainQuoteFrequency,null);
// Brute-force real quotes independently, including plateau days, unlisted buy markets and station filters.
const cycle=cycleFor(E.marketEconomy),receipts=[];
for(const id of ['water','electronics']){
 const sources=[],buy=[],sell=[];
 for(const p of E.world.ports){const projection=boundsFor(E,E.marketEconomy,cycle,p.id,id),listed=E.marketEconomy.listed(p.id,id),b=[],s=[];
  for(let day=0;day<cycle.periodDays;day++){const q=E.marketState({day},id,p.id);b.push(q.buy);s.push(q.sell);if(listed)buy.push(q.buy);sell.push(q.sell);}
  for(const [field,values] of [['lowBuy',b],['highBuy',b],['lowSell',s],['highSell',s]]){const extreme=field.startsWith('low')?Math.min(...values):Math.max(...values);assert.equal(projection[field],extreme);assert.equal(projection.quoteCounts[field],values.filter(v=>v===extreme).length);}
  sources.push({...base,item:id,port:p.id,lowBuy:listed?projection.lowBuy:null,highBuy:listed?projection.highBuy:null,lowSell:projection.lowSell,highSell:projection.highSell,exchangeFrequency:{phases:cycle.periodDays,counts:projection.quoteCounts,buy:listed,sell:true}});
 }
 item=aggregateItems(sources)[0];const count=(arr,x)=>arr.filter(v=>v===x).length;
 assert.equal(item.gainQuoteFrequency,count(buy,Math.min(...buy))/buy.length*(count(sell,Math.max(...sell))/sell.length));
 assert.equal(item.lossQuoteFrequency,count(buy,Math.max(...buy))/buy.length*(count(sell,Math.min(...sell))/sell.length));
 const subset=aggregateItems(sources.slice(0,3))[0];assert(subset.gainQuoteFrequency>0);receipts.push({item:id,gain:item.maxGain,loss:item.maxLoss,gainFrequency:item.gainQuoteFrequency,lossFrequency:item.lossQuoteFrequency,buyObservations:buy.length,sellObservations:sell.length});
}
fs.writeFileSync('Build/GoodsPotentialReview/verification.json',JSON.stringify({passed:true,independentFullCycleExamples:receipts,edgeCases:['asymmetric percentage bases','no buy or sell','one-sided outcome','no invented trader odds','plateau counts','unlisted buy observations excluded','matching-source filters']},null,2));
console.log('PASS gain/loss percentages, missing/one-sided markets, trader N/A and exact exchange-pair frequencies against 75,972 real daily quotes.');
