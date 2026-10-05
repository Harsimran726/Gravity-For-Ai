# Vercel FCM integration

POST https://gravityforai.com/api/wholesale/notifications with the signed-in user's Firebase ID token.
No arbitrary recipient, message, Firebase project or business can be supplied by the caller.

The updated app writes an immutable _pushRequests event in the same Firestore batch as its order, attendance or issue report. Rules validate the source change with getAfter; clients cannot read recipients or update delivery receipts. Vercel verifies email, revocation and active membership, then sends generic alerts to all active admins and staff. Existing source-data access remains unchanged.

Deploy src/lib/wholesale/dispatcher.mjs and src/app/api/wholesale/notifications/route.ts in the website. Install firebase-admin 14.5.0. Configure production-only sensitive WHOLESALE_FIREBASE_SERVICE_ACCOUNT with a dedicated account for vickyops-gravity-for-ai, roles datastore.user, firebasecloudmessaging.admin, firebaseauth.viewer. Never put credentials in NEXT_PUBLIC variables or APKs. No Firebase billing upgrade required.

The mobile app calls the dispatcher after relevant writes and every minute while its signed-in workspace is running. Failed deliveries remain in Firestore and retry on later requests; if all apps are closed after a send failure, retries wait until another app request. There is no unattended timer/cron configured. Old app versions and direct Firestore-console edits do not create notification events. Install the updated app on every phone.

The dispatcher claims a 90-second lease, processes up to 10 events for at most 45 seconds, and resumes partially delivered events using per-device receipts. Same-batch duplicate events deduplicate. Rare crash-after-send duplicates remain possible. Invalid device tokens are removed only if unchanged. No delivery is guaranteed after users disable notifications or force-stop Android. iOS still requires APNs setup and signed device testing.

Issues are explicitly submitted reports, not automatic crash detection. Full descriptions are readable only by the reporter/admin (Firestore issues collection); push text contains no descriptions. Existing invitation email worker and payment workflow are separate and unchanged; do not run the old listener alongside this dispatcher for the same events.

Activation requires Firestore rules deployment, server credentials, website deployment and an updated APK. A build or unauthenticated 401 check is not proof of physical phone delivery.

