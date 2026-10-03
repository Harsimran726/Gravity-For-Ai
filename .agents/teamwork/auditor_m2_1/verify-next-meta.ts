import { generateMetadata as generateCityMetadata } from '@/app/locations/[city]/page';
import { metadata as europeMetadata } from '@/app/locations/europe/page';
import { metadata as indiaRemoteMetadata } from '@/app/locations/india-remote/page';
import { metadata as usMetadata } from '@/app/locations/united-states/page';
import { metadata as punjabRegionalMetadata } from '@/app/locations/punjab-regional/page';
import { metadata as locationsHubMetadata } from '@/app/locations/page';
import { renderToStaticMarkup } from 'react-dom/server';

// @ts-ignore
import { BasicMeta } from 'next/dist/lib/metadata/generate/basic';

async function verify() {
  console.log('--- VERIFYING NEXT.JS METADATA RENDERING ---');

  // Test 1: Mansa dynamic page
  const mansaMeta = generateCityMetadata({ params: { city: 'mansa' } });
  const mansaNodes = BasicMeta({ metadata: mansaMeta });
  const mansaHtml = renderToStaticMarkup(mansaNodes);
  console.log('Mansa rendered HTML:\n', mansaHtml);

  if (!mansaHtml.includes('name="geo.region" content="IN-PB"')) throw new Error('Missing geo.region in Mansa');
  if (!mansaHtml.includes('name="geo.placename" content="Mansa, Punjab, India"')) throw new Error('Missing geo.placename in Mansa');
  if (!mansaHtml.includes('name="ICBM" content="29.9975, 75.3983"')) throw new Error('Missing ICBM in Mansa');

  // Test 2: Europe static page
  const europeNodes = BasicMeta({ metadata: europeMetadata });
  const europeHtml = renderToStaticMarkup(europeNodes);
  console.log('\nEurope rendered HTML:\n', europeHtml);
  if (!europeHtml.includes('name="geo.region" content="DE"')) throw new Error('Missing geo.region in Europe');
  if (!europeHtml.includes('name="geo.placename" content="Germany"')) throw new Error('Missing geo.placename in Europe');
  if (europeHtml.includes('name="ICBM"')) throw new Error('Unexpected ICBM in Europe aggregate page');

  // Test 3: India Remote static page
  const indiaNodes = BasicMeta({ metadata: indiaRemoteMetadata });
  const indiaHtml = renderToStaticMarkup(indiaNodes);
  console.log('\nIndia Remote rendered HTML:\n', indiaHtml);
  if (!indiaHtml.includes('name="geo.region" content="IN"')) throw new Error('Missing geo.region in India Remote');
  if (!indiaHtml.includes('name="geo.placename" content="India"')) throw new Error('Missing geo.placename in India Remote');

  // Test 4: US static page
  const usNodes = BasicMeta({ metadata: usMetadata });
  const usHtml = renderToStaticMarkup(usNodes);
  console.log('\nUnited States rendered HTML:\n', usHtml);
  if (!usHtml.includes('name="geo.region" content="US"')) throw new Error('Missing geo.region in US');
  if (!usHtml.includes('name="geo.placename" content="United States"')) throw new Error('Missing geo.placename in US');

  // Test 5: Punjab Regional static page
  const punjabNodes = BasicMeta({ metadata: punjabRegionalMetadata });
  const punjabHtml = renderToStaticMarkup(punjabNodes);
  console.log('\nPunjab Regional rendered HTML:\n', punjabHtml);
  if (!punjabHtml.includes('name="geo.region" content="IN-PB"')) throw new Error('Missing geo.region in Punjab Regional');
  if (!punjabHtml.includes('name="geo.placename" content="Punjab, India"')) throw new Error('Missing geo.placename in Punjab Regional');

  // Test 6: Locations Hub
  const hubNodes = BasicMeta({ metadata: locationsHubMetadata });
  const hubHtml = renderToStaticMarkup(hubNodes);
  console.log('\nLocations Hub rendered HTML:\n', hubHtml);
  if (!hubHtml.includes('name="geo.region" content="IN-PB"')) throw new Error('Missing geo.region in Hub');
  if (!hubHtml.includes('name="geo.placename" content="Mansa, Punjab, India"')) throw new Error('Missing geo.placename in Hub');
  if (!hubHtml.includes('name="ICBM" content="29.9975, 75.3983"')) throw new Error('Missing ICBM in Hub');

  console.log('\nALL 6 LOCATION METADATA RENDERING CHECKS PASSED EMPIRICALLY!');
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});
