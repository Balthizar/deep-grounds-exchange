// ============================================================================
// MY DB-BACKED DRAFT — my client reducer's lazy-clone Proxy, one level deeper.
//
// Same contract my reducer already holds, so the reducer never learns SQL:
//   s.characters[id]        first touch LOADS the row (client version: cloned it)
//   s.characters[id] = rec  dirty; UPSERT at commit
//   delete s.characters[id] dead; DELETE at commit
//   s.logEntries.push(e)    buffered INSERT — I give the ledger no other write door
//
// And one contract my client version could never enforce:
//   Object.values(s.characters) / for..in / Object.keys  →  THROWS.
//   At 5M rows, materializing a collection isn't slow, it's a process kill.
//   I promised myself this guard in the review; here it is. Iterating actions
//   go through my indexed queries instead (tick, sweep, slices — store.mjs).
//
// A dispatch = fresh draft → my existing reducer case (unchanged) → commit().
// commit() writes only dirty rows, inside whatever transaction my dispatcher
// holds — which is how I batch N actions under one fsync.
// ============================================================================

const COLLECTIONS = {
  characters:    { table: "characters",    cols: (r) => ({ owner_id: r.ownerId || "", retired: r.retired ? 1 : 0, next_due_at: nextDueOf(r) }) },
  items:         { table: "items",         cols: (r) => ({ holder_type: r.holder?.type || "", holder_id: r.holder?.id || "", owner_acct: ownerAcctOf(r), available: r.available ? 1 : 0 }) },
  organizations: { table: "organizations", cols: () => ({}) },
  stores:        { table: "stores",        cols: (r) => ({ org_id: r.orgId || null }) },
  sessions:      { table: "sessions",      cols: (r) => ({ event_id: r.eventId || null, dm_id: r.dmId || null, status: r.status || null, datetime: r.datetime || null }) },
  notices:       { table: "notices",       cols: (r) => ({ account_id: r.accountId || null }) },
  accounts:      { table: "accounts",      cols: () => ({}) },
};

// next_due_at is the schema-level form of my §2.2 fix: I maintain it on every
// character write so the tick never scans. It mirrors my anyDue predicate — if
// you change one, future me, you change both.
export function nextDueOf(ch) {
  const b = ch && ch.bastion; if (!b || b.abandoned) return null;
  let m = null; const c = (t) => { if (t != null && (m === null || t < m)) m = t; };
  (b.turns || []).forEach((t) => { if (!t.resolved) c(t.readyAt); });
  (b.facilities || []).forEach((f) => { if (f.building) c(f.building.readyAt); });
  if (b.wallsBuilding) c(b.wallsBuilding.readyAt);
  (b.happening?.beats || []).forEach((x) => { if (!x.told) c(x.at); });
  return m;
}
function ownerAcctOf(it) {
  return it.ownerId || (it.holder?.type === "PLAYER" ? it.holder.id : null);
}

export function makeDraft(db, stmts) {
  const dirty = new Map();     // "coll/id" -> record | DEAD
  const cache = new Map();     // "coll/id" -> record | null(absent)
  const logBuf = [];
  const rollupDelta = new Map();
  const DEAD = Symbol("dead");
  let touched = 0;

  const collProxy = (name, spec) => new Proxy({}, {
    get(_, id) {
      if (typeof id !== "string") return undefined;
      const key = name + "/" + id;
      if (dirty.has(key)) { const v = dirty.get(key); return v === DEAD ? undefined : v; }
      if (cache.has(key)) return cache.get(key) ?? undefined;
      touched++;
      const row = stmts.get[name].get(id);
      const rec = row ? JSON.parse(row.json) : null;
      cache.set(key, rec);
      if (rec) dirty.set(key, rec);       // handed to my reducer = assumed written; the same
      return rec ?? undefined;            // pessimism my client draft uses, and I priced it in §D
    },
    set(_, id, v) { dirty.set(name + "/" + id, v); return true; },
    deleteProperty(_, id) { dirty.set(name + "/" + id, DEAD); return true; },
    has(_, id) { const k = name + "/" + id;
      if (dirty.has(k)) return dirty.get(k) !== DEAD;
      return !!stmts.exists[name].get(id); },
    ownKeys() { throw new Error("POPULATION MATERIALIZATION: iterate " + name + " via an indexed query (server/queries.mjs), never in a dispatch."); },
    getOwnPropertyDescriptor() { throw new Error("POPULATION MATERIALIZATION: " + name); },
  });

  const s = new Proxy({
    logEntries: { push: (...es) => { logBuf.push(...es); return logBuf.length; } },
    notices: null, // replaced below — notices need object semantics like others but reducer also filters; server actions use addNotice/dropNotice
    bumpRollup: (k, d = 1) => rollupDelta.set(k, (rollupDelta.get(k) || 0) + d),
  }, {
    get(base, k) {
      if (k in base && base[k] !== null) return base[k];
      if (COLLECTIONS[k]) return (base[k + "$"] ||= collProxy(k, COLLECTIONS[k]));
      if (k === "nextId") return getNextId();
      return base[k];
    },
    set(base, k, v) { if (k === "nextId") { setNextId(v); return true; } base[k] = v; return true; },
  });

  // My nextId watermark lives in meta; I reserve blocks of 1000 so the hot path
  // is an in-memory ++ and the sequence survives a restart with a gap, never a reuse.
  let idCur = null, idMax = 0;
  const getNextId = () => { if (idCur === null || idCur >= idMax) { const r = stmts.idBlock.get(); idCur = r.lo; idMax = r.hi; } return idCur; };
  const setNextId = (v) => { idCur = v; };

  s.commit = () => {
    for (const [key, rec] of dirty) {
      const [name, id] = [key.slice(0, key.indexOf("/")), key.slice(key.indexOf("/") + 1)];
      const spec = COLLECTIONS[name];
      if (rec === DEAD) stmts.del[name].run(id);
      else stmts.put[name].run({ id, json: JSON.stringify(rec), ...spec.cols(rec) });
    }
    for (const e of logBuf) stmts.putLog.run({ id: e.id || "", char_id: e.charId || null, date: e.date || null, json: JSON.stringify(e) });
    for (const [k, d] of rollupDelta) stmts.bumpRollup.run(k, d);
    if (idCur !== null) stmts.saveId.run(String(idCur));
    const stats = { rows: dirty.size, logs: logBuf.length, reads: touched };
    dirty.clear(); cache.clear(); logBuf.length = 0; rollupDelta.clear();
    return stats;
  };
  return s;
}
