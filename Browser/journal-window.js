'use strict';
(function(root){
 const rowHeight=56,overscan=24,cacheLimit=256;
 function range(count,scrollTop,height,offset=0){
  const first=Math.max(0,Math.min(count,Math.floor((scrollTop-offset)/rowHeight)));
  const start=Math.max(0,first-overscan),end=Math.max(start,Math.min(count,Math.ceil((scrollTop-offset+height)/rowHeight)+overscan));
  return {start,end,top:start*rowHeight,bottom:(count-end)*rowHeight};
 }
 function create({pane,list,renderRow,onScroll=()=>{},requestFrame=root.requestAnimationFrame.bind(root),cancelFrame=root.cancelAnimationFrame.bind(root),setTimer=root.setTimeout.bind(root),clearTimer=root.clearTimeout.bind(root)}){
  const rows=[],cache=new Map(),nodes=new Map();let frame=null,timer=null,disposed=false,complete=false,painted='',visible={start:0,end:0,top:0,bottom:0};
  list.classList.add('journal-window');
  const doc=list.ownerDocument,topSpacer=doc.createElement('li'),bottomSpacer=doc.createElement('li'),empty=doc.createElement('li');
  for(const spacer of [topSpacer,bottomSpacer]){spacer.className='journal-spacer';spacer.setAttribute('aria-hidden','true');spacer.setAttribute('role','presentation');}
  empty.className='records-empty';list.replaceChildren(topSpacer,empty,bottomSpacer);
  function html(index){
   if(!cache.has(index)){cache.set(index,renderRow(rows[index]));if(cache.size>cacheLimit)cache.delete(cache.keys().next().value);}
   return cache.get(index).replace('<li ',`<li aria-posinset="${index+1}" aria-setsize="${complete?rows.length:-1}" `);
  }
  function paint(notify=true){
   if(disposed)return;
   const offset=list.getBoundingClientRect().top-pane.getBoundingClientRect().top+pane.scrollTop;
   visible=range(rows.length,pane.scrollTop,pane.clientHeight,offset);
   const key=[visible.start,visible.end,rows.length,complete].join(':');
   if(key!==painted){
    painted=key;
    // Preserve overlapping nodes: replacing a wheel gesture's target can break
    // native WebKit scroll latching. Only recycle rows outside the overscan.
    for(const [index,node] of nodes)if(index<visible.start||index>=visible.end){node.remove();nodes.delete(index);}
    let next=bottomSpacer;
    for(let i=visible.end-1;i>=visible.start;i--){
     let node=nodes.get(i);
     if(!node){const template=doc.createElement('template');template.innerHTML=html(i);node=template.content.firstElementChild;nodes.set(i,node);list.insertBefore(node,next);}
     node.setAttribute('aria-setsize',String(complete?rows.length:-1));next=node;
    }
    topSpacer.style.height=visible.top+'px';bottomSpacer.style.height=visible.bottom+'px';
    if(rows.length)empty.remove();else{empty.textContent=complete?'No recorded entries.':'Loading your recorded actions…';if(!empty.parentNode)list.insertBefore(empty,bottomSpacer);}
   }
   if(notify)onScroll();
  }
  function flush(){if(disposed)return;if(frame!==null)cancelFrame(frame);if(timer!==null)clearTimer(timer);frame=timer=null;paint();}
  // WebKit can defer animation frames while its async scrolling layer keeps
  // moving. A bounded timer keeps rows and page prefetch from waiting on it.
  function schedule(){if(disposed||frame!==null)return;frame=requestFrame(flush);timer=setTimer(flush,50);}
  pane.addEventListener('scroll',schedule,{passive:true});
  pane.addEventListener('wheel',schedule,{passive:true});
  const resize=typeof root.ResizeObserver==='function'?new root.ResizeObserver(schedule):null;resize?.observe(pane);
  paint(false);
  return {
   appendRows(values,done=false){if(disposed)return;for(const row of values)rows.push(row);complete=done;paint();},
   refresh:()=>paint(),
   stats:()=>({count:rows.length,rendered:visible.end-visible.start,cache:cache.size,...visible}),
   destroy(){disposed=true;if(frame!==null)cancelFrame(frame);if(timer!==null)clearTimer(timer);pane.removeEventListener('scroll',schedule);pane.removeEventListener('wheel',schedule);resize?.disconnect();rows.length=0;cache.clear();nodes.clear();}
  };
 }
 const api={create,range,rowHeight,overscan,cacheLimit};if(typeof module!=='undefined')module.exports=api;else root.SpacetraderJournalWindow=api;
})(typeof window!=='undefined'?window:globalThis);
