import * as React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TeamManagementClient } from './team-client';

export const dynamic = 'force-dynamic';

export default async function TeamManagementPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  if (session.role !== 'ADMIN') redirect('/admin');

  let members: Array<{
    id: string;
    name: string | null;
    email: string;
    role: 'ADMIN' | 'EDITOR' | 'VIEWER';
    title: string | null;
    pendingInvite: boolean;
    createdAt: Date;
  }> = [];

  try {
    const rows = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, title: true, passwordHash: true, createdAt: true },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    });
    members = rows.map(({passwordHash,...member})=>({...member,pendingInvite:passwordHash.startsWith('INVITE:')}));
  } catch (err) {
    console.error('[TEAM PAGE] Failed to load members:', err);
  }

  return <TeamManagementClient members={members} currentUserId={session.id} />;
}
