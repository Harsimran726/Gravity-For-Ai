# Gravity For AI — Hostinger outreach integration

Implementation date: 3 October 2026. Mailbox: contact@gravityforai.com.

## What is implemented

Open `/admin/outreach` with an ADMIN account. Campaign reports show SMTP-accepted messages today (IST), before today and in total, first/second follow-ups due, and responding contacts. Trusted-recipient delivery tests have separate totals. Campaign pages show per-recipient dispatch history, reply subjects, preview and manual reply/opt-out/bounce controls.

Upload CSV, TSV, TXT or the first worksheet of an Excel file. An `email` column is sufficient; one email per line also works in text files. Optional columns are `name`, `company`, `subject`, `body`. Duplicates are removed within an upload; malformed addresses are skipped. Files are limited to 5 MB and campaigns to 5,000 records, subject to the hosting platform's request-size limit. Use a simple export, not an analysis workbook with instructions as its first worksheet.

Upload creates a draft, never an active campaign. Review personalized messages and record permission for selected recipients. Hostinger requires solicited recipients; a public business email address is not evidence of permission. Unsupported placeholders become empty text. Email-only greetings use “there”. Messages are plain text, including any imported body; HTML is not rendered.

The server worker sends at most one message per invocation, with at least two minutes between dispatch reservations across all campaigns. First follow-up: four business days after first-message acceptance. Second: five business days after first follow-up acceptance. The clock uses IST for daily totals and weekend calculations. An empty follow-up disables it. The worker does not currently restrict delivery to recipient-local office hours.

Replies, opt-outs and bounces suppress an address across campaigns. Inbox checks run before dispatch and fail closed. Unique recipient/step reservations prevent automated retries of uncertain SMTP outcomes. Accepted means the server accepted the message; it does not prove inbox placement, delivery or a read.

## Activation steps — not yet performed

1. Back up the PostgreSQL database. Test `prisma/outreach-upgrade.sql` against a restored staging database first. The script is an additive upgrade for the existing schema, not a fresh database initializer and not an idempotent script. It adds tables and columns; it does not send messages or erase existing prospects. Run it once in a transaction on the intended database. Keep app traffic stopped during the database/client/code update.
2. After verifying the intended database and backup, apply the SQL using your database administrator tooling, then run `npm run db:generate` in the website project. Do not use `db:push` blindly against production. This project has no existing migration history, so the upgrade is supplied as explicit SQL rather than inventing a migration baseline.
3. Merge the settings in `docs/outreach.env.example` into your local/server environment. Use the actual mailbox password, Hostinger Agentic Mail API token and correct mailbox ID. Configure a full business mailing address and separate random secrets. The existing app also needs DATABASE_URL and a NEXTAUTH_SECRET of at least 32 characters. Secrets stay server-side; do not paste them into chat or commit them.
4. Rotate the database credential previously embedded in `src/lib/prisma.ts`; removing it from source does not revoke the old credential. The hardcoded database fallback and predictable session-secret fallback have been removed. Replacing NEXTAUTH_SECRET logs out existing sessions.
5. Run `node --test outreach-tests/outreach.test.cjs`, `npx tsc --noEmit`, and your normal production build with the configured environment. Tests mock database and mail services and do not send anything.
6. Verify domain SPF/DKIM/DMARC and mailbox settings in Hostinger. Open a draft and use **Check inbox**. Confirm messages really appear through the API. Keep outreach replies in INBOX: folders and spam are not scanned by this version.
7. Arrange a delivery test with a trusted person who expects it, preferably at a different provider. A self-send to the same mailbox cannot validate external delivery. Create a TEST campaign with no follow-ups and one expected recipient, record their permission, then enable OUTREACH_SENDING_ENABLED and activate only that test.
8. Configure an authenticated server scheduler to POST to `https://www.gravityforai.com/api/outreach/tick` every two minutes, with `Authorization: Bearer <OUTREACH_CRON_SECRET>`. This is a POST endpoint; it is not a default Vercel GET cron endpoint. Use your hosting scheduler or an existing always-on process that supports secret headers. Hosting/runtime limits and any scheduler cost must be checked on your plan. Closing the browser does not stop a configured server job.
9. Confirm receipt externally, send a real reply, run the worker/check inbox, and verify the recipient stops. Test unsubscribe with a second expected recipient, verify global suppression, pause an active campaign, and confirm no later steps dispatch. Only then activate a reviewed campaign of solicited recipients.

## Warm-up and delivery

There are no fake replies, mailbox networks or automated spam-folder manipulation. The built-in ramp caps all dispatch attempts at 5/day for calendar days 1–3, 10/day for days 4–7, then 20/day. A lower environment or campaign ceiling takes precedence. This is a conservative operational limit, not a provider limit or an inbox guarantee. The ramp begins at the first dispatch reservation and advances by calendar day, not by successful delivery. Pause when tests fail; do not treat elapsed time as proof of reputation.

## Operating procedure

Review replies in Hostinger webmail; the CRM stores subject and response status, not full reply bodies. Auto-replies stop the sequence for human review. Manually mark replies arriving through other channels. Keep declined contacts suppressed. Multiple campaigns can contain the same address; approval does not deduplicate that address across campaigns, so review overlapping audiences before activation.

If an attempt shows CLAIMED or UNKNOWN, never blindly resend it. CLAIMED may mean a worker crashed; UNKNOWN may mean SMTP accepted mail before the response or database write failed. Check Hostinger logs by Message-ID with an administrator. This release deliberately has no “retry uncertain message” button. Other eligible recipients may continue; pause the campaign or disable sending while investigating. Reconcile verified outcomes through a reviewed database maintenance change, preserving the unique step record.

The inbox scan starts at the earliest recorded acceptance, examines up to 5,000 INBOX messages, and has a bounded time budget. On excessive volume, API failure or an unmatched delivery report, sending stops for that run. Matched delivery reports stop the recipient; unmatched reports need human review before being moved out of INBOX. Long-lived campaigns may require incremental inbox synchronization in a later upgrade. Archiving unread replies before synchronization can prevent their detection.

Existing sends remain in analytics where recipient timestamps exist; legacy records do not receive guessed follow-ups. Pausing cannot recall an email already in flight. SMTP cannot provide a transactional exactly-once guarantee with the database; reservations trade automatic retry for avoiding duplicate sends.

The current implementation has passed TypeScript checks and mocked regression tests. Live PostgreSQL migration, provider authentication, inbox-folder behavior, actual delivery and deployed UI still require the activation checks above. No production migration or sending was performed during implementation.

## References

- [Hostinger Agentic Mail setup](https://www.hostinger.com/support/how-to-use-agentic-mail-in-hostinger/)
- [Hostinger Mail API specification](https://github.com/hostinger/mail-api)
- [Hostinger email sending policy](https://www.hostinger.com/support/1583510-is-mass-mailing-supported-at-hostinger/)
