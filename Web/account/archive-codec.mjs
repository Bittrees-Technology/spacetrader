// Lossless columnar journals. Bounds are checked before reconstructing any row.
export const ARCHIVE_ROWS=8192,ARCHIVE_BYTES=16*1024*1024,ENCODED_BYTES=2_000_000;
const bad=()=>{throw Error('Journal archive failed its format or expansion check.');};
const bytes=x=>new TextEncoder().encode(JSON.stringify(x)).length;
const scalar=x=>x===null||typeof x==='string'||typeof x==='boolean'||typeof x==='number'&&Number.isFinite(x);
export function encodeArchive(rows){
 if(!Array.isArray(rows)||!rows.length||rows.length>ARCHIVE_ROWS||bytes(rows)>ARCHIVE_BYTES)bad();
 const groups=[],index=new Map(),order=[];
 for(const row of rows){
  const values=[];let nodes=0;
  function layout(v,depth=0){if(depth>60||++nodes>100000)bad();if(Array.isArray(v))return[1,...v.map(x=>layout(x,depth+1))];if(v!==null&&typeof v==='object')return[2,...Object.entries(v).map(([k,x])=>[k,layout(x,depth+1)])];if(!scalar(v))bad();values.push(v);return 0;}
  const t=layout(row),key=JSON.stringify(t);let id=index.get(key);
  if(id===undefined){id=groups.length;index.set(key,id);groups.push({t,c:values.map(()=>[]),n:0});}
  const g=groups[id];g.n++;values.forEach((v,i)=>g.c[i].push(v));order.push(id);
 }
 function column(v){
  if(v.every(x=>Object.is(x,v[0])))return[0,v[0]];
  if(v.every(Number.isSafeInteger)){const d=v.slice(1).map((x,i)=>x-v[i]);if(d.every(Number.isSafeInteger))return[1,v[0],d];}
  if(v.every(x=>typeof x==='string')){const s=[],m=new Map(),c=v.map(x=>{if(!m.has(x)){m.set(x,s.length);s.push(x);}return m.get(x);});if(s.length<v.length*.8)return[2,s,c];}
  return[3,v];
 }
 const value={v:3,o:order,g:groups.map(g=>({t:g.t,n:g.n,c:g.c.map(column)}))};
 validateArchive(value);return value;
}
export function validateArchive(value){
 if(!value||value.v!==3||!Array.isArray(value.o)||!value.o.length||value.o.length>ARCHIVE_ROWS||!Array.isArray(value.g)||!value.g.length||value.g.length>value.o.length||bytes(value)>ENCODED_BYTES)bad();
 const counts=Array(value.g.length).fill(0);for(const id of value.o){if(!Number.isSafeInteger(id)||id<0||id>=counts.length)bad();counts[id]++;}
 let expanded=2+value.o.length-1,nodes=0;
 for(let id=0;id<value.g.length;id++){
  const g=value.g[id];if(!g||g.n!==counts[id]||!g.n||!Array.isArray(g.c))bad();let leaves=0;
  function template(t,depth=0){
   if(depth>60||++nodes>200000)bad();if(t===0){leaves++;return 0;}
   if(!Array.isArray(t)||t.length<1||![1,2].includes(t[0]))bad();
   let size=2+Math.max(0,t.length-2);
   if(t[0]===1){for(const child of t.slice(1))size+=template(child,depth+1);}
   else{const keys=new Set();for(const pair of t.slice(1)){if(!Array.isArray(pair)||pair.length!==2||typeof pair[0]!=='string'||keys.has(pair[0]))bad();keys.add(pair[0]);size+=bytes(pair[0])+1+template(pair[1],depth+1);}}
   return size;
  }
  expanded+=template(g.t)*g.n;if(g.c.length!==leaves)bad();
  for(const c of g.c){
   if(!Array.isArray(c))bad();let size=0;
   if(c[0]===0){if(c.length!==2||!scalar(c[1]))bad();size=bytes(c[1])*g.n;}
   else if(c[0]===1){if(c.length!==3||!Number.isSafeInteger(c[1])||!Array.isArray(c[2])||c[2].length!==g.n-1)bad();let n=c[1];size=bytes(n);for(const d of c[2]){if(!Number.isSafeInteger(d)||!Number.isSafeInteger(n+=d))bad();size+=bytes(n);}}
   else if(c[0]===2){if(c.length!==3||!Array.isArray(c[1])||!Array.isArray(c[2])||c[2].length!==g.n||c[1].some(x=>typeof x!=='string')||new Set(c[1]).size!==c[1].length)bad();for(const at of c[2]){if(!Number.isSafeInteger(at)||at<0||at>=c[1].length)bad();size+=bytes(c[1][at]);}}
   else if(c[0]===3){if(c.length!==2||!Array.isArray(c[1])||c[1].length!==g.n||c[1].some(x=>!scalar(x)))bad();for(const x of c[1])size+=bytes(x);}
   else bad();expanded+=size;if(expanded>ARCHIVE_BYTES)bad();
  }
 }
 if(expanded>ARCHIVE_BYTES)bad();return value;
}
export function decodeArchive(value,start=0,count=ARCHIVE_ROWS){
 validateArchive(value);if(!Number.isSafeInteger(start)||!Number.isSafeInteger(count)||start<0||count<0||count>ARCHIVE_ROWS)bad();
 const end=Math.min(value.o.length,start+count),seen=Array(value.g.length).fill(0),selected=[];
 for(let i=0;i<end;i++){const id=value.o[i],at=seen[id]++;if(i>=start)selected.push([id,at]);}
 const wanted=value.g.map(()=>new Set());for(const [id,at]of selected)wanted[id].add(at);
 const columns=value.g.map((g,id)=>g.c.map(c=>{
  const out=new Map(),targets=wanted[id];if(!targets.size)return out;
  if(c[0]===0)for(const at of targets)out.set(at,c[1]);
  else if(c[0]===1){let n=c[1];const last=Math.max(...targets);for(let i=0;i<=last;i++){if(i)n+=c[2][i-1];if(targets.has(i))out.set(i,n);}}
  else for(const at of targets)out.set(at,c[0]===2?c[1][c[2][at]]:c[1][at]);return out;
 }));
 return selected.map(([id,at])=>{let col=0;function restore(t){if(t===0)return columns[id][col++].get(at);if(t[0]===1)return t.slice(1).map(restore);const out={};for(const [key,child]of t.slice(1))Object.defineProperty(out,key,{value:restore(child),enumerable:true,configurable:true,writable:true});return out;}return restore(value.g[id].t);});
}
