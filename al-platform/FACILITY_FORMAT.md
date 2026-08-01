# The Facility Format

**v3 · 31 July 2026.** One schema, derived from reading all 29 — not from the 14 that are built.
Supersedes v2. Every figure is read out of the DMG chapter (`Bastions.md`), the ALPG, SRD 5.2
(CC-BY-4.0), or the running app. Nothing is recalled.

> **v3 exists because this document stopped keeping up with the build.** The owner's instruction,
> 31 Jul: *the format is supposed to reflect everything a facility is and needs to be, as we develop
> new tools for the new facilities.* It had been treated as a spec written once and left, so it never
> learned about the registry tables, the hireling model, the furnishing ladder, or the Library book
> generator — the largest single piece of facility tooling in the project. **§10–§12 are new and are
> the living inventory: if a facility gains a mechanism, it is described there or the format is
> stale again.**

**What changed in v3 — §13–§15 are a new PATTERN LIBRARY**, and they are the part of this document
meant to keep growing. §1–§12 say what a facility *must have*. §13 onward say **how we have solved
things before**, so the next room is built by reference instead of from scratch:

- **§13** — what a facility is made of, and which of the four files each part lives in.
- **§14** — **the shelf**: an in-world container a room owns. Written for the Library and Archive,
  but the pattern is the reusable part — the Menagerie's pens and the Stable's stalls are the same
  problem, and should not be re-solved.
- **§15** — naming, and the fields §3 promises that are not built yet.

> **The standing instruction that produced this section (Frank, 31 Jul):** *the format should act
> like a living document — add the tools we create to it, so when we create new facilities we have a
> basis to compare to, and a reference for how we solved certain problems.* **When a room gains a
> mechanism, the pattern goes in §13+ in the same delta.** A tool built and not written down here is
> a tool the next facility will build again, differently.

**What changed from v1 → v2**, and both changes came from the owner rejecting the first answer:

- **§4 is now ONE derivation with named overrides**, not two kinds of craft row. Named options
  *narrow* a tool's output; they are not a second list beside it.
- **§6 is new** — the Menagerie, and with it the three-way creature model (defend / harvest /
  excluded) that fell out of "four tiny to a medium."

---

## 1 · Two records, and they are the same shape as CATALOG/item

The app already keeps one copy of a thing and points at it. Items store a `catalogId` and nothing
else — no name, no rarity, no weight. Facilities are identical: an instance stores `defId`.

```
  DEFINITION   BASTION_FACILITIES.smithy      what a Smithy IS      · type data
  INSTANCE     bastion.facilities[n]          what YOUR Smithy is   · state, points via defId
```

**This decides where every new field goes**, and it is not a style question:

| field | record | why |
|---|---|---|
| `tools` (Smithy → Smith's Tools) | **definition** | every Smithy has them |
| `tools` (Workshop → six of eleven) | **instance** | *you* chose them when you built it |
| `creatures` | **instance** | it's *your* mimic |
| `capacity` | **definition** | every Menagerie holds four Large |
| `harvest` | **neither** | derived from CR. Never stored. See §6.4 |

Today the definition carries `id · name · kind · minLevel · orders · note · space · enlargeBenefit ·
hirelings · outputs · prereq · charm`, and the instance carries `id · defId · size · lastOrder ·
working · furnishings`. **`tools`, `creatures`, `capacity`, `enlarge`, `tables`, `features`, `open`
and `params` exist on neither.**

---

## 2 · The regular part — all 29 print the same stat block

Nine at level 5, ten at 9, six at 13, four at 17.

| facility | lvl | space | hire | order | prerequisite |
|---|---:|---|---|---|---|
| Arcane Study | 5 | Roomy | 1 | Craft | arcane focus |
| Armory | 5 | Roomy | 1 | Trade | — |
| Barrack | 5 | Roomy | 1 | Recruit | — |
| Garden | 5 | Roomy | 1 | Harvest | — |
| Library | 5 | Roomy | 1 | Research | — |
| Sanctuary | 5 | Roomy | 1 | Craft | holy focus |
| Smithy | 5 | Roomy | 2 | Craft | — |
| Storehouse | 5 | Roomy | 1 | Trade | — |
| Workshop | 5 | Roomy | 3 | Craft | — |
| Gaming Hall | 9 | Vast | 4 | Trade | — |
| Greenhouse | 9 | Roomy | 1 | Harvest | — |
| Laboratory | 9 | Roomy | 1 | Craft | — |
| Sacristy | 9 | Roomy | 1 | Craft | holy focus |
| Scriptorium | 9 | Roomy | 1 | Craft | — |
| Stable | 9 | Roomy | 1 | Trade | — |
| Teleportation Circle | 9 | Roomy | 1 | Recruit | — |
| Theater | 9 | Vast | 4 | Empower | — |
| Training Area | 9 | Vast | 4 | Empower | — |
| Trophy Room | 9 | Roomy | 1 | Research | — |
| Archive | 13 | Roomy | 1 | Research | — |
| Meditation Chamber | 13 | Cramped | 1 | Empower | — |
| Menagerie | 13 | Vast | 2 | Recruit | — |
| Observatory | 13 | Roomy | 1 | Empower | **spell focus** (any) |
| Pub | 13 | Roomy | 1 | Research | — |
| Reliquary | 13 | Cramped | 1 | Harvest | holy focus |
| Demiplane | 17 | Vast | 1 | Empower | arcane focus |
| Guildhall | 17 | Vast | 1 | Recruit | expertise |
| Sanctum | 17 | Roomy | 4 | Empower | holy focus |
| **War Room** | 17 | Vast | **2+ (see below)** | Recruit | martial |

Six distinct prerequisites; `BASTION_PREREQS` already has all six. **The War Room prints
`Hirelings: 2+ (see below)`** — facility 29 of 29, breaking a field that looked settled at 14. That
is the entire argument for reading all of them first.

---

## 3 · The definition

```js
{
  id: "smithy", name: "Smithy", kind: "special",     // "basic" | "special"

  minLevel: 5,                    // 5 | 9 | 13 | 17
  prereq:   null,                 // null | key into BASTION_PREREQS (all six exist)

  space:    "roomy",              // starting size. BASTION_SIZES = cramped|roomy|vast
  enlarge:  null,                 // null | { to, benefit }
                                  //   costs come from BASTION_ENLARGE, NOT retyped:
                                  //   cramped>roomy 500 gp/25 d · roomy>vast 2,000 gp/80 d
                                  //   6 of 29 enlarge. `benefit` is the only per-facility part.

  hirelings: 2,                   // number | { min: 2, note: "one per lieutenant" }
                                  // ONLY the War Room needs the object. Accept both, normalise
                                  // on read. Do not make 28 facilities pay for one.

  tools: ["Smith's Tools"],       // [] | [fixed…] | { choose: 6, from: [ …11 ] }
                                  // NEW. Exists nowhere today. Every craft facility HAS tools;
                                  // the chapter just states the Scriptorium's inside a Craft
                                  // option instead of its stat block. Declaring them uniformly
                                  // is what puts all four on even footing. See §4.

  capacity: null,                 // null | { unit: "large", n: 4, ratios: {...} }  — Menagerie only

  furnishings: [],                // FACILITY_FURNISHINGS holds these today, keyed by facility id,
                                  // shape [{ slot, name }], present for 8 of 20. Fold in or point
                                  // at it — one or the other. Two sources of truth is the bug we
                                  // spent this session removing from the catalogue.

  orders: ["craft", "maintain"],  // subset of BASTION_ORDERS (7)
  options: { craft: [ … ] },      // §4

  charm:    null,                 // null | { name, desc, grant } — 4 rooms + Eldritch Discovery
  tables:   {},                   // named lookup tables this facility OWNS (§7)
  features: [],                   // bespoke effects that are not orders (§8)

  note: "…",                      // the app's own prose. NEVER the chapter's — p5_sources scans it.
  open: null,                     // null | "Qnn" — a declared unresolved ruling, carried in the
                                  // DATA so the gate can assert it. A TODO in a document is
                                  // furniture; a TODO the gate reads is a deadline.
}
```

### The instance

```js
{
  id: "facM", defId: "menagerie", size: "vast",
  lastOrder: null, working: false, furnishings: [],
  tools: [],          // NEW — the Workshop's six. Empty for fixed-tool facilities.
  creatures: [],      // NEW — [{ name, cr, size, type }] from the SRD list. §6.
  henchmen: [],       // exists. PER-ROOM, which SR-9 needs.
}
```

---

## 4 · Craft: ONE derivation, with named overrides

> **This section was wrong in v1 and the owner corrected it.** v1 had two kinds of craft row — a
> derived `tool` kind and an authored `named` kind sitting beside it. That is not the model. **A
> named option is an OVERRIDE on the derivation, not a second list.** The derivation is the rule;
> the chapter's named options narrow it. Every facility with tools makes what its tools make —
> literally, uniformly, all 29.

**The chapter's rule:** a craft facility is defined by a *tool* and makes anything that tool can
make, per the Player's Handbook. There is no fixed output list anywhere in the chapter.

**SRD 5.2 states, for every tool, exactly what it crafts.** 20 tools carry a `Craft:` line; 93
distinct craftable names. So the dropdown is a computation:

```
facility.tools  ->  union of each tool's SRD craft list  ->  apply overrides  ->  the dropdown
```

Nobody authors it. Nobody can forget to repoint it. **This is the whole reason the format exists:
a derived list cannot drift from the catalogue, and an authored one already did** — five different
labels shared one catalogue row for a week and 1,860 assertions never noticed.

### The precedence rule — the owner's, and it is what makes the model work

> **Where a tool-derived item is also a named option, the named option governs.**

Without it, the Scriptorium derives `Spell Scroll` from Calligrapher's Supplies **with no class list
and no level cap**, because the SRD's tool line says only "Spell Scroll" — and the chapter's
constrained option (Cleric/Wizard, ≤3rd) becomes bypassable. Two paths to one thing, never
compared: the exact shape of every bug found this session.

With it, the Scriptorium derives `{Ink, Spell Scroll}`, the scroll collapses into the constrained
row, and **Ink arrives for free.** The whole practical effect of "the Scriptorium can make what its
tools make" is Ink — and the guard is one line.

### The overrides, in full

The chapter hand-writes a handful of options. **Zero hits for `Book Replica` / `Paperwork` /
`broadsheet` / `pamphlet` across the entire SRD equipment document** — these are chapter inventions
and must be typed.

| facility | override | narrows to |
|---|---|---|
| Smithy | Magic Item (Armament) | L9+, Common/Uncommon, **ARMAMENTS** |
| Workshop | Magic Item (Implement) | L9+, **IMPLEMENTS** |
| Scriptorium | Book Replica | **requires a blank book** — the only INPUT in the chapter |
| Scriptorium | Spell Scroll | Cleric or Wizard, ≤3rd, `noUpcast` (ALPG), carry bucket `consumable` |
| Scriptorium | Paperwork | up to 50 copies, 1 GP each, 7 days |
| Laboratory | Poison | **AL-EXCLUDED — absent, not disabled** |
| Sanctuary | Holy Symbol / Druidic Focus | the one genuinely fixed-output facility |

**The invariant the `tools` field buys:**

> A named override's `requires` tool must appear in its facility's `tools`.

That catches somebody bolting `Craft: Spell Scroll` onto a Smithy.

### Three joins that are the source's fault, not ours

1. **The SRD contradicts itself on names.** Tool lines say `Portable Ram`, `Glass Bottle`; the
   equipment table says `Ram, Portable`, `Bottle, Glass`. → **The generator must FAIL on an
   unresolved craft name, never skip it.** A join that misses answers "no match" cheerfully, in
   green.

2. **Three targets are categories.** No row is named `Arcane Focus`.

   | category | expands to |
   |---|---|
   | Arcane Focus | Crystal · Orb · Rod · Staff · Wand |
   | Holy Symbol | Amulet · Emblem · Reliquary |
   | Druidic Focus | Sprig of mistletoe · Wooden staff · Yew wand |

   *This answers the Sanctuary.* Its output was repointed at `g_amuletwornorheld` by picking one of
   three arbitrarily. Under the format it expands to three and the **player** picks — a `param`.

3. **Smith's Tools is an expression.** *Any Melee weapon (except Club, Greatclub, Quarterstaff,
   Whip), Medium armor (except Hide), Heavy armor,* + literals:

   ```js
   { categories: ["Martial melee weapon", "Simple melee weapon"],
     except:     ["Club", "Greatclub", "Quarterstaff", "Whip"],
     literals:   ["Ball Bearings", "Bucket", "Caltrops", …] }
   ```

   **The categories already exist** from `make_srd_gear.py`: Martial melee 18 · Simple melee 10 ·
   Medium armor 5 · Heavy armor 4 · Martial ranged 6 · Simple ranged 4. Computable today.
   Woodcarver's needs the same shape.

### Magic never arrives through a tool — by curation, not exception

- The SRD's only magic-capable tools are **Calligrapher's Supplies** (Spell Scroll) and the
  **Herbalism Kit** (Potion of Healing).
- The Workshop's list is **eleven Artisan's Tools, choose six** — Carpenter's, Cobbler's,
  Glassblower's, Jeweler's, Leatherworker's, Mason's, Painter's, Potter's, Tinker's, Weaver's,
  Woodcarver's. The SRD has seventeen; the chapter offers eleven. **Neither magic-capable tool is
  on it.**
- Alchemist's Supplies (Laboratory) craft Acid, Alchemist's Fire, Component Pouch, Oil, Paper,
  Perfume. No potions.
- The Herbalism Kit is not an Artisan's Tool and sits on no facility.

**So the derivation, applied faithfully, yields zero magic items. No carve-out is needed.** Magic is
always an override with explicit limits — which is what the ALPG assumes when it says a
`Craft: Magic Item` must be as the chapter describes it.

---

## 5 · `params` — the choice before "go"

An option may require the player to resolve a choice before it can be issued. One field, and it
generalises past scrolls:

| option | param |
|---|---|
| Spell Scroll | which spell — Cleric/Wizard, ≤3rd, no upcast |
| Holy Symbol | amulet · emblem · reliquary |
| Arcane Focus | crystal · orb · rod · staff · wand |
| Magic Item (Armament) | which, from ARMAMENTS |
| Book Replica | which book — **plus a blank book as input** |
| Menagerie / Recruit | which creature — CR band, then type-ahead |
| Laboratory | free text — name it |

**Where the answer is stored is the pointer question again.** A scroll's spell is *instance* data,
not *type* data. So:

```js
item: {
  catalogId: "g_spellscrolllevel1",     // the TYPE — what the catalogue knows
  params:    { spell: "Cure Wounds" },  // the INSTANCE — what this one is
  provenance: {…}, holder: {…}, lineage: […]
}
```

`params` sits beside `provenance`, `holder` and `lineage` — all already instance data. Items still
point; they just carry what is true of *this* one. It also kills a combinatorial explosion:
Cleric + Wizard at ≤3rd is **146 spells**, and `scroll_cure1` is the alternative — one hardcoded row
for one spell, marked `sample: true`, because nobody was going to type 146.

**The lists, both from SRD 5.2 (CC-BY-4.0), both generated, never authored:**

| list | rows | fields | gzipped |
|---|---:|---|---:|
| spells | 339 | name · level · school · classes | **3.9 KB** |
| creatures | 330 | name · CR · size · type | **2.7 KB** |

~100× distillation from 640 KB of source. Against a 340 KB bundle already 240 over budget, both are
free. **Stat blocks are not shipped** — this is not a VTT, and the list-shape says so.

---

## 6 · The Menagerie

The chapter: enclosures for **four Large creatures**; four Small or Medium occupy one Large's space.
Recruit adds a creature; creatures count as Bastion Defenders with a per-creature opt-out; cost is by
CR; *"typically only Beasts and some Monstrosities… though the DM might allow other creatures."*

### 6.1 · SR-8 · Keeps only creatures without language

> **`Languages: None`.** *"Some Monstrosities"* resolves to the ones without speech. A creature that
> speaks — or understands and cannot answer — is a person; an enclosure is then a cell, not
> husbandry.

**Why Languages and not Intelligence.** Both are in the SRD. They disagree on 8 creatures, and
Languages is right on every one:

- **INT ≤ 3 would exclude the Ape (INT 6), the Raven (5), the Baboon (4)** — which is what a
  menagerie is *for*. An arbitrary number pretending to be a principle.
- **Languages excludes the Giant Vulture** — *"Understands Common but can't speak."* INT would have
  kept it at 6. **A creature that knows it is imprisoned is a prisoner.**

Excluded by SR-8: Doppelganger · Manticore · Minotaur of Baphomet · Werewolf · Winter Wolf · Merrow ·
Wererat · Harpy · Giant Vulture. Every one talks.

### 6.2 · The three-way model

**Non-defenders are harvestable.** Too dangerous to trust at the wall, or too small to matter at it —
either way they earn their keep by producing. Both ends resolve to one rule; nothing in the middle
needs a special case.

```
                                        defends?   harvests?   n
  DANGEROUS   Monstrosity · no language · INT>=4      no        high      3
              Ettercap · Mimic · Phase Spider
  TINY        too small to fight                      no        low      18
  ORDINARY    everything else that fits              yes         —       65
  ────────────────────────────────────────────────────────────────────────
  EXCLUDED    Huge — won't fit the room                                   3
              Ankylosaurus · Giant Constrictor Snake · Killer Whale
```

`Monstrosity · Languages: None · INT ≥ 4` selects **exactly** Ettercap, Mimic, Phase Spider. Nothing
hand-listed. And the type split is the chapter's own taxonomy doing the work: **Beast + INT ≥ 4** is
Ape, Baboon, Raven, Giant Octopus, Giant Weasel — clever animals. **Monstrosity + INT ≥ 4** is a
predator with a plan. A raven is smart; it is not *plotting*.

### 6.3 · Capacity

```
  Large 1 · Medium 1/4 · Small 1/4 · Tiny 1/16 · Huge — will not fit
  a full room = 4 Large | 16 Medium/Small | 64 Tiny
```

**Ettercap is Medium.** "Four ettercaps" is *one Large slot*; the room holds **sixteen**. This
matters — see 6.5.

**SR-11 · Menagerie creatures count ON TOP of the Barrack's cap** (`BASTION_BARRACKS_CAP =
{roomy: 12, vast: 25}`). The chapter says creatures are defenders; it does not say they are
barracked.

### 6.4 · SR-10 · Harvest — per head, per turn, derived

> **10 GP per ¼ CR, per head**, using the chapter's own CR brackets.

| CR bracket | cost | gp/head/turn | payback |
|---|---:|---:|---:|
| 0 or ⅛ | 50 | 5 | 10 t |
| ¼ | 250 | 10 | 25 t |
| ½ | 500 | 20 | 25 t |
| 1 | 1,000 | 40 | 25 t |
| 2 | 2,000 | 80 | 25 t |
| 3 | 3,500 | 120 | 29 t |

**Flat ~25-turn payback at every CR**, because the chapter's price ladder is already linear in CR. One
number, no authored table, and it cannot drift — reprice a creature and the yield moves with it.

**A percentage-of-cost rate was considered and rejected**: it multiplies two things that both scale
with CR, so payback collapses from 100 turns at CR ⅛ to **4.2 turns at CR 3**. Everyone buys phase
spiders and the room becomes one creature deep.

**Brackets, not raw CR** — because 15 of the 18 Tiny creatures are CR 0, and strict CR would silently
delete SR-10 for them. The chapter itself refuses to distinguish (*"0 or ⅛ → 50 GP"*), so the harvest
ladder follows. Known consequence: the 0/⅛ bracket is ~2.5× more gold-efficient per gp invested. It
is not an exploit — 320 gp/turn out of a **Vast, level 13** room, against a Storehouse's 2,500, is a
bad deal that happens to be weird.

**The right benchmark is not the Storehouse.** The Menagerie's value is the 65 ordinary beasts *as
defenders*. Harvest compensates for **the defender you gave up**:

```
  16 wolves      4,000 gp  ->  16 defenders,        0 gp/turn
  16 ettercaps  32,000 gp  ->   0 defenders,    1,280 gp/turn
                                28,000 gp extra -> 22-turn payback on the delta
```

The room is a garrison or a farm. Both are coherent.

### 6.5 · SR-9 · A cunning monstrosity may take its keeper

```
TRIGGER   the Menagerie is among the rooms that rolled hostile
          AND the event is violent (not a standoff)
          AND the attack was lethal — somebody was going to die anyway.
          The noise IS the opportunity. No deaths, no chance.

ROLL      each cunning creature: 1d6. A 1 hits. They are NEVER defenders.

TARGETS   strictly in order, one per hit:
   1. other creatures in the room not on the list   <- easier to reach, delicious
   2. the handlers in that room                     <- drawn in by the commotion
   3. a hireling elsewhere, at random               <- BREACH

BREACH    only when a hit reaches stage 3. Only the creatures that ROLLED A 1 leave —
          the rest were docile and content. The fed stay caged: the door between the
          Menagerie and the house is shut, and a full mimic is still a mimic in a box.

EMPTY     nothing left to kill? They still go — but the house is under attack at that
          instant, so on the way out they meet the raiders and may defend the Bastion
          once, by accident, before they are gone.
```

**Prey animals are armour.** Three mimics, one ordinary animal, three hits: the animal absorbs one,
the handlers absorb two, three targets for three hits, **nobody leaves the room**. Four ettercaps,
four hits, no prey: two handlers, then two attacks with nothing left → hallway → breach. That falls
out of the target order; it did not have to be designed.

**The curve self-regulates. No rule has to say "don't."**

| cunning housed | P(≥1 hit) | **P(breach)** |
|---:|---:|---:|
| 1 | 16.7% | — |
| 4 *(one Large slot)* | 51.8% | **1.6%** |
| 8 | 76.7% | 13.5% |
| 16 *(a full room)* | 94.6% | **51.3%** |

**`entombHireling(bastion, h, date, turn, cause)` already exists** and buries with a named cause;
`bastionStaff(b)` already returns the house with `facId` on each. SR-9 is a swap inside existing
machinery, not new plumbing. The missing piece is `creatures: []` on the instance.

**All of §6 is the Exchange's own** and carries `// House rule [TABLE]`, the convention
`rollBastionAttack` already uses. The chapter says none of it. SCALE has agreed to nothing.

### 6.6 · Rulings closed here

- **Q21 — RULED: SRD only.** 330 creatures, no free-text fallback. A compiled list of Monster Manual
  names would be a compilation of Wizards' work.
- **Q22 — RULED: our table.** The chapter's *Menagerie Creatures table* is **absent from
  `Bastions.md`** — referenced twice per extraction pass, zero creature names anywhere in the
  chapter. We use the SRD's 86-that-fit and the chapter's CR table for price. **B-35** stays logged
  and downgraded: we cannot add the 13th `make_book.py` probe without `Blank_27.pdf`, and if we never
  hold that table we cannot leak it.

---

## 7 · `tables` — the facility owns its dice

| facility | table | state |
|---|---|---|
| Garden | Garden Types | — |
| Menagerie | Creature Costs by CR (0/⅛ 50 → 3 3,500) | present in the book |
| Gaming Hall | winnings (1d100 → 1d6×10 … 10d6×10 GP) | — |
| Archive | Reference Books | ✅ `ARCHIVE_BOOKS`, 7 forms × 5 |
| Pub | Pub Specials | ✅ `PUB_TAPS`, 7 forms × 5 |
| Training Area | trainers | ✅ `TRAINING_AREA_TRAINERS` |
| Theater | **the die** | the biggest thing left |

## 8 · `features` — bespoke, and fewer than it looks

| facility | feature |
|---|---|
| Barrack | Bastion Defenders |
| Armory | stocked → defenders roll 1d8 in place of the usual die |
| Greenhouse | Fruit of Restoration (3 fruits, Lesser Restoration) |
| Meditation Chamber | Fortify Self — **touches the event roll; build last** |
| Sacristy | Spell Refreshment |
| Sanctum | Sanctum Recall |
| War Room | lieutenants; **each housed lieutenant reduces the attack dice by 1** |
| Demiplane | you choose the location |
| Teleportation Circle | a friendly NPC spellcaster |

**The War Room's modifier needs no ruling and is buildable today** — but the chapter *subtracts* dice
while the app's walls apply a *ratio* (~line 2628). Lieutenants must pick one.

## 9 · `charm` — path built, 1 of 6 wired

`bCharmDef · facMayCharm · expireBastionCharms · grantBastionCharms` exist and are tested. Adding one
is a single line. `p5_sources` walks `charm.name/desc/grant`.

| facility | lvl | prereq | state |
|---|---:|---|---|
| Sanctuary | 5 | holy_focus | ✅ wired + tested |
| Arcane Study | 5 | arcane_focus | room not built |
| Observatory | 13 | **spell_focus** | room not built |
| Reliquary | 13 | holy_focus | room not built |
| Sanctum | 17 | holy_focus | room not built |
| Eldritch Discovery | 13 | (Observatory) | **ruled — SR-12** (talisman) |

---

## 10 · No ruling is open

> **Q15 — CLOSED, as SR-12. Eldritch Discovery bestows a talisman, not a Charm.**
>
> The chapter bestows a Charm on *"you or another creature of your choice on the same plane."* A
> bastion turn is resolved by one player, alone, between sessions — **there is no other creature
> present** — and AL already speaks to cross-character bastion benefit, pointing the other way
> (*combining requires the same session*).
>
> **The ruling turns the gift into an object**, which dissolves the problem: "another creature of
> your choice" stops being an abstraction resolved from a kitchen on a Tuesday and becomes *a thing
> you hand somebody at a table*.
>
> ```js
> talisman: { rarity: "common", consumable: true, itemClass: "UNTRADEABLE" }
> item:     { catalogId: "talisman", params: { charm: "Darkvision" }, … }   // type / instance
> ```
>
> - the chapter's unnamed die → **a coin flip**
> - holds one of Darkvision · Heroism · Vitality
> - **`consumable: true`** routes it through `itemBucket` → `"con"`: the same pool as scrolls and
>   potions, so each talisman costs a potion slot
> - **both caps apply** — `GIFT_LIMITS` charm (2/5/5/5) binds; `CARRIED_LIMITS` con (5/10/10/15) is
>   shared
> - **`UNTRADEABLE`** — never enters the trade economy, which is what reading (c) would have done
> - **the handoff is out of scope.** This platform handles everything around the table, not the
>   table. Both ends already exist: the giver files a DM-approved `SUBMIT_DISPOSAL` (*"anything else
>   can leave play (destroyed/lost/given)"*), the recipient logs a DM-vouched item.
>
> *No such item exists to point at — SRD 5.2 has 2 common magic items (Bead of Nourishment, Potion
> of Climbing) and the DMG's common tables have Dark Shard Amulet and Clockwork Amulet, both with
> their own effects. The talisman is the Exchange's own, `[TABLE]` labelled.*
>
> **One wiring point, and it is the only new thing in the ruling.** Charms live in `ch.gifts[]`; the
> talisman lives in `s.items[]`. For "both caps" to hold, **the gift counter must see items too** —
> otherwise a talisman is a charm that no charm-cap can find. That is a two-systems-one-thing seam,
> which is the shape of every bug found this session. **It gets an invariant.**

**Closed by this document:** Q15 (→ SR-12) · Q16 (Poisoner's Kit crafts `[Basic Poison]`; ALPG
excludes poisons; craft list `[]` — the kit stays and makes nothing) · Q17 (the chapter names the
tables: Smithy → Armaments, Workshop → Implements) · Q18 (inverted — the Laboratory's free-text row
was the only one built to the actual rule) · Q19 (dissolved — a ≤3rd scroll is campaign-purchasable
either way) · Q20 (moot — Herbalism Kit sits on no facility) · Q21 · Q22 · Q23 (→ SR-11).

**Every ruling in the facility system is settled.** The register is Codex ch. 7: **SR-8** language ·
**SR-9** the 1d6 and the door · **SR-10** harvest · **SR-11** defenders on top · **SR-12** the
talisman · **SR-13** named governs derived.

**The only thing left in the ledger is B-35** — the chapter's *Menagerie Creatures table* is absent
from `Bastions.md` and cannot be probed without `Blank_27.pdf`. Downgraded: SR-8 means we never hold
that table, so we cannot leak it.

---

## 11 · Worked examples

**Derived, no authoring:**
```js
laboratory: {
  id: "laboratory", name: "Laboratory", kind: "special",
  minLevel: 9, prereq: null, space: "roomy", enlarge: null, hirelings: 1,
  tools: ["Alchemist's Supplies"],
  orders: ["craft", "maintain"],
  options: { craft: [{ tool: "Alchemist's Supplies" }] },
  //   -> Acid · Alchemist's Fire · Component Pouch · Oil · Paper · Perfume
  //      derived, never typed. Craft: Poison is AL-excluded and simply absent.
}
```

**Derived, with overrides:**
```js
scriptorium: {
  id: "scriptorium", name: "Scriptorium", kind: "special",
  minLevel: 9, prereq: null, space: "roomy", enlarge: null, hirelings: 1,
  tools: ["Calligrapher's Supplies"],          //   -> Ink, Spell Scroll
  orders: ["craft", "maintain"],
  options: { craft: [
    { tool: "Calligrapher's Supplies" },
    { override: "Spell Scroll", requires: "Calligrapher's Supplies",
      params: [{ id: "spell", from: "SPELLS", classes: ["cleric","wizard"], maxLevel: 3 }],
      noUpcast: true, carryBucket: "consumable" },       // ALPG
    { named: "bookreplica", requires: "Calligrapher's Supplies",
      input: "blank book", params: [{ id: "book", freeText: true }], days: 7 },
    { named: "paperwork",   requires: "Calligrapher's Supplies", copies: 50, gpEach: 1, days: 7 },
  ] },
}
```

**The awkward one — why the format was read out of 29:**
```js
war_room: {
  id: "war_room", name: "War Room", kind: "special",
  minLevel: 17, prereq: "martial", space: "vast", enlarge: null,
  hirelings: { min: 2, note: "one per lieutenant" },      // <- "2+ (see below)"
  tools: [], orders: ["recruit", "maintain"],
  features: [{ id: "lieutenants", effect: "attackDice-1 per housed lieutenant" }],
}
```

**The Menagerie:**
```js
menagerie: {
  id: "menagerie", name: "Menagerie", kind: "special",
  minLevel: 13, prereq: null, space: "vast", enlarge: null, hirelings: 2,
  tools: [],
  capacity: { unit: "large", n: 4, ratios: { large: 1, medium: 0.25, small: 0.25, tiny: 0.0625 } },
  orders: ["recruit", "harvest", "maintain"],   // HOUSE RULE [TABLE]: the chapter gives Recruit only
  options: {
    recruit: [{ named: "creature", params: [{ id: "creature", from: "CREATURES",
                 filter: "keepable", crBands: true }], costFrom: "CREATURE_COSTS_BY_CR" }],
    harvest: [{ named: "harvest", derived: "SR-10" }],
  },
  features: [
    { id: "sr8_language",   rule: "keep only Languages: None" },
    { id: "sr9_cunning",    rule: "Monstrosity + no language + INT>=4 never defend; 1d6 on a lethal attack" },
    { id: "sr10_harvest",   rule: "non-defenders harvest: 10 gp per 1/4 CR per head, chapter's brackets" },
    { id: "sr11_defenders", rule: "creatures count ON TOP of BASTION_BARRACKS_CAP" },
  ],
}
```

---

## 12 · Build order

1. **`make_srd_tools.py`** — `TOOL_CRAFTS` from SRD 5.2. Fetched, cross-checked, **fails on an
   unresolved craft name**, never hand-edited. Plus category expansion and the
   `{categories, except, literals}` evaluator.
2. **`make_srd_lists.py`** — spells (339) and creatures (330). **Must assert parsed count == CR-marker
   count**; heading level is **per-file**; `_Size or Size Type_` must parse.
3. **The format** — `tools`, `creatures`, `capacity`, widen `hirelings`, `outputs` → `options`, fold
   in furnishings and `enlarge`.
4. **The invariants** — an override's tool is declared; every derived name resolves; a facility's
   creatures fit its capacity; `p10_ledger` extended. **Then delete the authored output rows** — they
   stop being the source of truth.
5. **Fill in 29.**
6. Nothing is blocked. Every ruling is closed — Codex ch. 7, SR-8…SR-13.

**The consequence worth stating.** Once the dropdown derives, the `arrows20` class of bug becomes
**unrepresentable** — there is no label to disagree with a catalogId, because there is no authored
pair. Which means the four repoints made by hand this session are scaffolding, and one of them (the
Smithy's plate row) **should not exist at all**. It was tidied instead of deleted. Left in place, on
the owner's call, until the generator lands.

---

## Appendix · Four parser defects, one afternoon

Every one was caught by a cross-check against a number the parser does not control. **None was caught
by the parser.** This is the discipline the generators inherit — it is not a footnote.

| what | said | actually | caught by |
|---|---|---|---|
| facility stat blocks | 22 | **29** | expected count |
| creature headings | 239 | **330** | CR-marker count |
| sub-headings as creatures | invented 4 | 0 | duplicate-name check |
| `_Medium or Small_` size | 36 typed `"or"` | — | reading the output |

> A parser with a hole answers cheerfully, in green. So did `Bastions.md` with every table missing,
> and so did 1,860 assertions against an `arrows20` that had lost its meaning.

---

## 13 · PATTERN LIBRARY — what a facility is made of, and where each part lives

**§3 describes ONE of four places a room lives.** A facility that has a perfect §3 definition and
nothing else is not built; it is declared. This section is the checklist a room must satisfy before
the word *minted* is honest, and it is derived from the running app, not recalled.

### 10.1 · The four homes

| where | what lives there | shape |
|---|---|---|
| `src/data/bastion.ts` → `BASTION_FACILITIES` | the stat block and the craft model | one object per room (§3) |
| `src/bastion/registry.ts` | everything the room *feels* like | seven per-room tables, below |
| `src/bastion/engine.ts` | what an order DOES when given | `resolveBastionOrder` branch |
| `src/reducer/*.ts` | what the player can dispatch | actions (`MINT_BOOK_ITEM`, `ENLARGE_BASTION_FACILITY`, …) |

### 10.2 · The registry tables — all seven are required

Every one of these is keyed by facility id. A room missing any of them falls back to generic text,
which is the tell that it was never finished.

| table | what it holds | required |
|---|---|---|
| `BASTION_LIFE_TASKS` | the week's beats — what the staff were seen doing | **≥6 beats**, and they must differ by bastion form |
| `FACILITY_FURNISHINGS` | `[{ slot, name }]` — what stands in the room | ≥1 slot, and ≥1 slot must have a **ladder ≥2 tiers** |
| `FACILITY_ROLES` | the job titles its hirelings hold | ≥1 |
| `FACILITY_REACTIONS` | the room's own voice on events | present — absence silently falls back to generic |
| `BASTION_SIZE_FLAVOR` | how cramped/roomy/vast read for THIS room | present |
| `FACILITY_RUIN` | how it reads when neglected or sacked | present |
| `FACILITY_FORM_NAMES` | its name in each of the **8 bastion forms** | all 8, non-empty, **distinct from each other and from the canonical name** |

### 10.3 · Hirelings — the establishment model

Staffing is **derived, never typed**. `facEstablishment({ defId, size })` returns the post count;
`staffFacility` fills it with hirelings that each carry a **name and an age**. The strict bar is
that the room fills its establishment exactly, and that no hireling arrives anonymous.

- Specials always have a post. **Basics have zero staff by design** — the two-tier household model —
  so the staffing, orders and craft checks are structurally skipped for `kind: "basic"`. That is not
  a loophole; the applicable columns are held to the same bar and the inapplicable ones are declared
  inapplicable.
- The **War Room** is the one room whose `hirelings` is an object (`{ min: 2, note: … }`). Accept
  both shapes and normalise on read. Do not make 28 rooms pay for one.

### 10.4 · Furniture — the ladder is the point

`FACILITY_FURNISHINGS` says what a room starts with; `FURNISHING_LADDER` says what it can become.
A room whose every slot is terminal cannot be improved, and an unimprovable room is a dead end for a
player with gold. **At least one slot must offer two or more tiers.**

### 10.5 · The strict bar, and what it does NOT yet check

`harness/facility_mint.cjs` enforces §10.2–§10.4 and the §2 stat block. **EXTENDED 31 Jul.** It now also checks, for the rooms each applies to:

| check | what it catches |
|---|---|
| §3 `outputs` on any craft room | a craft order with nothing to make |
| §3 `tools` — or `noTool`, a **cited** absence | an unstated missing tool, while allowing the Arcane Study's genuine one |
| §8 `features` complete: `id`, `text`, `impl`, `cite` | a mechanic described but not attributed |
| §8 `features` — **every `impl` names a real function** | a claim with no code behind it |
| §7 `tables` — **every pointer resolves to a real export** | a pointer that reads as coverage while covering nothing |
| §14 shelf — non-zero capacity, and an `enlargeBenefit` | a shelf that cannot hold or cannot grow |

All six are negative-tested: breaking an `impl` name or a table pointer demotes the room to
❌ NOT YET MINTED with the offending name printed. **Still unchecked: `capacity` and `open`.**

---

## 14 · PATTERN · the shelf — an in-world container a room owns

Two rooms hold a **shelf**: an in-world container of items a character owns, kept at the bastion.
This is the largest piece of facility tooling in the project and v2 did not mention it.

> **REUSE THIS.** The shelf is not a Library feature, it is a *container* pattern, and at least three
> unbuilt rooms need the same thing: the **Menagerie**'s pens (§6 already sizes them — four tiny to a
> medium), the **Stable**'s stalls, and the **Storehouse**'s stores. Building any of those, copy this
> shape rather than inventing a second one:
>
> | the pattern | the Library's instance |
> |---|---|
> | a flag on the def saying the room contains things | `shelvesBooks: true` |
> | a **capacity function** owning the numbers, keyed by def + size | `bookShelfCap(defId, size)` |
> | base = capacity **at the room's PRINTED size**, doubling per tier enlarged | 20 at roomy, 40 at vast |
> | an `enlargeBenefit` whose prose says *doubles*, never the count | "twice the shelf room…" |
> | contents mint as real items with provenance, via one reducer action | `MINT_BOOK_ITEM` |
> | contents rest **at the bastion** (`inPack: false`), with a reversible pack toggle | packing a book |
> | the cap counts **by kind**, so two rooms' contents do not compete | library vs archive books |
> | at the cap the add is refused **silently and without penalty** | shelf simply full |
>
> Two of those rules are the ones that cost us time and are worth taking for free: **the capacity
> function must own the numbers** (prose that restates them is a second source of truth), and **the
> base is the printed size, not `cramped`** — getting that wrong put every keep in the game one tier
> high, and the test that should have caught it had been written from the code instead of from the
> requirement.

### 11.1 · Which rooms shelve, and how much

`shelvesBooks: true` on the definition; capacity from `bookShelfCap(defId, size)`.

| room | printed size | cap there | enlarged to vast |
|---|---|---|---|
| **Library** | roomy | **20** | 40 |
| **Archive** | roomy | **10** | 20 |

**The base is the cap at the room's PRINTED size, not at cramped.** This was a live bug until
31 Jul: the tier was indexed from `cramped` regardless of where the room actually starts, so every
keep ran one tier high — Archive 20, Library 40. The tier is now the **distance enlarged** from the
printed space, so an un-enlarged room always sits exactly on its base.

> The transitions suite asserted the buggy numbers, because the check had been written from what the
> function did rather than from what was specified. **A test written by reading the implementation
> can never fail.** It is now written from the requirement.

### 11.2 · Growth

The shelf is the reason to enlarge these rooms, and `enlargeBenefit` is what the app promises in
return for the money. Costs come from `BASTION_ENLARGE` (roomy→vast: 2,000 gp / 80 days) and are
never retyped.

**The benefit prose states the DOUBLING and never the absolute counts.** `bookShelfCap` owns those
numbers; a second copy in prose is a second source of truth waiting to drift.

### 11.3 · The two kinds of book

Both mint through `MINT_BOOK_ITEM` as a real `STORY_ITEM` with provenance. They differ in what is
inside them:

| | Library book | Archive book |
|---|---|---|
| carries | `paragraph` — three sourced facts, stitched | `wikiUrl` — a pointer |
| `source` tag | `The Deep Grounds Exchange — Library` | `— Archive` |
| from | `LIBRARY_SUBJECTS` (100 subjects, 1,965 facts) | `ARCHIVE_BOOKS` + `composeArchiveTitle` |
| DMG basis | Research → *Topical Lore*, "up to three accurate pieces of information" | Research → *Helpful Lore* (Legend Lore) |

### 11.4 · Rules that hold for both

- **One copy per shelf.** Clicking twice owns once.
- **Books land on the SHELF, not in the pack** (`inPack: false`). The player packs a book when they
  want it at the table; a pack holding every book a character ever earned is clutter.
- **The pack toggle is reversible** — leave it at the bastion, bring it back. Leaving it un-equips
  and un-attunes it, so it stops counting against carried limits.
- **The cap counts by KIND.** A library book (has a paragraph) and an archive book (has a link)
  count against their own room's cap, not each other's.
- **At the cap the shelf is simply full** — the mint is refused, silently and without penalty.

### 11.5 · The generator, verified end to end

Confirmed 31 Jul by running it, not by reading it: four Research turns on a live Library produced
four distinct books — title, genre-matched closer, and a three-fact drift paragraph — and minting
one through the reducer put a `bookItem` on the shelf carrying its paragraph, its topic and its
provenance. **The Library book generator is complete.** See `FINDINGS.md` for the corpus record.

---

## 15 · PATTERN · naming, and what §3 promises that is not built yet

Stated plainly so the next reader does not have to discover it. **Neither side is obviously right;
this is a reconciliation to be scheduled, not a bug to be panicked over.**

| §3 says | code has | note |
|---|---|---|
| `tools: [...]` / `{ choose, from }` | `tool: "g_tool_smith"` · `toolChoice: { count, from }` | model is implemented, names differ |
| `options: { craft: [...] }` | `outputs: { craft: [...] }` | same shape, different key |
| `enlarge: { to, benefit }` | `enlargeBenefit: "…"` (flat string) | costs already derive from `BASTION_ENLARGE`, so only the benefit needed a home |
| `tables: {}` on the def | **RESOLVED 31 Jul** — declared as POINTERS on archive/library/armory, and the checker verifies each resolves | pointing beats inlining: the tables are shared with the composers |
| `features: []` on the def | **RESOLVED 31 Jul** — declared on the Armory with `impl` naming the live function | the feature was always BUILT; it was never DECLARED |
| `open: null` | **does not exist** | §3's own argument — *a TODO the gate reads is a deadline* — is currently unenforced |

**`BASTION_FACILITIES` holds 14 rooms: 8 specials and 6 basics.** The other **21** DMG specials have
no definition at all. That is the honest denominator for any statement about facility progress —
**the roster is 29, not 28** (B-69: a stale copy of `facility_mint.cjs` had lost SACRISTY, which is
exactly the B-38 defect the roster guard exists to prevent).
