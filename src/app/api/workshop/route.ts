import {NextResponse} from 'next/server';
import {randomUUID} from 'crypto';
import {z} from 'zod';
import {db,ready,provider,sign,matches,token,confirm,bookingSignature,offerCookieName,readBookingOffer,serializeBookingOffer,workshopAmount,RazorpayRequestError} from '@/lib/workshop-server';
import {workshop} from '@/lib/workshop-config';
export const runtime='nodejs';
const schema=z.object({name:z.string().trim().min(2).max(80),email:z.string().trim().email().max(160).transform(v=>v.toLowerCase()),phone:z.string().regex(/^\+91[6-9]\d{9}$/),terms:z.literal(true),groupConsent:z.boolean(),source:z.string().max(200).default(''),website:z.literal('').default('')});
const reply=(body:object,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'Invalid request origin'},403);
 try{
  const raw=await req.text();if(raw.length>4000)return reply({error:'Request too large'},413);
  const body=JSON.parse(raw);
  if(!body||typeof body!=='object'||Array.isArray(body))return reply({error:'Invalid request body'},400);
  if(body.action==='status'){
   if(typeof body.order!=='string'||!/^order_[A-Za-z0-9]+$/.test(body.order)||typeof body.token!=='string'||!matches(body.token,token(body.order)))return reply({error:'Invalid confirmation link'},403);
   const {rows}=await db().query('SELECT status,group_consent,amount,currency FROM workshop_enrolments WHERE order_id=$1',[body.order]);
   if(!rows.length)return reply({error:'Booking not found'},404);
   return reply({status:rows[0].status,amount:Number(rows[0].amount),currency:rows[0].currency,groupUrl:rows[0].status==='paid'&&rows[0].group_consent?process.env.WORKSHOP_WHATSAPP_GROUP_URL||null:null});
  }
  if(body.action==='verify'){
   const {razorpay_order_id:order,razorpay_payment_id:payment,razorpay_signature:sig}=body;
   if(typeof order!=='string'||!/^order_[A-Za-z0-9]+$/.test(order)||typeof payment!=='string'||!/^pay_[A-Za-z0-9]+$/.test(payment)||typeof sig!=='string'||!process.env.RAZORPAY_KEY_SECRET||!matches(sig,sign(`${order}|${payment}`,process.env.RAZORPAY_KEY_SECRET)))return reply({error:'Payment verification failed'},400);
   const exists=await db().query('SELECT id FROM workshop_enrolments WHERE order_id=$1',[order]);if(!exists.rowCount)return reply({error:'Booking not found'},404);
   const paid=await confirm(payment,order);
   return reply({success:paid,status:paid?'paid':'pending',order,token:token(order)},paid?200:202);
  }
  const cookieValue=(req.headers.get('cookie')||'').split(';').map(part=>part.trim()).find(part=>part.startsWith(`${offerCookieName}=`))?.slice(offerCookieName.length+1);
  const existingOffer=readBookingOffer(cookieValue);
  if(body.action==='reserve'){
   if((process.env.WORKSHOP_ACCESS_SECRET||'').length<32)return reply({error:'Registration is not open yet.'},503);
   if(Date.now()>=Date.parse(workshop.closes))return reply({error:'This batch is closed.'},410);
   const visitorId=existingOffer?.visitorId||randomUUID();
   const expiresAt=existingOffer?.expiresAt||Math.min(Date.now()+workshop.offerMinutes*60*1000,Date.parse(workshop.closes));
   const offer=existingOffer||{visitorId,expiresAt,signature:bookingSignature(expiresAt,visitorId)};
   const response=reply({...offer,amount:workshopAmount(offer),currency:'INR'});
   const secure=new URL(req.url).protocol==='https:'?'; Secure':'';
   const maxAge=Math.max(86400,Math.ceil((Date.parse(workshop.closes)-Date.now())/1000)+86400);
   response.headers.set('Set-Cookie',`${offerCookieName}=${serializeBookingOffer(offer)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`);
   return response;
  }
  if(body.action!=='order')return reply({error:'Invalid action'},400);
  if(!ready())return reply({error:'Registration is not open yet. Please check back shortly.'},503);
  if(Date.now()>=Date.parse(workshop.closes))return reply({error:'This batch is closed.'},410);
  if(!existingOffer)return reply({error:'Your price could not be verified. Refresh the page before booking.'},400);
  const amount=workshopAmount(existingOffer);
  if(!Number.isInteger(amount)||amount<100)return reply({error:'Workshop payment amount is not configured correctly.'},500);
  if(body.amount!==undefined&&(!Number.isInteger(body.amount)||body.amount<100||body.amount!==amount))return reply({error:'Payment amount does not match your current workshop price.'},400);
  if(body.expectedAmount!==undefined&&body.expectedAmount!==amount)return reply({error:`Your 20-minute offer ended. The workshop now costs ₹${amount/100}. Review the price and select pay again.`,amount,code:'PRICE_CHANGED'},409);
  if(body.currency!==undefined&&body.currency!=='INR')return reply({error:'Workshop payments must use INR.'},400);
  const parsed=schema.safeParse(body);if(!parsed.success)return reply({error:'Check your name, email, +91 mobile number and terms.'},400);
  const v=parsed.data,id=randomUUID(),client=await db().connect();
  try{
   await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[v.email]);
   const recent=await client.query(`SELECT status FROM workshop_enrolments WHERE email=$1 AND cohort=$2 AND (status='paid' OR created_at>now()-interval '10 minutes')`,[v.email,workshop.dates]);
   if(recent.rows.some(r=>r.status==='paid')){await client.query('ROLLBACK');return reply({error:'Already booked. Check your confirmation email before paying again.'},409);}
   if((recent.rowCount||0)>=3){await client.query('ROLLBACK');return reply({error:'Please wait ten minutes before trying again.'},429);}
   await client.query('INSERT INTO workshop_enrolments(id,cohort,name,email,phone,group_consent,source,amount,currency) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[id,workshop.dates,v.name,v.email,v.phone,v.groupConsent,v.source,amount,'INR']);
   await client.query('COMMIT');
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  const order=await provider('orders',{amount,currency:'INR',receipt:id,notes:{enrolment:id}});
  if(!/^order_[A-Za-z0-9]+$/.test(order.id)||Number(order.amount)!==amount||order.currency!=='INR')return reply({error:'Invalid payment provider order response.'},500);
  await db().query('UPDATE workshop_enrolments SET order_id=$1 WHERE id=$2',[order.id,id]);
  const checkoutExpiresAt=amount===workshop.amount?existingOffer.expiresAt:Date.now()+20*60*1000;
  return reply({order_id:order.id,orderId:order.id,key:process.env.RAZORPAY_KEY_ID,amount,currency:'INR',checkoutExpiresAt});
 }catch(error){
  if(error instanceof SyntaxError)return reply({error:'Invalid JSON request'},400);
  if(error instanceof RazorpayRequestError)return reply({error:error.message},error.status);
  return reply({error:'Could not complete this step. If you have paid, keep your reference and check your email before retrying payment.'},500);
 }
}
