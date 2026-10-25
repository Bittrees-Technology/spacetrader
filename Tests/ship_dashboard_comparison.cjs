'use strict';
// Exercise the catalogue's actual comparison controller with its frozen pricing
// and fitting rules. Browser checks separately cover layout, focus and controls.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),M=require('../Local/ship-catalogue/catalogue-model');
const nodes=new Map(),frames=[];
function node(id){if(!nodes.has(id))nodes.set(id,{value:'',max:192,disabled:false,hidden:false,dataset:{},innerHTML:'',textContent:'',isConnected:true,classList:{toggle(){}},querySelectorAll(){return[];}});return nodes.get(id);}
const context=vm.createContext({SpacetraderShips:M,document:{getElementById:node,querySelector:()=>node('main'),activeElement:null},IntersectionObserver:class{disconnect(){}},location:{search:'',href:'http://127.0.0.1:8876/'},history:{replaceState(a,b,url){node('url').value=url;}},URLSearchParams,requestAnimationFrame:fn=>{frames.push(fn);return frames.length;},SpacetraderShipRenderer:{thumbnail(){return 'data:image/png;base64,test';}},console});
let source=fs.readFileSync('Local/ship-catalogue/catalogue.js','utf8');source=source.slice(0,source.indexOf('for(const hull of M.hulls)'));
vm.runInContext(source,context);const run=s=>vm.runInContext(s,context);
node('comparisonRounds').value=9999;node('comparisonOrdnance').max=32;node('comparisonOrdnance').value=-8;
assert.equal(JSON.stringify(run('comparisonConditions()')),JSON.stringify({ammo:192,ordnanceAmmo:0}));
run("view='balance';savedLoadouts=[{config:{shipID:'osprey',upgrades:M.empty()},conditions:{ammo:48,ordnanceAmmo:8}},{config:{shipID:'kestrel',upgrades:M.empty()},conditions:{ammo:0,ordnanceAmmo:0}}];refreshComparisonSide(0,true);refreshComparisonSide(1,true);");
const untouched=run('JSON.stringify(savedLoadouts[1])');
const beforeFrames=frames.length;
run('savedLoadouts[0].conditions.ammo=12;refreshComparisonSide(0);');
assert.equal(frames.length,beforeFrames,'Ammo edit must reuse the ship image');
assert(node('focusedTable').innerHTML.includes('3.18 t'),'Ammo reduces hold space exactly');
assert(node('compare-fit-0').textContent.includes('12 trade units'),'Usable trade units round down');
assert.equal(run('JSON.stringify(savedLoadouts[1])'),untouched);
let checked=0;
for(const h of M.hulls)for(const m of M.modules)for(let level=0;level<=3;level++){
 context.testHull=h.id;context.testModule=m.id;context.testLevel=level;
 run('savedLoadouts[0]={config:{shipID:testHull,upgrades:{...M.empty(),[testModule]:testLevel}},conditions:{ammo:9999,ordnanceAmmo:9999}};refreshComparisonSide(0,true);');
 const x=JSON.parse(run('JSON.stringify(savedLoadouts[0])')),expected=M.stats(x.config,x.conditions),fits=M.weaponFits(x.config);
 assert.equal(x.conditions.ammo,fits[1].magazine);assert.equal(x.conditions.ordnanceAmmo,fits[2].magazine);
 assert.equal(node('compare-0-ammo').max,fits[1].magazine);assert.equal(node('compare-0-ammo').disabled,!fits[1].magazine);
 assert(node('compare-totals-0').innerHTML.includes(expected.totalCost.toLocaleString('en-US')+' cr'));
 assert(node('compare-totals-0').innerHTML.includes(expected.cargoSpace.availableTonnes.toLocaleString('en-US',{maximumFractionDigits:3})+' t'));
 assert.equal(run('JSON.stringify(savedLoadouts[1])'),untouched,'Other side remains independent');checked++;
}
run("savedLoadouts[0]={config:{shipID:'swift',upgrades:{...M.empty(),weapons:3,ordnance:3}},conditions:{ammo:192,ordnanceAmmo:32}};refreshComparisonSide(0);savedLoadouts[0].config.upgrades=M.empty();refreshComparisonSide(0);");
assert.equal(run('savedLoadouts[0].conditions.ammo'),0);assert.equal(run('savedLoadouts[0].conditions.ordnanceAmmo'),0);
assert.equal(node('compare-0-ammo').disabled,true);assert.equal(node('compare-0-ordnanceAmmo').disabled,true);
// URL carries both independent configurations and actual carried ammunition.
run("focusedComparison=true;updateURL();");const url=new URL(node('url').value,'http://127.0.0.1:8876/');assert.equal(url.searchParams.get('loadoutA'),'SWIFT-000000000');assert.equal(url.searchParams.get('loadoutB'),'KESTREL-000000000');assert.equal(url.searchParams.get('comparing'),'1');
// Catalogue filtering still uses the approved model, including exact IDs.
for(const h of M.hulls){assert.equal(M.selection({hull:h.id}).ships.length,1);assert.equal(M.selection({search:h.name}).ships.some(s=>s.id===h.id),true);for(const m of M.modules){const f={hull:h.id,[m.id]:'2'},selection=M.selection(f);assert.equal(M.at(selection,0).upgrades[m.id],2);}}
assert.equal(M.selection({search:'does-not-exist'}).total,0);assert.equal(M.selection({search:'OSPREY-000003000',laser:'0'}).total,0);
console.log(`PASS ${checked} hull/fitting/level controller states; independent updates, ammunition clamps, cargo, costs, no ammo image rerender, URLs and filters`);
