'use server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { head } from '@vercel/blob';
import { revalidatePath, revalidateTag } from 'next/cache';
export async function saveFounderPhoto(url: string) {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') return { success: false, message: 'Only an administrator can change this photo.' };
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.public.blob.vercel-storage.com') || !parsed.pathname.startsWith('/founder-media/') || parsed.search || parsed.hash) throw new Error('Invalid image');
    const blob = await head(url);
    if (!['image/jpeg','image/png','image/webp'].includes(blob.contentType) || blob.size > 10 * 1024 * 1024 || !blob.pathname.startsWith('founder-media/')) throw new Error('Invalid image');
    const settings = await prisma.siteSettings.findFirst({ orderBy: { createdAt: 'asc' }, select: { id: true } });
    if (settings) await prisma.siteSettings.update({ where: { id: settings.id }, data: { founderImageUrl: url } });
    else await prisma.siteSettings.create({ data: { founderImageUrl: url } });
    revalidateTag('founder-photo');
    revalidatePath('/about'); revalidatePath('/admin/about');
    return { success: true, message: 'Photo saved. Your About page now uses this image.' };
  } catch { return { success: false, message: 'Could not save this photo. Upload a JPG, PNG or WebP image and try again.' }; }
}
