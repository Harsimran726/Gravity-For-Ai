import * as React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { NewCampaignClient } from './new-campaign-client';

export const dynamic = 'force-dynamic';

export default async function NewCampaignPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  if (session.role !== 'ADMIN') redirect('/admin');
  return <NewCampaignClient />;
}
