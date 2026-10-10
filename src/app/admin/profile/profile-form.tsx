 'use client';
import {useState} from 'react';
import {useFormState,useFormStatus} from 'react-dom';
import {saveProfile} from '@/actions/profile-actions';
type Profile={name:string|null;title:string|null;bio:string|null;linkedinUrl:string|null;githubUrl:string|null;avatarUrl:string|null};
function Save({busy}:{busy:boolean}){const {pending}=useFormStatus();return <button disabled={pending||busy} className="rounded-lg bg-[#122C57] px-6 py-3 text-white disabled:opacity-50">{pending?'Saving…':'Save profile'}</button>;}
export function ProfileForm({profile}:{profile:Profile}){
 const [state,action]=useFormState(saveProfile,{});const [photo,setPhoto]=useState(profile.avatarUrl||'');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 async function upload(file?:File){
  if(!file)return;
  setError('');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setError('Choose a JPG, PNG or WebP image under 5 MB.');return;}
  setBusy(true);
  try{const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d');if(!ctx)throw Error();ctx.fillStyle='#ffffff';ctx.fillRect(0,0,256,256);const side=Math.min(bitmap.width,bitmap.height);ctx.drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,256,256);bitmap.close();setPhoto(canvas.toDataURL('image/jpeg',0.85));}catch{setError('Could not read this photo. Try another image.');}finally{setBusy(false);}
 }
 const input='mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#122C57]';
 return <form action={action} className="space-y-5 bg-white border border-[#DDD6C7] rounded-xl p-6">
 <div className="flex items-center gap-5"><img src={photo||'/apple-touch-icon.png'} alt="Your public author photo" width={80} height={80} className="rounded-full object-cover w-20 h-20"/><div><label htmlFor="photo" className="block text-sm font-medium">Profile picture (optional)</label><input id="photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>upload(e.target.files?.[0])} className="text-sm mt-2 max-w-full"/><p className="text-xs text-slate-500 mt-2">JPG, PNG or WebP, up to 5 MB. Cropped to a square.</p><button type="button" disabled={busy} onClick={()=>setPhoto('')} className="text-sm underline mt-2">Remove photo</button></div></div>
 <input type="hidden" name="avatarUrl" value={photo}/>
 {error&&<p role="alert" className="text-red-700 text-sm">{error}</p>}
 {([['name','Display name',100],['title','Job title (optional)',120],['linkedinUrl','LinkedIn profile URL (optional)',250],['githubUrl','GitHub profile URL (optional)',250]] as const).map(([key,label,max])=><div key={key}><label htmlFor={key} className="text-sm font-medium">{label}</label><input id={key} name={key} defaultValue={profile[key]||''} required={key==='name'} maxLength={max} type={key.endsWith('Url')?'url':'text'} className={input}/></div>)}
 <div><label htmlFor="bio" className="text-sm font-medium">Short bio (optional)</label><textarea id="bio" name="bio" rows={4} maxLength={600} defaultValue={profile.bio||''} className={input}/></div>
 {state.message&&<p role={state.success?'status':'alert'} className={state.success?'text-emerald-700':'text-red-700'}>{state.message}</p>}<Save busy={busy}/>
 </form>;
}

