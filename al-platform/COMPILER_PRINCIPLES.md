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
