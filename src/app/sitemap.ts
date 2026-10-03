import { MetadataRoute } from 'next';
import { BLOG_POSTS_SEED } from '@/data/blog-seed-data';
import { CASE_STUDIES } from '@/data/case-studies-data';
import { CITIES_DATA } from '@/data/city-data';
import { SERVICES_DATA } from '@/data/services-data';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gravityforai.com';

  // Core static marketing pages with verified historical first-published dates
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date('2026-09-07T00:00:00.000Z'),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date('2026-09-09T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/locations`,
      lastModified: new Date('2026-09-09T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/locations/punjab-regional`,
      lastModified: new Date('2026-09-11T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/locations/india-remote`,
      lastModified: new Date('2026-09-11T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    {
      url: `${baseUrl}/locations/united-states`,
      lastModified: new Date('2026-09-11T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    {
      url: `${baseUrl}/locations/europe`,
      lastModified: new Date('2026-09-11T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    {
      url: `${baseUrl}/lp`,
      lastModified: new Date('2026-09-14T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lp/real-estate`,
      lastModified: new Date('2026-09-14T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/lp/clinics`,
      lastModified: new Date('2026-09-14T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/lp/immigration`,
      lastModified: new Date('2026-09-14T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date('2026-09-07T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2026-09-07T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date('2026-09-07T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date('2026-09-07T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date('2026-09-07T00:00:00.000Z'),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date('2026-09-19T00:00:00.000Z'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date('2026-09-07T00:00:00.000Z'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date('2026-09-07T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Service landing pages
  const servicePages: MetadataRoute.Sitemap = Object.keys(SERVICES_DATA).map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: new Date('2026-09-07T00:00:00.000Z'),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Localized city pages
  const cityPages: MetadataRoute.Sitemap = Object.keys(CITIES_DATA).map((city) => ({
    url: `${baseUrl}/locations/${city}`,
    lastModified: new Date('2026-09-07T00:00:00.000Z'),
    changeFrequency: 'weekly',
    priority: city === 'mansa' ? 0.9 : 0.8,
  }));

  // Case study pages
  const caseStudyPages: MetadataRoute.Sitemap = CASE_STUDIES.map((study) => ({
    url: `${baseUrl}/case-studies/${study.slug}`,
    lastModified: new Date('2026-09-07T00:00:00.000Z'),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Unified Blog Posts: Merge seed posts with published database posts, deduplicated by slug
  const postMap = new Map<string, { slug: string; lastModified: Date }>();

  for (const post of BLOG_POSTS_SEED) {
    postMap.set(post.slug, {
      slug: post.slug,
      lastModified: new Date(post.publishedAt),
    });
  }

  try {
    const dbPosts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, publishedAt: true, updatedAt: true },
    });

    for (const post of dbPosts) {
      const lastModified = post.publishedAt || post.updatedAt || new Date('2026-09-07T00:00:00.000Z');
      postMap.set(post.slug, {
        slug: post.slug,
        lastModified: new Date(lastModified),
      });
    }
  } catch (error) {
    console.error('Failed to query published posts for sitemap, falling back to seed posts:', error);
  }

  const allPosts = Array.from(postMap.values());

  // Canonical Blog Pages
  const blogPages: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // AMP Blog Pages
  const ampBlogPages: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `${baseUrl}/amp/blog/${post.slug}`,
    lastModified: post.lastModified,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...servicePages,
    ...cityPages,
    ...caseStudyPages,
    ...blogPages,
    ...ampBlogPages,
  ];
}
