// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CHECK:CONTENT — the content database must be a faithful projection of source, or it is a lie
// ═══════════════════════════════════════════════════════════════════════════════════════════════
//
// The whole design rests on `src/` staying the source of truth and `content.db` being a REBUILDABLE
// PROJECTION of it. That is only true if something checks. A build artifact nobody verifies is a
// second source of truth wearing a disguise, and this project has already watched a backlog entry
// survive its own fix three times in one day for exactly that reason.
//
// So: rebuild it, then compare EVERY row against the module the app actually imports. Not a count —
// a count passes while the text is wrong. The facts are compared verbatim.
//
// This is also the check that fails the day somebody edits `content.db` by hand.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.log("  FAIL  " + msg); } };

const ROOT = path.resolve(__dirname, "..");
const DB = path.join(ROOT, "server", "content.db");

// ---- rebuild, always. A stale artifact that happens to match is not evidence of anything ---------
try {
  execSync("node server/build_content.mjs", { cwd: ROOT, stdio: "pipe" });
} catch (e) {
  console.log("  FAIL  the content database could not be built: " + (e.message || "").split("\n")[0]);
  console.log("CONTENT DB: 1 of 1 checks FAILED");
  process.exit(1);
}
ok(fs.existsSync(DB), "the generator produces server/content.db");

// ---- read the source tables the same way the generator does --------------------------------------
// ⚠ RELATIVE, NOT ABSOLUTE — the same bug as `people.cjs` (Frank, 3 Aug). Interpolating an ABSOLUTE
// path into the esbuild command breaks on any repo whose path contains a space, and his is
// `C:\Users\user\Desktop\Deep Grounds Exchange\al-platform`. Two spaces, three broken arguments.
//
// Invisible in this container, which sits at `/home/claude/dge`. **Two suites written the same week
// made the same mistake, and the older `transitions.cjs` had used relative paths all along.**
const SHIM_REL = "src/__contentchk.tsx";
const BUNDLE_REL = "harness/.contentchk.cjs";
const SHIM = path.join(ROOT, "src", "__contentchk.tsx");
const BUNDLE = path.join(ROOT, "harness", ".contentchk.cjs");
fs.writeFileSync(SHIM, [
  'export { LIBRARY_SUBJECTS } from "./data/library_subjects";',
  'export { NAME_CULTURES } from "./bastion/registry";',
  'export { PATROL_ROUNDS, PATROL_UNDER } from "./data/bastion";',
].join("\n"));
try {
  execSync(`npx --no-install esbuild "${SHIM_REL}" --bundle --format=cjs --outfile="${BUNDLE_REL}" --loader:.tsx=tsx --loader:.json=json --jsx=automatic --log-level=error`, { cwd: ROOT, stdio: "pipe" });
} finally { fs.rmSync(SHIM, { force: true }); }
const SRC = require(BUNDLE);

const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync(DB, { readOnly: true });

// ---- the corpus, row by row ----------------------------------------------------------------------
const srcSubjects = Object.keys(SRC.LIBRARY_SUBJECTS);
const dbSubjects = db.prepare("SELECT id FROM library_subjects").all().map((r) => r.id);
ok(dbSubjects.length === srcSubjects.length,
   `every subject reaches the database — source ${srcSubjects.length}, db ${dbSubjects.length}`);

let srcFacts = 0, mismatched = 0, firstBad = "";
for (const id of srcSubjects) {
  const sub = SRC.LIBRARY_SUBJECTS[id];
  srcFacts += (sub.facts || []).length;
  const rows = db.prepare("SELECT t,p,s,src FROM library_facts WHERE subject_id = ? ORDER BY seq").all(id);
  if (rows.length !== (sub.facts || []).length) { mismatched++; if (!firstBad) firstBad = id + " (fact count)"; continue; }
  (sub.facts || []).forEach((f, i) => {
    const r = rows[i];
    // VERBATIM. A count check passes while the text is wrong, which is the failure that matters —
    // a corpus served from a database that quietly differs from source is worse than no database.
    if (r.t !== f.t) { mismatched++; if (!firstBad) firstBad = id + "#" + i + " (text)"; }
    else if ((r.p || undefined) !== f.p) { mismatched++; if (!firstBad) firstBad = id + "#" + i + " (role)"; }
    else if (JSON.stringify(r.s ? JSON.parse(r.s) : undefined) !== JSON.stringify(f.s)) { mismatched++; if (!firstBad) firstBad = id + "#" + i + " (tags)"; }
    else if ((r.src || undefined) !== f.src) { mismatched++; if (!firstBad) firstBad = id + "#" + i + " (source)"; }
  });
}
const dbFacts = db.prepare("SELECT COUNT(*) n FROM library_facts").get().n;
ok(dbFacts === srcFacts, `every fact reaches the database — source ${srcFacts}, db ${dbFacts}`);
ok(mismatched === 0, `and every fact matches VERBATIM — ${mismatched} differ${firstBad ? ", first: " + firstBad : ""}`);

// ---- the per-region index, which is the reason this exists ---------------------------------------
const regions = db.prepare("SELECT region, COUNT(*) n FROM library_subjects WHERE region IS NOT NULL GROUP BY region").all();
ok(regions.length >= 10, `subjects carry a region so a keep can pull only its own — ${regions.length} regions`);
const biggest = regions.reduce((a, b) => (b.n > a.n ? b : a), { n: 0 });
ok(biggest.n < srcSubjects.length / 3,
   `and no region needs more than a third of the corpus — largest is ${biggest.region} at ${biggest.n} of ${srcSubjects.length}`);

// ---- names and lines -----------------------------------------------------------------------------
let srcNames = 0;
for (const c of Object.values(SRC.NAME_CULTURES)) for (const k of ["male", "female", "last", "odd"]) srcNames += (c[k] || []).length;
const dbNames = db.prepare("SELECT COUNT(*) n FROM names").get().n;
ok(dbNames === srcNames, `every name reaches the database — source ${srcNames}, db ${dbNames}`);

const dbRounds = db.prepare("SELECT COUNT(*) n FROM lines WHERE table_name = 'PATROL_ROUNDS'").get().n;
ok(dbRounds === SRC.PATROL_ROUNDS.length, `flat prose tables reach the database — ${dbRounds} of ${SRC.PATROL_ROUNDS.length}`);
const dbUnder = db.prepare("SELECT COUNT(DISTINCT key) n FROM lines WHERE table_name = 'PATROL_UNDER'").get().n;
ok(dbUnder === Object.keys(SRC.PATROL_UNDER).length, `and keyed ones keep their keys — ${dbUnder} events`);

// ---- the read layer returns what the engine expects -----------------------------------------------
// Not "the rows are there" but "the accessor hands back the same SHAPE the app already consumes",
// because that is what makes wiring the client a swap rather than a rewrite.
{
  const one = db.prepare("SELECT id FROM library_subjects LIMIT 1").get().id;
  const sub = SRC.LIBRARY_SUBJECTS[one];
  const rows = db.prepare("SELECT t,p,s,src FROM library_facts WHERE subject_id = ? ORDER BY seq").all(one);
  const rebuilt = rows.map((f) => ({ t: f.t, p: f.p || undefined, s: f.s ? JSON.parse(f.s) : undefined, src: f.src || undefined }));
  ok(JSON.stringify(rebuilt) === JSON.stringify(sub.facts),
     "a subject read back out of the database is byte-identical to the one in source");
}

// ---- the artifact is READ-ONLY at runtime ---------------------------------------------------------
{
  let threw = false;
  try { db.exec("CREATE TABLE _probe (x)"); } catch (e) { threw = true; }
  ok(threw, "the content database is opened read-only — a build artifact you can write to drifts");
}

db.close();
fs.rmSync(BUNDLE, { force: true });

const kb = Math.round(fs.statSync(DB).size / 1024);
if (fails) { console.log(`CONTENT DB: ${fails} of ${checks} checks FAILED`); process.exit(1); }
console.log(`CONTENT DB: all ${checks} checks passed — ${srcFacts} facts, ${srcNames} names, ${kb} KB`);
