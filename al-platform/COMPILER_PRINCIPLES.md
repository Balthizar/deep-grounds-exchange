# COMPILER_PRINCIPLES.md

Portable rules for the AI agent working in this repo. This is the "compiler" half of the harness:
the gates catch a bad **result**; these principles catch the bad **reasoning** before it produces
one. Each rule is a scar — it exists because a specific mistake was made, and it names the mistake
so the next instance does not repeat it. Read this before working.

A rule here only works if it is read and heeded, which is a real limit of instructions-to-an-agent
versus a hard gate. That is *why* both layers exist: the gate is the backstop that does not depend
on the agent's discipline; the principle reduces how often the backstop has to catch it. Neither
alone is enough.

---

## P1 — Measure observed behaviour, not raw source text. Read the decomposed truth; do not re-derive a shakier copy of it.

**The rule.** When a verified source of truth already exists in decomposed form — a knowledge
base, a build artifact, a render pass, an index you already produced — USE IT. Do not reconstruct
a worse version by scanning raw text (grep, string-presence, "does this name appear somewhere").
A gate must measure the thing it claims to measure, by its structure, not by whether a matching
string happens to appear in a file. If you find yourself grepping source to answer a question the
decomposed data already answers, stop: that is the crude-tool failure.

**Why it matters.** Raw-text scanning produces the worst kind of gate error — a **silent
false-green**: it reports something verified when it is not, because a string appeared in a
comment, a type union, a helper, or a disabled path. A false-negative (flagging a real thing as
missing) is harmless and self-correcting; a false-green is the exact bug this whole harness exists
to kill.

**Originating bugs (dated 27 Jul 2026):**

- **Reachability, first cut.** The gate asked "does the action name appear as a quoted string
  anywhere in a non-reducer file." It reported **9** unreachable actions. Rebuilt to measure the
  real dispatch shape — a `type:` literal inside an actual `dispatch({...})` call or a confirm
  modal's stored `action:{type}` — the true number was **17**. The crude version was passing **8
  genuinely-unwired actions as reachable**: `RAZE_BASTION`, `REFUSE_CALL`, `REMOVE_GIFT`,
  `UNRETIRE_CHARACTER`, and the `VERIFY_*`/`REJECT_*` family, each counted "reachable" only because
  its name appeared in a comment or a nearby string. A gate that lies about 8 of 22 is worse than
  no gate, because it is trusted.

- **"Never accept the first count."** Parser extractions were repeatedly counted a single way and
  believed. Every count must be verified two independent ways; a discrepancy is investigated, not
  papered over. Same root cause: trusting a cheap measurement of a thing instead of the thing.

- **Fixture accounts.** Assertions named specific seed accounts (`acc_aldric`) as "a stranger,"
  which repeatedly resolved to the very account under test — because the account was picked by
  name (raw literal) instead of derived by role/relationship (the actual property being tested).
  The anti-literal gate now forbids the literal outright. Same root cause: naming a particular
  thing instead of measuring the type.

**The tell, in one line.** If the answer already exists in something you decomposed, and you are
about to grep for it instead, you are about to repeat P1.

**Further instances (28 Jul), both the same root:**

- **The "no event flag" claim.** Asserted to Frank that nothing in the code distinguished an
  event item from a play item. Wrong: `Seal` (src/lib/ui.tsx) has keyed gold-vs-red on
  `itemClass === "EVENT_CERT"` the entire time — gold for event awards/certs, red for earned-in-
  play, plus `?` pending and `⚑` under-review. The claim came from memory instead of a source
  read. The rule is not only for gates: **do not describe the system's behaviour from memory when
  the source is one grep away.** Read `Seal`, then speak.

- **Reachability's indirect-dispatch blind spot.** The gate measured "a `type:` literal in a
  `dispatch()` call" and flagged the nine item-verification actions as PENDING — but
  `VerifyCard` (src/sessions/ui.tsx) dispatches every one through a lookup table:
  `dispatch({ type: A[0] })` where `A = { slot:["VERIFY_SLOT_ITEM", ...], ... }[kind]`. The names
  live in the table literal, not the call, so the literal-only scan couldn't see them — a P1
  false-NEGATIVE (harmless in direction, but it sent the agent to "build" a screen that already
  existed). Fix: the gate now also harvests action names from the table a dispatched variable
  indexes into. Lesson: before building a screen the worklist says is missing, CONFIRM it is
  missing by reading the feature file — the worklist is a measurement and measurements can under-
  report. The screen existing all along was findable in thirty seconds of reading `VerifyCard`.

**The cost caveat.** The *most* rigorous measurement (e.g. firing every UI handler under jsdom and
observing real dispatches at runtime) is sometimes so fragile it becomes its own liability. P1
does not demand maximum rigor — it demands measuring the *right thing* by its structure rather than
a proxy string. For reachability that meant reading the dispatch call shape, not mounting and
clicking every button. Prefer the tightest measurement that stays auditable; a gate you cannot
trust to be correct is not an improvement over a looser one you can.

---

## P0 — The harness is two artifacts, not one.

The **gates** (`harness/*.cjs`) fail the build on a bad result. This **principles file** is the
instruction layer that stops the bad reasoning upstream. When a mistake recurs, ask which layer
should have caught it. A new *result* bug → a new or tightened gate. A recurrence of the same
*reasoning* mistake in a new location → a principle here, with its originating bug, so it is caught
before it produces a result the next time.

**Further instance (28 Jul, found by external review):** closeout.cjs computed its own "reachable"
set with the crude uppercase-string scan — the exact method reachability.cjs was rebuilt to
replace — so the two tools could disagree, and closeout ran the method P1 forbids. This is the
duplicate-parser trap: when a truth is rebuilt in one place, every OTHER consumer of that truth
must be repointed at it, not left running the old derivation. Fix: reachability.cjs exports its
dispatch-shape detector; closeout.cjs imports and consumes it. One source of truth, no competing
parsers. Lesson: after rebuilding a measurement, grep for every other place that measures the same
thing — the old copy does not announce itself.

**Further instance (28 Jul, my own error, not a gate's).** Asked to confirm the special facilities
had their furniture, I read the SOURCE DECLARATION `export const FACILITY_FURNISHINGS = {}` in
registry.ts, saw empty braces, and told Frank the furniture was GONE and the facilities unfurnished —
an alarming, wrong conclusion that scared him for no reason. The truth: the object is populated at
MODULE LOAD by registerFacility() side effects (`FACILITY_FURNISHINGS[id] = spec.furnishings`), so
the runtime object is full while the literal reads empty. All four specials furnish correctly. This
is the P1 failure in its purest form and worth remembering precisely BECAUSE it was me, not a
scanner: I read raw source text (the empty literal) instead of measuring observed runtime state
(the populated object after registration). The fix that generalizes: when a value is assigned
dynamically (registration, side effect, builder), NEVER judge its contents from the declaration —
instantiate it and inspect the live object. A declaration is a promise, not a measurement. Guardrail
added: a ⚠ comment on the declaration itself so the next reader (human or model) doesn't repeat it.

## The harness must pass its own gate (self-verification)
A verification harness you cannot trust to verify ITSELF is a harness you cannot fully trust on
anything. Every suite checks the product; one suite must check the harness.

ORIGINATING BUGS (both found the instant the self-check first ran, 19 days in):
- `phase1c_bench.cjs` and `closeout.cjs` existed on disk but were not in the `check` gate. One was a
  true orphan-in-spirit; both are legitimately held-out tools — but nothing recorded that, so they
  were indistinguishable from a suite that had silently fallen out of the gate. A test that never
  runs gives false confidence, and the gate was blind to it because suites are wired in by script
  NAME, not by path — the coupling is invisible to every other check.

THE RULE: every suite file is in exactly one of two states, never a silent third:
  1. reached by `check`, or
  2. on a DECLARED exclusion list, each entry carrying a written reason.
Adding a suite without doing one or the other is now itself a gate failure. The exclusion list is
also checked for rot (a name on it must still exist on disk) and the self-check verifies it is
itself in the gate — otherwise a self-verifier that never runs verifies nothing.

THE DEEPER PRINCIPLE (portable): an exclusion is a ruling, and a ruling is written down, never
silent. The harness declares its own edges in the same voice it demands of the product. Point the
tools back at themselves; the recursion closing is the proof the tools are trustworthy.

## Green should be itemized, not trusted (the gate report)
"Gate green" means more when green is enumerated. Every suite already printed its own summary; they
just scrolled past inside the run. `harness/report.cjs` runs the full gate IN ORDER (order parsed
from package.json's `check`, so it can't drift from the real gate), captures each suite's existing
summary line, times each step, and prints one itemized report + a machine-readable last_report.json.
It reimplements no suite — it's a thin reporting layer over output that already existed. Run:
`npm run report`. (It is itself a declared self_check exception: a runner that runs the gate cannot
be a step inside the gate without recursing.)

## The `next` driver: formalized triage, tempered by a CITED profile (not the machine's opinion)
The user rejected a `next` driver that imposes the machine's idea of "best." Instead it formalizes
the triage the user and agent ran by hand a dozen times, from three labeled, never-blended inputs:
work-state, test-state, and LOOSE ENDS (open items carrying no supporting note — the silent ones,
the most dangerous). It proposes the top three next steps, each with a cited why-trail, ordered with
tempering from a behavioral model.

The critical ruling: a behavioral model is inference about a person — the least verifiable input in
the harness. So it obeys the same law as everything else: DECISION_LOG.md records cited decisions
(no inference); BEHAVIORAL_PROFILE.md records patterns that each CITE the log entries supporting
them; the profile only *tempers ordering* and appears in its own labeled column, never blended into
a verdict. A trait that cannot be wrong does not belong in the profile. Files: harness/next.cjs
(mechanical synthesis), NEXT_PROTOCOL.md (the agent flow a script can't do: milestone prompt → read
whether the reply implies deciding → reassure → triage → hand back → log the decision).

PORTABLE: this is the project's second general artifact (after the harness itself) — a formalized,
auditable triage-and-behavioral-awareness layer for AI-assisted work, not specific to this platform.

## Finish-to-DEPTH, not breadth: an open tool means its subsystem is unfinished
The `next` driver first measured BREADTH (counters: minted facilities, sourced subjects) and ranked
"start facility #9" above "finish the started-but-half-built library book generator." The user did
the triage better than the tool, because the tool lacked a distinction the user carries: a facility
with pending book tooling is NOT minted in full, so its subsystem is unfinished, and finishing it
outranks starting any new breadth. "Started but not finished to depth" is the true in-progress state.

FIX (in the user's ordered sequence):
1. FIRST, the miscount: the driver counted every ✅/⬜ in the roadmap file, including prose notes,
   reading 107 against a 100-subject list. Now it counts only numbered roadmap lines
   (/^\s*\d+\.\s*[✅⬜]/), so stray marks in commentary can never inflate the count again. A triage
   tool that mismeasures cannot be trusted to triage — fix the instrument before extending it.
2. THEN the logic: a DECLARED, inspectable IN_PROGRESS_TOOLS list marks a subsystem unfinished; each
   entry outranks new breadth (weight 90, below only a red gate), and starting a new facility is
   explicitly DEMOTED with a cited why-trail while any tool is open.

PORTABLE: when a triage tool and the user disagree, the user's ruling is a new requirement FOR THE
TOOL. Encode it so the tool reaches the user's conclusion next time, rather than treating the
disagreement as a one-off override.

## Derive "unfinished" from structure, never from a hand-seeded list
A hand-seeded list of in-progress work only catches what the user REMEMBERED to seed — worthless
against the thing they forgot they left open. The user's own words: "it is possible I left other
things open I forgot about." So the `next` driver's finish-to-depth input is now DERIVED by
harness/completeness.cjs from the codebase itself:
  - a tool declares an intended target in source ("grows to the chosen 100", library_subjects.ts:118);
  - its actual extent is measured at runtime (24 registered);
  - actual << intended => the tool is unfinished;
  - a subsystem whose source DEPENDS on that tool (engine.ts:912 calls the generator) is unfinished
    by transitivity.
Plus one honest lexical signal: a USER-FACING "coming next / not yet available" string is a promise
to the user that something is incomplete (real, unlike a code comment or flavor prose). This second
signal independently surfaced the workbench item-crafting feature — exactly the "thing I forgot"
case.

Every finding cites the file:line it was read from, so the driver's citation means the recommendation
was genuinely reasoned from evidence, not a fact injected by the agent and read back (the
opinion-laundering failure mode). PORTABLE: when a tool must reason about state, it reads the state,
it does not accept the state as a parameter from whoever is being advised.

## The file that declares the work is part of the work

ORIGINATING BUG (B-44). The batch 9–10 delta zip carried `harness/ledger.cjs`, a new gating suite, but
not the `package.json` that declares `check:ledger` and threads it into `check`. At the source end
everything was correct and green. On the machine that reconstructed from the delta the suite existed
on disk and no gate reached it — a test that never runs, which is worse than no test, because the
gate still reports green while silently measuring less than it claims to.

The class matters more than the instance. A hand-assembled change set carries the files someone
*thought of as the change*. Manifests, lockfiles, script blocks, registry entries and config read as
scaffolding rather than as content, so they are the files that get left behind — and their absence is
invisible from the side that already has them.

PORTABLE: an artifact that only takes effect because some manifest names it is not complete without
that manifest. State it as a packing rule, not a habit: **if a change adds something that must be
declared somewhere to run, the declaration ships in the same change.**

MECHANISED (`tools/pack_delta.js`). The delta packer refuses to build a zip that adds or modifies a
file under `harness/` unless `package.json` is included in the same zip. It is deliberately a dumb
structural rule rather than a clever one — it does not try to work out whether *this particular*
harness file needed wiring, because the cost of including a manifest that did not change is nil and
the cost of omitting one that did is a green gate that is lying.

COROLLARY, and the reason the rule is worth its false positives: `self_check.cjs` caught B-44 in one
run. A guard that makes the gate audit its own completeness is worth more than any individual suite,
because it is the only kind of test that fails when a test is *missing* rather than wrong.

## A CONSIDERED OMISSION IS NOT A GAP — intersex representation (Frank, 2 Aug)

The social model represents sex, gender, incongruence, orientation, relationship orientation and
attraction across 23 written peoples. **It does not represent intersex variation, and that is a
decision rather than an oversight.**

### Frank's reasoning, which is the ruling

> *"We lack proper in-depth research for broad-spectrum species analysis, so I don't want to include
> it on just humans, or just humans and Minotaurs and Dragonborn — because then the species that
> don't have any analogs feel strange. We don't have an intersex rate for ants, which would be the
> closest to a thri-kreen. Dwarf and elf biology are hypothetical and based on my own theory rather
> than canon anyway. Having it representative in only one species, or a very small subset, means it
> is likely more problematic to include than to leave out."*

And the second half, which is the sharper argument:

> *"Externally visible is a big factor. It would immediately adjust people's reactions to that
> individual, and if that doesn't exist then it's not something that would be useful."*

**Most intersex variation is not externally apparent.** The household narration only ever surfaces
what somebody could observe — that is the rule the glimpse tables, the reaction tables and the whole
Layer 2 register are built on. A field nobody could see is a field nobody reads, which is the
write-and-never-read defect arrived at by good intentions.

### And one theory tested and dropped

Frank proposed that intersex conditions might occur less often in species with stronger endocrine
systems, and that dimorphism could stand in for endocrine strength — and asked to be told if that was
wrong. **It probably is.** Most intersex conditions are genetic rather than endocrine-strength
failures: CAH is an autosomal recessive enzyme deficiency, Klinefelter and Turner are chromosomal
nondisjunction, AIS is a receptor mutation. None of those become rarer with more androgen. And a
strongly dimorphic species needs MORE androgen-driven differentiation steps to produce that
dimorphism, which is more machinery to disrupt rather than less — goats' polled intersex syndrome is
genetically linked to hornlessness, and freemartinism runs to ~90% of heifers twinned with a bull in
a strongly dimorphic species.

**But the decisive point is not that the theory is wrong — it is that there is no comparative study
of intersex rates across species by dimorphism**, because equivalent diagnostic criteria across taxa
do not exist. Any per-people number would be **house-invented and dressed as biology**, which is
exactly what §9 of the production standard exists to prevent.

### The principle this generalises to

**A model may decline a subject for lack of evidence, and must say so where the subject would
otherwise look forgotten.** The failure mode is not omission; it is silent omission, which reads to
the next person as an oversight and invites somebody to fill it in badly.

### Noted in passing, and left open

Frank: *"lizards and reptiles both have some percentage of two-headedness, but I've never seen it
represented in dragonborn, or in dragons for that matter, other than the famous ones like Tiamat."*
Recorded because it is the same shape of question — a real biological fact about the analog animal,
with no canon basis in the fantasy people, and no evidence base for a rate. **The same reasoning
applies and the same answer follows.**

## A FLAG IS ONLY TRUE WHERE SOMEBODY REMEMBERED IT (Frank, 2 Aug)

> *"They're mindless. They don't investigate things, they do exactly what they were programmed for
> and literally nothing else. They don't require bunks, they don't require food, they don't require
> anything."*

A clean rule, and the code obeyed it in **four places out of six** — which is the worst possible
score, because the four made it look implemented.

```
bonds, romance, cliques      correct from the start: 0 across three years
morale                       correct: pinned at 0 while the living climbed to the ceiling
household narration          WRONG — a skeleton "sat up late over a letter"          (fixed earlier)
Lost Hirelings               WRONG — a skeleton "was owed better and knew it"        (fixed earlier)
Criminal Hireling            WRONG — a warrant served on a skeleton                  (fixed earlier)
housing                      WRONG — five skeletons took both beds and one commuted  (fixed now)
```

**Every one of those was written before `mindless` had a reader**, and each author reasonably
believed the flag was handled because the flag existed and other code used it.

### The principle

**A capability flag is not a property of the data; it is a claim about every consumer.** Adding one
does not make the system obey it — it creates an obligation on every piece of code written
afterwards, and that obligation is invisible to the person writing the code, because the flag looks
like it is already doing its job somewhere else.

The `mindless` comment in `rollPerson` said outright that *"every downstream system already reads
`mindless` to know that."* **It was true when written.** Four systems written afterwards did not.

### What to do about it

The check that would have caught all four is not a code review; it is **running the improbable case
and reading the output**. A household of skeletons is a two-line probe, and it exposed a letter-writing
skeleton, an arrest warrant, a grievance and a stolen bed — none of which any assertion had noticed,
because every one of them produced correct, well-formed, entirely plausible English.

## AN EXAMPLE IS A DEMONSTRATION OF A RULE, NOT A CORRECTION TO ONE ENTRY (Frank, 2 Aug)

> *"Whenever I point out a case example where your decision-making has failed, I am providing an
> example of a potential solution, not the only solution. Look at these examples, evaluate why I
> might be saying that, determine my logic from that statement, and apply universally. If I say a
> grimlock is good at housekeeping — why would I say a grimlock is good at housekeeping?"*

**This is a correction to the METHOD, and it is the most valuable one in the project so far**, because
every previous ruling had been applied as a patch to the thing named.

### Why a grimlock is good at housekeeping

Because **blindness is not a disability in a house.** It navigates by hearing and smell, works in
full dark without a lamp, and notices what nobody else does. **The trait that makes it a poor soldier
in daylight makes it an excellent housekeeper.**

### The rule that generalises

> **A stat block describes how a creature fights an adventuring party.** It says nothing about
> whether it can keep a house. Role assignment must follow from what the traits ENABLE in THIS
> context — not from what the creature's reputation is for.

### What it caught when applied universally

Five peoples were barred from posts for being FRIGHTENING rather than incapable, and their own
reasons said so out loud:

```
Barbed Devil   "a soldier of the Blood War, and nothing else"      never sleeps, misses nothing
Spined Devil   "a skirmisher; useless indoors"                      flies, carries — a MESSENGER
Chain Devil    "a torturer — the one post no keep is offering"      expert with every lock
Redcap         "murderous by nature; useful only pointed outward"   malice is not incapacity
Gargoyle       (defend only)                                        needs no food, sleep or shelter
```

Every one is a statement about REPUTATION. The ones that stayed defend-only stayed for reasons of
BODY: Large will not fit a workroom, incorporeal cannot lift, no hands cannot hold a tool, and a
magmin sets fire to what it touches.

### Gated as the principle rather than the instances

A `why` that bars a people from a post may not disqualify on CHARACTER — no "murderous", no "evil",
no "and nothing else". **If it cannot hold a post, the reason has to be something about the body.**


