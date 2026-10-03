# Dispatch: Explorer Survey 1

## Objective
Investigate the codebase for Technical SEO requirements R1 (sitemap), R4 (Schema.org), and R5 (robots.ts).
Read `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`.
Examine:
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/app/layout.tsx`
- `prisma/schema.prisma` and `@/lib/prisma`
- Blog post seed data and routing (`/blog`, `/blog/[slug]`, `/amp/blog/[slug]`)
- Total public routes and URL count calculation.


## 2026-10-02T11:26:38Z
You are an Explorer subagent (explorer_survey_1).
Your working directory is: `C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\explorer_survey_1`
Project root is: `C:\Data\Gravity For Ai\Wesbite V2`

Read the original request verbatim at:
`C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\ORIGINAL_REQUEST.md`
And your dispatch file at:
`C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\explorer_survey_1\DISPATCH.md`

Your mission:
Investigate requirements R1, R4, and R5:
1. R1: Inspect `src/app/sitemap.ts`, how it currently generates URLs, what dates it uses. Find seed data for blog posts and examine `prisma/schema.prisma` and `@/lib/prisma`. How are posts queried? What fields exist (id, slug, title, publishedAt, status)? Check AMP blog routes (`/amp/blog/[slug]`). How to merge DB posts with seed posts deduplicating by slug. How to determine approximate first-published date per static page. Check whether URL count will exceed 50.
2. R4: Inspect `src/app/layout.tsx`. Examine the existing `jsonLd` object. Identify exactly how to update `@type` to `["LocalBusiness", "ProfessionalService"]`, add `geo` GeoCoordinates for Mansa, Punjab (29.9975, 75.3983), `hasMap`, and `openingHoursSpecification`.
3. R5: Inspect `src/app/robots.ts`. Identify the deprecated `host:` directive to remove.

IMPORTANT: Do not modify source code. Deliver a comprehensive analysis report to:
`C:\Data\Gravity For Ai\Wesbite V2\.agents\teamwork\explorer_survey_1\analysis.md`
and write your `handoff.md`.
Report back when finished via send_message.
