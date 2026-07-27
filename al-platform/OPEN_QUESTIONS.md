# Open questions and unfinished work

Things that are decided-but-not-built, built-but-not-wired, or flagged for your ruling.
Written down because they otherwise live only in a chat log.

---

## Awaiting your ruling

**The common tier of the magic item tables is short.** The SRD holds only two common magic
items (Bead of Nourishment, Potion of Climbing) plus a few graded variants. 90 common rows were
needed; ~5 exist. Common tiers are currently 3–5 rows with wide bands. Options discussed:
accept small tables, fall through to mundane rewards, merge common into uncommon, or use the
typed-slot mechanic (see below) for the whole tier. Not decided.

**Ammunition weights.** The old inline data omitted arrow/bolt/bullet/needle weights; the
composed data now carries the correct SRD values (1, 1.5, 2, 1.5, 1 lb). More correct — but if
AL play deliberately does not track ammo encumbrance, say so and they can be suppressed.

**Entertainer's Pack weight** is omitted: the source value was garbage (`5812 lb.`). Needs the
real number.

---

## Built and tested, but not wired to a trigger

**The treasure roller.** `rollMagicItem()` works and the whole slot chain behind it works —
roll → typed slot → player fills it from their own book → DM verifies owed-vs-entered. But
**nothing calls it.** The facility that used to (the trophy room) was one of the placeholders
removed early on. Deciding WHICH order or event rolls for treasure is a design call; once made
it is a one-line wire into a chain that is already green.

**Player registration.** There is no account-creation flow. Character import is reachable from
"Add a character" → "A character I already play", but a brand-new player has no front door.

---

## Enforcement that data cannot check

The AL legality layer is data-side and cited (see `SRD_AL_SWEEP.md`). These are APP-LOGIC
checks nobody has verified:

1. The mundane purchase path must not offer firearm WEAPONS for sale. `[ALPG-312]` bars
   purchase; the flag exists (`firearm: true`) and `isFirearm()` gates trade and awards, but the
   store path was never confirmed.
2. **"Purchased in an adventure"** vs downtime shopping — firearm BULLETS are in-adventure
   purchasable but the store should probably not list them like ordinary stock.
3. Firearms barred from **"chosen as a weapon type"** — i.e. weapon-choice class features.
4. **Smokepowder** tracking, if firing is ever modelled.
5. Trade goods and vehicles should route to the STORY-ITEM class, never the mundane store
   `[DC-68]`.

---

## Structural notes for whoever picks this up

**One intentional cross-feature import exists**: `player/ui.tsx` renders `BastionRegionLine`
from `bastion/ui`, because the profile page shows a character's bastion region. It is
documented at the import. Everything else two packages share lives in `lib/`.

**The rule that kept the layering honest:** if a `lib/` module needs something from a feature
package, the thing is almost always in the WRONG package — move it down, do not import upward.
Six things were found misplaced this way (`isAdmin`, `bastionEligible`, `earnedRegions`,
`REGION_TAGS`, `threadCtx`, `bForm`).

**`seed.ts` is deliberately NOT in `data/`.** The files there are pure literals with no
dependencies; `seed` composes state using `mkItem` and the registries, so it sits ABOVE the
feature packages. Moving it into `data/` reintroduces a layer inversion.

**`Modal` in `app.tsx` is the ROUTER, not a primitive.** It switches over `modal.kind` and
renders every feature's modals, so it belongs to the shell. Moving it to `lib/ui` would make
`lib/` import all eight feature packages.

---

## Before any future structural change

Run all three gates, before and after:

    harness/fingerprint.sh /tmp/before.json     # every registry + dataset, by VALUE
    ... make the change ...
    harness/fingerprint.sh /tmp/after.json
    node harness/compare.mjs /tmp/before.json /tmp/after.json
    node harness/behaviour.cjs                  # dispatches real actions through every domain

The two gates catch different things. The fingerprint compares DATA and cannot see routing:
when the reducer cases were split out, `buildKnownActions()` silently stopped finding them, the
unknown-action guard turned itself off, and the fingerprint still said IDENTICAL. Only
dispatching a garbage action and expecting a throw caught it. That is why `behaviour.cjs`
exists.

`harness/extract.py` has an overlap guard and indexes `export` / `export default` declarations.
Both exist because of real bugs: overlapping spans silently deleted `ADV_BY_ID`, and an index
that could not see `export default function App()` swallowed the entire App component into a
feature module. Use the tool rather than hand-rolling a parse.

---

## From the external code review

An outside review of the packaged snapshot raised the items below. Two were Critical; both are
now FIXED (see "Fixed from the review"). The rest are open and ordered as that review suggested.

### Gate B - stabilise the engine (do before the next large feature)

**Test coverage: the transition suite now exists (Gate B item 5 - DONE).**
`harness/transitions.cjs`, in `npm run check`, three layers:
  UNIVERSAL    all 182 actions x 3 properties - an unauthorised actor changes nothing, a
               missing target changes nothing, state invariants hold after every dispatch.
  TRANSITIONS  16 hand-written assertions on the paths where silent failure is expensive:
               provenance, verification, certificates, retirement, roles, org membership.
  FUZZ         ~9,000 dispatches across ~770 short reseeded chains, invariants after each.
               (Short chains, not one long one: state grows without bound and stateViolations
               is O(state), so a naive long fuzz never finishes.)
What it does NOT yet cover: per-action boundary conditions, trade/escrow rollback semantics,
and ledger-provenance assertions beyond the item paths. Those are the remaining Gate B work.

**(superseded) Test coverage: improved, still not the suite that was asked for.** It was ~6 of 182 actions;
`harness/immutability.cjs` now dispatches ALL 182 against a deep-frozen previous state. That is
a floor - no crashes, no writes into previous state, every action routable - not a behavioural
suite. It does not assert transitions, permission outcomes, ledger provenance, trade invariants,
or rollback. The table-driven suite below is still needed.

**(original note) Test coverage is far too narrow.** `harness/behaviour.cjs` exercises ~6 of 182 reducer
actions and mostly only checks that they do not throw. It was built as a refactor ROUTING smoke
test and is good at that; it is not a behavioural suite. Needed: table-driven tests per action
covering successful transition, unauthorised actor, missing target, boundary condition, and
state-invariant preservation - plus confirmation that a REJECTED action leaves state
semantically unchanged. The existing `stateViolations()` work is a strong seed for property /
fuzz testing and should be promoted into the formal test path.

**Reducer purity is deliberately compromised.** Reducer paths call `Date.now()`, `new Date()`,
`Math.random()`, module-level cache invalidation, and the global `BLOBS` store. Actions are
therefore not replayable, which will hurt deterministic tests, undo, sync, audit reproduction,
and any future server-side execution. For a platform whose product promise is authoritative
logs and provenance, this gets expensive. Fix direction: inject a reducer environment
(`now`, `random`, id generation, blob ops); actions representing chance should carry their
resolved roll or a recorded seed, persisted in the log.

**The lazy Proxy draft: partly fixed, one issue confirmed open.** The immutability sweep is
now in the gate and all 182 actions are clean, but the reviewer's OTHER Proxy observation is
confirmed and NOT fixed: a REJECTED action returns a new proxy-backed state rather than the
original object. Measured - `SET_BIO` by a stranger, a missing target, and an unauthorised
`RETIRE_CHARACTER` all return `out !== s`. So React's `Object.is` bail-out never fires on a
rejected dispatch and the app pays a full re-render (~62 ms) for an action that did nothing.
Fixing it means guards returning the ORIGINAL `state` rather than the draft `s`, across 100+
sites, with care where a guard rejects AFTER partial work. Worth doing; not a small edit.

**(original note) The lazy Proxy draft needs guard rails.** It is one of the strongest pieces of engineering
here and it is structurally risky: reads clone records (not identity-neutral), rejected actions
often return a new proxy-backed state rather than the original object, proxy-backed collections
can leak into persisted state, and correctness depends on every mutable top-level collection
being classified in DEEP or FLAT - add a new collection without registering it and it can
mutate the previous state directly. Needed: freeze the previous state and dispatch every
action; assert no-op identity; assert every top-level mutable collection is classified.

**Generated-data drift is not enforced.** `npm run generate` exists now, but nothing regenerates
into a temp directory and compares. Add that check so generated files cannot silently diverge
from `srd-source/`.

### Gate C - before/while continuing feature work

**No error boundary.** `src/main.tsx` mounts the app directly; one render exception blanks the
whole application. Add a boundary with a recovery path and a diagnostic export.

**Accessibility has never had a deliberate pass.** ~681 interactive elements, sparse ARIA. The
modal router creates dialogs visually with no consistent `role="dialog"`, `aria-modal`, focus
trap, focus restoration, Escape handling, or background inerting. Also verify: every input has
a programmatic label, icon-only buttons have accessible names, keyboard navigation works, focus
is visible, status changes are announced, colour is not the sole signal, and countdowns respect
reduced-motion.

**Types are porous around data even though `strict: true`.** `noImplicitAny` is off, core
records carry `[k: string]: any`, most non-Bastion action payloads are open maps, and many
component props are `{ [k: string]: any }`. Tighten in this order, one feature at a time, and
do NOT attempt it in one pass: reducer delegate signatures typed with `Action`; named interfaces
replacing open prop bags; `AppState` split into domain slices; record index signatures removed;
`noImplicitAny` enabled last.

**The shell is still a high-coupling import hub.** `app.tsx` imports nearly every feature's
screens, modals, helpers and constants. The modal router justifies much of it. A later
improvement is feature-owned route/modal registries, keeping the current downward dependency
rule. Not urgent unless merge conflicts or load performance bite.

**Next decomposition seams** should be driven by a stable concept emerging, not by file size.
Likely: Bastion construction, turn resolution, happenings/combat, facility economics, session
publishing, verification, event management.

### Gate D - before real users or authoritative records

The app is entirely in-memory. There is no durable storage, account registration,
authentication, authorization boundary, sync, migration strategy, or server-side validation,
and the image `BLOBS` map dies on reload. Before external users or records of value: durable
storage, stable identifiers, schema versioning and migrations, server-enforced authorization,
transaction boundaries for trades/awards/approvals, conflict handling and idempotency, backup
and recovery, and audit-log immutability rules. Move images to durable object storage or
browser storage with lifecycle rules.

---

## Fixed from the review

**CRITICAL - the unknown-action guard was dead in production.** `buildKnownActions()` read
`reducerImpl.toString()` and scanned for `case "X":`. Verified against the real production
bundle: the minifier emits ``case`X`:`` (template literals), so the scan found **0** of 182
labels, the `size > 20` fail-open returned null, and the guard silently disabled itself - in
the shipped bundle only, where no harness was looking. Replaced with explicit
`*_ACTION_NAMES` lists exported by each reducer module. `harness/check_actions.cjs` asserts
those lists match the real case labels AND that their union equals `ActionType`.
`harness/behaviour.cjs` now also runs against a MINIFIED bundle (`npm run test:minified`),
which is the check that would have caught this.

**CRITICAL - three declared actions had no reducer case.** `SET_PUB_TAP`, `SET_ARCHIVE_BOOK`,
`SET_BASTION_TRAINER` were declared in `ActionType` and the strict `BastionAction` union with
no implementation anywhere - a false contract that TypeScript accepted and the runtime ignored.
They were debris from removing the pub / archive / training_area PLACEHOLDER facilities: the
reducer cases went with the facilities, the declarations were left behind. Removed, with a note
in `types.ts` to re-add them *with* their cases when those facilities are re-minted.

**`npm run check` now exists**: typecheck, action contract, behaviour (normal AND minified),
production build. Plus `check:actions`, `test:behaviour`, `test:minified`, `generate`.

**`jsdom` moved to devDependencies** - it is harness-only and was not imported by any source file.

---

## What the immutability sweep found (worth reading before touching the draft layer)

Adding the frozen-previous-state test immediately caught **9 actions writing into the previous
state** - `GRANT_ROLE`, `APPROVE_DM`, `DEMOTE_DM`, `DEACTIVATE_USER`, `REQUEST_DM`,
`REQUEST_STORE`, `FLAG_STORE_FIELD`, `REPORT_MESSAGE`, `START_MENTOR_SEARCH`.

Root cause was exactly what the review predicted. The draft returns any collection NOT listed in
`DEEP` or `FLAT` **by reference**, so a write lands in the state React is still holding - no
error, no symptom, until something depends on the previous state being intact. **26 of 39
collections were unclassified**: `roles`, `dmRequests`, `orgMembers`, `avatars`, `bios`, `mod`,
`stores`, `storeRequests`, `storeFlags`, `polls`, `mentorOffers`, `shadows`, `mentorDeclined`,
`provRequests`, `mentors`, `mentorSuggest`, `notReady`, `mentorSwaps`, `dmFlags`, `provisional`,
`warhornPushed`, `stubs`, `moduleAuthors`, `listings`, `trades`, `tickets`.

All 26 are now classified - `DEEP` for the three that grow with activity (`listings`, `trades`,
`tickets`), `FLAT` for the rest, which are bounded by account/org/store count. Re-measured after
the change: 0.008-0.040 ms per action, and still sub-0.05 ms at 20,000 log entries and 2,000
listings, so the fast path the DEEP/FLAT split exists to protect is intact.

**If you add a collection to `AppState`, classify it in the same commit.** The comment above
`DEEP` says so, and `npm run test:immutable` will catch you if you forget.

---

## What the transition suite found (four real bugs, all fixed)

**1. The seed violated the app's own invariant.** `ch_bram` carried 2 defenders with a cap of
0 - `stateViolations` says "the defender roster cannot exceed what the barracks allow", and his
barracks had been deleted as a placeholder. The defenders were left behind. Same class as the
orphaned action declarations: an incomplete removal. Defenders removed from the seed.

**2. SEVEN privileged actions had NO permission check whatsoever.** `GRANT_ROLE`,
`DEACTIVATE_USER`, `REACTIVATE_USER`, `DEMOTE_DM`, `APPROVE_DM`, `SET_PROVISIONAL`, `BAN_USER`.
Any account could grant itself admin, deactivate any user, or demote any DM. Latent today - the
app is single-user and in-memory, and the admin tab is UI-gated - but a real hole the moment a
backend exists, and precisely what Gate D means by "server-enforced authorization". All seven
now check `isAdmin`, and the UI passes `by: accountId` (it previously passed no actor at all,
so the guard would have silently broken the admin screens without that half).

**3. Log approval was unguarded.** `REVIEW_OBSERVER` and `REVIEW_PROV_LOG` set an entry to
APPROVED with no check on the actor - and approving a log is how play and its rewards become
official. Both now require `isDMRole`.

**4. `KILL_CHARACTER` left a dead lord's keep running.** Found by the fuzz, not by any
hand-written test. It marked the bastion abandoned but left unresolved turns and in-flight
construction, violating "a fallen lord's keep does not run". It now closes the running week,
any wall construction, and any facility building.

The suite has a regression test for #2 and #3 ("privileged actions refuse a non-admin actor"),
so those cannot quietly come undone.

NOTE: fixing #1 changed the seed, so the fingerprint baseline moved by design. That is a
deliberate content change, not drift - the harness flagged it correctly.

---

## Push reports (built)

Neither tool this platform sits beside accepts a write. D&D Beyond has no API to push a change
into a character sheet; Warhorn has no API to create or edit a table. Everything recorded here
has to be re-typed by a human somewhere else, so the push report makes that mechanical: a
checklist you work down with the other tool open beside you.

**Player report** - `playerPushReport(state, accountId)` in `src/lib/push.ts`.
Driven by a WATERMARK (`state.pushMarks[account]`, a nextId mark), not a login session - the
app has no real login, and a watermark answers the question that actually matters: what has not
been copied across yet. Same report serves all three triggers:
  * on the way out (switching account is this prototype's logout)
  * on demand from the profile
  * one hour before a table, via `PUSH_SWEEP` on a 60-second tick, raising a `pushdue` alert
Each character block lists the changes AND the target the sheet should read when finished
(gold, downtime, level, lifestyle). The target is the more important half: lose your place
halfway down the list and it still gets the sheet right. Lines still awaiting a DM are marked
as such, so nobody copies an unapproved reward. `ACK_PUSH_REPORT` sets the mark; it refuses
anyone but the account holder (or an admin).

**Scheduler report** - `schedulerPushReport(state, orgId)`, on demand for an org's leader,
assistant or scheduler. Extends the old Warhorn queue, which only knew about tables to CREATE
and players to ADD. A schedule also changes and cancels, and those were invisible: a table
whose time moved after being pushed looked done. `MARK_WARHORN_PUSHED` now stores a SIGNATURE
of what was pushed rather than a bare `true`, so the report can say which fields moved -
"Update table - DDEX01-05 (time, DM)" - and can surface cancellations and dropped signups.

Covered by six assertions in `harness/transitions.cjs`, including that a pushed table returns
as an edit when its time changes, and that the one-hour sweep raises at most one warning per
player per table.

---

## Session completion, levelling, and net push totals (built)

**Completing a table now applies the award immediately.** It used to record the award and wait
for the player to click "add to my log", which left the Exchange's own record of a character
behind its own logsheet until somebody remembered. `applySessionToChar` is shared by
COMPLETE_SESSION (automatic) and ADD_SESSION_TO_LOG (the manual path, kept for anything
completed before this change) so the two cannot drift.

**The level is now OFFERED, not assumed.** [ALPG-316]: "If this session completed a one-shot,
2+ hours of an official D&D adventure, or the official D&D adventure instructs leveling, you
may gain or decline to level, earning rewards for either option." So: a `leveloffer` alert per
attendee with Take the level / Stay at N. `ACCEPT_LEVEL` raises it by one and writes a LEVEL log
line; `DECLINE_LEVEL` records the refusal. Rewards are untouched either way - they were applied
at completion. The DM can mark a session non-qualifying with `levelEligible: false`.

**The push report nets resources.** Gold and downtime accumulate to ONE signed instruction each
("Change gold by +250"), with the individual movements kept underneath as the audit trail.
Earning 10 downtime and spending 10 produces NO downtime instruction, which is correct - a list
reading "-10" then "+10" makes the reader do arithmetic to discover there is nothing to do.
Items cannot be netted, so they stay individual ("Remove Flame Tongue", "Add Crown of
Intellect"). A level change is its own line, citing the fixed-hit-points rule.

A REAL BUG the netting test caught: the watermark comparison was `<=` when it had to be `<`.
The mark is nextId at acknowledgement - the id the NEXT thing will be given - so an id equal to
the mark is the FIRST change after it. With `<=`, the first change after every acknowledgement
was silently dropped from the report.

Level is recorded on the character, which is what the roster card reads.

**OWNER'S RULING - the level-5 starting magic item is CREATION ONLY.** A character who levels
up to 5 through play does NOT get one. Only a character BUILT at level 5 does. Do not add a
prompt on reaching level 5.

  The ALPG says this in two places and they pull against each other, so the ruling matters:
    [ALPG-42], "Starting Play at Level 5": "Instead of creating a level 1 character, you may
      create a level 5 character. Receive standard starting gear for your class and background,
      500 GP, 40 Downtime Days (DT), and choose one of these starting magic items."
      -> unambiguously a CREATION package.
    [ALPG-317], sitting INSIDE the "Leveling" section, right after "you may gain or decline to
      level": "**At Level 5.** You may choose one starting magic item for your character from
      'Starting Play at Level 5.'"
      -> reads, on placement, as applying when you REACH level 5.
  THE REASONING, which is what makes the ruling hold rather than just pick a side:
  the starting magic item exists to COMPENSATE a character who has had no opportunity to earn
  one. A character built at level 5 has never adventured in the League - no sessions, no
  treasure, no chance at an item. A character who LEVELLED to 5 has played their way there and
  has had every one of those chances. Granting the item to both pays twice for the same gap.
  On that reading [ALPG-317] is not a second grant at all - it points at WHICH LIST a level-5
  character chooses from, and the entitlement itself comes from [ALPG-42], which is creation.

  The Exchange follows the owner's ruling: creation only. Recorded with its reasoning so nobody
  re-derives the other reading from [ALPG-317] later and "fixes" it.

---

## Second review pass - both gate fixes made, and what they caught

**1. `npm run check` now runs the linter.** It did not, so "the complete check passed" could be
said truthfully while oxlint had failures behind another door. `npm run lint` now runs second,
straight after `tsc -b`.

**2. The fuzz no longer swallows exceptions - and it was hiding a real crash.**
It did `catch (e) { continue; }`, so an action that only dies after a particular sequence looked
like an uninteresting rejection. The universal unauthorised/missing-target properties did the
same thing in reverse, converting a crash into "state unchanged, therefore fine". Both now
record and fail, and a new `threwOnJunk` check asserts that a guard REJECTS rather than throws.

Turning that on immediately failed with:

    ASSIGN_CERT threw: Cannot read properties of undefined (reading 'rarity')
    sequence: ... ADD_WISH ... ASSIGN_CERT
    at matchWish -> satisfyWishlist

`ADD_WISH` stored `desired: action.desired` with no fallback, so a PROPERTY wish could exist
with `desired` undefined. `matchWish` then read `d.rarity` and died. That matters more than it
looks: `satisfyWishlist` runs on EVERY item award, so a single malformed wish would have broken
item awards for that character permanently, with a stack trace instead of a rejection.

Fixed at both ends - `ADD_WISH` refuses a PROPERTY wish with an empty `desired`, and `matchWish`
is no longer crashable by either a malformed wish or a catalogue-less item. While there, removed
a dead guard: `if (!cat) return false;` never fired, because `itemCat` falls back to the item
and never returns falsy. The real intent - "a player-entered item has no catalogue row to match
against" - is now `if (!item || !item.catalogId) return false;`.

## Determinism (accepted convention, not yet a refactor)

The reviewer's point stands: `Date.now()` and `Math.random()` are called inside state-changing
logic throughout the bastion engine, events, battles and moderation. NEW work follows the
convention of taking the outcome in the action rather than generating it - `PUSH_SWEEP` already
takes `action.now`, and `COMPLETE_SESSION` takes the DM's confirmed award rather than rolling.
Retrofitting the bastion engine is deliberately NOT attempted here; it is Gate B work and wants
an injected context (`now()`, `random()`, id minting) rather than a scatter of parameters.
