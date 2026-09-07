# Phases.md — Gravity For AI Website Build Plan

> Each phase lists: Goal, Deliverables, Exit Criteria. Work should not move to the next phase until exit criteria are met and logged in `memory.md`.

---

## Phase 0 — Discovery & Setup
**Goal:** Lock requirements, gather assets, initialize the project correctly.

**Deliverables:**
- Confirm tech stack decisions (CMS choice, hosting choice) per open items in `product.md`
- Receive and review client's existing content/SEO files
- Set up Next.js 14 (App Router, TypeScript, Tailwind) repository
- Set up PostgreSQL + Prisma schema skeleton (from `architecture.md` ERD)
- Set up CI pipeline (lint, type-check, build)
- Create Vercel project + environment variables (dev/staging/prod)
- Initialize `memory.md` log

**Exit Criteria:**
- Repo builds and deploys a blank Next.js app to a preview URL
- All environment secrets configured and not exposed client-side
- Brand assets (logo, colors, fonts) confirmed or design system starting point agreed

---

## Phase 1 — Design System & Core Layout
**Goal:** Establish the visual language and shared components before building pages.

**Deliverables:**
- Design tokens (colors, spacing, typography scale) in Tailwind config
- Shared components: Header, Footer, Button, Card, Section wrapper, CTA component
- Animation/motion guidelines implemented (Framer Motion setup, reduced-motion handling)
- Responsive grid system verified at mobile/tablet/desktop breakpoints
- 404 and error pages

**Exit Criteria:**
- Component library reviewed and approved (visual QA against `product.md` Section 3)
- Lighthouse baseline run on skeleton layout (performance target sanity check)

---

## Phase 2 — Homepage: 7-Step Framework Build
**Goal:** Build the flagship homepage exactly per the 7-step framework and its architecture diagram.

**Deliverables:**
- Header, Hero, Stakes, Value Proposition, Guide, Plan, Explanatory Section, Pricing, Footer — each as its own component per `architecture.md` Section 2
- Content wired in (real copy, not lorem ipsum) using client-provided content files
- Scroll-triggered animations per section (smoothness requirement)
- Primary CTA wired to contact/booking flow (can stub the backend initially)

**Exit Criteria:**
- Homepage matches the user-flow diagram in `architecture.md` Section 3
- Mobile + desktop responsive pass
- Initial Lighthouse pass ≥ 90 performance on staging

---

## Phase 3 — Service Pages, Pricing, Case Studies, About, Contact
**Goal:** Round out the remaining core public pages, reusing the 7-step components.

**Deliverables:**
- `/services/custom-ai-solutions`, `/services/web-development`, `/services/ai-voice-agents`
- `/pricing` (tiers wired to admin-editable data once Phase 5 lands, static initially)
- `/case-studies` + `/case-studies/[slug]`
- `/about`, `/contact` (full lead capture form with validation, CAPTCHA, rate limiting)
- Legal pages: Privacy Policy, Terms of Service, Careers

**Exit Criteria:**
- Contact form successfully creates a Lead record and sends notification email end-to-end
- All pages pass responsive + accessibility spot-check (keyboard nav, alt text, contrast)

---

## Phase 4 — Blog System + Admin Panel (CMS, Auth, Modules)
**Goal:** Ship the full content management and lead management capability.

**Deliverables:**
- Admin auth (login, session, 2FA, RBAC) per `architecture.md` Section 6
- Blog CRUD with required SEO fields enforced before publish
- AMP twin generation pipeline for blog posts
- Testimonials, Pricing Tiers, Site Settings, Team/Users, Audit Log modules
- Dashboard with lead volume + Core Web Vitals snapshot
- Blog listing/detail pages on public site pulling from CMS data
- Seed initial blog posts from client-provided content files

**Exit Criteria:**
- Full publish flow tested: draft → SEO validation → publish → canonical + AMP live → sitemap updated
- Admin RBAC verified (Editor cannot access Users/Audit Log, Admin can)
- Audit log correctly records create/edit/delete actions

---

## Phase 5 — Integrations & Polish
**Goal:** Connect analytics, monitoring, and finalize micro-interactions.

**Deliverables:**
- GA4 + Search Console + Vercel Analytics wired in
- Sentry error tracking (client + server)
- Uptime + SSL monitoring configured
- Sitemap.xml, robots.txt, rss.xml, llms.txt finalized
- JSON-LD structured data audit across all page types (Organization, LocalBusiness, Article, FAQPage, BreadcrumbList)
- Final animation/motion pass for "smoothness" (no layout shift, GPU-accelerated transitions only)
- Image optimization pass (AVIF/WebP, correct `sizes`, priority flags on LCP elements only)

**Exit Criteria:**
- All structured data validates in Google's Rich Results Test
- No console errors/warnings in production build
- Sentry receiving events correctly in staging test

---

## Phase 6 — Design Verification (Second-to-Last Phase)
**Goal:** Dedicated pass to verify the site matches the design intent and works flawlessly across real-world conditions — no new features built here.

**Deliverables / Checks:**
- Full visual QA against `product.md`/`architecture.md` specs, page by page
- Cross-browser testing (Chrome, Safari, Firefox, Edge) desktop + mobile
- Cross-device testing (iOS Safari, Android Chrome, various viewport widths)
- Accessibility audit (WCAG 2.1 AA): screen reader pass, keyboard-only navigation, color contrast, focus states, `prefers-reduced-motion` respected
- Content proofread pass (copy, links, CTAs all functional, no placeholder text remaining)
- Form testing: contact form, admin login, edge cases (invalid input, empty fields, spam attempts)
- Performance re-verification: Core Web Vitals on real mobile devices/throttled network (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- Design sign-off checklist reviewed and formally approved

**Exit Criteria:**
- Zero critical visual/functional bugs open
- Sign-off recorded in `memory.md` with date and reviewer

---

## Phase 7 — Security, SEO, AMP & GEO Verification + Launch (Final Phase)
**Goal:** Final hardening and verification pass before go-live — nothing ships until every item below is checked off.

### Security Tests
- Penetration-style checklist: SQL injection attempts on all inputs, XSS attempts on form fields and blog content rendering, CSRF token verification on all mutating actions
- Auth testing: brute-force/rate-limit verification on login, session expiry behavior, 2FA bypass attempts
- Admin route access testing: confirm `/admin/*` is unreachable without valid session, confirm `noindex` + robots.txt block in place
- Security headers verified (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) via securityheaders.com or equivalent
- Dependency vulnerability scan (npm audit / Snyk) — zero high/critical unresolved
- Backup + restore drill performed successfully on production database
- Secrets audit: confirm no API keys/secrets present in client bundle

### SEO Verification
- Every page has unique title/meta description, correct canonical tag
- Sitemap.xml submitted to Google Search Console and Bing Webmaster Tools, zero crawl errors
- Structured data validated (Rich Results Test) with zero errors
- robots.txt correctly allows public pages and disallows `/admin/*`
- Internal linking checked (no broken links, no orphan pages)
- 404 handling and redirects verified for any legacy/changed URLs

### AMP Verification
- AMP Validator run against every `/amp/blog/[slug]` page — zero errors
- `amphtml`/`canonical` link pairs verified bidirectionally
- AMP pages spot-checked in Google Search Console AMP report

### GEO Verification (Local + Generative Engine)
- `LocalBusiness` schema NAP data cross-checked against Google Business Profile for consistency
- FAQ blocks present and schema-valid on key service/blog pages
- llms.txt reviewed for accuracy and completeness
- Manual test: query major AI assistants/search engines with relevant prompts (e.g., "AI consulting Mansa Punjab") to confirm the site is discoverable/citable where possible
- Author/E-E-A-T signals present on all blog posts

### Launch
- Final stakeholder sign-off
- DNS cutover / production domain go-live
- Post-launch monitoring window (48–72 hrs) watching Sentry, uptime, Core Web Vitals

**Exit Criteria:**
- All checklist items above signed off and logged in `memory.md`
- Site live on production domain, monitoring active, no open critical issues
