# Original User Request

## Initial Request — 2026-10-02T11:23:17Z

**Gravity For AI** (gravityforai.com, Next.js 14/App Router on Vercel) has 26 of 36 pages not indexed in Google Search Console. The cause has been root-analysed — it's a set of technical SEO issues in the sitemap, canonical tags, missing AMP sitemap entries, and absent GEO meta tags. The team must fix all technical SEO issues to maximise indexing. **Do not change any page content, copy, or UI components** — only fix SEO infrastructure files.

Working directory: `C:\Data\Gravity For Ai\Wesbite V2`

Integrity mode: development

---

## Requirements

### R1. Fix sitemap.ts — Accurate lastModified + AMP entries + DB-backed blog posts

The sitemap at `src/app/sitemap.ts` currently sets `lastModified: now` (current timestamp) for all pages on every deploy, causing Google to throttle crawling.

- Replace `lastModified: now` with real, meaningful dates: hardcode the approximate first-published date per static page (no content change — just the date)
- For blog posts: the `BLOG_POSTS_SEED` array has `publishedAt` — use that (already done for blog pages but not others)
- For DB-backed blog posts (those in the Prisma `Post` table, not seed data): make `sitemap.ts` async and query Prisma for published posts, merging with seed data and deduplicating by slug
- Add AMP blog entries to the sitemap: for each blog post, add the `/amp/blog/[slug]` URL with `priority: 0.5` and the same `lastModified` as the main post
- Split into a sitemap index (`sitemap[0].xml`, `sitemap[1].xml`) only if total URL count exceeds 50, otherwise keep as single file

### R2. Fix canonical tags on all location static pages and LP index

Four static location pages — `/locations/europe`, `/locations/india-remote`, `/locations/united-states`, `/locations/punjab-regional` — are at `src/app/locations/europe/page.tsx` etc. Each must export `metadata` with `alternates.canonical` set to its own full URL.

The `/lp` index page at `src/app/lp/page.tsx` already has a canonical. Verify no trailing-slash duplicate is generated.

The `/locations/[city]/page.tsx` dynamic page already has canonical in `generateMetadata`. No change needed there.

### R3. Add GEO meta tags to all location pages

Location pages currently lack HTML `<meta name="geo.region">`, `<meta name="geo.placename">` and `<meta name="ICBM">` tags. These are important for local SEO and GEO indexing (AI answer engine citations).

For each location page (both dynamic `[city]` and static europe/india-remote/united-states/punjab-regional):
- Add the appropriate geo meta tags inside `generateMetadata` using the Next.js `other` metadata field:
  ```ts
  other: {
    'geo.region': 'IN-PB',        // correct ISO 3166-2 per location
    'geo.placename': 'Mansa, Punjab, India',
    'ICBM': '29.9975, 75.3983',   // lat/lng for the location
  }
  ```
- Use the correct region codes and coordinates per city (look up correct values; do not invent them)
- For europe/US/india-remote pages: use the broad region code only (e.g. `'US'`, `'DE'`, `'IN'`) without city-level ICBM since they're aggregate pages

### R4. Improve Schema.org in root layout — add ProfessionalService type and GEO coordinates

In `src/app/layout.tsx`, the `jsonLd` object uses `@type: LocalBusiness`. Update it to:
- Use `["LocalBusiness", "ProfessionalService"]` as the type array
- Add `geo: { "@type": "GeoCoordinates", "latitude": 29.9975, "longitude": 75.3983 }` — this is the Mansa, Punjab coordinates
- Add `hasMap: "https://maps.google.com/?q=Mansa,Punjab,India"`
- Add `openingHoursSpecification` for Mon–Sat 9:00–18:00 IST (UTC+5:30, so UTC 03:30–12:30)
- Do NOT change any other content in the layout

### R5. Fix robots.ts — remove deprecated `host:` directive

The `host:` directive in `robots.ts` is deprecated in all major crawlers. Remove it. The sitemap directive is sufficient.

### R6. Add "Request Indexing" tool in the Admin Panel

Add a new section in the admin dashboard (`src/app/admin/page.tsx` or a new `/admin/indexing` page) that allows the admin to trigger a Google Search Console URL Inspection API call to request indexing for any URL.

Implementation:
- Create `src/app/api/admin/request-indexing/route.ts` that accepts a `{ url: string }` body, verifies admin session, and calls the Google Search Console Indexing API (`https://indexing.googleapis.com/v3/urlNotifications:publish`) using a service account key stored in the environment variable `GOOGLE_SERVICE_ACCOUNT_JSON`
- Add a simple UI card on the admin dashboard with a URL input and "Request Indexing" button
- Show the API response status to the admin
- If `GOOGLE_SERVICE_ACCOUNT_JSON` is not set, show a setup guide instead of the button
- Do NOT add this environment variable — just handle the missing case gracefully

---

## Acceptance Criteria

### Sitemap correctness
- [ ] `GET /sitemap.xml` returns valid XML with no entries having `lastModified` equal to the current deploy timestamp for static pages
- [ ] Sitemap includes all `/amp/blog/[slug]` URLs (3 entries for seed posts + any DB posts)
- [ ] Sitemap includes DB-backed blog posts (from Prisma `Post` table) not in `BLOG_POSTS_SEED`, without duplicating seed posts
- [ ] Total URL count in sitemap matches total public pages (run `npm run build` and verify route count vs sitemap entries)

### Canonical tags
- [ ] Each of `/locations/europe`, `/locations/india-remote`, `/locations/united-states`, `/locations/punjab-regional` has a canonical meta tag pointing to its own URL
- [ ] `npm run build` succeeds with zero TypeScript errors

### GEO meta tags
- [ ] Each city/location page has `geo.region`, `geo.placename`, and `ICBM` (where applicable) meta tags with correct ISO region codes and coordinates
- [ ] Verify at least: mansa=IN-PB, chandigarh=IN-PB, delhi=IN-DL
- [ ] Static aggregate location pages have broader geo tags without city-level ICBM

### Schema.org
- [ ] The ld+json schema on the homepage shows `@type` array includes both `LocalBusiness` and `ProfessionalService`
- [ ] `geo` key with `GeoCoordinates` is present in the schema

### Robots.txt
- [ ] Live robots.txt does NOT contain `Host:` directive after deploy
- [ ] All other existing directives remain intact

### Admin indexing tool
- [ ] `/admin` page has a "Request Google Indexing" card visible to ADMIN role
- [ ] When `GOOGLE_SERVICE_ACCOUNT_JSON` env var is not set, the card shows setup instructions, not an error
- [ ] `npm run build` passes with zero errors
- [ ] No page content anywhere is changed

---

## Important Constraints

1. **Do NOT change any page content, hero text, blog content, service descriptions, testimonials, or any user-facing copy.** Only touch SEO infrastructure files: `sitemap.ts`, `robots.ts`, `layout.tsx`, page `metadata` exports, and new API routes.
2. Do NOT add `noindex` to any currently public page.
3. After all changes, run `npm run build` and confirm it passes. Then run `git add -A && git commit -m "fix(seo): fix sitemap timestamps, AMP entries, canonical tags, GEO meta, schema, robots" && git push origin main`.
4. For GEO coordinates: look up accurate coordinates per city — do not use placeholder/made-up values.
5. The Prisma client is at `@/lib/prisma`. The `Post` model has fields: `id`, `slug`, `title`, `publishedAt`, `status` (filter by `status === 'PUBLISHED'`). The DB connection string is in `.env.local`.
6. The admin session helper is at `@/lib/auth` — `getAdminSession()`. Admin role check: `session.role === 'ADMIN'`.
7. The admin dashboard is at `src/app/admin/page.tsx` — add the indexing card there, styled to match the existing dashboard cards (navy `#122C57`, gold `#C99A44`, cream `#F7F5F0` colour scheme).


## Follow-up — 2026-10-02T15:43:57Z

The server was restarted and you were stopped. Please resume your work on the SEO fix project (currently on Milestone 2). Let me know the status.


## Follow-up — 2026-10-03T05:33:12Z

The server was restarted. Please resume your work on the SEO fix project (currently you were finishing Milestone 2 gate and moving to Milestone 3).
