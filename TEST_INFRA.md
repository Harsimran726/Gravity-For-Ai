# Test Infrastructure: Technical SEO & Indexing Architecture

## 1. Test Philosophy

The testing framework for Gravity For AI's SEO and indexing remediation adheres to an **opaque-box, requirement-driven** philosophy:

1. **Requirement-Driven Verification**: Test assertions are derived strictly from authoritative specifications (`ORIGINAL_REQUEST.md` and `PROJECT.md`), not from internal implementation details.
2. **Opaque-Box Isolation**: Tests treat components and subsystems as black boxes, inspecting exported contracts, HTTP request/response lifecycles, metadata structures, and crawler outputs.
3. **Non-Invasive Execution**: The test suite modifies zero application code, zero production data, and leaves no residual side effects.
4. **Deterministic & Self-Contained**: Every test establishes its own inputs, isolates dependencies, gracefully handles missing optional environment variables, and cleans up temporary state.
5. **Progressive Resilience**: Modules are dynamically evaluated so that running the test suite during partial milestone implementation cleanly reports status without crashing the process.

---

## 2. 4-Tier Test Architecture

The test suite is structured into four distinct verification tiers:

```
+-------------------------------------------------------------------------------+
|                        TIER 4: REAL-WORLD SCENARIOS                           |
| Googlebot Crawl | AI Answer Engine GEO | Local SEO Audit | Admin Indexing API |
+-------------------------------------------------------------------------------+
|                   TIER 3: PAIRWISE CROSS-FEATURE INTERACTIONS                 |
|  Sitemap vs Canonicals | Schema vs Mansa GEO | Blog vs AMP | Robots vs Sitemap |
+-------------------------------------------------------------------------------+
|                    TIER 2: BOUNDARY & CORNER CASES                            |
| Missing Env | 401 Unauth | Malformed URLs | Trailing Slashes | Slug Collision  |
+-------------------------------------------------------------------------------+
|                     TIER 1: FEATURE CONTRACT COVERAGE                         |
| F1: Sitemap Dates | F2: DB Blog | F3: AMP | F4: Robots | F5: Schema | F6: Can   |
| F7: City GEO | F8: Static GEO | F9: Indexing API | F10: Admin UI | F11: Build |
+-------------------------------------------------------------------------------+
```

### Tier 1: Feature Contract Coverage (>=5 test cases per feature)
Verifies the functional contract and primary behaviors for all 11 features:
- **F1 (Real Sitemap Dates)**: Verifies `sitemap.ts` returns static pages with historical, non-dynamic publication dates (`lastModified != now`), valid ISO dates, and absolute HTTPS URLs.
- **F2 (DB-Backed Blog Posts)**: Verifies `sitemap()` is async, queries published DB posts, merges with seed data, and prevents duplicates.
- **F3 (AMP Blog Entries)**: Verifies `/amp/blog/[slug]` entries exist for all blog posts with `priority: 0.5` and identical `lastModified` timestamps.
- **F4 (Robots.txt Deprecated Host Removal)**: Verifies `robots.ts` omits `host:` directive, retains `sitemap` URL, preserves user-agent `*` disallows (`/admin`, `/api`), and explicitly allows AI bots.
- **F5 (Enhanced Root Schema.org)**: Verifies `layout.tsx` JSON-LD `@type` includes `["LocalBusiness", "ProfessionalService"]`, Mansa `geo` (29.9975, 75.3983), `hasMap`, and `openingHoursSpecification`.
- **F6 (Canonical Tags)**: Verifies `/locations/europe`, `/locations/india-remote`, `/locations/united-states`, `/locations/punjab-regional`, `/locations`, `/lp`, and `[city]` export canonical URLs without trailing slashes.
- **F7 (Dynamic City GEO Meta Tags)**: Verifies `generateMetadata` in `[city]/page.tsx` returns valid `geo.region`, `geo.placename`, and `ICBM` for Mansa, Bathinda, Chandigarh, Ludhiana, Delhi.
- **F8 (Static Location GEO Meta Tags)**: Verifies broad `geo.region` and `geo.placename` for regional/aggregate pages without city-level `ICBM`.
- **F9 (Admin Indexing API Route)**: Verifies `POST /api/admin/request-indexing` rejects unauthenticated requests with 401, validates URL parameters, and handles missing Google credentials gracefully.
- **F10 (Admin Indexing UI Card)**: Verifies UI component provides URL input, submission action, brand theme styling (`#122C57`, `#C99A44`), and setup instructions.
- **F11 (E2E Build & Suite Verification)**: Verifies Next.js build compilation and test suite zero-exit behavior.

### Tier 2: Boundary & Corner Cases (>=5 test cases per boundary)
Verifies extreme, invalid, and edge condition behaviors:
- **Boundary B1 (Missing Google Service Account Env)**: API returns informative structured response (e.g. setup guidance) instead of 500 crash; does not leak stack traces.
- **Boundary B2 (Authentication & Authorization)**: Missing cookie, forged HMAC signatures, malformed payloads, and non-admin roles (`VIEWER`, `EDITOR`) return 401 Unauthorized.
- **Boundary B3 (Invalid URL Formats)**: Empty string, non-URL text, missing JSON fields, and non-HTTPS URLs are rejected with HTTP 400 Bad Request.
- **Boundary B4 (Trailing Slash Normalization)**: Canonical tags and sitemap entries never contain trailing slashes (except root `/`).
- **Boundary B5 (Zero DB Posts Fallback)**: Empty database or Prisma query errors fallback gracefully to seed data without throwing unhandled exceptions.
- **Boundary B6 (Slug Collision Deduplication)**: Identical slugs between database and seed data result in exactly one sitemap entry.
- **Boundary B7 (Non-existent City Slug)**: Invalid city slug (e.g. `atlantis`) returns 404 / safe fallback title without crashing.

### Tier 3: Pairwise Cross-Feature Interactions
Verifies cross-cutting constraints between multiple components:
- **Interaction P1 (Sitemap vs Canonicals)**: Every URL emitted in `sitemap.xml` strictly equals the `alternates.canonical` metadata URL on the target route.
- **Interaction P2 (GEO Tags vs City Data)**: Coordinates in `other['ICBM']` match authoritative geographic coordinates for each city in `city-data.ts`.
- **Interaction P3 (Root Schema vs Mansa City)**: GeoCoordinates in `layout.tsx` schema match Mansa HQ coordinates (29.9975, 75.3983) and address details.
- **Interaction P4 (Blog vs AMP Blog)**: Strict 1-to-1 bijective mapping between `/blog/[slug]` and `/amp/blog/[slug]` in the sitemap.
- **Interaction P5 (Robots.txt vs Sitemap)**: No URL in `sitemap.xml` is blocked by `robots.txt` disallow directives.
- **Interaction P6 (Dynamic Cities vs Sitemap)**: All 5 cities in `CITIES_DATA` appear in `sitemap.xml` with proper priority differentiation (`mansa`: 0.9, others: 0.8).

### Tier 4: Real-World Workload Scenarios
Simulates realistic production workloads and third-party crawler behaviors:
- **Scenario S1 (Googlebot Crawl Simulation)**: Fetches `robots.txt`, identifies `sitemap.xml`, extracts 36+ target URLs, validates absence of fresh `lastModified` timestamps on static pages, and ensures canonical tags match crawl URLs.
- **Scenario S2 (AI Answer Engine / GEO Citation Extraction)**: Emulates Perplexity/SearchGPT entity scrapers parsing JSON-LD Schema.org and GEO meta tags to verify entity disambiguation and local authority.
- **Scenario S3 (Local SEO & Citations Audit)**: Evaluates Mansa HQ and regional landing pages for LocalBusiness NAP consistency, geo coordinates, Google Maps URLs, and opening hours.
- **Scenario S4 (Admin Indexing Submission Lifecycle)**: Simulates admin login, token verification, URL submission, credential validation, and Google Indexing API payload negotiation.

---

## 3. Test Runner Architecture & Execution

### Command-Line Interface
The test suite is implemented as a standalone TypeScript runner executable via `npx tsx`:

```bash
# Execute full 4-tier E2E test suite
npx tsx tests/e2e/seo.test.ts

# Execute specific tier (1, 2, 3, or 4)
npx tsx tests/e2e/seo.test.ts --tier=1

# Execute specific feature (F1 through F11)
npx tsx tests/e2e/seo.test.ts --feature=F1

# Filter by test title keyword
npx tsx tests/e2e/seo.test.ts --filter=sitemap

# Allow progressive execution without non-zero exit during active development
npx tsx tests/e2e/seo.test.ts --progressive
```

### Exit Code Semantics
- **Exit 0**: All executed test assertions passed successfully.
- **Exit 1**: One or more test assertions failed, or an unhandled execution error occurred.

### Output Formatting
The runner outputs structured, ANSI-colored terminal reports detailing:
- Suite header with execution timestamp and target URL base.
- Per-tier collapsible test execution logs with elapsed execution time.
- Verbatim failure diagnosis (expected value, received value, file path).
- Summary table categorized by Tier, passing count, failing count, and duration.

---

## 4. Coverage Thresholds

| Tier | Category | Minimum Cases Required | Designed Cases | Target Pass Rate |
|------|----------|-------------------------|----------------|------------------|
| Tier 1 | Feature Coverage (11 Features) | >= 5 per feature (55 total) | 55 | 100% |
| Tier 2 | Boundary & Corner Cases (7 Boundaries) | >= 5 per boundary (35 total) | 35 | 100% |
| Tier 3 | Pairwise Cross-Feature Interactions | >= 5 interactions | 6 | 100% |
| Tier 4 | Real-World Workload Scenarios | 4 scenarios | 4 | 100% |
| **Total** | **Comprehensive E2E Suite** | **>= 99 test cases** | **100 test cases** | **100%** |
