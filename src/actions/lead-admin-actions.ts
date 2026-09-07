'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateLeadStatusAction(
  leadId: string,
  newStatus: string
): Promise<{ success: boolean; message: string }> {
  if (!leadId || !newStatus) {
    return { success: false, message: 'Invalid lead ID or status.' };
  }

  const validStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, message: 'Invalid status value.' };
  }

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: newStatus as 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'LOST' },
    });

    revalidatePath('/admin/leads');
    revalidatePath('/admin');

    return { success: true, message: `Status updated to ${newStatus}` };
  } catch (error) {
    console.error('[ADMIN] Failed to update lead status:', error);
    return { success: false, message: 'Failed to update lead status. Please try again.' };
  }
}
