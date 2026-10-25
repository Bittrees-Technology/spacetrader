'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function verify(root=path.resolve(__dirname,'..'),read=fs.readFileSync){
 const issues=[];let pointer,manifest;
 try{pointer=JSON.parse(read(path.join(root,'Balance/current.json')));if(!/^approved-v[1-9][0-9]*\/manifest\.json$/.test(pointer.manifest))throw Error('Invalid balance revision path');manifest=JSON.parse(read(path.join(root,'Balance',pointer.manifest)));if(manifest.version!==1||pointer.revision!==manifest.revision)throw Error('Invalid balance revision');}catch(e){return {passed:false,issues:['Approved baseline unavailable: '+e.message]};}
 const base=path.join(root,'Balance',path.dirname(pointer.manifest));
 for(const [name,expected] of Object.entries(manifest.files)){try{if(path.basename(name)!==name||sha(read(path.join(base,name)))!==expected)issues.push('Approved artifact changed: '+name);}catch{issues.push('Approved artifact missing: '+name);}}
 for(const [name,expected] of Object.entries(manifest.sourceFiles)){try{if(name.includes('..')||path.isAbsolute(name)||sha(read(path.join(root,name)))!==expected)issues.push('Balance review needed: '+name);}catch{issues.push('Balance source missing: '+name);}}
 return {passed:issues.length===0,revision:manifest.revision,counts:manifest.counts,issues};
}
module.exports={verify};
if(require.main===module){const result=verify(process.argv[2]?path.resolve(process.argv[2]):undefined);if(result.passed)console.log('Approved economy '+result.revision+' verified: '+result.counts.exchangeGoods+' exchange goods, '+result.counts.stations+' stations; pricing inputs and statistics unchanged.');else {console.error(result.issues.join('\n'));console.error('Keep the approved snapshot intact. Follow Balance/README.md to review the candidate and create a new version for an authorized update.');process.exitCode=1;}}
