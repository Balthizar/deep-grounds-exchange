// ============================================================================
// GATE REPORT — runs the full `check` gate and prints one itemized report:
// which suites ran, pass/fail each, the summary line each suite already emits, and how long it took.
//
// This does NOT reimplement any suite. Every suite already prints its own summary
// ("TRANSITIONS: all 660 checks passed", "RENDER: all 117 components mounted", ...). This runner just
// drives them in the real gate order and collects those lines into one place, so "gate green" becomes
// green AND itemized instead of a scroll of output you have to trust.
//
// It reads the step order from package.json's `check` script rather than hardcoding it, so the report
// can never silently drift from the actual gate (same self-referential discipline as self_check).
// ============================================================================
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const scripts = PKG.scripts || {};

// Parse the real gate chain into ordered steps.
const steps = scripts.check.split("&&").map((s) => s.trim()).filter(Boolean);

// A step is either a build command (tsc -b, vite build, oxlint) or `npm run <script>`. For reporting
// we treat each uniformly: label, the command we actually run, and whether it's a suite or a build.
function classify(step) {
  const m = step.match(/^npm run ([a-z0-9:_-]+)$/);
  if (m) return { label: m[1], cmd: `npm run ${m[1]}`, kind: "suite" };
  if (/^tsc/.test(step)) return { label: "tsc -b", cmd: step, kind: "build" };
  if (/^vite/.test(step)) return { label: "vite build", cmd: step, kind: "build" };
  return { label: step.split(/\s+/)[0], cmd: step, kind: "build" };
}

// ---------------------------------------------------------------------------------------
// HOW A STEP'S VERDICT IS FOUND (B-40).
//
// The project convention: a suite's LAST non-empty line is its verdict, in the shape
// `NAME: verdict`. That convention is what makes this runner possible without reimplementing
// anything. Most steps follow it. Third-party tools don't, and can't be made to.
//
// The old rule was "scan the last four lines for an UPPERCASE-ish label, else take the last line."
// That silent `else` was the bug: oxlint's verdict is `Found N warnings and M errors.`, followed by
// a `Finished in …` timing line. Neither matches the convention, so the fallback reported the
// TIMING line as lint's verdict — a plausible-looking sentence that hid the only number lint
// carries. A report that cannot read a step must SAY SO, not guess.
//
// So: convention first, then a DECLARED extractor with a written reason, then an explicit MISS.
// There is no silent third state. Same discipline as self_check's exclusion list.
// ---------------------------------------------------------------------------------------
// A verdict line is `NAME: text`, where NAME is upper-case and may carry a parenthesised qualifier
// (`BEHAVIOUR (minified): all checks passed`). The qualifier is lower-case, so it cannot simply be
// folded into the label's character class — it needs its own group, or a real verdict reads as a miss.
const CONVENTION = /^[A-Z][A-Z0-9 \-]*(\([^)]*\))?\s*:\s*\S/;

const DECLARED_SUMMARY = {
  lint: {
    // Search backwards over a bounded window; oxlint prints the verdict, then a timing line.
    pattern: /^Found \d+ warnings? and \d+ errors?\.?$/,
    why: "oxlint is a third-party tool and emits no `NAME: verdict` line. Its verdict is the " +
         "warnings/errors count; the `Finished in …` line that follows is timing, not a verdict.",
  },
};

const WINDOW = 8;   // how far back a declared extractor may look, in non-empty lines

// Returns { summary, found }. `found: false` means the runner could not read this step's verdict —
// reported as such rather than substituted with whatever line happened to be last.
function summaryLine(label, output) {
  const lines = output.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim().length).map((l) => l.trim());
  if (!lines.length) return { summary: "(no output)", found: false };

  // 1. The convention: the last non-empty line, if it is shaped like a verdict.
  const last = lines[lines.length - 1];
  if (CONVENTION.test(last)) return { summary: last, found: true };

  // 2. A declared extractor for a step that cannot follow the convention.
  const declared = DECLARED_SUMMARY[label];
  if (declared) {
    for (let i = lines.length - 1; i >= 0 && i >= lines.length - WINDOW; i--) {
      if (declared.pattern.test(lines[i])) return { summary: lines[i], found: true };
    }
  }

  // 3. No verdict found. Say so, and show the last line as context rather than as the answer.
  return { summary: `NO VERDICT LINE FOUND \u2014 last line was: ${last}`, found: false };
}

const results = [];
let anyFail = false;

console.log("\nGATE REPORT \u2014 running the full check gate, in order\n" + "=".repeat(64));
for (const step of steps) {
  const { label, cmd, kind } = classify(step);
  const t0 = Date.now();
  let ok = true;
  let out = "";
  try {
    out = execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    ok = false;
    out = (e.stdout || "") + (e.stderr || "");
  }
  const ms = Date.now() - t0;
  if (!ok) anyFail = true;
  let summary, found = true;
  if (kind === "suite") ({ summary, found } = summaryLine(label, out));
  else summary = ok ? `${label} \u2014 built clean` : `${label} \u2014 FAILED`;
  results.push({ label, kind, ok, ms, summary, found });
  const mark = ok ? "\u2713" : "\u2717";
  const flag = found ? "" : "\u26a0 ";
  console.log(`${mark} ${label.padEnd(20)} ${String(ms).padStart(6)}ms  ${flag}${summary}`);
}

console.log("=".repeat(64));
const suites = results.filter((r) => r.kind === "suite");
const passed = results.filter((r) => r.ok).length;
const totalMs = results.reduce((a, r) => a + r.ms, 0);
console.log(`${results.length} steps \u2014 ${suites.length} suites + ${results.length - suites.length} builds \u2014 ${passed}/${results.length} passed \u2014 ${(totalMs / 1000).toFixed(1)}s total`);

// An unreadable verdict is not a gate failure — the step passed or it didn't, and that is measured
// separately. But it IS a failure of this runner to report, so it is named rather than swallowed.
const unread = results.filter((r) => r.kind === "suite" && !r.found);
if (unread.length) {
  console.log(`\n\u26a0 REPORT NOTE: ${unread.length} step(s) emitted no readable verdict: ${unread.map((r) => r.label).join(", ")}`);
  console.log("  Either have the suite end with a `NAME: verdict` line, or add a declared extractor");
  console.log("  to DECLARED_SUMMARY in this file with a written reason. The gate colour above is");
  console.log("  unaffected \u2014 this is the report saying it could not read, not the suite failing.");
}

// Machine-readable artifact for anything that wants to consume it (a UI badge, a CI summary, future
// tooling). Written next to the harness; overwritten each run.
const report = {
  ranAt: new Date().toISOString(),
  ok: !anyFail,
  totalMs,
  unreadableVerdicts: unread.map((r) => r.label),
  steps: results.map((r) => ({ suite: r.label, kind: r.kind, passed: r.ok, ms: r.ms, summary: r.summary, verdictRead: r.found })),
};
fs.writeFileSync(path.join(ROOT, "harness", "last_report.json"), JSON.stringify(report, null, 2));
console.log("\nWrote harness/last_report.json");

if (anyFail) { console.log("\nGATE REPORT: RED \u2014 one or more steps failed (see \u2717 above)"); process.exit(1); }
console.log("\nGATE REPORT: GREEN \u2014 every step passed");
