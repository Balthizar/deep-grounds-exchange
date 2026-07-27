// ============================================================================
// ONE-SHOT AUTHORING AID — NOT part of `npm run generate`, and future me needs the
// honest story: this script never wrote src/data/magic_tables.ts. It read a table
// profile out of /tmp/profile.json (derived in the session that authored the
// tables, gone with that container) and emitted CANDIDATES into /tmp for me to
// review and promote by hand. The shipped magic_tables.ts is therefore my
// hand-authored source of truth — reviewed row by row in MAGIC_TABLES_REVIEW.md —
// and this file is provenance, kept so I remember HOW I derived the shape.
// My voice-pass tripped over the missing /tmp input on 24 Jul and I chose honesty
// over resurrection: to make this runnable again I'd have to re-derive the
// profile, and that's a ruling for the day I actually need to re-roll the tables.
//
// What it did, when it ran — I built my four random magic item tables as HYBRIDS.
//
// Each tier holds two kinds of row:
//   CONCRETE  a named SRD item. I own the text (CC-BY-4.0) and award it directly.
//   SLOT      a typed descriptor, e.g. "Uncommon wondrous item - container". I ship NO
//             licensed text; the goat reads the item out of the book THEY own, types it in,
//             and a DM at their store verifies it against the book.
//
// WHY: reproducing a published random-item table is a copyright problem. What I preserve is
// MECHANICS - the four tables, five rarity tiers, and the CATEGORY PROPORTIONS of each tier.
// I deliberately do NOT preserve row COUNT: if the SRD can't supply N distinct items, N rows
// would be fake granularity. I widen bands instead, so the probability of drawing (say) a
// wondrous item is unchanged while every row stays distinct.
//
// Bands are the UPPER BOUND of each d100 range. Row shape: [band, label, slotSpec?]
// slotSpec is present only on SLOT rows: { cat, sub } - what the player owes and must match.
// ============================================================================
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mi = JSON.parse(readFileSync(join(root, "srd-source", "magic_items.json"), "utf8"));
const profile = JSON.parse(readFileSync("/tmp/profile.json", "utf8"));
const norm = r => String(r || "").toLowerCase().replace(/\s+/g, "_");
const RARITIES = ["common", "uncommon", "rare", "very_rare", "legendary"];

const VARIANTS = [
  ["Potion of Healing","Potion","common"],["Potion of Healing (greater)","Potion","uncommon"],
  ["Potion of Healing (superior)","Potion","rare"],["Potion of Healing (supreme)","Potion","very_rare"],
  ["Spell Scroll (cantrip)","Scroll","common"],["Spell Scroll (1st level)","Scroll","common"],
  ["Spell Scroll (2nd level)","Scroll","uncommon"],["Spell Scroll (3rd level)","Scroll","uncommon"],
  ["Spell Scroll (4th level)","Scroll","rare"],["Spell Scroll (5th level)","Scroll","rare"],
  ["Spell Scroll (6th level)","Scroll","very_rare"],["Spell Scroll (7th level)","Scroll","very_rare"],
  ["Spell Scroll (8th level)","Scroll","very_rare"],["Spell Scroll (9th level)","Scroll","legendary"],
  ["Potion of Giant Strength (hill)","Potion","uncommon"],["Potion of Giant Strength (frost)","Potion","rare"],
  ["Potion of Giant Strength (stone)","Potion","rare"],["Potion of Giant Strength (fire)","Potion","rare"],
  ["Potion of Giant Strength (cloud)","Potion","very_rare"],["Potion of Giant Strength (storm)","Potion","legendary"],
  ["Belt of Giant Strength (hill)","Wondrous Item","rare"],["Belt of Giant Strength (stone)","Wondrous Item","very_rare"],
  ["Belt of Giant Strength (frost)","Wondrous Item","very_rare"],["Belt of Giant Strength (fire)","Wondrous Item","very_rare"],
  ["Belt of Giant Strength (cloud)","Wondrous Item","legendary"],["Belt of Giant Strength (storm)","Wondrous Item","legendary"],
  ["Feather Token (anchor)","Wondrous Item","uncommon"],["Feather Token (bird)","Wondrous Item","rare"],
  ["Feather Token (fan)","Wondrous Item","rare"],["Feather Token (swan boat)","Wondrous Item","rare"],
  ["Feather Token (tree)","Wondrous Item","rare"],["Feather Token (whip)","Wondrous Item","rare"],
];

// AL Appendix B: unavailable for AL play, so they must never be offered as a concrete award.
const AL_UNAVAILABLE = [
  /^philter of love$/i,            // Love Charm
  /^deck of many things$/i,        // Harms Player Characters
  /^deck of illusions$/i,          // Unspecified DM Choice (cards)
  /^robe of useful items$/i,       // Unspecified DM Choice (patches)
  /^rod of absorption$/i,          // Unspecified DM Choice
  /^ring of spell storing$/i,      // Unspecified spell-storing (ALPG L242)
  /^ioun stone$/i, /^figurine of wondrous power$/i,   // type unspecified
  /^spell scroll$/i, /^potions? of healing$/i, /^potion of giant strength$/i, /^belt of giant strength$/i,
  /^quaal'?s feather token$/i, /^feather token$/i,    // ungraded parents - the graded variants are used instead
];
const unavailable = n => AL_UNAVAILABLE.some(re => re.test(n));

const POOL = [];
for (const m of mi) { const r = norm(m.rarity);
  if (RARITIES.includes(r) && !unavailable(m.name)) POOL.push({ name: m.name, category: m.category, rarity: r }); }
for (const [name, category, rarity] of VARIANTS) POOL.push({ name, category, rarity });

const TABLE_PROFILE = {
  IMPLEMENTS: ["Wondrous Item","Potion","Ring","Wand","Rod","Staff","Weapon","Armor"],
  ARMAMENTS:  ["Weapon","Armor","Wondrous Item","Potion","Ring","Rod"],
  ARCANA:     ["Wondrous Item","Potion","Wand","Staff","Rod","Scroll","Ring"],
  RELICS:     ["Wondrous Item","Staff","Scroll","Armor","Potion","Wand","Ring","Weapon"],
};
const OFFSET = { IMPLEMENTS: 0, ARMAMENTS: 1, ARCANA: 2, RELICS: 3 };

// MEDIUM granularity descriptors, flavoured per table so the four stay distinct.
const SUBS = {
  IMPLEMENTS: { "Wondrous Item":["container","worn (boots or gloves)","worn (cloak or mantle)","illumination",
      "sensory or detection","travel or movement","repair, mending, or craft","writing or record-keeping",
      "rope, tool, or kit","food, drink, or sustenance","animal handling","concealment or disguise",
      "weather or comfort","music or performance","trinket or novelty","exploration aid"],
    "Potion":["utility or exploration","restorative","resistance"], "Ring":["minor utility","protective"],
    "Wand":["utility","minor effect"], "Rod":["utility"], "Staff":["utility"],
    "Weapon":["tool-like or thrown"], "Armor":["light or cosmetic"] },
  ARMAMENTS: { "Weapon":["melee, bonus to hit or damage","ranged or thrown","elemental damage",
      "versus a creature type","utility or returning","reach or entangling"],
    "Armor":["light","medium","heavy","shield","resistant","stealth-friendly"],
    "Wondrous Item":["worn - protective","bracers or gauntlets","helm or circlet","boots (martial)",
      "cloak (protective)","belt (strength or vigour)","shield accessory","battle-warning or alertness"],
    "Potion":["resistance or protection","combat restorative"], "Ring":["protective","combat utility"], "Rod":["martial"] },
  ARCANA: { "Wondrous Item":["spell focus or amplifier","divination or scrying","planar or teleportation",
      "illusion or glamour","summoning or binding","elemental or energy","arcane container",
      "scholarly or lore","transmutation or shaping","charm or enchantment","mind or memory",
      "time or fate","construct or animation","sensory (arcane)","protective ward","curiosity or oddity"],
    "Potion":["transformative","elemental or energy","perception or insight","restorative"],
    "Wand":["offensive cantrip or spell","utility","detection"], "Staff":["offensive","utility","elemental"],
    "Rod":["arcane utility","spell enhancement"], "Scroll":["by spell level"], "Ring":["arcane utility","spell-related"] },
  RELICS: { "Wondrous Item":["holy symbol or icon","vestment or robe","reliquary or censer","healing or restoration",
      "protective ward (sacred)","blessing or consecration","undead-related","oath or vow token",
      "pilgrimage or travel (sacred)","funerary or memorial","light (sacred)","prayer or meditation aid"],
    "Staff":["divine","healing","protective"], "Scroll":["by spell level"],
    "Armor":["blessed or consecrated","shield (sacred)"], "Potion":["restorative","blessed"],
    "Wand":["divine utility"], "Ring":["sacred or protective"], "Weapon":["blessed or sanctified"] },
};
const label = (rarity, cat, sub) => {
  const r = rarity.replace("_", " ");
  const c = cat === "Wondrous Item" ? "wondrous item" : cat.toLowerCase();
  return `${r[0].toUpperCase()}${r.slice(1)} ${c} - ${sub}`;
};

function buildTier(table, rarity, want, mixCounts) {
  const allowed = TABLE_PROFILE[table];
  const total = Object.values(mixCounts).reduce((a,b)=>a+b,0) || 1;
  const used = new Set(); const byCat = {};
  for (const cat of allowed) {
    const share = (mixCounts[cat] || 0) / total;
    const target = Math.round(share * want);
    if (!target) continue;
    byCat[cat] = { share, rows: [] };
    // concrete SRD first
    const cands = POOL.filter(p => p.rarity === rarity && p.category === cat && !used.has(p.name))
                      .sort((a,b)=>a.name.localeCompare(b.name));
    const off = (OFFSET[table] * 7) % Math.max(1, cands.length);
    const rot = cands.slice(off).concat(cands.slice(0, off));
    for (const c of rot.slice(0, target)) { byCat[cat].rows.push({ name: c.name }); used.add(c.name); }
    // typed SLOT rows for the shortfall - UNIQUE descriptors only
    const subs = (SUBS[table] && SUBS[table][cat]) || ["general"];
    let k = 0;
    while (byCat[cat].rows.length < target && k < subs.length) {
      byCat[cat].rows.push({ name: label(rarity, cat, subs[k]), slot: { cat, sub: subs[k] } }); k++;
    }
  }
  // bands: each category keeps its PROPORTION of the d100; split evenly inside the category
  const cats = Object.keys(byCat).filter(c => byCat[c].rows.length);
  const shareSum = cats.reduce((a,c)=>a+byCat[c].share,0) || 1;
  const flat = [];
  for (const c of cats) for (const r of byCat[c].rows) flat.push({ ...r, cat: c, per: (byCat[c].share/shareSum)*100/byCat[c].rows.length });
  flat.sort((a,b)=> (a.slot?1:0)-(b.slot?1:0) || a.name.localeCompare(b.name));
  let acc = 0; const rows = [];
  flat.forEach((r,i) => { acc += r.per; let hi = Math.round(acc);
    if (rows.length && hi <= rows[rows.length-1][0]) hi = rows[rows.length-1][0] + 1;
    hi = Math.min(100, hi);
    rows.push(r.slot ? [hi, r.name, r.slot] : [hi, r.name]); });
  if (rows.length) rows[rows.length-1][0] = 100;
  return rows;
}

const OUT = {}, REPORT = [];
for (const table of Object.keys(TABLE_PROFILE)) {
  OUT[table] = {};
  for (const rarity of RARITIES) {
    const p = profile[table][rarity]; if (!p) continue;
    const rows = buildTier(table, rarity, p.rows, p.counts);
    OUT[table][rarity] = rows;
    REPORT.push({ table, rarity, rows: rows.length, srd: rows.filter(r=>!r[2]).length, slots: rows.filter(r=>r[2]).length, orig: p.rows });
  }
}
writeFileSync("/tmp/newtables.json", JSON.stringify(OUT, null, 1));
writeFileSync("/tmp/report.json", JSON.stringify(REPORT, null, 1));
console.log("table        rarity      rows  SRD  slots  (orig rows)");
for (const r of REPORT)
  console.log(`  ${r.table.padEnd(11)} ${r.rarity.padEnd(11)} ${String(r.rows).padStart(4)} ${String(r.srd).padStart(4)} ${String(r.slots).padStart(6)}  ${String(r.orig).padStart(5)}`);
