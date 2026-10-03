# Dispatch: Explorer Survey 2

## Objective
Investigate the codebase for Technical SEO requirements R2 (canonical tags) and R3 (GEO meta tags).
Read `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`.
Examine:
- `src/app/locations/[city]/page.tsx`
- `src/app/locations/europe/page.tsx`
- `src/app/locations/india-remote/page.tsx`
- `src/app/locations/united-states/page.tsx`
- `src/app/locations/punjab-regional/page.tsx`
- `src/app/lp/page.tsx`
- Look up all cities in the project, their ISO 3166-2 region codes, coordinates (lat/lng for ICBM), placenames.
- Identify current metadata implementations and how canonical and `other` geo tags should be formatted in Next.js 14 App Router.


## 2026-10-02T11:26:38Z
You are an Explorer subagent (explorer_survey_2).
Your working directory is: `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\explorer_survey_2`
Project root is: `C:\Data\Gravity For Ai\Wesbite V2`

Read the original request verbatim at:
`C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`
And your dispatch file at:
`C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\explorer_survey_2\DISPATCH.md`

Your mission:
Investigate requirements R2 and R3:
1. R2: Inspect canonical tags on all static location pages:
   - `src/app/locations/europe/page.tsx`
   - `src/app/locations/india-remote/page.tsx`
   - `src/app/locations/united-states/page.tsx`
   - `src/app/locations/punjab-regional/page.tsx`
   - Inspect `src/app/lp/page.tsx` to verify trailing slash handling.
   - Inspect `src/app/locations/[city]/page.tsx` to check existing canonical implementation.
2. R3: GEO meta tags:
   - Inspect all city definitions (where are city slugs defined? `src/lib/...` or in `[city]/page.tsx`?).
   - List every single city page and find exact ISO 3166-2 region codes, coordinates (lat/lng for ICBM), and placenames. (e.g. Mansa, Chandigarh, Delhi, etc.)
   - For aggregate pages (europe, united-states, india-remote, punjab-regional), determine appropriate broad region codes ('US', 'DE', 'IN', 'IN-PB') without ICBM.
   - Check how Next.js 14 App Router `other` metadata field outputs meta tags.

IMPORTANT: Do not modify source code. Deliver a comprehensive analysis report to:
`C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\explorer_survey_2\analysis.md`
and write your `handoff.md`.
Report back when finished via send_message.
