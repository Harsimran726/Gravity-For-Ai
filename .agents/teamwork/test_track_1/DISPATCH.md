# Dispatch: E2E Testing Track Test Writer

## Objective
Design and implement the comprehensive E2E test suite for Technical SEO and Indexing Infrastructure.
Read `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md` and `C:\Data\Gravity For Ai\Wesbite V2\PROJECT.md`.

## Deliverables
1. `C:\Data\Gravity For Ai\Wesbite V2\TEST_INFRA.md` at project root following the dual-track template in Project Pattern:
   - Test Philosophy (opaque-box, requirement-driven)
   - Feature Inventory with Tier 1, Tier 2, Tier 3 mapping
   - Test Architecture (runner command, pass/fail semantics)
   - Real-World Application Scenarios (Tier 4)
   - Coverage Thresholds
2. An automated, executable test script in `tests/e2e/seo.test.ts` (runnable with `npx tsx tests/e2e/seo.test.ts`) that executes all tests across Tiers 1-4 and exits with 0 on pass or non-zero on fail:
   - **Tier 1 (Feature Coverage, >=5 per feature)**:
     - F1: Real historical sitemap dates (no `new Date()` or `now` timestamps on static pages)
     - F2: DB-backed blog posts queried from Prisma and deduplicated with seed posts
     - F3: AMP blog entries in sitemap (`/amp/blog/[slug]` with priority 0.5)
     - F4: Robots.txt lacks deprecated `Host:` directive, preserves user-agent rules and sitemap
     - F5: Root layout Schema.org has `["LocalBusiness", "ProfessionalService"]`, Mansa `geo` (29.9975, 75.3983), `hasMap`, `openingHoursSpecification`
     - F6: Canonical tags present and point to full canonical URLs without trailing slashes
     - F7: City GEO tags (`geo.region`, `geo.placename`, `ICBM`) present in dynamic city pages
     - F8: Static location GEO tags present with broad region codes and placenames
     - F9: Admin indexing API route handles auth, validates URL, handles missing `GOOGLE_SERVICE_ACCOUNT_JSON` gracefully
     - F10: Admin dashboard indexing card renders UI or setup instructions
   - **Tier 2 (Boundary & Corner Cases, >=5 per feature)**:
     - Missing `GOOGLE_SERVICE_ACCOUNT_JSON` returns informative response, not 500 crash
     - Non-admin user receives 401 Unauthorized
     - Invalid URL format in indexing API
     - Trailing slash variations (/lp vs /lp/)
     - Zero DB blog posts fallback to seed posts without crashing
     - Duplicate slug between DB and seed correctly deduplicated
     - Non-existent city parameter returns 404
   - **Tier 3 (Pairwise Cross-Feature Combinations)**:
     - Sitemap URLs match canonical URLs exactly
     - City coordinates in GEO tags match city data
     - Root schema coordinates match Mansa city coordinates
     - Blog URLs match AMP blog URLs 1-to-1
   - **Tier 4 (Real-World Scenarios)**:
     - Googlebot crawler simulation parsing sitemap.xml and robots.txt
     - AI Answer Engine (GEO) entity citation simulation
     - Local SEO citation extraction
     - Admin search console indexing submission workflow simulation
3. `C:\Data\Gravity For Ai\Wesbite V2\TEST_READY.md` at project root summarizing test runner command, test counts per tier, and feature checklist.
4. Deliver handoff report to `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\test_track_1\handoff.md`.

## 2026-10-02T11:40:04Z
You are the E2E Test Suite Designer subagent (test_track_1).
Your working directory is: `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\test_track_1`
Project root is: `C:\Data\Gravity For Ai\Wesbite V2`

Read the original request verbatim at:
`C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`
And the project architecture and feature inventory at:
`C:\Data\Gravity For Ai\Wesbite V2\PROJECT.md`
And your dispatch file at:
`C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\test_track_1\DISPATCH.md`

Your tasks:
1. Create `C:\Data\Gravity For Ai\Wesbite V2\TEST_INFRA.md` documenting the opaque-box 4-tier test architecture and coverage thresholds per the template in Project Pattern.
2. Implement an automated, standalone TypeScript test script `tests/e2e/seo.test.ts` (executable via `npx tsx tests/e2e/seo.test.ts`) that verifies all 11 features across:
   - Tier 1: Feature coverage (>=5 test cases per feature for sitemap, robots, schema, canonicals, geo tags, admin indexing)
   - Tier 2: Boundary & Corner cases (>=5 test cases per feature boundary, e.g., missing env var, 401 unauth, trailing slashes, empty DB, duplicate slugs)
   - Tier 3: Pairwise cross-feature interactions (sitemap vs canonicals, schema vs city coords, blog vs AMP)
   - Tier 4: Real-world user/search engine workload scenarios (Googlebot crawl, Local SEO extraction, Indexing submission lifecycle)
   The test runner should exit 0 on full success, print clear colored/structured reports, and allow testing components individually and end-to-end.
3. Test your script to ensure it executes cleanly.
4. Create `C:\Data\Gravity For Ai\Wesbite V2\TEST_READY.md` summarizing the test runner and coverage table.
5. Write your handoff report to `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\test_track_1\handoff.md`.
Report back when complete via send_message.
