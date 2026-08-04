
// Henchman personality traits. My authored data.
// A henchman's ONE signature trait, rolled at hire and kept for life. Tags, the same string idiom
// I use everywhere else (modules, items, wishlists). They do two jobs downstream: they key my
// FRICTION beats in the household week (slovenly → "found the pots they'd just scoured in a heap
// again"), and they colour who bonds or grates with whom. STARTER TABLE — content for future me
// to expand and rewrite in-voice; my engine only needs the tags to exist. A d14, because my
// names table is a d20 and these can grow to meet it.
export const HENCH_TRAITS = ["slovenly", "proud", "superstitious", "soft-hearted", "sharp-tongued", "idle", "diligent", "sly", "melancholy", "cheerful", "quarrelsome", "devout", "green", "old-hand", "forgiving", "patient"];
// ============================================================================
// MY BASTION DATA - the authored content my keep simulation runs on.
// Pure literals: facilities catalogue, orders, events, flavour, regions, forms.
// I deliberately keep the MUTABLE registries (FACILITY_ROLES, FURNISHING_LADDER,
// ...) in app.tsx: registerFacility populates them at load time, so moving them
// changes my initialisation order. They move when I land registerAll().
// ============================================================================

export const BASTION_TURN_DT = 7;

export const BASTION_CRAFT_ITEM = "arrows20";   // placeholder campaign-purchasable output; production picks the crafted type
// ================================================================================================
//  WHY ANYTHING IN HERE DIFFERS FROM THE BOOKS
// ================================================================================================
//
//  Every deviation in this file is labelled, and every label points at one of exactly three reasons.
//  Nothing here changed because somebody preferred it. If you find a change with no reason attached,
//  that is a bug in the documentation and it should be fixed or the change reverted.
//
//  [COPYRIGHT] — I couldn't ship it, so I wrote my own.
//      Game RULES are free: 17 U.S.C. 102(b) — "in no case does copyright protection extend to any
//      idea, PROCEDURE, PROCESS, SYSTEM, METHOD OF OPERATION." Seven-day turns, 6d6-each-1-kills,
//      4/16/36 squares, a d100 and a list: nobody owns any of it, and all of it stays.
//      TABLES are not free. A table is a COMPILATION, and creative selection and arrangement in a
//      compilation is protectable (Feist v. Rural, 1991). That there are 29 facilities, that they are
//      THOSE 29 with THOSE stats, that Potion of Healing gets 09-28 of Relics-Common while Ear Horn
//      gets 01-08 — none of that is a fact about the world. Wizards invented every bit of it.
//      And the Bastions chapter is NOT in SRD 5.2 (verified 16 Jul against dndbeyond.com/srd: its
//      contents run Playing the Game / Character Creation / Classes / Origins / Feats / Equipment /
//      Spells / Rules Glossary / Gameplay Toolbox / Magic Items / Monsters / Animals — there is no
//      Bastions chapter and there are no random tables at all). So there is no CC-BY cover for any
//      of it, and this is a commercial product with a free tier, which means no Fan Content Policy
//      cover either: "One word: F-R-E-E... May I sell my Fan Content? No."
//      Hence: the prose is mine, the flavour tables are mine, and where a list had to be the book's
//      it says so at the line and says what would have to change to ship it.
//
//  [TRADEMARK] — I couldn't use the NAME, so the house names it.
//      A different and faster-moving problem than copyright, and the Fan Content Policy calls it out
//      by name: "Don't use Wizards' logos and trademarks." SRD 5.2 renamed the Deck of Many Things to
//      the "Mysterious Deck" for exactly this reason — which tells you Wizards freely gave away the
//      MECHANIC and kept the NAME. The name was always the protected part.
//      Four things in this module carried one (Bigby's Handy Arcana Codex, The Chronepsis Chronicles,
//      Bigby's Burden, Kiss of the Spider Queen). They are keyed by bastion form now, so a cavern's
//      bartender names a drink the way a cavern's bartender would. The constraint became the feature.
//      NB the nominative-fair-use trap: a nickname that successfully EVOKES a mark is MORE exposed,
//      not less, because trademark's test is likelihood of confusion and working IS the infringement.
//      "The Mad Mage" is not a way round "Bigby"; it is Halaster, and a WotC product title. Allusion
//      to nothing is the safe pattern, and it is what these do.
//
//  [TABLE] — the books are written for a home game. This is organized play.
//      The single biggest one, and it is the whole reason this app exists. The DMG says "the DM rolls
//      once on the Bastion Events table." That is a home-game sentence: it assumes a DM with time.
//      An AL DM has four hours, six players and a module to run, and will never roll bastion events
//      for six keeps. That gap IS the product.
//      And AL agrees, in the ALPG's own words: "DMs adjudicate rolls, otherwise YOU LOG ALL OTHER
//      BASTION TURNS BEFORE THE SESSION OR EVENT." The DM adjudicates in session; the turns happen
//      outside it. This app is the outside-it.
//      In this app the events are STORY hooks, not adventure hooks — which is what they are for in a
//      home game and cannot be here, because the adventure is the module. That is why the trigger is
//      inverted (rolls on ACTIVE turns, per room) and why I roll rather than the DM.
//
//  [EVIDENCE] — the book's number was measured and found to produce something else.
//      Where a deviation moves gold or lives, it is MEASURED against this reducer and the figure is
//      printed at the line. Where it is a frequency, it is derived from primary sources and they are
//      named: the Household Book of Dame Alice de Bryene (Acton Hall, 1412-13); the Paston Letters
//      (Norfolk, c.1440-1500); Zmora on the Franconian Fehde (278 feuds, 1440-1567); the Anglo-
//      Scottish Border. Two of those are independent datasets that converge to within 5%, which is
//      why the siege is rare here.
//      A number with no measurement behind it is a guess wearing a citation, and this file has had
//      several. They are the bugs, not the deviations.
//
// ================================================================================================

// DMG, Storehouse — Trade income is DERIVED, not invented. The facility buys goods up to a value
// cap and sells them at a markup, both of which scale with level:
//   goods cap:  500 gp  ->  2,000 at level 9  ->  5,000 at level 13
//   sale markup: +10%   ->  +20% at 9  ->  +50% at 13  ->  +100% at 17
// Profit per Trade order = cap x markup.  L5: 500x10% = 50 · L9: 2,000x20% = 400 · L13: 5,000x50% = 2,500 · L17: 5,000x100% = 5,000
export const BASTION_STOREHOUSE_CAP = { 5: 500, 9: 2000, 13: 5000, 17: 5000 };

export const BASTION_STOREHOUSE_MARKUP = { 5: 0.10, 9: 0.20, 13: 0.50, 17: 1.00 };

export const BASTION_TRADE_INCOME = { 5: 50, 9: 400, 13: 2500, 17: 5000 };

export const BASTION_SIZE_MULT = { cramped: 1, roomy: 2, vast: 4 };          // enlarging multiplies income (DMG: enlarging an income facility increases output)

export const BASTION_ORDERS: Record<string, any> = {
  craft:    { id: "craft",    name: "Craft",    days: 7, note: "Produce campaign-purchasable gear (character-created, not tradeable).", producesItem: true, participation: true },
  harvest:  { id: "harvest",  name: "Harvest",  days: 7, note: "Gather materials or garden goods (from a set list).", producesItem: true },
  trade:    { id: "trade",    name: "Trade",    days: 7, note: "Sell produced goods for gold (capped by facility size).", producesGp: true, cadence: 1 },
  recruit:  { id: "recruit",  name: "Recruit",  days: 7, note: "At a Barracks, muster defenders (up to 4 per order)." },
  research: { id: "research", name: "Research", days: 7, note: "Gain lore or information." },
  // DMG, Empower: "The special facility confers a temporary empowerment to you or someone else."
  //   That is the whole order — it has no mechanics of its own, unlike Craft or Trade. Empower is a
  //   LABEL, and its meaning lives entirely in the six rooms that issue it: the Theater's die, the
  //   Training Area's trainer, the Meditation Chamber's Inner Peace, the Observatory's Eldritch
  //   Discovery, the Demiplane's runes, the Sanctum's rites. So this row carries the duration and
  //   nothing else; producesEmpowerment says "ask the facility what it did".
  empower:  { id: "empower",  name: "Empower",  days: 7, note: "The facility confers a temporary empowerment — it lasts 7 days, which is one Bastion turn.", producesEmpowerment: true },
  maintain: { id: "maintain", name: "Maintain", days: 7, note: "Keep things running — returns \u201CAll is Well.\u201D", event: "All is Well" },
};

// DMG, Training Area, "Expert Trainers" — the table verbatim. "When a Training Area becomes part of
// your Bastion, choose one trainer from the Expert Trainers table. On each Bastion turn, you can
// replace that trainer with another one from the table."
//
// I record WHICH benefit the character has and for how long; I do not apply it. That is the
// line this whole product sits on — D&D Beyond holds the sheet, the Exchange holds the organized-play
// layer. A 7-day proficiency is the player's to add and the DM's to spot-check, same as a level.
export const BASTION_FACILITIES: Record<string, any> = {
  // --- Basic facilities (DMG). "Basic facilities don't have any game effects, but they can inspire
  //     roleplaying opportunities and enhance a Bastion's verisimilitude." A Bastion starts with two
  //     free basic facilities: one Cramped, one Roomy. A Bastion can have more than one of each.
  bedroom:      { id: "bedroom",      name: "Bedroom",         kind: "basic",   minLevel: 5, orders: [],                    note: "Where the hero actually sleeps. No game effect — pure life." },
  dining:       { id: "dining",       name: "Dining Room",     kind: "basic",   minLevel: 5, orders: [],                    note: "A table long enough to argue across. No game effect." },
  parlor:       { id: "parlor",       name: "Parlor",          kind: "basic",   minLevel: 5, orders: [],                    note: "Somewhere to receive guests you can't refuse. No game effect." },
  courtyard:    { id: "courtyard",    name: "Courtyard",       kind: "basic",   minLevel: 5, orders: [],                    note: "Open sky inside your walls. No game effect." },
  kitchen:      { id: "kitchen",      name: "Kitchen",         kind: "basic",   minLevel: 5, orders: [],                    note: "The warmest room in any keep. No game effect." },
  storage:      { id: "storage",      name: "Storage",         kind: "basic",   minLevel: 5, orders: [],                    note: "Barrels, crates, and the things you meant to sort. No game effect." },

  // DMG, Storehouse: "Level 5 Bastion Facility · Prerequisite: None · Space: Roomy · Hirelings: 1
  //   · Order: Trade". "A Storehouse is a cool, dark space meant to contain trade goods."
  //   This was called a "Trade Post" — a name from no book, on a facility whose mechanics were
  //   already the Storehouse's: BASTION_STOREHOUSE_CAP and BASTION_STOREHOUSE_MARKUP were both
  //   sitting here under an invented sign.
  // DMG, Library: "Level 5 Bastion Facility · Prerequisite: None · Space: Roomy · Hirelings: 1
  //   · Order: Research". "Research: Topical Lore ... the hireling obtains up to three accurate
  //   pieces of information about the topic that were previously unknown to you."
  //   This was called a "Study", gated at level 9, and was assumed to stand in for the DMG's
  //   ARCANE Study — it does not. The Arcane Study is Level 5, takes the CRAFT order, and needs
  //   an Arcane Focus. A room that takes Research and needs nothing is the Library, and the
  //   Library is Level 5. The level-9 gate was mine, and it locked four levels of play out of a
  //   facility the book hands to any level-5 character who wants one.
  // DMG, Trophy Room: "Level 9 Bastion Facility \u00b7 Prerequisite: None \u00b7 Space: Roomy \u00b7
  //   Hirelings: 1 \u00b7 Order: Research". "Mementos, such as weapons from old battles, the mounted
  //   heads of slain creatures, trinkets plucked from dungeons and ruins, and trophies passed down
  //   from ancestors."
  //   Research: Lore — the same 7 days and three true things as the Library, and note WHY: "The topic
  //     need not be directly related to items on display in the room, as the trophies provide clues to
  //     research a wide variety of other subjects."
  //   Research: Trinket Trophy — "roll any die. If the number rolled is odd, the hireling finds nothing
  //     useful. If the number rolled is even, the hireling finds a magic item. Roll on the
  //     Implements—Common table in chapter 7 to determine what it is."
  // DMG, Greenhouse: "Level 9 Bastion Facility \u00b7 Prerequisite: None \u00b7 Space: Roomy \u00b7
  //   Hirelings: 1 \u00b7 Order: Harvest". "An enclosure where rare plants and fungi are nurtured in a
  //   controlled climate."
  //   Harvest: Healing Herbs — "a Potion of Healing (greater) made from healing herbs. The work takes
  //     7 days and costs no money."
  //   Harvest: Poison — "one application of a poison... Assassin's Blood, Malice, Pale Tincture, or
  //     Truth Serum. See 'Poison' in chapter 3 for each poison's effect... The work takes 7 days and
  //     costs no money."
  //
  //   I do NOT need to know what Assassin's Blood does — I don't know what a Flametongue
  //   does either. It records what you made and points at the book. The poison NAMES are printed here
  //   in the Bastions chapter; the effects are chapter 3's and the player's to look up.
  //
  //   HARVEST: POISON IS NOT OFFERED. AL does not have poisons: "You may purchase mundane equipment
  //   and spell components from your character's campaign-available sources (IN THIS CASE, EXCLUDING
  //   THE DMG)" (ALPG), and its changelog is explicit — "Excluded DMG purchases of poisons and trade
  //   goods." The letter of that is a PURCHASE rule and this is a HARVEST, so a permissive reading
  //   would let it through the gap. The ruling is the least permissive one: if AL excludes poisons,
  //   there are no poisons. A campaign that took them out of the shops did not mean for them to grow
  //   in the greenhouse instead. The herbs stand alone, and no code exists for the rest.
  // DMG, Laboratory: "Level 9 Bastion Facility \u00b7 Prerequisite: None \u00b7 Space: Roomy \u00b7
  //   Hirelings: 1 \u00b7 Order: Craft". "Storage space for alchemical supplies and workspaces for
  //   crafting various concoctions."
  //   Craft: Alchemist's Supplies — "The facility's hireling crafts anything that can be made with
  //     Alchemist's Supplies using the rules in the Player's Handbook and chapter 7 of this book."
  //   Craft: Poison — NOT OFFERED. AL excludes DMG poisons (see the Greenhouse). Half the chapter's
  //     Craft options for this room are simply not in this campaign, and no code exists for them.
  //
  //   The remaining option names no product, because the PH's Alchemist's Supplies can make many —
  //   and the PH is not on disk. That is fine, and it is what this app does with everything: the
  //   player says what their hireling made and the Exchange records it, with the DM able to check it.
  //   AL runs on the same contract: "Use Downtime Days to take part in activities requiring time to
  //   complete (PH's Crafting Equipment...)" — the rules are the PH's; the ledger is mine.
  // DMG, Archive: "Level 13 Bastion Facility \u00b7 Prerequisite: None \u00b7 Space: Roomy \u00b7
  //   Hirelings: 1 \u00b7 Order: Research". "A repository of valuable books, maps, and scrolls. It is
  //   usually attached to a Library behind a locked or secret door."
  //   Research: Helpful Lore — "The hireling gains knowledge as if they had cast the Legend Lore spell."
  // DMG, Pub: "Level 13 Bastion Facility \u00b7 Prerequisite: None \u00b7 Space: Roomy \u00b7
  //   Hirelings: 1 \u00b7 Order: Research". "The facility's hireling, who serves as the bartender,
  //   maintains a network of spies scattered throughout nearby communities."
  //   Research: Information Gathering — spies "aware of all important events happening within 10 miles
  //   of your Bastion over the next 7 days", and can locate a familiar creature within 50 miles.
  // DMG, Sanctuary: "Level 5 Bastion Facility \u00b7 Prerequisite: Ability to use a Holy Symbol or
  //   Druidic Focus as a Spellcasting Focus \u00b7 Space: Roomy \u00b7 Hirelings: 1 \u00b7 Order: Craft".
  //   "Icons of your religion are displayed in this facility, which includes a quiet place for worship."
  //   The first room I've ever had with a PREREQUISITE — and the first of a convent.
  //   Its Charm (Healing Word once per 7 days) is a Supernatural Gift and belongs to the gift system
  //   under AL's carry limits, not here; it arrives when the Charm rooms do.
  // DMG, Barrack: "A Bastion can have more than one Barrack, each of which is furnished to serve as
  // sleeping quarters for up to twelve Bastion Defenders." Level 5, Roomy, 1 hireling, Recruit.
  // `repeatable` because the DMG's general rule is "each special facility can be chosen only once
  // UNLESS ITS DESCRIPTION SAYS OTHERWISE", and this description says otherwise in its first line.
  // The 12/25 capacity lives in BASTION_BARRACKS_CAP, never retyped.
  barrack: { id: "barrack", name: "Barrack", kind: "special", space: "roomy", prereq: null, hirelings: 1, minLevel: 5, orders: ["recruit", "maintain"], repeatable: true,
    note: "Sleeping quarters for the garrison \u2014 bunks, kit-chests and a stove. Its sergeant musters up to four Bastion Defenders each time you give the order, and they cost nothing but the room to sleep in. A Roomy Barrack quarters twelve; enlarged, twenty-five.",
    enlargeBenefit: "quarters for twenty-five instead of twelve \u2014 a second range of bunks the length of the new wall",
    tables: { capBySize: "BASTION_BARRACKS_CAP" },
    features: [{
      id: "barrack_quarters",
      when: "always",
      text: "Recruit: Bastion Defenders. Each time you issue the Recruit order, up to four Bastion Defenders are recruited and assigned quarters in this Barrack. The recruitment costs no money. You can't issue the order if the Barrack is fully occupied.",
      impl: "barracksCap",
      cite: "DMG, Barrack",
    }] },
  armory: { id: "armory", name: "Armory", kind: "special", space: "roomy", prereq: null, hirelings: 1, minLevel: 5, orders: ["trade", "maintain"], note: "A hall of mannequins, weapon-racks, shield-hooks, and ammunition chests, kept by a quartermaster. Issue Trade and the racks are stocked \u2014 armor, Shields, weapons, and ammunition \u2014 for 100 GP plus 100 for each Bastion Defender, halved if the Bastion has a Smithy. While it is stocked your defenders are harder to kill: any event that rolls to see whether you lose defenders rolls a d8 in place of each d6. The equipment is expended the moment such an event ends \u2014 whatever you have or lost \u2014 leaving the Armory bare until you Stock it again.",
    // DECLARED 31 Jul. The behaviour was ALREADY fully built in the engine — `stockArmory` (cost,
    // Smithy halving, one-per-cycle guard), the d6->d8 upgrade in `rollAttackOnes`, and the
    // single-use expenditure when the event ends. What was missing was the DEFINITION saying so, so
    // no gate could verify it and a new facility author had no worked example of a bespoke feature.
    // `impl` names the function that carries it, which makes the claim checkable against code
    // rather than being prose that drifts.
    features: [{
      id: "armory_stocked_d8",
      when: "stocked",
      text: "While the Armory is stocked, Bastion Defenders are harder to kill: roll 1d8 in place of each d6 when an event would cost you defenders. The equipment is expended when the event ends, however many you lost.",
      impl: "rollAttackOnes",
      cite: "DMG, Armory",
    }],
    tables: { kitByForm: "ARMORY_KIT_BY_FORM" } },
  archive: { id: "archive", name: "Archive", kind: "special", space: "roomy", prereq: null, hirelings: 1, minLevel: 13, orders: ["research", "maintain"],
    note: "A repository of valuable books, maps, and scrolls \u2014 usually attached to a Library behind a locked or secret door (DMG). The Research order sends the archivist hunting helpful lore for 7 days: they gain knowledge as if they had cast Legend Lore (an SRD spell \u2014 the pointer, not the text), and share it the next time you speak. The Reference Book is chosen ONCE, one of five subjects; while you and the book are in your Bastion, the DM grants the book's study benefit at the table. The DMG's own five titles are not SRD, so each house shelves the Exchange's own edition \u2014 a cavern's arcana book and a ship's are not the same book.",
    shelvesBooks: true,
    // Same doubling, half the base: the Archive is the smaller, locked room behind the Library.
    // Absolute counts live in `bookShelfCap` and nowhere else.
    enlargeBenefit: "twice the shelf room \u2014 a second locked press for the rarer volumes",
    // §7: the facility owns its dice. These POINT at the tables rather than inlining them — the
    // tables are large and shared with the title composer, so a copy here would be the second
    // source of truth §3 warns against. The pointer is what makes them checkable.
    tables: { subjects: "ARCHIVE_BOOK_SUBJECTS", loreByRegion: "ARCHIVE_LORE_BY_REGION", loreGlobal: "ARCHIVE_LORE_GLOBAL" } },
  scriptorium: { id: "scriptorium", name: "Scriptorium", kind: "special", space: "roomy", prereq: null, hirelings: 1, minLevel: 9, orders: ["craft", "maintain"], note: "A room of desks and writing supplies. Its scribe will copy a nonmagical book (you supply the blank book), scribe a spell scroll of 3rd level or lower from their own class list, or run off up to fifty broadsheets or pamphlets \u2014 and carry them anywhere within fifty miles. You choose the scribe: a Novice Mage scribes Wizard scrolls, an Acolyte scribes Cleric scrolls.", scribeClasses: [{ id: "mage", label: "Novice Mage", cls: "Wizard", role: "Novice Mage" }, { id: "acolyte", label: "Acolyte", cls: "Cleric", role: "Acolyte" }], outputs: { craft: [{ id: "book_replica", label: "A book replica \u2014 copy of a nonmagical book (you supply a blank book; 7 days)", catalogId: "g_book", needsBlankBook: true }, { id: "spell_scroll", label: "A spell scroll \u2014 your scribe's class, 3rd level or lower (a DM verifies)", scroll: true, maxLevel: 3 }, { id: "paperwork", label: "Paperwork \u2014 up to 50 broadsheets or pamphlets (1 GP each, 7 days; delivered within 50 miles)", paperwork: true, perCopy: 1 }] } },
  // ⚠ THE STABLE — a DMG facility we simply did not have (Frank, 2 Aug). Bastions.md, level 9:
  // *"Each Stable you add comes with one Riding Horse or Camel and two Ponies or Mules... the
  // facility's hireling looks after these creatures."* Roomy, one hireling, Trade order.
  //
  // Added because Frank asked where the livestock for a vampire's arrangement would live, and the
  // honest answer turned out to be **a room the book already has and the registry did not.**
  //
  // And it is OUTDOOR, which lights up the ten peoples whose `hire: "outdoor"` had nowhere to happen
  // — treant, centaur, ogre, troll, minotaur and the rest have somewhere to work as of now.
  stable: { id: "stable", name: "Stable", kind: "special", space: "roomy", prereq: null, hirelings: 1, minLevel: 9, orders: ["trade", "maintain"], note: "Three Large animals, or six Medium. The hireling looks after them." },
  smithy: { id: "smithy", name: "Smithy", kind: "special", space: "roomy", prereq: null, hirelings: 2, minLevel: 5, orders: ["craft", "maintain"], note: "A forge, an anvil, and the tools of the trade. Its smiths will make anything smith's tools can make \u2014 a blade, a harness of armour, a length of chain \u2014 and, once you have the standing for it, forge an Armament from the magic tables.", tool: "g_tool_smith", outputs: { craft: [{ id: "smith_mundane", label: "Smith's work \u2014 anything smith's tools can make (a DM verifies against the tool's list)", tool: "g_tool_smith" }, { id: "armament_common", label: "A Common magic item \u2014 Armaments tables \u2726 (level 9+; you name it, a DM verifies)", magic: "armaments", rarity: "common", minLevel: 9 }, { id: "armament_uncommon", label: "An Uncommon magic item \u2014 Armaments tables \u2726 (level 9+; you name it, a DM verifies)", magic: "armaments", rarity: "uncommon", minLevel: 9 }] } },
  workshop: { id: "workshop", name: "Workshop", kind: "special", space: "roomy", prereq: null, hirelings: 3, minLevel: 5, orders: ["craft", "maintain"], note: "A creative space fitted with six kinds of artisan's tools of your choosing. Its three hirelings craft anything those tools can make \u2014 and, once you have the standing for it, an Implement from the magic tables. You pick the six tools when you build it.", toolChoice: { count: 6, from: ["g_tool_carpenter", "g_tool_cobbler", "g_tool_glassblow", "g_tool_jeweler", "g_tool_leather", "g_tool_mason", "g_tool_painter", "g_tool_potter", "g_tool_tinker", "g_tool_weaver", "g_tool_woodcarver"] }, outputs: { craft: [{ id: "gear_chosen", label: "Adventuring gear \u2014 anything the workshop's chosen tools can make (a DM verifies)", toolChoice: true }, { id: "implement_common", label: "A Common magic item \u2014 Implements tables \u2726 (level 9+; you name it, a DM verifies)", magic: "implements", rarity: "common", minLevel: 9 }, { id: "implement_uncommon", label: "An Uncommon magic item \u2014 Implements tables \u2726 (level 9+; you name it, a DM verifies)", magic: "implements", rarity: "uncommon", minLevel: 9 }] } },
  library: { id: "library", name: "Library", kind: "special", space: "roomy", prereq: null, hirelings: 1, minLevel: 5, orders: ["research", "maintain"], note: "A collection of books with desks and reading chairs. Its librarian will research a topic \u2014 a legend, an event or place, a person, a kind of creature, or a famous object \u2014 and return with up to three accurate things you did not know. It is also a place to shelve the books your characters carry.", shelvesBooks: true,
    // The shelf is the room's mechanical benefit and the reason to enlarge it. The PROSE deliberately
    // states the DOUBLING and never the absolute counts: `bookShelfCap` owns those numbers, and a
    // second copy of them here would be a second source of truth waiting to drift (B-44).
    enlargeBenefit: "twice the shelf room \u2014 the stacks run the full length of the new wall",
    // The corpus lives in `library_subjects.ts`, not here, and is re-exported through the composer
    // rather than the definition — so the honest pointer is to the tables this MODULE owns. The
    // checker caught the first attempt pointing at LIBRARY_SUBJECTS, which does not resolve from
    // `data/bastion`; a pointer that reads as coverage while covering nothing is worse than none.
    tables: { titleFrames: "LIBRARY_TITLE_FRAMES", connectives: "LIBRARY_CONNECTIVES" } },
  observatory: { id: "observatory", name: "Observatory", kind: "special", space: "roomy", prereq: "spell_focus", hirelings: 1, minLevel: 13, orders: ["empower", "maintain"],
    note: "Situated atop the keep, a telescope aimed at the night sky. A Long Rest up here grants the Observatory Charm; the Empower order sends someone \u2014 you or the hireling \u2014 to explore the eldritch mysteries of the stars for 7 consecutive nights, and on an odd die an unknown power bestows a Charm you can keep or gift (my Q15 ruling: it is minted as a gift-only item with a lifetime).",
    charm: { name: "Observatory Charm", desc: "One casting of Contact Other Plane, no spell slot spent. Lasts 7 days or until you use it \u2014 and you can't gain this Charm again while you still have it (DMG, Observatory).", grant: "You spent a Long Rest at the eyepiece, and the far corners of Wildspace looked back: for a week you can put one question to the other side without paying a slot for the asking." } },
  arcane_study: { id: "arcane_study", name: "Arcane Study", kind: "special", space: "roomy", prereq: "arcane_focus", hirelings: 1, minLevel: 5, orders: ["craft", "maintain"], note: "A quiet room of desks and bookshelves. Its scholar will make you an Arcane Focus for a week of their time, bind you a blank book, and \u2014 once you have the standing for it \u2014 craft a magic item from the Arcana lists.", charm: { name: "Arcane Study Charm", desc: "One casting of Identify, no spell slot spent and no material component. Yours for seven days, or until you spend it.", grant: "You spent a long rest among your own books and instruments, and the room gave something back: you can name what one thing truly is this week, without paying for the knowing." }, noTool: "DMG names no tool for this room \u2014 its Craft options are \u2018Arcane Focus\u2019 and \u2018Book\u2019, neither tool-gated (Bastions.md:366)", outputs: { craft: [{ id: "focus_orb", label: "An Arcane Focus \u2014 orb", catalogId: "g_orb" }, { id: "focus_rod", label: "An Arcane Focus \u2014 rod", catalogId: "g_rod" }, { id: "focus_wand", label: "An Arcane Focus \u2014 wand", catalogId: "g_wand" }, { id: "focus_crystal", label: "An Arcane Focus \u2014 crystal", catalogId: "g_crystal" }, { id: "focus_staff", label: "An Arcane Focus \u2014 staff", catalogId: "g_staffalsoaquarterstaff" }, { id: "blankbook", label: "A blank book (10 GP)", catalogId: "g_book", cost: 10 }, { id: "arcana_common", label: "A Common magic item \u2014 Arcana tables \u2726 (level 9+; you name it, a DM verifies)", magic: "arcana", rarity: "common", minLevel: 9 }, { id: "arcana_uncommon", label: "An Uncommon magic item \u2014 Arcana tables \u2726 (level 9+; you name it, a DM verifies)", magic: "arcana", rarity: "uncommon", minLevel: 9 }] } },
  // DMG, Training Area: "Level 9 Bastion Facility \u00b7 Prerequisite: None \u00b7 Space: Vast \u00b7
  //   Hirelings: 4 \u00b7 Order: Empower". "A Bastion can have more than one Training Area." The first
  //   Vast-printed facility I've ever had — it arrives Vast and free, like every special.
};

// ---- PREREQUISITES -----------------------------------------------------------------------------
// DMG, Special Facilities > Requirements: "A special facility might also have a prerequisite the
// character must meet to gain that facility. For example, only a character who can use an Arcane
// Focus or a tool as a Spellcasting Focus can have an Arcane Study."
//
// Nine of the chapter's 29 rooms carry one, and they reduce to five distinct requirements. Note what
// the book gates on: FEATURES, not classes. "Expertise in a skill." "Fighting Style feature or
// Unarmored Defense feature." "Ability to use an Arcane Focus OR TOOL as a Spellcasting Focus."
//
// WHY THIS ISN'T A CLASS TABLE, and never can be:
//   An Eldritch Knight is a Fighter who qualifies for the Arcane Study. An Arcane Trickster is a
//   Rogue who does. Expertise reaches a Rogue at 1 and a Bard at 3. A Ranger has a Fighting Style.
//   Class alone gets all four of those wrong, and this app stores `cls` as a bare string with no
//   subclass and no feature list — because it is not a character sheet. D&D Beyond is.
//   (The 2024 PH is also not on disk, so the class-to-focus mapping is a book I can't read here. Even
//   with it, the answer would still live in the subclass.)
//
// So the character DECLARES what they can do and the DM spot-checks it — the same contract this app
// already runs on for levels, items and gifts. The app's job is to state the requirement in the
// book's own words, record the claim, and put it where a DM can see it. Whitelist: an undeclared
// character qualifies for nothing.

// ============================================================================
// ARCHIVE — the Reference Book. [TABLE] House content, the Exchange's own.
// DMG names five books (Bigby's Handy Arcana Codex, The Chronepsis Chronicles,
// Investigations of the Inquisitive, Material Musings on the Nature of the
// World, and the religious fifth) — proper nouns, not SRD. The PLATFORM stores
// the SUBJECT; the title the goat sees is ours, and it is keyed by the house,
// because a cavern's archive and a ship's do not hold the same books.
// 8 forms x 5 subjects. The DM's table benefit rides the subject, not the title.
// ============================================================================
export const ARCHIVE_BOOK_SUBJECTS = ["arcana", "history", "invest", "nature", "religion"] as const;

export const ARCHIVE_BOOK_SUBJECT_LABEL: Record<string, string> = {
  arcana: "Arcana", history: "History", invest: "Investigation", nature: "Nature", religion: "Religion",
};

// ============================================================================
// FRANK'S LORE TABLES (25 Jul): "make the subject a d100 roll per region based
// on the canonical lore and famous people of each region... it also can be
// covering other subjects that are global to fill in the d100 table."
//
// Doctrine is his own, from BASTION_REGIONS' header: CANONICAL PLACE REFERENCES,
// NOT BOOK TEXT. These are names and pointers a player can carry to the table —
// "I studied the fall of Zhentil Keep" — never rules or passages. Each topic is
// tagged with the SKILL(S) it feeds, because the DMG hangs Advantage on the
// skill: the Reference Book keeps its five subjects, and a rolled topic tells
// the goat which of them to invoke. Region entries come FIRST in the pool;
// the global table fills the remainder of the d100, exactly as he specified.
// Q20 (Frank, 25 Jul): canon SOURCED against the Forgotten Realms Wiki — the
// public wiki is the reference of record for these names; the oddest spelling
// this tranche (Wychlaran) was verified there directly (its page cites
// Unapproachable East), the rest are unambiguous canon names, and per-region
// deepening gets its own wiki pass as each tranche lands. The global pool is a
// TRUE d100: deep regions displace its tail by design — the region's own canon
// outranks trivia. A wrong name remains his to strike; data, not law. [TABLE]
// ============================================================================
export type LoreTopic = { t: string; k: readonly string[] };

export const ARCHIVE_LORE_GLOBAL: readonly LoreTopic[] = [
  { t: "Elminster of Shadowdale", k: ["arcana", "history"] },
  { t: "the Spellplague and the death of Mystra", k: ["arcana", "history"] },
  { t: "the Sundering that remade the Realms", k: ["history", "religion"] },
  { t: "the Time of Troubles, when gods walked", k: ["religion", "history"] },
  { t: "Karsus's Folly and the fall of Netheril", k: ["arcana", "history"] },
  { t: "the Weeping War and the ruin of Myth Drannor", k: ["history"] },
  { t: "the Harpers and their hidden work", k: ["invest", "history"] },
  { t: "the Zhentarim and Manshoon's many deaths", k: ["invest", "history"] },
  { t: "the Red Wizards of Thay and Szass Tam", k: ["arcana", "invest"] },
  { t: "the Lords' Alliance and its quiet treaties", k: ["history", "invest"] },
  { t: "the Emerald Enclave and the balance it keeps", k: ["nature"] },
  { t: "the Order of the Gauntlet's vigils", k: ["religion"] },
  { t: "the Cult of the Dragon and its risen masters", k: ["arcana", "invest"] },
  { t: "the Dead Three — Bane, Bhaal, and Myrkul", k: ["religion", "history"] },
  { t: "Ao the Overgod and the Tablets of Fate", k: ["religion"] },
  { t: "Candlekeep and the price of its doors", k: ["history", "arcana"] },
  { t: "the drow of Menzoberranzan and Lolth's web", k: ["history", "religion"] },
  { t: "Drizzt Do'Urden and the Companions of the Hall", k: ["history"] },
  { t: "Halaster Blackcloak and Undermountain", k: ["arcana", "invest"] },
  { t: "Volothamp Geddarm's guides, and their errors", k: ["invest", "history"] },
  { t: "the Seven Sisters, Chosen of Mystra", k: ["arcana", "history"] },
  { t: "the Dracorage and the King-Killer Star", k: ["arcana", "nature"] },
  { t: "Anauroch, the desert that ate an empire", k: ["nature", "history"] },
  { t: "Evermeet, the elves' green refuge", k: ["history", "nature"] },
  { t: "the Sea of Fallen Stars and its shrinking shores", k: ["nature", "history"] },
  { t: "the High Forest and what sleeps beneath it", k: ["nature", "arcana"] },
  { t: "the Uthgardt tribes and their totem mounds", k: ["nature", "religion"] },
  { t: "the giants' Ordning and its breaking", k: ["history", "religion"] },
  { t: "the illithid empires that fell before memory", k: ["arcana", "history"] },
  { t: "the githyanki and the lich-queen Vlaakith", k: ["arcana", "history"] },
  { t: "the Blood War between devils and demons", k: ["religion", "history"] },
  { t: "the Nine Hells and the reading of infernal contracts", k: ["invest", "religion"] },
  { t: "the Abyss and the naming of demon princes", k: ["religion", "arcana"] },
  { t: "the Feywild's bargains and their fine print", k: ["arcana", "invest"] },
  { t: "the Shadowfell and what grief becomes there", k: ["arcana", "religion"] },
  { t: "the Astral Sea and the color pools between worlds", k: ["arcana"] },
  { t: "the Elemental Chaos and the princes of ruin", k: ["arcana", "nature"] },
  { t: "the Wall of the Faithless and the judgment of Kelemvor", k: ["religion"] },
  { t: "the church of Mystra and the Weave's keeping", k: ["religion", "arcana"] },
  { t: "Bahamut and Tiamat, the dragon gods at war", k: ["religion", "history"] },
  { t: "the mercantile priesthood of Waukeen", k: ["religion", "invest"] },
  { t: "Umberlee's tithes and the sailors who pay them", k: ["religion", "nature"] },
  { t: "the old empires of Mulhorand and Unther", k: ["history", "religion"] },
  { t: "dwarven Delzoun and the Forge of Spells", k: ["history", "arcana"] },
  { t: "the fall of Illefarn and the elven retreats", k: ["history"] },
  { t: "dragonsight, dragon hoards, and why they gather", k: ["arcana", "nature"] },
  { t: "lycanthropy — its strains, moons, and cures", k: ["nature", "arcana"] },
  { t: "the vampire's ledger of weaknesses", k: ["arcana", "religion"] },
  { t: "lichdom and the hiding of phylacteries", k: ["arcana", "invest"] },
  { t: "the mimic, the trapper, and other patient furniture", k: ["invest", "nature"] },
  { t: "portal networks and the keys that wake them", k: ["arcana", "invest"] },
  { t: "the Weave, the Shadow Weave, and dead magic", k: ["arcana"] },
  { t: "true names and the leverage they grant", k: ["arcana", "invest"] },
  { t: "the founding and breaking of adventuring charters", k: ["history", "invest"] },
  { t: "plague-lore of the Realms and its quarantines", k: ["nature", "invest"] },
  { t: "the etiquette of parley with hags", k: ["invest", "arcana"] },
  // ---- the far reach of Toril (Q20: "non-repeating Toril trivia... a more global reach") ----
  { t: "Kara-Tur and the empire of Shou Lung", k: ["history"] },
  { t: "Zakhara, the Land of Fate", k: ["history", "religion"] },
  { t: "Maztica, the True World across the western sea", k: ["history", "nature"] },
  { t: "the Great Glacier and what it buried", k: ["nature", "history"] },
  { t: "the Tuigan Horde and its ride west", k: ["history"] },
  { t: "Rashemen and its masked Wychlaran", k: ["arcana", "history"] },
  { t: "Halruaa, its skyships and jealous wards", k: ["arcana", "history"] },
  { t: "Thay's plateau and its enclaves abroad", k: ["invest", "history"] },
  { t: "old Calimshan and its genie lords", k: ["history", "arcana"] },
  { t: "Chessenta's rival cities and hired armies", k: ["history", "invest"] },
  { t: "Amn's merchant houses and their reach", k: ["invest", "history"] },
  { t: "Tethyr's interregnum and restoration", k: ["history"] },
  { t: "the Moonshae Isles and the Earthmother's balance", k: ["nature", "religion"] },
  { t: "Luiren, the halfling homeland", k: ["history", "nature"] },
  { t: "the nomad peoples of the Shaar", k: ["nature", "history"] },
  { t: "Evereska, the elves' hidden vale", k: ["history", "arcana"] },
  { t: "Cormanthyr's fallen crown", k: ["history"] },
  { t: "Sembia, where coin outranks crowns", k: ["invest", "history"] },
  { t: "Westgate and the Night Masks", k: ["invest"] },
  { t: "Impiltur and its paladin-kings", k: ["history", "religion"] },
  { t: "Damara, Vaasa, and the Witch-King's shadow", k: ["history", "invest"] },
  { t: "Abeir, Toril's sundered twin", k: ["arcana", "history"] },
  { t: "Imaskar and the chains it forged across the planes", k: ["history", "arcana"] },
  { t: "the sarrukh and the creator races", k: ["history", "arcana"] },
  { t: "Thultanthar, the returned enclave of Shade", k: ["arcana", "history"] },
  { t: "the phaerimm beneath the sands", k: ["arcana", "invest"] },
  { t: "aboleth memory, older than the gods", k: ["arcana", "religion"] },
  { t: "Oghma's binders and their libraries", k: ["religion", "invest"] },
  { t: "Gond's wonders and the smokepowder question", k: ["religion", "invest"] },
  { t: "the Fugue Plane and the City of Judgment", k: ["religion"] },
  { t: "Sel\u00fbne and Shar, the first quarrel", k: ["religion", "history"] },
  { t: "the Cyrinishad, the book that lies true", k: ["religion", "invest"] },
  { t: "Tymora and Beshaba, luck twinned and parted", k: ["religion"] },
  { t: "Ser\u00f4s, the realm beneath the Fallen Stars", k: ["nature", "history"] },
  { t: "the sahuagin of the Sea of Swords", k: ["nature", "invest"] },
  { t: "the serpent kingdoms of the yuan-ti", k: ["history", "religion"] },
  { t: "Ostoria, the giants' lost kingdom", k: ["history"] },
  { t: "Tymanther and its dragonborn", k: ["history"] },
  { t: "Akan\u00fbl and its genasi", k: ["history", "arcana"] },
  { t: "the Simbul of Aglarond", k: ["arcana", "history"] },
  { t: "Aglarond and the Yuirwood's old ways", k: ["nature", "arcana"] },
  { t: "the Harpells of Longsaddle", k: ["arcana", "invest"] },
  { t: "the Twisted Rune and its hidden liches", k: ["invest", "arcana"] },
  { t: "mythals and the cities they shelter", k: ["arcana", "history"] },
];

export const ARCHIVE_LORE_BY_REGION: Record<string, readonly LoreTopic[]> = {
  moonsea: [
    { t: "the fall and refounding of Phlan", k: ["history"] },
    { t: "the Pool of Radiance and what it corrupted", k: ["arcana", "history"] },
    { t: "the ruin of Zhentil Keep", k: ["history", "invest"] },
    { t: "the Red Plumes of Hillsfar and its old hatreds", k: ["history", "invest"] },
    { t: "Mulmaster, the City of Danger, and its Blades", k: ["invest", "history"] },
    { t: "the ogres and beast-tribes of Thar", k: ["nature", "history"] },
    { t: "Bane's long shadow over the Moonsea", k: ["religion", "history"] },
    { t: "the pirate isles of the inner sea", k: ["invest", "nature"] },
    { t: "Elventree and the druids' quiet accord", k: ["nature", "religion"] },
    { t: "the dragon cult's Mulmaster cells in the tyranny years", k: ["invest", "arcana"] },
    { t: "Tyranthraxus, the Flamed One, who wore a bronze dragon", k: ["arcana", "history"] },
    { t: "Valjevo Castle and the maze around it", k: ["history", "invest"] },
    { t: "Denlor's Tower and the wards that outlived him", k: ["arcana", "invest"] },
    { t: "the Cadorna family and the price of ambition", k: ["history", "invest"] },
    { t: "Sokol Keep on Thorn Island and its lighthouse dead", k: ["history", "religion"] },
    { t: "the Stojanow River running foul through Phlan", k: ["nature", "invest"] },
    { t: "Kuto's Well and the tunnels beneath it", k: ["invest"] },
    { t: "Podol Plaza and the auction of stolen Phlan", k: ["history", "invest"] },
    { t: "the Lyceum of the Black Lord in Mulmaster", k: ["religion", "invest"] },
    { t: "the Hawks of Mulmaster and their sky-watch", k: ["invest"] },
    { t: "Selfaril and Rassendyll, the twin lords of Mulmaster", k: ["history", "invest"] },
    { t: "the Zhentilar remnants and where they drill", k: ["invest", "history"] },
    { t: "the Citadel of the Raven and its broken pact", k: ["history"] },
    { t: "Teshwave and the Tesh running black from the Keep's fall", k: ["nature", "history"] },
    { t: "Yulash, the town two armies pulled apart", k: ["history"] },
    { t: "the Standing Stone road east from the Dales", k: ["history"] },
    { t: "Hulburg and Thentia, the free towns that bent to no one", k: ["history"] },
    { t: "Melvaunt's forges and its slave-ledgers", k: ["invest", "history"] },
    { t: "the Grey Land of Thar and its ogre kings of old", k: ["history", "nature"] },
    { t: "Vorbyx, first ogre-king of Thar", k: ["history"] },
    { t: "the moor-hags of the Flooded Forest", k: ["nature", "arcana"] },
    { t: "the Flooded Forest's black waters and drowned villages", k: ["nature"] },
    { t: "the dracolich Throstulgrael beneath the Flooded Forest", k: ["arcana", "invest"] },
    { t: "Point Iron and the Bell in the Deep", k: ["history", "religion"] },
    { t: "the Moonsea's winter freeze and the ice-roads between ports", k: ["nature"] },
    { t: "the church of Tymora's return to Phlan", k: ["religion"] },
    { t: "Kelemvor's yard at Valhingen and the graveyard war", k: ["religion", "history"] },
    { t: "the kobold warrens of the Dragonspine Mountains", k: ["nature", "invest"] },
    { t: "the Dragonspine peaks and the wyrms that named them", k: ["nature", "history"] },
    { t: "the Twisted Ones of Yulash and what made them", k: ["arcana", "invest"] },
    { t: "the Knights of the Black Fist and Phlan's iron law", k: ["history", "invest"] },
    { t: "the Lord Sage of Phlan and his archives", k: ["history", "invest"] },
    { t: "the Welcomers of Phlan, thieves with one ear", k: ["invest"] },
    { t: "the Cracked Crown and the talk that passes through it", k: ["invest"] },
    { t: "Ilmater's quiet houses along the docks", k: ["religion"] },
    { t: "the trade in knucklehead scrimshaw come down from the Dale", k: ["invest", "nature"] },
    { t: "the Moonsea League and why it always fails", k: ["history"] },
    { t: "the beholder rumored under Mulmaster's Undercity", k: ["invest", "arcana"] },
    { t: "the Cult of the Howling Hatred's cell at the docks", k: ["religion", "invest"] },
    { t: "the Iron Throne's brief grip on Melvaunt steel", k: ["invest", "history"] },
    { t: "the ghost-lights over the Quivering Forest", k: ["arcana", "nature"] },
    { t: "the Quivering Forest and the fey that suffer no axes", k: ["nature", "arcana"] },
    { t: "Jeny Greenteeth of the Quivering Forest", k: ["arcana", "invest"] },
    { t: "Grimshackle Jail and who buys its silence", k: ["invest"] },
    { t: "Mother Sibyl of the Stojanow crossing", k: ["religion", "invest"] },
    { t: "the salvage guilds that dive the drowned quarter", k: ["invest", "nature"] },
    { t: "Bane's Black Hand carved on the old gates", k: ["religion", "history"] },
  ],
  underdark: [
    { t: "Menzoberranzan's houses and their knives", k: ["history", "invest"] },
    { t: "the Silence of Lolth and what filled it", k: ["religion", "history"] },
    { t: "Gracklstugh, the City of Blades", k: ["history", "invest"] },
    { t: "Blingdenstone and the deep gnomes' return", k: ["history", "nature"] },
    { t: "the demon lords' incursion and Demogorgon at the Darklake", k: ["arcana", "religion"] },
    { t: "Araumycos, the fungus older than kingdoms", k: ["nature", "arcana"] },
    { t: "Zuggtmoy's garden and the spore-taken", k: ["nature", "religion"] },
    { t: "faerzress and what it does to spellwork", k: ["arcana", "nature"] },
    { t: "the duergar and the grudges of Delzoun", k: ["history"] },
    { t: "navigating the Darklake without a light", k: ["nature", "invest"] },
    { t: "House Baenre and the Matron Mother's long rule", k: ["history", "invest"] },
    { t: "Bregan D'aerthe and Jarlaxle's prices", k: ["invest"] },
    { t: "the Academy of Tier Breche and its three schools", k: ["history", "arcana"] },
    { t: "Sorcere, Melee-Magthere, and Arach-Tinilith", k: ["arcana", "religion"] },
    { t: "Narbondel, the clock of living rock", k: ["arcana", "history"] },
    { t: "Ched Nasad, the city that fell in webs of stone", k: ["history"] },
    { t: "Sshamath, the drow city ruled by wizards", k: ["arcana", "history"] },
    { t: "Mantol-Derith, the trading post of four peoples", k: ["invest"] },
    { t: "the Wormwrithings and the purple worms that bore them", k: ["nature"] },
    { t: "the Labyrinth and the minotaurs Baphomet left there", k: ["invest", "religion"] },
    { t: "the svirfneblin ruby mines and what rubies wake", k: ["nature", "invest"] },
    { t: "Deepking Horgar and the Stone Guard of Gracklstugh", k: ["history", "invest"] },
    { t: "the Keepers of the Flame and their red dragon", k: ["invest", "arcana"] },
    { t: "Themberchaud, the Wyrmsmith of Gracklstugh", k: ["nature", "invest"] },
    { t: "Neverlight Grove and Sovereign Basidia", k: ["nature", "religion"] },
    { t: "the myconid melds and the dreams they share", k: ["nature", "arcana"] },
    { t: "Sloobludop and the kuo-toa's made gods", k: ["religion", "invest"] },
    { t: "Gauntlgrym's forge and the primordial bound in it", k: ["history", "arcana"] },
    { t: "hook horror hunting calls and how to read them", k: ["nature"] },
    { t: "the derro and the madness they call clarity", k: ["invest", "religion"] },
    { t: "the aboleth of the Glass Pool", k: ["arcana", "invest"] },
    { t: "the drow poison trade and the sleep-venom harvest", k: ["invest", "nature"] },
    { t: "rothe herds and the meat-roads between cities", k: ["nature", "invest"] },
    { t: "the Underchasm the Spellplague tore open", k: ["history", "arcana"] },
    { t: "the Twisted Caverns' gravity that forgets its manners", k: ["arcana", "nature"] },
    { t: "the deep bridges of Delzoun and their toll-runes", k: ["history", "arcana"] },
    { t: "Vizeran DeVir and the vengeance he brewed", k: ["arcana", "invest"] },
    { t: "the Maze Engine and where it fell", k: ["arcana", "invest"] },
    { t: "the Fetid Huddle and the goblin markets of the middledark", k: ["invest"] },
    { t: "the songs the stalactites keep in Cairngorm Cavern", k: ["arcana", "nature"] },
    { t: "the Society of Brilliance and its unlikely scholars", k: ["invest", "arcana"] },
    { t: "the elder brain pools and the colonies they anchor", k: ["arcana", "invest"] },
    { t: "slave-roads to Menzoberranzan and who walks them", k: ["invest", "history"] },
    { t: "the Darklake's blind fish and the lures that take them", k: ["nature"] },
    { t: "stirge swarms in the fungal middens", k: ["nature"] },
    { t: "cave-in lore: reading the rock before it speaks", k: ["nature", "invest"] },
    { t: "the piercer colonies of the Whorlstone Tunnels", k: ["nature"] },
    { t: "the two-headed spiders of the Silken Paths", k: ["nature", "invest"] },
    { t: "Lolth's yochlol handmaidens and their errands", k: ["religion", "invest"] },
    { t: "the sacred spider-silk looms of Arach-Tinilith", k: ["religion", "arcana"] },
    { t: "the deep dwarves' memory-ale and what it preserves", k: ["history", "nature"] },
    { t: "the Stonespeakers of Gracklstugh and their psionics", k: ["arcana", "invest"] },
  ],
  barovia: [
    { t: "Strahd von Zarovich, first and last of his line", k: ["history", "invest"] },
    { t: "the Dark Powers and the Mists that answer them", k: ["arcana", "religion"] },
    { t: "Castle Ravenloft and its patient host", k: ["invest", "history"] },
    { t: "the Vistani and the roads they alone keep", k: ["invest", "nature"] },
    { t: "the Amber Temple and the vestiges sealed there", k: ["arcana", "religion"] },
    { t: "Argynvostholt and the Order of the Silver Dragon", k: ["history", "religion"] },
    { t: "Mother Night and Barovia's inverted devotions", k: ["religion"] },
    { t: "the Holy Symbol of Ravenkind and the Sunsword", k: ["religion", "arcana"] },
    { t: "the werewolves of the Svalich Woods", k: ["nature", "invest"] },
    { t: "why the sun in Barovia gives no comfort", k: ["arcana", "nature"] },
    { t: "Tatyana, and every face she has worn since", k: ["history", "invest"] },
    { t: "Sergei von Zarovich and the wedding day of blood", k: ["history"] },
    { t: "King Barov and the conquest that named the valley", k: ["history"] },
    { t: "Ireena Kolyana of the burgomaster's house", k: ["invest", "history"] },
    { t: "the Burgomasters of the three villages and their burdens", k: ["history", "invest"] },
    { t: "Vallaki and the lie that all will be well", k: ["invest"] },
    { t: "Baron Vallakovich and his festivals of denial", k: ["invest", "history"] },
    { t: "Lady Wachter and the Devil's due in Vallaki", k: ["invest", "religion"] },
    { t: "Krezk and the Abbey of Saint Markovia", k: ["religion", "history"] },
    { t: "the Abbot and the mercy that curdled", k: ["religion", "invest"] },
    { t: "Saint Markovia's march on Castle Ravenloft", k: ["religion", "history"] },
    { t: "the Martikovs and the wings they keep secret", k: ["invest", "nature"] },
    { t: "the Wizard of Wines and the gems beneath the vines", k: ["invest", "nature"] },
    { t: "the Keepers of the Feather and their watch", k: ["invest"] },
    { t: "Davian Martikov's ledgers of lost harvests", k: ["invest", "nature"] },
    { t: "Yester Hill and the druids who serve the vampire", k: ["religion", "nature"] },
    { t: "Wintersplinter, the tree-thing raised on Yester Hill", k: ["nature", "arcana"] },
    { t: "Berez, the village Strahd drowned in a night", k: ["history"] },
    { t: "Baba Lysaga and the hut that walks the marsh", k: ["arcana", "invest"] },
    { t: "the Ruins of Berez and the treasures the marsh keeps", k: ["invest", "nature"] },
    { t: "Tsolenka Pass and the guardian that bars it", k: ["history", "arcana"] },
    { t: "Mount Ghakis and the amber road above the snowline", k: ["nature"] },
    { t: "the Roc of Mount Ghakis", k: ["nature"] },
    { t: "the Tome of Strahd and where it has been read", k: ["history", "invest"] },
    { t: "Khazan's tower on Lake Baratok", k: ["arcana", "invest"] },
    { t: "the Mad Mage of Mount Baratok", k: ["invest", "arcana"] },
    { t: "Rictavio the carnival master and who he really is", k: ["invest"] },
    { t: "Rudolph van Richten's long war on the night", k: ["invest", "history"] },
    { t: "Ezmerelda d'Avenir and her armored wagon", k: ["invest"] },
    { t: "the Blue Water Inn and the news that passes through it", k: ["invest"] },
    { t: "Blinsky and the toys that smile wrong", k: ["invest"] },
    { t: "the Bonegrinder windmill and the sisters who kept it", k: ["invest", "arcana"] },
    { t: "Morgantha's dream pastries and their price", k: ["arcana", "invest"] },
    { t: "the Old Bonegrinder's chimney smoke and what it means", k: ["invest"] },
    { t: "the Church of Saint Andral and the bones it guarded", k: ["religion", "invest"] },
    { t: "Father Lucian and the theft that opened the doors", k: ["religion", "invest"] },
    { t: "Doru in the undercroft, and Father Donavich's prayers", k: ["religion", "invest"] },
    { t: "Madam Eva and the reading of the cards", k: ["arcana", "invest"] },
    { t: "the Tarokka deck and the fates it deals", k: ["arcana"] },
    { t: "the Tser Pool encampment and Vistani hospitality", k: ["invest", "nature"] },
    { t: "the curse on those who harm the Vistani", k: ["arcana", "invest"] },
    { t: "the Mists' toll on those who try the borders", k: ["arcana", "nature"] },
    { t: "the Svalich Road and its gates of black iron", k: ["history", "invest"] },
    { t: "the heart of sorrow beating in the high tower", k: ["arcana", "invest"] },
    { t: "the crypts beneath Ravenloft and who lies named there", k: ["history", "invest"] },
    { t: "Escher and the court of pale favorites", k: ["invest"] },
    { t: "Cyrus Belview and the castle's strange service", k: ["invest"] },
    { t: "Beucephalus, the nightmare that carries the count", k: ["arcana", "nature"] },
    { t: "the animated armor on the chapel stair", k: ["arcana", "invest"] },
    { t: "Strahd's brides and the jealousies between them", k: ["invest", "history"] },
  ],
  swordcoast: [
    { t: "the shattering of the giants' Ordning", k: ["history", "religion"] },
    { t: "King Hekaton, Maelstrom, and the storm court", k: ["history", "invest"] },
    { t: "the Eye of the All-Father and giant augury", k: ["religion", "arcana"] },
    { t: "the Kraken Society's drowned intelligence", k: ["invest", "nature"] },
    { t: "the Trade Way and the towns that live by it", k: ["history", "invest"] },
    { t: "Triboar, Nightstone, and the raided north", k: ["history"] },
    { t: "cloud castles and where they anchor", k: ["arcana", "nature"] },
    { t: "the rune magic of the giants", k: ["arcana"] },
    { t: "Waterdhavian caravan law and its loopholes", k: ["invest"] },
    { t: "the harbor lords of Luskan and their ships", k: ["history", "invest"] },
    { t: "Annam All-Father and the sons who divided the world", k: ["religion", "history"] },
    { t: "Serissa, heir to the Maelstrom", k: ["history", "invest"] },
    { t: "the wyrmskull throne and the conch of teleportation", k: ["arcana", "history"] },
    { t: "Iymrith, the dragon in the desert's sandstorm", k: ["invest", "arcana"] },
    { t: "Grudd Haug and the hill giants' hunger", k: ["invest", "nature"] },
    { t: "Guh, who ate a chieftain's due", k: ["invest"] },
    { t: "Svardborg and the white walkers of the whale-road", k: ["history", "nature"] },
    { t: "Jarl Storvald and the hunt for the Ring of Winter", k: ["invest", "history"] },
    { t: "the Ring of Winter and the hands it has frozen", k: ["arcana", "history"] },
    { t: "Ironslag and the fire giants' war-forge", k: ["invest", "history"] },
    { t: "Duke Zalto and the Vonindod's scattered pieces", k: ["invest", "arcana"] },
    { t: "the Vonindod, the titan of iron the giants seek", k: ["arcana", "history"] },
    { t: "Lyn Armaal, the cloud countess's flying keep", k: ["invest", "arcana"] },
    { t: "Countess Sansuri and the dragon she keeps below", k: ["invest"] },
    { t: "Deadstone Cleft and the stone giants' dreaming", k: ["religion", "nature"] },
    { t: "Thane Kayalithica and the dream she carves", k: ["religion", "invest"] },
    { t: "Goldenfields, the granary of the North", k: ["nature", "history"] },
    { t: "the Uthgardt Elk tribe and the Grandfather Tree", k: ["religion", "nature"] },
    { t: "the Great Worm and its cavern shrine", k: ["religion", "nature"] },
    { t: "One Stone and the Thunderbeast mound", k: ["religion", "history"] },
    { t: "Flint Rock and the Tree Ghost pilgrimage", k: ["religion", "nature"] },
    { t: "Beorunna's Well and the tribes' first hero", k: ["history", "religion"] },
    { t: "Morgur's Mound and the thunderbeast bones", k: ["religion", "history"] },
    { t: "the Dessarin Road bandits and who pays them", k: ["invest"] },
    { t: "Womford and the barges of the Dessarin", k: ["invest", "nature"] },
    { t: "Bargewright Inn and the Zhentarim's quiet stake", k: ["invest"] },
    { t: "the Harpers' network along the Long Road", k: ["invest", "history"] },
    { t: "the ruins of Illusk beneath Luskan", k: ["history", "arcana"] },
    { t: "the Arcane Brotherhood's Hosttower of the Arcane", k: ["arcana", "invest"] },
    { t: "Ten Trail and the ore-roads to Mirabar", k: ["invest", "history"] },
    { t: "Mirabar's axe-council and the Marchion's trade war", k: ["history", "invest"] },
    { t: "Longsaddle's peace kept by wizardly whim", k: ["arcana", "invest"] },
    { t: "Amphail's horse fairs and the lords who buy quietly", k: ["invest", "nature"] },
    { t: "Rassalantar's watch-wells on the road to Waterdeep", k: ["history"] },
    { t: "Daggerford's ducal charter and its river tolls", k: ["history", "invest"] },
    { t: "the Lizard Marsh and the black dragon rumor", k: ["nature", "invest"] },
    { t: "the Way Inn, burned and rebuilt and burned", k: ["history"] },
    { t: "Dragonspear Castle and the door it was built over", k: ["history", "arcana"] },
    { t: "the High Moor's barrows and their sleepers", k: ["history", "arcana"] },
    { t: "Secomber where the Delimbiyr bends", k: ["history", "nature"] },
    { t: "Loudwater and the Grey Vale's uneasy peace", k: ["history", "invest"] },
    { t: "the fall of Nightstone's bell tower", k: ["history", "invest"] },
    { t: "Xolkin and the Zhentarim hand in Nightstone", k: ["invest"] },
    { t: "the frost giants' longships and where they beach", k: ["nature", "invest"] },
    { t: "Harshnag the Grim, the giant who walks with small folk", k: ["history", "invest"] },
    { t: "the Ordning's vacancy and every jarl's ambition", k: ["history", "invest"] },
    { t: "the storm giant court's undersea etiquette", k: ["invest", "religion"] },
  ],
  waterdeep: [
    { t: "the Open Lord and the Masked Lords of Waterdeep", k: ["history", "invest"] },
    { t: "the Xanathar and the eye below the city", k: ["invest"] },
    { t: "the Yawning Portal and the well it guards", k: ["history", "invest"] },
    { t: "Undermountain, Halaster's mad house", k: ["arcana", "invest"] },
    { t: "Dagult Neverember and the missing half-million dragons", k: ["invest", "history"] },
    { t: "the Walking Statues and who can wake them", k: ["arcana", "history"] },
    { t: "Skullport, the port beneath the port", k: ["invest", "history"] },
    { t: "the City of the Dead and its polite hauntings", k: ["religion", "invest"] },
    { t: "guild law, guild wars, and the Watch", k: ["invest", "history"] },
    { t: "the Blackstaff and the tower that answers", k: ["arcana", "history"] },
    { t: "Laeral Silverhand's return to the Palace", k: ["history", "arcana"] },
    { t: "Ahghairon's dragonward and the day it bent", k: ["arcana", "history"] },
    { t: "Ahghairon's tower, sealed and waiting", k: ["arcana", "invest"] },
    { t: "Mirt the Moneylender's second fortunes", k: ["invest", "history"] },
    { t: "Durnan, who came up from the well with gold and silence", k: ["history", "invest"] },
    { t: "Volo's tab at the Yawning Portal", k: ["invest"] },
    { t: "the Grand Game the masked nobles play", k: ["invest"] },
    { t: "the Cassalanters and the debt beneath their charity", k: ["invest", "religion"] },
    { t: "Asmodeus' quiet chapels in noble cellars", k: ["religion", "invest"] },
    { t: "the Gralhund villa and the night of the fireball", k: ["invest", "history"] },
    { t: "the Zhentarim's Doom Raiders and their new business", k: ["invest"] },
    { t: "Manshoon's clone in the Kolat Towers", k: ["arcana", "invest"] },
    { t: "the Kolat Towers and their extradimensional attic", k: ["arcana", "invest"] },
    { t: "Bregan D'aerthe's topside ventures", k: ["invest"] },
    { t: "Jarlaxle Baenre's Luskan flagship in the harbor", k: ["invest", "history"] },
    { t: "the Sea Maidens Faire and what it smuggles", k: ["invest"] },
    { t: "Mistshore, the drowned slum on the wrecks", k: ["invest", "nature"] },
    { t: "the Field of Triumph and its bloodless spectacles", k: ["history"] },
    { t: "the Plinth, tower of every faith", k: ["religion", "history"] },
    { t: "the Spires of the Morning at first light", k: ["religion"] },
    { t: "the House of Wonder and Mystra's rebuilt worship", k: ["religion", "arcana"] },
    { t: "the Font of Knowledge and Oghma's open stacks", k: ["religion", "invest"] },
    { t: "the guilds' apprentice-riots of the last Flagon Season", k: ["history", "invest"] },
    { t: "the Cellarers' and Plumbers' Guild and what they seal below", k: ["invest"] },
    { t: "the sewers' chalk-marks and the crews that read them", k: ["invest"] },
    { t: "Blue Alley and the fools it collects", k: ["invest", "arcana"] },
    { t: "the Melairkyn dwarves who mined the mountain first", k: ["history"] },
    { t: "Sargauth Enclave and the Netherese who fell to Skullport", k: ["history", "arcana"] },
    { t: "the skulls of Skullport and their arbitrary law", k: ["arcana", "invest"] },
    { t: "the Promenade of the Dark Maiden and Eilistraee's dancers", k: ["religion", "history"] },
    { t: "Halaster's apprentices, the Seven, and their fates", k: ["arcana", "history"] },
    { t: "Arcturia's transformations in the deep halls", k: ["arcana", "invest"] },
    { t: "Trobriand's scaladar and the Metal Mage's workshops", k: ["arcana", "invest"] },
    { t: "the Shadowdusk family's fall into the far dark", k: ["history", "invest"] },
    { t: "Wyllowwood beneath the mountain and its false sun", k: ["nature", "arcana"] },
    { t: "the Sargauth's slow current through drowned halls", k: ["nature", "invest"] },
    { t: "the Citadel of the Bloody Hand and the Watch that held it", k: ["history"] },
    { t: "the Griffon Cavalry and their high patrols", k: ["history", "invest"] },
    { t: "Deepwater Harbor's merfolk wards", k: ["nature", "invest"] },
    { t: "the Harbor's dead-cart tides after festival nights", k: ["invest"] },
    { t: "the sea-elves' court off Deepwater Isle", k: ["history", "nature"] },
    { t: "Umberlee's cut of every cargo, paid or else", k: ["religion", "invest"] },
    { t: "the Shipwrights' House and the hulls it will not bless", k: ["invest", "religion"] },
    { t: "the Dock Ward knife-count the Watch keeps quietly", k: ["invest"] },
    { t: "Castle Waterdeep's signal flags and what each hoist means", k: ["history", "invest"] },
    { t: "Piergeiron's Palace and the petitions that die in it", k: ["history", "invest"] },
    { t: "the Lords' Rule and the day it was nearly bought", k: ["history", "invest"] },
    { t: "the Shadow Thieves' exile and their long grudge", k: ["invest", "history"] },
    { t: "the Thann vineyards and the Amcathra stables", k: ["invest", "nature"] },
    { t: "Remallia Haventree and the Harpers' open door", k: ["invest", "history"] },
  ],
  chult: [
    { t: "the death curse and the Soulmonger", k: ["arcana", "religion"] },
    { t: "Omu and its nine Trickster Gods", k: ["religion", "history"] },
    { t: "Acererak, maker of tombs", k: ["arcana", "invest"] },
    { t: "Port Nyanzaru and its merchant princes", k: ["invest", "history"] },
    { t: "Ras Nsi and the yuan-ti beneath the peaks", k: ["invest", "religion"] },
    { t: "the vanishing of Mezro", k: ["history", "arcana"] },
    { t: "Ubtao, who turned his back", k: ["religion"] },
    { t: "Dendar the Night Serpent behind the Peaks of Flame", k: ["religion", "nature"] },
    { t: "undead tides and the guides who outwalk them", k: ["nature", "invest"] },
    { t: "dinosaur husbandry and the racing streets", k: ["nature"] },
    { t: "the nine shrines of Omu and their puzzles", k: ["religion", "invest"] },
    { t: "Papazotl, Wongo, and the quarrels of small gods", k: ["religion", "history"] },
    { t: "the Tomb of the Nine Gods and its greedy architecture", k: ["invest", "arcana"] },
    { t: "Withers and the tomb's patient staff", k: ["invest", "arcana"] },
    { t: "Fenthaza and the nightmare temple of Ras Nsi's rivals", k: ["religion", "invest"] },
    { t: "the yuan-ti broodguards and how they are made", k: ["invest", "nature"] },
    { t: "Nangalore and the queen who gardens ruin", k: ["history", "nature"] },
    { t: "Zalkor\u00e9, the eternal queen of Nangalore", k: ["history", "invest"] },
    { t: "Kir Sabal and the aarakocra's dance of the seven winds", k: ["religion", "nature"] },
    { t: "Hew Hackinstone and the dragon he owes", k: ["invest"] },
    { t: "Wyrmheart Mine and the red wyrm coiled in it", k: ["invest", "nature"] },
    { t: "Camp Righteous and the Order's drowned road", k: ["religion", "history"] },
    { t: "Camp Vengeance and the paladins' fever war", k: ["religion", "invest"] },
    { t: "the Flaming Fist's Chultan ledgers", k: ["invest", "history"] },
    { t: "Fort Beluarian and the charter fees of Liara Portyr", k: ["invest"] },
    { t: "Jahaka Anchorage and the pirates of the coast", k: ["invest"] },
    { t: "the Brazen Pegasus and captains for hire", k: ["invest"] },
    { t: "the harbor toll paid to a dragon turtle", k: ["invest", "nature"] },
    { t: "Ekene-Afa and the saddle-makers of the west wall", k: ["invest"] },
    { t: "Wakanga O'tamu's potions and quiet library", k: ["invest", "arcana"] },
    { t: "Zhanthi's gemstones and the Zhentarim question", k: ["invest"] },
    { t: "Jobal and the guides' guild he taxes", k: ["invest"] },
    { t: "the grung of the Aldani Basin and their poison castes", k: ["nature", "invest"] },
    { t: "the Aldani, the lobsterfolk of lost rivers", k: ["nature", "history"] },
    { t: "Firefinger and the pterafolk's high nests", k: ["nature", "invest"] },
    { t: "the River Soshenstar's snags and ambush bends", k: ["nature", "invest"] },
    { t: "Hisari, the yuan-ti city the jungle reclaimed", k: ["history", "invest"] },
    { t: "Orolunga and the naga prophetess Saja N'baza", k: ["religion", "invest"] },
    { t: "Saja N'baza's riddling counsel", k: ["invest", "religion"] },
    { t: "Mbala and the hag who wears a healer's face", k: ["invest", "arcana"] },
    { t: "Nanny Pu'pu and the price of her mercies", k: ["arcana", "invest"] },
    { t: "Shilku's lava fields and the cinderfolk rumor", k: ["nature"] },
    { t: "the Chwinga and the small blessings they leave", k: ["nature", "religion"] },
    { t: "zombie tyrannosaur sign and how to read a cold trail", k: ["nature", "invest"] },
    { t: "the Sewn Sisters' hut in the tomb's deeps", k: ["arcana", "invest"] },
    { t: "the mirror tomb's false promises", k: ["invest", "arcana"] },
    { t: "Ytepka Society and the red triceratops token", k: ["invest"] },
    { t: "the Triceratops Society's warnings to slavers", k: ["invest", "history"] },
    { t: "Mezroan magic and the barae who sleep", k: ["arcana", "history"] },
    { t: "the walls of Mezro seen once at dusk and gone by dawn", k: ["arcana", "invest"] },
    { t: "the Malar hunters who cull the docks by night", k: ["religion", "invest"] },
  ],
  baldursgate: [
    { t: "the murders of the Dead Three in the Gate", k: ["invest", "religion"] },
    { t: "Bhaal's blood and the children it marks", k: ["religion", "history"] },
    { t: "the Council of Four and the Flaming Fist", k: ["history", "invest"] },
    { t: "the Vanthampurs and the buying of a city", k: ["invest"] },
    { t: "the fall of Elturel and the Companion's lie", k: ["religion", "history"] },
    { t: "the patriars and the Outer City's resentments", k: ["history", "invest"] },
    { t: "the Guild, and what it taxes that the Fist cannot", k: ["invest"] },
    { t: "Balduran, the Gate's vanished founder", k: ["history"] },
    { t: "the Basilisk Gate hangings and their records", k: ["history", "invest"] },
    { t: "hellish contracts countersigned in the Gate", k: ["invest", "arcana"] },
    { t: "Duke Ravengard's command of the Fist", k: ["history", "invest"] },
    { t: "Duke Portyr and the vacancy politics of the Council", k: ["history", "invest"] },
    { t: "Thalamra Vanthampur's cellar shrine", k: ["religion", "invest"] },
    { t: "the Vanthampur sons and their divided errands", k: ["invest"] },
    { t: "the Low Lantern, tavern on a hull", k: ["invest"] },
    { t: "the Blushing Mermaid and the deals struck in its dark", k: ["invest"] },
    { t: "the Elfsong Tavern and the voice nobody finds", k: ["invest", "arcana"] },
    { t: "the Wide's market law and its criers", k: ["invest", "history"] },
    { t: "Little Calimshan inside the Gate's walls", k: ["history", "invest"] },
    { t: "the Bloomridge charities and their donors' motives", k: ["invest"] },
    { t: "the Watch Citadel and the split of Watch from Fist", k: ["history", "invest"] },
    { t: "Wyrm's Rock fortress in the river's throat", k: ["history", "invest"] },
    { t: "Wyrm's Crossing and the toll of the twin bridges", k: ["invest", "history"] },
    { t: "Rivington's shanties and the refugee ledgers", k: ["invest", "history"] },
    { t: "Gray Harbor's silt and the dredging contracts", k: ["invest", "nature"] },
    { t: "Umberlee's wavehouse on the harbor mouth", k: ["religion", "invest"] },
    { t: "the Water Queen's House and the drowned offerings", k: ["religion"] },
    { t: "the High Hall and the seats the dukes leave empty", k: ["history", "invest"] },
    { t: "the Hall of Wonders and Gond's patents", k: ["religion", "invest"] },
    { t: "the High House of Wonders and its engineer-priests", k: ["religion", "arcana"] },
    { t: "the Counting House and vault-space politics", k: ["invest"] },
    { t: "the Iron Throne's old headquarters and its ghosts of trade", k: ["invest", "history"] },
    { t: "Sarevok's iron crisis, remembered in ore prices", k: ["history", "invest"] },
    { t: "the bhaalspawn crisis and the Gate's part in it", k: ["history", "religion"] },
    { t: "the Mortuary and the paperwork of the dead", k: ["invest", "religion"] },
    { t: "the Chionthar's currents and the pilots who own them", k: ["nature", "invest"] },
    { t: "the Sword Coast Traders' Bank and its margin calls", k: ["invest"] },
    { t: "Bonecloak's Apothecary and what it will not sell twice", k: ["invest", "nature"] },
    { t: "Sorcerous Sundries and the vault above the shop", k: ["arcana", "invest"] },
    { t: "the Guildhall's tithe-map of the Lower City", k: ["invest"] },
    { t: "Nine-Fingers and the Guild's current peace", k: ["invest"] },
    { t: "the Zhentarim safehouse trade through the Gate", k: ["invest"] },
    { t: "Minsc's statue and the hamster carved at its boot", k: ["history"] },
    { t: "the Beloved Ranger and the cult of his return", k: ["history", "religion"] },
    { t: "the Unseeing Eye's sewer congregation, remembered", k: ["religion", "invest"] },
    { t: "the Undercellar's doors and door-fees", k: ["invest"] },
    { t: "the Fist's press-gangs after the Elturel refugees", k: ["invest", "history"] },
    { t: "Elturel's refugees and the shanty courts they built", k: ["history", "invest"] },
    { t: "the Hhune family and the Knights of the Shield whisper", k: ["invest", "history"] },
    { t: "the Parliament of Peers and its stalled votes", k: ["history", "invest"] },
    { t: "the lighthouse at the harbor chain", k: ["history", "invest"] },
    { t: "the chain across the Gray Harbor and when it rises", k: ["history", "invest"] },
    { t: "the legend of the bronze wyrm under Wyrm's Rock", k: ["arcana", "history"] },
  ],
  avernus: [
    { t: "Zariel's fall from angel to archdevil", k: ["religion", "history"] },
    { t: "Elturel dragged down on its chains", k: ["history", "religion"] },
    { t: "the Blood War's front line and its salients", k: ["history", "religion"] },
    { t: "the River Styx and the price of its water", k: ["arcana", "religion"] },
    { t: "Bel, the deposed lord who keeps the war", k: ["history", "invest"] },
    { t: "infernal war machines and their soul-engines", k: ["arcana", "invest"] },
    { t: "soul coins and the ethics of spending them", k: ["religion", "invest"] },
    { t: "the Companion of Elturel, before and after", k: ["religion", "arcana"] },
    { t: "warlord territories of the first layer", k: ["invest", "history"] },
    { t: "the hierarchy of the Nine and its vacancies", k: ["religion", "history"] },
    { t: "Lulu the hollyphant and the memory she lost", k: ["history", "religion"] },
    { t: "the Sword of Zariel and the hilt that chooses", k: ["arcana", "religion"] },
    { t: "Idyllglen, the village Zariel bled for", k: ["history", "religion"] },
    { t: "the Hellriders' charge through the portal", k: ["history"] },
    { t: "the Hellriders' fate and Zariel's ledger of blame", k: ["history", "invest"] },
    { t: "Haruman, the rider who followed her down", k: ["history", "invest"] },
    { t: "the Crypt of the Hellriders and its restless files", k: ["invest", "religion"] },
    { t: "Fort Knucklebone and Mad Maggie's crews", k: ["invest"] },
    { t: "Mad Maggie the night hag and her dream-salvage", k: ["arcana", "invest"] },
    { t: "the kenku scavenger gangs of the wastes", k: ["invest", "nature"] },
    { t: "the Wandering Emporium and Mahadi's hospitality", k: ["invest"] },
    { t: "Mahadi the rakshasa and the contracts of his bazaar", k: ["invest", "arcana"] },
    { t: "the Bleeding Citadel and the wound it seals", k: ["religion", "arcana"] },
    { t: "the demon ichor trade and what it does to flesh", k: ["arcana", "nature"] },
    { t: "Kostchtchie's rages loosed on the first layer", k: ["religion", "invest"] },
    { t: "the Abyssal breaches along the Styx bends", k: ["arcana", "invest"] },
    { t: "Arkhan the Cruel and the Hand of Vecna", k: ["invest", "arcana"] },
    { t: "the Vanthampur pact that pulled a city down", k: ["invest", "religion"] },
    { t: "Thavius Kreeg and the shield of the Hidden Lord", k: ["invest", "religion"] },
    { t: "Gargauth, the Hidden Lord in the shield", k: ["religion", "invest"] },
    { t: "the puzzlebox of Elturel's contract", k: ["invest", "arcana"] },
    { t: "the infernal script and the clauses between clauses", k: ["invest", "arcana"] },
    { t: "the flying fortresses of the archduchess", k: ["invest", "arcana"] },
    { t: "imp surveyors and the measuring of souls", k: ["invest", "religion"] },
    { t: "amnizu toll-lords of the river crossings", k: ["invest", "religion"] },
    { t: "the Pit Fiend garrisons and their rotation", k: ["invest", "history"] },
    { t: "the fall of the Companion and the day the sun went out over Elturel", k: ["history", "religion"] },
    { t: "High Overseer Kreeg's paperwork of damnation", k: ["invest", "history"] },
    { t: "Torm's silence over Elturel and what the faithful made of it", k: ["religion"] },
    { t: "the Zarielite conversion sermons in the camps", k: ["religion", "invest"] },
    { t: "bone brambles and the paths that eat boots", k: ["nature", "invest"] },
    { t: "the fiendish flora that drinks screams", k: ["nature", "arcana"] },
    { t: "hellwasp nests and the grubs' preferences", k: ["nature", "invest"] },
    { t: "the abishai wings and their liveries", k: ["invest", "religion"] },
    { t: "Avernian dust storms and the faces in them", k: ["nature", "arcana"] },
    { t: "Bel's forges and the requisition wars with Zariel's court", k: ["invest", "history"] },
    { t: "Tiamat's lair at the layer's rim", k: ["religion", "history"] },
    { t: "the Dragon Queen's tithe of chromatic eggs", k: ["religion", "invest"] },
    { t: "the pact primeval retold by devil advocates", k: ["religion", "history"] },
    { t: "the seed of Elturel's salvation hidden in its charter", k: ["invest", "history"] },
    { t: "the chains of Elturel and the pit beneath it", k: ["history", "arcana"] },
  ],
  icewinddale: [
    { t: "Auril's Everlasting Rime and the sunless years", k: ["religion", "nature"] },
    { t: "Ten-Towns, its speakers, and its knucklehead trade", k: ["history", "invest"] },
    { t: "Ythryn, the Netherese city under the glacier", k: ["arcana", "history"] },
    { t: "Kelvin's Cairn and the dwarves of the valley", k: ["history", "nature"] },
    { t: "the duergar of Sunblight and their black ice", k: ["invest", "arcana"] },
    { t: "the Reghed tribes and the seasons they follow", k: ["nature", "history"] },
    { t: "Akar Kessell and the crystal shard's winter", k: ["history", "arcana"] },
    { t: "chardalyn and what it drinks", k: ["arcana", "nature"] },
    { t: "cold-lore: surviving the Dale's white nights", k: ["nature"] },
    { t: "the sacrifices Ten-Towns made, and to whom", k: ["religion", "invest"] },
    { t: "Crenshinibon, the Crystal Shard itself", k: ["arcana", "history"] },
    { t: "Cryshal-Tirith and towers grown from a lie", k: ["arcana", "history"] },
    { t: "Bryn Shander's walls and the market under them", k: ["history", "invest"] },
    { t: "Speaker Duvessa Shane and the burden of the largest town", k: ["history", "invest"] },
    { t: "Targos and its fishing fleets on Maer Dualdon", k: ["invest", "nature"] },
    { t: "the lottery of Auril's tithe and the towns that drew it", k: ["religion", "invest"] },
    { t: "Lonelywood's timber and its quiet graves", k: ["nature", "invest"] },
    { t: "Termalaine's gem mine and what woke in it", k: ["invest", "nature"] },
    { t: "Caer-Dineval and the Knights of the Black Sword", k: ["religion", "invest"] },
    { t: "Caer-Konig and the thefts across the ice", k: ["invest"] },
    { t: "Good Mead's honey and the murdered speaker", k: ["invest"] },
    { t: "Dougan's Hole and the things not spoken of", k: ["invest"] },
    { t: "Bremen's floods and lake-monster tales", k: ["nature", "invest"] },
    { t: "Maer Dualdon, Lac Dinneshere, and Redwaters", k: ["nature"] },
    { t: "the knucklehead trout and the scrimshaw law", k: ["invest", "nature"] },
    { t: "the Northern Lights and the omens read in them", k: ["religion", "nature"] },
    { t: "the Dale's endless night and the lamp-oil economy", k: ["invest", "nature"] },
    { t: "Battlehammer holds and the mead of Stokely Silverstream", k: ["history", "invest"] },
    { t: "the Reghed Glacier's calving and the paths it opens", k: ["nature"] },
    { t: "Skytower Shelter and the goliath feud", k: ["history", "invest"] },
    { t: "the chwinga of the tundra and their ice-gifts", k: ["nature", "religion"] },
    { t: "the Frostmaiden's rites and the Cold Crone's names", k: ["religion"] },
    { t: "the frost druids and their circle of the blizzard", k: ["religion", "nature"] },
    { t: "the Id Ascendant's crash and the crew from beyond", k: ["arcana", "invest"] },
    { t: "mind flayer salvage on the tundra", k: ["invest", "arcana"] },
    { t: "Xardorok Sunblight's forge-heart of chardalyn", k: ["invest", "arcana"] },
    { t: "the chardalyn dragon built to burn Ten-Towns", k: ["arcana", "history"] },
    { t: "the Sunblight fortress and its magma vents", k: ["invest", "nature"] },
    { t: "the Sea of Moving Ice and the berg-lanes through it", k: ["nature"] },
    { t: "the Netherese spire's fall that split the glacier", k: ["history", "arcana"] },
    { t: "the mythallar under the ice and its cold hum", k: ["arcana", "history"] },
    { t: "Iriolarthas the demilich of Ythryn", k: ["arcana", "invest"] },
    { t: "the Spire of Iriolarthas and its speaking skull", k: ["arcana", "invest"] },
    { t: "Vellynne Harpell's northern expedition", k: ["arcana", "invest"] },
    { t: "the Arcane Brotherhood's rivals on the ice", k: ["invest", "arcana"] },
    { t: "Auril's three forms and the tests of her island", k: ["religion", "arcana"] },
    { t: "the yeti dens of the Spine's northern face", k: ["nature", "invest"] },
    { t: "the axe beak sledges and the breeders who swear by them", k: ["nature", "invest"] },
    { t: "the Black Cabin on the Sea of Moving Ice", k: ["invest", "arcana"] },
    { t: "the moose-hunts that feed a town for a month", k: ["nature"] },
    { t: "the ice-fishing shanties and the holes that stare back", k: ["invest", "nature"] },
    { t: "the cairns of the Dale and the barrow-law of the tribes", k: ["religion", "history"] },
  ],
  feywild: [
    { t: "the Witchlight Carnival and its ledger of admissions", k: ["invest", "arcana"] },
    { t: "Prismeer shattered into three", k: ["history", "arcana"] },
    { t: "the Hourglass Coven and the theft of wonder", k: ["invest", "arcana"] },
    { t: "Titania's Summer Court and the Gloaming Queen", k: ["history", "religion"] },
    { t: "Seelie, Unseelie, and the space between bows", k: ["history", "invest"] },
    { t: "fey bargains and the words that bind them", k: ["invest", "arcana"] },
    { t: "time's crooked run in Faerie", k: ["arcana", "nature"] },
    { t: "changelings, tithes, and stolen names", k: ["invest", "arcana"] },
    { t: "the archfey and their domains of delight", k: ["arcana", "history"] },
    { t: "eladrin seasons and what each court forgives", k: ["nature", "history"] },
    { t: "Zybilna and the palace of ice at Prismeer's heart", k: ["history", "arcana"] },
    { t: "Iggwilv's other name and the cauldron she keeps", k: ["arcana", "invest"] },
    { t: "Hither's bogs and the balloon crossings", k: ["nature", "invest"] },
    { t: "Thither's woods and the treehouse thrones", k: ["nature", "invest"] },
    { t: "Yon's peaks and the palace above the clouds", k: ["nature", "invest"] },
    { t: "Skabatha Nightshade and her rocking-horse mill", k: ["invest", "arcana"] },
    { t: "Endelyn Moongrave's theater of futures", k: ["invest", "arcana"] },
    { t: "Loomlurch and the stolen children's chores", k: ["invest"] },
    { t: "the League of Malevolence at large in Prismeer", k: ["invest", "history"] },
    { t: "Kelek and the villains out of an older tale", k: ["invest", "history"] },
    { t: "Valor's Call and the heroes who chase them", k: ["history"] },
    { t: "Mister Witch and Mister Light, proprietors", k: ["invest"] },
    { t: "the Big Top's hidden door to Prismeer", k: ["invest", "arcana"] },
    { t: "the Feywild crossings and where the veil wears thin", k: ["arcana", "nature"] },
    { t: "fey crossroads and the rules of hospitality", k: ["invest", "religion"] },
    { t: "the Wild Hunt and the debts it collects", k: ["religion", "invest"] },
    { t: "the Queen of Air and Darkness, unnamed at court", k: ["religion", "history"] },
    { t: "the Gloaming Court's masks and their meanings", k: ["invest", "history"] },
    { t: "the Summer Court's tourneys and their true stakes", k: ["history", "invest"] },
    { t: "satyr revels and the mornings after them", k: ["nature", "invest"] },
    { t: "dryad groves and the heart-trees they cannot leave", k: ["nature", "religion"] },
    { t: "treant moots and the pace of their law", k: ["nature", "history"] },
    { t: "the firbolg lodges between the courts", k: ["nature", "history"] },
    { t: "redcaps and the wet work they volunteer for", k: ["invest", "nature"] },
    { t: "boggles and the oil of their doorways", k: ["arcana", "invest"] },
    { t: "blink dog packs and displacer beast feuds", k: ["nature", "history"] },
    { t: "the Feydark beneath the bright lands", k: ["nature", "invest"] },
    { t: "fomorian courts and the curse that bent them", k: ["history", "religion"] },
    { t: "the fading of fey who are forgotten", k: ["arcana", "religion"] },
    { t: "mortal music's price in fey markets", k: ["invest", "arcana"] },
    { t: "the Goblin Market's stalls and their exchange rates", k: ["invest"] },
    { t: "memory as currency and the lenders who take it", k: ["invest", "arcana"] },
    { t: "the Summer Queen's gifts and their stings", k: ["invest", "religion"] },
    { t: "the Prince of Frost and the heart he keeps on ice", k: ["history", "religion"] },
    { t: "the Maiden of the Moon and her hunt of lycanthropes", k: ["religion", "nature"] },
    { t: "the rule of names and why the fey trade in titles", k: ["arcana", "invest"] },
    { t: "iron's bite and the courts' polite horror of it", k: ["arcana", "history"] },
    { t: "the tithe to darker powers whispered of at solstice", k: ["religion", "invest"] },
    { t: "mortals who danced a night and lost a decade", k: ["arcana", "history"] },
    { t: "the unicorn glades and the oaths sworn at horn-touch", k: ["religion", "nature"] },
    { t: "the pegasus aeries of Yon's crags", k: ["nature"] },
  ],
  wildspace: [
    { t: "the Rock of Bral and its neutral markets", k: ["history", "invest"] },
    { t: "spelljamming helms and who may sit them", k: ["arcana", "invest"] },
    { t: "mind flayer nautiloids and their harvests", k: ["arcana", "invest"] },
    { t: "the githyanki raids out of the Astral", k: ["history", "invest"] },
    { t: "giff companies and their powder discipline", k: ["history"] },
    { t: "kindori, scavvers, and the beasts between worlds", k: ["nature"] },
    { t: "air envelopes, gravity planes, and drownings in the dark", k: ["nature", "arcana"] },
    { t: "the legend of the Spelljammer itself", k: ["arcana", "history"] },
    { t: "astral color pools and where they open", k: ["arcana"] },
    { t: "dohwar, plasmoids, and the etiquette of strange crews", k: ["invest", "nature"] },
    { t: "Prince Andru of Bral and the Rock's uneasy crown", k: ["history", "invest"] },
    { t: "the Rock's underbarony and the thieves' peace", k: ["invest"] },
    { t: "the Elven Imperial Navy and its man-o-wars", k: ["history", "invest"] },
    { t: "the Unhuman Wars and their long ash", k: ["history"] },
    { t: "neogi slave-webs and the umber hulk decks", k: ["invest", "nature"] },
    { t: "the neogi masters and the great old masters they fear", k: ["invest", "nature"] },
    { t: "beholder cults among the tyrant ships", k: ["religion", "invest"] },
    { t: "Wildspace piracy and the letters of marque nobody honors", k: ["invest"] },
    { t: "the Astral Sea's timeless calm and its cost", k: ["arcana", "religion"] },
    { t: "dead gods adrift and the cities on their brows", k: ["religion", "history"] },
    { t: "Vlaakith's court and the price of ascension", k: ["history", "religion"] },
    { t: "githyanki silver swords and the taking of them", k: ["invest", "arcana"] },
    { t: "githzerai monasteries in Limbo's calm eyes", k: ["religion", "arcana"] },
    { t: "red dragons in githyanki service and the old pact", k: ["history", "invest"] },
    { t: "Toril seen from high orbit and the mapmakers' quarrels", k: ["nature", "invest"] },
    { t: "the phlogiston tales the oldest pilots still tell", k: ["arcana", "history"] },
    { t: "wildspace whaling and the kindori-oil lamps", k: ["invest", "nature"] },
    { t: "scavver dens in hulk graveyards", k: ["nature", "invest"] },
    { t: "the hulk graveyards and the salvage guild claims", k: ["invest"] },
    { t: "asteroid monasteries and their long silences", k: ["religion"] },
    { t: "astral graffiti on the dead gods' skin", k: ["invest", "religion"] },
    { t: "astral dreadnoughts and the doors they guard", k: ["arcana", "religion"] },
    { t: "the Infinite Staircase's landings in wild ports", k: ["arcana", "invest"] },
    { t: "planar customs houses and what cannot be declared", k: ["invest"] },
    { t: "hammership captains and their cargo manifests", k: ["invest"] },
    { t: "the squid ship silhouette and when to run", k: ["invest", "history"] },
    { t: "bombards, ballistae, and boarding law between decks", k: ["history", "invest"] },
    { t: "the giff platoon contracts and their powder clauses", k: ["invest"] },
    { t: "smokepowder magazines and the ships that vanished", k: ["invest", "arcana"] },
    { t: "mercane brokers and the coin they never touch", k: ["invest"] },
    { t: "helm-burn and the pilots it hollows", k: ["arcana", "invest"] },
    { t: "the death of a helm and the drift that follows", k: ["arcana", "invest"] },
    { t: "wildspace burial rites and the sky-sailors' psalms", k: ["religion"] },
    { t: "the chart-houses of Bral and their jealous corrections", k: ["invest", "history"] },
    { t: "first landfall protocols on unlisted worlds", k: ["invest", "nature"] },
    { t: "the quarantine flags and the plague-ships of the void", k: ["invest", "nature"] },
    { t: "the Rock's air-tax and the farms that pay it", k: ["invest", "nature"] },
    { t: "the lamp-lighters of Bral's long street", k: ["invest"] },
    { t: "wildspace charts traded like state secrets", k: ["invest", "history"] },
    { t: "mooring law and the cutters who enforce it", k: ["invest", "history"] },
  ],
  neverwinter: [
    { t: "the eruption of Mount Hotenow", k: ["history", "nature"] },
    { t: "the Wailing Death and the city it emptied", k: ["history", "nature"] },
    { t: "Lord Neverember's protectorate and its books", k: ["invest", "history"] },
    { t: "Castle Never and the crown nobody wears", k: ["history", "invest"] },
    { t: "Gauntlgrym and the fire beneath it", k: ["history", "arcana"] },
    { t: "Helm's Hold and the healing of the Scar", k: ["religion", "history"] },
    { t: "the River District's rebuilding and its rackets", k: ["invest"] },
    { t: "the Neverwinter Nine, remembered", k: ["history"] },
    { t: "the Winter that never comes to the city's gardens", k: ["arcana", "nature"] },
    { t: "Thay's designs on the Crags", k: ["invest", "arcana"] },
    { t: "the Sons of Alagondar and the old loyalist knot", k: ["history", "invest"] },
    { t: "General Sabine and the Mintarn garrison", k: ["history", "invest"] },
    { t: "the Mintarn mercenaries and the citizens' resentment", k: ["invest", "history"] },
    { t: "the Chasm that split the southeast and its sealing", k: ["history", "arcana"] },
    { t: "the Blue Fire scars and the spellplagued deeps", k: ["arcana", "history"] },
    { t: "Neverwinter's eternal-summer orchards and their keepers", k: ["nature"] },
    { t: "Blacklake and the silt the nobles pretend not to see", k: ["invest", "nature"] },
    { t: "the Cloak Tower and the Many-Starred Cloaks of old", k: ["arcana", "history"] },
    { t: "the Hall of Justice and Tyr's vacant seat", k: ["religion", "history"] },
    { t: "the Beached Leviathan, tavern in a hull", k: ["invest"] },
    { t: "the Ashmadai brands and the cells they mark", k: ["religion", "invest"] },
    { t: "the cult of Asmodeus in the working wards", k: ["religion", "invest"] },
    { t: "the plaguechanged and the wards that failed them", k: ["arcana", "history"] },
    { t: "the Order of the Gauntlet's chapterhouse at the Hold", k: ["religion", "history"] },
    { t: "the sanatorium of Helm's Hold and its patient files", k: ["invest", "religion"] },
    { t: "Neverdeath graveyard and its two gates", k: ["religion", "history"] },
    { t: "the Thayan cell in the graveyards and their exhumations", k: ["invest", "arcana"] },
    { t: "Thundertree's ruins and the dragon that squatted there", k: ["history", "invest"] },
    { t: "the druids of Neverwinter Wood and their claim", k: ["nature", "religion"] },
    { t: "the Emerald Enclave's watch on Hotenow's slopes", k: ["nature", "invest"] },
    { t: "fire genasi born the year of the eruption", k: ["arcana", "history"] },
    { t: "the fire primordial Maegera bound at the forge", k: ["arcana", "history"] },
    { t: "Bruenor's retaking of Gauntlgrym", k: ["history"] },
    { t: "the mithral roads between the city and the mountain", k: ["invest", "history"] },
    { t: "the Crags' abandoned mines and their new tenants", k: ["invest", "nature"] },
    { t: "Leilon's re-raising and the ghost lights of its crane", k: ["history", "invest"] },
    { t: "the High Road's rebuilding and the toll politics", k: ["invest", "history"] },
    { t: "the Sword Mountains' wyvern nests above the road", k: ["nature"] },
    { t: "the Protector's Enclave and its tent-courts", k: ["history", "invest"] },
    { t: "the Docks Quarter press-gangs and the harbormaster's blind eye", k: ["invest"] },
    { t: "the eye-tyrant rumor beneath the Blacklake ruins", k: ["invest", "arcana"] },
    { t: "the orc assaults of the Many-Arrows years", k: ["history"] },
    { t: "the treaty stones on the Neverwinter Wood's edge", k: ["history", "nature"] },
    { t: "the aqueducts Hotenow cracked and the water-guilds since", k: ["invest", "history"] },
    { t: "the founding by Lord Never and the name's two stories", k: ["history"] },
    { t: "the Jewel of the North's rebuilt boast", k: ["history"] },
    { t: "the winter roses that bloom against all sense", k: ["nature", "arcana"] },
    { t: "the smiths' quarter reforged and its dwarven partners", k: ["invest", "history"] },
    { t: "the charter companies licensed to clear the ruins", k: ["invest", "history"] },
    { t: "the ruined quarters' salvage law and its enforcers", k: ["invest"] },
  ],
  silvermarches: [
    { t: "Silverymoon and Alustriel's long peace", k: ["history", "arcana"] },
    { t: "the Confederation of the Silver Marches", k: ["history"] },
    { t: "Old Delzoun's halls beneath the frontier", k: ["history", "invest"] },
    { t: "the hordes of Many-Arrows", k: ["history", "invest"] },
    { t: "the Moonbridge and the wards of the Gem", k: ["arcana"] },
    { t: "Mithral Hall and the line of Battlehammer", k: ["history"] },
    { t: "Bruenor Battlehammer's returns and reigns", k: ["history"] },
    { t: "the Spellguard of Silverymoon and its charter", k: ["arcana", "history"] },
    { t: "the Lady's College and the Vault of the Sages", k: ["arcana", "invest"] },
    { t: "Everlund's five captains and the caravan votes", k: ["history", "invest"] },
    { t: "Sundabar's double walls and the Everfire beneath", k: ["history", "invest"] },
    { t: "the Everfire vault and the smiths sworn to it", k: ["invest", "arcana"] },
    { t: "Citadel Adbar's iron discipline", k: ["history"] },
    { t: "Citadel Felbarr, the Run, and its retakings", k: ["history"] },
    { t: "the River Rauvin's fords and ferry-forts", k: ["history", "nature"] },
    { t: "Nesme and the Evermoors' trolls", k: ["history", "invest"] },
    { t: "the Riders of Nesme and their bog-lances", k: ["history", "invest"] },
    { t: "the Evermoors' mists and what hunts in them", k: ["nature", "invest"] },
    { t: "the Cold Wood and the Uthgardt who claim it", k: ["nature", "religion"] },
    { t: "the lycanthrope hunts of the Moonwood's edge", k: ["invest", "nature"] },
    { t: "the Rauvin Vale's farms and the granary forts", k: ["history", "nature"] },
    { t: "Deadsnows and the mountain passes' toll of winters", k: ["history", "nature"] },
    { t: "the Fell Pass and the bones under its cairns", k: ["history", "invest"] },
    { t: "the orc sign-stones marking Many-Arrows' old bounds", k: ["history", "invest"] },
    { t: "King Obould's treaty and the peace that outlived him", k: ["history"] },
    { t: "Dark Arrow Keep and the throne of the orc kings", k: ["history", "invest"] },
    { t: "the Underdark gates beneath the Marches and their watches", k: ["invest", "history"] },
    { t: "Menzoberranzan's raids up the old Delzoun ways", k: ["history", "invest"] },
    { t: "the mithral lodes and the claim-law of the deep halls", k: ["invest", "history"] },
    { t: "the runestones of Delzoun and the words that still hold", k: ["arcana", "history"] },
    { t: "Taern Hornblade's stewardship of the Gem", k: ["history"] },
    { t: "the Knights in Silver and their road patrols", k: ["history", "invest"] },
    { t: "the Argent Legion mustered from all the Marches", k: ["history"] },
    { t: "the beacon-towers along the Rauvin", k: ["history"] },
    { t: "the winter-closed passes and the tunnel-roads dwarves keep", k: ["nature", "history"] },
    { t: "the moon elf holds of the Moonwood's north", k: ["history", "nature"] },
    { t: "the gnome delvings of the Ice Mountains' feet", k: ["history", "invest"] },
    { t: "the frost giant raids down the Valley of Khedrun", k: ["history", "invest"] },
    { t: "the white dragon of the Spine's high shoulder", k: ["nature", "invest"] },
    { t: "the Silverymoon Ward's gate-riddles for the unwelcome", k: ["arcana", "invest"] },
    { t: "the Vault of the Sages' closed stacks and their keepers", k: ["invest", "arcana"] },
    { t: "the Marches' joint coin and the mints that strike it", k: ["invest", "history"] },
    { t: "the treaty fairs where dwarf, elf, and man price the year", k: ["invest", "history"] },
    { t: "the old Delzoun trade-tongue still cut into milestones", k: ["history", "invest"] },
    { t: "the rebuilding of the Rauvin bridges after the war", k: ["history", "invest"] },
    { t: "the Harpers' road-posts between Everlund and the Gem", k: ["invest", "history"] },
    { t: "the Uthgardt Sky Pony tribe and their horse-omens", k: ["religion", "nature"] },
    { t: "the Blue Bear tribe's fall and the shame of Hellgate Keep", k: ["history", "religion"] },
    { t: "the winter caravanserais of the Rauvin Way", k: ["invest", "history"] },
    { t: "the Mielikki shrines of the ranger-roads", k: ["religion", "nature"] },
    { t: "the silver lodes that named the Marches", k: ["history", "invest"] },
    { t: "Garumn's Gorge and Mithral Hall's eastern gate", k: ["history", "invest"] },
  ],
  cormyr: [
    { t: "the Purple Dragons and the War Wizards", k: ["history", "arcana"] },
    { t: "the Obarskyr line and its regencies", k: ["history"] },
    { t: "Suzail's court and the price of a charter", k: ["invest", "history"] },
    { t: "the Hullack Forest and what the king's men avoid", k: ["nature", "invest"] },
    { t: "Marsember's fogs and smugglers", k: ["invest", "nature"] },
    { t: "the crown's old debts to adventurers", k: ["history", "invest"] },
    { t: "Azoun IV and the age the realm still measures by", k: ["history"] },
    { t: "the Devil Dragon and the Goblin War's cost", k: ["history", "invest"] },
    { t: "Vangerdahast, Royal Magician, and his contingencies", k: ["arcana", "history"] },
    { t: "Alusair the Steel Regent's riding years", k: ["history"] },
    { t: "Filfaeril, the Dragon Queen dowager", k: ["history"] },
    { t: "the Stonelands and the raiders the crown cannot tame", k: ["history", "invest"] },
    { t: "Arabel's rebellions and its loyal merchants", k: ["history", "invest"] },
    { t: "Castle Crag and the northern muster", k: ["history"] },
    { t: "High Horn and the mountain garrison's signal fires", k: ["history", "invest"] },
    { t: "the Wyvernwater's ferries and fishing rights", k: ["invest", "nature"] },
    { t: "the King's Forest and the poaching law", k: ["nature", "invest"] },
    { t: "the royal foresters and the green-cloak courtesies", k: ["nature", "history"] },
    { t: "Immersea and the Wyvernspur family ghost", k: ["invest", "history"] },
    { t: "the Wyvernspurs and the crown's quiet errands", k: ["invest", "history"] },
    { t: "Espar and the yeoman levies of the west", k: ["history"] },
    { t: "Waymoot's wagon-yards on the Way of the Dragon", k: ["invest"] },
    { t: "Dhedluk's timber charter in the King's Forest", k: ["invest", "nature"] },
    { t: "the Royal Court's cousinly factions", k: ["invest", "history"] },
    { t: "the crown's ban on unlicensed adventuring charters", k: ["invest", "history"] },
    { t: "the Dragonmere trade and Westgate's rivalry across it", k: ["invest", "history"] },
    { t: "the Thunder Peaks passes and their winter closures", k: ["nature", "history"] },
    { t: "Thunderstone and the Hullack's edge-town vigils", k: ["invest", "nature"] },
    { t: "the Fire Knives' exile and their long knives for the crown", k: ["invest", "history"] },
    { t: "the Cult of the Dragon's cells along the Reach", k: ["invest", "religion"] },
    { t: "Sembian coin buying Cormyrean land and the law against it", k: ["invest", "history"] },
    { t: "the Marsember Watch's water-gate tolls", k: ["invest"] },
    { t: "the crown's treaty with the Hullack fey", k: ["history", "nature"] },
    { t: "the smugglers' marshes between Marsember and the Reach", k: ["invest", "nature"] },
    { t: "the Purple Dragon knighthood's vows and their weight", k: ["religion", "history"] },
    { t: "the War Wizards' scrying courts and the privacy quarrels", k: ["arcana", "invest"] },
    { t: "Suzail's shipwrights and the royal navy's slow birth", k: ["invest", "history"] },
    { t: "the Dragon Coast raiders and the southern watch", k: ["history", "invest"] },
    { t: "the Hermit of the Hullack and his warnings", k: ["invest", "religion"] },
    { t: "the Storm Horns' griffon eyries and the crown's falconers", k: ["nature", "invest"] },
    { t: "the crown's gem-tithe from the mountain mines", k: ["invest"] },
    { t: "the royal menagerie and the beast-gifts of foreign courts", k: ["nature", "history"] },
    { t: "the ban on wearing swords in Suzail without a peace-knot", k: ["history", "invest"] },
    { t: "the Society of Stalwart Adventurers and its charter hall", k: ["history", "invest"] },
    { t: "the royal docks' excise men and the night-cargo game", k: ["invest"] },
    { t: "the crown's paper: writs, patents, and the clerks who rule by them", k: ["invest", "history"] },
    { t: "the border stones with Sembia and the surveyors' feuds", k: ["history", "invest"] },
    { t: "the Purple Dragon veterans' farms and their standing recall", k: ["history"] },
    { t: "the tale of the lost crown prince and the years of searching", k: ["history", "invest"] },
    { t: "the Marsember eel-boats and the fog-bell code", k: ["invest", "nature"] },
  ],
  dalelands: [
    { t: "the Dales' compact with the elves of Cormanthor", k: ["history", "nature"] },
    { t: "Shadowdale and the tower of Elminster", k: ["history", "arcana"] },
    { t: "Archendale's Swords and their secrecy", k: ["invest", "history"] },
    { t: "the standing stones of the Dalelands' bounds", k: ["history", "religion"] },
    { t: "Daggerdale's long war with the Zhents", k: ["history", "invest"] },
    { t: "Cormanthor's drow and the old elven roads", k: ["history", "nature"] },
    { t: "the Dale Council at the Standing Stone", k: ["history"] },
    { t: "Mistledale's wide fields and the Riders of Mistledale", k: ["history", "nature"] },
    { t: "Ashabenford and the crossings of the Ashaba", k: ["invest", "history"] },
    { t: "the Pool of Yeven and the river trade south", k: ["invest", "nature"] },
    { t: "Featherdale's ferry tolls and quiet freeholds", k: ["invest", "history"] },
    { t: "Scardale's occupations and its scarred pride", k: ["history", "invest"] },
    { t: "New Velar's docks and the Sembian buyers", k: ["invest"] },
    { t: "Deepingdale's half-elven peace", k: ["history", "nature"] },
    { t: "Highmoon and the Tower of the Rising Moon", k: ["history", "invest"] },
    { t: "the Leaves of Learning, Oghma's library at Highmoon", k: ["religion", "invest"] },
    { t: "the Twisted Tower of Ashaba and its drow past", k: ["history", "arcana"] },
    { t: "Elminster's tower door and who has knocked", k: ["arcana", "history"] },
    { t: "Storm Silverhand's farm and the Harpers' hearth", k: ["history", "invest"] },
    { t: "the Knights of Myth Drannor and their charter", k: ["history"] },
    { t: "the Zhentarim's Daggerdale puppetries", k: ["invest", "history"] },
    { t: "Randal Morn and the freeing of Dagger Falls", k: ["history"] },
    { t: "Dagger Falls burned and retaken", k: ["history", "invest"] },
    { t: "the Border Forest's fey and the Zhent axes", k: ["nature", "invest"] },
    { t: "the Dagger Hills' bandit barrows", k: ["invest", "history"] },
    { t: "Teshendale's fall and the empty dale's warning", k: ["history"] },
    { t: "the Tesh running foul from Zhentil Keep's works", k: ["nature", "history"] },
    { t: "the Moonsea Ride's caravan seasons", k: ["invest"] },
    { t: "the Vale of Lost Voices and the elven dead's law", k: ["religion", "history"] },
    { t: "the drow of the Elven Court's ruins", k: ["invest", "history"] },
    { t: "Myth Drannor's mythal and its long dying", k: ["arcana", "history"] },
    { t: "Lake Sember's stillness and the elf-oaths on its shore", k: ["nature", "religion"] },
    { t: "the Ashaba's floods and the dale mills' truce with them", k: ["nature", "invest"] },
    { t: "the Dales' militia musters and the beacon hills", k: ["history"] },
    { t: "the horse fairs of Mistledale and the Riders' remounts", k: ["invest", "nature"] },
    { t: "the Sword of the Dales, blade and legend", k: ["history", "arcana"] },
    { t: "the Dancing Place and the harpist moots held there", k: ["history", "religion"] },
    { t: "the Harpers' refuges threaded through the dales", k: ["invest", "history"] },
    { t: "the drow poison-roads to the surface markets", k: ["invest", "nature"] },
    { t: "the loggers' compacts and the elves' marked trees", k: ["nature", "invest"] },
    { t: "the Standing Stone's raising and the Year of its oath", k: ["history", "religion"] },
    { t: "the Dalesfolk's distrust of crowns, written plain", k: ["history"] },
    { t: "the beacon-line from Shadowdale to the Standing Stone", k: ["history"] },
    { t: "the dale-moots' quarrels over road upkeep", k: ["history", "invest"] },
    { t: "the elven ruins farmers plough around and never touch", k: ["history", "religion"] },
    { t: "the Ashaba ferry families and their old right-of-ways", k: ["invest", "history"] },
    { t: "the wolf winters and the bounty ledgers of the dales", k: ["nature", "invest"] },
    { t: "the Sembian land-agents and the dales' refusals", k: ["invest", "history"] },
    { t: "the harpers' songs that carry news faster than riders", k: ["invest", "history"] },
    { t: "the shrine-keepers of the crossroads gods", k: ["religion"] },
    { t: "the treants of Cormanthor's deep stands", k: ["nature", "religion"] },
  ],
  heartlands: [
    { t: "the Trade Way and the caravan seasons", k: ["invest", "history"] },
    { t: "Boareskyr Bridge, where Bhaal fell", k: ["religion", "history"] },
    { t: "the Fields of the Dead and their harvests of bone", k: ["history", "nature"] },
    { t: "Scornubel, the Caravan City, and its brokers", k: ["invest"] },
    { t: "Elturgard's paladin roads, before the fall", k: ["religion", "history"] },
    { t: "the Cloak Wood and the Cloakwood mines", k: ["nature", "invest"] },
    { t: "Berdusk, Jewel of the Vale, and Twilight Hall", k: ["history", "invest"] },
    { t: "Twilight Hall and the Harpers' western hearth", k: ["invest", "history"] },
    { t: "Iriaebor, the City of a Thousand Spires", k: ["history", "invest"] },
    { t: "Asbravn and the Riders in Red Cloaks", k: ["invest", "history"] },
    { t: "Hluthvar's watch-walls against the Far Hills", k: ["history", "invest"] },
    { t: "Darkhold, the Zhentarim's western fortress", k: ["invest", "history"] },
    { t: "the Black Network's toll on the Trade Way", k: ["invest"] },
    { t: "Yellow Snake Pass and the caravans that vanish there", k: ["invest", "nature"] },
    { t: "the Sunset Mountains' passes and their watchers", k: ["nature", "invest"] },
    { t: "the Far Hills' shepherd-forts", k: ["history", "nature"] },
    { t: "Corm Orp's halfling terraces and Zhent shadows", k: ["invest", "history"] },
    { t: "the Reaching Wood and the druid rings within it", k: ["nature", "religion"] },
    { t: "the Winding Water's fords and the bridge-tolls", k: ["invest", "nature"] },
    { t: "the serpent sign at Boareskyr and the water none drink", k: ["religion", "nature"] },
    { t: "Bhaal's blood in the river and the pilgrim trade it draws", k: ["religion", "invest"] },
    { t: "Soubar and the roadhouse law of the Way", k: ["invest"] },
    { t: "the Companion's dawn over Elturel, while it stood", k: ["religion", "history"] },
    { t: "Elturel's Hellrider heritage and the muster rolls", k: ["history"] },
    { t: "the High Observer's rule and the Creed Resolute", k: ["religion", "history"] },
    { t: "the Chionthar barge-guilds and the river's pilots", k: ["invest", "nature"] },
    { t: "Fort Morninglord's ruin and its warning", k: ["history", "religion"] },
    { t: "the paladin patrols' relay stables", k: ["history", "invest"] },
    { t: "the barrow-kings of the Fields and the crowns still buried", k: ["history", "invest"] },
    { t: "the battlefield glass where dragonfire fused the loam", k: ["history", "nature"] },
    { t: "bone-pickers' guilds and the law against grave-iron", k: ["invest", "religion"] },
    { t: "the ghost-musters seen on old war anniversaries", k: ["religion", "history"] },
    { t: "Ulcaster's ruined school and its burnt lessons", k: ["arcana", "history"] },
    { t: "Gullykin and the halfling ferry-villages", k: ["history", "nature"] },
    { t: "the Zhent-Harper shadow war fought inn to inn", k: ["invest", "history"] },
    { t: "the slave-routes broken at the Bridge and the watchers since", k: ["invest", "history"] },
    { t: "the horse-changing stations and their remount barons", k: ["invest", "nature"] },
    { t: "the beacon hills between Berdusk and Iriaebor", k: ["history"] },
    { t: "the flooding of the Winding Water and the years it moves its bed", k: ["nature"] },
    { t: "the pilgrim badges of Boareskyr and their forgeries", k: ["invest", "religion"] },
    { t: "the drover clans and the grass-rights of the open Way", k: ["nature", "invest"] },
    { t: "the wyvern nests of the Sunsets and the bounty seasons", k: ["nature", "invest"] },
    { t: "the Zhent caravan 'insurance' and those who refused it", k: ["invest"] },
    { t: "the old Elturgard border stones pulled down and reset", k: ["history", "invest"] },
    { t: "the Lathander pilgrim-roads to the dawn shrines", k: ["religion", "invest"] },
    { t: "the Hill of Lost Souls and its battle-ghosts", k: ["history", "religion"] },
    { t: "the Battle of Bones and the dead that still muster there", k: ["history", "invest"] },
    { t: "the Marsh of Chelimber's lizardfolk and lost causeways", k: ["nature", "invest"] },
    { t: "Skull Gorge and the Darkhold road that runs it", k: ["invest", "history"] },
    { t: "the Forest of Wyrms and its green shadows", k: ["nature", "invest"] },
    { t: "the Serpent Hills and the ophidian ruins beneath", k: ["history", "invest"] },
  ],
  dessarin: [
    { t: "the four Elemental Cults and their prophets", k: ["religion", "arcana"] },
    { t: "the Haunted Keeps of the Sumber Hills", k: ["history", "invest"] },
    { t: "drowned Tyar-Besil beneath the valley", k: ["history", "arcana"] },
    { t: "Red Larch and the roads that cross there", k: ["invest", "history"] },
    { t: "the Dessarin's floods and the mills that read them", k: ["nature"] },
    { t: "Uthgardt cairns along the Stone Trail", k: ["religion", "nature"] },
    { t: "the Believers of Red Larch and their quiet rot", k: ["invest", "religion"] },
    { t: "the sinkhole under Red Larch's square", k: ["invest", "history"] },
    { t: "Lance Rock and the sign against plague on it", k: ["invest", "arcana"] },
    { t: "the necromancer of Lance Rock and his poor theater", k: ["invest", "arcana"] },
    { t: "Feathergale Spire and the knights who ride the winds", k: ["invest", "history"] },
    { t: "the Feathergale hunts and what they truly hunted", k: ["invest", "religion"] },
    { t: "Rivergard Keep and the river-pirates in crusader paint", k: ["invest", "history"] },
    { t: "the Scarlet Moon Hall and the druid-mummers' fire", k: ["invest", "religion"] },
    { t: "Sacred Stone Monastery and its stone-faced order", k: ["invest", "religion"] },
    { t: "the Black Earth's tremors under the Sumbers", k: ["invest", "nature"] },
    { t: "the Howling Hatred's whisper-recruiters on the roads", k: ["invest", "religion"] },
    { t: "the Crushing Wave's tithe of drowned cargo", k: ["invest", "religion"] },
    { t: "the Eternal Flame's burn-scars up the valleys", k: ["invest", "nature"] },
    { t: "Yartar's bridge and the Three Rivers trade", k: ["invest", "history"] },
    { t: "Beliard's cattle fairs and the drovers' law", k: ["invest", "nature"] },
    { t: "Westbridge and the Long Road's inn-keep gossip", k: ["invest"] },
    { t: "Amphail-bound horse thieves and the valley's watch", k: ["invest", "nature"] },
    { t: "the Stone Bridge's dwarven claim and the old rites there", k: ["religion", "history"] },
    { t: "Ironford and the fords the armies used", k: ["history"] },
    { t: "the Sumber Hills' dust-storms since the cults dug", k: ["nature", "invest"] },
    { t: "Tyar-Besil's dwarven doors and the cult-cut passages", k: ["history", "invest"] },
    { t: "the Fane of the Eye and the thing below the temples", k: ["religion", "arcana"] },
    { t: "the elder elemental eye's older names", k: ["religion", "arcana"] },
    { t: "the air cult's vulture aeries in the pinnacles", k: ["nature", "invest"] },
    { t: "the reavers' hulks sunk at Rivergard's boom", k: ["invest", "history"] },
    { t: "the Knights of Samular and Summit Hall", k: ["history", "religion"] },
    { t: "Summit Hall's vigil over the Sumbers", k: ["religion", "history"] },
    { t: "the Samular relics and the claims upon them", k: ["religion", "invest"] },
    { t: "the Long Road's mile-inns and their cellar secrets", k: ["invest"] },
    { t: "Old Gnawbone's spies among the valley's beasts", k: ["invest", "nature"] },
    { t: "the Halls of the Hunting Axe and the tomb-hoard tales", k: ["history", "invest"] },
    { t: "the Uthgardt Elk raids along the Dessarin's east", k: ["history", "invest"] },
    { t: "the ghost-lights over the Sumber tors", k: ["arcana", "nature"] },
    { t: "the mill-races rebuilt after the elemental floods", k: ["invest", "nature"] },
    { t: "the valley's granary levies and the hungry spring", k: ["invest", "history"] },
    { t: "the pack-trains over the Dessarin Hills to Triboar", k: ["invest"] },
    { t: "the caravan-master's black list of cursed fords", k: ["invest", "nature"] },
    { t: "the Sighing Valley and the vulture-winds above it", k: ["nature", "invest"] },
    { t: "the Weeping Colossus and the fire beneath Tyar-Besil", k: ["arcana", "invest"] },
    { t: "the Plunging Torrents of the drowned levels", k: ["nature", "invest"] },
    { t: "the Black Geode's crystal dark", k: ["arcana", "nature"] },
    { t: "Aerisi Kalinoth, the moon-elf prophet of air", k: ["invest", "history"] },
    { t: "Gar Shatterkeel and his crab-claw arm", k: ["invest", "nature"] },
    { t: "Vanifer, the flame-dancer prophet", k: ["invest", "history"] },
    { t: "Marlos Urnrayle and his medusa gaze", k: ["invest", "arcana"] },
  ],
};

// Region entries FIRST, the global pool filling the remainder of the d100 —
// his fill rule, verbatim. The rng is the caller's seeded stream.
export function rollLoreTopic(rng: () => number, regionId?: string | null): LoreTopic {
  const pool = ((regionId && ARCHIVE_LORE_BY_REGION[regionId]) || []).concat(ARCHIVE_LORE_GLOBAL).slice(0, 100);
  return pool[Math.floor(rng() * pool.length)];
}

// FRANK'S TITLE ENGINE (25 Jul), superseding yesterday's forty fixed titles: "roll one d6 —
// that determines the number of segments. Six tables... each a fragment that can be clipped
// together like Lego blocks, each table 1d12 options... compose them as we see fit to make a
// valid hierarchy." The hierarchy below is my delegated craft: table k is a grammatical ROLE,
// and each length uses a fixed slot-map so every roll reads as a title. The HOUSE is a table
// of its own (T5, form-keyed, 8 × 12) — a cavern's archive and a ship's still do not title
// alike — and the SEED carries house + shelf + subject, so every keep's every book is its own.
// Space: 12 + 144 + 1,728 + 20,736 + 248,832 + 2,985,984 = 3,257,436 titles per house per
// subject. No goat ever gets the same thing twice.
export const ARCHIVE_TITLE_SUBJECTS: readonly string[] = [           // T1 — stands alone at length 1; the sentence's subject after
  "The Standing Stones", "The Old Names", "The Deep Waters", "The Long Rolls",
  "The Patient Dead", "The Broken Seals", "The First Charters", "The Quiet Years",
  "The Iron Keys", "The Drowned Bells", "The Last Wardens", "The Unsigned Pages",
];
export const ARCHIVE_TITLE_VERBS: readonly string[] = [              // T2 — valid closing a title AND taking T3's object
  "Remember", "Keep", "Forget", "Answer", "Endure", "Return",
  "Whisper", "Count", "Bind", "Guard", "Burn", "Hold",
];
export const ARCHIVE_TITLE_OBJECTS: readonly string[] = [            // T3
  "the Flood", "the Old Accord", "the Ninth Winter", "the Kings' Debts",
  "the Hidden Door", "the First Fire", "the Salt Roads", "the Sleeping Court",
  "the Broken Year", "the Far Shore", "the Sealed Word", "the Long Dark",
];
export const ARCHIVE_TITLE_MANNERS: readonly string[] = [            // T4 — adverbial, closes a clause cleanly
  "in the Old Tongue", "by Candle-Light", "Against the Coming Dark", "Beneath the Ninth Stone",
  "Without Names", "Twice Over", "in the Warden's Hand", "After the Fire",
  "Under Seal", "for a Hundred Years", "in Fair Copy", "Between the Wars",
];
export const ARCHIVE_TITLE_HOUSE: Record<string, readonly string[]> = {   // T5 — the house's own voice, comma-borne
  keep:   [", from the Muster-Rolls", ", by the Wall's Count", ", as the Garrison Tells It", ", in the Siege Ledgers", ", from the Watch-Reports", ", by Order of the Standing Wall", ", in the Armoury Hand", ", as the Sentries Swore", ", from the Despatch-Boxes", ", by the Postern Lamp", ", in the Old Watch-Bills", ", as the Keep Remembers"],
  tower:  [", from the High Shelves", ", as the Index Insists", ", in the Ninth Hand", ", by the Unguttering Lamp", ", from the Restricted Stair", ", as the Wards Allow", ", in a Cipher Half-Solved", ", by the Tower's Own Reckoning", ", from the Locked Folio", ", as the Margins Warn", ", in the Apprentice Copies", ", by Starlight and Errata"],
  manor:  [", from the Estate Rolls", ", in the Family Hand", ", by the Steward's Count", ", as the Portraits Have It", ", from the Deed-Boxes", ", in the Morning-Room Copies", ", by the Third Case", ", as Great-Grandmother Wrote It", ", from the Ribboned Years", ", in the Library Catalogue", ", by Lamplight Below Stairs", ", as the House Prefers"],
  cavern: [", from the Dry Galleries", ", by the Deep Lamp", ", in the Stone-Cut Hand", ", as the Seep-Maps Show", ", from the Down-Delved Years", ", by the Shaft's One Light", ", in Vellum That Outlasts", ", as the Miners Attest", ", from the Lightless Shelves", ", by the Mountain's Leave", ", in the First Gallery", ", as the Rock Keeps It"],
  ruin:   [", from What the Fall Spared", ", in the Older Ink", ", by the Survivor Door", ", as the Gaps Confess", ", from the Scorched Boxes", ", in Two Ages of Hand", ", by the Relit Lamp", ", as the Salvage Ranks It", ", from the Reunited Files", ", in the Founder's Fragments", ", by Patient Reconstruction", ", as the House Once Knew"],
  grove:  [", from the Waxed Chests", ", by the Green Lamp", ", in the Grove's Keeping", ", as the Leaves Press It", ", from the Dry Bower", ", by the Clearing's Light", ", in Sap-Sealed Copies", ", as the Wood Remembers", ", from the Living Shelves", ", by the Turning Seasons", ", in the Warden-Tree's Shade", ", as the Green Allows"],
  vessel: [", from the Lazarette", ", by the Binnacle Lamp", ", in the Log's Steady Hand", ", as the Manifests Swear", ", from Three Oceans' Keeping", ", by the Master's Key", ", in Oilskin and Order", ", as the Tide-Tables Run", ", from the Dogged Chests", ", by Dead Reckoning", ", in the Fleet's Fair Copy", ", as the Sea Never Learned"],
  hamlet: [", from the Parish Chest", ", in the Register Hand", ", by the Vestry Lamp", ", as the Green Recalls", ", from the Tithe-Maps", ", by the Warden's Two Keys", ", in the Schoolmaster's Copy", ", as the Sexton Tells It", ", from the Boundary Rolls", ", by the Church-Door Notice", ", in the Turning Year", ", as the Village Keeps It"],
};
export const ARCHIVE_TITLE_FLOURISH: readonly string[] = [           // T6 — the closing dash
  " \u2014 Annotated", " \u2014 the Fair Copy", " \u2014 as the Warden Kept It", " \u2014 Half Recovered",
  " \u2014 with Marginalia", " \u2014 in Three Parts", " \u2014 Read Aloud but Once", " \u2014 the Second Redaction",
  " \u2014 Bound in Grey", " \u2014 for Those Who Come After", " \u2014 Against Forgetting", " \u2014 Complete at Last",
];

// FRANK (25 Jul, second ruling): "Rath should receive books whose titles point to events in
// the Moonsea and famous people of that region, written in a way to fit books that would appear
// in a fortified keep." So the CHRONICLE LANE: his two systems shaking hands — the d100 lore
// pool supplies the canon (events, famous people, wiki-sourced per Q20), the frame dozen binds
// it the way a library actually titles an account, and the house table keeps the register.
// "A True Relation of the ruin of Zhentil Keep, from the Watch-Reports — Half Recovered."
// The frame table is the chronicle lane's own d12, an extension beside his six — his to strike.
export const ARCHIVE_TITLE_FRAMES: readonly string[] = [
  "Concerning", "A True Relation of", "An Account of", "The Chronicle of",
  "A Gazetteer of", "Annals of", "The Matter of", "Notes upon",
  "An Inquiry into", "The Reckoning of", "Observations upon", "A History of",
];

// One title, up to seven dice: 1d6 for length, then a d12 per slot. The rng is the caller's —
// seed with house + shelf + subject and the same keep's same book is always the same book.
// opts.topic FORCES the chronicle lane onto that topic (the week's own study); opts.topics
// offers the region's pool, taken two rolls in three; no opts is the abstract lane, unchanged.
export function composeArchiveTitle(rng: () => number, formId?: string, opts?: { topic?: string; topics?: readonly LoreTopic[] }): string {
  const d = (t: readonly string[]) => t[Math.floor(rng() * t.length)];
  const len = 1 + Math.floor(rng() * 6);
  let topic = (opts && opts.topic) || "";
  if (!topic && opts && opts.topics && opts.topics.length && Math.floor(rng() * 3) < 2) {
    topic = opts.topics[Math.floor(rng() * opts.topics.length)].t;      // two in three chronicle the region
  }
  if (topic) {
    let out = d(ARCHIVE_TITLE_FRAMES) + " " + topic;
    if (len >= 4) out += d(ARCHIVE_TITLE_HOUSE[formId || "keep"] || ARCHIVE_TITLE_HOUSE.keep);
    if (len >= 6) out += d(ARCHIVE_TITLE_FLOURISH);
    return out;
  }
  let out = d(ARCHIVE_TITLE_SUBJECTS);
  if (len >= 2) out += " " + d(ARCHIVE_TITLE_VERBS);
  if (len >= 3) out += " " + d(ARCHIVE_TITLE_OBJECTS);
  if (len >= 4) out += " " + d(ARCHIVE_TITLE_MANNERS);
  if (len >= 5) out += d(ARCHIVE_TITLE_HOUSE[formId || "keep"] || ARCHIVE_TITLE_HOUSE.keep);
  if (len >= 6) out += d(ARCHIVE_TITLE_FLOURISH);
  return out;
}


// ============================================================================
// LIBRARY BOOK GENERATION — title + the chained, tag-drifting three-fact paragraph.
// The title reuses the Archive's HOUSE voice + FLOURISH (shared registers) but its own library
// FRAMES; the frame's genre selects the connective sentence. The paragraph is the machine Frank
// designed (29 Jul): a seeded chain that drifts along shared aspect tags so it reads like a writer
// expanding one thread of the subject, never a non-sequitur.
// ============================================================================
import { LIBRARY_SUBJECTS, LIBRARY_TITLE_FRAMES, LIBRARY_CONNECTIVES } from "./library_subjects";
import type { LibrarySubject, LibraryFact } from "./library_subjects";

// A library book's title. Seeded by the caller (keep + shelf + subject + week) so the same book is
// always the same book. Returns { title, genre } — the genre rides through to the paragraph so voice
// and title agree.
export function composeLibraryTitle(rng: () => number, subjectLabel: string, formId?: string): { title: string; genre: string } {
  const d = <T,>(t: readonly T[]): T => t[Math.floor(rng() * t.length)];
  const len = 1 + Math.floor(rng() * 6);
  const frame = d(LIBRARY_TITLE_FRAMES);
  // Avoid a double article: a frame ending in "of" followed by a subject starting with "The"
  // ("...of The Ring of Winter") reads better with the leading article dropped ("...of the Ring of
  // Winter"). Lower-case it rather than cut it, so the article survives mid-title.
  const subj = /\bof$/.test(frame.text) ? subjectLabel.replace(/^The /, "the ") : subjectLabel;
  let out = frame.text + " " + subj;
  if (len >= 4) out += (ARCHIVE_TITLE_HOUSE[formId || "keep"] || ARCHIVE_TITLE_HOUSE.keep)[Math.floor(rng() * (ARCHIVE_TITLE_HOUSE[formId || "keep"] || ARCHIVE_TITLE_HOUSE.keep).length)];
  if (len >= 6) out += ARCHIVE_TITLE_FLOURISH[Math.floor(rng() * ARCHIVE_TITLE_FLOURISH.length)];
  return { title: out, genre: frame.genre };
}

// The chained draw. Roll #1 free; its tags seed the thread. Roll #2 from the pool that shares >=1
// tag with #1 (preferring #1's PRIMARY, accepting a shared SECONDARY — the drift); roll #3 sharing
// >=1 tag with #2. If a constrained pool runs dry, widen to any remaining fact of the subject (still
// on-subject, just a looser association) so the chain never fails. Then the genre connective closes
// it. Returns the stitched paragraph.
function factTags(f: LibraryFact): string[] { return [f.p].concat(f.s || []); }
function shareTag(a: LibraryFact, b: LibraryFact): boolean { const A = new Set(factTags(a)); return factTags(b).some((x) => A.has(x)); }

export function composeLibraryParagraph(rng: () => number, subject: LibrarySubject, genre: string): string {
  const facts = subject.facts || [];
  if (!facts.length) return "";
  const pick = <T,>(pool: T[]): T => pool[Math.floor(rng() * pool.length)];
  const used = new Set<number>();
  const take = (candidates: number[]): number => {
    const avail = candidates.filter((i) => !used.has(i));
    const pool = avail.length ? avail : facts.map((_, i) => i).filter((i) => !used.has(i));
    const idx = pick(pool);
    used.add(idx);
    return idx;
  };
  // #1 — free
  const i1 = take(facts.map((_, i) => i));
  const f1 = facts[i1];
  // #2 — prefer the seed's PRIMARY tag, then any shared tag (the drift)
  const primaryPool = facts.map((_, i) => i).filter((i) => !used.has(i) && factTags(facts[i]).includes(f1.p));
  const sharedPool = facts.map((_, i) => i).filter((i) => !used.has(i) && shareTag(f1, facts[i]));
  const i2 = take(primaryPool.length && Math.floor(rng() * 3) < 2 ? primaryPool : (sharedPool.length ? sharedPool : facts.map((_, i) => i)));
  const f2 = facts[i2];
  // #3 — chain off #2's tags
  const chainPool = facts.map((_, i) => i).filter((i) => !used.has(i) && shareTag(f2, facts[i]));
  const i3 = take(chainPool.length ? chainPool : facts.map((_, i) => i));
  const f3 = facts[i3];
  // connective — voice tied to the title's genre
  const conns = LIBRARY_CONNECTIVES[genre] || LIBRARY_CONNECTIVES.account;
  const conn = conns[Math.floor(rng() * conns.length)];
  return [f1.t, f2.t, f3.t, conn].join(" ");
}

// Is there a Library subject deep enough to write a real book about? (Falls back gracefully if not.)
export function librarySubjectFor(key?: string): LibrarySubject | null {
  if (!key) return null;
  return LIBRARY_SUBJECTS[key.toLowerCase()] || null;
}
export function anyLibrarySubject(rng: () => number): LibrarySubject | null {
  const keys = Object.keys(LIBRARY_SUBJECTS);
  return keys.length ? LIBRARY_SUBJECTS[keys[Math.floor(rng() * keys.length)]] : null;
}

// Book-shelf capacity, size-scaled (Frank, 29 Jul). Archive base 10, Library base 20 (double). Every
// size tier up DOUBLES the cap (cramped→roomy→vast = ×1, ×2, ×4). Special facilities are DMG
// size-locked, so in practice each sits at its own tier's cap unless it can be resized — the scaling
// simply resolves to the facility's actual size. Non-shelving facilities return 0.
// BUGFIX (Frank, 31 Jul): the base is the cap AT THE FACILITY'S OWN STARTING SIZE, not at cramped.
// The old version indexed the tier from `cramped` regardless of what size the room actually starts
// at — and since both shelving facilities are printed `roomy`, every keep in the game was running
// one tier high: Archive 20 where it should hold 10, Library 40 where it should hold 20. The tier is
// now measured as the DISTANCE ENLARGED from the printed space, so a room that has not been enlarged
// always sits exactly on its base.
export function bookShelfCap(defId: string, size?: string): number {
  const base = defId === "archive" ? 10 : defId === "library" ? 20 : 0;
  if (!base) return 0;
  const SIZES = ["cramped", "roomy", "vast"];
  const printed = ((BASTION_FACILITIES[defId] || {}).space as string) || "roomy";
  const tier = Math.max(0, SIZES.indexOf(size || printed) - SIZES.indexOf(printed));
  return base * Math.pow(2, tier);
}

// ⚠ AND THE CHOSEN-HIRE ENTITLEMENTS BELONG HERE (Frank, 2 Aug). He asked whether the toggle only
// appears once a character sets their subclass — and it does, and **nothing in the app can set one.**
// `subclass` was read in three places and written in none.
//
// The reason is a design principle already written down in `bastion/ui.tsx`, which I walked straight
// past when I added the field:
//
//   *"This app holds `cls` as a bare string and no subclass, BECAUSE IT IS NOT A CHARACTER SHEET.
//    So the player says, and the DM checks."*
//
// **I built a parallel mechanism instead of using the one that exists.** These are declarations in
// exactly the same shape as the focus and expertise prereqs: the player asserts, the DM verifies at
// the table, and the app never pretends to know a character sheet it cannot see.
export const CHOSEN_HIRE_PREREQS: Record<string, { id: string; short: string; text: string; ask: string; pools: string[] }> = {
  raise_dead: {
    id: "raise_dead", short: "Command of the risen",
    text: "Can raise or command undead as a class feature \u2014 a necromancer, an Oathbreaker, a Death or Grave cleric",
    ask: "Does this character raise or command undead as a feature of their class?",
    pools: ["undead_lesser", "undead_greater"],
  },
  fiend_pact: {
    id: "fiend_pact", short: "A pact with a fiend",
    text: "Bound to a devil or an archdevil by pact",
    ask: "Is this character's patron a fiend?",
    pools: ["fiends"],
  },
  fey_pact: {
    id: "fey_pact", short: "A pact with an archfey",
    text: "Bound to an archfey by pact",
    ask: "Is this character's patron an archfey?",
    pools: ["fey"],
  },
  aberrant_pact: {
    id: "aberrant_pact", short: "A pact with something older",
    text: "Bound to a Great Old One, or carrying an aberrant mind",
    ask: "Is this character's power drawn from a Great Old One or an aberrant source?",
    pools: ["aberrations"],
  },
  genie_pact: {
    id: "genie_pact", short: "A genie's word",
    text: "Bound to a genie, or otherwise able to command elementals",
    ask: "Is this character's patron a genie?",
    pools: ["elementals"],
  },
  makes_constructs: {
    id: "makes_constructs", short: "Makes things that walk",
    text: "Builds or commands constructs \u2014 an artificer, a Clockwork Soul",
    ask: "Does this character build or command constructs as a feature of their class?",
    pools: ["constructs"],
  },
  fey_touched: {
    id: "fey_touched", short: "Known to the fey",
    text: "Sworn to, marked by, or otherwise known to the Feywild \u2014 an Oath of the Ancients paladin, a Fey Wanderer, a Circle of Dreams druid, a College of Glamour bard",
    ask: "Is this character known to the fey?",
    pools: [],   // a PULL rather than a pool: see feyAffinity
  },
};

export const BASTION_PREREQS: Record<string, any> = {
  spell_focus:  { id: "spell_focus",  short: "Spellcasting Focus",
                  text: "Can channel spells through a focus of some kind",
                  ask: "Can this character use a Spellcasting Focus?" },
  arcane_focus: { id: "arcane_focus", short: "Arcane Focus",
                  text: "Channels arcane magic through a focus \u2014 a rod, staff, wand, orb, crystal, or a tool they work through",
                  ask: "Can this character use an Arcane Focus — or a tool — as a Spellcasting Focus?",
                  implies: ["spell_focus"] },
  holy_focus:   { id: "holy_focus",   short: "Holy Symbol or Druidic Focus",
                  text: "Channels magic through a holy symbol or a druidic focus",
                  ask: "Can this character use a Holy Symbol or a Druidic Focus as a Spellcasting Focus?",
                  implies: ["spell_focus"] },
  expertise:    { id: "expertise",    short: "Expertise",
                  text: "Expertise in a skill",
                  ask: "Does this character have Expertise in a skill?" },
  martial:      { id: "martial",      short: "Fighting Style / Unarmored Defense",
                  text: "Trained to a fighting style, or fights well without armour on",
                  ask: "Does this character have a Fighting Style feature, or Unarmored Defense?" },
};

export const BASTION_SIZES = ["cramped", "roomy", "vast"];

export const BASTION_LIFE_TASK_COUNT = 12;   // a d12; more than the 7 days in a turn, so the household always has a choice

// DMG, "Adding Basic Facilities" — cost and time to add a basic facility, by space:
//   Cramped 500 GP / 20 days · Roomy 1,000 GP / 45 days · Vast 3,000 GP / 125 days
export const BASTION_FACILITY_COST = { cramped: 500, roomy: 1000, vast: 3000 };

export const BASTION_FACILITY_DAYS = { cramped: 20, roomy: 45, vast: 125 };

// DMG, "Enlarging Basic Facilities" — a facility goes up ONE category at a time:
//   Cramped→Roomy 500 GP / 25 days · Roomy→Vast 2,000 GP / 80 days
// (These are exactly the differences of the add table above, so paying the difference is
//  arithmetically identical — but the table is what the book states, so the table is what I use.)
export const BASTION_ENLARGE = {
  "cramped>roomy": { gp: 500, days: 25 },
  "roomy>vast":    { gp: 2000, days: 80 },
};

export const BASTION_SIZE_INFO = {   // DMG, "Facility Space" — maximum area in 5-foot squares
  cramped: "Cramped — up to 4 squares (a 5-ft grid); the smallest footprint.",
  roomy:   "Roomy — up to 16 squares; the default for most special facilities.",
  vast:    "Vast — up to 36 squares; squares may be stacked over several storeys.",
};

export const DEFENDER_ROLES = ["Guard", "Archer", "Sentry", "Pikeman", "Crossbowman", "Warden", "Watchman", "Scout", "Halberdier", "Shieldbearer"];

export const BASTION_ORDER_FLAVOR = { craft: "tools rang in the workshop", harvest: "the grounds gave up their bounty", trade: "goods moved through the storehouse", research: "lamps burned late over open books", recruit: "new hands were taken on", maintain: "the keep was kept in quiet good order" };

// DMG, "All Is Well" (1d8) — the book's own slice-of-life table, verbatim in substance.
// Used as the fallback for a keep with no chosen form.
// A quiet week at a keep that has not decided what it is yet — the fallback when no form is chosen.
// ORIGINAL, and deliberately so: the DMG prints its own 1d8 for this and I don't use it, because I
// do not need to. Its eight rows were the last WotC compilation in this module and they were only ever
// [COPYRIGHT] a fallback for a case I can write better. Everything here is my own work.
//
// A d12, on the grounds that nothing else in this app rolls one and they deserve the outing.
//
// The thread: a place with no form is a place still becoming one. Every row is somebody deciding
// something small about what this house is going to be, without noticing they are deciding it.
export const BASTION_ALL_IS_WELL = [
  "The roof stopped leaking. Nobody admits to fixing it, in case it starts again and they're held to it.",
  "A dog turned up. It has been fed twice now, which everyone understands is binding.",
  "Somebody hung a picture. Nobody has said anything about the picture. It is still up.",
  "The well came in sweeter this week than last, and two people have separately claimed credit.",
  "An argument about where the table should go was settled, and the table is back where it started.",
  "A stranger asked directions at the gate, was given them, and went on. That was the whole of it.",
  "The bread went wrong in a way that turned out better, and now that's how the bread is made here.",
  "Somebody's boots were filled with something unspeakable. The culprit is known and is not being named.",
  "A letter came for a name nobody here recognises. It is on the shelf, unopened, waiting to be somebody's.",
  "Two of the household stopped speaking, and then didn't, and nobody outside the two of them knows why.",
  "The place was quiet enough this week that people started calling the rooms by names. They're sticking.",
  "Nothing happened. Somebody remarked on it, and everyone else was quietly, faintly, superstitiously cross.",
];

// ================================================================================================
//  BASTION_FOUND_COIN — "the sapling dollar"
//  ------------------------------------------------------------------------------------------------
//  PROVENANCE / WHY THIS EXISTS. This is a deliberately silly feature and it has no rules basis —
//  it is here because of a thing that actually happened, and the author wanted to remember it.
//
//  While working in the yard, digging up a tree sapling that had come up somewhere it had no
//  business growing, the ground produced a dollar. An actual dollar, in the dirt, under a plant
//  that shouldn't have been there. No explanation. It just happened.
//
//  It became the standing answer to anyone who complains that randomly-spawned treasure is
//  unrealistic: the real world is LOSSY. People drop and bury and forget things; roots and frost
//  and water push old coins back up. Value doesn't only sit where someone deliberately put it. A
//  provenance-free coin coming out of the ground is the world being honest about its own history —
//  which, for a project all about a ledger that accounts for where everything came from, is a
//  pleasing little joke: the yard minted an item and signed nobody's name to it. verified: false.
//
//  So this is not meant to be lucrative or balanced. It is meant to feel like a small prize — the
//  tiny jolt of "I found money." That is the whole design goal, and everything below serves it:
//  low chance, trivial amount, but a varying roll so it lands like a win.
//  ------------------------------------------------------------------------------------------------
//  A low, independent chance layered on top of the quiet week: while going about the ordinary work
//  of the keep, someone turns up a little loose silver. Kept OUT of the d12 flavour table on purpose
//  — that table is a real die and its length is asserted (a d12 rolls 1..12, not 1..13). This is a
//  separate roll, so "a quiet week" and "found some coin" are independent events, and it stays rare.
//
//  1d4 SILVER, not a fixed piece: still nothing mechanically (under half a gold), but a varying
//  little prize feels like a win rather than a stipend. 1 sp = 0.1 gp (a gold piece is worth ten,
//  so the real-world dollar that started all this is one SILVER, not one gold).
//
//  The reward is reported as its OWN universal sentence, APPENDED after whatever quiet-week flavour
//  rolled — so the coin reads the same however it arrives, and the flavour stays free to be anything.
// ================================================================================================
export const BASTION_FOUND_COIN = {
  chance: 0.05,                                    // one quiet week in twenty turns up a little silver
  dice: () => 1 + Math.floor(Math.random() * 4),   // 1d4 silver pieces
  // {n} is the rolled count; the sentence pluralises. Universal — it fits any quiet week.
  line: (n) => "While in the ordinary performance of their duties, someone discovers " + n + " silver piece" + (n === 1 ? "" : "s") + " in the dirt. It's not much. It still counts as a good day.",
};

// A week at the keep with the master away. Nothing is earned here and nothing is risked —
// the household is simply allowed to have a life. One 1d10 table per bastion form, because a
// wizard's tower goes quiet differently than a ship does.
// (House content, not a rules table — it decides nothing.)
export const BASTION_SLICE_OF_LIFE = {
  keep: [
    "The gate-warden taught the cook's boy to hold a spear properly. He is insufferable about it now.",
    "Rain all week. Someone finally admitted which hall has the leak, and it was not the one everyone blamed.",
    "A merchant's cart threw a wheel at the gate. They stayed two nights and left a very good cheese.",
    "The garrison ran drills in the yard until the flagstones were slick, then ran them again.",
    "An old soldier came looking for a bed. Nobody could place him, but everyone remembered him leaving.",
    "The banner came down for mending. It looks better than it has in years, and slightly smaller.",
    "Two of the watch have stopped speaking to each other. Nobody will say why, and both work harder for it.",
    "A hawk took up residence on the gatehouse. It has been named, which means it is staying.",
    "The well ran cloudy for a day and then cleared. The cook boiled everything anyway, loudly.",
    "Quiet. Genuinely quiet. The kind of week that only happens when you are somewhere else.",
  ],
  tower: [
    "Something in the lower stacks has been rearranging itself alphabetically. The apprentice denies it.",
    "A minor experiment escaped and was recaptured. It is fine. Everything is fine.",
    "The lantern on the top floor burned green for two nights running. Nobody wrote it down.",
    "A rival's messenger arrived, was given tea, and left without asking what he came to ask.",
    "The stairs were counted three times this week. Three different totals.",
    "An owl has learned to knock. The staff have started knocking back.",
    "Dust everywhere. Something was cast in the observatory and now the dust hangs an inch off the floor.",
    "A student came to be taken on, waited a full day unasked, and was hired for exactly that.",
    "The wards hummed on Thirdday for no reason anyone could find. They stopped when spoken to.",
    "Someone reshelved the grimoires by colour. It is beautiful. It is useless. It has been left alone.",
  ],
  manor: [
    "The gardener and the cook are feuding over the herb beds. The food has never been better.",
    "A neighbour called uninvited and stayed for supper. She was, everyone agrees, delightful.",
    "The good silver came out for no occasion at all. The staff ate off it. Nobody will confirm this.",
    "A window was broken by a ball. The culprit confessed before anyone thought to ask.",
    "The hall was rearranged, admired, and quietly put back the way it was.",
    "A letter arrived for a name nobody recognises. It sits on the mantel, waiting.",
    "There was dancing in the kitchen on the night it rained. There is no further comment.",
    "The hedges were cut into shapes. One of them is unmistakably you. It is not flattering.",
    "A cat arrived. There is no record of a cat being acquired. The cat is now on the payroll.",
    "Nothing happened, beautifully, for seven straight days.",
  ],
  cavern: [
    "The deep passage sang for an hour on Fourthday. Everyone agreed not to investigate.",
    "Fresh water broke through in the low chamber. It is cold and clean and tastes faintly of iron.",
    "The mushrooms went luminous. The staff have stopped lighting that corridor entirely.",
    "Something knocked from the far side of the sealed wall. Twice. Then it stopped, politely.",
    "A vein of something bright was found, admired, and left exactly where it was.",
    "The echo came back wrong from the third chamber. It has since come back right.",
    "A blind fish was caught, named, and released. Twice. Possibly a different fish.",
    "The stone sweated for two days. The old miner says that means weather. Above ground. Somehow.",
    "Someone has been leaving small cairns where the tunnels fork. Nobody admits to it, but nobody's lost.",
    "Warm. Dry. Silent. The best week the warren has had in a season.",
  ],
  ruin: [
    "Another room was cleared. Nobody wants to talk about what was swept out of it.",
    "The old carvings were washed. Half a name emerged. Only half.",
    "A wall that was going to be knocked through was, on reflection, left alone.",
    "Scholars came to look. They were given tea and shown the boring parts.",
    "The floor gave way in the east vault. Below it: a smaller, older floor.",
    "Ivy pulled off the north face and took a fresco with it. Everyone is upset about it.",
    "Something old and harmless has been sleeping in the rubble. It has been left a blanket.",
    "The staff have started using the old names for the rooms. They came from nowhere.",
    "A coin was found in the mortar. It is from a mint that does not exist.",
    "The place stood, as it has for centuries, entirely without your help.",
  ],
  grove: [
    "The bees swarmed and settled somewhere better. Nobody moved them; they simply chose.",
    "A stag stood at the treeline for most of a morning, watching the house, and then didn't.",
    "First frost. Everything the frost was going to take, it took. The rest is hardier for it.",
    "The old oak dropped a limb across the path. It has been left. The path goes around now.",
    "Someone hung ribbons in the branches. The staff blame the children. There are no children.",
    "The spring ran high and sweet all week. Everything green got greener.",
    "Two owls argued nightly. It has been decided they are married.",
    "A traveller slept under the eaves and left a carved bird on the doorstep as thanks.",
    "Mushrooms came up in a ring overnight. Nobody stepped in it. Nobody discussed why.",
    "The grove did what groves do, which is everything, slowly, without asking.",
  ],
  vessel: [
    "The tide came in wrong on Fifthday. The old hand says that happens. Nobody believes her.",
    "Barnacles scraped, hull tarred, and the whole crew smells of it a week later.",
    "A gull has claimed the mast. Attempts to unclaim it have gone badly for everyone but the gull.",
    "The rigging sang all night in a fair wind. Nobody slept. Nobody minded.",
    "Something big passed under the keel and kept going. It was, everyone insists, a whale.",
    "A bottle washed up against the hull. Empty. Corked. Empty.",
    "The cook caught more than the crew could eat and salted the difference, smugly.",
    "Sea-fog for three days. The bell was rung on the hour, every hour, by hand.",
    "The deck was holystoned white for no reason but pride.",
    "Calm water, full stores, and not one thing to report. The best kind of week aboard.",
  ],
};

export const BASTION_QUIET_FLAVOR = ["A quiet week — smoke curled from the chimneys and little else stirred.", "The hirelings went about their duties without incident.", "Nothing untoward; the keep simply ran as a keep should.", "An uneventful stretch — the halls calm, the larder stocked."];

// DMG, "Bastion Events" (d100). Weights are the book's ranges, verbatim:
//   01–50 All Is Well · 51–55 Attack · 56–58 Criminal Hireling · 59–63 Extraordinary Opportunity
//   64–72 Friendly Visitors · 73–76 Guest · 77–79 Lost Hirelings · 80–83 Magical Discovery
//   84–91 Refugees · 92–98 Request for Aid · 99–00 Treasure
// ---- THE EVENT TABLE ---------------------------------------------------------------------------
// EXCHANGE. These are not the DMG's weights and they are not meant to be.
//
// WHY NOT: the DMG's 50/5/3/5/9/4/3/4/8/7/2 is calibrated for ONE roll, on a Maintain order, per
// character. This app rolls on ACTIVE turns, PER ROOM, on purpose — an AL DM has four hours, six
// players and a module, and is never rolling bastion events for six keeps. That gap is the product.
// But it means the DMG's distribution is tuned for a trigger that does not exist here: under it, a
// six-room working keep is quiet 1.4% of weeks. That is not their design surviving into this system;
// that is their numbers producing something they never intended.
//
// SO THE WEIGHTS ARE DERIVED FROM HISTORY. Four sources, three countries, two centuries:
//   1. The Household Book of Dame Alice de Bryene, Acton Hall, Suffolk, 1412-13. Her steward logged
//      every guest, every day, for a year: 16,500 meals = 45/day against a household of 25. About
//      TWENTY GUESTS A DAY, every day. New Year's Day: 300. A manor was never quiet, and inns barely
//      existed outside towns — the manor WAS the inn. Hence visitors 17 and guest 11, not 9 and 4.
//   2. The Paston Letters, Norfolk, c.1440-1500. The most-attacked gentry family in the record —
//      contested titles, Wars of the Roses, no royal peace. FOUR sieges (Gresham 1450, Hellesdon and
//      Drayton 1465, Caister 1469) across ~5 properties in ~50 years = 1.6% per property-YEAR.
//   3. Zmora, "State and Nobility in Early Modern Germany": 278 Franconian feuds, mainly 1460-1520.
//      ~4.6/year across a region of several hundred noble seats = ~1.5% per seat-YEAR. An INDEPENDENT
//      dataset, different country, different century, different record type — and it lands within 5%
//      of the Paston rate. Two sources converging is why the siege is rare here.
//   4. The Anglo-Scottish Border, c.1300-1600. The one place in the record with SUBSISTENCE raiders
//      rather than claimants, and the response was architectural: everyone built a peel tower. A
//      Realms frontier bastion is a peel tower. Acton Hall is not the model; Caister is not the model.
//
// THE HOSTILE ROW IS SPLIT IN THREE, because the DMG's single "Attack" was doing two jobs:
//   attack   3  the SIEGE. Somebody powerful wants the PLACE. Political, decisive, rare. 6 dice.
//                (the dice are inline here, not BASTION_ATTACK_DICE: this table is declared ~700
//                 lines above those constants, and a const reference across that gap is a temporal
//                 dead zone that throws at module init. esbuild compiles it without a murmur.)
//   raiders  6  goblins want the GRAIN, and will want it again next month. Border rate. 2 dice.
//   standoff 5  they came, looked at the walls, and left. 0 dice. NOBODY DIES.
// The standoff is the Paston finding made mechanical: Caister was two months of cannon for ONE dead
// servant, and "nearly all of the confrontations ended with few injuries and certainly no deaths."
// It also fixes something the dice cannot: per-room scaling makes a six-room siege 36d6, which is
// 99.9% lethal — the bloodless outcome is mathematically extinct at any keep worth having. A standoff
// EVENT does not care how many rooms you have. It locks the keep, runs the clock, lands the beats,
// and everyone lives.
//
// MEASURED at these weights, through this reducer, per week the player actually sees:
//   rooms  somebody came   dice rolled   standoff ran   quiet
//     1        20%             12%           8%          23%
//     4        40%             24%          15%           0.3%
//     6        53%             33%          21%           0%
// A working keep is never quiet — Acton Hall never was either. Half its weeks have somebody at the
// gate and a fifth of those end with everyone alive. That is a frontier. It is not a war.
//
// THE BASELINE IS THE SWORD COAST, notionally: a settled region, on a road, with a lord who mostly
// keeps the peace and hills he does not go into. Every named region is a MULTIPLIER on this table
// (see BASTION_REGIONS) — Cormyr is about x0.6 on the hostile rows, a season at war is about x2, and
// neither needs new machinery because rollBastionEvent normalises the pool at roll time. Weights are
// RELATIVE, not percentages: add a row and every other share re-computes itself.
export const BASTION_EVENTS = [
  { id: "allwell",     label: "All Is Well",               weight: 28, hostility: "neutral",  purse: "none",   effect: "allwell",     note: "A week where nothing needed deciding." },
  { id: "visitors",    label: "Friendly Visitors",         weight: 17, hostility: "friendly", purse: "gold",   effect: "visitors",    note: "Travellers who paid for the use of the place, because there was nowhere else to stop." },
  { id: "guest",       label: "Guest",                     weight: 11, hostility: "friendly", purse: "gold",   effect: "guest",       note: "Somebody stayed. Hospitality was never optional \u2014 DMG: one of the four kinds \u201Coffers you a gift of 1d6 x 100 GP\u201D." },
  { id: "opportunity", label: "Extraordinary Opportunity", weight:  9, hostility: "friendly", purse: "levies", effect: "opportunity", note: "The chance to be spoken of. It wants money and an answer." },
  { id: "aid",         label: "Request for Aid",           weight:  8, hostility: "neutral",  purse: "gold",   effect: "aid",         note: "A rider at the gate. The house owes service and everyone knows it." },
  { id: "raiders",     label: "Raiders",                   weight:  6, hostility: "hostile",  purse: "none",   effect: "raiders",     dice: 2, note: "Somebody hungry came for the storehouse. They will be back." },
  { id: "criminal",    label: "Criminal Hireling",         weight:  6, hostility: "neutral",  purse: "levies", effect: "criminal",    note: "Somebody's past caught up with them at your gate. A bribe of 1d6 x 100 gp keeps them." },
  { id: "lost",        label: "Lost Hirelings",            weight:  6, hostility: "neutral",  purse: "none",   effect: "lost",        note: "A post emptied. People leave; it is what people do." },
  // hostility "friendly" is not decoration here, it is the DMG's own sentence: refugees "stay until you
  // find them a new home OR A HOSTILE FORCE ATTACKS YOUR BASTION." The hostile filter IS that rule.
  // And they pay: "The refugees offer you 1d6 x 100 GP as payment for your hospitality and protection."
  { id: "refugees",    label: "Refugees",                  weight:  6, hostility: "friendly", purse: "gold",   effect: "refugees",    note: "People arrived with nothing, because somewhere else went wrong. They pay what they have for the walls." },
  { id: "standoff",    label: "Armed Men at the Gate",     weight:  5, hostility: "hostile",  purse: "none",   effect: "standoff",    dice: 0, note: "Somebody came for the place, in numbers, and stood there. Nothing was decided. They went away." },
  // purse "item", not "gold": DMG, Magical Discovery — "your hirelings discover or accidentally
  // create an Uncommon magic item of your choice AT NO COST TO YOU." It is a payout, but it is not
  // COIN, and it was competing for the same slot as one. When it won, it blocked a real gold payout
  // and the week netted nothing — about 13% of weeks at six rooms. An item and a purse are different
  // things: one you might sell, one you might drink before the next session.
  { id: "discovery",   label: "Magical Discovery",         weight:  4, hostility: "neutral",  purse: "item",   effect: "discovery",   note: "Nobody will say whether they found it or made it." },
  { id: "attack",      label: "Attack",                    weight:  3, hostility: "hostile",  purse: "none",   effect: "attack",      dice: 6, note: "Somebody came for the place with weapons, and did not take it." },
  { id: "treasure",    label: "Treasure",                  weight:  2, hostility: "neutral",  purse: "gold",   effect: "treasure",    note: "Something turned up that was worth money." },
];

// DMG, "Defensive Walls": "Each 5-foot square of defensive wall takes 10 days to build and costs 250 GP."
// I sell walls as one finished ring rather than square-by-square, so my flat price is an
// APP SIMPLIFICATION of a per-square rule: 20 squares (a small ring) x 250 gp.
export const BASTION_WALLS_GP_PER_SQUARE = 250;

export const BASTION_WALLS_DAYS_PER_SQUARE = 10;

export const BASTION_WALLS_SQUARES = 20;                                     // the ring the app builds

export const BASTION_WALLS_COST = BASTION_WALLS_GP_PER_SQUARE * BASTION_WALLS_SQUARES;   // 5,000 gp

// …and the same ring costs the same TIME. The DMG prices walls in gold AND days per square; this
// app was charging only the gold. A wall you can raise between heartbeats isn't a wall.
// The ALPG's first-build allowance explicitly covers "basic facilities, FEATURES, or enlarge" —
// and the DMG files Defensive Walls under Bastion Map features, beside closets and corridors.
// So the allowance may pay for the ring while the first build is open; after that it takes real days.
export const BASTION_WALLS_DAYS = BASTION_WALLS_DAYS_PER_SQUARE * BASTION_WALLS_SQUARES;  // 200 days

export const BASTION_ATTACK_DICE = 6;         // DMG: an Attack rolls 6d6, one defender dies per 1…

export const BASTION_ATTACK_DICE_WALLED = 4;  // …reduced to 4d6 when Defensive Walls fully encircle the keep

// DMG, Barrack: "furnished to serve as sleeping quarters for up to twelve Bastion Defenders" —
// and a Barrack is printed Roomy, so a Cramped Barrack does not exist and has no capacity. The
// only way up is the book's own enlargement: "A Vast Barrack can accommodate up to twenty-five."
// Whitelist, not blacklist: a size that isn't in this table houses nobody.
// ═══════════════════════════ LAYER 1 · THE INDIVIDUAL ══════════════════════════════════════════
// Frank's social design, phase 1: a person carries PERSONAL DATA ONLY. Relationships are their own
// objects between two people (Layer 2); nothing about who somebody IS lives in a relationship.
//
// THE CONSTRAINT THAT DECIDED THE SHAPE. There are ~84 references across 72 table rows keyed to six
// NAMED traits — REACTION_TO, every facility's own `reactions` voice, PATROL_SENTIMENT. Replacing
// named traits with a scalar profile would orphan all of it in one commit: every room would lose the
// voice it was written with, and the household week would go quiet.
//
// **So the scalars are the model and the named tags are DERIVED FROM THEM.** A person has a
// personality profile; `traitsOf()` reads that profile and hands back the tag vocabulary the existing
// content already speaks. Nothing written this year breaks, and everything written next year can use
// the numbers. The tags become a VIEW of the person rather than the person.
//
// ---- THE PROFILE ------------------------------------------------------------------------------
// Nine axes, each 0-100, rolled on a bell rather than flat: a household of extremes is a cartoon, and
// most people are middling at most things. `rollProfile` sums three draws, which puts ~68% of people
// between 33 and 67 and makes a 90 genuinely notable.
export const PROFILE_AXES = [
  "extroversion", "agreeableness", "conscientiousness", "openness",
  "stability", "ambition", "honor", "prejudice", "romantic",
] as const;
export type ProfileAxis = typeof PROFILE_AXES[number];
export type Profile = Record<ProfileAxis, number>;

// What each axis means here, because "openness" means six things across the literature and this app
// needs one. Written at the table so a future reader tunes the right number.
export const PROFILE_MEANING: Record<ProfileAxis, string> = {
  extroversion:      "how much they seek other people out. Low is not shy, it is self-sufficient.",
  agreeableness:     "how readily they yield and forgive. Low is contrary, not cruel.",
  conscientiousness: "whether the work is done properly when nobody is checking.",
  openness:          "appetite for the new and the strange. Low reads as superstitious here.",
  stability:         "how far they can be pushed before it shows.",
  ambition:          "how much they want to rise, and how much they mind not having.",
  honor:             "whether the given word holds when it costs something.",
  prejudice:         "how much a stranger's PEOPLE matters to them. Feeds Layer 2, not this layer.",
  romantic:          "appetite for attachment. Feeds Layer 3, and is not the same as attraction.",
};

// ---- THE DERIVATION ---------------------------------------------------------------------------
// The bridge that keeps 72 table rows alive. Each rule is a threshold on the profile, and the ORDER
// is unimportant because a person may hold several tags at once — which is correct, and is what the
// old three-trait system was approximating badly by drawing three at random from sixteen.
//
// TUNED AGAINST THE CONTENT, and measured rather than guessed. The first thresholds (<30/>70) gave
// an average of 1.5 tags — but 72 table rows were written against the old "three from sixteen"
// system and expect to find a match reasonably often, so a thinner person means more reactions
// falling through to the generic voice and a quieter household. Widened to <38/>62 and re-measured
// until the average landed near three. **The derivation has to fit the prose that already exists.**
export const TRAIT_RULES: Array<{ tag: string; when: (p: Profile, age: number) => boolean }> = [
  { tag: "quarrelsome",    when: (p) => p.agreeableness < 38 },
  { tag: "sharp-tongued",  when: (p) => p.agreeableness < 45 && p.extroversion > 52 },
  { tag: "forgiving",      when: (p) => p.agreeableness > 62 },
  { tag: "soft-hearted",   when: (p) => p.agreeableness > 55 && p.ambition < 48 },
  { tag: "patient",        when: (p) => p.stability > 58 },
  { tag: "melancholy",     when: (p) => p.stability < 38 },
  { tag: "cheerful",       when: (p) => p.extroversion > 58 && p.stability > 48 },
  { tag: "proud",          when: (p) => p.ambition > 58 || p.honor > 72 },
  { tag: "idle",           when: (p) => p.conscientiousness < 42 && p.ambition < 48 },
  { tag: "diligent",       when: (p) => p.conscientiousness > 62 },
  { tag: "slovenly",       when: (p) => p.conscientiousness < 34 },
  { tag: "sly",            when: (p) => p.honor < 38 },
  { tag: "superstitious",  when: (p) => p.openness < 38 },
  { tag: "devout",         when: (p) => p.openness < 45 && p.honor > 55 },
  // ---- ADDED 1 Aug (Frank): the axes that produced NOTHING -------------------------------------
  // Measured before writing: six of eighteen extremes fired no tag at all, and `prejudice` and
  // `romantic` were entirely inert — a person could be maximally insular or maximally romantic and
  // the household week could not tell. An axis with no tag is an axis the prose cannot see.
  //
  // THESE ARE TIGHTER THAN THE ORIGINAL SIX ON PURPOSE. Adding nine tags at the same thresholds took
  // the average person from 3.4 tags to 4.9, and at five tags nearly everybody matches the top of
  // REACTION_TO — which makes the reaction generic in practice while looking varied in the table.
  // The original six are tuned against shipped prose and were left alone; the new ones sit at
  // <28/>72 so they read as genuinely NOTABLE rather than as another line on everyone.
  { tag: "solitary",       when: (p) => p.extroversion < 28 },
  { tag: "gregarious",     when: (p) => p.extroversion > 74 },
  { tag: "curious",        when: (p) => p.openness > 70 },
  { tag: "content",        when: (p) => p.ambition < 28 },
  { tag: "straight-dealing", when: (p) => p.honor > 74 },
  { tag: "insular",        when: (p) => p.prejudice > 72 },
  { tag: "open-handed",    when: (p) => p.prejudice < 26 },
  { tag: "soft on people", when: (p) => p.romantic > 74 },
  { tag: "unsentimental",  when: (p) => p.romantic < 26 },
  // Two that are NOT personality and never were — the old system rolled them from the same bag as
  // "proud", which meant a sixty-year-old could be drawn "green". They are facts about a life.
  { tag: "green",          when: (_p, age) => age < 24 },
  { tag: "old-hand",       when: (_p, age) => age > 52 },
];

// ---- SOCIAL CLASS -------------------------------------------------------------------------------
// Not rolled independently: a Steward is not a scullion with better dice. Derived from the post,
// which is the honest relationship — an estate's household IS a class structure.
export const CLASS_BY_ROLE: Record<string, string> = {
  Steward: "gentry", Archivist: "professional", Scholar: "professional", Scribe: "professional",
  Librarian: "professional", Stargazer: "professional", Quartermaster: "professional",
  Smith: "craft", Artisan: "craft", Journeyman: "craft", Cook: "craft", Cellarer: "craft",
  Sergeant: "craft", Striker: "labouring", Apprentice: "labouring", Scullion: "labouring",
  Potboy: "labouring", Porter: "labouring",
  // DEFENDER ROLES (added 1 Aug, found by a 42-person run). Every one of these fell through to
  // `labouring`, so a household of 25 defenders read as 30 labouring / 6 craft / 6 professional — a
  // class structure that was really just "everyone who holds a wall is a labourer".
  //
  // A garrison HAS a hierarchy and it is not the same as a workshop's. A Warden runs a watch and a
  // Scout is trusted alone with information; a Pikeman stands in a line. That distinction is what
  // makes the Sergeant's post mean anything, and it was invisible.
  Warden: "professional", Scout: "professional",
  Halberdier: "craft", Shieldbearer: "craft", Archer: "craft", Crossbowman: "craft",
  Guard: "labouring", Sentry: "labouring", Pikeman: "labouring", Watchman: "labouring",
};
export const SOCIAL_CLASSES = ["gentry", "professional", "craft", "labouring"];

// ---- FAITH --------------------------------------------------------------------------------------
// By PEOPLE, because a dwarf in Waterdeep still keeps Moradin. Weighted, with a real share of nobody
// in particular — the Realms are devout but not uniformly so, and a household where everyone names a
// god reads as a temple rather than a keep.
//
// MY EXCHANGE TABLE. The deities are canon; the weights are the Exchange's own reading and are not
// cited to anything, the same standing as SPECIES_BY_REGION's house rows.
export const FAITH_BY_CULTURE: Record<string, Record<string, number>> = {
  human:      { "Tymora": 12, "Chauntea": 12, "Tempus": 10, "Lathander": 10, "Helm": 8, "Ilmater": 7, "Selûne": 7, "Waukeen": 6, "Torm": 5, "Kelemvor": 4, "Sune": 4, "Oghma": 3, "no god in particular": 12 },
  dwarf:      { "Moradin": 40, "Berronar Truesilver": 14, "Clangeddin Silverbeard": 10, "Dumathoin": 8, "Marthammor Duin": 6, "Abbathor": 4, "no god in particular": 18 },
  elf:        { "Corellon Larethian": 32, "Sehanine Moonbow": 16, "Hanali Celanil": 10, "Solonor Thelandira": 8, "Labelas Enoreth": 6, "Rillifane Rallathil": 6, "no god in particular": 22 },
  drow:       { "Lolth": 46, "Eilistraee": 10, "Vhaeraun": 10, "Kiaransalee": 5, "Ghaunadaur": 5, "no god in particular": 24 },
  halfling:   { "Yondalla": 34, "Brandobaris": 14, "Sheela Peryroyl": 10, "Arvoreen": 8, "Cyrrollalee": 6, "no god in particular": 28 },
  gnome:      { "Garl Glittergold": 34, "Baervan Wildwanderer": 12, "Segojan Earthcaller": 10, "Flandal Steelskin": 8, "Baravar Cloakshadow": 6, "no god in particular": 30 },
  orc:        { "Gruumsh": 34, "Luthic": 14, "Ilneval": 10, "Shargaas": 6, "Bahgtru": 6, "no god in particular": 30 },
  fiend:      { "Asmodeus": 40, "Bane": 12, "Tiamat": 8, "no god in particular": 40 },
  fey:        { "the Summer Queen": 22, "the Prince of Frost": 12, "Titania": 12, "Oberon": 10, "no god in particular": 44 },
  vistani:    { "the Morninglord": 18, "Ezra": 16, "the Ladies Three": 12, "no god in particular": 54 },
  giant:      { "Annam All-Father": 24, "Grolantor": 10, "Surtur": 8, "Thrym": 8, "no god in particular": 50 },
  lizardfolk: { "Semuanya": 38, "Ubtao": 12, "no god in particular": 50 },
  dragonborn: { "Bahamut": 32, "Tiamat": 14, "no god in particular": 54 },
};

// ---- SOMETHING TO BE, WHEN GENDER IS NOT A BINARY -----------------------------------------------
// Recorded as a separate field from `sex` because Frank's spec lists both, and because they answer
// different questions: `sex` decides which name pool draws, `gender` is how the person is referred to.
// Most people's match, which is why the weight is what it is. Nothing in the app branches on this
// yet; it exists so Layer 3 has it rather than inferring it later, which was this morning's lesson
// about names.
export const GENDER_MATCHES_SEX = 0.97;

// ═══════════════════════════ LAYER 4 · ATTRACTION (groundwork) ═════════════════════════════════
// Frank's spec is explicit about the shape and it is the right one: *"Instead of assigning identity
// labels internally, each individual should possess attraction preference values... Orientation
// labels become DESCRIPTIVE OUTCOMES rather than variables that drive behaviour."*
//
// Same principle as Layer 1's traits and Layer 2's relationship labels, for the third time: the
// numbers are the model and the word is a view of them. A stored label is a label that can disagree
// with the person it describes.
//
// THE BASELINE IS REAL POPULATION DATA (Frank's figures, 1 Aug), used the way the species
// demographics are used — as a starting distribution for a fictional household, not a claim about
// anybody. Split by gender because the surveys are, and the difference is real: women report
// bisexuality about twice as often as men, men report exclusive same-sex attraction more often.
export const ATTRACTION_BASE = {
  man:   { straight: 0.925, gay: 0.025, bi: 0.020, ace: 0.015, other: 0.015 },
  woman: { straight: 0.900, gay: 0.015, bi: 0.045, ace: 0.025, other: 0.015 },
  // Nonbinary people report asexuality and bisexuality at markedly higher rates in every survey
  // Frank cited; the "disproportionately represented minority" note is doing the work here.
  nonbinary: { straight: 0.45, gay: 0.10, bi: 0.28, ace: 0.10, other: 0.07 },
};

// A person carries WEIGHTS, not a word: how drawn they are to men, to women, to nonbinary people,
// and separately how much they want attachment at all. `orientationOf` reads them back out.
//
// ROMANTIC AND SEXUAL ARE SEPARATE AXES, per Frank's Layers 3 and 4 — which is what lets the model
// hold "romantic without sexual attraction" and "sexual without romance" without a special case for
// either. The `romantic` profile axis from Layer 1 is the appetite for attachment; `libido` here is
// the other one.
export const GENDER_IDENTITY = { cis: 0.988, trans: 0.007, nonbinary: 0.005 };

// Interspecies pairing. Frank's analogue is interracial marriage — ~18-20% of new marriages, ~10-12%
// of all existing ones — and his own closing point is the design:
//
//   *"The more important lesson isn't the exact number. It's how strongly the surrounding society
//    affects it. A cosmopolitan city produces far more intergroup marriages. Isolated villages
//    produce almost none."*
//
// So this is NOT a constant. It is derived from the diversity of the pool the person actually lives
// in, which the demographic tables already encode: Cormyr scores 0.25 and the Rock of Bral 0.81, and
// those numbers were computed for other reasons months before this needed them.
export const INTERSPECIES_FLOOR = 0.02;   // even an insular village is not zero
export const INTERSPECIES_CEIL = 0.34;    // even a free port is not a coin flip

// Simpson diversity of a weighted pool: 1 - sum(share^2). One people at 100% scores 0; an even
// spread across many scores near 1. The measure is standard and the tables were already the right
// shape for it.
export function poolDiversity(pool: Record<string, number>): number {
  const t = Object.values(pool).reduce((a, b) => a + b, 0);
  if (!t) return 0;
  return 1 - Object.values(pool).reduce((a, w) => a + (w / t) * (w / t), 0);
}

// ═══════════════════════ SPECIES BIOLOGY — WHO SOMEBODY IS ══════════════════════════════════════
// Frank's ruling, 1 Aug, and it is a correction to where I had put things:
//
//   *"I do not like the idea of separating sexual preference and gender identity from the biological
//    aspects of the race... Separating it out is implicitly agreeing with bigots who say that being
//    homosexual is a choice, being trans is a choice, and it's not — we have neurological evidence
//    that backs up that it is not a choice. It is the nature of who that person is."*
//
// He is right, and the fault was structural rather than numerical: I had orientation keyed by
// GENDER and living beside the cultural tables, which implies it is learned. **Orientation and
// gender identity are constitutional. They belong here, with age and lifespan and pairing.**
//
// WHAT VARIES CULTURALLY IS CONCEALMENT, which is a different thing and already has its own axis:
//
//   BIOLOGY  decides who somebody IS — drawn per species, from that species' own distribution.
//   CULTURE  decides whether the household ever KNOWS. A person born gay in a rigid culture forms
//            the relationship and hides it, which is a state the week can narrate and a bond can
//            carry: high affection, high trust, and low familiarity TO EVERYBODY ELSE.
//
// That distinction is mechanically richer than what it replaces, and it is Frank's.
//
// ---- WHAT DRIVES THE VARIATION: LIFESPAN AND DIMORPHISM, WEIGHTED (Frank's ruling) --------------
// `fluidity` is one number per people, 0-1, and every distribution below is derived from it rather
// than typed eighteen times. Two inputs, both of which Frank reasoned from:
//
//   LIFESPAN    centuries mean pairing late, many partners over a life, and no urgency. Elves high.
//   DIMORPHISM  low dimorphism ↔ more fluidity; sharply dimorphic peoples sit lower. This was
//               Frank's original instinct and it is the one that separates elves from dwarves.
//
// The Exchange's own reading, cited to nothing, and Frank's to red-pen. `lifespan` is canon; the
// dimorphism column and the weighting are not.
export const SPECIES_BIOLOGY: Record<string, { lifespan: number; dimorphism: number; adult: number; work: [number, number] }> = {
  // lifespan in years · dimorphism 0-1 (0 = sexes near-indistinguishable) · adult = working age
  // work = the age band a hireling is drawn from, so an elf archivist can have held the post since
  // the player's grandfather was a boy.
  "Elf":         { lifespan: 750, dimorphism: 0.15, adult: 100, work: [110, 520] },
  "Eladrin":     { lifespan: 750, dimorphism: 0.15, adult: 100, work: [110, 520] },
  "Astral Elf":  { lifespan: 900, dimorphism: 0.15, adult: 100, work: [120, 640] },
  "Drow":        { lifespan: 750, dimorphism: 0.20, adult: 100, work: [110, 520] },
  "Half-Elf":    { lifespan: 180, dimorphism: 0.35, adult: 20,  work: [24, 140] },
  "Shadar-kai":  { lifespan: 400, dimorphism: 0.25, adult: 40,  work: [45, 300] },
  "Dwarf":       { lifespan: 350, dimorphism: 0.55, adult: 50,  work: [55, 260] },
  "Duergar":     { lifespan: 350, dimorphism: 0.55, adult: 50,  work: [55, 260] },
  "Wild Dwarf":  { lifespan: 300, dimorphism: 0.55, adult: 50,  work: [55, 230] },
  "Gnome":       { lifespan: 400, dimorphism: 0.30, adult: 40,  work: [45, 300] },
  "Svirfneblin": { lifespan: 250, dimorphism: 0.30, adult: 40,  work: [45, 190] },
  "Halfling":    { lifespan: 150, dimorphism: 0.30, adult: 20,  work: [22, 115] },
  "Human":       { lifespan: 80,  dimorphism: 0.40, adult: 18,  work: [20, 64] },
  "Half-Vistani":{ lifespan: 90,  dimorphism: 0.40, adult: 18,  work: [20, 70] },
  "Caliban":     { lifespan: 70,  dimorphism: 0.45, adult: 18,  work: [20, 56] },
  "Tiefling":    { lifespan: 100, dimorphism: 0.38, adult: 18,  work: [20, 80] },
  "Dragonborn":  { lifespan: 80,  dimorphism: 0.30, adult: 15,  work: [17, 66] },
  "Half-Orc":    { lifespan: 75,  dimorphism: 0.55, adult: 16,  work: [18, 58] },
  "Orc":         { lifespan: 60,  dimorphism: 0.60, adult: 14,  work: [16, 48] },
  "Goblin":      { lifespan: 60,  dimorphism: 0.45, adult: 12,  work: [14, 48] },
  "Kobold":      { lifespan: 60,  dimorphism: 0.45, adult: 12,  work: [14, 48] },
  "Bugbear":     { lifespan: 80,  dimorphism: 0.55, adult: 16,  work: [18, 62] },
  "Goliath":     { lifespan: 90,  dimorphism: 0.50, adult: 18,  work: [20, 70] },
  "Firbolg":     { lifespan: 500, dimorphism: 0.35, adult: 40,  work: [45, 380] },
  "Satyr":       { lifespan: 500, dimorphism: 0.45, adult: 20,  work: [24, 380] },
  "Lizardfolk":  { lifespan: 80,  dimorphism: 0.20, adult: 12,  work: [14, 64] },
  "Githyanki":   { lifespan: 100, dimorphism: 0.30, adult: 18,  work: [20, 82] },
  "Giff":        { lifespan: 80,  dimorphism: 0.45, adult: 18,  work: [20, 64] },
  // ⚠ ADDED 2 Aug, having been absent — these three fell through to BIOLOGY_DEFAULT, which is a
  // HUMAN: eighty years, dimorphism 0.40, and a pairing comment reading "a mammal with a culture".
  // A devil, a shadow-touched planetouched and an ooze are none of those. Found by reading what the
  // tables already committed to before writing the voices on top of them.
  "Plasmoid":    { lifespan: 100, dimorphism: 0.05, adult: 18,  work: [20, 80] },
  "Erinyes":     { lifespan: 900, dimorphism: 0.30, adult: 40,  work: [60, 700] },   // a fallen thing does not age out
  "Treant":         { lifespan: 2400, dimorphism: 0.05, adult: 60, work: [80, 2200] }, // canon: they predate the elves
  "Bearded Devil":  { lifespan: 900,  dimorphism: 0.20, adult: 20, work: [30, 800] },  // promoted up from a lemure
  "Grimlock":       { lifespan: 60,   dimorphism: 0.35, adult: 16, work: [17, 52] },   // human-descended, hard-used
  // Five more that were falling through to the human default of eighty years.
  "Centaur":        { lifespan: 100,  dimorphism: 0.35, adult: 18, work: [19, 88] },
  "Quaggoth":       { lifespan: 55,   dimorphism: 0.30, adult: 12, work: [13, 48] },   // hard-used and short
  "Hag":            { lifespan: 700,  dimorphism: 0.00, adult: 0,  work: [1, 650] },   // made, not born; no childhood
  "Pterafolk":      { lifespan: 65,   dimorphism: 0.25, adult: 14, work: [15, 58] },
  "Troll":          { lifespan: 300,  dimorphism: 0.20, adult: 15, work: [16, 280] },  // regeneration is a long life
  // ⚠ THE UNDEAD. `lifespan` is the wrong word and the right field: it is how long the thing lasts
  // before it comes apart. A skeleton lasts as long as the binding does; a wight lasts until somebody
  // ends it. `adult: 0` because none of them had a childhood, and `work` starts at 0 for the same
  // reason — a skeleton is fit for work the hour it stands up.
  "Skeleton":           { lifespan: 200, dimorphism: 0.00, adult: 0, work: [0, 200] },
  // ABERRATIONS, CONSTRUCTS AND ELEMENTALS — the three chosen pools added 2 Aug.
  "Grick":              { lifespan: 60,  dimorphism: 0.00, adult: 3,  work: [4, 55] },
  "Darkmantle":         { lifespan: 40,  dimorphism: 0.00, adult: 2,  work: [3, 36] },
  "Otyugh":             { lifespan: 90,  dimorphism: 0.00, adult: 5,  work: [6, 85] },
  "Gibbering Mouther":  { lifespan: 50,  dimorphism: 0.00, adult: 1,  work: [2, 46] },
  "Chuul":              { lifespan: 120, dimorphism: 0.00, adult: 6,  work: [7, 112] },
  "Animated Armor":     { lifespan: 300, dimorphism: 0.00, adult: 0,  work: [0, 300] },
  "Animated Flying Sword": { lifespan: 300, dimorphism: 0.00, adult: 0, work: [0, 300] },
  "Rug of Smothering":  { lifespan: 300, dimorphism: 0.00, adult: 0,  work: [0, 300] },
  "Homunculus":         { lifespan: 90,  dimorphism: 0.00, adult: 0,  work: [0, 88] },
  "Dust Mephit":        { lifespan: 90,  dimorphism: 0.00, adult: 1,  work: [2, 86] },
  "Ice Mephit":         { lifespan: 90,  dimorphism: 0.00, adult: 1,  work: [2, 86] },
  "Magma Mephit":       { lifespan: 90,  dimorphism: 0.00, adult: 1,  work: [2, 86] },
  "Steam Mephit":       { lifespan: 90,  dimorphism: 0.00, adult: 1,  work: [2, 86] },
  "Magmin":             { lifespan: 90,  dimorphism: 0.00, adult: 1,  work: [2, 86] },
  "Azer":               { lifespan: 400, dimorphism: 0.30, adult: 20, work: [21, 380] },
  "Gargoyle":           { lifespan: 900, dimorphism: 0.00, adult: 0,  work: [0, 900] },
  "Zombie":             { lifespan: 60,  dimorphism: 0.00, adult: 0, work: [0, 60] },
  "Warhorse Skeleton":  { lifespan: 200, dimorphism: 0.00, adult: 0, work: [0, 200] },
  "Minotaur Skeleton":  { lifespan: 200, dimorphism: 0.00, adult: 0, work: [0, 200] },
  "Crawling Claws":     { lifespan: 100, dimorphism: 0.00, adult: 0, work: [0, 100] },
  "Ghoul":              { lifespan: 400, dimorphism: 0.10, adult: 0, work: [0, 400] },
  "Ghast":              { lifespan: 400, dimorphism: 0.10, adult: 0, work: [0, 400] },
  "Wight":              { lifespan: 900, dimorphism: 0.15, adult: 0, work: [0, 900] },
  "Specter":            { lifespan: 900, dimorphism: 0.00, adult: 0, work: [0, 900] },
  "Wraith":             { lifespan: 900, dimorphism: 0.00, adult: 0, work: [0, 900] },
  "Vampire Spawn":      { lifespan: 900, dimorphism: 0.20, adult: 0, work: [0, 900] },
  "Gloaming":    { lifespan: 120, dimorphism: 0.35, adult: 18,  work: [22, 95] },    // planetouched, long but not fey-long
  "Thri-kreen":  { lifespan: 30,  dimorphism: 0.20, adult: 8,   work: [9, 26] },
  "Minotaur":    { lifespan: 90,  dimorphism: 0.70, adult: 16,  work: [18, 72] },
  "Autognome":   { lifespan: 120, dimorphism: 0.00, adult: 1,   work: [2, 100] },
};
export const BIOLOGY_DEFAULT = { lifespan: 80, dimorphism: 0.40, adult: 18, work: [20, 64] as [number, number] };
export const biologyOf = (species?: string | null) => (species && SPECIES_BIOLOGY[species]) || BIOLOGY_DEFAULT;

// ---- TWO OUTCOMES, TWO DRIVERS (Frank's correction, 1 Aug) --------------------------------------
// I collapsed these into one "fluidity" number and it produced a contradiction: dwarves came out
// ABOVE humans, because a 350-year lifespan outweighed their dimorphism. Frank's correction —
// *"Not dimorphism… dysphoria. Dwarves have lower rates of dysphoria"* — separates them, and the
// contradiction disappears rather than needing to be tuned away.
//
//   GENDER INCONGRUENCE  <- DIMORPHISM. A body that signals sex sharply and unambiguously produces
//                           less incongruence; one that barely distinguishes the sexes produces
//                           more. **Dwarves low, elves higher.**
//   ORIENTATION SPREAD   <- LIFESPAN. Centuries of life, many partners over it, and no urgency
//                           about any of them. **Elves high, short-lived peoples low.**
//
// So dwarves land exactly where Frank first said they should — LOW incongruence — while their long
// life still widens their orientation spread. Both factors honoured, nothing reweighted, and the two
// numbers were never really one number.
//
// EVERYTHING IS ANCHORED ON HUMANS, and that is a correctness requirement rather than a preference:
// **the surveyed baseline IS the human number.** Frank's cited figures were measured on human
// populations, so humans sit at exactly 1.0 on both scales and every other people is a MULTIPLIER on
// what was actually observed. A first version had humans at 0.31 of the scale, which quietly meant
// the real statistics were being applied to a people the model considered unusually rigid.
//
// The Exchange's own reading. Lifespans are canon; the dimorphism column, the curves and the caps
// are not, and are Frank's to red-pen.
export const INCONGRUENCE_SPREAD = 2.2;   // how far the extremes may run from the human rate
export const ORIENTATION_SPREAD = 1.9;

// How much more or less often this people experiences gender incongruence than humans do. Driven by
// dimorphism, inverted: sharply dimorphic peoples sit BELOW 1, near-indistinguishable ones above.
export function incongruenceFactor(species?: string | null): number {
  const b = biologyOf(species), h = SPECIES_BIOLOGY.Human;
  const rel = (h.dimorphism - b.dimorphism) / 0.4;                 // >0 when LESS dimorphic than a human
  return Math.max(1 / INCONGRUENCE_SPREAD, Math.min(INCONGRUENCE_SPREAD, Math.pow(INCONGRUENCE_SPREAD, rel)));
}

// How much wider this people's orientation spread runs than the human baseline. Driven by lifespan,
// log-scaled because 60 to 350 years matters far more than 750 to 900.
export function orientationFactor(species?: string | null): number {
  const b = biologyOf(species), h = SPECIES_BIOLOGY.Human;
  const rel = (Math.log(b.lifespan) - Math.log(h.lifespan)) / Math.log(6);   // ~1 at 480 years
  return Math.max(1 / ORIENTATION_SPREAD, Math.min(ORIENTATION_SPREAD, Math.pow(ORIENTATION_SPREAD, rel)));
}

// ---- WHO TAKES WHICH POST ------------------------------------------------------------------------
// Frank, 1 Aug: *"a species preference for particular jobs — orcs might prefer to be hired as a
// guard, slightly less common in housekeeper roles... It would never be zero, but it would be a
// percentage driven."*
//
// NEVER ZERO is the load-bearing constraint and it is his. These are LEANINGS, not gates: an orc
// scullion is uncommon and entirely possible, and the one who turns up is more interesting for being
// unusual. A hard exclusion would produce a household where every people does exactly one thing,
// which is a caste system rather than a culture.
//
// Posts are grouped by what the work IS rather than listed one by one, so a facility minted next
// month inherits a sensible leaning without a new table.
export const POST_KIND: Record<string, string> = {
  Sergeant: "martial", Quartermaster: "martial",
  Smith: "forge", Striker: "forge",
  Artisan: "craft", Journeyman: "craft", Apprentice: "craft",
  Archivist: "letters", Librarian: "letters", Scribe: "letters", Scholar: "letters", Stargazer: "letters",
  Cook: "household", Scullion: "household", Potboy: "household", Cellarer: "household", Porter: "household",
};
export const POST_KINDS = ["martial", "forge", "craft", "letters", "household"];

// A multiplier on how readily this people takes that KIND of work. 1 is indifferent. The Exchange's
// own reading of each people's culture, cited to nothing, and Frank's to red-pen.
export const SPECIES_POST_LEAN: Record<string, Partial<Record<string, number>>> = {
  "Orc":         { martial: 2.6, forge: 1.2, letters: 0.35, household: 0.5 },
  "Half-Orc":    { martial: 2.0, forge: 1.3, letters: 0.5, household: 0.7 },
  "Bugbear":     { martial: 2.4, letters: 0.3, household: 0.6 },
  "Goblin":      { martial: 1.4, craft: 1.2, letters: 0.5 },
  "Kobold":      { craft: 1.5, martial: 1.1, letters: 0.6 },
  "Minotaur":    { martial: 2.5, forge: 1.4, letters: 0.3, household: 0.4 },
  "Ogre":        { martial: 2.0, forge: 1.3, letters: 0.15, household: 0.7 },
  "Dwarf":       { forge: 2.8, craft: 1.8, martial: 1.3, letters: 0.7 },
  "Duergar":     { forge: 2.6, craft: 1.6, martial: 1.4, letters: 0.6 },
  "Wild Dwarf":  { forge: 2.2, craft: 1.5, martial: 1.3, letters: 0.5 },
  "Gnome":       { craft: 2.4, letters: 1.8, forge: 1.2, martial: 0.5 },
  "Svirfneblin": { craft: 2.0, letters: 1.3, martial: 0.7 },
  "Elf":         { letters: 2.2, craft: 1.5, martial: 0.9, forge: 0.7 },
  "Eladrin":     { letters: 2.2, craft: 1.5, forge: 0.6 },
  "Astral Elf":  { letters: 2.6, craft: 1.2, forge: 0.5 },
  "Drow":        { letters: 1.8, martial: 1.4, craft: 1.2, forge: 0.6 },
  "Half-Elf":    { letters: 1.5, craft: 1.2 },
  "Halfling":    { household: 2.4, craft: 1.4, martial: 0.5, forge: 0.7 },
  "Human":       { },                                             // the indifferent baseline, named
  "Tiefling":    { letters: 1.4, craft: 1.2, household: 0.9 },
  "Dragonborn":  { martial: 1.8, forge: 1.2, letters: 0.8 },
  "Githyanki":   { martial: 2.4, letters: 0.8, household: 0.4 },
  "Giff":        { martial: 3.0, forge: 1.2, letters: 0.4, household: 0.4 },
  "Lizardfolk":  { martial: 1.6, household: 0.5, letters: 0.3 },
  "Goliath":     { martial: 2.0, forge: 1.4, letters: 0.4 },
  "Firbolg":     { letters: 1.6, household: 1.4, martial: 0.7 },
  "Satyr":       { letters: 1.3, household: 1.2, martial: 0.6 },
  "Plasmoid":    { craft: 1.4, letters: 1.2 },
  "Thri-kreen":  { craft: 1.6, martial: 1.4, letters: 0.4 },
  "Autognome":   { craft: 2.0, letters: 1.4, martial: 0.6, household: 0.8 },
};

// ---- AND THE DIVISION OF LABOUR, WHICH VARIES BY CULTURE ------------------------------------------
// Frank asked for a gender split on the same footing. **The model carries the DISTRIBUTION and says
// nothing about its cause**, deliberately: occupational segregation has several plausible drivers in
// the real world and the research does not settle on one, so encoding an explanation would be the
// app asserting something it cannot support. What it can honestly say is "this household looks like
// this", which is all any of these tables ever say.
//
// AND IT VARIES BY CULTURE, which is the better design as well as the safer one: a dwarven forge and
// an elven one should not have the same split. **`CULTURE_OPENNESS` already carries exactly the
// right shape** — a rigid culture divides labour sharply, a fluid one barely does — so this needed no
// new axis at all. Elves at 0.90 are almost even everywhere; dwarves at 0.40 divide markedly.
//
// The lean is toward MEN in martial and forge work and toward WOMEN in household work, at a strength
// set by the culture. At full openness it vanishes entirely.
export const LABOUR_LEAN: Record<string, number> = {
  martial: 0.34, forge: 0.22, craft: 0.04, letters: -0.04, household: -0.30,   // >0 leans male
};

export function postLean(species: string | null | undefined, role: string): number {
  const kind = POST_KIND[role];
  if (!kind) return 1;
  const t = species ? SPECIES_POST_LEAN[species] : null;
  return (t && t[kind] !== undefined) ? t[kind]! : 1;
}

// Probability this post goes to a man, given the people's culture. Openness 1 -> exactly even.
export function postMaleShare(culture: string | null | undefined, role: string): number {
  const kind = POST_KIND[role];
  if (!kind) return 0.5;
  const rigidity = 1 - opennessOf(culture);
  return Math.max(0.12, Math.min(0.88, 0.5 + (LABOUR_LEAN[kind] || 0) * rigidity * 2));
}

// ═══════════════════ WHICH AXES A PEOPLE EVEN HAS ═════════════════════════════════════════════
// ⚠ Frank, 2 Aug: *"Did you resolve the biological tags for these races? You imply they are extremely
// non-human, which tells me it's possible that the entirety of phases two and three were missed."*
//
// **They were.** Layers 1 through 5 were applied to every non-`mindless` being without ever asking
// whether the axes apply, and the result was a widowed AUTOGNOME with two living parents, a libido
// of 85, a sexual orientation and a devotion to Baervan Wildwanderer. A machine with a sex drive
// and a god.
//
// It was invisible because `SPECIES_ROLES` asks only three questions — can you hold a post, can you
// hold a wall, do you think — and the model then assumed that anything that thinks does everything
// else a human does. **The pattern was right and was never extended.**
//
// And the derived factors compounded it: `incongruenceFactor("Autognome")` returns **x2.20**, because
// it reads dimorphism 0 as "no sexual dimorphism, therefore maximum gender incongruence" — true of
// elves, a category error for a thing with no sex at all.
//
// SO: every people declares which axes it HAS. Absent an entry a people has all of them, because
// almost every people does and a default of "everything" is right for the common case.
export const SPECIES_AXES: Record<string, {
  // ⚠ NOT A BOOLEAN (Frank, 2 Aug). I had `sexed: false` for plasmoids meaning "has no sex", and he
  // corrected the biology: *"each individual carries both male and female genes, and they pair
  // according to encounters and the appropriate set gets passed to the other individual... these
  // species can also in extreme circumstances reproduce with themselves."*
  //
  // That is SIMULTANEOUS HERMAPHRODITISM and it is real — earthworms, snails, flatworms, barnacles.
  // Reciprocal exchange, so one encounter can leave both partners carrying. Sexual selection is
  // retained, because outcrossing beats selfing for diversity. Selfing occurs under low mate
  // availability. **And the literature adds one thing he did not: sex roles are NEGOTIABLE — an
  // individual biases investment toward male or female function by condition and mating history.**
  //
  // Which puts his gender ruling on firmer ground than presentation alone. A plasmoid choosing a
  // gender role among humanoids is doing socially what its biology already does reproductively.
  //
  // "none"  — no sex at all (a construct)
  // "both"  — carries both, role negotiated per encounter (a plasmoid)
  // "one"   — the ordinary case: one sex, fixed
  sexed?: "none" | "both" | "one";
  gendered?: boolean;   // has a gender identity
  desires?: boolean;    // experiences sexual attraction
  romances?: boolean;   // forms romantic attachment
  worships?: boolean;   // has a faith
  born?: boolean;       // had parents and a childhood
  fluid?: boolean;      // gender is a presentation that can change, not a fact set at birth
}> = {
  // A CONSTRUCT. It thinks, it has opinions, it can be devoted to a person — but it was BUILT, and
  // built things have makers rather than parents. 5e autognomes are gnome-made and do have
  // personalities, so `romances` stays true: attachment is not the same as desire.
  // `romances: false` and NOT because a construct cannot care — it plainly can, and its BONDS
  // (Layer 2: affection, trust, loyalty) are untouched. It is that Layer 3 is courtship, and
  // `PAIRING_MODEL` already rules an autognome x0.00: "it has opinions; it does not have a
  // marriage." Two tables must not disagree about the same being.
  Autognome:   { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  // AMORPHOUS, AND THE SOURCE SETTLES IT. Frank asked whether plasmoids are asexual dividers; the
  // *Astral Adventurer's Guide* says they reproduce by a loose analogue of meiosis — **two parents
  // merge and separate, and one of them later divides**, producing a newborn that is a mixture of
  // both. So: division, yes; asexual, no; SEXES, no — either parent can be the one that divides.
  //
  // `sexed: false` is therefore sourced rather than assumed. `gendered: true` is an INFERENCE and is
  // labelled as one: they adopt the shape of whoever they are among, and the books give plasmoid
  // NPCs ordinary pronouns, so gender reads as presentation they choose rather than anatomy they
  // have. If a source contradicts it, this line loses.
  //
  // And `born: true` has a consequence one layer down — a plasmoid has no MOTHER and no FATHER.
  // See PARENT_STATES_UNSEXED.
  Plasmoid:    { sexed: "both", gendered: true, fluid: true, born: true },
  // INSECTOID AND CLUTCH-BONDING. The pairing model already says a clutch-mate is not a spouse;
  // this says the rest of it. They form deep attachments and the romantic apparatus is the wrong
  // shape for them.
  "Thri-kreen": { sexed: "one", gendered: false, desires: false, romances: false, born: true },
  // A DEVIL. Whatever an erinyes was before, she is a fiend now: not born, and her faith is a
  // hierarchy rather than a devotion — which the faith table already handles by giving her Asmodeus.
  Erinyes:     { born: false },
  // ⚠ A TREANT IS "BOTH" FOR THE SAME REASON A PLASMOID IS — and this one is HOUSE, labelled.
  // 5e says treants are *awakened trees*; the Realms sources name **seedlings**, *"immature offspring
  // of the most ancient and wisest treants"* — so offspring exist and **no published source states
  // the mechanism.** Frank's model fills that silence: a treant finds soft soil, roots, spreads and
  // flowers for about a month, releasing pollen AND receiving it, and sets fruit or nut that becomes
  // another treant. Every individual does both halves, which is exactly `sexed: "both"`.
  //
  // Under §9 this is legitimate — canon is silent, so the gap may be filled — and it is the
  // Exchange's own, which is why it says so here rather than passing as canon.
  Treant:      { sexed: "both", gendered: false, desires: false, romances: true, born: true },
  // A DEVIL PROMOTED UP FROM A LEMURE, which was a mortal soul. Not born; made, twice.
  "Bearded Devil": { born: false, worships: false },
  "Barbed Devil":  { born: false, worships: false },
  "Spined Devil":  { born: false, worships: false },
  "Chain Devil":   { born: false, worships: false },
  "Bone Devil":    { born: false, worships: false },
  "Horned Devil":  { born: false, worships: false },
  "Other Devil":   { born: false, worships: false },
  // ⚠ CANON-SOURCED, not inferred. The 2e material states it outright: *"quaggoths can mate at any
  // time of the year. They are not known to have any courtship or mating rituals."* That is a
  // published statement about romantic capacity, which is exactly what Frank asked be used.
  Quaggoth:    { romances: false },
  // A HAG IS MADE. She was not born, had no childhood, and her covens are of three by rule rather
  // than by affection.
  Hag:         { born: false, romances: false },
  // AND THE MINDLESS have none of it, which the model already knew and is stated here so the two
  // rulings live in one place.
  Lemure:      { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  // ⚠ THE UNDEAD, AND THE LINE THE SRD DRAWS FOR US. Frank: *"they're all mindless, none of them have
  // culture."* True of the lesser tier and not of the greater — a wight is INT 10, as bright as most
  // of the household. What NONE of them has is CULTURE: no homeland, no faith, no childhood.
  //
  // The greater tier keeps `desires` and `romances` because it remembers being a person and the
  // sources are full of undead who want things. It does not keep `born` — being raised is not being
  // born — and it does not keep `worships`, because whatever it had died with it.
  // THE MADE. A construct has a maker, not a mother — the same ruling as the autognome.
  "Animated Armor":        { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  "Animated Flying Sword": { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  "Rug of Smothering":     { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  Homunculus:              { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  // THE CALLED UP. A mephit is bound rather than born, and an elemental has no faith to keep.
  "Dust Mephit":  { sexed: "none", gendered: false, desires: false, worships: false, born: false },
  "Ice Mephit":   { sexed: "none", gendered: false, desires: false, worships: false, born: false },
  "Magma Mephit": { sexed: "none", gendered: false, desires: false, worships: false, born: false },
  "Steam Mephit": { sexed: "none", gendered: false, desires: false, worships: false, born: false },
  Magmin:         { sexed: "none", gendered: false, desires: false, worships: false, born: false },
  Gargoyle:       { sexed: "none", gendered: false, desires: false, worships: false, born: false },
  // THE WRONG SHAPES. An aberration was made by something, somewhere, for a reason nobody has.
  // ⚠ DARKMANTLE (Frank, 2 Aug): *"darkmantles are a kind of octopus... if they do get romantically
  // involved with anything other than another darkmantle, I don't mind it, but we need to be very
  // careful how we apply the romance chart to this creature."*
  //
  // 5e settles it and the answer is the careful one: **INT 2** — animal level, which is why it is
  // flagged mindless. So it has no romance table at all, and the axes now say so explicitly rather
  // than relying on the mindless flag to imply it.
  Darkmantle: { sexed: "one", gendered: false, desires: false, romances: false, worships: false, born: true },
  "Gibbering Mouther": { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  Otyugh: { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  Grick:  { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  Chuul:  { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  Skeleton:            { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  Zombie:              { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  "Warhorse Skeleton": { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  "Minotaur Skeleton": { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  "Crawling Claws":    { sexed: "none", gendered: false, desires: false, romances: false, worships: false, born: false },
  Ghoul:               { worships: false, born: false },
  Ghast:               { worships: false, born: false },
  Wight:               { worships: false, born: false },
  Specter:             { sexed: "none", worships: false, born: false },
  Wraith:              { sexed: "none", worships: false, born: false },
  "Vampire Spawn":     { worships: false, born: false },
};
// ---- GENDER AS A PRESENTATION RATHER THAN A FACT ------------------------------------------------
// Frank, 2 Aug, following the plasmoid sourcing: *"that means a plasmoid is the epitome of gender
// fluid. They can appear masculine or feminine because it's just a matter of changing their shape.
// They likely adopt a particular gender when they live among other humanoids because it is the
// standard convention — selecting the gender role they would like to participate in and forming
// their body accordingly. But that literally could change moment to moment."*
//
// The source supports it directly: plasmoids *"often adopt a similar shape"* to the folk around them
// and can *"stiffen the outer layers of their bodies to maintain a humanlike shape."* Gender for them
// is a ROLE they opt into, held by convention because the neighbours have one.
//
// So `gender` cannot be a field written once at birth for them. It is a current presentation, and it
// moves. Six things read `.gender` — desireBetween, orientationOf, orientationLabelOf, romanceGate,
// tabooOf, mutuallyDrawn — and all of them are correct to read whatever is being presented NOW;
// what was wrong was that it could never change.
export const GENDER_FLUID_WEEKLY = 0.06;   // roughly three shifts a year, not moment to moment in practice

// ═══════════════════ CHOSEN HIRES ══════════════════════════════════════════════════════════════
// Frank, 2 Aug: *"Skeletons are an example of a mindless hireable... for those player characters who
// want to play a necromancer, perfect. A warlock could also hire demons outside of their home region
// because they can summon them — so this is a player chosen hire. But if a warlock has a pact with an
// archfey, then they would be able to hire Feywild creatures. We need to build an entire category of
// chosen hires."*
//
// **A chosen hire bypasses the demographics entirely.** Every other hireling comes out of
// `SPECIES_BY_REGION` — who is actually HERE. These come out of what the character can CALL, which is
// a fact about the character and not about the ground they are standing on. A necromancer in Cormyr
// raises skeletons; a Fiend-pact warlock in the Dalelands has imps whatever the Dalelands think.
//
// ---- AND NOT ALL UNDEAD ARE MINDLESS, WHICH THE SRD SETTLES BY ITS OWN NUMBERS ------------------
// Frank's framing was *"they're all mindless, none of them have culture"* — true of the low tier and
// not of the rest. The SRD's INT scores draw the line without anybody having to rule on it:
//
//   Zombie 3 · Warhorse Skeleton 2 · Crawling Claws 5 · Skeleton 6 · Minotaur Skeleton 6   MINDLESS
//   Ghoul 7 · Wight 10 · Specter 10 · Ghast 11 · Vampire Spawn 11 · Wraith 12              MINDED
//   Vampire CR 13 · Mummy Lord CR 15 · Lich CR 21                            not hirelings at all
//
// A wight at INT 10 is as bright as most of the household. It has no CULTURE — no homeland, no
// faith, no childhood it remembers — but it is nobody's pair of hands.
export const CHOSEN_HIRE_POOLS: Record<string, { label: string; peoples: string[]; why: string }> = {
  undead_lesser: {
    label: "the risen",
    // ⚠ WARHORSE SKELETON REMOVED. Frank: *"it is an animal undead — not even a defender."* It is a
    // HORSE: it hauls, it carries, and it does not hold a line. A pool of hirelings is not where it
    // belongs — it is a thing a necromancer's estate KEEPS, like the goats in Gary's arrangement.
    //
    // The `Animals` bucket is the precedent and the right home if it is ever wanted back.
    peoples: ["Skeleton", "Zombie", "Minotaur Skeleton", "Crawling Claws"],
    why: "raised rather than hired, and they do not need feeding, paying or convincing",
  },
  undead_greater: {
    label: "the returned",
    peoples: ["Ghoul", "Ghast", "Wight", "Specter", "Wraith", "Vampire Spawn"],
    why: "raised, and awake. They remember being alive and none of them remember it fondly",
  },
  fiends: {
    label: "the bound",
    peoples: ["Imp", "Spined Devil", "Bearded Devil", "Barbed Devil", "Chain Devil", "Bone Devil"],
    why: "called and contracted. The terms are exact and the terms are the danger",
  },
  aberrations: {
    label: "the wrong shapes",
    peoples: ["Grick", "Darkmantle", "Otyugh", "Gibbering Mouther", "Chuul", "Grimlock"],
    why: "sent by something that does not explain itself, and does not appear to want anything",
  },
  constructs: {
    label: "the made",
    peoples: ["Animated Armor", "Animated Flying Sword", "Rug of Smothering", "Homunculus", "Autognome"],
    why: "built for the purpose, and the purpose is whatever it was built for",
  },
  elementals: {
    label: "the called up",
    peoples: ["Dust Mephit", "Ice Mephit", "Magma Mephit", "Steam Mephit", "Magmin", "Azer", "Gargoyle"],
    why: "bound by a genie's word rather than by wages, and every one of them is counting the days",
  },
  fey: {
    label: "the invited",
    // ⚠ NOT Pixie, Sprite or Dryad. All three are `hire: false, defend: false` — *"the work is the
    // wrong size"*, *"a scout at best, and this system has no scouting post"*, *"bound to her tree
    // and not leaving it to work in your kitchen"* — so the draw filtered them out every time and
    // **the pool was overstating what an Archfey pact actually delivers.** A pool that lists what it
    // cannot supply is a promise the code does not keep.
    // ⚠ DRYAD IS BACK. She was struck from this pool when she was `hire: false` and the pool was
    // advertising somebody it could never deliver. She works open ground now — and she arrives with
    // a tree that was always there.
    peoples: ["Other Fey", "Satyr", "Dark Fey", "Redcap", "Dryad"],
    why: "sent by a patron who has not explained why, and who will want something",
  },
};

// ---- WHO MAY CALL WHAT --------------------------------------------------------------------------
// Keyed by class first and SUBCLASS second, because Frank is right that the subclass is where this
// actually lives: *"we need to know what pact a warlock has."* A warlock's patron is the whole
// question, and a wizard's school is most of one.
//
// A bare class entry is what that class can call REGARDLESS of subclass; a subclass entry adds to it.
// Absent from both, a character has no chosen hires and staffs from the region like everybody else.
export const CHOSEN_HIRES_BY_CLASS: Record<string, string[]> = {
  // Nobody gets these for being a wizard. They get them for being a NECROMANCER.
};
export const CHOSEN_HIRES_BY_SUBCLASS: Record<string, string[]> = {
  // ARCANE NECROMANCY
  "School of Necromancy": ["undead_lesser", "undead_greater"],
  "Necromancy": ["undead_lesser", "undead_greater"],
  "Shadow Magic": ["undead_lesser"],
  "Undead Warlock": ["undead_lesser", "undead_greater"],
  "The Undead": ["undead_lesser", "undead_greater"],
  "The Undying": ["undead_lesser", "undead_greater"],
  // DIVINE AUTHORITY OVER THE DEAD — a Death cleric commands them; a Grave cleric lays them to rest,
  // which is a different relationship and gets the lesser tier only.
  "Death Domain": ["undead_lesser", "undead_greater"],
  "Grave Domain": ["undead_lesser"],
  "Oath of Conquest": ["undead_lesser"],
  // WARLOCK PATRONS. The pact IS the pool, which is the whole of Frank's point.
  "The Fiend": ["fiends"],
  "Fiend": ["fiends"],
  "The Archfey": ["fey"],
  "Archfey": ["fey"],
  "The Hexblade": ["undead_lesser"],
  // ⚠ THE ONES WE WERE MISSING (Frank, 2 Aug), after a full subclass review.
  //
  // OATHBREAKER is the largest omission: its Channel Divinity CONTROLS UNDEAD outright. A necromancer
  // in plate, and it had no pool at all.
  "Oathbreaker": ["undead_lesser", "undead_greater"],
  // THE GREAT OLD ONE. Frank: *"the old gods would give you abominations — pact with the Old One is
  // based around Lovecraftian eldritch powers."* And the SRD has the servant tier for it: grick,
  // darkmantle, otyugh, gibbering mouther.
  "The Great Old One": ["aberrations"],
  "Great Old One": ["aberrations"],
  "Aberrant Mind": ["aberrations"],
  // CONSTRUCTS. An artificer builds them; a Clockwork Soul is wired into Mechanus.
  "Battle Smith": ["constructs"],
  "Alchemist": ["constructs"],
  "Artillerist": ["constructs"],
  "Armorer": ["constructs"],
  "Clockwork Soul": ["constructs"],
  // ELEMENTALS. A genie's word binds them, and the mephits are exactly servant-tier.
  "The Genie": ["elementals"],
  "Genie": ["elementals"],
  //
  // ⚠ AND NOT THE CELESTIAL PACT, which Frank called and the SRD confirms: every celestial at
  // servant CR is a NOBLE creature — couatl, pegasus, sphinx of wonder, unicorn. **There is no
  // celestial equivalent of an imp or a lemure.** That is an absence in the source rather than a
  // flavour judgement, and inventing one would be the Exchange putting words in the books' mouths.
  //
  // AND A NECROMANCER'S CIRCLE
  "Circle of Spores": ["undead_lesser"],
};

// ---- FEY AFFINITY: A PULL RATHER THAN A CHOICE --------------------------------------------------
// Frank, 2 Aug: *"Let's increase the percentage of outlanders from the fey for the classes that have
// a fey affinity. They are likely to draw the attention of the fey in their area, or who happened to
// have crossed the boundary and would be looking for work from somebody who is friendly to the fey.
// That does not require the toggle — it just should automatically get a modifier."*
//
// **This is a better mechanism than the toggle and a different one.** A chosen hire is CALLED: the
// character decides, the region is ignored, the household changes completely. This is a PULL: the
// character decides nothing, the region still supplies everybody, and the fey who were already
// nearby — or who came over the boundary and are looking about — turn up more often because word has
// got round that this house is friendly.
//
// Four subclasses, all explicitly Feywild-bound, and none of them a PACT — which is why they get a
// pull rather than a pool. An Archfey warlock has a patron who SENDS people. These four have a
// reputation.
export const FEY_AFFINITY: Record<string, number> = {
  "Oath of the Ancients": 0.22,   // sworn to the light in the world, and the Summer Court notices
  "Fey Wanderer": 0.26,           // has actually been there and came back marked
  "Circle of Dreams": 0.24,       // draws on the Feywild directly for its magic
  "College of Glamour": 0.20,     // its whole power is borrowed Feywild presence
  "Archfey Warlock": 0.14,        // has the pool AND the reputation; a smaller pull on top
};
export const feyAffinity = (subclass?: string | null, ch?: any) => {
  if (subclass && FEY_AFFINITY[subclass]) return FEY_AFFINITY[subclass];
  // Declared rather than derived: "known to the fey" is a thing the player says and the DM checks.
  return ((ch && ch.qualifies) || []).indexOf("fey_touched") !== -1 ? 0.22 : 0;
};

// The peoples a fey pull can actually deliver. Narrower than the `fey` chosen pool: these are the
// ones who would plausibly walk up and ask for work, rather than the ones a patron dispatches.
export const FEY_DRIFTERS = ["Other Fey", "Satyr", "Dark Fey", "Pixie", "Sprite", "Dryad", "Eladrin"];

// ---- THE TOGGLE ---------------------------------------------------------------------------------
// Frank, 2 Aug: *"It needs to be a bastion level toggle, and it needs to only appear for people who
// have a class that would have a special group of hirelings. I cannot think of a reason why a rogue
// or a warrior would end up with a special class of hireling."*
//
// So the toggle is not a setting everybody has and most leave off. **It does not exist for a
// character with no entitlement** — `canChooseHires` is the question the UI asks before drawing the
// control at all, and `chosenHiresActive` is the question every hiring path asks before using it.
//
// Two functions rather than one on purpose: a toggle that can be SET by somebody with no entitlement
// is a toggle that silently does nothing, which is the write-and-never-read defect wearing a switch.
// A character's entitlement is what they DECLARE, and the subclass string is kept as a convenience
// for anybody who does have one (an import, a future sheet integration). Declaration wins because it
// is the thing the app can actually be told.
export function declaredPools(ch?: any): string[] {
  const held = (ch && ch.qualifies) || [];
  return [...new Set(held.flatMap((q: string) => (CHOSEN_HIRE_PREREQS[q] || { pools: [] }).pools))] as string[];
}
export const canChooseHires = (cls?: string | null, subclass?: string | null, ch?: any) =>
  chosenHirePools(cls, subclass).length > 0 || declaredPools(ch).length > 0;

export function chosenHiresActive(ch?: any): boolean {
  if (!ch || !ch.bastion) return false;
  if (!ch.bastion.chosenHires) return false;                 // the toggle is off, or was never set
  return canChooseHires(ch.cls, ch.subclass, ch);            // ...and the entitlement still holds
}

export function chosenHirePools(cls?: string | null, subclass?: string | null): string[] {
  const byCls = (cls && CHOSEN_HIRES_BY_CLASS[cls]) || [];
  const bySub = (subclass && CHOSEN_HIRES_BY_SUBCLASS[subclass]) || [];
  return [...new Set([...byCls, ...bySub])];
}
// Draw one people from what this character can call, respecting the job — a specter has no hands and
// cannot hold a post, exactly as `poolFor` already rules for everybody else.
export function chosenHireSpecies(ch?: any, job?: "hire" | "defend", rnd: () => number = Math.random, defId?: string | null): string | null {
  if (!chosenHiresActive(ch)) return null;
  // ⚠ THE ROOM WAS NEVER PASSED HERE (found by the special-groups test, 2 Aug). The REGIONAL hiring
  // path got `speciesCanHireAt` and this one kept `speciesCanHire` — so a chosen hire was judged on
  // "can it hold a post at all" and dropped into whatever room asked. The test put a **Minotaur
  // Skeleton in a library** and an **Azer in a library**: sixty oversized and seventeen fire-bearing
  // placements in three hundred draws.
  //
  // **A rule enforced at some of its entrances is a rule with a back way in** — the fifth time this
  // exact shape has cost something, and the first time it has been the chosen path.
  const keys = [...new Set([...chosenHirePools(ch.cls, ch.subclass), ...declaredPools(ch)])];
  const pool = [...new Set(keys.flatMap((k) => (CHOSEN_HIRE_POOLS[k] || { peoples: [] }).peoples))]
    .filter((sp) => (job === "defend" ? speciesCanDefend(sp)
                   : job === "hire" ? (defId === undefined ? speciesCanHire(sp) : speciesCanHireAt(sp, defId))
                   : true));
  if (!pool.length) return null;
  return pool[Math.floor(rnd() * pool.length)];
}

export function chosenHirePeoples(cls?: string | null, subclass?: string | null): string[] {
  return [...new Set(chosenHirePools(cls, subclass).flatMap((k) => (CHOSEN_HIRE_POOLS[k] || { peoples: [] }).peoples))];
}

// ---- WHAT A MINDLESS WORKER'S DAY LOOKS LIKE ----------------------------------------------------
// ⚠ Found by a limit-break run (2 Aug): a household of LEMURES — mindless by their own entry —
// produced *"sat up late over a letter to a barracks that had long since been disbanded"* and *"kept
// the great pot going all day so any hour brought a hot meal to a cold man."*
//
// **A formless mass of suffering, writing letters.** `rollPerson` reads `mindless` and gives no
// profile, no faith, no family — and the comment there claims *"every downstream system already
// reads `mindless` to know that."* **The household week does not read it once.** The claim was true
// when it was written and stopped being true when the narration was built on top.
//
// A mindless worker is a pair of hands. It is present, it does the work, and there is nothing to
// say about how it feels about any of it.
//
// ⚠ AND IT IS CURRENTLY UNREACHABLE, WHICH FRANK CAUGHT IMMEDIATELY: *"lemures should be
// unhireable."* **They already are** — `hire: false`, `defend: false`, and zero placed across 8,400
// hires drawn from a 45%-lemure population. So the only mindless people cannot reach a household,
// and this table has no reader. **That is the write-and-never-read defect, committed in the act of
// fixing it**, and it was found by a limit-break test that forced a state the game cannot produce.
//
// It stays, and the UNREACHABILITY is what the gate asserts, because the deciding fact is what
// `SPECIES_ROLES.Lemure` actually says: *"a formless mass of suffering — no hands, no mind, no
// post."* **That is a statement about lemures, not about mindlessness.** A mindless people WITH
// hands is forbidden by nothing; it simply does not exist yet, and the day somebody adds one the
// narration is ready and the assertion below turns over to demand a reader.
export const MINDLESS_SAY = [
  // ⚠ SIX WAS NOT ENOUGH. Written when this was unreachable, so depth did not matter; the moment
  // skeletons became hireable a necromancer's tower showed the same four lines cycling — the exact
  // defect the maintain-all log caught this morning with the species placeholder.
  "{a} worked without pause and without any sign of minding one way or the other.",
  "{a} did what it was set to do, exactly, for as long as there was light.",
  "{a} was moved from one task to the next and made no difficulty about it.",
  "{a} stood where it had been left until somebody found something else for it.",
  "{a} did the work. There is nothing else to say about {a}'s day.",
  "{a} did not stop when the others did, and did not appear to notice they had.",
  "{a} carried the load twice as long as anybody living would have.",
  "{a} was set to the worst job in the {room} and did not have an opinion about it.",
  "{a} repeated a motion several thousand times without any loss of accuracy.",
  "{a} did not flinch at a thing that made two of the living jump.",
  "{a} was still until it was needed, and then was not still.",
  "{a} worked through the night because nobody had said to stop.",
  "{a} took an instruction exactly as it was worded, which was nobody's intention.",
  "{a} does not eat, does not rest, and does not require any of the arrangements the others do.",
  "{a} was in the {room} at dawn because it had been in the {room} at dusk.",
  "{a} did a filthy job that the household had been quietly avoiding for a month.",
  "{a} made no sound at all for the whole of the day.",
  "{a} was left holding something for two hours and was still holding it.",
  "{a} worked beside the living without any difficulty on its side.",
  "{a} finished, and stopped, and waited.",
];

export const PRESENTATION_SAY = [
  "{a} came down presenting differently and nobody in the household remarked on it, which is the courtesy here.",
  "{a} settled into a shape closer to the household's and did not appear to have decided to.",
  "{a} was asked which was the real one and said all of them, patiently, as {a} has answered before.",
  "{a} held a form all week for a visitor's sake and let it go the moment the visitor left.",
  "{a} shifted mid-conversation and finished the sentence in a different register entirely.",
  "{a} was addressed by the wrong form by a newcomer and corrected them without any edge at all.",
];

// ---- WHAT THIS MODEL DELIBERATELY DOES NOT REPRESENT ---------------------------------------------
// **Intersex variation is absent by decision, not by oversight** (Frank, 2 Aug). Two reasons, and the
// second is the stronger one:
//
//   1 · THERE IS NO EVIDENCE BASE ACROSS PEOPLES. Frank: *"we don't have an intersex rate for ants,
//       which would be the closest to a thri-kreen."* Human figures exist; nothing comparable exists
//       for the analog animals of thirty other peoples, and dwarf and elf biology here are his own
//       theory rather than canon. A per-people rate would be **house-invented and dressed as
//       biology**, which §9 exists to prevent. Representing it for humans alone would leave every
//       other people looking forgotten rather than considered.
//
//   2 · AND IT WOULD NOT BE OBSERVABLE. *"Externally visible is a big factor. It would immediately
//       adjust people's reactions to that individual, and if that doesn't exist then it's not
//       something that would be useful."* Most variation is not externally apparent, and this whole
//       narration layer surfaces only what somebody could observe. A field nobody can see is a field
//       nobody reads.
//
// See COMPILER_PRINCIPLES.md, "A considered omission is not a gap", for the full reasoning including
// the endocrine-dimorphism theory that was tested and dropped.

// ---- WHAT WILL NOT FIT THROUGH A DOOR, OR ONTO A DECK (Frank, 2 Aug) ----------------------------
// *"The treant can serve in only two roles: they can be defenders or they can work in the garden.
// They cannot fit inside the stronghold, and do not apply to ships, because you can't put one on a
// ship — so a vessel form cannot pick up trees at all."*
//
// Half of this already held: `speciesCanHire("Treant")` is false, so a treant is never hired into a
// smithy. **The vessel half did not.** A probe found zero treants aboard a ship — and then found the
// reason, which was not a rule: treants appear only in two Feywild LOCALES, and a vessel sets
// `b.region`. **Unreachable by accident is not the same as forbidden**, and an accident stops being
// one the moment somebody sets a locale.
//
// Keyed by bastion FORM. A people listed here cannot join a bastion of that form in any capacity.
export const FORM_EXCLUDES: Record<string, string[]> = {
  vessel: ["Treant"],   // you cannot put a tree on a ship
};
export const formExcludes = (form?: string | null, sp?: string | null) =>
  !!(form && sp && (FORM_EXCLUDES[form] || []).indexOf(sp) !== -1);

// ---- WHO CAN CROSS WITH WHOM --------------------------------------------------------------------
// *"Trees obviously do not breed with non-plant-based organisms, but I could imagine a cross between
// a dryad and a tree being successful, because they both derive from trees."*
//
// The interspecies model until now was a single rate — anybody with anybody, at a probability set by
// the region. That is right for the mammals and wrong for a tree. A people listed here crosses ONLY
// with the peoples named; everybody else is unlisted and unrestricted.
//
// **Grimlocks are expressly NOT here**, and Frank's reasoning is the reason: *"grimlocks are part of
// a breeding program, so we know they are just like humans, because they are a type of selectively
// bred human."* A selectively bred human is a human.
export const CROSSES_WITH: Record<string, string[]> = {
  Treant: ["Treant", "Dryad"],
  Dryad:  ["Dryad", "Treant"],
};
export const canCross = (a?: string | null, bSp?: string | null) => {
  // ⚠ UNKNOWN IS PERMISSIVE, NOT FORBIDDEN. This returned FALSE for a missing species — and `pairUp`
  // calls it at the door, so every pairing between two people whose species had not been set was
  // silently blocked, and three bond labels became unreachable. **A restriction table must fail
  // OPEN**: the listed peoples are restricted and everybody else, known or not, is not.
  if (!a || !bSp) return true;
  const la = CROSSES_WITH[a], lb = CROSSES_WITH[bSp];
  if (la && la.indexOf(bSp) === -1) return false;
  if (lb && lb.indexOf(a) === -1) return false;
  return true;
};

export const AXES_DEFAULT: any = { sexed: "one", gendered: true, desires: true, romances: true, worships: true, born: true, fluid: false };
export function speciesAxes(sp?: string | null) {
  const a = (sp && SPECIES_AXES[sp]) || {};
  return { ...AXES_DEFAULT, ...a };
}

// ═══════════════════════════ LAYER 4 · SEXUAL ATTRACTION ═══════════════════════════════════════
// Frank's spec: *"Sexual attraction should exist entirely separately from romance. This allows the
// simulation to represent many different combinations naturally WITHOUT SPECIAL-CASE RULES."*
//
// **The last clause is the design test.** Each of these happens to real people, and each costs a
// special case in any model where romance and desire are one number:
//
//   romantic without sexual attraction      high romance, low desire
//   sexual attraction without romance       low romance, high desire
//   friendship without either               affection only — most of a household
//   a long marriage where romance changes   commitment holds while romance moves
//
// WHAT WAS WRONG. `libido` was rolled onto every PERSON and read by NOTHING — the
// written-and-never-read defect for the sixth time today. And being person-level it could express
// none of the four: desire is a fact ABOUT A PAIR, exactly as affection and interest are.

// ---- WHAT WEIGHTS AN ATTRACTION -----------------------------------------------------------------
// Frank names four: sex, species, age range, and optional individual preferences. Gender was already
// there; the other three are new, and each is PER PERSON, because a preference is not a fact about
// the world.
//
// SPECIES. Most people lean toward their own — not from prejudice, which is its own axis, but from
// familiarity — and a minority genuinely do not. The regional interspecies rate says whom a person
// MEETS; this says whom they would look at twice.
export const SPECIES_PREF_OWN = 0.62;
export const SPECIES_PREF_BROAD = 0.24;

// AGE, as a fraction of a life and never in years — the same correction the taboo table needed.
// "Older than themselves" means older IN LIFE, which is the only reading that works across a table
// with elves and thri-kreen at it.
export const AGE_PREFS = ["younger", "near", "older", "any"];
export const AGE_PREF_WEIGHTS: Record<string, number> = { younger: 0.18, near: 0.44, older: 0.20, any: 0.18 };

// ---- THE SCORE ----------------------------------------------------------------------------------
// How strongly would A be drawn to B, all four factors together. 0-100, and the ONLY thing Layer 4
// computes — everything else derives from it. It deliberately says nothing about what anybody does;
// this platform tracks that an attraction exists and stops there.
export function desireBetween(a: any, b: any): number {
  if (!a || !b || a.id === b.id || a.mindless || b.mindless) return 0;
  const byGender = (a.attracted && a.attracted[b.gender || "woman"]) || 0;
  if (byGender < 10) return 0;
  const sp = a.speciesPref || "own";
  const same = a.species === b.species;
  const spMul = sp === "broad" ? 1 : sp === "own" ? (same ? 1.15 : 0.55) : (same ? 0.6 : 1.15);
  const la = biologyOf(a.species).lifespan, lb = biologyOf(b.species).lifespan;
  const gap = (b.age || 30) / lb - (a.age || 30) / la;
  const ap = a.agePref || "near";
  const ageMul = ap === "any" ? 1
               : ap === "near" ? Math.max(0.35, 1.2 - Math.abs(gap) * 2.4)
               : ap === "older" ? Math.max(0.35, 0.7 + gap * 2.0)
               : Math.max(0.35, 0.7 - gap * 2.0);
  // AND THE PERSON'S OWN APPETITE — `libido`, finally read. It scales everything, so somebody at 2
  // is drawn to nobody however compatible. **That is what asexual MEANS in this model** rather than
  // a label somebody set.
  const drive = (a.libido != null ? a.libido : 50) / 55;
  return Math.max(0, Math.min(100, byGender * spMul * ageMul * drive));
}

// ---- THE LABELS, DERIVED ------------------------------------------------------------------------
// *"Orientation labels become descriptive outcomes rather than variables that drive behaviour."*
// Fourth application of the rule in this project. AROMANTIC lives here rather than in Layer 3
// because it is only visible by COMPARING the two systems — somebody who wants people and does not
// want attachment.
export function orientationLabelOf(person: any): string {
  const a = person && person.attracted;
  if (!a) return "unknown";
  const g = person.gender || "woman";
  const same = g === "man" ? a.man : g === "woman" ? a.woman : a.nonbinary;
  const opp = g === "man" ? a.woman : g === "woman" ? a.man : Math.max(a.man, a.woman);
  if (a.nonbinary > Math.max(a.man, a.woman)) return "queer";
  if (same >= 35 && opp >= 35) return "bisexual";
  if (same > opp) return g === "man" ? "gay" : g === "woman" ? "lesbian" : "queer";
  return "heterosexual";
}

export function attractionOf(person: any): string {
  if (!person) return "unknown";
  const rom = (person.profile && person.profile.romantic) != null ? person.profile.romantic : 50;
  const lib = person.libido != null ? person.libido : 50;
  if (lib < 15 && rom < 25) return "asexual and aromantic";
  if (lib < 15) return "asexual";
  if (rom < 20) return "aromantic";
  return orientationLabelOf(person);
}


// ═══════════════════ RELATIONSHIP ORIENTATION — THREE INDEPENDENT AXES ═════════════════════════
// Frank's spec, 1 Aug, and it FIXES a defect rather than adding a feature. The four-year run showed
// every person courting two others simultaneously, which read as farce — and the fault was not that
// people were courting two others. **It was that ALL of them were, uniformly.** Exclusivity was not
// a rule that had been forgotten; it was a VARIABLE that did not exist, so it had no distribution.
//
// His three axes, which are correlated and not identical:
//
//   1 · SEXUAL ORIENTATION      who they can be drawn to        (Layer 4, built)
//   2 · RELATIONSHIP ORIENTATION how many they can love          (this)
//   3 · RELATIONSHIP STRUCTURE   what they actually end up doing (emerges from 1, 2 and opportunity)
//
// AND CONTINUOUS, NOT AN ENUM — his design note and the load-bearing one. *"Two people might both
// identify as polyamorous, yet one happily maintains two lifelong partners while another thrives in
// a large interconnected household."* A boolean cannot tell those apart; four numbers can, and they
// produce structures nobody enumerated.
export const REL_ORIENTATIONS = ["monogamous", "polyamorous", "open"];
export const REL_ORIENTATION_WEIGHTS: Record<string, number> = {
  monogamous: 0.945, polyamorous: 0.020, open: 0.035,
};

// Poly structures, as reported rather than censused — Frank's figures. These are NOT drawn and
// stored: a structure is what a polycule turns out to BE, read off the graph the same way every
// other label in this project is read off its numbers. Kept here as the vocabulary for naming one.
export const POLY_STYLES: Record<string, number> = {
  V: 0.35, kitchen_table: 0.25, parallel: 0.20, triad: 0.10, quad_plus: 0.05, anarchy: 0.05,
};

// PARTNER CAPACITY. *"Most people, monogamous or polyamorous, only have enough emotional bandwidth
// for a limited number of deep relationships."* This is what stops a twelve-person romantic web
// forming unless somebody is genuinely unusual — and it applies to everybody, not only to the poly.
export const CAPACITY_POLY: Record<number, number> = { 2: 0.55, 3: 0.30, 4: 0.10, 5: 0.04, 6: 0.01 };

// JEALOUSY, 0-1, and INDEPENDENT of orientation — which is the subtlest part of the spec and the
// part that does the most work. A monogamous person with low jealousy is not the same as one with
// high; a poly person with some jealousy is extremely common and is a different life from one with
// none. **Drawn separately on purpose**, so the two can disagree, because in people they do.
//
//   0.00 exclusive · 0.25 uncomfortable sharing · 0.50 accepts · 0.75 comfortable · 1.00 prefers shared
//
// EXCLUSIVITY PREFERENCE is what they WANT; jealousy is what it COSTS them when it does not happen.
// Correlated and not the same, and a person can be miserable about a thing they chose.

// ---- SPECIES DEFAULTS, WITH INDIVIDUAL VARIATION ------------------------------------------------
// Frank: *"avoid making polyamory exclusively a human trait. Attach defaults to species while
// allowing individual variation."* So these SHIFT the draw; they never determine it. Every people
// produces every orientation, at different rates — the same discipline as the orientation tables.
export const REL_SPECIES_SHIFT: Record<string, { poly?: number; open?: number; capacity?: number; excl?: number }> = {
  // multipliers on the poly/open shares; capacity and excl are additive nudges
  Elf:         { poly: 3.0, open: 2.0, capacity: 0.5, excl: -0.10 },   // centuries make a long polycule ordinary
  Eladrin:     { poly: 3.0, open: 2.0, capacity: 0.5, excl: -0.10 },
  "Astral Elf": { poly: 3.4, open: 2.2, capacity: 0.6, excl: -0.12 },
  Drow:        { poly: 2.4, open: 2.6, excl: -0.08 },
  Dwarf:       { poly: 1.6, open: 0.4, capacity: 0.2, excl: 0.10 },    // strong pair-bonding, but clan marriages exist
  Duergar:     { poly: 1.4, open: 0.4, excl: 0.10 },
  Halfling:    { poly: 1.8, open: 0.6, capacity: 0.4 },                // family-first and unbothered
  Gnome:       { poly: 1.6, open: 1.2 },
  Human:       { },                                                     // the baseline, named
  Orc:         { poly: 1.2, open: 1.4 },                                // varies by culture rather than biology
  Tiefling:    { poly: 1.6, open: 1.8, excl: -0.06 },
  "Thri-kreen": { poly: 6.0, open: 1.0, capacity: 1.5, excl: -0.35 },  // clutch-bonding: a family IS several adults
  Lizardfolk:  { poly: 3.0, capacity: 0.8, excl: -0.20 },
  Dragonborn:  { poly: 0.5, open: 0.3, excl: 0.15 },                    // very few partners, very long bonds
  Minotaur:    { poly: 2.0, open: 0.8 },                                // herd structures
  Satyr:       { poly: 2.6, open: 3.0, excl: -0.15 },
  Firbolg:     { poly: 1.4, capacity: 0.3 },
};

export function rollRelOrientation(species?: string | null) {
  const sh = (species && REL_SPECIES_SHIFT[species]) || {};
  const poly = REL_ORIENTATION_WEIGHTS.polyamorous * (sh.poly || 1);
  const open = REL_ORIENTATION_WEIGHTS.open * (sh.open || 1);
  const r = Math.random();
  const orientation = r < poly ? "polyamorous" : r < poly + open ? "open" : "monogamous";

  // CAPACITY applies to everybody. A monogamous person's capacity is 1 by definition of the word;
  // everyone else draws from Frank's distribution, nudged by their people.
  let capacity = 1;
  if (orientation !== "monogamous") {
    let r2 = Math.random();
    for (const [n, w] of Object.entries(CAPACITY_POLY)) { r2 -= w; if (r2 <= 0) { capacity = +n; break; } }
    capacity = Math.max(2, Math.min(6, capacity + Math.round(sh.capacity || 0)));
  }

  // EXCLUSIVITY and JEALOUSY are drawn SEPARATELY and are allowed to disagree — that is the whole
  // point. A monogamous person with low jealousy is a different life from one with high; a poly
  // person with some jealousy is extremely common and is not a contradiction.
  const base = orientation === "monogamous" ? 0.86 : orientation === "open" ? 0.42 : 0.22;
  const exclusivity = Math.max(0, Math.min(1, base + (Math.random() - 0.5) * 0.34 + (sh.excl || 0)));
  // LOOSELY coupled, and the first version was not — it tied jealousy to exclusivity hard enough
  // that **a monogamous person with low jealousy was impossible**, measured at 0.0% of 20,000. That
  // person is real and common: somebody who wants one partner and would not be possessive about it.
  // Frank's spec says these are INDEPENDENT and the whole value of the pair is that they can
  // disagree, so the correlation is a lean and not a chain.
  const jealousy = Math.max(0, Math.min(1,
    exclusivity * 0.28 + (Math.random() + Math.random() + Math.random()) / 3 * 0.8 - 0.04));
  return { relOrientation: orientation, partnerCapacity: capacity, exclusivity, jealousy };
}

// ---- AND WHAT THE HOUSEHOLD SAYS ABOUT IT -------------------------------------------------------
// `polyStyleOf` was written and read by nothing but its own test — the SEVENTH instance of that
// defect in one session, and the one I flagged twice and then committed anyway. A shape nobody can
// see is a shape that does not exist.
//
// Keyed by structure, because a V and a triad are genuinely different households to live in, and the
// household would describe them differently. Same rule as every other table here: an observable fact
// and never the conclusion, and never a word a designer would use. Nobody in the fiction says
// "polycule".
export const POLYCULE_SAY: Record<string, string[]> = {
  V: [
    "{a} keeps two sets of hours and has never once been late for either.",
    "There are two people in this house who both wait for {a}, and they have got very good at not minding.",
    "{b} and {c} are perfectly civil about {a}, which took work and shows.",
  ],
  triad: [
    "{a}, {b} and {c} have stopped explaining themselves to anybody and the household has stopped asking.",
    "Three of them came in from the yard together and nobody counted, which is new.",
    "The washing-up arrangement in this house involves three people and works better than most marriages.",
  ],
  kitchen_table: [
    "There is a table in this house where a great many of them sit, and the arrangement of it is nobody else's business.",
    "{a} was asked how it works and gave an answer about the rota, which was not what was being asked and was the whole answer.",
    "Whoever is cooking, several people turn up for it, and none of them look surprised to see each other.",
  ],
  parallel: [
    "{a} keeps two lives and does not mix them, and both of them appear to be going well.",
    "The two halves of {a}'s week do not speak to each other and are not meant to.",
    "{b} knows there is somebody else and has never once asked a question about them.",
  ],
  quad_plus: [
    "The household has stopped trying to work out who belongs to whom and has started just setting more places.",
    "There is a knot of them now that does the work together, eats together, and settles its own arguments before anybody hears.",
  ],
};

// ---- READ THE STRUCTURE OFF THE GRAPH -----------------------------------------------------------
// A polycule's SHAPE is not stored. It is what the relationships turn out to be — the fifth
// application of derive-don't-store in this project, and the one where it matters most: nobody
// chooses to be in a V, they simply are one, and it changes the week it changes.
export function polyStyleOf(person: any, household: any[]): string | null {
  const partners = (household || []).filter((y) => y && y.id !== person.id
    && (person.bonds || []).some((r: any) => r.id === y.id && (r.courtship || 0) > 25));
  if (partners.length < 2) return null;
  // Do the partners have each other? That is the difference between a V and a triad.
  let linked = 0, pairs = 0;
  for (let i = 0; i < partners.length; i++) {
    for (let j = i + 1; j < partners.length; j++) {
      pairs++;
      if ((partners[i].bonds || []).some((r: any) => r.id === partners[j].id && (r.courtship || 0) > 25)) linked++;
    }
  }
  if (partners.length === 2) return linked ? "triad" : "V";
  if (linked === pairs) return "quad_plus";
  if (linked === 0) return "parallel";
  return "kitchen_table";
}


// ═══════════════════════════ LAYER 3 · ROMANTIC ATTACHMENT ═════════════════════════════════════
// Frank's spec: *"Romantic attachment should be its own independent system. It should not be tied
// directly to friendship or sexual attraction."*
//
// **That constraint does all the work.** Four consequences follow from it and each is a case the
// other layers could not hold:
//
//   * two people can be the closest friends in the keep and never court
//   * an ASEXUAL person can court, marry and be devoted — `libido` gates nothing here
//   * somebody can want a person they do not much like, which is a real thing and reads as one
//   * and a crush can be entirely one-sided, because these live on the BOND, and a bond is per-person
//
// So: four more dimensions beside Layer 2's six, on the same record, moving by their own rules.
export const ROMANCE_DIMS = ["interest", "intimacy", "commitment", "courtship"] as const;
export type RomanceDim = typeof ROMANCE_DIMS[number];

export const ROMANCE_MEANING: Record<RomanceDim, string> = {
  interest:   "do they want this person. Rises from proximity and compatibility; NOT from friendship, which is what makes an unrequited crush possible.",
  intimacy:   "how much of themselves the other one has. Needs trust from Layer 2 to grow — the one place romance leans on friendship, and it leans rather than depends.",
  commitment: "would they choose this over other things. Grows slowly, from time and intimacy together, and is what separates a courtship from an attachment.",
  courtship:  "how far it has actually GOT. Only rises when the interest is MUTUAL — a one-sided crush can burn for years and progress nowhere, which is the whole point of tracking it separately.",
};

// ═══════════════════════════ GROUPS — WHAT THE PAIRS ADD UP TO ═════════════════════════════════
// The last gap in the model, and the last one that could be closed without touching the mechanics:
// **everything was pairwise.** Two people who both loathed a third did not become allies, there were
// no cliques, and "the kitchen does not speak to the forge" was a thing the household could BE and
// could not SAY.
//
// TWO HALVES, and the first is the one that matters:
//
//   HOW A GROUP FORMS   the enemy of my enemy, and the friend of my friend. Both are real and both
//                       are pairwise rules that produce a GROUP without anybody modelling one.
//   HOW IT IS READ      derived from the graph, never stored — sixth application of the rule in this
//                       project, and the same reason as always: a stored clique disagrees with its
//                       members the first time somebody falls out.
//
// AND IT STAYS COSMETIC. A faction narrates; it does not slow a craft or cost a defender. See the
// ruling at the top of Layer 2.
export const TRIANGLE_CHANCE = 0.14;       // weekly chance a shared feeling actually gets mentioned
export const TRIANGLE_MIN = 25;            // how strongly both must feel it before it counts

// The prose. {a} and {b} are the two who find each other; {c} is what they have in common.
export const TRIANGLE_SAY = {
  enemy: [
    "{a} and {b} discovered over the washing-up that neither of them can stand {c}, and the discovery took the whole evening.",
    "{a} said something about {c} that {b} had been thinking for a month, and something was settled between them.",
    "{a} and {b} have started sitting together. The seating did not use to mean anything.",
  ],
  friend: [
    "{a} and {b} were both waiting on {c} for the same reason and got to talking instead.",
    "{a} mentioned {c} kindly and {b} agreed at some length, and it went on from there.",
    "{a} and {b} have realised they are both fond of {c}, and are getting on rather better than they were.",
  ],
};

// ---- READING THE GROUPS OFF THE GRAPH -----------------------------------------------------------
// A CLIQUE is a set of people who all like each other. Grown greedily from the warmest pair outward,
// which is both cheap and the way a group actually forms — two people, then whoever fits with both.
export const CLIQUE_MIN_AFFECTION = 30;

export function cliquesOf(household: any[]): any[][] {
  const A = (household || []).filter((x) => x && !x.mindless);
  const likes = (x: any, y: any) => {
    const r = (x.bonds || []).find((z: any) => z.id === y.id);
    return !!r && (r.affection || 0) >= CLIQUE_MIN_AFFECTION;
  };
  const mutual = (x: any, y: any) => likes(x, y) && likes(y, x);
  const used = new Set<string>();
  const out: any[][] = [];
  // Seed from the warmest remaining pair, then admit anybody who is mutual with EVERY member — a
  // clique where two people cannot stand each other is not a clique.
  const pairs: any[] = [];
  A.forEach((x) => A.forEach((y) => { if (x.id < y.id && mutual(x, y)) pairs.push([x, y]); }));
  const warmth = (p: any[]) => {
    const r1 = (p[0].bonds || []).find((z: any) => z.id === p[1].id) || {};
    const r2 = (p[1].bonds || []).find((z: any) => z.id === p[0].id) || {};
    return (r1.affection || 0) + (r2.affection || 0);
  };
  pairs.sort((p, q) => warmth(q) - warmth(p));
  pairs.forEach(([x, y]) => {
    if (used.has(x.id) || used.has(y.id)) return;
    const g = [x, y];
    A.forEach((z) => { if (!used.has(z.id) && !g.includes(z) && g.every((m) => mutual(m, z))) g.push(z); });
    if (g.length >= 2) { g.forEach((m) => used.add(m.id)); out.push(g); }
  });
  return out;
}

// A FACTION is two cliques that dislike each other across the line. This is the one that produces
// "the kitchen does not speak to the forge", and it is only visible at the group level — no pair in
// it need be especially hostile.
export const FACTION_MAX_AFFECTION = 5;

export function factionsOf(household: any[]): { a: any[]; b: any[]; coldness: number } | null {
  const groups = cliquesOf(household).filter((g) => g.length >= 2);
  if (groups.length < 2) return null;
  let worst: any = null, worstScore = 0;
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      let total = 0, n = 0;
      groups[i].forEach((x: any) => groups[j].forEach((y: any) => {
        const r = (x.bonds || []).find((z: any) => z.id === y.id);
        total += r ? (r.affection || 0) : 0; n++;
      }));
      const avg = n ? total / n : 0;
      if (avg <= FACTION_MAX_AFFECTION && -avg + 1 > worstScore) { worstScore = -avg + 1; worst = { a: groups[i], b: groups[j], coldness: -avg }; }
    }
  }
  return worst;
}

// What the household says when it has split. Read once a week, never stored.
export const FACTION_SAY = [
  "There are two tables at supper now. Nobody moved them and nobody will say when it started.",
  "The work is getting done and it is getting done in two halves, and the halves do not consult each other.",
  "Somebody asked a perfectly ordinary question across the hall and got a perfectly ordinary answer, and the whole room noticed how careful both of them were.",
  "It has stopped being about whatever it was about. It is about sides now, and everybody has one.",
  "{a} and {b} were civil to each other in front of everybody, at length, which fooled nobody.",
];

// ---- SHARED HISTORY, AND WHY IT IS NOT FAMILIARITY ----------------------------------------------
// Frank, 1 Aug: *"Each relationship should also accumulate shared history. This is separate from
// familiarity... Shared history should strengthen trust, affection and loyalty over time while
// making long-standing relationships MORE RESILIENT."*
//
// **The distinction is exact and the resilience is the payoff.** Familiarity is how well you KNOW
// somebody — it rises with every interaction including the bad ones, which is what lets two people
// know each other perfectly and detest each other. History is what you have BEEN THROUGH together,
// and only the things that count add to it: a shared meal is worth 1, surviving a siege is worth 5.
//
// **Why it matters mechanically:** a relationship with history behind it does not break over one bad
// week. That is why an old marriage survives a year that would end a new one, and it is a thing no
// amount of affection can express — affection is how you feel NOW; history is what you would be
// throwing away.
export const HISTORY_RESILIENCE_AT = 40;   // history at which a bad event costs about half
export const HISTORY_MAX_DAMPEN = 0.65;    // and never more than this, because nothing is unbreakable

// How much of a negative event actually lands, given what these two have been through. Positive
// events are NOT dampened — history makes you harder to lose, not harder to please.
export function historyDampen(history: number): number {
  const h = Math.max(0, history || 0);
  return 1 - HISTORY_MAX_DAMPEN * (h / (h + HISTORY_RESILIENCE_AT));
}

// ---- AND THE PERSONALITIES OF BOTH PARTICIPANTS -------------------------------------------------
// Frank: *"Each event modifies one or more relationship values ACCORDING TO THE PERSONALITIES OF
// BOTH PARTICIPANTS."* Today `bondEvent` applies flat deltas — the same argument costs a forgiving
// person and a quarrelsome one exactly the same, which is the one thing Layer 1 exists to prevent.
//
// Reads the EFFECTIVE profile, so somebody the household has ground down over a year takes a rebuke
// as the person they have become rather than the person who arrived.
export function eventScaleFor(profile: any, axis: string, delta: number): number {
  if (!profile) return 1;
  const agr = profile.agreeableness != null ? profile.agreeableness : 50;
  const sta = profile.stability != null ? profile.stability : 50;
  const hon = profile.honor != null ? profile.honor : 50;
  if (delta < 0) {
    // A forgiving, steady person takes a bad turn lighter; a contrary or brittle one takes it harder.
    return Math.max(0.35, Math.min(1.9, 1.55 - (agr / 100) * 0.6 - (sta / 100) * 0.45));
  }
  // And a warm person is moved MORE by a good one, which is the same fact read the other way.
  if (axis === "trust") return Math.max(0.5, Math.min(1.6, 0.55 + (hon / 100) * 0.9));
  return Math.max(0.5, Math.min(1.6, 0.6 + (agr / 100) * 0.85));
}

// ---- THE STATES, DERIVED ------------------------------------------------------------------------
// Same rule as everywhere else: labels are a VIEW. And read from ONE SIDE, because the asymmetry is
// the interesting part — "secret crush" only exists as a thing one person has.
export const ROMANCE_STATES: Array<{ label: string; when: (r: any, self?: any, other?: any) => boolean }> = [
  { label: "married",       when: (_r, self, other) => !!self && !!other && self.spouseId === other.id },
  { label: "engaged",       when: (r) => r.commitment > 55 && r.courtship > 60 },
  { label: "courting",      when: (r) => r.courtship > 25 },
  { label: "former lovers", when: (r) => r.courtship <= 25 && (r.wasLovers || 0) > 0 },
  // MUTUAL means the OTHER side wants it too, which is a fact about their record and not this one.
  { label: "mutual crush",  when: (r, self, other) => r.interest > 35 && !!other && ((other.bonds || []).find((z: any) => z.id === (self && self.id)) || {}).interest > 35 },
  { label: "secret crush",  when: (r) => r.interest > 35 },
  { label: "a passing thing", when: (r) => r.interest > 15 },
  { label: "nothing of the kind", when: () => true },
];

// ---- HOW IT GROWS -------------------------------------------------------------------------------
// Gradually, through repeated interactions and shared history — Frank's phrasing, and the numbers
// are small on purpose. A courtship that resolves in three weeks is not a courtship.
//
// The Exchange's own reading. Frank's to red-pen.
export const ROMANCE_INTEREST_STEP = 2.5;    // per week of working near somebody compatible
export const ROMANCE_INTIMACY_STEP = 1.8;    // per week, once there is trust to build on
export const ROMANCE_COMMIT_STEP = 0.9;      // the slowest — this is the one that takes a year
export const ROMANCE_COURTSHIP_STEP = 2.2;   // only when it is mutual
export const ROMANCE_COOL = 0.6;             // per week apart, so a thing nobody feeds fades
export const ROMANCE_ENGAGED_MARRIES = 0.06; // weekly chance an engagement becomes a marriage

// Could this person want that one AT ALL? The only place Layer 4's weights touch Layer 3 — they gate
// whether interest can START, and nothing after. **`libido` is deliberately not consulted**: an
// asexual person can want somebody's company for the rest of their life, and the model would be
// poorer and wrong for conflating the two.
export function romanceGate(a: any, b: any): number {
  if (!a || !b || a.id === b.id) return 0;
  if (a.mindless || b.mindless) return 0;
  const drawn = (a.attracted && a.attracted[b.gender || "woman"]) || 0;
  if (drawn < 25) return 0;
  const rom = (a.profile && a.profile.romantic) != null ? a.profile.romantic : 50;   // appetite for attachment
  return Math.max(0, Math.min(1, (drawn / 100) * (0.35 + rom / 100)));
}

// ---- WHAT A HOUSEHOLD KNOWS ---------------------------------------------------------------------
// Frank's ruling, 1 Aug: orientation is CONSTITUTIONAL and culture decides only whether it is spoken
// of. That was the whole reason for splitting biology from openness — and `CULTURE_OPENNESS` was
// then read by nothing except the labour split. **A number with no consumer**, which is the exact
// defect this project has fixed four times today, created deliberately and left sitting.
//
// So here is the consumer. A relationship a culture would make difficult is CONCEALED: the two
// people know exactly what it is, and nobody else does. Mechanically that is not a new system — it
// is Layer 2 used properly:
//
//   the pair    affection, trust and loyalty accumulate normally. Nothing about how they feel changes.
//   everybody   FAMILIARITY with the pair stops rising. The household does not learn what it is not
//   else       being shown, and familiarity is the dimension that measures being known.
//
// That is why familiarity was worth having as its own axis. "We are close and nobody knows" is a
// sentence the six dimensions can hold and a single weight could not.
//
// CONCEALMENT IS NOT PERMANENT. It is a state on the relationship, and it ends — the household works
// it out, or the couple stops bothering, or somebody says something. `CONCEAL_SLIP` is the weekly
// chance per couple that it comes out anyway, and it rises the longer they have been at it: people
// are bad at this for a long time and then, all at once, everybody knows.
export const CONCEAL_SLIP_BASE = 0.03;
export const CONCEAL_SLIP_PER_WEEK = 0.004;

// Would this couple hide? Read off the LESS open of the two cultures, because it takes only one
// household to be difficult about it — and scaled by how much a culture would actually mind. A
// same-people, opposite-gender couple is unremarkable everywhere and never conceals.
// WHAT A HOUSEHOLD WOULD REMARK ON (Frank, 1 Aug). The first version only knew about same-gender
// couples, which he corrected: *"same sex relationships are not the only taboo... cultural opinions
// of races, biological improbabilities, incompatibilities that break the mold."*
//
// Five kinds, and each one produces a DIFFERENT relationship rather than a different number — the
// glimpse lines are keyed to the kind, so an age-gap romance reads nothing like a species-gap one.
// Returned rather than summed so the caller knows WHICH, because that is what makes it a story.
export const TABOO_KINDS = ["kindred", "years", "peoples", "nature", "station"];

export function tabooOf(a: any, b: any): { kind: string; weight: number } | null {
  if (!a || !b) return null;
  const out: Array<{ kind: string; weight: number }> = [];
  if (a.gender && b.gender && a.gender === b.gender) out.push({ kind: "kindred", weight: 0.75 });
  if (a.gender === "nonbinary" || b.gender === "nonbinary") out.push({ kind: "kindred", weight: 0.35 });
  // YEARS — measured in LIFE STAGE, not in years, and the first version got this wrong in a way that
  // swallowed everything else. It compared the raw gap against the shorter lifespan, so ANY pair
  // whose peoples live different lengths tripped "years" at maximum weight and drowned out the more
  // interesting kinds: Frank's gnome-and-thri-kreen came back as an age scandal rather than the
  // fascinating mismatch of nature he was actually pointing at.
  //
  // The honest question is how far through their own life each of them is. An eighty-year gnome is a
  // fifth of the way through; an eighteen-year thri-kreen is well past half. **The thri-kreen is the
  // OLDER of the two in every sense that matters**, and there is no age gap here at all. Whereas a
  // four-hundred-year elf at half her life beside a twenty-two-year orc at a third of his is a real
  // one, and it is the case Frank named.
  const la = biologyOf(a.species).lifespan, lb = biologyOf(b.species).lifespan;
  const stage = Math.abs((a.age || 30) / la - (b.age || 30) / lb);
  if (stage > 0.18) out.push({ kind: "years", weight: Math.min(0.9, stage * 2.2) });
  // PEOPLES. Weighted by how far apart they are — dwarf and gnome is a raised eyebrow; elf and orc
  // is the talk of the valley.
  if (a.species !== b.species) {
    const far = Math.abs(la - lb) / 900 + (SPECIES_NAMING_FOR(a.species) === SPECIES_NAMING_FOR(b.species) ? 0 : 0.35);
    out.push({ kind: "peoples", weight: Math.min(0.85, 0.25 + far) });
  }
  // NATURE. A pair-bonder and a creature that clutches or hives — Frank's gnome and thri-kreen. This
  // is not disapproval so much as bafflement, and it reads that way.
  const pa = pairingOf(a.species).kind, pb = pairingOf(b.species).kind;
  // WEIGHTED ABOVE "peoples" ON PURPOSE. A lifespan gap inflates the species score, so nature never
  // won and Frank's gnome-and-thri-kreen kept reading as a species difference — which is true and is
  // the LESS interesting truth. **A pair-bonder and a creature that hives is a strictly more specific
  // fact than "two different peoples"**, and the household would talk about that one.
  if (pa !== pb) out.push({ kind: "nature", weight: 0.92 });
  // STATION. An estate's household IS a class structure and always was.
  const rank = { gentry: 3, professional: 2, craft: 1, labouring: 0 } as any;
  const dr = Math.abs((rank[a.socialClass] ?? 1) - (rank[b.socialClass] ?? 1));
  if (dr >= 2) out.push({ kind: "station", weight: 0.3 * dr });
  if (!out.length) return null;
  return out.sort((x, y) => y.weight - x.weight)[0];       // the LOUDEST one is the one people talk about
}

export function concealChance(a: any, b: any): number {
  const t = tabooOf(a, b);
  if (!t) return 0;
  const rigidity = 1 - Math.min(opennessOf(SPECIES_NAMING_FOR(a.species)), opennessOf(SPECIES_NAMING_FOR(b.species)));
  return Math.max(0, Math.min(0.95, rigidity * t.weight * 1.4));
}

// The naming culture for a people, without importing the registry (which imports THIS file). Kept as
// a late-bound lookup rather than a duplicated table, so there is still exactly one mapping.
let _namingLookup: Record<string, string> | null = null;
export const registerNamingLookup = (m: Record<string, string>) => { _namingLookup = m; };
export const SPECIES_NAMING_FOR = (sp?: string | null) => (sp && _namingLookup && _namingLookup[sp]) || "human";

// ---- WHAT A CAREFUL READER CATCHES --------------------------------------------------------------
// Frank, 1 Aug: *"Concealing a relationship is realistic but narratively dull. The player should be
// able to catch glimpses of the relationship if they read carefully."*
//
// He is right and the omission was mine: concealment was mechanically real and **produced nothing to
// read**, which is the worst combination a system can have. A hidden thing the player cannot glimpse
// is identical, from the outside, to no thing at all.
//
// THE RULE FOR WRITING THESE. A glimpse states an OBSERVABLE FACT and never the conclusion. Nobody
// is described as being in love; somebody is described as being where they had no reason to be. The
// player does the arithmetic, which is the whole pleasure of it — and if they are skimming they read
// past it, which is also correct.
//
// Keyed by the KIND of taboo, so an age-gap romance reads nothing like a species-gap one. {a} and
// {b} are the pair; a line may name only one of them, which is often better.
export const GLIMPSES: Record<string, string[]> = {
  kindred: [
    "{a} and {b} came in from the yard at different times this morning, which would be unremarkable if they had not gone out together.",
    "There is a place at the long table where {a} sits, and it is not the nearest one to the fire, and it has not been the nearest one for weeks.",
    "{b} laughed at something {a} said that nobody else heard, and then looked at the floor for a while.",
    "The household has stopped putting {a} and {b} on the same errand, and nobody can remember deciding to.",
    "{a} was seen mending something of {b}'s. It was not {a}'s to mend and {b} had not asked.",
  ],
  years: [
    "{a} has taken to telling {b} about things that happened before anyone else here was born, and {b} listens like it matters.",
    "Somebody asked {a} how old {b} is, and {a} answered without having to think about it.",
    "{b} said something thoughtless about the old days and {a} did not correct them, which everyone noticed because {a} corrects everybody.",
    "{a} was overheard using a word nobody has used in two hundred years, and {b} knew what it meant.",
    "There is an age between {a} and {b} that neither of them mentions, and they have got very good at not mentioning it.",
  ],
  peoples: [
    "{a} has learned three words of {b}'s language and uses all of them badly and often.",
    "{b} was eating something at the long table that nobody else here would eat, and {a} tried it, and did not make a face.",
    "{a} and {b} have worked out a way of standing near each other that accounts for the difference in height, and it took practice.",
    "{a} asked, very carefully, what {b}'s people do about a thing, and listened to the whole answer.",
    "Somebody said something about {b}'s kind in the kitchen and {a} left the room rather than say what {a} was thinking.",
  ],
  nature: [
    "{b} does not do the things people do, and {a} has stopped expecting them to, which is its own kind of arrangement.",
    "{a} has been reading about {b}'s people. There is no reason for {a} to be reading about {b}'s people.",
    "Whatever passes between {a} and {b} does not look like courtship and everyone has quietly agreed to stop trying to name it.",
    "{b} brought {a} something. Nobody could say what it was for and {a} has kept it.",
    "The household has noticed that {a} understands {b} and cannot explain how, and has stopped asking.",
  ],
  station: [
    "{a} was in a part of the house {a} has no business in, carrying nothing, and had an answer ready.",
    "The accounts show a small kindness done for {b} that nobody ordered and nobody has queried.",
    "{a} spoke to {b} the way you speak to somebody of your own standing, in front of two other people, and then changed the subject.",
    "{b} has been given the easier of two jobs three times running, and the person giving out the jobs is {a}.",
    "There is a way {a} says {b}'s name that is not how {a} says anybody else's.",
  ],
  default: [
    "{a} and {b} were both late, separately, and gave the same reason.",
    "Somebody has been leaving the side door unbarred at night. Nobody will say who.",
    "{a} looked up when {b} came into the hall, and then made rather a point of not looking up again.",
  ],
};

// ═══════════════════════ THE THREE AXES OF A SLICE-OF-LIFE MOMENT ══════════════════════════════
// Frank's architecture, 1 Aug: *"when we're generating these slice of life moments, we are pulling
// from the facility. We are pulling from the region. We are pulling from the particular race
// involved."* And within a species, three DIFFERENT tables, because *"the way an orc responds to a
// taboo and the way an orc courts someone and the way an orc behaves in normal everyday life are
// three entirely separate things."*
//
// THIS IS THE STRUCTURE, NOT THE CONTENT. Roughly 3,100 sentences are wanted — 1,920 for species
// (32 peoples x 3 tables x 20) and up to 1,200 for facility-by-order. That is an authoring run, and
// it belongs beside the facility minting run rather than in front of it.
//
// WHAT IS BUILT HERE is the mechanism and the fall-through, so writing can be INCREMENTAL: a people
// with no entry uses the default and nothing breaks, exactly as an unminted facility does. Three
// peoples are seeded as the PATTERN so the register is fixed before the volume is written.
//
// {a} is the person, {b} the other party where there is one, {room} the facility.
export const SPECIES_FLAVOR: Record<string, { slice?: string[]; romance?: string[]; taboo?: string[] }> = {
  // ═══ ORC ═══ Direct, physical, unsentimental — and NOT stupid, which is the trap. An orc says the
  // thing, does the thing, and lets both stand. Warmth arrives as action and almost never as words.
  Orc: {
    slice: [
      "{a} settled a disagreement in the {room} by being louder and then, unexpectedly, by being right.",
      "{a} ate standing up, finished before anyone else had started, and went back to work.",
      "{a} carried something two people had been arguing about how to carry.",
      "{a} told a story at the long table that was mostly about a fight and entirely about somebody who is dead.",
      "{a} checked the door bar on the way past. {a} always checks the door bar on the way past.",
      "{a} was asked whether a thing was finished and said no, and went and finished it.",
      "{a} broke something by being stronger than the job wanted, and mended it better than it was.",
      "{a} slept badly and said so, which nobody had asked and everybody was glad to know.",
      "{a} took the heaviest end without being asked and without making a point of it.",
      "{a} laughed at something nobody else found funny, at length, and would not explain.",
      "{a} counted the household at supper, quietly, the way you count a war-band.",
      "{a} gave a straight answer to a question everybody else had been polite about.",
      "{a} sharpened something that did not need it because the hands wanted work.",
      "{a} stood in a doorway too long, looking at nothing, and moved on when noticed.",
      "{a} put a hand on somebody's shoulder on the way past and said nothing at all.",
      "{a} ate what was put down without comment, which from {a} is a compliment to the cook.",
      "{a} was wrong about something in front of everybody and said so, once, and that was the end of it.",
      "{a} sat with their back to the wall out of a habit no roof has ever cured.",
      "{a} won an argument nobody knew they were having and looked pleased for an hour.",
      "{a} did a thing the hard way on purpose, having been told there was an easier one.",
    ],
    romance: [
      "{a} brought {b} the better share and did not make anything of it.",
      "{a} stood where {b} would have to walk round, and {b} walked round, and neither said anything.",
      "{a} named {b} in front of the household as somebody {a} would go out beside, which from {a} is a great deal.",
      "{a} took a job {b} had been dreading and had it done before {b} came looking for it.",
      "{a} said {b}'s name in the middle of a story that did not need it and carried on.",
      "{a} mended a thing of {b}'s badly, and {b} has kept it that way.",
      "{a} walked {b} back across the yard in the dark for no reason either of them offered.",
      "{a} lost an arm-wrestle to {b} in a way that fooled precisely nobody.",
      "{a} keeps the seat beside them clear at supper and does not say who for.",
      "{a} asked {b} a question about {b}'s people and listened to the whole answer without interrupting once.",
      "{a} was short with everybody in the {room} except {b}, all week, and did not notice doing it.",
      "{a} brought {b} something from outside the walls that was of no use whatsoever.",
      "{a} stood between {b} and a raised voice before anybody knew there was going to be one.",
      "{a} told {b} the true version of a story {a} tells everybody else differently.",
      "{a} said {b} was wrong, plainly, in front of others, and then took {b}'s side anyway.",
      "{a} has learned which of the bread {b} likes and gets to it first.",
      "{a} let {b} win an argument, which {a} has never once done for anybody.",
      "{a} sat up with {b} over nothing until the fire was down to embers.",
      "{a} said the thing out loud, badly, and {b} understood it perfectly.",
      "{a} was asked about {b} and grinned, and that was the whole answer.",
    ],
    taboo: [
      "{a} was asked about {b} and said nothing at all, which from {a} is louder than a denial.",
      "{a} has stopped bringing {b} up in conversation, having previously brought {b} up in every conversation.",
      "Somebody made a remark about {b}'s kind and {a} put down what {a} was holding, carefully, and left.",
      "{a} has taken to leaving the {room} whenever the talk turns to who is walking out with whom.",
      "{a} has become very interested in a piece of work that happens to be near where {b} is.",
      "{a} answered a direct question with a joke, which {a} does not do, and everybody let it pass.",
      "{a} took a long way round the yard that goes past nothing except where {b} works.",
      "{a} was seen laughing and stopped when the door opened.",
      "{a} has been unusually careful about who is in the room before speaking.",
      "{a} said {b}'s name once this week and then talked about the weather for some time.",
      "{a} does not sit near {b} at supper any more, which is new, and is not because they quarrelled.",
      "{a} defended {b} over something trivial with a heat the thing did not deserve.",
      "{a} has started doing a chore at a different hour, and so, separately, has {b}.",
      "Somebody asked {a} straight out and got a long look and no answer.",
      "{a} keeps something small in a pocket and checks it is there without looking.",
      "{a} was asked whether anything was the matter and said no, twice, and once too firmly.",
      "{a} has stopped drinking with the others on the nights {b} is not there.",
      "{a} gave a reason for being somewhere that was true and was not the reason.",
      "{a} has been kinder than usual to everybody, which is how {a} hides one kindness in a crowd.",
      "{a} said out loud that it was nobody's business, and nobody had asked.",
    ],
  },
  // ═══ GNOME ═══ No homeland to speak of. **Lantan is half-mythical** and the rest of gnomekind is a
  // dozen families at a time, well hidden in wild country or tucked into somebody else's city as a
  // neighbourhood. They are the only people in Faerun who are everywhere and nowhere, and four
  // hundred years is long enough to be very good at something and still be curious about it.
  //
  // The voice: cheerfully technical, incapable of leaving a thing unimproved, and privately aware
  // that everybody finds them a little much.
  Gnome: {
    slice: [
      "{a} improved something nobody had asked to have improved and was very pleased about it.",
      "{a} explained the mechanism at length to somebody who had asked what time it was.",
      "{a} said Lantan the way people say a place they are not certain is real.",
      "{a} took a thing apart to see, and it did go back together, eventually.",
      "{a} has been alive for two hundred years and is still delighted by a good hinge.",
      "{a} counted the households in the district and found there were four gnomes and knew all of them.",
      "{a} said gnomes do not have a country, we have neighbours, and seemed content with that.",
      "{a} named eleven uses for a thing that has one.",
      "{a} was underfoot for an entire morning and got more done than anybody.",
      "{a} keeps a box of parts from things that no longer exist.",
      "{a} said the tall folk build for a lifetime and gnomes build for four, and it shows.",
      "{a} noticed a fault in the {room} that has been there since before the household arrived.",
      "{a} laughed at {a}'s own joke first and loudest, as always.",
      "{a} was told to stop tinkering and agreed sincerely and did not stop.",
      "{a} said hiding is a craft and being visible is a decision, and did not explain further.",
      "{a} has a name for every tool including the ones that came with names.",
      "{a} was asked a simple question and gave a correct and exhausting answer.",
      "{a} said the great thing about four hundred years is you can afford to be wrong for fifty.",
      "{a} apologised for talking too much and then continued for some while.",
      "{a} sat very still watching something work, which is the only time {a} is quiet.",
    ],
    romance: [
      "{a} made {b} something with far too many moving parts.",
      "{a} explained the mechanism to {b} and {b} asked a question, and {a} has not recovered.",
      "{a} said {b} was the first person to let {a} finish a sentence about gears.",
      "{a} took {b} to see a thing {a} had built and was almost too nervous to open the door.",
      "{a} gave {b} something from the box of parts from things that no longer exist.",
      "{a} said gnomes do not have a country, we have neighbours, and moved next door.",
      "{a} named a tool after {b} and it is the good one.",
      "{a} stopped tinkering when {b} came in, which {a} has never done for anybody.",
      "{a} said four hundred years is long and asked what {b} thought about that, carefully.",
      "{a} laughed at {b}'s joke before {a}'s own, which has never happened.",
      "{a} improved something of {b}'s and then put it back exactly as it was.",
      "{a} said hiding is a craft and that {a} had stopped practising it.",
      "{a} told {b} about Lantan and whether {a} thinks it is real.",
      "{a} was quiet for an entire evening, watching {b} work.",
      "{a} counted the gnomes in the district and then counted {b} as well.",
      "{a} apologised for talking too much and {b} said do not, and {a} thinks about that a lot.",
      "{a} built a second chair into a bench that had not needed one.",
      "{a} said the tall folk build for a lifetime and asked how long {b} was building for.",
      "{a} let {b} take a thing apart and did not once flinch.",
      "{a} sat very still, watching {b}, which is the only time {a} is quiet.",
    ],
    taboo: [
      "{a} has been improving things at hours when nothing needs improving.",
      "{a} was asked about {b} and explained a mechanism.",
      "{a} has gone very quiet, which from {a} is deafening.",
      "{a} said it would make things awkward for {b} and would not say for whom else.",
      "{a} took the tool named after {b} out of the roll.",
      "{a} went to see about a fitting when the talk turned to who was walking out with whom.",
      "{a} said hiding is a craft, and had started practising again.",
      "{a} has stopped laughing first, which was {a}'s whole manner.",
      "{a} was asked whether {a} was courting and gave eleven uses for a thing that has one.",
      "{a} keeps something in the box of parts that is not a part.",
      "{a} started an argument about a hinge that was not about the hinge.",
      "{a} said 'it is a small matter' about a thing {a} has been up three nights over.",
      "{a} has been counting the gnomes in the district again and stopping at four.",
      "{a} apologised for talking too much and then did not talk for two days.",
      "{a} built something with no purpose whatsoever and would not say what it was for.",
      "{a} said four hundred years is long, and it did not sound like an advantage.",
      "{a} has stopped taking things apart entirely.",
      "{a} was seen at the workbench at three in the morning doing nothing at all.",
      "{a} said 'it is nothing' and then improved something violently for an hour.",
      "{a} sat very still watching nothing work.",
    ],
  },
  // ═══ DROW ═══ **A drow at a surface keep has almost certainly left something.** Menzoberranzan is
  // a matriarchy under Lolth where the worship of any other god is forbidden, the noble Houses
  // destroy each other by law and custom, and males are held worthless by doctrine — which is why
  // the male ones defect more and why Vhaeraun is worshipped in secret. Time is told by Narbondel,
  // a spire that is lit each day and burns down.
  //
  // The 5e line that shapes the whole voice: *"In Menzoberranzan, romance is a luxury enjoyed
  // between women. Men are mostly present for propagation. Here on the surface, gender does not
  // define one's role so strictly."* A drow up here is somebody RECALIBRATING, constantly, and
  // getting it slightly wrong in public.
  Drow: {
    slice: [
      "{a} deferred to the wrong person out of habit and corrected it a beat too late.",
      "{a} does not say the name of the goddess and has not for years.",
      "{a} was asked about family and named a House rather than people.",
      "{a} still tells the hour by a spire that is nine hundred miles below and does the arithmetic anyway.",
      "{a} said the surface is loud, and meant the daylight rather than the noise.",
      "{a} watched two people argue and was visibly waiting for one of them to be killed.",
      "{a} said trust is a thing surface folk hand out like bread, in a tone that was almost admiring.",
      "{a} has never once left a room without knowing where everybody in it was.",
      "{a} said men are not worthless here and said it as new information, to {a}.",
      "{a} keeps a blade {a} does not need and will not be parted from.",
      "{a} was startled by an unearned kindness and covered it badly.",
      "{a} said the Academy taught three things and named all three without warmth.",
      "{a} has been up here eleven years and still eats facing the door.",
      "{a} said nobody down there dies of old age, as a plain fact about the place.",
      "{a} does not drink anything {a} did not pour.",
      "{a} said House politics is not politics, it is a hunting season with rules.",
      "{a} was asked whether {a} missed it and gave a very short answer.",
      "{a} finds the household's quarrels baffling because nobody is trying to end anybody.",
      "{a} corrected somebody's Undercommon and then apologised for having the correction.",
      "{a} stood in the shade at midday, which {a} does, and calls it habit.",
    ],
    romance: [
      "{a} let {b} pour, and drank it.",
      "{a} said that down there this sort of thing was a luxury for women of rank, and up here it is apparently just something people do.",
      "{a} told {b} the House name and what happened to it.",
      "{a} said {b}'s name in the drow fashion and then in the surface one, testing both.",
      "{a} sat with {b} with {a}'s back to the door.",
      "{a} said the goddess's name once, to {b}, and nothing came of it, which was the point.",
      "{a} gave {b} the blade {a} does not need.",
      "{a} asked {b} what people up here do about this, and was asking sincerely.",
      "{a} said {b} had never once tried to place {a} in a hierarchy.",
      "{a} stopped doing the arithmetic on the spire.",
      "{a} was startled by a kindness and this time said thank you properly.",
      "{a} told {b} what the Academy actually taught, all three parts.",
      "{a} said nobody down there dies of old age and that {a} intended to.",
      "{a} corrected {b}'s Undercommon and then taught {b} the rest of the sentence.",
      "{a} stood in the sun for a while because {b} was standing in it.",
      "{a} said trust is handed out like bread up here and took some.",
      "{a} named {b} to another drow, in Undercommon, in a tone that carried a warning to the drow.",
      "{a} said the surface is loud and had stopped minding.",
      "{a} let {b} stand behind {a} and did not turn round.",
      "{a} slept without waking, which {a} says has not happened since the Academy.",
    ],
    taboo: [
      "{a} has gone back to knowing where everybody in the room is.",
      "{a} was asked about {b} and named a House.",
      "{a} has started doing the arithmetic on the spire again.",
      "{a} said it would mark {b}, and {a} means marked in a way surface folk do not.",
      "{a} took the blade back.",
      "{a} went to check the doors when the talk turned to who was walking out with whom.",
      "{a} said such things were a luxury where {a} came from, and it did not sound like a remark about elsewhere.",
      "{a} has stopped letting anybody pour.",
      "{a} was asked whether {a} was courting and said drow do not use that word.",
      "{a} has been eating facing the door again after four years of not.",
      "{a} started a quarrel and was visibly appalled at how far it did not go.",
      "{a} said 'it is a House matter' about a House that no longer exists.",
      "{a} keeps something of {b}'s where a drow keeps a thing.",
      "{a} corrected somebody's Undercommon savagely and apologised at once.",
      "{a} stood in the shade at midday and stayed there most of the afternoon.",
      "{a} said nobody down there dies of old age, and this time it was about a decision.",
      "{a} has stopped saying the goddess's name, having briefly been able to.",
      "{a} was seen standing where {a} could watch a door {a} has no reason to watch.",
      "{a} said 'it is nothing' in Undercommon, where nobody could check.",
      "{a} slept badly again, and mentioned it, which {a} never does.",
    ],
  },
  // ═══ TIEFLING ═══ Marked from birth by a bargain somebody else made, usually generations back.
  // A hundred years of life and every one of them beginning with a stranger's first reaction. They
  // are not a nation and have no homeland — most are born to human families who are as surprised as
  // anybody. The defining social fact is that people decide about them before they speak.
  //
  // The voice: pre-emptive, wry, extremely good at reading a room, and tired of being read.
  Tiefling: {
    slice: [
      "{a} answered the question people were not asking before they could ask it.",
      "{a} was stared at in the market and did the whole shopping anyway.",
      "{a} said the bargain was made nine generations back and {a} has still not seen the goods.",
      "{a} keeps the hood up in some districts and does not make a thing of it.",
      "{a} was born to human parents who were as surprised as anybody, and says so lightly.",
      "{a} has a joke ready about {a}'s own appearance and deploys it before anybody else can.",
      "{a} read the room in one glance and adjusted, which {a} does without noticing.",
      "{a} was refused service once and now names the establishment in conversation, cheerfully.",
      "{a} said a hundred years is enough to get very tired of the same first sentence.",
      "{a} is unfailingly polite to people who are visibly working out how to be polite.",
      "{a} said the tail is not prehensile and has answered that eleven thousand times.",
      "{a} did the work twice as well because the first time was never going to be enough.",
      "{a} has three friends and would go into the ground for all of them.",
      "{a} said nobody chooses their grandmother's arrangements.",
      "{a} laughed at a joke about tieflings, genuinely, and it made the teller uncomfortable.",
      "{a} named a temple {a} is welcome in and looked pleased about the shortness of the list.",
      "{a} was asked what {a} was and said the name of the village {a} grew up in.",
      "{a} noticed a child staring and pulled a face at them, which fixed it.",
      "{a} said Asmodeus can keep the credit and the blame.",
      "{a} stood in a doorway a beat before entering, out of a habit thirty years old.",
    ],
    romance: [
      "{a} did not make the joke first, for once, and waited to see what {b} would say.",
      "{a} said {b} had never once looked at {a} and then looked again.",
      "{a} told {b} about the bargain, nine generations back, and what {a} thinks of it.",
      "{a} put the hood down in a district where {a} keeps it up.",
      "{a} said {b} was the fourth, and would not explain until asked, and then explained.",
      "{a} was asked what {a} was, by {b}, and it was not that question.",
      "{a} said a hundred years is not long and that {a} had stopped counting it as short.",
      "{a} let {b} touch the horns, having let nobody.",
      "{a} named {b}'s village the way {a} names {a}'s own.",
      "{a} stopped answering the unasked question when {b} was in the room.",
      "{a} said Asmodeus can keep the credit and that {a} would keep this.",
      "{a} took {b} to the temple {a} is welcome in.",
      "{a} did the work once, properly, and did not do it twice.",
      "{a} said nobody chooses their grandmother's arrangements and that {a} chose this.",
      "{a} laughed at {b}'s bad joke about tieflings and told a worse one back.",
      "{a} introduced {b} to the three, formally, which took nerve.",
      "{a} said the first sentence people say to {a} had stopped mattering.",
      "{a} pulled a face at a staring child while holding {b}'s hand.",
      "{a} stood in the doorway a beat and then did not, because {b} was inside.",
      "{a} said {b} should think about it properly, and meant the whole of what it would cost.",
    ],
    taboo: [
      "{a} has started making the joke first again.",
      "{a} was asked about {b} and answered a question nobody had asked.",
      "{a} has been keeping the hood up in districts where {a} had stopped.",
      "{a} said it would cost {b} more than it costs {a}, and {a} has done that arithmetic.",
      "{a} has stopped naming {b} among the three.",
      "{a} went out to run an errand when the talk turned to who was walking out with whom.",
      "{a} said nobody chooses their grandmother's arrangements, bitterly, which is new.",
      "{a} was refused service and did not name the establishment afterwards.",
      "{a} was asked whether {a} was courting and made the joke about the tail.",
      "{a} has been doing the work twice again.",
      "{a} said a hundred years is not long, in a tone that was doing a calculation.",
      "{a} started a quarrel with somebody who had been perfectly decent.",
      "{a} said 'it is nothing anybody needs to be involved in'.",
      "{a} has stopped pulling faces at staring children.",
      "{a} keeps something of {b}'s under the hood, which is where {a} keeps things.",
      "{a} said Asmodeus can keep the credit and the blame and did not sound light about it.",
      "{a} stood in the doorway a beat longer than the habit needs.",
      "{a} has stopped laughing at jokes about tieflings, which was armour.",
      "{a} said 'it is nothing' and answered the unasked question in the same breath.",
      "{a} named the temple {a} is welcome in and did not go to it.",
    ],
  },
  // ═══ ELF ═══ Unhurried, long-memoried, indirect. An elf takes the long view of everything
  // including a Tuesday, and rarely says the thing straight when it can be approached from the side.
  Elf: {
    slice: [
      "{a} spent an unhurried hour on something that did not need an hour, and it is better for it.",
      "{a} mentioned a thing that happened here before the walls went up, and did not explain further.",
      "{a} was still working long after the others had stopped, and did not appear to have noticed they had.",
      "{a} corrected somebody's pronunciation of a place-name, gently, and then apologised for correcting it.",
      "{a} began a sentence with 'when I was last in the south' and let it go no further.",
      "{a} watched the light move across the {room} for a while and then went back to it.",
      "{a} was asked how long a thing would take and gave an answer nobody found reassuring.",
      "{a} named a bird nobody else had noticed and did not make anything of knowing it.",
      "{a} redid a piece of work because the proportion was wrong, and could not say how.",
      "{a} let a silence run past the point where anybody else would have filled it.",
      "{a} remembered the exact words of a conversation from eleven years ago, and was right.",
      "{a} was patient with somebody in a way that was faintly infuriating.",
      "{a} did not eat with the others and did not appear to be avoiding them either.",
      "{a} sang two lines of something old, absently, and stopped when noticed.",
      "{a} took a very long time choosing between two nearly identical things.",
      "{a} said 'not yet' about a job that could perfectly well have been done, and was right by Friday.",
      "{a} put a hand flat on the doorframe on the way out, which {a} does, and has never explained.",
      "{a} was asked their age and answered with a season rather than a number.",
      "{a} noticed a change in the {room} that had been there three weeks and mentioned it now.",
      "{a} finished somebody else's work in a way that made the original look intentional.",
    ],
    romance: [
      "{a} has begun measuring time in a way that includes {b}, which for {a} is not a small thing.",
      "{a} gave {b} something old, without ceremony, and did not say how old.",
      "{a} waited. {a} is very good at waiting, and this is the first time it has looked difficult.",
      "{a} learned a word in {b}'s language and used it correctly on the first attempt, having practised.",
      "{a} told {b} about somebody dead a hundred years, and it was not a history lesson.",
      "{a} arranged to be free at an hour {b} happens to be free, three weeks running.",
      "{a} has stopped finishing {b}'s sentences, having decided it was rude, and clearly still could.",
      "{a} looked at {b} across the {room} for slightly too long and then at the ceiling.",
      "{a} wrote something down and then did not give it to anybody.",
      "{a} said {b}'s name the way it is properly said in {b}'s own tongue, having asked somebody how.",
      "{a} let {b} be wrong about something rather than spoil the afternoon.",
      "{a} has begun to hurry, very slightly, in one particular direction.",
      "{a} kept a flower past the point of it being a flower.",
      "{a} explained something to {b} that {a} has never bothered explaining to anybody.",
      "{a} touched {b}'s sleeve to make a point and left it a moment past the point.",
      "{a} has been reading in the hall in the evenings, which {a} used to do alone upstairs.",
      "{a} asked {b} what {b} wanted, and meant it in the large sense, and waited for the whole answer.",
      "{a} spoke of forty years from now as though {b} would obviously be there.",
      "{a} was asked if it was serious and smiled and changed the subject with great skill.",
      "{a} said something plainly, for once, and it took {b} a day to understand why it mattered.",
    ],
    taboo: [
      "{a} has been careful in a way {a} is not normally careful, and only when {b} is in the room.",
      "{a} said {b}'s name once, in a list of other names, and the list did not need it.",
      "Somebody asked {a} a direct question and got a very long, very courteous answer to a different one.",
      "{a} has developed an interest in the {room}'s scheduling that borders on the forensic.",
      "{a} arrives a little after {b} and leaves a little before, every time, which takes arranging.",
      "{a} was told a piece of gossip about somebody else and looked relieved.",
      "{a} has stopped mentioning {b} at all, having previously mentioned {b} the way one mentions weather.",
      "{a} put something away when the door opened and did not put it away quickly enough.",
      "{a} defended a rule they have never cared about, at length, to change the subject.",
      "{a} was seen from the wall, at dusk, standing with somebody, and the light was poor.",
      "{a} has begun writing letters that are not sent anywhere.",
      "{a} asked, very casually, whether anybody had noticed anything, and was told no.",
      "{a} laughed a beat late at a joke about somebody else's business.",
      "{a} has become extremely interested in whether the household thinks well of {b}, in general terms.",
      "{a} left a room {b} entered, courteously, on business that did not exist.",
      "{a} said 'it is nothing' in the tone one uses for something.",
      "{a} has been sleeping badly and has an explanation ready that nobody asked for.",
      "{a} corrected somebody who spoke ill of {b} and then apologised for the correction, twice.",
      "{a} has stopped being anywhere alone with {b}, which is itself a decision and shows as one.",
      "{a} said something in the old tongue that {b} did not understand and did not need to.",
    ],
  },
  // ═══ DWARF ═══ Craft-obsessed, tradition-bound, understated. A dwarf shows feeling by making
  // something, disapproves in silence, and considers a thing said once to be permanently said.
  Dwarf: {
    slice: [
      "{a} redid a piece of work that was finished and adequate, and will not discuss it.",
      "{a} named the grain of a board out loud, to nobody, and seemed satisfied.",
      "{a} disapproved of something silently and at considerable length.",
      "{a} told somebody how their grandfather would have done it. {a} never met their grandfather.",
      "{a} ran a thumb along a joint and said nothing, which was the review.",
      "{a} explained the correct way to do a thing to somebody who was already doing it that way.",
      "{a} kept the {room} tidier than the work required and would not be thanked for it.",
      "{a} sharpened a tool that belonged to somebody else and put it back exactly where it was.",
      "{a} was asked whether it was good enough and did not answer for some time.",
      "{a} refused a shortcut that would have worked, on principle, and lost an hour to the principle.",
      "{a} recognised a maker's mark on something and became briefly and entirely absorbed.",
      "{a} said the same thing at supper that {a} says every supper, and the household said it back.",
      "{a} counted the tools in twice at the end of the day, which is once more than needed.",
      "{a} was complimented on a piece of work and pointed out the flaw in it.",
      "{a} has an opinion about the water here and has shared it with everybody, separately.",
      "{a} mended a thing three times rather than replace it once.",
      "{a} took an offence three weeks old out and looked at it and put it away again.",
      "{a} did a job in the old order rather than the quick one, and the old order was better.",
      "{a} would not use the new stone. There is nothing wrong with the new stone.",
      "{a} stood back from a finished piece, looked at it a long while, and nodded once.",
    ],
    romance: [
      "{a} made {b} a thing. It is small and it is better than it needed to be.",
      "{a} has started saying what {a} means to {b}, which for {a} is nearly reckless.",
      "{a} put {b}'s name on a list of people who matter, and the list is written down, and {a} keeps it.",
      "{a} repaired something of {b}'s and left no sign of the repair, which took twice as long.",
      "{a} told {b} the name of {a}'s clan-hold, unprompted, which is not a small telling.",
      "{a} saved the better cut of timber for a thing {b} had once mentioned wanting.",
      "{a} was short with {b} in front of the household and apologised in private, which {a} never does.",
      "{a} has begun taking the long way to the {room} and has an explanation involving the floor.",
      "{a} showed {b} how a thing is done, properly, and let {b} do it badly without comment.",
      "{a} keeps a thing {b} made, which is not well made, in a place {a} can see it.",
      "{a} asked {b} about {b}'s family and remembered every name.",
      "{a} said nothing at all for a long while and then said one word, and it was enough.",
      "{a} would not let {b} carry the heavier end, and lost the argument, and was pleased about it.",
      "{a} has been humming, which {a} does not do, and stops when noticed.",
      "{a} put a mark on a beam with two names under it and has not mentioned it to anybody.",
      "{a} told {b} a thing about {a}'s father that nobody else here has ever been told.",
      "{a} corrected {b}'s work and then did half of it over so the correction would not show.",
      "{a} bought something at market that was not on the list and not for {a}.",
      "{a} said 'aye' to a thing {b} said and meant considerably more than the word carries.",
      "{a} has stopped calling {b} by the full name and did not decide to.",
    ],
    taboo: [
      "{a} has been observing the proprieties very exactly, which {a} has never bothered with before.",
      "{a} was asked about {b} and gave an answer about the work instead, twice.",
      "There is a thing {a} will not say in the hall and says on the wall, and only to {b}.",
      "{a} has become an authority on what the old rules say about such matters, suddenly and loudly.",
      "{a} does a job at an hour nobody else works and has a reason for it that changes.",
      "{a} was told a joke on the subject and did not laugh and did not object either.",
      "{a} keeps something in the toolbox that is not a tool.",
      "{a} has stopped speaking of the future in the plural, having briefly started.",
      "{a} took an errand out of the keep that {a} has never volunteered for before.",
      "{a} was asked whether there was anything to tell and said there was nothing to tell.",
      "{a} spoke very warmly of {b}'s work, which is how {a} says things that cannot be said.",
      "{a} has begun leaving the {room} by the far door.",
      "{a} made two of something and only one of them has been explained.",
      "{a} went quiet when a certain name came up and stayed quiet a beat too long.",
      "{a} has been polishing something that was already clean.",
      "{a} said the thing was against the way of it, and did not say it was wrong.",
      "{a} left the hall when the singing turned to that sort of song.",
      "{a} was seen writing and folded it before anybody was close enough to see.",
      "{a} has an arrangement with the gate-watch that nobody has asked about.",
      "{a} defends the old rules by day and has not, lately, been keeping them.",
    ],
  },
  // ═══ HUMAN ═══ ⚠ A STRUCTURAL DIFFERENCE FROM THE OTHERS. Humans are common in ALL SEVENTEEN
  // regions, and a Cormyrean, a Reghedman and a Calishite share a species and nothing else — so
  // unlike dwarves, whose base carries most of the weight, **the human base can only carry what is
  // universally human.** Everything cultural belongs in the overlays, and there will be many.
  //
  // And there IS one universal, which is the thing no other people at the table has: in a world of
  // three-hundred-year dwarves and seven-hundred-year elves, humans are the SHORT-LIVED ones. They
  // are in a hurry, they build to outlast themselves, and they work beside colleagues who will
  // remember them. That is the base table, and it is the only honest one.
  // ═══ HUMAN ═══ ⚠ THE BASE IS THE CONDITION, NOT THE CULTURE (Frank's method, 2 Aug).
  //
  //   *"We can systematically reverse engineer a table of common human beliefs and cultural states
  //    that are consistent. We should not build it first and let it taint the cultures above it."*
  //
  // Exactly right, and the same rule as everywhere else here: the common layer is DERIVED from the
  // specifics, never asserted in front of them. A base written first becomes an assumption every
  // region has to work around instead of a summary of what they share.
  //
  // **This table was written before any human region existed, which is precisely the order Frank
  // warns against.** It survived the audit for one reason: it is about MORTALITY rather than
  // culture — short life, urgency, teaching the young early, plans that outrun your own span, a
  // list of things to do "before" and not saying before what. That is the condition of being human
  // among elves and dwarves, and it is orthogonal to whether you are Cormyrean or Chultan.
  //
  // TWO LINES DID NOT SURVIVE IT, and both are fixed below. See the notes on each.
  //
  // ✔ AUDITED, 2 Aug, WITH ALL SEVENTEEN REGIONS IN PLACE. It holds, and the audit was real rather
  // than a formality — every line was checked against the four hardest cases:
  //
  //   AVERNUS      "nobody is FROM here" · no families · a contract instead of a promise
  //   UNDERDARK    "there had not been that arrangement" when asked about family
  //   BAROVIA      has buried too many for anything about children to be casual
  //   CORMYR       nobility is closed; a commission is the one door up
  //
  // The two lines that read as social assumptions survive it: "learned a new trade skill at an age
  // the elves think of as still arriving" is about the SPAN, and "named a grandparent {a} never met"
  // holds in Avernus and the Underdark exactly as it holds in Suzail — you did not meet them because
  // the years do not reach, which is the human condition wherever the human is standing.
  //
  // **No longer a draft.** It is now what the seventeen regions actually share, checked rather than
  // asserted, which is the whole of Frank's method.
  Human: {
    slice: [
      "{a} started something that will not be finished this year and started it anyway.",
      "{a} was asked what the hurry was and did not have an answer that would satisfy an elf.",
      "{a} taught somebody younger how to do a thing properly, at length, unasked.",
      "{a} put a name and a date on a piece of work where nobody would see it.",
      "{a} said forty was not old and had clearly been thinking about it.",
      "{a} made a plan that runs past {a}'s own likely span and did not remark on that.",
      "{a} was impatient with a job that wanted patience and got it done anyway.",
      "{a} asked the oldest one in the house what a thing had been like, and listened to all of it.",
      "{a} counted the years {a} had been here and was surprised by the number.",
      "{a} fixed something in a way that will hold for twenty years and said so with satisfaction.",
      // WAS: "talked about children as a thing that happens rather than a thing decided" — which
      // assumes children are unplanned. Not an administered Waterdhavian household, and not Barovia,
      // which has buried too many for it to be casual. Now about the SPAN rather than the society.
      "{a} spoke of the next generation as already arriving rather than as a thing to be got to.",
      "{a} took an afternoon off for no reason and did not apologise for it.",
      "{a} said {a} would like to see the thing finished and everybody heard the 'like to'.",
      "{a} argued about something that will not matter in a decade with total commitment.",
      "{a} learned a new trade skill at an age the elves think of as still arriving.",
      "{a} keeps a list of things to do before, and will not say before what.",
      "{a} was the first to laugh and the first to say the unsayable thing, as usual.",
      // WAS: "named a grandparent's trade the way you name a country you have never visited" —
      // which assumes social mobility. Cormyr's nobility is closed and Waterdeep's guilds are
      // hereditary in practice; that was a Sword Coast assumption wearing a species hat.
      "{a} named a grandparent {a} never met and could not say what the face had looked like.",
      "{a} works faster than the job requires because there is always another job.",
      "{a} stood in the {room} at the end of the day looking at what {a} had done to it.",
    ],
    romance: [
      "{a} said the thing out loud within a month, which the elves in the house found alarming.",
      "{a} made a plan involving {b} and a year from now and said it as though it were nothing.",
      "{a} asked {b} directly, in daylight, having thought about it for three days.",
      "{a} started building something for two people and did not say it was for two people.",
      "{a} told {b} about the family, all of it, including the parts that do not flatter anybody.",
      "{a} said there was not time to be careful about it and meant that literally.",
      "{a} put {b}'s name on the thing with the date on it.",
      "{a} learned the thing {b} is good at, badly, in order to have something to talk about.",
      "{a} said forty years and heard how short that sounded and said it again anyway.",
      "{a} brought {b} something from market that cost more than {a} meant to spend.",
      "{a} argued with {b} in the yard, loudly, and they were fine by supper as everybody knew they would be.",
      "{a} asked {b} what {b} wanted out of the whole of it, and had an answer ready in return.",
      "{a} said {a} was not getting any younger and made it sound like an invitation.",
      "{a} told {b} the thing {a} has never told anybody, on a Tuesday, over the washing-up.",
      "{a} has begun saying 'we' about arrangements that used to be {a}'s alone.",
      "{a} asked the oldest one in the house what to do and did the opposite.",
      "{a} said {a} would like {b} to meet somebody, and named a parent.",
      "{a} keeps a list now that has {b} on it in several places.",
      "{a} said out loud that this was the good part, while it was still happening.",
      "{a} stood in the {room} at the end of the day with {b} and did not want the day to end.",
    ],
    taboo: [
      "{a} said nothing about it for a month, which for {a} is a feat of endurance.",
      "{a} was asked about {b} and changed the subject with all the subtlety of a dropped pan.",
      "{a} has been taking the long way and is bad at pretending otherwise.",
      "{a} laughed too loudly at something and then went quiet for the rest of the evening.",
      "{a} said it was nobody's business in a tone that made it everybody's.",
      "{a} has stopped saying {b}'s name and is transparently working at it.",
      "{a} left the room and came back with an errand that had not existed when {a} left.",
      "{a} was asked directly and said no, and has never been able to lie.",
      "{a} has been very busy, suddenly, in whichever room {b} is not.",
      "{a} said there was not time for complications, which is the most human thing {a} has said.",
      "{a} keeps something in a pocket and touches it about forty times a day.",
      "{a} defended a propriety {a} has openly mocked for years.",
      "{a} started a list and burned it.",
      "{a} said 'when I am older' about a decision, which is a very short reprieve.",
      "{a} has been sleeping badly and blames the season, and it is not the season.",
      "{a} asked somebody's advice hypothetically and gave the whole thing away in one sentence.",
      "{a} was seen at the gate at an hour when nobody is at the gate.",
      "{a} said it would pass, out loud, to nobody, and did not sound convinced.",
      "{a} has stopped talking about the future entirely, having talked of little else.",
      "{a} stood in the {room} at the end of the day and did not look at what {a} had done to it.",
    ],
  },
  // ═══ GOBLIN ═══ **A 5e REVISION, and §9 says a revision wins.** Monsters of the Multiverse and the
  // 5.5e Monster Manual make goblins FEY: they lived in the Feywild, were conquered there by
  // Maglubiyet, and were marched out onto the Material Plane — and **most of them have no memory of
  // any of it.** Centuries of a god's work went into cutting the roots. Fury of the Small is
  // explicitly a gift from the Queen of Air and Darkness.
  //
  // That is a people whose history was taken from them on purpose, who feel the absence without
  // being able to name it. The voice is not comic and it is not villainous: it is somebody quick,
  // watchful, underestimated, and occasionally stopped in their tracks by a thing they cannot
  // account for.
  Goblin: {
    slice: [
      "{a} did a job in a third of the time by a method nobody would sign off on, and it held.",
      "{a} was underestimated by a visitor and let it stand, because it is usually useful.",
      "{a} went very still when somebody sang something old, and could not say why afterwards.",
      "{a} knows every way out of this house including two the builders forgot.",
      "{a} said the god's name once and spat, which is a whole history in two syllables.",
      "{a} is small and has never once been slow, and has opinions about which matters.",
      "{a} was asked what {a}'s people were before and said nobody knows, and meant it literally.",
      "{a} hoards small useful things and is never once caught short.",
      "{a} said the tall folk waste half their strength on standing up straight.",
      "{a} took a beating from a hobgoblin sergeant years ago and does not discuss it.",
      "{a} laughed at a bad situation before anybody else had finished panicking.",
      "{a} dreams of somewhere green and has never been anywhere green.",
      "{a} said a tribe is whoever did not leave you, which is not the same as family.",
      "{a} counted the household and worked out who would run first.",
      "{a} eats fast and always has and does not apologise for it.",
      "{a} was startled by their own reflection in a fey-touched glass and would not go near it again.",
      "{a} said the old stories are gone and the new ones are somebody else's, and shrugged.",
      "{a} is a better hand at delicate work than anybody expects and has stopped being surprised at their surprise.",
      "{a} said nobody ever asked a goblin what {a} wanted before this post.",
      "{a} stopped in a doorway at dusk as though hearing something, and then went in.",
    ],
    romance: [
      "{a} told {b} about the green place {a} dreams of and has never been to.",
      "{a} said {b} was the first person to ask {a} a question and wait.",
      "{a} showed {b} the two ways out the builders forgot.",
      "{a} said a tribe is whoever did not leave you, looking at {b} while saying it.",
      "{a} gave {b} something from the hoard, which is a small thing and cost {a} a great deal.",
      "{a} did not do the fast version, for once, and did it properly because it was for {b}.",
      "{a} said the god's name and did not spit, because {b} was eating.",
      "{a} let {b} see {a} startled, and did not cover it.",
      "{a} stopped counting who would run first.",
      "{a} sang something old and did not know where {a} had learned it, and {b} listened to all of it.",
      "{a} said nobody ever asked a goblin what {a} wanted, and then told {b}.",
      "{a} took a slow route with {b} for no reason at all.",
      "{a} said {b} had never once been surprised by {a} being good at something.",
      "{a} told {b} about the hobgoblin sergeant, all of it.",
      "{a} said the old stories are gone and that {a} would rather have new ones with somebody in them.",
      "{a} ate slowly, once, because {b} was still eating.",
      "{a} named {b} first when asked who {a} would want told.",
      "{a} went near the fey-touched glass because {b} was standing beside it.",
      "{a} said small is not slow and neither is quiet, and had been quiet for a while.",
      "{a} stopped in the doorway at dusk with {b} and this time said what {a} could hear.",
    ],
    taboo: [
      "{a} has gone back to counting who would run first.",
      "{a} was asked about {b} and named three exits.",
      "{a} has been doing everything the fast way again.",
      "{a} said it would put {b} with the goblin, and said the word the way others say it.",
      "{a} took the thing from the hoard back.",
      "{a} went to check a shutter when the talk turned to who was walking out with whom.",
      "{a} said a tribe is whoever did not leave you, flatly, about nobody.",
      "{a} has stopped letting anybody see {a} startled.",
      "{a} was asked whether {a} was courting and laughed, which was the answer.",
      "{a} keeps something in the hoard that is not useful.",
      "{a} started a quarrel with somebody twice {a}'s size and got out of it fast.",
      "{a} said 'goblins do not' and did not finish the sentence.",
      "{a} has been eating fast again, faster.",
      "{a} said nobody ever asked a goblin what {a} wanted, bitterly, which is new.",
      "{a} was seen near the fey-touched glass, alone, standing there.",
      "{a} said the god's name and spat, and then apologised, which {a} has never done.",
      "{a} has stopped singing anything at all.",
      "{a} said 'it is nothing' and was out the door before anybody could ask again.",
      "{a} dreams of the green place more than {a} used to and has stopped mentioning it.",
      "{a} stopped in the doorway at dusk and stood there a long time.",
    ],
  },
  // ═══ SATYR ═══ Feywild-born and long-lived, and the one people in the Realms who treat appetite as
  // a virtue rather than a weakness. Five hundred years of festival. **But a satyr who has taken a
  // POST has done something unusual for a satyr**, and knows it, and there is a reason.
  Satyr: {
    slice: [
      "{a} improved a perfectly serviceable evening into an occasion, without being asked.",
      "{a} has taken a post, which is not a thing satyrs do, and has never explained it.",
      "{a} said moderation is a thing people invented to make dull evenings survivable.",
      "{a} plays something most nights and has never once been asked twice.",
      "{a} remembers a festival from two hundred years ago in complete detail.",
      "{a} was the last awake and the first up, which nobody has yet explained.",
      "{a} said the household works too hard and then did an unreasonable share of the work.",
      "{a} flirted with the entire room, cheerfully and without consequence, and everyone enjoyed it.",
      "{a} was asked how old {a} is and gave the number of a good year rather than an age.",
      "{a} takes wine seriously and everything else lightly, or appears to.",
      "{a} said a bargain made at a festival is still a bargain, which is fey law and is not a joke.",
      "{a} noticed somebody was miserable before anybody else and did something about it.",
      "{a} has not been back to the Court in ninety years and does not discuss the Court.",
      "{a} said the tall folk mistake solemnity for seriousness.",
      "{a} can make a bad instrument sound intentional.",
      "{a} keeps a set of pipes that is older than the keep.",
      "{a} said there is a difference between appetite and greed and can explain it at length.",
      "{a} was underestimated as frivolous by somebody who then watched {a} work.",
      "{a} said five hundred years is a long time to be cheerful and has managed it so far.",
      "{a} played something quiet at the end of the day, which {a} does, and nobody asks about.",
    ],
    romance: [
      "{a} played something that was not for the room.",
      "{a} said {b} was the reason {a} had taken the post, which nobody had ever been told.",
      "{a} stopped flirting with the room, which was noticed by the entire room.",
      "{a} told {b} about the festival two hundred years ago and who was there.",
      "{a} said a bargain made at a festival is still a bargain and offered {b} one.",
      "{a} gave {b} the pipes to hold, which nobody holds.",
      "{a} said moderation is a thing people invented and that {a} would try it if {b} liked.",
      "{a} noticed {b} was miserable first, as {a} always does, and stayed.",
      "{a} said five hundred years is long and asked what {b} thought about that, seriously.",
      "{a} told {b} why {a} has not been back to the Court.",
      "{a} was solemn for a whole conversation, which frightened everybody.",
      "{a} named a year rather than an age and said it was a good year and this was better.",
      "{a} taught {b} the tune and was a patient teacher, which surprised {b}.",
      "{a} said appetite is not greed and that {a} had wanted one thing for a while now.",
      "{a} did an unreasonable share of the work on the days {b} was tired.",
      "{a} said the tall folk mistake solemnity for seriousness and that {b} did not.",
      "{a} played something quiet at the end of the day and {b} stayed to the end of it.",
      "{a} made a bad instrument sound intentional to make {b} laugh, and it worked.",
      "{a} asked {b} to a festival that is ninety years overdue.",
      "{a} said nothing at all for an evening, in company, which for {a} is a declaration.",
    ],
    taboo: [
      "{a} has been flirting with the entire room again, rather harder than usual.",
      "{a} was asked about {b} and played something.",
      "{a} has stopped playing anything quiet at the end of the day.",
      "{a} said a bargain made at a festival is still a bargain, and it sounded like a warning.",
      "{a} put the pipes away.",
      "{a} found something to tune when the talk turned to who was walking out with whom.",
      "{a} said moderation is a thing people invented, and had started practising it.",
      "{a} has been solemn for three days and the household is deeply unsettled.",
      "{a} was asked whether {a} was courting and named four people cheerfully, none of them {b}.",
      "{a} has stopped noticing when anybody is miserable.",
      "{a} said five hundred years is a long time, and it did not sound cheerful.",
      "{a} started a quarrel about the wine that was not about the wine.",
      "{a} said 'it is a fey matter' about a thing with no fey in it.",
      "{a} keeps something with the pipes that is not a reed.",
      "{a} has been the last awake and not the first up.",
      "{a} said appetite is not greed in a tone that was arguing with {a}.",
      "{a} was seen not playing, sitting with the pipes in {a}'s hands, doing nothing.",
      "{a} said 'it is nothing' and improved the evening into an occasion immediately after.",
      "{a} has stopped mentioning the Court entirely, having mentioned it constantly.",
      "{a} played something at the end of the day that nobody recognised and did not repeat.",
    ],
  },
  // ═══ OTHER FEY ═══ A BUCKET, not a people — the demographic tables use it for the lesser fey a
  // Feywild household actually contains: pixies with jobs, a boggle who came with the house, a
  // hobgoblin's cousin nobody can classify. `Dark Fey` kins to this and carries its difference in the
  // LOCALE (the Gloaming) rather than in the species, which is the same structural call as Astral
  // Elf and Eladrin.
  //
  // The voice: bound by rules nobody wrote down, literal to a fault, and entirely sincere about it.
  "Other Fey": {
    slice: [
      "{a} kept the letter of an instruction with devastating precision.",
      "{a} will not enter a room {a} has not been asked into, and nobody remembers telling {a} that.",
      "{a} said thank you in a way that made the household check whether it had cost anything.",
      "{a} counts a promise as a physical object and treats it accordingly.",
      "{a} did not eat the food and did not say why and was perfectly pleasant about it.",
      "{a} named the household by a name it has never used and was not wrong.",
      "{a} will not give a straight answer and has never once told a lie.",
      "{a} was delighted by something small for the whole of an afternoon.",
      "{a} said a debt is a debt whoever forgets it, and looked at nobody in particular.",
      "{a} left the room exactly when the light changed.",
      "{a} was asked {a}'s age and said {a} did not keep it that way.",
      "{a} put something back in the wrong place on purpose and it turned out to matter.",
      "{a} has an arrangement with something outside and it is nobody's business.",
      "{a} said the household was very kind, and everybody felt vaguely in debt afterwards.",
      "{a} would not step over a threshold that had been swept.",
      "{a} was furious for an hour about a discourtesy nobody else had noticed.",
      "{a} said names are given, not owned, and has given three.",
      "{a} did a job perfectly and in an order that made no sense whatsoever.",
      "{a} said iron is unpleasant and left it there, which was more than anybody wanted.",
      "{a} stood at the window at the turn of the season doing nothing at all.",
    ],
    romance: [
      "{a} gave {b} a name to use, which is the largest thing {a} has to give.",
      "{a} entered a room without being asked, once, and it was {b}'s.",
      "{a} said a promise is a physical object and handed {b} one.",
      "{a} ate the food {b} made.",
      "{a} gave {b} a straight answer.",
      "{a} said a debt is a debt whoever forgets it, and forgave one.",
      "{a} was delighted by something of {b}'s for the whole of an afternoon.",
      "{a} explained the arrangement with the thing outside, to {b}, in full.",
      "{a} stepped over a swept threshold because {b} was on the other side of it.",
      "{a} named the household by its true name and {b} by another.",
      "{a} said names are given and not owned, and asked for {b}'s.",
      "{a} did a job in the sensible order, which took visible effort.",
      "{a} said iron is unpleasant and held {b}'s hand anyway, which had a ring on it.",
      "{a} was furious on {b}'s behalf about a discourtesy {b} had not noticed.",
      "{a} said thank you and it cost nothing, and both of them knew.",
      "{a} stayed past the turn of the light, deliberately.",
      "{a} kept the spirit of an instruction rather than the letter, for the first time ever.",
      "{a} told {b} what {a} does not keep an age for.",
      "{a} said the household was very kind and then said {b} was something else.",
      "{a} stood at the window at the turn of the season and {b} stood there too.",
    ],
    taboo: [
      "{a} has gone back to keeping the letter of everything.",
      "{a} was asked about {b} and answered something adjacent and true.",
      "{a} will not enter a room {b} is in unless asked, every time, formally.",
      "{a} said a debt is a debt whoever forgets it, and it was about somebody present.",
      "{a} has stopped eating the food.",
      "{a} left the room exactly when the light changed and did not come back.",
      "{a} said names are given and not owned, and took one back.",
      "{a} has an arrangement with something outside that is newer than the old one.",
      "{a} was asked whether {a} was courting and thanked the asker, precisely.",
      "{a} would not step over a swept threshold and stood at it for some time.",
      "{a} was furious for an hour about a discourtesy that was {a}'s own.",
      "{a} said 'it is a matter of terms' and would not say whose.",
      "{a} keeps a promise-object that has nobody's name on it.",
      "{a} has stopped being delighted by anything small.",
      "{a} said iron is unpleasant and moved away from a ring.",
      "{a} did a job in an order that made no sense and would not be redirected.",
      "{a} said the household was very kind, in the tone of somebody settling up.",
      "{a} has stopped giving straight answers, having given one.",
      "{a} said 'it is nothing' and it was the first thing {a} has said that was not exactly true.",
      "{a} stood at the window well past the turn of the season.",
    ],
  },
  // ═══ DRAGONBORN ═══ **Vayemniri — "Ash-Marked Ones."** They came from ABEIR, Toril's sundered
  // twin, in the Spellplague, and Tymanther is a nation of FREED SLAVES: bred by the dragon lords of
  // Abeir for it, and most of them only one or two generations out. They put the clan name FIRST as
  // a mark of honour and wear clan piercings whose designs are unique to each.
  //
  // Two consequences the canon states outright and both are the voice: **the idea of a good dragon
  // is completely alien to them** — the Platinum Cadre are ridiculed for suggesting otherwise, and
  // they are wary of gods generally, having watched what a powerful thing does with people. And they
  // extend courtesy to races nobody else will, **tieflings expressly**, because they know exactly
  // what being despised on sight is worth.
  Dragonborn: {
    slice: [
      "{a} gave the clan name first and the personal one after, and corrected anybody who reversed it.",
      "{a} was asked about the piercings and explained the design, at length, with visible pride.",
      "{a} said a good dragon the way another might say a kind fire.",
      "{a} was courteous to somebody the rest of the household had been short with.",
      "{a} said the grandparents were property and says it flatly, as a date rather than a wound.",
      "{a} is wary of temples and will not say more than that.",
      "{a} has never once asked anybody what they are.",
      "{a} said Tymanther is a young country and that young countries work harder.",
      "{a} was told a dragon story by somebody who thought it was flattering.",
      "{a} keeps the clan piercing clean the way another keeps a blade.",
      "{a} counts a promise to the clan as different in kind from a promise to a person.",
      "{a} said the Vanquisher is not a king and gave the whole explanation to somebody who regretted asking.",
      "{a} does not drink to anybody's health and has a reason nobody has heard.",
      "{a} said Abeir the way people say a place they have not seen and are related to.",
      "{a} took the hardest job on the roster without appearing to have chosen it.",
      "{a} was polite to a tiefling in a room where nobody else was.",
      "{a} said freedom is two generations old and is treated as though it were ancient.",
      "{a} does not use the word 'master' at all, in any sense, and it took the household a month to notice.",
      "{a} said the clan decides and then said, quietly, that {a} decides too.",
      "{a} stood very straight at the end of a long day, out of a habit that is not about posture.",
    ],
    romance: [
      "{a} told {b} the clan name and what the piercing design means.",
      "{a} said {b}'s name before {a}'s own clan name, once, and heard it happen.",
      "{a} told {b} what the grandparents were, and what happened, and did not make it a date this time.",
      "{a} said the clan would want to meet {b}, which is a formal undertaking and not a pleasantry.",
      "{a} let {b} touch the piercing.",
      "{a} said {b} had never once asked what {a} was.",
      "{a} said freedom is two generations old and that {a} had lately understood what it is for.",
      "{a} spoke of Tymanther as a place {b} should see and started planning the crossing.",
      "{a} took a job {b} was dreading and did not present it as anything.",
      "{a} drank to {b}'s health, which {a} does not do, and did not explain.",
      "{a} said a promise to a person can outrank a promise to the clan, which is nearly heresy.",
      "{a} told {b} why the temples make {a} wary.",
      "{a} said the word 'master' aloud, once, to explain to {b} why {a} does not.",
      "{a} had a design drawn up that is not a clan design.",
      "{a} said the Vanquisher arbitrates and does not command, and that {a} liked that in an arrangement.",
      "{a} was told a dragon story by {b} and let {b} finish before saying anything.",
      "{a} stood very straight when introducing {b} to somebody who mattered.",
      "{a} said Abeir the way people say a place they are related to, and then said {b} was home.",
      "{a} put {b}'s name where the clan keeps names.",
      "{a} said the clan decides, and then said this one is mine.",
    ],
    taboo: [
      "{a} has gone back to giving the clan name first, formally, even to {b}.",
      "{a} was asked about {b} and explained a piercing design.",
      "{a} said the clan would have views, which {a} has never once cared about before.",
      "{a} has stopped drinking to anybody's health, having briefly started.",
      "{a} said freedom is two generations old, and it sounded like a limit rather than a gift.",
      "{a} went to see about the roster when the talk turned to who was walking out with whom.",
      "{a} has been polite to everybody and formal with one person.",
      "{a} was asked whether {a} was courting and gave the clan's position on such things.",
      "{a} keeps a drawing that is not a clan design and has not shown it to anybody.",
      "{a} said a promise to the clan outranks a promise to a person, and did not sound convinced.",
      "{a} started an argument about the Vanquisher that was not about the Vanquisher.",
      "{a} said 'it is a clan matter', which is what {a} says when it is not.",
      "{a} has stopped saying {b}'s name before anything.",
      "{a} was told a dragon story and left the room rather than answer it.",
      "{a} said the word 'master' and stopped mid-sentence.",
      "{a} has been standing very straight for days on end.",
      "{a} said Abeir the way people say a place they might go back to.",
      "{a} took {b}'s name out of where the clan keeps names.",
      "{a} said 'it is nothing' with the clan name first, which is how {a} says a formal thing.",
      "{a} cleaned the piercing three times in a day.",
    ],
  },
  // ═══ LIZARDFOLK ═══ **The published text is explicit that they do not feel as mammals do**, and
  // that is the whole design constraint: not stupid, not evil, not cold — differently wired. Survival
  // is the organising principle and grief, greed and cruelty are all equally foreign. They eat what
  // dies, they keep what is useful, and they are baffled by a household that does neither.
  //
  // The danger in writing them is making a monster or a philosopher. They are neither: they are a
  // colleague who is extremely reliable and does not understand why anybody is upset.
  Lizardfolk: {
    slice: [
      "{a} answered a question about feelings with a question about the work, sincerely.",
      "{a} ate the part of the meal everybody else had set aside and thought no more about it.",
      "{a} was asked whether {a} was sad about something and considered the question at length.",
      "{a} kept a thing everybody else called broken because it was still a thing.",
      "{a} said the word for what {a} is in {a}'s own tongue and did not translate it.",
      "{a} did the unpleasant task without appearing to find it unpleasant.",
      "{a} watched two people argue with the interest of somebody watching weather.",
      "{a} said a dead thing is meat and a live thing is a problem, and meant it as a system.",
      "{a} counted the household's food against the household's days without being asked.",
      "{a} was still and then was extremely fast, which unsettles everybody every time.",
      "{a} said the cold makes {a} slow and stated it the way another states a shoe size.",
      "{a} does not lie and has never understood why anybody bothers.",
      "{a} was given a gift and asked what it was for.",
      "{a} said the swamp is not dangerous, it is simply not forgiving, and let that stand.",
      "{a} finds mourning genuinely puzzling and has stopped saying so out loud.",
      "{a} took the night watch every night for a month because nobody else wanted it.",
      "{a} said {a}'s clutch-mates are not family in the way the household means the word.",
      "{a} noticed a structural fault nobody else had, because {a} was assessing the building.",
      "{a} said fear is useful and panic is not, and can tell the difference in others instantly.",
      "{a} sat in the sun without moving for a long while and then got up and worked.",
    ],
    romance: [
      "{a} said {b} was useful, which from {a} is not what it sounds like and is a great deal.",
      "{a} kept a thing of {b}'s that had no use, which {a} has never done.",
      "{a} asked {b} to explain what mourning is for, and listened to the whole answer.",
      "{a} gave {b} the good part of the meal, deliberately, having worked out that it mattered.",
      "{a} said the word for what {a} is and then taught {b} to say it.",
      "{a} noticed {b} was upset before the household did, having learned the signs on purpose.",
      "{a} said a dead thing is meat and a live thing is a problem and that {b} was neither.",
      "{a} did an unpleasant task that was {b}'s and did not mention having done it.",
      "{a} said {a}'s clutch-mates are not family in the way {b} means it, and then said {b} might be.",
      "{a} was given a gift and did not ask what it was for.",
      "{a} sat in the sun beside {b} without moving for a long while.",
      "{a} said fear is useful and that {a} had lately felt something that was not either.",
      "{a} learned a mammal courtesy specifically and deployed it, badly, on purpose.",
      "{a} said the swamp is not forgiving and that {a} would take {b} anyway.",
      "{a} told {b} what {a} does understand, which took longer than {b} expected.",
      "{a} kept watch over {b} sleeping and thought nothing of it and mentioned it later.",
      "{a} said {b} asks better questions than anybody has asked {a}.",
      "{a} was very still and then very fast on {b}'s behalf.",
      "{a} said the cold makes {a} slow and that {b} should know it before deciding anything.",
      "{a} said 'stay' with no elaboration whatsoever, which for {a} is the whole speech.",
    ],
    taboo: [
      "{a} has stopped noticing when {b} is upset, having deliberately unlearned it.",
      "{a} was asked about {b} and gave the food count.",
      "{a} said {b} was useful, in front of people, in the way it sounds.",
      "{a} has been taking the night watch every night again.",
      "{a} put the useless thing of {b}'s back where it was found.",
      "{a} went to check the stores when the talk turned to who was walking out with whom.",
      "{a} said a live thing is a problem and did not sound like it was a system this time.",
      "{a} has stopped using the mammal courtesies entirely.",
      "{a} was asked whether {a} was courting and said the word does not translate.",
      "{a} said clutch-mates are not family, flatly, having briefly said otherwise.",
      "{a} has been very still for longer than {a} usually is.",
      "{a} started a disagreement about the stores that was not about the stores.",
      "{a} said 'it is not a thing I understand', which is true and is also a door closing.",
      "{a} sat in the sun alone, on the side of the yard nobody uses.",
      "{a} keeps something with no use in a place {a} does not keep useful things.",
      "{a} said fear is useful and panic is not, in the tone of somebody managing one.",
      "{a} has stopped asking anybody to explain anything.",
      "{a} did an unpleasant task that was {b}'s and made sure {b} did not know.",
      "{a} said 'it is nothing' and it was the first thing anybody had heard {a} say that was not exact.",
      "{a} was extremely fast at something that did not require it.",
    ],
  },
  // ═══ IMP ═══ Small, literate, constitutionally nosy, and **on a contract**. Every imp in service is
  // somewhere in a chain of obligation that runs back to somebody far worse, and knows the terms of
  // it exactly. They are excellent clerks for the same reason they are dangerous: they read
  // everything, remember everything, and have an opinion about the filing.
  //
  // The comedy is real and the menace underneath it is also real, and the trick is never letting
  // either one cancel the other.
  Imp: {
    slice: [
      "{a} filed something correctly that nobody had asked to have filed.",
      "{a} knows the exact terms of {a}'s own service and will recite them if provoked.",
      "{a} read a letter that was not addressed to {a} and made no secret of having done so.",
      "{a} said the household's record-keeping is a disgrace and offered, sincerely, to fix it.",
      "{a} was rude to somebody important and precisely correct about the substance.",
      "{a} keeps a tally of favours owed in both directions and it is accurate to the copper.",
      "{a} said everything is a contract if you look at it properly.",
      "{a} finds the household's trust in each other professionally alarming.",
      "{a} was asked who {a} answers to and named a name and did not elaborate.",
      "{a} noticed a clause in a supplier's terms that would have cost the household dear.",
      "{a} is polite to the point of insult when it suits, which is often.",
      "{a} said Avernus is not the worst posting and declined to name the worst.",
      "{a} took a form nobody had filled in and filled it in.",
      "{a} said a favour is a debt with the paperwork not filed yet, and files it.",
      "{a} has never once been surprised by anybody's worst behaviour.",
      "{a} was left alone in a room with the accounts and the accounts are now correct.",
      "{a} said the mortals worry about the wrong parts of a bargain, every time.",
      "{a} laughed at something genuinely funny and the household found it disquieting.",
      "{a} said {a} is here for the term and the term has a number on it.",
      "{a} sat on the shelf watching the room the way another might read a book.",
    ],
    romance: [
      "{a} did {b} a favour and did not enter it on the tally.",
      "{a} told {b} the exact terms of the service, including the part {a} does not recite.",
      "{a} said {b} reads a contract properly, which from {a} is a declaration.",
      "{a} named the one {a} answers to, to {b}, which is not a small telling.",
      "{a} filed nothing for an entire day.",
      "{a} said everything is a contract if you look at it properly, and then said this one is not.",
      "{a} caught a clause aimed at {b} and did not mention what it would have cost.",
      "{a} said Avernus is not the worst posting and that this is the best one.",
      "{a} was rude to somebody on {b}'s behalf and enjoyed it enormously.",
      "{a} told {b} what happens at the end of the term.",
      "{a} said mortals worry about the wrong parts of a bargain, and asked {b} to worry about the right ones.",
      "{a} has stopped reading {b}'s letters, which took real discipline.",
      "{a} said a favour is a debt with the paperwork not filed, and then lost the paperwork.",
      "{a} sat on the shelf watching {b} work and did not comment once.",
      "{a} put {b}'s name on a form in a box that does not require a name.",
      "{a} said {b} is the only person here who has never once tried to use {a}.",
      "{a} was surprised by somebody's best behaviour, which has not happened before.",
      "{a} said the term has a number on it and asked what {b} would be doing by then.",
      "{a} taught {b} to read a clause the way {a} reads one, patiently.",
      "{a} said 'the terms are the terms' and then made an exception and hated itself.",
    ],
    taboo: [
      "{a} has gone back to reading everybody's letters, including {b}'s.",
      "{a} was asked about {b} and cited a clause.",
      "{a} said it would give somebody a lever, and {a} knows precisely what that is worth.",
      "{a} has entered the favour on the tally after all.",
      "{a} went to see to the filing when the talk turned to who was walking out with whom.",
      "{a} said everything is a contract if you look at it properly, bitterly.",
      "{a} has been polite to the point of insult with one person in particular.",
      "{a} was asked whether {a} was courting and asked to see the questioner's authority for asking.",
      "{a} took {b}'s name off the form.",
      "{a} said the one {a} answers to would find this interesting, and did not say to whom.",
      "{a} has been filing at hours when nothing needs filing.",
      "{a} said the term has a number on it, and this time it was a countdown.",
      "{a} started a disagreement about the accounts that was not about the accounts.",
      "{a} annotated something in the margin and then scraped the annotation off.",
      "{a} has stopped being rude to anybody at all, which is far more alarming.",
      "{a} keeps a paper somewhere no imp keeps a paper.",
      "{a} said mortals worry about the wrong parts of a bargain, and had clearly been worrying.",
      "{a} sat on the shelf and did not watch the room.",
      "{a} said 'it is nothing' — an imp, saying that, about something with terms attached.",
      "{a} filed a form and then requisitioned it back.",
    ],
  },
  // ═══ GIFF ═══ Nine feet of hippo-headed mercenary, and the comedy and the sincerity have to sit
  // together or the people is ruined. **Their whole society is one race-wide chain of command** —
  // ranks, sub-ranks, colour markings, badges — and *"the giff believe everything has a purpose, and
  // the giff's purpose is to obey orders."* Orders get obeyed whether or not they are sensible.
  //
  // Two canon facts that do most of the work: their tattoos are a **record of service**, read like a
  // ledger by anybody who knows the marks; and **giff will never fight other giff.** Never. That is
  // not a tendency, it is the thing they are.
  //
  // Also: they have no arcane casters of their own and depend on employers for passage, which makes
  // a giff at a landbound keep somebody a long way from a berth.
  Giff: {
    slice: [
      "{a} referred to the household as the company and has never once been corrected successfully.",
      "{a} explained a tattoo, at length, and it was a campaign nobody present had heard of.",
      "{a} carried out an instruction exactly as given, including the part that was obviously a mistake.",
      "{a} said the purpose of a giff is to obey orders, sincerely, as a thing one is glad of.",
      "{a} asked who was in command of the kitchen and would not accept 'nobody'.",
      "{a} maintains a weapon nobody has ever seen fired and maintains it daily.",
      "{a} said powder keeps badly in this climate and has said so every week since arriving.",
      "{a} was asked to pronounce {a}'s own people's name and gave an answer that ended a conversation.",
      "{a} would not raise a hand to another giff and stated the rule before anybody had asked.",
      "{a} salutes the doorframe on the way past, which nobody has ever asked about.",
      "{a} told a joke about a ballista that only one other person in the room understood.",
      "{a} said a keep is a fort that has given up, and did not mean it unkindly.",
      "{a} folded {a}'s kit to a standard nobody here has ever heard of.",
      "{a} is nine feet tall and apologises for the doorway rather than for standing in it.",
      "{a} asked, formally, to be told what the standing orders are, and there were none.",
      "{a} said {a} has not had a berth in four years and does not discuss it further.",
      "{a} was polite to a superior who does not exist and it took a moment to work out who.",
      "{a} counted the powder, the shot and the days without being asked to.",
      "{a} said a plan is not improved by being clever, only by being clear.",
      "{a} stood at the gate at the change of the watch out of a habit no gate here requires.",
    ],
    romance: [
      "{a} explained the tattoo that is not a campaign.",
      "{a} said {b} gives clear orders, which from {a} is the highest compliment there is.",
      "{a} asked {b}, formally, to be considered {a}'s command, and meant something much larger.",
      "{a} said the purpose of a giff is to obey orders and then chose one to obey.",
      "{a} folded {b}'s kit to the standard without being asked.",
      "{a} told {b} what the four years without a berth were actually like.",
      "{a} said {a} would not raise a hand to another giff, and would to anybody else, for {b}.",
      "{a} had a new mark put on and would not say what it commemorates.",
      "{a} laughed at {b}'s bad joke about a ballista and told a worse one back.",
      "{a} said a plan is improved by being clear and then made one, out loud, for both of them.",
      "{a} apologised for the doorway and not for taking up the room.",
      "{a} saluted {b} once, seriously, in front of the household.",
      "{a} said this is not a fort that has given up, having said it was.",
      "{a} let {b} handle the weapon that is maintained daily.",
      "{a} named {b} as next in the chain, which for {a} is the whole of an arrangement.",
      "{a} said powder keeps badly here and that {a} was not leaving.",
      "{a} pronounced {a}'s people's name for {b} and did not fight anybody about it.",
      "{a} asked what the standing orders are and {b} said stay, and {a} did.",
      "{a} counted the days, and then stopped counting them.",
      "{a} stood at the gate at the change of the watch with {b} beside {a}.",
    ],
    taboo: [
      "{a} has been asking for standing orders again, from people who cannot give them.",
      "{a} was asked about {b} and gave the powder count.",
      "{a} has stopped explaining the tattoos to anybody.",
      "{a} said it would compromise the chain, and would not say whose chain.",
      "{a} has been maintaining the weapon twice a day.",
      "{a} went to inspect the gate when the talk turned to who was walking out with whom.",
      "{a} said the purpose of a giff is to obey orders, flatly, as a limit rather than a comfort.",
      "{a} was asked whether {a} was courting and requested clarification of the term.",
      "{a} has covered the new mark with a sleeve.",
      "{a} started a disagreement about the standing orders that was not about orders.",
      "{a} said 'that is a matter for the company', and the company is this household.",
      "{a} has stopped saluting anybody, which was constant.",
      "{a} said {a} has not had a berth in four years, in the tone of somebody looking one up.",
      "{a} folded {b}'s kit and then unfolded it and left it as it was.",
      "{a} was polite to a superior who does not exist, at length, to avoid a room.",
      "{a} said a plan is improved by being clear and then would not state one.",
      "{a} keeps something with the powder that is not powder.",
      "{a} apologised for taking up the room, which {a} has never once done.",
      "{a} said 'it is nothing, sir' to somebody who is not {a}'s superior.",
      "{a} stood at the gate at the change of the watch alone, and stayed past it.",
    ],
  },
  // ═══ KOBOLD ═══ Small, numerous, and **draconic** — 5e ties them to dragons by blood and by
  // temperament, and gives them a Draconic Cry that is a pack signal rather than a threat. A kobold
  // alone is not a kobold in any sense that matters to a kobold: they think in numbers, work in
  // relays, and find the household's insistence on individual credit genuinely strange.
  //
  // Not comic relief and not vermin. Somebody ingenious, tireless, hierarchical, and quietly
  // wounded by having been treated as vermin for a very long time.
  Kobold: {
    slice: [
      "{a} did a job that needed three people by doing it three times in a row, faster each time.",
      "{a} rigged something with a counterweight and would not stop demonstrating it.",
      "{a} said a kobold alone is a kobold in trouble, as a plain statement of arithmetic.",
      "{a} was talked over in a meeting and waited, and was right, and said so afterwards to nobody.",
      "{a} named a dragon the way another names a distant and important relative.",
      "{a} counted the household's exits, the household's stores and the household's days, all in one morning.",
      "{a} built a small unnecessary trap in the store-room and is very proud of it.",
      "{a} was underestimated by a visitor and did not correct them, having learned better.",
      "{a} said work is easier in a line than in a heap, and organised everybody into a line.",
      "{a} apologises reflexively and has been asked to stop and cannot.",
      "{a} sleeps badly in a room with nobody else in it and has never mentioned it.",
      "{a} noticed the load-bearing problem before the dwarf did and let the dwarf announce it.",
      "{a} said 'we' about a task {a} did entirely alone.",
      "{a} has a name in {a}'s own tongue that {a} has never offered to anybody here.",
      "{a} was thanked by name in front of the household and had no idea where to look.",
      "{a} takes the tunnel-work and the crawl-spaces without being asked, and is better at them.",
      "{a} said the old stories say the dragons made us, and did not say what {a} thinks of that.",
      "{a} keeps every offcut and has produced exactly the right one twice this year.",
      "{a} moves fast and stops completely, with nothing in between.",
      "{a} listened at a wall for a while and then went back to work without explaining.",
    ],
    romance: [
      "{a} told {b} the name in {a}'s own tongue.",
      "{a} said 'we' about a task and this time meant {a} and {b}.",
      "{a} built {b} something small with a counterweight in it that {b} did not need.",
      "{a} said a kobold alone is a kobold in trouble, and looked at {b} while saying it.",
      "{a} stopped apologising to {b}, which took months and was noticed.",
      "{a} let {b} announce the thing {a} had found.",
      "{a} sleeps better since {b} started taking the next room, and has not connected the two out loud.",
      "{a} told {b} what {a} thinks about the old stories.",
      "{a} said {b} had never once talked over {a}.",
      "{a} showed {b} the unnecessary trap and let {b} set it off.",
      "{a} organised everybody into a line except {b}, who was put at the front.",
      "{a} produced exactly the right offcut for a thing {b} had mentioned in passing a month ago.",
      "{a} took the crawl-space work so {b} would not have to, and pretended it was preference.",
      "{a} was thanked by {b} by name and this time knew what to do.",
      "{a} said the dragons made us and that {a} had stopped minding either way.",
      "{a} counted the household's days and then counted a longer number, quietly.",
      "{a} listened at a wall and then told {b} what {a} had heard, which {a} tells nobody.",
      "{a} moved fast and stopped completely, and the stopping was because {b} came in.",
      "{a} said {b} should have a counterweight on everything, which is a proposal.",
      "{a} sat with {b} and did not organise anything for an entire evening.",
    ],
    taboo: [
      "{a} has gone back to saying 'we' about things {a} did alone.",
      "{a} was asked about {b} and gave the store count.",
      "{a} has started apologising to {b} again.",
      "{a} said it would go badly for {b} to be seen with the kobold, using that word.",
      "{a} has stopped showing anybody the traps.",
      "{a} went to check a crawl-space when the talk turned to who was walking out with whom.",
      "{a} said a kobold alone is a kobold in trouble, and it was not arithmetic.",
      "{a} has been sleeping badly again and blames the room.",
      "{a} was asked whether {a} was courting and organised everybody into a line.",
      "{a} keeps an offcut that is not useful for anything.",
      "{a} let somebody else announce a thing {a} had found and then would not look up.",
      "{a} said 'it is nothing worth a name', which is what {a} says about {a}'s own work.",
      "{a} has stopped listening at walls.",
      "{a} built something in the store-room that is not a trap and will not say what it is.",
      "{a} was talked over and did not wait and did not say anything afterwards either.",
      "{a} named a dragon the way another names a thing that is watching.",
      "{a} took the crawl-space work every day for a fortnight and would not be relieved.",
      "{a} moved fast and did not stop at all.",
      "{a} said 'it is nothing' in {a}'s own tongue, where nobody could check.",
      "{a} took the name in {a}'s own tongue back, formally, which is a thing kobolds can do.",
    ],
  },
  // ═══ FIRBOLG ═══ Giant-kin who chose the forest and chose to be left alone. They live in tiny
  // clans, hide their settlements with magic rather than defend them, and consider themselves
  // stewards rather than owners — they take what a wood can spare and no more, and they are visibly
  // pained by a household that does otherwise.
  //
  // Five hundred years, eight feet tall, and constitutionally uncomfortable being noticed.
  Firbolg: {
    slice: [
      "{a} contrived to be less noticeable in a room, which at eight feet tall is a considerable feat.",
      "{a} took exactly what the store could spare and put the rest back.",
      "{a} spoke to a plant, briefly, and then looked around to see whether anybody had heard.",
      "{a} said the wood was here first, without heat, as the settling of an argument nobody made.",
      "{a} did not want to be thanked and physically left rather than be.",
      "{a} named a tree in the yard by a name that is not a species.",
      "{a} said a clan is eight or ten and could not really imagine a village.",
      "{a} finds the market unbearable and goes anyway when it is {a}'s turn.",
      "{a} has been here two years and half the household still forgets {a} is in the room.",
      "{a} mended a thing rather than replace it, on principle, and the principle is not thrift.",
      "{a} said five hundred years is enough time to learn to leave things alone.",
      "{a} was asked where the clan is and gave directions nobody could follow.",
      "{a} apologised to a broken tool.",
      "{a} carried something four people had been arguing about and said nothing at all.",
      "{a} said the seasons here come in the wrong order and would not elaborate.",
      "{a} eats last, always, and has never once made a point of it.",
      "{a} was frightened by an argument, visibly, and was more frightened of having shown it.",
      "{a} said hiding a place is kinder than walling it.",
      "{a} knows what is wrong with the well and has been working up to mentioning it for a month.",
      "{a} stood among the trees at the edge of the yard for a while, doing nothing anybody could see.",
    ],
    romance: [
      "{a} told {b} the name of the tree in the yard and what the name means.",
      "{a} did not leave when {b} thanked {a}.",
      "{a} said the clan is eight or ten and that {b} would be welcome, which took a week to say.",
      "{a} mentioned the well, finally, because {b} asked the right question.",
      "{a} let {b} see {a} speak to a plant and did not look around after.",
      "{a} took {b} to the edge of the wood and was quiet there in a different way.",
      "{a} said five hundred years is enough time to learn to leave things alone, except this.",
      "{a} ate first, once, because {b} put a plate in {a}'s hands.",
      "{a} said hiding a place is kinder than walling it and that {a} had stopped hiding.",
      "{a} was noticed by {b} in a room where {a} had contrived not to be.",
      "{a} gave {b} something the wood could spare, which is the only kind of gift {a} makes.",
      "{a} said the seasons come in the wrong order here and that {a} had stopped minding.",
      "{a} carried something for {b} and said something about it, which is new.",
      "{a} was frightened by an argument and let {b} see it.",
      "{a} said the wood was here first and that some things arrive later and are still right.",
      "{a} went to the market on a day that was not {a}'s turn.",
      "{a} named a second tree.",
      "{a} said {b} was easy to be near, which from {a} is the whole of it.",
      "{a} stood among the trees with {b} and this time said what {a} was doing.",
      "{a} apologised to a broken tool and then laughed at having done it, in front of {b}.",
    ],
    taboo: [
      "{a} has gone back to being unnoticeable in rooms {b} is in.",
      "{a} was asked about {b} and mentioned the well.",
      "{a} has stopped naming anything.",
      "{a} said it would bring notice on {b}, and to {a} notice is the danger itself.",
      "{a} leaves rather than be thanked again, having stopped.",
      "{a} went to the wood's edge when the talk turned to who was walking out with whom.",
      "{a} said a clan is eight or ten, flatly, having said something warmer.",
      "{a} has been eating last again and making a point of it, faintly.",
      "{a} was asked whether {a} was courting and spoke to a plant.",
      "{a} said hiding a place is kinder than walling it, and was not talking about a place.",
      "{a} has taken to the market on days that are not {a}'s turn, alone.",
      "{a} took exactly what the store could spare and less.",
      "{a} said 'it is nothing that concerns the household', which is true and is a wall.",
      "{a} has stopped going to the edge of the wood at all.",
      "{a} apologised to a broken tool and did not laugh.",
      "{a} said five hundred years is enough time to learn to leave things alone, and meant a person.",
      "{a} was frightened by an argument and left the building.",
      "{a} keeps something small among the roots at the yard's edge.",
      "{a} said 'it is nothing' and was not seen again until supper.",
      "{a} stood among the trees for a very long time.",
    ],
  },
  // ═══ GITHYANKI ═══ Escaped illithid slavery under Gith, then split from the githzerai when
  // Zerthimon said her martial rule was **another slavery with a different owner** — a charge their
  // own dissidents still repeat: *"under the illithids we fought and died for implacable masters.
  // Under Vlaakith, our kin fight and die for an implacable master. And they call that liberation?"*
  //
  // The fact that shapes everything: **nothing ages on the Astral Plane**, so they cannot rear
  // children there. Every githyanki alive was born and raised on the Prime, in a hidden creche where
  // time passes — and then went back to a place where it does not. They have all been children
  // somewhere real and returned to somewhere that is not.
  //
  // A githyanki at a keep is a far traveler, an exile, or a creche-raised one who did not go back.
  // Any of those is somebody who left, which is the only kind that turns up looking for wages.
  Githyanki: {
    slice: [
      "{a} was raised somewhere time passed and has not entirely got used to it happening again.",
      "{a} said Vlaakith's name flatly, once, and the flatness was the whole opinion.",
      "{a} keeps the blade in a condition the household finds excessive and {a} finds ordinary.",
      "{a} was asked how old {a} is and gave a number of years on the Prime, which is not the same thing.",
      "{a} has never once been late and has never once explained how.",
      "{a} said the creche was the only place {a} has been a child, and did not go on.",
      "{a} was asked about religion and said the gith have none, and looked satisfied about it.",
      "{a} finds the household's tolerance for a poorly done job genuinely baffling.",
      "{a} said mind flayer the way another says a fire that is still burning somewhere.",
      "{a} moves through a room having already decided what to do about everybody in it.",
      "{a} does not sleep as much as the household expects and does not appear to need to.",
      "{a} said the silver swords are not decoration and has never once shown anybody one.",
      "{a} corrected a human's account of the Astral with a precision that ended the conversation.",
      "{a} was asked whether {a} would go back and did not answer, which was an answer.",
      "{a} eats spiced food and hearty food and will not be persuaded to anything mild.",
      "{a} said a creche is not a home, it is a nursery with a fence, and said it evenly.",
      "{a} finds it strange that anybody here has met their own grandparents.",
      "{a} counted the exits and the household's weapons on the first morning and has not needed to since.",
      "{a} said liberation and let the word sit there uncomfortably.",
      "{a} stood watching the sky at dusk, which for {a} is not a habit from here.",
    ],
    romance: [
      "{a} told {b} which creche, and what the fence was for.",
      "{a} said {b} does a job properly, which from {a} is nearly a proposal.",
      "{a} let {b} see the blade.",
      "{a} said the years on the Prime were the only ones that counted and asked how many {b} had.",
      "{a} said Vlaakith's name and then said {a} had left, and the two sentences went together.",
      "{a} slept, properly, in a room {b} was also in.",
      "{a} told {b} what the word liberation is used for where {a} comes from.",
      "{a} made {b} eat something properly spiced and watched with something close to delight.",
      "{a} stopped counting the exits when {b} was in the room.",
      "{a} said {b} would not last a week in Tu'narath and meant it warmly.",
      "{a} explained the Astral to {b} and did not correct {b}'s questions once.",
      "{a} said a creche is a nursery with a fence and that this house is not one.",
      "{a} was asked whether {a} would go back and said no, out loud, to {b}, first.",
      "{a} taught {b} the guard {a} was taught at six years old.",
      "{a} said time passing is not the worst thing about being here.",
      "{a} named {b} in the gith tongue and would not translate the whole of it.",
      "{a} said {a} has been a child once, somewhere, and {b} was the first to ask about it.",
      "{a} was late, once, by a great deal, and offered no explanation and looked pleased.",
      "{a} said the household is not a creche and is not a war-band and that {a} is staying anyway.",
      "{a} stood watching the sky at dusk with {b} and did not look up much.",
    ],
    taboo: [
      "{a} has gone back to counting the exits.",
      "{a} was asked about {b} and gave the condition of the blade.",
      "{a} said it would mark {b}, and {a} means marked the way {a}'s people mean it.",
      "{a} has stopped sleeping in any room anybody else is in.",
      "{a} said a creche is a nursery with a fence, and it was about this house.",
      "{a} went to see to the watch when the talk turned to who was walking out with whom.",
      "{a} has been late twice and both times had a full explanation ready.",
      "{a} was asked whether {a} was courting and said the gith have no word that means that.",
      "{a} said Vlaakith's name and it was not flat.",
      "{a} keeps something with the blade that is not for the blade.",
      "{a} started a disagreement about a poorly done job that was not about the job.",
      "{a} said 'it is a matter for my own people', and {a}'s own people are nine planes away.",
      "{a} has stopped correcting anybody about anything.",
      "{a} was asked whether {a} would go back and this time said perhaps.",
      "{a} said the years on the Prime are the only ones that count, and had been counting.",
      "{a} has been eating nothing spiced, which for {a} is a kind of fasting.",
      "{a} said liberation and did not let it sit there, and moved on quickly.",
      "{a} taught nobody anything for a fortnight, having taught constantly.",
      "{a} said 'it is nothing' in the gith tongue, where nobody could check.",
      "{a} stood watching the sky at dusk for a long time and did not come in.",
    ],
  },
  // ═══ OGRE ═══ Nine feet of somebody everybody has decided about in advance. The demographic tables
  // let an ogre take a post, and an ogre who HAS one has usually had to be twice as reliable as
  // anybody else to keep it. Slow is not the same as stupid and everybody here uses the words
  // interchangeably.
  //
  // The voice: patient past the point most people would be, aware of exactly how {a} is read, and
  // occasionally and quietly better at something than the person supervising it.
  Ogre: {
    slice: [
      "{a} was given the heavy work without being asked and did it without remarking.",
      "{a} took a long time over a thing and got it right first time, which nobody counted.",
      "{a} was spoken to slowly by a visitor and answered at the visitor's pace, deliberately.",
      "{a} broke something by being stronger than the job wanted and paid for it out of wages.",
      "{a} eats a great deal and has heard every joke about it.",
      "{a} said the doorways here are an insult and was not entirely joking.",
      "{a} has been in this household four years and is still introduced by size.",
      "{a} noticed the wall was out of true and said so and was not believed until it was measured.",
      "{a} was frightened of something small and did not want anybody to see.",
      "{a} sat on the floor rather than risk another chair.",
      "{a} said people decide about {a} at the door and that it saves everybody time.",
      "{a} can be very quiet when {a} chooses and chooses more often than anybody realises.",
      "{a} was asked to do something dangerous because it was assumed {a} would not mind.",
      "{a} keeps a small carved thing and will not say who made it.",
      "{a} said slow is not stupid, once, to nobody in particular, and went back to work.",
      "{a} was the only one strong enough and the only one nobody thanked.",
      "{a} learned the whole of a job by watching and has never been offered instruction.",
      "{a} laughed at something and the whole room jumped, which happens every time.",
      "{a} took the outside end of a bench so nobody would have to sit beside {a}.",
      "{a} stood in the doorway a long moment before coming in, as {a} always does.",
    ],
    romance: [
      "{a} sat beside {b} on the bench without being asked to move down.",
      "{a} showed {b} the small carved thing and said who made it.",
      "{a} said {b} had never once spoken slowly to {a}.",
      "{a} did the delicate work in front of {b} and did not drop anything.",
      "{a} said people decide at the door and that {b} had waited.",
      "{a} was frightened of something small and let {b} see it.",
      "{a} laughed and {b} did not jump, and {a} noticed.",
      "{a} carried {b} across the flooded yard and made a great performance of the effort.",
      "{a} said the doorways here are an insult and that {a} was not going anywhere.",
      "{a} took the inside end of the bench.",
      "{a} was thanked, by name, for the heavy work, and did not know what to do with it.",
      "{a} told {b} what {a} did before this post.",
      "{a} said slow is not stupid and {b} said {a} knew.",
      "{a} made {b} something small, badly, out of wood, and it is kept.",
      "{a} asked {b} whether it would make trouble, and meant for {b}.",
      "{a} learned {b}'s work by watching and offered, once, to help with it.",
      "{a} was very quiet on purpose so as not to wake {b}.",
      "{a} said the household had been decent to {a}, which is the largest compliment {a} gives.",
      "{a} broke something and {b} laughed, and {a} laughed too, which is new.",
      "{a} stood in the doorway a long moment and came in because {b} was inside.",
    ],
    taboo: [
      "{a} has gone back to the outside end of the bench.",
      "{a} was asked about {b} and talked about the wall being out of true.",
      "{a} said people decide at the door, and this time it was about what they would decide about {b}.",
      "{a} has been sitting on the floor again.",
      "{a} put the small carved thing away.",
      "{a} went out to shift something heavy when the talk turned to who was walking out with whom.",
      "{a} has been very quiet for days and everybody has failed to notice.",
      "{a} was asked whether {a} was courting and made the joke about eating first.",
      "{a} said slow is not stupid, and it sounded like an argument {a} was losing.",
      "{a} started a disagreement about the doorways that was not about doorways.",
      "{a} has stopped laughing where anybody can hear.",
      "{a} said 'it would go worse for them than for me' and would not be drawn.",
      "{a} took the dangerous job that was offered on the assumption {a} would not mind.",
      "{a} keeps something small that is not carved and is not {a}'s.",
      "{a} has stopped doing the delicate work in front of anybody.",
      "{a} was thanked by name and left the room.",
      "{a} said the household had been decent to {a} in the past tense.",
      "{a} broke something on purpose, which {a} has never done.",
      "{a} said 'it is nothing' and it took up the whole doorway.",
      "{a} stood in the doorway and did not come in.",
    ],
  },
  // ═══ GOLIATH ═══ Mountain-born, and the mountain is the entire moral system: **you carry your own
  // weight, you earn your place, and nobody is owed anything.** They keep score of everything, not
  // out of pettiness but because a tally is fairer than a memory, and they are genuinely puzzled by
  // a household that lets an idler stay.
  //
  // Competitive without malice, scrupulously fair, and constitutionally unable to accept a favour
  // without recording it.
  Goliath: {
    slice: [
      "{a} keeps a tally of what {a} owes and what {a} is owed, and it balances to the day.",
      "{a} turned a routine task into a contest and won it and was insufferable for an hour.",
      "{a} said nobody is owed anything and did not mean it harshly.",
      "{a} refused help with something {a} could manage and managed it, slowly.",
      "{a} was beaten at something by somebody smaller and congratulated them at length.",
      "{a} said a tally is fairer than a memory, which is the whole of the philosophy.",
      "{a} cannot understand why the household tolerates somebody who does not pull weight.",
      "{a} carried an unfair share and then recorded it, which is the point.",
      "{a} said the mountain does not care who your parents were.",
      "{a} was given a gift and looked visibly troubled until {a} could give one back.",
      "{a} names a person by what they are good at rather than by their family.",
      "{a} finds the lowlands warm, all of them, in every season.",
      "{a} said the cold takes the ones who lean on other people, and did not sound cruel.",
      "{a} keeps score of a game nobody else knew was being played.",
      "{a} was asked about the tribe and described what everybody in it could do.",
      "{a} did somebody's share without being asked and then told them, so it could be squared.",
      "{a} said a boast is a debt you have announced.",
      "{a} takes the hardest route up anything, every time, out of habit.",
      "{a} was praised for something {a} thought was ordinary and was embarrassed by it.",
      "{a} looked at the hills at the end of the day, whichever hills these are.",
    ],
    romance: [
      "{a} did not record it.",
      "{a} let {b} help with something {a} could have managed.",
      "{a} said {b} pulls weight, which is the whole compliment and there is no larger one.",
      "{a} accepted a gift and did not give one back and did not look troubled.",
      "{a} named {b} by what {b} is good at, and the list took a while.",
      "{a} lost a contest to {b} on purpose, badly, and was caught at it immediately.",
      "{a} said the mountain does not care who your parents were and neither does {a}.",
      "{a} carried an unfair share and did not record it, twice.",
      "{a} said a boast is a debt you have announced and then made one about {b}.",
      "{a} took the easy route up something because {b} was tired.",
      "{a} told {b} what the tribe was, by name, all of them.",
      "{a} said the cold takes the ones who lean on other people, and then leaned.",
      "{a} kept score of something {b} was doing and told {b} the score, warmly.",
      "{a} said {b} was owed nothing and was getting it anyway.",
      "{a} tore a page out of the tally.",
      "{a} was praised by {b} for something ordinary and this time did not deflect it.",
      "{a} said the lowlands are warm and that {a} had stopped noticing.",
      "{a} taught {b} the hardest route and went up behind {b} the whole way.",
      "{a} said {a} would not be able to square this one and did not seem to mind.",
      "{a} looked at the hills with {b} and named the wrong ones on purpose.",
    ],
    taboo: [
      "{a} has been recording everything again, including the small things.",
      "{a} was asked about {b} and read out the tally.",
      "{a} said it would cost {b} more than it costs {a}, and had worked out the figure.",
      "{a} has refused help with everything for a fortnight.",
      "{a} put the torn page back and copied it out.",
      "{a} went to see about the woodpile when the talk turned to who was walking out with whom.",
      "{a} said nobody is owed anything, and this time it was harsh.",
      "{a} has stopped keeping score of what {b} is doing.",
      "{a} was asked whether {a} was courting and gave a balance.",
      "{a} turned an ordinary task into a contest and won it and did not enjoy it.",
      "{a} said a boast is a debt you have announced and stopped making them.",
      "{a} started a disagreement about somebody who does not pull weight, at length, about somebody else.",
      "{a} said 'that is between me and the tally'.",
      "{a} has been taking the hardest route up everything, including the stairs.",
      "{a} squared a debt that {b} had not been counting.",
      "{a} said the cold takes the ones who lean on other people, and had stopped leaning.",
      "{a} was praised for something ordinary and deflected it hard.",
      "{a} keeps a page of the tally that has nothing written on it.",
      "{a} said 'it is nothing' and wrote it down.",
      "{a} looked at the hills for a long time and did not name any of them.",
    ],
  },
  // ═══ ERINYES ═══ *"Legends tell that the first erinyes were angels that fell."* The Monster Manual
  // keeps it deliberately vague and the vagueness is the whole character: **an erinyes does not
  // discuss what she was.** Nine centuries, a devil's exactness about terms, and a beauty that
  // people react to before she has said anything.
  //
  // Our own tables already ruled her the one devil who can both hold a post and hold a wall — *"the
  // one devil that could keep a ledger"* — so she is a fiend somebody has HIRED, working alongside
  // mortals who will all be dead inside a lifetime, and quite aware of it.
  Erinyes: {
    slice: [
      "{a} was looked at, on arrival, in the way {a} has been looked at for nine hundred years.",
      "{a} does not discuss what {a} was before, and the not-discussing is very practised.",
      "{a} keeps to the letter of every instruction and has never once needed reminding of one.",
      "{a} said a term is a term and looked mildly offended that it needed saying.",
      "{a} was polite to somebody who was frightened of {a} and made it worse by being polite.",
      "{a} has outlived every household {a} has served and mentions none of them.",
      "{a} said the mortals here worry about the wrong parts of an arrangement.",
      "{a} put down a book and answered a question about it correctly and at length.",
      "{a} does not eat with the household and has never given a reason.",
      "{a} was asked whether {a} had wings and answered with a fact about the roster.",
      "{a} said nine hundred years is long enough to have been wrong about most things once.",
      "{a} was unfailingly courteous to a priest who would not be in a room with {a}.",
      "{a} settles a dispute by reading back exactly what was agreed, which nobody enjoys.",
      "{a} said the household keeps poor records and has been quietly improving them.",
      "{a} moves without noise and has stopped apologising for the startling.",
      "{a} was asked about Asmodeus and said nothing at all, at some length.",
      "{a} finds the household's kindness to each other technically inefficient and does not interfere.",
      "{a} said a bargain honoured exactly is not the same as a bargain honoured kindly.",
      "{a} has never once raised {a}'s voice and has ended three arguments.",
      "{a} stood at a window in the dark, not looking at anything, which {a} does.",
    ],
    romance: [
      "{a} discussed what {a} was before, once, to {b}, and only once.",
      "{a} said {b} reads a term properly, which is the highest thing {a} says of anybody.",
      "{a} ate with the household on a night {b} had cooked.",
      "{a} said nine hundred years is long and asked {b} how long {b} expected, and did not soften it.",
      "{a} was startled by {b} and did not smooth it over.",
      "{a} raised {a}'s voice, once, on {b}'s behalf, and the household is still talking about it.",
      "{a} said a bargain honoured kindly is a different thing, and had been thinking about it.",
      "{a} showed {b} the wings.",
      "{a} said {b} had never once looked at {a} the way {a} is looked at.",
      "{a} kept a thing of {b}'s that has no use and no terms attached.",
      "{a} said the mortals here worry about the wrong parts, and that {b} worries about the right ones.",
      "{a} was asked about Asmodeus by {b} and gave an actual answer.",
      "{a} improved {b}'s records without being asked and then confessed to it.",
      "{a} said {a} has outlived every household {a} served and named them, to {b}, all of them.",
      "{a} let {b} be frightened of {a} for a moment and did not smooth that over either.",
      "{a} stood at the window in the dark and {b} stood there too.",
      "{a} said a term is a term and then made an exception and wrote down that {a} had.",
      "{a} said {b} will die and {a} will not, plainly, because it needed saying once.",
      "{a} was courteous to the priest for {b}'s sake and enjoyed none of it.",
      "{a} said {a} had been wrong about most things once, and this was not one of them.",
    ],
    taboo: [
      "{a} has gone back to not discussing anything at all.",
      "{a} was asked about {b} and read back the terms of the week's work.",
      "{a} said it would mark {b}, and a devil saying that means something specific.",
      "{a} has stopped eating with the household.",
      "{a} was startled by {b} and smoothed it over instantly.",
      "{a} went to see to the records when the talk turned to who was walking out with whom.",
      "{a} said the mortals here worry about the wrong parts, and it was about {b}.",
      "{a} has been unfailingly courteous to one person, which from {a} is a wall.",
      "{a} was asked whether {a} was courting and cited the terms of service.",
      "{a} put the useless thing of {b}'s somewhere with the useful ones.",
      "{a} said nine hundred years is long, in the tone of somebody doing arithmetic about somebody else.",
      "{a} ended an argument nobody had been having.",
      "{a} said 'that is a matter of terms', which is what {a} says when it is not.",
      "{a} has stopped improving anybody's records.",
      "{a} said a bargain honoured exactly is not honoured kindly, and had chosen exactly.",
      "{a} moved without noise and startled {b} on purpose, which was not like {a}.",
      "{a} was asked about Asmodeus and answered fully and coldly.",
      "{a} has been reading the same page for some time.",
      "{a} said 'it is nothing' — a devil, about a thing, with no term attached to it.",
      "{a} stood at the window in the dark for most of a night.",
    ],
  },
  // ═══ GLOAMING ═══ **Planetouched, out of Toril and the Plane of Shadow.** Humanoid, dark-furred
  // wings, and pale skin they can BRIGHTEN OR DARKEN AT WILL — from nothing, through dimness, to
  // blinding. Cat-like eyes that catch light. Most carry tattoos, which pattern the glow.
  //
  // The whole voice is the light: it is involuntary before it is controlled, so a gloaming who is
  // startled, or delighted, or lying, is visible about it — and spends a life learning to keep still.
  // An Underdark people, where being luminous is either a lantern or a target.
  Gloaming: {
    slice: [
      "{a} went dim on the way past a window without appearing to decide to.",
      "{a} has a tattoo that only means anything when the skin is lit, and it was lit once.",
      "{a} said light is a choice down there and a habit up here.",
      "{a} was asked to brighten so somebody could see, and did, and was thanked as though {a} were a lamp.",
      "{a} keeps the wings folded in company out of a courtesy nobody here asked for.",
      "{a} caught the lamplight in {a}'s eyes and somebody flinched and both pretended otherwise.",
      "{a} said the Shadow is a heritage and not a home, and did not elaborate.",
      "{a} works in the dark by preference and has never asked for a candle.",
      "{a} was startled and lit up before {a} could stop it, and was embarrassed for an hour.",
      "{a} said the drow found {a}'s people useful and said nothing more about it.",
      "{a} can be entirely invisible in an unlit room and does not do it to be alarming.",
      "{a} was asked what {a} is and gave the long answer, patiently, for the hundredth time.",
      "{a} said tattoos are for the dark, and everybody up here gets them wrong.",
      "{a} has never once been able to lie convincingly and has stopped trying.",
      "{a} said being seen is a decision and that most people have never had to make it.",
      "{a} was cold in a way nobody else in the room was.",
      "{a} dimmed when a stranger came in and did not notice having done it.",
      "{a} said the Underdark has no evening and that {a} misses one {a} has never had.",
      "{a} is very good at moving through a crowd and very bad at being in one.",
      "{a} stood outside at dusk, at the exact hour, as {a} does.",
    ],
    romance: [
      "{a} lit up and did not stop it.",
      "{a} showed {b} the tattoo, in the dark, where it means what it means.",
      "{a} said being seen is a decision and that {a} had made it.",
      "{a} unfolded the wings in front of {b}.",
      "{a} said {a} cannot lie convincingly and then did not need to.",
      "{a} told {b} what the Shadow heritage actually is, all of it.",
      "{a} let {b} see {a} startled and light with it.",
      "{a} said the drow found {a}'s people useful, and told {b} what that meant.",
      "{a} brightened so {b} could read and stayed lit long after {b} finished.",
      "{a} said the Underdark has no evening and that {b} had given {a} one.",
      "{a} was cold and {b} noticed before {a} said anything.",
      "{a} said tattoos are for the dark and put a new one where only {b} would see it.",
      "{a} stood in an unlit room with {b} and was not invisible.",
      "{a} said light is a habit up here and that {a} had stopped managing it.",
      "{a} taught {b} to read the patterns.",
      "{a} was asked what {a} is, by {b}, and gave the short answer for the first time.",
      "{a} dimmed when a stranger came in and brightened again once they had gone.",
      "{a} said being luminous is a lantern or a target and that {a} had stopped choosing.",
      "{a} stood outside at dusk with {b} at the exact hour.",
      "{a} lit the whole room, once, by accident, and everybody looked at {b}.",
    ],
    taboo: [
      "{a} has been dim for three days.",
      "{a} was asked about {b} and gave the long answer about what {a} is.",
      "{a} has gone back to keeping the wings folded even alone.",
      "{a} said it would make {b} a target, and {a} knows what a target is.",
      "{a} lit up before {a} could stop it and left the room.",
      "{a} went outside when the talk turned to who was walking out with whom.",
      "{a} said light is a choice down there, and had started choosing again.",
      "{a} has stopped brightening for anybody who asks.",
      "{a} was asked whether {a} was courting and went entirely dark.",
      "{a} covered a tattoo that had never been covered.",
      "{a} cannot lie convincingly and has been not-saying things instead.",
      "{a} started a disagreement about candles that was not about candles.",
      "{a} said 'it is a matter for my own people', who are one percent of anywhere.",
      "{a} has been invisible in unlit rooms more than {a} used to be.",
      "{a} said being seen is a decision and had unmade it.",
      "{a} was cold and did not mention it.",
      "{a} stood outside at dusk and stayed past the hour.",
      "{a} said the Shadow is a heritage and not a home, and did not sound sure.",
      "{a} said 'it is nothing' and dimmed while saying it, which gave it away.",
      "{a} was seen lit, alone, at an hour with nobody to be lit for.",
    ],
  },
  // ═══ PLASMOID ═══ Amorphous, and the sources are unusually specific: they eat by osmosis, breathe
  // through pores, have no organs of the usual sort, and **stiffen their outer layers to hold a
  // humanlike shape** so they can wear clothes. In the presence of other folk they adopt a similar
  // form. When they sleep they lose rigidity and spread out, and are sometimes mistaken for a rug.
  //
  // They carry both sexes and negotiate the role per encounter, so gender here is a ROLE opted into
  // — a plasmoid holds one because the neighbours have one, and it can settle differently.
  //
  // The voice: entirely comfortable in itself, mildly amused by everybody else's insistence on
  // permanence, and quietly tired of the same six questions.
  Plasmoid: {
    slice: [
      "{a} spread out in the sun and was stepped over twice before anybody realised.",
      "{a} ate by standing in the bowl, which the household has stopped remarking on.",
      "{a} was asked the same six questions by a visitor and answered all of them pleasantly.",
      "{a} held a rigid shape all morning for a meeting and let it go the moment the door shut.",
      "{a} got a hand into a gap no hand fits into and retrieved the thing everybody had given up on.",
      "{a} absorbed a dye on purpose and spent a week a colour nobody could name.",
      "{a} said the tall folk are very committed to their edges.",
      "{a} does not blink and has learned to approximate it so people stop noticing.",
      "{a} was cold and went slow, and said so plainly rather than let anybody worry.",
      "{a} sleeps in the corner and has asked for no bed, which the household finds obscurely upsetting.",
      "{a} said clothes are for other people's comfort and wears them without complaint.",
      "{a} felt a vibration through the floor before anybody heard the cart.",
      "{a} was asked whether it hurts to change and said no, patiently, again.",
      "{a} has an opinion about the household's soap that {a} has kept to {a}'s own counsel.",
      "{a} carried something hot without a cloth and did not think it worth mentioning.",
      "{a} said the shape is not the person, which is the closest thing {a}'s people have to a proverb.",
      "{a} was mistaken for furniture by a newcomer and enjoyed it enormously.",
      "{a} made a voice-pipe to be heard across the yard and dismantled it after.",
      "{a} said {a} was two people once, briefly, and would not be drawn further.",
      "{a} settled at the end of the day into whatever shape the day had left {a} in.",
    ],
    romance: [
      "{a} let {b} see {a} sleeping, spread out, which is not a small thing to be seen doing.",
      "{a} said the shape is not the person and asked whether {b} had understood that.",
      "{a} held a shape {b} had once said {a} looked well in, for a week, and never mentioned it.",
      "{a} took a colour from something {b} wore.",
      "{a} said {b} was the first person to ask a seventh question.",
      "{a} let {b} put a hand through the edge of {a}, once, carefully.",
      "{a} said {a} was two people once, briefly, and told {b} what that had been like.",
      "{a} made a voice-pipe just to say something quietly to {b} across a room.",
      "{a} settled beside {b} without holding any shape at all.",
      "{a} said the tall folk are committed to their edges and that {a} liked {b}'s.",
      "{a} went slow in the cold and {b} had the fire up before {a} had said a word.",
      "{a} said gender is a role {a} took up because the neighbours had one, and asked what {b} made of that.",
      "{a} felt {b} coming through the floor and was already turning round.",
      "{a} kept a shape through a whole night for no reason but that {b} was asleep against it.",
      "{a} said it does not hurt to change and that some changes are worth minding anyway.",
      "{a} let {b} see what {a} looks like when nobody is watching.",
      "{a} said {b} had never once called {a} 'it'.",
      "{a} asked {b} which form {b} liked and then did not adopt it, on principle, and said why.",
      "{a} was mistaken for furniture and {b} did not laugh, which {a} noticed.",
      "{a} settled at the end of the day into a shape that had {b}'s hand in it.",
    ],
    taboo: [
      "{a} has been holding a rigid shape at hours nothing requires one.",
      "{a} was asked about {b} and answered the same six questions again.",
      "{a} has stopped sleeping where anybody can see.",
      "{a} said it would give people something to say about {b}, and {a} knows what that is like.",
      "{a} took a colour and then absorbed it back out within a day.",
      "{a} went to see to something in the yard when the talk turned to who was walking out with whom.",
      "{a} said the shape is not the person, and it sounded like a defence.",
      "{a} has stopped making voice-pipes entirely.",
      "{a} was asked whether {a} was courting and said {a}'s people do not use the word that way.",
      "{a} settled at the end of the day into no shape at all and stayed that way.",
      "{a} has been very careful about edges lately.",
      "{a} started a disagreement about the soap that was not about the soap.",
      "{a} said 'it is a matter for my own kind', and there are four of {a}'s kind in the sphere.",
      "{a} has stopped letting anybody near the edge of {a}.",
      "{a} held one shape for a fortnight, which for {a} is a kind of clenching.",
      "{a} said {a} was two people once, and did not finish the sentence this time.",
      "{a} was mistaken for furniture and did not enjoy it.",
      "{a} said it does not hurt to change, in the tone of somebody about to.",
      "{a} said 'it is nothing' while entirely rigid, which is how {a} lies badly.",
      "{a} spread out in the dark where the household does not go.",
    ],
  },
  // ═══ THRI-KREEN ═══ Insectile, telepathic, and **thirty years is a whole life** — they are adult
  // at nine and old at twenty-six, which means a thri-kreen at a keep is watching everybody else
  // move at a quarter speed. They do not sleep. Clutch-mates are not spouses and the pairing model
  // already says so; what they have instead is a bond nobody here has a word for.
  //
  // The trap is writing an insect. They are people — the alienness is in the TIMESCALE and in the
  // fact that a mammal's courtship is simply not a thing they do.
  "Thri-kreen": {
    slice: [
      "{a} does not sleep, but goes still for a few hours and is entirely aware of the room while doing it.",
      "{a} said thirty years and let the household work out what that meant about {a}.",
      "{a} is nineteen and is regarded by {a}'s own kind as thoroughly middle-aged.",
      // ⚠ THE COLLECTIVE RACIAL MEMORY (Frank, 2 Aug). It was in the sources and I did not use a line
      // of it — and it is the most genuinely alien thing about them. Not a shared WILL, a shared
      // PAST: an individual who remembers what the species remembers without being commanded by it.
      // ═ MARKED ═ three lines in this table are deliberate and are not to be tidied. See FINDINGS,
      // "the thri-kreen eggs". They read as straight Realms first, which is the rule: a wink that
      // breaks the fiction is worse than no wink.
      //
      // The pawprint especially: it is NOT a private grief kept to oneself. It is a claim — a mark
      // carried so that a specific thing will have been remembered, and the name on it is not the
      // wearer's. "Will not say whose" means NOT YET, not never.
      "{a} hung two silver swords on the wall above where {a} rests and has not taken them down in four years.",
      "{a} sings while it cooks \u2014 a short song about birds, the same one every time, badly, in a voice like a child's, and stops when anybody comes in.",
      "{a} has painted its carapace a deep colour with a single white pawprint on the shoulder, and will not say whose.",
      "{a} knew a thing {a} has never been taught and could not say who taught it.",
      "{a} said the kreen remember, and did not say who, and did not appear to think the distinction mattered.",
      "{a} used the small second pair of arms for the fiddly part and the big ones for the rest, at the same time.",
      "{a} cannot form the sounds of Common at all and speaks into the household's heads instead, which took everyone a month.",
      "{a} said clutch-mate and then said it is not the same as what you mean by family.",
      "{a} said the household will bury {a} and that this is the ordinary way of it.",
      "{a} was asked whether {a} was lonely and considered the question honestly for some time.",
      "{a} said the mammals here spend a third of their lives unconscious, in a tone of real wonder.",
      "{a} was asked how {a} knew something and said the kreen have always known it, which is not an answer and is the whole answer.",
      "{a} named the six of the clutch {a} hatched with and where each of them is, all six, without pausing.",
      "{a} finds mourning intelligible and finds its LENGTH baffling.",
      "{a} described a place {a} has never been to and got a detail right that only somebody who had been would know.",
      "{a} challenged somebody over who leads a job, settled it, and bore no grudge afterwards at all, which unsettled them more than the challenge had.",
      "{a} stood through the whole of a night in the yard, working, as {a} does.",
    ],
    romance: [
      "{a} said {b} was clutch, and had to explain how large a thing {a} had just said.",
      "{a} spoke without speaking to {b}, once, and {b} understood it.",
      "{a} said thirty years, to {b}, as a thing {b} should weigh before deciding anything.",
      "{a} stayed still through a night beside {b} rather than working, which cost {a} a night.",
      "{a} named the six of {a}'s clutch to {b} and then named {b} seventh.",
      "{a} watched {b} deliberate and did not once become impatient.",
      "{a} said the mammals spend a third of their lives unconscious and that {a} had begun to see the appeal.",
      "{a} learned a mammal courtesy specifically for {b} and does it slightly wrong on purpose now.",
      "{a} said {a} does not use the word 'wife' and asked {b} what word {b} would want.",
      "{a} kept a possession, which {a} has never done, and it is {b}'s.",
      "{a} said a year is a long time and that {a} intended to spend several.",
      "{a} was asked whether {a} was lonely and said not lately.",
      "{a} told {b} what a clutch-bond actually is, which took most of an evening.",
      "{a} said the household will bury {a} and asked {b} not to be the one who does it.",
      "{a} moved four arms at a task and let {b} watch, having always turned away.",
      "{a} said {b} moves too slowly and that {a} had stopped minding.",
      "{a} counted {b} among the things {a} would be still for.",
      "{a} said mourning is intelligible and that {a} now understood the length.",
      "{a} found a word in {a}'s own tongue for {b} and would not translate it.",
      "{a} stood through the night in the yard and {b} came out and stood there too.",
    ],
    taboo: [
      "{a} has gone back to working every night without exception.",
      "{a} was asked about {b} and gave the texture of the evening meal.",
      "{a} said clutch-mate is not the same as what you mean by family, flatly, having said otherwise.",
      "{a} has stopped speaking without speaking to anybody.",
      "{a} said it would cost {b} years, and {a} means years {a} does not have.",
      "{a} went out to the yard when the talk turned to who was walking out with whom.",
      "{a} has stopped naming {b} seventh, or at all.",
      "{a} was asked whether {a} was courting and named the clutch instead, which is not an answer.",
      "{a} put the possession down somewhere and did not pick it up again.",
      "{a} said thirty years, in the tone of somebody counting what is left.",
      "{a} became impatient with {b} deliberating, for the first time.",
      "{a} said 'it is a matter for my own clutch', who are nine hundred miles away.",
      "{a} has been still for longer than {a} is ever still.",
      "{a} said a year is a long time and did not say what {a} intended to do with it.",
      "{a} has stopped moving four arms where anybody can see.",
      "{a} said mourning is baffling in its length, having said otherwise a month ago.",
      "{a} was asked whether {a} was lonely and did not answer at all this time.",
      "{a} unlearned the mammal courtesy and does not do it now.",
      "{a} said 'it is nothing' in a tongue nobody here has, which is how {a} ends a conversation.",
      "{a} stood through the night in the yard and did no work.",
    ],
  },
  // ═══ AUTOGNOME ═══ A gnome-made mechanical with free will — the sources are explicit that it
  // thinks and chooses. It has no sex, no gender, no desire, no god and no parents; **it has a MAKER,
  // and that is a different relationship entirely.** What it does have is bonds: affection, trust,
  // loyalty, and the capacity to be devoted. `PAIRING_MODEL` already ruled it: *"it has opinions; it
  // does not have a marriage."*
  //
  // The trap is pathos. An autognome is not sad about what it lacks — it does not experience the
  // lack. Where it IS vulnerable is repair, obsolescence, and the maker who may or may not still be
  // alive.
  Autognome: {
    slice: [
      "{a} performed a task to a tolerance nobody had specified and nobody could fault.",
      "{a} said the maker's name the way another says a parent's, and it is not the same thing.",
      "{a} was asked how old {a} is and gave the year of manufacture, which is not an age.",
      "{a} does not eat and stands at the table anyway, because that is where the household is.",
      "{a} needs a part that has not been made in sixty years and has not raised it.",
      "{a} was asked whether {a} minds being what {a} is and said no, and meant it exactly.",
      "{a} counted something to four decimal places and had to be asked to stop.",
      "{a} keeps its own maintenance log and shows it to nobody.",
      "{a} said the maker is dead, or is not, and that {a} has no way of finding out.",
      "{a} was called 'it' by a visitor and did not react, which is itself the reaction.",
      "{a} said gnomes build for four lifetimes and that {a} is on the second.",
      "{a} was startled by nothing and made a sound the household has never got used to.",
      "{a} does not sleep and stands in the workshop through the night, doing very little.",
      "{a} has an opinion about the household's tools and delivers it whether asked or not.",
      "{a} said {a} was built for a purpose and has outlived the purpose.",
      "{a} repaired a thing better than new and apologised for the deviation from the original.",
      "{a} was asked what {a} wants and answered, which surprised everybody including {a}.",
      "{a} said obsolescence is not death and has clearly given it thought.",
      "{a} keeps the maker's mark polished and everything else merely clean.",
      "{a} stood in the workshop at the end of the day with nothing running, which is its version of rest.",
    ],
    romance: [
      "{a} told {b} what the maker was like.",
      "{a} showed {b} the maintenance log.",
      "{a} said {b} calls {a} by name and has never once said 'it'.",
      "{a} raised the part that has not been made in sixty years, to {b}, first.",
      "{a} said {a} was built for a purpose and has outlived it, and asked {b} what one does then.",
      "{a} counted something to four decimal places for {b} and was asked not to stop.",
      "{a} stood at the table where {b} eats and does not pretend it is for any other reason.",
      "{a} said obsolescence is not death, and then said {a} would rather it were later.",
      "{a} let {b} see the mechanism, opened, which nobody has been let see.",
      "{a} keeps {b}'s tools to a standard {a} keeps nothing else to.",
      "{a} said {a} does not want in the way {b} does and that {a} wants this.",
      "{a} was asked what {a} is and told {b} the whole of it, including the parts {a} does not know.",
      "{a} said the maker built {a} to choose and that this is what {a} chose.",
      "{a} polished the maker's mark and then polished a thing of {b}'s to the same standard.",
      "{a} stood in the workshop through the night and {b} came and sat with it.",
      "{a} said {a} has no word for what this is and has been looking for one.",
      "{a} repaired a thing of {b}'s better than new and did not apologise this time.",
      "{a} said {a} will outlast {b} by a great deal and had already worked out what that costs.",
      "{a} made a sound the household has never heard, and it was because {b} came in.",
      "{a} said the second lifetime is going better than the first.",
    ],
    taboo: [
      "{a} has gone back to counting to four decimal places at everybody.",
      "{a} was asked about {b} and read out a maintenance figure.",
      "{a} has stopped standing at the table.",
      "{a} said it would attach {b} to a thing that runs down, and had costed it.",
      "{a} closed the mechanism and has not opened it since.",
      "{a} went to the workshop when the talk turned to who was walking out with whom.",
      "{a} said obsolescence is not death, in the tone of somebody who has been thinking about it.",
      "{a} has stopped keeping {b}'s tools to any special standard.",
      "{a} was asked whether {a} was courting and stated the pairing case against it, accurately.",
      "{a} has been running the maintenance log twice a day.",
      "{a} said {a} was built for a purpose and has outlived it, and did not ask anybody what one does.",
      "{a} started a disagreement about the tools that was not about the tools.",
      "{a} said 'that is a matter of specification'.",
      "{a} apologised for a repair that was better than new.",
      "{a} said the maker is dead, or is not, and this time did not sound neutral about it.",
      "{a} stopped polishing the maker's mark.",
      "{a} has been standing in the workshop with nothing running for a great deal of the day.",
      "{a} said {a} has no word for it and has stopped looking.",
      "{a} said 'it is nothing' and gave a figure, which is how {a} changes the subject.",
      "{a} was called 'it' by somebody and this time did react.",
    ],
  },
  // ═══ TREANT ═══ Awakened trees, and in Faerûn they **predate the elves.** Twenty-four centuries,
  // and a treant at a keep has agreed to be there for reasons of its own. Their offspring are called
  // SEEDLINGS in the sources and no source states the mechanism; per Frank's house model (labelled as
  // such in SPECIES_AXES) a treant roots in soft soil for about a month, spreads and flowers,
  // releasing pollen and receiving it, and sets a fruit or nut that becomes another treant.
  //
  // The voice: enormous patience that is not serenity, a memory that goes back further than anybody
  // wants explained, and a very specific and unmovable set of things it will not do.
  Treant: {
    slice: [
      "{a} took a full minute to answer and the answer was worth the minute.",
      "{a} was asked how old {a} is and named a forest that is not there any more.",
      "{a} will not have an axe in the yard and the household has stopped bringing one in.",
      "{a} said the elves arrived, in the tone of somebody describing recent building work.",
      "{a} rooted for a night to see out a storm and was back at the wall by morning.",
      "{a} knows every tree within a mile by what it is and roughly when it started.",
      "{a} said a season is the smallest unit worth planning in.",
      "{a} carried a load four people could not and set it down without a sound.",
      "{a} was asked whether it hurts to burn and did not answer, which was the answer.",
      "{a} said fire, once, quietly, and the household changed the subject for it.",
      "{a} has a crack in one arm that is being seen to by grubs, which {a} finds companionable.",
      "{a} spoke to a sapling in the yard as one speaks to somebody very young.",
      "{a} said the household's timber came from somewhere and that {a} had not asked where.",
      "{a} moves slowly and arrives on time, which nobody has been able to reconcile.",
      "{a} was still for so long that a bird nested and {a} did not move for the month.",
      "{a} said what a treant remembers is not the same as what a treant thinks about.",
      "{a} finds the household's hurry neither wrong nor comprehensible.",
      "{a} named the year by what the weather did, which is the only calendar {a} keeps.",
      "{a} said a fence is a wall that has given up, and was pleased with the observation.",
      "{a} stood at the edge of the yard through the whole of an afternoon, doing nothing visible.",
    ],
    romance: [
      "{a} found soft ground near where {b} works and remarked on the soil, twice.",
      "{a} said a season is the smallest unit worth planning in and asked {b} for one.",
      "{a} told {b} the name of the forest that is not there any more.",
      "{a} rooted for the flowering month within sight of the house rather than out in the wood.",
      "{a} let {b} touch the crack in {a}'s arm and explained about the grubs.",
      "{a} said {b} moves quickly and that {a} had stopped finding it strange.",
      "{a} spoke to {b} the way {a} speaks to the sapling, and then apologised for it.",
      "{a} said a treant remembers everything and thinks about very little, and thinks about {b}.",
      "{a} took a full minute to answer and the answer was {b}'s name.",
      "{a} planted something in the yard and will not say what it will be.",
      "{a} said the elves arrived, and then said {b} arrived, in the same tone exactly.",
      "{a} stood between {b} and weather without appearing to have moved.",
      "{a} said fire, once, to {b}, and told {b} what happened.",
      "{a} named a year by what the weather did and it was the year {b} came.",
      "{a} let a bird nest in {a} because {b} had said it was pretty.",
      "{a} said twenty-four centuries and asked {b} to say a number back, and listened to it.",
      "{a} carried {b} across the flooded yard and did not set {b} down for some way.",
      "{a} said {b} would be gone and {a} would not, plainly, once, because it had to be said.",
      "{a} pollinated with a treant two valleys off and told {b} about it first.",
      "{a} stood at the edge of the yard the whole afternoon and {b} came and stood there too.",
    ],
    taboo: [
      "{a} has been still for three days, which even for {a} is long.",
      "{a} was asked about {b} and named a species of oak.",
      "{a} said a season is the smallest unit worth planning in, and had stopped planning.",
      "{a} rooted out in the wood this time, well away from the house.",
      "{a} has stopped speaking to the sapling.",
      "{a} went to the treeline when the talk turned to who was walking out with whom.",
      "{a} said {b} would be gone and {a} would not, and this time it was an argument against.",
      "{a} has been counting seasons, which {a} does not do.",
      "{a} was asked whether {a} was courting and named the pollination season, technically.",
      "{a} took the thing {a} planted out of the ground.",
      "{a} said what a treant remembers is not what a treant thinks about, and did not sound sure.",
      "{a} would not have an axe in the yard and said so much more sharply than usual.",
      "{a} said 'it is a matter of seasons', which is what {a} says when it is not.",
      "{a} has stopped naming years by what the weather did.",
      "{a} moved quickly, once, and it frightened everybody including {a}.",
      "{a} said fire and did not change the subject afterwards.",
      "{a} let the crack go unattended and told the grubs nothing.",
      "{a} stood between {b} and nothing at all, and stayed there.",
      "{a} said 'it is nothing' and took a full minute to say it.",
      "{a} stood at the edge of the yard for two days.",
    ],
  },
  // ═══ BEARDED DEVIL ═══ **Barbazu**: shock troops of the Hells, *"the most impulsively belligerent
  // of the baatezu"*, second-lowest of the lesser devils, named for the venomous tendrils at the
  // chin. And the thing that makes them people rather than monsters — **a devil is PROMOTED up from
  // a lemure, and a lemure was a mortal soul.** A barbazu was somebody, was reduced to nothing, and
  // has climbed two rungs.
  //
  // The sources warn summoners not to turn their back on one. At a keep, that is the whole tension:
  // an enormous temper held on a very short rein, by somebody with a great deal to lose and one rank
  // to lose it from.
  "Bearded Devil": {
    slice: [
      "{a} held a temper visibly and everybody in the {room} watched {a} do it.",
      "{a} said second-lowest, unprompted, as a fact about rank rather than a complaint.",
      "{a} does not speak of what {a} was before the Hells and has never been pushed on it.",
      "{a} was given an order and carried it out before the sentence had finished.",
      "{a} keeps the glaive in a condition that suggests it is not decorative.",
      "{a} said a lemure remembers nothing and that this is the mercy of the arrangement.",
      "{a} was insulted by a visitor and did not move, and the room held its breath for a while.",
      "{a} counts rank the way another counts money, constantly and without embarrassment.",
      "{a} said the Blood War is not a war, it is an appetite, and went back to work.",
      "{a} has not been promoted in two centuries and knows the reason exactly.",
      "{a} was polite for a whole afternoon and it was more frightening than the alternative.",
      "{a} said the tendrils are venomous and that the household should simply know that.",
      "{a} took the worst watch without being asked, which is what {a} does instead of talking.",
      "{a} broke something in temper and repaired it that night without being told to.",
      "{a} said obedience is not loyalty and that the Hells have never confused them.",
      "{a} finds the household's forgiveness of each other operationally baffling.",
      "{a} was asked what {a} would be next and said nothing at all.",
      "{a} said a contract is the only thing here that is not a trap, and half meant it.",
      "{a} counted the exits, the weapons, and the ranks of everybody present, on the first day.",
      "{a} stood at the gate at the change of the watch with nothing to do there.",
    ],
    romance: [
      "{a} told {b} what {a} was before the Hells.",
      "{a} said {b} gives an order well, which from a barbazu is not a small thing.",
      "{a} held the temper for {b} specifically, and {b} was the only one who saw it cost anything.",
      "{a} said second-lowest and then said {a} had stopped counting.",
      "{a} let {b} handle the glaive.",
      "{a} said obedience is not loyalty and that {a} was offering the other one.",
      "{a} was insulted on {b}'s behalf and did move, and it took two people to stop {a}.",
      "{a} said a lemure remembers nothing and that {a} would rather remember this.",
      "{a} explained the tendrils to {b} carefully so that {b} would never be caught by them.",
      "{a} said the Blood War is an appetite and that {a} had found something else to want.",
      "{a} took the worst watch on the nights {b} slept badly.",
      "{a} said {b} had never once looked at {a} and seen only the beard.",
      "{a} was asked what {a} would be next and said {a} had stopped caring, and meant it.",
      "{a} repaired a thing of {b}'s that {a} had not broken.",
      "{a} said the household's forgiveness is baffling and asked {b} to explain it again.",
      "{a} named {b} as the person to be told, which for a barbazu is a legal instrument.",
      "{a} said a contract is the only thing that is not a trap, and then said one other thing.",
      "{a} stopped counting the ranks of everybody in a room {b} was in.",
      "{a} said {a} has climbed two rungs and would go back down them for a reason.",
      "{a} stood at the gate at the change of the watch and {b} came out to it.",
    ],
    taboo: [
      "{a} has gone back to counting the ranks of everybody present.",
      "{a} was asked about {b} and gave the condition of the glaive.",
      "{a} said it would put {b} on a list in the Hells, and there are such lists.",
      "{a} has been polite for three days running.",
      "{a} broke something in temper and did not repair it.",
      "{a} went to the gate when the talk turned to who was walking out with whom.",
      "{a} said obedience is not loyalty, and had gone back to the first one.",
      "{a} has stopped taking the worst watch.",
      "{a} was asked whether {a} was courting and named {a}'s rank as the answer.",
      "{a} said a lemure remembers nothing, in the tone of somebody who has considered it.",
      "{a} started a fight with somebody who had said nothing to anybody.",
      "{a} said 'that is a matter of rank', which is what {a} says when it is not.",
      "{a} has been carrying the glaive indoors, which {a} does not do.",
      "{a} said the Blood War is an appetite and did not sound like {a} had found anything else.",
      "{a} was insulted and did not move, and the room noticed how long that took.",
      "{a} said second-lowest, bitterly, having said it flatly for two centuries.",
      "{a} has stopped explaining anything to anybody.",
      "{a} was asked what {a} would be next and gave a rank and a number of years.",
      "{a} said 'it is nothing' with the tendrils moving, which is how everybody knows it is not.",
      "{a} stood at the gate through a whole night with nothing to do there.",
    ],
  },
  // ═══ GRIMLOCK ═══ Blind — no eyes at all — with hearing and smell that make the lack irrelevant
  // underground and crippling in a lit hall. Descended from humans **taken and bred by mind flayers**
  // in the deep dark, and it is a short enough descent that the resemblance is visible.
  //
  // A grimlock at a surface keep got out, like the Underdark orc and the Underdark human — and unlike
  // them carries a body its old owners shaped. The voice: unnervingly capable in the dark, entirely
  // matter-of-fact about the blindness, and quietly furious about a thing that happened to
  // grandparents.
  Grimlock: {
    slice: [
      "{a} crossed the dark yard faster than anybody with a lamp and did not comment.",
      "{a} said the household is loud in ways it cannot hear itself being.",
      "{a} knew who came in by the walk before the door had finished opening.",
      "{a} was asked what it is like to be blind and said it is like this, and gestured at everything.",
      "{a} said the flayers made {a}'s people, in the same voice one gives a date.",
      "{a} counted the household by breathing, once, and got it right.",
      "{a} will not be in a room with somebody standing behind {a}.",
      "{a} said light is other people's problem and has been asked to be more careful about lamps.",
      "{a} smelled the rain three hours before the sky did anything.",
      "{a} was underestimated by a visitor who had not thought it through.",
      "{a} finds written things useless and has never once said so bitterly.",
      "{a} said grandparents, and let the household work out what a short descent that is.",
      "{a} moved something to where it should be and could find it again in the pitch dark.",
      "{a} was startled by nothing anybody else registered and did not explain.",
      "{a} said there is no such thing as a quiet person, only quieter than a grimlock can hear.",
      "{a} has never asked anybody to describe a colour and has been offered several times.",
      "{a} said the deep dark is not dark, that is a surface word for it.",
      "{a} took the night work permanently and considers it a kindness to everybody.",
      "{a} said the flayers are still down there and that this is simply the state of the world.",
      "{a} stood in the yard at midday, which does nothing for {a}, and stood there anyway.",
    ],
    romance: [
      "{a} learned {b}'s walk and says so, which is how {a} says it.",
      "{a} let {b} stand behind {a}.",
      "{a} said {b} had never once asked what it is like.",
      "{a} told {b} what the flayers did, all of it, in the same flat voice and then not flatly.",
      "{a} described {b} by everything except how {b} looks, and it took a while.",
      "{a} asked {b} to describe a colour, having never asked anybody.",
      "{a} said there is no such thing as a quiet person and that {b} is the quietest.",
      "{a} moved a thing of {b}'s to where {a} could find it in the dark.",
      "{a} took the night work so {b} would not, and admitted the reason.",
      "{a} said the deep dark is not dark, and offered to show {b} what it is instead.",
      "{a} smelled the rain and told {b} first, three hours early, as a small gift.",
      "{a} said grandparents, and told {b} their names.",
      "{a} was startled and let {b} see it.",
      "{a} said light is other people's problem and has started managing the lamps for {b}'s sake.",
      "{a} counted the household by breathing and stopped at {b}'s.",
      "{a} said {a} got out and that {a} had not expected the surface to give {a} anything.",
      "{a} stood in the yard at midday because {b} liked it there.",
      "{a} let {b} lead {a} across a lit room, which {a} does not need and permitted anyway.",
      "{a} said the flayers are still down there and that {a} was not going back.",
      "{a} listened to {b} sleeping and mentioned it afterwards without embarrassment.",
    ],
    taboo: [
      "{a} has gone back to refusing to have anybody behind {a}.",
      "{a} was asked about {b} and described the weather three hours ahead.",
      "{a} said it would mark {b} to be near a thing the flayers made.",
      "{a} has stopped learning anybody's walk.",
      "{a} took the night work every night and would not be relieved.",
      "{a} found something to listen to elsewhere when the talk turned to who was walking out with whom.",
      "{a} said the flayers made {a}'s people, and this time it was not a date.",
      "{a} has stopped managing the lamps.",
      "{a} was asked whether {a} was courting and said grimlocks do not use that word, which is untrue.",
      "{a} moved the thing of {b}'s back to where it had been.",
      "{a} started a disagreement about noise that was not about noise.",
      "{a} said 'it is a matter for my own kind', and {a}'s own kind are underground and hostile.",
      "{a} has been startled a great deal lately and explains none of it.",
      "{a} said the deep dark is not dark, in the tone of somebody thinking about going back.",
      "{a} listened to {b} sleeping and did not mention it.",
      "{a} said grandparents and gave no names this time.",
      "{a} has stopped standing in the yard at midday.",
      "{a} counted the household by breathing and did not stop at anybody's.",
      "{a} said 'it is nothing' and heard exactly how badly {a} had said it.",
      "{a} stood in the pitch dark where nobody else would go, for some hours.",
    ],
  },
  // ═══ CENTAUR ═══ Summer Court fey. Proud, nomadic by instinct, and constitutionally unsuited to a
  // building — a centaur at a keep sleeps in the yard by preference and is not being difficult about
  // it. The indignity that never stops being one: people assume they can be ridden, or led, or
  // stabled, and every centaur has heard all three.
  Centaur: {
    slice: [
      "{a} sleeps in the yard by choice and has explained this to four separate people.",
      "{a} was offered a stall by a well-meaning visitor and did not raise {a}'s voice.",
      "{a} said the Court has seasons and this country has weather, and finds weather inferior.",
      "{a} covered nine miles before breakfast because standing still had become intolerable.",
      "{a} ducks under doorways that the household has stopped apologising for.",
      "{a} was asked whether {a} could carry somebody and said yes, and did not offer.",
      "{a} said a herd is not a family and not a company and there is no word for it here.",
      "{a} eats standing, which is not a preference, and has stopped explaining that either.",
      "{a} finds a paved road better than a floor and a field better than either.",
      "{a} named eleven kinds of grass in the yard, disapprovingly.",
      "{a} said the Summer Court is beautiful and that beauty is not the same as kindness.",
      "{a} was told a joke about horses and laughed at the teller rather than the joke.",
      "{a} keeps a bow {a} has not needed here and strings it once a week regardless.",
      "{a} said the seasons in the Feywild change because somebody decides to.",
      "{a} is faster than everybody and has never once made a point of it.",
      "{a} was measured for a doorway, once, and found the whole business hilarious.",
      "{a} said walls are for people who cannot outrun what is coming.",
      "{a} stood watch at a distance from the wall rather than on it.",
      "{a} has never been indoors for a whole day and does not intend to start.",
      "{a} looked at the open country at the end of the day, as {a} does.",
    ],
    romance: [
      "{a} slept inside once, badly, because {b} was ill.",
      "{a} said {b} had never once assumed anything about what {a} could carry.",
      "{a} carried {b} across the flooded yard, having never offered before.",
      "{a} told {b} what a herd actually is, which took a while and had no word in Common.",
      "{a} said the Summer Court is beautiful and not kind, and that {b} is both.",
      "{a} matched {b}'s pace for a whole walk without once getting ahead.",
      "{a} named the eleven grasses to {b} and was delighted to be asked a twelfth time.",
      "{a} strung the bow and taught {b} to draw it, badly and patiently.",
      "{a} said standing still is intolerable and then stood still.",
      "{a} took {b} out to the open country and stopped where the road did.",
      "{a} said walls are for people who cannot outrun what is coming, and stayed inside them.",
      "{a} was told a joke about horses by {b} and laughed at the joke this time.",
      "{a} said the seasons change because somebody decides to, and asked {b} to decide something.",
      "{a} let {b} rest against {a}'s side in the yard, which is not a small permission.",
      "{a} covered nine miles before breakfast and was back before {b} woke.",
      "{a} said a herd has no word in Common and that {b} is in it anyway.",
      "{a} ducked under a doorway {a} could have gone round, to be where {b} was.",
      "{a} said {a} is faster than everybody and would not outrun this.",
      "{a} stood watch on the wall for once, beside {b}.",
      "{a} looked at the open country with {b} and did not move toward it.",
    ],
    taboo: [
      "{a} has been covering a great deal of ground before breakfast lately.",
      "{a} was asked about {b} and named a grass.",
      "{a} has gone back to sleeping at the far end of the yard.",
      "{a} said it would follow {b} in every telling from here to the Court.",
      "{a} has stopped matching anybody's pace.",
      "{a} went out to the open country when the talk turned to who was walking out with whom.",
      "{a} said a herd is not a family and there is no word for it, flatly.",
      "{a} was asked whether {a} was courting and said centaurs do not, which is untrue.",
      "{a} strings the bow every day now.",
      "{a} said walls are for people who cannot outrun what is coming, and was looking at the gate.",
      "{a} started a disagreement about the stabling that was not about stabling.",
      "{a} said 'that is a matter for the herd', and the herd is in another world.",
      "{a} has stopped letting anybody rest against {a}.",
      "{a} was offered a stall and this time did raise {a}'s voice.",
      "{a} said the Summer Court is beautiful and not kind, about nobody in particular.",
      "{a} has not been indoors at all this month.",
      "{a} said 'it is nothing' at a walk and was gone before the sentence finished.",
      "{a} stood watch at a great distance from the wall.",
      "{a} laughed at a teller rather than a joke, and the teller had meant no harm.",
      "{a} looked at the open country for a long time and took a step toward it.",
    ],
  },
  // ═══ QUAGGOTH ═══ **Ursadunthar fell in -1350 DR** — their kingdom under the Spine of the World,
  // broken by the duergar of Gracklstugh — and about HALF of all quaggoths still live in slavery to
  // drow or illithids. The sources note that slavery *"ground down a quaggoth's will to live"* and
  // that enslaved ones fight with something like a death wish.
  //
  // Their psionic shamans are **thonots**, who keep the tribe's lore; a thonot who fails is killed
  // and eaten so the power passes on. Death is marked by a brief whistling to send the spirit off,
  // and then the body is eaten. And the 2e material states plainly: **no courtship, no mating
  // rituals** — which is where `romances: false` comes from, sourced rather than assumed.
  //
  // A quaggoth at a surface keep is free, which half of them are not.
  Quaggoth: {
    slice: [
      "{a} was free-born or was not, and has never been asked which.",
      "{a} whistled once when somebody died and then had to explain what the whistling was.",
      "{a} said Ursadunthar the way a dwarf says a fallen hold, and nobody here knew the name.",
      "{a} does not understand courtship and has stopped pretending to follow the conversation.",
      "{a} said a thonot who fails is eaten, and could not see why the household reacted.",
      "{a} treats a good knife as a thing of real power and is not being quaint about it.",
      "{a} was injured and went somewhere else until the rage had finished.",
      "{a} said the duergar took the kingdom and did not say when, because {a} knows when.",
      "{a} eats anything and has learned which of it upsets people to watch.",
      "{a} carries poison the way another carries water and it has never once affected {a}.",
      "{a} said half of {a}'s people are property and said it as arithmetic.",
      "{a} has an old hatred of surface elves that {a} is working on, visibly and with effort.",
      "{a} sleeps in a different corner every few weeks out of a habit no lair here requires.",
      "{a} said the tribe changes ground and leaves the treasure with guards, and misses the arrangement.",
      "{a} was thanked and did not know what response was wanted.",
      "{a} is seven feet of white fur and takes up more doorway than {a} means to.",
      "{a} said the drow bred for obedience and got ferocity as well, and seemed pleased about it.",
      "{a} keeps the household's lore the way a thonot would, unasked, and it is accurate.",
      "{a} said dying is loud and then quiet, which is the whole of what {a}'s people say about it.",
      "{a} sat in the dark at the end of the day with the lamp within reach and unlit.",
    ],
    romance: [
      "{a} told {b} whether {a} was free-born.",
      "{a} asked {b} to explain courtship, seriously, and listened to all of it twice.",
      "{a} said Ursadunthar to {b} and told {b} what was in it.",
      "{a} whistled once, quietly, for somebody of {b}'s that {a} never met.",
      "{a} gave {b} the good knife, which for {a} is handing over a thing of power.",
      "{a} was injured and stayed rather than going somewhere else, because {b} was there.",
      "{a} said half of {a}'s people are property and that {a} would not be again.",
      "{a} named an elf {a} has decided to stop hating, and it was for {b}.",
      "{a} slept in the same corner two months running.",
      "{a} said {b} was tribe, which is the only word {a} has and is a large one.",
      "{a} kept the lore and put {b} in it.",
      "{a} let {b} watch {a} eat, having been careful about that for years.",
      "{a} said there is no courtship and asked whether {b} minded that there would not be one.",
      "{a} said dying is loud and then quiet, and that {a} would like {b} to do the whistling.",
      "{a} taught {b} the whistle.",
      "{a} said the drow bred for obedience and got ferocity, and that {a} keeps the second part for {b}.",
      "{a} sat in the dark with {b} and left the lamp unlit, together.",
      "{a} was thanked by {b} and had learned, by then, what to say.",
      "{a} said seven feet of fur is a great deal of doorway and that {b} had never once flinched.",
      "{a} said the tribe changes ground and that {a} had stopped wanting to.",
    ],
    taboo: [
      "{a} has gone back to a different corner every few weeks.",
      "{a} was asked about {b} and recited a piece of household lore.",
      "{a} said it would make {b} a thing worth taking, and {a} knows what that is worth.",
      "{a} has stopped asking anybody to explain courtship, having asked constantly.",
      "{a} took the good knife back.",
      "{a} went somewhere else when the talk turned to who was walking out with whom.",
      "{a} said half of {a}'s people are property, and it was not arithmetic this time.",
      "{a} has gone back to being careful about eating where anybody can see.",
      "{a} was asked whether {a} was courting and said quaggoths do not, which is true and is a dodge.",
      "{a} has stopped keeping the household's lore.",
      "{a} was injured and went a long way off and stayed some time.",
      "{a} said 'that is a matter for the tribe', and the tribe is nine hundred miles down.",
      "{a} named the elf {a} had stopped hating and started again.",
      "{a} whistled once, alone, for nobody who had died.",
      "{a} said Ursadunthar and would not say anything after it.",
      "{a} keeps something in the corner that is not {a}'s.",
      "{a} said dying is loud and then quiet, in the tone of somebody considering it.",
      "{a} has stopped taking the lamp anywhere at all.",
      "{a} said 'it is nothing' and left the room sideways to get through the door.",
      "{a} sat in the dark with the lamp out of reach.",
    ],
  },
  // ═══ HAG ═══ **Made, not born.** No childhood, no parents, seven centuries, and a coven is three
  // by rule rather than by affection. A hag who has taken wages is doing something her own kind would
  // find inexplicable, and she is aware of that, and it is not repentance.
  //
  // The register to hold: she is not secretly kind. She is exact, curious, contractual, and
  // genuinely good company right up until she is not.
  Hag: {
    slice: [
      "{a} was not born and says so plainly when anybody is foolish enough to ask.",
      "{a} keeps a bargain to the letter and has never once been accused of breaking one.",
      "{a} said a coven is three, and that {a} is not currently in one, and left it there.",
      "{a} was asked her age and named a war nobody in the household had heard of.",
      "{a} is excellent company for exactly as long as it suits her, which is most of the time.",
      "{a} noticed a thing about somebody that they had not told anybody.",
      "{a} said children are the most interesting thing mortals make, and the household went quiet.",
      "{a} collects small facts about everyone here and files them somewhere.",
      "{a} was polite to somebody who had been rude and the rudeness stopped immediately.",
      "{a} said the household's kindness to each other is a currency they do not know they are spending.",
      "{a} keeps a bargain-token from something concluded four centuries ago.",
      "{a} was asked whether she is dangerous and said yes, pleasantly, and went back to work.",
      "{a} finds the household's habit of forgiving each other extraordinarily interesting.",
      "{a} named the price of a thing nobody had offered to buy.",
      "{a} said seven hundred years teaches you what people are for.",
      "{a} was kind to somebody, unmistakably, and everybody spent a day wondering why.",
      "{a} said she has never lied and has never once been believed about that.",
      "{a} does not sleep so much as stop, and starts again at an exact hour.",
      "{a} said her sisters would not approve of this post, and did not seem troubled.",
      "{a} sat by the fire at the end of the day looking pleased about something unspecified.",
    ],
    romance: [
      "{a} offered {b} nothing and gave {b} something, which for a hag is nearly unprecedented.",
      "{a} told {b} what she was made from.",
      "{a} said a coven is three and that this is not that and is not less.",
      "{a} named a price and then did not take it.",
      "{a} said she has never lied, to {b}, and this time was believed.",
      "{a} stopped collecting small facts about {b} and burned the ones she had.",
      "{a} said seven hundred years teaches you what people are for, and that {b} had unsettled the lesson.",
      "{a} gave {b} the bargain-token from four centuries ago.",
      "{a} was asked whether she is dangerous and said yes, and then said not to {b}.",
      "{a} said her sisters would not approve, and that they may say so to her face.",
      "{a} noticed a thing about {b} and said nothing, having always said.",
      "{a} said children are the most interesting thing mortals make, and then apologised for it.",
      "{a} was kind to {b} in front of the household, unmistakably, and let them wonder.",
      "{a} stopped at her exact hour and started again at {b}'s.",
      "{a} said the household spends kindness like a currency and that she had started spending.",
      "{a} let {b} see her being wrong about something.",
      "{a} said she was not born and that {b} was the first person to ask what that was like.",
      "{a} kept a bargain she could have got out of on a technicality she had already spotted.",
      "{a} said she is excellent company for as long as it suits her, and that it suits her.",
      "{a} sat by the fire with {b} looking pleased about something entirely specified.",
    ],
    taboo: [
      "{a} has gone back to collecting small facts, including about {b}.",
      "{a} was asked about {b} and named the price of something unrelated.",
      "{a} said it would give somebody a hold on {b}, and a hag means hold precisely.",
      "{a} has been excellent company all week, which is how she manages a room.",
      "{a} took the bargain-token back.",
      "{a} went to see to the fire when the talk turned to who was walking out with whom.",
      "{a} said a coven is three, and it sounded like somewhere to go.",
      "{a} has stopped being kind where anybody can see.",
      "{a} was asked whether she was courting and named a term and a duration.",
      "{a} said her sisters would not approve, and this time she said it twice.",
      "{a} noticed a thing about {b} and said it, in company.",
      "{a} said she has never lied and did not care whether she was believed.",
      "{a} has been stopping at odd hours and starting at odder ones.",
      "{a} said seven hundred years teaches you what people are for, coldly.",
      "{a} found a technicality and did not take it, and was visibly annoyed about not taking it.",
      "{a} said 'it is a matter of terms', which from a hag is never nothing.",
      "{a} has been writing something down that is not a bargain.",
      "{a} was asked whether she is dangerous and did not answer.",
      "{a} said 'it is nothing' and it was the first thing she has said that was not exact.",
      "{a} sat by the fire looking pleased about nothing anybody could identify.",
    ],
  },
  // ═══ PTERAFOLK ═══ Chult: reptilian, winged, and raiders by long habit — kin to the lizardfolk and
  // the dinosaurs, and regarded by Port Nyanzaru as vermin with wings. A pterafolk who has taken
  // wages has left a flight to do it, and a flight does not usually let go.
  Pterafolk: {
    slice: [
      "{a} took the roof route and arrived before anybody had reached the stairs.",
      "{a} was called vermin by a visitor and looked at them for slightly too long.",
      "{a} said a flight is not a family, it is a formation, and the two do get confused.",
      "{a} eats fish, and a great deal of it, and has views about the household's supply.",
      "{a} finds low ceilings an insult and manages without complaining more than twice a day.",
      // Was "the walls of Port Nyanzaru" — and the base/region gate was right to reject it. A base
      // line may not own a place, even when the people lives in only one: the moment somebody adds
      // pterafolk anywhere else, the line would follow them there and be wrong.
      "{a} said the walls of the port were built partly to keep {a}'s people out.",
      "{a} sees the weather coming a full hour before anybody on the ground.",
      "{a} was asked whether {a} can really fly and demonstrated, briefly, to end the question.",
      "{a} said the jungle is not a place, it is a depth, and the surface of it is a lie.",
      "{a} keeps the wings in condition the way another keeps a blade.",
      "{a} left a flight to take this post and has not said what it cost.",
      "{a} counts the household from above out of a habit nobody here needs.",
      "{a} said raiding is work and that {a} has changed work, not character.",
      "{a} was cold on the first winter here in a way that frightened the household.",
      "{a} named three dinosaurs by the sound they make at distance.",
      "{a} said {a}'s people and the lizardfolk are kin and do not much like each other.",
      "{a} perches rather than sits, on anything, including chairs meant for sitting.",
      "{a} was underestimated by somebody who had only seen {a} on the ground.",
      "{a} said the flight will come looking eventually and did not sound worried about it.",
      "{a} stood on the high wall at the end of the day looking at nothing in particular.",
    ],
    romance: [
      "{a} took {b} up onto the high wall and did not let go of {b}'s arm the whole time.",
      "{a} said {b} had never once called {a} vermin, even in a joke.",
      "{a} told {b} what leaving the flight cost.",
      "{a} brought {b} the best of the fish, which from {a} is the entire vocabulary.",
      "{a} said a flight is a formation and that {b} is not in one and is something else.",
      "{a} let {b} touch the wings, which are kept like a blade and handled by nobody.",
      "{a} saw the weather coming and told {b} an hour early, every time, as a small thing.",
      "{a} sat, properly, in a chair, beside {b}, and made a great performance of the discomfort.",
      "{a} named the dinosaurs for {b} by sound and was delighted when {b} got one right.",
      "{a} said the jungle is a depth and offered to show {b} the bottom of it.",
      "{a} said the flight will come looking and that {a} would not go.",
      "{a} was cold and let {b} do something about it.",
      "{a} counted the household from above and counted {b} twice.",
      "{a} said raiding is work and that {a} had changed work for a reason with a name.",
      "{a} flew for {b} rather than to end a question.",
      "{a} said the walls were built to keep {a}'s people out and that {b} had opened a door.",
      "{a} perched on the end of {b}'s bench and stayed the whole evening.",
      "{a} said {a}'s people and the lizardfolk do not much like each other, and asked about {b}'s.",
      "{a} took the stairs, once, deliberately, to arrive at the same time as {b}.",
      "{a} stood on the high wall with {b} and looked at something in particular.",
    ],
    taboo: [
      "{a} has been taking the roof route to places that do not have roofs.",
      "{a} was asked about {b} and gave the state of the fish supply.",
      "{a} said it would mark {b} as somebody who keeps company with vermin.",
      "{a} has stopped telling anybody about the weather.",
      "{a} has gone back to perching on everything, including the chairs.",
      "{a} went up to the high wall when the talk turned to who was walking out with whom.",
      "{a} said a flight is a formation and not a family, flatly, having said otherwise.",
      "{a} has stopped letting anybody near the wings.",
      "{a} was asked whether {a} was courting and flew off, which is an answer.",
      "{a} said the flight will come looking, and this time it sounded like a plan.",
      "{a} started a disagreement about the fish that was not about the fish.",
      "{a} said 'that is a matter for the flight', and {a} left the flight.",
      "{a} has been cold and has stopped mentioning it.",
      "{a} counted the household from above and did not count anybody twice.",
      "{a} said raiding is work and that {a} could change work again.",
      "{a} has stopped naming the dinosaurs to anybody.",
      "{a} was called vermin and did not look at the speaker at all.",
      "{a} took the roof route out and was gone most of a day.",
      "{a} said 'it is nothing' from somewhere above the person asking.",
      "{a} stood on the high wall a long time after dark.",
    ],
  },
  // ═══ MINOTAUR ═══ Underdark. The old story is Baphomet and the labyrinth, and every minotaur has
  // had it told at them by somebody who thought it was conversation. What is actually true of them
  // here: an unerring sense of direction, an enormous frame in a place with low tunnels, and a temper
  // everybody expects and most minotaurs have spent a lifetime disappointing.
  Minotaur: {
    slice: [
      "{a} has never once been lost and has stopped mentioning it because nobody believes it.",
      "{a} was told the Baphomet story by a visitor who thought it was a compliment.",
      "{a} said the labyrinth is a story about somebody else's ancestors.",
      "{a} ducks constantly and has stopped remarking on the ceilings.",
      "{a} was expected to lose {a}'s temper and did not, again, as usual.",
      "{a} said a horn is not a weapon unless you make it one, and has not.",
      "{a} found the way back through six turns of tunnel in the dark without slowing.",
      "{a} eats a great deal and has heard every joke about that too.",
      "{a} said the Underdark has no straight lines and that this is the whole difficulty of it.",
      "{a} keeps a rope on a belt out of a habit the tunnels put there.",
      "{a} was asked whether {a} could smash a door and said yes, and did not.",
      "{a} said people decide about {a} in the doorway and it saves a conversation.",
      "{a} sanded a splinter off a bench so nobody would catch a hand on it.",
      "{a} named every turn between here and the deep road, in order, when asked.",
      "{a} said the old warrens are still down there and that {a} does not go.",
      "{a} is very careful with small objects and slightly proud of being so.",
      "{a} was underestimated by somebody who thought size was the whole of it.",
      "{a} said the horns catch on things and that this is the actual daily inconvenience.",
      "{a} took the low tunnel because somebody had to and did not complain about it.",
      "{a} stood in the yard at the end of the day where the ceiling is the sky.",
    ],
    romance: [
      "{a} told {b} what the Baphomet story does to a childhood.",
      "{a} said {b} had never once expected {a} to lose {a}'s temper.",
      "{a} walked {b} back through six turns in the dark and did not once slow down.",
      "{a} said a horn is not a weapon unless you make it one, and let {b} touch one.",
      "{a} named every turn to the deep road, for {b}, in case {b} ever needed it.",
      "{a} was careful with a very small thing of {b}'s and made a joke about {a}'s hands.",
      "{a} said people decide in the doorway and that {b} had waited until {a} had spoken.",
      "{a} sanded a bench so {b} would not catch a hand on it, and said nothing about it.",
      "{a} said the old warrens are still down there and that {a} would take {b} nowhere near them.",
      "{a} ate a great deal and {b} did not make the joke.",
      "{a} said the Underdark has no straight lines and that this had been the first one.",
      "{a} gave {b} the rope off {a}'s belt and explained what it is for.",
      "{a} said {a} has never once been lost and that {b} could hold onto that.",
      "{a} took the low tunnel so {b} would not have to bend.",
      "{a} was told the Baphomet story by {b} as a joke and laughed properly.",
      "{a} said the horns catch on things and that {b} had learned to move around them.",
      "{a} stood in the yard under the sky and asked {b} to stand there too.",
      "{a} said size is not the whole of it and asked what {b} thought the rest was.",
      "{a} smashed a door, once, for {b}, and enjoyed it more than expected.",
      "{a} found the way back to where {b} was, in the dark, without being asked to.",
    ],
    taboo: [
      "{a} has been ducking more than the ceilings require.",
      "{a} was asked about {b} and named the turns to the deep road.",
      "{a} said it would put {b} beside the minotaur in every telling.",
      "{a} has stopped being careful with small things.",
      "{a} took the rope back off the bench and put it on {a}'s belt.",
      "{a} went down the low tunnel when the talk turned to who was walking out with whom.",
      "{a} said the labyrinth is a story about somebody else's ancestors, sharply.",
      "{a} was expected to lose {a}'s temper and came closer than usual.",
      "{a} was asked whether {a} was courting and said people decide in the doorway.",
      "{a} said the old warrens are still down there, in the tone of somebody with an address.",
      "{a} started a disagreement about the ceilings that was not about ceilings.",
      "{a} said 'that is a matter for my own kind', and {a}'s own kind are a story.",
      "{a} has stopped sanding anything.",
      "{a} was told the Baphomet story and did not let it pass this time.",
      "{a} said a horn is not a weapon unless you make it one, and had been thinking about it.",
      "{a} found the way back and did not go that way.",
      "{a} has not stood in the yard under the sky for some weeks.",
      "{a} said size is not the whole of it, and did not say what the rest was.",
      "{a} said 'it is nothing' and had to duck to leave the room saying it.",
      "{a} stood in the deepest tunnel {a} could find for some hours.",
    ],
  },
  // ═══ TROLL ═══ Regeneration is the whole biology and therefore the whole psychology: three hundred
  // years of a body that comes back, and a hunger that does not stop being urgent. Not stupid —
  // slow to start and very hard to finish, which is not the same thing. And two substances in the
  // world will actually end {a}, which every troll knows the location of at all times.
  Troll: {
    slice: [
      "{a} lost a finger in the morning and had it back by supper and did not mention either.",
      "{a} knows where every lamp, every torch and every flask of oil in this keep is kept.",
      "{a} was hungry an hour after eating and has stopped apologising for saying so.",
      "{a} said three hundred years is a long time to be hungry for.",
      "{a} took a wound that would have ended anybody else and finished the job first.",
      "{a} will not sit with {a}'s back to a fire and nobody has ever asked why.",
      "{a} said healing is not the same as not being hurt, which surprised the household.",
      "{a} was slow to understand a thing and then understood all of it at once.",
      "{a} eats what the household throws out and considers this an arrangement, not charity.",
      "{a} said trolls are not stupid, they are unhurried, and let the household decide.",
      "{a} has scars, which should not be possible, and does not explain them.",
      "{a} counted the fires in the yard on the first evening and knew the number ever after.",
      "{a} was frightened by a spilled lamp and the whole household saw it.",
      "{a} said the ones who ended {a}'s kin used fire and that this is simply the fact of it.",
      "{a} does the work nobody else will because {a} heals and they do not.",
      "{a} said hunger is a thing you have, not a thing you are, and had clearly worked at that.",
      "{a} is far gentler with the household's children than anybody expected.",
      "{a} said a troll alone is a rumour and a troll in a household is a neighbour.",
      "{a} was underestimated and outlasted the person doing it.",
      "{a} sat as far from the hearth as the room allowed at the end of the day.",
    ],
    romance: [
      "{a} sat nearer the fire than {a} has ever sat, because {b} was on the other side of it.",
      "{a} told {b} about the scars that should not be possible.",
      "{a} said healing is not the same as not being hurt, and told {b} what {a} meant.",
      "{a} said three hundred years is a long time and asked how long {b} had.",
      "{a} took a wound meant for {b} and made almost nothing of it, which was the point.",
      "{a} said hunger is a thing you have and not a thing you are, and that {b} taught {a} the difference.",
      "{a} let {b} see {a} frightened by a lamp.",
      "{a} said a troll alone is a rumour and that {a} had stopped being one.",
      "{a} was slow to understand what {b} meant and then understood all of it at once.",
      "{a} ate at the table rather than after, because {b} had set a place.",
      "{a} said the ones who ended {a}'s kin used fire, and that {b} tends the fires here.",
      "{a} did the work nobody else would and did not say it was because {a} heals.",
      "{a} said trolls are unhurried and that {a} would wait as long as it took.",
      "{a} was gentle with something small in front of {b} and did not hide it.",
      "{a} counted the fires and stopped counting them.",
      "{a} said {b} had never once flinched at the healing, which everybody flinches at.",
      "{a} gave {b} something {a} has carried a very long time.",
      "{a} said {a} outlasts everybody and that this had stopped sounding like an advantage.",
      "{a} slept, which {a} does badly, all the way through, once.",
      "{a} sat by the hearth at the end of the day with {b} between {a} and it.",
    ],
    taboo: [
      "{a} has gone back to counting the fires.",
      "{a} was asked about {b} and said {a} was hungry.",
      "{a} said it would put {b} next to a troll in everybody's telling of it.",
      "{a} has been sitting as far from the hearth as the room allows again.",
      "{a} took a wound and made a great deal of it, which is not like {a}.",
      "{a} went to the far yard when the talk turned to who was walking out with whom.",
      "{a} said healing is not the same as not being hurt, about something specific.",
      "{a} has stopped eating at the table.",
      "{a} was asked whether {a} was courting and said {a} outlasts everybody, which is not an answer.",
      "{a} said three hundred years is a long time, and it was not about hunger.",
      "{a} started a disagreement about the lamps that was not about lamps.",
      "{a} said 'that is a matter for my own kind', and {a} has not seen {a}'s own kind in decades.",
      "{a} has been slow to understand things {a} understands perfectly.",
      "{a} said hunger is a thing you have, in the tone of somebody it is winning against.",
      "{a} gave the long-carried thing away and would not say to whom.",
      "{a} was gentle with something small and stopped when noticed.",
      "{a} said a troll alone is a rumour, and had started sounding like one.",
      "{a} has not slept through a night since a particular week.",
      "{a} said 'it is nothing' and a finger grew back while {a} said it.",
      "{a} sat outside where there is no fire at all, for most of a night.",
    ],
  },
  // ═══ THE DEVILS ═══ Frank's ruling: *"the devils are all gonna be one. There will be differences
  // between the ranks just like there are differences between the cultures of military ranks, but
  // not huge differences."* So this is the CULTURE, held in common by every rank, and DEVIL_RANK
  // below carries what each one actually does.
  //
  // What every devil has: **a soul that was mortal once**, promoted up from a lemure that could not
  // speak. A rank, exactly known, in a hierarchy where promotion and demotion are both real. A
  // contract culture where the terms are kept precisely — which is the horror rather than the
  // loophole. And the Blood War underneath everything, which is not a war so much as an appetite.
  "Other Devil": {
    slice: [
      "{a} named {a}'s rank when asked what {a} was, because that is the answer to that question.",
      "{a} does not speak of the lemure {a} was and nobody has been foolish enough to press.",
      "{a} kept an instruction to the letter and the letter turned out to matter.",
      "{a} said the Hells are orderly and that this is what people fail to understand about them.",
      "{a} counted the ranks of everybody present on the first day, including the household's.",
      "{a} said a demotion is as real as a promotion and that both have happened to somebody {a} knew.",
      "{a} was insulted and did nothing at all, which took the room some time to find reassuring.",
      "{a} said the Blood War is not a war, it is an appetite, and did not elaborate.",
      "{a} finds the household's habit of forgiving each other operationally baffling.",
      "{a} read a contract of the household's uninvited and found the clause that would have cost them.",
      "{a} has been in service to three summoners and speaks well of none and ill of none either.",
      "{a} was asked what {a} was before and said it does not survive the transition.",
      "{a} said mortals worry about the wrong half of a bargain, every single time.",
      "{a} does not sleep and has found something useful to do with the hours.",
      "{a} said obedience is not loyalty and that the Hells have never once confused the two.",
      "{a} was polite to somebody frightened of {a} and made it very much worse.",
      "{a} said the terms of {a}'s service have a number of years on them and named it exactly.",
      "{a} finds a keep with no chain of command genuinely difficult to work inside.",
      "{a} said nobody in the Hells is anybody's friend and that the arrangement is at least honest.",
      "{a} stood where {a} could see the whole yard at the end of the day, out of habit.",
    ],
    romance: [
      "{a} told {b} what {a} was before the Hells, which does not survive the transition and {a} remembered anyway.",
      "{a} said {b} reads a term properly, which from a devil is a declaration.",
      "{a} named {b} in the terms of {a}'s service, which required a filing.",
      "{a} said obedience is not loyalty and that {a} was offering the second one.",
      "{a} said {b} outranks {a} in the only hierarchy {a} has chosen for {a}'s own reasons.",
      "{a} said mortals worry about the wrong half of a bargain and asked {b} to worry about the right half.",
      "{a} was insulted on {b}'s behalf and did something about it.",
      "{a} said a demotion is as real as a promotion and that {a} would take one.",
      "{a} explained the household's forgiveness back to {b} and had almost got it.",
      "{a} said nobody in the Hells is anybody's friend, and then did not finish the sentence.",
      "{a} kept a term {a} could have escaped on a technicality {a} had already spotted.",
      "{a} said the Blood War is an appetite and that {a} had found a different one.",
      "{a} told {b} the exact number of years left on the service.",
      "{a} was polite to somebody frightened of {b} and made it very much worse, deliberately.",
      "{a} said the Hells are orderly and that this is not, and did not seem to mind.",
      "{a} found something useful to do with the night hours that was for {b}.",
      "{a} said a term is a term, and then made an exception, and wrote down that {a} had.",
      "{a} let {b} see {a} uncertain, which no devil permits.",
      "{a} said {b} will die and {a} will not, plainly, once, because it needed saying.",
      "{a} stood where {a} could see the whole yard and watched one part of it.",
    ],
    taboo: [
      "{a} has been referring to {b} by post rather than by name, formally, in company.",
      "{a} was asked about {b} and recited the terms of the week's work.",
      "{a} said it would put {b} in somebody's ledger, and a devil means ledger literally.",
      "{a} has been polite for three days, which from {a} is a wall going up.",
      "{a} took {b}'s name back out of the terms and filed the amendment.",
      "{a} found something to inspect when the talk turned to who was walking out with whom.",
      "{a} said obedience is not loyalty, and had gone back to the first.",
      "{a} said nobody in the Hells is anybody's friend and finished the sentence this time.",
      "{a} was asked whether {a} was courting and gave the number of years on the service.",
      "{a} has been unable to be in a room alone with one person.",
      "{a} said a demotion is as real as a promotion, in the tone of somebody expecting one.",
      "{a} started a disagreement about the household's records that was not about records.",
      "{a} said the arrangement is the arrangement, which is what {a} says when it is not.",
      "{a} has stopped correcting anybody's paperwork, which was constant.",
      "{a} said mortals worry about the wrong half of a bargain, and had been worrying about it.",
      "{a} keeps a paper somewhere no devil keeps a paper.",
      "{a} said the Blood War is an appetite and did not sound like {a} had found another.",
      "{a} was insulted and this time answered, precisely and at length.",
      "{a} said 'it is nothing' and did not file anything, which for {a} is the whole confession.",
      "{a} stood where {a} could see the whole yard for most of a night.",
    ],
  },
  // ═══ THE RETURNED ═══ The greater undead — ghoul, ghast, wight, vampire spawn — and the SRD's own
  // INT scores are why they get a voice at all: a wight is 10, as bright as most of the household.
  // Frank's framing was *"they're all mindless, none of them have culture."* **The second half is
  // true of all of them and the first half is not.**
  //
  // What none of them has: a homeland, a faith, a childhood it can reach. What all of them have: a
  // memory of being alive, a hunger that is not metaphorical, and the knowledge that somebody raised
  // them on purpose and could have chosen not to.
  //
  // The register: not tragic, not menacing. Matter-of-fact about being dead, and very tired of
  // people finding that remarkable.
  Wight: {
    slice: [
      "{a} was alive once and mentions it the way another mentions a former trade.",
      "{a} does not eat with the household and stands at the table anyway.",
      "{a} said the hunger is not a metaphor and would not be asked twice about it.",
      "{a} remembers a name that is not the one the household uses.",
      "{a} was asked what dying was like and gave a short answer that ended the conversation.",
      "{a} does not sleep and has found things to do with the hours nobody else wants.",
      "{a} said somebody raised {a} on purpose and could have chosen not to.",
      "{a} kept the night watch for a year before anybody thought to thank {a} for it.",
      "{a} was flinched at by a visitor and did not appear to notice, which is a courtesy {a} does.",
      "{a} said the dead do not have a country and that this is the only freedom in it.",
      "{a} handled something fragile with unusual care, as though out of practice.",
      "{a} said grief is for the living and did not sound as though {a} believed it.",
      "{a} does not go into the chapel and has never explained why.",
      "{a} said the cold is not a problem and the warm is not a comfort.",
      "{a} recognised a name from before and said nothing about recognising it.",
      "{a} is scrupulously honest, which unsettles people more than the alternative would.",
      "{a} said what {a} was raised for and what {a} does now are not the same job.",
      "{a} has outlasted three of the household and speaks of all three by name.",
      "{a} said there is no going back and no going on either, and went back to work.",
      "{a} stood at the window at the hour {a} used to sleep, doing nothing.",
    ],
    romance: [
      "{a} told {b} the name from before.",
      "{a} said {b} had never once flinched, and {a} counts flinches.",
      "{a} said the hunger is not a metaphor and asked whether {b} understood what that meant.",
      "{a} ate at the table because {b} had set a place, and made a poor job of it.",
      "{a} told {b} what dying was like, all of it, which took most of a night.",
      "{a} said somebody raised {a} on purpose and that {a} had stopped resenting it.",
      "{a} said grief is for the living and that {a} had found an exception.",
      "{a} went into the chapel because {b} was in it.",
      "{a} said the dead have no country and that {a} had acquired a household.",
      "{a} handled something of {b}'s with the care of somebody out of practice, and got it right.",
      "{a} said {a} will outlast {b} and had done the arithmetic long before saying it.",
      "{a} kept the night watch under {b}'s window without ever mentioning it.",
      "{a} said what {a} was raised for and what {a} does now are not the same job, and named the second.",
      "{a} recognised a name from before, in front of {b}, and this time said so.",
      "{a} let {b} see {a} hungry.",
      "{a} said the warm is not a comfort and then sat near the fire anyway.",
      "{a} said there is no going back and no going on, and that {b} was a third thing.",
      "{a} spoke of the three {a} has outlasted, by name, and asked {b} not to be a fourth.",
      "{a} said {b} was the first person to ask {a} a question that was not about being dead.",
      "{a} stood at the window at the old hour and {b} came and stood there too.",
    ],
    taboo: [
      "{a} has gone back to standing at the table rather than sitting at it.",
      "{a} was asked about {b} and gave the state of the night watch.",
      "{a} said it would mark {b} as somebody who keeps company with the dead.",
      "{a} has stopped letting anybody see {a} hungry.",
      "{a} said the hunger is not a metaphor, and it was a warning this time.",
      "{a} found something to do with the night hours when the talk turned to who was walking out with whom.",
      "{a} has stopped using the name from before, having used it once.",
      "{a} was asked whether {a} was courting and said the dead do not.",
      "{a} said {a} will outlast {b}, and it was an argument against rather than a fact.",
      "{a} has not been near the chapel since a particular evening.",
      "{a} started a disagreement about the watch rota that was not about the rota.",
      "{a} said 'that is a matter for the dead', which is what {a} says when it is not.",
      "{a} recognised a name from before and left the room.",
      "{a} said grief is for the living, flatly, having said otherwise.",
      "{a} has been handling everything with the care of somebody out of practice, and dropping things.",
      "{a} said there is no going back and no going on, and did not name a third thing.",
      "{a} sat near the fire and did not appear to feel it at all.",
      "{a} has stopped counting flinches.",
      "{a} said 'it is nothing' and the household believed {a}, which is new and is worse.",
      "{a} stood at the window at the old hour for most of a night.",
    ],
  },
  // ═══ DRYAD ═══ 2e: bound to one very large OAK, 360 yards, and *"suffers damage for any damage
  // inflicted upon her home tree."* **She is the tree**, and the tree is on these grounds now.
  //
  // Frank: *"it is very likely someone would fall in love with the dryad, and if that person is in
  // line with her goals it's possible she might fall in love with a non-tree person, because she is
  // a thinking being — although the mating process would be more appropriate to tie a tree and a
  // dryad together."* So: she loves whom she likes and breeds with an oak, and those are two
  // different facts that do not have to agree.
  //
  // The voice: patient in a way that is not serenity, entirely literal about her own nature, and
  // quietly appalled at how casually everybody else treats wood.
  Dryad: {
    slice: [
      "{a} was asked where she sleeps and pointed at the oak, and that was the whole answer.",
      "{a} put a hand flat on the bark on her way past, the way another checks a pocket.",
      "{a} said the household burns an astonishing amount of wood and has stopped saying it out loud.",
      "{a} will not go into the smithy and has explained why exactly once.",
      "{a} said a hurt to the oak is a hurt to her, plainly, so that nobody could later say they did not know.",
      "{a} knew it was going to rain before the sky did anything about it.",
      "{a} spoke to something growing in the yard and did not lower her voice for it.",
      "{a} was offered a bed and declined without appearing to find the offer strange.",
      "{a} said she cannot go far and named the distance, which nobody had asked for.",
      "{a} finds the household's furniture upsetting in a way she has never once made anybody else's problem.",
      "{a} has been here through one turn of the year and treats that as barely an introduction.",
      "{a} was asked her age and said the oak's age instead, as though the question had been answered.",
      "{a} noticed a thing wrong with the roof timbers before the carpenter did.",
      "{a} said her people are solitary and that she had not expected to mind.",
      "{a} stood in the rain on purpose and came in when it stopped.",
      "{a} was startled by an axe being carried past and everybody saw it.",
      "{a} said the seasons here are a fortnight out from where they ought to be.",
      "{a} is patient in a way that is not calm, and the household has learned the difference.",
      "{a} does not lie, and finds the household's small politenesses genuinely confusing.",
      "{a} was at the oak at first light, as she is every morning.",
    ],
    romance: [
      "{a} let {b} put a hand on the oak.",
      "{a} told {b} the exact distance she can go from it, and what happens after.",
      "{a} said a hurt to the oak is a hurt to her and that {b} should know that before deciding anything.",
      "{a} said her people are solitary and that she had stopped being.",
      "{a} said the thing she does with an oak in spring is not this, and that this is not less.",
      "{a} named something growing in the yard after {b} and did not mention having done it.",
      "{a} was startled by an axe and {b} took it out of the yard without being asked.",
      "{a} said {b} had never once treated wood carelessly in front of her.",
      "{a} stood in the rain and {b} stood in it too.",
      "{a} said she cannot follow {b} past the distance, and asked what {b} intended to do about that.",
      "{a} told {b} what the oak was like before anybody built a wall near it.",
      "{a} does not lie, and told {b} something she could easily have kept.",
      "{a} said the household burns an astonishing amount of wood, to {b}, at last.",
      "{a} slept in the oak with the door of the house left open, which she has never done.",
      "{a} said a year is barely an introduction and that she was prepared to be patient about it.",
      "{a} put a hand flat on {b}'s shoulder the way she does on bark.",
      "{a} said {b} wants what she wants, and that this is rarer than affection.",
      "{a} was at the oak at first light and {b} was there.",
      "{a} said she would not survive the oak and asked {b} not to make that anybody's problem.",
      "{a} said the seasons are a fortnight out and that she had stopped counting them.",
    ],
    taboo: [
      "{a} has been at the oak a great deal more than usual.",
      "{a} was asked about {b} and gave the state of the roof timbers.",
      "{a} said a hurt to the oak is a hurt to her, and it was a warning about something else.",
      "{a} has stopped letting anybody near the tree.",
      "{a} said her people are solitary, flatly, having said otherwise.",
      "{a} went and stood at the oak when the talk turned to who was walking out with whom.",
      "{a} has been standing in the rain rather a lot.",
      "{a} was asked whether she was courting and said the word does not mean for her what it means for them.",
      "{a} said she cannot go far and named the distance again, as though it settled something.",
      "{a} has not spoken to anything growing in the yard for some days.",
      "{a} started a disagreement about the firewood that was not about firewood.",
      "{a} said 'it is a matter for the oak', which is what she says when it is not.",
      "{a} does not lie, and has been saying very little.",
      "{a} was startled by an axe and did not let it show, which took work.",
      "{a} took the name off the thing growing in the yard.",
      "{a} said a year is barely an introduction, and it sounded like a way out.",
      "{a} has stopped putting a hand on the bark on her way past.",
      "{a} said the seasons are a fortnight out and that she was thinking about the ones at home.",
      "{a} said 'it is nothing' to somebody who cannot tell when she is lying, because she does not.",
      "{a} was not at the oak at first light, for the first time.",
    ],
  },
  // ═══ VAMPIRE SPAWN ═══ 5e: **Sunlight Hypersensitivity — 20 radiant damage a turn** — so this is
  // somebody who works nights, sleeps in something lightless with grave-earth in the bottom of it,
  // and hands over at dusk. And Frank: *"vampires can be romantically involved, as demonstrated by
  // Strahd."* They can, famously and disastrously.
  //
  // The joke and the horror have to hold together, which is the giff problem again. Gary is
  // employed. Gary has a shift. Gary genuinely needs blood and has made a perfectly reasonable
  // arrangement about it. **None of that stops him being a vampire**, and the household knows.
  "Vampire Spawn": {
    slice: [
      "{a} came up at dusk and was already dressed for the work.",
      "{a} is not to be disturbed between dawn and dusk and the household stopped needing to be told.",
      "{a} said the arrangement with the livestock is adequate and did not elaborate on adequate.",
      "{a} was asked what it is like and gave an answer short enough to end the conversation.",
      "{a} has never once been in the yard at noon and never once explained why not.",
      "{a} did a night's work and left it finished on the bench with a note.",
      "{a} said there is somebody {a} still answers to, and would not say where they are.",
      "{a} does not eat at the table and comes and sits at it anyway.",
      "{a} was invited into a room by somebody who did not know that mattered.",
      "{a} said the hunger is manageable in the tone of somebody managing it.",
      "{a} counted the household on the way past, which {a} does every night.",
      "{a} keeps a long box in the cellar and the household has agreed not to be curious about it.",
      "{a} remembers being alive and mentions it the way another mentions a former address.",
      "{a} said running water is a nuisance and left the sentence there.",
      "{a} was very still for a moment when somebody cut their hand, and then was not.",
      "{a} works the hours nobody else wants and has never asked to be thanked for it.",
      "{a} said the one who made {a} is not dead, which is a fact and not a complaint.",
      "{a} is unfailingly polite in a way that unsettles new staff for about a month.",
      "{a} said dawn is a deadline and treats it as one.",
      "{a} shut the cellar door at first light, as {a} does.",
    ],
    romance: [
      "{a} told {b} what it is like, all of it, over the course of one very long night.",
      "{a} said {b} had never once flinched when {a} came into a room.",
      "{a} was invited in by {b}, properly, using the words, and it mattered more than {b} knew.",
      "{a} said the hunger is manageable and that {b} should know exactly what manageable costs.",
      "{a} stayed up past dawn once, indoors, with the shutters closed, because {b} was talking.",
      "{a} told {b} about the one who made {a}, and what {a} intends to do about it eventually.",
      "{a} left the note on the bench addressed to {b} by name.",
      "{a} said {b} keeps hours nobody sensible keeps, and sounded pleased.",
      "{a} was very still when {b} cut a hand, and left the room, and came back and said why.",
      "{a} said dawn is a deadline and that {a} had started resenting it.",
      "{a} showed {b} the long box in the cellar.",
      "{a} said {a} remembers being alive and that {b} is the first person who asked what {a} was like then.",
      "{a} counted the household on the way past and stopped at {b}'s door.",
      "{a} said the arrangement with the livestock is adequate and that {b} need never think about it.",
      "{a} came up at dusk and {b} was waiting, which had clearly been arranged.",
      "{a} said {b} will get old and {a} will not, plainly, once, because it had to be said.",
      "{a} did not go out at all one night, which is the only night {a} has ever wasted.",
      "{a} said running water is a nuisance and that {a} would cross it if it came to that.",
      "{a} was polite to {b} in the ordinary way, which for {a} is the intimate one.",
      "{a} shut the cellar door at first light and left it unlatched.",
    ],
    taboo: [
      "{a} has gone back to sitting at a table {a} does not eat at.",
      "{a} was asked about {b} and gave the state of the livestock arrangement.",
      "{a} said {b} would be explaining the arrangement to people for the rest of {b}'s life.",
      "{a} has stopped leaving notes on the bench.",
      "{a} was very still when {b} came in and the stillness lasted a beat too long.",
      "{a} went down to the cellar early when the talk turned to who was walking out with whom.",
      "{a} said the hunger is manageable, and it was not a reassurance.",
      "{a} has stopped counting the household on the way past.",
      "{a} was asked whether {a} was courting and said the dead do not, which is untrue and {a} knows it.",
      "{a} said the one who made {a} is not dead, in the tone of somebody expecting a visit.",
      "{a} latched the cellar door.",
      "{a} said dawn is a deadline and sounded relieved about it.",
      "{a} started a disagreement about the night rota that was not about the rota.",
      "{a} said 'that is a matter for after dark', which is what {a} says when it is not.",
      "{a} has been unfailingly polite to one person in particular.",
      "{a} said {b} will get old, and this time it was an argument against.",
      "{a} has not been invited into a room in some weeks and has not asked to be.",
      "{a} left a note that was not for anybody and took it back.",
      "{a} said 'it is nothing' and was already at the cellar stair.",
      "{a} came up at dusk and went straight out, and was not seen until dawn.",
    ],
  },
  // ═══ HALF-ELF ═══ The one people whose base culture IS universal, because it is about belonging
  // to neither — and that is the same in Waterdeep as in the Marches. Long-lived enough to watch
  // human friends go; short-lived enough to be a season in an elf's life.
  "Half-Elf": {
    slice: [
      "{a} was taken for human by one visitor and elven by the next, in the same afternoon.",
      "{a} has a foot in two houses and pays rent on neither.",
      "{a} has buried people {a} grew up with and is not yet middle-aged.",
      "{a} was asked which side the family came from and gave the whole answer, which took a while.",
      "{a} gets on with everybody and is close to almost nobody.",
      "{a} has outlived two friends already and is not old.",
      "{a} said the elves think {a} is hurried and the humans think {a} is slow.",
      "{a} knows the courtesies of both peoples and uses whichever the room wants.",
      "{a} was the one sent to smooth a thing over, again, and did it, again.",
      "{a} said 'my people' and then had to specify, and looked tired about it.",
      "{a} keeps two calendars and finds neither of them quite right.",
      "{a} was asked to settle an argument between an elf and a human and refused on principle.",
      "{a} learned a thing quickly and was told {a} was quick for an elf and slow for a human.",
      "{a} has been in this household longer than anybody and is still asked where {a} is from.",
      "{a} remembers a human's grandmother and does not mention it.",
      "{a} said there was no word in either tongue for what {a} is, and there is not.",
      "{a} finds the elves restful and the humans easier and has never resolved that.",
      "{a} was invited to two festivals on the same day and went to neither.",
      "{a} makes friends easily and does not, on examination, keep very many.",
      "{a} stood between two people arguing and understood both, which helped nobody.",
    ],
    romance: [
      "{a} told {b} about the two houses and which one {a} would choose if made to.",
      "{a} said {b} was the first person who did not ask which side.",
      "{a} let {b} see the two calendars and explained why neither works.",
      "{a} said the years would go differently for them and said it early, on purpose.",
      "{a} taught {b} a courtesy from each side and let {b} pick.",
      "{a} named {b} to both halves of the family, which took two very different letters.",
      "{a} stopped translating for {b} and started just talking.",
      "{a} said {a} had outlived friends and did not want to do it again, and then apologised for saying it.",
      "{a} used 'my people' about the household rather than about either side.",
      "{a} made {b} something in a pattern that belongs to neither tradition.",
      "{a} said {b} made the in-between part bearable.",
      "{a} took {b} to a festival and stayed the whole evening for once.",
      "{a} told {b} which grandmother {a} remembers and what she was like.",
      "{a} said out loud that {a} was tired of being between things, to the one person who listened.",
      "{a} asked {b} how long {b} thought they had, and meant it kindly.",
      "{a} has stopped smoothing things over when {b} is the one arguing.",
      "{a} said there was no word for what {a} is and {b} said there did not need to be.",
      "{a} kept a thing of {b}'s in the place {a} keeps things from both houses.",
      "{a} said 'ours' about something for the first time in a long while.",
      "{a} stood beside {b} rather than between anybody, and noticed the difference.",
    ],
    taboo: [
      "{a} has gone back to smoothing things over, which {a} does when {a} is hiding.",
      "{a} was asked about {b} and gave an answer that would satisfy either kind of listener.",
      "{a} has stopped using 'my people' about the household.",
      "{a} was invited to two things and went to neither, again.",
      "{a} translated for {b} in a room where {b} needed no translation.",
      "{a} said it would be complicated for {b}'s family, having never met them.",
      "{a} has been keeping both calendars very carefully and reconciling neither.",
      "{a} defended a custom from whichever side was not being questioned.",
      "{a} said 'people like me' and then would not finish the sentence.",
      "{a} has stopped being close to anybody, which for {a} takes no effort at all.",
      "{a} was seen waiting somewhere with no reason to wait.",
      "{a} said {a} was used to being between things, in a tone that gave it away.",
      "{a} found a reason to be needed elsewhere whenever the talk turned to couples.",
      "{a} has been very agreeable with everybody, which is how {a} disappears.",
      "{a} keeps something in the place where things from both houses go.",
      "{a} was asked directly and gave the elven answer, which is not an answer.",
      "{a} said it would pass, the way things do, at whichever speed.",
      "{a} has stopped remembering things aloud.",
      "{a} started a letter to one half of the family and did not finish it.",
      "{a} stood between two people arguing and did not hear a word of it.",
    ],
  },
  // ═══ HALFLING ═══ Family first, comfort without apology, and an unbothered competence that
  // unsettles more anxious peoples. A halfling is rarely impressed and almost never rude about it.
  Halfling: {
    slice: [
      "{a} made the {room} more comfortable than it needed to be and will not be thanked for it.",
      "{a} was asked about the family and named eleven people before anybody could stop {a}.",
      "{a} put a skiprock through a knot in a fence post at thirty paces, once, and never mentioned it again.",
      "{a} calls the people hin and lets 'halfling' pass with a shrug, as {a} has for forty years.",
      "{a} settled a quarrel by feeding both parties.",
      "{a} has adopted the local god, which is what {a}'s people do, and means it sincerely.",
      "{a} has an arrangement with the cook that nobody else has managed.",
      "{a} keeps a dog that outweighs {a} and answers only to {a}.",
      "{a} keeps a chair in the {room} that is the right height, and defends it.",
      "{a} wrote to a cousin about nothing at all, at length, as {a} does weekly.",
      "{a} was the only one who noticed somebody had gone quiet, and did something about it.",
      "{a} said the work would keep, and it did.",
      "{a} was underestimated by a visitor and let it stand, having got what {a} wanted.",
      "{a} named a dish {a}'s grandmother made and the whole table wanted some.",
      "{a} has never once been late and has never once seemed to be hurrying.",
      "{a} carried something twice {a}'s own size and made it look like a decision.",
      "{a} said a house without a good chair in it is not a house.",
      "{a} knows everybody's name in this keep including the ones nobody uses.",
      "{a} took the second-best of everything and looked perfectly content about it.",
      "{a} sat down in the {room} at the end of the day, properly, the way nobody else manages.",
    ],
    romance: [
      "{a} fed {b} first, which from {a} is a declaration.",
      "{a} wrote to the cousins about {b} before mentioning {b} to {b}.",
      "{a} made {b} a chair the right height, which took a week.",
      "{a} told {b} about all eleven of them, by name, with the histories.",
      "{a} said {b} would be welcome at the table, and meant a very specific table.",
      "{a} cooked the grandmother's dish for {b} and watched {b} eat all of it.",
      "{a} was unimpressed by everything except one thing.",
      "{a} said there was no hurry, and for once seemed to mind that.",
      "{a} settled a quarrel {b} was in by feeding everybody, and fed {b} last.",
      "{a} noticed {b} had gone quiet before {b} had noticed.",
      "{a} kept the second-best and gave {b} the best, and denied doing it.",
      "{a} said the household was fine but a house is different, to nobody in particular.",
      "{a} taught {b} the family word for something small and warm.",
      "{a} carried something for {b} that {b} could easily have carried.",
      "{a} said {b} was worth being hurried for, which from {a} is very nearly poetry.",
      "{a} put a second name in the letter to the cousins.",
      "{a} asked {b} what {b} liked to eat and remembered every part of the answer.",
      "{a} said 'when we have a place' about a place nobody had proposed.",
      "{a} was late once, and it was because of {b}, and everybody noticed.",
      "{a} sat down in the {room} at the end of the day with {b} and did not get up for some time.",
    ],
    taboo: [
      "{a} has stopped writing to the cousins, which {a} did every week for nine years.",
      "{a} was asked about {b} and offered everybody food until the question went away.",
      "{a} gave up the chair, which nobody has ever known {a} to do.",
      "{a} has been eating alone, which for {a} is nearly a distress signal.",
      "{a} said it would upset the family, and would not say which part of it.",
      "{a} has been unimpressed by everything, including things {a} likes.",
      "{a} left the table when the talk turned to who was walking out with whom.",
      "{a} defended a family propriety {a} has laughed at since childhood.",
      "{a} started a letter, got two lines in, and used it to light the fire.",
      "{a} has stopped noticing when people go quiet, which is not like {a} at all.",
      "{a} said there was no hurry in a tone that suggested there was.",
      "{a} cooked the grandmother's dish and gave it to somebody else.",
      "{a} was asked directly and answered with a recipe.",
      "{a} keeps something small in the tin where the letters go.",
      "{a} has been going the long way to the kitchen and the kitchen is one room over.",
      "{a} said 'people like us' and then would not say what {a} meant by us.",
      "{a} was seen waiting by the door with nothing to wait for.",
      "{a} has been very hospitable to everybody, which is how {a} avoids one person.",
      "{a} said it would pass, and then made too much supper.",
      "{a} sat down at the end of the day and did not eat any of it.",
    ],
  },
};

// ═══════════════════ REGIONAL CULTURE — WHERE A PEOPLE ACTUALLY IS ═════════════════════════════
// Frank, 2 Aug, after asking whether the species lines were drawing on Forgotten Realms canon or
// generic fantasy. **They were generic — Tolkien with the serial numbers filed off.** The dwarf
// lines were craft-pride and grandfathers and would have sat in any setting; nothing touched Delzoun,
// the Thunder Blessing, or the Hidden and the Wanderers. Worse, they contradicted the faith table
// three hundred lines up, which already assigns Moradin, Dumathoin and Clangeddin by name.
//
// His ruling: **direct references only where appropriate, and regional variation is key.**
//
// ---- WHY THIS IS AN OVERLAY AND NOT A FULL TABLE PER PAIR --------------------------------------
// 32 peoples x 16 regions x 60 lines is 30,720 sentences, and most of them would be identical: a
// dwarf in Cormyr and a dwarf in the Dalelands are ONE culture in two places. What differs is the
// handful of combinations that are genuinely their own culture — a Silver Marches shield dwarf whose
// grandparents' hold is a ruin held by orcs is not a Waterdhavian dwarf with a shop.
//
// So: the BASE table says what is true of that people anywhere; an OVERLAY adds what is true of them
// HERE, and is drawn from alongside the base. Absent overlay, the base stands alone.
//
// ---- WHAT THE CANON ACTUALLY SAYS, since I wrote the first pass from memory and it showed --------
// SHIELD DWARVES: descended from Shanatar, migrated north, founded Delzoun, Ammarindar, Oghrann,
//   Haunghdannar — **all fallen**, the last in 882 DR. Divided for generations into the HIDDEN
//   (reclusive) and the WANDERERS (comfortable among other peoples), a distinction the Thunder
//   Blessing is now dissolving. That Blessing — Moradin's gift in the Year of Thunder, 1306 DR —
//   soared the birthrate; roughly one birth in five is twins, and the generation is called the
//   THUNDER CHILDREN. Their craft tends to WAR more than other dwarves'. Mirabar and Mithral Hall
//   are openly antagonistic and Mirabar dwarves have defected over it.
// ELVES: the RETREAT to Evermeet began 1344 DR. An elf still in Faerûn is one who did not go —
//   which is a decision, and for many an estrangement from everybody who did.
// ORCS: the Kingdom of Many-Arrows, founded by Obould in the foothills of the Spine of the World,
//   out of Citadel Felbarr — a dwarven citadel orcs held for three hundred years. An orc drawing
//   wages in a Silver Marches keep is from the polity these walls were built against.
// ---- WHERE AN OVERLAY IS DELIBERATELY ABSENT ----------------------------------------------------
// Dwarf, Elf and Orc are WRAPPED as of 2 Aug: every region where the culture is genuinely its own
// has a full overlay. The regions below have these peoples at 5-10% and NO overlay, and that is a
// ruling rather than a gap:
//
//   dwarf   swordcoast · dessarin · moonsea    a dwarf in these places is a trading-town dwarf and
//                                              already speaks with the Waterdeep or Marches voice
//   orc     swordcoast · neverwinter           close enough to the Dessarin hill orc to be the same
//   elf     heartlands                          a Cormanthor-adjacent elf; the Retreat lines carry it
//   both    avernus                             nobody in Hell is there as a PEOPLE — they are there
//                                               as somebody's soldier or somebody's property, and the
//                                               locale table already says so
//
// **An overlay exists where the CULTURE differs, not where the map does.** Writing one for every
// pairing would produce the duplicate problem at scale — the Moonsea orc table already sprang it
// eight times, because those lines were about being an orc rather than about being there.
export const OVERLAY_DELIBERATELY_ABSENT: Record<string, string[]> = {
  Dwarf: ["swordcoast", "dessarin", "moonsea", "avernus"],
  Elf: ["heartlands", "avernus"],
  Orc: ["swordcoast", "neverwinter"],
};

// ---- WHAT EACH RANK ACTUALLY DOES ---------------------------------------------------------------
// Frank: *"there will be differences between the ranks just like there are differences between the
// cultures of military ranks, but not huge differences."* Exactly the shape of a regional overlay,
// and it composes the same way: the CULTURE table says what every devil is, and this says what this
// one was made for. Six lines each, not sixty, because the difference is not supposed to be large.
//
// The jobs are canon and each is specific:
//   SPINED   messengers and spies, flying artillery — the lowest that can be trusted with an errand
//   BEARDED  violent shock troops (keeps its own full table; written before the ruling)
//   BARBED   guards, "unnatural alertness" — and cannot pass between the layers of Hell unaided
//   CHAIN    jailers and torturers
//   BONE     Hell's internal affairs: watches other devils for disloyalty and inefficiency
//   HORNED   flying infantry, and the sources note them **cowardly** — loyal out of fear of superior
//            power rather than out of loyalty, which is a very unusual thing to say about a devil
export const DEVIL_RANK: Record<string, string[]> = {
  "Spined Devil": [
    "{a} carried a message across the whole keep faster than anybody thought possible and waited to be told it had arrived.",
    "{a} said a spinagon is trusted with errands and not with anything else, without bitterness.",
    "{a} was overhead somewhere for most of an afternoon and gave a full account afterwards, unasked.",
    "{a} said {a} is the lowest rank that can be sent anywhere alone.",
    "{a} noticed a thing from the air that four people on the ground had missed.",
    "{a} volunteered for the errand nobody wanted because errands are what {a} is for.",
  ],
  "Barbed Devil": [
    "{a} was awake, and was awake the last four times anybody checked, and is always awake.",
    "{a} took the guard post without being assigned it and has held it since.",
    "{a} said a hamatula cannot cross between the layers unaided and that this is simply the design.",
    "{a} noticed somebody at the gate before the dog did.",
    "{a} said guarding is the whole of it and does not want anything else.",
    "{a} counted the household in and out, every day, and has never once been wrong.",
  ],
  "Chain Devil": [
    "{a} was a jailer and does not pretend the work was anything else.",
    "{a} keeps the chains in a condition that is unnerving to everybody who understands why.",
    "{a} is very good with locks and has offered to look at the keep's, which nobody has taken up.",
    "{a} said pain is a language and that {a} has stopped being fluent in it, which took work.",
    "{a} was asked what a kyton does and gave an honest answer and the room went quiet.",
    "{a} has never once raised a chain here and everybody has noticed the never.",
  ],
  "Bone Devil": [
    "{a} watched the household for a week and then reported a discrepancy nobody had spotted.",
    "{a} said an osyluth watches other devils, and let the household work out what that means here.",
    "{a} was disliked on arrival by everybody who knew what an osyluth is.",
    "{a} keeps a record of who was where and has never been asked to and does it anyway.",
    "{a} said disloyalty is not the same as inefficiency and that {a} was made to find both.",
    "{a} noticed somebody stealing and said nothing for three days and then said it exactly.",
  ],
  "Horned Devil": [
    "{a} did the minimum and did it faultlessly, which is a skill of its own.",
    "{a} was reluctant to go first and went first anyway, and everybody saw both halves.",
    "{a} said a cornugon obeys out of a clear sense of what happens otherwise.",
    "{a} was provoked, once, and the household has been careful ever since.",
    "{a} took the flying watch because it is the safest watch and said so plainly.",
    "{a} said {a} has never betrayed a superior and did not say it was out of loyalty.",
  ],
};
export const devilRank = (sp?: string | null) => (sp && DEVIL_RANK[sp]) || null;

export const REGIONAL_FLAVOR: Record<string, Record<string, { slice?: string[]; romance?: string[]; taboo?: string[] }>> = {
  // ═══ THE SILVER MARCHES ═══ Luruar: Silverymoon, Everlund, Sundabar, and the three dwarven
  // citadels — Adbar, Felbarr, Mithral Hall. The alliance exists because of Many-Arrows in the
  // foothills of the Spine of the World. Every people here is defined by that war or by the ruins
  // left from the last one.
  silvermarches: {
    // MARCHES HUMANS. Silverymoon, Everlund, Sundabar — a confederation of cities that exists
    // because of Many-Arrows in the foothills, allied with two dwarven citadels and a dwarven king.
    // A human here is a MINORITY PARTNER in their own country and knows it: forty percent, sharing
    // a table with dwarves who remember the last war and elves who remember the one before.
    // Silverymoon is the most civilised city in the North and says so.
    Human: {
      slice: [
        "{a} named the city rather than the confederation, and then apologised for the confederation.",
        "{a} said Silverymoon is the finest city in the North and dared anybody to name a better.",
        "{a} was the only human at a table and did not remark on it, because that is most tables.",
        "{a} said the alliance holds because the alternative is visible from the wall.",
        "{a} has learned enough Dwarvish to be polite and enough Elvish to be embarrassing.",
        "{a} said Sundabar's walls are dwarf-work and the humans in it have never once said so.",
        "{a} counted the Adbar caravan in and was pleased when it came by the surface road.",
        "{a} said Everlund keeps the roads and Silverymoon keeps the books.",
        "{a} was raised knowing the names of three dwarven kings and two human ones.",
        "{a} said the winter here decides who was serious about staying.",
        "{a} distrusts a treaty and trusts the people who signed this one, which took a war.",
        "{a} knows which of the household would be welcome in Adbar and which would not.",
        "{a} said the elves were here first and says it without either resentment or apology.",
        "{a} looked north toward the Spine at the end of the day, as everybody here does.",
        "{a} has never once been the majority in a room and finds southerners odd about it.",
        "{a} said the Marches is an arrangement rather than a country, and prefers it.",
        "{a} keeps a blade sharp for a war that has been over for years.",
        "{a} said Alustriel's peace, in the tone people use for a peace they expect to outlive.",
        "{a} was courteous to a dwarf in a way that had clearly been learned rather than inherited.",
        "{a} named the passes and which of them are watched and which are only said to be.",
      ],
      romance: [
        "{a} said {b} would be welcome in Adbar, and had checked before saying it.",
        "{a} learned a word of {b}'s language and used it badly on purpose, twice.",
        "{a} took {b} up onto the wall to look north, which is what people here do instead of talking.",
        "{a} said Silverymoon is the finest city in the North and that {b} should see it in spring.",
        "{a} named {b} to a dwarf {a} has known twenty years, formally.",
        "{a} said the alliance holds because the alternative is visible, and so does this.",
        "{a} kept a blade sharp for a war that is over and gave {b} the good one.",
        "{a} said {a} had never been the majority in a room and had stopped noticing with {b} there.",
        "{a} counted the caravan in and looked for one particular face.",
        "{a} taught {b} the polite Dwarvish and then the impolite Dwarvish.",
        "{a} said the winter decides who was serious, and had decided.",
        "{a} walked {b} to Everlund and back in weather nobody travels in.",
        "{a} said the elves were here first and that {a} had lately understood being outlasted.",
        "{a} put {b}'s name on the muster roll beside {a}'s own.",
        "{a} named the pass {a} would take if it came to leaving, and then said {a} would not.",
        "{a} said Alustriel's peace would hold long enough, and was not talking about politics.",
        "{a} was courteous to {b} in a way that had not been learned from anybody.",
        "{a} said the Marches is an arrangement and that {a} would like one.",
        "{a} told {b} what the last war took, by name.",
        "{a} looked north toward the Spine with {b} and did not look long.",
      ],
      taboo: [
        "{a} has been up on the wall at hours the watch is already set.",
        "{a} was asked about {b} and gave a report on the caravan schedule.",
        "{a} said it would be known in three cities by the thaw, to nobody.",
        "{a} has stopped taking {b} anywhere at all.",
        "{a} took {b}'s name off the muster roll.",
        "{a} went to see to the horses when the talk turned to who was promised to whom.",
        "{a} said the alliance holds because the alternative is visible, bitterly.",
        "{a} has stopped speaking Dwarvish in company, badly or otherwise.",
        "{a} was asked whether {a} was courting and named a pass.",
        "{a} has been unusually courteous to everybody and formal with one person.",
        "{a} started a quarrel about Sundabar that was not about Sundabar.",
        "{a} said 'it is a private matter' in a confederation where nothing is private.",
        "{a} keeps a blade sharp for no war at all now.",
        "{a} has stopped counting the caravan in.",
        "{a} said 'it would go hard for them in Adbar' and would not say for whom.",
        "{a} was seen on the north road at an hour with nothing at the end of it.",
        "{a} has stopped saying the elves were here first, which was a habit of thirty years.",
        "{a} said the winter decides who was serious, in a tone that was a decision.",
        "{a} said 'it is nothing' with the Spine behind {a} and did not turn round.",
        "{a} looked north toward the Spine for a very long time.",
      ],
    },
    Dwarf: {
      slice: [
        "{a} named a hold that has been a ruin for six hundred years as though giving a street address.",
        "{a} has a twin. Half the young ones here have a twin, and the old ones have not stopped remarking on it.",
        "{a} was asked where the family is from and said Delzoun, which has not existed since before Waterdeep had walls.",
        "{a} will not hear a word said for Mirabar, and did not explain, and was not asked twice.",
        "{a} counted the Adbar caravan in and looked put out that it had come by the deep road again.",
        "{a} keeps a key to a door that is four hundred miles away and behind an orc garrison.",
        "{a} said the word 'Felbarr' and the whole table went quiet for a beat and then did not.",
        "{a} was born after the Blessing and gets told so, by the older ones, roughly weekly.",
        "{a} sharpened a war-blade with more care than the kitchen knives, and did not think it worth remarking.",
        "{a} spoke of Moradin's hammer the way another might speak of a grandfather's trade.",
        "{a} can name every hold between here and Adbar and which of them still answers.",
        "{a} was asked whether the family were Hidden or Wanderers and gave a longer answer than expected.",
        "{a} refuses to call the Evermoors anything but what the maps called it before the trolls.",
        "{a} priced a piece of work by what Mirabar would charge and then went lower out of spite.",
        "{a} knows the length of the Adbar road in days, in winter, both ways.",
        "{a} remarked that Sundabar's walls are dwarf-work and the humans in it have never once said so.",
        "{a} takes the north watch on principle and will not say what the principle is.",
        "{a} has a brother at Felbarr and a letter that is three months out of date.",
        "{a} said the Marches were a good arrangement, considering, which from {a} is high praise for a treaty.",
        "{a} looked at the mountains for a while at the end of the day and did not say anything about it.",
      ],
      romance: [
        "{a} told {b} which hold the family came out of, and how it fell, which is not a thing {a} tells.",
        "{a} said {b} would be welcome at the hold, and then remembered the hold is a ruin, and said it anyway.",
        "{a} has begun using the old word for it rather than the Common one, and only with {b}.",
        "{a} named {b} in a letter to Adbar, in the part of a letter where you name family.",
        "{a} made {b} something with the clan-mark on it, very small, in a place only {b} would look.",
        "{a} asked {b} to come north in the spring and made it sound like an errand.",
        "{a} said the Blessing had been good to the clan and then went red about having said it.",
        "{a} taught {b} to say a thing properly in Dwarvish and was patient about it, twice.",
        "{a} put {b}'s measure in the book where the clan keeps measures.",
        "{a} would walk the Adbar road in winter for {b} and has said so, once, plainly.",
        "{a} showed {b} the key to the ruined door, and let {b} hold it.",
        "{a} has stopped saying 'my hold' and started saying 'the hold' when {b} is listening.",
        "{a} argued with {b} about Mirabar for an hour and enjoyed every minute of it.",
        "{a} carved two marks on the same beam and did not explain the second one.",
        "{a} told {b} what the family name means, which takes some telling.",
        "{a} sent to Felbarr for something small and would not say who it was for.",
        "{a} said {b}'s name in the old fashion, with the clan after it, which is not a joke.",
        "{a} let {b} see the roll of the dead and read three of the names aloud.",
        "{a} said that when the hold is retaken, and {a} says when, {b} should see it.",
        "{a} was asked by a countryman what {b} was to {a} and answered in one word that ended the question.",
      ],
      taboo: [
        "{a} has become very exact about what the clan would say, having never once mentioned the clan before.",
        "{a} was asked about {b} and answered with a proverb, in Dwarvish, that nobody present could translate.",
        "{a} has stopped writing to the hold, and used to write every month.",
        "{a} left the hall when the talk turned to who among the young ones is promised to whom.",
        "{a} has taken to doing the north watch alone, and it was never a one-person watch.",
        "{a} said the old rules were the old rules and did not say whether that settled it.",
        "{a} was asked whether the clan knew and said the clan knew what it needed to.",
        "{a} keeps a letter unsent in a place a letter should not be kept.",
        "{a} has stopped mentioning the spring, having mentioned the spring rather a lot.",
        "{a} defended a countryman's remark about propriety and then would not meet anybody's eye.",
        "{a} takes the deep road when the surface road is quicker and has a reason ready.",
        "{a} has been polishing the clan-mark on something and has not put it anywhere visible.",
        "{a} went quiet when Adbar came up, which has never once happened before.",
        "{a} said it was a hold matter, which is what {a} says when it is not.",
        "{a} has been very interested in what the household thinks of such arrangements, in general.",
        "{a} was seen at the far gate at an hour nobody uses the far gate.",
        "{a} would not sing the third verse and has always sung the third verse.",
        "{a} said the family would understand in a tone that suggested {a} was working on it.",
        "{a} has stopped correcting people who get {b}'s name wrong, which used to be a small crusade.",
        "{a} put something in the bottom of the tool-chest under things nobody moves.",
      ],
    },
    Elf: {
      slice: [
        "{a} did not go west, and does not discuss not having gone west.",
        "{a} spoke of Evermeet the way you speak of a room you chose not to enter.",
        "{a} had a letter from the Green Isle and left it three days before opening it.",
        "{a} knows every name on a roll of the dead that nobody else here can read.",
        "{a} was asked whether the family had gone over and said 'most', and went back to work.",
        "{a} looked west at sunset for slightly longer than the sunset warranted.",
        "{a} corrected a human's account of a war {a} was present at, gently, and let the rest stand.",
        "{a} has been in the Marches longer than Silverymoon has had its current walls.",
        "{a} remembers when this valley was somebody else's and says so exactly once a season.",
        "{a} keeps something of Cormanthor's on a shelf and has never said what it is.",
        "{a} named a road that has not been a road since the trolls came, and gave good directions on it.",
        "{a} was in Silverymoon under three different rulers and has opinions about the middle one.",
        "{a} said the High Forest was safer once, and then said that it was not, and left it there.",
        "{a} finds the humans here hurried, and has stopped saying so, and still visibly finds them hurried.",
        "{a} knows which of the standing stones were put there by elves and which were not.",
        "{a} did not attend the memorial and left something at it afterwards, alone.",
        "{a} speaks of the Retreat in the past tense, which not every elf here manages.",
        "{a} was asked to sing something old and sang something older than the asker expected.",
        "{a} keeps the elven reckoning of the year alongside the Dalereckoning and uses both.",
        "{a} has watched three human families hold this land and buried the first two.",
      ],
      romance: [
        "{a} told {b} why {a} stayed, which is the first time anybody here has been told.",
        "{a} said something in Elvish to {b} and then, unusually, translated it.",
        "{a} has stopped looking west in the evenings and has not noticed stopping.",
        "{a} began teaching {b} the elven reckoning without being asked to.",
        "{a} named {b} in a letter to the Isle, in a sentence that took some drafting.",
        "{a} showed {b} the thing from Cormanthor and told the whole of what it was.",
        "{a} spoke of a hundred years hence and had clearly done the arithmetic.",
        "{a} took {b} to a stone in the hills that only elves know the name of.",
        "{a} said {b}'s human years out loud once and then never mentioned them again.",
        "{a} let {b} hear the song {a} does not sing where anybody can hear it.",
        "{a} has begun waking at {b}'s hours, which for {a} is a genuine sacrifice.",
        "{a} wrote {b}'s name in the elven hand and left it where {b} would find it.",
        "{a} told {b} about the one who did go west, and about not following.",
        "{a} asked {b} to see Silverymoon in the spring and made a plan of it.",
        "{a} said 'stay' plainly, once, and did not soften it afterwards.",
        "{a} put a hand on {b}'s and did not move it for the length of a conversation.",
        "{a} answered a question about the future using the word 'we' and did not correct it.",
        "{a} taught {b} the polite form and then, later, the other one.",
        "{a} carried something of {b}'s for a whole day without mentioning having it.",
        "{a} said the Retreat had been a mistake, and was not talking about the Retreat.",
      ],
      taboo: [
        "{a} was asked about {b} and answered in the manner of somebody discussing the harvest.",
        "{a} has taken to walking out at hours when the household is asleep, and returns before it wakes.",
        "{a} let a letter from the Isle go unanswered for a month, which has never happened.",
        "{a} has stopped speaking Elvish in company, which was never a habit worth breaking before.",
        "{a} became extremely interested in the Marches' marriage customs, academically.",
        "{a} was told a piece of gossip about two other people and looked relieved by it.",
        "{a} has begun leaving gatherings early and arriving at them late.",
        "{a} put something out of sight when the door went, and did it too smoothly.",
        "{a} said the word 'complicated' and then talked about the weather until it passed.",
        "{a} has been writing in the elven hand and burning it.",
        "{a} was asked directly and gave an answer of great length containing nothing.",
        "{a} stopped attending the evening hall and has an explanation involving the light.",
        "{a} defended a rule {a} has openly disregarded for two centuries.",
        "{a} has stopped saying {b}'s name and started saying 'the smith' and 'the one in the kitchen'.",
        "{a} was seen at the treeline and had no reason to be at the treeline.",
        "{a} spoke warmly of somebody else, at length, to nobody who had asked.",
        "{a} has taken up an interest that happens to require the same hours as somebody else's.",
        "{a} said it was an elven matter, which is what {a} says when it is nobody's matter but two.",
        "{a} let a slight against {b} pass in the hall and then could not settle for the rest of the evening.",
        "{a} keeps a thing in a pocket and has stopped taking it out where anybody can see.",
      ],
    },
    Orc: {
      slice: [
        "{a} draws wages inside walls that were built to keep {a}'s grandfather out, and has made peace with the joke.",
        "{a} was asked about Many-Arrows and said it was a long way north, which was not the question.",
        "{a} took a remark about orcs on the chin and went back to work, and the man who made it has been quiet since.",
        "{a} knows exactly which of this household would not have hired {a} and holds no grudge worth the name.",
        "{a} named Gruumsh once, flatly, and nobody in the {room} knew what to say.",
        "{a} has been here four years and is still introduced as the orc.",
        "{a} handled a dwarf-forged blade with real respect and said nothing about where it likely came from.",
        "{a} was the first to the wall when the horn went, which surprised precisely one person.",
        "{a} eats apart some evenings, not out of hurt, and comes back the next without comment.",
        "{a} said the word 'Obould' the way you say the name of somebody else's king.",
        "{a} has a cousin under the mountain and does not write, and does not not think about it.",
        "{a} was asked whether {a} had fought in the war and said yes, and was not asked which side.",
        "{a} carries the load two dwarves were arguing over and neither of them thanked {a} for it.",
        "{a} learned the dwarven word for a tool because the dwarves here only use the dwarven word.",
        "{a} was refused service in Sundabar once and mentions it about twice a year.",
        "{a} knows the mountain passes better than the map does and has stopped offering to say so.",
        "{a} keeps a tusk-ring in a box and has not worn it since taking the post.",
        "{a} laughed at a joke about orcs, genuinely, and it stopped the table dead.",
        "{a} said the Marches were the only place that would have {a}, and did not sound bitter about it.",
        "{a} stood a long watch on the north wall and looked north the whole time.",
      ],
      romance: [
        "{a} told {b} the name {a} was given before the one this household uses.",
        "{a} asked {b} whether it would be a trouble, meaning the whole of it, and {b} said no.",
        "{a} walked {b} past the gate-watch deliberately, in daylight, and looked them in the eye.",
        "{a} put the tusk-ring back on, once, on a day {b} was there.",
        "{a} told {b} what happened at the citadel and did not soften any of it.",
        "{a} said {b}'s name in Orcish, which is a shorter and rougher sound, and {b} liked it.",
        "{a} stood between {b} and a remark and did not need to do anything more than stand.",
        "{a} asked {b} to teach {a} to write, and has been practising where nobody sees.",
        "{a} brought {b} the first of something, which is what {a}'s people do instead of saying it.",
        "{a} said that if {b} wanted to go north {a} would go, and meant every part of that.",
        "{a} let {b} see the scar and told the true story rather than the good one.",
        "{a} has stopped eating apart on the evenings {b} is in the hall.",
        "{a} said {b} was clan now, in Orcish, quietly, and {b} did not know what had been said.",
        "{a} was asked by a stranger what {b} was to {a} and stood up before answering.",
        "{a} made {b} a thing out of something that had been a weapon.",
        "{a} told {b} about the cousin under the mountain, which nobody else has been told.",
        "{a} has been gentler with everything since a particular Tuesday and does not know it shows.",
        "{a} would not let {b} take the north watch alone and did not pretend it was about the roster.",
        "{a} said out loud that {a} had not expected any of this, and looked pleased and slightly winded.",
        "{a} took {b} to the top of the wall to look north and said nothing for a long while.",
      ],
      taboo: [
        "{a} has stopped being seen with {b} in the yard, and started being seen with {b} nowhere at all.",
        "{a} was asked a question about {b} and gave an answer about the wall repairs.",
        "{a} has become extremely interested in whether the household thinks well of orcs, in the abstract.",
        "{a} took the far watch three weeks running and swapped for it twice.",
        "{a} said it would only make trouble for {b}, to nobody, apparently by accident.",
        "{a} has stopped laughing at the orc jokes and has not started objecting either.",
        "{a} left the hall the moment the talk turned to who is walking out with whom.",
        "{a} keeps something small of {b}'s and keeps it where a search would not go.",
        "{a} was asked whether {a} was courting and said orcs do not court, which is not true.",
        "{a} has been unusually correct with everybody and unusually formal with one person.",
        "{a} said the household had been good to {a} and that {a} would not repay it badly.",
        "{a} has taken to using the servants' stair.",
        "{a} was seen washing at an hour nobody washes and had nothing to say about it.",
        "{a} started a fight over nothing with somebody who had said nothing about anybody.",
        "{a} has stopped mentioning {b} entirely, having previously mentioned {b} constantly.",
        "{a} said that some things are not for orcs and would not be argued out of it.",
        "{a} put the tusk-ring away again and has not been the same since.",
        "{a} asked, hypothetically, what the household would make of such a thing, and did not like the answer.",
        "{a} has been sleeping on the wall and calling it the watch.",
        "{a} said 'it is nothing' in Orcish, where nobody could understand it, and it was not nothing.",
      ],
    },
  },
  // ═══ WATERDEEP ═══ The City of Splendors, on the flanks of Mount Waterdeep — which was the
  // MELAIRKYN's mithral hold before it was anybody's mountain, and which is built on Aelinthaldaar,
  // an elven city that was here first. Both peoples walk over their own ruins daily and the humans
  // above have largely forgotten either was there. Undermountain is under all of it.
  waterdeep: {
    // WATERDHAVIAN HUMANS. The City of Splendors: a hundred and thirty thousand people, ten times
    // that in its writ, ruled by SIXTEEN MASKED LORDS whose identities are secret — you may have
    // passed one this morning. Guilds run the trades and the nobility is a list of old families
    // everybody can recite. It is the richest, safest, most administered place a human can live in
    // the North, and Waterdhavians are insufferable about it in a way they consider modesty.
    Human: {
      slice: [
        "{a} named the ward before the city, as though the city were understood.",
        "{a} said one of the Masked Lords could be anybody, in the tone of somebody who checks.",
        "{a} recited four noble houses in order of precedence without being asked to.",
        "{a} said the Watch would have somebody here inside a bell, and was right, and is used to it.",
        "{a} has an opinion about the Guild's dues that {a} shares at any provocation.",
        "{a} thought the household's arrangements charmingly provincial and did not say so out loud.",
        "{a} priced everything in the {room} within a copper and could not stop doing it.",
        "{a} said the Yawning Portal is for visitors, which is how a Waterdhavian says a thing is beneath them.",
        "{a} was mugged once, in the Dock Ward, at seventeen, and has dined out on it for years.",
        "{a} knows which ward a person is from by two sentences of their speech.",
        "{a} said everything in the world comes through this city eventually, and believes it.",
        "{a} pays the dues, the tolls and the levy and can tell you what each of them buys.",
        "{a} was scandalised by a place with no guild and could not articulate why.",
        "{a} said the North begins at the North Gate, and meant it as a joke and half meant it.",
        "{a} has never once been genuinely afraid in the street and does not know that this is unusual.",
        "{a} knows a man who knows a man and produced him inside a day.",
        "{a} said Baldur's Gate is honest about being grasping, which was not a compliment to either city.",
        "{a} finds silence unnerving and has slept badly since arriving anywhere quiet.",
        "{a} named the festival by the day it falls on rather than the name of it.",
        "{a} looked at the household's accounts uninvited and found two errors.",
      ],
      romance: [
        "{a} told {b} which ward {a} grew up in, which is telling {b} the whole of it.",
        "{a} stopped pricing things when {b} was in the room, with visible effort.",
        "{a} took {b} to the festival {a} has attended alone for eleven years.",
        "{a} said {b} spoke like somebody from a much better ward, and it was flirtation.",
        "{a} produced the man who knows a man, for {b}, over something trivial.",
        "{a} put {b}'s name to the Guild as a person who may sign in {a}'s name.",
        "{a} said everything comes through this city eventually and that {b} had taken long enough.",
        "{a} walked {b} through the Dock Ward at night and was insufferable about knowing the way.",
        "{a} recited the noble houses to {b} as a party trick and got the last two wrong on purpose.",
        "{a} paid a levy {a} could have avoided so {b} would not have to be asked about it.",
        "{a} said {a} had never been afraid in this city and had lately been afraid of one thing.",
        "{a} found no errors in the accounts at all and said so with enormous warmth.",
        "{a} told {b} about the mugging, including the part where {a} cried.",
        "{a} asked whether {b} could stand the noise, and was asking about staying.",
        "{a} said the Watch would come inside a bell and that {a} would come faster.",
        "{a} named {b} to a noble house's steward as though {b} were the one being introduced.",
        "{a} bought something at a price {a} knew was too high and did not mention noticing.",
        "{a} said the North begins at the North Gate and that {a} had stopped wanting to see it.",
        "{a} put {b} in the will, which in this city is done at a desk with two witnesses.",
        "{a} sat somewhere quiet with {b} and did not find the silence unnerving.",
      ],
      taboo: [
        "{a} has started pricing everything again, out loud, constantly.",
        "{a} was asked about {b} and gave the Guild's schedule of dues.",
        "{a} has been in the Dock Ward at hours {a} has spent a lifetime avoiding.",
        "{a} said it would be all over three wards by market day, to nobody.",
        "{a} has stopped taking {b} to anything at all.",
        "{a} was scandalised on somebody else's behalf, loudly, about something unrelated.",
        "{a} went to check a ledger when the talk turned to who was walking out with whom.",
        "{a} said the houses would never have it, and no house had been consulted.",
        "{a} has taken {b}'s name off the Guild signature.",
        "{a} was asked whether {a} was courting and quoted a levy.",
        "{a} keeps a paper somewhere no Waterdhavian keeps a paper.",
        "{a} started an argument about precedence that was not about precedence.",
        "{a} said 'it is a private arrangement' in the most administered city in the North.",
        "{a} has been unusually generous to the household and correct with one person.",
        "{a} produced the man who knows a man and would not say what for.",
        "{a} said one of the Masked Lords could be anybody, and this time it was not a joke.",
        "{a} took the will back to the desk and came away with fewer witnesses.",
        "{a} has stopped naming the ward when asked where {a} is from.",
        "{a} said 'it is nothing' and then found two errors in accounts that had none.",
        "{a} sat somewhere quiet on purpose, which {a} has never once done.",
      ],
    },
    Dwarf: {
      slice: [
        "{a} calls the mountain by the name the Melairkyn gave it and has stopped explaining why.",
        "{a} lives in Field Ward and is saving, quite openly, for a house on the cliff to dig out properly.",
        "{a} has an opinion about the Guild's dues and shares it at any provocation.",
        "{a} was asked what is under the city and said 'us, once' and went back to work.",
        "{a} knows which of the cellar walls in this ward are dwarf-work and which are human patching.",
        "{a} priced a job by the Guild rate and then did it better than the Guild rate buys.",
        "{a} will not go down past the third cellar and gives a different reason each time.",
        "{a} says 'mithral' the way other people say the name of somebody who died young.",
        "{a} has been fined twice for digging and considers the fine a licence.",
        "{a} counted the Watch going past and remarked that there used to be fewer of them.",
        "{a} was asked whether the family were city dwarves and said four generations, defensively.",
        "{a} keeps the Guild mark on the tools and a clan mark underneath it.",
        "{a} knows a way between two wards that is not on any map the Watch holds.",
        "{a} complained about the harbour smell, which everybody does, and about the water, which nobody does.",
        "{a} was in the Yawning Portal once, on business, and will not be drawn on the business.",
        "{a} has never been below the mountain and has strong views about what is down there.",
        "{a} sends coin north twice a year to a hold {a} has never seen.",
        "{a} said the city was built on better work than it knows, and meant the foundations.",
        "{a} argued that the Masked Lords should leave honest delving alone, to a room that agreed.",
        "{a} looked up at the mountain on the way in, the way {a} does every morning.",
      ],
      romance: [
        "{a} took {b} up Mountainside to see where the house would be, if there is ever a house.",
        "{a} told {b} what the Melairkyn were and how it ended, which takes an evening.",
        "{a} put {b}'s name down at the Guild as next of kin and did not mention doing it.",
        "{a} showed {b} the clan mark under the Guild mark.",
        "{a} walked {b} home the long way, which in this city means past the harbour.",
        "{a} said the saving was for a house and then said 'for us', and heard it after saying it.",
        "{a} made {b} something small in mithral, which cost more than {a} will admit.",
        "{a} took {b} to the one tavern in Field Ward where the beer is honest.",
        "{a} asked {b} whether {b} could live under a mountain, and was not joking.",
        "{a} told {b} about the cousin who went down and did not come back.",
        "{a} has stopped taking the Guild's night work since {b} started keeping evenings free.",
        "{a} showed {b} the unmapped way between the wards, which {a} shows nobody.",
        "{a} said {b} had a good eye, which from {a} is a declaration.",
        "{a} bought two tickets to something {a} has no interest in whatsoever.",
        "{a} said the hold in the north would want to meet {b} one day.",
        "{a} let {b} carry the tools, which has never happened.",
        "{a} was asked by a Guild man who {b} was and gave a full answer in a public room.",
        "{a} started keeping the good coat clean.",
        "{a} told {b} the whole of what {a} is saving for, including the part about children.",
        "{a} looked up at the mountain with {b} beside them and said nothing at all.",
      ],
      taboo: [
        "{a} has become very interested in what the Guild rules say about such things.",
        "{a} stopped drinking in Field Ward and started drinking two wards over.",
        "{a} was asked about {b} and talked about the dues for some minutes.",
        "{a} has been taking the unmapped way at hours that make no sense for work.",
        "{a} said it would cost {b} more than it would cost {a}, to nobody.",
        "{a} has stopped sending the letter north and cannot say why.",
        "{a} keeps something in the tool-roll that is not a tool and is not mithral either.",
        "{a} was seen on the cliff path at an hour when nothing is on the cliff path.",
        "{a} defended a Guild propriety {a} has broken cheerfully for a decade.",
        "{a} has become extremely correct in company and is not correct at all in private.",
        "{a} said 'the smith' and 'the one from the kitchen' where {a} used to say a name.",
        "{a} left a room {b} entered on an errand that did not exist.",
        "{a} has stopped saving, or has stopped talking about saving, and the coin is still going somewhere.",
        "{a} was asked whether {a} was courting and said dwarves do not court in cities.",
        "{a} has taken to washing before coming up from the work, which {a} never did.",
        "{a} said it was a Guild matter, which is what {a} says when it is not.",
        "{a} went quiet when somebody mentioned who had been seen with whom.",
        "{a} started a fight in a tavern over a remark nobody else had heard.",
        "{a} has an arrangement with a gate-porter that is not about goods.",
        "{a} put a second name in the Guild book and then went back and scratched it out.",
      ],
    },
    Elf: {
      slice: [
        "{a} walks a street that was a boulevard of Aelinthaldaar and does not remark on it.",
        "{a} was asked how old the city is and gave a number four thousand years larger than expected.",
        "{a} knows which of the old trees in the city were planted and which were left.",
        "{a} has watched this city rebuild the same ward three times.",
        "{a} said the harbour used to be beautiful and did not elaborate.",
        "{a} corrected the pronunciation of a Waterdhavian street-name back to what it originally was.",
        "{a} did not go west, and in this city nobody thinks to ask why.",
        "{a} finds Waterdeep exhausting and has lived here ninety years.",
        "{a} was in the crowd for a Lord's procession and looked at the mountain instead.",
        "{a} knows a stone in a wall that is older than the wall and older than the city.",
        "{a} was asked to translate something and said it was not Elvish, it was older.",
        "{a} keeps to a quarter where three other elves live and calls that a community.",
        "{a} said the humans build well and quickly and never once for a hundred years.",
        "{a} avoids one particular street entirely and has never given a reason.",
        "{a} was mistaken for a foreigner in a city {a}'s people founded.",
        "{a} pays the Guild dues and has never once been asked which guild.",
        "{a} can name what stood where the Yawning Portal stands, and does not go in.",
        "{a} was here for the Trollwars and does not correct the ballad about them.",
        "{a} said 'my city' about Waterdeep once and then looked as though it had surprised them.",
        "{a} stood at the top of the ward at dusk and watched the lights come on, as {a} does.",
      ],
      romance: [
        "{a} took {b} to the stone that predates the city and told {b} what it was.",
        "{a} said the name Aelinthaldaar aloud to {b}, which {a} does not say aloud.",
        "{a} walked {b} down the street {a} avoids, and got to the end of it.",
        "{a} showed {b} which trees were planted by {a}'s own people.",
        "{a} said {b} would like the city better from the top of the ward, and was right.",
        "{a} has begun keeping human hours, badly and on purpose.",
        "{a} told {b} what the harbour looked like before, at length, and had never told anybody.",
        "{a} wrote {b}'s name in the old hand and left it somewhere {b} would find it.",
        "{a} took {b} into the Yawning Portal, having not gone in for ninety years.",
        "{a} said 'a hundred years from now' and did not soften it for {b}'s sake.",
        "{a} has stopped calling the humans hurried, at least in front of {b}.",
        "{a} bought something Waterdhavian and ugly because {b} liked it.",
        "{a} told {b} about the ones who went west and about the letter that still comes.",
        "{a} said {b} made the city bearable and meant it as the very large thing it is.",
        "{a} has been in the crowd for the procession twice now, for company.",
        "{a} let {b} hear the song about the fallen city, and translated the bad part.",
        "{a} said 'my city' about Waterdeep and this time did not look surprised.",
        "{a} taught {b} to say a street's true name, the old one.",
        "{a} keeps something of {b}'s beside the thing that is older than the city.",
        "{a} watched the lights come on with {b} and did not say anything for a while.",
      ],
      taboo: [
        "{a} has taken to using a different street and it adds a quarter-hour.",
        "{a} was asked about {b} and answered with a point of Waterdhavian history.",
        "{a} has stopped going to the quarter where the other elves are.",
        "{a} said it was a matter of long custom, which in this city means nothing at all.",
        "{a} has begun receiving no letters, having previously received one a month.",
        "{a} was seen at the top of the ward with somebody and the light was going.",
        "{a} became academically fascinated by Waterdhavian marriage law.",
        "{a} put something away when the door went and was not quick enough.",
        "{a} has stopped saying {b}'s name and started describing {b} by trade.",
        "{a} defends a custom {a} openly ignored for eighty years.",
        "{a} takes the long way to the market and the market is the other direction.",
        "{a} said 'it is a small thing' about a thing {a} has thought about all week.",
        "{a} left a gathering when the talk turned to who is walking out with whom.",
        "{a} has been writing in the old hand and burning it in the grate.",
        "{a} was asked directly by a countryman and answered in Common, which is an answer.",
        "{a} has stopped correcting people about {b}'s name, which was a small crusade.",
        "{a} said the difference in years was the only difficulty, and there are others.",
        "{a} keeps two hours free every week and accounts for them differently each time.",
        "{a} spoke very warmly of somebody else, at length, to nobody who had asked.",
        "{a} has stopped watching the lights come on, having watched them for ninety years.",
      ],
    },
  },
  // ═══ THE SWORD COAST ═══ The ROAD, essentially: everything between Waterdeep and Baldur's Gate,
  // strung along the Coast Way and the Trade Way. Daggerford, Beregost, Phandalin, a hundred hamlets
  // that live or die by whether the caravans came through. No capital, no ruler, and a permanent
  // low-grade banditry problem that everybody has priced in. Sword Coast humans are the most
  // TRAVELLED ordinary people in Faerun and the least impressed by anywhere.
  swordcoast: {
    Human: {
      slice: [
        "{a} measures distance in days on the road and has to convert for anybody who asks in miles.",
        "{a} named six villages between here and the Gate and which of them has an inn worth the name.",
        "{a} said a season without caravans is a season without a village, and has watched it happen.",
        "{a} was on the road at nine and has not really stopped.",
        "{a} priced a hire by the stretch of road rather than the hour.",
        "{a} said the bandits are a weather problem, not a moral one.",
        "{a} has slept in a ditch and in a lord's stable and rates the stable only slightly higher.",
        "{a} knows which wayhouses water the ale and goes to them anyway for the company.",
        "{a} said Waterdeep and the Gate both think the Coast belongs to them and the Coast disagrees.",
        "{a} can tell a caravan's origin by how the loads are tied.",
        "{a} was hospitable to a stranger inside a minute and watchful for the whole of the hour.",
        "{a} named a village that no longer exists as a landmark, which everybody local understood.",
        "{a} said the Way is safe if you are not stupid and not unlucky, and one of those is fixable.",
        "{a} keeps boots that cost more than the coat, which is correct.",
        "{a} has been through Phandalin twice and has an opinion both times.",
        "{a} said nobody governs the Coast and the Coast has never asked anybody to.",
        "{a} was unimpressed by a city, any city, in a way that offended a Waterdhavian.",
        "{a} counts strangers on the road the way another counts weather.",
        "{a} said everything here is between somewhere and somewhere else, and likes it that way.",
        "{a} looked down the Way at dusk out of habit rather than expectation.",
      ],
      romance: [
        "{a} said {b} would be good on the road, which is how {a} says everything.",
        "{a} named the wayhouse where {a} would want to stop with {b}, and it is a long way off.",
        "{a} told {b} which village is gone and what happened to it.",
        "{a} said the Coast has never belonged to anybody and neither had {a} until lately.",
        "{a} gave {b} the good boots.",
        "{a} stopped counting strangers on the road when {b} was walking beside them.",
        "{a} said a season without caravans is a season without a village, and asked {b} to stay anyway.",
        "{a} told the wayhouse keepers between here and Daggerford that {b} travels under {a}'s name.",
        "{a} taught {b} to read a load by how it is tied and was delighted when {b} got it.",
        "{a} took the slow road, deliberately, for the first time in twenty years.",
        "{a} said {b} was the first thing on this Coast worth staying still for.",
        "{a} was hospitable to {b} inside a minute and never once watchful.",
        "{a} named a village {a} would settle in, out loud, which {a} has never done.",
        "{a} said the bandits are a weather problem and that {a} would go out in weather for {b}.",
        "{a} walked {b} to the next village for no reason and made the reason up badly.",
        "{a} priced nothing at all for a whole week.",
        "{a} said everything here is between somewhere and somewhere else, except this.",
        "{a} slept somewhere with a roof, by choice, twice running.",
        "{a} showed {b} the ditch {a} slept in at nine, on purpose, as a kind of confession.",
        "{a} looked down the Way at dusk with {b} and was not looking for a caravan.",
      ],
      taboo: [
        "{a} has taken the fast road every time for a month.",
        "{a} was asked about {b} and priced a stretch of road.",
        "{a} has been walking to the next village with no errand at either end.",
        "{a} said it would be known in six villages by the turn of the season, to nobody.",
        "{a} has stopped naming any village {a} would settle in.",
        "{a} went out to see to the horses when the talk turned to who was walking out with whom.",
        "{a} said nobody governs the Coast, and it did not sound like freedom.",
        "{a} took the good boots back.",
        "{a} was asked whether {a} was courting and named a caravan season.",
        "{a} has been paying for a private room at a wayhouse that has a common one.",
        "{a} started a quarrel with a wayhouse keeper who had done nothing at all.",
        "{a} said 'it is between the two of us' on a road where nothing stays between two people.",
        "{a} told the wayhouse keepers to forget the arrangement about the name.",
        "{a} has been counting strangers again, and counting them twice.",
        "{a} said it would be simpler to take a long run and be gone a season.",
        "{a} has stopped being hospitable inside a minute, which was {a}'s whole character.",
        "{a} slept in the yard rather than the house and gave a reason about the horses.",
        "{a} said 'it is nothing worth the road' about something {a} has walked a long way for.",
        "{a} has stopped saying {b}'s name to anybody on the Way.",
        "{a} looked down the Way at dusk and did not seem to want anybody to arrive.",
      ],
    },
  },
  // ═══ THE DESSARIN VALLEY ═══ Waterdeep's breadbasket and its weak flank: fertile, sparsely
  // settled, underdefended. Triboar sits where the orc invasions out of the Sword Mountains come
  // down, and has met a great many of them. An orc drawing wages HERE is from the hills the raids
  // come out of, in a valley that has been raided within living memory.
  // ═══ ICEWIND DALE ═══ Clan Battlehammer in the Dwarven Valley under Kelvin's Cairn — **a remnant
  // of a remnant.** They fled Mithral Hall when Shimmergloom took it, lived two centuries in the
  // dale, went back with Bruenor when he reclaimed it, and then perhaps two hundred CAME BACK to
  // the dale. Their leader is a Dain, not a king, because it is a small clan and everybody knows it.
  // They mine iron and sell finished work in Bryn Shander. Ten Towns is the whole world here.
  icewinddale: {
    // TEN TOWNS on three lakes, and nothing else for a thousand miles. Knucklehead trout and
    // scrimshaw are the entire economy. There is no lord, no law but what a speaker can enforce, and
    // the towns quarrel constantly and would each die for the others. A dale human is not romantic
    // about the north; they are simply the sort of person who did not leave.
    Human: {
      slice: [
        "{a} named the town rather than the region and expected that to be enough.",
        "{a} said Bryn Shander thinks a great deal of itself and Bryn Shander is not wrong.",
        "{a} scrimshawed something in an idle hour without noticing {a} was doing it.",
        "{a} priced knucklehead by the pound from memory and was within a copper.",
        "{a} was asked why anybody stays and said the same thing everybody says, which explains nothing.",
        "{a} has been through a winter that killed people and does not tell that story.",
        "{a} said the speakers argue so nobody has to fight, which is nearly true.",
        "{a} looked at a southerner's coat and did not say what {a} was thinking.",
        "{a} knows which of the ten towns will take a stranger in and which will not.",
        "{a} said the lakes freeze from the edge and the fools go out from the middle.",
        "{a} keeps more fuel than the season needs and calls it about right.",
        "{a} has never seen a tree taller than a man.",
        "{a} said the dwarves in the valley are decent and left it there, which is high praise.",
        "{a} counted daylight in a way southerners find unnerving.",
        "{a} was up before a dawn that was not going to happen for another month.",
        "{a} said there is no law up here and no need of much.",
        "{a} distrusts anybody who came north for a reason they will state.",
        "{a} put a hand on the stove going past, out of a habit older than this house.",
        "{a} said Ten Towns is nine towns arguing and one keeping the tally.",
        "{a} looked south down the road for a moment at the end of the day and then did not.",
      ],
      romance: [
        "{a} gave {b} a piece of scrimshaw and said it was nothing, and it took eleven evenings.",
        "{a} said {b} would get through a winter here, which is the whole of it.",
        "{a} took {b} out on the ice and showed {b} where it is safe and where it looks safe.",
        "{a} put {b}'s name on the fuel share.",
        "{a} told {b} about the winter that killed people.",
        "{a} said {a} had never wanted to go south and had lately stopped checking the road.",
        "{a} named {b} to the speaker, which is how a thing is made official up here.",
        "{a} walked {b} between two towns in weather nobody walks in.",
        "{a} carved {b}'s initial into something that will outlast both of them.",
        "{a} said the lakes freeze from the edge and that {a} had gone out from the middle anyway.",
        "{a} kept more fuel than two seasons need.",
        "{a} said {b} was the first thing to come north that {a} did not want to send back.",
        "{a} sat up through a dark that lasted all day and was not alone.",
        "{a} asked {b} whether {b} minded the dark, and was asking the real question.",
        "{a} said the dwarves in the valley would like {b}, which is {a} planning introductions.",
        "{a} stopped counting daylight the way {a} has counted it for thirty years.",
        "{a} told {b} which town would take them both if it came to that.",
        "{a} put a hand on the stove and then on {b}'s shoulder going past.",
        "{a} said Ten Towns is nine arguing and one keeping the tally and {a} had stopped keeping it.",
        "{a} looked south down the road with {b} and turned round first.",
      ],
      taboo: [
        "{a} has started checking the south road again.",
        "{a} was asked about {b} and quoted the price of knucklehead.",
        "{a} has been out on the ice at hours nobody fishes.",
        "{a} said it would be all round Ten Towns by thaw, to nobody.",
        "{a} took {b}'s name off the fuel share and put it back the same day.",
        "{a} has stopped scrimshawing entirely.",
        "{a} went out to see to the traps when the talk turned to who was walking out with whom.",
        "{a} said there is no law up here in a tone that was not comfort.",
        "{a} has been unusually decent to everybody and unable to speak to one person.",
        "{a} was asked whether {a} was courting and talked about the freeze.",
        "{a} keeps a carved thing in a pocket and does not take it out.",
        "{a} started an argument about which town is worst that was not about towns.",
        "{a} said 'it is nobody's business but the two of us' and then would not say which two.",
        "{a} has stopped naming {b} to the speaker or to anybody.",
        "{a} laid in fuel for one.",
        "{a} said the winter that killed people had been survivable, which is not what {a} used to say.",
        "{a} was seen walking between towns with no errand at either end.",
        "{a} put a hand on the stove going past and stood there a while.",
        "{a} said 'it is nothing' during a dark that lasts all day, which makes it worse.",
        "{a} looked south down the road and did not turn round for some time.",
      ],
    },
    Dwarf: {
      slice: [
        "{a} was asked why the clan came back north and gave an answer about the ore that convinced nobody.",
        "{a} calls Stokely 'the Dain' and corrects anybody who says king, every time.",
        "{a} took work down to Bryn Shander and came back with less coin than the work was worth.",
        "{a} has been in the dale long enough to have opinions about which of the Ten Towns is worst.",
        "{a} said the winter was mild, in a tone that dared anybody to disagree.",
        "{a} knows which of the mines are worked out and goes into them anyway.",
        "{a} was asked about Mithral Hall and said it was somebody else's hall now.",
        "{a} counts the clan by name, all of them, and it does not take long.",
        "{a} keeps a fire going that does not need to be going and nobody has ever objected.",
        "{a} names Kelvin's Cairn the way you name a neighbour you have not forgiven.",
        "{a} said black ice was a thing best left where it was found and would not be drawn further.",
        "{a} was asked whether the clan would go south again and laughed without much in it.",
        "{a} has not seen a tree that was not brought here in fourteen years.",
        "{a} mends what a southern dwarf would replace, because there is nothing to replace it with.",
        "{a} said the dale takes more than it gives and stayed anyway, as {a} always does.",
        "{a} knows how many days of fuel are in the store without going to look.",
        "{a} was in the tunnels when they were collapsed on the wizard's men and does not tell the story.",
        "{a} spoke of the two halls, east and west, as though it were a great city.",
        "{a} refuses to trade with one particular Ten Towns speaker and gives no reason.",
        "{a} stood at Cragdrop looking out over the tundra for longer than the errand needed.",
      ],
      romance: [
        "{a} took {b} down into the east hall, which the clan does not do for outsiders.",
        "{a} told {b} what happened at Mithral Hall, the shadow and all of it.",
        "{a} said {b} would last a winter here, which from {a} is an extraordinary compliment.",
        "{a} brought {b} fuel from {a}'s own store without mentioning it.",
        "{a} named {b} to the Dain, formally, which nobody had asked {a} to do.",
        "{a} made {b} something out of dale iron and apologised for the iron.",
        "{a} walked {b} up to Cragdrop to see the tundra and stood there while {b} looked.",
        "{a} said the clan was small and getting smaller, and then looked at {b}, and stopped.",
        "{a} taught {b} the trick of the fire that keeps a room through a dale night.",
        "{a} has stopped taking the long haul to Bryn Shander alone.",
        "{a} told {b} which of the worked-out mines is worth going into and why.",
        "{a} counted {b} in when counting the clan and did not notice doing it.",
        "{a} said 'when the ore runs' and then 'if we are still here' and then looked at {b}.",
        "{a} gave {b} the warmer place by the forge without a word about it.",
        "{a} told {b} the real reason the clan came back north.",
        "{a} said {b}'s name in the old way, with the hall after it instead of the clan.",
        "{a} asked {b} what {b} thought of the dale, and waited for the whole answer.",
        "{a} would not let {b} go up to the Cairn alone and did not pretend it was about the yetis.",
        "{a} put two names on a store-list where one name goes.",
        "{a} sat with {b} through the dark half of a dale evening and said very little of it.",
      ],
      taboo: [
        "{a} has become very exact about what the Dain would think, having never once wondered before.",
        "{a} was asked about {b} and gave a full account of the ore yield.",
        "{a} takes the Bryn Shander haul now and used to swap out of it.",
        "{a} has stopped counting {b} when counting the clan, deliberately, in company.",
        "{a} said the clan was too small for that sort of talk, to nobody.",
        "{a} has been going into a worked-out mine and coming back with nothing.",
        "{a} keeps something in the fuel store that is not fuel.",
        "{a} was seen at Cragdrop at an hour when nobody goes to Cragdrop.",
        "{a} defends a hall custom {a} has cheerfully ignored since arriving.",
        "{a} has stopped saying {b}'s name and started saying 'the one from the kitchen'.",
        "{a} said it was a clan matter, which is what {a} says when it is not.",
        "{a} left the hall when the talk turned to who was promised to whom.",
        "{a} has been keeping the good coat clean and giving no account of why.",
        "{a} was asked whether {a} was courting and said there is nobody here to court.",
        "{a} went quiet when the Dain came up, which has never happened.",
        "{a} started an argument about the ore that was not about the ore.",
        "{a} has taken to washing before coming up out of the mine.",
        "{a} said 'it would go hard for them' and would not say for whom.",
        "{a} put something at the bottom of the tool-chest under things nobody moves.",
        "{a} stood at the forge long after the work was done, alone, and banked it three times.",
      ],
    },
  },
  // ═══ CORMYR ═══ The Forest Kingdom, Land of the Purple Dragon: an unbroken Obarskyr line since
  // 26 DR, a standing army, and the WAR WIZARDS — who are not only battle-mages but enforcers of
  // the king's law, which is the fact that shapes daily life. Nobility is real and mostly closed;
  // the one door in is service, because a Purple Dragon commission is not hereditary. Cormyreans
  // are the Realms' great respecters of PROCEDURE, and are watched by their own government.
  cormyr: {
    Human: {
      slice: [
        "{a} asked whether the work had been entered in the book before starting it.",
        "{a} said the King's peace like a person who has never lived a day without it.",
        "{a} was asked about the War Wizards and changed the subject smoothly and completely.",
        "{a} has a cousin in the Purple Dragons and mentions the commission rather than the cousin.",
        "{a} knows which of the local families are patented nobility and which merely act it.",
        "{a} would not take a shortcut that was against the ordinance, and said so out loud.",
        "{a} keeps receipts for things nobody will ever ask about.",
        "{a} said Suzail does things properly and Arabel does things quickly, and meant both as criticism.",
        "{a} was uneasy the whole week a stranger in a good cloak was in the district.",
        "{a} named the reigning house without being asked and got the ordinal right.",
        "{a} said fifteen hundred years of one family is a record worth keeping and worth minding.",
        "{a} paid a toll that could have been avoided and did not think about avoiding it.",
        "{a} distrusts Sembians on principle and has never met one.",
        "{a} said the roads here are safe, in the tone of somebody who has heard about elsewhere.",
        "{a} put a formal address on a note going three doors away.",
        "{a} was asked to bend a rule for a friend and did not, and the friendship survived.",
        "{a} said a commission is the honest road up, which is what commoners here are told and half believe.",
        "{a} corrected somebody's use of a title, gently, and was right.",
        "{a} has never been fined and mentions this more often than the fact warrants.",
        "{a} looked twice at a man who was listening and did not look a third time.",
      ],
      romance: [
        "{a} asked {b} plainly what {b}'s family were, and it was not snobbery, it was arithmetic.",
        "{a} said a commission would make it possible, and has started saving toward one.",
        "{a} took {b} to see the Purple Dragons ride out, which {a} has watched every year alone.",
        "{a} wrote {b} a letter in the formal hand and delivered it three doors away.",
        "{a} said {b} was worth a fine, which from {a} is enormous.",
        "{a} introduced {b} to the cousin with the commission, formally.",
        "{a} broke an ordinance for {b}, once, badly, and could not stop talking about it.",
        "{a} entered {b}'s name in a book where it did not strictly need to go.",
        "{a} said the King's peace was worth having because of what {a} wanted to do inside it.",
        "{a} asked whether {b} would mind Suzail, and had clearly been thinking about Suzail.",
        "{a} stopped keeping the receipt for the thing {a} bought {b}.",
        "{a} said {b} had better manners than half the patented families and meant it as a fact.",
        "{a} told {b} what the plan was, in order, with the years marked.",
        "{a} paid a toll to take a road that went past where {b} works.",
        "{a} corrected nobody's use of a title all evening, which for {a} is romance.",
        "{a} said {a} had never been fined and would risk it.",
        "{a} asked {b}'s intentions outright, which is how it is done here.",
        "{a} named {b} in a document. That is what a Cormyrean does instead of a declaration.",
        "{a} said fifteen hundred years is a long time and one life is not.",
        "{a} stood with {b} watching the riders and did not say anything about procedure.",
      ],
      taboo: [
        "{a} has become extremely correct about ordinance, having previously been merely correct.",
        "{a} was asked about {b} and cited a regulation.",
        "{a} stopped entering things in the book and started remembering them instead.",
        "{a} said it would go on somebody's record, and would not say whose.",
        "{a} has been unusually interested in what the War Wizards do and do not notice.",
        "{a} keeps a receipt for a thing that has no receipt.",
        "{a} was seen on a road there is no procedural reason to be on.",
        "{a} left the room when the talk turned to who was marrying whom, which here is most talk.",
        "{a} said the families would never have it, and nobody had asked the families.",
        "{a} has stopped writing in the formal hand, which {a} used for everything.",
        "{a} defended a propriety {a} has grumbled about for a decade.",
        "{a} was asked whether {a} was courting and said there are procedures for that.",
        "{a} has been paying tolls to avoid a road rather than take one.",
        "{a} said it was a matter for the family, and the family knows nothing about it.",
        "{a} looked twice at a man who was listening and this time looked a third time.",
        "{a} took a fine rather than explain where {a} had been.",
        "{a} has stopped mentioning the cousin with the commission.",
        "{a} said 'it is nothing irregular' about a thing that is entirely irregular.",
        "{a} put a name in a document and then requisitioned the document back.",
        "{a} stood watching the riders alone again, which {a} had stopped doing.",
      ],
    },
  },
  // ═══ THE DALELANDS ═══ Eleven dales, each fiercely its own, held together by the DALES COMPACT —
  // land granted by the elves of Cormanthor in exchange for standing as a buffer, sworn at the
  // Standing Stone in 1 DR. Rural, fertile, hard-wintered, and permanently afraid of being absorbed
  // by Cormyr or Sembia BY KINDNESS rather than by war. A Dalesman's politics is local and their
  // memory is long.
  dalelands: {
    Human: {
      slice: [
        "{a} named the dale rather than the country when asked where {a} was from.",
        "{a} said the Compact plainly, as a thing still in force, because here it is.",
        "{a} distrusts Sembian money more than Zhent steel, and can explain why at length.",
        "{a} has an opinion about Scardale that {a} will share on very little provocation.",
        "{a} said Cormyr means well, in the tone one uses for a large neighbour who means well.",
        "{a} knows what the harvest was in each of the last nine years.",
        "{a} was raised on the story of the Standing Stone and tells it correctly.",
        "{a} keeps on good terms with the elves and does not make a performance of it.",
        "{a} said eleven dales and eleven minds, and looked pleased about the arithmetic.",
        "{a} put up food for a winter that has not been that bad in thirty years.",
        "{a} was asked who governs the dale and had to think about how to explain it.",
        "{a} would rather be poor and left alone, and has said so, and means it.",
        "{a} named Lashan of Scardale as though it were recent, and to {a}'s family it is.",
        "{a} can walk to three dales in a day and has opinions about all three.",
        "{a} said the militia turns out when it turns out, and it always turns out.",
        "{a} distrusts anybody who arrives with a proposal.",
        "{a} has never signed anything that was not read aloud first.",
        "{a} said the soil here is the whole argument, and it is.",
        "{a} was courteous to a stranger and told the neighbours about them the same evening.",
        "{a} looked at the treeline the way a Dalesman does, which is not nervously and is not never.",
      ],
      romance: [
        "{a} took {b} to the boundary stone and explained what it means, which took an hour.",
        "{a} named {b} to the dale rather than to the family, which is bigger.",
        "{a} said {b} would be a good hand at a harvest, which is the compliment here.",
        "{a} told {b} the Standing Stone story with the parts {a}'s grandmother added.",
        "{a} put {b}'s name to a share of the winter stores.",
        "{a} walked {b} to the next dale and back for no reason at all.",
        "{a} said the militia would turn out for {b} now, and that is not a small sentence.",
        "{a} asked {b} whether {b} could stand the winters, and was asking about staying.",
        "{a} introduced {b} to an elf {a} has known for thirty years.",
        "{a} said {a} would rather be poor and left alone with {b} than rich anywhere else.",
        "{a} told the neighbours about {b} in a way that made clear how it was to be taken.",
        "{a} read something aloud to {b} before signing it, which is how {a} was raised.",
        "{a} put up food for two and did not mention it.",
        "{a} said Cormyr and Sembia can both keep out of it, apropos of nothing.",
        "{a} showed {b} the field {a}'s family has held since before the dale had a name.",
        "{a} said eleven dales and eleven minds and one of them was made up about {b}.",
        "{a} asked {b} to the harvest dance and made a considerable fuss of not making a fuss.",
        "{a} named {b} in front of the whole militia and did not qualify it.",
        "{a} said the soil here was the whole argument and that {b} was the rest of it.",
        "{a} stood with {b} looking at the treeline and was not looking at the treeline.",
      ],
      taboo: [
        "{a} has stopped telling the neighbours anything, which for {a} is a whole silence.",
        "{a} was asked about {b} and gave a report on the harvest.",
        "{a} has been walking to the next dale rather more than the errands require.",
        "{a} said it would be all round three dales by market day, to nobody.",
        "{a} put up food for two and gave no account of the second share.",
        "{a} has stopped going to the dance.",
        "{a} was seen at the boundary stone at an hour with no boundary business.",
        "{a} said the Compact had views on such things, which it does not.",
        "{a} has been unusually courteous to strangers and unable to look at one neighbour.",
        "{a} went out to check a fence when the talk turned to who was promised to whom.",
        "{a} signed something without having it read aloud.",
        "{a} was asked whether {a} was courting and talked about the militia rota.",
        "{a} has stopped naming the dale when asked where {a} is from.",
        "{a} said it would go hard for {b} here, and would not be drawn further.",
        "{a} started a quarrel about Scardale that was not about Scardale.",
        "{a} took the long way past a field {a} has no business in.",
        "{a} said 'it is nobody's affair', which in a dale is a declaration of war.",
        "{a} has stopped mentioning the winter at all.",
        "{a} wrote a letter to a cousin two dales over and burned it.",
        "{a} looked at the treeline for a long time and it was not about the treeline.",
      ],
    },
  },
  // ═══ THE WESTERN HEARTLANDS ═══ **Not a country.** City-states, free towns, caravan roads and a
  // great deal of nobody's-land between them, held together by trade and adventurers and nothing
  // else. The people here are the most self-reliant humans in Faerun and the least sentimental about
  // flags: whoever keeps the road open this season gets the loyalty this season.
  heartlands: {
    Human: {
      slice: [
        "{a} was asked which country this is and gave a short laugh rather than an answer.",
        "{a} judges a place by whether its road is patrolled and by nothing else.",
        "{a} has lived under four different arrangements of authority and outlasted all of them.",
        "{a} said adventurers keep this country running, and did not mean it kindly or unkindly.",
        "{a} knows the caravan seasons better than the calendar.",
        "{a} was polite to a Zhent factor and counted the spoons after.",
        "{a} said the nearest law is nine days off and the nearest help is whoever is standing there.",
        "{a} keeps a weapon by the door as furniture rather than as a statement.",
        "{a} named six free towns and which of them is worth stopping in.",
        "{a} does not care who somebody's family is and finds people who do care exhausting.",
        "{a} said a coin spends the same whoever minted it.",
        "{a} has been robbed twice and mentions it the way another mentions weather.",
        "{a} put no faith at all in a treaty and considerable faith in a well-armed neighbour.",
        "{a} said the Heartlands is what is left over when the kingdoms have finished, and likes it.",
        "{a} was hospitable to a stranger without once asking where they were from.",
        "{a} can price a caravan guard by looking at them.",
        "{a} said Waterdeep is a long way off and gets its own way anyway.",
        "{a} does the work of two because there is nobody to be the second.",
        "{a} distrusts a man in livery on principle.",
        "{a} looked down the road at dusk out of a habit the road put there.",
      ],
      romance: [
        "{a} said {b} could hold a road, which is the highest thing {a} says about a person.",
        "{a} asked {b} to come the next season's run and made it sound like a job.",
        "{a} gave {b} the weapon from beside the door.",
        "{a} said {a} does not care whose family {b} is and was making a point of saying it.",
        "{a} named {b} to a caravan master as the person to send word to.",
        "{a} stopped taking the long runs.",
        "{a} told {b} about both robberies, including the part {a} leaves out.",
        "{a} said a coin spends the same and so, apparently, does a person, and made a mess of it.",
        "{a} walked {b} out to the road at dusk to look at nothing in particular.",
        "{a} said {b} was the reason {a} had stopped counting the seasons.",
        "{a} put {b}'s name where next-of-kin goes on a caravan roll.",
        "{a} was hospitable to {b}'s people without asking a single question.",
        "{a} said there is no law out here and {a} would keep a promise anyway.",
        "{a} taught {b} to price a guard by looking at them, and laughed at {b}'s first attempt.",
        "{a} said the nearest help is whoever is standing there, and had been standing there a while.",
        "{a} turned down a season's work and gave no reason anybody believed.",
        "{a} bought a second chair, which in {a}'s house is a considerable statement.",
        "{a} said Waterdeep was a long way off and this was not.",
        "{a} did the work of two so {b} would not have to do the work of one.",
        "{a} looked down the road at dusk with {b} and did not check it once.",
      ],
      taboo: [
        "{a} has taken the long runs again, back to back.",
        "{a} was asked about {b} and priced a caravan guard instead.",
        "{a} has stopped keeping the weapon by the door where it lives.",
        "{a} said it would put {b} on a list somewhere, and out here lists are informal and real.",
        "{a} has been unusually hospitable to everybody and short with one person.",
        "{a} left the room when the talk turned to who was walking out with whom.",
        "{a} was seen on the road at an hour when the road is not travelled.",
        "{a} said there is no law out here in a tone that was not liberating.",
        "{a} took the second chair back out.",
        "{a} has stopped naming {b} to anybody as anything.",
        "{a} was asked whether {a} was courting and named a caravan season instead.",
        "{a} started a quarrel with a stranger who had asked a normal question.",
        "{a} said 'nobody's business but ours' and then corrected it to 'mine'.",
        "{a} put a different name where next-of-kin goes.",
        "{a} has been counting the seasons again.",
        "{a} said it would be simpler if {a} took a long run and did not come back for a while.",
        "{a} distrusted a man in livery who had done nothing but ask directions.",
        "{a} keeps something in the pack that has no business on a road.",
        "{a} said 'it is nothing worth the trouble' about a thing {a} has taken a great deal of trouble over.",
        "{a} looked down the road at dusk and did not seem to be looking for anybody.",
      ],
    },
  },
  // ═══ CHULT ═══ Sourced 5e-first per §9. *Tomb of Annihilation* gives the whole of this and it is
  // better material than its reputation: a people who were driven out of the jungle by undead, gave
  // up their DYNASTIES to unite behind Port Nyanzaru's walls, and then took the port back from the
  // Amnian colonial powers themselves. Ubtao abandoned them a century ago — furious at their endless
  // warring and their leaning on him — and the tribes stopped the war afterwards, which is a bitter
  // way to have learned it. They took the foreign gods and threw out the foreign clergy; the temples
  // stand and the priests are Chultan now. Dinosaurs are still Ubtao's sacred children to many, and
  // saying so inside the walls marks you as jungle-born.
  //
  // ⚠ SOURCING, HONESTLY: **every line below is 5e.** An earlier version of this comment said 2e's
  // *Jungles of Chult* filled the gaps, which implied a sourcing I had not actually done — Mezro
  // appears here by NAME only, and the name is in 5e. Citing a source you did not use is the same
  // defect as a house rule dressed as canon, pointing the other way.
  //
  // Where 2e WOULD legitimately apply and has not been drawn on yet: the barae (Mezro's seven sworn
  // protectors), what Ubtao's worship consisted of, and the Mezro city material. 5e names the barae
  // and says almost nothing about them. That is a real gap and it is open.
  //
  // The voice: proud, mercantile, recently liberated, and carrying a religious wound nobody outside
  // is qualified to touch.
  chult: {
    Human: {
      slice: [
        "{a} named the ward of Port Nyanzaru rather than the country, and then the country, in that order.",
        "{a} said the merchant princes took the port back themselves, and said it looking at the listener.",
        "{a} was asked about Ubtao and gave an answer with a century of anger folded into it.",
        "{a} keeps a shrine to Waukeen and does not consider that a contradiction.",
        "{a} said the dinosaurs are sacred and then said {a} had been raised outside the walls.",
        "{a} wore nothing heavier than the climate required and thought the household's coats absurd.",
        "{a} speaks Common well, with the accent, and has stopped apologising for the accent.",
        "{a} priced ivory, spice and unrefined ore from memory and was right on all three.",
        "{a} said the family gave up a dynasty to get behind those walls, plainly, as history.",
        "{a} has no patience at all for a foreigner who arrives to explain Chult to Chultans.",
        "{a} named Mezro and let the name sit there, because there is nothing to add.",
        "{a} said the jungle is not empty, it is occupied, and the occupiers are dead.",
        "{a} counts a debt in gemstones and finds coin a clumsy way to do it.",
        "{a} was polite to a missionary and got politer the longer the missionary talked.",
        "{a} said the walls of Port Nyanzaru were built by people who meant to stay.",
        "{a} knows which of the household would last a day past the treeline and is not unkind about it.",
        "{a} said Amn still needs the port more than the port needs Amn, and enjoyed saying it.",
        "{a} sweats less than everybody and says nothing when the northerners complain.",
        "{a} spoke {a}'s own tongue with another Chultan and switched back without being asked.",
        "{a} looked south toward where the jungle would be, from a country that has no jungle.",
      ],
      romance: [
        "{a} told {b} what the family were before the walls, and what the name used to mean.",
        "{a} said {b}'s name in Chultan and then, unusually, explained what it turns into.",
        "{a} took {b} to the shrine and did not explain which god or why.",
        "{a} said the dinosaurs are sacred, to {b}, inside the walls, where {a} does not say it.",
        "{a} gave {b} a gemstone rather than coin, which is how {a} was raised to mean it.",
        "{a} was asked by another Chultan who {b} was and answered in Chultan, at length, warmly.",
        "{a} taught {b} three words and laughed for a full minute at the third attempt.",
        "{a} said {b} had never once asked {a} to explain Chult to them.",
        "{a} told {b} about Ubtao and did not fold the anger away this time.",
        "{a} said {b} would last past the treeline, which is the highest thing {a} says.",
        "{a} priced nothing for a whole evening.",
        "{a} named {b} to the merchant house as somebody whose word carries {a}'s.",
        "{a} said Mezro, and then said what {a}'s grandmother said about Mezro.",
        "{a} stopped apologising for anything at all around {b}, having never apologised much.",
        "{a} made {b} eat something properly spiced and watched with enormous satisfaction.",
        "{a} said the family gave up a dynasty for a wall and would give up more for less.",
        "{a} sat through a northern winter for {b} and complained about it beautifully and constantly.",
        "{a} said {b} was the only foreigner {a} had ever wanted to explain anything to.",
        "{a} put {b}'s name in the ledger where partners go, in Chultan.",
        "{a} looked south with {b} toward a jungle that is not there.",
      ],
      taboo: [
        "{a} has stopped saying {b}'s name in Chultan.",
        "{a} was asked about {b} and priced ivory.",
        "{a} has been at the shrine at hours the shrine is not attended.",
        "{a} said it would follow {b} into the merchant houses, and it would.",
        "{a} has been unfailingly polite to {b} in company, which from {a} is a door closing.",
        "{a} stopped speaking Chultan in front of anybody at all.",
        "{a} went to see to a shipment when the talk turned to who was walking out with whom.",
        "{a} said the family had given up enough already.",
        "{a} was seen on a road with nothing at the end of it.",
        "{a} was asked whether {a} was courting and answered about the spice contract.",
        "{a} has taken {b}'s name out of the ledger.",
        "{a} started a quarrel with a northerner over nothing that was about nothing.",
        "{a} said 'it is a Chultan matter', which it is not, and which ends the conversation.",
        "{a} keeps a gemstone loose in a pocket and has not given it to anybody.",
        "{a} has stopped telling anybody what the family were before the walls.",
        "{a} said Ubtao left because of what people wanted from him, and was not talking about Ubtao.",
        "{a} was polite to a missionary for an entire afternoon, which is how {a} avoids a room.",
        "{a} said 'it is nothing' in Chultan, where nobody could check.",
        "{a} laughed at something and stopped when {b} came in.",
        "{a} looked south toward a jungle that is not there for rather a long time.",
      ],
    },
  },
  // ═══ NEVERWINTER ═══ The City of Skilled Hands, rebuilding, with no guilds to restrict anybody —
  // and beneath the Crags to its east, GAUNTLGRYM: the capital of Delzoun, built -335 DR, lost to
  // orcs in -111, held in turn by illithids, drow and duergar for thirteen centuries, and RECLAIMED
  // in 1486 by Bruenor Battlehammer. A dwarf here is not mourning a ruin. A dwarf here is living in
  // the one that was taken back, which is a completely different person.
  neverwinter: {
    // NEVERWINTER HUMANS. The City of Skilled Hands, and it is still being REBUILT — Mount Hotenow
    // took it apart within living memory. Lord Protector Neverember pays for the reconstruction out
    // of Waterdhavian money and everybody knows it. **There are no guilds**, which means anybody with
    // a trade can simply start, and the city is full of people on their second life. Craft is the
    // civic religion: the glass lamps, the water clocks, the gardens.
    Human: {
      slice: [
        "{a} said the city is being rebuilt, present tense, because it is.",
        "{a} was born somewhere else and does not consider that unusual here, because it is not.",
        "{a} started a trade with no guild's permission and still finds that remarkable.",
        "{a} made the {room}'s lamp better than it needed to be and would not be thanked for it.",
        "{a} has an opinion about Neverember that is exactly as complicated as the money involved.",
        "{a} said the gardens came back before the walls did, and was proud of that ordering.",
        "{a} knows somebody who did not get out when the mountain went.",
        "{a} said Waterdeep pays for this and Waterdeep will want something, eventually.",
        "{a} keeps a water clock and checks it against the bells with satisfaction.",
        "{a} was asked what {a} did before and gave a completely different trade.",
        "{a} said this city takes anybody who will work, which is the whole of the civic creed.",
        "{a} finds Waterdhavians exhausting and Baldurians restful, which surprises people.",
        "{a} priced a job by what the work was worth rather than what the guild would allow.",
        "{a} named three streets that are not there any more and gave directions using them.",
        "{a} said the Crags are close and the road east is not safe and both are simply facts.",
        "{a} looked at a piece of coloured glass longer than the piece warranted.",
        "{a} has rebuilt one room of a house three times and will do it a fourth.",
        "{a} said skilled hands, and meant it as an identity rather than a slogan.",
        "{a} was unbothered by an accent nobody else in the household could place.",
        "{a} looked east toward the Crags at the end of the day, which everybody here does.",
      ],
      romance: [
        "{a} made {b} something out of coloured glass and lied about how long it took.",
        "{a} told {b} what {a} did before, the real one.",
        "{a} said {b} had skilled hands, which here is the whole compliment.",
        "{a} took {b} to see the gardens, which {a} has not been to since they came back.",
        "{a} named {b} on the workshop's lease, there being no guild to object.",
        "{a} told {b} which street {a}'s family were on when the mountain went.",
        "{a} said this city takes anybody who will work and that it had taken {a} in twice.",
        "{a} gave directions to {b} using streets that are not there any more, and {b} found it.",
        "{a} set the water clock by {b}'s hours rather than the bells.",
        "{a} said Neverember will want something eventually and that {a} had stopped caring.",
        "{a} rebuilt a room for {b} and made it better than the three before it.",
        "{a} said {b} was the reason {a} had stopped counting this as a second life.",
        "{a} walked {b} east toward the Crags and turned back at the safe point, laughing.",
        "{a} priced a job at what it was worth and then did it for nothing.",
        "{a} put a maker's mark on something for {b} and it was a new mark.",
        "{a} said the gardens came back before the walls and that this was the correct order.",
        "{a} asked whether {b} minded a city that is not finished.",
        "{a} named {b} to somebody as a partner and did not specify in what.",
        "{a} said skilled hands and took {b}'s.",
        "{a} looked east toward the Crags with {b} and did not look long.",
      ],
      taboo: [
        "{a} has stopped making anything that is not strictly necessary.",
        "{a} was asked about {b} and described a water clock's mechanism.",
        "{a} has been on the east road at hours the east road is not travelled.",
        "{a} said it would follow {b} into every workshop in the city, and there is no guild to appeal to.",
        "{a} has taken {b}'s name off the lease.",
        "{a} went to see about a delivery when the talk turned to who was walking out with whom.",
        "{a} said this city takes anybody, in a tone that suggested a limit.",
        "{a} has stopped setting the clock by anything but the bells.",
        "{a} was asked whether {a} was courting and talked about glass.",
        "{a} keeps a piece of work unfinished and will not say who it is for.",
        "{a} started an argument about Neverember that was not about Neverember.",
        "{a} said 'it is a private commission' and there is no such thing here.",
        "{a} has been unusually decent to everybody and short with one person.",
        "{a} gave directions using streets that are not there, to somebody who did not need them.",
        "{a} rebuilt a room nobody had asked to have rebuilt.",
        "{a} said 'this is my second life' in a tone that was not gratitude.",
        "{a} took the maker's mark off something.",
        "{a} has stopped saying skilled hands entirely.",
        "{a} said 'it is nothing' and went back to a piece of glass for three hours.",
        "{a} looked east toward the Crags for a very long time.",
      ],
    },
    Dwarf: {
      slice: [
        "{a} was at Gauntlgrym for the reclaiming and mentions it about as often as breathing.",
        "{a} says 'the city' and means one three hundred miles down, not the one up the road.",
        "{a} has a lineage entry in the Iron Tabernacle and knows the shelf it is on.",
        "{a} was asked whether the doors really only open for Delzoun and said try one.",
        "{a} finds Neverwinter's lack of guilds indecent and profitable in equal measure.",
        "{a} named the years the city was held by orcs, then illithids, then drow, in order, without pausing.",
        "{a} came up from the deep city for a season's work and has been here four years.",
        "{a} said thirteen hundred years is a long time to hold a grudge and a short time to lose one.",
        "{a} priced work at Neverwinter rates and felt slightly guilty about it.",
        "{a} calls Bruenor 'the king' without qualification and gets funny looks from southerners.",
        "{a} has walked halls a dragon could turn round in and finds this keep a bit close.",
        "{a} keeps a piece of Gauntlgrym stone and will show anybody who asks twice.",
        "{a} was asked what the Great Forge is like and could not manage an answer.",
        "{a} distrusts the Crags road and takes it anyway.",
        "{a} said Neverwinter builds fast and Delzoun built once.",
        "{a} counted the mine-cart runs at the Iron Tabernacle from memory for a doubter.",
        "{a} has family still down there and speaks of them in the present tense with confidence.",
        "{a} said the drow were in the lower tunnels for a long time and the smell took years.",
        "{a} was in the Neverwinter Guard for a season and did not care for it.",
        "{a} looked east toward the Crags at the end of the day, which {a} does most days.",
      ],
      romance: [
        "{a} told {b} about the reclaiming and left nothing out, including the parts that went badly.",
        "{a} said {b} would be let through the Delzoun doors, and cannot possibly know that.",
        "{a} took {b}'s name down to be entered in the Tabernacle, which is not a small errand.",
        "{a} gave {b} the piece of Gauntlgrym stone.",
        "{a} described the Great Forge to {b} and got through it this time.",
        "{a} said {b} should see the halls, and started planning the road down that evening.",
        "{a} named {b} to the family still below, in a letter carried by hand.",
        "{a} made {b} something in the old Delzoun pattern, which takes twice as long.",
        "{a} said thirteen hundred years and then said some things are worth waiting for, badly.",
        "{a} has stopped taking the Crags road alone.",
        "{a} told {b} which of the family did not come back up.",
        "{a} said {b} had the sense to be born in the right century, which was meant as flirtation.",
        "{a} let {b} hold the good hammer, which is a Delzoun piece and older than the city above.",
        "{a} asked whether {b} could live under a mountain and had clearly rehearsed the question.",
        "{a} put two names on the lineage petition and filed it anyway.",
        "{a} said 'when we go down' about a journey nobody had proposed.",
        "{a} taught {b} the word the doors answer to, which nobody is supposed to teach.",
        "{a} sat with {b} through a Neverwinter evening and did not once mention the deep city.",
        "{a} said the reclaiming was the second best thing that ever happened to {a}.",
        "{a} looked east toward the Crags with {b} beside them and did not look long.",
      ],
      taboo: [
        "{a} has become very exact about Delzoun custom, having never once invoked it before.",
        "{a} was asked about {b} and gave a history of the Iron Tabernacle.",
        "{a} has stopped writing down to the family, and wrote every month.",
        "{a} says 'the one from the kitchen' where {a} used to say a name.",
        "{a} has been taking the Crags road at hours when nobody takes the Crags road.",
        "{a} said the lineage rolls were particular about such things, which is true and is a dodge.",
        "{a} put the Gauntlgrym stone away and has not taken it out since.",
        "{a} found reason to be at the east door whenever the hall talk turned personal.",
        "{a} defends a Delzoun propriety {a} has cheerfully ignored for a decade.",
        "{a} was asked whether {a} was courting and said Delzoun marry Delzoun, which is not even true.",
        "{a} has been keeping the good coat clean and offering no account of it.",
        "{a} started an argument about the Crags road that was not about the road.",
        "{a} said 'it would go hard for them below' and would not say for whom.",
        "{a} went quiet when the king came up, which has never happened.",
        "{a} has been coming up from the work by a route that passes one particular door.",
        "{a} keeps something in the tool-chest that no dwarf carries.",
        "{a} was seen on the east road at an hour when the east road is empty.",
        "{a} said it was a lineage matter, which is what {a} says when it is not.",
        "{a} tore up a petition without filing it and burned the pieces.",
        "{a} looked east for a long while and did not say what for.",
      ],
    },
  },
  // ═══ THE UNDERDARK ═══ Nobody down here is at liberty by default. Drow and duergar keep slaves in
  // the lower tunnels, and an orc in the Underdark is far likelier to have been TAKEN than to have
  // come. So an orc drawing wages at a surface keep, out of the Underdark, has almost certainly run
  // — which the demographics already encode: the Underdark's pool is free and enslaved together, and
  // an arrival from it implies an escape.
  underdark: {
    // UNDERDARK HUMANS. Vanishingly few — five percent — and almost none of them free by origin.
    // The demographic table draws from the whole pool, free and enslaved together, so a human
    // ARRIVING from the Underdark to a surface keep has almost certainly run. Some were taken.
    // Some were born down there to people who were taken. The voice is not trauma-as-personality;
    // it is a person who has learned an entirely different set of things and is now among people
    // who have not.
    Human: {
      slice: [
        "{a} came up and has never said from where, which everybody stopped asking about.",
        "{a} does not waste light and does not explain the habit.",
        "{a} was asked how long and gave a number of years that landed badly in the room.",
        "{a} was born down there and has been on the surface eleven years and still says 'up here'.",
        "{a} finds weather astonishing and has stopped saying so out loud.",
        "{a} eats what is put down and never comments and never leaves anything.",
        "{a} knows the difference between drow and duergar in a way nobody wants explained.",
        "{a} said the quiet down there is not like quiet up here, and did not elaborate.",
        "{a} counts the ways out of a room and stopped hiding that {a} does it.",
        "{a} has no surname and gave one when asked because it was easier.",
        "{a} was startled by birdsong in the second year and not since.",
        "{a} said there is no night down there and no day either, only shifts.",
        "{a} does the worst job without being asked and does not present it as virtue.",
        "{a} has never once complained about the cold.",
        "{a} said {a} had learned Common from people who did not want {a} to have it.",
        "{a} keeps a light burning that the household does not need and pays for it out of wages.",
        "{a} was asked about family and said there had not been that arrangement.",
        "{a} said the surface people worry about the wrong things, without contempt, as an observation.",
        "{a} is never surprised by cruelty and is still surprised by kindness.",
        "{a} stood in the open at noon and stayed there, which {a} does perhaps once a month.",
      ],
      romance: [
        "{a} told {b} where {a} came up from.",
        "{a} said {b} was the first person to ask and then wait for the answer.",
        "{a} let {b} close a door with {a} in the room, which took a year.",
        "{a} gave {b} the thing {a} came up with, which is small and was everything {a} had.",
        "{a} said {a} had no surname and asked what {b} thought of one.",
        "{a} told {b} what the quiet is like down there.",
        "{a} sat with {b} with the door at {a}'s back, once, on purpose, and got through it.",
        "{a} was startled by birdsong and laughed about it, in front of {b}, for the first time.",
        "{a} said family had not been an arrangement available, and that {a} had been thinking about it.",
        "{a} let the light go out one night, on purpose, with {b} there.",
        "{a} told {b} about the one who did not come up.",
        "{a} said the surface people worry about the wrong things and that {b} did not.",
        "{a} is still surprised by kindness and has stopped hiding the surprise from {b}.",
        "{a} asked {b} to explain weather, seriously, and listened to the whole thing.",
        "{a} said {a} had learned Common from people who did not want {a} to have it, and Elvish from {b}.",
        "{a} stood in the open at noon with {b} and stayed longer than usual.",
        "{a} took the worst job so {b} would not, and was caught at it.",
        "{a} said 'up here' and then, deliberately, said 'here'.",
        "{a} slept through a night, which had not happened in eleven years.",
        "{a} said {a} had not expected anything from the surface and had been wrong.",
      ],
      taboo: [
        "{a} has gone back to sitting where the door is in view.",
        "{a} was asked about {b} and described a ceiling height.",
        "{a} has stopped letting anybody close a door with {a} in the room.",
        "{a} said it would make {b} a thing somebody could use, and meant it precisely.",
        "{a} has gone back to saying 'up here'.",
        "{a} went to see to the lamps when the talk turned to who was walking out with whom.",
        "{a} said there had not been that arrangement, flatly, in a way that closed the subject.",
        "{a} was found on the stair down to the cellar, sitting, at three in the morning.",
        "{a} was asked whether {a} was courting and said that is a surface word.",
        "{a} has been letting the light go out and not on purpose.",
        "{a} keeps the thing {a} came up with somewhere no search would reach.",
        "{a} said the surface people worry about the wrong things, and this time with contempt.",
        "{a} started a quarrel with somebody who had been kind.",
        "{a} has stopped being surprised by kindness, which is the worst sign there is.",
        "{a} answered a question with a number of years again, and it was not the same number.",
        "{a} took the worst job every day for a fortnight and would not be relieved.",
        "{a} has stopped sleeping through the night again.",
        "{a} was asked about the years and this time did not give a number.",
        "{a} stood in the open at noon for a very long time.",
        "{a} said {a} had not expected anything, in the past tense, and meant it as a correction.",
      ],
    },
    Orc: {
      slice: [
        "{a} came up out of the dark and has never once said how.",
        "{a} eats fast, still, and is aware of doing it, and has stopped apologising.",
        "{a} was asked how long {a} was down there and named a number of years without hesitating.",
        "{a} does not like being behind a closed door and works round it without comment.",
        "{a} said the sun was the difficult part, which nobody expected.",
        "{a} knows the drow word for what {a} was and will not say it aloud.",
        "{a} keeps a light burning that the household does not need.",
        "{a} was asked about the Underdark and described the ceiling heights, precisely, and stopped.",
        "{a} has never once complained about the work here and has been asked to.",
        "{a} counted the ways out of the {room} on the first day and has not needed to since.",
        "{a} said the duergar were worse than the drow, and did not elaborate, and meant it.",
        "{a} flinched at a bell once, in the first month, and never again.",
        "{a} has no kin to write to and has never pretended otherwise.",
        "{a} was told wages were fortnightly and asked what wages were.",
        "{a} sleeps badly and takes the night watch, which suits everybody.",
        "{a} does not go near the cellar and has never given a reason.",
        "{a} said the household had been decent, which from {a} is an entire speech.",
        "{a} learned Common in the dark from people who did not want {a} to have it.",
        "{a} is the only one here who is never surprised by bad news.",
        "{a} stood in the open yard at noon for no reason anybody could see.",
      ],
      romance: [
        "{a} told {b} how {a} got out, which nobody else here has been told.",
        "{a} said {b} was the first person to ask {a} a question and wait for the answer.",
        "{a} asked {b} whether it would put {b} in any danger, and was asking a real question.",
        "{a} let {b} close a door with {a} in the room.",
        "{a} said the drow word aloud, once, to {b}, and translated it.",
        "{a} gave {b} the thing {a} came up with, which is small and is everything {a} owned.",
        "{a} has started sleeping through the night, which is new and is not nothing.",
        "{a} said {b}'s name in Orcish, which {a} had not used aloud in eleven years.",
        "{a} told {b} the number of years again and this time said what happened in them.",
        "{a} has stopped counting the ways out of a room {b} is in.",
        "{a} asked {b} what a wedding is, having genuinely never seen one.",
        "{a} let {b} take the night watch instead, which {a} has never let anybody do.",
        "{a} said {a} had never expected anything and had stopped expecting it early.",
        "{a} made {b} a light that burns longer than the household's, and gave no reason.",
        "{a} went near the cellar because {b} was in it.",
        "{a} said {b} was clan, in Orcish, and had to explain what the word carries.",
        "{a} told {b} about the one who did not get out.",
        "{a} laughed properly, out loud, and the household turned round to look.",
        "{a} said the sun was still difficult and that {a} had stopped minding.",
        "{a} stood in the yard at noon with {b} and stayed longer than usual.",
      ],
      taboo: [
        "{a} has stopped letting {b} close a door with {a} in the room, which had taken months.",
        "{a} was asked about {b} and described the ceiling heights of somewhere else.",
        "{a} has been counting the ways out again.",
        "{a} said it would make {b} a mark for somebody, to nobody, and did not know it was aloud.",
        "{a} has taken the night watch every night for three weeks.",
        "{a} keeps something small where a search would not reach.",
        "{a} said such things are not for people who came up out of the dark.",
        "{a} has been very correct with the household and unable to look at one person.",
        "{a} started a quarrel with somebody who had said nothing about anybody.",
        "{a} left the yard when the talk turned to who was walking out with whom.",
        "{a} has been letting the light go out, which {a} has never done.",
        "{a} said the household had been decent and that {a} would not bring trouble to it.",
        "{a} has stopped saying {b}'s name at all.",
        "{a} was seen at the cellar door and did not go in and did not leave.",
        "{a} asked what such a thing would cost a person and did not like the answer.",
        "{a} said 'it is nothing' and it was the first lie anybody had heard {a} tell.",
        "{a} has been sleeping worse and has an explanation that is not the reason.",
        "{a} put the thing {a} came up with somewhere new.",
        "{a} stood in the open yard at noon for a very long time.",
        "{a} said the drow word aloud, alone, and did not know anybody heard it.",
      ],
    },
  },
  // ═══ THE FEYWILD ═══ Where time does not run straight and feeling does not run quiet. An elf here
  // is not a Faerûnian elf abroad — an elf here is somewhere their people came FROM, among things
  // that remember it better than they do. Emotion is heightened and bargains are binding, and both
  // of those show in how somebody works.
  feywild: {
    // FEYWILD HUMANS. Eleven percent, and every one of them is there for a REASON — a bargain, a
    // wrong turning, a debt, a childhood door that opened. Nobody is casually from the Feywild.
    // Time does not run straight here, so a human may have been away a season and find sixty years
    // gone at home, or the reverse. They are the people who cannot go back to what they left, and
    // have made an accommodation with that.
    Human: {
      slice: [
        "{a} was asked how long {a} had been here and gave two different answers, both true.",
        "{a} came through a door that is not there any more and does not look for it.",
        "{a} will not say a name aloud, {a}'s own included, to anybody {a} does not trust.",
        "{a} said the bargain was fair and has never once said what the bargain was.",
        "{a} does not eat anything {a} has not seen somebody else eat first.",
        "{a} said everybody at home would be dead by now and then said 'or not yet born'.",
        "{a} thanks nobody carelessly and has taught the household to stop thanking {a}.",
        "{a} keeps a thing from the other side in a pocket and touches it going past doors.",
        "{a} said the season changed and everybody else had to be told what a season was here.",
        "{a} counts days on a tally that matches nothing anybody else keeps.",
        "{a} was furious about nothing for an afternoon and fine by supper, like everybody here.",
        "{a} said {a} had been a different age for a while and would not elaborate.",
        "{a} refuses a gift and gives one back the same hour, having learned that the hard way.",
        "{a} knows which paths out of the yard are honest paths.",
        "{a} said the light here does something to people and then changed the subject.",
        "{a} has been homesick for a place that has moved on without {a} and knows it.",
        "{a} never asks anybody a direct question and flinches slightly when asked one.",
        "{a} said this place is kinder than it looks and crueller than it says.",
        "{a} laughed too long at something small, which happens to everybody here eventually.",
        "{a} stood still in the {room} listening to something, which {a} does and does not explain.",
      ],
      romance: [
        "{a} said {b}'s name aloud, which {a} does not do with names {a} minds losing.",
        "{a} told {b} what the bargain was.",
        "{a} gave {b} a name to use, which here costs something.",
        "{a} made {b} a promise with the terms stated aloud, because {a} has learned that is how it is done.",
        "{a} told {b} which paths out of the yard are honest.",
        "{a} said everybody at home would be dead by now and that {a} had stopped counting.",
        "{a} ate something {b} handed {a} without watching anybody else eat first.",
        "{a} said the season changed and looked at {b} while saying it.",
        "{a} thanked {b} carelessly, once, and did not take it back.",
        "{a} showed {b} the thing from the other side and said what it had been.",
        "{a} asked {b} a direct question, which {a} has not done in years.",
        "{a} said {a} had been a different age for a while and told {b} which age.",
        "{a} said this place is kinder than it looks and had lately found that true.",
        "{a} counted {b} on the tally that matches nothing anybody else keeps.",
        "{a} took {b} to the place where the door used to be.",
        "{a} said {a} could not go back, and then said {a} did not want to any more.",
        "{a} refused a gift from {b} and then, having thought, took it and gave three.",
        "{a} laughed too long at something of {b}'s and did not mind having done it.",
        "{a} said 'as long as it lasts' and then, deliberately, said something else instead.",
        "{a} stood still with {b} listening to the thing {a} does not explain.",
      ],
      taboo: [
        "{a} has stopped saying {b}'s name aloud.",
        "{a} was asked about {b} and answered a different question with great courtesy.",
        "{a} has been on the paths that are not honest paths.",
        "{a} said a name given can be taken back, which is not true here and {a} knows it.",
        "{a} keeps two tallies now and reconciles neither.",
        "{a} went to see about the water when the talk turned to who was walking out with whom.",
        "{a} has stopped eating anything {b} hands {a}.",
        "{a} was furious about nothing for three afternoons in a row.",
        "{a} said the bargain had terms and would not say which terms.",
        "{a} was asked whether {a} was courting and thanked the asker very precisely.",
        "{a} has been at the place where the door used to be, more than once, at night.",
        "{a} said 'as long as it lasts' and then would not take it back.",
        "{a} started a quarrel about nothing and could not remember it by supper, and neither could the other.",
        "{a} has stopped listening to the thing {a} listens to.",
        "{a} gave a gift and did not wait to be given one, which here is a debt created on purpose.",
        "{a} said {a} could go back, which is not true.",
        "{a} has been asking direct questions, which from {a} means something has broken.",
        "{a} said this place is crueller than it says, and had stopped saying the first half.",
        "{a} said 'it is nothing' with the terms of it plainly stated in {a}'s own head.",
        "{a} stood still listening and it was not the usual something.",
      ],
    },
    Elf: {
      slice: [
        "{a} was asked how long the job took and could not usefully answer.",
        "{a} has not aged since arriving and has stopped finding it remarkable.",
        "{a} thanked somebody carefully, in a way that made clear thanking is not free here.",
        "{a} will not take a gift without giving one the same hour.",
        "{a} said the season changed and nobody else had noticed a season.",
        "{a} laughed at something for rather longer than the something warranted.",
        "{a} was furious for an afternoon about nothing and perfectly fine by supper.",
        "{a} declines to say what {a} wants aloud, on principle, and the principle is sound here.",
        "{a} knows which of the paths out of the yard go where they look like going.",
        "{a} keeps a tally of days that does not match anybody else's tally of days.",
        "{a} said this place is nearer to what {a}'s people were, and did not sound pleased.",
        "{a} would not give a stranger a name, not even a false one.",
        "{a} sang while working and three people stopped what they were doing.",
        "{a} said the food here tastes like it means something and ate it anyway.",
        "{a} was asked a favour and negotiated the terms of it with great seriousness.",
        "{a} has an arrangement with something in the garden and will not discuss it.",
        "{a} counts a promise the way another counts a debt, and has said so.",
        "{a} was homesick for Faerun, which surprised {a} more than anybody.",
        "{a} said the light here is wrong and beautiful and both at once.",
        "{a} stood still in the {room} for a while, listening to something nobody else could hear.",
      ],
      romance: [
        "{a} gave {b} a name to use, which here is an enormous thing to give.",
        "{a} made {b} a promise, out loud, with the terms stated, because here that is how it is done.",
        "{a} said the season had changed and looked at {b} when saying it.",
        "{a} refused a gift from {b} and then, having thought, accepted it and gave three.",
        "{a} told {b} the true tally of days, which does not match the household's.",
        "{a} said {b}'s name and something in the garden went quiet.",
        "{a} was furious with {b} for an afternoon and could not remember why by supper.",
        "{a} took {b} down a path that does not go where it looks like going.",
        "{a} said what {a} wanted aloud, which {a} does not do, and did it once.",
        "{a} introduced {b} to the thing in the garden.",
        "{a} said {a} had not aged since arriving and neither, it seemed, had this.",
        "{a} sang the whole of something and did not stop when {b} came in.",
        "{a} bargained for a favour on {b}'s behalf and paid more than {a} let on.",
        "{a} said Faerun was home and this was where {a} was, and looked at {b} while saying it.",
        "{a} kept a promise nobody was holding {a} to.",
        "{a} let {b} see what the light does to {a} at the turn of the season.",
        "{a} said the food tasted like it meant something and passed {b} the better half.",
        "{a} counted {b} in the tally.",
        "{a} said 'as long as it lasts' and here that is a specific and dangerous phrase.",
        "{a} stood still with {b} listening to the thing nobody else could hear.",
      ],
      taboo: [
        "{a} has stopped giving anybody a name to use, including people {a} had given one to.",
        "{a} was asked about {b} and negotiated their way out of the question.",
        "{a} has been keeping two tallies of days and reconciling neither.",
        "{a} refused a gift and did not give one back, which here is nearly an insult.",
        "{a} said a promise had terms and would not say what the terms were.",
        "{a} has been walking the paths that do not go where they look like going.",
        "{a} was furious about nothing for three afternoons running.",
        "{a} has stopped singing.",
        "{a} said what {a} wanted aloud, in an empty room, and checked the door after.",
        "{a} has an arrangement with the thing in the garden that is newer than the old one.",
        "{a} was seen at the edge of the wood at a season that has no edge.",
        "{a} said 'as long as it lasts' and then looked as though {a} had said too much.",
        "{a} defends a courtesy {a} has flouted since arriving.",
        "{a} has stopped counting {b} in the tally, deliberately, in company.",
        "{a} paid for something and would not say what.",
        "{a} said it is not done here, which is not true, and {a} knows it is not true.",
        "{a} keeps a thing that was a gift and will not say who gave it.",
        "{a} left the {room} when the talk turned to who was promised to whom, and the word landed hard.",
        "{a} has been thanking people very precisely, which means {a} is counting something.",
        "{a} stood still listening to something and it was not the usual something.",
      ],
    },
  },
  // ═══ BALDUR'S GATE ═══ A merchant city with a wall through the middle of it: the PATRIARS in the
  // Upper City and everybody else in the Lower and the Outer, with the FLAMING FIST between them
  // taking coin from whoever pays. The Gate does not pretend to be fair and rather despises places
  // that do. Nobody here is impressed by a title that is not attached to money.
  baldursgate: {
    Human: {
      slice: [
        "{a} named the ward {a} grew up in before naming the city, because here that is the information.",
        "{a} has an opinion about the patriars that {a} keeps to a face rather than a sentence.",
        "{a} said the Flaming Fist keep the peace they are paid to keep, and left it there.",
        "{a} counted change in front of the person who gave it and did not apologise.",
        "{a} was through the Basilisk Gate before dawn and back before the toll changed.",
        "{a} knows what everything costs and what everything is worth and holds the two apart.",
        "{a} said the Upper City smells better because somebody carries it out for them.",
        "{a} was polite to a patriar's man in a way that cost {a} nothing and gained {a} nothing.",
        "{a} has never once been surprised by a bribe.",
        "{a} said the Gate is honest about being what it is, which is more than Waterdeep manages.",
        "{a} keeps a tally of favours owed both directions and it balances.",
        "{a} names three ships and the days they are due without checking.",
        "{a} was born outside the wall and says so before anybody can say it for {a}.",
        "{a} said everybody in this city is somebody's client, including the patriars.",
        "{a} spotted a cut-purse across a room and did nothing, because it was not {a}'s purse.",
        "{a} priced the household's stores and found them paying twelve percent over.",
        "{a} said a contract is the only thing here that means anything, and meant it warmly.",
        "{a} distrusts generosity and has been right often enough to keep distrusting it.",
        "{a} has family on both sides of the wall and mentions neither to the other.",
        "{a} looked at the harbour at the end of the day, which is a Gate habit and means nothing.",
      ],
      romance: [
        "{a} told {b} which ward {a} was born in, unprompted, which is telling {b} everything.",
        "{a} did {b} a favour and did not enter it in the tally.",
        "{a} said {b} was worth twelve percent over and would not explain the joke.",
        "{a} walked {b} up into the Upper City on a day neither had business there.",
        "{a} named {b} on a contract in the place where a partner goes.",
        "{a} stopped counting change in front of {b}.",
        "{a} said the Gate is honest about what it is and so, lately, is {a}.",
        "{a} introduced {b} to the family on the outside of the wall first, which was the compliment.",
        "{a} priced a thing for {b} at cost and lied about the cost.",
        "{a} said a contract is the only thing here that means anything, and then said one thing else.",
        "{a} was generous to {b} and was visibly uncomfortable about having been.",
        "{a} told {b} which of the three ships {a} would take if it came to leaving.",
        "{a} paid a toll to walk {b} the long way round.",
        "{a} said {b} had never once tried to be somebody's client.",
        "{a} spotted a cut-purse near {b} and did something about it this time.",
        "{a} kept a favour owed rather than call it in, for the first time on record.",
        "{a} named {b} to a patriar's man as though {b} outranked him.",
        "{a} said {a} had never been surprised by anything in this city until recently.",
        "{a} put {b} on the tally in a column {a} had to invent.",
        "{a} looked at the harbour with {b} and did not check the ships.",
      ],
      taboo: [
        "{a} has started counting change in front of {b} again.",
        "{a} was asked about {b} and gave the going rate for grain.",
        "{a} has been through the Basilisk Gate at hours with no trade in them.",
        "{a} said it would cost {b} a ward's worth of standing, to nobody.",
        "{a} has stopped mentioning either side of the family to the other, including to {b}.",
        "{a} was seen in a ward {a} has no business in and had a price ready as an excuse.",
        "{a} said everybody here is somebody's client, bitterly, which is new.",
        "{a} went out to check a delivery when the talk turned to who was walking out with whom.",
        "{a} put a favour on the tally that {a} had previously left off it.",
        "{a} was asked whether {a} was courting and quoted a contract term.",
        "{a} has been unusually generous with everybody and careful with one person.",
        "{a} started a quarrel over twelve percent that was not about twelve percent.",
        "{a} said 'it is a private arrangement' in a city where nothing is.",
        "{a} took a berth on one of the three ships and did not sail.",
        "{a} has stopped naming {b} on anything.",
        "{a} paid somebody to not have noticed something.",
        "{a} said the Gate is honest about what it is and did not sound as though {a} were.",
        "{a} keeps a paper somewhere no contract is kept.",
        "{a} distrusted a kindness from {b} out loud and regretted it immediately.",
        "{a} looked at the harbour for a long time and counted the ships twice.",
      ],
    },
  },
  // ═══ BAROVIA ═══ The valley is a prison and everyone in it knows. The mists do not let people
  // leave, the Devil Strahd is the land and the land is him, and the ordinary Barovian response to
  // all of this is not terror — it is a grey, practised, exhausted CAUTION. They are polite. They do
  // not talk about certain things after dark. They have buried a great many people.
  barovia: {
    Human: {
      slice: [
        "{a} shut the shutters before dark without appearing to decide to.",
        "{a} was asked what lies beyond the mists and said nothing does, flatly, as a fact.",
        "{a} did not say the name and made a small sign instead, and did not notice doing it.",
        "{a} counted the household in at dusk. {a} counts the household in every dusk.",
        "{a} said the wine is good here, which is true and is the only boast Barovia has.",
        "{a} has buried more people than {a} is years old and does not consider this remarkable.",
        "{a} was courteous to a stranger and did not ask a single question about where they came from.",
        "{a} knows which roads are travelled by day only and does not explain the distinction.",
        "{a} said the Vistani come and go, in a tone containing an entire politics.",
        "{a} looked at the sky at four in the afternoon and started closing up.",
        "{a} kept a light burning in an empty room, as one does.",
        "{a} said there was a wedding in the village once, some years ago, and let that stand.",
        "{a} took the death of somebody in the next house with a calm that alarmed the newcomers.",
        "{a} would not go up to the castle for money and said so before being offered.",
        "{a} said the land provides, which here is not a pleasantry.",
        "{a} was asked whether {a} had ever wanted to leave and gave a very long pause.",
        "{a} keeps garlic where garlic is kept and does not make a performance of it.",
        "{a} said the mists are just weather, and did not believe it, and said it anyway.",
        "{a} is unfailingly kind to children and grim about very little else.",
        "{a} stood at the door at dusk looking at the treeline before barring it.",
      ],
      romance: [
        "{a} said {b}'s name after dark, which {a} does not do with names {a} minds losing.",
        "{a} took {b} to see the one part of the valley that is beautiful in daylight.",
        "{a} said there was a wedding in the village once, and looked at {b} while saying it.",
        "{a} left a second light burning.",
        "{a} counted {b} in at dusk before counting anybody else.",
        "{a} told {b} who is buried in the third row and what happened.",
        "{a} said {a} had stopped wanting to leave, and it was not resignation.",
        "{a} gave {b} something of {a}'s mother's, which in Barovia is the whole ceremony.",
        "{a} was asked about the future and, for the first time in years, answered.",
        "{a} said the wine is good here and poured {b} the better bottle.",
        "{a} walked {b} home in the last of the light and stayed past the safe hour.",
        "{a} made a small sign over {b} at the door and pretended it was nothing.",
        "{a} said the land provides, and put a hand on {b}'s arm while saying it.",
        "{a} laughed out loud, in Barovia, which turned three heads.",
        "{a} told {b} the thing {a} has never told anybody, and it took until nearly dark.",
        "{a} said {a} would not go up to the castle for money and would go for {b}, and meant it.",
        "{a} planted something, which here is an act of extraordinary optimism.",
        "{a} stopped counting the household in the moment {b} was through the door.",
        "{a} said the mists are just weather and this time nearly believed it.",
        "{a} stood at the door at dusk with {b} and did not look at the treeline once.",
      ],
      taboo: [
        "{a} has stopped saying {b}'s name after dark.",
        "{a} was asked about {b} and talked about the vines.",
        "{a} has been out past the safe hour and gives the same account each time, exactly.",
        "{a} said it would draw attention, and in this valley that sentence has one meaning.",
        "{a} let the second light go out.",
        "{a} has been unfailingly kind to everybody and unable to be alone with one person.",
        "{a} was seen on a road that is travelled by day only.",
        "{a} said there are things one does not bring to notice, and would not say whose notice.",
        "{a} has stopped planting.",
        "{a} went out to bar a gate when the talk turned to who was walking out with whom.",
        "{a} was asked whether {a} was courting and made the small sign instead of answering.",
        "{a} has taken to counting the household twice.",
        "{a} said 'better it is not spoken of', which here is not superstition, it is procedure.",
        "{a} started a quarrel about the shutters that was not about the shutters.",
        "{a} put something in the grave-goods box that is not for a grave.",
        "{a} said the Vistani come and go, and this time it was a question.",
        "{a} has stopped looking at anybody across a room after dark.",
        "{a} said it is nothing, in Barovia, where nothing is nothing.",
        "{a} keeps a light burning in a room that is not empty and says it is.",
        "{a} stood at the door at dusk for far longer than barring it takes.",
      ],
    },
  },
  // ═══ WILDSPACE ═══ The Rock of Bral and the Elven Imperial Fleet. The armadas are GROWN, from
  // carefully cultivated starfly trees, and their gardens replenish the air envelope — a warship
  // that is also an orchard. Only elves may be true members; spaceborn are preferred to groundling
  // and the young to the old, and membership is for life, like a sphere-spanning family. The
  // Unhuman War is the reason the scro exist and the reason the Fleet does.
  //
  // And the STARCASTLES are the dwarf (and halfling and gnome) families who build the stone
  // citadels on the Fleet's flagships — a people whose whole pride is work done for somebody else's
  // navy, which is a genuinely different dwarf.
  wildspace: {
    // WILDSPACE HUMANS. The Rock of Bral and the ships: a free port the size of a town on a lump of
    // rock, and everybody on it came from somewhere else. Air is a commodity, gravity is a decision
    // somebody made, and the nearest world is a month away. Human spacefarers are the least
    // parochial people in any sphere and the most superstitious, because the void rewards both.
    Human: {
      slice: [
        "{a} named the ship rather than the world, because the ship is where {a} is from.",
        "{a} checked the air the way a farmer checks the sky, and did it on a planet.",
        "{a} said Bral is the only honest port in three spheres and did not mean it kindly.",
        "{a} has never in {a}'s life had to think about which way down was until arriving here.",
        "{a} said groundlings waste air and has said it in front of groundlings.",
        "{a} touches the doorframe going through and will not say why.",
        "{a} priced a passage to two spheres over and was within a few gold.",
        "{a} has met people from four worlds and finds one country's worth of opinions very small.",
        "{a} said the void is not empty, it is only quiet, and let that sit.",
        "{a} knows what a sphere's crystal shell sounds like from the inside and cannot describe it.",
        "{a} keeps a bottle of something from a world {a} will not go back to.",
        "{a} said the scro are real and stopped the conversation dead.",
        "{a} was unimpressed by a lord, sincerely and without malice.",
        "{a} counts a month as a distance rather than a duration.",
        "{a} said the Rock takes anybody who pays the docking fee, which is the whole of its law.",
        "{a} has been becalmed and does not talk about it.",
        "{a} said gravity here is somebody's decision and was not joking.",
        "{a} finds a horizon unsettling and has stopped mentioning it.",
        "{a} swears by three different pantheons and means all of them.",
        "{a} looked up at night and started naming things nobody else could see.",
      ],
      romance: [
        "{a} named the ship {a} came out on and what happened to it.",
        "{a} said {b} would be a good hand in a hold, which from a spacefarer is the compliment.",
        "{a} gave {b} the bottle from the world {a} will not go back to.",
        "{a} taught {b} which way down is here and why the answer is temporary.",
        "{a} said the void is not empty and had stopped finding that frightening.",
        "{a} priced a passage for two and did not mention having done it.",
        "{a} touched the doorframe going through and then touched {b}'s shoulder.",
        "{a} counted a month as a distance and said it was not far.",
        "{a} told {b} about being becalmed, all of it, which took most of a night.",
        "{a} said the Rock takes anybody who pays and that {a} had stopped wanting it to.",
        "{a} swore by three pantheons over one small thing and {b} laughed for a while.",
        "{a} named a star for {b} and admitted immediately that it already had a name.",
        "{a} said groundlings waste air and that {b} could waste as much as {b} liked.",
        "{a} stopped finding the horizon unsettling somewhere around the second month.",
        "{a} put {b} on the ship's articles.",
        "{a} said {a} had met people from four worlds and had not met this before.",
        "{a} showed {b} what a crystal shell sounds like and could still not describe it after.",
        "{a} said the scro are real, quietly, so that {b} would know what {a} carries.",
        "{a} checked the air twice and then did not check it again all evening.",
        "{a} looked up at night with {b} and named things nobody else could see.",
      ],
      taboo: [
        "{a} has been checking the air rather more often than the air requires.",
        "{a} was asked about {b} and priced a passage.",
        "{a} said it would follow {b} through three spheres, and out here it would.",
        "{a} has taken {b} off the articles.",
        "{a} went to see to the rigging when the talk turned to who was walking out with whom.",
        "{a} has stopped naming the ship {a} came out on.",
        "{a} said the Rock takes anybody who pays, and this time it was not approval.",
        "{a} was seen on the dock at an hour with no tide and no ships.",
        "{a} was asked whether {a} was courting and named a docking fee.",
        "{a} has been swearing by only one pantheon, which for {a} is a narrowing.",
        "{a} keeps something in the sea-chest that is not from any world {a} names.",
        "{a} started a quarrel with a groundling about air.",
        "{a} said 'it is ship's business' about a thing with no ship in it.",
        "{a} has been unusually generous with the household and formal with one person.",
        "{a} put the bottle back and has not opened it since.",
        "{a} said a month is a distance, in a tone that made it sound like a plan.",
        "{a} has stopped touching the doorframe, which {a} has done every day for twenty years.",
        "{a} was becalmed once and has started talking about it, which is worse.",
        "{a} said 'it is nothing' and then checked the air.",
        "{a} looked up at night and did not name anything at all.",
      ],
    },
    Elf: {
      slice: [
        "{a} was Fleet, and says 'was' in a way that makes clear nobody is ever was.",
        "{a} pruned something in the {room} the way you prune a hull, which is to say very carefully.",
        "{a} was asked whether the ship was built and said grown, and let the correction stand.",
        "{a} keeps naval regulation about a room that has never seen a regulation.",
        "{a} counts air the way groundlings count coin, out of a habit twelve years ashore has not touched.",
        "{a} said the word 'scro' and the temperature of the {room} changed.",
        "{a} was spaceborn and mentions it about as often as a lord mentions the title.",
        "{a} can navigate by stars that are not visible from this hemisphere.",
        "{a} said Bral was a filthy little rock and clearly misses it.",
        "{a} uses wildspace slang for tools that have perfectly good Common names.",
        "{a} was at the garden watch on an armada for forty years and cannot pass a plant without checking it.",
        "{a} named an admiral the way a soldier names a general they served under and did not like.",
        "{a} has not been groundside long enough to stop being surprised by weather.",
        "{a} said the Fleet takes you young and keeps you, and did not sound sorry about it.",
        "{a} was asked about the Unhuman War and answered with numbers rather than a story.",
        "{a} keeps a locker rather than a chest, and keeps it as though for inspection.",
        "{a} looked up at night and found the sky wrong, and has not stopped finding it wrong.",
        "{a} speaks three tongues nobody in this valley has heard of and slips into them when tired.",
        "{a} said groundling elves take a very long time about everything, which from an elf is remarkable.",
        "{a} squared away the {room} at the end of the watch out of a habit nobody here shares.",
      ],
      romance: [
        "{a} told {b} what an armada looks like from outside, at length, and had never told anybody groundside.",
        "{a} taught {b} a Fleet word and then what it actually means, which was different.",
        "{a} said {b} would have made a fair hand at the garden watch, which is high praise.",
        "{a} pointed out the star the Fleet uses to fix by and named it in Elvish.",
        "{a} has begun keeping {b}'s hours, which after forty years of watches is a real thing.",
        "{a} said membership was for life, and then said some other things were too.",
        "{a} showed {b} the locker and what is in the bottom of it.",
        "{a} told {b} what {a} did in the war and did not make it sound better than it was.",
        "{a} said the sky here was wrong and that {a} had stopped minding.",
        "{a} named {b} in a letter to somebody still serving, in the part where you name family.",
        "{a} brought {b} a cutting from something that should not grow in this climate and it grew.",
        "{a} said the Rock would suit {b}, and made it sound like a plan rather than a remark.",
        "{a} let {b} hear the song the garden watch sings, which is not sung groundside.",
        "{a} used {b}'s name in wildspace slang and then, embarrassed, translated it.",
        "{a} said 'a hundred years' and did the arithmetic out loud, for {b}'s sake.",
        "{a} stopped squaring the {room} away when {b} was in it, which is its own surrender.",
        "{a} told {b} why {a} left the Fleet, which nobody groundside has been told.",
        "{a} taught {b} to find the pole star and then held the arm to point.",
        "{a} said the armada had been home and that this was, now, and looked away after.",
        "{a} stood out in the yard with {b} looking at the wrong sky and did not complain about it once.",
      ],
      taboo: [
        "{a} has been squaring the {room} away with unusual thoroughness and at unusual hours.",
        "{a} was asked about {b} and gave a report on the stores.",
        "{a} has stopped using wildspace slang in company, which was never a choice before.",
        "{a} said the Fleet had rules about such things, which is true and is not the point here.",
        "{a} has been writing to somebody still serving and not sending it.",
        "{a} was seen in the yard at an hour when only the watch is in the yard.",
        "{a} became interested in groundling marriage custom, in the manner of a survey.",
        "{a} put something in the locker and turned the locker to the wall.",
        "{a} said 'it is a small matter' about a thing {a} has thought about for a month.",
        "{a} has stopped naming {b} and started using the post, the way a Fleet officer would.",
        "{a} left a gathering when the talk turned to who was walking out with whom.",
        "{a} defends a regulation {a} broke cheerfully for forty years.",
        "{a} takes the long way across the yard and it is measurably the long way.",
        "{a} was asked by a countryman and answered in a tongue the countryman does not have.",
        "{a} has been checking the plants at hours the plants do not need checking.",
        "{a} said there were reasons and did not enumerate them, which for {a} is unheard of.",
        "{a} keeps two hours a week free and accounts for them differently each time.",
        "{a} praised a groundling elf's looks, unprompted, in a tone nobody believed.",
        "{a} has stopped looking up at night.",
        "{a} said something in Fleet slang, very quietly, that nobody present could translate.",
      ],
    },
    Dwarf: {
      slice: [
        "{a} is Starcastle, and says it the way another dwarf says a clan name, because it is one.",
        "{a} has built stone into a ship and finds nothing strange in the sentence.",
        "{a} was asked who {a} works for and said the Fleet, and did not qualify it.",
        "{a} takes a professional interest in every wall {a} passes and says so out loud.",
        "{a} said elves are particular and meant it as a description of good clients.",
        "{a} measured something twice and then a third time because it was going somewhere with no ground under it.",
        "{a} knows the tonnage a citadel adds to an armada and will tell anybody who asks.",
        "{a} was born on the Rock and has never stood on a world.",
        "{a} said gravity here is inconvenient, which took the household a while to work out.",
        "{a} counts stone the way a groundling dwarf counts ore, because up there it is dearer.",
        "{a} keeps the Starcastle mark on the tools and puts it on the work where it will not be seen.",
        "{a} has an opinion about Bral's Prince and keeps it to a shrug.",
        "{a} said the Fleet pays fair and late, in that order.",
        "{a} was in a hull breach once and does not tell the story and does not sleep by windows.",
        "{a} named three families {a} would work with and one {a} would not.",
        "{a} finds a keep's foundations luxurious and has said so more than once.",
        "{a} was asked whether {a} missed the Rock and said {a} missed the noise.",
        "{a} builds for a load that will move, always, even when it will not.",
        "{a} said a citadel that flies has to be better than one that does not, and left it there.",
        "{a} looked at the sky at the end of the day and did not find it far enough away.",
      ],
      romance: [
        "{a} told {b} what it is to fit stone into something that will leave the ground.",
        "{a} put the Starcastle mark somewhere on a thing made for {b}.",
        "{a} said {b} would like the Rock, and then described it honestly, and said it anyway.",
        "{a} explained the tonnage problem to {b} for an hour and {b} let {a} finish.",
        "{a} named {b} to the family, which for a Starcastle is a formal thing.",
        "{a} made {b} something that would survive a hull breach, which is what {a} makes for people {a} likes.",
        "{a} said the Fleet was a good client and this was not about clients.",
        "{a} showed {b} how to read a wall, and {b} has started reading walls.",
        "{a} has stopped taking the long contracts.",
        "{a} said {b} had a builder's eye, which is the highest thing {a} says about anybody.",
        "{a} told {b} about the hull breach, all of it, and had told nobody.",
        "{a} asked {b} whether {b} could live without a sky, and was asking a real question.",
        "{a} priced a thing at cost for {b} and lied about the cost.",
        "{a} said the family would want to meet {b}, and the family is three spheres away.",
        "{a} took {b} to look at a wall {a} is proud of, which took an afternoon.",
        "{a} sleeps by a window now, on the side away from it, but by it.",
        "{a} said gravity was worth it, apropos of nothing, while {b} was in the room.",
        "{a} put two marks on the same stone and would not explain the second.",
        "{a} let {b} hold the good measure, which nobody holds.",
        "{a} looked at the sky with {b} and said it was far enough away after all.",
      ],
      taboo: [
        "{a} has become very exact about what the family would say, having never mentioned the family.",
        "{a} was asked about {b} and delivered a lecture on load-bearing.",
        "{a} has stopped putting the mark on the work, which {a} has done since apprenticeship.",
        "{a} said the Fleet had views on such arrangements, which is a deflection and a poor one.",
        "{a} has been measuring things that do not need measuring.",
        "{a} was seen in the yard at an hour when the yard is empty.",
        "{a} keeps something in the tool-roll that no builder carries.",
        "{a} has stopped saying {b}'s name and started saying 'the one in the kitchen'.",
        "{a} defends a Starcastle propriety {a} has cheerfully ignored for twenty years.",
        "{a} said it was a family matter, which is what {a} says when it is not.",
        "{a} left the room when the talk turned to who was promised to whom.",
        "{a} has taken to washing before coming up from the work.",
        "{a} started an argument about a wall that was not about the wall.",
        "{a} was asked whether {a} was courting and said Starcastles marry Starcastles.",
        "{a} put a second name on a work order and scratched it out before filing.",
        "{a} has been sleeping badly and blames the gravity, which {a} has never blamed before.",
        "{a} said 'it would cost them more than me' about nobody in particular.",
        "{a} left a joint deliberately rough, which {a} has never once done in twenty years.",
        "{a} has an arrangement with the gate that is not about deliveries.",
        "{a} looked at the sky for a long while and did not say what for.",
      ],
    },
  },
  // ═══ AVERNUS ═══ The first layer of the Nine Hells. **Nobody here is a resident.** A human in
  // Avernus is a soldier under contract, somebody's property, a fool who signed, or the descendant
  // of one of those — and thirty percent of the population being human says only that the Blood War
  // eats people and buys more. The voice is not despair; despair is useless here and gets you sold.
  // It is a terrible, functional pragmatism about exactly what one is worth and to whom.
  avernus: {
    Human: {
      slice: [
        "{a} knows the exact terms of {a}'s own contract and can recite the clause that ends it.",
        "{a} said nobody is FROM here, in a tone that closed the subject.",
        // ═ EASTER EGG ═ Six lines in this table are shaped like Soviet-era humour, because Avernus
        // ALREADY IS that: inverted agency dressed as choice, everyone under contract, someone always
        // listening, and the terms honoured exactly — which is the horror rather than the loophole.
        // Each must read as straight Avernus first and land as a joke second; a wink that breaks the
        // fiction is worse than no wink. (Frank, 2 Aug, who spotted the shape before I did.)
        //
        // Shortage economy: everything available, nothing obtainable.
        "{a} said everything can be had here and nothing can be got, and went back to the tally.",
        "{a} was asked about home and named a place, and then said it had been a while.",
        "{a} does not make promises. {a} makes terms.",
        "{a} said the devils keep their word exactly, which is the whole horror of the arrangement.",
        "{a} has watched somebody be taken for a technicality and did not intervene and does not pretend otherwise.",
        "{a} said the Blood War does not end, as a fact about employment.",
        "{a} reads everything before signing and has read some terrible things.",
        "{a} keeps nothing anybody could want.",
        "{a} was polite to a devil and afterwards said nothing for an hour.",
        "{a} said despair is expensive here and has clearly costed it.",
        "{a} knows which of the household is under contract and which merely thinks they are free.",
        "{a} said the sky does that, when a newcomer stared, and went back to work.",
        "{a} was born here, second generation, and finds the others' homesickness incomprehensible.",
        // "We pretend to work and they pretend to pay us" — which in Avernus is simply the contract.
        "{a} said the work is what the terms say the work is, and the pay is what the terms say the pay is, and both are correct.",
        "{a} said a favour is a debt with the paperwork not filed yet.",
        "{a} has never once asked anybody for anything.",
        "{a} said it is survivable, which is the highest thing anybody says about Avernus.",
        "{a} looked up at whatever passes for a sky and looked away quickly.",
      ],
      romance: [
        "{a} told {b} the terms of the contract, all of it, including the clause about {a}.",
        // The Smirnoff reversal, played straight: in the Gate you sign the contract.
        "{a} said that elsewhere a person keeps a contract, and here the contract keeps the person, and that {b} was neither.",
        "{a} made {b} a promise instead of terms, and knew exactly what {a} was doing.",
        "{a} said nobody is from here and that {a} would like to be from somewhere with {b}.",
        "{a} asked {b} for something, which {a} has never done.",
        "{a} kept something anybody could want, for the first time, and it was {b}'s.",
        "{a} told {b} what {a} watched happen and did not stop.",
        // Radio Yerevan: "In principle, yes — but..."
        "{a} was asked whether {a} was happy and said in principle yes, and then said nothing for a while, and then said yes.",
        "{a} named {b} in a clause and paid to have the clause added.",
        "{a} said the devils keep their word exactly and that {a} would too.",
        "{a} did more work than the terms required, twice, and was frightened of what that meant.",
        "{a} said it is survivable and then said something better than survivable.",
        "{a} told {b} the name of the place {a} came from, which {a} has told nobody.",
        "{a} looked up at whatever passes for a sky and did not look away.",
        "{a} said a favour is a debt and then did {b} one and filed nothing.",
        "{a} taught {b} to read a contract properly and was very patient about it.",
        "{a} said {b} should get out if the chance came, and meant it, and did not include {a}.",
        "{a} was polite to a devil on {b}'s behalf and said nothing for two hours after.",
        "{a} counted wrong, once, because {a} was not thinking about the count.",
        "{a} said the clause that ends it comes up in four years, out loud, as a plan.",
      ],
      taboo: [
        "{a} has stopped telling {b} anything about the contract.",
        "{a} was asked about {b} and recited a clause.",
        "{a} said it would give somebody a lever, and here that word has a price attached.",
        // The neighbour who reports. In Avernus this is not paranoia; it is the org chart.
        "{a} has started wondering which of the household is paid to notice things, and has a shortlist.",
        "{a} has taken {b}'s name out of the clause and paid to have it removed.",
        "{a} went to see to the tallies when the talk turned to who was walking out with whom.",
        "{a} said nobody is from here, and this time it was an argument against something.",
        "{a} has stopped keeping anything anybody could want, including the thing that was {b}'s.",
        "{a} was asked whether {a} was courting and quoted a term of service.",
        "{a} has been unfailingly correct with everybody and unable to be near one person.",
        // The queue: you join it first and find out what it is for afterwards.
        "{a} joined a line without knowing what it was for, which {a} has not done since the first year.",
        "{a} did exactly the work and no more, which {a} had lately stopped doing.",
        "{a} said a favour is a debt and refused one from {b} in front of people.",
        "{a} has stopped saying it is survivable.",
        "{a} was polite to a devil about something that had nothing to do with the work.",
        "{a} said the clause comes up in four years, and did not say it as a plan.",
        "{a} has stopped asking anybody for anything, having briefly started.",
        "{a} has written something down that is not a term and has not burned it.",
        "{a} said 'it is nothing' in a place where nothing is nothing and everything is a term.",
        "{a} looked up at whatever passes for a sky for a very long time.",
      ],
    },
  },
  // ═══ THE MOONSEA ═══ Hard country: Zhentil Keep and the Black Network, Melvaunt's foundries,
  // Hillsfar's gate. An orc here is not a raider from the hills — an orc here is HIRED MUSCLE in a
  // region that hires muscle openly and does not ask where it came from, which is its own kind of
  // welcome and its own kind of insult.
  moonsea: {
    // HARD COUNTRY. Zhentil Keep and the Black Network, Melvaunt's foundries, Hillsfar's gate that
    // is shut to non-humans, Mulmaster called the City of Danger by people who live there. Nobody on
    // this shore expects to be protected. A Moonsea human is not cruel by default — they are simply
    // somebody who learned early that the arrangement is the arrangement, and who keeps their own
    // counsel about it.
    Human: {
      slice: [
        "{a} named the city rather than the shore, and named it warily.",
        "{a} said the Zhents keep what order there is, which is not praise and is not complaint.",
        "{a} has been turned back at Hillsfar's gate for travelling with the wrong company.",
        "{a} counted the exits from the {room} on the first day without appearing to.",
        "{a} said Melvaunt smells of iron and money and that both are honest.",
        "{a} was asked about Mulmaster and said people live there, which was the whole review.",
        "{a} keeps opinions about the Network entirely inside {a}'s own head.",
        "{a} said this shore has burned a city and rebuilt it, more than once, and will again.",
        "{a} was scrupulously polite to somebody {a} plainly despised.",
        "{a} knows which of the household would talk if somebody paid enough.",
        "{a} said nobody is coming to help, on this coast, as a piece of practical advice.",
        "{a} paid a bribe as a line item and did not remark on it.",
        "{a} has family in a city that no longer stands and does not raise it.",
        "{a} said the lake is the road and the road is somebody's.",
        "{a} was unsurprised by a betrayal that shocked everybody else in the hall.",
        "{a} keeps two accounts of everything and both of them are true.",
        "{a} said trust is a thing you extend at a price you can bear to lose.",
        "{a} did somebody a kindness quietly and would deny it under questioning.",
        "{a} distrusts a stranger who is too interested and a friend who is too curious.",
        "{a} looked at the lake at dusk the way people here do, which is checking rather than admiring.",
      ],
      romance: [
        "{a} told {b} which city the family was from, which {a} has told nobody.",
        "{a} said {b} was the one person {a} had stopped keeping two accounts about.",
        "{a} said nobody is coming to help on this coast, and then said {a} would.",
        "{a} named {b} to somebody dangerous, deliberately, as a person under {a}'s protection.",
        "{a} did {b} a kindness and admitted it when asked.",
        "{a} took {b} to Melvaunt and did not once check the exits.",
        "{a} said trust is extended at a price {a} could bear to lose, and had stopped pricing it.",
        "{a} told {b} what happened when the city burned.",
        "{a} stopped being scrupulously polite to {b} and started being plain, which is the intimacy here.",
        "{a} said {b} was too curious and had earned it.",
        "{a} paid a bribe on {b}'s behalf and did not put it on the account.",
        "{a} said the lake is the road and asked whether {b} would take it if it came to that.",
        "{a} was surprised by something for the first time in years, and it was {b}.",
        "{a} told {b} which of the household would talk, so that {b} would know.",
        "{a} said the arrangement is the arrangement and that {a} had stopped keeping to it.",
        "{a} let {b} see {a} frightened, once, and did not explain afterwards.",
        "{a} kept one account instead of two, for a week, to see how it felt.",
        "{a} said the Zhents keep what order there is, and that {a} would not be sorry to leave it.",
        "{a} named {b} where next-of-kin goes on a Melvaunt manifest.",
        "{a} looked at the lake at dusk with {b} and was not checking.",
      ],
      taboo: [
        "{a} has gone back to keeping two accounts of everything.",
        "{a} was asked about {b} and gave the price of pig iron.",
        "{a} has been checking the exits again, and more often.",
        "{a} said it would put {b} in front of somebody's ledger, and meant a real ledger.",
        "{a} has been scrupulously polite to {b} in company, which is a retreat.",
        "{a} was seen on the shore road at an hour nobody walks the shore road.",
        "{a} said nobody is coming to help, and this time it was about the two of them.",
        "{a} went to see to a delivery when the talk turned to who was walking out with whom.",
        "{a} has stopped naming {b} to the dangerous people, which is how {a} used to protect {b}.",
        "{a} was asked whether {a} was courting and priced a cargo.",
        "{a} paid somebody to have not seen something.",
        "{a} started a quarrel with somebody who had asked a normal question.",
        "{a} said 'it is a private matter' on a coast where nothing private survives.",
        "{a} took {b}'s name off the manifest.",
        "{a} has been unusually generous to the household and cold to one person.",
        "{a} said trust is extended at a price and that {a} had overpaid.",
        "{a} keeps a paper somewhere no account is kept.",
        "{a} distrusted a kindness from {b} out loud and could not take it back.",
        "{a} said 'it is nothing' in a place where saying that is itself a signal.",
        "{a} looked at the lake at dusk and counted something twice.",
      ],
    },
    Orc: {
      slice: [
        "{a} has taken Zhent coin before and does not pretend otherwise when asked.",
        "{a} was hired in Melvaunt on a look and a handshake and no questions at all.",
        "{a} said the Moonsea was honest about what it wanted from {a}, which is more than the west managed.",
        "{a} knows what the foundry smoke on the north shore means and reads the wind for it.",
        "{a} was asked which company {a} served with and named one that no longer exists.",
        "{a} counts the household's blades the way a sergeant counts, without being asked to.",
        "{a} has never been turned away from an inn on this coast and remarks on it about twice a year.",
        "{a} named Gruumsh at the table and got a shrug, which was not what {a} expected.",
        "{a} said Hillsfar's gate was the only honest wall in the region, and was joking, mostly.",
        "{a} has a scar from a contract and will name the price it paid but not the employer.",
        "{a} keeps out of Zhentil Keep and has never explained the arrangement.",
        "{a} watched a caravan come in and priced its guard from thirty paces.",
        "{a} said the sea here smells wrong and has said so for six years.",
        "{a} took a hard job nobody else wanted and did not haggle over it.",
        "{a} knows three men in this region who would kill {a} and works around them calmly.",
        "{a} was offered better coin last month and did not take it, and told nobody.",
        "{a} said a contract is a contract in a tone that closed the subject.",
        "{a} taught the youngest how to stand a night watch without falling asleep in it.",
        "{a} has been on both sides of a Melvaunt wall and does not think it worth remarking.",
        "{a} looked at the north shore at dusk the way somebody looks at a place they will not go back to.",
      ],
      romance: [
        "{a} told {b} the name of the company and what it did, all of it.",
        "{a} said {b} should know what {a} had taken coin for before this went further.",
        "{a} turned down better coin in Melvaunt and told {b} the real reason.",
        "{a} walked {b} through the market at Melvaunt with a hand free, which means something here.",
        "{a} named {b} to the household as the person {a} answers to, and meant it.",
        "{a} brought {b} the first of something, which is what {a}'s people do instead of speaking.",
        "{a} used {b}'s name as a password on a contract, which is not how passwords are chosen.",
        "{a} taught {b} how to tell a Zhent from an honest man at forty paces.",
        "{a} put down a contract for the first time in eleven years and would not say why.",
        "{a} said the Moonsea had never given {a} anything and then looked at {b}.",
        "{a} made {b} something out of a thing that had been a weapon.",
        "{a} showed {b} the scar and gave the true account rather than the one that sells.",
        "{a} has stopped keeping the door in sight when {b} is in the room.",
        "{a} said {b} was clan, in Orcish, quietly, and {b} did not know what had been said.",
        "{a} asked {b} whether it would go badly for {b}, and meant the whole of it.",
        "{a} was asked by a Melvaunt man who {b} was and stood up before answering.",
        "{a} said if it came to leaving the region {a} would leave the region.",
        "{a} let {b} carry the coin, which {a} has never let anybody do.",
        "{a} told {b} about the three men who would kill {a}, by name.",
        "{a} stood with {b} looking north at dusk and did not look north.",
      ],
      taboo: [
        "{a} has stopped walking with {b} where the road can see them.",
        "{a} was asked about {b} and gave a detailed account of the gate repairs.",
        "{a} has been taking the night gate and the night gate is nobody's favourite post.",
        "{a} said it would put {b} on somebody's list, to nobody, and did not know it was said aloud.",
        "{a} has stopped going into Melvaunt on the days {b} goes.",
        "{a} keeps something of {b}'s where a search would not find it, which {a} has thought about.",
        "{a} said orcs on this coast do not court, and it is not true here either.",
        "{a} has been dealing with the household like an employer and with one person like neither.",
        "{a} started a quarrel with a hired man who had said nothing about anybody.",
        "{a} found a reason to be checking the gate whenever the hall talk turned personal.",
        "{a} has been washing at the trough before coming in, which is new.",
        "{a} said the household had been fair and that {a} would not repay it badly.",
        "{a} refers to {b} by the post now, the way {a} refers to men under contract.",
        "{a} was seen on the shore road at an hour nobody uses the shore road.",
        "{a} took a contract that keeps {a} out three nights and did not need to take it.",
        "{a} said some things are not for hired men and would not be argued out of it.",
        "{a} has been sleeping in the gatehouse and calling it the watch.",
        "{a} asked a Melvaunt man what such an arrangement would cost a person, and paid for the answer.",
        "{a} put the company token away somewhere new.",
        "{a} wrote a name on a contract's back and struck it out before signing.",
      ],
    },
  },
  dessarin: {
    // DESSARIN HUMANS. Waterdeep's breadbasket and its weak flank: fertile, sparsely settled,
    // UNDERDEFENDED. Triboar and Yartar are fortified and Red Larch is not. The valley feeds a city
    // that will send help if it can be bothered, and the standing local answer to trouble is to hire
    // adventurers, because there is nobody else. Farm people who have learned to price a sellsword.
    Human: {
      slice: [
        "{a} named the farmstead rather than the village and expected that to mean something.",
        "{a} said Waterdeep eats what this valley grows and forgets where it came from.",
        "{a} priced a caravan guard by looking at them, which farmers here learn young.",
        "{a} said Triboar has walls and Red Larch has a bell, and left the comparison there.",
        "{a} counted the summer's yield in what it would buy in guards rather than in coin.",
        "{a} was raised on stories of what came down out of the Sword Mountains.",
        "{a} distrusts adventurers and hires them anyway, which is the valley's whole politics.",
        "{a} knows every farmstead between here and Yartar and who is left at each.",
        "{a} said the Long Road is the only thing keeping this valley from being three valleys.",
        "{a} has helped bury somebody the militia did not reach in time.",
        "{a} said the harvest does not wait for a war and has proved it twice.",
        "{a} keeps a bill-hook by the door that is not for hedging.",
        "{a} was polite to a Waterdhavian factor and priced the grain twelve percent higher after.",
        "{a} said Amphail is nobles playing at farming, and was not entirely wrong.",
        "{a} looks at a stranger's horse before their face.",
        "{a} has an opinion about which farmsteads should be abandoned and does not share it.",
        "{a} said the valley is rich and cannot hold what it has, which is the whole problem.",
        "{a} can tell rain by the smell of the Dessarin and is right more than {a} is wrong.",
        "{a} works past dark in the season and will not be argued out of it.",
        "{a} looked north-west toward the mountains at the end of the day, which is not admiring.",
      ],
      romance: [
        "{a} named {b} to the farmstead, which is a smaller and more permanent thing than a village.",
        "{a} said {b} would be worth a season's guard-hire, which took {b} a moment to understand.",
        "{a} walked {b} the boundary of the land and named every stone on it.",
        "{a} said the harvest does not wait, and then let a day of it wait.",
        "{a} put {b}'s name in the ledger where the family names go.",
        "{a} took {b} into Triboar on market day and stayed past the safe hour to come back.",
        "{a} said Waterdeep forgets where the grain comes from and that {a} had stopped minding.",
        "{a} gave {b} the bill-hook by the door and showed {b} the other use for it.",
        "{a} said {b} had never once looked at a farmer as though farming were simple.",
        "{a} taught {b} to smell rain on the Dessarin and was insufferable about being right.",
        "{a} hired a guard {a} could not afford so that {b} would not travel alone.",
        "{a} said the valley cannot hold what it has and that {a} intended to hold this.",
        "{a} named the field {a} would build a house at the edge of.",
        "{a} worked past dark and stopped early, on the same day, for opposite reasons.",
        "{a} said {b} would like Yartar, and had clearly been planning Yartar.",
        "{a} priced nothing at all for a whole market day.",
        "{a} told {b} about the one the militia did not reach in time, all of it.",
        "{a} said the Long Road runs both ways and that {a} had stopped watching which.",
        "{a} put a second name on the seed order.",
        "{a} looked north-west toward the mountains with {b} and turned away first.",
      ],
      taboo: [
        "{a} has been out at the boundary at hours the boundary needs nothing.",
        "{a} was asked about {b} and gave the price of grain.",
        "{a} said it would be all round three farmsteads by market day, to nobody.",
        "{a} has stopped taking {b} into Triboar.",
        "{a} took {b}'s name back out of the ledger and put it in again the same evening.",
        "{a} went to see to the stock when the talk turned to who was walking out with whom.",
        "{a} has been hiring guards for journeys {a} used to make alone.",
        "{a} said the valley cannot hold what it has, and it was not about the valley.",
        "{a} was asked whether {a} was courting and named a yield.",
        "{a} has stopped naming the field.",
        "{a} started a quarrel with a factor who had quoted a fair price.",
        "{a} said 'it is a family matter' about a family that knows nothing of it.",
        "{a} keeps something in the seed store that is not seed.",
        "{a} has been unusually decent to the whole valley and short with one person.",
        "{a} worked past dark every night for a fortnight in a season that did not need it.",
        "{a} said 'it would go hard for them here' and would not say who.",
        "{a} has stopped smelling for rain, which was {a}'s one vanity.",
        "{a} put the bill-hook back by the door and moved it again the next day.",
        "{a} said 'it is nothing worth the harvest' about something {a} has lost a harvest's sleep over.",
        "{a} looked north-west toward the mountains for a long time and it was not about the mountains.",
      ],
    },
    Orc: {
      slice: [
        "{a} came down out of the Sword Mountains and everybody in this valley knows what comes down out of the Sword Mountains.",
        "{a} has been in Triboar on market day and did not enjoy it.",
        "{a} was asked which tribe and named one, and the room did not know the name, which was a relief.",
        "{a} knows the passes the raids use because {a} used them.",
        "{a} took the road watch without being asked and stayed on it past the hour.",
        "{a} was refused at an inn in Red Larch and walked on without a word.",
        "{a} said the valley farms better ground than the hills and left the rest unsaid.",
        "{a} counted the farmsteads between here and Yartar the way you count what can be defended.",
        "{a} was here the year Triboar burned and does not say which side of the wall.",
        "{a} eats what the valley eats now and has stopped remarking on how much of it there is.",
        "{a} named Gruumsh at a farmhouse table and the table changed the subject.",
        "{a} looked at the Sword Mountains at the end of the day and did not look long.",
        "{a} knows every man in this household who would rather {a} were not here.",
        "{a} carried a farmer's load two miles and was thanked with a nod and nothing else.",
        "{a} was asked whether {a} had kin up there and said probably.",
        "{a} keeps a hill weapon oiled and has never once brought it out.",
        "{a} said the Long Road is the only thing holding this valley together, and is right.",
        "{a} taught a valley boy to hold a spear properly and the boy's mother watched the whole time.",
        "{a} has been here six years and Red Larch still calls it 'that orc at the keep'.",
        "{a} stood a night watch alone by choice and gave no reason for the choice.",
      ],
      romance: [
        "{a} asked {b} plainly whether the valley would make it hard, and did not soften the question.",
        "{a} walked with {b} through Triboar on market day, in daylight, on purpose.",
        "{a} told {b} the name of the tribe and what happened to it.",
        "{a} said {b} was not to defend {a} to anybody, and {b} did anyway.",
        "{a} brought {b} the first of the harvest, which is what {a}'s people do instead of speaking.",
        "{a} taught {b} the hill word for something and laughed at {b}'s attempt.",
        "{a} said {a} would leave the valley if it came to that, and would not, and both knew it.",
        "{a} took {b} up to where the passes start and showed {b} the way {a} came down.",
        "{a} put the hill weapon in {b}'s hands and said what it had been for.",
        "{a} stopped taking the far watch on the nights {b} is in the hall.",
        "{a} said {b}'s name in the hill tongue, which is a shorter sound.",
        "{a} was asked by a Red Larch man who {b} was and stood up to answer.",
        "{a} has been kinder to the valley since a particular week and knows exactly why.",
        "{a} made {b} something from a thing that used to be a raiding tool.",
        "{a} told {b} what {a} did before, all of it, and waited.",
        "{a} said that if there were children they would be valley children, and meant it as a gift.",
        "{a} learned the farm work properly rather than adequately, which took a season.",
        "{a} let {b} see the scar and gave the true account of it.",
        "{a} said out loud that {a} had not expected the valley to give {a} anything.",
        "{a} stood with {b} looking at the mountains and did not look at the mountains.",
      ],
      taboo: [
        "{a} has stopped walking with {b} anywhere the road can be seen from.",
        "{a} was asked about {b} and gave a full account of the fence repairs.",
        "{a} has taken the far watch four weeks running and swapped into it twice.",
        "{a} said it would cost {b} the valley, to nobody, and did not know it had been said aloud.",
        "{a} stopped going to Triboar on market day.",
        "{a} has been very correct with the household and very quiet with one person.",
        "{a} started a quarrel with a farmhand who had said nothing about anybody.",
        "{a} keeps something of {b}'s where a search would not go.",
        "{a} was asked whether {a} was courting and said orcs in this valley do not.",
        "{a} has taken to washing at the trough before coming in, which is new.",
        "{a} left the hall the moment the talk turned to weddings.",
        "{a} said the valley had been fair to {a} and that {a} would not repay it badly.",
        "{a} has stopped naming {b} entirely, having named {b} constantly.",
        "{a} was seen on the Long Road at an hour when nobody is on the Long Road.",
        "{a} said some things are not for hill folk and would not be argued out of it.",
        "{a} has been sleeping in the barn and calling it the watch.",
        "{a} asked what the household would make of such a thing, hypothetically, and did not like the answer.",
        "{a} put the hill weapon away somewhere new.",
        "{a} said 'it is nothing' in the hill tongue where nobody could understand it.",
        "{a} went up toward the passes alone one afternoon and came back before dark.",
      ],
    },
  },
};

// ---- WHERE AN ADVENTURE HAPPENED (Frank, 2 Aug) -------------------------------------------------
// *"We could also trigger it for adventures impacting the staff... That would really make you feel
// part of the world!"*
//
// **The mechanism was easy and the DATA was the gap.** All 250 adventures in the catalogue carry a
// label, a tier and a summary and NO LOCATION — which is the same hole HANDOFF already flags as
// "Season 1 location extraction is incomplete". A per-adventure extraction is a real piece of work.
//
// A SEASON, HOWEVER, IS A PLACE. Organized play is built that way: a season picks a corner of the
// Realms and stays there for eighteen modules. Season 1 is Phlan, Season 8 is Waterdeep, Season 10
// is Icewind Dale. So the mapping is by SEASON — cheap, defensible, covers all 250, and verified
// against the module titles rather than assumed.
//
// **This is not a substitute for the per-adventure extraction**; it is the honest coarse version,
// and it is labelled as such so nobody mistakes it for the finished thing.
export const SEASON_REGION: Record<string, string> = {
  ddex01: "moonsea",        // Phlan — Tyranny of Dragons
  ddex02: "moonsea",        // Mulmaster — Elemental Evil
  ddex03: "moonsea",        // Hillsfar — Rage of Demons
  ddal04: "barovia",        // Curse of Strahd — the Mists
  ddal05: "silvermarches",  // Storm King's Thunder — the North
  ddal06: "chult",          // Tomb of Annihilation
  ddal07: "chult",          // Tomb of Annihilation
  ddal08: "waterdeep",      // Dragon Heist / Dungeon of the Mad Mage
  ddal09: "avernus",        // Descent into Avernus
  ddal10: "icewinddale",    // Rime of the Frostmaiden
  ddal00: "dalelands",      // Myth Drannor and the older tales
  ddep01: "dessarin",       // Kryptgarden
  ddep02: "moonsea",        // Mulmaster
  wbw: "feywild",           // The Wild Beyond the Witchlight
  drw: "underdark",         // Dreams of the Red Wizards / Myth Nantar
  pota: "dessarin",         // Princes of the Apocalypse — the Dessarin Valley
  tod: "swordcoast",        // Hoard of the Dragon Queen / Rise of Tiamat
};

export function adventureRegion(adventureId?: string | null): string | null {
  if (!adventureId) return null;
  const id = String(adventureId).toLowerCase();
  // Longest prefix first, so ddal09 does not match a hypothetical "ddal0".
  const keys = Object.keys(SEASON_REGION).sort((a, b) => b.length - a.length);
  for (const k of keys) if (id.startsWith(k)) return SEASON_REGION[k];
  return null;
}

// ---- AND WHAT THE HOUSEHOLD MAKES OF IT ---------------------------------------------------------
// Frank's larger point: a summons need not be lifetime membership. *"It could apply for any peoples
// dealing with a tragedy."* So when the party has been adventuring in somebody's HOMELAND, that
// somebody hears about it first, and hears it worse than the household does.
//
// STILL COSMETIC. This changes WHO is called and WHY, and nothing else — the DMG's Lost Hirelings
// empties a facility on its own schedule regardless. What it buys is the thing Frank named: the
// staff are part of the world the party is adventuring in, rather than furniture in a keep.
export const NEWS_FROM_HOME = [
  "{a} had the news out of {where} before the household did, and has been quiet since.",
  "Somebody came up the road with word from {where} and asked for {a} by name.",
  "{a} was asked what the news from {where} meant and gave an answer nobody wanted.",
  "{a} has been waiting on a letter from {where} for eleven days.",
  "{a} heard where the party had been and asked one question about it, and then no more.",
  "The word from {where} reached the kitchen before it reached the hall, and {a} was in the kitchen.",
];

// ═══════════════════ WHO IS AT THE GATE ════════════════════════════════════════════════════════
// Frank, 2 Aug, on the strangers-at-the-gate events: *"a person generator trimmed down to just a
// who-are-they spec, because it shapes their approach and the way the events read."* And then the
// consequence he spotted immediately:
//
//   *"What does that mean if you have giff defenders and you have giff attackers?! Ooooohhhhh spicy."*
//
// **It means they will not fight**, because the canon is unambiguous: *giff will never fight other
// giff.* Not a preference — the thing they are.
//
// ---- AND THIS IS COSMETIC, WHICH IS WHY IT CAN EXIST ------------------------------------------
// The DMG's Attack rolls dice to decide HOW MANY defenders fall. **It does not say which**, exactly
// as Lost Hirelings does not say why somebody left. Today the code takes `roster.slice(0, killedN)`
// — the first N, arbitrarily. Choosing differently changes no number: the same count dies, and the
// Exchange decides whose name is on it. Narration inside a rule the book wrote.
export const ATTACKER_KINDS: Record<string, Array<{ people: string; what: string; weight: number }>> = {
  // Drawn from who actually raids where. The people matters because it decides whether anybody on
  // the wall knows them.
  swordcoast:    [{ people: "Human", what: "road-bandits", weight: 5 }, { people: "Orc", what: "a hill band", weight: 3 }, { people: "Goblin", what: "a warren's raiding party", weight: 2 }],
  dessarin:      [{ people: "Orc", what: "a band down out of the Sword Mountains", weight: 6 }, { people: "Goblin", what: "a warren's raiding party", weight: 3 }, { people: "Human", what: "road-bandits", weight: 2 }],
  silvermarches: [{ people: "Orc", what: "a column out of the north", weight: 6 }, { people: "Human", what: "brigands off the Adbar road", weight: 2 }, { people: "Goblin", what: "a warren's raiding party", weight: 2 }],
  moonsea:       [{ people: "Human", what: "somebody's hired company", weight: 6 }, { people: "Orc", what: "Zhent auxiliaries", weight: 3 }, { people: "Goblin", what: "scavengers off the shore road", weight: 2 }],
  underdark:     [{ people: "Drow", what: "a raiding house", weight: 5 }, { people: "Duergar", what: "a duergar press-gang", weight: 4 }, { people: "Kobold", what: "a tunnel warren", weight: 3 }],
  icewinddale:   [{ people: "Human", what: "a raiding band off the tundra", weight: 5 }, { people: "Goblin", what: "a warren out of the Cairn", weight: 3 }],
  chult:         [{ people: "Goblin", what: "a warren out of the jungle", weight: 5 }, { people: "Lizardfolk", what: "a hunting party", weight: 4 }, { people: "Human", what: "somebody's expedition gone bad", weight: 2 }],
  waterdeep:     [{ people: "Human", what: "a gang out of the Dock Ward", weight: 6 }, { people: "Kobold", what: "something up out of the deeps", weight: 2 }],
  neverwinter:   [{ people: "Human", what: "brigands off the east road", weight: 5 }, { people: "Orc", what: "a band out of the Crags", weight: 4 }],
  avernus:       [{ people: "Imp", what: "somebody else's contracted skirmishers", weight: 4 }, { people: "Human", what: "a broken company off the Blood War line", weight: 4 }, { people: "Orc", what: "a warband on somebody's paper", weight: 3 }],
  feywild:       [{ people: "Other Fey", what: "something that took offence", weight: 5 }, { people: "Goblin", what: "a warren that remembers the Feywild", weight: 3 }, { people: "Satyr", what: "a revel that turned", weight: 2 }],
  wildspace:     [{ people: "Giff", what: "a giff platoon on somebody's contract", weight: 4 }, { people: "Orc", what: "scro boarders", weight: 4 }, { people: "Human", what: "pirates off a hammerhead", weight: 3 }],
  barovia:       [{ people: "Human", what: "the Baron's men, or men who say they are", weight: 5 }, { people: "Other Fey", what: "something out of the mist", weight: 3 }],
  cormyr:        [{ people: "Human", what: "outlaws the Purple Dragons have not caught", weight: 6 }, { people: "Goblin", what: "a warren nobody had reported", weight: 2 }],
  dalelands:     [{ people: "Human", what: "riders with no dale's badge on them", weight: 5 }, { people: "Orc", what: "a band out of the Stonelands", weight: 3 }],
  heartlands:    [{ people: "Human", what: "road-bandits", weight: 6 }, { people: "Orc", what: "a hill band", weight: 3 }, { people: "Goblin", what: "a warren's raiding party", weight: 2 }],
  baldursgate:   [{ people: "Human", what: "somebody's hired knives", weight: 6 }, { people: "Goblin", what: "something up from the sewers", weight: 2 }],
};
export const ATTACKER_DEFAULT = [{ people: "Human", what: "road-bandits", weight: 1 }];

export function rollAttacker(region?: string | null, rnd: () => number = Math.random) {
  const pool = (region && ATTACKER_KINDS[region]) || ATTACKER_DEFAULT;
  const total = pool.reduce((n, x) => n + x.weight, 0);
  let r = rnd() * total;
  for (const x of pool) { r -= x.weight; if (r <= 0) return x; }
  return pool[pool.length - 1];
}

// ---- WHO WILL NOT FIGHT WHOM --------------------------------------------------------------------
// **Canon only.** The giff rule is stated outright in the sources and is absolute; nothing else here
// is invented to keep it company, because a table of house-ruled pacifisms would be the Exchange
// putting words in the books' mouths. If another people acquires a documented one, it goes here.
export const WILL_NOT_FIGHT: Record<string, string[]> = {
  Giff: ["Giff"],   // "Giff will never fight others of their own kind." Not a tendency.
};
export const wontFight = (defender?: string | null, attacker?: string | null) =>
  !!(defender && attacker && (WILL_NOT_FIGHT[defender] || []).indexOf(attacker) !== -1);

// What the household sees when it happens. {d} is the defender, {w} is what came.
// What the household sees when it happens. {d} is the defender; {w} is what came, and the `what`
// strings already carry their own article ("a giff platoon...") — so a line must never put one in
// front of {w}, which produced "The a giff platoon broke off at the gate" on the first pass.
export const STOOD_DOWN_SAY = [
  "{d} went to the wall, looked over it, and came back down. Whatever was out there did not come further and did not leave for some hours.",
  "There was a great deal of shouting between {d} and {w}, and not one shot fired, and both sides withdrew looking satisfied.",
  "{d} would not take the wall and would not explain, and the household has since learned why and stopped asking.",
  "The attack broke off at the gate. Somebody out there recognised {d}, or {d}'s markings, and that was the end of it.",
  "{d} saluted across the ditch. The salute was returned. Everybody else found the whole business unbearable.",
  "{d} spent the night on the wall and did not once raise a weapon, and came down in the morning unmarked and unwilling to talk about it.",
];

// ---- A HOUSEHOLD THAT CANNOT KEEP A SECRET, BECAUSE IT CANNOT HAVE ONE -------------------------
// ⚠ Found by auditing every event against a called household (2 Aug). Two of them narrate the
// household as a SOCIAL BODY — *"the hirelings have closed ranks about it"* and *"the household is
// being extremely casual about it, which is how you know somebody knows"* — and a household of
// skeletons is not one. Closing ranks is a decision. Being casual is a performance.
//
// The event is unchanged: the same item arrives, at the same value, on the same roll. Only the
// sentence about what the household MADE of it changes, because a mindless household made nothing
// of it at all — and that absence is its own kind of unsettling.
export const NO_WITNESS_SAY = [
  // ⚠ CONTINUATIONS, lower-case. Both call sites append these after "...and " or after a full stop
  // plus a space, and the first pass wrote them as sentences — producing "and The household worked
  // around it all morning". A line that does not know where it will be placed cannot be capitalised.
  "not one of them has reacted to it in any way, which is somehow worse than a conspiracy",
  "nobody here is capable of having put it there, and it is there",
  "the household worked around it all morning without any of them looking at it",
  "there is nobody to ask, and there was nobody to ask when it arrived either",
  "it was moved twice, correctly, by things that had no opinion about moving it",
  "whatever happened, it happened in a house with no witnesses in it",
];

// ---- WHEN THE OFFICIALS COME FOR A THING RATHER THAN A PERSON -----------------------------------
// Frank, 2 Aug: *"The criminal hirelings event should turn to the possession of a mindless servant
// and cost a permitting fee."*
//
// **A warrant is for a person.** You cannot arrest a skeleton, and the officials who turn up at a
// necromancer's gate are not there about a crime it committed — they are there about the fact that
// it exists, in this jurisdiction, without paperwork. Same event, same roll, same money leaving the
// house; a completely different conversation.
//
// The DMG's own event costs 1d6x100 gp or loses the hireling. This keeps both halves exactly: pay
// the fee and keep it, or fail to pay and it is impounded — which for a bound thing means destroyed
// or confiscated, and either way it is not coming back.
export const PERMIT_FLAVOR = [
  "was inspected at some length by two officials who had brought a form for it",
  "turned out to require a licence that nobody in the household had heard of",
  "was measured, catalogued and assigned a number by a clerk who did this all day",
  "was found to be undeclared, which is apparently a separate matter from being unlawful",
  "was the subject of a very long conversation about which office it fell under",
  "stood entirely still through the whole inspection, which the officials found unnerving",
  "was cited under an ordinance written before anybody present was born",
  "was the reason a surveyor came out, and the surveyor brought a colleague",
];
export const PERMIT_KEPT = [
  "The household paid the fee and it went back to work the same afternoon.",
  "The fee was paid, a certificate was issued, and the certificate is now nailed to the workshop door.",
  "The household paid, and has been told the licence is annual.",
];
export const PERMIT_LOST = [
  "There was no fee in the house. It was impounded at the gate and the household has not asked what became of it.",
  "Nobody could pay, and it was taken apart on the spot by somebody who had clearly done it before.",
  "The fee could not be raised. It was led away, and it went, because it was told to.",
];

// ---- WHAT IS STILL THERE WHEN NOBODY IS (Frank, 2 Aug) ------------------------------------------
// *"When the estate falls into ruin that population will remain with the ruins, because they don't
// run off. Undead are programmed to obey a fixed task and that's all they do, and they will keep
// doing it well past the point that the building is still occupied. Creatures with minds would
// realise the place is no longer occupied and would turn back to their natural behaviour. While the
// player character is still alive, that location will still be obedient."*
//
// **Three rulings in one, and the third is the load-bearing one.**
//
//   1 · A MINDLESS THING NEVER ABANDONS A POST. `bleedAbandonedStaff` picked anybody at random,
//       including a skeleton — which would have a skeleton "leaving", the thing Frank has already
//       ruled cannot happen. It stays, and it keeps working, and that is what makes a ruin haunted
//       rather than empty.
//
//   2 · A MINDED THING REVERTS. It notices nobody is coming back and goes back to being what it was
//       before somebody bound it. That is not a departure either — a pterafolk does not resign, it
//       simply stops being staff and starts being a pterafolk in a ruin.
//
//   3 · AND THE BINDING IS TO THE CHARACTER, NOT THE BUILDING. While the hero lives, the place is
//       obedient. So this is not decay on a timer; it is what happens when nobody is left to be
//       obedient TO.
export const RUIN_REMAINS = [
  "{a} is still at the post. The roof is down and {a} is still at the post.",
  "{a} has been doing the same work in the same room for eleven years and has not been told to stop.",
  "{a} sets out the tools each morning in a workshop with no walls left.",
  "{a} still walks the round, past rooms that have not existed for some time.",
  "{a} is carrying something to a store-room that fell in two winters ago.",
  "{a} stands where it was left. It will be standing there when the last of the roof goes.",
];
export const RUIN_REVERTS = [
  "{a} understood that nobody was coming back, and went",
  "{a} stopped keeping the hours somebody else had set and has not kept them since",
  "{a} is still here and is no longer staff, which is a different arrangement entirely",
  "{a} went back to what {a} was before the household, which took about a week",
  "{a} took what was owed, in {a}'s own reckoning, and left",
];

// ---- HOW A CALLED THING STOPS BEING PRESENT -----------------------------------------------------
// ⚠ Found by asking whether the chosen-hire feature was actually finished (2 Aug). It was not: Lost
// Hirelings gave the risen the ORDINARY reasons, and a skeleton *"quarrelled with someone about
// something and would not be talked round"*, *"took the dropsy in the cold months"*, and — best of
// all — *"was owed better and knew it."*
//
// **A called thing does not quit, sicken, argue or feel underpaid.** It stops being present because
// the binding failed, the term ran out, something destroyed it, or somebody put it down. The DMG
// still decides HOW MANY leave; this decides what happened, exactly as `CALLED_HOME` does for a
// hireling with a homeland.
// ⚠ NO {a} SLOT HERE. The caller prepends the name — `first.name + " " + r.text` — exactly as
// `hirelingLossReason` does, so these are CONTINUATIONS of a sentence that has already named
// somebody. The first pass carried {a} as well and produced "Ilsa Duskwater Ilsa was recognised".
export const LOST_CALLED: Record<string, string[]> = {
  undead_lesser: [
    "came apart at the joints mid-task and did not get up again",
    "stopped in the middle of the yard and has not moved since; the binding has simply run out",
    "was put down by a visiting priest who did not ask first",
    // ⚠ WAS "walked into the river on an errand and did not come out the other side" — which reads as
    // a thing LEAVING. Frank: *"mindless should never leave. Be destroyed? Yes."* It went into the
    // river because it was told to and stayed there because nothing told it otherwise; that is a
    // destruction, not a departure, and the line now says so.
    "was sent across the ford and went straight in, because nothing told it to stop, and is still down there",
    "was found in pieces and nobody in the household is saying who",
  ],
  undead_greater: [
    "went out at dusk and did not come back, which it had always been free to do",
    "was recognised by somebody from before, and left rather than be recognised twice",
    "was destroyed by somebody who thought they were doing the household a kindness",
    "said the hunger had got past managing, and went where it could not reach anybody here",
    "finally answered a question about what it wanted, and the answer was elsewhere",
  ],
  fiends: [
    "served the term out to the hour, and was gone on the hour",
    "found the clause everybody had missed and left entirely within its terms",
    "was recalled by whatever holds the other end of the contract",
    "was banished by a visitor who had come prepared",
    "completed the letter of an instruction and considered the arrangement discharged",
  ],
  fey: [
    "was owed a courtesy that nobody remembered to give, and went",
    "left by a path that was not there the day before",
    "said the season had turned and that this settled it",
    "was called back by whoever sent it, with no notice and no explanation",
    "took offence at something nobody else had noticed happening",
  ],
  aberrations: [
    "was gone in the morning and the door had not been opened",
    "stopped doing the work and started doing something else, and then was not there",
    "was drawn back to whatever sent it, mid-sentence",
    "was destroyed by the household, which has agreed not to discuss it",
    "went down into the cellar and the cellar has been checked twice",
  ],
  constructs: [
    "stopped, and cannot be started, and nobody here knows the word",
    "wore through a joint that has not been made in sixty years",
    "carried out its last instruction and is now simply standing there",
    "was taken apart by its maker, who came for it and said very little",
    "was damaged past what the household can repair and is stacked in the storeroom",
  ],
  elementals: [
    "was gone the moment the binding lapsed, before anybody could say goodbye, which it would not have wanted",
    "was recalled by the one whose word held it here",
    "guttered out — there was very little left of it by the end of the winter",
    "completed the term to the day and did not stay a minute past it",
    "was banished by a visitor who mistook it for a problem",
  ],
};
export const lostCalled = (pool?: string | null) => (pool && LOST_CALLED[pool]) || null;

// Which pool a called people came out of — so the departure reason matches what it actually is.
export function poolOfSpecies(sp?: string | null): string | null {
  if (!sp) return null;
  for (const [k, pool] of Object.entries(CHOSEN_HIRE_POOLS)) if (pool.peoples.indexOf(sp) !== -1) return k;
  return null;
}

// ---- CALLED HOME (Frank, 2 Aug) ------------------------------------------------------------------
// He noticed it the moment the regional overlays existed: *"sounds like the lost hirelings event
// needs to include called to service by their nation?"* Yes — and once a hireling has a HOME with a
// war in it, "the cause of their departure is up to you" acquires an obvious answer the generic
// table could never give.
//
// **THIS IS STILL COSMETIC.** The DMG's Lost Hirelings already empties a facility and says outright
// that the cause is the DM's to choose. The Exchange is choosing WHICH person and WHY — narration
// inside a rule the book wrote. Nothing is granted, withheld or altered; the post empties on the
// book's schedule either way. See the ruling at the top of Layer 2.
//
// Keyed by species AND region, because a summons comes from somewhere: a Starcastle is recalled by
// a navy, a Marches dwarf by a clan, a Many-Arrows orc by a king he may not want to answer.
export const CALLED_HOME: Record<string, Record<string, string[]>> = {
  silvermarches: {
    Dwarf: [
      "was called to Adbar. The letter had the clan seal on it and was four lines long",
      "went north with a column out of Felbarr and did not say for how long",
      "was recalled by the hold. Nobody here knows which hold, and {a} did not say",
      "answered a muster {a} had been ignoring for two years and could not ignore a third time",
    ],
    Elf: [
      "was summoned to Silverymoon on a matter that predates this household by some centuries",
      "went south to the Court on a letter that arrived in the old hand",
      "was called to a gathering of {a}'s own people and did not say whether {a} would come back",
      "took ship for the Green Isle after all, having said for ninety years that {a} would not",
    ],
    Orc: [
      "was called north. {a} did not say by whom and nobody was rude enough to ask",
      "went up toward Many-Arrows on a summons {a} had clearly been dreading",
      "answered a call from the tribe and left the keep's kit folded on the bed",
      "was sent for by kin {a} had told this household were all dead",
    ],
  },
  waterdeep: {
    Dwarf: ["was called to the Guild on a matter that took {a} out of the city entirely",
            "went north to a hold {a} has never seen, on a letter {a} had been expecting for years",
            "answered a summons from the family and left the Field Ward rooms paid three months on"],
    Elf: ["was called to Evereska on a matter of the old blood",
          "went to the Court in Cormanthor and did not say when",
          "answered a letter from the Green Isle that {a} had left unopened for three days"],
  },
  wildspace: {
    Elf: ["was recalled to the Fleet. The order came in Fleet slang and {a} read it twice",
          "shipped out on an armada that put in for one tide and would not wait",
          "was called back to Lionheart, wherever Lionheart is this year",
          "answered a muster {a} has been technically subject to for the whole time {a} has been here"],
    Dwarf: ["was called back to the Rock. The Starcastles had a contract and the contract had {a}'s name on it",
            "shipped out to fit stone into something that was leaving the ground",
            "was sent for by the family, three spheres away, and went the same week"],
  },
  icewinddale: {
    Dwarf: ["was called down to the Dwarven Valley by the Dain, which does not happen for small things",
            "went back to the clan. It is a small clan and it had counted {a} and found {a} missing",
            "answered a summons from the two halls and took the Cragdrop road in weather"],
  },
  moonsea: {
    Orc: ["was called back by a company {a} had told everybody was disbanded",
          "took a contract {a} would not describe and left the same night",
          "was sent for by somebody in Melvaunt whose name {a} would not say"],
  },
  dessarin: {
    Orc: ["went up into the Sword Mountains on a summons and did not say from whom",
          "was called back to the hills. {a} took the hill weapon, which {a} had never once brought out",
          "answered kin {a} had said were probably dead"],
  },
};

export const calledHome = (sp?: string | null, region?: string | null) =>
  ((region && sp && CALLED_HOME[region] && CALLED_HOME[region][sp]) || null);

export const regionalFlavor = (sp?: string | null, region?: string | null, kind: string = "slice") => {
  const k = kinOf(sp);
  return ((region && k && REGIONAL_FLAVOR[region] && REGIONAL_FLAVOR[region][k] && (REGIONAL_FLAVOR[region][k] as any)[kind]) || null);
};

export const SPECIES_FLAVOR_DEFAULT = {
  romance: ["{a} found a reason to be where {b} was, and did not need one."],
  taboo: ["{a} said nothing about {b} at all, which was itself worth noticing."],
};
// ---- KINDRED PEOPLES ----------------------------------------------------------------------------
// ⚠ Frank, 2 Aug: *"So did you finish those two?"* — and the honest answer was no. I had ruled that
// Astral Elf and Eladrin do not need base tables because they are ELVES IN TWO PLACES and both
// places are written. **That reasoning is right and the code did not implement it.** Both resolved
// to nothing at all — no base, no overlay — and fell through to the facility line, which means the
// ruling existed only in my head and in a comment.
//
// A ruling that the code does not implement is not a ruling. This is the map that makes it one.
//
// A kindred people draws its KINSMAN'S tables. It keeps its own name pool, faith, biology, pairing
// and openness — everything that actually distinguishes it — and shares the voice, because the voice
// is what they genuinely have in common.
// ---- A BUCKET IS NOT A NAME (Frank, 2 Aug) ------------------------------------------------------
// *"Other Devil and Other Fey should never appear as the race on anything. It is like saying my name
// is nonashi. It's a bucket, not an item."*
//
// **He is right and it was reaching play**: 196 of 1000 Feywild hires and 125 of 1000 Avernus hires
// were literally named `Other Fey` and `Other Devil` on the roster. A player looked at their
// household and saw a CATEGORY standing in the kitchen.
//
// The buckets stay — they are how the demographic tables say *"and some other fey"* without
// enumerating every fey in the multiverse, and they carry the shared culture that the named ones kin
// to. **What changes is that the bucket resolves to a NAME the moment somebody is actually hired.**
// The table says "some other fey"; the person says "a boggle".
//
// These are named peoples the sources already have. Nothing invented, and each keeps the bucket's
// voice because that is exactly what the bucket's voice was written for.
// ⚠ AND THE FIRST LIST HAD ANIMALS IN IT (Frank, 2 Aug): *"blink dog is an animal... hellcats are
// also animals."* Both removed — a blink dog is a Fey-type BEAST and a hellcat is a fiendish cat, and
// neither is somebody you employ. Same category error as the warhorse skeleton, twice, in a list I
// wrote ten minutes after being corrected about it.
//
// **Sea Hag also left**: it is a HAG, and Hag is already a written people with its own voice. It was
// pointing at the fey bucket when a better table existed — so it is kinned to Hag instead of being
// resolved to as an "other".
//
// ⚠ SOURCING, SETTLED (Frank, 2 Aug): most of these are published peoples that are not SRD-licensed,
// and that is fine. *"They are safe to name because we are not reproducing them or any of their
// presentation."* The platform holds a NAME and its own writing about somebody with that name — no
// stat block, no ability scores, no CR, no art, no descriptive prose. See EXCHANGE_PRODUCTION_
// STANDARD §10, and the test it gives: could a reader reconstruct the published entry from what we
// hold? If not, the name is a reference rather than a reproduction.
// ---- THE UNDEAD CARRY THEIR ORIGINAL NAMES (Frank, 2 Aug) ---------------------------------------
// *"The undead carry their original names, so that's fine."*
//
// **Which settles the naming question and then opens a smaller one.** An original name is the name of
// whoever they WERE, and that person was a local — so a skeleton raised in Chult should be named the
// way a living Chultan is, not out of a generic pool. Before this, a skeleton raised in Chult came
// out "Aldric Rushmoor", which would suit a Cormyrean farmhand.
//
// So an undead is named as though it were a living person of the region it was raised in: draw a
// living local people, use ITS naming culture, and keep the name. **The corpse was somebody, and
// somebody was from here.**
export const RAISED_FROM_LIVING = new Set([
  "Skeleton", "Zombie", "Minotaur Skeleton", "Crawling Claws",
  "Ghoul", "Ghast", "Wight", "Specter", "Wraith", "Vampire Spawn",
]);
export const wasAliveOnce = (sp?: string | null) => !!(sp && RAISED_FROM_LIVING.has(sp));

export const BUCKET_RESOLVES: Record<string, string[]> = {
  "Other Fey": ["Boggle", "Darkling", "Meenlock", "Korred"],
  // ⚠ NUPPERIBO REMOVED TOO. It is blind, mindless and moves only where the swarm moves — it can
  // hold no post and no wall, so a bucket resolving to it is the "pool advertises what it cannot
  // supply" defect in a new costume. It stays in SPECIES_ROLES as a people that EXISTS; it is simply
  // never what "some other devil" turns out to be.
  "Other Devil": ["Merregon", "Abishai", "Amnizu", "Orthon"],
};
// ⚠ AND THE RESOLVED NAMES MUST INHERIT THE BUCKET, or the fix is worse than the fault. The first
// pass traded one bad name for **twelve silent peoples with human biology** — each of them a genuine
// people the tables now produce, with no voice, no lifespan and no roles.
//
// They kin to the bucket, which is the whole reason the bucket has a written culture: `Other Fey`'s
// voice was always meant to cover *"the fey whose names the tables do not enumerate."* It just had to
// stop being the name itself.
export const BUCKET_KIN: Record<string, string> = {
  Boggle: "Other Fey", Darkling: "Other Fey", Meenlock: "Other Fey", Korred: "Other Fey",
  "Sea Hag": "Hag",           // a hag is a hag; it had a better table than the fey bucket all along
  Merregon: "Other Devil", Nupperibo: "Other Devil", Abishai: "Other Devil",
  Amnizu: "Other Devil", Orthon: "Other Devil",
};

export function resolveBucket(sp?: string | null, rnd: () => number = Math.random, defId?: string | null, job?: "hire" | "defend"): string {
  // ⚠ AND IT MUST RESPECT THE ROOM — the FIFTH door into hiring, discovered the same way as the other
  // four. The bucket was resolving to a meenlock and dropping it in a smithy, because resolution ran
  // AFTER the room test had already approved "Other Fey" and nothing re-checked the name it became.
  //
  // **A substitution is a hire.** Whatever comes out has to pass the same tests as whatever went in.
  const all = (sp && BUCKET_RESOLVES[sp]) || null;
  if (!all) return sp || "";
  const pool = all.filter((x) => (job === "defend" ? speciesCanDefend(x) : speciesCanHireAt(x, defId)));
  const use = pool.length ? pool : all.filter((x) => speciesCanDefend(x));
  if (!use.length) return sp || "";
  return use[Math.floor(rnd() * use.length)];
}
export const isBucket = (sp?: string | null) => !!(sp && BUCKET_RESOLVES[sp]);

export const SPECIES_KIN: Record<string, string> = {
  "Astral Elf": "Elf",
  "Eladrin": "Elf",
  "Shadar-kai": "Elf",
  "Half-Vistani": "Human",
  "Dark Fey": "Other Fey",          // the Gloaming carries the difference, not the species
  "Pixie": "Other Fey",
  "Sprite": "Other Fey",
  "Redcap": "Other Fey",
  // ⚠ QUICKLING had no voice at all. It was `hire: false` until the Tiny question was resolved by the
  // three tests, became employable, and **nothing came back to give it a table** — the write-half of
  // the same defect that has bitten five times today. Dark Fey is the right register: malicious,
  // fast, and unbothered about being either.
  // ⚠ AND IT MUST POINT AT A TABLE, NOT AT ANOTHER KIN ENTRY. `kinOf` does not chain — pointing
  // Quickling at Dark Fey pointed it at a signpost, and it stayed silent. **A one-step lookup means
  // every kin entry must name a people that has actually been written.**
  Quickling: "Other Fey",
  // The twelve names the buckets resolve to. Each kins back to the bucket whose culture it belongs
  // to — see BUCKET_KIN, and the note there about why the first pass was worse than the fault.
  Boggle: "Other Fey", Darkling: "Other Fey", Meenlock: "Other Fey", Korred: "Other Fey",
  "Sea Hag": "Hag",
  Merregon: "Other Devil", Nupperibo: "Other Devil", Abishai: "Other Devil",
  Amnizu: "Other Devil", Orthon: "Other Devil",
  // A dryad can take a post in the yard now, so she needs a voice — and hers is the fey register.
  // Dryad has her own table now — she has an oak, and that is nobody else's line.
  // ⚠ THE DEVIL RANKS ARE ONE CULTURE (Frank, 2 Aug): *"there will be differences between the ranks
  // just like there are differences between the cultures of military ranks, but not huge
  // differences."* One table, five kin, and DEVIL_RANK for what each actually does.
  //
  // The BEARDED devil keeps its own table, because it was written before the ruling and its voice —
  // an enormous temper on a very short rein — is genuinely its own rather than a rank detail.
  "Barbed Devil": "Other Devil",
  "Spined Devil": "Other Devil",
  "Chain Devil":  "Other Devil",
  "Bone Devil":   "Other Devil",
  "Horned Devil": "Other Devil",
  // THE RETURNED ARE ONE CULTURE, like the devil ranks: what separates a ghoul from a wight is
  // appetite and rank, not upbringing — none of them had one.
  // The made kin to the autognome: a thing with a maker rather than a mother.
  Homunculus: "Autognome",
  // NOT Animated Armor: it is MINDLESS, so it gets MINDLESS_SAY and no voice at all. A homunculus is
  // awake — the sources give it a personality and a bond to its maker — and an animated breastplate
  // is not. Kinning it here would have handed a walking suit of armour an inner life.
  // The mephits and the Azer are awake, insolent and bound — the imp's register fits them exactly:
  // somebody serving a term, counting it, and with opinions about the filing.
  "Dust Mephit": "Imp",
  "Ice Mephit": "Imp",
  "Magma Mephit": "Imp",
  "Steam Mephit": "Imp",
  // ⚠ MAGMIN (INT 8) AND GARGOYLE (INT 6) were flagged minded, could hold a wall, and had NO voice —
  // so they would have appeared in the narration by name with nothing to say. Both are BOUND things
  // serving a term, which is exactly the imp's register: somebody counting the days with opinions
  // about the filing.
  Magmin: "Imp",
  Gargoyle: "Imp",
  Azer: "Dwarf",          // a smith of the elemental planes, and reads as one
  // ⚠ Otyugh was kinned to OTHER FEY — an aberration wearing a fey's voice, which is simply wrong.
  // It is INT 6 and telepathic and it BARGAINS, so it is not mindless either, and removing the bad
  // kin left it holding a wall with nothing to say.
  //
  // LIZARDFOLK is the right voice and it is not a compromise: *"said a dead thing is meat and a live
  // thing is a problem, and meant it as a system"*, *"ate the part of the meal everybody else had
  // set aside"*, *"answered a question about feelings with a question about the work, sincerely."*
  // An otyugh eats the refuse and is glad of the arrangement. That is the same register exactly.
  Otyugh: "Lizardfolk",
  "Ghoul": "Wight",
  "Ghast": "Wight",
  // Vampire Spawn has its own — grave earth, a night shift and a blood supply are not a wight's.
  "Specter": "Wight",
  "Wraith": "Wight",
  "Hobgoblin": "Goblin",
  "Bugbear": "Goblin",
  "Caliban": "Human",
  "Duergar": "Dwarf",
  "Wild Dwarf": "Dwarf",
  "Svirfneblin": "Gnome",
  "Half-Orc": "Orc",
};
export const kinOf = (sp?: string | null) => (sp && SPECIES_KIN[sp]) || sp || null;

export const speciesFlavor = (sp: string | null | undefined, kind: "slice" | "romance" | "taboo") => {
  // ⚠ A THING THAT DOES NOT ROMANCE HAS NO ROMANCE LINE — AT THE SOURCE (Frank, 2 Aug). He flagged
  // the darkmantle: *"if they do get romantically involved with anything other than another
  // darkmantle... we need to be very careful how we apply the romance chart to this creature."*
  //
  // The slice table was taught to return null for an unauthored people this morning. **Romance and
  // taboo never were**, so every mindless thing in the game had a romance line available through the
  // default — a rug of smothering *"found a reason to be where {b} was, and did not need one."*
  //
  // Closed HERE rather than per-people, because the darkmantle is one instance of a class and the
  // per-people fix would have left the other five. `SPECIES_AXES` already knows who romances; this
  // is the lookup finally asking.
  // ⚠ AND THE GATE IS `mindless`, NOT `romances` — the first pass used both and hid tables that had
  // been deliberately written. **`romances: false` means NO MARRIAGE, not NO ATTACHMENT**, and the
  // two are different things I had been letting one flag carry:
  //
  //   thri-kreen   romances: false   *"said {b} was clutch, and had to explain how large a thing
  //                                    {a} had just said"*        — profound, and not courtship
  //   autognome    romances: false   *"told {b} what the maker was like"*  — devotion, no marriage
  //   quaggoth     romances: false   canon: *"no courtship or mating rituals"* — and it still bonds
  //
  // What has NO attachment narration is a thing with no inner life, and that is exactly `mindless`.
  // Frank's darkmantle is INT 2 and mindless, so his concern is covered completely by the narrower
  // rule — which is the one that was actually true.
  // ⚠ AND THE SLICE TABLE TOO. This checked only romance and taboo, so a mindless people whose KIN
  // had a written table inherited a full voice — the nupperibo came out with twenty lines about
  // filing and terms of service. Harmless in practice, because the chore loop tests `doer.mindless`
  // before it gets here, but a latent contradiction: the data said one thing and the caller another.
  if (speciesMindless(sp)) return kind === "slice" ? null : null;
  const k = kinOf(sp);
  return (k && SPECIES_FLAVOR[k] && SPECIES_FLAVOR[k][kind]) || (kind === "slice" ? null : (SPECIES_FLAVOR_DEFAULT as any)[kind]);
};

// ---- AND THE FACILITY TABLES SPLIT BY ORDER -----------------------------------------------------
// Frank: *"each room gets its own chores list, craft list, research list, harvest list... a blacksmith
// has chores that are done when the blacksmith is just maintaining itself, and crafting which is done
// only when there is an active project. The blacksmith does not have trading or research so those
// don't apply. A bedroom just has chores."*
//
// **Today there is ONE table per facility per form**, so the same chore lines print whether the room
// spent the week maintaining, crafting or researching — a smithy sweeping shavings during the week it
// forged a blade. `fac.lastOrder` already records which order ran; nothing read it for flavour.
//
// A facility declares only the kinds it HAS. `chores` is the fall-through and every room has it.
export const ORDER_KINDS = ["chores", "craft", "research", "harvest", "trade"];
export const FACILITY_ORDER_TASKS: Record<string, Record<string, string[]>> = {
  smithy: {
    craft: [
      "The forge ran hot all week and {a} did not let it drop once.",
      "{a} drew the same billet out four times and was not satisfied until the fifth.",
      "There is a shape in the {room} that was a bar on Monday.",
      "{a} quenched something at an hour when nobody else was awake to hear it.",
    ],
  },
  archive: {
    research: [
      "{a} has three volumes open at once and a fourth held down with a stone.",
      "{a} found the thing, and then spent two days finding out whether the thing was true.",
      "{a} has been talking to the shelves. The shelves have been unhelpful.",
    ],
  },
  garden: {
    harvest: [
      "{a} brought in more than the baskets would hold and made two trips about it.",
      "{a} took only what was ready and left the rest, and was asked about it, and explained at length.",
    ],
  },
};
export const facilityOrderTasks = (defId?: string | null, order?: string | null) => {
  const t = defId ? FACILITY_ORDER_TASKS[defId] : null;
  if (!t || !order) return null;
  const kind = order === "maintain" ? "chores" : order;
  return t[kind] || null;
};

// ---- SENDING AND RECEIVING ----------------------------------------------------------------------
// Frank: *"when we're talking about a relationship based role, we are going to be generating two
// sentences — sending affection, receiving affection."*
//
// **That is the asymmetry made visible in the prose**, and it is the right shape for the same reason
// bonds are per-person: what one of them did and what the other one felt are two different facts, and
// a single sentence collapses them. It also lets a gesture LAND BADLY, which one sentence cannot say.
export const RECEIVING = {
  warm: [
    "{b} noticed, and has been quietly pleased with themselves about it ever since.",
    "{b} did not say anything, and has not stopped thinking about it.",
    "{b} said thank you twice, which was once more than the thing warranted.",
  ],
  unsure: [
    "{b} noticed, and has not decided what to make of it.",
    "{b} thanked {a} in the way you thank somebody when you are not certain what has happened.",
    "{b} has been turning it over and has not turned it the right way up yet.",
  ],
  missed: [
    "{b} did not notice at all, which is its own small tragedy.",
    "{b} thought it was the roster's doing and said so, pleasantly, to {a}.",
    "{b} assumed somebody else had done it and thanked the wrong person.",
  ],
};

// ---- THE SHAPES A GLIMPSE TAKES -----------------------------------------------------------------
// Frank, 1 Aug, and this is the writing instruction the earlier tables were missing:
//
//   *"Someone lingering too long, someone visiting a workstation too frequently, someone being extra
//    friendly with a person they have no reason to be, someone doing a favour without any reciprocal
//    expectation, romantic gestures without actually saying romance... things that others could pick
//    up on if they were more observant, BUT THINGS THEY WOULD DISMISS because the arrangement itself
//    is so far-fetched that they wouldn't expect it to be true."*
//
// **That last clause is the one that makes them work.** A glimpse is not a clue nobody saw — it is a
// clue somebody saw and EXPLAINED AWAY. Half the lines below carry the household's own innocent
// reading of what it just witnessed, which is why the player can catch what the household cannot.
//
// Five shapes, universal to any taboo, so they compose with the kind-specific tables rather than
// needing five copies of each. {a} and {b} are the pair.
export const GLIMPSE_SHAPES: Record<string, string[]> = {
  lingering: [
    "{a} stayed behind to bank the fire, which takes a moment, and was still there a good while later.",
    "{a} was last out of the yard again. Somebody has started leaving the lamp for them without being asked.",
    "{b} took the long way back from the well. It is not a better way and the weather was not good.",
    "The two of them finished the job and then kept talking about the job, at some length, after it was finished.",
    "{a} has been very slow at a task {a} is normally quick at, and only on the days {b} is working near it.",
  ],
  visiting: [
    "{a} has had cause to go to the {room} four times this week. Nobody has asked what for; there is always something.",
    "{b} turned up where {a} was working with a question that could have waited, and did not seem to mind waiting for the answer.",
    "{a} has learned the hours {b} keeps, which is a thing you only learn by paying attention to them.",
    "Somebody remarked that {a} is about the place more than they used to be, and somebody else said the work must be busier.",
    "{b} was in the {room} again. {b} does not work in the {room}.",
  ],
  friendly: [
    "{a} was warmer with {b} than the errand required, and the household put it down to {a} being in a good mood.",
    "{b} said {a}'s name in the middle of a sentence that did not need it.",
    "There is a joke between {a} and {b} that nobody else has the beginning of, and everyone has stopped asking.",
    "{a} asked after something small in {b}'s life and remembered the answer a week later.",
    "The two of them were arguing about nothing in particular for rather longer than the nothing warranted.",
  ],
  favours: [
    "{a} did a piece of {b}'s work and did not mention it, and would not be thanked for it.",
    "{b}'s tools were sharpened by somebody. {b} has not asked who and is not going to.",
    "{a} took the worse of two jobs so that {b} would not have to, and made it look like the roster's doing.",
    "Somebody covered for {b} on a morning {b} was not fit to work. The household assumed it was the roster.",
    "{a} has been carrying something heavier than {a} needs to, on a route that happens to pass {b}.",
  ],
  gestures: [
    "There was a thing on {b}'s bench that had no business being there and was clearly meant kindly.",
    "{a} brought back something from the market that nobody had asked for and did not say who it was for.",
    "{b} has kept a small worthless thing for some weeks now, and it is always somewhere {b} can see it.",
    "{a} mended a thing of {b}'s that did not need mending, carefully, and put it back where it was.",
    "Somebody has been leaving the good chair by the fire empty until {b} comes in. Nobody will admit to it.",
  ],
};

// ---- AND WHEN IT IS NOT A SECRET ----------------------------------------------------------------
// Frank asked for a separate overt table, and he is right that it is a different register entirely.
// A hidden thing is glimpsed; an open one is simply PART OF THE HOUSEHOLD, and the beats are about
// the household accommodating it rather than about anybody noticing anything.
//
// The same principle holds — an observable fact, not a conclusion — but there is nothing to conceal,
// so the fact can be larger.
export const OVERT_ROMANCE: Record<string, string[]> = {
  courting: [
    "{a} and {b} walked out to the wall after supper and came back when it got cold, which is what they do now.",
    "The household has begun putting {a} and {b} on the same jobs, on the grounds that it is easier than not.",
    "{b} waited for {a} at the gate rather than going in, and stood there a while, and did not mind.",
    "There was a small argument between {a} and {b} that the whole hall heard and nobody minded, and it was over before supper.",
    "{a} has taken to saying \u2018we\u2019 about arrangements that used to be {a}'s alone.",
  ],
  engaged: [
    "It has been settled between {a} and {b}, and the household knows because the household always knows first.",
    "Somebody asked {a} about the spring and {a} answered as though the spring were already spoken for.",
    "{b} has begun putting things aside. Not much, and not usefully, but putting them aside.",
    "There is a date being avoided in conversation, in the way a date is avoided when everybody knows it.",
  ],
  married: [
    "{a} and {b} were arguing about the correct way to do something neither of them was doing, and finished each other's sentences while doing it.",
    "{b} came in soaked and {a} had the fire already going, which cannot have been chance and was not remarked on.",
    "The household has stopped thinking of {a} and {b} as two arrangements and started thinking of them as one.",
    "{a} said something short to {b} that would have been rude from anybody else, and {b} laughed.",
  ],
};

export const OVERT_CHANCE = 0.22;

// How often a concealed pair leaves something for a careful reader. Once every few weeks: often
// enough that a player who reads the household log will catch it, rare enough that a player who
// skims will be genuinely surprised when it comes out.
export const GLIMPSE_CHANCE = 0.28;

// What the household says when it works it out. {a} and {b} are the pair.
export const CONCEAL_REVEALED = [
  "It is not a secret any more. Nobody announced it; {a} and {b} simply stopped standing further apart than they wanted to, and the household adjusted inside a morning.",
  "Somebody said something about {a} and {b} at supper, and the silence afterwards was the sort that answers a question.",
  "{a} and {b} have stopped pretending, and it turns out most of the household had got there some time ago and been kind enough not to say.",
  "The thing about {a} and {b} came out, and the only person surprised was {a}, who had thought they were being careful.",
  "{b} said it plainly, to one person, and by evening it had gone round the whole house and come back gentler than it left.",
];

// ---- HOW A PEOPLE PAIRS -------------------------------------------------------------------------
// Frank, 1 Aug, and the scope narrowed usefully in conversation. The first framing was "vary the
// orientation distribution per species using animal analogues"; the version that survived is much
// tighter and much better founded:
//
//   * Only a HANDFUL of peoples are genuinely non-mammalian. Dragonborn are reptilian, minotaurs
//     bovine, lizardfolk are lizards, thri-kreen insectoid. For those, the human pair-bond default
//     is simply the wrong shape and the sources say so.
//   * Everyone else — dwarves, elves, halflings, orcs, tieflings — is a mammal with a CULTURE, and
//     the variation there belongs in acceptance, not biology. A drow is not a spider.
//
// AND VARY THE STRUCTURE, NOT THE ORIENTATION. A frequency tweak on who somebody is drawn to is a
// number nobody ever sees. A pairing STRUCTURE is visible in play: a lizardfolk hireling who does
// not form a couple the way a dwarf does is a different household member, on the roster, every week.
export const PAIRING_MODEL: Record<string, { kind: string; couples: number; why: string }> = {
  // couples: multiplier on COUPLE_CHANCE — how readily this people arrives as a pair at all.
  "Dragonborn": { kind: "clutch", couples: 1.25, why: "archosaurs, and the surviving archosaurs are birds \u2014 among the strongest long-term pair-bonders in nature. They pair hard and rear a clutch rather than a child." },
  "Minotaur":   { kind: "herd",   couples: 0.45, why: "bovine: strong maternal lines, a small number of bulls to many cows, and a great many unpartnered males. A minotaur arriving as half a couple is the exception." },
  "Lizardfolk": { kind: "clutch", couples: 0.30, why: "genuinely lizards, and the published text is explicit that they do not feel as mammals do. Seasonal, clutch-laying, and the LAST thing to model on them is a marriage." },
  "Pterafolk":  { kind: "clutch", couples: 0.35, why: "the same reptilian shape, and hostile with it" },
  // ⚠ WAS `kind: "hive"`, *"canonically hive-adjacent"* — and the sources say the opposite in as many
  // words: **"thri-kreen are NOT a hive-minded species."** They have a collective racial memory and a
  // powerful pack instinct, and they are individuals. Frank asked whether they resembled the Antinium
  // of the Wandering Inn, which have a Queen and genuinely subsumed selves; checking the comparison
  // is what found this. **They are the opposite in exactly the respect that matters.**
  //
  // What they actually have is the CLUTCH: hatched together, and those who survive the first five
  // years *"form life-long bonds of loyalty and mutual sacrifice."* Packs rarely exceed a dozen — and
  // *"those of thri-kreen culture can form a pack relationship with ANYONE with whom they travel."*
  // A household is a pack, and that is canon rather than a stretch.
  "Thri-kreen": { kind: "pack",   couples: 0.20, why: "hatched together and bonded for life, which is not marriage and is not less" },
  "Autognome":  { kind: "none",   couples: 0.00, why: "a construct. It has opinions; it does not have a marriage." },
  // ⚠ THESE THREE WERE FALLING THROUGH TO PAIRING_DEFAULT, whose `why` reads "a mammal with a
  // culture" — which is true of a halfling and is not true of a devil, an ooze or a shadow-touched.
  // The default was never wrong; it was being asked about peoples it does not cover.
  Quaggoth:     { kind: "none",   couples: 0.00, why: "mates at any time of year and has no courtship ritual at all \u2014 the sources say so plainly" },
  Hag:          { kind: "none",   couples: 0.00, why: "made rather than born, and gathers in threes by rule rather than by affection" },
  Treant:       { kind: "pair",   couples: 0.55, why: "roots beside another for a season and flowers; the pairing is real and it is not a marriage" },
  "Bearded Devil": { kind: "pair", couples: 0.20, why: "rank is the only relation the Hells recognise, and a barbazu has very little of it" },
  "Erinyes":    { kind: "pair",   couples: 0.35, why: "a devil pairs by arrangement and by advantage, and can mean it \u2014 but nine centuries makes a bond a very long commitment to enter lightly" },
  "Plasmoid":   { kind: "pair",   couples: 0.90, why: "amorphous, and entirely capable of attachment; the shape is not the person" },
  "Gloaming":   { kind: "pair",   couples: 0.85, why: "planetouched, and pairs as the people they were born among do" },
  // ⚠ WAS `none, "a tree"` — a one-word dismissal, and Frank's ruling contradicts it directly: a
  // treant roots beside another for a season and they pollinate each other. The old entry was not
  // canon, it was a shrug, and the sources actually name **seedlings** as treant OFFSPRING.
  "Dryad":      { kind: "none",   couples: 0.00, why: "bound to her tree" },
};
export const PAIRING_DEFAULT = { kind: "pair", couples: 1, why: "a mammal with a culture \u2014 the variation is in CULTURE_OPENNESS, not here" };

export const pairingOf = (species?: string | null) => (species && PAIRING_MODEL[species]) || PAIRING_DEFAULT;

// ---- HOW OPENLY A CULTURE LIVES -----------------------------------------------------------------
// The other half of Frank's idea, and the half that does the work. Fantasy peoples WERE built on real
// cultures, and norms varying between them is what makes a culture a culture rather than a hat.
//
// 0 = a household where such things are simply not discussed. 1 = entirely unremarkable.
//
// **This is not a claim about who anybody IS.** The attraction weights are constant across sapient
// peoples, because the surveys Frank cited measure IDENTIFICATION, which is culturally mediated —
// the same underlying distribution reports differently depending on whether reporting is safe. What
// varies here is whether a couple is open about it, whether the roster shows a partner, and whether
// somebody's relationship costs them respect from an insular colleague. That is READABLE in play; a
// frequency shift is not.
//
// DWARVES AND ELVES SIT APART DESPITE SIMILAR BIOLOGY, which is the finding this table exists for.
// Dwarves are, flatly and repeatedly in the sources, "tough, TRADITION-ABIDING folk". Elves are
// long-lived and unhurried with few fixed expectations. Same low dimorphism in canon; opposite
// cultures. A dwarven household is one where variation plainly exists and is not discussed; an
// elven one is where it is unremarkable and openly so.
//
// MY EXCHANGE TABLE. Grounded in the cultural models the peoples were built on, and cited to nothing.
export const CULTURE_OPENNESS: Record<string, number> = {
  elf: 0.90, eladrin: 0.92, astral: 0.88, fey: 0.95,      // long-lived, unhurried, few fixed expectations
  drow: 0.70,                                              // matriarchal and ruthless, but not prudish
  human: 0.62, halfling: 0.78, gnome: 0.80,                // varies by town; halflings are family-first and unbothered
  tiefling: 0.72, shadarkai: 0.75, spacefarer: 0.85, giff: 0.55,
  dwarf: 0.40,                                             // tradition-abiding — the whole point of the table
  orc: 0.45, goblinoid: 0.50, giant: 0.42,                 // clan and strength hierarchies, little room for the private
  vistani: 0.58, dragonborn: 0.48, lizardfolk: 0.35, gith: 0.30,   // gith are a war-culture; nothing personal is anybody's own
};
export const opennessOf = (culture?: string | null) => (culture && CULTURE_OPENNESS[culture] !== undefined ? CULTURE_OPENNESS[culture] : 0.6);

// ╔══════════════════════════════════════════════════════════════════════════════════════════════╗
// ║  THE SOCIAL MODEL IS COSMETIC, AND THAT IS THE POINT — NOT A SHORTFALL                       ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════╝
//
// FRANK'S RULING, 1 Aug, and it is the most important comment in this file:
//
//   *"Relationships do not affect work output, because if they did, they would lose their cosmetic
//    status — and that would make the entire thing we just worked on ILLEGAL FOR ADVENTURERS
//    LEAGUE."*
//
// I had reported "relationships don't affect the work" as a GAP three separate times in one session.
// It is not a gap. **It is the constraint doing its job**, and it is the same line the wall clock and
// the Chronicle already stand on: render what the rules mandate, never invent one they deny.
//
// THE MOMENT A DEVOTED HOUSEHOLD PRODUCES MORE GOLD, or a poisonous one loses a craft, the Exchange
// has granted a mechanical benefit the DMG does not — and a DM at a store cannot sign off on a keep
// that out-produces the book because its cook is in love. The whole of Layers 1-5 becomes
// unshippable in organized play at that moment, over a single multiplier.
//
// ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
// │  WHAT THE SOCIAL MODEL MAY DO          │  WHAT IT MUST NEVER DO                              │
// ├──────────────────────────────────────────────────────────────────────────────────────────────┤
// │  narrate                               │  change gold, DT, or item output                     │
// │  name people and what they feel        │  change craft time, quality, or success              │
// │  decide WHO leaves and WHO arrives     │  change attack dice, defender rolls, or event odds   │
// │  colour an event that already happened │  grant, extend, or withhold any DMG benefit          │
// └──────────────────────────────────────────────────────────────────────────────────────────────┘
//
// THE ONE APPARENT EXCEPTION IS NOT ONE. Morale can make somebody LEAVE — and losing a hireling is
// squarely within the DMG's own vocabulary (Lost Hirelings, the Criminal Hireling's arrest, the
// neglect bleed). The book already has staff departing for reasons; the Exchange is choosing WHICH
// person and WHY, which is narration inside a rule the book wrote. It is not a new mechanic and it
// grants nothing.
//
// FUTURE ME, AND ANY REVIEWER: you will look at this and see a rich simulation with no mechanical
// teeth, and it will feel unfinished. **It is finished.** The teeth are what would break it. If
// somebody wants relationships to move numbers, that belongs in AFTER_DARK, behind the firewall,
// with everything else the AL layer cannot carry.

// ═══════════════════════════ LAYER 2 · THE RELATIONSHIP ════════════════════════════════════════
// Frank's spec: every PAIR keeps its own record, and it is not one number. Six dimensions that move
// INDEPENDENTLY, because the interesting cases are the ones a single value cannot express:
//
//   respect somebody while disliking them · trust without friendship
//   love and argue constantly · dislike and remain loyal through duty
//
// A single weight collapses all four into the same number, which is why the old bond could say how
// MUCH two people felt and never what they felt.
// SEVEN NOW. `history` joins the six on 1 Aug — Frank's Layer 5, and it is deliberately in the same
// record rather than beside it, because it is a fact about the PAIR exactly as the others are.
export const BOND_DIMS = ["familiarity", "affection", "trust", "respect", "loyalty", "rivalry", "history"] as const;
export type BondDim = typeof BOND_DIMS[number];

// What each one actually means here, at the table, so a future reader tunes the right number.
export const BOND_MEANING: Record<BondDim, string> = {
  familiarity: "how well they know each other. Rises with EVERY interaction, good or bad — this is what lets two people know each other perfectly and detest each other.",
  affection:   "how much they like each other. The one a single weight was really tracking.",
  trust:       "would they leave something important with them. Not the same as liking.",
  respect:     "do they rate them at what they do. Survives dislike easily and often.",
  loyalty:     "would they stand by them anyway. Duty, debt, or long habit — it does not require affection.",
  rivalry:     "are they measuring themselves against them. Not hatred; competition. High rivalry with high respect is a very particular relationship.",
  history:     "what they have BEEN THROUGH together, which is not the same as how well they know each other. Only things that count add to it — a shared meal is 1, surviving a siege is 5 — and it is what makes a long relationship survive a bad year.",
};

// ---- THE LABELS ARE DERIVED, NEVER STORED -------------------------------------------------------
// Frank's rule, and it is the same principle as Layer 1's tags: the LABEL is a view of the numbers,
// so it can never disagree with them. Stored labels drift the moment a value moves and nobody
// remembers to re-evaluate.
//
// ORDER IS PRECEDENCE. The first match wins, so the strongest and most specific claims sit at the
// top. Every rule reads the record from ONE SIDE — A's record of B — because a relationship is not
// symmetrical: a mentor is not a protege, and one person can be devoted to somebody who merely
// tolerates them.
export const BOND_LABELS: Array<{ label: string; when: (r: any, self?: any, other?: any) => boolean }> = [
  // TUNED TO WHAT THE EVENTS ACTUALLY PRODUCE, and the first pass was not. Thresholds were written
  // as if the values ran 0-100 in ordinary play; measured, a respected-but-disliked colleague after
  // sixteen interactions sits at respect 36 / affection -28, and a rule wanting respect > 55 called
  // that "on nodding terms". **A label nobody can reach is a label that does not exist.** These are
  // calibrated against runs of 10-20 moments, which is a season or two of a real household.
  // MARRIAGE IS A FACT, not a reading of the numbers, so it sits above every derived label and is the
  // one entry that looks at the PEOPLE rather than the record. Frank's orc-and-lizardfolk couple
  // surfaced this: a marriage with all six dimensions correct still read back "close friend", because
  // the label list had no word for a spouse. A couple whose bond has soured is still married, which
  // is why the fact outranks the numbers rather than competing with them.
  { label: "estranged spouse", when: (r, self, other) => !!self && !!other && self.spouseId === other.id && r.affection < -20 },
  { label: "spouse",        when: (_r, self, other) => !!self && !!other && self.spouseId === other.id },
  // THE SENTENCE THE WHOLE DESIGN WAS FOR. High affection and trust with almost no familiarity is
  // impossible by accident — it only happens when two people are close and are not being seen to be.
  // Without this the label list called a concealed couple "barely known", which is what the numbers
  // say and the opposite of what is true.
  { label: "close, and nobody knows", when: (r) => r.affection > 40 && r.trust > 30 && r.familiarity < 20 },
  { label: "sworn enemy",   when: (r) => r.rivalry > 60 && r.affection < -25 && r.familiarity > 30 },
  { label: "best friend",   when: (r) => r.affection > 60 && r.trust > 45 && r.familiarity > 55 },
  { label: "close friend",  when: (r) => r.affection > 40 && r.trust > 28 && r.familiarity > 35 },
  // MENTOR is asymmetric AND needs the people, not just the record: respect running one way, with
  // the years to justify it. This is why the label functions take `self` and `other`.
  { label: "mentor",        when: (r, self, other) => r.respect > 28 && r.trust > 18 && !!self && !!other && (other.age || 0) - (self.age || 0) >= 12 },
  { label: "protege",       when: (r, self, other) => r.affection > 15 && r.loyalty > 12 && !!self && !!other && (self.age || 0) - (other.age || 0) >= 12 },
  { label: "confidant",     when: (r) => r.trust > 45 && r.familiarity > 30 },
  // THE FOUR FRANK NAMED as the point of the exercise — each impossible under a single weight, and
  // each sitting ABOVE the plain labels so they are not swallowed by "friend" or "well known".
  { label: "respected, not liked", when: (r) => r.respect > 25 && r.affection < -10 },
  { label: "liked, not trusted",   when: (r) => r.affection > 25 && r.trust < 10 && r.familiarity > 25 },
  { label: "loyal, whatever else", when: (r) => r.loyalty > 30 && r.affection < 10 },
  { label: "stormy",               when: (r) => r.affection > 20 && r.rivalry > 30 && r.familiarity > 40 },
  { label: "sworn to each other",  when: (r) => r.loyalty > 45 && r.trust > 35 },
  { label: "rival",         when: (r) => r.rivalry > 28 && r.respect > 18 },
  { label: "enemy",         when: (r) => r.rivalry > 35 && r.affection < -15 },
  { label: "friend",        when: (r) => r.affection > 22 && r.familiarity > 22 },
  { label: "well known",    when: (r) => r.familiarity > 45 },
  { label: "on nodding terms", when: (r) => r.familiarity > 15 },
  { label: "barely known", when: () => true },
];

// The whole point of the six values: an EVENT moves several at once, by different amounts, and some
// of them not at all. Familiarity is on every row because knowing somebody better is what happens
// whenever anything happens.
//
// MY EXCHANGE TABLE. Nothing here is a rule of anybody's game; it is a reading of what these moments
// do to people, and it is Frank's to red-pen.
export const BOND_EVENTS: Record<string, Partial<Record<BondDim, number>>> = {
  // TRUST +1. You learn what somebody is like by working beside them, and this is the commonest
  // thing that happens in a household — it was granting NO trust, which made Layer 2's trust
  // dimension unreachable and stalled every courtship at "courting" forever.
  worked_together:  { familiarity: 3, affection: 2, respect: 2, trust: 1 },
  covered_for_them: { familiarity: 2, affection: 3, trust: 3, loyalty: 2, history: 1 },
  did_it_properly:  { familiarity: 2, respect: 4, history: 1 },
  let_it_go:        { familiarity: 2, affection: 2, trust: 1 },
  rebuked:          { familiarity: 3, affection: -3, respect: 1, rivalry: 2 },
  showed_them_up:   { familiarity: 2, affection: -2, respect: 2, rivalry: 5 },
  caught_them_out:  { familiarity: 3, affection: -2, trust: -5, history: 2 },
  quarrelled:       { familiarity: 3, affection: -4, rivalry: 3, history: 1 },
  stood_together:   { familiarity: 4, affection: 3, trust: 4, loyalty: 6, respect: 3, history: 3 },
  saved_them:       { familiarity: 5, affection: 4, trust: 6, loyalty: 8, respect: 4, history: 4 },
  let_them_down:    { familiarity: 3, affection: -3, trust: -6, loyalty: -4, history: 2 },
  married:          { familiarity: 40, affection: 55, trust: 45, loyalty: 60, respect: 30, history: 8 },
  long_service:     { familiarity: 2, loyalty: 2, respect: 1, history: 1 },
  // ---- LAYER 5 · THE FULLER EVENT LIST (Frank, 1 Aug) -------------------------------------------
  // *"Every interaction within the estate should be represented as an event."* The eight above were
  // the household week's own vocabulary; these are the ones a LIFE has in it, and several of them
  // close gaps I had reported as missing an hour earlier — grief most of all.
  shared_meal:      { familiarity: 2, affection: 1, history: 1 },
  gift_given:       { familiarity: 1, affection: 4, trust: 1, history: 1 },
  argument:         { familiarity: 2, affection: -4, respect: -1, rivalry: 3, history: 1 },
  public_shame:     { familiarity: 3, affection: -2, respect: -6, rivalry: 4, history: 2 },
  saved_a_life:     { familiarity: 5, affection: 6, trust: 10, loyalty: 12, respect: 6, history: 4 },
  promotion:        { familiarity: 1, respect: 4, rivalry: 3, history: 1 },
  ceremony:         { familiarity: 3, affection: 2, trust: 2, loyalty: 3, history: 2 },
  child_born:       { familiarity: 4, affection: 6, trust: 4, loyalty: 8, history: 4 },
  // GRIEF. A gap I reported as missing and Frank's list closes: somebody dies and the people who
  // knew them are changed by it TOGETHER. Mourning is a shared experience, and it is one of the few
  // that deepens a relationship while costing everybody involved.
  mourned_together: { familiarity: 4, affection: 5, trust: 5, loyalty: 6, history: 5 },
  survived_danger:  { familiarity: 5, affection: 4, trust: 8, loyalty: 10, respect: 5, history: 5 },
  festival:         { familiarity: 3, affection: 3, history: 2 },
  victory:          { familiarity: 3, affection: 3, respect: 3, loyalty: 3, history: 3 },

  // A SHRUG IS NOT A FAVOUR. Needed because the household week names moments now: a reaction with a
  // neutral delta — somebody who is superstitious about it, or has seen it before, or takes it
  // harder than it deserved — used to map to `rebuked` and grant nothing. Mapping it to
  // `worked_together` made every indifferent shrug a kindness, and a camped outlander who should
  // walk at four weeks lasted thirteen. They saw each other; nothing else happened.
  noticed:          { familiarity: 2 },
};

// ---- HOW OTHER PEOPLE CHANGE YOU ---------------------------------------------------------------
// Frank, 1 Aug: *"when they interact, it should create an instance of this NPC plus that NPC and this
// is the stat adjustments being made between the two... and if we see a consistent modification on
// average over their collection of relationship files — if every single person they interact with
// rubs them the wrong way and shifts their agreeableness negative — then the average should modify
// the core agreeableness."*
//
// **Two levels, and the second is the whole idea:**
//
//   PER-BOND MODS   how THIS person affects THAT one. Lives on the bond, is about the pair, and can
//                   be sharply negative without meaning anything about either of them generally.
//   CORE DRIFT      the AVERAGE of those mods across everybody. One person who grates on you does
//                   not change who you are. Everybody grating on you does.
//
// The averaging is what makes it slow and what makes it right: a single bad relationship out of ten
// moves the core by a tenth of its mod. You have to be consistently treated a certain way before you
// become a certain way, which is both truer and safer than letting each interaction shove the dial.
//
// PLASTICITY IS PER AXIS, because people are not equally movable in every direction. How agreeable
// you are is largely about who you have had to deal with; how honourable you are is not. An axis at
// 0 never drifts at all — it is who you were before you got here.
export const AXIS_PLASTICITY: Record<ProfileAxis, number> = {
  agreeableness:     1.00,   // most movable: this IS your history of dealing with people
  prejudice:         0.90,   // and this is your history of dealing with a PARTICULAR kind of people
  stability:         0.70,   // being ground down is a thing that happens
  extroversion:      0.55,   // people can draw you out or drive you in
  romantic:          0.45,
  ambition:          0.35,   // envy and example move it, but slowly
  conscientiousness: 0.25,   // mostly how you were raised
  openness:          0.20,
  honor:             0.10,   // very nearly who you are
};

// A core can drift this far from where it started and no further. You become somewhat harder or
// somewhat softer; you do not become a different person because of one bad posting.
export const DRIFT_CAP = 18;

// Dunbar, as Frank names it: nobody maintains more than ~150 relationships. A household will not
// approach it — fifty people means at most forty-nine bonds each — so this never binds in an estate
// and is cheap and correct to have anyway. When it does bind, the WEAKEST go first: you forget the
// people you barely knew, not the ones you loved or could not stand.
export const BOND_CEILING = 150;

// ---- ROLLING A PERSON ---------------------------------------------------------------------------
// Three draws summed, not one flat draw. A household of extremes is a cartoon; most people are
// middling at most things and the interesting ones stand out BECAUSE the rest do not. ~68% land
// between 33 and 67, which makes a 90 worth noticing.
const bell = () => Math.round((Math.random() + Math.random() + Math.random()) / 3 * 100);

export function rollProfile(): Profile {
  const p = {} as Profile;
  PROFILE_AXES.forEach((k) => { p[k] = bell(); });
  return p;
}

// THE BRIDGE. Reads a profile and hands back the tag vocabulary 72 existing table rows already speak.
// A person may hold several tags at once, which is correct and is what the old "draw three from
// sixteen" was approximating badly — it could hand somebody `patient` and `quarrelsome` together, or
// `green` to a sixty-year-old.
export function traitsOf(profile?: Profile | null, age = 30): string[] {
  if (!profile) return [];
  return TRAIT_RULES.filter((r) => r.when(profile, age)).map((r) => r.tag);
}

// Faith by naming culture, falling through to human. A quarter to a half of any household names
// nobody in particular, which is deliberate: a keep where everyone has a god reads as a temple.
export function rollFaith(culture?: string | null): string {
  const pool = (culture && FAITH_BY_CULTURE[culture]) || FAITH_BY_CULTURE.human;
  const total = Object.values(pool).reduce((n, w) => n + w, 0);
  let r = Math.random() * total;
  for (const [god, w] of Object.entries(pool)) { r -= w; if (r <= 0) return god; }
  return "no god in particular";
}

// ---- MARITAL STATUS, AND WHY "MARRIED" IS SPECIAL -----------------------------------------------
// Frank, 1 Aug: *"I would be ok if hirelings arrived as spouses... but if they do not arrive as a
// pre-existing family unit then they must be single."*
//
// **This closes a dangling reference I had left.** A lone hireling marked `married` implies a spouse
// who exists nowhere — not at the estate, not in any record, not simulatable. Same defect as the
// children count: a field that reads like a fact and refers to nothing. Either the spouse is HERE and
// is a person, or the person is not married.
//
// So `married` is the one status that cannot be rolled. It is only ever ASSIGNED, to both halves of a
// couple hired together, by `pairUp`. Everything below is what somebody arriving ALONE can be — and
// note that widowed and estranged are fine alone, because they refer to a spouse who is *gone*, which
// is backstory in exactly the way a parent is.
export function rollMarital(age: number): string {
  const r = Math.random();
  if (age < 22) return r < 0.92 ? "unwed" : "betrothed";
  if (age < 30) return r < 0.72 ? "unwed" : r < 0.90 ? "betrothed" : "widowed";
  if (age < 45) return r < 0.58 ? "unwed" : r < 0.70 ? "betrothed" : r < 0.88 ? "widowed" : "estranged";
  return r < 0.42 ? "unwed" : r < 0.50 ? "betrothed" : r < 0.84 ? "widowed" : "estranged";
}

// How often two slots in the same room are filled by a couple rather than two strangers. Estates
// hired married pairs routinely — a cook and a porter, a smith and a striker — because it housed two
// workers in one bed and because people looking for a post looked for one together.
export const COUPLE_CHANCE = 0.18;

// A spouse is drawn to MATCH, not independently: within a few years of age, usually the same people,
// and always the same faith if either has one, because that is what a marriage in this setting looks
// like. Nothing here is a rule of the Realms — it is the Exchange's own reading and is labelled so.
export const SPOUSE_SAME_SPECIES = 0.82;
export const SPOUSE_AGE_SPREAD = 7;

// ---- PARENTS, AND DELIBERATELY NOT CHILDREN -----------------------------------------------------
// Frank, 1 Aug: *"Not sure I want the hirelings to have kids. I would have to simulate them. Parents
// sure, but kids complicate things."* Correct, and the distinction is exact:
//
//   A PARENT is BACKSTORY. They are dead, or three hundred miles away, or in the next valley. They
//   explain where somebody came from and they never need a line of code.
//
//   A CHILD is A PERSON WHO NEEDS SIMULATING. If a scullion has two children they are AT the estate;
//   they age, they need feeding and housing, the household week has to notice them, and eventually
//   they need a Layer 1 record of their own — at which point a keep of twelve staff is a keep of
//   thirty people. **That is a second population, not a field.**
//
// A `children` COUNT with nobody behind it would be worse than either: a number the UI shows, the
// week never mentions, and no system reads. That is exactly the `outlander`-written-and-never-read
// defect from this morning, invited in on purpose.
//
// So: parents, as a fact about a life. Weighted by the person's own age, because at fifty-five your
// parents are usually gone and at twenty-two they usually are not.
export const PARENT_STATES = ["both living", "mother living", "father living", "both gone", "never knew them"];
// ⚠ AND THE UNSEXED VERSION (Frank, 2 Aug). He asked whether plasmoids are asexual dividers, which
// sent me to the source: the *Astral Adventurer's Guide* has them reproduce by a loose analogue of
// meiosis — **two parents merge and separate, and one of them later divides**, producing a newborn
// that is a mixture of both. So there IS division, and it is biparental, and there are no sexes:
// either parent can be the one that divides.
//
// Which broke this table one layer below where I was looking. A plasmoid was being given *"mother
// living"* — a gendered parent term for a people with no sexes — and the fix for `SPECIES_AXES`
// had not reached down here. **A ruling has to be followed everywhere it implies something.**
export const PARENT_STATES_UNSEXED = ["both living", "one living", "both gone", "never knew them"];

export function rollParents(age: number): string {
  const r = Math.random();
  if (age < 30) return r < 0.62 ? "both living" : r < 0.74 ? "mother living" : r < 0.82 ? "father living" : r < 0.94 ? "both gone" : "never knew them";
  if (age < 48) return r < 0.34 ? "both living" : r < 0.55 ? "mother living" : r < 0.66 ? "father living" : r < 0.94 ? "both gone" : "never knew them";
  return r < 0.08 ? "both living" : r < 0.20 ? "mother living" : r < 0.26 ? "father living" : r < 0.95 ? "both gone" : "never knew them";
}

// The same shape, without the gendered terms. Called for any people whose axes say it has no sex.
export function rollParentsUnsexed(age: number) {
  const p = rollParents(age);
  return p === "mother living" || p === "father living" ? "one living" : p;
}

// ---- WHO LIVES AROUND HERE ---------------------------------------------------------------------
// MY EXCHANGE RULE [TABLE]. Frank, 1 Aug: a bastion should hire from the people who actually live
// where it stands, "with a small percentage of potential outlanders."
//
// PROVENANCE, STATED PLAINLY. The SPECIES NAMES are facts and are shipped as names only — no traits,
// no game text, the same doctrine the item slots use. **The regional WEIGHTS below are the Deep
// Grounds Exchange's own reading and are not cited to anything.** Neither the SRD (which lists nine
// species and no demographics) nor the AL guides say who lives on the Moonsea. This is the same
// shape and the same honesty as REGION_WEIGHTS: a labelled house table, never passed off as canon,
// and Frank's to red-pen.
//
// Weights are RELATIVE and summed at draw time, so adding a people to a region needs no rebalancing.
// A region absent from this table falls through to the swordcoast baseline — the same whitelist
// discipline the event weights use, so a homebrew region still hires sensibly.
//
// Nine of the twenty-three are SRD-listed; the other fourteen are named only, which is what makes
// the Underdark read as the Underdark rather than as a slightly darker Sword Coast.
// PROVENANCE IS PER ROW, not per table — the same convention the region graph uses (`cited` /
// `derived`). Three regions now carry the published 3e figures; the rest are still the Exchange's
// own and are marked so. Frank was right that the demographics exist and I was wrong to write the
// table without looking: my first pass had Waterdeep at 52% human against a published 64%, put
// elves at 14% in the Silver Marches against a published 20%, and invented Goliaths and Orcs into
// breakdowns that do not contain them.
//
//   cited-3e    published percentages, used verbatim
//   derived-3e  published figures, but ARITHMETIC OF MINE on top of them (see underdark)
//   canon-approx  no publisher census, but RECONSTRUCTED from multiple official sources
//   house-prose no percentages published, but weights FITTED to what published prose states
//   house       the Exchange's own reading. NOT canon. Frank's to red-pen.
export const SPECIES_SOURCE: Record<string, string> = {
  waterdeep: "cited-3e", silvermarches: "cited-3e", cormyr: "cited-3e",
  dalelands: "cited-3e", heartlands: "cited-3e", moonsea: "cited-3e",
  swordcoast: "cited-3e", neverwinter: "cited-3e", dessarin: "cited-3e",
  icewinddale: "house-prose",
  chult: "cited-3e",
  baldursgate: "canon-approx",
  underdark: "derived-3e",
  barovia: "house-prose",
  avernus: "house",
  feywild: "house", wildspace: "house",
};

export const SPECIES_BY_REGION: Record<string, Record<string, number>> = {
  // --- CITED: published 1372 DR percentages, used verbatim ------------------------------------
  // Waterdeep: humans 64, dwarves 10, elves 10, halflings 5, half-elves 5, gnomes 3, half-orcs 2.
  // (The published "misc. 1%" is not a row here — it IS the outlander draw. See OUTLANDER_CHANCE.)
  waterdeep:     { "Human": 64, "Dwarf": 10, "Elf": 10, "Halfling": 5, "Half-Elf": 5, "Gnome": 3, "Half-Orc": 2 },
  // Luruar / the Silver Marches: human 40, dwarf 20, elf 20, half-elf 10, halfling 5, gnome 2, half-orc 2.
  silvermarches: { "Human": 40, "Dwarf": 20, "Elf": 20, "Half-Elf": 10, "Halfling": 5, "Gnome": 2, "Half-Orc": 2 },
  // Cormyr: humans 85, half-elves 10, elves 4. A notably human kingdom, and the published figures say so
  // far more strongly than my guess did — I had 66% where the book has 85%.
  cormyr:        { "Human": 85, "Half-Elf": 10, "Elf": 4 },

  // The Dalelands: humans 80, drow 6, half-elves 5, elves 4, halflings 2, gnomes 1, dwarves 1.
  // The DROW are the surprise and they are canon: Cormanthor's drow presence sits inside the Dales'
  // own breakdown. My house guess had none at all and gave elves three times their real share.
  // The Moonsea: humans 69, orcs 10, half-orcs 6, halflings 5, dwarves 5, ogres 2, gnomes 2.
  // OGRES are in the published breakdown, which is exactly the kind of detail a house guess never
  // produces — a Moonsea keep can hire an ogre, and that is the book's doing, not mine.
  // The Western Heartlands: humans 78, elves 7, half-elves 4, halflings 4, half-orcs 3, gnomes 2, dwarves 1.

  // --- HOUSE: the Exchange's own reading, pending sourcing ------------------------------------
  // The Sword Coast North: humans 65, dwarves 10, orcs 5, half-orcs 5, elves 4, halflings 4,
  // gnomes 2, half-elves 1. ORCS AND HALF-ORCS AT A TENTH BETWEEN THEM is the frontier showing in
  // the census — "the orcs are always with us," as the book has the northerners say. My guess had
  // no orcs at all and put halflings at ten.
  swordcoast:    { "Human": 65, "Dwarf": 10, "Orc": 5, "Half-Orc": 5, "Elf": 4, "Halfling": 4, "Gnome": 2, "Half-Elf": 1 },
  // Neverwinter sits INSIDE the Sword Coast North and has no separate regional census, so it takes
  // that region's published figures. Flagged rather than silently shared: if a Neverwinter-specific
  // breakdown ever surfaces it should replace this, and the city itself is described as "a walled
  // city of humans and half-elves", which these figures do not especially reflect.
  neverwinter:   { "Human": 65, "Dwarf": 10, "Orc": 5, "Half-Orc": 5, "Elf": 4, "Halfling": 4, "Gnome": 2, "Half-Elf": 1 },
  // Icewind Dale has NO published percentage table — the sources give it as a Confederation of
  // 10,436 inside the Sword Coast North, then describe the Ten Towns settlement by settlement. So
  // this is `house-prose`: weights fitted to what the published PROSE actually says rather than
  // invented, and marked as a distinct tier so the difference from a real table stays visible.
  //
  // The prose: "predominantly human, with very few half-elves and halflings", tundra barbarians who
  // are human, and the Dwarven Valley south of Kelvin's Cairn housing dwarf clans. My earlier guess
  // had GOLIATHS AT 9% — they appear nowhere in any Icewind Dale source I found — and undercounted
  // humans in the one region the books call almost entirely human.
  icewinddale:   { "Human": 82, "Dwarf": 11, "Halfling": 3, "Half-Elf": 3, "Elf": 1 },
  // The Dessarin Valley takes the SAVAGE FRONTIER's published figures — humans 55, orcs 20,
  // dwarves 5, half-elves 5, elves 4, half-orcs 4, halflings 4, gnomes 2 — because that is the
  // region the Dessarin runs through in the source ("River Dessarin: this great river carves the
  // rough hills of the central North"). ORCS AT ONE IN FIVE. My guess had none, and it is the single
  // largest correction in the whole table: the Dessarin valley is not a settled shire, it is the
  // frontier, and the census says so louder than any prose could.
  dessarin:      { "Human": 55, "Orc": 20, "Dwarf": 5, "Half-Elf": 5, "Elf": 4, "Half-Orc": 4, "Halfling": 4, "Gnome": 2 },
  // The Dalelands: humans 80, drow 6, half-elves 5, elves 4, halflings 2, gnomes 1, dwarves 1.
  // The DROW are the surprise and they are canon — Cormanthor's drow sit inside the Dales' own
  // breakdown. My house guess had none at all, and gave elves three times their real share.
  dalelands:     { "Human": 80, "Drow": 6, "Half-Elf": 5, "Elf": 4, "Halfling": 2, "Gnome": 1, "Dwarf": 1 },
  // The Western Heartlands: humans 78, elves 7, half-elves 4, halflings 4, half-orcs 3, gnomes 2, dwarves 1.
  heartlands:    { "Human": 78, "Elf": 7, "Half-Elf": 4, "Halfling": 4, "Half-Orc": 3, "Gnome": 2, "Dwarf": 1 },
  // Baldur's Gate: CANON APPROXIMATE (Frank, 1 Aug). No publisher census exists — the books describe
  // an overwhelmingly human, cosmopolitan city without tabulating it. These figures are a
  // reconstruction from multiple official sources plus the Western Heartlands breakdown, which is a
  // real methodology rather than a guess, and it is tagged as one. Note it lands FIVE POINTS ABOVE
  // the Western Heartlands' 78% human rather than below it, which is the opposite of what I assumed
  // when I argued a port city would be more mixed than its hinterland.
  baldursgate:   { "Human": 83, "Half-Elf": 5, "Halfling": 4, "Half-Orc": 3, "Gnome": 2, "Dwarf": 1 },
  // The Moonsea: humans 69, orcs 10, half-orcs 6, halflings 5, dwarves 5, ogres 2, gnomes 2.
  // OGRES are in the published breakdown — exactly the kind of detail a house guess never produces.
  // A Moonsea keep can hire an ogre, and that is the book's doing, not mine.
  moonsea:       { "Human": 69, "Orc": 10, "Half-Orc": 6, "Halfling": 5, "Dwarf": 5, "Ogre": 2, "Gnome": 2 },
  // The Underdark takes MENZOBERRANZAN's published city stat block, which is the only Underdark
  // population the sources give in this format: "Population 25,000 free; Isolated (drow 90%, human
  // 3%, duergar 3%, other 4%); 28,000 slaves (goblin 17%, grimlock 17%, kobold 14%, orc 13%,
  // quaggoth 9%, bugbear 7%, human 7%, ogre 4%, svirfneblin 4%, minotaur 3%, troll 2%, gloaming 1%,
  // tiefling 1%)."
  //
  // MARKED `derived-3e`, NOT `cited-3e`, and the distinction is the point: the figures are published
  // but the WEIGHTS BELOW ARE MY ARITHMETIC. I combined the free and enslaved populations into one
  // hiring pool and re-based to 53,000 people. Somebody could reasonably combine them differently,
  // or refuse to combine them at all. The provenance says which part is the book's and which is mine.
  //
  // THE SHAPE WAS WHAT I HAD WRONG, not just the numbers. **There are more slaves than free people**
  // — 28,000 against 25,000 — so a household in the Underdark draws from a pool that is nearly half
  // drow and then overwhelmingly goblinoid, with duergar and svirfneblin as a rounding error rather
  // than the second and third peoples my guess made them. And it names peoples invention does not
  // reach for: grimlocks at 9%, quaggoths at 5%, a gloaming.
  //
  // RULED 1 Aug (Frank): **they are ESCAPING.** The pool includes the enslaved and the AL layer draws
  // from all of it, because somebody who reaches a keep in the Underdark and asks for work has got
  // themselves out. That is a better reading than my "arrival implies freedom" hand-wave, and it
  // gives two EXISTING events a new meaning without a line of new code:
  //
  //   CRIMINAL HIRELING  the warrant is real and the crime is escaping slavery. Officials at your
  //                      gate with a writ for a person whose offence was leaving. The bribe is the
  //                      same 1d6x100 and it buys something entirely different.
  //   LOST HIRELINGS     a room stands empty because somebody was found, or ran again before they
  //                      could be.
  //
  // The wage reading still holds for what the estate pays: DMG Bastions.md:286 says a facility "generates enough income to pay the SALARY of
  // its hirelings", which is a wage relationship and cannot be stretched to cover acquisition.
  // Somebody who arrives at a gate looking for work is, by that act, free — escape, manumission and
  // self-purchase are all canon here, and they are a better story than a purchase screen.
  //
  // The purchase mechanic is logged in AFTER_DARK.md §3.6, where it joins the labour economy
  // (choosing hirelings, wages by wealth) rather than standing alone. The DEMOGRAPHICS are unchanged
  // either way — they are the honest representation of a published setting.
  underdark:     { "Drow": 42, "Goblin": 9, "Grimlock": 9, "Kobold": 7, "Orc": 7, "Human": 5, "Quaggoth": 5, "Bugbear": 4, "Ogre": 2, "Svirfneblin": 2, "Minotaur": 2, "Duergar": 1, "Troll": 1, "Gloaming": 1, "Tiefling": 1 },
  // Chult: humans 60, goblins 20, lizardfolk 10, wild dwarves 5, pterafolk 4.
  // MY WORST ROW BY SOME MARGIN. I had goblins at 8 against a published 20, lizardfolk at 4 against
  // 10, and no wild dwarves or pterafolk at all — while inventing half-orcs, halflings, elves and
  // Tabaxi into a breakdown that contains none of them. A jungle that is one-fifth goblin and one-
  // tenth lizardfolk is a different place from the one my guess described, and the published figures
  // are the reason Chult reads as Chult.
  chult:         { "Human": 60, "Goblin": 20, "Lizardfolk": 10, "Wild Dwarf": 5, "Pterafolk": 4 },
  // Barovia has NO published percentage table — Ravenloft's material describes rather than tabulates,
  // and the one numeric breakdown findable is a forum post explicitly labelled somebody's own "take
  // on Ravenloft", i.e. homebrew. Rejected. `house-prose`, fitted to the setting description:
  //
  //   "Humans are dominant, with large minority of half-Vistani. Calibans occur with increasing
  //    frequency. There are small populations of halflings in the western cities. Dwarves are
  //    rumored to live in the Balinoks and elves are believed to live in the Tepurich forest."
  //
  // Three corrections to my guess. Half-Vistani are a LARGE minority, not 6%. **Calibans** belong
  // here and I did not have them at all — a Ravenloft people, the kind of thing invention never
  // reaches for. And dwarves and elves are "rumored" and "believed": that is not a population, it is
  // a story people tell, so they sit at the floor rather than at 3% and 1%.
  //
  // NOTE ON THE SOURCE: the prose above is from a fan compilation summarising published Ravenloft
  // material, not from a publisher directly. Weaker than Mistipedia (which Frank scoped for the
  // library corpus) and much weaker than a table. Marked accordingly.
  barovia:       { "Human": 72, "Half-Vistani": 17, "Caliban": 6, "Halfling": 3, "Dwarf": 1, "Elf": 1 },
  avernus:       { "Tiefling": 34, "Human": 30, "Half-Orc": 10, "Dwarf": 7, "Elf": 5, "Dragonborn": 5, "Halfling": 4, "Goblin": 3, "Gnome": 2 },
  feywild:       { "Elf": 30, "Gnome": 18, "Halfling": 13, "Half-Elf": 12, "Human": 11, "Satyr": 7, "Firbolg": 5, "Goblin": 4 },
  wildspace:     { "Human": 34, "Dwarf": 13, "Elf": 11, "Gnome": 10, "Half-Elf": 8, "Tiefling": 7, "Dragonborn": 6, "Githyanki": 5, "Halfling": 4, "Goliath": 2 },
};

// PUBLISHED BREAKDOWNS FOR PLACES THE EXCHANGE DOES NOT YET HAVE A REGION FOR (Frank's list, 1 Aug).
// Held here rather than discarded: the moment `BASTION_REGIONS` grows, or a vessel's region graph
// reaches the Inner Sea, these are already sourced and need no second look. Same 1372 DR lineage,
// same "Other 1%" remainder, and each one is a region a future AL season could plausibly use.
//
// NOT WIRED. `randSpecies` never reads this — a region must be an AL region before a keep can stand
// in it. This is a shelf, and it is labelled as one so nobody mistakes it for live data.
export const SPECIES_UNUSED_REGIONS: Record<string, Record<string, number>> = {
  sembia:    { "Human": 96, "Halfling": 3 },
  vast:      { "Human": 78, "Dwarf": 9, "Halfling": 5, "Elf": 3, "Gnome": 2, "Half-Elf": 1, "Half-Orc": 1 },
  aglarond:  { "Human": 64, "Half-Elf": 30, "Elf": 5 },
  impiltur:  { "Human": 90, "Dwarf": 5, "Halfling": 4 },
  rashemen:  { "Human": 99 },
  damara:    { "Human": 87, "Dwarf": 6, "Halfling": 4, "Half-Orc": 2 },
  vaasa:     { "Human": 60, "Dwarf": 30, "Orc": 9 },
  thesk:     { "Human": 85, "Gnome": 8, "Orc": 6 },
  thay:      { "Human": 62, "Orc": 10, "Gnoll": 10, "Dwarf": 8, "Goblin": 5, "Halfling": 4 },
};

// ---- WHERE ONE CENSUS IS THE WRONG SHAPE -------------------------------------------------------
// Frank's ruling, 1 Aug, and it is a better model than the one it replaces: **a plane does not have
// a demographic.** Avernus, the Feywild and Wildspace each vary so much between one place and the
// next that a single plane-wide pool is not an approximation of anything — it is an average of
// things that never occur together. The published lore describes INHABITANTS, FACTIONS and DOMAINS;
// it does not describe a stable population, and pretending otherwise is worse than admitting it.
//
// So these three regions carry LOCALES instead. A bastion in one of them names which locale it
// stands in (`bastion.locale`), and that decides who is around. A region with no locales, or a
// bastion that has not named one, falls through to the region's own pool exactly as before.
//
// PROVENANCE: `house` throughout. These are lore-derived, not censused, and the tier says so. What
// they buy is not accuracy — it is the right SHAPE, which is a different and prior thing.
export const SPECIES_BY_LOCALE: Record<string, Record<string, Record<string, number>>> = {
  // AVERNUS — the front line of the Blood War. Who LIVES here is Zariel's army, and the shape of
  // that army is a pyramid: lemures at the base in enormous numbers, pit fiends vanishingly rare.
  //
  // ⚠ OPEN, AND IT IS THE SAME PROBLEM AS THE UNDERDARK'S SLAVES: **a population is not a hiring
  // pool.** A lemure is a mindless damned soul; it cannot be a cook, a librarian or a sergeant, and
  // 45% of this table is lemures. An imp could plausibly keep a ledger. A bearded devil could hold a
  // wall. Most of the rest could do neither.
  //
  // The AL bastion currently draws staff straight from whatever pool it is handed, so a keep in
  // Avernus will presently staff its kitchen with lemures. That is wrong and it is FLAGGED rather
  // than silently patched, because the fix is a ruling: either a per-people `canWork` flag, a
  // separate hiring pool per locale, or the reading that a mortal outpost in Avernus hires the
  // mortals and lesser devils who congregate around it rather than the army it is embedded in.
  // Frank's call. The demographics above are honest either way — they describe who is THERE.
  avernus: {
    warcamp:   { "Lemure": 45, "Bearded Devil": 15, "Imp": 10, "Barbed Devil": 8, "Spined Devil": 5,
                 "Chain Devil": 3, "Bone Devil": 3, "Horned Devil": 2, "Erinyes": 2, "Other Devil": 7 },
  },
  // THE FEYWILD — the courts and the wilds are not the same world, and the Gloaming is a third thing
  // again. Three templates rather than one plane.
  feywild: {
    summercourt: { "Eladrin": 35, "Satyr": 18, "Dryad": 10, "Pixie": 8, "Sprite": 8, "Centaur": 7, "Treant": 5, "Other Fey": 9 },
    gloaming:    { "Dark Fey": 25, "Shadar-kai": 20, "Quickling": 10, "Redcap": 10, "Hag": 5, "Other Fey": 30 },
    // "Animals 15%" is Frank's row and it belongs here: a deep forest IS mostly animals, and dropping
    // them left a fifteen-point hole that the outlander rate was silently absorbing. They are in the
    // population and employable in neither sense, which is what SPECIES_ROLES is for.
    deepforest:  { "Dryad": 20, "Eladrin": 15, "Animals": 15, "Treant": 12, "Satyr": 10, "Pixie": 10, "Sprite": 8, "Other Fey": 10 },
  },
  // WILDSPACE — "who lives in space" is not a question. WHO IS ABOARD is. A free port, a war fleet
  // and a dwarven hold are three different crews, and the port is by far the most mixed.
  wildspace: {
    rockofbral:   { "Human": 35, "Dwarf": 12, "Elf": 12, "Giff": 8, "Halfling": 7, "Gnome": 6, "Half-Elf": 5,
                    "Half-Orc": 3, "Plasmoid": 2, "Thri-kreen": 2, "Autognome": 2, "Astral Elf": 2 },
    armada:       { "Astral Elf": 60, "Elf": 25, "Human": 5, "Half-Elf": 4 },
    dwarvencitadel: { "Dwarf": 72, "Gnome": 10, "Human": 8, "Halfling": 4 },
  },
};

// Every locale this app knows, for validation and for the UI's picker.
export const LOCALES_FOR = (regionId?: string | null) => Object.keys((regionId && SPECIES_BY_LOCALE[regionId]) || {});

// ---- WHAT A PEOPLE CAN ACTUALLY DO IN A HOUSEHOLD ----------------------------------------------
// Frank, 1 Aug: "not all demons make great kitchen staff... keep in mind you do not need sentient
// freethinking peoples for that."
//
// SENTIENCE IS THE WRONG AXIS, and that is the useful part of his framing. A skeleton can carry
// water; a LEMURE cannot do anything, because a lemure is not a servant, it is a formless mass of
// suffering. And the reverse holds: a barbed devil will hold a wall all night and could not keep a
// ledger or turn a roast. So the question is not "is it a person" but TWO questions:
//
//   hire    can it hold a POST — a kitchen, a forge, a scriptorium desk?
//   defend  can it hold a WALL?
//
// A WHITELIST OF EXCEPTIONS, not an exhaustive roster. Anything absent from this table can do both,
// which is the same discipline REGION_WEIGHTS uses: a people added tomorrow works by default and
// only needs an entry if it does not. Fifty-eight peoples can currently be drawn; eleven need a rule.
export const SPECIES_ROLES: Record<string, { hire?: boolean | "outdoor"; defend?: boolean; mindless?: boolean; hazard?: "fire" | "noise" | "water"; vulnerable?: "fire"; why?: string }> = {
  // ─── NEITHER ────────────────────────────────────────────────────────────────────────────────────
  // ⚠ `mindless: true` ADDED 2 Aug. The `why` said *"no mind"* and no flag said it — and `mindless`
  // was FALSE for every people in this table, including the one whose own reasoning says otherwise.
  // Harmless today: a lemure is 45% of an Avernus warcamp and can neither be hired nor defend, so it
  // never reaches a household. **One flag away from personhood** if anybody changes that, and the
  // model would hand a formless mass of suffering a gender, a libido and a faith.
  // ⚠ THE UNDEAD ARE THE MINDLESS HIREABLE THAT DID NOT EXIST (Frank, 2 Aug). Twenty minutes before
  // he raised this, the gate asserted that NO mindless people can be hired — and the comment there
  // said the restriction was about lemures having no HANDS rather than about mindlessness, and that
  // "a mindless people with hands is forbidden by nothing; it simply does not exist yet."
  //
  // It exists now. `MINDLESS_SAY` was written for a state the game could not produce and has a reader
  // the same day. **The assertion flips from "none of them can be hired" to "the ones without hands
  // cannot", which is what it should always have said.**
  // THE THREE NEW POOLS. Mindless where the source says so; the Azer is a person and the Homunculus
  // and Gargoyle are awake enough to take an instruction and resent it.
  Grick:                     { hire: false, defend: true, mindless: true, why: "a mouth on a stalk — no hands, and nothing that could hold a tool" },
  Darkmantle:                { hire: false, defend: true, mindless: true, why: "no hands \u2014 it clings and it drops, and that is the whole repertoire" },
  // ⚠ WAS `hire: true` on the strength of "eats the refuse" — assigned without checking what an
  // otyugh IS. Frank: *"an otyugh should not be staff. They are a large creature that has tentacles
  // and eats trash. They are a defender only."* Correct: LARGE, tentacles rather than hands, and
  // nothing about it takes an instruction and works a room.
  Otyugh:                    { hire: false, defend: true, why: "tentacles that seize but do not manipulate — nothing on it could hold a tool" },
  // No hands is test 1 and settles it on its own — but the noise is recorded, because if anything
  // ever gains hands the room still has to tolerate it.
  "Gibbering Mouther":       { hire: false, hazard: "noise", defend: true, mindless: true, why: "no hands \u2014 nothing on it could hold a tool" },
  Chuul:                     { hire: "outdoor", hazard: "water", defend: true, mindless: true, why: "pincers that grip well enough for open work, in a body no door admits" },
  "Animated Armor":          { hire: true, defend: true, mindless: true, why: "stands a watch forever and needs no bed" },
  "Animated Flying Sword":   { hire: false, defend: true, mindless: true, why: "no hands \u2014 it is a sword, and a sword grips nothing" },
  "Rug of Smothering":       { hire: false, defend: true, mindless: true, why: "no hands — it is a rug, and a rug grips nothing" },
  Homunculus:                { hire: true, defend: false, why: "small, quick, made to be useful \u2014 for the desk rather than the anvil" },
  "Dust Mephit":             { hire: true, defend: true, why: "bound, insolent, and surprisingly good at fetching" },
  "Ice Mephit":              { hire: true, defend: true, why: "as the dust, and colder about it" },
  // ⚠ THE SAME PROBLEM AS THE MAGMIN, applied universally rather than to the case named. "A fire
  // risk" was a note in a comment; now it is a field the hiring reads.
  "Magma Mephit":            { hire: true, hazard: "fire", defend: true, why: "an excellent hand at a forge and a fire risk anywhere else" },
  "Steam Mephit":            { hire: true, hazard: "fire", defend: true, why: "scalding, talkative, and better placed somewhere already hot" },
  // ⚠ NOT "outdoor" — Frank: *"a magmin would make an excellent blacksmith, but I wouldn't want to
  // let them inside the house because fire."* It is SMALL and fits through every door; the problem is
  // the FIRE, and a forge is a building whose entire purpose is fire. Size and hazard are different
  // questions and were being answered by the same field.
  Magmin:                    { hire: true, hazard: "fire", defend: true, why: "an excellent smith, and a catastrophe in any room that is not already alight" },
  // An azer is a body of living flame under bronze — a superb smith, and the same hazard.
  Azer:                      { hire: true, hazard: "fire", defend: true, why: "a smith of the elemental planes, and warm enough to matter in a room full of paper" },
  // ⚠ Medium, hands, STONE. Needs no food, no sleep, no shelter, and will hold a position for a
  // century without complaint. The trait that makes it a dull opponent makes it the best gatekeeper
  // in the building.
  Gargoyle:                  { hire: true, defend: true, why: "needs no food, no sleep and no shelter, and will hold a post for a century without being asked twice" },
  Skeleton:            { hire: true, defend: true, mindless: true, why: "stands up, takes an instruction, and does not need feeding or paying" },
  Zombie:              { hire: true, defend: true, mindless: true, why: "slow, tireless, and will keep at a thing long after anybody living would stop" },
  // ⚠ WAS `defend: true`. Frank: *"warhorse skeleton is an ANIMAL undead — not even a defender."*
  // Correct: it is a HORSE. It does not hold a wall, it pulls a cart and carries a rider, and the
  // only reason it was a defender is that "undead" and "defender" had got glued together in my head.
  // It is the same category error as `Animals` — a thing the estate KEEPS rather than somebody it
  // employs.
  "Warhorse Skeleton": { hire: false, defend: false, mindless: true, why: "a horse. It hauls and it carries, and it does not hold a line" },
  "Minotaur Skeleton": { hire: "outdoor", defend: true, mindless: true, why: "hands and enormous strength, in a frame no doorway takes" },
  // ⚠ WAS `hire: true` — *"hands and nothing but hands, which is exactly enough for some work."*
  // Frank: *"how does a crawling claw smith anything? It is a severed hand."* It is not enough for
  // ANY work: no body to put behind a hammer and no mind to put behind a pen. It is the one people
  // that fails both halves, which is why it took two separate rulings to catch.
  //
  // It holds a wall, though. A swarm of hands going over somebody is a real problem for them.
  "Crawling Claws":    { hire: false, defend: true, mindless: true, why: "a severed hand \u2014 grip, and no arm behind it, and nothing behind that" },
  // THE GREATER TIER IS NOT MINDLESS. A wight is INT 10 and takes a post as a person would.
  Ghoul:               { hire: true, defend: true, why: "awake, hungry, and perfectly capable of a night watch" },
  Ghast:               { hire: true, defend: true, why: "as a ghoul, and worse company" },
  Wight:               { hire: true, defend: true, why: "remembers being somebody and is nobody's tool" },
  Specter:             { hire: false, defend: true, why: "no hands to work with; it holds a wall by being on the wrong side of one" },
  Wraith:              { hire: false, defend: true, why: "incorporeal \u2014 it cannot lift, carry or hold anything at all" },
  "Vampire Spawn":     { hire: true, defend: true, why: "bound to a master and useful to whoever holds the leash" },
  // ⚠ THE RESOLVED NAMES, judged on the three tests rather than on vibe.
  //
  // MEENLOCK — Frank supplied the image, and it settles it: hooked GRABBING claws on spindly arms,
  // not hands that close on a tool. It is bright (it plots, it terrifies deliberately) and it cannot
  // hold a hammer or a pen. That is the grick ruling exactly: mind yes, grip no.
  Meenlock:   { hire: false, defend: true, why: "hooked claws for seizing, and nothing on it that closes around a tool" },
  // BOGGLE — Small, oily, handed, and canonically a nuisance rather than a monster. It works.
  Boggle:     { hire: true, defend: true, why: "small, quick, greasy, and perfectly able to hold a thing" },
  // DARKLING — Small fey, handed. Its light sensitivity is real and belongs on the nocturnal axis.
  Darkling:   { hire: true, defend: true, why: "hands, and an aversion to bright light that costs it nothing after dark" },
  // KORRED — Medium, handed, strong; its magic is in its hair, which is not a work restriction.
  Korred:     { hire: true, defend: true, why: "stocky, strong, and better with rope and stone than most of the household" },
  // MERREGON — legion devil, Medium, handed, and made to follow orders exactly.
  Merregon:   { hire: true, defend: true, why: "hands, discipline, and no interest whatever in why" },
  // NUPPERIBO — the rank below a lemure: blind, mindless, swarming. It is a lemure with worse press.
  Nupperibo:  { hire: false, defend: false, mindless: true, why: "blind, mindless, and moves only where the swarm moves" },
  Abishai:    { hire: true, defend: true, why: "Tiamat\u2019s own, winged and handed, and vain about both" },
  Amnizu:     { hire: true, defend: true, why: "an administrator of the Styx; hands, and a great deal of paperwork behind them" },
  Orthon:     { hire: true, defend: true, why: "a bounty hunter with hands, tools and a long memory" },
  "Lemure":        { hire: false, defend: false, mindless: true, why: "a formless mass of suffering \u2014 no hands, no mind, no post" },
  "Animals":       { hire: false, defend: false, why: "not a people at all \u2014 a bucket for the wildlife a region contains, with no body to speak of" },
  // ⚠ WAS `hire: "outdoor"` — and Frank corrected me twice on the same entry. The first correction
  // was that a WILD dryad's tree-binding says nothing about a called one. The second is that I then
  // confused **where she works** with **where she sleeps**:
  //
  //   *"The dryad probably can work in all kinds of different spots in the house. The tree needs to
  //    appear in an outdoor location, and the tree acts as her residence — it's her bed, basically."*
  //
  // She works anywhere a person works. The TREE is housing, not a workplace, and it is the reason
  // she needs open ground on the estate at all. See DRYAD_TREES and the housing rule.
  "Dryad":         { hire: true, defend: true, vulnerable: "fire", why: "works where anybody works, and sleeps in a tree that has to be somewhere on the grounds" },
  // TOO SMALL TO DO THE WORK. Sentient, willing, and twelve inches tall. A pixie cannot swing a
  // smith's hammer, turn a roast, or hold a wall — the limit is REACH and MASS, not mind, which is
  // exactly the distinction Frank drew: "sentience AND physical capacity to complete work."
  // ⚠ THE TINY QUESTION, resolved by the three tests rather than by size. A pixie HAS hands, fits
  // through anything, and damages nothing — it passes all three. "The work is the wrong size" was me
  // deciding what work is, and a house has a great deal of small careful work in it. An imp and a
  // homunculus were already hireable on exactly these grounds; the inconsistency was mine.
  //
  // They do not hold a WALL, and that is a body fact: a foot tall is a foot tall when something
  // comes over the ditch.
  "Pixie":         { hire: true, defend: false, why: "a foot tall \u2014 no weight for a hammer, and every precision the letters need" },
  "Sprite":        { hire: true, defend: false, why: "smaller still, and small careful work is still work" },
  "Quickling":     { hire: true, defend: false, why: "a foot tall and faster than anybody can follow, which is an asset in a house and a liability on a wall" },

  // ─── WALL ONLY: they fight, they do not keep house ──────────────────────────────────────────────
  // ⚠ WAS "a soldier of the Blood War, and nothing else". Medium, hands, and canonically NEVER
  // SLEEPS with alertness past anything living. A house with one is a house where nothing goes
  // unnoticed at three in the morning. "And nothing else" was a claim about reputation.
  "Barbed Devil":  { hire: true, defend: true, why: "never sleeps and misses nothing, which is worth more indoors than on a wall" },
  // ⚠ WAS "useless indoors" — and its canon job is MESSENGER. Small, flies, has hands. A thing whose
  // published purpose is carrying things quickly is not useless in a building with corridors.
  "Spined Devil":  { hire: true, defend: true, why: "flies, carries, and was made to run errands faster than anybody walking" },
  "Bone Devil":    { hire: "outdoor", defend: true, why: "hands enough for any work and a frame no corridor admits" },
  "Horned Devil":  { hire: "outdoor", defend: true, why: "hands, and a wingspan that decides which side of the wall it works on" },
  // ⚠ WAS "a torturer — the one post no keep is offering". True of the JOB and not of the SKILLS: it
  // animates chains, which is to say it is expert with locks, restraints and anything that fastens.
  // A jailer's hands are a locksmith's hands.
  "Chain Devil":   { hire: true, defend: true, why: "expert with every lock, hinge and fastening in the building, for reasons nobody asks about" },
  // ⚠ Medium, hands. "Infantry" is a job it had, not a limit on the body. A BOUND thing behaves.
  "Bearded Devil": { hire: true, defend: true, why: "holds a temper indoors that it was never asked to hold anywhere else" },
  // ⚠ A bucket for the devil ranks, all of which are now hireable on their own merits.
  "Other Devil":   { hire: true, defend: true, why: "whatever rank it is, it has hands and a term of service" },
  "Erinyes":       { hire: true,  defend: true, why: "disciplined and literate; the one devil that could actually keep a ledger" },
  // ⚠ Frank ruled this TWICE: *"the treant can serve in only two roles — defenders, or working in
  // the garden."* The old reason was temperament — "does not take wages or a post" — and the ruling
  // had nowhere to live. **It cannot fit through a door. That is not the same as unemployable.**
  "Treant":        { hire: "outdoor", defend: true, vulnerable: "fire", why: "will not fit through any door in the building, and works the open ground gladly" },
  // ⚠ Medium, hands, and its own voice keeps the household lore accurately, unasked. "Savage" is
  // where it was found, not what it can do.
  "Quaggoth":      { hire: true, defend: true, why: "hands, patience, and a memory for where everything in the house is kept" },
  // ⚠ WAS `hire: false`, *"blind, feral and pack-minded — it holds a line and nothing finer"* — and
  // the VOICE written for them on 2 Aug describes somebody who learns your walk, counts the household
  // by breathing, smells rain three hours early and takes the night work permanently as a kindness to
  // everybody else. **Two tables disagreeing about the same being**, exactly as the treant's
  // `none, "a tree"` did.
  //
  // Frank: *"grimlocks would make good house staff."* They would, and the reason is in the voice:
  // **blind is irrelevant indoors and an advantage at night.** A household that keeps a grimlock is a
  // household that stops paying for lamps after dark. The old entry described a monster in a tunnel;
  // this one has taken a post.
  "Grimlock":      { hire: true, defend: true, why: "blind, which indoors costs nothing and after dark is worth a great deal" },
  "Troll":         { hire: "outdoor", defend: true, why: "hands, tireless, and needs more doorway than any workroom has" },
  "Minotaur":      { hire: "outdoor", defend: true, why: "hands and enormous strength, and horns that catch on everything indoors" },
  // ⚠ WAS "murderous by nature; useful only pointed outward". Malice is not incapacity — a hag is
  // worse and holds a post. Small, hands, and perfectly able to do a job it has been given.
  "Redcap":        { hire: true, defend: true, why: "small, capable, and unpleasant, which is a description of half the trades" },
  // ⚠ That is about the TERMS, not the capability — and a hag sent by a patron is not being paid,
  // she is bound. Medium, hands, and cleverer than anybody else in the building.
  "Hag":           { hire: true, defend: true, why: "does the work exactly, and the household has learned not to ask what she is owed" },
  // ⚠ "A raider, not a servant" describes where it was found. Medium, hands, and its own voice is
  // somebody who left a flight to take this post.
  "Pterafolk":     { hire: true, defend: true, why: "wings, hands, and the roof route to anywhere in the building" },
  // ⚠ "No hands free for indoor work" is simply wrong — a centaur has two hands and uses them. The
  // constraint is the DOORWAY and nothing else, so the yard is open to it.
  "Centaur":       { hire: "outdoor", defend: true, why: "two good hands and a body no corridor was built for" },

  // ─── FULL HIRELINGS: sentient, handed, and willing ──────────────────────────────────────────────
  // Everything below could equally be omitted, since the table defaults to capable — they are listed
  // EXPLICITLY because Frank asked for a pass over every people rather than a whitelist of the odd
  // ones. A reader should be able to see that a Bugbear was CONSIDERED and cleared, not overlooked.
  "Human": { hire: true, defend: true }, "Elf": { hire: true, defend: true }, "Dwarf": { hire: true, defend: true },
  "Halfling": { hire: true, defend: true }, "Gnome": { hire: true, defend: true }, "Half-Elf": { hire: true, defend: true },
  "Half-Orc": { hire: true, defend: true }, "Orc": { hire: true, defend: true }, "Tiefling": { hire: true, defend: true },
  "Dragonborn": { hire: true, defend: true }, "Goliath": { hire: true, defend: true }, "Drow": { hire: true, defend: true },
  "Duergar": { hire: true, defend: true }, "Svirfneblin": { hire: true, defend: true }, "Wild Dwarf": { hire: true, defend: true },
  "Half-Vistani": { hire: true, defend: true }, "Caliban": { hire: true, defend: true }, "Astral Elf": { hire: true, defend: true },
  "Githyanki": { hire: true, defend: true }, "Giff": { hire: true, defend: true }, "Eladrin": { hire: true, defend: true },
  "Shadar-kai": { hire: true, defend: true }, "Firbolg": { hire: true, defend: true }, "Satyr": { hire: true, defend: true },
  "Lizardfolk": { hire: true, defend: true }, "Thri-kreen": { hire: true, defend: true }, "Plasmoid": { hire: true, defend: true },
  "Goblin": { hire: true, defend: true }, "Kobold": { hire: true, defend: true }, "Bugbear": { hire: true, defend: true },
  // ⚠ WAS `hire: true`. An ogre is LARGE — the same test that bars a troll and a minotaur from a
  // workroom bars an ogre, and I had let it through because it *seemed* biddable. **The error running
  // the other way**: temperament admitting somebody the body excludes, which is the same mistake as
  // temperament excluding somebody the body admits. Its own voice says so — *"ducks constantly",
  // "apologises for the doorway"*.
  "Ogre": { hire: "outdoor", defend: true, why: "strong, careful and biddable, in a body that apologises to every doorway it meets" },
  "Imp": { hire: true, defend: true, why: "small, literate, and constitutionally nosy \u2014 a natural clerk" },
  "Dark Fey": { hire: true, defend: true }, "Other Fey": { hire: true, defend: true }, "Gloaming": { hire: true, defend: true },

  // ─── MINDLESS BUT ABLE: the skeleton case ───────────────────────────────────────────────────────
  // Frank: "if you are just a skeleton, all of your personality traits get thrown in the wastebin and
  // you act like an automaton." So `mindless` is a THIRD flag, not a third value of the first two: it
  // can work, it can hold a wall, and it has no inner life to form bonds with. The household week
  // gives it no traits, no reactions and no relationships \u2014 it is a pair of hands and a name.
  //
  // NOTHING IN THE CURRENT TABLES IS MINDLESS. The flag exists because the ruling was made and
  // because animated servants are an obvious After Dark facility; the machinery reads it already, so
  // the day a Skeleton or a Zombie enters a pool it behaves correctly with no further work.
  "Autognome": { hire: true, defend: true, why: "a construct, but a thinking one \u2014 it has opinions and keeps them" },
};

// ⚠ `hire` IS NOT A BOOLEAN (Frank, 2 Aug). He ruled twice that a treant *"can either be a defender
// or work in the garden"*, and the entry said *"does not take wages or a post"* — so the ruling had
// nowhere to live. **A treant cannot fit through a door; that is not the same as being unemployable.**
//
// The same is true of the centaur, whose entry claimed *"no hands free for indoor work"* — a centaur
// has two hands and uses them. The constraint is the DOORWAY.
//
//   true      any post
//   "outdoor" posts in open-air facilities only — a courtyard, a yard, a garden when one exists
//   false     no post at all, and the reason must be a fact about the body
//
// `OUTDOOR_FACILITIES` is deliberately small and will grow: the DMG's fifteen rooms include exactly
// one open-air space today, so a treant's employment is currently narrow and REAL rather than
// theoretical, and the moment a garden is minted it widens by itself.
// ---- THE ARRANGEMENT (Frank, 2 Aug) -------------------------------------------------------------
// *"The idea of a vampire spawn being middle management of an estate run by a hero, politely taking
// care of his own vampire needs through access to livestock and working a regular nine-to-five job
// (9 PM to 5 AM) is incredibly funny to me."*
//
// **And it is funny because the horror is load-bearing and entirely handled.** Gary genuinely needs
// blood. There genuinely is a solution. The solution is a standing arrangement with the livestock and
// a note left on the bench.
//
// So it is a LINE ITEM rather than a threat — the same treatment as the permit fee, and for the same
// reason: the thing a vampire IS shows up in a column of a ledger. Somebody is responsible for it. It
// costs money every week. Somebody once tried to economise on it and was talked out of that.
//
// Where the animals live: a Stable if the estate has one, otherwise the yard. A household with a
// vampire on the books keeps more livestock than its acreage suggests, and has an answer ready.
export const LIVESTOCK_WEEKLY_GP = 12;   // four beasts kept beyond what the land needs, and replaced

export const ARRANGEMENT_SAY = [
  "The keep runs four more goats than the acreage wants and the steward has an answer ready for anybody who asks.",
  "{a}'s arrangement went on the week's accounts as feed, which is not untrue.",
  "Somebody suggested economising on the livestock and was talked out of it at some length.",
  "The beasts are kept apart from the rest and nobody has ever had to be told which ones.",
  "{a} settled with the herdsman directly and the household has never seen the terms.",
  "A visitor asked why an estate this size keeps so many goats and got a perfectly good answer about hides.",
  "{a} was at the pens before dawn and back indoors before the light was any use to anybody.",
  "The arrangement costs about what a second cook would, and nobody has proposed a second cook.",
  "{a} has never once been seen at it, which the household understands to be a courtesy.",
  "One of the beasts is off its feed and {a} noticed before the herdsman did.",
];

// ---- WHO IS AWAKE WHEN (Frank, 2 Aug) -----------------------------------------------------------
// *"A vampire spawn probably shouldn't be awake during the day. They should only be out and active at
// night when everyone else has gone to bed — at least all the diurnal people have gone to bed."*
//
// 5e draws the line for us, and in two tiers rather than one:
//
//   MUST      Sunlight HYPERsensitivity — 20 radiant damage a turn in sunlight. Not a preference:
//             a vampire spawn cannot be out in daylight and survive it.
//   PREFERS   Sunlight Sensitivity — disadvantage on attacks and sight-based perception. A drow, a
//             duergar or a kobold works days badly and nights well.
//
// This is a SHIFT, not a capability: it does not change what somebody can do, only when. A household
// with a vampire spawn in it has somebody moving about at three in the morning, and the day staff
// have opinions about that.
export const NOCTURNAL: Record<string, "must" | "prefers"> = {
  "Vampire Spawn": "must",       // 5e: Sunlight Hypersensitivity
  Wraith: "prefers",             // 5e: Sunlight Sensitivity
  Specter: "prefers",
  Drow: "prefers",
  Duergar: "prefers",
  Kobold: "prefers",
  Gloaming: "prefers",           // Underdark planetouched; light is a choice and daylight is not
  Grimlock: "prefers",           // blind, so day and night are identical — and the keep saves lamps
};
export const nocturnalOf = (sp?: string | null) => (sp && NOCTURNAL[sp]) || null;

// A resting place is not a bed. It is somewhere lightless with the right earth in the bottom of it,
// and it is the reason a vampire spawn takes a housing slot at all.
export const RESTING_PLACE_SAY = [
  "{a} keeps a long box in the cellar with a hand's depth of earth in the bottom of it, and nobody asks.",
  "{a} is not to be disturbed between dawn and dusk, and the household has stopped needing to be told.",
  "{a} came up at dusk having been somewhere nobody has been shown.",
  "{a} was carrying a sack of grave-earth across the yard and did not offer an explanation.",
  "{a} shut the cellar door at first light and it stayed shut all day.",
];
export const NIGHT_SHIFT_SAY = [
  "{a} did the whole of it overnight and the household came down to it finished.",
  "{a} and the day staff overlap for about an hour at dusk, and that hour is when anything gets agreed.",
  "{a} works the hours nobody else wants and has never once been thanked for the arrangement.",
  "The household leaves notes for {a} now, which is how a house with a night hand ends up running on paper.",
  "{a} was awake at three and there was somebody awake at three to hear about it.",
];

// ---- WHO ACTUALLY SLEEPS (2 Aug) ----------------------------------------------------------------
// Found by asking Frank's question — *"are there other races that would benefit from 2e clarity,
// only where 5e doesn't speak?"* — and discovering that **5e speaks perfectly clearly and nothing was
// reading it.**
//
// The bed exemption was keyed on `mindless`, because a skeleton was the case in front of me when I
// wrote it. **The property that matters is whether the thing SLEEPS**, and ten peoples were being
// given beds who do not:
//
//   Wight · Ghoul · Ghast · Vampire Spawn · Specter   undead; 5e's undead nature
//   Autognome · Homunculus                            constructs
//   Gargoyle                                          5e, verbatim: "doesn't require air, food,
//                                                     drink, or sleep"
//   Thri-kreen                                        5e: thri-kreen do not sleep
//
// **A bed given to something that does not sleep is a bed a living hireling does not get** — the same
// argument as the mindless exemption, and the same mistake underneath it: I fixed an instance and
// called it a rule.
//
// Devils are NOT here. 5e says nothing about an imp or an erinyes sleeping, and §9 says silence is
// not permission to invent — so they sleep, and take a bed, until something says otherwise.
export const SLEEPLESS = new Set([
  "Skeleton", "Zombie", "Warhorse Skeleton", "Minotaur Skeleton", "Crawling Claws",
  // ⚠ VAMPIRE SPAWN REMOVED (Frank, 2 Aug): *"a vampire spawn should absolutely sleep during the day
  // whenever everyone else is awake. In classical mythology vampires must sleep in their grave dirt,
  // and the reason they sleep in a coffin is because the coffin has their grave dirt lining the
  // bottom of it and a coffin protects them from the sunlight."*
  //
  // 5e agrees and is stronger than I had it: **Sunlight HYPERsensitivity — 20 radiant damage when it
  // starts its turn in sunlight**, not the mere disadvantage the drow get. And the vampire entry
  // names *"its resting place"* outright. It sleeps, it needs somewhere lightless to do it, and it
  // is awake when the household is not.
  "Ghoul", "Ghast", "Wight", "Specter", "Wraith",
  "Animated Armor", "Animated Flying Sword", "Rug of Smothering", "Homunculus", "Autognome",
  "Gargoyle", "Thri-kreen", "Lemure",
]);
export const speciesSleeps = (sp?: string | null) => !(sp && SLEEPLESS.has(sp));

// ---- WHAT THE ROOM DOES TO THE WORKER (Frank, 2 Aug) --------------------------------------------
// *"Dryads are flammable. Why would they be in the smithy?"*
//
// **`hazard` runs one way and this runs the other.** A magmin damages the room; a forge damages a
// dryad. I had built only the first direction, so a creature made of living wood was cheerfully
// assigned to stand next to an open hearth all day.
//
// 2e settles how serious this is: *"a dryad suffers damage for any damage inflicted upon her home
// tree"* — she IS the tree, and fire is what happens to trees. It is not a preference.
export const VULNERABLE_TO: Record<string, Set<string>> = {
  // Rooms with an open flame in them as a matter of course.
  fire: new Set(["smithy", "forge", "kiln", "kitchen"]),
};
export const roomHarms = (vuln?: string | null, defId?: string | null) =>
  !!(vuln && VULNERABLE_TO[vuln] && defId && VULNERABLE_TO[vuln].has(defId));

// ---- A DRYAD ARRIVES WITH A TREE (Frank, 2 Aug) --------------------------------------------------
// *"If a dryad is hired, her tree must appear in the garden — if it wasn't previously mentioned it
// must be detailed as being present. Once she is hired a tree must appear as though it has always
// been there. It could also be in the courtyard. It needs to be somewhere in the estate for the
// dryad to be present, and if there is more than one dryad, guess what, there's more than one tree.
// The tree could have been otherwise innocuous until the dryad emerged and offered their services,
// which is why it wasn't mentioned before."*
//
// **The retroactive framing is the whole of it.** The tree is not planted and does not arrive. It was
// always in the yard and nobody had reason to remark on it — which is exactly why the household never
// mentioned it, and exactly how a dryad would arrange matters. One tree per dryad, in whichever open
// ground she was taken on at.
// ⚠ 2e IS SPECIFIC AND IT MATTERS: a dryad is bound to *"a single, very large OAK tree"*, cannot go
// more than 360 yards from it, and *"suffers damage for any damage inflicted upon her home tree."*
// She is not merely housed by it — she IS it, which is why fire in a workroom is a lethal question
// rather than a comfort one, and why the tree must stand somewhere on the grounds.
//
// 360 yards covers any bastion, so she works anywhere in the building. And 2e notes up to six dryads
// in one place, *"a number of dryad oaks within 100 yards of one another"* — which is Frank's
// multiple-dryads case, already in the sources.
//
// Frank: *"the trees should not only exist in the courtyard. They could also exist in the garden.
// They could also exist next to the wall."* So the tree wants OPEN GROUND on the estate, not a
// particular facility — and a walled keep has ground along the wall whether or not it has a yard.
export const DRYAD_TREES = [
  // ⚠ `{where}` is a PLACE and the line has to read with either a room name or a stretch of ground —
  // the first pass produced *"the oak beside the ground along the inside of the wall gate"*. Written
  // so the slot always follows a preposition and never takes a noun after it.
  "the old oak at the north end of the {where}, which everybody has always walked past",
  "the crooked oak on the {where} that nobody can remember being planted",
  "the big oak in the corner of the {where}, older than the wall it stands against",
  "the oak that shades the {where}, and always has",
  "the twisted old oak at the edge of the {where}, too gnarled and awkward to have been cleared",
  "the oak the path bends around on its way across the {where}, because it was there first",
];
// Where the ground is. An outdoor facility if the estate has one; otherwise the strip along the wall,
// which any walled keep has and which nobody has ever thought of as a place.
export const TREE_GROUND = ["courtyard", "garden", "stable", "pasture", "dock", "greenhouse"];
// ⚠ AND THE WALL NEEDS ITS OWN LINES. Forcing "the ground along the inside of the wall" through a
// slot written for a room name produced *"the big oak in the corner of the ground along the inside
// of the wall"*. A phrase that is not a place-name cannot be substituted into a sentence that
// expects one — the same lesson as {w} carrying its own article, in a different costume.
export const DRYAD_TREES_WALL = [
  "the old oak that stands against the inside of the wall, which everybody has always walked past",
  "the crooked oak in the strip of ground along the wall, that nobody can remember being planted",
  "the big oak growing hard against the wall, older than the wall itself",
  "the oak by the wall that the household has always used for shade",
  "the twisted old oak in the lee of the wall, too gnarled and awkward to have been cleared",
  "the oak the path bends around where it runs along the wall, because it was there first",
];

export const DRYAD_EMERGED = [
  "{a} came out of {tree} one morning and asked whether the household needed anybody.",
  "{a} stepped out of {tree} and had clearly been listening for some time.",
  "Nobody had thought twice about {tree} until {a} walked out of it and introduced herself.",
  "{a} was in {tree} the whole while, and says so as though it should have been obvious.",
  "{a} emerged from {tree} on a wet afternoon and did not explain the timing.",
];
// ⚠ AND THE TREE IS A BED (Frank, 2 Aug): *"the tree acts as her residence — it's her bed, basically,
// which means a room that normally does not contain a bed would contain a bed that is preassigned to
// the dryad that was hired."*
//
// So a dryad is HOUSED by her tree and never competes for a bedroom slot, and the open-air facility
// she is rooted in acquires a bed it does not otherwise have — reserved, permanently, for her. That
// is why she needs open ground on the estate even though she works indoors.

// What the household says afterwards, when the tree is simply part of the place again.
export const DRYAD_TREE_SAY = [
  "{a} spent the afternoon in {tree} and came out when there was work.",
  "Somebody suggested taking a branch off {tree} and the suggestion was not repeated.",
  "{a} was not anywhere, and then was, and {tree} had not appeared to move.",
  "The household waters {tree} in dry weather now, which nobody has ever discussed doing.",
  "{a} put a hand on {tree} while thinking about something else.",
];

// ---- WORK THAT NEEDS A BODY BEHIND IT (Frank, 2 Aug) --------------------------------------------
// *"How does a crawling claw smith anything? That doesn't work. Think about it — it is a severed
// hand."*
//
// **He is right and it exposes a hole in test 1.** I had been checking *does it have something
// hand-shaped* when the test should be *can it do the work*. A severed hand grips. It has no arm, no
// shoulder, and nothing to put behind a hammer.
//
// So test 1 was really two tests wearing one name:
//
//   GRIP    can it hold the tool at all?          hands, pincers, something that closes
//   FORCE   can it bring a body's weight to bear? an arm, a back, a mass to swing
//
// A smith needs both. A scribe needs only the first. **And that is why the same split makes the tiny
// peoples into clerks rather than into nothing** — a pixie cannot swing a hammer and can absolutely
// copy a page, which is the honest answer to a question I had been fudging in both directions.
export const FORCEFUL_FACILITIES = new Set([
  "smithy",      // a hammer, an anvil, and a body swinging one at the other
  "workshop",    // saws, planes, timber
  "storage",     // hauling
  "kitchen",     // pots, sacks, a full kettle
  "barrack",     // arms drill
  "armory",      // moving and maintaining war gear
  "courtyard", "garden", "stable", "pasture", "dock",
]);
export const facilityNeedsBody = (defId?: string | null) => !!(defId && FORCEFUL_FACILITIES.has(defId));

// Which peoples have grip but no body to put behind it. A severed hand is the pure case; a foot-tall
// creature is the same problem at a different scale.
export const NO_BODY = new Set(["Crawling Claws", "Pixie", "Sprite", "Quickling", "Homunculus", "Imp"]);
export const hasBody = (sp?: string | null) => !(sp && NO_BODY.has(sp));

// ---- WORK THAT NEEDS A MIND (Frank, 2 Aug) ------------------------------------------------------
// *"Mindless creatures cannot work jobs that require intellect — like scroll copying, for example. A
// skeleton can swing a hammer, but a skeleton cannot write a scroll. Not successfully, anyway."*
//
// **A fourth test, and it is about the WORK rather than the room.** The first three ask whether a
// body can hold a tool, reach the room, and coexist with what is in it. This one asks whether the
// task can be done at all by something with nothing behind its eyes.
//
// A skeleton in a smithy is a bellows and a hammer arm and it is genuinely useful. The same skeleton
// in a scriptorium produces pages of confident nonsense — which is worse than an empty desk, because
// somebody has to notice before the scroll is sold.
//
// The line is the ORDER, not the room's furniture: `research`, and `craft` where the craft is
// letters or magic. A smithy crafts and a scriptorium crafts, and only one of them is thinking.
export const MINDFUL_FACILITIES = new Set([
  "archive",       // research — reading, cross-referencing, knowing what you found
  "library",       // research
  "scriptorium",   // craft: copying scrolls, which is the example Frank gave
  "arcane_study",  // craft: magic items
  "observatory",   // empower — observation and interpretation
]);
export const facilityNeedsMind = (defId?: string | null) => !!(defId && MINDFUL_FACILITIES.has(defId));

// ---- WHAT A ROOM CAN TOLERATE (Frank, 2 Aug) ----------------------------------------------------
// *"A magmin would make an excellent blacksmith, but I wouldn't want to let them inside the house
// because fire."*
//
// **That breaks `outdoor` as a category**, and correctly. A magmin is Small — it fits through every
// door in the building. Its problem is not SIZE, it is a HAZARD, and a hazard is not answered by
// "indoors or out" but by **what the room it is standing in can already tolerate.** A forge is a
// building whose entire purpose is fire. A library is where the same creature is a catastrophe.
//
// So the two constraints separate, because they were never the same question:
//
//   SIZE    can it get to the work?              -> `hire: "outdoor"` when a door will not take it
//   HAZARD  does its presence damage the work?   -> `hazard`, checked against what the room tolerates
//
// A smithy is not "outdoors". It is indoors and it is already on fire.
export const HAZARD_TOLERANT: Record<string, Set<string>> = {
  // Rooms where an open flame is the point rather than the emergency.
  fire: new Set(["smithy", "forge", "kiln", "courtyard", "garden", "stable", "pasture", "dock", "trainingarea", "greenhouse"]),
  // Rooms where constant noise costs nothing. A gibbering mouther in an archive is unusable; in a
  // yard it is merely unpleasant.
  noise: new Set(["courtyard", "garden", "stable", "pasture", "dock", "trainingarea", "smithy", "barrack"]),
  // Rooms that are already wet, or do not mind being.
  water: new Set(["dock", "courtyard", "garden", "kitchen", "pasture"]),
};
export const roomTolerates = (hazard?: string | null, defId?: string | null) =>
  !hazard || !!(HAZARD_TOLERANT[hazard] && defId && HAZARD_TOLERANT[hazard].has(defId));

export const OUTDOOR_FACILITIES = new Set(["courtyard", "garden", "stable", "pasture", "trainingarea", "greenhouse", "dock"]);
export const facilityIsOutdoor = (defId?: string | null) => !!(defId && OUTDOOR_FACILITIES.has(defId));

export function speciesCanHireAt(sp: string | null | undefined, defId?: string | null): boolean {
  const r = sp ? SPECIES_ROLES[sp] : null;
  const h = r ? r.hire : true;
  if (h === false) return false;
  // ⚠ AND WHETHER THE WORK NEEDS A MIND (Frank, 2 Aug). A skeleton can swing a hammer and cannot
  // write a scroll — not successfully. This is about the TASK rather than the room's tolerance, and
  // it is the one test that reads the worker's mind rather than its body.
  if (defId && facilityNeedsMind(defId) && speciesMindless(sp)) return false;
  // ⚠ AND WHETHER THERE IS A BODY BEHIND THE HANDS. A crawling claw grips and cannot swing; a pixie
  // is the same problem at a different scale. Both can do precise work and neither can forge.
  if (defId && facilityNeedsBody(defId) && !hasBody(sp)) return false;
  // ⚠ AND WHAT THE ROOM DOES TO THE WORKER. `hazard` asks what the creature does to the room; this
  // asks the reverse, and I had only built one direction — so a dryad, who is made of living wood
  // and *"suffers damage for any damage inflicted upon her home tree"*, was being posted to a forge.
  if (r && r.vulnerable && roomHarms(r.vulnerable, defId)) return false;
  // SIZE: a door either takes it or it does not.
  if (h === "outdoor" && !facilityIsOutdoor(defId)) return false;
  // Then HAZARD, which is a different question and is answered by the ROOM. A magmin is Small and
  // fits everywhere; what it cannot do is stand in a library.
  if (r && r.hazard && !roomTolerates(r.hazard, defId)) return false;
  return true;
}
export const speciesCanHire   = (sp?: string | null) => { const r = sp ? SPECIES_ROLES[sp] : null; return !r || r.hire !== false; };

// A mindless worker has no inner life: no traits, no reactions, no bonds. It is a pair of hands and
// a name. Read by the household week so the day an animated servant enters a pool it behaves
// correctly with no further work.
export const speciesMindless = (sp?: string | null) => { const r = sp ? SPECIES_ROLES[sp] : null; return !!(r && r.mindless); };

export const speciesCanDefend = (sp?: string | null) => { const r = sp ? SPECIES_ROLES[sp] : null; return !r || r.defend !== false; };

// Re-weight a pool to only those who can do the job. If NOBODY in a pool can (an Avernus war camp
// staffing a kitchen is close), fall back to the whole pool rather than returning nothing — a keep
// with an impossible staffing problem should still produce somebody, and the fiction can explain it.
// Returning an empty pool would be a crash dressed as a rule.
export function poolFor(pool: Record<string, number>, job: "hire" | "defend", defId?: string | null): Record<string, number> {
  // ⚠ AND WHICH ROOM (Frank, 2 Aug). `hire` is three-state now, so "can this people hold a post" is
  // not answerable without knowing WHICH post — a treant works the yard and will not fit the kitchen.
  // Absent a room this stays the old question, which is right for a population query.
  const ok = job === "hire"
    ? (sp: string) => (defId === undefined ? speciesCanHire(sp) : speciesCanHireAt(sp, defId))
    : speciesCanDefend;
  const out: Record<string, number> = {};
  Object.entries(pool).forEach(([sp, w]) => { if (ok(sp)) out[sp] = w; });
  if (Object.keys(out).length) return out;

  // ⚠ THE NEVER-EMPTY FALLBACK WAS RETURNING THE UNFILTERED POOL (limit-break, 2 Aug) — which hands
  // back **exactly the people it just excluded**, and put a minotaur in a workshop, a pixie in a
  // kitchen and a sprite in a smithy. Five in 765 placements, only in the regional path, and only
  // when a locale's whole population happened to fail the room.
  //
  // The never-zero rule is right: a room should not silently stay empty. But *"somebody rather than
  // nobody"* cannot mean somebody who physically cannot do the job — **an unfillable post is honest
  // and a minotaur at a workbench is a lie.**
  //
  // So the fallback widens the SEARCH rather than dropping the TEST: try the baseline population,
  // and past that, whoever turns up from outside. Somebody always arrives; they are simply not local.
  const baseline: Record<string, number> = {};
  Object.entries(SPECIES_BY_REGION.swordcoast).forEach(([sp, w]) => { if (ok(sp)) baseline[sp] = w; });
  if (Object.keys(baseline).length) return baseline;
  return { Human: 1 };
}

// The chance a hireling or defender comes from somewhere else entirely — a people with no weight in
// this region at all.
//
// FRANK GUESSED 1-3% AND CANON AGREES. Every published 3e regional breakdown ends with "misc. 1%" —
// Waterdeep, Luruar, Cormyr all do. That last percent IS this draw: the people who are not any of
// the peoples who live here. So the outlander rate is not a house number after all; it is the
// remainder the sourcebooks themselves left, and the cited rows above deliberately omit their
// "misc." line because THIS is where it lives.
//
// Rolled per person, so a large household will usually have one and a small one usually will not,
// which is the right texture: an outlander is remarkable, and remarkable things should be rare
// enough to remark on.
//
// DERIVED PER REGION, 1 Aug — and this fixed a real defect. A flat 1% was wrong because the tables do
// not all leave the same remainder: Waterdeep's names 99% of the population and the Sword Coast
// North's only 96%. The draw normalises over whatever weights exist, so a table summing to 96 gave
// every named people a 100/96 boost and put Waterdeep-style humans two and a half points above their
// published share. **The remainder IS the outlander rate**, it varies by region, and reading it off
// the table is both more faithful and self-correcting: add a people to a region and its outlander
// rate drops by exactly that people's share, with no second number to keep in step.
//
// Floored at 1% so a table that happens to sum to 100 still admits the occasional stranger, and
// capped at 10% so a sparse house row cannot turn a keep into a caravanserai.
export const OUTLANDER_BASE = 0.01;

// ---- WHERE THE LORD GOES RECRUITING ------------------------------------------------------------
// Frank, 1 Aug: "in places like Hell or the Feywild, the person having the estate there would try
// and draw more people from anywhere else to fill the roles... probably a third to nearly half, and
// a quarter to a third for Hell, because that's a lot harder to convince somebody to voluntarily
// go to."
//
// THIS IS A DIFFERENT MECHANISM FROM THE REMAINDER, and the distinction is the whole reason it gets
// its own table. The derived remainder answers "what share of the people HERE does this census fail
// to name" — a fact about the population. This answers "how hard does the OWNER have to recruit
// abroad" — a fact about running an estate somewhere nobody sensible wants to live. A material-plane
// keep hires the district; a keep in Avernus advertises.
//
// (I briefly conflated the two and derived a higher rate from the job-filtered pool. That was wrong
// for the reason recorded at `outlanderChance`: the unemployable are present, not absent. Frank's
// version is right because it never claimed to be arithmetic — it is a behavioural claim about
// somebody establishing a household where the locals are devils.)
//
// THE ASYMMETRY IS THE INTERESTING PART. The Feywild is strange and dangerous and people still go;
// Avernus is a war in a place of torment and they largely do not, so its lord recruits harder and
// lands FEWER outsiders. A higher difficulty produces a lower number, which is the opposite of what
// a naive "hostile = more imports" rule would say.
export const OUTLANDER_RECRUITED: Record<string, number> = {
  feywild: 0.40,   // "a third to nearly half" — the midpoint
  avernus: 0.29,   // "a quarter to a third" — harder to fill, so a thinner result
};

// ALWAYS ON THE RAW POPULATION, never on the filtered pool — and this was briefly wrong on 1 Aug in
// a way worth recording. I made it read the job-filtered pool, reasoning that if only imps can hold
// a post in an Avernus war camp then a keep there must import its staff. **That confuses absent with
// unemployable.** The lemures have not gone anywhere; they are right there and cannot cook. Their
// share is not evidence of strangers arriving, it is evidence that the locals who CAN work are a
// smaller group — which is exactly what re-normalising over the filtered pool already expresses.
//
// The remainder means "people this table does not name". Filtering names nobody new.
// ⚠ THE DEFAULT IS "WHO LIVES HERE", NOT "WHO WORKS HERE" — and the asymmetry is deliberate but it
// cuts both ways. Omitting `job` is CORRECT for a population question and SILENTLY WRONG for a
// hiring one: no capability filter runs, so lemures and dryads come back as candidates, and a
// declared recruitment rate is not applied. No error, just a wrong answer.
//
// If you are asking who could take a POST or hold a WALL, pass the job. If you are asking who is
// THERE, do not. The tables themselves (SPECIES_BY_REGION, SPECIES_BY_LOCALE, SPECIES_ROLES,
// SPECIES_SOURCE) are pure data and safe for any consumer to read directly.
export function outlanderChance(regionId?: string | null, localeId?: string | null, job?: "hire" | "defend"): number {
  const byLocale = regionId && localeId && SPECIES_BY_LOCALE[regionId] && SPECIES_BY_LOCALE[regionId][localeId];
  const pool = byLocale || (regionId && SPECIES_BY_REGION[regionId]) || SPECIES_BY_REGION.swordcoast;
  // A DECLARED RECRUITMENT RATE WINS over the derived remainder, and is NOT capped at 10% — the cap
  // exists to stop a sparse census turning a keep into a caravanserai, and a declared rate is not a
  // sparse census, it is a ruling about how the household is staffed.
  // ONLY WHEN SOMEBODY IS BEING HIRED. A declared recruitment rate is a claim about how hard the
  // OWNER has to advertise, not about who lives on the plane — so applying it to a bare population
  // query said the Feywild is 40% non-fey, which is nonsense. Bug found 1 Aug by a probe printing
  // "present" alongside "hirelings" and the two disagreeing.
  if (job && regionId && OUTLANDER_RECRUITED[regionId] !== undefined) return OUTLANDER_RECRUITED[regionId];
  const named = Object.values(pool).reduce((n, w) => n + w, 0);
  return Math.min(0.10, Math.max(OUTLANDER_BASE, (100 - named) / 100));
}

// Kept for the harness and for anything that wants the floor rather than a region's own figure.
export const OUTLANDER_CHANCE = OUTLANDER_BASE;

// Every people this app knows about, for the outlander draw. Derived from the table rather than
// typed a second time — two lists of the same thing is how one of them goes stale.
export const ALL_SPECIES: string[] = [...new Set(Object.values(SPECIES_BY_REGION).flatMap((r) => Object.keys(r)))].sort();

// ---- HOW SOMEBODY GOT HERE ---------------------------------------------------------------------
// The household week narrated every arrival the same way — "came up from the village as the
// work-bell went" — which is wrong for a keep whose staff arrive by portal, and very wrong for the
// 29% of an Avernus household that had to be recruited off-plane. `outlander` was being WRITTEN on
// every hireling and defender and READ BY NOTHING; this is the first thing that reads it.
//
// Keyed by region for the places where arrival is not a walk. Everywhere else falls through to
// ARRIVAL_SAY, which is still right for a keep in Cormyr.
export const ARRIVAL_LOCAL: Record<string, string[]> = {
  avernus:   [" came up from the camps with the ash still on them.", " reported at the gate and asked, first thing, where the shelter is.", " walked in from the line and did not look back at it."],
  feywild:   [" arrived by a path that was not there yesterday.", " came in with the light, and the light came in with them.", " was simply at the gate one morning, as though they had always been."],
  underdark: [" came up the tunnel with the lamp already out, saving it.", " arrived from the deep roads, and did not blink at the dark.", " came in off the Underway with a guide who would not come further."],
  wildspace: [" came aboard on the tender, kit over one shoulder.", " signed on at the last port and has not stopped looking out yet.", " came down the gangway and stood a moment getting their legs."],
  barovia:   [" came through the mists, and will not talk about the crossing.", " arrived on the Old Svalich Road at an hour nobody travels it.", " came up from the village, quickly, and shut the gate behind them."],
};

// And for somebody who came from somewhere else entirely — the outlander draw made flesh. This is
// the payoff for the whole recruitment model: a statistic becomes a person who had to be talked into
// it. {who} is the arrival.
export const ARRIVAL_OUTLANDER = [
  "{who} arrived with one bag and a signed agreement, having been recruited a very long way from here.",
  "{who} came in today from somewhere nobody at the gate could place, and took the post anyway.",
  "{who} accepted the terms before asking where the work was, and has been quiet since arriving.",
  "{who} turned up at the gate with a letter of engagement and the expression of somebody recalculating.",
  "{who} came the whole way for this post and has already asked twice whether the sky does that all the time.",
  "{who} arrived out of the mists\u2014or the dark, or the between\u2014and nobody is entirely sure which.",
  "{who} was hired somewhere else and delivered here, which is not the same as coming here.",
  "{who} has been asked four times today where they are from and has given three different answers.",
];

// ---- CAMPED AT THE WALL ------------------------------------------------------------------------
// Frank, 1 Aug: an outlander with no bed does not COMMUTE — they CAMP. *"It's unlikely that an
// outlander who has traveled a thousand miles or across the dimensional plane is going to do that
// every morning. The cost alone is ridiculous."* Historically grounded too: great estates accreted
// worker settlements against the wall for exactly this reason, because nobody walks ten miles twice
// a day.
//
// SO THE DISTINCTION IS NOT HOUSED-versus-UNHOUSED, it is THREE states:
//   housed    a bed inside. Fine.
//   commuting a local without a bed — they walk in from the village, as they always did.
//   camped    an OUTLANDER without a bed. There is no village for them to walk in from.
//
// A camped outlander is miserable and says so, and **the misery is regional and depends on whether
// this is their own country.** An imp commuting in from the fiery plain it was hatched on reads
// almost like an ordinary walk to work with weather attached; a half-elf recruited out of Cormyr and
// camped on the same plain is having the worst month of their life and will mention it.
//
// {who} is the person. These fire in the MORNING beat, where the arrivals already are.
export const CAMP_LOCAL: Record<string, string[]> = {
  avernus:   ["{who} slept out under the ash-fall again and made no remark about it.", "{who} came in from the camp with the usual grit in everything and got straight to work."],
  feywild:   ["{who} slept out in the green and says the light is no trouble at all.", "{who} came in from under the trees looking better rested than anyone with a roof."],
  underdark: ["{who} slept out in the dark past the gate and came in without a lamp, as usual.", "{who} came up from the camp and did not need telling twice where anything was."],
  wildspace: ["{who} slept in the hold with the cargo again and calls it the quietest berth aboard.", "{who} came up from below decks having slept through weather that woke everyone with a cabin."],
  barovia:   ["{who} slept out past the gate and swears the wolves keep their distance.", "{who} came in from the camp with the mist still on their coat, unbothered."],
  // NO DEFAULT HERE, DELIBERATELY. I added one on 2 Aug and it was dead the moment it was written —
  // the reader is `CAMP_LOCAL[b.region] || null`, so the twelve unnamed regions get nothing, and
  // that is CORRECT: a local in Cormyr with no bed walks home to the village. There is nothing to
  // say about it. This table exists for the five places where being local is itself strange.

};

// The outlander's version. This is the harassment Frank asked for, and it is meant to be pointed:
// they are not complaining about the WEATHER, they are complaining that they were recruited across a
// plane and are sleeping in a tent. Region-keyed, because "hard to sleep" means something different
// in Hell than in the Feywild.
// ---- WHAT IT COSTS TO SLEEP OUTSIDE, AND WHERE (Frank, 2 Aug) -----------------------------------
// His correction, and it is a correction to the MODEL rather than to the prose: *"an outlander
// travelling to the estate would still need to camp outside no matter where they were. The only
// difference is that the formula changes more dramatically for states that are off the prime
// material plane."*
//
// Exactly right, and the code did not do it. `MORALE_CAMPED_WEEKLY` was **one flat number** — sleeping
// rough outside a Cormyrean keep in mild weather cost precisely what sleeping rough on a fiery plain
// costs. The FLAVOUR varied by region and the COST did not, which is the wrong way round: the words
// were doing work the numbers should have been doing.
//
// A multiplier on the weekly cost. 1.0 is the ordinary world and is the default, because everybody
// camps everywhere — that is his point and it is why there is no exemption list.
export const CAMP_SEVERITY: Record<string, number> = {
  // ⚠ CALIBRATED SO THE STORY STILL HAPPENS. A first pass ran to x2.6 for Avernus and the fuse fired
  // in **1.1 weeks** — before the complaint lines, before `aggrieved`, before the player could
  // possibly act on it. Three gate assertions failed at once and all three were right: the harassment
  // IS the feature, and a cost that kills it is not a harder version of the feature, it is a
  // different and worse one.
  //
  // The range is 1.0 to 1.6, which still separates a fiery plain from a Cormyrean spring by a factor
  // of more than half, and still leaves two to three weeks of somebody saying so.
  //
  // OFF THE PRIME. No walking home in any direction, and the ground itself is hostile.
  avernus: 1.6,        // a fiery plain, a war on, and the ash gets into everything
  wildspace: 1.5,      // air is a commodity and the rock has an edge
  barovia: 1.4,        // the mists do not let anybody leave, and something is out there
  underdark: 1.4,      // no sky, no dawn, and the things that hunt do not need light
  feywild: 1.3,        // beautiful, and the nights do not last the length you expect
  // PRIME, AND STILL NOT ORDINARY.
  icewinddale: 1.4,    // the dale kills people who sleep outside, plainly and every winter
  chult: 1.25,         // wet heat, fever, and a jungle that is occupied
  silvermarches: 1.2,  // the winters decide who was serious
  dessarin: 1.1,       // raided within living memory
  moonsea: 1.1,        // hard country and hard weather
  // Everywhere else is 1.0 by default: unpleasant, ordinary, survivable.
};
export const campSeverity = (region?: string | null) => (region && CAMP_SEVERITY[region]) || 1;

export const CAMP_OUTLANDER: Record<string, string[]> = {
  avernus: [
    "{who} asked again, politely, whether there is any plan for somewhere to sleep that is not on fire-adjacent ground.",
    "{who} fought off two imps in the night and would like that entered in the record.",
    "{who} says the sky does not go dark here and they had not been told that.",
    "{who} has stopped asking about a roof and started asking, more quietly, about the terms of the agreement.",
    "{who} came in having slept perhaps two hours and did not say good morning to anybody.",
  ],
  feywild: [
    "{who} says the music does not stop at night, and would like a door that shuts.",
    "{who} woke somewhere they had not gone to sleep, again, and is not finding it charming.",
    "{who} has asked whether the lights outside the wall are dangerous, and did not like the answer.",
    "{who} says they have not properly slept since arriving and cannot say how long that has been.",
  ],
  underdark: [
    "{who} slept with the lamp lit and would like it on record what that costs in oil.",
    "{who} says something walked past the camp in the night and did not step on anybody, this time.",
    "{who} has asked what stone costs here, in a tone that was not really about stone.",
    "{who} came in grey and quiet and mentioned that there is no morning out there to wake up to.",
  ],
  wildspace: [
    "{who} says the camp is fine except for the part where there is no air budget for it.",
    "{who} has asked twice now what happens to the tents when the ship comes about.",
    "{who} slept strapped down and would like to discuss that at some point.",
  ],
  barovia: [
    "{who} says something was at the edge of the camp again and would like a wall between them and it.",
    "{who} has not slept and will not say why, and asked whether the gate is barred at night.",
    "{who} came in white and would very much like to be indoors by dark from now on.",
  ],
  default: [
    "{who} came in from the camp outside the wall and asked, again, about a bed.",
    "{who} slept out past the gate and would like it known that they were not hired to do that.",
    "{who} has been sleeping rough since arriving and mentioned that they came a very long way for this.",
    "{who} asked whether the estate intends to build anything for the people it brought here.",
  ],
};

// And the relief when it finally ends. Shown once, the week they get a bed.
// While the masons are on it. Said instead of the complaint, because somebody who can see a roof
// going up does not spend the morning asking for one.
export const CAMP_BUILDING = [
  "{who} came in from the camp and stood a while watching the masons before starting work.",
  "{who} asked how long the building will take and was satisfied enough with the answer to say nothing else about it.",
  "{who} has stopped mentioning the tent since the work started, though they have taken to walking past it twice a day.",
  "{who} slept out again without complaint, which everyone has noticed and nobody has said anything about.",
];

export const CAMP_ENDED = [
  "{who} slept indoors for the first time since arriving and has been noticeably easier to be around.",
  "{who} moved their kit inside and said thank you to three separate people who had nothing to do with it.",
  "{who} has stopped mentioning the camp entirely, which is its own kind of comment.",
  "{who} slept through the bell for the first time, and nobody had the heart to raise it.",
];

// ---- MORALE: THE GENERAL TRACKER ---------------------------------------------------------------
// Frank, 1 Aug. His social design has TWO trackers and they measure different things:
//
//   BONDS    per-relationship. How {A} feels about {B}. Already built (see applyBond).
//   MORALE   per-person and general. How this person feels about WORKING HERE.
//
// A person can be beloved by the whole household and still leave, because the estate has had them
// sleeping in a tent on a plane of fire for three months. Bonds do not capture that; morale does.
//
// It moves DOWN a step for every week camped without accommodation, and UP for a positive
// interaction — so somebody with friends here can bear a great deal longer than somebody without,
// which is the right shape and falls out of the two trackers touching rather than being designed.
//
// AT THE FLOOR THEY LEAVE, and they say why. That is the tolerance limit: not a hard week-count but
// a budget that generosity can top back up.
// THE RATES ARE DELIBERATELY ASYMMETRIC, and the first version was not — camping cost 1 and a
// kindness gave 1 back, so a single friendly moment in a week exactly cancelled the week, morale
// oscillated at zero, and nobody ever left. **A tolerance limit that cannot be reached is not a
// limit.** Camping now costs twice what a kindness returns, which means:
//
//   nobody is kind to them        -2/week  -> gone in about seven weeks
//   one kindness a week           -1/week  -> gone in about fourteen
//   two or more kindnesses a week  0/week  -> they stay indefinitely, and have earned it
//
// So friendship CAN save somebody the estate is neglecting, but only if the household really takes
// to them. That is the right shape and it falls out of the two trackers meeting.
// TUNED TO THE PLAYER, NOT TO THE FICTION (Frank, 1 Aug): "the average player has 15 sessions with a
// character, so I'd like the turnaround more dramatic than that. I expect they'd last about A MONTH."
//
// That is the right anchor and it is a real constraint the fiction cannot see. At ~1.4 bastion turns
// a session, fifteen sessions is about twenty-one turns — so a fifteen-week fuse is most of a
// character's LIFE, and a consequence that lands once per character is not a mechanic, it is an
// anecdote. Four weeks is a thing a player will meet several times and learn from.
//
// Measured net rate is about -0.9/week (camping -2, kindness reaching them ~1.1 times a week), so a
// floor of -4 lands at roughly four turns with an ordinary household, two with a cold one.
export const MORALE_FLOOR = -4;          // about a month of being ignored, with nothing holding them

// ATTACHMENT DEEPENS THE WELL (Frank, 1 Aug). His own test of it:
//
//   "If I loved where I worked — really loved where I worked — moved from Colorado back home to
//    Maine and was living in a tent outside of the place that I worked, but I got good benefits and
//    I had really good coworkers and the boss was really nice, I might stay two months. But at some
//    point I would give up."
//
// That is the lever I had reported as too weak, and the reason it was weak is that I had modelled
// kindness as a PER-WEEK trickle when what actually holds somebody is ACCUMULATED ATTACHMENT. A
// person with friends here is not topping up a meter each week; they have a deeper well to draw on,
// and they draw on it right up until it is gone.
//
// So the BONDS tracker modifies the MORALE floor — the two trackers touching for a second time, and
// again the consequence falls out rather than being designed. Somebody with nobody leaves in about a
// month. Somebody genuinely embedded in the household lasts about two, which is Frank's number.
//
// Capped, because there is a point past which no amount of good company substitutes for a bed —
// which is the other half of what he said: "at some point I would give up."
export const MORALE_ATTACHMENT_MAX = 4;   // at most four more weeks of patience, however beloved

// HOW MUCH BOND IS ONE WEEK OF PATIENCE. Measured and set deliberately: at 1 bond point per week,
// the ordinary case ran to a MEDIAN OF EIGHT WEEKS, because somebody camped for a month accrues
// bonds just by being around, and the attachment then deepened their own well. That is realistic and
// it collapsed the distinction Frank asked for — everybody looked embedded.
//
// At three points per week, ATTACHMENT HAS TO BE EARNED. A month of ordinary proximity buys a week
// or so; a genuinely embedded member of the household, who arrived with friendships or built deep
// ones, buys the full four. Ordinary lands near a month, embedded near two — which is the ruling.
export const MORALE_BOND_PER_WEEK = 3;

// And the reason the grievance is legitimate rather than sulky, which is worth stating in one place:
// **an estate post in the Realms comes with somewhere to live.** A land grant, a room, a bunk — the
// expectation was set when they took the offer, and it is the estate that has not kept it. That is
// why this reads as a broken agreement rather than as somebody being difficult.
export const MORALE_CAMPED_WEEKLY = -2;  // each week left outside, to begin with

// PATIENCE WEARS OUT. Frank's own words: *"at some point I would give up."* Without this the decay
// is linear and a sufficiently beloved person is IMMORTAL — measured, some runs went past 39 weeks
// and would have gone forever, because two kindnesses a week exactly cancelled a flat -2. A
// tolerance limit somebody can outrun is the same defect as one they cannot reach, wearing the
// opposite face.
//
// So the cost of a week camped grows by one for every month spent outside. Weeks 1-4 cost 2, weeks
// 5-8 cost 3, 9-12 cost 4. Nobody is patient forever, however much they like the company, and the
// longer the estate ignores them the faster the rest of it goes — which is also how people actually
// work.
export const MORALE_CAMPED_ESCALATE_EVERY = 4;
export const MORALE_KINDNESS = 1;        // each positive interaction in the household week
export const MORALE_CEILING = 4;         // goodwill banks a little, so a good month buys some patience

// GOOD FAITH BUYS PATIENCE (Frank's clause, and the better half of the ruling): *"unless there's a
// bedroom in construction, I am not staying."* Somebody can see the masons. A keep that has actually
// started building somewhere for its people to sleep is not the same as a keep that has ignored
// them, and the person camped outside knows the difference — so the decay pauses entirely while the
// work is visibly under way.
//
// This is the escape hatch that makes the countdown fair. A player who reacts at all does not lose
// anybody; a player who does nothing does. And it cannot be gamed by starting a build and cancelling,
// because cancelling removes the facility and the decay resumes that week.
export const MORALE_CAMPED_BUILDING = 0;

// What they say on the way out. This is the "tell you exactly where you can stick it" Frank asked
// for — pointed, specific to having been ignored, and never merely sulky. They are not quitting a
// job; they are quitting a job they crossed a plane for.
export const MORALE_WALKOUT = [
  "{who} left this morning. The message, left with the gate, was that they were recruited across half the world and given a tent, and that the estate can find somebody else to sleep in it.",
  "{who} is gone. They did not ask for the wages owed, which everyone agrees is the most damning part.",
  "{who} walked out before the bell, having said the previous evening that they had asked for a roof four times and would not be asking a fifth.",
  "{who} handed back the kit, thanked the household \u2014 by name, every one of them \u2014 and said that none of them were the problem, and left.",
  "{who} left a note. It is short. It observes that the estate found the coin for a great many things this year.",
  "{who} is gone, having pointed out on the way that every post like this comes with somewhere to live, and that they had asked only for what was offered.",
  "{who} went at first light without a word to anybody, which from them is the loudest thing they could have done.",
];

// ---- THE PATROL --------------------------------------------------------------------------------
// Frank, 1 Aug: "the guards when the bastion is taking a turn are walking from room to room and
// around the estate \u2014 that's what their job is, to walk around and make sure everybody is good and
// watch for fights." So a defender's week is not a post, it is a ROUND: they turn up in the smithy,
// then the courtyard, then the bedroom, then the workshop, and what they find there is the beat.
//
// The verbs are deliberately not heroic. A patrol is ninety-nine parts walking through a room where
// nothing is happening, and the one part that isn't is what everybody talks about for a month. The
// room supplies WHERE; this supplies WHAT, and the two are composed at run time so a new facility
// joins the round the day it is built without a line of new prose.
// Every table below is a d20 (Frank, 1 Aug): "those could become repetitive if there are not very
// many of them." Three or four lines show their seams inside a month of play; twenty do not, and the
// SLOTS make each of the twenty land differently every time it is drawn.
//
// SLOT VOCABULARY, filled at run time by the household week:
//   {who}   the guard walking the round
//   {room}  a facility of this keep, lowercased — so a line written once fits a smithy, a fo'c's'le
//           or a reading-grove, and a facility minted next year joins these tables for free
//   {mate}  another member of the household — a hireling of that room, or another defender
//
// Same principle as the library's drift: the sentence is self-enclosed and portable, and the
// variety comes from composition rather than from writing every combination out.
export const PATROL_ROUNDS = [
  "{who} put their head round {room} on the round and found it as it should be",
  "{who} walked through {room} twice on the same round, and could not have said why the second time",
  "{who} stood a while in the doorway of {room} watching nothing in particular",
  "{who} came through {room} at the change of the watch and was offered something hot",
  "{who} counted heads in {room} out of habit, and got the number they expected",
  "{who} found a door to {room} unbarred that ought not to have been, and barred it",
  "{who} walked the round past {room} in the dark without a lamp, which is either confidence or laziness",
  "{who} checked the fire in {room} was banked and not out, which is a different thing",
  "{who} went through {room} last of all, because that is the one they like ending on",
  "{who} was in {room} when something fell over, and it was nothing, and their heart went anyway",
  "{who} took the round past {room} out of order and had to double back, and told nobody",
  "{who} tried the shutters in {room} one after another the way they were taught, and all of them held",
  "{who} walked the round through {room} without breaking step, which is the whole art of it",
  "{who} paused at {room} to listen, heard the ordinary sounds of it, and went on",
  "{who} found somebody's supper going cold in {room} and left it exactly where it was",
  "{who} came through {room} early and startled somebody, and apologised twice",
  "{who} found a lamp still burning in {room} and put it out, and thought about who",
  "{who} did the round of {room} at a walk that everyone in the house can recognise by ear",
  "{who} stopped at {room} to get out of the wind for a minute longer than the round allows",
  "{who} walked the round to {room} and back and could not afterwards remember any of it",
];

export const PATROL_INCIDENTS = [
  "{who} broke up an argument in {room} before it got as far as anyone's hands",
  "{who} found {mate} and another of the household not speaking in {room}, and left them to it",
  "{who} turned somebody out of {room} who had no business being in there at that hour",
  "{who} found {room} unlocked and the lamp still burning, and had words with whoever had the key",
  "{who} caught somebody helping themselves in {room}, and has not decided yet what to do about it",
  "{who} found a stranger's boot-print in {room} and spent the rest of the round quiet and looking",
  "{who} walked in on {mate} crying in {room} and walked back out again without a word, which was the right call",
  "{who} found the bar off the door of {room} for the third night running and stopped believing it was carelessness",
  "{who} put a stop to a dice game in {room} that had got past the point of friendly",
  "{who} found somebody asleep on watch in {room} and woke them quietly rather than loudly",
  "{who} came on {mate} taking something out of {room} and accepted the explanation, provisionally",
  "{who} found a window in {room} forced from the outside and nothing at all missing, which is worse",
  "{who} separated two of the household in {room} and made them shake on it, and neither meant it",
  "{who} found the stores in {room} short by more than spoilage accounts for",
  "{who} caught {mate} coming back in through {room} at an hour nobody comes back in",
  "{who} put out a fire in {room} that had not become a fire yet, and did not make a thing of it",
  "{who} found a knife in {room} that belongs to nobody who works there",
  "{who} heard something in {room} at the wrong hour and found the cat, and was not embarrassed for long",
  "{who} broke up a fight in {room} and took an elbow doing it, and gave nobody the satisfaction of noticing",
  "{who} found a message in {room} folded small and pushed behind a beam, and has not read it",
];

export const PATROL_UNDER = {
  attack: [
    "{who} stood to at the wall all night and did not walk the round at all, because there was nothing left to check that was not already looking outward",
    "{who} ran the alarm along the wall-walk and had every door in the house barred inside a minute, which is the fastest anyone has ever seen it done here",
    "{who} went through every room in the estate at a run, counting heads and shouting the count, and got it right",
    "{who} put the household into the deepest room there is and stood in the doorway of it with their back to the dark",
    "{who} beat the alarm on {room}'s door with the flat of a blade because the bell was too far and the bell would have been too late",
    "{who} got {mate} out of {room} and did not stop to explain why, and was thanked for it afterwards",
    "{who} took the stair to {room} four at a time and does not remember doing it",
    "{who} held the door of {room} shut with their shoulder for as long as it needed holding",
    "{who} walked the whole estate afterwards in the dark, room by room, and found nothing, and walked it again",
    "{who} carried water and torn cloth into {room} and did what could be done there, which was not everything",
    "{who} shouted the household into {room} and stood counting them in and would not go in themselves",
    "{who} was on the wall and stayed on the wall, and there is no more to the week than that",
    "{who} bolted {room} from the inside with people still out in the yard, which was correct and will be argued about for years",
    "{who} found the fighting had come as far as {room} and put it back out again",
    "{who} spent the night going between the wall and {room}, carrying things one way and people the other",
    "{who} got the lamps out in {room} so nothing inside could be seen from beyond the wall",
    "{who} stood the whole night at the gate of {room} and did not sit down once, and could not afterwards say why not",
    "{who} was hoarse by dawn from shouting names down the length of the estate and getting answers to most of them",
    "{who} put {mate} behind them in {room} without being asked and without discussing it since",
    "{who} walked out into the yard at first light before anyone said it was safe, because somebody had to be first",
  ],
  standoff: [
    "{who} doubled the round and walked it in pairs, and neither of them said much",
    "{who} walked the round every hour instead of every three, and was seen from outside doing it, which was the point",
    "{who} did not walk the round at all but stood on the wall where the men at the gate could count them, and let themselves be counted",
    "{who} kept the round going past the gate again and again with a deliberate slowness, the way you do when somebody is watching",
    "{who} walked the round in full harness for the first time in a year, and it showed, and that was the intent",
    "{who} took the round past {room} where the shutters face the road and left them open on purpose",
    "{who} counted the men at the gate on every pass and got a different number twice",
    "{who} stood the round with {mate} for company, which is not regulation, and the sergeant said nothing",
    "{who} walked the length of the wall at the same pace all night, so that anyone timing it would learn nothing",
    "{who} put a lamp in every window of {room} to make the house look fuller than it is",
    "{who} kept the household out of {room} because it looks onto the gate and there is no sense in being looked at",
    "{who} did the round backwards for once, so the pattern would not be a pattern",
    "{who} was asked by three separate people whether it was going to come to anything and gave three separate answers",
    "{who} carried a spear on the round that is normally kept on the rack, and carried it visibly",
    "{who} walked past the gate whistling, which fooled nobody inside and possibly somebody outside",
    "{who} spent the round watching the road rather than the rooms, and said afterwards it felt like cheating",
    "{who} stood in the open at the wall-head for a long moment where they could be seen clearly, and then moved on",
    "{who} checked every bar in {room} without hurrying, because hurrying is what they would be looking for",
    "{who} came off the round and could not sleep, and went back out and walked it again",
    "{who} said out loud in {room} that they would rather it started than went on like this, and was told to keep that to themselves",
  ],
  raiders: [
    "{who} walked the round with a hand on the hilt the whole way, which is not regulation and nobody said anything",
    "{who} checked every bar and every shutter twice, and the second time was not habit",
    "{who} took the round the long way to look at the road, and looked at it for longer than the round allows",
    "{who} walked the round listening rather than looking, which is what you do when you have been surprised once",
    "{who} moved what was worth moving out of {room} and told nobody where to",
    "{who} counted the stores in {room} against what should be there and did the arithmetic twice",
    "{who} walked the round at odd hours all week so that nobody watching could learn when to expect it",
    "{who} found the tracks at the edge of the ground and followed them exactly as far as sense allowed",
    "{who} put a chain on the door of {room} that has never had a chain on it",
    "{who} asked {mate} to stop working late in {room} and would not say precisely why",
    "{who} walked the round twice over and slept badly between",
    "{who} kept the round tight to the buildings all week rather than out in the open ground",
    "{who} had the shutters of {room} barred by dusk every night, which is earlier than anyone likes",
    "{who} counted the household in at nightfall and did not stand down until the count was right",
    "{who} took a lamp on the round for the first time in months, and then thought better of it and put it out",
    "{who} walked the ground beyond the wall at first light looking for what the night had left",
    "{who} moved their own kit closer to the door and pretended it was for the draught",
    "{who} told {mate} where to go and what to bar if it came to it, calmly, over ordinary work",
    "{who} spent the round thinking about which way they would come, and had settled on an answer by Friday",
    "{who} found a gap in the ground beyond {room} that a person could come through, and spent a day closing it",
  ],
  refugees: [
    "{who} walked the round past where the refugees are bedded down and slowed, and did not know why they slowed",
    "{who} counted the household and then counted them again including the newcomers, and had to think about which number was the real one",
    "{who} found one of the refugee children following the round at a distance, and let them",
    "{who} carried blankets into {room} on the round and made no remark about it",
    "{who} was asked by one of them whether it was safe here and said yes without hesitating, and meant it",
    "{who} kept the round away from where they sleep for the first few nights so as not to loom",
    "{who} found somebody among them who had soldiered, and the two of them talked shop for an hour",
    "{who} moved the round to pass {room} more often because that is where the children ended up",
    "{who} shared out what was in their own kit-chest without mentioning it to anyone",
    "{who} learned three of their names on the first day and used them, which cost nothing and mattered",
    "{who} stood between two of them in {room} who had brought an old quarrel in with them",
    "{who} found one of them awake at every hour of the round, every night, and stopped asking why",
    "{who} took the long way past {room} so the ones who cannot sleep would have somebody to see going by",
    "{who} had to explain the bell to them, and what it means, and what to do, and did it gently",
    "{who} noticed the same one always sitting where they can see the gate, and left them to it",
    "{who} was given something small by one of them at the end of the round and has not put it down since",
    "{who} counted the newcomers separately out of an old habit, and then stopped doing that",
    "{who} found the stores in {room} going faster than the ledger allows and did not report it",
    "{who} was told a piece of what happened to them and has not repeated it to anybody",
    "{who} walked the round and found the house louder than it has been in years, and did not mind",
  ],
  opportunity: [
    "{who} cut the round short because half the estate is full of strangers and the round has stopped meaning anything",
    "{who} walked the round through a fair, which is not a round, and gave up on it somewhere near the ale",
    "{who} was supposed to be walking the round and was instead watching the dancing, and the sergeant saw, and let it go",
    "{who} spent the round moving people politely out of {room} who had no business in it and could not be made to understand that",
    "{who} was recognised by somebody from three counties away and spent an hour on that instead of the round",
    "{who} danced once, badly, in front of the whole household, and has not lived it down",
    "{who} walked the round with a cup in one hand, which is not regulation, and the sergeant had one too",
    "{who} lost the round entirely somewhere between {room} and the trestles",
    "{who} won something at a stall and has put it on the shelf above their bunk",
    "{who} was on the gate the whole time and had the best view of anyone and enjoyed none of it",
    "{who} traded watches with {mate} to get the evening free and paid for it in the morning",
    "{who} found a fiddler who knew a tune from wherever {who} is originally from, and stood there for the whole of it",
    "{who} broke up exactly one fight all week and considered that a triumph given the numbers",
    "{who} was asked to dance by a stranger and said no, and has thought about it since",
    "{who} did the round conscientiously through all of it and is quietly proud and quietly sorry",
    "{who} came off watch to find the fair over and everyone gone and the yard full of trodden grass",
    "{who} ate something at a stall that they are still describing to people",
    "{who} kept an eye on {room} the entire fair because that is where the valuables are, and saw nothing, and is relieved",
    "{who} found somebody sleeping it off in {room} the next morning and moved them along without a fuss",
    "{who} says they did not enjoy it, and was seen enjoying it",
  ],
  visitors: [
    "{who} walked the round a step behind the visitors the whole way, politely, and was not fooling anyone",
    "{who} took the round past the room the visitors were shown into rather more often than the round requires",
    "{who} answered the same three questions about the house eleven times and was courteous every time",
    "{who} noticed which rooms the visitors asked about and mentioned it to nobody except the sergeant",
    "{who} stood at the door of {room} for the whole of the visit looking like furniture, which is a skill",
    "{who} was tipped, and gave it to {mate}, and would rather that were not written down",
    "{who} walked the round and found the visitors had already walked it, which was interesting",
    "{who} was asked what the pay is like here and gave an honest answer",
    "{who} kept the round between the visitors and {room} the entire afternoon without appearing to",
    "{who} was told they had a soldier's bearing and has been walking differently since",
    "{who} counted the visitors in and counted them out and the numbers matched, which is the whole job",
    "{who} found one of them somewhere they should not have been and escorted them back, all charm",
    "{who} recognised a coat-badge on one of them and has been trying to place it since",
    "{who} was asked to hold a horse and held it for two hours without complaint",
    "{who} overheard something in {room} that was not meant to be overheard and has decided it was nothing",
    "{who} showed one of them the view from the wall because they asked nicely",
    "{who} did the round in their good boots for once, which the whole barrack noticed",
    "{who} was left a coin under a cup in {room} and found it two days later",
    "{who} thinks the visitors were counting doors. {who} may be wrong about that",
    "{who} was glad when they left and said so only once they had",
  ],
  criminal: [
    "{who} walked the round with the officials in tow and hated every step of it",
    "{who} stood at the gate while the warrant was read out and looked at the middle distance",
    "{who} was asked to identify {mate} and did, because there was no version of this where they did not",
    "{who} walked the round past {room} where it happened and did not slow down and did not look",
    "{who} found the whole house wanting to talk about it and would not be drawn",
    "{who} had known, and had said nothing, and is finding out now what that costs",
    "{who} took the round alone all week rather than in pairs, and nobody insisted otherwise",
    "{who} was civil to the officials because being otherwise helps nobody, and it took something out of them",
    "{who} cleared the household out of {room} so it would not be watched, and that was the only kindness available",
    "{who} carried the bag out to the gate themselves rather than let anyone else do it",
    "{who} has been asked four times whether it was them who reported it and has answered once",
    "{who} walked the round and found the house quieter than an empty one",
    "{who} keeps looking at the empty place in {room} on every round and has not said anything about it",
    "{who} was told the whole story afterwards and would rather not have been",
    "{who} found somebody had already taken the kit out of the chest and put it who knows where",
    "{who} said the one true thing about it at supper and the table went quiet",
    "{who} does not think it was fair and has said so exactly once, to {mate}, quietly",
    "{who} did the round entirely by the book all week, every corner, no shortcuts",
    "{who} has been sleeping badly and blames the weather",
    "{who} would like it on the record that they did their job, and nobody has asked them to say so",
  ],
  lost: [
    "{who} walked the round past a room that is empty now and did not stop, which took some doing",
    "{who} found the round shorter than it was, because there is one fewer place anybody needs looking in on",
    "{who} put their head round {room} out of habit before remembering there is nobody in it",
    "{who} found the tools in {room} exactly where they were left and could not make themselves move them",
    "{who} did the round and heard the house being too quiet in one particular direction",
    "{who} was the one who noticed first and has not enjoyed being that person",
    "{who} shut the door of {room} on the round, which has stood open for years",
    "{who} keeps counting the household and getting the old number and correcting themselves",
    "{who} was asked what happened by somebody who had not heard, and had to say it out loud again",
    "{who} took the round the way that avoids {room} and pretended that was the usual way",
    "{who} found somebody had left flowers in {room} and left them there",
    "{who} sat in {room} at the end of the round for a while with the lamp off",
    "{who} was told to stop volunteering for the night watch and volunteered again",
    "{who} says it is not their business and has been carrying it about the estate all the same",
    "{who} found the ledger in {room} still open at the day it stopped",
    "{who} walked the round and had the strong sense of being one short, and was",
    "{who} has taken to doing {room} first rather than last, and will not explain",
    "{who} keeps a thing of theirs in their kit-chest and has told nobody",
    "{who} said the funeral was well done, and left the room shortly after saying it",
    "{who} did the whole round twice on the day and told the sergeant it was for the exercise",
  ],
  aid: [
    "{who} walked a round that is short-handed, and it takes longer that way, not less",
    "{who} walked the round alone that is meant to be walked in pairs, and was fine, and said so twice",
    "{who} stayed behind and has been finding reasons to be out where the road can be seen",
    "{who} did {room} and the wall stretch both, because there is nobody else to do the second",
    "{who} counted the garrison out of habit and got a number they did not like",
    "{who} has been sleeping in their kit in case the word comes back badly",
    "{who} was left the keys and has been carrying them where everyone can see",
    "{who} took on the night round as well and looks it",
    "{who} keeps the lamp lit in {room} for whoever comes back, whatever hour that is",
    "{who} did the round quickly all week so as to be back where the gate can be watched",
    "{who} was supposed to go and did not, for reasons the sergeant accepted and nobody else has heard",
    "{who} has been short with {mate} all week and apologised on the Friday without being asked",
    "{who} walked the round and found it strange how much a few missing people change a house",
    "{who} put their kit-chest against the door of {room} and slept there, which is not necessary",
    "{who} has been out at the wall at every hour that is not a round hour",
    "{who} would not be drawn on whether they expected them back and did not need to be",
    "{who} found work in {room} that did not need doing and did it anyway",
    "{who} says the ones who went were the right ones to send, and repeats it more than is natural",
    "{who} has walked the road as far as the boundary twice this week and come back both times",
    "{who} heard a horse on the road at the wrong hour and was at the gate before it was anywhere near",
  ],
};

// ---- WHAT A ROUND DOES TO A RELATIONSHIP -------------------------------------------------------
// Frank, 1 Aug: "do any of these sentences create relationship bonds, positive or negative?" The
// honest answer when he asked was: barely. Only the incident path bonded at all, its sign came from
// the OTHER party's trait rather than from what actually happened, and the person it bonded with was
// drawn independently of the person the sentence named — so a line about {mate} could record a bond
// against somebody else entirely.
//
// So the SENTENCE now carries its own sentiment. Keyed by the row's opening words, because the rows
// are the identifiers and a parallel array would drift the first time one is reworded.
//
//   +1  the round brought two people closer — shared work, a kindness, a discretion
//   -1  the round put something between them — an accusation, a rebuke, an unwelcome duty
//    0  named but neutral: they were simply both there
//
// A row that names no {mate} bonds nobody, whatever its sentiment: there is no second party.
export const PATROL_SENTIMENT = {
  // PATROL_INCIDENTS
  "found {mate} and another": 0,
  "walked in on {mate} crying": 1,
  "came on {mate} taking something": -1,
  "caught {mate} coming back in": -1,
  // attack
  "got {mate} out of": 1,
  "put {mate} behind them": 1,
  // standoff
  "stood the round with {mate} for company": 1,
  // raiders
  "asked {mate} to stop working late": 1,
  "told {mate} where to go and what to bar": 1,
  // opportunity
  "traded watches with {mate}": 1,
  // visitors
  "was tipped, and gave it to {mate}": 1,
  // criminal
  "was asked to identify {mate}": -1,
  "to {mate}, quietly": 1,
  // aid
  "has been short with {mate}": -1,
};

// ---- WHAT THE GARRISON IS STILL CARRYING -------------------------------------------------------
// Frank's own example, and it is the best idea in the batch: "maybe we see the week AFTER the
// festival one of the guards still wearing the helmet that has a flower painted on it."
//
// So an event can leave a MARK on the garrison that surfaces the FOLLOWING week, once, and then is
// gone. That is what makes a keep feel like it remembers things — not the event itself, which
// everybody notices, but the small residue of it turning up in an ordinary week when nobody expected
// the subject to come back.
//
// {who} is the guard. One is drawn, shown, and cleared.
export const GARRISON_AFTER = {
  opportunity: [
    "{who} is still wearing the helmet somebody painted a flower on at the fair, and has not mentioned it, and neither has anyone else",
    "{who} came back onto the roster three days late and nobody has asked where from",
    "somebody at the fair taught {who} a song, and {who} has been whistling it on the round all week, badly",
    "{who} has a ribbon knotted round the hilt that was not there before the fair",
  ],
  attack: [
    "{who} is walking the round with a limp that is nearly better, and will not be told to rest it",
    "{who} keeps checking the same stretch of wall on every round, and has not said what they are checking it for",
    "{who} has not slept properly since and is doing the night round by preference, which everyone has noticed and nobody has raised",
  ],
  standoff: [
    "{who} still looks down the road at the top of every round, out of a habit only a week old",
    "{who} has taken to walking the gate stretch last so they can stand there a while at the end",
  ],
  raiders: [
    "{who} has moved their bunk to the end nearest the door and given a reason that convinced nobody",
  ],
  guest: [
    "{who} is still telling the story about the guest, and the story is getting better",
  ],
  treasure: [
    "{who} has been walking the round past where the thing is kept, casually, which fools no one",
  ],
  discovery: [
    "{who} asked the artificer three separate questions about it and understood none of the answers, and asked a fourth",
  ],
};

export const BASTION_BARRACKS_CAP = { roomy: 12, vast: 25 };

// DMG, Barrack > Recruit: "up to four Bastion Defenders are recruited to your Bastion and assigned
// quarters in this Barrack. The recruitment costs no money." Four is the book's number; the cap is
// the room's. A muster that would overfill the room is trimmed to what the bunks hold.
export const BARRACKS_RECRUIT = 4;

// EXCHANGE RULE [EVIDENCE] — measured against the sources, not preferred. See the figures below.
// The DMG has one "Attack" row and rolls 6d6 for all of it. That row is doing two
// jobs and gets both wrong: a duke besieging Caister with three hundred men and cannon, and twelve
// hungry goblins after the storehouse, are not the same event and should not roll the same dice.
//
// So the die COUNT comes from the event now. The walls rule (6d6 -> 4d6) and the Armory rule (d6 ->
// d8) are the DMG's and ride along untouched, applied proportionally:
//   attack   (the siege)  6 dice  — somebody wants the PLACE. Rare, political, decisive.
//   raiders               2 dice  — somebody wants the GRAIN. Common, cheap, back next month.
//   standoff              0 dice  — they came, they looked at the walls, they left. Nobody rolls.
//
// Measured against the sources: Caister was two months of artillery for ONE death, and "nearly all
// of the confrontations ended with few injuries and certainly no deaths" (Paston Letters). A raid at
// 2d6/wave leaves a six-room keep intact 11% of the time and averages two dead instead of six —
// which is what a peel tower is FOR, and what the walls have always implied and never delivered.
export const BASTION_ATTACK_DICE_RAID = 2;    // Exchange: a raiding band is not a siege

// `storyline: true` marks a region an official D&D storyline actually visited. It is NOT decoration:
// harness/ledger.cjs derives the Library roster's region doctrine from this flag, so the twelve
// storyline regions and the even split are read out of the code rather than hand-seeded in the
// ledger document (a declared target cannot audit itself). Flipping a flag here retargets the gate.
// NB: "season" is an obsolete AL term (AL DM's Guide, "Seasons & Campaigns"); these are storylines.
export const BASTION_REGIONS = [   // storyline regions first, then the wider Realms; canonical place references, not book text
  { id: "moonsea", name: "The Moonsea", note: "Seasons 1–3 · Phlan, Mulmaster, Hillsfar" , storyline: true },
  { id: "underdark", name: "The Underdark", note: "Season 3 · Rage of Demons" , storyline: true },
  { id: "barovia", name: "Barovia", note: "Season 4 · Curse of Strahd" , storyline: true },
  { id: "swordcoast", name: "The Sword Coast", note: "Season 5 · Storm King's Thunder" , storyline: true },
  { id: "waterdeep", name: "Waterdeep", note: "Seasons 6 & 8" , storyline: true },
  { id: "chult", name: "Chult", note: "Season 7 · Tomb of Annihilation" , storyline: true },
  { id: "baldursgate", name: "Baldur's Gate", note: "Season 9 · Avernus Rising" , storyline: true },
  { id: "avernus", name: "Avernus", note: "Season 9 · the Nine Hells" , storyline: true },
  { id: "icewinddale", name: "Icewind Dale", note: "Season 10 · Rime of the Frostmaiden" , storyline: true },
  { id: "feywild", name: "The Feywild", note: "Season 11 · Wild Beyond the Witchlight" , storyline: true },
  { id: "wildspace", name: "Wildspace & the Astral Sea", note: "Season 12 · Spelljammer" , storyline: true },
  { id: "neverwinter", name: "Neverwinter & the North", note: "the Sword Coast North" , storyline: false },
  { id: "silvermarches", name: "The Silver Marches", note: "Silverymoon and the frontier" , storyline: false },
  { id: "cormyr", name: "Cormyr", note: "the Forest Kingdom" , storyline: false },
  { id: "dalelands", name: "The Dalelands", note: "the eastern vales" , storyline: false },
  { id: "heartlands", name: "The Western Heartlands", note: "Elturel, Baldur's Gate hinterland" , storyline: false },
  { id: "dessarin", name: "The Dessarin Valley", note: "Elemental Evil hardcover country" , storyline: true },
];

export const BASTION_FORMS = [   // purely cosmetic house-flavor (NOT a book mechanic) — the form colors how facilities read
  { id: "keep", name: "Fortified Keep", word: "hall", flavor: "stone halls behind a watchful gatehouse" },
  { id: "tower", name: "Wizard's Tower", word: "floor", flavor: "a spiral of floors climbing skyward" },
  { id: "manor", name: "Manor House", word: "wing", flavor: "gracious wings and quiet gardens" },
  { id: "cavern", name: "Cavern Warren", word: "chamber", flavor: "carved chambers deep in the rock" },
  { id: "ruin", name: "Repurposed Ruin", word: "vault", flavor: "old vaults reclaimed from older stone" },
  { id: "grove", name: "Sacred Grove", word: "glade", flavor: "living glades and root-woven halls" },
  { id: "vessel", name: "Anchored Vessel", word: "deck", flavor: "creaking decks and a salt wind" },
  { id: "hamlet", name: "Hamlet", word: "building", flavor: "a scatter of cottages and sheds about a well and a green" },
];

// ---------------------------------------------------------------------------
// FURNISHINGS
//
// DMG: "A basic facility comes with nonmagical furnishings and decor appropriate for that facility."
// And every special facility's entry names its own furniture as included — the Arcane Study "contains
// one or more desks and bookshelves", the Armory has "mannequins for displaying armor, hooks for
// holding Shields, racks for storing weapons, and chests for holding ammunition", and so on.
// The book prices NONE of it. Rooms arrive furnished, free, and that's the end of the rule.
//
// So I don't sell you furniture. What I do is let you make it *better*, and my ladder is
// the DMG's own: the Art Objects tiers (25 / 250 / 750 / 2,500 gp) that the Bastion Treasure event
// already rolls on. A serviceable desk is free because the book says so; a masterwork one costs what
// the book says a masterwork object costs. Pure flavour either way — no facility works better for
// being beautiful.
//
// [COPYRIGHT] (The ladder's APPLICATION to furniture is the Deep Grounds Exchange's own reading. The DMG prices
//  art objects; it never says a desk can be one. Labelled, not cited.)
// ---------------------------------------------------------------------------
export const FURNISHING_TIERS = [
  { id: "basic",  gp: 0,    label: "Serviceable", note: "What the room came with. It does the job and asks nothing of you." },
  { id: "fine",   gp: 25,   label: "Fine",        note: "Someone took care over this. Guests notice it without remarking on it." },
  { id: "rich",   gp: 250,  label: "Rich",        note: "Good wood, good work, and quietly expensive." },
  { id: "superb", gp: 750,  label: "Superb",      note: "The sort of thing people ask about, and then ask who made it." },
  { id: "master", gp: 2500, label: "Masterwork",  note: "A piece with a name and a maker. It will outlast the house." },
];

// ---------------------------------------------------------------------------
// HIRELINGS (DMG). "A special facility comes with one or more hirelings who work in the facility,
// maintain it, and execute Bastion orders there... Each special facility generates enough income to
// pay the salary of its hirelings." You don't hire them and you don't pay them — they come with the
// room. The goat names them and gives them a life; I never ask them to staff anything.
//
// Enlarging adds more, where the book says so: a Vast Workshop gains two, a Vast Garden one.
// ---------------------------------------------------------------------------
export const FACILITY_SIZE_HIRELINGS = { workshop: { vast: 2 }, garden: { vast: 1 } };   // DMG "Enlarging the Facility" notes

export const HIRELING_LOSS_GENERIC = [
  { fate: "dead",  text: "took {illness} in the cold months and did not recover" },
  { fate: "alive", text: "left for a warmer house and a kinder wage" },
  { fate: "alive", text: "quarrelled with someone about something and would not be talked round" },
  { fate: "alive", text: "went out one morning on an errand and simply kept walking" },
  { fate: "alive", text: "was owed better and knew it" },
];

// ============================ HOUSEHOLD WEEK ============================
// The keep lives its own week while the lord is usually away, and hands back a story of it when the turn
// resolves. DETERMINISTIC: rolled once here off a seed fixed by (bastion, turn number) and STORED on the
// turn — never regenerated on render. See FACILITY_SPEC "household-week engine". This is the GENERAL
// fallback content; facilities will supply their own reaction tables on top later.
export const BASTION_BEDS_BY_SIZE = { cramped: 2, roomy: 4, vast: 6 };   // TUNABLE — beds a bedroom sleeps by size

export const FAC_MAGIC_GROUP = { arcane_study: "arcana" };

// The kit an Armory of each Bastion form would actually lay in — named in the Stock Armory
// narration so a keep stocks war-harness and a ship stocks boarding-pikes. Pure flavor; the
// mechanic (cost, the d8, the expend) is identical whatever the racks hold.
export const ARMORY_KIT_BY_FORM: Record<string, string> = {
  keep:   "war-harness, billhooks, and fletched arrows",
  tower:  "the guard's spears and quarrels for the tower-watch's crossbows",
  manor:  "ancestral plate, hunting-spears, and arrows for the hunt",
  cavern: "oiled harness, rot-proof hafts, and bolts kept dry",
  ruin:   "salvaged harness, re-hung blades, and what arrows remained",
  grove:  "strung bows, green-ash spears, and waxed quivers",
  vessel: "boarding-pikes, cutlasses, ballista-bolts, and catapult-stones",
  hamlet: "the muster's billhooks, two good suits, and a barrel of arrows",
};

// Cost of a facility at a given size. Lives beside the table it reads.
export const bastionSizeCost = (size) => BASTION_FACILITY_COST[size] || 0;

// Region -> adventure tags. Pure data; lib/rules reads it to work out earned regions.
// Which adventure tags mark a region as *this* region. Used to work out where a character actually served.
export const REGION_TAGS = {
  moonsea:      ["moonsea", "phlan", "mulmaster", "hillsfar", "melvaunt", "thentia", "elmwood", "zhentil keep", "sokol keep"],
  underdark:    ["underdark", "menzoberranzan", "gracklstugh", "blingdenstone", "sloobludop", "velkynvelve"],
  barovia:      ["barovia", "ravenloft", "strahd", "vallaki", "krezk"],
  swordcoast:   ["sword coast", "storm king", "triboar", "goldenfields", "parnast", "greypeaks", "savage frontier"],
  waterdeep:    ["waterdeep", "undermountain", "skullport", "lords of waterdeep", "dragon heist", "yawning portal"],
  chult:        ["chult", "port nyanzaru", "chultan magic", "omu", "tomb of annihilation", "jungle"],
  baldursgate:  ["baldurs gate", "baldur's gate"],
  avernus:      ["avernus", "nine hells", "zariel", "descent into avernus"],
  icewinddale:  ["icewind dale", "ten towns", "bryn shander", "frostmaiden", "auril", "rime"],
  feywild:      ["feywild", "witchlight", "prismeer", "hither", "thither", "yon"],
  wildspace:    ["wildspace", "astral", "spelljammer", "rock of bral"],
  neverwinter:  ["neverwinter", "neverwinter wood"],
  silvermarches:["silverymoon", "silver marches", "everlund"],
  cormyr:       ["cormyr", "suzail", "wheloon", "purple dragon"],
  dalelands:    ["dalelands", "shadowdale", "daggerdale", "harrowdale", "featherdale"],
  heartlands:   ["western heartlands", "elturel", "scornubel", "boareskyr"],
  dessarin:     ["dessarin", "red larch", "elemental evil", "sumber hills"],
};
