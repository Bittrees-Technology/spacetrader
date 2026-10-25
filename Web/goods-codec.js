'use strict';
// Lossless column dictionaries: repeated descriptions and requirements travel once.
(function(root){
 function decode(value){
  if(value?.format!=='goods-columns-v1'||!Number.isSafeInteger(value.rowCount)||value.rowCount<0||value.rowCount>100000||!Array.isArray(value.columns)||value.columns.length>100||!Array.isArray(value.values)||!Array.isArray(value.indexes)||value.values.length!==value.columns.length||value.indexes.length!==value.columns.length)throw Error('Invalid catalogue data.');
  const rows=Array.from({length:value.rowCount},()=>({})),seen=new Set();
  value.columns.forEach((key,col)=>{
   const values=value.values[col],indexes=value.indexes[col];
   if(typeof key!=='string'||['__proto__','prototype','constructor'].includes(key)||seen.has(key)||!Array.isArray(values)||!Array.isArray(indexes)||indexes.length!==rows.length)throw Error('Invalid catalogue column.');
   seen.add(key);
   indexes.forEach((index,row)=>{if(!Number.isSafeInteger(index)||index< -1||index>=values.length)throw Error('Invalid catalogue reference.');if(index!==-1)rows[row][key]=values[index];});
  });
  return rows;
 }
 const api={decode};if(typeof module!=='undefined')module.exports=api;else root.SpacetraderGoodsCodec=api;
})(globalThis);
