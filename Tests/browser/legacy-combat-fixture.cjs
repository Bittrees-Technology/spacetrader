'use strict';
// Load an already-started pre-0.27 raid, never launch one through the current patrol office.
const snapshots=require('./legacy-raid-battles.json').templates;
module.exports=function legacyCombat(E,input,tier=1){const s=E.clone(input),data=E.clone(snapshots[tier]);s.battle=data.battle;s.incident=data.incident;s.battle.id=E.raidOffers(s).find(r=>!r.bountyID&&r.tier===tier).id;s.battle.destination=s.incident.destination=s.location;s.profile.stats.battles++;return E.parse(JSON.stringify(s));};
