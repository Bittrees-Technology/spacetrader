import {randomUUID} from 'node:crypto';
import {createEfficient} from './efficient.mjs';
import {joinState} from './state-parts.mjs';
import {digest,full,pack,unpack,inflate,boundedRaw} from './codec.mjs';
import {journalRecord,expandRecord,readChunk,extendChunk} from './compact.mjs';

export const fail=(message,status=400)=>Object.assign(Error(message),{status});
export function createStorage(sql,{parse,accountLimit,totalLimit,compact=false,efficient=false,archiveReads=efficient,singleActive=false}){
 if(!Number.isSafeInteger(accountLimit)||!Number.isSafeInteger(totalLimit)||accountLimit<2_000_000||totalLimit<accountLimit)throw Error('A reviewed save-storage budget is required.');
 const binaryStore=createEfficient(sql),readArchives=archiveReads||efficient;
 const valid=raw=>{boundedRaw(raw);return parse(raw);};
 const capabilities=compact?{restoreActions:false,checkpointLimit:2,storageFormat:'compact-v1'}:{};
 async function slotRecords(voyage){
  const old=await sql`SELECT slot,digest,payload FROM spacetrader_checkpoints WHERE voyage_id=${voyage} AND current`;
  if(!compact)return old;
  const recent=await sql`SELECT slot,digest,payload FROM spacetrader_snapshot_slots WHERE voyage_id=${voyage}`;
  const map=new Map(old.map(r=>[r.slot,r]));for(const r of recent)map.set(r.slot,r);return [...map.values()];
 }
 async function readBinary(voyage,slot,hash){
  const [row]=slot?await sql`SELECT payload,digest,efficient_core AS core,efficient_component AS component FROM spacetrader_snapshot_slots WHERE voyage_id=${voyage} AND slot=${slot}`:await sql`SELECT head_payload AS payload,head_digest AS digest,efficient_core AS core,efficient_component AS component FROM spacetrader_voyages WHERE id=${voyage}`;
  if(!row||row.digest!==hash)throw fail('The saved voyage changed. Reload before continuing.',409);
  return binaryStore.restore(voyage,row);
 }
 async function snapshot(owner,target=null,includeSlots=true){
  const [row]=await sql`SELECT v.id,v.sequence,v.revision,v.head_payload,v.head_digest,v.import_total,v.import_source FROM spacetrader_voyages v JOIN spacetrader_accounts a ON a.id=v.account_id WHERE a.id=${owner} AND v.id=coalesce(${target}::uuid,a.active_voyage)`;
  if(!row)return {raw:null,revision:null,sequence:0,slots:{},ledger:true,...capabilities};
  const raw=row.head_payload==='E1'?await readBinary(row.id,null,row.head_digest):row.head_payload?inflate(row.head_payload).toString('utf8'):null;
  if(raw&&digest(raw)!==row.head_digest)throw fail('The saved voyage failed its integrity check; nothing was replaced.',503);
  if(!includeSlots)return {raw,revision:row.revision,sequence:Number(row.sequence),voyage:row.id,ledger:true,...capabilities};
  const records=await slotRecords(row.id);
  const slots={};for(const r of records){if(!r.payload)continue;const value=r.payload==='E1'?await readBinary(row.id,r.slot,r.digest):inflate(r.payload).toString('utf8');if(digest(value)!==r.digest)throw fail('A checkpoint failed its integrity check.',503);slots[r.slot]=value;}
  return {raw,revision:row.revision,sequence:Number(row.sequence),voyage:row.id,slots,ledger:true,...capabilities};
 }
 function action(value){
  if(!value||!/^[A-Za-z0-9_-]{1,100}$/.test(value.id||'')||!/^[A-Za-z0-9_-]{1,60}$/.test(value.type||'')||!value.args||typeof value.args!=='object'||Array.isArray(value.args)||Buffer.byteLength(JSON.stringify(value.args))>16384||typeof value.version!=='string'||value.version.length>40)throw fail('Invalid action record.');
  return {id:value.id,type:value.type,args:value.args,version:value.version,source:'browser'};
 }
 async function compactAppend(owner,body,target,importing){
  if(body.key!=='auto'||!target)throw fail('Choose a saved voyage before continuing.',428);
  const state=valid(body.raw),event=action(body.action),current=await snapshot(owner,target,false);
  if(!current.voyage)throw fail('That voyage is unavailable.',404);
  const sequence=current.sequence+1,created=importing&&Number.isSafeInteger(body.created)&&body.created>=946684800000&&body.created<=Date.now()+30000?body.created:Date.now();
  const meta={sequence,type:event.type,args:event.args,created,name:state.profile.name,day:state.day,location:state.location,credits:state.credits,fleet:state.fleet.length+1};
  if(efficient)await binaryStore.maintain(owner,target);
  const [prior]=await sql`SELECT first_sequence,last_sequence,digest,payload FROM spacetrader_journal_chunks WHERE voyage_id=${target} ORDER BY first_sequence DESC LIMIT 1`;
  const chunk=extendChunk(prior,journalRecord(meta,state,current.raw?parse(current.raw):null)),hash=digest(body.raw),eventHash=digest(JSON.stringify(event));
  const summary={name:state.profile.name,created:state.profile.created,day:state.day,location:state.location,credits:state.credits,fleet:state.fleet.length+1};
  const result=efficient?{result:await binaryStore.append(owner,body,target,event,eventHash,summary,chunk,accountLimit,totalLimit,importing)}:(await sql`SELECT spacetrader_compact_append(${owner}::uuid,${target}::uuid,${body.revision??null},${event.id},${eventHash},${hash},${full(body.raw)},${JSON.stringify(summary)}::jsonb,${chunk.first},${chunk.last},${chunk.previous},${chunk.hash},${chunk.payload},${accountLimit},${totalLimit},${importing}) AS result`)[0];
  if(result.result.conflict)throw Object.assign(fail('A newer voyage is saved. Review it before continuing.',409),{snapshot:await snapshot(owner,target)});
  return result.result.replayed?await snapshot(owner,target,false):{raw:body.raw,revision:hash+':'+result.result.sequence,sequence:Number(result.result.sequence),voyage:target,ledger:true,...capabilities};
 }
 async function append(owner,body,target=null,importing=false){
  if(compact)return compactAppend(owner,body,target,importing);
  if(body.key!=='auto')throw fail('Unknown save location.');
  const state=valid(body.raw),event=action(body.action),current=await snapshot(owner,target,false),hash=digest(body.raw),encoded=pack(body.raw,current.raw,current.sequence+1);
  if(target&&!current.voyage)throw fail('That voyage is unavailable.',404);
  const summary={name:state.profile.name,created:state.profile.created,day:state.day,location:state.location,credits:state.credits,fleet:state.fleet.length+1};
  const created=target&&Number.isSafeInteger(body.created)&&body.created>=946684800000&&body.created<=Date.now()+30000?body.created:Date.now();
  const [result]=target?await sql`SELECT spacetrader_append_v2(${owner}::uuid,${target}::uuid,${body.revision??null},${event.id},${hash},${encoded.codec},${encoded.payload},${full(body.raw)},${JSON.stringify(event)}::jsonb,${JSON.stringify(summary)}::jsonb,${created},${accountLimit},${totalLimit},${importing}) AS result`:await sql`SELECT spacetrader_append(${owner}::uuid,NULL::uuid,${body.revision??null},${event.id},${hash},${encoded.codec},${encoded.payload},${full(body.raw)},${JSON.stringify(event)}::jsonb,${JSON.stringify(summary)}::jsonb,${created},${accountLimit},${totalLimit}) AS result`;
  if(result.result.conflict)throw Object.assign(fail('A newer voyage is saved. Review it before continuing.',409),{snapshot:await snapshot(owner,target)});
  const latest=result.result.replayed?await snapshot(owner,target,false):{raw:body.raw,revision:hash+':'+result.result.sequence,sequence:Number(result.result.sequence),voyage:result.result.voyage,ledger:true};
  return {...latest,backup:body.preserve&&current.raw?'ledger:'+current.sequence:null};
 }
 async function checkpoint(owner,body,target=null,importing=false){
  if(compact&&!importing&&body.key==='slot3'&&body.raw!==null)throw fail('Account voyages have two checkpoint slots. Earlier third-slot saves remain available to load or delete.');
  if(!['slot1','slot2','slot3'].includes(body.key))throw fail('Unknown checkpoint slot.');
  const next=body.raw===null?null:(valid(body.raw),digest(body.raw)),expected=body.expectedHash!==undefined?(body.expectedHash===null?null:/^[a-f0-9]{64}$/.test(body.expectedHash)?body.expectedHash:(()=>{throw fail('Invalid checkpoint reference.');})()):body.expected===null?null:digest(boundedRaw(body.expected));
  const [result]=efficient&&!importing?[{result:await binaryStore.checkpoint(owner,body,target,expected,next,accountLimit,totalLimit)}]:compact&&!importing?await sql`SELECT spacetrader_compact_checkpoint(${owner}::uuid,${target}::uuid,${body.revision??null},${body.key},${expected},${next},${body.raw===null?null:full(body.raw)},${accountLimit},${totalLimit}) AS result`:target?await sql`SELECT spacetrader_checkpoint_v2(${owner}::uuid,${body.revision??null},${body.key},${expected},${next},${body.raw===null?null:full(body.raw)},${accountLimit},${totalLimit},${target}::uuid,${importing}) AS result`:await sql`SELECT spacetrader_checkpoint(${owner}::uuid,${body.revision??null},${body.key},${expected},${next},${body.raw===null?null:full(body.raw)},${accountLimit},${totalLimit},NULL::uuid) AS result`;
  const latest=await snapshot(owner,target);if(result.result.conflict)throw Object.assign(fail('That checkpoint changed. Review it before trying again.',409),{snapshot:latest});return latest;
 }
 async function history(owner,before=Number.MAX_SAFE_INTEGER,target=null){
  if(!Number.isSafeInteger(before)||before<1)throw fail('Invalid action-history page.');
  const rows=await sql`SELECT e.sequence,e.event,e.summary,e.created_ms FROM spacetrader_entries e JOIN spacetrader_voyages v ON v.id=e.voyage_id JOIN spacetrader_accounts a ON a.id=v.account_id WHERE a.id=${owner} AND v.id=coalesce(${target}::uuid,a.active_voyage) AND e.sequence<${before} ORDER BY e.sequence DESC LIMIT 31`;
  const legacy=rows.map(r=>({sequence:Number(r.sequence),type:r.event.type,args:r.event.args,created:Number(r.created_ms),...r.summary}));
  if(!compact)return legacy;
  const chunks=await sql`SELECT c.first_sequence,c.last_sequence,c.digest,c.payload FROM spacetrader_journal_chunks c JOIN spacetrader_voyages v ON v.id=c.voyage_id JOIN spacetrader_accounts a ON a.id=v.account_id WHERE a.id=${owner} AND v.id=coalesce(${target}::uuid,a.active_voyage) AND c.first_sequence<${before} AND c.last_sequence>=greatest(1,least(${before},v.sequence+1)-31) ORDER BY c.first_sequence DESC LIMIT 31`;
  const recent=chunks.flatMap(c=>readChunk(c).filter(r=>r.r.sequence<before).map(r=>({sequence:r.r.sequence,type:r.a[0],day:r.r.day,record:expandRecord(r)})));
  const archived=readArchives?(await binaryStore.history(owner,target,before)).map(r=>({sequence:r.r.sequence,type:r.a[0],day:r.r.day,record:expandRecord(r)})):[];
  return [...new Map([...legacy,...recent,...archived].map(r=>[r.sequence,r])).values()].sort((a,b)=>b.sequence-a.sequence).slice(0,31);
 }
 async function recorded(owner,sequence,target=null){
  if(!Number.isSafeInteger(sequence)||sequence<1)throw fail('Invalid recorded action.');
  if(compact){const [v]=await sql`SELECT v.sequence,v.compact_start FROM spacetrader_voyages v JOIN spacetrader_accounts a ON a.id=v.account_id WHERE a.id=${owner} AND v.id=coalesce(${target}::uuid,a.active_voyage)`;if(v?.compact_start&&sequence>=Number(v.compact_start)){if(sequence===Number(v.sequence))return {raw:(await snapshot(owner,target,false)).raw,sequence};throw fail('This action remains in your journal. Load a checkpoint to restore earlier progress.',410);}}
  const rows=await sql`SELECT e.sequence,e.codec,e.payload,e.digest FROM spacetrader_entries e JOIN spacetrader_voyages v ON v.id=e.voyage_id JOIN spacetrader_accounts a ON a.id=v.account_id WHERE a.id=${owner} AND v.id=coalesce(${target}::uuid,a.active_voyage) AND e.sequence<=${sequence} ORDER BY e.sequence DESC LIMIT 40`;
  if(Number(rows[0]?.sequence)!==sequence)throw fail('That recorded action is unavailable.',404);
  const base=rows.findIndex(r=>r.codec==='full');if(base<0)throw fail('Earlier save data is unavailable; history is preserved.',503);
  let raw;for(let i=base;i>=0;i--)raw=unpack(rows[i],raw);return {raw,sequence};
 }
 async function startImport(owner,{source,total,hash}){
  if(typeof source!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(source)||!Number.isSafeInteger(total)||total<1||total>1_000_000||!/^[a-f0-9]{64}$/.test(hash))throw fail('Invalid voyage transfer.');
  const [row]=await sql`SELECT spacetrader_start_import_v2(${owner}::uuid,${source},${total},${hash},${accountLimit},${totalLimit}) AS result`;
  return {...row.result,sequence:Number(row.result.sequence)};
 }
 async function importBatch(owner,body){
  if(!/^[a-f0-9-]{36}$/.test(body.id||'')||!Array.isArray(body.records)||body.records.length<1||body.records.length>10)throw fail('Invalid transfer batch.');
  let result;for(const record of body.records)result=await append(owner,record,body.id,true);return {sequence:result.sequence,revision:result.revision};
 }
 async function finishImport(owner,{id,slots={}}){
  if(!/^[a-f0-9-]{36}$/.test(id||'')||Object.keys(slots).some(k=>!['slot1','slot2','slot3'].includes(k)))throw fail('Invalid transfer.');
  // Preserve imported slots before activation. Never overwrite an active voyage.
  const staged=await snapshot(owner,id);
  for(const [key,raw] of Object.entries(slots)){
   valid(raw);
   if(staged.slots[key]&&staged.slots[key]!==raw)throw fail('The transferred checkpoint changed. Local progress is preserved.',409);
   if(staged.slots[key]===raw)continue;
   await checkpoint(owner,{key,raw,expected:staged.slots[key]||null,revision:staged.revision},id,true);
  }
  const [result]=await sql`SELECT spacetrader_finish_import_v2(${owner}::uuid,${id}::uuid) AS completed`;
  if(!result.completed)throw fail('Transfer is incomplete. Existing voyages and local progress are preserved.',409);
  return snapshot(owner,id);
 }
 async function importCheckpoint(owner,body){
  if(!/^[a-f0-9-]{36}$/.test(body.id||''))throw fail('Invalid transfer.');
  const staged=await snapshot(owner,body.id);
  if(!staged.voyage)throw fail('That transfer is unavailable.',404);
  if(staged.slots[body.key]&&staged.slots[body.key]!==body.raw)throw fail('The transferred checkpoint changed. Local progress is preserved.',409);
  if(staged.slots[body.key]===body.raw)return staged;
  return checkpoint(owner,{key:body.key,raw:body.raw,expected:staged.slots[body.key]||null,revision:staged.revision},body.id,true);
 }
 async function position(owner,target=null){const [row]=await sql`SELECT v.id,v.sequence,v.revision FROM spacetrader_voyages v JOIN spacetrader_accounts a ON a.id=v.account_id WHERE a.id=${owner} AND v.id=coalesce(${target}::uuid,a.active_voyage) AND (v.import_total IS NULL OR v.completed_at IS NOT NULL OR a.active_voyage=v.id)`;return {revision:row?.revision||null,sequence:Number(row?.sequence||0),voyage:row?.id||null,ledger:true};}
 async function readCheckpoint(owner,key,target=null){
  if(!['slot1','slot2','slot3'].includes(key))throw fail('Unknown checkpoint slot.');
  const [voyage]=await sql`SELECT v.id FROM spacetrader_voyages v JOIN spacetrader_accounts a ON a.id=v.account_id WHERE a.id=${owner} AND v.id=coalesce(${target}::uuid,a.active_voyage)`;
  const row=voyage?(await slotRecords(voyage.id)).find(r=>r.slot===key&&r.payload):null;
  if(!row)throw fail('That checkpoint changed. Reload your account voyage.',409);
  const raw=row.payload==='E1'?await readBinary(voyage.id,key,row.digest):inflate(row.payload).toString('utf8');if(digest(raw)!==row.digest)throw fail('Checkpoint integrity check failed.',503);
  return {raw,digest:row.digest};
 }
 const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
 async function selected(owner,id){
  if(!uuid(id))throw fail('Reload the page and choose a saved voyage before continuing.',428);
  const [row]=await sql`SELECT v.id FROM spacetrader_voyages v JOIN spacetrader_accounts a ON a.id=v.account_id WHERE a.id=${owner} AND v.id=${id}::uuid AND v.sequence>0 AND (v.import_total IS NULL OR v.completed_at IS NOT NULL OR a.active_voyage=v.id)`;
  if(!row)throw fail('That voyage is unavailable.',404);return row.id;
 }
 async function choose(owner,{id}){await selected(owner,id);const [row]=await sql`SELECT spacetrader_select_voyage(${owner}::uuid,${id}::uuid) AS selected`;if(!row.selected)throw fail(singleActive?'That voyage is archived. Continue your active voyage or view its journal.':'That voyage is unavailable.',singleActive?409:404);return {id};}
 async function createVoyage(owner,{raw,operation,version='web',restartFrom,revision}){
  const state=valid(raw),event=action({id:operation,type:'new-voyage',args:{},version}),hash=digest(raw),summary={name:state.profile.name,created:state.profile.created,day:state.day,location:state.location,credits:state.credits,fleet:state.fleet.length+1};
  if(singleActive){
   if(restartFrom!==null&&!uuid(restartFrom)||restartFrom!==null&&typeof revision!=='string'||restartFrom===null&&revision!==null)throw fail('Reload the account before confirming a restart.',428);
   const [row]=await sql`SELECT spacetrader_restart_voyage(${owner}::uuid,${restartFrom}::uuid,${revision},${event.id},${hash},${full(raw)},${JSON.stringify(event)}::jsonb,${JSON.stringify(summary)}::jsonb,${Date.now()},${accountLimit},${totalLimit}) AS result`;return row.result;
  }
  const [row]=await sql`SELECT spacetrader_create_voyage(${owner}::uuid,${event.id},${hash},${full(raw)},${JSON.stringify(event)}::jsonb,${JSON.stringify(summary)}::jsonb,${Date.now()},${accountLimit},${totalLimit}) AS result`;
  return row.result;
 }
 async function library(owner,after=null){
  if(after!==null)await selected(owner,after);
  if(singleActive){
   const rows=await sql`SELECT v.id,v.sequence,v.revision,v.captain_id,v.archived_at,v.created_at,v.updated_at,coalesce(v.compact_summary,e.summary) AS summary,e.event->>'type' AS type FROM spacetrader_voyages v JOIN spacetrader_accounts a ON a.id=v.account_id LEFT JOIN spacetrader_entries e ON e.voyage_id=v.id AND e.sequence=v.sequence WHERE a.id=${owner} AND (v.import_total IS NULL OR v.completed_at IS NOT NULL OR a.active_voyage=v.id) AND (${after}::uuid IS NULL OR (v.created_at,v.id)<(SELECT x.created_at,x.id FROM spacetrader_voyages x WHERE x.id=${after}::uuid AND x.account_id=${owner})) ORDER BY v.created_at DESC,v.id DESC LIMIT 21`;
   const [account]=await sql`SELECT a.active_voyage,a.stored_bytes,c.id AS captain_id,v.revision FROM spacetrader_accounts a JOIN spacetrader_captains c ON c.account_id=a.id LEFT JOIN spacetrader_voyages v ON v.id=a.active_voyage WHERE a.id=${owner}`;
   return {singleActiveVoyage:true,captainId:account?.captain_id,selected:account?.active_voyage||null,selectedRevision:account?.revision||null,voyages:rows.slice(0,20).map(r=>({id:r.id,captainId:r.captain_id,name:r.summary?.created===false?'New captain':r.summary?.name||'Captain',day:r.summary?.day||0,location:r.summary?.location,sequence:Number(r.sequence),revision:r.revision,archivedAt:r.archived_at,readOnly:r.id!==account?.active_voyage,created:r.created_at,updated:r.updated_at})),next:rows.length>20?rows[19].id:null,usedBytes:Number(account?.stored_bytes||0),limitBytes:accountLimit};
  }
  const rows=await sql`SELECT v.id,v.sequence,v.created_at,v.updated_at,coalesce(v.compact_summary,e.summary) AS summary,e.event->>'type' AS type,(SELECT count(*)::int FROM spacetrader_checkpoints c WHERE c.voyage_id=v.id AND c.current AND c.payload IS NOT NULL AND NOT EXISTS(SELECT 1 FROM spacetrader_snapshot_slots n WHERE n.voyage_id=v.id AND n.slot=c.slot))+(SELECT count(*)::int FROM spacetrader_snapshot_slots n WHERE n.voyage_id=v.id AND n.payload IS NOT NULL) AS checkpoints FROM spacetrader_voyages v JOIN spacetrader_accounts a ON a.id=v.account_id LEFT JOIN spacetrader_entries e ON e.voyage_id=v.id AND e.sequence=v.sequence WHERE a.id=${owner} AND (v.import_total IS NULL OR v.completed_at IS NOT NULL OR a.active_voyage=v.id) AND (${after}::uuid IS NULL OR (v.created_at,v.id)<(SELECT x.created_at,x.id FROM spacetrader_voyages x WHERE x.id=${after}::uuid AND x.account_id=${owner})) ORDER BY v.created_at DESC,v.id DESC LIMIT 21`;
  const [account]=await sql`SELECT active_voyage,stored_bytes FROM spacetrader_accounts WHERE id=${owner}`;
  return {voyages:rows.slice(0,20).map(r=>({id:r.id,name:r.summary.created===false||r.summary.created===undefined&&r.type==='new-voyage'?'New captain':r.summary.name,day:r.summary.day,location:r.summary.location,sequence:Number(r.sequence),created:r.created_at,updated:r.updated_at,checkpoints:r.checkpoints})),next:rows.length>20?rows[19].id:null,selected:account?.active_voyage||null,usedBytes:Number(account?.stored_bytes||0),limitBytes:accountLimit};
 }
 async function resolveWire(owner,target,value){
  if(!value||typeof value.core!=='string'||value.core.length>=2_000_000||value.component!==null&&(typeof value.component!=='string'||!/^[a-f0-9]{64}$/.test(value.component)))throw fail('Invalid save components.');
  let part=null;
  if(value.component!==null){
   if(typeof value.part==='string'){if(value.part.length>=2_000_000||digest(value.part)!==value.component)throw fail('Economy component integrity check failed.');part=value.part;}
   else{part=await binaryStore.component(target,value.component,owner);if(part===null)throw fail('Resend the economy component.',428);}
  }
  const raw=joinState(value.core,part);valid(raw);return raw;
 }
 return {resolveWire,snapshot,position,append,checkpoint,readCheckpoint,history,recorded,startImport,importBatch,importCheckpoint,finishImport,selected,choose,createVoyage,library};
}
