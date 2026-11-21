 'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
type Attribution={source?:string;medium?:string;campaign?:string;term?:string;referrer:string};
export function AudienceTracker(){
 const path=usePathname();const [choice,setChoice]=useState<string|null>('loading');
 useEffect(()=>{try{setChoice(localStorage.getItem('gfa_audience_consent'));}catch{setChoice('denied');}},[]);
 useEffect(()=>{
 if(choice!=='accepted'||!path||path.startsWith('/admin')||path==='/workshop/confirmed'||navigator.doNotTrack==='1'||(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl)return;
 let timer:ReturnType<typeof setInterval>|undefined;
 try{
 let visitorId=localStorage.getItem('gfa_audience_visitor');if(!visitorId){visitorId=crypto.randomUUID();localStorage.setItem('gfa_audience_visitor',visitorId);}
 const now=Date.now();let session:{id:string;at:number;attribution:Attribution}|null=null;
 try{session=JSON.parse(sessionStorage.getItem('gfa_audience_session')||'null');}catch{}
 if(!session||now-session.at>1800000){const q=new URLSearchParams(location.search);session={id:crypto.randomUUID(),at:now,attribution:{referrer:document.referrer,source:q.get('utm_source')?.slice(0,100),medium:q.get('utm_medium')?.slice(0,100),campaign:q.get('utm_campaign')?.slice(0,150),term:q.get('utm_term')?.slice(0,150)}};}
 session.at=now;sessionStorage.setItem('gfa_audience_session',JSON.stringify(session));
 const id=crypto.randomUUID(),sessionId=session.id,attribution=session.attribution;let activeMs=0,last=performance.now();
 const send=()=>{const t=performance.now();if(document.visibilityState==='visible')activeMs+=t-last;last=t;session!.at=Date.now();sessionStorage.setItem('gfa_audience_session',JSON.stringify(session));const body=JSON.stringify({id,visitorId,sessionId,path,seconds:Math.min(14400,Math.floor(activeMs/1000)),...attribution});void fetch('/api/audience',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true}).catch(()=>{});};
 const visibility=()=>{const t=performance.now();if(document.visibilityState==='hidden')activeMs+=t-last;last=t;send();};
 send();timer=setInterval(send,30000);document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',send);
 return()=>{send();clearInterval(timer);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',send);};
 }catch{if(timer)clearInterval(timer);}
 },[path,choice]);
 if(choice==='loading')return null;
 if(choice!==null)return <button className="fixed bottom-2 left-2 z-[90] bg-white border rounded px-2 py-1 text-xs" onClick={()=>setChoice(null)}>Measurement settings</button>;
 const choose=(value:string)=>{try{localStorage.setItem('gfa_audience_consent',value);}catch{}setChoice(value);};
 return <aside aria-label="Audience measurement preferences" className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-lg z-[100] bg-white border border-[#122C57] p-5 rounded-xl shadow-lg text-sm space-y-3"><p>Allow audience measurement? We record your IP address, approximate location, device, referral source and active page time for up to 30 days. <a href="/privacy-policy" className="underline">Privacy policy</a></p><div className="flex gap-3"><button onClick={()=>choose('accepted')} className="bg-[#122C57] text-white rounded px-4 py-2">Allow measurement</button><button onClick={()=>choose('denied')} className="border rounded px-4 py-2">Decline</button></div></aside>;
}
