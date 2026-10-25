'use strict';
const fs=require('node:fs'),vm=require('node:vm');
module.exports=context=>{
 const source=fs.readFileSync(__dirname+'/../../Browser/app.js','utf8');
 if(vm.runInContext('typeof date',context)==='undefined')vm.runInContext(source.split('\n').find(line=>line.startsWith('const date=')),context);
 for(const name of ['navigationPlace','stationLabel','stationNames','serviceDeadline'])vm.runInContext(source.split('\n').find(line=>line.startsWith('function '+name+'(')),context);
};
