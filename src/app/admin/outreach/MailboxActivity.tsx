import {prisma} from '@/lib/prisma';
import {latestInboxMessages} from '@/lib/hostinger-inbox';
import {senderAddress} from '@/lib/mail-sent-copy';
export default async function MailboxActivity(){
 const [copies,inbox]=await Promise.allSettled([
  prisma.mailSentCopy.groupBy({by:['status'],_count:{_all:true}}), latestInboxMessages()
 ]);
 const count=(statuses:string[])=>copies.status==='fulfilled'?copies.value.filter(x=>statuses.includes(x.status)).reduce((n,x)=>n+x._count._all,0):'Unavailable';
 return <section className="rounded-xl border bg-white p-5 space-y-4">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-lg">Your mailbox</h2><p className="text-sm text-slate-500">{senderAddress()}</p></div><div className="flex gap-3"><a href="https://mail.hostinger.com/0/mailboxes/INBOX" target="_blank" rel="noopener noreferrer" className="border rounded-lg px-4 py-2">Open Inbox ↗</a><a href="https://mail.hostinger.com/0/mailboxes/INBOX.Sent" target="_blank" rel="noopener noreferrer" className="bg-[#122C57] text-white rounded-lg px-4 py-2">Open Sent ↗</a></div></div>
  <div className="grid gap-3 sm:grid-cols-3">{[['Saved to Sent',count(['SAVED'])],['Copy pending',count(['PENDING','SAVING'])],['Sending outcome needs review',count(['PREPARED','UNKNOWN'])]].map(([label,value])=><div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-sm text-slate-600">{label}</p><p className="text-xl font-semibold">{value}</p></div>)}</div>
  <p className="text-xs text-slate-500">New agent emails are copied to Sent after the mail server accepts them. Pending copies retry separately without sending another email. Earlier messages are not included in these copy counts.</p>
  <h3 className="font-medium">Latest inbox messages</h3>
  {inbox.status==='rejected'?<p className="text-sm text-amber-800">Inbox preview is unavailable. Open Hostinger Inbox to check your messages.</p>:inbox.value.length===0?<p className="text-sm text-slate-500">No inbox messages.</p>:<ul className="divide-y">{inbox.value.map(m=><li key={m.uid} className="py-3"><p className="font-medium break-words">{m.subject||'(No subject)'}</p><p className="text-xs text-slate-500 break-words">{m.from?.address||'Unknown sender'} · {new Date(m.date).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST</p></li>)}</ul>}
  <p className="text-xs text-slate-500">Preview does not mark messages as read. Refresh this page for the latest messages.</p>
 </section>;
}
