'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{smoothMasses,curveGeometry,render}=require('../Local/goods-catalogue/distribution-view.js');
const data=JSON.parse(fs.readFileSync(process.argv[2]||'Build/GoodsDistributionReview/data.json')),checks=[];
for(const [item,groups] of Object.entries(data.quotePairOutcomes))for(const group of groups)for(const unit of ['credits','percent']){if(!group.distribution)continue;const d=group.distribution[unit],before=JSON.stringify(d),s=smoothMasses(d),g=curveGeometry(d);assert.equal(JSON.stringify(d),before);assert(s.every(v=>v>=0&&Number.isFinite(v)));assert(Math.abs(s.reduce((n,v)=>n+v,0)-1)<1e-12);const step=(d.high-d.low)/s.length;for(let i=0;i<s.length;i++)if(d.low+(i+1)*step<d.minimum||d.low+i*step>d.maximum)assert.equal(s[i],0);
 const roughness=a=>a.slice(2).reduce((n,_,i)=>n+Math.abs(a[i+2]-2*a[i+1]+a[i]),0);assert(roughness(s)<=roughness(d.masses)+1e-10);
 for(let i=0;i<=1000;i++){const x=d.low+(d.high-d.low)*i/1000,y=g.y(x);assert(Number.isFinite(y)&&y>=7-1e-8&&y<=48+1e-8,'curve overshoot');}
 assert(g.path.includes(' C'));assert(!/NaN|Infinity/.test(render(group.distribution,unit==='percent',item)));checks.push({item,unit,rawRoughness:roughness(d.masses),smoothedRoughness:roughness(s)});
}
const constant={mean:5,median:5,standardDeviation:0,minimum:5,maximum:5,low:4,high:6,masses:[0,1,0]},c=curveGeometry(constant);assert.equal(c.y(5),7);assert(!c.path.includes('NaN'));
fs.writeFileSync('Build/GoodsSmoothReview/smoothing-verification.json',JSON.stringify({passed:true,populations:checks.length,checks:['unchanged statistical metadata','probability mass conserved','observed support preserved','nonnegative density','reduced bin roughness','bounded cubic interpolation','constant population'],examples:checks.slice(0,4)},null,2));console.log('PASS mass conservation, lower roughness, unchanged data and no curve overshoot across '+checks.length+' distributions.');
