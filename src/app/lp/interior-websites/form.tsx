'use client';
import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitWebsiteEnquiry } from './action';

function Submit() { const {pending}=useFormStatus(); return <button disabled={pending} className="w-full bg-[#122C57] text-white px-5 py-4 font-semibold disabled:opacity-60">{pending?'Sending your enquiry...':'Request my discovery call'} <span aria-hidden="true">→</span></button>; }
export function WebsiteEnquiryForm() {
 const [state,action]=useFormState(submitWebsiteEnquiry,{});
 const [tags,setTags]=useState<Record<string,string>>({});
 useEffect(()=>{const q=new URLSearchParams(window.location.search);setTags(Object.fromEntries(['utm_source','utm_medium','utm_campaign','utm_content'].map(k=>[k,(q.get(k)||'').slice(0,150)])));},[]);
 useEffect(()=>{if(state.success) window.dispatchEvent(new Event("website-enquiry-saved"));},[state.success]);
 if(state.success) return <div role="status" className="rounded-2xl border border-[#C99A44] bg-white p-8"><h2 className="font-serif text-3xl mb-4">Thank you. Let’s talk about your website.</h2><p>{state.message}</p><p className="mt-4 text-sm">Keep your project photos and current website link handy. You can also reach us at <a className="underline" href="mailto:contact@gravityforai.com">contact@gravityforai.com</a>.</p></div>;
 const fields=[['name','Your name','text','name'],['businessName','Business name','text','organization'],['phone','Mobile number','tel','tel'],['email','Email address','email','email']] as const;
 const input='mt-2 w-full rounded-lg border border-[#CCC9C1] bg-white px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#122C57]';
 return <form action={action} className="rounded-2xl bg-white border border-[#E4E2DC] p-6 sm:p-8 shadow-lg space-y-4">
 <h2 className="font-serif text-3xl">Let’s discuss your website.</h2><p className="text-sm text-slate-600">Share the essentials. We’ll follow up to understand your project and arrange a suitable meeting time.</p>
 <div hidden aria-hidden="true"><label htmlFor="website_hp">Leave empty</label><input id="website_hp" name="website_hp" tabIndex={-1} autoComplete="off" /></div>
 {Object.entries(tags).map(([k,v])=><input key={k} type="hidden" name={k} value={v}/>)}
 <div className="grid sm:grid-cols-2 gap-4">{fields.map(([name,label,type,autoComplete])=><div key={name}><label htmlFor={name} className="text-sm font-medium">{label} *</label><input id={name} name={name} type={type} autoComplete={autoComplete} required maxLength={name==='email'?254:name==='phone'?30:150} className={input} aria-invalid={!!state.errors?.[name]} aria-describedby={state.errors?.[name]?`${name}-error`:undefined}/>{state.errors?.[name]&&<p id={`${name}-error`} className="text-sm text-red-700 mt-1">{state.errors[name][0]}</p>}</div>)}</div>
 <div><label htmlFor="city" className="text-sm font-medium">Business city *</label><select id="city" name="city" required className={input} defaultValue=""><option value="" disabled>Select city</option>{['Chandigarh','Mohali','Other'].map(c=><option key={c}>{c}</option>)}</select></div>
 <div><label htmlFor="website" className="text-sm font-medium">Current website or Instagram <span className="text-slate-500">(optional)</span></label><input id="website" name="website" type="text" maxLength={250} className={input}/></div>
 <div><label htmlFor="budget" className="text-sm font-medium">Website project budget *</label><select id="budget" name="budget" required className={input} defaultValue="" aria-invalid={!!state.errors?.budget} aria-describedby={state.errors?.budget?"budget-error":undefined}><option value="" disabled>Select your budget</option>{[["20000-35000","₹20,000–₹35,000"],["35000-50000","₹35,000–₹50,000"],["50000-75000","₹50,000–₹75,000"],["75000-100000","₹75,000–₹1,00,000"]].map(([v,l])=><option value={v} key={v}>{l}</option>)}</select>{state.errors?.budget&&<p id="budget-error" className="text-sm text-red-700">{state.errors.budget[0]}</p>}<p className="text-xs text-slate-500 mt-2">Final scope, taxes and any hosting, domain or support costs are confirmed in your written quote.</p></div>
 <input type="hidden" name="callbackNotice" value="automatic-v1"/><p className="text-xs text-slate-500">We use these details to respond to your enquiry. We also use Meta to measure advertising performance, including hashed contact details to match submitted enquiries. Read our <a href="/privacy-policy" className="underline">privacy policy</a>.</p>
 {state.message&&<p role="alert" className="text-red-700 text-sm">{state.message}</p>}<Submit/>
 </form>;
}
