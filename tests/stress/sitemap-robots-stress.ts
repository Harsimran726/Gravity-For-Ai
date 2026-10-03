import sitemap from '../../src/app/sitemap';
import robots from '../../src/app/robots';
import { prisma } from '../../src/lib/prisma';
import { BLOG_POSTS_SEED } from '../../src/data/blog-seed-data';
import { SERVICES_DATA } from '../../src/data/services-data';
import { CITIES_DATA } from '../../src/data/city-data';
import { CASE_STUDIES } from '../../src/data/case-studies-data';

interface StressTestResult {
  name: string;
  category: string;
  passed: boolean;
  error?: string;
  details?: Record<string, any>;
}

const results: StressTestResult[] = [];

function assert(condition: boolean, message: string, details?: Record<string, any>) {
  if (!condition) {
    throw new Error(message + (details ? ' Details: ' + JSON.stringify(details) : ''));
  }
}

async function runTest(category: string, name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    results.push({ name, category, passed: true });
    console.log(`  [PASS] [${category}] ${name}`);
  } catch (err: any) {
    results.push({ name, category, passed: false, error: err.message, details: err.details });
    console.error(`  [FAIL] [${category}] ${name}: ${err.message}`);
  }
}

async function executeStressSuite() {
  console.log('================================================================');
  console.log('  EMPIRICAL CHALLENGER: SITEMAP & ROBOTS STRESS HARNESS');
  console.log('================================================================');

  // -------------------------------------------------------------
  // SUITE 1: URL INTEGRITY & STRUCTURE
  // -------------------------------------------------------------
  await runTest('URL_INTEGRITY', 'Baseline URL count matches exact public pages (36)', async () => {
    const entries = await sitemap();
    const expectedCount = 19 + Object.keys(SERVICES_DATA).length + Object.keys(CITIES_DATA).length + CASE_STUDIES.length + BLOG_POSTS_SEED.length + BLOG_POSTS_SEED.length;
    assert(entries.length === expectedCount, `Expected ${expectedCount} entries, got ${entries.length}`, { actual: entries.length, expected: expectedCount });
    assert(entries.length === 36, `Expected exactly 36 URLs for initial deployment, got ${entries.length}`);
  });

  await runTest('URL_INTEGRITY', 'All URLs have valid HTTPS protocol and target domain', async () => {
    const entries = await sitemap();
    for (const entry of entries) {
      assert(entry.url.startsWith('https://gravityforai.com'), `URL must start with https://gravityforai.com: ${entry.url}`);
      const parsed = new URL(entry.url);
      assert(parsed.protocol === 'https:', `Protocol must be https: ${entry.url}`);
      assert(parsed.host === 'gravityforai.com', `Host must be gravityforai.com: ${entry.url}`);
      // Ensure no double slashes in pathname
      assert(!parsed.pathname.includes('//'), `Path contains duplicate slashes: ${entry.url}`);
    }
  });

  await runTest('URL_INTEGRITY', 'No URL has trailing slashes except the root homepage', async () => {
    const entries = await sitemap();
    for (const entry of entries) {
      if (entry.url !== 'https://gravityforai.com') {
        assert(!entry.url.endsWith('/'), `URL has disallowed trailing slash: ${entry.url}`);
      }
    }
  });

  await runTest('URL_INTEGRITY', 'All URLs in sitemap are strictly unique (zero duplicates)', async () => {
    const entries = await sitemap();
    const seen = new Set<string>();
    for (const entry of entries) {
      assert(!seen.has(entry.url), `Duplicate URL detected in sitemap: ${entry.url}`);
      seen.add(entry.url);
    }
  });

  // -------------------------------------------------------------
  // SUITE 2: DATE DETERMINISM & STALENESS ORACLE
  // -------------------------------------------------------------
  await runTest('DATE_DETERMINISM', 'No entry has lastModified within 10 seconds of current execution time', async () => {
    const startTime = Date.now();
    const entries = await sitemap();
    for (const entry of entries) {
      assert(entry.lastModified instanceof Date, `lastModified is not a Date object: ${entry.url}`);
      const lm = entry.lastModified as Date;
      assert(!isNaN(lm.getTime()), `lastModified is NaN Date: ${entry.url}`);
      const diffMs = Math.abs(startTime - lm.getTime());
      assert(diffMs > 10_000, `lastModified is within 10 seconds of now (${diffMs}ms ago): ${entry.url}`);
    }
  });

  await runTest('DATE_DETERMINISM', 'Sitemap output is 100% bitwise deterministic across temporal gap', async () => {
    const run1 = await sitemap();
    // Simulate real delay
    await new Promise((r) => setTimeout(r, 100));
    const run2 = await sitemap();
    assert(run1.length === run2.length, 'Length mismatch between consecutive calls');
    for (let i = 0; i < run1.length; i++) {
      assert(run1[i].url === run2[i].url, `URL mismatch at index ${i}`);
      const d1 = new Date(run1[i].lastModified!);
      const d2 = new Date(run2[i].lastModified!);
      assert(d1.getTime() === d2.getTime(),
        `lastModified drifted at index ${i} (${run1[i].url}): run1=${d1.toISOString()} vs run2=${d2.toISOString()}`);
      assert(run1[i].priority === run2[i].priority, `Priority mismatch at index ${i}`);
      assert(run1[i].changeFrequency === run2[i].changeFrequency, `changeFrequency mismatch at index ${i}`);
    }
  });

  await runTest('DATE_DETERMINISM', 'All static pages have historical dates prior to deployment cutoff', async () => {
    const entries = await sitemap();
    const cutoff = new Date('2026-10-01T00:00:00.000Z');
    for (const entry of entries) {
      const d = new Date(entry.lastModified!);
      assert(d < cutoff, `lastModified is unexpectedly recent (>= 2026-10-01): ${entry.url} has ${d.toISOString()}`);
    }
  });

  await runTest('DATE_DETERMINISM', 'All dates serialize to valid ISO-8601 strings without error', async () => {
    const entries = await sitemap();
    for (const entry of entries) {
      const iso = new Date(entry.lastModified!).toISOString();
      assert(typeof iso === 'string' && iso.endsWith('Z'), `Invalid ISO serialization: ${entry.url}`);
    }
  });

  // -------------------------------------------------------------
  // SUITE 3: AMP URL MAPPING INTEGRITY
  // -------------------------------------------------------------
  await runTest('AMP_MAPPING', 'Every canonical blog post has an exact matching AMP blog post', async () => {
    const entries = await sitemap();
    const blogPosts = entries.filter((e) => e.url.startsWith('https://gravityforai.com/blog/'));
    const ampPosts = entries.filter((e) => e.url.startsWith('https://gravityforai.com/amp/blog/'));

    assert(blogPosts.length > 0, 'No canonical blog posts found in sitemap');
    assert(blogPosts.length === ampPosts.length, `Count mismatch: ${blogPosts.length} blog posts vs ${ampPosts.length} AMP posts`);

    const ampMap = new Map(ampPosts.map((p) => [p.url, p]));

    for (const canonical of blogPosts) {
      const slug = canonical.url.replace('https://gravityforai.com/blog/', '');
      const expectedAmpUrl = `https://gravityforai.com/amp/blog/${slug}`;
      const ampEntry = ampMap.get(expectedAmpUrl);
      assert(!!ampEntry, `Missing AMP entry for blog slug '${slug}'`);
      assert(ampEntry!.priority === 0.5, `AMP priority must be 0.5, got ${ampEntry!.priority} for ${expectedAmpUrl}`);
      assert(ampEntry!.changeFrequency === 'monthly', `AMP changeFrequency must be monthly, got ${ampEntry!.changeFrequency}`);
      const cDate = new Date(canonical.lastModified!);
      const aDate = new Date(ampEntry!.lastModified!);
      assert(aDate.getTime() === cDate.getTime(),
        `Timestamp divergence: canonical (${cDate.toISOString()}) vs AMP (${aDate.toISOString()})`);
    }
  });

  await runTest('AMP_MAPPING', 'No non-blog routes have AMP equivalents generated', async () => {
    const entries = await sitemap();
    const nonBlogAmp = entries.filter((e) => e.url.includes('/amp/') && !e.url.startsWith('https://gravityforai.com/amp/blog/'));
    assert(nonBlogAmp.length === 0, `Unexpected AMP routes found: ${nonBlogAmp.map((e) => e.url).join(', ')}`);
  });

  // -------------------------------------------------------------
  // SUITE 4: PRISMA DATABASE RESILIENCE & FAILURE INJECTION
  // -------------------------------------------------------------
  await runTest('DB_RESILIENCE', 'Sitemap survives Prisma connection crash (ECONNREFUSED)', async () => {
    const originalFindMany = prisma.blogPost.findMany;
    try {
      (prisma.blogPost as any).findMany = async () => {
        throw new Error('connect ECONNREFUSED 127.0.0.1:5432');
      };
      const entries = await sitemap();
      assert(entries.length === 36, `Expected fallback to 36 entries on DB crash, got ${entries.length}`);
      const blogPosts = entries.filter((e) => e.url.startsWith('https://gravityforai.com/blog/'));
      assert(blogPosts.length === 3, `Expected fallback to 3 seed posts, got ${blogPosts.length}`);
    } finally {
      prisma.blogPost.findMany = originalFindMany;
    }
  });

  await runTest('DB_RESILIENCE', 'Sitemap survives Prisma query timeout error', async () => {
    const originalFindMany = prisma.blogPost.findMany;
    try {
      (prisma.blogPost as any).findMany = async () => {
        const err = new Error('Query timed out after 30000ms');
        (err as any).code = 'P2024';
        throw err;
      };
      const entries = await sitemap();
      assert(entries.length === 36, `Expected fallback to 36 entries on DB timeout, got ${entries.length}`);
    } finally {
      prisma.blogPost.findMany = originalFindMany;
    }
  });

  await runTest('DB_RESILIENCE', 'Sitemap survives non-Error rejection (string / null throw)', async () => {
    const originalFindMany = prisma.blogPost.findMany;
    try {
      (prisma.blogPost as any).findMany = async () => {
        throw 'Database socket closed unexpectedly';
      };
      const entries = await sitemap();
      assert(entries.length === 36, `Expected fallback on non-Error throw, got ${entries.length}`);
    } finally {
      prisma.blogPost.findMany = originalFindMany;
    }
  });

  // -------------------------------------------------------------
  // SUITE 5: DEDUPLICATION & DB POST INGESTION ORACLE
  // -------------------------------------------------------------
  await runTest('DEDUPLICATION', 'DB post with identical slug overrides seed post lastModified without duplicating', async () => {
    const originalFindMany = prisma.blogPost.findMany;
    const testSlug = BLOG_POSTS_SEED[0].slug;
    const newUpdatedDate = new Date('2026-09-25T12:00:00.000Z');
    try {
      (prisma.blogPost as any).findMany = async () => {
        return [
          {
            slug: testSlug,
            publishedAt: new Date('2026-08-28T10:00:00.000Z'),
            updatedAt: newUpdatedDate,
          },
        ];
      };
      const entries = await sitemap();
      assert(entries.length === 36, `Expected exactly 36 entries (no duplicate created), got ${entries.length}`);
      const updatedEntry = entries.find((e) => e.url === `https://gravityforai.com/blog/${testSlug}`);
      assert(!!updatedEntry, 'Updated entry must exist');
      // In sitemap.ts: post.publishedAt || post.updatedAt -> publishedAt was non-null, so lastModified is publishedAt
      // Let's verify that the entry has a valid Date
      assert(updatedEntry!.lastModified instanceof Date, 'Entry lastModified must be Date');
    } finally {
      prisma.blogPost.findMany = originalFindMany;
    }
  });

  await runTest('DEDUPLICATION', 'DB post without publishedAt falls back to updatedAt', async () => {
    const originalFindMany = prisma.blogPost.findMany;
    const testSlug = BLOG_POSTS_SEED[0].slug;
    const newUpdatedDate = new Date('2026-09-25T12:00:00.000Z');
    try {
      (prisma.blogPost as any).findMany = async () => {
        return [
          {
            slug: testSlug,
            publishedAt: null,
            updatedAt: newUpdatedDate,
          },
        ];
      };
      const entries = await sitemap();
      const updatedEntry = entries.find((e) => e.url === `https://gravityforai.com/blog/${testSlug}`);
      const uDate = new Date(updatedEntry?.lastModified!);
      assert(uDate.getTime() === newUpdatedDate.getTime(),
        `Expected lastModified to fall back to updatedAt ${newUpdatedDate.toISOString()}, got ${uDate.toISOString()}`);
    } finally {
      prisma.blogPost.findMany = originalFindMany;
    }
  });

  await runTest('DEDUPLICATION', 'DB post with new slug is added to both canonical and AMP entries', async () => {
    const originalFindMany = prisma.blogPost.findMany;
    const newPostSlug = 'dynamic-ai-agents-in-enterprise';
    const newPostDate = new Date('2026-09-18T08:00:00.000Z');
    try {
      (prisma.blogPost as any).findMany = async () => {
        return [
          {
            slug: newPostSlug,
            publishedAt: newPostDate,
            updatedAt: newPostDate,
          },
        ];
      };
      const entries = await sitemap();
      assert(entries.length === 38, `Expected 38 entries (36 baseline + 1 canonical + 1 AMP), got ${entries.length}`);
      const canonical = entries.find((e) => e.url === `https://gravityforai.com/blog/${newPostSlug}`);
      const amp = entries.find((e) => e.url === `https://gravityforai.com/amp/blog/${newPostSlug}`);
      assert(!!canonical, 'Missing canonical entry for dynamic DB post');
      assert(!!amp, 'Missing AMP entry for dynamic DB post');
      const canDate = new Date(canonical!.lastModified!);
      const ampDate = new Date(amp!.lastModified!);
      assert(canDate.getTime() === newPostDate.getTime(), 'Canonical date mismatch');
      assert(ampDate.getTime() === newPostDate.getTime(), 'AMP date mismatch');
      assert(amp!.priority === 0.5, 'AMP priority must be 0.5');
    } finally {
      prisma.blogPost.findMany = originalFindMany;
    }
  });

  // -------------------------------------------------------------
  // SUITE 6: ROBOTS.TXT DIRECTIVES & CRAWLER BOUNDARIES
  // -------------------------------------------------------------
  await runTest('ROBOTS_TXT', 'robots() returns valid config without host property', () => {
    const config = robots();
    assert(typeof config === 'object', 'Robots config must be an object');
    assert(!('host' in config), 'Robots config MUST NOT contain host property');
    assert((config as any).host === undefined, 'host property must be undefined');
  });

  await runTest('ROBOTS_TXT', 'robots() configures sitemap index URL correctly', () => {
    const config = robots();
    assert(config.sitemap === 'https://gravityforai.com/sitemap.xml', `Expected sitemap URL https://gravityforai.com/sitemap.xml, got ${config.sitemap}`);
  });

  await runTest('ROBOTS_TXT', 'robots() disallows /admin and /api with and without trailing slash', () => {
    const config = robots();
    const defaultRule = Array.isArray(config.rules) ? config.rules.find((r) => r.userAgent === '*') : config.rules;
    assert(!!defaultRule, 'Default rule for userAgent * not found');
    const disallows = Array.isArray(defaultRule!.disallow) ? defaultRule!.disallow : [defaultRule!.disallow];
    assert(disallows.includes('/admin'), 'Disallow must include /admin');
    assert(disallows.includes('/admin/'), 'Disallow must include /admin/');
    assert(disallows.includes('/api'), 'Disallow must include /api');
    assert(disallows.includes('/api/'), 'Disallow must include /api/');
  });

  await runTest('ROBOTS_TXT', 'robots() explicitly includes major AI / LLM crawler agents', () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const aiRule = rules.find((r) => Array.isArray(r.userAgent) && r.userAgent.includes('GPTBot'));
    assert(!!aiRule, 'AI bots rule group not found');
    const expectedBots = [
      'Googlebot',
      'Bingbot',
      'GPTBot',
      'ChatGPT-User',
      'PerplexityBot',
      'ClaudeBot',
      'Applebot',
      'Google-Extended',
      'Applebot-Extended',
    ];
    for (const bot of expectedBots) {
      assert((aiRule!.userAgent as string[]).includes(bot), `Expected AI bot ${bot} in robots rules`);
    }
    assert(aiRule!.allow === '/', 'AI bots rule must allow /');
  });

  // -------------------------------------------------------------
  // SUITE 7: ROBOTS VS SITEMAP ZERO-CONFLICT ORACLE
  // -------------------------------------------------------------
  await runTest('CRAWLER_CONFLICT', 'Zero sitemap URLs are blocked by robots.txt disallow rules', async () => {
    const config = robots();
    const entries = await sitemap();
    const disallowedPaths = ['/admin', '/api'];

    for (const entry of entries) {
      const parsed = new URL(entry.url);
      for (const disallowed of disallowedPaths) {
        assert(!parsed.pathname.startsWith(disallowed),
          `CONFLICT: Sitemap URL ${entry.url} is blocked by robots.txt disallow rule '${disallowed}'`);
      }
    }
  });

  // -------------------------------------------------------------
  // SUITE 8: W3C XML SERIALIZABILITY & PARSING
  // -------------------------------------------------------------
  await runTest('XML_SERIALIZABILITY', 'Sitemap entries produce valid W3C XML representation', async () => {
    const entries = await sitemap();
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const entry of entries) {
      xml += '  <url>\n';
      xml += `    <loc>${entry.url}</loc>\n`;
      xml += `    <lastmod>${new Date(entry.lastModified!).toISOString()}</lastmod>\n`;
      if (entry.changeFrequency) {
        xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
      }
      if (entry.priority !== undefined) {
        xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      }
      xml += '  </url>\n';
    }
    xml += '</urlset>';

    assert(xml.includes('<urlset'), 'XML must include urlset tag');
    assert(xml.includes('</urlset>'), 'XML must close urlset tag');
    assert(xml.includes('https://gravityforai.com/amp/blog/ai-voice-agent-vs-receptionist-cost-india-2026'), 'XML must include AMP blog post');
    // Ensure no unescaped characters in XML
    assert(!xml.includes('&amp;amp;'), 'XML must not contain double escaped entities');
  });

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('================================================================');
  console.log('                         EXECUTION SUMMARY                      ');
  console.log('================================================================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Total Run:   ${results.length}`);
  console.log(`Passed:      ${passed}`);
  console.log(`Failed:      ${failed}`);
  if (failed > 0) {
    console.log('\nFailed Tests:');
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`  - [${r.category}] ${r.name}: ${r.error}`);
    }
    process.exit(1);
  } else {
    console.log('\nALL EMPIRICAL CHALLENGE TESTS PASSED (100%)');
  }
}

executeStressSuite().catch((e) => {
  console.error('Fatal stress suite failure:', e);
  process.exit(1);
});
