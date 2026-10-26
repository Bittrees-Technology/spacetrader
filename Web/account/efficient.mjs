import {brotliCompressSync,brotliDecompressSync,constants} from 'node:zlib';
import {digest,MAX_SAVE} from './codec.mjs';
import {splitState,joinState} from './state-parts.mjs';
import {encodeArchive,decodeArchive,ARCHIVE_ROWS,ARCHIVE_BYTES,ENCODED_BYTES} from './archive-codec.mjs';
import {readChunk} from './compact.mjs';
const options={params:{[constants.BROTLI_PARAM_QUALITY]:4}};
export const binary=value=>typeof value==='string'&&value.startsWith('\\x')?Buffer.from(value.slice(2),'hex'):Buffer.from(value);
export const hex=value=>Buffer.from(value).toString('hex');
const compress=value=>brotliCompressSync(value,options);
const expand=(value,limit=MAX_SAVE)=>brotliDecompressSync(binary(value),{maxOutputLength:limit});
export function componentPack(value){
 const prefix=/^[RD]1:/.test(value)?value.slice(0,3):'';
 const frame=Buffer.from(value.slice(prefix.length),'base64');
 if(prefix+frame.toString('base64')===value)return {prefix,payload:compress(frame)};
 return {prefix:'S',payload:compress(Buffer.from(value))};
}
export function componentRead(row){const data=expand(row.payload);const value=row.prefix==='S'?data.toString('utf8'):row.prefix+data.toString('base64');if(digest(value)!==row.digest)throw Error('Economy component integrity check failed.');return value;}
export function statePack(raw,reuse=false){
 const {core,component}=splitState(raw),hash=component===null?null:digest(component),part=component===null||reuse?null:componentPack(component);
 const payload=compress(Buffer.from(core));if(joinState(expand(payload).toString('utf8'),part?componentRead({...part,digest:hash}):component)!==raw)throw Error('Save encoding failed its round-trip check.');
 return {core:payload,hash,part};
}
export function createEfficient(sql){
 const cache=new Map();let cacheBytes=0;
 function remember(key,value){if(cache.has(key))cacheBytes-=Buffer.byteLength(cache.get(key));cache.delete(key);cache.set(key,value);cacheBytes+=Buffer.byteLength(value);while(cache.size>3||cacheBytes>6_000_000){const first=cache.keys().next().value;cacheBytes-=Buffer.byteLength(cache.get(first));cache.delete(first);}}
 async function component(voyage,hash,owner=null){
  // Existence/ownership is rechecked even on a warm serverless instance. A hash
  // alone never authorizes a component read; cached bytes are immutable.
  const [proof]=await sql`SELECT c.digest FROM spacetrader_world_components c JOIN spacetrader_voyages v ON v.id=c.voyage_id WHERE v.id=${voyage} AND (${owner}::uuid IS NULL OR v.account_id=${owner}::uuid) AND c.digest=${hash}`;
  if(!proof)return null;const key=voyage+':'+hash;if(cache.has(key))return cache.get(key);
  const [part]=await sql`SELECT digest,prefix,payload FROM spacetrader_world_components WHERE voyage_id=${voyage} AND digest=${hash}`;if(!part)return null;const value=componentRead(part);remember(key,value);return value;
 }
 async function restore(voyage,row){
  if(row.payload!=='E1')throw Error('Unknown binary save marker.');
  const part=row.component?await component(voyage,row.component):null;if(row.component&&part===null)throw Error('Missing saved economy component.');
  const raw=joinState(expand(row.core).toString('utf8'),part);if(digest(raw)!==row.digest)throw Error('Saved voyage integrity check failed.');return raw;
 }
 async function append(owner,body,target,event,eventHash,summary,chunk,accountLimit,totalLimit,importing){
  const component=splitState(body.raw).component,ref=component===null?null:digest(component);
  const known=ref?(await sql`SELECT c.digest FROM spacetrader_world_components c JOIN spacetrader_voyages v ON v.id=c.voyage_id WHERE v.account_id=${owner} AND v.id=${target} AND c.digest=${ref}`).length>0:false;
  const packed=statePack(body.raw,known);
  const [r]=await sql`SELECT spacetrader_efficient_append(${owner}::uuid,${target}::uuid,${body.revision??null},${event.id},${eventHash},${digest(body.raw)},decode(${hex(packed.core)},'hex'),${packed.hash},${packed.part?.prefix??null},decode(${packed.part?hex(packed.part.payload):null},'hex'),${JSON.stringify(summary)}::jsonb,${chunk.first},${chunk.last},${chunk.previous},${chunk.hash},${chunk.payload},${accountLimit},${totalLimit},${importing}) AS result`;return r.result;
 }
 async function checkpoint(owner,body,target,expected,next,accountLimit,totalLimit){
  const component=body.raw===null?null:splitState(body.raw).component,ref=component===null?null:digest(component);
  const known=ref?(await sql`SELECT c.digest FROM spacetrader_world_components c JOIN spacetrader_voyages v ON v.id=c.voyage_id WHERE v.account_id=${owner} AND v.id=${target} AND c.digest=${ref}`).length>0:false;
  const p=body.raw===null?null:statePack(body.raw,known);
  const [r]=await sql`SELECT spacetrader_efficient_checkpoint(${owner}::uuid,${target}::uuid,${body.revision??null},${body.key},${expected},${next},decode(${p?hex(p.core):null},'hex'),${p?.hash??null},${p?.part?.prefix??null},decode(${p?.part?hex(p.part.payload):null},'hex'),${accountLimit},${totalLimit}) AS result`;return r.result;
 }
 async function maintain(owner,target){
  // Keep the latest block hot. At most 64 closed blocks are read per action.
  const chunks=await sql`SELECT c.first_sequence,c.last_sequence,c.digest,c.payload FROM spacetrader_journal_chunks c JOIN spacetrader_voyages v ON v.id=c.voyage_id WHERE v.id=${target} AND v.account_id=${owner} AND c.last_sequence<v.sequence ORDER BY c.first_sequence LIMIT 64`;
  if(chunks.length<8)return false;
  const [prior]=await sql`SELECT * FROM spacetrader_journal_archives WHERE voyage_id=${target} ORDER BY first_sequence DESC LIMIT 1`;
  let base=prior&&Number(prior.last_sequence)-Number(prior.first_sequence)+1<ARCHIVE_ROWS?readArchive(prior):[];
  function collect(initial){
   const pieces=[];let length=initial.length,rawBytes=initial.length?Buffer.byteLength(JSON.stringify(initial)):2,previousLast=initial.at(-1)?.r.sequence;
   for(const chunk of chunks){
    const values=readChunk(chunk),size=Buffer.byteLength(JSON.stringify(values));if(length+values.length>ARCHIVE_ROWS||rawBytes+size-2+(length?1:0)>ARCHIVE_BYTES)break;
    if(previousLast!==undefined&&previousLast+1!==values[0].r.sequence)throw Error('Journal archive sequence mismatch.');
    pieces.push({chunk,values});length+=values.length;rawBytes+=size-2+(length>values.length?1:0);previousLast=values.at(-1).r.sequence;
   }return pieces;
  }
  let pieces=collect(base);if(!pieces.length&&base.length){base=[];pieces=collect(base);}if(!pieces.length)return false;
  let rows,used,encoded,keep=pieces.length,includeBase=true;
  while(keep){
   rows=[...(includeBase?base:[]),...pieces.slice(0,keep).flatMap(p=>p.values)];
   try{encoded=JSON.stringify(encodeArchive(rows));used=pieces.slice(0,keep).map(p=>p.chunk);break;}
   catch{if(keep===1&&includeBase&&base.length){includeBase=false;keep=pieces.length;}else keep=Math.floor(keep/2);}
  }
  if(!keep)return false;
  const raw=JSON.stringify(rows),payload=compress(Buffer.from(encoded)),hash=digest(raw);
  if(JSON.stringify(decodeArchive(JSON.parse(expand(payload,ENCODED_BYTES).toString())))!==raw)throw Error('Journal archive round-trip failed.');
  const first=rows[0].r.sequence,last=rows.at(-1).r.sequence,parent=prior&&Number(prior.first_sequence)===first?prior.digest:null;
  const expected=JSON.stringify(used.map(c=>[Number(c.first_sequence),Number(c.last_sequence),c.digest]));
  const [r]=await sql`SELECT spacetrader_archive_replace(${owner}::uuid,${target}::uuid,${first},${last},${parent},${expected}::jsonb,${hash},${digest(payload)},${Buffer.byteLength(raw)},decode(${hex(payload)},'hex')) AS replaced`;return r.replaced;
 }
 async function history(owner,target,before){
  const rows=await sql`SELECT c.* FROM spacetrader_journal_archives c JOIN spacetrader_voyages v ON v.id=c.voyage_id JOIN spacetrader_accounts a ON a.id=v.account_id WHERE a.id=${owner} AND v.id=coalesce(${target}::uuid,a.active_voyage) AND c.first_sequence<${before} AND c.last_sequence>=greatest(1,least(${before},v.sequence+1)-31) ORDER BY c.first_sequence DESC LIMIT 31`;
  return rows.flatMap(row=>{const first=Number(row.first_sequence),end=Math.min(Number(row.last_sequence)+1,before),start=Math.max(first,end-31);return readArchive(row,start-first,end-start);});
 }
 return {component,restore,append,checkpoint,maintain,history};
}
export function readArchive(row,start=0,count=ARCHIVE_ROWS){
 const payload=binary(row.payload);if(digest(payload)!==row.payload_digest||payload.length>ENCODED_BYTES||Number(row.raw_bytes)>ARCHIVE_BYTES)throw Error('Journal archive integrity check failed.');
 const value=JSON.parse(expand(payload,ENCODED_BYTES).toString('utf8'));
 if(value.o?.length!==Number(row.last_sequence)-Number(row.first_sequence)+1)throw Error('Journal archive count mismatch.');
 const values=decodeArchive(value,start,count);if(values.some((r,i)=>r.r?.sequence!==Number(row.first_sequence)+start+i))throw Error('Journal archive sequence mismatch.');
 if(start===0&&count>=value.o.length&&(digest(JSON.stringify(values))!==row.digest||Buffer.byteLength(JSON.stringify(values))!==Number(row.raw_bytes)))throw Error('Journal archive canonical integrity check failed.');
 return values;
}
