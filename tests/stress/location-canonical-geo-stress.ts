import fs from 'node:fs';
import path from 'node:path';
import { AsyncLocalStorage } from 'node:async_hooks';

// Polyfill AsyncLocalStorage on globalThis before Next.js modules load
(globalThis as unknown as { AsyncLocalStorage: typeof AsyncLocalStorage }).AsyncLocalStorage = AsyncLocalStorage;

import { CITIES_DATA } from '@/data/city-data';
import { NICHE_LANDING_PAGES } from '@/data/landing-pages-data';
import nextConfig from '../../next.config.mjs';

interface TestResult {
  suite: string;
  testName: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: Expected [${expected}], got [${actual}]`);
  }
}

async function runTest(suite: string, testName: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    results.push({ suite, testName, passed: true });
    console.log(`  ✔ [PASS] [${suite}] ${testName}`);
  } catch (err: any) {
    results.push({ suite, testName, passed: false, error: err.message });
    console.error(`  ✖ [FAIL] [${suite}] ${testName}: ${err.message}`);
  }
}

// Dynamic loaders
async function loadSitemap() {
  const mod = await import('@/app/sitemap');
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
      throw new Error(`Unknown slug: ${slug}`);
  }
}

function extractLayoutJsonLd(): Record<string, any> {
  const layoutPath = path.resolve('src/app/layout.tsx');
  const content = fs.readFileSync(layoutPath, 'utf-8');
  const match = content.match(/const\s+jsonLd\s*=\s*(\{[\s\S]*?\n\s*\};)/);
  assert(!!match, 'Could not locate jsonLd definition in layout.tsx');
  const fn = new Function(`
    const process = { env: {} };
    ${match![0]}
    return jsonLd;
  `);
  return fn();
}

async function main() {
  console.log('================================================================');
  console.log('  CHALLENGER M2-2: CANONICALS, TRAILING SLASHES & GEO STRESS SUITE');
  console.log('================================================================');

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 1: CANONICAL URL INTEGRITY & FORMAT RIGOR
  // ───────────────────────────────────────────────────────────────────────────
  const staticLocationSlugs = ['locations', 'europe', 'india-remote', 'united-states', 'punjab-regional', 'lp'];
  const dynamicCitySlugs = Object.keys(CITIES_DATA);

  for (const slug of staticLocationSlugs) {
    await runTest('CANONICAL_STATIC', `Static route /${slug === 'locations' || slug === 'lp' ? slug : `locations/${slug}`} has strictly valid canonical`, async () => {
      const meta = await loadStaticLocationMetadata(slug);
      const canonical = String(meta.alternates?.canonical || '');
      assert(typeof canonical === 'string' && canonical.length > 0, `Canonical must be a non-empty string on ${slug}`);
      const expectedUrl = slug === 'locations' ? 'https://gravityforai.com/locations'
        : slug === 'lp' ? 'https://gravityforai.com/lp'
        : `https://gravityforai.com/locations/${slug}`;
      assertEqual(canonical, expectedUrl, `Canonical URL mismatch for ${slug}`);
      assert(!canonical.endsWith('/'), `Canonical must NOT have trailing slash for ${slug}`);
      assert(canonical.startsWith('https://gravityforai.com'), `Must use HTTPS root domain for ${slug}`);
    });
  }

  for (const citySlug of dynamicCitySlugs) {
    await runTest('CANONICAL_DYNAMIC', `Dynamic city route /locations/${citySlug} has strictly valid canonical`, async () => {
      const meta = await loadDynamicCityMetadata(citySlug);
      const canonical = String(meta.alternates?.canonical || '');
      assert(typeof canonical === 'string' && canonical.length > 0, `Canonical must be non-empty string for ${citySlug}`);
      const expectedUrl = `https://gravityforai.com/locations/${citySlug}`;
      assertEqual(canonical, expectedUrl, `Canonical URL mismatch for ${citySlug}`);
      assert(!canonical.endsWith('/'), `Canonical must NOT have trailing slash for ${citySlug}`);
      assert(canonical.startsWith('https://gravityforai.com'), `Must use HTTPS root domain for ${citySlug}`);
    });
  }

  for (const nicheKey of Object.keys(NICHE_LANDING_PAGES)) {
    await runTest('CANONICAL_LP_NICHES', `Niche LP /lp/${nicheKey} has strictly valid canonical`, async () => {
      const mod = await import('@/app/lp/[niche]/page');
      const meta = mod.generateMetadata({ params: { niche: nicheKey } });
      const canonical = String(meta.alternates?.canonical || '');
      assert(typeof canonical === 'string' && canonical.length > 0, `Canonical must be non-empty string for lp/${nicheKey}`);
      const expectedUrl = `https://gravityforai.com/lp/${nicheKey}`;
      assertEqual(canonical, expectedUrl, `Canonical URL mismatch for lp/${nicheKey}`);
      assert(!canonical.endsWith('/'), `Canonical must NOT have trailing slash for lp/${nicheKey}`);
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 2: TRAILING SLASH IMMUNITY & SITEMAP BIJECTIVE MAPPING
  // ───────────────────────────────────────────────────────────────────────────
  await runTest('TRAILING_SLASH', 'Sitemap contains zero location URLs with trailing slashes', async () => {
    const sitemapItems = await loadSitemap();
    const locationItems = sitemapItems.filter((i) => i.url.includes('/locations'));
    assert(locationItems.length >= 6, `Expected at least 6 location items in sitemap, got ${locationItems.length}`);
    for (const item of locationItems) {
      assert(!item.url.endsWith('/'), `Sitemap location URL must not have trailing slash: ${item.url}`);
    }
  });

  await runTest('TRAILING_SLASH', 'Every location canonical URL maps bijectively into sitemap.xml', async () => {
    const sitemapItems = await loadSitemap();
    const sitemapUrls = new Set(sitemapItems.map((i) => i.url));

    for (const slug of staticLocationSlugs) {
      const meta = await loadStaticLocationMetadata(slug);
      const canonical = meta.alternates?.canonical as string;
      assert(sitemapUrls.has(canonical), `Canonical ${canonical} missing from sitemap.xml`);
    }

    for (const citySlug of dynamicCitySlugs) {
      const meta = await loadDynamicCityMetadata(citySlug);
      const canonical = meta.alternates?.canonical as string;
      assert(sitemapUrls.has(canonical), `Dynamic city canonical ${canonical} missing from sitemap.xml`);
    }
  });

  await runTest('TRAILING_SLASH', 'Next.js redirects configuration contains zero destination trailing slashes', async () => {
    if (typeof nextConfig.redirects === 'function') {
      const redirects = await nextConfig.redirects();
      for (const r of redirects) {
        if (r.destination !== '/' && !r.destination.startsWith('http')) {
          assert(!r.destination.endsWith('/'), `Redirect destination has trailing slash: ${r.destination}`);
        }
      }
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 3: AI ANSWER ENGINE GEO META & SCHEMA CITATION EXTRACTION
  // ───────────────────────────────────────────────────────────────────────────
  const layoutJsonLd = extractLayoutJsonLd();

  await runTest('GEO_CITATION', 'Root Layout schema provides authoritative HQ GeoCoordinates and Map URL', () => {
    assert(layoutJsonLd['@context'] === 'https://schema.org', 'Context must be schema.org');
    const types = layoutJsonLd['@type'];
    assert(Array.isArray(types) && types.includes('LocalBusiness') && types.includes('ProfessionalService'), 'Types');
    const geo = layoutJsonLd.geo;
    assertEqual(geo.latitude, 29.9975, 'Mansa latitude');
    assertEqual(geo.longitude, 75.3983, 'Mansa longitude');
    assertEqual(layoutJsonLd.hasMap, 'https://maps.google.com/?q=Mansa,Punjab,India', 'Map link');
  });

  // Dynamic Cities GEO and ICBM checks
  const authoritativeCoords: Record<string, { lat: number; lng: number; region: string }> = {
    mansa: { lat: 29.9975, lng: 75.3983, region: 'IN-PB' },
    bathinda: { lat: 30.2110, lng: 74.9455, region: 'IN-PB' },
    chandigarh: { lat: 30.7333, lng: 76.7794, region: 'IN-PB' },
    ludhiana: { lat: 30.9010, lng: 75.8573, region: 'IN-PB' },
    delhi: { lat: 28.6139, lng: 77.2090, region: 'IN-DL' },
  };

  for (const [citySlug, expected] of Object.entries(authoritativeCoords)) {
    await runTest('GEO_CITATION', `City ${citySlug} has valid ISO geo.region, placename, and coordinate-bounded ICBM`, async () => {
      const meta = await loadDynamicCityMetadata(citySlug);
      const other = meta.other as Record<string, string>;
      assert(!!other, `City ${citySlug} missing metadata.other`);
      assertEqual(other['geo.region'], expected.region, `Region for ${citySlug}`);
      assert(typeof other['geo.placename'] === 'string' && other['geo.placename'].length > 0, `Placename for ${citySlug}`);

      const icbm = other['ICBM'];
      assert(typeof icbm === 'string', `ICBM missing for ${citySlug}`);
      const parts = icbm.split(',').map((s) => parseFloat(s.trim()));
      assertEqual(parts.length, 2, `ICBM parts count for ${citySlug}`);
      const [lat, lng] = parts;
      assert(Math.abs(lat - expected.lat) < 0.001, `Latitude deviation too large for ${citySlug}: got ${lat}, expected ${expected.lat}`);
      assert(Math.abs(lng - expected.lng) < 0.001, `Longitude deviation too large for ${citySlug}: got ${lng}, expected ${expected.lng}`);
    });
  }

  // Static Aggregate Location Pages GEO checks
  const staticGeoExpectations: Record<string, { region: string; placename: string; allowCityICBM: boolean }> = {
    'europe': { region: 'DE', placename: 'Germany', allowCityICBM: false },
    'india-remote': { region: 'IN', placename: 'India', allowCityICBM: false },
    'united-states': { region: 'US', placename: 'United States', allowCityICBM: false },
    'punjab-regional': { region: 'IN-PB', placename: 'Punjab, India', allowCityICBM: false },
    'locations': { region: 'IN-PB', placename: 'Mansa, Punjab, India', allowCityICBM: true },
  };

  for (const [slug, exp] of Object.entries(staticGeoExpectations)) {
    await runTest('GEO_CITATION', `Static page ${slug} respects aggregate GEO rules (no city ICBM for macro-regions)`, async () => {
      const meta = await loadStaticLocationMetadata(slug);
      const other = meta.other as Record<string, string>;
      assert(!!other, `Metadata other missing for ${slug}`);
      assertEqual(other['geo.region'], exp.region, `geo.region for ${slug}`);
      assertEqual(other['geo.placename'], exp.placename, `geo.placename for ${slug}`);
      if (!exp.allowCityICBM) {
        assert(!other['ICBM'], `Aggregate page ${slug} must NOT contain city-level ICBM coordinates`);
      } else {
        assert(!!other['ICBM'], `Base locations page ${slug} should feature Mansa HQ ICBM`);
      }
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 4: END-TO-END AI CITATION EXTRACTION HARNESS (KNOWLEDGE GRAPH EXTRACTION)
  // ───────────────────────────────────────────────────────────────────────────
  await runTest('AI_ENTITY_EXTRACTION', 'AI engine extracts complete entity knowledge graph across all location hubs', async () => {
    // Simulated SearchGPT / Perplexity citation parser
    interface EntityCitation {
      canonicalUrl: string;
      title: string;
      geoRegion: string;
      placename: string;
      icbm?: string;
      hasParentLocalBusiness: boolean;
    }

    const citations: EntityCitation[] = [];

    // Extract dynamic cities
    for (const citySlug of dynamicCitySlugs) {
      const meta = await loadDynamicCityMetadata(citySlug);
      const other = (meta.other || {}) as Record<string, string>;
      citations.push({
        canonicalUrl: meta.alternates?.canonical as string,
        title: meta.title as string,
        geoRegion: other['geo.region'],
        placename: other['geo.placename'],
        icbm: other['ICBM'],
        hasParentLocalBusiness: true,
      });
    }

    // Extract static regional hubs
    for (const slug of Object.keys(staticGeoExpectations)) {
      const meta = await loadStaticLocationMetadata(slug);
      const other = (meta.other || {}) as Record<string, string>;
      citations.push({
        canonicalUrl: meta.alternates?.canonical as string,
        title: meta.title as string,
        geoRegion: other['geo.region'],
        placename: other['geo.placename'],
        icbm: other['ICBM'],
        hasParentLocalBusiness: true,
      });
    }

    // Validate extracted citations
    assertEqual(citations.length, 10, 'Must extract citations for all 10 location pages (5 dynamic + 5 static)');
    for (const c of citations) {
      assert(c.canonicalUrl.startsWith('https://gravityforai.com/locations'), `Canonical must be location URL: ${c.canonicalUrl}`);
      assert(!c.canonicalUrl.endsWith('/'), `Canonical must have no trailing slash: ${c.canonicalUrl}`);
      assert(typeof c.title === 'string' && c.title.length > 10, `Title must be descriptive: ${c.title}`);
      assert(typeof c.geoRegion === 'string' && c.geoRegion.length >= 2, `geoRegion must be valid ISO: ${c.geoRegion}`);
      assert(typeof c.placename === 'string' && c.placename.length >= 2, `placename must be valid: ${c.placename}`);
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 5: ADVERSARIAL EDGE CASES & SECURITY STRESS
  // ───────────────────────────────────────────────────────────────────────────
  const adversarialSlugs = [
    'mansa/', // trailing slash requested
    'MANSA', // uppercase
    '../mansa', // path traversal attempt
    'non-existent-city', // missing slug
    '"><script>alert(1)</script>', // XSS payload
    '%20mansa%20', // url-encoded whitespace
    'null',
    'undefined',
    '',
  ];

  for (const badSlug of adversarialSlugs) {
    await runTest('ADVERSARIAL_INPUTS', `Adversarial slug "${badSlug}" does not crash metadata generator`, async () => {
      const meta = await loadDynamicCityMetadata(badSlug);
      assert(typeof meta === 'object' && meta !== null, 'Metadata must return valid object');
      // For any invalid slug, it should return fallback title and NOT export poisoned canonical or other
      if (!CITIES_DATA[badSlug]) {
        assertEqual(meta.title, 'Location Not Found | Gravity For AI', 'Safe fallback title');
        assert(!meta.alternates?.canonical, 'Must not export canonical for non-existent city');
        assert(!meta.other, 'Must not export geo tags for non-existent city');
      }
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ───────────────────────────────────────────────────────────────────────────
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled suite error:', err);
  process.exit(1);
});
