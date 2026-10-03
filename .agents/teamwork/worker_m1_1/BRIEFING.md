# BRIEFING — 2026-10-02T11:42:00Z

## Mission
Implement Milestone 1: SEO Core Infrastructure in src/app/sitemap.ts, src/app/robots.ts, and src/app/layout.tsx.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m1_1
- Original parent: 5ba01f6a-efc9-4b5b-a12a-2c326dfd4aa2
- Milestone: Milestone 1 (SEO Core Infrastructure)

## 🔒 Key Constraints
- Exclusive write boundaries: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/layout.tsx`. Do NOT touch any other files.
- DO NOT change any page content, copy, hero text, blog content, testimonials, or UI in `layout.tsx`.
- DO NOT hardcode test results or create dummy/facade implementations.
- In `sitemap.ts`: replace `lastModified: now` with real historical first-published dates for static pages, services, cities, case studies.
- In `sitemap.ts`: make `sitemap()` async, query Prisma `BlogPost` (status === 'PUBLISHED') via `@/lib/prisma` in try/catch, deduplicate with `BLOG_POSTS_SEED` by slug.
- In `sitemap.ts`: include `/amp/blog/[slug]` URLs for all posts with `priority: 0.5` and matching date.
- In `robots.ts`: remove deprecated `host:` directive.
- In `layout.tsx`: update `jsonLd` `@type` to `["LocalBusiness", "ProfessionalService"]`, add Mansa `geo` (29.9975, 75.3983), `hasMap`, and `openingHoursSpecification` for Mon-Sat 09:00-18:00 IST.
- Run `npm run build` and ensure zero errors.

## Current Parent
- Conversation ID: 5ba01f6a-efc9-4b5b-a12a-2c326dfd4aa2
- Updated: 2026-10-02T12:00:39Z

## Task Summary
- **What to build**: Accurate historical sitemap with Prisma DB-backed blog posts and AMP blog entries; clean robots.txt without deprecated host; enriched Schema.org LocalBusiness + ProfessionalService JSON-LD with geo coordinates, map, and opening hours.
- **Success criteria**: Clean compilation with `npm run build`, all 36 public routes correctly reflected in sitemap, no build/deploy-time `now` timestamps for static content, valid JSON-LD structure in layout.
- **Interface contracts**: PROJECT.md § Interface Contracts
- **Code layout**: PROJECT.md § Code Layout

## Key Decisions Made
- Use exact historical dates from analysis.md (Git commit history analysis).
- Fallback safely to `BLOG_POSTS_SEED` if Prisma query fails or returns empty.
- Keep sitemap as a single file because total URLs (36) <= 50.

## Artifact Index
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m1_1\DISPATCH.md` — Task instructions
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m1_1\BRIEFING.md` — Situational awareness
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m1_1\progress.md` — Liveness & step tracking
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m1_1\changes.md` — Detailed changes log
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m1_1\handoff.md` — Milestone handoff report

## Change Tracker
- **Files modified**:
  - `src/app/sitemap.ts`: Replaced `now` with verified historical dates, made async, queried Prisma BlogPost model with fallback to BLOG_POSTS_SEED, added AMP blog URLs with priority 0.5.
  - `src/app/robots.ts`: Removed deprecated `host:` directive.
  - `src/app/layout.tsx`: Updated jsonLd to dual type `["LocalBusiness", "ProfessionalService"]`, added Mansa `geo` coordinates, `hasMap`, and `openingHoursSpecification`.
- **Build status**: PASS (`npm run build` exited with code 0)
- **Pending issues**: None

## Quality Status
- **Build/test result**: PASS (Next.js 14.2.35 production build succeeded with 58/58 static pages generated)
- **Lint status**: Clean (no ESLint or TypeScript errors during build)
- **Tests added/modified**: Verified build compilation and static route generation

## Loaded Skills
(None)
