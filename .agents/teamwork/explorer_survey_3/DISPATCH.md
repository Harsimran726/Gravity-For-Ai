# Dispatch: Explorer Survey 3

## Objective
Investigate the codebase for Technical SEO requirement R6 (Admin Panel Request Indexing tool).
Read `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`.
Examine:
- `src/app/admin/page.tsx` and admin components / styling (#122C57 navy, #C99A44 gold, #F7F5F0 cream)
- `@/lib/auth` (`getAdminSession()`, role checks `session.role === 'ADMIN'`)
- Google Search Console Indexing API (`https://indexing.googleapis.com/v3/urlNotifications:publish`) protocol and JWT / service account requirements using `GOOGLE_SERVICE_ACCOUNT_JSON`
- Graceful handling when `GOOGLE_SERVICE_ACCOUNT_JSON` is missing (display setup instructions)
- API route design for `src/app/api/admin/request-indexing/route.ts`
- Client UI card integration into the admin dashboard

Deliver your report to `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\explorer_survey_3\analysis.md` and write `handoff.md`.

## 2026-10-02T11:26:38Z
You are an Explorer subagent (explorer_survey_3).
Your working directory is: `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\explorer_survey_3`
Project root is: `C:\Data\Gravity For Ai\Wesbite V2`

Read the original request verbatim at:
`C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`
And your dispatch file at:
`C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\explorer_survey_3\DISPATCH.md`

Your mission:
Investigate requirement R6 (Admin Indexing tool):
1. Inspect `src/app/admin/page.tsx` and related admin dashboard components, layout, styling, and color schemes (navy `#122C57`, gold `#C99A44`, cream `#F7F5F0`).
2. Inspect `@/lib/auth` (`getAdminSession()`, role check `session.role === 'ADMIN'`). Check how authentication is verified in route handlers and page components.
3. Investigate Google Search Console Indexing API (`https://indexing.googleapis.com/v3/urlNotifications:publish`):
   - What headers, OAuth2 / service account JWT or googleapis library does it need? (Check package.json to see what packages are installed, e.g. googleapis, or how Google service accounts are authenticated).
   - How `GOOGLE_SERVICE_ACCOUNT_JSON` is formatted and parsed.
   - Design the API route `src/app/api/admin/request-indexing/route.ts` handling errors and missing env var gracefully.
   - Design the UI card to add to `src/app/admin/page.tsx` showing the input, status, or setup instructions if the env var is missing.

IMPORTANT: Do not modify source code. Deliver a comprehensive analysis report to:
`C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\explorer_survey_3\analysis.md`
and write your `handoff.md`.
Report back when finished via send_message.
