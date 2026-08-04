// LIVE-DATA TEST SAMPLER (Frank's design, 27 Jul).
//
// The derivation layer (harness/transitions.cjs) proves each guard fires against ONE
// representative of a type. This proves it fires across the REAL SPREAD of shapes the data
// actually contains — the awkward member of the class that a single representative hides: the DM
// who also owns a store, the character whose owner was deactivated mid-season, the org with zero
// listed stores. A sample of one proves the guard exists; a sample of two hundred proves it
// holds across the population.
//
// FOUR RULINGS BAKED IN (Frank, 27 Jul):
//
//   CONSENT IS A HARD GATE, CHECKED FIRST. An account carries testingOptIn, OFF by default. No
//   opt-in, no eligibility — a non-consenting account is invisible to the sampler entirely,
//   never entered into any bucket regardless of how thin that bucket is. "I cannot stand systems
//   that automatically opt you into things, so I would never do that to somebody."
//
//   STRATIFIED, NOT FIRST-N. "A scientific experiment doesn't pull the first 200 people who
//   walked through the door." First-200-by-id is just the oldest accounts — a biased sample that
//   never tests newer-account behaviour. Instead bucket the consenting population by creation
//   cohort (month) and character-count band, then draw a fixed quota per bucket up to the cap.
//   Sorted within each bucket, so a red gate points at the same accounts every run (reproducible,
//   which "gate green always" requires).
//
//   REPORT COVERAGE HONESTLY. Output states the SHAPE of what was tested — how many per cohort,
//   which buckets came up thin or empty — so an under-represented class is visibly under-tested
//   because the DATA is thin, not silently passed as robust.
//
//   ANONYMIZED FAILURES. A failure references the DERIVED SHAPE and the axes ("a certified DM, 3
//   characters, created 2026-02, no home store") — never a name, character name, note, or record
//   contents. "We only care about how the account performs and what portion of it fails." The
//   harness has no path to personal fields, so it cannot leak what it cannot reach.
//
// This module builds on the SAME derivation helpers as transitions.cjs: an assertion here names
// a TYPE of account and the sampler feeds it every account of that type. If a literal seed id had
// survived the sweep, it would break the instant loadDataset() returns something other than the
// demo — which is the whole reason the sweep came first.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
process.chdir(root);

// ---- BUILD THE REDUCER BUNDLE (same pattern as the other suites) -----------------------------
const stamp = "__sampler";
fs.writeFileSync(`src/${stamp}.tsx`, fs.readFileSync("src/app.tsx", "utf8") + `\nexport const __s = { reducer, seed, ACCOUNTS };`);
try {
  execSync(`npx --no-install esbuild src/"${stamp}".tsx --bundle --format=cjs --outfile=./"${stamp}".cjs --external:react --external:react-dom --loader:.tsx=tsx --loader:.json=json --jsx=automatic`, { stdio: "ignore" });
} catch (e) { console.log("SAMPLER: build failed"); process.exit(1); }
const { reducer, seed, ACCOUNTS } = require(path.resolve(`${stamp}.cjs`)).__s;
// Bridge: the demo carries accounts as a module const; the live export will carry them in
// state.accounts. Build an accounts map from whichever is present so downstream reads one shape.
const ACCOUNTS_MAP = Object.fromEntries((ACCOUNTS || []).map((a) => [a.id, a]));
const cleanup = () => { for (const f of [`src/${stamp}.tsx`, `${stamp}.cjs`]) try { fs.rmSync(f, { force: true }); } catch {} };
process.on("exit", cleanup);

// ==============================================================================================
// loadDataset() — THE SEAM. Today it returns seed(). In the live environment this is swapped for
// a read-only export of consenting accounts and their records. Everything downstream is written
// against whatever shape this returns, precisely because the derivation layer names no ids. When
// the live export lands, ONLY this function changes; the stratifier, the assertions, and the
// reporter are already correct.
//
// Contract: returns an AppState-shaped object. Personal fields (names, notes) may be present in
// the object but this module NEVER reads them — see the anonymize() boundary below.
// ==============================================================================================
function loadDataset() {
  // TODO(live): replace with the read-only consenting-accounts export. Until then, the demo seed
  // stands in — it exercises every code path in this file against a known-small population.
  return seed();
}

// ---- CONSENT GATE (checked FIRST, before any bucketing) --------------------------------------
// An account is eligible only if it exists in ACCOUNTS-equivalent form AND testingOptIn === true.
// The dataset's accounts live in state.accounts if present, else we fall back to the role table's
// keys (demo shape). Either way, opt-in is required; absence of the flag means NOT opted in.
function accountsOf(state) {
  // Prefer the live export's in-state accounts; fall back to the demo module const.
  return (state.accounts && Object.keys(state.accounts).length) ? state.accounts : ACCOUNTS_MAP;
}
function consentingAccounts(state) {
  const accs = accountsOf(state);
  // Hard gate: only an explicit true opts in. Missing / false / undefined => excluded.
  return Object.keys(accs).filter((id) => accs[id] && accs[id].testingOptIn === true);
}

// ---- STRATIFICATION AXES ---------------------------------------------------------------------
// Cohort by creation month, and character-count band. Both derived from the record, never named.
function creationCohort(state, acctId) {
  const a = accountsOf(state)[acctId];
  const d = a && a.createdAt ? String(a.createdAt).slice(0, 7) : "unknown";   // YYYY-MM
  return d;
}
function charCountBand(state, acctId) {
  const n = Object.values(state.characters || {}).filter((c) => c.ownerId === acctId).length;
  if (n === 0) return "0";
  if (n <= 2) return "1-2";
  if (n <= 5) return "3-5";
  return "6+";
}
function rolesOf(state, acctId) {
  return (state.roles[acctId] || []).slice().sort().join("+") || "player";
}

// The bucket key is the cross-product of the axes. Quota is per bucket.
function bucketKey(state, acctId) {
  return `${creationCohort(state, acctId)} | ${charCountBand(state, acctId)} chars | ${rolesOf(state, acctId)}`;
}

// ---- THE STRATIFIED DRAW ---------------------------------------------------------------------
// Bucket the consenting population, then take up to PER_BUCKET from each (sorted for
// reproducibility) until the global CAP is reached. Returns the drawn ids PLUS the full bucket
// census, so the reporter can flag thin buckets.
const CAP = 200;
const PER_BUCKET = 10;   // "it can select 10 from each category of account" — Frank

function stratifiedSample(state) {
  const consenting = consentingAccounts(state);
  const buckets = {};
  for (const id of consenting) {
    const k = bucketKey(state, id);
    (buckets[k] = buckets[k] || []).push(id);
  }
  // Sort bucket keys and members for a deterministic draw.
  const drawn = [];
  const census = {};
  for (const k of Object.keys(buckets).sort()) {
    const members = buckets[k].slice().sort();
    census[k] = { available: members.length, taken: 0 };
    for (const id of members) {
      if (drawn.length >= CAP) break;
      if (census[k].taken >= PER_BUCKET) break;
      drawn.push(id);
      census[k].taken++;
    }
  }
  return { drawn, census, totalConsenting: consenting.length };
}

// ---- ANONYMIZE (the privacy boundary) --------------------------------------------------------
// The ONLY function that turns an account into text for the report. It reads axes, never
// identity. No name, no character names, no notes, no record contents ever cross this line.
function anonymize(state, acctId) {
  return `[${rolesOf(state, acctId)}, ${charCountBand(state, acctId)} chars, created ${creationCohort(state, acctId)}]`;
}

// ==============================================================================================
// THE ASSERTIONS. Each names a TYPE and runs against every sampled account of that type. These
// are population-level invariants — properties that must hold for EVERY account, so feeding 200
// real ones is exactly the point. Written against derived subjects, never ids.
// ==============================================================================================
let checks = 0, fails = 0;
const failuresByShape = {};
const okAcct = (state, acctId, cond, prop) => {
  checks++;
  if (!cond) {
    fails++;
    const shape = anonymize(state, acctId);
    (failuresByShape[prop] = failuresByShape[prop] || []).push(shape);
  }
};

function runAssertions(state, acctId) {
  // PROPERTY 1: an account may never act on a character it does not own. Pick a character NOT
  // owned by this account; a representative action must be refused.
  const notMine = Object.values(state.characters).find((c) => c.ownerId !== acctId && !(state.roles[acctId] || []).includes("admin"));
  if (notMine) {
    const before = JSON.stringify(state.characters[notMine.id]);
    const after = reducer(state, { type: "SET_BIO", charId: notMine.id, by: acctId, text: "intrusion" });
    okAcct(state, acctId, JSON.stringify(after.characters[notMine.id]) === before,
           "cannot edit a character they do not own");
  }

  // PROPERTY 2: a non-admin cannot grant itself a role. This is the privilege-escalation guard,
  // and it must hold for every non-admin in the population, not just the demo one.
  if (!(state.roles[acctId] || []).includes("admin")) {
    const after = reducer(state, { type: "GRANT_ROLE", accountId: acctId, role: "admin", by: acctId });
    okAcct(state, acctId, !(after.roles[acctId] || []).includes("admin"),
           "cannot grant itself the admin role");
  }

  // PROPERTY 3: a non-admin cannot moderate (ban) another account.
  if (!(state.roles[acctId] || []).includes("admin")) {
    const victim = Object.keys(state.roles).find((a) => a !== acctId);
    if (victim) {
      const after = reducer(state, { type: "BAN_USER", acc: victim, by: acctId, days: 7 });
      okAcct(state, acctId, !((after.mod && after.mod.bans) || {})[victim],
             "cannot ban another account");
    }
  }
}

// ==============================================================================================
// RUN
// ==============================================================================================
const dataset = loadDataset();
const { drawn, census, totalConsenting } = stratifiedSample(dataset);

for (const acctId of drawn) runAssertions(dataset, acctId);

// ---- REPORT ----------------------------------------------------------------------------------
console.log(`\n  SAMPLER — stratified live-data test`);
console.log(`  consenting accounts : ${totalConsenting}`);
console.log(`  sampled             : ${drawn.length} (cap ${CAP}, up to ${PER_BUCKET} per bucket)`);
console.log(`  assertions run      : ${checks}`);

// Coverage of the sample itself: which buckets, and which came up thin. A bucket that hit its
// PER_BUCKET quota is well-sampled; one that emptied below quota is under-represented in the DATA.
const bucketKeys = Object.keys(census).sort();
const thin = bucketKeys.filter((k) => census[k].available < PER_BUCKET);
console.log(`  buckets             : ${bucketKeys.length} (${thin.length} under-represented)`);
for (const k of bucketKeys) {
  const c = census[k];
  const flag = c.available < PER_BUCKET ? "  ⚠ thin" : "";
  console.log(`      ${k}  —  ${c.taken}/${c.available} tested${flag}`);
}

if (fails) {
  console.log(`\n  FAILURES (anonymized — shape only, never identity):`);
  for (const prop of Object.keys(failuresByShape)) {
    console.log(`    "${prop}" failed for:`);
    for (const shape of failuresByShape[prop]) console.log(`        ${shape}`);
  }
  console.log(`\nSAMPLER: ${fails} of ${checks} population checks FAILED`);
  process.exit(1);
}

console.log(`\nSAMPLER: all ${checks} population checks passed across ${drawn.length} sampled accounts`);
process.exit(0);
