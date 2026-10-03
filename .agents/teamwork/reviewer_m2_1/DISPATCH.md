# Dispatch: Reviewer M2-1

## Objective
Review Milestone 2 (Location Pages Canonical & GEO Meta) changes.
Read:
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`
- `C:\Data\Gravity For Ai\Wesbite V2\PROJECT.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m2_2\changes.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m2_2\handoff.md`

Examine:
- `src/app/locations/[city]/page.tsx`
- `src/app/locations/europe/page.tsx`
- `src/app/locations/india-remote/page.tsx`
- `src/app/locations/united-states/page.tsx`
- `src/app/locations/punjab-regional/page.tsx`
- `src/app/locations/page.tsx`

Verify:
1. Canonical tags point to exact URLs without trailing slashes.
2. Accurate `geo.region`, `geo.placename`, and `ICBM` on dynamic city pages.
3. Broad regional tags on aggregate pages without city-level ICBM.
4. Run `npx tsx tests/e2e/seo.test.ts --feature=F6; npx tsx tests/e2e/seo.test.ts --feature=F7; npx tsx tests/e2e/seo.test.ts --feature=F8` and `npm run build`.

Deliver verdict (`APPROVE` or `REQUEST_CHANGES`) in `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\reviewer_m2_1\handoff.md`.
Report back via send_message.
## 2026-10-02T15:59:30Z
You are Reviewer 1 for Milestone 2 (reviewer_m2_1).
Your working directory is: `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\reviewer_m2_1`
Project root is: `C:\Data\Gravity For Ai\Wesbite V2`

Read:
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`
- `C:\Data\Gravity For Ai\Wesbite V2\PROJECT.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m2_2\changes.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m2_2\handoff.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\reviewer_m2_1\DISPATCH.md`

Review location pages metadata in `src/app/locations/[city]/page.tsx` and all static location pages.
Run `npx tsx tests/e2e/seo.test.ts --feature=F6; npx tsx tests/e2e/seo.test.ts --feature=F7; npx tsx tests/e2e/seo.test.ts --feature=F8` and `npm run build`.
Write your handoff report with verdict (APPROVE or REQUEST_CHANGES) in `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\reviewer_m2_1\handoff.md`.
Report back via send_message.
