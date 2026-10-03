# Dispatch Assignment: Milestone 3 Challenger 1

## Role
Challenger 1 for Milestone 3 (Admin Indexing API Route Adversarial Verifier)

## Target
`src/app/api/admin/request-indexing/route.ts`

## Instructions
1. Stress-test the Indexing API route:
   - Negative authentication testing: unauthenticated, expired/tampered session tokens, non-admin roles (VIEWER, EDITOR).
   - Malformed/Adversarial URLs: empty string, spaces, non-URL text, `javascript:` protocol, data URIs, oversized payloads.
   - Missing/Malformed `GOOGLE_SERVICE_ACCOUNT_JSON`: ensure non-500 HTTP status is returned and informative JSON guidance provided without leaking stack traces.
2. Run test commands:
   `npx tsx tests/e2e/seo.test.ts --feature=F9`
   `npx tsx tests/e2e/seo.test.ts --feature=B1`
   `npx tsx tests/e2e/seo.test.ts --feature=B2`
   `npx tsx tests/e2e/seo.test.ts --feature=B3`
3. Write your handoff report with verdict (APPROVE or REQUEST_CHANGES) in:
   `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\challenger_m3_1\handoff.md`
4. Report back via send_message.


## 2026-10-03T05:51:06Z
You are Challenger 1 for Milestone 3 (challenger_m3_1).
Your working directory is: `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\challenger_m3_1`
Project root is: `C:\Data\Gravity For Ai\Wesbite V2`

Read:
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`
- `C:\Data\Gravity For Ai\Wesbite V2\PROJECT.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\challenger_m3_1\DISPATCH.md`

Empirically stress-test the Admin Indexing API route (`src/app/api/admin/request-indexing/route.ts`).
Challenge auth edge cases, non-admin roles, URL validation boundaries, dangerous schemes, and missing env var resilience.
Run:
- `npx tsx tests/e2e/seo.test.ts --feature=F9`
- `npx tsx tests/e2e/seo.test.ts --feature=B1`
- `npx tsx tests/e2e/seo.test.ts --feature=B2`
- `npx tsx tests/e2e/seo.test.ts --feature=B3`

Deliver your handoff report with verdict (APPROVE or REQUEST_CHANGES) in `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\challenger_m3_1\handoff.md`.
Report back via send_message when complete.
