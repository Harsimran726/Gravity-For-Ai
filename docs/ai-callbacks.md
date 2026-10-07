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
