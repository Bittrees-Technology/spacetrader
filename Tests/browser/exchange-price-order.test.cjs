"use strict";
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),E=require('../../Browser/engine.js'),view=require('../../Local/goods-catalogue/goods-view.js');
const app=fs.readFileSync('Browser/app.js','utf8'),start=app.indexOf('const marketBuyLows='),end=app.indexOf('function marketRows(){',start),ctx={};vm.createContext(ctx);vm.runInContext(app.slice(start,end),ctx);
const selector=JSON.parse(fs.readFileSync('Balance/current.json')),approved=JSON.parse(fs.readFileSync('Balance/'+selector.manifest.replace('manifest.json','goods.json'))),ids=new Set(E.goods.map(g=>g.id)),items=view.aggregateItems(approved.rows).filter(r=>ids.has(r.item)).sort((a,b)=>a.lowBuy-b.lowBuy||a.item.localeCompare(b.item));
for(const r of items)assert.equal(ctx.marketBuyLow(r.item),r.lowBuy,r.item);
assert.deepEqual(items.slice(0,11).map(r=>r.product),['Water ice','Graded mineral aggregate','Breathing oxygen','Habitat textiles','Carbon feedstock','Food','Construction glass','Industrial polymers','Refined metals','Liquid hydrogen','Pressure seals']);
const expected=items.map(r=>r.item);for(const p of E.world.ports){
 const input=items.map(r=>({id:r.item,owned:7,stock:11})).reverse(),before=JSON.stringify(input),sorted=ctx.orderExchangeGoods(input);
 assert.equal(JSON.stringify(input),before);assert.deepEqual(Array.from(sorted,r=>r.id),expected,p.id);
 const offered=E.marketSnapshot({...E.fresh(),location:p.id}).rows.filter(r=>r.canBuy&&r.stock>0);const actual=Array.from(ctx.orderExchangeGoods(offered),r=>r.id);assert.deepEqual(actual,expected.filter(id=>offered.some(r=>r.id===id)),p.id+' filtered offers');
}
assert(app.includes('legal=orderExchangeGoods(E.marketSnapshot(state,1,delivery,source).rows.filter(shown))'));
console.log('PASS all 32 commodity buy lows and order match the actual dashboard Item summary aggregation');
console.log('PASS shared global order across 26 stations, stock/access filtering, stable ties and non-mutating input');
