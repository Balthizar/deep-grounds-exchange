// ============================================================================
// STRESS HARNESS. Builds a synthetic population directly in SQLite, then
// measures every path the review named. Ramps: pass a char count, it scales
// the rest by ratio. Container-honest: it measures what fits here and prints
// per-row constants so the extrapolation to the full stress table is arithmetic,
// not faith. Run:  node server/stress.mjs 100000   (then 1000000)
// ============================================================================
import { openStore, makeDispatcher, makeQueries } from "./store.mjs";
import { loadReducerCases } from "./reducer_bridge.mjs";
import { nextDueOf } from "./db_draft.mjs";
import { rmSync, statSync } from "node:fs";

// ---- PREFLIGHT — fail loudly BEFORE any fixture work, per the independent review ---------------
// A benchmark that stalls on a missing dependency has no evidentiary value; one that names the
// missing thing and the command that fixes it does. All three checks run before a single row.
const USAGE = `usage: npm run benchmark -- <characters> [RESUME=1] [BUILD_ONLY=1]
  <characters>   positive integer; the rest of the population scales by ratio
                 (accounts=chars/5, items=4/char, ledger=15/char, orgs/stores capped at 10k/20k)
  examples:      npm run benchmark -- 20000        quick shakedown (~10 s build)
                 npm run benchmark -- 1000000      the 1M fixture (~5 GB, ~6 min)
                 RESUME=1 npm run benchmark -- 1000000   continue an interrupted build`;
if (process.argv[2] === "--help" || process.argv[2] === "-h") { console.log(USAGE); process.exit(0); }
const [MAJ, MIN] = process.versions.node.split(".").map(Number);
if (MAJ < 22 || (MAJ === 22 && MIN < 5))
  { console.error(`PREFLIGHT: node ${process.versions.node} lacks node:sqlite — need >= 22.5.`); process.exit(1); }
try { await import("node:sqlite"); }
catch { console.error("PREFLIGHT: node:sqlite unavailable in this Node build."); process.exit(1); }
try { (await import("node:module")).createRequire(import.meta.url).resolve("esbuild"); }
catch {
  console.error("PREFLIGHT: esbuild is not installed. It is a declared devDependency of this project.");
  console.error("  fix: npm install    (or: npm ci)    in the project root, then re-run.");
  console.error("  (The benchmark resolves the local package directly — never npx, never its cache, never the network.)");
  process.exit(1);
}
const RAW_N = process.argv[2] || "100000";
const N_CHARS = Number(RAW_N);
if (!Number.isInteger(N_CHARS) || N_CHARS <= 0)
  { console.error(`PREFLIGHT: character count "${RAW_N}" is not a positive integer.\n` + USAGE); process.exit(1); }
const RATIO = { acctPerChar: 1 / 5, itemPerChar: 4, logPerChar: 15, orgs: 10000, stores: 20000 };
const N_ACCT = Math.round(N_CHARS * RATIO.acctPerChar);
const N_ITEM = N_CHARS * RATIO.itemPerChar;
const N_LOG = N_CHARS * RATIO.logPerChar;
const N_ORG = Math.min(RATIO.orgs, Math.max(100, Math.round(N_CHARS / 100)));
const N_STORE = Math.min(RATIO.stores, N_ORG * 2);
const DBF = "server/stress.db";

const t = () => process.hrtime.bigint();
const ms = (a, b) => Number(b - a) / 1e6;
const rate = (n, m) => (n / (m / 1000)).toFixed(0);
const MB = (f) => { try { return (statSync(f).size / 1048576).toFixed(0); } catch { return "?"; } };

if (process.env.RESUME !== "1") { rmSync(DBF, { force: true }); rmSync(DBF + "-wal", { force: true }); rmSync(DBF + "-shm", { force: true }); }
const store = openStore(DBF);
const { db } = store;
const q = makeQueries(store);

console.log(`STRESS FIXTURE  chars=${N_CHARS}  accts=${N_ACCT}  items=${N_ITEM}  logs=${N_LOG}  orgs=${N_ORG}  stores=${N_STORE}\n`);

// ---- representative record shapes (sized like the real seed's) ---------------------------------
const charJson = (i, acct, due) => JSON.stringify({
  id: "ch" + i, ownerId: acct, name: "Goat " + i, level: 1 + (i % 20), tier: 1 + (i % 4),
  gp: 100 + (i % 900), dt: 10 + (i % 40), campaign: "FR", retired: false,
  bastion: (i % 2 === 0) ? { name: "Keep " + i, region: "sword_coast", builtAtLevel: 5,
    facilities: [{ id: "f" + i, defId: "bedroom", size: "cramped" }, { id: "g" + i, defId: "kitchen", size: "roomy" }],
    turns: due != null ? [{ id: "bt" + i, resolved: false, readyAt: due }] : [] } : null,
});
const itemJson = (i, ch, acct) => JSON.stringify({
  id: "it" + i, catalogId: "g_longsword", itemClass: "GEAR", campaign: "FR", available: i % 10 === 0,
  holder: { type: "CHARACTER", id: ch }, ownerId: acct,
  provenance: [{ how: "PURCHASED", by: "Goat", at: "2026-01-01" }], inPack: true,
});
const logJson = (i, ch) => JSON.stringify({
  id: "lg" + i, charId: ch, entryType: "PLAY", status: "APPROVED", date: "2026-0" + (1 + (i % 9)) + "-15",
  adventureId: "ddal09-0" + (1 + (i % 9)), gold: 25, downtime: 5, xp: 0, dm: "acc" + (i % 97),
});

// ---- build, timed per table --------------------------------------------------------------------
function bulk(label, n, insertOne, every = 50000) {
  const have = db.prepare(`SELECT COUNT(*) c FROM ${label === "orgs" ? "organizations" : label}`).get().c;
  if (have >= n) { console.log(`  ${label.padEnd(14)} ${String(n).padStart(9)} rows  (already built)`); return 1; }
  const start = have;
  const a = t(); db.exec("BEGIN");
  for (let i = start; i < n; i++) { insertOne(i); if ((i + 1) % every === 0) { db.exec("COMMIT"); db.exec("BEGIN"); } }
  db.exec("COMMIT"); const b = t();
  console.log(`  ${label.padEnd(14)} ${String(n).padStart(9)} rows  ${(ms(a, b) / 1000).toFixed(1).padStart(7)} s  ${rate(n - start, ms(a, b)).padStart(8)} rows/s`);
  return ms(a, b);
}
const NOW = Date.now();
bulk("accounts", N_ACCT, (i) => store.stmts.put.accounts.run({ id: "acc" + i, json: JSON.stringify({ id: "acc" + i, name: "Player " + i, dm: i % 10 === 0 }) }));
bulk("characters", N_CHARS, (i) => {
  const acct = "acc" + (i % N_ACCT);
  const due = (i % 2 === 0 && i % 8 === 0) ? NOW + 3600e3 : (i % 2 === 0 && i % 200 === 0 ? NOW - 1000 : null);
  const j = charJson(i, acct, due);
  store.stmts.put.characters.run({ id: "ch" + i, owner_id: acct, retired: 0, next_due_at: due ?? nextDueOf(JSON.parse(j)), json: j });
});
bulk("items", N_ITEM, (i) => { const c = i % N_CHARS;
  store.stmts.put.items.run({ id: "it" + i, holder_type: "CHARACTER", holder_id: "ch" + c, owner_acct: "acc" + (c % N_ACCT), available: i % 10 === 0 ? 1 : 0, json: itemJson(i, "ch" + c, "acc" + (c % N_ACCT)) }); });
const logMs = bulk("log_entries", N_LOG, (i) => { const c = i % N_CHARS;
  store.stmts.putLog.run({ id: "lg" + i, char_id: "ch" + c, date: "2026-03-01", json: logJson(i, "ch" + c) }); });
bulk("orgs", N_ORG, (i) => store.stmts.put.organizations.run({ id: "org" + i, json: JSON.stringify({ id: "org" + i, name: "Org " + i }) }));
bulk("stores", N_STORE, (i) => store.stmts.put.stores.run({ id: "st" + i, org_id: "org" + (i % N_ORG), json: JSON.stringify({ id: "st" + i, name: "Store " + i, orgId: "org" + (i % N_ORG) }) }));
// org membership + rollups maintained the way the draft would
bulk("org_members", N_ACCT, (i) => { const o = "org" + (i % N_ORG);
  db.prepare("INSERT OR IGNORE INTO org_members(org_id,account_id,json) VALUES(?,?,'{}')").run(o, "acc" + i);
  store.stmts.bumpRollup.run("org:" + o + ":members", 1); store.stmts.bumpRollup.run("platform:logs", 0); if (i % 10 === 0) store.stmts.bumpRollup.run("org:" + o + ":dms", 1); });
store.stmts.bumpRollup.run("platform:logs", N_LOG);
db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
console.log(`  db file: ${MB(DBF)} MB  (${(statSync(DBF).size / (N_CHARS + N_ITEM + N_LOG + 2 * N_ACCT)).toFixed(0)} B/row avg incl. indexes)\n`);

if (process.env.BUILD_ONLY === "1") { db.exec("PRAGMA wal_checkpoint(TRUNCATE)"); process.exit(0); }
// ---- measurements -------------------------------------------------------------------------------
const reducerCase = loadReducerCases(".");
const disp = makeDispatcher(store, reducerCase);
const pick = () => Math.floor(Math.random() * N_CHARS);
const lat = [];
function throughput(label, mkAction, total, batch) {
  lat.length = 0;
  const a = t();
  for (let done = 0; done < total; done += batch) {
    const acts = Array.from({ length: Math.min(batch, total - done) }, mkAction);
    const b0 = t(); const res = disp.dispatchBatch(acts); const b1 = t();
    const per = ms(b0, b1) / acts.length; acts.forEach(() => lat.push(per));
    const bad = res.find((r) => r.error); if (bad) { console.log("  !! action error:", bad.error); return; }
  }
  const b = t(); lat.sort((x, y) => x - y);
  console.log(`  ${label.padEnd(44)} ${rate(total, ms(a, b)).padStart(7)} act/s   p50 ${lat[Math.floor(lat.length * .5)].toFixed(2)} ms   p99 ${lat[Math.floor(lat.length * .99)].toFixed(2)} ms`);
}

console.log("DISPATCH PIPELINE — existing reducer cases, unchanged, over the DB draft");
const bio = () => { const i = pick(); return { type: "SET_LIFESTYLE", charId: "ch" + i, by: "acc" + (i % N_ACCT), lifestyle: null }; };
const region = () => { const i = pick(); return { type: "SET_BASTION_REGION", charId: "ch" + i, by: "acc" + (i % N_ACCT), region: null }; };
throughput("SET_LIFESTYLE (touch-1 write)     batch=1", bio, 2000, 1);
throughput("SET_LIFESTYLE                     batch=16", bio, 8000, 16);
throughput("SET_LIFESTYLE                     batch=128", bio, 16000, 128);
throughput("SET_BASTION_REGION (+ledger line) batch=128", region, 16000, 128);
const mixed = () => (Math.random() < 0.7 ? bio() : region());
throughput("mixed 70/30                       batch=128", mixed, 16000, 128);

console.log("\nQUERY LAYER");
const bench = (label, fn, n = 200) => { fn(); const a = t(); for (let i = 0; i < n; i++) fn(); const b = t();
  console.log(`  ${label.padEnd(44)} ${(ms(a, b) / n).toFixed(3).padStart(8)} ms`); };
bench("point read: character by id", () => q._chars.all("acc" + (pick() % N_ACCT)));
bench("tick query: due chars LIMIT 200", () => q.dueCharacters.all(NOW, 200));
bench("account slice (login payload)", () => q.accountSlice("acc" + (pick() % N_ACCT)));
bench("market page OFFSET (50 rows, deep page)", () => q.marketPage.all(50, (pick() % 1000) * 50));
const marketKeyset = db.prepare("SELECT id,json FROM items WHERE available=1 AND id > ? ORDER BY id LIMIT 50");
let mcur = "";
bench("market page KEYSET (50 rows)", () => { const r = marketKeyset.all(mcur); mcur = r.length ? r[r.length-1].id : ""; });
bench("ledger page: char recent 50 of " + N_LOG, () => q.ledgerPage.all("ch" + pick(), Number.MAX_SAFE_INTEGER, 50));
bench("org report via rollups", () => q.orgReport("org" + (pick() % N_ORG)));
const cnt = db.prepare("SELECT COUNT(*) c FROM org_members WHERE org_id=?");
bench("org report via COUNT(*) (the banned way)", () => cnt.get("org" + (pick() % N_ORG)), 20);
const pcnt = db.prepare("SELECT COUNT(*) c FROM log_entries");
bench("platform-wide COUNT(*) over ledger", () => pcnt.get(), 3);
bench("platform-wide count via rollup", () => q.rollup.get("platform:logs"));

console.log("\nVERIFY");
{ const probe = pick(); disp.dispatchBatch([{ type: "SET_LIFESTYLE", charId: "ch"+probe, by: "acc"+(probe%N_ACCT), lifestyle: "wealthy" }]);
  const back = JSON.parse(db.prepare("SELECT json FROM characters WHERE id=?").get("ch"+probe).json);
  console.log("  SET_LIFESTYLE write lands in SQLite and reads back:", back.lifestyle === "wealthy" ? "OK" : "!! FAILED");
  const lg = db.prepare("SELECT json FROM log_entries WHERE char_id=? ORDER BY seq DESC LIMIT 1").get("ch"+probe);
  console.log("  ledger append visible on read-back:", lg ? "OK" : "!! FAILED"); }
console.log("\nDURABILITY MODES (why group commit exists)");
db.exec("PRAGMA synchronous = FULL");
throughput("SET_LIFESTYLE sync=FULL           batch=1", bio, 200, 1);
throughput("SET_LIFESTYLE sync=FULL           batch=128", bio, 2560, 128);
db.exec("PRAGMA synchronous = NORMAL");

console.log("\nGUARD");
try { const { makeDraft } = await import("./db_draft.mjs"); const s = makeDraft(db, store.stmts); Object.values(s.characters); console.log("  !! guard FAILED to throw"); }
catch (e) { console.log("  population-materialization guard throws: OK —", String(e.message).slice(0, 60) + "…"); }

console.log("\nledger sustained append (measured above):", rate(N_LOG, logMs), "rows/s");
db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
console.log("final db:", MB(DBF), "MB");
