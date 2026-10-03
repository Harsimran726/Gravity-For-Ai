import fs from 'node:fs';
import path from 'node:path';
import robots from '../../src/app/robots';
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

async function executeSchemaStressSuite() {
  console.log('================================================================');
  console.log('  EMPIRICAL CHALLENGER 2: SCHEMA.ORG & CRAWLER BOUNDARY HARNESS');
  console.log('================================================================');

  const jsonLd = extractLayoutJsonLd();

  // -------------------------------------------------------------
  // SUITE 1: JSON-LD SYNTAX & SERIALIZATION ORACLE
  // -------------------------------------------------------------
  await runTest('JSON_SERIALIZATION', 'jsonLd serializes and round-trips to valid JSON without data loss', () => {
    const serialized = JSON.stringify(jsonLd);
    assert(typeof serialized === 'string', 'Serialization must return string');
    assert(serialized.length > 100, 'JSON-LD serialized string too short');
    const parsed = JSON.parse(serialized);
    assert(parsed['@context'] === 'https://schema.org', 'Round-trip context match');
    assert(parsed.name === 'Gravity For AI', 'Round-trip name match');
  });

  await runTest('JSON_SERIALIZATION', 'JSON-LD contains no undefined, function, or NaN values', () => {
    const checkValue = (val: any, keyPath: string) => {
      assert(val !== undefined, `Undefined value at ${keyPath}`);
      assert(typeof val !== 'function', `Function value at ${keyPath}`);
      if (typeof val === 'number') {
        assert(!isNaN(val), `NaN number at ${keyPath}`);
        assert(isFinite(val), `Infinite number at ${keyPath}`);
      }
      if (val && typeof val === 'object') {
        for (const k of Object.keys(val)) {
          checkValue(val[k], `${keyPath}.${k}`);
        }
      }
    };
    checkValue(jsonLd, 'root');
  });

  // -------------------------------------------------------------
  // SUITE 2: SCHEMA.ORG LOCALBUSINESS & PROFESSIONALSERVICE TYPES
  // -------------------------------------------------------------
  await runTest('SCHEMA_TYPES', '@context is strictly https://schema.org', () => {
    assert(jsonLd['@context'] === 'https://schema.org', `Invalid @context: ${jsonLd['@context']}`);
  });

  await runTest('SCHEMA_TYPES', '@type is an array containing both LocalBusiness and ProfessionalService', () => {
    const types = jsonLd['@type'];
    assert(Array.isArray(types), `@type must be an array, got ${typeof types}`);
    assert(types.includes('LocalBusiness'), 'Missing LocalBusiness in @type array');
    assert(types.includes('ProfessionalService'), 'Missing ProfessionalService in @type array');
    assert(types.length === 2, `Expected exactly 2 types in array, got ${types.length}`);
  });

  // -------------------------------------------------------------
  // SUITE 3: GEO COORDINATES EMPIRICAL VALIDATION
  // -------------------------------------------------------------
  await runTest('GEO_VALIDATION', 'geo is GeoCoordinates with strict numeric latitude and longitude', () => {
    assert(jsonLd.geo !== null && typeof jsonLd.geo === 'object', 'geo must be object');
    assert(jsonLd.geo['@type'] === 'GeoCoordinates', `geo.@type must be GeoCoordinates, got ${jsonLd.geo['@type']}`);
    assert(typeof jsonLd.geo.latitude === 'number', `latitude must be number, got ${typeof jsonLd.geo.latitude}`);
    assert(typeof jsonLd.geo.longitude === 'number', `longitude must be number, got ${typeof jsonLd.geo.longitude}`);
  });

  await runTest('GEO_VALIDATION', 'geo coordinates match exact Mansa, Punjab benchmark (29.9975, 75.3983)', () => {
    assert(jsonLd.geo.latitude === 29.9975, `latitude must be exactly 29.9975, got ${jsonLd.geo.latitude}`);
    assert(jsonLd.geo.longitude === 75.3983, `longitude must be exactly 75.3983, got ${jsonLd.geo.longitude}`);
  });

  await runTest('GEO_VALIDATION', 'geo coordinates pass geographic bounding box check for Mansa, Punjab', () => {
    const lat = jsonLd.geo.latitude;
    const lng = jsonLd.geo.longitude;
    // Mansa district bounds: lat ~29.8 to ~30.2, lng ~75.2 to ~75.6
    assert(lat >= 29.8 && lat <= 30.2, `Latitude ${lat} outside Mansa geographic bounds`);
    assert(lng >= 75.2 && lng <= 75.6, `Longitude ${lng} outside Mansa geographic bounds`);
  });

  // -------------------------------------------------------------
  // SUITE 4: HASMAP URL FORMAT & RESOLUTION
  // -------------------------------------------------------------
  await runTest('MAP_VALIDATION', 'hasMap is a valid Google Maps search URL for Mansa, Punjab, India', () => {
    assert(typeof jsonLd.hasMap === 'string', 'hasMap must be string');
    assert(jsonLd.hasMap.startsWith('https://maps.google.com/?q='), `hasMap URL invalid scheme/prefix: ${jsonLd.hasMap}`);
    const url = new URL(jsonLd.hasMap);
    assert(url.protocol === 'https:', 'hasMap protocol must be https:');
    assert(url.hostname === 'maps.google.com', 'hasMap hostname must be maps.google.com');
    const query = url.searchParams.get('q');
    assert(query !== null, 'hasMap must have q query parameter');
    assert(query!.includes('Mansa') && query!.includes('Punjab') && query!.includes('India'),
      `hasMap query missing Mansa, Punjab, India: ${query}`);
  });

  // -------------------------------------------------------------
  // SUITE 5: OPENING HOURS SPECIFICATION VALIDITY
  // -------------------------------------------------------------
  await runTest('HOURS_VALIDATION', 'openingHoursSpecification is array with valid schema types', () => {
    assert(Array.isArray(jsonLd.openingHoursSpecification), 'openingHoursSpecification must be an array');
    assert(jsonLd.openingHoursSpecification.length > 0, 'openingHoursSpecification must not be empty');
    for (const spec of jsonLd.openingHoursSpecification) {
      assert(spec['@type'] === 'OpeningHoursSpecification', `spec.@type must be OpeningHoursSpecification, got ${spec['@type']}`);
    }
  });

  await runTest('HOURS_VALIDATION', 'openingHoursSpecification covers Mon-Sat 09:00 to 18:00', () => {
    const spec = jsonLd.openingHoursSpecification[0];
    const expectedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    assert(Array.isArray(spec.dayOfWeek), 'dayOfWeek must be an array');
    assert(spec.dayOfWeek.length === 6, `Expected 6 days, got ${spec.dayOfWeek.length}`);
    for (const d of expectedDays) {
      assert(spec.dayOfWeek.includes(d), `Missing day in opening hours: ${d}`);
    }
    assert(!spec.dayOfWeek.includes('Sunday'), 'Sunday should not be in Mon-Sat business hours');
  });

  await runTest('HOURS_VALIDATION', 'opens and closes conform to ISO 8601 hh:mm format with opens < closes', () => {
    const spec = jsonLd.openingHoursSpecification[0];
    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    assert(timeRegex.test(spec.opens), `opens "${spec.opens}" not valid HH:MM format`);
    assert(timeRegex.test(spec.closes), `closes "${spec.closes}" not valid HH:MM format`);
    assert(spec.opens === '09:00', `opens must be 09:00, got ${spec.opens}`);
    assert(spec.closes === '18:00', `closes must be 18:00, got ${spec.closes}`);
    assert(spec.opens < spec.closes, `opens (${spec.opens}) must be before closes (${spec.closes})`);
  });

  // -------------------------------------------------------------
  // SUITE 6: POSTAL ADDRESS & LOCAL ENTITY VALIDATION
  // -------------------------------------------------------------
  await runTest('ENTITY_DETAILS', 'address has valid PostalAddress with Mansa, Punjab, IN and PIN 151505', () => {
    const addr = jsonLd.address;
    assert(addr && typeof addr === 'object', 'address must be object');
    assert(addr['@type'] === 'PostalAddress', 'address.@type must be PostalAddress');
    assert(addr.addressLocality === 'Mansa', `addressLocality must be Mansa, got ${addr.addressLocality}`);
    assert(addr.addressRegion === 'Punjab', `addressRegion must be Punjab, got ${addr.addressRegion}`);
    assert(addr.postalCode === '151505', `postalCode must be 151505, got ${addr.postalCode}`);
    assert(/^\d{6}$/.test(addr.postalCode), 'postalCode must be 6-digit Indian PIN');
    assert(addr.addressCountry === 'IN', `addressCountry must be IN, got ${addr.addressCountry}`);
  });

  await runTest('ENTITY_DETAILS', 'founder entity is Person with valid social/github profile URLs', () => {
    const founder = jsonLd.founder;
    assert(founder && typeof founder === 'object', 'founder must be object');
    assert(founder['@type'] === 'Person', 'founder.@type must be Person');
    assert(founder.name === 'Harsimran Singh', 'founder name');
    assert(founder.url.startsWith('https://'), 'founder url must be https');
    assert(Array.isArray(founder.sameAs), 'founder sameAs must be array');
    for (const url of founder.sameAs) {
      assert(url.startsWith('https://'), `founder sameAs URL must be https: ${url}`);
    }
  });

  await runTest('ENTITY_DETAILS', 'sameAs and areaServed are valid non-empty arrays', () => {
    assert(Array.isArray(jsonLd.sameAs) && jsonLd.sameAs.length >= 2, 'sameAs must have at least 2 profile links');
    assert(Array.isArray(jsonLd.areaServed) && jsonLd.areaServed.length >= 5, 'areaServed must cover key markets');
    assert(jsonLd.areaServed.includes('Mansa'), 'areaServed must include Mansa');
    assert(jsonLd.areaServed.includes('Punjab'), 'areaServed must include Punjab');
    assert(jsonLd.areaServed.includes('India'), 'areaServed must include India');
  });

  // -------------------------------------------------------------
  // SUITE 7: HTML SCRIPT INJECTION SAFETY
  // -------------------------------------------------------------
  await runTest('HTML_SAFETY', 'layout.tsx injects JSON-LD into script tag with type application/ld+json', () => {
    const layoutPath = path.resolve('src/app/layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');
    assert(content.includes('type="application/ld+json"'), 'layout.tsx must declare script type="application/ld+json"');
    assert(content.includes('JSON.stringify(jsonLd)'), 'layout.tsx must stringify jsonLd object');
    // Ensure no unescaped closing script tags in JSON-LD payload
    const serialized = JSON.stringify(jsonLd);
    assert(!serialized.includes('</script>'), 'JSON-LD payload contains illegal </script> tag sequence');
  });

  // -------------------------------------------------------------
  // SUITE 8: CANONICAL HIERARCHY & CRAWLER CONFLICT VERIFICATION
  // -------------------------------------------------------------
  await runTest('CRAWLER_HARMONY', 'layout.tsx metadata does not declare a global canonical override', () => {
    const layoutPath = path.resolve('src/app/layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');
    // Root layout should NOT have alternates: { canonical: ... }
    // It should have metadataBase: new URL('https://gravityforai.com')
    assert(content.includes('metadataBase: new URL(\'https://gravityforai.com\')'), 'metadataBase must be set in layout.tsx');
    const matchCanonical = content.match(/alternates\s*:\s*\{[\s\S]*?canonical/);
    assert(!matchCanonical, 'Root layout must not define a global canonical that child pages would accidentally inherit');
  });

  await runTest('CRAWLER_HARMONY', 'robots.txt and sitemap.xml have zero conflicting paths', async () => {
    const robotsConfig = robots();
    const sitemapEntries = await sitemap();
    const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules : [robotsConfig.rules];
    const defaultRule = rules.find((r) => r.userAgent === '*');
    assert(!!defaultRule, 'Wildcard robots rule must exist');
    const disallowed: string[] = (Array.isArray(defaultRule!.disallow) ? defaultRule!.disallow : [defaultRule!.disallow]).filter((d): d is string => typeof d === 'string');

    for (const entry of sitemapEntries) {
      const url = new URL(entry.url);
      for (const dis of disallowed) {
        const isBlocked = url.pathname === dis || (dis.endsWith('/') && url.pathname.startsWith(dis)) || url.pathname.startsWith(dis + '/');
        assert(!isBlocked, `Sitemap URL ${entry.url} is blocked by robots.txt disallow rule "${dis}"`);
      }
    }
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
    console.log('\nALL SCHEMA & CRAWLER HARMONY CHALLENGE TESTS PASSED (100%)');
  }
}

executeSchemaStressSuite().catch((e) => {
  console.error('Fatal schema stress failure:', e);
  process.exit(1);
});
