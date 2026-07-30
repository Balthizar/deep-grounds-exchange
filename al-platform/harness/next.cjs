// ============================================================================
// NEXT — the triage driver. Formalizes the triage the user and agent have run by hand a dozen times.
//
// It does NOT impose the machine's idea of "best." It synthesizes the same three inputs a human
// triage uses, and shows each in its own column so nothing is silently blended:
//   1. WORK-STATE  — what is done vs open (roadmap, facility ledger, open-questions).
//   2. TEST-STATE  — what the gate/self-check say (harness/last_report.json).
//   3. LOOSE ENDS  — open/pending items that carry NO supporting note (the silent ones — the most
//                    dangerous, and the ones this user most wants surfaced).
// Then it proposes the top three next steps, each with a CITED "why this was chosen" trail, ordered
// with tempering from BEHAVIORAL_PROFILE.md (shown as its own labeled influence, never merged into a
// bare verdict).
//
// HONEST BOUNDARY: this script produces the *synthesis*. The milestone PROMPT ("do you know what's
// next?"), reading whether the reply implies the user is deciding, and the reassurance, are an AGENT
// behavior documented in NEXT_PROTOCOL.md — a script cannot read intent. This file is the part that
// can be mechanized; the protocol file is the part the agent performs.
// ============================================================================
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const read = (f) => { try { return fs.readFileSync(path.join(ROOT, f), "utf8"); } catch { return ""; } };

// ---- 1. WORK-STATE ---------------------------------------------------------------------
const roadmap = read("LIBRARY_SUBJECTS_100.md");
// Count ONLY numbered roadmap entries ("83. ✅ **The Wand of Orcus**"), not every checkmark in the
// file. Prose notes elsewhere (e.g. the AL-faction summary) also use ✅ and were inflating the total
// to 107 against a 100-subject list — a silent miscount. Anchor to the numbered-line shape so stray
// marks in commentary can never corrupt the count again (fix at the source, not by editing the note).
const numbered = roadmap.split("\n").filter((l) => /^\s*\d+\.\s*[✅⬜🔨]/.test(l));
const subjOpen = numbered.filter((l) => /⬜/.test(l)).length;
const subjDone = numbered.filter((l) => /✅/.test(l)).length;

let facLine = "";
try { facLine = execSync("node harness/facility_mint.cjs --status", { cwd: ROOT, encoding: "utf8" }).trim().split("\n").pop().trim(); } catch { facLine = "(facility ledger unavailable)"; }

// ---- 2. TEST-STATE ---------------------------------------------------------------------
let testState = "no gate report on record — run `npm run report` first";
let testGreen = null;
try {
  const rep = JSON.parse(read("harness/last_report.json"));
  testGreen = rep.ok;
  const failed = rep.steps.filter((s) => !s.passed).map((s) => s.suite);
  testState = rep.ok
    ? `GREEN as of ${rep.ranAt} (${rep.steps.length} steps)`
    : `RED as of ${rep.ranAt} — failing: ${failed.join(", ")}`;
} catch { /* keep default */ }

// ---- FINISH-TO-DEPTH: unfinished subsystems DERIVED from code (not a hand-seeded list) ----------
// d13 + the user's ruling: a hand-seeded list only catches what was remembered. The detector derives
// unfinished subsystems from the structure itself — declared target vs actual count, and the
// dependency edges — so it also catches what was FORGOTTEN. Each finding carries its file:line
// citation, so "cited" means truly derived, not a fact injected and read back.
const { detectUnfinished } = require("./completeness.cjs");
let derivedUnfinished = [];
try { derivedUnfinished = detectUnfinished(); } catch { derivedUnfinished = []; }

// ---- 3. LOOSE ENDS: open/pending items with NO supporting note -------------------------
// The sharp, mechanical query. Scan the open-questions and findings-style docs for items that are
// open but carry no status/resolution note. Heuristic and deliberately conservative: it flags, it
// does not decide.
function looseEnds() {
  const ends = [];
  const oq = read("OPEN_QUESTIONS.md");
  // open-question style: a "Q<n>" or "- [ ]" line with no "resolved"/"ruling"/"answer" nearby
  for (const line of oq.split("\n")) {
    const t = line.trim();
    if (/^-?\s*\[ \]/.test(t) || /^Q\d+/i.test(t)) {
      if (!/resolv|ruling|answer|closed|decided/i.test(t)) ends.push(t.replace(/^-?\s*\[ \]\s*/, "").slice(0, 100));
    }
  }
  // roadmap: subjects marked in-progress (🔨 or "partial") but not done
  for (const line of roadmap.split("\n")) {
    if (/🔨|partial|in progress/i.test(line) && !/✅/.test(line)) ends.push("(in progress) " + line.trim().slice(0, 90));
  }
  return ends.slice(0, 8);
}
const ends = looseEnds();

// ---- profile tempering -----------------------------------------------------------------
const profile = read("BEHAVIORAL_PROFILE.md");
const hasProfile = profile.length > 0;

// ---- synthesize the top three, each with a cited why-trail -----------------------------
// Candidate generation is transparent: each candidate carries the OBSERVATIONS (from the three
// inputs) that produced it and the PROFILE tempering that ordered it. Ordering rules come straight
// from the profile's "how to serve this user" section, kept explicit here so the citation is real.
const candidates = [];

if (testGreen === false) {
  candidates.push({
    step: "Fix the RED gate before anything else",
    why: [`test-state: ${testState}`, "profile: this user gates green always; a red gate blocks all other work"],
    weight: 100,
  });
}
// FINISH-TO-DEPTH outranks everything but a red gate (d13/d14). Unfinished subsystems are now DERIVED
// from code by the completeness detector, so the recommendation is genuinely reasoned from evidence
// (declared target vs actual, plus dependency edges) rather than a fact seeded by hand and read back.
for (const u of derivedUnfinished) {
  const label = u.subsystem === "(user-facing)"
    ? `Finish an incomplete user-facing feature \u2014 flagged by a "coming next" promise (derived from code)`
    : `Finish the ${u.subsystem}'s ${u.tool} \u2014 a STARTED, unfinished thing (derived from code)`;
  candidates.push({
    step: label,
    why: [...u.why, "profile (finish-to-completion, d13): an opened subsystem is finished to DEPTH before new breadth is started"],
    weight: 90,
  });
}
if (ends.length) {
  candidates.push({
    step: `Resolve or annotate ${ends.length} untracked loose end(s): ${ends.slice(0, 2).join(" · ")}${ends.length > 2 ? " …" : ""}`,
    why: ["loose-ends: these are open items carrying NO supporting note", "profile (provenance): silent open items are the thing this user most wants surfaced — an unstated status is itself a finding"],
    weight: 80,
  });
}
{
  // Is any subsystem started-but-unfinished? If so, starting NEW breadth (a fresh facility, a fresh
  // batch) is demoted below finishing what's open — the whole point of d13.
  const somethingUnfinished = derivedUnfinished.length > 0;
  const facOpen = /(\d+)\s+to start/.exec(facLine);
  const facInProg = /(\d+)\s+in progress/.exec(facLine);
  if (facInProg && Number(facInProg[1]) > 0) {
    candidates.push({
      step: "Finish the facility currently in progress to its legal ceiling before minting a new one",
      why: [`work-state: ${facLine}`, "profile (finish-to-completion): drive an in-progress subsystem to its ceiling over starting breadth"],
      weight: 70,
    });
  } else if (facOpen && Number(facOpen[1]) > 0) {
    candidates.push({
      step: `Mint the next special facility (${facOpen[1]} of 28 still to start)` + (somethingUnfinished ? " \u2014 only after open tooling is finished" : ""),
      why: [`work-state: ${facLine}`,
            somethingUnfinished
              ? "profile (finish-to-depth, d13): DEMOTED \u2014 minting a new facility is new breadth; a started, unfinished tool must be completed first, and a facility is not 'minted in full' while its book tooling is pending"
              : "profile (finish-to-completion): the facility set is a bounded subsystem near a real ceiling"],
      weight: somethingUnfinished ? 30 : 55,
    });
  }
}
if (subjOpen > 0) {
  candidates.push({
    step: `Author the next Library subject batch (${subjDone} done, ${subjOpen} open) — lean toward the thinnest DMG category`,
    why: [`work-state: ${subjDone}/${subjDone + subjOpen} subjects sourced`, "profile (course-correct on imbalance): keep categories flat, lean away from whatever's ahead"],
    weight: 40,
  });
}

candidates.sort((a, b) => b.weight - a.weight);
const top3 = candidates.slice(0, 3);

// ---- render ----------------------------------------------------------------------------
console.log("\nNEXT \u2014 project triage\n" + "=".repeat(66));
console.log("\n[1] WORK-STATE");
console.log(`    facilities: ${facLine}`);
console.log(`    library:    ${subjDone} subjects done, ${subjOpen} open`);
console.log("\n[2] TEST-STATE");
console.log(`    ${testState}`);
console.log("\n[3] LOOSE ENDS (open items with no supporting note)");
if (ends.length) ends.forEach((e) => console.log(`    \u2022 ${e}`));
else console.log("    (none detected \u2014 every open item carries a note)");
console.log("\n" + "=".repeat(66));
console.log(hasProfile ? "TOP 3 NEXT STEPS (ordered, tempered by BEHAVIORAL_PROFILE.md)\n" : "TOP 3 NEXT STEPS (no profile on file \u2014 ordering is untempered)\n");
if (!top3.length) console.log("  Nothing open detected. Either the project is complete, or the state files need updating.");
top3.forEach((c, i) => {
  console.log(`  ${i + 1}. ${c.step}`);
  c.why.forEach((w) => console.log(`       \u2937 ${w}`));
  console.log("");
});
console.log("=".repeat(66));
console.log("These are candidates for your judgment, not commands. The reasoning above is the");
console.log("citation trail; the profile influence is labeled, not blended. You make the call.");
