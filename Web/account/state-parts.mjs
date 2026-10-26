// Shared browser/server wire representation; no recomputation of economy values.
export function splitState(raw){
 if(typeof raw!=='string'||raw.length>=2_000_000)throw Error('Invalid saved voyage.');
 const state=JSON.parse(raw),value=state?.exchangeStock?.pipeline;
 if(JSON.stringify(state)!==raw||typeof value!=='string')return {core:raw,component:null};
 state.exchangeStock.pipeline=null;return {core:JSON.stringify(state),component:value};
}
export function joinState(core,component){
 if(typeof core!=='string'||core.length>=2_000_000)throw Error('Invalid saved voyage.');
 if(component===null)return core;
 if(typeof component!=='string'||component.length>=2_000_000)throw Error('Invalid economy component.');
 const state=JSON.parse(core);if(!state?.exchangeStock||state.exchangeStock.pipeline!==null)throw Error('Invalid economy reference.');
 state.exchangeStock.pipeline=component;const raw=JSON.stringify(state);if(raw.length>=2_000_000)throw Error('Invalid saved voyage.');return raw;
}
