'use strict';
// A complete set of daily phases covers arbitrarily many repetitions of this model.
// Derive the whole-day period from the installed procurement supply equation; fail closed
// if that equation changes shape rather than silently retaining an old run length.
function cycleFor(economy){
 const legacy=economy.supply.toString().match(/Math\.PI\/(\d+(?:\.\d+)?)/);
 const match=Number.isFinite(economy.cycleDays)?[null,String(economy.cycleDays)]:legacy;
 if(!match)throw Error('Review the seasonal equation before projecting all-time price bounds.');
 const cycleDays=Number(match[1]),places=(match[1].split('.')[1]||'').length,denominator=10**places,numerator=Math.round(cycleDays*denominator),gcd=(a,b)=>b?gcd(b,a%b):a;
 const periodDays=numerator/gcd(numerator,denominator);
 if(!Number.isSafeInteger(periodDays)||periodDays<1||periodDays>10000)throw Error('Seasonal daily cycle needs an explicit bounds review.');
 return {horizon:'unlimited',basis:'complete-recurring-daily-cycle',yearDays:economy.calendarYearDays||365.25,cycleDays,periodDays,phaseCount:periodDays,verifiedCycles:[1,249],label:'Baseline bounds · complete recurring cycle'};
}
function boundsFor(E,economy,coverage,pid,id,options={}){
 const distributions=options.distributions?{buy:new Map(),sell:new Map()}:null;
 const bounds={lowBuy:Infinity,lowSell:Infinity,highBuy:-Infinity,highSell:-Infinity},witnessDays={},quoteCounts={lowBuy:0,lowSell:0,highBuy:0,highSell:0};let production=0,consumption=0;
 for(let day=0;day<coverage.periodDays;day++){
  const f=economy.supply(pid,id,day),q=E.marketState({day},id,pid);production+=f.production;consumption+=f.consumption;if(distributions)for(const side of ['buy','sell'])distributions[side].set(q[side],(distributions[side].get(q[side])||0)+1);
  for(const [field,quote] of [['lowBuy','buy'],['lowSell','sell'],['highBuy','buy'],['highSell','sell']]){const value=q[quote];if(field.startsWith('low')?value<bounds[field]:value>bounds[field]){bounds[field]=value;witnessDays[field]=day;quoteCounts[field]=1;}else if(value===bounds[field])quoteCounts[field]++;}
  for(const cycle of coverage.verifiedCycles){const later=E.marketState({day:day+coverage.periodDays*cycle},id,pid);if(q.buy!==later.buy||q.sell!==later.sell)throw Error('Pricing does not repeat over the derived daily cycle: '+pid+'/'+id+'/'+day);}
 }
 return {...bounds,...(distributions?{histograms:{buy:[...distributions.buy],sell:[...distributions.sell]}}:{}),quoteCounts,phaseCount:coverage.periodDays,production:production/coverage.periodDays,consumption:consumption/coverage.periodDays,net:(production-consumption)/coverage.periodDays,witnessDays};
}
module.exports={cycleFor,boundsFor};
