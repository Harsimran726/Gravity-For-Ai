import {notFound,redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {dueStep} from '@/lib/outreach-policy';
import {CampaignDetailClient} from './campaign-client';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:{id:string}}){
 const s=await getAdminSession();if(!s)redirect('/admin/login');if(s.role!=='ADMIN')redirect('/admin');
 const c=await prisma.outreachCampaign.findUnique({where:{id:params.id},include:{prospects:{include:{messages:true},orderBy:{createdAt:'asc'}}}});if(!c)notFound();
 return <CampaignDetailClient campaign={{id:c.id,name:c.name,status:c.status,subject:c.subject,body:c.body,followup1Body:c.followup1Body,followup2Body:c.followup2Body,purpose:c.purpose,dailyLimit:c.dailyLimit}} initialProspects={c.prospects.map(p=>({id:p.id,name:p.name,email:p.email,company:p.company,status:p.status,permissionGranted:p.permissionGranted,replySubject:p.replySubject,sentAt:p.sentAt?.toISOString()||null,repliedAt:p.repliedAt?.toISOString()||null,due:dueStep(p,p.messages,c,new Date()),attempts:p.messages.map(m=>({step:m.step,status:m.status,sentAt:m.sentAt?.toISOString()||null})),customSubject:p.customSubject,customBody:p.customBody}))}/>;
}
