// ============================================================================
// SELF-CHECK — the harness turned back on itself.
//
// Principle (COMPILER_PRINCIPLES): a verification harness you cannot trust to verify ITSELF is a
// harness you cannot fully trust on anything. Every other suite checks the product; this one checks
// the harness. Its single job: prove that no verification suite can silently fall out of the gate.
//
// The failure mode this closes is real and already happened once (found the moment this suite was
// written): a suite file can exist on disk, or even have an npm script, yet never be reached by
// `npm run check` — a test that never runs, giving false confidence. Suites are wired into `check`
// by script NAME, not by path, so the coupling is invisible to every other check. This suite makes
// it visible.
//
// THE RECURSION, MADE EXPLICIT: the harness declares its own intentional exceptions here, in
// writing, and then gates on that declaration. A new suite is either in the gate or on the
// documented exclusion list — there is no silent third state. Adding a suite without doing one or
// the other is now a gate failure, by design.
// ============================================================================
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const scripts = PKG.scripts || {};
const checkChain = scripts.check || "";

let failures = 0;
const fail = (msg) => { failures++; console.log("  \u2717 " + msg); };
const pass = (msg) => console.log("  \u2713 " + msg);

// ---------------------------------------------------------------------------------------
// The declared exceptions. A suite on disk that is DELIBERATELY not part of the correctness gate
// must be named here, WITH a reason. This is the harness documenting its own edges (Frank's
// discipline: an exclusion is a ruling, and a ruling is written down, never silent).
// ---------------------------------------------------------------------------------------
const INTENTIONALLY_EXCLUDED = {
  "phase1c_bench.cjs": "performance benchmark, not a correctness assertion \u2014 slow, measures rather than gates; run by hand for scaling reviews",
  "closeout.cjs": "per-file close-out tool \u2014 takes a file argument (node harness/closeout.cjs src/reducer/play.ts) and answers 'is THIS file finished', not a whole-project question; invoked deliberately when closing a file, not in the blanket gate",
  "report.cjs": "the gate REPORT RUNNER \u2014 it runs the whole check gate and itemizes the results, so it cannot be a step INSIDE check (that would recurse). Invoked as `npm run report` instead of being part of `check`",
  "next.cjs": "the NEXT triage driver \u2014 an advisory tool (`npm run next`) that synthesizes work/test/loose-end state into cited next-step candidates; not a correctness gate, so not in check",
  "completeness.cjs": "structural completeness detector \u2014 a module imported by next.cjs that derives unfinished subsystems from code (declared target vs actual count, dependency edges); advisory, not a correctness gate",
  "self_check.cjs": "this suite; wired into check under its own script name (see below)",
};

// ---------------------------------------------------------------------------------------
// 1. Every suite on disk is either reached by `check` or is a declared exception. No silent orphans.
// ---------------------------------------------------------------------------------------
const suitesOnDisk = fs.readdirSync(path.join(ROOT, "harness")).filter((f) => f.endsWith(".cjs"));

// Resolve which suite files `check` actually reaches: it runs `npm run <script>` steps, and each of
// those scripts names a harness file. Walk the chain -> scripts -> files.
const reachedFiles = new Set();
// direct file mentions in the check chain (belt and suspenders)
for (const m of checkChain.matchAll(/harness\/([a-z0-9_]+\.cjs)/g)) reachedFiles.add(m[1]);
// indirect: `npm run X` -> scripts.X -> harness/Y.cjs
for (const m of checkChain.matchAll(/npm run ([a-z0-9:_-]+)/g)) {
  const body = scripts[m[1]] || "";
  for (const f of body.matchAll(/harness\/([a-z0-9_]+\.cjs)/g)) reachedFiles.add(f[1]);
}

for (const suite of suitesOnDisk) {
  if (reachedFiles.has(suite)) { pass(`${suite} is reached by \`check\``); continue; }
  if (INTENTIONALLY_EXCLUDED[suite]) { pass(`${suite} is a DECLARED exception (${INTENTIONALLY_EXCLUDED[suite].slice(0, 48)}\u2026)`); continue; }
  fail(`${suite} exists on disk but is NOT reached by \`check\` and is NOT a declared exception \u2014 a test that never runs. Wire it into check, or add it to INTENTIONALLY_EXCLUDED with a reason.`);
}

// ---------------------------------------------------------------------------------------
// 2. No stale exceptions: every name on the exclusion list must actually exist on disk. A deleted
//    suite left on the list is rot, and rot in the exception list is how the list stops being read.
// ---------------------------------------------------------------------------------------
for (const name of Object.keys(INTENTIONALLY_EXCLUDED)) {
  if (suitesOnDisk.includes(name)) pass(`exclusion "${name}" still refers to a real suite`);
  else fail(`exclusion "${name}" names a suite that no longer exists \u2014 remove it from INTENTIONALLY_EXCLUDED`);
}

// ---------------------------------------------------------------------------------------
// 3. This suite is itself in the gate. The recursion has to close: self_check must be run by
//    `check`, or the self-check is theater. (It cannot verify this by trusting its own run \u2014 it
//    checks the package.json wiring, the same way it judges every other suite.)
// ---------------------------------------------------------------------------------------
if (reachedFiles.has("self_check.cjs")) pass("self_check is wired into `check` (the recursion closes)");
else fail("self_check.cjs is NOT reached by `check` \u2014 a self-verifier that never runs verifies nothing. Add it to the check chain.");

// ---------------------------------------------------------------------------------------
console.log("");
if (failures) { console.log(`SELF-CHECK: ${failures} problem(s) \u2014 the harness fails its own gate`); process.exit(1); }
console.log(`SELF-CHECK: all ${suitesOnDisk.length} suites accounted for \u2014 every suite is gated or declared, and this suite is in the gate`);
