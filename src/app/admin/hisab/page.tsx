import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/hisab/server';
import { HISAB_PLANS } from '@/lib/hisab/plans';

export const dynamic = 'force-dynamic';
const money = (paise: number) => new Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR'}).format(paise / 100);
const date = (value: string | Date | null) => value ? new Date(value).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short'}) : '—';
type Payment = {order_id: string; uid: string; email: string | null; name: string | null; plan_id: string; amount: number; refunded_amount: number; status: string; payment_id: string | null; created_at: Date; paid_at: Date | null};
type User = {uid: string; email: string | null; name: string | null; created_at: Date; expires_at: Date | null; firestore_synced_at: Date | null};

export default async function HisabPage({searchParams}: {searchParams: {page?: string}}) {
  if ((await getAdminSession())?.role !== 'ADMIN') redirect('/admin');
  const page = Math.min(100000, Math.max(1, Number.parseInt(searchParams.page || '1', 10) || 1));
  let data;
  try {
    const [users, payments, totals, recentUsers] = await Promise.all([
      db().query("SELECT count(*) AS total, count(*) FILTER(WHERE expires_at>now()) AS active, count(*) FILTER(WHERE firestore_synced_at IS NULL) AS pending_sync FROM hisab_users"),
      db().query<Payment>('SELECT o.*,u.email,u.name FROM hisab_orders o JOIN hisab_users u USING(uid) ORDER BY o.created_at DESC,o.order_id LIMIT 26 OFFSET $1', [(page - 1) * 25]),
      db().query("SELECT count(*) FILTER(WHERE status='paid') AS paid, count(*) FILTER(WHERE status='pending') AS pending, count(*) FILTER(WHERE status='refunded') AS refunded, COALESCE(sum(amount-refunded_amount) FILTER(WHERE status IN ('paid','refunded')),0) AS revenue FROM hisab_orders"),
      db().query<User>('SELECT * FROM hisab_users ORDER BY created_at DESC LIMIT 20'),
    ]);
    data = {users: users.rows[0], payments: payments.rows, totals: totals.rows[0], recentUsers: recentUsers.rows};
  } catch { /* Surface unavailable storage instead of inventing zero counts. */ }
  return <div className="space-y-8">
    <header className="flex flex-wrap justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-[#946A26]">Mobile application</p><h1 className="text-4xl font-serif mt-2">Hisab</h1><p className="mt-2 text-sm text-slate-600">Users, subscription payments and Firestore sync.</p></div><Link href="/admin/hisab" className="text-sm underline self-center">Refresh dashboard</Link></header>
    <section aria-label="Subscription plans" className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{HISAB_PLANS.map(plan => <div key={plan.id} className="rounded-xl border border-[#E4E2DC] p-5 bg-white"><h2 className="font-semibold">{plan.name}</h2><p className="text-xl mt-2">{plan.amount ? `${money(plan.amount)} / month` : 'Free'}</p><p className="text-sm text-slate-600 mt-2">{plan.maxWorkers} workers · {plan.maxClients} clients</p></div>)}</section>
    {!data ? <p role="alert" className="bg-white border rounded-lg p-6">Hisab storage is unavailable. Apply the Hisab database migration and check the server configuration.</p> : <>
      <section aria-label="Hisab totals" className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['Total users', data.users.total], ['Active subscriptions', data.users.active],
          ['Paid subscriptions', data.totals.paid], ['Net collected', money(Number(data.totals.revenue))],
        ].map(([label, value]) => <div key={label} className="bg-white border border-[#E4E2DC] rounded-xl p-5"><p className="text-sm text-slate-600">{label}</p><p className="text-3xl font-semibold mt-3">{value}</p></div>)}
      </section>
      <p className="text-sm text-slate-600">Pending orders: {data.totals.pending} · Refunded purchases: {data.totals.refunded} · Firestore sync pending: {data.users.pending_sync}. Net collected excludes refunded amounts, before fees. Times shown in IST.</p>
      <section className="bg-white border border-[#E4E2DC] rounded-xl overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm text-left"><caption className="text-left p-5 font-semibold text-lg">Subscription payments</caption>
          <thead className="bg-[#EEEAE1]"><tr>{['User','Plan / order','Amount','Status','Payment ID','Created / paid'].map(label => <th scope="col" key={label} className="p-4">{label}</th>)}</tr></thead>
          <tbody>{data.payments.slice(0,25).map(row => <tr key={row.order_id} className="border-t border-[#E4E2DC]">
            <td className="p-4"><p>{row.name || row.email || 'App user'}</p><p className="text-xs text-slate-500 break-all">{row.email || row.uid}</p></td>
            <td className="p-4">{row.plan_id}<p className="text-xs text-slate-500">{row.order_id}</p></td><td className="p-4 whitespace-nowrap">{money(row.amount)}{row.refunded_amount > 0 && <p className="text-xs">Refund: {money(row.refunded_amount)}</p>}</td>
            <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs ${row.status === 'paid' ? 'bg-green-50 text-green-800' : row.status === 'refunded' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'}`}>{row.status}</span></td>
            <td className="p-4 text-xs">{row.payment_id || '—'}</td><td className="p-4 whitespace-nowrap text-xs">{date(row.created_at)}<p className="text-slate-500">Paid: {date(row.paid_at)}</p></td>
          </tr>)}{!data.payments.length && <tr><td colSpan={6} className="p-10 text-center text-slate-500">No payment requests yet.</td></tr>}</tbody></table></div>
        <nav aria-label="Payment pages" className="p-5 flex gap-5 border-t text-sm">{page > 1 && <Link href={`/admin/hisab?page=${page-1}`} className="underline">Previous</Link>}<span>Page {page}</span>{data.payments.length > 25 && <Link href={`/admin/hisab?page=${page+1}`} className="underline">Next</Link>}</nav>
      </section>
      <section className="bg-white border border-[#E4E2DC] rounded-xl overflow-x-auto"><table className="w-full text-left text-sm"><caption className="p-5 text-left text-lg font-semibold">Latest 20 users</caption><thead className="bg-[#EEEAE1]"><tr>{['User','Joined','Subscription expires','Firestore'].map(label => <th key={label} scope="col" className="p-4">{label}</th>)}</tr></thead><tbody>{data.recentUsers.map(user => <tr key={user.uid} className="border-t"><td className="p-4">{user.name || user.email || 'App user'}<p className="text-xs text-slate-500 break-all">{user.uid}</p></td><td className="p-4">{date(user.created_at)}</td><td className="p-4">{date(user.expires_at)}</td><td className="p-4">{user.firestore_synced_at ? 'Synced' : 'Pending'}</td></tr>)}{!data.recentUsers.length && <tr><td colSpan={4} className="p-10 text-center text-slate-500">No users have signed in through the Hisab API yet.</td></tr>}</tbody></table></section>
    </>}
  </div>;
}
