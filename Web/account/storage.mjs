import {randomUUID} from 'node:crypto';
import {digest,full,pack,unpack,inflate,boundedRaw} from './codec.mjs';

export const fail=(message,status=400)=>Object.assign(Error(message),{status});
export function createStorage(sql,{parse,accountLimit,totalLimit}){
 if(!Number.isSafeInteger(accountLimit)||!Number.isSafeInteger(totalLimit)||accountLimit<2_000_000||totalLimit<accountLimit)throw Error('A reviewed save-storage budget is required.');
 const valid=raw=>{boundedRaw(raw);return parse(raw);};
 async function snapshot(owner,target=null,includeSlots=true){
  const [row]=await sql`SELECT v.id,v.sequence,v.revision,v.head_payload,v.head_digest,v.import_total,v.import_source FROM spacetrader_voyages v JOIN spacetrader_accounts a ON a.id=v.account_id WHERE a.id=${owner} AND v.id=coalesce(${target}::uuid,a.active_voyage)`;
  if(!row)return {raw:null,revision:null,sequence:0,slots:{},ledger:true};
  const raw=row.head_payload?inflate(row.head_payload).toString('utf8'):null;
  if(raw&&digest(raw)!==row.head_digest)throw fail('The saved voyage failed its integrity check; nothing was replaced.',503);
  if(!includeSlots)return {raw,revision:row.revision,sequence:Number(row.sequence),voyage:row.id,ledger:true};
  const records=await sql`SELECT slot,digest,payload FROM spacetrader_checkpoints WHERE voyage_id=${row.id} AND current AND payload IS NOT NULL`;
  const slots={};for(const r of records){const value=inflate(r.payload).toString('utf8');if(digest(value)!==r.digest)throw fail('A checkpoint failed its integrity check.',503);slots[r.slot]=value;}
  return {raw,revision:row.revision,sequence:Number(row.sequence),voyage:row.id,slots,ledger:true};
 }
 function action(value){
  if(!value||!/^[A-Za-z0-9_-]{1,100}$/.test(value.id||'')||!/^[A-Za-z0-9_-]{1,60}$/.test(value.type||'')||!value.args||typeof value.args!=='object'||Array.isArray(value.args)||Buffer.byteLength(JSON.stringify(value.args))>16384||typeof value.version!=='string'||value.version.length>40)throw fail('Invalid action record.');
  return {id:value.id,type:value.type,args:value.args,version:value.version,source:'browser'};
 }
 async function append(owner,body,target=null){
  if(body.key!=='auto')throw fail('Unknown save location.');
  const state=valid(body.raw),event=action(body.action),current=await snapshot(owner,target,false),hash=digest(body.raw),encoded=pack(body.raw,current.raw,current.sequence+1);
  const summary={name:state.profile.name,day:state.day,location:state.location,credits:state.credits,fleet:state.fleet.length+1};
  const created=target&&Number.isSafeInteger(body.created)&&body.created>=946684800000&&body.created<=Date.now()+30000?body.created:Date.now();
  const [result]=await sql`SELECT spacetrader_append(${owner}::uuid,${target}::uuid,${body.revision??null},${event.id},${hash},${encoded.codec},${encoded.payload},${full(body.raw)},${JSON.stringify(event)}::jsonb,${JSON.stringify(summary)}::jsonb,${created},${accountLimit},${totalLimit}) AS result`;
  if(result.result.conflict)throw Object.assign(fail('A newer voyage is saved. Review it before continuing.',409),{snapshot:await snapshot(owner,target)});
  const latest=result.result.replayed?await snapshot(owner,target,false):{raw:body.raw,revision:hash+':'+result.result.sequence,sequence:Number(result.result.sequence),voyage:result.result.voyage,ledger:true};
  return {...latest,backup:body.preserve&&current.raw?'ledger:'+current.sequence:null};
 }
 async function checkpoint(owner,body,target=null){
  if(!['slot1','slot2','slot3'].includes(body.key))throw fail('Unknown checkpoint slot.');
  const next=body.raw===null?null:(valid(body.raw),digest(body.raw)),expected=body.expected===null?null:digest(boundedRaw(body.expected));
  const [result]=await sql`SELECT spacetrader_checkpoint(${owner}::uuid,${body.revision??null},${body.key},${expected},${next},${body.raw===null?null:full(body.raw)},${accountLimit},${totalLimit},${target}::uuid) AS result`;
  const latest=await snapshot(owner,target);if(result.result.conflict)throw Object.assign(fail('That checkpoint changed. Review it before trying again.',409),{snapshot:latest});return latest;
 }
 async function history(owner,before=Number.MAX_SAFE_INTEGER){
  if(!Number.isSafeInteger(before)||before<1)throw fail('Invalid action-history page.');
  const rows=await sql`SELECT e.sequence,e.event,e.summary,e.created_ms FROM spacetrader_entries e JOIN spacetrader_accounts a ON a.active_voyage=e.voyage_id WHERE a.id=${owner} AND e.sequence<${before} ORDER BY e.sequence DESC LIMIT 31`;
  return rows.map(r=>({sequence:Number(r.sequence),type:r.event.type,args:r.event.args,created:Number(r.created_ms),...r.summary}));
 }
 async function recorded(owner,sequence){
  if(!Number.isSafeInteger(sequence)||sequence<1)throw fail('Invalid recorded action.');
  const rows=await sql`SELECT e.sequence,e.codec,e.payload,e.digest FROM spacetrader_entries e JOIN spacetrader_accounts a ON a.active_voyage=e.voyage_id WHERE a.id=${owner} AND e.sequence<=${sequence} ORDER BY e.sequence DESC LIMIT 40`;
  if(Number(rows[0]?.sequence)!==sequence)throw fail('That recorded action is unavailable.',404);
  const base=rows.findIndex(r=>r.codec==='full');if(base<0)throw fail('Earlier save data is unavailable; history is preserved.',503);
  let raw;for(let i=base;i>=0;i--)raw=unpack(rows[i],raw);return {raw,sequence};
 }
 async function startImport(owner,{source,total,hash}){
  if(typeof source!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(source)||!Number.isSafeInteger(total)||total<1||total>1_000_000||!/^[a-f0-9]{64}$/.test(hash))throw fail('Invalid voyage transfer.');
  const [active]=await sql`SELECT active_voyage FROM spacetrader_accounts WHERE id=${owner}`;
  if(active?.active_voyage)throw fail('An account voyage already exists. Continue it or keep playing locally.',409);
  const [row]=await sql`SELECT spacetrader_start_import(${owner}::uuid,${source},${total},${hash},${accountLimit},${totalLimit}) AS result`;
  return {...row.result,sequence:Number(row.result.sequence)};
 }
 async function importBatch(owner,body){
  if(!/^[a-f0-9-]{36}$/.test(body.id||'')||!Array.isArray(body.records)||body.records.length<1||body.records.length>10)throw fail('Invalid transfer batch.');
  let result;for(const record of body.records)result=await append(owner,record,body.id);return {sequence:result.sequence,revision:result.revision};
 }
 async function finishImport(owner,{id,slots={}}){
  if(!/^[a-f0-9-]{36}$/.test(id||'')||Object.keys(slots).some(k=>!['slot1','slot2','slot3'].includes(k)))throw fail('Invalid transfer.');
  // Preserve imported slots before activation. Never overwrite an active voyage.
  const staged=await snapshot(owner,id);
  for(const [key,raw] of Object.entries(slots)){
   valid(raw);
   if(staged.slots[key]&&staged.slots[key]!==raw)throw fail('The transferred checkpoint changed. Local progress is preserved.',409);
   await checkpoint(owner,{key,raw,expected:staged.slots[key]||null,revision:staged.revision},id);
  }
  const [result]=await sql`SELECT spacetrader_finish_import(${owner}::uuid,${id}::uuid) AS completed`;
  if(!result.completed)throw fail('Transfer is incomplete or another account voyage became active. Local progress is preserved.',409);
  return snapshot(owner);
 }
 async function importCheckpoint(owner,body){
  if(!/^[a-f0-9-]{36}$/.test(body.id||''))throw fail('Invalid transfer.');
  const staged=await snapshot(owner,body.id);
  if(!staged.voyage)throw fail('That transfer is unavailable.',404);
  if(staged.slots[body.key]&&staged.slots[body.key]!==body.raw)throw fail('The transferred checkpoint changed. Local progress is preserved.',409);
  return checkpoint(owner,{key:body.key,raw:body.raw,expected:staged.slots[body.key]||null,revision:staged.revision},body.id);
 }
 async function position(owner){const [row]=await sql`SELECT v.sequence,v.revision FROM spacetrader_voyages v JOIN spacetrader_accounts a ON a.active_voyage=v.id WHERE a.id=${owner}`;return {revision:row?.revision||null,sequence:Number(row?.sequence||0),ledger:true};}
 async function readCheckpoint(owner,key){
  if(!['slot1','slot2','slot3'].includes(key))throw fail('Unknown checkpoint slot.');
  const [row]=await sql`SELECT c.payload,c.digest FROM spacetrader_checkpoints c JOIN spacetrader_accounts a ON a.active_voyage=c.voyage_id WHERE a.id=${owner} AND c.slot=${key} AND c.current AND c.payload IS NOT NULL`;
  if(!row)throw fail('That checkpoint changed. Reload your account voyage.',409);
  const raw=inflate(row.payload).toString('utf8');if(digest(raw)!==row.digest)throw fail('Checkpoint integrity check failed.',503);
  return {raw,digest:row.digest};
 }
 return {snapshot,position,append,checkpoint,readCheckpoint,history,recorded,startImport,importBatch,importCheckpoint,finishImport};
}
