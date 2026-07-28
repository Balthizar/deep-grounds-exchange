import { playerPushReport } from "./lib/push";
import { BASTION_ACTION_NAMES } from "./bastion/actions";
import { ITEM_ACTION_NAMES } from "./reducer/items";
import { PLAY_ACTION_NAMES } from "./reducer/play";
import { CHARACTER_ACTION_NAMES } from "./reducer/characters";
import { ORG_ACTION_NAMES } from "./reducer/org";
import { SOCIAL_ACTION_NAMES } from "./reducer/social";
import { seed } from "./seed";
import { threadCtx } from "./lib/core";

import { OVERLAY, TOUCHED, DEAD, isDead, rawEntries } from "./lib/util";
import { CARD_NOTICES, isAlert, isOrgId, unreadFor } from "./lib/rules";
import { orgRec } from "./lib/core";
import React, { useReducer, useState, useMemo, useEffect } from "react";
import { CSS } from "./styles";

import { Avatar, ItemEntryModal, PushReportModal } from "./lib/ui";
import { ACCOUNTS, accName, itemCat, mkItem } from "./lib/core";
import { HAPPENING_LOCKS, bastionDefenderCap, bastionFrozenBy, evPurse } from "./bastion/engine";
import { bastionActions } from "./bastion/actions";
import { ResourcesView } from "./authors/ui";
import { MessagesView, NotificationsView } from "./social/ui";
import { AdminView } from "./admin/ui";
import { CommunityView, LicenseModal, ModuleEditModal, ModuleModal, OrgEditModal, OrgModal, OrganizationView, PollCard, StoreModal, StoreReqModal } from "./org/ui";
import { CompleteSessionModal, DMDeskView, DMLogModal, EscalationModal, EventBuildModal, EventManageModal, LogEntryModal, LogModal, LogSheetModal, MentorOfferCard, MessageModal, MonitorReportModal, ObserverLogModal, ObserverPrompt, ProvTablePrompt, ProvTableProposalCard, ProvTableProposeModal, SessionModal, SessionsView, happeningDue } from "./sessions/ui";
import { DisposalModal, InspectModal, MarketModal, MarketView, ProposeModal, ReqAuthModal, WishModal, WorkbenchModal, findInterest, findMatches, findSoftMatches } from "./market/ui";
import { AccountView, CharEditModal, CharModal, HeroHallModal, PregenModal, PregenTransferModal, ProfileView, RetireDiaryModal, RetirementView } from "./player/ui";
import { BastionAlerts, BastionBuildModal, BastionView, FacilityDetailModal, FurnishingModal, RuinModal, useNow } from "./bastion/ui";
import { itemActions } from "./reducer/items";
import { playActions } from "./reducer/play";
import { characterActions } from "./reducer/characters";
import { orgActions } from "./reducer/org";
import { socialActions } from "./reducer/social";
import { isModuleAuthor } from "./lib/play";
import { consumableUnitCount, isDMRole, orgsOfAccount, provOf, isDeactivated, isSuspended, invalidateItemIndex, retargetItemIndex, isAdmin, orgTabsFor, orgsManagedBy } from "./lib/rules";
import { FACILITY_BEHAVIOR } from "./bastion/registry";
import SPELLS from "./data/srd/spells.json";
import MUNDANE_GEAR from "./data/srd/mundane_gear.json";
import { CATALOG } from "./data/catalog";
import { IMPLEMENTS, ARMAMENTS, ARCANA, RELICS } from "./data/magic_tables";

import { BASTION_TURN_DT } from "./data/bastion";
import type { Bastion, ActionType, AppAction, Action, AppState } from "./types";

// Allow CSS custom properties (e.g. style={{ "--rarity": color }}) in inline styles.
declare module "react" {
  interface CSSProperties { [key: `--${string}`]: string | number | undefined }
}

/* ============================================================
   THE DEEP GROUNDS EXCHANGE — interactive prototype
   A rules-gated AL item exchange broker. Seeded demo data;
   in-memory only. Every flow from the build spec is clickable.
   ============================================================ */

// ================================================================================================
//  THE MERGE. Future me: this was `Object.assign(CATALOG, MUNDANE_GEAR)` and it REPLACED rows wholesale.
//
//  In my pointer architecture there is exactly one way to corrupt everything at once: an unguarded
//  write to the pointee. My items store a catalogId and nothing else — no name, no rarity, no
//  weight — so a row that changes here doesn't drift, it mutates RETROACTIVELY. Every item that
//  ever pointed at it, and every log entry that ever minted one, silently means something new.
//
//  I let that happen. `arrows20` is defined twice: hand-written above as ammunition, and again in
//  my generated SRD 5.2 block. Object.assign let the generated row win, and the id survived while
//  the MEANING died:
//        itemType "ammunition" -> "gear"   ·   props ["ammunition"] -> gone   ·   desc, weight gone
//  which made `consumableUnitCount`'s ALPG rule — magic ammunition counts one per 5 shots, rounded
//  up — UNREACHABLE, because it keys on itemType === "ammunition" and no row had it any more. A
//  live carry-limit rule from my compliance stack, dead, under 1,860 green assertions. I had
//  nothing comparing a row's meaning before the merge against its meaning after. Now I do.
//
//  make_srd_gear.py's own contract says it corrects "names/costs/weights to 5.2" and PRESERVES
//  ids. Object.assign can't express that — it can only replace. So this implements the contract
//  my generator already promised: it owns exactly the fields it claims, and nothing else.
//
//  WHITELIST, NOT BLACKLIST. An UNDECLARED collision throws at load. A declared one merges. A new
//  clash can't sneak in the way this one did on me — and my SRD 5.1 backfill is about to pull
//  another ~50 rows through this exact seam. That's why you're reading this warning, future me.
const GENERATOR_OWNS = ["name", "gp"];   // exactly what the generator claims to correct
// "lb" left this list with Frank's Q22 ruling (26 Jul): the generator no longer emits weight at
// all. Nothing read it. The 14 hand-written CATALOG rows keep their own `weight` STRING, which the
// market inspector does render — that field is untouched here and is not the generator's to own.
const CATALOG_COLLISIONS = {
  arrows20: "Hand-written as ammunition. itemType/props/desc drive consumableUnitCount's ALPG " +
            "one-per-5-shots rule and the isAmmo item card; SRD 5.2 owns only its name, cost and " +
            "weight. The generator renames 'Arrows (20)' -> 'Arrows' (5.2's wording, read out of " +
            "the SRD, not recalled) and prices it at 1 GP.",
};
for (const [gid, row] of Object.entries(MUNDANE_GEAR)) {
  if (!CATALOG[gid]) { CATALOG[gid] = row; continue; }
  if (!CATALOG_COLLISIONS[gid]) {
    throw new Error(
      'CATALOG collision: the generated MUNDANE_GEAR block would overwrite the hand-written "' +
      gid + '". IDS ARE FOREVER (see make_srd_gear.py), so the id is not the problem — the silent ' +
      'replacement is. Declare it in CATALOG_COLLISIONS with a reason, or give one of them a new id.'
    );
  }
  const kept = CATALOG[gid];
  const merged = { ...kept };
  for (const f of GENERATOR_OWNS) if (row[f] !== undefined) merged[f] = row[f];
  merged.srd = true;
  merged.mundane = true;
  CATALOG[gid] = merged;
}
// ================================================================================================
// GENERIC SPELL-SCROLL CATALOGUE — one row per level (scroll_L0..L9), out of make_srd_lists.py.
// The spell a scroll bears is INSTANCE data ({ spellId, spellName } on the item via mkItem's
// extra), not a catalogue row — so ten rows serve all 339 spells and my p10_ledger "one label per
// catalogId" invariant never strains. All ids are new; a collision here is a real bug, so I throw
// like the merge above instead of assigning silently.
const SCROLL_CATALOG = {
  scroll_L0: { id: "scroll_L0", name: "Spell Scroll (Cantrip)", srd: true, rarity: "common", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 0, desc: "A spell scroll bearing a cantrip spell, named by its scribe." },
  scroll_L1: { id: "scroll_L1", name: "Spell Scroll (Level 1)", srd: true, rarity: "common", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 1, desc: "A spell scroll bearing a level 1 spell, named by its scribe." },
  scroll_L2: { id: "scroll_L2", name: "Spell Scroll (Level 2)", srd: true, rarity: "uncommon", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 2, desc: "A spell scroll bearing a level 2 spell, named by its scribe." },
  scroll_L3: { id: "scroll_L3", name: "Spell Scroll (Level 3)", srd: true, rarity: "uncommon", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 3, desc: "A spell scroll bearing a level 3 spell, named by its scribe." },
  scroll_L4: { id: "scroll_L4", name: "Spell Scroll (Level 4)", srd: true, rarity: "rare", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 4, desc: "A spell scroll bearing a level 4 spell, named by its scribe." },
  scroll_L5: { id: "scroll_L5", name: "Spell Scroll (Level 5)", srd: true, rarity: "rare", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 5, desc: "A spell scroll bearing a level 5 spell, named by its scribe." },
  scroll_L6: { id: "scroll_L6", name: "Spell Scroll (Level 6)", srd: true, rarity: "very rare", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 6, desc: "A spell scroll bearing a level 6 spell, named by its scribe." },
  scroll_L7: { id: "scroll_L7", name: "Spell Scroll (Level 7)", srd: true, rarity: "very rare", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 7, desc: "A spell scroll bearing a level 7 spell, named by its scribe." },
  scroll_L8: { id: "scroll_L8", name: "Spell Scroll (Level 8)", srd: true, rarity: "very rare", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 8, desc: "A spell scroll bearing a level 8 spell, named by its scribe." },
  scroll_L9: { id: "scroll_L9", name: "Spell Scroll (Level 9)", srd: true, rarity: "legendary", itemType: "scroll", category: "Scroll", consumable: true, weight: "\u2014", props: ["scroll"], spellLevel: 9, desc: "A spell scroll bearing a level 9 spell, named by its scribe." },
};
for (const [sid, row] of Object.entries(SCROLL_CATALOG)) {
  if (CATALOG[sid]) throw new Error('CATALOG collision on generic scroll "' + sid + '" — scroll_L* ids are reserved for the generated scroll catalogue.');
  CATALOG[sid] = row;
}
// ================================================================================================

// DMG, Archive > Reference Book: "Your Archive contains one copy of a rare and valuable reference
// book, which gives you a benefit while YOU AND THE BOOK ARE IN YOUR BASTION. You can choose one of
// the following options (your DM might make more options available)." Five, verbatim. A Vast Archive
// "gains two additional reference books chosen from the list above" — so 1 at Roomy, 3 at Vast.
// The benefit is a sheet effect my goats apply on their sheets; the Exchange records which book, as with Empower.
// The Archive's reference book. FIVE SUBJECTS, and every house owns a different book about each.
//
// Same reasoning as the taps: "a book that gives you advantage on Religion lore" is a mechanic and is
// free; the titles were not mine to take. Two of five carried Wizards' named IP (an archmage; a draconic god),
// which is the category the Fan Content Policy calls out directly. I keyed it by form, because a
// DMG, Pub > Pub Special: "The Pub has one magical beverage on tap, chosen from the options below...
// At the start of a Bastion turn, you can switch to one of the other options." A Vast Pub "can have
// two magical beverages from the Pub Special list on tap at a time."
// What the pub has on tap. FIVE MECHANICS, and every house names them itself.
//
// The mechanics are the book's and are free — 17 U.S.C. 102(b), you cannot copyright a process, and
// "a pint that makes you big for a day" is a process. The NAMES were not free and were not mine: two
// of the five carried Wizards' own IP inside them (a named archmage; the Spider Queen), which is the
// one thing the Fan Content Policy calls out by name — and SRD 5.2 renames for exactly this reason,
// turning the Deck of Many Things into the "Mysterious Deck". The name was the protected part.
//
// So I keyed them by FORM. A cavern's bartender doesn't name a drink the way a manor's does, and a
// ship's crew names it a third way. I turned the constraint into the feature: the effect is the
// rule, the name is the house, and now a keep and a warren taste different.
// The five mechanics, which are the same in every house — this is what a Pub actually DOES.
const PUB_TAP_KINDS = ["big", "climb", "dark", "necro", "fear"];
const MAGIC_TABLES = { arcana: ARCANA, armaments: ARMAMENTS, implements: IMPLEMENTS, relics: RELICS };
function rollMagicItem(category, rarity) {
  const table = (MAGIC_TABLES[category] || {})[rarity];
  if (!table) return null;                                       // whitelist: a category and rarity the book prints, or nothing
  const d100 = 1 + Math.floor(Math.random() * 100);
  const row = table.find(([hi]) => d100 <= hi);
  // row[2] present => this is a SLOT: I owe the goat a TYPE, not a named item. They supply it
  // from their own book and a DM verifies it (SUBMIT_SLOT_ITEM).
  return row ? { roll: d100, name: row[1], rarity, category, slot: (row as any)[2] || null } : null;
}
// Roll one. The band is inclusive of its upper bound and the list is in order, so the first row whose
// bound the roll does not exceed is the row.
const rollImplement = (rarity) => rollMagicItem("implements", rarity);
const CHORE_DAYS_PER_TURN = BASTION_TURN_DT;                      // 7 — a turn is 7 days (ALPG); the household week runs this many
// I split "pays" into "gold" and "item" on 16 Jul — an uncommon potion is a payout but it isn't
// coin, and it was competing for the same slot as one. evAwards means "this week hands you something".
const evAwards = (ev) => { const k = evPurse(ev); return k === "gold" || k === "item"; };
const BARRACKS_RECRUIT = 4;            // DMG, Barrack: "up to four Bastion Defenders are recruited" per Recruit order
function stateViolations(s: AppState): string[] {
  const bad: string[] = [];
  const say = (m: string) => bad.push(m);

  // ---- BASTION CHARMS ----
  // "You can't gain this Charm again while you still have it." Two live Charms from one room isn't
  // a failed test, it's an illegal state — my reducer has a bug. My fuzzer's 334 hostile dispatches
  // check it for free, without me writing a test for it.
  Object.values(s.characters || {}).forEach((ch: any) => {
    if (!ch || !Array.isArray(ch.gifts)) return;
    const perRoom: Record<string, number> = {};
    ch.gifts.forEach((g: any) => { if (g && g.fromFacility) perRoom[g.fromFacility] = (perRoom[g.fromFacility] || 0) + 1; });
    Object.keys(perRoom).forEach((fid) => {
      if (perRoom[fid] > 1) say("character " + ch.id + " holds " + perRoom[fid] + " live Charms from room " + fid + " (max 1)");
    });
    // A Charm from a room the keep doesn't have is a Charm from nowhere. Provenance is my product.
    const rooms = new Set(((ch.bastion || {}).facilities || []).map((f: any) => f.id));
    ch.gifts.forEach((g: any) => {
      if (g && g.fromFacility && !rooms.has(g.fromFacility)) say("character " + ch.id + " holds a Charm from room " + g.fromFacility + ", which is not in their Bastion");
    });
  });

  // ---- ITEMS ----
  const seenItem: Record<string, string> = {};
  Object.values(s.items || {}).forEach((it: any) => {
    if (!it || !it.id) return;
    if (seenItem[it.id]) say("item " + it.id + " appears twice");
    seenItem[it.id] = "1";
    // an item is held by exactly one thing. "two owners" is the phrase from my own review, and this is it:
    // a holder that names a character who does not exist is an orphan, and an escrowed item that
    // is also available is in two places at once.
    if (it.holder && it.holder.type === "CHARACTER" && !s.characters[it.holder.id])
      say("item " + it.id + " is held by a character that does not exist (" + it.holder.id + ")");
    if (it.escrow && it.available) say("item " + it.id + " is in escrow AND on the market");
    if (it.equipped && !it.attuned && (itemCat(it) || {}).attune)
      say("item " + it.id + " is equipped but not attuned, and it requires attunement");
  });

  // ---- CHARACTERS AND KEEPS ----
  Object.values(s.characters || {}).forEach((ch: any) => {
    if (!ch || !ch.bastion) return;
    const b = ch.bastion;
    const facs = b.facilities || [];

    const ids = facs.map((f: any) => f.id);
    if (new Set(ids).size !== ids.length) say(ch.id + ": two facilities share an id");

    const resolved = new Set((b.turns || []).filter((t: any) => t.resolved).map((t: any) => t.n));
    facs.forEach((f: any) => {
      // A room marked working for a turn that already resolved never takes another order and
      // nothing anywhere complains. This has bitten me before.
      if (f.working != null && resolved.has(f.working))
        say(ch.id + "/" + f.id + ": still working on turn " + f.working + ", which resolved");
      // a room cannot be under construction and taking orders
      if (f.building && f.working != null) say(ch.id + "/" + f.id + ": building AND working");
      // my stock rules: a Roomy pub has one tap, a Vast pub two. Silently having one was a real bug I shipped.
      { const beh = FACILITY_BEHAVIOR[f.defId];
        if (beh && beh.slotField && !f.building && Array.isArray((f as any)[beh.slotField]) && (f as any)[beh.slotField].length !== beh.slotCount!(f))
          say(ch.id + "/" + f.id + ": " + (f as any)[beh.slotField].length + " " + beh.slotField + ", should be " + beh.slotCount!(f)); }
      if (Array.isArray(f.taps) && new Set(f.taps).size !== f.taps.length) say(ch.id + "/" + f.id + ": the same tap twice");
      if (Array.isArray(f.books) && new Set(f.books).size !== f.books.length) say(ch.id + "/" + f.id + ": the same book twice");
    });

    // A happening exists but claims a lock nobody recognises -> bastionFrozenBy told me "not frozen",
    // silently, and a siege left the gate open. I enforce fail-shut upstream now; this proves it.
    if (b.happening && !HAPPENING_LOCKS.includes(b.happening.lock))
      say(ch.id + ": a happening with an unknown lock (" + b.happening.lock + ")");
    if (b.happening && !Array.isArray(b.happening.beats)) say(ch.id + ": a happening with no beats");

    // a fallen lord's keep does not run
    if (ch.status === "dead" && (b.turns || []).some((t: any) => !t.resolved))
      say(ch.id + ": dead, with a turn still running");

    // the defender roster cannot exceed what the barracks allow
    const cap = bastionDefenderCap(b);
    if ((b.defenders || []).length > cap) say(ch.id + ": " + b.defenders.length + " defenders, cap " + cap);

    // one turn at a time. Two unresolved turns means the week forked.
    if ((b.turns || []).filter((t: any) => !t.resolved).length > 1) say(ch.id + ": two turns running at once");
  });

  // ---- SESSIONS ----  (my least-tested domain: 27% of its cases are never dispatched — future me, fix that)
  (s.sessions || []).forEach((se: any) => {
    if (!se) return;
    if (Array.isArray(se.signups) && se.capacity != null && se.signups.length > se.capacity)
      say("session " + se.id + ": " + se.signups.length + " signed up, capacity " + se.capacity);
    if (Array.isArray(se.signups) && new Set(se.signups.map((x: any) => x.charId || x)).size !== se.signups.length)
      say("session " + se.id + ": somebody signed up twice");
    if (se.dmId && se.signups && se.signups.some((x: any) => x.accountId === se.dmId))
      say("session " + se.id + ": the DM is also a player at their own table");
  });

  return bad;
}
function assertStateValid(s: AppState, where?: string) {
  const bad = stateViolations(s);
  if (bad.length) throw new Error("INVARIANT" + (where ? " after " + where : "") + ": " + bad.slice(0, 4).join(" | ")
    + (bad.length > 4 ? " (+" + (bad.length - 4) + " more)" : ""));
  return true;
}
function monitorTasksFor(state: AppState, acct) { return (state.sessions || []).filter((se) => (se.signups || []).some((u) => u.accountId === acct && u.monitor && !u.monitorReported)); }
// Reporting: who belongs to an organisation, split by what they do there.
// Counts come straight off the membership flags, so a report is a read, not a survey.
function orgMembership(state: AppState, orgId) {
  const o = orgRec(state, orgId);
  const members = ACCOUNTS.filter((a) => orgsOfAccount(state, a.id).includes(orgId)).map((a) => a.id);
  const dms = members.filter((id) => isDMRole(state, id));
  const players = members.filter((id) => !isDMRole(state, id) && !isAdmin(state, id));
  const admins = members.filter((id) => isAdmin(state, id));
  const provisional = dms.filter((id) => provOf(state, id) === "provisional-dm");
  return {
    orgId, name: o ? o.name : orgId, members,
    dms, players, admins, provisional,
    certifiedDMs: dms.filter((id) => provOf(state, id) !== "provisional-dm"),
    leaderId: o ? o.leaderId : null,
    counts: { members: members.length, dms: dms.length, players: players.length,
              admins: admins.length, provisional: provisional.length },
  };
}
function hasOrgTab(state: AppState, acc) { return orgTabsFor(state, acc).length > 0; }
function pollsFor(state: AppState, accountId) { return (state.polls || []).filter((p) => p.status === "open" && p.recipients.includes(accountId) && !(accountId in p.responses)); }
function observerTasksFor(state: AppState, acct) {
  return (state.sessions || []).filter((se) => (se.observers || []).includes(acct) && !(state.logEntries || []).some((l) => l.entryType === "OBSERVER" && l.observerId === acct && l.sessionId === se.id));
}
export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, seed);
  const [accountId, setAccountId] = useState("acc_aldric");

  // THE KEEP RUNS WHEREVER YOU ARE. I had this inside BastionView, which React unmounts the moment
  // you click another tab — so clearInterval fired and the bastion stopped ticking. Nothing was
  // lost (readyAt is wall-clock, so it all resolved at once on return) but the REVEAL was: a siege
  // nobody was watching happened in a single frame — twenty minutes of story gone, nine people
  // simply dead. I'd built a battle clock with a precondition no goat would ever meet: stare at one
  // tab for twenty minutes. At the root it ticks on every screen, and the banner follows you.
  useEffect(() => {
    dispatch({ type: "RESOLVE_BASTION_TURNS" });
    // NOTE what I removed: setNow(Date.now()). The keep still resolves every second on every
    // screen — that's the point of this living at the root — but the root no longer re-renders my
    // whole app to do it. RESOLVE returns the SAME state object when nothing is due, so React
    // bails, and the two components that actually draw a countdown keep their own clock (useNow).
    const id = setInterval(() => { dispatch({ type: "RESOLVE_BASTION_TURNS" }); }, 1000);
    // Separately and far more slowly: is any goat playing within the hour on a sheet that's
    // behind? A one-hour warning does not need a one-second heartbeat.
    dispatch({ type: "PUSH_SWEEP" } as any);
    const pushId = setInterval(() => { dispatch({ type: "PUSH_SWEEP" } as any); }, 60000);
    return () => { clearInterval(id); clearInterval(pushId); };
  }, []);
  const [tab, setTab] = useState("profile");
  const [mode, setMode] = useState(null);
  const [modal, setModal] = useState<any>(null);
  const [bastionTarget, setBastionTarget] = useState(null);
  const goBastion = (charId) => { setBastionTarget(charId); setTab("bastions"); };
  const [schedTarget, setSchedTarget] = useState(null);
  const goSchedule = (sessionId) => { setSchedTarget(sessionId); setTab("schedule"); };

  const account = ACCOUNTS.find((a) => a.id === accountId);
  const roles = state.roles[accountId] || ["player"];
  const noticeCountBy = (ctx) => state.notices.filter((n) => n.accountId === accountId && (n.ctx || "player") === ctx).length;
  const pNoticeCount = noticeCountBy("player");
  const dmNoticeCount = noticeCountBy("dm");
  const adminNoticeCount = noticeCountBy("admin");
  const myCids = Object.values(state.characters).filter((c) => c.ownerId === accountId && (!c.status || c.status === "active")).map((c) => c.id);
  const matchCount = myCids.length ? findMatches(state, myCids).length : 0;
  const softCount = myCids.length ? findSoftMatches(state, myCids).length : 0;
  const interestCount = myCids.length ? findInterest(state, myCids).length : 0;
  const dmPending = state.logEntries.filter((l) => l.status === "SUBMITTED" && (l.entryType === "EARNING" || l.entryType === "DISPOSAL") && l.dmId === accountId).length;
  const adminPending = state.dmRequests.length + state.threads.filter((t) => t.ticket && t.ticket.status === "PENDING" && t.ticket.reviewer === accountId).length;
  const tradeValid = (t) => state.items[t.a.itemId] && state.items[t.b.itemId] && state.characters[t.a.charId] && state.characters[t.b.charId];
  const incomingProposals = state.trades.filter((t) => t.status === "PROPOSED" && tradeValid(t) && myCids.includes(t.b.charId)).length;
  const myPolls = pollsFor(state, accountId).length;

  const T = {
    account:  { id: "account",  label: "Profile",     icon: "☺" },
    profile:  { id: "profile",  label: "My Roster",   icon: "❖" },
    notifications: { id: "notifications", label: "Notifications", icon: "🔔" },
    market:   { id: "market",   label: "Market",      icon: "⇄" },
    dm:       { id: "dm",       label: "DM Desk",     icon: "✒" },
    admin:    { id: "admin",    label: "Guild Admin", icon: "⚖" },
    schedule: { id: "schedule", label: "Schedule",    icon: "🗓" },
    community:{ id: "community",label: "Community",   icon: "❦" },
    messages: { id: "messages", label: "Messages",    icon: "✉" },
    org:      { id: "org",      label: "Organization", icon: "✦" },
    bastions: { id: "bastions", label: "Bastions",     icon: "🏰" },
    retirement: { id: "retirement", label: "Retirement", icon: "🪦" },
    resources: { id: "resources", label: "Resources", icon: "✍" },
  };
  const availModes: any[] = [];
  if (roles.includes("admin")) availModes.push("admin");
  if (roles.includes("dm")) availModes.push("dm");
  if (hasOrgTab(state, accountId)) availModes.push("org");
  availModes.push("player");
  const curMode = availModes.includes(mode) ? mode : availModes[0];
  const myNotices = state.notices.filter((n) => n.accountId === accountId && (n.ctx || "player") === curMode && !CARD_NOTICES.has(n.type));
  const myAlerts = myNotices.filter((n) => isAlert(n.type));
  const myOrgPids = curMode === "org" ? orgsManagedBy(state, accountId).map((oid) => "org:" + oid) : null;
  const unreadMsgs = curMode === "org"
    ? (state.threads || []).filter((t) => t.participants.some((p) => (myOrgPids || []).includes(p))).reduce((n, t) => { const me = t.participants.find((p) => isOrgId(p)); return n + unreadFor(t, me); }, 0)
    : state.threads.filter((t) => t.participants.includes(accountId) && threadCtx(t, accountId) === curMode).reduce((n, t) => n + unreadFor(t, accountId), 0);
  const tabsByMode = {
    admin:  [T.admin, T.schedule, T.community, T.messages, T.notifications],
    dm:     [T.dm, T.schedule, T.community, T.messages, T.notifications],
    org:    [T.org, T.schedule, T.community, T.messages, T.notifications],
    player: [T.account, T.profile, T.market, T.schedule, T.messages, T.notifications, T.bastions, T.retirement, T.community],
  };
  const tabs = (curMode === "dm" && isModuleAuthor(state, accountId)) ? [...tabsByMode.dm, T.resources] : tabsByMode[curMode];
  const [moreOpen, setMoreOpen] = useState(false);
  useEffect(() => { setMoreOpen(false); }, [tab]);   // any navigation closes the overflow menu
  const callAwaiting = Object.values(state.characters).some((c) => c.ownerId === accountId && c.status === "retired" && c.bastion && c.bastion.pendingCall && c.bastion.pendingCall.by);
  const navHasDot = (id) => (id === "notifications" && myNotices.length > 0) || (id === "market" && (matchCount + incomingProposals) > 0) || (id === "messages" && (unreadMsgs + myPolls) > 0) || (id === "retirement" && callAwaiting) || (id === "dm" && dmPending > 0) || (id === "admin" && adminPending > 0);
  const moreHasDot = tabs.slice(4).some((t) => navHasDot(t.id));   // on mobile, tabs 5+ live in the More menu
  const activeTab = tabs.find((t) => t.id === tab) ? tab : tabs[0].id;
  const hasMarket = tabs.some((t) => t.id === "market");
  const MODE_LABEL = { admin: "Admin", dm: "Dungeon Master", org: "Organization", player: "Player" };
  const defaultTabFor = { admin: "admin", dm: "dm", org: "org", player: "profile" };

  return (
    <div className="dg-root">
      <style>{CSS}</style>

      <header className="dg-top">
        <button className="dg-brand" onClick={() => setModal({ kind: "about" })} title="The charter of the Deep Grounds">
          <span className="dg-crest">✦</span>
          <div>
            <div className="dg-title">The Deep Grounds Exchange</div>
            <div className="dg-sub">the guild hall &amp; ledger of the Adventurers League</div>
          </div>
        </button>
        <div className="dg-acctwrap">
          <Avatar src={state.avatars && state.avatars[accountId]} size={36} />
          <label className="dg-acct">
            <span>Signed in as</span>
            <select value={accountId} onChange={(e) => { /* switching account is this prototype's logout: offer the push report on the way out */ if (playerPushReport(state, accountId).count) setModal({ kind: "pushreport", mode: "player" });  setAccountId(e.target.value); setMode(null); setTab("profile"); }}>
              {ACCOUNTS.map((a) => { const r = state.roles[a.id] || ["player"]; const hi = r.includes("admin") ? "admin" : r.includes("dm") ? "dm" : "player"; return <option key={a.id} value={a.id}>{a.name} · {hi}</option>; })}
            </select>
          </label>
        </div>
      </header>

      {availModes.length > 1 && (
        <div className="dg-modetoggle">
          {availModes.map((m) => (
            <button key={m} className={"dg-modebtn" + (curMode === m ? " on" : "")} onClick={() => { setMode(m); setTab(defaultTabFor[m]); }}>{MODE_LABEL[m]}</button>
          ))}
        </div>
      )}

      {pollsFor(state, accountId).map((p) => <PollCard key={p.id} poll={p} accountId={accountId} dispatch={dispatch} />)}
      {(state.mentorOffers || []).filter((o) => o.candidate === accountId).map((o) => <MentorOfferCard key={o.id} offer={o} state={state} accountId={accountId} dispatch={dispatch} />)}
      <ProvTablePrompt state={state} accountId={accountId} setModal={setModal} />
      {(state.tableProposals || []).filter((tp) => tp.status === "PENDING" && tp.mentor === accountId).map((tp) => <ProvTableProposalCard key={tp.id} proposal={tp} state={state} accountId={accountId} dispatch={dispatch} />)}
      {observerTasksFor(state, accountId).map((se) => <ObserverPrompt key={se.id} sess={se} accountId={accountId} setModal={setModal} />)}
      {myAlerts.length > 0 && activeTab !== "notifications" && (
        <button className="dg-alertbanner" onClick={() => setTab("notifications")}>
          ⚠ {myAlerts.length === 1 ? "1 item needs" : myAlerts.length + " items need"} a response — open Notifications
        </button>
      )}
      {monitorTasksFor(state, accountId).map((se) => (
        <div key={"mon" + se.id} className="dg-pollcard">
          <div className="dg-poll-h">🔎 Quiet check-in — file your report</div>
          <div className="dg-muted sm" style={{ marginBottom: 6 }}>You sat in at {accName(se.dmId)}'s table. File your confidential report for the admin.</div>
          <button className="dg-btn sm" onClick={() => setModal({ kind: "monitorreport", sessionId: se.id, flaggedDm: se.dmId })}>File check-in report</button>
        </div>
      ))}
      {isDeactivated(state, accountId) && <div className="dg-banbanner">Your account has been deactivated by an administrator. You can't send messages or sign up for tables. Please contact an administrator.</div>}
      {!isDeactivated(state, accountId) && isSuspended(state, accountId) && <div className="dg-banbanner">Your account is suspended until {new Date(state.mod.bans[accountId]).toLocaleString()}. Messaging is disabled until then.</div>}

      {hasMarket && matchCount > 0 && activeTab !== "market" && (
        <button className="dg-matchbanner" onClick={() => setTab("market")}>
          ✦ There {matchCount === 1 ? "is a match" : `are ${matchCount} matches`} available for your roster — open the Market
        </button>
      )}
      {hasMarket && matchCount === 0 && softCount > 0 && activeTab !== "market" && (
        <button className="dg-matchbanner soft" onClick={() => setTab("market")}>
          ⚑ An item on your wish list is out there but not yet offered — see the Market
        </button>
      )}
      {hasMarket && matchCount === 0 && softCount === 0 && interestCount > 0 && activeTab !== "market" && (
        <button className="dg-matchbanner interest" onClick={() => setTab("market")}>
          ◆ Someone wants an item you're not using — see the Market
        </button>
      )}

      <div className="dg-shell">
        <nav className="dg-nav">
          {tabs.map((t) => (
            <button key={t.id} className={"dg-navbtn" + (activeTab === t.id ? " active" : "")} onClick={() => { setTab(t.id); setMoreOpen(false); }}>
              <span className="dg-navicon">{t.icon}</span><span className="dg-navlabel">{t.label}</span>{navHasDot(t.id) && <span className="dg-navdot" title="Something needs your attention here" />}
            </button>
          ))}
          <div className={"dg-navmore-wrap" + (tabs.length > 4 ? "" : " dg-navmore-empty")}>
            {moreOpen && <div className="dg-navmore-backdrop" onClick={() => setMoreOpen(false)} />}
            {moreOpen && <div className="dg-navmore-menu">
              {tabs.map((t) => (
                <button key={t.id} className={"dg-navmore-item" + (activeTab === t.id ? " active" : "")} onClick={() => { setMoreOpen(false); setTab(t.id); }}>
                  <span className="dg-navicon">{t.icon}</span><span>{t.label}</span>{navHasDot(t.id) && <span className="dg-navdot rel" />}
                </button>
              ))}
            </div>}
            <button className={"dg-navbtn dg-navmore" + (moreOpen ? " active" : "")} onClick={() => setMoreOpen((o) => !o)}>
              <span className="dg-navicon">☰</span><span className="dg-navlabel">More</span>{moreHasDot && !moreOpen && <span className="dg-navdot" />}
            </button>
          </div>
        </nav>

        <main className="dg-main">
          {/* THE KEEP FOLLOWS YOU. A happening is metered over minutes and a call waits for an answer,
              and neither is any use on a tab you left. This sits ABOVE the tab switch, so a siege at
              Ravenhold reaches you while you're reading your log, and the rider at the gate is still
              at the gate when you come back. It's the same shape as the call to arms that already
              reaches a retired hero on two screens — that pattern was right; it was just only used
              once. Tap it to go there. */}
          <BastionAlerts state={state} accountId={accountId} goBastion={goBastion} />
          {activeTab === "account" && <AccountView state={state} accountId={accountId} dispatch={dispatch} />}
          {activeTab === "profile" && <ProfileView state={state} accountId={accountId} dispatch={dispatch} setModal={setModal} goBastion={goBastion} />}
          {activeTab === "notifications" && <NotificationsView state={state} accountId={accountId} mode={curMode} dispatch={dispatch} setTab={setTab} goSchedule={goSchedule} goBastion={goBastion} />}
          {activeTab === "retirement" && <RetirementView state={state} accountId={accountId} dispatch={dispatch} setModal={setModal} goBastion={goBastion} />}
          {activeTab === "market"  && <MarketView state={state} accountId={accountId} dispatch={dispatch} setModal={setModal} />}
          {activeTab === "bastions" && <BastionView state={state} accountId={accountId} dispatch={dispatch} setModal={setModal} bastionTarget={bastionTarget} clearTarget={() => setBastionTarget(null)} setTab={setTab} />}
          {activeTab === "dm"      && <DMDeskView state={state} dispatch={dispatch} accountId={accountId} setModal={setModal} setTab={setTab} goSchedule={goSchedule} />}
          {activeTab === "resources" && <ResourcesView state={state} accountId={accountId} dispatch={dispatch} setModal={setModal} />}
          {activeTab === "admin"   && <AdminView state={state} dispatch={dispatch} setModal={setModal} accountId={accountId} setTab={setTab} />}
          {activeTab === "org"     && <OrganizationView state={state} dispatch={dispatch} setModal={setModal} accountId={accountId} />}
          {activeTab === "messages" && <MessagesView state={state} accountId={accountId} dispatch={dispatch} mode={curMode} />}
          {activeTab === "schedule" && <SessionsView state={state} accountId={accountId} dispatch={dispatch} mode={curMode} setModal={setModal} schedTarget={schedTarget} clearSchedTarget={() => setSchedTarget(null)} />}
          {activeTab === "community" && <CommunityView state={state} accountId={accountId} dispatch={dispatch} setModal={setModal} />}
        </main>
      </div>

      {modal && <Modal modal={modal} state={state} dispatch={dispatch} close={() => setModal(null)} accountId={accountId} setTab={setTab} setModal={setModal} />}
    </div>
  );
}

function ConfirmModal({ modal, dispatch, close }) {
  return (
    <div className="dg-confirmmodal">
      <div className="dg-confirm-title">{modal.title || "Are you sure?"}</div>
      {modal.body && <div className="dg-confirm-body">{modal.body}</div>}
      <div className="dg-row-actions" style={{ marginTop: 16 }}>
        <button className={"dg-btn" + (modal.danger ? " danger" : "")} onClick={() => { if (modal.action) dispatch(modal.action); close(); }}>{modal.confirmLabel || "Confirm"}</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </div>
  );
}

function AboutModal({ close }) {
  return (
    <>
      <h3 className="dg-modal-h">✦ The Deep Grounds Exchange</h3>
      <p className="dg-muted sm" style={{ marginBottom: 10 }}>The guild hall and ledger of the Adventurers League.</p>
      <div className="dg-insp-desc">
        Every adventuring guild worth its name keeps an honest ledger — who ran which delve, what treasure was won, and whose word vouches for it. The Deep Grounds Exchange is that ledger, kept for a real Adventurers League table: a hall where sessions are called, heroes and their hard-won magic are tracked down to their provenance, and every reward is entered <i>by the book</i>. Built by a certified Dungeon Master so the tale stays at the table and the bookkeeping keeps itself.
      </div>

      <div className="dg-insp-sec">What the hall keeps</div>
      <div className="dg-insp-desc">
        The full adventure catalogue and a store-aware scheduler; character rosters that track a relic's provenance, attunement, and downtime; a magic-item exchange that holds to the League's trade laws rather than the honor system alone; a Master's tools for logging sessions, minting pre-generated heroes, and authenticating relics; a registry of stores and the organizations that run play; and grand multi-table events whose certificates carry a traceable seal. Every ruling is grounded in the AL Player's &amp; DM's Guides — the hall keeps a table compliant without anyone having to memorize the compliance stack.
      </div>

      <div className="dg-insp-sec">Raising Dungeon Masters</div>
      <div className="dg-insp-desc">
        The heart of the hall is how it raises new Masters. A would-be DM is paired with a willing mentor, shadows a table, and sets down an honest account; once the mentor vouches for them they take up the screen as a provisional Master — full tools, their mentor a message away, and that mentor riding along at every table until they can run alone. And should a seasoned Master ever lose the thread, a quiet word from their peers brings them back — not to shame them, but to set them beside a mentor once more. One principle runs through all of it: <b>growth in, restoration out</b>. No one is cast out.
      </div>

      <div className="dg-insp-sec">Charter-keeper</div>
      <div className="dg-about-credit">
        <div>Kept by <b>Frank Pettingill</b></div>
        <div className="dg-muted sm">A certified AL DM under SCALE who runs the Deep Grounds Adventuring Company at Dungeons &amp; Javas.</div>
        <div className="dg-muted sm" style={{ marginTop: 4, fontStyle: "italic" }}>This hall is Frank's own work — not an official product of SCALE. SCALE and the Deep Grounds Adventuring Company are unrelated.</div>
      </div>

      <div className="dg-insp-sec">Support the hall</div>
      <div className="dg-doclinks">
        <a className="dg-doclink" href="https://www.buymeacoffee.com/yourhandle" target="_blank" rel="noreferrer">☕ Buy me a coffee</a>
        <a className="dg-doclink" href="https://www.patreon.com/yourhandle" target="_blank" rel="noreferrer">♥ Support on Patreon</a>
      </div>

      <div className="dg-muted sm" style={{ marginTop: 10 }}>Fan-made and unofficial. Not affiliated with, endorsed, or sponsored by Wizards of the Coast. Dungeons &amp; Dragons, D&amp;D, and Adventurers League are trademarks of Wizards of the Coast LLC. Built to support official organized play, not to replace the published guides.</div>
      <div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div>
    </>
  );
}

function Modal({ modal, state, dispatch, close, accountId, setTab, setModal }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  return (
    <div className="dg-overlay" onClick={close}>
      <div className="dg-modal" onClick={(e) => e.stopPropagation()}>
        <button className="dg-modal-x" onClick={close} aria-label="Close">×</button>
        {modal.kind === "moduleedit" && <ModuleEditModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} />}
        {modal.kind === "log" && <LogModal modal={modal} state={state} dispatch={dispatch} close={close} setModal={setModal} accountId={accountId} />}
        {modal.kind === "logsheet" && <LogSheetModal modal={modal} state={state} setModal={setModal} close={close} />}
        {modal.kind === "logentry" && <LogEntryModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} setModal={setModal} />}
        {modal.kind === "reqauth" && <ReqAuthModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} />}
      {modal.kind === "pushreport" && <PushReportModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={() => setModal(null)} />}
        {modal.kind === "itementry" && <ItemEntryModal modal={modal} state={state} accountId={accountId} dispatch={dispatch} close={close} />}
        {modal.kind === "disposal" && <DisposalModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} />}
        {modal.kind === "dmlog" && <DMLogModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} />}
        {modal.kind === "observerlog" && <ObserverLogModal modal={modal} state={state} dispatch={dispatch} close={close} accountId={accountId} />}
        {modal.kind === "provtable" && <ProvTableProposeModal modal={modal} state={state} dispatch={dispatch} close={close} accountId={accountId} />}
        {modal.kind === "escalate" && <EscalationModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} />}
        {modal.kind === "monitorreport" && <MonitorReportModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} />}
        {modal.kind === "trade-propose" && <ProposeModal modal={modal} state={state} dispatch={dispatch} close={close} />}
        {modal.kind === "inspect" && <InspectModal modal={modal} state={state} close={close} setModal={setModal} accountId={accountId} />}
        {modal.kind === "wish" && <WishModal modal={modal} dispatch={dispatch} close={close} accountId={accountId} />}
        {modal.kind === "message" && <MessageModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} setTab={setTab} />}
        {modal.kind === "session" && <SessionModal modal={modal} state={state} dispatch={dispatch} close={close} setModal={setModal} accountId={accountId} />}
        {modal.kind === "eventbuild" && <EventBuildModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} setModal={setModal} />}
        {modal.kind === "eventmanage" && <EventManageModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} setModal={setModal} />}
        {modal.kind === "completesession" && <CompleteSessionModal modal={modal} state={state} dispatch={dispatch} close={close} />}
        {modal.kind === "market" && <MarketModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} />}
        {modal.kind === "workbench" && <WorkbenchModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} />}
        {modal.kind === "bastionbuild" && <BastionBuildModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} />}
        {modal.kind === "facilitydetail" && <FacilityDetailModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} setModal={setModal} />}
        {modal.kind === "module" && <ModuleModal modal={modal} state={state} close={close} />}
        {modal.kind === "about" && <AboutModal close={close} />}
        {modal.kind === "org" && <OrgModal modal={modal} state={state} close={close} setModal={setModal} accountId={accountId} dispatch={dispatch} />}
        {modal.kind === "orgedit" && <OrgEditModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} />}
        {modal.kind === "store" && <StoreModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} />}
        {modal.kind === "storereq" && <StoreReqModal modal={modal} state={state} dispatch={dispatch} accountId={accountId} close={close} />}
        {modal.kind === "char" && <CharModal modal={modal} state={state} close={close} />}
        {modal.kind === "furnishing" && <FurnishingModal modal={modal} state={state} dispatch={dispatch} close={close} accountId={accountId} />}
        {modal.kind === "charedit" && <CharEditModal modal={modal} state={state} dispatch={dispatch} close={close} accountId={accountId} />}
        {modal.kind === "pregen" && <PregenModal modal={modal} state={state} dispatch={dispatch} close={close} accountId={accountId} />}
        {modal.kind === "pregen-transfer" && <PregenTransferModal modal={modal} state={state} dispatch={dispatch} close={close} accountId={accountId} />}
        {modal.kind === "herohall" && <HeroHallModal modal={modal} state={state} accountId={accountId} dispatch={dispatch} close={close} />}
        {modal.kind === "confirm" && <ConfirmModal modal={modal} dispatch={dispatch} close={close} />}
        {modal.kind === "retirediary" && <RetireDiaryModal modal={modal} state={state} accountId={accountId} dispatch={dispatch} />}
        {modal.kind === "ruin" && <RuinModal modal={modal} state={state} accountId={accountId} dispatch={dispatch} close={close} />}
        {modal.kind === "license" && <LicenseModal modal={modal} state={state} accountId={accountId} dispatch={dispatch} close={close} />}
      </div>
      <footer className="dg-fcp">{"The Deep Grounds Exchange is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. \u00a9Wizards of the Coast LLC."}{" "}SRD 5.1/5.2.1 content is used under CC-BY-4.0.</footer>
    </div>
  );
}

// delegates' source to discover valid action names.
function buildKnownActions() {
  // Future me: this is an EXPLICIT registry, built from each reducer module's own declared list.
  //
  // I used to read reducerImpl.toString() and regex-scan for `case "X":`. Fine in dev, BROKEN
  // in prod: the minifier emits `case`X`:`, my scan matched nothing, the size guard returned
  // null, and my unknown-action guard turned itself off - in the shipped bundle only, where no
  // harness was looking. Lesson I paid for: Function.prototype.toString() is not a contract.
  //
  // harness/check_actions.cjs asserts each module's list still matches its actual case labels,
  // and that the union equals ActionType. I made the explicitness unable to rot; keep it that way.
  const set = new Set<string>([
    ...BASTION_ACTION_NAMES, ...ITEM_ACTION_NAMES, ...PLAY_ACTION_NAMES,
    ...CHARACTER_ACTION_NAMES, ...ORG_ACTION_NAMES, ...SOCIAL_ACTION_NAMES,
  ]);
  return set;
}

let KNOWN_ACTIONS: any = null;
let NEXT_DUE = 0;   // soonest platform-wide bastion due time; 0 = unknown, rescan on next tick

// My reducer. It belongs in my app shell, not a feature package.
function reducer(state: AppState, action: Action): AppState {
  if (KNOWN_ACTIONS === null) KNOWN_ACTIONS = buildKnownActions();
  const next = reducerImpl(state, action);
  // Note to future me: I do NOT invalidate the demand index here, on purpose. It memoises on
  // `state.wishlists` identity, and my lazy draft only hands that a new identity when an action
  // touches it. Blowing it away every action would undo the whole point of my Phase 1b.
  if (next !== state) {
    // Phase 1c: I only let the item index die when ITEMS actually moved. My draft records which
    // top-level collections the action touched; for everything else the old buckets are still
    // true — same record objects — so I retarget the index to the new state identity instead of
    // rebuilding. I measured the difference: ~1 s rebuild at 400k items vs a pointer write.
    if ((next as any)[TOUCHED] && (next as any)[TOUCHED].items) invalidateItemIndex();
    else retargetItemIndex(next);
  }
  return next;
}

// ---- A WEEK, IN FIVE PARTS ---------------------------------------------------------------------
// TAKE_BASTION_TURN was 88 lines doing five jobs — my worst case in the reducer, and the same shape
// I already caught once in §3: "RESOLVE_BASTION_TURNS was 94 lines doing construction, orders,
// events and attacks; it's now 15 lines calling four named things." It grew a line at a time over
// one long day, which is how they always grow on me. One case, one job; the rules get their names
// on the door.

function reducerImpl(state: AppState, action: Action): AppState {
  // Fast path for the 1-Hz bastion tick: it fires every second while the Bastions tab is
  // open. If no turn is actually due, return the SAME state reference — this skips the
  // full-state structuredClone below AND lets React bail the re-render (Object.is equality).
  if (action.type === "RESOLVE_BASTION_TURNS") {
    const now = Date.now();
    // Phase 1c: O(1) idle. NEXT_DUE is my module-level watermark — the soonest moment anything
    // on the platform can come due. While now is before it, I return the SAME state reference
    // without scanning, so my 1 Hz interval costs a comparison. Any bastion-mutating action
    // zeroes the watermark (below, where bastionActions returns) and buys exactly one full
    // rescan on the next tick; that rescan recomputes the true minimum as it goes.
    //   I MEASURED this: idle tick at 50k characters was 81 ms of main thread per second. Now ~0.
    if (now < NEXT_DUE) return state;
    let minFuture = Infinity;
    const dueAt = (b: any): number => {
      let m = Infinity; const c = (t: any) => { if (t != null && t < m) m = t; };
      if (Array.isArray(b.turns)) b.turns.forEach((t) => { if (!t.resolved) c(t.readyAt); });
      if (Array.isArray(b.facilities)) b.facilities.forEach((f) => { if (f.building) c(f.building.readyAt); });
      if (b.wallsBuilding) c(b.wallsBuilding.readyAt);
      const h = b.happening;                       // mirrors happeningDue: end time, plus the first untold beat
      if (h) { c(h.endsAt); if (Array.isArray(h.beats)) for (let i = h.shown || 0; i < h.beats.length; i++) { c(h.beats[i]?.at); break; } }
      return m;
    };
    let anyDue = false;
    for (const [, ch] of rawEntries(state.characters)) {   // raw: a scan must not clone the population
      if (!ch || !ch.bastion) continue;
      const m = dueAt(ch.bastion);
      if (m <= now) { anyDue = true; break; }
      if (m < minFuture) minFuture = m;
    }
    if (!anyDue) { NEXT_DUE = minFuture === Infinity ? now + 3600e3 : minFuture; return state; }
    NEXT_DUE = 0;   // work exists; resolution below may truncate, so stay hot until a clean idle scan
  }
  // ---- THE DRAFT -------------------------------------------------------------------------------
  // Future me, read this before you touch it. This was `structuredClone(state)`. One line, and it
  // was the only thing in my app that stopped it working at scale: a full deep copy of every
  // character, bastion, log, session, message and grave, to flip one boolean. Cost linear in TOTAL
  // PLATFORM STATE, not in the thing I changed — and I built this product to accumulate history
  // forever. The state is designed to grow. The clone was designed to lose.
  //
  //   I MEASURED it (harness/scale_fixture.cjs), cost of ONE trivial action:
  //        3 chars     0.9 ms      fine
  //      300 chars    23.1 ms      the wall — one big convention, or a good SCALE year
  //     2000 chars   241.0 ms      broken
  //    10000 chars  1334.3 ms      a UI that has stopped working
  //   94% of it was two collections: characters 56%, logEntries 38%. And logEntries is APPEND-ONLY
  //   — I have never once mutated a log entry in place — so I was copying 6,000 immutable records
  //   to add one.
  //
  // WHAT I DO INSTEAD. A Proxy, shallow at the top, cloning each collection LAZILY the first time
  // anything reaches for it. An action that touches `characters` pays for characters and nothing
  // else. An action that touches nothing pays nothing. React still sees a new top-level object,
  // each untouched collection keeps its identity, and components reading them bail their re-render
  // for free — which my full clone never allowed.
  //
  //   AFTER:  10000 chars  1334 ms -> ~5 ms. Flat, one frame, every size.
  //
  // WHY NOT IMMER: it's the obvious answer and I can't import it here — this ships as a single
  // artifact with a fixed library list. This is ~15 lines and does the one thing Immer would.
  //
  // WHY A PROXY AND NOT 167 HAND EDITS: I audited my reducer — 78 cases touch characters, 49
  // notices, 36 items, 30 logEntries, 25 sessions. Hand-cloning per case is 167 chances for me to
  // forget one, and forgetting one mutates the PREVIOUS state — a bug that doesn't throw, doesn't
  // fail a test that checks the new state, and corrupts my history silently. The Proxy can't
  // forget. TWO LEVELS, because one wasn't enough and my measurement said so.
  //
  // A per-COLLECTION lazy clone bought me 1.2x and nothing more. `characters` is 56% of the state
  // and almost every action touches it — usually just to READ ONE OWNER for a permission check.
  // Paying 13 ms to learn who owns an item was the actual bug, and lazy-cloning the collection
  // still pays it.
  //
  // So: collections shallow-copy, and each RECORD deep-clones itself on first touch. An action
  // that reads ch_rath's owner clones ch_rath. Reads two characters, clones two. Everything else
  // keeps its identity, which also lets React bail those subtrees for free.
  //
  // THE ONE COST, and future me needs to know it: `Object.values(s.characters)` touches every key
  // and therefore clones every character. That's correct — an action that iterates the population
  // IS reading the population — but the cheap path only helps actions that name what they want.
  // Most of mine do. RESOLVE_BASTION_TURNS iterates, which is why I gave it the `anyDue` fast path
  // and why that path must stay: it returns `state` untouched and never enters this at all.
  // DEEP = a collection of RECORDS where an action touches one and leaves the rest alone. Map or
  // array copies shallow; each record deep-clones itself on first touch.
  //
  // logEntries and sessions are in here and that's the important part. logEntries is APPEND-ONLY
  // in 32 of 35 places — nothing edits an entry except my three moderation actions — and it is the
  // biggest collection in the product BY DESIGN: the ledger is the point, and it grows forever. I
  // had it in FLAT, so ANY action that wrote a log line deep-cloned my entire ledger:
  //
  //   MEASURED, 10,000 characters / 200,000 log entries:
  //     SET_BASTION_REGION      306.05 ms   <- writes one log line
  //     TOGGLE_AVAILABLE          4.25 ms   <- writes none
  //
  // Same bug Phase 1 was FOR, one level down, and I shipped it that same morning: my fast path
  // only helped actions that don't touch the ledger, and almost everything worth doing touches
  // the ledger.
  // EVERY mutable top-level collection goes in one of these two lists. A collection in NEITHER
  // comes back by REFERENCE, and writing to it mutates the state React is still holding —
  // silently, no error. I had 26 collections unclassified and caught 9 actions writing straight
  // through into the previous state; harness/immutability.cjs freezes the previous state and
  // dispatches all 182 actions, which is what found them and what keeps it from recurring.
  // Future me: when you add a collection to AppState, you add it here in the SAME commit.
  const DEEP = { characters: 1, items: 1, logEntries: 1, sessions: 1, notices: 1, threads: 1,
                 // record collections that grow with activity: same shape as the six above -
                 // an action touches one row and leaves the rest alone.
                 listings: 1, trades: 1, tickets: 1,
                 // grows with activity (every convention adds one); was in FLAT — same misclassification shape the ledger had
                 events: 1,
                 // provisional table proposals (27 Jul): grows with activity — one row per
                 // proposal, and PICK/DECLINE mutate a single row and leave the rest alone.
                 // Same shape as the six above, so DEEP. The draft refused to run until this
                 // line existed, which is the guard working exactly as intended.
                 tableProposals: 1 };
  const FLAT = { organizations: 1, moduleListings: 1, wishlists: 1, storeRegistry: 1, players: 1, bastionPacts: 1,
                 blocks: 1, itemSlots: 1, signups: 1, messages: 1, authors: 1,
                 // bounded by account / org / store count, so a whole-collection clone is cheap
                 orgMembers: 1, roles: 1, dmRequests: 1, avatars: 1, bios: 1, mod: 1, stores: 1,
                 storeRequests: 1, storeFlags: 1, polls: 1, mentorOffers: 1, shadows: 1,
                 mentorDeclined: 1, provRequests: 1, mentors: 1, mentorSuggest: 1, notReady: 1,
                 mentorSwaps: 1, dmFlags: 1, provisional: 1, warhornPushed: 1, stubs: 1,
                 moduleAuthors: 1, pushMarks: 1 };
  const cloned: Record<string, any> = {};
  // PHASE 1c: THE OVERLAY. My lazy draft's per-record clone was lazy; my per-COLLECTION
  // shallow copy was not — `{ ...src }` over 50,000 characters cost me 50–100 ms on EVERY
  // dispatch that read one owner for a permission check. The CPU profile didn't leave room to
  // argue: 443 of 458 samples inside this function's old body. Same bug shape Phase 1 was for.
  // One level down. Again. Future me: when a cost is linear in the population, go find where I
  // copied the population.
  //
  // Object maps are now an immutable BASE plus a small OVERRIDE layer. Construction is O(prior
  // overrides), not O(population); a dispatch pays for the records it touches, nothing else. I
  // kept the clone-on-first-[[Get]] pessimism — a read hands my reducer a mutable record, so a
  // read is still priced as a write. Chained drafts reuse the ORIGINAL base and copy only the
  // (small) override set; past COMPACT_AT overrides I fold the layer into a fresh plain base
  // once — O(N) amortised across the thousands of actions that built it up.
  //
  //   I MEASURED it (harness/phase1c_bench, 50k characters, steady state):
  //     region write (1 log line)   98.2 ms  ->  see PERFORMANCE.md after-table
  //
  // Arrays keep the old mechanism (slice + per-element lazy clone), and that's a decision, not a
  // leftover: a pointer copy of even a 500k-entry ledger measured 10.6 ms, array-index
  // virtualisation through a proxy is where subtle bugs live, and at that size the ledger's true
  // home is my server store anyway.
  const COMPACT_AT = 4096;
  const lazyMap = (name) => {
    const src = state[name];
    if (Array.isArray(src)) {
      const copy = src.slice();
      const done: Record<string, any> = {};
      return new Proxy(copy, {
        get(o, k: any) {
          if (k === OVERLAY) return { arr: o };   // my raw window for read-only passes (rawEntries) — the live target, clones and all
          if (typeof k === "string" && !done[k] && Object.prototype.hasOwnProperty.call(o, k)
              && src[k] && typeof src[k] === "object") {
            o[k] = structuredClone(src[k]);                 // this record, once
            done[k] = true;
          }
          return o[k];
        },
        deleteProperty(o, k: any) { done[k] = true; delete o[k]; return true; },
        set(o, k: any, v: any) { done[k] = true; o[k] = v; return true; },
      });
    }
    // object map: base + overrides
    let mBase = src || {}, over: Record<string, any> = {};
    const parent = src && (src as any)[OVERLAY];
    if (parent) { mBase = parent.base; over = { ...parent.over }; }
    if (Object.keys(over).length > COMPACT_AT) {            // fold, rarely
      const m: any = {};
      for (const k of Object.keys(mBase)) { const v = Object.prototype.hasOwnProperty.call(over, k) ? over[k] : mBase[k]; if (!isDead(v)) m[k] = v; }
      for (const k of Object.keys(over)) if (!Object.prototype.hasOwnProperty.call(mBase, k) && !isDead(over[k])) m[k] = over[k];
      mBase = m; over = {};
    }
    const meta = { base: mBase, over };
    const hop = Object.prototype.hasOwnProperty;
    return new Proxy(Object.create(null), {
      get(_t, k: any) {
        if (k === OVERLAY) return meta;
        if (typeof k !== "string") return undefined;
        const hasO = hop.call(over, k);
        let v = hasO ? over[k] : mBase[k];
        if (isDead(v)) return undefined;
        if (!hasO && v && typeof v === "object") { v = structuredClone(v); over[k] = v; }   // this record, once
        return v;
      },
      set(_t, k: any, v: any) { over[k] = v; return true; },
      deleteProperty(_t, k: any) { over[k] = DEAD; return true; },   // the dead stay dead — base doesn't get a vote
      has(_t, k: any) { const v = hop.call(over, k) ? over[k] : mBase[k]; return v !== undefined && !isDead(v); },
      ownKeys(_t) {
        const keys: string[] = [];
        for (const k of Object.keys(mBase)) if (!isDead(hop.call(over, k) ? over[k] : mBase[k])) keys.push(k);
        for (const k of Object.keys(over)) if (!hop.call(mBase, k) && !isDead(over[k])) keys.push(k);
        return keys;
      },
      getOwnPropertyDescriptor(_t, k: any) {
        if (typeof k !== "string") return undefined;
        const v = hop.call(over, k) ? over[k] : mBase[k];
        if (v === undefined || isDead(v)) return undefined;
        return { value: v, writable: true, enumerable: true, configurable: true };
      },
    });
  };
  const base = { ...state };
  const s = new Proxy(base, {
    get(o, k: any) {      if (typeof k === "string" && !cloned[k] && o[k] !== undefined) {
        if (DEEP[k]) { o[k] = lazyMap(k); cloned[k] = true; }
        else if (FLAT[k]) { o[k] = structuredClone(state[k]); cloned[k] = true; }
        else if (o[k] && typeof o[k] === "object" && k !== "lastWarhornSync") {
          // lastWarhornSync is a single report object, not a record collection; I replace it wholesale on write.
          // A collection in NEITHER list comes back by reference, and writing through it mutates
          // the state React is still holding — silently. I have been bitten by that nine times;
          // now it's a named error instead of a corruption. Future me: the key goes into DEEP or
          // FLAT in the same commit that adds it to AppState. No exceptions. [FINDINGS: BUG-4]
          throw new Error("reducer draft: state collection \"" + String(k) + "\" is in neither DEEP nor FLAT — classify it before an action touches it.");
        }
      }
      return o[k];
    },
    set(o, k: any, v: any) { cloned[k] = true; o[k] = v; return true; },
  });
  (base as any)[TOUCHED] = cloned;   // my wrapper reads this so I only invalidate what actually moved
  // auto-clear notices whose underlying issue I've handled
  const dropNotice = (pred) => { s.notices = s.notices.filter((n) => !pred(n)); };
  // Bastion actions live in bastion/actions.ts. They need my draft state and the notice
  // helper, so I hand them over explicitly instead of letting them capture this closure.
  {
    const handled = bastionActions(s, action, dropNotice);
    if (handled !== undefined) { if (handled !== state) NEXT_DUE = 0; return handled; }
  }
  {
    const handled = itemActions(s, action, dropNotice);
    if (handled !== undefined) return handled;
  }
  {
    const handled = playActions(s, action, dropNotice);
    if (handled !== undefined) return handled;
  }
  {
    const handled = characterActions(s, action, dropNotice);
    if (handled !== undefined) return handled;
  }
  {
    const handled = orgActions(s, action, dropNotice);
    if (handled !== undefined) return handled;
  }
  {
    const handled = socialActions(s, action, dropNotice);
    if (handled !== undefined) return handled;
  }
  switch (action.type) {
      default:
          // AN ACTION NOBODY HANDLES IS A BUG. ALWAYS. I used to return `s` here — a freshly
          // drafted state nothing had touched — so a misspelled dispatch re-rendered, changed
          // nothing, and said nothing. That's not a no-op, that's a silent failure, and it cost
          // me an hour: I typed `ENLARGE_FACILITY` (the action is ENLARGE_BASTION_FACILITY), hit
          // this line, got an unchanged state back, and watched six clean-looking test runs fail
          // on a symptom two functions away.
          //
          // A typed action union would make this unreachable at compile time and that's still the
          // right answer. This is three lines and catches the same bug in every environment that
          // actually runs, including the ones with no compiler anywhere near them.
          //
          // Returning `state` — the ORIGINAL reference, not my draft — is the other half: React
          // sees Object.is equality and bails the render, so a bad dispatch costs me nothing.
          if (KNOWN_ACTIONS && !KNOWN_ACTIONS.has((action as AppAction).type)) {
            const near = [...KNOWN_ACTIONS].filter((k) => k.indexOf(String((action as AppAction).type).slice(0, 8)) === 0);
            throw new Error("reducer: no case for " + JSON.stringify((action as AppAction).type)
              + (near.length ? ". Did you mean " + near.join(" / ") + "?" : ". It is not an action this app has."));
          }
          return state;
    }
}

