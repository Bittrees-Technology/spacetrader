'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),P=require('../../Browser/stock-pricing'),D=require('../../Local/goods-catalogue/curve-domain');
const pointer=JSON.parse(fs.readFileSync('Balance/current.json')),base=path.join('Balance',path.dirname(pointer.manifest)),data=JSON.parse(fs.readFileSync(process.env.SPACETRADER_CURVE_REFERENCE||path.join(base,'bonding-curves.json'))),old=JSON.parse(fs.readFileSync('Balance/approved-v83/bonding-curves.json'));
assert.deepEqual(data.goods,old.goods);assert.deepEqual(data.stations,old.stations);assert.deepEqual(data.ships,old.ships);assert.deepEqual(data.rules,P.rules);assert.equal(data.goods.length,64);assert.equal(data.stations.length,26);
let curves=0,quotes=0;
for(const row of data.rows)for(const sample of row.samples){
 assert.equal(sample.stock,row.capacity/2);assert.equal(sample.depth,row.capacity/2);const range=D.domain(sample,row.capacity,P.rules);assert.deepEqual(range,{lo:0,hi:row.capacity});
 const low=P.quote(sample.mid,sample.spread,sample.stock,sample.depth,0),high=P.quote(sample.mid,sample.spread,sample.stock,sample.depth,row.capacity);
 const outsideLow=P.quote(sample.mid,sample.spread,sample.stock,sample.depth,-1e6),outsideHigh=P.quote(sample.mid,sample.spread,sample.stock,sample.depth,row.capacity+1e6);assert.equal(low.price,outsideLow.price);assert.equal(high.price,outsideHigh.price);assert.equal(low.buy,outsideLow.buy);assert.equal(high.sell,outsideHigh.sell);assert(low.sell<=outsideLow.sell);assert(high.buy>=outsideHigh.buy);
 assert.equal(low.price,Math.max(5,Math.round(sample.mid*Math.exp(P.rules.maximumExponent))));assert.equal(high.price,Math.max(5,Math.round(sample.mid*Math.exp(P.rules.minimumExponent))));
 let previous=Infinity;for(let i=0;i<=512;i++){const q=P.quote(sample.mid,sample.spread,sample.stock,sample.depth,row.capacity*i/512);assert(q.buy>q.sell&&q.sell>0&&q.price<=previous);previous=q.price;quotes++;}
 for(const starting of [0,sample.stock,row.capacity])for(const buying of [true,false]){const n=Math.min(32,Math.max(0,Math.floor(buying?starting:row.capacity-starting))),after=starting+(buying?-n:n);assert(after>=0&&after<=row.capacity+1e-8);assert(Number.isFinite(P.order(sample.mid,sample.spread,sample.stock,sample.depth,starting,n,buying)));}
 curves++;
}
const js=fs.readFileSync('Local/goods-catalogue/curves.js','utf8');for(const unsafe of ['/api/voyage','/api/ledger','localStorage','indexedDB'])assert(!js.includes(unsafe));for(const id of ['starting-stock','export-curve','ship.usableTonnes'])assert(js.includes(id));
console.log(JSON.stringify({passed:true,goods:64,stations:26,curves,quotes,midpointFraction:.5,physicalRange:true,identitiesPackingShipsUnchanged:true,playerDataRead:false}));
