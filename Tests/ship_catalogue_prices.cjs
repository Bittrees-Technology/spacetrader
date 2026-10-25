'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),M=require('../Local/ship-catalogue/catalogue-model.js'),E=require('../Browser/engine.js'),S=require('../Local/ship-catalogue/ship-specs.js');
const swift=M.hulls.find(h=>h.id==='swift'),kestrel=M.hulls.find(h=>h.id==='kestrel');
assert.equal(swift.price,16800);assert.equal(kestrel.price,21600);assert.equal(M.hulls[0].id,'swift');assert(swift.price<kestrel.price);
assert.deepEqual(S.priceOverrides,{swift:16800,peregrine:200000});assert.equal(M.hulls.find(h=>h.id==='peregrine').price,200000);
for(const hull of M.hulls)assert.equal(hull.price,E.shipCatalog().find(h=>h.id===hull.id).price,'Frozen hull price matches approved game');
const prices=M.modules.map(m=>{
 const current=M.fittingCosts('swift',m.id),before=[1,2,4].map(n=>Math.round(31200*m.rate*.005*n));
 assert.equal(current[1],current[0]*2);assert.equal(current[2],current[0]*4);assert(current.every((price,i)=>price<before[i]));
 return {fitting:m.id,before,current};
});
const max=Object.fromEntries(M.modules.map(m=>[m.id,3]));assert.equal(M.stats({shipID:'swift',upgrades:max}).equipment,24696);
const selection=M.selection({},true);assert.equal(selection.total,5242880);let previous=-1;
for(const group of selection.groups){assert(group.price>=previous);previous=group.price;assert.equal(M.stats(M.at(selection,group.start)).totalCost,group.price);assert.equal(M.stats(M.at(selection,group.end-1)).totalCost,group.price);}
assert.equal(M.at(selection,0).shipID,'swift');
fs.writeFileSync(new URL('../Build/swift-price-rebalance.json','file://'+__filename),JSON.stringify({hull:swift.price,kestrel:kestrel.price,maximumFittings:24696,totalMaximum:41496,prices,configurationCount:selection.total,priceBands:selection.groups.length},null,2)+'\n');
console.log('Passed: Swift hull/fitting prices, reviewed Peregrine price and unchanged other hulls, ascending catalogue and exact configuration price bands.');
