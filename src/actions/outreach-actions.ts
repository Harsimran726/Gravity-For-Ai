'use server';
import {z} from 'zod';
import {prisma} from '@/lib/prisma';
import {getAdminSession} from '@/lib/auth';
import {revalidatePath} from 'next/cache';
import {dueStep,istDayStart} from '@/lib/outreach-policy';
import {outreachConfiguration,stopAddress,syncOutreachInbox} from '@/lib/outreach-engine';
export type {ParsedProspect} from '@/lib/csv-parser';
export type OutreachActionState={success?:boolean;message?:string;campaignId?:string;errors?:Record<string,string[]>};
async function admin(){const s=await getAdminSession();if(!s||s.role!=='ADMIN')throw new Error('Unauthorized');return s;}
function refresh(){revalidatePath('/admin/outreach','layout');}
const Prospect=z.object({name:z.string().trim().max(200).default('there'),email:z.string().trim().toLowerCase().email().max(320),company:z.string().max(300).optional(),customSubject:z.string().max(200).optional(),customBody:z.string().max(10000).optional()});
export async function createCampaignAction(_:OutreachActionState,form:FormData):Promise<OutreachActionState>{
 const session=await admin();
 const parsed=z.object({name:z.string().trim().min(1).max(150),subject:z.string().trim().min(1).max(200),body:z.string().min(20).max(10000),dailyLimit:z.coerce.number().int().min(1).max(100),purpose:z.enum(['CAMPAIGN','TEST']),followup1Body:z.string().max(10000),followup2Body:z.string().max(10000)}).safeParse(Object.fromEntries(['name','subject','body','dailyLimit','purpose','followup1Body','followup2Body'].map(k=>[k,form.get(k)|| (k==='purpose'?'CAMPAIGN':'')])));
 if(!parsed.success)return {success:false,message:'Check the campaign fields.',errors:parsed.error.flatten().fieldErrors};
 if(parsed.data.followup2Body&&!parsed.data.followup1Body)return {success:false,message:'Add the first follow-up before a second follow-up.'};
 const json=String(form.get('prospectsJson')||'[]');if(json.length>5_000_000)return {success:false,message:'Import is too large.'};
 let rows:z.infer<typeof Prospect>[];
 try{rows=z.array(Prospect).min(1).max(5000).parse(JSON.parse(json));}catch{return {success:false,message:'Upload 1–5,000 valid prospects with email addresses.'};}
 const unique=Array.from(new Map(rows.map(p=>[p.email,p])).values());
 const blocked=await prisma.outreachSuppression.findMany({where:{email:{in:unique.map(p=>p.email)}}});const blockedSet=new Set(blocked.map(p=>p.email));
 const campaign=await prisma.outreachCampaign.create({data:{...parsed.data,followup1Body:parsed.data.followup1Body||null,followup2Body:parsed.data.followup2Body||null,createdById:session.id,prospects:{create:unique.map(p=>({...p,name:p.name||'there',status:blockedSet.has(p.email)?'SKIPPED':'PENDING'}))}}});
 refresh();return {success:true,campaignId:campaign.id,message:`Imported ${unique.length} unique records; ${blocked.length} suppressed. Nothing sent.`};
}
export async function updateProspectStatusAction(ids:string[],status:'SELECTED'|'PENDING'):Promise<OutreachActionState>{
 await admin();if(!['SELECTED','PENDING'].includes(status)||ids.length>5000)return {success:false,message:'Invalid selection'};
 await prisma.outreachProspect.updateMany({where:{id:{in:ids},status:{in:['PENDING','SELECTED']}},data:{status}});refresh();return {success:true};
}
export async function approveProspectsAction(ids:string[],note:string):Promise<OutreachActionState>{
 const session=await admin();if(note.trim().length<10||note.length>1000||!ids.length||ids.length>5000)return {success:false,message:'Provide a permission/source note of 10–1,000 characters and select recipients.'};
 await prisma.$transaction(async tx=>{
 await tx.outreachProspect.updateMany({where:{id:{in:ids},status:{in:['PENDING','SELECTED']}},data:{permissionGranted:true,permissionNote:note.trim()}});
 await tx.auditLog.create({data:{userId:session.id,action:'OUTREACH_PERMISSION',entityType:'OUTREACH',details:JSON.stringify({ids,note:note.trim()})}});
 });refresh();return {success:true,message:'Permission recorded. Review the message before activating.'};
}
export async function updateCampaignStatusAction(id:string,status:'ACTIVE'|'PAUSED'|'COMPLETED'):Promise<OutreachActionState>{
 await admin();if(!['ACTIVE','PAUSED','COMPLETED'].includes(status))return {success:false,message:'Invalid status'};
 if(status==='ACTIVE'){
 const c=outreachConfiguration();if(!c.enabled||c.missing.length)return {success:false,message:!c.enabled?'Sending disabled in server settings.':`Setup needed: ${c.missing.join(', ')}`};
 if(!await prisma.outreachProspect.count({where:{campaignId:id,status:{in:['SELECTED','SENT']},permissionGranted:true}}))return {success:false,message:'Select recipients and record permission first.'};
 }
 await prisma.outreachCampaign.update({where:{id},data:{status,automationEnabled:status==='ACTIVE'}});refresh();return {success:true,message:status==='ACTIVE'?'Active: the scheduled worker will process eligible recipients.':'Campaign paused/completed. An already accepted in-flight email cannot be recalled.'};
}
export async function deleteCampaignAction(id:string):Promise<OutreachActionState>{
 await admin();const count=await prisma.outreachMessage.count({where:{campaignId:id}});
 if(count)return {success:false,message:'Campaigns with dispatch history cannot be deleted. Mark completed instead.'};
 await prisma.outreachCampaign.delete({where:{id}});refresh();return {success:true};
}
export async function markOutreachResponseAction(id:string,status:'REPLIED'|'UNSUBSCRIBED'|'BOUNCED'):Promise<OutreachActionState>{
 await admin();if(!['REPLIED','UNSUBSCRIBED','BOUNCED'].includes(status))return {success:false,message:'Invalid response'};
 const p=await prisma.outreachProspect.findUniqueOrThrow({where:{id}});await stopAddress(p.email,status,'Recorded by administrator');refresh();return {success:true};
}
export async function syncOutreachAction():Promise<OutreachActionState>{await admin();try{const n=await syncOutreachInbox();refresh();return {success:true,message:`Inbox checked; ${n} new responding contacts stopped.`};}catch(e){return {success:false,message:e instanceof Error?e.message:'Inbox check failed'};}}
export async function getOutreachAnalytics(session?:Awaited<ReturnType<typeof getAdminSession>>){
 const s=session||await getAdminSession();
 if(!s) throw new Error('Unauthorized');
 const now=new Date(),start=istDayStart(now);
 const data=await prisma.outreachCampaign.findMany({include:{prospects:{include:{messages:true}},messages:true},orderBy:{createdAt:'desc'}});
 const campaigns=data.map(c=>{
 const accepted=c.messages.filter(m=>m.status==='ACCEPTED');
 const legacy=c.prospects.filter(p=>p.sentAt&&!p.messages.some(m=>m.step===0));
 const sentToday=accepted.filter(m=>m.sentAt&&m.sentAt>=start).length+legacy.filter(p=>p.sentAt!>=start).length;
 return {id:c.id,name:c.name,status:c.status,purpose:c.purpose,dailyLimit:c.dailyLimit,createdAt:c.createdAt,totalSent:accepted.length+legacy.length,sentToday,totalFailed:c.messages.filter(m=>m.status==='UNKNOWN'||m.status==='CLAIMED').length,totalProspects:c.prospects.length,replies:c.prospects.filter(p=>p.repliedAt).length,followup1:c.prospects.filter(p=>dueStep(p,p.messages,c,now)===1).length,followup2:c.prospects.filter(p=>dueStep(p,p.messages,c,now)===2).length};
 });
 const normal=campaigns.filter(c=>c.purpose!=='TEST');
 const total=(key:'totalSent'|'sentToday'|'totalFailed'|'totalProspects'|'replies'|'followup1'|'followup2')=>normal.reduce((n,c)=>n+c[key],0);
 const mailbox=await prisma.outreachMailbox.findUnique({where:{id:'primary'}});
 return {campaigns,totalSent:total('totalSent'),sentToday:total('sentToday'),previousSent:total('totalSent')-total('sentToday'),totalFailed:total('totalFailed'),totalProspects:total('totalProspects'),replies:total('replies'),followup1:total('followup1'),followup2:total('followup2'),testSent:campaigns.filter(c=>c.purpose==='TEST').reduce((n,c)=>n+c.totalSent,0),mailbox,configuration:outreachConfiguration()};
}
