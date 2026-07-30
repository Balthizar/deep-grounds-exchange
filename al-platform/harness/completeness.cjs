// ============================================================================
// COMPLETENESS DETECTOR — derives which subsystems are UNFINISHED from the structure of the
// codebase itself, so the `next` driver never depends on a hand-seeded list (a seeded list only
// catches what the user REMEMBERED to seed — useless against the thing they forgot they left open).
//
// The reasoning chain, each link checkable from source (no assertion, no memory):
//   1. a tool declares an INTENDED target in the code (e.g. "grows to the chosen 100");
//   2. its ACTUAL extent is measurable (how many subjects are actually registered);
//   3. actual << intended  =>  the TOOL is unfinished;
//   4. a subsystem that DEPENDS on that tool (the dependency edge is in the source) is, by
//      transitivity, itself unfinished.
// Plus one honest lexical signal: a user-facing "coming next / coming soon / not yet available"
// string is a promise to the user that something is incomplete — real, unlike a code comment.
//
// Everything returned carries the file:line it was read from, so the driver's citation is truthful.
// ============================================================================
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const readFile = (rel) => { try { return fs.readFileSync(path.join(ROOT, rel), "utf8"); } catch { return ""; } };

// --- structural probe: declared target vs actual count for the library subject generator ---------
function libraryGenerator() {
  const src = readFile("src/data/library_subjects.ts");
  // (1) declared target — find the number in the "grows to the chosen N" declaration
  let intended = null, intendedAt = null;
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/grows to the chosen (\d+)|chosen (\d+)|intended[^0-9]*(\d+)|target[^0-9]*(\d+)/i);
    if (m) { intended = Number(m[1] || m[2] || m[3] || m[4]); intendedAt = `src/data/library_subjects.ts:${i + 1}`; break; }
  }
  // (2) actual count — load the registry and count it (runtime truth, not a static guess)
  let actual = null;
  try {
    fs.writeFileSync(path.join(ROOT, "src/__cd.tsx"), 'export { LIBRARY_SUBJECTS } from "./data/library_subjects";');
    execSync("npx --no-install esbuild src/__cd.tsx --bundle --format=cjs --outfile=./__cd.cjs --loader:.tsx=tsx --loader:.json=json --jsx=automatic", { cwd: ROOT, stdio: "ignore" });
    const mod = require(path.resolve(ROOT, "__cd.cjs"));
    actual = Object.keys(mod.LIBRARY_SUBJECTS || {}).length;
  } catch { /* leave null; reported as unknown */ }
  finally {
    fs.rmSync(path.join(ROOT, "src/__cd.tsx"), { force: true });
    fs.rmSync(path.join(ROOT, "__cd.cjs"), { force: true });
  }
  return { intended, intendedAt, actual };
}

// --- dependency edge: does the library facility USE the generator? (read from source) ------------
function libraryUsesGenerator() {
  const eng = readFile("src/bastion/engine.ts");
  const lines = eng.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (/composeLibraryParagraph\(|librarySubjectFor\(|anyLibrarySubject\(/.test(lines[i])) {
      return { uses: true, at: `src/bastion/engine.ts:${i + 1}` };
    }
  }
  return { uses: false, at: null };
}

// --- honest lexical signal: user-facing "coming next" promises (NOT code comments/flavor) --------
function comingNextPromises() {
  const out = [];
  const uiFiles = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = path.join(dir, e.name);
      if (e.isDirectory()) walk(rel);
      else if (/\.(tsx|ts)$/.test(e.name)) uiFiles.push(rel);
    }
  })("src");
  for (const f of uiFiles) {
    const lines = readFile(f).split("\n");
    for (let i = 0; i < lines.length; i++) {
      // a promise to the USER: the phrase inside a JSX/string context, not a // comment or flavor table
      if (/coming next|coming soon|not yet available|not available yet/i.test(lines[i]) && !/^\s*\/\//.test(lines[i])) {
        out.push({ at: `${f}:${i + 1}`, text: lines[i].trim().replace(/\s+/g, " ").slice(0, 100) });
      }
    }
  }
  return out;
}

// --- synthesize: list of unfinished subsystems, each with its derivation cited -------------------
function detectUnfinished() {
  const findings = [];

  const gen = libraryGenerator();
  if (gen.intended != null && gen.actual != null && gen.actual < gen.intended) {
    const dep = libraryUsesGenerator();
    const why = [
      `declared target: ${gen.intended} subjects (${gen.intendedAt})`,
      `actual registered: ${gen.actual} \u2014 ${gen.actual} < ${gen.intended}, so the subject generator is UNFINISHED`,
    ];
    if (dep.uses) why.push(`the library facility DEPENDS on the generator (${dep.at}) \u2014 so the library subsystem is unfinished by transitivity`);
    findings.push({
      subsystem: "library",
      tool: "subject / book generator",
      derived: true,
      why,
    });
  }

  for (const p of comingNextPromises()) {
    findings.push({
      subsystem: "(user-facing)",
      tool: "an incomplete feature",
      derived: true,
      why: [`user-facing "coming next" promise at ${p.at}: ${p.text}`],
    });
  }

  return findings;
}

module.exports = { detectUnfinished, libraryGenerator, libraryUsesGenerator, comingNextPromises };

// runnable standalone for inspection
if (require.main === module) {
  console.log("\nCOMPLETENESS DETECTOR \u2014 unfinished subsystems, derived from code\n" + "=".repeat(64));
  const f = detectUnfinished();
  if (!f.length) console.log("  none detected");
  for (const x of f) {
    console.log(`\n  ${x.subsystem} \u2014 ${x.tool}  ${x.derived ? "[derived from structure]" : ""}`);
    x.why.forEach((w) => console.log(`     \u2937 ${w}`));
  }
  console.log("");
}
