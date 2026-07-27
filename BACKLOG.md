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

## D · FACILITY MINTS — 25 remaining

Done: Arcane Study, Observatory, Archive, Armory (4/29). Basics 6/6.
Next at L5: Barrack · Garden · Library · Sanctuary · Smithy · Storehouse · Workshop

---

## E · REGION GRAPH — PARKED

Complete and self-contained in `research/regions/`. 74 locations, 13 roads, tree untouched at
28 nodes / 31 edges. Blocked on the ruler repin and on the Black Road mileage, which is **not on
the open web** — it needs the 2e *Anauroch* sourcebook. Nothing else depends on it. Leave it.

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
