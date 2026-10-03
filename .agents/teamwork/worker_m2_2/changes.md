# Milestone 2: Location Pages Canonical & GEO Meta Changes

## Summary of Changes

Milestone 2 addresses Technical SEO requirements R2 and R3 from `ORIGINAL_REQUEST.md`, ensuring all location pages export self-referential canonical URLs without trailing slashes and provide accurate regional and geographical metadata (`geo.region`, `geo.placename`, and `ICBM` where applicable).

### 1. Dynamic City Routes (`src/app/locations/[city]/page.tsx`)
- Defined authoritative geographic registry `CITY_GEO_DATA` mapping all active cities to ISO 3166-2 region codes, formatted placenames, and precise latitude/longitude coordinates:
  - `mansa`: `region: 'IN-PB'`, `placename: 'Mansa, Punjab, India'`, `icbm: '29.9975, 75.3983'`
  - `bathinda`: `region: 'IN-PB'`, `placename: 'Bathinda, Punjab, India'`, `icbm: '30.2110, 74.9455'`
  - `chandigarh`: `region: 'IN-PB'`, `placename: 'Chandigarh, Punjab, India'`, `icbm: '30.7333, 76.7794'`
  - `ludhiana`: `region: 'IN-PB'`, `placename: 'Ludhiana, Punjab, India'`, `icbm: '30.9010, 75.8573'`
  - `delhi`: `region: 'IN-DL'`, `placename: 'Delhi, India'`, `icbm: '28.6139, 77.2090'`
- Updated `generateMetadata()`:
  - Preserved `alternates: { canonical: https://gravityforai.com/locations/${city.citySlug} }` (no trailing slash).
  - Added `other` metadata block containing `geo.region`, `geo.placename`, and `ICBM`.
  - Maintained safe fallback handling for non-existent city slugs (`Location Not Found`).

### 2. Static Aggregate Location Page: Europe (`src/app/locations/europe/page.tsx`)
- Exported in `metadata`:
  - `alternates: { canonical: 'https://gravityforai.com/locations/europe' }`
  - `other: { 'geo.region': 'DE', 'geo.placename': 'Germany' }`
- Broad region code applied without city-level ICBM coordinates per requirement §R3.

### 3. Static Aggregate Location Page: India Remote (`src/app/locations/india-remote/page.tsx`)
- Exported in `metadata`:
  - `alternates: { canonical: 'https://gravityforai.com/locations/india-remote' }`
  - `other: { 'geo.region': 'IN', 'geo.placename': 'India' }`
- Broad country-level region code applied without city-level ICBM coordinates per requirement §R3.

### 4. Static Aggregate Location Page: United States (`src/app/locations/united-states/page.tsx`)
- Exported in `metadata`:
  - `alternates: { canonical: 'https://gravityforai.com/locations/united-states' }`
  - `other: { 'geo.region': 'US', 'geo.placename': 'United States' }`
- Broad national region code applied without city-level ICBM coordinates per requirement §R3.

### 5. Static Regional Location Page: Punjab Regional (`src/app/locations/punjab-regional/page.tsx`)
- Exported in `metadata`:
  - `alternates: { canonical: 'https://gravityforai.com/locations/punjab-regional' }`
  - `other: { 'geo.region': 'IN-PB', 'geo.placename': 'Punjab, India' }`

### 6. Locations Hub Directory (`src/app/locations/page.tsx`)
- Exported in `metadata`:
  - `alternates: { canonical: 'https://gravityforai.com/locations' }`
  - `other: { 'geo.region': 'IN-PB', 'geo.placename': 'Mansa, Punjab, India', 'ICBM': '29.9975, 75.3983' }`
