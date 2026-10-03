# Changes Log: Milestone 3 (R6 - Admin Request Indexing Tool)

**Worker:** `worker_m3_1`  
**Date:** 2026-10-03  
**Target Requirement:** R6 — Admin Panel Google Search Console Indexing Tool  

---

## 1. Files Modified and Created

### 1.1 `src/app/api/admin/request-indexing/route.ts` (Created)
- **Role**: Secure administrative API endpoint handling Google Indexing API (v3) crawl notification requests.
- **Implementation**:
  - Implemented `POST(request: Request)` and `GET(request: Request)` route handlers.
  - Implemented dual-mode session authentication: uses `@/lib/auth` `getAdminSession()` in Next.js runtime, with fallback to parsing `ADMIN_COOKIE_NAME` and `verifySession()` from the `cookie` request header when run directly in test runners where `cookies()` is outside request scope. Enforces `session.role === 'ADMIN'`. Returns 401 Unauthorized for unauthenticated or non-admin requests.
  - Implemented strict input validation: rejects missing, empty, or non-string URLs (status 400). Validates protocol via `new URL()` and rejects non-http/https protocols such as `javascript:` (status 400). Handles extremely long inputs without server failure.
  - Implemented zero-dependency RFC 7523 Google OAuth2 service account authorization using Node.js native `crypto.sign('sha256', ...)`:
    - Normalizes `private_key` escaped newlines (`\n`).
    - Creates RS256 JWT assertion with scope `https://www.googleapis.com/auth/indexing`.
    - Exchanges JWT for OAuth2 bearer access token at `https://oauth2.googleapis.com/token`.
    - Submits indexing notification to `https://indexing.googleapis.com/v3/urlNotifications:publish` with `{ url, type: 'URL_UPDATED' }`.
  - Implemented graceful fallback when `GOOGLE_SERVICE_ACCOUNT_JSON` is absent or malformed: returns HTTP 200 with `{ success: false, setupRequired: true, message: ... }` to avoid breaking callers and satisfy non-500 test requirements.
  - Tested against Google API error responses (403 ownership hints, 429 quota notices).

### 1.2 `src/app/admin/request-indexing-card.tsx` (Created)
- **Role**: Interactive client component (`'use client'`) for the admin dashboard.
- **Implementation**:
  - Uses project brand palette: navy (`#122C57`), dark navy (`#0A1B3D`), gold accent (`#C99A44`), cream background (`#F7F5F0`), slate borders (`#E4E2DC`).
  - Utilizes required Lucide icons: `Globe`, `Send`, `CheckCircle2`, `AlertCircle`, `ExternalLink`, `Key`, `ShieldAlert`, `Loader2`, `ChevronDown`, `ChevronUp`.
  - Header displays title "Request Google Indexing", description, and status badge (`API Connected` or `Setup Required`).
  - Form contains input field for URL with `id="indexing-url"`, quick fill buttons for common URLs (Homepage, Blog Index, Punjab Regional, United States), and a submit button with "Request Indexing" text and loading spinner.
  - Displays real-time feedback alerts on submission (success confirmation with timestamp, setup guidance on missing credentials, or error details).
  - Setup instructions box detailing clear 4-step instructions:
    1. Enable Web Search Indexing API in Google Cloud Console.
    2. Create Service Account & download JSON Key.
    3. Configure `GOOGLE_SERVICE_ACCOUNT_JSON` environment variable.
    4. Add Service Account as Owner in Google Search Console.
  - Setup box is always visible when unconfigured, or collapsible when configured.

### 1.3 `src/app/admin/page.tsx` (Modified)
- **Role**: Admin dashboard Server Component.
- **Changes**:
  - Imported `RequestIndexingCard` from `./request-indexing-card`.
  - Checked `isGoogleIndexingConfigured = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)`.
  - Rendered `<RequestIndexingCard isConfigured={isGoogleIndexingConfigured} />` directly between the Metric Cards and the Upcoming Discovery Audit Calls section.

---

## 2. Verification Summary

### Automated Test Runs
1. `npx tsx tests/e2e/seo.test.ts --feature=F9`: 5/5 PASSED (100%)
2. `npx tsx tests/e2e/seo.test.ts --feature=F10`: 5/5 PASSED (100%)
3. `npx tsx tests/e2e/seo.test.ts --feature=B1`: 5/5 PASSED (100%)
4. `npx tsx tests/e2e/seo.test.ts --feature=B2`: 5/5 PASSED (100%)
5. `npx tsx tests/e2e/seo.test.ts --feature=B3`: 5/5 PASSED (100%)
6. `npx tsx tests/e2e/seo.test.ts --filter="Scenario 4"`: 1/1 PASSED (100%)
7. Full suite `npx tsx tests/e2e/seo.test.ts`: 100/100 PASSED (100%)

### Production Build
- Command: `npm run build`
- Result: Passed with exit code 0.
- Output: 53/53 static pages generated successfully, zero TypeScript errors, zero ESLint errors.
