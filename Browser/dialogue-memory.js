'use strict';
// Bounded personal memories, committed only by actual dialogue actions. Views never write.
(function(root){
function create({port,standing,sessionFor,commissionFor,voices,discussionValid=()=>false,reportContext=()=>null}){
 const reportTopics=['tree-bank-rates','tree-patrol-blockades','tree-reputation-rumor','tree-career-travellers','tree-career-outside'];
 const topicOK=k=>typeof k==='string'&&/^(?:tree-|op-discover-|campaign-intro-)[a-z-]{1,48}$/.test(k);
 const eventKinds=['promise-failed','promise-kept','freight-failed','delivery','aid','victory','fleet','standing-down','standing-up','debt','liberation','loss','crew','relic'];
 const priority=k=>({'promise-failed':0,'freight-failed':1,loss:2,liberation:3,'promise-kept':4,crew:5,relic:6,'standing-down':7}[k]??10);
 function snapshot(s,id,contact){const st=s.profile.stats,q=commissionFor(s,id,contact),r=standing(s);return {day:s.day,deliveries:st.deliveries||0,victories:st.victories||0,aid:st.aid||0,voyages:st.voyages||0,failures:s.freightStanding?.failures||0,publicScore:r.publicScore,localScore:r.score,debt:s.debt,ship:s.shipID,fleet:s.fleet.length+1,commission:q?.status||'none',commissionID:q?.id||'',losses:(s.shipLosses||[]).length,liberations:[...new Set([...(s.blockades?.jobs||[]).filter(j=>j.clearedDay!=null).map(j=>j.destination),...(s.blockadeWorld?.stations||[]).filter(j=>j.clearedDay!=null).map(j=>j.port)])].sort().join(','),crew:(s.namedCrew?.members||[]).filter(m=>m.releasedDay===null).map(m=>m.id).sort().join(','),relics:(s.cantina?.relics||[]).slice().sort().join(',')};}
 function read(s,id,h,session=sessionFor(s,id,h.contactID||'')){
  if(session.memory)return session.memory;
  const topics={};for(const k of session.resolved||[])topics[k]={count:1,firstDay:s.day,lastDay:s.day};
  const history=s.dialogue.filter(l=>l.port===s.location&&l.venue===id&&(l.contact||'')===(h.contactID||'')&&l.partner===h.person&&l.speaker===h.person);
  for(const [k,fact] of [['tree-story',h.character.history],['tree-interests',h.character.interest],['tree-support',h.character.goal]])if(history.some(l=>l.text.includes(fact)))topics[k]={count:1,firstDay:s.day,lastDay:s.day};
  return {version:2,total:Object.keys(topics).length,firstDay:s.day,lastDay:s.day,firstVoyages:s.profile.stats.voyages||0,lastTopic:'',topics,pending:[],last:null};
 }
 function pending(s,id,h,m,now){const last=m.last,events=[...(m.pending||[])],add=(kind,text)=>{const event={kind,text,day:s.day};const old=events.findIndex(e=>e.kind===kind);if(old>=0)events[old]=event;else events.push(event);};
  if(last){
   if((now.commission!==last.commission||now.commissionID!==(last.commissionID||''))&&now.commission==='failed')add('promise-failed',commissionFor(s,id,h.contactID||'')?.failureReason==='falsified'?'The signed project ended after a false certification.':'The personal commission we agreed on missed its deadline.');
   if((now.commission!==last.commission||now.commissionID!==(last.commissionID||''))&&now.commission==='completed')add('promise-kept','You completed the personal commission we agreed on.');
   if(now.failures>last.failures){const reasons=new Set((s.freightStanding?.history||[]).slice(-Math.min(50,now.failures-last.failures)).map(r=>r.reason));add('freight-failed',reasons.has('stolen')?'Your filed freight record includes deliberate client-cargo theft.':reasons.has('lost')?'Your filed freight record includes lost client cargo. Loss and deliberate theft are different things.':reasons.has('late')?'Your filed freight record includes a missed delivery deadline.':'Your filed freight record includes a breached delivery.');}
   if(now.deliveries>last.deliveries)add('delivery','Your public record lists '+(now.deliveries-last.deliveries)+' more completed '+(now.deliveries-last.deliveries===1?'delivery':'deliveries')+' since our last exchange.');
   if(now.aid>last.aid)add('aid','You have contributed supplies to a clinic reserve since we last spoke.');
   if(now.victories>last.victories)add('victory','Your public record includes another raider victory since we spoke.');
   if(now.ship!==last.ship||now.fleet!==last.fleet)add('fleet','Your registered fleet has changed since we last spoke.');
   if(now.publicScore<=last.publicScore-5||now.localScore<=last.localScore-5)add('standing-down','Your public or local standing has fallen since our last conversation.');else if(now.publicScore>=last.publicScore+5||now.localScore>=last.localScore+5)add('standing-up','Your record here or across the ports has improved since we spoke.');
   if(id==='bank'&&now.debt<last.debt-1)add('debt','Your recorded network debt is lower than when we last spoke.');
   if(last.losses!==undefined&&now.losses>last.losses)add('loss','The loss register records '+(s.shipLosses||[]).slice(-1).map(v=>v.name||v.shipName||'a vessel').join('')+'. I would rather hear your account than assume what happened to the crew.');
   if(last.liberations!==undefined&&now.liberations!==last.liberations){const old=new Set(last.liberations.split(',')),ids=now.liberations.split(',').filter(x=>x&&!old.has(x));if(ids.length)add('liberation','The clearance register records liberation at '+ids.map(x=>port(x).name).join(', ')+'. That result deserves a separate conversation from an ordinary patrol return.');}
   if(last.crew!==undefined&&now.crew!==last.crew)add('crew','Your named travelling crew has changed. A signing or a departure is part of a voyage, too.');
   if(last.relics!==undefined&&now.relics!==last.relics)add('relic','Your recorded relic collection has changed. A documented instrument has a history as well as a practical use.');
  }
  return events.sort((a,b)=>priority(a.kind)-priority(b.kind)||a.day-b.day).slice(0,16);
 }
 function overview(s,id,h,session=sessionFor(s,id,h.contactID||'')){
  const m=read(s,id,h,session),q=commissionFor(s,id,h.contactID||''),r=standing(s),now=snapshot(s,id,h.contactID||''),events=pending(s,id,h,m,now);
  const known=m.total>0,personal=['tree-story','tree-listen','tree-interests','tree-support'].some(k=>m.topics[k]),shared=q?.status==='completed'||!!m.topics['tree-confide']||now.voyages>(m.firstVoyages??m.last?.voyages??now.voyages),trusted=!session.patron?.blocked&&shared&&(session.rapport>=3||q?.status==='completed');
  const relation=session.rapport<0?'strained':session.patron?.blocked?'disappointed':q?.status==='failed'&&!(session.rapport>=3&&r.effective>=10)?'disappointed':r.effective<=-20?'wary':trusted?'trusted':known?'acquainted':'new';
  return {relation,rapport:session.rapport,known,personal,trusted:relation==='trusted',shared,events,topics:m.topics,total:m.total,commission:q?.status||'none',publicScore:r.publicScore,localScore:r.score,discussion:m.event||null,lastDay:m.last?m.lastDay:null};
 }
 // Explain the recorded breach rather than treating every apology as bad manners.
 function breach(s,id,h){
  const session=sessionFor(s,id,h.contactID||''),q=commissionFor(s,id,h.contactID||''),reason=session.patron?.reason||'';
  if(/false certification/i.test(reason)||q?.failureReason==='falsified')return {choice:'I filed a false certification. I am sorry for misleading the people relying on it.',reply:'You certified work the record did not support. Thank you for acknowledging the false report. The lost payment and damaged trust still stand.'};
  if(q?.status==='failed')return {choice:'I missed the deadline I agreed with you. I am sorry for leaving people waiting.',reply:'You left an agreed job unfinished at its deadline. I appreciate the acknowledgement; the failed agreement remains on the record.'};
  if(/theft|stol|client.cargo/i.test(reason))return {choice:'I took cargo that was entrusted to me. I am sorry.',reply:'Those supplies belonged to someone else. Acknowledging the theft does not restore their cargo or erase the breach.'};
  if(/threat/i.test(reason))return {choice:'I threatened you. I am sorry; that was unacceptable.',reply:'Thank you for acknowledging the threat. We can speak again, but trust needs more than an apology.'};
  if(/unsafe|shortcut/i.test(reason))return {choice:'I demanded an unsafe shortcut. I am sorry for putting you in that position.',reply:'The checks protect people who were not in this room. We can resume the conversation without that demand.'};
  return null;
 }
 function choice(s,id,h,key,fallback){
  const v=overview(s,id,h),{c,style,job}=voices.context(s,id,h),heard=key=>!!v.topics[key];
  const labels={
   'tree-project-work':'I have a private project that needs your help. Can we review it?',
   'tree-patron':'Could we talk about working together personally?',
   'tree-private-offer':'Is there a private undertaking you would entrust to me?',
   'tree-introduce':'Would you put in a word for me with someone here?',
   'tree-patron-deal':'What supplies did you set aside for me?',
   'tree-repair-trust':'What would it take to earn back your trust?',
   'tree-reconnect':heard('tree-support')?'How are you getting on with your plan to '+c.goal+'?':heard('tree-interests')?'Have you found time for '+c.interest+' since we spoke?':'I have been thinking about the story you told me.',
   'tree-record':v.events[0]?.kind==='freight-failed'?'You may have seen the breach on my freight record.':v.events[0]?.kind==='delivery'?'Have you heard about the deliveries I finished?':v.events[0]?.kind==='aid'?'Has news of my clinic contribution reached you?':'Things have changed since we last spoke. Can we talk about that?',
   'tree-relationship':v.relation==='strained'?'Can we talk about how our last exchange ended?':v.relation==='disappointed'?'I owe you an explanation about that commission.':v.relation==='wary'?'Has my public record changed how you see me?':'How do you feel about working with me now?',
   'tree-check-promise':'Can we go over the promise I made you?',
   'tree-acknowledge':[...v.events,...(v.discussion?[v.discussion]:[])].some(e=>['freight-failed','standing-down','promise-failed'].includes(e.kind))?'I should acknowledge what went wrong.':'I wanted you to hear it from me as well as the record.',
   'tree-explain':'What does that change between us?',
   'tree-reassure':'I would rather be judged by what I do next.',
   'tree-confide':'Would you tell me something you would not share with a stranger?',
   'tree-regret':'What still troubles you about this work?',
   'tree-boundary':'What would make you lose the trust we have built?',
   'tree-recall-interest':'You mentioned '+c.interest+'. How does that fit into life now?',
   'tree-recall-goal':'You said you hoped to '+c.goal+'. What comes next?'
  };
  if(key==='tree-apologize'){const b=breach(s,id,h);if(b)return b.choice;}
  if(Object.hasOwn(labels,key))return labels[key];
  if(key==='tree-work'&&heard('tree-work'))return v.relation==='strained'?'Can we keep this professional and talk about '+job.subject+'?':(v.topics[key].count===1?'Could you give me a worked example of '+job.subject+'?':v.topics[key].count===2?'What trade-off should I watch in '+job.subject+'?':'Is there anything new to add on '+job.subject+'?');
  if(key==='tree-careful'&&heard('tree-careful'))return 'Can we revisit the check you showed me?';
  if(key==='tree-needs'&&v.relation==='wary')return 'Is there work you would still consider me for, given my record?';
  if(key==='tree-needs'&&v.trusted)return 'Is there another small promise you would trust me with?';
  if(key==='tree-story'&&v.personal)return 'There is more I wanted to ask about your earlier life.';
  return fallback;
 }
 function reply(s,id,h,key,original,session){
  const v=overview(s,id,h,session),{c,p,style,job}=voices.context(s,id,h),heard=v.topics[key]?.count||0;
  const relationship={
   strained:({direct:'I remember the demand you made. Keep this professional.',precise:'Our earlier exchange left a question about how you handle disagreement.',warm:'I would like this to go better than our last exchange. I still need you to respect the boundary.',wry:'I remember our previous attempt at diplomacy. Let’s improve on it.',curious:'What would you do differently from the last time you pressed that demand?',reflective:'An apology can reopen a conversation. It does not make the earlier words unspoken.',lively:'We can talk, but we need a better approach than the last one.'})[style],
   disappointed:session.patron?.blocked?`${session.patron.reason} I have suspended my private opportunities and recommendations. An apology can reopen the conversation, but restoring trust takes new actions.`:`I remember the commission you accepted from me, and that its deadline passed. That is a particular promise between us, rather than a rumour about another port.`,
   wary:`Your public and local record gives me reason to be careful. I can discuss the public services, but a personal introduction is a different matter.`,
   trusted:({direct:'You listened, and you have given me reason to take your promises seriously.',precise:'Our previous exchanges give me something more reliable than a first impression.',warm:'I know you well enough now to speak a little more openly.',wry:'You have survived enough of my explanations that I can dispense with the introductory speech.',curious:'You ask follow-up questions and listen to the answers. That changes the conversation.',reflective:'We have enough shared history now that every question does not have to begin at the doorway.',lively:'It is good to speak with someone who remembers where the last conversation left off.'})[style],
   acquainted:`${v.personal?'I remember the time you took to talk about life beyond this desk.':'I remember our previous conversation here.'} I am still learning which promises you keep.`,
   new:`We are still getting to know one another. Your record matters, but it does not tell me everything about the person asking the question.`
  }[v.relation];
  const eventText=v.events.length?`Your filed record, ship-day ${v.events[0].day}: ${v.events[0].text}`:session.node==='record'&&v.discussion?v.discussion.text:`I have no new change in the public record to discuss. I do remember the conversations we have had here.`;
  const special={
   'tree-reconnect':`${v.topics['tree-interests']?'You remembered my interest in '+c.interest+'.':v.topics['tree-support']?'We talked about my hope to '+c.goal+'.':'You took time to hear where I had come from.'}\n\n${relationship} I have no grand new chapter to announce, but there is more to talk about than the first introduction.`,
   'tree-record':`${eventText}\n\n${relationship}`,
   'tree-next-record':`${eventText}\n\n${relationship}`,
   'tree-relationship':`${relationship}\n\n${v.commission==='completed'?'You also came back and finished the commission we agreed on.':v.rapport>0?'The way you asked about my work and listened to the answer counts for something here.':v.relation==='wary'?'I can see the public record. I will need actions, rather than an assurance that the figures are unfair.':c.value}`,
   'tree-acknowledge':`${[...v.events,...(v.discussion?[v.discussion]:[])].some(e=>['freight-failed','standing-down','promise-failed'].includes(e.kind))?'Acknowledging a problem is a start; it does not undo the people left waiting.':'I appreciate hearing the account without having to piece it together from another desk.'}\n\n${c.value}`,
   'tree-explain':`${relationship}\n\n${v.trusted?'I can be more candid with you. Any actual service, licence or commission still has its own terms.':'I will judge the next promise against what you actually do. The public services and their terms remain available.'}`,
   'tree-reassure':`${({direct:'Then show me through the next promise you keep.',precise:'A statement of intent is useful when later action supports it.',warm:'I would welcome that. Start with something you can actually finish.',wry:'A sound proposal. It will be especially persuasive after the doing part.',curious:'What could I observe next time that would show the difference?',reflective:'The next action can change the meaning of this conversation. It cannot be replaced by repeating it.',lively:'All right. Keep the next commitment small enough that you can finish it.'})[style]}\n\n${job.priorities[0]}`,
   'tree-confide':`${relationship}\n\n${c.history} I do not normally connect that history with the way I handle this desk, but it is part of why I care about ${job.subject}.`,
   'tree-regret':`${({direct:'I remember the people I could not help, even when the paperwork was sound.',precise:'I worry about the point where a formally correct answer stops being useful to the person receiving it.',warm:'I sometimes wonder whether I noticed a tired person quickly enough.',wry:'I have an excellent memory for the moment just before I should have asked one more question.',curious:'I keep returning to the assumptions I did not know I was making.',reflective:'There are handovers that ended properly and still did not feel finished.',lively:'I can fill a quiet shift with the things I wish I had tried sooner.'})[style]}\n\n${c.value}`,
   'tree-boundary':`Demanding that I ignore the people who rely on ${job.subject} would do it. So would treating something personal as a way around an agreed term.\n\n${c.value} Familiarity should make us more honest, rather than less careful.`,
   'tree-recall-interest':`${c.interest.charAt(0).toUpperCase()+c.interest.slice(1)} is still part of my time away from work. You remembered that instead of asking me to introduce myself again.\n\n${c.mood} ${v.trusted?'I would be comfortable talking more about why it matters.':'There is room to talk about it without turning it into another promise.'}`,
   'tree-recall-goal':`The hope is still to ${c.goal}. I am trying to make time for it between shifts. I would rather tell you about a step I have actually taken than pretend the whole plan is finished.\n\n${c.value} ${v.trusted?'I can talk about the doubts as well as the plan now.':'I would rather make a small beginning than invent progress for a returning visitor.'}`
  };
  if(key==='tree-apologize'){const b=breach(s,id,h);if(b)return b.reply;}
  if(Object.hasOwn(special,key))return special[key];
  const binding=['tree-bounties','tree-bounty-accept','tree-bounty-refresh','tree-bounty-later','tree-bounty-decline','tree-market','tree-market-bargains','tree-market-premiums','tree-market-selling','tree-market-route','tree-offer-later','tree-offer-decline','tree-patron-buy','tree-private-offer','tree-patron-deal','tree-project-work','tree-accept','tree-complete','tree-offer','tree-check-promise','tree-receipt','tree-timing','tree-custody','tree-clarify','tree-record-lead'];
  if(binding.includes(key)||key.startsWith('tree-bounty-'))return original;
  let text=original;
  if(heard&&['tree-story','tree-interests','tree-support','tree-work','tree-careful'].includes(key)){
   if(['tree-work','tree-careful'].includes(key)){
    const n=Number(voices.context(s,id,h).n||0);
    text=heard===1?`A worked example: ${job.mistakes[(n+1)%3]} ${job.repairs[(n+1)%3]}`:heard===2?`The trade-off is speed against a handover another person can trust. ${job.priorities[(n+2)%3]} ${job.handover}`:`I have no new lesson to add on ${job.subject} today. We can look at your current situation, discuss another subject, or return to the service panel.`;
   }else if(key==='tree-story')text=heard===1?`What stays with me is the judgement behind that earlier experience. ${c.value}`:`I have no further chapter of that story to add today. We can talk about life here or something you need from this desk.`;
   else if(key==='tree-interests')text=heard===1?`For me, ${c.interest} is time that does not need to become another job. ${c.mood}`:`There is no new development to announce about ${c.interest}. What else would you like to talk about?`;
   else text=heard===1?`The difficulty is making room for that hope alongside everyday obligations. ${c.value} I have no completed step to announce.`:`My hope to ${c.goal} has not become a new accomplishment since we spoke. Let’s discuss another subject or a specific piece of work.`;
  }
  if(['strained','disappointed','wary'].includes(v.relation)&&['tree-work','tree-needs','tree-story'].includes(key))text=relationship+'\n\n'+text;
  return text;
 }
 function remember(s,id,h,session,topic){
  const old=read(s,id,h,session),events=overview(s,id,h,session).events,topics={...old.topics},previous=topics[topic],discussed=['tree-record','tree-next-record'].includes(topic)?events[0]:null;
  if(topicOK(topic))topics[topic]={count:Math.min(10000,(previous?.count||0)+1),firstDay:previous?.firstDay??s.day,lastDay:s.day};
  const anchors=new Set(['tree-story','tree-listen','tree-interests','tree-support','tree-work','tree-careful','tree-pressure','tree-pry','tree-threat','tree-apologize','tree-confide']);
  for(const [k] of Object.entries(topics).filter(([k])=>k!==topic&&!anchors.has(k)).sort((a,b)=>a[1].lastDay-b[1].lastDay)){if(Object.keys(topics).length<=24)break;delete topics[k];}
  const reports={...old.reports};if(reportTopics.includes(topic)){const signature=reportContext(s,id,h,topic);if(signature)reports[topic]={signature,day:s.day};}
  session.memory={...(old.discussion?{discussion:old.discussion}:{}),...(Object.keys(reports).length?{reports}:{}),version:2,total:Math.min(1000000,old.total+1),firstDay:old.firstDay,lastDay:s.day,firstVoyages:old.firstVoyages??old.last?.voyages??(s.profile.stats.voyages||0),lastTopic:topic,topics,pending:discussed?events.slice(1):events,event:discussed||old.event||null,last:snapshot(s,id,h.contactID||'')};
 }
 function valid(m,s){
  if(m===undefined)return true;const int=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b,obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
  if(!obj(m)||![1,2].includes(m.version)||!int(m.total,1,1000000)||!int(m.firstDay,0,s.day)||!int(m.lastDay,m.firstDay,s.day)||!topicOK(m.lastTopic)||!obj(m.topics)||Object.keys(m.topics).length>24)return false;
  if(!Object.entries(m.topics).every(([k,v])=>topicOK(k)&&obj(v)&&int(v.count,1,10000)&&int(v.firstDay,m.firstDay,m.lastDay)&&int(v.lastDay,v.firstDay,m.lastDay)))return false;
  if(m.reports!==undefined&&(!obj(m.reports)||Object.keys(m.reports).length>reportTopics.length||!Object.entries(m.reports).every(([k,v])=>reportTopics.includes(k)&&obj(v)&&typeof v.signature==='string'&&/^[0-9a-f]{1,16}$/.test(v.signature)&&int(v.day,m.firstDay,m.lastDay))))return false;
  if(m.event!=null&&(!obj(m.event)||!eventKinds.includes(m.event.kind)||typeof m.event.text!=='string'||m.event.text.length>400||!int(m.event.day,m.firstDay,m.lastDay)))return false;
  if(m.version===2&&(!int(m.firstVoyages,0,1000000)||!Array.isArray(m.pending)||m.pending.length>16||new Set(m.pending.map(e=>e.kind)).size!==m.pending.length||!m.pending.every(e=>obj(e)&&eventKinds.includes(e.kind)&&typeof e.text==='string'&&e.text.length<=400&&int(e.day,m.firstDay,s.day))))return false;
  if(m.discussion!==undefined&&!discussionValid(m.discussion,s.day))return false;
  const v=m.last;if(!obj(v)||v.day!==m.lastDay||!['deliveries','victories','aid','voyages','failures','debt','fleet'].every(k=>int(v[k],0,999999999))||!int(v.publicScore,-100,100)||!int(v.localScore,-100,100)||typeof v.ship!=='string'||v.ship.length>40||!['none','offered','active','completed','failed'].includes(v.commission))return false;
  if(m.version===2&&(!['commissionID','liberations','crew','relics'].every(k=>typeof v[k]==='string'&&v[k].length<=1000)||!int(v.losses,0,1000000)))return false;
  return true;
 }
 return {overview,choice,reply,remember,valid};
}
const api={create};if(typeof module!=='undefined')module.exports=api;else root.SpacetraderDialogueMemory=api;
})(globalThis);
