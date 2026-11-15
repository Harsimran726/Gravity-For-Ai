# Rasen / Sarvam voice-agent testing

Added 15 November 2026. Admin page: `/admin/voice-tests`. This is a read-only evaluation feature. Existing Sarvam callback dispatch, webhooks, recap emails, database schema and public pages are unchanged.

## Setup

1. Configure the entries in `.env.voice-tests.example` in the deployment's server environment or local `.env.local`. Keep existing secrets; do not paste blank example values over them.
2. Create a Rasen workspace API key from Developers → API keys. Set `RASEN_TEST_AGENT_ID` to the dedicated agent used for evaluation.
3. Set the Sarvam organisation, workspace and test app IDs and its server API key. Use a dedicated test app where possible. Selecting the existing app deliberately makes its conversations the baseline; it does not make those conversations a controlled experiment.
4. Set `VOICE_TEST_ANALYTICS_ENABLED=true`, restart the app, sign in as ADMIN and open **Voice Agent Testing** in the sidebar.
5. Place your test calls using the provider consoles, then select a date range and load the results. No calling API is invoked by this feature.

The Rasen reference currently uses `https://api.rasen.ai/v1`; some guides still show `https://api.v2.rasen.ai/v1`. `RASEN_API_BASE` accepts either exact official endpoint. It does not silently switch hosts or forward a key to a redirect. Confirm your workspace's base URL if authentication or connectivity fails.

## What it reads

| Provider | Endpoint | Use |
|---|---|---|
| Rasen | `GET /v1/calls?agent_id=…` | Call state, version, direction, timestamps, dial/end reason and result states |
| Rasen | `GET /v1/calls/{id}` | Verify selected evidence belongs to the configured test agent |
| Rasen | `GET /v1/calls/{id}/transcript` | Paged transcript with explicit readiness state |
| Rasen | `GET /v1/calls/{id}/summary` | Stored provider summary; does not trigger analysis |
| Rasen | `GET /v1/usage?agent_id=…` | Metered quantities by component and unit |
| Sarvam | `GET /api/analytics/v1/{org}/{workspace}/{app}/interactions` | Conversations, duration, language, version, provider mean response time |
| Sarvam | `GET /api/analytics/v1/{org}/{workspace}/{app}/transcripts/{interaction}` | Turn-by-turn transcript |

All calls are made on the server after verifying the current database-backed ADMIN session. Keys are not returned to the browser. Responses use private/no-store headers; user identifiers, contact numbers, agent variables and audio URLs from the list response are discarded. Transcripts may contain personal data and remain restricted to admins.

## Interpretation

- UI date inputs mean full calendar days in Asia/Kolkata. Server requests use a UTC start-inclusive/end-exclusive range, limited to 93 days. Sarvam's inclusive end is adjusted by one millisecond.
- Each provider loads 50 records per request. Load subsequent pages explicitly. CSV exports and comparisons cover **only the rows loaded**, never silently the entire range. The page stops at 2,000 loaded records; narrow the range to inspect more.
- Rasen cursors retain the same filters and page size. Sarvam offsets advance by the returned row count. No provider-supplied next-page URL is fetched; all hosts and endpoint paths remain fixed.
- Rasen lists lifecycle records; Sarvam interactions exclude failed attempts that never became conversations. No shared connection denominator, connection rate or automatic winner is inferred.
- Rasen's integrated call list does not expose comparable speech latency or conversation duration. The UI leaves these unavailable. Creation-to-end time and transcript gaps are not substituted for either metric.
- Sarvam response time is converted from seconds to milliseconds. The aggregate is an **unweighted mean of the available per-call means**, with sample count. It is not a turn-weighted average or a percentile. Missing data stays missing; measured zero remains zero.
- Metered usage is separate from duration and billing. Unknown usage states are preserved. Units are never summed together and corrections may be negative. No currency price or ROI is invented.
- Completed lifecycle, ready summary and successful business outcome are distinct. Pending/failed/unavailable evidence stays explicit.
- Human review scores are stored in component memory only and exported as JSON. They disappear when navigating away or reloading. This is deliberate: no database migration or new storage of customer transcripts is needed for the initial testing workflow.

## Fair evaluation

Use the same business knowledge base, instructions, language, task and test-phone/network conditions. Include English, Hindi, Punjabi, mid-call language switching, interruptions, unclear speech, objections and opt-out requests. Run repeated paired scenarios; record sample size and version changes. Listen to provider recordings before rating naturalness and understanding. Record specific failures and task completion in the notes. Do not extrapolate one call to overall provider superiority.

## Failure behaviour and boundaries

Missing configuration produces a setup message independently for each provider. A provider outage does not hide the other provider's results. HTTP 429 surfaces a bounded Retry-After hint; there are no automatic retries or outbound side effects. Requests have a 12-second timeout and a 2 MB body limit. Redirects are refused. Unexpected payloads return a safe error without logging provider content or credentials. New unknown state strings are retained. Repeated cursors and a transcript result-layer change stop pagination rather than silently merge incompatible results.

This feature does not provide audio playback, extraction/tool-run inspection, Rasen speech latency instrumentation, billing integration, test-call dispatch, persistent human reviews or webhook ingestion. Recordings can be reviewed in the provider console. These are separate extensions, not implied by the analytics page.

## Validation

Run `node --test tests/voice-test-analytics.test.cjs` and `node node_modules/typescript/bin/tsc --noEmit --incremental false`. The tests mock provider traffic; no live API key or telephone call is needed. Test configured live reads separately after entering your workspace settings. Confirm a non-admin receives 403 from the API and is redirected from the page.

## Official references checked

- https://docs.rasen.ai/get-started/authentication
- https://docs.rasen.ai/api-reference/calls/list
- https://docs.rasen.ai/api-reference/calls/get-transcript
- https://docs.rasen.ai/api-reference/calls/get-summary
- https://docs.rasen.ai/api-reference/usage/list
- https://docs.rasen.ai/guides/usage
- https://docs.rasen.ai/get-started/quickstart
- https://docs.sarvam.ai/voice-agents/api/analytics/interactions
- https://docs.sarvam.ai/voice-agents/api/analytics/transcripts
