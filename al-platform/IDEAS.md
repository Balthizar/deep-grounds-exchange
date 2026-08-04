# Ideas — set aside, not built

Things worth building, captured while they're fresh so they survive a session ending.
Nothing here is committed to. Each entry records the idea, why it fits, and the traps.

---

## 1. Dungeon & map generator (Writers tab)

**The idea.** Take the 1st-edition random dungeon generator's *approach* and rebuild it as a real
map generator and dungeon populator for 5e / AL play, driven by the Exchange's own brand of
narrative, deterministic, table-based generation. A writer specifies what kind of place this is —
size, depth, faction, tone, tier, purpose — clicks Generate, and gets back a dungeon that is
already laid out, populated with monsters, and seeded with story hooks.

**Why it fits this codebase specifically.** The engine already exists and is proven:

- `mkRng(seedStr)` — mulberry32, seeded. "Same week, same story." A dungeon seed makes a
  generated dungeon reproducible, shareable, and re-openable, which is exactly what a writer
  needs and what most generators fail at.
- `rpick(rng, arr)` — the weighted-pick primitive the whole bastion narrative layer runs on.
- The Bastion life-sim is *already* this pattern at scale: event tables feeding turn resolution,
  flavour keyed by form and size, reactions chosen by trait, a household week composed from
  parts. A dungeon is the same machine pointed at rooms instead of weeks.
- `srd-source/monsters.json` — 234 SRD monsters with full stat blocks, already parsed and
  already in the repo, carrying `cr`, `xp`, `type`, `size`, `alignment`, `senses`, `languages`.
  CR spread is good for AL tiers: CR 0–2 is 92 creatures, CR 3–6 is 67, CR 7–10 is 28.

**The trap — read this before starting.** The 1e dungeon generator's *tables* are TSR/WotC
copyright. They are **not** SRD. This is the same problem the random magic item tables had, and
it needs the same answer: **preserve the mechanics, replace the content.**

- Keep: the *idea* of stepwise random generation — passage, then junction, then chamber, then
  contents; the statistical shape of how dungeons branch and terminate; the notion of rolling
  room contents against a table.
- Replace: every table's actual entries, written fresh or drawn from SRD material.
- The precedent is already in the repo: `scripts/gen-magic-tables.mjs` and the header of
  `src/data/magic_tables.ts` explain the reasoning and the line that was drawn. Follow it.
- The AL legality layer applies too: monsters and treasure placed by the generator should pass
  the same filters (`SRD_AL_SWEEP.md`), and anything it can't source legally becomes a **typed
  slot** for the writer to fill from their own books — exactly like the hybrid item tables.

**Rough shape, if it gets built.**

1. **Inputs** — tier (1–4), size (small/large/sprawling), purpose (tomb, lair, fortress, mine,
   temple, prison), inhabitant faction, tone, and a seed (auto or typed).
2. **Layout pass** — rooms and corridors on a grid, generated stepwise so the map has the
   branching feel of a hand-drawn dungeon rather than a blob. Deterministic from the seed.
3. **Population pass** — encounters drawn from the SRD set, budgeted against tier-appropriate
   XP, and *thematically constrained* by the chosen faction so a tomb doesn't get bandits.
   Reuse the category/theme weighting already written for the magic tables.
4. **Narrative pass** — the part nobody else does well and this project is actually equipped
   for: hooks, room-to-room causality, a reason the place exists, and evidence of what happened
   here. The bastion generator's "why the work came back undone" logic is the same trick.
5. **Output** — a map (SVG), a keyed room list, an encounter budget summary, and hooks. The
   writer can reroll any single room without disturbing the rest (per-room sub-seeds).

**Open questions for later.**
- Does the writer get to *edit* the generated result in-app, or is the output a starting draft
  they take away?
- Should a generated dungeon be shareable by seed alone (compact, reproducible) or exported?
- Does this feed the adventure-authoring side of the platform, or stand alone as a writer's tool?

---

## 2. Player contacts + "where are my people playing?"

**The idea.** A player-level list of other PLAYERS, and a view of which tables the people on
that list have signed up for — so a group can plan around each other's schedules. Optionally,
direct messages between them to coordinate.

**What already exists (do not rebuild these).**
- **Private messaging is done.** `findOrCreateThread(s, from, to, "player", "player")` already
  creates player-to-player threads, and `social/ui.tsx` renders them. Players can DM today.
- **Signups already carry accounts.** A session holds `signups: [{ accountId, charId }]`, so
  "sessions where someone on my list has signed up" is a query over data that already exists.
  That is the valuable half of the feature and it needs no new storage.

**The naming trap — read before writing any code.** `friends` is ALREADY TAKEN and means
something else: `ADD_FRIEND` stores `{ name, adventure, note }` on a CHARACTER — the in-fiction
NPC friends a character made during play, shown by `FriendsSection` on the roster card. That is
a roleplay journal, not a social graph. If player-to-player contacts also use the word
"friends", the two will tangle in the data model and in every future conversation about them.
Pick a distinct word — **contacts**, **your table**, **companions** — and leave `friends` alone.

**Rough shape.**
- `state.contacts = { accountId: [accountId, ...] }` — mutual or one-way is a design call.
- A reducer action pair (add/remove), routed like the rest: `reducer/social.ts`.
- A panel in `social/ui.tsx` or on the profile: your contacts, and for each, the upcoming
  sessions they have signed up for (read from `state.sessions`).
- Messaging needs nothing new — it already works; the contact list just gives it a front door.

---

## 3. Rename the Resources tab

`src/authors/` is the package for writers' tools. The in-app tab is still labelled
**"Resources"** and the root component is still `ResourcesView`. Renaming is one line in each
place — the package boundary is already correct, which is the part that would have been
expensive to change later. Candidates discussed: **Authors' Desk**, **Writers' Room**.

---

## 4. The Chronicle is the cost basis for After Dark

> **READ `CHRONICLE.md` FIRST (committed 1 Aug).** The Chronicle is a much larger design than this
> entry implies — canonical FR chronology, ~3,250 metadata points across 250 adventures, Calls to
> Service, and the Harptos clock solved but unbuilt. This section is one narrow observation ABOUT
> that system, not a description of it.

**Recorded 1 Aug, from the design conversation. This is connective tissue between two systems, and
it is the kind of thing that is obvious the night you think of it and gone by Thursday.**

### The observation

The AL bastion has no teeth by design and by necessity: a call for aid **must resolve in one turn**,
because the ALPG says orders taking seven days or fewer benefit this session's characters. So the
bastion is "suddenly in the right place," the aid happens, and the week closes. Nothing is charged
for the distance.

**But the Chronicle records what actually happened.** The calendar shows the sail time from the last
anchorage, the march from the landing point, the days spent giving the aid, and the march home. The
base system charges none of it — it just tells the truth about the week.

**In After Dark, that same number becomes the price.** Journey time converts to bastion turns:
7 days = 1 turn. Aid stops being a free yes and becomes a decision — *do I spend seven turns to send
two people?* — which is the first question in the whole subsystem with a defensible "no". Nothing in
the AL bastion currently rewards declining anything.

### The consequence worth acting on

**The base system should compute journey time NOW, even though it charges nothing for it.** Not for
After Dark's sake — because the Chronicle is more truthful with it, and it is free data derivable
from the region graph (Backlog E) that already has to exist for vessel movement.

- **If it is computed all along**, After Dark is arithmetic over a number that is already there.
- **If it waits**, After Dark has to build a geography engine before it can charge for anything.

One is a mode. The other is a fork.

### Vessel movement, since it is the same graph

Backlog E was parked as a nice-to-have. It is not: it is a **dependency of a form already shipped**.
The vessel is the only bastion form where "where are you" is a decision rather than a fact, and the
medium is a real constraint rather than flavour:

- **skyship** — anywhere · **sand ship** — desert to desert · **sea vessel** — coasts only
- The vessel travels as close as its medium allows; the hero or the defenders walk the rest.
- The system picks the **closest legal stopping point**, and that point sets the vessel's region —
  so a sea ship bound for the Cormanthor lands at Phlan, and **Phlan is now its weather**. The event
  table follows the geometry, not the intent. A consequence nobody chose and everybody lives with.
- On a call for aid the vessel goes, drops its defenders, and **waits** — committed for the duration.
  No other form pays that. It also means the one form that can flee cannot flee while its people are
  ashore, which falls out of two rules rather than being designed as a special case.
- If defenders die, the bodies return to the ship and are **buried at sea after the vessel has moved
  away from the dock**. Keep this. It is what says the ship is a household rather than a vehicle,
  and it is the same instinct that gave hirelings names and ages.

### What it reuses rather than invents

**Defenders walking to an aid site is `fac.wip` pointed at people instead of ironwork** — pay up
front, accrue per turn, the owner is locked until it completes, resolve into an outcome. The
mechanism shipped 31 Jul for crafting. The per-turn line report ("they made Voonlar by the fourth day
and the roads were bad") is the same shape as the facility's "still on the bench" line.

### Boundary the sandbox must hold

After Dark reads the AL bastion and writes only sandbox state. That boundary wants to be
**structural and gated**, not a convention — one careless action writing a destroyed facility back to
a legal character is the failure that matters. Likewise anything GAINED after dark must never become
AL-legal: the provenance model already thinks in these terms, so an `AFTERDARK` item class that trade
and verification both refuse is probably a small change rather than a new system.

---

## 5. Scheduling as a navigation course — SEE `HANDOFF_prev_session.md` §2

**RETRACTED as a separate entry, 1 Aug.** I wrote a design here for scheduling-as-navigation after
searching the notes for "journey", "travel time" and "navigation" and finding nothing. **The search
was too narrow and the design already existed** — `HANDOFF_prev_session.md` §2, "THE VOYAGE / MEDIUM
/ REGION-GRAPH SUBSYSTEM", developed conversationally in a previous session and considerably more
advanced than what I restated.

**What the real document has that my version did not:**

- **"Movement is FREE. DT never buys movement."** A settled ruling. I had implied the reverse.
- **DT spent between sign-up and check-in IS the voyage's friction** — becalmed, detoured, sails
  torn, crew sick — with **no cap**, and events sourced from the vessel's **position along the route
  at the moment the DT was spent.**
- **The retroactive-turn hazard, resolved:** lock position on event, re-route only forward, never
  rewrite history. I had not seen the hazard, let alone the fix.
- **Coordinate-per-location, `hypot(A,B)` in the moment** — pre-*place*, not pre-*calculate*, so no
  n² matrix.
- **One query, three jobs:** crew-for-aid, character-to-table, character-to-planar-adventure are the
  same function with a different traveler.
- Planes as separate coordinate-spaces with **directional** transit rules; sky unconstrained within
  a plane but unable to cross planes.
- The **Barovia** transit case worked end to end and cited (ALPG line 396): in free, out costs 20 DT
  or CoS completion or a DDAL04 exit clause.
- An adopted **ruler**: Fonstad *Forgotten Realms Atlas* (1990), pinned Waterdeep→Neverwinter at
  200 mi ⇒ 11.76 mi/day caravan — with the 2x 5e/pre-5e map-scale conflict resolved by evidence.
- **Five open rulings** still Frank's to make, listed there.

**The lesson, and it is the same one this file keeps learning: a negative search result is not
evidence of absence.** I searched three synonyms across `al-platform/*.md` and never opened the
repo-root docs at all — where `Deep_Grounds_Codex.md`, `PRIMER.md` and both HANDOFFs live. Duplicating
a design is worse than not writing one, because it creates a second source of truth that will drift.

**§4 above stands** — the Chronicle-as-cost-basis observation and the burial-at-sea detail are not in
the handoff — but it should be read alongside §2 there, not instead of it.

**RECOMMENDED (Frank's call):** the voyage design is currently living in a file called
`HANDOFF_prev_session.md`. That name says "superseded", and it is why I did not open it and why a
future session will not either. **It should graduate into its own document** — `VOYAGE.md` or
`REGION_GRAPH.md` — the same way the After Dark notes are planned to graduate out of FINDINGS. A
design this developed should not be stored under a name that means "old".
