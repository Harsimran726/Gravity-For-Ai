import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/auth';
import {getOutreachAnalytics} from '@/actions/outreach-actions';
export const dynamic='force-dynamic';
export default async function OutreachDashboardPage(){
 const session=await getAdminSession();
 if(!session) redirect('/admin/login');
 const isAdmin=session.role==='ADMIN';
 const a=await getOutreachAnalytics(session);
 const cards=[['Sent today · IST',a.sentToday],['Sent before today',a.previousSent],['Total sent',a.totalSent],['First follow-up due',a.followup1],['Second follow-up due',a.followup2],['Responding contacts',a.replies],['Needs dispatch review',a.totalFailed],['Delivery tests sent',a.testSent]];
 return <div className="space-y-6 text-[#122C57]">
  <div className="flex justify-between items-center"><div><h1 className="font-serif text-3xl">Email campaigns</h1><p className="text-sm text-slate-500 mt-2">Hostinger · contact@gravityforai.com · campaign totals exclude delivery tests</p></div><Link href="/admin/outreach/new" className="bg-[#122C57] text-white px-4 py-3">New campaign</Link></div>
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{cards.map(([label,value])=><div className="bg-white border p-4" key={label}><p className="text-sm text-slate-500">{label}</p><p className="text-3xl mt-2">{value}</p></div>)}</div>
  <div className="bg-white border p-5 space-y-2"><h2 className="font-semibold">Mailbox readiness</h2><p>Sending: {a.configuration.enabled?'Enabled':'Disabled'}</p><p>Last inbox check: {a.mailbox?.lastInboxSyncAt?.toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})||'Not checked'}</p>{a.configuration.missing.length>0&&<p className="text-amber-800">Setup required: {a.configuration.missing.join(', ')}</p>}{a.mailbox?.lastError&&<p className="text-red-700">{a.mailbox.lastError}</p>}<p className="text-sm text-slate-500">A server scheduler must call the worker every two minutes. Warm-up means trusted-recipient delivery tests and gradual caps: 5/day for the first 3 days, 10/day for the next 4, then up to 20/day, limited by the configured cap. No artificial replies or inbox-placement guarantees.</p></div>
  <div className="overflow-x-auto border bg-white"><table className="w-full text-sm"><thead className="bg-[#F7F5F0]"><tr>{['Campaign','Status','Today','Earlier','Total','Follow-up 1 due','Follow-up 2 due','Replies'].map(s=><th className="p-3 text-left" key={s}>{s}</th>)}</tr></thead><tbody>{a.campaigns.map(c=><tr key={c.id} className="border-t"><td className="p-3"><Link className="underline" href={`/admin/outreach/${c.id}`}>{c.name}</Link>{c.purpose==='TEST'&&<span className="block text-xs">Delivery test</span>}</td><td className="p-3">{c.status}</td><td className="p-3">{c.sentToday}</td><td className="p-3">{c.totalSent-c.sentToday}</td><td className="p-3">{c.totalSent}</td><td className="p-3">{c.followup1}</td><td className="p-3">{c.followup2}</td><td className="p-3">{c.replies}</td></tr>)}</tbody></table>{!a.campaigns.length&&<p className="p-8">Create a campaign, upload an email-only CSV or Excel file, review its messages, then approve eligible recipients.</p>}</div>
  <p className="text-xs text-slate-500">Sent means accepted by SMTP, not delivered to the inbox. Replies include auto-replies and are held for human review. Due queues exclude stopped and unapproved recipients. Legacy send records remain visible but do not receive automatic follow-ups.</p>
 </div>;
}
