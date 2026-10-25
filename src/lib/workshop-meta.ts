import {META_PIXEL_ID} from './meta-pixel';

export const WORKSHOP_PIXEL_ID='1126458823106886';
const initialized=new Set<string>();
const sent=new Set<string>();

export function initMetaPixel(pixelId:string){
 if(typeof window==='undefined'||!window.fbq)return false;
 try{
  if(!initialized.has(pixelId)){window.fbq('init',pixelId);initialized.add(pixelId);}
  return true;
 }catch{return false;}
}
export function pagePixelId(path:string){return path==='/workshop'?WORKSHOP_PIXEL_ID:META_PIXEL_ID;}
export function trackWorkshopEvent(event:'InitiateCheckout'|'Purchase'|'CompleteRegistration',orderId:string,amount:number,live:boolean){
 // Private confirmation links contain access tokens; never send them to Meta.
 if(!live||typeof window==='undefined'||window.location.pathname!=='/workshop'||!/^order_[A-Za-z0-9]+$/.test(orderId)||!Number.isSafeInteger(amount)||amount<100)return;
 const id=`workshop:${event}:${orderId}`,storageKey=`meta:${id}`;
 if(sent.has(id))return;
 try{if(localStorage.getItem(storageKey))return;}catch{/* Storage may be blocked. */}
 if(!initMetaPixel(WORKSHOP_PIXEL_ID))return;
 try{
  window.fbq('trackSingle',WORKSHOP_PIXEL_ID,event,{content_name:'Idea to App workshop',content_ids:['idea-to-app'],content_type:'product',value:amount/100,currency:'INR',num_items:1,...(event==='CompleteRegistration'?{status:true}:{})},{eventID:id});
  sent.add(id);
  try{localStorage.setItem(storageKey,'1');}catch{/* In-memory deduplication remains available. */}
 }catch{/* Analytics must never interrupt payment or confirmation. */}
}
