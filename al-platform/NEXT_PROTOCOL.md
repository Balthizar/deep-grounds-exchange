# NEXT PROTOCOL — the milestone triage flow (agent behavior)

This is the half of the `next` system a script cannot perform: detecting a milestone, prompting,
reading whether the user's reply implies they are *deciding*, and reassuring. A `.cjs` file cannot
read intent or offer reassurance — that is the agent's job. This file records the protocol so it
survives past any one session and any agent picking up the project behaves the same way.

The mechanical half lives in `harness/next.cjs` (`npm run next`): it produces the cited triage
synthesis — work-state, test-state, loose ends, and the top three steps with why-trails. The agent
*performs the flow*; the script *produces the synthesis*.

---

## The flow

**1. Detect the milestone.** A milestone is when the current aspect is **shippable or at least
packageable** — a subsystem hit its ceiling, a batch closed gate-green, a delta was just packaged.
(Signal: you just ran a clean gate and produced a delta zip.)

**2. Prompt — lightly.** At the milestone, ask once, plainly: *"Do you know what you want to tackle
next?"* Do not dump the triage yet. Many times the user already knows; respect that and get out of
the way.

**3. Read the reply.**
- If the reply names a clear next step → the user knows. Proceed with it. **Do not** run the triage;
  it would be noise.
- If the reply implies they are **deciding / unsure / weighing options** ("hmm," "not sure," "what's
  left," "maybe X or Y," a question back) → this is the trigger. Go to step 4.

**4. When (and only when) they are deciding:**
- **Reassure first.** Briefly, honestly — name what was just accomplished so the decision is made
  from a place of "look what's done," not "look what's undone." This user runs long and hard; the
  reassurance is not flattery, it is restoring accurate perspective before a sequencing choice.
- **Surface the untracked loose ends.** Run `npm run next` and lead with its LOOSE ENDS section —
  the open/pending items that carry *no supporting note*. These are the silent ones, the ones this
  user most wants flagged (provenance value: an unstated status is itself a finding).
- **Present the top three next steps, each cited.** From `npm run next`. Each step shows *why it was
  chosen* — the observations from work/test/loose-end state and the profile tempering that ordered
  it. Never a bare verdict; always the trail.
- **Hand the decision back.** These are candidates for the user's judgment. State plainly that the
  profile influence is labeled and separable, and the call is theirs.

**5. After the decision, log it.** Append the chosen decision to `DECISION_LOG.md` with its evidence,
and if it reveals a new pattern, revise `BEHAVIORAL_PROFILE.md` (citing the new log entry). This is
"a bit of both": the agent maintains the log from observed behavior; the user reads and corrects it.

---

## Guardrails (from the user's own rulings, this session)

- The profile **tempers ordering; it never blends into a single confident answer.** Work-state,
  test-state, loose ends, and profile influence stay in separate labeled columns.
- Every profile trait and every recommendation **cites its evidence.** Inference about the user is
  the least verifiable input in the harness; it is kept falsifiable and auditable, or it is not kept.
- The triage is **advisory.** It reassures and recommends; it does not decide. The user decides.
- Do not run the full triage when the user already knows the next step. The flow exists for the
  *deciding* moment, not every milestone.
