import {brotliDecompressSync} from 'node:zlib';
import {digest,inflate,boundedRaw} from './codec.mjs';
import {binary,componentRead,statePack,hex,createEfficient} from './efficient.mjs';
import {splitState,joinState} from './state-parts.mjs';
import {applyStateDelta} from './state-delta.mjs';
import {journalRecord,extendChunks} from './compact.mjs';
import {fail} from './storage.mjs';

export function createBatchStorage(sql,{parse,accountLimit,totalLimit}){
 const maintenance=createEfficient(sql);
 async function context(owner,target){
  const [v]=await sql`SELECT v.id,v.sequence,v.revision,v.head_payload,v.head_digest,v.efficient_core,v.efficient_component,v.batch_receipt,
   p.prefix AS part_prefix,p.payload AS part_payload,h.first_sequence,h.last_sequence,h.digest AS chunk_digest,h.payload AS chunk_payload,
   (SELECT count(*)::int FROM (SELECT 1 FROM spacetrader_journal_chunks x WHERE x.voyage_id=v.id AND x.last_sequence<v.sequence LIMIT 8) q) AS closed_chunks
   FROM spacetrader_voyages v JOIN spacetrader_accounts a ON a.id=v.account_id
   LEFT JOIN spacetrader_world_components p ON p.voyage_id=v.id AND p.digest=v.efficient_component
   LEFT JOIN LATERAL (SELECT c.* FROM spacetrader_journal_chunks c WHERE c.voyage_id=v.id ORDER BY c.first_sequence DESC LIMIT 1) h ON true
   WHERE v.id=${target}::uuid AND a.id=${owner}::uuid AND v.sequence>0 AND (v.import_total IS NULL OR v.completed_at IS NOT NULL OR a.active_voyage=v.id)`;
  if(!v)throw fail('That voyage is unavailable.',404);return v;
 }
 const snapshotConflict=()=>fail('Newer account progress exists. Your pending actions remain on this device for review.',409);
 async function snapshot(owner,target=null){
  const [v]=await sql`SELECT v.id,v.sequence,v.revision,v.head_payload,v.head_digest,v.efficient_core,v.efficient_component,p.prefix,p.payload
   FROM spacetrader_accounts a JOIN spacetrader_voyages v ON v.account_id=a.id AND v.id=coalesce(${target}::uuid,a.active_voyage)
   LEFT JOIN spacetrader_world_components p ON p.voyage_id=v.id AND p.digest=v.efficient_component
   WHERE a.id=${owner}::uuid AND (v.import_total IS NULL OR v.completed_at IS NOT NULL OR a.active_voyage=v.id)`;
  if(!v){if(target)throw fail('That voyage is unavailable.',404);return {raw:null,sequence:0,revision:null,slots:{},ledger:true,restoreActions:false,checkpointLimit:0,storageFormat:'compact-v1'};}
  const frame=v.efficient_component?componentRead({digest:v.efficient_component,prefix:v.prefix,payload:v.payload}):null;
  const raw=v.head_payload==='E1'?joinState(brotliDecompressSync(binary(v.efficient_core),{maxOutputLength:2_000_000}).toString('utf8'),frame):inflate(v.head_payload).toString('utf8');
  if(digest(raw)!==v.head_digest)throw fail('The account save failed its integrity check.',503);
  return {raw,sequence:Number(v.sequence),revision:v.revision,voyage:v.id,slots:{},ledger:true,restoreActions:false,checkpointLimit:0,storageFormat:'compact-v1'};
 }
 async function append(owner,target,body){
  if(!/^[a-f0-9-]{36}$/i.test(target||'')||!/^[A-Za-z0-9_-]{1,100}$/.test(body.id||'')||typeof body.parent!=='string'||body.parent.length>100||!Array.isArray(body.events)||body.events.length<1||body.events.length>32)throw fail('Invalid save batch.');
  const batchHash=digest(JSON.stringify({parent:body.parent,events:body.events})),v=await context(owner,target);
  if(v.batch_receipt?.id===body.id){if(v.batch_receipt.digest!==batchHash)throw fail('A save operation cannot be reused for different actions.');return {...v.batch_receipt,replayed:true};}
  if(v.revision!==body.parent)throw snapshotConflict();
  let frame=v.efficient_component?componentRead({digest:v.efficient_component,prefix:v.part_prefix,payload:v.part_payload}):null;
  let core=v.head_payload==='E1'?brotliDecompressSync(binary(v.efficient_core),{maxOutputLength:2_000_000}).toString('utf8'):null;
  let previousRaw=core===null?inflate(v.head_payload).toString('utf8'):joinState(core,frame);
  if(digest(previousRaw)!==v.head_digest)throw fail('The account save failed its integrity check.',503);
  const initial=splitState(previousRaw);core=initial.core;frame=initial.component;
  let previous=parse(previousRaw),raw,state,summary,lastEvent;const records=[],ids=new Set();let expanded=0;
  for(let i=0;i<body.events.length;i++){
   const item=body.events[i],event=item?.action;
   if(!event||!/^[A-Za-z0-9_-]{1,100}$/.test(event.id||'')||ids.has(event.id)||!/^[A-Za-z0-9_-]{1,60}$/.test(event.type||'')||!event.args||typeof event.args!=='object'||Array.isArray(event.args)||Buffer.byteLength(JSON.stringify(event.args))>16384||typeof event.version!=='string'||event.version.length>40||!Number.isSafeInteger(item.created)||item.created<946684800000||!/^[a-f0-9]{64}$/.test(item.rawHash||''))throw fail('Invalid action in save batch.');
   if(['restore','new-voyage'].includes(event.type))throw fail('Account voyages keep their latest progress. Start another voyage from Saved voyages.');
   ids.add(event.id);lastEvent={id:event.id,type:event.type,args:event.args,version:event.version,source:'browser'};
   try{core=applyStateDelta(core,item.patch);}catch{throw fail('Invalid save patch.');}
   const ref=frame===null?null:digest(frame);
   if(item.component!==ref){if(item.component===null){if(item.part!==undefined)throw fail('Invalid economy component.');frame=null;}else{if(typeof item.component!=='string'||!/^[a-f0-9]{64}$/.test(item.component)||typeof item.part!=='string'||item.part.length>=2_000_000||digest(item.part)!==item.component)throw fail('Economy component integrity check failed.');frame=item.part;}}
   else if(item.part!==undefined&&item.part!==frame)throw fail('Economy component mismatch.');
   raw=joinState(core,frame);boundedRaw(raw);expanded+=Buffer.byteLength(raw);if(expanded>32*1024*1024)throw fail('Save batch exceeds the safe expansion limit.',413);
   if(digest(raw)!==item.rawHash)throw fail('Saved voyage integrity check failed.');state=parse(raw);
   const meta={sequence:Number(v.sequence)+i+1,type:event.type,args:event.args,created:Math.min(item.created,Date.now()),name:state.profile.name,day:state.day,location:state.location,credits:state.credits,fleet:state.fleet.length+1};
   records.push(journalRecord(meta,state,previous));previous=state;
  }
  const prior=v.first_sequence?{first_sequence:v.first_sequence,last_sequence:v.last_sequence,digest:v.chunk_digest,payload:v.chunk_payload}:null;
  const chunks=extendChunks(prior,records),finalRef=frame===null?null:digest(frame),packed=statePack(raw,finalRef===v.efficient_component);
  summary={name:state.profile.name,created:state.profile.created,day:state.day,location:state.location,credits:state.credits,fleet:state.fleet.length+1};
  const [result]=await sql`SELECT spacetrader_batch_append(${owner}::uuid,${target}::uuid,${body.parent},${body.id},${batchHash},${body.events.length},${digest(raw)},decode(${hex(packed.core)},'hex'),${packed.hash},${packed.part?.prefix??null},decode(${packed.part?hex(packed.part.payload):null},'hex'),${JSON.stringify(summary)}::jsonb,${JSON.stringify(chunks)}::jsonb,${lastEvent.id},${digest(JSON.stringify(lastEvent))},${accountLimit},${totalLimit}) AS result`;
  if(result.result.conflict)throw snapshotConflict();
  // Compaction is optional maintenance after a durable commit. A failure must
  // never turn a committed save into an apparent rejected action.
  if(Number(v.closed_chunks)>=8)try{await maintenance.maintain(owner,target);}catch{/* Retain all source chunks and retry on the next save. */}
  return result.result;
 }
 return {append,snapshot};
}
