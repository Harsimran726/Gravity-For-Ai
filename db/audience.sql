CREATE TABLE IF NOT EXISTS audience_page_views (
 id uuid PRIMARY KEY, visitor_id uuid NOT NULL, session_id uuid NOT NULL,
 path varchar(500) NOT NULL, referrer varchar(255), source varchar(100), medium varchar(100), campaign varchar(150), term varchar(150),
 ip varchar(45), device varchar(20) NOT NULL, country varchar(100), region varchar(100), city varchar(100),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), active_seconds integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS audience_created ON audience_page_views(created_at);
CREATE INDEX IF NOT EXISTS audience_session ON audience_page_views(session_id);
