'use client';
import * as React from 'react';
import Script from 'next/script';
import {usePathname,useSearchParams} from 'next/navigation';
import {initMetaPixel,pagePixelId} from '@/lib/workshop-meta';

function MetaPixelRouteTracker({loaded}:{loaded:boolean}){
 const pathname=usePathname(),search=useSearchParams();
 const last=React.useRef('');
 React.useEffect(()=>{
  if(!loaded||!pathname||pathname.startsWith('/admin')||pathname==='/workshop/confirmed')return;
  const pixelId=pagePixelId(pathname),key=`${pathname}?${search.toString()}`;
  if(last.current===key||!initMetaPixel(pixelId))return;
  window.fbq('trackSingle',pixelId,'PageView');last.current=key;
 },[loaded,pathname,search]);
 return null;
}
export function MetaPixel(){
 const [loaded,setLoaded]=React.useState(false);
 const pathname=usePathname();
 const pixelId=pagePixelId(pathname||'/');
 return <><Script id="fb-pixel" strategy="afterInteractive" onReady={()=>setLoaded(true)} dangerouslySetInnerHTML={{__html:`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');`}}/><noscript><img height="1" width="1" style={{display:'none'}} src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`} alt=""/></noscript><React.Suspense fallback={null}><MetaPixelRouteTracker loaded={loaded}/></React.Suspense></>;
}
export const FacebookPixel=MetaPixel;
export default MetaPixel;
