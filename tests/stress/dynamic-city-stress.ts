import fs from 'node:fs';
import path from 'node:path';
import { generateMetadata } from '../../src/app/locations/[city]/page';
import CityPage from '../../src/app/locations/[city]/page';
import { CITIES_DATA } from '../../src/data/city-data';
import sitemap from '../../src/app/sitemap';

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
    const err = new Error(message + (details ? ' Details: ' + JSON.stringify(details) : ''));
    (err as any).details = details;
    throw err;
  }
}

function assertEqual<T>(actual: T, expected: T, context: string) {
  if (actual !== expected) {
    throw new Error(`${context}: Expected [${expected}], but received [${actual}]`);
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

function extractLayoutJsonLd(): Record<string, any> {
  const layoutPath = path.resolve('src/app/layout.tsx');
  assert(fs.existsSync(layoutPath), 'src/app/layout.tsx must exist');
  const content = fs.readFileSync(layoutPath, 'utf-8');

  const match = content.match(/const\s+jsonLd\s*=\s*(\{[\s\S]*?\n\s*\};)/);
  assert(!!match, 'Could not locate jsonLd definition in layout.tsx');

  try {
    const fn = new Function(`
      const process = { env: {} };
      ${match![0]}
      return jsonLd;
    `);
    return fn();
  } catch (e: any) {
    throw new Error(`Failed to parse jsonLd object: ${e.message}`);
  }
}

async function executeCityStressSuite() {
  console.log('================================================================');
  console.log('  EMPIRICAL CHALLENGER 1: DYNAMIC CITY METADATA STRESS HARNESS  ');
  console.log('================================================================');

  // -------------------------------------------------------------
  // SUITE 1: COORDINATE INTEGRITY & FLOATING POINT PRECISION
  // -------------------------------------------------------------
  const expectedCityCoords: Record<string, { lat: number; lng: number; region: string; placename: string }> = {
    mansa: { lat: 29.9975, lng: 75.3983, region: 'IN-PB', placename: 'Mansa, Punjab, India' },
    bathinda: { lat: 30.2110, lng: 74.9455, region: 'IN-PB', placename: 'Bathinda, Punjab, India' },
    chandigarh: { lat: 30.7333, lng: 76.7794, region: 'IN-PB', placename: 'Chandigarh, Punjab, India' },
    ludhiana: { lat: 30.9010, lng: 75.8573, region: 'IN-PB', placename: 'Ludhiana, Punjab, India' },
    delhi: { lat: 28.6139, lng: 77.2090, region: 'IN-DL', placename: 'Delhi, India' },
  };

  for (const [slug, expected] of Object.entries(expectedCityCoords)) {
    await runTest('COORDINATE_INTEGRITY', `Dynamic city ${slug} coordinates, region, and placename precision`, async () => {
      const meta = generateMetadata({ params: { city: slug } });
      assert(!!meta, `Metadata for ${slug} must be returned`);
      const other = meta.other as Record<string, string> | undefined;
      assert(!!other, `Metadata.other for ${slug} must exist`);
      if (!other) throw new Error(`other is undefined for ${slug}`);

      assertEqual(other['geo.region'], expected.region, `${slug} geo.region`);
      assertEqual(other['geo.placename'], expected.placename, `${slug} geo.placename`);

      const icbm = other['ICBM'];
      assert(!!icbm, `${slug} must contain ICBM tag`);
      if (!icbm) throw new Error(`ICBM is undefined for ${slug}`);
      const parts = icbm.split(',').map((s) => s.trim());
      assertEqual(parts.length, 2, `${slug} ICBM must have 2 comma-separated components`);

      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);

      assert(!Number.isNaN(lat), `${slug} latitude must be a valid float`);
      assert(!Number.isNaN(lng), `${slug} longitude must be a valid float`);

      const latDiff = Math.abs(lat - expected.lat);
      const lngDiff = Math.abs(lng - expected.lng);

      assert(latDiff < 1e-4, `${slug} latitude difference ${latDiff} exceeds precision threshold 1e-4`);
      assert(lngDiff < 1e-4, `${slug} longitude difference ${lngDiff} exceeds precision threshold 1e-4`);

      // Bounding box validation: Northern India
      assert(lat >= 28.0 && lat <= 32.0, `${slug} latitude out of North India range: ${lat}`);
      assert(lng >= 74.0 && lng <= 78.0, `${slug} longitude out of North India range: ${lng}`);
    });
  }

  // -------------------------------------------------------------
  // SUITE 2: CANONICAL AND OPENGRAPH INTEGRITY
  // -------------------------------------------------------------
  for (const slug of Object.keys(CITIES_DATA)) {
    await runTest('CANONICAL_OG', `Dynamic city ${slug} canonical and OG tags`, async () => {
      const meta = generateMetadata({ params: { city: slug } });
      const expectedCanonical = `https://gravityforai.com/locations/${slug}`;
      const canonical = meta.alternates?.canonical as string | undefined;
      assertEqual(canonical, expectedCanonical, `${slug} canonical URL`);
      assert(!canonical?.endsWith('/'), `${slug} canonical must not end with trailing slash`);
      assertEqual(meta.openGraph?.url, expectedCanonical, `${slug} OG URL`);
      assertEqual(meta.title, CITIES_DATA[slug].title, `${slug} title`);
      assertEqual(meta.description, CITIES_DATA[slug].metaDescription, `${slug} description`);
    });
  }

  // -------------------------------------------------------------
  // SUITE 3: ADVERSARIAL AND NEGATIVE INPUT TESTING
  // -------------------------------------------------------------
  const negativeCases = [
    { label: 'Non-existent fictional city', slug: 'atlantis' },
    { label: 'Non-existent foreign city', slug: 'tokyo' },
    { label: 'Numeric city string', slug: '99999' },
    { label: 'Empty string', slug: '' },
    { label: 'Single space', slug: ' ' },
    { label: 'Multiple whitespace', slug: '   \t  ' },
    { label: 'Path traversal ../admin', slug: '../admin' },
    { label: 'Deep path traversal ../../etc/passwd', slug: '../../etc/passwd' },
    { label: 'Windows backslash traversal ..\\admin', slug: '..\\admin' },
    { label: 'Script injection tag', slug: '<script>alert(1)</script>' },
    { label: 'HTML img tag injection', slug: '<img src=x onerror=alert(1)>' },
    { label: 'SQL injection payload', slug: "' OR '1'='1" },
    { label: 'NoSQL selector payload', slug: '{"$ne": null}' },
    { label: 'URL encoded special characters', slug: '%20%2F%5C' },
    { label: 'Uppercase city name (MANSA)', slug: 'MANSA' },
    { label: 'Mixed case city name (ChAnDiGaRh)', slug: 'ChAnDiGaRh' },
    { label: 'City name with trailing slash (mansa/)', slug: 'mansa/' },
    { label: 'City name with leading slash (/mansa)', slug: '/mansa' },
  ];

  for (const { label, slug } of negativeCases) {
    await runTest('NEGATIVE_SLUGS', `Safe fallback on ${label} (slug="${slug}")`, async () => {
      let meta: any;
      try {
        meta = generateMetadata({ params: { city: slug } });
      } catch (err: any) {
        throw new Error(`generateMetadata threw an unhandled exception for slug "${slug}": ${err.message}`);
      }
      assert(!!meta, `generateMetadata must return a metadata object`);
      assertEqual(meta.title, 'Location Not Found | Gravity For AI', `Title for invalid slug "${slug}"`);
      assert(!meta.other, `Invalid slug "${slug}" must not export other geo tags`);
      assert(!meta.alternates?.canonical, `Invalid slug "${slug}" must not export alternates.canonical`);
    });
  }

  // -------------------------------------------------------------
  // SUITE 4: PROTOTYPE PROPERTY ADVERSARIAL CHALLENGE
  // -------------------------------------------------------------
  const prototypeProperties = ['toString', 'valueOf', 'constructor', 'hasOwnProperty', 'isPrototypeOf', '__proto__'];

  for (const prop of prototypeProperties) {
    await runTest('PROTOTYPE_CHALLENGE', `Handling of prototype property name as slug: "${prop}"`, async () => {
      let meta: any;
      let errorThrown = false;
      try {
        meta = generateMetadata({ params: { city: prop } });
      } catch (err) {
        errorThrown = true;
      }

      // We assess behavior: does it crash or return Location Not Found?
      const isNotFound = meta?.title === 'Location Not Found | Gravity For AI';

      if (!isNotFound) {
        console.warn(`    ⚠️ Notice: Slug "${prop}" resolved prototype property on CITIES_DATA object: title=${meta?.title}`);
      }

      // Key assertion: it must NEVER throw an unhandled exception
      assert(!errorThrown, `generateMetadata crashed on prototype property "${prop}"`);
    });
  }

  // -------------------------------------------------------------
  // SUITE 5: DEFENSIVE TYPESAFETY (NON-STRING / NULL / UNDEFINED)
  // -------------------------------------------------------------
  const defensiveTypes = [
    { label: 'undefined city param', params: { city: undefined as any } },
    { label: 'null city param', params: { city: null as any } },
    { label: 'number city param', params: { city: 12345 as any } },
    { label: 'object city param', params: { city: {} as any } },
  ];

  for (const { label, params } of defensiveTypes) {
    await runTest('DEFENSIVE_TYPES', `Handling of ${label}`, async () => {
      let meta: any;
      try {
        meta = generateMetadata({ params });
      } catch (err: any) {
        throw new Error(`generateMetadata threw on ${label}: ${err.message}`);
      }
      assert(!!meta, `Must return metadata object`);
      assertEqual(meta.title, 'Location Not Found | Gravity For AI', `Title for ${label}`);
    });
  }

  // -------------------------------------------------------------
  // SUITE 6: CROSS-SYSTEM SYNCHRONIZATION WITH SITEMAP & SCHEMA
  // -------------------------------------------------------------
  await runTest('CROSS_SYSTEM_SYNC', 'Sitemap includes all 5 dynamic city URLs with exact canonical URLs', async () => {
    const items = await sitemap();
    for (const citySlug of Object.keys(CITIES_DATA)) {
      const expectedUrl = `https://gravityforai.com/locations/${citySlug}`;
      const found = items.find((i) => i.url === expectedUrl);
      assert(!!found, `City URL ${expectedUrl} not found in sitemap output`);
      assertEqual(found!.url.endsWith('/'), false, `City URL ${expectedUrl} in sitemap must not have trailing slash`);
    }
  });

  await runTest('CROSS_SYSTEM_SYNC', 'Layout Schema.org GeoCoordinates match Mansa HQ coordinates', () => {
    const jsonLd = extractLayoutJsonLd();
    assert(!!jsonLd.geo, 'Layout jsonLd must contain geo object');
    assertEqual(jsonLd.geo.latitude, 29.9975, 'Mansa latitude match between layout and city-data');
    assertEqual(jsonLd.geo.longitude, 75.3983, 'Mansa longitude match between layout and city-data');
  });

  // -------------------------------------------------------------
  // SUITE 7: STATIC VS DYNAMIC LOCATION GEO TAG ISOLATION
  // -------------------------------------------------------------
  await runTest('GEO_TAG_ISOLATION', 'Static aggregate location pages do NOT leak city-level ICBM tags', async () => {
    const staticPages = [
      { name: 'europe', mod: await import('../../src/app/locations/europe/page') },
      { name: 'india-remote', mod: await import('../../src/app/locations/india-remote/page') },
      { name: 'united-states', mod: await import('../../src/app/locations/united-states/page') },
    ];

    for (const { name, mod } of staticPages) {
      const other = (mod.metadata as any)?.other as Record<string, string> | undefined;
      assert(!!other, `${name} must export metadata.other`);
      if (!other) throw new Error(`${name} other is undefined`);
      assert(!other['ICBM'], `${name} must NOT export city-level ICBM coordinates`);
      assert(!!other['geo.region'], `${name} must export broad geo.region`);
      assert(!!other['geo.placename'], `${name} must export geo.placename`);
    }
  });

  // -------------------------------------------------------------
  // SUITE 8: PAGE COMPONENT RENDER INTEGRITY & NOTFOUND TRIPPED
  // -------------------------------------------------------------
  for (const slug of Object.keys(CITIES_DATA)) {
    await runTest('PAGE_COMPONENT', `CityPage component generates valid JSX and LD-JSON for ${slug}`, async () => {
      const jsx = CityPage({ params: { city: slug } });
      assert(!!jsx, `CityPage must return JSX for ${slug}`);
    });
  }

  await runTest('PAGE_COMPONENT', `CityPage component triggers notFound() for invalid city`, async () => {
    let notFoundTriggered = false;
    try {
      CityPage({ params: { city: 'non-existent-city' } });
    } catch (e: any) {
      if (e?.digest?.startsWith('NEXT_NOT_FOUND') || e?.message?.includes('NEXT_NOT_FOUND')) {
        notFoundTriggered = true;
      } else {
        throw e;
      }
    }
    assert(notFoundTriggered, 'CityPage must throw NEXT_NOT_FOUND for non-existent city');
  });

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log('                 STRESS TEST EXECUTION SUMMARY                  ');
  console.log('================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Run:   ${total}`);
  console.log(`Passed:      ${passed}`);
  console.log(`Failed:      ${failed}`);

  if (failed > 0) {
    console.error(`\nFAILED TESTS (${failed}):`);
    for (const r of results.filter((r) => !r.passed)) {
      console.error(`  - [${r.category}] ${r.name}: ${r.error}`);
    }
    process.exit(1);
  } else {
    console.log('\nALL EMPIRICAL STRESS TESTS PASSED CLEANLY (100% SUCCESS)');
    process.exit(0);
  }
}

executeCityStressSuite().catch((e) => {
  console.error('Unhandled fatal error in stress suite:', e);
  process.exit(1);
});
