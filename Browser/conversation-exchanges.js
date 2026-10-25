'use strict';
// Presentation only. Reading a follow-up never invokes the simulation or repeats a reward.
(function(root){
const families={direct:['blunt','forthright','brisk','taciturn','pragmatic'],precise:['meticulous','methodical','exacting','deliberate','formal'],warm:['warm','hospitable','reassuring','patient','protective'],wry:['wry','deadpan','self-deprecating','irreverent','playful'],curious:['curious','skeptical'],reflective:['reflective','philosophical','reserved','soft-spoken','storyteller'],lively:['lively','animated','enthusiastic','optimistic','competitive']};
const subjects={market:'the cargo certificates',contracts:'the delivery',shipyard:'the workshop',fleet:'the fleet records',security:'the patrol account',relay:'the route information',clinic:'the care handover',authority:'the clearance',bank:'the account',local:'the people here',warehouse:'the custody record'};
function sentences(value){
 const text=String(value||'').trim();if(!text)return [];
 const result=[];let start=0;
 for(let i=0;i<text.length;i++){
  const ch=text[i];if(!'.!?'.includes(ch))continue;
  if(ch==='.'&&(/\d/.test(text[i-1]||'')&&/\d/.test(text[i+1]||'')||/\b(?:Mr|Mrs|Ms|Dr|Prof|St|vs|etc|e\.g|i\.e)$/i.test(text.slice(Math.max(start,i-12),i))))continue;
  if(ch==='.'&&/^\s*\d+$/.test(text.slice(Math.max(start,text.lastIndexOf('\n',i)+1),i)))continue;
  let end=i+1;while(end<text.length&&/[.!?"'”’»)*]/.test(text[end]))end++;
  if(end<text.length&&!/\s/.test(text[end]))continue;
  const part=text.slice(start,end).trim();if(part)result.push(part);start=end;i=end-1;
 }
 const tail=text.slice(start).trim();if(tail)result.push(tail);return result;
}
function category(text,c){
 const t=text.replace(/\*\*/g,'').toLowerCase(),has=re=>re.test(t);
 if(has(/false certif|forfeit|penalt|miss(?:ed|ing)? the deadline|breach|withdraw|confiscat|seiz|risks?|pirat|threat|unsafe|danger/))return 'risk';
 if(['market','local'].includes(c.venue)&&has(/\b(?:reserves?|resupply|procurement|imports?|exports?|production|consumption|replenish(?:ment)?|supply schedule|posted quote|available stock|offered lots)\b/))return 'supply';
 if(has(/\b(?:cr|credits?|apr|xp|payments?|fees?|borrow(?:ing|ed)?|deposits?|prices?|loans?|costs?)\b|\binterest (?:rate|accru|keeps|and)|annual.{0,20}rate/))return 'terms';
 if(c.person&&t.includes(c.person.toLowerCase())&&has(/\bi(?: am|’m|'m)\b/))return 'identity';
 if(c.character?.mood&&sentences(c.character.mood).some(v=>t.includes(v.toLowerCase())))return 'mood';
 if(has(/\b(?:bring|deliver|visit|return|units?|objective|step|stages?|assignment|report back)\b/))return 'task';
 if(has(/introduc|recommend|receiving desk|receiver|cooperat|waiting crew/))return 'people';
 if(has(/\b(?:hope|plan|ambition|would like|next step|goal)\b/))return 'plans';
 if(c.character?.interest&&t.includes(c.character.interest.toLowerCase())||has(/outside work|between shifts|time away|hobb|interest/))return 'interests';
 if(has(/\b(?:once|earlier|remember|mentor|learned|learnt|first journey|history|past|came here)\b/))return 'history';
 if(has(/seal|certif|calibrat|verif|evidence|check|measur|maintenance|repair|instrument|manifest|quantity|condition|cargo|logbook|bay ledger/))return 'method';
 if(has(/station|orbit|radiation|cold|isolation|resupply|surface|gravity|greenhouse|plume|approach/))return 'place';
 return 'personal';
}
function create(text,context={}){
 const raw=String(text||'').trim(),whole=sentences(raw),groups=whole.length<=2?[whole]:raw.split(/\n\s*\n/).map(sentences),beats=[];let activeBold=false;
 for(const parts of groups)for(let i=0;i<parts.length;){const first=category(parts[i],context),next=i+1<parts.length?category(parts[i+1],context):null,count=next?2:1,rawBeat=parts.slice(i,i+count).join('\n\n');i+=count;let value=(activeBold?'**':'')+rawBeat;const toggles=(rawBeat.match(/\*\*/g)||[]).length;if(toggles%2)activeBold=!activeBold;if(activeBold)value+='**';beats.push({id:beats.length,text:value,category:category(rawBeat,context)});}
 return {raw,beats:beats.length?beats:[{id:0,text:'',category:'personal'}],current:0,seen:[0],dismissed:false};
}
function view(cursor,c={}){
 const pending=cursor.beats.filter(b=>!cursor.seen.includes(b.id));
 return {text:cursor.beats[cursor.current].text,followups:cursor.dismissed||!pending.length?[]:[{id:pending[0].id,name:'Go on.'}],pending:!cursor.dismissed&&pending.length>0,finish:'Choose another topic'};
}
function choose(cursor,id){if(id==='finish'){cursor.dismissed=true;return true;}if(!Number.isInteger(id)||!cursor.beats[id]||cursor.seen.includes(id))return false;cursor.current=id;cursor.seen.push(id);return true;}
// A small spoken menu retains every available branch without recording navigation.
function replyPage(normal,page=0){
 const choices=Array.isArray(normal)?normal:(String(normal||'').match(/<button\b[\s\S]*?<\/button>/g)||[]);
 const size=choices.length>4?3:4,total=Math.max(1,Math.ceil(choices.length/size)),index=((Math.trunc(Number.isFinite(Number(page))?Number(page):0)%total)+total)%total;
 return {choices:choices.slice(index*size,index*size+size),page:index,next:total>1?(index+1)%total:null,total,name:index===total-1?'Let’s return to my earlier questions.':'There’s something else I wanted to ask.'};
}
// One time-based animation loop for the visible conversation. No timers or game actions.
function createRevealer({requestFrame,cancelFrame,now,reducedMotion,hidden}){
 const active=new Map(),segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
 let frame=0;
 const glyphs=text=>segmenter?Array.from(segmenter.segment(text),v=>v.segment):Array.from(text);
 function paint(item,count){
  for(const part of item.parts){const n=Math.max(0,Math.min(part.glyphs.length,count-part.start));if(n!==part.shown){part.node.data=part.glyphs.slice(0,n).join('');part.shown=n;}}
 }
 function finishItem(item){paint(item,item.total);item.progress.done=true;item.el.removeAttribute('data-revealing');item.el.removeAttribute('role');item.el.removeAttribute('tabindex');item.el.removeAttribute('title');active.delete(item.el);}
 function finish(el){for(const item of [...active.values()])if(!el||item.el===el)finishItem(item);if(!active.size&&frame){cancelFrame(frame);frame=0;}}
 function tick(time){
  frame=0;
  for(const item of [...active.values()]){
   if(!item.el.isConnected){active.delete(item.el);continue;}
   if(reducedMotion()||hidden()){finishItem(item);continue;}
   item.progress.elapsed=Math.max(item.progress.elapsed,time-item.started);
   let lo=0,hi=item.due.length;while(lo<hi){const mid=(lo+hi)>>>1;if(item.due[mid]<=item.progress.elapsed)lo=mid+1;else hi=mid;}
   paint(item,lo);if(lo===item.total)finishItem(item);
  }
  if(active.size)frame=requestFrame(tick);
 }
 function mount(el,progress){
  const ink=el.querySelector('.response-ink'),walker=el.ownerDocument.createTreeWalker(ink,4),parts=[],due=[];let node,total=0,time=0;
  while((node=walker.nextNode())){const chars=glyphs(node.data);parts.push({node,glyphs:chars,start:total,shown:chars.length});for(const ch of chars){due.push(time);time+=1000/56+(/[.!?]/.test(ch)?82.5:/[,;:]/.test(ch)?33.75:0);}total+=chars.length;}
  const item={el,parts,total,due,progress,started:now()-(progress.elapsed||0)};progress.elapsed=progress.elapsed||0;
  if(progress.done||!total||reducedMotion()||hidden()){finishItem(item);return;}
  active.set(el,item);paint(item,due.filter(t=>t<=progress.elapsed).length);el.setAttribute('data-revealing','');el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('title','Show complete response');
  if(!frame)frame=requestFrame(tick);
 }
 function stop(){if(frame)cancelFrame(frame);frame=0;active.clear();}
 return {mount,finish,stop};
}
const api={sentences,create,view,choose,replyPage,createRevealer};if(typeof module!=='undefined')module.exports=api;else root.SpacetraderExchanges=api;
})(globalThis);
