# Production payment setup

The existing Next.js workshop API supports Razorpay live keys without code changes. Add the following to the existing Gravity For AI Vercel project under Settings > Environment Variables, targeting Production. Keep secrets unprefixed; no NEXT_PUBLIC secret or key setting is needed. The order endpoint sends only the public key ID to checkout.

| Variable | Value |
| --- | --- |
| RAZORPAY_KEY_ID | Your matching `rzp_live_...` key ID |
| RAZORPAY_KEY_SECRET | Matching live secret, stored as a secret |
| RAZORPAY_WEBHOOK_SECRET | A separate random webhook secret, also entered in Razorpay |
| WORKSHOP_ACCESS_SECRET | A random secret of at least 32 characters, kept stable across deployments |
| WORKSHOP_SITE_ORIGIN | `https://gravityforai.com` |
| WORKSHOP_CHECKOUT_ENABLED | `true` to open checkout; `false` to close collection |
| DATABASE_URL | Existing production PostgreSQL connection |

Retain the existing working mail configuration for confirmation emails. Apply `db/workshop.sql` to the production database if it is different from the locally configured database; the migration adds the enrolment table and amount/currency columns. Do not replace existing database or mail credentials.

Production deployments (`VERCEL_ENV=production`, supplied by Vercel) reject test keys and non-HTTPS workshop origins. Local and Preview environments may use their own test keys. A key prefix validates mode only: it does not prove account activation or a matching secret. Missing configuration disables the pay button. Updating environment variables requires a new deployment.

## Razorpay live dashboard

1. Complete Razorpay account activation and generate a matching live key pair.
2. Enable automatic payment capture.
3. Add `https://gravityforai.com/api/workshop/webhook` in Live Mode, with the same separate secret as `RAZORPAY_WEBHOOK_SECRET`.
4. Subscribe to `payment.captured` and `refund.processed`.

An order and checkout use the server-calculated INR 299 first-visit offer or INR 999 regular price. Expiry does not reset on refresh in the same browser. A price change before order creation asks the learner to review it. Checkout uses the quoted deadline. Payment signatures and captured amount/currency are verified on the server before booking confirmation. Refund webhooks update booking status; issuing a guarantee refund remains a manual action in Razorpay.

## Release verification

Deploy the current local source, including all workshop routes, assets and the additive database migration. A deployment from the unchanged remote repository will not include the local workshop work. Hosting authorization is still required if Vercel returns 403.

Before advertising, complete a successful test payment with test credentials in Preview and verify database status, private confirmation, real confirmation email, signed webhook recovery and refund handling. Then perform an owner-controlled live payment/refund check after deploying with live credentials. Do not treat a build or mock test as a successful real payment.

Current status: production guards and checkout code implemented; live credentials, deployment and real payment/email verification remain pending. No live charge was made.

Reference: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
