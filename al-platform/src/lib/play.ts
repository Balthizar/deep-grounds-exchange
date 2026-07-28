import { orgRec } from "./core";
import { isAdmin } from "./rules";

import { ACCOUNTS, accName, catName } from "../lib/core";
import { ADVENTURES, ADVENTURE_TAGS, ADV_BY_ID } from "../data/adventures";
import type { AppState } from "../types";

import { TRADE_DT, isDMRole, storesOf } from "../lib/rules";

export const CALL_KINDS = ["summons", "festival", "aid"];

// ---- DRAGGING A CLOCK --------------------------------------------------------------------------
// A fourth thing, and not a freeze. My lock taxonomy stops a clock; a festival SLOWS one. My
// ruling: "the festival pauses building but lets facilities run at half speed because visitors
// are watching and touring like at a renn faire."
//
// Running at half speed for D milliseconds costs exactly D extra milliseconds — so my drag is
// just "add the fair's length to what you had left", capped at what the clock had left, because
// a week that finishes mid-fair only overlapped it for part of its length.
//
// EXCHANGE RULE [TABLE], and it is entirely mine: the book's fair costs gold and nothing else
// because a home game doesn't need it to take time — the DM narrates it and moves on. I have a
// wall clock and a week that must mean something, so my fair costs the week too.
// The DMG's festival is "pay 500 GP -> roll again on the
// Bastion Events table" and says NOTHING about time, builders, or crafters. The book's fair
// costs gold; mine also costs the week. My house rule, and I label it as one.
export const OPPORTUNITY_COST_DMG = 500;      // DMG: "you must pay 500 GP" — flat, because the book rolls once

export function notifyAdvWishlisters(s: AppState, advId, excludeAcct, dateStr, dmId, sessionId) {
  if (!advId || !s.wishlists) return;
  const label = ADV_BY_ID[advId] ? ADV_BY_ID[advId].label : "an adventure";
  ACCOUNTS.forEach((a) => {
    if (a.id === excludeAcct) return;
    const wl = s.wishlists[a.id] || [];
    if (wl.includes(advId)) s.notices.push({ id: "n" + s.nextId++, type: "wishtable", ctx: "player", accountId: a.id, adv: label, when: dateStr || "", dm: dmId ? accName(dmId) : "", sessionId: sessionId || null });
  });
}

// My per-account tally of what an unwind did to them, for the notice at the end.
export function affectedEntry(affected, accId) {
  if (!affected[accId]) affected[accId] = { items: [], recreated: [], dt: 0, trades: [] };
  return affected[accId];
}

// Put one item back where it started. The bad item is erased rather than returned,
// so it gets its holder fixed (for consistency) but no lineage entry and no credit.
export function restoreTradedItem(it, orig, badItemId, affected) {
  if (!it) return;
  const recreated = !!it._lost;
  if (recreated) it._lost = false;
  it.holder = { type: "CHARACTER", id: orig.id };
  it.escrow = false;
  if (it.id === badItemId) return;                    // the invalid item is erased, not "returned"
  it.lineage.push({ holder: orig.name, note: recreated ? "Recreated & returned (trade reversed)" : "Returned (trade reversed)" });
  const e = affectedEntry(affected, orig.ownerId);
  e.items.push(catName(it.catalogId));
  if (recreated) e.recreated.push(catName(it.catalogId));
}

// Reverse one settled trade: both items home, both downtime costs refunded.
export function reverseTrade(s: AppState, tr, badItemId, affected) {
  const snap = tr.snapshot;
  const A = s.characters[snap.aChar], B = s.characters[snap.bChar];
  restoreTradedItem(s.items[snap.aItem], A, badItemId, affected);
  restoreTradedItem(s.items[snap.bItem], B, badItemId, affected);
  [A, B].forEach((c) => {
    c.dt += TRADE_DT;                                 // the downtime spent on a void trade is given back
    const e = affectedEntry(affected, c.ownerId);
    e.dt += TRADE_DT;
    e.trades.push(tr.id);
  });
  tr.status = "REVERSED";
}

export function normName(s: AppState) { return (s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }

// ---- Warhorn read-only import helpers ----
export function isALSystem(sys) { return /adventurers?\s*league|\bAL\b|\bDDAL\b|\bDDEX\b/i.test(sys || ""); }

export function matchStoreByWarhorn(state: AppState, storeName) {
  const stores = Object.values(state.storeRegistry || {});
  const n = normName(storeName);
  return stores.find((st) => normName(st.warhornSlug) === n && st.warhornSlug) || stores.find((st) => normName(st.name) === n) || null;
}

export function matchAccountByPerson(state: AppState, p) {
  // exact email match first (robust), then normalized name
  if (p.email) { const byMail = ACCOUNTS.find((a) => a.email && normName(a.email) === normName(p.email)); if (byMail) return byMail.id; }
  const byName = ACCOUNTS.find((a) => normName(a.name) === normName(p.name));
  return byName ? byName.id : null;
}

export const TABLE_COUNT = 3;

export function tablesOn(state: AppState, dateStr) { return state.sessions.filter((s) => s.status !== "cancelled" && (s.datetime || "").slice(0, 10) === dateStr); }

// My single source of truth for "is this account already committed on this night?"
// Future me: any task that occupies an evening gets represented here — new task types land in
// this one place, nowhere else.
// PROPOSAL DATES HAVE TWO AUDIENCES (Frank's ruling, 27 Jul): "the provisional dungeon master
// sees them as a ranking, but the mentor does not."
//
// The subtlety that makes these two functions necessary rather than a label: POSITION IS THE
// SIGNAL. Handing the mentor the stored array and simply not writing "1st choice" next to it
// still shows them the ranking, because the first one is first. Any list is ordered by
// something, so the only way to not communicate preference is to order by something else.
// Chronological is the neutral choice — it carries no preference and is what a person checking
// their own availability wants anyway.
//
// Stored order IS the ranking, so it is never re-sorted in place; both views are derived.
export function proposalDatesRanked(tp) {          // the provisional DM's own view
  return [...((tp && tp.dates) || [])];
}
export function proposalDatesForMentor(tp) {       // the mentor's view: no preference conveyed
  return [...((tp && tp.dates) || [])].sort();     // ISO datetimes sort chronologically as strings
}

export function nightCommitment(state: AppState, acct, dateStr, ignoreSessionId?) {   // ignore omitted = count every table
  for (const se of state.sessions) {
    if (se.status === "cancelled") continue;
    if ((se.datetime || "").slice(0, 10) !== dateStr) continue;
    if (ignoreSessionId && se.id === ignoreSessionId) continue;
    if (se.dmId && se.dmId === acct) return { type: "dm", session: se };
    if ((se.signups || []).some((u) => u.accountId === acct)) return { type: "player", session: se };
    if ((se.observers || []).includes(acct)) return { type: "observer", session: se };
    if (se.mentorId === acct && se.mentorStatus !== "declined") return { type: "mentor", session: se };
    // future task types (monitor, event staffing) slot in here
  }
  return null;
}

export function openFlagsFor(state: AppState, dm) { return (state.dmFlags || []).filter((f) => f.dm === dm && f.status === "open"); }

export function distinctFlaggers(state: AppState, dm) { return new Set(openFlagsFor(state, dm).map((f) => f.by)).size; }

export function hasPlayedUnder(state: AppState, player, dm) { return (state.sessions || []).some((se) => se.dmId === dm && (se.signups || []).some((u) => u.accountId === player)); }

export function dmSeniority(state: AppState, acct) { return (state.sessions || []).filter((se) => se.dmId === acct).length + (state.logEntries || []).filter((l) => l.entryType === "DM_REWARD" && l.dmId === acct).length; }

// Oversight: when a flagged DM is placed on a table (created, claimed, or assigned), quietly recruit a monitor. One source of truth.
export function maybeRecruitMonitor(s: AppState, dmId, sessionId, storeId, dateStr) {
  if (!(s.dmFlags || []).some((f) => f.dm === dmId && f.status === "open")) return;
  const st = storeId || "store_dj";
  const mrecips = ACCOUNTS.filter((a) =>
    a.id !== dmId && (s.roles[a.id] || []).includes("dm") &&
    storesOf(s, a.id).includes(st) && !nightCommitment(s, a.id, dateStr) &&
    Object.values(s.characters).some((c) => c.ownerId === a.id && !c.pregen)
  ).map((a) => a.id);
  if (!mrecips.length) return;
  const pid = "poll" + s.nextId++;
  s.polls.push({ id: pid, kind: "monitor-recruit", question: "Can you sit in as a player at a table on " + dateStr + " and quietly confirm a colleague is running things well? Details are confidential — just play, then answer a couple of questions after.", options: [{ value: "yes", label: "Yes, I'll sit in" }, { value: "no", label: "Can't this time" }], storeId: st, audienceRole: "dm", exclude: [dmId], createdBy: "__system__", recipients: mrecips, responses: {}, status: "open", meta: { session: sessionId, flaggedDm: dmId }, createdAt: Date.now() });
  mrecips.forEach((rid) => s.notices.push({ id: "n" + s.nextId++, type: "poll", ctx: "dm", accountId: rid, pollId: pid, question: "Quiet table check-in on " + dateStr }));
}

export function isModuleAuthor(state: AppState, acct) { return !!(state.moduleAuthors && state.moduleAuthors[acct]) && isDMRole(state, acct); }

export function storeOf(state: AppState, acct) { return storesOf(state, acct)[0] || "store_dj"; }

export function storeRec(state: AppState, id) { return (state.storeRegistry && state.storeRegistry[id]) || null; }

export function storeName(state: AppState, id) { const r = storeRec(state, id); return r ? r.name : "—"; }

export function orgPrescheduleById(state: AppState, orgId) { const o = orgRec(state, orgId); return !!(o && o.preschedule); }

export function canPublishSession(state: AppState, acc, session) {   // who may publish a drafted table — the table's own org leadership (or admin)
  if (isAdmin(state, acc)) return true;
  const o = orgRec(state, session && session.orgId);
  return !!o && (o.leaderId === acc || (o.assistantIds || []).includes(acc) || (o.schedulerIds || []).includes(acc));
}

// Warhorn sync: pending items = signups + tables on this org's events not yet marked pushed
export function warhornQueueFor(state: AppState, orgId) {
  const pushed = state.warhornPushed || {};
  const events = (state.events || []).filter((e) => e.orgId === orgId);
  const out: any[] = [];
  events.forEach((ev) => {
    const tables = (state.sessions || []).filter((se) => se.eventId === ev.id && se.status !== "cancelled");
    tables.forEach((se) => {
      const tKey = "tbl:" + se.id;
      if (!pushed[tKey]) out.push({ key: tKey, kind: "table", event: ev, session: se, label: "Create table — " + (ADV_BY_ID[se.adventureId] ? ADV_BY_ID[se.adventureId].label : se.adventureId) + (se.dmId ? " · DM " + accName(se.dmId) : " · needs a DM") });
      (se.signups || []).forEach((u) => {
        const sKey = "sig:" + se.id + ":" + u.accountId;
        if (!pushed[sKey]) out.push({ key: sKey, kind: "signup", event: ev, session: se, accountId: u.accountId, label: "Add " + accName(u.accountId) + (u.charId && state.characters[u.charId] ? " (" + state.characters[u.charId].name + ")" : "") + " → " + (ADV_BY_ID[se.adventureId] ? ADV_BY_ID[se.adventureId].label : se.adventureId) });
      });
    });
  });
  return out;
}

// ---- Adventure-identity matching (tolerant of spacing, dashes, word-vs-digit, sub-letter, title text, minor typos) ----
export const WORD_NUM = { one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10", eleven: "11", twelve: "12" };

// House moderation thresholds — the Exchange's defaults, NOT an AL rule and NOT SCALE policy.
// An org may want its own numbers; these are just what I ship with. I named them so they read as
// choices rather than magic, and so a leader can see what I decided on their behalf.
export const MENTOR_NOT_READY_LIMIT = 3;   // this many "not ready" calls and a provisional DM's promotion is paused (Exchange default)

export const OVERSIGHT_FLAG_LIMIT   = 3;   // this many distinct flaggers and the admins are told (Exchange default)

export function normText(s: string) { return (s || "").toLowerCase().replace(/[–—]/g, "-").replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/g, (w) => WORD_NUM[w]); }

export function codeSig(s: AppState) {
  const t = (s || "").toLowerCase();
  const sm = t.match(/dd[a-z]*/);
  const nums = (t.match(/\d+/g) || []).map((n) => parseInt(n, 10));
  const pm = t.match(/(?:\d|\s|-)\s*([ab])(?![a-z])/);
  return { series: sm ? sm[0] : "", nums, part: pm ? pm[1] : "" };
}

export function searchAdventures(q, limit?) {           // limit omitted = every match
  const query = (q || "").trim();
  if (!query) return [];
  const qs = codeSig(query);
  const tokens = normText(query).split(/[^a-z0-9]+/).filter(Boolean);
  return ADVENTURES.filter((a) => {
    const cs = codeSig(a.label.split("·")[0]);
    let codeM = false;
    if (qs.nums.length > 0) {
      const seriesOk = !qs.series || (cs.series && cs.series.startsWith(qs.series));
      const numsOk = qs.nums.every((n, i) => cs.nums[i] === n);
      const partOk = !qs.part || !cs.part || qs.part === cs.part;
      codeM = seriesOk && numsOk && partOk;
    }
    const textHay = normText(a.label + " " + (a.alias || "") + " " + (a.summary || "") + " " + ((ADVENTURE_TAGS[a.id] || []).join(" ")));
    const nameM = qs.nums.length === 0 && tokens.length > 0 && tokens.every((t) => textHay.includes(t));
    return codeM || nameM;
  }).slice(0, limit || 10);
}

