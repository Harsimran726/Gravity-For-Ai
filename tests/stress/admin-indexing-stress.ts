/**
 * Empirical Adversarial Stress Test Suite for Admin Indexing API Route
 * Target: src/app/api/admin/request-indexing/route.ts
 *
 * Focus Areas:
 * - Category 1: Negative Authentication & Authorization (20 tests)
 * - Category 2: Request Body & URL Validation Boundaries (22 tests)
 * - Category 3: Environment Variable Resilience & Graceful Degradation (12 tests)
 * - Category 4: Mocked OAuth & Indexing API Integration (6 tests)
 *
 * Total: 60 adversarial test cases
 */

import crypto from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';

// Polyfill AsyncLocalStorage on globalThis before Next.js imports
(globalThis as unknown as { AsyncLocalStorage: typeof AsyncLocalStorage }).AsyncLocalStorage = AsyncLocalStorage;

import { signSession, verifySession, ADMIN_COOKIE_NAME, type AdminSession } from '../../src/lib/auth';
import { POST, GET } from '../../src/app/api/admin/request-indexing/route';

interface StressResult {
  id: string;
  category: string;
  title: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: StressResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, context: string) {
  if (actual !== expected) {
    throw new Error(`${context}: Expected [${expected}], but got [${actual}]`);
  }
}

async function runTestCase(
  id: string,
  category: string,
  title: string,
  fn: () => Promise<void> | void
) {
  const start = performance.now();
  try {
    await fn();
    const durationMs = Math.round(performance.now() - start);
    results.push({ id, category, title, passed: true, durationMs });
    console.log(`  \x1b[32m✔ PASS\x1b[0m [${id}] ${title} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - start);
    results.push({ id, category, title, passed: false, error: err.message, durationMs });
    console.error(`  \x1b[31m✖ FAIL\x1b[0m [${id}] ${title}: ${err.message}`);
  }
}

// Generate valid admin cookie for tests
function createAdminCookie(overrides: Partial<AdminSession> = {}): string {
  const session: AdminSession = {
    id: 'admin-test-id',
    name: 'Admin Tester',
    email: 'admin@gravityforai.com',
    role: 'ADMIN',
    twoFAVerified: true,
    loginTime: new Date().toISOString(),
    ...overrides,
  };
  return signSession(session);
}

// Generate RSA key pair for testing valid RS256 token signing
const rsaKeys = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

async function main() {
  console.log('\n================================================================================');
  console.log('   EMPIRICAL ADVERSARIAL STRESS HARNESS: ADMIN INDEXING API ROUTE');
  console.log('================================================================================\n');

  // Preserve original environment & fetch
  const originalEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const originalFetch = globalThis.fetch;

  try {
    // ═══════════════════════════════════════════════════════════════════════════
    // CATEGORY 1: NEGATIVE AUTHENTICATION & AUTHORIZATION (20 TESTS)
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\x1b[1m\x1b[35m--- CATEGORY 1: AUTHENTICATION & ROLE ENFORCEMENT ---\x1b[0m');

    await runTestCase('AUTH-01', 'AUTH', 'POST with no headers returns 401', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, 'HTTP status');
      const data = await res.json();
      assert(data.error?.includes('Unauthorized'), 'Error message contains Unauthorized');
    });

    await runTestCase('AUTH-02', 'AUTH', 'POST with empty cookie header returns 401', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie: '' },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, 'HTTP status');
    });

    await runTestCase('AUTH-03', 'AUTH', 'POST with unrelated cookies only returns 401', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'ga_session=123; preference_mode=dark; csrftoken=abc',
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, 'HTTP status');
    });

    await runTestCase('AUTH-04', 'AUTH', 'POST with empty admin cookie value returns 401', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `${ADMIN_COOKIE_NAME}=`,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, 'HTTP status');
    });

    await runTestCase('AUTH-05', 'AUTH', 'POST with tampered signature rejected with 401', async () => {
      const validCookie = createAdminCookie();
      const [payload] = validCookie.split('.');
      const tamperedCookie = `${payload}.invalidsignature999999999`;
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `${ADMIN_COOKIE_NAME}=${tamperedCookie}`,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, 'HTTP status');
    });

    await runTestCase('AUTH-06', 'AUTH', 'POST with altered payload and original signature returns 401', async () => {
      const validCookie = createAdminCookie();
      const [, signature] = validCookie.split('.');
      const alteredPayload = Buffer.from(JSON.stringify({ id: 'hacker', role: 'ADMIN' })).toString('base64url');
      const forgedCookie = `${alteredPayload}.${signature}`;
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `${ADMIN_COOKIE_NAME}=${forgedCookie}`,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, 'HTTP status');
    });

    await runTestCase('AUTH-07', 'AUTH', 'POST with signature created from different secret returns 401', async () => {
      const payload = Buffer.from(
        JSON.stringify({ id: '1', role: 'ADMIN', email: 'admin@gravityforai.com' })
      ).toString('base64url');
      const fakeSig = crypto.createHmac('sha256', 'wrong-secret-key-12345').update(payload).digest('base64url');
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `${ADMIN_COOKIE_NAME}=${payload}.${fakeSig}`,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, 'HTTP status');
    });

    await runTestCase('AUTH-08', 'AUTH', 'POST with corrupt base64 payload returns 401 without crash', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `${ADMIN_COOKIE_NAME}=@@@corrupt_base64@@@.some_signature`,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, 'HTTP status');
    });

    await runTestCase('AUTH-09', 'AUTH', 'POST with role VIEWER rejected with 401', async () => {
      const viewerCookie = createAdminCookie({ role: 'VIEWER' });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `${ADMIN_COOKIE_NAME}=${viewerCookie}`,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, 'HTTP status');
    });

    await runTestCase('AUTH-10', 'AUTH', 'POST with role EDITOR rejected with 401', async () => {
      const editorCookie = createAdminCookie({ role: 'EDITOR' });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `${ADMIN_COOKIE_NAME}=${editorCookie}`,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, 'HTTP status');
    });

    await runTestCase('AUTH-11', 'AUTH', 'POST with lowercase role "admin" rejected with 401', async () => {
      const lowercaseCookie = createAdminCookie({ role: 'admin' as any });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `${ADMIN_COOKIE_NAME}=${lowercaseCookie}`,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, 'HTTP status');
    });

    await runTestCase('AUTH-12', 'AUTH', 'POST with whitespace-padded role "ADMIN " rejected with 401', async () => {
      const spaceCookie = createAdminCookie({ role: 'ADMIN ' as any });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `${ADMIN_COOKIE_NAME}=${spaceCookie}`,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, 'HTTP status');
    });

    await runTestCase('AUTH-13', 'AUTH', 'POST with arbitrary custom role "SUPERUSER" rejected with 401', async () => {
      const customCookie = createAdminCookie({ role: 'SUPERUSER' as any });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `${ADMIN_COOKIE_NAME}=${customCookie}`,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, 'HTTP status');
    });

    await runTestCase('AUTH-14', 'AUTH', 'POST with null role rejected with 401', async () => {
      const nullCookie = createAdminCookie({ role: null as any });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `${ADMIN_COOKIE_NAME}=${nullCookie}`,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, 'HTTP status');
    });

    await runTestCase('AUTH-15', 'AUTH', 'GET endpoint rejects unauthenticated request with 401', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'GET',
      });
      const res = await GET(req);
      assertEqual(res.status, 401, 'GET unauth HTTP status');
    });

    await runTestCase('AUTH-16', 'AUTH', 'GET endpoint rejects VIEWER role with 401', async () => {
      const viewerCookie = createAdminCookie({ role: 'VIEWER' });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'GET',
        headers: { cookie: `${ADMIN_COOKIE_NAME}=${viewerCookie}` },
      });
      const res = await GET(req);
      assertEqual(res.status, 401, 'GET viewer HTTP status');
    });

    await runTestCase('AUTH-17', 'AUTH', 'GET endpoint allows ADMIN role and returns 200', async () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      const adminCookie = createAdminCookie({ role: 'ADMIN' });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'GET',
        headers: { cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}` },
      });
      const res = await GET(req);
      assertEqual(res.status, 200, 'GET admin HTTP status');
      const data = await res.json();
      assertEqual(data.configured, false, 'configured status');
      assertEqual(data.setupRequired, true, 'setupRequired status');
    });

    await runTestCase('AUTH-18', 'AUTH', 'Cookie header parsing handles multiple cookies correctly', async () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      const adminCookie = createAdminCookie({ role: 'ADMIN' });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `theme=light; ${ADMIN_COOKIE_NAME}=${adminCookie}; visited=true`,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assert(res.status !== 401, 'Admin cookie amidst multiple cookies must be authenticated');
      assertEqual(res.status, 200, 'Returns 200 setupRequired');
    });

    await runTestCase('AUTH-19', 'AUTH', 'Uppercase Cookie header name is supported', async () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      const adminCookie = createAdminCookie({ role: 'ADMIN' });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}`,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 200, 'Case-insensitive Cookie header supported');
    });

    await runTestCase('AUTH-20', 'AUTH', 'Session cookie with whitespace padding around token is handled safely', async () => {
      const adminCookie = createAdminCookie({ role: 'ADMIN' });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `  ${ADMIN_COOKIE_NAME}=${adminCookie}  `,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assert(res.status !== 500, 'Does not crash on padded cookie header');
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // CATEGORY 2: REQUEST BODY & URL VALIDATION BOUNDARIES (22 TESTS)
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n\x1b[1m\x1b[35m--- CATEGORY 2: URL VALIDATION & MALFORMED PAYLOADS ---\x1b[0m');

    const adminCookie = createAdminCookie();
    const adminHeaders = {
      'Content-Type': 'application/json',
      cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}`,
    };

    await runTestCase('URL-01', 'URL', 'Invalid non-JSON request body rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}` },
        body: 'THIS IS NOT VALID JSON {[[',
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'Non-JSON body returns 400');
    });

    await runTestCase('URL-02', 'URL', 'JSON array body rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify(['https://gravityforai.com/blog/test']),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'Array body returns 400');
    });

    await runTestCase('URL-03', 'URL', 'JSON primitive number body rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify(12345),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'Number body returns 400');
    });

    await runTestCase('URL-04', 'URL', 'Empty JSON object missing url rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({}),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'Empty object returns 400');
    });

    await runTestCase('URL-05', 'URL', 'Body with other fields but no url rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ path: '/blog/test', target: 'https://gravityforai.com' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'Missing url field returns 400');
    });

    await runTestCase('URL-06', 'URL', 'url as numeric type rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 99999 }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'Numeric url returns 400');
    });

    await runTestCase('URL-07', 'URL', 'url as boolean rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: true }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'Boolean url returns 400');
    });

    await runTestCase('URL-08', 'URL', 'Empty string url rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: '' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'Empty string url returns 400');
    });

    await runTestCase('URL-09', 'URL', 'Whitespace-only url rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: '   \t\n  ' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'Whitespace url returns 400');
    });

    await runTestCase('URL-10', 'URL', 'javascript: URI scheme rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'javascript:alert(document.cookie)' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'javascript: URI scheme rejected with 400');
    });

    await runTestCase('URL-11', 'URL', 'data: HTML URI scheme rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'data:text/html,<script>alert(1)</script>' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'data: URI scheme rejected with 400');
    });

    await runTestCase('URL-12', 'URL', 'data: JSON URI scheme rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'data:application/json,{"evil":true}' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'data: JSON rejected with 400');
    });

    await runTestCase('URL-13', 'URL', 'file: local filesystem URI scheme rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'file:///etc/passwd' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'file: URI scheme rejected with 400');
    });

    await runTestCase('URL-14', 'URL', 'ftp: protocol rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'ftp://ftp.example.com/file.txt' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'ftp: rejected with 400');
    });

    await runTestCase('URL-15', 'URL', 'blob: protocol rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'blob:https://gravityforai.com/f04c64b5-684a-4e2a' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'blob: rejected with 400');
    });

    await runTestCase('URL-16', 'URL', 'Protocol-relative URL "//gravityforai.com" rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: '//gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'Protocol-relative URL rejected with 400');
    });

    await runTestCase('URL-17', 'URL', 'Relative pathname URL "/blog/test" rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: '/blog/how-ai-voice-agents-work' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'Relative path rejected with 400');
    });

    await runTestCase('URL-18', 'URL', 'Malformed syntax "https://" rejected with 400', async () => {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, 'Malformed protocol-only URL rejected with 400');
    });

    await runTestCase('URL-19', 'URL', 'Extremely long URL (10KB) does not crash or 500', async () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      const longUrl = 'https://gravityforai.com/blog/' + 'x'.repeat(10000);
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: longUrl }),
      });
      const res = await POST(req);
      assert(res.status !== 500, 'Oversized URL must not return 500');
    });

    await runTestCase('URL-20', 'URL', 'Large JSON payload with extra padding handled safely', async () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      const largePayload = {
        url: 'https://gravityforai.com/blog/test',
        padding: 'A'.repeat(50000),
      };
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify(largePayload),
      });
      const res = await POST(req);
      assert(res.status !== 500, 'Large body must not return 500');
      assertEqual(res.status, 200, 'Processes url correctly and returns 200 setupRequired');
    });

    await runTestCase('URL-21', 'URL', 'Valid HTTP URL is accepted for processing', async () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'http://gravityforai.com/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 200, 'Valid HTTP URL accepted');
    });

    await runTestCase('URL-22', 'URL', 'Valid HTTPS URL with query parameters and anchor accepted', async () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          url: 'https://gravityforai.com/locations/mansa?utm_source=test#contact',
        }),
      });
      const res = await POST(req);
      assertEqual(res.status, 200, 'Valid HTTPS URL with query/hash accepted');
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // CATEGORY 3: ENVIRONMENT VARIABLE RESILIENCE & ERROR HANDLING (12 TESTS)
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n\x1b[1m\x1b[35m--- CATEGORY 3: GOOGLE_SERVICE_ACCOUNT_JSON RESILIENCE ---\x1b[0m');

    await runTestCase('ENV-01', 'ENV', 'Missing env var returns 200 with setupRequired: true', async () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 200, 'Status must be 200 (setup required)');
      const data = await res.json();
      assertEqual(data.success, false, 'success');
      assertEqual(data.setupRequired, true, 'setupRequired');
      assert(data.message?.includes('GOOGLE_SERVICE_ACCOUNT_JSON'), 'Informative setup message');
    });

    await runTestCase('ENV-02', 'ENV', 'Missing env var response contains no stack trace leak', async () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      const text = await res.text();
      assert(!text.includes('at async'), 'No "at async" stack trace leak');
      assert(!text.includes('node_modules'), 'No "node_modules" leak');
      assert(!text.includes('C:\\'), 'No Windows path leak');
    });

    await runTestCase('ENV-03', 'ENV', 'Empty string env var handled gracefully with 200 setupRequired', async () => {
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON = '';
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 200, 'Status 200');
      const data = await res.json();
      assertEqual(data.setupRequired, true, 'setupRequired');
    });

    await runTestCase('ENV-04', 'ENV', 'Whitespace-only env var handled gracefully with 200 setupRequired', async () => {
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON = '   \n\t   ';
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 200, 'Status 200');
      const data = await res.json();
      assertEqual(data.setupRequired, true, 'setupRequired');
    });

    await runTestCase('ENV-05', 'ENV', 'Corrupted non-JSON string env var handled gracefully without 500', async () => {
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON = '{ invalid json credentials content here...';
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 200, 'Status 200');
      const data = await res.json();
      assertEqual(data.setupRequired, true, 'setupRequired');
    });

    await runTestCase('ENV-06', 'ENV', 'Empty JSON object env var "{}" handled gracefully', async () => {
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON = '{}';
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 200, 'Status 200');
      const data = await res.json();
      assertEqual(data.setupRequired, true, 'setupRequired');
    });

    await runTestCase('ENV-07', 'ENV', 'Env var missing private_key handled gracefully', async () => {
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
        client_email: 'service-account@project.iam.gserviceaccount.com',
      });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 200, 'Status 200');
      const data = await res.json();
      assertEqual(data.setupRequired, true, 'setupRequired');
    });

    await runTestCase('ENV-08', 'ENV', 'Env var missing client_email handled gracefully', async () => {
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
        private_key: '-----BEGIN PRIVATE KEY-----\nMIIE...',
      });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 200, 'Status 200');
      const data = await res.json();
      assertEqual(data.setupRequired, true, 'setupRequired');
    });

    await runTestCase('ENV-09', 'ENV', 'Base64-encoded valid JSON credentials parsed correctly', async () => {
      const creds = {
        client_email: 'indexer@test.iam.gserviceaccount.com',
        private_key: rsaKeys.privateKey,
        project_id: 'test-project',
      };
      const base64Str = Buffer.from(JSON.stringify(creds)).toString('base64');
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON = base64Str;

      const getReq = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'GET',
        headers: adminHeaders,
      });
      const getRes = await GET(getReq);
      assertEqual(getRes.status, 200, 'GET status');
      const getData = await getRes.json();
      assertEqual(getData.configured, true, 'configured status');
      assertEqual(getData.clientEmail, creds.client_email, 'clientEmail parsed');
      assertEqual(getData.setupRequired, false, 'setupRequired false');
    });

    await runTestCase('ENV-10', 'ENV', 'Base64-encoded corrupted data handled gracefully', async () => {
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON = Buffer.from('NOT JSON AT ALL').toString('base64');
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 200, 'Status 200');
      const data = await res.json();
      assertEqual(data.setupRequired, true, 'setupRequired true');
    });

    await runTestCase('ENV-11', 'ENV', 'Invalid PEM key in env var fails safely with 502 (Bad Gateway)', async () => {
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
        client_email: 'test@iam.gserviceaccount.com',
        private_key: 'NOT_A_VALID_PEM_KEY_FORMAT',
      });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 502, 'Crypto sign failure returns 502');
      const data = await res.json();
      assertEqual(data.success, false, 'success');
      assert(data.error?.includes('Google Service Account authentication failed'), 'Informative auth error');
    });

    await runTestCase('ENV-12', 'ENV', 'Escaped newlines in private_key (\\n) normalized properly', async () => {
      // Test that private_key.replace(/\\n/g, '\n') works with serialized PEM
      const serializedPem = rsaKeys.privateKey.replace(/\n/g, '\\n');
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
        client_email: 'test@iam.gserviceaccount.com',
        private_key: serializedPem,
      });

      // Mock oauth endpoint to verify signing succeeded
      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const urlStr = input.toString();
        if (urlStr === 'https://oauth2.googleapis.com/token') {
          return new Response(JSON.stringify({ access_token: 'valid-mock-token' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        if (urlStr === 'https://indexing.googleapis.com/v3/urlNotifications:publish') {
          return new Response(
            JSON.stringify({
              urlNotificationMetadata: {
                latestUpdate: { notifyTime: '2026-10-03T00:00:00Z', type: 'URL_UPDATED' },
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 200, 'Escaped newlines normalized and signing passed');
      const data = await res.json();
      assertEqual(data.success, true, 'success');
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // CATEGORY 4: MOCKED GOOGLE API INTERACTIONS & STATUS RESPONSES (6 TESTS)
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n\x1b[1m\x1b[35m--- CATEGORY 4: MOCKED GOOGLE API INTERACTIONS ---\x1b[0m');

    // Configure valid mock credentials
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
      client_email: 'gsc-bot@gravityforai.iam.gserviceaccount.com',
      private_key: rsaKeys.privateKey,
    });

    await runTestCase('MOCK-01', 'MOCK', 'Successful 200 publish to Google Indexing API returns complete payload', async () => {
      globalThis.fetch = async (input: RequestInfo | URL) => {
        const url = input.toString();
        if (url === 'https://oauth2.googleapis.com/token') {
          return new Response(JSON.stringify({ access_token: 'google-access-token-123' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        if (url === 'https://indexing.googleapis.com/v3/urlNotifications:publish') {
          return new Response(
            JSON.stringify({
              urlNotificationMetadata: {
                url: 'https://gravityforai.com/locations/mansa',
                latestUpdate: {
                  url: 'https://gravityforai.com/locations/mansa',
                  type: 'URL_UPDATED',
                  notifyTime: '2026-10-03T12:00:00.000Z',
                },
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/locations/mansa' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 200, 'HTTP status 200');
      const data = await res.json();
      assertEqual(data.success, true, 'success true');
      assertEqual(data.url, 'https://gravityforai.com/locations/mansa', 'url');
      assertEqual(data.type, 'URL_UPDATED', 'type');
      assertEqual(data.notifyTime, '2026-10-03T12:00:00.000Z', 'notifyTime');
    });

    await runTestCase('MOCK-02', 'MOCK', 'Google 403 Forbidden returns 403 with GSC Owner permission hint', async () => {
      globalThis.fetch = async (input: RequestInfo | URL) => {
        const url = input.toString();
        if (url === 'https://oauth2.googleapis.com/token') {
          return new Response(JSON.stringify({ access_token: 'google-access-token-123' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        if (url === 'https://indexing.googleapis.com/v3/urlNotifications:publish') {
          return new Response(
            JSON.stringify({
              error: {
                code: 403,
                message: 'Permission denied. Failed to verify ownership.',
                status: 'PERMISSION_DENIED',
              },
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/locations/mansa' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 403, 'Propagates 403');
      const data = await res.json();
      assertEqual(data.success, false, 'success false');
      assert(data.error?.includes('OWNER in Google Search Console'), 'Contains GSC OWNER hint');
    });

    await runTestCase('MOCK-03', 'MOCK', 'Google 429 Rate Limit returns 429 without crash', async () => {
      globalThis.fetch = async (input: RequestInfo | URL) => {
        const url = input.toString();
        if (url === 'https://oauth2.googleapis.com/token') {
          return new Response(JSON.stringify({ access_token: 'google-access-token-123' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        if (url === 'https://indexing.googleapis.com/v3/urlNotifications:publish') {
          return new Response(
            JSON.stringify({
              error: {
                code: 429,
                message: 'Quota exceeded for quota metric Indexing API requests.',
                status: 'RESOURCE_EXHAUSTED',
              },
            }),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/locations/mansa' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 429, 'Propagates 429');
      const data = await res.json();
      assertEqual(data.success, false, 'success false');
    });

    await runTestCase('MOCK-04', 'MOCK', 'OAuth token rejection (400 invalid_grant) returns 502 Bad Gateway', async () => {
      globalThis.fetch = async (input: RequestInfo | URL) => {
        const url = input.toString();
        if (url === 'https://oauth2.googleapis.com/token') {
          return new Response(
            JSON.stringify({
              error: 'invalid_grant',
              error_description: 'Invalid JWT Signature.',
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/locations/mansa' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 502, 'OAuth failure returns 502');
      const data = await res.json();
      assertEqual(data.success, false, 'success false');
      assert(data.error?.includes('Invalid JWT Signature'), 'Informative OAuth description included');
    });

    await runTestCase('MOCK-05', 'MOCK', 'OAuth token response missing access_token returns 502', async () => {
      globalThis.fetch = async (input: RequestInfo | URL) => {
        const url = input.toString();
        if (url === 'https://oauth2.googleapis.com/token') {
          return new Response(JSON.stringify({ token_type: 'Bearer' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/locations/mansa' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 502, 'Missing access_token returns 502');
    });

    await runTestCase('MOCK-06', 'MOCK', 'Network failure during OAuth call returns 502 safely', async () => {
      globalThis.fetch = async () => {
        throw new Error('ECONNREFUSED connect to oauth2.googleapis.com:443');
      };

      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ url: 'https://gravityforai.com/locations/mansa' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 502, 'Network error returns 502');
    });

  } finally {
    // Restore environment & fetch
    if (originalEnv !== undefined) {
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON = originalEnv;
    } else {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    }
    globalThis.fetch = originalFetch;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY REPORT
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n================================================================================');
  console.log('                          STRESS HARNESS EXECUTION SUMMARY');
  console.log('================================================================================');

  const categories = ['AUTH', 'URL', 'ENV', 'MOCK'];
  for (const cat of categories) {
    const catTests = results.filter((r) => r.category === cat);
    const catPassed = catTests.filter((r) => r.passed).length;
    const catFailed = catTests.filter((r) => !r.passed).length;
    console.log(
      `  Category ${cat.padEnd(5)}: ${catPassed}/${catTests.length} passed (${Math.round((catPassed / catTests.length) * 100)}%) ${catFailed > 0 ? `[${catFailed} FAILED]` : ''}`
    );
  }

  const totalPassed = results.filter((r) => r.passed).length;
  const totalFailed = results.filter((r) => !r.passed).length;
  console.log('\nTotals:');
  console.log(`  Total Run: ${results.length}`);
  console.log(`  Passed:    \x1b[32m${totalPassed}\x1b[0m`);
  console.log(`  Failed:    ${totalFailed > 0 ? `\x1b[31m${totalFailed}\x1b[0m` : `\x1b[32m0\x1b[0m`}`);

  if (totalFailed === 0) {
    console.log('\n\x1b[42m\x1b[1m\x1b[37m  ALL 60 ADVERSARIAL STRESS TESTS PASSED (100% SUCCESS)  \x1b[0m\n');
    process.exit(0);
  } else {
    console.log(`\n\x1b[41m\x1b[1m\x1b[37m  ${totalFailed} TEST(S) FAILED  \x1b[0m\n`);
    process.exit(1);
  }
}

main().catch((fatal) => {
  console.error('\x1b[41mFATAL STRESS ERROR:\x1b[0m', fatal);
  process.exit(1);
});
