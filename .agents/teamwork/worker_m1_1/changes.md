# Milestone 1 Code Changes Log

## Overview
This document logs the exact modifications made for Milestone 1 (SEO Core Infrastructure) covering `src/app/sitemap.ts`, `src/app/robots.ts`, and `src/app/layout.tsx`.

---

## 1. `src/app/sitemap.ts`
### Changes Made:
1. **Async Signature**:
   - Converted function signature from synchronous `export default function sitemap(): MetadataRoute.Sitemap` to `export default async function sitemap(): Promise<MetadataRoute.Sitemap>`.
2. **Historical First-Published Dates**:
   - Replaced dynamic `lastModified: now` (`new Date()`) with verified historical ISO publication dates derived from Git telemetry across all:
     - 19 core marketing and static location/LP pages
     - 3 service landing pages (`SERVICES_DATA`)
     - 5 localized city pages (`CITIES_DATA`)
     - 3 case studies (`CASE_STUDIES`)
3. **Prisma Database Integration & Deduplication**:
   - Imported singleton `prisma` client from `@/lib/prisma`.
   - Seeded `postMap` with `BLOG_POSTS_SEED`.
   - Wrapped database query in a robust `try...catch` block:
     ```ts
     const dbPosts = await prisma.blogPost.findMany({
       where: { status: 'PUBLISHED' },
       select: { slug: true, publishedAt: true, updatedAt: true },
     });
     ```
   - Deduplicated database posts against seed data by `slug`, preferring `publishedAt || updatedAt`.
4. **AMP Blog URLs**:
   - Added `/amp/blog/[slug]` entries for all deduplicated blog posts with `priority: 0.5`, `changeFrequency: 'monthly'`, and matching `lastModified` date.
5. **Single Sitemap File**:
   - Total generated URLs equals 36 (33 canonical + 3 AMP), strictly below the 50-URL threshold. Retained single flat sitemap array.

---

## 2. `src/app/robots.ts`
### Changes Made:
1. **Removed Deprecated Host Directive**:
   - Deleted `host: 'https://gravityforai.com',` which has been deprecated across Googlebot, Bingbot, and modern crawlers.
2. **Preserved Rules & Sitemap**:
   - All disallow paths (`/admin`, `/api`) and explicit permissions for major AI/LLM crawlers (`GPTBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, etc.) remain intact alongside `sitemap: 'https://gravityforai.com/sitemap.xml'`.

---

## 3. `src/app/layout.tsx`
### Changes Made:
1. **Schema.org Dual Type**:
   - Updated `@type` in root `jsonLd` from `'LocalBusiness'` to `['LocalBusiness', 'ProfessionalService']`.
2. **Headquarters GeoCoordinates**:
   - Added Mansa, Punjab GeoCoordinates:
     ```ts
     geo: {
       '@type': 'GeoCoordinates',
       latitude: 29.9975,
       longitude: 75.3983,
     },
     ```
3. **Map Link**:
   - Added `hasMap: 'https://maps.google.com/?q=Mansa,Punjab,India'`.
4. **Operating Hours**:
   - Added `openingHoursSpecification`:
     ```ts
     openingHoursSpecification: [
       {
         '@type': 'OpeningHoursSpecification',
         dayOfWeek: [
           'Monday',
           'Tuesday',
           'Wednesday',
           'Thursday',
           'Friday',
           'Saturday',
         ],
         opens: '09:00',
         closes: '18:00',
       },
     ],
     ```
5. **Zero UI/Content Regressions**:
   - No user-facing text, page layout, fonts, header, or footer components were modified.
