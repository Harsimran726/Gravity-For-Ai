import { z } from 'zod';
const Message=z.object({uid:z.number(),date:z.string().datetime({offset:true}),subject:z.string().nullable(),from:z.object({address:z.string()}).nullable(),inReplyTo:z.string().nullable(),messageId:z.string().nullable()});
const Page=z.object({data:z.array(Message),pagination:z.object({totalPages:z.number().int().nonnegative()})});
export type InboxMessage=z.infer<typeof Message>;
export async function readHostingerInbox(since:Date):Promise<InboxMessage[]> {
  const token=process.env.HOSTINGER_MAIL_API_TOKEN, mailbox=process.env.HOSTINGER_MAILBOX_ID;
  if(!token||!mailbox) throw new Error('Configure Hostinger inbox API credentials before activating automatic sending.');
  const messages:InboxMessage[]=[];
  const deadline=Date.now()+45000;
  for(let page=1;page<=50;page++) {
    if(Date.now()>=deadline)throw new Error('Inbox check timed out; no email sent. Review inbox coverage.');
    const response=await fetch(`https://api.mail.hostinger.com/api/v1/mailboxes/${encodeURIComponent(mailbox)}/folders/INBOX/messages?page=${page}&perPage=100&sort=-date`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!response.ok) throw new Error(`Hostinger inbox check failed (${response.status}); sending paused for this run.`);
    const data=Page.parse(await response.json());
    if(Date.now()>=deadline)throw new Error('Inbox check timed out; no email sent.');
    messages.push(...data.data.filter(m=>new Date(m.date)>=since));
    if(page>=data.pagination.totalPages || data.data.some(m=>new Date(m.date)<since)) return messages;
  }
  throw new Error('Inbox scan exceeded 5,000 messages; review inbox coverage before sending.');
}
