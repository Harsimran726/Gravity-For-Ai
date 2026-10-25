import {createHmac,timingSafeEqual} from 'crypto';
import {Pool} from 'pg';
import Razorpay from 'razorpay';
import type {Orders} from 'razorpay/dist/types/orders';
import type {Payments} from 'razorpay/dist/types/payments';
import {dispatchEmail} from '@/lib/mail';
import {workshop,formatWorkshopPrice} from './workshop-config';
const singleton=globalThis as unknown as {workshopPool?:Pool};
export function db(){return singleton.workshopPool ?? (singleton.workshopPool=new Pool({connectionString:process.env.DATABASE_URL,max:3}));}
export function ready(){return process.env.WORKSHOP_CHECKOUT_ENABLED==='true' && (process.env.WORKSHOP_ACCESS_SECRET||'').length>=32 && ['DATABASE_URL','RAZORPAY_KEY_ID','RAZORPAY_KEY_SECRET','RAZORPAY_WEBHOOK_SECRET','WORKSHOP_ACCESS_SECRET'].every(k=>Boolean(process.env[k]));}
export function sign(value:string,key:string){return createHmac('sha256',key).update(value).digest('hex');}
export function matches(actual:string,expected:string){return /^[a-f0-9]{64}$/.test(actual) && /^[a-f0-9]{64}$/.test(expected) && timingSafeEqual(Buffer.from(actual,'hex'),Buffer.from(expected,'hex'));}
export function token(order:string){if(!process.env.WORKSHOP_ACCESS_SECRET)throw Error('Not configured');return sign(`workshop:${order}`,process.env.WORKSHOP_ACCESS_SECRET);}
export class RazorpayRequestError extends Error {
 constructor(public status:number){super(status===401?'Razorpay authentication failed. Please contact the workshop team.':'The payment provider could not complete this step. Please try again.');}
}
export function provider(path:'orders',data:Orders.RazorpayOrderCreateRequestBody):Promise<Orders.RazorpayOrder>;
export function provider(path:`payments/${string}`):Promise<Payments.RazorpayPayment>;
export async function provider(path:string,data?:Orders.RazorpayOrderCreateRequestBody){
 try{
  const client=new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET});
  if(path==='orders'&&data)return await client.orders.create(data);
  if(/^payments\/pay_[A-Za-z0-9]+$/.test(path))return await client.payments.fetch(path.slice('payments/'.length));
  throw new RazorpayRequestError(500);
 }catch(error){
  if(error instanceof RazorpayRequestError)throw error;
  const status=error&&typeof error==='object'&&'statusCode' in error?Number(error.statusCode):500;
  throw new RazorpayRequestError(status===401||status===403?401:500);
 }
}
export async function confirm(paymentId:string,expectedOrder?:string){
 if(!/^pay_[A-Za-z0-9]+$/.test(paymentId))throw Error('Invalid payment');
 const p=await provider(`payments/${paymentId}`);
 if(expectedOrder && p.order_id!==expectedOrder)throw Error('Order mismatch');
 if(p.id!==paymentId||p.status!=='captured'||p.currency!=='INR'||Number(p.amount_refunded??0)>0)return false;
 const expected=await db().query('SELECT amount,currency FROM workshop_enrolments WHERE order_id=$1',[p.order_id]);
 if(!expected.rows.length||Number(p.amount)!==Number(expected.rows[0].amount)||p.currency!==expected.rows[0].currency)return false;
 const {rows}=await db().query(`UPDATE workshop_enrolments SET status='paid',payment_id=$1,paid_at=COALESCE(paid_at,now()) WHERE order_id=$2 AND status IN ('pending','paid') RETURNING *`,[p.id,p.order_id]);
 if(!rows.length)return false;
 // Lock across concurrent callback/webhook deliveries to avoid duplicate email.
 const client=await db().connect();
 try{
  await client.query('BEGIN');
  const {rows:[row]}=await client.query('SELECT * FROM workshop_enrolments WHERE order_id=$1 FOR UPDATE',[p.order_id]);
  if(!row.confirmation_sent_at){
   const origin=process.env.WORKSHOP_SITE_ORIGIN||'https://gravityforai.com';
   const url=`${origin}/workshop/confirmed#order=${encodeURIComponent(p.order_id)}&token=${token(p.order_id)}`;
   const sent=await dispatchEmail({to:row.email,subject:'Confirmed: Idea to App · both sessions',html:`<h1>Your booking is confirmed.</h1><p>${workshop.dates}, ${workshop.time}</p><p>${formatWorkshopPrice(Number(row.amount))} paid for both live sessions.</p><p><a href="${url}">Open your private confirmation and resources</a></p><p>Keep this link private. Need help? Reply to this email.</p>`});
   if(!sent)throw Error('Email pending retry');
   await client.query('UPDATE workshop_enrolments SET confirmation_sent_at=now() WHERE id=$1',[row.id]);
  }
  await client.query('COMMIT');
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
 return true;
}

export const offerCookieName='gravity_workshop_first_visit_v1';
export type BookingOffer={visitorId:string;expiresAt:number;signature:string};
export function bookingSignature(expiresAt:number,visitorId:string){return sign(`first-visit:${workshop.dates}:${visitorId}:${expiresAt}`,process.env.WORKSHOP_ACCESS_SECRET||'');}
export function validBookingWindow(value:unknown):value is BookingOffer{
 if(!value||typeof value!=='object')return false;
 const window=value as Partial<BookingOffer>;
 return typeof window.visitorId==='string'&&/^[a-f0-9-]{36}$/.test(window.visitorId)&&typeof window.expiresAt==='number'&&Number.isSafeInteger(window.expiresAt)&&window.expiresAt>0&&window.expiresAt<=Date.now()+workshop.offerMinutes*60*1000&&typeof window.signature==='string'&&!!process.env.WORKSHOP_ACCESS_SECRET&&matches(window.signature,bookingSignature(window.expiresAt,window.visitorId));
}
export function serializeBookingOffer(offer:BookingOffer){return `${offer.visitorId}.${offer.expiresAt}.${offer.signature}`;}
export function readBookingOffer(raw?:string):BookingOffer|null{
 if(!raw)return null;
 const [visitorId,expiresAt,signature,...extra]=raw.split('.');
 const value={visitorId,expiresAt:Number(expiresAt),signature};
 return !extra.length&&validBookingWindow(value)?value:null;
}
export function workshopAmount(offer:BookingOffer,now=Date.now()){return now<offer.expiresAt?workshop.amount:workshop.regularAmount;}
