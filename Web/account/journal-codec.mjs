// Lossless journal representation: shared field names and repeated strings are
// stored once per block. Numbers/text keep their exact JSON representation.
export function encodeJournal(rows){
 const keys=[],keyIndex=new Map(),counts=new Map();
 function visit(value,depth=0){
  if(depth>100)throw Error('Journal nesting exceeds its safe limit.');
  if(typeof value==='string')counts.set(value,(counts.get(value)||0)+1);
  else if(Array.isArray(value))value.forEach(item=>visit(item,depth+1));
  else if(value&&typeof value==='object')for(const [key,item]of Object.entries(value)){if(!keyIndex.has(key)){keyIndex.set(key,keys.length);keys.push(key);}visit(item,depth+1);}
 }
 visit(rows);
 const strings=[...counts].filter(([value,count])=>value.length>=4&&count>=2).map(([value])=>value),index=new Map(strings.map((value,i)=>[value,i]));
 function encode(value,depth=0){
  if(typeof value==='string'&&index.has(value))return[2,index.get(value)];
  if(Array.isArray(value))return[0,...value.map(item=>encode(item,depth+1))];
  if(value&&typeof value==='object')return[1,...Object.entries(value).flatMap(([key,item])=>[keyIndex.get(key),encode(item,depth+1)])];
  return value;
 }
 return {v:2,k:keys,s:strings,d:encode(rows)};
}
export function decodeJournal(value){
 // Existing blocks remain readable without conversion or data removal.
 if(Array.isArray(value))return value;
 const {v,k,s,d}=value||{};
 if(v!==2||!Array.isArray(k)||!Array.isArray(s)||k.length>100000||s.length>200000||new Set(k).size!==k.length||!k.every(x=>typeof x==='string')||!s.every(x=>typeof x==='string'))throw Error('Unknown journal encoding.');
 const index=(i,values)=>Number.isSafeInteger(i)&&i>=0&&i<values.length;
 function decode(item,depth=0){
  if(depth>100)throw Error('Journal nesting exceeds its safe limit.');
  if(!Array.isArray(item)){if(item!==null&&typeof item==='object')throw Error('Invalid journal scalar.');return item;}
  if(item[0]===0)return item.slice(1).map(x=>decode(x,depth+1));
  if(item[0]===2&&item.length===2&&index(item[1],s))return s[item[1]];
  if(item[0]!==1||item.length%2!==1)throw Error('Invalid journal value.');
  const result={};
  for(let i=1;i<item.length;i+=2){
   if(!index(item[i],k)||Object.hasOwn(result,k[item[i]]))throw Error('Invalid journal field.');
   Object.defineProperty(result,k[item[i]],{value:decode(item[i+1],depth+1),enumerable:true,writable:true,configurable:true});
  }
  return result;
 }
 const rows=decode(d);if(!Array.isArray(rows))throw Error('Invalid journal block.');return rows;
}
