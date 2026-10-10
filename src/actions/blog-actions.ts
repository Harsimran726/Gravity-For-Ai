'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const BlogPostSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(80, 'Title should be under 80 characters for optimal SEO'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  metaDescription: z.string().min(50, 'Meta description should be at least 50 characters').max(170, 'Meta description should be under 170 characters'),
  category: z.string().min(2, 'Category is required'),
  primaryKeyword: z.string().min(3, 'Primary target keyword is required for SEO/GEO indexing'),
  geoAnswer: z.string().min(30, 'GEO direct answer paragraph must be at least 30 characters for LLM citation'),
  readingTime: z.number().min(1, 'Reading time must be at least 1 minute'),
  bodyContent: z.string().min(10, 'Article body content must be at least 10 characters'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

export type BlogActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function saveBlogPostAction(
  prevState: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  const session = await getAdminSession();
  if (!session || !['ADMIN', 'EDITOR'].includes(session.role)) {
    return { success: false, message: 'Unauthorized. Please log in.' };
  }

  const status = String(formData.get('status') || 'DRAFT') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  
  const rawData = {
    title: String(formData.get('title') || ''),
    slug: String(formData.get('slug') || ''),
    metaDescription: String(formData.get('metaDescription') || ''),
    category: String(formData.get('category') || ''),
    primaryKeyword: String(formData.get('primaryKeyword') || ''),
    geoAnswer: String(formData.get('geoAnswer') || ''),
    readingTime: Number(formData.get('readingTime') || 5),
    bodyContent: String(formData.get('bodyContent') || ''),
    status,
  };

  // Pre-Publish SEO Validation (Strict enforcement when marking PUBLISHED)
  if (status === 'PUBLISHED') {
    const validated = BlogPostSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
        message: 'Pre-publish SEO check failed. All required SEO & GEO fields must be completed before publishing.',
      };
    }
  }

  try {
    const postData = {
      title: rawData.title,
      slug: rawData.slug,
      metaDescription: rawData.metaDescription,
      canonicalUrl: `https://gravityforai.com/blog/${rawData.slug}`,
      bodyContent: rawData.bodyContent,
      status: rawData.status,
      // Only update publishedAt if it's currently being published and wasn't before, or just keep setting it to now. 
      // A better way is to leave it to DB default or just new Date().
      publishedAt: rawData.status === 'PUBLISHED' ? new Date() : null,
      primaryKeyword: rawData.primaryKeyword,
      geoAnswer: rawData.geoAnswer,
      readingTime: rawData.readingTime,
      author: { connect: { id: session.id } },
      category: rawData.category ? {
        connectOrCreate: {
          where: { name: rawData.category },
          create: {
            name: rawData.category,
            slug: rawData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          }
        }
      } : undefined,
    };

    await prisma.blogPost.upsert({
      where: { slug: rawData.slug },
      update: postData,
      create: postData,
    });

    revalidatePath('/blog');
    revalidatePath(`/blog/${rawData.slug}`);
    revalidatePath(`/amp/blog/${rawData.slug}`);
    revalidatePath('/admin/blog');
    // Also revalidate the homepage or other places where blog posts might be listed
    revalidatePath('/');

    return {
      success: true,
      message: status === 'PUBLISHED' ? 'Article validated and published live!' : 'Article draft saved successfully.',
    };
  } catch (error) {
    console.error('Save blog error:', error);
    return {
      success: false,
      message: 'Failed to save blog post. Please try again.',
    };
  }
}

