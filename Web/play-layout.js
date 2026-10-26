'use strict';
// Public browser layout only: the game engine and native cockpit stay unchanged.
(function(root){
 function viewport(width,height,visual){
  const zoomed=visual&&Math.abs((visual.scale||1)-1)>.01;
  const left=zoomed?0:Math.max(0,Math.min(width-1,visual?.offsetLeft||0));
  const top=zoomed?0:Math.max(0,Math.min(height-1,visual?.offsetTop||0));
  return {left,top,right:zoomed?width:Math.min(width,left+(visual?.width||width)),bottom:zoomed?height:Math.min(height,top+(visual?.height||height))};
 }
 function modalBounds(rect,width,height,visual,safe={}){
  const view=viewport(width,height,visual),compact=width<=900||(width<=1200&&view.bottom-view.top<=500);
  view.left+=Math.max(0,safe.left||0);view.right-=Math.max(0,safe.right||0);
  view.top+=Math.max(0,safe.top||0);view.bottom-=Math.max(0,safe.bottom||0);
  let left=compact?view.left:Math.max(view.left,Math.min(view.right-1,rect?.left||0));
  let right=compact?view.right:Math.max(left+1,Math.min(view.right,rect?.right??width));
  let top=compact?view.top:Math.max(view.top,Math.min(view.bottom-1,rect?.top||0));
  let bottom=compact?view.bottom:Math.max(top+1,Math.min(view.bottom,rect?.bottom??height));
  if(bottom-top<120){top=view.top;bottom=view.bottom;}
  return {left,top,right:width-right,bottom:height-bottom,width:right-left,height:bottom-top,x:(left+right)/2,y:(top+bottom)/2};
 }
 function safeInsets(){
  const style=root.getComputedStyle(root.document.documentElement);
  return Object.fromEntries(['top','right','bottom','left'].map(side=>[side,parseFloat(style.getPropertyValue('--play-safe-'+side))||0]));
 }
 function keepFieldVisible(doc,styleOf=element=>root.getComputedStyle(element)){
  const field=doc.activeElement,dialog=doc.getElementById('modal');
  if(!field?.matches('input:not([type=range]),textarea,select,[contenteditable=true]')||!dialog?.contains(field))return;
  for(let pane=field.parentElement;pane;pane=pane.parentElement){
   if(pane.scrollHeight>pane.clientHeight&&/auto|scroll/.test(styleOf(pane).overflowY)){
    const box=field.getBoundingClientRect(),frame=pane.getBoundingClientRect(),gap=10;
    if(box.bottom>frame.bottom-gap)pane.scrollTop+=box.bottom-frame.bottom+gap;
    else if(box.top<frame.top+gap)pane.scrollTop-=frame.top-box.top+gap;
   }
   if(pane===dialog)break;
  }
 }
 function install(host){
  let frame=0;
  function update(){
   frame=0;
   const view=viewport(host.innerWidth,host.innerHeight,host.visualViewport);
   host.document.documentElement.style.setProperty('--play-height',(view.bottom-view.top)+'px');
   host.positionMainModal?.();
   keepFieldVisible(host.document);
  }
  function schedule(){if(!frame)frame=host.requestAnimationFrame(update);}
  host.addEventListener('resize',schedule,{passive:true});
  host.addEventListener('orientationchange',schedule,{passive:true});
  host.visualViewport?.addEventListener('resize',schedule,{passive:true});
  host.visualViewport?.addEventListener('scroll',schedule,{passive:true});
  host.document.addEventListener('focusin',schedule);
  schedule();
 }
 const api={viewport,modalBounds,safeInsets,keepFieldVisible,install};
 if(typeof module!=='undefined')module.exports=api;
 root.SpacetraderPlayLayout=api;
 if(root.document)root.document.addEventListener('DOMContentLoaded',()=>install(root),{once:true});
})(typeof window==='undefined'?globalThis:window);
