# Dispatch Assignment: Milestone 3 Worker

## Target
Milestone 3: Admin Request Indexing Tool (R6)

## Exclusive Write Boundaries
- `src/app/api/admin/request-indexing/route.ts`
- `src/app/admin/request-indexing-card.tsx`
- `src/app/admin/page.tsx`
DO NOT modify any other files. DO NOT modify any page copy, hero text, testimonials, or UI outside of these files.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Detailed Requirements
1. `src/app/api/admin/request-indexing/route.ts`:
   - Export `POST(request: Request)` and optionally `GET(request: Request)`.
   - Authenticate with `import { getAdminSession } from '@/lib/auth';`:
     ```ts
     const session = await getAdminSession();
     if (!session || session.role !== 'ADMIN') {
       return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
     }
     ```
   - Validate body:
     Parse JSON body. If `!body || !body.url || typeof body.url !== 'string' || !body.url.trim()`, return status 400.
     Validate URL: must be valid HTTP/HTTPS URL (`try { new URL(body.url) } catch { return status 400 }`). Reject dangerous protocols like `javascript:`.
   - Handle Service Account credentials:
     Check `process.env.GOOGLE_SERVICE_ACCOUNT_JSON`.
     If missing or empty or invalid JSON:
     Return `{ success: false, setupRequired: true, message: 'Google Service Account credentials not configured. Please set GOOGLE_SERVICE_ACCOUNT_JSON.' }` with status 200 (or non-500, status < 500!). NEVER return 500 or 503!
     If present:
     Parse credentials (`client_email`, `private_key`). Normalize newlines in private_key (`replace(/\\n/g, '\n')`).
     Generate RS256 JWT using Node.js `crypto.sign('sha256', ...)` with scope `https://www.googleapis.com/auth/indexing` and aud `https://oauth2.googleapis.com/token`.
     Exchange for Google OAuth2 access token at `https://oauth2.googleapis.com/token`.
     Post notification to `https://indexing.googleapis.com/v3/urlNotifications:publish` with `{ url, type: 'URL_UPDATED' }`.
     Return `{ success: true, message: 'Indexing request published successfully', url, type: 'URL_UPDATED', notifyTime: ... }`.
2. `src/app/admin/request-indexing-card.tsx`:
   - Client Component (`'use client'`).
   - Use Lucide icons: `Globe`, `Send`, `CheckCircle2`, `AlertCircle`, `ExternalLink`, `Key`, `ShieldAlert`, `Loader2`.
   - Card container with brand palette (`#122C57` navy, `#C99A44` gold, `#F7F5F0` cream, `#E4E2DC` border).
   - Display title "Request Google Indexing" and description.
   - Input field for URL (`id="indexing-url"`, `placeholder="https://gravityforai.com/..."`).
   - Submit button with "Request Indexing" text and loading state.
   - Setup instructions box containing:
     - Clear 4-step instructions mentioning `GOOGLE_SERVICE_ACCOUNT_JSON`, `Service Account`, `Setup`, `Google Search Console`.
   - Real-time feedback alerts on success or error.
3. `src/app/admin/page.tsx`:
   - Import `RequestIndexingCard` from `./request-indexing-card`.
   - Render `<RequestIndexingCard />` (e.g. above or below upcoming bookings).
4. Run Verification Commands:
   - `npx tsx tests/e2e/seo.test.ts --feature=F9`
   - `npx tsx tests/e2e/seo.test.ts --feature=F10`
   - `npx tsx tests/e2e/seo.test.ts --feature=B1`
   - `npx tsx tests/e2e/seo.test.ts --feature=B2`
   - `npx tsx tests/e2e/seo.test.ts --feature=B3`
   - `npx tsx tests/e2e/seo.test.ts --filter="Scenario 4"`
   - `npm run build`
5. Write `changes.md` and `handoff.md` in your working directory.


## 2026-10-03T05:40:50Z
[Message from parent]
You are the Worker subagent for Milestone 3 (worker_m3_1).
Your working directory is: `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m3_1`
Project root is: `C:\Data\Gravity For Ai\Wesbite V2`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
