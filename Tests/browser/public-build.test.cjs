'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'Web/.vercel/output'),base=path.join(out,'static');
const read=p=>fs.readFileSync(path.join(base,p),'utf8'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(fs.readFileSync(path.join(out,'build-manifest.json'),'utf8'));
assert.equal(manifest.mode,'public-browser-with-account-saves');
assert.equal(sha(fs.readFileSync(path.join(root,'Browser/engine.js'))),manifest.engineSHA256);
assert.equal(sha(fs.readFileSync(path.join(base,'play/engine.js'))),manifest.engineSHA256);
for(const [name,digest] of Object.entries(manifest.files)){
 assert(!/(?:^|\/)(?:\.env|voyage\.json|actions\.sqlite3|checkpoint\.json|slot[123]\.json|Research|Build)(?:\/|$)/i.test(name),name);
 assert.equal(sha(fs.readFileSync(path.join(base,name))),digest,name);
}
assert.equal(sha(fs.readFileSync(path.join(out,'functions/api/index.func/index.cjs'))),manifest.accountFunctionSHA256);
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
assert(read('play/app.js').includes('Sign in to continue across devices.'));
const app=read('play/app.js'),guard=app.slice(app.indexOf('function render(){'),app.indexOf('\n const p=E.port(state.location)',app.indexOf('function render(){')));
let scheduled=0;const target={innerHTML:'unchanged'},context={blocked:false,state:{profile:{created:false,name:'Alex Rivera'}},$:()=>target,scheduleMainModal:()=>scheduled++};
vm.createContext(context);vm.runInContext(guard+'\n}',context);context.render();
assert(target.innerHTML.includes('charter-welcome'));assert(!target.innerHTML.includes('Alex Rivera'));assert(!target.innerHTML.includes('<aside'));assert.equal(scheduled,1);
const home=read('index.html');
assert(!home.includes('http-equiv="refresh"'));assert(!/<script(?! type="application\/ld\+json")/.test(home));assert(home.includes('href="/play/"'));
for(const target of ['guide','characters','ships','goods'])assert(home.includes('href="/'+target+'/'),target);
assert(read('play/index.html').includes('onboarding.css?v='));
assert(read('play/onboarding.css').includes('min-width:0'));
assert(read('play/index.html').includes('play-viewport.css?v='));
assert.equal(read('play/play-viewport.css'),fs.readFileSync(path.join(root,'Web/play-viewport.css'),'utf8'));
const playIndex=read('play/index.html');
assert(playIndex.indexOf('browser-ledger.js?v=')<playIndex.indexOf('browser-save-safety.js?v='));
assert(playIndex.indexOf('browser-save-safety.js?v=')<playIndex.indexOf('app.js?v='));
assert(playIndex.indexOf('browser-save-safety.js?v=')<playIndex.indexOf('account-client.js?v='));
assert(playIndex.indexOf('account-client.js?v=')<playIndex.indexOf('app.js?v='));
assert(app.includes('spacetraderAccountMenuHTML'));
assert(configuredAccountFunction());
assert.equal(read('play/browser-save-safety.js'),fs.readFileSync(path.join(root,'Web/browser-save-safety.js'),'utf8'));
assert(playIndex.includes('play-layout.js?v='));
assert(playIndex.indexOf('play-layout.js?v=')<playIndex.indexOf('app.js?v='));
assert(playIndex.includes('viewport-fit=cover'));
assert(!playIndex.includes('user-scalable=no'));
assert.equal(read('play/play-layout.js'),fs.readFileSync(path.join(root,'Web/play-layout.js'),'utf8'));
assert(app.includes('SpacetraderPlayLayout.modalBounds('));
assert(app.includes("${window.spacetraderSaveHealthHTML?.()||''}<div class=\"checkpoint-slots\">"));
new vm.Script(app,{filename:'public-app.js'});
assert(!fs.readFileSync(path.join(root,'Browser/index.html'),'utf8').includes('play-viewport.css'));
assert(read('characters/catalogue.js').includes("'/characters/'+P.source(v)"));
assert(!read('goods/catalogue.js').includes("fetch('/goods/data/goods.json')"));
assert(read('goods/catalogue.js').includes('goodsData.load()'));
assert(read('goods/curves.js').includes("fetch('/goods/data/bonding-curves.json')"));
assert.equal(read('goods/stock-pricing.js'),fs.readFileSync(path.join(root,'Balance/approved-v95/stock-pricing.js'),'utf8'));
const config=JSON.parse(fs.readFileSync(path.join(out,'config.json'),'utf8'));
assert.equal(config.version,3);assert(config.routes.some(r=>r.src==='/goods/curves'&&r.dest==='/goods/curves.html'));
assert(!config.routes.some(r=>r.src==='/'&&r.headers?.Location));
console.log('PASS public static build: '+Object.keys(manifest.files).length+' verified files; unchanged engine and approved pricing; no save/service payloads; public reference routes.');
function configuredAccountFunction(){const config=JSON.parse(fs.readFileSync(path.join(out,'functions/api/index.func/.vc-config.json'),'utf8'));return config.runtime==='nodejs24.x'&&config.handler==='index.cjs';}
