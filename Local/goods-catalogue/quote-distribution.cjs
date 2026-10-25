'use strict';
// Weighted population statistics and CDF bins for independent exchange quote pairs.
// Histograms are sorted [price, frequency] arrays; no Cartesian pair allocation.
function distribution(buys,sells,binCount=256){
 const total=a=>a.reduce((s,v)=>s+v[1],0),nb=total(buys),ns=total(sells),pairs=nb*ns;if(!pairs)return null;
 const mean=(a,f)=>a.reduce((s,[p,n])=>s+f(p)*n,0)/total(a),mb=mean(buys,x=>x),ms=mean(sells,x=>x),mi=mean(buys,x=>1/x),vb=mean(buys,x=>(x-mb)**2),vs=mean(sells,x=>(x-ms)**2),vi=mean(buys,x=>(1/x-mi)**2),ei2=mean(buys,x=>1/(x*x));
 function metric(percent){
  const minimum=percent?100*(sells[0][0]/buys.at(-1)[0]-1):sells[0][0]-buys.at(-1)[0],maximum=percent?100*(sells.at(-1)[0]/buys[0][0]-1):sells.at(-1)[0]-buys[0][0];
  const mu=percent?100*(ms*mi-1):ms-mb,sigma=minimum===maximum?0:Math.sqrt(Math.max(0,percent?10000*(vs*ei2+ms*ms*vi):vb+vs));
  function cdf(value){if(value<minimum)return 0;if(value>=maximum)return pairs;let j=0,prefix=0,count=0;for(const [buy,n] of buys){const cap=percent?buy*(1+value/100):buy+value;while(j<sells.length&&sells[j][0]<=cap){prefix+=sells[j][1];j++;}count+=n*prefix;}return count;}
  function quantile(rank){if(minimum===maximum)return minimum;let lo=minimum,hi=maximum;if(percent){for(let k=0;k<56&&hi>lo;k++){const mid=(lo+hi)/2;if(mid===lo||mid===hi)break;if(cdf(mid)>=rank)hi=mid;else lo=mid;}return hi;}
   while(lo<hi){const mid=Math.floor((lo+hi)/2);if(cdf(mid)>=rank)hi=mid;else lo=mid+1;}return lo;
  }
  const median=(quantile(Math.floor((pairs+1)/2))+quantile(Math.floor((pairs+2)/2)))/2;
  let low=Math.min(minimum,mu-3*sigma),high=Math.max(maximum,mu+3*sigma);if(high-low<1e-12){const pad=Math.max(1,Math.abs(mu)*.05);low=mu-pad;high=mu+pad;}
  const width=(high-low)/binCount,masses=[];let previous=0;for(let i=1;i<=binCount;i++){const count=i===binCount?pairs:cdf(low+width*i);masses.push((count-previous)/pairs);previous=count;}
  return {mean:mu,median,standardDeviation:sigma,minimum,maximum,low,high,masses};
 }
 return {credits:metric(false),percent:metric(true)};
}
module.exports={distribution};
