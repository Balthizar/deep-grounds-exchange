
## Phase 1c (performance finalisation + review bugs)
- **BUG-1 fixed:** the mundane MARKET sold firearms (`g_musket` 500 gp, `g_pistol` 250 gp) —
  trade path was gated, purchase path was not. One-line filter at the MARKET build
  (`lib/ui.tsx`), cited [ALPG-312]; two regression assertions added to harness/transitions.cjs
  (no item minted, no gold moved). Firearm BULLETS remain listed pending the owner's ruling on
  "purchased in an adventure" vs downtime stock (OPEN_QUESTIONS enforcement item 2).
- **BUG-2 fixed:** 31 reducer-side dates used the UTC day (`toISOString().slice(0,10)`),
  stamping every evening session in the Americas with tomorrow. `todayLocal()` /
  `localDate(ts)` in lib/util.ts; all reducer/engine stamps swept.
- **BUG-4 guard live:** a state collection in neither DEEP nor FLAT now throws by name at
  first touch instead of silently mutating the previous state. Classified in the same change:
  `events` FLAT→DEEP (grows with activity), `itemSlots` + `bastionPacts` into FLAT;
  `lastWarhornSync` allow-listed as a wholesale-replaced report object.
- **Overlay draft (Phase 1c):** object-map collections are base + override layer; dispatch cost
  is O(touched). The eager `{...src}` shallow copy — 443/458 CPU samples at 50k — is gone.
  Compaction folds the layer past 4,096 overrides. `rawEntries()` (lib/util.ts) iterates
  without triggering clone-on-read, for read-only passes only.
- **O(1) idle tick:** module watermark NEXT_DUE; bastion-mutating actions zero it. Resolution
  batched at 250 keeps/dispatch with carry.
- **PUSH_SWEEP inverted:** one raw pass buckets ledger+items by character; playerPushReport
  gained an optional buckets argument (same body, two feeders — the line logic cannot drift).
  idSeq is regex-free (600k calls/sweep).

## Phase 1c addendum — independent reproducibility review (external, GPT-5.5)
An outside reviewer attempted to reproduce the stress benchmark from the snapshot alone.
**Reproduced and confirmed:** fixture generation, insert throughput, storage density
(their 255 B/row vs our published 258–267), schema consistency. **Not reproduced:** dispatch
throughput — the run stalled at reducer bundling because esbuild was an UNDECLARED dependency
reached via `npx` with output suppressed: on a clean machine, npx sat waiting on an install
prompt nobody could see. The reviewer's diagnosis was correct and generalised: every harness
in the project leaned on the same hidden dependency and only worked here via npx's download
cache.

Adopted: esbuild pinned as a devDependency (`^0.27.5`, inside vite 8's peer range);
`npm run benchmark` single-command entry; preflight (Node/sqlite/esbuild) that fails loudly
BEFORE fixture work; strict argument validation with `--help`; the bridge bundles via
esbuild's JS API — no npx, no cache, no network, and no subprocess (the first fix wrapped the
platform ELF binary in `node`, which the clean-clone test caught). Harness `.cjs` call sites
standardised to `npx --no-install`. Verified: clean clone → `npm install` →
`npm run benchmark -- 20000` runs green end to end; with esbuild removed, the failure is one
explicit sentence and exit 1.

Declined, with reason: shipping a prebuilt `server/_cases.cjs` (their Option A). A committed
reducer bundle can silently go stale against `src/` — the exact failure mode already logged as
a project meta-risk — so the bundle stays a regenerated-every-run artifact, and reproducibility
is guaranteed by the declared dependency instead.

Two honesty notes for future readers: (1) the reviewer's insert rates ran faster than ours —
different hardware; per-row constants agreed, which is what the extrapolation rests on;
(2) container throughput here varies run to run (a later 20k pass measured 2–3x the original),
so the published 1M-fixture table remains the record, and anyone re-anchoring should re-run
the 1M fixture on their own hardware rather than compare small runs across machines.

## Voice-pass finding (24 Jul) — gen-magic-tables was a one-shot, and `generate` lied
Rewriting comments in my own voice tripped a real landmine: `scripts/gen-magic-tables.mjs`
reads `/tmp/profile.json` — an input outside the repo, gone with the container that made it —
and even when it ran, it wrote candidates to /tmp, never to src/data/magic_tables.ts. So
`npm run generate` was half-broken as packaged, my gate never noticed (check_generated only
drift-checks gen-srd), and the snapshot notes overstated the script. Same hidden-dependency
class my external reviewer caught in the stress harness. Fixed honestly: `generate` now runs
gen-srd only; gen-magic-tables carries a provenance header naming what it was; magic_tables.ts
is declared what it always really was — my hand-authored, row-reviewed source of truth.
Re-deriving the profile to make the script live again is a ruling I'll make if I ever need to
re-roll the tables.

## The voice pass (24 Jul) — my comments, in my voice
I had every narrated comment rewritten first-person: me talking to future me and at the code.
My rule for scope: comments with a narrator got my voice; terse imperative micro-comments
("// whitelist") already ARE me talking at the code and stand; DMG/ALPG quotes stay verbatim
because a citation is not a voice. Swept to zero: "we/our/ours", "the app/the platform does X",
and every third-person essay in app.tsx, the reducers, bastion/actions, engine's section
essays, lib/*, server/*, harness/*, data headers, types, seed, scripts. ~400 first-person
comment lines now carry the voice; the long tail of citation-style lines deep in engine.ts,
data/events.ts region blocks, and the feature ui files was already neutral or is queued for
the next pass. Gate green after; render byte-identical (101,877 chars).
Bonus: the pass caught two real rots — a stale toString() comment in lib/rules.ts describing a
mechanism I'd already killed, and the gen-magic-tables landmine logged above. Reading every
comment out loud in my own voice turns out to be a decent audit.

## Q13–Q17, answered by me (24 Jul) — three confirmations, one rebuild, one sent back for my ruling

**Q13 — confirmed.** I side with the DMG as the authoritative source; the ALPG doesn't restrict the
frequency. That's B-31 exactly as built: DMG terms (one SPECIAL, once per level gained, must
qualify) with the ALPG's one added restriction still enforced — no rebuild while an order is
unresolved (bastion/actions.ts REBUILD case; `rebuiltAtLevel` spends the swap).

**Q14 — confirmed.** A rebuilt facility's duplicate-order counter resets because it's basically a
new facility. Already true in the engine: `f.lastOrder = null; // a new room has no last order to
repeat` fires when the rebuild's construction clock completes (engine.ts ~727), and the clock is
the room's own build time, staff relocating or leaving on the way.

**Q17 — ruled and rebuilt.** Clear the hold; the goat is prompted to add the item they chose,
like my other slot doors. The chapter says "chosen by you from the <Group> TABLES" — the whole
tables, most of which I can't ship — so the SRD-selector I built first was the wrong door. Now:
resolving a magic-item craft order charges the ch. 7 materials figure (half for a consumable,
declared on the order because the goat already knows what they're making) and mints an UNFILLED
craft slot; SUBMIT_SLOT_ITEM enters the item from their own book; VERIFY_SLOT_ITEM stamps
provenance CRAFTED by the room's maker. Mundane-base consumption and the spell-emitter rule ride
the verification as stated guidance — I can't enforce text I don't hold, and the DM at the table
can. The two `q17` flags are gone from the Arcane Study rows and the harness now holds the ruling
directly: 10 new assertions raise a study through the real door (ADD_BASTION_FACILITY), resolve
the order, and walk the slot to a verified CRAFTED item. Gate 32 → 42 checks, all green; the
SRD-selector helpers stay exported with an honest RETAINED banner (real ch. 7 mechanics a future
personal-crafting door may want). Render byte-identical (the changed controls live behind the
order form, not the default view). Doc correction queued for the next project-doc sync:
FACILITY_SPEC:140 says the Workshop output picks from ARMAMENTS — the chapter says IMPLEMENTS
(Bastions.md ~1459–1463); the Smithy is the Armaments room (~1146–1150).

**Q15 — my new ruling, superseding SR-12, held for two confirmations before I build it.**
The Eldritch Discovery gift becomes a giftable CHARM ITEM minted by the facility: it carries a
lifetime, expires, and then becomes a mundane decorative charm (it doesn't vanish — it becomes a
keepsake). It can be gifted at the table or to a friend who needs it. The timer is turn-based for
the individual holding it. Before I wire it I need my own answers to: (1) what exactly ticks the
holder's clock — their bastion turns (and then what of a holder with no bastion), or the 7-day
turn-length on the wall clock from acquisition; (2) gift-only, or tradeable — SR-12 kept it out
of the trade economy entirely, and "gifted" names one door, not all of them.

**Q16 — sent back for my ruling, with the full picture on the table.** The ALPG's letter is a
PURCHASE exclusion ("Excluded DMG purchases of poisons and trade goods", v2026.4 change log). The
DMG's own Workshop can never hold the kit — its six tools come from a closed eleven-item
Artisan's-Tools list and the Poisoner's Kit isn't an Artisan's Tool. The kit's craft output in
SRD 5.2 is exactly `Basic Poison`; my standing least-permissive ruling ("AL HAS NO POISONS",
harness ~6318) closes the non-purchase doors the letter leaves open (Greenhouse harvest, kit
craft), my generator strips `Poison, Basic` at source while deliberately keeping the kit ("a
tool, legal"), and two assertions hold that no facility and no catalogue row offers a poison.
Options on my desk: (a) reaffirm least-permissive — no poisons anywhere, kit stays legal flavor
gear; (b) follow the letter only — allow craft/harvest doors, which means minting poison items;
(c) firearms-pattern middle — poisons exist only when adventure-awarded. My call to make.

## B-34 — first build on Frank's Windows machine: the allow-scripts gate, and a cmd.exe land-mine of my own

Frank ran `npm install` on Windows 10 and the install SUCCEEDED (67 packages — and it resolved
esbuild 0.27.7, exactly what my package-lock pins, so the determinism work held on real hardware).
What looked like a failure was his npm's install-script security gate: `esbuild`'s postinstall was
not on an allowlist, so npm skipped it and warned. His npm is newer than my container's (mine had
no `approve-scripts`; I installed npm 12.0.1 to learn the mechanism first-hand rather than guess).
What I verified: approvals are refused as CLI flags for project installs — they live in package.json
under a top-level `allowScripts` map or in .npmrc; `allow-scripts-pin` defaults to TRUE, which is
why `npm approve-scripts esbuild` writes a VERSION-PINNED key. I ran it here and shipped what it
wrote — `"allowScripts": { "esbuild@0.27.7": true }` — which is coherent because the lockfile pins
0.27.7. STANDING NOTE: when the lock bumps esbuild, re-run `npm approve-scripts esbuild` so the
pinned approval follows it; a stale approval brings the warning back on gated machines.

The second breakage was mine and he hadn't even hit it yet: `"test:minified": "MINIFIED=1 node ..."`
is POSIX env-var syntax. cmd.exe would have died with "'MINIFIED' is not recognized" — inside
`npm run check`, so the whole gate fails on Windows. Fixed portably with no new dependency: the
script passes `--minified` and behaviour.cjs honours the argv flag alongside the env var. I swept
the rest of the scripts and the harness execSync strings for cmd-isms: everything else is
`node`/`tsc`/`vite`/`oxlint` and metacharacter-free command strings — portable. Also added an
honest `"engines": { "node": ">=22.5" }`: server/store.mjs imports DatabaseSync from `node:sqlite`,
so `npm run benchmark` needs it (the check gate itself does not touch the server).

## B-35 — the "1 low severity" line: GHSA-g7r4-m6w7-qqqr, fixed by moving to esbuild 0.28.1

The advisory Frank's install reported (and mine — it shipped in my lockfile all along): esbuild
0.27.3–0.28.0 allows arbitrary file read when running esbuild's OWN development server on
Windows. This project never invokes that server — Vite serves dev, and my harnesses only bundle
to files — but Frank builds on Windows, and "the vulnerable code path is never called" is a
weaker state than "the vulnerable code isn't installed." npm labels the fix a breaking change
only because 0.28 crosses the 0.x semver line; my esbuild surface is a handful of stable CLI
flags, so the gate is the arbiter. Bumped the dep to ^0.28.1: single deduped copy (vite 8.1.5
accepts it — no nested vulnerable copy left behind), `npm audit` now reports 0 vulnerabilities,
the full gate is green at 42/42 including the minified path, and the render smoke is
byte-identical at 101,877 chars. `npm approve-scripts esbuild` self-maintained the pinned
approval — it removed the stale `esbuild@0.27.7` key and wrote `esbuild@0.28.1` — so B-34's
"re-approve after a lock bump" note is a one-command chore, now demonstrated.

Two self-corrections for the record. First: my claim that this container's npm 12 doesn't
enforce the gate was a grep artifact — npm 12 warns with the phrase "install-scripts" (offering
`npm install-scripts approve`), Frank's npm says "allow-scripts" / `npm approve-scripts`; I had
filtered the control-test output for the wrong marker. Two npm generations, two spellings, one
mechanism; the package.json `allowScripts` entry satisfies both. Second: my first attempt at
this very entry silently vanished — I chained the FINDINGS append behind a render smoke that
crashed (script in /tmp can't resolve jsdom; Node resolves from the script's path, not the cwd),
the broken && skipped the append, an unconditional zip ran anyway, and the crash had leaked
src/__r.tsx into it. The lesson is COMPILER_PRINCIPLES-shaped: a deliverable built on the far
side of a failed step is not a deliverable, and cleanup that lives after a crashing line is not
cleanup. Verify the chain, then ship.

## B-36 — Frank's gate run caught my false sweep: two POSIX shell-outs were still in the chain

His `npm run check` on Windows (Node 24.18.0) got five suites deep and died at test:behaviour:
`'cp' is not recognized`. harness/behaviour.cjs line 7 shelled `cp src/app.tsx ... && echo ... >>`,
and immutability.cjs line 23 carried the identical pattern one suite later. B-34 claimed I had
"swept the harness execSync strings for cmd-isms" and found them portable. That was false: I read
transitions.cjs — which uses fs.writeFileSync and is genuinely portable — and generalized to its
siblings instead of opening each file. Probe-before-assert applies to my own claims about my own
code most of all; a sweep that samples one file and vouches for five is not a sweep. This entry
exists so the next "I checked" carries a file list.

The fix is the pattern transitions already used: both bundle-input writers are now
fs.readFileSync + fs.writeFileSync, no shell. The full audit this time, by file: behaviour.cjs
and immutability.cjs were the only two POSIX shell-outs; the `npx --no-install esbuild` strings
(behaviour, immutability, phase1c_bench, transitions) are metacharacter-free and resolve via
npx.cmd under cmd.exe; check_generated shells `node scripts/gen-srd.mjs` (portable); every other
`.exec(` hit is RegExp.exec or SQLite's db.exec, not a shell. Cleanup in both files was already
fs.rmSync. Gate re-verified green end to end, 42/42.

Also on the record from his run: the 165 oxlint items are WARNINGS, zero errors — the gate is
designed to pass them. Most are extraction leftovers (unused imports, fast-refresh notes on
NOTICE_VIEW that the pending NOTICE_VIEW extraction will retire) plus scaffolding for unminted
rooms (ARCHIVE_BOOK_SUBJECTS, PUB_TAP_KINDS). They are backlog, not breakage; a dedicated lint
pass is queued after the Q15 build rather than mixed into it.

And a milestone worth naming plainly: his transcript is the first FULL gate attempt on hardware I
don't control — clean install, 0 vulnerabilities, tsc, lint, both data contracts all green before
the crash. The reproducibility work is holding; what failed was a claim, not the pipeline.

## B-37 — milestone: the full gate ran green on Frank's machine

Windows 10, Node 24.18.0, 25 Jul: install clean at 0 vulnerabilities, tsc, lint (165 warnings /
0 errors), the 186-action contract, generated-data sync, behaviour plain AND minified (both
Windows fixes proven in the same run), immutability 186/186, all 42 transitions, 10,032 fuzz
dispatches with invariants held, and vite built dist/ in 424ms. First complete gate on hardware
I don't control — the portability arc (B-34 → B-36) closes here. One cosmetic note: the Q17
ruling-holders pass silently under the terse ok() while the older hand-written block echoes;
both count into the 42. Not worth touching a green gate for.

## SR-12r — Q15 BUILT: the Eldritch charm is a gift-only item on the holder's clock (supersedes SR-12)

Frank's ruling, 25 Jul, now running: the Observatory's Eldritch Discovery (DMG: 7 nights, roll a
die, even nothing, odd "an unknown power bestows one of ... Charm of Darkvision, Charm of
Heroism, or Charm of Vitality") mints a CHARM ITEM — UNTRADEABLE class, provenance BESTOWED,
name plus a DMG ch. 3 pointer because the Charm text is not SRD (the slot doctrine: I hold the
name and where it came from; the book stays theirs). Gift-only through three actions
(OFFER/ACCEPT/DECLINE_CHARM_GIFT); the trade door bounces the class at tradeLegal. In escrow it
does not age — his words, the timer is in limbo until claimed, so accept just before you sit
down. Acceptance enforces the DMG's own uniqueness line ("you can't gain this Charm again while
you still have it"); a blocked accept stays frozen in escrow. Expiry is EITHER-EVENT-FIRST — the
holder's next resolved Bastion turn or a completed session, whichever comes first — which is a
CORRECTION of what I told him last session ("one clock per holder type; a session doesn't tick a
keep-holder"): his own 17-Jul precedent for the keep's sheet charms says "either complete session
or the next bastion turn, one or the other", belt and braces, and the item rides the same belt.
His to overrule if I've read it wrong. Expired, it does not vanish: renamed "— expired
(decorative keepsake)", logged as faded. One helper (expireCharmItemsFor) serves both hooks:
RESOLVE_BASTION_TURNS after a week actually closes, and COMPLETE_SESSION beside
expireBastionCharms. The die is mkRng(b.id+":"+t.n+":eldritch") — same week, same stars — which
is what lets the harness prove both faces deterministically. Observatory minted as a literal def
(the arcane_study pattern for engine-coupled rooms): level 13, prereq spell_focus (already
implied by both focus prereqs), Roomy, 1 hireling, Empower — plus the chapter's own Observatory
Charm (Contact Other Plane, an SRD spell) on the standard charm field. The full registry-module
mint (life-week beats, furnishing ladders) stays on the remaining-work ledger with its siblings.
Gate 42 → 59, green. FACILITY_SPEC's "BLOCKED — Q15" row unblocks at the next doc sync.

**Q18, OPENED — Frank's call:** do LIVE charm ITEMS count against the ALPG carried-into-session
charm caps (GIFT_LIMITS, 2/5/5/5)? The sheet-gift system counts ch.gifts; I enforced only the
DMG's per-charm uniqueness on items and did NOT merge the two counters — that merge is a ruling,
not an implementation detail.

## SR-13 — Q18 CLOSED (Frank, 25 Jul): live charm items count against the ALPG carried-charm caps

His ruling, in his words: yes — the item "is simply an abstracted delivery mechanism," because
items are the only thing he wants able to change hands, so there are no supernatural-gift swaps
on sheets; and the expired flavor keepsake is AL-inert — "it does nothing." I read his "allowing
the charm to be traded" as TRANSFERRED: the trade lane stays closed per his own Q15(2) ("gift
only so it does not violate the rules"); the item form is the mechanism, the gift door is the
only door. His to overrule if he meant trading proper.

Built across every enforcement point, with three implementation reads flagged as mine:
(1) POSSESSION counts — a LIVE charm item held by a character holds a slot, escrowed-away or
not, pack or no pack; a Charm is on the creature, not in luggage. Expired keepsakes count for
nothing. (2) Items eat slots FIRST in the tier sweep — they cannot be unchecked, so the sheet
yields (normalizeCarriedGifts now takes the state and subtracts liveCharmItemsHeld for the charm
kind; both callers updated). (3) The cap gates the only VOLUNTARY door: ACCEPT_CHARM_GIFT at the
ceiling leaves the gift frozen in escrow with a charmcap notice, claimable the moment a slot
opens — proven end-to-end in the harness, including the thaw. The bestowal itself proceeds — the
DMG bestows, no consent clause — but the week's report flags SR-13 loudly when it pushes a lord
over. The sheet checkbox (TOGGLE_GIFT_CARRIED) and the GiftsSection panel now run the same math,
so the UI can never offer a check the reducer will refuse; the charm row reads
"carried N/L (incl. X charm items)". Gate 59 → 66, green.

## SR-12r ADDENDUM (Frank, 25 Jul) — gift reachability: anyone you wish, that you can FIND

His ruling: a player can gift the charm to anyone they wish, but only to accounts they can
actually find — "people who they have traded with, people on their friends list, DMs they are
being mentored by, etc." Built as reachableAccounts(state, acct), the giver's recorded
relationships: tables they signed onto (co-signups and the table's DM, both directions), trades
that got past PROPOSED ("traded with" is past tense — my reading, his to overrule), the mentor
map both ways, and their store's verifying DMs both ways. The reducer holds the line and the
new item-row picker draws it — which also closes a confession: I had shipped the gift DOOR with
no HANDLE. No UI ever dispatched OFFER_CHARM_GIFT until now; the charm row now offers a
gift-to… picker over findable characters, and a withdraw button while an offer sits in escrow.

Two things deliberately NOT in the graph, awaiting his word: (1) a player-to-player FRIENDS
LIST does not exist as a structure — the seeded `friends` array is NPC companions from
adventures ("Cassyt, acolyte of Kelemvor"), and an NPC is not an account. If he wants the
friends edge, that is a small feature to mint (add/remove friend, mutual or one-way — his
design). (2) Same-store PLAYERS as a blanket edge — in a one-store SCALE that is effectively
everyone, which may be exactly what he wants for Dungeons & Javas, or far too wide; not my
call. Gate 66 → 68, green — after one more B-35-shaped stumble I am recording rather than
hiding: the first gate run of this addendum FAILED on a missing ui.tsx import, and my command
chain shipped the zip anyway past the failure. The artifact was replaced before Frank saw it,
and the lesson count on "verify the chain, then ship" is now two.

## SR-12r addendum RETRACTED (Frank, 25 Jul): reachability is emergent, and the code proved him right

His correction: "I did not expect the reachability was needing to be coded. I figured it would
have been an emergent property of the platform. This feels like a code that is not needed."
He is right, and the platform's own grain proved it on inspection: GIFT_CERT gifts through
plain chips over ACCOUNTS (every player, minus self); trade proposals originate from
conversation THREADS (the person you are already talking to); market trades from listing
matches. Nowhere does a reducer ask whether two people may know each other — finding people
was always emergent from the surfaces where they appear, and the physical constraint stays
physical: you cannot pick a name you do not know.

Deleted: the reachableAccounts graph (1,762 chars of law), the OFFER_CHARM_GIFT reducer gate,
and the harness assertions that tested the law. What remains is only what a <select> cannot
exist without: a population — now the GIFT_CERT precedent one level finer (active characters,
since charms go to characters). Gate 68 → 66, all green; the ruling's real assertions —
escrow freeze, cap, uniqueness, expiry, gift-only — untouched.

FOR COMPILER_PRINCIPLES: when the owner describes how the world BEHAVES, that is not a
specification for a reducer law. Enforcement needs an explicit ask. And the tell was visible
before he said a word: encoding the "rule" required four separate my-reading-his-to-overrule
judgment calls — a rule that needs four judgment calls to encode was probably a description.
The category error has a name now: I transcribed emergence into legislation.

## Charm looks + picker ordering (Frank, 25 Jul) — and friends-as-a-feature parked

Two designs of his, built. (1) PICKER ORDERING: every player profile populates the gift list,
and the accounts he has ACTUALLY interacted with float to the top — sessions shared, trades,
threads talked in, mentor links. Implemented as three optgroups (yours / people you've played,
traded, or talked with / everyone else). This deliberately lives one lesson away from the
retracted reachability law: it is a SORT, not a gate — nothing is hidden, nothing refused,
findability stays emergent; the ordering only saves the scroll. (2) CHARM APPEARANCES: his
design verbatim — players write a description, "or it will randomly assign one from a set of
four segments from d20 tables, each fragment acting as not only a sentence fragment but a
descriptive fragment." src/data/charms.ts: four tables of twenty (form / material / mark /
quirk) under a grammar contract that makes any combination compose — 20^4 = 160,000 looks from
eighty authored lines, house content, [TABLE], zero rules text. The Observatory stamps a look
at mint from the SAME seeded week-stream (same keep, same week, same object), the week's
report describes what arrived, and SET_CHARM_DESC (action 190) lets the holder's owner
inscribe their own words — 240 chars, trimmed, keepsakes very much included, because an
expired charm is exactly the kind of thing one inscribes. Gate 66 → 72, green.

Friends as a FEATURE: he wants it eventually, explicitly not now. Parked on the board with its
open design questions (mutual vs one-way, where it surfaces) — not to be built unbidden.

## Observatory completed + Archive minted (Frank's order, 25 Jul) — first two of the run

**Observatory** is now a full room, not just a mechanic: registered at the arcane_study exemplar
standard — Stargazer role, telescope + star-charts ladders (5 tiers × 9 house-variants each),
8×3 size flavor, 8 ruins, 6 reactions, 96 life-week beats. Its mechanics were already live
(SR-12r/SR-13); this pass gave the room its life.

**Archive** is minted whole, chapter-faithful: Level 13, no prerequisite, Roomy, 1 hireling,
Research. Research is the ENGINE'S FIRST research branch — 7 days, and the hireling "gains
knowledge as if they had cast the Legend Lore spell" (SRD; the ledger records the pointer and
the topic if one rode the order via o.topic, and the telling is the table's). The Library will
refine the shared branch at its own mint. The Reference Book follows the slot doctrine: the
DMG's five titles are non-SRD proper nouns (Bigby's, Chronepsis…), so the platform stores the
SUBJECT and the goat reads the Exchange's own edition, keyed by the house — ARCHIVE_BOOKS,
8 forms × 5 subjects, forty distinct titles, because a cavern's archive and a ship's do not
hold the same books. FORMAT §7's "7 forms × 5" table never migrated from the monolith and
predates the hamlet form; re-authored at today's eight. SET_ARCHIVE_BOOK (bastion action 27;
190 → 191 total) shelves it ONCE — "your Archive contains one copy of a rare and valuable
reference book" — and a second choice is refused; re-shelving around a different book is a
future ruling of Frank's, not a toggle. The modal grew the handle: five subject chips, the
house's title on hover, the shelved title displayed after. The monolith-era books[] array
design is superseded by the subject field — one book is what the chapter grants. The staged
ARCHIVE_BOOK_SUBJECTS const graduated from app.tsx into data (one lint warning retired).
Registry module at full standard, same counts as Observatory. Gate 72 → 84, green.

## Frank's title engine (25 Jul) — supersedes yesterday's forty fixed titles

His design, built as spoken: roll 1d6 for the number of segments; six tables of 1d12 fragments
that clip together like Lego; "compose them as we see fit to make a valid hierarchy" — the
hierarchy being my delegated craft. The six tables are grammatical ROLES: T1 subjects (a noun
works alone at length 1), T2 verbs (length 2 is a subject and a verb, and every verb also takes
T3's object), T3 objects, T4 adverbial manners, T5 the HOUSE in its own voice (form-keyed,
8 × 12 — a cavern's archive and a ship's still do not title alike), T6 a closing flourish. The
slot-map is fixed per length, so every roll reads as a title. Space: 12 + 12² + … + 12⁶ =
3,257,436 per house per subject, asserted as arithmetic, not luck. The seed carries house +
shelf + subject, so a keep's history book is minted once and stays itself: SET_ARCHIVE_BOOK
stores the title on the INSTANCE (fac.bookTitle — what THIS copy is, the §5 doctrine), the
ledger names the very title, the modal chips preview each subject's actual book on hover, and
every Research week the report names "the volume most thumbed" from the same engine — a fresh
mint for the player weekly, as he asked. Yesterday's forty curated titles are deleted, on his
design, one session old, no sunk cost; the harness now holds the engine's structure (each
length's exact composition proven against stubbed dice), determinism, and the space. One
probabilistic assert was written and replaced the same hour: forty draws WILL collide at short
lengths, and a gate must never bet on dice — the space claim is arithmetic.

Also delivered alongside, at his request: what the room's mechanics actually DO — Legend Lore
(SRD 5.2.1) and the DMG book benefit — laid out in the session so the standing pointer-only
treatment is now his informed ruling rather than my default.

## Q19/Q20 — Frank's d100 lore tables (25 Jul): FR-canonical research topics, region-first

His design, built as specified: "make the subject a d100 roll per region based on the canonical
lore and famous people of each region... global subjects to fill in the d100." Implemented as
skill-TAGGED topics — my one mapping, flagged for his correction: the Reference Book KEEPS its
five skills (the DMG hangs Advantage on the skill), and the d100 governs the RESEARCH TOPIC,
each entry tagged with the subject(s) it feeds so "I studied X" tells the DM which check to
negotiate. rollLoreTopic: region entries first, the global pool filling the remainder of the
hundred, verbatim his fill rule. Topicless Research now auto-rolls (seeded keep+shelf+week) and
the week's report says the topic AND "Say so at the table — it feeds History / Arcana"; a typed
topic rides the order's existing detail lane verbatim, untagged. Content shipped this tranche:
56 global topics + all seventeen regions stocked (the twelve AL-season regions at ~10 each, the
five classic-Realms regions at 6 starters) — 166 entries.

**Q19, RESOLVED BY HIS OWN PRECEDENT + one open hygiene question:** BASTION_REGIONS has shipped
canonical Realms names since before this session, under his own header: "canonical place
references, not book text; edit freely." The lore tables are the same species at scale — names
and pointers, never passages. The open piece: whether to add the standard Wizards Fan Content
Policy notice to the app footer and README, which is the customary hygiene when fan content
references WotC IP at this density. Recommended; one paragraph; his call. Until ruled, the
tables carry the doctrine comment inline.

**Q20, OPEN — canon accuracy cadence:** these 166 entries are drafted from general knowledge and
CANNOT be cited to a source in /mnt/project; the never-invent rule was forged on RULES text, and
lore names are a different species — but a wrong name is still wrong. The tables are data, not
law: player-typed topics always override, and the DM adjudicates at the table regardless.
Proposed cadence: Frank reviews per-region as tranches land and strikes what canon disagrees
with; deeper region tranches (toward the full hundred local entries) fill on his request,
region by region, rather than a thousand unreviewed lines at once.

## Q19 + Q20 CLOSED (Frank, 25 Jul) — the notice is wired, the hundred is full, the wiki is the source

Q19: "yes please cite accordingly" — the Wizards Fan Content Policy notice now renders in the
app footer and stands in README beside the CC-BY-4.0 line, in the policy's required wording.
Harness-wired: the gate fails if either copy goes missing. Q20: "use [canon and the public
wiki] as sources and fill the rest of the table with non-repeating Toril trivia" — the global
pool is a TRUE d100 (56 → 100), its new forty-four reaching across Toril: Kara-Tur, Zakhara,
Maztica, Rashemen's Wychlaran (the tranche's oddest spelling, verified directly on the
Forgotten Realms Wiki, whose page cites Unapproachable East), Abeir, Imaskar, Thultanthar,
Serôs, the Twisted Rune, mythals, and their kin. The wiki is now the reference of record for
lore names — recorded in the data header — and each future per-region tranche gets its own
wiki pass as it lands. Non-repetition is asserted within every pool AND across: no region
entry duplicates the global trivia. Deep regions displace the global tail by design; the
region's own canon outranks trivia.

RENDER BASELINE MOVED, INTENTIONALLY — the first time since the refactor began: the footer
renders on every paint, so the byte-identical streak at 101,877 chars ends here by design, not
drift. The new length is recorded below by this gate run; the smoke test's job is unchanged —
non-crash plus a stable number — and the number is simply new.
Pinned by that run: 102,012 chars (was 101,877; delta = the notice itself). This is the number
future byte-identical claims measure against.

## Book minting (Frank, 25 Jul) — the cool book goes home

His design: "mint an item that is the book because it's just flavor... the player can click on
the title they find interesting and add it to their inventory... a decorative item going into
the inventory as a point of reference because a player thinks a book is cool." Built: every
Research week now hands the UI a MINTABLE object beside its prose (no string-parsing — the
title, the week's topic, and a wiki link ride as data), and both full-turn views render the
click: "📖 Add «Title» to the pack", flipping to "on the shelf" once owned. MINT_BOOK_ITEM
(action 192) mints a STORY_ITEM with ARCHIVE provenance ("archive copy"), notes that say
plainly "Flavor only; it does nothing," and a once-per-title-per-shelf guard — click twice,
own once. The ledger records the copying, title and all.

Two scoping counsels of mine, his to strike: (1) the wiki link rides the week's canon TOPIC
(our Q20 reference of record), never the generated title — «The Drowned Bells Answer the
Flood» has no page, and a link to nothing implies canon that doesn't exist; he pre-flagged
"that might be a step too far, you can tell me," and this is the honest version of the step.
(2) The mint point is the weekly volumes only; THE rare Reference Book stays un-copyable under
the DMG's one-copy clause. Gate 100 → 105, green. Render baseline holds at 102,012 — the seed
has no research turns, so no buttons on first paint.

## The chronicle lane (Frank, 25 Jul) — region canon in the house's binding

His second title ruling: "Rath should receive books whose titles point to events in the Moonsea
and famous people of that region, written in a way to fit books that would appear in a
fortified keep." Built as his two systems shaking hands: the d100 LORE POOL supplies the canon
(events and famous people, wiki-sourced per Q20), a chronicle FRAME dozen binds it the way a
library actually titles an account, and the house table keeps the register — "An Account of the
ruin of Zhentil Keep, from the Watch-Reports." The frame table is the chronicle lane's own d12
beside his six, flagged his to strike. Mechanics: a known topic FORCES the lane (the weekly
volume is now ABOUT the week's own study, typed or rolled); offered the region's pool, the lane
chronicles it two rolls in three and stays abstract the third — variety survives, provably
(the abstain path is asserted to the exact abstract title, not hand-waved). The shelved
Reference Book draws from the region's pool FILTERED BY THE SHELF'S OWN SKILL — a keep's
history book chronicles the region's history — falling back to the whole regional pool, then to
the abstract lane for region-less keeps (legacy behavior byte-preserved for topic-less calls;
the pre-existing length-hierarchy assertions pass untouched). End-to-end: the shelving test now
proves fac.bookTitle BYTE-EQUAL to the same seed run through the same pools with the real
mkRng — after I first wrote two decorative assertions (a `|| true` and a typeof check) and
replaced them the same hour; a gate must not carry ornaments. Gate 105 → 111, green.

## Region tables minted to depth (Frank's ruling, 25 Jul) — the Archive is now finished

His correction, verbatim standard: "If you are creating the archive you need to mint each region
accordingly rather than doing them later for no reason. The archive is not finished until the
region tables are made." The tranche cadence I proposed is SUPERSEDED — complete-at-mint is the
standard, and it now applies to any future lore-bearing room. Delivered: all seventeen regions
at 50+ local entries (moonsea 57, underdark 52, barovia 60, swordcoast 57, waterdeep 60, chult
51, baldursgate 53, avernus 51, icewinddale 52, feywild 51, wildspace 50, neverwinter 50,
silvermarches 52, cormyr 50, dalelands 51, heartlands 51, dessarin 51) — 899 regional topics,
999 with the global hundred. The harness floor assertion is raised to 50 and enforced; it
FAILED once mid-build at 45/44/43 and was answered with entries, not a lowered bar.

Method on the record: three authoring passes plus top-ups, with PRUNE-ON-DOUBT discipline —
any entry I doubted mid-draft was struck rather than shipped, which is why counts land 50–60
rather than a uniform target. The wiki remains the reference of record (Q20) and Frank's
strike-pass stands; one placement was self-caught during the build and reworded region-true:
the Well of Dragons sits in the Sunset Mountains, so the Moonsea table now carries "the dragon
cult's Mulmaster cells in the tyranny years" instead. Every region's d100 is now local-MAJORITY
(50–60 local + the global tail), which is what his fill rule always meant once the tables were
made. Also on the record: long chronicle titles APPROVED — "it fits early published titles."

## Armory mint (26 Jul) — Level-5 Trade room, completed in full

- **BUG (DMG compliance) fixed:** the d8-for-d6 defender-loss upgrade and the expend-on-event
  had landed for **Attack only**. `rollAidOutcome` hardcoded `d6()` and never read `armed`, so a
  stocked Armory did nothing for **Request for Aid** and never expended there. DMG (Bastions.md
  452–458) says the upgrade applies when *"any event causes you to roll dice to determine if your
  Bastion loses one or more of its defenders … roll 1d8 in place of each d6,"* and Aid is such an
  event (1d6 per defender sent; a low total kills one). Fix: `rollAidOutcome` rolls d8 when armed;
  `stageBastionAid` expends the stock after resolving. Both sites now match the rule.
- **One stocking path:** new shared `stockArmory(s, ch, date)` in engine.ts. Both the off-turn
  **Arm button** (`ARM_BASTION`) and the **Trade order** call it, so cost/guards/`armed` can't drift.
  `ARM_BASTION` refactored to route through it; unused `armoryCost`/`bastionHas` imports stripped.
- **DESIGN CHOICE (Frank can veto):** the Armory's **Trade order STOCKS** (spends gold) rather than
  the generic Trade's *sell-for-gold* (`producesGp`). Wired as a facility-specific branch in
  `resolveBastionOrder`, exactly the way Research special-cases the Archive — no new turn-engine
  architecture. Cost 100 + 100/defender, halved by a Smithy (unchanged, DMG-cited).
- **Content:** full `registerFacility` at Arcane-Study bar — Quartermaster role; mannequins/racks/
  hooks/chests furnishings; armorstand+weaponrack ladders across all 8 forms; 8×3 sizeFlavor; 8
  ruins; 6 reactions; 8×12 life-weeks. `BASTION_FACILITIES.armory` def added.
- **Gate:** `npm run check` green (tsc, oxlint, 4 check/behaviour suites, transitions **118/118**,
  vite build). +7 Armory assertions (def, cost=400, no-double-charge, Smithy=200, Trade-stocks).
- **Build state:** special facilities now **4/29** (Arcane Study, Observatory, Archive, Armory);
  basics 6/6. Next L5 to mint: Barrack, Garden, Library, Sanctuary, Smithy, Storehouse, Workshop.

## Armory / Bastion-attack design complaint (26 Jul) — owner (Frank)

**Filed as a complaint, not a change.** The DMG's Armory + Bastion-attack model is poor design,
and the Exchange follows the letter of it only because AL requires it.

- The Armory is a flat on/off flag with a whole-armory expend "regardless of how many you lost"
  (DMG, Bastions.md 458–460). It refuses any per-defender accounting on purpose.
- The Attack is a fixed die-pool (6d6, 4d6 walled) decoupled from defender count; Walls are a bare
  die-count cut with no fictional handle; Aid is a separate sum-vs-10. Three unrelated abstractions
  for what is one idea (are my people equipped, and did they get hurt).
- The result: the character pays full price to restock after every scrape, wins nothing legible for
  it, and the system is "easier at the home table" for no real gain — a simplification that costs the
  player gold and costs the fiction its texture.
- The design that SHOULD have shipped is recorded in `src/bastion/engine.ts` above `rollAttackOnes`:
  one die per defender, 1d6/1d8 by that defender's own armor, Walls as attacker-disadvantage
  (reroll, take the worse-for-attacker die), a 1 kills / a 2 breaks gear, and dynamic per-defender
  restock. Deferred under AL; kept as a design note and this complaint for the record.

**Shipped instead:** the DMG model verbatim, plus free flavor — the Stock Armory narration now names
each Bastion form's own kit (`ARMORY_KIT_BY_FORM`), since flavor never touches legality.
