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

// Pull the one-line summary a suite prints (its last non-empty line is, by our convention, the
// "NAME: all N checks passed" summary). For builds there's no summary line; we just note pass/fail.
function summaryLine(output) {
  const lines = output.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim().length);
  if (!lines.length) return "";
  // Prefer a line that looks like a suite summary (UPPERCASE-ish label followed by ':').
  for (let i = lines.length - 1; i >= 0 && i >= lines.length - 4; i--) {
    if (/^[A-Z][A-Z \-]+:/.test(lines[i].trim())) return lines[i].trim();
  }
  return lines[lines.length - 1].trim();
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
  const summary = kind === "suite" ? summaryLine(out) : (ok ? `${label} \u2014 built clean` : `${label} \u2014 FAILED`);
  results.push({ label, kind, ok, ms, summary });
  const mark = ok ? "\u2713" : "\u2717";
  console.log(`${mark} ${label.padEnd(20)} ${String(ms).padStart(6)}ms  ${summary}`);
}

console.log("=".repeat(64));
const suites = results.filter((r) => r.kind === "suite");
const passed = results.filter((r) => r.ok).length;
const totalMs = results.reduce((a, r) => a + r.ms, 0);
console.log(`${results.length} steps \u2014 ${suites.length} suites + ${results.length - suites.length} builds \u2014 ${passed}/${results.length} passed \u2014 ${(totalMs / 1000).toFixed(1)}s total`);

// Machine-readable artifact for anything that wants to consume it (a UI badge, a CI summary, future
// tooling). Written next to the harness; overwritten each run.
const report = {
  ranAt: new Date().toISOString(),
  ok: !anyFail,
  totalMs,
  steps: results.map((r) => ({ suite: r.label, kind: r.kind, passed: r.ok, ms: r.ms, summary: r.summary })),
};
fs.writeFileSync(path.join(ROOT, "harness", "last_report.json"), JSON.stringify(report, null, 2));
console.log("\nWrote harness/last_report.json");

if (anyFail) { console.log("\nGATE REPORT: RED \u2014 one or more steps failed (see \u2717 above)"); process.exit(1); }
console.log("\nGATE REPORT: GREEN \u2014 every step passed");
