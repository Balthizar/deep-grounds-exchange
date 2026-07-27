import { HENCH_TRAITS } from "../data/bastion";
// ============================================================================
// MY BASTION REGISTRY - the facilities system, as one self-contained unit.
//
// This module owns my MUTABLE registries and everything that writes to or reads
// them. That's the point: those tables start empty and get filled at load time by
// registerFacility(), so if I let the tables and the registration live in
// different modules, my import graph would decide when they got populated - the
// static initialisation-order problem in ESM clothing. Keeping them together
// makes the order a property of this file instead of an accident of who imported
// whom.
//
// My dependencies point ONE WAY:  lib/util + data/bastion  <-  me  <-  app.tsx
// Nothing here reaches back into my app.
// ============================================================================

import { pick, pickN } from "../lib/util";
import { FURNISHING_TIERS } from "../data/bastion";
import type { FacilityBehavior } from "../types";
import { FacilitySpec } from "../types";
import type { AppState, Facility } from "../types";
import { BASTION_FACILITIES, FACILITY_SIZE_HIRELINGS, HIRELING_LOSS_GENERIC, bastionSizeCost } from "../data/bastion";
import { CATALOG } from "../data/catalog";

// The facility behavior registry. Where FacilitySpec (registerFacility) declares a room's DATA,
// this declares its BEHAVIOR: the small amount of logic that used to live as `if (f.defId === ...)`
// ladders inside the central resolvers. A slotted room (a pub's taps, an archive's books) says how
// it stocks; a room that arrives configured says so in onBuild. Adding such a room is now one entry
// here instead of a branch in stockFacility AND the invariant gate AND the build path.
export const FACILITY_BEHAVIOR: Record<string, FacilityBehavior> = {};

// Refill a slotted room up to its size-based capacity from the list its form allows, leaving what's
// already there. Pure facility dispatch, and the single home of the loop that used to be copied per room.
export function restockFacilitySlots(fac: Facility, form: any) {
  const beh = FACILITY_BEHAVIOR[fac.defId];
  if (!beh || !beh.slotField) return;
  const field = beh.slotField;
  if (!Array.isArray((fac as any)[field])) (fac as any)[field] = [];
  const have = (fac as any)[field] as any[];
  const cap = beh.slotCount!(fac);
  const av = beh.slotSource!(form).filter((x: any) => !have.includes(x.id));
  while (have.length < cap && av.length) have.push(av.shift().id);
  have.length = Math.min(have.length, cap);
}

// DMG, Basic Facilities: "Basic facilities don't have any game effects, but they can inspire
// roleplaying opportunities and enhance a Bastion's verisimilitude. A Bastion with a kitchen is
// functionally the same as one without, but the former gives you and your players a fun setting to
// start game sessions, have in-character discussions, or introduce new NPCs."
//
// So a basic facility takes no order — orders are "issued to one or more of their Bastion's SPECIAL
// facilities" and the book means it. But the room is where the household LIVES. These are the beats it
// contributes: the household-week generator draws from them, weaves them by day, and hands back a story
// of the week when the turn resolves (see runHouseholdWeek). Any facility with a task table narrates —
// basic or special — so this pool is read by CAPABILITY, not category. No gold, no DT, no order, no
// event roll: a keep should not draw raiders by scrubbing a floor. They exist to be read from.
export const BASTION_LIFE_TASKS: Record<string, any> = {
};

// Story-prompt flavor for a facility once its lord has fallen — keyed by facility type, tinted by the bastion's form.
export const FACILITY_RUIN = {
};

export function ruinFacilityFlavor(def, form) {
  const t = def && FACILITY_RUIN[def.id];
  if (t && typeof t === "object") return t[form && form.id] || t.keep || "";   // form-keyed: the line already speaks its house
  const base = t || "the space stands silent, its purpose faded, dust settling where work once was.";
  return (form ? "Amid " + form.flavor + ", " : "") + base;                     // legacy string entry: prefix-tint
}

export const HENCH_FIRST = ["Bree", "Corvin", "Dagna", "Emory", "Fenn", "Goro", "Halia", "Isolde", "Jory", "Kesh", "Lorra", "Mabon", "Nessa", "Orin", "Pella", "Quill", "Rurik", "Senna", "Tobin", "Ysolde"];

export const HENCH_LAST = ["Ashdown", "Brightwood", "Coalfield", "Duskwater", "Emberly", "Fairwind", "Greenbottle", "Hollowick", "Ironwright", "Kettle", "Lightfoot", "Marsh", "Nettle", "Oakhale", "Pyre", "Quarry", "Rushmoor", "Stoutmantle", "Thornhill", "Underbough"];

export const HENCH_ROLES = ["Steward", "Guard", "Cook", "Scribe", "Apprentice", "Groundskeeper", "Porter", "Hostler", "Herbalist", "Smith's mate", "Quartermaster", "Runner", "Watchman", "Housekeeper", "Clerk"];

export const randHench = () => ({ name: pick(HENCH_FIRST) + " " + pick(HENCH_LAST), role: pick(HENCH_ROLES), traits: pickN(HENCH_TRAITS, 3) });

export const FURNISHING_TIER_BY_ID: Record<string, any> = {}; FURNISHING_TIERS.forEach((t) => { FURNISHING_TIER_BY_ID[t.id] = t; });

export const furnTierIndex = (id) => Math.max(0, FURNISHING_TIERS.findIndex((t) => t.id === (id || "basic")));

// What each room comes with — taken from the facility's own DMG entry, so the free furniture is the
// furniture the book says is there.
// ---- WHAT A THING BECOMES WHEN YOU SPEND ON IT -------------------------------------------------
// A slot is what the room HAS. This is what that thing is CALLED, at each of the five tiers, and it
// is keyed "slot" or "slot@form" — write the ladder once, override it only where the house actually
// changes the answer. A forge is a forge in a cavern and on a ship; a bed is not.
//
// Two axes that layer rather than multiply: 49 slots x 5 tiers x 8 forms is 1,960 strings, and 1,960
// mediocre strings are worse than 245 good ones. The QUALITY axis is the ladder; the FORM axis is a
// sparse override. Anything with no override falls through to its default, which is correct: most
// furniture doesn't care what shape the building is.
//
// [COPYRIGHT] Every one of these is the Exchange's own writing. The DMG names the noun ("a forge, an anvil") and
// that noun is scenes a faire — you cannot write a smithy without a forge in it, so nobody owns it.
// What it's CALLED as it climbs is mine, and it's the part the goat actually reads.
//
// The player can rename and rewrite any of it. This is the opening offer, not the last word.
export const FURNISHING_LADDER = {
  // ---- BEDROOM ----
  // ---- DINING ----
  // ---- PARLOR ----
  // ---- COURTYARD ----
  // ---- KITCHEN ----
};

// The ladder for a slot in a house: the form's own if it has one, otherwise the slot's default.
// Whitelist: a slot with no ladder gets none, and the caller falls back to the plain noun.
export function furnishingLadder(slot, form) {
  const f = form && form.id;
  return (f && FURNISHING_LADDER[slot + "@" + f]) || FURNISHING_LADDER[slot] || null;
}

// What this thing is called at this tier, in this house. Falls back to the plain noun the room
// came with, so a slot nobody has written a ladder for still renders.
export function furnishingName(slot, tier, form, fallback) {
  const l = furnishingLadder(slot, form);
  if (!l) return fallback || slot;
  const i = Math.max(0, furnTierIndex(tier || "basic"));
  return l[Math.min(i, l.length - 1)] || fallback || slot;
}

export const FACILITY_FURNISHINGS = {
  // basics: "nonmagical furnishings and decor appropriate for that facility"
  // specials: each entry's own description
  // DMG, Library: "This Library contains a collection of books plus one or more desks and reading
  //   chairs." (The desks-and-BOOKSHELVES line belongs to the ARCANE Study, a different room that
  //   takes the Craft order and needs an Arcane Focus. This table was written from the wrong entry.)
  // DMG, Training Area: "It might contain inanimate targets (for weapon practice), padded mats, and
  //   other equipment."
  // DMG, Greenhouse > Fruit of Restoration: "One plant in your Greenhouse has three magical fruits
  //   growing on it... The plant replaces all picked fruits daily at dawn, and it can't be
  //   transplanted without killing it." The plant is furniture, because it cannot leave.
};

// What the free furniture is actually WORTH.
//
// The DMG prices the room, not the furniture — and a room's cost is mostly the room: walls, roof,
// floor, the days of labour. So the Exchange's assumption (labelled; the book doesn't say this) is
// that **30% of a facility's build cost is its furnishings**, and the rest is construction.
//   Cramped 500 gp -> 150 gp of furniture · Roomy 1,000 -> 300 · Vast 3,000 -> 900
//
// That 30% is then split by weight, because a chair is not a workbench. The weights are relative
// only — they decide shares of the same pot, not prices.
export const FURNISH_SHARE_OF_ROOM = 0.30;

export const FURNISHING_WEIGHT = {
};

export const furnWeight = (slot) => FURNISHING_WEIGHT[slot] || 3;

// A Serviceable piece is worth its share of the room's furniture money. Anything finer is worth what
// the DMG says an Art Object of that tier is worth — because that is what it now is.
// Where the SRD actually prices the thing, the SRD wins. It's a real number from a real table, and a
// guess has no business overriding it. `srd` is a catalog id; `srdMult` is how many of them the room
// has (the DMG's Workshop "comes equipped with SIX different kinds of Artisan's Tools").
export const furnSrdValue = (facDefId, slot) => {
  const def = (FACILITY_FURNISHINGS[facDefId] || []).find((f) => f.slot === slot);
  if (!def || !def.srd) return null;
  const cat = CATALOG[def.srd];
  if (!cat || cat.gp == null) return null;
  return Math.max(1, Math.round(cat.gp * (def.srdMult || 1)));
};

export function furnishingValue(fac, fn) {
  if (!fac || !fn) return 0;
  const tier = FURNISHING_TIER_BY_ID[fn.tier || "basic"] || FURNISHING_TIERS[0];
  if (tier.gp > 0) return tier.gp;                              // upgraded: it's an Art Object of that tier now
  const srd = furnSrdValue(fac.defId, fn.slot);
  if (srd != null) return srd;                                  // the SRD priced it; don't guess over a real table
  // Everything the SRD doesn't price (a forge, a bed, a workbench) splits what's LEFT of the room's
  // furniture money, by weight.
  const list = FACILITY_FURNISHINGS[fac.defId] || [];
  const pot = Math.round(bastionSizeCost(fac.size) * FURNISH_SHARE_OF_ROOM);
  const spoken = list.reduce((n, f) => n + (furnSrdValue(fac.defId, f.slot) || 0), 0);
  const rest = Math.max(1, pot - spoken);                       // the SRD's share comes off the top
  const unpriced = list.filter((f) => furnSrdValue(fac.defId, f.slot) == null);
  const total = unpriced.reduce((n, f) => n + furnWeight(f.slot), 0) || 1;
  return Math.max(1, Math.round(rest * (furnWeight(fn.slot) / total)));
}

// Furnish a room the way the book says it arrives: with what it needs, at no cost.
// The room arrives furnished, in ITS OWN VOICE. A cavern's bedroom does not start with "a bed"; it
// starts with a sleeping shelf cut in the rock, because that is what a bedroom is when the bedroom is
// underground. Same slot, same mechanic, same everything — a different house.
export function furnishFacility(s: AppState, fac: Facility, form?) {        // form omitted = the plain nouns the room came with
  const list = FACILITY_FURNISHINGS[fac.defId] || [];
  if (!Array.isArray(fac.furnishings)) fac.furnishings = [];
  list.forEach((f) => {
    if (fac.furnishings!.some((x) => x.slot === f.slot)) return;
    fac.furnishings!.push({ id: "fn" + s.nextId++, slot: f.slot,
      name: furnishingName(f.slot, "basic", form, f.name),
      plural: !!f.plural, tier: "basic", note: "" });
  });
  return fac.furnishings;
}

export const FACILITY_ROLES: Record<string, any> = {};          // defId -> [job titles], filled in order by staffFacility (else the generic pool)

export const FACILITY_STAFF_BY_SIZE: Record<string, any> = {};  // defId -> { cramped, roomy, vast } — a basic room's cosmetic household, by size

export function facEstablishment(fac) {
  const def = BASTION_FACILITIES[fac.defId] || {};
  if (def.kind === "basic") return (FACILITY_STAFF_BY_SIZE[fac.defId] || {})[fac.size] || 0;   // basics: cosmetic room-folk, size-scaled
  const base = def.hirelings || 0;
  const bonus = (FACILITY_SIZE_HIRELINGS[fac.defId] || {})[fac.size] || 0;
  return base + bonus;
}

// Fill a facility to its establishment with named, rolled-up people. Called when the room is raised
// and whenever the household recovers — never by the player.
export function staffFacility(s: AppState, fac: Facility, count?) {          // count omitted = fill to establishment (see below)
  if (!Array.isArray(fac.henchmen)) fac.henchmen = [];
  const want = count == null ? facEstablishment(fac) - fac.henchmen.length : count;
  const roles = FACILITY_ROLES[fac.defId] || null;              // this room's own job titles, filled in order (clamped)
  for (let i = 0; i < want; i++) {
    const r = randHench();
    const role = roles ? roles[Math.min(fac.henchmen.length, roles.length - 1)] : r.role;
    fac.henchmen.push({ id: "h" + s.nextId++, name: r.name, role, traits: r.traits || [], bonds: [], note: "" });
  }
  return fac.henchmen;
}

// What carries people off. Two sources, both honest:
//   • Faerûn's own, from the SRD 5.1 "Diseases" section (CC BY 4.0): Cackle Fever, Sewer Plague, Sight Rot.
//   • The ones that actually emptied medieval households, under the names those households used.
// A hireling who dies gets a cause, and the cause goes on the stone. Nobody in this keep dies of
// "removed from the roster".
export const ILLNESS_FAERUN = ["cackle fever", "sewer plague", "sight rot"];                          // SRD 5.1, CC BY 4.0

export const ILLNESS_MEDIEVAL = [
  "consumption", "the bloody flux", "quinsy", "St Anthony's fire", "the ague",
  "the sweating sickness", "winter fever", "lockjaw", "gaol fever", "the dropsy",
];

export const ILLNESSES = [...ILLNESS_FAERUN, ...ILLNESS_MEDIEVAL];

export const rollIllness = () => pick(ILLNESSES);

// Why someone left. Keyed by facility so the reason smells of the room they worked in — the same
// trick as the ruin flavor and the slice-of-life tables. House content: it decides nothing, it just
// gives the log something worth reading, and a writer something to pick up.
export const HIRELING_LOSS = {
  workshop: [
    { fate: "alive", text: "took a chisel through the hand and won't hold one again" },
    { fate: "alive", text: "was offered a master's bench in the city and took it, with apologies" },
    { fate: "alive", text: "burned a month's work by accident and couldn't face the shop after" },
    { fate: "dead",  text: "caught {illness} off the varnish and did not recover" },
    { fate: "alive", text: "argued about the right way to joint a corner, was proved wrong, and left rather than admit it" },
    { fate: "alive", text: "simply stopped coming. Their tools are still on the rack, squared away" },
  ],
  smithy: [
    { fate: "alive", text: "took a spark in the eye and can no longer see to work" },
    { fate: "alive", text: "was hired away by an armourer with deeper pockets and a warmer forge" },
    { fate: "alive", text: "quarrelled over the temper of a blade and walked out mid-quench" },
    { fate: "dead",  text: "went out for coal in the cold, took {illness}, and was gone inside the month" },
    { fate: "alive", text: "grew tired of hammering other people's fortunes and went to make their own" },
    { fate: "alive", text: "left their apron folded on the anvil, which said everything" },
  ],
  garden: [
    { fate: "dead",  text: "went to bed with {illness} after the wet season and did not rise" },
    { fate: "alive", text: "followed a travelling herbalist south and did not look back" },
    { fate: "alive", text: "was blamed for the blight, unfairly, and would not stay to be blamed twice" },
    { fate: "alive", text: "found the beds gone to weed once too often and gave up on them" },
    { fate: "alive", text: "took a cutting of every plant they loved and vanished before dawn" },
    { fate: "alive", text: "said the garden had stopped listening to them, and perhaps it had" },
  ],
  library: [
    { fate: "alive", text: "read something they shouldn't have and has not been quite right since" },
    { fate: "alive", text: "was poached by a rival's library for twice the wage and half the dust" },
    { fate: "dead",  text: "took {illness} in the long dark of the reading months and never shook it" },
    { fate: "alive", text: "grew afraid of the room after dark and would not say why" },
    { fate: "alive", text: "left to finish a book of their own, which is a kind of leaving you can't argue with" },
    { fate: "dead",  text: "was found asleep at the desk one morning, and did not wake" },
  ],
  barracks: [
    { fate: "dead",  text: "took {illness} in the wet and was buried by the wall they'd have died on" },
    { fate: "alive", text: "went home to a farm and a family who'd waited long enough" },
    { fate: "alive", text: "picked a fight they couldn't win with someone who wouldn't forget" },
    { fate: "alive", text: "took another lord's coin — better fed, better paid, no worse an oath" },
    { fate: "alive", text: "walked their post one last time, laid down their spear, and walked out the gate" },
    { fate: "alive", text: "was owed a reason to stay and never given one" },
  ],
  armory: [
    { fate: "dead",  text: "cut themselves on a rusted edge, took {illness} from it, and lost more than the arm" },
    { fate: "alive", text: "was caught selling the good steel out the back and left before the reckoning" },
    { fate: "alive", text: "counted the racks one time too many and could not bear it again" },
    { fate: "alive", text: "took service with someone whose armoury saw actual use" },
    { fate: "alive", text: "grew old among other people's weapons and finally noticed" },
    { fate: "alive", text: "left a full inventory in a neat hand, and nothing else" },
  ],
  storehouse: [
    { fate: "alive", text: "was ruined by a deal they should have seen coming and could not show their face" },
    { fate: "alive", text: "left with a caravan and a better offer, having done the arithmetic" },
    { fate: "dead",  text: "took {illness} on the road and never made it back with the ledger" },
    { fate: "alive", text: "was accused of skimming — wrongly — and left rather than be watched" },
    { fate: "alive", text: "grew tired of selling other people's things" },
    { fate: "alive", text: "balanced the books to the copper, closed them, and was gone by morning" },
  ],
};

export function hirelingLossReason(fac) {
  const table = (fac && HIRELING_LOSS[fac.defId]) || HIRELING_LOSS_GENERIC;
  const r = pick(table);
  const illness = r.text.includes("{illness}") ? rollIllness() : null;
  return { fate: r.fate, illness, text: r.text.replace("{illness}", illness || "") };
}

// THE SEAM. A facility plugs its own reaction tables in here (by defId); until it does, the general
// fallback above runs — including for keep-wide events with no facility in play. Facilities author
// partial overrides — any of { why, to, generic } — and the rest falls through to the general set.
export const FACILITY_REACTIONS: Record<string, any> = {};   // defId -> { why?, to?, generic? }  (authored with each facility, later)

// 4 · SIZE FLAVOR — new socket (declaration + read + bedroom table)
export const BASTION_SIZE_FLAVOR: Record<string, any> = {};   // defId -> { form: [cramped, roomy, vast] }

// The facility plug-in contract. A room is minted by handing registerFacility one cohesive spec
// instead of poking eight separate registries by hand. Every field is optional, so a room declares
// only what it has; the function fans the spec out to the same tables the rest of the engine already
// reads. Adding a facility becomes: write one spec, call this once. Arcane Study is the worked example.
export function registerFacility(spec: FacilitySpec) {
  const id = spec.id;
  if (spec.roles)            FACILITY_ROLES[id] = spec.roles;
  if (spec.staffBySize)      FACILITY_STAFF_BY_SIZE[id] = spec.staffBySize;
  if (spec.furnishings)      FACILITY_FURNISHINGS[id] = spec.furnishings;
  if (spec.furnishingWeight) Object.assign(FURNISHING_WEIGHT, spec.furnishingWeight);
  if (spec.furnishingLadder) Object.assign(FURNISHING_LADDER, spec.furnishingLadder);
  if (spec.sizeFlavor)       BASTION_SIZE_FLAVOR[id] = spec.sizeFlavor;
  if (spec.ruin)             FACILITY_RUIN[id] = spec.ruin;
  if (spec.reactions)        FACILITY_REACTIONS[id] = spec.reactions;
  if (spec.lifeTasks)        BASTION_LIFE_TASKS[id] = spec.lifeTasks;
}
// ═════════════════════════════ ARMORY mint ═════════════════════════════════
// DMG: "An Armory contains mannequins for displaying armor, hooks for holding
// Shields, racks for storing weapons, and chests for holding ammunition."
// Level 5, Roomy, 1 hireling, Trade. The mechanics (Stock Armory cost, the
// d8-for-d6 on any defender-loss roll, and the expend-when-the-event-ends) live
// in the engine and the def. THIS block is the room itself: what it is in each
// house, who keeps it, and the week it has when nobody is looking.
registerFacility({
  id: "armory",
  roles: ["Quartermaster"],
  furnishings: [{ slot: "armorstand", name: "mannequins for displaying armor", plural: true }, { slot: "weaponrack", name: "racks for storing weapons", plural: true }, { slot: "shieldhooks", name: "hooks for holding Shields", plural: true }, { slot: "ammochests", name: "chests for holding ammunition", plural: true }],
  furnishingWeight: { armorstand: 4, weaponrack: 3 },
  furnishingLadder: {
  armorstand:          ["a plain wooden stand or two for a harness","good armor-stands, one to a suit, kept oiled","carved mannequins that hold a harness as a body would","fitted armor-forms of joined oak, each shaped to its owner","a rank of masterwork armigers a guildsman signed, that wear steel like the men who owned it"],
  "armorstand@keep":   ["a soldier's stand knocked together from spar-wood","good stands enough for the watch's harness","carved forms that hold a harness ready to don at a run","fitted forms shaped to the captain's own war-harness","the keep's own armigers, that have held the same house's steel through four generations of siege"],
  "armorstand@tower":  ["a peg-stand for the one suit anyone here owns","a good stand for the guard-captain's harness","a carved form that holds a harness the mage never wears","a fitted form of dark wood, ceremonial and cold","a masterwork armiger that wears an archmage's parade-plate and has never seen a blow"],
  "armorstand@manor":  ["a hall-stand for a suit of show-armor","good stands for the family's harness and the hunt's","carved forms that hold the ancestral plate for the hall","fitted display-forms of figured wood beneath the portraits","masterwork armigers wearing plate three lords deep, the pride of the long gallery"],
  "armorstand@cavern": ["a stone ledge and a peg for a hung harness","good stands of rot-proof wood the damp can't reach","carved stone forms that hold a harness dry in the deep","fitted forms cut from the rock, fleece-lined against rust","armigers cut whole from the cavern's dark stone, that have kept steel bright in the wet for a hundred years"],
  "armorstand@ruin":   ["a salvaged stand scrubbed sound","good stands mended from a grander hall's wreck","carved forms rebuilt in the old style, re-oiled","fitted forms restored from the ruin's fallen armoury","the great house's own armigers, raised again from the rubble and wearing steel once more"],
  "armorstand@grove":  ["a forked bough that holds a harness off the wet ground","good grown stands the wood keeps upright and dry","carved living forms the grove shaped to hold a harness","fitted forms of heartwood that leaf a little each spring under the steel","armigers grown whole from standing trunks, that the wood tends and will not let the rust reach"],
  "armorstand@vessel": ["a cleated stand lashed against the roll","good sea-stands fiddled and barred for weather","carved forms bolted to the deck, harness gasketed against salt","fitted forms gimballed to stay upright in any sea","the great-cabin armigers off a broken flagship, that have worn boarding-steel dry across three oceans"],
  "armorstand@hamlet": ["a peg on the big-house wall for the muster-harness","a good stand for the two suits the green can field","carved forms that hold the militia's best plate ready","fitted forms of scrubbed pine in the big house's hall","the village's own armigers, that have worn the green's muster-steel since anyone can remember"],
  weaponrack:          ["a plain rack of spears against the wall","a good weapon-rack, everything to its slot","tall racks with a rail, blades and hafts ranked by reach","fitted rack-walls floor to ceiling, every weapon to its notch","a masterwork armoury-wall a bladesmith set out, ranked and full and smelling of oil and steel"],
  "weaponrack@keep":   ["a soldier's rack of billhooks and spears","good racks of the watch's working steel","tall racks ranked by reach, the drill-weapons nearest the door","fitted rack-walls of the keep's whole arms, ready to snatch and run","the keep's own arms-wall, that has been emptied in a hurry more nights than anyone kept count of"],
  "weaponrack@tower":  ["a rack for the guard's spears at the stair-foot","good racks of the tower-watch's arms","tall racks the stair climbs past, arms ranked and dusted","fitted rack-walls of arms the mage keeps and never lifts","a masterwork arms-wall of blades warded against rust, that has waited, bright, for a fight that never came"],
  "weaponrack@manor":  ["a hall-rack of hunting spears and a sword or two","good racks of the family's arms and the hunt's","tall racks of matched blades ranked beneath the trophies","fitted rack-walls of the ancestral steel, spines all out","a masterwork arms-wall a smith signed, more admired than gripped, the finest steel in the county"],
  "weaponrack@cavern": ["a rack pegged into the rock for a few spears","good racks of wood the cave-damp can't warp","tall racks fitted to the living rock, arms oiled against the wet","fitted rock-cut rack-walls, lamp-niches between the blades","arms racked in shelving cut whole from the cavern wall, that have kept an edge keen in the deep for a hundred years"],
  "weaponrack@ruin":   ["a salvaged rack and the arms it still holds","good racks mended from the old armoury's wreck","tall racks rebuilt in the grand style, re-oiled","fitted rack-walls restored from the ruin's fallen arms","the great house's own arms-wall, raised again where the ivy had it, and filling with steel once more"],
  "weaponrack@grove":  ["a bough-rack of spears and a strung bow","good grown racks the wood roofs against the rain","tall racks of grown wood, bows and spears kept dry","fitted living rack-walls the grove keeps close and dry","arms racked in standing trees the wood shaped and shelters, that will not let a bowstring rot"],
  "weaponrack@vessel": ["a fiddled rack of boarding-pikes by the mast","good sea-racks with bars across the arms","tall racks battened and barred, cutlasses to their notches","fitted bulkhead rack-walls, gasketed against the salt","the great-cabin arms-wall off a flagship, that has armed a boarding-party dry across three oceans of weather"],
  "weaponrack@hamlet": ["a rack of billhooks and one good spear","a good rack of the muster's working arms","tall racks of the militia's kept steel, ranked by hand","fitted rack-walls of the green's whole muster-arms, oiled","the village's own arms-wall in the big house, that has armed the green against wolves and worse for three generations"],
},
  sizeFlavor: {
  keep:   ["An arms-closet off the guardroom \u2014 a rack, a stand, and oil enough to keep an edge.","A proper armoury now, stands and racks and the watch's whole harness to hand.","A great muster-hall of arms, stands ranked down the middle and steel to the rafters at either end."],
  tower:  ["A landing given a rack and a stand, the tower's one place for arms.","A proper armoury coiled into the tower, harness at the wall and blades up the stair.","A great arms-hall spiralling the tower's height, rack on rack of steel climbing into the lamplit dark."],
  manor:  ["A small arms-room, a display-stand and a rack of hunting spears.","A proper armoury, stands and racks enough for a gentleman's whole harness and the hunt's.","A grand arms-gallery the length of the wing, ancestral plate ranked beneath the portraits."],
  cavern: ["A niche in the rock with a stand and a rack, dry and lamp-warmed against the rust.","A proper rock-cut armoury, stands and racks safe from the cave-damp.","A great vaulted arms-hall deep in the stone, steel racked into walls that climb past the lamplight."],
  ruin:   ["A corner of a great old armoury made sound, a stand and one filled rack.","An armoury reclaimed to use, the near stands re-oiled and the near racks re-hung.","The great muster-hall entire, restored and re-armed, a room built to harness a garrison."],
  grove:  ["A stand and a sheltered rack in a green nook, roofed against the rain.","A proper armoury-glade, stands and grown racks the wood keeps dry.","A great open arms-hall under a living roof, racks of steel ranked oddly among the trees."],
  vessel: ["An arms-locker in a corner of the hold, a lashed rack and a barred stand.","A proper ship's armoury, gimballed stands and battened racks below.","The whole hold given over to arms, stands and barred racks the length of the keel."],
  hamlet: ["The big house's arms-corner, a rack of billhooks and one good stand.","A proper muster-armoury in the best house, stands and racks of the green's kept arms.","The great room of the biggest house given over to steel, arming the whole green at a bell."],
},
  ruin: {
  keep:   "The armoury door hangs open on cold racks, the harness gone to red rust on its stands, a single billhook left where a hand dropped it running, and the oil-pot dry on the bench.",
  tower:  "The tower arms-wall has come down the stair in a slide of rusted steel and rotted leather, the one parade-harness fallen off its form and greening on the flags, the lamp-niches all dark.",
  manor:  "The arms-gallery lies under grey dust, the ancestral plate blind with rust on its forms, the matched blades foxed and stuck in their notches, a county's pride gone quietly to ruin beneath the portraits.",
  cavern: "The rock-cut racks hold nothing now but damp and the smell of it, the harness weeping rust on its stone forms, the ammunition-chests burst and their contents furred green in the dark they were cut to keep out.",
  ruin:   "It was a ruin once, and made an armoury, and is a ruin again \u2014 the mended racks fallen a second time, the re-oiled harness back to rust on the ground, the arms it was re-hung with scattered where they slid.",
  grove:  "The green roof has come down on the armoury-glade, the grown racks split and sprouting, the harness under a slick of leaves with the rust coming through, a strung bow gone slack and mouldered on its bough.",
  vessel: "The arms-locker is awash, the racks burst and their cutlasses rolling rust in the bilge, the harness-forms hanging askew off their bolts, salt in every chest that ever held dry powder.",
  hamlet: "The green's muster-steel has gone to rust in the abandoned big house \u2014 billhooks, the two good suits, the militia's whole kit \u2014 the rack collapsed, the stand robbed for firewood, and no one left to answer the bell.",
},
  reactions: {
  why: { slovenly: "the harness left un-oiled and an edge going to rust, as {d} leaves things", idle: "the racks left in the disorder of the last muster, which {d} had meant to set right", green: "a blade left wet and spotting, {d} not yet knowing to dry it", sly: "or so {d} swore the inventory had been kept", proud: "and {d} would not be told the count had come up short" },
  to: [
    { tag: "quarrelsome", d: -2, say: "and {r} oiled the whole rank sooner than look at it, and said so at length" },
    { tag: "sharp-tongued", d: -1, say: "and {r} took the rust off and said what {r} thought of a soldier who leaves steel wet" },
    { tag: "proud", d: -1, say: "and {r} said nothing, and re-counted the whole rack {r}'s own way" },
    { tag: "forgiving", d: 1, say: "and {r} only wiped the blades down and re-hung them, the way {r} does" },
    { tag: "patient", d: 1, say: "and {r} oiled the harness through and set the count straight without a word" },
    { tag: "soft-hearted", d: 1, say: "and {r} cleaned the edge and left it keen and dry on the rack for them" },
  ],
  generic: { d: 0, say: "and {r} left the racks as they stood" },
},
  lifeTasks: {
  keep: ["oiled the watch's harness suit by suit against the coming damp","counted the arms off the rack twice, because the first count came up one spear short","put a new edge on the drill-blades a hard week of muster had dulled","re-fletched a chest of arrows and set them by, ready to the hand","mended a harness-strap that had parted at the worst possible drill","stood the whole muster to, timed how fast the racks emptied, and was not satisfied","scoured the red off a billhook some fool had left out in the wet","laid in oil, whetstones, and spare straps before the season closed the roads","showed a green defender which rack was whose in the dark, twice, until it stuck","waxed the bowstrings and hung them where the wall-walk draught can't reach","turned out a chest of ammunition, found it sound, and sealed it up again","banked the armoury lamp and left the cold racks to keep the keep's steel keen"],
  tower: ["oiled the one guard-harness nobody here will ever wear into a fight","counted arms the tower keeps and does not use, and found the count exact","put an edge on ceremonial blades that have drawn nothing but light","dusted the arms-wall the stair climbs past and disturbed a warding sigil doing it","mended a strap on a parade-harness against a review that may never come","stood the tower-guard to their arms once, quietly, to see that they still could","scoured a spot of rust off a blade the damp had somehow reached in the dry tower","laid in oil and whets the mage will never ask after and always expects present","showed the new guard where the arms hang, and which one not to touch","waxed a bowstring while the tower ticked and the lamp refused to gutter","turned out an ammunition-chest older than anyone living and found it, oddly, sound","banked the lamp and left the tower's bright unused arms to their long wait"],
  manor: ["oiled the ancestral plate that hangs beneath the portraits and is never worn","counted the hunt's arms in against a shoot, and one good spear had walked","put an edge on the hunting-blades the last party had let go dull","polished a matched pair of duelling-swords no gentleman here means to use","mended the strap on a harness three lords deep and worth a farm","stood the two footmen who can hold a spear to their arms, discreetly","scoured a bloom of rust off a blade a damp gallery had spotted","laid in oil and wax fit for a county's finest steel, and charged it to the house","showed a new groom which arms are the family's and which the hunt's","waxed the bowstrings for the season's shooting and hung them by the door","turned out the ammunition-chest, counted powder and shot, and re-sealed it","drew the gallery curtains, banked the fire, and closed the good room on its steel"],
  cavern: ["oiled the harness against a damp that finds every seam in the deep","counted the arms off the rock-cut racks and marked which the wet had reached","put an edge on blades the cave-cold keeps but the cave-damp dulls with rust","dried and re-oiled a spear that had begun, in the wet dark, to weep red","mended a strap the deep damp had stiffened past buckling","stood the guard to their arms by lamplight, and timed them by the drip of water","scoured the rust off a billhook the last flood had reached","laid in oil against the wet and lamps against the dark, both in quantity","showed a new hand which rack is which where a wrong turn means the deep","waxed the bowstrings twice, because down here once is never enough","turned out an ammunition-chest, found the powder dry against all odds, and sealed it deeper","checked every lamp round the racks, because arms you cannot find are arms you do not have"],
  ruin: ["oiled harness salvaged from an armoury four hundred years cold","counted arms the ruin had kept and arms the centuries had taken","put an edge on a blade that had waited, half-buried, for a hand to take it up","re-hung a rack the last age had pulled down, and filled it as far as it would go","mended a strap with the last good leather the old armoury had left behind","stood the new garrison to arms in a hall built to muster the dead one's","scoured four centuries of rust off a spearhead and found the maker's mark beneath","laid in oil and whets, the first this room had held since the house fell","showed a defender a rack, and the name carved above it by a soldier long dead","waxed a bowstring at a bench where the marks of the last stringer still showed","turned out a chest walled up since the fall, and set what it held back with care","banked the lamp and left the great muster-hall to the owls that share its far end"],
  grove: ["oiled the steel against a green damp the whole wood breathes at it","counted bows and spears in from the racks, and the wood had claimed none this week","put an edge on a blade, and felt the grove's old unease with the doing of it","dried and re-strung a bow the green wet had gone slack","mended a strap with hide the grove more or less willingly gave up","stood the few who bear arms to them, in a clearing that would rather they didn't","scoured the rust the green air brings off a spearhead almost as fast as you clean it","laid in oil and wax and hung the bowstrings high, where the damp comes last","showed a new hand which bough holds which arm, and how to keep steel among trees","waxed the strings twice and let a wren keep the rafter it had chosen","turned out the ammunition-chest, found it sound under its lid of moss, and re-sealed it","banked the lamp under the living roof and left the racks to the green dark"],
  vessel: ["oiled the boarding-arms against a salt that eats steel for its living","counted cutlasses and pikes in from the racks with one foot braced against the roll","put an edge on the boarding-blades between watches, while the ship worked and groaned","dried and re-oiled a cutlass the last blow had left the sea to find","re-lashed a rack the weather had shaken loose in the night","stood the watch to their arms and timed how fast they cleared the rack at a roll","scoured the salt-rust off a pike-head before it could take proper hold","laid in oil and slush and barred every chest before a sky that meant to blow","showed a new hand which rack is which in a dark hold that will not hold still","waxed the bowstrings against a damp that no ship has ever kept out","turned out the powder-chest, found it dry against the odds, and sealed it double","latched the locker, barred the racks, and left the arms to the swell and the dark"],
  hamlet: ["oiled the muster's billhooks and the two good suits the green can field","counted the militia's arms in after drill, and every haft was accounted for","put an edge on the working steel the last wolf-winter had blunted","re-shafted a billhook whose haft had cracked across at the muster","mended the strap on the one harness the green is proud of","stood the militia to their arms of an evening, more for the doing than the need","scoured the rust off a spearhead a leaky roof had spotted over the winter","laid in oil and whets for the whole green's kit, out of the common purse","showed the miller's boy which rack is whose against the day the bell rings","waxed the one good bowstring and hung it dry by the big-house door","turned out the powder the green keeps for the fowling-piece, found it dry, and re-sealed it","banked the fire, closed the arms-corner, and left the green's muster-steel to the dark"],
},
});

// ═══════════════════════════ end ARMORY mint ═══════════════════════════

registerFacility({
  id: "arcane_study",
  roles: ["Scholar"],
  furnishings: [{ slot: "studydesk", name: "a writing desk" }, { slot: "bookshelves", name: "bookshelves", plural: true }, { slot: "tools_carve", name: "a woodcarver's set for shaping wands, rods, and staves", srd: "g_tool_woodcarver" }, { slot: "tools_jewel", name: "a jeweler's kit for rings, orbs, amulets, and crystal foci", srd: "g_tool_jeweler" }],
  furnishingWeight: { studydesk: 4, bookshelves: 3 },
  furnishingLadder: {
  studydesk:          ["a plain writing desk","a good writing desk with a drawer that locks","a broad desk with a tooled-leather top and a rank of little drawers","a scholar's desk with a reading-stand, sunk inkwells, and a lamp on a swing-arm","a master's desk, its every drawer and hinge made to a wizard's exact and secret order"],
  "studydesk@keep":   ["a campaign desk that folds flat","a solid oak desk built to take hard use","a broad officer's desk with a locking despatch drawer","a fitted desk with map-drawers and a rack for sealed orders","the keep's own writing desk, that has drafted terms of surrender and letters home in the same hour"],
  "studydesk@tower":  ["a plank on trestles under the window","a good desk wedged into the tower's curve","a curved desk fitted to the round wall, drawers all the way round","a scholar's desk with an astrolabe-stand and a lamp that follows the hand","a mage's desk that keeps its own inkwells full and its candle from ever guttering the work"],
  "studydesk@manor":  ["a small writing table","a good mahogany writing desk","a fine escritoire with pigeonholes and a tooled-leather top","a lady's writing desk of inlaid woods, every drawer scented with cedar","a masterwork desk a cabinetmaker signed, the pride of the morning room"],
  "studydesk@cavern": ["a slab of dressed stone on two piers","a good desk of close-grained wood the damp can't warp","a broad desk fitted to a niche in the rock, a lamp-shelf cut above it","a scholar's desk of petrified wood, cold and everlasting, its drawers lined in fleece","a desk cut whole from a vein of dark stone, that has held a lamp steady through a hundred years of dark"],
  "studydesk@ruin":   ["a sound old desk salvaged and scrubbed","a good desk mended from the wreck of a grander one","a broad desk rebuilt in the old style, its leather renewed","a scholar's desk restored from the ruin's own fine cabinetry","the great house's own writing desk, brought back to a shine it last held four centuries gone"],
  "studydesk@grove":  ["a plank across two stumps","a good desk of grown wood, smoothed by weather and hand","a broad desk the grove half-grew to shape, moss kept from the drawers","a scholar's desk of living heartwood that leafs a little at the corners each spring","a desk grown whole from a single great root, that the wood tends and will not let rot"],
  "studydesk@vessel": ["a fold-down desk against the bulkhead","a good sea-desk, fiddled and cleated for a roll","a fitted chart-desk beneath the stern-windows, drawers that latch","a scholar's desk gimballed to stay level in any sea, inkwell sunk and stoppered","the great-cabin desk off a flagship long broken up, that has kept a fair hand through three oceans of weather"],
  "studydesk@hamlet": ["a small deal table by the window","a good writing table of scrubbed pine","a broad table with a drawer for the parish papers","a fine writing desk, the best stick of furniture in the house","the village's own writing desk, where every letter and will on the green has been set down for three generations"],
  bookshelves:          ["a plain shelf of books","a good set of bookshelves, well filled","tall bookcases with a rail and a ladder to the top shelf","fitted bookcases floor to ceiling, glazed against the dust","a library-wall of shelves a joiner made to measure, ranked and full and smelling of paper and calf"],
  "bookshelves@keep":   ["a shelf of manuals and muster-rolls","good shelves of leather-bound drill-books","tall cases of campaign histories and standing orders","fitted shelves of bound orders, maps, and the keep's own annals","the keep's own book-wall, where the record of every siege it has stood is shelved in order"],
  "bookshelves@tower":  ["a shelf that follows the stair up","good curved cases fitted to the round wall","tall cases spiralling with the tower stair, a ladder on a rail","fitted shelves rising out of sight into the tower's dark, lamp-niches between","a book-wall that climbs the whole tower, where a shelf you want has a way of being at hand"],
  "bookshelves@manor":  ["a modest glazed bookcase","a good mahogany bookcase, brass-railed","tall glazed cases with a rolling ladder and a rail","fitted library cases of figured wood, the spines all out and dusted","a book-room's worth of cases a master joiner signed, the finest wall in the house"],
  "bookshelves@cavern": ["a shelf cut into the rock","good shelves of wood set into carved niches","tall cases fitted to the living rock, dry against the damp","fitted rock-cut shelving with lamp-niches between, that the cave-damp never reaches","shelves cut whole from the cavern wall, that have kept paper dry and safe in the deep for a hundred years"],
  "bookshelves@ruin":   ["a salvaged shelf or two, scrubbed sound","good cases mended from the old library's wreck","tall cases rebuilt in the grand old style","fitted shelving restored from the ruin's own fallen library","the great house's own book-wall, raised again where the ivy had it, and filling"],
  "bookshelves@grove":  ["a shelf sheltered under a bough","good shelves of grown wood, roofed against the rain","tall cases the grove grew a green roof over","fitted living shelving the wood keeps dry and close, leaves for a canopy","a book-wall grown from standing trees, that the grove roofs and shelters and will not let the weather touch"],
  "bookshelves@vessel": ["a fiddled shelf against the roll","good sea-cases with bars across the fronts","tall fitted cases battened and barred for weather","fitted bulkhead shelving, glazed and gasketed against the salt","the great-cabin book-wall off a flagship, that has kept its calf-bound cargo dry across three oceans"],
  "bookshelves@hamlet": ["a shelf of the family's few books","a good dresser-shelf given over to books","tall cases of the parish's kept books and registers","fitted shelves of the green's whole written memory, well dusted","the village's own book-wall, where every register and receipt and remedy the green has needed is shelved and findable"],
},
  sizeFlavor: {
  keep:   ["A study nook off the wall-walk — a desk, a shelf, and lamplight enough for one to read by.","A proper study now, desk and cases and a chair a scholar can lose a day in.","A great scholar's hall, desks ranked down the middle and books to the rafters at either end."],
  tower:  ["A landing given a desk and a shelf, the one still place in a tower of stairs.","A proper study coiled into the tower, desk at the window and cases up the wall.","A great study spiralling the tower's height, shelf on shelf climbing into the lamp-lit dark."],
  manor:  ["A small book-closet, a writing table and a glazed case and quiet.","A proper study, a good desk and cases enough for a gentleman's whole library.","A grand library-study the length of the wing, cases floor to ceiling and a ladder on a rail."],
  cavern: ["A niche in the rock with a stone desk and a shelf, dry and lamp-warmed.","A proper rock-cut study, desk and fitted shelving safe from the cave-damp.","A great vaulted study deep in the stone, shelves cut into walls that climb past the lamplight."],
  ruin:   ["A corner of a great old library made sound again, a desk and one filled shelf.","A study reclaimed to use, the near cases mended and the near desk scrubbed to a shine.","The great scholar's hall entire, restored and re-shelved, a room built for a college to read in."],
  grove:  ["A desk and a sheltered shelf in a green nook, roofed against the rain.","A proper study-glade, desk and grown shelving the wood keeps dry.","A great open study under a living roof, cases of grown wood ranked among the trees."],
  vessel: ["A chart-desk and a barred shelf in a corner of the cabin, the one dry place to read.","A proper day-cabin study, gimballed desk and battened cases beneath the stern-windows.","The great cabin given over to study, desks and barred shelving the whole beam of the ship."],
  hamlet: ["The front room's writing table and one shelf of books, the green's whole library.","A proper study in the best house, a good desk and cases of the parish's kept papers.","The great room of the biggest house given over to books, shelving the whole green comes to consult."],
},
  ruin: {
  keep:   "The study fire is long cold, the lamp dry, a book still open on the desk at a page nobody now can use, the shelves furred with years of dust and the mice gone at the bindings.",
  tower:  "The desk stands at the tower window under a drift of fallen plaster, the shelves that climbed the stair pulled down in a slide of rotted calf and loosened stone, the lamp-niches all dark.",
  manor:  "The library-study lies under grey sheets and greyer dust, the glazed cases starred and blind, the ladder fallen off its rail, a gentleman's whole reading gone soft and foxed on the shelves.",
  cavern: "The rock-cut shelves hold nothing now but damp and the smell of it, the stone desk streaked where the water finally found its way in, the lamp-niches choked with the dark they were cut to hold back.",
  ruin:   "It was a ruin once, and made a study, and is a ruin again — the mended cases fallen a second time, the scrubbed desk under moss, the books it was re-shelved with gone back to the rot they were saved from.",
  grove:  "The green roof has come down on the study-glade, the grown shelves split and sprouting, the desk under a slick of leaves and rain, the books it sheltered pulped to the mast the wood feeds on.",
  vessel: "The cabin study is awash, the barred shelves burst and their calf-bound cargo turned to grey pith in the bilge, the gimballed desk hanging askew, salt in every drawer that ever held dry paper.",
  hamlet: "The green's whole written memory has gone to damp in the abandoned front room — registers, remedies, receipts — the shelf collapsed, the desk robbed for firewood, and no one left who could read them anyway.",
},
  reactions: {
  why: { slovenly: "the desk left buried and the lamp guttered out, as {d} leaves things", idle: "the books left un-shelved in a slew on the floor, which {d} had meant to see to", green: "the good ink spoiled and a page blotted, {d} not yet having the hand for it", sly: "or so {d} swore the shelves had been set to rights", proud: "and {d} would not be told the catalogue had drifted out of order" },
  to: [
    { tag: "quarrelsome", d: -2, say: "and {r} re-shelved the whole slew sooner than look at it, and said so at length" },
    { tag: "sharp-tongued", d: -1, say: "and {r} set the desk to rights and said what {r} thought of a scholar who won't" },
    { tag: "proud", d: -1, say: "and {r} said nothing, and ordered the shelves again {r}'s own way" },
    { tag: "forgiving", d: 1, say: "and {r} only shelved the books and trimmed the lamp, the way {r} does" },
    { tag: "patient", d: 1, say: "and {r} sorted the whole drift back into its order without a word" },
    { tag: "soft-hearted", d: 1, say: "and {r} cleared the desk and set the good chair and the lamp for them" },
  ],
  generic: { d: 0, say: "and {r} left the books where they lay" },
},
  lifeTasks: {
  keep: ["catalogued the muster-rolls that had drifted out of their order again","bound a blank book for an officer who wanted somewhere to keep his accounts","turned a length of yew into an arcane focus over seven slow evenings","read the keep's own annals looking for the last time the well ran dry","trimmed the study lamp and set it where the wall-walk draught can't reach it","copied a set of orders out fair, twice, because the first hand smudged","named a strange coin a soldier brought up from the ditch, and it was nothing","dusted the shelves and found a book two winters missing behind the annals","sat up late over a problem the desk had refused to give up all day","mended a binding that a damp season had loosened at the spine","read a captured letter and told the captain only what it actually said","banked the study lamp low and left the room to its books and the cold"],
  tower: ["climbed the shelved stair to the one book the whole tower was built around","ground a crystal down to an arcane focus by the light off its own facets","catalogued a shelf that had, overnight, put itself into a different order","bound a blank book whose pages would not, this time, fill themselves","read past midnight while the tower ticked and the lamp refused to gutter","copied a diagram out three times before the lines agreed to lie still","named an object an apprentice was afraid of, and it was, indeed, nothing much","dusted a high shelf and disturbed something that had been comfortable there","sat with a problem while the study's own quiet did half the thinking for him","trued an astrolabe against a star that should not have been where it was","answered a letter that had come a year and a raven to arrive","banked the swing-arm lamp and left the tower's books to keep their own counsel"],
  manor: ["dusted the glazed cases and read a spine or two he had been meaning to","bound a blank book in the good calf for the lady's morning correspondence","turned a length of rosewood into an arcane focus fit for a drawing room","catalogued the library properly, which the last three scholars had all begun","read by the window until the light went and then, guiltily, lit the lamp","copied a receipt out in a fair hand for a neighbour who had admired it","named a curio the family had argued over for a generation, ending the argument","re-shelved a case a visitor had browsed and left, tactfully, in disarray","sat over an Arcana problem while the household took its tea without him","mended the rolling ladder that had come off its rail at the worst moment","answered the morning's letters and left the difficult one for the afternoon","drew the library curtains, banked the fire, and closed the good room on its books"],
  cavern: ["read by lamplight in the one dry room at the cold heart of the rock","cut a shard of cave-crystal into an arcane focus that held the lamplight oddly","catalogued the rock-cut shelves and marked which niches the damp had reached","bound a blank book and set it high, where the stone stays driest","copied a text out before the damp could get to the original","named a thing the miners brought up from a deeper gallery, and wished he hadn't","dusted shelves that gather more dark than dust down here, and lit another lamp","sat with a problem while the deep water moved somewhere below and the lamp held","mended a binding the cave-damp had swollen past closing","checked every lamp round the study, because a dark study down here is a lost one","read the same page twice, listening, and decided the sound was only the rock","banked the study lamp to its safe glow and let the mountain's dark to the door"],
  ruin: ["sorted sound books from spoiled in a library four hundred years abandoned","cut an arcane focus from a shard of the old house's own shattered chandelier","catalogued what the ruin had kept and what the centuries had taken","bound a blank book to replace one the rot had reached past saving","read by the one tall window that still held its glass, in the light it gave","copied a motto off a mantel that nobody now alive could otherwise read","named a thing found walled up behind a case, and set it back where it was found","dusted a shelf and uncovered a name carved by a scholar dead four centuries","sat at the mended desk and felt the company of everyone who had read there before","mended a binding with the last of a glue-pot the old library had left behind","propped a fallen case upright and re-shelved it in the order it seemed to want","banked the lamp and left the great room to the owls that share its far end"],
  grove: ["read in the green quiet with the whole wood listening at the edges","shaped a fallen bough into an arcane focus the grove seemed to approve of","catalogued shelves the wood keeps dry, and marked where a leak had started","bound a blank book and pressed a leaf in the back of it, out of habit","copied a page before the green damp could soften it past reading","named a thing a badger had turned up at the roots, and it was only old iron","dusted the grown shelving and let a beetle keep the place it had chosen","sat with a problem while the grove's long green evening did the rest","mended a binding with sap the wood gave up more or less willingly","re-roofed a corner of the study-glade the last storm had opened to the sky","read the same passage aloud once, to see how the clearing gave it back","banked the lamp under the living roof and left the books to the green dark"],
  vessel: ["read at the gimballed desk with one foot braced against the roll","turned a length of whalebone into an arcane focus between watches","catalogued the barred shelves and re-lashed the ones the last blow had shaken","bound a blank book and stitched it double against a damp that finds every ship","copied the log's arcane notes out fair before the salt could reach the original","named a thing that came up in a net, and told the master it was safe, mostly","dusted the cases and wedged the loose volumes before the weather made an argument","sat over a problem while the ship worked and groaned and the lamp swung steady","mended a binding the salt air had stiffened past turning","checked every batten on the shelves before a sky that meant to blow","read a passenger's letter for them, and softened, a little, what it said","latched the desk, barred the shelves, and left the cabin to the swell and the dark"],
  hamlet: ["kept the parish register up, births and deaths in the same fair hand","shaped a bit of seasoned ash into an arcane focus for the green's one hedge-witch","catalogued the shelf of kept papers the whole hamlet comes to consult","bound a blank book for the miller, who wanted his tallies somewhere safe","read a letter aloud for a family that could not, and left them the reading of it","copied out a remedy for a neighbour whose own copy had gone in the fire","named a coin turned up in a field, and it was old, and it was nobody's","dusted the registers and found an entry that settled a boundary quarrel","sat over a difficult page while the front-room fire burned down beside him","mended a register the mice had been at over a long wet winter","wrote a will out plain for an old man who wanted it done while he could say it","banked the fire, closed the register, and left the green's whole memory to the dark"],
},
});

// ═══════════════════════════ end ARCANE STUDY mint ═══════════════════════════

// ═════════════════════════════ OBSERVATORY mint ═════════════════════════════
// DMG: "Situated atop your Bastion, your Observatory contains a telescope aimed
// at the night sky." Level 13, spell focus, Roomy, 1 hireling, Empower. The
// room's two mechanics — the Observatory Charm and Eldritch Discovery — live in
// the def and the engine (SR-12r/SR-13). THIS block is the room itself: what it
// is in each house, who keeps it, and the week it has when nobody is looking.
registerFacility({
  id: "observatory",
  roles: ["Stargazer"],
  furnishings: [{ slot: "telescope", name: "the telescope" }, { slot: "starcharts", name: "star-charts and tables of motion", plural: true }],
  furnishingWeight: { telescope: 5, starcharts: 3 },
  furnishingLadder: {
  telescope:           ["a spyglass lashed to a post","a sound telescope on a steady tripod","a long brass telescope on a mount that tracks","a fine equatorial scope, clock-driven, its lenses cased in velvet","a master optician's great refractor, that gathers more night than the sky admits to holding"],
  "telescope@keep":    ["the watch-glass, borrowed after dark","a garrison telescope on a swivel post","a long scope on the war-tower mount, graduated for range","a fine clock-driven scope in its own turret, brass against the weather","the keep's great glass, that has counted enemy fires and falling stars with the same cold patience"],
  "telescope@tower":   ["a student's glass at the highest window","a sound scope the tower's curve seems built around","a long scope on a track that rings the topmost room","a fine scope the tower turns beneath, so the eye never leaves its star","the tower's own eye, ground by its first master, that some nights aims itself"],
  "telescope@manor":   ["a gentleman's spyglass on the terrace rail","a drawing-room telescope of good brass","a long scope on a lawn mount the gardener wheels out at dusk","a fine cased refractor in its own belvedere, the pride of the estate","a great glass a duke would envy, in a dome the architect signed"],
  "telescope@cavern":  ["a glass aimed up the one shaft that finds sky","a sound scope at the light-well, mirrors easing the angle","a long scope on a rock-cut cradle, trained up the star-shaft","a fine scope and a rank of polished mirrors that walk the sky down into the stone","a great buried eye at the shaft's foot, that sees one slow circle of heaven more sharply than any hilltop sees the whole"],
  "telescope@ruin":    ["a glass on the old dome's broken rail","a sound scope where the great one must have stood","a long scope remounted on the original stone cradle","a fine scope in the dome, its opened roof-track freed and greased at last","the ruin's own great instrument restored, lens by recovered lens, to the sky it was ground for"],
  "telescope@grove":   ["a glass wedged in a high fork","a sound scope in the clearing the branches leave","a long scope on a living mount the grove holds steady","a fine scope in a bower the wood opens at nightfall and closes at dawn","a great glass the grove itself aims, parting boughs to bare the very star that's wanted"],
  "telescope@vessel":  ["the mate's glass, steadied on a stay","a sound scope on a gimballed deck mount","a long scope slung and counterweighted against the roll","a fine gimballed refractor in the stern gallery, level in any sea","a flagship's great night-glass, that holds a star through weather that puts the compass on its beam-ends"],
  "telescope@hamlet":  ["a glass passed round on the church tower","a sound scope the green bought by subscription","a long scope on the tower leads, under a little roof of its own","a fine scope in a shed with a roof that rolls back, the parish wonder","the green's great glass, willed by its stargazer to the village, that every child has now seen the rings through"],
  starcharts:          ["a folded chart of the brighter stars","good charts and a table of the wanderers' motions","a chest of charts, ephemerides, and a working almanac","fitted chart-drawers and tables computed years ahead","a master's atlas of the whole turning sky, annotated in three careful hands"],
  "starcharts@keep":   ["the watch-officer's star card","good charts marked for signal-stars and seasons","a chest of charts ruled for range-finding and the calendar of musters","fitted drawers of sky-tables the garrison sets its clocks by","the keep's great atlas, where comets and campaigns are entered in the same margin"],
  "starcharts@tower":  ["a chart in a difficult hand","good charts glossed with a predecessor's guesses","a chest of ephemerides, some for skies not quite this one","fitted drawers of tables that disagree instructively","the tower's atlas, whose marginalia answer questions a page before they're asked"],
  "starcharts@manor":  ["a pretty celestial map, framed","good charts in a morocco case","a chart-chest with an orrery in the lid","fitted drawers of engraved tables, uncut until this house cut them","an heirloom atlas with the family's own comet, observed and named on the night page"],
  "starcharts@cavern": ["a chart of the shaft's one circle of sky","good charts of what the light-well shows, season by season","a chest of tables for a sky owned a slice at a time","fitted stone drawers of charts, dry as the rock and twice as patient","the deep atlas, a century of the shaft's slow sky, complete as no hilltop record is"],
  "starcharts@ruin":   ["a salvaged chart, scorched at one corner","good charts recopied from the legible half of the old set","a chest of the old observatory's tables, collated and mended","fitted drawers restored, the missing years computed back in","the ruin's own atlas made whole, its last entry and its newest in different centuries and the same ink"],
  "starcharts@grove":  ["a chart kept in an oilskin against the dew","good charts of the sky the clearing owns","a chest of tables the wood keeps dry unasked","fitted drawers under a woven roof, leaves pressed between the pages","the grove's atlas, where the turning stars and the turning seasons are one long entry"],
  "starcharts@vessel": ["the navigator's working card","good charts fiddled to the table against the roll","a chart-chest latched and gasketed, tables corrected each landfall","fitted drawers beneath the stern-windows, an ocean's sky to a drawer","the flagship's atlas, three oceans of nights reconciled into one sure book"],
  "starcharts@hamlet": ["an almanac page pinned by the door","good charts the schoolmaster copies out fair each year","a chest of tables the parish clock is set by","fitted drawers of the green's own sky-record, kept unbroken","the village atlas, every eclipse and wonder the green has stood out to watch, written down the same night"],
},
  sizeFlavor: {
  keep:   ["A platform on the highest tower — a scope, a rail, and the whole night for a ceiling.","A proper observatory turret now, mounted glass and chart-chest out of the wind.","A great war-dome crowning the keep, its slit commanding sky the way the walls command ground."],
  tower:  ["The topmost room given to one glass and one chair.","A proper observatory floor, the scope on its track and the charts up the wall.","The tower's whole crown opened to the sky, a dome that turns as smoothly as the heavens it follows."],
  manor:  ["A terrace corner with a mounted glass and a lamp hooded red.","A proper belvedere on the roof, glazed and shelved and warm enough to work in.","A great dome above the east wing, its brass and mahogany the equal of any room below."],
  cavern: ["A seat at the shaft's foot, one circle of stars overhead.","A proper deep observatory, mirrors stepping the sky down to a rock-cut bench.","A great buried gallery beneath the shaft, where one slow ribbon of heaven is read more closely than the surface reads it all."],
  ruin:   ["The old dome's floor swept, one sound rail to steady a glass on.","A proper observatory again, the roof-track freed and half the old sky recovered.","The great dome entire, restored past its builders' hopes, turning without a sound."],
  grove:  ["A clearing kept open, a scope under oilskin between clear nights.","A proper star-glade, the bower mount steady and the charts dry.","A great living aperture the grove tends, opening on the night like an eye."],
  vessel: ["A gimballed glass at the stern rail, for the nights the sea allows.","A proper observation deck, scope slung true and chart-chest battened.","The stern gallery made a floating observatory, level-held and dark-lamped, the envy of any admiral."],
  hamlet: ["The church-tower leads and a shared glass, on nights word goes round.","A proper little observatory shed on the green, roof rolled back.","The green's own dome, subscription-built, where the whole parish queues on comet nights."],
},
  ruin: {
  keep:   "The war-dome's slit jams a hand's-width open, the great glass blind with dust, the range-tables mildewed to lace, and the last star it followed set four hundred years since.",
  tower:  "The crown of the tower stands open to weather, the track rusted fast, the scope's lenses gone milky as cataract, and the charts up the wall faded to the ghosts of skies.",
  manor:  "The belvedere's glazing is starred and fallen, the brass gone green as the lawns below, the mahogany sprung, and birds nest in a dome that turned for three generations.",
  cavern: "The star-shaft has silted to a grey coin of light, the mirrors furred blind, the rock-cut bench damp-slicked, and the deep atlas swollen shut around its century of sky.",
  ruin:   "Restored once, it has fallen twice — the freed roof-track seized a second time, the recovered lenses crazed, and the atlas's newest hand as unreadable now as its oldest.",
  grove:  "The wood has closed the aperture, boughs lacing where the sky was, the bower mount split and sprouting, the oilskinned charts pulped to mast under a decade of leaves.",
  vessel: "The stern gallery is stove and swamped, the gimbals seized at a permanent list, the night-glass flooded, and the flagship atlas a brick of grey pith in the ruined chart-chest.",
  hamlet: "The shed's rolling roof came off in a gale nobody mended after, the subscription glass long since sold, and the green's sky-record ends mid-sentence on a night of cloud.",
},
  reactions: {
  why: { slovenly: "the lens-caps left off and the dew let at the optics, as {d} leaves things", idle: "the night's log left three nights blank, which {d} had meant to keep", green: "the fine screw forced past its stop, {d} not yet knowing its limits", sly: "or so {d} swore the mount had been dewed off and covered", proud: "and {d} would not be told the collimation had drifted" },
  to: [
    { tag: "quarrelsome", d: -2, say: "and {r} re-collimated the whole train from objective to eyepiece rather than trust a screw {d} had touched, and said so" },
    { tag: "sharp-tongued", d: -1, say: "and {r} capped the optics and observed that lenses cost more than excuses" },
    { tag: "proud", d: -1, say: "and {r} said nothing, and re-entered the blank nights from {r}'s own memory of the sky" },
    { tag: "forgiving", d: 1, say: "and {r} only dewed off the glass and set the caps, the way {r} does" },
    { tag: "patient", d: 1, say: "and {r} walked the drifted collimation back a turn a night until it was true" },
    { tag: "soft-hearted", d: 1, say: "and {r} left the chair set and the lamp hooded red for whoever came up next" },
  ],
  generic: { d: 0, say: "and {r} let the sky keep the score" },
},
  lifeTasks: {
  keep: ["dewed off the great glass before the night watch changed","logged three falling stars and one signal-fire, in different columns","held the scope on a far ridge at dusk, then gave the sky back its instrument","re-inked the range-tables the tower damp had begun to fade","showed the youngest sentry the rings, and got the watch's first gasp in years","computed the moon's rise for the month and pinned it in the guardroom","chalked the dome-track and walked the slit around its full circle","compared the keep's clock to the stars and found the clock wanting","sat out a cloud-bank with the log open on nothing, and logged that too","cleaned the finder a careless elbow had knocked askew","read last winter's comet entry aloud to nobody in particular","capped the optics against a wind with grit in it, and trusted the sky to keep"],
  tower: ["found the scope aimed at a star not in last night's position, and left it there","charted a wanderer the tables were a night wrong about, and corrected the tables","cleaned an eyepiece that showed, faintly, a sky with two moons, then showed this one","logged the hour the tower's hum and the sphere's turning came briefly into tune","walked the ring-track a full turn to ease a squeal the tower disliked","computed an eclipse and left the working where the apprentice would find it","watched the wards shimmer once across the field, and noted the time","re-shelved the ephemerides that had, again, sorted themselves by brightness","sat till the false dawn over a nebula that may have looked back","stopped the fine screw a whisker before its limit, out of old respect","copied the night's log fair before the ink could dream itself different","hooded the lamp red and let the dark have the topmost room"],
  manor: ["wheeled the lawn mount out at dusk and in again under the first dew","showed the visiting cousins the rings, to the usual satisfying effect","polished the brass till the gardener complained of the glare at sunset","entered the night in the atlas in a hand fit for the shelf it lives on","aligned the terrace sundial to the transit, settling a bet below stairs","aired the belvedere and beeswaxed the mahogany against the season","computed the harvest moon for the steward, who plants by it","cut the pages of a new set of tables with the good paper-knife","sat out a grey week re-reading the family comet's page","adjusted the clock-drive until it ran a whole night unattended","sketched the moon's terminator for the youngest, mountains and all","drew the dome shut on a clear night, reluctantly, at the third yawn"],
  cavern: ["waited at the bench for the shaft's slow stars to arrive on schedule","polished the relay mirrors till the buried sky came down undimmed","logged the one bright wanderer the shaft would own this season","checked the light-well after a tremor and found it faithful","computed when the pole-star next stands in the circle, years off, and filed it","dried the bench and the drawers against the rock's patient sweat","carried the night's page up to daylight to ink it dry","taught a miner the three stars the shaft was cut to catch","sat the dark hours below while the mountain kept its own counsel overhead","trued the top mirror's cradle by a plumb-line and a whisper","read the deep atlas back a generation to check a slow drift","hooded the lamp and let the shaft's coin of sky be the only light"],
  ruin: ["greased the freed roof-track and turned the dome its daily inch","cleaned a recovered lens and raised one more magnitude from the dark","matched an old entry to the night sky and found a star had wandered as promised","computed back a gap year and entered it in a respectful, different ink","swept fallen plaster from the pier before it could reach the optics","read the founder's last entry at the founder's own eyepiece","re-hung the pendulum the restorers had never dared to start","charted from the dome floor the same square of sky as four centuries of hands","mended the atlas's spine where its two ages meet","sat out a cloudy night listening to the dome breathe like an old ship","calibrated the restored circle against a star the old notes swore by","closed the slit on a sound sky and thanked the roof for turning"],
  grove: ["waited for the wood to open the bower, and it opened it a little early","dewed the glass with a cloth the grove keeps mysteriously dry","charted the clearing's sky and the canopy's slow edit of it together","logged the night the owls went quiet for a long light crossing the field","pressed a leaf in the atlas at the equinox page, as the custom is","steadied the living mount with a thumb while a planet cleared a bough","computed the solstice dawn and marked its tree at the clearing's rim","cleaned the oilskins and found the charts drier than any shed keeps them","sat the dark out with something large and calm cropping just beyond the light","taught the green's children the summer triangle by their own names for it","let a moth off the objective with the night's first star behind it","capped the glass at dawn and gave the clearing back to the birds"],
  vessel: ["shot the evening stars and gave the master a position he grunted approval at","slung the scope against a freshening swell and lost not a lens of it","logged a comet in the same line as the wind, as a ship's book demands","held the gimbals true through a squall and the star truer","corrected the tables at landfall against a steeple of known height","dried the chart-chest's gasket and re-dogged every latch","showed the middle watch the rings, and the helm went quiet a while","computed the tide by the moon for a bar the pilot mistrusted","sat out fog reading three oceans of old nights in the atlas","re-blacked the tube where salt had silvered it","called the fall of a green meteor to a deck that all saw it","hooded the light and left the stern gallery to the wake and the stars"],
  hamlet: ["rolled the shed roof back to a green already gathering in coats","set the parish clock by a transit, and the sexton by the clock","showed a row of children the rings, tallest to smallest, twice through","entered a bright wanderer in the sky-record in the schoolmaster's fair hand","mended the roof-runner before the autumn made its argument","computed the eclipse and wrote the green a notice for the church door","cleaned the subscription glass as carefully as its subscribers deserve","sat up for meteors with half the green in blankets on the grass","lent the almanac to the miller and got it back full of flour and thanks","charted the harvest moon's rise for every gate on the lane","logged a night of cloud with the patience the record teaches","rolled the roof to at dawn and carried the kettle down cold"],
},
});

// ═══════════════════════════ end OBSERVATORY mint ═══════════════════════════

// ═══════════════════════════════ ARCHIVE mint ═══════════════════════════════
// DMG: "a repository of valuable books, maps, and scrolls. It is usually
// attached to a Library behind a locked or secret door." Level 13, Roomy,
// 1 hireling, Research. Its mechanics — Research-as-Legend-Lore and the
// Reference Book — live in the engine and SET_ARCHIVE_BOOK. THIS is the room:
// not a study but a VAULT OF MEMORY, and its second slot is the door itself.
registerFacility({
  id: "archive",
  roles: ["Archivist"],
  furnishings: [{ slot: "stacks", name: "the record-stacks", plural: true }, { slot: "archivedoor", name: "the locked door" }],
  furnishingWeight: { stacks: 4, archivedoor: 3 },
  furnishingLadder: {
  stacks:            ["a shelf of boxed papers","sound stacks of labelled boxes and rolled maps","ranked stacks with a ledger of what sits where","fitted stacks, map-drawers, and a finding-index that answers","a master archivist's stacks, where a century answers in the time it takes to ask"],
  "stacks@keep":     ["a shelf of muster-rolls in a dry corner","sound stacks of orders, rolls, and despatch-boxes","ranked stacks of the keep's paper history, campaign by campaign","fitted stacks and map-drawers, every siege findable by year","the garrison's whole memory in ordered ranks, from first muster to this morning's watch-bill"],
  "stacks@tower":    ["a shelf of papers that keep their own order","sound stacks whose labels are occasionally aspirational","ranked stacks indexed by a system with opinions","fitted stacks whose finding-index answers, sometimes before the question","the tower's deep memory in ranks, where what you need has a way of being already out on the table"],
  "stacks@manor":    ["a deed-box and a shelf of family papers","sound stacks of estate rolls and correspondence","ranked stacks of the house's whole paper life, ribboned by decade","fitted stacks and letter-drawers, three generations findable to the day","the family's entire record in ordered ranks, births to boundary-suits, nothing lost since the first stone"],
  "stacks@cavern":   ["a dry niche of boxed papers","sound stacks in the driest room the rock owns","ranked rock-cut stacks, the damp mapped and outflanked","fitted stone stacks with lamp-niches, paper safer here than anywhere under sky","the deep archive entire, where vellum outlasts kingdoms because the mountain permits no weather"],
  "stacks@ruin":     ["a shelf of what the fall spared","sound stacks of salvaged records, sorted from the spoiled","ranked stacks reuniting the scattered survivals of the old house","fitted stacks where the recovered record stands beside the reconstruction","the old archive remade, its gaps honestly labelled, its survivals ranked like veterans"],
  "stacks@grove":    ["a waxed chest of papers under a dry bough","sound stacks the wood roofs and keeps from the green damp","ranked stacks in a grown shelter, sap-sealed against the season","fitted living stacks, the grove minding the damp as carefully as the archivist minds the order","the grove's own memory-house, where paper keeps as leaves do not, and the wood seems to know the difference"],
  "stacks@vessel":   ["an oilskin chest of ship's papers","sound sea-stacks, boxed, barred, and gasketed","ranked stacks of log and manifest, every voyage latched in its place","fitted stacks below the waterline's reach, dry through any sea","the fleet's paper memory afloat, three oceans of voyages ranked and dry as the day they were inked"],
  "stacks@hamlet":   ["a parish chest of registers","sound stacks of the green's kept papers","ranked stacks of register, deed, and tithe, the parish findable by name","fitted stacks of the green's whole written life, indexed by family","the village's entire memory in ordered ranks, where every christening on the green can be laid beside its great-grandmother's"],
  archivedoor:          ["a stout door with a good lock","a banded door, double-locked, the keys kept apart","an iron-strapped door with a lock a locksmith respects","a masterwork door whose lock has one key and a keeper","a door that is not where visitors remember it, and opens for exactly whom it should"],
  "archivedoor@keep":   ["a guardroom door with a garrison lock","a banded door on the armoury pattern, keys logged","an iron door with a sentry's peep and a two-key lock","a vault door off the old strongroom, its combination a matter of rank","a door drilled into the wall's own thickness, that a siege could take the keep and never find"],
  "archivedoor@tower":  ["a door with a lock and a word","a banded door that prefers its own key","an iron-strapped door with a lock and a question","a masterwork door warded past its ironwork, polite to the right hand","a door that is a bookcase, a wall, and occasionally a door, in an order it decides"],
  "archivedoor@manor":  ["a library door with a discreet lock","a panelled door, double-locked, keys on the steward's ring","an iron-lined door dressed as panelling, lock flush and quiet","a masterwork jib-door in the library wainscot, invisible at three paces","a door the house itself keeps politely secret, behind the third case, where only family look"],
  "archivedoor@cavern": ["a stout door set in dressed rock","a banded door in a rock-cut frame, dry-hinged","an iron door keyed to a stone that turns","a slab-door balanced to swing at a touch, and only the right touch","a passage the rock closes seamlessly, that opens on a knock the mountain recognizes"],
  "archivedoor@ruin":   ["the old strong-door, relocked at last","a banded door rehung on the original irons","an iron-strapped door whose lock outlived the house and works yet","the old secret door found again, its trick restored and better hidden","the door the fall itself never found, which is why the records survived to be ranked"],
  "archivedoor@grove":  ["a woven hurdle with an honest latch","a grown door of living withies, latched and minded","a door of grown wood the grove holds shut against strangers","a living door that opens inward like a parting of boughs, for the known","a green wall with no door at all, until the grove decides you are expected"],
  "archivedoor@vessel": ["a latched hatch with a good padlock","a barred hatch, double-dogged, keys on the master's ring","an iron-bound lazarette hatch, gasketed and locked","a masterwork hatch flush with the deck, findable by two people aboard","a hatch the ship's own lines conceal, dry and locked through storm and boarding both"],
  "archivedoor@hamlet": ["the parish chest's iron lock","a vestry door with the church's own key","an iron-banded vestry door, keys with parson and warden","a masterwork lock the whole green trusts and one man opens","the green's quiet secret, a door behind the vestry press that only the register's keepers know"],
},
  sizeFlavor: {
  keep:   ["A strong closet off the guardroom — boxed rolls, one lamp, one lock.","A proper record-room now, ranked stacks and a door the watch answers for.","A vaulted muniment room deep in the wall, the keep's whole paper history dry and ranked and guarded."],
  tower:  ["A locked closet of boxed papers beneath the study stair.","A proper archive floor, ranked stacks and a door with its own opinions.","A deep record-vault the tower coils around, where the index answers and the door chooses."],
  manor:  ["A deed-closet off the library, ribboned boxes and a discreet key.","A proper muniment room behind the wainscot, the estate findable by year.","A great record-vault beneath the library, three generations ranked, the jib-door invisible at three paces."],
  cavern: ["A dry niche with a stout door, the rock's one gift to paper.","A proper rock-cut archive, ranked and lamp-lit, drier than any surface room.","A deep vault where vellum outlasts dynasties, the mountain itself the lock."],
  ruin:   ["A surviving strongroom, relocked around what the fall spared.","A proper archive again, salvage ranked beside reconstruction, gaps labelled.","The old muniment vault entire, remade and refilled, the door the fall never found still keeping its secret."],
  grove:  ["A waxed chest in a dry bower, latched against the green.","A proper grown record-house, the wood minding the damp, the door minding the strangers.","A living vault the grove keeps sealed and dry, paper safer here than under any roof of slate."],
  vessel: ["An oilskin chest in the lazarette, dogged down hard.","A proper ship's archive, sea-stacks barred and gasketed below the spray.","A dry paper-hold the fleet would envy, three oceans of record latched against any sea."],
  hamlet: ["The parish chest in the vestry, iron-locked, twice-keyed.","A proper vestry archive, the green's registers ranked and findable.","The village's whole memory vaulted behind the vestry press, dry, indexed, and quietly guarded."],
},
  ruin: {
  keep:   "The muniment room's lock has been forced and reforced, the ranked rolls slumped to a drift of grey pulp, and the keep's whole paper history is now the nesting of four centuries of mice.",
  tower:  "The record-vault's door stands open on darkness, the index gone wherever such things go, and the stacks have re-sorted themselves one final time, into ruin.",
  manor:  "The jib-door hangs sprung in the wainscot, the deed-boxes ribboned in rot, and three generations of the estate have gone soft and blind in their drawers.",
  cavern: "Even the mountain's dryness failed at last — a new seep found the deep vault, and the vellum that outlasted kingdoms lies fused into stone-coloured stone.",
  ruin:   "Ruined, remade, and ruined again — the honest gap-labels have themselves rotted illegible, and the survivals they marked survive no more.",
  grove:  "The grove forgot its charge, or gave it up — the living door stands parted on a green wet dark, and the waxed chests within have gone to loam and beetle-lace.",
  vessel: "The lazarette flooded on some final voyage — the gaskets perished, the barred stacks burst, and the fleet's paper memory is a single grey brick of the sea's making.",
  hamlet: "The vestry press stands ajar on the emptied secret, the parish chest is firewood-split, and the green's whole written memory blew about the churchyard one autumn and was raked and burned.",
},
  reactions: {
  why: { slovenly: "a box left open and papers loose on the floor, as {d} leaves things", idle: "the finding-index left a season behind the shelves, which {d} had meant to bring up", green: "a deed refiled under the wrong decade, {d} not yet knowing the system", sly: "or so {d} swore the borrowed roll had been signed back in", proud: "and {d} would not be told the damp-line had crept a shelf higher" },
  to: [
    { tag: "quarrelsome", d: -2, say: "and {r} pulled the whole decade and refiled it sooner than trust one folder, and said so at length" },
    { tag: "sharp-tongued", d: -1, say: "and {r} signed the roll back in and observed that an archive without its register is a bonfire waiting on a spark" },
    { tag: "proud", d: -1, say: "and {r} said nothing, and moved the damp-line's shelf {r}'s own way after" },
    { tag: "forgiving", d: 1, say: "and {r} only boxed the loose papers and squared the lids, the way {r} does" },
    { tag: "patient", d: 1, say: "and {r} walked the index forward a shelf an evening until it was current" },
    { tag: "soft-hearted", d: 1, say: "and {r} left the misfiled deed on the desk with its right box open beside it" },
  ],
  generic: { d: 0, say: "and {r} turned the key and left the records to their quiet" },
},
  lifeTasks: {
  keep: ["walked the damp-line with a candle and moved one shelf's boxes higher","signed a captain's despatch into the rolls and the captain's borrowed map back out","refiled a siege by its right year, ending a mess an older war had started","aired the muniment room the dry hour the watch allows","copied a crumbling order fair and boxed the original like a casualty","found a muster-roll with a famous name on it, young and misspelled","oiled the two locks and logged the keys against their ring","indexed a campaign nobody living fought, box by patient box","turned back a clerk who wanted a roll without a signature for it","sat late matching despatches to the annals until the accounts agreed","brushed four centuries gently off a treaty and read what it actually ceded","turned the key on the keep's whole memory and reported all quiet"],
  tower: ["brought the finding-index current, over its mild objections","refiled a folio that preferred its old, wrong, interesting place","signed out a scroll to the study upstairs and meant to enforce the return","found the door pretending to be a wall again, and knocked politely","matched a sealed letter to its cipher-key three shelves away","aired the vault the one hour the wards allow","copied a fading colophon before it finished deciding to fade","indexed a bequest of papers that arrived, as they do, without explanation","caught the stacks re-sorting by importance and negotiated a compromise","mended a wax seal's box so the seal need never wake","read an old keeper's marginal warning, and heeded it","turned the key, and heard the lock consider before consenting"],
  manor: ["ribboned the year's letters and laid them down like wine","signed the steward in for a boundary deed and out again by luncheon","refiled a scandal two shelves deeper, at the family's standing request","aired the muniment room while the house was at church","copied great-grandmother's marriage lines fair for the vicar","found the jib-door ajar a finger's width and the room, on inventory, entire","indexed the correspondence of an uncle best understood alphabetically","mended a deed-box hinge with the good small screwdriver","matched a portrait's date below stairs to a bill of sale above","sat late with the estate rolls until a missing acre turned up on paper","pressed a loose seal back to its ribbon with a warm coin","locked the wainscot on three centuries and went up to dinner"],
  cavern: ["walked the seep-map with a lamp and found the rock still holding","carried the day's accessions down to where paper goes to be safe","refiled a charter by touch and lamplight, the order now in the hands","aired nothing, the rock's stillness being the point, and logged that","copied a miner's grant onto vellum that will outlast the seam","indexed the deep shelves by lamp-niche, three niches an evening","found frost-flowers of salt on a box lid and moved the box a gallery in","signed a surveyor in, watched him to his shelf, and out","mended a lamp before it could smoke the nearest century","sat the still hours with the oldest vellum, which keeps its own counsel","listened once to water moving somewhere it shouldn't, and mapped it","turned the stone that is the door and left the dark to its keeping"],
  ruin: ["sorted a new-found cache into survivals and losses, and labelled both","refiled a salvaged deed beside its reconstruction, originals outranking","copied a scorched page's legible half and boxed its silence with it","aired the old vault by the door the fall never found","matched a recovered seal to a document that had waited centuries for it","indexed the gaps as carefully as the holdings, which is the whole craft here","mended a box the old fire had kissed but not kept","signed in a scholar hunting the fall's cause, and shelved him gently","read the last pre-fall entry again, for the date more than the words","walked the reunited stacks and felt the house remember itself","found a name in two archives an aisle apart, and married the files","turned the survivor door's old lock and thanked it, as the custom now is"],
  grove: ["waxed the chest-seals against a season that smelled of rain","refiled by lamplight while the wood held the damp politely at the door","signed a scroll out to the clearing and back before the dew","aired the record-house the one bright hour the canopy gave","copied a fading grant onto paper the grove had kept bone-dry","indexed the parish of trees' own papers, gift by windfall gift","found a mouse considering a ribbon and relocated the debate outside","mended a hurdle-latch the green door had outgrown","matched a pressed leaf in a deed to the very tree at the boundary","sat the green evening with the registers while the wood read over a shoulder","asked the door to expect the surveyor, and it did","latched the living door and left the memory to the grove's minding"],
  vessel: ["dogged the lazarette hatch before a sky that meant it","refiled a voyage by landfall, log and manifest latched as one","signed the master in for last year's log and out with it entered","aired the paper-hold in harbour, the one air a ship's archive trusts","copied a salt-stiff page before the crease could finish its work","indexed three landfalls' accessions between the watch-bells","found the gasket weeping a thumb's width and re-seated it at once","matched a cargo-mark on a crate to its manifest twenty years down","mended a chest-bar the last blow had sprung","sat out a gale below with the fleet's memory riding dry around him","entered a burial at sea in the log's steadiest hand","dogged the hatch, tried it twice, and gave the sea nothing"],
  hamlet: ["brought the register current, christenings first, in the fair hand","signed the warden in for a tithe-map and out by evensong","refiled a deed the last parson's system had hidden from the parish","aired the vestry archive while the bell-ringers practised above","copied a boundary agreement plain for two neighbours to stop arguing over","indexed the green's papers by family, which is how the green asks","found the church key's spare where the register said it would be","mended the parish chest's hinge with the sexton holding the lamp","matched a mason's mark in the tower to a bill four reigns old","sat late settling whose hedge the map meant, and wrote it so","entered a marriage and pressed the ribbon flat with the same care as ever","turned both keys on the green's whole memory and walked home across it"],
},
});

// ═════════════════════════════ end ARCHIVE mint ═════════════════════════════



/* ------------------------------------------------------------------------------------------------
   TEMPLATE  adding a new facility
   ------------------------------------------------------------------------------------------------
   Arcane Study above is the worked example. A new room needs up to THREE things. Copy this block,
   rename "new_facility" to your id (the SAME string in every spot), fill in, and delete any field
   or section the room doesn't use. Only step (1) is mandatory  a plain room needs nothing else.

   (1) CATALOG ENTRY  makes it buildable. Add it in BASTION_FACILITIES (search that name), beside
       its kind. This is the only step the basic facilities use; specials use (2) and maybe (3) too.

       new_facility: {
         id:        "new_facility",        // MUST equal the map key AND the spec id in (2)
         name:      "New Facility",        // display name
         kind:      "special",             // "basic" (no game effect, pure verisimilitude) | "special"
         minLevel:  5,                     // character level required to build
         orders:    ["craft", "maintain"], // order ids it can be given each week; [] for a basic room
         space:     "roomy",               // specials only: starting size  "cramped" | "roomy" | "vast"
         hirelings: 1,                     // specials: staff it arrives with
         prereq:    "some_focus",          // OPTIONAL: a thing that must exist first, if any
         enlargeBenefit: "what a bigger one grants", // OPTIONAL: shown when the room is enlarged
         note:      "One line of what the room is.",
       },

   (2) THE SPEC  its data  via registerFacility (Arcane Study's call, directly above, is the model).
       Every field is optional; declare only what the room has. furnishingWeight/furnishingLadder are
       keyed by furnishing SLOT (a bed, a desk); everything else is keyed by the room itself.

       registerFacility({
         id: "new_facility",
         roles: ["Title"],                      // what staffFacility names the hireling(s)
         staffBySize: { cramped: 1, roomy: 2, vast: 3 }, // OPTIONAL: staff per size, when it varies
         furnishings: [                          // the room's own fittings; one entry per slot
           { slot: "slotname", name: "...", tier: "basic", gp: 0,
             plural: true,                        // OPTIONAL: name reads plural ("bookshelves")
             srd:    "g_tool_woodcarver" } ],     // OPTIONAL: ties the slot to an SRD tool entry
         furnishingWeight: { slotname: 3 },     // slot -> weight toward the furnishing total; OMIT a
                                                //   slot that never upgrades (base-only, e.g. storage's racking)
         furnishingLadder: {                     // slot -> the tier rungs it upgrades through. Give the
           slotname:         [ "...base rungs..." ],  // base ladder, then OPTIONALLY one override per
           "slotname@keep":  [ "..." ],           // FORM the keep can take -- 8 in all: keep tower
           "slotname@tower": [ "..." ],           // manor cavern ruin grove vessel hamlet. Arcane Study
           // ...@manor @cavern @ruin @grove @vessel @hamlet ... and every basic carry the FULL set
         },                                       // (base + 16 variants). A base-only slot omits all @forms.
         sizeFlavor: { keep: ["..."] },         // form -> lines describing the room at each size
         ruin:       { keep: "..." },           // how a neglected / fallen one reads. MAY instead be a
                                                //   bare STRING when it doesn't vary by form (see bedroom).
         reactions:  { ...how the room colours events... },
         lifeTasks:  { keep: ["..."] },         // the household's day-to-day work here
       });

   (3) BEHAVIOR  ONLY if the room does something special  via a FACILITY_BEHAVIOR entry (search that
       name). Two hooks exist today; add fields there if a room needs a new kind of behavior.

       new_facility: {
         // A SLOTTED room (like a Pub's taps, an Archive's books): says how it re-stocks. Needs a
         // slot-array field on the facility, a capacity function, and the list to draw from. Omit
         // entirely if the room has no such slots.
         slotField:  "taps",
         slotCount:  (fac) => (fac.size === "vast" ? 2 : 1),
         slotSource: (form) => SOME_LIST_FOR(form),
         // ARRIVES CONFIGURED (like a Training Area's chosen trainer): runs once, at construction.
         onBuild: (newFac, action) => { newFac.whatever = 0; },
       },

   NOTE  a room that produces a special RESULT when an order resolves (the Trophy Room's trinket,
   the Barracks' recruit) does NOT go here: that logic dispatches on the ORDER outcome, not the room,
   so it lives in the order resolver (search o.outId === "trinket"). This registry is for behavior
   the room owns by its type; order results are owned by the order.
   ------------------------------------------------------------------------------------------------ */

registerFacility({
  id: "storage",
  furnishings: [{ slot: "racking", name: "shelving" }, { slot: "crates", name: "crates and barrels", plural: true }],
  roles: ["Cellarer", "Porter"],
  staffBySize: { cramped: 0, roomy: 1, vast: 1 },
  furnishingWeight: { crates: 2 },
  furnishingLadder: {
    crates: ["crates and barrels", "crates and barrels, stacked properly", "crates, barrels, and a tally board that is kept up", "a fitted store: bins, hooks, and a slate that is always right", "a store so well made that people come to look at the store"],
    racking: ["planks on brackets", "proper shelving", "shelving with a ladder and a system", "fitted racking, bays numbered and a tally kept", "a store-fitting a joiner is oddly proud of, that other cellarers come to see"],
    "crates@cavern": ["barrels stood on the dry rock", "barrels and crates chocked on the cavern floor", "ranked barrels kept up off the seep on stone chocks", "fitted crating cut to the cavern's dry bays", "barrels that have stood in this cold rock so long the staves have half gone to stone"],
    "crates@grove": ["crocks and a covered pit", "crocks and casks up on slats", "ranked crocks and barrels, sealed with wax and leaf", "fitted crocks the grove half-grew, lidded and living", "crocks grown whole from gourd and burl, that keep the harvest sweeter than clay"],
    "crates@hamlet": ["a barrel and a bin or two", "the parish's barrels and grain-bins", "ranked barrels and clamps, each marked with a household's notch", "fitted granary bins and casks, one to every family on the green", "the common barrels the whole green has filled at harvest since before the church"],
    "crates@keep": ["campaign barrels and munition-crates", "stout barrels and iron-bound crates, stacked tight", "ranked barrels and crates, chocked against rough handling", "fitted crating, every barrel chocked and marked with its bay", "barrels the garrison's stores have travelled in through three wars, and never lost a stave"],
    "crates@manor": ["hampers and a barrel or two", "good barrels and packing-cases, kept off the floor", "ranked barrels and cedar cases against the moth", "fitted cases and casks, each with the household's mark burnt in", "casks and cases that have laid down four generations of the family's best"],
    "crates@ruin": ["a few sound barrels among the rubble", "salvaged casks and crates set up in the old vault", "ranked barrels matched to the great undercroft's scale", "fitted crating rebuilt to fill the old vault's bays", "barrels made to the ruin's own cooperage, until you cannot date them"],
    "crates@tower": ["a few careful crates", "crates packed in straw and marked which way is up", "padded crates, the fragile apart from the rest", "fitted cases, each latched and labelled twice", "crates a mage sealed, that do not open for the wrong hand and do not spill for any"],
    "crates@vessel": ["casks lashed in the hold", "casks and crates chocked and lashed for a sea", "ranked casks on dunnage, every one lashed twice", "fitted hold-crating, chocked, lashed, and marked to the manifest", "sea-casks that have crossed three oceans full and come home empty and sound"],
    "racking@cavern": ["a ledge of rock for the stores", "shelving pegged into the stone", "racking cut into the living rock, dry bay and cold bay both", "fitted stone racking, part of the cavern now, cold and dry as ordered", "racking cut whole from the rock, that will hold stores when the house is gone"],
    "racking@grove": ["slats over a covered pit", "proper drying-lofts and slatted shelving", "good racking of grown wood, up off the damp on slats", "fitted lofts and crocks the grove half-grew to the shape", "racking grown from living saplings, that keeps the harvest of the wood that made it"],
    "racking@hamlet": ["a plank shelf in the barn", "proper granary shelving and bins", "good racking, a bin marked for every household on the green", "fitted parish racking, each family's share to its own labelled bay", "the common store's own racking, that the whole green fills and draws from"],
    "racking@keep": ["planks on brackets for the stores", "proper quartermaster's shelving, squared and stacked", "racking with a ladder and a system a siege can't muddle", "fitted bays, numbered, with a tally-board that is always right", "the keep's own racking, that has held a garrison's stores through every siege"],
    "racking@manor": ["a pantry shelf and a wine-bin", "proper cellar racking, binned and labelled", "good racking, a bin for every vintage and a slate for each", "fitted cellar racking a wine-merchant would envy", "cellar racking the family have filled for four generations, bay by named bay"],
    "racking@ruin": ["a sound shelf among the fallen stone", "salvaged racking set up in the old undercroft", "good racking matched to the great vault it stands in", "fitted bays rebuilt from the undercroft's own old fittings", "racking made to the ruin's own pattern, until it looks four centuries old too"],
    "racking@tower": ["a shelf or two for the jars", "proper shelving, each jar to its warded place", "racking with the cold shelves apart from the dry", "fitted cabinetry with locks on the shelves that need them", "racking a mage keyed so the wrong jar simply will not lift from it"],
    "racking@vessel": ["a rack or two, cleated down", "proper hold-shelving, dunnaged and lashed", "good tiered racking with fiddles against the roll", "fitted hold-racking, every bay lashed and numbered to the manifest", "hold-racking off a ship long broken up, that has stowed cargo through three oceans"],
  },
  sizeFlavor: {
  keep:   ["A locked closet off the guardroom, room for the week's rations and little else.","A proper store-room now, ranked barrels and a tally-board, the garrison's larder.","Great vaulted stores, bay beyond bay, victual and gear enough to sit out a season's siege."],
  tower:  ["A shelf of labelled jars on a landing, room for the reagents in daily use.","A proper store-room, shelved floor to ceiling, each jar in its warded place.","A great stores given half to the pantry and half to things that are not, strictly, food."],
  manor:  ["A pantry and a wine-bin, room for the household's week and a few good bottles.","Proper cellars now, a dry store and a cool one, the linen and the vintage both laid down.","Great cellars under the whole house, wine and preserves and plate, ranked and inventoried."],
  cavern: ["A cold niche in the rock, room for what the deep keeps without salting.","A proper rock-cut store, the dry bays and the cold bays each to their purpose.","A great cold store deep in the rock, the mountain itself the larder, ranked into the dark."],
  ruin:   ["A dry corner of a great old undercroft, room for a season's stores among the fallen stone.","An undercroft reclaimed to use, the sound bays filled, the flooded ones left to the frogs.","The great vaults entire, restored and ranked, a store built to hold a vanished house's whole wealth."],
  grove:  ["A hollow tree and a covered pit, room for the crocks the season fills.","A proper store of lofts and crocks, roofed and slatted against the damp of the wood.","Great greenwood stores, drying-lofts and root-pits and rows of crocks, a whole wood's harvest kept."],
  vessel: ["A cramped lazarette aft, room for the voyage's stores stowed tight.","A proper hold, tiered and dunnaged, stores enough for a long passage.","A great hold the length of the ship, tier on tier, victual and cargo for an ocean crossing."],
  hamlet: ["A corner of the barn, room for one household's winter and no more.","A proper store on the green, the parish granary, each family's share kept sound.","The great common barn and granary, the whole hamlet's harvest under one roof for the winter."],
},
  ruin: {
  keep:   "The stores stand ranked and rotted, the barrels stove and the flour a grey drift, the tally-board still chalked with a count nobody will ever draw against.",
  tower:  "The jars stand furred and clouded on their shelves, the labels faded past reading, and whatever was kept apart has had long years now to get acquainted.",
  manor:  "The wine has turned to vinegar in the dark and the vinegar to dust, the linen gone to moth, the inventory still hanging accurate and useless by the door.",
  cavern: "The cold store keeps its cold and nothing else, the ranked bays empty, the door-lamp long dry and the deep dark come all the way back in.",
  ruin:   "A store was kept a while in the great old undercroft, and the undercroft has taken it too, the barrels burst and the vaults gone back to the water and the frogs.",
  grove:  "The crocks stand cracked and empty in the fallen loft, the root-pits caved, the whole careful harvest long since gone back to the wood that grew it.",
  vessel: "The hold stands awash and empty, the casks broken loose and rolling with the swell, the manifest a pulp, the ship carrying nothing now but the sea.",
  hamlet: "The common granary stands open and empty, the last grain gleaned by the birds, the key still on its nail for a green that no longer comes to fill it.",
},
  reactions: {
  why: { slovenly: "the tally left half-entered, as {d} leaves things", idle: "the new stock left unstacked, which {d} had meant to see to", green: "the stores stacked wrong, {d} not yet knowing the order of them", sly: "or so {d} swore the count had been made", proud: "and {d} would not be told the damp had got in" },
  to: [
    { tag: "quarrelsome", d: -2, say: "and {r} re-stacked the whole bay sooner than let it stand, loudly" },
    { tag: "sharp-tongued", d: -1, say: "and {r} set it right and said what {r} thought of a store kept so" },
    { tag: "proud", d: -1, say: "and {r} said nothing, and stacked it over {r}'s own way" },
    { tag: "forgiving", d: 1, say: "and {r} only finished the tally, the way {r} does" },
    { tag: "patient", d: 1, say: "and {r} squared the stores away without a word said" },
    { tag: "soft-hearted", d: 1, say: "and {r} covered for them and set it right before the steward saw" },
  ],
  generic: { d: 0, say: "and {r} let the stores be" },
},
  lifeTasks: {
  keep: ["tallied the stores against the book and found the book, for once, honest","rotated the old stock to the front so nothing spoiled unwatched in a corner","stacked the new barrels the way the old quartermaster taught, tight and true","kept the siege-stores dry and counted, against a siege that never comes","chased the damp out of the far corner before it could reach the flour","swept the floor and set the traps and found the traps had earned their keep","logged every keg out and every keg in, and let no one draw unlogged","found a case marked in a dead man's hand and shelved it without opening it","shifted the whole store a foot off the wall where the wet was coming through","argued the cook out of the last of the good oil, and lost, and logged it anyway","stood in the cool dark among the ranked barrels and felt the keep was provided for","banked the lantern and locked the store and rattled the door once to be sure"],
  tower: ["shelved a delivery of jars by a system only they and the master understand","kept the reagents that must stay cold apart from the ones that must stay dry","labelled a crate twice, because a wrong label here is not a small mistake","found a jar had been moved and put it back exactly, to the thumb's width","logged something in and did not ask, out loud, what it was for","kept the far shelf that hums to itself well away from the far shelf that doesn't","swept up a spill with sand, not water, the way the standing orders insist","carried a sealed box up to the study and carried the empty box back down","checked the wards on the locked cabinet were lit, and did not open it","found two things that should never be shelved together shelved together, and fixed it fast","counted the stores by lamplight and made a total that matched, which was a relief","locked the store, checked the lock, and checked the check, as one does here"],
  manor: ["turned the wine that wants turning and left the wine that wants leaving","counted the linen against the inventory and darned what the count found wanting","laid down the new vintage in the cool dark to wait out a decade in peace","kept the good preserves in their ranks, oldest to front, none ever wasted","inventoried the plate before the dinner and after it, and it tallied both times","found the mouse before the mouse found the candles, and dealt with the mouse","brought up exactly what the cook asked and not one thing more, on principle","dusted the bottles of a vintage the family are saving for a wedding not yet proposed","logged the household's stores in a hand as neat as any steward's","kept the damp cellar and the dry cellar each to their proper purpose","stood among the laid-down bottles and read the years off them like a calendar","locked the plate away, blew out the candle, and left the cellar to its long quiet"],
  cavern: ["stored the meat deep where the rock keeps it a season without a grain of salt","sorted the dry stores from the damp along the natural line the cave draws","found the seep had crept to a new corner and moved the flour ahead of it","tallied the stores by lamplight, the only light this deep ever gets","hung the cured goods where the cold through-draught runs steady and clean","kept the one lamp burning by the door against the total dark of the store","rolled the barrels along the worn track other barrels wore before them","found the cave-cold had done in a night what a manor's ice-house does in a week","checked no blind thing had wandered up from the deep to nest among the stores","read the damp on the wall like a farmer reads the sky, and stored accordingly","stood in the cold ranked dark and knew the keep could sit out any winter","banked the door-lamp and left the store to the deep cold and the deeper quiet"],
  ruin: ["stored the keep's goods in a vault built to hold the treasure of a vanished house","cleared a century of fallen plaster off shelving that still stood, and used it","found the old bins still sound and filled them as they were meant to be filled","tallied the stores beneath a vaulted roof carved with a stranger's device","kept the goods to the one dry bay and left the flooded bays to the frogs","read a merchant's mark on an old shelf and stacked the new stock beneath it","propped a leaning pillar before it could bring the undercroft down on the stores","found a sealed alcove and what a sealed alcove keeps for four hundred years","swept a mosaic clear enough to stand a barrel on, and stood a barrel on it","logged the stores by the light of the one grating that still lets the day in","stood in the great cold undercroft and felt how much it was built to hold","locked the one sound door of a store that once needed no locking at all"],
  grove: ["put up the harvest in crocks and lofts against the long lean turn of the year","hung the drying racks where the smoke and the through-air keep the mould off","sorted the roots into the sand-boxes that keep them sound till spring","found the squirrels had tithed the nut-store again and let them keep the tithe","stacked the cordwood to season under the eave where the rain can't reach it","checked the seed-corn was dry, because a wet seed-store is a hungry spring","corked the last of the summer into bottles and set them by in the cool","kept the crocks off the earth on slats, the way the damp of a wood demands","counted the winter stores against the mouths and made the sum come out kind","found a dormouse asleep in the grain and moved it, nest and all, out to the eave","stood among the full crocks and lofts and felt the wood had been generous","barred the store against the deer and the weather both, and left it to keep"],
  vessel: ["struck the new stores down into the hold and trimmed the ship level by them","lashed every cask and crate against a sea that will come looking for the loose one","worked the manifest by lantern-light down in the close dark of the hold","shifted the ballast a strake to bring her head up where the master wanted it","found the bilge had reached the low tier and moved the meal up a level, fast","laid dunnage under everything, so no cask sat in the water that finds the hold","rousted out the rats' nest behind the salt-beef and set the cat to the rest","checked the water-casks for the taint that turns a long voyage into a short one","counted the stores against the days to landfall and did not like the arithmetic","re-stowed the whole after-hold to get at the one cask stowed, of course, first","sat in the swaying dark of the full hold and felt the ship was ready for the sea","battened the hatch, hung the lantern out, and left the hold to the swell and the dark"],
  hamlet: ["kept the common granary the whole green fills at harvest and draws on all winter","tallied each household's share in and each household's share out, fair to the grain","turned the stored roots and found the rot before the rot found the whole clamp","hung the parish's bacon in the smoke, each flitch marked with its family's notch","kept the seed-corn dry and guarded, because it is next year for the whole hamlet","swept the granary and set the cat and the traps against the winter mice","lent a sack from the store to a house that ran short, marked to be paid at harvest","checked the thatch over the store, because a wet roof is a hungry spring for all","stacked the cordwood the green cut together, each household's cord to its own","found the store fuller than the lean year before and let the whole green know it","stood in the full common store and felt the hamlet would see the winter through","barred the granary and hung the key on the one nail the whole green knows, and went home"],
},
});

registerFacility({
  id: "kitchen",
  furnishings: [{ slot: "cookfire", name: "a cooking hearth" }, { slot: "worktable", name: "a work table" }, { slot: "pots", name: "pots and pans", plural: true, srd: "g_tool_cook" }],
  roles: ["Cook", "Scullion", "Potboy"],
  staffBySize: { cramped: 1, roomy: 2, vast: 3 },
  furnishingWeight: { cookfire: 8, worktable: 4, pots: 2 },
  furnishingLadder: {
    cookfire: ["a cookfire and a pot-hook", "a proper cooking hearth", "a good range that holds its heat", "a fitted range with an oven and a spit", "a great cooking range a whole household is fed from, and famous for it"],
    pots: ["what pots there are", "pots and pans", "good copper, hung by size", "a batterie somebody chose piece by piece over years", "copper with a maker's stamp, and a pan that only one person is allowed to touch"],
    worktable: ["a plank to work on", "a proper kitchen board", "a good scrubbed deal table", "a fitted worktable with a rack and a knife-block", "a butcher's block worn to a shallow bowl by a hundred years of the same work"],
    "cookfire@cavern": ["a fire in a rock alcove, the smoke up a cut flue", "a proper stone hearth, the flue drawing true", "a good rock-cut oven that holds its heat a day past the fire", "a fitted range built into the living stone, warm to the touch a room away", "a hearth cut whole from the rock, that has warmed this kitchen since before it had a cook"],
    "cookfire@grove": ["a ring of fire-stones under the open sky", "a proper fire-pit, stone-lined and hooded against the rain", "a good clay oven built up beside the fire", "a fitted cob oven and hearth, roofed with living branches", "a hearth of fire-blackened stones the grove has grown a chimney of leaves above"],
    "cookfire@hamlet": ["the cottage's one hearth, cooking and heating both", "a proper range set into the chimney-breast", "a good range with a bread-oven in the side of it", "a fitted range and a bake-oven the whole green shares of a baking-day", "the cottage hearth that has not gone fully cold in living memory"],
    "cookfire@keep": ["a cookfire big enough for the garrison's pot", "a proper cooking hearth, iron-backed", "a good range with an oven built for baking in bulk", "a fitted range with a spit an ox will turn on", "the keep's great hearth, that has not gone cold through three sieges"],
    "cookfire@manor": ["a small range for the family's meals", "a proper cast range, black-leaded and gleaming", "a good closed range with an oven either side", "a fitted range with a spit, a bain-marie, and a hot-plate for the sauces", "a great range by a famous founder, that the cook speaks of the way others speak of a horse"],
    "cookfire@ruin": ["a cookfire lit in the corner of a great cold hearth", "a proper fire drawing in the one flue that still clears", "a good oven rebuilt in the shell of the old", "a fitted range raised where the great house's own once roared", "the old great hearth brought back to life, roasting again as it did four centuries gone"],
    "cookfire@tower": ["a cookfire on the landing, the smoke drawn up the stair", "a proper hearth with a flue cut cleverly through the stone", "a good range that burns clean and low, for long slow work", "a fitted range that will hold a simmer for a day and a night unattended", "a hearth a mage set to burn whatever colour the work wants, and it never smokes the study"],
    "cookfire@vessel": ["a galley stove wedged and watched", "a proper ship's stove with a rail and a flue", "a good stove that stays lit in a seaway", "a fitted galley range with an oven and a fiddle for every pot", "a stove that has cooked through three oceans and a fire, and the crew swear by it"],
    "worktable@cavern": ["a stone slab to work on", "a proper cut-stone table, level and cold", "a good rock table that keeps the pastry cold in summer", "a fitted stone worktable with a rack cut into the wall beside it", "a slab cut from the living rock, cold as a cellar, that will be here when the kitchen isn't"],
    "worktable@grove": ["a split log to work on", "a low table of green wood", "a good board of pale grown wood, scrubbed white", "a fitted worktable the grove half-grew to the shape", "a work-slab grown from a living stump, that scars and heals with the seasons"],
    "worktable@hamlet": ["a scrubbed board by the hearth", "a proper kitchen table, scrubbed and floured", "a good deal table the whole cottage eats and works at both", "a fitted table with a bread-trough and a rack above", "the cottage table three generations have kneaded bread on, worn to a shine in one spot"],
    "worktable@keep": ["a trestle board to prep on", "a proper scrubbed board, iron-strapped", "a good heavy table that takes a cleaver without complaint", "a fitted table with a block, a rack, and a drawer for the good knives", "a board the garrison's cooks have worked at through every siege, scarred and scrubbed pale"],
    "worktable@manor": ["a plain deal prep table", "a proper scrubbed table, one for pastry and one for meat", "a good table with a marble top for the cold work", "a fitted island with a block, a slab, and a drawer for every tool", "a worktable a cabinetmaker built for the kitchen, which no other kitchen can quite believe"],
    "worktable@ruin": ["a plank on two fallen drums to prep on", "a salvaged board set up in the old kitchen", "a good table matched to the great room it stands in", "a fitted worktable rebuilt from the old kitchen's own wreck", "a board made to the ruin's own pattern, until it looks as old as the cold hearth beside it"],
    "worktable@tower": ["a board cleared of jars to work on", "a proper table kept for food, not for the master's other work", "a good table with a rack of labelled jars beneath", "a fitted worktable with a marble slab for pastry and a lock on the poisons drawer", "a table where cooking and stranger work have shared the grain so long nobody's sure which stain is which"],
    "worktable@vessel": ["a fold-down board by the stove", "a proper galley board with a fiddle rail", "a good table cleated down against the roll", "a fitted galley worktable with racks and a lock for every knife", "a prep-board off a ship long broken up, that has dressed catches in three oceans"],
  },
  sizeFlavor: {
  keep:   ["A fire and a pot in a corner off the hall, room to feed a squad and no more.","A proper cookhouse now, hearth and board and a hanging batterie, feeding the garrison.","Great kitchens fit to victual a fortress, hearth beyond hearth, provisioned against a siege."],
  tower:  ["A hearth on a landing, a shelf of strange jars, room for one to cook and mind the pot.","A proper kitchen wedged into the tower's round, the flue drawn cleverly up through the stone.","A kitchen given half to cooking and half to whatever the master needs simmered, jars to the ceiling."],
  manor:  ["A small kitchen off the passage, a range and a board, the cook's whole domain in one turn of the head.","A proper below-stairs kitchen, range and dresser and a copper batterie, humming before dawn.","Great house kitchens with a scullery, a larder, a still-room, and a cook who rules them like a captain."],
  cavern: ["A fire in a rock alcove, the smoke drawn up a cut flue, a shelf of stores in the cool.","A proper rock-cut kitchen, stone oven and cave-cool larder, the through-draught keeping the herbs dry.","A great cavern kitchen, oven and hearth and mushroom-beds along the walls, the smoke lost in the dark above."],
  ruin:   ["A cookfire lit in the corner of a kitchen built to feed a hundred, the great hearth cold beside it.","A kitchen reclaimed to working order, the near hearth drawing again, the far end left to the birds.","The great kitchens restored, hearth and spit and oven, a room that could banquet a house long gone."],
  grove:  ["A ring of fire-stones under the open sky, a pot on a green branch, the stores in a hollow tree.","A proper greenwood kitchen, a fire-pit and a drying-rack, roofed over against the rain.","A great open-air kitchen in a clearing, fires and racks and crocks, the harvest of a whole wood put up here."],
  vessel: ["A galley the size of a cupboard, a stove wedged in tight, everything within one arm's reach.","A proper galley, a stove with a rail and a fiddle, room to feed a watch at once.","A great ship's galley, stove and coppers and a bread-oven, victualling a whole crew for an ocean."],
  hamlet: ["The one hearth of a cottage that cooks the meal and heats the room both, a pot on the crane.","A proper cottage kitchen with a bread-oven, feeding the house and half the green on baking-day.","The big kitchen of the biggest house on the green, ovens enough to bake for the whole hamlet at once."],
},
  ruin: {
  keep:   "The great pot hangs cold over a dead hearth, the flour gone to weevils, and the block still bears the marks of a knife nobody will lift again.",
  tower:  "The stove stands cold under a shelf of jars gone to dust, one pot fossilised on the ring, the strange stores turned stranger with the years.",
  manor:  "The range is cold and the copper green, the dresser bare, and a menu for a dinner that was never cooked still pinned by the door.",
  cavern: "The stone oven holds only cold ash, the mushroom-beds gone slack and pale, and the cut flue moans with a draught nobody warms.",
  ruin:   "A cookfire that briefly warmed a corner of the great dead kitchen has gone out again, and the vast hearth is as cold as the century it stood cold before.",
  grove:  "The fire-stones stand scattered and green, the drying-racks fallen, the pot rusted through where it hung from a branch that has grown right past it.",
  vessel: "The galley stove is cold and salt-rimed, the coppers rolling loose to the swell, the last of the stores long since gone to the rats and the sea.",
  hamlet: "The one hearth is dead ash at last, the bread-oven cold, and the crane swung out over a pot that boiled for this cottage longer than anyone alive remembers.",
},
  reactions: {
  why: { slovenly: "the pots left to soak, as {d} leaves things", idle: "the fire let burn down, which {d} had meant to feed", green: "the loaf come out heavy, {d} not yet knowing the oven", sly: "or so {d} swore the stock had been skimmed", proud: "and {d} would not be told the sauce had caught" },
  to: [
    { tag: "quarrelsome", d: -2, say: "and {r} scoured the whole scullery sooner than let it stand, loudly" },
    { tag: "sharp-tongued", d: -1, say: "and {r} set it right and said what {r} thought of a cold hearth" },
    { tag: "proud", d: -1, say: "and {r} said nothing, and cooked it over {r}'s own way" },
    { tag: "forgiving", d: 1, say: "and {r} only fed the fire and saw it right, the way {r} does" },
    { tag: "patient", d: 1, say: "and {r} scoured the pots down without a word said" },
    { tag: "soft-hearted", d: 1, say: "and {r} finished it and put a plate by for them" },
  ],
  generic: { d: 0, say: "and {r} let the fire go out" },
},
  lifeTasks: {
  keep: ["baked bread by the score before the garrison was awake to smell it","kept the great pot going all day so any hour brought a hot meal to a cold man","broke down a whole carcass the way the army taught, nothing wasted, nothing spared","fed the watch coming off at midnight without being asked and without a word","scoured the copper with sand and ash until a sergeant could see his face in it","counted the stores against a siege that has not come in years, out of habit","sharpened every knife in the block on the same stone, in the same order","sent a bowl out to the man on the gate who everyone else forgot was there","banked the fire to embers and set the dough to prove overnight in its warmth","argued with the quartermaster over the salt and won, as the cook always does","stood in the heat with the sweat running and would not trade the post for any other","scrubbed the boards down last thing so the mice found nothing worth their trouble"],
  tower: ["cooked around a bench of ingredients that are not, strictly, for eating","kept a stew going for a mage who forgets to eat and then eats all at once at midnight","found the salt taken for an experiment again and used the grey sea-salt instead","baked bread that rose higher than bread should and asked no questions about why","labelled every jar twice, because down here a wrong jar is a serious matter","simmered something the master ordered that smelled of no food in the world","kept the good knives well away from the ones kept for other purposes entirely","carried a tray up a great many stairs and found the study empty, as usual","cooled a pie on a sill and watched a raven consider it and think better of it","swept a fine coloured dust off the worktable and did not breathe in while doing it","cooked by a fire that burns a colour it shouldn't and long since stopped minding","left a plate by the door for the apprentice, who studies through supper and forgets"],
  manor: ["reduced a sauce for three hours and guarded it from every passing hand","ran the whole below-stairs like a captain runs a deck, and fed them well for it","baked in the cool of the morning before the ovens made the room unbearable","plated a dinner of four courses that went up the stairs looking like a painting","skimmed the stock and clarified it until it ran clear as amber, and was proud","kept the copper hung in its ranks, brightest to dullest, and woe to who moved one","sent the trimmings and the good bones down to the household's own table, quietly","tasted, adjusted, tasted again, and let no dish leave until it was right","put up the summer fruit in sugar against a winter the family won't think about","taught a scullion the roux that the last cook taught them, hand over hand","sat a moment with a cup of the good tea when the great dinner was finally sent","banked the range for the night and left the kitchen gleaming, as it must be by dawn"],
  cavern: ["cooked by lamp and firelight, the smoke drawn off up a flue cut through the rock","kept the cave-cool larder stocked, where meat keeps a season without salting","tended the mushroom beds along the damp wall that half the meals depend on","baked bread in a stone oven that holds its heat long after the fire is out","carried water up from the deep pool for every pot, the way it has always been done","found the smoke hanging low on a still day and cracked the far vent to draw it","cooked the blind fish the deep gives up, which taste of nothing and of the dark","kept one lamp always burning by the fire against the total black of a dead hearth","hung the herbs to dry where the through-draught runs, the one dry place down here","listened to the pot and the drip and nothing else, and found the quiet good company","banked the fire to the exact glow that keeps a stone kitchen warm till dawn","sat by the last coals in the deep dark and ate the burnt bit nobody else wanted"],
  ruin: ["cooked at a hearth built to roast an ox for a house that fed a hundred","cleared a swifts' nest from the great chimney before lighting the first fire in years","made a plain pottage in a kitchen that once turned out banquets, and it was enough","found the old spit-mechanism seized with rust and freed it, and it turned once more","swept a floor of worn flags where the feet of long-dead cooks wore hollows","used the one corner of the vast hearth that still draws, and left the rest to the birds","opened a store-room sealed for a century to see what had kept in it, and what had not","baked on a griddle-stone still warm from a fire, though the fire was their own","ate looking up at hooks in the beams meant for more meat than they will ever hang","read a recipe scratched in the plaster by a cook whose name the house forgot","kept the near end of the great kitchen warm and let the far end keep its ghosts","banked a fire in a hearth that has been banked for a thousand nights before this"],
  grove: ["cooked over an open fire ringed with stones, the pot hung from a green branch","gathered the morning's meal from the wood and the beds and cooked it by noon","put up the whole autumn glut in crocks and jars against the lean months coming","baked flatbread on a hot stone at the fire's edge, the old way, the only way here","hung herbs and mushrooms to dry in the smoke of a fire fed on sweet green wood","found a hedgehog had got into the store and shooed it off and left it a share","cooked to the sound of the whole grove and never wanted a wall between them","brewed and steeped and strained the hedgerow into something worth the drinking","kept the fire small and clean, because a wood does not forgive a careless cook","tasted the first honey of the year straight from the comb and told no one","cooked the last of a thing in season and made a small ceremony of the eating","banked the fire under turf and ash so a coal would keep till the morning's cooking"],
  vessel: ["cooked in a seaway with one hand for the pot and one for the ship, always","kept the galley fire in against a roll that wanted to throw it across the deck","served out the same salt beef and hard bread and made it taste of more than it was","baked what passed for bread in a stove that has been to the bottom of the world","wedged every pot in its fiddle before the weather made a weapon of the loose ones","rationed the last of the fresh against a landfall that kept not coming","brewed the coffee thick enough to stand a spoon in, the way the watch demands","fed the whole crew off a stove no bigger than a sea-chest, watch after watch","saved the fat and the scraps for the slush-fund, as every ship's cook always has","cooked through a blow with the pots lashed and the fire out, cold rations, no complaint","kept the cat fed first, quietly, because a fed cat keeps the stores from the rats","banked the galley stove and went up for one breath of clean air off the sea"],
  hamlet: ["baked more bread than one house needs, because half the green sends their dough here","kept the pot on the crane over the one fire that cooks and heats the whole cottage","put the taproom's supper on while the taproom argued about it through the wall","cured the pig every part and wasted none, the way the whole hamlet does","baked for the whole green on the one big oven-day, loaf after loaf, all morning","brewed the small beer the cottage drinks instead of the water, as everyone does","fed whoever came to the door, because in a hamlet the door is never really shut","put up preserves at harvest until the shelf groaned, and swapped half over the wall","sat the kettle on for a neighbour before they had finished saying why they'd come","baked a cake for a wedding the whole hamlet was going to whether asked or not","skimmed the cream and made the butter and kept the dairy sweet in the cool larder","banked the fire that has not gone fully out in this cottage in living memory"],
},
});

registerFacility({
  id: "courtyard",
  furnishings: [{ slot: "benches", name: "benches", plural: true }, { slot: "well", name: "a well" }],
  furnishingWeight: { benches: 6, well: 7 },
  furnishingLadder: {
    benches: ["a log to sit on", "benches", "benches with backs, set where the sun is", "carved benches, and a table for the summer", "benches somebody's grandfather made, and nobody is allowed to move them"],
    well: ["a covered cistern", "a well", "a well with a proper windlass and a lid that shuts", "a well-house, carved, with a seat around it", "a well with a face cut into the stone that people touch on the way past without noticing"],
    "benches@cavern": ["a ledge of rock to sit on", "a bench cut from the chamber floor", "a stone seat cut where the light-shaft falls", "a carved bench of banded stone, warm from the lamps", "a seat cut whole from the living rock, here before the chamber was cleared"],
    "benches@grove": ["a fallen log to sit on", "a low bench of split wood", "a bench of pale wood set in the ring of trees", "a carved seat the grove has half-grown a back onto", "a seat grown from a living root, that leafs a little every spring"],
    "benches@hamlet": ["a plank on two stones by the well", "a bench on the green where the old folk sit", "a good bench set to watch the whole common", "a carved bench the village raised for a wedding once", "the green's own bench, that the whole hamlet has sat on and nobody owns"],
    "benches@keep": ["a mounting block to sit on", "a plank bench along the yard wall", "benches set where the off-watch can catch the sun", "carved benches, and a table the garrison eats at in summer", "benches the first garrison built, that no drill-master will let be moved"],
    "benches@manor": ["a plank garden seat", "a bench where the morning sun lands first", "a curved bench set to face the beds", "a carved stone seat with a table for taking tea outdoors", "a garden seat three generations have proposed on, and nobody moves it"],
    "benches@ruin": ["a fallen block to sit on", "a bench made of two column-drums and a plank", "a bench set among the standing stones, out of the wind", "a carved seat salvaged whole from the old hall", "a bench worn smooth by four centuries of people sitting exactly there"],
    "benches@tower": ["a ledge on the parapet to sit on", "a plank seat out of the wind", "a stone seat set where the view is, and the wind isn't", "a carved seat in the lee of the merlons, with a rail", "a seat a mage set here to think in, and the wind still won't cross it"],
    "benches@vessel": ["a grating to sit on", "a sea-chest lashed by the rail to sit on", "a proper deck bench, cleated down against a sea", "a carved captain's bench abaft the wheel, brass-railed", "a deck seat off a ship long broken up, that has watched three oceans go by"],
    "well@cavern": ["a rock pool fed by the dripstone", "a cut cistern that the seep keeps filled", "a clear cold pool with steps cut down to it", "a carved basin the underground spring runs through", "a pool that has dripped full since before the mountain had a name"],
    "well@grove": ["a spring in the roots", "a spring cleared and ringed with stones", "a spring with a cup on a chain and a flat stone to kneel on", "a spring-head carved with the old signs, and cold as winter", "a spring the grove keeps sweet, that folk walked to long before the house"],
    "well@hamlet": ["a shared well on the green", "the green's well, with a sound bucket and rope", "the well with a proper windlass and a lid the children can't lift", "a well-house on the common, roofed, with a seat all round", "the hamlet's own well the whole green was built around, that every house draws from"],
    "well@keep": ["a covered cistern", "a well with a bucket and a sound rope", "a well with a proper windlass, deep enough to sit out a siege", "a well-house, roofed and locked, that no besieger can foul", "the keep's own well, sunk by the first lord and never once run dry"],
    "well@manor": ["a covered well by the kitchen door", "a well with a painted cover and a tidy bucket", "an ornamental well-head, carved, more looked at than drawn from", "a fountain that plays into a basin of good stone", "a fountain with a figure at its heart that the family are quietly vain about"],
    "well@ruin": ["an old well, half-choked, that still gives water", "the old well cleared out and made to draw again", "the old well re-sunk, new rope on ancient stone", "the old well-house patched whole, older than anything else standing", "a well that served this place under three names, and serves it still"],
    "well@tower": ["a rain-butt under the spout", "a cistern that takes the roof's rain", "a cistern with a filter of sand and charcoal, and clear water for it", "a carved cistern-house fed from every gutter in the tower", "a cistern a mage keeps sweet by some means nobody has asked about"],
    "well@vessel": ["the scuttlebutt, lashed amidships", "a sound water-cask with a proper bung", "a scuttlebutt with a dipper on a lanyard and a tarpaulin hood", "a brass-hooped cask, and a rain-catch rigged off the mainsail", "a cask that has crossed three oceans and never yet run the crew dry"],
  },
  sizeFlavor: {
  keep:   ["A narrow yard between the gatehouse and the hall, room to muster a handful and little else.","A proper drill yard now, flagged and walled, with space for the garrison to run at the pell.","A great walled court a company could parade in, the walls high enough to lose the wind at the foot of them."],
  tower:  ["A cramped platform on the leads, room for one to stand and read the stars and no more.","An open roof-court with room to walk and think, the whole country laid out below the parapet.","A broad crown of open stone atop the tower, wind-scoured and vast, the horizon unbroken the whole way round."],
  manor:  ["A small paved court with a bench and a pot or two — a place to take the morning air, no more.","A proper garden court, gravel walks and clipped beds and a fountain to sit beside.","Formal gardens within the walls, walks and hedges and a fountain, room enough to be lost in politely."],
  cavern: ["A modest chamber cleared from the rock, the light-shaft a thin blade of noon across it.","A fine open chamber with the light-shaft falling clear and a still pool at its heart.","A cathedral of a cavern, the roof lost in the dark above the lamplight, the noon shaft a distant sword of gold."],
  ruin:   ["A small cleared court among the fallen stone, grass in the joints and open sky for a roof.","A reclaimed court, columns standing again around it, the old flags swept and the weather mostly kept out.","A great roofless hall, arch after broken arch, big enough that the ruin swallows any sound you make in it."],
  grove:  ["A small clearing barely wider than the reach of the surrounding boughs, close and green and quiet.","A proper glade, room to stand in the open light with the ring of trees drawn back around it.","A wide sacred clearing, the great trees standing far off round its edge, the whole sky open overhead."],
  vessel: ["A narrow strip of deck between the hatches, room to work and little to spare.","A proper weather deck, room to holystone and coil down and stand a watch at the rail.","The broad main deck of a great ship, room fore-and-aft for the whole crew and the sea running past both rails."],
  hamlet: ["A patch of common by the well, room for a bench and a bit of washing and the day's talk.","A proper village green, the well at its heart, room for the market stalls and the children both.","A broad common the whole hamlet rings, green enough for a fair, a fête, and every goose in the parish."],
},
  ruin: {
  keep:   "Grass has come up through the flags and the pell stands scarred and grey, its last bout unfinished, the yard silent of any drill.",
  tower:  "The leads stand open to the weather, a chalked circle half-washed from the stone, and whatever was watched for from here is watched no longer.",
  manor:  "The garden court has gone to seed and bramble, the fountain choked and silent, the clipped hedges grown shapeless and wild.",
  cavern: "The light-shaft still finds the great chamber at noon and falls on nothing, the pool gone stagnant, the lamps long cold.",
  ruin:   "The roofless court has taken back what little was cleared, saplings in the flags again, the ruin quietly undoing the work of holding it off.",
  grove:  "The glade stands empty and overgrown, the ribbons rotted from the branches, the ring of trees closed a little tighter over the quiet.",
  vessel: "The weather deck lies fouled with salt and gull-lime, lines rotting where they were coiled, the wheel swinging loose to a sea with no hand on it.",
  hamlet: "The green stands empty, the well-rope frayed and still, the common gone to nettles where the whole hamlet once crossed and gathered.",
},
  reactions: {
  why: { slovenly: "the yard left half-swept, as {d} leaves things", idle: "the job set down halfway, which {d} had meant to finish", green: "done the hard way, {d} not yet knowing the trick of it", sly: "or so {d} swore it had been seen to", proud: "and {d} would not be told it wanted doing again" },
  to: [
    { tag: "quarrelsome", d: -2, say: "and {r} made sure the whole yard had heard of it by noon" },
    { tag: "sharp-tongued", d: -1, say: "and {r} finished it and said what {r} thought, out where all could hear" },
    { tag: "proud", d: -1, say: "and {r} said nothing, and did it over {r}'s own way" },
    { tag: "forgiving", d: 1, say: "and {r} only took up the broom and saw it done, the way {r} does" },
    { tag: "patient", d: 1, say: "and {r} set it right without a word, out in the weather" },
    { tag: "soft-hearted", d: 1, say: "and {r} finished it for them before anyone else was out" },
  ],
  generic: { d: 0, say: "and {r} left it to the weather" },
},
  lifeTasks: {
  keep: ["swept the flags and pulled the weeds up out of the joints","drilled at the pell until the arms wouldn't lift, then went one more round","hung the washing on the line strung across the yard to catch the wind","stood in the middle of the empty yard at first light for no reason they'd give","walked the perimeter after dark out of a habit the war put in them","mended the gate hinge that has been mended four times and will be a fifth","watched the weather come across the country and read it right, for once","chased out something that had got in over the wall and said nothing about it","sat on the mounting block at dusk while the rooks went over, counting them","sluiced the mud off the flags after the drill and never remarked on it","lay on the sun-warmed stone after the rain like a dog off duty","stood at the gate looking down the empty road, a hand on the bar, for a long while"],
  tower: ["swept the leads clear of the night's strange fall of ash","stood on the roof-court reading the stars until the cold drove them in","strung a line of copper wire between the merlons and would not say what for","climbed to the open court to think, because the wind up here scours it clean","watched the weather from above it, which is a different thing entirely","found the rain had fallen on only one flagstone and stepped around it after","let a paper bird off the parapet and watched the draught carry it out of sight","chalked a circle on the open stone that the next rain took, exactly as meant","sat with the owl on the battlement, the two of them minding the dark together","counted the lights in the country below and made a total that unsettled them","left an instrument out to catch the dew, and read something off it at dawn","stood in the wind at the highest open place and felt the whole tower sway, a little"],
  manor: ["swept the garden court and edged the gravel back into its clean lines","clipped the hedge into the shape it is meant to be and stood back, satisfied","sat out with the morning on the stone bench where the sun lands first","skimmed the leaves off the fountain and let it run clear again","cut flowers for the hall and left the finest one standing, out of fairness","took tea outdoors, alone, and called it the best hour of the day","found the cat asleep in the one warm corner and let it keep the corner","rearranged the pots along the wall, admired them, and moved two back","read in the shade until the light went amber and the midges came out","swept blossom off the path that will only blossom again tomorrow","stood among the beds at dusk while the scent came up, and told nobody","let the fountain sing to an empty court all afternoon, on purpose"],
  cavern: ["swept the great chamber where the light-shaft comes down at noon","tended the glowing fungus along the walls so the chamber keeps its soft light","stood under the shaft at midday, in the one hour the sun reaches this deep","skimmed the still pool at the chamber's heart and watched it go to glass again","listened to the echo come back off the far dark and judged the weather by it","set the cairn-lamps burning round the great space against the underdark","found a blind thing had wandered up from the deep and walked it gently back","sat by the pool where the dripstone counts hours nobody else can hear","traced the great chamber's edge to where the worked stone gives way to raw","watched the shaft of noon-light crawl across the floor and marked where it stopped","breathed the cool air that comes up from below and never quite gets warm","stood in the vast dark chamber and let the quiet of the whole mountain in"],
  ruin: ["swept the roofless court where grass comes up between the old flags","cleared the ivy off a broken column and left the column broken","stood in the open hall that has not had a roof in longer than a name survives","let the rain fall where a roof once kept it out, and did not mind","found a carved face in the rubble, propped it up, and left it looking out","pulled a sapling before it could crack the last standing arch","sat on a fallen capital worn smooth by other people sitting on it","traced a mosaic through the moss and swept just enough to see the pattern","watched swifts nest in the empty windows where glass has never been","set a stone back on the wall it fell from, though it will fall again","stood in the middle of it at dusk and felt how many feet had stood there","let the wild court do what it does, which is slowly take the whole thing back"],
  grove: ["swept the fallen leaves off the glade's flat stone and let the moss keep the rest","stood in the clearing while the light came down green through the high leaves","left an offering on the old stump and did not stay to see it taken","watched the deer cross the glade at the far edge and held still until they had gone","read the weather in the way the birds went quiet all at once","cleared the spring's mouth of leaves so the water could run clean again","sat in the ring of trees where the wind can't quite reach and the quiet gathers","found mushrooms come up overnight in a ring and stepped carefully around it","hung ribbons in the low branches for a reason nobody will explain","let the bees work the clearing all afternoon and stayed out of their road","stood in the first frost as it took the glade, and watched it take it","lay in the middle of the clearing under the moving branches, thinking of nothing"],
  vessel: ["holystoned the deck white from the wind's eye aft, and took pride in it","coiled every line down against the rail and stood back to see it Bristol-fashion","stood the forenoon watch at the rail, reading the weather off the horizon","swabbed off the salt the sea had put back on the deck overnight","tarred the seams along the waist where the sun keeps opening them","watched a gull claim the yardarm and lost the argument, as everyone does","sat on a grating in the last of the sun with the whole deck to themselves","felt something big pass under the keel and kept it to themselves, mostly","rang the bell on the hour by hand all through the fog, and lost the count anyway","caught the spray full in the face at the rail and laughed, which surprised them","stood the middle watch alone on deck with the sea working under everything","lay back on the warm planks in a calm and watched the mast draw circles on the sky"],
  hamlet: ["drew the day's water at the green's well and stopped to talk at it, as all do","swept the common before the door, and the neighbour's door as well","set the bench back by the well where the old folk sit to watch the road","hung the washing on the green in the wind beside three other households' lines","stood at the well passing the news along, which is what the well is really for","chased the geese off the green, and off the green again an hour later","let the children play out late on the common while the light held","watched the whole hamlet cross the green to somewhere and back over an afternoon","mended the fence round the green that the goats defeat every single week","sat out on the common of an evening while the smoke went up straight all round","carried a pot to the neighbour across the green and came back with a different pot","stood on the green at dusk as the doors shut one by one round the whole square"],
},
});

registerFacility({
  id: "parlor",
  furnishings: [{ slot: "seats", name: "chairs by the hearth", plural: true }, { slot: "hearth", name: "a hearth" }],
  furnishingWeight: { seats: 2, hearth: 8 },
  furnishingLadder: {
    hearth: ["a fire pit", "a hearth", "a hearth with a mantel worth putting things on", "a carved chimneypiece that draws properly, which is rarer than it sounds", "a chimneypiece with a signature in the stone and a legend about the winter it was built"],
    seats: ["benches by the fire", "chairs by the hearth", "chairs you sink into and regret standing up from", "a suite that was chosen, not accumulated", "chairs that have been in one family so long they are furniture and also relatives"],
    "hearth@cavern": ["a fire in a hollow of the rock", "a good hearth cut in the stone, the flue drawn up through it", "a carved rock chimneypiece, warm to the touch a room away", "a fitted stone hearth, part of the living rock, that holds its heat all night", "a hearth cut whole from the mountain, that has been the warm heart of this deep house forever"],
    "hearth@grove": ["a ring of fire-stones in the bower", "a proper hearth of stones, hooded against the rain", "a carved fire-seat of stones with a screen of living withes above", "a fitted hearth the living wood has closed a warm bower around", "a fire-hearth of blackened stones the grove tends its own chimney of branches above"],
    "hearth@hamlet": ["the open hearth of the front room", "a good ingle-hearth with a settle either side", "a broad chimney-corner hearth with a chain and a crane", "a carved fireplace the pride of the biggest house on the green", "the great ingle-hearth the whole family was reared at, that has not gone cold in three generations"],
    "hearth@keep": ["a plain grate that draws well enough", "a good stone hearth, iron fire-back and all", "a broad hearth with a mantel a garrison hangs its stories on", "a carved chimneypiece with the keep's arms above the fire", "the great day-room hearth, that has not been let go cold in living memory"],
    "hearth@manor": ["a modest marble grate", "a good marble chimneypiece, polished bright", "a carved chimneypiece with a fine mantel and a great mirror above", "a chimneypiece a sculptor signed, the drawing room's whole centre", "a chimneypiece with a name and a legend, that the family show visitors first of all"],
    "hearth@ruin": ["a fire lit in the great old cold hearth", "the old hearth cleared and drawing true again", "a carved chimneypiece brought back to life beneath a stranger's arms", "a fitted hearth rebuilt in the solar's own grand style", "the great house's own chimneypiece, roaring again as it did four centuries gone"],
    "hearth@tower": ["a small grate that warms one chair", "a good hearth with a flue that draws the tower's draughts clean", "a carved chimneypiece with a niche for the oddments above the fire", "a chimneypiece worked with signs that keep the smoke sweet and the fire even", "a hearth a mage set to burn low and warm and never smoke the books, and it never has"],
    "hearth@vessel": ["a small cabin stove, watched", "a good cabin stove with a proper flue and a fender", "a snug bulkhead fireplace, brass-fendered, that holds a fire in a sea", "a fitted great-cabin hearth beneath the stern-windows, gimballed and gleaming", "a cabin fireplace that has warmed three captains across three oceans and outlived them all"],
    "seats@cavern": ["a ledge by the fire with a fleece thrown on it", "stone seats warmed by the hearth, with cushions", "carved rock chairs, fleece-lined, warm from the fire", "a fitted stone settle round the hearth, part of the rock now", "seats cut from the living rock round the fire, warmed by every fire ever lit here"],
    "seats@grove": ["a log drawn to the fire-ring", "low seats of split wood round the fire", "good chairs of grown wood, cushioned with moss and fleece", "a fireside settle the grove half-grew to the shape", "seats grown from living stumps round the hearth, that leaf a little each spring"],
    "seats@hamlet": ["a bench in the chimney-corner", "the settle by the fire and a chair or two", "a good high-backed settle that keeps the draught off the fire", "a carved ingle-settle the whole family fits along", "the fireside settle three generations have sat the winters out on"],
    "seats@keep": ["a bench drawn up to the grate", "chairs enough for the off-watch", "good chairs a tired man is glad to find", "a settle and chairs worn to the shape of the men who use them", "the day-room's own chairs, that three garrisons have taken their ease in"],
    "seats@manor": ["a pair of parlour chairs", "matched chairs and a settee by the fire", "upholstered chairs a caller is sorry to rise from", "a drawing-room suite chosen piece by piece to agree", "chairs that have been in the family so long they are less furniture than relations"],
    "seats@ruin": ["a sound bench drawn to the fire", "salvaged chairs set by the reclaimed hearth", "good chairs matched to the great room they warm", "a fireside suite rebuilt from the old solar's own wreck", "chairs made to the ruin's own pattern, worn as if by four centuries of firesides"],
    "seats@tower": ["a stool by the fire", "a good chair, and the cat's chair beside it", "a deep reading-chair you sink into and lose an hour", "a wing-chair set just so between the fire and the shelf", "a chair a mage thought in for fifty years, and the shape of the thought is still in it"],
    "seats@vessel": ["a locker-seat by the stove", "good cabin chairs, cleated for a sea", "deep chairs that stay put in a seaway, by the stern-windows", "a fitted cabin settee beneath the stern-glass, a gimballed lamp above", "the great-cabin chairs off a ship long broken up, that have ridden out three oceans of storms"],
  },
  sizeFlavor: {
  keep:   ["A corner with a bench and a small grate, room for a man to warm his hands off duty.","A proper day-room now, a good fire and chairs enough for the off-watch to sit round.","A great hall of a common-room, a hearth at each end, the whole garrison's ease under one roof."],
  tower:  ["A chair and a small fire on a landing, the one warm corner in a cold tall tower.","A proper study-parlour, a good fire and a deep chair and shelves within reach of both.","A great sitting-room given half to comfort and half to the work that follows you into it."],
  manor:  ["A small parlour, a fire and two chairs, room to receive one caller at a time.","A proper drawing room, a good fire, a piano, and chairs set for a morning of callers.","A grand drawing room the length of the front, hearth and window and a room made to be seen in."],
  cavern: ["A fire in a warm nook of the rock, room for a few to gather at the one bright place.","A proper hearth-room, a good fire and chairs, the warm heart of the cold deep house.","A great firelit chamber deep in the rock, the hearth blazing against a dark that has no far wall."],
  ruin:   ["A warm corner made in a great cold solar, a fire and a chair among the fallen stone.","A solar reclaimed to comfort, the near hearth blazing, the far end left to its echoes.","The great withdrawing room entire, restored and firelit, a room built for a court to sit in."],
  grove:  ["A ring of stones and a small fire, room for a few to sit close in the green dusk.","A proper sitting-glade, a fire-ring and log seats, screened with living withes.","A great firelit clearing, the household gathered at its heart, the dark wood drawn round it."],
  vessel: ["A cramped cabin with a stove and a bench, the one snug corner below decks.","A proper day-cabin, a stove and good chairs and the wake unrolling in the stern-windows.","The great cabin astern, the whole beam of the ship, hearth-warm beneath a sweep of stern-glass."],
  hamlet: ["The one warm front room, the ingle-nook by the fire where the family fits of an evening.","A proper front room, a good fire and the settle, room for the neighbours to come in after supper.","The great room of the biggest house on the green, the fire the whole hamlet gathers to of a winter night."],
},
  ruin: {
  keep:   "The day-room fire is long cold, the cards still dealt on the table for a hand that was never played out, the best chair pulled close to a hearth that gives no more warmth.",
  tower:  "The good chair sits by a dead fire, a book open on its arm, the cat's cushion still shaped to a cat, the one warm room in the tower gone as cold as the rest.",
  manor:  "The drawing room stands shrouded and grey, the piano silent under dust, the good cups set out on the table for callers who stopped coming a lifetime ago.",
  cavern: "The hearth at the heart of the rock is dead ash, the lamps long dry, and the cold deep dark has come all the way in to where the fire used to hold it back.",
  ruin:   "A fire warmed a corner of the great solar a while, and now that corner is as cold as the rest of it, the chairs rotted where they were drawn to a hearth four centuries dead.",
  grove:  "The fire-ring stands full of leaves and rain, the withe-screen rotted and fallen, the sitting-glade gone back to the green as if no one ever sat and talked there at all.",
  vessel: "The cabin stove is cold and salt-rimed, the good glasses smashed in their rack, the stern-windows blind with brine, the one warm room afloat gone dark and awash.",
  hamlet: "The front-room fire is dead in the ingle at last, the settle empty, the kettle cold on the hob, the warm heart of the little house gone as quiet as the green outside.",
},
  reactions: {
  why: { slovenly: "the fire let die and the room gone cold, as {d} leaves things", idle: "the hearth left unswept, which {d} had meant to see to", green: "the fire laid wrong and smoking, {d} not yet knowing the trick of the flue", sly: "or so {d} swore the room had been set to rights", proud: "and {d} would not be told the fire wanted making up" },
  to: [
    { tag: "quarrelsome", d: -2, say: "and {r} raked the whole thing out and relaid it sooner than let it smoke, loudly" },
    { tag: "sharp-tongued", d: -1, say: "and {r} set it right and said what {r} thought of a cold parlour" },
    { tag: "proud", d: -1, say: "and {r} said nothing, and laid the fire again {r}'s own way" },
    { tag: "forgiving", d: 1, say: "and {r} only made the fire up and swept the hearth, the way {r} does" },
    { tag: "patient", d: 1, say: "and {r} coaxed it back to a blaze without a word said" },
    { tag: "soft-hearted", d: 1, say: "and {r} built it up warm again and drew the good chair to it for them" },
  ],
  generic: { d: 0, say: "and {r} left the room to go cold" },
},
  lifeTasks: {
  keep: ["banked the day-room fire up high because the off-watch had earned a warm room","dealt the cards for a game that has run, hand to hand, since before the war","wrote a letter home at the good table and left a space where the news should go","dozed in the best chair by the fire and denied it flatly when accused","mended a shirt by the firelight because the light in the barracks is no good for it","kept the pot of something hot on the hearth for whoever came in off the cold wall","told the young ones the story again, the one with the different ending each time","sat with a man who'd had bad news and said nothing, which was the right thing","cleaned a well-worn pipe and packed it and did not, in the end, light it","settled the same old argument about the same old campaign the same old way","read the one letter that came this month aloud, to a room that had all heard it","banked the fire and turned the lamp down and left the day-room to the last man up"],
  tower: ["lit the one comfortable fire in a tower otherwise given over to the work","read something not for study for once, in the good chair, with the cat asleep on it","moved the cat off the warm chair and sat, and moved again when the cat came back","received a rare visitor in the one room fit to receive them, and hid the rest","sat by the fire turning a problem over that the desk had refused to solve","dusted the oddments on the mantel, each of which has a story nobody will tell","brewed something restorative and drank it watching the fire and not the flames","found the fire burning a colour it shouldn't and warmed their hands at it anyway","sat up late in the one warm room while the tower ticked and settled around them","wrote a letter that would take a year and a raven to arrive, and sealed it slowly","let the apprentice sit by the fire an hour, which is not permitted, and said nothing","banked the fire, took the lamp, and left the warm room to the cat and the dark"],
  manor: ["laid the fire in the drawing room an hour before the callers were due","set out the good cups for a caller who would notice if the good cups were not out","received the morning's visitors and got through the whole call without incident","arranged the flowers on the mantel and stood back and disliked them and began again","played the piano to an empty room because an empty room is the best audience","took tea by the window and watched the drive for a carriage that did not come","dusted the frames of ancestors who look faintly disapproving of the dusting","sat with the needlework and made no progress and enjoyed making no progress","drew the curtains against the evening and lit the lamps and made the room golden","entertained a caller who outstayed their welcome by a full and measured hour","sat alone in the good room after everyone had gone, in the quiet they left behind","banked the drawing-room fire and closed the good room up, gleaming, for the night"],
  cavern: ["built the fire high in the one bright warm room at the cold heart of the rock","gathered the household to the hearth, because down here the fire is where the day is","kept the good lamps burning round the hearth-room against the pressing dark","told a tale by the firelight that the stone gave back doubled, as it always does","dried the wet things at the fire that the cave-damp had got into again","warmed a chilled traveller at the hearth who'd come a long cold way through the rock","sat where the firelight reaches and the dark begins and found the edge good company","banked the fire to the glow that keeps a rock room warm right through till morning","carved a little at the fireside, the way hands do when the mind is somewhere else","listened to the deep water move somewhere below and the fire crack, and nothing else","kept one flame always by the hearth, because a dark hearth-room down here is a grave","banked the fire, left the one lamp, and let the mountain's dark come to the door"],
  ruin: ["made a warm corner in a solar built for a court, and it was corner enough","lit a fire in a hearth carved with the arms of a house four hundred years gone","swept a patch of a great mosaic floor clear enough to set two chairs upon","sat by the fire under a ceiling half-open to the stars and did not mind the stars","found the old window-seat still sound and sat in it as its makers meant","read by the one tall window that still holds its glass, in the light it lets through","warmed the near end of the great cold room and let the far end keep its echoes","propped a fallen carving upright by the hearth, a stone face for company","hung a curtain across the broken arch to keep the near warmth from the far cold","traced a motto cut in the mantel that nobody now can read, and left it be","sat in the great ruined room at dusk and felt the company of all who sat there before","banked the fire and left the solar to the owls that have the run of the far end"],
  grove: ["laid a small fire in the ring of stones at the heart of the sitting-glade","gathered the household to the fireside as the green went dark and cool around them","swept the leaves off the flat stones that serve for seats in the bower","sat by the fire while the whole grove settled into its loud green night","wove a fresh screen of living withes to keep the evening draught off the fire","warmed a guest at the greenwood fire who had walked a long way through the trees","told the old tale to the young ones with the whole wood listening in at the edges","found a hedgehog had come to the warmth and let it keep its place by the fire","banked the fire small and clean, the way a wood insists a fire be kept","sat in the ring of firelight with the dark trees drawn close, and found it home","let the last of the light and the first of the stars share the clearing a while","banked the fire under turf, and the bower went dark and green and quiet as the wood"],
  vessel: ["lit the cabin stove and made the great cabin snug against a cold grey sea","dealt the cards on the cabin table for the officers off watch, and lost, and paid","sat in the stern-windows watching the wake unroll and the weather come up astern","brought out the good glasses for a cabin dinner that the sea did its best to spoil","read by the swinging lamp with one foot braced against the roll, and was content","kept the cabin trim and dry against the damp that finds every ship in the end","received a passenger in the one civilised room afloat and made it seem larger than it is","wedged the decanter in its rack before the weather made an argument of it","sat up in the stern-sheets through the middle watch with a mug and the master's dog","wrote the log's fair copy at the cabin table, and a letter home beneath it, secretly","watched a storm through the stern-windows from the one warm dry place in the world","hooked the lamp low, latched the stove, and left the cabin to the swell and the dark"],
  hamlet: ["banked the front-room fire in the ingle where the whole family fits of an evening","set the good chairs to the fire for the neighbours who would be in after supper","sat in the settle in the chimney-corner where the warmth pools and the draught can't reach","received the whole green in the front room over one long winter evening, in turns","mended by the firelight while the talk went round the room and out the door","kept the kettle on the hob for whoever's knock came at the door, and one always did","told the tale to the children in the firelight that their parents were told in it","dried the day's wet things on the fireguard and filled the room with the smell of home","sat the old folk nearest the fire, as is right, and took the cool end by the door","let the cat and the dog and the children all have the hearthrug, and stood, himself","sat on by the banked fire after the house was abed, in the last of the warmth and the quiet","banked the fire that warms the whole small house, and climbed to the cold room above it"],
},
});

registerFacility({
  id: "dining",
  furnishings: [{ slot: "table", name: "a dining table" }, { slot: "chairs", name: "chairs enough for company", plural: true }],
  furnishingWeight: { table: 4, chairs: 2 },
  furnishingLadder: {
    chairs: ["stools", "chairs enough for company", "chairs that match, and a carver at the head", "chairs with arms, backs and opinions", "chairs by a maker whose name people say out loud"],
    table: ["a plank table", "a dining table", "a good table that seats everyone without argument", "a long table of one tree, and you can tell", "a table with a name, and a story about the year it was carried in through the wall"],
    "chairs@cavern": ["stone ledges pulled up to the slab", "stools cut from the chamber floor", "carved stone seats warmed by the lamps before a meal", "chairs of banded stone with fleeces thrown over the cold of them", "seats cut from the living rock round the table, here before anyone sat in them"],
    "chairs@grove": ["logs rolled up to the board", "low stools of split wood", "chairs of pale grown wood, light to shift for the weather", "carved seats the grove has half-grown backs and arms onto", "seats grown from living stumps in a ring, that bud a little every spring"],
    "chairs@hamlet": ["stools and a bench or two", "taproom benches and a settle by the fire", "benches enough for a market-day crowd, and the good settle kept for the old folk", "a carved high-backed settle in the warm corner, and stools for the rest", "the fireside settle the whole hamlet has warmed itself on, that belongs to no one and everyone"],
    "chairs@keep": ["benches that knock down with the board", "mess benches, worn smooth by soldiers", "benches enough for the garrison, and a chair at the head", "carved chairs for the officers, benches for the rest, and nobody minds", "the old benches the first garrison sat, that outlast every soldier who ever did"],
    "chairs@manor": ["plain chairs", "matched chairs and a carver at the head", "upholstered chairs a guest is glad to be seated in", "carved chairs with arms, backs, and opinions", "chairs by a maker whose name the family say out loud, and often"],
    "chairs@ruin": ["fallen blocks pulled up to the board", "the old feast-benches, the soundest of them", "chairs salvaged whole and matched as near as the ruin allows", "carved seats rebuilt from the old hall's own broken set", "benches worn to a shine by feasts nobody living remembers"],
    "chairs@tower": ["a stool and a stack of books that serve as a second", "chairs cleared of papers for the meal", "good chairs, and one that swivels for reaching the high shelf", "carved chairs with arms to read in as much as dine in", "a chair a mage sat in so long it took their shape, and no one else will use it"],
    "chairs@vessel": ["sea-chests pulled up to the mess table", "benches cleated to the deck against a roll", "proper mess benches with a fiddle to keep a man in his seat", "a carved captain's chair, gimballed, and benches for the mess", "the wardroom chairs off a ship long broken up, that have dined through three wars"],
    "table@cavern": ["a slab on trestles", "a stone table, level at last", "a table cut whole from the floor and polished", "a table of banded stone that took two years and was worth it", "a table that was here before the room was, and the room was built around it"],
    "table@grove": ["a plank on two stumps", "a low table of split green wood", "a good board of pale wood, still faintly living", "a carved table the grove half-grew to the shape of a table", "a table grown from a ring of living saplings, that leafs at the corners in spring"],
    "table@hamlet": ["trestle boards that clear for a dance", "long taproom tables, scrubbed and scarred", "a proper bar and boards enough for a market-day crowd", "a carved settle-and-board by the fire, the good corner of the room", "the taproom's own long bar that the whole hamlet has leaned on and nobody owns"],
    "table@keep": ["a trestle board that knocks down for drill", "a long mess table, scrubbed pale", "a good refectory board that seats the whole garrison", "a carved high table with the keep's arms burnt into the end", "the great board the first garrison ate at, too big to leave and too old to burn"],
    "table@manor": ["a plain dining table", "a good table dressed with a proper cloth", "a mahogany table that seats a dinner without crowding", "a carved table with leaves to draw it out for a ball", "a table with a name and a story about the year the wall came down to bring it in"],
    "table@ruin": ["a plank laid across two fallen drums", "a salvaged board set up in the old feast-hall", "a good table matched to the hall it stands in, four centuries late", "a carved board rebuilt from the old high table's own wreck", "a table made to the ruin's own pattern, and you cannot tell which age it is from"],
    "table@tower": ["a small table cleared of books, mostly", "a proper table the papers are meant to stay off", "a good table with a rack beneath for the books that migrate to it", "a carved table inlaid with a star-chart nobody eats over the middle of", "a table a mage worked and dined at both, ink and gravy in the same old grain"],
    "table@vessel": ["a plank across two barrels", "a table with a fiddle rail", "a swinging table that stays level in a sea", "a captain's table, inlaid, bolted, and worth more than the boat", "a table that has hosted three surrenders and one wedding"],
  },
  sizeFlavor: {
  keep:   ["A close mess room, one board and benches, room for a squad shoulder to shoulder.","A proper refectory now, a long board that seats the garrison with room to carry the pot round.","A great hall with the high table on a dais, room for the whole household and a hundred guests at a feast."],
  tower:  ["A corner with a small table, cleared of books when there is a meal to be had, which is not always.","A proper room to eat in, a good table, and shelves near enough that supper and study share it.","A hall that dines and studies at once, the long table down its centre and the books climbing the walls all round."],
  manor:  ["A small dining parlour, a table for the family and no more, cosy against a winter's night.","A proper dining room, a long table dressed with the good service, room for a dinner party in comfort.","A grand dining hall, the table drawn out its full length, sideboards down both walls and room for a ball after."],
  cavern: ["A close chamber with a stone slab for a board, warm with lamplight against the surrounding dark.","A proper hall cut from the rock, the long stone table down its heart, the lamps ranged along it.","A great dining cavern, the stone board vanishing into lamplit distance, the ceiling lost in the dark above."],
  ruin:   ["A corner of a greater hall, roofed again and made snug, a plain board set where a feast once was.","A reclaimed feasting hall, the roof mended over the near end, the long board set beneath old carved arms.","The great hall entire, restored roof to floor, a board fit for the hundred the room was built to feed."],
  grove:  ["A small board in a bower, roofed with woven branches, room for a household to eat close and warm.","A proper greenwood hall, the long board beneath the leaves, open at the sides to the turning weather.","A great hall of living trees, the board running its length, the canopy a roof far overhead and the seasons let in."],
  vessel: ["A cramped mess between the beams, the swinging table filling most of it, everyone within arm's reach.","A proper mess-deck, the long table slung down its centre, room for a watch to eat at once.","A great wardroom astern, the table beneath the stern-windows, room for the officers and the sea both."],
  hamlet: ["A snug taproom, one settle and a couple of boards, the fire close and the whole room warmed by it.","A proper taproom, long boards and a bar, room for the green to crowd in of a market night.","A great tavern hall, boards enough for a wedding or a wake, and the fire big enough for the whole hamlet round it."],
},
  ruin: {
  keep:   "The long board is still laid for a mess that never came in, benches overturned, a dead man's name the only company at the head of the table.",
  tower:  "A meal sits fossilised beside an open book on the table, the wine gone to vinegar in the cup, the last calculation never finished.",
  manor:  "The great table stands laid with the good service under a shroud of dust, one place set and long cold, the candles guttered to stubs.",
  cavern: "The stone board stands scrubbed and bare in a lamplight no one lit, the echo carrying nothing now but the drip in the dark.",
  ruin:   "A plain meal was once laid in a hall built for feasts, and now the hall has reclaimed the table too, ivy across the board and the old arms above it.",
  grove:  "The greenwood board has gone back to the wood, a garland rotted across it, mushrooms come up through the grain where the last meal sat.",
  vessel: "The mess table swings empty on its lashings, plates still fiddled in place, the grog cask dry, the whole deck riding a sea no one eats to.",
  hamlet: "The taproom fire is dead ash, the barrel run dry, the slate still chalked with tabs that will never now be squared, the whole green gone quiet.",
},
  reactions: {
  why: { slovenly: "the table half-cleared, as {d} leaves things", idle: "the laying-up set down halfway, which {d} had meant to finish", green: "the places set wrong, {d} not yet knowing the order of it", sly: "or so {d} swore the board had been wiped", proud: "and {d} would not be told a place was missing" },
  to: [
    { tag: "quarrelsome", d: -2, say: "and {r} relaid the whole table sooner than let it stand" },
    { tag: "sharp-tongued", d: -1, say: "and {r} set it right and said what {r} thought over supper" },
    { tag: "proud", d: -1, say: "and {r} said nothing, and laid it again {r}'s own way" },
    { tag: "forgiving", d: 1, say: "and {r} only finished the laying-up, the way {r} does" },
    { tag: "patient", d: 1, say: "and {r} cleared it down without a word said" },
    { tag: "soft-hearted", d: 1, say: "and {r} covered for them and saved them a plate" },
  ],
  generic: { d: 0, say: "and {r} let the table be" },
},
  lifeTasks: {
  keep: ["scrubbed the long board down to pale wood before the garrison came in","laid the table for more than turned up, the way they always do","argued across it about the old campaign until the candles guttered","ate standing up out of the pot like a soldier and enjoyed it more than dinner","set a place at the empty chair out of habit, and moved it away again","carved the joint fair and gave the best cut to whoever had the worst week","listened to somebody tell the story wrong and let them tell it wrong","broached the good barrel after a hard turn and made it last one night","cleared it all away in silence with one other soul, the two of them tired out","found a dead man's name carved under the table edge and left it be","sat at the head of an empty hall and ate where the lord ought to","banked the hall fire and left one lamp lit for the watch coming off"],
  tower: ["laid a meal that went cold beside an open book nobody would close","cleared a fortnight of plates that had walked in from other floors","ate alone at the small table with a diagram propped against the jug","found the salt-cellar had migrated to the observatory again, and fetched it back","argued with the apprentice over supper about a thing neither could prove","set two places from habit though there has been one of them for years","read at the table until the lamp burned down and the meal was forgotten entirely","cleaned a wine-ring off a page that should not have been near the wine","ate standing at the window watching a light move on a far hill","laid the table properly for once, and no one came down to see it","let the stew simmer while a calculation ran, and ate it near midnight, cold","sat over the last of the wine working a problem out loud to the empty room"],
  manor: ["laid the long table with the good service for a dinner still three days off","polished the silver twice, because once had not satisfied them","pressed the cloth and set the fall of it exactly straight down both sides","counted the chairs and found, as ever, that one is never sat in","dressed for a dinner that turned out to be four courses and no guests","decanted the good bottle an hour early to let it breathe, as is proper","arranged the flowers down the centre and stood back and moved them once","let a fine meal go cold while the talk at the table went on and on","sent the best dish down to the kitchen staff and said nothing of it upstairs","taught a card game across the cleared cloth with a rule invented halfway","sat on at the head after the plates were gone, unwilling to end the evening","left a place laid and a candle lit for a name that has not come in years"],
  cavern: ["scrubbed the stone table that will outlast every soul who eats at it","laid the board by lamplight, because down here there is no other kind","carried the pot up warm from the deep kitchen and set it steaming on the slab","ate close by the fire with the whole cold dark pressing at the lamp's edge","listened to the talk come back doubled off the stone, and talked the quieter for it","warmed the plates at the lamp so the food would not go cold on cold stone","broached a cask that had aged well in the constant cool of the deep","found the table's edge worn to a shine by hands over more years than record","set the lamps down the centre so the meal had its own small daylight","sat on alone at the stone board after the others had gone up to bed","let the echo carry one voice singing round the whole chamber, and did not stop it","ate in the deep quiet where the only clock is the drip, and lost the hour"],
  ruin: ["laid a plain meal on a table in a hall that once fed a hundred","swept the feast-hall floor where a mosaic of a banquet still shows through","ate beneath a ceiling carved with the arms of a house long gone","set the table in the one corner the weather has not got into yet","found the old feast-benches and dragged the soundest of them up to the board","carved a name of their own beneath a table already crowded with strangers'","lit the hall as best they could and it swallowed the light, as it always does","ate to the sound of the wind in the empty gallery where music used to play","cleared a fallen slate off the table before it could spoil the one good meal","raised the good cup in the ruined hall to whoever had raised it here before","sat where the high table was and felt the size of the company that is gone","let the ivy have the far end of the hall and kept the near end laid and warm"],
  grove: ["laid the board with what the season gave and nothing it did not","set the table under the open sky and ate before the weather turned","gathered the meal half from the wood that morning and was quietly proud of it","wove a fresh garland down the centre because the last one had gone over","ate to the sound of the whole grove at dusk, which is a kind of grace","found a squirrel had been at the nuts laid out and left it the rest, fair's fair","cleared the fallen blossom off the board between one course and the next","brewed something from the hedgerow and made everyone try it, over their protests","laid a place at the wood's edge for whatever the old custom says comes to eat","let the fire smoke sweet with green wood while the long talk went on past dark","ate the first fruit of the year at the table and made a small thing of it","sat on at the board under the stars while the grove went about its night"],
  vessel: ["shipped the swinging table level and laid the mess before the watch changed","wedged the plates in their fiddles against a sea that was getting up","served out the salt ration and the grog, fair measure, and let no one say otherwise","ate braced against the roll with one hand on the plate the whole meal","told the same three sea-stories as last night, and the mess loved them the same","dried the mess-deck out after a wave had found its way below","saved a plate for the man on watch and lashed it where the swell couldn't take it","broached a cask kept for a landfall that the whole mess drank to early","found the cat had got at the day's catch and cursed it and fed it anyway","sang the grace the old bosun taught, that is more threat than prayer","sat jammed in the corner of the mess with a mug, riding out the weather","cleared the mess in the dark by feel, the lamp long since knocked out by the sea"],
  hamlet: ["banked the taproom fire that the whole hamlet warms itself at, and never lets go out","drew off the first of the new barrel and pronounced on it to the room","laid the long boards for market day, when the whole green comes in to eat","listened to the news come up the road and round the room, table to table","let the carter stop the night and settle half his tab in stories","chalked another line on the slate against a name that will square it at harvest","sat the stranger in the warm corner and let the room decide about them slowly","swept the taproom floor of a market day's worth of mud and shells and straw","kept the fiddle going in the corner and the door open to whoever the music drew","broke up the same good-natured argument that starts over the same tankard every week","fed a traveller who could not pay and put it on the house, and told the house nothing","barred the door on the last of them at midnight, the fire banked, the whole green quiet"],
},
});

registerFacility({
  id: "bedroom",
  furnishings: [{ slot: "bed", name: "a bed" }, { slot: "chest", name: "a clothes chest" }],
  furnishingWeight: { bed: 4, chest: 3 },
  furnishingLadder: {
    bed: ["a cot", "a proper bed", "a good bed, and a frame that doesn't complain", "a carved bedstead somebody was paid well for", "a bed with a name, a maker's mark, and a story about how it got up the stairs"],
    chest: ["a clothes chest", "a chest that shuts properly", "a chest with a lock and a lining", "a banded chest, oiled, with a false bottom nobody mentions", "a chest with a maker's mark inside the lid and four generations of initials under it"],
    "bed@cavern": ["a sleeping shelf cut in the rock", "a shelf with a mattress on it, finally", "a bed-nook with a curtain and a lamp hook", "a berth carved with the family's marks, warm against the stone", "a bed cut from the living rock by somebody famous for it, and it will be here when the house isn't"],
    "bed@grove": ["a pallet of cut bracken", "a low bed of pale wood", "a bed grown rather than built, still faintly green", "a bed the grove made on purpose, and it fits you specifically", "a bed that flowers once a year, which nobody has explained and nobody asks about"],
    "bed@hamlet": ["a box-bed built into the wall by the hearth", "a box-bed with a proper door and a straw tick", "a good panelled box-bed that keeps the room's heat in", "a carved box-bed a village joiner made his name on", "a box-bed three generations were born in, and the cottage is really built around it"],
    "bed@keep": ["a soldier's cot, the blanket squared", "a proper bed with a frame that holds a hospital corner", "a good oak bed built to sit out a siege", "an officer's bedstead, the keep's arms carved at the head", "a bed a commander died in and a commander was born in, and the keep will not give it up"],
    "bed@manor": ["a made bed with clean linen", "a proper tester bed, hung and curtained", "a good four-poster, and a mattress you have to climb out of", "a carved bedstead a joiner was very handsomely paid for", "a great bed with a name of its own, that came in through a widened wall and a family legend"],
    "bed@ruin": ["a cot set up in a room built for grander sleep", "a proper bed, in a chamber that plainly once held one", "a good bed beneath a ceiling carved with a stranger's arms", "a carved bedstead that answers the old room at last", "a bed built to the ruin's own hand, until you can't tell the new work from the four-century-old"],
    "bed@tower": ["a pallet by the stair, under the draughts", "a proper bed, warded against the worst of the cold", "a good bed under a canopy that keeps the dreams on the other side of it", "a carved bed inlaid with a sigil that means sleep, and mostly does", "a bed a mage enchanted for their own rest, and it has not wanted making in a hundred years"],
    "bed@vessel": ["a hammock", "a bunk that doesn't swing", "a berth with a lee-board and a drawer under it", "a captain's berth, gimballed, with brass", "a berth that has been round the world twice and shows it in the good way"],
    "chest@cavern": ["a niche cut in the rock with a plank door", "a chest set into the stone, dry and shutting square", "a rock-cut press with a lock and a lamp-hook beside it", "a banded chest fitted into a carved recess, part of the wall now", "a strongbox cut from the living stone, that will be here when the house isn't"],
    "chest@grove": ["a hollow log with a fitted lid", "a woven kist that keeps the damp out, mostly", "a chest of pale grown wood, still faintly green", "a chest the grove shaped rather than a joiner, and seamless with it", "a chest grown shut and grown open, that answers only the hand it was grown for"],
    "chest@hamlet": ["a plain kist at the foot of the box-bed", "a kist that shuts true, painted across the front", "a good painted kist, a wedding-piece by the look of it", "a carved dower-chest a village joiner was quietly proud of", "a kist that came with a bride three generations back and holds the family's whole cloth still"],
    "chest@keep": ["a campaign footlocker, corners bound in iron", "a footlocker that shuts square and locks", "a banded chest with a soldier's tidy insides", "an officer's chest, brass-cornered, with a tray for the good sword-belt", "a chest that has followed the keep's line through three wars and lost nothing yet"],
    "chest@manor": ["a clothes chest of good plain wood", "a chest that shuts sweetly, lined in cedar", "a chest with a lock, a lining, and a breath of lavender", "a marquetry chest a cabinetmaker signed inside the lid", "a chest with four generations of initials beneath the tray and a story kept for each"],
    "chest@ruin": ["a chest set in a niche that once held something finer", "a chest that shuts properly, in a room that remembers better days", "a chest with a lock, under a carving nobody here can read", "a banded chest matched to the old room's long-vanished set", "a chest built to the ruin's own pattern, until it looks four centuries old as well"],
    "chest@tower": ["a plain chest that hums faintly if you stand near it", "a chest that shuts properly, warded against damp and moth", "a chest with a lock that turns only for the right hand", "a banded chest with a compartment that isn't there when you look for it", "a chest a mage keyed to themselves, that has kept its secrets a century past their death"],
    "chest@vessel": ["a sea-chest with rope beckets", "a sea-chest that stays shut in a sea", "a banded sea-chest with a lee-cleat and a dry lining", "a captain's chest, brass-bound, a hidden tray under the linen", "a sea-chest that has outlived three ships and every man who owned them"],
  },
  sizeFlavor: {
  keep:   ["A soldier's cell off the gatehouse — a cot, a chest, and a window barely wider than an arrow-slit.","A proper chamber now: room for the bed, the press, and a chair set where the light from the loop falls.","A lord's bedchamber, so broad its far corner never quite warms, the bed an island of blankets in the middle of it."],
  tower:  ["A cell at the stair-head, just wide enough for a pallet and the draught that climbs the tower.","A round chamber with room for the bed, the books that follow you up, and a window that takes the whole night sky.","A chamber given half to sleep and half to whatever keeps you from it, the bed small against the shelves and the dark glass."],
  manor:  ["A modest chamber — a made bed, a clothes chest, clean linen, and no room to waste on more.","A proper bedroom with a tester bed, a dressing corner, and a window seat that catches the morning.","A great bedchamber with an antechamber to it, the bed curtained like a room within the room."],
  cavern: ["A sleeping-nook cut in the rock, curtained off and warm against the stone, no bigger than the shelf and the lamp.","A carved chamber with room for the bed, a chest, and a lamp-niche, dry and still and out of the draught.","A great rock-cut chamber, the ceiling lost above the lamplight, the bed a small warm island in all that cool dark."],
  ruin:   ["A corner of some grander room, walled off with what came to hand, just big enough to sleep out of the weather.","A chamber reclaimed and made whole again, the bed where a bed was surely always meant to stand.","A hall meant for a lord's rest, its roof half-restored, the bed dwarfed by the space and the centuries."],
  grove:  ["A sleeping-bower barely more than the bed, roofed with living branches woven close against the rain.","A green chamber with room for the bed and a chest, the walls half-grown, the light coming through in leaves.","A great living hall of a bedchamber, trunks for pillars and the canopy far overhead, the bed set in the heart of it."],
  vessel: ["A berth barely longer than a body, the sea a hand's breadth beyond the hull, everything stowed within reach.","A proper cabin now — a bunk that doesn't swing, a sea-chest, and a port that takes the light and the weather both.","The great cabin astern, the whole beam of the ship, the berth beneath a sweep of stern-windows with the wake below."],
  hamlet: ["The sleeping-corner of a one-room cottage — the box-bed by the hearth, and the rest of life a step away.","A cottage with a room to sleep in of its own now: the box-bed, a chest, and a window on the green.","The whole upper floor of the biggest house on the green given to sleeping, box-beds ranged along the warm chimney wall."],
},
  ruin: {
  keep:   "The cot lies overturned, a soldier's kit still hung on its peg, and dust has drifted across a bed nobody will muster from again.",
  tower:  "The bed stands unmade beneath a cold window, a book face-down where a hand let it fall, and the wards have long since gone quiet.",
  manor:  "The great bed lies stripped and grey, its curtains rotted to lace, and a pressed flower still marks the page no one came back to read.",
  cavern: "The sleeping-shelf holds only a mildewed fleece, the lamp long dry, and the dark has come all the way back into the nook.",
  ruin:   "A bed was set here in a room already old, and now the room has taken it too, the coverlet gone green under a crack in the roof.",
  grove:  "The bower has grown shut over an empty pallet, moss claiming the blankets, and the grove is quietly folding the bed back into itself.",
  vessel: "The berth stands empty, the sea working the timbers of a ship nobody cons, a sea-chest sliding an inch with each long swell.",
  hamlet: "The box-bed by the cold hearth stands open and empty, the quilt gnawed for a nest, and the cottage has gone back to the mice and the weather.",
},
  reactions: {
  why: { slovenly: "the bedding left half-turned, as {d} leaves things", idle: "the mending set down half-finished, which {d} had meant to see to", green: "the hangings up crooked, {d} not yet knowing the trick of it", sly: "or so {d} swore the bed had been aired", proud: "and {d} would not be told the corners were wrong" },
  to: [
    { tag: "quarrelsome", d: -2, say: "and {r} stripped the whole bed again to make the point last a week" },
    { tag: "sharp-tongued", d: -1, say: "and {r} remade it, and said precisely why it wanted remaking" },
    { tag: "proud", d: -1, say: "and {r} said nothing, and turned the mattress {r}'s own way after" },
    { tag: "forgiving", d: 1, say: "and {r} only finished the airing, the way {r} does" },
    { tag: "patient", d: 1, say: "and {r} smoothed it down without a word said" },
    { tag: "soft-hearted", d: 1, say: "and {r} made it up for them again, and left a candle lit" },
  ],
  generic: { d: 0, say: "and {r} left the bed as it lay" },
},
  lifeTasks: {
  keep: ["aired the mattresses and turned them, quartermaster-fashion, corners square","beat the dust out of the hangings until the whole wing smelled of cold stone","mended a blanket with the same whipstitch they'd used on a bedroll for twenty years","sat up late over a letter to a barracks that had long since been disbanded","woke before the dawn bell out of a habit no standing-down could break","laid out the hero's kit by the bed the way you do the night before a march","found an old campaign scar in the mirror-steel and stood a while with it","turned the good blanket to the cold side, the way the old sergeant swore by","swept the room out and stacked the boots by the door, toes to the wall","left the shutter cracked to hear the watch change, and slept the better for it","shook a dead man's coat out of the press, brushed it down, and hung it back","lay in full dark and listened to the keep breathe, and only then stood down"],
  tower: ["aired the mattress and found it three fingers off the floor by morning","turned the bed to face the stair, because the draught up it carries dreams","mended the coverlet where something had scorched a neat circle in the night","sat up with a candle that would not gutter no matter how late the hour got","woke at the same odd chime again and stopped asking which floor it came from","swept a ring of salt round the bed and slept inside it without saying why","found the window open once more, on a floor that has no stair up to it","read the one page four times over, waiting for the wards to settle for the night","moved a stack of grimoires off the pillow and onto the other pillow","dreamed in a language they do not speak and woke still reciting it","left the lamp lit for the apprentice, who fears the dark and will not say so","lay awake counting the tower's steps from memory and got a different total"],
  manor: ["aired the good linen on the line and had it pressed warm before dusk","beat the feather bolsters until they stood up proud against the headboard again","mended the canopy fringe with thread that almost matched, and fretted over it","turned down the bed for a guest who sent word, too late, that they weren't coming","woke to birdsong and lay a scandalous quarter-hour longer than was proper","slid a warming-pan between the sheets an hour early, against the evening chill","found a pressed flower in the book on the nightstand and left it exactly there","put the best coverlet on for no occasion, and dared anyone to remark upon it","dusted the bed-curtains and rehung them a clean hand's-breadth straighter","set a posy on the sill because the room, they said, had been looking tired","smoothed the counterpane four times until the fall of it was finally perfect","sat in the window seat with the shutters wide and the whole quiet house below"],
  cavern: ["turned the mattress on its stone shelf and swept the grit out from under it","banked the little lamp so the sleeping-nook would hold its warmth till morning","mended the curtain that keeps the draught off the shelf where they sleep","sat up by the one lamp, because down here the dark is total and it is company","woke with no notion of the hour, the way you always do without a sky","laid an extra fleece against the wall, which keeps its own cold whatever the fire does","found the rock above the bed sweating and set a bowl to catch it, unbothered","warmed the bedding at the lamp before turning in, the same as every night","swept the chamber and stacked the boots where the floor stays dry","lay listening to the deep water move somewhere below and found it a lullaby","traced the marks cut into the headboard-stone, older than anyone who sleeps here","put out the lamp and let the mountain's dark come down like a lid, and slept"],
  ruin: ["aired the mattress in a room that was plainly built for something grander","swept a floor whose old mosaic shows through wherever the dust gives way","mended the bed-hangings and matched the thread to a colour four centuries gone","sat up under a ceiling carved with a house's arms that nobody here can read","woke to the room gone colder on one side — the side against the old wall","set the bed along the only wall without a door hidden somewhere in it","found a name scratched behind the headboard, and did not scratch it out","shook the coverlet in a shaft of light through a crack that frames the stars","shifted the bed off a flagstone that rang hollow, and slept the easier for it","dusted a niche by the bed that was made to hold something, and left it empty","lay awake as the age of the place settled round the room like a second blanket","stood a candle in the old sconce, where a candle was always meant to go, and it fit"],
  grove: ["aired the bedding in the green light that comes down through the leaves","swept out the sleeping-glade and found it had rained acorns in the night","mended the coverlet where a bird had pulled the wool for its nest, and let it","sat up a while watching the moon walk through the branches over the bed","woke with the whole grove waking, which is loud, and lay in the middle of it","laid fresh rushes and dried herbs beneath the mattress, so the bed smells of summer","found a beetle asleep in a fold of the blanket and carried it back out gently","banked the bed round with moss against the first real frost of the year","shook off the leaves that come in however carefully you close the wall","left the shutter open on purpose, to sleep beneath the sound of the spring","watched a stag stand at the glade's edge from the warmth of the blankets","lay in the dark listening to the wood breathe, and thought better of everything"],
  vessel: ["aired the bedding on the rail and hauled it in before the spray could reach it","lashed the sea-chest down again where the swell keeps working it loose","mended the bunk-curtain that keeps the lamp off the next man's watch below","sat up in the swell with a letter and gave it up when the ink kept sliding","woke when the watch-bell rang and lay in the dark counting off the tolls","drove a wedge under the bunk to stop it working against the hull all night","found the porthole weeping again and stopped it with the same old rag","rolled with the ship in the bunk the way you learn to, or you don't sleep","slung the hammock higher, where the bilge-smell doesn't quite reach","left the lamp trimmed low for the hand coming off the middle watch","lay listening to the sea work the timbers, and found the sound had become home","rode out a long swell wedged in the berth, and never fully woke to it"],
  hamlet: ["banked the one fire so the whole cottage would hold its warmth till dawn","turned the mattress in the box-bed built into the corner by the hearth","mended a quilt pieced from every worn-out thing the cottage ever owned","sat up by the last of the coals while the rest of the room slept on around them","woke to the neighbour's cockerel and lay listening to the whole hamlet stir","swept the old rushes out the door and laid fresh ones down before dark","strung the day's washing on the line that crosses the room above the bed","found the cat had kittened in the bedding, and moved the whole family gently","laid the children's pallet nearer the fire and took the cold side by the wall","passed a candle-end over the low wall to the cottage next door, and got one back","barred the one door and banked the one fire, and the whole of home was one warm room","lay in the box-bed and listened to the green go quiet, cottage by cottage"],
},
});

// FURNISHINGS — unique kitchen slots. pots keeps its existing (kitchen-only) default; cookfire & worktable
// are new, so each gets a default (for a formless keep) plus all eight houses.
Object.assign(FURNISHING_WEIGHT, { cookfire: 8, worktable: 4 });   // preserve the old hearth/table weights under the new names
