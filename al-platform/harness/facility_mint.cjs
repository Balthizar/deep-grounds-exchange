#!/usr/bin/env node
// FACILITY MINT SUITE (28 Jul) — the strict, permanent version of the close-out we did by hand all
// session. Two modes:
//   node harness/facility_mint.cjs <id>        → hold ONE facility to the full strict bar (run after minting)
//   node harness/facility_mint.cjs --status    → the ledger: minted vs pending across the whole DMG roster
//
// STRICT means strict: presence is not enough. A facility is "minted" only when every applicable
// column passes a real bar. "Not applicable" (e.g. the Archive doesn't craft) must be an EXPLICIT,
// auditable claim in NONCRAFT below — never a silent skip. Calibrated so the 4 known-good specials
// (arcane_study, archive, armory, observatory) pass and a thin stub fails.
//
// Self-discovering: reads the live registries after registration (NEVER a static source scan — see
// COMPILER_PRINCIPLES.md P1, the empty-declaration false alarm). Bundles the real modules and
// measures the runtime objects.

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

// ---- the authoritative DMG special-facility roster (29) — the target the ledger measures against.
//
// COUNT VERIFIED TWO INDEPENDENT WAYS (29 Jul) against the Bastions chapter, first clean copy only
// (the extract contains a second, ligature-broken copy — see the `fi`/`fl` artifacts):
//   (a) 29 lines matching /Level \d+ Bastion Facility/
//   (b) 29 lines beginning "Prerequisite:"
// and the extracted name sequence is alphabetically continuous, so nothing is missing between names.
// By level: 9 at L5 · 10 at L9 · 6 at L13 · 4 at L17 = 29.
//
// B-38 (29 Jul): this roster shipped as 28 and omitted SACRISTY (Level 9, Space Roomy, 1 hireling,
// Order Craft, Prerequisite "Ability to use a Holy Symbol or Druidic Focus as a Spellcasting Focus"
// — Bastions.md:1014). The omission was structurally invisible: the roster IS the denominator, so
// the ledger would have printed 28/28 COMPLETE with a legal facility absent from the platform
// entirely. A denominator cannot audit itself — hence the roster integrity guard in --minted mode.
const DMG_SPECIALS = [
  "arcane_study", "archive", "armory", "barrack", "demiplane", "gaming_hall", "garden", "greenhouse",
  "guildhall", "laboratory", "library", "meditation_chamber", "menagerie", "observatory", "pub",
  "reliquary", "sacristy", "sanctuary", "sanctum", "scriptorium", "smithy", "stable", "storehouse",
  "teleportation_circle", "theater", "training_area", "trophy_room", "war_room", "workshop",
];
// Per-level partition of the roster above. Kept separate from the flat list ON PURPOSE: it is the
// second, independent statement of the same fact, so a name dropped from one side fails the guard.
const DMG_SPECIALS_BY_LEVEL = {
  5:  ["arcane_study", "armory", "barrack", "garden", "library", "sanctuary", "smithy", "storehouse", "workshop"],
  9:  ["gaming_hall", "greenhouse", "laboratory", "sacristy", "scriptorium", "stable", "teleportation_circle", "theater", "training_area", "trophy_room"],
  13: ["archive", "meditation_chamber", "menagerie", "observatory", "pub", "reliquary"],
  17: ["demiplane", "guildhall", "sanctum", "war_room"],
};
// Facilities that legitimately DO NOT craft — an explicit, auditable "not applicable" for the craft
// column. The Archive is pure Research (Legend Lore + Reference Book); giving it craft would violate
// AL and step on the Scriptorium/Arcane Study. Add to this list only with a cited reason.
const NONCRAFT = new Set(["archive", "observatory", "armory", "library", "barrack", "stable", "storehouse", "trophy_room",
  "war_room", "meditation_chamber", "sanctuary", "gaming_hall", "pub", "theater", "guildhall",
  "training_area", "menagerie", "reliquary", "teleportation_circle", "demiplane"]);
// (armory: its order is Trade — it STOCKS equipment (DMG "Stock Armory"), it does not craft. So craft
//  is correctly not-applicable; its trade mechanism is checked by the harness's behaviour suite.)
const FORMS = ["keep", "tower", "manor", "cavern", "ruin", "grove", "vessel", "hamlet"];
const MIN_LIFE_TASKS = 6;   // strict: a real life-week, not a token beat or two

// ---- bundle the live modules once ------------------------------------------------------------
function loadLive() {
  const shim = path.join(root, "src", "__mint.tsx");
  fs.writeFileSync(shim,
    'export * as LIVE_BASTION from "./data/bastion";\n' +
    'export * as LIVE_LIBRARY from "./data/library_subjects";\n' +
    'export * as LIVE_ENGINE from "./bastion/engine";\n' +
    'export { BASTION_FACILITIES, bookShelfCap } from "./data/bastion";\n' +
    'export { FACILITY_FURNISHINGS, FACILITY_ROLES, FACILITY_REACTIONS, BASTION_SIZE_FLAVOR, FACILITY_RUIN, ' +
    'FACILITY_FORM_NAMES, FURNISHING_LADDER, facEstablishment, facilityFormName, furnishFacility, staffFacility } from "./bastion/registry";\n' +
    'export { lifeTasksFor, reactionsFor } from "./bastion/engine";\n' +
    'export { BASTION_LIFE_TASKS } from "./bastion/registry";');
  const out = path.join(root, "mint.cjs");
  execSync(`npx --no-install esbuild "${shim}" --bundle --format=cjs --outfile="${out}" --loader:.tsx=tsx --loader:.json=json --jsx=automatic`, { stdio: "pipe" });
  const m = require(out);
  fs.rmSync(shim, { force: true }); fs.rmSync(out, { force: true });
  return m;
}

// ---- the strict checks for ONE facility ------------------------------------------------------
function checkFacility(m, id) {
  const rows = [];
  const ok = (label, pass, detail) => rows.push({ label, pass: !!pass, detail: detail || "" });
  const def = m.BASTION_FACILITIES[id];

  // ---- MECHANICAL ----
  if (!def) { ok("definition exists", false, "not in BASTION_FACILITIES"); return { rows, minted: false, exists: false }; }
  const isBasic = def.kind === "basic";
  // BASICS are a different category (DMG: basic facilities "don't have game effects"). They take no
  // orders, craft nothing, and have no fixed hireling count (communal ones have zero staff BY DESIGN
  // — the two-tier household model). So the special-only checks (orders-shaped definition, craft,
  // fixed-establishment staffing) DO NOT apply to them. A basic is "minted" on its NARRATIVE + a
  // basic-appropriate definition + furniture. This is not a loophole: the applicable columns are held
  // to the same strict bar; the inapplicable ones are structurally skipped for kind:basic.
  if (isBasic) {
    ok("definition: basic fields (id, name, kind)", def.id && def.name && def.kind === "basic", "kind:basic");
  } else {
    ok("definition: all required fields", def.id && def.name && def.kind && def.space &&
       typeof def.minLevel === "number" && Array.isArray(def.orders) && typeof def.hirelings === "number",
       `L${def.minLevel} ${def.space} orders=[${(def.orders || []).join(",")}] hirelings=${def.hirelings}`);

    // staffing: produces exactly facEstablishment named+aged hirelings (specials always have a post)
    const est = m.facEstablishment({ defId: id, size: def.space });
    const s = { nextId: 1 }; const fac = { defId: id, size: def.space, henchmen: [] };
    m.staffFacility(s, fac);
    const named = fac.henchmen.every((h) => h.name && typeof h.age === "number");
    ok("staffing: fills establishment with named+aged hirelings", fac.henchmen.length === est && est > 0 && named,
       `${fac.henchmen.length}/${est}${named ? " all named+aged" : " MISSING name/age"}`);

    // roles: room-appropriate titles present
    const roles = m.FACILITY_ROLES[id] || [];
    ok("roles: room-appropriate job titles", roles.length > 0, roles.join(", ") || "none");
  }

  // furniture: non-empty AND applied by furnishFacility (the false-alarm killer) — applies to both
  const furnDef = m.FACILITY_FURNISHINGS[id] || [];
  const s2 = { nextId: 100 }; const fac2 = { defId: id, furnishings: [] };
  m.furnishFacility(s2, fac2, "keep");
  ok("furniture: defined and applied", furnDef.length > 0 && fac2.furnishings.length === furnDef.length,
     `${furnDef.length} defined, ${fac2.furnishings.length} applied`);

  // furnishing ladder: upgradeable (>=2 tiers for at least one slot) — applies to both
  const ladderOk = furnDef.some((f) => {
    const l = m.FURNISHING_LADDER[f.slot] || m.FURNISHING_LADDER[f.slot + "@keep"];
    return Array.isArray(l) && l.length >= 2;
  });
  ok("furniture: upgradeable ladder (>=2 tiers)", ladderOk, ladderOk ? "" : "no slot has >=2 tiers");

  if (!isBasic) {
    // craft: explicit applicability. If it crafts, outputs must be non-empty; if declared non-craft, must have none.
    const crafts = !NONCRAFT.has(id);
    if (crafts) {
      const hasCraft = Array.isArray(def.craftOutputs) ? def.craftOutputs.length > 0
        : (def.orders || []).includes("craft") || !!def.tools;
      ok("craft: crafting facility produces outputs", hasCraft, hasCraft ? "" : "declares craft but no outputs/tools");
    } else {
      ok("craft: correctly non-crafting (declared)", true, "explicit NONCRAFT");
    }
  }

  // ---- NARRATIVE ----
  const ltKeep = (m.lifeTasksFor ? m.lifeTasksFor(id, "keep") : []) || [];
  const ltVessel = (m.lifeTasksFor ? m.lifeTasksFor(id, "vessel") : []) || [];
  ok("life-tasks: enough beats", ltKeep.length >= MIN_LIFE_TASKS, `${ltKeep.length} (min ${MIN_LIFE_TASKS})`);
  ok("life-tasks: vary by form", JSON.stringify(ltKeep) !== JSON.stringify(ltVessel), ltKeep.length && ltVessel.length ? "" : "one or both empty");

  ok("reactions: own voice (not generic fallback)", !!m.FACILITY_REACTIONS[id], m.FACILITY_REACTIONS[id] ? "" : "falls back to generic");
  ok("size flavor: present", !!m.BASTION_SIZE_FLAVOR[id], "");
  ok("ruin flavor: present", !!m.FACILITY_RUIN[id], "");

  // form-names: all 8 forms, non-empty, distinct from each other and from the canonical name
  const names = FORMS.map((f) => m.facilityFormName(id, f, def.name));
  const all8 = names.every((n) => n && n !== def.name);
  const distinct = new Set(names).size === FORMS.length;
  ok("form-names: all 8 forms, flavored and distinct", all8 && distinct,
     all8 ? (distinct ? "" : "some forms share a name") : "some forms fall back to canonical");

  // ---- §3 SCHEMA (added 31 Jul) --------------------------------------------------------------
  // The strict bar previously checked the stat block and the narrative tables and stopped there —
  // seven of the ten fields §3 defines went unverified, so a room could read ✅ MINTED while a
  // published mechanic sat undeclared on it. That is how the Armory's d8 feature stayed invisible:
  // fully built in the engine, never named on the definition, nothing able to notice.
  //
  // These checks verify the DECLARATION, not the behaviour — the engine owns the behaviour, and
  // `impl` is the thread between them. A feature naming a function that does not exist is the one
  // failure mode this cannot tolerate, because that is a claim with nothing behind it.

  // A craft-order room must say what it crafts and (where the DMG gives it one) what it uses.
  const craftsHere = (def.orders || []).includes("craft");
  if (craftsHere) {
    ok("§3 outputs: a craft room declares what it makes", !!def.outputs && !!def.outputs.craft,
       def.outputs ? "" : "no outputs on the definition");
    // `noTool` is the explicit, cited "not applicable" — the Arcane Study genuinely has none in the
    // DMG (its Craft options are Arcane Focus and Book, neither tool-gated). An UNSTATED absence is
    // the defect; a stated one with a citation is a fact. Same shape as the NONCRAFT list above.
    ok("§3 tools: declared, or an explicit cited reason it has none",
       !!(def.tool || def.toolChoice || def.scribeClasses || def.noTool),
       "no tool, toolChoice, scribeClasses or noTool — see §4");
  }

  // Features: bespoke mechanics must be declared AND point at real code.
  if (Array.isArray(def.features) && def.features.length) {
    const bad = def.features.filter((f) => !f || !f.id || !f.text || !f.impl || !f.cite);
    ok("§8 features: each names id, text, impl and cite", bad.length === 0,
       bad.length ? `${bad.length} incomplete` : "");
    const missing = def.features.filter((f) => f && f.impl && typeof m[f.impl] !== "function" && !liveHas(f.impl));
    ok("§8 features: every impl names a real function", missing.length === 0,
       missing.length ? `not found: ${missing.map((f) => f.impl).join(", ")}` : "");
  }

  // Tables: pointers must resolve. A pointer at a table that does not exist is worse than no
  // pointer, because it reads as coverage.
  if (def.tables) {
    const unresolved = Object.entries(def.tables).filter(([, name]) => !liveHas(name));
    ok("§7 tables: every pointer resolves to a real export", unresolved.length === 0,
       unresolved.length ? `missing: ${unresolved.map(([k, v]) => `${k}->${v}`).join(", ")}` : "");
  }

  // Shelving rooms must have a capacity and a reason to grow.
  if (def.shelvesBooks) {
    ok("§14 shelf: capacity is non-zero at the printed size",
       typeof m.bookShelfCap === "function" ? m.bookShelfCap(id, def.space) > 0 : true, "");
    ok("§14 shelf: declares an enlarge benefit", !!def.enlargeBenefit,
       def.enlargeBenefit ? "" : "the shelf cannot grow, so enlarging buys nothing");
  }

  const minted = rows.every((r) => r.pass);
  return { rows, minted, exists: true };
}

// ---- output --------------------------------------------------------------------------------
function printFacility(id, res) {
  console.log(`\n=== FACILITY MINT CHECK: ${id} ===`);
  if (!res.exists) { console.log("  ✗ not defined in BASTION_FACILITIES — nothing to check."); return; }
  let pass = 0;
  for (const r of res.rows) { console.log(`  ${r.pass ? "✓" : "✗ FAIL"}  ${r.label}${r.detail ? "  — " + r.detail : ""}`); if (r.pass) pass++; }
  console.log(`\n  ${pass}/${res.rows.length} strict checks passed — ${res.minted ? "✅ MINTED" : "❌ NOT YET MINTED"}`);
  return res.minted;
}


// Resolve a name against the live modules — used to verify that a `tables` pointer or a feature's
// `impl` names something that actually exists. A pointer at a missing export reads as coverage while
// covering nothing, which is worse than declaring nothing at all.
let LIVE = null;
function liveHas(name) {
  if (!LIVE) return false;
  return (LIVE.LIVE_BASTION && LIVE.LIVE_BASTION[name] !== undefined)
      || (LIVE.LIVE_ENGINE && LIVE.LIVE_ENGINE[name] !== undefined)
      || (LIVE.LIVE_LIBRARY && LIVE.LIVE_LIBRARY[name] !== undefined)
      || LIVE[name] !== undefined;
}

// ---- main ----------------------------------------------------------------------------------
const arg = process.argv[2];
let m;
try { m = loadLive(); LIVE = m; } catch (e) { console.log("FACILITY-MINT: bundle failed\n" + (e.stderr ? e.stderr.toString() : e.message)); process.exit(1); }

// ---- roster integrity: the denominator cannot audit itself, so check it explicitly (B-38) -----
// Cross-checks the flat roster against its independent per-level partition, so a name dropped from
// either side fails loudly instead of shrinking the target silently.
function checkRoster() {
  const fail = [];
  const EXPECT = 29, BY_LEVEL_EXPECT = { 5: 9, 9: 10, 13: 6, 17: 4 };
  if (DMG_SPECIALS.length !== EXPECT) fail.push(`roster length is ${DMG_SPECIALS.length}, DMG has ${EXPECT}`);
  const dupes = DMG_SPECIALS.filter((id, i) => DMG_SPECIALS.indexOf(id) !== i);
  if (dupes.length) fail.push(`duplicate ids in roster: ${dupes.join(", ")}`);
  const sorted = [...DMG_SPECIALS].sort();
  if (DMG_SPECIALS.join("|") !== sorted.join("|")) fail.push("roster is not alphabetical (the chapter is; keep them aligned so a gap is visible)");
  const flat = [];
  for (const [lvl, ids] of Object.entries(DMG_SPECIALS_BY_LEVEL)) {
    if (ids.length !== BY_LEVEL_EXPECT[lvl]) fail.push(`level ${lvl} holds ${ids.length} facilities, DMG has ${BY_LEVEL_EXPECT[lvl]}`);
    flat.push(...ids);
  }
  const onlyFlat = DMG_SPECIALS.filter((id) => !flat.includes(id));
  const onlyLvl = flat.filter((id) => !DMG_SPECIALS.includes(id));
  if (onlyFlat.length) fail.push(`in the roster but on no level: ${onlyFlat.join(", ")}`);
  if (onlyLvl.length) fail.push(`on a level but not in the roster: ${onlyLvl.join(", ")}`);
  const strayNoncraft = [...NONCRAFT].filter((id) => !DMG_SPECIALS.includes(id));
  if (strayNoncraft.length) fail.push(`NONCRAFT names facilities that are not on the roster: ${strayNoncraft.join(", ")}`);
  return fail;
}

if (arg === "--roster") {
  const fail = checkRoster();
  fail.forEach((f) => console.log(`  ✗ ${f}`));
  console.log(fail.length ? `\nROSTER: ${fail.length} integrity failure(s)` : `ROSTER: ${DMG_SPECIALS.length} DMG specials, flat list and per-level partition agree`);
  process.exit(fail.length ? 1 : 0);
}

if (arg === "--minted") {
  const rosterFail = checkRoster();
  if (rosterFail.length) {
    rosterFail.forEach((f) => console.log(`  ✗ roster: ${f}`));
    console.log(`\nFACILITY-MINT: the roster itself is wrong — fix the target before measuring against it`);
    process.exit(1);
  }
  // GATE MODE: every facility that HAS a registerFacility mint (furniture defined) must still pass the
  // full strict bar. Fails the build if a minted facility regresses. Pending facilities are not checked
  // here (they're honestly incomplete — the ledger tracks them). "Minted" = has furniture defined.
  const BASICS = ["bedroom", "dining", "kitchen", "courtyard", "parlor", "storage"];
  const claimed = [...DMG_SPECIALS, ...BASICS].filter((id) => (m.FACILITY_FURNISHINGS[id] || []).length > 0);
  let bad = 0;
  for (const id of claimed) {
    const res = checkFacility(m, id);
    if (!res.minted) { bad++; console.log(`✗ ${id} REGRESSED:`); res.rows.filter((r) => !r.pass).forEach((r) => console.log(`    ✗ ${r.label} — ${r.detail}`)); }
  }
  if (bad) { console.log(`\nFACILITY-MINT: ${bad} minted facility(ies) regressed below the strict bar`); process.exit(1); }
  console.log(`FACILITY-MINT: all ${claimed.length} minted facilities hold the strict bar (${claimed.join(", ")})`);
  process.exit(0);
}

if (!arg || arg === "--status") {
  // the ledger: minted vs pending across the full DMG roster
  const minted = [], pending = [], partial = [];
  for (const id of DMG_SPECIALS) {
    const res = checkFacility(m, id);
    if (!res.exists) { pending.push(id); continue; }
    if (res.minted) minted.push(id);
    else partial.push({ id, passed: res.rows.filter((r) => r.pass).length, total: res.rows.length });
  }
  console.log("\n=== FACILITY MINT LEDGER (DMG special facilities) ===");
  console.log(`\n  MINTED (${minted.length}/${DMG_SPECIALS.length}):`);
  minted.forEach((id) => console.log(`    ✅ ${id}`));
  if (partial.length) {
    console.log(`\n  DEFINED BUT INCOMPLETE (${partial.length}):`);
    partial.forEach((p) => console.log(`    ⚠  ${p.id}  (${p.passed}/${p.total} checks)`));
  }
  console.log(`\n  NOT YET STARTED (${pending.length}):`);
  pending.forEach((id) => console.log(`    ·  ${id}`));
  console.log(`\n  ${minted.length} minted · ${partial.length} in progress · ${pending.length} to start · ${DMG_SPECIALS.length} total`);
  process.exit(0);
}

// single-facility strict gate
const res = checkFacility(m, arg);
const passed = printFacility(arg, res);
process.exit(passed ? 0 : 1);
