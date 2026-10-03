import crypto from 'crypto';
import nodemailer from 'nodemailer';
import {prisma} from './prisma';
import {readHostingerInbox} from './hostinger-inbox';
import {istDayStart,dailyRampLimit,dueStep,normalizeEmail,personalize,EMAIL} from './outreach-policy';
import {unsubscribeToken} from './outreach-security';

export function outreachConfiguration() {
  const missing=['SMTP_HOST','SMTP_USER','SMTP_PASS','HOSTINGER_MAIL_API_TOKEN','HOSTINGER_MAILBOX_ID','OUTREACH_POSTAL_ADDRESS','OUTREACH_PUBLIC_URL','OUTREACH_UNSUBSCRIBE_SECRET','OUTREACH_CRON_SECRET'].filter(k=>!process.env[k]);
  if((process.env.OUTREACH_UNSUBSCRIBE_SECRET?.length||0)<32 && !missing.includes('OUTREACH_UNSUBSCRIBE_SECRET'))missing.push('OUTREACH_UNSUBSCRIBE_SECRET (32+ characters)');
  if((process.env.OUTREACH_CRON_SECRET?.length||0)<32 && !missing.includes('OUTREACH_CRON_SECRET'))missing.push('OUTREACH_CRON_SECRET (32+ characters)');
  const address=process.env.SMTP_FROM||process.env.SMTP_USER||'';
  if(!EMAIL.test(address))missing.push('SMTP_FROM must be a plain email address');
  if(process.env.OUTREACH_PUBLIC_URL && !/^https:\/\//.test(process.env.OUTREACH_PUBLIC_URL))missing.push('OUTREACH_PUBLIC_URL must use HTTPS');
  return {missing,enabled:process.env.OUTREACH_SENDING_ENABLED==='true',address};
}
export async function stopAddress(email:string,status:'REPLIED'|'UNSUBSCRIBED'|'BOUNCED',subject?:string) {
  email=normalizeEmail(email);
  await prisma.$transaction(async tx=>{
    await tx.outreachSuppression.upsert({where:{email},create:{email,reason:status},update:{reason:status}});
    await tx.outreachProspect.updateMany({where:{email},data:{status,replySubject:subject?.slice(0,500),repliedAt:status==='REPLIED'?new Date():undefined}});
  });
}
export async function syncOutreachInbox() {
  const earliest=await prisma.outreachMessage.findFirst({where:{status:'ACCEPTED'},orderBy:{sentAt:'asc'}});
  // Always check connectivity even before the first real send.
  const since=earliest?.sentAt||new Date(Date.now()-86400000);
  const inbound=await readHostingerInbox(since);
  let replies=0;
  for(const m of inbound) {
    const from=normalizeEmail(m.from?.address||'');
    const original=m.inReplyTo ? await prisma.outreachMessage.findUnique({where:{messageId:m.inReplyTo},include:{prospect:true}}):null;
    if(/mailer-daemon|postmaster/i.test(from)) {
      if(original) await stopAddress(original.prospect.email,'BOUNCED',m.subject||'');
      else throw new Error('An unmatched delivery report needs mailbox review. Move reviewed reports out of INBOX before resuming.');
      continue;
    }
    if(!from)continue;
    const prior=await prisma.outreachProspect.findFirst({where:{email:from,sentAt:{lte:new Date(m.date)},status:{in:['SENT','SENDING','FAILED']}}});
    if(prior && (!original || original.prospect.email===from)) {
      // Conservative stop: any response, including auto-replies, needs human review.
      await stopAddress(from,'REPLIED',m.subject||'(no subject)');replies++;
    }
  }
  await prisma.outreachMailbox.upsert({where:{id:'primary'},create:{id:'primary',lastInboxSyncAt:new Date()},update:{lastInboxSyncAt:new Date(),lastError:null}});
  return replies;
}
export async function runOutreachTick(campaignId?:string) {
  const config=outreachConfiguration();
  if(!config.enabled)throw new Error('Sending is disabled. Configure and review the setup before enabling OUTREACH_SENDING_ENABLED.');
  if(config.missing.length)throw new Error(`Missing configuration: ${config.missing.join(', ')}`);
  const now=new Date(),token=crypto.randomUUID();
  await prisma.outreachMailbox.upsert({where:{id:'primary'},create:{id:'primary'},update:{}});
  const claimed=await prisma.outreachMailbox.updateMany({where:{id:'primary',OR:[{lockUntil:null},{lockUntil:{lt:now}}]},data:{lockToken:token,lockUntil:new Date(now.getTime()+300000)}});
  if(!claimed.count)return {message:'Another worker is running.',sent:false};
  try {
    const mailbox=await prisma.outreachMailbox.findUniqueOrThrow({where:{id:'primary'}});
    if(mailbox.nextSendAt && mailbox.nextSendAt>now)return {message:'Waiting for the mailbox sending interval.',sent:false};
    await syncOutreachInbox(); // Fail closed: stale/unavailable inbox must never allow follow-ups.
    const ceiling=Math.max(1,Math.min(100,Number(process.env.OUTREACH_MAILBOX_DAILY_LIMIT)||20));
    const limit=dailyRampLimit(mailbox.rampStartedAt,now,ceiling);
    const attempts=await prisma.outreachMessage.count({where:{createdAt:{gte:istDayStart(now)},status:{in:['CLAIMED','ACCEPTED','UNKNOWN']}}});
    if(attempts>=limit)return {message:`Mailbox daily cap reached (${limit}, IST).`,sent:false};
    const campaigns=await prisma.outreachCampaign.findMany({where:{...(campaignId?{id:campaignId}:{}),status:'ACTIVE',automationEnabled:true},orderBy:[{lastSentAt:'asc'},{createdAt:'asc'}],include:{prospects:{where:{status:{in:['SELECTED','SENT']},permissionGranted:true},include:{messages:true},orderBy:{createdAt:'asc'}}}});
    for(const c of campaigns) {
      const count=await prisma.outreachMessage.count({where:{campaignId:c.id,createdAt:{gte:istDayStart(now)},status:{in:['CLAIMED','ACCEPTED','UNKNOWN']}}});
      if(count>=c.dailyLimit)continue;
      for(const p of c.prospects) {
        const step=dueStep(p,p.messages,c,now);if(step===null)continue;
        if(await prisma.outreachSuppression.findUnique({where:{email:p.email}}))continue;
        const template=step===0?(p.customBody||c.body):step===1?c.followup1Body:c.followup2Body;
        const subject=personalize(p.customSubject||c.subject,p).replace(/[\r\n]/g,' ');
        const link=`${process.env.OUTREACH_PUBLIC_URL!.replace(/\/$/,'')}/api/outreach/unsubscribe?token=${encodeURIComponent(unsubscribeToken(p.id))}`;
        const text=`${personalize(template||'',p)}\n\nGravity For AI\n${process.env.OUTREACH_POSTAL_ADDRESS}\nStop future emails: ${link}`;
        const messageId=`<${crypto.randomUUID()}@${config.address.split('@')[1]}>`;
        const message=await prisma.$transaction(async tx=>{
          const fresh=await tx.outreachCampaign.findUnique({where:{id:c.id}});
          const current=await tx.outreachProspect.findUnique({where:{id:p.id}});
          if(fresh?.status!=='ACTIVE'||!fresh.automationEnabled||!current?.permissionGranted||!['SELECTED','SENT'].includes(current.status)||await tx.outreachSuppression.findUnique({where:{email:p.email}}))return null;
          const m=await tx.outreachMessage.create({data:{campaignId:c.id,prospectId:p.id,step,messageId,status:'CLAIMED'}});
          await tx.outreachMailbox.update({where:{id:'primary'},data:{nextSendAt:new Date(now.getTime()+120000),rampStartedAt:mailbox.rampStartedAt||now}});
          return m;
        });
        if(!message)continue;
        // This unique prospect/step reservation is deliberately never auto-retried.
        try {
          const latest=await prisma.outreachProspect.findUniqueOrThrow({where:{id:p.id}});
          const active=await prisma.outreachCampaign.findUniqueOrThrow({where:{id:c.id}});
          if(active.status!=='ACTIVE'||!active.automationEnabled||!latest.permissionGranted||!['SELECTED','SENT'].includes(latest.status)||await prisma.outreachSuppression.findUnique({where:{email:p.email}})) {
            await prisma.outreachMessage.update({where:{id:message.id},data:{status:'CANCELLED'}});return {message:'Stopped before dispatch.',sent:false};
          }
          const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT)||465,secure:(Number(process.env.SMTP_PORT)||465)===465,requireTLS:true,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},connectionTimeout:15000,greetingTimeout:15000,socketTimeout:20000});
          try {
            const result=await transport.sendMail({from:{name:'Gravity For AI',address:config.address},to:{name:p.name,address:p.email},replyTo:config.address,subject,text,messageId,headers:{'List-Unsubscribe':`<${link}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}});
            if(!result.accepted?.length)throw new Error('SMTP did not accept the recipient.');
          } finally {transport.close();}
          await prisma.$transaction(async tx=>{
            await tx.outreachMessage.update({where:{id:message.id},data:{status:'ACCEPTED',sentAt:new Date()}});
            await tx.outreachProspect.updateMany({where:{id:p.id,status:{in:['SELECTED','SENT']}},data:{status:'SENT',sentAt:p.sentAt||new Date(),error:null}});
            await tx.outreachCampaign.update({where:{id:c.id},data:{totalSent:{increment:1},lastSentAt:new Date()}});
          });
          return {message:`Step ${step} accepted by the mail server.`,sent:true};
        } catch {
          await prisma.outreachMessage.update({where:{id:message.id},data:{status:'UNKNOWN',error:'Dispatch outcome needs manual verification in Hostinger. Do not retry automatically.'}});
          return {message:'Dispatch outcome uncertain. Review Hostinger before taking further action.',sent:false};
        }
      }
    }
    return {message:'No eligible first messages or due follow-ups.',sent:false};
  } catch(error) {
    await prisma.outreachMailbox.update({where:{id:'primary'},data:{lastError:error instanceof Error?error.message:'Worker failed'}});
    throw error;
  } finally {
    await prisma.outreachMailbox.updateMany({where:{id:'primary',lockToken:token},data:{lockToken:null,lockUntil:null}});
  }
}
