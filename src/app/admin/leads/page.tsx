import * as React from 'react';
import { prisma } from '@/lib/prisma';
import AdminLeadsClient from './leads-client';

// Server Component - fetches real data from PostgreSQL on every request
export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  let leads: Array<{
    id: string;
    name: string;
    businessName: string | null;
    email: string;
    phone: string | null;
    serviceInterest: string | null;
    message: string | null;
    status: string;
    createdAt: Date;
  }> = [];

  try {
    leads = await prisma.lead.findMany({
      where: {
        // Exclude bookings (they have [BOOKING] prefix) - show only contact form leads
        NOT: {
          serviceInterest: {
            startsWith: '[BOOKING]',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        businessName: true,
        email: true,
        phone: true,
        serviceInterest: true,
        message: true,
        status: true,
        createdAt: true,
      },
    });
  } catch (err) {
    console.error('[ADMIN LEADS] Failed to fetch leads from database:', err);
  }

  // Serialize dates for client component
  const serializedLeads = leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    businessName: lead.businessName ?? '',
    email: lead.email,
    phone: lead.phone ?? '',
    serviceInterest: lead.serviceInterest ?? 'AI Audit',
    message: lead.message ?? '',
    status: lead.status as 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'LOST',
    createdAt: lead.createdAt.toISOString(),
  }));

  return <AdminLeadsClient initialLeads={serializedLeads} />;
}
