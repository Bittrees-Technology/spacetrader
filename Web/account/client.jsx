import React,{useState,useEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {createSiweMessage} from 'viem/siwe';
import {LoginPanel,EmailSignIn,EthereumSignIn} from './shared/login/LoginPanel.jsx';
import './theme.css';
import {createSyncTransport,createSaveOutbox} from './sync-transport.mjs';
import {createBatchTransport} from './batch-transport.mjs';
import {installJournalReader} from './journal-reader.mjs';
installJournalReader(window.SpacetraderJournalFeed);

const host=window,MODE='spacetrader.account-save-mode.v1',PIN='spacetrader.account-voyage.v2',NEW='spacetrader.new-charter.v2',PENDING='spacetrader.pending-charter.v2';
const saveOutbox=createSaveOutbox();
let localRequest,account=null,configured=false,dialog,reactRoot,cloudActive=false,pinned=null,cloudSync=null;
const getMode=()=>{try{return localStorage.getItem(MODE)||'device';}catch{return 'device';}};
const setMode=value=>{try{localStorage.setItem(MODE,value);}catch{throw Error('This browser could not save the account preference. Your voyages are preserved.');}};
function getPin(owner){if(pinned?.account===owner)return pinned.id;try{const value=JSON.parse(sessionStorage.getItem(PIN)||'null');if(value?.account===owner)return value.id;}catch{}return null;}
function setPin(owner,id){pinned={account:owner,id};try{sessionStorage.setItem(PIN,JSON.stringify(pinned));}catch{/* The in-memory tab remains pinned even if preferences cannot persist. */}}
async function chooseVoyage(id){
 if(host.SpacetraderAccountBridge&&!host.SpacetraderAccountBridge.canSwitch())throw Error('Finish the current encounter before changing voyages.');
 await host.SpacetraderAccountBridge?.settled();await call('/api/voyages/select',{id},true);setPin(account.account,id);setMode('account');location.assign('/play/');
}
async function newVoyage(){
 if(!account?.signedIn){open();return;}
 if(host.SpacetraderAccountBridge&&!host.SpacetraderAccountBridge.canSwitch())throw Error('Finish the current encounter before starting another voyage.');
 await host.SpacetraderAccountBridge?.settled();
 let pending;try{pending=JSON.parse(sessionStorage.getItem(PENDING)||'null');}catch{}
 if(pending?.account!==account.account){pending={account:account.account,operation:crypto.randomUUID()};sessionStorage.setItem(PENDING,JSON.stringify(pending));}
 const result=await call('/api/voyages/new',{operation:pending.operation,version:host.SpacetraderAccountBridge?.version||'web'},true);
 setPin(account.account,result.id);setMode('account');sessionStorage.setItem(NEW,JSON.stringify({account:account.account,id:result.id}));sessionStorage.removeItem(PENDING);location.assign('/play/');
}
function consumeNewIntent(id){try{const intent=JSON.parse(sessionStorage.getItem(NEW)||'null');if(intent?.account===account?.account&&intent.id===id){sessionStorage.removeItem(NEW);return true;}}catch{}return false;}
async function call(path,body,owner=false){
 const headers={'Content-Type':'application/json','X-Spacetrader-Storage':'compact-v1',...(owner?{'X-Spacetrader':'shared-save-v1','X-Spacetrader-Account':account?.account||''}:{})};
 const result=await fetch(path,{method:body===undefined?'GET':'POST',headers,credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(30000),...(body===undefined?{}:{body:JSON.stringify(body)})});
 const value=await result.json();if(!result.ok)throw Error(value.error||'The account request could not be completed.');return value;
}
const rawHash=async raw=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw)))).map(v=>v.toString(16).padStart(2,'0')).join('');
async function status(){account=await call('/api/account/status');configured=account.configured;return account;}
async function handoff(){
 const value=await call('/api/sso/status');
 if(value.configured&&['publish','resume'].includes(value.action)){
  const query=new URLSearchParams({mode:value.action,return_to:'/play/?account=1'});location.assign('/api/sso/start?'+query);return true;
 }
 return false;
}
async function transfer(setProgress){
 if(!localRequest)throw Error('The device ledger is not ready.');
 if(host.SpacetraderAccountBridge&&!host.SpacetraderAccountBridge.canSwitch())throw Error('Finish the current encounter or action before transferring your voyage.');
 await host.SpacetraderAccountBridge?.settled();
 const local=await (await localRequest('/api/voyage')).json();
 if(!local.raw)throw Error('Create a captain before transferring a device voyage.');
 async function exportPage(after){const result=await localRequest('/api/ledger-export?after='+after+'&until='+local.sequence);if(!result.ok)throw Error('Device history could not be read.');return result.json();}
 const first=await exportPage(0),total=first.total;
 if(!total)throw Error('The device action history is unavailable. Your save has not been replaced.');
 const hash=await rawHash(local.raw),source='device-'+await rawHash(local.revision+'|'+JSON.stringify(local.slots));
 const staged=await call('/api/import/start',{source,total,hash},true);
 if(staged.complete){await chooseVoyage(staged.id);return;}
 let revision=staged.revision,processed=0,after=0,page=first;
 do{
  for(const row of page.entries){
   if(!dialog?.open)throw Error('Transfer paused. Reopen Account & saves to resume; your device voyage is unchanged.');
   after=row.sequence;if(processed++<staged.sequence)continue;
   const response=await localRequest('/api/ledger/'+row.sequence);if(!response.ok)throw Error('A device action could not be transferred.');
   const {raw,event,created}=await response.json(),id='import-'+await rawHash(source+'|'+row.sequence);
   const result=await call('/api/import/batch',{id:staged.id,records:[{key:'auto',raw,revision,created,action:{id,type:event?.type||'legacy-import',args:event?.args||{},version:event?.version||'imported-browser-history',source:'browser'}}]},true);
   revision=result.revision;setProgress(`Transferring action ${processed} of ${total}…`);
  }
  if(processed>=total)break;page=await exportPage(after);
 }while(page.entries.length);
 const latest=await (await localRequest('/api/voyage')).json();
 if(latest.revision!==local.revision)throw Error('The device voyage changed during transfer. Retry to include the newest actions; no active cloud save was replaced.');
 // Separate requests keep three near-limit checkpoint saves below hosting body limits.
 for(const [key,raw] of Object.entries(local.slots||{}).filter(([key])=>/^slot[123]$/.test(key))){
  if(!dialog?.open)throw Error('Transfer paused. Reopen Account & saves to resume.');
  await call('/api/import/checkpoint',{id:staged.id,key,raw},true);
 }
 await call('/api/import/finish',{id:staged.id},true);
 if(dialog?.open){setPin(account.account,staged.id);setMode('account');location.assign('/play/');}
}
function SignIn({onSignedIn}){
 const [email,setEmail]=useState(''),[challenge,setChallenge]=useState(''),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const active=useRef(true);useEffect(()=>()=>{active.current=false;},[]);
 async function run(job){if(busy)return;setBusy(true);setError('');try{await job();}catch(e){setError(e.message||'Sign-in could not be completed.');}finally{setBusy(false);}}
 async function finished(){if(!active.current)return;await status();if(!active.current)return;if(!await handoff())await onSignedIn();}
 async function wallet(){
  if(!host.ethereum?.request)throw Error('Open this page in your Ethereum wallet’s browser, or use email here.');
  const timed=promise=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(Error('The wallet did not respond. You can try again or use email.')),60000))]);
  const addresses=await timed(host.ethereum.request({method:'eth_requestAccounts'}));if(!addresses?.[0])throw Error('Choose an Ethereum account.');
  if(!active.current)return;
  const value=await call('/api/auth/nonce',{}),message=createSiweMessage({address:addresses[0],chainId:1,domain:value.domain,uri:value.uri,nonce:value.nonce,version:'1',issuedAt:new Date(),statement:'Sign in to Spacetrader to save your voyage. This does not authorize a transaction.'});
  const signature=await timed(host.ethereum.request({method:'personal_sign',params:['0x'+Array.from(new TextEncoder().encode(message),v=>v.toString(16).padStart(2,'0')).join(''),addresses[0]]}));
  if(!active.current)return;
  await call('/api/auth/wallet',{message,signature});await finished();
 }
 return <LoginPanel product="Spacetrader" icon="/favicon.svg" title="Continue your voyage" description="Sign in to save your voyage and continue on another device."
  email={<EmailSignIn email={email} onEmailChange={setEmail} challenge={challenge} code={code} onCodeChange={setCode} busy={busy} disabled={!account?.emailEnabled} onReset={()=>{setChallenge('');setCode('');setError('');}} onSubmit={event=>{event.preventDefault();void run(async()=>{if(challenge){await call('/api/auth/verify-email',{challenge,code});await finished();}else{const result=await call('/api/auth/email',{email});setChallenge(result.challenge);}});}}/>}
  wallet={<EthereumSignIn busy={busy} onClick={()=>void run(wallet)}/>}
  notice={error?<p role="alert">{error}</p>:!account?.emailEnabled?<p>Email sign-in is temporarily unavailable. Your device voyage is preserved.</p>:null}
  footer={<p>Your device voyage stays separate until you choose to transfer it. Email and wallet identities are not automatically merged.</p>}/>;
}
function Account(){
 const [phase,setPhase]=useState('checking'),[error,setError]=useState(''),[library,setLibrary]=useState(null),[device,setDevice]=useState(null),[progress,setProgress]=useState(''),[busy,setBusy]=useState(false),[recoveries,setRecoveries]=useState([]);
 async function refresh(resume=false){
  try{
   const state=await status();
   if(!state.configured){setPhase('unavailable');return;}
   if(!state.signedIn){if(resume&&await handoff())return;setPhase('signin');return;}
   setLibrary(await call('/api/voyages',undefined,true));
   setRecoveries((await saveOutbox.list(state.account)).filter(r=>r.status==='conflict'));
   if(localRequest){const local=await (await localRequest('/api/voyage')).json();setDevice(local.raw?host.Heliocline.parse(local.raw):null);}
   setPhase('account');
  }catch(e){setError(e.message);setPhase('error');}
 }
 useEffect(()=>{void refresh(true);},[]);
 async function run(job){if(busy)return;setBusy(true);setError('');try{await job();}catch(e){setError(e.message);}finally{setBusy(false);}}
 async function more(){const next=await call('/api/voyages?after='+encodeURIComponent(library.next),undefined,true);setLibrary(current=>({...next,voyages:[...current.voyages,...next.voyages.filter(v=>!current.voyages.some(prior=>prior.id===v.id))]}));}
 if(phase==='signin')return <SignIn onSignedIn={()=>refresh()}/>;
 const day=value=>host.SpacetraderAccountBridge?.dayLabel?.(value)||'Day '+value,place=value=>host.SpacetraderAccountBridge?.placeLabel?.(value)||value;
 return <section className="captain-account-panel" aria-labelledby="captain-account-title"><div className="captain-account-brand"><img src="/favicon.svg" alt="" width="28" height="28"/><span>Spacetrader</span></div><h2 id="captain-account-title">Saved voyages</h2>
  {phase==='checking'&&<p role="status">Checking your account…</p>}
  {phase==='unavailable'&&<p>Account saves are not available yet. Your voyage still saves on this device.</p>}
  {phase==='error'&&<button onClick={()=>void refresh()}>Retry connection</button>}
  {phase==='account'&&<><p className="captain-account-identity">{account.label}</p>
   {recoveries.map(r=><article className="captain-voyage" key={r.key}><h3>Action needs review</h3><p>{r.batch?`${r.batch.events.length} pending actions remain on this device. They could not replace newer progress from another device.`:`An interrupted ${r.body.action.type.replaceAll('-',' ')} action could not replace newer progress saved on another device.`} Your account keeps the latest confirmed voyage.</p><button disabled={busy} onClick={()=>void run(async()=>{const blob=new Blob([JSON.stringify(r)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='spacetrader-pending-action.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);})}>Download pending actions</button><button disabled={busy} onClick={()=>void run(async()=>{await saveOutbox.clear(account.account,r.voyage);if(r.batch)location.assign('/play/');else await refresh();})}>Keep latest account progress</button></article>)}
   <div className="captain-voyage-list" aria-label="Account voyages">{library?.voyages.length?library.voyages.map(v=><article className="captain-voyage" key={v.id} aria-label={'Voyage: '+v.name}>
    <h3>{v.name}</h3><p>{day(v.day)} · {place(v.location)}</p><p className="captain-account-note">{v.sequence.toLocaleString()} actions{cloudActive&&getPin(account.account)===v.id?' · Current voyage':''}</p>
    <button disabled={busy} onClick={()=>void run(()=>chooseVoyage(v.id))}>Load voyage</button>
   </article>):<p>No account voyages yet. Start a new charter or transfer the voyage on this device.</p>}</div>
   {library?.next&&<button className="captain-account-secondary" disabled={busy} onClick={()=>void run(more)}>More voyages</button>}
   <button disabled={busy} onClick={()=>void run(newVoyage)}>New account voyage</button>
   {device?.profile.created&&<button disabled={busy} className="captain-account-secondary" onClick={()=>void run(()=>transfer(setProgress))}>Transfer device voyage &amp; history</button>}
   {progress&&<p role="status">{progress}</p>}
   <p className="captain-account-note">Each voyage keeps its latest progress, journal and complete action history. Starting another voyage preserves the earlier ones.</p>
   {library&&<p className="captain-account-note">Account storage: {(library.usedBytes/1048576).toFixed(1)} of {(library.limitBytes/1048576).toFixed(0)} MiB across all voyages.</p>}
   <button disabled={busy} className="captain-account-secondary" onClick={()=>void run(async()=>{await host.SpacetraderAccountBridge?.settled();await call('/api/auth/logout',{});setMode('device');location.assign('/play/');})}>Sign out &amp; return to device voyage</button>
  </>}
  {error&&<p role="alert">{error}</p>}
 </section>;
}
function open(){
 if(!dialog){dialog=document.createElement('dialog');dialog.id='captain-account-dialog';dialog.className='spacetrader-account';dialog.setAttribute('aria-label','Account & saves');dialog.innerHTML='<button type="button" class="captain-account-close" aria-label="Back to game">Back to game</button><div data-account-root></div>';document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{reactRoot?.unmount();reactRoot=null;});}
 if(!reactRoot){reactRoot=createRoot(dialog.querySelector('[data-account-root]'));reactRoot.render(<Account/>);}
 if(!dialog.open)dialog.showModal();
}
host.spacetraderAccountMenuHTML=(entry=false)=>'<button type="button" class="game-button game-menu-item" data-spacetrader-account><strong>'+(entry?(account?.signedIn?'Saved voyages':'Sign in &amp; load voyage'):'Account &amp; saves')+'</strong><small>Continue across devices</small></button>';
document.addEventListener('click',event=>{if(event.target.closest('[data-spacetrader-account]')){event.preventDefault();open();}});
const original=host.openBrowserVoyageLedger;
host.openBrowserVoyageLedger=async options=>{
 localRequest=await original(options);
 try{await status();}catch{account=null;return localRequest;}
 const localHead=await (await localRequest('/api/voyage')).json();
 const hasDeviceVoyage=Boolean(localHead.raw&&host.Heliocline.parse(localHead.raw).profile.created);
 if(account.signedIn&&(getMode()==='account'||!hasDeviceVoyage)){
  cloudActive=true;
  setMode('account');
  const owner=account.account;
  let voyage=getPin(owner);
  const cached={};
  const send=(path,options)=>fetch(path,{...options,credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(30000)});
  const legacy=createSyncTransport({fetch:send,owner,voyage,outbox:saveOutbox,onVoyage:id=>{voyage=id;setPin(owner,id);},onConflict:()=>{setTimeout(open,0);}});
  const cloudFetch=createBatchTransport({fallback:legacy,fetch:send,owner,voyage,outbox:saveOutbox,onConflict:()=>{setTimeout(open,0);},onStatus:()=>{host.dispatchEvent(new Event('spacetrader-sync-status'));}});cloudSync=cloudFetch;
  host.addEventListener('online',()=>{void cloudFetch.flush().catch(()=>{});});
  host.addEventListener('pagehide',()=>{void cloudFetch.flush().catch(()=>{});});
  return async(path,options={})=>{
   const response=await cloudFetch(path,options),value=await response.clone().json();
   if(response.ok&&value.voyage){if(voyage&&voyage!==value.voyage)throw Error('The selected voyage changed. Reopen Saved voyages.');voyage=value.voyage;setPin(owner,voyage);}
   if(value.checkpointLimit===0){value.slots={};delete value.checkpointDigests;return new Response(JSON.stringify(value),{status:response.status,headers:response.headers});}
   if(!value.checkpointDigests)return response;
   const slots={};
   await Promise.all(Object.entries(value.checkpointDigests).map(async([key,hash])=>{
    let slot=cached[key];
    if(slot?.digest!==hash){const result=await cloudFetch('/api/checkpoint?slot='+encodeURIComponent(key));const body=await result.json();if(!result.ok)throw Error(body.error||'A checkpoint could not be loaded.');slot=body;if(slot.digest!==hash)throw Error('A checkpoint changed on another device. Reload before continuing.');cached[key]=slot;}
    slots[key]=slot.raw;
   }));
   for(const key of Object.keys(cached))if(!(key in slots))delete cached[key];
   value.slots=slots;delete value.checkpointDigests;
   return new Response(JSON.stringify(value),{status:response.status,headers:response.headers});
  };
 }
 if(new URLSearchParams(location.search).get('account')==='1')setTimeout(open,0);
 return localRequest;
};
host.SpacetraderAccount={open,newVoyage,consumeNewIntent,isCloud:()=>cloudActive,useDevice:()=>setMode('device'),sync:()=>cloudSync?.flush(),syncStatus:()=>cloudSync?.status(),saveStatus:()=>{const s=cloudSync?.status();return s?.conflict?'Saved on device · sync needs review':s?.pending?s.error?'Saved on device · sync delayed':'Saved on device · syncing':'Account progress · synced';}};
const deviceHealth=host.spacetraderSaveHealthHTML;
host.spacetraderSaveHealthHTML=()=>cloudActive?'<details class="browser-save-health"><summary>Account save storage</summary><p>Actions save on this device immediately and synchronize with your account in short batches. Each voyage keeps its latest progress and full journal.</p><button type="button" data-spacetrader-account>Account &amp; saves</button></details>':deviceHealth?.()||'';
