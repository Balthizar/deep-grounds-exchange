
import { StatRow } from "../lib/ui";
import { isTradeableClass, itemsInOpenTrades } from "../lib/rules";
import { itemCat } from "../lib/core";

import { CATALOG } from "../data/catalog";
import { GIFT_KINDS, TREASURE_ALLOWANCE, dmOrgList, storesOf } from "../lib/rules";
import { RARITY, StorePicker, getBlob, itemMetaLine } from "../lib/ui";
import { TABLE_COUNT, orgPrescheduleById, tablesOn } from "../lib/play";
import { isMundaneCat, orgRec, putBlob } from "../lib/core";
import { ACCOUNTS, accName, catName } from "../lib/core";
import { ADVENTURES, ADV_BY_ID } from "../data/adventures";
import type { Action, AppState } from "../types";
import { Avatar, Empty, RulesLinks, SectionHead, StoreChip, itemClassLabel, logHasChar, tierLabel } from "../lib/ui";
import { canPublishSession, isModuleAuthor, nightCommitment, searchAdventures, storeName } from "../lib/play";
import { isAdmin, provOf, verifyingDMs } from "../lib/rules";

// Observer-log questions.
export const OBS_QUESTIONS = [
  "What did the DM do that kept players engaged?",
  "A rules question came up — how was it handled, and what did you take away?",
  "What will you do the same, and what differently, when you run this?",
  "What are you still unsure about before running your own table?",
];

export function seatName(state: AppState, u) {
  if (!u) return "";
  if (u.charId && state.characters[u.charId]) return state.characters[u.charId].name;
  if (u.stubId && state.stubs && state.stubs[u.stubId]) return state.stubs[u.stubId].name;
  if (u.accountId) return accName(u.accountId);
  return u.warhornName || "—";
}

// ============================================================================
// SESSIONS UI - the table and the DM desk.
// Scheduling and signups, the adventure catalogue and what players are asking for,
// the DM desk with its logsheet review and the item verification queue.
// ============================================================================

import React, { useEffect, useMemo, useState } from "react";

export const COMMIT_LABEL = { dm: "running a table", player: "playing at a table", observer: "shadowing a table", mentor: "supervising your mentee's table" };

export function canSeeDraft(state: AppState, acc, session) {   // the owning DM and the table's org leadership can see a draft; players can't
  return session.dmId === acc || canPublishSession(state, acc, session);
}

export const advHours = (adv) => (adv && adv.hours) || 4;   // AL sessions run ~4h (the cap); an adventure may carry an explicit `hours`

export const CATALOG_GROUPS = [
  ["Season 1 · Tyranny of Dragons", (c) => c.startsWith("ddex01")],
  ["Season 2 · Elemental Evil", (c) => c.startsWith("ddex02")],
  ["Season 3 · Rage of Demons", (c) => c.startsWith("ddex03")],
  ["Season 4 · Curse of Strahd", (c) => c.startsWith("ddal04")],
  ["Season 5 · Storm King's Thunder", (c) => c.startsWith("ddal05")],
  ["Season 6 · Tales from the Yawning Portal", (c) => c.startsWith("ddal06")],
  ["Season 7 · Tomb of Annihilation", (c) => c.startsWith("ddal07")],
  ["Season 8 · Waterdeep", (c) => c.startsWith("ddal08")],
  ["Season 9 · Descent into Avernus", (c) => c.startsWith("ddal09")],
  ["Season 10 · Icewind Dale", (c) => c.startsWith("ddal10")],
  ["DDAL00 · Specials & one-offs", (c) => c.startsWith("ddal00")],
  ["The Wild Beyond the Witchlight", (c) => c.startsWith("wbw")],
  ["Dreams of the Red Wizards", (c) => c.startsWith("drw")],
  ["Hardcover companions", (c) => c.startsWith("ddhc") || c.startsWith("ddia")],
  ["Epics", (c) => c.startsWith("ddep")],
  ["Storyline hardcovers", () => true],
];

export function catalogGroup(a) { for (let i = 0; i < CATALOG_GROUPS.length; i++) if ((CATALOG_GROUPS[i][1] as any)(a.id)) return i; return CATALOG_GROUPS.length - 1; }

// How many accounts have this adventure wishlisted (optionally excluding one, e.g. the viewing DM
// so their own "want to run" star doesn't inflate the player-demand signal).
// ---- HOW MANY PEOPLE WANT THIS ADVENTURE ---------------------------------------------------
// This was a scan: for each adventure, walk every account's wishlist and .includes() it. Which is
// O(accounts x wishlist) PER ADVENTURE, and the catalogue calls it 250 times in one render, so the
// screen was O(adventures x accounts x wishlist).
//
//   MEASURED (17 Jul), 250 adventures, 12 wishes each:
//        200 accounts      1.6 ms    one frame
//      1,000 accounts     31.9 ms    a visible hitch
//      5,000 accounts    213.6 ms    the screen hangs
//     20,000 accounts   1130.2 ms    the screen hangs
//
// NB HOW THIS WAS NEARLY MISSED. An external review flagged it and I dismissed it with "3.9 ms,
// fine" — measured at 300 CHARACTERS, with accounts held fixed at 200. adventureDemand does not
// care about characters at all. **A number measured on the wrong axis is worse than no number,
// because it ends the argument.** State what a thing scales with before stating a figure for it.
//
// The fix is the one itemIndex already uses — memoise on identity, no dirty flags, no way to forget
// — with one improvement it earns from the lazy draft. itemIndex memoises on STATE identity, which
// means it rebuilds on EVERY action. This memoises on `state.wishlists` identity instead, because
// that is the only thing it depends on, and the draft preserves the identity of any collection an
// action does not touch. Exactly ONE action touches wishlists.
//
//   memoised on state:            rebuilds every action.  23 ms at 20k accounts, every click.
//   memoised on state.wishlists:  rebuilds when a wishlist changes. Which is almost never.
//
// That only works because the draft is lazy. Under `structuredClone(state)` every collection got a
// new identity on every action and this optimisation was impossible — Phase 1 paid for Phase 1b.
//
//   Rebuild: one O(accounts x wishlist) pass, per WISHLIST CHANGE. Lookups: O(1), 250 of them free.
let _demandIdxFor: any = null;         // the wishlists object this index was built from

let _demandIdx: any = null;            // advId -> Set(accountId)

// NB there is no invalidateDemandIndex. There was, and it became dead the moment this memoised on
// `wishlists` identity instead of `state` identity — because the identity IS the invalidation. A
// cache with a manual invalidator is a cache you can forget to invalidate; this one cannot be.
export function demandIndex(state: AppState) {
  const wishlists = state.wishlists || {};
  if (_demandIdxFor === wishlists && _demandIdx) return _demandIdx;
  const idx = new Map();
  const wls = wishlists;
  for (const acc in wls) {
    const list = wls[acc] || [];
    for (let i = 0; i < list.length; i++) {
      let who = idx.get(list[i]);
      if (!who) { who = new Set(); idx.set(list[i], who); }
      who.add(acc);
    }
  }
  _demandIdxFor = wishlists; _demandIdx = idx;
  return idx;
}

// How many accounts want it, not counting one. `exceptAcct` is the caller's own wishlist: the
// catalogue shows "N others want this", and you are never one of the others.
export function adventureDemand(state: AppState, advId, exceptAcct) {
  const who = demandIndex(state).get(advId);
  if (!who) return 0;
  return who.size - (exceptAcct && who.has(exceptAcct) ? 1 : 0);
}

// ---------------------- DM Desk ----------------------
// ---- DM VERIFICATION QUEUE --------------------------------------------------------
// Everything a DM has been asked to check, in one place: items a player typed in from their
// own books (rolled bastion slots and character imports), and — if they mentor anyone —
// adventure items their mentee authored. Nothing here entered play yet.
export function pendingVerifications(state: AppState, acct) {
  const out: any[] = [];
  const mine = (ownerId) => verifyingDMs(state, ownerId).includes(acct);
  state.logEntries.forEach((l) => {
    if (l.status !== "SUBMITTED") return;
    const ch = state.characters[l.charId];
    if (l.entryType === "SLOTCLAIM" && ch && mine(ch.ownerId)) {
      const slot = (state.itemSlots || {})[l.slotId];
      out.push({ kind: "slot", log: l, ch, item: state.items[l.itemId], slot });
    } else if (l.entryType === "IMPORT_ITEM" && ch && mine(ch.ownerId)) {
      out.push({ kind: "import", log: l, ch, item: state.items[l.itemId] });
    } else if (l.entryType === "PAPER_ITEM" && ch && mine(ch.ownerId)) {
      out.push({ kind: "paper", log: l, ch, item: state.items[l.itemId] });
    } else if (l.entryType === "DM_ITEM" && state.mentors && state.mentors[l.dmId] === acct) {
      out.push({ kind: "mentee", log: l, ch, item: state.items[l.itemId] });
    }
  });
  return out;
}

export function VerifyCard({ row, dispatch, accountId }: { dispatch: React.Dispatch<Action>; [k: string]: any }) {
  const [why, setWhy] = useState("");
  const [showWhy, setShowWhy] = useState(false);
  const it = row.item || {};
  const A = { slot: ["VERIFY_SLOT_ITEM", "REJECT_SLOT_ITEM"],
              import: ["VERIFY_IMPORT_ITEM", "REJECT_IMPORT_ITEM"],
              paper: ["VERIFY_PAPER_ITEM", "REJECT_PAPER_ITEM"],
              mentee: ["VERIFY_DM_ITEM", "REJECT_DM_ITEM"] }[row.kind];
  const key = row.kind === "slot" ? { slotId: row.log.slotId } : { logId: row.log.id };
  const owed = row.slot && (row.slot.label || [row.slot.rarity, row.slot.cat, row.slot.sub].filter(Boolean).join(" · "));
  const src = [it.source, it.page ? "p." + it.page : ""].filter(Boolean).join(" ");
  return (
    <div className="dg-card">
      <div className="dg-card-h"><div>
        <span className="dg-item-name">{it.quantity > 1 ? it.quantity + "x " : ""}{it.name || "(unnamed)"}</span>
        <div className="dg-item-sub">
          {row.ch ? row.ch.name : "—"}
          {row.kind === "slot" && " · rolled slot"}
          {row.kind === "import" && " · character import"}
          {row.kind === "paper" && (it.awardKind === "certificate" ? " · event certificate" : " · outside table")}
          {row.kind === "mentee" && " · authored by your mentee"}
          {src ? " · " + src : ""}
        </div>
      </div></div>

      {owed && (
        <div className="dg-muted sm" style={{ margin: "4px 0" }}>
          <b>Owed:</b> {owed}{row.slot.roll ? " (d100 " + row.slot.roll + ")" : ""} · <b>Entered:</b> {it.name}
        </div>
      )}
      {(it.rarity || it.itemType) && <div className="dg-tagrow">
        {it.itemType && <span className="dg-tag">{it.itemType}</span>}
        {it.rarity && <span className="dg-tag">{it.rarity}</span>}
        {it.attune && <span className="dg-tag">attunement</span>}
        {it.consumable && <span className="dg-tag">consumable</span>}
      </div>}
      {(it.damage || it.props) && <div className="dg-muted sm">{[it.damage, it.damageType, it.range, it.props].filter(Boolean).join(" · ")}</div>}
      {it.desc && <p className="dg-muted sm" style={{ margin: "4px 0" }}>{it.desc}</p>}
      {it.traits && <div className="dg-muted sm">{it.traits}</div>}
      {it.notes && <div className="dg-muted sm"><i>Note from the player: {it.notes}</i></div>}
      {row.kind === "paper" && (it.adventure || it.event || it.dmName || it.playedOn || it.venue || it.certSerial) && (
        <div className="dg-muted sm" style={{ margin: "4px 0" }}>
          <b>Paperwork:</b> {[it.event, it.adventure, it.playedOn, it.dmName ? "DM " + it.dmName + (it.dmNumber ? " (" + it.dmNumber + ")" : "") : "", it.venue, it.certSerial ? "cert " + it.certSerial : ""].filter(Boolean).join(" · ")}
          {it.awardKind === "certificate" && <> · <i>on the player's shelf — attaches to the player, not a character [ALPG-196]</i></>}
        </div>
      )}
      {row.kind === "mentee" && it.adventure && <div className="dg-muted sm">For {it.adventure}{it.base ? " · based on " + it.base : ""}</div>}

      {showWhy && (
        <label className="dg-field" style={{ marginTop: 6 }}><span>Why are you sending it back?</span>
          <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="e.g. Appendix B — unavailable for AL play" autoFocus /></label>
      )}
      <div className="dg-row-actions" style={{ marginTop: 6 }}>
        <button className="dg-btn sm" onClick={() => dispatch({ type: A[0], by: accountId, ...key } as any)}>Verify</button>
        {!showWhy
          ? <button className="dg-btn ghost sm" onClick={() => setShowWhy(true)}>Send back…</button>
          : <>
              <button className="dg-btn danger sm" onClick={() => dispatch({ type: A[1], by: accountId, reason: why, ...key } as any)}>Confirm send back</button>
              <button className="dg-btn ghost sm" onClick={() => { setShowWhy(false); setWhy(""); }}>Cancel</button>
            </>}
      </div>
    </div>
  );
}

export function VerificationQueue({ state, dispatch, accountId }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const rows = pendingVerifications(state, accountId);
  if (!rows.length) return null;
  const n = rows.length;
  return (
    <div className="dg-panel">
      <div className="dg-panel-h">Items to verify{n > 1 ? " (" + n + ")" : ""}</div>
      <div className="dg-muted sm" style={{ marginBottom: 8 }}>
        Entered by hand from a player's own books, because the Exchange can't ship item text it
        isn't licensed for. Check each against the book — and against Appendix B — before it becomes real.
      </div>
      {rows.map((r) => <VerifyCard key={r.log.id} row={r} dispatch={dispatch} accountId={accountId} />)}
    </div>
  );
}

export function DMDeskView({ state, dispatch, accountId, setModal, setTab, goSchedule }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const pend = state.logEntries.filter((l) => l.status === "SUBMITTED" && l.entryType === "EARNING" && l.dmId === accountId);
  const disposals = state.logEntries.filter((l) => l.status === "SUBMITTED" && l.entryType === "DISPOSAL" && l.dmId === accountId);
  const myTickets = state.threads.filter((t) => t.ticket && t.ticket.status === "PENDING" && t.ticket.reviewer === accountId);
  return (
    <div className="dg-stack">
      {provOf(state, accountId) === "provisional-dm"
        ? <SectionHead eyebrow="Provisional DM · in training" title="DM Desk" note="You have full DM tools, but you're still training. Every table you run is shadowed by your mentor, and your session logs go to them for approval." />
        : <SectionHead eyebrow="Certified DM" title="DM Desk" note="Vouch that a session happened — earned items and downtime become valid, and item class is confirmed." />}

      {(() => {
        const ran = state.sessions.filter((ss) => ss.dmId === accountId && ss.status === "completed");
        const sessions = ran.length;
        const hours = ran.reduce((n, ss) => n + advHours(ADV_BY_ID[ss.adventureId]), 0);
        const players = ran.reduce((n, ss) => n + ss.signups.filter((u) => u.attended && u.charId).length, 0);
        const adventures = new Set(ran.map((ss) => ss.adventureId)).size;
        return (
          <div className="dg-dmstats">
            <div><b>{sessions}</b><span>tables run</span></div>
            <div><b>~{hours}</b><span>hours at the table</span></div>
            <div><b>{players}</b><span>players guided</span></div>
            <div><b>{adventures}</b><span>adventures run</span></div>
          </div>
        );
      })()}

      {(() => {
        const author = isModuleAuthor(state, accountId);
        return (
          <div className={"dg-authorcard" + (author ? " on" : "")}>
            <div className="dg-authorcard-h">✍ Module Author {author && <span className="dg-authorbadge">Active</span>}</div>
            <div className="dg-muted sm">{author
              ? "You're marked as a module author. You can browse heroes and locations players have licensed for use in your modules, and credit them when they appear."
              : "Mark yourself as a module author to browse the retired heroes and fallen keeps players have licensed for use — a source of NPCs and locations for your own adventures."}</div>
            <button className={"dg-btn sm" + (author ? " ghost" : "")} style={{ marginTop: 8 }} onClick={() => dispatch({ type: "TOGGLE_MODULE_AUTHOR", accountId, by: accountId })}>{author ? "Step down as module author" : "✍ Become a module author"}</button>
          </div>
        );
      })()}

      {(() => {
        const now = Date.now();
        const next = state.sessions
          .filter((ss) => ss.dmId === accountId && ss.status === "scheduled" && new Date(ss.datetime).getTime() >= now - 4 * 3600 * 1000)
          .sort((a, b) => (a.datetime < b.datetime ? -1 : 1))[0];
        if (!next) return null;
        const adv = ADV_BY_ID[next.adventureId];
        const dt = new Date(next.datetime);
        const when = isNaN(dt.getTime()) ? next.datetime : dt.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
        const seated = next.signups.map((u) => state.characters[u.charId]).filter((c) => c && c.level);
        const apl = seated.length ? Math.round(seated.reduce((n, c) => n + c.level, 0) / seated.length) : null;
        return (
          <div className="dg-nexttable">
            <div className="dg-nexttable-body">
              <div className="dg-nexttable-eyebrow">⏭ Next table</div>
              <div className="dg-nexttable-name">{adv ? adv.label : next.adventureId}{next.seriesPart ? " · " + next.seriesPart : ""}</div>
              <div className="dg-muted sm">{when} · {storeName(state, next.storeId)}{next.table ? " · Table " + next.table : ""}</div>
            </div>
            <div className="dg-nexttable-stats">
              <div><b>{next.signups.length}/{next.capacity}</b><span>seats</span></div>
              {apl != null && <div><b>{apl}</b><span>APL</span></div>}
              {goSchedule && <button className="dg-btn sm" onClick={() => goSchedule(next.id)}>View table →</button>}
            </div>
          </div>
        );
      })()}

      {provOf(state, accountId) === "provisional-dm" && (
        <div className="dg-provbanner">
          <div><b>You're a provisional DM.</b> {state.mentors && state.mentors[accountId] ? "Your mentor is " + accName(state.mentors[accountId]) + ". Bring questions to them first — they're shadowing your tables while you learn." : "A mentor will be assigned to shadow your tables."}</div>
          {state.mentors && state.mentors[accountId] && setModal && <button className="dg-btn sm" onClick={() => setModal({ kind: "message", to: state.mentors[accountId], fromCtx: "dm", toCtx: "dm" })}>✉ Message my mentor</button>}
        </div>
      )}

      {(() => {
        const provlogs = state.logEntries.filter((l) => l.entryType === "PROV_DM" && l.status === "SUBMITTED" && l.dmId === accountId);
        if (!provlogs.length) return null;
        return (
          <div className="dg-panel">
            <div className="dg-panel-h">Provisional DM reviews</div>
            <div className="dg-muted sm" style={{ marginBottom: 8 }}>Your mentee ran a table you supervised and logged it. Approve it (their reward applies), then decide if they're ready to run <b>alone</b>. "Not ready" keeps you as their mentor and loops — three in a row triggers a mentor swap so they get fresh eyes.</div>
            {provlogs.map((l) => (
              <div key={l.id} className="dg-card">
                <div className="dg-item-name">{accName(l.provDmId)} — ran {l.adventure}</div>
                <div className="dg-muted sm">Reward → {state.characters[l.charId] ? state.characters[l.charId].name : "—"} · +{l.dtEarned} DT{l.itemsEarned && l.itemsEarned.length ? " · " + l.itemsEarned.map((ie) => catName(ie.catalogId)).join(", ") : ""}</div>
                {Object.entries((l.answers || {}) as Record<string, any>).map(([q, a], i) => a ? <div key={i} className="dg-reflect"><div className="dg-reflect-q">{q}</div><div>{a}</div></div> : null)}
                <div className="dg-row-actions">
                  <button className="dg-btn sm" onClick={() => dispatch({ type: "REVIEW_PROV_LOG", by: accountId, logId: l.id, ready: true })}>Approve — ready to run alone</button>
                  <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "REVIEW_PROV_LOG", by: accountId, logId: l.id, ready: false })}>Approve — not ready yet</button>
                </div>
              </div>
            ))}
          </div>
        );
      })()}
      <VerificationQueue state={state} dispatch={dispatch} accountId={accountId} />

      {(() => {
        const obs = state.logEntries.filter((l) => l.entryType === "OBSERVER" && l.status === "SUBMITTED" && l.dmId === accountId);
        if (!obs.length) return null;
        return (
          <div className="dg-panel">
            <div className="dg-panel-h">Shadow reviews</div>
            <div className="dg-muted sm" style={{ marginBottom: 8 }}>A trainee shadowed your table and filed a reflection. Approve it, then decide whether they're ready to run their own table. "Not ready" keeps them a mentee and sends the admin to find them another mentor to try.</div>
            {obs.map((l) => (
              <div key={l.id} className="dg-card">
                <div className="dg-item-name">{accName(l.observerId)} — shadowed {l.adventure}</div>
                {Object.entries((l.reflections || {}) as Record<string, any>).map(([q, a], i) => a ? <div key={i} className="dg-reflect"><div className="dg-reflect-q">{q}</div><div>{a}</div></div> : null)}
                <div className="dg-row-actions">
                  <button className="dg-btn sm" onClick={() => dispatch({ type: "REVIEW_OBSERVER", by: accountId, logId: l.id, ready: true })}>Approve — ready to run their own table</button>
                  <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "REVIEW_OBSERVER", by: accountId, logId: l.id, ready: false })}>Approve — not ready yet</button>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <div className="dg-panel">
        <div className="dg-panel-h">My DM rewards</div>
        <div className="dg-muted sm" style={{ marginBottom: 8 }}>Log a session you ran to take its rewards on one of your own tier-matched characters.</div>
        <button className="dg-btn full" onClick={() => setModal({ kind: "dmlog" })}>+ Log a session I ran</button>
        {(() => {
          const mine = state.logEntries.filter((l) => l.entryType === "DM_REWARD" && l.dmId === accountId).slice().reverse();
          if (!mine.length) return null;
          return mine.map((l) => (
            <div key={l.id} className="dg-admin-row" style={{ marginTop: 6 }}>
              <span>{state.characters[l.charId] ? state.characters[l.charId].name : "—"} — {l.adventure}<br /><span className="dg-muted sm">{l.date} · +{l.dtEarned} DT{l.itemsEarned && l.itemsEarned.length ? " · " + l.itemsEarned.map((ie) => catName(ie.catalogId)).join(", ") : ""}</span></span>
            </div>
          ));
        })()}
      </div>

      {myTickets.length > 0 && (
        <div className="dg-panel">
          <div className="dg-panel-h">Authentication requests</div>
          <div className="dg-muted sm" style={{ marginBottom: 8 }}>Each request is a conversation — review and authenticate it in Messages.</div>
          {myTickets.map((th) => {
            const it = state.items[th.ticket.itemId];
            return (
              <div key={th.id} className="dg-ticket">
                <div className="dg-ticket-h">{it ? catName(it.catalogId) : "(item)"} — requested by {accName(th.ticket.requester)}</div>
                <div className="dg-muted sm">Log entry: {it && it.origin ? `earned in ${it.origin.adventure}` : "—"}{it && it.origin && it.origin.dmId ? ` · issued by ${accName(it.origin.dmId)}` : ""}</div>
                <div className="dg-row-actions"><button className="dg-btn sm" onClick={() => setTab && setTab("messages")}>Review in Messages</button></div>
              </div>
            );
          })}
        </div>
      )}

      {pend.length === 0 ? <Empty title="The queue is quiet" body="Approved entries drop their treasure into a hero's pack, sealed with your word." /> :
        pend.map((le) => (
          <div key={le.id} className="dg-card">
            <div className="dg-card-h">
              <div>
                <button className="dg-item-name link" onClick={() => setModal({ kind: "logentry", entryId: le.id })}>{state.characters[le.charId] ? state.characters[le.charId].name : "—"} — session log</button>
                <div className="dg-item-sub">Attached DM: {accName(le.dmId)}</div>
              </div>
              <div className="dg-dt"><b>+{le.dtEarned}</b><span>DT</span></div>
            </div>
            <div className="dg-earned">
              {le.itemsEarned.map((ie, i) => (
                <div key={i} className="dg-earned-row">
                  <span>{catName(ie.catalogId)}{ie.qty > 1 ? ` × ${ie.qty}` : ""}</span>
                  <span className="dg-classpill">{itemClassLabel(ie.catalogId, ie.proposedClass)}</span>
                </div>
              ))}
            </div>
            <div className="dg-row-actions">
              <button className="dg-btn" onClick={() => dispatch({ type: "APPROVE_LOG", id: le.id, by: accountId })}>Approve &amp; seal</button>
              <button className="dg-btn ghost" onClick={() => dispatch({ type: "REJECT_LOG", id: le.id, by: accountId })}>Reject</button>
            </div>
          </div>
        ))}

      {disposals.length > 0 && (
        <div className="dg-panel">
          <div className="dg-panel-h">Item disposals</div>
          <div className="dg-muted sm" style={{ marginBottom: 8 }}>A player wants to let an item go. Approving records it as leaving play on their logsheet — nothing vanishes without your word.</div>
          {disposals.map((le) => (
            <div key={le.id} className="dg-ticket">
              <div className="dg-ticket-h">{state.characters[le.charId] ? state.characters[le.charId].name : "—"} releases {le.itemName}</div>
              <div className="dg-muted sm">“{le.explanation || "(no explanation given)"}”</div>
              <div className="dg-row-actions">
                <button className="dg-btn sm" onClick={() => dispatch({ type: "APPROVE_LOG", id: le.id, by: accountId })}>Approve disposal</button>
                <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "REJECT_LOG", id: le.id, by: accountId })}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SectionHead eyebrow="Pre-generated" title="Pre-gen characters" note="Ready-made characters you can hand to a player. They can't be played, logged, or signed up — only stocked with items and transferred to a player's roster." />
      <button className="dg-btn ghost full" onClick={() => setModal({ kind: "pregen", dmId: accountId })}>+ New pre-generated character</button>
      {(() => {
        const pregens = Object.values(state.characters).filter((c) => c.pregen && c.pregenOwner === accountId);
        if (!pregens.length) return <div className="dg-muted sm" style={{ marginTop: 8 }}>No pre-gens yet. Build one, stock it with items, and hand it to a player when they need a character.</div>;
        return pregens.map((pg) => {
          const items = Object.values(state.items).filter((it) => it.holder.type === "CHARACTER" && it.holder.id === pg.id);
          return (
            <div key={pg.id} className="dg-card">
              <div className="dg-card-h"><div>
                <div className="dg-char-name">{pg.name}<span className="dg-pregentag">pre-gen</span></div>
                <div className="dg-char-meta">{[pg.race, pg.cls].filter(Boolean).join(" ")}{pg.level ? " · Level " + pg.level : ""} · Tier {pg.tier} · {items.length} item{items.length !== 1 ? "s" : ""}</div>
              </div></div>
              <div className="dg-row-actions">
                <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "pregen", dmId: accountId, charId: pg.id })}>Edit & items</button>
                {pg.ddb ? <a className="dg-btn ghost sm" href={pg.ddb} target="_blank" rel="noreferrer">↗ Sheet</a> : null}
                <button className="dg-btn sm" onClick={() => setModal({ kind: "pregen-transfer", charId: pg.id })}>Transfer to player</button>
              </div>
            </div>
          );
        });
      })()}
      <RulesLinks docs={["aldmg", "alpg", "hub"]} />
    </div>
  );
}

export function SessionsView({ state, accountId, dispatch, mode, setModal, schedTarget, clearSchedTarget }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const canCreate = mode === "dm" || mode === "admin";
  const [sub, setSub] = useState("calendar");
  useEffect(() => {
    if (!schedTarget) return;
    const el = document.getElementById("sess-" + schedTarget);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => clearSchedTarget && clearSchedTarget(), 2400);   // highlight fades after landing
    return () => clearTimeout(t);
  }, [schedTarget]);
  const [fStore, setFStore] = useState("all");
  const [fEvent, setFEvent] = useState("all");
  const view = sub;   // players can browse Catalogue/Wishlist too (Schedule actions stay DM/admin-gated inside)
  const sessions = state.sessions
    .filter((x) => x.status !== "cancelled")
    .filter((x) => !x.draft || canSeeDraft(state, accountId, x))   // pre-scheduled drafts show only to the owning DM and org leadership
    .filter((x) => fStore === "all" || (x.storeId || "store_dj") === fStore)
    .filter((x) => fEvent === "all" || (fEvent === "__none" ? !x.eventId : x.eventId === fEvent))
    .sort((a, b) => (a.datetime < b.datetime ? -1 : 1));
  const groups: Record<string, any> = {};
  sessions.forEach((s) => { const d = (s.datetime || "").slice(0, 10); (groups[d] = groups[d] || []).push(s); });
  const dates = Object.keys(groups).sort();
  const fmtDay = (d) => { const x = new Date(d + "T00:00"); return isNaN(x.getTime()) ? d : x.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }); };
  return (
    <div className="dg-stack">
      <SectionHead eyebrow="Organized play" title="Table schedule" note="The calendar of upcoming tables, or browse the full adventure catalogue to schedule from." />
      <div className="dg-subtoggle">
        <button className={"dg-subbtn" + (view === "calendar" ? " on" : "")} onClick={() => setSub("calendar")}>Calendar</button>
        <button className={"dg-subbtn" + (view === "catalog" ? " on" : "")} onClick={() => setSub("catalog")}>Catalogue</button>
        <button className={"dg-subbtn" + (view === "wishlist" ? " on" : "")} onClick={() => setSub("wishlist")}>Wishlist</button>
      </div>
      {view === "catalog"
        ? <CatalogView state={state} accountId={accountId} mode={mode} dispatch={dispatch} setModal={setModal} />
        : view === "wishlist"
        ? <WishlistView state={state} accountId={accountId} mode={mode} dispatch={dispatch} setModal={setModal} />
        : (<>
            {(Object.keys(state.storeRegistry || {}).length > 1 || (state.events || []).length > 0) && (
              <div className="dg-filterbar">
                <label>Store
                  <select value={fStore} onChange={(e) => setFStore(e.target.value)}>
                    <option value="all">All stores</option>
                    {Object.values(state.storeRegistry || {}).map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                  </select>
                </label>
                <label>Event
                  <select value={fEvent} onChange={(e) => setFEvent(e.target.value)}>
                    <option value="all">All tables</option>
                    <option value="__none">Regular tables only</option>
                    {(state.events || []).map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                  </select>
                </label>
              </div>
            )}
            {canCreate && <button className="dg-btn full" onClick={() => setModal({ kind: "session", dmId: mode === "dm" ? accountId : "" })}>+ Schedule a session</button>}
            {mode === "admin" && <button className="dg-btn full ghost" onClick={() => setModal({ kind: "eventbuild" })}>✦ Build an event</button>}
            {mode === "dm" && <button className="dg-btn full ghost" onClick={() => setModal({ kind: "session", dmId: accountId, asEvent: true })}>✦ List my table as an event</button>}
            {sessions.length === 0 ? <Empty title="No delves are called" body="When a Dungeon Master posts a table, it will be mustered here." /> :
              dates.map((d) => (
                <div key={d} className="dg-daygroup">
                  <div className="dg-dayhead"><span>{fmtDay(d)}</span><span className="dg-daycount">{groups[d].length} table{groups[d].length !== 1 ? "s" : ""}</span></div>
                  {groups[d].map((sess) => <SessionCard key={sess.id} sess={sess} state={state} accountId={accountId} dispatch={dispatch} mode={mode} setModal={setModal} highlightId={schedTarget} />)}
                </div>
              ))}
          </>)}
    </div>
  );
}

export function CatalogView({ state, accountId, mode, dispatch, setModal }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("all");
  const [setting, setSetting] = useState("all");
  const canSchedule = mode === "dm" || mode === "admin";
  const myMentees = mode === "dm" ? ACCOUNTS.filter((a) => state.mentors && state.mentors[a.id] === accountId && provOf(state, a.id) === "provisional-dm").map((a) => a.id) : [];
  const wl = (state.wishlists && state.wishlists[accountId]) || [];
  const mostWanted = canSchedule
    ? ADVENTURES.map((a) => ({ a, d: adventureDemand(state, a.id, accountId) })).filter((x) => x.d > 0).sort((x, y) => y.d - x.d).slice(0, 6)
    : [];
  const settings = [...new Set(ADVENTURES.map((a) => a.setting || "Forgotten Realms"))].sort();
  let list = q.trim() ? searchAdventures(q, 999) : ADVENTURES.slice();
  if (setting === "community") list = list.filter((a) => a.community);
  else if (setting !== "all") list = list.filter((a) => (a.setting || "Forgotten Realms") === setting);
  if (tier === "Epic") list = list.filter((a) => a.id.startsWith("ddep"));
  else if (tier !== "all") list = list.filter((a) => String(a.tier) === tier);
  list = list.slice().sort((a, b) => (catalogGroup(a) - catalogGroup(b)) || (a.id < b.id ? -1 : 1));
  const groups: any[] = [];
  let last = -1;
  list.forEach((a) => { const g = catalogGroup(a); if (g !== last) { groups.push({ label: CATALOG_GROUPS[g][0], items: [] }); last = g; } groups[groups.length - 1].items.push(a); });
  const chips = [["all", "All"], ["1", "T1"], ["2", "T2"], ["3", "T3"], ["4", "T4"], ["Epic", "Epic"]];
  return (
    <div>
      {mostWanted.length > 0 && (
        <div className="dg-daygroup dg-mostwanted">
          <div className="dg-dayhead"><span>★ Most requested by players</span><span className="dg-daycount">{mostWanted.length}</span></div>
          {mostWanted.map(({ a, d }) => (
            <div key={a.id} className="dg-catrow">
              <div className="dg-catmain">
                <button className="dg-item-name link" onClick={() => setModal({ kind: "module", advId: a.id })}>{a.label}</button>
                <div className="dg-item-sub">{tierLabel(a.tier)} · <span className="dg-demand">👥 {d} want to play</span></div>
              </div>
              <button className="dg-btn sm" onClick={() => setModal({ kind: "session", dmId: mode === "dm" ? accountId : "", advId: a.id })}>Schedule</button>
            </div>
          ))}
        </div>
      )}
      <div className="dg-catsettingrow">
        <label className="dg-catsettinglbl">Campaign setting</label>
        <select className="dg-catsetting" value={setting} onChange={(e) => setSetting(e.target.value)}>
          <option value="all">All settings</option>
          {settings.map((s) => <option key={s} value={s}>{s}</option>)}
          <option value="community">Community Created</option>
        </select>
      </div>
      <input className="dg-catsearch" type="text" value={q} placeholder="Search the catalogue — name, code, or 'ddal4-4'…" onChange={(e) => setQ(e.target.value)} />
      <div className="dg-chips">
        {chips.map(([v, l]) => <button key={v} className={"dg-chip" + (tier === v ? " on" : "")} onClick={() => setTier(v)}>{l}</button>)}
      </div>
      <div className="dg-muted sm" style={{ margin: "2px 0 8px" }}>{list.length} adventure{list.length !== 1 ? "s" : ""}{setting !== "all" ? " · " + (setting === "community" ? "Community Created" : setting) : ""}</div>
      {list.length === 0 && setting === "community" && <Empty title="No community modules yet" body="This is where community-created adventures will appear once authors start listing them." />}
      {list.length === 0 && setting !== "community" && <Empty title="Nothing matches" body="Try a broader search, a different tier, or another setting." />}
      {groups.map((gr) => (
        <div key={gr.label} className="dg-daygroup">
          <div className="dg-dayhead"><span>{gr.label}</span><span className="dg-daycount">{gr.items.length}</span></div>
          {gr.items.map((a) => {
            const on = wl.includes(a.id);
            return (
              <div key={a.id} className="dg-catrow">
                <button className={"dg-star" + (on ? " on" : "")} title={on ? "On your wishlist" : (canSchedule ? "Star — adventures you mean to run" : "Star — adventures you want to play")} onClick={() => dispatch({ type: "TOGGLE_WISHLIST", accountId, advId: a.id })}>{on ? "★" : "☆"}</button>
                <div className="dg-catmain">
                  <button className="dg-item-name link" onClick={() => setModal({ kind: "module", advId: a.id })}>{a.label}</button>
                  <div className="dg-item-sub">{tierLabel(a.tier)}{a.levels ? " · Levels " + a.levels : ""}{canSchedule && (() => { const d = adventureDemand(state, a.id, accountId); return d > 0 ? <span className="dg-demand"> · 👥 {d} want to play</span> : null; })()}</div>
                </div>
                {canSchedule && <button className="dg-btn sm" onClick={() => setModal({ kind: "session", dmId: mode === "dm" ? accountId : "", advId: a.id })}>Schedule</button>}
                {myMentees.map((m) => <button key={m} className="dg-btn ghost sm" title={"Suggest this as a first adventure to " + accName(m)} onClick={() => dispatch({ type: "SUGGEST_ADVENTURE", mentor: accountId, mentee: m, adventureId: a.id })}>🎓 Suggest to {accName(m).split(" ")[0]}</button>)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function WishlistView({ state, accountId, mode, dispatch, setModal }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const ids = (state.wishlists && state.wishlists[accountId]) || [];
  const items = ids.map((id) => ADV_BY_ID[id]).filter(Boolean);
  const canSchedule = mode === "dm" || mode === "admin";
  const verb = canSchedule ? "run" : "play";
  if (!items.length) return <Empty title="Your wishlist is bare" body={"Star adventures in the Catalogue to mark the ones you want to " + verb + "."} />;
  return (
    <div>
      <div className="dg-muted sm" style={{ margin: "2px 0 8px" }}>{items.length} adventure{items.length !== 1 ? "s" : ""} you want to {verb}</div>
      {items.map((a) => (
        <div key={a.id} className="dg-catrow">
          <div className="dg-catmain">
            <button className="dg-item-name link" onClick={() => setModal({ kind: "module", advId: a.id })}>{a.label}</button>
            <div className="dg-item-sub">{tierLabel(a.tier)}{a.levels ? " · Levels " + a.levels : ""}</div>
          </div>
          {canSchedule && <button className="dg-btn sm" onClick={() => setModal({ kind: "session", dmId: mode === "dm" ? accountId : "", advId: a.id })}>Schedule</button>}
          <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "TOGGLE_WISHLIST", accountId, advId: a.id })}>Remove</button>
        </div>
      ))}
    </div>
  );
}

export function SessionCard({ sess, state, accountId, dispatch, mode, setModal, highlightId }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const [pick, setPick] = useState(false);
  const myChars = Object.values(state.characters).filter((c) => c.ownerId === accountId && !c.pregen && (!c.status || c.status === "active"));
  const [charSel, setCharSel] = useState(myChars[0] ? myChars[0].id : "");
  const adv = ADV_BY_ID[sess.adventureId];
  const dt = new Date(sess.datetime);
  const when = isNaN(dt.getTime()) ? sess.datetime : dt.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const mine = sess.signups.find((u) => u.accountId === accountId);
  const full = sess.signups.length >= sess.capacity;
  const iRunThis = sess.dmId === accountId;
  const dayKey = (sess.datetime || "").slice(0, 10);
  const iObserveThis = (sess.observers || []).includes(accountId);
  const commitElsewhere = nightCommitment(state, accountId, dayKey, sess.id); // committed to a different table that night
  const canManage = (mode === "dm" && sess.dmId === accountId) || mode === "admin";
  const ev = sess.eventId && (state.events || []).find((e) => e.id === sess.eventId);
  const price = sess.price || (ev && ev.price) || "";
  return (
    <div className={"dg-card" + (sess.id === highlightId ? " dg-cardhighlight" : "")} id={"sess-" + sess.id}>
      {sess.draft && <div className="dg-draftbanner"><span>📝 Draft — hidden from players until published</span>{canPublishSession(state, accountId, sess) && <button className="dg-btn sm" onClick={() => dispatch({ type: "PUBLISH_TABLE", sessionId: sess.id, by: accountId })}>Publish to schedule</button>}</div>}
      <div className="dg-card-h">
        <div>
          <div className="dg-item-name">{adv ? <button className="dg-item-name link" onClick={() => setModal({ kind: "module", advId: sess.adventureId })}>{adv.label}</button> : sess.adventureId}{sess.seriesPart ? <span className="dg-seriestag">{sess.seriesPart}</span> : null}</div>
          <div className="dg-item-sub">{sess.table ? "Table " + sess.table + " · " : ""}{adv ? tierLabel(adv.tier) : ""} · {when}</div>
          <div style={{ marginTop: 4 }}><StoreChip state={state} storeId={sess.storeId || "store_dj"} setModal={setModal} /></div>
          {ev && <div className="dg-eventtag">✦ {ev.name}{price ? " · " + price : ""}</div>}
        </div>
        <div className="dg-seats"><b>{sess.signups.length}/{sess.capacity}</b><span>seats</span></div>
      </div>
      {sess.dmId
        ? <div className="dg-dmline"><Avatar src={state.avatars && state.avatars[sess.dmId]} size={24} /> DM: {accName(sess.dmId)}{sess.preset ? <span className="dg-presettag">preset group</span> : null}{iRunThis && sess.eventId && setModal && <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "RELEASE_TABLE", sessionId: sess.id, accountId })}>Release slot</button>}</div>
        : <div className="dg-dmline dg-openslot"><span>🎲 Open table — no DM yet</span>{mode === "dm"
            ? (commitElsewhere ? <span className="dg-muted sm">you're committed that night</span> : <button className="dg-btn sm" onClick={() => dispatch({ type: "CLAIM_TABLE", sessionId: sess.id, accountId })}>Claim this table</button>)
            : <span className="dg-muted sm">a DM will claim it</span>}</div>}
      {sess.notes && <div className="dg-sessnote">{sess.notes}</div>}
      {sess.openToShadow && <div className="dg-shadowtag">open to a shadow</div>}
      {sess.permaDeath && <div className="dg-permadeath">☠ <b>Permanent death adventure.</b> A character slain here is lost for good — along with all their gear. The DM will brief the table before play.</div>}
      {sess.status === "completed" && <div className="dg-completedtag">✓ Completed{sess.completion ? " · " + (sess.completion.dtAwarded || 0) + " DT" + (sess.completion.itemsAwarded && sess.completion.itemsAwarded.length ? " · " + sess.completion.itemsAwarded.map((ie) => catName(ie.catalogId)).join(", ") : "") : ""}</div>}
      {sess.mentorId && (canManage || sess.mentorId === accountId || sess.dmId === accountId) && (
        <div className="dg-muted sm">🎓 Mentor: {accName(sess.mentorId)} · {sess.mentorStatus === "accepted" ? "confirmed" : "awaiting their confirmation"}</div>
      )}
      {sess.observers && sess.observers.length > 0 && (canManage || sess.observers.includes(accountId)) && (
        <div className="dg-muted sm">👁 Shadowing: {sess.observers.map(accName).join(", ")}</div>
      )}
      {sess.mentorId === accountId && sess.mentorStatus === "pending" && (
        <div className="dg-row-actions" style={{ marginTop: 6 }}>
          <span className="dg-muted sm" style={{ alignSelf: "center" }}>Your mentee scheduled this — can you supervise?</span>
          <button className="dg-btn sm" onClick={() => dispatch({ type: "ACCEPT_MENTOR_TABLE", sessionId: sess.id, accountId })}>Accept</button>
          <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "DECLINE_MENTOR_TABLE", sessionId: sess.id, accountId })}>Decline</button>
        </div>
      )}
      {sess.signups.length > 0 && (
        <div className="dg-roster">
          {sess.signups.map((u, i) => { const c = state.characters[u.charId]; return (
            <button key={i} className="dg-rosterchip link" onClick={() => c && setModal({ kind: "char", charId: u.charId })}>{seatName(state, u)}{u.fromWarhorn ? " · via Warhorn" : ""}{canManage && u.accountId ? " · " + accName(u.accountId) : ""}{u.monitor && isAdmin(state, accountId) ? " · check-in" : ""}</button>
          ); })}
        </div>
      )}
      {(() => {
        const seats = sess.signups.map((u) => ({ c: state.characters[u.charId], attended: u.attended })).filter((x) => x.c && x.c.level);
        if (!seats.length) return null;
        const checkedIn = seats.filter((x) => x.attended);
        const basis = checkedIn.length ? checkedIn : seats;   // once check-ins begin, APL reflects who's actually seated
        const apl = Math.round(basis.reduce((n, x) => n + x.c.level, 0) / basis.length);
        return <div className="dg-aplline">⚔ Live table APL <b>{apl}</b> <span className="dg-muted sm">· {basis.length} {checkedIn.length ? "checked in" : "signed up"}</span></div>;
      })()}
      <div className="dg-row-actions">
        {mode === "player" && iRunThis && <span className="dg-muted sm">You're the DM of this table — you can't also play at it.</span>}
        {mode === "player" && !sess.dmId && <span className="dg-muted sm">Sign-up opens once a DM claims this table.</span>}
        {mode === "player" && !iRunThis && iObserveThis && <span className="dg-muted sm">👁 You're shadowing this table — observing, not playing.</span>}
        {mode === "player" && !iRunThis && !iObserveThis && sess.dmId && sess.status !== "completed" && sess.mentorStatus === "pending" && <span className="dg-muted sm">Awaiting the mentor's confirmation — sign-up opens once they accept.</span>}
        {mode === "player" && !iRunThis && !iObserveThis && sess.dmId && sess.status !== "completed" && sess.mentorStatus !== "pending" && !mine && commitElsewhere && <span className="dg-muted sm">You're already {COMMIT_LABEL[commitElsewhere.type]} this night.</span>}
        {mode === "player" && !iRunThis && !iObserveThis && sess.dmId && sess.status !== "completed" && sess.mentorStatus !== "pending" && !commitElsewhere && sess.preset && !mine && <span className="dg-muted sm">Preset group — sign-up handled by the DM.</span>}
        {mode === "player" && !iRunThis && !iObserveThis && sess.dmId && sess.status !== "completed" && sess.mentorStatus !== "pending" && !commitElsewhere && sess.preset && !mine && setModal && <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "message", to: sess.dmId, join: true, adv: adv ? adv.label : "the table", when, fromCtx: "player", toCtx: "dm" })}>✉ Ask the DM to add me</button>}
        {mode === "player" && !iRunThis && !iObserveThis && sess.dmId && sess.status !== "completed" && sess.mentorStatus !== "pending" && !sess.preset && (mine
          ? <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "CANCEL_SIGNUP", sessionId: sess.id, accountId })}>Cancel my sign-up</button>
          : commitElsewhere ? null
          : full ? <span className="dg-muted sm">Table full</span>
          : myChars.length === 0 ? <span className="dg-muted sm">No characters to sign up.</span>
          : (!pick
              ? <button className="dg-btn sm" onClick={() => setPick(true)}>Sign up</button>
              : (() => {
                  // per-character replay guard: has THIS character already earned this adventure's rewards?
                  const replay = sess.adventureId && state.logEntries.some((l) => l.charId === charSel && l.adventureId === sess.adventureId && logHasChar(l) && l.status !== "REJECTED");
                  return (
                    <span className="dg-signup">
                      <select value={charSel} onChange={(e) => setCharSel(e.target.value)}>
                        {myChars.map((c) => <option key={c.id} value={c.id}>{c.name} · Tier {c.tier}</option>)}
                      </select>
                      {replay && <span className="dg-replaywarn">⚠ {state.characters[charSel] ? state.characters[charSel].name : "This character"} already earned this adventure's rewards — replaying earns no items, downtime, or awards. Bring a different character to earn.</span>}
                      <button className="dg-btn sm" onClick={() => { if (sess.permaDeath) { setPick(false); setModal({ kind: "confirm", title: "Permanent-death adventure", body: "If this character falls, they are lost for good — along with all their gear. Sign up anyway?", confirmLabel: "Sign up", danger: true, action: { type: "SIGNUP_SESSION", sessionId: sess.id, accountId, charId: charSel } }); return; } dispatch({ type: "SIGNUP_SESSION", sessionId: sess.id, accountId, charId: charSel }); setPick(false); }}>{replay ? "Sign up anyway" : "Confirm"}</button>
                    </span>
                  );
                })())
          )}
        {mode === "player" && !iRunThis && mine && sess.preset && <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "CANCEL_SIGNUP", sessionId: sess.id, accountId })}>Cancel my sign-up</button>}
        {mode === "dm" && sess.dmId && sess.dmId !== accountId && setModal && <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "message", to: sess.dmId, join: true, adv: adv ? adv.label : "the table", when, fromCtx: "dm", toCtx: "dm" })}>✉ Message the DM</button>}
        {mode === "dm" && sess.dmId && sess.dmId !== accountId && (state.roles[accountId] || []).includes("dm") && sess.signups.some((u) => u.accountId === accountId) && setModal && <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "escalate", dm: sess.dmId, sessionId: sess.id })}>⚑ Raise a concern</button>}
        {canManage && sess.status !== "completed" && setModal && <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "session", editId: sess.id })}>✎ Edit table</button>}
        {canManage && <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "CANCEL_SESSION", id: sess.id })}>Cancel session</button>}
      </div>
      {(iRunThis || mine) && sess.dmId && (
        <div className="dg-sessactions">
          {/* player self-check-in when they sit down */}
          {mine && sess.status !== "completed" && (mine.attended
            ? <span className="dg-checkedin">✓ Checked in</span>
            : <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "CHECK_IN", sessionId: sess.id, accountId })}>✓ Check in</button>)}

          {/* DM: roster check-in + complete + own reward (while not yet completed) */}
          {iRunThis && sess.status !== "completed" && sess.signups.length > 0 && (
            <details className="dg-checkin">
              <summary>✓ Attendance ({sess.signups.filter((u) => u.attended).length}/{sess.signups.length})</summary>
              {sess.signups.map((u, i) => { const c = state.characters[u.charId]; return (
                <label key={i} className="dg-check"><input type="checkbox" checked={!!u.attended} onChange={() => dispatch({ type: "TOGGLE_ATTENDANCE", sessionId: sess.id, accountId: u.accountId })} /><span>{c ? c.name : accName(u.accountId)}</span></label>
              ); })}
            </details>
          )}
          {iRunThis && sess.status !== "completed" && setModal && <button className="dg-btn sm" onClick={() => setModal({ kind: "completesession", sessionId: sess.id })}>✓ Mark session complete</button>}
          {iRunThis && setModal && <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "dmlog", advId: sess.adventureId, date: (sess.datetime || "").slice(0, 10), eventId: sess.eventId })}>📋 Log my DM reward</button>}

          {/* completed: attendees add the DM-confirmed treasure to their sheet */}
          {sess.status === "completed" && mine && mine.attended && (mine.logged
            ? <span className="dg-checkedin">✓ Added to your log sheet</span>
            : mine.charId
              ? <button className="dg-btn sm" onClick={() => dispatch({ type: "ADD_SESSION_TO_LOG", sessionId: sess.id, accountId })}>＋ Add rewards to my log sheet</button>
              : null)}
          {sess.status === "completed" && mine && !mine.attended && <span className="dg-muted sm">Marked not present — no rewards to add.</span>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Session and logsheet modals - scheduling a table, completing it, and the logs that follow.
// ---------------------------------------------------------------------------

export const happeningDue = (b, now) => !!b && !!b.happening && (b.happening.endsAt <= now || b.happening.beats.some((x) => x.at <= now && b.happening.beats.indexOf(x) >= b.happening.shown));

export const PROV_QUESTIONS = [
  "How did the session go from your side of the screen?",
  "What was the hardest ruling or moment, and how did you handle it?",
  "Where did your mentor step in, and what did you learn from it?",
  "What do you most want to improve before running a table alone?",
];

// ALPG p.6: the fixed fallback list when no like-for-like DMG swap fits (Artifact / no match)
export const MAGIC_ITEM_REPLACEMENTS = ["Boots of False Tracks", "Cloak of Many Fashions", "Silvered Weapon", "Pearl of Power", "Bracers of Defense", "Wand of the War Mage, +X", "Weapon, +X", "Armor, +X", "Ring of Invisibility"];

export function SessionModal({ modal, state, dispatch, close, setModal }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const editing = modal.editId ? state.sessions.find((x) => x.id === modal.editId) : null;
  const [advId, setAdvId] = useState(editing ? editing.adventureId : (modal.advId || ""));
  const [advQuery, setAdvQuery] = useState((editing && ADV_BY_ID[editing.adventureId]) ? ADV_BY_ID[editing.adventureId].label : (modal.advId && ADV_BY_ID[modal.advId] ? ADV_BY_ID[modal.advId].label : ""));
  const [advOpen, setAdvOpen] = useState(false);
  const [dmId, setDmId] = useState(editing ? editing.dmId : (modal.dmId || ""));
  const [dmQuery, setDmQuery] = useState(editing ? accName(editing.dmId) : (modal.dmId ? accName(modal.dmId) : ""));
  const [dmOpen, setDmOpen] = useState(false);
  const [datetime, setDatetime] = useState(editing ? (editing.datetime || "") : "");
  const [table, setTable] = useState(editing ? (editing.table || 0) : 0);
  const [capacity, setCapacity] = useState(editing ? (editing.capacity || 6) : 6);
  const [storeId, setStoreId] = useState(editing ? (editing.storeId || "store_dj") : "store_dj");
  const [orgId, setOrgId] = useState(editing ? (editing.orgId || "") : "");
  useEffect(() => { if (editing) return; const opts = dmOrgList(state, dmId); setOrgId((prev) => opts.length === 1 ? opts[0] : (opts.includes(prev) ? prev : "")); }, [dmId]);   // default to the DM's org when they have exactly one
  const dmOrgs = dmOrgList(state, dmId);
  const orgShort = (k) => { const o = orgRec(state, k) || {}; return o.short || o.name || k; };
  const [seriesPart, setSeriesPart] = useState(editing ? (editing.seriesPart || "") : "");
  const [notes, setNotes] = useState(editing ? (editing.notes || "") : "");
  const [preset, setPreset] = useState(editing ? !!editing.preset : false);
  const [presetSignups, setPresetSignups] = useState<any[]>([]);
  const [openToShadow, setOpenToShadow] = useState(editing ? !!editing.openToShadow : false);
  const [permaDeath, setPermaDeath] = useState(editing ? !!editing.permaDeath : false);
  const asEvent = !editing && !!modal.asEvent;
  const [evName, setEvName] = useState("");
  const [evPrice, setEvPrice] = useState("");
  const adv = advId ? ADV_BY_ID[advId] : null;
  const advSuggest = searchAdventures(advQuery);
  const dmAccts = ACCOUNTS.filter((a) => (state.roles && state.roles[a.id] || []).includes("dm"));
  const dmSuggest = dmAccts.filter((a) => a.name.toLowerCase().includes(dmQuery.toLowerCase()));
  const dateStr = (datetime || "").slice(0, 10);
  const dayTables = dateStr ? tablesOn(state, dateStr).filter((x) => !editing || x.id !== editing.id) : [];
  const occupied: Record<string, any> = {};
  dayTables.forEach((x) => { occupied[x.table] = x.dmId; });
  const freeTables = [1, 2, 3].filter((t) => t <= TABLE_COUNT && !occupied[t]);
  const dayFull = dateStr && freeTables.length === 0 && !editing;
  const canCreate = advId && datetime && (editing ? true : (dmId && !dayFull && (table ? freeTables.includes(table) : freeTables.length > 0))) && (!asEvent || evName.trim());
  const create = () => {
    if (!canCreate) return;
    if (editing) {
      dispatch({ type: "EDIT_SESSION", id: editing.id, adventureId: advId, dmId, datetime, table: table || editing.table || freeTables[0] || 1, capacity: +capacity || 6, storeId, orgId, seriesPart: seriesPart.trim(), notes: notes.trim(), openToShadow, permaDeath });
    } else if (asEvent) {
      dispatch({ type: "CREATE_EVENT", name: evName.trim(), date: (datetime || "").slice(0, 10), stores: [storeId], price: evPrice.trim(), notifyPlayers: true, createdBy: dmId,
        tables: [{ adventureId: advId, dmId, datetime, table: table || freeTables[0], capacity: +capacity || 6, storeId, notes: notes.trim() }] });
    } else {
      dispatch({ type: "CREATE_SESSION", adventureId: advId, dmId, datetime, table: table || freeTables[0], capacity: +capacity || 6, storeId, orgId, seriesPart: seriesPart.trim(), notes: notes.trim(), preset, presetSignups, openToShadow, permaDeath });
    }
    close();
  };
  return (
    <>
      <h3 className="dg-modal-h">{editing ? "Edit table" : asEvent ? "List your table as an event" : "Schedule a session"}</h3>
      <p className="dg-muted sm">{editing ? "Update this table. Anyone already signed up will be notified of the change." : asEvent ? "Post your table as a special event — it appears on the schedule with its name and price, and notifies players at your store." : "Post a table for players to sign up. Pick the adventure and DM from the lists."}</p>
      {asEvent && (
        <>
          <label className="dg-field"><span>Event name</span><input type="text" value={evName} onChange={(e) => setEvName(e.target.value)} placeholder="e.g. Midnight One-Shot" /></label>
          <label className="dg-field"><span>Price (optional)</span><input type="text" value={evPrice} onChange={(e) => setEvPrice(e.target.value)} placeholder="e.g. $5 table fee — leave blank if free" /></label>
        </>
      )}
      {dmId && state.mentorSuggest && state.mentorSuggest[dmId] && advId !== state.mentorSuggest[dmId].adventureId && ADV_BY_ID[state.mentorSuggest[dmId].adventureId] && (
        <div className="dg-suggestbanner">🎓 Your mentor {accName(state.mentorSuggest[dmId].mentor).split(" ")[0]} suggests <b>{ADV_BY_ID[state.mentorSuggest[dmId].adventureId].label}</b> for your first table.
          <button className="dg-btn ghost sm" onClick={() => { const sa = ADV_BY_ID[state.mentorSuggest[dmId].adventureId]; setAdvId(sa.id); setAdvQuery(sa.label); }}>Use this</button>
        </div>
      )}
      <label className="dg-field"><span>Adventure</span>
        <input type="text" value={advQuery} placeholder="Type a name or code…" onChange={(e) => { setAdvQuery(e.target.value); setAdvId(""); setAdvOpen(true); }} onFocus={() => setAdvOpen(true)} />
      </label>
      {advOpen && advQuery && !advId && (
        <div className="dg-suggest">
          {advSuggest.length === 0 ? <div className="dg-suggest-empty">No matching adventure.</div> :
            advSuggest.map((a) => (
              <button key={a.id} className="dg-suggest-item" onClick={() => { setAdvId(a.id); setAdvQuery(a.label); setAdvOpen(false); }}>
                <div className="dg-suggest-title">{a.label}</div>
                <div className="dg-suggest-sub">{tierLabel(a.tier)}{a.levels ? " · Levels " + a.levels : ""} · {a.summary}</div>
              </button>
            ))}
        </div>
      )}
      {adv && <div className="dg-advcard"><div className="dg-advsummary">{adv.summary}</div><div className="dg-advmeta">{tierLabel(adv.tier)}{adv.levels ? " · Levels " + adv.levels : ""}</div></div>}
      <label className="dg-field"><span>Dungeon Master</span>
        <input type="text" value={dmQuery} placeholder="Type the DM's name…" onChange={(e) => { setDmQuery(e.target.value); setDmId(""); setDmOpen(true); }} onFocus={() => setDmOpen(true)} />
      </label>
      {dmOpen && dmQuery && !dmId && (
        <div className="dg-suggest">
          {dmSuggest.length === 0 ? <div className="dg-suggest-empty">No matching DM.</div> :
            dmSuggest.map((a) => (
              <button key={a.id} className="dg-suggest-item row" onClick={() => { setDmId(a.id); setDmQuery(a.name); setDmOpen(false); }}>
                <Avatar src={state.avatars && state.avatars[a.id]} size={28} /><span>{a.name}</span>
              </button>
            ))}
        </div>
      )}
      <div className="dg-field2">
        <label className="dg-field"><span>Date & time</span>
          <input type="datetime-local" value={datetime} onChange={(e) => { setDatetime(e.target.value); setTable(0); }} />
        </label>
        <label className="dg-field"><span>Seats</span>
          <input type="number" min="1" max="12" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </label>
      </div>
      {dateStr && (
        <div className="dg-field"><span>Table (max {TABLE_COUNT} per night)</span>
          {dayFull ? <div className="dg-rulewarn"><div><b>All {TABLE_COUNT} tables are booked</b> on this date. Pick another day — we can't run more tables than the venue supports.</div></div> : (
            <div className="dg-tablepick">
              {[1, 2, 3].filter((t) => t <= TABLE_COUNT).map((t) => {
                const taken = occupied[t];
                const sel = (table || freeTables[0]) === t && !taken;
                return <button key={t} type="button" disabled={!!taken} className={"dg-tablebtn" + (sel ? " on" : "") + (taken ? " taken" : "")} onClick={() => setTable(t)}>Table {t}{taken ? <span className="dg-tablewho">{accName(taken)}</span> : <span className="dg-tablewho">open</span>}</button>;
              })}
            </div>
          )}
        </div>
      )}
      {dmId && dmOrgs.length > 0 && (
        <label className="dg-field"><span>Organization</span>
          {dmOrgs.length === 1
            ? <div className="dg-muted sm">Run under <b>{orgShort(dmOrgs[0])}</b>{orgPrescheduleById(state, dmOrgs[0]) ? " — new tables are pre-scheduled (a lead publishes them)" : ""}</div>
            : <select value={orgId} onChange={(e) => setOrgId(e.target.value)}>
                <option value="">— none (public table) —</option>
                {dmOrgs.map((k) => <option key={k} value={k}>{orgShort(k)}{orgPrescheduleById(state, k) ? " · pre-scheduled" : ""}</option>)}
              </select>}
        </label>
      )}
      <label className="dg-field"><span>Store</span>
        <div className="dg-storepick">
          <StoreChip state={state} storeId={storeId} setModal={setModal} />
          <StorePicker state={state} setModal={setModal} exclude={[storeId]} placeholder="Change store…" onPick={(sid) => { setStoreId(sid); setPresetSignups((ps) => ps.filter((p) => storesOf(state, p.accountId).includes(sid))); }} />
        </div>
      </label>
      <label className="dg-field"><span>Series / part (optional)</span>
        <input type="text" value={seriesPart} onChange={(e) => setSeriesPart(e.target.value)} placeholder="e.g. Part 1 of 2" />
      </label>
      <label className="dg-field"><span>Notes (optional)</span>
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. 4-hour module; preset players" />
      </label>
      <label className="dg-check"><input type="checkbox" checked={preset} onChange={(e) => setPreset(e.target.checked)} /><span>Preset group — sign-up handled by the DM (no open sign-up)</span></label>
      {preset && (
        <div className="dg-presetpick">
          <div className="dg-muted sm" style={{ marginBottom: 6 }}>Pick the characters you're pre-scheduling from <b>{storeName(state, storeId)}</b> — they'll be seated at the table now.</div>
          {presetSignups.length > 0 && (
            <div className="dg-roster" style={{ marginBottom: 6 }}>
              {presetSignups.map((ps) => { const c = state.characters[ps.charId]; return (
                <span key={ps.charId} className="dg-rosterchip">{c ? c.name : "?"} · {accName(ps.accountId)} <button className="dg-linkbtn" onClick={() => setPresetSignups(presetSignups.filter((x) => x.charId !== ps.charId))}>✕</button></span>
              ); })}
            </div>
          )}
          {presetSignups.length >= (+capacity || 6)
            ? <div className="dg-muted sm">Table full ({presetSignups.length}/{+capacity || 6}).</div>
            : (() => {
                const takenOwners = new Set(presetSignups.map((p) => p.accountId));
                const avail = Object.values(state.characters).filter((c) => !c.pregen && c.ownerId && c.ownerId !== dmId && !takenOwners.has(c.ownerId) && storesOf(state, c.ownerId).includes(storeId) && (!c.status || c.status === "active"));
                if (!avail.length) return <div className="dg-muted sm">No more players at {storeName(state, storeId)} to add.</div>;
                return (
                  <select value="" onChange={(e) => { const c = state.characters[e.target.value]; if (c) setPresetSignups([...presetSignups, { accountId: c.ownerId, charId: c.id }]); }}>
                    <option value="">Add a player's character…</option>
                    {avail.map((c) => <option key={c.id} value={c.id}>{c.name} · {accName(c.ownerId)} · Tier {c.tier}</option>)}
                  </select>
                );
              })()}
        </div>
      )}
      <label className="dg-check"><input type="checkbox" checked={openToShadow} onChange={(e) => setOpenToShadow(e.target.checked)} /><span>Open to a shadow — a trainee DM may observe this table</span></label>
      <label className="dg-check"><input type="checkbox" checked={permaDeath} onChange={(e) => setPermaDeath(e.target.checked)} /><span>⚠ Permanent death adventure (e.g. Tomb of Annihilation) — a slain character is lost, along with their gear</span></label>
      <div className="dg-row-actions">
        <button className="dg-btn" onClick={create} disabled={!canCreate}>{editing ? "Save changes" : asEvent ? "List event" : "Post session"}</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

export function CompleteSessionModal({ modal, state, dispatch, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const ss = state.sessions.find((x) => x.id === modal.sessionId);
  const [present, setPresent] = useState(() => new Set((ss ? ss.signups : []).filter((u) => u.attended).map((u) => u.accountId)));
  const [items, setItems] = useState<any[]>([]);
  const [addCat, setAddCat] = useState("bagholding");
  const [addCls, setAddCls] = useState("MAGIC_ITEM");
  const [dt, setDt] = useState(ADV_BY_ID[ss && ss.adventureId] && ADV_BY_ID[ss.adventureId].dt ? ADV_BY_ID[ss.adventureId].dt : 10);
  const [gp, setGp] = useState<any>(0);
  const [story, setStory] = useState("");
  const [giftKind, setGiftKind] = useState("charm");
  const [giftName, setGiftName] = useState("");
  const [giftDesc, setGiftDesc] = useState("");
  const [giftRealm, setGiftRealm] = useState("");
  const [giftEpic, setGiftEpic] = useState(false);
  const [notes, setNotes] = useState("");
  if (!ss) return (<><h3 className="dg-modal-h">Session not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  const adv = ADV_BY_ID[ss.adventureId];
  const toggle = (id) => { const n = new Set(present); n.has(id) ? n.delete(id) : n.add(id); setPresent(n); };
  const complete = () => {
    dispatch({ type: "COMPLETE_SESSION", sessionId: ss.id, attendees: [...present], itemsAwarded: items, dtAwarded: +dt || 0, gpAwarded: +gp || 0, storyAwards: story.trim(), giftAwarded: giftName.trim() ? { kind: giftKind, name: giftName.trim(), desc: giftDesc.trim(), realm: giftRealm.trim(), epicBoon: giftKind === "boon" && giftEpic } : null, notes: notes.trim() });
    close();
  };
  return (
    <>
      <h3 className="dg-modal-h">Mark session complete</h3>
      <p className="dg-muted sm">{adv ? adv.label : ss.adventureId}. Confirm who was at the table and record the treasure you actually awarded. Attendees can then add it straight to their log sheets — no re-approval needed, since you're confirming it here.</p>

      <div className="dg-insp-sec">Who was at the table?</div>
      {ss.signups.length === 0 ? <div className="dg-muted sm">No sign-ups on record.</div> : ss.signups.map((u, i) => {
        const c = state.characters[u.charId];
        return <label key={i} className="dg-check"><input type="checkbox" checked={present.has(u.accountId)} onChange={() => toggle(u.accountId)} /><span>{c ? c.name : accName(u.accountId)} <span className="dg-muted sm">· {accName(u.accountId)}{u.attended ? " · checked in" : ""}</span></span></label>;
      })}

      <div className="dg-insp-sec">Treasure awarded</div>
      <div className="dg-muted sm" style={{ marginBottom: 6 }}>What each attendee earned this session.</div>
      <label className="dg-field"><span>Downtime days</span><input type="number" value={dt} onChange={(e) => setDt(e.target.value)} /></label>
      <label className="dg-field"><span>Gold each (gold-value treasure, split evenly)</span><input type="number" value={gp} onChange={(e) => setGp(e.target.value)} placeholder="e.g. salvage value to the fence" /></label>
      {(() => { const t = ADV_BY_ID[ss.adventureId] ? ADV_BY_ID[ss.adventureId].tier : 1; const b = TREASURE_ALLOWANCE[t]; return b ? <div className="dg-muted sm" style={{ marginTop: -4, marginBottom: 6 }}>Tier {t} session allowance: <b>{b[0].toLocaleString()}–{b[1].toLocaleString()} GP</b> <span style={{ opacity: .8 }}>(ALDMG — unspecified treasure per session)</span></div> : null; })()}
      {items.length > 0 ? items.map((ie, i) => (
        <div key={i} className="dg-admin-row"><span>{catName(ie.catalogId)} · <span className="dg-muted sm">{itemMetaLine(ie.catalogId, ie.proposedClass)}</span></span><button className="dg-btn ghost sm" onClick={() => setItems(items.filter((_, j) => j !== i))}>Remove</button></div>
      )) : <div className="dg-muted sm" style={{ fontStyle: "italic" }}>No magic items added yet. Pick one below and tap “Add,” or leave empty for a downtime-only session.</div>}
      <div className="dg-field2" style={{ marginTop: 8 }}>
        <label className="dg-field"><span>Add item</span>
          <select value={addCat} onChange={(e) => setAddCat(e.target.value)}>{Object.values(CATALOG).filter((c) => c.rarity !== "unique").map((c) => <option key={c.id} value={c.id}>{c.name} · {RARITY[c.rarity].label}</option>)}</select>
        </label>
        <label className="dg-field"><span>Class</span>
          {isMundaneCat(addCat)
            ? <div className="dg-muted sm">Gear — mundane equipment. It isn&rsquo;t a magic item, has no rarity, and takes no carry slot.</div>
            : <select value={addCls} onChange={(e) => setAddCls(e.target.value)}><option value="MAGIC_ITEM">Magic item</option><option value="UNTRADEABLE">Untradeable</option><option value="EVENT_CERT">Event certificate</option><option value="STORY_ITEM">Story item</option></select>}
        </label>
      </div>
      <button className="dg-btn sm" onClick={() => setItems([...items, { catalogId: addCat, proposedClass: addCls, qty: 1 }])}>+ Add {catName(addCat)} to the awards</button>
      <RewardLegalityChecklist />
      <label className="dg-field" style={{ marginTop: 8 }}><span>Story awards (optional)</span><input type="text" value={story} onChange={(e) => setStory(e.target.value)} placeholder="e.g. Friend of the Harpers" /></label>
      <div className="dg-field" style={{ marginTop: 8 }}>
        <span>Supernatural gift (optional) <span className="dg-muted sm">— goes to every attendee's character</span></span>
        <div className="dg-bastorderrow">
          <select value={giftKind} onChange={(e) => setGiftKind(e.target.value)}>{GIFT_KINDS.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}</select>
          <input type="text" value={giftName} onChange={(e) => setGiftName(e.target.value)} placeholder="Gift name (blank = none)" style={{ flex: 1 }} />
        </div>
      </div>
      {giftName.trim() && <>
        <label className="dg-field"><span>Effect</span><input type="text" value={giftDesc} onChange={(e) => setGiftDesc(e.target.value)} placeholder="What it does…" /></label>
        <label className="dg-field"><span>Realm-bound? (Dark/Fey)</span><input type="text" value={giftRealm} onChange={(e) => setGiftRealm(e.target.value)} placeholder="e.g. Barovia — blank if not" /></label>
        {giftKind === "boon" && <label className="dg-field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><input type="checkbox" checked={giftEpic} onChange={(e) => setGiftEpic(e.target.checked)} /><span>Epic Boon Feat</span></label>}
      </>}
      <label className="dg-field"><span>Notes (optional)</span><textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>

      <div className="dg-suggestbanner" style={{ marginTop: 12 }}>Each attendee will receive: <b>{+dt || 0} DT</b>{items.length ? " · " + items.map((ie) => catName(ie.catalogId)).join(", ") : " · no magic items"}.</div>
      <div className="dg-row-actions" style={{ marginTop: 8 }}>
        <button className="dg-btn" onClick={complete}>Complete &amp; notify {present.size} player{present.size !== 1 ? "s" : ""}</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

export function EventBuildModal({ modal, state, dispatch, accountId, close, setModal }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [link, setLink] = useState("");
  const [notify, setNotify] = useState(true);
  const [stores, setStores] = useState(["store_dj"]);
  const [tables, setTables] = useState<any[]>([]);
  const addTable = () => setTables([...tables, { advId: "", advQuery: "", advOpen: false, datetime: date ? date + "T18:00" : "", storeId: stores[0] || "store_dj", capacity: 6, price: "" }]);
  const upd = (i, patch) => setTables(tables.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  const del = (i) => setTables(tables.filter((_, j) => j !== i));
  const canCreate = name.trim() && date && stores.length && tables.length && tables.every((t) => t.advId && t.datetime);
  const create = () => {
    if (!canCreate) return;
    dispatch({ type: "CREATE_EVENT", name: name.trim(), date, stores, price: price.trim(), externalLink: link.trim(), notifyPlayers: notify, createdBy: accountId, orgId: (modal && modal.orgId) || undefined,
      tables: tables.map((t, i) => ({ adventureId: t.advId, dmId: "", datetime: t.datetime, table: i + 1, storeId: t.storeId, capacity: +t.capacity || 6, price: t.price.trim() })) });
    close();
  };
  return (
    <>
      <h3 className="dg-modal-h">Build an event</h3>
      <p className="dg-muted sm">Lay out the tables — each is an open slot a DM can claim. Broadcast to one or more stores; players there are notified.</p>
      <label className="dg-field"><span>Event name</span><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Autumn Convergence" /></label>
      <div className="dg-field2">
        <label className="dg-field"><span>Date</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="dg-field"><span>Price (optional)</span><input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$5 table fee / $40 badge" /></label>
      </div>
      <label className="dg-field"><span>External sign-up link (optional)</span><input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" /></label>
      <label className="dg-check"><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /><span>Notify players at the target stores</span></label>

      <div className="dg-insp-sec">Broadcast to stores</div>
      <div className="dg-storelist">
        {stores.map((sid) => <span key={sid} className="dg-storechipwrap"><StoreChip state={state} storeId={sid} setModal={setModal} />{stores.length > 1 && <button className="dg-chipx" onClick={() => setStores(stores.filter((x) => x !== sid))}>✕</button>}</span>)}
      </div>
      <StorePicker state={state} setModal={setModal} exclude={stores} placeholder="+ Add a store to broadcast to…" onPick={(sid) => setStores([...new Set([...stores, sid])])} />

      <div className="dg-insp-sec">Tables ({tables.length})</div>
      {tables.map((t, i) => {
        const sug = searchAdventures(t.advQuery);
        return (
          <div key={i} className="dg-card">
            <div className="dg-row-actions" style={{ justifyContent: "space-between" }}>
              <b>Table {i + 1}</b>
              <button className="dg-btn ghost sm" onClick={() => del(i)}>Remove</button>
            </div>
            <label className="dg-field"><span>Adventure</span>
              <input type="text" value={t.advQuery} placeholder="Type a name or code…" onChange={(e) => upd(i, { advQuery: e.target.value, advId: "", advOpen: true })} onFocus={() => upd(i, { advOpen: true })} />
            </label>
            {t.advOpen && t.advQuery && !t.advId && (
              <div className="dg-suggest">
                {sug.length === 0 ? <div className="dg-suggest-empty">No match.</div> : sug.slice(0, 6).map((a) => (
                  <button key={a.id} className="dg-suggest-item" onClick={() => upd(i, { advId: a.id, advQuery: a.label, advOpen: false })}><div className="dg-suggest-title">{a.label}</div><div className="dg-suggest-sub">{tierLabel(a.tier)}</div></button>
                ))}
              </div>
            )}
            <div className="dg-field2">
              <label className="dg-field"><span>Time</span><input type="datetime-local" value={t.datetime} onChange={(e) => upd(i, { datetime: e.target.value })} /></label>
              <label className="dg-field"><span>Seats</span><input type="number" min="1" max="8" value={t.capacity} onChange={(e) => upd(i, { capacity: e.target.value })} /></label>
            </div>
            <div className="dg-storepick"><StoreChip state={state} storeId={t.storeId} setModal={setModal} /><StorePicker state={state} exclude={[t.storeId]} placeholder="Change store…" onPick={(sid) => upd(i, { storeId: sid })} /></div>
            <label className="dg-field"><span>Price override (optional)</span><input type="text" value={t.price} onChange={(e) => upd(i, { price: e.target.value })} placeholder="Leave blank to use the event price" /></label>
          </div>
        );
      })}
      <button className="dg-btn ghost full" onClick={addTable}>+ Add a table</button>

      <div className="dg-row-actions" style={{ marginTop: 12 }}>
        <button className="dg-btn" onClick={create} disabled={!canCreate}>Create event &amp; {tables.length} table{tables.length !== 1 ? "s" : ""}</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

// ---- Phase 1: reward-legality (ALPG Appendix B — Unavailable Magic Item Criteria) ----
export const UNAVAILABLE_CRITERIA = [
  { id: "thirdparty", label: "Third-Party", desc: "From outside the campaign's allowed sources", ex: "a Critical Role item in a non-CR campaign" },
  { id: "artifact", label: "Artifact", desc: "Any artifact", ex: "Eye of Vecna" },
  { id: "evil", label: "Evil", desc: "Evil alignment, turns a character evil, or needs an evil act to obtain", ex: "Orcus Figurine, Ring of Winter" },
  { id: "harms", label: "Harms Player Characters", desc: "Dictates damage, a penalty, or loss of autonomy to fellow characters", ex: "Deck of Many Things" },
  { id: "love", label: "Love Charm", desc: "Charms or compels affection", ex: "Philter of Love" },
  { id: "mechanical", label: "Mechanical Effect", desc: "Permanent mechanical or ability-score effect", ex: "Deck of Many More Things, Nether Scroll of Azumar", exc: "Bag of Beans, Favors, tomes, manuals, DMG minor property/quirk, Supernatural Gifts" },
  { id: "misprint", label: "Misprint", desc: "Obvious or noted by errata, designer, or AL admin", ex: "+1 mithral splint armor" },
  { id: "dmchoice", label: "Unspecified DM-Choice Effects", desc: "Unspecified cards, runes, spell levels, or other powers", ex: "Docent, Moonblade, Robe of Useful Items", exc: "text-made choices, e.g. Quaal's Feather Token (Swan Boat)" },
  { id: "enspelled", label: "Unspecified Enspelled Item", desc: "An Enspelled item with no text-named spell", ex: "Enspelled Weapon / Armor / Staff" },
  { id: "obliterating", label: "Obliterating", desc: "Non-scroll item that obliterates matter (not itself)", ex: "Sphere of Annihilation" },
  { id: "part", label: "Part of an Item", desc: "A single piece of a set, or a broken item (no replacement)", ex: "one Boot of Elvenkind" },
  { id: "plot", label: "Plot Device", desc: "Bound to story-specific NPCs, creatures, locations, or events", ex: "Holy Symbol of Ravenkind, a magic key or map" },
  { id: "spellcaster", label: "Spellcaster", desc: "A sentient item that itself can cast spells", ex: "Tearulai" },
  { id: "vehicle", label: "Vehicle", desc: "Magic navigation tool or vehicle larger than a keelboat", ex: "adventure-granted Spelljammer Helm", exc: "character-created" },
  { id: "disruptive", label: "Otherwise Disruptive", desc: "Unavailable for other reasons; DM may temporarily remove (ALDMG Disruptions)", ex: "Dawnbringer, Iron Flask, Deck of Several Things" },
];

// Collapsible Appendix B reference the DM can open while entering rewards (a table-prep restriction, per ALPG). The DM adjudicates; this advises.
export function RewardLegalityChecklist() {
  const [open, setOpen] = useState(false);
  return (
    <div className="dg-legalcheck">
      <button type="button" className="dg-legaltoggle" onClick={() => setOpen(!open)}>{open ? "▾" : "▸"} ⚖ Reward legality — Unavailable Item Criteria (ALPG App. B)</button>
      {open && (
        <div className="dg-legalbody">
          <div className="dg-muted sm">An item is <b>unavailable to reward</b> if it meets <i>any</i> criterion below. If it's needed for the story it becomes a <b>Story Item</b>; otherwise offer a <b>Magic Item Replacement</b> (same or lower rarity from the DMG).</div>
          {UNAVAILABLE_CRITERIA.map((c) => (
            <div key={c.id} className="dg-legalrow">
              <span className="dg-legalname">{c.label}.</span> <span className="dg-muted sm">{c.desc}{c.ex ? " — e.g. " + c.ex + "." : "."}</span>
              {c.exc && <span className="dg-legalexc"> Exceptions: {c.exc}.</span>}
            </div>
          ))}
          <div className="dg-legalfoot dg-muted sm">Also <b>ignore</b> any item feature that rewards GP or permanent magic items (ALPG p.5). Feats may never be rewarded (ALDMG, Marks of Prestige).</div>
          <div className="dg-muted sm">If no like-for-like DMG swap fits (Artifact / no match), the fixed <b>Magic Item Replacement</b> options are: {MAGIC_ITEM_REPLACEMENTS.join(", ")} — same or lower rarity.</div>
        </div>
      )}
    </div>
  );
}

export function DMLogModal({ modal, state, dispatch, accountId, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const prov = provOf(state, accountId) === "provisional-dm";
  const mentorId = prov && state.mentors ? state.mentors[accountId] : null;
  const [advId, setAdvId] = useState(modal.advId || "");
  const [advQuery, setAdvQuery] = useState(modal.advId && ADV_BY_ID[modal.advId] ? ADV_BY_ID[modal.advId].label : "");
  const [advOpen, setAdvOpen] = useState(false);
  const [date, setDate] = useState(modal.date || new Date().toISOString().slice(0, 10));
  const [charId, setCharId] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [addCat, setAddCat] = useState("bagholding");
  const [addCls, setAddCls] = useState("MAGIC_ITEM");
  const [ans, setAns] = useState(["", "", "", ""]);
  const [eventId, setEventId] = useState(modal.eventId || "");
  const myEvents = (state.events || []).filter((ev) => state.sessions.some((se) => se.eventId === ev.id && se.dmId === accountId));
  const adv = advId ? ADV_BY_ID[advId] : null;
  const advSuggest = searchAdventures(advQuery);
  const myChars = Object.values(state.characters).filter((c) => c.ownerId === accountId && !c.pregen && (!c.status || c.status === "active"));
  const advTier = adv && typeof adv.tier === "number" ? adv.tier : null;
  const eligible = advTier ? myChars.filter((c) => c.tier === advTier) : myChars;
  const dupe = advId && charId ? state.logEntries.some((l) => l.charId === charId && l.adventureId === advId && l.entryType !== "EXPENDITURE" && l.status !== "REJECTED") : null;
  const setA = (i) => (e) => { const a = [...ans]; a[i] = e.target.value; setAns(a); };
  const canSubmit = !!advId && !!charId && !dupe;
  const submit = () => {
    if (!canSubmit) return;
    if (prov) {
      dispatch({ type: "SUBMIT_PROV_LOG", provDm: accountId, charId, adventureId: advId, adventure: adv.label, tier: adv.tier, date, itemsEarned: items, answers: PROV_QUESTIONS.reduce((o, q, i) => { o[q] = ans[i]; return o; }, {}) });
    } else {
      dispatch({ type: "LOG_DM_SESSION", dmId: accountId, charId, adventureId: advId, adventure: adv.label, summary: adv.summary, tier: adv.tier, date, itemsEarned: items, dtEarned: 10, eventId: eventId || undefined, by: accountId });
    }
    close();
  };
  return (
    <>
      <h3 className="dg-modal-h">Log a session you ran</h3>
      <p className="dg-muted sm">{prov
        ? "You're a provisional DM, so this goes to your mentor" + (mentorId ? " (" + accName(mentorId) + ")" : "") + " for approval. On approval the rewards apply (10 DT + any items) to your chosen character, and your mentor decides whether you're ready to run a table alone."
        : "Take a session's rewards as if you'd played, assigned to one of your characters of the adventure's tier (AL \"gain rewards as if you had been a player\"). It applies immediately — you're self-certifying — granting 10 DT plus any items you record, and that character can't earn from this adventure again."}</p>
      <label className="dg-field"><span>Adventure you ran</span>
        <input type="text" value={advQuery} placeholder="Type a name, code, or 'ddal4-4'…" onChange={(e) => { setAdvQuery(e.target.value); setAdvId(""); setCharId(""); setAdvOpen(true); }} onFocus={() => setAdvOpen(true)} />
      </label>
      {advOpen && advQuery && !advId && (
        <div className="dg-suggest">
          {advSuggest.length === 0 ? <div className="dg-suggest-empty">No matching adventure in the catalogue.</div> :
            advSuggest.map((a) => (
              <button key={a.id} className="dg-suggest-item" onClick={() => { setAdvId(a.id); setAdvQuery(a.label); setAdvOpen(false); }}>
                <div className="dg-suggest-title">{a.label}</div>
                <div className="dg-suggest-sub">{tierLabel(a.tier)}{a.levels ? " · Levels " + a.levels : ""}</div>
              </button>
            ))}
        </div>
      )}
      {adv && <div className="dg-advcard"><div className="dg-advsummary">{adv.summary}</div><div className="dg-advmeta">{tierLabel(adv.tier)}{adv.levels ? " · Levels " + adv.levels : ""}</div></div>}
      <label className="dg-field"><span>Date</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
      {!prov && myEvents.length > 0 && (
        <label className="dg-field"><span>Ran at an event? (optional — stamps items with its provenance)</span>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">— not an event table —</option>
            {myEvents.map((ev) => <option key={ev.id} value={ev.id}>{ev.name} · {ev.date}</option>)}
          </select>
        </label>
      )}
      {adv && (
        <label className="dg-field"><span>Assign the reward to{advTier ? " (your Tier " + advTier + " characters)" : ""}</span>
          {eligible.length === 0
            ? <div className="dg-rulewarn"><div><b>No eligible character.</b> A DM reward must go to one of your own characters of the {advTier ? "session's tier (Tier " + advTier + ")" : "session's tier"}. Add one on your roster, or the reward is lost.</div></div>
            : <select value={charId} onChange={(e) => setCharId(e.target.value)}>
                <option value="">— choose a character —</option>
                {eligible.map((c) => <option key={c.id} value={c.id}>{c.name} · {[c.race, c.cls].filter(Boolean).join(" ")} · Tier {c.tier}</option>)}
              </select>}
        </label>
      )}
      {dupe && <div className="dg-rulewarn"><div><b>Already earned.</b> That character already has a log entry for this adventure — a character can earn an adventure's rewards only once.</div></div>}
      {charId && (
        <>
          <div className="dg-insp-sec">Item rewards (optional)</div>
          {items.length === 0 ? <div className="dg-muted sm">No items — 10 DT will still be granted.</div> :
            items.map((ie, i) => (
              <div key={i} className="dg-admin-row">
                <span>{catName(ie.catalogId)} · <span className="dg-muted sm">{itemMetaLine(ie.catalogId, ie.proposedClass)}</span></span>
                <button className="dg-btn ghost sm" onClick={() => setItems(items.filter((_, j) => j !== i))}>Remove</button>
              </div>
            ))}
          <div className="dg-field2" style={{ marginTop: 8 }}>
            <label className="dg-field"><span>Add item</span>
              <select value={addCat} onChange={(e) => setAddCat(e.target.value)}>
                {Object.values(CATALOG).filter((c) => c.rarity !== "unique").map((c) => <option key={c.id} value={c.id}>{c.name} · {RARITY[c.rarity].label}</option>)}
              </select>
            </label>
            <label className="dg-field"><span>Class</span>
              {isMundaneCat(addCat)
                ? <div className="dg-muted sm">Gear — mundane equipment. Not a magic item, no rarity, no carry slot.</div>
                : <select value={addCls} onChange={(e) => setAddCls(e.target.value)}>
                <option value="MAGIC_ITEM">Magic item</option>
                <option value="UNTRADEABLE">Untradeable</option>
                <option value="EVENT_CERT">Event certificate</option><option value="STORY_ITEM">Story item</option>
              </select>}
            </label>
          </div>
          <button className="dg-btn ghost sm" onClick={() => setItems([...items, { catalogId: addCat, proposedClass: addCls, qty: 1 }])}>+ Add this item</button>
          <RewardLegalityChecklist />
        </>
      )}
      {prov && charId && (
        <>
          <div className="dg-insp-sec">Your experience (goes to your mentor)</div>
          {PROV_QUESTIONS.map((q, i) => <label key={i} className="dg-field"><span>{q}</span><textarea rows={2} value={ans[i]} onChange={setA(i)} /></label>)}
        </>
      )}
      <div className="dg-row-actions">
        <button className="dg-btn" onClick={submit} disabled={!canSubmit}>{prov ? "Submit to my mentor" : "Log & grant reward"}</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

export function LogSheetModal({ modal, state, setModal, close }: { state: AppState; [k: string]: any }) {
  const ch = state.characters[modal.charId];
  const entries = state.logEntries.filter((l) => l.charId === ch.id && logHasChar(l));
  const earnedDT = entries.filter((l) => l.entryType !== "EXPENDITURE" && l.status === "APPROVED").reduce((n, l) => n + (l.dtEarned || 0), 0);
  const spentDT = entries.filter((l) => l.entryType === "EXPENDITURE").reduce((n, l) => n + (l.dtSpent || 0), 0);
  const sessions = entries.filter((l) => l.entryType !== "EXPENDITURE" && l.entryType !== "DISPOSAL").length;
  return (
    <>
      <h3 className="dg-modal-h">{ch.name}'s Log Sheet</h3>
      <div className="dg-item-sub">{ch.cls} · Tier {ch.tier} · {ch.campaign}</div>
      <div className="dg-logstats">
        <div><b>{sessions}</b><span>sessions</span></div>
        <div><b>{earnedDT}</b><span>DT earned</span></div>
        <div><b>{spentDT}</b><span>DT spent</span></div>
        <div><b>{ch.dt}</b><span>DT balance</span></div>
      </div>
      {(ch.gifts || []).length > 0 && (
        <div className="dg-logline" style={{ margin: "8px 0" }}>
          <b>Carried gifts:</b> {GIFT_KINDS.map((k) => { const c = (ch.gifts || []).filter((g) => g.kind === k.id && g.carried); return c.length ? k.plural + ": " + c.map((g) => g.name).join(", ") : null; }).filter(Boolean).join(" · ") || "none carried"}
        </div>
      )}
      <div className="dg-logrows">
        {entries.length === 0 ? <div className="dg-muted sm">No entries yet.</div> :
          entries.map((l) => (
            <div key={l.id} className={"dg-logrow" + (l.entryType === "EXPENDITURE" ? " spend" : "")}>
              <div className="dg-logrow-main">
                <div className="dg-logrow-title">{l.entryType === "EXPENDITURE" ? l.spentOn : l.entryType === "DISPOSAL" ? "Released " + l.itemName : l.adventure}</div>
                {l.summary && <div className="dg-logsummary">{l.summary}</div>}
                <div className="dg-muted sm">{l.date || "—"}{l.dmId ? " · DM " + accName(l.dmId) : ""}{l.levelAfter ? " · level " + l.levelAfter : ""}{l.entryType !== "EXPENDITURE" && l.status === "SUBMITTED" ? <span className="dg-pendingtag inline"> pending DM approval</span> : ""}{l.entryType !== "EXPENDITURE" && l.status === "RETURNED" ? <span className="dg-pendingtag inline fix"> awaiting your correction</span> : ""}{l.entryType !== "EXPENDITURE" && l.status === "REJECTED" ? " · rejected" : ""}</div>
                {l.entryType === "DISPOSAL" && l.explanation && <div className="dg-lognote">“{l.explanation}”</div>}
                {l.entryType !== "EXPENDITURE" && l.itemsEarned && l.itemsEarned.length > 0 && (
                  <div className="dg-logline"><b>Items:</b> {l.itemsEarned.map((ie) => catName(ie.catalogId) + (ie.qty > 1 ? " ×" + ie.qty : "")).join(", ")}</div>
                )}
                {l.storyAwards && <div className="dg-logline"><b>Story award:</b> {l.storyAwards}</div>}
                {l.giftEarned && l.giftEarned.name && <div className="dg-logline"><b>Gift:</b> {l.giftEarned.name} ({l.giftEarned.kind}){l.giftEarned.realm ? " · bound to " + l.giftEarned.realm : ""}</div>}
                {l.effects && <div className="dg-logline"><b>Effects:</b> {l.effects}</div>}
                {l.note && <div className="dg-lognote">“{l.note}”</div>}
                {/* The writing prompt. Every bastion log entry carries mechanical information AND
                    flavour that doubles as a prompt — a standing rule of this project. The field was
                    being written by four different reducer cases and rendered by none of them, so
                    every prompt the app has ever produced went straight to the floor. */}
                {l.flavor && <div className="dg-bastflavor" style={{ marginTop: 4 }}>{l.flavor}</div>}
                {l.dmNote && <div className="dg-dmnote"><span className="dg-dmnote-h">Note from your DM</span>{l.dmNote}</div>}
                {l.logImage && <img src={getBlob(l.logImage)} alt="handwritten log" className="dg-logimg" />}
              </div>
              <div className="dg-logright">
                {l.entryType === "DISPOSAL" ? <div className="dg-logdt neg">released</div>
                  : l.entryType === "EXPENDITURE" ? <div className="dg-logdt neg">{[l.dtSpent ? "−" + l.dtSpent + " DT" : null, l.gpSpent ? "−" + l.gpSpent + " GP" : null].filter(Boolean).join(" · ") || "—"}</div>
                  : <div className="dg-logdt">{"+" + (l.dtEarned || 0) + " DT"}{l.gpEarned ? " · +" + l.gpEarned + " GP" : ""}</div>}
                {(l.status === "SUBMITTED" || l.status === "RETURNED") && l.entryType !== "EXPENDITURE" && l.entryType !== "DISPOSAL" && <button className="dg-pencil" title="Edit & resubmit" onClick={() => setModal({ kind: "log", charId: ch.id, editId: l.id })}>✎</button>}
              </div>
            </div>
          ))}
      </div>
      <div className="dg-row-actions">
        {(!ch.status || ch.status === "active")
          ? <button className="dg-btn" onClick={() => setModal({ kind: "log", charId: ch.id })}>+ Log a session</button>
          : <div className="dg-muted sm">{ch.status === "dead" ? ch.name + " has fallen — this log sheet is closed to new sessions." : ch.name + " is retired — this log sheet is closed to new sessions."}</div>}
        <button className="dg-btn ghost" onClick={close}>Close</button>
      </div>
    </>
  );
}

export function LogModal({ modal, state, dispatch, close, setModal }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const existing = modal.editId && state ? state.logEntries.find((e) => e.id === modal.editId) : null;
  const first = existing && existing.itemsEarned && existing.itemsEarned[0];
  const [advId, setAdvId] = useState(existing && existing.adventureId ? existing.adventureId : (modal.advId || ""));
  const [advQuery, setAdvQuery] = useState(existing ? existing.adventure : (modal.advId && ADV_BY_ID[modal.advId] ? ADV_BY_ID[modal.advId].label : ""));
  const [advOpen, setAdvOpen] = useState(false);
  const [date, setDate] = useState(existing && existing.date ? existing.date : (modal.date || new Date().toISOString().slice(0, 10)));
  const [dmId, setDmId] = useState(existing ? existing.dmId : (modal.dmId || ""));
  const [dmQuery, setDmQuery] = useState(existing && existing.dmId ? accName(existing.dmId) : (modal.dmId ? accName(modal.dmId) : ""));
  const [dmOpen, setDmOpen] = useState(false);
  const [levelAfter, setLevelAfter] = useState(existing && existing.levelAfter ? String(existing.levelAfter) : "");
  const [cat, setCat] = useState(first ? first.catalogId : "bagholding");
  const [cls, setCls] = useState(first ? first.proposedClass : "MAGIC_ITEM");
  const [qty, setQty] = useState(first ? first.qty || 1 : 1);
  const [dt, setDt] = useState(existing ? existing.dtEarned : 10);
  const [storyAwards, setStoryAwards] = useState(existing && existing.storyAwards ? existing.storyAwards : "");
  const [effects, setEffects] = useState(existing && existing.effects ? existing.effects : "");
  const [note, setNote] = useState(existing && existing.note ? existing.note : "");
  const [img, setImg] = useState(existing && existing.logImage ? existing.logImage : null);
  const onImg = (e) => { const f = (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files![0]; if (!f) return; const r = new FileReader(); r.onload = () => setImg(r.result); r.readAsDataURL(f); };

  const adv = advId ? ADV_BY_ID[advId] : null;
  const advSuggest = searchAdventures(advQuery);
  const dmAccts = ACCOUNTS.filter((a) => (state.roles && state.roles[a.id] || []).includes("dm"));
  const dmSuggest = dmAccts.filter((a) => a.name.toLowerCase().includes(dmQuery.toLowerCase()));
  const dupeEntry = state && advId ? state.logEntries.find((e) => e.charId === modal.charId && e.id !== modal.editId && e.entryType !== "EXPENDITURE" && e.adventureId === advId) : null;
  const chName = state && state.characters[modal.charId] ? state.characters[modal.charId].name : "This character";
  const canSubmit = !!advId && !!dmId && !dupeEntry;

  const submit = () => {
    if (!canSubmit) return;
    const entry = {
      charId: modal.charId, dmId, entryType: "EARNING", date,
      adventureId: advId, adventure: adv.label, summary: adv.summary, tier: adv.tier,
      levelAfter: levelAfter ? +levelAfter : undefined,
      itemsEarned: [{ catalogId: cat, proposedClass: cls, qty }], dtEarned: dt,
      storyAwards: storyAwards.trim(), effects: effects.trim(), note: note.trim(), logImage: putBlob(img),
      eventId: (existing && existing.eventId) || modal.eventId || undefined,
    };
    if (modal.editId) dispatch({ type: "EDIT_LOG", entryId: modal.editId, entry });
    else dispatch({ type: "SUBMIT_LOG", entry });
    if (setModal) setModal({ kind: "logsheet", charId: modal.charId }); else close();
  };

  return (
    <>
      <h3 className="dg-modal-h">{modal.editId ? "Edit session log" : "Log a session"}</h3>
      <p className="dg-muted sm">{modal.editId ? "Fix the entry and resubmit — it returns to your DM's queue for approval." : "Pick the adventure and DM from the lists so the entry is recorded consistently."}</p>

      <label className="dg-field"><span>Mission / adventure</span>
        <input type="text" value={advQuery} placeholder="Type a name, code, or 'mission 1'…"
          onChange={(e) => { setAdvQuery(e.target.value); setAdvId(""); setAdvOpen(true); }} onFocus={() => setAdvOpen(true)} />
      </label>
      {advOpen && advQuery && !advId && (
        <div className="dg-suggest">
          {advSuggest.length === 0 ? <div className="dg-suggest-empty">No matching adventure in the catalog.</div> :
            advSuggest.map((a) => (
              <button key={a.id} className="dg-suggest-item" onClick={() => { setAdvId(a.id); setAdvQuery(a.label); setAdvOpen(false); if (a.dt) setDt(a.dt); }}>
                <div className="dg-suggest-title">{a.label}</div>
                <div className="dg-suggest-sub">{tierLabel(a.tier)}{a.levels ? " · Levels " + a.levels : ""} · {a.summary}</div>
              </button>
            ))}
        </div>
      )}
      {adv && (
        <div className="dg-advcard">
          <div className="dg-advsummary">{adv.summary}</div>
          <div className="dg-advmeta">{tierLabel(adv.tier)}{adv.levels ? " · Levels " + adv.levels : ""}{adv.dt ? " · " + adv.dt + " DT" : ""} · pulled from the adventure catalog</div>
        </div>
      )}
      {dupeEntry && (
        <div className="dg-rulewarn">
          <div><b>Already logged.</b> {chName} already has a log entry for “{dupeEntry.adventure}.” A character may earn an adventure's rewards only once — replaying it earns no additional items, downtime, or awards.</div>
          <div className="dg-rulecite">D&amp;D Adventurers League Player's Guide — “At the Session's End” rewards &amp; “On Your Honor.”</div>
        </div>
      )}

      <label className="dg-field"><span>Who ran it (DM)</span>
        <input type="text" value={dmQuery} placeholder="Type the DM's name…"
          onChange={(e) => { setDmQuery(e.target.value); setDmId(""); setDmOpen(true); }} onFocus={() => setDmOpen(true)} />
      </label>
      {dmOpen && dmQuery && !dmId && (
        <div className="dg-suggest">
          {dmSuggest.length === 0 ? <div className="dg-suggest-empty">No matching Dungeon Master profile.</div> :
            dmSuggest.map((a) => (
              <button key={a.id} className="dg-suggest-item row" onClick={() => { setDmId(a.id); setDmQuery(a.name); setDmOpen(false); }}>
                <Avatar src={state.avatars && state.avatars[a.id]} size={28} /><span>{a.name}</span>
              </button>
            ))}
        </div>
      )}
      {dmId && <div className="dg-dmpicked"><Avatar src={state.avatars && state.avatars[dmId]} size={28} /><span>Assigned to {accName(dmId)}</span></div>}

      <div className="dg-field2">
        <label className="dg-field"><span>Date played</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="dg-field"><span>Level after</span>
          <input type="number" min="1" max="20" value={levelAfter} onChange={(e) => setLevelAfter(e.target.value)} placeholder="—" />
        </label>
      </div>
      <label className="dg-field"><span>Item earned</span>
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          {Object.values(CATALOG).filter((c) => c.rarity !== "unique").map((c) => <option key={c.id} value={c.id}>{c.name} · {RARITY[c.rarity].label}</option>)}
        </select>
      </label>
      <div className="dg-field2">
        <label className="dg-field"><span>Quantity</span>
          <input type="number" min="1" max="20" value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} />
        </label>
        <label className="dg-field"><span>Downtime earned</span>
          <input type="number" value={dt} onChange={(e) => setDt(+e.target.value)} />
        </label>
      </div>
      <label className="dg-field"><span>Classification (DM confirms)</span>
        <select value={cls} onChange={(e) => setCls(e.target.value)}>
          <option value="MAGIC_ITEM">Magic item (tradeable)</option>
          <option value="UNTRADEABLE">Untradeable (unique / character-created)</option><option value="STORY_ITEM">Story item (won't count toward carry limit)</option>
          <option value="EVENT_CERT">Event certificate</option><option value="STORY_ITEM">Story item</option>
        </select>
      </label>
      <label className="dg-field"><span>Story awards (optional)</span>
        <input type="text" value={storyAwards} onChange={(e) => setStoryAwards(e.target.value)} placeholder="e.g. The Gravedigger's Gratitude" />
      </label>
      <label className="dg-field"><span>Persistent effects, boons, blessings, charms, favors (optional)</span>
        <input type="text" value={effects} onChange={(e) => setEffects(e.target.value)} placeholder="e.g. Blessing of the Grave — advantage vs. undead until long rest" />
      </label>
      <label className="dg-field"><span>Session note (something memorable that happened)</span>
        <textarea className="dg-textarea" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="An interesting moment you want to remember…" />
      </label>
      <label className="dg-field"><span>Photo of your handwritten log (optional)</span>
        <input type="file" accept="image/*" onChange={onImg} />
      </label>
      {img && <img src={getBlob(img)} alt="handwritten log" className="dg-logimg" />}
      <div className="dg-row-actions">
        <button className="dg-btn" onClick={submit} disabled={!canSubmit}>{modal.editId ? "Resubmit" : "Submit for approval"}</button>
        <button className="dg-btn ghost" onClick={() => { if (setModal) setModal({ kind: "logsheet", charId: modal.charId }); else close(); }}>Cancel</button>
      </div>
      {!advId && <div className="dg-muted sm" style={{ marginTop: 6 }}>Select an adventure from the list to continue.</div>}
      {advId && !dmId && <div className="dg-muted sm" style={{ marginTop: 6 }}>Select the DM who ran it from the list.</div>}
    </>
  );
}

// ---------------------------------------------------------------------------
// Session-side modals: running an event, reviewing logs, DM flags, observer reports, mentor offers.
// ---------------------------------------------------------------------------

export function MentorOfferCard({ offer, state, accountId, dispatch }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  return (
    <div className="dg-pollcard mentor">
      <div className="dg-poll-h">🎓 Choose your shadow mentor</div>
      <div className="dg-muted sm" style={{ marginBottom: 6 }}>These DMs are willing to let you shadow a table at {storeName(state, offer.storeId)}. Pick one to accept — you'll be scheduled to observe their next table, and you'll become a provisional mentee.</div>
      <div className="dg-pollopts">
        {offer.options.map((dm) => <button key={dm} className="dg-btn sm" onClick={() => dispatch({ type: "PICK_MENTOR", offerId: offer.id, candidate: accountId, mentor: dm })}>Shadow {accName(dm)}</button>)}
      </div>
    </div>
  );
}

export function ObserverPrompt({ sess, accountId, setModal }) {
  const adv = ADV_BY_ID[sess.adventureId];
  return (
    <div className="dg-pollcard mentor">
      <div className="dg-poll-h">👁 Shadow reflection — {adv ? adv.label : "a table"}</div>
      <div className="dg-muted sm" style={{ marginBottom: 6 }}>After you shadow this table, file your reflection so your mentor can review it and decide whether you're ready to run your own.</div>
      <button className="dg-btn sm" onClick={() => setModal({ kind: "observerlog", sessionId: sess.id, candidate: accountId })}>File observer reflection</button>
    </div>
  );
}

// ---------------------- Modal ----------------------
export function EventManageModal({ modal, state, dispatch, accountId, close, setModal }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const ev = (state.events || []).find((e) => e.id === modal.eventId);
  const [sel, setSel] = useState<Record<string, any>>({});
  if (!ev) return (<><h3 className="dg-modal-h">Event not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  const tables = state.sessions.filter((x) => x.eventId === ev.id && x.status !== "cancelled" && !x.draft).sort((a, b) => (a.datetime < b.datetime ? -1 : 1));
  const storeDms = ACCOUNTS.filter((a) => (state.roles[a.id] || []).includes("dm") && a.id !== accountId && (ev.stores || []).some((st) => storesOf(state, a.id).includes(st)));
  const toggle = (id) => setSel({ ...sel, [id]: !sel[id] });
  const selectedIds = Object.keys(sel).filter((k) => sel[k]);
  return (
    <>
      <h3 className="dg-modal-h">{ev.name}</h3>
      <div className="dg-muted sm" style={{ marginBottom: 10 }}>{ev.date}{ev.price ? " · " + ev.price : ""} · {(ev.stores || []).map((st) => storeName(state, st)).join(", ")}</div>

      <div className="dg-insp-sec">Recruit DMs</div>
      <button className="dg-btn full" onClick={() => dispatch({ type: "RECRUIT_EVENT", eventId: ev.id, by: accountId })}>📣 Broadcast to all DMs at target stores</button>
      {storeDms.length > 0 && (
        <>
          <div className="dg-muted sm" style={{ margin: "8px 0 4px" }}>…or invite specific DMs:</div>
          {storeDms.map((d) => <label key={d.id} className="dg-check"><input type="checkbox" checked={!!sel[d.id]} onChange={() => toggle(d.id)} /><span>{d.name}</span></label>)}
          <button className="dg-btn ghost full" disabled={!selectedIds.length} onClick={() => { dispatch({ type: "RECRUIT_EVENT", eventId: ev.id, by: accountId, dmIds: selectedIds }); setSel({}); }}>Invite {selectedIds.length || ""} selected</button>
        </>
      )}

      <div className="dg-insp-sec">Tables ({tables.length})</div>
      {tables.map((t) => {
        const adv = ADV_BY_ID[t.adventureId];
        const dateStr = (t.datetime || "").slice(0, 10);
        const freeDms = ACCOUNTS.filter((a) => (state.roles[a.id] || []).includes("dm") && storesOf(state, a.id).includes(t.storeId) && !nightCommitment(state, a.id, dateStr));
        return (
          <div key={t.id} className="dg-card">
            <div className="dg-item-name">{adv ? adv.label : t.adventureId}</div>
            <div className="dg-muted sm">{new Date(t.datetime).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · {storeName(state, t.storeId)} · {t.signups.length}/{t.capacity} seats</div>
            {t.dmId
              ? <div className="dg-muted sm">DM: <b>{accName(t.dmId)}</b></div>
              : (freeDms.length
                  ? <label className="dg-field"><span>Assign a DM (free that night)</span>
                      <select defaultValue="" onChange={(e) => e.target.value && dispatch({ type: "ASSIGN_DM", sessionId: t.id, dmId: e.target.value })}>
                        <option value="">— open slot — assign or let a DM claim —</option>
                        {freeDms.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </label>
                  : <div className="dg-muted sm">Open slot — no DM free that night to assign; a DM must claim it.</div>)}
          </div>
        );
      })}
      <div className="dg-row-actions" style={{ marginTop: 12 }}>
        <button className="dg-btn ghost" onClick={close}>Close</button>
      </div>
    </>
  );
}

export function EscalationModal({ modal, state, dispatch, accountId, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const [concern, setConcern] = useState("");
  const dm = modal.dm;
  return (
    <>
      <h3 className="dg-modal-h">Raise a concern</h3>
      <p className="dg-muted sm">You played at <b>{accName(dm)}</b>'s table, so you can flag a concern about how it was run. This goes to them directly first, as a chance to self-correct — and quietly to the admin. Be specific and fair; the goal is a better table, not a reprimand.</p>
      <label className="dg-field"><span>What was the concern?</span><textarea rows={3} value={concern} onChange={(e) => setConcern(e.target.value)} placeholder="e.g. Ran 90 minutes over twice; a player was repeatedly talked over." /></label>
      <div className="dg-row-actions">
        <button className="dg-btn" disabled={!concern.trim()} onClick={() => { dispatch({ type: "CREATE_DM_FLAG", dm, by: accountId, concern: concern.trim() }); close(); }}>Send concern</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

export function MonitorReportModal({ modal, state, dispatch, accountId, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const se = state.sessions.find((x) => x.id === modal.sessionId);
  const dm = modal.flaggedDm;
  const concern = ((state.dmFlags || []).find((f) => f.dm === dm && f.status === "open" && f.kind === "escalation") || {}).concern;
  const [corrected, setCorrected] = useState<boolean | null>(null);
  const [concerns, setConcerns] = useState("");
  return (
    <>
      <h3 className="dg-modal-h">Quiet check-in report</h3>
      <p className="dg-muted sm">You sat in at <b>{accName(dm)}</b>'s table. This report goes <b>only to the admin</b> — {accName(dm)} won't see it or know you were checking in. Answer honestly; the aim is growth, not a gotcha.</p>
      {concern && <div className="dg-suggestbanner">The concern raised was: <b>{concern}</b></div>}
      <div className="dg-field"><span>Was that addressed?</span>
        <div className="dg-pollopts">
          <button className={"dg-btn sm" + (corrected === true ? "" : " ghost")} onClick={() => setCorrected(true)}>Yes, corrected</button>
          <button className={"dg-btn sm" + (corrected === false ? "" : " ghost")} onClick={() => setCorrected(false)}>No, still an issue</button>
        </div>
      </div>
      <label className="dg-field"><span>Any other concerns? (optional)</span><textarea rows={2} value={concerns} onChange={(e) => setConcerns(e.target.value)} placeholder="Anything else you noticed — or leave blank." /></label>
      <div className="dg-row-actions">
        <button className="dg-btn" disabled={corrected === null} onClick={() => { dispatch({ type: "MONITOR_REPORT", monitorId: accountId, sessionId: modal.sessionId, flaggedDm: dm, corrected, concerns }); close(); }}>Submit to admin</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

export function ObserverLogModal({ modal, state, dispatch, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const se = state.sessions.find((x) => x.id === modal.sessionId);
  const adv = se && ADV_BY_ID[se.adventureId] ? ADV_BY_ID[se.adventureId] : null;
  const [ans, setAns] = useState(["", "", "", ""]);
  const set = (i) => (e) => { const a = [...ans]; a[i] = e.target.value; setAns(a); };
  const canSubmit = ans.some((a) => a.trim());
  return (
    <>
      <h3 className="dg-modal-h">Observer reflection</h3>
      <div className="dg-muted sm" style={{ marginBottom: 8 }}>Shadowed {adv ? adv.label : "a table"}{se ? " · run by " + accName(se.dmId) : ""}. Set down your honest account of the table.</div>
      {OBS_QUESTIONS.map((q, i) => <label key={i} className="dg-field"><span>{q}</span><textarea rows={2} value={ans[i]} onChange={set(i)} /></label>)}
      <div className="dg-row-actions">
        <button className="dg-btn" disabled={!canSubmit} onClick={() => { dispatch({ type: "SUBMIT_OBSERVER_LOG", candidate: modal.candidate, sessionId: modal.sessionId, reflections: OBS_QUESTIONS.reduce((o, q, i) => { o[q] = ans[i]; return o; }, {}) }); close(); }}>Submit to mentor</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

export function MessageModal({ modal, state, dispatch, accountId, close, setTab }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const inTrade = itemsInOpenTrades(state);
  const myAvail = Object.values(state.items)
    .filter((it) => it.available && !it.escrow && !inTrade.has(it.id) && isTradeableClass(it.itemClass) && it.holder.type === "CHARACTER" && state.characters[it.holder.id] && state.characters[it.holder.id].ownerId === accountId)
    .map((it) => itemCat(it).name);
  const stock = modal.join
    ? `Hi — I'd love to sit at your ${modal.adv || "table"}${modal.when ? " on " + modal.when : ""}. Could you add me when you build the Warhorn table?`
    : modal.issue
    ? `Hi — I was reviewing ${modal.charName ? modal.charName + "'s" : "your"} "${modal.adventure || "session"}" log and there seems to be an issue with the entry. Could you take a look and resubmit? (The field that needs a fix: … )`
    : modal.offering
    ? `Hi — I have a ${modal.item} that ${modal.wanterChar || "your character"} has on their wish list, and I'm not currently using it. Would you like to work out a trade?`
    : `Hi — I'm interested in your ${modal.item}${modal.holder ? " that " + modal.holder + " holds" : ""}, though it isn't marked for trade. I'd love to work something out.` +
      (myAvail.length ? ` I currently have available: ${myAvail.join(", ")}. Would any of those interest you?` : " Would you consider a swap?");
  const [text, setText] = useState(stock);
  return (
    <>
      <h3 className="dg-modal-h">Message {accName(modal.to)}</h3>
      <p className="dg-muted sm">Edit this note or write your own. It starts a conversation you can continue under Messages.</p>
      <textarea className="dg-textarea" rows={5} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="dg-row-actions">
        <button className="dg-btn" onClick={() => { if (text.trim()) dispatch({ type: "SEND_MESSAGE", from: accountId, to: modal.to, text: text.trim(), fromCtx: modal.fromCtx || (modal.issue ? "dm" : "player"), toCtx: modal.toCtx || "player", aboutItem: modal.itemId || null }); if (modal.issue && modal.entryId) dispatch({ type: "RETURN_LOG", entryId: modal.entryId, by: accountId }); if (setTab) setTab("messages"); close(); }}>Send message</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

export function LogEntryModal({ modal, state, dispatch, accountId, close, setModal }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const l = state.logEntries.find((e) => e.id === modal.entryId);
  const acc = ACCOUNTS.find((a) => a.id === accountId);
  const isDM = acc && acc.kind === "dm";
  const [dmNote, setDmNote] = useState(l ? l.dmNote || "" : "");
  if (!l) return (<><h3 className="dg-modal-h">Entry not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  const ch = state.characters[l.charId];
  return (
    <>
      <h3 className="dg-modal-h">{l.adventure}</h3>
      <div className="dg-item-sub">{ch ? ch.name : ""} · {l.date || "—"}{l.dmId ? " · DM " + accName(l.dmId) : ""}{l.levelAfter ? " · level " + l.levelAfter : ""}{l.status === "SUBMITTED" ? " · pending" : l.status === "REJECTED" ? " · rejected" : ""}</div>
      {l.summary && <div className="dg-insp-desc">{l.summary}</div>}
      <div className="dg-insp-stats">
        {l.itemsEarned && l.itemsEarned.length > 0 && <StatRow k="Items" v={l.itemsEarned.map((ie) => catName(ie.catalogId) + (ie.qty > 1 ? " ×" + ie.qty : "")).join(", ")} />}
        <StatRow k="Downtime" v={"+" + (l.dtEarned || 0) + " DT"} />
        {l.storyAwards && <StatRow k="Story award" v={l.storyAwards} />}
        {l.giftEarned && l.giftEarned.name && <StatRow k="Supernatural gift" v={l.giftEarned.name + " (" + l.giftEarned.kind + ")" + (l.giftEarned.realm ? " · bound to " + l.giftEarned.realm : "")} />}
        {l.effects && <StatRow k="Effects" v={l.effects} />}
      </div>
      {l.note && <div className="dg-lognote">“{l.note}”</div>}
      {l.logImage && <img src={getBlob(l.logImage)} alt="handwritten log" className="dg-logimg" />}

      <div className="dg-insp-sec">Note from the DM</div>
      {isDM ? (
        <>
          <textarea className="dg-textarea" rows={3} value={dmNote} onChange={(e) => setDmNote(e.target.value)} placeholder="Leave the player a note about their session…" />
          <div className="dg-row-actions">
            <button className="dg-btn" onClick={() => dispatch({ type: "SET_DM_NOTE", entryId: l.id, note: dmNote.trim() })}>Save note</button>
            {l.status === "SUBMITTED" && (
              <>
                <button className="dg-btn" onClick={() => { dispatch({ type: "APPROVE_LOG", id: l.id, dmNote: dmNote.trim(), by: accountId }); close(); }}>Save &amp; approve</button>
                <button className="dg-btn ghost" onClick={() => { dispatch({ type: "REJECT_LOG", id: l.id, by: accountId }); close(); }}>Reject</button>
              </>
            )}
          </div>
          {ch && setModal && (
            <button className="dg-btn ghost full" onClick={() => setModal({ kind: "message", to: ch.ownerId, issue: true, adventure: l.adventure, charName: ch.name, entryId: l.id })}>✎ Flag an issue &amp; return for correction</button>
          )}
        </>
      ) : (
        l.dmNote ? <div className="dg-dmnote">{l.dmNote}</div> : <div className="dg-muted sm">No note from your DM yet.</div>
      )}
      <div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div>
    </>
  );
}

