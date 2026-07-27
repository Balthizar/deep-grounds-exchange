# Deep Grounds Exchange — HANDOFF

**Restore:** clone this repo, run `tools/bootstrap.sh`, confirm **GATE GREEN**. See `BOOTSTRAP.md`.
Never change anything while the gate is red.

## Standing rules
- Gate green always; delivered, not described; probe before you assert.
- Cite AL/SRD rules to source and line; never paraphrase from memory.
- House rules are labelled as the Exchange's own, never dressed as citations.
- Owner's rulings are Frank's; Claude writes implementation.
- Parser discipline: never accept the first count — verify two independent ways.

## Code state
`al-platform/` — Vite/React, gate green at last verification.
Specials **4/29** (Arcane Study, Observatory, Archive, Armory). Basics 6/6.
Next mints: Barrack, Garden, Library, Sanctuary, Smithy, Storehouse, Workshop.
`NOTICE_VIEW` extraction (~4,712 lines) remains the largest structural win outstanding.

## Region graph — `research/regions/`
| file | what |
|---|---|
| `faerun_node_tree.v2.json` | the tree. **28 nodes / 31 edges UNCHANGED.** All new data sits in `pending_locations` — nothing derived* has been hardened into nodes. |
| `s1_locations.json` | 74 named locations from DDEX1-1..1-9 + DDEP1, classified and provenance-tagged |
| `faerun_roads.json` | 13 roads: stop orders, cited miles, the 2e day table, rate calibration |
| `S1_LOCATIONS_REDPEN.md` | Season 1 extraction findings |
| `ROAD_PASS.md` | road pass + **the ruler recalibration argument** |

### The one number that unblocks everything
`waterdeep →129→ secomber →106→ loudwater →82→ llorkh →???→ zhentilkeep →70→ phlan`

Only **Llorkh → Zhentil Keep (Black Road)** is missing. It is **not on the open web** — it would be in
the 2e *Anauroch* sourcebook. Everything else on the chain is cited or day-derived.

### Open rulings (Frank's)
1. **Repin the ruler.** Pin is 11.76 mi/day from Waterdeep→Neverwinter=200 mi. Four cited legs average
   **18.2**, and the 200-mi figure cannot be reconciled with the cited Leilon→Neverwinter=100 mi on the
   same road. Every `days` edge is likely ~1.5× short. **This gates the rest.**
2. Per-traveller rate table (caravan / foot / mounted / sail) — see `ROAD_PASS.md`.
3. Scope: do `feature` areas get centroids? Do `interior`/`sublocation` stay out of the graph?
4. Directional sea + river edges — canon times differ each way; the tree is symmetric.
5. Anchor Kryptgarden at Westbridge on the Long Road.
6. Black Road: hold open, `measured-map` grade, or a declared Exchange figure?
7. Moonsea Ride is ONE road Arabel→Hillsfar through the Dales, not the tree's two edges; Tilverton is the
   Northride junction, not Thunder Gap; Suzail→Arabel is missing; Shadowdale is absent.
8. Aid reachability, fog-week cost, border-sourcing scope, swordcoast node overlap, legal-path segment
   definition — carried forward, still undecided.

### Known gaps
- **Season 1 is incomplete**: DDEX1-10 … 1-14 were never uploaded.
- East cluster has abundant topology and **zero cited mileage** — a canon gap, not a search gap.
- Sidebar-heavy PDF pages interleave columns in both parsers; 74 locations is a floor, not a total.

### Not adopted (fan calculations — do not launder into the tree)
Giant in the Playground 420-mi Anauroch figure · theparchmentpaladin travel matrices (AideDD-derived)
· Obsidian Portal "good 50 miles" Phlan–Melvaunt (the cited figure is 55).
