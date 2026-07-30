# The Sapling Dollar — why `BASTION_FOUND_COIN` exists

*A provenance note, written down on purpose so the reason survives. This is lore, not engineering —
if you are cleaning up files, this one stays. It is here to be remembered, not maintained.*

---

## What happened

The author was working in the yard, digging up a tree sapling that had come up somewhere it had no
business growing. The ground produced **a dollar.** An actual dollar bill, in the dirt, under a
plant that shouldn't have been there. No explanation for either the sapling or the coin. It just
happened.

## Why it became a game feature

It started as the standing rebuttal to a common complaint — that randomly-spawned treasure is
unrealistic. The point of the comeback: **the real world is lossy.** People drop and bury and
forget things; roots and frost and water push old coins back up through the soil. Value does not
only sit where somebody deliberately placed it. A provenance-free coin coming out of the ground is
just the world being honest about its own history.

And that turned out to be quietly funny *for this project specifically* — because the whole app is
a ledger obsessed with where every item came from and who can vouch for it. The yard did the one
thing the ledger exists to prevent: it minted an item and signed nobody's name to it.
**`verified: false`.** A dollar with no chain of custody, straight out of the dirt.

## What it is in the code

`BASTION_FOUND_COIN`, resolved inside the `allwell` (All Is Well) bastion event.

- A **separate, low roll** (5%) layered on a quiet week — deliberately NOT a 13th entry in the
  All-Is-Well flavour table, because that table is a real **d12** and its length is asserted. The
  coin is its own independent event so it stays rare and the die stays a die.
- **1d4 silver**, credited as 0.1–0.4 gp. On the house scale **1 gp = 10 sp**, so the real-world
  dollar that started all this is **one silver, not one gold**. Mechanically it is nothing — under
  half a gold. That is the entire point.
- The reward is announced in its **own universal sentence**, appended after whatever quiet-week
  flavour rolled: *"While in the ordinary performance of their duties, someone discovers N silver
  piece(s) in the dirt. It's not much. It still counts as a good day."*

## The design goal, stated plainly

It is not meant to be lucrative or balanced. It is meant to feel like **a small prize** — the tiny
jolt of *"I found money."* Everything about the tuning (low chance, trivial amount, but a *varying*
roll so it lands like a win) serves that one feeling and nothing else.

*Guarded by assertions in `p11_crafting.cjs`: the 1d4 range, the 0.1–0.4 gp valuation, the low
chance, and the d12 integrity of the flavour table it rides alongside.*
