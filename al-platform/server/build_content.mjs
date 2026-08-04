// ═══════════════════════════════════════════════════════════════════════════════════════════════
// BUILD THE CONTENT DATABASE from the authored source of truth.
// ═══════════════════════════════════════════════════════════════════════════════════════════════
//
// `node server/build_content.mjs` → `server/content.db`
//
// THE SOURCE IS STILL SOURCE. This does not move the tables out of `src/`; it PROJECTS them into a
// database. That direction matters and is the whole design:
//
//   • the corpus keeps its type checking, its comments, and the gates that read it directly
//   • the database is a BUILD ARTIFACT, regenerable at any time, never hand-edited
//   • a content edit is a source edit plus a rebuild, exactly like every other artifact here
//   • and `content_meta` records which build produced it, so a served corpus can be checked
//
// The alternative — cutting the tables out of source and making the .db authoritative — would put
// 448 KB of authored prose somewhere `tsc` cannot see, `check:ledger` cannot gate, and a reviewer
// cannot read in a diff. That is a worse codebase, not a faster one.
//
// WHAT THIS BUYS, concretely: the library corpus is 448 KB of the 1,028 KB content chunk, read
// through exactly two accessors, and a keep only ever needs the subjects for ITS region. Served from
// here that is ~8 subjects instead of 100.

import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync, existsSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const OUT = join(HERE, "content.db");

// ---- read the authored tables through the compiler, not by parsing them -------------------------
// The tables are TypeScript with types and comments, so the only honest way to read them is to let
// esbuild resolve the module graph. Parsing source text to recover data is the defect P1 warns about
// — measure the decomposed truth, do not re-derive a shakier copy of it.
const SHIM = join(ROOT, "src", "__content.tsx");
const BUNDLE = join(HERE, ".content_bundle.cjs");
writeFileSync(SHIM, [
  'export { LIBRARY_SUBJECTS } from "./data/library_subjects";',
  'export { NAME_CULTURES } from "./bastion/registry";',
  'export { PATROL_ROUNDS, PATROL_INCIDENTS, PATROL_UNDER, ARRIVAL_LOCAL, ARRIVAL_OUTLANDER,',
  '         CAMP_LOCAL, CAMP_OUTLANDER, CAMP_BUILDING, CAMP_ENDED, GARRISON_AFTER,',
  '         MORALE_WALKOUT } from "./data/bastion";',
  'export { BASTION_REGIONS } from "./data/bastion";',
].join("\n"));
try {
  // ⚠ QUOTED (Frank, 3 Aug). His repo is at `C:\Users\user\Desktop\Deep Grounds Exchange\al-platform`
  // — two spaces — and an unquoted absolute path splits the command into broken arguments. **This is
  // the THIRD file with the same bug**, after `people.cjs` and `content_db.cjs`, and it is the one
  // that actually broke `check:content`: the harness fix did nothing because the failure was in the
  // SERVER SCRIPT the harness shells out to.
  //
  // I fixed the two suites, ran the gate, saw green, and shipped — without asking what `check:content`
  // actually calls.
  execSync(`npx --no-install esbuild "${SHIM}" --bundle --format=cjs --outfile="${BUNDLE}" --loader:.tsx=tsx --loader:.json=json --jsx=automatic --log-level=error`, { cwd: ROOT, stdio: "inherit" });
} finally { rmSync(SHIM, { force: true }); }
const C = createRequire(import.meta.url)(BUNDLE);

// ---- build --------------------------------------------------------------------------------------
if (existsSync(OUT)) unlinkSync(OUT);          // a rebuild is a REBUILD; never append to a stale file
const db = new DatabaseSync(OUT);
db.exec(readFileSync(join(HERE, "content_schema.sql"), "utf8"));

const t0 = Date.now();
let subjects = 0, facts = 0, names = 0, lines = 0;

db.exec("BEGIN IMMEDIATE");
try {
  // --- the library corpus ---
  const subStmt = db.prepare("INSERT INTO library_subjects (id,label,category,region) VALUES (?,?,?,?)");
  const factStmt = db.prepare("INSERT INTO library_facts (subject_id,seq,t,p,s,src) VALUES (?,?,?,?,?,?)");
  // A subject's region is not a field on the subject — it is the ledger's business — so it is derived
  // from the id prefix the corpus already uses. Derived, not typed twice.
  const regionOf = (id) => { const m = /^([a-z]+)_/.exec(id || ""); return m ? m[1] : null; };
  for (const [id, sub] of Object.entries(C.LIBRARY_SUBJECTS)) {
    subStmt.run(id, sub.label || id, sub.category || "", regionOf(id));
    subjects++;
    (sub.facts || []).forEach((f, i) => {
      factStmt.run(id, i, f.t || "", f.p || null, f.s ? JSON.stringify(f.s) : null, f.src || null);
      facts++;
    });
  }

  // --- names ---
  const nameStmt = db.prepare("INSERT OR IGNORE INTO names (culture,kind,value) VALUES (?,?,?)");
  for (const [culture, c] of Object.entries(C.NAME_CULTURES)) {
    for (const kind of ["male", "female", "last", "odd"]) {
      (c[kind] || []).forEach((v) => { nameStmt.run(culture, kind, v); names++; });
    }
  }

  // --- prose lines ---
  const lineStmt = db.prepare("INSERT OR IGNORE INTO lines (table_name,key,value) VALUES (?,?,?)");
  const flat = { PATROL_ROUNDS: C.PATROL_ROUNDS, PATROL_INCIDENTS: C.PATROL_INCIDENTS,
                 ARRIVAL_OUTLANDER: C.ARRIVAL_OUTLANDER, CAMP_BUILDING: C.CAMP_BUILDING,
                 CAMP_ENDED: C.CAMP_ENDED, MORALE_WALKOUT: C.MORALE_WALKOUT };
  for (const [name, arr] of Object.entries(flat)) (arr || []).forEach((v) => { lineStmt.run(name, "", v); lines++; });
  const keyed = { PATROL_UNDER: C.PATROL_UNDER, ARRIVAL_LOCAL: C.ARRIVAL_LOCAL,
                  CAMP_LOCAL: C.CAMP_LOCAL, CAMP_OUTLANDER: C.CAMP_OUTLANDER, GARRISON_AFTER: C.GARRISON_AFTER };
  for (const [name, map] of Object.entries(keyed)) {
    for (const [k, arr] of Object.entries(map || {})) (arr || []).forEach((v) => { lineStmt.run(name, k, v); lines++; });
  }

  const meta = db.prepare("INSERT OR REPLACE INTO content_meta (key,value) VALUES (?,?)");
  meta.run("built_at", new Date().toISOString());
  meta.run("subjects", String(subjects));
  meta.run("facts", String(facts));
  meta.run("names", String(names));
  meta.run("lines", String(lines));
  db.exec("COMMIT");
} catch (e) { db.exec("ROLLBACK"); throw e; }

db.exec("VACUUM");                              // it is read-only from here; give it back the pages
db.close();
rmSync(BUNDLE, { force: true });

const bytes = readFileSync(OUT).length;
console.log(`content.db built in ${Date.now() - t0} ms`);
console.log(`  subjects ${subjects}  facts ${facts}  names ${names}  lines ${lines}`);
console.log(`  ${(bytes / 1024).toFixed(0)} KB on disk`);
