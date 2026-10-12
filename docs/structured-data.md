# Gravity For AI structured data

Every public page template emits one server-rendered JSON-LD `@graph` through `PageSchema` or `buildBlogGraph`. Admin routes and fictional design previews intentionally omit business/article markup. The campaign landing page keeps its existing noindex setting.

- Shared Organization, founder Person, WebSite and stable entity IDs.
- WebPage, AboutPage, ContactPage or CollectionPage with canonical URL and breadcrumbs.
- Service nodes on service and campaign pages; regional coverage is not a claim of a physical office.
- BlogPosting on published database and seed articles, actual author profiles, publication/modification dates, publisher and real configured images. Missing fallback images are omitted.
- FAQPage only for Q&A displayed in the corresponding page. AMP excludes FAQ data it does not display.
- No placeholder reviews, aggregate ratings, fabricated hours or exact office coordinates. Personal social profiles belong to the founder, not the company.

## Publishing a blog
Set its title, description, canonical URL, publication date, real cover/OG image and author. Authors can add their LinkedIn/GitHub profile. Add FAQ entries only when the answers are part of the page. The graph is generated automatically; do not paste another full JSON-LD document into article text. Private author fields are never serialized.

## Verification
Run `node outreach-tests/structured-data.cjs`, the source TypeScript check, and the Next.js production build. After deployment inspect source for `application/ld+json`, test representative URLs at https://validator.schema.org/ and https://search.google.com/test/rich-results then request reindexing through Search Console. Valid schema helps machines interpret content; it does not guarantee rich results, rankings or AI citations.

When adding a new public page, include PageSchema with its canonical path and actual metadata. Add only page-specific nodes supported by visible content. The coverage test flags missing public templates.
