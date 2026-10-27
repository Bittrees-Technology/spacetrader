import React,{useState,useEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {createSiweMessage} from 'viem/siwe';
import {LoginPanel,EmailSignIn,EthereumSignIn} from './shared/login/LoginPanel.jsx';
import './theme.css';
import {createSyncTransport,createSaveOutbox} from './sync-transport.mjs';
import {createBatchTransport} from './batch-transport.mjs';
import {installJournalReader} from './journal-reader.mjs';
import {LinkedSignIns} from './linking-client.jsx';
installJournalReader(window.SpacetraderJournalFeed);

const host=window,MODE='spacetrader.account-save-mode.v1',PIN='spacetrader.account-voyage.v2',NEW='spacetrader.new-charter.v2',PENDING='spacetrader.pending-charter.v2';
const saveOutbox=createSaveOutbox();
let localRequest,account=null,configured=false,dialog,reactRoot,cloudActive=false,pinned=null,cloudSync=null;
const getMode=()=>{try{return localStorage.getItem(MODE)||'device';}catch{return 'device';}};
const setMode=value=>{try{localStorage.setItem(MODE,value);}catch{throw Error('This browser could not save the account preference. Your voyages are preserved.');}};
function getPin(owner){
 if(account?.singleActiveVoyage&&account.account===owner)return account.activeVoyage||null;
 if(pinned?.account===owner)return pinned.id;
 // A live tab keeps its own selection; a new tab resumes this account's last voyage on this device.
 for(const [storage,key]of [['sessionStorage',PIN],['localStorage',PIN+'.'+owner]])try{const value=JSON.parse(host[storage].getItem(key)||'null');if(value?.account===owner&&typeof value.id==='string')return value.id;}catch{}
 return null;
}
function setPin(owner,id){
 pinned={account:owner,id};const value=JSON.stringify(pinned);
 try{sessionStorage.setItem(PIN,value);}catch{/* Keep the tab selection in memory. */}
 if(!document.hidden)try{localStorage.setItem(PIN+'.'+owner,value);}catch{/* Save content remains in IndexedDB and the account. */}
}
async function chooseVoyage(id){
 if(host.SpacetraderAccountBridge&&!host.SpacetraderAccountBridge.canSwitch())throw Error('Finish the current encounter before changing voyages.');
 await host.SpacetraderAccountBridge?.settled();await call('/api/voyages/select',{id},true);setPin(account.account,id);setMode('account');location.assign('/play/');
}
async function newVoyage(expected=null){
 if(!account?.signedIn){open();return;}
 if(host.SpacetraderAccountBridge&&!host.SpacetraderAccountBridge.canSwitch())throw Error('Finish the current encounter before starting another voyage.');
 await host.SpacetraderAccountBridge?.settled();
 let restart={};
 if(account.singleActiveVoyage){
  const local=cloudActive?host.SpacetraderAccountBridge?.current():null;
  const selected=local?{id:local.voyage||null,revision:local.revision||null}:expected||{id:null,revision:null};
  restart={restartFrom:selected.id,revision:selected.revision};
 }
 let pending;try{pending=JSON.parse(sessionStorage.getItem(PENDING)||'null');}catch{}
 if(pending?.account!==account.account){pending={account:account.account,operation:crypto.randomUUID()};sessionStorage.setItem(PENDING,JSON.stringify(pending));}
 let result;try{result=await call('/api/voyages/new',{operation:pending.operation,version:host.SpacetraderAccountBridge?.version||'web',...restart},true);}catch(error){if(error.status===409)sessionStorage.removeItem(PENDING);throw error;}
 setPin(account.account,result.id);setMode('account');sessionStorage.setItem(NEW,JSON.stringify({account:account.account,id:result.id}));sessionStorage.removeItem(PENDING);location.assign('/play/');
}
function consumeNewIntent(id){try{const intent=JSON.parse(sessionStorage.getItem(NEW)||'null');if(intent?.account===account?.account&&intent.id===id){sessionStorage.removeItem(NEW);return true;}}catch{}return false;}
async function call(path,body,owner=false,voyage=null){
 const headers={'Content-Type':'application/json','X-Spacetrader-Storage':'compact-v1',...(owner?{'X-Spacetrader':'shared-save-v1','X-Spacetrader-Account':account?.account||''}:{}),...(voyage?{'X-Spacetrader-Voyage':voyage}:{})};
 const result=await fetch(path,{method:body===undefined?'GET':'POST',headers,credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(30000),...(body===undefined?{}:{body:JSON.stringify(body)})});
 const value=await result.json();if(!result.ok)throw Object.assign(Error(value.error||'The account request could not be completed.'),{status:result.status,code:value.code});return value;
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
function SignIn({onSignedIn,requiredIdentity=null}){
 const [email,setEmail]=useState(requiredIdentity?.includes('@')?requiredIdentity:''),[challenge,setChallenge]=useState(''),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const active=useRef(true);useEffect(()=>()=>{active.current=false;},[]);
 async function run(job){if(busy)return;setBusy(true);setError('');try{await job();}catch(e){setError(e.message||'Sign-in could not be completed.');}finally{setBusy(false);}}
 async function finished(){if(!active.current)return;await status();if(!active.current)return;if(requiredIdentity){if(account.label!==requiredIdentity)throw Error('Verify your existing sign-in before continuing.');await onSignedIn();return;}if(!await handoff())await onSignedIn();}
 async function wallet(){
  if(!host.ethereum?.request)throw Error('Open this page in your Ethereum wallet’s browser, or use email here.');
  const timed=promise=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(Error('The wallet did not respond. You can try again or use email.')),60000))]);
  const addresses=await timed(host.ethereum.request({method:'eth_requestAccounts'}));if(!addresses?.[0])throw Error('Choose an Ethereum account.');if(requiredIdentity&&addresses[0].toLowerCase()!==requiredIdentity)throw Error('Choose the wallet already signed in to this account.');
  if(!active.current)return;
  const value=await call('/api/auth/nonce',{}),message=createSiweMessage({address:addresses[0],chainId:1,domain:value.domain,uri:value.uri,nonce:value.nonce,version:'1',issuedAt:new Date(),statement:'Sign in to Spacetrader to save your voyage. This does not authorize a transaction.'});
  const signature=await timed(host.ethereum.request({method:'personal_sign',params:['0x'+Array.from(new TextEncoder().encode(message),v=>v.toString(16).padStart(2,'0')).join(''),addresses[0]]}));
  if(!active.current)return;
  await call('/api/auth/wallet',{message,signature});await finished();
 }
 return <LoginPanel product="Spacetrader" icon="/favicon.svg" title={requiredIdentity?"Verify your current sign-in":"Continue your voyage"} description={requiredIdentity?"For account safety, verify your current sign-in again before adding another.":"Sign in to save your voyage and continue on another device."}
  email={!requiredIdentity||requiredIdentity.includes('@')?<EmailSignIn email={email} onEmailChange={setEmail} challenge={challenge} code={code} onCodeChange={setCode} busy={busy} disabled={!account?.emailEnabled} onReset={()=>{setChallenge('');setCode('');setError('');}} onSubmit={event=>{event.preventDefault();void run(async()=>{if(requiredIdentity&&email.trim().toLowerCase()!==requiredIdentity)throw Error('Use the email already signed in to this account.');if(challenge){await call('/api/auth/verify-email',{challenge,code});await finished();}else{const result=await call('/api/auth/email',{email});setChallenge(result.challenge);}});}}/>:null}
  wallet={!requiredIdentity||!requiredIdentity.includes('@')?<EthereumSignIn busy={busy} onClick={()=>void run(wallet)}/>:null}
  notice={error?<p role="alert">{error}</p>:(!requiredIdentity||requiredIdentity.includes('@'))&&!account?.emailEnabled?<p>Email sign-in is temporarily unavailable. Your device voyage is preserved.</p>:null}
  footer={<p>Your device voyage stays separate until you choose to transfer it. You can link email and Ethereum sign-ins from Account &amp; saves after signing in.</p>}/>;
}
function ArchiveJournal({voyage,onBack}){
 const [rows,setRows]=useState([]),[before,setBefore]=useState(null),[more,setMore]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function load(cursor=null){setBusy(true);setError('');try{const result=await call('/api/ledger'+(cursor?'?before='+cursor:''),undefined,true,voyage.id),visible=result.entries.slice(0,30);setRows(prior=>cursor?[...prior,...visible]:visible);setBefore(visible.at(-1)?.sequence||null);setMore(result.entries.length>30);}catch(e){setError(e.message);}finally{setBusy(false);}}
 useEffect(()=>{void load();},[voyage.id]);
 const day=value=>host.SpacetraderAccountBridge?.dayLabel?.(value)||'Day '+value;
 return <section className="captain-account-panel"><button onClick={onBack}>Back to saved voyages</button><h2>{voyage.name}</h2><p>Archived voyage · read-only</p><ol className="captain-archive-journal" aria-label="Archived action history">{rows.map(row=>{const record=row.record||host.SpacetraderJournalFeed.prepare(row,null,null,{...host.SpacetraderAccountBridge.journalContext(),activeCaptain:voyage.name});return <li key={row.sequence}><small>{day(row.day)} · #{row.sequence.toLocaleString()}</small>{record.feedRows.map((line,i)=><p key={i}><strong>{line.title}</strong>{' '}{line.text}<small>{line.context}</small></p>)}</li>;})}</ol>{error&&<p role="alert">{error}</p>}{more&&<button disabled={busy} onClick={()=>void load(error&&rows.length===0?null:before)}>{busy?'Loading…':error?'Retry':'Earlier actions'}</button>}{!busy&&!error&&!rows.length&&<p>No recorded actions.</p>}</section>;
}
function Account(){
 const [phase,setPhase]=useState('checking'),[error,setError]=useState(''),[library,setLibrary]=useState(null),[device,setDevice]=useState(null),[progress,setProgress]=useState(''),[busy,setBusy]=useState(false),[recoveries,setRecoveries]=useState([]),[archive,setArchive]=useState(null),[restart,setRestart]=useState(null),[linking,setLinking]=useState(false);
 async function refresh(resume=false){
  try{
   const state=await status();
   if(!state.configured){setPhase('unavailable');return;}
   if(!state.signedIn){if(resume&&await handoff())return;setPhase('signin');return;}
   setLibrary(await call('/api/voyages',undefined,true));
   setRecoveries((await saveOutbox.list(state.account)).filter(r=>r.status==='conflict'||state.singleActiveVoyage&&r.voyage!==state.activeVoyage));
   if(localRequest){const local=await (await localRequest('/api/voyage')).json();setDevice(local.raw?host.Heliocline.parse(local.raw):null);}
   setPhase('account');
  }catch(e){setError(e.message);setPhase('error');}
 }
 useEffect(()=>{void refresh(true);const update=()=>void refresh();host.addEventListener('spacetrader-account-refresh',update);return()=>host.removeEventListener('spacetrader-account-refresh',update);},[]);
 async function run(job){if(busy)return;setBusy(true);setError('');try{await job();}catch(e){setError(e.message);}finally{setBusy(false);}}
 async function more(){const next=await call('/api/voyages?after='+encodeURIComponent(library.next),undefined,true);setLibrary(current=>({...next,voyages:[...current.voyages,...next.voyages.filter(v=>!current.voyages.some(prior=>prior.id===v.id))],scores:[...(current.scores||[]),...(next.scores||[]).filter(v=>!(current.scores||[]).some(prior=>prior.id===v.id))]}));}
 if(phase==='signin')return <SignIn onSignedIn={()=>refresh()}/>;
 if(linking)return <LinkedSignIns account={account} call={call} onBack={()=>{setLinking(false);void refresh();}} onLinked={()=>{setMode('account');location.assign('/play/');}} reauthenticate={(requiredIdentity,done)=><SignIn requiredIdentity={requiredIdentity} onSignedIn={done}/>}/>;
 if(archive)return <ArchiveJournal voyage={archive} onBack={()=>setArchive(null)}/>;
 const day=value=>host.SpacetraderAccountBridge?.dayLabel?.(value)||'Day '+value,place=value=>host.SpacetraderAccountBridge?.placeLabel?.(value)||value;
 return <section className="captain-account-panel" aria-labelledby="captain-account-title"><div className="captain-account-brand"><img src="/favicon.svg" alt="" width="28" height="28"/><span>Spacetrader</span></div><h2 id="captain-account-title">Saved voyages</h2>
  {phase==='checking'&&<p role="status">Checking your account…</p>}
  {phase==='unavailable'&&<p>Account saves are not available yet. Your voyage still saves on this device.</p>}
  {phase==='error'&&<button onClick={()=>void refresh()}>Retry connection</button>}
  {phase==='account'&&<><p className="captain-account-identity">{account.label}</p>
   {recoveries.map(r=><article className="captain-voyage" key={r.key}><h3>Action needs review</h3><p>{r.batch?`${r.batch.events.length} pending actions remain on this device. They could not replace newer progress from another device.`:`An interrupted ${r.body.action.type.replaceAll('-',' ')} action could not replace newer progress saved on another device.`} Your account keeps the latest confirmed voyage.</p><button disabled={busy} onClick={()=>void run(async()=>{const blob=new Blob([JSON.stringify(r)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='spacetrader-pending-action.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);})}>Download pending actions</button><button disabled={busy} onClick={()=>void run(async()=>{await saveOutbox.clear(account.account,r.voyage);if(r.batch)location.assign('/play/');else await refresh();})}>Keep latest account progress</button></article>)}
   {account.linkedLogins&&<button disabled={busy} className="captain-account-secondary" onClick={()=>void run(async()=>{if(host.SpacetraderAccountBridge&&!host.SpacetraderAccountBridge.canSwitch())throw Error('Finish the current encounter before linking sign-ins.');await host.SpacetraderAccountBridge?.settled();setLinking(true);})}>Email &amp; Ethereum sign-ins</button>}
   <div className="captain-voyage-list" aria-label="Account voyages">{library?.voyages.length?library.voyages.map(v=><article className="captain-voyage" key={v.id} aria-label={'Voyage: '+v.name}>
    <h3>{v.name}</h3><p>{day(v.day)} · {place(v.location)}</p><p className="captain-account-note">{v.sequence.toLocaleString()} actions{library?.singleActiveVoyage?v.readOnly?' · Archived · read-only':' · Active voyage':cloudActive&&getPin(account.account)===v.id?' · Current voyage':''}</p>
    {v.readOnly?<button disabled={busy} onClick={()=>setArchive(v)}>View archived journal</button>:<button disabled={busy} onClick={()=>void run(()=>chooseVoyage(v.id))}>Load voyage</button>}
   </article>):<p>No account voyages yet. Start a new charter or transfer the voyage on this device.</p>}</div>
   {library?.scoreArchives&&Boolean(library.scores?.length)&&<section aria-label="Finished voyage high scores"><h3>High scores</h3><ol className="captain-score-list">{library.scores.map(score=><li key={score.id}><strong>{score.name}</strong><span>Final net worth · {score.netWorth.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})} cr</span></li>)}</ol></section>}
   {library?.next&&<button className="captain-account-secondary" disabled={busy} onClick={()=>void run(more)}>{library.scoreArchives?'More scores':'More voyages'}</button>}
   {restart?<section className="captain-voyage" aria-label="Confirm restart"><h3>Restart this captain’s voyage?</h3><p>{library?.scoreArchives?'Only the current voyage’s final net worth will be kept as a high score. Its saved game and journal will be deleted. A new voyage will use the same captain ID.':'The current voyage will become a read-only archive. Its journal stays available. One new active voyage will use the same captain ID.'}</p><button disabled={busy} onClick={()=>void run(()=>newVoyage(restart))}>{library?.scoreArchives?'Finish and restart':'Archive and restart'}</button><button disabled={busy} onClick={()=>setRestart(null)}>Keep current voyage</button></section>:<button disabled={busy} onClick={()=>{if(library?.singleActiveVoyage&&library.selected)setRestart({id:library.selected,revision:library.selectedRevision});else void run(()=>newVoyage());}}>{library?.singleActiveVoyage&&library.selected?'Restart voyage…':'New account voyage'}</button>}
   {device?.profile.created&&(!library?.singleActiveVoyage||!library.selected)&&<button disabled={busy} className="captain-account-secondary" onClick={()=>void run(()=>transfer(setProgress))}>Transfer device voyage &amp; history</button>}
   {progress&&<p role="status">{progress}</p>}
   <p className="captain-account-note">{library?.scoreArchives?'Only the active voyage keeps its saved game and journal. Finished voyages keep their final net worth.':library?.singleActiveVoyage?'One active voyage belongs to this captain ID. Restarting keeps earlier voyages and their journals as read-only archives.':'Each voyage keeps its latest progress, journal and complete action history. Starting another voyage preserves the earlier ones.'}</p>
   <button disabled={busy} className="captain-account-secondary" onClick={()=>void run(async()=>{await host.SpacetraderAccountBridge?.settled();await call('/api/auth/logout',{});setMode('device');location.assign('/play/');})}>Sign out &amp; return to device voyage</button>
  </>}
  {error&&<p role="alert">{error}</p>}
 </section>;
}
function open(){
 if(!dialog){dialog=document.createElement('dialog');dialog.id='captain-account-dialog';dialog.className='spacetrader-account';dialog.setAttribute('aria-label','Account & saves');dialog.innerHTML='<button type="button" class="captain-account-close" aria-label="Back to game">Back to game</button><div data-account-root></div>';document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{reactRoot?.unmount();reactRoot=null;});}
 if(!reactRoot){reactRoot=createRoot(dialog.querySelector('[data-account-root]'));reactRoot.render(<Account/>);}
 if(!dialog.open)dialog.showModal();else host.dispatchEvent(new Event('spacetrader-account-refresh'));
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
  const inTransit=()=>Boolean(host.SpacetraderAccountBridge?.inTransit());
  const cloudFetch=createBatchTransport({fallback:legacy,fetch:send,owner,voyage,outbox:saveOutbox,deferStationActions:true,inTransit,receipt:(meta,after,before)=>host.SpacetraderJournalFeed.prepare(meta,JSON.parse(after),JSON.parse(before),host.SpacetraderAccountBridge.journalContext()),isHidden:()=>document.hidden,onConflict:()=>{setTimeout(open,0);},onStatus:()=>{host.dispatchEvent(new Event('spacetrader-sync-status'));}});cloudSync=cloudFetch;
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
host.SpacetraderAccount={open,newVoyage,consumeNewIntent,isCloud:()=>cloudActive,singleActive:()=>Boolean(account?.singleActiveVoyage),useDevice:()=>setMode('device'),sync:()=>cloudSync?.flush(),syncStatus:()=>cloudSync?.status(),saveStatus:()=>{const s=cloudSync?.status();return s?.conflict?'Saved on device · sync needs review':s?.unsaved?'Unsaved station progress · '+s.unsaved+' actions':s?.pending?s.syncing?'Saving voyage…':s.error?'Saved on device · sync delayed':'Saved on device · awaiting travel save':'Account progress · synced';}};
const deviceHealth=host.spacetraderSaveHealthHTML;
host.spacetraderSaveHealthHTML=()=>cloudActive?'<details class="browser-save-health"><summary>Account save storage</summary><p>Station actions save together during travel. Saving starts after you confirm departure and the travel animation appears. Closing before departure loses unsaved station actions. Completed saves retain each action in your journal.</p><button type="button" data-spacetrader-account>Account &amp; saves</button></details>':deviceHealth?.()||'';
