import { bForm } from "../lib/rules";
import { mkRng, bastionHousing } from "./engine";
import { CreditTrail, labelSource } from "../lib/ui";

import type { Action, AppState, CharacterRecord } from "../types";
import { ARCHIVE_BOOK_SUBJECTS, ARCHIVE_BOOK_SUBJECT_LABEL, ARCHIVE_LORE_BY_REGION, composeArchiveTitle, BASTION_BEDS_BY_SIZE, BASTION_ENLARGE, BASTION_EVENTS, BASTION_FACILITIES, BASTION_FORMS, BASTION_ORDERS, BASTION_PREREQS, BASTION_REGIONS, BASTION_SIZES, BASTION_SIZE_INFO, BASTION_TURN_DT, BASTION_WALLS_COST, BASTION_WALLS_DAYS, FURNISHING_TIERS, bastionSizeCost } from "../data/bastion";
import { BASTION_SIZE_FLAVOR, FURNISHING_TIER_BY_ID, HIRELING_LOSS, facEstablishment, furnishingValue, ruinFacilityFlavor } from "./registry";
import { EVENT_CAST, FESTIVAL_FEATURES } from "../data/events";
import { Empty, RARITY, SectionHead, getBlob, defaultEpitaph } from "../lib/ui";
import { REAL_MIN_PER_GAME_DAY, REGION_WEIGHTS, armoryCost, bDef, bOutputs, bastionDefenderCap, bastionFrozenBy, bastionHas, bastionLeisure, bastionSizeDays, bastionSpecialSlots, bastionTradeIncome, bastionTurnPending, buildBudgetLeft, buildBudgetOpen, buildBudgetTotal, facDisabled, facEnlargeBenefit, facPrereq, facPrereqMet, facPrintedSpace, facQualifies, facResting, facStockedThisTurn, facilityDormant, furnNextTier, furnPrevTier, furnishingSaleValue, regionalEvents } from "./engine";
import { accName, evHostility, evIsHostile, itemCat } from "../lib/core";
import { bastionEligible, callKind, earnedRegions } from "../lib/rules";

import { pick } from "../lib/util";

// ONE THING A DAY, SEVEN DAYS A TURN, FOURTEEN TO CHOOSE FROM (Exchange, platform-side).
// A Bastion turn is SEVEN days, and that is not a calendar week — the Realms runs on Harptos and its
// week is a tenday. Seven is the BOOK's number, twice over:
//   DMG:  "By default, a Bastion turn occurs every 7 days of in-game time."
//   ALPG: "You may make one Bastion turn (taking 7 days), spending 7 DT for each turn."
// AL nails it to 7 DT, so 7 is the arithmetic and no calendar moves it.
//
// The lock is ONE GAME DAY — REAL_MIN_PER_GAME_DAY, the same clock everything else here runs on. The
// cap is seven a turn, because a turn is seven days and a day is one thing. But each room offers
// FOURTEEN, so a household never does the same week twice: fourteen things it could do, seven days
// to do them in, and the player says which. The gap between 14 and 7 is the whole point of it.
//
// It buys nothing. No gold, no DT, no turn, no event roll. It is me standing in for the
// part of a table where somebody says "what's my household actually doing while I'm away?" and the
// DM says something back. The only thing it touches is the neglect counter, because a keep somebody
// is living in is not a keep that has been abandoned.
export const CHORE_LOCK_MIN = REAL_MIN_PER_GAME_DAY;                    // a day's work takes a day — still paces the re-stock changeover below

export const facStockLocked = (fac, now) => facStockLockedUntil(fac) > (now || Date.now());

export const facBuilding = (fac, now) => (fac && fac.building && fac.building.readyAt > (now || Date.now())) ? fac.building : null;

export function facWorkingTurn(ch, fac) { return fac.working != null && ch.bastion ? ch.bastion.turns.find((t) => t.n === fac.working) : null; }

// The housing decision, made visible: sleeps N, household of M, and who commutes. Its own component so the
// render harness covers it too. A short keep reads short here instead of only in the arrivals of the story.
export function HousingLine({ bastion }) {
  const hh = bastionHousing(bastion);
  if (!hh.heads) return null;
  const c = hh.commuters.length;
  return (
    <div className={"dg-housing" + (c > 0 ? " short" : "")}>
      🛏 Quarters sleep {hh.beds} · household of {hh.heads}{c > 0 ? " · " + c + " commute" + (c === 1 ? "s" : "") + " from the village — build a bedroom to house them" : " · all housed"}
    </div>
  );
}

// The household week, rendered. Pulled out as its own component so the render harness can mount it in
// isolation (react-dom/server) — the first view in my app that's actually render-tested, not just eyeballed.
export function HouseholdStory({ turn }) {
  if (!turn || !turn.resolved || !Array.isArray(turn.household) || turn.household.length === 0) return null;
  return (
    <div className="dg-household">
      <div className="dg-muted sm" style={{ marginTop: 6 }}>❦ The household, while you were away</div>
      {turn.household.map((dy) => (
        <div key={"hd" + dy.day} className="dg-bastday">
          <div className="dg-muted sm">Day {dy.day}</div>
          {dy.morning.length > 0 && <div className="dg-bastflavor">{dy.morning.join(" ")}</div>}
          {dy.chores.length > 0 && <div className="dg-bastflavor">{dy.chores.join(" ")}</div>}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// BASTION UI - the screens for the keep.
//
// Companion to the rest of the bastion package:
//     bastion/registry.ts  what a facility IS
//     bastion/engine.ts    how a keep BEHAVES
//     bastion/actions.ts   the reducer cases
//     bastion/ui.tsx       what the player SEES     <- this file
//
// Imports flow one way and never come back:
//     types < data < lib < bastion  <-  app.tsx
// ============================================================================

import React, { useState, useEffect, useMemo, useRef, useReducer } from "react";

export const facStockLockedUntil = (fac) => (fac && fac.stockAt ? fac.stockAt + CHORE_LOCK_MIN * 60000 : 0);

export const sizeFlavorFor = (defId, formId, size) => {
  const t = BASTION_SIZE_FLAVOR[defId]; if (!t) return "";
  const arr = t[formId] || t.keep;     if (!arr) return "";
  return arr[BASTION_SIZES.indexOf(size)] || "";
};

// 5 · RUIN FLAVOR — form-keyed (overwrites the seeded one-liner)
// ═══════════════════════════ end BEDROOM mint ═══════════════════════════

// ═══════════════════════════ COURTYARD — minted facility (all sockets) ═══════════════════════════
// Pure data — the engine sockets went in with the bedroom. Def unchanged (kind:"basic").
// No staff (courtyard keeps no household); no quarters. [COPYRIGHT] All original writing.

// ═══════════════════════════ end COURTYARD mint ═══════════════════════════

// ═══════════════════════════ DINING ROOM — minted facility (defId "dining") ═══════════════════════════
// Pure data — engine sockets already live. Def unchanged (kind:"basic"). No staff, no quarters.
// The hamlet form is the village TAVERN (flavor only — nothing here sells; that's the Pub).
// table@cavern / table@vessel already exist in the source and are left untouched.
// [COPYRIGHT] All original writing.

// table@cavern / table@vessel already in source — add the other six + all eight chairs@

// ═══════════════════════════ end DINING mint ═══════════════════════════

// ═══════════════════════════ KITCHEN — minted facility (first that STAFFS) ═══════════════════════════
// Basic, but it keeps a household (Cook/Scullion/Potboy, 1/2/3 by size) — flavor-only, no housing weight.
// Unique slots cookfire/worktable/pots so its furniture reads as a kitchen, not a dining room or parlor.
// [COPYRIGHT] All original writing.

// HIRELINGS — the first staffing basic. Roles fill in order; counts scale by size; loss keys to the room.
Object.assign(HIRELING_LOSS, { kitchen: [
  { fate: "dead",  text: "caught {illness} in the year-round heat and steam and could not throw it off" },
  { fate: "dead",  text: "scalded a hand that turned bad, took {illness} from it, and was gone before the herbs could help" },
  { fate: "alive", text: "took a better kitchen in a bigger house, and left one good recipe behind" },
  { fate: "alive", text: "married out of the parish and took the good knife with them" },
  { fate: "alive", text: "walked out mid-service over the salt, and was half-right about the salt" },
] });

// ═══════════════════════════ end KITCHEN mint ═══════════════════════════

// ═══════════════════════════ STORAGE — minted facility (staffs a Cellarer) ═══════════════════════════
// Basic that keeps a small household (Cellarer/Porter, 0/1/1 by size). Unique slots racking/crates so its
// fittings read as a store, not a laboratory's or storehouse's shelving. No seeded instance to migrate.
// [COPYRIGHT] All original writing.

Object.assign(HIRELING_LOSS, { storage: [
  { fate: "dead",  text: "took {illness} in the cold and the damp and never quite warmed up again" },
  { fate: "dead",  text: "went down for the last barrel in the dark, missed a step, and did not come up" },
  { fate: "alive", text: "left for a merchant's warehouse and a clerk's clean hands" },
  { fate: "alive", text: "came up an inch short on the tally once too often, and left before being asked" },
  { fate: "alive", text: "wandered off one market day and sent word later they were happier for it" },
] });

// FURNISHINGS — unique storage slots. racking is new (default + 8 houses); crates keeps its (storage-only)
// default and gains the eight houses. Weights fall to the sensible defaults (racking 3, crates 2).

// ═══════════════════════════ end STORAGE mint ═══════════════════════════

// ═══════════════════════════ PARLOR — minted facility (completes the six basics) ═══════════════════════════
// Non-staffing. Slots seats/hearth are parlor-owned now (the kitchen moved to cookfire). This overwrites the
// old hearth@vessel (a galley stove) with a parlor cabin-fireplace. [COPYRIGHT] All original writing.

// FURNISHINGS — parlor owns seats & hearth. Defaults stay; add the eight houses (hearth@vessel overwrites
// the stale galley-stove entry with a great-cabin fireplace).

// ═══════════════════════════ end PARLOR mint ═══════════════════════════

// ═══════════════════════════ ARCANE STUDY — minted facility (first special) ═══════════════════════════
// Level 5, Roomy, 1 hireling, Craft order. Prereq: arcane_focus (already in BASTION_PREREQS). Carries an
// Identify charm and the DMG's three craft options (a focus — free; a blank book — 10 GP; and a Common/
// Uncommon Arcana magic item at level 9+). The def itself is inserted up in BASTION_FACILITIES beside the
// other level-5 craft specials; this block adds the flavor sockets. [COPYRIGHT] All original writing.
// This is also the first special to carry size flavor, ruin flavor, a reaction table, and a living week —
// expanding the basics' format to a room with a single working hireling, the Scholar.

export function fmtCountdown(ms) {
  // A frozen turn carries readyAt = Infinity — there is no "ready in" for a week that isn't running.
  // Guard here rather than at each caller: this rendered "Infinityh NaNm" the moment the freeze went
  // in, and would have done so again the next time anything paused a clock.
  if (!Number.isFinite(ms)) return "— on hold";
  if (ms <= 0) return "resolving…";
  const totalMin = Math.ceil(ms / 60000);
  if (totalMin < 60) return totalMin + "m";
  const h = Math.floor(totalMin / 60), m = totalMin % 60;
  return h + "h " + (m < 10 ? "0" : "") + m + "m";
}

// ============================================================
//                          UI
// ============================================================
// ---- A CLOCK, FOR THE THINGS THAT DRAW ONE --------------------------------------------------
// This lived in App as `const [now, setNow] = useState(Date.now())` with a 1-Hz setInterval — so
// EVERY SECOND the root re-rendered and everything under it recomputed: the adventure catalogue,
// author listings, scheduling, messages, organizations, character profiles. All of it, once a
// second, for a countdown on a bastion card.
//
// Only two components ever wanted it: BastionAlerts and BastionView. Everything else that needs the
// time calls Date.now() where it stands, which is correct — a reducer does not need a React clock.
//
// So the clock is a hook now, and the components that draw a countdown subscribe to it themselves.
// Nothing else re-renders on the tick, which is the whole fix.
//
// NB THE DISPATCH STAYS AT THE ROOT and this is deliberate — see the comment in App. The keep runs
// wherever you are: RESOLVE_BASTION_TURNS lived inside BastionView once, React unmounted it the
// moment you changed tabs, and a siege you weren't watching resolved in a single frame. That tick
// costs 0.007 ms because `anyDue` returns the same state and never clones. It is not the problem.
// setNow was the problem.
export function useNow(ms = 1000) {
  const [t, setT] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return t;
}

// A single countdown TEXT that owns its own clock. Only this leaf re-renders each second — never the
// tree it sits in. Before this, BastionView held the clock at the top of the whole bastion screen, so
// every rendered facility, turn, and furnishing recomputed once a second just to advance one number.
// A busy keep (several rooms mid-work, a turn resolving) made that per-second render heavy enough to
// jam the tab — the countdown then looked frozen because the thread never got back to it. Same root
// cause for "chores don't count down" and "the site freezes with too many timers": one clock, wrong
// place. Turn/build/attack/walls expiries are cleared by the root RESOLVE loop's real state change, so
// this only ever needs to DRAW the number; the moment it hits zero the parent has already re-rendered.
export function Countdown({ to }) {
  const now = useNow();
  const left = to - now;
  return <>{left > 0 ? fmtCountdown(left) : "now"}</>;
}

// Re-render a bastion view EXACTLY when its next purely-time-based lock frees — a chore day or a
// re-stock day. Those two locks change nothing in state when they expire (unlike a turn, which the
// reducer resolves), so nothing would otherwise re-enable the room's controls until the next unrelated
// render. One setTimeout to the soonest expiry, not a poll: zero cost while things are locked, one
// re-render when a lock lifts. Returns a fresh clock read for the logic that gates on `now`.
export function useLockExpiry(b) {
  const [, bump] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    const now = Date.now();
    const ts: any[] = [];
    for (const f of (b.facilities || [])) {
      const s = facStockLockedUntil(f); if (s > now) ts.push(s);
    }
    if (!ts.length) return;
    const id = setTimeout(bump, Math.min(...ts) - now + 50);
    return () => clearTimeout(id);
  });
  return Date.now();
}

export function RuinModal({ modal, state, accountId, dispatch, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const ch = state.characters[modal.charId];
  if (!ch || !ch.bastion) return null;
  const b = ch.bastion;
  const form = typeof bForm === "function" ? bForm(b) : null;
  const grave = b.defenderGraveyard || [];
  const relics = b.relics || [];
  return (
    <div className="dg-herohall">
      <div className="dg-hallhero-name">🏚 {b.name}</div>
      <div className="dg-muted">{[form && form.name, b.location, b.builtAtLevel ? "built at level " + b.builtAtLevel : null].filter(Boolean).join(" · ")}</div>
      <div className="dg-muted sm" style={{ marginTop: 2 }}>The fallen keep of {ch.name}{[ch.race, ch.cls].filter(Boolean).length ? ", " + [ch.race, ch.cls].filter(Boolean).join(" ") : ""} · shared by {accName(ch.ownerId)}</div>
      <div className="dg-ruin" style={{ marginTop: 12 }}>
        <div className="dg-muted sm" style={{ fontStyle: "italic" }}>After {ch.name} fell, the folk of {b.name} drifted away, and its halls were left to slow decay. They are said to be haunted by {ch.name}&rsquo;s restless shade.</div>
      </div>
      <div className="dg-halldiary-h">✝ Their epitaph</div>
      <div className="dg-epitaph">&ldquo;{ch.epitaph || defaultEpitaph(ch)}&rdquo;</div>

      {relics.length > 0 && (<>
        <div className="dg-halldiary-h">⚔ Relics sealed in the ruin</div>
        <div className="dg-relics">
          {relics.map((r, i) => <div key={i} className="dg-relic-line"><b>{r.name}</b> <span className="dg-muted sm">· {RARITY[r.rarity] ? RARITY[r.rarity].label : r.rarity}</span>{r.provenance && r.provenance.by ? <span className="dg-muted sm"> · {labelSource(r.provenance.source)} by {r.provenance.by}</span> : null}</div>)}
          <div className="dg-muted sm" style={{ marginTop: 5 }}>What {ch.name} left stored here, sealed forever — a writer who features this ruin may place them for other heroes to find.</div>
        </div>
      </>)}

      <div className="dg-halldiary-h">🏰 The halls that were</div>
      {(b.facilities || []).map((f) => {
        const def = BASTION_FACILITIES[f.defId] || {};
        const furn = f.furnishings || [];
        return (
          <div key={f.id} className="dg-ruinfac">
            <div><b>{def.name || f.defId}</b> <span className="dg-muted sm">· {f.size}{form ? " · " + form.word : ""}</span></div>
            <div className="dg-muted sm" style={{ fontStyle: "italic", marginTop: 2 }}>{ruinFacilityFlavor(def, form)}</div>
            {f.description && <div className="dg-muted sm" style={{ marginTop: 3 }}>{f.description}</div>}
            {furn.length > 0 && <div className="dg-muted sm" style={{ marginTop: 3 }}><b>What still lies here:</b> {furn.map((x) => x.note).join("; ")}.</div>}
          </div>
        );
      })}

      {grave.length > 0 && (<>
        <div className="dg-halldiary-h">✝ The fallen defenders</div>
        <div className="dg-defgrave-frame">{grave.map((d, i) => <GraveLine key={i} d={d} bastionName={b.name} />)}</div>
      </>)}

      {(b.turns || []).length > 0 && (<>
        <div className="dg-halldiary-h">📜 Chronicle of {b.name}</div>
        {[...b.turns].reverse().map((t) => (
          <div key={t.n} className="dg-bastturn">
            <div><b>Turn {t.n}</b> <span className="dg-muted sm">· {t.date}{t.resolved && t.event ? " · " + t.event : ""}</span></div>
            {t.resolved && t.flavor && <div className="dg-bastflavor">{t.flavor}</div>}
            {t.resolved && (t.benefits || []).map((bn, i) => <div key={i} className="dg-muted sm">• {bn}</div>)}
            {t.resolved && (t.mintables || []).map((m: any, i: number) => {
              const owned = Object.values(state.items).some((x: any) => x.bookItem && x.name === m.title && x.holder && x.holder.type === "CHARACTER" && x.holder.id === ch.id);
              return <div key={"m" + i} className="dg-muted sm">📖 {owned ? <>«{m.title}» is on {ch.name}'s shelf</> : <button className="dg-linklike" onClick={() => dispatch({ type: "MINT_BOOK_ITEM", charId: ch.id, by: accountId, title: m.title, topic: m.topic, wiki: m.wiki })}>Add «{m.title}» to the pack</button>}</div>;
            })}
          </div>
        ))}
      </>)}

      <CreditTrail ch={ch} state={state} accountId={accountId} dispatch={dispatch} />
    </div>
  );
}

// ---------------------- Market ----------------------
export function BastionCard({ ch, eligible, onOpen, onBuild }: { ch: CharacterRecord; [k: string]: any }) {
  if (!eligible) return (
    <div className="dg-bastcard muted">
      <div className="dg-bastcard-h"><b>{ch.name}</b> <span className="dg-muted sm">· Level {ch.level || 1}</span></div>
      <div className="dg-muted sm">Not yet — bastions unlock at level 5.</div>
    </div>
  );
  if (!ch.bastion) return (
    <div className="dg-bastcard">
      <div className="dg-bastcard-h"><b>{ch.name}</b> <span className="dg-muted sm">· Level {ch.level} · eligible</span></div>
      <div className="dg-muted sm" style={{ marginBottom: 6 }}>No bastion yet.</div>
      <button className="dg-btn sm" onClick={onBuild}>Build a bastion</button>
    </div>
  );
  const b = ch.bastion;
  const pending = b.turns.filter((t) => !t.resolved);
  const soonest = pending.length ? Math.min(...pending.map((t) => t.readyAt)) : null;
  const busyFacs = b.facilities.filter((f) => f.working != null).length;
  const leisure = bastionLeisure(ch);
  const ready = (leisure || (ch.dt || 0) >= BASTION_TURN_DT) && busyFacs < b.facilities.length;
  const lastResolved = [...b.turns].reverse().find((t) => t.resolved);
  let nudge, on = false;
  if (pending.length) { nudge = <>⏳ {busyFacs} facilit{busyFacs === 1 ? "y" : "ies"} working — ready in <Countdown to={soonest} /></>; }
  else if (leisure && ready) { nudge = "❦ Tend the keep at leisure"; on = true; }
  else if (ready) { nudge = "◆ Ready — take a turn (7 DT)"; on = true; }
  else { nudge = "Bank 7 DT to take the next turn"; }
  return (
    <button className="dg-bastcard live" onClick={onOpen}>
      <div className="dg-bastcard-h"><b>{b.name}</b> <span className="dg-muted sm">· {ch.name} · Lv {ch.level}</span></div>
      <div className={"dg-bastnudge" + (on ? " on" : "")}>{nudge}</div>
      <div className="dg-muted sm">{b.facilities.length} facilit{b.facilities.length === 1 ? "y" : "ies"} · {b.turns.length} turn{b.turns.length === 1 ? "" : "s"} taken{lastResolved ? " · last: " + lastResolved.event : ""}</div>
      {lastResolved && lastResolved.benefits.length > 0 && <div className="dg-muted sm">Last turn: {lastResolved.benefits.slice(0, 2).join("; ")}{lastResolved.benefits.length > 2 ? " +" + (lastResolved.benefits.length - 2) + " more" : ""}</div>}
      <div className="dg-bastcard-open">Open →</div>
    </button>
  );
}

export function BastionAddFacility({ ch, dispatch, accountId }: { dispatch: React.Dispatch<Action>; ch: CharacterRecord; [k: string]: any }) {
  const [defId, setDefId] = useState("");
  const [size, setSize] = useState("cramped");
  const lvl = ch.level || 1;
  const slots = bastionSpecialSlots(lvl);
  const specialUsed = ch.bastion!.facilities.filter((f) => (BASTION_FACILITIES[f.defId] || {}).kind === "special").length;
  const slotsFull = specialUsed >= slots;
  const nextUnlock = lvl < 9 ? 9 : lvl < 13 ? 13 : lvl < 17 ? 17 : null;
  const canPick = (d) => facQualifies(ch, d) && (d.kind !== "special" || !slotsFull);
  const sel = BASTION_FACILITIES[defId];
  const isSpecial = sel && sel.kind === "special";
  const cost = isSpecial ? 0 : bastionSizeCost(size);
  const afford = (ch.gp || 0) >= cost;
  return (
    <div>
      <div className="dg-muted sm" style={{ marginBottom: 6 }}>Special facilities: <b>{specialUsed} of {slots}</b> used{slotsFull ? (nextUnlock ? " — reach level " + nextUnlock + " for another slot" : " — at the cap of 6") : ""}. A special facility comes with the level — no gold, no days, and it arrives at the size its DMG entry prints{isSpecial ? " (" + facPrintedSpace(sel) + " for a " + sel.name + ")" : ""}. Basic facilities are bought: they cost gold and take days. On hand: <b>{ch.gp || 0} gp</b>.</div>
      <div className="dg-bastorderrow">
        <select value={defId} onChange={(e) => setDefId(e.target.value)}>
          <option value="">Add a facility…</option>
          {Object.values(BASTION_FACILITIES).map((d) => {
            const pr = facPrereq(d);
            const reason = lvl < (d.minLevel || 5) ? " (Lv " + d.minLevel + ")"
              : (pr && !facPrereqMet(ch, pr && d) ? " — needs: " + pr.short
              : (d.kind === "special" && slotsFull ? " (no slot)" : ""));
            return <option key={d.id} value={d.id} disabled={!canPick(d)}>{d.name}{d.kind === "special" ? " ✦" : ""}{reason}</option>;
          })}
        </select>
        {!isSpecial && <select value={size} onChange={(e) => setSize(e.target.value)}>{BASTION_SIZES.map((s) => <option key={s} value={s}>{s} — {bastionSizeCost(s)} gp</option>)}</select>}
        <button className="dg-btn ghost sm" disabled={!defId || (sel && !canPick(sel)) || !afford} onClick={() => { dispatch({ type: "ADD_BASTION_FACILITY", charId: ch.id, by: accountId, defId, size }); setDefId(""); }}>{isSpecial ? "Add (free)" : "Add (" + cost + " gp)"}</button>
      </div>
      {defId && !isSpecial && !afford && <div className="dg-muted sm" style={{ color: "var(--maroon)" }}>Not enough gold — a {size} facility costs {cost} gp.</div>}
      {/* DMG: "A special facility might also have a prerequisite the character must meet." The book
          gates on FEATURES — "Expertise in a skill", "Fighting Style feature", "an Arcane Focus OR
          TOOL as a Spellcasting Focus" — not on classes. An Eldritch Knight is a Fighter who
          qualifies; a Bard has Expertise. This app holds `cls` as a bare string and no subclass,
          because it is not a character sheet. So the player says, and the DM checks. */}
      <div className="dg-insp-sec" style={{ marginTop: 12 }}>What {ch.name} can do <span className="dg-muted sm">— some rooms ask. Your sheet is on D&amp;D Beyond; this is your word about it, and your DM can see every claim in your log.</span></div>
      {Object.values(BASTION_PREREQS).filter((pq) => !(pq.implies || []).length || true).map((pq) => {
        const held = (ch.qualifies || []).includes(pq.id);
        const rooms = Object.values(BASTION_FACILITIES).filter((d) => d.prereq === pq.id).map((d) => d.name);
        if (!rooms.length) return null;
        return (
          <label key={pq.id} className="dg-bastorderrow" style={{ gap: 8, alignItems: "flex-start" }}>
            <input type="checkbox" checked={held} onChange={(e) => dispatch({ type: "DECLARE_PREREQ", charId: ch.id, by: accountId, prereq: pq.id, on: e.target.checked })} />
            <span className="dg-muted sm">{pq.ask} <i>({pq.text}.)</i> <b>Opens: {rooms.join(", ")}.</b></span>
          </label>
        );
      })}
      {isSpecial && <div className="dg-muted sm">Arrives <b>{facPrintedSpace(sel)}</b> the moment you take it — the DMG prints that size on its entry, and a special is never smaller. {facEnlargeBenefit(sel)
        ? <>The book lets you enlarge it to vast for {BASTION_ENLARGE["roomy>vast"].gp} gp, gaining {facEnlargeBenefit(sel)}.</>
        : <>The book prints no enlargement for it; you may still buy the floor space from its row below, for looks alone.</>}</div>}
    </div>
  );
}

export function BastionWorkspace({ ch, state, dispatch, accountId, setModal, back, setTab }: { dispatch: React.Dispatch<Action>; state: AppState; ch: CharacterRecord; [k: string]: any }) {
  const b = ch.bastion!;
  const now = useLockExpiry(b);   // fresh clock for gating; re-renders once when a chore/stock lock frees
  const [orders, setOrders] = useState<Record<string, any>>({});
  if (b.abandoned) {
    const isRuin = !!b.fallenLord;                  // a hero fell here — this is a memorial
    const lostKeep = !isRuin && !!b.ruined;         // nobody died; the household simply left
    const fw = bForm(b);
    return (
      <div className="dg-stack">
        {isRuin
          ? <button className="dg-btn ghost sm" onClick={() => setTab ? setTab("retirement") : back()}>← Retirement &amp; memorials</button>
          : <button className="dg-btn ghost sm" onClick={back}>← All bastions</button>}
        <SectionHead eyebrow="Bastion" title={b.name} note={ch.name + (isRuin ? " · a ruin" : lostKeep ? " · lost" : " · abandoned")} />
        {lostKeep && (
          <div className="dg-panel">
            <div className="dg-panel-h">🏚 An empty keep — nobody died here</div>
            <p className="dg-muted"><b>{ch.name}</b> is alive and well. That is rather the problem: they were always somewhere else. After {ch.level} untended weeks the household gave up on them, and then left one at a time until the doors stood open and the road took whatever it wanted.</p>
            <p className="dg-muted sm">There is no memorial to read. Nobody fell. The place simply stopped being a home, one week at a time, while its lord was busy being a hero somewhere more interesting.</p>
            {(b.relics || []).length > 0 && (
              <div className="dg-relics" style={{ marginTop: 8 }}>
                <div className="dg-relics-h">📦 Left inside when the last door closed ({b.relics.length})</div>
                {(b.relics || []).map((r, i) => (
                  <div key={i} className="dg-relic-line"><b>{r.name}</b> <span className="dg-muted sm">· {RARITY[r.rarity] ? RARITY[r.rarity].label : r.rarity}</span>{r.provenance && r.provenance.by ? <span className="dg-muted sm"> · {labelSource(r.provenance.source)} by {r.provenance.by}</span> : null}</div>
                ))}
                <div className="dg-muted sm" style={{ marginTop: 5 }}>Abandoned, per the ALPG: off {ch.name}&rsquo;s sheet for good, and never reacquired unless earned again in play. Not destroyed, though — a permanent item isn&rsquo;t destroyed unless something says so. It is out there. Someone has it, or someday will.</div>
              </div>
            )}
          </div>
        )}
        {isRuin ? (<>
          <div className="dg-panel">
            <div className="dg-panel-h">🕯 A ruin — {b.fallenLord.name}&rsquo;s last keep</div>
            <p className="dg-muted"><b>{b.fallenLord.name}</b> fell while adventuring and never returned. What follows is <b>{b.name}</b> as it was — {(fw ? fw.name + ", " : "")}{b.location ? "in " + b.location + ", " : ""}now still and sealed. Its halls, its chronicle, and whatever was stored here endure. The keep cannot be reclaimed.</p>
            {ch.epitaph && <div className="dg-epitaph">&ldquo;{ch.epitaph}&rdquo;</div>}
            {(b.relics || []).length > 0 && (
              <div className="dg-relics" style={{ marginTop: 8 }}>
                <div className="dg-relics-h">⚔ Relics sealed in the ruin ({b.relics.length})</div>
                {(b.relics || []).map((r, i) => (
                  <div key={i} className="dg-relic-line"><b>{r.name}</b> <span className="dg-muted sm">· {RARITY[r.rarity] ? RARITY[r.rarity].label : r.rarity}</span>{r.provenance && r.provenance.by ? <span className="dg-muted sm"> · {labelSource(r.provenance.source)} by {r.provenance.by}</span> : null} — left here by {b.fallenLord.name}, and here it remains.</div>
                ))}
                <div className="dg-muted sm" style={{ marginTop: 5 }}>Lost to you forever — but a writer who features this ruin may place them for other heroes to find.</div>
              </div>
            )}
          </div>
          <div className="dg-panel">
            <div className="dg-panel-h">The halls that were{fw ? " · " + fw.name : ""}</div>
            {b.facilities.length === 0 ? <div className="dg-muted sm">Nothing was ever raised here.</div> : b.facilities.map((f) => { const def = bDef(f); return (
              <div key={f.id} className="dg-ruinfac">
                <div><button className="dg-facname" onClick={() => setModal({ kind: "facilitydetail", charId: ch.id, facId: f.id })}>{def.name || f.defId}</button> <span className="dg-muted sm">· {f.size}{fw ? " · " + fw.word : ""}{f.building ? " · unfinished" : ""}</span></div>
                <div className="dg-muted sm" style={{ fontStyle: "italic", marginTop: 2 }}>{f.building
                  ? (f.building.what === "enlarge"
                      ? "Half-widened and abandoned — scaffolding still braced against the wall, the work stopped mid-swing and never taken up again."
                      : "The foundations of a hall " + ch.name + " never lived to see — footings laid, timbers stacked, and nothing above them but sky.")
                  : ruinFacilityFlavor(def, fw)}</div>
              </div>
            ); })}
            <div className="dg-muted sm" style={{ marginTop: 5 }}>Tap a hall to read what stood there.</div>
          </div>
          {(b.defenderGraveyard || []).length > 0 && (
            <div className="dg-defgrave-frame">
              <div className="dg-defgrave-h">✝ Fallen defenders ({(b.defenderGraveyard || []).length})</div>
              {(b.defenderGraveyard || []).map((d, i) => (
                <GraveLine key={i} d={d} bastionName={b.name} />
              ))}
            </div>
          )}
          <div className="dg-panel">
            <div className="dg-panel-h">Chronicle of {b.name}</div>
            {b.turns.length === 0 ? <div className="dg-muted sm">No turns were ever taken here.</div> : [...b.turns].reverse().map((t) => (
              <div key={t.n} className="dg-bastturn">
                <div><b>Turn {t.n}</b> <span className="dg-muted sm">· {t.date}{t.resolved ? " · " + t.event : " · left unfinished"}</span></div>
                {t.resolved && t.flavor && <div className="dg-bastflavor">{t.flavor}</div>}
                {t.resolved
                  ? (t.benefits.length === 0 ? <div className="dg-muted sm">• (maintained)</div> : <>{t.benefits.map((bn, i) => <div key={i} className="dg-muted sm">• {bn}</div>)}{(t.mintables || []).map((m: any, i: number) => {
                      const owned = Object.values(state.items).some((x: any) => x.bookItem && x.name === m.title && x.holder && x.holder.type === "CHARACTER" && x.holder.id === ch.id);
                      return <div key={"m" + i} className="dg-muted sm">📖 {owned ? <>«{m.title}» is on {ch.name}'s shelf</> : <button className="dg-linklike" onClick={() => dispatch({ type: "MINT_BOOK_ITEM", charId: ch.id, by: accountId, title: m.title, topic: m.topic, wiki: m.wiki })}>Add «{m.title}» to the pack</button>}</div>;
                    })}</>)
                  : t.orders.map((o, i) => <div key={i} className="dg-muted sm">• {BASTION_ORDERS[o.orderId] ? BASTION_ORDERS[o.orderId].name : o.orderId}{o.detail ? ": " + o.detail : ""} (left unfinished)</div>)}
              </div>
            ))}
          </div>
        </>) : (
          <div className="dg-panel">
            <div className="dg-panel-h">🏚 Abandoned</div>
            <p className="dg-muted">The hirelings have gone and <b>{b.name}</b> was looted after too many untended turns. You can start over — perhaps amid the ruins of the old keep.</p>
            <button className="dg-btn" onClick={() => setModal({ kind: "confirm", title: "Raze " + b.name + "?", body: "This clears the old bastion so you can start a new one.", confirmLabel: "Raze & rebuild", danger: true, action: { type: "RAZE_BASTION", charId: ch.id, by: accountId } })}>Start a new bastion</button>
          </div>
        )}
      </div>
    );
  }
  const setOrder = (facId, patch) => setOrders((o) => ({ ...o, [facId]: { ...o[facId], ...patch } }));
  const freeFacs = b.facilities.filter((f) => f.working == null);
  const chosen = Object.entries(orders).filter(([facId, o]) => {
    if (!o || !o.orderId) return false;
    const fac = b.facilities.find((f) => f.id === facId && f.working == null);
    if (!fac) return false;
    const ord = BASTION_ORDERS[o.orderId];
    if (ord && ord.producesItem && !o.outId) return false;   // craft/harvest need an output chosen
    return true;
  }).map(([facId, o]) => ({ facId, orderId: o.orderId, detail: o.detail, gp: o.gp, outId: o.outId, craftConsumable: !!o.craftConsumable }));
  const leisure = bastionLeisure(ch);
  const enoughDt = leisure || (ch.dt || 0) >= BASTION_TURN_DT;
  const nextN = b.turns.length + 1;
  const turnPending = bastionTurnPending(b);   // same predicate the reducer guards with — one rule, both sides
  const fw = bForm(b);
  const takeTurn = () => { dispatch({ type: "TAKE_BASTION_TURN", charId: ch.id, by: accountId, orders: chosen }); setOrders({}); };
  // DMG: Maintain is issued to the whole Bastion and prohibits every other order that turn.
  // Chores aren't orders, so a Maintain week can still have the household doing its washing.
  const maintainWhole = () => { dispatch({ type: "TAKE_BASTION_TURN", charId: ch.id, by: accountId, maintain: true, orders: [] }); setOrders({}); };
  return (
    <div className="dg-stack">
      <button className="dg-btn ghost sm" onClick={back}>← All bastions</button>
      <SectionHead eyebrow="Bastion" title={b.name} note={(fw ? fw.name + " · " : "") + (b.location ? b.location + " · " : "") + "Built at level " + b.builtAtLevel + " · " + ch.name + " · " + (ch.dt || 0) + " DT on hand"} />
      {leisure && <div className="dg-homebanner">🏡 Now <b>{ch.name}</b>&rsquo;s full-time home — they&rsquo;ve retired here and tend the keep at leisure, so downtime and cadence no longer apply.</div>}
      {/* No happening, but a week in progress: report what the roll said the moment it said it. */}
      {/* A call waits for an answer, and the answer lives where the thing is. BastionAlerts brings you
          here from any screen; these ask. All three kinds are answerable HERE — a summons reaching a
          retired hero is answerable on the retirement page too, because that is where you are when you
          are thinking about them, but a keep is where the rider is actually standing. Same actions,
          same two doors: UNRETIRE_CHARACTER or REFUSE_CALL. */}
      {b.pendingCall && callKind(b) === "summons" && b.pendingCall.by && (
        <div className="dg-summons">
          <div className="dg-summons-h">⚔ A call reaches {ch.name}</div>
          <div className="dg-summons-body">At {b.name}: <i>{b.pendingCall.label}</i> — word travels far. Does {ch.name} take up arms again?</div>
          <div className="dg-row-actions" style={{ marginTop: 8 }}>
            <button className="dg-btn sm" onClick={() => setModal({ kind: "confirm", title: "Answer the call?", body: ch.name + " returns to active play, and any gear still on the shelf comes back to hand.", confirmLabel: "Take up arms", action: { type: "UNRETIRE_CHARACTER", charId: ch.id, by: accountId } })}>Answer it</button>
            <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "confirm", title: "Refuse the call?", body: ch.name + " stays in retirement. The refusal is written into their diary, and the summons clears.", confirmLabel: "Set it aside", action: { type: "REFUSE_CALL", charId: ch.id, by: accountId } })}>Refuse it</button>
          </div>
          {(b.defenders || []).length > 0 && (
            <>
              <div className="dg-muted sm" style={{ marginTop: 8 }}><b>Or send your people in your stead.</b> {ch.name} stays retired. They go. One d6 each, ten or better and they all come home with a purse — less than that and it&rsquo;s done anyway, for half, and one of them doesn&rsquo;t.</div>
              <div className="dg-bastorderrow" style={{ marginTop: 4 }}>
                {Array.from({ length: Math.min((b.defenders || []).length, 12) }, (_, i) => i + 1).map((n) => (
                  <button key={n} className="dg-btn ghost sm" onClick={() => dispatch({ type: "ANSWER_CALL", charId: ch.id, by: accountId, send: n })}>Send {n}</button>
                ))}
              </div>
            </>
          )}
          <div className="dg-muted sm" style={{ marginTop: 6 }}>Answer to return to play, refuse to stay retired, or send your household — either way it becomes part of their story.</div>
        </div>
      )}
      {b.pendingCall && b.pendingCall.kind === "festival" && (
        <div className="dg-summons">
          <div className="dg-summons-h">⚑ {ch.name} is being asked</div>
          <div className="dg-summons-body">At {b.name}: <i>{b.pendingCall.label}</i></div>
          <div className="dg-row-actions" style={{ marginTop: 8 }}>
            <button className="dg-btn sm" disabled={(ch.gp || 0) < (b.pendingCall.cost || 0)} onClick={() => dispatch({ type: "ANSWER_CALL", charId: ch.id, by: accountId, yes: true })}>Seize it ({b.pendingCall.cost} gp)</button>
            <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "ANSWER_CALL", charId: ch.id, by: accountId, yes: false })}>Decline</button>
          </div>
          <div className="dg-muted sm" style={{ marginTop: 6 }}>Seizing buys the keep a name and a second roll on the events table (DMG). Declining costs nothing and nothing else happens.</div>
        </div>
      )}
      {b.pendingCall && b.pendingCall.kind === "aid" && (
        <div className="dg-summons">
          <div className="dg-summons-h">⚑ A rider is at {b.name}&rsquo;s gate</div>
          <div className="dg-summons-body"><i>{b.pendingCall.label}</i></div>
          <div className="dg-bastorderrow" style={{ marginTop: 8 }}>
            {Array.from({ length: Math.min(b.pendingCall.max, 12) }, (_, i) => i + 1).map((n) => (
              <button key={n} className="dg-btn ghost sm" onClick={() => dispatch({ type: "ANSWER_CALL", charId: ch.id, by: accountId, send: n })}>{n}</button>
            ))}
          </div>
          <div className="dg-muted sm" style={{ marginTop: 6 }}>One d6 each; 10 or higher and they all come home with a purse. Less than that and it&rsquo;s solved anyway — for half the purse, and one of them doesn&rsquo;t come back. Everyone you send is somebody who isn&rsquo;t here if the next thing comes up the road.</div>
        </div>
      )}
      {(ch.empowerments || []).length > 0 && (
        <div className="dg-homebanner">
          <div><b>✹ Carried this week</b> <span className="dg-muted sm">— from your bastion. Apply these on your sheet; they lapse on their own.</span></div>
          {(ch.empowerments || []).map((e) => (
            <div key={e.id} className="dg-muted sm" style={{ marginTop: 4 }}>
              <b>{e.name}</b> <span className="dg-muted sm">· {e.from} · lapses after Bastion turn {e.lapsesAfterTurn}</span><br />{e.effect}
            </div>
          ))}
        </div>
      )}
      {!b.happening && (() => {
        const wk = (b.turns || []).find((x) => !x.resolved && x.event);
        if (!wk) return null;
        const quiet = wk.event === "All Is Well";
        return (
          <div className="dg-homebanner" style={quiet ? undefined : { borderColor: "var(--gold)" }}>
            <div><b>{quiet ? "🕊 " : "✦ "}This week: {wk.event}.</b> <span className="dg-muted sm">The roll is in. {wk.frozen ? "The week is on hold." : "Orders resolve in "}{wk.frozen ? "" : <b><Countdown to={wk.readyAt} /></b>}</span></div>
            {wk.eventFlavor && <div className="dg-bastflavor" style={{ marginTop: 4 }}>{wk.eventFlavor}</div>}
            {(wk.benefits || []).map((x, i) => <div key={i} className="dg-muted sm" style={{ marginTop: 3 }}>{x}</div>)}
          </div>
        );
      })()}
      {b.happening && (() => {
        const bt = b.happening, told = bt.beats.slice(0, Math.max(1, bt.shown));
        return (
          <div className="dg-homebanner" style={{ borderColor: "var(--maroon)" }}>
            <div><b>⚔ {b.name} is under attack.</b> <span className="dg-muted sm">{bt.outcome && bt.outcome.waves > 1 ? bt.outcome.waves + " rooms saw them coming — " : ""}it ends in <b><Countdown to={bt.endsAt} /></b>.{bastionFrozenBy(b, "turn") ? " No orders until it does." : bastionFrozenBy(b, "build") ? " No building until it does." : ""}</span></div>
            {told.map((x, i) => <div key={i} className="dg-muted sm" style={{ marginTop: 4, fontStyle: "italic" }}>{x.text}</div>)}
            {bt.shown < bt.beats.length && <div className="dg-muted sm" style={{ marginTop: 4 }}>…</div>}
          </div>
        );
      })()}
      <div className="dg-bastorderrow" style={{ marginTop: -4, marginBottom: 4 }}>
        <span className="dg-muted sm">Form:</span>
        {b.form ? (
          <span className="dg-muted sm"><b>{(bForm(b) || {}).name || b.form}</b>{fw ? " — " + fw.flavor : ""} · <i>chosen for the life of the keep</i></span>
        ) : (
          <>
            <select value="" onChange={(e) => e.target.value && dispatch({ type: "SET_BASTION_FORM", charId: ch.id, by: accountId, form: e.target.value })}>
              <option value="">Plain — choose a form (permanent)…</option>
              {BASTION_FORMS.map((f) => <option key={f.id} value={f.id}>{f.name} — {f.word}s</option>)}
            </select>
            <span className="dg-muted sm">— a form skins every facility, and can&rsquo;t be changed once set</span>
          </>
        )}
      </div>
      <div className="dg-bastorderrow" style={{ marginBottom: 4 }}>
        <span className="dg-muted sm">Defenses:</span>
        {bastionDefenderCap(b) > 0 && <span className="dg-muted sm">🛡 {(b.defenders || []).length} / {bastionDefenderCap(b)} defenders</span>}
        {b.walls
          ? <span className="dg-muted sm">🧱 Defensive Walls encircle the keep — an Attack rolls 4d6 instead of 6d6.</span>
          : b.wallsBuilding
            ? <span className="dg-muted sm">🧱 Walls going up — {b.wallsBuilding.days} days&rsquo; work, ready in <b><Countdown to={b.wallsBuilding.readyAt} /></b>. The ring gives nothing until it closes.</span>
            : <button className="dg-btn ghost sm" disabled={(ch.gp || 0) < BASTION_WALLS_COST || bastionFrozenBy(b, "build")} title={bastionFrozenBy(b, "build") ? "No masons while the keep is under attack" : ""} onClick={() => dispatch({ type: "BUILD_BASTION_WALLS", charId: ch.id, by: accountId })}>Raise Defensive Walls ({BASTION_WALLS_COST} gp, {BASTION_WALLS_DAYS} days)</button>}
        {bastionDefenderCap(b) === 0 && <span className="dg-muted sm">— build a Barracks and Recruit to muster defenders.</span>}
        {bastionHas(b, "armory") && (b.defenders || []).length > 0 && (
          b.armed
            ? <span className="dg-muted sm">⚔ Defenders armed — the next Attack rolls d8s.</span>
            : <button className="dg-btn ghost sm" disabled={(ch.gp || 0) < armoryCost(b)} onClick={() => dispatch({ type: "ARM_BASTION", charId: ch.id, by: accountId })}>Arm defenders ({armoryCost(b)} gp{bastionHas(b, "smithy") ? ", Smithy rate" : ""})</button>
        )}
      </div>
      {(b.defenders || []).length > 0 && (
        <div className="dg-muted sm" style={{ marginTop: 4 }}>
        Every table you check in at takes a bastion turn for you — your hero was demonstrably elsewhere, so the staff simply kept the place running.
        Those weeks count as <b>untended</b>. Come home and give an order (or Maintain the keep deliberately) and the count resets to nothing.
      </div>
      )}
      {(b.defenderGraveyard || []).length > 0 && (
        <div className="dg-defgrave-frame">
          <div className="dg-defgrave-h">✝ Fallen defenders ({(b.defenderGraveyard || []).length}) — remembered by the barracks</div>
          {(b.defenderGraveyard || []).map((d, i) => (
            <GraveLine key={i} d={d} bastionName={b.name} />
          ))}
        </div>
      )}
      {(() => {
        const stored = Object.values(state.items).filter((it) => it.holder.type === "CHARACTER" && it.holder.id === ch.id && it.inPack === false && !it.equipped && !it.available && itemCat(it) && !itemCat(it).mundane && !itemCat(it).consumable);
        if (!stored.length) return null;
        return (
          <div className="dg-relics" style={{ marginTop: 10 }}>
            <div className="dg-relics-h">📦 Stored here ({stored.length})</div>
            {stored.map((it) => { const c = itemCat(it); return <div key={it.id} className="dg-relic-line"><b>{c.name}</b> <span className="dg-muted sm">· {RARITY[c.rarity] ? RARITY[c.rarity].label : c.rarity}</span></div>; })}
            <div className="dg-muted sm" style={{ marginTop: 5 }}>Left at {b.name} and not carried — doesn&rsquo;t count toward the carry limit. If {ch.name} falls, these are sealed here as relics of the ruin.</div>
          </div>
        );
      })()}
      {(() => {
        const others = Object.values(state.characters).filter((c) => c.id !== ch.id && c.bastion && !c.bastion.abandoned);
        const combined = b.combinedWith || [];
        const pending = (state.bastionPacts || []).filter((p) => p.status === "pending" && (p.aChar === ch.id || p.bChar === ch.id));
        if (!others.length && !combined.length && !pending.length) return null;
        const sameAcct = (c) => c.ownerId === ch.ownerId;
        return (
          <div className="dg-bastorderrow" style={{ marginBottom: 4, flexWrap: "wrap" }}>
            <span className="dg-muted sm">Combined with:</span>
            {combined.length === 0 && pending.length === 0 && <span className="dg-muted sm">no one — pool defenders with a keep you play alongside.</span>}
            {combined.map((pid) => { const p = state.characters[pid]; return p ? <span key={pid} className="dg-muted sm">{p.bastion ? p.bastion.name : p.name} <button className="dg-linkbtn" onClick={() => dispatch({ type: "UNCOMBINE_BASTIONS", charId: ch.id, by: accountId, withCharId: pid })}>✕</button></span> : null; })}
            {pending.map((p) => { const oc = state.characters[p.aChar === ch.id ? p.bChar : p.aChar]; return <span key={p.id} className="dg-muted sm" style={{ opacity: .7 }}>⏳ {oc && oc.bastion ? oc.bastion.name : "?"} (awaiting vote)</span>; })}
            <select value="" onChange={(e) => { if (e.target.value) dispatch({ type: "PROPOSE_BASTION_COMBINE", charId: ch.id, by: accountId, withCharId: e.target.value }); }}>
              <option value="">Combine with…</option>
              {others.filter((c) => !combined.includes(c.id) && !pending.some((p) => p.aChar === c.id || p.bChar === c.id)).map((c) => <option key={c.id} value={c.id}>{c.bastion!.name} — {c.name}{sameAcct(c) ? " (your character — instant)" : " (needs their vote)"}</option>)}
            </select>
          </div>
        );
      })()}
      {(b.neglect || 0) > 0 && <div className="dg-bastneglect">⚠ Neglected: <b>{b.neglect} of {ch.level}</b> turns untended. Take a turn to reset it — at {ch.level} the hirelings abandon the keep.</div>}
      <div className="dg-panel">
        <div className="dg-panel-h">Bastion map</div>
        {b.mapImage
          ? <div className="dg-bastmap"><img src={getBlob(b.mapImage)} alt={b.name + " map"} /></div>
          : <div className="dg-bastmap empty">No map yet — draw your keep's layout, then upload it here. This is the bastion diagram your character log calls for.</div>}
        <div className="dg-bastmap-actions">
          <label className="dg-btn ghost sm">{b.mapImage ? "Replace map" : "Upload map image"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files![0]; if (!f) return; const r = new FileReader(); r.onload = () => dispatch({ type: "SET_BASTION_MAP", charId: ch.id, by: accountId, dataURL: r.result as string }); r.readAsDataURL(f); }} />
          </label>
          {b.mapImage && <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "SET_BASTION_MAP", charId: ch.id, by: accountId, dataURL: null })}>Remove</button>}
          <a className="dg-maplink" href="https://www.dungeonscrawl.com/" target="_blank" rel="noreferrer">Build your map free at Dungeon Scrawl ↗</a>
        </div>
      </div>
      <div className="dg-panel">
        <div className="dg-panel-h">Facilities &amp; this turn's orders</div>
        <HousingLine bastion={b} />
        <div className="dg-muted sm" style={{ marginBottom: 8 }}>Issue an order to any free facility, then take the turn. Orders resolve in real time ({REAL_MIN_PER_GAME_DAY} min per in-fiction day). Per AL, <b>no facility may repeat its last order</b> — Maintain included, since it always resolves &ldquo;All is Well.&rdquo; A facility left with <b>no order simply stands idle</b> this turn; nothing is issued on your behalf.</div>
        {b.facilities.map((f) => {
          const def = bDef(f); const o = orders[f.id] || {};
          const ord = o.orderId ? BASTION_ORDERS[o.orderId] : null;
          const wt = facWorkingTurn(ch, f);
          const bld = facBuilding(f, now);
          if (bld) {
            return (
              <div key={f.id} className="dg-bastfac disabled">
                <div><button className="dg-facname" onClick={() => setModal({ kind: "facilitydetail", charId: ch.id, facId: f.id })}>{def.name}</button> <span className="dg-muted sm">· {bld.what === "enlarge" ? f.size + " → " + bld.toSize : f.size}{fw ? " · " + fw.word : ""}</span></div>
                <div className="dg-bastworking">🧱 {bld.what === "enlarge" ? "Being enlarged" : "Going up"} — {bld.days} days&rsquo; work, ready in <b><Countdown to={bld.readyAt} /></b>. No orders until it&rsquo;s finished.</div>
              </div>
            );
          }
          if (facResting(f, nextN) && !wt) {
            return (
              <div key={f.id} className="dg-bastfac disabled">
                <div><button className="dg-facname" onClick={() => setModal({ kind: "facilitydetail", charId: ch.id, facId: f.id })}>{def.name}</button> <span className="dg-muted sm">· {f.size}{fw ? " · " + fw.word : ""}</span></div>
                <div className="dg-bastworking">🌙 Resting this turn — it produces on alternating turns. No orders this turn.</div>
              </div>
            );
          }
          if (facDisabled(f, nextN) && !wt) {
            return (
              <div key={f.id} className="dg-bastfac disabled">
                <div><button className="dg-facname" onClick={() => setModal({ kind: "facilitydetail", charId: ch.id, facId: f.id })}>{def.name}</button> <span className="dg-muted sm">· {f.size}{fw ? " · " + fw.word : ""}</span></div>
                <div className="dg-bastworking">⚠ Shut down after an attack — back in service next turn. No orders this turn.</div>
              </div>
            );
          }
          if (wt) {
            if (wt.frozen) return (
              <div key={f.id} className="dg-bastfac disabled">
                <div><button className="dg-facname" onClick={() => setModal({ kind: "facilitydetail", charId: ch.id, facId: f.id })}>{def.name}</button> <span className="dg-muted sm">· {f.size}{fw ? " · " + fw.word : ""}</span></div>
                <div className="dg-bastworking">⚔ Whatever they were told to do, they are not doing it — the keep is under attack. The week resumes when the fighting stops.</div>
              </div>
            );
            const wo = wt.orders.find((x) => x.facId === f.id);
            // A working room without an order line of its own is on a Maintain turn — the DMG issues
            // Maintain "to the whole Bastion rather than to one or more special facilities", so there
            // is no per-facility order to name. Never index wo blind: it is legitimately absent here.
            const wlabel = wo ? ((BASTION_ORDERS[wo.orderId] || {}).name || wo.orderId) : BASTION_ORDERS.maintain.name;
            return (
              <div key={f.id} className="dg-bastfac working">
                <div><button className="dg-facname" onClick={() => setModal({ kind: "facilitydetail", charId: ch.id, facId: f.id })}>{def.name}</button> <span className="dg-muted sm">· {f.size}{fw ? " · " + fw.word : ""}</span></div>
                <div className="dg-bastworking">⏳ {wlabel} in progress — ready in <b><Countdown to={wt.readyAt} /></b></div>
              </div>
            );
          }
          return (
            <div key={f.id} className="dg-bastfac">
              <div><button className="dg-facname" onClick={() => setModal({ kind: "facilitydetail", charId: ch.id, facId: f.id })}>{def.name}</button> <span className="dg-muted sm">· {f.size}{fw ? " · " + fw.word : ""}{def.kind === "basic" ? " · basic" : ""}{f.lastOrder ? " · last: " + BASTION_ORDERS[f.lastOrder].name : ""}</span></div>
              <div className="dg-muted sm">{def.note}</div>
              {def.kind === "basic" && <div className="dg-muted sm">🕯 The household lives here — their week writes itself into the turn log when the turn resolves.</div>}
              <div className="dg-bastorderrow">
                {def.kind !== "basic" && (
                <select value={o.orderId || ""} disabled={bastionFrozenBy(b, "turn")} title={bastionFrozenBy(b, "turn") ? "No orders while the keep is under attack" : ""} onChange={(e) => setOrder(f.id, { orderId: e.target.value })}>
                  <option value="">— no order this turn —</option>
                  {def.orders.map((oid) => <option key={oid} value={oid} disabled={f.lastOrder === oid}>{BASTION_ORDERS[oid].name}{f.lastOrder === oid ? " (did last turn)" : ""}</option>)}
                </select>
                )}
                {ord && ord.producesItem && (<>
                  <select value={o.outId || ""} onChange={(e) => { const c = bOutputs(def, o.orderId).find((x) => x.id === e.target.value); setOrder(f.id, { outId: e.target.value, detail: c ? c.label : "", craftConsumable: false }); }}>
                    <option value="">— choose {ord.name === "Harvest" ? "what to harvest" : "what to craft"} —</option>
                    {bOutputs(def, o.orderId).map((c) => { const locked = (c.minLevel || def.minLevel || 5) > (ch.level || 1); return <option key={c.id} value={c.id} disabled={locked}>{c.label}{locked ? " (Lv " + (c.minLevel || def.minLevel) + ")" : ""}</option>; })}
                  </select>
                  {(() => { const c = bOutputs(def, o.orderId).find((x) => x.id === o.outId); if (!c || !c.magic) return null; return (
                    <label className="dg-muted sm" title="You name the finished item when the week resolves; a DM at your store verifies it against your book. Consumables (potions, scrolls) cost half materials — DMG ch. 7.">
                      <input type="checkbox" checked={!!o.craftConsumable} onChange={(e) => setOrder(f.id, { craftConsumable: e.target.checked })} /> consumable (potion/scroll — half materials)
                    </label>
                  ); })()}
                </>)}
                {ord && !ord.producesGp && !ord.producesItem && <input type="text" placeholder="detail (optional log note)" value={o.detail || ""} onChange={(e) => setOrder(f.id, { detail: e.target.value })} />}
              </div>
              {facStockedThisTurn(f, b.turns.length + 1) && (
                <div className="dg-muted sm" style={{ marginTop: 2, fontStyle: "italic" }}>
                  {facStockLocked(f, now)
                    ? "They are doing it now — a day of it, and the room is no use to anybody until it's done."
                    : "It changed over this week, so it takes no order. You commission the work or you use the room; never both."}
                </div>
              )}
              {ord && ord.producesGp && <div className="dg-muted sm">Trade earns <b>{bastionTradeIncome(ch.level || 1, f.size)} gp</b> automatically when it resolves — scales with your level{f.size !== "cramped" ? " and this facility's size" : ""}. (Sample figures.)</div>}
              {f.size !== "vast" && (() => {
                const next = BASTION_SIZES[BASTION_SIZES.indexOf(f.size) + 1];
                const step = BASTION_ENLARGE[f.size + ">" + next];   // the enlarge table is the rule — never re-derive it from the add table
                if (!step) return null;
                const ben = facEnlargeBenefit(def);
                return (
                  <div style={{ marginTop: 6 }}>
                    <button className="dg-btn ghost sm" disabled={(ch.gp || 0) < step.gp || bastionFrozenBy(b, "build")} title={bastionFrozenBy(b, "build") ? "No masons while the keep is under attack" : (ch.gp || 0) < step.gp ? "Not enough gold" : ""} onClick={() => dispatch({ type: "ENLARGE_BASTION_FACILITY", charId: ch.id, by: accountId, facId: f.id, size: next })}>Enlarge to {next} ({step.gp} gp, {step.days} days)</button>
                    <div className="dg-muted sm" style={{ marginTop: 2 }}>{ben
                      ? <>DMG — a Vast {def.name.toLowerCase()} gains {ben}.</>
                      : <><b>Cosmetic only — no game effect.</b> A grander room and nothing else: no extra dice, hirelings, capacity or income. The book prints no enlargement for this facility; the Exchange lets you buy the floor space anyway.</>}</div>
                  </div>
                );
              })()}
            </div>
          );
        })}
        <div className="dg-bastturnbar">
          <span className="dg-muted sm">A turn costs {BASTION_TURN_DT} DT{chosen.length > 0 ? " · " + chosen.length + " order" + (chosen.length === 1 ? "" : "s") + " queued" : ""}{freeFacs.length === 0 ? " · all facilities busy" : ""}</span>
          <button className="dg-btn" disabled={!enoughDt || chosen.length === 0 || turnPending} title={turnPending ? "This week isn't over yet — wait for the turn in progress to resolve" : ""} onClick={takeTurn}>{leisure ? "❦ Tend the keep" : "Take a turn (7 DT)"}</button>
          <button className="dg-btn ghost" disabled={!enoughDt || chosen.length > 0 || turnPending} title={turnPending ? "This week isn't over yet — wait for the turn in progress to resolve" : chosen.length > 0 ? "Maintain is issued to the whole bastion — it can't share a turn with other orders" : "Spend the week on the keep itself: no events, nothing left to chance"} onClick={maintainWhole}>🛠 Maintain the whole keep</button>
        </div>
        {turnPending && <div className="dg-muted sm">⏳ The keep is living this week already — the next turn opens when it resolves.</div>}
        {leisure && <div className="dg-muted sm" style={{ color: "var(--maroon)" }}>❦ In retirement — the keep runs at leisure. No downtime cost, no waiting on cadence; it builds only from the gold it earns.</div>}
        {!leisure && !enoughDt && <div className="dg-muted sm" style={{ color: "var(--maroon)" }}>Not enough downtime for a turn — needs {BASTION_TURN_DT} DT.</div>}
        <div className="dg-muted sm" style={{ marginTop: 6 }}>{chosen.length > 0
          ? <>Working the facilities means your hands are elsewhere — the world gets its roll on the events table this turn.</>
          : <><b>Maintain</b> is a whole-keep order: it can&rsquo;t share a turn with any other, and it always returns &ldquo;All is Well.&rdquo; Take a turn with no orders at all and the keep maintains itself while you&rsquo;re away. <span style={{ opacity: .75 }}>(House rule &mdash; this app&rsquo;s own: the sources conflict on when events roll, and the Exchange&rsquo;s reading is that a hero at home tending the keep keeps it safest.)</span></>}</div>
      </div>
      <div className="dg-panel">
        <div className="dg-panel-h">Expand the bastion</div>
        <div className="dg-muted sm" style={{ marginBottom: 8 }}>{buildBudgetOpen(b)
          ? <>First build (AL): <b>{buildBudgetLeft(b)} of {buildBudgetTotal(b) || (b.builtAtLevel || 5) * 20} days</b> left — 20 × your level, for adding basics/features and enlarging. Work inside it is done the moment you raise it. <b>The window closes when you take your first Bastion turn</b>; after that, building takes real time.</>
          : <>First build closed — this keep is running. Raising or enlarging a facility now takes real time ({REAL_MIN_PER_GAME_DAY} min per in-fiction day), like any other order.</>}</div>
        <BastionAddFacility ch={ch} dispatch={dispatch} accountId={accountId} />
      </div>
      <div className="dg-panel">
        <div className="dg-panel-h">Turn history</div>
        {(() => {
          const rows = [
            ...b.turns.map((t) => ({ k: "turn", at: t.issuedAt || 0, t })),
            ...(b.chronicle || []).map((c) => ({ k: "work", at: c.at || 0, c })),
          ].sort((x, y) => (y.at || 0) - (x.at || 0));
          if (!rows.length) return <div className="dg-muted sm">No turns taken yet.</div>;
          return rows.map((r) => r.k === "turn" ? (
            <div key={"t" + r.t.n} className="dg-bastturn">
              <div><b>Turn {r.t.n}</b> <span className="dg-muted sm">· {r.t.date} · −{r.t.dtSpent} DT · {r.t.resolved ? "event: " + r.t.event : r.t.frozen ? "⚔ " + r.t.event + " — the week is on hold until the fighting stops" : <>⏳ resolving — ready in <Countdown to={r.t.readyAt} /></>}</span></div>
              {r.t.resolved && r.t.flavor && <div className="dg-bastflavor">{r.t.flavor}</div>}
              {r.t.resolved
                ? (r.t.benefits.length === 0 ? <div className="dg-muted sm">• (maintained)</div> : r.t.benefits.map((bn, i) => <div key={i} className="dg-muted sm">• {bn}</div>))
                : r.t.orders.map((o, i) => <div key={i} className="dg-muted sm">• {BASTION_ORDERS[o.orderId] ? BASTION_ORDERS[o.orderId].name : o.orderId}{o.detail ? ": " + o.detail : ""} (pending)</div>)}
              {r.t.resolved && <HouseholdStory turn={r.t} />}
            </div>
          ) : (
            <div key={"w" + r.c.id} className="dg-bastturn">
              <div><b>⚒ Works</b> <span className="dg-muted sm">· {r.c.date} · event: {r.c.text}</span></div>
            </div>
          ));
        })()}
      </div>
    </div>
  );
}

// Every keep this account owns that is mid-something, on every screen. Read-only and one tap deep:
// the decisions live where the thing is, the same as REFUSE_CALL does on the retirement page.
// What a country is like, computed from the table it actually rolls on rather than described in a
// string somebody wrote once. If a multiplier changes, this changes. If it says the Silver Marches
// are dangerous, that is because REGION_WEIGHTS says so, not because a copywriter did.
export function regionCharacter(regionId) {
  const pool = regionalEvents(regionId);
  const tot = pool.reduce((n, e) => n + e.weight, 0);
  const share = (f) => pool.filter(f).reduce((n, e) => n + e.weight, 0) / tot;
  const base = BASTION_EVENTS.reduce((n, e) => n + e.weight, 0);
  const baseShare = (f) => BASTION_EVENTS.filter(f).reduce((n, e) => n + e.weight, 0) / base;
  const h = share(evIsHostile), hb = baseShare(evIsHostile);
  const f = share((e) => evHostility(e) === "friendly"), fb = baseShare((e) => evHostility(e) === "friendly");
  const rel = (a, b) => (a > b * 1.5 ? 2 : a > b * 1.15 ? 1 : a < b * 0.55 ? -2 : a < b * 0.85 ? -1 : 0);
  return {
    hostile: h, friendly: f,
    danger: rel(h, hb), welcome: rel(f, fb),
    dangerWord: ["a quiet country", "quieter than most", "the ordinary run of things", "rougher than most", "a dangerous country"][rel(h, hb) + 2],
    welcomeWord: ["almost nobody comes", "few callers", "callers enough", "a busy gate", "a very busy gate"][rel(f, fb) + 2],
    ownCast: BASTION_EVENTS.some((e) => !!EVENT_CAST[e.id + "@" + regionId]),
    ownFair: !!FESTIVAL_FEATURES[regionId],
    baseline: !REGION_WEIGHTS[regionId] || !Object.keys(REGION_WEIGHTS[regionId]).length,
  };
}

// Where the keep stands, and the one control that changes it. Read-only until you click, because a
// region is not something you fiddle with — it is where the house IS. Changing it changes the weather
// and nothing else: no facility moves, no gold moves, nobody dies. See SET_BASTION_REGION.
export function BastionRegionLine({ b, ch, dispatch, accountId }: { dispatch: React.Dispatch<Action>; ch: CharacterRecord; [k: string]: any }) {
  const [open, setOpen] = useState(false);
  if (!b) return null;
  const mine = ch && ch.ownerId === accountId && !b.abandoned;
  const here = BASTION_REGIONS.find((x) => x.id === b.region);
  if (!open) {
    return (
      <div className="dg-muted sm" style={{ marginTop: 2 }}>
        {here
          ? <>Standing in <b>{here.name}</b>, which decides who turns up at the gate.</>
          : <>No region recorded — the gate sees the ordinary run of the Realms.</>}
        {mine && <> <button className="dg-btn ghost sm" style={{ marginLeft: 6, padding: "0 6px" }} onClick={() => setOpen(true)}>{here ? "change" : "set it"}</button></>}
      </div>
    );
  }
  return (
    <div className="dg-summons" style={{ marginTop: 6 }}>
      <div className="dg-summons-h">Where does {b.name} stand?</div>
      <div className="dg-summons-body">
        The house does not move. What it means to live there does — different country, different
        weather. More riders, or fewer, or a different sort of trouble at the gate entirely.
      </div>
      <label className="dg-field" style={{ marginTop: 6 }}>
        <select value={b.region || ""} onChange={(e) => { dispatch({ type: "SET_BASTION_REGION", charId: ch.id, by: accountId, region: e.target.value || null }); setOpen(false); }}>
          <option value="">Nowhere in particular — the ordinary Realms</option>
          {BASTION_REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.note}</option>)}
        </select>
      </label>
      {b.region && <RegionSummary regionId={b.region} />}
      <div className="dg-row-actions" style={{ marginTop: 6 }}>
        <button className="dg-btn ghost sm" onClick={() => setOpen(false)}>Leave it</button>
      </div>
    </div>
  );
}

export function RegionSummary({ regionId }) {
  const r = BASTION_REGIONS.find((x) => x.id === regionId);
  if (!r) return null;
  const c = regionCharacter(regionId);
  const dot = (n) => (n > 0 ? "▲" : n < 0 ? "▼" : "·");
  return (
    <div className="dg-muted sm" style={{ marginTop: 4, lineHeight: 1.6 }}>
      <b>{r.name}</b> — {c.baseline ? "the baseline. Everywhere else is measured against it." : c.dangerWord + ", and " + c.welcomeWord + "."}
      <br />
      <span style={{ opacity: 0.8 }}>
        {dot(c.danger)} trouble at the gate <b>{(100 * c.hostile).toFixed(0)}%</b> of rolls
        {"  ·  "}{dot(c.welcome)} someone welcome <b>{(100 * c.friendly).toFixed(0)}%</b>
        {c.ownCast ? "  ·  its own people" : ""}{c.ownFair ? "  ·  its own festival" : ""}
      </span>
    </div>
  );
}

export function BastionAlerts({ state, accountId, goBastion }: { state: AppState; [k: string]: any }) {
  const mine = Object.values(state.characters).filter((c) => c.ownerId === accountId && c.bastion && !c.bastion.ruined);
  const live = mine.filter((c) => c.bastion!.happening || c.bastion!.pendingCall);
  if (!live.length) return null;
  return (
    <>
      {live.map((c) => {
        const b = c.bastion!, h = b.happening, call = b.pendingCall;
        if (h) {
          const told = h.beats.slice(0, Math.max(1, h.shown));
          const last = told[told.length - 1];
          const hot = h.kind === "attack";
          return (
            <button key={c.id} className="dg-summons" style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", borderColor: hot ? "var(--maroon)" : undefined }} onClick={() => goBastion(c.id)}>
              <div className="dg-summons-h">{hot ? "⚔" : h.kind === "festival" ? "✦" : "🐎"} {b.name}{hot ? " is under attack" : h.kind === "festival" ? " is hosting" : " sent people out"}</div>
              <div className="dg-summons-body"><i>{last ? last.text : "It has begun."}</i></div>
              <div className="dg-muted sm" style={{ marginTop: 6 }}>{c.name} · ends in <b><Countdown to={h.endsAt} /></b>{bastionFrozenBy(b, "turn") ? " · nothing else happens until it does" : bastionFrozenBy(b, "build") ? " · no building until it does" : ""} · tap to watch</div>
            </button>
          );
        }
        return (
          <button key={c.id} className="dg-summons" style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer" }} onClick={() => goBastion(c.id)}>
            <div className="dg-summons-h">{callKind(b) === "summons" ? "⚔" : "⚑"} {c.name} is being asked</div>
            <div className="dg-summons-body">At {b.name}: <i>{call.label}</i></div>
            <div className="dg-muted sm" style={{ marginTop: 6 }}>It waits for an answer. Tap to give one.</div>
          </button>
        );
      })}
    </>
  );
}

// One stone in the graveyard, shared by both places that list the fallen — and it now speaks the bonds.
export function GraveLine({ d, bastionName }) {
  return (
    <div className="dg-defgrave-line">
      <b>{d.name}</b> <span className="dg-muted sm">({[d.role, d.age ? "age " + d.age : null].filter(Boolean).join(", ")})</span> — {d.cause || ("died in defense of " + bastionName)}{d.fellOn ? ", " + d.fellOn : d.turn ? ", turn " + d.turn : ""}.
      {d.rememberedBy ? <span className="dg-defgrave-rem"> {d.rememberedBy}</span> : null}
    </div>
  );
}

export function BastionView({ state, accountId, dispatch, setModal, bastionTarget, clearTarget, setTab }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  // No clock here any more. Holding it at the top of this screen re-rendered every facility, turn, and
  // furnishing once a second just to tick one number — which is exactly what jammed a busy keep. Each
  // countdown now owns its own clock (Countdown), so only the ticking text redraws; the workspace
  // schedules a single re-render when a chore/stock lock frees (useLockExpiry).
  const [selId, setSelId] = useState(null);
  // The 1-Hz tick lives at the ROOT now — the keep has to run on every screen, not only this one.
  // This component only needs `now` to draw countdowns, and takes it from above.
  useEffect(() => {
    if (!bastionTarget) return;
    const tc = state.characters[bastionTarget];
    if (tc && tc.bastion) setSelId(bastionTarget);   // has a bastion → jump into it; otherwise land on the overview to build
    if (clearTarget) clearTarget();
  }, [bastionTarget]);
  const player = state.players[accountId];
  const chars = player ? player.characterIds.map((id) => state.characters[id]).filter((c) => c && c.status !== "dead") : [];   // a fallen hero's ruin lives in the memorial, not here
  const sel = selId ? state.characters[selId] : null;
  if (sel && sel.bastion) return <BastionWorkspace ch={sel} state={state} dispatch={dispatch} accountId={accountId} setModal={setModal} setTab={setTab} back={() => setSelId(null)} />;
  return (
    <div className="dg-stack">
      <SectionHead eyebrow="Downtime" title="Bastions" note="A stronghold that grows between sessions. Level 5+ characters can build one; each Bastion turn spends 7 downtime days and resolves in real time." />
      {chars.length === 0 && <Empty title="No characters yet" body="Create a character on your roster, then build a bastion once they reach level 5." />}
      <div className="dg-baststack">
        {chars.map((ch) => <BastionCard key={ch.id} ch={ch} eligible={bastionEligible(ch)} onOpen={() => setSelId(ch.id)} onBuild={() => setModal({ kind: "bastionbuild", charId: ch.id })} />)}
      </div>
    </div>
  );
}

export function FacilityDetailModal({ modal, state, dispatch, accountId, close, setModal }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const ch = state.characters[modal.charId];
  const fac = ch && ch.bastion ? ch.bastion.facilities.find((f) => f.id === modal.facId) : null;
  const [desc, setDesc] = useState(fac ? (fac.description || "") : "");
  const [fnote, setFnote] = useState("");
  const [fgp, setFgp] = useState("");
  const [hname, setHname] = useState("");
  const [hrole, setHrole] = useState("");
  const [hnote, setHnote] = useState("");
  if (!fac) return (<><h3 className="dg-modal-h">Facility not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  const def = bDef(fac);
  const frozen = !!(ch && (ch.status === "dead" || (ch.bastion && ch.bastion.abandoned)));
  const rform = bForm(ch.bastion);
  const furnishings = fac.furnishings || [];
  const furnTotal = furnishings.reduce((n, x) => n + (x.gp || 0), 0);
  const archiveTitle = fac.defId === "archive" ? (sub: string) => (fac as any).bookTitle && (fac as any).book === sub ? (fac as any).bookTitle : composeArchiveTitle(mkRng(((ch.bastion && ch.bastion.id) || "b") + ":" + fac.id + ":" + sub), (rform && rform.id) || "keep", (() => { const rp = (ch.bastion && ch.bastion.region && ARCHIVE_LORE_BY_REGION[ch.bastion.region]) || []; const bs = rp.filter((e: any) => e.k.includes(sub)); return { topics: bs.length ? bs : rp }; })()) : null;
  const fgpN = Math.max(0, +fgp || 0);
  const addFurnish = () => { dispatch({ type: "ADD_FACILITY_FURNISHING", charId: ch.id, by: accountId, facId: fac.id, note: fnote, gp: fgpN }); setFnote(""); setFgp(""); };
  return (
    <>
      <h3 className="dg-modal-h">{def.name} <span className="dg-muted sm">· {fac.size}{def.kind === "basic" ? " · basic" : " ✦"}{frozen ? " · a ruin" : ""}</span></h3>
      {fac.defId === "archive" && archiveTitle && !frozen && (
        <div className="dg-lane">
          <div className="dg-lane-h">Reference book <span className="dg-free">chosen once</span></div>
          {fac.book
            ? <div className="dg-muted sm">📖 <b>{(fac as any).bookTitle || archiveTitle(fac.book)}</b> — {ARCHIVE_BOOK_SUBJECT_LABEL[fac.book]}. Its study benefit is the DM's to grant while you and the book are home (DMG).</div>
            : <div className="dg-chips">{ARCHIVE_BOOK_SUBJECTS.map((sub) => (
                <button key={sub} className="dg-chip" title={archiveTitle(sub)} onClick={() => dispatch({ type: "SET_ARCHIVE_BOOK", charId: ch.id, facId: fac.id, subject: sub, by: accountId })}>{ARCHIVE_BOOK_SUBJECT_LABEL[sub]}</button>
              ))}</div>}
        </div>
      )}
      <p className="dg-muted sm">{def.note}</p>
      {frozen && <div className="dg-epitaph" style={{ marginTop: 6 }}>{ruinFacilityFlavor(def, rform)}</div>}

      <div className="dg-insp-sec">The space</div>
      <div className="dg-muted sm">{BASTION_SIZE_INFO[fac.size] || fac.size}{!frozen && fac.size !== "vast" ? " Enlarge it from the facility row to gain room." : ""}</div>
      {sizeFlavorFor(fac.defId, rform && rform.id, fac.size) && <div className="dg-bastflavor" style={{ marginTop: 4 }}>{sizeFlavorFor(fac.defId, rform && rform.id, fac.size)}</div>}
      {bForm(ch.bastion) && <div className="dg-muted sm" style={{ marginTop: 4 }}>Part of a <b>{bForm(ch.bastion)?.name}</b> — this is one of its {bForm(ch.bastion)?.word}s, amid {bForm(ch.bastion)?.flavor}.</div>}

      <div className="dg-insp-sec">Description</div>
      {frozen
        ? (desc ? <div className="dg-muted sm" style={{ whiteSpace: "pre-wrap" }}>{desc}</div> : <div className="dg-muted sm">No description was ever set down for this space.</div>)
        : <textarea className="dg-facdesc" rows={3} value={desc} placeholder="Describe this space — what it looks like, who works here, its character…" onChange={(e) => setDesc(e.target.value)} onBlur={() => dispatch({ type: "SET_FACILITY_DESCRIPTION", charId: ch.id, by: accountId, facId: fac.id, text: desc })} />}

      {!frozen && (BASTION_FACILITIES[fac.defId] || {}).kind === "special" && (() => {
        // ALPG says the action exists ("You may rebuild a Bastion facility with a new one. Existing
        // facilities with unresolved orders may not be rebuilt."); the DMG says what it takes
        // ("Each time a character gains a level ... replace one of their Bastion's special facilities
        // with another for which the character qualifies"). Least permissive: one special, once a level.
        const busy = fac.working != null || !!fac.building;
        const spent = (ch.bastion!.rebuiltAtLevel || 0) === (ch.level || 1);
        const options = Object.values(BASTION_FACILITIES).filter((d) => d.kind === "special" && d.id !== fac.defId && (ch.level || 1) >= (d.minLevel || 5));
        const days = bastionSizeDays(fac.size);
        return (
          <>
            <div className="dg-insp-sec">Rebuild it as something else <span className="dg-muted sm">— AL allows the swap; the DMG sets the terms: one special facility, once per level gained. It costs no gold. It costs the room.</span></div>
            {busy
              ? <div className="dg-muted sm">Not while there&rsquo;s work outstanding here — finish it first (ALPG).</div>
              : spent
                ? <div className="dg-muted sm">You&rsquo;ve already made your swap at level {ch.level}. The next one comes with the next level (DMG).</div>
                : (<>
                    {(fac.henchmen || []).length > 0 && (
                      <div className="dg-muted sm" style={{ color: "var(--maroon)", marginBottom: 5 }}>
                        ⚠ {(fac.henchmen || []).map((h) => h.name).join(", ")} {(fac.henchmen || []).length === 1 ? "is" : "are"} paid by this room. If you&rsquo;ve another {(BASTION_FACILITIES[fac.defId] || {}).name.toLowerCase()} with a post free they&rsquo;ll walk across; otherwise they go. Everything written about this space goes with it.
                      </div>
                    )}
                    <div className="dg-muted sm" style={{ marginBottom: 5 }}>It will take <b>{days} days</b> — the same as raising the room in the first place. It can&rsquo;t work while it&rsquo;s a building site.</div>
                    <select value="" onChange={(e) => { if (e.target.value) dispatch({ type: "REBUILD_FACILITY", charId: ch.id, by: accountId, facId: fac.id, defId: e.target.value }); }}>
                      <option value="">Rebuild it as…</option>
                      {options.map((d) => <option key={d.id} value={d.id}>{d.name} ✦</option>)}
                    </select>
                  </>)}
          </>
        );
      })()}

      {!frozen && facilityDormant(fac) && (
        <div className="dg-bastneglect" style={{ marginTop: 8 }}>🚪 <b>Dormant.</b> There is nothing in this room. It can&rsquo;t take an order until something is put back — a smithy with no forge is a shed.</div>
      )}
      <div className="dg-insp-sec">{frozen ? "What still lies here" : "Furnishings"} <span className="dg-muted sm">{frozen ? "— the remains of daily life" : "— the room came with these (DMG). Gold only makes them finer; nothing works better for being beautiful."}</span></div>
      {furnishings.length === 0
        ? <div className="dg-muted sm">{frozen ? "The room stands bare — stripped, or never furnished." : "Nothing here yet."}</div>
        : furnishings.map((x) => {
            const tier = FURNISHING_TIER_BY_ID[x.tier || "basic"] || FURNISHING_TIERS[0];
            const next = furnNextTier(x.tier);
            const backCost = x.gone ? furnishingValue(fac, { slot: x.slot, tier: "basic" }) : 0;
            return (
              <div key={x.id} className={"dg-furnrow" + (x.gone ? " gone" : "")}>
                <div>
                  <b>{x.name || x.note || x.slot}</b> {x.gone
                    ? <span className="dg-furntier t-gone">Sold</span>
                    : x.slot
                      ? <span className={"dg-furntier t-" + (x.tier || "basic")}>{tier.label}</span>
                      : <span className="dg-furntier t-keepsake">Keepsake</span>}
                  {x.gp > 0 ? <span className="dg-muted sm"> · {x.gp} gp</span> : null}
                </div>
                <div className="dg-muted sm" style={{ fontStyle: "italic", marginTop: 2 }}>{x.gone ? "Gone. There's a clean patch on the floor where it stood." : (x.note || tier.note)}</div>
                {!frozen && x.gone && (
                  <div className="dg-furnactions">
                    <button className="dg-btn ghost sm" disabled={(ch.gp || 0) < backCost} title={"Buy a plain replacement — " + backCost + " gp. You sold it for half of that."} onClick={() => dispatch({ type: "REFURNISH", charId: ch.id, by: accountId, facId: fac.id, furnId: x.id })}>Replace it ({backCost} gp)</button>
                  </div>
                )}
                {!frozen && !x.gone && (
                  <div className="dg-furnactions">
                    <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "furnishing", charId: ch.id, facId: fac.id, furnId: x.id })}>✎ Describe</button>
                    {x.slot ? (<>
                    {next
                      ? <button className="dg-btn ghost sm" disabled={(ch.gp || 0) < next.gp} title={"Replace it with something " + next.label.toLowerCase() + " — " + next.gp + " gp (the DMG's Art Object tier)"} onClick={() => setModal({ kind: "furnishing", charId: ch.id, facId: fac.id, furnId: x.id, upgrade: true })}>↑ {next.label} ({next.gp} gp)</button>
                      : <span className="dg-muted sm">Nothing finer exists.</span>}
                    {(
                      <button className="dg-btn ghost sm" title={
                        // NB: a Serviceable piece has nothing under it — selling it takes it away entirely.
                        // (This is why furnTierIndex(x.tier) - 1 must never be indexed blind: it's -1 here.)
                        (furnPrevTier(x.tier)
                          ? "Sell it down to " + furnPrevTier(x.tier)?.label
                          : "Sell it out of the room entirely — there's nothing plainer underneath")
                        + " — half of what it's worth"
                        + (bastionHas(ch.bastion, "storehouse") ? ", improved by your Storehouse" : "; no factor here to argue for you")
                      } onClick={() => dispatch({ type: "SELL_FURNISHING", charId: ch.id, by: accountId, facId: fac.id, furnId: x.id })}>↓ Sell ({furnishingSaleValue(ch, fac, x)} gp)</button>
                    )}
                    </>) : (
                      <button className="dg-btn ghost sm" title="Take this keepsake out of the room — it's yours, and you can put it away again any time" onClick={() => dispatch({ type: "REMOVE_FACILITY_FURNISHING", charId: ch.id, by: accountId, facId: fac.id, furnId: x.id })}>✕ Remove</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

      {!frozen && (
        <div className="dg-addfurn" style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input value={fnote} maxLength={240} onChange={(e) => setFnote(e.target.value)}
            placeholder="Add a keepsake — a shrine, a trophy, a carved figure…"
            style={{ flex: "1 1 220px", minWidth: 150 }} />
          <input value={fgp} type="number" min={0} onChange={(e) => setFgp(e.target.value)}
            placeholder="gp" title="What it cost you, if anything — leave blank for a thing made or given"
            style={{ width: 72 }} />
          <button className="dg-btn sm" disabled={!fnote.trim() || fgpN > (ch.gp || 0)}
            title={fgpN > (ch.gp || 0) ? "You don't have that much gold" : "Add this keepsake to the room — it costs the gold you put into it, and nothing if you put in none"}
            onClick={addFurnish}>+ Add keepsake</button>
        </div>
      )}

      {(facEstablishment(fac) > 0 || (fac.henchmen || []).length > 0) && (<>
      <div className="dg-insp-sec">The people here <span className="dg-muted sm">— they came with the room, and the room pays them (DMG). {facEstablishment(fac)} {facEstablishment(fac) === 1 ? "post" : "posts"}{(fac.henchmen || []).length < facEstablishment(fac) ? " · " + (facEstablishment(fac) - (fac.henchmen || []).length) + " unfilled" : ""}</span></div>
      {(fac.henchmen || []).length === 0
        ? <div className="dg-muted sm">{frozen ? "Nobody works here now." : "Nobody is left. Take an active turn and word will get round that there's a post going."}</div>
        : (fac.henchmen || []).map((h) => (
          <div key={h.id} className="dg-admin-row">
            <span><b>{h.name}</b>{h.role ? <span className="dg-muted sm"> · {h.role}</span> : null}{h.note ? <span className="dg-muted sm"> — {h.note}</span> : null}</span>
            {!frozen && <button className="dg-btn ghost sm" title="Give them a name and a life — the DMG says that part's yours" onClick={() => setModal({ kind: "hireling", charId: ch.id, facId: fac.id, henchId: h.id })}>✎ Name</button>}
          </div>
        ))}
      {!frozen && (fac.henchmen || []).length < facEstablishment(fac) && (
        <div className="dg-muted sm" style={{ marginTop: 4, color: "var(--maroon)" }}>Short-handed. Each turn you actually take, one more post gets filled.</div>
      )}
      </>)}
      {def.id === "bedroom" && !frozen && (() => {
        const cap = BASTION_BEDS_BY_SIZE[fac.size] || 2;
        const people: any[] = [{ id: ch.id, name: ch.name, role: "the hero", hero: true }];
        (ch.bastion!.facilities || []).forEach((f) => { if ((BASTION_FACILITIES[f.defId] || {}).kind === "special") (f.henchmen || []).forEach((h) => people.push(h)); });
        const here = new Set(fac.occupants || []);
        const bedroomOf = (hid) => (ch.bastion!.facilities || []).find((f) => f.defId === "bedroom" && (f.occupants || []).includes(hid));
        return (
          <>
            <div className="dg-insp-sec">Whose room is this? <span className="dg-muted sm">— the hero, or any of the household. Sleeps {cap}; {here.size} here.</span></div>
            {people.map((h) => {
                  const mine = here.has(h.id);
                  const other = !mine && bedroomOf(h.id);
                  return (
                    <div key={h.id} className="dg-admin-row">
                      <span><b>{h.name}</b>{h.role ? <span className="dg-muted sm"> · {h.role}</span> : null}{other ? <span className="dg-muted sm"> · housed elsewhere</span> : null}</span>
                      <button className="dg-btn ghost sm" disabled={!mine && here.size >= cap} onClick={() => dispatch({ type: "SET_QUARTERS", charId: ch.id, by: accountId, bedroomId: fac.id, hirelingId: h.id, assign: !mine })}>{mine ? "Remove" : "Give this room"}</button>
                    </div>
                  );
                })}
          </>
        );
      })()}

      <div className="dg-insp-sec">A picture of the space</div>
      {fac.image
        ? <div className="dg-bastmap"><img src={getBlob(fac.image)} alt={def.name} /></div>
        : <div className="dg-bastmap empty">{frozen ? "No picture of this space survives." : "No picture yet — a sketch or a map of just this room."}</div>}
      {!frozen && (
      <div className="dg-bastmap-actions">
        <label className="dg-btn ghost sm">{fac.image ? "Replace picture" : "Upload picture"}
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files![0]; if (!f) return; const r = new FileReader(); r.onload = () => dispatch({ type: "SET_FACILITY_IMAGE", charId: ch.id, by: accountId, facId: fac.id, dataURL: r.result as string }); r.readAsDataURL(f); }} />
        </label>
        {fac.image && <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "SET_FACILITY_IMAGE", charId: ch.id, by: accountId, facId: fac.id, dataURL: null })}>Remove</button>}
      </div>
      )}

      <div className="dg-row-actions" style={{ marginTop: 12 }}>
        <button className="dg-btn ghost" onClick={close}>Done</button>
      </div>
    </>
  );
}

export function BastionBuildModal({ modal, state, dispatch, accountId, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const ch = state.characters[modal.charId];
  const [name, setName] = useState("");
  const earned = ch ? earnedRegions(state, ch) : [];
  const [location, setLocation] = useState(earned.length ? earned[0].name : "");
  const [custom, setCustom] = useState(false);
  const [region, setRegion] = useState("");   // which COUNTRY. drives the events; see BASTION_REGIONS.
  const [form, setForm] = useState("");
  // The DMG's six, and only those: "Bedroom, Dining Room, Parlor, Courtyard, Kitchen, Storage."
  // Same list the reducer whitelists against — BASTION_FACILITIES holds no other basic room.
  const BASIC_PICKS = Object.values(BASTION_FACILITIES).filter((d) => d.kind === "basic");
  const [cramped, setCramped] = useState("bedroom");
  const [roomy, setRoomy] = useState("kitchen");
  if (!ch) return (<><h3 className="dg-modal-h">Character not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  return (
    <>
      <h3 className="dg-modal-h">Build {ch.name}'s bastion</h3>
      <p className="dg-muted sm">Level {ch.level} — the first build gives <b>{(ch.level || 5) * 20} days</b> for facilities, and you begin with <b>one Cramped and one Roomy facility</b> (per AL), <b>both of your choosing</b> (per the DMG). Each later Bastion turn spends 7 downtime days.</p>
      <label className="dg-field"><span>Bastion name</span><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ravenhold Keep" /></label>
      {earned.length > 0 && <div className="dg-muted sm" style={{ margin: "8px 0 0", fontStyle: "italic" }}>Your log says you served <b>{earned[0].name}</b> longest — {earned[0].days} downtime {earned[0].days === 1 ? "day" : "days"} across {earned[0].sessions} {earned[0].sessions === 1 ? "adventure" : "adventures"}. It&rsquo;s chosen below, but the land is yours to place.</div>}
      {/* Two fields, deliberately. `location` is the ADDRESS — what the player typed, "the north road
          out of Elturel" — and it is theirs. `region` is WHICH COUNTRY, and it is the one the event
          table reads: seventeen sets of multipliers, eight casts, eight fairs all hang off it. The
          dropdown sets both; typing your own sets only the address, and the events fall back to the
          baseline, which is correct — a place we have never heard of gets the ordinary Realms. */}
      <label className="dg-field"><span>Region <span className="dg-muted sm">— decides who is at your gate</span></span>
        {custom
          ? <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Somewhere in the multiverse…" autoFocus />
          : <select value={region} onChange={(e) => {
              if (e.target.value === "__custom") { setCustom(true); setRegion(""); setLocation(""); return; }
              setRegion(e.target.value);
              const r = BASTION_REGIONS.find((x) => x.id === e.target.value);
              setLocation(r ? r.name : "");
            }}>
              <option value="">Choose a region…</option>
              {BASTION_REGIONS.map((l) => <option key={l.id} value={l.id}>{l.name} — {l.note}</option>)}
              <option value="__custom">Elsewhere (type it)…</option>
            </select>}
      </label>
      {custom && <div className="dg-muted sm">Somewhere we don&rsquo;t have a table for. Your keep will see the ordinary run of the Realms — travellers, raiders out of the hills, the occasional siege. You can pin it to a region later if it turns out to be one.</div>}
      {!custom && region && <RegionSummary regionId={region} />}
      <button className="dg-btn ghost sm" onClick={() => { setCustom(false); const r = pick(BASTION_REGIONS); setRegion(r.id); setLocation(r.name); }}>🎲 Random region</button>
      <label className="dg-field"><span>Form <span className="dg-muted sm">— cosmetic; colors how every facility reads</span></span>
        <select value={form} onChange={(e) => setForm(e.target.value)}>
          <option value="">Plain (no form)</option>
          {BASTION_FORMS.map((f) => <option key={f.id} value={f.id}>{f.name} — its facilities are {f.word}s</option>)}
        </select>
      </label>
      <button className="dg-btn ghost sm" onClick={() => setForm(pick(BASTION_FORMS).id)}>🎲 Random form</button>
      {/* DMG: "two free basic facilities, WHICH THE CHARACTER'S PLAYER CHOOSES... One of the chosen
          facilities is Cramped, and the other is Roomy." The app used to pick for you. */}
      <div className="dg-muted sm" style={{ marginTop: 10 }}>Your two free rooms — they come furnished, and they have no game effect. They&rsquo;re where your household actually lives.</div>
      <label className="dg-field"><span>The Cramped one</span>
        <select value={cramped} onChange={(e) => setCramped(e.target.value)}>
          {BASIC_PICKS.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.note}</option>)}
        </select>
      </label>
      <label className="dg-field"><span>The Roomy one</span>
        <select value={roomy} onChange={(e) => setRoomy(e.target.value)}>
          {BASIC_PICKS.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.note}</option>)}
        </select>
      </label>
      <div className="dg-muted sm" style={{ fontStyle: "italic" }}>Your <b>two special facilities</b> aren&rsquo;t chosen here — take them from the facility list once the keep stands. They cost nothing: level 5 buys them.</div>
      <div className="dg-row-actions" style={{ marginTop: 12 }}>
        <button className="dg-btn" onClick={() => { dispatch({ type: "BUILD_BASTION", charId: ch.id, by: accountId, name, location, region, form, cramped, roomy }); close(); }}>Build it</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

export function FurnishingModal({ modal, state, dispatch, close, accountId }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const ch = state.characters[modal.charId];
  const fac = ch && ch.bastion ? (ch.bastion.facilities || []).find((f) => f.id === modal.facId) : null;
  const fn = fac ? (fac.furnishings || []).find((x) => x.id === modal.furnId) : null;
  const [note, setNote] = useState(fn ? fn.note || "" : "");
  if (!ch || !fac || !fn) return null;
  const tier = FURNISHING_TIER_BY_ID[fn.tier || "basic"] || FURNISHING_TIERS[0];
  const next = furnNextTier(fn.tier);
  const upgrading = !!modal.upgrade && !!next;
  const shown = upgrading ? next : tier;
  const room = ((BASTION_FACILITIES[fac.defId] || {}).name || fac.defId).toLowerCase();
  return (
    <div className="dg-stack">
      <h3 className="dg-modal-h">{upgrading ? "Something finer" : "Describe it"} <span className="dg-muted sm">· {fn.name || fn.slot} · the {room}</span></h3>
      {upgrading
        ? <p className="dg-muted sm">Replace the {tier.label.toLowerCase()} {fn.name || fn.slot} with something <b>{next.label.toLowerCase()}</b> — <b>{next.gp} gp</b>, the DMG&rsquo;s Art Object tier. It won&rsquo;t work any better. It will just be yours in a way the old one never was.</p>
        : <p className="dg-muted sm">The room came with this. Say what it actually looks like — what a writer would notice about it, and what it says about whoever chose it.</p>}
      <div className="dg-muted sm" style={{ fontStyle: "italic", margin: "4px 0 8px" }}>{shown.note}</div>
      <label className="dg-field"><span>What&rsquo;s actually there</span>
        <textarea className="dg-facdesc" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={upgrading ? "A new piece deserves a new description…" : "e.g. A workbench worn to a shine in one spot, where the same pair of hands has rested for nine years."} />
      </label>
      {upgrading && (ch.gp || 0) < next.gp && <div className="dg-muted sm" style={{ color: "var(--maroon)" }}>Not enough gold — {next.gp} gp needed, {ch.gp || 0} on hand.</div>}
      <div className="dg-row-actions">
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
        {upgrading
          ? <button className="dg-btn" disabled={(ch.gp || 0) < next.gp} onClick={() => { dispatch({ type: "UPGRADE_FURNISHING", charId: ch.id, by: accountId, facId: fac.id, furnId: fn.id, note }); close(); }}>Buy it ({next.gp} gp)</button>
          : <button className="dg-btn" onClick={() => { dispatch({ type: "SET_FURNISHING_NOTE", charId: ch.id, by: accountId, facId: fac.id, furnId: fn.id, note }); close(); }}>Save</button>}
      </div>
    </div>
  );
}
