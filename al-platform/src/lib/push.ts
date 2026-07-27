import { ADV_BY_ID } from "../data/adventures";
import { accName } from "./core";
import type { AppState } from "../types";

// ============================================================================
// PUSH REPORTS
//
// Neither tool my platform sits beside has a write API. D&D Beyond won't let anything push a
// change into a character sheet, and Warhorn won't let anything create or edit a table. So
// every change I record here gets re-typed by a human somewhere else.
//
// My push report is that re-typing, made mechanical: a checklist you work down with the other
// tool open beside you. I deliberately made it NOT a summary - it's an instruction list, in
// the order you'd do the work, with the target values spelled out so nobody has to compute a
// difference in their head.
//
// TWO KINDS, because the two audiences have nothing in common:
//   PLAYER     - what must change on their character sheet before they next sit at a table.
//   SCHEDULER  - what must change on Warhorn for their organisation's calendar.
// ============================================================================

// How long before a table a goat gets told their sheet is out of date.
export const PUSH_WARNING_MS = 60 * 60 * 1000;   // one hour

// The numeric tail of an id ("log412" -> 412).
// NOTE the comparison at the call sites is STRICTLY LESS THAN. The mark is nextId at the
// moment of acknowledgement, i.e. the id the NEXT thing will be given - so an id equal to the
// mark is the first change after it, not the last one before. Using <= here silently dropped
// the first change after every acknowledgement. Every id in this app is minted from nextId, so
// this is a reliable "was this created after that moment" test without adding timestamps.
export function idSeq(id: any): number {
  // Digit-tail parse, no regex: my push sweep calls this once per ledger row and item in its
  // raw prepass, and a compiled regex at 600k calls was a third of my sweep. Same contract:
  // value of the trailing digit run, else 0.
  const str = String(id || "");
  let i = str.length, end = i;
  while (i > 0) { const c = str.charCodeAt(i - 1); if (c < 48 || c > 57) break; i--; }
  if (i === end) return 0;
  let n = 0;
  for (let j = i; j < end; j++) n = n * 10 + (str.charCodeAt(j) - 48);
  return n;
}

// ---------------------------------------------------------------------------
// PLAYER REPORT
// ---------------------------------------------------------------------------
// Built from the mark: everything recorded since the player last said "I have updated my
// sheet". The mark is a nextId watermark, so it survives reloads and works identically for the
// logout report and the one-hour-before-a-table warning - they are the same report.
//
// Each character block carries BOTH:
//   the CHANGES  - what happened, one line per thing to do; and
//   the TARGET   - what the sheet should read when you are finished.
// The target matters more than the diff. Miss a report, or lose track halfway down one, and
// the target still gets the sheet right.
// Phase 1c: my optional third argument. PUSH_SWEEP pre-buckets my ledger and items by
// character in ONE raw pass and hands the buckets in, so N active accounts cost me O(state)
// total instead of O(N x state). Without buckets I scan like I always did — the logout report
// and the one-hour warning are unchanged callers producing unchanged output. One body, two
// feeders; the line-building logic can't drift on me because there is exactly one of it.
export function playerPushReport(state: AppState, accountId: string,
  buckets?: { logsByChar: Map<string, any[]>, itemsByChar: Map<string, any[]>, chars?: any[] }) {
  const mark = ((state as any).pushMarks || {})[accountId] || 0;
  const mine = buckets && buckets.chars
    ? buckets.chars
    : Object.values(state.characters || {}).filter((c: any) => c && c.ownerId === accountId);
  const blocks: any[] = [];

  mine.forEach((ch: any) => {
    const lines: any[] = [];

    // Resources NET OUT. Spending 10 downtime and earning 10 back is not two instructions, it
    // is no instruction - and a list that says "-10" then "+10" makes the reader do arithmetic
    // to discover that. One line per resource, signed, with the individual movements kept
    // underneath as the audit trail for anyone who wants to check the figure.
    let gp = 0, dt = 0;
    const gpWhy: string[] = [], dtWhy: string[] = [];
    let levelFrom: number | null = null, levelTo: number | null = null;

    (buckets ? (buckets.logsByChar.get(ch.id) || []) : (state.logEntries || [])).forEach((l: any) => {
      if (!l || l.charId !== ch.id || idSeq(l.id) < mark) return;
      if (l.status === "REJECTED") return;                       // never happened, nothing to copy
      const adv = ADV_BY_ID[l.adventureId] ? ADV_BY_ID[l.adventureId].label : l.adventureId;

      if (l.entryType === "LEVEL") {
        if (levelFrom === null) levelFrom = l.levelFrom;
        levelTo = l.levelTo;
        return;
      }
      if (l.gpEarned) { gp += l.gpEarned; gpWhy.push("+" + l.gpEarned + (adv ? " " + adv : "")); }
      if (l.dtEarned) { dt += l.dtEarned; dtWhy.push("+" + l.dtEarned + (adv ? " " + adv : "")); }
      if (l.gpSpent)  { gp -= l.gpSpent;  gpWhy.push("-" + l.gpSpent + (l.spentOn ? " " + l.spentOn : "")); }
      if (l.dtSpent)  { dt -= l.dtSpent;  dtWhy.push("-" + l.dtSpent + (l.spentOn ? " " + l.spentOn : "")); }

      // Items are discrete - they cannot be netted, so each one is its own instruction.
      if (l.entryType === "DISPOSAL") {
        lines.push({ kind: "remove", pending: l.status !== "APPROVED",
          text: "Remove " + (l.spentOn || "an item"), detail: "released from play" });
      }
    });

    // items that arrived since the mark
    (buckets ? (buckets.itemsByChar.get(ch.id) || []) : Object.values(state.items || {})).forEach((it: any) => {
      if (!it || idSeq(it.id) < mark) return;
      const held = it.holder && it.holder.type === "CHARACTER" && it.holder.id === ch.id;
      if (!held) return;
      lines.push({ kind: "add", pending: it.provenance && it.provenance.state !== "VERIFIED",
        text: "Add " + (it.quantity > 1 ? it.quantity + "x " : "") + (it.name || "an item"),
        detail: [it.rarity, it.attune ? "requires attunement" : "",
                 it.source && it.page ? it.source + " p." + it.page : it.source].filter(Boolean).join(" - ") });
    });

    // resource lines go FIRST - they are the ones people get wrong
    const resource: any[] = [];
    if (levelTo !== null && levelTo !== levelFrom)
      resource.push({ kind: "level", text: "Level " + levelFrom + " to " + levelTo,
        detail: "take the fixed hit points for your class, plus modifiers [ALPG-319]" });
    if (gp) resource.push({ kind: "gold", text: "Change gold by " + (gp > 0 ? "+" : "") + gp,
      detail: gpWhy.join(", ") });
    if (dt) resource.push({ kind: "downtime", text: "Change downtime by " + (dt > 0 ? "+" : "") + dt + " day" + (Math.abs(dt) === 1 ? "" : "s"),
      detail: dtWhy.join(", ") });

    const all = resource.concat(lines);
    if (!all.length) return;
    blocks.push({
      char: ch,
      ddb: ch.ddb || "",
      lines: all,
      net: { gp, dt, levelFrom, levelTo },
      target: { gp: ch.gp || 0, dt: ch.dt || 0, level: ch.level || 1, lifestyle: ch.lifestyle || "" },
      pending: all.filter((l) => l.pending).length,
    });
  });

  return { accountId, mark, blocks, count: blocks.reduce((n, b) => n + b.lines.length, 0) };
}

// The player's next table, if it is close enough to matter. Used for the one-hour warning and
// to tell them WHY the report is being put in front of them.
export function nextTableFor(state: AppState, accountId: string, now: number) {
  let best: any = null;
  (state.sessions || []).forEach((se: any) => {
    if (!se || se.status === "cancelled" || se.status === "completed") return;
    if (!(se.signups || []).some((u: any) => u && u.accountId === accountId)) return;
    const at = Date.parse(se.datetime || "");
    if (!at || at < now) return;
    if (!best || at < best.at) best = { session: se, at };
  });
  return best;
}

// ---------------------------------------------------------------------------
// SCHEDULER REPORT
// ---------------------------------------------------------------------------
// What must be typed into Warhorn for this organisation. The queue already tracked tables to
// create and players to add; a schedule also CHANGES and CANCELS, and those were invisible -
// a table whose time moved after it was pushed looked done.
//
// So a push now records a SIGNATURE of what was pushed. If the table no longer matches its
// signature, it comes back as an update with the specific fields that moved.
export function tableSignature(se: any) {
  return [se.datetime || "", se.capacity == null ? "" : se.capacity, se.dmId || "",
          se.adventureId || "", se.location || "", se.table == null ? "" : se.table].join("|");
}

export function schedulerPushReport(state: AppState, orgId: string) {
  const pushed = (state as any).warhornPushed || {};
  const events = (state.events || []).filter((e: any) => e && e.orgId === orgId);
  const out: any[] = [];

  events.forEach((ev: any) => {
    const tables = (state.sessions || []).filter((se: any) => se && se.eventId === ev.id);
    tables.forEach((se: any) => {
      const tKey = "tbl:" + se.id;
      const advLabel = ADV_BY_ID[se.adventureId] ? ADV_BY_ID[se.adventureId].label : se.adventureId;
      const was = pushed[tKey];

      // cancelled after it was pushed - somebody has to go and take it down
      if (se.status === "cancelled") {
        if (was) out.push({ key: "cxl:" + se.id, kind: "cancel", event: ev, session: se,
          label: "Cancel table - " + advLabel, detail: se.datetime || "" });
        return;
      }
      if (!was) {
        out.push({ key: tKey, kind: "table", event: ev, session: se, sig: tableSignature(se),
          label: "Create table - " + advLabel + (se.dmId ? " - DM " + accName(se.dmId) : " - needs a DM"),
          detail: [se.datetime, se.location, se.capacity != null ? se.capacity + " seats" : ""].filter(Boolean).join(" - ") });
      } else if (typeof was === "string" && was !== tableSignature(se)) {
        // pushed once, changed since. Name the fields that moved so nobody has to diff by eye.
        const old = was.split("|"), now = tableSignature(se).split("|");
        const FIELDS = ["time", "seats", "DM", "adventure", "location", "table number"];
        const moved = FIELDS.filter((_, i) => old[i] !== now[i]);
        out.push({ key: tKey, kind: "edit", event: ev, session: se, sig: tableSignature(se),
          label: "Update table - " + advLabel + " (" + (moved.join(", ") || "changed") + ")",
          detail: [se.datetime, se.location, se.capacity != null ? se.capacity + " seats" : "",
                   se.dmId ? "DM " + accName(se.dmId) : "no DM"].filter(Boolean).join(" - ") });
      }

      (se.signups || []).forEach((u: any) => {
        const sKey = "sig:" + se.id + ":" + u.accountId;
        if (pushed[sKey]) return;
        const chName = u.charId && state.characters[u.charId] ? state.characters[u.charId].name : "";
        out.push({ key: sKey, kind: "signup", event: ev, session: se, accountId: u.accountId,
          label: "Add " + accName(u.accountId) + (chName ? " (" + chName + ")" : "") + " - " + advLabel,
          detail: se.datetime || "" });
      });

      // somebody pushed as a player who has since dropped
      Object.keys(pushed).forEach((k) => {
        if (!k.startsWith("sig:" + se.id + ":")) return;
        const acct = k.slice(("sig:" + se.id + ":").length);
        if ((se.signups || []).some((u: any) => u && u.accountId === acct)) return;
        out.push({ key: "drop:" + se.id + ":" + acct, kind: "drop", event: ev, session: se, accountId: acct,
          label: "Remove " + accName(acct) + " - " + advLabel, detail: "no longer signed up" });
      });
    });
  });
  return out;
}
