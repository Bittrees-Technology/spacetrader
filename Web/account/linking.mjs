import {randomBytes,randomInt} from 'node:crypto';
import {parseSiweMessage} from 'viem/siwe';
import {identity,digest,equal,readCookie,cookie} from './shared/sso/client.mjs';
import {fail} from './storage.mjs';
const token=()=>randomBytes(32).toString('hex');
export function createLinking({sql,auth,origin,sendMail,verifyWallet,accountLimit,now=Date.now}){
 const statement=account=>'Link this Ethereum wallet to Spacetrader account '+account+'. No transaction or other-app permissions are authorized.';
 const hash=req=>digest(readCookie(req,'captain-session',origin));
 const fresh=session=>{if(!session||session.authTime<now()-600000)throw fail('Verify your current sign-in again before linking another identity.',428);};
 async function own(req){const session=await auth.current(req);if(!session)throw fail('Sign in to link another identity.',401);if(req.headers.get('x-spacetrader-account')!==session.account)throw fail('The account changed. Reopen Account & saves.',401);return session;}
 async function handle(req,action,body){
  if(req.method==='POST'){await auth.limit('auth-global',600);await auth.limit('link-ip:'+(req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown'),60);}
  if(action==='commit'&&req.method==='POST'){
   if(!/^[a-f0-9]{64}$/.test(body.challenge||'')||!['current','other'].includes(body.choice)||body.confirmDelete!==true)throw fail('Review the voyages and confirm the choice before linking.',428);
   // A lost successful response may be replayed only by the original session,
   // exact proof challenge and same choice. The SQL receipt survives revocation.
   const [bound]=await sql`SELECT account_id FROM spacetrader_link_challenges WHERE hash=${digest(body.challenge)} AND session_hash=${hash(req)} AND expires_at>now()`;
   if(!bound||req.headers.get('x-spacetrader-account')!==bound.account_id)throw fail('The linking request does not belong to this sign-in.',401);
   const [row]=await sql`SELECT spacetrader_link_commit(${digest(body.challenge)},${hash(req)},${body.choice},${true},${accountLimit}) AS result`;
   const result=row.result,session=await auth.establish(result.identity,Number(result.authTime));
   return {body:{linked:true,account:result.account,captainId:result.captainId,voyage:result.voyage,deletedVoyage:result.deletedVoyage},cookies:[...session.cookies,cookie('captain-sso-published','',0,origin)]};
  }
  const session=await own(req);
  if(action==='status'&&req.method==='GET'){
   const rows=await sql`SELECT identity,kind FROM spacetrader_identities WHERE account_id=${session.account} ORDER BY kind`;
   return {body:{identities:rows,canLink:rows.length<2,fresh:session.authTime>=now()-600000}};
  }
  if(req.method!=='POST')throw fail('Method not allowed.',405);
  fresh(session);await auth.limit('link:'+session.account,20);
  await sql`DELETE FROM spacetrader_link_challenges WHERE hash IN(SELECT hash FROM spacetrader_link_challenges WHERE expires_at<now() LIMIT 100)`;
  if(action==='start'){
   const target=identity(body.identity);if(target===session.identity)throw fail('Choose the other sign-in method.');
   const kind=target.includes('@')?'email':'wallet';
   const same=await sql`SELECT identity FROM spacetrader_identities WHERE account_id=${session.account} AND kind=${kind}`;
   if(same.length)throw fail('This account already has that sign-in method linked.',409);
   await auth.limit('link-start:'+session.account,5);
   const challenge=token(),nonce=token(),code=kind==='email'?String(randomInt(100000000)).padStart(8,'0'):null;
   if(code)await auth.emailAllowance(target,req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown');
   await sql`INSERT INTO spacetrader_link_challenges(hash,session_hash,account_id,source_identity,target,nonce,code_hash,source_authenticated_at,expires_at) VALUES(${digest(challenge)},${hash(req)},${session.account},${session.identity},${target},${nonce},${code?digest(challenge+':'+code):null},to_timestamp(${session.authTime/1000}),now()+interval '5 minutes') ON CONFLICT(session_hash,target) DO UPDATE SET hash=excluded.hash,nonce=excluded.nonce,code_hash=excluded.code_hash,source_authenticated_at=excluded.source_authenticated_at,expires_at=excluded.expires_at,attempts=0,verified_at=NULL,preview=NULL,result=NULL`;
   if(code)try{await sendMail(target,code,'link');}catch{await sql`DELETE FROM spacetrader_link_challenges WHERE hash=${digest(challenge)}`;throw fail('The linking code could not be sent.',503);}
   return {body:{challenge,identity:target,nonce,domain:new URL(origin).host,uri:origin,statement:statement(session.account)}};
  }
  if(!/^[a-f0-9]{64}$/.test(body.challenge||''))throw fail('Request a new linking proof.',401);
  if(action==='verify'){
   const [c]=await sql`UPDATE spacetrader_link_challenges SET attempts=attempts+1 WHERE hash=${digest(body.challenge)} AND session_hash=${hash(req)} AND account_id=${session.account} AND expires_at>now() AND attempts<5 AND verified_at IS NULL AND result IS NULL RETURNING *`;
   if(!c)throw fail('The linking proof expired or was already used.',401);
   if(c.code_hash){if(!/^\d{8}$/.test(body.code||'')||!equal(c.code_hash,digest(body.challenge+':'+body.code)))throw fail('Invalid linking code.',401);}
   else{
    if(typeof body.message!=='string'||body.message.length>3000||typeof body.signature!=='string'||body.signature.length>12000)throw fail('Request a new wallet linking proof.',401);
    let p;try{p=parseSiweMessage(body.message);}catch{throw fail('Invalid wallet linking proof.',401);}
    if(p.nonce!==c.nonce||p.domain!==new URL(origin).host||p.uri!==origin||p.version!=='1'||p.chainId!==1||p.statement!==statement(session.account)||identity(p.address)!==c.target||!p.issuedAt||!Number.isFinite(p.issuedAt.getTime())||now()-p.issuedAt.getTime() < -30000||now()-p.issuedAt.getTime()>300000||(p.expirationTime&&(!Number.isFinite(p.expirationTime.getTime())||p.expirationTime.getTime()<=now()))||!await verifyWallet({message:body.message,signature:body.signature,domain:new URL(origin).host,nonce:c.nonce}))throw fail('Wallet linking proof rejected.',401);
   }
   const [verified]=await sql`UPDATE spacetrader_link_challenges SET verified_at=now() WHERE hash=${digest(body.challenge)} AND session_hash=${hash(req)} AND verified_at IS NULL AND expires_at>now() RETURNING hash`;
   if(!verified)throw fail('The linking proof was already used.',401);
  }else if(action!=='review')throw fail('Not found.',404);
  const [review]=await sql`SELECT spacetrader_link_review(${digest(body.challenge)},${hash(req)}) AS result`;
  return {body:review.result};
 }
 async function readOwner(owner,voyage){
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(voyage||''))throw fail('Choose an archived voyage first.',428);
  const [row]=await sql`SELECT v.account_id FROM spacetrader_voyages v JOIN spacetrader_accounts a ON a.id=v.account_id WHERE v.id=${voyage}::uuid AND(a.id=${owner}::uuid OR a.merged_into=${owner}::uuid)`;
  if(!row)throw fail('That archived voyage is unavailable.',404);return row.account_id;
 }
 return {handle,readOwner};
}
