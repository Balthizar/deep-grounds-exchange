# The Voyage — medium, movement and the region graph

**Status: paper, except the graph data. Nothing wired to the engine.**

Consolidated 1 Aug 2026 from `HANDOFF_prev_session.md` §2–3 and the 1 Aug design conversation.

> **Why this document exists.** The design was living in a file named `HANDOFF_prev_session.md` — a
> name that means *superseded*. During the 1 Aug session it was searched for (`journey`, `travel
> time`, `navigation`), not found, and a lesser duplicate was written into `IDEAS.md` before the
> owner said "we created an entire design document about this". **A design stored under a filename
> meaning "old" is a design that will be rebuilt badly by whoever cannot find it.**

---

## 1 · The frame

**A bastion is a place. A vessel is a place that moves.**

The vessel is the only one of the eight bastion forms where *"where are you"* is a decision rather
than a fact. That is what makes the region graph a **dependency of a form already shipped**, not an
enhancement.

- **The medium (sea / sky / sand) is a vessel's REACH** — which edge-types it can traverse. The
  medium defines **the gap it cannot close**; the character or crew covers the remainder overland.
- **The character arrives FROM the ship, not IN it.** The rare no-gap arrival — sailing right up to
  the door — is the payoff, not the default. (The "gesture up at the skyship" moment.)
- **Sky is unconstrained within a plane** — every node reachable, gap usually zero. Its wall is
  **planes**: a skyship cannot intentionally cross them. Planar travel is portal, condition, spell or
  foot; never fly-through.
- **Planes are separate coordinate-spaces** joined by per-plane, **DIRECTIONAL** transit rules — the
  in-rule and the out-rule are specified separately and are allowed to differ. Toril first; foreign
  planes are named stubs carrying their cosmology, authored when a table actually goes there.

**One query, three jobs.** Crew-for-aid, character-to-table, and character-to-planar-adventure are
all *"nearest reachable node to the target, then cover the remainder overland."* Same function,
different traveller.

**The chronicle is the timeline.** Travel is appended **before** the calendar assignment that fits the
character into canon, kept ordered so the log is always canon-legal on its face. See `CHRONICLE.md` —
this is the same claim as its "floating entries" mechanic arrived at from the other end, and **the
two must be built with one ordering function, not two.**

---

## 2 · Movement model — settled rulings

- **Movement is FREE. DT never buys movement.** DT stays the ordinary downtime economy.
- **DT spent between sign-up and check-in IS the voyage's friction** — becalmed, detoured, sails torn,
  crew sick. More DT spent = a longer, more eventful crossing. **No cap.** When DT is spent and events
  fire, they are sourced from the vessel's **current position along the route**.
- **The only hard number is the FLOOR:** minimum crossing = coordinate distance along the
  medium-legal path (great-circle / summed legal segments) off a Toril map abstracted into point
  coordinates. **Positions ARE the weights** — no hand-authored edge-weight table.
- **The window (sign-up → check-in) is just real time to spend DT in**, not a budget the voyage must
  fit under.
- **Spend zero DT** → the ship takes the efficient route, arrives, and the chronicle writes the travel
  window as **uneventful** (no work done).
- **Retroactive-turn hazard: RESOLVED by this model.** An event fires where the ship actually was when
  the DT was spent; a later reschedule re-routes only *forward*. **Lock position on event, never
  rewrite history.**
- **Coordinate-per-location architecture:** every location the router might target stores **one
  coordinate**; distance "in the moment" is `hypot(A,B)` — instant, never a gap. **Pre-*place*, not
  pre-*calculate*.** Never an n² matrix.

---

## 3 · Scheduling is a navigation course (1 Aug)

**When a player schedules themselves for a table, they are plotting a course.** The adventure is not
a fixed point dropped on the map — it sits somewhere, and the character travels there from wherever
their bastion currently is. That distance is appended to the Chronicle **ahead of** the adventure.

**Every bastion form needs this calculation, not just vessels.** A keep does not move, so the
character travels from the keep. One calculation, different origin point.

**The edge case that proves the model** (owner's own, 1 Aug): a vessel anchored near defenders it has
sent ashore, with an adventure scheduled far away. **The ship will not weigh anchor and leave its
people behind** — the commitment rule (§4) holds. So the ship stays and **the player makes the whole
journey overland**, from the anchorage to the adventure, and that time goes on the Chronicle like any
other.

That is not a special case in code. It is the ordinary calculation with the origin held still by a
rule that already exists. **When rules compose instead of needing exceptions, the model is sound.**

---

## 4 · Aid, and what a vessel pays that no other form does

On a call for aid the vessel goes, drops its defenders, and **waits.** It is committed for the
duration — it is not somewhere else while its people are ashore. **No other bastion form pays that.**

It also means **the one form that can flee cannot flee while its crew is ashore.** That falls out of
two rules rather than being designed as a special case.

**If defenders die, the bodies are returned to the ship and buried at sea AFTER the vessel has moved
away from the dock.** Keep this detail. It is what says the ship is a household rather than a
vehicle — the same instinct that gave hirelings names and ages.

**Stopping point sets your weather.** The system picks the closest legal stopping point for the
medium, and **that point determines the vessel's region** — so a sea ship bound for the Cormanthor
lands at Phlan, and Phlan is now its event table. The geometry decides, not the intent. A consequence
nobody chose and everybody lives with.

**In After Dark this is turn-charged** (see `AFTER_DARK.md` §4): distance converts at 7 days = 1 turn,
with a per-turn line report, making aid a real decision. In AL it is narration — the aid resolves in
one turn as the ALPG requires, and the Chronicle records the truth without charging for it.

---

## 5 · Barovia — the worked transit case (CITED)

ALPG (`AL_Players_Guide_v2026_4.md` line 396): a Curse of Strahd character is trapped in the
Demiplane of Dread until they **complete CoS**, a **DDAL04 adventure gives a leave-option**, or they
**pay 20 DT (repeatable)**. The Adaptation Guide (line 32) scopes the restriction to CoS-campaign
characters, not every Barovia one-shot.

**Transit rule: IN = free, any medium** (the mists take you). **OUT = 20 DT / CoS completion / DDAL04
option.**

- A skyship flies freely *inside* but cannot navigate the mist out without paying — **the out-edge is
  priced in DT and is medium-independent.**
- **One 20 DT covers character AND ship.** The 20 DT is the character's ALPG cost; AL does not price
  ships, so the ship leaving is free Exchange consequence.
- Failed exit (cannot afford) → the fog-return narration, still trapped.
- **DDAL04 exit-clause mechanization:** the DM inputs the exit clause on the table-completion report;
  the player accepts or declines; **decline is a remembered state**; the flag only lights for modules
  that actually offer it. Rides the existing completion-report + accept/decline + log machinery.

---

## 6 · The ruler, and where distances come from

**The scale conflict is real: a 2× split between WotC's own maps** (the SKT map is twice the LMoP
scale). Stratified by edition, **1e/2e/3e broadly agree** on geometry and **5e/SKT roughly doubled
it** — one consistent pre-5e ruler and a 2× 5e outlier. **4e is excluded**: the Spellplague re-mapped
the world, so it is a different world, not a different ruler.

**Adopted ruler: Fonstad, *Forgotten Realms Atlas* (1990), 1″ = 200 mi** — one cartographer, one
scale, covering all the regions. **Pinned via Waterdeep→Neverwinter = 200 mi ⇒ 11.76 mi/day caravan.**

**Distances come from CANON TEXT** — 2e trade tables reproduced online, 3e adventure text, the FR
wiki — **not from map-pixel-reading**, which measured ~2× off and scale-contaminated. **Do not use
pirated full-book scans.**

**Provenance convention, on every node and edge:**

| tag | meaning |
|---|---|
| `cited` | a canon figure |
| `days` | 2e trade-table days × 11.76 |
| `cited-3e` | ~25% larger than the pin |
| `derived` | from map geometry |
| `derived*` | EAST cluster, geometry only — the roughest |

---

## 7 · The region node tree — current data

**28 nodes / 31 edges.** Frame: Waterdeep origin, +x east / +y north, miles. Lives in
`faerun_node_tree.json` (source of truth; the `.md` views may lag).

**The 12 region nodes are `BASTION_REGIONS`** — the AL season settings. Surface: 12. Sub-surface:
underdark. Off-plane: barovia, avernus, feywild, wildspace.

**West/north — solid** (`cited` / `days`): High Road (Waterdeep–Leilon–Neverwinter–Port Llast–Luskan);
Long Road (Waterdeep–Red Larch–Triboar–Longsaddle–Mirabar); Evermoor Way
(Triboar–Yartar–Everlund–Silverymoon); Silverymoon Pass; **East Trail
(Waterdeep–Secomber–Loudwater–Llorkh, 27 days)**; Trade Way (`cited-3e`); Chionthar road.

**Alternate-medium edges on the same pairs — this is the medium system in the data:** Dessarin
**barge (river)** Waterdeep→Silverymoon; **coastal ship (sea)** Waterdeep→Luskan and
Waterdeep→Baldur's Gate.

**Dawn Pass Trail (new):** Llorkh→Parnast (`derived` ~60 mi) — proved the attach-and-place loop.
Waterdeep→Parnast ≈ 353 mi straight-line / ~378 road (~318 cited + ~60 derived); Parnast now a stored
coordinate `[343,-84]`.

**East cluster — weak** (`derived*`): heartlands→cormyr (**880 mi — the single weakest number, and it
anchors the whole east block**); cormyr→dalelands (Tilverton / Thunder Gap); dalelands→moonsea
(Moonsea Ride).

**Off-grid** (transit rules, no coordinates): underdark, barovia, avernus, feywild, wildspace.

---

## 8 · Open rulings — Frank's, NOT yet decided

1. **Aid/table reachability:** "get close, walk the rest" as pure narration (stays sum-vs-10)
   **vs.** a medium-gated modifier that changes the odds (a labelled Exchange house rule).
2. **The fog-week cost:** a failed Barovia exit's wasted week — burns a real turn / DT **vs.** free
   narration.
3. **Border-sourcing scope:** do threats and aid *become* neighbour/border-sourced now, **vs.** the
   graph goes in for ship-routing first and event-sourcing follows? (Today the code is
   region-*keyed*, not region-*relational*: threats = `REGION_WEIGHTS[ownRegion]`; aid = own-region
   flavour + sum-vs-10; no border concept exists.)
4. **swordcoast vs waterdeep/neverwinter node overlap:** keep the broad node as a corridor, collapse
   it, or drop it.
5. **Legal-path segment definition** for the reachability layer, so straight lines do not sail
   through continents.

---

## 9 · Next moves (where the work stopped)

- **(a) Close the east–west connector with canon.** The Dawn Pass Trail runs Parnast → Lonely Moor →
  **Black Road across Anauroch → Zhentil Keep (Moonsea)** — a cited overland route that would replace
  the 880-mi `derived*` guess anchoring the east. (A DM route-calc gave Red Larch→Mulmaster ≈ 1,500
  crow / 1,736 road at 5e scale — halve for the pre-5e ruler.) **The 2e Anauroch sourcebook is the
  identified source for Black Road mileage.**
- **(b) Batch-place AL adventure START locations** — the finite set the router targets, not every
  flavour locale — against this skeleton; cited where canon gives a distance, `derived`-tagged
  otherwise. A large, ongoing, staged data job. Multi-setting: Ravenloft / Eberron / Dragonlance /
  Avernus / Wildspace start locations are **transit-rule nodes, not Faerûn coordinates.**

**Codify-later note.** The graph is **provisional data, not engine source.** Per the stale-data rule,
do not harden `derived*` guesses into `REGION_COORDS` / `REGION_EDGES` until they are red-penned —
especially the 880-mi east anchor and the Trade-Way `cited-3e` vs 200-mi-pin reconcile. Then codify
the corrected tree in one pass.

---

## 10 · Related shipped work

- **`ARMORY_KIT_BY_FORM`** — the vessel's Stock Armory kit is boarding-pikes / cutlasses /
  ballista-bolts / catapult-stones. Setting-corrected: gunpowder terms removed (Faerûn uses
  *smokepowder*; firearms are restricted).
- **Vessel reflavour of Defensive Walls** — a vessel's Walls read as a hardened, plated hull with the
  deck-engines run out. Same cost, same mechanic, pure narration. Three beats reflavoured plus the
  wall-less "just planking and paint" line. Ledger labels left generic on purpose; per-form
  granularity is an open call.
