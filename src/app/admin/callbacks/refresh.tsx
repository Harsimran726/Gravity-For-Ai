'use client';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';
export function RefreshCallbacks(){const router=useRouter();useEffect(()=>{const timer=setInterval(()=>{if(document.visibilityState==='visible')router.refresh();},30000);return()=>clearInterval(timer);},[router]);return <button className="border px-4 py-2" onClick={()=>router.refresh()}>Refresh results</button>;}
