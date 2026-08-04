// ═══════════════════════════════════════════════════════════════════════════════════════════════
// READING THE CONTENT DATABASE — the queries the app will make once it is served rather than bundled
// ═══════════════════════════════════════════════════════════════════════════════════════════════
//
// Deliberately narrow. These are the accessors `src/` already uses, in the same shape, so wiring the
// client is a swap rather than a rewrite:
//
//   librarySubjectFor(id)      ← engine.ts:912, the only call site
//   anyLibrarySubject()        ← bastion.ts:1485
//   subjectsForRegion(region)  ← NEW, and the reason any of this is worth doing
//
// THE POINT IS `subjectsForRegion`. A keep only ever draws on the subjects for the region it stands
// in — roughly eight of a hundred — and the bundled corpus makes the browser hold all hundred to use
// eight. That is the 448 KB in BACKLOG F and it is why this table was the one worth moving.

import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

let _db = null;
export function contentDb(path = join(HERE, "content.db")) {
  // Opened READ-ONLY, which is not a nicety: it makes "somebody hand-edited the content database"
  // impossible rather than merely discouraged. The source of truth is `src/`; this is a build
  // artifact, and an artifact you can write to is an artifact that drifts.
  if (!_db) _db = new DatabaseSync(path, { readOnly: true });
  return _db;
}

const rowsToSubject = (sub, facts) => ({
  id: sub.id, label: sub.label, category: sub.category,
  facts: facts.map((f) => ({ t: f.t, p: f.p || undefined, s: f.s ? JSON.parse(f.s) : undefined, src: f.src || undefined })),
});

export function librarySubjectFor(id, db = contentDb()) {
  const sub = db.prepare("SELECT id,label,category FROM library_subjects WHERE id = ?").get(id);
  if (!sub) return null;
  const facts = db.prepare("SELECT t,p,s,src FROM library_facts WHERE subject_id = ? ORDER BY seq").all(id);
  return rowsToSubject(sub, facts);
}

export function anyLibrarySubject(db = contentDb()) {
  const sub = db.prepare("SELECT id,label,category FROM library_subjects ORDER BY RANDOM() LIMIT 1").get();
  return sub ? librarySubjectFor(sub.id, db) : null;
}

// THE ONE THAT MATTERS. Eight subjects instead of a hundred, served on demand.
export function subjectsForRegion(region, db = contentDb()) {
  const subs = db.prepare("SELECT id,label,category FROM library_subjects WHERE region = ?").all(region);
  return subs.map((sub) => librarySubjectFor(sub.id, db));
}

export function nameCultures(db = contentDb()) {
  const out = {};
  for (const r of db.prepare("SELECT culture,kind,value FROM names").all()) {
    (out[r.culture] = out[r.culture] || { male: [], female: [], last: [], odd: [] })[r.kind].push(r.value);
  }
  return out;
}

export function linesFor(tableName, key = "", db = contentDb()) {
  return db.prepare("SELECT value FROM lines WHERE table_name = ? AND key = ?").all(tableName, key).map((r) => r.value);
}

export function contentMeta(db = contentDb()) {
  const out = {};
  for (const r of db.prepare("SELECT key,value FROM content_meta").all()) out[r.key] = r.value;
  return out;
}
