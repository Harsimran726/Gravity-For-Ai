import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminSession, verifySession, ADMIN_COOKIE_NAME, type AdminSession } from '@/lib/auth';

interface GoogleServiceAccount {
  client_email: string;
  private_key: string;
  project_id?: string;
}

/**
 * Safely parse Google Cloud Service Account credentials from environment variables.
 * Handles both raw JSON and base64-encoded strings, and normalizes escaped newlines in PEM keys.
 */
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
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.client_email || typeof parsed.client_email !== 'string') return null;
    if (!parsed.private_key || typeof parsed.private_key !== 'string') return null;

    return {
      client_email: parsed.client_email,
      private_key: parsed.private_key.replace(/\\n/g, '\n'),
      project_id: parsed.project_id,
    };
  } catch {
    return null;
  }
}

/**
 * Resolves current admin session.
 * Supports standard Next.js request cookies as well as Request header fallback for test runners.
 */
async function resolveAdminSession(request?: Request): Promise<AdminSession | null> {
  try {
    const session = await getAdminSession();
    if (session) return session;
  } catch {
    // Next.js cookies() was invoked outside an active request context (e.g. standalone test execution)
  }

  if (request) {
    const cookieHeader = request.headers.get('cookie') || request.headers.get('Cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
      if (match && match[1]) {
        return verifySession(match[1]);
      }
    }
  }

  return null;
}

/**
 * Obtains a Google OAuth2 Bearer Access Token using zero-dependency RS256 JWT signing.
 */
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

/**
 * GET /api/admin/request-indexing
 * Checks whether Google Service Account credentials are configured.
 */
export async function GET(request: Request) {
  const session = await resolveAdminSession(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
  }

  const creds = getGoogleCredentials();
  return NextResponse.json({
    configured: Boolean(creds),
    clientEmail: creds ? creds.client_email : null,
    setupRequired: !creds,
    message: creds
      ? 'Google Service Account configured'
      : 'Google Service Account credentials not configured. Please add GOOGLE_SERVICE_ACCOUNT_JSON to your environment variables.',
  });
}

/**
 * POST /api/admin/request-indexing
 * Validates target URL and submits an indexing notification to Google Search Console Indexing API (v3).
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate admin user
    const session = await resolveAdminSession(request);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    // 2. Validate request body
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || typeof body.url !== 'string' || !body.url.trim()) {
      return NextResponse.json(
        { error: 'URL is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate URL protocol and syntax
    let targetUrl: string;
    try {
      const parsed = new URL(body.url.trim());
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return NextResponse.json(
          { error: 'Invalid URL: must use http or https protocol' },
          { status: 400 }
        );
      }
      targetUrl = parsed.toString();
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // 3. Inspect Service Account configuration
    const creds = getGoogleCredentials();
    if (!creds) {
      return NextResponse.json(
        {
          success: false,
          setupRequired: true,
          message: 'Google Service Account credentials not configured. Please add GOOGLE_SERVICE_ACCOUNT_JSON to your environment variables.',
        },
        { status: 200 }
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
          success: false,
          error: `Google Service Account authentication failed: ${String(authErr instanceof Error ? authErr.message : authErr)}`,
        },
        { status: 502 }
      );
    }

    // 5. Call Google Indexing API v3
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
        hint = ` Ensure the service account email (${creds.client_email}) is added as an OWNER in Google Search Console for this property.`;
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

    // 6. Return successful response
    const notifyTime =
      indexingData.urlNotificationMetadata?.latestUpdate?.notifyTime || new Date().toISOString();

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
    return NextResponse.json(
      { error: 'Internal server error while processing indexing request' },
      { status: 500 }
    );
  }
}
