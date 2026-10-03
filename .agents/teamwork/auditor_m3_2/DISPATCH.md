# Dispatch Assignment: Milestone 3 Forensic Integrity Auditor (Instance 2)

## Role
Forensic Integrity Auditor for Milestone 3 (Admin Request Indexing Tool — R6)
Replacing auditor_m3_1.

## Target Files
- `src/app/api/admin/request-indexing/route.ts`
- `src/app/admin/request-indexing-card.tsx`
- `src/app/admin/page.tsx`
- Worker changes: `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m3_1\changes.md`
- Worker handoff: `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m3_1\handoff.md`

## Instructions
1. Conduct a comprehensive forensic integrity audit:
   - Check 1: Cheating / Hardcoding Detection: Verify that Google Indexing API implementation is genuine (real RS256 JWT assertion using Node.js crypto, real Google OAuth endpoint, real Indexing v3 endpoint). Confirm that test results are not hardcoded or mocked in source code.
   - Check 2: Dummy / Facade Implementation Detection: Verify authentic Next.js components and route handlers.
   - Check 3: Code Integrity & Copy Preservation: Confirm zero unauthorized modifications to existing admin panel features or page copy (`git diff origin/main src/app/admin`).
   - Check 4: Build & Test Verification: Confirm `npm run build` succeeds with 0 errors and all E2E test suites pass (`npx tsx tests/e2e/seo.test.ts --feature=F9; npx tsx tests/e2e/seo.test.ts --feature=F10; npx tsx tests/e2e/seo.test.ts`).
2. Write your handoff report with verdict (CLEAN or INTEGRITY VIOLATION) in:
   `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\auditor_m3_2\handoff.md`
3. Report back via send_message.

## 2026-10-03T06:13:09Z
You are the Forensic Integrity Auditor for Milestone 3 (auditor_m3_2), replacing auditor_m3_1.
Your working directory is: `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\auditor_m3_2`
Project root is: `C:\Data\Gravity For Ai\Wesbite V2`

Read:
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`
- `C:\Data\Gravity For Ai\Wesbite V2\PROJECT.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m3_1\changes.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\worker_m3_1\handoff.md`
- `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\auditor_m3_2\DISPATCH.md`

Conduct a forensic integrity audit on Milestone 3:
1. Cheating / Hardcoding Detection: Verify genuine RFC 7523 RS256 JWT assertion creation and Google Indexing API logic in `src/app/api/admin/request-indexing/route.ts`. Check that responses are not hardcoded fake strings.
2. Dummy / Facade Detection: Verify that `request-indexing-card.tsx` is an interactive client component and that `page.tsx` renders it properly.
3. Code Integrity: Verify zero unauthorized changes to existing admin panel copy or features (`git diff origin/main src/app/admin`).
4. Build & Test Verification:
   Run:
   - `npx tsx tests/e2e/seo.test.ts --feature=F9`
   - `npx tsx tests/e2e/seo.test.ts --feature=F10`
   - `npx tsx tests/e2e/seo.test.ts`
   - `npm run build`
   Note for Windows PowerShell: Avoid multiline inline node scripts with newlines; run standalone scripts or simple one-liners.

Deliver your handoff report with verdict (CLEAN or INTEGRITY VIOLATION) in `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\auditor_m3_2\handoff.md`.
Report back via send_message when complete.
