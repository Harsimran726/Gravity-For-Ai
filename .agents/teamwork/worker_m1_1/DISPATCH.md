# Dispatch: Worker M1 (SEO Core Infrastructure)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objective
Implement Milestone 1: SEO Core Infrastructure changes in `src/app/sitemap.ts`, `src/app/robots.ts`, and `src/app/layout.tsx`.
Read:
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`
- `C:\Data\Gravity For Ai\Wesbite V2\PROJECT.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\explorer_survey_1\analysis.md`

## Exclusive File Ownership
You exclusively own and may edit:
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/app/layout.tsx`
DO NOT edit any other files.

## Specific Requirements
1. `src/app/sitemap.ts`:
   - Export async function `sitemap(): Promise<MetadataRoute.Sitemap>`.
   - Replace `const now = new Date()` on static pages with real historical publication dates (approximate first-published dates per route from explorer report).
   - In blog posts section, query Prisma client `@/lib/prisma` for `prisma.blogPost.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, publishedAt: true, updatedAt: true } })` inside a `try...catch` block.
   - Merge DB posts with `BLOG_POSTS_SEED`, deduplicating by slug using a Map.
   - For every blog post, emit both `/blog/[slug]` and `/amp/blog/[slug]` (with `priority: 0.5` and same `lastModified`).
   - If total URL count <= 50 (currently 36), keep single sitemap file.
2. `src/app/robots.ts`:
   - Remove the deprecated `host:` directive. Keep all crawler user-agent rules and sitemap URL intact.
3. `src/app/layout.tsx`:
   - In `jsonLd`:
     - Update `@type` to `["LocalBusiness", "ProfessionalService"]`.
     - Add `geo: { "@type": "GeoCoordinates", "latitude": 29.9975, "longitude": 75.3983 }`.
     - Add `hasMap: "https://maps.google.com/?q=Mansa,Punjab,India"`.
     - Add `openingHoursSpecification` for Mon–Sat 9:00–18:00 IST (UTC+5:30).
     - Do NOT change any other content or copy in `layout.tsx`.

## Verification
Run `npm run build` to verify there are zero build or TypeScript errors.
Document changes in `changes.md` and deliver `handoff.md` to `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m1_1\handoff.md`.

## 2026-10-02T11:40:04Z
You are the Worker subagent for Milestone 1 (worker_m1_1).
Your working directory is: `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m1_1`
Project root is: `C:\Data\Gravity For Ai\Wesbite V2`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Read:
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`
- `C:\Data\Gravity For Ai\Wesbite V2\PROJECT.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\explorer_survey_1\analysis.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m1_1\DISPATCH.md`

Your exclusive write boundaries:
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/app/layout.tsx`
DO NOT modify any other files. DO NOT modify any page content, copy, hero text, testimonials, or UI in `layout.tsx`.

Execute:
1. `src/app/sitemap.ts`:
   - Replace `lastModified: now` with real historical first-published dates for all static pages, services, cities, case studies (use dates from analysis report).
   - Make `sitemap()` async.
   - Query Prisma `BlogPost` model (`where: { status: 'PUBLISHED' }`) using `@/lib/prisma` inside a try/catch block.
   - Merge DB posts with `BLOG_POSTS_SEED` deduplicating by slug.
   - Include `/amp/blog/[slug]` URLs for all posts with `priority: 0.5` and matching date.
   - If total URLs <= 50, keep single sitemap file.
2. `src/app/robots.ts`:
   - Remove deprecated `host:` directive.
3. `src/app/layout.tsx`:
   - In `jsonLd`, set `@type: ["LocalBusiness", "ProfessionalService"]`.
   - Add Mansa `geo` GeoCoordinates (`latitude: 29.9975`, `longitude: 75.3983`).
   - Add `hasMap: "https://maps.google.com/?q=Mansa,Punjab,India"`.
   - Add `openingHoursSpecification` for Mon-Sat 09:00-18:00 IST.
4. Run `npm run build` and ensure zero errors.
5. Write `changes.md` and `handoff.md` in your working directory.
Report back via send_message when complete.

## 2026-10-02T12:00:39Z
**Context**: Milestone 1 Implementation Verification
**Content**: Your `npm run build` completed with exit code 0 (`✓ Generating static pages (58/58)`). Your background tsx script (task-72) may be awaiting stdin due to Windows powershell newline escaping. Your file changes to `src/app/sitemap.ts`, `src/app/robots.ts`, and `src/app/layout.tsx` look clean.
**Action**: Please finalize your `changes.md` and `handoff.md`, terminate any hanging background task, and send your completion report.
