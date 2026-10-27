import React,{useState,useEffect}from'react';
import{createSiweMessage}from'viem/siwe';
import{LoginPanel,EmailSignIn,EthereumSignIn}from'./shared/login/LoginPanel.jsx';
export function LinkedSignIns({account,call,onBack,onLinked,reauthenticate}){
 const[info,setInfo]=useState(null),[email,setEmail]=useState(''),[code,setCode]=useState(''),[proof,setProof]=useState(null),[review,setReview]=useState(null),[choice,setChoice]=useState('current'),[confirmed,setConfirmed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[reauth,setReauth]=useState(false),[canReview,setCanReview]=useState(false);
 const source=account.label;
 async function load(){const value=await call('/api/account/link/status',undefined,true);setInfo(value);setReauth(!value.fresh);}
 useEffect(()=>{void load().catch(e=>setError(e.message));},[]);
 async function run(job){if(busy)return;setBusy(true);setError('');try{await job();}catch(e){if(e.status===428&&!review)setReauth(true);else if(e.code==='link_conflict'){setReview(null);setConfirmed(false);}else if(e.code==='link_proof_required'){setReview(null);setProof(null);setCanReview(false);}setError(e.message);}finally{setBusy(false);}}
 function reviewed(value){if(value.alreadyLinked){onLinked();return;}setCanReview(true);setReview(value);setChoice('current');setConfirmed(false);}
 async function wallet(){
  if(!window.ethereum?.request)throw Error('Open this page in your Ethereum wallet’s browser to add wallet sign-in.');
  const timed=p=>Promise.race([p,new Promise((_,reject)=>setTimeout(()=>reject(Error('The wallet did not respond. Try again when ready.')),60000))]);
  const addresses=await timed(window.ethereum.request({method:'eth_requestAccounts'}));if(!addresses?.[0])throw Error('Choose an Ethereum account.');
  const value=await call('/api/account/link/start',{identity:addresses[0]},true);setProof(value);
  const message=createSiweMessage({address:addresses[0],chainId:1,domain:value.domain,uri:value.uri,nonce:value.nonce,version:'1',issuedAt:new Date(),statement:value.statement});
  const signature=await timed(window.ethereum.request({method:'personal_sign',params:['0x'+Array.from(new TextEncoder().encode(message),v=>v.toString(16).padStart(2,'0')).join(''),addresses[0]]}));
  reviewed(await call('/api/account/link/verify',{challenge:value.challenge,message,signature},true));
 }
 if(reauth)return <><button onClick={onBack}>Back to account</button>{reauthenticate(source,async()=>{setReauth(false);setProof(null);setReview(null);await load();})}</>;
 if(!info)return <section className="captain-account-panel"><button onClick={onBack}>Back to account</button><h2>Linked sign-ins</h2>{error?<p role="alert">{error}</p>:<p role="status">Checking your sign-ins…</p>}</section>;
 if(!info.canLink)return <section className="captain-account-panel"><button onClick={onBack}>Back to account</button><h2>Linked sign-ins</h2>{info.identities.map(i=><p className="captain-linked-identity" key={i.kind}><strong>{i.kind==='email'?'Email':'Ethereum'}</strong>{i.identity}</p>)}<p>Both sign-ins open the same active voyage.</p></section>;
 if(review){
  const selected=review[choice],unchosen=choice==='current'?review.other:review.current,willDelete=Boolean(unchosen?.voyage),day=v=>window.SpacetraderAccountBridge?.dayLabel(v)||'Day '+v,place=v=>window.SpacetraderAccountBridge?.placeLabel(v)||v;
  return <section className="captain-account-panel"><button disabled={busy} onClick={onBack}>Cancel linking</button><h2>Choose the voyage to keep</h2><p>Both sign-ins have been verified. After linking, either sign-in will open the selected captain’s voyage.</p><fieldset className="captain-link-choices" disabled={busy}><legend>Keep this voyage</legend>{['current','other'].filter(k=>review[k]).map(k=>{const v=review[k];return <label className={'captain-voyage '+(choice===k?'selected':'')} key={k}><input type="radio" name="keep-voyage" checked={choice===k} onChange={()=>{setChoice(k);setConfirmed(false);}}/><span><strong>{v.name}</strong><small>{k==='current'?source:review.target}</small>{v.voyage?<small>{day(v.day)} · {place(v.location)} · {Number(v.sequence).toLocaleString()} actions</small>:<small>No saved voyage</small>}</span></label>;})}</fieldset>{!review.other&&<p>{review.target} will use your existing captain and voyage.</p>}
   <p>{willDelete?<>The unchosen active voyage, <strong>{unchosen.name}</strong>, and its journal will be permanently deleted.</>:'No existing voyage will be deleted.'} Older archived voyages stay readable. Other devices will need to sign in again.</p>
   <label className="captain-link-confirm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e=>setConfirmed(e.target.checked)}/><span>{willDelete?'Permanently delete the unchosen active voyage and its journal, and keep '+selected.name+'.':'Link these sign-ins to the selected captain.'}</span></label>
   {error&&<p role="alert">{error}</p>}<button disabled={busy||!confirmed} onClick={()=>void run(async()=>{await call('/api/account/link/commit',{challenge:proof.challenge,choice,confirmDelete:true},true);onLinked();})}>{busy?'Linking…':'Confirm and link sign-ins'}</button></section>;
 }
 if(canReview)return <section className="captain-account-panel"><button disabled={busy} onClick={onBack}>Cancel linking</button><h2>Review the latest voyages</h2><p>The saved progress changed. Review it again before choosing what to keep.</p>{error&&<p role="alert">{error}</p>}<button disabled={busy} onClick={()=>void run(async()=>reviewed(await call('/api/account/link/review',{challenge:proof.challenge},true)))}>Review latest voyages</button><button disabled={busy} onClick={()=>{setCanReview(false);setProof(null);setCode('');setError('');}}>Verify again</button></section>;
 const addEmail=!info.identities.some(i=>i.kind==='email');
 return <><button disabled={busy} onClick={onBack}>Back to account</button><LoginPanel product="Spacetrader" icon="/favicon.svg" title={addEmail?'Add email sign-in':'Add Ethereum sign-in'} description="Verify the other sign-in first. You’ll review both voyages before anything is linked or deleted."
 email={addEmail?<EmailSignIn email={email} onEmailChange={setEmail} challenge={proof?.challenge||''} code={code} onCodeChange={setCode} busy={busy} disabled={!account.emailEnabled} onReset={()=>{setProof(null);setCode('');setError('');}} onSubmit={e=>{e.preventDefault();void run(async()=>{if(proof)reviewed(await call('/api/account/link/verify',{challenge:proof.challenge,code},true));else setProof(await call('/api/account/link/start',{identity:email},true));});}}/>:null}
 wallet={!addEmail?<EthereumSignIn label="Verify Ethereum wallet" busy={busy} onClick={()=>void run(wallet)}/>:null}
 notice={error?<p role="alert">{error}</p>:addEmail&&!account.emailEnabled?<p>Email verification is temporarily unavailable.</p>:null} footer={<p>This links Spacetrader saves. Permissions in other Bittrees apps stay separate.</p>}/></>;
}
