# Handoff Report: Explorer Survey 3 (Requirement R6)

## 1. Observation
- **Admin Dashboard**: `src/app/admin/page.tsx` is a Server Component (`export const dynamic = 'force-dynamic';`) fetching PostgreSQL metrics (bookings, leads) via `@/lib/prisma`. Styling uses navy `#122C57` and `#0A1B3D`, gold `#C99A44`, warm cream `#F7F5F0`, and hairline border `#E4E2DC`.
- **Authentication**: `@/lib/auth.ts` exports `getAdminSession(): Promise<AdminSession | null>`. It validates HMAC-SHA256 signed cookies against `NEXTAUTH_SECRET`. Admin role is verified with `session.role === 'ADMIN'`. The route `src/app/api/admin/outreach/send-one/route.ts:125-128` demonstrates the standard role check:
  ```ts
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  ```
- **Dependencies**: `package.json` contains neither `googleapis` nor `google-auth-library`.
- **Google Indexing API Protocol**:
  - Endpoint: `POST https://indexing.googleapis.com/v3/urlNotifications:publish`
  - OAuth Scope: `https://www.googleapis.com/auth/indexing`
  - Body: `{"url": "<url>", "type": "URL_UPDATED"}`
  - Auth header: `Authorization: Bearer <access_token>`
  - Requires Service Account email to be added as **Owner** in Google Search Console.
- **Node.js Crypto Capability**: Node.js standard library `crypto.sign('sha256', Buffer.from(signInput), privateKey)` natively generates RS256 JWT tokens. Tested and verified in Node.js 20 environment with zero external dependencies.
- **Environment Variable**: `GOOGLE_SERVICE_ACCOUNT_JSON` is not set in `.env` or `.env.local`. Handled gracefully without error.
- **Build Status**: Verified baseline `npm run build` exits with code 0 (58 routes generated).

## 2. Logic Chain
1. *Observation 1*: Interactive state (`useState`, `useTransition`, `fetch`) cannot run directly inside a Server Component without converting the whole page to `'use client'`. Converting `src/app/admin/page.tsx` to `'use client'` would break direct `@/lib/prisma` server queries (`upcomingBookings`, `totalBookings`, `totalLeads`).
   *Inference 1*: The indexing card must be a client component (`src/app/admin/request-indexing-card.tsx`) imported into `src/app/admin/page.tsx`.
2. *Observation 2*: Neither `googleapis` nor `google-auth-library` is present in `package.json`.
   *Inference 2*: Using Node.js standard `crypto` for RS256 JWT generation and RFC 7523 Google OAuth2 token exchange (`POST https://oauth2.googleapis.com/token`) avoids adding heavy dependencies (~50MB) and ensures 100% build reliability.
3. *Observation 3*: `GOOGLE_SERVICE_ACCOUNT_JSON` is absent and must not be added.
   *Inference 3*: The server component evaluates `Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)` and passes it as `isConfigured` prop to the card. When false, the card renders a clear 4-step setup guide instead of an active submission button or error banner, perfectly satisfying R6 acceptance criteria.
4. *Observation 4*: Route handlers must reject unauthorized access.
   *Inference 4*: The route handler `src/app/api/admin/request-indexing/route.ts` must call `getAdminSession()`, reject non-admin sessions with HTTP 401, validate URLs, check for credentials (returning 503 if missing), and proxy requests to Google Indexing API.

## 3. Caveats
- Google Indexing API requires the service account email to be added as a verified **Owner** in Google Search Console. If added with only "Full" or "Restricted" permissions, Google returns HTTP 403. The setup guide and error handling explicitly document this distinction.
- Daily quota on Google Indexing API is 200 URL publish requests per day per project.
- No live Google API call can be executed in development until real service account credentials are provided. Dev mock or graceful 503 response ensures testing passes without failures.

## 4. Conclusion
Requirement R6 can be implemented cleanly with two new files and a localized addition to `src/app/admin/page.tsx`:
1. `src/app/api/admin/request-indexing/route.ts`: Secure API route using Node.js built-in `crypto` for zero-dependency Google OAuth2 token exchange and Indexing API calls.
2. `src/app/admin/request-indexing-card.tsx`: Client Component supporting both configured (URL input, presets, live request status) and unconfigured (clean setup guide with Cloud Console and GSC instructions) states.
3. `src/app/admin/page.tsx`: Role check (`session?.role === 'ADMIN'`) and conditional rendering of the card.

## 5. Verification Method
1. Run `npm run build` to verify zero TypeScript and lint errors.
2. Send an unauthenticated request to verify 401 Unauthorized:
   ```bash
   curl -i -X POST http://localhost:3000/api/admin/request-indexing -H "Content-Type: application/json" -d '{"url":"https://gravityforai.com/"}'
   ```
3. Visit `/admin` in the browser when logged in as admin to verify the "Request Google Indexing" card renders the setup instructions cleanly without throwing any runtime errors.
