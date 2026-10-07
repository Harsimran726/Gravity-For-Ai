import nodemailer from 'nodemailer';
import {z} from 'zod';
import {prisma} from '@/lib/prisma';
import {analyseConversation,recapCopy} from '@/lib/callback-recap-analysis';

// Reservation states intentionally prevent re-sending after ambiguous SMTP outcomes.
export async function processCallRecap(id:string){
  const lock=await prisma.aiCallback.updateMany({where:{id,status:'CONNECTED',analysisStatus:'PENDING'},data:{analysisStatus:'PROCESSING',analysisStartedAt:new Date()}});
  if(!lock.count)return;
  const call=await prisma.aiCallback.findUnique({where:{id},include:{lead:true}});
  if(!call)return;
  try{
    const analysis=await analyseConversation(call.transcriptTurns);
    const allowed=!analysis.doNotContact&&!analysis.needsReview&&analysis.needs.length>0;
    const copy=allowed?recapCopy(call.lead.name,analysis):null;
    await prisma.aiCallback.update({where:{id},data:{analysis:analysis,analysisStatus:analysis.doNotContact?'SUPPRESSED':allowed?'CHECKED':'REVIEW',recapStatus:analysis.doNotContact?'SUPPRESSED':allowed?'PENDING':'REVIEW',recapSubject:copy?.subject,recapBody:copy?.body,recapError:allowed?null:analysis.doNotContact?'Caller declined contact or identity could not be confirmed.':'Analysis requires human review; email not sent.'}});
    if(allowed)await sendCallRecap(id);
  }catch(e){await prisma.aiCallback.updateMany({where:{id,analysisStatus:'PROCESSING'},data:{analysisStatus:'REVIEW',recapStatus:'REVIEW',recapError:e instanceof Error&&e.message.startsWith('Analysis service HTTP')?e.message:'Transcript analysis could not be safely completed. Review this call manually.'}});}
}
export async function sendCallRecap(id:string){
  const call=await prisma.aiCallback.findUnique({where:{id},include:{lead:true}});
  if(!call||call.analysisStatus!=='CHECKED'||call.recapStatus!=='PENDING'||!call.recapBody)return;
  if(!z.string().email().safeParse(call.lead.email).success){await prisma.aiCallback.updateMany({where:{id,recapStatus:'PENDING'},data:{recapStatus:'REVIEW',recapError:'No valid original form email.'}});return;}
  const {SMTP_HOST:host,SMTP_USER:user,SMTP_PASS:pass}=process.env;
  if(!host||!user||!pass){await prisma.aiCallback.updateMany({where:{id,recapStatus:'PENDING'},data:{recapStatus:'BLOCKED',recapError:'SMTP configuration missing.'}});return;}
  const reserved=await prisma.aiCallback.updateMany({where:{id,analysisStatus:'CHECKED',recapStatus:'PENDING'},data:{recapStatus:'SENDING',recapError:null}});
  if(!reserved.count)return;
  const port=Number(process.env.SMTP_PORT)||465;
  const transport=nodemailer.createTransport({host,port,secure:port===465,requireTLS:true,auth:{user,pass},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:12000});
  try{
    const result=await transport.sendMail({from:{name:'Gravity For AI',address:process.env.SMTP_FROM||'contact@gravityforai.com'},to:call.lead.email,replyTo:'contact@gravityforai.com',subject:call.recapSubject||'Your Gravity For AI call recap',text:call.recapBody,messageId:'<callback-recap-'+call.id+'@gravityforai.com>'});
    if(!result.accepted?.length){await prisma.aiCallback.updateMany({where:{id,recapStatus:'SENDING'},data:{recapStatus:'REJECTED',recapError:'Mail server did not accept recipient.'}});return;}
    await prisma.aiCallback.updateMany({where:{id,recapStatus:'SENDING'},data:{recapStatus:'SENT',recapSentAt:new Date(),recapError:null}});
  }catch{await prisma.aiCallback.updateMany({where:{id,recapStatus:'SENDING'},data:{recapStatus:'UNKNOWN',recapError:'Email acceptance uncertain. Check Sent mail/provider logs before resending; automatic retry disabled.'}});}finally{transport.close();}
}
export async function safelyProcessCallRecap(id:string){try{await processCallRecap(id);await sendCallRecap(id);}catch{console.error('[CALL RECAP] Processing interrupted; review dashboard.');}}
