CREATE TABLE IF NOT EXISTS workshop_enrolments (
 id text PRIMARY KEY, cohort text NOT NULL, name text NOT NULL,
 email text NOT NULL, phone text NOT NULL, group_consent boolean NOT NULL,
 source text NOT NULL DEFAULT '', order_id text UNIQUE, payment_id text UNIQUE,
 status text NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now(),
 paid_at timestamptz, confirmation_sent_at timestamptz
);
CREATE INDEX IF NOT EXISTS workshop_email_idx ON workshop_enrolments(email,cohort);
ALTER TABLE workshop_enrolments ADD COLUMN IF NOT EXISTS amount integer NOT NULL DEFAULT 29900;
ALTER TABLE workshop_enrolments ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'INR';
