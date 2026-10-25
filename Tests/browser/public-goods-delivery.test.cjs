'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),base=path.join(root,'Web/.vercel/output/static'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const delivery=JSON.parse(fs.readFileSync(path.join(root,'Web/.vercel/output/catalogue-delivery.json'),'utf8'));
const original=JSON.parse(fs.readFileSync(path.join(root,'Balance/approved-v95/goods.json'),'utf8')),encoded=JSON.parse(read(delivery.indexURL.slice(1)));
const codec=require('../../Web/goods-codec.js'),models=require('../../Local/goods-catalogue/goods-view.js'),normalize=x=>JSON.parse(JSON.stringify(x));
const decoded=codec.decode(encoded);assert.deepEqual(decoded,original.rows);assert(delivery.indexBytes<fs.statSync(path.join(root,'Balance/approved-v95/goods.json')).size*.1);
assert.throws(()=>codec.decode({...encoded,rowCount:-1}));assert.throws(()=>codec.decode({...encoded,indexes:[[-2],...encoded.indexes.slice(1)]}));
assert.throws(()=>codec.decode({...encoded,columns:['__proto__',...encoded.columns.slice(1)]}));
let checks=1;console.log('PASS lossless decoding of '+decoded.length+' complete rows; >90% smaller initial data; invalid dictionaries rejected.');

function harness(){
 const calls=[],workers=[];let failNext=false;
 const fetch=async url=>{const file=String(url).split('?')[0];calls.push(file);if(failNext&&file.includes('/statistics.')){failNext=false;return {ok:false};}return {ok:true,json:async()=>JSON.parse(read(file.slice(1)))};};
 class FakeWorker{
  constructor(){this.dead=false;workers.push(this);const c={fetch,AbortController,setTimeout,clearTimeout,console};c.self=c;c.globalThis=c;c.postMessage=data=>{if(!this.dead)this.onmessage?.({data:normalize(data)});};this.context=vm.createContext(c);c.importScripts=(...names)=>names.forEach(n=>vm.runInContext(read('goods/'+n.replace('./','')),this.context));vm.runInContext(read('goods/goods-worker.js'),this.context);}
  postMessage(data){setImmediate(()=>{if(!this.dead)this.context.onmessage({data:normalize(data)});});}
  terminate(){this.dead=true;}
 }
 const c={fetch,Worker:FakeWorker,SpacetraderGoodsCodec:codec,setTimeout,clearTimeout};c.globalThis=c;vm.createContext(c);vm.runInContext(read('goods/goods-loader.js'),c);
 const loader=c.SpacetraderCatalogueData.create(delivery.indexURL,'/goods/goods-worker.js');
 return {loader,calls,workers,fail:()=>{failNext=true;}};
}
const expected=rows=>models.aggregateItems(rows,original.quotePairOutcomes,original.dailyPriceSnapshots);
async function main(){
 const h=harness();const [first,again]=await Promise.all([h.loader.load(),h.loader.load()]);assert.strictEqual(first,again);assert.deepEqual(normalize(first.rows),original.rows);assert.equal(h.calls.length,1);assert.equal(h.workers.length,0);
 console.log('PASS ordinary browsing loads one compact file and no worker or statistical chunks.');checks++;
 const water=decoded.filter(r=>r.item==='water');
 const [a,b]=await Promise.all([h.loader.summary(water),h.loader.summary(water)]);assert.deepEqual(a,normalize(expected(water)));assert.deepEqual(a,b);assert.equal(h.workers.length,1);assert.equal(h.calls.filter(c=>c.includes('/statistics.')).length,1);
 assert.equal(await exportCSV(a,true),await exportCSV(expected(water),true));assert.equal(await exportCSV(first.rows,false),await exportCSV(original.rows,false));
 console.log('PASS concurrent Water ice summaries share one chunk and exactly match approved prices, frequencies and distributions.');checks++;
 const selections=[decoded.filter(r=>r.category==='Exchange goods'),decoded.filter(r=>r.category==='Exchange goods'&&r.gated),decoded.filter(r=>r.category==='Exchange goods'&&r.scan==='Yes'),decoded.filter(r=>r.availability==='Sell only'),decoded.filter(r=>r.category==='Supplies'),decoded,[]];
 for(const rows of selections)assert.deepEqual(await h.loader.summary(rows),normalize(expected(rows)));
 assert.equal(h.calls.filter(c=>c.includes('/statistics.')).length,delivery.statistics.length);
 console.log('PASS full, gated, restricted, availability, supplies, all-item and empty summaries match the approved model exactly; cached chunks are reused.');checks++;
 const f=harness();await f.loader.load();f.fail();await assert.rejects(f.loader.summary(water),/Retry/);assert.deepEqual(await f.loader.summary(water),normalize(expected(water)));assert.equal(f.calls.filter(c=>c.includes('/statistics.')).length,2);
 console.log('PASS a failed statistics download reports an error and retries successfully without replacing catalogue data.');checks++;
 await staleFilter();
 console.log(checks+' delivery/regression groups passed.');
}

async function staleFilter(){
 const source=read('goods/catalogue.js'),start=source.indexOf('async function filter(){'),end=source.indexOf('\nfunction columnsForView()',start),elements=new Map(),node=id=>{if(!elements.has(id))elements.set(id,{value:'',hidden:true,disabled:false,textContent:'',attributes:{},replaceChildren(){},parentElement:{classList:{toggle(){}}},classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=v;}});return elements.get(id);};
 node('view').value='items';let resolveSummary;const renders=[];
 const c={summaryRequest:0,summaryView:()=>node('view').value==='items',percentFirst:()=>false,returnKeys:[],advancedFilters:['flow','rate','unlock','scan','availability'],data:original.rows.filter(r=>r.item==='water'),visible:[],sort:'product',direction:1,renderFrame:0,renderToken:0,cancelAnimationFrame(){},renderColumns(){},hideCurveTooltip(){},columnsForView:()=>[{key:'product'}],syncURL(){},render(){renders.push(c.visible.map(r=>r.key||r.item));},$:node,goodsData:{summary:()=>new Promise(resolve=>resolveSummary=resolve)}};
 vm.createContext(c);vm.runInContext(source.slice(start,end),c);
 const old=c.filter();node('view').value='stations';await c.filter();const latest=normalize(renders);resolveSummary([{item:'stale'}]);await old;assert.deepEqual(normalize(renders),latest);assert(!c.visible.some(r=>r.item==='stale'));
 node('view').value='items';c.goodsData.summary=async()=>{throw Error('Retry to continue.');};await c.filter();assert.equal(node('summary-retry').hidden,false);assert.equal(node('error').hidden,false);assert.equal(node('results').attributes['aria-busy'],'false');assert.equal(node('export').disabled,true);
 c.goodsData.summary=async()=>[];await c.filter();assert.equal(node('summary-retry').hidden,true);assert.equal(node('error').hidden,true);assert.equal(node('export').disabled,false);
 console.log('PASS rapid mode changes discard stale worker results; failed summaries disable stale exports and expose a working retry.');checks++;
}

async function exportCSV(rows,summary){
 const source=read('goods/catalogue.js'),start=source.indexOf("$('export').onclick="),end=source.indexOf('\n(async()=>',start),button={};let blob;
 const c={$:()=>button,visible:rows,summaryView:()=>summary,stationTradeLabel:r=>r.availability,Blob,URL:{createObjectURL:b=>{blob=b;return 'blob:test';},revokeObjectURL(){}},document:{createElement:()=>({click(){}})},setTimeout:fn=>fn()};vm.createContext(c);vm.runInContext(source.slice(start,end),c);button.onclick();return blob.text();
}
main().catch(error=>{console.error(error);process.exitCode=1;});
