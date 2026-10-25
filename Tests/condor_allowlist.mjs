import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import {createShip,disposeShip} from '../Local/ship-catalogue/ship-designs.js';
const require=createRequire(import.meta.url),M=require('../Local/ship-catalogue/catalogue-model.js');
const policy=M.carrierPolicies.condor,max=Object.fromEntries(M.modules.map(m=>[m.id,3]));
assert.deepEqual(policy.allowedShipIDs,['kestrel','swift','merlin']);
assert.equal(policy.berths,2);assert.equal(policy.baseDryMassLimit,14);
assert(Object.isFrozen(policy)&&Object.isFrozen(policy.allowedShipIDs));
const carrier=createShip({shipID:'condor',hull:100,upgrades:max}),aperture=carrier.userData.hangarClearance;
const report={scope:'Catalogue carrier approval; live game unchanged',policy,aperture,approved:[],excluded:[]};
try{
 for(const ship of M.hulls){
  if(!policy.allowedShipIDs.includes(ship.id)){
   assert.equal(M.carrierEligibility('condor',ship.id,{length:1,height:1,beam:1},aperture).allowed,false);
   report.excluded.push(ship.id);continue;
  }
  const checks=[];
  for(const upgrades of [M.empty(),max]){
   const g=createShip({shipID:ship.id,hull:100,upgrades});
   try{
    const [length,height,beam]=g.userData.dimensions,envelope={length,height,beam};
    const result=M.carrierEligibility('condor',ship.id,envelope,aperture);
    assert.equal(result.allowed,true,ship.id+': '+result.reason);
    assert.equal(M.carrierEligibility('condor',ship.id,envelope,aperture,1).allowed,true);
    assert.equal(M.carrierEligibility('condor',ship.id,envelope,aperture,2).allowed,false);
    checks.push({fittings:upgrades===max?'maximum':'factory',envelope,clearance:result.clearance});
   }finally{disposeShip(g);}
  }
  report.approved.push({shipID:ship.id,baseDryMass:ship.dryMass,checks});
 }
 assert.equal(report.excluded.length,17);
 for(const envelope of [null,{length:NaN,height:1,beam:1},{length:-1,height:1,beam:1},{...aperture},{...aperture,length:aperture.length-1}])assert.equal(M.carrierEligibility('condor','kestrel',envelope,aperture).allowed,false);
 assert.equal(M.carrierEligibility('condor','unknown',{length:1,height:1,beam:1},aperture).allowed,false);
 assert.equal(M.carrierEligibility('__proto__','swift',{length:1,height:1,beam:1},aperture).allowed,false);
 assert.equal(M.carrierEligibility('condor','swift',{length:1,height:1,beam:1},aperture,-1).allowed,false);
 assert.equal(M.carrierEligibility('kestrel','swift',{length:1,height:1,beam:1},aperture).allowed,false);
 const old=require('../Build/Rollbacks/condor-allowlist-20261020/ship-specs.js'),current=require('../Local/ship-catalogue/ship-specs.js');
 for(const key of Object.keys(old)){const withoutCopy=rows=>rows.map(({detail,...rating})=>rating);assert.deepEqual(key==='fittings'?withoutCopy(current[key]):current[key],key==='fittings'?withoutCopy(old[key]):old[key],'Existing ratings unchanged: '+key);}
 fs.writeFileSync(new URL('../Build/condor-allowlist-verification.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log('Passed: 3 approved hulls at factory and maximum fit, 17 excluded classes, clearance/berth guards; existing ratings unchanged.');
}finally{disposeShip(carrier);}
