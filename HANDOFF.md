# Deep Grounds Exchange — HANDOFF

**Restore:** clone this repo, run `tools/bootstrap.sh`, confirm **GATE GREEN**. See `BOOTSTRAP.md`.
Never change anything while the gate is red.

## Standing rules
- Gate green always; delivered, not described; probe before you assert.
- Cite AL/SRD rules to source and line; never paraphrase from memory.
- House rules are labelled as the Exchange's own, never dressed as citations.
- Owner's rulings are Frank's; Claude writes implementation.
- Parser discipline: never accept the first count — verify two independent ways.

## Code state — verified from a clean clone, 29 Jul (head `c7d0063` + this session's fixes)

`al-platform/` — Vite/React. **Gate green, 19 suites.** `npm run check` is the gate; `npm run report`
itemises it; `npm run next` is the advisory triage driver (reads work-state, test-state, loose ends).

**Facilities — specials 8/29, basics 6/6.** Do not read a facility count out of a document; run
`npm run facilities`, which derives the ledger from the live registry.
- Minted specials: Arcane Study · Archive · Armory · Library · Observatory · Scriptorium · Smithy · Workshop
- Next at L5: **Barrack · Garden · Sanctuary · Storehouse**
- 21 to start. The roster is **29**, not 28 — **Sacristy** (L9, Craft, `Bastions.md:1014`) was missing
  from it entirely until B-38. Roster now cross-checked against an independent per-level partition by
  `npm run check:roster`, because a declared target cannot audit itself.

**Library subjects — 24 of 102 sourced.** `LIBRARY_SUBJECTS_100.md` is the ledger `npm run next`
reads; it had drifted from the registry three ways (B-39) and is now gated against it by
`npm run check:ledger`. Roster is 102, not 100, because two authored faction subjects had no row and
nothing was struck to make room.

**Standing structural work:** `NOTICE_VIEW` extraction (~4,712 lines) remains the largest structural
win outstanding. Lint sits at 171 warnings / 0 errors.

**Two new checks in the chain** (both negative-tested, both found further defects on first run):
`check:ledger` · `check:roster`.

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

### Open rulings (Frank's) — raised 29 Jul, small and quick
0a. **Library roster size.** Hold at 102, or strike two ⬜ candidates for a round 100? Which two is a
    content call. Noted at the head of `LIBRARY_SUBJECTS_100.md`.
0b. **The Blackstaff.** Rows 59 and 84 were the same subject listed twice, once as a person and once
    as an object. Labels are disambiguated for now (*the office* / *the staff*); collapsing them into
    one subject frees a category slot for a fresh candidate.

### Open rulings (Frank's) — region graph
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
