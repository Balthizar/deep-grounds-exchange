# Bastions After Dark — the sandbox with teeth

**Status: parked. Not built, not scoped for build.**

Consolidated 1 Aug 2026 from material scattered across `FINDINGS.md` (26–28 Jul entries, five
separate blocks) and the 1 Aug design conversation. **This is the graduation the FINDINGS notes
themselves recommended:** *"When ready, graduate the After Dark notes out of FINDINGS into a
dedicated design doc structured as the supplement's skeleton (philosophy → each subsystem as a
chapter with rules AND rationale)."*

Original entries remain in FINDINGS where they were written; this is the assembled design, not a
replacement record.

---

## 1 · Why it exists

**The AL bastion has no teeth, and cannot have any.**

The owner's position, stated plainly (1 Aug): *"the bastion has no risk, and a game without risk is
not a game. Right now the bastion is a supply house that is a little bit of a gold sink and that's
it."* Every mechanism that would give it stakes is unavailable — not because it is bad design, but
because the DMG's model is the one AL requires, and substituting a better one is an AL violation
however much better it is.

**The reason the DMG is soft on loss is structural, and it is the whole argument for this document:**
the books assume a home-game DM who supplies what the rules leave out. **Organized play has no such
DM.** If the platform does not model loss, loss never happens, and the bastion is riskless forever.

So the design that should have shipped gets built somewhere it is allowed to exist.

---

## 2 · The founding constraint — the firewall

**After Dark produces NOTHING for an AL character.** No gold, no items, no downtime, no eligibility,
no provenance. That is the only reason it can exist alongside an AL-compliant platform: **AL has no
jurisdiction over a toy that awards nothing.**

- **Total state separation is architectural, not incidental.** The sandbox reads AL bastion state and
  writes only sandbox state. That boundary wants to be **gate-enforced** — one careless action
  writing a destroyed facility back to a legal character is the failure that matters.
- Anything GAINED after dark must never become AL-legal. The provenance model already thinks in these
  terms (`itemClass`, `CRAFTED`, `UNTRADEABLE`), so an **`AFTERDARK` item class that trade and
  verification both refuse** is likely a small change rather than a new system.
- **A hidden entry route is flavour, never the boundary.** The Easter egg (§7) is charm; the firewall
  is code.

---

## 3 · The mechanics AL will not allow

### 3.1 The attack model that should have shipped

Recorded in `engine.ts` above `rollAttackOnes`, and filed as a design complaint 26 Jul. The DMG's
model is a flat on/off Armory flag, a fixed 6d6 / 4d6 pool decoupled from defender count, and Walls
as a bare die-count cut — *three unrelated abstractions for what is one idea: are my people equipped,
and did they get hurt.*

**The replacement:**

- **One die per defender**, not a fixed pool.
- **1d6 unarmored / 1d8 armored**, tracked **per defender** rather than as a whole-armory flag.
- **Walls = attackers roll with disadvantage** — reroll each die, take the worse-for-attacker (higher)
  die, since low means harm. A fictional handle rather than a die-count cut.
- **A 1 kills** that defender. **A 2 destroys that defender's gear** — they revert to d6 until
  re-equipped.
- **Dynamic per-defender restock**, so you pay for what you actually lost rather than the DMG's
  whole-armory expend "regardless of how many you lost".

### 3.2 Destruction and loss — three distinct events

The AL code conflates these under "raze". They are not the same thing:

| event | who | timing | loss |
|---|---|---|---|
| **Tear down** | you, voluntarily | all the time in the world; you move your things out | none |
| **Razed / destroyed** | an enemy force | no time to move anything | **total** — staff die, facilities burn, contents lost |
| **Looted** | neglect | gradual; staff abandon, site is stripped | already modelled |

> **Naming defect flagged in AL code:** the shipped `RAZE_BASTION` action is actually *tear down* and
> is mis-named — you do not raze your own keep; razing is done TO you. Rename candidate:
> `TEAR_DOWN` / `DEMOLISH`.

**THE VAULT** — *"a fireproof box you can put stuff in that is unable to be opened by anyone."*
General-purpose (any item, not just books) and total (survives every loss path — fire, raze, invading
army). **It is the only protection against destruction loss, and that is its entire reason to exist.**

### 3.3 Supply lines, not bad luck (1 Aug)

The mechanics the owner named for the sandbox are all **consequences of earlier choices**, which is
what "teeth" actually means. A gold sink with a death clock is a slower gold sink; a gold sink where
*what you spent on determines what survives* is a game.

- **Each defender must be individually supplied with gear** — the per-defender armor of §3.1 with a
  cost attached.
- **Household staff die twice as fast as defenders.** They are not fighters and the sandbox says so.
- **Objects in a room under attack are lost** — gear, books, stock. What is in the Vault is not.
- **The bastion can run out of money**, and can be **destroyed**.
- **Player-versus-player attack** is on the table here in a way it never can be in AL.

> The staff clause is the sharpest of these, because AL hirelings are already **named, aged people
> with roles and beds**. Making them mortal turns every one of those names into something you can
> lose — and the housing model already records who was home.

### 3.4 Facility sizes — start cramped, earn growth

**A HOUSE RULE, not a bug fix.** The DMG assigns each special facility a fixed listed Space (Arcane
Study roomy, Barrack vast, Sanctum vast — verified verbatim), and a facility arrives AT that space.
Starting them cramped would shrink them below rulebook size = an AL violation.

After Dark starts **everything cramped** and grows Cramped → Roomy → Vast by player investment. This
is one of the clearest reasons the sandbox exists: to run the size and economy model the owner wants
without breaking AL.

### 3.5 Scriptorium — the full class spread

The AL Scriptorium ships DMG-strict: its scribe is one of **two** classes (Novice Mage → Wizard
scrolls; Acolyte → Cleric scrolls). The DMG grants "Cleric or Wizard" only.

After Dark is unbound by the DMG, so its Scriptorium scribes **every class list**, with up to **four
scribe posts** plus an apprentice:

| post | 2e-style title | scribes |
|---|---|---|
| Wizard | Novice Mage | Wizard spells |
| Cleric | Acolyte | Cleric spells |
| **Warlock** | Initiate | Warlock-only spells |
| **Druid** | Aspirant *(2e starting title, confirmed)* | Druid-only spells |

Sorcerer and Bard are not separate options — no meaningful class-only scroll list. Each post is its
own class choice presented as candidates, the same hire mechanic as AL.

---

## 3.6 · The labour economy, and the Underdark question (Frank, 1 Aug)

**PARKED HERE BY A RULES FINDING, not by squeamishness.** The question arose from the Underdark
demographics: the published Menzoberranzan figures give **more enslaved people than free** — 28,000
against 25,000 — so a keep standing in the Underdark draws from a population most of which cannot be
hired in the ordinary sense.

### What the DMG actually says, checked

Frank's reading was that the estate covering hireling costs could extend to purchase. **The text is
narrower than that:**

> *"Each special facility in a Bastion generates enough income to pay the SALARY of its hirelings."*
> — Bastions.md:286-287

**Salary, not upkeep and not acquisition.** The book's model is a wage relationship, and a purchase
price is not a salary under any reading that survives contact with the sentence. There is no
acquisition clause anywhere, because the DMG's design is that hirelings are FREE to acquire — they
arrive with the facility, they are replaced at no cost after Lost Hirelings, and the Criminal
Hireling bribe is the only place money ever changes hands over a person, framed as keeping them out
of a cell.

**So a purchase mechanic is an ADDITION, not a reading.** That is allowed, and it is exactly the
class of thing this document exists for — but it cannot be labelled DMG-derived, and under the
Exchange's own standards that distinction matters more than whether it is permitted.

### Frank's ruling on why it belongs here rather than nowhere

> *"It's a cultural aspect of the society developed by the person who created the world, therefore it
> needs to be respected and honored and included where necessary."*

The Underdark's slave economy is published canon, in the sourcebooks and the novels both. Refusing to
represent it would be editing somebody else's setting; building a purchase screen into an
AL-compliant organized-play platform is a different act with a different audience. **After Dark is
the venue where the setting can be represented at full strength**, behind the firewall, with
Ronaldo's in-fiction framing and the inverted palette already saying which world you are in.

### It joins a larger subsystem, not a feature on its own

Frank's framing, and it is the right one: this lands with **the whole labour economy**, whenever that
gets built —

- **choosing which hirelings to hire** rather than being handed whoever the room generates
- **managing wages** at specific levels of wealth
- and the acquisition question above, as one option among those

The AL bastion has none of that: hirelings arrive, are free, and are replaced free. A sandbox with a
real economy needs all three, and they are one system rather than three features.

### What ships in the AL layer meanwhile

**The demographics stay exactly as sourced.** They are the honest representation and they are canon —
the drow, the goblins, the grimlocks, the quaggoths, the whole shape of the place. Hiring reads as
WAGES, because that is what the book says it is, and somebody who arrives at a gate looking for work
is by that act free. Escape, manumission and buying one's own freedom are all canon, and they are a
better story than a purchase screen anyway.

---

## 4 · Movement, aid and the turn economy (1 Aug)

**This is where After Dark and the voyage design meet.** See `VOYAGE.md` for the movement model
itself; what follows is what changes when the sandbox charges for it.

- **In AL, a call for aid must resolve in one turn** (ALPG: orders taking seven days or fewer benefit
  this session's characters). The bastion is "suddenly in the right place", the aid happens, and
  nothing is charged for the distance.
- **The Chronicle records the true journey anyway** — sail time, the march, the aid, the march home.
- **After Dark converts that recorded number into turns.** 7 days = 1 turn. Aid becomes a decision
  with a defensible "no": *do I spend seven turns to send two people?* Nothing in the AL bastion
  currently rewards declining anything.
- **Each turn spits out a line report** — *"they made Voonlar by the fourth day and the roads were
  bad"* — so the player follows the journey rather than waiting out a counter. Mechanically this is
  `fac.wip` (shipped 31 Jul for crafting) pointed at people instead of ironwork: pay up front, accrue
  per turn, the owner is locked until it completes, resolve into an outcome.

**Consequence for the AL build, and it is the actionable one:** the base system should compute
journey time **now**, even though it charges nothing for it. If it does, After Dark is arithmetic
over a number that already exists. If it waits, After Dark has to build a geography engine before it
can charge for anything. One is a mode; the other is a fork.

---

## 5 · The Hammurabi frame (1 Aug)

The owner's own reference, and it is the right one. What made *Hammurabi* work in thirty lines of
BASIC is that **every number was a person.** Grain fed people or it did not; the plague was not a
modifier, it was a third of your city.

The bastion already has that shape and the pieces are built — named, aged staff with roles and beds;
defenders who can be equipped or not; a housing model that knows who was home. The step from there to
*"the winter was hard and Nessa Fairwind the cook did not see the spring"* is small, and it lands
harder than any hit-point total.

**Text-only is the correct medium, not a limitation.** Hammurabi had no graphics either. A bastion is
a **report** — the week happened while you were not looking and now you are reading what became of
it. That is the same shape as the library books: an artifact you receive rather than a scene you
watch. The life-tasks table and the reactions system are already doing the Hammurabi job; they simply
have no stakes attached yet.

---

## 6 · The book

**"Better Bastions: Your Fortress After Dark"** — a DM's Guild supplement (owner's plan, 28 Jul).

- **DM's Guild is the correct venue**: it licenses Forgotten Realms + D&D IP, so the supplement may
  reference the DMG's system and name Realms deities and places directly.
- **Collection discipline:** keep logging the gripes-with-reasoning as they surface. Each is a future
  book section. **Do NOT build the manuscript until the system is done** — the book is the OUTPUT of
  finishing, harvested from FINDINGS, not a parallel task.
- Structure as philosophy → each subsystem as a chapter with **rules AND rationale**. This document is
  that skeleton.

---

## 7 · Ronaldo, and the door

**The discovery seed.** Ronaldo, the market vendor, very subtly seeds the phrase *"after dark"* into
ordinary sales patter — *"come back after dark, I might have something"*, *"prices run different
after dark"*. Merchant turns-of-phrase a player reads past at first, that accumulate until they think
*wait — he keeps saying that*, and try `/afterdark` in the URL. **The Easter egg announces its own key
without admitting it is one.**

**Implementation discipline — the subtlety IS the feature:**

- **Rate-limited.** A whisper, not a billboard. NOT every transaction.
- **Always in character.** Never explanatory. Ronaldo must never seem to know he is leaking anything,
  and must never say *"you should go after dark"*.
- The word works by **repetition, not emphasis.** A heavy-handed version ruins it.
- Never states it is a game or a simulation — only that certain things happen after dark.

**The doorkeeper.** Ronaldo is also who greets you on the other side. He leaked the password, so of
course he is waiting — **the reveal is that the leaking was never accidental**; he was inviting the
person sharp enough to notice. On arrival he explains the system and states the guardrails IN
FICTION: *"this won't touch your real fortress, this won't touch your real character — this is
something built just for you, the one smart enough to find it."*

**That greeting is load-bearing.** It is where the firewall of §2 is promised TO THE PLAYER, delivered
as warm dialogue rather than a disclaimer. It must be unambiguous. Ronaldo is the single consistent
voice across both halves — the merchant who sells legal gear by day and runs the after-hours game by
night.

**UI:** After Dark renders as a **NEGATIVE of the AL bastion palette** — inverted colours — so the
sandbox is instantly, viscerally distinct. Doubles as a soft safety cue: you can never mistake which
world you are in at a glance. (Reinforces the firewall; it is never the firewall itself.)

---

## 8 · Status and dependencies

| | |
|---|---|
| **status** | parked. Not built, not scoped. |
| **gates the AL build?** | **No.** Owner confirmed 19 Jul the chronicle system does not gate facilities, and the same holds here. |
| **depends on** | `VOYAGE.md` (movement + journey time) · `CHRONICLE.md` (the timeline the turns are counted against) |
| **needs from the AL build** | journey time computed but uncharged (§4); the `AFTERDARK` item class (§2) |
| **owner rulings still open** | how an attack escalates to total loss · the precise "all defenders then all staff" sequence · frequency · how Walls and the Vault change the odds |

## 9 · SIMULATED COMBAT FROM REAL STAT BLOCKS (Frank, 2 Aug)

> *"There is application for these dozens of unique species that we have been adding, but I cannot
> apply it to the legal side. I have to apply it to the after dark side — where instead of the
> defenders running off a die roll of a d6 or a d8, we just simulate combat and we use the stat
> blocks of the people who are hired as the stat blocks for the defenders and the attackers, because
> we're going to be generating the attackers off the same list."*

**Parked here deliberately, and the reason is the AL-legal boundary.** The DMG's Attack event is a
die roll: *"for each Bastion Defender, roll a d6"* and ones are casualties. That roll is the rule, it
is what an AL character's bastion is entitled to, and the Exchange does not get to replace it.

But by 2 Aug the platform knows a great deal that the die roll throws away:

```
55 peoples with voices · 86 role entries · size, grip, force, mind and hazard for every one
attackers already generated from the same demographic tables as defenders (ATTACKER_KINDS)
a chosen-hire system that can put six devil ranks or six kinds of undead on a wall
```

**Both sides of an Attack are already drawn from the same list.** A simulation would use the SRD stat
blocks the peoples already correspond to, resolve the fight, and produce casualties from the outcome
rather than from a d6 — which would make an Oathbreaker's wight garrison mechanically different from
a keep full of hired swords, instead of cosmetically different.

**What makes it After Dark rather than a feature:** it changes the NUMBER of dead. Everything the
Exchange has built on top of the DMG's events so far has been cosmetic by construction — Lost
Hirelings picks who leaves and never how many; the giff stand-down picks whose name is on the
casualty and never the count. This would pick the count, which is precisely the line the legal side
cannot cross.

Depends on: the species work (done), ATTACKER_KINDS (done), SRD stat block linkage (not started).


