'use strict';
const {distribution}=require('./quote-distribution.cjs');
// Exact frequency-weighted quote outcomes; never materialize the Cartesian pairs.
function histogram(samples){const m=new Map();for(const [price,count] of samples){if(!Number.isSafeInteger(price)||price<=0||!Number.isSafeInteger(count)||count<=0)throw Error('Invalid quote distribution.');m.set(price,(m.get(price)||0)+count);}return [...m].sort((a,b)=>a[0]-b[0]);}
function quoteOutcomes(buySamples,sellSamples){
 const buys=histogram(buySamples),sells=histogram(sellSamples);if(!buys.length||!sells.length)return null;
 const buyCount=buys.reduce((n,v)=>n+v[1],0),sellCount=sells.reduce((n,v)=>n+v[1],0),sellSum=sells.reduce((n,v)=>n+v[0]*v[1],0),pairs=buyCount*sellCount;
 if(!Number.isSafeInteger(pairs))throw Error('Quote population exceeds exact count range.');
 let i=0,lowerCount=0,lowerSum=0,gainCount=0,gainTotal=0,gainPercent=0,lossCount=0,lossTotal=0,lossPercent=0,breakEvenCount=0;
 for(const [buy,n] of buys){
  while(i<sells.length&&sells[i][0]<buy){lowerCount+=sells[i][1];lowerSum+=sells[i][0]*sells[i][1];i++;}
  const equal=i<sells.length&&sells[i][0]===buy?sells[i][1]:0,higherCount=sellCount-lowerCount-equal,higherSum=sellSum-lowerSum-buy*equal;
  gainCount+=n*higherCount;gainTotal+=n*(higherSum-buy*higherCount);gainPercent+=100*n*(higherSum/buy-higherCount);
  lossCount+=n*lowerCount;lossTotal+=n*(lowerSum-buy*lowerCount);lossPercent+=100*n*(lowerSum/buy-lowerCount);breakEvenCount+=n*equal;
 }
 const result=(count,total,percent)=>({count,probability:count/pairs,credits:count?total/count:null,percent:count?percent/count:null});
 return {pairs,distribution:distribution(buys,sells),gain:result(gainCount,gainTotal,gainPercent),loss:result(lossCount,lossTotal,lossPercent),breakEvenProbability:breakEvenCount/pairs,expectedCredits:(gainTotal+lossTotal)/pairs,expectedPercent:(gainPercent+lossPercent)/pairs};
}
function groupsFor(rows){const groups=[];for(const selected of [rows,rows.filter(r=>r.buy)]){const keys=selected.map(r=>r.key).sort(),key=keys.join('|');if(!keys.length||groups.some(g=>g.key===key))continue;const result=quoteOutcomes(selected.flatMap(r=>r.buy?r.histograms.buy:[]),selected.flatMap(r=>r.sell!==false?r.histograms.sell:[]));groups.push({key,keys,...result});}return groups;}
module.exports={histogram,quoteOutcomes,groupsFor};
