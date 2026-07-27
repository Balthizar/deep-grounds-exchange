# The Exchange at Ridiculous Scale — Core Structure, Measured, Then Extrapolated

**What you asked for:** finalize the core server structure, stress it toward the table below, find where it breaks, and simulate the rest with math rather than building a false 500M-row database.
**What this is:** the core structure, built and delivered (`server/`, six files); real measurements at 20k → 100k → **1,000,000 characters** on a deliberately weak box (1 core, 3 GB RAM); and the extrapolation to your full table as arithmetic on measured constants, with every constant's provenance stated.

Your stress table: **10,000 orgs · 20,000 stores · 1,000,000 players · 100,000 DMs · 5,000,000 characters · 500,000,000+ adventures logged.**
Load model (from the previous ruling): 10% of players online at peak, one action per ~25 s each → **4,000 actions/second sustained** is the number the single writer must survive.

---

## 1. The core structure, finalized

Six files in `server/`, all delivered and exercised:

| file | what it is |
|---|---|
| `schema.sql` | The ruling, encoded: **records stay whole** (same JSON the reducer reads today) with **query fields as indexed columns** (owner_id, next_due_at, char_id, event_id, available), an **append-only ledger** shaped for 500M rows, and **rollup counters** so a report is a point read, never a survey. |
| `db_draft.mjs` | Your lazy-clone Proxy, one level deeper: first touch **loads from SQLite** instead of cloning from memory; writes mark dirty; `commit()` writes only dirty rows. Same contract the reducer already holds — which is why the reducer didn't change. Plus the guard the review promised: `Object.values(s.characters)` **throws** ("POPULATION MATERIALIZATION") instead of killing the process at 5M rows. Verified firing. |
| `store.mjs` | DB open + pragmas, prepared statements, the **group-commit dispatcher** (N actions per transaction, one fsync), and the **query layer**: `dueCharacters` (the tick as an index probe), `accountSlice` (the client's download), keyset `marketPage`, `orgReport` off rollups, `ledgerPage`. |
| `reducer_bridge.mjs` | Bundles `src/reducer/*` and `src/bastion/actions.ts` **byte-for-byte as they ship today** and routes actions exactly like `reducerImpl`. |
| `stress.mjs` | The harness: resumable fixture builder at your ratios, dispatch/throughput/latency suites, query benches, durability modes, guard test, and **read-back verification** of every claimed write. |

**The headline validation held:** `SET_LIFESTYLE` and `SET_BASTION_REGION` — untouched reducer cases from `src/` — dispatched through the DB draft, committed to SQLite, and **read back correct** (VERIFY: OK, both the character mutation and the ledger append). The port really is the draft, not the reducer.

**One correction, per the Jerry standard:** my first throughput runs used `SET_BIO` as the touch-1 write, and the harness's own VERIFY step caught me — `SET_BIO` writes an account-keyed `bios` map, not the character, so it no-oped against the fixture and produced fictional 160k act/s numbers. All throughput figures below use `SET_LIFESTYLE`, a genuine owner-gated character write, and are read-back verified. (Worth knowing: the client review's "SET_BIO flat at 0 ms" measured the same near-no-op on both sides of the comparison, so its *conclusion* about the lazy draft stands on the region-write numbers, which were real. The harness principle — never accept a number a parser controls — applies to benchmarks too, and it just proved it.)

---

## 2. What was measured (1 core, 3 GB RAM, node:sqlite / SQLite 3.51)

### The scaling curve

| metric | 100k chars (0.5 GB db) | 1M chars (5.2 GB db) | scaling class |
|---|---:|---:|---|
| dispatch: touch-1 write, batch=1 | 4,095 act/s | 3,140 act/s | ~log N |
| dispatch: touch-1 write, batch=128 | 6,205 act/s | **5,360 act/s** | ~log N |
| dispatch: +ledger line, batch=128 | 6,085 act/s | 4,417 act/s | ~log N |
| **mixed 70/30, batch=128** | 7,412 act/s | **5,489 act/s** | ~log N |
| per-action latency (mixed) | p50 0.06 / p99 0.66 ms | p50 0.07 / p99 0.73 ms | flat |
| point read: character by id | 0.020 ms | 0.041 ms | log N (b-tree depth) |
| tick: due characters, LIMIT 200 | 0.010 ms | **0.010 ms** | **O(1) in population** |
| account slice (login payload) | 1.3 ms | 7.7 ms | IO-bound, cold pages (§4) |
| ledger page: 50 recent of 15M | 0.077 ms | 0.49 ms | log N |
| bulk insert: characters | 61k rows/s | 52k rows/s | — |
| bulk insert: ledger | 79k rows/s | 63k rows/s | — |
| on-disk cost, everything + indexes | 258 B/row avg | **267 B/row avg** | flat |

### Where it broke, on schedule — and the measured fix for each

1. **OFFSET pagination.** Deep market pages cost 20 ms at 100k, **64 ms at 1M** — O(offset), would be seconds at 40M items. Fixed in the query layer with keyset pagination (`WHERE available=1 AND id > ? LIMIT 50`): **0.19 ms, 340× faster**, flat at any depth. OFFSET is banned from the request path.
2. **Live COUNT(*).** Platform-wide count over the 15M-row ledger: **246 ms** — linear, extrapolates to **~8 s at 500M**. The maintained rollup: **0.003 ms, constant** — an 80,000× gap that becomes 2,700,000× at full scale. Counts are maintained, never surveyed; the schema and draft both carry the mechanism.
3. **fsync per action.** With honest durability (`synchronous=FULL`) at batch=1, the single writer collapses to **1,078 act/s** — the fsync floor (~0.9 ms on this disk). Group commit at batch=128 restores **5,019 act/s at the same durability**. This is the entire answer to "SQLite has one writer," now measured rather than asserted. (Shipped default is WAL + `synchronous=NORMAL`, documented in the schema: app-crash durable; an OS-level crash can lose the last batch — a ruling that's yours to keep or tighten.)
4. **Population materialization.** Any stray `Object.values(s.characters)` in a dispatch throws by name instead of OOM-killing the process at 5M rows. Guard verified firing.
5. **The container itself.** A backgrounded fixture build was reaped by the sandbox mid-ledger (~9M rows in); the builder is now resumable, which you'll want anyway the first time a 500M-row build hiccups on your hardware at hour two.

---

## 3. The extrapolation — arithmetic, with provenance

**Storage at the full table.** Measured per-row costs including indexes (267 B/row composite; per-table from fixture deltas: characters ≈ 760 B, items ≈ 400 B, ledger ≈ 230 B):

| table | rows | size |
|---|---:|---:|
| characters | 5M | ~3.8 GB |
| items (8/char) | 40M | ~16 GB |
| **log_entries** | **500M** | **~115 GB** |
| accounts, orgs, stores, members, sessions, notices | ~1.5M | ~1 GB |
| **total** | | **~135 GB** |

Comfortably a disk, nowhere near a heap — which is the point of the topology. SQLite's own ceilings (theoretical 281 TB; tables of billions of rows in production use) are two orders of magnitude away.

**Throughput at 5M characters.** Dispatch cost is dominated by b-tree probes and row (re)writes; both grow with tree *depth*, which grows with log(N). Measured 100k→1M (10×): mixed throughput fell 7,412→5,489 (×0.74). 1M→5M is a smaller factor (5×, ~1 added level in the deepest indexes): projecting the same per-level cost gives **~4,300–4,800 act/s sustained on one core of this weak box** against the 4,000 target. That is *met, with thin margin* — so the levers, in the order I'd pull them: `better-sqlite3` on real hardware (same engine, materially faster bindings — this box couldn't compile it, ruling out only the measurement, not the production choice); a real server's cache (`cache_size`/`mmap` sized so the hot index pages never fault — see §4); and if ever needed, read replicas via WAL snapshots, since 4,000/s is *writes* — reads already scale out. What does **not** get pulled: a second writer. The arithmetic doesn't ask for one.

**The tick at full scale.** `dueCharacters` measured **0.010 ms flat from 20k to 1M** — it's O(log N + batch), independent of population. At 5M keeps with weekly turns, steady-state due-rate ≈ 8/second; a 200-per-batch resolver is loafing. The 1 Hz scan that cost 81 ms/s client-side is now a rounding error, permanently.

**The ledger at 500M.** Append rate measured 63–79k rows/s during bulk build — three orders of magnitude above the ~50 logged-adventure rows/s that even your peak implies. Reads never touch table size: `(char_id, seq DESC)` paging measured 0.49 ms at 15M rows, ~0.7 ms projected at 500M (one more index level). The design constraint that mattered — *the ledger grows forever* — is the one this table is shaped for.

**Client payload.** `accountSlice` (5 characters + gear + 50 ledger lines each + notices) is ~100–300 KB of JSON — the "they download only what they need" ruling, priced: at 4,000 peak logins/minute that's ~13 MB/s egress, trivial.

---

## 4. Honest limits of the simulation

- **The 7.7 ms account slice is a cold-page number.** 5.2 GB file, 64 MB cache, 256 MB mmap, random accounts → real disk faults. It's still 6× under the 50 ms gate on the worst box I could give it; on a server with RAM sized to the hot set (indexes + recent pages ≈ 10–20 GB at full scale) it converges toward the 100k figure. The fix is a `PRAGMA` and a hardware line-item, and the number to watch is exactly this one when you run the harness on your machine.
- **1M measured, 5M extrapolated.** The curve 20k→100k→1M behaved log-like at every point, and 1M→5M adds less depth than 100k→1M did — but the harness is resumable precisely so the full fixture (~30 GB at 5M chars with a 50M-row ledger sample, or the whole 135 GB if you let it run overnight) can be built on your hardware: `node server/stress.mjs 5000000`. The 500M-row ledger claim rests on measured linear append + log-depth reads; nothing in SQLite's structure introduces a new term between 15M and 500M rows.
- **This box's fsync (~0.9 ms) is ordinary.** A server with a faster or battery-backed disk raises the batch=1 floor; group commit makes the question mostly moot.
- **node:sqlite is experimental; the numbers are conservative.** Production runs `better-sqlite3` — same C library, faster bindings.

## 5. The port inventory (what changed, what didn't, what's next)

**Ran unchanged:** owner-gated record writes and ledger appenders — the shape of most of the 186 actions (`s.characters[id]` → mutate → done). This is the majority of the reducer by count.
**Replaced by the query layer, by design:** the tick (`dueCharacters`), PUSH_SWEEP (rollup watermarks), market listing (keyset page over the `available` index), org reports (rollups). These were the review's four fires; each is now an indexed query with a measured cost.
**Not yet ported — the named leftovers for the finalization pass you're heading into:** account-keyed top-level maps (`bios`, `avatars`, `pushMarks`, …) need either an `accounts.json` merge or their own thin tables; `notices` auto-clear predicates become `WHERE` clauses; the static `ACCOUNTS` constant must die for the accounts table (the registration flow you already have on the books); and actions whose *validation* reads breadth (e.g. anything calling `orgMembership`) route through rollups. None of these change the draft contract; they're enumerable work, and the materialization guard will name each one loudly the moment a dispatch touches it.

## 6. Verdict

Your numbers are not ridiculous; they're roughly 10× reality, and the structure holds them **on one core of a 3 GB box** for everything measured, with the 5M-character write path landing at the target with thin single-core margin and three untouched levers above it. The failure points you asked me to find were found — OFFSET, COUNT, fsync, materialization — and each now has a fix that is *in the delivered code with a number attached*, not a promise. The core structure is finalized: records whole, queries indexed, counts maintained, one writer batching under one fsync, and your reducer — the thing all the harness discipline was protecting — running on top of it without a line changed.

*Delivered alongside this report: `server-core-structure.zip` (the six server files + this document). The stress db itself (5.2 GB) stays in the container; the harness rebuilds it anywhere with one command.*
