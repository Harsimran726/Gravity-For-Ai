# Architecture.md — Gravity For AI (Diagrams, Flows, Journeys)

> Diagrams use Mermaid syntax — render in any Mermaid-compatible viewer (GitHub, Notion, VS Code extension, or the Mermaid Live Editor).

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph Client["Client (Browser / Mobile)"]
        Visitor[Visitor]
        AdminUser[Admin/Editor]
    end

    subgraph Edge["Edge / CDN (Vercel Edge Network)"]
        Middleware[Middleware: Auth Check, Locale, Security Headers]
        Cache[Edge Cache / ISR Cache]
    end

    subgraph NextApp["Next.js 14 App (App Router)"]
        PublicPages[Public Pages: Home, Services, Blog, Pricing]
        AmpPages[AMP Blog Routes]
        AdminPanel["/admin/* Protected Routes"]
        ServerActions[Server Actions: Forms, Mutations]
        APIRoutes["/api/* Route Handlers (webhooks, revalidate)"]
    end

    subgraph Data["Data Layer"]
        DB[(PostgreSQL via Prisma)]
        Media[(Media Storage: S3/Cloudinary)]
    end

    subgraph ThirdParty["Third-Party Services"]
        Email[Resend/SendGrid - Notifications]
        Analytics[GA4 + Search Console]
        ErrorTrack[Sentry]
        CAPTCHA[Cloudflare Turnstile]
        CRM[Optional CRM Webhook]
    end

    Visitor --> Middleware
    AdminUser --> Middleware
    Middleware --> Cache
    Cache --> PublicPages
    Cache --> AmpPages
    Middleware -->|Session Verified| AdminPanel

    PublicPages --> ServerActions
    AdminPanel --> ServerActions
    ServerActions --> DB
    ServerActions --> Media
    ServerActions --> Email
    ServerActions --> CRM
    ServerActions --> CAPTCHA

    APIRoutes --> DB
    APIRoutes --> Cache

    PublicPages --> Analytics
    NextApp --> ErrorTrack
```

---

## 2. Homepage — 7-Step Framework Component Diagram

```mermaid
flowchart TD
    Header[1. Header: Logo + Nav + CTA] --> Hero[2. Hero: Headline + Subhead + Primary CTA]
    Hero --> Stakes[3. Stakes: Problem Icons + Pain Points]
    Stakes --> ValueProp[4. Value Proposition: Guide Intro + 3 Pillars]
    ValueProp --> Guide[5. Guide: Logos + Testimonials + Stats]
    Guide --> Plan[6. Plan: 3-Step Process]
    Plan --> Explainer[7. Explanatory Section: How It Works]
    Explainer --> Pricing[8. Pricing Tiers / Custom Quote CTA]
    Pricing --> Footer[9. Footer: Links + NAP + Legal]

    Hero -.CTA click.-> ContactFlow((Contact / Book Audit Flow))
    Plan -.CTA click.-> ContactFlow
    Pricing -.CTA click.-> ContactFlow
```

Each numbered block = one reusable React component (`<Header/>`, `<Hero/>`, `<Stakes/>`, `<ValueProposition/>`, `<GuideSection/>`, `<Plan/>`, `<Explainer/>`, `<Pricing/>`, `<Footer/>`), composed identically on service landing pages with content swapped via props/CMS data.

---

## 3. Visitor User Flow (Marketing Site → Lead)

```mermaid
flowchart LR
    A[Land on Site] --> B{Entry Point}
    B -->|Organic Search| C[Blog Post or Service Page]
    B -->|Direct/Referral| D[Homepage]
    B -->|AI Answer Engine Citation| C

    D --> E[Scroll Through 7-Step Framework]
    C --> F[Read Content + Internal Links]

    E --> G{Convinced?}
    F --> G

    G -->|Yes| H[Click Primary CTA: Book an AI Audit]
    G -->|Needs more info| I[Visit Pricing / Case Studies]
    I --> G

    H --> J[Contact/Booking Page]
    J --> K[Fill Form: Name, Business, Need]
    K --> L[CAPTCHA + Validation]
    L --> M[Server Action: Save Lead + Notify Team]
    M --> N[Confirmation Screen + Email]
    N --> O[Team Follow-Up within Admin Panel]
```

---

## 4. Lead-to-Client Journey Map

```mermaid
journey
    title Visitor to Client Journey
    section Discovery
      Finds site via Google/AI search: 3: Visitor
      Reads blog post solving their problem: 4: Visitor
      Clicks through to homepage: 4: Visitor
    section Evaluation
      Understands offer via Hero + Stakes: 5: Visitor
      Sees proof in Guide section (testimonials/stats): 5: Visitor
      Reviews 3-step Plan: 5: Visitor
      Checks Pricing tiers: 3: Visitor
    section Conversion
      Clicks Book an AI Audit CTA: 5: Visitor
      Fills contact form: 4: Visitor
      Receives confirmation email: 5: Visitor
    section Engagement
      Team reviews lead in Admin Panel: 5: Team
      Discovery call scheduled and held: 5: Team, Client
      Automation pipeline scoped and built: 4: Team
    section Retention
      Client reclaims hours weekly: 5: Client
      Client gives testimonial / case study: 5: Client
      Referral or repeat engagement: 5: Client
```

---

## 5. Blog Content Flow (SEO + AMP + GEO)

```mermaid
flowchart TB
    Draft[Editor Drafts Post in Admin CMS] --> SEOFields{Required SEO Fields Filled?}
    SEOFields -->|No| Block[Block Publish, Show Missing Fields]
    SEOFields -->|Yes| Schema[Generate JSON-LD: Article + FAQPage + Breadcrumb]
    Schema --> Publish[Publish: Set Status = Live]
    Publish --> Canonical[Render Canonical Page /blog/slug]
    Publish --> AMPGen[Generate AMP Twin /amp/blog/slug]
    AMPGen --> AMPValidate{AMP Valid?}
    AMPValidate -->|No| FixAMP[Flag for Fix in CI]
    AMPValidate -->|Yes| LinkPair[Link canonical <-> amphtml tags]
    Canonical --> Sitemap[Regenerate sitemap.xml]
    LinkPair --> Sitemap
    Sitemap --> Ping[Ping Search Console / Submit Sitemap]
    Canonical --> Revalidate[ISR Revalidate / Edge Cache Purge]
    Publish --> LLMSTxt[Update llms.txt index if applicable]
```

---

## 6. Admin Panel — Auth & Content Management Flow

```mermaid
flowchart TD
    Login[Admin Login Page] --> Creds[Enter Credentials]
    Creds --> Verify{Valid?}
    Verify -->|No| Fail[Show Error + Rate Limit Counter]
    Verify -->|Yes| TwoFA{2FA Required?}
    TwoFA -->|Yes| TOTP[Enter TOTP Code]
    TwoFA -->|No| Session
    TOTP --> TOTPCheck{Valid Code?}
    TOTPCheck -->|No| Fail
    TOTPCheck -->|Yes| Session[Create Signed Session/JWT]
    Session --> RoleCheck{Role}
    RoleCheck -->|Admin| FullAccess[Full Access: All Modules + Audit Log]
    RoleCheck -->|Editor| ContentAccess[Content Modules Only: Blog, Testimonials]
    RoleCheck -->|Viewer| ReadOnly[Dashboard Read-Only]

    FullAccess --> Action[Perform Action: Create/Edit/Delete]
    ContentAccess --> Action
    Action --> AuditLog[(Write to Audit Log: who/what/when)]
    Action --> DBWrite[(Persist to PostgreSQL)]
    DBWrite --> Revalidate2[Trigger ISR Revalidation for Affected Pages]
```

---

## 7. Data Model (Entity Overview)

```mermaid
erDiagram
    USER ||--o{ AUDIT_LOG : creates
    USER {
        string id PK
        string email
        string passwordHash
        string role
        boolean twoFAEnabled
    }
    BLOG_POST ||--o{ BLOG_POST_TAG : has
    BLOG_POST {
        string id PK
        string title
        string slug
        string metaDescription
        string canonicalUrl
        string ogImage
        text bodyContent
        string status
        datetime publishedAt
        string authorId FK
    }
    TAG ||--o{ BLOG_POST_TAG : categorizes
    TAG {
        string id PK
        string name
    }
    LEAD {
        string id PK
        string name
        string businessName
        string email
        string phone
        string message
        string status
        datetime createdAt
    }
    TESTIMONIAL {
        string id PK
        string clientName
        string quote
        string logoUrl
        int rating
    }
    PRICING_TIER {
        string id PK
        string name
        string priceLabel
        text featuresList
        boolean isCustom
    }
    AUDIT_LOG {
        string id PK
        string userId FK
        string action
        string entityType
        string entityId
        datetime timestamp
    }
    USER ||--o{ BLOG_POST : authors
```

---

## 8. Deployment Architecture

```mermaid
flowchart LR
    Dev[Local Dev] --> GitRepo[GitHub Repository]
    GitRepo --> CI[CI Pipeline: Lint, Type-check, Test, AMP Validate, Lighthouse CI]
    CI -->|Pass| Preview[Vercel Preview Deployment]
    Preview --> Review[Design + Security + SEO Review]
    Review -->|Approved| Prod[Production Deployment - Vercel Edge]
    Prod --> DBProd[(Production PostgreSQL)]
    Prod --> CDNAssets[(Media CDN)]
    Prod --> Monitor[Sentry + Uptime Monitor]
    CI -->|Fail| Dev
```

---

## 9. Notes for Implementation

- All flows above map directly to the phases defined in `phases.md`.
- Every diagram's components correspond to modules/tables described in `product.md`.
- `memory.md` should log, for each implemented diagram/flow, the date completed, files touched, and any deviation from this architecture (with rationale).
