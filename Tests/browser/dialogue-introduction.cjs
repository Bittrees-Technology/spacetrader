'use strict';
const assert=require('node:assert/strict');
module.exports=function introduce(E,s,venue,topic){
 const talk=choice=>{s=E.transact(s,'venue-talk',{id:venue,topic:choice});};
 if(E.establishmentVisit(s,venue).tree.stage!=='Opening conversation')talk('tree-back');
 talk('tree-needs');talk('tree-register');
 for(let page=0;page<16;page++){
  const d=E.establishmentVisit(s,venue);assert(d.topics.length<=4);
  if(d.topics.some(t=>t.id===topic)){talk(topic);return s;}
  if(!d.topics.some(t=>t.id==='tree-register-next'))break;
  talk('tree-register-next');
 }
 throw Error('Introduction not available: '+topic);
};
