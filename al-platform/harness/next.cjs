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
//
// B-41 (30 Jul): this class was written WITHOUT the `u` flag, so it was not a class of three marks —
// it was a class of four UTF-16 code UNITS: ✅, ⬜, and the two halves of 🔨 (\uD83D\uDD28). A lone
// lead surrogate matches the lead half of ANY character in its block, so 📕, 🗿 and 🚀 all counted as
// roadmap rows while 🎯 (lead \uD83C) did not. An arbitrary line, invisibly drawn. The `u` flag makes
// the class mean the three characters it appears to mean.
//
// The marks are also partitioned EXHAUSTIVELY now. Previously `done` and `open` were two independent
// filters, so a 🔨 row belonged to neither and simply vanished from the work-state line — the counts
// would no longer sum to the row count, and nothing said so. Same defect class as B-40: a count that
// can be quietly incomplete. The partition is asserted instead.
const MARK = { "\u2705": "done", "\u2b1c": "open", "\uD83D\uDD28": "wip" };
const rowRe = /^\s*\d+\.\s*(\u2705|\u2b1c|\uD83D\uDD28)/u;
const numbered = [];
for (const l of roadmap.split("\n")) {
  const m = rowRe.exec(l);
  if (m) numbered.push({ line: l, state: MARK[m[1]] });
}
const subjDone = numbered.filter((r) => r.state === "done").length;
const subjOpen = numbered.filter((r) => r.state === "open").length;
const subjWip = numbered.filter((r) => r.state === "wip").length;
// Every row carries exactly one known mark by construction; if that ever stops being true the driver
// is reporting a partial count, which is worse than reporting none. It says so rather than shipping it.
const subjPartitionOk = subjDone + subjOpen + subjWip === numbered.length;

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
  // SELECTION HIERARCHY (Frank's ruling, 30 Jul; corrected same day).
  //
  // The first version of this block claimed "region first, then thinnest DMG category, interlock as
  // tiebreak" — and computed ONLY the region. The category tier existed as a sentence in the `why`
  // output with no code behind it: a described thing, not a delivered one. Frank caught it. The
  // category split is the DMG's own ("a legend, a known event or location, a person of significance,
  // a type of creature, or a famous object"), and it is not a global nicety — it must hold INSIDE
  // each region, or a bastion in Avernus reads five famous objects and never meets a person.
  //
  // THREE TIERS, each derived:
  //   1. REGION   — the storyline region with the fewest sourced subjects, among those still open.
  //   2. CATEGORY — within that region, the DMG category with the fewest sourced, among those that
  //                 still have an open row THERE. A category with no open row in the region cannot
  //                 be worked, and recommending it is advice that cannot be taken.
  //   3. DEPTH    — among the open rows in that region AND category, author the subject with the
  //                 LONGEST, most in-depth source article first. Rationale: a thin wiki page cannot
  //                 honestly fill 20 facts, so the die floats below 20 and the subject ships
  //                 half-built. Taking the deep sources first maximises real yield and defers the
  //                 thin ones until their thinness is a measured fact rather than a surprise.
  //
  // TIER 3 IS NOT MECHANISED, AND THE OUTPUT SAYS SO. Article depth cannot be measured from here —
  // it needs the page. So this block NAMES the eligible candidates and states the rule; the depth
  // comparison happens at authoring time. That is a deliberate line: after B-47, this driver does not
  // print a tier it has not computed. Listing candidates IS computed; ranking them is not, and it is
  // labelled as the author's step rather than dressed up as a finding.
  // Interlock survives only as a tiebreak between candidates equal on all three.
  const CATS = ["LEGEND / MYTH", "EVENT OR LOCATION", "PERSON OF SIGNIFICANCE", "TYPE OF CREATURE", "FAMOUS OBJECT"];
  const SHORT = { "LEGEND / MYTH": "legend", "EVENT OR LOCATION": "location", "PERSON OF SIGNIFICANCE": "person", "TYPE OF CREATURE": "creature", "FAMOUS OBJECT": "object" };
  const entries = [];
  let cat = null;
  for (const line of roadmap.split("\n")) {
    const h = /^##\s+([A-Z /]+?)\s+\(\d+\)/.exec(line);
    if (h && CATS.includes(h[1].trim())) cat = h[1].trim();
    const m = /^(\d+)\.\s+(\u2705|\u2b1c|\uD83D\uDD28)\s+\*\*(.+?)\*\*(?:\s+\u00b7\s+`(\w+)`)?/u.exec(line);
    if (m && m[4] && cat) entries.push({ done: m[2] === "\u2705", label: m[3].trim(), region: m[4], cat });
  }

  const regions = [...new Set(entries.map((e) => e.region))];
  const sourcedIn = (r) => entries.filter((e) => e.region === r && e.done).length;
  const openIn = (r) => entries.filter((e) => e.region === r && !e.done).length;

  // ---- tier 1: thinnest region that still has open rows ----------------------------------------
  const workable = regions.filter((r) => openIn(r) > 0);
  const closed = regions.filter((r) => openIn(r) === 0);
  const floor = workable.length ? Math.min(...workable.map(sourcedIn)) : 0;
  const tiedRegions = workable.filter((r) => sourcedIn(r) === floor).sort();
  const pick = tiedRegions[0];

  if (pick) {
    // ---- tier 2: thinnest category INSIDE that region, restricted to ones with an open row -------
    const inRegion = entries.filter((e) => e.region === pick);
    const catDone = {}, catOpen = {};
    CATS.forEach((c) => { catDone[c] = 0; catOpen[c] = 0; });
    inRegion.forEach((e) => { if (e.done) catDone[e.cat]++; else catOpen[e.cat]++; });
    const workableCats = CATS.filter((c) => catOpen[c] > 0);
    const catFloor = workableCats.length ? Math.min(...workableCats.map((c) => catDone[c])) : 0;
    const tiedCats = workableCats.filter((c) => catDone[c] === catFloor);
    // ---- tier 3: name the eligible candidates; depth is compared at authoring time ---------------
    const cands = inRegion.filter((e) => !e.done && tiedCats.includes(e.cat)).map((e) => e.label);

    candidates.push({
      step: `Author the next Library subject batch (${subjDone} done, ${subjOpen} open) — in \`${pick}\`, category: ${tiedCats.map((c) => SHORT[c]).join(" or ")}`,
      why: [
        `work-state: ${subjDone}/${numbered.length} subjects sourced`,
        `tier 1 region: \`${pick}\` at ${floor} sourced${tiedRegions.length > 1 ? ` (tied: ${tiedRegions.join(", ")})` : ""}${closed.length ? ` · closed: ${closed.join(", ")}` : ""}`,
        `tier 2 category in \`${pick}\`: ${tiedCats.map((c) => `${SHORT[c]} ${catDone[c]}`).join(", ")} sourced — thinnest with an open row there`,
        `tier 3 candidates (author the DEEPEST source first — not measurable here, compare at authoring time): ${cands.join(" · ")}`,
        "profile (course-correct on imbalance): region, then category within region, then richest source; interlock only breaks ties",
      ],
      weight: 40,
    });
  }
}

candidates.sort((a, b) => b.weight - a.weight);
const top3 = candidates.slice(0, 3);

// ---- render ----------------------------------------------------------------------------
console.log("\nNEXT \u2014 project triage\n" + "=".repeat(66));
console.log("\n[1] WORK-STATE");
console.log(`    facilities: ${facLine}`);
console.log(`    library:    ${subjDone} of ${numbered.length} subjects done, ${subjOpen} open${subjWip ? `, ${subjWip} in progress` : ""}`);
if (!subjPartitionOk) {
  console.log(`    \u26a0 the ${numbered.length} roadmap rows do not partition into done/open/in-progress`);
  console.log("      (" + [subjDone, subjOpen, subjWip].join(" + ") + " = " + (subjDone + subjOpen + subjWip) + ") — this count is INCOMPLETE, do not order work from it");
}
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
