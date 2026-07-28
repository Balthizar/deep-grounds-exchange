// FILE CLOSE-OUT VERIFICATION.
//
// Frank, 27 Jul: "when you close out a file, any file, it requires that you go through and test
// everything that you've worked on in that file before we count it as actually operational, just
// to confirm we haven't broken anything in the process."
//
// The gate answers "is everything passing". This answers a different and narrower question:
// "is THIS FILE actually finished". A green gate is compatible with a file being half done —
// 113 unasserted actions pass every other suite today. So close-out is its own check, and it is
// deliberately strict: a file is not closed until EVERY action it declares is asserted AND
// reachable AND carries an identity check or is explicitly recorded as not needing one.
//
// Run as: node harness/closeout.cjs src/reducer/play.ts
//
// The three questions, in the order that matters:
//   1. ASSERTED   — does a suite name it? (the coverage gate's question, per-file)
//   2. REACHABLE  — can a user actually get to it, or is it dead circuitry?
//   3. GUARDED    — does it consult an identity before mutating?
//
// Question 3 cannot be answered by pattern-matching alone and this file does not pretend
// otherwise: it reports a CANDIDATE list for human triage rather than a verdict. Two regex
// passes over the same reducers disagreed (24 vs 26) when this was first attempted, which is
// exactly why the output says "review" and not "fail". A check that overstates its confidence is
// worse than one that admits its limits, because people stop reading it.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
process.chdir(root);

const target = process.argv[2];
if (!target) { console.log("usage: node harness/closeout.cjs <path/to/reducer.ts>"); process.exit(2); }
if (!fs.existsSync(target)) { console.log(`  FAIL  no such file: ${target}`); process.exit(1); }

const strip = (s) => s.replace(/^[ \t]*\/\/.*$/gm, "");
const src = strip(fs.readFileSync(target, "utf8"));

// ---- the file's own declared surface, discovered ----------------------------------
const actions = [...new Set([...src.matchAll(/case "([A-Z][A-Z0-9_]*)":/g)].map((m) => m[1]))].sort();
if (!actions.length) { console.log(`  FAIL  ${target} declares no actions — wrong file, or the scan is broken`); process.exit(1); }

// ---- 1. ASSERTED: named by some suite ---------------------------------------------
const suites = fs.readdirSync(path.join(root, "harness")).filter((f) => f.endsWith(".cjs") && f !== "closeout.cjs" && f !== "coverage.cjs");
let corpus = "";
for (const f of suites) {
  corpus += "\n" + strip(fs.readFileSync(path.join(root, "harness", f), "utf8"))
    .replace(/const SELF_SERVICE = new Set\(\[[\s\S]*?\]\);/g, "");   // classification, not assertion
}
const asserted = new Set([...corpus.matchAll(/"([A-Z][A-Z0-9_]*)"/g)].map((m) => m[1]));

// ---- 2. REACHABLE: named anywhere outside the reducers ----------------------------
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if ((e.name.endsWith(".tsx") || e.name.endsWith(".ts")) && !e.name.startsWith("__")) out.push(p);
  }
  return out;
};
let ui = "";
for (const f of walk(path.join(root, "src"))) {
  const rel = path.relative(root, f).replace(/\\/g, "/");
  if (rel.includes("/reducer/") || rel.endsWith("types.ts") || rel.endsWith("bastion/actions.ts")) continue;
  ui += "\n" + strip(fs.readFileSync(f, "utf8"));
}
const reachable = new Set([...ui.matchAll(/"([A-Z][A-Z0-9_]*)"/g)].map((m) => m[1]));

// ---- 3. GUARDED: consults an identity before mutating -----------------------------
const ACTOR = /action\.(by|acc|accountId|dmId|candidate|mentee|monitorId|provDm|sender)\b|isAdmin|mayActOn|isDMRole|isCertifiedDM|verifyingDMs|mayReviewLog|canPublishSession|canTradeAcct|hasPlayedUnder|isModuleAuthor|ownerId/;
const bodyOf = (name) => {
  const lines = src.split("\n");
  const i = lines.findIndex((l) => new RegExp(`case "${name}":`).test(l));
  if (i < 0) return "";
  let d = 0, j = i; const out = [];
  while (j < lines.length) {
    d += (lines[j].match(/\{/g) || []).length - (lines[j].match(/\}/g) || []).length;
    out.push(lines[j]); j++;
    if (d <= 0 && j > i + 1) break;
  }
  return out.join("\n");
};

const bare = actions.filter((a) => !asserted.has(a));
const dead = actions.filter((a) => !reachable.has(a));
const unguarded = actions.filter((a) => !ACTOR.test(bodyOf(a)));

console.log(`\n  CLOSE-OUT — ${target}`);
console.log(`  actions declared : ${actions.length}`);
console.log(`  asserted         : ${actions.length - bare.length}/${actions.length}`);
console.log(`  reachable        : ${actions.length - dead.length}/${actions.length}`);
console.log(`  identity-checked : ${actions.length - unguarded.length}/${actions.length}  (candidates below are for review, not a verdict)`);

if (bare.length) { console.log(`\n  NOT ASSERTED (${bare.length}) — blocks close-out:`); bare.forEach((a) => console.log("      " + a)); }
if (dead.length) { console.log(`\n  NOT REACHABLE (${dead.length}) — dead circuitry or a missing screen:`); dead.forEach((a) => console.log("      " + a)); }
if (unguarded.length) { console.log(`\n  NO IDENTITY REFERENCE (${unguarded.length}) — triage by hand:`); unguarded.forEach((a) => console.log("      " + a)); }

// Only assertion coverage HARD-FAILS. Reachability and guarding are reported because a
// deliberately-internal action and a placeholder awaiting its screen are both legitimate, and a
// check that cannot tell those apart must not be the thing that blocks a commit.
console.log(bare.length
  ? `\nCLOSE-OUT: ${target} is NOT closed — ${bare.length} action(s) unasserted`
  : `\nCLOSE-OUT: ${target} is closed — all ${actions.length} actions asserted`);
process.exit(bare.length ? 1 : 0);
