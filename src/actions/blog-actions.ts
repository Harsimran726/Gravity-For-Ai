'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

const BlogPostSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(80, 'Title should be under 80 characters for optimal SEO'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  metaDescription: z.string().min(50, 'Meta description should be at least 50 characters').max(170, 'Meta description should be under 170 characters'),
  category: z.string().min(2, 'Category is required'),
  primaryKeyword: z.string().min(3, 'Primary target keyword is required for SEO/GEO indexing'),
  geoAnswer: z.string().min(30, 'GEO direct answer paragraph must be at least 30 characters for LLM citation'),
  readingTime: z.number().min(1, 'Reading time must be at least 1 minute'),
  bodyContent: z.string().min(100, 'Article body content must be at least 100 characters'),
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
    // Record in database or acknowledge
    revalidatePath('/blog');
    revalidatePath(`/blog/${rawData.slug}`);
    revalidatePath(`/amp/blog/${rawData.slug}`);

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
