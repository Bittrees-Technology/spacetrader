'use strict';
const assert=require('assert/strict'),fs=require('fs'),vm=require('vm'),E=require('../../Browser/engine.js'),source=fs.readFileSync('Browser/app.js','utf8');
let s=E.transact(E.fresh(),'create',{name:'Desk refresh',background:'trader',temperament:'measured'});s.credits=50000;s.bank={deposits:{earth:1000},loans:[],legacyDebt:0};s.debt=0;s=E.transact(s,'borrow',{amount:10});
let side=0,full=0,persisted=0;
const noop=()=>{},ctx=vm.createContext({E,state:s,modalKind:'establishment',venueID:'bank',screen:'station',destination:'moon',contactID:'',outfitID:'',selectedSystem:'earth',marketQuantities:new Map(),audio:{action:noop},establishmentReceipt:()=>'',updateEstablishmentFeedback:noop,collectArrivalInspections:noop,refreshSidebarStats:()=>{side++;return true;},updateSaveLabel:noop,render:()=>{full++;},persist:()=>{persisted++;return true;},sharedStatus:()=> 'Recorded',announceCommodityUnlocks:noop,scheduleInspectionNotice:noop,scheduleCharterNotice:noop,toast:e=>{throw Error(e);}});
const a=source.indexOf('function applyAction('),b=source.indexOf('\n// One cached renderer',a);vm.runInContext(source.slice(a,b),ctx);
for(const type of ['deposit','withdraw','borrow','repay-local']){ctx.state=E.clone(s);const next=E.transact(s,type,{amount:1});assert.equal(ctx.applyAction(type,{amount:1},next,true),true);assert.equal(ctx.state.credits,next.credits);assert.equal(full,0);assert.equal(persisted,0);}
assert.equal(side,4);ctx.state=E.clone(s);ctx.venueID='market';assert.equal(ctx.applyAction('deposit',{amount:1},E.transact(s,'deposit',{amount:1}),true),true);assert.equal(full,1);
console.log('PASS acknowledged bank actions update sidebar once, avoid hidden station rebuilds, retain resolved state and preserve the full-render fallback');
