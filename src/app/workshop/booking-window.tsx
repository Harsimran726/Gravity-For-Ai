'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {Clock3,ArrowUpRight} from 'lucide-react';
import {workshop,formatWorkshopPrice} from '@/lib/workshop-config';
export type WindowData={visitorId:string;expiresAt:number;signature:string};
type BookingState={enabled:boolean;session:WindowData|null;remaining:number;expired:boolean;amount:number|null;message:string;begin:()=>Promise<WindowData|null>};
const BookingContext=createContext<BookingState|null>(null);
export function BookingWindow({enabled,children,initialOffer=null,initialNow}:{enabled:boolean;children:ReactNode;initialOffer?:WindowData|null;initialNow:number}){
 const [session,setSession]=useState<WindowData|null>(initialOffer),[now,setNow]=useState(initialNow),[message,setMessage]=useState('');
 const started=useRef(false);
 const begin=useCallback(async()=>{
  try{
   const response=await fetch('/api/workshop',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'reserve'}),signal:AbortSignal.timeout(10000)});
   const data=await response.json();if(!response.ok)throw Error(data.error||'Could not check your workshop price.');
   if(typeof data.expiresAt!=='number'||typeof data.visitorId!=='string'||typeof data.signature!=='string')throw Error('Please refresh to check your price.');
   const next={visitorId:data.visitorId,expiresAt:data.expiresAt,signature:data.signature};setSession(next);setNow(Date.now());setMessage('');return next;
  }catch(error){setMessage(error instanceof Error&&error.name!=='TimeoutError'&&error.name!=='AbortError'?error.message:'Could not check your price. Please try again.');return null;}
 },[]);
 useEffect(()=>{
  if(!started.current){started.current=true;void begin();}
  const timer=setInterval(()=>setNow(Date.now()),1000);
  const resync=()=>{if(document.visibilityState==='visible')void begin();};
  window.addEventListener('focus',resync);document.addEventListener('visibilitychange',resync);
  return()=>{clearInterval(timer);window.removeEventListener('focus',resync);document.removeEventListener('visibilitychange',resync);};
 },[begin]);
 const remaining=session?Math.max(0,Math.ceil((session.expiresAt-now)/1000)):1200;
 const expired=!!session&&remaining===0;
 const amount=session?(expired?workshop.regularAmount:workshop.amount):null;
 return <BookingContext.Provider value={{enabled,session,remaining,expired,amount,message,begin}}>{children}</BookingContext.Provider>;
}
export function useBookingWindow(){const value=useContext(BookingContext);if(!value)throw Error('Booking window is missing');return value;}
export function WorkshopAmount(){const {amount}=useBookingWindow();return <>{amount===null?'…':formatWorkshopPrice(amount)}</>;}
export function WorkshopPrice({large=false}:{large?:boolean}){const {amount,expired,message}=useBookingWindow();return <div className={`ws-offer-price ${large?'is-large':''}`}>{amount!==null&&!expired&&<del>₹999</del>}<strong><WorkshopAmount/></strong><span>{amount===null?(message?'Price unavailable':'Checking your price…'):expired?'regular price · both days':'first-visit offer · both days'}</span></div>;}
export function BookingTimer({compact=false}:{compact?:boolean}){
 const {session,remaining,expired,message,begin}=useBookingWindow();
 const time=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
 return <div className={`ws-countdown ${compact?'ws-countdown-compact':''} ${expired?'is-expired':''}`}><Clock3 size={compact?15:19} aria-hidden="true"/><span>{!session?(message?'Unable to check your offer':'Checking your offer…'):expired?'Offer ended. Workshop price: ₹999':'Your ₹299 offer ends in'}{!compact&&session&&<small>{expired?'Book at the regular price below.':'After the timer ends: ₹999.'}</small>}</span>{!session&&message?<button type="button" onClick={()=>{void begin();}}>Try again</button>:<strong aria-label={session?`${Math.floor(remaining/60)} minutes ${remaining%60} seconds`:'Checking price'}>{session?time:'--:--'}</strong>}</div>;
}
export function BookingButton({children,className='ws-button'}:{children:ReactNode;className?:string}){return <a href="#register" className={className}>{children}<ArrowUpRight size={18} aria-hidden="true"/></a>;}
