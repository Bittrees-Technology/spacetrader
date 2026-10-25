'use strict';
const assert=require('node:assert/strict'),E=require('../../Browser/engine.js'),{ready,start,play}=require('./combat-v2-balance.cjs');
function escort(s,id){const h=E.ships.find(h=>h.id===id);s.fleet.push({id:'escort-001',name:'Support review',shipID:id,location:s.location,hull:100,fuel:h.tankTonnes*.5,spares:h.maxSpares,cargo:{},cargoBasis:{},upgrades:Object.fromEntries(E.upgradeCatalog.map(m=>[m.id,0])),ammo:0,ordnanceAmmo:0,fittingEdition:2,escort:true});}
function loneEnemy(s){for(const enemy of s.battle.enemies.slice(1))delete s.battle.units[enemy.id];s.battle.enemies=s.battle.enemies.slice(0,1);s.battle.enemies[0].intent='press';return s;}
function supportTurn(shipID,seed,order){let s=ready('kestrel',0,seed);escort(s,shipID);s=loneEnemy(start(s,2));s=E.transact(s,'battle-order',{actor:s.flagshipID,order:'approach'});s=E.transact(s,'battle-order',{actor:s.fleet[0].id,order});return s;}
let screens=0,normalHits=0,jammedHits=0;
for(let seed=1;seed<=160;seed++){
 const a=supportTurn('osprey',seed,'guard'),b=supportTurn('gannet',seed,'guard'),normal=120-a.battle.units[a.flagshipID].hp,screened=120-b.battle.units[b.flagshipID].hp;
 if(normal>0){assert(Math.abs(screened-normal*.9)<1e-8);screens++;}
 const c=supportTurn('nightjar',seed,'guard'),d=supportTurn('nightjar',seed,'jam');normalHits+=c.hull<100;jammedHits+=d.hull<100;
}
assert(screens>20);assert(jammedHits<normalHits);
let s=loneEnemy(start(ready('nightjar',0,4),2));s.battle.round=3;s.battle.units[s.flagshipID].shield=0;s.battle.units[s.flagshipID].lastHit=1;s.battle.enemies[0].heat=100;s=E.transact(s,'battle-order',{actor:s.flagshipID,order:'guard'});assert.equal(s.battle.units[s.flagshipID].shield,E.combatProfile(s).shieldRecharge);
s=loneEnemy(start(ready('nightjar',0,4),2));s.battle.round=3;s.battle.units[s.flagshipID].shield=0;s.battle.units[s.flagshipID].lastHit=1;s.battle.heat[s.flagshipID]=50;s.battle.enemies[0].heat=100;s=E.transact(s,'battle-order',{actor:s.flagshipID,order:'jam'});assert.equal(s.battle.units[s.flagshipID].shield,0,'Heat 80 prevents shield recharge');
for(const reputation of [0,-10]){let v=ready('gyrfalcon',3,5);v.profile.reputationScore=reputation;v.incident={id:'wanted-review',kind:'pirate',bountyID:'red-wake',destination:'earth',title:'Wanted contact',detail:'Review',damage:12,delay:3};v=play(E.transact(v,'resolve',{choice:'fight'}));const expected=Math.round(E.notoriousRaiders().find(t=>t.id==='red-wake').reward*(reputation<0?1:1.15));assert.equal(v.battleHistory.at(-1).reward,0);assert.equal(v.capturedBounties.find(t=>t.id==='red-wake').reward,expected);assert(v.claimedBounties.includes('red-wake'));const cash=v.credits;v=E.transact(v,'claim-bounty',{id:'bounty-red-wake'});assert.equal(v.credits,cash+expected);assert.throws(()=>E.transact(v,'claim-bounty',{id:'bounty-red-wake'}));}
let escaped=0;for(let seed=1;seed<=40;seed++){let v=start(ready('merlin',0,seed),3),fuel=v.fuel;v=E.transact(v,'battle-order',{actor:v.flagshipID,order:'screen'});assert(v.fuel<fuel);if(!v.battle){assert(['escaped','defeat'].includes(v.battleHistory.at(-1).outcome));escaped+=v.battleHistory.at(-1).outcome==='escaped';}else assert.equal(v.battle.round,2);}assert(escaped>10&&escaped<40);
console.log('PASS: convoy screen damage, targeting interference, recharge delay and overheating, one-time warrant bonus and solo Merlin screened withdrawal.');
