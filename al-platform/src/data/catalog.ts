// ============================================================================
// MY CATALOG — the curated item catalog: SRD magic items, PH 2024 variants, and my
// campaign-authored items. HAND-CURATED by me — not generated from srd-source/.
//
// THE CATALOG IS BORN COMPLETE. The mundane gear (weapons, armour, adventuring gear) and the
// generic spell-scroll rows are MERGED IN at the bottom of this file, so that importing CATALOG
// from anywhere — UI, reducer, harness, mint suite — always yields the full item universe. This
// merge used to live in app.tsx as a load-order side effect; that made CATALOG's completeness
// depend on the UI entry point having run first, which silently broke every consumer that imported
// it in isolation (craftItemsFor saw 0 weapons in tests, and would have shipped an empty smith
// craft-list). The data layer owns the data. (Moved 29 Jul; see the merge block below.)
// ============================================================================
import MUNDANE_GEAR from "./srd/mundane_gear.json";

// ---- Catalog (SRD-derived + one admin-authored variant) ----
export const CATALOG: Record<string, any> = {
  flametongue: {
    id: "flametongue", name: "Flame Tongue", srd: true, rarity: "rare", itemType: "weapon",
    category: "Weapon (any sword)", attune: true, weight: "3 lb.", props: ["fire", "weapon"],
    damage: "base weapon + 2d6 fire (while ablaze)", damageType: "slashing/piercing + fire",
    desc: "You can use a bonus action to speak this magic sword's command word, causing flames to erupt from the blade. These flames shed bright light in a 40-foot radius and dim light for an additional 40 feet. While the sword is ablaze, it deals an extra 2d6 fire damage to any target it hits. The flames last until you use a bonus action to speak the command word again, or until you drop or sheathe the sword.",
    traits: ["Bonus action to ignite or extinguish", "Bright light 40 ft., dim light +40 ft.", "+2d6 fire damage while ablaze"],
  },
  emberrod: {
    id: "emberrod", name: "Emberrod", srd: false, variant: true, base: "flametongue", adventure: "DDEX1-1 Defiance in Phlan",
    rarity: "rare", itemType: "weapon", category: "Weapon (rapier)", attune: true, weight: "2 lb.", props: ["fire", "weapon"],
    damage: "1d8 piercing + 2d6 fire (while ablaze)", damageType: "piercing + fire",
    desc: "A Phlan-forged rapier whose fuller runs with banked embers. Mechanically identical to a Flame Tongue; only its presentation differs — the flame is dressed as glowing coals rather than open fire.",
    traits: ["Adventure variant of Flame Tongue", "Same mechanics and rarity as its base"],
  },
  whisperblade: {
    id: "whisperblade", name: "Whisper", srd: false, rarity: "rare", itemType: "weapon",
    category: "Weapon (shortsword)", attune: true, weight: "2 lb.", props: ["finesse", "weapon"],
    damage: "1d6 piercing", damageType: "piercing",
    desc: "While you are attuned to this blade, sound falls away around it. You make no noise when you move, and the sword is silent when drawn or sheathed. On a hit, the target can't cry out or verbally alert others until the start of your next turn.",
    traits: ["Finesse, light", "Silences the wielder's movement", "Suppresses a struck target's outcry"],
  },
  cloakelven: {
    id: "cloakelven", name: "Cloak of Elvenkind", srd: true, rarity: "uncommon", itemType: "wondrous",
    category: "Wondrous item (cloak)", attune: true, weight: "1 lb.", props: ["stealth"],
    desc: "While you wear this cloak with its hood up, Wisdom (Perception) checks made to see you have disadvantage, and you have advantage on Dexterity (Stealth) checks made to hide. The cloak's color shifts to match its surroundings.",
    traits: ["Hood up to activate", "Camouflages the wearer"],
  },
  bootsstriding: {
    id: "bootsstriding", name: "Boots of Striding and Springing", srd: true, rarity: "uncommon", itemType: "wondrous",
    category: "Wondrous item (boots)", attune: true, weight: "1 lb.", props: ["movement"],
    desc: "While you wear these boots, your walking speed becomes 30 feet, unless your walking speed is higher, and it can't be reduced below 30 feet. You can jump three times the normal distance, though you can't jump farther than your remaining movement allows.",
    traits: ["Speed floor of 30 ft.", "Triple normal jump distance"],
  },
  bagholding: {
    id: "bagholding", name: "Bag of Holding", srd: true, rarity: "uncommon", itemType: "wondrous",
    category: "Wondrous item", attune: false, weight: "15 lb.", props: ["storage"],
    desc: "This bag has an interior space considerably larger than its outside dimensions — about 2 feet in diameter at the mouth and 4 feet deep. It can hold up to 500 pounds, not exceeding a volume of 64 cubic feet, and always weighs 15 pounds. Retrieving an item requires an action. If overloaded, pierced, or torn, the bag ruptures and is destroyed.",
    traits: ["Holds 500 lb. / 64 cu. ft.", "Always weighs 15 lb.", "No attunement required"],
  },
  wandwarmage: {
    id: "wandwarmage", name: "Wand of the War Mage, +1", srd: true, rarity: "uncommon", itemType: "wand",
    category: "Wand", attune: "by a spellcaster", weight: "1 lb.", props: ["+1", "arcane"],
    desc: "While holding this wand, you gain a +1 bonus to spell attack rolls. In addition, you ignore half cover when making a spell attack.",
    traits: ["+1 to spell attack rolls", "Ignore half cover on spell attacks"],
  },
  staffwoodlands: {
    id: "staffwoodlands", name: "Staff of the Woodlands", srd: true, rarity: "rare", itemType: "staff",
    category: "Staff", attune: "by a druid", req: { classes: ["Druid"], text: "a druid" }, weight: "4 lb.", charges: 10, props: ["nature"],
    desc: "This staff can be wielded as a magic quarterstaff granting a +2 bonus to attack and damage rolls. While holding it, you gain a +2 bonus to spell attack rolls. It has 10 charges for casting several nature spells and regains charges each dawn. It can also shape and animate wood.",
    traits: ["+2 quarterstaff", "+2 to spell attack rolls", "10 charges — nature spells"],
  },
  moonblade: {
    id: "moonblade", name: "Moonblade", srd: false, rarity: "unique", itemType: "weapon", disposable: false,
    category: "Weapon (longsword), sentient", attune: "by an elf or half-elf", req: { races: ["Elf", "Half-Elf"], text: "an elf or half-elf" }, weight: "3 lb.", props: ["weapon"],
    damage: "1d8 slashing", damageType: "slashing",
    desc: "A sentient elven blade bonded to a single bloodline. A moonblade serves one master at a time, chooses its wielder, and passes only by inheritance or its own will. It cannot be sold, given away, or traded.",
    traits: ["Sentient", "Bloodline-bound", "Cannot be traded (Unique)"],
  },
  verdantwand: {
    id: "verdantwand", name: "Wand of the Verdant Grove", srd: false, rarity: "uncommon", itemType: "wand",
    category: "Wand", attune: "by a druid or ranger", req: { classes: ["Druid", "Ranger"], text: "a druid or ranger" }, weight: "1 lb.", props: ["wand"],
    damage: "—", damageType: "—",
    desc: "A slender wand of living hollywood, warm to the touch. Only one at home in wild places can wake its magic — in any other hand it is inert.",
    traits: ["Requires a druid or ranger", "Can be released or passed on"],
  },
  // ---- Sample market goods (placeholder pricing — replace with PH/DMG values in production) ----
  potion_healing: {
    id: "potion_healing", name: "Potion of Healing", srd: true, rarity: "common", itemType: "potion",
    category: "Potion", consumable: true, weight: "0.5 lb.", props: ["potion"], desc: "A character who drinks this red liquid regains 2d4 + 2 hit points.",
  },
  potion_greater_healing: {
    id: "potion_greater_healing", name: "Potion of Greater Healing", srd: true, rarity: "uncommon", itemType: "potion",
    category: "Potion", consumable: true, weight: "0.5 lb.", props: ["potion"], desc: "Regains 4d4 + 4 hit points when drunk.",
  },
  scroll_cure1: {
    id: "scroll_cure1", name: "Spell Scroll (Cure Wounds, 1st level)", srd: true, rarity: "common", itemType: "scroll",
    category: "Scroll", consumable: true, weight: "—", props: ["scroll"], desc: "A spell scroll bearing the 1st-level spell Cure Wounds.",
  },
  arrows20: {
    id: "arrows20", name: "Arrows (20)", srd: true, mundane: true, itemType: "ammunition",
    category: "Ammunition", weight: "1 lb.", props: ["ammunition"], desc: "A bundle of twenty arrows.",
  },
  l5_alltool: { id: "l5_alltool", name: "All-Purpose Tool, +1", rarity: "uncommon", itemType: "wondrous", category: "Wondrous item (artificer)", props: ["spellcasting-focus"], attune: true, desc: "A +1 artificer spellcasting focus (TCE)." },
  l5_amulet: { id: "l5_amulet", name: "Amulet of the Devout, +1", rarity: "uncommon", itemType: "wondrous", category: "Wondrous item (cleric/paladin)", props: ["spellcasting-focus"], attune: true, desc: "A +1 holy-symbol spellcasting focus (TCE)." },
  l5_grimoire: { id: "l5_grimoire", name: "Arcane Grimoire, +1", rarity: "uncommon", itemType: "wondrous", category: "Wondrous item (wizard)", props: ["spellcasting-focus"], attune: true, desc: "A +1 spellbook spellcasting focus (TCE)." },
  l5_bloodwell: { id: "l5_bloodwell", name: "Bloodwell Vial, +1", rarity: "uncommon", itemType: "wondrous", category: "Wondrous item (sorcerer)", props: ["spellcasting-focus"], attune: true, desc: "A +1 sorcerer spellcasting focus (TCE)." },
  l5_dragonbelt: { id: "l5_dragonbelt", name: "Dragonhide Belt, +1", rarity: "uncommon", itemType: "wondrous", category: "Wondrous item (monk)", attune: true, desc: "A +1 belt for a monk's ki (FTD)." },
  l5_moonsickle: { id: "l5_moonsickle", name: "Moon Sickle, +1", rarity: "uncommon", itemType: "weapon", category: "Weapon (sickle) / druid focus", props: ["weapon", "spellcasting-focus"], attune: true, desc: "A +1 sickle and druid focus (TCE)." },
  l5_drum: { id: "l5_drum", name: "Rhythm-Maker's Drum, +1", rarity: "uncommon", itemType: "wondrous", category: "Wondrous item (bard)", props: ["spellcasting-focus"], attune: true, desc: "A +1 bard instrument focus (TCE)." },
  l5_rodpact: { id: "l5_rodpact", name: "Rod of the Pact Keeper, +1", srd: true, rarity: "uncommon", itemType: "rod", category: "Rod (warlock)", props: ["spellcasting-focus"], attune: true, desc: "A +1 warlock rod." },
  l5_shield1: { id: "l5_shield1", name: "Shield, +1", srd: true, rarity: "uncommon", itemType: "armor", category: "Armor (shield)", props: ["shield"], desc: "A shield granting a +1 bonus to AC, in addition to the shield's normal bonus." },
  l5_weapon1: { id: "l5_weapon1", name: "Weapon, +1", srd: true, rarity: "uncommon", itemType: "weapon", category: "Weapon (any — choose a campaign-purchasable type)", props: ["weapon"], desc: "A magic weapon granting a +1 bonus to attack and damage rolls. Choose the weapon type at creation." },
  l5_wraps: { id: "l5_wraps", name: "Wraps of Unarmed Power, +1", rarity: "uncommon", itemType: "wondrous", category: "Wondrous item (monk)", props: ["weapon"], attune: true, desc: "+1 to unarmed strike attack and damage rolls (TCE)." },
  pistol: { id: "pistol", name: "Pistol", rarity: "common", itemType: "firearm", category: "Firearm (martial ranged)", firearm: true, props: ["firearm"], desc: "A mundane firearm. Kept if awarded, but may not be traded, crafted, or replicated (ALPG). It may be sold or loaned, and needs bullets to fire." },
  belt_fire: { id: "belt_fire", name: "Belt of Fire Giant Strength", srd: true, rarity: "very_rare", itemType: "wondrous", category: "Wondrous item (belt)", attune: true, desc: "Your Strength score is 25 while wearing this belt." },
  cloak_displace: { id: "cloak_displace", name: "Cloak of Displacement", srd: true, rarity: "very_rare", itemType: "wondrous", category: "Wondrous item (cloak)", attune: true, desc: "Attackers have disadvantage against you until you take damage." },
  belt_storm: { id: "belt_storm", name: "Belt of Storm Giant Strength", srd: true, rarity: "legendary", itemType: "wondrous", category: "Wondrous item (belt)", attune: true, desc: "Your Strength score is 29 while wearing this belt." },
  staff_magi: { id: "staff_magi", name: "Staff of the Magi", srd: true, rarity: "legendary", itemType: "staff", category: "Staff (arcane)", props: ["spellcasting-focus"], attune: true, desc: "A potent arcane staff with spell absorption and many stored spells." },
  sword_chosen: { id: "sword_chosen", name: "Sword of the Chosen", rarity: "unique", itemType: "weapon", category: "Weapon (longsword) · Unique", props: ["weapon"], attune: true, desc: "A named relic of Unique rarity — cannot be traded in AL." },
  story_codex: { id: "story_codex", name: "The Sealed Codex of Phlan", rarity: "rare", itemType: "wondrous", category: "Story item", desc: "A plot-bound tome carried for the storyline. As a Story Item it isn't sold, traded, or counted toward the carry limit." },
};

// SRD attribution text (CC-BY-4.0). Required wherever SRD-derived content is shown.
export // CC-BY-4.0 asks that attribution accompany the material in the work. A COMMENT IS NOT THAT: esbuild
// strips every comment before a goat ever loads my app — the same fact p5_sources leans on when it
// exempts comments from the leak scanner. So the statement ships as DATA, is rendered in Resources,
// and p5_sources asserts it survives minification. Wizards prescribes this sentence verbatim and
// forbids any other attribution to them, so it is quoted exactly and nothing is added to it.
const SRD_ATTRIBUTION = "This work includes material from the System Reference Document 5.2 (\u201CSRD 5.2\u201D) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.";

// ================================================================================================
//  THE MERGE (moved here from app.tsx, 29 Jul, so CATALOG is complete on import regardless of who
//  imports it — the audit found craftItemsFor filtering a pre-merge CATALOG and seeing 0 weapons).
//
//  Future me: this was `Object.assign(CATALOG, MUNDANE_GEAR)` and it REPLACED rows wholesale. In my
//  pointer architecture there is exactly one way to corrupt everything at once: an unguarded write
//  to the pointee. My items store a catalogId and nothing else, so a row that changes here doesn't
//  drift, it mutates RETROACTIVELY. `arrows20` is defined twice (hand-written as ammunition, and in
//  the generated SRD block); Object.assign let the generated row win and the id survived while the
//  MEANING died (itemType "ammunition" -> "gear"), making consumableUnitCount's ALPG rule
//  unreachable. WHITELIST, NOT BLACKLIST: an UNDECLARED collision throws at load; a declared one
//  merges only the fields the generator claims to own.
const GENERATOR_OWNS = ["name", "gp"];   // exactly what make_srd_gear.py claims to correct
const CATALOG_COLLISIONS: Record<string, string> = {
  arrows20: "Hand-written as ammunition. itemType/props/desc drive consumableUnitCount's ALPG " +
            "one-per-5-shots rule and the isAmmo item card; SRD 5.2 owns only its name, cost and " +
            "weight. The generator renames 'Arrows (20)' -> 'Arrows' and prices it at 1 GP.",
};
for (const [gid, row] of Object.entries(MUNDANE_GEAR as Record<string, any>)) {
  if (!CATALOG[gid]) { CATALOG[gid] = row; continue; }
  if (!CATALOG_COLLISIONS[gid]) {
    throw new Error(
      'CATALOG collision: the generated MUNDANE_GEAR block would overwrite the hand-written "' +
      gid + '". IDS ARE FOREVER, so the id is not the problem — the silent replacement is. Declare ' +
      'it in CATALOG_COLLISIONS with a reason, or give one of them a new id.'
    );
  }
  const kept = CATALOG[gid];
  const merged: any = { ...kept };
  for (const f of GENERATOR_OWNS) if (row[f] !== undefined) merged[f] = row[f];
  merged.srd = true;
  merged.mundane = true;
  CATALOG[gid] = merged;
}

// GENERIC SPELL-SCROLL CATALOGUE — one row per level. The spell a scroll bears is INSTANCE data on
// the item, not a catalogue row, so ten rows serve all 339 spells. All ids are new; a collision
// here is a real bug, so it throws.
const SCROLL_CATALOG: Record<string, any> = {
  scroll_L0: { id: "scroll_L0", name: "Spell Scroll (Cantrip)", srd: true, rarity: "common", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 0, desc: "A spell scroll bearing a cantrip spell, named by its scribe." },
  scroll_L1: { id: "scroll_L1", name: "Spell Scroll (Level 1)", srd: true, rarity: "common", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 1, desc: "A spell scroll bearing a level 1 spell, named by its scribe." },
  scroll_L2: { id: "scroll_L2", name: "Spell Scroll (Level 2)", srd: true, rarity: "uncommon", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 2, desc: "A spell scroll bearing a level 2 spell, named by its scribe." },
  scroll_L3: { id: "scroll_L3", name: "Spell Scroll (Level 3)", srd: true, rarity: "uncommon", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 3, desc: "A spell scroll bearing a level 3 spell, named by its scribe." },
  scroll_L4: { id: "scroll_L4", name: "Spell Scroll (Level 4)", srd: true, rarity: "rare", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 4, desc: "A spell scroll bearing a level 4 spell, named by its scribe." },
  scroll_L5: { id: "scroll_L5", name: "Spell Scroll (Level 5)", srd: true, rarity: "rare", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 5, desc: "A spell scroll bearing a level 5 spell, named by its scribe." },
  scroll_L6: { id: "scroll_L6", name: "Spell Scroll (Level 6)", srd: true, rarity: "very rare", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 6, desc: "A spell scroll bearing a level 6 spell, named by its scribe." },
  scroll_L7: { id: "scroll_L7", name: "Spell Scroll (Level 7)", srd: true, rarity: "very rare", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 7, desc: "A spell scroll bearing a level 7 spell, named by its scribe." },
  scroll_L8: { id: "scroll_L8", name: "Spell Scroll (Level 8)", srd: true, rarity: "very rare", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 8, desc: "A spell scroll bearing a level 8 spell, named by its scribe." },
  scroll_L9: { id: "scroll_L9", name: "Spell Scroll (Level 9)", srd: true, rarity: "legendary", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 9, desc: "A spell scroll bearing a level 9 spell, named by its scribe." },
};
for (const [sid, row] of Object.entries(SCROLL_CATALOG)) {
  if (CATALOG[sid]) throw new Error('CATALOG collision on generic scroll "' + sid + '" — scroll_L* ids are reserved for the generated scroll catalogue.');
  CATALOG[sid] = row;
}
