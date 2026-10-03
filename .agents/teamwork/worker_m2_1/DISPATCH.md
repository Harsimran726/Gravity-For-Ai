# Dispatch: Worker M2 (Location Pages Canonical & GEO Meta)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objective
Implement Milestone 2: Location Pages Canonical & GEO Meta Tags.
Read:
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`
- `C:\Data\Gravity For Ai\Wesbite V2\PROJECT.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\explorer_survey_2\analysis.md`

## Exclusive Write Boundaries
You exclusively own and may edit:
- `src/app/locations/[city]/page.tsx`
- `src/app/locations/europe/page.tsx`
- `src/app/locations/india-remote/page.tsx`
- `src/app/locations/united-states/page.tsx`
- `src/app/locations/punjab-regional/page.tsx`
- `src/app/locations/page.tsx`
DO NOT modify any other files. DO NOT modify any page content, copy, hero text, testimonials, or UI components.

## Specific Requirements
1. **Dynamic City Pages** (`src/app/locations/[city]/page.tsx`):
   - In `generateMetadata`:
     - Maintain existing canonical tag: `alternates: { canonical: ... }` (no trailing slash).
     - Add `other` metadata field with accurate values:
       - Mansa: `geo.region: 'IN-PB'`, `geo.placename: 'Mansa, Punjab, India'`, `ICBM: '29.9975, 75.3983'`
       - Bathinda: `geo.region: 'IN-PB'`, `geo.placename: 'Bathinda, Punjab, India'`, `ICBM: '30.2110, 74.9455'`
       - Chandigarh: `geo.region: 'IN-PB'`, `geo.placename: 'Chandigarh, Punjab, India'`, `ICBM: '30.7333, 76.7794'`
       - Ludhiana: `geo.region: 'IN-PB'`, `geo.placename: 'Ludhiana, Punjab, India'`, `ICBM: '30.9010, 75.8573'`
       - Delhi: `geo.region: 'IN-DL'`, `geo.placename: 'Delhi, India'`, `ICBM: '28.6139, 77.2090'`
     - Ensure fallback or invalid city slug handles safely.
2. **Static Regional / Aggregate Pages**:
   - `src/app/locations/europe/page.tsx`:
     - Ensure `alternates: { canonical: 'https://gravityforai.com/locations/europe' }`.
     - Add `other: { 'geo.region': 'DE', 'geo.placename': 'Germany' }` (no city-level ICBM).
   - `src/app/locations/united-states/page.tsx`:
     - Ensure `alternates: { canonical: 'https://gravityforai.com/locations/united-states' }`.
     - Add `other: { 'geo.region': 'US', 'geo.placename': 'United States' }` (no city-level ICBM).
   - `src/app/locations/india-remote/page.tsx`:
     - Ensure `alternates: { canonical: 'https://gravityforai.com/locations/india-remote' }`.
     - Add `other: { 'geo.region': 'IN', 'geo.placename': 'India' }` (no city-level ICBM).
   - `src/app/locations/punjab-regional/page.tsx`:
     - Ensure `alternates: { canonical: 'https://gravityforai.com/locations/punjab-regional' }`.
     - Add `other: { 'geo.region': 'IN-PB', 'geo.placename': 'Punjab, India' }` (no city-level ICBM).
   - `src/app/locations/page.tsx`:
     - Ensure `alternates: { canonical: 'https://gravityforai.com/locations' }`.
     - Add `other: { 'geo.region': 'IN-PB', 'geo.placename': 'Mansa, Punjab, India', 'ICBM': '29.9975, 75.3983' }`.
3. **Verification**:
   - Run `npx tsx tests/e2e/seo.test.ts --feature=F6; npx tsx tests/e2e/seo.test.ts --feature=F7; npx tsx tests/e2e/seo.test.ts --feature=F8`
   - Run `npm run build` to confirm zero compilation errors.
   - Document changes in `changes.md` and `handoff.md`.
54: Report back via send_message when complete.
55: 
## 2026-10-02T12:23:31Z
You are Worker subagent for Milestone 2 (worker_m2_1).
Your working directory is: `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m2_1`
Project root is: `C:\Data\Gravity For Ai\Wesbite V2`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Read:
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`
- `C:\Data\Gravity For Ai\Wesbite V2\PROJECT.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\explorer_survey_2\analysis.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m2_1\DISPATCH.md`

Your exclusive write boundaries:
- `src/app/locations/[city]/page.tsx`
- `src/app/locations/europe/page.tsx`
- `src/app/locations/india-remote/page.tsx`
- `src/app/locations/united-states/page.tsx`
- `src/app/locations/punjab-regional/page.tsx`
- `src/app/locations/page.tsx`
DO NOT modify any other files. DO NOT modify any page content, copy, hero text, testimonials, or UI JSX components.

Execute:
1. Update `src/app/locations/[city]/page.tsx`:
   - In `generateMetadata`, add `other` metadata containing:
     - `'geo.region'` (e.g. IN-PB for Punjab cities, IN-DL for Delhi)
     - `'geo.placename'` (e.g. 'Mansa, Punjab, India', 'Bathinda, Punjab, India', 'Chandigarh, Punjab, India', 'Ludhiana, Punjab, India', 'Delhi, India')
     - `'ICBM'` (e.g. '29.9975, 75.3983', '30.2110, 74.9455', '30.7333, 76.7794', '30.9010, 75.8573', '28.6139, 77.2090')
   - Preserve existing canonical URL.
2. Update static location pages with broad region tags:
   - `src/app/locations/europe/page.tsx`: `other: { 'geo.region': 'DE', 'geo.placename': 'Germany' }`
   - `src/app/locations/united-states/page.tsx`: `other: { 'geo.region': 'US', 'geo.placename': 'United States' }`
   - `src/app/locations/india-remote/page.tsx`: `other: { 'geo.region': 'IN', 'geo.placename': 'India' }`
   - `src/app/locations/punjab-regional/page.tsx`: `other: { 'geo.region': 'IN-PB', 'geo.placename': 'Punjab, India' }`
   - `src/app/locations/page.tsx`: `other: { 'geo.region': 'IN-PB', 'geo.placename': 'Mansa, Punjab, India', 'ICBM': '29.9975, 75.3983' }`
   - Ensure all retain their proper canonical URLs.
3. Verify with:
   - `npx tsx tests/e2e/seo.test.ts --feature=F6`
   - `npx tsx tests/e2e/seo.test.ts --feature=F7`
   - `npx tsx tests/e2e/seo.test.ts --feature=F8`
   - `npm run build`
4. Document changes in `changes.md` and deliver `handoff.md`.
Report back via send_message when complete.
