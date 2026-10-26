// Lossless JSON patches for canonical save cores. Object order is retained;
// property names are data, including __proto__ and constructor.
export function stateDelta(before,after){
 const a=JSON.parse(before),b=JSON.parse(after);
 function difference(x,y){
  if(JSON.stringify(x)===JSON.stringify(y))return [3];
  const full=[0,y];let delta=full;
  if(Array.isArray(x)&&Array.isArray(y)){
   const edits=[];for(let i=0;i<y.length;i++){const d=i<x.length?difference(x[i],y[i]):[0,y[i]];if(d[0]!==3)edits.push([i,d]);}
   delta=[1,y.length,edits];
  }else if(x&&y&&typeof x==='object'&&typeof y==='object'&&!Array.isArray(x)&&!Array.isArray(y)){
   const keys=Object.keys(y),edits=[];
   for(const key of keys){const d=Object.hasOwn(x,key)?difference(x[key],y[key]):[0,y[key]];if(d[0]!==3)edits.push([key,d]);}
   delta=[2,JSON.stringify(Object.keys(x))===JSON.stringify(keys)?null:keys,edits];
  }
  return JSON.stringify(delta).length<JSON.stringify(full).length?delta:full;
 }
 return difference(a,b);
}
export function applyStateDelta(before,patch,limit=2_000_000){
 let nodes=0;
 function apply(base,p,depth=0){
  if(++nodes>100000||depth>80||!Array.isArray(p))throw Error('Invalid save patch.');
  if(p[0]===0&&p.length===2)return p[1];
  if(p[0]===3&&p.length===1)return base;
  if(p[0]===1&&p.length===3&&Array.isArray(base)&&Number.isSafeInteger(p[1])&&p[1]>=0&&p[1]<=100000&&Array.isArray(p[2])){
   const out=base.slice(0,p[1]),seen=new Set();
   for(const edit of p[2]){if(!Array.isArray(edit)||edit.length!==2||!Number.isSafeInteger(edit[0])||edit[0]<0||edit[0]>=p[1]||seen.has(edit[0]))throw Error('Invalid array patch.');seen.add(edit[0]);out[edit[0]]=apply(base[edit[0]],edit[1],depth+1);}
   if(out.length!==p[1]||Array.from({length:p[1]},(_,i)=>Object.hasOwn(out,i)).some(v=>!v))throw Error('Incomplete array patch.');return out;
  }
  if(p[0]===2&&p.length===3&&base&&typeof base==='object'&&!Array.isArray(base)&&Array.isArray(p[2])){
   const keys=p[1]===null?Object.keys(base):p[1];
   if(!Array.isArray(keys)||keys.length>100000||keys.some(k=>typeof k!=='string')||new Set(keys).size!==keys.length)throw Error('Invalid object patch.');
   const changes=new Map();for(const edit of p[2]){if(!Array.isArray(edit)||edit.length!==2||typeof edit[0]!=='string'||changes.has(edit[0])||!keys.includes(edit[0]))throw Error('Invalid object patch.');changes.set(edit[0],edit[1]);}
   const out=Object.create(null);for(const key of keys){if(!changes.has(key)&&!Object.hasOwn(base,key))throw Error('Incomplete object patch.');out[key]=changes.has(key)?apply(base[key],changes.get(key),depth+1):base[key];}return out;
  }
  throw Error('Invalid save patch.');
 }
 const raw=JSON.stringify(apply(JSON.parse(before),patch));if(typeof raw!=='string'||raw.length>=limit)throw Error('Save patch exceeds the safe limit.');return raw;
}
