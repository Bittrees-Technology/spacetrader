'use strict';
// Shared physical-stock bonding curve for game orders and public reference previews.
(function(root){
 const rules=Object.freeze({curve:'storage-centered-s',centerFraction:.5,steepness:2,spreads:Object.freeze({Limited:.01,Steady:.005,Plentiful:.0025}),discreetSpreads:Object.freeze({Limited:.02,Steady:.01,Plentiful:.00375}),travellerMargin:.03,impact:.7,minimumDepth:128,maximumDepth:1000000000,turnoverDays:14,minimumExponent:-.085,maximumExponent:.085,lotTonnes:.25});
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function depth(production,consumption,scale=1){return clamp(Math.max(production,consumption)*scale*rules.turnoverDays,rules.minimumDepth,rules.maximumDepth);}
 function priceFactor(fill){
  const low=Math.exp(rules.minimumExponent),high=Math.exp(rules.maximumExponent),position=1-2*clamp(fill,0,1),weight=(1+Math.tanh(rules.steepness*position)/Math.tanh(rules.steepness))/2;
  return low+(high-low)*weight;
 }
 function quote(basePrice,spread,baseline,marketDepth,quantity){
  const priceAt=q=>Math.max(5,Math.round(basePrice*priceFactor(.5+(q-baseline)/(2*marketDepth))));
  return {price:priceAt(quantity),buy:Math.ceil(priceAt(quantity-.5)*(1+spread)),sell:Math.max(1,Math.floor(priceAt(quantity+.5)*(1-spread))),sellAskCap:Math.ceil(priceAt(quantity+.5)*(1+spread))-1};
 }
 function order(basePrice,spread,baseline,marketDepth,quantity,units,buying){
  if(!Number.isSafeInteger(units)||units<0||units>32000)throw Error('Choose a whole order of at most 32,000 lots.');
  let total=0;for(let i=0;i<units;i++)total+=quote(basePrice,spread,baseline,marketDepth,quantity+(buying?-i:i))[buying?'buy':'sell'];return total;
 }
 const api=Object.freeze({rules,depth,priceFactor,quote,order});if(typeof module!=='undefined')module.exports=api;else root.SpacetraderStockPricing=api;
})(globalThis);
