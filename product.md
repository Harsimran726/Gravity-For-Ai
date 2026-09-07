# Product.md — Gravity For AI (Website + Admin Panel)

## 1. Product Overview

**Company:** Gravity For AI
**Location:** Mansa, Punjab, India
**Category:** AI Consulting / Agentic AI Services
**Core Offerings:**
- Custom AI Solutions (agentic workflows, automation pipelines)
- Web Development (AI-integrated websites/apps)
- AI Voice Agents

**Website Goal:** Convert local + regional business owners into discovery-call bookings by clearly communicating what Gravity For AI does, proving credibility, and removing friction from the buying decision — while ranking well in traditional search (SEO), being fast/parseable (AMP), and being surfaced correctly by AI answer engines (GEO — Generative Engine Optimization) and local/geo search (Mansa, Punjab and surrounding regions).

**Design Philosophy:** StoryBrand-style 7-part narrative framework applied to every core page (see Section 3), consistent visual system, motion that feels "smooth" (60fps, no jank), mobile-first.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | Server Components by default, streaming, ISR for blog |
| Language | TypeScript (strict mode) | Type safety across API + UI |
| Styling | Tailwind CSS + CSS variables | Design tokens, dark/light ready |
| Animation | Framer Motion / GSAP (scroll-triggered) | Used sparingly — performance-budgeted |
| Content (Blog/CMS) | Headless CMS (Sanity or Payload CMS) OR custom admin + PostgreSQL | Decision logged in architecture.md |
| Database | PostgreSQL (via Prisma ORM) | Leads, blog posts, testimonials, users |
| Auth (Admin) | NextAuth.js / Auth.js with credentials + optional 2FA (TOTP) | Admin panel only — public site has no auth |
| Hosting | Vercel (primary) or self-hosted Node on VPS | Vercel gives edge caching + ISR out of box |
| Media/Images | next/image + Cloudinary or S3-compatible bucket | Auto WebP/AVIF, responsive sizes |
| Forms/Leads | Server Actions → DB + email (Resend/SendGrid) + optional CRM webhook | Spam protection required |
| Analytics | GA4 + Search Console + Vercel Analytics (Core Web Vitals) | Feeds SEO/GEO reporting |
| AMP | next-amp or hand-built `/amp/blog/[slug]` route pair | Only for blog articles, not app pages |
| Monitoring | Sentry (errors) + Uptime monitor | Production reliability |

---

## 3. Public Website — 7-Step Framework (Homepage + reused on Service pages)

Each numbered block below is a **component** in the design system, reusable across the homepage and individual service landing pages (Custom AI Solutions / Web Development / AI Voice Agents).

### 3.1 Header (Navigation)
- Logo (left) → links home
- Center nav (max 4–5 links): Services, Case Studies, Pricing, Blog, About
- Right: Primary CTA button — **"Book an AI Audit"** (sticky, high-contrast)
- Mobile: hamburger → full-screen drawer, CTA remains visible
- Sticky on scroll with subtle shrink/blur backdrop (smoothness detail)

### 3.2 Hero Section (Above the Fold)
- Headline: outcome-driven statement (e.g., "Automate Your Business with Agentic AI — No Guesswork, No Bloat")
- Subheadline: who it's for + how (local Punjab businesses, custom AI + voice agents)
- Primary CTA: "Book an AI Audit" (same as header, reinforced)
- Secondary CTA (optional, ghost button): "See how it works ↓"
- Visual: subtle animated hero graphic (agentic workflow motif, not stock photography) — lazy-loaded, LCP-optimized

### 3.3 The Stakes (Problem)
- 3–4 icon + short-copy blocks: manual work, missed leads, slow response times, competitors moving faster with AI
- Split into "external" pain (lost revenue, wasted hours) vs "internal" pain (stress, falling behind)

### 3.4 The Value Proposition (Solution)
- Guide positioning: "We build the AI systems that give you those hours back"
- 3 pillars matching services: Custom AI Solutions / Web Development / AI Voice Agents — each with 1-line benefit

### 3.5 The Guide (Authority & Empathy)
- Client logos strip (or "Trusted by growing businesses in Punjab" if early-stage)
- Testimonials carousel
- Stats bar (e.g., hours saved, response time reduced, projects delivered)
- Empathy line acknowledging it's a big decision + authority line (founder credentials, AI specialization)

### 3.6 The Plan (3-Step Process)
1. Schedule a Call
2. We Build the Automation Pipeline
3. Reclaim 20+ Hours a Week
- Visual as horizontal/vertical stepper with connecting line animation

### 3.7 Explanatory Section (How It Works — for complex offerings)
- Used mainly on service sub-pages (esp. AI Voice Agents, Custom AI/Agentic systems)
- Plain-language explanation of agentic pipelines, kept benefit-first
- Optional diagram/illustration (not overly technical)

### 3.8 Pricing / Packages
- 3-tier card layout: Starter / Growth / Enterprise (or "Custom")
- Custom/complex work → "Get a custom quote" CTA instead of price, pushing to discovery call
- Feature comparison list per tier

### 3.9 Footer ("Junk Drawer")
- Sitemap-style link columns: Services, Company (About, Careers), Resources (Blog, Case Studies), Legal (Privacy Policy, Terms of Service)
- Address (Mansa, Punjab), phone, email, social links
- Local business schema data reflected here (also injected as JSON-LD, see SEO section)
- Newsletter opt-in (optional)

---

## 4. Site Map (Public Pages)

- `/` — Homepage (full 7-step framework)
- `/services/custom-ai-solutions`
- `/services/web-development`
- `/services/ai-voice-agents`
- `/case-studies` and `/case-studies/[slug]`
- `/pricing`
- `/about`
- `/blog` and `/blog/[slug]` (+ AMP twin `/amp/blog/[slug]`)
- `/blog/category/[category]`
- `/contact` (discovery call booking — Calendly/Cal.com embed or native form)
- `/privacy-policy`, `/terms-of-service`, `/careers`
- `/sitemap.xml`, `/robots.txt`, `/rss.xml`

---

## 5. Admin Panel

### 5.1 Purpose
Internal dashboard for the Gravity For AI team to manage content, leads, and site configuration without touching code.

### 5.2 Core Modules
| Module | Capability |
|---|---|
| **Dashboard** | Lead volume, top blog posts, Core Web Vitals snapshot, recent activity |
| **Blog / CMS** | Create/edit/schedule posts, rich text + code blocks, featured image, SEO fields per post (title, meta description, slug, canonical, OG image), category/tag management, auto AMP preview |
| **Leads / Inquiries** | Table of form submissions (audit requests, contact form), status (New/Contacted/Won/Lost), export CSV, email notification log |
| **Testimonials / Case Studies** | CRUD for testimonials, logos, case study entries used in "The Guide" section |
| **Pricing/Packages** | Edit tier names, prices, feature lists without redeploying |
| **Team/Users** | Admin/editor roles, invite team members, 2FA enforcement |
| **SEO & GEO Settings** | Global meta defaults, JSON-LD (LocalBusiness/Organization) editor, sitemap regeneration trigger, robots.txt editor, GEO/local targeting keywords per page |
| **Site Settings** | Nav links, footer links, contact info, social links, maintenance mode toggle |
| **Audit Log** | Who changed what, when (security requirement) |

### 5.3 Admin UX
- Separate route group `/admin/*`, not indexed (`noindex`, blocked in robots.txt)
- Distinct minimal, fast UI — no marketing chrome
- Dark-mode-friendly dashboard

---

## 6. Security Requirements (Best Practices)

### 6.1 Application Security
- All admin routes protected by authenticated middleware (session check at edge/middleware level, not just page-level)
- Role-based access control (Admin / Editor / Viewer)
- 2FA (TOTP) mandatory for Admin role
- Passwords hashed with argon2id (or bcrypt with sufficient cost factor)
- CSRF protection on all mutating Server Actions/forms
- Input validation + sanitization on every form (Zod schemas server-side, never trust client)
- Rate limiting on: login, contact/audit forms, and any public API route (e.g., Upstash Redis or Vercel Edge Config based limiter)
- Honeypot + optional CAPTCHA (Cloudflare Turnstile) on public forms to stop spam bots
- File upload validation (type, size, virus-scan if user-uploaded media allowed)

### 6.2 Infrastructure Security
- HTTPS everywhere, HSTS enabled
- Security headers: CSP, X-Frame-Options (or frame-ancestors in CSP), X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Environment secrets never in client bundle — audited via build check
- Database access via least-privilege service role, connection pooling (e.g., Prisma + PgBouncer)
- Regular dependency scanning (npm audit / Snyk / Dependabot)
- Automated backups of database (daily, retained 30 days) with restore test in launch phase

### 6.3 Monitoring & Response
- Sentry error tracking on both client and server
- Audit log for all admin actions (create/edit/delete)
- Uptime + SSL expiry monitoring with alerting
- Documented incident response checklist (who to notify, rollback steps)

---

## 7. Performance & "Smoothness"

- Target Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1 on mobile 4G
- Route-level code splitting (App Router default) + dynamic import for below-fold heavy components (carousels, charts)
- Images: next/image with responsive `sizes`, AVIF/WebP, priority flag only on true LCP image
- Fonts: self-hosted via next/font, `font-display: swap`, no layout shift
- Animations: GPU-accelerated (transform/opacity only), respect `prefers-reduced-motion`
- Skeleton/loading states via React Suspense for any data-fetched sections (testimonials, blog list)
- Edge caching / ISR for blog and marketing pages (revalidate on publish via webhook from CMS)

---

## 8. Blog Section — SEO, AMP, GEO

### 8.1 SEO (Traditional Search)
- Per-post metadata: title, meta description, canonical URL, OG/Twitter card image
- Structured data: `Article` / `BlogPosting` JSON-LD, `BreadcrumbList`, `LocalBusiness`/`Organization` sitewide
- Clean semantic HTML (proper heading hierarchy, one H1 per page)
- Auto-generated `sitemap.xml` (including blog posts, updated on publish) and `robots.txt`
- Internal linking suggestions between related posts/services
- Fast, crawlable server-rendered HTML (App Router SSR/ISR — no client-only rendering of primary content)

### 8.2 AMP (Accelerated Mobile Pages)
- Parallel AMP route per blog post: `/amp/blog/[slug]`
- `<link rel="amphtml">` on canonical post, `<link rel="canonical">` on AMP version
- AMP-valid markup only (no custom JS, amp-img/amp-carousel components as needed)
- Validated via AMP Validator in CI before deploy

### 8.3 GEO (Local + Generative Engine Optimization)
Two complementary meanings, both implemented:

**A. Local/Geo SEO (Mansa, Punjab targeting)**
- `LocalBusiness` schema with NAP (Name, Address, Phone) consistency
- Location-aware landing content ("AI Consulting in Mansa, Punjab") on relevant service pages
- Google Business Profile alignment, embedded map on contact page
- Location-specific keywords worked into blog content calendar

**B. Generative Engine Optimization (visibility in AI answer engines — ChatGPT, Perplexity, Google AI Overviews, Claude, etc.)**
- Clear, quotable, factual statements early in each article (answer-first paragraphs)
- FAQ blocks with `FAQPage` JSON-LD on service and blog pages (structured Q&A is highly citable by LLMs)
- Author/expertise signals (author bio, credentials) per post — E-E-A-T
- Consistent, unambiguous entity naming ("Gravity For AI" used identically everywhere, no rebranding drift)
- Content structured with clear headers so LLM crawlers can extract sections cleanly
- llms.txt file at root (emerging standard) describing the site for AI crawlers

### 8.4 Blog Admin/Content Ops
- Every post enforces required SEO fields before publish (validation in admin panel)
- Content calendar reference tied to service focus areas (Custom AI, Web Dev, Voice Agents)
- Author already has "content files including SEO files" — these should be uploaded so the admin CMS schema and initial post seed match the real content structure (see open items below).

---

## 9. Open Items / Inputs Needed From You

1. Please upload the **content files (including the SEO files)** mentioned — this lets us finalize the exact CMS field schema (e.g., what metadata you're already tracking) and seed the first blog posts correctly.
2. Confirm CMS choice: fully custom admin (more control, more build time) vs. headless CMS like Sanity/Payload (faster to ship, less custom).
3. Confirm hosting preference: Vercel (fastest path with Next.js) vs. self-hosted VPS (more control, more security ops overhead).
4. Any existing brand assets (logo, color palette, fonts) or should the design system be created from scratch?
5. Do you want the AI Voice Agent / Custom AI demo embedded anywhere on the site (e.g., a live chat widget), or is this informational-only for now?
