# Road-first pass — FINDINGS · RED-PEN

Channel: FR Wiki **article** pages via search/fetch. Category pages return **402**. The container network is
whitelisted to package registries only, so **there is no bulk scrape** — this is hand-work, one road at a time.

Output: `faerun_roads.json`. Tree nodes/edges still **untouched** (28/31).

---

## 1) THE HEADLINE: your ruler's pin is probably the error, not the days table

I found the source table your `days` edges came from — the 2e trade-route day counts, cumulative from
Waterdeep. It reproduces your tree exactly:

| leg | day delta | × 11.76 | your tree |
|---|---:|---:|---:|
| Waterdeep → Leilon | 11 | 129.4 | **129** |
| Leilon → Neverwinter | 6 | 70.6 | **71** |
| Neverwinter → Port Llast | 2 | 23.5 | **24** |
| Port Llast → Luskan | 4 | 47.0 | **47** |

So the pipeline is confirmed: 2e days × 11.76 mi/day. The table is not the problem. **The 11.76 is.**

### The calibration

Wherever canon states a mileage for a leg that also has a day-count, the implied rate is far higher:

| leg | cited mi | days | mi/day | source |
|---|---:|---:|---:|---|
| Leilon → Neverwinter | ~100 | 6 | **16.7** | FR Wiki: High Road |
| Neverwinter → Port Llast | ~35 | 2 | **17.5** | FR Wiki: High Road |
| Everlund → Yartar | 270 | 13 | **20.8** | FR Wiki: Evermoor Way |
| Silverymoon → Yartar | 320 | 18 | **17.8** | FR Wiki: Evermoor Way |
| *Silverymoon → Everlund* | *50* | *5* | *10.0* | *outlier — see below* |

**Mean ≈ 18.2 mi/day. That is 1.55× your pin.** Four independent legs on two different roads agree.

### Why I think the pin, specifically, is what broke

Your 11.76 comes from pinning **Waterdeep → Neverwinter = 200 mi** across 17 days. But canon says
**Leilon → Neverwinter alone is ~100 mi**, and Leilon sits at day 11 of those 17. Take both figures at once:

- Waterdeep → Leilon: 100 mi / 11 days = **9.1 mi/day**
- Leilon → Neverwinter: 100 mi / 6 days = **16.7 mi/day**

A caravan does not travel at half speed for the first two-thirds of one road and then double. **The 200-mi
Waterdeep→Neverwinter figure cannot be reconciled with the cited Leilon→Neverwinter figure.** One of them
is wrong, and the one that's isolated — with no corroborating leg anywhere — is the 200.

Repin on Leilon→Neverwinter instead and you get ~16.7 mi/day, which puts Waterdeep→Neverwinter at ~284 mi.

**The consequence is large: essentially every `days` edge in the tree is short by roughly a third.** That's
the west side — the part treated as solid. Your Evermoor Way reads 212 mi against canon's 320.

I am not repinning. That is your ruler and your ruling.

### The outlier, flagged not buried
Silverymoon → Everlund at 50 mi / 5 days gives 10.0 mi/day, which is *below* your current pin. It's cited to
the same reference as the 320 and 270 figures, and 50 + 270 = 320 checks internally — so the aggregate is
sound even though that one short leg reads oddly. It may be a genuinely slow mountain-approach stretch.
Worth your eye rather than my averaging it away.

---

## 2) Rate table (per traveller, not per map)

| traveller | mi/day | source |
|---|---:|---|
| loaded trade caravan — current pin | 11.76 | Fonstad, pinned Wd→Neverwinter=200 |
| loaded trade caravan — recalibrated | **18.2** | this pass, 4 cited legs |
| adventuring party, foot, rough terrain | 20 | DDEX1-9 p.13 |
| adventuring party, SRD Normal pace | 24 | SRD Travel Pace table |
| mounted, hard ride | 50 | Trade Way: Daggerford → the Way Inn, ~100 mi / 2 days hard ride |
| coastal sail, small craft | ~2.9 mi/hr | DDEX1-9 p.13 |

Note the recalibrated caravan rate and the party-on-foot rate now sit close together (18.2 vs 20), which is
what you'd expect. Under the old pin they were 1.7× apart, which was the tell.

---

## 3) Waypoints canon has that your tree doesn't

- **Long Road** — Rassalantar, Amphail, **Westbridge**, Xantharl's Keep.
  *Westbridge is the same village DDEP1 names as Kryptgarden Forest's eastern bound.* Kryptgarden anchors
  to the Long Road, on the strong west side — it is not floating.
- **High Road** — Thornhold, Mere of Dead Men, Iniarv's Tower, the Triboar Cutoff junction.
- **Dessarin barge** — Ironford, the Stone Bridge, Nesme. (Full barge run: Waterdeep/Zundbridge → Ironford 6 d
  → Stone Bridge 14 d → Yartar 20 d → Nesme 30 d → Silverymoon 43 d. **Downstream is stated at 2/3 the time**
  — a directional edge, which the medium system will want.)
- **Evermoor Way** — Calling Horns, where Jundar's Pass joins.
- **An entire road is missing: the Blackford Road, Luskan → Mirabar, 7 days.**

Also new sea data, directional: Waterdeep→Luskan 6 d but Luskan→Waterdeep 8 d; Waterdeep→Baldur's Gate 9 d
but Baldur's Gate→Waterdeep 7 d. **Your sea edges are currently symmetric. Canon's aren't.**

---

## 4) The Black Road: still open, and I could not close it

No cited mileage exists on the wiki. Topology only — Llorkh at the western end, Zhentil Keep/Teshendale at
the eastern, through Parnast, Vuerthyl, Addas Babar, Bhaerlith, Olomaa, near Dekanter. The primary source
would be the 2e **Anauroch** sourcebook (Greenwood, 1991), which I can't reach through this channel.

So the anchor chain still stands one number short:

`waterdeep →129→ secomber →106→ loudwater →82→ llorkh →???→ zhentilkeep →70→ phlan`

(Those three western figures are the *old* rate and would move under a repin.)

Corroboration found for the chain's shape: Llorkh is described as the westernmost Zhent caravan outpost,
with caravans running on to **Loudwater, where barges take goods upriver** — confirming your loudwater–llorkh
edge and adding a river medium at Loudwater.

---

## 5) Not adopted

- Giant in the Playground forum: 420 mi of Anauroch desert — **fan calculation**
- theparchmentpaladin.com travel matrices built on AideDD's interactive map — **fan calculation**, though
  it is the most complete point-to-point mileage set that exists for Faerûn, if you ever want it as an
  explicitly-labelled non-canon fallback layer
- Obsidian Portal "good 50 miles" Phlan–Melvaunt — **fan**; cited figure is 55

One genuine ambiguity worth knowing: the wiki notes **Trade Way and Coast Way are used interchangeably**
across sources, and that Fonstad's *Atlas* and the 2e FRCS disagree about which stretch carries which name.
Your tree's Trade Way is `cited-3e`. That naming conflict is live.

---

## 6) RULINGS

1. **Repin the ruler?** 11.76 → ~18.2, or repin specifically on Leilon→Neverwinter (16.7). Either rescales
   every `days` edge by ~1.5×. This is the big one.
2. **Adopt cited miles over days-derived miles** where both exist (Evermoor Way, High Road)? That would mix
   provenance grades within one road unless you convert the whole road.
3. **Add the missing waypoints and the Blackford Road?**
4. **Make sea and river edges directional** — canon gives different times each way.
5. **Anchor Kryptgarden at Westbridge on the Long Road?**
6. **Black Road** — hold open, or accept a `derived*` placeholder until the Anauroch sourcebook is reachable?
