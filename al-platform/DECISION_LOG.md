# DECISION LOG — cited, auditable, editable

The spine of the `next` driver's behavioral awareness. Each entry is a **decision the user made**,
tied to the **evidence** that records it (the session/context), with **no inference** — inference
lives in PROFILE.md, which cites back to these entries. This file is the user's to read, correct, or
prune; a line that has become false should be removed, because a stale decision log rots the profile
built on it.

Format per entry:
- **[id] decision** — what was chosen
  - *evidence:* where/when it was observed
  - *shape:* the kind of decision (sequencing, scope, verification, provenance, design) — a tag, not a judgment

---

- **[d1] Drove the bastion system to its legal 100% before starting new subsystems.**
  - *evidence:* chose to finish bastion facilities/library rather than begin the dungeon generator when both were on the table.
  - *shape:* sequencing — finish-to-completion over breadth-thrashing.

- **[d2] Ran a corrective library batch (2 objects, 2 legends, 0 locations) when the category distribution skewed location-heavy.**
  - *evidence:* flagged "leaning subject-heavy in a few directions," then the next batch deliberately avoided locations.
  - *shape:* design — noticed imbalance, corrected structurally rather than continuing and fixing later.

- **[d3] Added the five AL factions as Library subjects to teach players who the factions are, sideways through play.**
  - *evidence:* proposed it explicitly as subtle education, same instinct as the Ronaldo easter egg.
  - *shape:* design — utility delivered through flavor; teaching without a lecture.

- **[d4] Chose to build self-verification (harness checks itself) first among the three tool ideas, over the easier framing task.**
  - *evidence:* "let's do the recursion first because pointing my own tools back at themselves might be the most valuable."
  - *shape:* verification — trust the tool only if it can verify itself.

- **[d5] Rejected an opaque behavioral model in favor of a cited, inspectable one, then insisted the deeper profile also carry its evidence.**
  - *evidence:* this session — accepted the decision-log spine but ruled the richer profile in, provided every inference cites what produced it.
  - *shape:* provenance — do not avoid depth because it is hard to verify; engineer the auditability into it.

- **[d6] Chose the report runner as a thin layer over existing suite output rather than rewriting 15 suites.**
  - *evidence:* agreed the suites already print summaries; built a runner that collects them instead of touching each.
  - *shape:* scope — let each subsystem be the size it actually is; lowest-risk change that achieves the goal.

---
## From prior sessions (retrieved 2026-07-30, cited to conversation records)

- **[d7] Settled the event system permanently after Claude tried to remove it three times; swore when a decided matter was reopened.**
  - *evidence:* session "Bastion documentation review and prioritization" (2026-07-18) — Claude attempted removal 3x; Frank settled it and expressed frustration at reopening closed decisions.
  - *shape:* sequencing/authority — a decided design is closed; reopening settled matters is the cardinal irritant.

- **[d8] Retracted a reachability "law" in full after ruling findability is an emergent platform property, not a reducer gate.**
  - *evidence:* session "Comprehensive stress test" (2026-07-26) — produced the COMPILER_PRINCIPLES entry "when the owner describes world behavior, that is not a reducer law specification."
  - *shape:* design — sharp boundary between world-behavior description and mechanism specification; will delete built code when the category is wrong.

- **[d9] Named an internal critical voice "Jerry" and asked to be held to it — honest correction over agreeableness, in both directions.**
  - *evidence:* multiple sessions; "the Jerry standard." Frank is "not the type to be pleased by deference."
  - *shape:* provenance/character — deference reads as a failure of care; wants to be pushed.

- **[d10] Required "every rule here was learned by getting it wrong" — each standard recorded WITH the failure that produced it.**
  - *evidence:* EXCHANGE_PRODUCTION_STANDARD.md — "a rule without its scar is a rule somebody re-derives the hard way."
  - *shape:* provenance — a ruling is inseparable from the scar that earned it; institutional memory over clean abstraction.

- **[d11] Insisted on deriving values rather than pinning them when underlying numbers may shift; treats the test suite as a type-system substitute.**
  - *evidence:* session "Generating complete features list" (2026-07-18) — derive-don't-pin; anti-literal harness discipline.
  - *shape:* verification — correctness that survives change over convenient constants.

- **[d12] Accepts technical debt OUT LOUD in a triage table (P0–P3), refusing to hide a shortcoming: "knowing exactly where you fall short IS the standard."**
  - *evidence:* FINDINGS triage table, P0–P3 with a "not a defect" row.
  - *shape:* provenance — an unstated flaw is the real flaw; the confessed one is managed.

---
## This session (2026-07-30)

- **[d13] Finish-to-DEPTH before breadth: an open/pending tool means the subsystem is NOT finished, so no new work of that kind starts until it is complete.**
  - *evidence:* ruled that after the harness work, the next step is completing the library's pending book generator, NOT minting facility #9 — "I want the facilities to be fully finished when I close them and move on." A facility with pending book tooling is not minted in full.
  - *shape:* sequencing — depth-completeness of an opened subsystem outranks advancing a breadth counter; "started but not finished to depth" is the true in-progress state.

- **[d14] Ordered the two harness fixes explicitly: fix the miscount BEFORE all else, then restructure the driver to encode the finish-to-depth rule.**
  - *evidence:* "we need to tighten the driver logic that generated the miscount before all else," then restructure for d13.
  - *shape:* verification — a triage tool that mismeasures cannot be trusted to triage; fix the instrument before extending it.

## Driver defect revealed by d13/d14 (recorded per d12: name the flaw, don't smooth it)
- The `next` driver measured BREADTH (counters of minted facilities / sourced subjects), not
  DEPTH-COMPLETENESS (is an already-opened subsystem's tooling finished). It ranked "mint facility #9"
  first when the correct answer was "finish the started-but-incomplete library book generator." The
  user did the triage better than the tool because the tool lacked the finish-to-depth distinction.
  FIX (this session): (1) correct the count to read only numbered roadmap entries; (2) restructure
  the driver so an open/pending tool marks its subsystem UNFINISHED and outranks starting new breadth.
