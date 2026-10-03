'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { parseCSV } from '@/lib/csv-parser';
export type { ParsedProspect } from '@/lib/csv-parser';

export type OutreachActionState = {
  success?: boolean;
  message?: string;
  campaignId?: string;
  errors?: Record<string, string[]>;
};

// ─── Schema ───────────────────────────────────────────────────────────────────
const CampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  subject: z.string().min(1, 'Subject line is required'),
  body: z.string().min(20, 'Email body must be at least 20 characters'),
  dailyLimit: z.coerce.number().int().min(1).max(500).default(100),
});

// ─── ACTION 1: Create Campaign ────────────────────────────────────────────────
export async function createCampaignAction(
  prevState: OutreachActionState,
  formData: FormData
): Promise<OutreachActionState> {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') return { success: false, message: 'Unauthorized.' };

  const raw = {
    name: String(formData.get('name') || ''),
    subject: String(formData.get('subject') || ''),
    body: String(formData.get('body') || ''),
    dailyLimit: Number(formData.get('dailyLimit') || 100),
  };
  const validated = CampaignSchema.safeParse(raw);
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors, message: 'Please fix the errors below.' };
  }

  // Client sends pre-parsed prospects as JSON (handles both CSV and Excel)
  const prospectsJson = String(formData.get('prospectsJson') || '[]');
  let prospects: Array<{ name: string; email: string; company?: string; customSubject?: string; customBody?: string }> = [];
  try {
    prospects = JSON.parse(prospectsJson);
  } catch {
    return { success: false, message: 'Failed to parse prospect data. Please re-upload your file.' };
  }

  if (!prospects.length) return { success: false, message: 'Please upload a CSV or Excel file with at least one valid prospect.' };

  try {
    const campaign = await prisma.outreachCampaign.create({
      data: {
        ...validated.data,
        createdById: session.id,
        prospects: {
          create: prospects.map((p) => ({
            name: p.name,
            email: p.email,
            company: p.company ?? undefined,
            customSubject: p.customSubject ?? undefined,
            customBody: p.customBody ?? undefined,
            status: 'PENDING',
          })),
        },
      },
    });

    revalidatePath('/admin/outreach');
    return {
      success: true,
      message: `Campaign created with ${prospects.length} prospects.`,
      campaignId: campaign.id,
    };
  } catch (err) {
    console.error('[OUTREACH] Create campaign error:', err);
    return { success: false, message: 'Failed to create campaign. Please try again.' };
  }
}

// ─── ACTION 2: Update Prospect Status (bulk select / deselect) ────────────────
export async function updateProspectStatusAction(
  prospectIds: string[],
  status: 'SELECTED' | 'PENDING'
): Promise<OutreachActionState> {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') return { success: false, message: 'Unauthorized.' };

  try {
    await prisma.outreachProspect.updateMany({
      where: { id: { in: prospectIds }, status: { in: ['PENDING', 'SELECTED'] } },
      data: { status },
    });
    return { success: true };
  } catch {
    return { success: false, message: 'Failed to update selection.' };
  }
}

// ─── ACTION 3: Update Campaign Status ─────────────────────────────────────────
export async function updateCampaignStatusAction(
  campaignId: string,
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
): Promise<OutreachActionState> {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') return { success: false, message: 'Unauthorized.' };

  try {
    await prisma.outreachCampaign.update({
      where: { id: campaignId },
      data: { status },
    });
    revalidatePath(`/admin/outreach/${campaignId}`);
    return { success: true };
  } catch {
    return { success: false, message: 'Failed to update campaign status.' };
  }
}

// ─── ACTION 4: Delete Campaign ────────────────────────────────────────────────
export async function deleteCampaignAction(campaignId: string): Promise<OutreachActionState> {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') return { success: false, message: 'Unauthorized.' };

  try {
    await prisma.outreachCampaign.delete({ where: { id: campaignId } });
    revalidatePath('/admin/outreach');
    return { success: true, message: 'Campaign deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete campaign.' };
  }
}

// ─── ACTION 5: Get Overall Analytics ─────────────────────────────────────────
export async function getOutreachAnalytics() {
  const [campaigns, totalSentAgg, totalProspectsAgg] = await Promise.all([
    prisma.outreachCampaign.findMany({ select: { id: true, name: true, status: true, totalSent: true, totalFailed: true, sentToday: true, dailyLimit: true, createdAt: true }, orderBy: { createdAt: 'desc' } }),
    prisma.outreachCampaign.aggregate({ _sum: { totalSent: true, sentToday: true, totalFailed: true } }),
    prisma.outreachProspect.count(),
  ]);

  return {
    campaigns,
    totalSent: totalSentAgg._sum.totalSent ?? 0,
    sentToday: totalSentAgg._sum.sentToday ?? 0,
    totalFailed: totalSentAgg._sum.totalFailed ?? 0,
    totalProspects: totalProspectsAgg,
  };
}
