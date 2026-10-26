import {createHash} from 'node:crypto';
import {deflateSync,inflateSync} from 'node:zlib';

export const MAX_SAVE=2_000_000;
export const digest=raw=>createHash('sha256').update(raw).digest('hex');
export function boundedRaw(raw){
 if(typeof raw!=='string'||Buffer.byteLength(raw)>=MAX_SAVE)throw Error('The voyage exceeds the save limit. Your existing saves are preserved.');
 return Buffer.from(raw);
}
export const full=raw=>deflateSync(boundedRaw(raw),{level:1}).toString('base64');
export function inflate(payload,limit=MAX_SAVE){
 if(typeof payload!=='string'||payload.length>limit*2)throw Error('Invalid saved payload.');
 return inflateSync(Buffer.from(payload,'base64'),{maxOutputLength:limit});
}
function changes(before,after,path=[],out=[]){
 if(before===after)return out;
 if(!before||!after||typeof before!=='object'||typeof after!=='object'||Array.isArray(before)!==Array.isArray(after)){out.push(['set',path,after]);return out;}
 if(Array.isArray(before)){
  const old=before.map(value=>JSON.stringify(value)),next=after.map(value=>JSON.stringify(value));
  let prefix=0,suffix=0;while(prefix<old.length&&prefix<next.length&&old[prefix]===next[prefix])prefix++;
  while(suffix<old.length-prefix&&suffix<next.length-prefix&&old[old.length-1-suffix]===next[next.length-1-suffix])suffix++;
  if(prefix===old.length&&prefix===next.length)return out;
  if(before.length!==after.length){out.push(['splice',path,prefix,before.length-prefix-suffix,after.slice(prefix,after.length-suffix)]);return out;}
  if(!prefix&&before.length>1){
   const shift=old.findIndex((value,index)=>index>0&&index<=16&&value===next[0]);
   if(shift>0&&old.slice(shift).every((value,index)=>value===next[index])){out.push(['splice',path,0,shift,[]],['splice',path,before.length-shift,0,after.slice(-shift)]);return out;}
  }
  for(let index=prefix;index<before.length-suffix;index++)changes(before[index],after[index],[...path,index],out);return out;
 }
 const a=Object.keys(before),b=Object.keys(after);
 if(a.length!==b.length||a.some((key,index)=>key!==b[index])){out.push(['set',path,after]);return out;}
 for(const key of a)changes(before[key],after[key],[...path,key],out);return out;
}
function apply(previous,operations){
 let value=JSON.parse(previous);
 if(!Array.isArray(operations)||operations.length>100000)throw Error('Invalid save changes.');
 for(const operation of operations){
  const [kind,path]=operation;if(!Array.isArray(path)||path.length>100)throw Error('Invalid save path.');
  if(kind==='set'&&!path.length){value=operation[2];continue;}
  let parent=value;const route=kind==='splice'?path:path.slice(0,-1);
  for(const part of route){if(!parent||typeof parent!=='object'||!Object.hasOwn(parent,part))throw Error('Missing save path.');parent=parent[part];}
  if(kind==='set'){const key=path.at(-1);if(!parent||typeof parent!=='object'||!Object.hasOwn(parent,key))throw Error('Missing save field.');Object.defineProperty(parent,key,{value:operation[2],enumerable:true,writable:true,configurable:true});}
  else if(kind==='splice'){const [, ,start,remove,items]=operation;if(!Array.isArray(parent)||!Number.isSafeInteger(start)||start<0||start>parent.length||!Number.isSafeInteger(remove)||remove<0||remove>parent.length-start||!Array.isArray(items)||items.length>100000)throw Error('Invalid saved array change.');parent.splice(start,remove,...items);}
  else throw Error('Unknown save change.');
 }
 return JSON.stringify(value);
}
export function pack(raw,previous,sequence){
 const next=boundedRaw(raw),complete=deflateSync(next,{level:1});
 if(!previous||sequence%40===1)return {codec:'full',payload:complete.toString('base64')};
 const prior=boundedRaw(previous);let prefix=0,suffix=0;
 while(prefix<prior.length&&prefix<next.length&&prior[prefix]===next[prefix])prefix++;
 while(suffix<prior.length-prefix&&suffix<next.length-prefix&&prior[prior.length-1-suffix]===next[next.length-1-suffix])suffix++;
 const header=Buffer.alloc(8);header.writeUInt32BE(prefix);header.writeUInt32BE(suffix,4);
 const delta=deflateSync(Buffer.concat([header,next.subarray(prefix,next.length-suffix)]),{level:1});
 let result=delta.length<complete.length?{codec:'delta',data:delta}:{codec:'full',data:complete};
 // Structural changes avoid storing the unchanged market/world between distant
 // balance and journal fields. Preserve byte identity, including property order.
 try{
  const a=JSON.parse(previous),b=JSON.parse(raw);
  if(JSON.stringify(a)===previous&&JSON.stringify(b)===raw){
   const operations=changes(a,b),candidate=deflateSync(Buffer.from(JSON.stringify(operations)),{level:1});
   if(candidate.length<result.data.length&&apply(previous,operations)===raw)result={codec:'json',data:candidate};
  }
 }catch{/* Unusual legacy formatting keeps the byte-preserving codec. */}
 return {codec:result.codec,payload:result.data.toString('base64')};
}
export function unpack(row,previous){
 const payload=inflate(row.payload);let raw;
 if(row.codec==='full')raw=payload;
 else if(row.codec==='delta'){
  if(payload.length<8||typeof previous!=='string')throw Error('Earlier save data is unavailable.');
  const prior=boundedRaw(previous),prefix=payload.readUInt32BE(0),suffix=payload.readUInt32BE(4);
  if(prefix+suffix>prior.length)throw Error('Invalid save delta.');
  raw=Buffer.concat([prior.subarray(0,prefix),payload.subarray(8),prior.subarray(prior.length-suffix)]);
 }else if(row.codec==='json'){
  if(typeof previous!=='string')throw Error('Earlier save data is unavailable.');
  raw=Buffer.from(apply(previous,JSON.parse(payload.toString('utf8'))));
 }else throw Error('Unknown save codec.');
 if(raw.length>=MAX_SAVE||digest(raw)!==row.digest)throw Error('Saved voyage integrity check failed.');
 return raw.toString('utf8');
}
