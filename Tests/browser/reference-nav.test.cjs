'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),{chooseSection}=require(path.join(root,'Web/reference-nav.js'));
const rows=[{id:'a',top:100},{id:'b',top:600},{id:'c',top:1100}];
assert.equal(chooseSection([],200),null);
assert.equal(chooseSection(rows,0).id,'a');
assert.equal(chooseSection(rows,599).id,'a');
assert.equal(chooseSection(rows,600).id,'b');
assert.equal(chooseSection(rows,900).id,'b');
assert.equal(chooseSection(rows,1200).id,'c');
assert.equal(chooseSection(rows,500,true).id,'c');
assert.equal(chooseSection(rows.slice(1),400).id,'b');
const read=name=>fs.readFileSync(path.join(root,'Web/.vercel/output/static',name),'utf8');
for(const page of ['guide/index.html','goods/formulas.html','goods/mechanics.html']){
 assert(read(page).includes('/reference-nav.js?v='));assert(read(page).includes('/reference-nav.css?v='));
}
assert(!read('goods/formulas.html').includes('bank-rate-rows'));
assert(!read('goods/formulas.html').includes('Station / sample day'));
assert(!read('goods/formulas.js').includes('bank-rate-rows'));
assert(read('goods/formulas.html').includes('id="banking"'));
assert(read('goods/formulas.html').includes('Accumulation at daily quoted rates'));
console.log('PASS reference navigation: section boundaries, upward/bottom selection, all three sidebars, no Section 14 sample table.');
