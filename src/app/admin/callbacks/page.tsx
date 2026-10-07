import {redirect} from 'next/navigation';
import Link from 'next/link';
import {prisma} from '@/lib/prisma';
import {getAdminSession} from '@/lib/auth';
import {callbackRoute} from '@/lib/ai-callback-policy';
import {callbackConfiguration} from '@/lib/ai-callbacks';
import {RefreshCallbacks} from './refresh';
export const dynamic='force-dynamic';
const stamp=(date:Date|null)=>date?date.toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}):'—';
export default async function CallbacksPage({searchParams}:{searchParams:{source?:string;status?:string;page?:string}}){
  const session=await getAdminSession();if(!session)redirect('/admin/login');if(session.role!=='ADMIN')redirect('/admin');
  const config=callbackConfiguration();
  const source=['BOOKING','CONTACT'].includes(searchParams.source||'')?searchParams.source:undefined;
  const statuses=['QUEUED','BLOCKED','SKIPPED','DISPATCHING','ACCEPTED','CONNECTED','NO_ANSWER','BUSY','FAILED','REJECTED','UNKNOWN','EXPIRED'];
  const status=statuses.includes(searchParams.status||'')?searchParams.status:undefined;
  const page=Math.max(1,Math.min(10000,Number.parseInt(searchParams.page||'1',10)||1));
  const where={...(source?{source}:{}),...(status?{status}:{})};
  const [calls,total,groups]=await Promise.all([prisma.aiCallback.findMany({where,include:{lead:true},orderBy:{createdAt:'desc'},skip:(page-1)*25,take:25}),prisma.aiCallback.count({where}),prisma.aiCallback.groupBy({by:['status'],_count:{_all:true}})]);
  const count=(values:string[])=>groups.filter(g=>values.includes(g.status)).reduce((sum,g)=>sum+g._count._all,0);
  const href=(p:number)=>'/admin/callbacks?'+new URLSearchParams({...(source?{source}:{}),...(status?{status}:{}),page:String(p)});
  return <div className="space-y-6 max-w-7xl"><div className="flex justify-between gap-4"><div><h1 className="font-serif text-3xl">AI callbacks</h1><p className="text-sm text-slate-600">Website submission → call request → call result. Times shown in IST.</p></div><RefreshCallbacks/></div>
    <div className="bg-white border p-4"><strong>{config.enabled&&!config.missing.length?'Automatic callbacks enabled':'Automatic callbacks not active'}</strong><p className="text-sm">{config.missing.length?'Setup needed: '+config.missing.join(', '):!config.enabled?'Set SARVAM_CALLBACKS_ENABLED=true after a controlled test.':'New form submissions with valid US or Indian numbers request an automatic AI callback.'}</p><p className="text-xs mt-2">A saved booking is separate from a call outcome. Accepted means Sarvam accepted the request, not that the person answered. Blocked requests and old leads are never automatically called later.</p></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[['Answered',count(['CONNECTED'])],['Awaiting result',count(['ACCEPTED','DISPATCHING'])],['Unanswered / failed',count(['NO_ANSWER','BUSY','FAILED','REJECTED'])],['Needs attention',count(['UNKNOWN','BLOCKED','EXPIRED','QUEUED'])]].map(([label,value])=><div key={label} className="bg-white border p-4"><p className="text-sm">{label}</p><strong className="text-3xl">{value}</strong></div>)}</div>
    <form className="flex flex-wrap gap-3"><label>Source <select name="source" defaultValue={source||''} className="border p-2"><option value="">All</option><option value="BOOKING">Meeting bookings</option><option value="CONTACT">Contact forms</option></select></label><label>Status <select name="status" defaultValue={status||''} className="border p-2"><option value="">All</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></label><button className="bg-[#122C57] text-white px-4 py-2">Filter</button></form>
    <p className="text-sm">{total} records · Page {page} · Refreshes every 30 seconds</p>
    {!calls.length&&<div className="border bg-white p-8">No callbacks match this view. New website submissions will appear here after deployment.</div>}
    {calls.map(call=><article key={call.id} className="border bg-white p-5 space-y-3"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{call.lead.name} · {call.phone||'No callback number'}</h2><p className="text-sm">{call.source==='BOOKING'?'Meeting booking saved':'Contact enquiry received'} · {stamp(call.createdAt)}</p><p className="text-sm text-slate-600">{call.lead.serviceInterest}</p><p className="text-sm">Callback route: {callbackRoute(call.phone)?.country||'Manual follow-up'} · Caller number: {callbackRoute(call.phone)?.connection.agent_phone_number||'—'}</p></div><strong className="text-sm">{call.status}</strong></div>
      <div className="text-sm grid sm:grid-cols-3 gap-2"><span>Call requested: {stamp(call.requestedAt)}</span><span>Result received: {stamp(call.completedAt)}</span><span>Duration: {call.duration===null?'—':call.duration+' seconds'}</span></div>
      {call.error&&<p className="text-sm text-amber-800">{call.error}</p>}{call.disposition&&<p><strong>Disposition:</strong> {call.disposition}</p>}<p className="whitespace-pre-wrap text-sm"><strong>Summary:</strong> {call.summary||'No summary received yet.'}</p>
      {call.status==='DISPATCHING'&&call.requestedAt&&Date.now()-call.requestedAt.getTime()>120000&&<p className="text-amber-800 text-sm">Dispatch stalled. Check Sarvam before calling again; no automatic retry.</p>}
      <details className="text-sm"><summary className="cursor-pointer">Transcript and tracking details</summary><pre className="whitespace-pre-wrap font-sans mt-3">{call.transcript||'No transcript received.'}</pre><p className="mt-3">Lead: {call.leadId} · Attempt: {call.attemptId||'—'}</p><p>Callback requested by visitor: {stamp(call.consentAt)}</p><p>{call.consentText}</p></details>
      <Link className="underline text-sm" href={call.source==='BOOKING'?'/admin/bookings':'/admin/leads'}>Open {call.source==='BOOKING'?'bookings':'enquiries'}</Link></article>)}
    <div className="flex gap-4">{page>1&&<Link href={href(page-1)}>Previous</Link>}{page*25<total&&<Link href={href(page+1)}>Next</Link>}</div>
  </div>;
}
