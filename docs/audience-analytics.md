# Audience analytics

Open /admin/audience with an ADMIN account. Middleware and the server page both check access. The public collector never returns visitor data.

Counts describe consenting browser identifiers, not verified people. Sessions expire after 30 minutes of inactivity and are tracked per tab. Page time counts visible time, sent every 30 seconds and on page exit or visibility changes. Network failures can lose the final interval. Duplicate updates preserve the maximum cumulative duration.

The collector excludes admin and workshop confirmation pages. It strips URL query strings and stores only referring hostnames. Campaign tags describe first-touch session attribution. utm_term is a supplied campaign label; Google organic searches cannot be linked to individual visitors. The report links to aggregate Search Console queries.

IP and approximate city, region and country use Vercel platform headers. Other environments show unavailable. VPNs and shared networks affect accuracy. Bot filtering and per-instance rate limits are best effort. This is not a globally shared rate limiter.

The first-party collector asks for permission and respects DNT/GPC. Measurement settings allows withdrawal for future collection. Existing Google and Meta scripts have separate behavior; this prompt is not a consent manager for those tools. The privacy policy describes this distinction.

Records older than 30 days are deleted on subsequent collection or dashboard access, throttled hourly per instance. No requests means cleanup waits until the next request; this is not a scheduled deletion guarantee.

The additive, idempotent database script is db/audience.sql. Vercel builds apply it with the existing production database configuration before building the site; failure blocks release. Local builds skip the migration because local database configuration is stale. Parameterized Prisma SQL accesses the new table without changing existing models.

Verification: node outreach-tests/audience.cjs and npm run build. Live verification requires a consenting tagged public visit followed by checking the admin report. Historical traffic cannot be backfilled.

## Justdial

Start with a free listing for local website-development enquiries. Use Gravity For AI, the verified phone +917814351011, the real Mansa base and matching website details. Choose available categories matching website design/development and software development. Do not invent offices for other cities.

Suggested description: Gravity For AI is a software and website development company based in Mansa, Punjab. We build business websites, AI voice agents and connected business workflows, and help teams plan private AI infrastructure. Contact us to discuss your requirements and project scope.

Use this website link if tracking parameters are accepted:
https://gravityforai.com/?utm_source=justdial&utm_medium=referral&utm_campaign=local_listing

Measure qualified enquiries, booked calls and won projects over 30–45 days. Consider paid promotion only after reviewing written pricing, renewal/cancellation terms, shared versus exclusive lead delivery and cost per qualified enquiry. No ranking gain is guaranteed. No Justdial account or listing was created in this task.

Sources: https://www.justdial.com/ and https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console
