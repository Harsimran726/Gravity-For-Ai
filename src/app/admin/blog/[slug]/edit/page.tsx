import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditBlogClient } from './edit-blog-client';
import { blogRouteCandidates } from '@/lib/blog-slug';
export const dynamic = 'force-dynamic';
export default async function EditBlogPage({ params }: { params: { slug: string } }) {
  // New links use immutable IDs; keep previously shared slug links working.
  const candidates = blogRouteCandidates(params.slug);
  const post = await prisma.blogPost.findFirst({
    where: { OR: [{ id: params.slug }, { slug: { in: candidates } }] },
    include: { category: true },
  });
  if (!post) notFound();
  return <EditBlogClient initialData={post} />;
}
