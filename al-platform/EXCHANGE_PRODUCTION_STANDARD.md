# THE DEEP GROUNDS EXCHANGE — PRODUCTION STANDARD
### The working rules for the platform, as actually used
*The third document. The **Codex** is doctrine. The **Production Directive** is the standard for
remaster DOCUMENTS. This is the standard for the SOFTWARE, and it has never existed as a file —
it lived in a chat window and in the source's own comments.*

**Maintainer:** Frank Pettingill · The Deep Grounds Adventuring Company
**Keyed to:** ALPG v2026.4 · ALDMG v2026.2 · ALAG · 2024 DMG · SRD 5.2 (CC-BY-4.0)
**Companion to:** `HANDOFF.md` (current state + history) · `REFACTOR.md` · `FACILITY_SPEC.md`

---

## 0 · HOW TO USE THIS DOCUMENT

1. Drop this file **and** `HANDOFF.md` into a new session before any work begins.
2. The Directive and the Codex govern the **remaster**. This governs the **app**. They share the DNA
   in §1 and diverge everywhere below it.
3. **Every rule here was learned by getting it wrong.** The failure that produced each one is
   recorded with it, on purpose — a rule without its scar is a rule somebody re-derives the hard way.

---

## 1 · CORE WORKING PRINCIPLES
*Shared with the Directive. Same DNA, different artifact.*

1. **Literal AL compliance.** The stack admits no "spirit of the rules" discretion: ALAG → ALDMG →
   ALPG → adventure text.
2. **Document every judgment call with its authority layer.** See §3.
3. **Sourcing precision.** Accurate provenance over smoothed assumptions. **Verify load-bearing
   numbers against the source, never from memory.**
4. **Flag, don't smooth.** Honest review over agreement.
5. **Integrate corrections as permanent calibration.**
6. **Produce actual deliverables.** Never describe-without-rendering. **Present files after building
   them** — a file the maintainer cannot open did not get built.
7. **Confirm approach before long work.** Phased, with gates.
8. **The Company frame is in-fiction; the compliance stack is literal.**

**And one the Directive does not need:**

9. **Measure. Never guess. And say what it scales with.** See §5. This is the one that cost the most.

---

## 2 · THE ARTIFACT IS SOFTWARE, WHICH CHANGES THINGS

| the remaster | the app |
|---|---|
| a PDF is right or wrong on the page | a bug is invisible until somebody runs it |
| WeasyPrint tells you it crashed | **esbuild green means nothing** |
| a reviewer reads it | **a test suite is the only reader that never gets bored** |
| the deliverable is the document | the deliverable is the document **and** the thing that proves it |

**esbuild has compiled, without complaint:** undefined references, TDZ violations, duplicate
declarations, a magic item table rendered straight to a player, a Wizards trademark in a pub tap,
every DMG sentence we ever pasted, and a misspelled action that returned an unchanged state silently
for an hour.

> **The build is not the gate. The suite is the gate. Run it more than once.**

---

## 3 · THE FOUR DRIVERS (§7 — every deviation carries its reason)

There is a header block in the source naming exactly four. **Nothing changed because somebody
preferred it.**

- **[COPYRIGHT]** — we could not ship it, so we wrote our own.
  Rules are free: **17 U.S.C. §102(b)** — *"in no case does copyright protection extend to any idea,
  procedure, process, system, method of operation."* Seven-day turns, 6d6-each-1-kills, 4/16/36
  squares, a d100 and a list: nobody owns any of it.
  **Tables are not free.** A table is a **compilation**, and creative selection and arrangement is
  protectable (*Feist v. Rural*, 1991). That there are 29 facilities, that they are THOSE 29 with
  THOSE stats, that *Potion of Healing* gets 09–28 of Relics—Common while *Ear Horn* gets 01–08 —
  none of that is a fact about the world.
  **The Bastions chapter is NOT in SRD 5.2** (verified 16 Jul against dndbeyond.com/srd: its Magic
  Items section is Categories / Rarity / Activating / The Next Dawn / Cursed / Resilience / Crafting
  / Sentient / Magic Items A–Z — the items and the categories, **no random tables at all**). So there
  is no CC-BY cover, and a commercial product with a free tier has no Fan Content cover either:
  *"One word: F-R-E-E… May I sell my Fan Content? No."*

- **[TRADEMARK]** — we could not use the NAME. Faster-moving and more readily enforced than
  copyright, and the Fan Content Policy names it: *"Don't use Wizards' logos and trademarks."*
  **SRD 5.2 renamed the Deck of Many Things to the "Mysterious Deck"** — which tells you Wizards
  freely gave away the MECHANIC and kept the NAME.
  **The nominative-fair-use trap:** a nickname that successfully EVOKES a mark is *more* exposed, not
  less — trademark's test is likelihood of confusion, and working IS the infringement. *"The Mad
  Mage"* is not a way round *"Bigby"*; it is Halaster, and a WotC product title. **Allusion to
  nothing** is the safe pattern.

- **[TABLE]** — the books are written for a home game. This is organized play.
  **The single biggest driver — 20 of 26 deviations — and the whole reason the app exists.**
  The DMG says *"the DM rolls once on the Bastion Events table."* **That is a home-game sentence.**
  An AL DM has four hours, six players and a module to run and will never roll bastion events for six
  keeps. **That gap IS the product.**
  And AL agrees, in the ALPG's own words: *"DMs adjudicate rolls, otherwise **you log all other
  Bastion turns before the session or event**."*

- **[EVIDENCE]** — the book's number was measured and found to produce something else. Figures
  printed at the line; primary sources named.

**Distribution as built: TABLE 20 · EVIDENCE 5 · COPYRIGHT 3.**

> **Three quarters of every deviation exists because the books assume a DM with time. That is not a
> legal story. That is the pitch.**

> *"If you find a change with no reason attached, that is a bug in the documentation."*

---

## 4 · THE IP POSITION, PLAINLY

**The reasoning that is right, and the reasoning that is a comfortable lie:**

| claim | verdict |
|---|---|
| *"You cannot copyright rules"* | **True**, §102(b), and it protects every mechanic in the app. |
| *"So the table is fine"* | **No.** The table is a compilation. *Tetris Holding v. Xio* (2012): Xio argued exactly this, the court **agreed about the rules and ruled against them anyway**, because what they took was expression. |
| *"It's hidden in the code, so I'm not reproducing it"* | **No.** Reproduction is the COPYING, not the SHOWING. The rows are a copy the moment they are in the file. |
| *"I modified it significantly, so it's fair use"* | **No.** That is §106(2), the **derivative works right** — the thing you need permission to do. Fair use is a four-factor defence a judge applies, not a property a file acquires. |
| *"It's a parody / transformative"* | **No.** *Campbell* (1994): a parody must **comment on the thing it copies**; your app SERVES the DMG. And *Warhol v. Goldsmith* (2023) narrowed "transformative" hard: **same purpose + commercial = factor one against you**, even when the work is unrecognisable. Your purpose and the table's purpose are identical: run bastion play. |

**What actually protects the build, and what changes:**
- The owner supplied the books.
- **The tables are used, never shown** — structurally enforced, and the enforcement is *proven* by
  leaking one and watching the scanner name the file and line.
- **This is a commercial product with a free tier.** That removes the Fan Content cover entirely.

**The legitimate alternative, if it is ever needed:** derive tables from **SRD 5.2's CC-BY item list**
with the Exchange's **own weightings**, labelled as ours. **SRD 5.1 (2014 items) and SRD 5.2 (2024)
are both CC-BY-4.0** — two pools, both free, both commercial-safe with attribution. They have
different wording and different mechanics for overlapping items, so a `srdVersion` field belongs next
to the existing `srd: true` flag.

**The OGL does not help.** It licenses SRD 5.1 (the 2014 rules). **Bastions are a 2024 feature and
were never in it.** And for anything in both, **CC-BY-4.0 is strictly better** — irrevocable, which is
the entire point of what happened in January 2023.

**This is a lawyer question, not a Claude question.** Roll20 and Fantasy Grounds sell D&D content
under **licences**, not policies. (D&D Beyond is not a licensee — Wizards bought it.) The opening
here is unusual: **infrastructure for Wizards' own organized play program**, from a certified AL DM
with a SCALE group and 1,820 assertions of literal compliance. That is a vendor demo, not a fan
asking a favour.

---

## 5 · MEASUREMENT (§4)

> **Know your budget. Measure. Never guess.**
> **And a number measured on the wrong axis is worse than no number, because it ends the argument.**

**The instrument is `harness/scale_fixture.cjs`.** It builds a platform at N and times the real
reducer. `--axes` varies each axis independently and pins the rest. **A fixture that varies one axis
can only find bugs on that axis.**

**Three times in one day, a figure was true, precisely measured, and measuring nothing:**

| the number | why it was worthless |
|---|---|
| `0.44 ms/action` | measured against a **41 KB demo seed**. Reported daily for a week. |
| `adventureDemand: 3.9 ms, fine` | measured at 300 **characters**. It scales with **accounts** — 1,130 ms at 20,000. **Used to tell an outside reviewer they were wrong. They were right.** |
| `flat at 10,000` | measured on the one action that **does not write a log line**. Actions that do were **306 ms**. |

**The rule that follows:** state what a thing scales with **before** stating a figure for it.

**Performance is an ACCESS question.** A heavy bundle does not annoy everyone equally — it excludes
people on old phones and bad connections, which in an AL context is a real share of the actual
players. **§9 prints the bundle budget every run and will keep saying it until it is met.**

**A target must be failable.** *"2 seconds to interactive on slow 3G"* can be failed. *"As small as
possible"* has no floor and justifies everything.

---

## 6 · TESTING (§8)

**Assert BOUNDS, not observations. Assert the LEDGER, not the balance.**

Every one of these flaked before it was learned:
- `lo === 400` on a 1/1296 event — misses 2% of runs
- pinning exact gold through a live reroll
- **a length floor of 20 that called `"The line breaks."` (16 chars) a bug.** It is the best line in
  the siege and it lands *because* it is short
- asserting a charge that a frozen keep cannot make

**Probe before you assert.** A test written from an assumption tests the assumption. In one afternoon,
probing corrected the author four times:
- `SIGNUP_SESSION` refuses an event slot with no DM. **Correct, and I would have asserted it
  backwards.**
- `mod.bans[acct]` is a date **string**, not an object. My probe "found a bug" that was my own shape.
- A blocked message **bounces** into the sender's own thread rather than failing. **A better design
  than the one I was about to enshrine.**
- `ENLARGE_BASTION_FACILITY` — I dispatched `ENLARGE_FACILITY`, watched six runs fail, and blamed the
  app.

**Mutation-test the guards.** An assertion that cannot fail is decoration. Break the rule, watch the
test name it, put it back. Done for: the verbatim scanner, the trademark guard, the display guard,
the block check.

**Invariants over unit tests, where the rules interlock.** `stateViolations(s)` runs after all 334
hostile fuzz dispatches — and checks the state the reducer was **given** as well as the one it
returned, because a reducer that mutates its input has corrupted history silently.

> **Eight of the week's eight real bugs were caught by invariants. None of them threw. None failed a
> test that existed.**

---

## 7 · CODE STANDARDS (§3, §5, §6, §9)

**§3 — one case, one thing.** The reducer is 167 cases; the ceiling that has held is ~56 lines and
the average is 13. `TAKE_BASTION_TURN` hit 88 doing five jobs and became five named functions and a
16-line coordinator. **They always grow a line at a time.**

**§5 — make the wrong thing unwritable.** A rule you have to remember is a rule you will forget:
- **the verbatim scanner** — walks every string the app shows a player, fails if it appears in the
  DMG chapter
- **the trademark guard** — 33 Wizards-owned names
- **the display guard** — no magic item table may be iterated for rendering
- **whitelists, derived not listed.** Every hand-maintained list in this file has waved through the
  exact thing it existed to catch. `KNOWN_ACTIONS` is parsed from `reducerImpl.toString()`. The
  display guard parses `MAGIC_TABLES` for its own list. **`ARCANA` was added and the guard sailed
  past a leak of it, because the list was written by hand.**

**§5 — unknown states fail SHUT.** `happeningLock` returned the raw string and defaulted to `"none"`,
so a happening with a lock the app could not read froze **nothing** — a siege that misspelled its own
lock left the gate open, silently, **and a test guaranteed it**, with a comment explaining why:
*"never guess a restriction."* That is right for a **question** and exactly backwards for a **lock**.
The default is not symmetric.

**§6 — dead code is dead.** And **the check had a hole**: it counted a harness reference as a use, so
**writing a test for a dead function made it look alive.** Every "dead: 0" for a week came through
it, hiding 15 names. It now splits **DEAD** (delete) from **PENDING** (content waiting on a view,
named explicitly).

**§9 — the audit.** `node harness/dead_check.cjs`: authorship 0, debug 0, DEAD 0, the bundle budget.
**No `Frank` in third person. No `I` narrator that is not the maintainer's voice.** The file is his.

**A scanner must read code, not prose.** Two source scanners failed on their own documentation —
the comment above `useNow` quotes `const [now, setNow]` to explain the old code, and a naive grep
found the explanation and called it the bug. **Strip comments first.**

---

## 8 · THE ARCHITECTURE, AND THE REASONS THAT ARE NOT OBVIOUS

- **GENERATED DATA IS A DATA FILE. REASONED DATA IS SOURCE.** (ruled 1 Aug, after Frank asked why the
  monolith-to-modules refactor left the tables as TypeScript.) The split looked arbitrary because
  nobody had written it down: SRD material is JSON (`spells.json`, `mundane_gear.json`) and authored
  content is `.ts`.

  **The rule that actually governs it:** if a table is produced by a generator from an external
  source, it is a data file and may be regenerated at will. **If a table carries the REASONING for
  its own values, it is source, and moving it to JSON or SQLite destroys the thing that makes it
  worth having.** Measured on 1 Aug:

  ```
  bastion.ts           3,020 lines   959 comment   31%
  library_subjects.ts  4,021 lines   674 comment   16%
  registry.ts          1,774 lines   248 comment   13%

  embedded: 30 DMG citations · 7 ALPG · 12 `cited-3e` provenance markers · 55 recorded rulings
  ```

  Nearly a third of `bastion.ts` is reasoning, and it is load-bearing rather than decorative: the
  Chult row says why it is `cited-3e` and what the earlier guess got wrong; the Underdark row carries
  the escapee ruling; `MORALE_CAMPED_WEEKLY` explains why the rates are asymmetric and what broke
  when they were not. **JSON has no comments and neither does a SQLite row.** A migration either
  strips all of it or exiles it to a document that goes stale — which is the exact failure the
  backlog demonstrated three separate times on 31 Jul.

  **The practical split:**

  | | |
  |---|---|
  | **may move to a data file** | pure lists with no per-row reasoning — names, patrol lines, arrival beats |
  | **stays source** | anything carrying a citation, a provenance tag, or a ruling |

  **And a rule about WHEN.** The app is client-only; there is no server wired to `src/`, so a table
  moved to JSON today is a table Vite bundles anyway — the same megabyte with less type safety.
  **Move content when there is something to serve it from, not before.** The tables are already
  row-shaped (`nameRows()` emits `(culture, kind, value)`; `SPECIES_BY_REGION` is
  `(region, species, weight)`), so the migration is a copy whenever it happens.

  **What SQLite is actually for, since this keeps being misremembered:** `server/schema.sql` holds
  eleven tables and every one is MUTABLE STATE — accounts, characters, items, log_entries,
  organizations, org_members, stores, sessions, notices, rollups, meta. **No content table, and
  `src/` does not import from `server/` at all.** The SQLite work was the ledger architecture proven
  to a million characters; content was never in its scope.

- **The draft is a lazy Proxy, not `structuredClone`.** Shallow at the top; each RECORD clones on
  first touch. **The bucket matters and getting it wrong is silent** — `logEntries` was in the
  "one big value" bucket for a morning, so any action writing a log line deep-cloned 200,000 entries.
  **The ledger is the biggest collection in the product BY DESIGN.**
- **`Object.values(s.characters)` clones every character, and that is correct.** An action that
  iterates the population IS reading it. The cheap path only helps actions that NAME what they want.
- **The 1-Hz `RESOLVE` dispatch stays at the root.** It lived in `BastionView` once; React unmounted
  it on a tab change and **a siege you were not watching resolved in a single frame** — twenty
  minutes of story gone, nine people dead between renders. It costs 0.007 ms because `anyDue` returns
  the same state and never clones. **The tick was never the problem. `setNow` was.**
- **The action union is 167 NAMES, not 167 payloads.** A payload union rots the first time somebody
  adds a field, and then it lies and everyone learns to cast around it. **The proven bug is the
  name.** Belt and braces: the union for the compiler, a runtime throw for every environment that
  actually runs.
- **`t.flavor` IS the bastion log** and always was — rendered in three places since week one. Do not
  build a second one. *(Somebody did. It took the maintainer saying "the bastion log" like it was a
  thing that existed, because it was.)*

---

## 9 · WRITING (the house voice, for the app)

**Two axes that LAYER, never multiply.** 17 regions × 13 events × 12 rows is 2,652 strings, and
**2,652 mediocre lines are worse than 300 good ones.**

- **`BASTION_SLICE_OF_LIFE` is keyed by FORM** — a quiet week is about the HOUSE.
- **`EVENT_CAST` is keyed by REGION** — who is at the gate is about the COUNTRY.
- Where they meet, **region wins**: it is about the visitor, not the door.
- **Sparse overrides.** `slot@form`, `event@region`. Write the default once; override where the
  house actually changes the answer. **A forge is a forge in a cavern and on a ship. A bed is not.**

**The recurring failure, caught three times by the maintainer:**

> **Nouns come from the setting; SHAPE comes from whatever was built last.**

- Chult came out as **England with palm trees** — wrestling, a fortune-teller, a monkey instead of a
  bear. Every noun changed and the structure did not. **It is a CARNIVAL**: a procession, competing
  bands, the drums are the structure, the masks are the point, it stops all at once. The tell was
  that it read *fine*.
- Avernus needed **Rakdos and Wishmaster** — the performance IS the murder; you get precisely what
  you asked for.
- The Feywild needed to **take people** — Tam Lin, Thomas the Rhymer, Goblin Market. **Nobody is
  taken by force. They are asked nicely by something beautiful and they say yes.**

**Assert the voice.** `Chult is a procession, not a market` · `it is no longer a market fair with
palm trees` · `no country that is not Hell talks about Hell` · `no country ever says another
country's line` (which caught the author reusing a closer across all eight aid tables).

**No line the app shows a player may appear in the DMG.** 1,161 rows, zero leaks, scanner-enforced.

---

## 10 · STANDING RULINGS (the app's precedent log)

1. **The event system stays.** Settled, twice, permanently. The DMG's *"the DM rolls"* is a home-game
   sentence; the ALPG's *"you log all other Bastion turns before the session"* is the real rule.
2. **The weights are ours** because the trigger is ours. Derived from four historical sources.
3. **The tables are used, never shown.** *"Using them in code is allowed; presenting them wholesale
   to the player is not."* Structurally enforced.
4. **The weights are verbatim on purpose.** Scrambling was considered and rejected: **the band widths
   ARE the mechanic**, and a shuffled table stops producing what the book says it produces — an
   unlabelled rules deviation baked into the data, where no DM can audit it.
5. **Changing a room's stock is a day's work and costs the room its turn.** The construction rule
   applied consistently: *commission the work or use the room, never both.* **This overturned an
   assertion that read a silence as permission.**
6. **A village is not a form.** It is what a *combined bastion* already is — the DMG's own rule
   (*"hirelings can't be shared… Bastion Defenders are handled differently"*) **is a village**: your
   people are yours alone, but your dead are shared.
7. **The org declares the shared clock.** A shared world needs a shared calendar, not forty private
   ones.
8. **Renown would have been the right reward and AL retired it.** The gold is a stand-in for
   standing. If renown returns, that block is the first to revisit.
9. **SCALE has agreed to nothing.** The Exchange makes its own interpretive calls and owns them.
   **House rules are never passed off as a citation or as an org's policy.**

---

## 11 · WHAT IS BLOCKED ON A RULING, NOT A BUILD

| | |
|---|---|
| **Stable** | Trade: buys animals. **AL has no creature-purchase rule.** |
| **Guildhall** | Recruit: thieves steal a nonmagical object. **From whom?** |
| **Menagerie** | Recruit: buys creatures **by CR**. No CR price list exists in AL. |
| **War Room** | Recruit: musters **100 guards**. A Vast Barrack caps at 25. |
| **Q13** | How often can a facility be rebuilt? ALPG: any time. DMG: once per level-up. |
| **Warhorn** | `isALSystem` tests the CAMPAIGN name against the SYSTEM field. **One real export file answers it.** Not guessed at, on purpose. |

---

## 12 · REPRODUCTION CHECKLIST (day one on a new session)

1. Load `HANDOFF.md` **and this file**. Load the AL stack (ALPG/ALDMG/ALAG) and the DMG chapter.
2. Confirm the build: `npx esbuild al_exchange_prototype.tsx --outfile=/tmp/out.js` — **no `--loader`
   flag.**
3. Run the suite (11 files) **and** `dead_check.cjs` **and** `scale_fixture.cjs`. Note the numbers
   before touching anything.
4. Read `FACILITY_SPEC.md` for the honest split — **2 DATA · 1 DATA+ · 5 CHARM · 4 RULING · 3 BUILD.**
   It said *"they are data"* until 17 Jul and that was a guess.
5. Copy the pattern, do not invent one: **the Pub and Archive** for facility contents; **the Trophy
   Room** for *the app rolls, the player names it, the DM checks.*
6. Any new number: measure it, and say what it scales with.
7. Any new deviation: label it with one of the four drivers, at the line.

---

## 13 · WORKING METHOD

- **Confirm before long work; then build the file and present it.** Never describe instead of doing.
- **Verify load-bearing numbers against the source**, not from memory. *(A memory-built adventure
  catalogue was presented as source-extracted once. It was missing the epics, the hardcovers and the
  WBW modules.)*
- **Flag, don't smooth.** The maintainer's corrections are direct and are permanent calibration.
- **A settled decision is settled.** Reopening one is not a disagreement, it is not listening. *(The
  event system was reopened three times. It cost an afternoon and the maintainer's patience, and the
  argument for keeping it was in the ALPG the whole time.)*
- **When scope is clear, execute.** Do not ask what has already been answered.
- **Deliver, do not describe.** Present files after rendering.
- **Own errors without collapsing.** Say what was wrong, fix it, keep the standard.

---

*End of Standard. Companion to `HANDOFF.md`. The Codex governs doctrine; the Directive governs
remaster documents; this governs the software. Revise as new standing rulings are codified.*

## §9 · THE LORE AUTHORITY HIERARCHY (Frank, 2 Aug)

> *"We always work in a hierarchy. The base authoritative source is 5e-5.5e, but where it is silent
> or where it is vague we dig deeper into 3e, 2e, 1e to fill those gaps. As a 2e guy I appreciate 2e
> content a lot, but it is good to pull from all references to fill gaps."*

**This governs every lore decision in the platform**, the same way ALPG > DMG > house governs every
rules decision. It is the same shape and it is not the same list, so it is written separately.

```
1 · 5e / 5.5e      AUTHORITATIVE. Where it speaks, it wins outright.
2 · 3e             where 5e is silent or vague
3 · 2e             where 3e is also silent — and 2e is the deepest well the Realms has
4 · 1e             last resort, and often the origin of a thing 2e merely restated
5 · Exchange house LABELLED AS SUCH, always. Never dressed as canon.
```

**"Silent or vague" is doing real work in that sentence.** 5e is deliberately sparse about a great
deal — it describes Chult's Port Nyanzaru at length and says almost nothing about Mezro's barae,
which 2e detailed exhaustively. Going to 2e THERE is filling a gap. Going to 2e where 5e has
*revised* something is overriding the authority, and is wrong.

### What this means for what is already written

The demographic tables carry a `SPECIES_SOURCE` provenance per region, and **ten of them are marked
`cited-3e`**: waterdeep, silvermarches, cormyr, dalelands, heartlands, moonsea, swordcoast,
neverwinter, dessarin, chult. Those were extracted from the 3e *Forgotten Realms Campaign Setting*,
which publishes population breakdowns that 5e simply does not.

**Under this hierarchy that is CORRECT and not a defect** — 5e is silent on regional demographics, so
3e is the right well. It is worth recording explicitly, because "3e-sourced" looks like a violation
of a 5e-first rule until you know 5e never spoke.

**Where it WOULD be a defect:** any place 5e states a figure and a 3e table disagrees. None found so
far; the check is worth running whenever a region is revisited.

### And for the species and regional flavour tables

Same rule, and it has already bitten once: the first pass at the species lines was generic fantasy
with no edition behind it at all, which is not a hierarchy failure but an absence of sourcing
entirely. Every regional overlay written since is grounded in a named source, and the gate asserts
that the canon is present in the text.

## §10 · NAMING IS NOT REPRODUCING (Frank, 2 Aug)

Raised over `BUCKET_RESOLVES`, which names eight peoples that are not SRD-licensed — Boggle,
Darkling, Meenlock, Korred, Merregon, Abishai, Amnizu, Orthon.

> *"They are safe to name because we are not reproducing them or any of their presentation."*

**That is the line, and it is the same one §9 already implies.** What the Exchange must not do is
reproduce somebody else's expression. A creature's NAME is not their expression; the stat block, the
ability scores, the challenge rating, the art and the descriptive prose are.

Checked against what the platform actually holds for a boggle:

```
species name   Boggle
role reason    "small, quick, greasy, and perfectly able to hold a thing"   <- written here
voice          inherited from Other Fey                                     <- written here
biology        lifespan, dimorphism, working years                          <- derived here

no stat block · no ability scores · no CR · no art · no descriptive text
```

**A name and the Exchange's own writing about somebody with that name.** Nothing lifted.

### The test to apply going forward

> Could a reader reconstruct the published entry from what we hold? If no, the name is a reference.
> If yes, it is a reproduction, whatever it is called.

This is why the demographic tables can say *"Duergar 1%"* and why a household can employ a Korred —
and equally why the FACILITY tables quote the DMG's own wording only where a rule is being cited
rather than copied, and why `SPECIES_SOURCE` labels house content as the Exchange's own instead of
letting it pass as canon.

**It also settles the direction of travel for the remaining unbuilt work.** After Dark's simulated
combat would need real stat blocks; that is reproduction, and it is one of the several reasons that
feature lives outside the AL-legal side.


