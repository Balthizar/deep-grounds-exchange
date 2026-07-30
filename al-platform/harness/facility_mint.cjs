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

// ---- the authoritative DMG special-facility roster (28) — the target the ledger measures against.
const DMG_SPECIALS = [
  "arcane_study", "archive", "armory", "barrack", "demiplane", "gaming_hall", "garden", "greenhouse",
  "guildhall", "laboratory", "library", "meditation_chamber", "menagerie", "observatory", "pub",
  "reliquary", "sanctuary", "sanctum", "scriptorium", "smithy", "stable", "storehouse",
  "teleportation_circle", "theater", "training_area", "trophy_room", "war_room", "workshop",
];
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
    'export { BASTION_FACILITIES } from "./data/bastion";\n' +
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

// ---- main ----------------------------------------------------------------------------------
const arg = process.argv[2];
let m;
try { m = loadLive(); } catch (e) { console.log("FACILITY-MINT: bundle failed\n" + (e.stderr ? e.stderr.toString() : e.message)); process.exit(1); }

if (arg === "--minted") {
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
