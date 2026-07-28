// REACHABILITY GATE (Frank's design, 27 Jul; rebuilt to measure dispatch shape, not raw text).
//
// Every reducer-declared action must be reachable — actually DISPATCHED from some screen — OR
// explicitly declared INTERNAL or PENDING_SCREEN. Nothing sits as dead circuitry that no path
// reaches and no one decided to leave unreached.
//
// WHY THIS WAS REBUILT (the lesson, kept next to the code so it doesn't recur): the first cut
// asked "does the action name appear as a quoted string anywhere in a non-reducer file." That is
// the crude-tool failure — a name in a comment, a type union, or a helper string counts as
// "reachable" though nothing dispatches it. It reported 9 unreachable when the true number was
// larger, a SILENT FALSE-GREEN: exactly the class of bug the harness exists to kill. See
// COMPILER_PRINCIPLES.md, "Measure observed behaviour, not raw source text."
//
// WHAT REACHABLE ACTUALLY MEANS: the action's name appears as a `type:` literal inside one of the
// real dispatch pathways this app uses —
//   (1) a direct  dispatch({ type: "X", ... })  call, or
//   (2) a deferred action object  action: { type: "X", ... }  handed to a confirm modal that
//       dispatches it on confirm.
// Both are genuine dispatches; a bare string elsewhere is not. Ternary branches
// (type: cond ? "A" : "B") are handled — both literals sit in the same call body.
//
// Two declared exceptions (Frank's ruling, 27 Jul):
//   INTERNAL       — dispatched by another reducer/engine, never a screen, and correctly so.
//   PENDING_SCREEN — a real user action whose screen is not built yet; a WORKLIST that empties as
//                    screens ship. Frank: most belong on a plain ACCOUNT-LEVEL surface.
//
// STRICT: fails if any action is neither dispatched nor declared; ALSO fails if a declared
// pending/internal action became dispatched (remove it) or if a declared name matches no reducer
// action (ghost/typo).
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
process.chdir(root);

// ---- DECLARED EXCEPTIONS ---------------------------------------------------------------------
const INTERNAL = new Set([]);

const PENDING_SCREEN = {
  // Account-status surface: SET_MENTOR, SET_PROVISIONAL, GRANT_ROLE, SET_ORG_MEMBERSHIP shipped
  // 27 Jul via AccountAssociations (src/player/ui.tsx) — removed from the worklist, and the gate
  // confirmed the dispatch is real by failing STALE PENDING until they were removed.
  SUBMIT_DM_ITEM:     "DM screen: submit an item awarded at your table",
  VERIFY_DM_ITEM:     "mentor screen: verify a provisional's DM-awarded item",
  REJECT_DM_ITEM:     "mentor screen: reject a provisional's DM-awarded item",
  VERIFY_PAPER_ITEM:  "DM screen: verify an out-of-table (paper) item",
  REJECT_PAPER_ITEM:  "DM screen: reject an out-of-table (paper) item",
  VERIFY_IMPORT_ITEM: "DM screen: verify an imported character item",
  REJECT_IMPORT_ITEM: "DM screen: reject an imported character item",
  VERIFY_SLOT_ITEM:   "DM screen: verify a typed-slot claim",
  REJECT_SLOT_ITEM:   "DM screen: reject a typed-slot claim",
  ROLL_ITEM_SLOT:     "character screen: the roll button for a typed item slot",
  ACCEPT_CHARM_GIFT:      "player screen: accept a charm gifted by another PC",
  LOG_BASTION_NEGLECT:    "DM/admin screen: adjudicate bastion neglect",
  RENAME_FACILITY_HENCHMAN: "bastion screen: name a facility's hireling",
};

// ---- DISCOVER: reducer-declared actions ------------------------------------------------------
const stripComments = (s) => s.replace(/^[ \t]*\/\/.*$/gm, "");
const reducerFiles = [
  ...fs.readdirSync(path.join(root, "src/reducer")).filter((f) => f.endsWith(".ts")).map((f) => `src/reducer/${f}`),
  "src/bastion/actions.ts",
];
const actions = new Set();
for (const f of reducerFiles) {
  for (const m of stripComments(fs.readFileSync(path.join(root, f), "utf8")).matchAll(/case "([A-Z][A-Z0-9_]*)":/g)) actions.add(m[1]);
}

// ---- MEASURE: actions actually DISPATCHED ----------------------------------------------------
function balancedFrom(text, openIdx) {
  let depth = 0, j = openIdx;
  while (j < text.length) {
    const c = text[j];
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) return text.slice(openIdx, j + 1); }
    j++;
  }
  return text.slice(openIdx);
}
function dispatchedTypes(text) {
  const found = new Set();
  const callRe = /\b(?:dispatch|setModal)\(\s*\{/g;
  let m;
  while ((m = callRe.exec(text))) {
    const open = text.indexOf("{", m.index);
    const body = balancedFrom(text, open);
    // type: "X"  and both branches of  type: cond ? "A" : "B"  (the condition may itself contain
    // string literals, e.g.  mode === "scribe" ? "SCRIBE_SCROLL" : "BUY_SCROLL"  — so we match the
    // two BRANCH literals directly rather than trying to skip the condition.
    for (const tm of body.matchAll(/\btype:\s*[^,}?]*\?\s*"([A-Z][A-Z0-9_]*)"\s*:\s*"([A-Z][A-Z0-9_]*)"/g)) {
      found.add(tm[1]); found.add(tm[2]);
    }
    // plain  type: "X"  (non-ternary)
    for (const tm of body.matchAll(/\btype:\s*"([A-Z][A-Z0-9_]*)"/g)) found.add(tm[1]);
    // action: { type: "X" }  — a confirm modal's stored action
    for (const am of body.matchAll(/\baction:\s*\{[^}]*\btype:\s*"([A-Z][A-Z0-9_]*)"/g)) found.add(am[1]);
    callRe.lastIndex = open + 1;
  }
  return found;
}

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if ((e.name.endsWith(".tsx") || e.name.endsWith(".ts")) && !e.name.startsWith("__")) out.push(p);
  }
  return out;
};
const dispatched = new Set();
for (const f of walk(path.join(root, "src"))) {
  const rel = path.relative(root, f).replace(/\\/g, "/");
  if (rel.includes("/reducer/") || rel.endsWith("bastion/actions.ts") || rel.endsWith("types.ts")) continue;
  for (const t of dispatchedTypes(stripComments(fs.readFileSync(f, "utf8")))) dispatched.add(t);
}

// ---- ADJUDICATE ------------------------------------------------------------------------------
const pendingKeys = new Set(Object.keys(PENDING_SCREEN));
const problems = [];
const undeclared    = [...actions].filter((a) => !dispatched.has(a) && !INTERNAL.has(a) && !pendingKeys.has(a)).sort();
const stalePending  = [...pendingKeys].filter((a) => dispatched.has(a)).sort();
const staleInternal = [...INTERNAL].filter((a) => dispatched.has(a)).sort();
const ghosts        = [...pendingKeys, ...INTERNAL].filter((a) => !actions.has(a)).sort();

// ---- REPORT ----------------------------------------------------------------------------------
console.log(`\n  REACHABILITY  (measured by real dispatch shape, not raw string presence)`);
console.log(`  actions declared : ${actions.size}`);
console.log(`  dispatched       : ${[...actions].filter((a) => dispatched.has(a)).length}`);
console.log(`  internal         : ${INTERNAL.size}`);
console.log(`  pending screen   : ${pendingKeys.size}  (sanctioned backlog)`);

if (pendingKeys.size) {
  console.log(`\n  PENDING SCREENS (worklist — each drops off as its screen ships):`);
  for (const a of [...pendingKeys].sort()) console.log(`      ${a.padEnd(24)} → ${PENDING_SCREEN[a]}`);
}
if (undeclared.length) {
  problems.push(`${undeclared.length} action(s) never dispatched and not declared`);
  console.log(`\n  NEVER DISPATCHED & UNDECLARED (${undeclared.length}) — wire a screen, or declare INTERNAL / PENDING_SCREEN:`);
  for (const a of undeclared) console.log(`      ${a}`);
}
if (stalePending.length) {
  problems.push(`${stalePending.length} pending action(s) are now dispatched — remove from PENDING_SCREEN`);
  console.log(`\n  STALE PENDING (${stalePending.length}) — the screen shipped; remove from the worklist:`);
  for (const a of stalePending) console.log(`      ${a}`);
}
if (staleInternal.length) {
  problems.push(`${staleInternal.length} internal action(s) are now dispatched — remove from INTERNAL`);
  console.log(`\n  STALE INTERNAL (${staleInternal.length}):`);
  for (const a of staleInternal) console.log(`      ${a}`);
}
if (ghosts.length) {
  problems.push(`${ghosts.length} declared name(s) match no reducer action`);
  console.log(`\n  GHOST DECLARATIONS (${ghosts.length}) — declared but no reducer has them (typo or removed):`);
  for (const a of ghosts) console.log(`      ${a}`);
}

if (problems.length) {
  console.log(`\nREACHABILITY: FAILED — ${problems.join("; ")}`);
  process.exit(1);
}
console.log(`\nREACHABILITY: every action is dispatched or declared (${pendingKeys.size} pending screen, ${INTERNAL.size} internal)`);
process.exit(0);
