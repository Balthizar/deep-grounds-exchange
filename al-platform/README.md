# The Deep Grounds Exchange

An organised-play management platform for D&D Adventurers League: character rosters and item
provenance, session scheduling and DM certification, a player-to-player market, organisation
and store administration, and a persistent Bastion (keep) life-simulator.

**Status: interactive prototype.** It runs entirely in the browser with no backend. State is
seeded on every load and is not persisted. See `OPEN_QUESTIONS.md` for what stands between this
and a deployable multi-user platform.

## Running it

```bash
npm install
npm run dev      # live dev server; open the URL it prints
```

| command | what it does |
|---|---|
| `npm run dev` | dev server with hot reload |
| `npm run build` | production build into `dist/` |
| `npm run preview` | serve the built `dist/` locally |
| `npm run check` | **the full gate**: typecheck, action contract, generated-data drift, behaviour (normal + minified), immutability, transitions + fuzz, build |
| `npm run generate` | regenerate the composed SRD data from `srd-source/` |

Run `npm run check` before committing anything structural.

## Architecture

Dependencies point **down** this stack and never back up. There are no import cycles.

```
types  <  data  <  lib  <  feature packages  <  reducer  <  app.tsx
```

| layer | what lives there |
|---|---|
| `src/types.ts` | domain shapes and the `ActionType` union |
| `src/data/` | pure authored literals and generated SRD data - no dependencies |
| `src/lib/` | shared rules, primitives, and UI used by more than one feature |
| `src/bastion/` `player/` `market/` `sessions/` `org/` `admin/` `social/` `authors/` | feature packages, each owning its screens **and** its modals |
| `src/reducer/` | reducer cases, split by domain |
| `src/seed.ts` | the demo state - *composes* state, so it sits above the features, not in `data/` |
| `src/app.tsx` | shell: routing, the reducer shell, the modal router |

**Two rules that keep this honest:**

1. **No feature imports another feature.** Anything two features share moves down into `lib/`.
   (One documented exception: `player/ui` renders `BastionRegionLine`, because the profile page
   shows a character's bastion region.)
2. **If `lib/` needs something from a feature package, the thing is in the wrong package.**
   Move it down; do not import upward. Six misplacements were found this way.

The Bastion is the most developed package and the model for the rest:
`registry.ts` (what a facility *is*) - `engine.ts` (how a keep *behaves*) - `actions.ts`
(reducer cases) - `ui.tsx` (what the player *sees*).

## Reproducing the benchmark

The server stress harness is a first-class, single-command reproduction target (this section
exists because an independent review attempted reproduction and stalled on an undeclared
dependency — see FINDINGS, Phase 1c addendum):

```bash
npm install                     # or: npm ci  — esbuild is a declared devDependency
npm run benchmark -- 20000      # shakedown (~10 s build, ~1 min total)
npm run benchmark -- 1000000    # the 1M-character fixture (~5 GB disk, ~6 min build)
```

Guarantees the harness now makes to a reviewer:

- **Preflight before any work.** Node ≥ 22.5 (for `node:sqlite`), `node:sqlite` loadable, and
  esbuild resolvable are all checked before a single row is built. A missing dependency is an
  immediate, named error with the fixing command — never a silent stall.
- **No network, no npx, no cache at benchmark time.** The reducer is bundled through esbuild's
  JS API loaded from `node_modules` directly. If it isn't installed, you are told so.
- **Strict arguments.** `--help` prints usage; anything that is not a positive integer is
  rejected before execution. `RESUME=1` continues an interrupted fixture build; `BUILD_ONLY=1`
  builds without measuring.
- `server/_cases.cjs` is a build artifact, regenerated every run and never shipped — a
  prebuilt reducer bundle can go stale against `src/`, which is a failure mode this project
  has already logged once.

## Data and licensing

Game content comes from the SRD under CC-BY-4.0. `srd-source/` holds the source of truth;
`scripts/gen-srd.mjs` and `scripts/gen-magic-tables.mjs` compose the lean data the app ships in
`src/data/srd/`. **Generated files are not hand-edited** - change the source and regenerate.

An AL legality layer sits on top of the SRD composition and is cited rule-by-rule in
`SRD_AL_SWEEP.md`. Where the SRD cannot legally supply content, the app ships a **typed slot**
instead of an item name - the player enters it from their own book and a DM verifies it. That
is why no published item table is reproduced anywhere in this repository.

## Verification harness

`harness/` holds tooling built during the refactor. It exists because of specific bugs, and the
comments record which:

| tool | what it protects |
|---|---|
| `fingerprint.sh` + `compare.mjs` | every registry and dataset compared by **runtime value**, not source text |
| `behaviour.cjs` | dispatches real actions through every domain; `MINIFIED=1` runs it against a minified bundle |
| `check_actions.cjs` | asserts each reducer's declared action list matches its cases, and that their union equals `ActionType` |
| `immutability.cjs` | dispatches **all 182 actions** against a deep-frozen previous state; catches any write that leaks into state React still holds |
| `check_generated.cjs` | regenerates `src/data/srd/` and fails if it drifts from `srd-source/` |
| `transitions.cjs` | all 182 actions x 3 universal properties, 16 hand-written transition assertions, and a time-boxed fuzz (~9,000 dispatches) checking invariants after every step |
| `extract.py` | safe block extraction with an overlap guard |

Every mutable top-level collection must be listed in `DEEP` or `FLAT` in `app.tsx`. One that is
in neither is handed out **by reference**, and writing to it corrupts the previous state
silently — 26 were unclassified and 9 actions were caught doing exactly that. Add a collection
to `AppState`, classify it in the same commit; `npm run test:immutable` enforces it.

The fingerprint compares **data** and cannot see routing. When the reducer cases were split
out, the unknown-action guard silently switched itself off and the fingerprint still reported
IDENTICAL. That is why the behavioural gate exists - and why it now runs minified too.

## Documentation

| file | contents |
|---|---|
| `OPEN_QUESTIONS.md` | unfinished work, decisions awaiting a ruling, and the external review's findings |
| `IDEAS.md` | features discussed but not built, with their traps recorded |
| `SRD_AL_SWEEP.md` | the AL legality audit, every rule quoted and cited |
| `MAGIC_TABLES_REVIEW.md` | all 20 magic-item table tiers, row by row |
| `PERFORMANCE.md` | what was measured, and triggers for deferred optimisations |
| `SNAPSHOT_README.txt` | refactor history and the reasoning behind the structure |

## Windows quickstart (first build)

`npm install` succeeding with an `allow-scripts` warning is NORMAL on a gated npm: the install
worked; npm just skipped esbuild's postinstall pending approval. Three commands and you're green:

    npm approve-scripts esbuild
    npm rebuild esbuild
    npm run check

Then `npm run dev` serves the app. Notes: the approval is version-pinned by npm policy and I ship
it in package.json matching the lockfile — if a future lock bump moves esbuild, re-run
`npm approve-scripts esbuild` once. `npm run benchmark` (the SQLite server stress) needs
Node >= 22.5 for `node:sqlite`; the check gate itself doesn't touch it.

## License & attribution

The Deep Grounds Exchange is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.

Rules content is drawn exclusively from the System Reference Document 5.1 and 5.2.1, used under
the Creative Commons Attribution 4.0 International License (CC-BY-4.0). Canonical Forgotten
Realms names appearing in region and lore tables are references, never book text, per the
project's standing doctrine; the Forgotten Realms Wiki serves as the reference of record for
those names (Q19/Q20, FINDINGS).
