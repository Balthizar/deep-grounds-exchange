import { strHash, todayLocal, localDate } from "../lib/util";
import { threadCtx } from "../lib/core";
import { bForm, carriedCount, giftLimit, liveCharmItemsHeld, tierFromLevel } from "../lib/rules";
import { composeCharmAppearance } from "../data/charms";
import { FESTIVAL_FEATURES } from "../data/events";

function rollFeatureGold(f) {
  const n = (f && f.gp) || 0;
  if (!n) return 0;
  let gp = 0;
  for (let i = 0; i < Math.abs(n); i++) gp += d6() * 100;
  return n < 0 ? -gp : gp;
}

function rollFestivalFeatures(b, regionId) {
  const table = (regionId && FESTIVAL_FEATURES[regionId]) || FESTIVAL_FEATURES.default;
  const n = festivalRooms(b);
  const out: any[] = [];
  for (let i = 0; i < n; i++) out.push(table[Math.floor(Math.random() * table.length)]);
  return out;
}

const DRAG_FACTOR = 2;                                   // half speed. Doubling the overlap IS half speed.

function aidBeats(ch, o) {
  const beats: any[] = [];
  const say = (x) => beats.push({ text: x });
  const names = o.party.map((d) => d.name);
  say("They go out at first light — " + o.sent + " of them: " + names.slice(0, 4).join(", ") + (names.length > 4 ? " and " + (names.length - 4) + " more" : "") + ". The gate shuts behind them and " + ch.bastion.name + " is suddenly a quieter place.");
  say("Word comes back that they got there. Nothing else; just that they got there.");
  say(o.won ? "They found it. Whatever it was, they found it, and it went the way these things go when there are enough of you."
            : "It was worse than the rider said it was. It usually is, and there were not enough of them for worse.");
  if (!o.won && o.lost) say(o.lost.name + " — " + (o.lost.role || "defender") + " — does not come back. The rest do, and they are carrying something, and they will not meet anyone's eye at the gate.");
  say(o.won ? "They come up the road filthy and pleased with themselves, all of them, and the local lord's man is behind them with a purse."
            : "The purse comes anyway. Halved, with an apology nobody asked for.");
  const now = Date.now();
  let at = now;
  beats.forEach((x) => { at += Math.round(BATTLE_BEAT_SEC * 1000 * (1 + (Math.random() * 2 - 1) * BATTLE_JITTER)); x.at = at; });
  return beats;
}

// ALPG, "Destroyed, Consumed, Lost, or Abandoned Items": "Remove them from your character ... They
// aren't reacquired unless earned again in play. A permanent item isn't destroyed unless stated in
// its description or an adventure."
//
// Read together with the DMG's "the site is eventually looted", that settles what happens to gear a
// hero left at a keep that falls: it is ABANDONED — off the sheet for good, never reacquired except
// by earning it again in play — but NOT destroyed. It still exists, out in the world or under the
// rubble. Which is exactly what a relic already is. So a keep lost to neglect seals its relics the
// same way a fallen hero's does; only the door is different.
//
// Only what was LEFT there. Anything the hero was carrying is still on their back — they're alive,
// they just have nowhere to go home to.
export function sealBastionRelics(s: AppState, ch) {
  const b = ch.bastion;
  if (!b) return;
  if (!Array.isArray(b.relics)) b.relics = [];
  Object.values(s.items).forEach((it) => {
    if (it.holder.type !== "CHARACTER" || it.holder.id !== ch.id) return;
    if (it.inPack !== false || it.equipped || it.available) return;   // carried, worn, or on the market = not left behind
    const cat = itemCat(it);
    if (!cat || cat.mundane || cat.consumable) return;                // relics are permanent magic only
    b.relics.push({ catalogId: it.catalogId, name: cat.name, rarity: cat.rarity, itemClass: it.itemClass, provenance: it.provenance, history: it.history || [] });
    delete s.items[it.id];                                            // off the sheet, per the ALPG — and never coming back
  });
}

// Everyone who still draws a wage or holds a wall here.
export function bastionStaff(b) {
  const out: any[] = [];
  ((b && b.facilities) || []).forEach((f) => (f.henchmen || []).forEach((h) => out.push({ kind: "hireling", name: h.name, role: h.role || "", facId: f.id, id: h.id })));
  (((b && b.defenders) || [])).forEach((d) => out.push({ kind: "defender", name: d.name, role: d.role || "", id: d.id }));
  return out;
}

// The arc, built from an outcome that is already decided. The battle is exactly as long as its own
// story — a clean repel is short because nothing happened; four deaths take four beats because four
// people died. That answers "battles vary in length" without a second formula to keep in step.
// A fair, metered. Not a battle — nothing is decided and nobody is at risk. The beats exist because
// a festival that resolves in one frame is a line of text, and a festival you watch arrive is a week.
export function festivalBeats(ch, what) {
  const b = ch.bastion, form = bForm(b);
  const beats: any[] = [];
  const say = (x) => beats.push({ text: x });
  say("The carts start arriving before anyone is ready for them. " + b.name + " is going to be full of strangers by nightfall and there is nothing to be done about it now.");
  say("They are putting up trestles in the yard. Somebody has opinions about where.");
  say("It has begun. Whatever " + ch.name + "'s people were told to do this week, they are now doing it with an audience — slower, and with more explaining.");
  say("A child has got into the " + (form ? form.word : "hall") + "s and is being retrieved. Twice.");
  say("Somebody is watching the work and asking questions. The honest answer is that being watched makes you careful, and careful is slow.");
  say("It winds down the way these things do — not at any particular moment, just fewer people each hour until the yard is only the household again, and the household is tired, and something has changed about how " + b.name + " is spoken of.");
  const now = Date.now();
  let at = now;
  beats.forEach((x) => { at += Math.round(BATTLE_BEAT_SEC * 1000 * (1 + (Math.random() * 2 - 1) * BATTLE_JITTER)); x.at = at; });
  return beats;
}

// They ride out, they do the thing, they ride home — or most of them do. DMG: "Roll 1d6 for each
// Bastion Defender you send. If the total is 10 or higher, the problem is solved and you earn a
// reward of 1d6 x 100 GP. If the total is less than 10, the problem is still solved, but the reward
// is halved and one of your Bastion Defenders is killed."
//
// Decided up front, revealed slowly, and it does NOT freeze the keep — house rule: aid does not
// freeze the bastion... it just means you are more vulnerable if you roll another attack." The keep
// works on shorthanded while they're gone. That IS the cost, and you feel it if something comes.
export function rollAidOutcome(ch, sendN) {
  const roster = ch.bastion.defenders || [];
  const sent = Math.max(1, Math.min(sendN || roster.length, roster.length));   // DMG: "one or more" — the player's number
  let total = 0;
  // DMG, Armory: while stocked, "any event causes you to roll dice to determine if your Bastion
  // loses one or more of its defenders ... roll 1d8 in place of each d6." Request for Aid is such an
  // event (1d6 per defender sent; a low total kills one), so a stocked Armory rolls d8s here too.
  const armedAid = !!(ch.bastion && ch.bastion.armed);
  for (let i = 0; i < sent; i++) total += 1 + Math.floor(Math.random() * (armedAid ? 8 : 6));
  const reward = d6x100();
  const won = total >= 10;
  return { sent, total, won, reward: won ? reward : Math.floor(reward / 2),
           lost: won ? null : { id: roster[0].id, name: roster[0].name, age: roster[0].age, role: roster[0].role },
           party: roster.slice(0, sent).map((d) => ({ id: d.id, name: d.name, role: d.role })) };
}

// ---- WHAT A FAIR TAKES -------------------------------------------------------------------------
// MY EXCHANGE RULE [TABLE]. A festival is a MARKET. People come to it to sell things, and some of
// what changes hands stops at the house. That's what a fair IS, and the DMG's version quietly
// forgets it: it charges you 500 gp and hands back "recognition", which is not a mechanic.
//
// RENOWN WOULD HAVE BEEN THE RIGHT ANSWER HERE AND IT IS NOT AVAILABLE. What the DMG actually pays
// you for a festival is standing — "your Bastion gains a sudden influx of RECOGNITION or attention" —
// and that's exactly right. A great house throws a feast to be KNOWN, not to turn a profit;
// Bryene fed three hundred people at New Year and got no coins for it — she got a county that
// knew her name. The correct reward is renown, and AL retired renown from the campaign. So I pay
// gold instead, and I pay gold ONLY because the thing I should pay no longer exists. Future me:
// if renown ever returns to organized play, THIS is the first block you revisit. The money is my
// stand-in for standing, and it always was.
//
// SO: my fair takes. Two rolls per room on the DMG's own Treasure table — same table, same d100,
// same art objects and minor items, reused whole. I invented nothing new: a fair is a place where
// things are bought and sold, and the book already has a table for "something worth money turned
// up at your keep."
//
// THE MATHS, measured: a Treasure roll is worth ~312 gp expected (25/250/750/2,500 gp art at
// 40/23/10/2%, common/uncommon/rare items at 15/8/2%). A festival costs rooms x 1d6 x 100 = ~350 a
// room. ONE take a room nets -38 and "roughly break-even" is not a good thing. TWO nets ~+274 a room,
// which is a fair that was worth throwing — and it scales, so a great hall's feast is a great hall's
// feast. The gamble is unchanged: the extra roll on the events table can still be raiders, and a fair
// full of strangers is exactly when you least want them (see HAPPENING_TINTS.festival).
// THE FAE PRICE. One of your household leaves with the fair, and leaves HAPPY, which is the point:
// nobody in Tam Lin or Thomas the Rhymer or Goblin Market is taken by force. They are asked nicely by
// something beautiful and they say yes.
//
// Uses the same roster machinery as Lost Hirelings — a hireling stops being in a room, and the room
// notices. Nothing new: this app already knows how to say "there is nobody in the kitchen". What is
// new is the REASON, and the reason is that they wanted to go.
export const FEY_DEPARTURES = [
  "went with the music and did not look back",
  "was asked, in front of everyone, and said yes",
  "followed something out of the yard at a walk, unhurried, smiling",
  "ate what was offered and could not, afterwards, see the point of the gate",
  "took a hand that was held out and that was the whole of it",
  "is dancing. Somewhere. Presumably still",
  "was offered exactly what they wanted and there was no trick in it at all",
  "left a note. The note says thank you. The note does not say sorry",
];

// DMG, Neglect: "the hirelings abandon the Bastion and the site is EVENTUALLY looted."
// "Eventually" is the book's own gap. This is the Deep Grounds Exchange's reading of it — the app's
// assumption, not SCALE's and not AL's (house rule, labelled):
// the keep doesn't fall the moment it's abandoned — it empties out, one person at a time, one per
// session the hero spends elsewhere. When the last of them walks, there's nobody left to loot it for.
// You get exactly as many chances as you gave people reasons to stay.
export function bleedAbandonedStaff(s: AppState, ch, dateStr) {
  const b = ch.bastion;
  const staff = bastionStaff(b);
  if (staff.length === 0) {                       // nobody left — the site is looted and the keep is gone
    if (!b.ruined) {
      b.ruined = true;
      b.ruinedOn = dateStr;
      b.lostTo = "neglect";
      sealBastionRelics(s, ch);                   // what was left there is abandoned: off the sheet, into the rubble
      s.notices.push({ id: "n" + s.nextId++, type: "bastionruined", ctx: "player", accountId: ch.ownerId, char: ch.name, bastion: b.name, relics: (b.relics || []).length });
    }
    return;
  }
  const gone = staff[Math.floor(Math.random() * staff.length)];
  const fac = gone.kind === "hireling" ? (b.facilities || []).find((f) => f.id === gone.facId) : null;
  const r = hirelingLossReason(fac);                              // even in the long decline, people leave for reasons
  if (gone.kind === "defender") {
    b.defenders = (b.defenders || []).filter((d) => d.id !== gone.id);
  } else if (fac) {
    fac.henchmen = (fac.henchmen || []).filter((h) => h.id !== gone.id);
  }
  // Not everyone who stops working here walked away. Some of them are still here.
  if (r.fate === "dead") entombHireling(b, gone, dateStr, (b.turns || []).length, r.illness ? "died of " + r.illness : "died at their post");
  const left = bastionStaff(b).length;
  const fate = r.fate === "dead"
    ? gone.name + (gone.role ? " (" + gone.role + ")" : "") + " " + r.text + ". They are buried at " + b.name + "; nobody sent word."
    : gone.name + (gone.role ? " (" + gone.role + ")" : "") + " " + r.text + ".";
  s.logEntries.push({
    id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED",
    date: dateStr || todayLocal(), dtSpent: 0, gpSpent: 0,
    spentOn: b.name + " — " + fate + " " + (left > 0 ? left + " still hold on." : "The last of them is gone; the keep stands empty."),
    flavor: r.fate === "dead"
      ? "Nobody was home to be told. Whatever " + gone.name + " wanted said over them, it went unsaid."
      : "They gave you longer than they should have. Nobody came, so they stopped waiting to be given a reason.",
  });
  // Somebody has to write it. Preferably someone who is still there.
  const remaining = bastionStaff(b);
  const from = remaining.length
    ? pick(remaining)                                            // a hand who's still holding on
    : (r.fate === "dead" ? null : gone);                         // the last one out writes their own goodbye; the dead write nothing
  s.notices.push({
    id: "n" + s.nextId++, type: "bastionwalkout", ctx: "player", accountId: ch.ownerId,
    char: ch.name, bastion: b.name,
    who: gone.name, role: gone.role || gone.kind, left, fate: r.fate, why: r.text,
    from: from ? from.name : null, fromRole: from ? (from.role || "") : "",
    selfSigned: !!from && from.name === gone.name,               // the last one signing their own notice
  });
  if (left === 0) {
    b.ruined = true;
    b.ruinedOn = dateStr;
    b.lostTo = "neglect";
    sealBastionRelics(s, ch);                     // the last of them walked; what he left is the rubble's now
    s.notices.push({ id: "n" + s.nextId++, type: "bastionruined", ctx: "player", accountId: ch.ownerId, char: ch.name, bastion: b.name, relics: (b.relics || []).length });
  }
}

// ============================================================================
// MY BASTION ENGINE - the simulation itself.
//
// Order resolution, the household week, events and happenings, construction,
// staffing, neglect, defenders and battles. Everything I taught a keep about how
// to BEHAVE, as opposed to what a facility IS (that's bastion/registry.ts).
//
// My dependencies point one way and never come back:
//     lib/* + data/* + bastion/registry  <-  me  <-  app.tsx
// ============================================================================

import { pick } from "../lib/util";
import { catName, itemCat, itemClassOf, mkItem, verified, d6, d6x100, evHostility, evIsHostile, BATTLE_BEAT_SEC, BATTLE_JITTER } from "../lib/core";
import { CATALOG } from "../data/catalog";
import type { AppState, Facility, Bastion } from "../types";
import { ARCHIVE_BOOK_SUBJECT_LABEL, composeArchiveTitle, composeLibraryTitle, composeLibraryParagraph, librarySubjectFor, anyLibrarySubject, rollLoreTopic, BASTION_ALL_IS_WELL, BASTION_ATTACK_DICE, BASTION_ATTACK_DICE_RAID, BASTION_ATTACK_DICE_WALLED, BASTION_BARRACKS_CAP, BASTION_BEDS_BY_SIZE, BASTION_CRAFT_ITEM, BASTION_EVENTS, BASTION_FACILITIES, BASTION_FACILITY_DAYS, BASTION_FOUND_COIN, BASTION_ORDERS, BASTION_ORDER_FLAVOR, BASTION_PREREQS, BASTION_QUIET_FLAVOR, BASTION_SIZES, BASTION_SIZE_MULT, BASTION_SLICE_OF_LIFE, BASTION_TRADE_INCOME, BASTION_TURN_DT, DEFENDER_ROLES, ARMORY_KIT_BY_FORM, FAC_MAGIC_GROUP, FURNISHING_TIERS } from "../data/bastion";
import { BASTION_LIFE_TASKS, FACILITY_REACTIONS, HENCH_FIRST, HENCH_LAST, facEstablishment, furnTierIndex, furnishFacility, furnishingName, furnishingValue, hirelingLossReason, restockFacilitySlots, staffFacility } from "../bastion/registry";
import type { BastionOrder, BastionTurn, CharacterRecord } from "../types";
import { EVENT_CAST } from "../data/events";

// ---- THE CLOCK -------------------------------------------------------------------------------
// EXCHANGE RULE, and the biggest one I've made: this is a wall clock, and AL does not have one.
//
// AL's clock is DOWNTIME AND SESSIONS. The ALPG: "You may make one Bastion turn (taking 7 days),
// spending 7 DT for each turn... Orders taking 7 or fewer days to resolve benefit this session's
// player character(s); orders taking longer benefit the character(s) at a FUTURE SESSION, depending
// on how many 7 days need to pass." Ten DT a session, one DT a day. Time passes because you SHOW UP.
//
// My number here is a prototype pacing device standing exactly where that session accounting
// belongs. It costs nothing — no gold, no DT, no turn — because it isn't a rule; it's me standing
// in for a DM who would've said "not this turn", in an app with no DM in the room. That's why I
// call it legitimate, and it stays legitimate ONLY while it renders durations the RULES mandate.
// The moment I let it invent one the books deny, it stops being a rendering and becomes my house
// rule in disguise. Future me: hold that line.
//
// IT IS ALSO NOT A KNOB. Future me, I mean it. Six of my systems hang off this one integer:
//   the pause on a new special (pauseDays)        the wall ring (BASTION_WALLS_DAYS)
//   every construction and enlargement            the chore day (CHORE_LOCK_MIN)
//   every Bastion turn's countdown                the festival's drag (dragBastionClocks)
// Change it and a Vast room's pause moves from 62.5 real hours to something else, a week moves from
// 3.5 hours, and a chore stops meaning a day. Tune it, but know what it is holding up.
//
// WHEN THIS GETS A BACKEND, THIS IS THE THING THAT CHANGES. readyAt becomes turnsRemaining and the
// clock becomes sessions attended — which is a better brake than a wall clock anyway, because a wall
// clock runs while you sleep. It slows the CLICK, not the character.
export const REAL_MIN_PER_GAME_DAY = 30;        // 1 in-fiction day = 30 real minutes

export const bastionTradeIncome = (level, size) => {
  const l = level || 1;
  const base = l >= 17 ? BASTION_TRADE_INCOME[17] : l >= 13 ? BASTION_TRADE_INCOME[13] : l >= 9 ? BASTION_TRADE_INCOME[9] : l >= 5 ? BASTION_TRADE_INCOME[5] : 0;
  return base * (BASTION_SIZE_MULT[size] || 1);
};

// An Arcane Focus IS a Spellcasting Focus, and so is a Holy Symbol — the Observatory asks only for
// the general case, so anyone who declared the specific one already answered it. Transitive, so a
// future prerequisite that implies another needs no special case here.
export function prereqsHeldBy(ch) {
  const out = new Set();
  const add = (id) => {
    if (!BASTION_PREREQS[id] || out.has(id)) return;
    out.add(id);
    (BASTION_PREREQS[id].implies || []).forEach(add);
  };
  ((ch && ch.qualifies) || []).forEach(add);
  return out;
}

export const facPrereq = (def) => (def && def.prereq) ? BASTION_PREREQS[def.prereq] : null;

export const facPrereqMet = (ch, def) => { const p = facPrereq(def); return !p || prereqsHeldBy(ch).has(p.id); };

// "for which the character qualifies" — the book's phrase, in one place, for every consumer of it:
// taking a facility, swapping one at level-up, and anything that comes after.
export const facQualifies = (ch, def) => !!def && (ch.level || 1) >= (def.minLevel || 5) && facPrereqMet(ch, def);

export const lifeTasksFor = (defId, formId) => {
  const t = BASTION_LIFE_TASKS[defId];
  if (!t) return [];
  if (Array.isArray(t)) return t;            // un-minted placeholder (flat)
  return t[formId] || t.keep || [];          // minted (form-keyed)
};

// ---- CHANGING OVER A SPECIAL'S STOCK -----------------------------------------------------------
// MY EXCHANGE RULE [TABLE]. Swapping a pub's barrels or an archive's books is a DAY'S WORK, and I
// need to say so because the book doesn't: the DMG describes a home game, where the DM says
// "sure, you swap the tap" and the table moves on. There's no DM in my room and a week has to
// mean something, so my changeover costs what it obviously costs — a day.
//
// It's a CHORE, not an order: free, no downtime, one real day on the clock (CHORE_LOCK_MIN), and
// it happens INSIDE the seven days the turn already occupies. You aren't buying time; you're
// spending time you already had.
//
// AND IT BLOCKS THE ROOM FOR THE TURN, which is my whole ruling and it's just my CONSTRUCTION
// rule applied consistently: you either commission the work or you use the room, never both in
// one week.
// The pub cannot pour a beverage it spent the week decanting; the archive cannot be studied while
// its shelves are on the floor. Same as `fac.building`, same reason, different noun.
//
// NB the DMG DOES give the Pub a once-a-turn switch ("at the start of a Bastion turn, you can switch
// to one of the other options") and gives the Archive NO such rule. This applies the same rule to
// both, which is the Exchange filling a silence rather than reading one: the book never says the
// Archive can swap freely, it simply never contemplates the question. Left alone I would
// have let a player re-shelve a library four times in an afternoon for nothing, which is not a rule
// the book denies so much as a question it was never asked.
export const facStockedThisTurn = (fac, n) => !!fac && fac.stockedOn === n;

// DMG: every special facility entry prints a Space — "Space: Roomy" and the like. The room arrives
// at that size and costs no gold; the level slot is the price. Twenty of the chapter's specials
// print Roomy, seven print Vast, two print Cramped. A special is NEVER smaller than its printed
// Space — that size is the floor, not a starting offer.
export const facPrintedSpace = (def) => (def && def.kind === "special") ? (def.space || "roomy") : "cramped";

export const facSpaceFloor = (def) => BASTION_SIZES.indexOf(facPrintedSpace(def));

export const facMayBeSize = (def, size) => BASTION_SIZES.indexOf(size) >= facSpaceFloor(def);

// Six facilities in the chapter print an enlargement — Archive, Barrack, Garden, Pub, Stable and
// Workshop — always Roomy → Vast, always 2,000 GP, each granting a stated benefit. That price is
// exactly BASTION_ENLARGE's roomy>vast, so one table serves the book and the house alike.
//
// EXCHANGE RULE [TABLE] — the DMG never says how long a special takes to appear because a home game
// does not need a countdown; the DM says when. This app has no DM in the room and a wall clock
// instead, so it needs a number the book never had to write. Ours, not the book's: a special with no printed enlargement may still be enlarged,
// and gains NOTHING but floor space. This fills a genuine silence rather than contradicting anyone —
// the DMG prices a purely cosmetic enlargement for basic facilities in the same breath ("There is no
// in-game benefit to enlarging a basic facility, but a character might enlarge a facility for
// cosmetic reasons or to increase the Bastion's size") and is simply silent on doing the same to a
// Library. Silence is not prohibition. Enlarge one and you get a grander room; you get no mechanics,
// because inventing a benefit the book didn't print is where compliance would actually break.
export const facEnlargeBenefit = (def) => (def && def.enlargeBenefit) || null;

// ALPG: "On its first build, you have 20 times your level in days to add basic facilities, features, or enlarge."
// The allowance belongs to the FIRST BUILD — the setup before the keep starts running. Once the bastion takes
// its first turn, that window is closed and all further work is built the slow way, on the order clock.
export const bastionSizeDays = (size) => BASTION_FACILITY_DAYS[size] || 0;

export const buildBudgetTotal = (b) => (b && b.buildBudget) || 0;

export const buildBudgetOpen = (b) => !!b && ((b.turns || []).length === 0);   // still in the first build?

export const buildBudgetLeft = (b) => Math.max(0, buildBudgetTotal(b) - ((b && b.budgetUsed) || 0));

export const buildBudgetAvail = (b) => buildBudgetOpen(b) ? buildBudgetLeft(b) : 0;   // what may actually be spent right now

// ALPG, first build: "you have 20 times your level in days to add basic facilities, features, or
// enlarge (at or after level 5)." The allowance pays what it can; the masons are owed the rest.
// Every construction in this app — halls, enlargements, walls — bills through here, so the rule
// exists once. Debits the budget as a side effect; call it exactly once per job.
export function spendBuildBudget(b, days) {
  const fromBudget = Math.min(days, buildBudgetAvail(b));
  if (fromBudget > 0) b.budgetUsed = (b.budgetUsed || 0) + fromBudget;
  return { fromBudget, owed: days - fromBudget };
}

export function randDefender(s: AppState) { return { id: "def" + s.nextId++, name: pick(HENCH_FIRST) + " " + pick(HENCH_LAST), age: 18 + Math.floor(Math.random() * 38), role: pick(DEFENDER_ROLES) }; }

export function bastionSliceOfLife(form) {
  const table = (form && BASTION_SLICE_OF_LIFE[form.id]) || null;
  return table ? pick(table) : pick(BASTION_ALL_IS_WELL);        // the formless keep gets its own d12 — see the table
}

// ---- Event hostility ------------------------------------------------------------------------
// Three states, and the top two are the DMG's own vocabulary rather than mine:
//
//   hostile   The keep is under threat. DMG, Attack: "A HOSTILE FORCE attacks your Bastion."
//             Exactly one event of the eleven qualifies. It's a whitelist with one member, and
//             that is correct — nothing else in the chapter puts anyone at the walls.
//   friendly  Someone is being welcomed, hosted, or paid. DMG, Friendly Visitors: "FRIENDLY
//             visitors come to your Bastion"; Guest: "A FRIENDLY guest comes to stay."
//   neutral   Neither. Officials with a warrant (Criminal Hireling) are a scene at the gate, not
//             a siege. Request for Aid sends defenders AWAY — the danger is somewhere else.
//             Lost Hirelings is a bad week, not an enemy. All Is Well is by definition nothing.
//
// WHY IT EXISTS. The DMG already writes a rule against this line and never names the line —
// Refugees: "They stay until you find them a new home OR A HOSTILE FORCE ATTACKS YOUR BASTION."
// A DM at a table arbitrates a festival colliding with a siege in half a second and never notices
// they did it. My platform has to be told in advance. The category is the book's; the name is mine.
//
// THE RULE (Exchange): a hostile result suppresses every FRIENDLY result rolled beside it — nobody
// throws a fair while there are men on the wall. NEUTRAL results stand: that room simply isn't in
// the battle, which is exactly what makes it somewhere to hide.
// A SECOND, INDEPENDENT AXIS: what this event does to the character's purse. Three states, because
// an event cannot both pay and charge — two booleans would let someone write a row that does both.
//   pays    puts gold or an item in their hands: Friendly Visitors, Guest, Refugees, Treasure,
//           Magical Discovery, Request for Aid.
//   levies  takes gold out: Extraordinary Opportunity's festival, the Criminal Hireling's bribe.
//   none    touches no gold at all. An Attack costs defenders; Lost Hirelings costs staff. Neither
//           is a purse event, and neither is capped — trouble is not rationed.
//
// This does NOT track hostility, and assuming it did would be a bug both ways: Request for Aid is
// NEUTRAL and pays 1d6 x 100 gp, while Extraordinary Opportunity is FRIENDLY and charges you for
// the privilege. Whitelist, not blacklist: an untagged event touches nothing.
export const evPurse = (ev) => (ev && ev.purse) || "none";

// Given everything rolled this turn, return what actually happens. Pure; membership is independent
// of order. Hand it one event or ten, it answers the same way.
export function eventsThatStand(evs) {
  const rolled = (evs || []).filter(Boolean);
  // 1. The fair is cancelled if there are men on the wall; the warrant still knocks.
  const survived = rolled.some(evIsHostile)
    ? rolled.filter((e) => evHostility(e) !== "friendly")
    : rolled;
  // 2. ONE OF EACH, PER WEEK (Exchange). Rolling per room means the same result can
  //    come up twice, and a week that reports "Lost Hirelings" twice reads as a bug even when the
  //    dice were honest — nobody at a table narrates the same event to you two times. The book never
  //    needs this rule because the book rolls once; this app rolls per room, so it does.
  //    Note this is an EXCLUSION, not a merge: the second roll is simply not news.
  const seenIds = new Set();
  const once = survived.filter((e) => { if (seenIds.has(e.id)) return false; seenIds.add(e.id); return true; });
  // 3. THE PURSE SCALES WITH THE HOUSE, BUT SLOWER THAN THE STORY DOES [TABLE] [EVIDENCE].
  //    Rolling per room multiplies the STORY, and it is meant to: a keep running six orders should be
  //    a busier, louder, more eventful place than one running a single garden. It must not multiply
  //    the PURSE at the same rate, in either direction — six rooms should not mean six payouts and it
  //    should not mean six bills.
  //
  //    So: ONE purse event OF EACH KIND per three rooms working. ceil(n/3) — a one-to-three-room
  //    house gets one, four-to-six gets two, and so on. A bigger house IS worth more and DOES cost
  //    more, because it is a bigger house; it simply doesn't scale linearly with how many orders you
  //    happened to issue that week. Bryene ran 6,000 acres from one hall and did not earn 6,000 times
  //    a cottage.
  //
  //    "OF EACH KIND" is the load-bearing phrase and it is not decoration:
  //      gold    coins in the purse. Visitors, Guest, Refugees, Treasure.
  //      item    a thing, not money. Magical Discovery hands you an uncommon potion — that is a
  //              payout, but it is not INCOME, and a retired character living off their keep cannot
  //              eat it. Rationing it against the gold means a week that hands you a potion cannot
  //              also hand you the coins, which is wrong: they are different resources.
  //      levies  money leaving. Extraordinary Opportunity, Criminal Hireling.
  //    Each kind gets its own budget. Both directions, or it isn't a cap: an earlier build capped
  //    only the payouts and left the levies running, and a six-room keep promptly went to -7 gp a
  //    week. Capping one side of a ledger is not balancing it.
  //
  //    NB (16 Jul): this comment previously read "ONE PURSE EVENT OF EACH KIND PER WEEK ... however
  //    many rooms were working". The code has said ceil(n/3) for some time. The comment was wrong and
  //    an entire afternoon of gold analysis was reasoned from it rather than from the code. A comment
  //    that contradicts the line under it is worse than no comment: it is a confident lie in the one
  //    place you look for the truth.
  const cap = Math.max(1, Math.ceil(((evs || []).length || 1) / 3));
  const spent: Record<string, any> = {};
  return once.filter((e) => {
    const kind = evPurse(e);
    if (kind === "none") return true;   // threats, losses and quiet weeks are never rationed
    spent[kind] = (spent[kind] || 0) + 1;
    if (spent[kind] > cap) return false;   // this week's purse has moved that way as far as it goes
    return true;
  });
}

// Roll on the table, optionally excluding ids. The DMG's own rule needs this — Extraordinary
// Opportunity says to roll again "(rerolling this result if it comes up again)" — and this app needs
// it further, because it rolls PER ROOM where the book rolls once, so a week can already have news
// in it before the follow-on lands. The weights re-normalise over whatever is left; excluding
// everything returns null rather than lying with a default.
export function rollBastionEvent(exclude, regionId) {
  const skip = exclude instanceof Set ? exclude : new Set(exclude || []);
  const pool = regionalEvents(regionId).filter((e) => !skip.has(e.id));
  if (!pool.length) return null;
  const total = pool.reduce((n, e) => n + e.weight, 0);
  let r = Math.random() * total;
  for (const e of pool) { r -= e.weight; if (r <= 0) return e; }
  return pool[pool.length - 1];
}

export const facDisabled = (fac, atTurn) => (fac.disabledUntil || 0) >= atTurn;   // shut down for turn number `atTurn`

export const facResting = (fac, atTurn) => (fac.restsUntil || 0) >= atTurn;       // on cadence cooldown (produces on alternating turns)

// A keep lives one week at a time. Until the turn in progress resolves, there is no next turn to
// take — DMG: "Bastion events are resolved BEFORE the next Bastion turn," and a turn whose orders
// are still out has no results to build the next one on.
//
// This was never a rule here: it was an ACCIDENT of every ordered facility being flagged `working`,
// which bastionOrderAllowed then refused. Maintain issues no facility orders, so it never asked, and
// walked straight through. The symptom was a button; the defect was a rule that didn't exist.
// Now it exists, it has a name, and it's checked at the door — where a caller that isn't my UI
// still meets it.
export const bastionTurnPending = (b) => ((b && b.turns) || []).some((t) => !t.resolved);

// Something is being built here right now — a room going up or being enlarged, or the walls closing.
// Construction is not a facility task; it runs in parallel. But it is an EVENT of sorts: a keep with
// masons on the scaffolding is conspicuous, so it breaks the quiet week (see resolveBastionEvent) and
// it is written into the keep's history when it starts and finishes (see logBastionWork).
export const bastionUnderConstruction = (b) => !!b && (((b.facilities || []).some((f) => f.building)) || !!b.wallsBuilding);

export const bastionLeisure = (ch) => !!ch && ch.status === "retired";            // a retired lord tends the keep at leisure — no DT or cadence gating

export function entombDefenders(bastion, list, date, turn) {                       // the fallen are named and remembered — a keep keeps its dead
  if (!bastion || !list || !list.length) return;
  if (!Array.isArray(bastion.defenderGraveyard)) bastion.defenderGraveyard = [];
  list.forEach((d) => bastion.defenderGraveyard.push({ name: d.name, age: d.age, role: d.role, fellOn: date, turn, kind: "defender", cause: "fell defending the keep" }));
}

// The household's dead, not just the garrison's. A hireling who dies of the coughing sickness gets a
// stone the same as an archer who died on the wall — and the stone says what took them.
// Read the dead's bonds into their stone. Mourning and grudges are the same ledger with a different verb:
// a positive bond is someone who worked beside them; a negative one, someone who never made their peace.
// Starter framing — the epitaph wording is death-path content Frank can enrich; the mechanism is here.
export function rememberedByLine(bastion, h) {
  const bonds = ((h && h.bonds) || []).filter((bd) => bd.weight !== 0).sort((a, z) => Math.abs(z.weight) - Math.abs(a.weight));
  const nameOf = (id) => { for (const f of ((bastion && bastion.facilities) || [])) { const m = (f.henchmen || []).find((x) => x.id === id); if (m) return m.name; } return null; };
  const parts: any[] = [];
  for (const bd of bonds) {
    if (parts.length >= 2) break;
    const nm = nameOf(bd.id); if (!nm) continue;
    parts.push(nm + (bd.weight > 0 ? ", who worked beside them" : ", who never quite made their peace"));
  }
  return parts.length ? "Remembered by " + parts.join("; and by ") + "." : "";
}

export function entombHireling(bastion, h, date, turn, cause) {
  if (!bastion || !h) return;
  if (!Array.isArray(bastion.defenderGraveyard)) bastion.defenderGraveyard = [];
  bastion.defenderGraveyard.push({ name: h.name, age: h.age, role: h.role, fellOn: date, turn, kind: "hireling", cause, rememberedBy: rememberedByLine(bastion, h) });
}

export function severBastionCombines(s: AppState, charId) {                                  // a keep that's gone (razed, abandoned, fallen, removed) leaves every combine it was in
  Object.values(s.characters).forEach((c) => {
    if (c.bastion && Array.isArray(c.bastion.combinedWith) && c.bastion.combinedWith.includes(charId)) c.bastion.combinedWith = c.bastion.combinedWith.filter((id) => id !== charId);
  });
  const self = s.characters[charId];
  if (self && self.bastion && Array.isArray(self.bastion.combinedWith)) self.bastion.combinedWith = [];
  if (Array.isArray(s.bastionPacts)) s.bastionPacts.forEach((p) => { if ((p.status === "active" || p.status === "pending") && (p.aChar === charId || p.bChar === charId)) p.status = "dissolved"; });
}

export const barracksCap = (size) => BASTION_BARRACKS_CAP[size] || 0;

export const bastionDefenderCap = (b) => { const caps = ((b && b.facilities) || []).filter((f) => f.defId === "barracks").map((f) => barracksCap(f.size)); return caps.length ? Math.max(...caps) : 0; };

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN NOTE — how the Armory / Bastion attack SHOULD work (owner: Frank). This is
// NOT the shipped behavior; the DMG's flat model below is what runs, for AL letter-of-
// the-law. See FINDINGS ("Armory / Bastion-attack design complaint, 26 Jul").
//
// The better simulation is per-DEFENDER, not per abstract die-pool:
//   • Each Bastion Defender rolls ONE die of their own.
//   • That die is 1d6 unarmored, 1d8 armored — armor coming from a stocked Armory and
//     tracked PER DEFENDER (not the whole-armory on/off flag the DMG uses).
//   • Defensive Walls give the ATTACKERS disadvantage: reroll each die and take the
//     result worse FOR THE ATTACKER (i.e. the higher of the two rolls, since low = harm).
//   • On a defender's die: a 1 kills that defender; a 2 destroys that defender's gear
//     (it reverts to 1d6 until re-equipped).
//   • Restock becomes DYNAMIC: you pay to re-arm only the defenders who lost gear,
//     instead of the flat whole-armory expend "regardless of ... how many you lost."
//
// Why it is better: attrition is earned and legible, Walls read as protection rather
// than an unexplained die-count cut, and cost tracks what was actually lost. It also maps
// cleanly onto Aid (each defender sent rolls their own die) instead of the DMG's split
// between a 6d6/4d6 pool (Attack) and a sum-vs-10 (Aid).
// ─────────────────────────────────────────────────────────────────────────────
export function rollAttackOnes(walled, armed, dice) {
  const base = dice == null ? BASTION_ATTACK_DICE : dice;
  if (base <= 0) return 0;                                     // a standoff rolls nothing at all
  const n = Math.max(1, Math.round(base * (walled ? BASTION_ATTACK_DICE_WALLED / BASTION_ATTACK_DICE : 1)));
  const sides = armed ? 8 : 6;                                 // DMG: a stocked Armory upgrades the die
  let ones = 0;
  for (let i = 0; i < n; i++) if (1 + Math.floor(Math.random() * sides) === 1) ones++;
  return ones;
}

// DMG, Armory (Trade: Stock Armory): "This equipment costs you 100 GP plus an extra 100 GP for each
// Bastion Defender in your Bastion. If your Bastion has a Smithy, the total cost is halved."
export const ARMORY_BASE_COST = 100;

export const ARMORY_COST_PER_DEFENDER = 100;

export const bastionHas = (b, defId) => (((b && b.facilities) || []).some((f) => f.defId === defId));

// "100 GP plus an extra 100 GP for each Bastion Defender ... If your Bastion has a Smithy, the TOTAL cost is halved."
// Note the base 100: stocking an empty Armory still costs something. And the Smithy halves the total, not the rate.
export const armoryCost = (b) => {
  const defenders = ((b && b.defenders) || []).length;
  const gross = ARMORY_BASE_COST + ARMORY_COST_PER_DEFENDER * defenders;
  return bastionHas(b, "smithy") ? Math.floor(gross / 2) : gross;
};

// DMG, Armory > Trade: Stock Armory — the ONE stocking mechanism, shared by the turn's Trade order
// and the off-turn Arm button so cost, guards, and the `armed` flag can never drift apart. Returns
// the gp spent, or false if it couldn't stock (no Armory, no defenders, already stocked, can't afford).
export function stockArmory(s: AppState, ch: any, date: string) {
  const b = ch && ch.bastion;
  if (!b || b.armed) return false;                        // already stocked this cycle
  if (!bastionHas(b, "armory")) return false;             // need an Armory
  if (((b.defenders) || []).length === 0) return false;   // nothing to arm
  const cost = armoryCost(b);
  if ((ch.gp || 0) < cost) return false;                  // can't afford to fill the racks
  ch.gp = (ch.gp || 0) - cost;
  b.armed = true;                                         // spent the moment a defender-loss event ends
  const kit = ARMORY_KIT_BY_FORM[(bForm(b) || {}).id || "keep"] || "arms and armor";
  s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date, dtSpent: 0, gpSpent: cost, spentOn: ch.name + " \u2014 stocked the Armory of " + b.name + " with " + kit });
  return cost;
}

export function eventCast(eventId, regionId) {
  const table = (regionId && EVENT_CAST[eventId + "@" + regionId]) || EVENT_CAST[eventId] || null;
  return table ? pick(table) : null;
}

// ---- WHERE THE KEEP IS, AND WHY IT MATTERS --------------------------------------------------
// EXCHANGE RULE [TABLE] [EVIDENCE]. The base event table is a place: a settled region, on a road,
// with a lord who mostly keeps the peace and hills he does not go into. Notionally the Sword Coast —
// the modern default, and where most 5e product is set. Every region below is a MULTIPLIER on that.
//
// WHY I CHOSE MULTIPLIERS AND NOT TABLES. My weights are RELATIVE, not percentages:
// rollBastionEvent sums the pool at roll time and rolls against the sum. So a region doesn't need
// its own table, or a rebalance, or arithmetic — it needs to say which rows it leans on.
// Everything it doesn't mention falls through to my base, exactly like FURNISHING_LADDER's
// "slot@form" overrides. Sparse, one place, no number written twice.
//
// WHY THERE IS NO "AVERAGE REGION" TO ANCHOR ON. Look at AL's own season list below: the Underdark,
// Barovia, Chult, Avernus, the Feywild, Wildspace. AL picks a region BECAUSE it is extreme — nobody
// runs a season in "somewhere fine". There is no average member of that set; being average is
// disqualifying. So the anchor is the abstraction and every named place deviates from it. That also
// means a homebrew region a DM invents still has a sane table, which a Dalelands-as-baseline would
// not have given them.
//
// AND A SEASON AT WAR IS JUST A MULTIPLIER. If a season puts a region under arms, that's
// { raiders: 2, attack: 2, standoff: 1.5 } and nothing else changes. No checkbox, no new
// machinery, no second table. That's the whole reason I chose this shape.
export const REGION_WEIGHTS = {
  // --- the frontier: raiders are the weather, and everyone builds a peel tower ---
  swordcoast:    { },                                    // the baseline, named. x1 across the board.
  neverwinter:   { raiders: 2, refugees: 1.5, visitors: 0.7, opportunity: 0.6 },
  silvermarches: { raiders: 2.5, standoff: 1.5, refugees: 1.5, visitors: 0.6, treasure: 1.3 },
  icewinddale:   { raiders: 2, visitors: 0.2, guest: 0.3, opportunity: 0.2, refugees: 2, allwell: 1.4 },
  dessarin:      { raiders: 1.8, refugees: 1.5, aid: 1.5, opportunity: 0.7 },
  // --- the settled: the law works, and the trouble is other people's lawyers ---
  cormyr:        { raiders: 0.4, attack: 0.5, standoff: 0.8, aid: 1.5, opportunity: 1.5, visitors: 1.3 },
  waterdeep:     { raiders: 0.2, attack: 0.3, standoff: 0.6, visitors: 2, guest: 2, opportunity: 2.5, criminal: 1.8, discovery: 1.5 },
  baldursgate:   { raiders: 0.4, criminal: 2, visitors: 1.8, guest: 1.5, opportunity: 1.5, standoff: 1.3 },
  // --- the contested: nobody is quite in charge, and everyone is leaning ---
  dalelands:     { raiders: 1.3, standoff: 1.5, aid: 1.3, opportunity: 0.8 },
  moonsea:       { raiders: 1.5, attack: 1.5, criminal: 2, standoff: 1.5, refugees: 1.5, visitors: 0.7, guest: 0.6 },
  heartlands:    { raiders: 1.3, visitors: 1.5, guest: 1.3, criminal: 1.3, aid: 1.2 },
  // --- the places that are not places ---
  underdark:     { visitors: 0.1, guest: 0.2, opportunity: 0.1, raiders: 3, attack: 1.5, allwell: 0.7, discovery: 2 },
  barovia:       { visitors: 0.3, guest: 0.5, opportunity: 0.3, raiders: 1.5, standoff: 2, refugees: 2, treasure: 0.5, allwell: 0.6 },
  chult:         { raiders: 2.5, visitors: 0.4, opportunity: 0.3, discovery: 2, treasure: 2, lost: 2 },
  avernus:       { visitors: 0.1, guest: 0.1, opportunity: 0.2, raiders: 4, attack: 3, standoff: 2, allwell: 0.3, refugees: 1.5 },
  feywild:       { visitors: 1.5, guest: 2, discovery: 3, allwell: 0.6, treasure: 1.5, lost: 2, raiders: 0.7 },
  wildspace:     { visitors: 1.5, raiders: 2, refugees: 0.5, discovery: 2, aid: 1.5, opportunity: 0.5, guest: 0.7 },
};

// The pool this region rolls on. A region names only what it leans on; everything else is the base.
// Whitelist: an unknown region, or none, is the baseline — never a guess, never an error.
export function regionalEvents(regionId) {
  const mods = REGION_WEIGHTS[regionId];
  if (!mods) return BASTION_EVENTS;
  return BASTION_EVENTS.map((e) => (mods[e.id] ? { ...e, weight: e.weight * mods[e.id] } : e));
}

export function bastionTurnFlavor(orders) {
  const acts = [...new Set((orders || []).filter((o) => o.orderId !== "maintain").map((o) => BASTION_ORDER_FLAVOR[o.orderId]).filter(Boolean))];
  if (!acts.length) return pick(BASTION_QUIET_FLAVOR);
  const joined = acts.length === 1 ? acts[0] : acts.slice(0, -1).join(", ") + " and " + acts[acts.length - 1];
  return "This week, " + joined + "; the rest of the keep ran smoothly.";
}
// ---------------------------------------------------------------------------
// My bastion turn resolution.
//
// These MUTATE the state they're handed. That's deliberate and safe: I call them
// ONLY from RESOLVE_BASTION_TURNS, after my reducer's draft — so they operate on
// the copy, never on live state. My rule stays intact: one draft in, one
// `return s` out, and nothing mutates outside a reducer case. Nothing.
// ---------------------------------------------------------------------------

// May this order be issued to this facility, this turn? The AL rules for orders, in my one place.
export function bastionOrderAllowed(ch, o, n, leisure) {
  const fac = (ch.bastion.facilities || []).find((f) => f.id === o.facId);
  if (!fac) return false;
  if (fac.working != null) return false;                        // already mid-order
  if (fac.building) return false;                               // a hall still going up takes no orders
  if (facStockedThisTurn(fac, n)) return false;                 // ...and neither does one that spent the week changing over
  if (facDisabled(fac, n)) return false;                        // shut down by an Attack
  if (facilityDormant(fac)) return false;                      // stripped bare — a smithy with no forge is a shed
  if (!leisure && facResting(fac, n)) return false;             // resting off a cadence order
  if (fac.lastOrder && fac.lastOrder === o.orderId) return false;
  // ↑ ALPG: "No facility's order may have the same resolution twice in a row." Maintain always resolves
  //   "All is Well", so it is bound by this like any other order — no exemption.
  const ord = BASTION_ORDERS[o.orderId];
  if (ord && ord.producesItem) {                                // craft/harvest must pick a valid output and meet its level
    const def = BASTION_FACILITIES[fac.defId];
    const chosen = bOutputs(def, o.orderId).find((c) => c.id === o.outId);
    if (!chosen) return false;
    if ((chosen.minLevel || def.minLevel || 5) > (ch.level || 1)) return false;   // e.g. magic crafting gated at 9
  }
  return true;
}

// Work whose time has come is finished — the hall is up, or the space is bigger.
// The reveal. Beats land as their clock passes; the outcome lands when the last one does.
export function advanceBastionHappening(s: AppState, ch, now) {
  const bt = ch.bastion.happening;
  if (!bt) return;
  const due = bt.beats.filter((x) => x.at <= now).length;
  if (due > bt.shown) bt.shown = due;
  if (now >= bt.endsAt) resolveBastionHappening(s, ch);
}

// A room that got bigger holds more. DMG: a Vast Pub "can have TWO magical beverages from the Pub
// Special list on tap at a time"; a Vast Archive "gains TWO ADDITIONAL reference books chosen from
// the list above". The new slots arrive FILLED, for the same reason the room did when it was built —
// the book never once describes an empty one. The player changes them if they care.
//
// This is a FUNCTION because enlarging has two paths and both need it, which is the bug this exists
// to fix: ENLARGE_BASTION_FACILITY stages a build only when the work is not already covered by the
// first-build allowance. If the budget pays for it, the size changes IMMEDIATELY and
// finishConstruction never runs. Hooking only the slow path meant a fresh keep's Vast pub silently
// had one tap forever, and the test that would have caught it was dispatching a misspelled action.
export function stockFacility(s: AppState, ch: CharacterRecord, f: Facility) {
  if (!f || f.building) return;
  const form = bForm(ch.bastion);
  restockFacilitySlots(f, form);
}

// The keep's own record of construction — start and finish, each an event line the turn history shows
// interleaved with the weeks. Construction "counts as an event of sorts," so it earns a line the same
// way a siege or a quiet week does; it simply isn't a turn, so it lives in its own list, not in b.turns
// (which is weeks, numbered and DT-costed — a build is neither).
export function logBastionWork(s: AppState, b, text) {
  if (!Array.isArray(b.chronicle)) b.chronicle = [];
  const now = Date.now();
  b.chronicle.push({ id: "work" + (s.nextId++), at: now, date: localDate(now), text });
}

export function finishConstruction(s: AppState, ch, now) {
  if (ch.bastion.wallsBuilding && ch.bastion.wallsBuilding.readyAt <= now         // the ring closes
      && ch.status !== "dead" && !ch.bastion.abandoned) {                          // …unless no one is left to close it
    ch.bastion.walls = true;
    ch.bastion.wallsBuilding = null;
    logBastionWork(s, ch.bastion, "the defensive walls were completed");
  }
  (ch.bastion.facilities || []).forEach((f) => {
    if (!f.building || f.building.readyAt > now) return;
    if (ch.status === "dead" || ch.bastion.abandoned) return;   // no one finishes a fallen lord's work — it stands half-raised forever
    if (f.building.what === "enlarge" && f.building.toSize) { f.size = f.building.toSize; staffFacility(s, f); logBastionWork(s, ch.bastion, "the " + (bDef(f).name || "room").toLowerCase() + " was enlarged to " + f.size); }   // a bigger room needs more hands (DMG)
    // The room got bigger, so it holds more. DMG: a Vast Pub "can have TWO magical beverages from the
    // Pub Special list on tap at a time"; a Vast Archive "gains TWO ADDITIONAL reference books chosen
    // from the list above". The new slots arrive FILLED, for the same reason the room did when it was
    // built — the book never once describes an empty one. The player changes them if they care.
    // NB this is the only place it can happen: enlarging STAGES a build, and the size does not change
    // when you pay. It changes when the masons finish, which is here.
    if (f.building.what === "enlarge") { const wasB = f.building; f.building = null; stockFacility(s, ch, f); f.building = wasB; }
    if (f.building.what === "rebuild" && f.building.toDefId) {    // the room is finally something else
      f.defId = f.building.toDefId;
      f.lastOrder = null;                                        // a new room has no last order to repeat
      f.disabledUntil = 0; f.restsUntil = 0;
      staffFacility(s, f);                                       // DMG: it comes with its own people...
      furnishFacility(s, f);                                     // ...and its own furniture
      logBastionWork(s, ch.bastion, "the works were finished — the room is now a " + (bDef(f).name || "facility").toLowerCase());
    }
    if (f.building.what === "build") logBastionWork(s, ch.bastion, "the " + (bDef(f).name || "facility").toLowerCase() + " was completed");
    f.building = null;
  });
}

// One order on one facility: produce what it produces, then free the facility.
// Empower's meaning lives in the ROOM, not the order. One case per room that issues it — the Theater's
// die, the Meditation Chamber's Inner Peace, the Observatory's stars, the Demiplane's runes, the
// Sanctum's rites all land here as they arrive. Returns null for a room with no empowerment, which is
// how a room that shouldn't have had the order in the first place fails quietly instead of lying.
export function empowermentFrom(s: AppState, ch, fac, def, t): any {
  switch (fac && fac.defId) {
    case "observatory": {
      // DMG, Observatory > Empower: Eldritch Discovery — "explore the eldritch mysteries of the
      // stars for 7 consecutive nights. At the end of that time, roll a die. If the number rolled
      // is even, nothing is gained. If odd, an unknown power bestows one of the following Charms
      // on you or another creature of your choice ... Charm of Darkvision, Charm of Heroism, or
      // Charm of Vitality (all described in chapter 3)."
      //
      // MY Q15 RULING (Frank, 25 Jul), superseding SR-12: the bestowal is a giftable CHARM ITEM
      // minted by the facility. It has a lifetime on the HOLDER'S clock — the next resolved
      // Bastion turn OR a completed session, whichever comes first (his own 17-Jul precedent for
      // keep charms: "either complete session or the next bastion turn, one or the other"); a
      // holder with no keep simply only has the session clock, a session being 7 days of travel,
      // adventure and return. In escrow, unclaimed, it does not age — so accept it just
      // before you sit down at a table. It is GIFT-ONLY, never traded or sold, and when it
      // expires it does not vanish: it becomes a mundane decorative charm, a keepsake.
      // The Charm's own text stays in the DMG (ch. 3 is not SRD); the item carries the NAME and
      // the pointer — the same doctrine as every slot in this system.
      const b = ch.bastion;
      const rng = mkRng(b.id + ":" + t.n + ":eldritch");                 // same week -> same stars
      const die = 1 + Math.floor(rng() * 6);
      const nights = "Seven consecutive nights at the eyepiece, and on the last the die was cast: a " + die + ".";
      if (die % 2 === 0) {
        t.benefits.push("\u2739 Empower \u2014 Eldritch Discovery: " + nights + " Even. The stars kept their counsel; nothing was gained.");
        s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: t.date, dtSpent: 0, gpSpent: 0,
          spentOn: b.name + " \u2014 Observatory: Eldritch Discovery (even die \u2014 nothing gained)",
          flavor: "DMG: roll a die at the end of 7 nights; even is nothing. The week is still on the ledger, because the week still happened." });
        return { custom: true };
      }
      const NAMES = ["Charm of Darkvision", "Charm of Heroism", "Charm of Vitality"];
      const nm = NAMES[Math.floor(rng() * 3)];                           // the POWER picks, not the goat — the choice clause in the text is about the recipient
      const look = composeCharmAppearance(rng);                          // four more of the same seeded dice — 20^4 looks, Frank's design
      const iid = "it" + s.nextId++;
      s.items[iid] = mkItem(iid, null, "UNTRADEABLE", ch.campaign, verified("BESTOWED", "Eldritch Discovery \u2014 " + b.name),
        { type: "CHARACTER", id: ch.id },
        { name: nm, charmItem: true, charmName: nm, charmState: "LIVE", charmArmedAt: Date.now(), charmDesc: look,
          source: "DMG 2024, ch. 3 \u2014 Supernatural Gifts",
          notes: "Gift-only. Live until the holder's next Bastion turn resolves OR they complete a session \u2014 whichever comes first (no bastion: the session clock only). It does not age in escrow. Expired, it becomes a decorative keepsake." });
      const capT = ch.tier || tierFromLevel(ch.level);
      const overCap = carriedCount(ch, "charm") + liveCharmItemsHeld(s, ch.id) > giftLimit(capT, "charm");
      if (overCap) t.benefits.push("\u26A0 SR-13: this puts you OVER the ALPG carried-charm cap for Tier " + capT + " \u2014 gift it, spend one, or uncheck a sheet charm before you sit down at a table.");
      t.benefits.push("\u2739 Empower \u2014 Eldritch Discovery: " + nights + " Odd \u2014 an unknown power bestowed a " + nm + " (DMG ch. 3). It arrived as " + look + " Keep it, or gift it at the table or to a friend; it stays live until your next Bastion turn resolves or a session completes \u2014 whichever comes first \u2014 and an unclaimed gift does not age. After that, a keepsake.");
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: t.date, dtSpent: 0, gpSpent: 0,
        spentOn: b.name + " \u2014 Observatory: " + nm + " bestowed (Eldritch Discovery, odd die)",
        flavor: "The Charm's text lives in the DMG; this item carries its name and where it came from. Gift-only, on the holder's clock." });
      return { custom: true };
    }
    default: return null;
  }
}

// MY Q15 EXPIRY, one helper for both clocks \u2014 belt AND braces, same as the keep's own sheet
// charms (17 Jul: "either complete session or the next bastion turn, one or the other"). The
// bastion path calls this after a turn actually RESOLVES; COMPLETE_SESSION calls it for every
// attended character, keep or no keep. Escrowed gifts
// are skipped — Frank's rule: the timer is in limbo until the gift is claimed. Nothing vanishes;
// the name says plainly what it now is.
export function expireCharmItemsFor(s: AppState, ch, now) {
  Object.values(s.items || {}).forEach((it: any) => {
    if (!it || !it.charmItem || it.charmState !== "LIVE" || it.escrow) return;
    if (!(it.holder && it.holder.type === "CHARACTER" && it.holder.id === ch.id)) return;
    if ((it.charmArmedAt || 0) > now) return;
    it.charmState = "EXPIRED";
    it.name = (it.charmName || it.name) + " \u2014 expired (decorative keepsake)";
    s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: todayLocal(), dtSpent: 0, gpSpent: 0,
      spentOn: (it.charmName || "A charm") + " faded to a keepsake",
      flavor: "Its week ended on " + ch.name + "'s own clock. It keeps its place on the sheet as a decoration \u2014 nothing more, and nothing less." });
  });
}

export function resolveBastionOrder(s: AppState, ch: CharacterRecord, t: BastionTurn, o: BastionOrder, leisure) {
  const fac = ch.bastion!.facilities.find((f) => f.id === o.facId);
  const ord = BASTION_ORDERS[o.orderId];
  if (!ord) return;

  if (o.orderId === "maintain") {
    // A special told to just tick over produces nothing mechanical — but a week is a week, so it seeds a
    // story beat instead of vanishing from the log. One per turn (the vignette is the household's, not the
    // room's), drawn from the ALL IS WELL table, tagged with whether the hero was actually here.
    if (fac) fac.lastOrder = o.orderId;
    if (!t.maintainVignette) {
      t.maintainVignette = true;
      const slice = bastionSliceOfLife(bForm(ch.bastion));           // one quiet-week line, keyed to the keep's form
      const lead = t.away ? "While " + ch.name + " was away, " : "While " + ch.name + " kept the hall, ";
      t.benefits.push("\u{1F56F} " + lead + slice.charAt(0).toLowerCase() + slice.slice(1));
    }
    return;
  }

  if (o.orderId === "research") {
    // DMG, Archive > Research: Helpful Lore — 7 days; "The hireling gains knowledge as if they had
    // cast the Legend Lore spell, then shares this knowledge with you the next time you speak with
    // them." Legend Lore is SRD, so the item on the ledger is the POINTER, and the lore itself is
    // the DM's to hand across the table. A topic may ride the order (o.topic, free text — the §5
    // params pattern); without one, the archivist chose their own trail.
    const nm = (fac && (fac.hirelingName || null)) || "the archivist";
    let topic = ((o.topic || o.detail || "") + "").trim().slice(0, 120);   // a typed topic rides the order's detail lane
    let tagLine = "";
    if (!topic && fac && fac.defId === "archive") {
      // FRANK'S d100 (25 Jul): no topic given, the stacks decide — region entries first, the
      // global canon filling the hundred. Seeded by keep + shelf + week: same week, same trail.
      const pick = rollLoreTopic(mkRng(((ch.bastion && ch.bastion.id) || "b") + ":" + fac.id + ":lore:" + t.n), ch.bastion && ch.bastion.region);
      topic = pick.t;
      tagLine = " Say so at the table \u2014 it feeds " + pick.k.map((x) => ARCHIVE_BOOK_SUBJECT_LABEL[x] || x).join(" / ") + ".";
    }
    if (fac && fac.defId === "archive") {
      const vol = composeArchiveTitle(mkRng(((ch.bastion && ch.bastion.id) || "b") + ":" + fac.id + ":research:" + t.n), (bForm(ch.bastion) || {}).id || "keep", { topic });   // the thumbed volume is ABOUT the week's study
      const bookLine = " The volume most thumbed: \u00ab" + vol + "\u00bb." + (fac.book ? " The reference book stayed open on its stand the whole week." : "");
      t.benefits.push("\ud83d\udcdc Research \u2014 Helpful Lore: seven days in the stacks" + (topic ? " on the matter of " + topic : "") + ", and " + nm + " now knows it as if Legend Lore itself had been cast (SRD; the DM speaks the lore when next you talk)." + tagLine + bookLine);
      // FRANK (25 Jul): a player who thinks a book is cool can take it home. The mintable is an
      // OBJECT beside the prose — the UI offers the click, MINT_BOOK_ITEM does the shelving. The
      // wiki link rides the TOPIC (canon, our reference of record), never the title (fiction).
      t.mintables = (t.mintables || []).concat([{ title: vol, topic: topic, defId: "archive", size: fac ? fac.size : "roomy", wiki: "https://forgottenrealms.fandom.com/wiki/Special:Search?query=" + encodeURIComponent(topic) }]);
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: t.date, dtSpent: 0, gpSpent: 0,
        spentOn: ((ch.bastion && ch.bastion.name) || "The keep") + " \u2014 Archive: Research" + (topic ? " (" + topic + ")" : ""),
        flavor: "Knowledge as if Legend Lore had been cast \u2014 the pointer is the record; the telling is the table's." });
    } else if (fac && fac.defId === "library") {
      // DMG, Library > Research: Topical Lore — 7 days; the hireling researches a topic (a legend,
      // event, location, person, creature, or famous object) and "obtains up to three accurate pieces
      // of information about the topic that were previously unknown to you," shared next time you
      // speak. The DM determines what is learned. The mintable Library book CONTAINS those three
      // facts as a stitched, sourced paragraph (Frank, 29 Jul) — that's the whole difference from an
      // Archive book, which carries only a wiki pointer. If a deep subject matches the topic, the
      // book is written from its sourced d-table; otherwise the book is titled but its facts are the
      // DM's to speak (graceful fallback, faithful to "the DM determines what you learn").
      const subj = librarySubjectFor(topic) || (!topic ? anyLibrarySubject(mkRng(((ch.bastion && ch.bastion.id) || "b") + ":" + fac.id + ":libsub:" + t.n)) : null);
      const trng = mkRng(((ch.bastion && ch.bastion.id) || "b") + ":" + fac.id + ":libtitle:" + t.n);
      const tt = composeLibraryTitle(trng, subj ? subj.label : (topic || "the collection"), (bForm(ch.bastion) || {}).id || "keep");
      const para = subj ? composeLibraryParagraph(trng, subj, tt.genre) : "";
      t.benefits.push("\ud83d\udcda Research \u2014 Topical Lore: seven days at the reading-desks" + (topic ? " on the matter of " + topic : "") + ", and " + nm + " has three accurate things you did not know, to tell you when next you speak (DMG; the DM decides what is learned). The volume most thumbed: \u00ab" + tt.title + "\u00bb." + (para ? " Its three findings are set down inside it." : ""));
      t.mintables = (t.mintables || []).concat([{ title: tt.title, topic: topic || (subj ? subj.label : "the library's collection"), paragraph: para || null, defId: "library", size: fac ? fac.size : "roomy" }]);
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: t.date, dtSpent: 0, gpSpent: 0,
        spentOn: ((ch.bastion && ch.bastion.name) || "The keep") + " \u2014 Library: Research" + (topic ? " (" + topic + ")" : ""),
        flavor: "Topical Lore: up to three accurate, previously-unknown facts \u2014 the pointer is the record; the DM determines and tells the lore." });
    } else {
      t.benefits.push("\ud83d\udcdc Research \u2014 " + nm + " spent the week in study" + (topic ? " on " + topic : "") + "; what was learned is theirs to share when you next speak.");
    }
    if (fac) fac.lastOrder = o.orderId;
    return;
  }
  if (o.orderId === "trade" && fac && fac.defId === "armory") {
    // DMG, Armory > Trade: Stock Armory. The generic Trade order SELLS for gold (producesGp); the
    // Armory's Trade STOCKS for gold instead — the same order, a different thing, exactly as the book
    // says. Facility-specific, the way Research special-cases the Archive above.
    const nm = (fac && fac.hirelingName) || "the quartermaster";
    const b = ch.bastion!; const already = !!b.armed, noDef = (((b.defenders) || []).length === 0), canPay = (ch.gp || 0) >= armoryCost(b);
    const spent = stockArmory(s, ch, t.date);
    if (spent !== false) {
      t.benefits.push("\ud83d\udee1 Stock Armory \u2014 " + nm + " filled the racks with " + (ARMORY_KIT_BY_FORM[(bForm(b) || {}).id || "keep"] || "arms and armor") + " (" + spent + " gp). While it holds, any defender-loss roll takes d8s for d6s \u2014 and it empties the moment it is needed.");
    } else if (already) {
      t.benefits.push("\ud83d\udee1 Stock Armory \u2014 the racks were already full; " + nm + " stood the order down.");
    } else if (noDef) {
      t.benefits.push("\ud83d\udee1 Stock Armory \u2014 there are no defenders to arm. Muster a Barrack first.");
    } else if (!canPay) {
      t.benefits.push("\ud83d\udee1 Stock Armory \u2014 the coin was not there to fill the racks this week.");
    }
    if (fac) fac.lastOrder = o.orderId;
    return;
  }
  if (ord.producesEmpowerment) {
    // DMG, Empower: "The special facility confers a temporary empowerment to you or someone else."
    // The order carries no mechanics; the ROOM does. So ask the room, and record what it conferred and
    // for how long. I do not APPLY it — D&D Beyond holds the sheet. This is my organized-play
    // layer: what you have, where it came from, when it lapses, and a DM able to spot-check it.
    const edef = BASTION_FACILITIES[fac ? fac.defId : ""] || {};
    const emp = empowermentFrom(s, ch, fac, edef, t);
    if (!emp) { t.benefits.push("Empower — nothing came of it."); return; }
    if (emp.custom) { if (fac) fac.lastOrder = o.orderId; return; }       // the room minted and logged for itself (Observatory does)
    if (!Array.isArray(ch.empowerments)) ch.empowerments = [];
    ch.empowerments.push(emp);
    t.benefits.push("✹ Empower — " + emp.name + ": " + emp.effect + " (7 days; lapses after your next Bastion turn.)");
    t.prompt = emp.prompt;
    s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: t.date, dtSpent: 0, gpSpent: 0,
      spentOn: ch.bastion!.name + " — " + (edef.name || (fac ? fac.defId : "")) + ": " + emp.name + " (7 days)",
      flavor: emp.flavor });
    if (fac) fac.lastOrder = o.orderId;
    return;
  }

  if (ord.producesItem) {
    const def = BASTION_FACILITIES[fac ? fac.defId : ""];
    const chosen = bOutputs(def, o.orderId).find((c) => c.id === o.outId);
    // SCRIPTORIUM — Spell Scroll. DMG-faithful: the facility's SCRIBE supplies the Calligrapher's
    // Supplies and meets the prerequisites, so the PC needn't carry tools or be a caster. The scribe's
    // CLASS gates the pool (chosen at hire: Novice Mage → Wizard, Acolyte → Cleric). ALPG line 135:
    // scribed at the spell's BASE level only, 3rd or lower here. Minted as an UNFILLED scroll slot —
    // the goat names the spell (from the scribe's class list, ≤maxLevel), a DM verifies — same door as
    // every other "the text isn't mine" output. The scribe's class is read from the staffed hireling.
    // TOOLKIT-DERIVED MUNDANE CRAFT (Smithy's "anything smith's tools can make", etc.). The DMG:
    // "the facility's hirelings craft anything that can be made with Smith's Tools." So the output is
    // not a fixed item — it's whatever the TOOL can make (g_tool_smith carries the concrete items and
    // the category rules). Minted as an unfilled slot: the goat names the specific thing from the
    // tool's list, a DM verifies it against that list. Same door as every "the list is data, the
    // choice is the player's" output. No GP here — mundane smithing cost is the base gear's own price,
    // settled at verification.
    // WORKSHOP — gear from its SIX CHOSEN tools. Same slot-mint as a single-tool facility, but the
    // makeable set is the UNION across the facility's chosenTools (set at build via SET_WORKSHOP_TOOLS).
    // If the six haven't been chosen yet, there's nothing to derive from — prompt the choice.
    if (chosen && chosen.toolChoice) {
      const chosenTools = (fac && (fac as any).chosenTools) || [];
      if (!chosenTools.length) {
        t.benefits.push(ord.name + ": the workshop hasn't been fitted with its tools yet \u2014 choose its six artisan's tools first.");
        t.prompt = "The " + (def && def.name ? def.name.toLowerCase() : "workshop") + " has benches but no tools chosen. Which six artisan's tools does it hold?";
        return;
      }
      const maker = bastionMaker(fac, ch);
      if (!s.itemSlots) s.itemSlots = {};
      const sid = "slot" + s.nextId++;
      s.itemSlots[sid] = { id: sid, charId: ch.id, ownerId: ch.ownerId, table: "toolset", rarity: "mundane",
        status: "UNFILLED", rolledAt: t.date, entered: null, itemId: null, cat: "Gear", sub: "workshop",
        label: (chosen.label || "Adventuring gear") + " (name the item; a DM verifies it against the workshop's chosen tools)",
        roll: null, via: "toolset", tools: chosenTools, facId: fac ? fac.id : null,
        facName: (def && def.name) || "the workshop", maker };
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: t.date, dtSpent: 0, gpSpent: 0,
        spentOn: ch.bastion!.name + " \u2014 Workshop: adventuring gear (to be named)",
        flavor: "DMG Workshop (Craft: Adventuring Gear): the hirelings craft anything the workshop's six chosen tools can make, per the PHB. Name the item and a DM verifies it against those tools; the base gear's own price is settled at verification." });
      t.benefits.push(ord.name + ": the work is on the bench \u2014 by " + maker + ". Name what you had made (anything the workshop's chosen tools can make) and a DM verifies it.");
      return;
    }
    if (chosen && chosen.tool) {
      const maker = bastionMaker(fac, ch);
      if (!s.itemSlots) s.itemSlots = {};
      const sid = "slot" + s.nextId++;
      s.itemSlots[sid] = { id: sid, charId: ch.id, ownerId: ch.ownerId, table: "tool:" + chosen.tool, rarity: "mundane",
        status: "UNFILLED", rolledAt: t.date, entered: null, itemId: null, cat: "Gear", sub: chosen.tool,
        label: (chosen.label || "Tool-made gear") + " (name the item; a DM verifies it against the tool's list)",
        roll: null, via: "tool", tool: chosen.tool, facId: fac ? fac.id : null,
        facName: (def && def.name) || "the workshop", maker };
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: t.date, dtSpent: 0, gpSpent: 0,
        spentOn: ch.bastion!.name + " \u2014 " + ((def && def.name) || "Craft") + ": tool-made gear (to be named)",
        flavor: "DMG: the facility's hirelings craft anything that can be made with these tools. Name the item you had made and a DM verifies it against the tool's list; the base gear's own price is settled at verification." });
      t.benefits.push(ord.name + ": the work is on the bench \u2014 by " + maker + ". Name what you had made (anything these tools can make) and a DM verifies it against the tool's list.");
      return;
    }
    if (chosen && chosen.scroll) {
      const scribe = (fac && (fac.henchmen || [])[0]) || null;
      const scls = (scribe && (scribe as any).scribeClass) || null;   // set at hire (SET_SCRIPTORIUM_SCRIBE)
      if (!scls) {
        t.benefits.push(ord.name + ": no scribe is posted to say whose hand and class would scribe the scroll — hire a scribe first.");
        t.prompt = "The " + (def && def.name ? def.name.toLowerCase() : "room") + " has the supplies but no scribe posted. Who takes the desk?";
      } else {
        const maker = bastionMaker(fac, ch);
        if (!s.itemSlots) s.itemSlots = {};
        const sid = "slot" + s.nextId++;
        const maxL = chosen.maxLevel || 3;
        s.itemSlots[sid] = { id: sid, charId: ch.id, ownerId: ch.ownerId, table: "scroll", rarity: "common",
          status: "UNFILLED", rolledAt: t.date, entered: null, itemId: null, cat: "Scroll", sub: scls,
          label: "A " + scls + " Spell Scroll, level " + maxL + " or lower (name the spell; a DM verifies)",
          roll: null, via: "scribe", scribeClass: scls, maxLevel: maxL, facId: fac ? fac.id : null,
          facName: (def && def.name) || "the Scriptorium", maker };
        s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: t.date, dtSpent: 0, gpSpent: 0,
          spentOn: ch.bastion!.name + " — Scriptorium: a " + scls + " Spell Scroll (\u2264 level " + maxL + "; to be named)",
          flavor: "DMG Scriptorium: the scribe supplies the Calligrapher's Supplies and meets the prerequisites. ALPG: scribed at the spell's base level. Name the spell from the scribe's class list and a DM verifies it; you pay the scroll's cost per the PHB at verification." });
        t.benefits.push(ord.name + ": a " + scls + " Spell Scroll is on the desk \u2014 by " + maker + ". Name the spell (level " + maxL + " or lower, from the " + scls + " list) and a DM verifies it. You pay the scroll's cost at verification.");
      }
      return;
    }
    // SCRIPTORIUM — Paperwork. Up to 50 loose-leaf copies, 1 GP each, delivered within 50 miles. A
    // pure flavor/service output — it produces no keepable item, so it resolves as a narrated benefit
    // and a charge. The count rides o.count (defaulted); cost = perCopy * count from the PC's purse.
    if (chosen && chosen.paperwork) {
      const count = Math.max(1, Math.min(50, o.count || 50));
      const cost = (chosen.perCopy || 1) * count;
      if ((ch.gp || 0) < cost) {
        t.benefits.push(ord.name + ": " + count + " copies would cost " + cost + " gp, not in the purse — nothing was run off.");
        t.prompt = "The press was ready for " + count + " copies at " + cost + " gp, but the coin was short. How many can you pay for?";
      } else {
        ch.gp = (ch.gp || 0) - cost;
        const maker = bastionMaker(fac, ch);
        s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: t.date, dtSpent: 0, gpSpent: cost,
          spentOn: ch.bastion!.name + " — Scriptorium: " + count + " broadsheets/pamphlets",
          flavor: "DMG Scriptorium (Craft: Paperwork): " + count + " loose-leaf copies at 1 GP each, paid from " + ch.name + "'s purse. The scribe can distribute them within 50 miles of the Bastion at no extra cost." });
        t.benefits.push(ord.name + ": " + count + " broadsheets ran off the desk \u2014 by " + maker + " (" + cost + " gp). The scribe will carry them anywhere within fifty miles of the keep.");
      }
      return;
    }
    if (chosen && chosen.magic) {
      // MY Q17 RULING (24 Jul), superseding the SRD-selector I built first. The book says "a Common
      // or an Uncommon magic item CHOSEN BY YOU from the <Group> tables in chapter 7" — the TABLES,
      // whole, most of which I can't ship. So I stopped offering a shippable subset and did what I
      // already do everywhere the text isn't mine: I mint an UNFILLED slot, the goat enters the
      // item they chose from their own book, and a DM at their store verifies it against that book
      // (SUBMIT_SLOT_ITEM / VERIFY_SLOT_ITEM — the same door as rolled slots). Materials are
      // charged NOW, at the ch. 7 rarity figure — half for a consumable, declared on the order
      // because the goat already knows what they're making; the DM checks that claim with the
      // rest. A mundane BASE (a weapon, armour, ammunition) can't be auto-consumed when I don't
      // hold the item's text, so the benefit line tells them to surrender it at verification
      // through the disposal door. The spell-emitter rule (the lord crafts it personally, spells
      // prepared) rides the same verification: I state it; the DM enforces it at the table.
      const rarity = chosen.rarity || "common";
      const baseCost = MAGIC_CRAFT_COST[rarity] || 0;
      const cost = o.craftConsumable ? Math.floor(baseCost / 2) : baseCost;
      if ((ch.gp || 0) < cost) {
        t.benefits.push(ord.name + ": a " + rarity + " " + chosen.magic + " item — but the " + cost + " gp for raw materials was not in the purse, so nothing was made.");
        t.prompt = "The " + (def && def.name ? def.name.toLowerCase() : "room") + " had the order but not the " + cost + " gp of materials. What has to wait?";
      } else {
        ch.gp = (ch.gp || 0) - cost;
        const groupNm = chosen.magic.charAt(0).toUpperCase() + chosen.magic.slice(1);
        const rarNm = rarity.charAt(0).toUpperCase() + rarity.slice(1);
        const maker = bastionMaker(fac, ch);
        if (!s.itemSlots) s.itemSlots = {};
        const sid = "slot" + s.nextId++;
        s.itemSlots[sid] = { id: sid, charId: ch.id, ownerId: ch.ownerId, table: chosen.magic, rarity,
          status: "UNFILLED", rolledAt: t.date, entered: null, itemId: null, cat: "", sub: "",
          label: rarNm + " magic item \u2014 " + groupNm + " tables (DMG ch. 7)", roll: null,
          via: "craft", facId: fac ? fac.id : null, facName: (def && def.name) || "the room",
          maker, consumable: !!o.craftConsumable, gpPaid: cost };
        s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: t.date, dtSpent: 0, gpSpent: cost,
          spentOn: ch.bastion!.name + " \u2014 " + ((def && def.name) || "Craft") + ": " + rarNm + " " + groupNm + " item (commissioned; to be named)",
          flavor: "DMG ch. 7: raw materials for a " + rarity + " item from the " + groupNm + " tables" + (o.craftConsumable ? " (consumable \u2014 half rate)" : "") + ", paid from " + ch.name + "'s own purse. Name the finished item and a DM at your store verifies it against your book." });
        t.benefits.push(ord.name + ": a " + rarity + " " + groupNm + " item is on the bench \u2014 by " + maker + " (" + cost + " gp materials" + (o.craftConsumable ? ", consumable half-rate" : "") + "). Enter the item you chose from the " + groupNm + " tables; a DM verifies it against your book. If it is built on a mundane base (a weapon, armour, ammunition), the base is consumed \u2014 surrender it at verification. If it casts spells, you did the work personally with those spells prepared.");
      }
    } else {
      // simple path: a free or flat-cost output (a focus, the Book). Create it; spend any declared cost.
      const craftCost = (chosen && chosen.cost) || 0;
      if (craftCost > 0 && (ch.gp || 0) < craftCost) {
        t.benefits.push(ord.name + ": " + ((chosen && chosen.label) || "the work") + " — but the " + craftCost + " gp for raw materials was not in the purse, so nothing was made.");
        t.prompt = "The " + (def && def.name ? def.name.toLowerCase() : "room") + " had the order and the hands, but not the " + craftCost + " gp of raw materials the work needed. What has to wait until the coin is there?";
      } else {
        const outCat = (chosen && chosen.catalogId) || o.outId || BASTION_CRAFT_ITEM;
        const iid = "it" + s.nextId++;
        const maker = bastionMaker(fac, ch);
        s.items[iid] = mkItem(iid, outCat, itemClassOf(outCat, "UNTRADEABLE"), ch.campaign, verified("CRAFTED", maker), { type: "CHARACTER", id: ch.id });
        if (craftCost > 0) {
          ch.gp = (ch.gp || 0) - craftCost;
          s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: t.date, dtSpent: 0, gpSpent: craftCost,
            spentOn: ch.bastion!.name + " — " + (def && def.name ? def.name : "Craft") + ": " + ((chosen && chosen.label) || catName(outCat)),
            flavor: "DMG: the raw materials for the work, paid from " + ch.name + "'s own purse. The time folds into the Bastion turn; the coin does not." });
        }
        t.benefits.push(ord.name + ": " + ((chosen && chosen.label) || catName(outCat)) + " — by " + maker + (craftCost > 0 ? " (" + craftCost + " gp in materials; character-created, not tradeable)" : " (character-created, not tradeable)"));
      }
    }
  } else if (ord.producesGp) {
    const g = bastionTradeIncome(ch.level || 1, fac ? fac.size : "cramped");   // auto income, scales with level (and size); no manual entry
    ch.gp = (ch.gp || 0) + g;
    t.benefits.push("Trade earned " + g + " gp");
  } else {
    t.benefits.push(ord.name + (o.detail ? ": " + o.detail : ""));
  }

  if (fac) {
    fac.lastOrder = o.orderId;
    if (ord.cadence && !leisure) fac.restsUntil = t.n + ord.cadence;           // cadence orders rest after producing (never in leisure)
  }
}

// An Attack event: roll the hits, spend the garrison, then the allies, then the walls.
// ---------------------------------------------------------------------------------------------
// THE BATTLE. I split it into three, because one function that rolls, mutates and narrates can't
// be paced and can't be tested:
//   rollBastionAttack   decides the whole thing and changes NOTHING. Pure.
//   battleBeats         turns that outcome into a story, in order, with a clock.
//   stageBastionBattle  hangs it on the bastion and starts the countdown.
//   resolveBastionHappening applies the outcome when the last beat lands.
//
// I roll ONCE, up front, and store it. Nothing rolls during the reveal — a live table
// mid-narration is how you get a battle whose ending contradicts its middle, and that's the
// exact flake I taught my harness to hunt on 15 Jul.
//
// WHY I BUILT IT (Exchange, platform-side — costs no gold, no DT, no turn): a DM rolls 6d6
// behind a screen and then TALKS for ten minutes. The dice are already cast; the table doesn't
// know that yet. That gap is the whole experience of a siege. My website with no DM in it
// resolved the same event in a single frame and printed the corpses — information, not a story.
// My clock is the DM's mouth. It changes nothing about what happened.
// WHAT A HAPPENING FREEZES. My events don't differ in machinery — beats, a clock, a reveal, an
// outcome. They differ in exactly two things: how long, and what stops while it runs. So I made
// this a field, not four systems.
//   "all"    [TABLE] Nobody in the keep is doing anything else. House rule on the Attack: everyone
//            within would be on high alert and participating in either hiding from the attackers or
//            defending the bastion."
//   "build"  Orders continue; construction doesn't. The festival: you cannot raise a wing through a
//            crowd, and the crafters only work slower for being watched.
//   "none"   The keep runs. Request for Aid sends the defenders AWAY — it only means the keep is
//            more vulnerable if you roll another attack." The Guest just ticks.
// The lock taxonomy, and now an ENFORCED whitelist rather than a list somebody wrote down. It was
// declared and never read: a happening could claim any string it liked and bastionFrozenBy would
// quietly treat an unknown lock as "not frozen", which is the most dangerous possible default —
// a siege that forgot to say "all" would leave the keep wide open and nothing would complain.
export const HAPPENING_LOCKS = ["all", "build", "none"];

// WHICH LOCK IS ON, and the whitelist is enforced HERE because this is the only place it can be.
// This used to hand back b.happening.lock raw, defaulting to "none" — so a happening with a lock
// this app does not recognise ("al", say, or a field somebody renamed) froze NOTHING, silently, and
// a siege left the gate open with no complaint from anywhere. HAPPENING_LOCKS was declared to stop
// exactly that and was never read.
//
// The default matters and it is not symmetric. NO happening -> "none": correct, nothing is going on.
// A happening with a lock I don't recognise -> "all": something IS going on and I can't say what it
// permits, so it permits nothing. An unknown state fails SHUT, never open.
export const happeningLock = (b) => {
  if (!b || !b.happening) return "none";
  const l = b.happening.lock;
  return HAPPENING_LOCKS.includes(l) ? l : "all";
};

export const bastionFrozenBy = (b, what) => {              // the lock is whitelisted upstream; unknown fails SHUT
  const l = happeningLock(b);
  return what === "turn" ? l === "all" : what === "build" ? (l === "all" || l === "build") : false;
};

// ---- HOLDING THE CLOCKS ------------------------------------------------------------------------
// A happening that freezes the keep holds EVERY pending clock in it, not merely the week. A wing
// doesn't go up during a siege. A ring of wall doesn't close while there are men outside it. The
// work stops, and starts again from exactly where it stopped when the fighting does.
//
// WHICH clocks hold is the LOCK's business, not this function's — a festival stops the builders
// and not the crafters; a Request for Aid stops nobody. So I ask bastionFrozenBy, one question
// per kind.
//
// I hold every clock the same way: store what it had LEFT, stop it, hand it back from `now` on
// release. One pair of functions over a list of every clock in the keep — because my first
// version froze only the week, and my masons went on laying stone through a siege for an hour.
export function bastionClocks(b, which?) {               // which omitted = every clock in the keep
  const out: any[] = [];
  if (which !== "build") (b.turns || []).forEach((x) => { if (!x.resolved) out.push(x); });
  if (which !== "turn") {
    (b.facilities || []).forEach((f) => { if (f.building) out.push(f.building); });
    if (b.wallsBuilding) out.push(b.wallsBuilding);
  }
  return out;
}

export function holdBastionClocks(b, now) {
  const holdWeek = bastionFrozenBy(b, "turn"), holdWork = bastionFrozenBy(b, "build");
  if (!holdWeek && !holdWork) return;
  const list = (holdWeek && holdWork) ? bastionClocks(b) : bastionClocks(b, holdWeek ? "turn" : "build");
  list.forEach((c) => {
    if (c.heldMs != null) return;                                  // already stopped — never stop it twice
    c.heldMs = Math.max(0, (Number.isFinite(c.readyAt) ? c.readyAt : now) - now);
    c.readyAt = Infinity;                                          // never due while it is held
    c.frozen = true;
  });
}

export function releaseBastionClocks(b, now) {
  bastionClocks(b).forEach((c) => {
    if (c.heldMs == null) return;
    c.readyAt = now + c.heldMs;                                    // exactly what it had left, from here
    c.issuedAt = now;
    c.heldMs = null;
    c.frozen = false;
  });
}

export function rollBastionAttack(s: AppState, ch, scale, dice) {
  const b = ch.bastion;
  const walled = !!b.walls, armed = !!b.armed;
  // House rule [TABLE] — a consequence of the inverted trigger, not a preference. The book rolls
  // once so it never needed a scale; this rolls per room, so a six-room keep rolling the hostile
  // result six times has to mean something. It means six rooms saw them coming.
  // The number of rooms that rolled the hostile result IS the size of the trouble.
  // A quiet house that got unlucky is a raid. A keep whose every room was working is a siege.
  const waves = Math.max(1, scale || 1);
  let ones = 0;
  for (let i = 0; i < waves; i++) ones += rollAttackOnes(walled, armed, dice);
  const roster = b.defenders || [];
  const killedN = Math.min(ones, roster.length);
  const fallen = roster.slice(0, killedN).map((d) => ({ id: d.id, name: d.name, age: d.age, role: d.role }));

  let overflow = ones - killedN;
  const allies: any[] = [];
  (b.combinedWith || []).forEach((pid) => {                                    // combined keeps share the losses
    if (overflow <= 0) return;
    const partner = s.characters[pid];
    if (!partner || !partner.bastion || !Array.isArray(partner.bastion.defenders)) return;
    const absorb = Math.min(overflow, partner.bastion.defenders.length);
    if (absorb <= 0) return;
    allies.push({ charId: pid, name: partner.name, keep: partner.bastion.name,
                  taken: partner.bastion.defenders.slice(0, absorb).map((d) => ({ id: d.id, name: d.name, age: d.age, role: d.role })) });
    overflow -= absorb;
  });

  let victimFacId: any = null;
  if (overflow > 0) {
    const targets = (b.facilities || []).filter((f) => (BASTION_FACILITIES[f.defId] || {}).kind === "special" && (f.disabledUntil || 0) <= 0);
    if (targets.length) victimFacId = targets[Math.floor(Math.random() * targets.length)].id;
  }
  return { waves, walled, armed, ones, fallen, allies, overflow, victimFacId,
           remain: roster.length - killedN, refugees: (b.refugees || 0) > 0 };
}

// [TABLE] A happening SUPERSEDES the one it interrupts; it does not queue beside it. House rule: after an
// attack the festival is over anyway. So the fair ends where it stood — its log is written, its held
// clocks released — and the thing that ended it carries its name away as a TINT.
//
// The tint is flavour and nothing else: no dice change, no lock changes, no gold moves. But it is a
// universal response to the stimulus. Raiders at a keep full of festival-goers is not the same night
// as raiders at a quiet keep, and I shouldn't describe them identically just because the 6d6
// don't know the difference.
export function supersedeHappening(s: AppState, ch) {
  const bt = ch.bastion.happening;
  if (!bt) return null;
  const was = bt.kind;
  resolveBastionHappening(s, ch);          // it ends NOW, wherever it had got to — logged, clocks released
  return was;
}

export const HAPPENING_TINTS = {
  festival: {
    open: "They come up the road while the fair is still going. Half of Ravenhold is full of strangers who paid to be here, and not one of them is armed.",
    line: "The trestles are being turned over for cover. Somebody's stall is on fire. The household is trying to fight and count heads at the same time, and doing neither well.",
    end: "The fair is over. Nobody declared it over; the carts simply started leaving and did not stop.",
  },
  standoff: {
    open: "They come while there are already men outside the gate doing nothing, which turns out to have been the polite ones.",
    line: "The ones who were only standing there are suddenly not the problem, and are also suddenly not leaving.",
    end: "Whoever was at the gate before this started is gone. Nobody saw them go and nobody is asking.",
  },
  raiders: {
    open: "They come while the yard is still full of what the last lot didn't carry off.",
    line: "Twice in a week is not bad luck. Twice in a week is somebody who has decided this place is a larder.",
    end: "Two in a week. Somebody is going to have to do something about the valley, and everybody knows who.",
  },
  aid: {
    open: "They come while half the garrison is somewhere else entirely, doing somebody else a favour.",
    line: "There are fewer hands on the wall than there should be, and everyone knows exactly whose hands are missing and where they went.",
    end: "Word will have to go after the others. They are going to hear about this on the road home.",
  },
};

export function battleBeats(ch, o) {
  const b = ch.bastion, form = bForm(b), room = (id) => { const f = (b.facilities || []).find((x) => x.id === id); return f ? bDef(f).name.toLowerCase() : "a hall"; };
  const beats: any[] = [];
  const say = (text) => beats.push({ text });

  const tint = HAPPENING_TINTS[o.tint] || null;
  say(tint ? tint.open
     : o.waves > 1
       ? "They come at " + b.name + " from more than one side at once. Every room that had a light burning tonight has someone outside it."
       : "The alarm goes up. Whatever is out there was not expected, and is not stopping.");

  if (o.walled) say((bForm(b) || {}).id === "vessel"
     ? "The hardened hull turns them at the waterline. Plated timber and iron bought with five thousand gold, and tonight it is the cheapest thing " + ch.name + " ever paid for. The ballistae are run out, and the deck-engines with them."
     : "The wall holds them at the outside. Twenty feet of stone bought with five thousand gold, and tonight it is the cheapest thing " + ch.name + " ever paid for.");
  else say((bForm(b) || {}).id === "vessel"
     ? "There is no plating. There never was — just planking and paint, and everyone aboard knows exactly how much that is going to matter in about a minute."
     : "There is no wall. There has never been a wall. Everyone inside knows exactly how much that is going to matter in about a minute.");

  if (o.armed) say("The Armory is open and emptying \u2014 the " + (ARMORY_KIT_BY_FORM[(bForm(b) || {}).id || "keep"] || "arms and armor") + " in other hands now, and not to be there again tomorrow.");
  if (tint) say(tint.line);
  if (!(b.defenders || []).length) say("Nobody musters. There is no garrison — only the household, and the household is not armed.");
  else say((b.defenders || []).length + " at the line, and the first of it lands.");

  o.fallen.forEach((d, i) => say(
    i === o.fallen.length - 1 && o.fallen.length > 1
      ? "And " + d.name + ", " + (d.role || "defender") + ", " + (d.age ? "aged " + d.age + ", " : "") + "goes down last of all, and does not get up."
      : d.name + " — " + (d.role || "defender") + (d.age ? ", " + d.age : "") + " — falls."));

  o.allies.forEach((a) => say(a.keep + " takes the weight: " + a.taken.map((d) => d.name).join(", ") + " fall on " + a.name + "'s side of the line instead of on " + ch.name + "'s. That was the pact. This is what the pact costs."));

  if (o.refugees) say(o.overflow > 0
    ? "The refugees are put out the back while the fighting is at the front. Some of them get clear. Some of them are seen going, and what was at the gate peels off to follow."
    : "The refugees are pushed into the deepest room there is and told to be quiet. They are quiet. They have done this before.");

  if (o.overflow > 0) {
    say("The line breaks.");
    say(o.victimFacId
      ? "They get in as far as the " + room(o.victimFacId) + " before somebody turns them. It will not be usable for a while — nothing in there survived being fought over."
      : "They get in, find nothing left worth breaking, and go back out the way they came. That is somehow worse.");
  } else if (o.fallen.length || o.allies.length) {
    say("And then it stops. The line held. It cost what it cost.");
  } else {
    say((o.walled ? "The ring never opened. " : "") + "By dawn there is nobody out there. Not one loss. Somebody is going to say it was luck, and somebody else is going to be insulted by that.");
  }
  if (tint) say(tint.end);
  // hang the clock on the arc, with a human's unevenness
  const now = Date.now();
  let at = now;
  beats.forEach((x) => {
    at += Math.round(BATTLE_BEAT_SEC * 1000 * (1 + (Math.random() * 2 - 1) * BATTLE_JITTER));
    x.at = at;
  });
  return beats;
}

// Hang the battle on the keep and start the countdown. Nothing has happened yet — the roster is
// whole, the dead are still standing at the wall. That gap is the point.
// EXCHANGE. The one thing the dice cannot give you: somebody came, and everybody lived.
//
// Per-room scaling makes a six-room siege 36d6 — 99.9% lethal. The bloodless outcome exists at one
// wave (33.5%) and is mathematically extinct at any keep worth having. But the record says bloodless
// was the MAJORITY: Caister was two months of cannon for one dead servant, and "nearly all of the
// confrontations ended with few injuries and certainly no deaths" (Paston Letters). Armed men turned
// up, postured, and went home, and the house talked about it for a year.
//
// So it is an EVENT, not an outcome. It locks the keep (hostile), runs the full clock, lands the
// beats, tints whatever it interrupts — and calls rollBastionAttack never. No roster changes, no
// graveyard, no gold. It does not care how many rooms you have.
export function stageBastionStandoff(s: AppState, ch, t, scale) {
  const tint = supersedeHappening(s, ch);
  const b = ch.bastion, form = bForm(b), n = (b.defenders || []).length;
  const beats: any[] = [];
  const say = (x) => beats.push({ text: x });
  const tn = HAPPENING_TINTS[tint] || null;
  say(tn ? tn.open : "Riders on the road, and they are not slowing down.");
  say("They stop short of the gate and sit their horses, looking at it. Somebody counts them. Somebody else counts them again and gets a different number.");
  if (tn) say(tn.line);
  say(n ? n + " on the wall, and every one of them told to do nothing at all, which is harder."
        : "There is nobody on the wall. There is only the wall, and whoever built it did better than they knew.");
  say("A long time passes in which nothing whatever happens, and it is the longest anyone here has spent doing nothing.");
  say(b.walls ? "Somebody out there says something to somebody else about the ring of it, and they turn round."
              : "They look at the gate for a while longer, and then at each other, and the moment goes out of it.");
  say("They go. Nothing was decided. Nobody is hurt and nobody is satisfied, and " + b.name + " will be talking about tonight at midwinter.");
  if (tn) say(tn.end);
  const now = Date.now();
  let at = now;
  beats.forEach((x) => { at += Math.round(BATTLE_BEAT_SEC * 1000 * (1 + (Math.random() * 2 - 1) * BATTLE_JITTER)); x.at = at; });
  ch.bastion.happening = { kind: "standoff", lock: "all", turnN: t.n, startedAt: now,
    endsAt: beats[beats.length - 1].at, beats, shown: 0, outcome: { waves: Math.max(1, scale || 1), tint, walled: !!b.walls } };
  holdBastionClocks(ch.bastion, now);
  t.prompt = "Nobody died and nothing was settled, which is somehow worse. Who on that wall wanted them to try it? Who is quietly relieved and will never say so?";
}

export function stageBastionBattle(s: AppState, ch, t, scale, dice) {
  const tint = supersedeHappening(s, ch);   // whatever was going on stops, and lends its name to this
  const o: any = rollBastionAttack(s, ch, scale, dice);
  o.raid = (dice != null && dice < BASTION_ATTACK_DICE);   // a raid, not a siege — the beats should say so
  o.tint = tint;
  if (ch.bastion.armed) ch.bastion.armed = false;                              // single use — spent tonight either way
  const beats = battleBeats(ch, o);
  ch.bastion.happening = { kind: "attack", lock: "all", turnN: t.n, startedAt: Date.now(), endsAt: beats[beats.length - 1].at, beats, shown: 0, outcome: o };
  holdBastionClocks(ch.bastion, Date.now());   // the week, the wings going up, the ring closing — all of it stops
  t.benefits.push("⚔ Attack — " + (o.waves > 1 ? o.waves + " rooms saw them coming. " : "") + "The keep is fighting. Nothing is decided until it stops.");
}

// The last beat has landed. NOW people die. Everything here was decided at stageBastionBattle —
// this function rolls nothing, so what the player watched cannot disagree with what happened.
// One happening, many kinds. Dispatches on kind exactly as applyBastionEvent dispatches on effect,
// and for the same reason: a row without a handler is scenery, and scenery shipped here for weeks.
// THE TELLING. A happening writes itself out over minutes, one beat at a time — and then it is over,
// and what stays is one chunk of prose on the turn. Not an array of beats: a paragraph.
//
// t.flavor IS the bastion's log and always has been. Every resolved turn has one, three views
// already render it, and it has been there since the first week. The happenings were writing
// battleLog / aidLog / festivalLog instead — parallel fields, read by nothing, in 15,000 lines. A
// siege ran its beats, you watched it, somebody died, and then it went into a field I never
// have a view for. It was not that the past was not stored. It was stored in the wrong drawer.
//
// The beats are already sentences and already in order, so the telling IS the beats, joined. What it
// is not is a list: nobody re-reads a bulleted siege. They re-read the week.
export const tellingOf = (bt) => (bt && bt.beats ? bt.beats.map((x) => x.text).join(" ") : "");

export function resolveBastionHappening(s: AppState, ch) {
  const bt = ch.bastion.happening;
  if (!bt) return;
  switch (bt.kind) {
    case "attack": resolveHappeningAttack(s, ch); break;
    case "standoff": {
      // Nothing to apply. Nobody died; that IS the outcome. Write it down and give the keep back.
      const bt = ch.bastion.happening, tt = (ch.bastion.turns || []).find((x) => x.n === bt.turnN);
      if (tt) {
        tt.flavor = tellingOf(bt);
        tt.benefits.push("\u{1F6E1} They came, and they went, and not one of yours is hurt. Nothing was decided.");
      }
      ch.bastion.happening = null;
      releaseBastionClocks(ch.bastion, Date.now());
      break;
    }
    case "aid": {
      // The road home. DMG's arithmetic, decided when they rode out and told only now.
      const bt = ch.bastion.happening, o = bt.outcome;
      const tt = (ch.bastion.turns || []).find((x) => x.n === bt.turnN) || { benefits: [], date: "", n: bt.turnN };
      if (o.lost) {
        const gone = (ch.bastion.defenders || []).filter((d) => d.id === o.lost.id);
        ch.bastion.defenders = (ch.bastion.defenders || []).filter((d) => d.id !== o.lost.id);
        entombDefenders(ch.bastion, gone, tt.date, bt.turnN);
      }
      bastionGold(s, ch, tt, o.reward,
        o.won ? "Answered a call for aid — " + o.sent + " sent, all home"
              : "Answered a call for aid — solved, but " + o.lost.name + " did not come home",
        o.won ? "They were back inside the week, filthy and pleased with themselves, and the local lord's man came after with a purse."
              : "The purse came anyway, halved, with an apology nobody asked for. " + o.lost.name + " is buried at the keep.");
      tt.flavor = tellingOf(bt);
      if (!tt.prompt) tt.prompt = o.won
        ? "Everyone came home. Somebody in a nearby village is telling a story about your people right now, and getting it wrong."
        : "It was solved. It cost " + o.lost.name + ". The household did the arithmetic and has not said it out loud.";
      ch.bastion.happening = null;
      releaseBastionClocks(ch.bastion, Date.now());
      break;
    }
    case "festival": {
      // Nothing was decided and nobody was at risk — the outcome (the DMG's extra roll, and the 500
      // gp) landed when the event resolved. All that was pending was the week, running slow.
      const bt = ch.bastion.happening, tt = (ch.bastion.turns || []).find((x) => x.n === bt.turnN);
      if (tt) { tt.flavor = tellingOf(bt); tt.benefits.push("✦ The fair is over. The yard is swept and " + ch.bastion.name + " is spoken of differently now."); }
      ch.bastion.happening = null;
      releaseBastionClocks(ch.bastion, Date.now());                // the masons go back to it
      break;
    }
    default:       ch.bastion.happening = null; break;   // an unknown kind ends rather than sticks
  }
}

export function resolveHappeningAttack(s: AppState, ch) {
  const bt = ch.bastion.happening;
  if (!bt) return;
  const o = bt.outcome, b = ch.bastion;
  const t = (b.turns || []).find((x) => x.n === bt.turnN);

  const ids = new Set(o.fallen.map((d) => d.id));
  const fallen = (b.defenders || []).filter((d) => ids.has(d.id));
  b.defenders = (b.defenders || []).filter((d) => !ids.has(d.id));
  entombDefenders(b, fallen, t ? t.date : todayLocal(), bt.turnN);

  o.allies.forEach((a) => {                                                    // the pact is paid on the partner's roster
    const partner = s.characters[a.charId];
    if (!partner || !partner.bastion) return;
    const aids = new Set(a.taken.map((d) => d.id));
    const took = (partner.bastion.defenders || []).filter((d) => aids.has(d.id));
    partner.bastion.defenders = (partner.bastion.defenders || []).filter((d) => !aids.has(d.id));
    entombDefenders(partner.bastion, took, t ? t.date : "", bt.turnN);
  });

  if (o.victimFacId) {
    const victim = (b.facilities || []).find((f) => f.id === o.victimFacId);
    if (victim) victim.disabledUntil = bt.turnN + 1;                           // DMG: shut down for the next turn, repaired free after
  }

  if (t) {
    // The whole battle log goes into the turn as one piece — the record is what gets written from.
    t.flavor = tellingOf(bt);
    t.benefits = (t.benefits || []).filter((x) => x.indexOf("The keep is fighting") === -1);
    t.benefits.push(o.overflow > 0
      ? "⚠ Attack — the line broke" + (o.fallen.length ? " (" + o.fallen.map((d) => d.name).join(", ") + " fell)" : "") + (o.victimFacId ? "; " + ((b.facilities || []).find((f) => f.id === o.victimFacId) ? bDef((b.facilities || []).find((f) => f.id === o.victimFacId)).name : "a hall") + " is shut down next turn." : ".")
      : o.fallen.length || o.allies.length
        ? "⚔ Attack — the defenders held; " + (o.fallen.length ? o.fallen.map((d) => d.name).join(", ") + " fell (" + o.remain + " remain)." : "no losses at home.")
        : (o.walled ? "🧱 " : "") + "Attack — repelled with no losses.");
    o.allies.forEach((a) => t.benefits.push("🤝 " + a.keep + " took " + a.taken.length + " of it: " + a.taken.map((d) => d.name).join(", ") + "."));
    if (!t.prompt) t.prompt = o.fallen.length
      ? "Somebody has to write to " + o.fallen[0].name + "'s people. " + ch.name + " is somebody. What does the letter say, and what does it leave out?"
      : "Nobody died. " + ch.name + " has been counting the household twice since dawn anyway. Why?";
  }
  // The fighting has stopped. Whatever the household was told to do this week, it starts now — the
  // days it owes were never spent while it was defending itself.
  const wasHeld = !!(t && t.heldMs != null);
  b.happening = null;                                               // clear FIRST — bastionFrozenBy reads it
  releaseBastionClocks(b, Date.now());                              // the week, the half-raised wing, the half-closed ring
  if (wasHeld && t) t.benefits.push("🔨 The gate is shut and the yard is swept. Back to work — " + (t.daysOwed || 7) + " days of it, starting now.");
}

export const rollDice = (n, sides) => { let t = 0; for (let i = 0; i < n; i++) t += 1 + Math.floor(Math.random() * sides); return t; };

// Money the household simply hands you when you next come home.
export function bastionGold(s: AppState, ch, t, gp, why, flavor) {
  ch.gp = (ch.gp || 0) + gp;
  t.benefits.push(why + " — " + gp + " gp.");
  s.logEntries.push({
    id: "log" + s.nextId++, charId: ch.id, entryType: "EARNING", status: "APPROVED",
    date: t.date, dtEarned: 0, gpEarned: gp,
    summary: ch.bastion.name + " — " + why + " (" + gp + " gp)",
    flavor,
  });
}

// The house's size, for festival purposes: every room it has, not just the level-gated ones. A hall
// with eight rooms throws a bigger party than one with three, and the kitchen is not less of a room
// than the Sanctum. Floors at 1 so a keep with nothing in it can still hold a wake.
export const festivalRooms = (b) => Math.max(1, ((b && b.facilities) || []).filter((f) => !f.building).length);

// Rolled ONCE, when the offer is made, and remembered on the call — the price you were quoted is the
// price you pay. Re-rolling it at ANSWER_CALL would mean the number on the button was a lie.
export function rollFestivalCost(b) {
  const rooms = festivalRooms(b);
  let gp = 0;
  for (let i = 0; i < rooms; i++) gp += d6() * 100;
  return gp;
}

export const OPPORTUNITIES = [
  "to host the harvest festival, which has never been held here and would be talked about for years",
  "to fund a spellcaster's research, on terms generous to the spellcaster",
  "to feed and flatter a noble who is passing through and expects to be fed and flattered",
];

export function resolveOpportunity(s: AppState, ch, t) {
  const what = pick(OPPORTUNITIES);
  const cost = rollFestivalCost(ch.bastion);
  if ((ch.gp || 0) < cost) {
    t.benefits.push("Extraordinary Opportunity — declined; there wasn't " + cost + " gp in the house.");
    t.prompt = "The offer came " + what + ". The house couldn't cover it, and it went elsewhere. It always does.";
    return;
  }
  // DMG: "IF YOU SEIZE the opportunity, you must pay 500 GP... IF YOU DECLINE the opportunity, you
  // don't pay the money and nothing else happens." A CHOICE — and this used to seize it for you the
  // moment you could afford it. 500 gp left without a click and declining was unreachable.
  ch.bastion.pendingCall = { kind: "festival", turnN: t.n, by: "", what,
    cost, label: "The chance came " + what + ". It wants " + cost + " gp and an answer.", raisedOn: t.date };
  t.benefits.push("⚑ Extraordinary Opportunity — the offer is on the table. " + cost + " gp, and it is yours to take or leave.");
  t.prompt = "Somebody is waiting in the hall for a yes or a no, and " + ch.name + " is doing arithmetic they already know the answer to. What are they actually weighing?";
  return;
}

// DMG "Friendly Visitors": "They offer 1d6 x 100 GP for the brief use of that facility ... Their use of
// the facility doesn't interrupt any orders you've issued to it."
export function resolveFriendlyVisitors(s: AppState, ch, t) {
  const rooms = (ch.bastion.facilities || []).filter((f) => (BASTION_FACILITIES[f.defId] || {}).kind === "special");
  const room = rooms.length ? ((BASTION_FACILITIES[rooms[Math.floor(Math.random() * rooms.length)].defId] || {}).name || "keep").toLowerCase() : "keep";
  bastionGold(s, ch, t, d6x100(), "Friendly visitors paid for the use of the " + room,
    "They were courteous, they were quick, and they left the " + room + " tidier than they found it. Somebody wanted to know who you were.");
}

// DMG "Guest" (1d4).
export function resolveGuest(s: AppState, ch, t) {
  const r = 1 + Math.floor(Math.random() * 4);
  if (r === 1) {
    if (!Array.isArray(ch.bastion.letters)) ch.bastion.letters = [];
    const who = pick(HENCH_FIRST) + " " + pick(HENCH_LAST);
    ch.bastion.letters.push({ id: "ltr" + s.nextId++, from: who, date: t.date });
    t.benefits.push("✉ A guest of great renown stayed a week and left a letter of recommendation.");
    t.prompt = who + " stayed seven days, asked good questions, and left a letter with your name in it. It is worth more than money and everyone in the house knows it.";
  } else if (r === 2) {
    bastionGold(s, ch, t, d6x100(), "A guest took sanctuary here and left a gift",
      "They didn't say what they were running from, and nobody asked. They left before dawn, and left more than they needed to.");
  } else if (r === 3) {
    // THE CAP IS THE CAP, and this path did not check it. Found 17 Jul by the invariants: a keep with
    // NO BARRACKS ended a Guest week with one defender on the roster and nowhere to put them.
    //
    // Two writers, one rule, and only one of them enforcing it. The Barrack's own recruit order does
    // it properly — `Math.min(BARRACKS_RECRUIT, cap - roster.length)` — and this one just pushed.
    // The prompt even says "they need no room; they sleep where they fall", which is the fiction
    // apologising for the bug: there IS no bunk, because there is no barracks.
    //
    // DMG, Barracks: "Space: Roomy... Hirelings: Bastion Defenders" — defenders live in a Barrack.
    // A keep with no Barrack has no defenders, and a full one has no room for another.
    if (!Array.isArray(ch.bastion.defenders)) ch.bastion.defenders = [];
    const cap3 = bastionDefenderCap(ch.bastion);
    if (ch.bastion.defenders.length >= cap3) {
      // They still came. There is simply nowhere to put them, and that is its own small story.
      t.benefits.push("\u2694 A mercenary came looking for a bunk and found " + (cap3 ? "every one of them full" : "no barracks at all") + ". They took a meal and went on.");
      t.prompt = "Somebody good turned up looking for work and " + ch.bastion.name + " had nowhere to put them. "
        + (cap3 ? "Who is in the bunk they wanted, and are they worth it?" : "What would it take to build somewhere to sleep?");
      return;
    }
    const d = randDefender(s);
    ch.bastion.defenders.push(d);
    t.benefits.push("⚔ A mercenary took a bunk and stayed — " + d.name + " defends " + ch.bastion.name + " now.");
    t.prompt = d.name + " arrived looking for work and found it. They need no room; they sleep where they fall. They stay until you send them away.";
  } else {
    const beast = pick(["a brass dragon, young and talkative", "a treant who came for the garden and stayed for the quiet", "an owlbear nobody is willing to describe as tame"]);
    ch.bastion.guardian = { what: beast, since: t.date };
    t.benefits.push("🐉 A friendly monster is lodging here. It will see off one Attack, and lose you nobody.");
    t.prompt = "There is " + beast + " in the courtyard. The household has decided, collectively and without discussion, to behave normally about this.";
  }
}

// DMG "Refugees": "A group of 2d4 refugees ... offer you 1d6 x 100 GP as payment for your hospitality
// and protection. They stay until you find them a new home or a hostile force attacks your Bastion."
export function resolveRefugees(s: AppState, ch, t) {
  const n = rollDice(2, 4);
  const hasRoom = (ch.bastion.facilities || []).some((f) => (BASTION_FACILITIES[f.defId] || {}).kind === "basic" && f.size !== "cramped");
  ch.bastion.refugees = { n, since: t.date };
  bastionGold(s, ch, t, d6x100(), n + " refugees paid for shelter",
    hasRoom
      ? "They sleep in the hall and are gone before the household wakes, every morning, to work at whatever they can find."
      : "There was no room inside, so they camped against the outer wall. They paid anyway. That's the part that sits badly.");
  t.prompt = n + " of them, with what they could carry. They'll stay until somewhere better exists, or until something comes for the keep.";
}

// DMG "Request for Aid": "Roll 1d6 for each Bastion Defender you send. If the total is 10 or higher,
// the problem is solved and you earn a reward of 1d6 x 100 GP. If the total is less than 10, the
// problem is still solved, but the reward is halved and one of your Bastion Defenders is killed."
// DMG: "you must dispatch ONE OR MORE Bastion Defenders. Roll 1d6 FOR EACH Bastion Defender you
// send. If the total is 10 or higher, the problem is solved and you earn 1d6 x 100 GP. If the total
// is less than 10, the problem is still solved, but the reward is halved and one of your Bastion
// Defenders is killed."
//
// THE PLAYER CHOOSES HOW MANY. This used to send the whole garrison every time, which deleted the
// only decision in the event: more dice is likelier success, but everyone you send is away if
// something else comes to the gate — and failure kills one of whoever went. So it raises a CALL and
// waits. ANSWER_CALL rolls it.
export function resolveRequestForAid(s: AppState, ch, t) {
  const roster = ch.bastion.defenders || [];
  if (!roster.length) {
    t.benefits.push("Request for Aid — there was nobody to send.");
    t.prompt = "A rider came asking for help and found a keep with nobody in it to give. They were polite about it, which was worse.";
    return;
  }
  // DMG: "you must dispatch ONE OR MORE Bastion Defenders. Roll 1d6 FOR EACH Bastion Defender you
  // send." The PLAYER chooses how many, and that choice IS the event: three of twelve is likelier to
  // fail and failure kills one of the three; twelve is safe, but the gate is empty if anything else
  // comes. This sent the whole garrison every time, so the decision did not exist.
  ch.bastion.pendingCall = { kind: "aid", turnN: t.n, by: "", max: roster.length,
    label: "A rider is at the gate asking for help. You have " + roster.length + ". How many go?", raisedOn: t.date };
  t.benefits.push("⚑ Request for Aid — a rider is at the gate. " + roster.length + " to send, and how many is your call.");
  t.prompt = "They are waiting in the yard while somebody decides. Everyone who goes is somebody who is not here if the next thing comes up the road. Who does " + ch.name + " ask, and who volunteers before they're asked?";
}

// DMG "Magical Discovery": "Your hirelings discover or accidentally create an Uncommon magic item of
// your choice at no cost to you. The magic item must be a Potion or Scroll."
//
// Minted the same way the bastion's own Craft order mints things — UNTRADEABLE, provenance recorded to
// the keep. AL explicitly permits a bastion to produce magic items ("A Craft: Magic Item must be as
// described within the DMG..."), so a bastion is an accepted source; it's silent on event-granted ones,
// and the DMG fills that silence. Untradeable keeps it out of the economy either way.
export function bastionMintItem(s: AppState, ch, t, catalogId, how) {
  const cat = CATALOG[catalogId];
  if (!cat) return null;
  const iid = "it" + s.nextId++;
  s.items[iid] = mkItem(iid, catalogId, itemClassOf(catalogId, "UNTRADEABLE"), ch.campaign, verified("CRAFTED", ch.bastion.name), { type: "CHARACTER", id: ch.id });
  t.benefits.push(how + ": " + cat.name + " (character-created, not tradeable).");
  return cat;
}

export function resolveMagicalDiscovery(s: AppState, ch, t) {
  const finds = Object.keys(CATALOG).filter((k) => CATALOG[k].consumable && CATALOG[k].rarity === "uncommon");
  if (!finds.length) { t.benefits.push("Magical Discovery — nothing came of it."); return; }
  const cat = bastionMintItem(s, ch, t, pick(finds), "✨ Magical Discovery");
  t.prompt = "Nobody will say whether they found it or made it. " + (cat ? cat.name : "It") + " was simply on the bench one morning, and the hirelings have closed ranks about it.";
}

// DMG "Treasure" (1d100): 01–40 → 25 gp art · 41–63 → 250 gp · 64–73 → 750 gp · 74–75 → 2,500 gp
//                         76–90 → Common magic · 91–98 → Uncommon · 99–00 → Rare
export const ART_OBJECTS = {
  25:   ["a silver ewer", "a carved bone statuette", "a small gold bracelet", "a cloth-of-gold vestment", "a black velvet mask stitched with silver thread"],
  250:  ["a gold ring set with bloodstones", "a carved ivory statuette", "a large gold bracelet", "a silver necklace with a gemstone pendant", "a bronze crown"],
  750:  ["a silver chalice set with moonstones", "a silver-plated steel longsword with jet set in its hilt", "a carved harp of exotic wood with ivory inlay", "a small gold idol"],
  2500: ["a gold dragon comb set with red garnets as eyes", "a bottle stopper cork embossed with gold leaf and set with amethysts", "a ceremonial electrum dagger with a black pearl in the pommel"],
};

export function resolveTreasure(s: AppState, ch, t) {
  const r = 1 + Math.floor(Math.random() * 100);
  if (r <= 75) {
    const gp = r <= 40 ? 25 : r <= 63 ? 250 : r <= 73 ? 750 : 2500;
    const what = pick(ART_OBJECTS[gp]);
    bastionGold(s, ch, t, gp, "Treasure — " + what + " came to the keep",
      "An inheritance, a gift, a theft, or a piece of luck. Nobody has volunteered which, and you have not asked.");
    t.prompt = what + " is at " + ch.bastion.name + " now, worth about " + gp + " gp, and there is no note with it.";
    return;
  }
  const rarity = r <= 90 ? "common" : r <= 98 ? "uncommon" : "rare";
  const pool = Object.keys(CATALOG).filter((k) => CATALOG[k].rarity === rarity && !CATALOG[k].mundane && CATALOG[k].itemClass !== "STORY_ITEM");
  if (!pool.length) { t.benefits.push("Treasure — something arrived, but nothing you could put a name to."); return; }
  const cat = bastionMintItem(s, ch, t, pick(pool), "💎 Treasure");
  t.prompt = (cat ? cat.name : "Something") + " arrived at " + ch.bastion.name + " with no explanation whatsoever. The household is being extremely casual about it, which is how you know they're curious too.";
}

// Every event resolves through here. If you add a row to the table, you add a case here — and the
// suite asserts the two lists match, so an event can never quietly go back to being scenery.
export function applyBastionEvent(s: AppState, ch, t, ev) {
  switch (ev.effect) {
    case "attack":      stageBastionBattle(s, ch, t, t.battleScale || 1, 6); break;   // the siege: 6 dice a wave
    case "raiders":     stageBastionBattle(s, ch, t, t.battleScale || 1, BASTION_ATTACK_DICE_RAID); break;   // hungry, not political
    case "standoff":    stageBastionStandoff(s, ch, t, t.battleScale || 1); break;   // nobody rolls anything
    case "criminal":    resolveCriminalHireling(s, ch, t); break;
    case "lost":        resolveLostHirelings(s, ch, t); break;
    case "opportunity": resolveOpportunity(s, ch, t); break;
    case "visitors":    resolveFriendlyVisitors(s, ch, t); break;
    case "guest":       resolveGuest(s, ch, t); break;
    case "discovery":   resolveMagicalDiscovery(s, ch, t); break;
    case "refugees":    resolveRefugees(s, ch, t); break;
    case "aid":         resolveRequestForAid(s, ch, t); break;
    case "treasure":    resolveTreasure(s, ch, t); break;
    case "allwell": {
      t.benefits.push(pick(BASTION_ALL_IS_WELL));                 // the d12 quiet-week flavour, unchanged
      if (Math.random() < BASTION_FOUND_COIN.chance) {            // a separate, low chance: found some silver
        const n = BASTION_FOUND_COIN.dice();                       // 1d4 silver pieces
        const coin = Math.round(n * 0.1 * 100) / 100;              // n sp -> gp, exact to the copper
        ch.gp = Math.round(((ch.gp || 0) + coin) * 100) / 100;     // credit the purse, clean
        t.benefits.push(BASTION_FOUND_COIN.line(n));               // the universal reward sentence, appended
        s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EARNING", status: "APPROVED",
          date: t.date, dtEarned: 0, gpEarned: coin,
          summary: ch.bastion.name + " — found " + n + " sp in the course of the week" });
      }
      break;
    }   // DMG's own 1d8, plus a rare incidental find
    default: if (ev.note && !t.prompt) t.prompt = ev.note;
  }
}

// The turn's event.
//
// ***HOUSE RULE — THE DEEP GROUNDS EXCHANGE'S OWN, not a citation, and not SCALE's.***
// This app is making the call; no org has agreed to it. The sources conflict and neither supports it outright:
//   DMG: events roll ONLY when Maintain is issued.
//   ALPG: "Maintain Orders return an 'All is Well' event result."
// Stacked literally (ALPG over DMG), the only trigger always returns All Is Well, so an AL bastion
// would never roll anything — no Attacks, no Refugees, no Treasure, ever. The house rule threads it:
// **Maintain = the hero is home, hands on the keep, so it is at its highest protection and returns
// All Is Well. Any other order means the hands are busy elsewhere, and the world gets its roll.**
// This inverts the DMG's trigger. It is a deliberate house rule, made because the literal stack
// leaves the feature inert. Label it as the Exchange's assumption wherever it surfaces — never as AL,
// and never as SCALE's: SCALE is an organisation that has agreed to nothing here.
export function resolveBastionEvent(s: AppState, ch: CharacterRecord, t: BastionTurn, leisure) {
  if (t.event) return;                                                // already rolled at issue — see TAKE_BASTION_TURN
  if (t.maintain && !bastionUnderConstruction(ch.bastion)) {         // ALPG: Maintain returns "All is Well" — but only a keep with nothing being built is truly quiet
    t.event = "All Is Well"; t.events = ["All Is Well"];
    t.benefits.push(t.away
      ? "The keep kept itself while you were away — all is well."
      : "You spent the week on the keep itself. All is well, and nothing was left to chance.");
    return;
  }
  if (t.maintain) t.benefits.push("Masons were at work on the keep all week — a building site draws eyes, and even a Maintain week was not the quiet kind.");
  // ↑ construction "counts as an event of sorts": a Maintain turn taken while something is being built
  //   does NOT come back All Is Well. It falls through to a roll — the site is the week's conspicuous thing.
  // ONE ROLL PER ORDERED FACILITY (Exchange). The books roll once per Maintain order, per character
  // — never per room. This app rolls for each room that WORKED this turn, because under the
  // inversion below the noise is what draws the event: a keep running four orders is four times as
  // conspicuous as a keep running one. It is also what scales a siege — the number of rooms that
  // rolled the hostile result is how big the trouble at the gate is.
  //
  // WHAT IT COSTS. Measured against this reducer, 8,000 runs each on Rath's keep, by rooms ordered:
  //     rooms   net gp   attack   all-quiet   events/turn
  //         1       57     5.0%       50.1%      1.00
  //         2       84     9.7%       25.8%      1.09
  //         4       96    18.4%        6.1%      1.33
  //         6       82    26.8%        1.4%      1.56
  // A busy keep is four times the TROUBLE and roughly the same PURSE — the purse cap does that on
  // purpose (see eventsThatStand). A quiet week nearly stops existing past four rooms; that is the
  // fiction working. Deliberate.
  //
  // RE-MEASURE IF ANYTHING MOVES. These are observed, not arithmetic, and they have already been
  // wrong once: an earlier version of this comment read 31/65/122/147, measured before the purse cap
  // AND before the festival started asking instead of silently draining 500 gp. A stale number
  // wearing "measured over 5,000 runs" is worse than no number, because it reads as authority.
  let rolled;
  if (ch.bastion!.pendingEvent) { rolled = [ch.bastion!.pendingEvent]; ch.bastion!.pendingEvent = null; }   // a DM chose this one — it doesn't multiply by the room count
  // ---------------------------------------------------------------------------------------------
  // EXCHANGE RULE — a deliberate, known INVERSION of the books. Not silence being filled: a rule
  // being overruled on purpose. Labelled here so it reads as a decision and not an oversight.
  //
  // WHAT THE BOOKS SAY.
  //   DMG, Bastion Events: "Immediately after a character issues the Maintain order to their
  //   Bastion, the DM rolls once on the Bastion Events table... Bastion events occur ONLY when a
  //   Bastion is operating under the Maintain order."
  //   ALPG, Orders: "Maintain Orders return an 'All is Well' event result."
  //   Together: events fire only on Maintain, and AL forces Maintain to All Is Well. The table is
  //   dead on arrival in organized play. The only door left is the ALPG's "DMs adjudicate rolls."
  //
  // WHAT THIS APP DOES INSTEAD. The trigger is inverted: the table rolls on ACTIVE turns, and a
  // Maintain turn returns All Is Well (which is the one half AL and this app agree on).
  //
  // WHY. AL suppressed the table because organized play has no persistent DM to run an Attack
  // across sessions — the same reason it leaves "DMs adjudicate rolls" as the escape hatch. This
  // platform is that DM: it can run the event, meter it out, and hold the state between sessions.
  // AL removed the events because nobody was in the room; the Exchange is what stands in the room.
  // And the fiction earns it — a loud, smoky, working fortress draws attention. A keep whose forge
  // rings all week is a keep somebody notices. Maintain is the quiet week; quiet weeks are safe.
  //
  // WHAT IT COSTS, HONESTLY. This is not a story-only deviation. The paying events are Friendly
  // Visitors and Refugees (1d6 x 100 gp each), Treasure (an art object) and Magical Discovery (an
  // uncommon potion or scroll); Extraordinary Opportunity takes gold back, but only if the player
  // seizes it. Measured net on Rath's keep: 57 gp per active turn at one ordered room, 96 at four,
  // 82 at six — roughly flat, because the purse is capped (see the roll-count note above).
  // That is real income in the two currencies AL guards hardest, at a rate neither the DMG
  // (Maintain only) nor AL (never) would produce. If that gate ever needs closing, close it HERE,
  // at the trigger — not by quietly editing the events, which are the DMG's own and correct as
  // printed.
  // ---------------------------------------------------------------------------------------------
  else if (t.maintain) rolled = [rollBastionEvent(null, ch.bastion!.region)];   // maintain reaches here only under construction — one roll for the building site
  else rolled = t.orders.map(() => rollBastionEvent(null, ch.bastion!.region));

  // The fair is cancelled if there are men on the wall; the warrant still knocks. (eventsThatStand)
  const standing = eventsThatStand(rolled);
  // An All Is Well is a room reporting nothing. A room reporting nothing does not outvote a room
  // reporting a fire — so the quiet rolls are noise unless EVERY room was quiet, in which case the
  // week itself was quiet and says so once.
  const real = standing.filter((e) => e.effect !== "allwell");
  const happened = real.length ? real : standing.slice(0, 1);

  t.events = happened.map((e) => e.label);
  t.event = t.events.join(" \u00b7 ") || "All Is Well";

  // A siege is ONE battle however many rooms saw it coming — but how many DID is the size of it.
  // House rule [TABLE] — see above; the scale exists because the trigger is per-room.
  // The size is based on the facilities that each rolled the hostile clause. A quiet
  // house that got unlucky is a raid; a keep whose every room was working is an army at the gate.
  //
  // COUNT THE RAW ROLLS, not the standing ones. eventsThatStand dedupes — one of each per week — so
  // by the time it has finished, six rooms that all saw them coming look exactly like one room that
  // got unlucky. The dedupe is right for REPORTING (nobody narrates the same event twice) and wrong
  // for SCALE, and those are different questions asked of the same list.
  t.battleScale = rolled.filter(evIsHostile).length;
  const hostiles = happened.filter(evIsHostile);
  const toApply = hostiles.length
    ? happened.filter((e) => !evIsHostile(e)).concat([hostiles[0]])
    : happened;

  toApply.forEach((ev) => {
    if (leisure && ev.label && ev.label !== "All is Well") {                   // a notable turn at the retired keep seeds a diary prompt to expand later
      if (!Array.isArray(ch.retireTale)) ch.retireTale = [];
      ch.retireTale.push({ id: "tale" + s.nextId++, date: t.date, text: "", seed: ev.label });
    }
    applyBastionEvent(s, ch, t, ev);
    if (ev.note && !t.prompt) t.prompt = ev.note;                              // every event leaves something to write from
  });
}

export const furnNextTier = (id) => FURNISHING_TIERS[furnTierIndex(id) + 1] || null;

// The rung BELOW, or null when there isn't one. Serviceable has nothing under it, and
// FURNISHING_TIERS[-1] is undefined — which is a crash, not a value. Never index this blind.
export const furnPrevTier = (id) => (furnTierIndex(id) > 0 ? FURNISHING_TIERS[furnTierIndex(id) - 1] : null);

// "There is no workbenches" is how you can tell nobody read it back. Some of these are plural.
export const furnIsAre = (fn) => (fn && fn.plural ? "are" : "is");

export const furnNoneLeft = (fn) => (fn && fn.plural ? "There are no " : "There is no ");

// A room's own furniture — the slotted pieces it came with. (Anything else on the list is a personal
// effect: trinkets, keepsakes, the things a life leaves lying about. Those aren't the room's tools.)
export const roomFurniture = (fac) => ((fac && fac.furnishings) || []).filter((x) => !!x.slot);

// You can sell it all. Then the room is a room with nothing in it, and a smithy with no forge, no
// anvil and no tools is not a smithy — it's a shed. House rule [TABLE] — the DMG never contemplates
// a stripped facility because a home game would just say so; this needs a rule.
// House rule: strip a facility bare and it
// goes DORMANT until something is put back.
export function facilityDormant(fac) {
  const own = roomFurniture(fac);
  return own.length > 0 && own.every((x) => x.gone);
}

// What the town will actually give you for it.
//
// ALPG: "You may sell mundane equipment using the PH rules" — the PH's used-goods rate is half.
// DMG, Storehouse: "the buyer pays you 10 percent more than the standard price; ... 20 percent at
// level 9, 50 percent at level 13, and 100 percent at level 17." A keep with a Storehouse has a
// factor who argues for you; a keep without one takes what it's offered.
export const SELL_BACK_RATE = 0.5;   // ALPG: "You may sell mundane equipment using the PH rules." The PH sells used goods at 50% of purchase price — verified against the book, 15 Jul.

export const STOREHOUSE_MARKUP = (lvl) => (lvl >= 17 ? 1.0 : lvl >= 13 ? 0.5 : lvl >= 9 ? 0.2 : 0.1);   // DMG Storehouse

export function furnishingSaleValue(ch, fac, fn) {
  const base = furnishingValue(fac, fn) * SELL_BACK_RATE;
  const markup = bastionHas(ch.bastion, "storehouse") ? STOREHOUSE_MARKUP(ch.level || 1) : 0;
  return Math.max(1, Math.floor(base * (1 + markup)));
}

// Has the player made this piece their own? If the name still matches what the ladder would produce
// at its current tier, nobody has touched it and an upgrade may rename it. If they've renamed it,
// it's theirs and an upgrade leaves the name alone. Their word beats mine, always.
export const furnishingIsStock = (fn, form) => !fn.name || fn.name === furnishingName(fn.slot, fn.tier, form, fn.name);

export const CRIMINAL_HIRELING_FLAVOR = [
  "turns out to be wanted three towns over under a different name entirely",
  "has a warrant out, an old one, for something they swear was a misunderstanding",
  "is recognised by a bounty hunter who came for the ale and stayed for the arrest",
  "left a trail of debts behind them that has finally caught up",
  "is not, it emerges, who they said they were when they took the job",
];

// Word gets round that there's a post going. House rule [TABLE] — the DMG replaces lost hirelings
// free at the next turn and says nothing about ordinary attrition, because a home game does not
// track a household across months. This app does, so it needs a refill rate. The household refills at exactly the
// rate it empties — one post per turn the hero ACTUALLY TAKES. A week you weren't there for doesn't
// count; nobody takes a job at a house with nobody in it.
export function rehireOne(s: AppState, ch: CharacterRecord, t: BastionTurn) {
  // ...but not into a room that is shut. DMG, Lost Hirelings: "The facility can't be used on your
  // next Bastion turn, BUT THE HIRELINGS ARE REPLACED at no cost to you AT THAT POINT" — at that
  // point, not this one. The room is meant to stand empty in between, and an Attack's damaged
  // facility is no different. This guard was invisible until the event roll moved to issue-time:
  // the rehire used to run BEFORE the event, so it could never refill a room the event hadn't
  // emptied yet. Correct by accident of ordering is not correct.
  const short = (ch.bastion!.facilities || []).filter((f) => (f.henchmen || []).length < facEstablishment(f)
    && !facDisabled(f, t.n + 1)                                   // a room nobody may use yet gets nobody
    && f.staffLostOn !== t.n);                                    // and a post THIS WEEK'S event emptied is the book's to refill, not ours
  if (!short.length) return;
  const fac = short[Math.floor(Math.random() * short.length)];
  const before = (fac.henchmen || []).length;
  staffFacility(s, fac, 1);
  const who = fac.henchmen![fac.henchmen!.length - 1];
  const def = BASTION_FACILITIES[fac.defId] || {};
  t.benefits.push("👤 " + who.name + " took the post in the " + (def.name || fac.defId).toLowerCase() + " (" + (before + 1) + "/" + facEstablishment(fac) + ").");
  t.hires = [...(t.hires || []), { name: who.name, role: who.role, facId: fac.id }];
}

// DMG "Lost Hirelings": "One of your Bastion's special facilities (determined randomly) loses its
// hirelings. The cause of their departure is up to you. The facility can't be used on your next
// Bastion turn, but the hirelings are replaced at no cost to you at that point."
// The cause being "up to you" is the book inviting flavour — so I roll a reason that smells
// of the room they worked in, and hands it back as a writing prompt.
export function resolveLostHirelings(s: AppState, ch, t) {
  const staffed = (ch.bastion.facilities || []).filter((f) => (f.henchmen || []).length > 0);
  if (!staffed.length) { t.benefits.push("Lost Hirelings — there was nobody left to lose."); return; }
  const fac = staffed[Math.floor(Math.random() * staffed.length)];
  const def = BASTION_FACILITIES[fac.defId] || {};
  const room = (def.name || fac.defId).toLowerCase();
  const gone = fac.henchmen.slice();
  const r = hirelingLossReason(fac);                              // { fate, illness, text }
  const first = gone[0];

  // One named cause; the rest follow. If the cause was fatal, that one gets a stone — the others
  // left, they didn't die. A house comes apart in the order people stop believing in it.
  if (r.fate === "dead") entombHireling(ch.bastion, first, t.date, t.n, r.illness ? "died of " + r.illness : r.text);

  fac.henchmen = [];
  fac.disabledUntil = t.n + 1;                                    // DMG: "can't be used on your next Bastion turn"
  fac.staffLostOn = t.n;                                          // DMG: "the hirelings are replaced at no cost to you AT THAT POINT" — the next turn, not this one
  // DMG, Lost Hirelings: "The CAUSE OF THEIR DEPARTURE IS UP TO YOU." So say it. hirelingLossReason
  // rolls {fate, illness, text} and the text IS the cause — it was being computed and dropped, which
  // is how a keep ends up reporting that a man is buried without ever saying what killed him.
  t.benefits.push("⚠ Lost Hirelings — " + first.name + " " + r.text + "."
                  + (gone.length > 1 ? " " + (gone.length - 1) + " more went with " + (r.fate === "dead" ? "the news" : "them") + "." : "")
                  + " The " + room + " stands empty; it can't be used next turn."
                  + (r.fate === "dead" ? " " + first.name + " is buried here." : ""));
  const rest = gone.length - 1;
  t.prompt = first.name + " " + r.text + "." +
    (rest > 0
      ? " " + (rest === 1 ? "The other followed them out" : "The other " + rest + " followed inside the week") + " — a house comes apart in the order people stop believing in it."
      : " The " + room + " is quiet for the first time in memory.");
}

// DMG "Criminal Hireling": "One of your Bastion's hirelings has a criminal past that comes to light
// when officials or bounty hunters visit your Bastion with a warrant for the hireling's arrest. You
// can retain the hireling by paying a bribe of 1d6 x 100 GP. Otherwise, the hireling is arrested."
// House rule [TABLE] — the DMG assumes a player at the table to ask. There is nobody to ask when
// the week resolves at 3am between sessions, so I need a default and this is it.
// I pay if I can — you're not there to be asked, and the household assumes
// you'd want them kept. If the gold isn't there, they're taken.
export function resolveCriminalHireling(s: AppState, ch, t) {
  const all: any[] = [];
  (ch.bastion.facilities || []).forEach((f) => (f.henchmen || []).forEach((h) => all.push({ f, h })));
  if (!all.length) { t.benefits.push("Criminal Hireling — the warrant named someone who no longer works here."); return; }
  const { f, h } = all[Math.floor(Math.random() * all.length)];
  const def = BASTION_FACILITIES[f.defId] || {};
  const bribe = (1 + Math.floor(Math.random() * 6)) * 100;        // 1d6 x 100 GP
  const flavor = pick(CRIMINAL_HIRELING_FLAVOR);
  if ((ch.gp || 0) >= bribe) {
    ch.gp -= bribe;
    t.benefits.push("⚠ Criminal Hireling — " + h.name + " " + flavor + ". The household paid the " + bribe + " gp and kept them.");
    t.prompt = h.name + " is still at their post in the " + (def.name || f.defId).toLowerCase() + ", and knows exactly what it cost to keep them there. Neither of you has mentioned it.";
    s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: t.date, dtSpent: 0, gpSpent: bribe, spentOn: ch.bastion.name + " — a bribe of " + bribe + " gp, quietly paid, to keep " + h.name + " out of a cell." });
  } else {
    f.henchmen = (f.henchmen || []).filter((x) => x.id !== h.id);
    f.staffLostOn = t.n;                                          // DMG: "The hireling is THEN replaced at no cost to you" — then, meaning the next turn.
    // ↑ Not this one. rehireOne is the Exchange's ordinary-attrition rule (B-19, one post a turn) and
    //   it must not paper over an arrest that happened this week — the book has its own timetable for
    //   putting this post back, and it is not today. Invisible until the roll moved to issue-time.
    t.benefits.push("⚠ Criminal Hireling — " + h.name + " " + flavor + ". There wasn't " + bribe + " gp in the house; they were taken.");
    t.prompt = "They didn't struggle. " + h.name + " looked back once from the gate, at a house that couldn't afford them, and then was gone.";
  }
}

// When a room is torn out, what happens to the people it paid?
//
// House rule [TABLE] — the ALPG permits rebuilding a facility and is silent on where its people go;
// a home game would just decide. This app cannot leave a hireling in a room that no longer exists.
// The people who were in the old facility, if they have no second copy of that
// facility to go to with space, would leave because they're no longer needed... We can't have a smith
// who is really good at hammering steel become a gardener overnight because that makes no sense."
//
// So: if the keep has another room of the SAME KIND with a post free, they walk across to it. If it
// doesn't, they go. A trade doesn't transfer.
export function relocateStaff(s: AppState, ch, fac) {
  const sameKind = (ch.bastion.facilities || []).filter((f) => f.id !== fac.id && f.defId === fac.defId);
  const moved: any[] = [], left: any[] = [];
  (fac.henchmen || []).forEach((h) => {
    const room = sameKind.find((f) => (f.henchmen || []).length < facEstablishment(f));
    if (room) { if (!Array.isArray(room.henchmen)) room.henchmen = []; room.henchmen.push(h); moved.push(h.name); }
    else left.push(h.name);
  });
  fac.henchmen = [];
  return { moved, left };
}

// Whose hands made it. A facility comes with its people (DMG); one of them was at the bench. If the
// room has somehow been emptied, the credit falls back to the lord who commissioned it — which is
// what I used to record for everything, and it was never quite true.
export function bastionMaker(fac, ch) {
  const staff = (fac && fac.henchmen) || [];
  const who = staff.length ? pick(staff).name : null;
  const keep = ch.bastion ? ch.bastion.name : "the keep";
  return who ? who + " at " + keep : ch.name + " at " + keep;
}

// One whole turn: every order, then the turn's flavor, then whatever the world did back.
// ---- THE BASTION CHARM -------------------------------------------------------------------------
// DMG, five rooms (Arcane Study, Observatory, Reliquary, Sanctuary, Sanctum), each carrying a
// sentence of the same shape: a Long Rest in your Bastion grants a magical Charm lasting 7 days or
// until used, and you can't gain it again while you still have it.
//
// A CHARM IS NOT AN ORDER. No hireling, no gold, no order line — you sleep in your own house and the
// room does the rest. So it hangs off the TURN RECORD, not the order list.
//
// THE TRIGGER IS `!t.away`, AND IT IS NOT AN INFERENCE. I already know whether the hero was
// home: awayBastionTurn() stamps away:true when they CHECK IN to a table; a turn taken through the
// app stamps away:false, because taking it means you were there to take it. Owner's ruling, 17 Jul.
// Better than reading presence off the order list, which was the first proposal: a hero sitting at
// home issuing Maintain is still home, and the cleverer version would have robbed them.
//
// [TABLE] STAFF ARE NOT REQUIRED. Owner's ruling: a room with no staff cannot perform its task, but
// the hero can still take the Long Rest and do what the Charm needs. The book never puts a hireling
// in the Charm's sentence — the hireling is for Craft. So Lost Hirelings shuts the orders and leaves
// the Charm standing.
//
// [TABLE] A DORMANT ROOM GRANTS NOTHING. The Sanctuary's Charm comes from icons being displayed; sell
// the icons and it is a spare bedroom. Same logic the order gate already uses ("a smithy with no
// forge is a shed"). The Exchange's call, not the book's, and not SCALE's.
//
// [TABLE] THE OBSERVATORY'S ROOM-SCOPING COLLAPSES when that room is built. Four of the five say "a
// Long Rest in your Bastion"; the Observatory says "in your Observatory". I know the hero was
// home and cannot know which bed they used, and across seven days at home the question has no honest
// answer but yes. Same trigger. Labelled rather than pretended.
export const bCharmDef = (f) => (BASTION_FACILITIES[(f || {}).defId] || {}).charm || null;

// A room grants only while it is a room: not still going up, not stripped to the boards.
export const facMayCharm = (f) => !!bCharmDef(f) && !f.building && !facilityDormant(f);

// [TABLE] EXPIRY — owner's ruling, 17 Jul: "either complete session or the next bastion turn, one or
// the other." Whichever lands first, and BOTH are needed:
//   * COMPLETE_SESSION is the belt. The adventure is over; the Charm is spent. "One Charm, one
//     adventure."
//   * the next turn the hero TAKES is the braces. A DM who never clicks Complete must not leave a
//     player holding a Charm that outlived its week — they go home, run their keep, and it is gone.
//
// NOT on the auto away turn, and that is the whole reason this needed a ruling. awayBastionTurn
// stamps its week at CHECK_IN and RESOLVE_BASTION_TURNS clears it about a second later, because it
// is retrospective — "it already happened while you played". Expiring there would kill the Charm as
// the player sat down at the table, which is the one moment it exists for.
export function expireBastionCharms(ch: CharacterRecord) {
  if (!ch || !Array.isArray(ch.gifts)) return 0;
  const n = ch.gifts.length;
  ch.gifts = ch.gifts.filter((g) => !g.fromFacility);   // only the keep's own; a DM's award is untouched
  return n - ch.gifts.length;
}

export function grantBastionCharms(s: AppState, ch: CharacterRecord, t: BastionTurn) {
  if (!ch.bastion || ch.bastion.ruined || ch.bastion.abandoned) return;
  (ch.bastion.facilities || []).forEach((f) => {
    if (!facMayCharm(f)) return;
    const c = bCharmDef(f);
    // "You can't gain this Charm again while you still have it." Expire-then-grant makes that true by
    // construction — at grant time you never still have it. One live Charm per room, ever, enforced
    // by stateViolations rather than by remembering.
    ch.gifts = (ch.gifts || []).concat([{
      id: "g" + s.nextId++, kind: "charm", name: c.name, desc: c.desc,
      source: bDef(f).name + " \u00b7 " + (ch.bastion!.name || "your Bastion"),
      realm: "", epicBoon: false,
      carried: false,           // ALPG: "Those not carried remain in your inventory." The hero chooses.
      fromFacility: f.id, grantedTurn: t.n,
    }]);
    t.benefits.push(c.grant);
  });
}

// Housing capacity, surfaced so the player can see the decision. Beds come from bedrooms only (by size);
// heads are the whole household; overflow commutes, chosen in a stable order so it never reshuffles.
export function bastionHousing(b) {
  if (!b) return { beds: 0, heads: 0, housed: [], commuters: [] };
  const beds = (b.facilities || []).filter((f) => f.defId === "bedroom").reduce((n, f) => n + (BASTION_BEDS_BY_SIZE[f.size] || 2), 0);
  // Heads are the WORKING staff (special facilities). Basic room-folk live in their room, need no bed.
  const staff: any[] = []; (b.facilities || []).forEach((f) => { if ((BASTION_FACILITIES[f.defId] || {}).kind === "special") (f.henchmen || []).forEach((h) => staff.push(h)); });
  // Occupants assigned a bedroom claim a bed there — a hireling (housed) OR the hero themselves (whose
  // room it is). The hero is never "staff" and never commutes, but their room still reserves a bed.
  let occupantSlots = 0; const assignedIds = new Set();
  (b.facilities || []).filter((f) => f.defId === "bedroom").forEach((f) => (f.occupants || []).forEach((id) => { occupantSlots++; assignedIds.add(id); }));
  const ordered = [...staff].sort((x, y) => (x.id < y.id ? -1 : 1));
  const assignedHoused = ordered.filter((h) => assignedIds.has(h.id));   // hirelings with a named room
  const rest = ordered.filter((h) => !assignedIds.has(h.id));
  const freeBeds = Math.max(0, beds - occupantSlots);                    // beds left after every occupant, hero included
  return { beds, heads: staff.length, housed: [...assignedHoused, ...rest.slice(0, freeBeds)], commuters: rest.slice(freeBeds) };
}

export function mkRng(seedStr) {                                          // mulberry32: same week → same story
  let a = (strHash(seedStr) ^ 0x9e3779b9) >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}

export const rpick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

// DOER trait → why the work keeps coming back undone. {d}=doer, {r}=reactor. STARTER content, Frank's to expand.
export const REACTION_WHY = { slovenly: "left as {d} leaves things", idle: "which {d} had meant to get to", green: "{d} not yet knowing the trick of it", sly: "or so {d} swore", proud: "and {d} would not be told of it" };

// REACTOR trait → the reaction AND the bond delta (its SIGN lives here, not in the activity). First match wins.
export const REACTION_TO = [
  { tag: "quarrelsome", d: -2, say: "and {r} made a whole morning of saying so" },
  { tag: "sharp-tongued", d: -1, say: "and {r} said just what {r} thought of it" },
  { tag: "proud", d: -1, say: "and {r} said nothing, and forgot nothing" },
  { tag: "forgiving", d: 1, say: "and {r} only saw to it, the way {r} does" },
  { tag: "patient", d: 1, say: "and {r} set it right without a word" },
  { tag: "soft-hearted", d: 1, say: "and {r} covered for them again" },
];

export const REACTION_GENERIC = { d: 0, say: "and {r} let it be" };

export const reactionsFor = (defId) => {
  const f = FACILITY_REACTIONS[defId] || {};
  return { why: f.why || REACTION_WHY, to: f.to || REACTION_TO, generic: f.generic || REACTION_GENERIC };
};

// ═══════════════════════════ BEDROOM — minted facility (all sockets) ═══════════════════════════
// Real data replacing the placeholder bedroom. Def unchanged (kind:"basic"); beds unchanged.
// The engine (lifeTasksFor form-aware, sizeFlavorFor, ruinFacilityFlavor form-keyed, bastionHousing
// + quarters) is patched separately. [COPYRIGHT] All original writing.

// 1 · THE WEEK — 8 forms × 12 (overwrites the flat placeholder)

// 2 · THE REACTION

// 3 · FURNISHINGS — bed@ (the 5 forms not already in FURNISHING_LADDER) + chest@ (all 8)

// ═══════════════════════════ MAGIC-ITEM CRAFTING SELECTOR (SRD-legal, per-room) ═══════════════════════════
// The player chooses the SPECIFIC magic item to craft, from the items that (a) sit in this facility's
// DMG group table (Arcana / Implements / Armaments) AND (b) exist in the uploaded SRD list — so only
// SRD-legal, tool-appropriate items are offered. Cost is the DMG ch. 7 rarity figure (halved for a
// consumable). A magic item built on a mundane base (a weapon or a suit of armour) needs that base in
// the character's pack; it is consumed into the work, or the craft is declined. [COPYRIGHT] item NAMES
// are SRD facts; no SRD prose is reproduced here.
export const CRAFTABLE_MAGIC = {
  arcana: { common: [{n:"Bead of Nourishment",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Potion of Climbing",cat:"Potion",sub:"",att:false,base:false}], uncommon: [{n:"Bag of Holding",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Bag of Tricks",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Brooch of Shielding",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Broom of Flying",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Circlet of Blasting",cat:"Wondrous Item",sub:"",att:false,base:false,spells:true},{n:"Cloak of Protection",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Cloak of the Manta Ray",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Decanter of Endless Water",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Deck of Illusions",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Dust of Disappearance",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Dust of Dryness",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Dust of Sneezing and Choking",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Elemental Gem",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Eversmoking Bottle",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Eyes of Charming",cat:"Wondrous Item",sub:"",att:true,base:false,spells:true},{n:"Eyes of Minute Seeing",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Gem of Brightness",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Hat of Disguise",cat:"Wondrous Item",sub:"",att:true,base:false,spells:true},{n:"Headband of Intellect",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Helm of Comprehending Languages",cat:"Wondrous Item",sub:"",att:false,base:false,spells:true},{n:"Helm of Telepathy",cat:"Wondrous Item",sub:"",att:true,base:false,spells:true},{n:"Immovable Rod",cat:"Rod",sub:"",att:false,base:false},{n:"Lantern of Revealing",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Medallion of Thoughts",cat:"Wondrous Item",sub:"",att:true,base:false,spells:true},{n:"Mithral Armor",cat:"Armor",sub:"Any Medium or Heavy, Except Hide Armor",att:false,base:false,mat:true},{n:"Necklace of Adaptation",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Oil of Slipperiness",cat:"Potion",sub:"",att:false,base:false},{n:"Pearl of Power",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Periapt of Health",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Philter of Love",cat:"Potion",sub:"",att:false,base:false},{n:"Potion of Animal Friendship",cat:"Potion",sub:"",att:false,base:false,spells:true},{n:"Potion of Growth",cat:"Potion",sub:"",att:false,base:false},{n:"Potion of Poison",cat:"Potion",sub:"",att:false,base:false},{n:"Potion of Resistance",cat:"Potion",sub:"",att:false,base:false},{n:"Potion of Water Breathing",cat:"Potion",sub:"",att:false,base:false},{n:"Ring of Mind Shielding",cat:"Ring",sub:"",att:true,base:false},{n:"Robe of Useful Items",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Rope of Climbing",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Sending Stones",cat:"Wondrous Item",sub:"",att:false,base:false,spells:true},{n:"Slippers of Spider Climbing",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Staff of the Python",cat:"Staff",sub:"",att:true,base:false},{n:"Wand of Magic Detection",cat:"Wand",sub:"",att:false,base:false,spells:true},{n:"Wand of Magic Missiles",cat:"Wand",sub:"",att:false,base:false,spells:true},{n:"Wand of Secrets",cat:"Wand",sub:"",att:false,base:false},{n:"Wand of Web",cat:"Wand",sub:"",att:true,base:false,spells:true},{n:"Wind Fan",cat:"Wondrous Item",sub:"",att:false,base:false,spells:true},{n:"Winged Boots",cat:"Wondrous Item",sub:"",att:true,base:false}] },
  armaments: { common: [], uncommon: [{n:"Adamantine Armor",cat:"Armor",sub:"Any Medium or Heavy, Except Hide Armor",att:false,base:false,mat:true},{n:"Bracers of Archery",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Gauntlets of Ogre Power",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Javelin of Lightning",cat:"Weapon",sub:"Javelin",att:false,base:true},{n:"Mithral Armor",cat:"Armor",sub:"Any Medium or Heavy, Except Hide Armor",att:false,base:false,mat:true},{n:"Sentinel Shield",cat:"Armor",sub:"Shield",att:false,base:true},{n:"Trident of Fish Command",cat:"Weapon",sub:"Trident",att:true,base:true,spells:true},{n:"Weapon of Warning",cat:"Weapon",sub:"Any Simple or Martial",att:true,base:true}] },
  implements: { common: [{n:"Bead of Nourishment",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Potion of Climbing",cat:"Potion",sub:"",att:false,base:false}], uncommon: [{n:"Bag of Holding",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Boots of Elvenkind",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Boots of Striding and Springing",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Boots of the Winterlands",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Broom of Flying",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Cloak of Elvenkind",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Cloak of Protection",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Cloak of the Manta Ray",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Decanter of Endless Water",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Dust of Disappearance",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Dust of Dryness",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Dust of Sneezing and Choking",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Eyes of Minute Seeing",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Eyes of the Eagle",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Gloves of Missile Snaring",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Gloves of Swimming and Climbing",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Gloves of Thievery",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Goggles of Night",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Helm of Comprehending Languages",cat:"Wondrous Item",sub:"",att:false,base:false,spells:true},{n:"Immovable Rod",cat:"Rod",sub:"",att:false,base:false},{n:"Lantern of Revealing",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Oil of Slipperiness",cat:"Potion",sub:"",att:false,base:false},{n:"Pipes of Haunting",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Pipes of the Sewers",cat:"Wondrous Item",sub:"",att:true,base:false},{n:"Potion of Growth",cat:"Potion",sub:"",att:false,base:false},{n:"Potion of Water Breathing",cat:"Potion",sub:"",att:false,base:false},{n:"Ring of Jumping",cat:"Ring",sub:"",att:true,base:false,spells:true},{n:"Ring of Swimming",cat:"Ring",sub:"",att:false,base:false},{n:"Ring of Warmth",cat:"Ring",sub:"",att:true,base:false},{n:"Robe of Useful Items",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Rope of Climbing",cat:"Wondrous Item",sub:"",att:false,base:false},{n:"Wand of Secrets",cat:"Wand",sub:"",att:false,base:false}] },
};

export const facMagicGroup = (defId) => FAC_MAGIC_GROUP[defId] || null;

export const MAGIC_CRAFT_COST = { common: 50, uncommon: 200, rare: 2000, very_rare: 20000, legendary: 100000 };   // DMG ch.7 raw-materials cost by rarity

// the SRD-legal items this room can craft at a rarity (empty for a non-crafting facility)
export function craftableMagicItems(defId, rarity) {
  const g = facMagicGroup(defId); if (!g) return [];
  return (CRAFTABLE_MAGIC[g] && CRAFTABLE_MAGIC[g][rarity]) || [];
}

// RETAINED, unused by the resolve path since my Q17 ruling (24 Jul) moved magic crafting to the
// slot door. I keep these because they encode real ch. 7 mechanics (SRD intersection, base-item
// detection, consumable half-rate) that a future personal-crafting door may want, and because
// deleting exports mid-refactor is how fingerprints move for no reason.
export function findCraftableMagic(defId, rarity, name) {
  return craftableMagicItems(defId, rarity).find((x) => x.n === name) || null;
}

// DMG ch.7: cost is the rarity figure, halved for a consumable (a Potion or Scroll) other than a Spell Scroll
export function magicCraftCost(item, rarity) {
  const b = MAGIC_CRAFT_COST[rarity] || 0;
  return (item && (item.cat === "Potion" || item.cat === "Scroll")) ? Math.floor(b / 2) : b;
}

// a magic item built on a mundane base names the kind of gear it needs (else null)
export function magicItemBaseType(item) {
  if (!item || !item.base) return null;
  if (/ammunition/i.test(item.sub || "")) return "ammunition";
  return item.cat === "Weapon" ? "weapon" : (item.cat === "Armor" ? "armor" : null);
}

// a mundane base of the right kind that the character is actually carrying (to build the item on)
export function heldMundaneBase(s: AppState, ch: CharacterRecord, baseType: string) {
  return Object.values(s.items).find((it) => it.holder && it.holder.type === "CHARACTER" && it.holder.id === ch.id
    && (itemCat(it) || {}).mundane && (itemCat(it) || {}).itemType === baseType);
}
// ═══════════════════════════ end MAGIC-ITEM CRAFTING SELECTOR ═══════════════════════════

export const WARMTH_SAY = ["and the work went quicker for the company", "and neither said much, but the day came easier", "and by noon were finishing each other's sentences"];

export const MORNING_WAKE = ["The house woke and set to.", "The keep stirred before light.", "A grey morning, and the house up before it.", "The hall was cold — someone had let the fire die — and the day began with that."];

export const ARRIVAL_SAY = [" came up from the village as the work-bell went.", " walked in from the village, a step behind the bell.", " was up the road early, ahead of the others.", " came in from the village with the cold still on them."];

export function applyBond(a, bH, delta, note) {
  if (!a || !bH || a.id === bH.id) return;
  const wr = (x, y) => { if (!Array.isArray(x.bonds)) x.bonds = []; let e = x.bonds.find((z) => z.id === y.id); if (!e) { e = { id: y.id, weight: 0, note: "" }; x.bonds.push(e); } e.weight += delta; if (note) e.note = note; };
  wr(a, bH); wr(bH, a);
}

export function runHouseholdWeek(s: AppState, ch: CharacterRecord, t: BastionTurn) {
  const b = ch.bastion; if (!b) return;
  // ANY facility with a task table narrates its week — not just basics. Once every facility carries its own
  // task table (the facility-class), this keys off CAPABILITY (has beats) rather than CATEGORY (is basic),
  // so a new special joins the story the moment its lifeTasksFor is non-empty. Nothing else to change.
  const rooms = (b.facilities || []).filter((f) => lifeTasksFor(f.defId, b.form).length > 0);
  const staff: any[] = []; (b.facilities || []).forEach((f) => (f.henchmen || []).forEach((h) => staff.push(h)));
  if (!rooms.length || !staff.length) return;                    // no household, no story
  const rng = mkRng(b.id + ":" + t.n);
  const hh = bastionHousing(b);
  const housed = new Set(hh.housed.map((h) => h.id));
  const commuters = hh.commuters;
  const firstReact = (h, rt) => rt.to.find((e) => (h.traits || []).includes(e.tag)) || rt.generic;
  const whyOf = (h, rt) => { const tag = (h.traits || []).find((tt) => rt.why[tt]); return tag ? rt.why[tag] : null; };
  const fill = (str, d, r) => str.replace(/\{d\}/g, d ? d.name : "").replace(/\{r\}/g, r ? r.name : "");
  const days = t.away ? 7 : 2;                                    // away = the full homecoming; home = a trimmed couple of days
  const cap = t.away ? 5 : 1;                                     // rate-limit connectors so they stay events, not wallpaper
  let conn = 0; const seen: Record<string, any> = {}; const week: any[] = [];
  for (let d = 1; d <= days; d++) {
    const morning: any[] = [];
    commuters.forEach((h) => morning.push(h.name + rpick(rng, ARRIVAL_SAY)));
    if (housed.size) morning.push(rpick(rng, MORNING_WAKE));
    const chores: any[] = [];
    rooms.forEach((f) => {
      const pool = lifeTasksFor(f.defId, b.form); if (!pool.length) return;
      // Two-tier household (Frank, 28 Jul): a STAFFED facility (facEstablishment > 0 — the archive,
      // smithy, workshop, or a basic with a fixed post like the kitchen's cook) is worked by ITS OWN
      // hirelings, the same people every day. A COMMUNAL room (facEstablishment === 0 — dining hall,
      // courtyard) has no fixed post; it's where the household mingles, so its beat is drawn from the
      // whole household. That mingling is where cross-facility bonds form.
      const staffed = facEstablishment(f) > 0;
      const room = (bDef(f).name || "the room").toLowerCase();
      const doerPool = staffed ? (f.henchmen || []) : staff;
      if (staffed && !doerPool.length) {                          // its people are gone — the room's own work goes undone
        chores.push("The " + room + " stood unworked — nobody is posted there now.");
        return;
      }
      const doer = rpick(rng, doerPool); const task = rpick(rng, pool);
      chores.push(doer.name + " " + task + ".");
      const key = f.id + "|" + task;
      // Reactions/warmth draw from OTHERS — for a staffed room, its own crew; for a communal room, the
      // whole household, which is where people from different posts actually cross paths.
      const reactPool = staffed ? (f.henchmen || []) : staff;
      if (seen[key] && conn < cap) {                             // REPEAT → reaction, signed by the reactor
        const others = reactPool.filter((h) => h.id !== doer.id);
        if (others.length) {
          const rt = reactionsFor(f.defId);                     // this room's reaction voice (facility table if it has one, else general)
          const r = rpick(rng, others); const rx = firstReact(r, rt); const why = whyOf(doer, rt);
          chores.push(fill(r.name + " came on " + doer.name + "'s work in the " + room + " half-done again" + (why ? ", " + why : "") + ", " + rx.say + ".", doer, r));
          applyBond(doer, r, rx.d, rx.d < 0 ? "the " + room + ", again" : "took it in good part");
          conn++;
        }
      } else if (!seen[key] && conn < cap && rng() < 0.18) {     // CO-OCCURRENCE → warmth (occasional)
        const others = reactPool.filter((h) => h.id !== doer.id);
        if (others.length) {
          const mate = rpick(rng, others);
          chores.push(doer.name + " and " + mate.name + " fell to it together, " + rpick(rng, WARMTH_SAY) + ".");
          applyBond(doer, mate, 1, "worked well together");
          conn++;
        }
      }
      seen[key] = true;
    });
    week.push({ day: d, morning, chores });
  }
  t.household = week;
}

export function resolveBastionTurn(s: AppState, ch: CharacterRecord, t: BastionTurn, leisure) {
  t.orders.forEach((o) => resolveBastionOrder(s, ch, t, o, leisure));
  // Every room this turn took is free again. Keyed off the TURN NUMBER, not off t.orders — a
  // Maintain turn works the whole keep and has no order lines at all, so a release that walks the
  // orders would leave those rooms locked forever. Nothing to remember: if it was working this
  // turn, this turn lets it go.
  (ch.bastion!.facilities || []).forEach((f) => { if (f.working === t.n) f.working = null; });
  if (!t.away) rehireOne(s, ch, t);                                // you were here: word gets round, one post fills
  if (!t.away) { expireBastionCharms(ch); grantBastionCharms(s, ch, t); }   // a week at home: last week's Charm lapses, this week's is granted
  t.flavor = t.maintain
    ? (t.away
        ? bastionSliceOfLife(bForm(ch.bastion))                                // the household gets a life while the danger-magnet is elsewhere
        : "A week of ladders, ledgers and mortar. Nothing dramatic — which was the point.")
    : bastionTurnFlavor(t.orders);
  resolveBastionEvent(s, ch, t, leisure);
  runHouseholdWeek(s, ch, t);                                     // the keep's own week, rolled once and stored on the turn
  t.resolved = true;
}

export const bastionSpecialSlots = (lvl) => (lvl >= 17 ? 6 : lvl >= 13 ? 5 : lvl >= 9 ? 4 : lvl >= 5 ? 2 : 0);   // DMG special-facility count by level

export const bDef = (f) => BASTION_FACILITIES[f.defId] || { name: f.defId, orders: ["maintain"], note: "" };

export function bOutputs(def, orderId) { return (def && def.outputs && def.outputs[orderId]) || []; }

// ------------------------- reducer -------------------------
// Neglect. DMG: "If a character issues no orders to their Bastion for a number of consecutive Bastion
// turns equal to the character's level ... the hirelings abandon the Bastion and the site is eventually
// looted." The character never gets to *decide* whether they neglected it — the turns decide.
export function accrueNeglect(s: AppState, ch, add) {
add = Math.max(1, +add || 1);
      ch.bastion.neglect = (ch.bastion.neglect || 0) + add;
      const threshold = ch.level || 1;   // DMG: lose the bastion at consecutive neglected turns equal to level
      const ng = ch.bastion.neglect;
      if (ng >= threshold) {
        ch.bastion.abandoned = true;
        severBastionCombines(s, ch.id);   // an abandoned keep can't hold a line — dissolve its combines
        s.notices.push({ id: "n" + s.nextId++, type: "bastionabandoned", ctx: "player", accountId: ch.ownerId, char: ch.name, bastion: ch.bastion.name });
      } else if (ng >= threshold - 1) {
        s.notices.push({ id: "n" + s.nextId++, type: "bastionneglect", ctx: "player", accountId: ch.ownerId, char: ch.name, bastion: ch.bastion.name, neglect: ng, threshold, urgent: true });
      } else if (ng >= Math.ceil(threshold / 2)) {
        s.notices.push({ id: "n" + s.nextId++, type: "bastionneglect", ctx: "player", accountId: ch.ownerId, char: ch.name, bastion: ch.bastion.name, neglect: ng, threshold, urgent: false });
      }
}

// The reducer proper is reducerImpl. This wrapper exists for one reason: the item index is
// memoised on state identity, and reducerImpl MUTATES its clone after that clone may already
// have been indexed (e.g. ADD_PREGEN_ITEM asks carriedCounts, then adds an item, then returns
// that same object). Identity would match, contents wouldn't. So: if the state changed, the
// index is void. One line, one place, impossible to forget.
/* ================================================================================================
   THE INVARIANTS — things that must be true of EVERY state, after EVERY action, forever.
   ================================================================================================
   The most valuable idea in the external review, and it is worth being precise about why: the rules
   in this app INTERLOCK, and a unit test only ever checks the rule it was written for. Every serious
   bug of the last two days was a state that no test was looking at:

     an unknown lock froze NOTHING          a happening existed and the keep was wide open
     the lazy Proxy resurrected the dead    an item was in play that had been disposed of
     the fill hook missed the fast path     a Vast pub with one tap, silently, forever
     a resolved turn left a room `working`  the room never took another order, and nothing said so

   Not one of those threw. Not one failed a test that existed. Each was found by a single assertion
   that happened to be pointed the right way, or by an afternoon of confusion. An invariant does not
   need to be pointed: it asks "is this state legal" after everything.

   WHAT THIS IS NOT: a validator for user input, or a schema. Those are the reducer's guards, at the
   door, one per rule. This is the last line — the thing that says the reducer itself has a bug.

   Dev-only. `assertStateValid` is called by the fuzzer after all 334 random dispatches and by the
   test suite after chains; it is not in the shipped path, because a shipped app should not spend a
   millisecond proving to itself that it works.
   ============================================================================================== */

// 1. MAY this keep take a week at all? Not "are these orders any good" — that is the next question.
//    This is only: is there a hero, a keep, and a week free to take.
export function bastionMayTakeTurn(ch: CharacterRecord, leisure) {
  if (!ch || !ch.bastion || ch.bastion.abandoned) return false;
  if (ch.status === "dead") return false;                                     // a fallen lord tends nothing
  if (bastionTurnPending(ch.bastion)) return false;                           // the week in progress must finish first — Maintain included
  if (bastionFrozenBy(ch.bastion, "turn")) return false;                      // men at the wall: nobody here is taking an order about the garden
  // ↑ SITUATIONAL, which is why it asks the POLICY and not merely whether something is happening. An
  //   Attack freezes everything. A Request for Aid freezes nothing — the danger is elsewhere and the
  //   keep runs shorthanded until they come home. A festival stops the builders, not the crafters.
  if (!leisure && (ch.dt || 0) < BASTION_TURN_DT) return false;               // ALPG: a turn costs 7 DT (waived in retirement)
  return true;
}

// 2. Are these orders a LEGAL week?
//    DMG: "The Maintain order is unusual; it is issued to the whole Bastion rather than to one or more
//    special facilities... Issuing this order prohibits other orders from being issued to the Bastion
//    on the current Bastion turn." And: "If a character isn't in their Bastion on a given Bastion turn,
//    the Bastion acts as though it were issued the Maintain order." AL is silent on both, so the DMG
//    governs — lower layers fill genuine silence.
//
//    I read PRESENCE from the turn itself: issuing orders means the hero is home working;
//    issuing none means they're away and the keep maintains itself. Being away isn't a button you
//    press — it's what a check-in proves. See awayBastionTurn.
export function bastionOrdersLegal(ch: CharacterRecord, orders, maintaining, n, leisure) {
  if (maintaining) return orders.length === 0;                                // Maintain forbids every other order this turn
  if (!orders.length) return false;                                           // a turn you take is a turn you direct
  return orders.every((o) => bastionOrderAllowed(ch, o, n, leisure));         // all-or-nothing: one bad order voids the week
}

// 3. What a week COSTS, and what a new week gives back.
export function billBastionWeek(ch: CharacterRecord, n, leisure) {
  if (!leisure) ch.dt -= BASTION_TURN_DT;                                     // ALPG: 7 DT a turn
  ch.bastion!.neglect = 0;                                                     // you came home and gave an order (DMG: neglect is CONSECUTIVE turns without orders)
  (ch.bastion!.facilities || []).forEach((f) => { f.choresDone = []; f.staffLostOn = null; });
  // ↑ a new week: each room's seven days come back, and last week's losses stop being last week's
  // DMG: an Empower benefit "lasts for 7 days" — one Bastion turn. Taking the next one is what ends it.
  if (Array.isArray(ch.empowerments)) ch.empowerments = ch.empowerments.filter((e) => (e.lapsesAfterTurn || 0) >= n);
}

// 4. The week ITSELF: what was ordered, how long it runs, and who is busy for it.
export function openBastionWeek(ch: CharacterRecord, orders, maintaining, n, leisure) {
  const allOrders = orders.map((o) => ({ facId: o.facId, orderId: o.orderId, detail: o.detail || "", gp: Math.max(0, +o.gp || 0), outId: o.outId || null, craftItem: o.craftItem || null }));
  const now = Date.now();
  const maxDays = maintaining ? 7 : Math.max(...allOrders.map((o) => (BASTION_ORDERS[o.orderId] || {}).days || 7));
  const turn: BastionTurn = {
    n, date: todayLocal(), dtSpent: leisure ? 0 : BASTION_TURN_DT,
    issuedAt: now, readyAt: now + maxDays * REAL_MIN_PER_GAME_DAY * 60000, resolved: false,
    maintain: maintaining,
    away: false,                                                              // a turn taken through the app means you were home to take it
    event: null,                                                              // the roll happens at issue — see tellBastionWeek
    daysOwed: maxDays,                                                        // for the record, and for the "back to work" line if a siege holds it
    orders: allOrders,
    benefits: [],
  };
  allOrders.forEach((o) => { const fac = ch.bastion!.facilities.find((f) => f.id === o.facId); if (fac) fac.working = n; });
  // DMG, Maintain: "ALL the Bastion's hirelings focus on maintaining the Bastion rather than executing
  // orders in special facilities." The order goes to the whole Bastion, so the whole staffed Bastion is
  // busy — every special works, though a Maintain turn carries no order lines of its own. (A hall still
  // going up has nobody in it to work.)
  if (maintaining) ch.bastion!.facilities.forEach((f) => { if ((BASTION_FACILITIES[f.defId] || {}).kind === "special" && !f.building) f.working = n; });
  ch.bastion!.turns.push(turn);
  return turn;
}

// 5. The NEWS. The roll happens now, not at the end.
//    DMG: "IMMEDIATELY after a character issues the Maintain order to their Bastion, the DM rolls once
//    on the Bastion Events table to determine what event, if any, befalls the Bastion BEFORE the next
//    Bastion Turn... The event is resolved immediately." This used to fire at resolve — same odds, same
//    outcomes, wrong sequence: the week's work finished and banked, and THEN the raiders turned up. The
//    workshop calmly completed its arrows during a siege it had not heard about.
//
//    If the roll is hostile the week never starts: holdBastionClocks stopped every clock the lock
//    covers when the happening was staged, and this turn was pushed a moment before it, so it is
//    already held. Nothing bespoke here.
// The week's label back to an event id, for the cast lookup. Only for a week with ONE thing in it —
// a week with three events has no single "who is at the gate" and each event tells its own story in
// t.benefits, which is where the banner reads them from.
export const castIdFor = (label) => { const e = BASTION_EVENTS.find((x) => x.label === label); return e ? e.id : null; };

export function tellBastionWeek(s: AppState, ch: CharacterRecord, turn: BastionTurn, leisure) {
  resolveBastionEvent(s, ch, turn, leisure);
  // Say so NOW — that is the whole point of rolling at issue: the player clicks and something answers,
  // in this keep's voice, instead of 3.5 hours of silence and then a wall of text.
  //
  // But ONLY for a quiet week. bastionSliceOfLife is the ALL IS WELL table — a hawk on the gatehouse,
  // a window mended — and it is the wrong voice for anything else. Wired to every event it produced
  // this, the worst thing my app has ever said:
  //     "Lost Hirelings — the garden stands empty. Orin Tarr is buried here."
  //     "The banner came down for mending. It looks better than it has in years."
  // Every other event writes its own story into t.benefits, which is where the banner reads it from.
  // A quiet week is the only one with nothing to say, which is exactly why it needs this.
  // WHO, and WHERE. Two axes, and they do not fight:
  //   All Is Well  -> the FORM's voice. A quiet week is about the house, and a cavern's nothing-week
  //                   reads nothing like a manor's. bastionSliceOfLife, keyed by form.
  //   anything else -> the REGION's cast. Who is at the gate is about the country, and no fact about
  //                   your architecture changes who lives in the hills outside it. A human refugee in
  //                   Avernus is nonsense; what arrives there is a soul that slipped its chain.
  // A region with no cast for this event falls through to the default, and a default that does not
  // exist yields null and the event's own note stands. Ten Realms regions share one cast on purpose.
  turn.eventFlavor = turn.event === "All Is Well"
    ? bastionSliceOfLife(bForm(ch.bastion))
    : eventCast((turn.events || []).length === 1 ? castIdFor(turn.event) : null, ch.bastion!.region);
}

export function findOrCreateThread(s: AppState, a, b, ctxA, ctxB) {
  let th = s.threads.find((t) => t.participants.includes(a) && t.participants.includes(b) && threadCtx(t, a) === ctxA && threadCtx(t, b) === ctxB);
  if (!th) { th = { id: "th" + s.nextId++, participants: [a, b], lastRead: {}, messages: [], ctx: { [a]: ctxA, [b]: ctxB } }; s.threads.push(th); }
  return th;
}

export function dragBastionClocks(b, ms) {
  const now = Date.now();
  bastionClocks(b, "turn").forEach((c) => {              // the WEEK only — the builders are stopped, not slowed
    if (c.heldMs != null || !Number.isFinite(c.readyAt)) return;
    const left = Math.max(0, c.readyAt - now);
    const extra = Math.min(left, ms) * (DRAG_FACTOR - 1);
    c.readyAt += extra;
    c.draggedMs = (c.draggedMs || 0) + extra;
  });
}

export function stageBastionAid(s: AppState, ch, t, sendN) {
  const o = rollAidOutcome(ch, sendN);
  // DMG, Armory: "When the event is over, the equipment in your Armory is expended regardless of how
  // many Bastion Defenders you have or how many you lost." Aid is a defender-loss event, so it spends it.
  const wasArmedAid = !!(ch.bastion && ch.bastion.armed);
  if (ch.bastion.armed) ch.bastion.armed = false;
  const beats = aidBeats(ch, o);
  ch.bastion.happening = { kind: "aid", lock: "none", turnN: t.n, startedAt: Date.now(),
    endsAt: beats[beats.length - 1].at, beats, shown: 0, outcome: o };
  // lock "none" — nothing holds. holdBastionClocks is still called so the RULE is asked, not assumed:
  // if a future call for aid ever locks something, it will already work.
  holdBastionClocks(ch.bastion, Date.now());
  t.benefits.push("🐎 Request for Aid — " + o.sent + " rode out" + (wasArmedAid ? ", armed from the Armory (d8s for d6s), and the racks emptied behind them" : "") + ". The keep runs shorthanded until they are back.");
}

export function stageBastionFestival(s: AppState, ch, t, what) {
  const beats = festivalBeats(ch, what);
  ch.bastion.happening = { kind: "festival", lock: "build", turnN: t.n, startedAt: Date.now(),
    endsAt: beats[beats.length - 1].at, beats, shown: 0, outcome: { what } };
  holdBastionClocks(ch.bastion, Date.now());                       // lock "build": the masons stop; the week does NOT
  dragBastionClocks(ch.bastion, beats[beats.length - 1].at - Date.now());   // ...it just runs at half speed for the fair's length
}

// DMG "Extraordinary Opportunity": "you must pay 500 GP to cover costs. In return ... prompting the DM
// to roll AGAIN on the Bastion Events table (rerolling this result if it comes up again). If you
// decline the opportunity, you don't pay the money and nothing else happens."
// ---- WHAT A FESTIVAL COSTS ---------------------------------------------------------------------
// EXCHANGE RULE [TABLE] [EVIDENCE]. The DMG: "If you seize the opportunity, you must pay 500 GP."
//
// A FLAT number, in a table where every other figure is 1d6 x 100. It is flat because the book rolls
// ONCE — one Opportunity, one price, done. This app rolls per room, and a flat cost rolled six times
// stops being a cost and becomes the economy: at six rooms the chance of meeting it is 40% a week,
// and it is the only term in the ledger that does not scale with anything.
//
// And it is the wrong SHAPE, not just the wrong size. 500 gp buys the same fair at a two-room
// steading as at a six-room hall, which is not how a feast works and never was. Bryene's New Year at
// Acton fed THREE HUNDRED PEOPLE — off 6,000 acres and a household of 25. A cottar's harvest-home
// was a barrel and a fiddle. The size of the party is the size of the house.
//
// So: one d6 per room, hundreds of gold, like everything else in the table. A small manor throws a
// small festival and pays for a small festival. It is rolled, so it is a decision under uncertainty
// rather than a toll — which is the whole point of the DMG making it a CHOICE ("if you seize... if
// you decline"), and the reason this app raises a call and waits instead of just taking the money.
//
// The DMG's 500 is kept below as the number to compare against and to explain the deviation from.

export function festivalTakesSomeone(s: AppState, ch, t) {
  const staffed = (ch.bastion.facilities || []).filter((f) => (f.henchmen || []).length > 0);
  if (!staffed.length) return false;                              // nobody to lose; the fair keeps its coin
  const fac = staffed[Math.floor(Math.random() * staffed.length)];
  const who = fac.henchmen[Math.floor(Math.random() * fac.henchmen.length)];
  fac.henchmen = fac.henchmen.filter((h) => h.id !== who.id);
  if (!fac.henchmen.length) fac.staffLostOn = t.n;               // the room notices, the way it always does
  const def = BASTION_FACILITIES[fac.defId] || {};
  t.benefits.push("\u{1F343} " + who.name + " \u2014 " + (def.name || fac.defId).toLowerCase() + " \u2014 " + pick(FEY_DEPARTURES) + ".");
  s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED",
    date: t.date, dtSpent: 0, gpSpent: 0,
    spentOn: ch.bastion.name + " \u2014 " + who.name + " left with the fair",
    flavor: "Not taken. Invited. There is a difference and it is the only thing anyone at this keep will be able to talk about for a month." });
  return true;
}

export function awayBastionTurn(s: AppState, charId, dateStr) {
  const ch = s.characters[charId];
  if (!ch || !ch.bastion || ch.status === "dead") return;
  if (bastionLeisure(ch)) return;                 // a retired hero LIVES here — they're never away
  if (ch.bastion.ruined) return;                  // nothing left to report on
  if (ch.bastion.abandoned) {                     // past saving by turns — now it just empties out
    bleedAbandonedStaff(s, ch, dateStr);
    return;
  }
  const now = Date.now();
  ch.bastion.turns.push({
    n: ch.bastion.turns.length + 1,
    date: dateStr || todayLocal(),
    dtSpent: 0,                                   // free: nothing was chosen, so nothing was spent
    issuedAt: now, readyAt: now,                  // retrospective — it already happened while you played
    resolved: false, maintain: true, away: true, auto: true,
    event: null, orders: [], benefits: [],
  });
  accrueNeglect(s, ch, 1);                        // another week nobody was home
}

// helpers that read/write during reduce
// When a table for an adventure is scheduled, ping every player who wishlisted that adventure
// (except the DM running it). Powers the "your wanted adventure is on the schedule" notice.

export function seizeOpportunity(s: AppState, ch, t, what, cost) {
  const gp = cost != null ? cost : rollFestivalCost(ch.bastion);   // the quoted price, never a fresh roll
  ch.gp -= gp;
  t.benefits.push("✦ Extraordinary Opportunity — seized, at " + gp + " gp.");
  // THE FAIR HAPPENS. One d20 feature per room — a bigger house throws a bigger fair, and bigger means
  // MORE THINGS HAPPENING rather than one thing costing more. Each feature carries its own take, so
  // the market runs feature by feature and the swing is in the fair itself, not a modifier on top.
  // Then it draws whatever it draws, which is the gamble the DMG built and this app kept.
  const feats = rollFestivalFeatures(ch.bastion, ch.bastion.region);
  let takes = 0, swing = 0;
  // The fair is DESCRIBED first, then it happens. A departure that prints above the fair it happened
  // at reads like a bug, because it is: the reader needs the room before the thing in the room.
  let taken = 0;
  t.festivalFeatures = feats.map((f) => f.text);
  feats.forEach((f) => t.benefits.push("🎪 " + f.text));
  feats.forEach((f) => {
    for (let i = 0; i < f.takes; i++) { resolveTreasure(s, ch, t); takes++; }
    const g = rollFeatureGold(f);
    if (g) { swing += g; ch.gp = Math.max(0, (ch.gp || 0) + g); }
    // Some fairs cost people. I route it through the loss I already know how to narrate.
    for (let i = 0; i < (f.steals || 0); i++) if (festivalTakesSomeone(s, ch, t)) taken++;
  });
  if (swing) {
    s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id,
      entryType: swing > 0 ? "EARNING" : "EXPENDITURE", status: "APPROVED", date: t.date, dtSpent: 0,
      gpSpent: swing < 0 ? -swing : 0, gpGained: swing > 0 ? swing : 0,
      spentOn: ch.bastion.name + " — the fair itself, " + (swing > 0 ? "which went extraordinarily well" : "which did not"),
      flavor: "Not the stalls. The fair. Some of them pay for themselves ten times over and some of them cost you the year, and you do not find out which until the carts are leaving." });
    t.benefits.push(swing > 0
      ? "🎪 And the fair itself came good: " + swing + " gp, over and above the stalls."
      : "🎪 And the fair itself went the other way: " + (-swing) + " gp, gone.");
  }
  t.benefits.push(takes
    ? "🎪 " + takes + " stalls' worth of takings crossed the table before the last cart left."
    : "🎪 Not one coin of it stopped here. Whatever that fair was for, it was not for the house.");
  s.logEntries.push({
    id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED",
    date: t.date, dtSpent: 0, gpSpent: gp,
    spentOn: ch.bastion.name + " — seized an extraordinary opportunity (" + gp + " gp)",
    flavor: "Your household spent it on your behalf and assumed you'd approve. They were probably right.",
  });
  t.prompt = "The chance came " + what + ", and the house took it. People are talking about " + ch.bastion.name + " now.";
  stageBastionFestival(s, ch, t, what);   // the fair takes the week the fair takes
  // The reroll below can come up ATTACK. House rule [TABLE] — the book never has to resolve this
  // because a DM would simply narrate both; one slot and a clock cannot.
  // They happen IN SUCCESSION, because after an
  // attack the festival is over anyway — so stageBastionBattle supersedes this one, writes its log,
  // releases its clocks, and carries "festival" away as a TINT that colours the fight. See
  // HAPPENING_TINTS. Not a list, not a collision: a fair that ends the way fairs end when raiders come.
  // "In return, your Bastion gains a sudden influx of recognition or attention, prompting the DM to
  //  roll again on the Bastion Events table (rerolling this result if it comes up again)."
  //
  // The book excludes exactly one thing — itself — and that is enough for the book, because the book
  // rolls ONCE. This app rolls per room, so the week already has news in it by the time the attention
  // arrives, and a second Friendly Visitors in one week reads as a bug even when the dice were honest.
  //
  // Worse: this used to call applyBastionEvent directly, AROUND eventsThatStand. So the purse cap —
  // one payout, one levy, per week — was void whenever an Opportunity fired: 400 gp of visitors and
  // then 600 gp more. A cap with a door in it is not a cap. The follow-on now answers to the same
  // filter as everything else, and learns from each refusal rather than rolling blind.
  // DOMINANCE DOES NOT APPLY HERE, and that is deliberate. eventsThatStand suppresses a fair rolled
  // ALONGSIDE a siege — nobody throws a party while there are men on the wall. But this roll is
  // DOWNSTREAM of the fair: the book says the attention the festival bought is what prompts it. A
  // fair that draws raiders is the best story on the table, and it is a sequence, not a collision.
  // What still applies is everything about the purse and the repeats, checked below.
  const stood = (t.events || []).map((lbl) => BASTION_EVENTS.find((e) => e.label === lbl)).filter(Boolean);
  const skip = new Set(["opportunity"].concat(stood.map((e) => e.id)));   // never itself; never a repeat
  let again: any = null;
  for (let guard = 0; guard < BASTION_EVENTS.length; guard++) {
    const cand = rollBastionEvent(skip, ch.bastion.region);   // the fair draws what this country has to draw
    if (!cand) break;                                              // nothing left the week can hold
    if (eventsThatStand(stood.concat([cand])).indexOf(cand) !== -1) { again = cand; break; }
    skip.add(cand.id);                                             // refused — don't offer it again
  }
  if (!again) {
    t.benefits.push("↳ …and the attention brought more of what the week already had. Nothing the house could use twice.");
    return;
  }
  t.benefits.push("↳ and the attention brought: " + again.label);
  t.events = (t.events || []).concat([again.label]);
  t.event = t.events.join(" \u00b7 ");
  // If the attention brought trouble, it is another force at the gate and the siege is that much
  // bigger. battleScale is counted from the ROOMS' rolls before this one existed, so it must be told.
  if (evIsHostile(again)) t.battleScale = (t.battleScale || 0) + 1;
  applyBastionEvent(s, ch, t, again);
  // LAST WORD. Everything above can write t.prompt — every treasure roll does, and so does the
  // reroll, which runs after all of it. A bottle stopper worth 2,500 gp is a fine prompt for a week
  // that was about a bottle stopper. It is not the prompt for a week where two of your household
  // walked into the woods smiling and did not come back. If the fair took somebody, the fair took
  // somebody, and that is what the table talks about.
  if (taken) {
    t.prompt = "The fair was wonderful. Everybody says so. "
      + (taken === 1 ? "One of them is not here" : taken + " of them are not here")
      + ", and nobody can name the moment it stopped being funny. Who noticed first, and how long did they wait before saying it out loud?";
  }
}

// The hero has sat down at a table, which means they are demonstrably not at home.
//
// DMG: "If a character isn't in their Bastion on a given Bastion turn, the Bastion acts as though it
// were issued the Maintain order." Free, by house rule — and the reasoning is narrative, not a
// loophole: the character is a danger magnet, and danger follows them. The staff have an ordinary,
// peaceful life right up until the master comes home. They direct nothing and gain nothing; the
// household simply gets a week to itself.
//
// It ACCRUES NEGLECT. DMG: neglect counts "consecutive Bastion turns" in which the character "issues
// no orders" — an away-Maintain is exactly that. Playing does not tend your keep. The player never
// decides whether they neglected it; going adventuring and never coming home decides it for them.
// Come back and take a real turn and the counter clears.
