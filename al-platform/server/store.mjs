// ============================================================================
// MY STORE + DISPATCHER + QUERY LAYER.
//   openStore()      db, prepared statements, schema applied
//   makeDispatcher() my single writer. Queues actions; commits in GROUPS under
//                    one transaction — one fsync per batch, not per action.
//                    That's my whole answer to "SQLite has one writer."
//   queries          my indexed replacements for every iterating code path:
//                    dueCharacters (the tick), accountSlice (what a goat's
//                    client downloads), marketPage, orgReport (rollup reads).
// ============================================================================
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { makeDraft } from "./db_draft.mjs";

export function openStore(path) {
  const db = new DatabaseSync(path);
  db.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
  const P = (sql) => db.prepare(sql);
  const stmts = { get: {}, put: {}, del: {}, exists: {} };
  for (const [name, table] of [["characters","characters"],["items","items"],["organizations","organizations"],
      ["stores","stores"],["sessions","sessions"],["notices","notices"],["accounts","accounts"]]) {
    stmts.get[name]    = P(`SELECT json FROM ${table} WHERE id = ?`);
    stmts.exists[name] = P(`SELECT 1 FROM ${table} WHERE id = ?`);
    stmts.del[name]    = P(`DELETE FROM ${table} WHERE id = ?`);
  }
  stmts.put.characters    = P(`INSERT INTO characters(id,owner_id,retired,next_due_at,json) VALUES(:id,:owner_id,:retired,:next_due_at,:json)
                               ON CONFLICT(id) DO UPDATE SET owner_id=:owner_id,retired=:retired,next_due_at=:next_due_at,json=:json`);
  stmts.put.items         = P(`INSERT INTO items(id,holder_type,holder_id,owner_acct,available,json) VALUES(:id,:holder_type,:holder_id,:owner_acct,:available,:json)
                               ON CONFLICT(id) DO UPDATE SET holder_type=:holder_type,holder_id=:holder_id,owner_acct=:owner_acct,available=:available,json=:json`);
  stmts.put.organizations = P(`INSERT INTO organizations(id,json) VALUES(:id,:json) ON CONFLICT(id) DO UPDATE SET json=:json`);
  stmts.put.stores        = P(`INSERT INTO stores(id,org_id,json) VALUES(:id,:org_id,:json) ON CONFLICT(id) DO UPDATE SET org_id=:org_id,json=:json`);
  stmts.put.sessions      = P(`INSERT INTO sessions(id,event_id,dm_id,status,datetime,json) VALUES(:id,:event_id,:dm_id,:status,:datetime,:json)
                               ON CONFLICT(id) DO UPDATE SET event_id=:event_id,dm_id=:dm_id,status=:status,datetime=:datetime,json=:json`);
  stmts.put.notices       = P(`INSERT INTO notices(id,account_id,json) VALUES(:id,:account_id,:json) ON CONFLICT(id) DO UPDATE SET account_id=:account_id,json=:json`);
  stmts.put.accounts      = P(`INSERT INTO accounts(id,json) VALUES(:id,:json) ON CONFLICT(id) DO UPDATE SET json=:json`);
  stmts.putLog     = P(`INSERT INTO log_entries(id,char_id,date,json) VALUES(:id,:char_id,:date,:json)`);
  stmts.bumpRollup = P(`INSERT INTO rollups(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=v+excluded.v`);
  stmts.saveId     = P(`INSERT INTO meta(k,v) VALUES('nextId',?) ON CONFLICT(k) DO UPDATE SET v=excluded.v`);
  // id block reservation: read watermark, advance by 1000, hand back [lo,hi)
  const _idGet = P(`SELECT v FROM meta WHERE k='nextId'`);
  stmts.idBlock = { get: () => { const lo = parseInt(_idGet.get()?.v || "1", 10); const hi = lo + 1000; stmts.saveId.run(String(hi)); return { lo, hi }; } };
  return { db, stmts };
}

// ---- MY SINGLE WRITER ---------------------------------------------------------------------------
export function makeDispatcher(store, reducerCase, { batch = 64 } = {}) {
  const { db, stmts } = store;
  return {
    // My synchronous batch entry point (the HTTP layer queues into this).
    // Group commit: BEGIN … N × (draft → case → commit) … COMMIT — one fsync.
    dispatchBatch(actions) {
      const out = [];
      db.exec("BEGIN IMMEDIATE");
      try {
        for (const action of actions) {
          const s = makeDraft(db, stmts);
          try { reducerCase(s, action); out.push(s.commit()); }
          catch (e) {
            // one bad action must not poison my batch: I simply never commit its draft
            out.push({ error: String(e.message).slice(0, 200) });
          }
        }
        db.exec("COMMIT");
      } catch (e) { db.exec("ROLLBACK"); throw e; }
      return out;
    },
  };
}

// ---- MY INDEXED QUERIES: every iterating path from my review, rewritten as SQL ------------------
export function makeQueries(store) {
  const { db } = store;
  const q = {
    // §2.2/§2.3 — the tick. O(log N + batch); my 1 Hz interval becomes:
    //   for (const row of dueCharacters(now, 200)) dispatch(RESOLVE for row.id)
    dueCharacters: db.prepare(`SELECT id, next_due_at FROM characters WHERE next_due_at <= ? ORDER BY next_due_at LIMIT ?`),
    // what a goat downloads on login: their 5 characters + gear + last ledger page + notices
    _chars:   db.prepare(`SELECT json FROM characters WHERE owner_id = ?`),
    _items:   db.prepare(`SELECT json FROM items WHERE owner_acct = ?`),
    _logs:    db.prepare(`SELECT json FROM log_entries WHERE char_id = ? ORDER BY seq DESC LIMIT ?`),
    _notices: db.prepare(`SELECT json FROM notices WHERE account_id = ?`),
    accountSlice(accountId) {
      const chars = q._chars.all(accountId).map((r) => JSON.parse(r.json));
      return {
        characters: chars,
        items: q._items.all(accountId).map((r) => JSON.parse(r.json)),
        ledger: Object.fromEntries(chars.map((c) => [c.id, q._logs.all(c.id, 50).map((r) => JSON.parse(r.json))])),
        notices: q._notices.all(accountId).map((r) => JSON.parse(r.json)),
      };
    },
    // the market is a page. Future me: never a table scan of 40M items. Never.
    marketPage: db.prepare(`SELECT json FROM items WHERE available = 1 LIMIT ? OFFSET ?`),
    // §2.4 — a report is a point read of counters I maintain, not a survey I run
    rollup: db.prepare(`SELECT v FROM rollups WHERE k = ?`),
    orgReport(orgId) {
      const g = (k) => q.rollup.get("org:" + orgId + ":" + k)?.v ?? 0;
      return { members: g("members"), dms: g("dms"), stores: g("stores") };
    },
    ledgerPage: db.prepare(`SELECT json FROM log_entries WHERE char_id = ? AND seq < ? ORDER BY seq DESC LIMIT ?`),
  };
  return q;
}
