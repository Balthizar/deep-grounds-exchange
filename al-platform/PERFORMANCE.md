# Performance triage — measured, not guessed

All numbers from this codebase, this session. Method matters more than the numbers: every
claim below came from running something, because the obvious optimisation turned out to
target the wrong thing.

## What was measured

| thing | result | verdict |
|---|---|---|
| reducer, one action | **0.04 ms** | fast — leave it alone |
| `seed()` | 0.26 ms | fine |
| full app render (SSR) | **~62 ms** | the main cost |
| filter+sort, 19 items | 0.003 ms | irrelevant |
| filter+sort, 380 items | 0.107 ms | still irrelevant |
| filter+sort, 4,000 items | 1.3 ms | starts to matter |
| bundle, single file | 1,354 KB / **396 KB gzipped** | the user-facing cost |

## The finding that changed the plan

The app has **5 `useMemo`, 0 `useCallback`, 0 `React.memo`** across 109 components, and every
view rebuilds its derived lists on each render. That looks like the obvious thing to fix.

It isn't. The seed carries **8 characters, 19 items, 8 log entries** — scanning that costs
0.003 ms. The 62 ms render is the **component tree itself**: 3,695 JSX elements, 343 `.map()`
loops. Memoising the filters would optimise three microseconds.

Premature memoisation would also have cost something real: `useMemo` everywhere adds
dependency arrays that go stale and cause bugs that are miserable to find.

## What was actually done

**Code splitting** (`vite.config.ts` → `manualChunks`). One 396 KB download became three
independently cacheable ones:

| chunk | gzipped | changes |
|---|---:|---|
| `vendor` (React) | 60 KB | almost never |
| `content` (SRD + authored data + facility registry) | 117 KB | rarely |
| `index` (app code) | 218 KB | constantly |

Editing app code now re-downloads **218 KB instead of 396 KB**; React and the content chunk
stay cached across deploys. Same total bytes on a cold load — the win is on every load after
the first, which is most of them.

## What to do later, and the trigger for each

- **`React.memo` on the big views** (`BastionWorkspace`, `AdminView`, `OrganizationView`,
  `DMDeskView`) — this is the real render lever, since today any state change re-renders
  everything. Do it when a view feels sluggish, not before.
- **Memoise derived lists** — worth it at roughly **4,000+ items**, i.e. a club with years of
  history. `RetirementView`, `ResourcesView` and `OrganizationView` do the most scanning
  (12–19 filters each) and would go first.
- **Lazy-load the content chunk** — possible, but the facility registry populates at load
  time, so it needs `registerAll()` to land first.

## What NOT to touch

The reducer's copy-on-write Proxy (lazy `structuredClone` per touched record) is doing real
work: 0.04 ms per action on a 37 KB state. It is the best-performing part of the codebase.

## Phase 1c — the scale fixes, measured (same box, same fixtures as the 2x-AL review)

The review's before-numbers are the left column; these are the same benchmarks re-run after.

| path | before | after | note |
|---|---:|---:|---|
| idle 1 Hz tick, 50k chars | 81 ms **per tick** | **0.0015 ms** | NEXT_DUE watermark: a comparison while nothing is due; any bastion action re-arms one scan |
| targeted write + 1 ledger line, 10k/100k | 8.6 ms | 1.0–2.3 ms | overlay draft: O(records touched), not O(population) |
| same, 50k chars / 500k logs | 98.2 ms | 4.9–16.8 ms | ~8 ms of the residue is the ledger array slice — see floor note |
| RESOLVE, 12,500 keeps due, 50k chars | 8.8 s frozen | ≤250 keeps per dispatch (~0.8 ms/keep) | Sunday night spreads across ticks; nothing waits more than seconds, UI never freezes |
| PUSH_SWEEP, 50k chars, worst case (every account active) | 7.1 s | 0.95 s | one raw bucket pass + exact per-account reports; typical mostly-idle sweep is prepass only |
| item index after an action that didn't touch items | ~1 s rebuild @400k items | pointer retarget | index dies only when `items` was actually drafted |

**The ledger-slice floor.** DEEP arrays still shallow-copy on first touch: 500k refs ≈ 8 ms on
this 1-core box, and that is now the dominant cost of any log-writing action at that size. It
is bounded by design — the client's ledger is a working set; the forever-ledger lives in the
server store (`server/`), where an append is an indexed INSERT. Overlaying arrays too is
possible (append-only tail + edit overrides) and deliberately not done: three actions edit
entries in place, array-index virtualisation is where subtle bugs live, and the win at client
scale (≤100k rows → ≤1.6 ms) doesn't buy the risk.

**Method note, owned:** the review benchmarked "SET_BIO" as its touch-1 probe; SET_BIO writes
an account map, not the character, so both its before and after were near-no-ops. All Phase 1c
touch-1 numbers use SET_BASTION_REGION (real write + ledger line). The server harness's VERIFY
step is what caught it.
