# Idea to App: Razorpay activation

Razorpay was selected by the owner on 25 October 2026. This supersedes the earlier payment-provider-pending note. Registration uses Razorpay Standard Checkout, server-generated ₹299 orders, server-verified signatures and captured-payment checks, and signed capture/refund webhooks.

## Local preparation

Run `node scripts/workshop-setup.cjs --init` once. It preserves configured values, generates missing access/webhook secrets, and prepares placeholders in ignored `.env.local`. It never prints secret values. Run without `--init` to see configuration status.

In `.env.local`, enter a matching Razorpay **test** key ID and key secret directly from the account dashboard. Never paste the secret into chat or source control. Keep `WORKSHOP_CHECKOUT_ENABLED=false` until configuration is complete. Use `WORKSHOP_SITE_ORIGIN=http://localhost:3100` locally.

## Razorpay dashboard

1. Configure automatic capture for the workshop payment integration.
2. Add the webhook URL `https://gravityforai.com/api/workshop/webhook` after this code is deployed.
3. Use the same webhook signing secret in Razorpay and `RAZORPAY_WEBHOOK_SECRET`. Local and live environments should have separate secrets and matching keys.
4. Subscribe to `payment.captured` and `refund.processed`.

For local provider webhooks, use a deliberately configured HTTPS tunnel or a deployed test preview with its own secrets. This setup does not open a tunnel automatically.

## Test before collecting money

- Complete a test payment and verify the paid enrolment, private confirmation page and actual confirmation-email delivery.
- Test modal cancellation, failed payment, captured payment with the browser closed, invalid signature and webhook, repeat delivery, email failure/retry and refund.
- Confirm your Zoom joining instructions and refund support process are ready.
- Existing mocked security tests: `node tests/workshop/payment-check.cjs`.
- Provider tests and go-live requirements: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/

## Production

Configure the matching live key pair, live webhook secret, a production access secret, `WORKSHOP_SITE_ORIGIN=https://gravityforai.com`, the WhatsApp group and demo video if available, plus the existing database and SMTP settings. Keep secrets server-only. Apply the existing additive workshop schema if the deployment uses a different database from the locally configured one.

After test-mode verification, perform the controlled live purchase/refund check and then enable collection with `WORKSHOP_CHECKOUT_ENABLED=true`. Do not call the integration live or payment-verified based only on mock tests. Refund guarantees are fulfilled manually through Razorpay after requests to the support email.

## Local test integration completed on 25 October 2026
Installed the Razorpay Node SDK and reused the existing Next.js route instead of creating duplicate order/verify handlers. Configured the supplied test key pair only in ignored .env.local. Generated local access/webhook secrets remain server-only. WORKSHOP_CHECKOUT_ENABLED=true is local test mode, not live production activation. The checkout shows an explicit test-mode notice.
API contracts: POST /api/workshop with action=reserve, action=order (validated learner details and signed bookingWindow) or action=verify (razorpay_order_id, razorpay_payment_id, razorpay_signature). Orders return order_id, amount=29900, currency=INR, public key ID and session expiry. The workshop amount is fixed; inputs below 100 paise or different from ₹299 are rejected. SDK authentication errors map to 401, provider failures to 500, missing/invalid signature to 400. A valid signature without capture returns 202 pending, never paid.
Verified: final production build; mocked SDK, signature, capture, refund and booking-window tests; actual Razorpay test order creation (HTTP 200, 29900 paise INR); provider modal displayed ₹299 and Test Mode; actual modal cancellation showed the expected message. The database record remained pending, with no payment ID or confirmation email. That one unpaid dummy enrolment was deleted with an exact order/name/pending predicate; the provider's unpaid test order may remain in the test dashboard. No successful charge or email was performed.
HTTP checks passed for amount/currency, malformed JSON, missing/invalid signatures and unsigned webhook. The rendered page and 16 client JavaScript chunks were checked for the private key secret; none contained it. Both .env and .env.local are ignored.
Manual checks still required: successful test payment through capture → private confirmation → actual email, signed webhook delivery/recovery, refund, and live-account activation. Use the Razorpay dashboard to configure the matching webhook secret and automatic capture. No production deployment was made. Run node scripts/workshop-verify.cjs while the local test server is running for the safe HTTP checks.

## 25 October 2026: first-visit offer and mentor update
This supersedes the earlier fixed-price and restartable checkout-window descriptions. The signed HttpOnly first-visit cookie starts automatically on page entry. The offer is INR 299 for 20 minutes, then INR 999; refreshing or returning in the same browser does not renew it. Clearing browser data or using another browser creates a new anonymous visit. The backend calculates the price, persists amount/currency per enrolment, and requires acknowledgement if the displayed price changed before order creation. An opened checkout retains its quoted order amount. Payment verification checks the stored order amount, and confirmation/email show the fee actually paid. The guarantee covers the full fee paid at either price.
Added the actual LinkedIn profile photo and concise mentor card with owner-provided two years of AI engineering experience, pursuing MSc in AI at Christ University, Bangalore, and public project/article links.
Validation: production build and mocked payment/security tests pass. Safe HTTP checks pass for automatic offer creation, persistent deadline, expired-cookie INR 999 server-rendering and stale-price HTTP 409. Browser confirms photo loaded, countdown ticks and persists on reload, and mentor/guarantee render correctly. No successful provider payment or email was performed. Current matching test credentials return HTTP 401; owner will fix credentials later. Earlier successful test-order evidence does not verify the current credentials. No production deployment performed.
