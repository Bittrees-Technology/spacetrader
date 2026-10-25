'use strict';
// Daily quote populations. Counts represent station-days, never buy × sell pairs.
(function(root){
 function histogram(samples){const map=new Map();for(const [price,count] of samples){if(!Number.isSafeInteger(price)||price<=0||!Number.isSafeInteger(count)||count<=0)throw Error('Invalid daily price observation.');map.set(price,(map.get(price)||0)+count);}return [...map].sort((a,b)=>a[0]-b[0]);}
 function statistics(samples){
  const prices=histogram(samples),count=prices.reduce((n,v)=>n+v[1],0);if(!count)return null;
  const mean=prices.reduce((n,[p,c])=>n+p*c,0)/count,standardDeviation=Math.sqrt(prices.reduce((n,[p,c])=>n+c*(p-mean)**2,0)/count);
  function rank(k){let n=0;for(const [p,c] of prices){n+=c;if(n>=k)return p;}return prices.at(-1)[0];}
  return {count,mean,median:(rank(Math.floor((count+1)/2))+rank(Math.floor((count+2)/2)))/2,standardDeviation,minimum:prices[0][0],maximum:prices.at(-1)[0],prices};
 }
 function priceDistribution(buySamples,sellSamples,binCount=128){
  const buy=statistics(buySamples),sell=statistics(sellSamples);if(!buy&&!sell)return null;
  const sides=[buy,sell].filter(Boolean);let low=Math.max(0,Math.min(...sides.map(s=>Math.min(s.minimum,s.mean-3*s.standardDeviation)))),high=Math.max(...sides.map(s=>Math.max(s.maximum,s.mean+3*s.standardDeviation)));
  if(high-low<1e-12){const pad=Math.max(1,Math.abs(low)*.05);low-=pad;high+=pad;}
  function bins(s){if(!s)return null;const masses=Array(binCount).fill(0);for(const [p,n] of s.prices){const i=Math.max(0,Math.min(binCount-1,Math.ceil((p-low)/(high-low)*binCount)-1));masses[i]+=n/s.count;}return {...s,low,high,masses};}
  return {basis:'daily-station-price-snapshots',low,high,buy:bins(buy),sell:bins(sell)};
 }
 function atOrBelow(series,value){if(!series)return null;return series.prices.reduce((n,[p,c])=>n+(p<=value?c:0),0)/series.count;}
 function forRows(rows,snapshots){if(!snapshots||snapshots.basis!=='daily-station-price-snapshots')return null;const keys=new Set(rows.map(r=>r.key)),selected=snapshots.rows.filter(r=>keys.has(r.key));if(!selected.length)return null;const d=priceDistribution(selected.flatMap(r=>r.buy?r.histograms.buy:[]),selected.flatMap(r=>r.sell!==false?r.histograms.sell:[]));return {...d,periodDays:snapshots.periodDays,stationCount:selected.length};}
 const api={histogram,statistics,priceDistribution,atOrBelow,forRows};if(typeof module!=='undefined')module.exports=api;else root.SpacetraderQuotePrices=api;
})(globalThis);
