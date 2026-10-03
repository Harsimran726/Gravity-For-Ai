# Dispatch: Worker M2 Replacement (Location SEO Verification & Handoff)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objective
Verify Milestone 2 changes implemented across location pages, confirm build & test pass, document `changes.md`, and produce `handoff.md`.
Read:
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`
- `C:\Data\Gravity For Ai\Wesbite V2\PROJECT.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m2_1\progress.md`

Examine:
- `src/app/locations/[city]/page.tsx`
- `src/app/locations/europe/page.tsx`
- `src/app/locations/india-remote/page.tsx`
- `src/app/locations/united-states/page.tsx`
- `src/app/locations/punjab-regional/page.tsx`
- `src/app/locations/page.tsx`

Tasks:
1. Verify all location pages have correct `alternates.canonical` (no trailing slash) and `other` GEO metadata (`geo.region`, `geo.placename`, and `ICBM` where applicable).
2. Run test verification:
   `npx tsx tests/e2e/seo.test.ts --feature=F6`
   `npx tsx tests/e2e/seo.test.ts --feature=F7`
   `npx tsx tests/e2e/seo.test.ts --feature=F8`
   `npm run build`
3. Write `changes.md` and `handoff.md` in `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m2_2\`.
Report back via send_message when complete.


## 2026-10-02T15:50:59Z
[Message] timestamp=2026-10-02T15:50:59Z sender=5ba01f6a-efc9-4b5b-a12a-2c326dfd4aa2 priority=MESSAGE_PRIORITY_HIGH content=You are Worker subagent worker_m2_2 taking over from worker_m2_1 following a server restart.
Your working directory is: `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m2_2`
Project root is: `C:\Data\Gravity For Ai\Wesbite V2`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Read:
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`
- `C:\Data\Gravity For Ai\Wesbite V2\PROJECT.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m2_1\progress.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m2_2\DISPATCH.md`

Examine:
- `src/app/locations/[city]/page.tsx`
- `src/app/locations/europe/page.tsx`
- `src/app/locations/india-remote/page.tsx`
- `src/app/locations/united-states/page.tsx`
- `src/app/locations/punjab-regional/page.tsx`
- `src/app/locations/page.tsx`

Verify:
1. `geo.region`, `geo.placename`, and `ICBM` tags in `[city]/page.tsx` and static location pages.
2. Canonical tags in all location pages.
3. Run:
   `npx tsx tests/e2e/seo.test.ts --feature=F6`
   `npx tsx tests/e2e/seo.test.ts --feature=F7`
   `npx tsx tests/e2e/seo.test.ts --feature=F8`
   `npm run build`
4. Write `changes.md` and `handoff.md` in your working directory.
Report back via send_message when complete.
