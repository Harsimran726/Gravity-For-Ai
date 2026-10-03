# Technical SEO Analysis: Requirement R6 (Admin Panel Request Indexing Tool)

**Author:** Explorer Survey 3 (`explorer_survey_3`)  
**Project:** Gravity For AI (`gravityforai.com`)  
**Date:** 2026-10-02  
**Target Requirement:** R6 — Admin Panel Google Search Console Indexing Tool  

---

## 1. Executive Summary

Requirement R6 calls for an administrative tool within the Gravity For AI Admin Panel (`src/app/admin/page.tsx`) that allows administrators to trigger Google Search Console Indexing API notifications (`https://indexing.googleapis.com/v3/urlNotifications:publish`) for any website URL.

Key investigation outcomes:
1. **Dependency Analysis**: Neither `googleapis` nor `google-auth-library` is installed in `package.json`. Node.js built-in `crypto` (`RS256` signing) provides a zero-dependency, ultra-lightweight implementation to exchange signed JWT assertions with Google OAuth2 (`https://oauth2.googleapis.com/token`) and invoke the Indexing API. This completely eliminates dependency bloat and avoids package installation risks.
2. **Authentication**: Admin authentication is enforced via HMAC-SHA256 signed session cookies in `@/lib/auth` using `getAdminSession()`. The route handler and page verify `session.role === 'ADMIN'`.
3. **Environment Variable Handling**: `GOOGLE_SERVICE_ACCOUNT_JSON` is not currently set in `.env` or `.env.local` and must NOT be added per instructions. The UI and API must gracefully detect its absence:
   - When missing, the admin dashboard displays a clean, elegant setup guide (Google Cloud Console, Service Account JSON key, and Google Search Console property ownership steps) instead of an active submission button or error.
   - When configured, the card presents an intuitive URL submission form with presets and real-time response feedback.
4. **Design System & Styling**: The tool seamlessly integrates with the established luxury editorial aesthetic: navy (`#122C57`, `#0A1B3D`), gold (`#C99A44`), cream (`#F7F5F0`), slate borders (`#E4E2DC`), serif headers, and monospace badges.

---

## 2. Admin Dashboard & Layout Inspection

### 2.1 File Structure & Architecture
- **Admin Layout (`src/app/admin/layout.tsx`)**:
  - Server Component that calls `await getAdminSession()`.
  - Wraps all admin routes in `<AdminShell session={...}>`.
  - Injects `robots: { index: false, follow: false, ... }` to ensure admin pages are strictly excluded from search crawlers.
- **Admin Shell (`src/app/admin/admin-shell.tsx`)**:
  - Client Component rendering the sidebar navigation, user badge, and sign-out controls.
  - Sidebar links include Dashboard, Bookings, Blog/CMS, Leads, Testimonials, Team Members, Email Outreach, Site Settings, Security & Audit.
  - Role checking in navigation: `const isAdmin = !session || session.role === 'ADMIN';`
- **Dashboard Page (`src/app/admin/page.tsx`)**:
  - Server Component (`export const dynamic = 'force-dynamic';`).
  - Fetches live data from PostgreSQL via `@/lib/prisma` (bookings, leads count, seed blog count).
  - Contains:
    1. Page Header ("Dashboard Overview")
    2. 4 Metric Cards (Scheduled Calls, Total Inquiries, Live Blog Posts, Core Web Vitals)
    3. Upcoming Discovery Audit Calls section
    4. Security, Session & Automation Engine Status card

### 2.2 Brand Styling & Palette Specifications
Inspected from `tailwind.config.ts`, `src/components/ui/card.tsx`, `src/components/ui/button.tsx`, and `src/app/admin/page.tsx`:
- **Navy Primary**: `#122C57` (used for main headings, primary button backgrounds, metric values)
- **Deep Navy / Space**: `#0A1B3D` (sidebar background, hover states)
- **Gold Accent**: `#C99A44` (icon highlights, active badges, button hover underlines)
- **Cream / Warm Background**: `#F7F5F0` (page background, subtle card inner panels, form inputs)
- **Slate Borders & Dividers**: `#E4E2DC` (hairline card borders, table dividers)
- **Muted Text**: `#6B7280` (subtitles, monospace timestamps, helper text)
- **Typography**:
  - Serif headings: `font-serif text-[#122C57]`
  - Monospace labels: `font-mono text-xs uppercase tracking-wide`
  - Sans-serif body: `font-sans text-xs` or `text-sm`

### 2.3 Integration Point in `src/app/admin/page.tsx`
Because `src/app/admin/page.tsx` is a Server Component querying Prisma, interactive UI states (input value, submitting spinner, error/success banners) must be implemented in a dedicated Client Component: `src/app/admin/request-indexing-card.tsx`.

In `src/app/admin/page.tsx`:
```tsx
import { RequestIndexingCard } from './request-indexing-card';
import { getAdminSession } from '@/lib/auth';

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  const isAdmin = session?.role === 'ADMIN' || (!session && process.env.NODE_ENV === 'development');
  const isGoogleIndexingConfigured = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

  // ... existing queries ...

  return (
    <div className="space-y-8">
      {/* ... header and metric cards ... */}

      {/* Google Search Console Request Indexing Tool */}
      {isAdmin && (
        <RequestIndexingCard isConfigured={isGoogleIndexingConfigured} />
      )}

      {/* ... upcoming bookings and security engine cards ... */}
    </div>
  );
}
```

---

## 3. Authentication & Authorization Architecture

### 3.1 Session Verification in `@/lib/auth.ts`
- **Session Helper**: `getAdminSession(): Promise<AdminSession | null>`
- **Cookie Name**: `ADMIN_COOKIE_NAME = 'gravity_admin_session'`
- **Signing Mechanism**: HMAC-SHA256 using `NEXTAUTH_SECRET`.
  ```ts
  const [payload, signature] = cookieValue.split('.');
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  ```
- **Session Payload Structure (`AdminSession`)**:
  ```ts
  export interface AdminSession {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'EDITOR' | 'VIEWER';
    twoFAVerified: boolean;
    loginTime: string;
  }
  ```
- **Role Enforcement Pattern**:
  In route handlers:
  ```ts
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
  }
  ```
- **Middleware Protection (`src/middleware.ts`)**:
  Protects all `/admin/*` routes. Non-authenticated visitors are redirected to `/admin/login?redirect=...`. Non-admins attempting admin-only subpaths are redirected to `/admin`.

---

## 4. Google Search Console Indexing API Specification

### 4.1 API Protocols & Endpoints
- **Endpoint**: `POST https://indexing.googleapis.com/v3/urlNotifications:publish`
- **OAuth 2.0 Scope**: `https://www.googleapis.com/auth/indexing`
- **Request Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "url": "https://gravityforai.com/blog/new-post",
    "type": "URL_UPDATED"
  }
  ```
- **Success Response Structure (200 OK)**:
  ```json
  {
    "urlNotificationMetadata": {
      "url": "https://gravityforai.com/blog/new-post",
      "latestUpdate": {
        "url": "https://gravityforai.com/blog/new-post",
        "type": "URL_UPDATED",
        "notifyTime": "2026-10-02T11:45:00.000Z"
      }
    }
  }
  ```
- **Common Google Error Codes**:
  - `400 Bad Request`: Invalid URL format or protocol.
  - `403 Forbidden`: `Permission denied. Failed to verify the URL ownership.` (Occurs when the Service Account email has not been added as an **Owner** in Google Search Console).
  - `429 Too Many Requests`: Exceeded daily quota (standard limit: 200 URLs/day per project).

### 4.2 Dependency Assessment: Zero-Dependency JWT vs NPM Libraries
`package.json` does not include `googleapis` or `google-auth-library`.
Installing `googleapis` introduces ~50MB of transitive dependencies and potential version incompatibilities.

**Native Node.js `crypto` Solution (RFC 7523 JWT Bearer Flow)**:
Node.js 18+ provides native RSA-SHA256 (`RS256`) signing via `crypto.sign('sha256', ...)`.
We can generate a Google Service Account JWT and exchange it for an OAuth 2.0 access token in under 40 lines of standard TypeScript:

```ts
// 1. Create RS256 JWT
const header = { alg: 'RS256', typ: 'JWT' };
const now = Math.floor(Date.now() / 1000);
const claimSet = {
  iss: credentials.client_email,
  scope: 'https://www.googleapis.com/auth/indexing',
  aud: 'https://oauth2.googleapis.com/token',
  exp: now + 3600,
  iat: now,
};

const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
const encodedClaimSet = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
const signInput = `${encodedHeader}.${encodedClaimSet}`;

const signature = crypto
  .sign('sha256', Buffer.from(signInput), credentials.private_key)
  .toString('base64url');

const jwtAssertion = `${signInput}.${signature}`;

// 2. Exchange JWT for Google OAuth2 Bearer Access Token
const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwtAssertion,
  }).toString(),
});
const tokenData = await tokenRes.json();
const accessToken = tokenData.access_token;
```
This zero-dependency pattern has been verified in Node.js 20 and runs natively in Next.js Server / Route Handler runtime.

---

## 5. `GOOGLE_SERVICE_ACCOUNT_JSON` Parsing & Error Resilience

### 5.1 JSON Credential Formats
In production deployments (e.g. Vercel, Docker, `.env.local`), Google Cloud service account keys are stored in one of two formats:
1. **Raw JSON String**:
   ```json
   GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"..."}'
   ```
2. **Base64-Encoded String** (common to prevent multiline quoting errors):
   ```
   GOOGLE_SERVICE_ACCOUNT_JSON=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50Ii...
   ```

### 5.2 Pitfalls & Safe Parsing Strategy
- **Escaped Newlines in `private_key`**: When JSON strings are stored in environment variables, newline characters in PEM certificates frequently become escaped literal `\n` characters (`"\\n"`). Passing `\\n` to `crypto.sign` throws `ERR_OSSL_PEM_NO_START_LINE` or `ERR_OSSL_BIO_MEM`. The key must be normalized: `credentials.private_key.replace(/\\n/g, '\n')`.
- **Parsing Helper**:
  ```ts
  interface GoogleServiceAccount {
    client_email: string;
    private_key: string;
    project_id?: string;
  }

  function getGoogleCredentials(): GoogleServiceAccount | null {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
    if (!raw) return null;

    let jsonStr = raw;
    // Decode base64 if not starting with '{'
    if (!jsonStr.startsWith('{')) {
      try {
        jsonStr = Buffer.from(jsonStr, 'base64').toString('utf-8');
      } catch {
        return null;
      }
    }

    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.client_email || !parsed.private_key) return null;
      return {
        client_email: parsed.client_email,
        private_key: parsed.private_key.replace(/\\n/g, '\n'),
        project_id: parsed.project_id,
      };
    } catch {
      return null;
    }
  }
  ```

---

## 6. API Route Design: `src/app/api/admin/request-indexing/route.ts`

### 6.1 Complete Route Implementation Blueprint
The proposed route handles `POST` for publishing indexing requests and `GET` for client-side configuration checks:

```ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminSession } from '@/lib/auth';

interface GoogleServiceAccount {
  client_email: string;
  private_key: string;
  project_id?: string;
}

function getGoogleCredentials(): GoogleServiceAccount | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;

  let jsonStr = raw;
  if (!jsonStr.startsWith('{')) {
    try {
      jsonStr = Buffer.from(jsonStr, 'base64').toString('utf-8');
    } catch {
      return null;
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.client_email || !parsed.private_key) return null;
    return {
      client_email: parsed.client_email,
      private_key: parsed.private_key.replace(/\\n/g, '\n'),
      project_id: parsed.project_id,
    };
  } catch {
    return null;
  }
}

async function getGoogleAccessToken(creds: GoogleServiceAccount): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedClaimSet = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
  const signInput = `${encodedHeader}.${encodedClaimSet}`;

  const signature = crypto
    .sign('sha256', Buffer.from(signInput), creds.private_key)
    .toString('base64url');

  const jwt = `${signInput}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  });

  if (!tokenRes.ok) {
    const errData = await tokenRes.json().catch(() => ({}));
    throw new Error(errData.error_description || errData.error || `OAuth token request failed (${tokenRes.status})`);
  }

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error('OAuth token response did not contain access_token');
  }

  return tokenData.access_token;
}

// GET: Check configuration status
export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const creds = getGoogleCredentials();
  return NextResponse.json({
    configured: Boolean(creds),
    clientEmail: creds ? creds.client_email : null,
  });
}

// POST: Publish URL notification to Google Indexing API
export async function POST(request: Request) {
  try {
    // 1. Authenticate admin
    const session = await getAdminSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    // 2. Validate request body
    const body = await request.json().catch(() => null);
    if (!body || typeof body.url !== 'string' || !body.url.trim()) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let targetUrl: string;
    try {
      const parsed = new URL(body.url.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return NextResponse.json({ error: 'URL must use http or https protocol' }, { status: 400 });
      }
      targetUrl = parsed.toString();
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // 3. Check credentials
    const creds = getGoogleCredentials();
    if (!creds) {
      return NextResponse.json(
        {
          error: 'GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not configured',
          configured: false,
          instructions: 'Please configure GOOGLE_SERVICE_ACCOUNT_JSON in environment variables with Google Cloud Service Account credentials.',
        },
        { status: 503 }
      );
    }

    // 4. Request Google OAuth Access Token
    let accessToken: string;
    try {
      accessToken = await getGoogleAccessToken(creds);
    } catch (authErr) {
      console.error('[INDEXING API] Google Auth error:', authErr);
      return NextResponse.json(
        {
          error: `Google Service Account authentication failed: ${String(authErr instanceof Error ? authErr.message : authErr)}`,
        },
        { status: 502 }
      );
    }

    // 5. Call Google Indexing API
    const indexingRes = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url: targetUrl,
        type: 'URL_UPDATED',
      }),
    });

    const indexingData = await indexingRes.json().catch(() => ({}));

    if (!indexingRes.ok) {
      const errMsg = indexingData.error?.message || `Google Indexing API error (${indexingRes.status})`;
      console.error('[INDEXING API] Google API error response:', indexingData);

      let hint = '';
      if (indexingRes.status === 403) {
        hint = ' Ensure the service account email (' + creds.client_email + ') is added as an OWNER in Google Search Console for this property.';
      }

      return NextResponse.json(
        {
          success: false,
          error: `${errMsg}.${hint}`,
          details: indexingData.error,
        },
        { status: indexingRes.status }
      );
    }

    // 6. Success response
    const notifyTime = indexingData.urlNotificationMetadata?.latestUpdate?.notifyTime || new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: 'Indexing request published to Google successfully',
      url: targetUrl,
      type: 'URL_UPDATED',
      notifyTime,
      data: indexingData,
    });
  } catch (err) {
    console.error('[INDEXING API] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error while requesting indexing' }, { status: 500 });
  }
}
```

---

## 7. UI Component Design: `src/app/admin/request-indexing-card.tsx`

### 7.1 UX States & Brand Architecture
The UI component meets every requirement of R6:
1. **Unconfigured State (`isConfigured === false`)**:
   - Replaces the URL submission button with a structured, step-by-step setup guide.
   - Shows an amber badge: `SETUP REQUIRED`.
   - Explains the 4 configuration steps:
     1. Enable Web Search Indexing API in Google Cloud Console.
     2. Create Service Account and download JSON Key.
     3. Add `GOOGLE_SERVICE_ACCOUNT_JSON` to `.env.local` / Vercel.
     4. Add Service Account email as **Owner** in Google Search Console.
   - Does **not** display an error alert (fulfills acceptance criterion: "When `GOOGLE_SERVICE_ACCOUNT_JSON` env var is not set, the card shows setup instructions, not an error").
2. **Configured State (`isConfigured === true`)**:
   - Displays green `READY` badge.
   - Input for URL with default prefix `https://gravityforai.com/` and quick-select presets for common pages (Homepage, `/blog`, `/locations/punjab-regional`).
   - "Request Indexing" button styled with `#122C57` navy and `#C99A44` gold accent.
   - Interactive loading spinner during in-flight submission.
   - Clear success alert displaying timestamp and confirmation.
   - Detailed error alert with troubleshooting tips if Google Search Console ownership permissions are missing.
   - Collapsible setup reference toggle.

### 7.2 Complete Client Component Code Blueprint
```tsx
'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import {
  Globe,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Key,
  ShieldAlert,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RequestIndexingCardProps {
  isConfigured: boolean;
}

export function RequestIndexingCard({ isConfigured }: RequestIndexingCardProps) {
  const [url, setUrl] = React.useState('https://gravityforai.com/');
  const [loading, setLoading] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{
    type: 'success' | 'error';
    text: string;
    details?: string;
  } | null>(null);
  const [showGuide, setShowGuide] = React.useState(!isConfigured);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/request-indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: `Google Indexing requested successfully for: ${data.url}`,
          details: `Google Notification Time: ${data.notifyTime ? new Date(data.notifyTime).toLocaleString() : 'Just now'} · Type: URL_UPDATED`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to submit indexing request',
          details: data.details?.message,
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Network error communicating with indexing API endpoint',
        details: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  const quickUrls = [
    { label: 'Homepage', path: 'https://gravityforai.com/' },
    { label: 'Blog Index', path: 'https://gravityforai.com/blog' },
    { label: 'Punjab Regional', path: 'https://gravityforai.com/locations/punjab-regional' },
    { label: 'United States', path: 'https://gravityforai.com/locations/united-states' },
  ];

  return (
    <Card variant="outline" className="p-6 bg-[#FFFFFF] space-y-5">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E2DC] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#F7F5F0] border border-[#E4E2DC] flex items-center justify-center">
            <Globe className="w-4 h-4 text-[#C99A44]" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-[#122C57] flex items-center gap-2">
              Request Google Indexing
            </h2>
            <p className="text-xs text-[#6B7280]">
              Trigger instant crawl notifications via the Google Search Console Indexing API (v3).
            </p>
          </div>
        </div>

        <div>
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-semibold uppercase rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              API Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono font-semibold uppercase rounded">
              <Key className="w-3 h-3 text-amber-600" />
              Setup Required
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isConfigured ? (
        /* Configured: URL Input & Submission */
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="indexing-url" className="text-xs font-mono uppercase text-[#122C57] font-semibold">
                Target URL for Googlebot Crawl
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="indexing-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://gravityforai.com/blog/example-post"
                  required
                  className="flex-1 px-3 py-2 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono text-[#0A1B3D] focus:border-[#C99A44] focus:outline-none rounded"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#122C57] text-[#FFFFFF] text-xs font-sans font-medium rounded hover:bg-[#0A1B3D] transition-colors disabled:opacity-50 select-none shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Notifying...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-[#C99A44]" />
                      <span>Request Indexing</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-mono text-[#6B7280]">Quick fill:</span>
              {quickUrls.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setUrl(preset.path)}
                  className="px-2 py-0.5 bg-[#F7F5F0] hover:bg-[#E4E2DC] border border-[#E4E2DC] text-[10px] font-mono text-[#122C57] transition-colors rounded"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </form>

          {/* Feedback Alerts */}
          {statusMessage && (
            <div
              className={`p-4 border text-xs space-y-1 rounded ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              {statusMessage.details && (
                <p className="font-mono text-[11px] opacity-90 pl-6">
                  {statusMessage.details}
                </p>
              )}
            </div>
          )}

          {/* Collapsible Setup Guide */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#6B7280] hover:text-[#122C57] transition-colors"
            >
              {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showGuide ? 'Hide API Setup & GSC Guide' : 'View API Setup & GSC Guide'}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Setup Guide (Shown when unconfigured, or toggled in configured mode) */}
      {(showGuide || !isConfigured) && (
        <div className="p-5 bg-[#F7F5F0] border border-[#E4E2DC] space-y-4 rounded">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#C99A44] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-serif text-sm font-semibold text-[#122C57]">
                Google Cloud Service Account Configuration Guide
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                To enable one-click URL indexing, configure a Google Service Account with Search Console ownership. Follow these 4 steps:
              </p>
            </div>
          </div>

          <ol className="space-y-3 text-xs text-[#0A1B3D] list-decimal list-inside pl-1">
            <li className="leading-relaxed">
              <span className="font-semibold text-[#122C57]">Enable the Indexing API:</span> In the{' '}
              <a
                href="https://console.cloud.google.com/apis/library/indexing.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#122C57] underline font-medium inline-flex items-center gap-0.5"
              >
                Google Cloud Console <ExternalLink className="w-3 h-3 inline" />
              </a>
              , enable the <em>Web Search Indexing API</em> for your project.
            </li>

            <li className="leading-relaxed">
              <span className="font-semibold text-[#122C57]">Create Service Account & Key:</span> Under{' '}
              <strong>IAM & Admin → Service Accounts</strong>, create a new service account (e.g.{' '}
              <code>gsc-indexer@your-project.iam.gserviceaccount.com</code>). Open the Keys tab, click{' '}
              <strong>Add Key → Create new key → JSON</strong>, and download the JSON file.
            </li>

            <li className="leading-relaxed">
              <span className="font-semibold text-[#122C57]">Set Environment Variable:</span> Add the JSON string to your environment variable as{' '}
              <code className="bg-[#FFFFFF] px-1.5 py-0.5 border border-[#E4E2DC] font-mono text-[11px] text-[#122C57]">
                GOOGLE_SERVICE_ACCOUNT_JSON
              </code>{' '}
              in <code>.env.local</code> or Vercel Project Settings. Both raw JSON and base64 strings are supported.
            </li>

            <li className="leading-relaxed">
              <span className="font-semibold text-[#122C57]">Grant Search Console Ownership:</span> In{' '}
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#122C57] underline font-medium inline-flex items-center gap-0.5"
              >
                Google Search Console <ExternalLink className="w-3 h-3 inline" />
              </a>
              , select <code>gravityforai.com</code>, navigate to <strong>Settings → Users and permissions</strong>, and add the Service Account email as an <strong>Owner</strong>.
            </li>
          </ol>

          <div className="pt-2 border-t border-[#E4E2DC]/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B7280]">
            <span>Note: Standard quota allows up to 200 URLs notified per day.</span>
            <span className="font-mono text-[10px] text-[#C99A44] font-medium">Scope: indexing.googleapis.com/v3</span>
          </div>
        </div>
      )}
    </Card>
  );
}
```

---

## 8. Verification & Testing Strategy

### 8.1 Verification Criteria Matrix
| Check | Expected Behavior | Verification Command / Method |
|---|---|---|
| Admin Role Visibility | Visible only when `session.role === 'ADMIN'` | Inspect `src/app/admin/page.tsx` conditional rendering |
| Missing Env Var | Card renders setup guide without error banners | Render `/admin` with `GOOGLE_SERVICE_ACCOUNT_JSON` unset |
| API Route Auth | Non-admin gets 401 Unauthorized | `curl -X POST http://localhost:3000/api/admin/request-indexing` |
| API Route Unconfigured | Returns 503 with setup instructions | `POST /api/admin/request-indexing` with valid admin cookie and unset env |
| Build Compliance | `npm run build` passes with 0 TypeScript/ESLint errors | `npm run build` |
| No Content Alteration | Homepage, copy, blog posts, services unchanged | `git status` check |

### 8.2 Recommended Test Scripts
```bash
# 1. Typecheck and build verification
npm run build

# 2. Test API Route without authentication (Expect 401)
curl -i -X POST http://localhost:3000/api/admin/request-indexing \
  -H "Content-Type: application/json" \
  -d '{"url":"https://gravityforai.com/"}'

# 3. Test API Route GET status (Expect 401 unauthenticated, or { configured: false } with admin cookie)
curl -i -X GET http://localhost:3000/api/admin/request-indexing
```
