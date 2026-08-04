# The Historical Chronicle & Canonical World Timeline

**Status: parked. Not built. Not started.**
Captured 17 July 2026, in the owner's words, verbatim. Engineering notes are separate and marked.

> **COMMITTED TO THE REPO 1 Aug 2026.** This document had lived OUTSIDE version control since 17 Jul
> — not in the repo, not on disk, not in origin. It was searched for during the 1 Aug session
> (`chronicle`, `journey`, `travel time`, `navigation`) and could not be found, and a lesser
> duplicate of part of its subject matter was written into `IDEAS.md` before the owner produced the
> original. **A design document outside the repo is a design document that will be rebuilt badly by
> somebody who could not find it.** Nothing below has been edited.

---

## The concept, as written

> ### Historical Chronicle & Canonical World Timeline
>
> The Historical Chronicle transforms a character's Adventure League play history into a coherent,
> canonical biography by organizing adventures according to their official Forgotten Realms
> chronology rather than the order in which they were played. Every completed adventure remains
> permanently recorded in the player's play history, but only adventures that fit a logical
> progression of canonical dates and character tier are incorporated into the Character Chronicle.
> Adventures with official dates are anchored to their canonical positions in the timeline, while
> adventures without established dates are treated as "floating" entries and inserted wherever they
> fit naturally within the character's progression. This preserves Adventure League's flexible play
> order while creating a believable life story that writers, organizers, and players can follow. Once
> a character establishes a Bastion, the Bastion inherits the Chronicle's timeline, and every
> chronologically valid adventure thereafter becomes part of both the character's history and the
> estate's living history.
>
> Each official adventure is enriched with historical metadata describing its place within the
> Forgotten Realms. This metadata includes information such as its canonical date, affected regions,
> geographic scope, participating factions, severity, historical tags, civilian and economic impacts,
> refugee potential, trade disruptions, military activity, magical disturbances, and whether the
> adventure is capable of generating a Call to Service. Rather than simply recommending adventures,
> this metadata allows the platform to model how the events of published adventures ripple across the
> world. As Bastion time advances, the simulation continuously compares the Bastion's location and
> current date against this historical dataset. When a matching historical event is active, the
> metadata dynamically expands existing Bastion events instead of replacing them. Refugees arrive
> because a nearby settlement has fallen, merchants discuss recent military movements, festivals
> become subdued during wartime, travelers spread rumors of strange happenings, prices fluctuate due
> to disrupted trade, and ordinary life gradually reflects the changing state of the world. These
> contextual narrative expansions require no changes to the underlying Bastion mechanics, allowing
> the estate to experience the consequences of official adventures even when the character never
> personally participated in them.
>
> When the chronology reaches an adventure that affects the character's region and the character is
> legally eligible to participate based on tier and historical progression, the historical metadata
> can elevate ordinary world events into a Call to Service. Because the Bastion has already spent
> weeks or months experiencing the consequences of the unfolding crisis through its normal events,
> the Call to Service becomes the natural culmination of an evolving story rather than an isolated
> notification. Retired characters may choose to answer the call and temporarily return to active
> adventuring, while those who decline simply continue experiencing the world's changing history
> through their Bastion. The result is a living historical simulation in which published Adventure
> League adventures become shared historical events that influence every character and estate within
> the Forgotten Realms, creating a continuous, canonically grounded world that players inhabit rather
> than simply visit. Most importantly, the resulting Chronicle becomes a historically accurate primary
> source for future authors, allowing licensed characters, Bastions, and their accumulated histories
> to be faithfully incorporated into novels, adventures, campaign settings, and other creative works
> with confidence that their lives are grounded in the official chronology of the Realms.

---

## Engineering notes — mine, not the owner's

### What already exists that this attaches to

Measured against the file, 17 Jul. More than I expected:

| exists | what it gives the Chronicle |
|---|---|
| `ADVENTURES` — **250 entries** | the spine. `{ id, label, tier, levels, summary, setting }` |
| `logEntries[].adventureId` | the play history, already recorded, already DM-reviewed |
| `logEntries[].date` | when it was *played* — the Chronicle needs when it *happened* |
| `bastion.region` (17 regions) | "affected regions" already has a vocabulary to match against |
| `REGION_WEIGHTS` | "festivals become subdued during wartime" is `{ opportunity: ×0.5 }` |
| `EVENT_CAST` (56 tables) | "refugees arrive because a settlement has fallen" is a cast override |
| `pendingCall` + `ANSWER_CALL` | **the Call to Service already exists.** Bram's summons is one. |
| `bastion.turns[].date` | the Bastion already advances on a clock with dates on it |

**The Call to Service is not a new feature.** It is `pendingCall` with a different `kind`, and the
third door — *send them in your stead* — already works. A retired hero answering a historical call is
`UNRETIRE_CHARACTER`, which is built, guarded and tested.

### What it needs that does not exist

**One thing, and it is the whole project: the metadata.**

`ADVENTURES` carries `tier` for all 250 and `season` for none. The Chronicle wants, per adventure:

```
canonDate · affectedRegions · geographicScope · factions · severity · tags
civilianImpact · economicImpact · refugeePotential · tradeDisruption
militaryActivity · magicalDisturbance · generatesCallToService
```

**That is ~13 fields × 250 adventures = ~3,250 data points.** None of it is code. It is a research
project with a schema attached, and it is the single largest piece of authorship in the platform —
larger than the 1,161 rows of bastion prose by a factor of three.

### The problems, in the order they will bite

1. **Canonical dates are not a solved dataset.** AL adventures frequently do not state a year, and
   the Realms timeline is itself contested between sources. The "floating entry" mechanic in the
   concept is the right answer to that and should be understood as load-bearing rather than a
   convenience: most adventures will float.

2. **The metadata is the product and the product is a book.** Whoever fills this in is writing a
   Realms chronology. That is a genuine contribution and it is also the thing that makes the feature
   unfundable as a side task. It cannot be crowdsourced without an editorial standard, and an
   editorial standard is a document that does not exist yet.

3. **"Legally eligible based on tier"** is the easy part — the ALPG's tier rules are already
   implemented and `facQualifies` does exactly this shape of check.

4. **This is a licensing question before it is a code question.** The concept's own last sentence —
   *"a historically accurate primary source for future authors, allowing licensed characters,
   Bastions, and their accumulated histories to be faithfully incorporated into novels"* — describes
   a product that sits on top of Wizards' chronology and feeds Wizards' IP. See the `[COPYRIGHT]`
   block in `al_exchange_prototype.tsx`. A list of 250 adventures with dates and regions attached is
   a **compilation** in exactly the sense Feist means, and it is a compilation *of their work*.

### The part worth saying out loud

**The last sentence is the thesis and the rest is the mechanism.**

Everything before it describes a nice feature: your keep hears about the war before the war reaches
you. That is good and it is not new — *Crusader Kings* does it, *Pendragon* does it, and a good DM
does it for free.

The last sentence describes something else: **a Chronicle that is citable.** A character's life as a
primary source that a licensed author can build on, because the platform guarantees it is
chronologically sound. That is not a bastion feature. That is the argument for why organized play
should have infrastructure at all, and it is the same argument as the module remaster, the DM tools
and the provenance chain — **the Exchange is a system of record, and a system of record's value is
that other people can trust it.**

If this gets built, build the last sentence first and let the mechanism follow from it. The
"festivals become subdued during wartime" part is charming and will take a week. The "this is a
primary source" part is the reason anyone would care, and it is a standards problem, not a
programming one.

### What it would cost, honestly

| | |
|---|---|
| the mechanism (metadata → event expansion → Call to Service) | **small.** The regions, the casts, the calls and the clock all exist. This is `REGION_WEIGHTS` with a date range on it. |
| the metadata for 250 adventures | **the whole thing.** Months, and it is writing, not coding. |
| the editorial standard that makes the metadata trustworthy | **the actual product**, and it does not exist. |

---

## Related, already in the file

- `REGION_WEIGHTS` — a season at war is `{ raiders: ×2, attack: ×2, standoff: ×1.5 }` and nothing
  else changes. The concept's "festivals become subdued during wartime" is one multiplier.
- `EVENT_CAST` — 56 tables, 672 rows, already keyed `event@region`. A historical override would key
  `event@region@era` and fall through the same way.
- `pendingCall` / `CALL_KINDS` — the Call to Service is a fourth kind.
- `SET_BASTION_REGION` — the keep already knows where it stands, which is half of "compares the
  Bastion's location against this historical dataset".

## Related, elsewhere in the project

- The **module remaster** (DDEX1-1A etc.) is already producing the per-adventure scholarship this
  would need. If the remaster recorded canonical dates and affected regions as it went, the Chronicle
  metadata would accumulate as a *side effect* of work already happening.
  **That is probably the answer to the funding problem and it should be considered before either
  project gets much further.**

---

## The clock — solved, 17 Jul. Not built.

The owner's answer, and it needs **no new clock at all**: the turns *are* the calendar.

```
bastion.foundedDR = the canonical date of the adventure whose log entry took the
                    character to builtAtLevel — the one that earned them the estate
daysElapsed       = turns.length × 7        (ALPG: "one Bastion turn (taking 7 days)")
today, in DR      = harptos(foundedDR + daysElapsed)
```

`builtAtLevel` and `turns.length` are **already on every keep**. This is one new field and one pure
function. A Maintain turn is still seven days — away or home — so the counter never gaps.

### The Calendar of Harptos, verified 17 Jul (multiple sources agree)

365 days. Twelve months of thirty days = 360, plus **five festival days that fall BETWEEN the
months**. Three tendays to a month. Shieldmeet is a leap day after Midsummer, every fourth year.

```
  1- 30  Hammer          31  ✦ Midwinter
 32- 61  Alturiak
 62- 91  Ches
 92-121  Tarsakh        122  ✦ Greengrass
123-152  Mirtul
153-182  Kythorn
183-212  Flamerule      213  ✦ Midsummer  (+ Shieldmeet, every 4th year)
214-243  Eleasis
244-273  Eleint         274  ✦ Highharvestide
275-304  Marpenoth
305-334  Uktar          335  ✦ The Feast of the Moon
336-365  Nightal
```

### What the calendar hands you for free

**The Extraordinary Opportunity has a canonical home.** The five festival days ARE festivals. The
Realms already says when the fairs are, and the app currently rolls a 9-weight guess instead.

**But measure it before building it, because the obvious version is wrong.** A festival is ONE day
and a turn is SEVEN, so a turn *landing on* a festival happens about 1 year in 7 — in year one,
exactly one of 52 turns hits Highharvestide and the other four are missed entirely. That would make
the fair **rarer than the siege**.

The fix is that a turn is not a point, it is a **week**. A seven-day turn that CONTAINS Greengrass is
a turn where the fair happened — and at seven-day steps every festival falls inside some turn, every
year, exactly once. **Five guaranteed fairs a year, on the days the Realms says they are.** That is
better than a weight, and it is canon rather than a number somebody invented.

### The arithmetic that matters

- **52 turns = 364 days ≈ one Realms year.**
- At 10 DT a session (ALPG) and 7 DT a turn: ~1.4 turns a session.
- **≈ 37 sessions to age a keep ONE YEAR.** Two years of real play.

That is slow, and it is correct — but it means the seasons will barely move for most characters.
**Know this before building winter into the event weights.** A keep that takes three real years to
see one autumn does not need a seasonal table.

- 7 divides neither 365 nor 30 nor 10, so turns **drift** across the calendar. That is right: nobody's
  week lines up with the month.
- **1492 DR is a Shieldmeet year** (1504 minus three cycles). Shieldmeet is the day of *"honesty,
  plain speaking, and open council between rulers and their subjects."* A fair on Shieldmeet should
  be its own table, not a normal one.

### What still blocks it

The founding date needs the canonical date of one adventure — which is the metadata problem again.
**The fallback is the org declaring it**: SCALE says "keeps in this group were founded 1 Mirtul 1492,"
and every keep in the group shares a clock. That is one field, no research, and arguably more correct
for organized play than deriving it — **a shared world needs a shared calendar, not 40 private ones.**

---

## Update — 19 July 2026 (from the bastion undercarriage session)

`b.chronicle` is now actually WRITTEN: the construction-as-event ruling logs facility construction
start/finish to it ("⚒ Works" lines, interleaved by time in the turn log). So the chronicle tab this
document designs already has real data waiting the day it's built — construction works today, and the
household-week generator's stored `t.household` weeks are the obvious next source to fold in. The chronicle
SYSTEM itself remains unbuilt and is a future feature (owner confirmed 19 Jul it does not gate facilities).
It lands on two surfaces: the per-bastion chronicle tab, and the combined-zone shared calendar on the
common-space page (which belongs to neither bastion).

---

## Update — 1 August 2026 · THE FOUNDING DATE AND THE METADATA ARE BOTH RULED

**Both of this document's stated blockers are now answered by the owner.**

### 1 · The founding date — solved, and it needs no new research

> *"The bastion has a founding point. The founding point comes from the adventure that happened right
> before the character reached level five."* — Frank, 1 Aug

**On reaching level 5, the character is granted the estate**, and the grant is dated to the
**completion of their last tier-1 adventure**. The notification is in-fiction: *the people of such-
and-such region have noticed the strides you have made in protecting their lands, and have granted
you a right of residence* — a plot of land, a ship, whatever form the player then chooses at build.

This replaces the fallback this document proposed (the org declaring a shared founding date). It is
better, because it is **per character and earned** rather than administrative, and it makes the estate
a consequence of play rather than a purchase. It requires exactly one thing: that tier-1 adventures
carry dates. Which is §2.

`bastion.foundedDR` is still one new field and one pure function; only its *source* changed.

### 2 · The metadata — the owner is doing it, one adventure at a time

> *"I am going to spend 250 turns or so going through the modules one at a time and creating tags for
> every module... the module's date, the module's story beats, rumors that come out of it, the things
> that the chronicle will need in order to lay out its calendar."* — Frank, 1 Aug

**The plan: every published adventure, one at a time, systematically, producing a table** — date,
story beats, rumours, and the rest of the schema — **handed back at build time** so the Chronicle can
assign every date and event to the calendar from the earliest adventure to the current season.

This answers the "unfundable as a side task" problem in the only way it can be answered: by somebody
deciding to do it. **It also makes the module remaster note above less critical** — that was the
answer to funding the metadata as a byproduct, and the owner is funding it directly instead.

### 3 · ENGINEERING NOTE, and it is the one thing worth acting on BEFORE turn 1

**Do not author 250 adventures against an unconsumed schema.**

The schema in this document (~13 fields) was written 17 Jul by looking at what the *concept* asked
for. **Nothing has ever read it.** A schema that has never been consumed is a guess, and the failure
mode is specific and expensive: you complete 250 adventures, the Chronicle is built, and the fields
turn out to be the wrong shape — a date that needed a range, a region list that needed weights, a
"story beat" that needed to distinguish *what happened* from *what people say happened*. Then it is
250 adventures of rework.

**The cheap insurance is to build the consumer against a small sample first:**

1. **Author 8–12 adventures**, chosen to be awkward on purpose — one with a firm canon date, one with
   none (a "floating" entry), one spanning multiple regions, one that should generate a Call to
   Service, one whose events matter to a bastion that never played it.
2. **Build the Chronicle against those**, end to end: timeline assembly, floating-entry insertion,
   event expansion, the Call.
3. **Then author the remaining ~240** against a schema that something has actually eaten.

Steps 1–2 cost maybe a session. They convert the schema from a guess into a specification, and every
subsequent adventure is authored once. **This is the same lesson as the library corpus** — the
subject schema there survived 100 subjects because `LIBRARY_SUBJECTS` was consumed by a working
generator from subject one, and the four structural ledger gates were added the moment a defect class
appeared, not at the end.

**The corollary worth stating plainly:** the 250-adventure pass is the single largest piece of
authorship in the platform, larger than the library corpus by a factor of two and a half. It deserves
the same treatment the library got — a gate that checks each row structurally as it lands, so a
defect is caught at adventure 3 rather than at adventure 200.

---

## Update — 1 August 2026 (voyage/journey session)

Two things from the 1 Aug conversation attach here, and both are about the Chronicle as a **timeline**
rather than as canon metadata:

**1. The Chronicle carries journey time, and that is what makes After Dark cheap.** A call for aid must
resolve in one turn under ALPG, so the AL bastion charges nothing for distance — but the Chronicle
records the sail time, the march, the aid, and the march home. **After Dark converts that same
recorded number into turns** (7 days = 1 turn), which turns aid into a decision with a defensible
"no". The consequence: *the base system should compute journey time now even though it charges
nothing for it.* If it does, After Dark is arithmetic; if it waits, After Dark has to build a
geography engine first. See `IDEAS.md` §4.

**2. `HANDOFF_prev_session.md` §2 is the voyage/medium/region-graph design** and states the ordering
rule this document needs: *"the chronicle is the timeline: travel is appended BEFORE the calendar
assignment that fits the character into canon, kept ordered so the log is always canon-legal on its
face."* That is the same claim as this document's "floating entries" mechanic, arrived at from the
other end — and it means the two designs must be built with one ordering function, not two.

**Also recorded, because it is why this file was almost rebuilt from scratch:** this document lived
outside version control for two weeks. `HANDOFF_prev_session.md` holds a major design under a filename
meaning "superseded". Both should sit in the repo under names that say what they are — the same
graduation this file's own notes recommend for the After Dark material.
