# AL Season 1 (Tier 1) — named-location extraction · RED-PEN

Sources: **DDEX1-1 … DDEX1-9 + DDEP1 Corruption in Kryptgarden** — 10 PDFs, **318 pages**.
Output: `s1_locations.json` (64 entries) · `faerun_node_tree.v2.json` (28 nodes / 31 edges **unchanged** + `pending_locations`).

---

## 0) THE HEADLINE: I placed nothing. Here is why.

**Zero new coordinates were written.** Not one. The graph's nodes and edges are byte-for-byte what you
handed me.

The reason is a single blocker: **Phlan has no coordinate, and it is the anchor for all of Season 1.**
Every S1 distance in canon is expressed *relative to Phlan* — 40 miles west of Phlan, east of Phlan, a day
and a half north of Phlan. Phlan itself is cited only as sitting on the **north shore of the Moonsea**
(DDEX1-7 p.2). The tree's `moonsea` node is at `[875,-132]`, tagged `derived*`, and by your own handoff it
hangs off the 880-mi `heartlands→cormyr` connector — **the single weakest number in the graph.**

So placing Phlan would take the worst number in the tree and propagate it into 18 new placement records,
which then read like data. That is the stale-data failure your codify-later rule exists to prevent. I
stopped at the line instead of crossing it.

**What I built instead: relative placement records.** Each location stores `{anchor, bearing, mi, prov}` —
not a coordinate. When you red-pen the east anchor, every one of them recomputes. Nothing has to be
re-extracted, and nothing false is sitting in `coord` in the meantime.

**One ruling unlocks all 18 at once:** a cited Phlan coordinate, or a cited Phlan↔Zhentil Keep or
Phlan↔Melvaunt distance. That is a single number, and it is the same class of fix as your move (a).

---

## 1) What canon actually gives (the cited layer)

| location | citation | what canon says | prov |
|---|---|---|---|
| **King's Pyre** | DDEX1-9 p.5, p.13 | on the coastline, **about 40 miles west of Phlan**; party arrives after **2 days** | `cited` — bearing **and** distance |
| Kabel's Hill | DDEX1-8 p.2 | small lightly fortified farming hamlet, **a day and a half north** of Phlan, along a narrow stretch of the Stojanow River | `cited-days-only` |
| Rythnax's lair | DDEX1-6 p.20 | **half a day's ride east** along the Phlan Path, in the Twilight Marsh | `cited-days-only` |
| Twilight Marsh | DDEX1-6 p.20 / DDEX1-7 p.2 | large swamp **east of Phlan**, north shore of the Moonsea | `cited-direction-only` |
| Trank River | DDEX1-7 p.2 | runs **east of Phlan** through the Twilight Marsh | `cited-direction-only` |
| Dragonspine Mountains | DDEX1-5 p.2 | reached trekking **northwest** from Phlan | `cited-direction-only` |
| Quivering Forest | DDEX1-8 p.2 | ancient enchanted forest **east of Kabel's Hill** | `cited-direction-only` |
| Stojanow River | DDEX1-8 p.5 | runs **north of** Phlan | `cited-direction-only` |
| Kryptgarden Forest | DDEP1 p.5 | hilly wood, Sword Coast region, **north of Waterdeep**; bounded by the **Sword Mountains N** and the village of **Westbridge E** | `cited-direction-only` |
| Flooded Forest | DDEX1-7 p.5 | **near Mulmaster** | `cited-adjacency-only` |
| Thorn Island / Sokol Keep | DDEX1-2 p.2 | island **near the harbour of Phlan**; the keep sits on it | `cited-adjacency-only` |
| Aleston + raid sites | DDEX1-3 p.6, p.9 | coastal sites **~one day's travel apart**, **a day's ride from Phlan** along the coast | `cited-days-only` |

**Kryptgarden is the exception worth noticing:** DDEP1 is the only Season 1 adventure that is *not*
Moonsea. It anchors to **Waterdeep — your origin, the strongest point in the tree.** It is the one S1
location that could be placed today without touching the east block. It still has **no cited distance**,
only a bearing, so I did not place it either. Your call whether a bearing-only `derived` placement north of
Waterdeep is worth having.

---

## 2) THE RATE QUESTION — RESOLVED, and it is NOT a scale conflict

*(This section was wrong on first pass. Corrected after reading the full DDEX1-9 p.13 passage.)*

> King's Pyre is situated on the coast, about 40 miles west of Phlan. Traveling overland, the characters
> must brave the Iron Route, a rugged trail through wild grasslands and along wind-whipped cliffs. The
> party arrives after 2 days of travel. **By sea, the journey takes 14 hours.**

**The 40 miles is a POSITION, not a route length.** Two confirmations:

1. **The sea leg checks out as displacement.** 40 mi / 14 hrs = **2.9 mph ~ 2.5 knots** — correct for the
   small chartered sailboat. A winding road-length would not produce a sane sailing speed.
2. **The overland route is explicitly longer than 40.** Same page: the Iron Route *skirts around the site,
   so characters on foot must follow the shore for a few miles to reach their destination.*

So overland is **>40 mi in 2 days, i.e. >20 mi/day** — worse than my first reading, not better.

**And that is still fine, because no good roads are required.** SRD Travel Pace (`rules.json`, Travel Pace
table): **Fast 30 mi/day · Normal 24 · Slow 18.** Twenty-odd miles/day sits *between Slow and Normal* —
exactly what a rugged trail through wild grassland should yield. DDEX1-9 is applying the SRD pace table
correctly, not asserting a map scale.

### The correction
This is a **traveller-type** difference, not a ruler conflict:

| traveller | rate | source |
|---|---|---|
| loaded trade caravan | **11.76 mi/day** | 2e trade tables x the Fonstad pin (the Exchange's adopted ruler) |
| adventuring party, foot, rough terrain | **~20 mi/day** | DDEX1-9 p.13, consistent with SRD Slow-to-Normal |
| adventuring party, foot, Normal pace | **24 mi/day** | SRD Travel Pace table |
| coastal sail, small craft | **~2.9 mi/hr** | DDEX1-9 p.13 (40 mi / 14 hrs) |

**The Fonstad ruler is untouched.** The pin stays. What is needed is a per-traveller rate table — which the
voyage subsystem wants regardless, since DT-as-friction is priced per traveller.

Consequence for this dataset: the `cited-days-only` records (Kabel's Hill, Rythnax, Aleston) are now
convertible **once you pick which traveller their day-figures describe.** Adventure text describes parties,
so the SRD pace table is the natural reading — but that is your ruling, and I have left `mi: null`.

### BONUS: canon prices both media on one pair
Phlan -> King's Pyre is **2 days by land / 14 hours by sea**, same endpoints, same page. That is a cited
land-vs-sea comparison on a single edge -- the exact shape of the alternate-medium system -- and it is the
only instance of it I found in Season 1.

## 3) A REAL EDGE CANDIDATE FOR YOUR MOVE (a)

DDEX1-9 p.1 defines the **Iron Route** as *an important trade road east of Phlan*. That is a named,
cited overland road running east out of Phlan across the north Moonsea shore.

Your move (a) wanted the Black Road / Anauroch connector to replace the 880-mi guess. The Iron Route is
the same class of object at the far end of that corridor, and Season 1 hands it to you already named.
It does not carry a distance in these adventures, but it establishes that the edge exists in canon.

---

## 4) SCOPE QUESTION I DID NOT DECIDE FOR YOU

You said "all locations that are named." I extracted all 64 and classified them, but the handoff says the
router targets **adventure start locations, not every flavor locale**. Those two instructions point
different directions, so I tagged rather than filtered:

| kind | n | examples | belongs in a travel graph? |
|---|---:|---|---|
| `region` | 2 | Moonsea, Sword Coast | already nodes |
| `settlement` | 9 | Phlan, Kabel's Hill, Melvaunt, Westbridge, Aleston | **yes** |
| `site` | 6 | Sokol Keep, King's Pyre, Thorn Island | **yes** |
| `feature` | 12 | Quivering Forest, Twilight Marsh, Dragonspine Mtns | probably — they are areas, not points |
| `route` | 3 | Iron Route, Phlan Path, Farmer's Trail | **edges, not nodes** |
| `interior` | 15 | Mantor's Library, Podol Plaza, Laughing Goblin Inn | **no** — inside Phlan; a coordinate is meaningless |
| `sublocation` | 17 | East Tower, Cliff Caves, Renon Farm | **no** — inside a site |

My read: `settlement` + `site` are the router's targets (17 entries), `route` becomes edges, `feature`
needs a ruling on whether an area gets a centroid, and the 32 `interior`/`sublocation` entries are
reference data that should never get coordinates. **Your call — that is a design ruling, not mine.**

---

## 5) PARSER DISCIPLINE — the count, verified two ways

Per the never-accept-the-first-count rule, I ran two independent extractions and neither was trustworthy alone:

- **Pass 1** (block-sorted, column-aware): **131** candidates. Missed drop-cap-initial names entirely —
  no *Laughing Goblin Inn*, no *Mantor's Library*, no *Podol Plaza*, no *Zhentil Keep*.
- **Pass 2** (position-sorted): **199** candidates. Caught those, but corrupted them — `KKabel's Hill`,
  `Laaughing Goblin Inn`, `Mantorr's Library` (the PDFs render drop caps as a duplicated glyph).

Each pass had defects the other did not. Union + drop-cap normalisation gave the working pool; **had I
taken either count as the answer I would have shipped a materially wrong list.** Logging it as another
instance for `COMPILER_PRINCIPLES.md`.

**Known residual defect:** pages with sidebars interleave columns in both passes (visible as garbled runs
like *"wland tones T F The two day trip"*). I read every geographic claim in this document out of clean
surrounding text, but I cannot promise the 64 is exhaustive — a name that appears only inside a garbled
sidebar would have been missed. Treat 64 as a floor, not a total.

---

## 6) RULINGS NEEDED (yours)

1. **Phlan's coordinate** — the blocker. Cited number, or accept a `derived*` placement that inherits the
   880-mi east anchor, or leave S1 relative until move (a) lands.
2. **Per-traveller rate table** (the rate question is resolved — see §2; the ruler is safe). Adopt the
   SRD Travel Pace table for parties alongside the 11.76 caravan pin, plus the DDEX1-9 sea rate?
3. **Scope** — do `feature` areas get centroids? Do `interior`/`sublocation` stay out of the graph entirely?
4. **Kryptgarden** — place it bearing-only off Waterdeep as `derived`, or hold for a cited distance?
5. **Iron Route** — add as a named edge with `mi: null` now, or hold until it carries a distance?
