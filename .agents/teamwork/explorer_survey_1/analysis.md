# Technical SEO Analysis Report: R1 (Sitemap), R4 (Schema.org), and R5 (Robots.txt)

**Agent**: `explorer_survey_1`  
**Date**: 2026-10-02  
**Target Codebase**: Gravity For AI (`C:\Data\Gravity For Ai\Wesbite V2`)  
**Scope**: Technical SEO Infrastructure Investigation (Requirements R1, R4, R5)

---

## 1. Executive Summary

A comprehensive investigation of the Gravity For AI Next.js 14 codebase was conducted to diagnose root causes behind 26 of 36 public pages failing to index in Google Search Console. 

The primary findings confirm:
1. **R1 (`src/app/sitemap.ts`)**: The sitemap is currently synchronous, hardcodes `lastModified: now` (`new Date()`) across all 19 static marketing pages, 3 services, 5 city pages, and 3 case studies on every build/request. Google crawlers detect perpetually changing timestamps without content modifications and throttle crawl budgets. Furthermore, AMP routes (`/amp/blog/[slug]`) are completely absent from the sitemap despite existing as static routes in the application, and the sitemap does not query DB-backed blog posts from Prisma. Total public URLs stand at **36** (33 standard + 3 AMP), strictly below the 50-URL threshold; thus, no sitemap index split is needed.
2. **R4 (`src/app/layout.tsx`)**: The root JSON-LD structured data currently uses single string `@type: 'LocalBusiness'` and omits geographical entity markers (`geo` GeoCoordinates for Mansa HQ, `hasMap`) as well as business operating hours (`openingHoursSpecification`), limiting local 3-pack and AI answer engine (AEO/GEO) indexing.
3. **R5 (`src/app/robots.ts`)**: Line 31 contains `host: 'https://gravityforai.com'`, a directive deprecated by Google and modern crawlers, which can generate crawler warnings.

---

## 2. Requirement R1: Sitemap Architecture & Fix Strategy

### 2.1 Current Implementation Audit (`src/app/sitemap.ts`)
- **File Path**: `src/app/sitemap.ts` (169 lines)
- **Current Signature**: `export default function sitemap(): MetadataRoute.Sitemap` (Synchronous)
- **Observed Behavior**:
  - Line 9 instantiates `const now = new Date();`.
  - Lines 12–127 map 19 core marketing and static location/LP pages with `lastModified: now`.
  - Lines 130–135 map 3 service landing pages (`SERVICES_DATA`) with `lastModified: now`.
  - Lines 138–143 map 5 localized city pages (`CITIES_DATA`) with `lastModified: now`.
  - Lines 146–151 map 3 case studies (`CASE_STUDIES`) with `lastModified: now`.
  - Lines 154–159 map 3 blog seed posts (`BLOG_POSTS_SEED`) with `lastModified: new Date(post.publishedAt)`.
  - Missing: Zero entries for `/amp/blog/[slug]`.
  - Missing: Zero integration with Prisma database.

### 2.2 Historical Publication Dates for Static Pages
Using Git commit telemetry (`git log`), precise initial publication dates were established for each static route. Setting deterministic, historical publication dates prevents search engine crawl throttling:

| Route URL | Git Commit Date / Origin | Recommended `lastModified` | Change Frequency | Priority |
| :--- | :--- | :--- | :--- | :--- |
| `/` | 2026-09-07 (Initial launch commit) | `2026-09-07T00:00:00.000Z` | daily | 1.0 |
| `/services` | 2026-09-09 (Nav & hubs commit) | `2026-09-09T00:00:00.000Z` | weekly | 0.9 |
| `/services/ai-voice-agents` | 2026-09-07 (Initial launch) | `2026-09-07T00:00:00.000Z` | weekly | 0.9 |
| `/services/website-development`| 2026-09-07 (Initial launch) | `2026-09-07T00:00:00.000Z` | weekly | 0.9 |
| `/services/agentic-ai-systems` | 2026-09-07 (Initial launch) | `2026-09-07T00:00:00.000Z` | weekly | 0.9 |
| `/locations` | 2026-09-09 (Nav & hubs commit) | `2026-09-09T00:00:00.000Z` | weekly | 0.9 |
| `/locations/mansa` | 2026-09-07 (HQ launch) | `2026-09-07T00:00:00.000Z` | weekly | 0.9 |
| `/locations/bathinda` | 2026-09-07 (City hubs launch) | `2026-09-07T00:00:00.000Z` | weekly | 0.8 |
| `/locations/chandigarh` | 2026-09-07 (City hubs launch) | `2026-09-07T00:00:00.000Z` | weekly | 0.8 |
| `/locations/ludhiana` | 2026-09-07 (City hubs launch) | `2026-09-07T00:00:00.000Z` | weekly | 0.8 |
| `/locations/delhi` | 2026-09-07 (City hubs launch) | `2026-09-07T00:00:00.000Z` | weekly | 0.8 |
| `/locations/punjab-regional` | 2026-09-11 (Hub consolidation) | `2026-09-11T00:00:00.000Z` | monthly | 0.75 |
| `/locations/india-remote` | 2026-09-11 (Hub consolidation) | `2026-09-11T00:00:00.000Z` | monthly | 0.65 |
| `/locations/united-states` | 2026-09-11 (Hub consolidation) | `2026-09-11T00:00:00.000Z` | monthly | 0.65 |
| `/locations/europe` | 2026-09-11 (Hub consolidation) | `2026-09-11T00:00:00.000Z` | monthly | 0.65 |
| `/lp` | 2026-09-14 (Landing pages launch) | `2026-09-14T00:00:00.000Z` | weekly | 0.8 |
| `/lp/real-estate` | 2026-09-14 (Niche LP launch) | `2026-09-14T00:00:00.000Z` | weekly | 0.85 |
| `/lp/clinics` | 2026-09-14 (Niche LP launch) | `2026-09-14T00:00:00.000Z` | weekly | 0.85 |
| `/lp/immigration` | 2026-09-14 (Niche LP launch) | `2026-09-14T00:00:00.000Z` | weekly | 0.85 |
| `/pricing` | 2026-09-07 (Initial launch) | `2026-09-07T00:00:00.000Z` | weekly | 0.8 |
| `/about` | 2026-09-07 (Initial launch) | `2026-09-07T00:00:00.000Z` | monthly | 0.8 |
| `/contact` | 2026-09-07 (Initial launch) | `2026-09-07T00:00:00.000Z` | monthly | 0.9 |
| `/case-studies` | 2026-09-07 (Initial launch) | `2026-09-07T00:00:00.000Z` | weekly | 0.8 |
| `/case-studies/mansa-clinic-ai-receptionist` | 2026-09-07 (Initial launch) | `2026-09-07T00:00:00.000Z` | monthly | 0.7 |
| `/case-studies/bathinda-logistics-dispatch-automation` | 2026-09-07 (Initial launch) | `2026-09-07T00:00:00.000Z` | monthly | 0.7 |
| `/case-studies/ludhiana-exporter-conversion-platform` | 2026-09-07 (Initial launch) | `2026-09-07T00:00:00.000Z` | monthly | 0.7 |
| `/blog` | 2026-09-07 (Initial launch) | `2026-09-07T00:00:00.000Z` | daily | 0.8 |
| `/privacy-policy` | 2026-09-19 (Legal docs commit) | `2026-09-19T00:00:00.000Z` | yearly | 0.3 |
| `/terms-of-service` | 2026-09-07 (Initial launch) | `2026-09-07T00:00:00.000Z` | yearly | 0.3 |
| `/careers` | 2026-09-07 (Initial launch) | `2026-09-07T00:00:00.000Z` | monthly | 0.5 |

### 2.3 Blog Posts & Prisma Database Integration
- **Prisma Schema Verification**:
  - `prisma/schema.prisma` lines 48–80 define model **`BlogPost`** (not `Post`).
  - Fields present on `BlogPost`:
    - `id` (`String` @id @default(cuid()))
    - `title` (`String`)
    - `slug` (`String` @unique)
    - `metaDescription` (`String`)
    - `status` (`PostStatus` enum: `DRAFT`, `SCHEDULED`, `PUBLISHED`, `ARCHIVED`)
    - `publishedAt` (`DateTime?`)
    - `updatedAt` (`DateTime` @updatedAt)
  - Singleton client: `@/lib/prisma.ts` exports `prisma`.
  - Database telemetry: `prisma.blogPost.count()` currently returns `0`.
- **Deduplication & Fallback Logic**:
  - Function signature: `export default async function sitemap(): Promise<MetadataRoute.Sitemap>`.
  - Query: `prisma.blogPost.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, publishedAt: true, updatedAt: true } })`.
  - Resilience: Must wrap Prisma query in a `try...catch` block. If the database is unreachable or offline during build, the sitemap falls back seamlessly to `BLOG_POSTS_SEED`.
  - Deduplication: Seed posts (`BLOG_POSTS_SEED`) are keyed by `slug` in a `Map<string, { slug: string; lastModified: Date }>`. Any DB post with matching slug updates the entry; new DB posts are inserted.

### 2.4 AMP Blog Integration (`/amp/blog/[slug]`)
- **Route Implementation**: `src/app/amp/blog/[slug]/page.tsx` pre-renders AMP HTML pages for each blog post.
- **Sitemap Inclusion**:
  - For each post (from deduplicated seed + DB pool), emit:
    ```ts
    {
      url: `${baseUrl}/amp/blog/${post.slug}`,
      lastModified: post.lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    }
    ```
  - For the 3 seed posts, this contributes exactly 3 URLs:
    1. `/amp/blog/ai-voice-agent-vs-receptionist-cost-india-2026`
    2. `/amp/blog/what-is-agentic-ai-small-business-guide`
    3. `/amp/blog/fast-loading-website-local-seo-punjab`

### 2.5 URL Count Calculation & Sitemap Index Decision
- **Total Public Route Analysis**:
  - Static core marketing & location pages: **19**
  - Dynamic service landing pages (`/services/[slug]`): **3**
  - Dynamic localized city pages (`/locations/[city]`): **5**
  - Dynamic case study pages (`/case-studies/[slug]`): **3**
  - Dynamic blog posts (`/blog/[slug]`): **3** (seed) + N (DB)
  - Dynamic AMP blog posts (`/amp/blog/[slug]`): **3** (seed) + N (DB)
  - Current Total: **36 URLs** (matches the 36 public routes compiled during `npm run build` and reported by Google Search Console).
- **Threshold Assessment**:
  - The requirement specifies splitting into a sitemap index (`sitemap[0].xml`, `sitemap[1].xml`) *only if* total URL count exceeds 50.
  - Since $36 \le 50$, the sitemap must **remain a single file** (`sitemap.ts` returning a flat `MetadataRoute.Sitemap` array).

---

## 3. Requirement R4: Schema.org JSON-LD in Root Layout

### 3.1 Current Implementation Audit (`src/app/layout.tsx`)
- Lines 103–154 define `const jsonLd`:
  - Line 105: `'@type': 'LocalBusiness'`
  - Omits `geo` coordinates
  - Omits `hasMap`
  - Omits `openingHoursSpecification`

### 3.2 Required Enhancements
1. **Dual Type Declaration**:
   - Change `'@type': 'LocalBusiness'` to `'@type': ['LocalBusiness', 'ProfessionalService']`.
2. **GeoCoordinates**:
   - Headquarters coordinates for Mansa, Punjab: `29.9975` latitude, `75.3983` longitude.
   ```ts
   geo: {
     '@type': 'GeoCoordinates',
     latitude: 29.9975,
     longitude: 75.3983,
   },
   ```
3. **Map Link**:
   ```ts
   hasMap: 'https://maps.google.com/?q=Mansa,Punjab,India',
   ```
4. **Opening Hours Specification**:
   - Mon–Sat 09:00–18:00 IST (UTC+5:30):
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
5. **Preservation**: Keep all existing fields untouched (`name`, `legalName`, `alternateName`, `disambiguatingDescription`, `description`, `url`, `email`, `founder`, `sameAs`, `knowsAbout`, `address`, `areaServed`).

---

## 4. Requirement R5: Robots.txt Directive Fix

### 4.1 Current Implementation Audit (`src/app/robots.ts`)
- File lines 30–32:
  ```ts
  sitemap: 'https://gravityforai.com/sitemap.xml',
  host: 'https://gravityforai.com',
  ```
- Line 31 contains `host: 'https://gravityforai.com'`.

### 4.2 Required Fix
- Modern web crawlers (Googlebot, Bingbot, Applebot) have formally deprecated the `Host` directive in `robots.txt`.
- Action: Delete line 31 (`host: 'https://gravityforai.com',`).
- Result:
  ```ts
  return {
    rules: [ ... ],
    sitemap: 'https://gravityforai.com/sitemap.xml',
  };
  ```
- All user-agent rules (including AI/LLM crawlers: `GPTBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, etc.) and admin/API disallows remain fully intact.

---

## 5. Proposed Implementation Code Snippets

### 5.1 Proposed `src/app/sitemap.ts`
```ts
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
```

### 5.2 Proposed `src/app/layout.tsx` (jsonLd Block)
```ts
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'ProfessionalService'],
      name: 'Gravity For AI',
      legalName: 'Gravity For AI',
      alternateName: ['Gravity For AI Mansa', 'Gravity For AI Punjab', 'Gravity For AI India'],
      disambiguatingDescription:
        'Gravity For AI is an AI engineering and automation consultancy based in Mansa, Punjab, India, founded by Harsimran Singh. Specializes in AI voice agents, autonomous agentic workflows, and conversion web platforms. Independent entity distinct from Gravity AI (NYC marketplace).',
      description:
        'Gravity For AI designs, builds, and manages AI voice agents, agentic automation, and websites for local businesses.',
      url: 'https://gravityforai.com',
      email: 'contact@gravityforai.com',
      hasMap: 'https://maps.google.com/?q=Mansa,Punjab,India',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 29.9975,
        longitude: 75.3983,
      },
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
      founder: {
        '@type': 'Person',
        name: 'Harsimran Singh',
        jobTitle: 'Founder & Lead AI Engineer',
        url: 'https://github.com/harsimran726',
        sameAs: [
          'https://www.linkedin.com/in/harsimransinghaiengineer/',
          'https://github.com/harsimran726',
        ],
      },
      sameAs: [
        'https://www.linkedin.com/in/harsimransinghaiengineer/',
        'https://github.com/harsimran726',
      ],
      knowsAbout: [
        'AI Voice Agents',
        'Agentic AI Systems',
        'LLM Workflow Automation',
        'Local Business Automation',
        'Full-Stack Next.js Engineering',
      ],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Mansa',
        addressRegion: 'Punjab',
        postalCode: '151505',
        addressCountry: 'IN',
      },
      areaServed: [
        'Mansa',
        'Bathinda',
        'Ludhiana',
        'Chandigarh Tricity',
        'Punjab',
        'Delhi NCR',
        'India',
        'United States',
        'Europe',
      ],
    };
```

### 5.3 Proposed `src/app/robots.ts`
```ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const disallowedPaths = ['/admin', '/admin/', '/api', '/api/'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowedPaths,
      },
      // Explicit permissions for major AI / LLM search & answer engines (AEO / GEO)
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Applebot',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: '/',
        disallow: disallowedPaths,
      },
    ],
    sitemap: 'https://gravityforai.com/sitemap.xml',
  };
}
```

---

## 6. Implementation Checklist & Verification Gates
1. Verify `sitemap.ts` builds cleanly and serves `/sitemap.xml` with 36 URLs.
2. Confirm no static URLs have dynamic timestamps equal to build time.
3. Verify `/amp/blog/[slug]` entries exist in sitemap XML with priority 0.5.
4. Verify root HTML output contains updated JSON-LD schema with `@type: ["LocalBusiness", "ProfessionalService"]`, `geo`, `hasMap`, and `openingHoursSpecification`.
5. Verify `/robots.txt` output no longer contains `Host:`.
