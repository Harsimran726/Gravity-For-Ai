'use server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { readSequence, resolveSteps } from '@/lib/outreach-sequence';
import { revalidatePath } from 'next/cache';
const Input = z.object({
  id: z.string().min(1), expectedUpdatedAt: z.string().datetime(),
  name: z.string().trim().min(1).max(150), dailyLimit: z.number().int().min(1).max(100),
  scope: z.enum(['DEFAULTS', 'REPLACE']), sequence: z.unknown(),
});
export async function editOutreachCampaign(input: unknown): Promise<{success:boolean;message:string}> {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') return { success:false, message:'Please sign in as an administrator.' };
  const parsed = Input.safeParse(input);
  if (!parsed.success) return { success:false, message:'Enter a campaign name and a daily limit from 1 to 100.' };
  const data = parsed.data;
  let sequence;
  try { sequence = readSequence(data.sequence); if (!sequence) throw Error('Add a first email.'); }
  catch { return { success:false, message:'Use day 0 first, increasing follow-up days, subjects up to 200 characters and messages up to 10,000 characters.' }; }
  try {
    const result = await prisma.$transaction(async tx => {
      // Share the worker lock: a save cannot race an in-flight dispatch using old content.
      await tx.outreachMailbox.upsert({where:{id:'primary'},create:{id:'primary'},update:{}});
      const now = new Date(), token = randomUUID();
      const lock = await tx.outreachMailbox.updateMany({where:{id:'primary',OR:[{lockUntil:null},{lockUntil:{lt:now}}]},data:{lockToken:token,lockUntil:new Date(now.getTime()+300000)}});
      if (!lock.count) return {success:false,message:'An email worker is running. Nothing changed. Wait a moment and save again.'};
      try {
        const campaign = await tx.outreachCampaign.findUnique({where:{id:data.id},include:{prospects:true}});
        if (!campaign) return {success:false,message:'Campaign not found.'};
        if (campaign.updatedAt.toISOString() !== data.expectedUpdatedAt) return {success:false,message:'This campaign changed since you opened it. Reload the editor before saving.'};
        if (sequence.steps.length !== resolveSteps(campaign).length) return {success:false,message:'Keep the existing number and order of emails so sending history stays intact.'};
        for (const recipient of campaign.prospects) {
          const steps = resolveSteps({sequence}, data.scope === 'REPLACE' ? {} : recipient);
          if (steps.some(step => !step.subject.trim() || !step.body.trim())) return {success:false,message:'Every recipient needs a subject and message at each step. Add defaults for any empty fields.'};
        }
        if (data.scope === 'REPLACE' && sequence.steps.some(step => !step.subject.trim() || !step.body.trim())) return {success:false,message:'Fill every subject and message before replacing personalised emails.'};
        await tx.outreachCampaign.update({where:{id:data.id},data:{name:data.name,dailyLimit:data.dailyLimit,sequence:JSON.parse(JSON.stringify(sequence)),subject:sequence.steps[0].subject,body:sequence.steps[0].body}});
        if (data.scope === 'REPLACE') await tx.outreachProspect.updateMany({where:{campaignId:data.id},data:{customSubject:null,customBody:null,sequenceMessages:Prisma.DbNull}});
        await tx.auditLog.create({data:{userId:session.id,action:'OUTREACH_CAMPAIGN_EDIT',entityType:'OUTREACH',details:JSON.stringify({campaignId:data.id,dailyLimit:data.dailyLimit,scope:data.scope,days:sequence.steps.map(step=>step.day)})}});
        return {success:true,message:'Campaign saved. Changes apply to future emails only. Sending history, recipient permissions and campaign status are unchanged.'};
      } finally {
        await tx.outreachMailbox.updateMany({where:{id:'primary',lockToken:token},data:{lockToken:null,lockUntil:null}});
      }
    }, {timeout:15000});
    if(result.success) revalidatePath('/admin/outreach','layout');
    return result;
  } catch { return {success:false,message:'Could not save the campaign. No partial changes were applied. Please try again.'}; }
}
