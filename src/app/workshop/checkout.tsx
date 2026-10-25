'use client';
import {useState, type FormEvent} from 'react';
import Script from 'next/script';
import {BookingTimer,useBookingWindow,WorkshopAmount} from './booking-window';
type Payment={razorpay_order_id:string;razorpay_payment_id:string;razorpay_signature:string};
type Options={timeout:number;key:string;order_id:string;amount:number;currency:string;name:string;description:string;prefill:{name:string;email:string;contact:string};theme:{color:string};handler:(p:Payment)=>void;modal:{ondismiss:()=>void}};
declare global{interface Window{Razorpay?:new(options:Options)=>{open:()=>void;on:(event:string,cb:()=>void)=>void}}}
export default function Checkout({enabled,closed=false,testMode=false}:{enabled:boolean;closed?:boolean;testMode?:boolean}){
 const booking=useBookingWindow();
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[loaded,setLoaded]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy||!enabled||closed||!booking.session)return;setBusy(true);setMessage('');
  const f=new FormData(e.currentTarget),name=String(f.get('name')),email=String(f.get('email')),phone=String(f.get('phone'));
  try{
   const expectedAmount=booking.amount;
   const bookingWindow=await booking.begin();if(!bookingWindow)throw Error('Please refresh to verify your workshop price.');
   if(!window.Razorpay)throw Error('Checkout could not load. Refresh or try another browser.');
   const source=new URLSearchParams(location.search);const sourceText=['utm_source','utm_campaign','utm_content'].map(k=>source.get(k)||'').join('/').slice(0,200);
   const r=await fetch('/api/workshop',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'order',bookingWindow,expectedAmount,name,email,phone,terms:f.get('terms')==='on',groupConsent:f.get('group')==='on',website:f.get('website'),source:sourceText})});
   const data=await r.json();if(!r.ok){if(data.code==='PRICE_CHANGED')await booking.begin();throw Error(data.error);}
   const checkout=new window.Razorpay({timeout:Math.max(1,Math.floor((data.expiresAt-Date.now())/1000)),key:data.key,order_id:data.order_id,amount:data.amount,currency:data.currency,name:'Gravity for AI',description:'Idea to App · both sessions',prefill:{name,email,contact:phone},theme:{color:'#122C57'},modal:{ondismiss:()=>{setBusy(false);setMessage('Checkout closed. No seat is confirmed until payment is verified.');}},handler:async(p)=>{
    try{const v=await fetch('/api/workshop',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verify',...p})});const result=await v.json();if(!v.ok)throw Error(result.error);location.assign(`/workshop/confirmed#order=${encodeURIComponent(result.order)}&token=${encodeURIComponent(result.token)}`);}
    catch(error){setMessage(error instanceof Error?error.message:'Check your confirmation email before paying again.');setBusy(false);}
   }});
   checkout.on('payment.failed',()=>{setBusy(false);setMessage('Payment did not complete. Check your bank status before retrying.');});checkout.open();
  }catch(error){setMessage(error instanceof Error?error.message:'Please try again.');setBusy(false);}
 }
 return <>{testMode&&<p className="ws-availability" role="status"><b>Razorpay test mode</b> · No real money will be charged.</p>}<BookingTimer/>{booking.message&&<p role="status" className="ws-caption">{booking.message}</p>}{!enabled&&<p className="ws-availability" role="status">{closed?"Registration for this batch has ended.":"Registration and payment will open here soon."} <a href="mailto:contact@gravityforai.com">Contact the workshop team</a>.</p>}{enabled&&<Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" onReady={()=>setLoaded(true)} onError={()=>setMessage('Checkout is unavailable. Please refresh or contact support.')}/>}<form onSubmit={submit} className="ws-form">
 <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={80}/></label>
 <label>Email for your confirmation<input type="email" name="email" autoComplete="email" required maxLength={160}/></label>
 <label>WhatsApp number<input type="tel" name="phone" placeholder="+919876543210" pattern="\+91[6-9][0-9]{9}" autoComplete="tel" required/><small>Include +91 followed by your 10-digit mobile number.</small></label>
 <div hidden aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off"/></div>
 <label className="ws-check"><input type="checkbox" name="terms" required/><span>I agree to the <a href="#policies">workshop terms, refund policy and privacy notice</a>.</span></label>
 <label className="ws-check"><input type="checkbox" name="group"/><span>Invite me to the workshop WhatsApp group for resources and daily learning messages. Members can see my number. I can leave anytime.</span></label>
 <p className="ws-payment-total">Amount due <strong><WorkshopAmount/></strong></p><button className="ws-button" disabled={!enabled||!loaded||busy||!booking.session}>{closed?'This batch is closed':!enabled?'Registration opens soon':busy?'Please wait…':!loaded?'Loading secure checkout…':<>Register &amp; pay <WorkshopAmount/> →</>}</button>
 <p role="status" aria-live="polite">{message}</p><small>Payment provider: <b>Razorpay</b>. Your booking is confirmed after payment verification.</small><small>One payment. Both sessions. No subscription. Can’t build the workshop app in 2 days? Get your full workshop fee back.</small>
 </form></>;
}
