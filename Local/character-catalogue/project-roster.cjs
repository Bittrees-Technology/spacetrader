'use strict';
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'../..'),E=require(root+'/Browser/engine'),P=require(root+'/Browser/portrait-renderer');
// Offline reference export only. Never accept a voyage file or stdin as context.
const s=E.fresh();Object.assign(s,{castSeed:'887500000000001',day:0,shipName:'Reference vessel'});s.profile.name='Reference captain';
// A fixed synthetic baseline exposes every station, independent of all saves.
const original=JSON.stringify(s),fullGame=E.clone(s),stationIDs=E.world.ports.map(p=>p.id);
fullGame.unlocked=[...stationIDs];fullGame.visited=[...stationIDs];
const establishmentTypes={market:'Exchange',contracts:'Freight office',shipyard:'Dry dock',fleet:'Fleet registry',security:'Patrol office',relay:'Communications',clinic:'Clinic',local:'Canteen / commons',bank:'Credit cooperative',authority:'Port authority',warehouse:'Warehouse'};
const rows=E.characterRoster(fullGame).map(v=>({...v,establishmentType:establishmentTypes[v.id]||'',design:P.describe(v),appearance:P.appearance(v)}));
const staff=rows.filter(v=>!v.guest),keys=new Set(staff.map(v=>v.assignmentKey)),missing=[],unexpected=[];
const stations=E.world.ports.map(p=>{const expected=E.establishments(p.id).map(v=>p.id+':'+v.id+':'),actual=staff.filter(v=>v.port===p.id);for(const key of expected)if(!keys.has(key))missing.push(key);for(const v of actual)if(!expected.includes(v.assignmentKey))unexpected.push(v.assignmentKey);return {id:p.id,name:p.name,body:p.body,establishments:expected.length,staff:actual.length,guests:rows.filter(v=>v.port===p.id&&v.guest).length};});
const coverage={stationCount:stations.length,expectedStaff:stations.reduce((n,p)=>n+p.establishments,0),actualStaff:staff.length,complete:missing.length===0&&unexpected.length===0&&keys.size===staff.length&&stations.every(p=>p.staff===p.establishments),missing,unexpected};
if(!coverage.complete||JSON.stringify(s)!==original)throw Error('Complete world roster could not be verified.');
process.stdout.write(JSON.stringify({version:1,mode:'reference',reviewScope:'full-game',assignmentStatus:'fixed',coverage,reservedDesigns:rows.filter(v=>!v.guest).map(v=>({species:v.species,index:v.portraitIndex})),visitorStatus:'fixed reference examples; in-game visitors vary',stations,rows,counts:{staff:staff.length,guests:rows.filter(v=>v.guest).length,uniqueNames:new Set(rows.map(v=>v.person)).size,uniquePortraits:new Set(rows.map(v=>v.species+':'+v.portraitIndex)).size}}));
