# Project: Technical SEO Remediation & Indexing Infrastructure

## Architecture
- Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM (SQLite / PostgreSQL).
- Metadata infrastructure: Next.js native `Metadata` object, `sitemap.ts`, `robots.ts`, JSON-LD in `layout.tsx`.
- Location routes: Dynamic `[city]/page.tsx` pulling from `src/data/city-data.ts`, static aggregate pages (`europe`, `india-remote`, `united-states`, `punjab-regional`, base `/locations`).
- Admin panel: Server Component `src/app/admin/page.tsx` protected by `@/lib/auth` session helper, client cards, API route `src/app/api/admin/request-indexing/route.ts` with RS256 JWT service account token negotiation.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Real Sitemap Dates | Replace `lastModified: now` with meaningful historical publication dates for all static pages, services, cities, case studies | M1 | ORIGINAL_REQUEST §R1 |
| 2 | DB-Backed Posts in Sitemap | Make `sitemap()` async, query Prisma `BlogPost` (status === 'PUBLISHED'), deduplicate with `BLOG_POSTS_SEED` | M1 | ORIGINAL_REQUEST §R1 |
| 3 | AMP Blog Sitemap Entries | Add `/amp/blog/[slug]` URLs with priority 0.5 and matching publication dates | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Robots.txt Deprecated Host Removal | Remove deprecated `host:` directive from `src/app/robots.ts` | M1 | ORIGINAL_REQUEST §R5 |
| 5 | Enhanced Root Schema.org | Set `@type: ["LocalBusiness", "ProfessionalService"]`, add Mansa Punjab `geo` GeoCoordinates, `hasMap`, `openingHoursSpecification` | M1 | ORIGINAL_REQUEST §R4 |
| 6 | Canonical Tags Preservation & Verification | Ensure canonical tags on all static location pages, base `/locations`, `/lp`, and dynamic `[city]` routes point to full URLs without trailing slashes | M2 | ORIGINAL_REQUEST §R2 |
| 7 | Dynamic City GEO Meta Tags | Add `geo.region`, `geo.placename`, `ICBM` to `[city]/page.tsx` metadata using accurate city coordinates | M2 | ORIGINAL_REQUEST §R3 |
| 8 | Static Location GEO Meta Tags | Add `geo.region` and `geo.placename` broad tags to `/locations/europe`, `/locations/india-remote`, `/locations/united-states`, `/locations/punjab-regional`, `/locations` | M2 | ORIGINAL_REQUEST §R3 |
| 9 | Request Indexing API Route | Implement `src/app/api/admin/request-indexing/route.ts` with admin session check and Google Indexing API caller via RS256 JWT | M3 | ORIGINAL_REQUEST §R6 |
| 10 | Admin Indexing UI Card | Add `request-indexing-card.tsx` to `admin/page.tsx` matching navy/gold/cream palette, with graceful setup instructions if env var is missing | M3 | ORIGINAL_REQUEST §R6 |
| 11 | 100% E2E Test Suite & Build Verification | Pass all 4 tiers of E2E verification, execute clean `npm run build`, and prepare commit/push | M4 | ORIGINAL_REQUEST §Acceptance |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | SEO Core Infrastructure | `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/layout.tsx` | none | DONE |
| M2 | Location Pages Canonical & GEO Meta | `src/app/locations/[city]/page.tsx`, `src/app/locations/europe/page.tsx`, `src/app/locations/india-remote/page.tsx`, `src/app/locations/united-states/page.tsx`, `src/app/locations/punjab-regional/page.tsx`, `src/app/locations/page.tsx` | none | DONE |
| M3 | Admin Request Indexing Tool | `src/app/api/admin/request-indexing/route.ts`, `src/app/admin/request-indexing-card.tsx`, `src/app/admin/page.tsx` | none | IN_PROGRESS |
| M4 | Final Milestone: E2E Verification & Build | Full verification against test suite, `npm run build`, git commit and push | M1, M2, M3, E2E | PLANNED |

## Interface Contracts
### `src/app/sitemap.ts`
- Return type: `Promise<MetadataRoute.Sitemap>`
- Items: `{ url: string, lastModified: Date, changeFrequency?: string, priority?: number }`
- Output: 36 total public URLs (19 static + 3 services + 5 cities + 3 case studies + 3 blog + 3 amp blog)

### `src/app/locations/[city]/page.tsx`
- Metadata export: `generateMetadata({ params }: { params: { city: string } }): Promise<Metadata>`
- Returns `alternates: { canonical: ... }` and `other: { 'geo.region': string, 'geo.placename': string, 'ICBM': string }`

### Static Location Pages
- Metadata export: `export const metadata: Metadata = { alternates: { canonical: ... }, other: { 'geo.region': string, 'geo.placename': string } }`

### `src/app/api/admin/request-indexing/route.ts`
- Method: `POST`
- Body: `{ url: string }`
- Auth check: `const session = await getAdminSession(); if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });`
- Response: `{ success: boolean, message?: string, error?: string }`

## Code Layout
- Exclusive Write Boundaries:
  - Milestone 1: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/layout.tsx`
  - Milestone 2: `src/app/locations/**/page.tsx`
  - Milestone 3: `src/app/api/admin/request-indexing/**`, `src/app/admin/request-indexing-card.tsx`, `src/app/admin/page.tsx`
  - E2E Testing Track: `tests/e2e/**` or `scripts/e2e-seo-check.ts`
