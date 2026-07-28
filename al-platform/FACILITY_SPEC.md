# The 29 Special Facilities — build spec

**Corrected 17 July 2026. This file was wrong five times in one session; every figure below is now
read out of the running app, not out of the last version of this file.**

> **STATUS — 19 July 2026: THE UNDERCARRIAGE IS COMPLETE. Facility minting can begin.**
> Everything the facility-class plugs into is built and gated (gate at 1,981 assertions, 0 red,
> including a real render harness). Built this session, in order: the henchman record (three trait
> tags + a bonds ledger, backfilled deterministically); the **household-week generator** (deterministic,
> day-sorted, rolled once per turn and stored on `t.household`); the **reaction seam** `reactionsFor(defId)`
> (facility-overridable, general fallback underneath); the two detectors (repeat→reaction signed by the
> reactor's trait, co-occurrence→warmth) writing bonds; the **housing model** (`bastionHousing` + commute)
> with a readout; **capability-based narration** (any facility with a task table narrates — the generator
> asks capability, never `kind`); **death reads the bonds** into a "Remembered by" stone; **form immutability**
> (a keep chooses its form once, then it's frozen); and the **Hamlet** form (the town veneer). The old
> per-chore timer subsystem was **torn out** last. The socket is: `lifeTasksFor` + `reactionsFor` + the
> facility name, read by capability, form-skinnable, frozen behind an immutable form. A facility joins the
> household story the moment its task table is non-empty — no engine change, just data.
>
> **Still content, not code (pending, falls back gracefully):** per-facility task tables and reaction
> tables; the Hamlet skins for the other form-keyed tables (archive books, slice-of-life — they fall back
> to `keep` until authored); richer reaction/friction fragments.
>
> **Class coverage — verified 19 July:** every one of the 12 classes has ≥1 special facility that focuses
> on it (via the `arcane_focus`/`holy_focus`/`expertise`/`martial` prereq buckets). Coverage is complete.
> Balance note: the DMG's own distribution gives casters + Fighter a signature at L5, but pushes Bard/
> Barbarian to L9, Monk to L13, and Rogue's Guildhall to L17. Not the app's doing and not fixable without
> house-ruling (which the rules-are-the-bible standard forbids); recorded as a known property.

```
  built     14 of 29        charm rooms wired   1 of 5
  levels     5: 9   ·  9: 10   ·  13: 6   ·  17: 4
  orders    Craft 7 · Empower 6 · Recruit 5 · Research 4 · Trade 4 · Harvest 3
  space     Roomy 20 · Vast 7 · Cramped 2
  prereqs   9 of 29         enlargeable  6 of 29
```

## WHAT THIS FILE GOT WRONG, SO THE NEXT READER DOESN'T INHERIT IT

1. **It marked 9 built. Fourteen are built.** Trophy Room, Greenhouse, Laboratory, Archive and Pub
   all shipped and this file never caught up.
2. **So "Suggested order, step 1: Group A — Greenhouse, Laboratory, Trophy Room, Archive, Pub" was
   already done.**
3. **Group B's table named the wrong effect for three of five.** It listed the Reliquary's Charm as
   *Harvest: Talisman*, the Observatory's as *Empower: Eldritch Discovery*, the Sanctum's as
   *Fortifying Rites*. Those are those rooms' **other** features. The actual Charms are below.
4. **It said there are five Charm grants. There are six.** *Eldritch Discovery* is a separate grant
   on the Observatory with a different shape — order-driven, random, and it can target another
   creature.
5. **Group A's "a row plus an outputs list" understated it** — the outputs list has to point at a real
   CATALOG row, and for five of six it pointed at `arrows20`, a placeholder.

**Rule for this file: if you change the app, change this in the same commit, or delete the claim.**

## THE HONEST SPLIT — what's left, 15 rooms

| kind | n | which | what it means |
|---|---:|---|---|
| **DATA** | 2 | Gaming Hall, Teleportation Circle | a row. Minutes. |
| **DATA+** | 1 | Scriptorium | a row plus an INPUT (a blank book) — no facility has one yet |
| **CHARM** | 4 | Arcane Study, Observatory, Reliquary, Sanctum | **the path is BUILT.** Each is a room + one `charm: {...}` line. |
| **RULING** | 4 | Stable, Guildhall, Menagerie, War Room | not code problems — see below |
| **BUILD** | 3 | Theater, Demiplane, Meditation Chamber | real builds. The **Theater die** is the biggest thing left. Meditation Chamber touches the event roll — do it last. |

## THE CHARM PATH — BUILT 17 JUL. Four sockets waiting.

`bCharmDef` · `facMayCharm` · `expireBastionCharms` · `grantBastionCharms`. See HANDOFF for the
rulings. Adding a Charm to a new room is now **one line on its def**:

```js
charm: { name: "...", desc: "...", grant: "..." }
```

`p5_sources` walks `charm.name/desc/grant`, so those three strings are scanned for DMG prose like
everything else the app shows a player.

| room | lvl | prereq | the Charm | state |
|---|---:|---|---|---|
| **Sanctuary** | 5 | `holy_focus` | *Healing Word* once, no slot | ✅ **wired + tested** |
| **Arcane Study** | 5 | `arcane_focus` | *Identify*, no slot, no materials | room not built |
| **Observatory** | 13 | `spell_focus` | *Contact Other Plane*, no slot | room not built |
| **Reliquary** | 13 | `holy_focus` | *Greater Restoration* once | room not built |
| **Sanctum** | 17 | `holy_focus` | *Heal* once, no slot | room not built |
| **Eldritch Discovery** | 13 | (Observatory's Empower) | 7 nights, odd die → Darkvision / Heroism / Vitality | **BLOCKED — Q15** |

**The cap fits, and only just.** A bastion needs level 5, and **level 5 is Tier 2**, so the T1 charm
cap of 2 is unreachable — every bastion owner carries against 5. The prereqs gate the rest: a Cleric
gets Sanctuary + Reliquary + Sanctum + Observatory = **4**; a Wizard's arcane focus gets Arcane Study
+ Observatory = **2**. Nobody holds both sets without a multiclass. Plus Eldritch Discovery, the
realistic maximum is **5 against a cap of 5**, at level 17, and it never binds below that.

## THE 14 BUILT

`workshop · garden · storehouse · library · barracks · smithy · trophy_room · greenhouse ·
laboratory · archive · pub · sanctuary · training_area · armory`

## THE TABLE

| | facility | lvl | space | hire | order | prereq | enlarges |
|---|---|---:|---|---:|---|---|---|
|  | **Arcane Study** | 5 | Roomy | 1 | Craft | `arcane_focus` | — |
| ✅ | **Armory** | 5 | Roomy | 1 | Trade | — | — |
| ✅ | **Barrack** | 5 | Roomy | 1 | Recruit | — | → Vast, 2,000 gp |
| ✅ | **Garden** | 5 | Roomy | 1 | Harvest | — | → Vast, 2,000 gp |
| ✅ | **Library** | 5 | Roomy | 1 | Research | — | — |
| ✅ | **Sanctuary** | 5 | Roomy | 1 | Craft | `holy_focus` | — |
| ✅ | **Smithy** | 5 | Roomy | 2 | Craft | — | — |
| ✅ | **Storehouse** | 5 | Roomy | 1 | Trade | — | — |
| ✅ | **Workshop** | 5 | Roomy | 3 | Craft | — | → Vast, 2,000 gp |
|  | **Gaming Hall** | 9 | Vast | 4 | Trade | — | — |
| ✅ | **Greenhouse** | 9 | Roomy | 1 | Harvest | — | — |
| ✅ | **Laboratory** | 9 | Roomy | 1 | Craft | — | — |
|  | **Sacristy** | 9 | Roomy | 1 | Craft | `holy_focus` | — |
|  | **Scriptorium** | 9 | Roomy | 1 | Craft | — | — |
|  | **Stable** | 9 | Roomy | 1 | Trade | — | → Vast, 2,000 gp |
|  | **Teleportation Circle** | 9 | Roomy | 1 | Recruit | — | — |
|  | **Theater** | 9 | Vast | 4 | Empower | — | — |
| ✅ | **Training Area** | 9 | Vast | 4 | Empower | — | — |
| ✅ | **Trophy Room** | 9 | Roomy | 1 | Research | — | — |
| ✅ | **Archive** | 13 | Roomy | 1 | Research | — | → Vast, 2,000 gp |
|  | **Meditation Chamber** | 13 | Cramped | 1 | Empower | — | — |
|  | **Menagerie** | 13 | Vast | 2 | Recruit | — | — |
|  | **Observatory** | 13 | Roomy | 1 | Empower | `spell_focus` | — |
| ✅ | **Pub** | 13 | Roomy | 1 | Research | — | → Vast, 2,000 gp |
|  | **Reliquary** | 13 | Cramped | 1 | Harvest | `holy_focus` | — |
|  | **Demiplane** | 17 | Vast | 1 | Empower | `arcane_focus` | — |
|  | **Guildhall** | 17 | Vast | 1 | Recruit | `expertise` | — |
|  | **Sanctum** | 17 | Roomy | 4 | Empower | `holy_focus` | — |
|  | **War Room** | 17 | Vast | 2+ | Recruit | `martial` | — |

## THE `arrows20` BUG — OPEN, AND IT'S IN THE SANCTUARY

`BASTION_CRAFT_ITEM = "arrows20"` is a labelled placeholder ("production picks the crafted type").
The Workshop's *"Ammunition — 20 arrows"* row is correct; **it was copy-pasted down and never
repointed**, so five outputs mint arrows:

```
Smithy    · Plate armor (mundane)     → g_plate EXISTS. one-word repoint.
Smithy    · Armor, +1                 → see Q17 — should pick from ARMAMENTS, not be hardcoded
Workshop  · Magic ammunition, +1      → see Q17
Sanctuary · A Holy Symbol             → check the SRD catalogue before assuming it's absent
Sanctuary · A Druidic Focus           → likewise
```

**Why 1,860 assertions never caught it:** the log line reads `chosen.label` (right) and the item
reads `CATALOG[catalogId].name` (wrong). **Two different fields, never compared.** The fix is the
invariant: *an item's catalogId must match what the log says was made.*

## GROUP C — rulings needed before code

| facility | the DMG says | the question |
|---|---|---|
| **Guildhall** 17 | thieves steal a **nonmagical object** | from *whom*? And it arrives from nowhere — AL's provenance has no source for it. |
| **Menagerie** 13 | buys creatures by CR | **the chapter answers half of this**: *"Creatures in your Menagerie count as Bastion Defenders"*, opt-out per creature. **The DMG's CR price table exists** (0/⅛ 50 GP → 3 3,500 GP). What's left is only whether AL permits the purchase. |
| **War Room** 17 | musters **100 Guards** per lieutenant | **the chapter answers this too**: the army is **not a garrison**. Lieutenants are *"hirelings, not Bastion Defenders"*, and **each housed lieutenant reduces the attack dice by 1** — a third modifier beside walls (−2) and the Armory (d8s), buildable today, no ruling. The Guards must be led *"wherever the army goes"* and disband unled or unfed. They never reach the Attack table. *(NB the DMG subtracts; the app's walls apply a ratio at line ~2628. Lieutenants will have to pick one.)* |
| **Stable** 9 | Trade: Animals | same shape as the Menagerie, smaller. Probably the same ruling. SRD 5.2 mount prices are now in the catalogue generator's reach. |

## SUGGESTED ORDER

1. **`arrows20`** — the repoint + the missing focus rows + the ledger-vs-drawer invariant. It's a live
   provenance bug in a product whose thesis is provenance, and it's in the room the Charm path just
   landed in.
2. **The four Charm rooms** — Arcane Study (L5, most reachable), then Reliquary, Observatory, Sanctum.
   Cheap now: a room + one line each.
3. **Scriptorium** — first facility needing an *input* (a blank book).
4. **Theater** and **Demiplane** — the two real builds.
5. **Meditation Chamber** — last; it reaches into the event roll, which has the house inversion in it.
6. **Group C** only after the rulings.

## WHAT WILL BITE

- **Thessaly's convent** needs Sanctuary ✅, Library ✅, Garden ✅, + **Sacristy, Reliquary, Sanctum**.
  Reliquary and Sanctum are now cheap (the Charm path exists); Sanctum still needs Empower.
- **7 facilities print Vast**, and a Vast pause is `bastionSizeDays('vast')` = **125 days = 62.5 real
  hours**. Four of the seven are level 17. Decide whether the pause should scale that way before
  shipping seven of them.
- **The level curve is top-heavy**: 9 of 29 at level 5, 10 at level 9. Most of what's missing, most
  SCALE players will never reach.

## PARKED — construction progress beats (per-facility, deferred)

Idea (this session): construction should report itself **as it goes**, the way a battle or a festival
does — an incremental progress line, not just a start and a finish. The rail already exists. An attack
advances through timed **beats** (`advanceBastionHappening` surfaces one line as each beat lands);
construction rides the same rail — the build clock crosses thresholds (foundation → frame → roof) and
each threshold surfaces a line.

The content is **per-facility, not per-form**. Unlike All-Is-Well (`bastionSliceOfLife`, keyed by the
bastion's *form*), these beats are keyed to the ROOM going up — a smithy is raised differently from a
library — the same way each built facility already carries its own flavored name.

**Downstream of this checklist.** The beats are facility content, and the 15 rooms above aren't
authored yet, so this comes after them, not against the undercarriage now. Start and finish already
land in the keep chronicle (`logBastionWork` → the `⚒ Works` lines); this fills in the middle.

## PARKED — the town form (single-owner "company town", deferred)

> **Update 19 Jul:** the town **veneer** now exists — `hamlet` was added to `BASTION_FORMS` (word:
> "building"), so a keep can read as a village today (with a starter pub skin; other form-keyed tables
> fall back to `keep` until authored). The town **feature** below — grouping facilities into buildings,
> hireling roll-up, voted common-space actions — remains deferred and is a consumer of the facility layer,
> to be built AFTER facilities. Owner's later ruling: the combined **form** is a flavor selector only
> (trade partners / town / etc., zero mechanical weight) living on a shared common-space page that belongs
> to neither bastion; trade there mirrors the market (generate on bastion → list → move to character →
> other player trades for it); a messaging system and a combined-zone calendar live there too. Combine
> stays untouched until after facilities; the one facility-class question it raises — is a facility ever
> shared/co-owned — is answered NO for now (facilities stay single-owned; a common space is its own
> pseudo-bastion built later), so no `ownerScope` field is needed on the class.

Argument (this session): a bastion is already a *set* of facilities with no adjacency — so "one
building" is a drawing choice, not a rule. Draw them apart — master's house (bedroom + parlor +
kitchen), the forge, the chapel, the granary, cottages — and a keep is a manor; a manor with enough
dwellings and services is a village. The test that settles it is NOT "do the people have their own
agency" (a company town's employees don't, and Pullman is still a town; manorial serfs don't, and a
vill is still a village) — it's **scale + function**: enough dwellings and services to read as a
settlement. On that test the existing model already qualifies.

Buildable on the existing data, three layers, none touching the undercarriage:

- **GROUPING** — the player lumps facilities into named buildings on a map. Pure presentation over the
  facility set (which already has no adjacency to fight). Villager houses are just more BASIC rooms —
  bedrooms, parlors, kitchens — bought as normal.
- **ASSIGNMENT** — a building's hirelings are its residents. `staffFacility` already gives a smithy one
  hand at small and more when enlarged; this rolls those counts up BY BUILDING and lets the player pin
  a named hireling to a building. The headcount math exists; this reads it out per building.
  - **SHARED SUBSTRATE:** the bed-capacity HOUSING model lives in the household-engine entry below
    ("Housing layer"). "House your staff or they commute" and "buy bedrooms for villager houses" are one
    system — build it once. Villager houses = more BASIC bedrooms; the same beds-vs-heads capacity check.
- **VOICE** — the town form's slice-of-life is keyed to the SETTLEMENT (the well, market day, the
  smith's apprentice, hands in from the fields), the same per-form table swap already done for cavern
  vs. keep. Not keyed to a manor.

**The seam — "serfs".** The company-town framing (employees at employer-owned facilities) rides the
hireling model cleanly: headcount + roles per building, no ownership-of-persons implied. The moment the
people need to be NAMED, with their own say, that is the federated/voted build — not this one. Same
line as the progress beats: the single-owner town treats its people as a company treats employees; a
place with more than one hand on it is the shared-space feature.

**Depends on this checklist:** the per-facility hireling CONTENT (a forge's household reads unlike a
chapel's) has to be authored first — same prerequisite as the progress beats above.

## BUILT 19 Jul — the household-week engine (chores → emergent story; the big one)

> **The mechanism below is LIVE and gated** (generator, both detectors, bonds, housing, death-reads-bonds,
> teardown of the old chore timer). What remains is CONTENT: per-facility task/reaction tables and richer
> fragments. The design notes are kept as the authoring reference.

Replaces the per-chore timer entirely. Decided across a long design session; captured here so it isn't
carried only in chat. Build engine-first, generic names now, real content later.

**What it is.** A Bastion turn is a week the hero is usually away for. Instead of the player clicking
individual chores on a real-world timer, the keep's household LIVES the week on its own and, when the
turn resolves, hands back a story of what happened while you were gone. Basic rooms stop being
interactive; the payoff moves entirely into the log.

**Kill list (the per-chore timer subsystem goes).** `choreAt`, `choreLockedUntil`, `choreLocked`,
`choreAvailable`, `choreDaysLeft`, `choreDone`, `DO_BASTION_CHORE`, the chore select + "Do it" button +
countdown, the chore branch of `useLockExpiry`. KEEP `CHORE_LOCK_MIN` (the pub/archive re-stock still
uses it) and KEEP `BASTION_LIFE_TASKS` (now the beat pool) and `lifeTasksFor`.

**Determinism.** The story is rolled ONCE when the turn resolves and STORED on the turn (like
`t.event`/`t.flavor`), never regenerated on render. Rolls come off a seed derived from the turn (bastion
id + turn number) so the same week always yields the same story — reproducible and gate-testable against
exact output. (Same stability trap we already fixed with the clock: never generate narrative at render.)

**Structure — day-sorted, scales into a homecoming.** Outer loop = the 7 days; inner loop = each staffed
basic room. Each day, every basic room drops ONE complete, self-contained sentence from its
`BASTION_LIFE_TASKS` pool. One room → a tight 7-line week. Six basic rooms → ~40+ beats grouped by day: a
dozen-paragraph short story, and it GROWS the more household you've built. This volume is the feature,
not a bug — it's the reward for a real keep. Store as structured data: `t.household = [{ day, beats[] }]`,
so the log renders it and a future export can reuse it.

**Away vs. home.** `t.away` (already stamped on table check-in) gates the size: away → the full homecoming
story; home → a trimmed paragraph (you were there; it isn't a saga about your own absence).

**Traits (UPDATED — three, not one).** At creation `randHench` rolls each henchman THREE distinct trait
tags; anyone already in state gets topped up deterministically from their id (hand-authored traits kept).
Three gives two henchmen real surface area to spark on. Tags are the freeform `string[]` idiom used
everywhere (`slovenly`, `proud`, `superstitious`, `soft-hearted`, …). Traits do the CASTING for the two
interaction detectors below.

**Interactions = two detectors over the week, each writing a bond. (Frank's model.)** The solo beats come
from the room task-tables. On top of them run two passes — connectors are EARNED by detecting real
structure in the week, never sprinkled at random, so a bond only ever moves at a moment you can point to
on the page:
- **Repeat-detector → REACTION (bond signed by the REACTOR, not the table).** Trigger: an activity/room
  done twice in the week. But the repeat is only the prompt — what happens is decided by whoever finds it,
  so the SIGN of the bond change is a property of the reactor's trait, not the table. Same "dishes in the
  library again" reads three ways: `sharp-tongued` → a telling-off (bond −); `forgiving`/`patient` → cleared
  without a word (bond neutral/+, a grace note); `proud` → says nothing, remembers it (bond −, quiet).
  "Friction" was the wrong name — forgiveness is a reaction too, which is why the table needs positive
  traits (`forgiving`, `patient`, `soft-hearted`) as much as prickly ones.
  - **COMPOSE, do not grid.** Keying on activity × doer-trait × reactor-trait as a table is thousands of
    cells nobody writes. Instead compose one sentence from three small fragment sets: the ACTIVITY gives
    the *what* ("the dishes turned up in the library again"), the DOER's trait gives the *why*
    (`slovenly` → left them; `idle` → never got to them; `green` → didn't know better), the REACTOR's
    trait gives the *reaction* + the bond delta. O(activities)+O(traits) fragments, dozens not thousands,
    and it still reads specific because the activity is real.
- **Co-occurrence-detector → CONNECTION (bond UP).** Trigger: two henchmen landing in the same slice of
  life with no repeat — an unprompted shared moment. Trait-pair colours it (`cheerful`+`melancholy` → drew
  them out; `devout`+`devout` → kept the offices together). Warmth that isn't a reaction to a screw-up.
- Both emit a CONNECTOR: its own COMPLETE sentence inserted after the beats it links (never a fragment
  gluing them). Both are DETERMINISTIC (seeded from the turn) and RATE-LIMITED: prefer pairs whose bond is
  new/weak, cap connectors per week, so "they finished each other's sentences" stays an event, not wallpaper.

**Bonds — the cheap-robust relationship ledger (NOT a simulation).** Each henchman carries a `bonds` list:
`{ id, weight, note }` pointing at other henchmen. The two detectors WRITE it (friction −, warmth +). No
graph, no propagation, no inherited feuds — that version is aimless and expensive and is explicitly NOT
built. Bonds do two jobs only: feed the story, and pay off death.

**Death reads the ledger — "Remembered by."** When a henchman dies (KILL/illness → the stone, and the
existing `defenderGraveyard`), the epitaph reads their bond list: "Remembered by Aldith, who never forgave
him the salt." Mourning and grudges are the same ledger, read with a different verb — nothing invented at
death. HARD RULE: a death only lands if the life was legible first — the bond-building beats must be
VISIBLE in the weekly story for weeks before the stone, or "Remembered by" pays off a thread nobody
watched. The engine already produces that runway; keep those beats surfaced, not buried.

**Build order (matters — retrofitting rewrites the generator).** 1) henchman record gains `traits` +
`bonds` at creation; 2) the generator (beats + friction + bond-writing); 3) death path reads bonds into
the stone; 4) LAST, tear out the per-chore timer so nothing breaks mid-flight.

**Content dependency (same as the other two parked items).** The engine ships reading "one of the
household" and a starter trait/friction table in-voice; it gets genuinely good once the per-facility
household staff and the trait/friction tables are authored. Downstream of the 15 rooms, like the rest.

**OPEN DECISIONS (lock before laying track).** (a) SETTLED: three distinct traits per henchman;
(b) bonds as structured `{id,weight,note}` [proposed] vs. simpler; (c) away = full / home = trimmed [proposed].

### Housing layer — staff must be HOUSED or they commute (SHARED WITH THE TOWN FORM) — BUILT 19 Jul

Staffing gains a spatial cost, which is the whole point: it makes housing a real bastion decision instead
of free. IMPORTANT — this is the SAME mechanic as the town form's "buy bedrooms for villager houses."
One bed-capacity substrate sits under both features; whoever builds either one is building this. Build it
once, well.

- **Beds come from BEDROOMS ONLY.** A workspace is a workspace — a forge is not a bunk. (If a player
  groups rooms against a facility on their map, that's cosmetic and NOT modelled.)
- **A bedroom's bed count scales with SIZE:** cramped [2] · roomy [4] · vast [6] — TUNABLE starter
  numbers, Frank's to set. Minimum cramped is fine; enlarging a bedroom is how you add beds.
- **Capacity = Σ beds across all bedrooms. Heads = all household henchmen.** heads > beds → the overflow
  COMMUTE. Who commutes is DETERMINISTIC (stable fill order by hire/id) so it never reshuffles reload to
  reload.
- **Commute cost is SOFT, not a cap (Frank's ruling):** a commuter gets a morning ARRIVAL beat and loses
  their first chore slot to the road (a shorter chore day). You CAN run commuters indefinitely; the story
  just fills with arrivals. An under-housed keep READS under-housed — no scold popup, ever.
- **Narrative shape changes to TWO paragraphs per day (Frank):** MORNING (housed staff wake in the keep;
  commuters arrive, each an arrival beat) then CHORES (the day's beats; commuters start one slot late).
  This is *more* homecoming to read, which is the goal.

GUARDRAIL (same line as bonds): a CAPACITY CHECK, not a simulation. Beds vs. heads, an arrival beat, a
shorter day — full stop. No travel distance, no weather delays, no housing-quality morale. Cheap and
legible does the entire job.
