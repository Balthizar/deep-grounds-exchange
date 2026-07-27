# The Deep Grounds Exchange — Session Handoff (2026-07-26)

Drop this file into the new chat along with **`al-platform-armory-mint-<latest>.zip`** (the code) and
**`faerun_node_tree.json`** (the region graph). Those three carry the full state.

Owner: **Frank** — certified AL DM, C++ background, founder of The Deep Grounds Adventuring Company.
Project: **The Deep Grounds Exchange**, a React/TSX + Vite AL organized-play / Bastion-management app.

---

## 0) HOW FRANK WORKS — read first (these are hard standards)

- **Literal AL compliance.** Cite the rulebook and the line number; never paraphrase a rule from memory.
  Hierarchy: **ALPG > DMG > the Exchange's own reading.** Silence is filled by the next official
  source, not by prohibition — *except* where a prior least-permissive structural ruling closes the gap.
- **House rules must be labeled as the Exchange's own** — never dressed as a citation or another org's policy.
- **Gate green always.** Nothing ships without the full harness passing (`npm run check`).
- **Delivered, not described.** Produce the artifact (file), not a plan.
- **Probe before you assert.** Read the actual source file / do the retrieval before claiming a fact.
  (This session I made a ~2× map-scale error by eyeballing + memory; canon text corrected it. Don't repeat it.)
- **Provenance tagging is non-negotiable.** Never blur an estimate with a citation. Every derived number
  is labeled derived; every canon number is cited to source.
- **Owner's rulings are Frank's alone.** Claude writes implementation; Frank makes design/architecture calls.
- **No CATALOG collisions** (`Object.assign` silently overwriting hand-written rows) — use the field-merge guard.
- Frank communicates tersely; "continue"/"go" = proceed without asking. He values honest correction over
  agreeableness ("the Jerry standard"). Voice-to-text artifacts happen (e.g. "Sebastian"=bastion).
- **Compliance line for the whole voyage/region layer:** it may decide *which* region sources an event and
  how it reads, and may gate crossings that are genuinely in the rules (e.g. Barovia's 20 DT). It must
  **never** touch DMG resolution — 6d6 attack, sum-vs-10 aid, costs. Anything that changes the *odds* for
  distance is a labeled Exchange house rule, not the DMG's.

Build/gate: `npm run check` = `tsc -b` → `oxlint` → `check:actions` → `check:generated` → `test:behaviour`
→ `test:minified` → `test:immutable` → `test:transitions` → `vite build`.
Working tree this session: `/home/claude/snap/al-platform/` (unzipped from the snapshot).

---

## 1) CODE SHIPPED THIS SESSION (gate-green, in the zip)

**Build state:** special facilities **4/29** (Arcane Study, Observatory, Archive, **Armory** ← new); basics 6/6.
Remaining L5 specials to mint next: Barrack, Garden, Library, Sanctuary, Smithy, Storehouse, Workshop.

### Armory facility — minted in full, gate green (transitions 118/118)
DMG rules (Bastions.md 437–462): L5, Roomy, 1 hireling, Trade order. Stock Armory = 100 GP + 100/defender,
halved with a Smithy. While stocked, roll **1d8 for each d6** on **any** defender-loss event; equipment
**expended when the event ends**.

What was built:
- **DMG-compliance fix:** the d8-upgrade + expend had only landed for **Attack**. `rollAidOutcome`
  (engine.ts) hardcoded `d6()` and never read `armed`, so **Request for Aid** got nothing. Fixed: Aid rolls
  d8 when armed and expends the stock after resolving. Both defender-loss sites now match "any event."
- **One shared `stockArmory(s, ch, date)` helper** (engine.ts) — the Arm button (`ARM_BASTION` action) AND
  the Trade order both route through it, so cost/guards/`armed` can't drift.
- **Trade order stocks the Armory** (facility-specific branch in `resolveBastionOrder`, precedented by how
  Research special-cases the Archive) — the Armory's Trade *spends* to stock, vs the generic Trade's
  produce-gold. **Design note Frank can still veto:** the off-turn Arm button is the Exchange's convenience
  layer on top of the DMG's turn-based Trade; both call the same helper.
- **`BASTION_FACILITIES.armory` def** + full **`registerFacility`** spec (roles, furnishings, 8-form
  furnishing ladders, 8×3 sizeFlavor, 8 ruins, 6 reactions, 8×12 life-tasks) at the Arcane-Study bar.
- Harness: +7 armory assertions (def, cost=400, no-double-charge, Smithy=200, Trade-stocks-with-kit).

### Design complaint filed (FINDINGS.md) + design note in code
Frank's ruling: the DMG's flat Armory/attack model is **poor design** (whole-armory expend "regardless of
losses"; 6d6/4d6 pool decoupled from defender count; Walls a bare die-cut) — followed only because AL
requires it. **The model that SHOULD ship is recorded in comments above `rollAttackOnes` (engine.ts):**
one die per defender, 1d6 unarmored / 1d8 armored (armor tracked per-defender), Walls = attackers roll with
**disadvantage** (reroll each die, take the worse-for-attacker = higher die, since low = harm), a **1 kills**
that defender / a **2 destroys that defender's gear** (reverts to d6 until re-equipped), dynamic per-defender
restock. Deferred under AL; kept as a design note + a logged complaint. NOT implemented.

### Flavor: `ARMORY_KIT_BY_FORM` (bastion.ts) — form-keyed Stock Armory narration
Each Bastion form names its own kit in the stock/expend narration (pure flavor; mechanic identical).
**Setting-corrected:** gunpowder terms removed (Faerûn uses *smokepowder*, exotic/Gond-Lantan, and the
project restricts firearms — pistol is "may not be traded, crafted, or replicated (ALPG)"). Final kits:
keep = war-harness/billhooks/fletched arrows; tower = spears + crossbow quarrels; manor = plate/hunting-spears/arrows;
cavern = oiled harness/rot-proof hafts/bolts kept dry; ruin = salvaged harness/re-hung blades/arrows;
grove = strung bows/green-ash spears/waxed quivers; **vessel = boarding-pikes/cutlasses/ballista-bolts/catapult-stones**;
hamlet = billhooks/two good suits/a barrel of arrows.

### Vessel reflavor of Defensive Walls (engine.ts battleBeats + actions.ts build flavor)
When a **vessel** builds Walls it reads as a **hardened/plated hull with the deck-engines run out** (same
cost, same mechanic — pure narration). Three beats reflavored (build-in-progress, instant-from-allowance,
under-attack) + the wall-less "just planking and paint" line. Ledger labels ("Defensive Walls") left generic
on purpose — that's the granularity pass, Frank's call whether to per-form them.

---

## 2) THE VOYAGE / MEDIUM / REGION-GRAPH SUBSYSTEM (design, this session)

This is a large new design Frank developed conversationally. It is **paper** (nothing wired to the engine
yet) except the region graph data below. The catalyst was **ship movement**.

### The frame (stable, end-to-end consistent)
- **A bastion is a place; a vessel is a place that moves.**
- **The medium (sea / sky / sand) is a vessel's REACH** — which edge-types it can traverse. The medium
  defines the **gap it can't close**; the character/crew covers the remainder overland. Character arrives
  *from* the ship, not *in* it (the rare no-gap arrival is the "gesture up at the skyship" payoff).
- **Sky is unconstrained *within a plane*** (every node reachable, gap usually zero). Its wall is **planes** —
  it cannot intentionally cross planes; planar travel is portal/condition/spell/foot, never fly-through.
- **Planes are separate coordinate-spaces joined by per-plane, DIRECTIONAL transit rules** (in-rule and
  out-rule specified separately, allowed to differ). Toril-first; foreign planes are named stubs carrying
  their cosmology, authored when a table actually goes there.
- **One query, three jobs:** crew-for-aid, character-to-table, character-to-planar-adventure are all
  "nearest reachable node to the target, then cover the remainder overland." Same function, different traveler.
- **The chronicle is the timeline:** travel is appended *before* the calendar assignment that fits the
  character into canon, kept ordered so the log is always canon-legal on its face.

### Movement model (Frank's rulings — settled)
- **Movement is FREE. DT never buys movement.** DT stays the normal downtime economy.
- **DT spent between sign-up and check-in IS the voyage's friction** — lost, becalmed, detoured, sails torn,
  crew sick. More DT = a longer, more eventful crossing. **No cap.** When DT is spent and events fire, they're
  sourced from the vessel's **current position along the route**.
- **The only hard number is the FLOOR:** minimum crossing = **coordinate distance along the medium-legal
  path** (great-circle / summed legal segments), off a Toril map abstracted into point-coords. Positions ARE
  the weights — no hand-authored edge-weight table.
- **The window (sign-up → check-in) is just real time to spend DT in**, not a budget the voyage must fit under.
- Spend **zero** DT → the ship takes the efficient route, arrives, and the chronicle writes the travel window
  as **uneventful** (no work done).
- **Retroactive-turn hazard: RESOLVED** by this model — an event fires where the ship actually was when the DT
  was spent; a later reschedule re-routes only *forward*; **lock position on event**, never rewrite history.
- **Coordinate-per-location architecture:** every location the router might target stores **one coordinate**;
  distance "in the moment" is `hypot(A,B)` — instant, never a gap. **Pre-*place*, not pre-*calculate*** (never
  an n² matrix).

### Barovia (the worked transit-rule case — CITED)
ALPG (`AL_Players_Guide_v2026_4.md` line 396): a Curse of Strahd character is trapped in the Demiplane of
Dread until they **complete CoS**, a **DDAL04 adventure gives a leave-option**, or they **pay 20 DT (repeatable)**.
Adaptation Guide line 32 scopes the restriction to CoS-campaign characters (not every Barovia one-shot).
Transit rule: **IN = free, any medium** (the mists take you); **OUT = 20 DT / CoS completion / DDAL04 option.**
Skyship flies freely *inside* but can't navigate the mist out without paying — the out-edge is priced in DT,
medium-independent. **One 20 DT covers character + ship** (the 20 DT is the character's ALPG cost; AL doesn't
price ships, so the ship leaving is free Exchange consequence). Failed exit (can't afford) → the fog-return
narration, still trapped. **DDAL04 exit clause mechanization (Frank's design):** the DM inputs the exit clause
on the table-completion report; the player accepts/declines; **decline is a remembered state**; the flag only
lights for modules that actually offer it (rides the existing completion-report + accept/decline + log machinery).

### OPEN RULINGS (Frank's, NOT yet decided)
1. **Aid/table reachability:** "get close, walk the rest" as pure narration (stays sum-vs-10) **vs.** a
   medium-gated modifier that changes the odds (a labeled Exchange house rule).
2. **The fog-week cost:** a failed Barovia exit's wasted week — burns a real turn / DT **vs.** free narration.
3. **Border-sourcing scope:** do threats & aid *become* neighbor/border-sourced now, **vs.** graph goes in for
   ship-routing first and event-sourcing follows. (Today the code is region-*keyed*, not region-*relational*:
   threats = `REGION_WEIGHTS[ownRegion]`; aid = own-region flavor + sum-vs-10; no border concept exists.)
4. **swordcoast vs waterdeep/neverwinter node overlap:** keep the broad node as a corridor, collapse it, or drop.
5. **Legal-path segment definition** for the reachability layer (so straight lines don't sail through continents).

---

## 3) THE REGION NODE TREE (data — in `faerun_node_tree.json`)

**The 12 region nodes = `BASTION_REGIONS` (the AL season settings):** moonsea, underdark, barovia, swordcoast,
waterdeep, chult, baldursgate, avernus, icewinddale, feywild, wildspace, neverwinter, silvermarches, cormyr,
dalelands, heartlands, dessarin. (Surface: 12; sub-surface: underdark; off-plane: barovia/avernus/feywild/wildspace.)

### The RULER (Frank's method → evidence-based pick)
- **The scale conflict is a real 2× split between WotC's own maps** (SKT map is twice the LMoP scale). Stratified
  by edition: **1e/2e/3e broadly agree** on geometry; **5e/SKT roughly doubled it**. So there's one consistent
  pre-5e ruler and a 2× 5e outlier. **4e excluded** (Spellplague re-mapped the world — different world, not a ruler).
- **Adopted ruler: Fonstad *Forgotten Realms Atlas* (1990), 1″ = 200 mi** — one cartographer, one scale, covers
  all the regions. **Pinned via Waterdeep→Neverwinter = 200 mi** ⇒ **11.76 mi/day** caravan.
- **Distances come from CANON TEXT** (2e trade tables reproduced online, 3e adventure text, the FR wiki) — NOT
  from map-pixel-reading (which was ~2× off / scale-contaminated). **Do not use pirated full-book scans.**

### Provenance convention (on every node/edge)
`cited` (canon figure) · `days` (2e trade-table days × 11.76) · `cited-3e` (~25% larger than the pin) ·
`derived` (from map geometry) · `derived*` (EAST cluster, geometry only, roughest).

### Current tree: 28 nodes / 31 edges (frame: Waterdeep origin, +x E / +y N, miles)
- **West/north, solid** (cited/days): High Road (Wd–Leilon–Neverwinter–Port Llast–Luskan), Long Road
  (Wd–Red Larch–Triboar–Longsaddle–Mirabar), Evermoor Way (Triboar–Yartar–Everlund–Silverymoon),
  Silverymoon Pass, **East Trail (Wd–Secomber–Loudwater–Llorkh, 27 days)**, Trade Way (cited-3e), Chionthar road.
- **Alternate-medium edges on the same pairs** (this is the medium system in the data): Dessarin **barge (river)**
  Wd→Silverymoon; **coastal ship (sea)** Wd→Luskan / Wd→Baldur's Gate.
- **Dawn Pass Trail (NEW):** Llorkh→Parnast (derived ~60 mi) — proved the attach-and-place loop:
  **Waterdeep→Parnast = ~353 mi straight-line / ~378 road (~318 cited + ~60 derived), Parnast now a stored coord `[343,-84]`.**
- **East cluster, weak** (`derived*`): heartlands→cormyr (**880 mi, the single weakest number — anchors the
  whole east block**), cormyr→dalelands (Tilverton/Thunder Gap), dalelands→moonsea (Moonsea Ride).
- **Off-grid** (transit rules, no coords): underdark, barovia, avernus, feywild, wildspace.

### NEXT MOVES (where we stopped — Frank said "go", pick one)
- **(a) Close the east–west connector with canon:** the Dawn Pass Trail runs on Parnast→Lonely Moor→**Black
  Road across Anauroch→Zhentil Keep (Moonsea)** — a cited overland route that would replace the 880-mi
  `derived*` guess anchoring the east. (A DM route-calc gave Red Larch→Mulmaster ≈1,500 crow / 1,736 road,
  5e-scale — halve for the pre-5e ruler.)
- **(b) Batch-place AL adventure START locations** (the finite set the router targets — not every flavor
  locale) against this skeleton, cited where canon gives a distance, derived-tagged otherwise. This is a
  large, ongoing, staged data job. Multi-setting: Ravenloft/Eberron/Dragonlance/Avernus/Wildspace start
  locations are transit-rule nodes, not Faerûn coordinates.

### Codify-later note
The graph is kept as **provisional data, not engine source** — per the stale-data rule, don't harden
`derived*` guesses into `REGION_COORDS`/`REGION_EDGES` until Frank red-pens them (esp. the 880-mi east anchor
and the Trade-Way `cited-3e` vs 200-mi-pin reconcile). Then codify the corrected tree in one pass.

---

## 4) FILES IN THIS PACKAGE
- `al-platform-armory-mint-<latest>.zip` — the full code tree (Armory mint + flavor + vessel reflavor,
  gate-green). Container resets between chats, so this zip is the durable code.
- `faerun_node_tree.json` — the region graph data (28 nodes, 31 edges, provenance-tagged). Source of truth.
- `faerun_node_tree.md` / `faerun_region_graph.md` — human-readable views (may lag the JSON; JSON wins).
- `HANDOFF_deep_grounds_exchange.md` — this file.

## 5) FIRST MESSAGE FOR THE NEW CHAT (suggested)
"Continuing the Deep Grounds Exchange. Handoff + code zip + region-graph JSON attached. Armory is shipped and
gate-green (4/29 specials). We're mid-design on the voyage/medium/region-graph subsystem (paper, except the
graph data). Last thing: I said 'go' on extending the region tree — pick up at NEXT MOVES (a) the Black Road
east–west connector, or (b) batch-placing AL adventure start locations. Read the OPEN RULINGS before assuming."
