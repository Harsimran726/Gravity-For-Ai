import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { db, ready } from '@/lib/workshop-server';
import { workshop,formatWorkshopPrice } from '@/lib/workshop-config';

export const dynamic = 'force-dynamic';
type Enrolment = { amount: number; id: string; name: string; email: string; phone: string; group_consent: boolean; status: string; paid_at: Date | null; confirmation_sent_at: Date | null };

export default async function WorkshopAdminPage() {
  const session = await getAdminSession();
  if (session?.role !== 'ADMIN') redirect('/admin');
  let rows: Enrolment[] = [];
  let unavailable = false;
  try {
    const result = await db().query<Enrolment>('SELECT amount,id,name,email,phone,group_consent,status,paid_at,confirmation_sent_at FROM workshop_enrolments WHERE cohort=$1 ORDER BY created_at DESC LIMIT 500', [workshop.dates]);
    rows = result.rows;
  } catch { unavailable = true; }
  const paid = rows.filter(row => row.status === 'paid');
  return <div className="p-6 sm:p-10 space-y-7">
    <div className="flex flex-wrap justify-between gap-4 items-start"><div><p className="text-xs uppercase tracking-widest text-[#946A26]">Idea to App</p><h1 className="font-serif text-3xl mt-2">Workshop registrations</h1><p className="text-sm text-slate-600 mt-2">{workshop.dates} · {workshop.time}</p></div><Link href="/workshop" className="underline text-sm">Preview landing page ↗</Link></div>
    <div className="grid sm:grid-cols-3 gap-4">{[['Paid learners',String(paid.length)],['Group invitations requested',String(paid.filter(row=>row.group_consent).length)],['Confirmation emails pending',String(paid.filter(row=>!row.confirmation_sent_at).length)]].map(([label,value])=><div key={label} className="bg-white border border-[#E4E2DC] rounded-lg p-5"><p className="text-sm text-slate-600">{label}</p><p className="text-3xl font-semibold mt-2">{value}</p></div>)}</div>
    {!ready()&&<p className="rounded-lg border border-[#C99A44] bg-white p-5 text-sm">Checkout is inactive. Complete the payment settings and testing in docs/workshop-implementation.md before enabling registration.</p>}
    {unavailable?<div className="rounded-lg bg-white border border-[#E4E2DC] p-6"><h2 className="font-semibold">Registration storage is not available.</h2><p className="text-sm mt-2 text-slate-600">Apply db/workshop.sql to the configured database and verify connectivity. No learner data is shown until storage is ready.</p></div>:<div className="overflow-x-auto rounded-lg bg-white border border-[#E4E2DC]"><table className="w-full text-left text-sm"><caption className="text-left p-5 text-slate-600">Latest {rows.length} registrations for this batch. Approve group requests only for paid learners who opted in.</caption><thead className="bg-[#EEEAE1]"><tr>{['Learner','Contact','Payment','WhatsApp group','Confirmation'].map(label=><th scope="col" key={label} className="p-4 font-semibold">{label}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id} className="border-t border-[#E4E2DC]"><td className="p-4">{row.name}</td><td className="p-4"><p>{row.email}</p><p className="text-slate-500">{row.phone}</p></td><td className="p-4 capitalize">{row.status}<p className="text-xs text-slate-500">{formatWorkshopPrice(Number(row.amount))}</p></td><td className="p-4">{row.group_consent?'Opted in':'Not requested'}</td><td className="p-4">{row.status==='paid'?(row.confirmation_sent_at?'Sent':'Pending retry'):'Awaiting payment'}</td></tr>)}{!rows.length&&<tr><td colSpan={5} className="p-8 text-center text-slate-500">No registrations yet.</td></tr>}</tbody></table></div>}
    <p className="text-xs text-slate-500">Refunded bookings do not count as paid. Group messages are managed manually. Never share the learner report or private booking links.</p>
  </div>;
}
