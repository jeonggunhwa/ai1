export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS raw_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL,
  source_name TEXT NOT NULL,
  category TEXT,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  published_at TEXT,
  body_text TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_raw_items_source ON raw_items(source_id);
CREATE INDEX IF NOT EXISTS idx_raw_items_hash ON raw_items(content_hash);

CREATE TABLE IF NOT EXISTS drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_item_id INTEGER NOT NULL REFERENCES raw_items(id),
  draft_type TEXT NOT NULL CHECK (draft_type IN ('news', 'column')),
  title TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  facts_json TEXT NOT NULL,
  source_citation TEXT NOT NULL,
  ai_model TEXT NOT NULL,
  ai_disclosure TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'rejected')),
  review_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);
CREATE INDEX IF NOT EXISTS idx_drafts_raw_item ON drafts(raw_item_id);
`;
