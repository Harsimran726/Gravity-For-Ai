import * as React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CampaignDetailClient } from './campaign-client';

export const dynamic = 'force-dynamic';

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  if (session.role !== 'ADMIN') redirect('/admin');

  const campaign = await prisma.outreachCampaign.findUnique({
    where: { id: params.id },
    include: {
      prospects: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true, name: true, email: true, company: true,
          status: true, sentAt: true, error: true,
        },
      },
    },
  });

  if (!campaign) notFound();

  return (
    <CampaignDetailClient
      campaign={{
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        status: campaign.status,
        dailyLimit: campaign.dailyLimit,
        totalSent: campaign.totalSent,
        totalFailed: campaign.totalFailed,
        sentToday: campaign.sentToday,
        createdAt: campaign.createdAt.toISOString(),
      }}
      initialProspects={campaign.prospects.map((p) => ({
        ...p,
        sentAt: p.sentAt ? p.sentAt.toISOString() : null,
      }))}
    />
  );
}
