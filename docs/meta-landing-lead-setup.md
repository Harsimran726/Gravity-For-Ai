# Landing-page Meta Lead event setup

Page: https://gravityforai.com/lp/interior-websites
Event: Lead. Trigger: a valid enquiry successfully saved in the CRM.
The browser and Conversions API share event_id = lead-<saved CRM record ID> for deduplication.
The event uses action_source=website and the landing-page URL. CRM stage-change events use system_generated; they are a separate integration.
Contact email and phone are normalized and SHA-256 hashed server-side. No form message or budget is sent by this landing-page event.
A local CRM record ID is NOT a Meta lead_id. No invented Meta lead_id is sent.

## 1. Choose the dataset
In Meta Events Manager, select the dataset connected to your ad account and check its ID in Settings.
The supplied guide has a heading ID of 1761839488516879 but an API endpoint dataset of 2111062089501666. The website currently defaults to 2111062089501666. Confirm the intended dataset and use the SAME ID in both variables below.

## 2. Configure Vercel Production environment variables
- META_PIXEL_ID = your confirmed dataset ID
- NEXT_PUBLIC_META_PIXEL_ID = the same dataset ID
- META_CONVERSIONS_API_TOKEN = the access token generated for that dataset under Settings > Conversions API > manual/direct integration
- META_GRAPH_API_VERSION = v26.0
Never put the access token in a NEXT_PUBLIC variable, frontend script, screenshot or source control.
Redeploy after changing environment variables, including NEXT_PUBLIC_META_PIXEL_ID (used at build time).

## 3. Test without triggering a real AI call
Use a preview deployment with the AI callback sending switch disabled, or an explicitly authorized phone number you own. The normal form queues an AI callback.
In Events Manager > Test events, copy the server test event code. Set META_TEST_EVENT_CODE to that code in the test deployment and redeploy.
Open the landing page through Test events' browser testing flow; submit one valid enquiry.
Check:
1. Exactly one CRM record was saved.
2. A Lead server event appears with action_source=website and the landing-page URL.
3. Browser Lead appears if Pixel is allowed by the browser, with the same event ID as the server event.
4. Meta recognizes the browser/server pair as one logical lead through deduplication.
5. Clicking the CTA without submitting, or submitting invalid fields, produces no Lead.
A test event proves communication, not ad attribution or inbox delivery.

## 4. Production
Remove META_TEST_EVENT_CODE and redeploy to stop sending server events in test mode.
Keep the privacy disclosure on the enquiry form; implement applicable consent choices for any additional markets you target.
Do not add another Lead event on the submit-button click with Meta Event Setup Tool or Google Tag Manager; it can double-count enquiries or count failed submissions.
In Ads Manager choose Leads > Website, the same dataset, and Lead as the conversion event (labels may vary by account).
Use the production landing page in the ad URL and campaign UTMs for your reporting.
Review Events Manager Diagnostics, event matching and deduplication after real enquiries arrive.

## Verification status
Application type-check and mocked integration tests verify save-first ordering, hashed matching data, shared event ID, no event on failed save and form success when Meta is unavailable.
Real Meta receipt requires a configured dataset access token and a Test events submission. No live lead or AI call was generated while implementing this change.
