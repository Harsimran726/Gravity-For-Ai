# Gravity For AI — Website Design System
### AI consulting & implementation for local and small businesses
### Feel: quiet authority. Premium, elegant, unhurried — the sense that something intelligent has just entered the room.

---

## 0. The Core Idea

Most AI-consulting sites for small businesses either feel intimidating (dense, jargon-heavy, "enterprise") or cheap (template SaaS cards, stock photos of people pointing at laptops). Neither is right for this client.

The design's job is to make a local business owner feel: *this is serious, this is for me, and I am in good hands.* Not hype. Not fear. **Gravity.**

Throughout the site, "Gravity" is not just a name — it's treated as a **presence**. The navy ring and gold sphere from your logo aren't a decorative header graphic; they are staged as an entity that is *in the room* with the visitor — quietly orbiting, always present, subtly reacting as they scroll. Every section should feel like it's being visited by something with weight and intelligence, not just reading text on a page.

This is the signature idea the whole design is built around, so it's spent in exactly one system (the orbit/aura motif below) — not scattered as generic decoration.

---

## 1. Design Tokens

### Color

```
--navy:        #122C57   /* Gravity Navy — primary brand color, structure, headlines */
--navy-deep:   #0A1B3D   /* shadow tone, gradients, dark-section text-on-dark */
--gold:        #C99A44   /* Orbit Gold — the single focal accent, used sparingly */
--gold-bright: #E2B14E   /* highlight edge of gold, gradients only */
--bg:          #FFFFFF   /* primary background — most of the site lives here */
--bg-warm:     #F7F5F0   /* secondary background for alternating sections */
--black:       #0A0A0D   /* Deep Space Black — reserved for hero + closing CTA only */
--slate:       #6B7280   /* secondary text, captions, UI chrome */
--slate-line:  #E4E2DC   /* hairline dividers on light backgrounds */
```

**Rule:** gold never fills a shape larger than ~24px. It marks a single point — a sphere, a dot on a chart, a cursor, one word in a CTA button. If you're using gold for more than one element in a given viewport, remove one.

### Typography

- **Wordmark (locked, do not alter):** the existing logo treatment — light-weight geometric sans, wide tracking. Closest system stack: `"Montserrat", "Century Gothic", sans-serif` at 300 weight, `letter-spacing: 0.25em`.
- **Display / H1–H2:** a modern editorial serif — `"GT Sectra", "Untitled Serif", "Freight Display", Georgia, serif`. Used for headlines only, set tight (line-height 1.05–1.1), never all-caps.
- **Body / UI / Nav:** `"General Sans", "Neue Montreal", "Inter", sans-serif` — same geometric family as the wordmark, so body copy feels related to the logo rather than arbitrary.
- **Numerals / data / process labels:** `"Söhne Mono", "JetBrains Mono", monospace` — used only where a number is functionally data (stats, step counters, pricing), not decoratively.

**Type scale (desktop → mobile):**
| Role | Desktop | Mobile | Notes |
|---|---|---|---|
| Display (H1) | 84px / 1.05 | 44px / 1.1 | serif, `--navy` |
| H2 | 48px / 1.15 | 32px / 1.15 | serif |
| H3 | 28px / 1.3 | 22px / 1.3 | sans, medium weight |
| Body | 18px / 1.6 | 16px / 1.6 | sans, `--slate` or `--navy-deep` |
| Caption / UI | 14px / 1.4 | 13px / 1.4 | sans |

Line length capped at ~72 characters for body copy. No justified text.

### Layout

- **Grid:** 12-column, but content is intentionally **asymmetric** — never perfectly centered card grids. Text blocks sit left of center; the orbit graphic occupies the right or bleeds off-canvas, echoing the logo's own off-center gold sphere.
- **Alignment:** left-aligned body copy throughout (not centered) — center-alignment reads as generic landing-page. Headlines can break this rule once, in the hero, where a centered/off-axis composition mirrors the logo itself.
- **Spacing:** generous — sections use 140–200px of vertical padding on desktop. White space is doing brand work here, not just tidiness.

### Motion Principles

1. **One orchestrated hero moment.** On load, the orbit ring draws itself in (stroke animates from 0 to full), the gold sphere travels along the path and settles at its resting point, then the headline fades up. This happens once, ~1.8s, and is the single biggest "wow" of the site.
2. **The Aura scroll-thread.** A thin navy arc + gold dot lives in a fixed position (e.g. right edge of viewport, or subtly woven behind section transitions) and its rotation is tied to scroll progress — not decorative parallax, but a literal progress-through-the-page indicator styled as the logo's orbit. This is what makes Gravity feel "present in the room" for the whole session, rather than just a header logo.
3. **Section reveals are quiet.** Content fades up 12–16px, 400–500ms, on scroll-into-view — no bounce, no slide-from-side, no staggered card cascades. Restraint here is what separates this from template SaaS motion.
4. **Hover states respond, they don't perform.** Buttons and links shift color/weight on hover; nothing spins, bounces, or glows unless it's communicating a state change (e.g., a form field confirming input).
5. **Respect `prefers-reduced-motion`** — replace all of the above with instant, static states.

---

## 2. What to Avoid (so this doesn't read as a generated template)

- No warm-cream-background + serif + terracotta-accent combo (a very common AI-generated default) — this site is white/navy/gold, not cream/clay.
- No identical rounded "SaaS cards" with the same soft grey drop-shadow on every service.
- No tracked-out ALL-CAPS eyebrow labels above every heading ("OUR SERVICES", "WHY US").
- No numbered badges (01 / 02 / 03) unless the content is a genuine sequence (it is, once — in the Process section).
- No arrow ( → ) appended to every button and link.
- No stock photography of business people shaking hands or pointing at laptops. If photography is used at all, it should be architectural/material (light through blinds, brushed metal, a single object in soft focus) or none at all — let the orbit motif and typography carry the page.

---

## 3. Site Structure & Section-by-Section Direction

Each section below is written as its own "room" Gravity enters — what it says, how the aura shows up in it, and how it moves.

---

### 3.1 Hero — "The Entrance"

**Purpose:** In one breath, tell a small-business owner this is serious, calm, and built for them — not a hype machine.

**Layout (ASCII):**
```
┌────────────────────────────────────────────┐
│                                    (orbit    │
│   Intelligence, applied.           ring +    │
│   Not sold to you —                gold      │
│   built around your business.      sphere,   │
│                                     off-      │
│   [ Start the conversation ]       center,   │
│   Consulting for local & small     bleeding  │
│   businesses ready to move.        off edge) │
└────────────────────────────────────────────┘
```
- Background: `--bg` (white), full-bleed.
- Headline (serif, `--navy`, 84px): a short, confident statement — not a feature list. Avoid "AI-powered" as the first three words; open with the outcome, not the technology.
- Orbit ring + gold sphere animate in per Motion Principle #1, positioned asymmetrically right, partially cropped by the viewport edge — implies scale larger than the frame, like it extends beyond what you can see (subtle "presence" cue).
- One primary CTA button: solid `--navy` fill, white text, gold appears only as a 2px underline on hover — not a gold button (gold stays a rare accent, never a large fill).
- No secondary nav clutter in the hero — logo top-left, a single nav on top-right, nothing else competing.

---

### 3.2 The Recognition — "Naming the Weight"

**Purpose:** Speak directly to the local business owner's actual situation — not generic "AI will transform your business" language, but specific, plainspoken recognition of what it's like to be busy, behind, and unsure where AI even fits.

**Layout:** Left-aligned text column (max 640px wide), right side mostly empty white space with a single thin navy arc fragment (not a full ring — a partial one, as if Gravity is only partly visible, listening).

- Body copy here should read like a person talking, not marketing copy: acknowledge the real friction (time, unclear ROI, fear of doing it wrong, too many tools already) in plain sentences.
- No icons-in-circles list here. Three short paragraphs, generous line-height, is more premium than a three-icon feature row.

---

### 3.3 The Philosophy — "Gravity in the Room" (this is the section that *defines* the brand)

**Purpose:** This is the manifesto section — where "Gravity For AI" is explicitly personified. This is the section the client specifically asked for: make the brand feel like an entity with presence, not a service description.

**Layout:** Full-width, background shifts to `--black` (Deep Space Black) — this is one of only two dark sections on the site (the other is the closing CTA), used deliberately to create a dramatic pause/bookend in an otherwise light site.

- The orbit ring reappears here, larger, slower, centered — this time fully visible and unhurried, rotating almost imperceptibly (one full rotation per ~40 seconds) behind the text.
- Copy here should read as a short, confident statement of identity — write it in first person as the brand speaking, e.g. describing presence, quiet authority, gravity pulling scattered effort toward one clear center — 3–5 short lines, generously spaced, serif, large (48–56px), white/`--bg-warm` text on black.
- This is the one place in the site where the brand is allowed to be a little poetic — everywhere else, plain and direct. One indulgence, spent well, per the "spend your boldness in one place" principle.
- End the section with the gold sphere coming to rest dead-center as the section transitions back to white — a visual "exhale" into the next section.

---

### 3.4 Services — "What Orbits the Center"

**Purpose:** Present the actual consulting services without falling into the generic SaaS-card grid.

**Concept:** Instead of identical cards, lay services out as **satellites at different distances from a central point** — literally using the orbit metaphor as the layout logic, not just decoration. The service most core to the offer sits closest to center and largest; more specialized/add-on services sit further out, smaller.

**Suggested services for a local/small-business AI consultancy** (replace with your real offer list):
- **AI Readiness Audit** — closest to center, the natural starting point.
- **Workflow Automation** — automating the manual, repetitive operational work.
- **Custom AI Tools & Copilots** — bespoke internal tools for their specific business.
- **Team Enablement & Training** — getting the owner's staff actually using it.
- **Ongoing Advisory** — a retained, orbiting relationship rather than a one-off project.

**Layout (ASCII, conceptual):**
```
              Team Enablement
                    ●
   Workflow                    Custom
  Automation      ● GRAVITY ●   Tools
       ●          (center)      ●
                    ●
              Readiness Audit
```
- Each "satellite" label sits near a small navy dot (not a gold one — gold stays reserved for the single center point / hero / CTA moments so it doesn't get diluted into a UI bullet color).
- On scroll into view, satellites settle into position along a very faint traced orbit path (drawn once, subtly) — this is the deliberate, single motion moment for this section, not a hover-per-card effect.
- Each service, on click/expand, opens inline (accordion-style) rather than navigating to a separate templated page — keeps the "orbiting a center" feeling intact instead of scattering into subpages.

---

### 3.5 How It Works — "The Approach" (the one place numbered steps are earned)

**Purpose:** A genuine sequence — this is where numbering/step markers are appropriate, because the content actually is a process.

**Suggested steps:** Discover → Design → Deploy → Sustain (adjust to your real process).

**Layout:** Horizontal on desktop, vertical on mobile — a single thin navy line runs left to right (or top to bottom) as the connecting "orbit path," with the gold sphere traveling along it as the user scrolls, arriving at each step marker as it enters view. This reuses the Aura scroll-thread mechanic functionally rather than introducing a new gimmick.

- Step markers: small navy circles with mono-numeral labels (01, 02, 03, 04) — earned here specifically because it's a real sequence.
- Each step: a short title (serif, H3) + 1–2 sentence plain description of what actually happens and what the business owner experiences, not internal jargon.

---

### 3.6 Proof — "Who's Already in Orbit"

**Purpose:** Local/small business trust signals — testimonials, results, logos of businesses served.

**Layout:** Quiet, restrained — one testimonial at a time (carousel or single static quote), large serif pull-quote on `--bg-warm`, attribution in small caps-free sans below (name, business, town — specificity over generic "Business Owner" builds trust for a local audience).

- If you have real client logos, present them small, monochrome (navy-tinted), evenly spaced — not a busy logo wall.
- Avoid 5-star icon rows and generic review-widget styling — write the proof as short, specific, plainspoken outcomes (what changed, in the client's own words) rather than a rating.

---

### 3.7 Closing CTA — "Enter the Orbit"

**Purpose:** The final, decisive moment — mirrors the hero to bookend the site in the dark/dramatic register.

**Layout:** Full-width `--black` background (second and last use of dark mode), orbit ring + gold sphere centered and large, slowly rotating as in 3.3.

- Short, direct headline — an invitation, not a hard sell (e.g., an honest, plain statement that starting is one conversation away).
- Single form or single CTA button — name, business name, email, one open text field ("What's slowing you down?") — kept minimal, because at this price/trust tier, a long lead-gen form undercuts the premium feel.
- Button: gold-bordered outline on black (this is the one place a gold *border* is allowed at button scale, since it's the site's final and most important action) — text white, no fill, no arrow icon.

---

### 3.8 Footer — "Quiet Exit"

**Purpose:** Get out of the way. Footers are where generic template chrome accumulates — resist that here.

- `--bg` white, `--navy` text, hairline top border (`--slate-line`), generous padding.
- Wordmark (small, locked treatment), a short one-line tagline, essential links (Services, Process, Contact, Privacy), contact email, location/local-market indicator if relevant to your service area.
- No social icon row unless the accounts are actually active and on-brand — an inactive Twitter icon undercuts premium perception faster than almost anything else.

---

## 4. Responsive & Accessibility Baseline

- Fully responsive down to 375px width; orbit graphics scale down and simplify (fewer path details) rather than just shrinking, so they stay crisp at small sizes.
- All interactive elements have a visible keyboard focus state (a 2px `--gold` outline is a good, on-brand choice for focus rings specifically — this is an appropriate functional use of gold outside the "one focal point" rule, since it only appears on keyboard interaction).
- Color contrast: body text on white/`--bg-warm` uses `--navy-deep` (not `--slate`) to meet AA contrast; `--slate` is reserved for captions/secondary text at larger sizes.
- All motion described above is disabled/replaced with static states under `prefers-reduced-motion: reduce`.
- Alt text on all graphics describes function, not just "gold sphere" — e.g., "Gravity For AI logo mark" or "step 2 of 4 indicator."

---

## 5. Summary for Implementation

If you hand this file to a developer or an AI page-builder, the load-bearing instructions are:

1. White-dominant site with two deliberate black "dark rooms" (Philosophy section, Closing CTA) — everything else stays light.
2. Navy (`#122C57`) carries structure and text; gold (`#C99A44`) marks exactly one focal point per screen, never a fill.
3. Serif display type + geometric sans body, matching the logo's existing letter-spacing logic for the wordmark only.
4. The orbit ring + gold sphere is a functional, recurring device (hero entrance, scroll-progress thread, process-step tracker, philosophy section, closing CTA) — not a one-off header graphic.
5. One orchestrated motion moment per section, max. No stacked hover effects, no bouncy card grids, no generic eyebrow labels or arrow-suffixed buttons.
6. Copy throughout is plainspoken and specific to a local/small-business owner — confident, not hype-driven; poetic exactly once (Philosophy section), plain everywhere else.
