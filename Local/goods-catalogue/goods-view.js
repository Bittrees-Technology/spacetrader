'use strict';
(function(root){
 function aggregateItems(rows,quotePairOutcomes={},dailyPriceSnapshots=null){
  const items=new Map();
  for(const r of rows){let item=items.get(r.item);if(!item){item={item:r.item,product:r.product,unit:r.unit,packing:r.packing,category:r.category,note:r.note,lowBuy:null,highBuy:null,lowSell:null,highSell:null,ports:new Set(),channels:new Set(),exchangeRows:[]};items.set(r.item,item);}
   item.ports.add(r.port);item.channels.add(r.channel);if(r.exchangeFrequency)item.exchangeRows.push(r);
   for(const key of ['lowBuy','lowSell'])if(Number.isFinite(r[key]))item[key]=item[key]===null?r[key]:Math.min(item[key],r[key]);
   for(const key of ['highBuy','highSell'])if(Number.isFinite(r[key]))item[key]=item[key]===null?r[key]:Math.max(item[key],r[key]);
  }
  return [...items.values()].map(r=>{
   // Daily extrema, probabilities and curves share one population. Intermittent
   // trader envelopes remain visible in station rows, without invented weights.
   if(r.exchangeRows.length)for(const key of ['lowBuy','highBuy','lowSell','highSell']){
    const values=r.exchangeRows.map(v=>v[key]).filter(Number.isFinite);r[key]=values.length?(key.startsWith('low')?Math.min(...values):Math.max(...values)):null;
   }
   const complete=['lowBuy','highBuy','lowSell','highSell'].every(k=>Number.isFinite(r[k])&&r[k]>0);
   const maxGain=complete?Math.max(0,r.highSell-r.lowBuy):null,maxLoss=complete?Math.min(0,r.lowSell-r.highBuy):null;
   function frequency(first,second){
    // Count exact extrema over exchange station/day observations, not traveller visits.
    const rows=r.exchangeRows;if(!rows.length||rows.some(v=>!Number.isSafeInteger(v.exchangeFrequency.phases)||v.exchangeFrequency.phases<=0))return null;
    function endpoint(field){const side=field.endsWith('Buy')?'buy':'sell';let total=0,hits=0;for(const v of rows){const f=v.exchangeFrequency;if(!f[side])continue;total+=f.phases;if(v[field]===r[field]){const n=f.counts[field];if(!Number.isSafeInteger(n)||n<1||n>f.phases)return null;hits+=n;}}return total&&hits?hits/total:null;}
    const a=endpoint(first),b=endpoint(second);return a===null||b===null?null:a*b;
   }
   const outcomeKey=r.exchangeRows.map(v=>v.key).sort().join('|'),outcome=(quotePairOutcomes[r.item]||[]).find(g=>g.key===outcomeKey);
   const priceModel=typeof module!=='undefined'?require('./quote-prices.js'):root.SpacetraderQuotePrices,priceDistribution=dailyPriceSnapshots?priceModel.forRows(r.exchangeRows,dailyPriceSnapshots):null;
   return {...r,priceDistribution,dailyBuyCount:priceDistribution?.buy?.count??null,dailySellCount:priceDistribution?.sell?.count??null,dailyBuyMean:priceDistribution?.buy?.mean??null,dailySellMean:priceDistribution?.sell?.mean??null,dailyBuyMedian:priceDistribution?.buy?.median??null,dailySellMedian:priceDistribution?.sell?.median??null,dailyBuyDeviation:priceDistribution?.buy?.standardDeviation??null,dailySellDeviation:priceDistribution?.sell?.standardDeviation??null,distribution:outcome?.distribution??null,averageGain:outcome?.gain?.credits??null,averageGainPercent:outcome?.gain?.percent??null,averageLoss:outcome?.loss?.credits??null,averageLossPercent:outcome?.loss?.percent??null,gainProbability:outcome?.gain?.probability??null,lossProbability:outcome?.loss?.probability??null,breakEvenProbability:outcome?.breakEvenProbability??null,expectedMargin:outcome?.expectedCredits??null,expectedMarginPercent:outcome?.expectedPercent??null,maxGain,maxLoss,maxGainPercent:complete?maxGain/r.lowBuy*100:null,maxLossPercent:complete?maxLoss/r.highBuy*100:null,gainQuoteFrequency:complete&&maxGain>0?frequency('lowBuy','highSell'):null,lossQuoteFrequency:complete&&maxLoss<0?frequency('highBuy','lowSell'):null,stationCount:r.ports.size,sourceCount:r.channels.size,ports:undefined,channels:undefined,exchangeRows:undefined};
  });
 }
 const api={aggregateItems};if(typeof module!=='undefined')module.exports=api;else root.SpacetraderGoodsView=api;
})(globalThis);
