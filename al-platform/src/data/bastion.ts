
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
  armory: { id: "armory", name: "Armory", kind: "special", space: "roomy", prereq: null, hirelings: 1, minLevel: 5, orders: ["trade", "maintain"], note: "A hall of mannequins, weapon-racks, shield-hooks, and ammunition chests, kept by a quartermaster. Issue Trade and the racks are stocked \u2014 armor, Shields, weapons, and ammunition \u2014 for 100 GP plus 100 for each Bastion Defender, halved if the Bastion has a Smithy. While it is stocked your defenders are harder to kill: any event that rolls to see whether you lose defenders rolls a d8 in place of each d6. The equipment is expended the moment such an event ends \u2014 whatever you have or lost \u2014 leaving the Armory bare until you Stock it again." },
  archive: { id: "archive", name: "Archive", kind: "special", space: "roomy", prereq: null, hirelings: 1, minLevel: 13, orders: ["research", "maintain"],
    note: "A repository of valuable books, maps, and scrolls \u2014 usually attached to a Library behind a locked or secret door (DMG). The Research order sends the archivist hunting helpful lore for 7 days: they gain knowledge as if they had cast Legend Lore (an SRD spell \u2014 the pointer, not the text), and share it the next time you speak. The Reference Book is chosen ONCE, one of five subjects; while you and the book are in your Bastion, the DM grants the book's study benefit at the table. The DMG's own five titles are not SRD, so each house shelves the Exchange's own edition \u2014 a cavern's arcana book and a ship's are not the same book." },
  scriptorium: { id: "scriptorium", name: "Scriptorium", kind: "special", space: "roomy", prereq: null, hirelings: 1, minLevel: 9, orders: ["craft", "maintain"], note: "A room of desks and writing supplies. Its scribe will copy a nonmagical book (you supply the blank book), scribe a spell scroll of 3rd level or lower from their own class list, or run off up to fifty broadsheets or pamphlets \u2014 and carry them anywhere within fifty miles. You choose the scribe: a Novice Mage scribes Wizard scrolls, an Acolyte scribes Cleric scrolls.", scribeClasses: [{ id: "mage", label: "Novice Mage", cls: "Wizard", role: "Novice Mage" }, { id: "acolyte", label: "Acolyte", cls: "Cleric", role: "Acolyte" }], outputs: { craft: [{ id: "book_replica", label: "A book replica \u2014 copy of a nonmagical book (you supply a blank book; 7 days)", catalogId: "g_book", needsBlankBook: true }, { id: "spell_scroll", label: "A spell scroll \u2014 your scribe's class, 3rd level or lower (a DM verifies)", scroll: true, maxLevel: 3 }, { id: "paperwork", label: "Paperwork \u2014 up to 50 broadsheets or pamphlets (1 GP each, 7 days; delivered within 50 miles)", paperwork: true, perCopy: 1 }] } },
  smithy: { id: "smithy", name: "Smithy", kind: "special", space: "roomy", prereq: null, hirelings: 2, minLevel: 5, orders: ["craft", "maintain"], note: "A forge, an anvil, and the tools of the trade. Its smiths will make anything smith's tools can make \u2014 a blade, a harness of armour, a length of chain \u2014 and, once you have the standing for it, forge an Armament from the magic tables.", tool: "g_tool_smith", outputs: { craft: [{ id: "smith_mundane", label: "Smith's work \u2014 anything smith's tools can make (a DM verifies against the tool's list)", tool: "g_tool_smith" }, { id: "armament_common", label: "A Common magic item \u2014 Armaments tables \u2726 (level 9+; you name it, a DM verifies)", magic: "armaments", rarity: "common", minLevel: 9 }, { id: "armament_uncommon", label: "An Uncommon magic item \u2014 Armaments tables \u2726 (level 9+; you name it, a DM verifies)", magic: "armaments", rarity: "uncommon", minLevel: 9 }] } },
  workshop: { id: "workshop", name: "Workshop", kind: "special", space: "roomy", prereq: null, hirelings: 3, minLevel: 5, orders: ["craft", "maintain"], note: "A creative space fitted with six kinds of artisan's tools of your choosing. Its three hirelings craft anything those tools can make \u2014 and, once you have the standing for it, an Implement from the magic tables. You pick the six tools when you build it.", toolChoice: { count: 6, from: ["g_tool_carpenter", "g_tool_cobbler", "g_tool_glassblow", "g_tool_jeweler", "g_tool_leather", "g_tool_mason", "g_tool_painter", "g_tool_potter", "g_tool_tinker", "g_tool_weaver", "g_tool_woodcarver"] }, outputs: { craft: [{ id: "gear_chosen", label: "Adventuring gear \u2014 anything the workshop's chosen tools can make (a DM verifies)", toolChoice: true }, { id: "implement_common", label: "A Common magic item \u2014 Implements tables \u2726 (level 9+; you name it, a DM verifies)", magic: "implements", rarity: "common", minLevel: 9 }, { id: "implement_uncommon", label: "An Uncommon magic item \u2014 Implements tables \u2726 (level 9+; you name it, a DM verifies)", magic: "implements", rarity: "uncommon", minLevel: 9 }] } },
  library: { id: "library", name: "Library", kind: "special", space: "roomy", prereq: null, hirelings: 1, minLevel: 5, orders: ["research", "maintain"], note: "A collection of books with desks and reading chairs. Its librarian will research a topic \u2014 a legend, an event or place, a person, a kind of creature, or a famous object \u2014 and return with up to three accurate things you did not know. It is also a place to shelve the books your characters carry.", shelvesBooks: true },
  observatory: { id: "observatory", name: "Observatory", kind: "special", space: "roomy", prereq: "spell_focus", hirelings: 1, minLevel: 13, orders: ["empower", "maintain"],
    note: "Situated atop the keep, a telescope aimed at the night sky. A Long Rest up here grants the Observatory Charm; the Empower order sends someone \u2014 you or the hireling \u2014 to explore the eldritch mysteries of the stars for 7 consecutive nights, and on an odd die an unknown power bestows a Charm you can keep or gift (my Q15 ruling: it is minted as a gift-only item with a lifetime).",
    charm: { name: "Observatory Charm", desc: "One casting of Contact Other Plane, no spell slot spent. Lasts 7 days or until you use it \u2014 and you can't gain this Charm again while you still have it (DMG, Observatory).", grant: "You spent a Long Rest at the eyepiece, and the far corners of Wildspace looked back: for a week you can put one question to the other side without paying a slot for the asking." } },
  arcane_study: { id: "arcane_study", name: "Arcane Study", kind: "special", space: "roomy", prereq: "arcane_focus", hirelings: 1, minLevel: 5, orders: ["craft", "maintain"], note: "A quiet room of desks and bookshelves. Its scholar will make you an Arcane Focus for a week of their time, bind you a blank book, and \u2014 once you have the standing for it \u2014 craft a magic item from the Arcana lists.", charm: { name: "Arcane Study Charm", desc: "One casting of Identify, no spell slot spent and no material component. Yours for seven days, or until you spend it.", grant: "You spent a long rest among your own books and instruments, and the room gave something back: you can name what one thing truly is this week, without paying for the knowing." }, outputs: { craft: [{ id: "focus_orb", label: "An Arcane Focus \u2014 orb", catalogId: "g_orb" }, { id: "focus_rod", label: "An Arcane Focus \u2014 rod", catalogId: "g_rod" }, { id: "focus_wand", label: "An Arcane Focus \u2014 wand", catalogId: "g_wand" }, { id: "focus_crystal", label: "An Arcane Focus \u2014 crystal", catalogId: "g_crystal" }, { id: "focus_staff", label: "An Arcane Focus \u2014 staff", catalogId: "g_staffalsoaquarterstaff" }, { id: "blankbook", label: "A blank book (10 GP)", catalogId: "g_book", cost: 10 }, { id: "arcana_common", label: "A Common magic item \u2014 Arcana tables \u2726 (level 9+; you name it, a DM verifies)", magic: "arcana", rarity: "common", minLevel: 9 }, { id: "arcana_uncommon", label: "An Uncommon magic item \u2014 Arcana tables \u2726 (level 9+; you name it, a DM verifies)", magic: "arcana", rarity: "uncommon", minLevel: 9 }] } },
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
export function bookShelfCap(defId: string, size?: string): number {
  const base = defId === "archive" ? 10 : defId === "library" ? 20 : 0;
  if (!base) return 0;
  const tier = Math.max(0, ["cramped", "roomy", "vast"].indexOf(size || "roomy"));
  return base * Math.pow(2, tier);
}

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
export const BASTION_BARRACKS_CAP = { roomy: 12, vast: 25 };

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

export const BASTION_REGIONS = [   // SAMPLE — AL season regions first, then major Realms regions; edit freely (canonical place references, not book text)
  { id: "moonsea", name: "The Moonsea", note: "Seasons 1–3 · Phlan, Mulmaster, Hillsfar" },
  { id: "underdark", name: "The Underdark", note: "Season 3 · Rage of Demons" },
  { id: "barovia", name: "Barovia", note: "Season 4 · Curse of Strahd" },
  { id: "swordcoast", name: "The Sword Coast", note: "Season 5 · Storm King's Thunder" },
  { id: "waterdeep", name: "Waterdeep", note: "Seasons 6 & 8" },
  { id: "chult", name: "Chult", note: "Season 7 · Tomb of Annihilation" },
  { id: "baldursgate", name: "Baldur's Gate", note: "Season 9 · Avernus Rising" },
  { id: "avernus", name: "Avernus", note: "Season 9 · the Nine Hells" },
  { id: "icewinddale", name: "Icewind Dale", note: "Season 10 · Rime of the Frostmaiden" },
  { id: "feywild", name: "The Feywild", note: "Season 11 · Wild Beyond the Witchlight" },
  { id: "wildspace", name: "Wildspace & the Astral Sea", note: "Season 12 · Spelljammer" },
  { id: "neverwinter", name: "Neverwinter & the North", note: "the Sword Coast North" },
  { id: "silvermarches", name: "The Silver Marches", note: "Silverymoon and the frontier" },
  { id: "cormyr", name: "Cormyr", note: "the Forest Kingdom" },
  { id: "dalelands", name: "The Dalelands", note: "the eastern vales" },
  { id: "heartlands", name: "The Western Heartlands", note: "Elturel, Baldur's Gate hinterland" },
  { id: "dessarin", name: "The Dessarin Valley", note: "Elemental Evil hardcover country" },
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
