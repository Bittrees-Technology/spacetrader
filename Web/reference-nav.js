'use strict';
// Section navigation is presentation only; it never changes the URL or player data.
(function(root){
 function chooseSection(rows,line,atBottom=false){
  if(!rows.length)return null;
  if(atBottom)return rows[rows.length-1];
  let selected=rows[0];
  for(const row of rows){if(row.top>line)break;selected=row;}
  return selected;
 }
 if(typeof module!=='undefined')module.exports={chooseSection};
 if(!root.document)return;
 for(const nav of document.querySelectorAll('.formula-nav,.guide-index')){
  const links=[...nav.querySelectorAll('a[href^="#"]')];
  const pairs=links.flatMap(link=>{try{const target=document.getElementById(decodeURIComponent(link.hash.slice(1)));return target?[{link,target}]:[];}catch{return [];}});
  if(!pairs.length)continue;
  nav.dataset.referenceNav='';
  let rows=[],headerHeight=0,dirty=true,frame=0,current=null;
  function measure(){
   headerHeight=document.querySelector('.catalogue-shell')?.getBoundingClientRect().height||0;
   document.documentElement.style.setProperty('--reference-nav-top',Math.ceil(headerHeight+16)+'px');
   rows=pairs.flatMap(pair=>{const rect=pair.target.getBoundingClientRect();return rect.width&&rect.height&&!pair.link.hidden?[{...pair,top:rect.top+window.scrollY}]:[];}).sort((a,b)=>a.top-b.top);
  }
  function update(){
   frame=0;if(dirty){dirty=false;measure();}
   const page=document.scrollingElement;
   const atBottom=page.scrollHeight>window.innerHeight+2&&window.scrollY+window.innerHeight>=page.scrollHeight-2;
   const readingOffset=headerHeight+Math.min(160,Math.max(32,(window.innerHeight-headerHeight)*0.25));
   const next=chooseSection(rows,window.scrollY+readingOffset,atBottom)?.link||null;
   if(next!==current||nav.querySelector('a[aria-current="location"]')!==next){
    current=next;
    for(const link of links){if(link===next)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
   }
   // Move only the sidebar's own scroll area; never pull the article out of place.
   const scrollArea=nav.closest('.guide-contents')||nav;
   if(next&&nav.getClientRects().length&&scrollArea.scrollHeight>scrollArea.clientHeight+1&&['auto','scroll'].includes(getComputedStyle(scrollArea).overflowY)){
    const box=scrollArea.getBoundingClientRect(),item=next.getBoundingClientRect();
    if(item.top<box.top+8)scrollArea.scrollTop-=box.top+8-item.top;
    else if(item.bottom>box.bottom-8)scrollArea.scrollTop+=item.bottom-box.bottom+8;
   }
  }
  function schedule(remeasure=false){dirty=dirty||remeasure;if(!frame)frame=requestAnimationFrame(update);}
  window.addEventListener('scroll',()=>schedule(),{passive:true});
  window.addEventListener('resize',()=>schedule(true),{passive:true});
  window.addEventListener('hashchange',()=>schedule(true));
  document.addEventListener('toggle',()=>schedule(true),true);
  document.addEventListener('load',()=>schedule(true),true);
  const content=document.querySelector('#guide-content,#formula-content,#mechanics-content');
  if(content)new MutationObserver(()=>schedule(true)).observe(content,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  new ResizeObserver(()=>schedule(true)).observe(document.body);
  schedule(true);
 }
})(typeof window==='undefined'?globalThis:window);
