'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'Web/.vercel/output'),base=path.join(out,'static');
const read=p=>fs.readFileSync(path.join(base,p),'utf8'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(fs.readFileSync(path.join(out,'build-manifest.json'),'utf8'));
assert.equal(manifest.mode,'public-guest-static');
assert.equal(sha(fs.readFileSync(path.join(root,'Browser/engine.js'))),manifest.engineSHA256);
assert.equal(sha(fs.readFileSync(path.join(base,'play/engine.js'))),manifest.engineSHA256);
for(const [name,digest] of Object.entries(manifest.files)){
 assert(!/(?:^|\/)(?:\.env|voyage\.json|actions\.sqlite3|checkpoint\.json|slot[123]\.json|Research|Build)(?:\/|$)/i.test(name),name);
 assert.equal(sha(fs.readFileSync(path.join(base,name))),digest,name);
}
assert.equal(fs.existsSync(path.join(out,'functions')),false);
for(const section of ['guide','characters','ships','goods']){
 const html=read(section+'/index.html');
 assert(!/127\.0\.0\.1|localhost/.test(html),section);
 for(const target of ['play','guide','characters','ships','goods'])assert(html.includes('href="/'+target+'/'),section+' to '+target);
 for(const [,url] of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  if(!url.startsWith('/'))continue;
  const clean=url.split(/[?#]/)[0];
  assert(fs.existsSync(path.join(base,clean))||fs.existsSync(path.join(base,clean+'.html')),section+': '+url);
 }
}
assert(read('play/app.js').includes("window.open('/guide/'"));
assert(read('play/app.js').includes('Progress saves in this browser on this device.'));
assert(read('characters/catalogue.js').includes("'/characters/'+P.source(v)"));
assert(read('goods/catalogue.js').includes("fetch('/goods/data/goods.json')"));
assert(read('goods/curves.js').includes("fetch('/goods/data/bonding-curves.json')"));
assert.equal(read('goods/stock-pricing.js'),fs.readFileSync(path.join(root,'Balance/approved-v95/stock-pricing.js'),'utf8'));
const config=JSON.parse(fs.readFileSync(path.join(out,'config.json'),'utf8'));
assert.equal(config.version,3);assert(config.routes.some(r=>r.src==='/goods/curves'&&r.dest==='/goods/curves.html'));
console.log('PASS public static build: '+Object.keys(manifest.files).length+' verified files; unchanged engine and approved pricing; no save/service payloads; public reference routes.');
