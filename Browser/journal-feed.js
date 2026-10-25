'use strict';
// Read-only presentation of the saved action ledger. No writes or action replay.
(function(root){
 const titles={'battle-continue':'Battle summary reviewed',buy:'Bought cargo','buy-max':'Bought cargo',sell:'Sold cargo','sell-all':'Sold cargo',depart:'Voyage',resolve:'Encounter',wait:'Layover',create:'Captain registered','new-voyage':'New voyage',restore:'Voyage restored','legacy-import':'Earlier voyage imported','venue-talk':'Conversation',talk:'Conversation','secret-talk':'Private conversation','clinic-recover':'Crew recovery','clinic-treat':'Medical care','clinic-research':'Clinic research','dry-dock-service':'Dry dock service','warehouse-store':'Stored goods','warehouse-take':'Collected goods','warehouse-buy':'Warehouse purchased','battle-order':'Combat order','battle-plan':'Battle orders','battle-tick':'Combat exchange'};
 const human=v=>String(v??'').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[-_]+/g,' ').replace(/^./,c=>c.toUpperCase());
 const plain=v=>String(v??'').replace(/\*\*|`/g,'').replace(/\s+/g,' ').trim();
 const short=v=>plain(v).replace(/\bunits of\b/gi,'×').replace(/\bpercentage points\b/gi,'pp').replace(/\bexperience\b/gi,'XP').replace(/\bhull integrity\b/gi,'hull').replace(/\bcrew readiness\b/gi,'crew').replace(/\bannual interest\b/gi,'APR').replace(/\bdays\b/g,'d').replace(/\b(\d+(?:\.\d+)?) units\b/g,'$1u').replace(/Your discoveries are recorded in the Journal\.?/g,'').replace(/Ship hull repairs remain a dry-dock service\.?/g,'').replace(/Permanent local storage; no recurring rent\.?/g,'').replace(/\(resets every 30 (?:days|d)\)/g,'').replace(/Orbital positions and markets moved\.?/g,'').replace(/Warehouse inventory updated; no time or credits charged\.?/g,'').replace(/\bseven d\b/g,'7 d').replace(/\s+([.,;:])/g,'$1').trim();
 const amount=(n,unit='')=>{const abs=Math.abs(n);return (n>0?'+':n<0?'−':'')+(unit==='cr'&&abs>0&&abs<.005?'<0.01':abs.toLocaleString('en-US',{maximumFractionDigits:unit==='cr'?2:3}))+(unit?' '+unit:'');};
 function chunks(value,limit=96){
  const words=[],parts=[];let line='';
  for(const word of short(value).split(' ')){const unit=/^(%|cr|pp|t|u|d|XP|units)([.,;:]*)$/.exec(word);if(unit&&words.length&&/^[+−-]?[<>]?\d[\d,.]*(?:\/\d+)?$/.test(words.at(-1))){words[words.length-1]+=(unit[1]==='%'?'':' ')+word;}else words.push(word);}
  for(const word of words){if(line&&line.length+word.length+1>limit){parts.push(line);line='';}line+=(line?' ':'')+word;}if(line)parts.push(line);return parts;
 }
 function added(before=[],after=[]){
  const counts=new Map(),key=v=>v.id?'id:'+v.id:JSON.stringify(v);
  for(const v of before)counts.set(key(v),(counts.get(key(v))||0)+1);
  return after.filter(v=>{const k=key(v),n=counts.get(k)||0;if(n){counts.set(k,n-1);return false;}return true;});
 }
 function datedNote(note,day){
  const match=/^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4}) · (.*)$/.exec(note),months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if(match&&months.includes(match[2]))return {day:Math.round((Date.UTC(+match[3],months.indexOf(match[2]),+match[1])-Date.UTC(2089,0,1))/86400000),text:match[4]};
  return {day,text:note};
 }
 function context(r,ctx,port=r.origin){
  const label=id=>id?(ctx.stationLabel?.(id)||ctx.names?.[id]||human(id)):'Location not recorded';
  return [label(port),r.destination&&r.destination!==r.origin&&port===r.origin?'→ '+label(r.destination):'',r.venue?(ctx.venueLabel?.(r.venue)||human(r.venue)):'',ctx.activeCaptain&&r.captain!==ctx.activeCaptain?r.captain:'',...(r.who||[]).filter(n=>n!==r.captain)].filter(Boolean).join(' · ');
 }
 function changeRows(r,ctx,covered=''){
  if(['create','new-voyage','restore','legacy-import'].includes(r.type))return [];
  const rows=[],numeric=new Set(),gone=new Set((r.changes||[]).filter(c=>/^ships\/[^/]+\/owned$/.test(c.key)&&c.after!==true).map(c=>c.key.split('/')[1]));
  const name=id=>ctx.names?.[id]||human(id),note=plain(covered).toLowerCase().replace(/(\d),(?=\d)/g,'$1');
  for(const c of r.changes||[]){
   const p=c.key.split('/'),leaf=p.at(-1),delta=(typeof c.after==='number'||c.after===null)&&(typeof c.before==='number'||c.before===null)?(c.after??0)-(c.before??0):null;let label='',unit=c.unit;
   if(p[0]==='accounts'){
    if(p[1]==='credits')label='Cash';else if(p[1]==='charter')label='Charter loan';else if(p[1]==='deposits'&&p.length===3)label=name(p[2])+' deposit';else if(p[1]==='loans'&&leaf==='balance')label=(c.label||'Loan').replace(/^Accounts · Bank loans · /,'').replace(/ · Balance$/,'');
    if(label&&delta&&note.includes('cr')){const n=Math.abs(delta).toLocaleString('en-US',{maximumFractionDigits:2}).replace(/,/g,'');if(new RegExp('(?:^|[^\\d.])'+n.replace(/\./g,'\\.')+'(?=[^\\d.]|$)').test(note)&&((p[1]==='credits')||p[1]==='deposits'&&/deposit|withdr/.test(note)||p[1]==='loans'&&/borrow|loan|repai/.test(note)))continue;}
   }else if(p[0]==='xp'){label=name(leaf);unit='XP';}
   else if(p[0]==='levels'&&c.after!==null){rows.push({text:name(leaf)+' level '+c.after});continue;}
   else if(p[0]==='stats'){if(leaf==='unitsSold'&&['sell','sell-all'].includes(r.type)||leaf==='deliveries'&&r.type==='deliver'||leaf==='voyages'&&['depart','resolve'].includes(r.type)||leaf==='repairs'&&['repair','dry-dock-service'].includes(r.type))continue;label=(c.label||human(leaf)).replace(/^Career statistics · /,'');}
   else if(p[0]==='standing'&&['reputation','relationships','progress','localProgress'].includes(p[1])){label=p[1]==='reputation'?'Reputation':p[1]==='progress'?'Reputation merit':name(p[2])+(p[1]==='localProgress'?' trust merit':' trust');}
   else if(p[0]==='ships'&&!gone.has(p[1])){
    const vessel=(c.label||'Ship').split(' · ')[0];
    if(p[2]==='cargo'&&p.length===4){label=vessel+' · '+name(leaf);unit='units';if(delta&&note.includes(name(leaf).toLowerCase())&&new RegExp('(?:^|\\D)'+Math.abs(delta)+'(?:\\D|$)').test(note))continue;}
    else if(['fuel','hull','spares'].includes(p[2])&&p.length===3)label=vessel+' · '+({fuel:'fuel',hull:'hull',spares:'spares'})[p[2]];
    else if(p[2]==='ammunition'&&p.length===4)label=vessel+' · '+name(leaf);
    else if(p[2]==='upgrades'&&p.length===4)label=vessel+' · '+name(leaf);
   }else if(p[0]==='warehouses'&&p[2]==='cargo'&&p.length===4){label=name(p[1])+' storage · '+name(leaf);unit='units';}
   if(!label||delta===null||!delta)continue;
   const account=p[0]==='accounts'&&p[1]!=='credits',pid=account&&(p[1]==='deposits'?p[2]:p[1]==='charter'?'earth':Object.keys(ctx.portNames||{}).sort((a,b)=>b.length-a.length).find(id=>p[2]===id||p[2]?.startsWith(id+'-')));if(pid&&p[1]!=='charter'){label=label.replace(name(pid),'').replace(/^[ ·]+|[ ·]+$/g,'').trim();if(p[1]==='loans')label+=' loan';label=human(label);}
   const line=label+' '+amount(delta,unit);if(!numeric.has(line)){numeric.add(line);rows.push({text:line,port:pid||null,account});}
  }
  return rows;
 }
 function depositInterestRows(r,before,after,ctx){
  const days=after?.day-before?.day,E=ctx.engine;
  if(!Number.isInteger(days)||days<=0||r.startDay!==before.day||['deposit','withdraw','restore','create','new-voyage','legacy-import'].includes(r.type)||!E?.reserveFee)return [];
  // Historical rates may differ from today's engine. Attribute saved deltas,
  // never recalculate or replace historical earnings with current formulas.
  // Mixed cash flows remain ordinary balance changes unless individually known.
  if(E.reserveFee(before,1)||E.reserveFee(after,1)||[before,after].some(s=>Object.values(s.warehouses||{}).some(w=>w.leaseBook?.contracts?.some(j=>['active','due'].includes(j.status)))))return [];
  const priorCollections=new Set((before.debtCollections||[]).map(v=>v.id));
  if((after.debtCollections||[]).some(v=>!priorCollections.has(v.id))||r.notes?.some(n=>/deposited|withdraw|bank deposit|berth fees|auction|rent settled|warehouse seizure/i.test(n)))return [];
  return (r.changes||[]).filter(c=>{
   const p=c.key.split('/');return p.length===3&&p[0]==='accounts'&&p[1]==='deposits'&&typeof c.before==='number'&&c.before>0&&typeof c.after==='number'&&c.after>c.before&&c.before===before.bank?.deposits?.[p[2]]&&c.after===after.bank?.deposits?.[p[2]];
  }).map(c=>({key:c.key,port:c.key.split('/')[2],delta:c.after-c.before,days}));
 }
 function prepare(meta,after,before,ctx={}){
  const E=ctx.engine,stored=after?.lastJournalEntry,valid=stored&&stored.type===meta.type&&stored.day===after.day;
  let receipt=after?(valid?stored:E.journalEntry(before,after,{type:meta.type,args:meta.args||{}})):{type:meta.type,title:titles[meta.type]||human(meta.type),day:meta.day,origin:meta.location,destination:meta.location,who:[meta.name],notes:[],changes:[],outcome:'Details unavailable'};
  // Imports/restores describe a saved state, never newly earned inventory or notices.
  const restored=['restore','new-voyage','legacy-import'].includes(meta.type),unknown=!before&&!valid&&!['create','new-voyage'].includes(meta.type);
  const r={...receipt,sequence:meta.sequence,recordedAt:meta.created,captain:after?.profile?.name||meta.name,recovered:!!after&&!valid,detailsUnavailable:!after,who:receipt.who||[],changes:unknown?[]:receipt.changes||[]};
  const logs=restored||!after?[]:before?added(before.log,after.log):valid?(receipt.notes||[]).map((n,i)=>({id:'saved-note-'+i,port:r.origin,...datedNote(n,r.day)})):[];
  const pattern={buy:/^Bought /,sell:/^Sold /,'buy-max':/^Bought /,'sell-all':/^Sold /,deposit:/^Deposited /,withdraw:/^Withdrew /,borrow:/^Borrowed /,repay:/^Repaid /,'repay-local':/^Repaid /,wait:/layover|waited|stayed|rested/i,accept:/freight|shipment|consignment/i,deliver:/delivered/i};
  const conversational=['venue-talk','secret-talk','talk'].includes(meta.type),spoken=after&&before?added(before.dialogue,after.dialogue):[],question=spoken.find(v=>v.speaker===r.captain)?.text||(/^Conversation · /.test(r.title)?r.title.slice(15):'');
  const primary=!conversational&&(logs.find(v=>pattern[meta.type]?.test(plain(v.text)))||logs.filter(v=>!/^Commodities unlocked|^Independent charter earned|^Reserve berth fees|^Warehouse tenant|^Crew wages/i.test(plain(v.text))).at(-1));
  const args=meta.args||{},subject=[args.good||args.item?ctx.names?.[args.good||args.item]||human(args.good||args.item):'',args.order?human(args.order):'',args.choice&&!conversational?human(args.choice):''].filter(Boolean).join(' · ');
  const label=titles[meta.type]||r.title||human(meta.type);
  let summary=!after?'Details unavailable; recorded action retained.':restored?meta.type==='restore'?'Recorded state restored; earlier history retained.':meta.type==='new-voyage'?'New captain and starting state recorded.':'Earlier recorded progress imported.':conversational?question||subject||'Conversation recorded.':primary?.text||subject||r.outcome;
  if(primary){const location=ctx.portNames?.[primary.port||r.origin];if(location)summary=summary.replace(' at '+location,'');}
  const base={sequence:r.sequence,kind:'action',day:r.day,context:context(r,ctx),recordedAt:meta.created},rows=[];
  const push=(kind,title,value,day=r.day,where=base.context,id='')=>{
   const parts=chunks(value,Math.max(48,106-title.length));if(!parts.length)return;
   for(let i=0;i<parts.length;i++)rows.push({...base,kind:i&&kind==='action'?'event':kind,day,title:i?title+' (cont.)':title,text:parts[i],context:where,fullText:plain(value),id:id+(i?':'+i:'')});
  };
  push('action',label,summary,r.day,base.context,'action');
  for(const log of logs.filter(v=>v!==primary).slice().reverse()){
   let pid=log.port||r.origin;const named=Object.entries(ctx.portNames||{}).filter(([,n])=>plain(log.text).includes(n)).sort((a,b)=>b[1].length-a[1].length)[0];if(named&&/fees at |auction|seiz|deposit|credit|warehouse/i.test(log.text))pid=named[0];
   push('event','Notice',log.text,log.day,context({...r,destination:pid,venue:''},ctx,pid),log.id||'notice-'+rows.length);
  }
  if(after?.battle&&!['battle-tick','battle-plan'].includes(r.type)){const old=before?.battle?.id===after.battle.id?before.battle.log||[]:[],news=added(old.map(text=>({text})),(after.battle.log||[]).map(text=>({text})));for(const [i,v] of news.entries())push('event','Combat',v.text,r.day,base.context,'combat-'+i);}
  const interest=depositInterestRows(r,before,after,ctx),interestKeys=new Set(interest.map(c=>c.key));
  const covered=logs.map(v=>v.text).join(' '),changes=changeRows({...r,changes:r.changes.filter(c=>!interestKeys.has(c.key))},ctx,covered),accountRows=new Map();let line='';
  const resultContext=context({...r,venue:'',who:[]},ctx);
  for(const change of changes){if(change.account&&change.port){const list=accountRows.get(change.port)||[];list.push(change.text);accountRows.set(change.port,list);continue;}if(line&&line.length+2+change.text.length>80){push('change','Result',line,r.day,resultContext);line='';}line+=(line?'; ':'')+change.text;}if(line)push('change','Result',line,r.day,resultContext);
  for(const [pid,lines] of accountRows)push('change','Bank balance',lines.join('; '),r.day,context({...r,origin:pid,destination:pid,venue:'bank',who:[]},ctx,pid),'bank-'+pid);
  for(const c of interest)push('change','Deposit interest',amount(c.delta,'cr')+' · '+c.days+' '+(c.days===1?'day':'days')+' elapsed during '+label.toLowerCase(),r.day,context({...r,origin:c.port,destination:c.port,venue:'bank',who:[]},ctx,c.port),'bank-'+c.port);

  if(unknown&&after)push('event','Record','Earlier context unavailable; exact earlier changes cannot be recovered.');
  return {...r,feedRows:rows.map((row,i)=>({...row,id:String(meta.sequence||'earlier')+':'+(row.id||i),part:i})),primary:rows[0]};
 }
 async function readPage(session,before,ctx){
  const list=await session.history(before),visible=list.slice(0,30),states=new Map(),queue=list.slice(0,visible.length+1);let cursor=0;
  await Promise.all(Array.from({length:Math.min(3,queue.length)},async()=>{while(cursor<queue.length){const m=queue[cursor++];try{const raw=m.sequence===session.snapshot.sequence?session.snapshot.raw:await session.recorded(m.sequence),s=JSON.parse(raw);if(!s?.profile||s.version!==3)throw Error('Invalid recorded state');states.set(m.sequence,s);}catch{states.set(m.sequence,null);}}}));
  return {records:visible.map((m,i)=>{try{return prepare(m,states.get(m.sequence),list[i+1]?states.get(list[i+1].sequence):null,ctx);}catch{return prepare(m,null,null,ctx);}}),more:list.length>30,before:visible.at(-1)?.sequence,imported:!list[visible.length]&&visible.at(-1)?.type==='legacy-import'?states.get(visible.at(-1).sequence):null};
 }
 const changeLines=(r,ctx,covered)=>changeRows(r,ctx,covered).map(v=>v.text);
 const api={prepare,readPage,chunks,changeLines};if(typeof module!=='undefined')module.exports=api;else root.SpacetraderJournalFeed=api;
})(typeof window!=='undefined'?window:globalThis);
