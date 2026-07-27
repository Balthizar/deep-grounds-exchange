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
