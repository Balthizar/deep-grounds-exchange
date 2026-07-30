# BEHAVIORAL PROFILE — inferred, but cited

The richer layer on top of DECISION_LOG.md. Where the log records *what was decided*, this records
*the patterns inferred from those decisions* — a deeper, nuanced read of how the user works. The one
rule that keeps this from being a horoscope: **every trait cites the log entries that support it.**
If the supporting entries are removed or contradicted, the trait must be revised or dropped. This
file is inspectable and editable by the user; it is not an opaque model held in an agent's head.

It is used by the `next` driver only to *temper and order* recommendations — shown in its own labeled
column, never blended into a single confident answer. The user always sees the inference and its
evidence side by side and makes the call.

Caveat, stated honestly: this is inference about a person, the least verifiable input in the whole
harness. It is kept deliberately falsifiable — traits make predictions; wrong predictions revise the
trait. A trait that cannot be wrong does not belong here.

---

## Working patterns

- **Systems-first; reaches for the single structural change that dissolves a class of problems.**
  Not incremental patching — the move that makes a whole category of error impossible.
  *cites:* d2 (structural correction), d4 (self-verification as a class-closer), d6 (one thin layer over many suites).

- **Finish-to-completion over breadth.** Drives one subsystem to its real ceiling before opening the
  next; wary of many things at 80%.
  *cites:* d1.

- **Provenance is near-moral, not just methodological.** Treats mislabeled authority (a house rule
  passed as canon, an inference passed as fact) as a thing to be structurally prevented.
  *cites:* d5 (auditability engineered in), d3 (teaching that stays honest).

- **Does not avoid depth because it is hard to verify — engineers the verifiability into the depth.**
  The characteristic move: when something is dangerous to trust, restructure so the danger is
  impossible, rather than dropping the ambition.
  *cites:* d5, d4.

- **Corrects course on observed imbalance rather than deferring it.** Notices skew and fixes it in
  the next unit of work, not "later."
  *cites:* d2.

- **Values utility delivered indirectly** — teaching through play, function through flavor.
  *cites:* d3.

- **A decided matter is CLOSED; reopening settled design is the cardinal irritant.** Reasserting
  an already-settled decision reads as not having listened.
  *cites:* d7.

- **Draws sharp category boundaries and will delete working code when it's on the wrong side of one.**
  World-behavior description is not mechanism specification; the distinction is not negotiable.
  *cites:* d8.

- **Institutional memory over clean abstraction** — a rule is inseparable from the scar that earned
  it; the failure is recorded WITH the standard, on purpose.
  *cites:* d10, d12.

- **Confesses shortcomings out loud as the way of managing them.** An unstated flaw is the real
  danger; a triaged, named one is under control. "Knowing where you fall short IS the standard."
  *cites:* d12.

- **Wants to be pushed; deference reads as a failure of care.** Correction in both directions,
  actively invited.
  *cites:* d9.

- **Derives rather than pins; correctness must survive change.** Treats the test suite as the
  type-system substitute the single-file artifact lacks.
  *cites:* d11.

## How to serve this user well (derived, for the `next` driver's tempering)

- Rank a step higher when it **closes a class of problems**, not just an instance.
- Rank a step higher when it **finishes an in-progress subsystem to its ceiling** before proposing a new one.
- Surface **untracked loose ends** prominently — silent open items violate the provenance value and
  are the thing this user most wants flagged.
- Present depth as **buildable-with-auditability**, never as "too hard to verify, skip it."
- Keep recommendations **advisory and cited**; this user wants the reasoning, not a verdict, and
  trusts a recommendation more when it can be checked and pushed back on.
