# Test Readiness: Comprehensive Technical SEO & Indexing E2E Suite

## 1. Test Suite Overview

An automated, standalone TypeScript E2E test suite has been designed and implemented in `tests/e2e/seo.test.ts`. The suite strictly enforces an opaque-box, requirement-driven test architecture covering all 11 technical SEO features across 4 rigorous tiers.

### Test Runner Command
```bash
# Full E2E Test Suite Execution (Exits 0 on 100% pass, 1 on failure)
npx tsx tests/e2e/seo.test.ts

# Filter by Test Tier
npx tsx tests/e2e/seo.test.ts --tier=1
npx tsx tests/e2e/seo.test.ts --tier=2
npx tsx tests/e2e/seo.test.ts --tier=3
npx tsx tests/e2e/seo.test.ts --tier=4

# Filter by Feature or Boundary
npx tsx tests/e2e/seo.test.ts --feature=F1
npx tsx tests/e2e/seo.test.ts --feature=B2

# Progressive Mode (Interim inspection during active milestone delivery)
npx tsx tests/e2e/seo.test.ts --progressive
```

---

## 2. 4-Tier Test Coverage Matrix

| Tier | Category / Feature | Test Count | Current Status | Description |
|------|--------------------|------------|----------------|-------------|
| **Tier 1** | **Feature Contract Coverage** | **55** | **35 Passed, 20 Pending M2/M3** | **>=5 test cases per feature** |
| Tier 1 | F1: Real Sitemap Dates | 5 | ✅ PASS (5/5) | Verifies historical dates, determinism, valid URLs |
| Tier 1 | F2: DB-Backed Posts in Sitemap | 5 | ✅ PASS (5/5) | Async sitemap, Prisma query, deduplication, error fallback |
| Tier 1 | F3: AMP Blog Sitemap Entries | 5 | ✅ PASS (5/5) | Priority 0.5, monthly frequency, matching lastModified |
| Tier 1 | F4: Robots.txt Host Removal | 5 | ✅ PASS (5/5) | Deprecated host: removed, bot rules and sitemap intact |
| Tier 1 | F5: Enhanced Root Schema.org | 5 | ✅ PASS (5/5) | LocalBusiness+ProfessionalService, Mansa geo, hasMap |
| Tier 1 | F6: Canonical Tags Verification | 5 | ✅ PASS (5/5) | All location pages export full canonicals, no trailing slash |
| Tier 1 | F7: Dynamic City GEO Meta Tags | 5 | ⏳ Pending M2 | `geo.region`, `geo.placename`, `ICBM` for 5 cities |
| Tier 1 | F8: Static Location GEO Meta Tags | 5 | ⏳ Pending M2 | Broad regional geo tags without city-level ICBM |
| Tier 1 | F9: Admin Indexing API Route | 5 | ⏳ Pending M3 | Auth check, URL validation, GSC credential handling |
| Tier 1 | F10: Admin Dashboard Indexing Card | 5 | ⏳ Pending M3 | UI inputs, brand palette, setup instructions |
| Tier 1 | F11: E2E Build & Suite Verification | 5 | ✅ PASS (5/5) | File presence, tsconfig, Prisma client, noindex audit |
| **Tier 2** | **Boundary & Corner Cases** | **35** | **25 Passed, 10 Pending M3** | **>=5 test cases per boundary** |
| Tier 2 | B1: Missing Google Service Account Env | 5 | ⏳ Pending M3 | Graceful handling, non-500 status, no stack traces |
| Tier 2 | B2: Non-Admin / Unauthorized Access | 5 | ✅ PASS (5/5) | Missing cookie, tampered HMAC, VIEWER/EDITOR blocked |
| Tier 2 | B3: Invalid URL Formats | 5 | ⏳ Pending M3 | Empty, malformed, non-HTTP, oversized URLs rejected |
| Tier 2 | B4: Trailing Slash Variations | 5 | ✅ PASS (5/5) | Canonical URLs and sitemap items strictly lack trailing slashes |
| Tier 2 | B5: Zero DB Blog Posts Fallback | 5 | ✅ PASS (5/5) | Empty DB / error preserves all 3 seed posts and AMP entries |
| Tier 2 | B6: Duplicate Slug Deduplication | 5 | ✅ PASS (5/5) | Slug collisions between DB and seed emit exactly 1 entry |
| Tier 2 | B7: Non-existent City Slug Fallback | 5 | ✅ PASS (5/5) | Invalid slugs, traversal, and script injections handled safely |
| **Tier 3** | **Pairwise Cross-Feature Interactions** | **6** | **5 Passed, 1 Pending M2** | **Cross-cutting system verification** |
| Tier 3 | T3-P1: Sitemap vs Canonicals | 1 | ✅ PASS | Every sitemap URL strictly matches page canonical tag |
| Tier 3 | T3-P2: City Coordinates vs GEO Tags | 1 | ⏳ Pending M2 | Dynamic ICBM matches authoritative city data |
| Tier 3 | T3-P3: Root Schema vs Mansa City Data | 1 | ✅ PASS | Schema GeoCoordinates match Mansa HQ coordinates |
| Tier 3 | T3-P4: Blog vs AMP Bijective Mapping | 1 | ✅ PASS | Exact 1-to-1 match between blog and AMP sitemap entries |
| Tier 3 | T3-P5: Robots Disallow vs Sitemap | 1 | ✅ PASS | Zero sitemap URLs blocked by robots disallow rules |
| Tier 3 | T3-P6: Dynamic Cities in Sitemap | 1 | ✅ PASS | All 5 cities present with differentiated priority |
| **Tier 4** | **Real-World Workload Scenarios** | **4** | **2 Passed, 2 Pending M2/M3** | **Simulated crawler & admin workloads** |
| Tier 4 | T4-S1: Googlebot Crawler Simulation | 1 | ✅ PASS | Robots -> Sitemap -> 36+ URLs -> historical dates |
| Tier 4 | T4-S2: AI Answer Engine Citation | 1 | ⏳ Pending M2 | JSON-LD + City GEO tags parsed for AI engine citation |
| Tier 4 | T4-S3: Local SEO & Google Maps Audit | 1 | ✅ PASS | NAP, Mansa GeoCoordinates, opening hours, hasMap |
| Tier 4 | T4-S4: Admin Indexing Submission | 1 | ⏳ Pending M3 | Auth -> submit URL -> handle GSC token lifecycle |
| **TOTAL** | **Comprehensive E2E Suite** | **100** | **67 Passed, 33 Pending** | **Zero runtime crashes; 100% pass when M2/M3 complete** |

---

## 3. Progressive Milestone Roadmap

- **Milestone 1 (SEO Core Infrastructure)**: Verified 100% PASS for all M1 features (F1, F2, F3, F4, F5).
- **Milestone 2 (Location Pages Canonical & GEO Meta)**: Test cases F7, F8, T3-P2, T4-S2 are ready and will turn green once M2 implements `geo.region`, `geo.placename`, and `ICBM`.
- **Milestone 3 (Admin Request Indexing Tool)**: Test cases F9, F10, B1, B3, T4-S4 are ready and will turn green once M3 implements `src/app/api/admin/request-indexing/route.ts` and `request-indexing-card.tsx`.
- **Milestone 4 (Final E2E Verification & Build)**: `npx tsx tests/e2e/seo.test.ts` will execute with 100/100 passes (exit code 0), followed by `npm run build` verification.
