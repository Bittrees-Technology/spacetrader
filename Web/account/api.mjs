import {neon} from '@neondatabase/serverless';
import {createPublicClient,http} from 'viem';
import {mainnet} from 'viem/chains';
import engine from '../../Browser/engine.js';
import {createAuth} from './auth.mjs';
import {createStorage,fail} from './storage.mjs';
import {digest} from './codec.mjs';
import {splitState} from './state-parts.mjs';
import {createSsoClient,nodeRequest,nodeResponse,json,identity} from './shared/sso/client.mjs';
import {createBatchStorage} from './batch-store.mjs';
import {createLinking} from './linking.mjs';

export function createApi({env=process.env,sql,parse=engine.parse,verifyWallet,sendMail}={}){
 const origin=env.APP_ORIGIN||'https://captain.bittrees.org';
 const configured=env.SPACETRADER_ACCOUNTS_ENABLED==='1'&&Boolean(env.SPACETRADER_DATABASE_URL||sql);
 const accountLimit=Number(env.SPACETRADER_ACCOUNT_STORAGE_BYTES),totalLimit=Number(env.SPACETRADER_TOTAL_STORAGE_BYTES);
 const identitySchema=env.SPACETRADER_IDENTITY_SCHEMA==='1';
 const singleActive=identitySchema||env.SPACETRADER_SINGLE_ACTIVE_VOYAGE==='1';
 const linkedLogins=identitySchema&&env.SPACETRADER_LINKED_LOGINS==='1';
 if(configured&&!sql)sql=(strings,...values)=>neon(env.SPACETRADER_DATABASE_URL,{fetchOptions:{signal:AbortSignal.timeout(12000)}})(strings,...values);
 if(!verifyWallet)verifyWallet=parameters=>createPublicClient({chain:mainnet,transport:http(env.ETH_RPC_URL||'https://ethereum-rpc.publicnode.com',{timeout:10000,retryCount:0})}).verifySiweMessage(parameters);
 const emailLimit=Number(env.SPACETRADER_EMAIL_DAILY_LIMIT||0);
 const monthlyLimit=Number(env.SPACETRADER_EMAIL_MONTHLY_LIMIT||0);
 if(!sendMail&&env.RESEND_API_KEY&&env.SPACETRADER_MAIL_FROM)sendMail=async(email,code,purpose)=>{
  const result=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(10000),headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.SPACETRADER_MAIL_FROM,to:[email],subject:purpose==='link'?'Link your Spacetrader sign-in':'Your Spacetrader sign-in code',text:purpose==='link'?`Your Spacetrader linking code is ${code}. It expires in five minutes. Use it only in the linking screen you opened. Linking can permanently delete an unchosen voyage after your explicit confirmation. It does not grant permissions in other apps.`:`Your Spacetrader verification code is ${code}. It expires in 10 minutes and works once. If you did not request this code, you can ignore this email.`})});
  if(!result.ok)throw Error('Email unavailable');
 };
 const auth=configured?createAuth({sql,origin,sendMail,verifyWallet,emailDailyLimit:emailLimit,emailMonthlyLimit:monthlyLimit,maxAccounts:Number(env.SPACETRADER_MAX_ACCOUNTS||10000),captainScope:singleActive,linkedLogins:identitySchema}):null;
 const saves=configured?createStorage(sql,{parse,accountLimit,totalLimit,compact:true,efficient:env.SPACETRADER_EFFICIENT_SAVES==='1',archiveReads:env.SPACETRADER_EFFICIENT_READS==='1',singleActive,linkedLogins:identitySchema}):null;
 const batched=configured&&env.SPACETRADER_BATCH_SAVES==='1'&&env.SPACETRADER_EFFICIENT_SAVES==='1';
 const linking=identitySchema?createLinking({sql,auth,origin,sendMail,verifyWallet,accountLimit}):null;
 const batchSaves=batched?createBatchStorage(sql,{parse,accountLimit,totalLimit}):null;
 // A head plus three near-limit checkpoints exceeds function response limits.
 // Return slot hashes here; the browser retrieves changed slots individually.
 const saveJson=(req,value,status=200)=>{
  let result=value.slots?{...value,slots:{},checkpointDigests:Object.fromEntries(Object.entries(value.slots).map(([key,raw])=>[key,digest(raw)]))}:{...value};
  result.componentStorage=env.SPACETRADER_EFFICIENT_SAVES==='1';
  if(batched){result.batchSaves=true;result.checkpointLimit=0;}
  if(singleActive)result.singleActiveVoyage=true;
  if(req.headers.get('x-spacetrader-wire')==='parts-v1'&&typeof result.raw==='string'){
   const raw=result.raw;delete result.raw;result.rawDigest=digest(raw);
   if(req.method==='POST'&&new URL(req.url).pathname==='/api/voyage'&&status===200)result.accepted=true;
   else{const {core,component}=splitState(raw),hash=component===null?null:digest(component);result.state={core,component:hash,...(hash&&hash!==req.headers.get('x-spacetrader-component')?{part:component}:{})};}
  }
  return json(result,status);
 };
 const shared=createSsoClient({clientId:'spacetrader',origin,issuer:env.BITTREES_SSO_ISSUER||'https://roles.bittrees.org',secret:env.BITTREES_SSO_CLIENT_SECRET,enabled:configured&&env.BITTREES_SSO_ENABLED==='1',cookiePrefix:'captain-sso',adapter:auth||{}});
 return async function handle(req){
  const url=new URL(req.url),path=url.pathname;
  try{
   if(url.origin!==origin)throw fail('Unexpected application origin.',403);
   if(!/^\/api\/(?:sso\/(?:status|start|callback|publish|profile)|auth\/(?:email|verify-email|nonce|wallet|logout)|account\/(?:status|link\/(?:status|start|verify|review|commit))|voyage(?:\/batch)?|voyages(?:\/(?:new|select))?|checkpoint|ledger(?:\/[1-9]\d*)?|backups|import\/(?:start|batch|checkpoint|finish))$/.test(path))throw fail('Not found.',404);
   if(path.startsWith('/api/sso/'))return shared(req);
   if(path==='/api/account/status'){
    if(req.method!=='GET')throw fail('Method not allowed.',405);
    if(!configured)return json({configured:false,signedIn:false});
    const session=await auth.current(req);
    return json({configured:true,signedIn:Boolean(session),emailEnabled:Boolean(sendMail)&&emailLimit>0&&monthlyLimit>0,...(session?{account:session.account,label:session.identity,...(singleActive?{captainId:session.captainId,activeVoyage:session.activeVoyage}:{} )}:{}),singleActiveVoyage:singleActive,linkedLogins,sharedEnabled:env.BITTREES_SSO_ENABLED==='1'});
   }
   if(!configured)throw fail('Account saves are not configured yet. Your device saves are unchanged.',503);
   if(!['GET','POST'].includes(req.method))throw fail('Method not allowed.',405);
   if(req.method==='POST'&&(req.headers.get('origin')!==origin||req.headers.get('sec-fetch-site')==='cross-site'))throw fail('Request origin rejected.',403);
   let body={};if(req.method==='POST'){
    if(Number(req.headers.get('content-length')||0)>4_200_000)throw fail('Request too large.',413);
    const text=await req.text();if(Buffer.byteLength(text)>4_200_000)throw fail('Request too large.',413);
    try{body=JSON.parse(text);}catch{throw fail('Invalid request.');}
    if(!body||typeof body!=='object'||Array.isArray(body))throw fail('Invalid request.');
   }
   if(path.startsWith('/api/account/link/')){
    if(!linkedLogins)throw fail('Linked sign-ins are not enabled yet.',503);
    if(req.method==='POST'&&req.headers.get('x-spacetrader')!=='shared-save-v1')throw fail('Linking request rejected.',403);
    if(Buffer.byteLength(JSON.stringify(body))>20000)throw fail('Linking request too large.',413);
    const result=await linking.handle(req,path.split('/').pop(),body),response=json(result.body);
    for(const value of result.cookies||[])response.headers.append('Set-Cookie',value);return response;
   }
   if(path.startsWith('/api/auth/')){
    const result=await auth.handle(req,path.split('/').pop(),body),response=json(result.body);
    for(const value of result.cookies||[])response.headers.append('Set-Cookie',value);return response;
   }
   const session=await auth.current(req);if(!session)throw fail('Sign in to reconnect to your account voyage.',401);
   if(req.headers.get('x-spacetrader-account')!==session.account)throw fail('The signed-in account changed. Reopen Account & saves before continuing.',401);
   if(req.method==='POST'&&req.headers.get('x-spacetrader')!=='shared-save-v1')throw fail('Save request rejected.',403);
   const owner=session.account;
   const voyageJson=value=>saveJson(req,{...value,...(singleActive?{captainId:session.captainId}:{} )});
   const requested=req.headers.get('x-spacetrader-voyage');
   if(singleActive&&requested&&requested!==session.activeVoyage&&(req.method==='POST'||path==='/api/voyage'))throw fail('This voyage is archived. Reload to continue your active captain; archived journals remain available.',409);
   if(singleActive&&path.startsWith('/api/import/')&&session.activeVoyage&&!(path==='/api/import/finish'&&body.id===session.activeVoyage))throw fail('This account already has an active voyage. Your device voyage remains separate.',409);
   if(path==='/api/voyage/batch'){
    if(req.method!=='POST')throw fail('Method not allowed.',405);
    if(!batchSaves)throw fail('Background synchronization is not available yet. Your pending actions remain on this device.',428);
    const result=await batchSaves.append(owner,req.headers.get('x-spacetrader-voyage'),body);
    return json({...result,batchSaves:true,checkpointLimit:0,componentStorage:true,...(singleActive?{singleActiveVoyage:true,captainId:session.captainId}:{} )});
   }
   if(path==='/api/voyages'&&req.method==='GET')return json(await saves.library(owner,url.searchParams.get('after')));
   if(path==='/api/voyages/new'&&req.method==='POST')return json(await saves.createVoyage(owner,{operation:body.operation,version:body.version,raw:JSON.stringify(engine.fresh()),restartFrom:body.restartFrom,revision:body.revision}));
   if(path==='/api/voyages/select'&&req.method==='POST')return json(await saves.choose(owner,body));
   if(path==='/api/import/start'&&req.method==='POST')return json(await saves.startImport(owner,body));
   if(path==='/api/import/batch'&&req.method==='POST')return json(await saves.importBatch(owner,body));
   if(path==='/api/import/checkpoint'&&req.method==='POST')return voyageJson(await saves.importCheckpoint(owner,body));
   if(path==='/api/import/finish'&&req.method==='POST')return voyageJson(await saves.finishImport(owner,body));
   if(req.headers.get('x-spacetrader-storage')!=='compact-v1')throw fail('Reload the game to use the smaller save format. Existing progress is preserved.',428);
   const header=req.headers.get('x-spacetrader-voyage');
   if(path==='/api/voyage'&&req.method==='GET'&&url.searchParams.has('since')){
    if(header&&!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(header))throw fail('Choose a saved voyage before continuing.',428);
    const current=await saves.position(owner,header);
    if(header&&!current.voyage)throw fail('That voyage is unavailable.',404);
    if(url.searchParams.get('since')===current.revision)return json({...current,unchanged:true,...(batched?{batchSaves:true,checkpointLimit:0}:{})});
   }
   if(batched&&path==='/api/voyage'&&req.method==='GET'){
    if(header&&!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(header))throw fail('Choose a saved voyage before continuing.',428);
    return voyageJson(await batchSaves.snapshot(owner,header));
   }
   const readOwner=linking&&req.method==='GET'&&header&&header!==session.activeVoyage?await linking.readOwner(owner,header):owner;
   const target=path==='/api/voyage'&&req.method==='GET'&&!header?null:await saves.selected(readOwner,header);
   if(body.state!==undefined){body.raw=await saves.resolveWire(owner,target,body.state);if(body.rawHash!==digest(body.raw))throw fail('Saved voyage integrity check failed.');}
   if(path==='/api/voyage'){
    if(req.method==='POST'){
     if(batched&&['restore','new-voyage'].includes(body.action?.type))throw fail('Account voyages keep their latest progress. Start another voyage from Saved voyages.');
     return voyageJson(await saves.append(owner,body,target));
    }
    return voyageJson(await saves.snapshot(owner,target));
   }
   if(path==='/api/checkpoint'&&req.method==='POST'){
    if(batched&&body.raw!==null)throw fail('Account voyages use automatic saving and keep their latest progress.');
    return voyageJson(await saves.checkpoint(owner,body,target));
   }
   if(path==='/api/checkpoint'&&req.method==='GET')return voyageJson(await saves.readCheckpoint(readOwner,url.searchParams.get('slot'),target));
   if(path==='/api/ledger'&&req.method==='GET')return json({entries:await saves.history(readOwner,url.searchParams.has('before')?Number(url.searchParams.get('before')):undefined,target)});
   if(/^\/api\/ledger\/[1-9]\d*$/.test(path)&&req.method==='GET')return json(await saves.recorded(readOwner,Number(path.split('/').pop()),target));
   if(path==='/api/backups'&&req.method==='GET')return json({backups:[]});
   throw fail('Not found.',404);
  }catch(error){
   if(/link_conflict/.test(String(error.message)))return json({error:'A voyage changed after review. Review both latest voyages again; nothing was deleted.',code:'link_conflict'},409);
   if(/link_proof_required/.test(String(error.message)))return json({error:'Verify both sign-ins again before linking.',code:'link_proof_required'},401);
   if(/identity_already_linked/.test(String(error.message)))return json({error:'That sign-in is already linked to another account. No progress was changed.'},409);
   if(/link_confirmation_required/.test(String(error.message)))return json({error:'Choose the voyage to keep and explicitly confirm before linking.'},428);
   if(/link_storage_limit/.test(String(error.message)))return json({error:'Combined saved history exceeds this account’s storage limit. Nothing was linked or deleted.'},507);
   if(error.snapshot)return saveJson(req,{...error.snapshot,error:error.message},409);
   if(/voyage_archived|restart_conflict|active_voyage_exists/.test(String(error.message)))return json({error:'Your active voyage changed or this voyage is archived. Reload before continuing; archived progress has been preserved.',code:'active_voyage_changed'},409);
   const quota=String(error.message).includes('storage_limit');
   return json({error:quota?'Account save storage is full. Existing progress is preserved. Try again later or return to your separate device voyage.':error.status?error.message:'Account saves are temporarily unavailable. Your existing progress is preserved.'},quota?507:error.status||503);
  }
 };
}
let api;
export default async function handler(req,res){
 try{const origin=process.env.APP_ORIGIN||'https://captain.bittrees.org';if(req.headers.host?.toLowerCase()!==new URL(origin).host.toLowerCase())return nodeResponse(json({error:'Unexpected application host'},403),res);api||=createApi();return nodeResponse(await api(await nodeRequest(req,origin)),res);}
 catch{return nodeResponse(json({error:'Account saves are temporarily unavailable. Device saves are preserved.'},503),res);}
}
