import {randomBytes,randomInt} from 'node:crypto';
import {parseSiweMessage} from 'viem/siwe';
import {identity,cookie,readCookie,digest,equal,suppressSso} from './shared/sso/client.mjs';
import {fail} from './storage.mjs';

const token=()=>randomBytes(32).toString('hex');
export function createAuth({sql,origin,sendMail,verifyWallet,emailDailyLimit=0,emailMonthlyLimit=0,maxAccounts=10000,captainScope=false,linkedLogins=false,now=Date.now}){
 async function limit(key,maximum,period=600000){
  const bucket=Math.floor(now()/period),hash=digest(key+'|'+bucket);
  const [record]=await sql`INSERT INTO spacetrader_rate_limits(key,count,expires_at) VALUES(${hash},1,to_timestamp(${(now()+period*2)/1000})) ON CONFLICT(key) DO UPDATE SET count=spacetrader_rate_limits.count+1 RETURNING count`;
  if(record.count>maximum)throw fail('Please wait before trying again.',429);
 }
 async function establish(value,authTime=now()){
  const id=identity(value),key=token();
  if(!Number.isFinite(authTime)||authTime>now()+30000||authTime<now()-604800000)throw fail('Sign in again to continue.',401);
  await sql`SELECT spacetrader_account_session(${id},${digest(key)},${authTime},${maxAccounts})`;
  return {key,cookies:[cookie('captain-session',key,Math.max(0,Math.floor((authTime+604800000-now())/1000)),origin)]};
 }
 async function current(req){
  const key=readCookie(req,'captain-session',origin);if(!/^[a-f0-9]{64}$/.test(key))return null;
  const [row]=linkedLogins?await sql`SELECT a.id,s.login_identity AS identity,s.authenticated_at,a.active_voyage,c.id AS captain_id FROM spacetrader_sessions s JOIN spacetrader_accounts a ON a.id=s.account_id JOIN spacetrader_captains c ON c.account_id=a.id WHERE s.hash=${digest(key)} AND s.expires_at>now() AND a.merged_into IS NULL`:captainScope?await sql`SELECT a.id,a.identity,s.authenticated_at,a.active_voyage,c.id AS captain_id FROM spacetrader_sessions s JOIN spacetrader_accounts a ON a.id=s.account_id JOIN spacetrader_captains c ON c.account_id=a.id WHERE s.hash=${digest(key)} AND s.expires_at>now()`:await sql`SELECT a.id,a.identity,s.authenticated_at FROM spacetrader_sessions s JOIN spacetrader_accounts a ON a.id=s.account_id WHERE s.hash=${digest(key)} AND s.expires_at>now()`;
  return row?{key,account:row.id,identity:row.identity,authTime:new Date(row.authenticated_at).getTime(),...(captainScope?{captainId:row.captain_id,activeVoyage:row.active_voyage}:{} )}:null;
 }
 async function emailAllowance(email,ip){
  if(!sendMail||!Number.isSafeInteger(emailDailyLimit)||emailDailyLimit<1||!Number.isSafeInteger(emailMonthlyLimit)||emailMonthlyLimit<1)throw fail('Email verification is unavailable.',503);
   await limit('email:'+ip,5);await limit('email-account:'+email,5);await limit('email-global-day',emailDailyLimit,86400000);
   const date=new Date(now()),month=digest('email-month|'+date.getUTCFullYear()+'-'+date.getUTCMonth()),expires=Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,2);
   const [monthly]=await sql`INSERT INTO spacetrader_rate_limits(key,count,expires_at) VALUES(${month},1,to_timestamp(${expires/1000})) ON CONFLICT(key) DO UPDATE SET count=spacetrader_rate_limits.count+1 RETURNING count`;
   if(monthly.count>emailMonthlyLimit)throw fail('Email sign-in has reached its current sending allowance. Try Ethereum or return later.',429);
 }
 async function handle(req,action,body){
  if(req.method!=='POST')throw fail('Method not allowed.',405);
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown';
  await limit('auth-global',600);await limit('auth:'+ip,60);
  await sql`DELETE FROM spacetrader_sessions WHERE hash IN(SELECT hash FROM spacetrader_sessions WHERE expires_at<now() LIMIT 100)`;
  await sql`DELETE FROM spacetrader_challenges WHERE hash IN(SELECT hash FROM spacetrader_challenges WHERE expires_at<now() LIMIT 100)`;
  await sql`DELETE FROM spacetrader_rate_limits WHERE key IN(SELECT key FROM spacetrader_rate_limits WHERE expires_at<now() LIMIT 100)`;
  if(action==='email'){
   if(!sendMail||!Number.isSafeInteger(emailDailyLimit)||emailDailyLimit<1||!Number.isSafeInteger(emailMonthlyLimit)||emailMonthlyLimit<1)throw fail('Email sign-in is not available yet.',503);
   const email=identity(body.email);if(!email.includes('@'))throw fail('Enter an email address.');
   await emailAllowance(email,ip);
   const challenge=token(),code=String(randomInt(100000000)).padStart(8,'0');
   await sql`DELETE FROM spacetrader_challenges WHERE kind='email' AND identity=${email}`;
   await sql`INSERT INTO spacetrader_challenges(hash,kind,identity,code_hash,expires_at) VALUES(${digest(challenge)},'email',${email},${digest(challenge+':'+code)},now()+interval '10 minutes')`;
   try{await sendMail(email,code);}catch{await sql`DELETE FROM spacetrader_challenges WHERE hash=${digest(challenge)}`;throw fail('The code could not be sent. Please try again later.',503);}
   return {body:{challenge}};
  }
  if(action==='verify-email'){
   if(!/^[a-f0-9]{64}$/.test(body.challenge||'')||!/^\d{8}$/.test(body.code||''))throw fail('Invalid or expired code.',401);
   const [attempt]=await sql`UPDATE spacetrader_challenges SET attempts=attempts+1 WHERE hash=${digest(body.challenge)} AND kind='email' AND attempts<5 AND expires_at>now() RETURNING code_hash`;
   if(!attempt||!equal(attempt.code_hash,digest(body.challenge+':'+body.code)))throw fail('Invalid or expired code.',401);
   const [challenge]=await sql`DELETE FROM spacetrader_challenges WHERE hash=${digest(body.challenge)} AND code_hash=${digest(body.challenge+':'+body.code)} AND attempts<=5 AND expires_at>now() RETURNING identity`;
   if(!challenge)throw fail('Invalid or expired code.',401);
   return {body:{ok:true},...(await establish(challenge.identity))};
  }
  if(action==='nonce'){
   const nonce=token();await sql`INSERT INTO spacetrader_challenges(hash,kind,expires_at) VALUES(${digest(nonce)},'wallet',now()+interval '5 minutes')`;
   return {body:{nonce,domain:new URL(origin).host,uri:origin},cookies:[cookie('captain-nonce',nonce,300,origin)]};
  }
  if(action==='wallet'){
   const nonce=readCookie(req,'captain-nonce',origin),message=body.message;
   if(!nonce||typeof message!=='string'||message.length>3000||typeof body.signature!=='string'||body.signature.length>12000)throw fail('Request a new wallet challenge.',401);
   let parsed;try{parsed=parseSiweMessage(message);}catch{throw fail('Invalid wallet challenge.',401);}
   if(parsed.nonce!==nonce||parsed.domain!==new URL(origin).host||parsed.uri!==origin||parsed.version!=='1'||parsed.chainId!==1||!parsed.issuedAt||!Number.isFinite(parsed.issuedAt.getTime())||now()-parsed.issuedAt.getTime() < -30000||now()-parsed.issuedAt.getTime()>300000||(parsed.expirationTime&&(!Number.isFinite(parsed.expirationTime.getTime())||parsed.expirationTime.getTime()<=now())))throw fail('Invalid wallet challenge.',401);
   const [challenge]=await sql`SELECT hash FROM spacetrader_challenges WHERE hash=${digest(nonce)} AND kind='wallet' AND expires_at>now()`;
   if(!challenge||!await verifyWallet({message,signature:body.signature,domain:new URL(origin).host,nonce}))throw fail('Wallet signature rejected.',401);
   const [consumed]=await sql`DELETE FROM spacetrader_challenges WHERE hash=${digest(nonce)} AND kind='wallet' AND expires_at>now() RETURNING hash`;
   if(!consumed)throw fail('Wallet challenge has already been used.',401);
   const result=await establish(identity(parsed.address));return {body:{ok:true},...result,cookies:[...result.cookies,cookie('captain-nonce','',0,origin)]};
  }
  if(action==='logout'){
   const key=readCookie(req,'captain-session',origin);
   if(key&&linkedLogins){const session=await current(req);await sql`DELETE FROM spacetrader_link_challenges WHERE session_hash=${digest(key)} OR(result->>'account'=${session?.account||null})`;}
   if(key)await sql`DELETE FROM spacetrader_sessions WHERE hash=${digest(key)}`;
   return {body:{ok:true},cookies:[cookie('captain-session','',0,origin),cookie('captain-sso-skip','1',604800,origin),cookie('captain-sso-published','',0,origin)]};
  }
  throw fail('Not found.',404);
 }
 return {current,establish,handle,limit,emailAllowance};
}
