# AI workshop installation verification

Verified on 24 October 2026 in `C:\Data\Gravity For Ai\Wesbite V2`.

## Implemented

- `/workshop`: responsive ₹299 workshop page, 31 October and 1 November 2026, 7–9 PM IST; outcomes, curriculum, toolkit, instructor, project preview, policies and secure checkout form.
- `/workshop/confirmed`: private status and starter resources; opted-in paid learners can receive the configured group link. Analytics are disabled here.
- `/api/workshop`: order creation, server-side signature/payment verification and token-authorized status.
- `/api/workshop/webhook`: signed capture/refund recovery.
- `/admin/workshop`: admin-only registration screen; navigation item, learner counts, group opt-in and confirmation-email status.
- `/api/workshop/enrolments`: admin-only paid registration JSON report.
- Additive PostgreSQL table and index applied successfully to the configured database; required columns verified. No existing application tables changed and no test learner created.
- Site CSP updated for Razorpay checkout script/frame. Verification follows Razorpay's server-side signature and capture checks: https://github.com/razorpay/markdown-docs/blob/master/payments/payment-gateway/quick-integration/integration-steps.md

## Checks passed

- Final `npm run build`: production build, lint and application type checks passed; 67 static pages generated, workshop and admin routes included.
- `node tests/workshop/payment-check.cjs`: mocked amount/currency/capture/refund gates, order binding, signature rejection, deduplicated confirmation email, token access, paid-only group invitation, disabled orders and origin rejection.
- HTTP checks against the actual local production server: landing/confirmation 200; inactive order 503; foreign origin 403; invalid webhook 400; anonymous paid report 403; anonymous admin page redirects to login. Razorpay CSP present.
- Browser inspected at 1440×1000 and 390×844. Mobile document width equals viewport width, one H1, registration anchor works, disabled checkout does not load Razorpay.
- Invalid private confirmation link gives a useful recovery message, with no paid content.
- `git diff --check` passed.

## Activation still required

- Local environment has DATABASE_URL but no Razorpay key ID, key secret, webhook secret, workshop access secret, demo video URL or WhatsApp group URL. Secrets were checked for presence only.
- Configure payment credentials and a random access secret of at least 32 bytes in the deployment environment. Set the workshop origin and group invitation. Add your video and genuine approved testimonial entries.
- Configure automatic capture and signed `payment.captured` / `refund.processed` webhooks. Test provider checkout, payment/email failure recovery, refunds and email delivery before live activation. Add deployment rate limiting for order creation as described in the installation guide.
- Checkout remains unavailable until WORKSHOP_CHECKOUT_ENABLED=true, required settings exist, access secret meets the length check, and registration has not closed.
- No deployment, real charge, refund, confirmation email, group invitation or WhatsApp message was sent. The optional ₹2,499 programme checkout is outside this workshop implementation.

## Existing limitations observed

- Standalone `npx tsc --noEmit` reports existing typing errors in `tests/e2e/seo.test.ts`; no workshop source errors appeared. Next's production build passes its application checks.
- Existing GTM configuration tries to load a Meta CAPI helper from S3 which the site's existing CSP blocks. Existing Meta image-preload warnings also appear. These tracking issues were not broadened into this workshop change.
- A rebuild initially hit Prisma's Windows DLL lock while the local server was running. Stopping that server resolved it; the final production build passed.
- Real payment, SMTP, authenticated admin data display and external demo video playback require configuration and end-to-end checks before advertising.

Local preview: http://localhost:3100/workshop

## Visual revision — 24 October 2026
Removed the requested instant-clients sentence; shortened marketing copy; added illustrated outcome cards, build journey, session previews and toolkit icons. Added Sakshi Bansal and Khushdeep Dhiman testimonials supplied by the owner, lightly edited for clarity and labelled as AI course learner feedback. The third testimonial card remains explicitly labelled as a placeholder pending a real quote. Latest production build passed. Browser checks at 1440px and 390px passed; mobile document width is 390px with no horizontal overflow. Two real testimonial names and three cards verified. This supersedes the earlier note that all testimonial entries are missing.

## 25 October 2026 — conversion page rebuild
Implemented a single clear outcome promise, subtitle, date/time/language/Zoom detail strip, owner-requested ₹999 reference beside ₹299, highlighted offer, visual before/after, included resources, two genuine owner-supplied course testimonials, FAQs and final booking section. Added the owner's full ₹299 build-it-or-refund promise consistently across hero, guarantee, checkout, FAQ and policy. Removed the empty third testimonial placeholder.
Added a real signed 20-minute checkout session. Server rejects missing, expired, tampered and overly long reservations. Client state persists through refresh and across tabs; expiration disables checkout until an explicit restart. Existing payment confirmation remains authoritative. Timer does not falsely claim the price expires. Credentials remain absent, so preview clearly says the window starts when registration opens.
Final production build, diff check and payment/reservation tests passed. Browser checks passed at 1440x1000 and 390x844; one H1, correct Zoom details and no mobile overflow. Browser timer fixture stayed 01:30 after reload and expired state disabled checkout. Test fixture removed. Final mobile CTA color is white against navy; booking anchor and FAQ toggles passed. Live payments, provider timeout execution, Zoom delivery and actual guarantee refunds remain untested until activation.

## 25 October 2026: first-visit offer and mentor update
This supersedes the earlier fixed-price and restartable checkout-window descriptions. The signed HttpOnly first-visit cookie starts automatically on page entry. The offer is INR 299 for 20 minutes, then INR 999; refreshing or returning in the same browser does not renew it. Clearing browser data or using another browser creates a new anonymous visit. The backend calculates the price, persists amount/currency per enrolment, and requires acknowledgement if the displayed price changed before order creation. An opened checkout retains its quoted order amount. Payment verification checks the stored order amount, and confirmation/email show the fee actually paid. The guarantee covers the full fee paid at either price.
Added the actual LinkedIn profile photo and concise mentor card with owner-provided two years of AI engineering experience, pursuing MSc in AI at Christ University, Bangalore, and public project/article links.
Validation: production build and mocked payment/security tests pass. Safe HTTP checks pass for automatic offer creation, persistent deadline, expired-cookie INR 999 server-rendering and stale-price HTTP 409. Browser confirms photo loaded, countdown ticks and persists on reload, and mentor/guarantee render correctly. No successful provider payment or email was performed. Current matching test credentials return HTTP 401; owner will fix credentials later. Earlier successful test-order evidence does not verify the current credentials. No production deployment performed.
