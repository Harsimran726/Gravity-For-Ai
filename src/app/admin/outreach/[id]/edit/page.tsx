import { notFound, redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readSequence, resolveSteps, type SequenceConfig } from '@/lib/outreach-sequence';
import { CampaignEditor } from './campaign-editor';
export const dynamic = 'force-dynamic';
export default async function Page({params}:{params:{id:string}}) {
  const session=await getAdminSession();
  if(!session) redirect('/admin/login');
  if(session.role!=='ADMIN') redirect('/admin');
  const campaign=await prisma.outreachCampaign.findUnique({where:{id:params.id},include:{prospects:{select:{name:true,email:true,company:true,sequenceMessages:true,customSubject:true,customBody:true}}}});
  if(!campaign) notFound();
  const sequence:SequenceConfig=readSequence(campaign.sequence)||{version:1,dayMode:'BUSINESS',steps:resolveSteps(campaign)};
  return <CampaignEditor campaign={{id:campaign.id,name:campaign.name,dailyLimit:campaign.dailyLimit,status:campaign.status,updatedAt:campaign.updatedAt.toISOString(),sequence}} recipients={campaign.prospects} />;
}
