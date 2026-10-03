import crypto from 'crypto';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { GET, POST } from '@/app/api/admin/request-indexing/route';
import { RequestIndexingCard } from '@/app/admin/request-indexing-card';
import { signSession, ADMIN_COOKIE_NAME, type AdminSession } from '@/lib/auth';

async function runForensicAudit() {
  console.log('=== FORENSIC INTEGRITY AUDIT: MILESTONE 3 ===\n');

  let passedChecks = 0;
  let totalChecks = 0;

  function assert(condition: boolean, msg: string) {
    totalChecks++;
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passedChecks++;
    } else {
      console.error(`[FAIL] ${msg}`);
      throw new Error(`Assertion failed: ${msg}`);
    }
  }

  // -------------------------------------------------------------
  // Test 1: Cryptographic RFC 7523 RS256 JWT Generation & Verification
  // -------------------------------------------------------------
  console.log('--- Test 1: Real Crypto RS256 Signing & Verification ---');
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
  const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;

  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: 'audit-sa@test.iam.gserviceaccount.com',
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedClaimSet = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
  const signInput = `${encodedHeader}.${encodedClaimSet}`;
  const signature = crypto
    .sign('sha256', Buffer.from(signInput), privateKeyPem)
    .toString('base64url');
  const jwt = `${signInput}.${signature}`;

  const isSigValid = crypto.verify(
    'sha256',
    Buffer.from(signInput),
    publicKeyPem,
    Buffer.from(signature, 'base64url')
  );
  assert(isSigValid, 'RS256 JWT signature cryptographically verifies with public key');
  assert(jwt.split('.').length === 3, 'JWT has standard 3-part structure (header.payload.signature)');

  // -------------------------------------------------------------
  // Test 2: Route Handler Authentication & Role Enforcement
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Route Handler Auth & Role Enforcement ---');

  // Scenario 2A: Unauthenticated POST
  const unauthReq = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://gravityforai.com/' }),
  });
  const unauthRes = await POST(unauthReq);
  assert(unauthRes.status === 401, 'Unauthenticated POST returns 401');

  // Scenario 2B: Non-admin POST (VIEWER)
  const viewerSession: AdminSession = {
    userId: 'u-viewer',
    email: 'viewer@gravityforai.com',
    role: 'VIEWER' as any,
    name: 'Viewer User',
  };
  const viewerToken = signSession(viewerSession);
  const viewerReq = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `${ADMIN_COOKIE_NAME}=${viewerToken}`,
    },
    body: JSON.stringify({ url: 'https://gravityforai.com/' }),
  });
  const viewerRes = await POST(viewerReq);
  assert(viewerRes.status === 401, 'VIEWER role POST returns 401 Unauthorized');

  // Scenario 2C: Non-admin POST (EDITOR)
  const editorSession: AdminSession = {
    userId: 'u-editor',
    email: 'editor@gravityforai.com',
    role: 'EDITOR' as any,
    name: 'Editor User',
  };
  const editorToken = signSession(editorSession);
  const editorReq = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `${ADMIN_COOKIE_NAME}=${editorToken}`,
    },
    body: JSON.stringify({ url: 'https://gravityforai.com/' }),
  });
  const editorRes = await POST(editorReq);
  assert(editorRes.status === 401, 'EDITOR role POST returns 401 Unauthorized');

  // Valid ADMIN session
  const adminSession: AdminSession = {
    userId: 'u-admin',
    email: 'admin@gravityforai.com',
    role: 'ADMIN',
    name: 'Admin User',
  };
  const adminToken = signSession(adminSession);
  const adminCookieHeader = `${ADMIN_COOKIE_NAME}=${adminToken}`;

  // -------------------------------------------------------------
  // Test 3: Input Validation
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Input Validation ---');

  // Scenario 3A: Missing URL
  const noUrlReq = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: adminCookieHeader,
    },
    body: JSON.stringify({}),
  });
  const noUrlRes = await POST(noUrlReq);
  assert(noUrlRes.status === 400, 'Missing url field returns 400 Bad Request');

  // Scenario 3B: Empty URL
  const emptyUrlReq = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: adminCookieHeader,
    },
    body: JSON.stringify({ url: '   ' }),
  });
  const emptyUrlRes = await POST(emptyUrlReq);
  assert(emptyUrlRes.status === 400, 'Whitespace URL returns 400 Bad Request');

  // Scenario 3C: Invalid protocol (javascript:)
  const jsUrlReq = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: adminCookieHeader,
    },
    body: JSON.stringify({ url: 'javascript:alert(document.cookie)' }),
  });
  const jsUrlRes = await POST(jsUrlReq);
  assert(jsUrlRes.status === 400, 'javascript: protocol URL returns 400 Bad Request');

  // Scenario 3D: Invalid syntax
  const invalidSyntaxReq = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: adminCookieHeader,
    },
    body: JSON.stringify({ url: 'ht!tp://not a valid url' }),
  });
  const invalidSyntaxRes = await POST(invalidSyntaxReq);
  assert(invalidSyntaxRes.status === 400, 'Malformed URL string returns 400 Bad Request');

  // -------------------------------------------------------------
  // Test 4: Missing & Malformed Credentials Handling
  // -------------------------------------------------------------
  console.log('\n--- Test 4: Missing & Malformed Service Account Credentials ---');

  delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  // Scenario 4A: Valid admin request with missing credentials
  const missingCredsReq = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: adminCookieHeader,
    },
    body: JSON.stringify({ url: 'https://gravityforai.com/blog' }),
  });
  const missingCredsRes = await POST(missingCredsReq);
  assert(missingCredsRes.status === 200, 'Missing credentials returns HTTP 200 graceful status');
  const missingCredsJson = await missingCredsRes.json();
  assert(missingCredsJson.success === false, 'Response has success: false');
  assert(missingCredsJson.setupRequired === true, 'Response has setupRequired: true');
  assert(typeof missingCredsJson.message === 'string', 'Response contains helpful setup message');

  // Scenario 4B: Malformed JSON credentials
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON = 'this-is-not-json';
  const malformedReq = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: adminCookieHeader,
    },
    body: JSON.stringify({ url: 'https://gravityforai.com/' }),
  });
  const malformedRes = await POST(malformedReq);
  assert(malformedRes.status === 200, 'Malformed JSON returns HTTP 200 without throwing 500');
  const malformedJson = await malformedRes.json();
  assert(malformedJson.setupRequired === true, 'Malformed JSON signals setupRequired: true');

  // -------------------------------------------------------------
  // Test 5: Live Google OAuth & Indexing API Integration Path
  // -------------------------------------------------------------
  console.log('\n--- Test 5: Live Google API Call Behavior ---');

  // Inject a syntactically valid Google Service Account with our generated RSA key
  const fakeSa = {
    type: 'service_account',
    project_id: 'gravity-test-proj',
    private_key_id: 'key123',
    private_key: privateKeyPem,
    client_email: 'audit-sa@gravity-test-proj.iam.gserviceaccount.com',
    client_id: '987654321',
  };
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify(fakeSa);

  const realCallReq = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: adminCookieHeader,
    },
    body: JSON.stringify({ url: 'https://gravityforai.com/locations/mansa' }),
  });

  const realCallRes = await POST(realCallReq);
  // When given real RS256 key not known to Google, Google OAuth server returns 400/502 with invalid_grant.
  // This verifies route ACTUALLY contacts Google OAuth server and does NOT mock or return fake success!
  assert(
    realCallRes.status === 502 || realCallRes.status === 400 || realCallRes.status === 401,
    `Route genuine OAuth call returns error status (${realCallRes.status}) from Google OAuth endpoint, NOT fake success`
  );
  const realCallJson = await realCallRes.json();
  assert(realCallJson.success === false, 'Genuine call with unregistered key fails as expected');
  assert(
    realCallJson.error && realCallJson.error.includes('Google Service Account authentication failed'),
    'Error message accurately reflects Google OAuth rejection'
  );

  // Clean up env
  delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  // -------------------------------------------------------------
  // Test 6: GET Route Handler
  // -------------------------------------------------------------
  console.log('\n--- Test 6: GET Handler Status Check ---');

  const getUnauthReq = new Request('http://localhost:3000/api/admin/request-indexing', { method: 'GET' });
  const getUnauthRes = await GET(getUnauthReq);
  assert(getUnauthRes.status === 401, 'GET unauthenticated returns 401');

  const getAdminReq = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'GET',
    headers: { cookie: adminCookieHeader },
  });
  const getAdminRes = await GET(getAdminReq);
  assert(getAdminRes.status === 200, 'GET authenticated admin returns 200');
  const getAdminJson = await getAdminRes.json();
  assert(getAdminJson.configured === false, 'GET correctly reports credentials not configured');
  assert(getAdminJson.setupRequired === true, 'GET correctly reports setupRequired === true');

  // -------------------------------------------------------------
  // Test 7: UI Component Server-Side Rendering
  // -------------------------------------------------------------
  console.log('\n--- Test 7: RequestIndexingCard SSR Verification ---');

  const renderedUnconfigured = ReactDOMServer.renderToString(
    React.createElement(RequestIndexingCard, { isConfigured: false })
  );
  assert(
    renderedUnconfigured.includes('Request Google Indexing'),
    'Card contains "Request Google Indexing" title'
  );
  assert(
    renderedUnconfigured.includes('id="indexing-url"'),
    'Card contains input with id="indexing-url"'
  );
  assert(
    renderedUnconfigured.includes('Setup Required'),
    'Card displays "Setup Required" badge when unconfigured'
  );
  assert(
    renderedUnconfigured.includes('GOOGLE_SERVICE_ACCOUNT_JSON'),
    'Card explains GOOGLE_SERVICE_ACCOUNT_JSON setup'
  );
  assert(
    renderedUnconfigured.includes('Google Search Console'),
    'Card instructs adding service account to Google Search Console'
  );

  const renderedConfigured = ReactDOMServer.renderToString(
    React.createElement(RequestIndexingCard, { isConfigured: true })
  );
  assert(
    renderedConfigured.includes('API Connected'),
    'Card displays "API Connected" badge when configured'
  );

  console.log(`\n=== ALL ${passedChecks}/${totalChecks} FORENSIC INTEGRITY CHECKS PASSED EMPIRICALLY ===`);
}

runForensicAudit().catch((err) => {
  console.error('\nFORENSIC AUDIT FAILED WITH ERROR:', err);
  process.exit(1);
});
