'use strict';
// Read-only, on-demand price inspection. Quotes always come from the game engine.
(function(root){
 function inspect(E,s,id){
  const q=E.marketState(s,id),restricted=!E.goods.some(g=>g.id===id);
  if(restricted)return {restricted:true,quote:q,available:q.stock,buyerAllowance:q.demand,points:[]};
  const stock=E.marketStock(s,id,s.location,false),key=s.location+':'+id;
  // A transient single-entry reserve view is sufficient for marketState; it is
  // never transacted, validated as a voyage, or written to the save/ledger.
  const at=quantity=>E.marketState({...s,exchangeStock:{version:2,plan:51,day:s.day,entries:{[key]:{day:s.day,quantity}}}},id);
  let forecast=null;if(s.day<365249){const current=s.exchangeStock?s:{...s,exchangeStock:E.marketEconomy.createNetwork(s.day)},next=E.marketStock(current,id,s.location,true);forecast={day:s.day+1,production:next.production,consumption:next.consumption,shipments:next.networkFlow,quantity:stock.quantity+next.production-next.consumption+next.networkFlow};}
  const points=Array.from({length:129},(_,i)=>{const quantity=stock.capacity*i/128;return {quantity,...at(quantity)};});
  return {restricted:false,quote:q,...stock,forecast,points};
 }
 const api=Object.freeze({inspect});if(typeof module!=='undefined')module.exports=api;else root.SpacetraderExchangePricing=api;
})(globalThis);
