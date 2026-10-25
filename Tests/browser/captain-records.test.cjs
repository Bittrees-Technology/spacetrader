'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),E=require('../../Browser/engine'),exchanges=require('../../Browser/conversation-exchanges');
const src=fs.readFileSync('Browser/app.js','utf8'),state=E.parse(fs.readFileSync('Build/FleetDetailsReview/fixture.json','utf8'));
const htmlEscape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let opened,checks=0;
const ctx={E,state,SpacetraderExchanges:exchanges,esc:htmlEscape,fmt:n=>Number(n).toLocaleString('en-US'),date:d=>'Date '+d,rich:htmlEscape,btn:(label,action,data='',disabled=false,cls='')=>`<button data-action="${action}" class="${cls}" ${data} ${disabled?'disabled':''}>${label}</button>`,modalKind:'',financeReturn:false,financeSection:'',audio:{status:()=>({preferences:{muted:false}})},openModal:(kind,html)=>{opened={kind,html};},$:()=>({classList:{add:()=>{}}}),showUtility:name=>{opened={utility:name};},warehouseRegister:()=>'<p>Warehouse register</p>',establishmentTitle:id=>id};
vm.createContext(ctx);require('./station-label-test-helpers.cjs')(ctx);
for(const name of ['objectiveText','financeMoney','financeRow','captainPortraitHTML','sidebarRecordsHTML','sidebarFleetLinksHTML','sidebarBalanceModels','sidebarFundsHTML','taskRecords','tasksPanel','captainRecordPanel','journalRecords','journalLegacyRecords','journalDisplayChanges','journalEntryHTML','journalPanel','financeAccount','showFinancial','modalHead','gameMenuHTML','utilityTitle','relicCabinetPanel','namedCrewPanel','crewProfile','crewBenefit','crewBenefitStatus','crewProfileHTML','refreshVisitModal']){
 const a=src.indexOf('function '+name+'('),b=src.indexOf('\nfunction ',a+1);assert(a>=0,name);vm.runInContext(src.slice(a,b<0?src.length:b),ctx);
}
const test=(label,fn)=>{fn();checks++;console.log('PASS '+label);};
test('sidebar routes record links and balances to their exact destinations without replacing live value hooks',()=>{
 const nav=ctx.sidebarRecordsHTML(),funds=ctx.sidebarFundsHTML();for(const id of ['Tasks','Captain','Log'])assert(nav.includes('data-tab="'+id+'"'));
 for(const [key,destination] of [['deposits','Deposits'],['loans','Loans']]){assert(funds.includes('data-section="'+destination+'"'));assert(funds.includes('data-sidebar-balance="'+key+'"'));assert(funds.includes('aria-describedby="sidebar-'+key+'"'));}
 assert(funds.includes('data-sidebar-balance="cash"'));assert(!funds.includes('Net worth'));
});
test('tasks sort mixed accepted work by earliest deadline, with undated work last, and omit inactive offers',()=>{
 const original=ctx.E;ctx.E={...E,freightOverview:()=>({jobs:[{id:'freight',destination:'moon',good:'water',quantity:4,aboard:4,deadline:9,reward:200}]}),commissionJournal:()=>[{id:'personal',title:'Private work',description:'Deliver supplies. Earn 10 XP.',port:'earth',venue:'warehouse',deadline:8,reward:400,progress:'Ready',host:'Host'}],missionJournal:()=>({active:[{id:'specialist',title:'Survey',description:'Survey a route.',origin:'earth',destination:'moon',venue:'relay',deadline:7,reward:300}],history:[{id:'old'}]}),diplomaticOverview:()=>({active:[{id:'mandate',title:'Treaty',description:'Carry the record.',nextPort:'moon',deadline:6,reward:500}]}),passengerManifest:()=>[{id:'passenger',count:2,destination:'moon',deadline:5,reward:600,shipName:'Courier'}],underworldOverview:()=>({quests:[{id:'private',title:'Archive',description:'Recover an archive.',status:'active',kind:'survey',origin:'earth',target:'moon',deadline:4,reward:700,relicName:'Archive'},{status:'completed',id:'finished'}]}),bountyOffers:()=>[{id:'accepted',title:'Accepted bounty',accepted:true,reward:800},{id:'posted',accepted:false},{id:'completed',accepted:true,completed:true}],independentCharter:()=>({earned:true})};
 const rows=ctx.taskRecords(),html=ctx.tasksPanel();assert.equal(rows.length,7);assert.equal(new Set(rows.map(r=>r.id)).size,7);assert(!rows.some(r=>['posted','completed','finished','old'].includes(r.id)));assert(!/\bXP\b/.test(html));assert(!/data-action="(?:accept|mission-accept|diplomatic-accept|bounty-accept)"/.test(html));assert.deepEqual(Array.from(rows,r=>r.id),['private','passenger','mandate','specialist','personal','freight','accepted']);assert.deepEqual(Array.from(rows,r=>r.deadline??null),[4,5,6,7,8,9,null]);ctx.E=original;
});
test('sidebar berth button counts only local reserve ships and hides for remote or active ships',()=>{
 const original=ctx.state;let fresh=E.transact(E.fresh(),'create',{name:'Local berth QA',background:'engineer',temperament:'measured'});fresh.credits=1000000;ctx.state=fresh;
 assert(!ctx.sidebarFleetLinksHTML().includes('data-action="fleet-berths"'));
 fresh=E.transact(fresh,'purchase-ship',{ship:'kestrel'});ctx.state=fresh;assert(ctx.sidebarFleetLinksHTML().includes('At berth · 1'));
 const reserve=fresh.fleet[0];reserve.location='moon';assert.equal(E.fleetStatus(fresh).berthedCount,1);assert(!ctx.sidebarFleetLinksHTML().includes('data-action="fleet-berths"'));
 reserve.location=fresh.location;assert(ctx.sidebarFleetLinksHTML().includes('At berth · 1'));
 ctx.state=E.transact(fresh,'escort',{id:reserve.id});assert(ctx.sidebarFleetLinksHTML().includes('Fleet · 2'));assert(!ctx.sidebarFleetLinksHTML().includes('data-action="fleet-berths"'));
 const funds=ctx.sidebarFundsHTML();assert(funds.includes('Bank deposits'));assert(funds.includes('>Loans</button>'));assert(!funds.includes('Total bank deposits'));assert(!funds.includes('Total loans'));ctx.state=original;
});
test('journal is a chronological flat ledger with complete dated rumor reports and visited commodity locations',()=>{
 const rows=ctx.journalRecords(),html=ctx.journalPanel();assert(rows.length>0);for(let i=1;i<rows.length;i++)assert((rows[i-1].day??-1)>=(rows[i].day??-1));
 assert(!/<(?:details|summary|select|button|input)\b/.test(html));const rumor=E.tradeRumorJournal(state)[0];assert(html.includes(rumor.commodity)&&html.includes(rumor.dealStation)&&html.includes(rumor.speaker)&&html.includes('Date '+rumor.day));assert(html.includes(htmlEscape(E.journalText(E.immersiveText(rumor.text))).slice(0,80)));
 ctx.state=E.transact(E.fresh(),'create',{name:'Fresh record QA',background:'engineer',temperament:'measured'});const directory=ctx.journalPanel().split('class="journal-known"')[1];assert(directory.includes('Meridian Station'));assert(!directory.includes('Caloris Observatory'));ctx.state=state;
});
test('captain record owns net worth and asset breakdown; menu no longer duplicates sidebar pages or balances',()=>{
 const html=ctx.captainRecordPanel(),menu=ctx.gameMenuHTML();assert(html.includes('Net worth'));assert(html.includes(ctx.financeMoney(E.financialOverview(state).netWorth)));assert(html.includes('Assets & accounts'));assert(!menu.includes('Net worth'));assert(!menu.includes('game-menu-finances'));for(const name of ['Captain’s record','Journal','Finances'])assert(!menu.includes(name));assert.equal(ctx.utilityTitle('Captain'),'Captain’s record');
});
test('deposit and loan pages are flat account lists with rates, clear zero states and correct titles',()=>{
 for(const section of ['Deposits','Loans']){ctx.showFinancial(section);assert.equal(opened.kind,'financial');assert(opened.html.includes('<h2 id="modal-title">'+section+'</h2>'));assert(!/<details\b/.test(opened.html));assert(!opened.html.includes('Net worth'));assert(opened.html.includes(section==='Deposits'?'No bank deposits yet.':'% / year · Fixed'));}
 ctx.showFinancial('Overview');assert.equal(opened.utility,'Captain');
});
test('charter loans identify their actual creditor and mark Here only at Meridian without changing the account',()=>{
 const previous=ctx.state;ctx.state=E.transact(E.fresh(),'create',{name:'Charter location QA',background:'engineer',temperament:'measured'});
 for(const location of ['earth','earth-high','moon','mars']){
  ctx.state.location=location;const before=JSON.stringify(ctx.state),loan=E.financialOverview(ctx.state).loans.find(a=>a.id==='charter'),html=ctx.financeAccount(loan,false);
  assert(html.includes('Original charter loan'));assert(html.includes('Meridian Station Credit Cooperative · Orbit · Earth'));assert.equal(html.includes(' · Here'),location==='earth');assert(html.includes('4.00% / year · Fixed'));assert(html.includes(ctx.financeMoney(loan.balance)));assert(!html.includes('Charter account'));assert.equal(JSON.stringify(ctx.state),before);
 }
 ctx.state=previous;
});
test('funded deposits show their branch rate and financial refresh preserves scroll and focus after a repayment',()=>{
 let fresh=E.transact(E.fresh(),'create',{name:'Funded account QA',background:'engineer',temperament:'measured'});fresh=E.transact(fresh,'deposit',{amount:100});ctx.state=fresh;ctx.showFinancial('Deposits');assert(opened.html.includes('100.00 cr'));assert(opened.html.includes((E.financialOverview(fresh).deposits[0].apr*100).toFixed(2)+'% / year · Floating'));
 const oldDollar=ctx.$,pane={scrollTop:150};let focused=false;ctx.$=()=>({querySelector:()=>pane,querySelectorAll:()=>[{dataset:{section:'Loans'},focus:()=>{focused=true;}}],classList:{add:()=>{}}});ctx.document={activeElement:{dataset:{section:'Loans'}}};ctx.screen='station';ctx.modalKind='financial';ctx.financeSection='Loans';ctx.state=E.transact(state,'repay',{amount:1000});ctx.refreshVisitModal();assert(opened.html.includes(ctx.financeMoney(ctx.state.debt)));assert.equal(pane.scrollTop,150);assert(focused);ctx.$=oldDollar;ctx.state=state;ctx.modalKind='';
});
test('record rendering is read-only and escapes player identity text',()=>{
 const before=JSON.stringify(state);for(let i=0;i<3;i++){ctx.taskRecords();ctx.tasksPanel();ctx.captainRecordPanel();ctx.journalPanel();ctx.showFinancial('Loans');}assert.equal(JSON.stringify(state),before);
 ctx.state=E.clone(state);ctx.state.profile.name='<img src=x onerror=alert(1)>';const html=ctx.captainRecordPanel();assert(html.includes('&lt;img src=x'));assert(!html.includes('<img src=x'));ctx.state=state;
});
console.log(checks+' captain records/navigation scenarios passed.');
