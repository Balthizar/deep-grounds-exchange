#!/usr/bin/env node
// ============================================================================================
// LEDGER SUITE (29 Jul) — the hand-maintained ledger is gated against the live registry.
//
// WHY THIS EXISTS (B-39). `LIBRARY_SUBJECTS_100.md` is not decoration: `npm run next` reads it as
// its work-state input and orders the whole project's next step from it. It is also maintained by
// hand, which means it can drift from the code it describes — and it had. Three ways at once:
//
//   1. `frost_giants` was authored and registered while its ledger row still read ⬜.
//   2. `order_of_the_gauntlet` and `emerald_enclave` were authored and registered with NO numbered
//      row at all — ticked only in a prose paragraph, invisible to any row count.
//   3. Stray ✅/⬜ glyphs in the legend line and that prose paragraph made a raw grep report 23,
//      a numbered-row parse report 21, and the registry hold 24. Three counts, one file.
//
// The result: the triage driver reported "21 subjects done" and, in the same run, cited "actual
// registered: 24". A driver whose inputs disagree with each other cannot order anything.
//
// PRINCIPLE (COMPILER_PRINCIPLES, parser discipline): never accept the first count — verify two
// independent ways. This suite IS the second way, run every gate. The doc is one statement of the
// facts; the bundled registry is the other; they must agree exactly, by id, not by total.
//
// A total-only check would have passed all three failures above the moment somebody fixed the
// number by hand. So the comparison is set-vs-set on identity.
// ============================================================================================
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DOC = "LIBRARY_SUBJECTS_100.md";

let failures = 0;
let pendingRatchet = null;   // written only on a green run — see PART FOUR rule 4
const fail = (msg) => { failures++; console.log("  \u2717 " + msg); };
const pass = (msg) => console.log("  \u2713 " + msg);

// ---- (a) the doc: parse ONLY numbered rows; prose and legends are not ledger entries ------------
// The three marks are ✅ done, ⬜ to source, 🔨 in progress. 🔨 must be recognised HERE even though it
// means "not done" — an unrecognised mark makes the row invisible, and an invisible row reads as a
// numbering gap. The suite would then fail for a phantom reason and hide the real state of the file.
// Written as an alternation with the `u` flag rather than a character class: 🔨 is a surrogate pair,
// and a class without `u` matches its halves against unrelated characters (B-41).
const docText = fs.readFileSync(path.join(ROOT, DOC), "utf8");
const MARKS = { "\u2705": "done", "\u2b1c": "open", "\uD83D\uDD28": "wip" };
const rows = [];
for (const line of docText.split("\n")) {
  // Region is captured by the SAME parser that captures the row, so Part Four can never disagree
  // with Parts One-Three about which rows exist. It is optional in the pattern: a row missing its
  // region tag must still be seen and counted, then reported as missing, rather than vanishing.
  const m = /^(\d+)\.\s+(\u2705|\u2b1c|\uD83D\uDD28)\s+\*\*(.+?)\*\*(?:\s+\u00b7\s+`(\w+)`)?/u.exec(line);
  if (m) rows.push({ n: Number(m[1]), state: MARKS[m[2]], done: m[2] === "\u2705", label: m[3].trim(), region: m[4] || null });
}

// ---- (b) the code: bundle and measure the LIVE registry (never a source scan — P1) -------------
function liveSubjects() {
  const shim = path.join(ROOT, "src", "__ledger.tsx");
  const out = path.join(ROOT, "ledger.cjs.tmp.cjs");
  fs.writeFileSync(shim, 'export { LIBRARY_SUBJECTS, LIBRARY_ASPECTS } from "./data/library_subjects";');
  try {
    execSync(`npx --no-install esbuild "${shim}" --bundle --format=cjs --outfile="${out}" --loader:.tsx=tsx --loader:.json=json --jsx=automatic`, { stdio: "pipe" });
    const m = require(out);
    return { SUBJECTS: m.LIBRARY_SUBJECTS, LIBRARY_ASPECTS: m.LIBRARY_ASPECTS };
  } finally {
    fs.rmSync(shim, { force: true });
    fs.rmSync(out, { force: true });
  }
}
let SUBJECTS, LIBRARY_ASPECTS;
try { ({ SUBJECTS, LIBRARY_ASPECTS } = liveSubjects()); }
catch (e) { console.log("LEDGER: bundle failed\n" + (e.stderr ? e.stderr.toString() : e.message)); process.exit(1); }

// Match on label, normalised — the doc is prose, the registry is data, and a leading article or a
// curly apostrophe is not a difference worth failing over. Everything else is.
const norm = (s) => s.toLowerCase()
  .replace(/[\u2018\u2019\u2032]/g, "'")
  .replace(/^the\s+/, "")
  .replace(/[^a-z0-9]/g, "");

const registered = Object.values(SUBJECTS).map((s) => ({ id: s.id, label: s.label, key: norm(s.label) }));

// Identity matching is by label, so a label used twice on EITHER side collapses two things into one
// and the set comparison stops meaning anything. Both sides are checked.
const regSeen = new Map();
for (const s of registered) {
  if (regSeen.has(s.key)) fail(`two registered subjects share the label "${s.label}" (${regSeen.get(s.key)} and ${s.id}) — identity matching is by label, so give one a distinguishing label`);
  else regSeen.set(s.key, s.id);
}

const docByKey = new Map();
for (const r of rows) {
  const k = norm(r.label);
  if (docByKey.has(k)) fail(`rows ${docByKey.get(k).n} and ${r.n} carry the same label "${r.label}" — a machine-read ledger cannot tell them apart; either they are one subject listed twice, or they need distinguishing labels`);
  else docByKey.set(k, r);
}

// ---- 1. structural: contiguous numbering, so a row cannot be lost in a renumber -----------------
const nums = rows.map((r) => r.n);
const contiguous = nums.every((n, i) => n === i + 1);
if (!rows.length) fail(`${DOC} yielded no numbered rows — the parser or the file shape changed`);
else if (!contiguous) {
  const at = nums.findIndex((n, i) => n !== i + 1);
  fail(`ledger numbering is not contiguous — expected ${at + 1}, found ${nums[at]}`);
} else pass(`${DOC} holds ${rows.length} contiguously numbered rows`);

// ---- 2. every REGISTERED subject has a row, and that row is ticked ------------------------------
for (const s of registered) {
  const row = docByKey.get(s.key);
  if (!row) fail(`"${s.label}" (${s.id}) is registered in code but has NO numbered row in ${DOC} — invisible to every row count, including the one \`npm run next\` reads`);
  else if (!row.done) fail(`"${s.label}" (${s.id}) is registered in code but row ${row.n} reads ${row.state === "wip" ? "\uD83D\uDD28 (in progress) \u2014 mark it \u2705 now that it has landed" : "\u2b1c \u2014 the ledger under-reports the work done"}`);
}

// ---- 3. every TICKED row is actually registered — no credit for work that isn't there -----------
const regByKey = new Map(registered.map((s) => [s.key, s]));
for (const r of rows) {
  if (r.done && !regByKey.has(norm(r.label))) {
    fail(`row ${r.n} "${r.label}" is ticked \u2705 but no subject with that label is registered in LIBRARY_SUBJECTS — the ledger claims work that does not exist`);
  }
}

// ---- 4. the two counts must agree exactly ------------------------------------------------------
const ticked = rows.filter((r) => r.done).length;
if (ticked !== registered.length) {
  fail(`ticked rows (${ticked}) \u2260 registered subjects (${registered.length}) — the two independent counts disagree`);
} else pass(`ticked rows and registered subjects agree exactly: ${ticked}`);

// ---- 5. the declared target in code must match the ledger's real size --------------------------
// `harness/completeness.cjs` derives the library's target from the "grows to the chosen N" comment
// and `npm run next` orders work from it, so a stale N there silently mis-sizes the whole subsystem.
const srcText = fs.readFileSync(path.join(ROOT, "src/data/library_subjects.ts"), "utf8").split("\n");
let declared = null, declaredAt = null;
srcText.forEach((line, i) => {
  const m = /grows to the chosen (\d+)/i.exec(line);
  if (m && declared === null) { declared = Number(m[1]); declaredAt = i + 1; }
});
if (declared === null) fail(`no "grows to the chosen N" declaration found in src/data/library_subjects.ts — completeness.cjs derives the library target from it`);
else if (declared !== rows.length) fail(`code declares a target of ${declared} subjects (src/data/library_subjects.ts:${declaredAt}) but the ledger holds ${rows.length} rows`);
else pass(`declared target (${declared}) matches the ledger's row count`);

// ================================================================================================
// PART TWO — FACT-TABLE INTEGRITY (B-43, Frank's ruling 30 Jul)
//
// Part one above gates the hand-maintained ledger against the registry. This part gates the fact
// tables against the ENGINE THAT READS THEM. Different question, same subsystem, and it lives here
// rather than in a fifth suite because the expensive step — bundling the live registry — is already
// paid for above.
//
// WHY THIS EXISTS. `composeLibraryParagraph` draws fact #1 free, then #2 from the facts sharing a
// tag with #1, then #3 from those sharing a tag with #2. That chain is the whole reason two books on
// one subject read like a writer following a thread instead of three unrelated sentences. A fact
// that shares NO tag with any sibling in its own subject can never take part in it: it is an
// isolated node, and every time it is drawn the engine falls back to picking anything. The fallback
// is deliberate and graceful, so nothing breaks loudly — the quality just quietly degrades.
//
// Measuring the corpus by hand on 30 Jul found exactly two such facts (`emerald_enclave` #6 and
// `hags` #17), one of them a fortnight old. Neither was detectable by reading the output; both were
// trivially detectable by set intersection. So it is gated. Unlike the pronoun-referent problem
// there is no false-positive risk here — this checks structure, not intent.
//
// DELIBERATELY NOT CHECKED, both because they would pre-empt rulings that are Frank's:
//   · a floor of 20 facts per subject. The format explicitly permits an honestly-short table for a
//     named-but-shallow subject; whether to allow one is an open question, so gating 20 would decide
//     it by accident.
//   · a statistical threshold on chain integrity (e.g. "≥99% of draws keep both links"). Seed-
//     dependent, therefore flaky, and the isolated-fact check gates the structural CAUSE instead.
// ================================================================================================
const ASPECTS = new Set(LIBRARY_ASPECTS);
const tagsOf = (f) => [f.p].concat(f.s || []);
const shareTag = (a, b) => tagsOf(a).some((t) => tagsOf(b).includes(t));

let isolated = 0, badTag = 0, emptyField = 0, dupFact = 0;
for (const subj of Object.values(SUBJECTS)) {
  const facts = subj.facts || [];
  const seenText = new Map();
  facts.forEach((f, i) => {
    const at = `${subj.id} #${i + 1}`;

    // (a) every tag must be in the controlled vocabulary. A typo'd tag is not a loud error — it
    //     silently removes the fact from every pool that would have matched it, which is how a fact
    //     becomes isolated in the first place.
    for (const t of tagsOf(f)) {
      if (!ASPECTS.has(t)) { badTag++; fail(`${at} carries tag "${t}", which is not in LIBRARY_ASPECTS — a tag outside the vocabulary matches nothing and quietly drops the fact out of the chain`); }
    }

    // (b) a fact needs its sentence and its source. Sourcing discipline is the whole basis of the
    //     corpus; an unsourced sentence is not a fact, it is an assertion.
    if (!f.t || !String(f.t).trim()) { emptyField++; fail(`${at} has no sentence text`); }
    if (!f.src || !String(f.src).trim()) { emptyField++; fail(`${at} has no \`src\` — every fact must name the page it was drawn from`); }

    // (c) no duplicate sentence within a subject: a repeat can be drawn twice into one paragraph.
    if (f.t) {
      const k = String(f.t).trim().toLowerCase();
      if (seenText.has(k)) { dupFact++; fail(`${at} repeats the sentence at ${subj.id} #${seenText.get(k) + 1} — a duplicate can surface twice in one three-fact paragraph`); }
      else seenText.set(k, i);
    }

    // (d) THE ISOLATED-FACT GATE. No shared tag with any sibling => can never chain.
    if (facts.length > 1 && !facts.some((g, j) => j !== i && shareTag(f, g))) {
      isolated++;
      fail(`${at} is ISOLATED — its tags [${tagsOf(f).join(", ")}] are shared by no other fact in "${subj.label}", so the drift chain can never reach it and every draw that lands on it falls back to picking at random. Give it a truthful secondary tag that its siblings already use.`);
    }
  });
}
if (!isolated && !badTag && !emptyField && !dupFact) {
  const nFacts = Object.values(SUBJECTS).reduce((a, s) => a + (s.facts || []).length, 0);
  pass(`fact tables sound: ${nFacts} facts across ${registered.length} subjects — every tag in the vocabulary, every fact sourced, no duplicates, no isolated nodes`);
}

// ================================================================================================
// PART THREE — SOURCE PROVENANCE (B-45, Frank's ruling 30 Jul)
//
// WHY THIS EXISTS. Authoring Batch 11 produced two defects in the Trolls table that reached the file
// and were caught by eye, not by the gate: a declared source constant (`FR_TRT`) that no fact cited,
// and a fact that folded the Mere of Dead Men and Trolltide into one sentence under a single `src`,
// so half of it was attributed to a page it was not read from. `conformance.cjs` checks that a fact
// HAS a source; it has never checked anything about WHICH.
//
// WHAT IS AND IS NOT MECHANISABLE. The question "did this sentence actually come from that page" is
// not decidable here — it needs the page. A cross-citation heuristic was built and measured against
// the whole corpus first: it flags a fact that names the title of some other source declared in the
// same subject. It fired on `weeping_war`, `hags`, `manshoon`, `jarlaxle` and more, every one of them
// correct authoring — a fact about the Weeping War may name Myth Drannor without being sourced from
// the Myth Drannor page. A gate that fires on correct work trains people to ignore it, so it was
// measured, rejected, and is NOT shipped. Recorded so nobody rebuilds it.
//
// WHAT IS SHIPPED is the orphan rule, and it is sufficient for both observed defects: the unused
// constant directly, and the merged fact TRANSITIVELY — folding Trolltide into the Mere sentence is
// what orphaned `FR_TRT` in the first place. A source declared and never cited means either a fact
// went missing or a fact is misattributed. Both are worth stopping for.
// ================================================================================================
{
  const declared = [...srcText.join("\n").matchAll(/const\s+(FR_?\w*)\s*=\s*"([^"]+)"\s*;/g)]
    .map(m => ({ name: m[1], url: m[2] }));
  const cited = new Set();
  for (const s of Object.values(SUBJECTS)) for (const f of s.facts || []) cited.add(f.src);

  // ---- 1. no orphan declarations — a source declared and never cited is a missing or moved fact --
  const orphans = declared.filter(d => !cited.has(d.url));
  if (orphans.length) orphans.forEach(d => fail(`source constant ${d.name} (${d.url}) is declared but cited by no fact — either a fact was dropped or one is attributed to the wrong page`));
  else pass(`no orphan sources: all ${declared.length} declared constants are cited by at least one fact`);

  // ---- 2. one page, one name — an aliased URL can be corrected in one place and not the other ----
  const byUrl = {};
  declared.forEach(d => (byUrl[d.url] = byUrl[d.url] || []).push(d.name));
  const dupes = Object.entries(byUrl).filter(([, ns]) => ns.length > 1);
  if (dupes.length) dupes.forEach(([u, ns]) => fail(`${ns.join(" and ")} both name ${u} — one page must have one constant, or a later correction will land on only one of them`));
  else pass(`no aliased sources: every page is named by exactly one constant`);

  // ---- 3. every cited src is a well-formed wiki path ---------------------------------------------
  const malformed = [];
  for (const [id, s] of Object.entries(SUBJECTS))
    (s.facts || []).forEach((f, i) => { if (!/^[\w.-]+\/wiki\/\S+$/.test(f.src || "")) malformed.push(`${id} fact #${i + 1} (${f.src})`); });
  if (malformed.length) malformed.forEach(m => fail(`malformed source path: ${m}`));
  else pass(`all ${cited.size} cited sources are well-formed wiki paths`);
}

// ================================================================================================
// PART FOUR — REGION DISTRIBUTION (Frank's ruling, 30 Jul)
//
// WHY THIS EXISTS. Subjects were being selected for INTERLOCK — "connects to what is already
// authored" — which is a positive feedback loop into whichever region is densest. Every batch was
// individually well-argued; the aggregate reached 15 Waterdeep rows against 0 for the Dessarin
// Valley, and one bastion region had no Library subject at all. Each step defensible, the trend not.
//
// DERIVED, NOT DECLARED. The twelve storyline regions and the even split are read out of
// `BASTION_REGIONS` via its `storyline` flag, not hand-written here — a declared target cannot audit
// itself. Flipping a flag in bastion.ts retargets this gate, and the two can never disagree.
//
// SHAPE, NOT ASSIGNMENT. The rule is that every storyline region holds floor or ceil of 100/N rows.
// It deliberately does NOT say WHICH regions get the extra row: that is a content decision, and a
// gate that pins it would fail every time Frank moved one subject between two equally valid homes.
// ================================================================================================
{
  const bast = fs.readFileSync(path.join(ROOT, "src/data/bastion.ts"), "utf8");
  const regionDecls = [...bast.matchAll(/\{\s*id:\s*"(\w+)",[^}]*?storyline:\s*(true|false)\s*\}/g)];
  const storyline = regionDecls.filter(m => m[2] === "true").map(m => m[1]);
  const known = regionDecls.map(m => m[1]);

  if (!storyline.length) fail("no storyline regions found in BASTION_REGIONS — the region doctrine cannot be derived");
  else {
    const rowRegions = rows.map(r => r.region);
    const tally = {};
    rowRegions.forEach(r => (tally[r] = (tally[r] || 0) + 1));

    // ---- 1. no row may sit outside the storyline set ------------------------------------------
    const untagged = rows.filter(r => !r.region);
    if (untagged.length) untagged.forEach(r => fail(`row ${r.n} (${r.label}) carries no region tag — every subject must be anchored to a bastion region`));
    const stray = [...new Set(rowRegions.filter(r => r && !storyline.includes(r)))];
    if (stray.length) stray.forEach(r => fail(`roster rows are anchored to '${r}', which is not a storyline region${known.includes(r) ? "" : " and is not a region at all"}`));
    else if (!untagged.length) pass(`every roster row sits in one of the ${storyline.length} storyline regions`);

    // ---- 2. every storyline region must be represented ----------------------------------------
    const empty = storyline.filter(r => !tally[r]);
    if (empty.length) empty.forEach(r => fail(`storyline region '${r}' has no roster rows — a bastion there has nothing to read`));
    else pass(`all ${storyline.length} storyline regions are represented`);

    // ---- 3. the split must be even to within one row -------------------------------------------
    const total = rows.length;
    const lo = Math.floor(total / storyline.length), hi = Math.ceil(total / storyline.length);
    const off = storyline.filter(r => (tally[r] || 0) < lo || (tally[r] || 0) > hi);
    if (off.length) off.forEach(r => fail(`region '${r}' holds ${tally[r] || 0} rows; an even split of ${total} across ${storyline.length} regions allows ${lo}–${hi}`));
    else pass(`roster split evenly: every region holds ${lo}–${hi} of ${total} rows`);

    // ---- 5. the DMG split must hold INSIDE each region, not merely across the roster -------------
    // Frank's ruling, 30 Jul: the five DMG topic types are not a global nicety. A bastion is anchored
    // to ONE region, and its Library draws on that region's subjects — so a region carrying five
    // famous objects and no person of significance gives that player a lopsided shelf no matter how
    // balanced the roster looks in total. Measured before being wired: three cells were empty
    // (baldursgate and moonsea had no creature, swordcoast no person) and were filled by swaps chosen
    // to be globally neutral, so all five categories stayed at exactly 20 while the floor was met.
    //
    // FLOOR ONLY, DELIBERATELY. A ceiling was considered and rejected: waterdeep is closed at 9 of 9
    // with four sourced location rows, so any per-region cap below 4 would be unsatisfiable without
    // destroying authored work. The floor is achievable and is what actually protects the player.
    const CATS = ["LEGEND / MYTH", "EVENT OR LOCATION", "PERSON OF SIGNIFICANCE", "TYPE OF CREATURE", "FAMOUS OBJECT"];
    const grid = {};
    let curCat = null;
    for (const line of docText.split("\n")) {
      const h = /^##\s+([A-Z /]+?)\s+\(\d+\)/.exec(line);
      if (h && CATS.includes(h[1].trim())) curCat = h[1].trim();
      const m = /^(\d+)\.\s+(\u2705|\u2b1c|\uD83D\uDD28)\s+\*\*(.+?)\*\*(?:\s+\u00b7\s+`(\w+)`)?/u.exec(line);
      if (m && m[4] && curCat) grid[`${m[4]}|${curCat}`] = (grid[`${m[4]}|${curCat}`] || 0) + 1;
    }
    const holes = [];
    for (const r of storyline) for (const c of CATS) if (!grid[`${r}|${c}`]) holes.push(`${r} has no '${c}' row`);
    if (holes.length) holes.forEach(h => fail(`region/category gap: ${h} — a bastion there would have that shelf empty`));
    else pass(`the DMG split holds inside every region: all ${storyline.length} regions carry all ${CATS.length} categories`);

    // ---- 4. RATCHET — the sourced spread may never widen ----------------------------------------
    // A fixed threshold would gate red on debt already incurred and block all work until it was paid.
    // A ratchet ships green on today's numbers and still forces convergence, because the only move
    // that passes is authoring where it is thin. It tightens automatically and never loosens.
    const sourced = {};
    storyline.forEach(r => (sourced[r] = 0));
    rows.filter(r => r.done).forEach(r => { if (r.region in sourced) sourced[r.region]++; });
    const vals = storyline.map(r => sourced[r]);
    const spread = Math.max(...vals) - Math.min(...vals);
    const ratchetFile = path.join(ROOT, "harness", "region_spread.json");
    let prev = null;
    try { prev = JSON.parse(fs.readFileSync(ratchetFile, "utf8")).spread; } catch { prev = null; }
    // A RATCHET MUST NEVER LEARN FROM A RUN THAT IS NOT GREEN. The first version wrote the new low
    // the moment it saw one, which meant a ledger that was BROKEN in some other way — a row stripped
    // of its region, a row pointed at a retired region — could compute a spuriously tight spread and
    // lock it in permanently. Restoring the correct file then failed against a floor that had only
    // ever existed in a corrupted state. Found by the suite's own negative tests, which is the only
    // reason it was found at all. The write is now deferred to the end of the run and conditioned on
    // zero failures; the COMPARISON still happens here, so a widening spread is still reported.
    pendingRatchet = { file: ratchetFile, spread, prev };
    if (prev === null) {
      pass(`region spread ratchet will initialise at ${spread} (on a green run)`);
    } else if (spread > prev) {
      fail(`region sourced-spread widened from ${prev} to ${spread} — this batch made the imbalance worse; author in a thin region instead (thinnest: ${storyline.filter(r => sourced[r] === Math.min(...vals)).join(", ")})`);
    } else {
      pass(`region spread ${spread}${spread < prev ? ` — tightens to ${spread} from ${prev} if this run is green` : ` (held at ${prev})`}`);
    }
  }
}

// ================================================================================================
// PART FIVE — DUPLICATE SENTENCES ACROSS THE WHOLE CORPUS (Frank's ruling, 30 Jul)
//
// WHY THIS EXISTS. Part Two catches duplicate sentences WITHIN a subject. Nothing caught them
// ACROSS subjects, and that is where they actually happen: two subjects in one region drawing on
// overlapping sources, authored weeks apart. Measured at 75 subjects, the corpus held three — the
// Codicil rumour stated in both Ythryn and the Codicil, Zariel's solar form in both Zariel and the
// Dark Gift, and the pact in both Strahd and the Curse. All three were mine.
//
// THE FIX WAS DELETION, NOT REWORDING, and that matters. Those pairs genuinely were the same fact
// said twice; paraphrasing one until it slipped under a similarity threshold would have gamed this
// gate rather than fixed the corpus, and left a player reading the same sentence in two books with
// different words on it. The subject that stated it FIRST keeps it.
//
// THRESHOLD, chosen from measurement rather than taste. After the three deletions the highest
// similarity between any two facts in the corpus is 0.43; the three real duplicates ran 0.60-0.72.
// The gate sits at 0.55 — clear of every legitimate pair, below every real one. Exact matches fail
// outright at any length.
// ================================================================================================
{
  const STOP = new Set(("the a an of and to in it its was were that which for with on at by as his her their them he " +
    "she they had have been from but or not is are all one who into out up so no any more than when what there then " +
    "after before over under only still would could").split(" "));
  const keyOf = (t) => new Set(String(t).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(w => w && !STOP.has(w)));
  const jaccard = (a, b) => { let n = 0; for (const x of a) if (b.has(x)) n++; return n / (a.size + b.size - n); };

  const facts = [];
  for (const [id, s] of Object.entries(SUBJECTS)) (s.facts || []).forEach((f, i) => facts.push({ id, n: i + 1, t: f.t, k: keyOf(f.t) }));

  const exact = new Map(); const dupes = []; const near = [];
  for (const f of facts) {
    const e = String(f.t).trim().toLowerCase();
    if (exact.has(e)) dupes.push(`${exact.get(e)} and ${f.id} fact #${f.n} are the SAME sentence`);
    else exact.set(e, `${f.id} fact #${f.n}`);
  }
  for (let i = 0; i < facts.length; i++)
    for (let j = i + 1; j < facts.length; j++) {
      const sim = jaccard(facts[i].k, facts[j].k);
      if (sim >= 0.55) near.push(`${facts[i].id} #${facts[i].n} and ${facts[j].id} #${facts[j].n} are ${(sim * 100).toFixed(0)}% the same sentence — delete the later one, do not reword it`);
    }

  if (dupes.length) dupes.forEach(d => fail(`duplicate fact: ${d}`));
  else pass(`no duplicated sentences: all ${facts.length} facts are distinct across the whole corpus`);

  if (near.length) near.forEach(d => fail(`near-duplicate fact: ${d}`));
  else pass(`no near-duplicates: no two facts anywhere exceed 55% shared wording`);
}

// ---- report ------------------------------------------------------------------------------------
// ---- ratchet persistence: only a fully green run may move the floor ----------------------------
if (!failures && pendingRatchet && (pendingRatchet.prev === null || pendingRatchet.spread < pendingRatchet.prev)) {
  fs.writeFileSync(pendingRatchet.file, JSON.stringify({ spread: pendingRatchet.spread, note: "ratchet: sourced-per-region spread may never increase; written only on a green ledger run" }, null, 2) + "\n");
}

if (failures) {
  console.log(`\nLEDGER: ${failures} failure(s) — ${DOC} and LIBRARY_SUBJECTS have drifted apart`);
  process.exit(1);
}
console.log(`LEDGER: ${DOC} matches the live registry — ${rows.length} rows, ${ticked} sourced, ${rows.length - ticked} open`);
process.exit(0);
