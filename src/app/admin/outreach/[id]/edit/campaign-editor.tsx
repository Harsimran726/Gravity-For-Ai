'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { editOutreachCampaign } from '@/actions/outreach-edit-actions';
import { resolveSteps, type SequenceConfig } from '@/lib/outreach-sequence';
import { personalize } from '@/lib/outreach-policy';
type Recipient={name:string;email:string;company:string|null;sequenceMessages:unknown;customSubject:string|null;customBody:string|null};
type Campaign={id:string;name:string;dailyLimit:number;status:string;updatedAt:string;sequence:SequenceConfig};
export function CampaignEditor({campaign,recipients}:{campaign:Campaign;recipients:Recipient[]}) {
  const router=useRouter();
  const [name,setName]=useState(campaign.name),[dailyLimit,setLimit]=useState(String(campaign.dailyLimit));
  const [sequence,setSequence]=useState(campaign.sequence),[scope,setScope]=useState<'DEFAULTS'|'REPLACE'>('DEFAULTS');
  const [pending,setPending]=useState(false),[message,setMessage]=useState(''),[previewIndex,setPreviewIndex]=useState(0);
  const [saved,setSaved]=useState(false);
  const recipient=recipients[previewIndex];
  const overrideCount=recipients.filter(p=>p.customSubject||p.customBody||Array.isArray(p.sequenceMessages)&&p.sequenceMessages.some(m=>m?.subject||m?.body)).length;
  function step(index:number,field:'day'|'subject'|'body',value:string) {
    setSequence(current=>({...current,steps:current.steps.map((s,i)=>i===index?{...s,[field]:field==='day'?Number(value):value}:s)}));
  }
  return <div className="max-w-5xl space-y-6 text-[#122C57]">
    <Link href={'/admin/outreach/'+campaign.id} className="text-sm underline">← Back to campaign</Link>
    <header><p className="text-xs uppercase tracking-widest text-slate-500">Campaign settings · {campaign.status}</p><h1 className="font-serif text-3xl mt-2">Edit campaign</h1><p className="mt-2 text-sm text-slate-600">Update messages and daily sending volume. Sent emails are never resent by saving.</p></header>
    {campaign.status==='ACTIVE'&&<p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">This campaign is active and can send while you edit. Changes apply after saving. Pause it on the campaign page first if you want time to review.</p>}
    <form onSubmit={async e=>{e.preventDefault();if(pending||saved)return;setPending(true);setMessage('');try{const result=await editOutreachCampaign({id:campaign.id,expectedUpdatedAt:campaign.updatedAt,name,dailyLimit:Number(dailyLimit),scope,sequence});setMessage(result.message);if(result.success){setSaved(true);router.refresh();}}catch{setMessage('Unable to save. Please try again.');}finally{setPending(false);}}} className="space-y-6">
    <fieldset disabled={pending||saved} className="space-y-6 disabled:opacity-70">
    <section className="rounded-2xl border bg-white p-6 grid gap-5 md:grid-cols-2">
      <label className="text-sm font-medium">Campaign name<input required maxLength={150} value={name} onChange={e=>setName(e.target.value)} className="mt-2 block w-full rounded-lg border p-3" /></label>
      <label className="text-sm font-medium">Maximum emails per day<input required type="number" min={1} max={100} value={dailyLimit} onChange={e=>setLimit(e.target.value)} className="mt-2 block w-full rounded-lg border p-3" /><span className="block mt-2 text-xs text-slate-500">Includes first emails and follow-ups. The shared mailbox and warm-up limits still apply. Lowering below today's usage stops further sending until the next daily reset.</span></label>
    </section>
    <section className="rounded-2xl border bg-white p-6 space-y-4"><h2 className="font-semibold">Which messages should change?</h2><p className="text-sm text-slate-600">{overrideCount} of {recipients.length} recipients have imported personalised messages.</p>
      <label className="flex items-start gap-3 rounded-lg border p-4"><input type="radio" name="scope" checked={scope==='DEFAULTS'} onChange={()=>setScope('DEFAULTS')} /><span><strong className="block text-sm">Edit campaign defaults</strong><span className="text-sm">Keep subjects and messages imported from your spreadsheet. Defaults fill empty fields only.</span></span></label>
      <label className="flex items-start gap-3 rounded-lg border p-4"><input type="radio" name="scope" checked={scope==='REPLACE'} onChange={()=>setScope('REPLACE')} /><span><strong className="block text-sm">Use these messages for every recipient</strong><span className="text-sm">Replace imported personalised subjects and messages for future sending. Already sent emails and their sending history are unchanged.</span></span></label>
    </section>
    <section className="rounded-2xl border bg-white p-6 space-y-5"><div><h2 className="font-semibold">Email sequence</h2><p className="text-sm mt-1 text-slate-500">Keep the existing step order. Days count from each recipient's first accepted email; delayed follow-ups preserve their minimum gaps.</p></div>
      <label className="block text-sm">Count days as<select value={sequence.dayMode} onChange={e=>setSequence(s=>({...s,dayMode:e.target.value as 'BUSINESS'|'CALENDAR'}))} className="ml-3 rounded-lg border p-2"><option value="BUSINESS">Business days (Mon–Fri, IST)</option><option value="CALENDAR">Calendar days</option></select></label>
      <p className="text-xs text-slate-500">Changing days can make pending follow-ups due sooner. Placeholders: {'{{name}}'}, {'{{firstname}}'}, {'{{company}}'}.</p>
      {sequence.steps.map((s,i)=><div key={i} className="rounded-xl border bg-slate-50 p-5 space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">{i?'Follow-up '+i:'First email'}</h3><label className="text-sm">Day <input aria-label={'Day for step '+(i+1)} type="number" min={i===0?0:1} max={365} readOnly={i===0} required value={s.day} onChange={e=>step(i,'day',e.target.value)} className="w-20 rounded-lg border p-2" /></label></div><label className="block text-sm">Subject<input maxLength={200} required={scope==='REPLACE'} value={s.subject} onChange={e=>step(i,'subject',e.target.value)} className="mt-1 block w-full rounded-lg border p-3" placeholder="Default email subject" /></label><label className="block text-sm">Message<textarea rows={7} maxLength={10000} required={scope==='REPLACE'} value={s.body} onChange={e=>step(i,'body',e.target.value)} className="mt-1 block w-full rounded-lg border p-3" placeholder="Write the message recipients will receive" /></label></div>)}
    </section>
    <section className="rounded-2xl border bg-white p-6 space-y-4"><h2 className="font-semibold">Preview before saving</h2><label className="block text-sm">Recipient<select value={previewIndex} onChange={e=>setPreviewIndex(Number(e.target.value))} className="block w-full rounded-lg border p-3 mt-2">{recipients.map((p,i)=><option key={p.email+'-'+i} value={i}>{p.name} — {p.email}</option>)}</select></label>{recipient&&resolveSteps({sequence},scope==='REPLACE'?{}:recipient).map((s,i)=><details key={i} open={i===0} className="rounded-lg border p-4"><summary className="cursor-pointer font-medium">Day {s.day} · {personalize(s.subject,recipient)||'(Missing subject)'}</summary><p className="whitespace-pre-wrap text-sm mt-3">{personalize(s.body,recipient)||'(Missing message)'}</p></details>)}<p className="text-xs text-slate-500">Business identity and unsubscribe link are added when sending.</p></section>
    </fieldset>
    {message&&<p role="status" className={'rounded-xl border p-4 '+(saved?'bg-emerald-50 text-emerald-900':'bg-amber-50 text-amber-900')}>{message}</p>}
    <div className="sticky bottom-0 flex items-center gap-4 border rounded-xl bg-white p-4 shadow-lg"><button disabled={pending||saved} type="submit" className="rounded-lg bg-[#122C57] px-5 py-3 text-white disabled:opacity-50">{pending?'Saving…':saved?'Saved':'Save changes'}</button><Link href={'/admin/outreach/'+campaign.id} className="text-sm underline">{saved?'Return to campaign':'Cancel'}</Link></div>
    </form>
  </div>;
}
