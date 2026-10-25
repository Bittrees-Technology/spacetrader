'use strict';
// Integer lots; separate gram and litre budgets. No mutation of a ship or save.
(function(root){
 function plan(vessels,lines,{maximumNodes=5000}={}){
  const grouped=new Map();for(const l of lines){if(!Number.isSafeInteger(l.quantity)||l.quantity<0)throw Error('Invalid cargo quantity.');const prior=grouped.get(l.good);if(prior)prior.quantity+=l.quantity;else grouped.set(l.good,{...l});}
  const bins=vessels.map((v,index)=>({...v,index,grams:Math.max(0,Math.floor(v.grams+1e-6)),litres:Math.max(0,Math.floor(v.litres+1e-6)),accepts:new Set(v.accepts)}));
  const room=(v,g)=>v.accepts.has(g.good)?Math.max(0,Math.min(Math.floor(v.grams/g.grams),Math.floor(v.litres/g.litres))):0;
  const types=[...grouped.values()].filter(g=>g.quantity>0).sort((a,b)=>bins.reduce((s,v)=>s+room(v,a),0)/a.quantity-bins.reduce((s,v)=>s+room(v,b),0)/b.quantity||b.litres/b.grams-a.litres/a.grams||a.good.localeCompare(b.good));
  if(types.some(g=>!Number.isSafeInteger(g.grams)||g.grams<=0||!Number.isSafeInteger(g.litres)||g.litres<=0))throw Error('Invalid cargo package dimensions.');
  let nodes=0,limited=false;const allocations=[],failed=new Set();
  function feasible(ti){for(let i=ti;i<types.length;i++)if(bins.reduce((n,b)=>n+room(b,types[i]),0)<types[i].quantity)return false;return true;}
  function solve(ti){
   if(ti===types.length)return true;if(++nodes>maximumNodes){limited=true;return false;}if(!feasible(ti))return false;
   const g=types[ti],candidates=bins.filter(v=>room(v,g)>0).sort((a,b)=>{
    const opportunity=v=>types.slice(ti+1).reduce((n,h)=>n+(v.accepts.has(h.good)?Math.min(room(v,h),h.quantity)/Math.max(1,h.quantity):0),0);
    return opportunity(a)-opportunity(b)||(a.rank||0)-(b.rank||0)||room(b,g)-room(a,g)||a.index-b.index;
   });
   if(ti===types.length-1){let left=g.quantity;for(const b of candidates){const n=Math.min(left,room(b,g));if(n){allocations.push({index:b.index,good:g.good,units:n});left-=n;}if(!left)break;}return left===0;}
   function distribute(si,left){
    if(!left)return solve(ti+1);if(si===candidates.length||limited)return false;if(++nodes>maximumNodes){limited=true;return false;}
    const rest=candidates.slice(si+1).reduce((n,b)=>n+room(b,g),0),bin=candidates[si],max=Math.min(left,room(bin,g)),min=Math.max(0,left-rest);if(min>max)return false;
    const key=ti+':'+si+':'+left+':'+bins.map(b=>b.grams+'/'+b.litres).join(',');if(failed.has(key))return false;
    for(let n=max;n>=min;n--){
     bin.grams-=n*g.grams;bin.litres-=n*g.litres;const mark=allocations.length;if(n)allocations.push({index:bin.index,good:g.good,units:n});
     if(feasible(ti+1)&&distribute(si+1,left-n))return true;
     allocations.length=mark;bin.grams+=n*g.grams;bin.litres+=n*g.litres;if(limited)return false;
    }
    if(failed.size<5000)failed.add(key);return false;
   }
   return distribute(0,g.quantity);
  }
  const complete=solve(0);return {complete,allocations:complete?allocations:[],nodes,limited};
 }
 const api=Object.freeze({plan});if(typeof module!=='undefined')module.exports=api;else root.SpacetraderCargoPacking=api;
})(globalThis);
