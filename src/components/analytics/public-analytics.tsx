 'use client';
import {usePathname} from 'next/navigation';
import Script from 'next/script';
import {Analytics} from './analytics';
import {MetaPixel} from './meta-pixel';
export function PublicAnalytics({gtmId}:{gtmId:string}){
 const path=usePathname();
 if(!path || path==='/admin' || path.startsWith('/admin/'))return null;
 return <><Script id="google-tag-manager" strategy="afterInteractive" dangerouslySetInnerHTML={{__html:`(function(w,d,s,l,i){if(location.pathname.startsWith('/admin'))return;w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtmId).replace(/</g,'\\u003c')});`}}/><Analytics/><MetaPixel/></>;
}
