import J from '../../Browser/journal-feed.js';
import engine from '../../Browser/engine.js';
import {digest,inflate} from './codec.mjs';
import {deflateSync} from 'node:zlib';

export const CHUNK_ACTIONS=128,CHUNK_BYTES=512*1024;
const names=Object.fromEntries([...engine.allGoods,...engine.ships,...engine.relicCatalog(),...engine.world.ports].map(v=>[v.id,v.name]));
const venues={market:'Exchange',contracts:'Freight office',shipyard:'Dry dock',fleet:'Fleet registry',security:'Patrol office',relay:'Communications',clinic:'Clinic',local:'Canteen / commons',bank:'Credit cooperative',authority:'Port authority',warehouse:'Warehouse',crew:'Crew aboard'};
const context={engine,names,portNames:Object.fromEntries(engine.world.ports.map(p=>[p.id,p.name])),stationLabel:id=>engine.stationLabel(id),venueLabel:id=>venues[id]||'Establishment'};
export function journalRecord(meta,after,before){
 const {feedRows,primary,...receipt}=J.prepare(meta,after,before,context);
 // IDs used only for presentation are regenerated from the permanent sequence.
 return {a:[meta.type,meta.args||{}],at:meta.created,r:receipt,f:feedRows.map(({id,...row})=>row)};
}
export function expandRecord(value){
 const r=value.r;if(!r||!Number.isSafeInteger(r.sequence)||!Array.isArray(value.f)||!Array.isArray(value.a))throw Error('Journal integrity check failed.');
 return {...r,type:value.a[0],args:value.a[1],created:value.at,name:r.captain,location:r.origin,feedRows:value.f.map((v,index)=>({...v,id:r.sequence+':'+index})),restorable:false};
}
export function readChunk(row){
 if(!row)return [];
 const raw=inflate(row.payload).toString('utf8');if(digest(raw)!==row.digest)throw Error('Journal integrity check failed; existing history is preserved.');
 const values=JSON.parse(raw);if(!Array.isArray(values)||values.length>CHUNK_ACTIONS||values.some((v,i)=>v.r?.sequence!==Number(row.first_sequence)+i)||Number(row.last_sequence)!==Number(row.first_sequence)+values.length-1)throw Error('Journal sequence check failed.');
 return values;
}
export function extendChunk(prior,record){
 let rows=readChunk(prior),previous=prior?.digest||null,first=Number(prior?.first_sequence||record.r.sequence);
 if(rows.length>=CHUNK_ACTIONS||Buffer.byteLength(JSON.stringify([...rows,record]))>CHUNK_BYTES){rows=[];previous=null;first=record.r.sequence;}
 rows.push(record);const raw=JSON.stringify(rows);if(Buffer.byteLength(raw)>=2_000_000)throw Error('This journal record exceeds the safe storage limit. Existing progress is preserved.');
 return {first,last:record.r.sequence,previous,hash:digest(raw),payload:deflateSync(Buffer.from(raw),{level:6}).toString('base64')};
}
