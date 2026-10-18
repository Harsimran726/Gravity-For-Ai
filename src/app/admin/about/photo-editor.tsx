'use client';
import { useEffect, useRef, useState } from 'react';
import { saveFounderPhoto } from '@/actions/founder-photo-actions';
import { FounderPhoto } from '@/components/founder-photo';
export function FounderPhotoEditor({initialUrl}:{initialUrl:string|null}) {
 const [url,setUrl]=useState(initialUrl); const [saved,setSaved]=useState(initialUrl);
 const [busy,setBusy]=useState(false); const [saving,setSaving]=useState(false); const [progress,setProgress]=useState(0); const [message,setMessage]=useState('');
 const controller=useRef<AbortController|null>(null);
 useEffect(()=>()=>controller.current?.abort(),[]);
 async function choose(file:File) {
  const ext:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
  if(!ext[file.type] || file.size<=0 || file.size>10*1024*1024){setMessage('Choose a JPG, PNG or WebP image up to 10 MB.');return;}
  const abort=new AbortController(); controller.current=abort;
  const timer=setTimeout(()=>abort.abort(),90000);
  setBusy(true);setProgress(0);setMessage('Uploading photo…');
  try {
   const {upload}=await import('@vercel/blob/client');
   const blob=await upload('founder-media/'+crypto.randomUUID()+'.'+ext[file.type],file,{access:'public',handleUploadUrl:'/api/about/media',clientPayload:JSON.stringify({type:file.type,size:file.size}),abortSignal:abort.signal,onUploadProgress:e=>setProgress(Math.round(e.percentage))});
   setUrl(blob.url);setMessage('Upload complete. Select Save photo to update the About page.');
  } catch {setMessage(abort.signal.aborted?'Upload cancelled or timed out. Your current photo is unchanged.':'Upload failed. Please retry or check that image storage is connected.');}
  finally {clearTimeout(timer);controller.current=null;setBusy(false);}
 }
 async function save(){if(!url)return;setSaving(true);setMessage('Saving photo…');try{const result=await saveFounderPhoto(url);if(result.success)setSaved(url);setMessage(result.message);}catch{setMessage('Could not save. Please try again.');}finally{setSaving(false);}}
 return <section className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 space-y-6"><div className="max-w-sm rounded-2xl bg-[#122C57] p-4 text-white"><FounderPhoto url={url}/><p className="text-center pb-4 text-sm">{url!==saved?'New photo preview':'Current photo'}</p></div><div className="space-y-3"><label htmlFor="founder-photo" className="block font-medium">{saved?'Choose a replacement photo':'Upload founder photo'}</label><input id="founder-photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy||saving} className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#122C57] file:px-4 file:py-3 file:text-white disabled:opacity-50" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void choose(file);}}/><p className="text-sm text-[#40516C]">JPG, PNG or WebP · Up to 10 MB · A square portrait works best. Saved photos are publicly visible.</p></div>{busy&&<div><progress className="w-full" max={100} value={progress} aria-label="Photo upload progress"/><p className="text-sm">Uploading: {progress}%</p></div>}<p role="status" aria-live="polite" className="text-sm text-[#122C57]">{message}</p><div className="flex flex-wrap items-center gap-4"><button type="button" onClick={save} disabled={busy||saving||!url||url===saved} className="rounded-lg bg-[#122C57] px-5 py-3 text-white disabled:opacity-40">{saving?'Saving…':'Save photo'}</button>{busy&&<button type="button" onClick={()=>controller.current?.abort()} className="underline">Cancel upload</button>}{url!==saved&&!busy&&!saving&&<button type="button" onClick={()=>{setUrl(saved);setMessage('Unsaved change discarded.');}} className="underline">Discard change</button>}<a href="/about#founder" target="_blank" rel="noopener noreferrer" className="underline">View About page <span className="sr-only">(opens in a new tab)</span>↗</a></div></section>;
}
