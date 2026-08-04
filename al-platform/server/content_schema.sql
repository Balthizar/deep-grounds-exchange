-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- CONTENT DATABASE — the large authored tables, out of the client bundle
-- ═══════════════════════════════════════════════════════════════════════════════════════════════
--
-- SEPARATE FILE FROM `schema.sql` ON PURPOSE. That one holds MUTABLE STATE — accounts, characters,
-- items, the ledger — which grows without bound and is written constantly. This holds CONTENT: it is
-- authored, it is read-only at runtime, it changes when somebody writes more of it, and it can be
-- rebuilt from source at any time. Two different lifecycles, two different files, and mixing them
-- would mean a content edit forces a migration of a database with half a billion ledger rows in it.
--
-- WHAT LIVES HERE, per EXCHANGE_PRODUCTION_STANDARD §8: tables whose rows carry NO reasoning. The
-- library corpus is the whole prize — 1,965 facts, 448 KB, the single largest object shipped to the
-- browser and read via exactly two accessors. Tables whose comments ARE the artifact (the region
-- demographics with their citations, the facility specs, the morale constants with their rulings)
-- stay in source and are deliberately absent from this file.
--
-- PRAGMAs are lighter than the state database's: no WAL, because nothing writes to this at runtime.

PRAGMA journal_mode = DELETE;
PRAGMA synchronous  = FULL;        -- written once by the generator; correctness over speed
PRAGMA cache_size   = -16384;      -- 16 MB is plenty for a read-only corpus
PRAGMA temp_store   = MEMORY;

-- ---- provenance of the build itself -------------------------------------------------------------
-- So a served corpus can be checked against the source that produced it. A content database with no
-- record of which generator run made it is a database nobody can trust to be current.
CREATE TABLE IF NOT EXISTS content_meta (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL
);

-- ---- THE LIBRARY CORPUS -------------------------------------------------------------------------
-- 100 subjects, 1,965 facts. `p` is the fact's structural role and `s` its tag list, both of which
-- the drift engine reads to chain one fact to the next; `src` is the sourcing URL, kept because the
-- ledger gate checks it and because a fact without a source is not a fact this project ships.
CREATE TABLE IF NOT EXISTS library_subjects (
  id          TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  category    TEXT NOT NULL,
  region      TEXT                        -- the AL region this subject belongs to, for per-region pulls
);
CREATE INDEX IF NOT EXISTS idx_libsub_region   ON library_subjects(region);
CREATE INDEX IF NOT EXISTS idx_libsub_category ON library_subjects(category);

CREATE TABLE IF NOT EXISTS library_facts (
  subject_id  TEXT NOT NULL REFERENCES library_subjects(id),
  seq         INTEGER NOT NULL,           -- position within the subject; the corpus is ordered
  t           TEXT NOT NULL,              -- the sentence
  p           TEXT,                       -- structural role
  s           TEXT,                       -- tag list, JSON array
  src         TEXT,                       -- sourcing URL
  PRIMARY KEY (subject_id, seq)
);
-- The only query the engine makes is "give me this subject's facts in order", which the primary key
-- already serves. The region index above is what makes a PER-REGION pull cheap — the deployment note
-- in BACKLOG F: ~8 subjects loaded instead of 100.

-- ---- NAME TABLES --------------------------------------------------------------------------------
-- 1,406 rows of (culture, kind, value). Small, but this is the table Frank asked to be able to
-- extend without a rebuild, and it is the cleanest possible row shape in the project.
CREATE TABLE IF NOT EXISTS names (
  culture     TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('male','female','last','odd')),
  value       TEXT NOT NULL,
  PRIMARY KEY (culture, kind, value)
);
CREATE INDEX IF NOT EXISTS idx_names_culture ON names(culture, kind);

-- ---- PATROL AND ARRIVAL LINES -------------------------------------------------------------------
-- Pure prose lists keyed by an event or a region. No reasoning per row; the reasoning lives in the
-- header comment in source, which is where it stays.
CREATE TABLE IF NOT EXISTS lines (
  table_name  TEXT NOT NULL,              -- PATROL_ROUNDS, PATROL_UNDER, ARRIVAL_LOCAL, ...
  key         TEXT,                       -- event id / region id, or NULL for a flat list
  value       TEXT NOT NULL,
  PRIMARY KEY (table_name, key, value)
);
CREATE INDEX IF NOT EXISTS idx_lines_table ON lines(table_name, key);
