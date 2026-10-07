## Country routing and automatic form requests

New forms show a callback notice instead of a checkbox. Submitting with a phone number requests a callback; a hidden notice version records which form flow was submitted. Country codes are required. US numbers use Twilio-Hars-07e635a2-c64a / +14436455768 / agent v11. Indian numbers retain the Indian connection / +917971442620 / v9. Phone metadata distinguishes US from Canada and other NANP regions. Unsupported or invalid regional numbers are saved for manual follow-up without dialing. Existing cooldown, daily cap, and no-uncertain-retry safeguards remain. Prior submissions are not backfilled.

# Website AI callbacks

New contact and booking submissions create a callback record in the same database write as the lead. New forms display an automatic callback notice; submission with a supported phone number requests the call. Existing leads are not backfilled. Bookings remain saved when Sarvam fails. This does not verify appointment availability or change the existing booking rules.

## Production setup
1. Apply prisma/ai-callback-upgrade.sql transactionally to the existing database (additive; never reset or db push).
2. Set server-only SARVAM_API_KEY in Vercel Production.
3. Optional SARVAM_INITIAL_STATE: use the exact published agent state; omit to use the agent default. SARVAM_WEBHOOK_ORIGIN defaults to https://gravityforai.com.
4. SARVAM_CALLBACKS_ENABLED=true enables new callbacks after redeploy. SARVAM_DAILY_CALL_LIMIT defaults to 20 requests per rolling 24h (maximum 100). One attempt per phone per 24h.
5. Test a consenting owner's phone through a new form submission. Verify the callback and result on /admin/callbacks. A successful build does not prove telephony delivery.

Immediate dispatch is awaited (8-second provider timeout). Optional recovery scheduler: POST /api/callbacks/tick with Authorization: Bearer OUTREACH_CRON_SECRET, every 2 minutes. It only recovers QUEUED requests less than one hour old, at most three per tick. It is separate from the email scheduler. BLOCKED, SKIPPED, UNKNOWN and stale DISPATCHING records are never automatically redialled. Review uncertain attempts in Sarvam first. Disabling the feature prevents future dispatches but cannot cancel accepted calls.

Results webhook /api/callbacks/webhook is passed to Sarvam per call with a unique 256-bit capability token; only its SHA-256 hash is stored. Treat the full webhook URL as secret; do not log or share it. Attempt and metadata correlation are checked; duplicate terminal deliveries are no-ops. This uses the documented instant-outbound payload, not campaign/inbound schemas. The provider does not document a signature header on this endpoint. No audio recordings are downloaded.

Dashboard is ADMIN-only, filters source/status, paginates 25 records and refreshes every 30 seconds. It shows form/booking source, consent, call request and result times, connectivity, disposition, summary, duration and transcript. Connected means a conversation took place, not a qualified lead or a sale. Configure call_summary and call_disposition as output variables in the published Sarvam agent to receive those fields.

Public forms have a honeypot, phone validation, a per-phone cooldown and a shared daily cap. Phone ownership is self-attested, not OTP-verified; for higher traffic, add OTP/CAPTCHA before raising the cap.

References:
- https://docs.sarvam.ai/conversations/api/instant-outbound/create
- https://docs.sarvam.ai/conversations/api/instant-outbound/webhook-payload

## Post-call intent analysis and recap email

Apply prisma/callback-recap-upgrade.sql before deployment. Existing records default to NOT_REQUESTED; they will not be analysed or emailed. New CONNECTED webhooks persist structured transcript turns and queue analysis. Both country routes share this processing. No conversation email is sent for unanswered/failed calls.

Sarvam model endpoint: https://api.sarvam.ai/v1/chat/completions, model sarvam-105b. Uses SARVAM_ANALYSIS_API_KEY, falling back to SARVAM_API_KEY if model access is allowed. Voice-agent and model API permissions can differ. Use the admin connection check with a synthetic transcript to verify access; no live call or email is generated. Two model requests per eligible recap incur provider usage.

Needs and requested next steps cite exact caller utterances. A second model pass checks meaning, negation, privacy and contact permission. This is AI-assisted checking, not a guarantee of truth or a human verification. Unclear, contradictory, missing or unsupported content is held for REVIEW. Intent and evidence stay internal; email contains only checked paraphrases, identifies itself as AI-prepared, and invites correction. Provider summary is retained separately and is not automatically copied into the email. Recaps are in English, based on Sarvam en_text transcript turns.

Mail uses the existing SMTP settings with TLS verification, bounded timeouts and the original form email only. No transcript-supplied email or link controls recipient selection. Per-call reservations prevent duplicate sends during concurrent webhook deliveries. SENT means SMTP accepted, not delivered/read. UNKNOWN and stale SENDING require provider-log review; they are never automatically retried. No historical backfill. Suppressed contact requests do not receive recaps.

The webhook awaits bounded analysis/delivery. Duplicate webhook notifications may recover PENDING work. The optional callback tick also recovers one pending recap; it must be scheduled separately if desired. PROCESSING stuck after two minutes requires inspection; there is no automatic resend or manual resend button. For REVIEW, staff should read the transcript and prepare any necessary follow-up manually.

Source: https://docs.sarvam.ai/api-reference/chat/chat-completions-v1
