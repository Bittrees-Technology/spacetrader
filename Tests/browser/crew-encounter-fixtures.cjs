'use strict';
// Find an actual visiting recruit in a synthetic voyage; never assume permanent stock.
module.exports=function seek(E,s,predicate=()=>true,days=12000){const end=Math.min(365249,s.day+days);for(;s.day<=end;s.day++){const c=E.crewOverview(s).candidates.find(predicate);if(c)return {s,c};}throw Error('No matching synthetic traveller in '+days+' ship-days.');};
