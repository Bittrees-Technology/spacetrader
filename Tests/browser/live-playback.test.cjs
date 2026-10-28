'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),E=require('../../Browser/engine'),{ready,start}=require('./combat-v2-balance.cjs');
const src=fs.readFileSync('Browser/app.js','utf8');let passed=0;
function rig(){
 const timers=new Map(),events=[],changes=[],listener={};let id=0;
 const c={E,state:start(ready('osprey',3,3),2),screen:'battle',modalKind:'',battleActor:'',battleTarget:'hostile-0',battleOrderPending:false,battleFeedback:'',sharedBusy:false,performance:{now:()=>0},document:{hidden:false,addEventListener:(event,fn)=>listener[event]=fn},window:{addEventListener:(event,fn)=>listener[event]=fn},setTimeout:(fn,ms)=>{timers.set(++id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),toast:m=>events.push(m),syncBattleControlState:()=>{},refreshBattleControls:()=>events.push('refresh')};
 c.battleActor=c.state.flagshipID;vm.createContext(c);
 vm.runInContext(src.slice(src.indexOf('let liveTickPending='),src.indexOf('function liveBattleMarkup()')),c);
 c.act=async(type,args)=>{changes.push({type,args});c.state=E.transact(c.state,type,args);return true;};
 return {c,timers,changes,events,listener,run:code=>vm.runInContext(code,c)};
}
async function engage(r){await r.c.handleLiveBattleControl({dataset:{action:'live-start'}});}
async function test(name,run){await run();passed++;console.log('PASS '+name);}
(async()=>{
 await test('Engage starts one continuous 500ms clock; repeated Engage cannot duplicate it',async()=>{
  const r=rig();assert(!r.run('liveRunning'));assert.equal(r.timers.size,0);await engage(r);
  assert(r.c.state.battle.live.engaged);assert.equal(r.c.state.battle.live.edition,2);
  assert.equal(r.changes.length,1);assert.equal(r.timers.size,1);assert.equal([...r.timers.values()][0].ms,500);
  await engage(r);assert.equal(r.changes.length,1);assert.equal(r.timers.size,1);
 });
 await test('pending exchanges serialize and a failed acknowledgement stops the clock',async()=>{
  const r=rig();await engage(r);r.changes.length=0;let release;
  r.c.act=async(type,args)=>{r.changes.push({type,args});await new Promise(resolve=>release=resolve);return false;};
  const first=r.c.advanceLiveBattle();await r.c.advanceLiveBattle();assert.equal(r.changes.length,1);
  release();await first;assert(!r.run('liveRunning'));assert(!r.run('livePending'));assert(!r.run('liveTickPending'));assert.equal(r.timers.size,0);
 });
 await test('opening a page or backgrounding does not tactically pause an engaged battle',async()=>{
  const r=rig();await engage(r);r.c.modalKind='utility';r.c.pauseLiveBattle('Paused while a page is open.');
  assert(r.run('liveRunning'));assert.equal(r.timers.size,1);r.c.document.hidden=true;r.c.pauseLiveBattle('Game moved to background');
  const step=r.c.state.battle.live.step;await r.c.advanceLiveBattle();assert.equal(r.c.state.battle.live.step,step+1);assert(r.run('liveRunning'));
 });
 await test('reconnecting schedules the next exchange without a backlog of elapsed ticks',async()=>{
  const r=rig();await engage(r);r.c.pauseLiveBattle('Paused after loading recorded progress.');assert.equal(r.timers.size,0);
  const step=r.c.state.battle.live.step;r.c.resumeRecordedBattle();assert(r.run('liveRunning'));assert.equal(r.timers.size,1);assert.equal(r.c.state.battle.live.step,step);assert.equal([...r.timers.values()][0].ms,500);
 });
 await test('transport errors release pending controls and leave a reconnect fault',async()=>{
  const r=rig();await engage(r);r.c.act=async()=>{throw Error('Disconnected');};await r.c.advanceLiveBattle();
  assert(!r.run('liveRunning'));assert(r.run('liveFault'));assert(!r.run('livePending'));assert(!r.run('liveTickPending'));assert(!r.c.battleOrderPending);assert.equal(r.timers.size,0);assert(r.events.includes('Disconnected'));
 });
 console.log(passed+' current continuous-playback scenarios passed.');
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
