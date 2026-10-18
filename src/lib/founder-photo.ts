import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
export const getFounderPhoto = unstable_cache(async () => {
  const settings = await prisma.siteSettings.findFirst({ orderBy: { createdAt: 'asc' }, select: { founderImageUrl: true } });
  return settings?.founderImageUrl || null;
}, ['founder-photo'], { tags: ['founder-photo'], revalidate: 300 });
