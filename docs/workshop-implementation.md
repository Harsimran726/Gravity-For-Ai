# Gravity for AI workshop implementation

Prepared for the existing Next.js 14 website. Installed in the website repository on 24 October 2026. The workshop has dedicated navigation; shared layout components hide the normal site header/footer on workshop routes. CSP permits the Razorpay checkout script and frames. Checkout stays disabled unless enabled and all required payment settings are present. This guide does not confirm deployment or live payment readiness.

## Routes
- /workshop: conversion landing page, direct Razorpay checkout (no WhatsApp sales conversation).
- /workshop/confirmed: private booking confirmation; token stays in the URL fragment and is sent only to the status API.
- POST /api/workshop: creates orders, verifies checkout, reports authorised booking status.
- POST /api/workshop/webhook: signed provider events for recovery when the customer closes the browser.
- GET /api/workshop/enrolments: ADMIN-only paid learner report; includes group consent and confirmation delivery status.

## Activation
1. Review dates (31 Oct / 1 Nov 2026, 7–9 PM IST), refund cutoff and published promises in workshop-config.ts and page.tsx. Publish approved tool requirements before class. Set real joining instructions.
2. Run db/workshop.sql against the existing PostgreSQL database using its normal migration process. It creates a separate additive table; no Prisma model regeneration is needed.
3. Existing dependencies pg, zod and nodemailer are reused. Merge .env.workshop.example into your environment; keep real keys server-only. Create a random WORKSHOP_ACCESS_SECRET with at least 32 bytes. Keep DATABASE_URL configured.
4. Confirm existing SMTP works through dispatchEmail. Email failure leaves payment paid and returns a retryable error; signed webhook retries can send the confirmation later. Rare send-success/database-failure cases can duplicate an email; never duplicate a paid booking.
5. Configure Razorpay automatic capture. Webhook URL: https://gravityforai.com/api/workshop/webhook. Subscribe to payment.captured and refund.processed. Use a separate webhook signing secret.
6. Test in Razorpay test mode: successful payment, close modal, failed payment, pending authorisation, tampered signatures, wrong amount/order, duplicate webhook, email failure/retry and refund. Never fulfil on authorised-only payment.
7. Set the WhatsApp group invitation URL. Enable group admin approval. Invite consenting confirmed learners using the private confirmation page. Match each request against the ADMIN report. The website does not automatically add people to WhatsApp or send messages; group messages are managed manually.
8. Add an approved demo MP4 URL to WORKSHOP_DEMO_VIDEO_URL. The page has a designed project preview until the video exists. The preview is explicitly illustrative, not a live app or client result.
9. Add genuine permissioned testimonials to workshopTestimonials in workshop-config.ts. Each needs quote, name, client/student context and source URL. Initial sample testimonial text from the existing admin page was not republished because its provenance is unverified. The section is hidden until approved quotes are supplied. Do not label client feedback as workshop learner results.
10. Run TypeScript and the production build in the actual project. Configure deployment edge rate limiting on the order endpoint to prevent cross-email order spam. The included database rate limit covers repeat attempts per email only. Add a provider anti-bot challenge if needed.
11. Switch to live keys, make and refund one controlled live purchase, confirm email and settlement settings, then enable WORKSHOP_CHECKOUT_ENABLED=true. Until activated, booking is unavailable rather than simulating payment.

## Before ads
- Support email and refunds operational; payment onboarding activated; video recorded.
- Required software/tool cost disclosed; add verified proof screenshots or walkthrough with permission.
- Test at 390px width, keyboard navigation, checkout loading/failure and the WhatsApp opt-in.
- Set /workshop as campaign destination with utm_source, utm_campaign and utm_content. Attribution is stored with the order.
- Paid workshop bookings and upgrades must be reconciled separately. The advanced programme is described but its payment/delivery flow is not implemented in this first workshop route.
- Paid report shows initial payment status updated by captured/refund webhooks. Ensure webhook monitoring and manual reconciliation for disputes/partial refunds; any processed refund disables access conservatively.
- Do not add meeting/group URLs to public analytics events. No purchase event fires merely from visiting a confirmation page.

## Daily group learning sequence (drafts for manual posting)
Day of joining — Builder Passport: ask for first name, the business they want to build for and one outcome. Share setup checklist. Do not request sensitive business details.
Monday — Spot the friction: “Which task should your app make easier? Describe it in one sentence.”
Tuesday — Prompt makeover: share a vague prompt and ask learners to improve its user, task and constraints.
Wednesday — Choose your app: tutor, salon or consultant. Invite a one-line idea, not a feature wishlist.
Thursday — Find the bug: show a safe dummy form and ask which input validation is missing.
Friday — Ready-to-build check: accounts ready, laptop charged, meeting invitation received. Use a simple checklist response.
Saturday — Before: share joining instructions. After: ask for a screenshot of the interface with private information removed.
Sunday — Before: recall yesterday’s milestone. After: celebrate published links, request honest feedback and share the optional full programme syllabus with its real schedule.
After completion — Share recording expiry, resources and a final optional upgrade reminder. Avoid repeated pressure or invented scarcity. Group participants can leave anytime.

## Verification completed in this session
- Strict TypeScript check passed for the added source files against the existing Next.js/React/pg/zod dependencies. Existing mail and auth interfaces are represented by test-only declarations; this is not a full project build.
- Mocked payment tests passed: wrong amount/currency, authorised-only and refunded payments do not fulfil; order mismatch is rejected; malformed signatures are rejected; duplicate confirmations are deduplicated in the normal path; invalid access tokens fail; pending bookings cannot obtain a group invitation.
- Static SSR layout preview served successfully. Browser preview failed to attach, so visual desktop/mobile verification remains outstanding.
- No database migration, real payment, email delivery, deployment or edit to the original C:\Data project occurred.

## Video recording brief
Record a 35–45 second project walkthrough: show the app on mobile width, submit a dummy enquiry, show it in storage, then show the AI prompt used to build one part. End with the accurate offer card: ₹299 total, both live sessions, 31 Oct + 1 Nov, 7–9 PM IST, laptop required. Use only dummy names and contact details. Add the MP4 URL in WORKSHOP_DEMO_VIDEO_URL once ready.

## 25 October revision
The landing page now advertises live Zoom sessions and the owner's build-it-or-refund promise. Honour full ₹299 refund requests when a learner cannot build the workshop project; the guarantee is separate from the pre-event cancellation cutoff. Requests go to contact@gravityforai.com and are fulfilled manually through the payment provider. Supply Zoom joining instructions in the confirmation communications before opening registration.
Booking uses a server-signed 20-minute session, obtained with action=reserve. The order request must include bookingWindow={expiresAt,signature}. Client state persists across refresh/tabs; expired sessions require an explicit restart. Razorpay receives the remaining duration as its Checkout timeout. Payment verification and capture recovery still honour real payments even when a UI session has elapsed. This is a checkout window, not a fabricated price deadline. See provider timeout documentation: https://github.com/razorpay/markdown-docs/blob/master/payments/payment-gateway/web-integration/standard/integration-steps.md
The crossed-out ₹999 reference price is owner-supplied; validate it before advertising as an actual former selling price. Checkout still requires the configured payment credentials and activation. No live payment or refund was tested in this revision.

## Payment choice pending — 25 October 2026
Owner will choose the payment method later. Do not enable payment collection or assume Razorpay is the final provider. Existing Razorpay code remains inactive scaffolding until that decision. The registration UI shows details → payment → confirmed booking, and booking confirmation still requires verified payment. Guarantee wording is now explicit: if a learner cannot build the workshop app in two days, refund the full ₹299. The guarantee is highlighted near the hero CTA, in the guarantee section, FAQ, checkout and policy. Honour requests through the chosen provider once live.
