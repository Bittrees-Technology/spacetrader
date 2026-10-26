'use strict';
const assert=require('node:assert/strict'),{viewport,modalBounds,keepFieldVisible}=require('../../Web/play-layout');
function visible(bounds,w,h,view){
 const box=viewport(w,h,view);
 assert(bounds.width>0&&bounds.height>0);
 assert(bounds.left>=box.left&&bounds.top>=box.top);
 assert(w-bounds.right<=box.right&&h-bounds.bottom<=box.bottom);
}
const portrait={left:180,top:58,right:768,bottom:1024};
const landscape={left:240,top:58,right:1024,bottom:768};
for(const [w,h,rect] of [[768,1024,portrait],[1024,768,landscape],[768,1024,portrait],[390,844,{left:0,top:200,right:390,bottom:844}],[844,390,{left:0,top:100,right:844,bottom:390}]]){
 const bounds=modalBounds(rect,w,h);visible(bounds,w,h);
 if(w<=900)assert.equal(bounds.width,w,'compact popouts use the screen width');
}
let vv={width:1024,height:340,offsetTop:140,offsetLeft:0,scale:1};
let bounds=modalBounds(landscape,1024,768,vv);visible(bounds,1024,768,vv);assert.equal(bounds.height,340);assert.equal(bounds.top,140);
vv={width:390,height:300,offsetTop:180,offsetLeft:0,scale:1};
bounds=modalBounds({left:0,top:220,right:390,bottom:844},390,844,vv,{top:0,bottom:34});visible(bounds,390,844,vv);assert.equal(bounds.height,266);
bounds=modalBounds(portrait,768,1024,undefined,{top:24,bottom:20,left:4,right:4});assert.equal(bounds.left,4);assert.equal(bounds.top,24);assert.equal(bounds.width,760);assert.equal(bounds.height,980);
bounds=modalBounds(portrait,768,1024,undefined,{bottom:26},{height:950});assert.equal(bounds.height,924,'portrait popouts respect the toolbar-fitted cockpit and bottom inset');
bounds=modalBounds(landscape,1024,768,undefined,{bottom:6},{height:650});assert.equal(768-bounds.bottom,644,'landscape popouts stay above the fitted bottom edge');
bounds=modalBounds(portrait,768,1024,{width:768,height:300,offsetTop:180,scale:1},{bottom:6},{height:300});assert.equal(bounds.top,180);assert.equal(bounds.height,294,'keyboard panning does not double-subtract the viewport offset');
assert.deepEqual(viewport(390,844,{width:195,height:422,scale:2,offsetTop:90,offsetLeft:30}),{left:0,top:0,right:390,bottom:844},'manual pinch zoom does not trigger a second reflow');
const dialog={contains:()=>true,scrollHeight:200,clientHeight:200,parentElement:null};
const pane={scrollHeight:500,clientHeight:100,scrollTop:0,parentElement:dialog,getBoundingClientRect:()=>({top:100,bottom:200})};
const field={matches:()=>true,parentElement:pane,getBoundingClientRect:()=>({top:230-pane.scrollTop,bottom:274-pane.scrollTop})};
keepFieldVisible({activeElement:field,getElementById:()=>dialog},()=>({overflowY:'auto'}));
assert.equal(pane.scrollTop,84,'focused fields move inside the scrolling panel, without scrolling the page');
keepFieldVisible({activeElement:field,getElementById:()=>dialog},()=>({overflowY:'auto'}));assert.equal(pane.scrollTop,84,'already visible fields do not jump');
console.log('PASS responsive layout: repeated rotation, phone landscape, keyboard resize/pan, safe areas and preserved pinch zoom.');
