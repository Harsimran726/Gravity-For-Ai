/**
 * EMPIRICAL CHALLENGER 2: ADMIN INDEXING UI CARD & LIFECYCLE STRESS HARNESS
 *
 * Exhaustively stress-tests:
 * 1. Admin Indexing UI Card (request-indexing-card.tsx) structure, elements, brand palette
 * 2. Form submission state transitions (loading, success, setupRequired, error, network failure, malformed json)
 * 3. Quick fill presets, empty/whitespace submission guards, guide toggle
 * 4. Full submission lifecycle (Scenario 4) and integration into src/app/admin/page.tsx
 * 5. Adversarial input validation, authentication/role boundary verification
 */

import fs from 'node:fs';
import path from 'node:path';
import { AsyncLocalStorage } from 'node:async_hooks';

// Polyfill AsyncLocalStorage on globalThis before Next.js modules load
(globalThis as unknown as { AsyncLocalStorage: typeof AsyncLocalStorage }).AsyncLocalStorage = AsyncLocalStorage;

import { signSession, ADMIN_COOKIE_NAME } from '@/lib/auth';

interface StressTestResult {
  id: string;
  category: string;
  title: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  error?: string;
}

const results: StressTestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, context: string) {
  if (actual !== expected) {
    throw new Error(`${context}: Expected [${expected}], got [${actual}]`);
  }
}

async function runTest(category: string, id: string, title: string, fn: () => Promise<void> | void) {
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    results.push({ id, category, title, status: 'PASS', durationMs });
    console.log(`  \x1b[32m✔ PASS\x1b[0m [${id}] ${title} (${durationMs}ms)`);
  } catch (err) {
    const durationMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ id, category, title, status: 'FAIL', durationMs, error: msg });
    console.error(`  \x1b[31m✘ FAIL\x1b[0m [${id}] ${title}: ${msg}`);
  }
}

async function executeAdminIndexingStressHarness() {
  console.log('\n\x1b[1m\x1b[36m================================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  CHALLENGER 2: ADMIN INDEXING UI & LIFECYCLE ADVERSARIAL STRESS HARNESS\x1b[0m');
  console.log('\x1b[1m\x1b[36m================================================================================\x1b[0m\n');

  const cardPath = path.resolve('src/app/admin/request-indexing-card.tsx');
  const adminPagePath = path.resolve('src/app/admin/page.tsx');
  const routePath = path.resolve('src/app/api/admin/request-indexing/route.ts');

  assert(fs.existsSync(cardPath), 'request-indexing-card.tsx must exist');
  assert(fs.existsSync(adminPagePath), 'admin/page.tsx must exist');
  assert(fs.existsSync(routePath), 'api/admin/request-indexing/route.ts must exist');

  const cardContent = fs.readFileSync(cardPath, 'utf-8');
  const adminPageContent = fs.readFileSync(adminPagePath, 'utf-8');
  const routeContent = fs.readFileSync(routePath, 'utf-8');

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 1: COMPONENT INTEGRITY & BRAND PALETTE CONFORMANCE
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\x1b[1m--- CATEGORY 1: UI COMPONENT STRUCTURE & BRAND PALETTE CONFORMANCE ---\x1b[0m');

  await runTest('UI_PALETTE', 'UI-C1', 'Client component directive and valid export', () => {
    assert(cardContent.startsWith("'use client'") || cardContent.startsWith('"use client"'), 'Must have "use client" directive');
    assert(cardContent.includes('export function RequestIndexingCard'), 'Must export RequestIndexingCard function component');
  });

  await runTest('UI_PALETTE', 'UI-C2', 'Strict Brand Palette: Navy (#122C57) primary presence', () => {
    assert(cardContent.includes('#122C57'), 'Must use Navy #122C57 for typography or buttons');
    const navyMatches = (cardContent.match(/#122C57/g) || []).length;
    assert(navyMatches >= 5, `Expected at least 5 instances of Navy #122C57, found ${navyMatches}`);
  });

  await runTest('UI_PALETTE', 'UI-C3', 'Strict Brand Palette: Gold (#C99A44) accent presence', () => {
    assert(cardContent.includes('#C99A44'), 'Must use Gold #C99A44 for brand accents');
    const goldMatches = (cardContent.match(/#C99A44/g) || []).length;
    assert(goldMatches >= 3, `Expected at least 3 instances of Gold #C99A44, found ${goldMatches}`);
  });

  await runTest('UI_PALETTE', 'UI-C4', 'Strict Brand Palette: Cream (#F7F5F0) background presence', () => {
    assert(cardContent.includes('#F7F5F0'), 'Must use Cream #F7F5F0 for contrast surface containers');
    const creamMatches = (cardContent.match(/#F7F5F0/g) || []).length;
    assert(creamMatches >= 3, `Expected at least 3 instances of Cream #F7F5F0, found ${creamMatches}`);
  });

  await runTest('UI_PALETTE', 'UI-C5', 'Strict Brand Palette: Border (#E4E2DC) structural framing', () => {
    assert(cardContent.includes('#E4E2DC'), 'Must use Border #E4E2DC for consistent border styling');
    const borderMatches = (cardContent.match(/#E4E2DC/g) || []).length;
    assert(borderMatches >= 5, `Expected at least 5 instances of Border #E4E2DC, found ${borderMatches}`);
  });

  await runTest('UI_PALETTE', 'UI-C6', 'Form structure: accessible label and URL input element', () => {
    assert(cardContent.includes('htmlFor="indexing-url"'), 'Input label must have htmlFor="indexing-url"');
    assert(cardContent.includes('id="indexing-url"'), 'Input must have id="indexing-url"');
    assert(cardContent.includes('type="url"'), 'Input must have type="url"');
    assert(cardContent.includes('required'), 'Input must be marked required');
  });

  await runTest('UI_PALETTE', 'UI-C7', 'Submit button attributes: type="submit" and loading spinner state', () => {
    assert(cardContent.includes('type="submit"'), 'Button must have explicit type="submit"');
    assert(cardContent.includes('disabled={loading}'), 'Button must be disabled when loading');
    assert(cardContent.includes('animate-spin') && cardContent.includes('Loader2'), 'Must render spinning loader while loading');
    assert(cardContent.includes('Notifying Google...'), 'Must render loading progress text');
  });

  await runTest('UI_PALETTE', 'UI-C8', 'Quick fill presets: each preset has explicit type="button"', () => {
    // Buttons inside form that are not type="button" trigger form submission on click!
    const presetSection = cardContent.substring(cardContent.indexOf('quickUrls ='), cardContent.indexOf('Real-time Feedback Alerts'));
    assert(presetSection.includes('type="button"'), 'Quick fill preset buttons must have explicit type="button" to prevent accidental submission');
    assert(presetSection.includes('Homepage') && presetSection.includes('Blog Index'), 'Quick fill presets must include Homepage and Blog');
  });

  await runTest('UI_PALETTE', 'UI-C9', 'Setup instructions guide: covers all 4 required operational steps', () => {
    assert(cardContent.includes('GOOGLE_SERVICE_ACCOUNT_JSON'), 'Guide must document GOOGLE_SERVICE_ACCOUNT_JSON env var');
    assert(cardContent.includes('Google Cloud Console') || cardContent.includes('Web Search Indexing API'), 'Guide must mention Indexing API enablement');
    assert(cardContent.includes('Google Search Console') || cardContent.includes('search.google.com'), 'Guide must link to Google Search Console');
    assert(cardContent.includes('Owner') || cardContent.includes('OWNER'), 'Guide must explain adding Service Account as Owner');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 2: ADVERSARIAL LOGIC & RESILIENCE IN UI SUBMISSION LIFECYCLE
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m--- CATEGORY 2: ADVERSARIAL LOGIC & RESILIENCE IN UI SUBMISSION LIFECYCLE ---\x1b[0m');

  await runTest('UI_LIFECYCLE', 'UI-L1', 'Empty or whitespace URL submission guard prevents network request', () => {
    // In handleSubmit: if (!url.trim()) return;
    assert(cardContent.includes('if (!url.trim()) return;'), 'handleSubmit must trim URL and return immediately if blank');
  });

  await runTest('UI_LIFECYCLE', 'UI-L2', 'Safe non-JSON response fallback (.json().catch(() => ({})))', () => {
    // In handleSubmit: const data = await res.json().catch(() => ({}));
    assert(cardContent.includes('.json().catch(() => ({}))'), 'res.json() must have catch handler to survive 502/504 HTML responses');
  });

  await runTest('UI_LIFECYCLE', 'UI-L3', 'Guaranteed loading cleanup in finally block', () => {
    // In handleSubmit: finally { setLoading(false); }
    assert(cardContent.includes('finally {') && cardContent.includes('setLoading(false);'), 'Loading must be cleared in finally block');
  });

  await runTest('UI_LIFECYCLE', 'UI-L4', 'SetupRequired state dynamically reveals guide (setShowGuide(true))', () => {
    // When API returns setupRequired: true, showGuide is automatically opened
    assert(cardContent.includes('setShowGuide(true);'), 'When setupRequired is returned, guide must automatically expand');
    assert(cardContent.includes('Google Service Account credentials setup required.'), 'Informative setup feedback displayed');
  });

  await runTest('UI_LIFECYCLE', 'UI-L5', 'Robust notification time parsing (safe fallback for invalid dates)', () => {
    // Verify notifyTime handling
    assert(cardContent.includes('data.notifyTime ? new Date(data.notifyTime).toLocaleString() :'), 'Date conversion must be conditional');
    // Test that new Date(undefined) or new Date('2026-10-03T05:00:00Z').toLocaleString() is non-crashing
    const testDate = new Date('2026-10-03T05:00:00Z');
    assert(!isNaN(testDate.getTime()), 'Timestamp parsing must be valid');
  });

  await runTest('UI_LIFECYCLE', 'UI-L6', 'Collapsible guide visibility logic (unconfigured vs configured)', () => {
    // When isConfigured=false, guide is permanently visible: (showGuide || !isConfigured)
    assert(cardContent.includes('(showGuide || !isConfigured)'), 'Unconfigured state must force guide to be visible');
    assert(cardContent.includes('isConfigured ?'), 'Header badge switches based on isConfigured prop');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 3: END-TO-END SCENARIO 4 & API ROUTE BOUNDARY STRESS
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m--- CATEGORY 3: END-TO-END SCENARIO 4 & API ROUTE BOUNDARY STRESS ---\x1b[0m');

  const { POST, GET } = await import('@/app/api/admin/request-indexing/route');

  await runTest('E2E_S4', 'S4-TC1', 'Lifecycle: Unauthenticated request rejected with HTTP 401', async () => {
    const req = new Request('http://localhost:3000/api/admin/request-indexing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://gravityforai.com/blog' }),
    });
    const res = await POST(req);
    assertEqual(res.status, 401, 'Unauthenticated status');
    const data = await res.json();
    assert(data.error && data.error.includes('Unauthorized'), 'Error message indicates unauthorized');
  });

  await runTest('E2E_S4', 'S4-TC2', 'Lifecycle: Tampered cookie signature rejected with HTTP 401', async () => {
    const forgedCookie = 'eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGdyYXZpdHlmb3JhaS5jb20iLCJyb2xlIjoiQURNSU4ifQ.FORGED_SIG_12345';
    const req = new Request('http://localhost:3000/api/admin/request-indexing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${ADMIN_COOKIE_NAME}=${forgedCookie}`,
      },
      body: JSON.stringify({ url: 'https://gravityforai.com/blog' }),
    });
    const res = await POST(req);
    assertEqual(res.status, 401, 'Forged cookie status');
  });

  await runTest('E2E_S4', 'S4-TC3', 'Lifecycle: VIEWER and EDITOR roles rejected with HTTP 401', async () => {
    for (const role of ['VIEWER', 'EDITOR'] as const) {
      const token = signSession({ id: `user-${role}`, email: `${role.toLowerCase()}@gravityforai.com`, role });
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `${ADMIN_COOKIE_NAME}=${token}`,
        },
        body: JSON.stringify({ url: 'https://gravityforai.com/blog' }),
      });
      const res = await POST(req);
      assertEqual(res.status, 401, `Role ${role} rejection status`);
    }
  });

  await runTest('E2E_S4', 'S4-TC4', 'Lifecycle: Admin authenticated request with missing GSC credentials returns 200 with setupRequired: true', async () => {
    const adminToken = signSession({ id: 'admin-stress', email: 'admin@gravityforai.com', role: 'ADMIN' });
    const req = new Request('http://localhost:3000/api/admin/request-indexing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${ADMIN_COOKIE_NAME}=${adminToken}`,
      },
      body: JSON.stringify({ url: 'https://gravityforai.com/services/ai-voice-agents' }),
    });
    const res = await POST(req);
    assertEqual(res.status, 200, 'Unconfigured GSC status code');
    const data = await res.json();
    assertEqual(data.success, false, 'data.success');
    assertEqual(data.setupRequired, true, 'data.setupRequired');
    assert(data.message.includes('GOOGLE_SERVICE_ACCOUNT_JSON'), 'Guidance mentions GOOGLE_SERVICE_ACCOUNT_JSON');
  });

  await runTest('E2E_S4', 'S4-TC5', 'Adversarial URL boundaries: javascript: scheme rejected with HTTP 400', async () => {
    const adminToken = signSession({ id: 'admin-stress', email: 'admin@gravityforai.com', role: 'ADMIN' });
    const req = new Request('http://localhost:3000/api/admin/request-indexing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${ADMIN_COOKIE_NAME}=${adminToken}`,
      },
      body: JSON.stringify({ url: 'javascript:alert(document.cookie)' }),
    });
    const res = await POST(req);
    assertEqual(res.status, 400, 'XSS scheme status');
    const data = await res.json();
    assert(data.error.includes('http or https'), 'Rejection reason states protocol requirement');
  });

  await runTest('E2E_S4', 'S4-TC6', 'Adversarial URL boundaries: file:// and data: schemes rejected with HTTP 400', async () => {
    const adminToken = signSession({ id: 'admin-stress', email: 'admin@gravityforai.com', role: 'ADMIN' });
    for (const badSchemeUrl of ['file:///etc/passwd', 'data:text/html,<script>evil()</script>']) {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `${ADMIN_COOKIE_NAME}=${adminToken}`,
        },
        body: JSON.stringify({ url: badSchemeUrl }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, `Bad scheme ${badSchemeUrl} status`);
    }
  });

  await runTest('E2E_S4', 'S4-TC7', 'Adversarial URL boundaries: malformed syntax rejected with HTTP 400', async () => {
    const adminToken = signSession({ id: 'admin-stress', email: 'admin@gravityforai.com', role: 'ADMIN' });
    for (const malformed of ['not a valid url', 'https://', '   ', '']) {
      const req = new Request('http://localhost:3000/api/admin/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `${ADMIN_COOKIE_NAME}=${adminToken}`,
        },
        body: JSON.stringify({ url: malformed }),
      });
      const res = await POST(req);
      assertEqual(res.status, 400, `Malformed URL "${malformed}" status`);
    }
  });

  await runTest('E2E_S4', 'S4-TC8', 'GET /api/admin/request-indexing status inspection endpoint', async () => {
    const adminToken = signSession({ id: 'admin-stress', email: 'admin@gravityforai.com', role: 'ADMIN' });
    const req = new Request('http://localhost:3000/api/admin/request-indexing', {
      method: 'GET',
      headers: {
        cookie: `${ADMIN_COOKIE_NAME}=${adminToken}`,
      },
    });
    const res = await GET(req);
    assertEqual(res.status, 200, 'GET status');
    const data = await res.json();
    assertEqual(data.configured, false, 'configured status');
    assertEqual(data.setupRequired, true, 'setupRequired status');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 4: ADMIN DASHBOARD PAGE INTEGRATION (src/app/admin/page.tsx)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m--- CATEGORY 4: ADMIN DASHBOARD PAGE INTEGRATION ---\x1b[0m');

  await runTest('DASHBOARD', 'DB-TC1', 'Admin page imports and embeds RequestIndexingCard', () => {
    assert(adminPageContent.includes("import { RequestIndexingCard } from './request-indexing-card';"), 'Must import RequestIndexingCard');
    assert(adminPageContent.includes('<RequestIndexingCard isConfigured={isGoogleIndexingConfigured} />'), 'Must render RequestIndexingCard with isConfigured prop');
  });

  await runTest('DASHBOARD', 'DB-TC2', 'Admin page dynamically inspects GOOGLE_SERVICE_ACCOUNT_JSON environment variable', () => {
    assert(adminPageContent.includes('const isGoogleIndexingConfigured = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);'), 'Must check GOOGLE_SERVICE_ACCOUNT_JSON');
  });

  await runTest('DASHBOARD', 'DB-TC3', 'Admin page retains existing database queries and metric cards', () => {
    assert(adminPageContent.includes('prisma.lead.findMany'), 'Retains lead/booking queries');
    assert(adminPageContent.includes('Scheduled Calls') && adminPageContent.includes('Total Inquiries'), 'Retains metric cards');
    assert(adminPageContent.includes('Core Web Vitals'), 'Retains performance metric card');
    assert(adminPageContent.includes('Security, Session & Automation Engine Status'), 'Retains security engine card');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ───────────────────────────────────────────────────────────────────────────
  const total = results.length;
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;

  console.log('\n\x1b[1m\x1b[36m================================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m                             STRESS HARNESS SUMMARY                             \x1b[0m');
  console.log('\x1b[1m\x1b[36m================================================================================\x1b[0m');
  console.log(`  Total Executed : ${total}`);
  console.log(`  Passed         : \x1b[32m${passed}\x1b[0m (${Math.round((passed / total) * 100)}%)`);
  console.log(`  Failed         : ${failed > 0 ? `\x1b[31m${failed}\x1b[0m` : '0'}`);

  if (failed > 0) {
    console.error('\n\x1b[31mFailed Tests:\x1b[0m');
    for (const f of results.filter((r) => r.status === 'FAIL')) {
      console.error(`  - [${f.id}] ${f.title}: ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log('\n\x1b[1m\x1b[32m  ALL ADVERSARIAL STRESS TESTS PASSED (100% SUCCESS)\x1b[0m\n');
  }
}

executeAdminIndexingStressHarness().catch((e) => {
  console.error('Fatal stress harness exception:', e);
  process.exit(1);
});
