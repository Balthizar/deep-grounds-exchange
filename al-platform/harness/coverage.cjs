// ASSERTION COVERAGE — the strict gate.
//
// Frank, 27 Jul: "I want the strict gate so that we can find all the problems... if we let shit
// slide, then we're not catching the things that are going to bite us in the ass later, it might
// be tomorrow. It might be 10 years from now."
//
// WHAT THE OTHER SUITES ALREADY PROVE, so that what this one adds is clear:
//   check_actions  — the action EXISTS and is declared consistently
//   immutability   — dispatching it does not mutate previous state
//   transitions    — the universal sweep: it refuses a stranger, it survives a junk payload
// All three are UNIVERSAL. Every action passes them the day it is written, without anyone
// deciding what the action is supposed to DO. That is the hole: an action can be declared,
// routed, pure, permission-guarded — and wrong. Nothing above would notice.
//
// WHAT "COVERED" MEANS HERE, stated plainly because the measure is a proxy and proxies lie if
// you forget they are proxies: an action is covered when its name appears as a string literal in
// a harness suite, outside comments and outside the classification rosters (SELF_SERVICE is a
// list of what an action IS, not a test of what it does). Naming is not the same as asserting —
// someone can satisfy this gate with a dispatch and no expectation. It is a floor, not a ceiling,
// and it is the strongest signal available without executing intent.
//
// THIS GATE IS EXPECTED TO BE RED until the backlog it exposes is paid down. That is deliberate
// and was chosen knowingly: a green gate over 153 unasserted actions is a lie that compounds.
// Do NOT add an exemption list. An exemption list is how this becomes green and meaningless —
// it rots exactly the way a hand-written component roster rots, and the whole reason this file
// discovers its roster is that hand-lists rot. Pay it down or change the ruling on the record.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
process.chdir(root);

// Strip line comments only. Block-comment stripping with a naive regex ate 21 components in
// render.cjs because `accept="image/*"` opened a fake comment; the same hazard applies here.
const strip = (s) => s.replace(/^[ \t]*\/\/.*$/gm, "");

const ACTION_FILES = ["src/bastion/actions.ts", "src/reducer/items.ts", "src/reducer/play.ts",
                      "src/reducer/characters.ts", "src/reducer/org.ts", "src/reducer/social.ts"];

// ---- ROSTER: discovered, never listed --------------------------------------------
const owner = {};
for (const f of ACTION_FILES) {
  for (const m of strip(fs.readFileSync(f, "utf8")).matchAll(/case "([A-Z][A-Z0-9_]*)":/g)) {
    owner[m[1]] = f;
  }
}
const actions = Object.keys(owner).sort();
if (actions.length === 0) { console.log("  FAIL  no actions discovered — the scan is broken"); process.exit(1); }

// Second, independent count against RAW source. Same discipline the render gate learned the hard
// way: a scan must be checked against a number it does not control.
let raw = 0;
for (const f of ACTION_FILES) raw += new Set([...fs.readFileSync(f, "utf8").matchAll(/case "([A-Z][A-Z0-9_]*)":/g)].map((m) => m[1])).size;
if (raw < actions.length) {
  console.log(`  FAIL  discovery disagrees with itself: raw ${raw} vs scanned ${actions.length}`);
  process.exit(1);
}

// ---- WHAT THE SUITES NAME ---------------------------------------------------------
// Every .cjs suite is read, so a new suite counts the day it lands without editing this file.
const suites = fs.readdirSync(path.join(root, "harness"))
  .filter((f) => f.endsWith(".cjs") && f !== "coverage.cjs");
let corpus = "";
for (const f of suites) {
  let src = strip(fs.readFileSync(path.join(root, "harness", f), "utf8"));
  // SELF_SERVICE classifies actions for the universal permission sweep. Membership is a fact
  // about the action, not a test of it, so naming an action there must not count as coverage.
  src = src.replace(/const SELF_SERVICE = new Set\(\[[\s\S]*?\]\);/g, "");
  corpus += "\n" + src;
}
const named = new Set([...corpus.matchAll(/"([A-Z][A-Z0-9_]*)"/g)].map((m) => m[1]));

const covered = actions.filter((a) => named.has(a));
const bare = actions.filter((a) => !named.has(a));

// ---- REPORT ------------------------------------------------------------------------
const pct = Math.round((covered.length / actions.length) * 100);
console.log(`  actions discovered   : ${actions.length}`);
console.log(`  named in a suite     : ${covered.length}  (${pct}%)`);
console.log(`  UNASSERTED           : ${bare.length}`);

if (bare.length) {
  const byFile = {};
  for (const a of bare) (byFile[owner[a]] = byFile[owner[a]] || []).push(a);
  // Ordered worst-first so paydown can start where the debt is densest.
  for (const [f, list] of Object.entries(byFile).sort((x, y) => y[1].length - x[1].length)) {
    console.log(`\n  ${f} — ${list.length} unasserted`);
    for (const a of list) console.log(`      ${a}`);
  }
}

console.log(bare.length
  ? `\nCOVERAGE: ${bare.length} action(s) have no assertion. Write one, or change the ruling — do not add an exemption.`
  : `\nCOVERAGE: all ${actions.length} actions are named in a suite`);
process.exit(bare.length ? 1 : 0);
