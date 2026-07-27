import { todayLocal, rawEntries } from "../lib/util";
import { PUSH_WARNING_MS, nextTableFor, playerPushReport, idSeq } from "../lib/push";
import { isAdmin } from "../lib/rules";
import { awayBastionTurn, seizeOpportunity, stageBastionAid } from "../bastion/engine";
import { CALL_KINDS, MENTOR_NOT_READY_LIMIT, OPPORTUNITY_COST_DMG, OVERSIGHT_FLAG_LIMIT, TABLE_COUNT, canPublishSession, distinctFlaggers, dmSeniority, hasPlayedUnder, isALSystem, isModuleAuthor, matchAccountByPerson, matchStoreByWarhorn, maybeRecruitMonitor, nightCommitment, normName, notifyAdvWishlisters, openFlagsFor, orgPrescheduleById, reverseTrade, searchAdventures, storeName, storeOf, tablesOn, warhornQueueFor } from "../lib/play";
import { ACCOUNTS, accName, catName, itemCat, itemClassOf, mkItem, verified } from "../lib/core";
import { ADV_BY_ID } from "../data/adventures";
import { BASTION_PREREQS } from "../data/bastion";
import { expireBastionCharms, expireCharmItemsFor, findOrCreateThread } from "../bastion/engine";
import { isDMRole, isDeactivated, isSuspended, mayActOnChar, provOf, satisfyWishlist, sharesStore, storesOf } from "../lib/rules";
// ============================================================================
// PLAY REDUCER ACTIONS - sessions and the DM pipeline.
// Scheduling, signups, attendance, session completion, logsheets and their review,
// DM certification, provisional DMs and their mentors, Warhorn import.
// ============================================================================

import type { AppState } from "../types";

// The action names I handle in this module, declared EXPLICITLY.
//
// I used to discover these at runtime by calling toString() on my reducer and
// regex-scanning for `case "X":`. Works in development, DIES in production: the
// minifier rewrites the labels as `case`X`:`, my scan finds nothing, and my
// unknown-action guard switches itself off - in the shipped bundle only. I will
// not treat Function.prototype.toString() as a contract again.
//
// harness/check_actions.cjs re-reads this file and fails me if this list drifts
// from the actual case labels, so the explicitness can't rot.
export const PLAY_ACTION_NAMES: readonly string[] = [
  "ACCEPT_MENTOR_TABLE", "ADD_MODULE_CREDIT", "ADD_SESSION_TO_LOG", "ANSWER_CALL",
  "APPROVE_CERTIFICATION", "APPROVE_DM", "APPROVE_LOG", "APPROVE_PROVISIONAL",
  "ASSIGN_DM", "CANCEL_SESSION", "CANCEL_SIGNUP", "CHECK_IN",
  "CLAIM_TABLE", "COMPLETE_SESSION", "CREATE_DM_FLAG", "CREATE_EVENT",
  "CREATE_SESSION", "DECLARE_PREREQ", "DECLINE_MENTOR_TABLE", "DEMOTE_DM",
  "DENY_DM", "DISMISS_PROV_REQUEST", "EDIT_LOG", "EDIT_SESSION",
  "FORWARD_MENTORS", "IMPORT_WARHORN", "INVALIDATE", "LOG_DM_SESSION",
  "ACCEPT_LEVEL", "ACK_PUSH_REPORT", "DECLINE_LEVEL", "MARK_WARHORN_ALL", "MARK_WARHORN_PUSHED", "PUSH_SWEEP", "MONITOR_REPORT", "PICK_MENTOR",
  "PUBLISH_TABLE", "RECONCILE_WARHORN", "RECRUIT_EVENT", "REFUSE_CALL",
  "REJECT_LOG", "RELEASE_TABLE", "REMOVE_MODULE_CREDIT", "REQUEST_DM",
  "RETURN_LOG", "REVIEW_OBSERVER", "REVIEW_PROV_LOG", "SET_DM_NOTE",
  "SET_MENTOR", "SET_PROVISIONAL", "SET_WARHORN_SLUG", "SIGNUP_SESSION",
  "START_MENTOR_SEARCH", "SUBMIT_LOG", "SUBMIT_OBSERVER_LOG", "SUBMIT_PROV_LOG",
  "SUGGEST_ADVENTURE", "TOGGLE_ATTENDANCE", "TOGGLE_MODULE_AUTHOR",
];

// I apply a completed table's award to the character here: downtime, gold, items with their
// provenance, any Supernatural Gift, plus the EARNING log line. I extracted this so
// COMPLETE_SESSION (automatic, at the DM's confirmation) and ADD_SESSION_TO_LOG (my older
// manual path, kept for anything completed before the change) cannot drift apart. A rule
// written twice is a rule I get wrong once.
function applySessionToChar(s: any, ss: any, u: any, dropNotice?: (p: any) => void) {
  if (!u || u.logged || !u.attended || !u.charId) return false;
  const ch = s.characters[u.charId];
  if (!ch || !ss.completion) return false;
      const comp = ss.completion;
  const ev = ss.eventId ? (s.events || []).find((e) => e.id === ss.eventId) : null;
  const advn = ADV_BY_ID[ss.adventureId] ? ADV_BY_ID[ss.adventureId].label : "Session";
  ch.dt += comp.dtAwarded || 0;
  ch.gp = (ch.gp || 0) + (comp.gpAwarded || 0);
  (comp.itemsAwarded || []).forEach((ie) => {
    const count = ie.qty || 1;
    for (let q = 0; q < count; q++) {
      const nid = "it_" + s.nextId++;
      s.items[nid] = mkItem(nid, ie.catalogId, ie.proposedClass || "MAGIC_ITEM", ch.campaign, verified("DM_VOUCH", accName(ss.dmId)), { type: "CHARACTER", id: ch.id });
      const note = ev ? "Earned at " + ev.name + ", vouched by " + accName(ss.dmId) : "Earned in play, vouched by " + accName(ss.dmId);
      s.items[nid].origin = { holder: ch.name, adventure: advn, note, dmId: ss.dmId, event: ev ? { id: ev.id, name: ev.name, date: ev.date } : undefined };
      s.items[nid].lineage = [{ holder: ch.name, note, adventure: advn }];
      satisfyWishlist(s, ch.id, s.items[nid]);
    }
  });
  // DM already confirmed the treasure at completion, so this entry is pre-approved (DM-vouched)
  if (comp.giftAwarded && comp.giftAwarded.name) {   // a Supernatural Gift / Boon awarded this session
    if (!Array.isArray(ch.gifts)) ch.gifts = [];
    const ga = comp.giftAwarded;
    const gk = ["blessing", "boon", "charm"].includes(ga.kind) ? ga.kind : "charm";
    ch.gifts.push({ id: "gift" + s.nextId++, kind: gk, name: ga.name, source: ga.source || advn, desc: ga.desc || "", realm: ga.realm || "", epicBoon: gk === "boon" && !!ga.epicBoon, carried: false });
  }
  s.logEntries.push({ id: "log" + s.nextId++, charId: u.charId, dmId: ss.dmId, entryType: "EARNING", status: "APPROVED", adventureId: ss.adventureId, adventure: advn, tier: ADV_BY_ID[ss.adventureId] ? ADV_BY_ID[ss.adventureId].tier : undefined, date: comp.completedAt, itemsEarned: comp.itemsAwarded || [], dtEarned: comp.dtAwarded || 0, gpEarned: comp.gpAwarded || 0, storyAwards: comp.storyAwards || "", giftEarned: comp.giftAwarded && comp.giftAwarded.name ? comp.giftAwarded : null, eventId: ss.eventId || undefined, note: "Added from a completed session — treasure confirmed by " + accName(ss.dmId) });
  u.logged = true;
  const updates: any[] = [];   // remind the player to reconcile their actual sheet — the app can't write to D&D Beyond
  if (comp.dtAwarded) updates.push("+" + comp.dtAwarded + " downtime days");
  if (comp.gpAwarded) updates.push("+" + comp.gpAwarded + " gp");
  (comp.itemsAwarded || []).forEach((ie) => updates.push(catName(ie.catalogId) + (ie.qty > 1 ? " ×" + ie.qty : "")));
  if (comp.giftAwarded && comp.giftAwarded.name) updates.push(comp.giftAwarded.name + " (" + comp.giftAwarded.kind + (comp.giftAwarded.epicBoon ? ", Epic Boon Feat" : "") + ")");
  if (updates.length) s.notices.push({ id: "n" + s.nextId++, type: "sheetsync", ctx: "player", accountId: ch.ownerId, char: ch.name, adventure: advn, updates });
  if (dropNotice) dropNotice((n) => n.type === "sessioncomplete" && n.sessionId === ss.id && n.accountId === u.accountId);   // rewards added → clear the prompt
  return true;
}

export function playActions(s: any, action: any, dropNotice: (p: any) => void): AppState | undefined {
  switch (action.type) {
    case "ANSWER_CALL": {
      // The one door for every call the DMG puts a decision in. Bram's summons keeps REFUSE_CALL —
      // a summons is refused, not answered.
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion || !ch.bastion.pendingCall) return s;
      if (ch.bastion.happening) return s;                                     // one thing at a time
      const call = ch.bastion.pendingCall;
      if (!CALL_KINDS.includes(call.kind)) return s;                          // whitelist
      const t = (ch.bastion.turns || []).find((x) => x.n === call.turnN)
             || { n: call.turnN, date: todayLocal(), benefits: [] as any[], prompt: null };
      if (call.kind === "festival") {
        if (action.yes === false) {                                           // DMG: "you don't pay the money and nothing else happens"
          t.benefits.push("Extraordinary Opportunity — declined. It went elsewhere.");
          if (!t.prompt) t.prompt = "It went elsewhere. It always does. " + ch.name + " has a reason and has not said it out loud.";
        } else {
          const price = call.cost != null ? call.cost : OPPORTUNITY_COST_DMG;
          if ((ch.gp || 0) < price) return s;                                  // you cannot seize what you cannot pay for
          seizeOpportunity(s, ch, t, call.what, price);
        }
      } else if (call.kind === "aid") {
        if (!(ch.bastion.defenders || []).length) return s;
        stageBastionAid(s, ch, t, parseInt(action.send, 10) || 1);            // they ride out with the number you chose
      } else if (call.kind === "summons") {
        // THE THIRD DOOR. A retired hero can send their people in their stead. Answer it
        // (UNRETIRE_CHARACTER) and you go back to play; refuse it (REFUSE_CALL) and you don't;
        // this is the one in between, and it's the one an old soldier with a keep full of people
        // actually takes. He doesn't go. He doesn't pretend he didn't hear. He sends Halin and
        // Pell. I built this door because my goats kept asking for it.
        //
        // It reuses the Request for Aid machinery whole — the DMG's own arithmetic, one d6 per
        // defender sent, and the same road home told the same way. The rider asked for help; help is
        // what gets sent. What differs is only who is standing at the gate watching them go.
        const roster = ch.bastion.defenders || [];
        if (!roster.length) return s;                                         // nobody to send
        if (ch.status !== "retired") return s;                                // "in his stead" needs a stead
        // You must SAY how many. A caller that says nothing about sending anyone sends no one:
        // my "parseInt(undefined) || 1" quietly dispatched Halin Ord to his possible death on an
        // ANSWER_CALL that never mentioned him. Future me: never guess a number that costs a life.
        const asked = parseInt(action.send, 10);
        if (!Number.isFinite(asked)) return s;
        const n = Math.max(1, Math.min(asked, roster.length));
        stageBastionAid(s, ch, t, n);
        if (!Array.isArray(ch.retireTale)) ch.retireTale = [];
        ch.retireTale.push({ id: "tale" + s.nextId++, date: t.date, seed: (call.label || "").trim(),
          text: ch.name + " did not go. " + (n === 1 ? roster[0].name + " went" : n + " of them went")
              + " instead, and " + ch.name + " stood at the gate and watched them down the road, and stayed standing there a while after." });
      } else return s;
      ch.bastion.pendingCall = null;
      return s;
    }
    case "REFUSE_CALL": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || ch.status !== "retired" || !ch.bastion || !ch.bastion.pendingCall) return s;
      const call = (ch.bastion.pendingCall.label || "A call to arms reached the keep.").trim();
      ch.bastion.pendingCall = null;   // the summons is answered — with a refusal, and the notice clears
      // ↑ pendingCALL, not pendingEvent. I had these as the same field, and a summons is not an
      //   event: resolveBastionEvent consumed whatever sat in pendingEvent as the week's roll, so
      //   ONE Bastion turn ate Old Bram's call to arms and REFUSE_CALL found nothing to refuse.
      //   One field, two meanings, and I'd seeded the collision into my own demo. A summons waits
      //   for an answer; an
      //   event happens to you. They are not the same thing and no longer share a name.
      if (!Array.isArray(ch.retireTale)) ch.retireTale = [];
      ch.retireTale.push({ id: "tale" + s.nextId++, date: todayLocal(), seed: call, text: ch.name + " read the call, and set it aside. That road is behind them now — the keep is home." });
      return s;
    }
    case "TOGGLE_MODULE_AUTHOR": {
      if (action.by !== action.accountId) return s;                 // self-designation only
      if (!isDMRole(s, action.accountId)) return s;                 // module author is a DM-only sub-designation
      if (!s.moduleAuthors) s.moduleAuthors = {};
      if (s.moduleAuthors[action.accountId]) delete s.moduleAuthors[action.accountId];
      else s.moduleAuthors[action.accountId] = true;
      return s;
    }
    case "ADD_MODULE_CREDIT": {
      const ch = s.characters[action.charId];
      if (!ch || !isModuleAuthor(s, action.by)) return s;           // only a module author records a credit
      if (!ch.licensed) return s;                                   // and only against a currently-licensed asset
      if (!(action.module || "").trim()) return s;
      if (!Array.isArray(ch.credits)) ch.credits = [];
      if (ch.credits.some((c) => c.module === action.module.trim() && c.author === action.by)) return s;   // this author already credited this module — no duplicate
      ch.credits.push({ id: "cr" + s.nextId++, module: action.module.trim(), author: action.by, date: todayLocal() });
      s.notices.push({ id: "n" + s.nextId++, type: "credited", ctx: "player", accountId: ch.ownerId, who: ch.name, module: action.module.trim(), author: action.by, assetType: (ch.status === "dead" ? "keep" : "hero") });
      return s;
    }
    case "REMOVE_MODULE_CREDIT": {
      const ch = s.characters[action.charId];
      if (!ch || !Array.isArray(ch.credits)) return s;
      const cr = ch.credits.find((c) => c.id === action.creditId);
      if (!cr || cr.author !== action.by) return s;                 // an author may retract only their own credit (the CC grant to a real use stays irrevocable)
      ch.credits = ch.credits.filter((c) => c.id !== action.creditId);
      return s;
    }
    case "SUBMIT_LOG": {
      s.logEntries.push({ id: "log" + s.nextId++, status: "SUBMITTED", ...action.entry });
      return s;
    }
    case "DECLARE_PREREQ": {
      // The goat says what their character can do; the DM spot-checks it. Same contract as levels, items
      // and gifts — D&D Beyond holds the sheet, the Exchange holds the organized-play layer. The app
      // does not guess from `cls`, because the DMG gates on FEATURES: an Eldritch Knight is a Fighter
      // who can use an Arcane Focus, and a Bard has Expertise. Class would refuse both, wrongly.
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by) return s;
      const pr = BASTION_PREREQS[action.prereq];
      if (!pr) return s;                                                       // whitelist: the book's five or nothing
      if (!Array.isArray(ch.qualifies)) ch.qualifies = [];
      const had = ch.qualifies.includes(pr.id);
      if (action.on === false) ch.qualifies = ch.qualifies.filter((x) => x !== pr.id);
      else if (!had) ch.qualifies.push(pr.id);
      else return s;                                                           // no change, no log
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED",
        date: todayLocal(), dtSpent: 0, gpSpent: 0,
        spentOn: ch.name + (action.on === false ? " no longer claims: " : " claims: ") + pr.text,
        flavor: "A claim about the sheet, recorded here so a DM can check it. The Exchange does not hold your character — D\u0026D Beyond does — so this is your word, in writing, about what " + ch.name + " can do. It gates which rooms this bastion may have." });
      return s;
    }
    case "LOG_DM_SESSION": {
      if (!mayActOnChar(s, action.charId, action.by)) return s;   // only the owner (or an admin) may touch a character
      const ch = s.characters[action.charId];
      if (!ch) return s;
      // one earning per adventure per character (play or DM reward)
      const dupe = s.logEntries.some((l) => l.charId === action.charId && l.adventureId === action.adventureId && l.entryType !== "EXPENDITURE" && l.status !== "REJECTED");
      if (dupe) return s;
      const dm = action.dmId;
      const dt = action.dtEarned != null ? action.dtEarned : 10;
      ch.dt += dt;
      const ev = action.eventId ? (s.events || []).find((e) => e.id === action.eventId) : null;
      (action.itemsEarned || []).forEach((ie) => {
        const cat = itemCat(ie);
        const count = ie.qty || 1;
        for (let q = 0; q < count; q++) {
          const nid = "it_" + s.nextId++;
          s.items[nid] = mkItem(nid, ie.catalogId, itemClassOf(ie.catalogId, ie.proposedClass), ch.campaign, verified("DM_VOUCH", accName(dm)), { type: "CHARACTER", id: ch.id });
          const advn = ADV_BY_ID[action.adventureId] ? ADV_BY_ID[action.adventureId].label : (cat.adventure || "DM reward");
          const note = ev ? "DM reward — ran " + advn + " at " + ev.name : "DM reward — ran " + advn;
          s.items[nid].origin = { holder: ch.name, adventure: advn, note, dmId: dm, event: ev ? { id: ev.id, name: ev.name, date: ev.date } : undefined };
          s.items[nid].lineage = [{ holder: ch.name, note, adventure: advn }];
          satisfyWishlist(s, ch.id, s.items[nid]);
        }
      });
      s.logEntries.push({ id: "log" + s.nextId++, charId: action.charId, dmId: dm, entryType: "DM_REWARD", status: "APPROVED", adventureId: action.adventureId, adventure: action.adventure, summary: action.summary || "", tier: action.tier, date: action.date, itemsEarned: action.itemsEarned || [], dtEarned: dt, eventId: action.eventId || undefined, note: "DM reward — ran this session (self-certified)" });
      return s;
    }
    case "APPROVE_LOG": {
      const le = s.logEntries.find((l) => l.id === action.id);
      if (!le) return s;
      if (le.status === "APPROVED") return s;   // idempotent: already sealed — never re-credit DT / re-mint items
      if (action.by !== le.dmId && !isAdmin(s, action.by)) return s;   // only the log's DM (or an admin) may approve
      dropNotice((n) => (n.type === "disposalreq" || n.type === "resubmit") && n.ref === le.id);   // alert cleared by review
      if (action.dmNote !== undefined) le.dmNote = action.dmNote;
      le.status = "APPROVED";
      if (le.entryType === "DISPOSAL") {
        // the disposal is vouched → the item leaves play, recorded on the log
        s.trades = s.trades.filter((t) => !(t.status === "PROPOSED" && (t.a.itemId === le.itemId || t.b.itemId === le.itemId)));
        if (s.listings) s.listings = s.listings.filter((l) => l.itemId !== le.itemId);
        delete s.items[le.itemId];
        const ch0 = s.characters[le.charId];
        s.notices.push({ id: "n" + s.nextId++, type: "disposalok", ctx: "player", accountId: ch0 ? ch0.ownerId : null, item: le.itemName, by: accName(le.dmId) });
        return s;
      }
      const ch = s.characters[le.charId];
      ch.dt += le.dtEarned;
      const evL = le.eventId ? (s.events || []).find((e) => e.id === le.eventId) : null;
      le.itemsEarned.forEach((ie) => {
        const cat = itemCat(ie);
        const count = ie.qty || 1;
        for (let q = 0; q < count; q++) {
          const nid = "it_" + s.nextId++;
          s.items[nid] = mkItem(nid, ie.catalogId, itemClassOf(ie.catalogId, ie.proposedClass), ch.campaign,
            verified("DM_VOUCH", accName(le.dmId)), { type: "CHARACTER", id: ch.id });
          const adventure = cat.adventure || "Session log";
          const note = evL ? "Earned at " + evL.name + ", vouched by " + accName(le.dmId) : "Earned in play, vouched by " + accName(le.dmId);
          s.items[nid].origin = { holder: ch.name, adventure, note, dmId: le.dmId, event: evL ? { id: evL.id, name: evL.name, date: evL.date } : undefined };
          s.items[nid].lineage = [{ holder: ch.name, note, adventure }];
          satisfyWishlist(s, ch.id, s.items[nid]);
        }
      });
      return s;
    }
    case "SET_DM_NOTE": {
      const le = s.logEntries.find((l) => l.id === action.entryId);
      if (le) le.dmNote = action.note;
      return s;
    }
    case "EDIT_LOG": {
      const le = s.logEntries.find((l) => l.id === action.entryId);
      if (le) {
        const wasReturned = le.status === "RETURNED";
        Object.assign(le, action.entry);
        le.status = "SUBMITTED";
        if (wasReturned && le.dmId) {
          s.notices.push({ id: "n" + s.nextId++, type: "resubmit", ctx: "dm", accountId: le.dmId, char: s.characters[le.charId] ? s.characters[le.charId].name : "A character", adventure: le.adventure, ref: le.id });
        }
      }
      return s;
    }
    case "RETURN_LOG": {
      const le = s.logEntries.find((l) => l.id === action.entryId);
      if (le && action.by !== le.dmId && !isAdmin(s, action.by)) return s;   // only the log's DM (or an admin) may return
      if (le) { le.status = "RETURNED"; if (le.entryType === "DISPOSAL" && s.items[le.itemId]) delete s.items[le.itemId].pendingDisposal; dropNotice((n) => (n.type === "disposalreq" || n.type === "resubmit") && n.ref === le.id); }
      return s;
    }
    case "REJECT_LOG": {
      const le = s.logEntries.find((l) => l.id === action.id);
      if (le && action.by !== le.dmId && !isAdmin(s, action.by)) return s;   // only the log's DM (or an admin) may reject
      if (le) { le.status = "REJECTED"; if (le.entryType === "DISPOSAL" && s.items[le.itemId]) delete s.items[le.itemId].pendingDisposal; dropNotice((n) => (n.type === "disposalreq" || n.type === "resubmit") && n.ref === le.id); }
      return s;
    }
    case "INVALIDATE": {
      if (!isAdmin(s, action.by)) return s;   // moderation is admin-only
      // Total unwind. I reverse every trade this item touched, restore holders and downtime,
      // recreate anything destroyed along the way, erase the item, then tell everyone affected.
      // Future me: the order matters here — read it before you touch it.
      const bad = s.items[action.itemId];
      if (!bad) return s;
      const reviewable = bad.provenance.state === "UNVERIFIED" || (bad.review && bad.review.flagged);
      if (!reviewable) return s;                                               // a verified, un-flagged item can never be invalidated

      const affected: Record<string, any> = {};                                // accountId -> what this did to them
      s.trades
        .filter((t) => t.status === "SETTLED" && (t.snapshot.aItem === action.itemId || t.snapshot.bItem === action.itemId))
        .reverse()                                                             // newest first — unwind in reverse order
        .forEach((tr) => reverseTrade(s, tr, action.itemId, affected));

      const badName = catName(bad.catalogId);
      delete s.items[action.itemId];                                           // the invalid instance ceases to exist

      Object.entries(affected).forEach(([accId, p]) => {
        s.notices.push({
          id: "n" + s.nextId++, type: "invalidate", ctx: "player", accountId: accId,
          reason: `"${badName}" was found invalid and erased`,
          items: [...new Set(p.items)], recreated: [...new Set(p.recreated)], dt: p.dt, trades: [...new Set(p.trades)],
        });
      });
      return s;
    }
    case "CREATE_SESSION": {
      const dateStr = (action.datetime || "").slice(0, 10);
      const occupied = tablesOn(s, dateStr).map((x) => x.table);
      if (occupied.length >= TABLE_COUNT) return s;                 // all tables booked
      let table = action.table;
      if (!table || occupied.includes(table)) { table = [1, 2, 3].find((t) => t <= TABLE_COUNT && !occupied.includes(t)); }
      if (!table) return s;
      // provisional DM: their mentor rides along (playing), so auto-assign + require the mentor be free that night
      const isProv = provOf(s, action.dmId) === "provisional-dm";
      const mentorId = isProv && s.mentors ? s.mentors[action.dmId] : null;
      if (isProv && mentorId && nightCommitment(s, mentorId, dateStr)) return s; // mentor already committed that night
      const sid = "sess" + s.nextId++;
      const cap = action.capacity || 6;
      let presetSeats: any[] = [];
      if (action.preset && Array.isArray(action.presetSignups)) {   // seat the pre-scheduled players
        const seen = new Set();
        action.presetSignups.forEach((ps) => {
          if (!ps || !ps.charId || !ps.accountId || ps.accountId === action.dmId) return;   // valid, and the DM can't play their own table
          if (seen.has(ps.accountId) || !s.characters[ps.charId] || presetSeats.length >= cap) return;   // one seat per player, real character, within capacity
          seen.add(ps.accountId);
          presetSeats.push({ accountId: ps.accountId, charId: ps.charId, preset: true });
        });
      }
      s.sessions.push({ id: sid, adventureId: action.adventureId, dmId: action.dmId, datetime: action.datetime, table, capacity: cap, storeId: action.storeId || "store_dj", location: action.location || "", signups: presetSeats, observers: [], openToShadow: !!action.openToShadow, mentorId: mentorId || null, mentorStatus: mentorId ? "pending" : null, status: "scheduled", seriesPart: action.seriesPart || "", notes: action.notes || "", preset: !!action.preset, permaDeath: !!action.permaDeath, orgId: action.orgId || null, draft: orgPrescheduleById(s, action.orgId) });
      if (mentorId) s.notices.push({ id: "n" + s.nextId++, type: "mentortable", ctx: "dm", accountId: mentorId, who: accName(action.dmId), when: dateStr, sessionId: sid });
      if (!orgPrescheduleById(s, action.orgId)) notifyAdvWishlisters(s, action.adventureId, action.dmId, dateStr, action.dmId, sid);   // ping wishlisters now — unless it's a pre-scheduled draft (deferred to publish)
      maybeRecruitMonitor(s, action.dmId, sid, action.storeId, dateStr);
      return s;
    }
    case "PUBLISH_TABLE": {
      const ss = s.sessions.find((x) => x.id === action.sessionId);
      if (!ss || !ss.draft) return s;
      if (!canPublishSession(s, action.by, ss)) return s;   // only the table's org leadership (or admin) may open it to players
      ss.draft = false;
      notifyAdvWishlisters(s, ss.adventureId, ss.dmId, (ss.datetime || "").slice(0, 10), ss.dmId, ss.id);   // now that it's public, ping the wishlisters
      return s;
    }
    case "ACCEPT_MENTOR_TABLE": {
      const se = s.sessions.find((x) => x.id === action.sessionId);
      if (se && se.mentorId === action.accountId) {
        se.mentorStatus = "accepted";
        dropNotice((n) => n.type === "mentortable" && n.sessionId === se.id && n.accountId === action.accountId);   // accepted → clear the ask
        s.notices.push({ id: "n" + s.nextId++, type: "mentoraccepted", ctx: "dm", accountId: se.dmId, who: accName(action.accountId), when: (se.datetime || "").slice(0, 10) });
      }
      return s;
    }
    case "DECLINE_MENTOR_TABLE": {
      const se = s.sessions.find((x) => x.id === action.sessionId);
      if (se && se.mentorId === action.accountId) {
        // release the tentative hold entirely — no penalty
        s.sessions = s.sessions.filter((x) => x.id !== action.sessionId);
        s.notices.push({ id: "n" + s.nextId++, type: "mentordeclined", ctx: "dm", accountId: se.dmId, who: accName(action.accountId), when: (se.datetime || "").slice(0, 10) });
      }
      return s;
    }
    case "CREATE_EVENT": {
      if (!s.events) s.events = [];
      const eid = "ev" + s.nextId++;
      s.events.push({ id: eid, name: action.name, date: action.date, stores: action.stores || [], externalLink: action.externalLink || "", price: action.price || "", notifyPlayers: !!action.notifyPlayers, createdBy: action.createdBy, orgId: action.orgId || undefined });
      (action.tables || []).forEach((t, i) => {
        s.sessions.push({ id: "sess" + s.nextId++, eventId: eid, adventureId: t.adventureId, dmId: t.dmId || "", datetime: t.datetime, table: t.table || (i + 1), capacity: t.capacity || 6, storeId: t.storeId || "store_dj", price: t.price || "", signups: [], observers: [], status: "scheduled", seriesPart: "", notes: t.notes || "", preset: false });
        notifyAdvWishlisters(s, t.adventureId, t.dmId || action.createdBy, (t.datetime || action.date || "").slice(0, 10), t.dmId, s.sessions[s.sessions.length - 1].id);   // ping players who wanted this adventure
      });
      if (action.notifyPlayers) {
        const seen: Record<string, any> = {};
        ACCOUNTS.forEach((a) => {
          if (a.id !== action.createdBy && (action.stores || []).some((st) => storesOf(s, a.id).includes(st)) && !seen[a.id]) {
            seen[a.id] = 1;
            s.notices.push({ id: "n" + s.nextId++, type: "eventnew", ctx: "player", accountId: a.id, event: action.name, date: action.date, price: action.price || "" });
          }
        });
      }
      return s;
    }
    // ---- PUSH REPORTS -----------------------------------------------------------------
    // D&D Beyond has no write API, so every change I record here gets re-typed onto the sheet
    // by hand. My mark is a nextId watermark: everything recorded after it is still outstanding.
    case "ACK_PUSH_REPORT": {
      if (action.by !== action.accountId && !isAdmin(s, action.by)) return s;
      if (!s.pushMarks) s.pushMarks = {};
      s.pushMarks[action.accountId] = s.nextId;
      dropNotice((n) => n.type === "pushdue" && n.accountId === action.accountId);
      return s;
    }
    // I raise this on a slow tick. One notice per goat per table - re-raising it every minute
    // would be nagging, not helping.
    case "PUSH_SWEEP": {
      const now = action.now || Date.now();
      // Phase 1c: I INVERTED this. I was running playerPushReport for EVERY account — each
      // report scans my full ledger and item space, so the sweep was O(accounts x state):
      // 7.1 s of frozen UI every 60 s at my 2x-AL scale. Now one RAW pass over ledger and
      // items builds the set of accounts with any activity past their mark; the exact
      // (expensive) report runs only for that set's members who also have an imminent table.
      // Same notices, same counts — I didn't touch the report itself — reached without
      // surveying the innocent.
      const marks: any = s.pushMarks || {};
      const ownerOf = new Map<string, string>();
      const charsByAcct = new Map<string, any[]>();
      for (const [cid, ch] of rawEntries(s.characters as any)) {
        if (!ch || !ch.ownerId) continue;
        ownerOf.set(cid, ch.ownerId);
        const b = charsByAcct.get(ch.ownerId); if (b) b.push(ch); else charsByAcct.set(ch.ownerId, [ch]);
      }
      const active = new Set<string>();
      const logsByChar = new Map<string, any[]>(), itemsByChar = new Map<string, any[]>();
      for (const [, l] of rawEntries(s.logEntries as any)) {
        if (!l || l.status === "REJECTED") continue;
        const own = ownerOf.get(l.charId); if (!own) continue;
        if (idSeq(l.id) < (marks[own] || 0)) continue;
        active.add(own);
        const b = logsByChar.get(l.charId); if (b) b.push(l); else logsByChar.set(l.charId, [l]);
      }
      for (const [, it] of rawEntries(s.items as any)) {
        if (!it || !it.holder || it.holder.type !== "CHARACTER") continue;
        const own = ownerOf.get(it.holder.id); if (!own) continue;
        if (idSeq(it.id) < (marks[own] || 0)) continue;
        active.add(own);
        const b = itemsByChar.get(it.holder.id); if (b) b.push(it); else itemsByChar.set(it.holder.id, [it]);
      }
      ACCOUNTS.forEach((a) => {
        if (!active.has(a.id)) return;
        const rep = playerPushReport(s, a.id, { logsByChar, itemsByChar, chars: charsByAcct.get(a.id) || [] });
        if (!rep.count) return;
        const next = nextTableFor(s, a.id, now);
        if (!next || next.at - now > PUSH_WARNING_MS) return;
        const key = "pushdue:" + a.id + ":" + next.session.id;
        if ((s.notices || []).some((n) => n.type === "pushdue" && n.key === key)) return;
        s.notices.push({ id: "n" + s.nextId++, type: "pushdue", ctx: "player", key,
          accountId: a.id, count: rep.count, sessionId: next.session.id,
          at: next.session.datetime || "" });
      });
      return s;
    }
    case "MARK_WARHORN_PUSHED": {
      if (!s.warhornPushed) s.warhornPushed = {};
      if (action.remove) delete s.warhornPushed[action.key];
      // Store the table's SIGNATURE rather than a bare true. A boolean cannot tell you that a
      // table you already pushed has since moved its time or changed DM - it just looks done.
      // With the signature, schedulerPushReport can say exactly which fields moved.
      else s.warhornPushed[action.key] = action.sig || true;
      return s;
    }
    case "MARK_WARHORN_ALL": {
      if (!s.warhornPushed) s.warhornPushed = {};
      warhornQueueFor(s, action.orgId).forEach((item) => { s.warhornPushed[item.key] = true; });
      return s;
    }
    case "SET_WARHORN_SLUG": {
      const ev = (s.events || []).find((e) => e.id === action.eventId);
      if (ev) ev.warhornSlug = action.slug;
      return s;
    }
    case "IMPORT_WARHORN": {
      if (!isAdmin(s, action.by)) return s;
      if (!s.stubs) s.stubs = {};
      const report = { tablesImported: 0, tablesUpdated: 0, seatsFilled: 0, stubsCreated: 0, skippedNonAL: 0, unmatchedStore: 0, unmatchedAdv: 0, storeNames: {} };
      (action.tables || []).forEach((t) => {
        if (!isALSystem(t.system)) { report.skippedNonAL++; return; }
        const store = matchStoreByWarhorn(s, t.store);
        if (!store) { report.unmatchedStore++; report.storeNames[t.store || "(unnamed)"] = true; return; }   // only import for stores we know
        const hit = searchAdventures(t.code || t.adventure || "", 1);
        const advId = hit && hit[0] ? hit[0].id : null;
        if (!advId) { report.unmatchedAdv++; return; }
        // dedup: same adventure + datetime + store already on the schedule?
        let sess = s.sessions.find((se) => se.adventureId === advId && se.datetime === t.datetime && se.storeId === store.id && se.status !== "cancelled");
        if (!sess) {
          const dateStr = (t.datetime || "").slice(0, 10);
          const taken = tablesOn(s, dateStr).filter((x) => x.storeId === store.id).map((x) => x.table);
          let tnum = 1; while (taken.includes(tnum)) tnum++;
          sess = { id: "sess" + s.nextId++, adventureId: advId, dmId: "", datetime: t.datetime, table: tnum, capacity: t.capacity || 6, storeId: store.id, signups: [], observers: [], status: "scheduled", seriesPart: "", notes: t.gm ? "Warhorn GM: " + t.gm : "", preset: false, importedFrom: "warhorn", warhornGm: t.gm || "" };
          s.sessions.push(sess);
          notifyAdvWishlisters(s, advId, action.by || "", (t.datetime || "").slice(0, 10), null, sess.id);   // ping players who wishlisted this adventure (parity with CREATE_SESSION/CREATE_EVENT)
          report.tablesImported++;
        } else { report.tablesUpdated++; }
        // seat each Warhorn player
        (t.players || []).forEach((p) => {
          if (!p || (!p.name && !p.email)) return;
          const acctId = matchAccountByPerson(s, p);
          if (acctId) {
            if (!sess.signups.some((u) => u.accountId === acctId)) { sess.signups.push({ accountId: acctId, charId: null, fromWarhorn: true }); report.seatsFilled++; }
            return;
          }
          // find or mint a stub for this Warhorn person
          let stubId = Object.keys(s.stubs).find((k) => (p.email && normName(s.stubs[k].email) === normName(p.email)) || (!p.email && normName(s.stubs[k].name) === normName(p.name)));
          if (!stubId) { stubId = "stub_" + s.nextId++; s.stubs[stubId] = { id: stubId, name: p.name || p.email, email: p.email || "", source: "warhorn" }; report.stubsCreated++; }
          if (!sess.signups.some((u) => u.stubId === stubId)) { sess.signups.push({ stubId, fromWarhorn: true }); report.seatsFilled++; }
        });
      });
      s.lastWarhornSync = { ...report, at: todayLocal() + " " + String(new Date().getHours()).padStart(2, "0") + ":" + String(new Date().getMinutes()).padStart(2, "0"), unmatchedStoreNames: Object.keys(report.storeNames) };
      return s;
    }
    case "RECONCILE_WARHORN": {
      // read-only API: I can't push, but I can check who's already registered on Warhorn and tick them off
      if (!s.warhornPushed) s.warhornPushed = {};
      const present = new Set((action.names || []).map(normName));
      warhornQueueFor(s, action.orgId).filter((q) => q.kind === "signup").forEach((q) => {
        if (present.has(normName(accName(q.accountId)))) s.warhornPushed[q.key] = true;
      });
      return s;
    }
    case "TOGGLE_ATTENDANCE": {
      const ss = s.sessions.find((x) => x.id === action.sessionId);
      if (!ss) return s;
      const u = ss.signups.find((x) => x.accountId === action.accountId);
      if (u) u.attended = !u.attended;
      return s;
    }
    case "CHECK_IN": {
      // player self-check-in when they sit down (idempotent set-true); also usable by the DM
      const ss = s.sessions.find((x) => x.id === action.sessionId);
      if (!ss || ss.status === "completed") return s;
      const u = ss.signups.find((x) => x.accountId === action.accountId);
      if (!u) return s;
      if (u.attended) return s;                   // already sat down — don't hand out a second week
      u.attended = true;
      awayBastionTurn(s, u.charId, (ss.datetime || "").slice(0, 10));   // they're at a table; the keep gets a week to itself
      return s;
    }
    case "COMPLETE_SESSION": {
      const ss = s.sessions.find((x) => x.id === action.sessionId);
      if (!ss || ss.status === "completed") return s;
      // DM confirms final attendance (from check-ins, adjustable in the form) + the actual treasure awarded
      ss.signups.forEach((u) => { u.attended = (action.attendees || []).includes(u.accountId); });
      ss.status = "completed";
      ss.completion = {
        itemsAwarded: action.itemsAwarded || [],
        dtAwarded: action.dtAwarded != null ? action.dtAwarded : 0,
        gpAwarded: action.gpAwarded != null ? action.gpAwarded : 0,
        storyAwards: action.storyAwards || "",
        giftAwarded: action.giftAwarded && action.giftAwarded.name ? action.giftAwarded : null,
        notes: action.notes || "",
        completedAt: todayLocal(),
      };
      // [TABLE] The adventure is over, so the keep's Charms are spent — owner's ruling, 17 Jul:
      // expiry hangs on "either complete session or the next bastion turn, one or the other."
      // This is the belt; resolveBastionTurn is the braces. Only the ones who actually sat down, and
      // only the keep's own Charms — a gift the DM awarded at this very table is not touched.
      ss.signups.filter((u) => u.attended).forEach((u) => { const c = s.characters[u.charId]; if (c) { expireBastionCharms(c); expireCharmItemsFor(s, c, Date.now()); } });   // Q15 charm ITEMS ride the same belt — keep or no keep, a completed session closes the holder's week
      // The DM has confirmed what was awarded, so it goes onto the character NOW. It used to
      // wait for the player to click "add to my log", which meant the Exchange's own record of
      // a character was behind its own logsheet until somebody remembered. The push report is
      // the thing that gets typed by hand; the record here should never be.
      ss.signups.filter((u) => u.attended).forEach((u) => { applySessionToChar(s, ss, u, dropNotice); });

      // [ALPG-316] "If this session completed a one-shot, 2+ hours of an official D&D adventure,
      // or the official D&D adventure instructs leveling, you may gain or decline to level,
      // earning rewards for either option."
      //
      // A CHOICE, and declining costs nothing else - the rewards above are already applied
      // either way. The DM says whether the session qualified; the player says yes or no.
      const levelEligible = action.levelEligible !== false;
      ss.signups.filter((u) => u.attended && u.charId).forEach((u) => {
        if (levelEligible) u.levelOffer = "pending";
        const ch = s.characters[u.charId];
        s.notices.push({ id: "n" + s.nextId++, type: levelEligible ? "leveloffer" : "sessioncomplete",
          ctx: "player", accountId: u.accountId,
          adv: ADV_BY_ID[ss.adventureId] ? ADV_BY_ID[ss.adventureId].label : "your table",
          dm: accName(ss.dmId), sessionId: ss.id, charId: u.charId,
          char: ch ? ch.name : "", level: ch ? ch.level : undefined });
      });
      return s;
    }
    // [ALPG-316] Take the level, or decline it. Rewards are unaffected either way - they were
    // applied when the DM completed the table. Recorded on the character, which is what the
    // roster card reads, and surfaced in the push report so the sheet gets the same change.
    case "ACCEPT_LEVEL": {
      const ss = s.sessions.find((x) => x.id === action.sessionId);
      if (!ss || !ss.completion) return s;
      const u = ss.signups.find((x) => x.accountId === action.by);
      if (!u || u.levelOffer !== "pending" || !u.charId) return s;
      const ch = s.characters[u.charId];
      if (!ch) return s;
      const from = ch.level || 1;
      ch.level = from + 1;
      u.levelOffer = "taken";
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "LEVEL", status: "APPROVED",
        date: ss.completion.completedAt, levelFrom: from, levelTo: ch.level,
        adventureId: ss.adventureId, note: "Levelled after " + (ADV_BY_ID[ss.adventureId] ? ADV_BY_ID[ss.adventureId].label : "a session") });
      dropNotice((n) => n.type === "leveloffer" && n.sessionId === ss.id && n.accountId === action.by);
      return s;
    }
    case "DECLINE_LEVEL": {
      const ss = s.sessions.find((x) => x.id === action.sessionId);
      if (!ss) return s;
      const u = ss.signups.find((x) => x.accountId === action.by);
      if (!u || u.levelOffer !== "pending") return s;
      u.levelOffer = "declined";              // rewards keep - only the level is refused
      dropNotice((n) => n.type === "leveloffer" && n.sessionId === ss.id && n.accountId === action.by);
      return s;
    }
    case "ADD_SESSION_TO_LOG": {
      const ss = s.sessions.find((x) => x.id === action.sessionId);
      if (!ss || ss.status !== "completed" || !ss.completion) return s;
      const u = ss.signups.find((x) => x.accountId === action.accountId);
      applySessionToChar(s, ss, u, dropNotice);   // no-ops if already logged, not attended, or characterless
      return s;
    }
    case "CLAIM_TABLE": {
      const ss = s.sessions.find((x) => x.id === action.sessionId);
      if (!ss || ss.dmId) return s;                                  // already claimed
      const dateStr = (ss.datetime || "").slice(0, 10);
      if (nightCommitment(s, action.accountId, dateStr)) return s;   // claimer already committed that night
      ss.dmId = action.accountId;
      maybeRecruitMonitor(s, action.accountId, ss.id, ss.storeId, dateStr);
      return s;
    }
    case "ASSIGN_DM": {
      const ss = s.sessions.find((x) => x.id === action.sessionId);
      if (!ss || ss.dmId) return s;
      const dateStr = (ss.datetime || "").slice(0, 10);
      if (nightCommitment(s, action.dmId, dateStr)) return s;        // that DM is already committed that night
      ss.dmId = action.dmId;
      const ev = (s.events || []).find((e) => e.id === ss.eventId);
      s.notices.push({ id: "n" + s.nextId++, type: "eventassign", ctx: "dm", accountId: action.dmId, event: ev ? ev.name : "an event", when: dateStr });
      maybeRecruitMonitor(s, action.dmId, ss.id, ss.storeId, dateStr);
      return s;
    }
    case "RECRUIT_EVENT": {
      const ev = (s.events || []).find((e) => e.id === action.eventId);
      if (!ev) return s;
      const recips = (action.dmIds && action.dmIds.length)
        ? action.dmIds
        : ACCOUNTS.filter((a) => (s.roles[a.id] || []).includes("dm") && a.id !== action.by && (ev.stores || []).some((st) => storesOf(s, a.id).includes(st))).map((a) => a.id);
      recips.forEach((rid) => s.notices.push({ id: "n" + s.nextId++, type: "eventrecruit", ctx: "dm", accountId: rid, event: ev.name, date: ev.date, eventId: ev.id }));
      return s;
    }
    case "RELEASE_TABLE": {
      const ss = s.sessions.find((x) => x.id === action.sessionId);
      if (ss && ss.dmId === action.accountId && ss.eventId) ss.dmId = ""; // release an event slot you claimed, back to open
      return s;
    }
    case "SIGNUP_SESSION": {
      if (isSuspended(s, action.accountId) || isDeactivated(s, action.accountId)) return s;
      if (!mayActOnChar(s, action.charId, action.accountId)) return s;   // you may only bring your OWN character to a table
      const ss = s.sessions.find((x) => x.id === action.sessionId);
      if (!ss || ss.status === "cancelled") return s;
      if (ss.draft) return s; // pre-scheduled draft — not open to players until an org lead publishes it
      if (!ss.dmId) return s; // open event slot — no runner yet, can't sign up
      if (ss.mentorStatus === "pending") return s; // table not live until the mentor confirms
      if (ss.signups.some((u) => u.accountId === action.accountId)) return s; // already on this table
      if (ss.signups.length >= ss.capacity) return s;
      const sigCh = s.characters[action.charId];
      if (sigCh && sigCh.status && sigCh.status !== "active") return s;   // a retired or fallen character can't take the field
      const dateStr = (ss.datetime || "").slice(0, 10);
      // one commitment per night: running, playing, or shadowing any table that night all block a new sign-up
      if (nightCommitment(s, action.accountId, dateStr)) return s;
      ss.signups.push({ accountId: action.accountId, charId: action.charId });
      if (ss.dmId && ss.dmId !== action.accountId) s.notices.push({ id: "n" + s.nextId++, ctx: "dm", type: "signup", accountId: ss.dmId, who: s.characters[action.charId] ? s.characters[action.charId].name : accName(action.accountId), adv: ADV_BY_ID[ss.adventureId] ? ADV_BY_ID[ss.adventureId].label : "your table" });
      // if this table belongs to an organization's event, hand the schedulers a Warhorn task
      if (ss.eventId) {
        const ev = (s.events || []).find((e) => e.id === ss.eventId);
        const org = ev && ev.orgId ? s.organizations[ev.orgId] : null;
        if (org) (org.schedulerIds || []).forEach((schId) => s.notices.push({ id: "n" + s.nextId++, ctx: "org", type: "warhornsignup", accountId: schId, who: accName(action.accountId), adv: ADV_BY_ID[ss.adventureId] ? ADV_BY_ID[ss.adventureId].label : "a table", event: ev.name }));
      }
      return s;
    }
    case "CANCEL_SIGNUP": {
      const ss = s.sessions.find((x) => x.id === action.sessionId);
      if (ss) ss.signups = ss.signups.filter((u) => u.accountId !== action.accountId);
      return s;
    }
    case "EDIT_SESSION": {
      const ss = s.sessions.find((x) => x.id === action.id);
      if (!ss || ss.status === "completed") return s;
      const before = ADV_BY_ID[ss.adventureId] ? ADV_BY_ID[ss.adventureId].label : ss.adventureId;
      if (action.adventureId !== undefined) ss.adventureId = action.adventureId;
      if (action.datetime !== undefined) ss.datetime = action.datetime;
      if (action.table !== undefined) ss.table = action.table;
      if (action.capacity !== undefined) ss.capacity = action.capacity;
      if (action.storeId !== undefined) ss.storeId = action.storeId;
      if (action.orgId !== undefined) ss.orgId = action.orgId;
      if (action.seriesPart !== undefined) ss.seriesPart = action.seriesPart;
      if (action.notes !== undefined) ss.notes = action.notes;
      if (action.openToShadow !== undefined) ss.openToShadow = action.openToShadow;
      if (action.permaDeath !== undefined) ss.permaDeath = action.permaDeath;
      if (action.dmId !== undefined && action.dmId) ss.dmId = action.dmId;
      // let signed-up players know their table changed
      const after = ADV_BY_ID[ss.adventureId] ? ADV_BY_ID[ss.adventureId].label : ss.adventureId;
      (ss.signups || []).forEach((u) => s.notices.push({ id: "n" + s.nextId++, ctx: "player", type: "sessionedited", accountId: u.accountId, adv: after, changed: before !== after ? before : null, when: (ss.datetime || "").slice(0, 10) }));
      return s;
    }
    case "CANCEL_SESSION": {
      const ss = s.sessions.find((x) => x.id === action.id);
      if (ss) {
        ss.status = "cancelled";
        ss.signups.forEach((u) => s.notices.push({ id: "n" + s.nextId++, ctx: "player", type: "sesscancel", accountId: u.accountId, adv: ADV_BY_ID[ss.adventureId] ? ADV_BY_ID[ss.adventureId].label : "a session" }));
      }
      return s;
    }
    case "START_MENTOR_SEARCH": {
      if (!s.polls) s.polls = [];
      const cand = action.candidate;
      const declined = [...new Set([...((s.mentorDeclined && s.mentorDeclined[cand]) || []), ...(action.excludeExtra || [])])];
      const recipients = ACCOUNTS.filter((a) =>
        a.id !== cand &&
        (s.roles[a.id] || []).includes("dm") &&
        storesOf(s, a.id).includes(action.storeId) &&
        !declined.includes(a.id)
      ).map((a) => a.id);
      const id = "poll" + s.nextId++;
      const responses: Record<string, any> = {};
      // DMs who already flagged a table "open to a shadow" at this store are implicitly willing
      recipients.forEach((rid) => {
        const hasFlaggedTable = s.sessions.some((se) => se.dmId === rid && se.status !== "cancelled" && se.storeId === action.storeId && se.openToShadow);
        if (hasFlaggedTable) responses[rid] = "yes";
      });
      const swap = !!action.swap;
      s.polls.push({
        id, kind: "mentor-search", question: swap
          ? "A provisional DM at " + storeName(s, action.storeId) + " needs a new mentor to review their work at a table. Are you willing?"
          : "A player wants to become a DM at " + storeName(s, action.storeId) + ". Are you willing to let them shadow one of your tables?",
        options: [{ value: "yes", label: "Yes, I'll mentor" }, { value: "no", label: "Not this time" }],
        storeId: action.storeId, audienceRole: "dm", exclude: declined,
        createdBy: action.by, recipients, responses, status: "open",
        meta: { candidate: cand, candidateName: accName(cand), swap }, createdAt: Date.now(),
      });
      recipients.forEach((rid) => { if (!responses[rid]) s.notices.push({ id: "n" + s.nextId++, type: "poll", ctx: "dm", accountId: rid, pollId: id, question: (swap ? "New-mentor request for " : "Shadow request for ") + accName(cand) }); });
      return s;
    }
    case "FORWARD_MENTORS": {
      const p = s.polls.find((x) => x.id === action.pollId);
      if (!p) return s;
      let willing = p.recipients.filter((r) => p.responses[r] === "yes");
      if (p.meta.swap) willing = willing.slice().sort((a, b) => dmSeniority(s, b) - dmSeniority(s, a)); // seniority-ranked for swaps/restorations
      p.status = "closed";
      p.forwarded = true;
      const cand = p.meta.candidate;
      if (!willing.length) {
        // everyone declined → no-mentor auto-denial (distinct from "not ready")
        s.notices.push({ id: "n" + s.nextId++, type: "nomentor", ctx: "player", accountId: cand, store: storeName(s, p.storeId) });
        return s;
      }
      if (!s.mentorOffers) s.mentorOffers = [];
      s.mentorOffers.push({ id: "mo" + s.nextId++, candidate: cand, options: willing, storeId: p.storeId, swap: !!p.meta.swap });
      s.notices.push({ id: "n" + s.nextId++, type: "mentoroffer", ctx: "player", accountId: cand, count: willing.length });
      return s;
    }
    case "SUBMIT_PROV_LOG": {
      if (action.by && action.by !== action.provDm && !isAdmin(s, action.by)) return s;   // a provisional DM submits their own log, nobody else's
      const mentor = s.mentors ? s.mentors[action.provDm] : null;
      const plogId = "log" + s.nextId++;
      s.logEntries.push({ id: plogId, entryType: "PROV_DM", status: "SUBMITTED", provDmId: action.provDm, dmId: mentor, adventureId: action.adventureId, adventure: action.adventure, tier: action.tier, date: action.date, charId: action.charId, itemsEarned: action.itemsEarned || [], dtEarned: 10, answers: action.answers || {} });
      if (mentor) s.notices.push({ id: "n" + s.nextId++, type: "provlog", ctx: "dm", accountId: mentor, who: accName(action.provDm), ref: plogId });
      return s;
    }
    case "REVIEW_PROV_LOG": {
      // Approving a log is how play and its rewards become official. There was no check here:
      // any account could approve any entry. Found by the transition suite.
      if (!isDMRole(s, action.by)) return s;
      const le = s.logEntries.find((l) => l.id === action.logId);
      if (!le) return s;
      le.status = "APPROVED";
      le.readyVerdict = action.ready ? "ready" : "not-ready";
      const provDm = le.provDmId, mentor = le.dmId, ch = s.characters[le.charId];
      dropNotice((n) => n.type === "provlog" && n.ref === le.id);
      // apply the run's rewards to the chosen character (mentor-vouched, since the mentor approved)
      if (ch) {
        ch.dt += le.dtEarned != null ? le.dtEarned : 10;
        (le.itemsEarned || []).forEach((ie) => {
          const count = ie.qty || 1;
          for (let q = 0; q < count; q++) {
            const nid = "it_" + s.nextId++;
            s.items[nid] = mkItem(nid, ie.catalogId, ie.proposedClass || "MAGIC_ITEM", ch.campaign, verified("DM_VOUCH", accName(mentor)), { type: "CHARACTER", id: ch.id });
            const advn = ADV_BY_ID[le.adventureId] ? ADV_BY_ID[le.adventureId].label : "DM reward";
            s.items[nid].origin = { holder: ch.name, adventure: advn, note: "Provisional DM reward — ran " + advn, dmId: mentor };
            s.items[nid].lineage = [{ holder: ch.name, note: "Provisional DM reward — ran " + advn, adventure: advn }];
          }
        });
      }
      if (!s.notReady) s.notReady = {};
      if (action.ready) {
        s.notReady[provDm] = 0;
        if (!s.provRequests) s.provRequests = [];
        s.provRequests.push({ id: "pr" + s.nextId++, candidate: provDm, mentor, kind: "to-certified" });
        ACCOUNTS.filter((a) => (s.roles[a.id] || []).includes("admin")).forEach((a) => s.notices.push({ id: "n" + s.nextId++, type: "certreq", ctx: "admin", accountId: a.id, who: accName(provDm), mentor: accName(mentor), ref: provDm }));
        s.notices.push({ id: "n" + s.nextId++, type: "certready", ctx: "dm", accountId: provDm, mentor: accName(mentor) });
      } else {
        s.notReady[provDm] = (s.notReady[provDm] || 0) + 1;
        if (s.notReady[provDm] >= MENTOR_NOT_READY_LIMIT) {
          s.notReady[provDm] = 0;
          if (!s.mentorSwaps) s.mentorSwaps = [];
          if (!s.mentorSwaps.some((w) => w.candidate === provDm)) s.mentorSwaps.push({ id: "ms" + s.nextId++, candidate: provDm, oldMentor: mentor, storeId: storeOf(s, provDm) });
          ACCOUNTS.filter((a) => (s.roles[a.id] || []).includes("admin")).forEach((a) => s.notices.push({ id: "n" + s.nextId++, type: "swapneeded", ctx: "admin", accountId: a.id, who: accName(provDm) }));
          s.notices.push({ id: "n" + s.nextId++, type: "swapmentee", ctx: "dm", accountId: provDm });
        } else {
          s.notices.push({ id: "n" + s.nextId++, type: "provnotready", ctx: "dm", accountId: provDm, n: s.notReady[provDm] });
        }
      }
      return s;
    }
    case "APPROVE_CERTIFICATION": {
      const req = (s.provRequests || []).find((r) => r.id === action.requestId);
      if (!req) return s;
      if (!s.provisional) s.provisional = {};
      s.provisional[req.candidate] = "certified";
      dropNotice((n) => n.type === "certreq" && n.ref === req.candidate);
      if (s.mentors) delete s.mentors[req.candidate];       // certified DMs run solo
      if (s.notReady) delete s.notReady[req.candidate];
      s.provRequests = s.provRequests.filter((r) => r.id !== action.requestId);
      s.notices.push({ id: "n" + s.nextId++, type: "certified", ctx: "dm", accountId: req.candidate });
      if (req.mentor) s.notices.push({ id: "n" + s.nextId++, type: "menteecert", ctx: "dm", accountId: req.mentor, who: accName(req.candidate) });
      return s;
    }
    case "SUBMIT_OBSERVER_LOG": {
      const se = s.sessions.find((x) => x.id === action.sessionId);
      const mentor = se ? se.dmId : action.mentor;
      const adv = se && ADV_BY_ID[se.adventureId] ? ADV_BY_ID[se.adventureId].label : "a session";
      const ologId = "log" + s.nextId++;
      s.logEntries.push({ id: ologId, entryType: "OBSERVER", status: "SUBMITTED", observerId: action.candidate, dmId: mentor, sessionId: action.sessionId, adventure: adv, reflections: action.reflections || {}, date: todayLocal() });
      if (mentor) s.notices.push({ id: "n" + s.nextId++, type: "observerlog", ctx: "dm", accountId: mentor, who: accName(action.candidate), ref: ologId });
      return s;
    }
    case "REVIEW_OBSERVER": {
      // Approving a log is how play and its rewards become official. There was no check here:
      // any account could approve any entry. Found by the transition suite.
      if (!isDMRole(s, action.by)) return s;
      const le = s.logEntries.find((l) => l.id === action.logId);
      if (!le) return s;
      le.status = "APPROVED";
      le.readyVerdict = action.ready ? "ready" : "not-ready";
      const cand = le.observerId, mentor = le.dmId;
      dropNotice((n) => n.type === "observerlog" && n.ref === le.id);
      if (action.ready) {
        if (!s.provRequests) s.provRequests = [];
        s.provRequests.push({ id: "pr" + s.nextId++, candidate: cand, mentor });
        ACCOUNTS.filter((a) => (s.roles[a.id] || []).includes("admin")).forEach((a) => s.notices.push({ id: "n" + s.nextId++, type: "provreq", ctx: "admin", accountId: a.id, who: accName(cand), mentor: accName(mentor), ref: cand }));
        s.notices.push({ id: "n" + s.nextId++, type: "obsready", ctx: "player", accountId: cand, mentor: accName(mentor) });
      } else {
        if (!s.mentorDeclined) s.mentorDeclined = {};
        s.mentorDeclined[cand] = [...new Set([...(s.mentorDeclined[cand] || []), mentor])];
        ACCOUNTS.filter((a) => (s.roles[a.id] || []).includes("admin")).forEach((a) => s.notices.push({ id: "n" + s.nextId++, type: "needmentor", ctx: "admin", accountId: a.id, who: accName(cand) }));
        s.notices.push({ id: "n" + s.nextId++, type: "obsnotready", ctx: "player", accountId: cand });
      }
      return s;
    }
    case "APPROVE_PROVISIONAL": {
      const req = (s.provRequests || []).find((r) => r.id === action.requestId);
      if (!req) return s;
      if (!s.provisional) s.provisional = {};
      s.provisional[req.candidate] = "provisional-dm";
      dropNotice((n) => n.type === "provreq" && n.ref === req.candidate);
      if (!s.mentors) s.mentors = {};
      s.mentors[req.candidate] = req.mentor;
      if (!(s.roles[req.candidate] || []).includes("dm")) s.roles[req.candidate] = [...(s.roles[req.candidate] || ["player"]), "dm"];
      s.dmRequests = s.dmRequests.filter((id) => id !== req.candidate);
      s.provRequests = s.provRequests.filter((r) => r.id !== action.requestId);
      s.notices.push({ id: "n" + s.nextId++, type: "mentee", ctx: "dm", accountId: req.mentor, who: accName(req.candidate) });
      s.notices.push({ id: "n" + s.nextId++, type: "provdm", ctx: "player", accountId: req.candidate, mentor: accName(req.mentor) });
      return s;
    }
    case "DISMISS_PROV_REQUEST": {
      s.provRequests = (s.provRequests || []).filter((r) => r.id !== action.requestId);
      return s;
    }
    case "PICK_MENTOR": {
      const offer = (s.mentorOffers || []).find((o) => o.id === action.offerId);
      if (!offer || offer.candidate !== action.candidate) return s;
      const mentor = action.mentor;
      if (offer.swap) {
        // mentor swap for an already-provisional DM: just re-point the bond, keep provisional-dm
        if (!s.mentors) s.mentors = {};
        s.mentors[action.candidate] = mentor;
        if (s.notReady) s.notReady[action.candidate] = 0;
        s.mentorSwaps = (s.mentorSwaps || []).filter((w) => w.candidate !== action.candidate);
        s.mentorOffers = s.mentorOffers.filter((o) => o.id !== action.offerId);
        s.notices.push({ id: "n" + s.nextId++, type: "mentee", ctx: "dm", accountId: mentor, who: accName(action.candidate) });
        s.notices.push({ id: "n" + s.nextId++, type: "mentorswapped", ctx: "dm", accountId: action.candidate, mentor: accName(mentor) });
        return s;
      }
      if (!s.shadows) s.shadows = [];
      // attach candidate as observer to the mentor's soonest upcoming table (prefer an openToShadow one) at this store
      const now = new Date().toISOString();
      const upcoming = s.sessions
        .filter((se) => se.dmId === mentor && se.status !== "cancelled" && se.storeId === offer.storeId && (se.datetime || "") >= now.slice(0, 16))
        .sort((a, b) => (a.openToShadow === b.openToShadow ? (a.datetime < b.datetime ? -1 : 1) : a.openToShadow ? -1 : 1));
      const target = upcoming[0];
      let sessionId: any = null;
      if (target) {
        target.observers = target.observers || [];
        if (!target.observers.includes(action.candidate)) target.observers.push(action.candidate);
        sessionId = target.id;
        // an observer can't also play that night — drop any of the candidate's sign-ups on that date
        const dateStr = (target.datetime || "").slice(0, 10);
        s.sessions.forEach((se) => { if ((se.datetime || "").slice(0, 10) === dateStr) se.signups = se.signups.filter((u) => u.accountId !== action.candidate); });
      }
      s.shadows.push({ id: "sh" + s.nextId++, candidate: action.candidate, mentor, storeId: offer.storeId, status: target ? "observing" : "pending-table", sessionId });
      if (!s.provisional) s.provisional = {};
      s.provisional[action.candidate] = "provisional-mentee";
      s.mentorOffers = s.mentorOffers.filter((o) => o.id !== action.offerId);
      s.notices.push({ id: "n" + s.nextId++, type: "shadowset", ctx: "dm", accountId: mentor, who: accName(action.candidate), when: target ? (target.datetime || "").slice(0, 10) : "" });
      return s;
    }
    case "SET_MENTOR": {
      if (!s.mentors) s.mentors = {};
      if (action.mentor) s.mentors[action.mentee] = action.mentor;
      else delete s.mentors[action.mentee];
      return s;
    }
    case "SUGGEST_ADVENTURE": {
      if (!s.mentorSuggest) s.mentorSuggest = {};
      s.mentorSuggest[action.mentee] = { adventureId: action.adventureId, mentor: action.mentor };
      s.notices.push({ id: "n" + s.nextId++, type: "advsuggest", ctx: "dm", accountId: action.mentee, adv: ADV_BY_ID[action.adventureId] ? ADV_BY_ID[action.adventureId].label : "an adventure", mentor: accName(action.mentor) });
      return s;
    }
    case "CREATE_DM_FLAG": {
      if (!s.dmFlags) s.dmFlags = [];
      // must have actually played at that DM's table
      if (!hasPlayedUnder(s, action.by, action.dm)) return s;
      s.dmFlags.push({ id: "flag" + s.nextId++, dm: action.dm, by: action.by, concern: action.concern, date: todayLocal(), status: "open", kind: "escalation" });
      // the only signal the flagged DM gets: a direct, attributed message about the concern
      const th = findOrCreateThread(s, action.by, action.dm, "dm", "dm");
      th.messages.push({ from: action.by, text: "A concern about your table: " + action.concern });
      th.lastRead[action.by] = th.messages.length;
      ACCOUNTS.filter((a) => (s.roles[a.id] || []).includes("admin")).forEach((a) => s.notices.push({ id: "n" + s.nextId++, type: "dmflag", ctx: "admin", accountId: a.id, who: accName(action.dm), dm: action.dm }));
      return s;
    }
    case "MONITOR_REPORT": {
      const se = s.sessions.find((x) => x.id === action.sessionId);
      if (se) { const u = se.signups.find((x) => x.accountId === action.monitorId && x.monitor); if (u) u.monitorReported = true; }
      const dm = action.flaggedDm;
      if (action.corrected) {
        // resolve the oldest open escalation flag
        const f = (s.dmFlags || []).find((x) => x.dm === dm && x.status === "open" && x.kind === "escalation");
        if (f) f.status = "resolved";
      }
      if (action.concerns && action.concerns.trim()) {
        s.dmFlags.push({ id: "flag" + s.nextId++, dm, by: action.monitorId, concern: action.concerns.trim(), date: todayLocal(), status: "open", kind: "monitor" });
      }
      ACCOUNTS.filter((a) => (s.roles[a.id] || []).includes("admin")).forEach((a) => {
        s.notices.push({ id: "n" + s.nextId++, type: "monitorverdict", ctx: "admin", accountId: a.id, dm: accName(dm), corrected: !!action.corrected, more: !!(action.concerns && action.concerns.trim()) });
        if (distinctFlaggers(s, dm) >= OVERSIGHT_FLAG_LIMIT) s.notices.push({ id: "n" + s.nextId++, type: "oversightthreshold", ctx: "admin", accountId: a.id, who: accName(dm) });
      });
      return s;
    }
    case "DEMOTE_DM": {
      // Privileged: an actor without the admin role must not reach this. There was NO check
      // here at all - any account could grant itself a role, deactivate a user, or demote a
      // DM. Latent while my app is single-user and in-memory; a real hole the moment a
      // backend exists. Found by the transition suite's unauthorised-actor property.
      if (!isAdmin(s, action.by)) return s;
      const dm = action.dm;
      if (!s.provisional) s.provisional = {};
      s.provisional[dm] = "provisional-dm";
      // gather concerns: original escalations attributed + dated; monitor concerns anonymized/pooled
      const flags = openFlagsFor(s, dm);
      const attributed = flags.filter((f) => f.kind === "escalation").map((f) => ({ by: accName(f.by), date: f.date, concern: f.concern }));
      const anon = flags.filter((f) => f.kind === "monitor").map((f) => f.concern);
      flags.forEach((f) => { f.status = "resolved"; });
      const mentors = ACCOUNTS.filter((a) => a.id !== dm && (s.roles[a.id] || []).includes("dm") && sharesStore(s, a.id, dm)).map((a) => accName(a.id));
      s.notices.push({ id: "n" + s.nextId++, type: "demoted", ctx: "dm", accountId: dm, attributed, anon, mentors });
      // restoration: needs a new mentor (seniority-ranked search), original mentor eligible
      if (!s.mentorSwaps) s.mentorSwaps = [];
      if (!s.mentorSwaps.some((w) => w.candidate === dm)) s.mentorSwaps.push({ id: "ms" + s.nextId++, candidate: dm, oldMentor: null, storeId: storeOf(s, dm), restoration: true });
      ACCOUNTS.filter((a) => (s.roles[a.id] || []).includes("admin")).forEach((a) => s.notices.push({ id: "n" + s.nextId++, type: "swapneeded", ctx: "admin", accountId: a.id, who: accName(dm) }));
      return s;
    }
    case "SET_PROVISIONAL": {
      // Privileged: an actor without the admin role must not reach this. There was NO check
      // here at all - any account could grant itself a role, deactivate a user, or demote a
      // DM. Latent while my app is single-user and in-memory; a real hole the moment a
      // backend exists. Found by the transition suite's unauthorised-actor property.
      if (!isAdmin(s, action.by)) return s;
      if (!s.provisional) s.provisional = {};
      const st = action.state;
      if (!st || st === "none") delete s.provisional[action.acc];
      else s.provisional[action.acc] = st;
      // keep role access in step with pipeline standing, so DM tools appear/disappear with the status
      const roles = new Set(s.roles[action.acc] || ["player"]);
      roles.add("player");
      if (st === "provisional-dm" || st === "certified") roles.add("dm");
      else if (!roles.has("admin")) roles.delete("dm"); // mentee/none → no DM access (but never lock an admin out)
      s.roles[action.acc] = [...roles];
      return s;
    }
    case "REQUEST_DM": {
      const r = s.roles[action.accountId] || ["player"];
      if (!s.dmRequests.includes(action.accountId) && !r.includes("dm")) s.dmRequests.push(action.accountId);
      return s;
    }
    case "APPROVE_DM": {
      // Privileged: an actor without the admin role must not reach this. There was NO check
      // here at all - any account could grant itself a role, deactivate a user, or demote a
      // DM. Latent while my app is single-user and in-memory; a real hole the moment a
      // backend exists. Found by the transition suite's unauthorised-actor property.
      if (!isAdmin(s, action.by)) return s;
      s.dmRequests = s.dmRequests.filter((id) => id !== action.accountId);
      if (!s.roles[action.accountId]) s.roles[action.accountId] = ["player"];
      if (!s.roles[action.accountId].includes("dm")) s.roles[action.accountId].push("dm");
      s.notices.push({ id: "n" + s.nextId++, type: "role", ctx: "player", accountId: action.accountId, role: "Dungeon Master" });
      return s;
    }
    case "DENY_DM": {
      s.dmRequests = s.dmRequests.filter((id) => id !== action.accountId);
      return s;
    }
  }
  return undefined;   // not ours
}
