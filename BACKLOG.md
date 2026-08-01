# BACKLOG — one queue

Replaces the forward-looking half of `OPEN_QUESTIONS.md`, the review Gates B/C/D, and the region
rulings that were floating in chat. **This is the only list.** If work isn't here, it isn't queued.

`OPEN_QUESTIONS.md` keeps only its *reference* content (structural notes, the fingerprint procedure,
what the sweeps found). Nothing forward-looking lives there anymore.

---

## THE RULE: one front at a time

The project is not too large. It is too **wide** — several half-open fronts, none closing. The fix
is a work-in-progress limit of **one**. A front is finished when the gate is green and the item is
struck from this file. Only then does the next one open.

Current fronts, in the order they'd close fastest:

    [ ] A · Rulings          — you only; unblocks everything downstream
    [ ] B · Built, not wired — finished work delivering zero value
    [ ] C · Engine gaps      — from the external review
    [ ] D · Facility mints   — 25 remaining, the bulk of the work
    [~] E · Region graph     — PARKED. Newest, least finished, blocks nothing.

---

## A · RULINGS (you) — nothing else can move past these

**Data**
- [ ] Common magic-item tier is short — SRD has ~5 commons, tables want 90 rows. Accept small
      tables / fall through to mundane / merge into uncommon / typed-slot the tier?
- [ ] Ammunition weights — SRD values now carried. Suppress if AL doesn't track ammo encumbrance?
- [ ] Entertainer's Pack weight — source value was garbage (`5812 lb.`). Need the real number.

**Bastion (carried from earlier sessions)**
- [ ] Q13 rebuild frequency (ALPG vs DMG conflict) · Q14 rebuild resets no-repeat clock?
- [ ] Q15 bastion grants another PC a supernatural gift via Eldritch Discovery?
- [ ] Q16 Poisoner's Kit under the ALPG poison ban? · Q17 `Armor, +1` / `Magic ammunition, +1`
      draw from `ARMAMENTS`?

**Region graph — park these with the front, don't decide them now**
- [ ] Repin the ruler: 11.76 → ~18.2 mi/day. **The gating one.** See `research/regions/ROAD_PASS.md`.
- [ ] Per-traveller rate table · directional sea/river edges · feature centroids ·
      Kryptgarden at Westbridge · Black Road grade · Moonsea Ride shape correction
- [ ] Aid reachability · fog-week cost · border-sourcing scope · swordcoast overlap · legal-path
      segment definition

---

## B · BUILT, NOT WIRED — should be empty

- [ ] **Treasure roller.** `rollMagicItem()` and the whole slot chain are green. **Nothing calls
      it.** Needs one ruling (which order/event rolls treasure) then a one-line wire.
- [ ] **Player registration.** No account-creation flow. Import is reachable via "Add a character
      → A character I already play"; a new player has no front door.

---

## C · ENGINE GAPS (external review)

- [ ] Generated-data drift unenforced — `npm run generate` exists, nothing verifies it was run.
      **Highest risk here: stale bundles are a logged project meta-risk.**
- [ ] Lazy Proxy draft — one confirmed issue open from the immutability sweep.
- [ ] Reducer purity deliberately compromised — `Date.now()` / `new Date()` in reducer paths.
- [ ] No error boundary — `src/main.tsx` mounts directly; one render exception blanks the app.
- [ ] `noImplicitAny` is off — types porous around data despite `strict: true`.
- [ ] Accessibility never had a deliberate pass (~681 interactive elements, sparse ARIA).

**AL enforcement that data cannot check** (app-logic, unverified):
- [ ] Mundane store must not offer firearm weapons `[ALPG-312]` · bullets not listed as stock ·
      firearms barred from weapon-choice class features · smokepowder · trade goods and vehicles
      route to STORY-ITEM, never the mundane store `[DC-68]`

---

## D · FACILITY MINTS — 21 remaining of 29 (derived, 31 Jul)

**Counts are DERIVED from `node harness/facility_mint.cjs --status`, never hand-typed** — the old
line here read "25 remaining · 4/29" and had drifted four mints and one total behind the code.

Built to the CURRENT strict bar (**8 of 29**): arcane_study · archive · armory · library ·
observatory · scriptorium · smithy · workshop. Basics 6/6.

**The denominator is 29, not 28** — see B-69. A stale `facility_mint.cjs` in the container had lost
SACRISTY and the roster-integrity guard, and I reported 28 all morning on the strength of it.

**BLOCKER before any new mint (B-67, FACILITY_FORMAT.md §10.5).** The strict bar checks the stat
block and the seven registry tables. It does NOT check `tools`, `options`, `tables`, `features`,
`enlarge`, `capacity` or `open` — seven of the ten fields §3 defines. The Armory reads ✅ MINTED with
its own §8 feature (*stocked → defenders roll 1d8*) unimplemented. **Extend `facility_mint.cjs` to
the full §3 schema first**, or the divergence is propagated across the remaining 20 rooms.

Not yet started (21): barrack · demiplane · gaming_hall · garden · greenhouse · guildhall ·
laboratory · meditation_chamber · menagerie · pub · reliquary · **sacristy** · sanctuary · sanctum ·
stable · storehouse · teleportation_circle · theater · training_area · trophy_room · war_room

---

## E · REGION GRAPH — PARKED

Complete and self-contained in `research/regions/`. 74 locations, 13 roads, tree untouched at
28 nodes / 31 edges. Blocked on the ruler repin and on the Black Road mileage, which is **not on
the open web** — it needs the 2e *Anauroch* sourcebook. Nothing else depends on it. Leave it.

---

## F · BOOK GENERATOR AS A DM TOOL — after the Library corpus is finished (Frank, 31 Jul)

Turn the library book generator outward: expose it in the **writers section** and the **DM toolkit**
as *generate a book on demand*, which **mints an item** — a physical book the DM can hand to a player
as a reward. Worthless in gold, mechanically free, informationally real. A book is an object that
contains information; minting it as an item is the honest representation of that.

**Why it is worth building.** Three improvised facts at the table do not COMPOSE — each is a
standalone assertion, nothing in the second knows the first happened, and it reads as rambling rather
than as a book. The drift makes sentence two follow sentence one; the genre coupling makes the closer
match the title. And because every fact is independently readable by rule (no pronoun points outside
its own sentence), a DM can lift any single sentence out and use it as a hook, still true and still
sourced. **The books are the delivery mechanism; the facts are the asset.**

**THE ARCHITECTURAL CONSEQUENCE, and the reason to note it before building.** The generator today
does not STORE books, it RECOMPUTES them: the seed is keep + shelf + subject + week, so a shelf
yields the same book forever without saving a byte. A DM-minted book has no keep and no shelf, and
the player KEEPS it — so it must survive being handed over. **Minting is the first case where a book
becomes stored state rather than a derived value.** Not hard, but it is a different thing from what
exists, and cheaper to know now than to discover mid-build.

### The flows (Frank, 31 Jul)

**THE STEERING PRINCIPLE — the load-bearing rule.** The generator is aimed by **region or subject**,
and by nothing else. **Which three facts come out is never selectable.** That is deliberate: the
hit-or-miss draw is the correct behaviour for research, and it is what keeps a generated book a
*discovery* rather than a lookup. A DM steers the CONTAINER; the CONTENTS stay uncontrolled.

**1. Generated at a live table.** A DM checked in to a table opens the table schedule and clicks
*generate book*. The book is targeted using the adventure's own details — region and subject drawn
from the adventure in play — so what the players are handed actually fits the session. When the table
has players checked in and the DM checked in, the book is **added to the rewards section and marked
received**, because that is how the characters got it: through their exploration.

**2. Generated in prep.** A DM may generate ahead of time from the **DM tab on their profile**. A book
made this way is NOT auto-attached to anything; the DM adds it to the table prep list themselves.

**3. The DM's bookshelf.** The DM section keeps a shelf of generated books they have chosen to hold
onto — including ones that were not what they were aiming for but carry good information, which can
be used in some later adventure. This is the reuse path, and it is the reason a merely *interesting*
result is not wasted.

**4. The writers' shelf.** Writers get a similar shelf, but their generator exposes only **subject or
region** and no other pre-populated options — no adventure to inherit from, because they are writing
the module rather than running it. That is how books get made for modules.

### Deployment note — the corpus is statically imported today (31 Jul)

**Frank's design: everything lazy-loads once online, the system runs server-side, and the player
pulls only what they need.** That settles both concerns raised by the 31 Jul build measurement — the
payload and the exposure. Recording the CURRENT state so the gap is not rediscovered at deploy time.

**What `vite build` emits today:** one `content` chunk of **987 KB (303 KB gzipped)**, whole corpus
included, everything statically imported. `src/data/library_subjects.ts` is **468 KB of source** — the
largest data file in the project by 3x — and vite already warns that chunks exceed 900 KB. Total
first load is ~599 KB gzipped. Fine on broadband, noticeable on a phone at a game store.

**This is a gap, not a defect.** The lazy design is the target; the single bundle is what exists. It
is the kind of gap that goes unnoticed until someone opens the build on a phone and concludes the app
is slow.

**The seam is already in the right place — verified, not assumed:**

| the seam | where |
|---|---|
| the only static import of the corpus | `src/data/bastion.ts:1422` |
| the only two accessors | `librarySubjectFor(key)` · `anyLibrarySubject(rng)` — `bastion.ts:1481/1485` |
| the only call site | `engine.ts:912`, in the Library research branch |

Nothing else reaches into `LIBRARY_SUBJECTS` directly. **Making those two functions async fetches is
most of the work**, and the drift walker does not care where the facts came from — `composeLibrary-
Paragraph` takes a subject object and never touches the registry.

**Two further points for that phase:**
- Subjects are keyed by **region**, and a bastion sits in exactly one of twelve. A per-region pull
  loads ~8 subjects instead of 100 — roughly a 90% cut to the largest chunk, using a key that
  already exists.
- Keeping the corpus server-side also keeps it **out of devtools**. If the book generator ever
  becomes a product in its own right, the 1,965 facts are the moat, and a static bundle hands them
  to anyone who opens the network tab.

Open questions for that build, none blocking today:
- Seed source for an unbound book. Probably minted-at timestamp + DM identity, recorded on the item.
- Region selection: ask the DM, or infer from the adventure in play.
- AL legality of the handout. A zero-value, non-magical book granting no mechanical benefit should be
  clean, but it wants checking against ALPG reward rules before it ships, not after.
- Whether a minted book should be re-derivable at all, or whether the stored text is authoritative.
- Is a table-generated book ONE object for the party, or a copy per checked-in character? A physical
  book handed across the table is one object; the rewards section is per-character. These disagree.
- Does an adventure record its region and subject in a form the generator can read, or does that
  mapping need building first? The 12 storyline regions exist; the adventure-to-region link may not.
- Auto-marking a reward as *received* is the platform asserting something happened at a table. Worth
  deciding whether that is DM-attested or system-asserted, since it becomes an audit trail either way.
- The DM and writer shelves both imply STORED books, which confirms the architectural note above:
  minting is where books stop being derived values.

**Honest scope limit, recorded so it is not oversold.** Improvisation still beats this at ONE thing:
aim. "The door opens only at sunset" is about the adventure they are standing in; the generator makes
true facts about the world that may have nothing to do with tonight. It is better at breadth, truth,
coherence and reliability, and worse at relevance. A well-prepared DM at their best beats it on the
fact that matters right now. A DM at 11pm in session four does not, and now does not have to.
**It beats improvisation at the median, every time, and it never has a bad night.**

---


## Session protocol

1. Clone (or attach the one zip), run `tools/bootstrap.sh`, confirm **GATE GREEN**.
2. Name the front. One.
3. Work. Gate green before anything is called done.
4. Strike finished items from this file.
5. One bundle out at the end. Not five documents.

## Standing rules
Gate green always · delivered, not described · probe before you assert · cite to source and line ·
house rules labelled as the Exchange's own · owner's rulings are Frank's · never accept the first count.
