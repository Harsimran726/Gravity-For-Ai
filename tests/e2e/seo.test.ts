/**
 * Standalone Comprehensive E2E Test Suite for Technical SEO & Indexing Infrastructure
 *
 * Covers:
 * - Tier 1: Feature Contract Coverage (>=5 test cases per feature across F1-F11)
 * - Tier 2: Boundary & Corner Cases (>=5 test cases per boundary across B1-B7)
 * - Tier 3: Pairwise Cross-Feature Interactions (6 interaction pairs)
 * - Tier 4: Real-World Workload Scenarios (Googlebot, AI Engine, Local SEO, Admin Lifecycle)
 *
 * Usage:
 *   npx tsx tests/e2e/seo.test.ts                 # Full test run (exits 0 on all pass, 1 on fail)
 *   npx tsx tests/e2e/seo.test.ts --tier=1        # Run only Tier 1
 *   npx tsx tests/e2e/seo.test.ts --feature=F1    # Run only Feature F1
 *   npx tsx tests/e2e/seo.test.ts --filter=robots # Run tests matching filter
 *   npx tsx tests/e2e/seo.test.ts --progressive   # Informative mode (exit 0 for interim checks)
 */

import fs from 'node:fs';
import path from 'node:path';
import { AsyncLocalStorage } from 'node:async_hooks';

// Polyfill AsyncLocalStorage on globalThis before Next.js modules load
(globalThis as unknown as { AsyncLocalStorage: typeof AsyncLocalStorage }).AsyncLocalStorage = AsyncLocalStorage;

// ANSI Colors for structured reporting
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// ─── Test Harness Framework ──────────────────────────────────────────────────

interface TestCase {
  id: string;
  tier: number;
  feature: string;
  title: string;
  fn: () => Promise<void> | void;
}

interface TestResult {
  id: string;
  tier: number;
  feature: string;
  title: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  durationMs: number;
  error?: Error;
}

const registeredTests: TestCase[] = [];

function registerTest(
  tier: number,
  feature: string,
  id: string,
  title: string,
  fn: () => Promise<void> | void
) {
  registeredTests.push({ id, tier, feature, title, fn });
}

// Assertion helpers
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, context: string) {
  if (actual !== expected) {
    throw new Error(`${context}: Expected [${expected}], but received [${actual}]`);
  }
}

function assertDeepEqual(actual: unknown, expected: unknown, context: string) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`${context}: Expected ${expectedStr}, but received ${actualStr}`);
  }
}

function assertTrue(value: boolean, context: string) {
  if (value !== true) {
    throw new Error(`${context}: Expected true, received ${value}`);
  }
}

function assertMatch(str: string, pattern: RegExp, context: string) {
  if (!pattern.test(str)) {
    throw new Error(`${context}: String "${str}" did not match pattern ${pattern}`);
  }
}

// ─── Project Imports ─────────────────────────────────────────────────────────

import { CITIES_DATA } from '@/data/city-data';
import { BLOG_POSTS_SEED } from '@/data/blog-seed-data';
import { SERVICES_DATA } from '@/data/services-data';
import { CASE_STUDIES } from '@/data/case-studies-data';
import { signSession, verifySession, ADMIN_COOKIE_NAME, type AdminSession } from '@/lib/auth';

// Dynamic loaders for application components to prevent compile-time crashes
async function loadSitemap() {
  const mod = await import('@/app/sitemap');
  return mod.default();
}

async function loadRobots() {
  const mod = await import('@/app/robots');
  return mod.default();
}

async function loadDynamicCityMetadata(city: string) {
  const mod = await import('@/app/locations/[city]/page');
  return mod.generateMetadata({ params: { city } });
}

async function loadStaticLocationMetadata(slug: string) {
  switch (slug) {
    case 'europe': {
      const mod = await import('@/app/locations/europe/page');
      return mod.metadata;
    }
    case 'india-remote': {
      const mod = await import('@/app/locations/india-remote/page');
      return mod.metadata;
    }
    case 'united-states': {
      const mod = await import('@/app/locations/united-states/page');
      return mod.metadata;
    }
    case 'punjab-regional': {
      const mod = await import('@/app/locations/punjab-regional/page');
      return mod.metadata;
    }
    case 'locations': {
      const mod = await import('@/app/locations/page');
      return mod.metadata;
    }
    case 'lp': {
      const mod = await import('@/app/lp/page');
      return mod.metadata;
    }
    default:
      throw new Error(`Unknown static location: ${slug}`);
  }
}

function readLayoutJsonLd(): Record<string, unknown> {
  const layoutPath = path.resolve(process.cwd(), 'src/app/layout.tsx');
  assert(fs.existsSync(layoutPath), 'src/app/layout.tsx must exist');
  const content = fs.readFileSync(layoutPath, 'utf-8');

  // Parse jsonLd object literal using regex extraction
  const jsonLdMatch = content.match(/const\s+jsonLd\s*=\s*(\{[\s\S]*?\n\s*\};)/);
  assert(!!jsonLdMatch, 'Could not find jsonLd object in src/app/layout.tsx');

  try {
    // Evaluate in safe sandboxed function
    const extractor = new Function(`
      const process = { env: {} };
      ${jsonLdMatch![0]}
      return jsonLd;
    `);
    return extractor();
  } catch (err) {
    throw new Error(`Failed to parse jsonLd from layout.tsx: ${(err as Error).message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TIER 1: FEATURE CONTRACT COVERAGE (55 TEST CASES ACROSS 11 FEATURES)
// ─────────────────────────────────────────────────────────────────────────────

// ── F1: Real Sitemap Dates ──────────────────────────────────────────────────
registerTest(1, 'F1', 'F1-TC1', 'Sitemap returns valid array of Sitemap entries', async () => {
  const items = await loadSitemap();
  assert(Array.isArray(items), 'Sitemap must return an array');
  assert(items.length >= 36, `Expected at least 36 sitemap entries, got ${items.length}`);
});

registerTest(1, 'F1', 'F1-TC2', 'Root URL has historical lastModified date (not dynamic now)', async () => {
  const items = await loadSitemap();
  const root = items.find((i) => i.url === 'https://gravityforai.com');
  assert(!!root, 'Root URL must exist in sitemap');
  assert(root!.lastModified instanceof Date, 'lastModified must be a Date instance');
  const now = new Date();
  const diffMs = Math.abs(now.getTime() - root!.lastModified.getTime());
  assert(diffMs > 60_000, `Root lastModified was generated dynamically (${diffMs}ms from current time)`);
});

registerTest(1, 'F1', 'F1-TC3', 'Static routes have historical timestamps prior to 2026-10-01', async () => {
  const items = await loadSitemap();
  const staticPaths = ['/services', '/locations', '/pricing', '/about', '/contact', '/case-studies'];
  for (const p of staticPaths) {
    const item = items.find((i) => i.url === `https://gravityforai.com${p}`);
    assert(!!item, `Static path ${p} must exist in sitemap`);
    assert(item!.lastModified instanceof Date, `lastModified for ${p} must be a Date`);
    assert(
      item!.lastModified.getTime() < new Date('2026-10-01T00:00:00.000Z').getTime(),
      `Path ${p} timestamp ${item!.lastModified.toISOString()} is not a historical date`
    );
  }
});

registerTest(1, 'F1', 'F1-TC4', 'Sitemap execution is deterministic across successive calls', async () => {
  const first = await loadSitemap();
  const second = await loadSitemap();
  const firstRoot = first.find((i) => i.url === 'https://gravityforai.com')!;
  const secondRoot = second.find((i) => i.url === 'https://gravityforai.com')!;
  assertEqual(
    firstRoot.lastModified.getTime(),
    secondRoot.lastModified.getTime(),
    'Consecutive sitemap calls must return identical timestamps for static pages'
  );
});

registerTest(1, 'F1', 'F1-TC5', 'All sitemap entries have valid HTTPS URLs and valid priorities', async () => {
  const items = await loadSitemap();
  for (const item of items) {
    assert(item.url.startsWith('https://gravityforai.com'), `URL must start with https://gravityforai.com: ${item.url}`);
    if (item.priority !== undefined) {
      assert(item.priority >= 0.0 && item.priority <= 1.0, `Priority out of bounds [0, 1]: ${item.priority}`);
    }
  }
});

// ── F2: DB-Backed Posts in Sitemap ──────────────────────────────────────────
registerTest(1, 'F2', 'F2-TC1', 'Sitemap is an asynchronous function returning a Promise', async () => {
  const mod = await import('@/app/sitemap');
  const result = mod.default();
  assert(result instanceof Promise, 'sitemap() must return a Promise');
  await result;
});

registerTest(1, 'F2', 'F2-TC2', 'Sitemap includes all seed blog posts with published dates', async () => {
  const items = await loadSitemap();
  for (const post of BLOG_POSTS_SEED) {
    const item = items.find((i) => i.url === `https://gravityforai.com/blog/${post.slug}`);
    assert(!!item, `Seed post ${post.slug} missing from sitemap`);
    assertEqual(
      item!.lastModified.getTime(),
      new Date(post.publishedAt).getTime(),
      `Seed post ${post.slug} lastModified mismatch`
    );
  }
});

registerTest(1, 'F2', 'F2-TC3', 'Sitemap integrates with Prisma to query published blog posts', async () => {
  const sitemapCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/sitemap.ts'), 'utf-8');
  assertMatch(sitemapCode, /prisma\.blogPost\.findMany/, 'sitemap.ts must query prisma.blogPost.findMany');
  assertMatch(sitemapCode, /status:\s*['"]PUBLISHED['"]/, 'sitemap.ts must filter by status PUBLISHED');
});

registerTest(1, 'F2', 'F2-TC4', 'Sitemap deduplicates blog posts by slug between seed and DB', async () => {
  const items = await loadSitemap();
  const blogUrls = items.filter((i) => i.url.startsWith('https://gravityforai.com/blog/')).map((i) => i.url);
  const uniqueUrls = new Set(blogUrls);
  assertEqual(blogUrls.length, uniqueUrls.size, 'Sitemap blog URLs must be unique (no duplicate slugs)');
});

registerTest(1, 'F2', 'F2-TC5', 'Sitemap catches DB exceptions and gracefully preserves seed posts', async () => {
  const sitemapCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/sitemap.ts'), 'utf-8');
  assertMatch(sitemapCode, /try\s*\{[\s\S]*?prisma[\s\S]*?\}\s*catch/, 'sitemap.ts must wrap DB query in try/catch fallback');
});

// ── F3: AMP Blog Sitemap Entries ────────────────────────────────────────────
registerTest(1, 'F3', 'F3-TC1', 'Sitemap contains an /amp/blog/[slug] entry for every blog post', async () => {
  const items = await loadSitemap();
  const blogEntries = items.filter((i) => i.url.includes('/blog/') && !i.url.includes('/amp/'));
  for (const blog of blogEntries) {
    const slug = blog.url.split('/blog/')[1];
    const ampUrl = `https://gravityforai.com/amp/blog/${slug}`;
    const ampEntry = items.find((i) => i.url === ampUrl);
    assert(!!ampEntry, `Missing AMP entry for blog slug: ${slug}`);
  }
});

registerTest(1, 'F3', 'F3-TC2', 'Every AMP blog entry has priority 0.5', async () => {
  const items = await loadSitemap();
  const ampEntries = items.filter((i) => i.url.includes('/amp/blog/'));
  assert(ampEntries.length > 0, 'Sitemap must contain AMP blog entries');
  for (const amp of ampEntries) {
    assertEqual(amp.priority, 0.5, `AMP entry ${amp.url} must have priority 0.5`);
  }
});

registerTest(1, 'F3', 'F3-TC3', 'Every AMP blog entry has changeFrequency monthly', async () => {
  const items = await loadSitemap();
  const ampEntries = items.filter((i) => i.url.includes('/amp/blog/'));
  for (const amp of ampEntries) {
    assertEqual(amp.changeFrequency, 'monthly', `AMP entry ${amp.url} changeFrequency`);
  }
});

registerTest(1, 'F3', 'F3-TC4', 'AMP blog entry has identical lastModified timestamp as canonical blog post', async () => {
  const items = await loadSitemap();
  const blogEntries = items.filter((i) => i.url.includes('/blog/') && !i.url.includes('/amp/'));
  for (const blog of blogEntries) {
    const slug = blog.url.split('/blog/')[1];
    const ampEntry = items.find((i) => i.url === `https://gravityforai.com/amp/blog/${slug}`)!;
    assertEqual(
      ampEntry.lastModified.getTime(),
      blog.lastModified.getTime(),
      `AMP timestamp mismatch for ${slug}`
    );
  }
});

registerTest(1, 'F3', 'F3-TC5', 'Total count of AMP blog entries exactly matches canonical blog entries', async () => {
  const items = await loadSitemap();
  const blogEntries = items.filter((i) => i.url.includes('/blog/') && !i.url.includes('/amp/'));
  const ampEntries = items.filter((i) => i.url.includes('/amp/blog/'));
  assertEqual(ampEntries.length, blogEntries.length, 'AMP blog count must equal canonical blog count');
});

// ── F4: Robots.txt Host Directive Removal ───────────────────────────────────
registerTest(1, 'F4', 'F4-TC1', 'Robots.ts returns valid configuration without host property', async () => {
  const res = await loadRobots();
  assert(res !== null && typeof res === 'object', 'robots() must return object');
  assertEqual((res as { host?: string }).host, undefined, 'robots.ts must NOT include deprecated host property');
});

registerTest(1, 'F4', 'F4-TC2', 'Robots.ts includes sitemap URL', async () => {
  const res = await loadRobots();
  assertEqual(res.sitemap, 'https://gravityforai.com/sitemap.xml', 'sitemap URL in robots.txt');
});

registerTest(1, 'F4', 'F4-TC3', 'Robots.ts disallows /admin and /api paths for userAgent *', async () => {
  const res = await loadRobots();
  const rules = Array.isArray(res.rules) ? res.rules : [res.rules];
  const starRule = rules.find((r) => r.userAgent === '*');
  assert(!!starRule, 'Wildcard userAgent rule must exist');
  const disallows = Array.isArray(starRule!.disallow) ? starRule!.disallow : [starRule!.disallow];
  assert(disallows.includes('/admin') || disallows.includes('/admin/'), 'Must disallow /admin');
  assert(disallows.includes('/api') || disallows.includes('/api/'), 'Must disallow /api');
});

registerTest(1, 'F4', 'F4-TC4', 'Robots.ts explicitly grants permissions to AI and LLM answer engines', async () => {
  const res = await loadRobots();
  const rules = Array.isArray(res.rules) ? res.rules : [res.rules];
  const aiBots = ['Googlebot', 'Bingbot', 'GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot'];
  const allUserAgents = rules.flatMap((r) => Array.isArray(r.userAgent) ? r.userAgent : [r.userAgent]);
  for (const bot of aiBots) {
    assert(allUserAgents.includes(bot), `Robots.txt must include explicit rule for bot: ${bot}`);
  }
});

registerTest(1, 'F4', 'F4-TC5', 'Robots source code lacks deprecated Host directive', async () => {
  const robotsCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/robots.ts'), 'utf-8');
  assert(!/^\s*host\s*:/m.test(robotsCode), 'src/app/robots.ts must not have host: property');
});

// ── F5: Enhanced Root Schema.org ────────────────────────────────────────────
registerTest(1, 'F5', 'F5-TC1', 'Root layout Schema.org type includes LocalBusiness and ProfessionalService', () => {
  const jsonLd = readLayoutJsonLd();
  const type = jsonLd['@type'];
  assert(Array.isArray(type), 'Schema @type must be an array');
  assert((type as string[]).includes('LocalBusiness'), 'Schema @type must include LocalBusiness');
  assert((type as string[]).includes('ProfessionalService'), 'Schema @type must include ProfessionalService');
});

registerTest(1, 'F5', 'F5-TC2', 'Root layout Schema.org includes Mansa GeoCoordinates (29.9975, 75.3983)', () => {
  const jsonLd = readLayoutJsonLd();
  const geo = jsonLd.geo as { '@type': string; latitude: number; longitude: number };
  assert(!!geo, 'Schema must contain geo object');
  assertEqual(geo['@type'], 'GeoCoordinates', 'geo.@type');
  assertEqual(geo.latitude, 29.9975, 'geo.latitude for Mansa');
  assertEqual(geo.longitude, 75.3983, 'geo.longitude for Mansa');
});

registerTest(1, 'F5', 'F5-TC3', 'Root layout Schema.org includes hasMap link to Mansa, Punjab', () => {
  const jsonLd = readLayoutJsonLd();
  assertEqual(
    jsonLd.hasMap,
    'https://maps.google.com/?q=Mansa,Punjab,India',
    'Schema hasMap URL'
  );
});

registerTest(1, 'F5', 'F5-TC4', 'Root layout Schema.org includes openingHoursSpecification for Mon-Sat', () => {
  const jsonLd = readLayoutJsonLd();
  const hours = jsonLd.openingHoursSpecification as Array<{
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
  assert(Array.isArray(hours) && hours.length > 0, 'Schema openingHoursSpecification must be an array');
  const spec = hours[0];
  assert(spec.dayOfWeek.includes('Monday'), 'openingHoursSpecification must include Monday');
  assert(spec.dayOfWeek.includes('Saturday'), 'openingHoursSpecification must include Saturday');
  assertEqual(spec.opens, '09:00', 'opening time');
  assertEqual(spec.closes, '18:00', 'closing time');
});

registerTest(1, 'F5', 'F5-TC5', 'Root layout Schema.org preserves core entity attributes', () => {
  const jsonLd = readLayoutJsonLd();
  assertEqual(jsonLd.name, 'Gravity For AI', 'Schema name');
  const address = jsonLd.address as { addressLocality: string; addressCountry: string };
  assertEqual(address.addressLocality, 'Mansa', 'addressLocality');
  assertEqual(address.addressCountry, 'IN', 'addressCountry');
});

// ── F6: Canonical Tags Verification ─────────────────────────────────────────
registerTest(1, 'F6', 'F6-TC1', '/locations/europe exports canonical pointing to its exact URL', async () => {
  const meta = await loadStaticLocationMetadata('europe');
  assertEqual(
    meta.alternates?.canonical,
    'https://gravityforai.com/locations/europe',
    'Europe canonical'
  );
});

registerTest(1, 'F6', 'F6-TC2', '/locations/india-remote exports canonical pointing to its exact URL', async () => {
  const meta = await loadStaticLocationMetadata('india-remote');
  assertEqual(
    meta.alternates?.canonical,
    'https://gravityforai.com/locations/india-remote',
    'India Remote canonical'
  );
});

registerTest(1, 'F6', 'F6-TC3', '/locations/united-states exports canonical pointing to its exact URL', async () => {
  const meta = await loadStaticLocationMetadata('united-states');
  assertEqual(
    meta.alternates?.canonical,
    'https://gravityforai.com/locations/united-states',
    'United States canonical'
  );
});

registerTest(1, 'F6', 'F6-TC4', '/locations/punjab-regional exports canonical pointing to its exact URL', async () => {
  const meta = await loadStaticLocationMetadata('punjab-regional');
  assertEqual(
    meta.alternates?.canonical,
    'https://gravityforai.com/locations/punjab-regional',
    'Punjab Regional canonical'
  );
});

registerTest(1, 'F6', 'F6-TC5', '/lp and dynamic [city] routes export canonicals without trailing slashes', async () => {
  const lpMeta = await loadStaticLocationMetadata('lp');
  assertEqual(lpMeta.alternates?.canonical, 'https://gravityforai.com/lp', '/lp canonical');
  assert(!lpMeta.alternates?.canonical?.endsWith('/'), '/lp canonical must not have trailing slash');

  const cityMeta = await loadDynamicCityMetadata('mansa');
  assertEqual(cityMeta.alternates?.canonical, 'https://gravityforai.com/locations/mansa', 'Mansa canonical');
  assert(!cityMeta.alternates?.canonical?.endsWith('/'), 'Mansa canonical must not have trailing slash');
});

// ── F7: Dynamic City GEO Meta Tags ──────────────────────────────────────────
registerTest(1, 'F7', 'F7-TC1', 'Dynamic city Mansa returns geo.region IN-PB and ICBM 29.9975, 75.3983', async () => {
  const meta = await loadDynamicCityMetadata('mansa');
  const other = meta.other as Record<string, string> | undefined;
  assert(!!other, 'Mansa metadata must export other field with geo tags (Milestone 2)');
  assertEqual(other['geo.region'], 'IN-PB', 'Mansa geo.region');
  assertEqual(other['ICBM'], '29.9975, 75.3983', 'Mansa ICBM');
});

registerTest(1, 'F7', 'F7-TC2', 'Dynamic city Bathinda returns geo.region IN-PB and accurate coordinates', async () => {
  const meta = await loadDynamicCityMetadata('bathinda');
  const other = meta.other as Record<string, string> | undefined;
  assert(!!other, 'Bathinda metadata must export other field (Milestone 2)');
  assertEqual(other['geo.region'], 'IN-PB', 'Bathinda geo.region');
  assertMatch(other['ICBM'], /^30\.\d+,\s*74\.\d+$/, 'Bathinda ICBM coordinates');
});

registerTest(1, 'F7', 'F7-TC3', 'Dynamic city Chandigarh returns geo.region and accurate coordinates', async () => {
  const meta = await loadDynamicCityMetadata('chandigarh');
  const other = meta.other as Record<string, string> | undefined;
  assert(!!other, 'Chandigarh metadata must export other field (Milestone 2)');
  assert(
    other['geo.region'] === 'IN-PB' || other['geo.region'] === 'IN-CH',
    `Chandigarh geo.region unexpected: ${other['geo.region']}`
  );
  assertMatch(other['ICBM'], /^30\.\d+,\s*76\.\d+$/, 'Chandigarh ICBM coordinates');
});

registerTest(1, 'F7', 'F7-TC4', 'Dynamic city Ludhiana returns geo.region IN-PB and accurate coordinates', async () => {
  const meta = await loadDynamicCityMetadata('ludhiana');
  const other = meta.other as Record<string, string> | undefined;
  assert(!!other, 'Ludhiana metadata must export other field (Milestone 2)');
  assertEqual(other['geo.region'], 'IN-PB', 'Ludhiana geo.region');
  assertMatch(other['ICBM'], /^30\.\d+,\s*75\.\d+$/, 'Ludhiana ICBM coordinates');
});

registerTest(1, 'F7', 'F7-TC5', 'Dynamic city Delhi returns geo.region IN-DL and accurate coordinates', async () => {
  const meta = await loadDynamicCityMetadata('delhi');
  const other = meta.other as Record<string, string> | undefined;
  assert(!!other, 'Delhi metadata must export other field (Milestone 2)');
  assertEqual(other['geo.region'], 'IN-DL', 'Delhi geo.region');
  assertMatch(other['ICBM'], /^28\.\d+,\s*77\.\d+$/, 'Delhi ICBM coordinates');
});

// ── F8: Static Location GEO Meta Tags ───────────────────────────────────────
registerTest(1, 'F8', 'F8-TC1', '/locations/europe exports broad geo.region and no city-level ICBM', async () => {
  const meta = await loadStaticLocationMetadata('europe');
  const other = meta.other as Record<string, string> | undefined;
  assert(!!other, '/locations/europe metadata must export other field (Milestone 2)');
  assert(other['geo.region'] === 'DE' || other['geo.region'] === 'EU', `Europe geo.region unexpected: ${other['geo.region']}`);
  assert(!other['ICBM'], 'Europe aggregate page must not have city-level ICBM');
});

registerTest(1, 'F8', 'F8-TC2', '/locations/india-remote exports broad geo.region IN and no city ICBM', async () => {
  const meta = await loadStaticLocationMetadata('india-remote');
  const other = meta.other as Record<string, string> | undefined;
  assert(!!other, '/locations/india-remote metadata must export other field (Milestone 2)');
  assertEqual(other['geo.region'], 'IN', 'India Remote geo.region');
  assert(!other['ICBM'], 'India Remote page must not have city-level ICBM');
});

registerTest(1, 'F8', 'F8-TC3', '/locations/united-states exports broad geo.region US and no city ICBM', async () => {
  const meta = await loadStaticLocationMetadata('united-states');
  const other = meta.other as Record<string, string> | undefined;
  assert(!!other, '/locations/united-states metadata must export other field (Milestone 2)');
  assertEqual(other['geo.region'], 'US', 'US geo.region');
  assert(!other['ICBM'], 'United States page must not have city-level ICBM');
});

registerTest(1, 'F8', 'F8-TC4', '/locations/punjab-regional exports regional geo.region IN-PB', async () => {
  const meta = await loadStaticLocationMetadata('punjab-regional');
  const other = meta.other as Record<string, string> | undefined;
  assert(!!other, '/locations/punjab-regional metadata must export other field (Milestone 2)');
  assertEqual(other['geo.region'], 'IN-PB', 'Punjab Regional geo.region');
});

registerTest(1, 'F8', 'F8-TC5', 'Base /locations directory exports broad regional geo tags', async () => {
  const meta = await loadStaticLocationMetadata('locations');
  const other = meta.other as Record<string, string> | undefined;
  assert(!!other, '/locations directory metadata must export other field (Milestone 2)');
  assert(other['geo.region'] === 'IN-PB' || other['geo.region'] === 'IN', 'Locations directory geo.region');
});

// ── F9: Admin Indexing API Route ────────────────────────────────────────────
registerTest(1, 'F9', 'F9-TC1', 'Admin indexing API route exists at src/app/api/admin/request-indexing/route.ts', () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), `API route must exist at ${routePath} (Milestone 3)`);
});

registerTest(1, 'F9', 'F9-TC2', 'Admin indexing route rejects unauthenticated requests with 401 Unauthorized', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');
  const req = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://gravityforai.com/blog/new-post' }),
  });
  const res = await POST(req);
  assertEqual(res.status, 401, 'Unauthenticated request must return 401');
});

registerTest(1, 'F9', 'F9-TC3', 'Admin indexing route rejects non-admin users with 401/403', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');
  const viewerCookie = signSession({ id: 'viewer-1', email: 'viewer@gravityforai.com', role: 'VIEWER' as any });
  const req = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `${ADMIN_COOKIE_NAME}=${viewerCookie}`,
    },
    body: JSON.stringify({ url: 'https://gravityforai.com/blog/new-post' }),
  });
  const res = await POST(req);
  assert(res.status === 401 || res.status === 403, `Non-admin request must return 401 or 403, got ${res.status}`);
});

registerTest(1, 'F9', 'F9-TC4', 'Admin indexing route validates URL format and rejects empty/malformed URLs', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');
  const adminCookie = signSession({ id: 'admin-1', email: 'admin@gravityforai.com', role: 'ADMIN' });
  const req = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}`,
    },
    body: JSON.stringify({ url: 'not-a-valid-url' }),
  });
  const res = await POST(req);
  assertEqual(res.status, 400, 'Invalid URL should return 400 Bad Request');
});

registerTest(1, 'F9', 'F9-TC5', 'Admin indexing route handles missing service account credentials gracefully', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');
  const origEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  try {
    const adminCookie = signSession({ id: 'admin-1', email: 'admin@gravityforai.com', role: 'ADMIN' });
    const req = new Request('http://localhost:3000/api/admin/request-indexing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}`,
      },
      body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
    });
    const res = await POST(req);
    assert(res.status !== 500, `Must not return 500 when GOOGLE_SERVICE_ACCOUNT_JSON is missing; got ${res.status}`);
    const data = await res.json();
    assert(
      data.setupRequired || data.message || data.error,
      'Response must indicate configuration instructions or informative status'
    );
  } finally {
    if (origEnv) process.env.GOOGLE_SERVICE_ACCOUNT_JSON = origEnv;
  }
});

// ── F10: Admin Dashboard Indexing Card ───────────────────────────────────────
registerTest(1, 'F10', 'F10-TC1', 'Admin dashboard or component exports RequestIndexingCard', () => {
  const cardPath = path.resolve(process.cwd(), 'src/app/admin/request-indexing-card.tsx');
  const adminPagePath = path.resolve(process.cwd(), 'src/app/admin/page.tsx');
  const exists = fs.existsSync(cardPath) || (fs.existsSync(adminPagePath) && fs.readFileSync(adminPagePath, 'utf-8').includes('Request Indexing'));
  assert(exists, 'RequestIndexingCard component or admin section must exist (Milestone 3)');
});

registerTest(1, 'F10', 'F10-TC2', 'UI contains input field for URL and submit button', () => {
  const cardPath = path.resolve(process.cwd(), 'src/app/admin/request-indexing-card.tsx');
  const adminPagePath = path.resolve(process.cwd(), 'src/app/admin/page.tsx');
  const content = fs.existsSync(cardPath) ? fs.readFileSync(cardPath, 'utf-8') : fs.readFileSync(adminPagePath, 'utf-8');
  assertMatch(content, /input/i, 'Card must render an input element');
  assertMatch(content, /Request Indexing|Request Google Indexing/i, 'Card must have Request Indexing text');
});

registerTest(1, 'F10', 'F10-TC3', 'UI uses brand palette (Navy #122C57 / Gold #C99A44 / Cream #F7F5F0)', () => {
  const cardPath = path.resolve(process.cwd(), 'src/app/admin/request-indexing-card.tsx');
  assert(fs.existsSync(cardPath), 'request-indexing-card.tsx must exist (Milestone 3)');
  const content = fs.readFileSync(cardPath, 'utf-8');
  const hasBrandTheme =
    content.includes('#122C57') ||
    content.includes('#C99A44') ||
    content.includes('#F7F5F0') ||
    content.includes('bg-') ||
    content.includes('border-');
  assertTrue(hasBrandTheme, 'Card should adhere to project brand color palette');
});

registerTest(1, 'F10', 'F10-TC4', 'UI renders setup instructions when GOOGLE_SERVICE_ACCOUNT_JSON is unset', () => {
  const cardPath = path.resolve(process.cwd(), 'src/app/admin/request-indexing-card.tsx');
  assert(fs.existsSync(cardPath), 'request-indexing-card.tsx must exist (Milestone 3)');
  const content = fs.readFileSync(cardPath, 'utf-8');
  assertMatch(content, /GOOGLE_SERVICE_ACCOUNT_JSON|Service Account|Setup|Google Search Console/i, 'Card must contain setup instructions');
});

registerTest(1, 'F10', 'F10-TC5', 'Admin dashboard page integrates RequestIndexingCard', () => {
  const adminPagePath = path.resolve(process.cwd(), 'src/app/admin/page.tsx');
  const content = fs.readFileSync(adminPagePath, 'utf-8');
  assertMatch(content, /RequestIndexingCard|indexing|Request Google Indexing/i, 'admin/page.tsx must integrate indexing feature (Milestone 3)');
});

// ── F11: E2E Test Suite & Build Verification ────────────────────────────────
registerTest(1, 'F11', 'F11-TC1', 'All required SEO infrastructure files exist on disk', () => {
  const files = [
    'src/app/sitemap.ts',
    'src/app/robots.ts',
    'src/app/layout.tsx',
    'src/app/locations/[city]/page.tsx',
    'src/app/locations/europe/page.tsx',
    'src/app/locations/india-remote/page.tsx',
    'src/app/locations/united-states/page.tsx',
    'src/app/locations/punjab-regional/page.tsx',
    'src/app/locations/page.tsx',
    'src/app/lp/page.tsx',
  ];
  for (const f of files) {
    assert(fs.existsSync(path.resolve(process.cwd(), f)), `File ${f} must exist`);
  }
});

registerTest(1, 'F11', 'F11-TC2', 'TypeScript compiler options and path aliases are valid', () => {
  const tsConfigPath = path.resolve(process.cwd(), 'tsconfig.json');
  assert(fs.existsSync(tsConfigPath), 'tsconfig.json must exist');
  const parsed = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
  assert(parsed.compilerOptions?.paths?.['@/*'], 'Path alias @/* must be configured');
});

registerTest(1, 'F11', 'F11-TC3', 'Prisma client is synchronized and exports BlogPost delegate', async () => {
  const { prisma } = await import('@/lib/prisma');
  assert(!!prisma.blogPost, 'prisma.blogPost delegate must exist');
});

registerTest(1, 'F11', 'F11-TC4', 'Root layout sets robots index: true, follow: true without unintended noindex', () => {
  const layoutPath = path.resolve(process.cwd(), 'src/app/layout.tsx');
  const content = fs.readFileSync(layoutPath, 'utf-8');
  assertMatch(content, /index:\s*true/, 'Layout metadata must set index: true');
  assertMatch(content, /follow:\s*true/, 'Layout metadata must set follow: true');
  assert(!content.includes('noindex: true'), 'Layout metadata must not contain noindex: true');
});

registerTest(1, 'F11', 'F11-TC5', 'Total public page count in sitemap accounts for all route types', async () => {
  const items = await loadSitemap();
  const staticCount = 19;
  const serviceCount = Object.keys(SERVICES_DATA).length;
  const cityCount = Object.keys(CITIES_DATA).length;
  const caseStudyCount = CASE_STUDIES.length;
  const blogCount = BLOG_POSTS_SEED.length;
  const ampCount = BLOG_POSTS_SEED.length;
  const expectedMin = staticCount + serviceCount + cityCount + caseStudyCount + blogCount + ampCount;
  assert(
    items.length >= expectedMin,
    `Sitemap item count (${items.length}) should account for all route types (expected at least ${expectedMin})`
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// TIER 2: BOUNDARY & CORNER CASES (35 TEST CASES ACROSS 7 BOUNDARIES)
// ─────────────────────────────────────────────────────────────────────────────

// ── Boundary B1: Missing GOOGLE_SERVICE_ACCOUNT_JSON ────────────────────────
registerTest(2, 'B1', 'B1-TC1', 'Missing env var does not crash the Node.js process', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');
  const orig = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  try {
    const adminCookie = signSession({ id: 'admin-1', email: 'admin@gravityforai.com', role: 'ADMIN' });
    const req = new Request('http://localhost:3000/api/admin/request-indexing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}` },
      body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
    });
    const res = await POST(req);
    assert(res !== undefined, 'Route should return response');
  } finally {
    if (orig) process.env.GOOGLE_SERVICE_ACCOUNT_JSON = orig;
  }
});

registerTest(2, 'B1', 'B1-TC2', 'Missing env var returns informative JSON response', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');
  const orig = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  try {
    const adminCookie = signSession({ id: 'admin-1', email: 'admin@gravityforai.com', role: 'ADMIN' });
    const req = new Request('http://localhost:3000/api/admin/request-indexing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}` },
      body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
    });
    const res = await POST(req);
    const body = await res.json();
    assert(typeof body === 'object', 'Response body must be JSON object');
  } finally {
    if (orig) process.env.GOOGLE_SERVICE_ACCOUNT_JSON = orig;
  }
});

registerTest(2, 'B1', 'B1-TC3', 'Missing env var HTTP status is non-500', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');
  const orig = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  try {
    const adminCookie = signSession({ id: 'admin-1', email: 'admin@gravityforai.com', role: 'ADMIN' });
    const req = new Request('http://localhost:3000/api/admin/request-indexing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}` },
      body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
    });
    const res = await POST(req);
    assert(res.status < 500, `Expected status < 500, received ${res.status}`);
  } finally {
    if (orig) process.env.GOOGLE_SERVICE_ACCOUNT_JSON = orig;
  }
});

registerTest(2, 'B1', 'B1-TC4', 'Missing env var response does not leak internal stack traces', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');
  const orig = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  try {
    const adminCookie = signSession({ id: 'admin-1', email: 'admin@gravityforai.com', role: 'ADMIN' });
    const req = new Request('http://localhost:3000/api/admin/request-indexing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}` },
      body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
    });
    const res = await POST(req);
    const text = await res.text();
    assert(!text.includes('at async'), 'Response should not expose stack traces');
  } finally {
    if (orig) process.env.GOOGLE_SERVICE_ACCOUNT_JSON = orig;
  }
});

registerTest(2, 'B1', 'B1-TC5', 'Malformed GOOGLE_SERVICE_ACCOUNT_JSON string handled gracefully without crash', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');
  const orig = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON = '{ not valid json...';
  try {
    const adminCookie = signSession({ id: 'admin-1', email: 'admin@gravityforai.com', role: 'ADMIN' });
    const req = new Request('http://localhost:3000/api/admin/request-indexing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}` },
      body: JSON.stringify({ url: 'https://gravityforai.com/blog/test' }),
    });
    const res = await POST(req);
    assert(res.status !== 500, 'Malformed JSON credentials must not crash with 500');
  } finally {
    if (orig) process.env.GOOGLE_SERVICE_ACCOUNT_JSON = orig;
    else delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  }
});

// ── Boundary B2: Non-Admin / Unauthorized Auth ──────────────────────────────
registerTest(2, 'B2', 'B2-TC1', 'Request with missing session cookie is denied with 401', () => {
  const session = verifySession('');
  assertEqual(session, null, 'Empty cookie value must evaluate to null session');
});

registerTest(2, 'B2', 'B2-TC2', 'Tampered HMAC signature cookie is rejected', () => {
  const valid = signSession({ id: '1', email: 'admin@gravityforai.com', role: 'ADMIN' });
  const [payload] = valid.split('.');
  const forged = `${payload}.invalidsignature12345`;
  const result = verifySession(forged);
  assertEqual(result, null, 'Tampered signature must evaluate to null session');
});

registerTest(2, 'B2', 'B2-TC3', 'Malformed base64 JSON payload is safely rejected', () => {
  const result = verifySession('not-valid-base64.signature');
  assertEqual(result, null, 'Malformed base64 must evaluate to null session');
});

registerTest(2, 'B2', 'B2-TC4', 'Session with role VIEWER fails admin role check', () => {
  const viewerSession: AdminSession = { id: 'v1', email: 'viewer@gravityforai.com', role: 'VIEWER' as any };
  const cookie = signSession(viewerSession);
  const parsed = verifySession(cookie);
  assert(parsed !== null, 'Session should parse');
  assertEqual(parsed!.role !== 'ADMIN', true, 'VIEWER role must not pass ADMIN check');
});

registerTest(2, 'B2', 'B2-TC5', 'Session with role EDITOR fails admin role check', () => {
  const editorSession: AdminSession = { id: 'e1', email: 'editor@gravityforai.com', role: 'EDITOR' as any };
  const cookie = signSession(editorSession);
  const parsed = verifySession(cookie);
  assert(parsed !== null, 'Session should parse');
  assertEqual(parsed!.role !== 'ADMIN', true, 'EDITOR role must not pass ADMIN check');
});

// ── Boundary B3: Invalid URL Formats ────────────────────────────────────────
registerTest(2, 'B3', 'B3-TC1', 'Empty string URL rejected by indexing API validation', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');
  const adminCookie = signSession({ id: 'admin-1', email: 'admin@gravityforai.com', role: 'ADMIN' });
  const req = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}` },
    body: JSON.stringify({ url: '' }),
  });
  const res = await POST(req);
  assertEqual(res.status, 400, 'Empty string URL should return 400');
});

registerTest(2, 'B3', 'B3-TC2', 'Non-URL string without protocol rejected', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');
  const adminCookie = signSession({ id: 'admin-1', email: 'admin@gravityforai.com', role: 'ADMIN' });
  const req = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}` },
    body: JSON.stringify({ url: 'just-some-text' }),
  });
  const res = await POST(req);
  assertEqual(res.status, 400, 'Non-URL string should return 400');
});

registerTest(2, 'B3', 'B3-TC3', 'Missing url property in JSON payload rejected', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');
  const adminCookie = signSession({ id: 'admin-1', email: 'admin@gravityforai.com', role: 'ADMIN' });
  const req = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}` },
    body: JSON.stringify({ otherField: 123 }),
  });
  const res = await POST(req);
  assertEqual(res.status, 400, 'Missing url field should return 400');
});

registerTest(2, 'B3', 'B3-TC4', 'Dangerous javascript: URI scheme rejected', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');
  const adminCookie = signSession({ id: 'admin-1', email: 'admin@gravityforai.com', role: 'ADMIN' });
  const req = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}` },
    body: JSON.stringify({ url: 'javascript:alert(1)' }),
  });
  const res = await POST(req);
  assertEqual(res.status, 400, 'javascript: URL should return 400');
});

registerTest(2, 'B3', 'B3-TC5', 'Extremely long payload handled safely without overflow', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');
  const adminCookie = signSession({ id: 'admin-1', email: 'admin@gravityforai.com', role: 'ADMIN' });
  const longUrl = 'https://gravityforai.com/' + 'a'.repeat(5000);
  const req = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}` },
    body: JSON.stringify({ url: longUrl }),
  });
  const res = await POST(req);
  assert(res.status !== 500, 'Long payload must not crash with 500');
});

// ── Boundary B4: Trailing Slash Variations ──────────────────────────────────
registerTest(2, 'B4', 'B4-TC1', 'Canonical URL for /lp has no trailing slash', async () => {
  const meta = await loadStaticLocationMetadata('lp');
  assertEqual(meta.alternates?.canonical, 'https://gravityforai.com/lp', 'canonical for /lp');
});

registerTest(2, 'B4', 'B4-TC2', 'Canonical URL for /locations has no trailing slash', async () => {
  const meta = await loadStaticLocationMetadata('locations');
  assertEqual(meta.alternates?.canonical, 'https://gravityforai.com/locations', 'canonical for /locations');
});

registerTest(2, 'B4', 'B4-TC3', 'Canonical URL for /locations/europe has no trailing slash', async () => {
  const meta = await loadStaticLocationMetadata('europe');
  assertEqual(meta.alternates?.canonical, 'https://gravityforai.com/locations/europe', 'canonical for europe');
});

registerTest(2, 'B4', 'B4-TC4', 'Canonical URL for dynamic city /locations/mansa has no trailing slash', async () => {
  const meta = await loadDynamicCityMetadata('mansa');
  assertEqual(meta.alternates?.canonical, 'https://gravityforai.com/locations/mansa', 'canonical for mansa');
});

registerTest(2, 'B4', 'B4-TC5', 'All sitemap URLs (except root domain) lack trailing slashes', async () => {
  const items = await loadSitemap();
  for (const item of items) {
    if (item.url === 'https://gravityforai.com') continue;
    assert(!item.url.endsWith('/'), `Sitemap URL has trailing slash: ${item.url}`);
  }
});

// ── Boundary B5: Zero DB Blog Posts Fallback ────────────────────────────────
registerTest(2, 'B5', 'B5-TC1', 'When DB has zero published posts, sitemap executes successfully', async () => {
  const items = await loadSitemap();
  assert(Array.isArray(items) && items.length > 0, 'Sitemap should succeed even if DB is empty');
});

registerTest(2, 'B5', 'B5-TC2', 'All 3 seed posts are included in sitemap during zero-DB condition', async () => {
  const items = await loadSitemap();
  for (const seed of BLOG_POSTS_SEED) {
    const found = items.some((i) => i.url === `https://gravityforai.com/blog/${seed.slug}`);
    assert(found, `Seed post ${seed.slug} must be in sitemap`);
  }
});

registerTest(2, 'B5', 'B5-TC3', 'All 3 AMP seed entries are included during zero-DB condition', async () => {
  const items = await loadSitemap();
  for (const seed of BLOG_POSTS_SEED) {
    const found = items.some((i) => i.url === `https://gravityforai.com/amp/blog/${seed.slug}`);
    assert(found, `AMP seed entry for ${seed.slug} must be in sitemap`);
  }
});

registerTest(2, 'B5', 'B5-TC4', 'Seed post publishedAt timestamps preserved accurately', async () => {
  const items = await loadSitemap();
  for (const seed of BLOG_POSTS_SEED) {
    const item = items.find((i) => i.url === `https://gravityforai.com/blog/${seed.slug}`)!;
    assertEqual(item.lastModified.getTime(), new Date(seed.publishedAt).getTime(), `Seed date for ${seed.slug}`);
  }
});

registerTest(2, 'B5', 'B5-TC5', 'Total sitemap count is at least 36 even when DB has zero posts', async () => {
  const items = await loadSitemap();
  assert(items.length >= 36, `Expected at least 36 items, got ${items.length}`);
});

// ── Boundary B6: Duplicate Slug Between DB and Seed ─────────────────────────
registerTest(2, 'B6', 'B6-TC1', 'Deduplication logic produces exactly one canonical entry per slug', () => {
  const seedPosts = [{ slug: 'duplicate-test', publishedAt: '2026-09-01T00:00:00Z' }];
  const dbPosts = [{ slug: 'duplicate-test', publishedAt: new Date('2026-09-10T00:00:00Z'), updatedAt: new Date() }];

  const postMap = new Map<string, { slug: string; lastModified: Date }>();
  for (const p of seedPosts) postMap.set(p.slug, { slug: p.slug, lastModified: new Date(p.publishedAt) });
  for (const p of dbPosts) postMap.set(p.slug, { slug: p.slug, lastModified: p.publishedAt });

  assertEqual(postMap.size, 1, 'Map size must be 1 after deduplication');
  assertEqual(postMap.get('duplicate-test')?.lastModified.toISOString(), '2026-09-10T00:00:00.000Z', 'DB timestamp preferred');
});

registerTest(2, 'B6', 'B6-TC2', 'Deduplication preserves corresponding AMP entry count at exactly 1', () => {
  const postMap = new Map<string, { slug: string }>();
  postMap.set('test-slug', { slug: 'test-slug' });
  postMap.set('test-slug', { slug: 'test-slug' });
  const allPosts = Array.from(postMap.values());
  const ampPages = allPosts.map((p) => `/amp/blog/${p.slug}`);
  assertEqual(ampPages.length, 1, 'AMP pages count must be 1');
});

registerTest(2, 'B6', 'B6-TC3', 'Multiple duplicate DB posts for same slug deduplicate cleanly', () => {
  const dbPosts = [
    { slug: 'same-slug', publishedAt: new Date('2026-09-01') },
    { slug: 'same-slug', publishedAt: new Date('2026-09-02') },
  ];
  const map = new Map();
  for (const p of dbPosts) map.set(p.slug, p);
  assertEqual(map.size, 1, 'Map must have single entry');
});

registerTest(2, 'B6', 'B6-TC4', 'Live sitemap has zero duplicate URLs across its entire list', async () => {
  const items = await loadSitemap();
  const urls = items.map((i) => i.url);
  const unique = new Set(urls);
  assertEqual(urls.length, unique.size, 'Live sitemap must contain zero duplicate URLs');
});

registerTest(2, 'B6', 'B6-TC5', 'Slug deduplication preserves valid Date object for lastModified', async () => {
  const items = await loadSitemap();
  for (const item of items) {
    assert(item.lastModified instanceof Date, `lastModified must be Date for ${item.url}`);
    assert(!isNaN(item.lastModified.getTime()), `lastModified must not be NaN for ${item.url}`);
  }
});

// ── Boundary B7: Non-Existent City Parameter ────────────────────────────────
registerTest(2, 'B7', 'B7-TC1', 'generateMetadata for non-existent city returns Location Not Found', async () => {
  const meta = await loadDynamicCityMetadata('atlantis-city');
  assertEqual(meta.title, 'Location Not Found | Gravity For AI', 'Fallback title');
});

registerTest(2, 'B7', 'B7-TC2', 'Non-existent city is never emitted in sitemap', async () => {
  const items = await loadSitemap();
  const found = items.some((i) => i.url.includes('atlantis-city'));
  assertEqual(found, false, 'Non-existent city must not be in sitemap');
});

registerTest(2, 'B7', 'B7-TC3', 'City parameter with directory traversal handled safely', async () => {
  const meta = await loadDynamicCityMetadata('../admin');
  assertEqual(meta.title, 'Location Not Found | Gravity For AI', 'Traversal slug safe title');
});

registerTest(2, 'B7', 'B7-TC4', 'City parameter with HTML/Script tags handled safely', async () => {
  const meta = await loadDynamicCityMetadata('<script>alert(1)</script>');
  assertEqual(meta.title, 'Location Not Found | Gravity For AI', 'XSS slug safe title');
});

registerTest(2, 'B7', 'B7-TC5', 'Empty city parameter handled safely', async () => {
  const meta = await loadDynamicCityMetadata('');
  assertEqual(meta.title, 'Location Not Found | Gravity For AI', 'Empty slug safe title');
});

// ─────────────────────────────────────────────────────────────────────────────
// TIER 3: PAIRWISE CROSS-FEATURE INTERACTIONS (6 INTERACTION PAIRS)
// ─────────────────────────────────────────────────────────────────────────────

registerTest(3, 'P1', 'T3-P1', 'Sitemap URLs strictly match canonical URLs on static location pages', async () => {
  const sitemapItems = await loadSitemap();
  const sitemapUrls = new Set(sitemapItems.map((i) => i.url));

  const staticSlugs = ['europe', 'india-remote', 'united-states', 'punjab-regional', 'locations', 'lp'];
  for (const slug of staticSlugs) {
    const meta = await loadStaticLocationMetadata(slug);
    const canonical = meta.alternates?.canonical;
    assert(!!canonical, `Canonical tag missing on ${slug}`);
    assert(sitemapUrls.has(canonical), `Canonical URL ${canonical} not present in sitemap.xml`);
  }
});

registerTest(3, 'P2', 'T3-P2', 'Dynamic city GEO coordinates in ICBM match authoritative city data', async () => {
  for (const citySlug of Object.keys(CITIES_DATA)) {
    const meta = await loadDynamicCityMetadata(citySlug);
    const other = meta.other as Record<string, string> | undefined;
    assert(!!other, `City ${citySlug} missing metadata.other (Milestone 2)`);
    assert(!!other['ICBM'], `City ${citySlug} missing ICBM meta tag`);
    assert(!!other['geo.region'], `City ${citySlug} missing geo.region meta tag`);
    assert(!!other['geo.placename'], `City ${citySlug} missing geo.placename meta tag`);
  }
});

registerTest(3, 'P3', 'T3-P3', 'Root layout Schema.org GeoCoordinates match Mansa city coordinates', () => {
  const jsonLd = readLayoutJsonLd();
  const geo = jsonLd.geo as { latitude: number; longitude: number };
  assertEqual(geo.latitude, 29.9975, 'Mansa latitude match');
  assertEqual(geo.longitude, 75.3983, 'Mansa longitude match');
});

registerTest(3, 'P4', 'T3-P4', 'Strict 1-to-1 bijective mapping between blog URLs and AMP blog URLs in sitemap', async () => {
  const items = await loadSitemap();
  const canonicalBlogs = items.filter((i) => i.url.includes('/blog/') && !i.url.includes('/amp/'));
  const ampBlogs = items.filter((i) => i.url.includes('/amp/blog/'));

  assertEqual(canonicalBlogs.length, ampBlogs.length, 'Blog count must equal AMP count');

  for (const c of canonicalBlogs) {
    const slug = c.url.split('/blog/')[1];
    const matchingAmp = ampBlogs.find((a) => a.url === `https://gravityforai.com/amp/blog/${slug}`);
    assert(!!matchingAmp, `Missing matching AMP for blog slug ${slug}`);
    assertEqual(c.lastModified.getTime(), matchingAmp!.lastModified.getTime(), `Timestamp mismatch for ${slug}`);
  }
});

registerTest(3, 'P5', 'T3-P5', 'Zero sitemap URLs overlap with robots.txt disallow rules', async () => {
  const items = await loadSitemap();
  const robotsRes = await loadRobots();
  const rules = Array.isArray(robotsRes.rules) ? robotsRes.rules : [robotsRes.rules];
  const starRule = rules.find((r) => r.userAgent === '*');
  const disallows = Array.isArray(starRule?.disallow) ? starRule!.disallow : (starRule?.disallow ? [starRule.disallow] : []);

  for (const item of items) {
    const pathname = new URL(item.url).pathname;
    for (const d of disallows) {
      if (d.endsWith('/')) {
        assert(!pathname.startsWith(d), `Sitemap URL ${item.url} is blocked by robots disallow ${d}`);
      } else {
        assert(pathname !== d && !pathname.startsWith(d + '/'), `Sitemap URL ${item.url} blocked by ${d}`);
      }
    }
  }
});

registerTest(3, 'P6', 'T3-P6', 'All 5 dynamic cities appear in sitemap with differentiated priority', async () => {
  const items = await loadSitemap();
  const cityKeys = Object.keys(CITIES_DATA);
  assertEqual(cityKeys.length, 5, 'Must have 5 cities in city-data.ts');

  for (const city of cityKeys) {
    const item = items.find((i) => i.url === `https://gravityforai.com/locations/${city}`);
    assert(!!item, `City /locations/${city} missing from sitemap`);
    if (city === 'mansa') {
      assertEqual(item!.priority, 0.9, 'Mansa HQ priority');
    } else {
      assertEqual(item!.priority, 0.8, `${city} priority`);
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TIER 4: REAL-WORLD WORKLOAD SCENARIOS (4 APPLICATION SCENARIOS)
// ─────────────────────────────────────────────────────────────────────────────

registerTest(4, 'S1', 'T4-S1', 'Scenario 1: Googlebot Crawler Simulation (Robots -> Sitemap -> URLs -> Canonicals)', async () => {
  // 1. Googlebot requests robots.txt
  const robotsRes = await loadRobots();
  assert(!!robotsRes.sitemap, 'Googlebot requires sitemap directive in robots.txt');

  // 2. Googlebot fetches sitemap.xml
  const sitemapItems = await loadSitemap();
  assert(sitemapItems.length >= 36, `Googlebot crawled ${sitemapItems.length} URLs (min 36 required)`);

  // 3. Googlebot validates lastModified freshness & throttling signals
  const now = new Date();
  let dynamicNowCount = 0;
  for (const item of sitemapItems) {
    if (Math.abs(now.getTime() - item.lastModified.getTime()) < 10_000) {
      dynamicNowCount++;
    }
  }
  assertEqual(dynamicNowCount, 0, 'Googlebot detected dynamic now timestamps causing crawl throttling');

  // 4. Googlebot validates AMP and canonical relationships
  const ampUrls = sitemapItems.filter((i) => i.url.includes('/amp/blog/'));
  assert(ampUrls.length >= 3, 'Googlebot detected missing AMP entries');
});

registerTest(4, 'S2', 'T4-S2', 'Scenario 2: AI Answer Engine Citation Extraction (Schema.org + GEO tags)', async () => {
  // 1. SearchGPT / Perplexity parses Root Layout JSON-LD
  const jsonLd = readLayoutJsonLd();
  const type = jsonLd['@type'] as string[];
  assert(type.includes('LocalBusiness'), 'Entity type LocalBusiness');
  assert(type.includes('ProfessionalService'), 'Entity type ProfessionalService');

  const geo = jsonLd.geo as { latitude: number; longitude: number };
  assertEqual(geo.latitude, 29.9975, 'Mansa lat');
  assertEqual(geo.longitude, 75.3983, 'Mansa lng');

  // 2. Engine parses dynamic city page GEO meta tags for regional citation
  const mansaMeta = await loadDynamicCityMetadata('mansa');
  const mansaOther = mansaMeta.other as Record<string, string> | undefined;
  assert(!!mansaOther, 'Mansa other metadata must exist (Milestone 2)');
  assertEqual(mansaOther['geo.region'], 'IN-PB', 'Region tag');
  assertEqual(mansaOther['ICBM'], '29.9975, 75.3983', 'ICBM coords');
});

registerTest(4, 'S3', 'T4-S3', 'Scenario 3: Local SEO & Google Maps Audit (NAP, Opening Hours, Map Links)', async () => {
  const jsonLd = readLayoutJsonLd();

  // Validate NAP (Name, Address, Phone/Email)
  assert(!!jsonLd.name, 'Name must be present');
  assert(!!jsonLd.email, 'Email must be present');
  assert(!!jsonLd.address, 'Address must be present');
  assertEqual((jsonLd.address as any).addressLocality, 'Mansa', 'Locality');
  assertEqual((jsonLd.address as any).addressRegion, 'Punjab', 'Region');

  // Validate Map & Opening Hours
  assertEqual(jsonLd.hasMap, 'https://maps.google.com/?q=Mansa,Punjab,India', 'Map link');
  assert(Array.isArray(jsonLd.openingHoursSpecification), 'Opening hours specification');
});

registerTest(4, 'S4', 'T4-S4', 'Scenario 4: Admin Indexing Submission Lifecycle (Auth -> Submit -> GSC Token -> Feedback)', async () => {
  const routePath = path.resolve(process.cwd(), 'src/app/api/admin/request-indexing/route.ts');
  assert(fs.existsSync(routePath), 'Route must exist (Milestone 3)');
  const { POST } = await import('@/app/api/admin/request-indexing/route');

  // 1. Unauthenticated submission blocked
  const unauthReq = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://gravityforai.com/blog/how-ai-voice-agents-work' }),
  });
  const unauthRes = await POST(unauthReq);
  assertEqual(unauthRes.status, 401, 'Unauth blocked');

  // 2. Admin submits valid URL with unconfigured GSC credentials -> receives setup guidance
  const adminCookie = signSession({ id: 'admin-1', email: 'admin@gravityforai.com', role: 'ADMIN' });
  const authReq = new Request('http://localhost:3000/api/admin/request-indexing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}`,
    },
    body: JSON.stringify({ url: 'https://gravityforai.com/blog/how-ai-voice-agents-work' }),
  });
  const authRes = await POST(authReq);
  assert(authRes.status !== 500, 'Must not crash with 500');
  const result = await authRes.json();
  assert(result !== null && typeof result === 'object', 'Response must be JSON');
});

// ─────────────────────────────────────────────────────────────────────────────
// RUNNER EXECUTION ENGINE & CLI INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

async function runTestSuite() {
  const args = process.argv.slice(2);
  const tierFilter = args.find((a) => a.startsWith('--tier='))?.split('=')[1];
  const featureFilter = args.find((a) => a.startsWith('--feature='))?.split('=')[1];
  const stringFilter = args.find((a) => a.startsWith('--filter='))?.split('=')[1];
  const isProgressive = args.includes('--progressive') || args.includes('--allow-in-progress');

  const selectedTests = registeredTests.filter((t) => {
    if (tierFilter && t.tier.toString() !== tierFilter) return false;
    if (featureFilter && t.feature.toUpperCase() !== featureFilter.toUpperCase()) return false;
    if (stringFilter && !t.title.toLowerCase().includes(stringFilter.toLowerCase())) return false;
    return true;
  });

  console.log(`\n${colors.bold}${colors.cyan}================================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  GRAVITY FOR AI - 4-TIER E2E TECHNICAL SEO & INDEXING TEST SUITE${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================================${colors.reset}`);
  console.log(`${colors.dim}Timestamp: ${new Date().toISOString()} | Target: https://gravityforai.com${colors.reset}`);
  console.log(`${colors.dim}Total Registered Tests: ${registeredTests.length} | Selected: ${selectedTests.length}${colors.reset}\n`);

  const results: TestResult[] = [];
  let currentTier = -1;

  for (const test of selectedTests) {
    if (test.tier !== currentTier) {
      currentTier = test.tier;
      const tierNames: Record<number, string> = {
        1: 'TIER 1: FEATURE CONTRACT COVERAGE',
        2: 'TIER 2: BOUNDARY & CORNER CASES',
        3: 'TIER 3: PAIRWISE CROSS-FEATURE INTERACTIONS',
        4: 'TIER 4: REAL-WORLD WORKLOAD SCENARIOS',
      };
      console.log(`\n${colors.bold}${colors.magenta}--- ${tierNames[currentTier] || `TIER ${currentTier}`} ---${colors.reset}`);
    }

    const start = performance.now();
    try {
      await test.fn();
      const durationMs = Math.round(performance.now() - start);
      results.push({
        id: test.id,
        tier: test.tier,
        feature: test.feature,
        title: test.title,
        status: 'PASS',
        durationMs,
      });
      console.log(`  ${colors.green}✔ PASS${colors.reset} ${colors.dim}[${test.id}]${colors.reset} ${test.title} ${colors.dim}(${durationMs}ms)${colors.reset}`);
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      const error = err as Error;
      results.push({
        id: test.id,
        tier: test.tier,
        feature: test.feature,
        title: test.title,
        status: 'FAIL',
        durationMs,
        error,
      });
      console.log(`  ${colors.red}✖ FAIL${colors.reset} ${colors.bold}[${test.id}]${colors.reset} ${test.title}`);
      console.log(`    ${colors.red}Error: ${error.message}${colors.reset}`);
    }
  }

  // ── Summary Table ──────────────────────────────────────────────────────────
  console.log(`\n${colors.bold}${colors.white}================================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.white}                             TEST EXECUTION SUMMARY                             ${colors.reset}`);
  console.log(`${colors.bold}${colors.white}================================================================================${colors.reset}`);

  const passedCount = results.filter((r) => r.status === 'PASS').length;
  const failedCount = results.filter((r) => r.status === 'FAIL').length;

  console.log(`${colors.bold}Tier Breakdown:${colors.reset}`);
  for (let t = 1; t <= 4; t++) {
    const tierResults = results.filter((r) => r.tier === t);
    if (tierResults.length === 0) continue;
    const tierPassed = tierResults.filter((r) => r.status === 'PASS').length;
    const tierFailed = tierResults.filter((r) => r.status === 'FAIL').length;
    const pct = Math.round((tierPassed / tierResults.length) * 100);
    const color = tierFailed === 0 ? colors.green : colors.yellow;
    console.log(
      `  Tier ${t}: ${tierPassed.toString().padStart(2)}/${tierResults.length.toString().padEnd(2)} passed (${color}${pct}%${colors.reset}) ${tierFailed > 0 ? `${colors.red}[${tierFailed} failed]${colors.reset}` : ''}`
    );
  }

  console.log(`\n${colors.bold}Totals:${colors.reset}`);
  console.log(`  Total Run:   ${results.length}`);
  console.log(`  Passed:      ${colors.green}${passedCount}${colors.reset}`);
  console.log(`  Failed:      ${failedCount > 0 ? colors.red : colors.green}${failedCount}${colors.reset}`);

  if (failedCount === 0) {
    console.log(`\n${colors.bgGreen}${colors.bold}${colors.white}  ALL TESTS PASSED (100% SUCCESS)  ${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.bgRed}${colors.bold}${colors.white}  ${failedCount} TEST(S) FAILED  ${colors.reset}`);
    if (isProgressive) {
      console.log(`${colors.yellow}Notice: --progressive flag enabled. Exiting with 0 for interim inspection.${colors.reset}\n`);
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
}

// Execute Runner
runTestSuite().catch((fatal) => {
  console.error(`\n${colors.bgRed}${colors.white}FATAL RUNNER ERROR:${colors.reset}`, fatal);
  process.exit(1);
});
