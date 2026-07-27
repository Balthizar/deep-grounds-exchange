-- ============================================================================
-- THE DEEP GROUNDS EXCHANGE — my authoritative store, core schema (v1)
--
-- MY RULING, ENCODED (SQLite base, server-authoritative, clients get slices):
--
--   1. RECORDS STAY WHOLE. I store every domain record as the SAME JSON my
--      reducer already reads and writes — module-as-encapsulation survives my
--      database exactly like it survives JSON round-trips today. My reducer
--      never learns SQL; my draft layer does (server/db_draft.mjs).
--
--   2. QUERY FIELDS ARE COLUMNS. Anything an action ITERATES on becomes an
--      indexed column my draft maintains on write: owner_id, next_due_at,
--      char_id, event_id. Schema-level form of my own rule: actions that name
--      what they want stay cheap; actions that iterate become indexed queries.
--
--   3. THE LEDGER IS APPEND-ONLY AND SAYS SO. log_entries gets a rowid sequence
--      and no UPDATE path in my draft except my three moderation actions, which
--      go through a separate guarded statement. I shaped this table for 500M
--      rows: inserts at the tail, reads by (char_id, seq DESC).
--
--   4. COUNTS ARE MAINTAINED, NOT SURVEYED. rollups holds counters I maintain
--      incrementally (org membership, store counts, per-char ledger totals). A
--      report is a point read. I ban COUNT(*) over millions from the request
--      path; my stress harness measures both so future me remembers why.
-- ============================================================================

PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;      -- durable across an app crash; an OS crash may lose my last batch. My ruling, documented in the STRESS report — tighten here if I change my mind
PRAGMA cache_size = -65536;        -- 64 MB page cache
PRAGMA mmap_size = 268435456;      -- 256 MB mmap window
PRAGMA temp_store = MEMORY;

CREATE TABLE IF NOT EXISTS meta (
  k TEXT PRIMARY KEY,
  v TEXT
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS accounts (
  id   TEXT PRIMARY KEY,
  json TEXT NOT NULL
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS characters (
  id          TEXT PRIMARY KEY,
  owner_id    TEXT NOT NULL,
  retired     INTEGER NOT NULL DEFAULT 0,
  next_due_at INTEGER,            -- min of bastion turn/building/walls/happening due times; NULL = nothing scheduled
  json        TEXT NOT NULL
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS idx_characters_owner ON characters(owner_id);
-- My 1 Hz tick becomes this index: WHERE next_due_at <= ? ORDER BY next_due_at LIMIT batch
CREATE INDEX IF NOT EXISTS idx_characters_due   ON characters(next_due_at) WHERE next_due_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS items (
  id          TEXT PRIMARY KEY,
  holder_type TEXT NOT NULL,      -- CHARACTER | PLAYER | STORE ...
  holder_id   TEXT NOT NULL,
  owner_acct  TEXT,               -- account that answers for it (permission checks)
  available   INTEGER NOT NULL DEFAULT 0,   -- market visibility flag, indexed for the listings slice
  json        TEXT NOT NULL
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS idx_items_holder ON items(holder_type, holder_id);
CREATE INDEX IF NOT EXISTS idx_items_owner  ON items(owner_acct);
CREATE INDEX IF NOT EXISTS idx_items_market ON items(available) WHERE available = 1;

-- THE LEDGER. seq is my platform-wide ordering; (char_id, seq) is the read path.
CREATE TABLE IF NOT EXISTS log_entries (
  seq     INTEGER PRIMARY KEY AUTOINCREMENT,
  id      TEXT NOT NULL,
  char_id TEXT,
  date    TEXT,
  json    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_log_char ON log_entries(char_id, seq DESC);

CREATE TABLE IF NOT EXISTS organizations (
  id   TEXT PRIMARY KEY,
  json TEXT NOT NULL
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS org_members (
  org_id     TEXT NOT NULL,
  account_id TEXT NOT NULL,
  json       TEXT NOT NULL DEFAULT '{}',   -- role flags per membership
  PRIMARY KEY (org_id, account_id)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS idx_members_acct ON org_members(account_id);

CREATE TABLE IF NOT EXISTS stores (
  id     TEXT PRIMARY KEY,
  org_id TEXT,
  json   TEXT NOT NULL
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS idx_stores_org ON stores(org_id);

CREATE TABLE IF NOT EXISTS sessions (
  id       TEXT PRIMARY KEY,
  event_id TEXT,
  dm_id    TEXT,
  status   TEXT,
  datetime TEXT,
  json     TEXT NOT NULL
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS idx_sessions_event ON sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_sessions_dm    ON sessions(dm_id);

CREATE TABLE IF NOT EXISTS notices (
  id         TEXT PRIMARY KEY,
  account_id TEXT,
  json       TEXT NOT NULL
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS idx_notices_acct ON notices(account_id);

-- Counters I maintain incrementally. Key examples:
--   org:<id>:members   org:<id>:dms   char:<id>:gold_total   platform:characters
CREATE TABLE IF NOT EXISTS rollups (
  k TEXT PRIMARY KEY,
  v INTEGER NOT NULL DEFAULT 0
) WITHOUT ROWID;
