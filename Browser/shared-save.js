'use strict';
// One conditional write per action. A stale tab can never replace a newer voyage.
(function(root){
 function createSharedVoyageClient(request){
  let snapshot=null;
  async function call(path,options){let response,value;try{response=await request(path,options);value=await response.json();}catch(error){error.transport=true;throw error;}if(!response.ok){const error=Error(value.error||'Shared save is unavailable.');if(response.status===409)error.snapshot=value;throw error;}return value;}
  return {
   get snapshot(){return snapshot;},
   async read(force=false){const query=!force&&snapshot?.ledger&&snapshot.revision?'?since='+snapshot.revision:'';const value=await call('/api/voyage'+query,{cache:'no-store'});snapshot={...snapshot,...value};return snapshot;},
   async write(key,raw,preserve=false,action=null){
    if(!snapshot)throw Error('Reconnect to your shared voyage before continuing.');
    const options={method:'POST',headers:{'Content-Type':'application/json','X-Spacetrader':'shared-save-v1'},body:JSON.stringify({key,raw,revision:snapshot.revision,preserve,...(action?{action}:{})})};let value;try{value=await call('/api/voyage',options);}catch(error){if(!action||!error.transport)throw error;value=await call('/api/voyage',options);}snapshot={...snapshot,...value};return snapshot;
   },
   async checkpoint(key,raw,expected){
    if(!snapshot)throw Error('Reconnect before changing a checkpoint.');
    if(!['slot1','slot2','slot3'].includes(key))throw Error('Unknown checkpoint slot.');
    const value=await call('/api/checkpoint',{method:'POST',headers:{'Content-Type':'application/json','X-Spacetrader':'shared-save-v1'},body:JSON.stringify({key,raw,expected,revision:snapshot.revision})});
    snapshot={...snapshot,...value};return snapshot;
   },
   async backups(){return (await call('/api/backups',{cache:'no-store'})).backups;},
   async backupPage(offset=0){return (await call('/api/backups?offset='+Math.max(0,Math.floor(offset)),{cache:'no-store'})).backups;},
   async history(before){return (await call('/api/ledger'+(before?'?before='+before:''),{cache:'no-store'})).entries;},
   async recorded(sequence){return (await call('/api/ledger/'+sequence,{cache:'no-store'})).raw;},
   adopt(value){snapshot=value;}
  };
 }
 if(typeof module!=='undefined')module.exports={createSharedVoyageClient};else root.createSharedVoyageClient=createSharedVoyageClient;
})(typeof window!=='undefined'?window:this);
