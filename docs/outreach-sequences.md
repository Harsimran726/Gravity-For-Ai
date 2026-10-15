# Email sequence import

Open Admin > Email campaigns > New campaign.

1. Upload CSV or Excel (up to 5 MB). Select a worksheet. The Gravity For AI report joins Contacts and Email sequences by Contact ID automatically.
2. Match email, name and company. For the mixed report choose Scope: UK healthcare. Choose First contact to review to avoid approaching colleagues simultaneously.
3. Choose 0–7 follow-ups. Default offsets: 0, 3, 7, 12 business days. Each step has its own subject/message column selectors and optional fallback text.
4. Preview each recipient's resolved emails. Empty mapped cells require a default. Incomplete messages block saving.
5. Save draft. Review recipients and record permission, then activate separately.

Days are cumulative offsets from the first SMTP-accepted email for each recipient. If sending limits or pauses delay a step, subsequent steps preserve their minimum interval. Business days exclude Saturday and Sunday using IST; public holidays are not excluded. Calendar days include weekends. These are earliest eligible times; mailbox/campaign limits and scheduler availability can delay sending.

Existing campaigns without a sequence keep their previous follow-up timing. New campaign sequences are frozen on creation; create another draft to redesign a sequence rather than altering messages already underway.

Per-recipient subject and message values are used at every step. Replies, opt-outs, bounces, uncertain sends and mailbox limits retain existing safeguards. No upload activates a campaign or proves permission.

Release: apply prisma/outreach-sequences.sql before deploying the new Prisma client. This only adds two nullable JSONB columns and does not modify existing rows. No secrets or provider settings are changed.
