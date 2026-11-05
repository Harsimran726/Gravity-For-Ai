BEGIN;
CREATE TABLE IF NOT EXISTS hisab_users (
  uid text PRIMARY KEY,
  email text,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  firestore_synced_at timestamptz
);
CREATE TABLE IF NOT EXISTS hisab_orders (
  order_id text PRIMARY KEY,
  uid text NOT NULL REFERENCES hisab_users(uid),
  plan_id text NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  currency text NOT NULL CHECK (currency = 'INR'),
  duration_days integer NOT NULL CHECK (duration_days > 0),
  payment_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','refunded')),
  refunded_amount integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
CREATE INDEX IF NOT EXISTS hisab_orders_user ON hisab_orders(uid, paid_at);
CREATE INDEX IF NOT EXISTS hisab_orders_created ON hisab_orders(created_at DESC);
ALTER TABLE hisab_orders ADD COLUMN IF NOT EXISTS duration_months integer NOT NULL DEFAULT 0;
ALTER TABLE hisab_orders ADD COLUMN IF NOT EXISTS max_workers integer NOT NULL DEFAULT 3;
ALTER TABLE hisab_orders ADD COLUMN IF NOT EXISTS max_clients integer NOT NULL DEFAULT 2;
COMMIT;
