# Hisab mobile payment integration

## Confirmed plans

| Plan ID | Monthly price | Workers | Clients |
| --- | ---: | ---: | ---: |
| free | Free | 3 | 2 |
| starter | INR 299 | 10 | 5 |
| professional | INR 499 | 25 | 15 |
| business | INR 999 | 50 | 50 |

The server catalogue is `src/lib/hisab/plans.ts`. Provider amounts are paise. Paid plans last one calendar month, clamped to the final day for short months. Same-tier renewals extend access. A different tier is queued after existing paid time; immediate prorated upgrades are not implemented. The response reflects the currently effective tier.

## App contract

All mobile requests require `Authorization: Bearer <Firebase ID token>` and `Content-Type: application/json`. Identity comes from the verified token. Do not embed the Razorpay secret in the app.

1. POST `/api/hisab/account` with `{}` after sign-in and on resume. Creates no dummy workers or clients; existing data is preserved. Free users get 3 workers and 2 clients as limits, not seeded records.
2. GET `/api/payments/orders` returns all plans (amount in paise). POST the same URL with `{"planId":"starter"}` to create a server-owned order. The free tier needs no checkout. Use the returned `orderId`, `amount`, `currency` and `keyId` in Razorpay Checkout. Orders created outside this backend are rejected.
3. POST `https://gravityforai.com/api/payments/verify` after Checkout succeeds:

```json
{
  "userId": "FIREBASE_UID",
  "userEmail": "user@example.com",
  "userPhone": "+919876543210",
  "planId": "starter",
  "amount": 299,
  "currency": "INR",
  "paymentMethod": "RAZORPAY",
  "razorpayPaymentId": "pay_FROM_CHECKOUT",
  "razorpayOrderId": "order_FROM_SERVER",
  "razorpaySignature": "64-character signature from Checkout",
  "upiReference": "",
  "clientTimestamp": 1730737200000,
  "appVersion": "1.0.0",
  "watermark": "Powered by www.gravityforai.com"
}
```

Here amount is rupees, matching the supplied app payload. UID, plan, amount and currency must match the authenticated user and stored order. The server verifies the signature and fetches the captured payment from Razorpay. Extra metadata, client timestamps and UPI references grant no authority. Email/name come from Firebase authentication, not this payload. Snake-case Razorpay callback fields are also supported for compatibility.

Response includes the requested `status`, `message`, `data` wrapper:

```json
{
  "status": "success",
  "message": "Payment verified and subscription synchronized",
  "data": {
    "subscriptionStatus": "active",
    "subscriptionPlan": "starter",
    "validUntil": 1800000000000,
    "maxWorkers": 10,
    "maxClients": 5,
    "transactionId": "txn_gfa_pay_FROM_CHECKOUT"
  }
}
```

The example validUntil is illustrative; actual expiry is calculated server-side and returned as epoch milliseconds. Additional legacy response fields are retained. The transaction ID is stable on retries.

## Firestore and offline behavior

The server merges into `users/{uid}` in the configured named database: `subscriptionStatus`, `subscriptionPlan`, `validUntil`, `subscriptionExpiryEpoch`, `maxWorkers`, `maxClients`, nested `subscription`, identity and update metadata. Timestamp fields are Firestore timestamps, compatible with the Android model. Top-level Firestore plan IDs use `starter_299`, `pro_499`, `business_999`; nested subscription and API responses use canonical `starter`, `professional`, `business`. Both ID forms are accepted on order/verification requests. No workers/clients arrays are created or overwritten. PostgreSQL remains the payment ledger. Firestore writes use the Admin SDK.

**Remove local paid activation based on a Razorpay ID or manually entered UPI reference.** On failure, show verification pending, retain only previously verified access until its expiry, and retry the same payment with backoff. Do not request another charge. Refresh a token on 401; reject mismatched fields/signatures on 400/403/404; retry capture pending on 409; retry service/sync failures on 503. A refunded purchase cannot produce a success response.

The app should read the subscription from the backend/Firestore, never write paid entitlements itself. `validUntil` must be checked even if the cached status says active. On expiry use Free limits. Enforcing worker/client quotas in Firestore writes still requires the app's actual collection structure and rules; merely hiding create buttons does not enforce quotas. Existing records should not be deleted on downgrade.

For the existing `users` collection, merge a rule like the following into the actual ruleset. Preserve unrelated collection rules and audit broad matching allows. Adjust the profile allowlist to real profile fields; never add entitlement fields to it.

```text
match /users/{uid} {
  allow read: if request.auth != null && request.auth.uid == uid;
  allow create: if request.auth != null && request.auth.uid == uid
    && request.resource.data.keys().hasOnly(['name', 'email', 'phone', 'photoURL']);
  allow update: if request.auth != null && request.auth.uid == uid
    && request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['name', 'email', 'phone', 'photoURL']);
  allow delete: if false;
}
```

## Activation

- Apply/reapply `db/hisab.sql` to website PostgreSQL. It adds the order plan/limit snapshots as well as the original tables.
- Set `HISAB_FIREBASE_PROJECT_ID=gen-lang-client-0106868424` and `HISAB_FIREBASE_DATABASE_ID=ai-studio-android-attenden-1f51679d-6149-4e8e-8818-7d441dc1f17b`, as found in the downloaded app source. Supply `HISAB_FIREBASE_SERVICE_ACCOUNT` for that project through server secrets. Do not reuse the wholesale project's credentials. Confirm these exported identifiers before production deployment.
- Set server-only `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`; production requires live credentials.
- Configure automatic capture and `https://gravityforai.com/api/payments/webhook` for `payment.captured`, `order.paid`, `refund.processed`; set the separate `HISAB_RAZORPAY_WEBHOOK_SECRET`. Preserve the workshop webhook.
- Merge/test Firestore rules, deploy, and enable `HISAB_CHECKOUT_ENABLED=true` when ready. `HISAB_PLANS_JSON` is no longer used.
- Connect the AI Studio app to server order creation, token authentication and verification; remove demo seeding and insecure local paid activation.

Any positive refund revokes that purchase. Remaining paid purchases determine access. Failed mirror writes remain pending and are repaired by verification/webhook/account retries. The admin dashboard at `/admin/hisab` shows registered users, active subscriptions, payments, refunds and sync status. Users count covers registrations through this API, not an automatic import of Firebase Auth.

Run `node tests/hisab/payment-check.cjs`: real isolated PostgreSQL, mocked Firebase/Razorpay; covers authentication, tampering, the supplied camelCase payload/response, pricing/ownership rejection, month-end duration, clean onboarding, concurrency, renewals, refunds and mirror recovery. Live checkout, Firebase rules and mobile behavior require the actual project and deployment.
