# Hostinger Sent copies

All website, outreach, team and callback-recap senders use `sendTrackedMail` with the configured Hostinger SMTP mailbox. The same MIME message (including Message-ID and unsubscribe headers) is appended to the IMAP Sent folder after SMTP acceptance.

Apply `prisma/mail-sent-copy.sql` before deploying. Required: existing SMTP_HOST, SMTP_USER, SMTP_PASS, and a stable NEXTAUTH_SECRET / AUTH_SECRET (at least 32 characters; OUTREACH_CRON_SECRET is the fallback). IMAP defaults to imap.hostinger.com:993 and the folder with special-use Sent; IMAP_HOST and IMAP_SENT_FOLDER are optional overrides. Strict TLS is enabled. Do not rotate the encryption secret while copies are pending without preserving the old key.

PREPARED reserves encrypted MIME before sending. UNKNOWN means SMTP outcome is uncertain; do not resend automatically. PENDING/SAVING copies retry through the authenticated outreach scheduler even while campaigns are paused. SAVED clears the encrypted body after IMAP confirms storage. Search by Message-ID prevents duplicate copies after interruption. PREPARED/UNKNOWN require provider-log review; never reset them blindly. Archive failures are independent from recipient delivery.

The admin outreach dashboard shows copy counts and five recent inbox headers without marking mail read, plus links to Hostinger Inbox and Sent. Copy counts start at deployment; historical outreach MIME was not retained and is not fabricated or resent. SMTP acceptance is not proof of inbox placement.

Checks: `node --test outreach-tests/mail-sent-copy.test.cjs outreach-tests/outreach.test.cjs outreach-tests/callback-recap.test.cjs`, TypeScript, and production build. A self-addressed delivery test is required after deployment to verify real IMAP access.
