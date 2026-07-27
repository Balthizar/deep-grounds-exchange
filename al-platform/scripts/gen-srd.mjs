// I decompose my SRD source-of-truth JSON into the lean, id-keyed collections my site uses.
// I designed this for the future update-checker: additive & idempotent — keyed by a STABLE
// unique id so a re-run (or a backend update pull) UNIONS new entries in and never duplicates
// or deletes. Future me: keep it that way.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = (f) => JSON.parse(readFileSync(join(root, "srd-source", f), "utf8"));
const out = join(root, "src", "data", "srd");
mkdirSync(out, { recursive: true });

const slug = (p, name) => p + name.toLowerCase().replace(/[^a-z0-9]/g, "");

// --- SPELLS: id/name/level/school/classes (+ srd flag). ---
function composeSpells() {
  const rows = src("spells.json");
  const db = {};
  for (const s of rows) {
    const id = slug("sp_", s.name);
    if (db[id]) continue;                    // dedup by id — never a second copy
    const rec = { id, name: s.name, level: s.level, school: s.school, classes: s.classes, srd: true, source: s.source };
    if (s.class_sources) rec.classSources = s.class_sources;   // cite only the exceptions; rest inherit `source`
    db[id] = rec;
  }
  return db;
}

const spells = composeSpells();
writeFileSync(join(out, "spells.json"), JSON.stringify(spells, null, 0));
console.log("composed spells:", Object.keys(spells).length, "entries -> src/data/srd/spells.json");

// --- Stable id registry (name -> established id) + AL legality filter. ---
const idReg = JSON.parse(readFileSync(join(root, "srd-source", "_ids.json"), "utf8"));
const idFor = (fallbackPrefix, name) => idReg[name] || slug(fallbackPrefix, name);

// ===== AL legality layer — verified against rule text, and consistent with the project's
// existing ruling in AL_Harness_bundle ("AL HAS NO POISONS": least-permissive, structural).
//
// SOURCES (verified, not paraphrased):
//  [ALPG-176]  AL PG v2026.4 L176/L254: "You may purchase mundane equipment and spell components
//              from your character's campaign-available sources (in this case, EXCLUDING THE DMG)."
//              "Campaign-available" = PH + Appendix A; Appendix B items are unavailable (L178).
//  [ALPG-CL]   AL PG v2026.4 change log: "Excluded DMG purchases of poisons and trade goods."
//  [ALPG-312]  AL PG v2026.4 "At the Session's End > Firearms" (L312) — quoted in alTag below.
//  [DC-68]     AL Dungeoncraft DG v1.9c L68: "Trade goods and vehicles are story items when
//              placed in adventures."
//  [DC-36]     AL Dungeoncraft DG v1.9c L36: "(no firearm magic items)".
//  [HARNESS]   AL_Harness_bundle: the project's own prior ruling — poisons excluded STRUCTURALLY
//              at the source. SUPERSEDED by Q16 (Frank, 26 Jul): see awardOnlyPatterns below.
const AL = {
  // Q16 RULING (Frank, 26 Jul) — SUPERSEDES the structural [HARNESS] exclusion.
  // Poisons are AWARD-ONLY, not absent. His words: "it is an award only... if you cannot buy it
  // and you cannot make it then you wait for a DM to issue it." The [ALPG-CL] letter is a PURCHASE
  // exclusion; the prior reading closed the craft/harvest gap by deleting the item, which also
  // deleted the DM's award door and left a goat unable to log something they legitimately hold.
  // So the row EXISTS and carries `awardOnly`, the same shape the firearms gate already uses.
  // Pattern-based, not a hand-list: a future SRD pull cannot slip a new poison past this.
  awardOnlyPatterns: [
    { re: /\bpoison\b/i, poison: true,
      reason: "[ALPG-CL]+Q16 award-only: purchase and craft closed, DM award is the only door" },
    // NAMED poisons that never contain the word "poison" — the regex alone misses these.
    { re: /\b(assassin's blood|malice|pale tincture|truth serum|burnt othur fumes|essence of ether|torpor|serpent venom|wyvern poison|drow poison|midnight tears|oil of taggit|purple worm poison)\b/i,
      poison: true, reason: "[ALPG-CL]+Q16 named DMG poison — award-only" },
    // The KIT itself, by Frank's Q16 ruling: "the poisoner's kit is as illegal to purchase as a
    // vial of basic poison", and no mechanic mints a toolkit, so the craft door is shut too.
    // Word-boundary note: /\bpoison\b/ does NOT match "Poisoner's", so this entry is load-bearing.
    { re: /^poisoner's kit$/i, poison: true,
      reason: "[ALPG-CL]+Q16 the kit is as unpurchasable as the vial; no craft mechanic mints a toolkit" },
  ],
  // DMG trade goods & vehicles: not purchasable [ALPG-CL]; when placed in adventures they are
  // STORY ITEMS [DC-68], which the app handles via its story-item class — not the mundane store.
  tradeGoodPatterns: [
    { re: /\b(ox|cattle|livestock|sheep|goat|pig|wheat|flour|barley|salt|silk|linen|canvas|cotton|ginger|cinnamon|cloves|saffron|ingot|bar of (copper|silver|gold))\b/i,
      reason: "[ALPG-CL] DMG purchases of trade goods excluded; [DC-68] story items in adventures" },
  ],
  firearms: new Set(["Pistol", "Musket"]),
  firearmAmmo: new Set(["Bullets, Firearm"]),
};
const AL_EXCLUDE = {};   // legacy exact-name hook (empty; patterns above do the work)
// ITEM-SCOPED ONLY. These patterns must never be applied to SPELLS: legal spells such as
// "Detect Poison and Disease", "Poison Spray" and "Protection from Poison" would false-positive.
// composeSpells() deliberately does not call this. [ALPG-176 governs PURCHASED EQUIPMENT.]
function alReason(name) {
  for (const p of AL.tradeGoodPatterns) if (p.re.test(name)) return p.reason;
  return null;
}
function alAwardOnly(name) {
  for (const p of AL.awardOnlyPatterns) if (p.re.test(name)) return p;
  return null;
}
function alTag(rec, name) {
  const award = alAwardOnly(name);
  if (award) {
    rec.awardOnly = true;          // consumed by the app's isAwardOnly() gate
    if (award.poison) rec.poison = true;
    rec.alNote = award.reason + ". Kept only if awarded by a DM. NOT purchased and NOT crafted; "
      + "may be logged, held, and carried like any other awarded gear.";
  }
  if (AL.firearms.has(name)) {
    rec.firearm = true;   // consumed by the app's isFirearm() gate
    // Q16 (Frank, 26 Jul): "we need to secure the distribution of weapons... if you cannot buy it
    // and you cannot make it then you wait for a DM to issue it." Firearms and poisons share ONE
    // acquisition door, so they share ONE flag. `firearm` still carries what is unique to guns —
    // the trade block and the carry-limit exemption — while `awardOnly` states the door.
    rec.awardOnly = true;
    rec.alNote = "[ALPG-312] Kept only if awarded in encounter text (never stat block). May be SOLD "
      + "or LOANED. NOT purchased, crafted, traded, repaired, replicated, or chosen as a weapon type. "
      + "Martial-weapon proficiency includes PH firearms. No firearm MAGIC items [DC-36].";
  } else if (AL.firearmAmmo.has(name)) {
    // Deliberately NOT firearm-flagged: bullets have looser rules than the weapon.
    rec.ammoNote = "[ALPG-312] Bullets may be rewarded, PURCHASED IN AN ADVENTURE, or crafted "
      + "(Smith's Tools). Smokepowder required to fire (50 GP per 5 shots outside its adventure).";
  }
  return rec;
}

const parseGp = c => { const m=/([\d.]+)\s*(GP|SP|CP)/i.exec((c||"").replace(/,/g,"")); if(!m) return null; const n=+m[1]; return m[2].toUpperCase()==="GP"?n:m[2].toUpperCase()==="SP"?n/10:n/100; };
// WEIGHT IS NOT GENERATED (Frank's Q22 ruling, 26 Jul). The Exchange tracks no encumbrance, and
// the `lb` field it used to emit was read by nothing: the market inspector reads `cat.weight`, a
// hand-written string on the CATALOG rows, so 148 generated values never reached a screen. The
// source keeps its `wt` column; we simply stop consuming it. Removing the parser also retires the
// fraction-slash bug it carried (SRD prints Entertainer's Pack as 58<U+2044>2, i.e. 58 1/2, which
// parsed to 581 because the mixed-fraction branch wanted an ASCII slash and a space).
const notDash = v => (v && v!=="-") ? v : "";

function composeEquipment() {
  const eq = JSON.parse(readFileSync(join(root, "srd-source", "equipment.json"), "utf8"));
  const db = {}, excluded = [];
  const put = (rec, name) => {
    const why = AL_EXCLUDE[name] || alReason(name);
    if (why) { excluded.push({ name, reason: why }); return; }
    alTag(rec, name);
    if (!db[rec.id]) db[rec.id] = rec;
  };
  // weapons
  for (const w of eq.weapons) {
    let desc = w.dmg; const p=notDash(w.props), m=notDash(w.mast);
    if (p) desc += ". " + p; if (m) desc += ". Mastery: " + m; desc += ".";
    const rec = { id: idFor("g_", w.name), name: w.name, srd: true, mundane: true, itemType: "weapon",
                  category: w.cat, gp: parseGp(w.cost), desc };
    if (w.mast_source) rec.masterySource = w.mast_source;
    put(rec, w.name);
  }
  // armor
  for (const a of eq.armor) {
    let desc = "AC " + a.ac + ".";
    if (notDash(a.strreq)) desc += " " + a.strreq + ".";
    if (notDash(a.stealth)) desc += " Stealth " + a.stealth + ".";
    const category = a.cat === "Shield" ? "Shield" : a.cat + " armor";
    const rec = { id: idFor("g_", a.name), name: a.name, srd: true, mundane: true, itemType: "armor",
                  category, gp: parseGp(a.cost), desc };
    put(rec, a.name);
  }
  // tools (source backfilled with wt + cat)
  for (const t of eq.tools) {
    const rec = { id: idFor("g_tool_", t.name), name: t.name, srd: true, mundane: true, itemType: "tool",
                  category: t.cat, gp: parseGp(t.cost) };
    put(rec, t.name);
  }
  // gear
  for (const g of eq.gear) {
    const rec = { id: idFor("g_", g.name), name: g.name, srd: true, mundane: true, itemType: "gear",
                  category: "Adventuring gear", gp: parseGp(g.cost) };
    put(rec, g.name);
  }
  return { db, excluded };
}

const { db: gear, excluded } = composeEquipment();
writeFileSync(join(out, "mundane_gear.json"), JSON.stringify(gear, null, 0));
writeFileSync(join(out, "_excluded.json"), JSON.stringify(excluded, null, 2));
console.log("composed mundane gear:", Object.keys(gear).length, "entries -> src/data/srd/mundane_gear.json");
console.log("AL-excluded:", excluded.map(e=>e.name).join(", ") || "(none)");
