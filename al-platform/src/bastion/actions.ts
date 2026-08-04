import { todayLocal, rawEntries } from "../lib/util";
import { CATALOG } from "../data/catalog";
import { bForm } from "../lib/rules";
import { bastionEligible, isAdmin } from "../lib/rules";

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
export const BASTION_ACTION_NAMES: readonly string[] = [
  "ADD_BASTION_FACILITY", "ADD_FACILITY_FURNISHING", "ARM_BASTION", "BUILD_BASTION",
  "BUILD_BASTION_WALLS", "ENLARGE_BASTION_FACILITY", "LOG_BASTION_NEGLECT", "PROPOSE_BASTION_COMBINE",
  "RAZE_BASTION", "REBUILD_FACILITY", "REFURNISH", "REMOVE_FACILITY_FURNISHING",
  "RENAME_FACILITY_HENCHMAN", "RESOLVE_BASTION_TURNS", "RESPOND_BASTION_COMBINE", "SELL_FURNISHING",
  "SET_ARCHIVE_BOOK", "SET_SCRIPTORIUM_SCRIBE", "SET_WORKSHOP_TOOLS",
  "SET_BASTION_FORM", "SET_BASTION_MAP", "SET_BASTION_PENDING_EVENT", "SET_BASTION_REGION",
  "SET_FACILITY_DESCRIPTION", "SET_FACILITY_IMAGE", "SET_FURNISHING_NOTE", "TAKE_BASTION_TURN",
  "UNCOMBINE_BASTIONS", "UPGRADE_FURNISHING",
];

// ============================================================================
// BASTION REDUCER ACTIONS.
//
// My bastion half of the reducer switch, lifted out. reducerImpl builds the
// copy-on-write draft and hands any bastion action here; I return the next state,
// or undefined to say "not mine, keep looking".
//
// `s` is my reducer draft (a Proxy that clones lazily), `dropNotice` its notice
// helper. I pass them in rather than let them get captured — that's the whole
// reason these cases could leave the closure I first wrote them in.
// ============================================================================

import type { AppState } from "../types";
import { ARCHIVE_BOOK_SUBJECTS, ARCHIVE_BOOK_SUBJECT_LABEL, ARCHIVE_LORE_BY_REGION, composeArchiveTitle, BASTION_ENLARGE, BASTION_EVENTS, BASTION_FACILITIES, BASTION_REGIONS, BASTION_SIZES, BASTION_TURN_DT, BASTION_WALLS_COST, BASTION_WALLS_DAYS, FURNISHING_TIERS, bastionSizeCost } from "../data/bastion";
import { FACILITY_BEHAVIOR, FURNISHING_TIER_BY_ID, furnTierIndex, furnishFacility, furnishingName, furnishingValue, staffFacility } from "../bastion/registry";
import type { Facility } from "../types";
import { REAL_MIN_PER_GAME_DAY, REGION_WEIGHTS, accrueNeglect, advanceBastionHappening, bDef, bastionFrozenBy, bastionLeisure, bastionMayTakeTurn, bastionOrdersLegal, bastionSizeDays, bastionSpecialSlots, billBastionWeek, facEnlargeBenefit, facMayBeSize, facPrintedSpace, facQualifies, facilityDormant, findOrCreateThread, finishConstruction, furnIsAre, furnNextTier, furnNoneLeft, furnPrevTier, furnishingIsStock, furnishingSaleValue, logBastionWork, mkRng, openBastionWeek, expireCharmItemsFor, relocateStaff, resolveBastionTurn, severBastionCombines, spendBuildBudget, stockArmory, stockFacility, tellBastionWeek } from "../bastion/engine";
import { BLOBS, accName, evHostility, putBlob, sweepBlobs } from "../lib/core";

export function bastionActions(s: any, action: any, dropNotice: (p: any) => void): AppState | undefined {
  switch (action.type) {
    case "BUILD_BASTION": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !bastionEligible(ch) || ch.bastion) return s;
      // ALPG: "Begin with one Cramped and one Roomy facility."
      // DMG, Basic Facilities: "A character's Bastion starts with two free basic facilities, WHICH
      //   THE CHARACTER'S PLAYER CHOOSES from the Basic Facilities list below. One of the chosen
      //   facilities is Cramped, and the other is Roomy."
      // AL says how many and what size; the DMG says which list and whose choice. Different frames,
      // no conflict. Whitelist: anything not on the DMG's list of six is refused, and the fallbacks
      // are the book's. The app's basic list IS the DMG's six now — there is nothing else to filter.
      const BASIC_LIST = Object.values(BASTION_FACILITIES).filter((d) => d.kind === "basic").map((d) => d.id);
      const pickBasic = (want, fallback) => (BASIC_LIST.includes(want) ? want : fallback);
      const cramped = pickBasic(action.cramped, "bedroom");
      const roomy = pickBasic(action.roomy, "kitchen");
      ch.bastion = {
        name: (action.name || "").trim() || (ch.name + "'s Bastion"),
        location: (action.location || "").trim(),
        // `location` is what the goat TYPED — "the north road out of Elturel". `region` is which of
        // AL's regions that is, and it is the one the event table reads. Two fields because they are
        // two things: one is the address, one is the weather. Whitelist: an unknown region is the
        // baseline, so a homebrew place still has a sane table.
        region: (action.region && REGION_WEIGHTS[action.region] !== undefined) ? action.region : null,
        form: action.form || null,   // cosmetic house-flavor form
        builtAtLevel: ch.level,
        buildBudget: (ch.level || 5) * 20,   // ALPG: 20 × level days on first build
        facilities: [],
        turns: [],
      };
      // Every room arrives furnished, and every special arrives staffed — same as one added later.
      // My BUILD_BASTION used to hand out bare shells: no furniture, no hirelings, and a "workshop"
      // nobody chose that quietly ate one of the two level-5 special slots. I found that one by
      // click-through, not by harness. Noted, and corrected both.
      [{ defId: cramped, size: "cramped" }, { defId: roomy, size: "roomy" }].forEach((r) => {
        const f = { id: "fac" + s.nextId++, defId: r.defId, size: r.size, lastOrder: null, working: null };
        furnishFacility(s, f, bForm(ch.bastion));   // DMG: "A basic facility comes with nonmagical furnishings and decor appropriate for that facility." Which house it is decides what that looks like.
        staffFacility(s, f, undefined, ch.bastion.region, ch.bastion.locale);   // ...and a basic with a household (a kitchen) arrives staffed, same as one added later
        ch.bastion!.facilities.push(f);
      });
      // DMG, Special Facilities: "A character's Bastion INITIALLY HAS TWO SPECIAL FACILITIES OF THE
      // CHARACTER'S CHOICE for which they qualify." I don't grant them here — the goat picks them
      // from the facility list, where my slot ladder and the prerequisites already live.
      return s;
    }
    case "ADD_BASTION_FACILITY": {
      const ch = s.characters[action.charId];
      if (ch && ch.bastion && bastionFrozenBy(ch.bastion, "build")) return s;   // no masons through a siege, and none through a fair
      if (!ch || ch.ownerId !== action.by || !ch.bastion) return s;
      const def = BASTION_FACILITIES[action.defId];
      if (!facQualifies(ch, def)) return s;   // DMG: level AND prerequisite — "for which they qualify"
      if (def.kind === "special") {   // special facilities are slot-limited by level (2/4/5/6 at 5/9/13/17, cap 6)
        const used = ch.bastion.facilities.filter((f) => (BASTION_FACILITIES[f.defId] || {}).kind === "special").length;
        if (used >= bastionSpecialSlots(ch.level || 1)) return s;
      }
      const isSpecial = def.kind === "special";
      const size = isSpecial ? facPrintedSpace(def) : (action.size || "cramped");   // DMG: a special arrives at the Space its entry prints, free — the level slot is the price
      const cost = isSpecial ? 0 : bastionSizeCost(size);
      if ((ch.gp || 0) < cost) return s;   // can't afford it
      // TWO QUANTITIES THAT ARE NOT THE SAME THING, and must never share a name again:
      //
      //   alDays    — the ALPG's first-build allowance being spent. A RULES quantity, in the
      //               CHARACTER's environment. A special spends ZERO: the DMG says special
      //               facilities "can't be bought" and arrive with the level, and the ALPG's
      //               allowance covers "basic facilities, features, or enlarge" — never specials.
      //               Charging it would be a real deviation.
      //
      //   pauseDays — how long I make the GOAT wait before the room takes orders. A PLATFORM
      //               quantity, in the player's environment. Costs no gold, no DT, no turn, no
      //               allowance; never appears as a charge on a log entry.
      //
      // A table has a DM in it. A goat says "I'll raise the Library and order it this turn" and
      // the DM says "not this turn" — that pause costs nothing and nobody had to build it. My
      // website has no one in the room: every control is live at once, and a character with
      // banked gold and downtime can raise a whole keep and issue its orders in ninety seconds.
      // pauseDays is the DM's absence, and I made it out of time instead of a person. I measure
      // it in the DMG's own construction figures because the book already agrees a room takes
      // time to become a room — it prices exactly that when a facility rebuilds into another.
      const alDays = isSpecial ? 0 : bastionSizeDays(size);
      const pauseDays = bastionSizeDays(size);
      ch.gp = (ch.gp || 0) - cost;
      const { fromBudget, owed } = spendBuildBudget(ch.bastion, alDays);   // the allowance pays what it can; the rest is built the slow way
      const days = alDays;                                                 // what the LOG reports — the rules figure, not the pause
      const nowB = Date.now();
      const newFac: Facility = { id: "fac" + s.nextId++, defId: action.defId, size, lastOrder: null, working: null };
      // DMG, Training Area: "When a Training Area becomes part of your Bastion, choose one trainer from
      // the Expert Trainers table." It arrives with one; SET_BASTION_TRAINER swaps it.
      FACILITY_BEHAVIOR[action.defId]?.onBuild?.(newFac, action);
      // A pub arrives with something on tap and an archive with something on the shelf. The DMG never
      // contemplates an empty one — "the Pub HAS one magical beverage on tap", "your Archive CONTAINS
      // one copy" — so I furnish the room with its contents, in this house's voice, and the goat
      // changes it if they care. An empty pub is not a pub; it's a room with a bar in it.
      { const wasB = newFac.building; newFac.building = null; stockFacility(s, ch, newFac); newFac.building = wasB; }
      staffFacility(s, newFac, undefined, ch.bastion.region, ch.bastion.locale);                   // DMG: "A special facility comes with one or more hirelings." You never hire them.
      furnishFacility(s, newFac, bForm(ch.bastion));                                               // DMG: "comes with nonmagical furnishings and decor appropriate for that facility." You never buy them.
      // A basic facility's wait is what the allowance didn't cover — a rules figure.
      // A special's wait is the pause, which the allowance has no bearing on: it isn't a cost.
      const waitDays = isSpecial ? pauseDays : owed;
      if (waitDays > 0) { newFac.building = { what: "build", days: waitDays, issuedAt: nowB, readyAt: nowB + waitDays * REAL_MIN_PER_GAME_DAY * 60000 }; logBastionWork(s, ch.bastion, "began building the " + (def.name || "facility").toLowerCase()); }   // raising — unusable until it's up
      ch.bastion.facilities.push(newFac);
      if (cost > 0 || days > 0) s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: todayLocal(), dtSpent: 0, gpSpent: cost, spentOn: ch.name + " — began " + def.name + " (" + size + ", " + days + " days" + (fromBudget ? "; " + fromBudget + " from the first-build allowance" : "") + ") at " + ch.bastion.name });
      else if (isSpecial) s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: todayLocal(), dtSpent: 0, gpSpent: 0,
        spentOn: ch.bastion.name + " — the " + def.name + " (" + size + ") is " + ch.name + "'s; it costs no gold and no downtime, and takes " + pauseDays + " days to open its doors",
        flavor: "It cost nothing, because the level bought it — the DMG is plain that a special facility can't be bought and comes with the rank. What it costs is the waiting. " + ((newFac.henchmen || []).length ? newFac.henchmen![0].name + " is in there now" : "The masons are in there now") + ", and the room won't take an order until they're done with it. Write the season " + ch.name + " spent walking past a shut door they already owned." });
      return s;
    }
    case "REBUILD_FACILITY": {
      // ALPG says the action EXISTS in AL: "You may rebuild a Bastion facility with a new one.
      // Existing facilities with unresolved orders may not be rebuilt."
      // The DMG says WHAT IT TAKES: "Each time a character gains a level, that character can replace
      // one of their Bastion's SPECIAL facilities with another for which the character qualifies."
      //
      // Those don't contradict — they speak from different frames. AL confirms the action is available
      // and adds one AL-specific restriction; the DMG sets the terms. So AL's silence on the terms is
      // filled by the DMG, and I take my least-permissive reading: ONE special facility, ONCE per
      // level, and you must qualify. It's a respec, not a revolving door.
      //
      // And it takes TIME. Everything in this system does — a room doesn't become a different room
      // overnight. It runs on the same clock as any other construction.
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion || ch.status === "dead" || ch.bastion.abandoned) return s;
      const fac = ch.bastion.facilities.find((f) => f.id === action.facId);
      if (!fac) return s;
      if (fac.working != null) return s;                          // ALPG: an unresolved order blocks it
      if (fac.building) return s;                                 // already being worked on
      const od = BASTION_FACILITIES[fac.defId] || {};
      if (od.kind !== "special") return s;                        // DMG: the swap is for SPECIAL facilities
      const nd = BASTION_FACILITIES[action.defId];
      if (!nd || nd.kind !== "special") return s;                 // ...into another special
      if (nd.id === fac.defId) return s;                          // "with a NEW one"
      if (!facQualifies(ch, nd)) return s;                       // DMG: "another for which the character qualifies" — level AND prerequisite
      if ((ch.bastion.rebuiltAtLevel || 0) === (ch.level || 1)) return s;   // DMG: once per level gained

      // The room comes apart now; the new one takes as long as raising one would.
      const { moved, left } = relocateStaff(s, ch, fac);
      const days = bastionSizeDays(fac.size);
      const now = Date.now();
      fac.building = { what: "rebuild", toDefId: nd.id, days, issuedAt: now, readyAt: now + days * REAL_MIN_PER_GAME_DAY * 60000 };
      fac.furnishings = (fac.furnishings || []).filter((x) => !x.slot);   // keepsakes stay; the room's own fittings come out
      fac.description = "";
      fac.dormant = false;
      ch.bastion.rebuiltAtLevel = ch.level || 1;                  // this level's swap is spent

      s.logEntries.push({
        id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED",
        date: todayLocal(), dtSpent: 0, gpSpent: 0,
        spentOn: ch.bastion.name + " — the " + (od.name || fac.defId).toLowerCase() + " is being rebuilt as a " + nd.name.toLowerCase() + " (" + days + " days)",
        flavor: left.length
          ? "It costs no gold, which is not the same as costing nothing. " + (left.length === 1 ? left[0] + " was" : left.slice(0, -1).join(", ") + " and " + left[left.length - 1] + " were") + " paid by that room, and there is no other room here that needs " + (left.length === 1 ? "their trade" : "their trades") + "."
          : moved.length
            ? (moved.length === 1 ? moved[0] + " simply walked" : moved.join(", ") + " simply walked") + " across to the other one. Same work, different door."
            : "The walls stay. Everything else about it will be new, including what it's for.",
      });
      return s;
    }
    case "ENLARGE_BASTION_FACILITY": {
      const ch = s.characters[action.charId];
      if (ch && ch.bastion && bastionFrozenBy(ch.bastion, "build")) return s;   // no masons through a siege, and none through a fair
      if (!ch || ch.ownerId !== action.by || !ch.bastion) return s;
      const fac = ch.bastion.facilities.find((f) => f.id === action.facId);
      if (!fac || fac.working != null) return s;   // can't enlarge mid-order
      if (fac.building) return s;   // already being worked on
      // NB construction runs INDEPENDENTLY of facility tasks (chores, re-stocks) and of a turn in
      // progress — you commission the work and the keep goes on with its week. It is not a task; it is
      // an event of sorts, happening in parallel. So no chore/stock/turn-pending guard here.
      const from = BASTION_SIZES.indexOf(fac.size), to = BASTION_SIZES.indexOf(action.size);
      if (to < 0 || to !== from + 1) return s;
      // ↑ DMG, "Enlarging Basic Facilities": "increase the space of a basic facility ... BY ONE CATEGORY."
      //   Only Cramped→Roomy and Roomy→Vast exist. Cramped→Vast in one step is not a move the book offers.
      const edef = BASTION_FACILITIES[fac.defId] || {};
      if (!facMayBeSize(edef, action.size)) return s;   // a special is never below its printed Space; the ladder only ever climbs from there
      const step = BASTION_ENLARGE[fac.size + ">" + action.size];
      if (!step) return s;
      const cost = step.gp;
      if ((ch.gp || 0) < cost) return s;
      const daysE = step.days;
      ch.gp = (ch.gp || 0) - cost;
      const { fromBudget: fromBudgetE, owed: owedE } = spendBuildBudget(ch.bastion, daysE);
      if (owedE > 0) {   // the space stays as it is until the work is finished
        const nowE = Date.now();
        fac.building = { what: "enlarge", toSize: action.size, days: owedE, issuedAt: nowE, readyAt: nowE + owedE * REAL_MIN_PER_GAME_DAY * 60000 };
        logBastionWork(s, ch.bastion, "began enlarging the " + (bDef(fac).name || "room").toLowerCase() + " to " + action.size);
      } else {
        fac.size = action.size;   // covered by the first-build allowance — already done
        staffFacility(s, fac, undefined, ch.bastion.region, ch.bastion.locale);    // DMG: a Vast Workshop gains two more hirelings, a Vast Garden one
        stockFacility(s, ch, fac);   // ...and a Vast Pub gains a second tap. This branch had nothing.
      }
      if (cost > 0 || daysE > 0) s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: todayLocal(), dtSpent: 0, gpSpent: cost,
        spentOn: ch.name + " — began enlarging " + (bDef(fac).name || "a facility") + " to " + action.size + " (" + daysE + " days" + (fromBudgetE ? "; " + fromBudgetE + " from the first-build allowance" : "") + ") at " + ch.bastion.name,
        flavor: facEnlargeBenefit(edef)
          ? "The book pays this one out: when the dust settles the " + (bDef(fac).name || "room").toLowerCase() + " will have " + facEnlargeBenefit(edef) + ". Someone had to argue for the money. Who was it, and what did they promise " + ch.name + " in return?"
          : "It buys no advantage whatsoever — not one die, not one day, not one hireling. Only a bigger room. That is worth asking about: nobody spends " + cost + " gold on a grander " + (bDef(fac).name || "room").toLowerCase() + " for no reason. Who is " + ch.name + " expecting to walk in and be impressed?" });
      return s;
    }
    // ⚠ THE ARCANE STUDY'S SCHOLAR IS CHOSEN, NOT ASSIGNED (Frank, 3 Aug). Two candidates are drawn by
    // the ordinary hireling code and held on the facility; this hires one of them and lets the other
    // go. Once only — the same shape as SET_ARCHIVE_BOOK, because a room's defining choice is made
    // once and lived with.
    case "SET_ARCHIVE_BOOK": {
      // DMG, Archive > Reference Book: "Your Archive contains ONE copy of a rare and valuable
      // reference book... You can choose one of the following options." Chosen once — a rare book
      // is what it is; re-shelving the room around a different one is a future ruling, not a toggle.
      const ch = s.characters[action.charId];
      if (!ch || !ch.bastion || ch.ownerId !== action.by) return s;   // same owner-gate every bastion case uses
      const fac = ch.bastion.facilities.find((f) => f.id === action.facId);
      if (!fac || fac.defId !== "archive" || fac.book) return s;
      if (!ARCHIVE_BOOK_SUBJECTS.includes(action.subject)) return s;
      fac.book = action.subject;
      const form = bForm(ch.bastion);
      // Frank's title engine: seeded by house + this shelf + subject, so THIS keep's history
      // book is its own — stored on the instance, because the title is what THIS copy is.
      // Frank's second ruling: the shelf's book points at the REGION's events and famous people,
      // filtered by the shelf's own skill where the pool allows — a keep's history book is a
      // chronicle of the region's history, in the keep's own binding.
      const rpool = (ch.bastion.region && ARCHIVE_LORE_BY_REGION[ch.bastion.region]) || [];
      const bySub = rpool.filter((e) => e.k.includes(action.subject));
      const title = composeArchiveTitle(mkRng(ch.bastion.id + ":" + fac.id + ":" + action.subject), (form && form.id) || "keep",
        { topics: bySub.length ? bySub : rpool });
      fac.bookTitle = title;
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: todayLocal(), dtSpent: 0, gpSpent: 0,
        spentOn: "Archive \u2014 reference book shelved: " + title,
        flavor: "One rare copy, chosen once (" + (ARCHIVE_BOOK_SUBJECT_LABEL[action.subject] || action.subject) + "). Its study benefit is the DM's to grant while you and the book are home." });
      return s;
    }
    case "SET_WORKSHOP_TOOLS": {
      // The Workshop's six-tool choice (DMG: "chosen when you added the Workshop"). The player picks
      // exactly 6 artisan's tools from the list of 11; the gear craft then derives across those six.
      // Stored on the facility as chosenTools. AL-faithful: exactly 6, all from the DMG's list, no
      // duplicates — the reducer rejects any other selection structurally.
      const ch = s.characters[action.charId];
      if (!ch || !ch.bastion || ch.ownerId !== action.by) return s;
      const fac = ch.bastion.facilities.find((f) => f.id === action.facId);
      if (!fac || fac.defId !== "workshop") return s;
      const def = BASTION_FACILITIES.workshop;
      const allowed = ((def as any).toolChoice && (def as any).toolChoice.from) || [];
      const want = ((def as any).toolChoice && (def as any).toolChoice.count) || 6;
      const picked: string[] = Array.isArray(action.tools) ? [...new Set(action.tools as string[])] : [];
      if (picked.length !== want) return s;                          // exactly six
      if (!picked.every((t: string) => allowed.includes(t))) return s;  // all from the DMG list
      (fac as any).chosenTools = picked;
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: todayLocal(), dtSpent: 0, gpSpent: 0,
        spentOn: "Workshop — fitted out with " + picked.map((t: string) => (CATALOG[t] || {}).name || t).join(", "),
        flavor: "The six tools you chose set what the workshop can make: its hirelings craft anything these tools can make, per the Player's Handbook." });
      return s;
    }
    case "SET_SCRIPTORIUM_SCRIBE": {
      // The scribe choice (Frank, 28 Jul). When the Scriptorium is built, the player picks between
      // two candidate scribes (generated named people); the chosen one takes the desk, and their
      // CLASS gates the scroll pool (Novice Mage → Wizard, Acolyte → Cleric). The choice is a real
      // hire — it renames and re-roles the posted hireling and stamps scribeClass on them, which the
      // scroll craft reads. AL ships two classes (both subsets of the DMG's "Cleric or Wizard").
      const ch = s.characters[action.charId];
      if (!ch || !ch.bastion || ch.ownerId !== action.by) return s;
      const fac = ch.bastion.facilities.find((f) => f.id === action.facId);
      if (!fac || fac.defId !== "scriptorium") return s;
      const def = BASTION_FACILITIES.scriptorium;
      const pick = ((def as any).scribeClasses || []).find((c: any) => c.id === action.scribeId);
      if (!pick) return s;                                              // must be a declared scribe class
      const scribe = (fac.henchmen || [])[0];
      if (!scribe) return s;
      scribe.name = (action.name && String(action.name).trim()) || scribe.name;
      scribe.role = pick.role;
      (scribe as any).scribeClass = pick.cls;                           // the pool-gating fact
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: todayLocal(), dtSpent: 0, gpSpent: 0,
        spentOn: "Scriptorium — took on " + scribe.name + ", " + pick.label,
        flavor: "The scribe you hired sets the hand the room writes in: a " + pick.label + " scribes " + pick.cls + " spell scrolls (3rd level or lower)." });
      return s;
    }
    case "SET_BASTION_REGION": {
      // Which country the keep is in. Changes the WEATHER, not the walls: no facility moves, no gold
      // moves, nothing is lost. A keep on the Sword Coast that turns out to be in the Silver Marches
      // simply starts seeing more raiders, which is what the Silver Marches are.
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion || ch.bastion.abandoned) return s;
      if (action.region != null && REGION_WEIGHTS[action.region] === undefined) return s;   // whitelist
      const was = ch.bastion.region;
      if (was === (action.region || null)) return s;
      ch.bastion.region = action.region || null;
      const nm = (id) => (BASTION_REGIONS.find((r) => r.id === id) || {}).name || "somewhere unnamed";
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED",
        date: todayLocal(), dtSpent: 0, gpSpent: 0,
        spentOn: ch.bastion.name + " — recorded as standing in " + nm(ch.bastion.region) + (was ? " (was " + nm(was) + ")" : ""),
        flavor: "The house did not move. What it means to live there did. Different country, different weather — more riders, or fewer, or a different sort of trouble at the gate entirely." });
      return s;
    }
    case "SET_BASTION_PENDING_EVENT": {
      const ch = s.characters[action.charId];
      if (!ch || !ch.bastion) return s;   // injected by org/epic/DM (not owner-gated; gate at UI by role) — applied at the next resolve, overriding the table roll
      if (!action.event) { ch.bastion.pendingEvent = null; return s; }
      const eff = action.event.effect === "attack" ? "attack" : "none";
      // Take the hostility from the table rather than restating it here: a DM-sent Attack is the
      // same hostile force as a rolled one, and a rule written twice is a rule you get wrong once.
      const canon = BASTION_EVENTS.find((e) => e.effect === eff);
      ch.bastion.pendingEvent = { label: (action.event.label || "An event befalls the keep.").trim(), effect: eff, hostility: evHostility(canon), by: action.by || "" };
      return s;
    }
    case "LOG_BASTION_NEGLECT": {
      // Kept for DM/admin adjudication only (ALPG: "DMs adjudicate rolls"). Players never self-report
      // neglect — it accrues on its own from away turns. See accrueNeglect / awayBastionTurn.
      const ch = s.characters[action.charId];
      if (!ch || !ch.bastion || ch.bastion.abandoned) return s;
      if (!isAdmin(s, action.by)) return s;
      accrueNeglect(s, ch, action.turns);
      return s;
    }
    case "RAZE_BASTION": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion) return s;
      severBastionCombines(s, action.charId);   // leaving the field — dissolve any combine pacts
      delete ch.bastion;   // clear the ruins so a new bastion can be built
      return s;
    }
    case "PROPOSE_BASTION_COMBINE": {
      const ch = s.characters[action.charId], other = s.characters[action.withCharId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion || !other || !other.bastion || action.charId === action.withCharId) return s;
      if (other.ownerId === ch.ownerId) {   // same account — no vote needed, combine instantly
        if (!Array.isArray(ch.bastion.combinedWith)) ch.bastion.combinedWith = [];
        if (!Array.isArray(other.bastion.combinedWith)) other.bastion.combinedWith = [];
        if (!ch.bastion.combinedWith.includes(other.id)) ch.bastion.combinedWith.push(other.id);
        if (!other.bastion.combinedWith.includes(ch.id)) other.bastion.combinedWith.push(ch.id);
        return s;
      }
      if (!Array.isArray(s.bastionPacts)) s.bastionPacts = [];
      if (s.bastionPacts.some((p) => p.status === "pending" && ((p.aChar === ch.id && p.bChar === other.id) || (p.aChar === other.id && p.bChar === ch.id)))) return s;   // no duplicate pending
      const pactId = "pact" + s.nextId++;
      const th = findOrCreateThread(s, ch.ownerId, other.ownerId, "player", "player");
      th.pactChannel = true;   // mark as a combined-bastion decision channel
      th.messages.push({ from: ch.ownerId, combine: { pactId }, text: ch.name + " proposes combining " + ch.bastion.name + " with " + other.bastion.name + " — pool your garrisons while you play together." });
      th.lastRead[ch.ownerId] = th.messages.length;
      s.bastionPacts.push({ id: pactId, aChar: ch.id, bChar: other.id, aAcct: ch.ownerId, bAcct: other.ownerId, threadId: th.id, status: "pending" });
      s.notices.push({ id: "n" + s.nextId++, type: "combinevote", ctx: "player", accountId: other.ownerId, who: accName(ch.ownerId), aBast: ch.bastion.name, bBast: other.bastion.name, pactId });
      return s;
    }
    case "RESPOND_BASTION_COMBINE": {
      if (!Array.isArray(s.bastionPacts)) return s;
      const pact = s.bastionPacts.find((p) => p.id === action.pactId);
      if (!pact || pact.status !== "pending" || pact.bAcct !== action.by) return s;
      const th = s.threads.find((t) => t.id === pact.threadId);
      const a = s.characters[pact.aChar], b = s.characters[pact.bChar];
      if (action.accept && a && b && a.bastion && b.bastion) {
        pact.status = "active";
        if (!Array.isArray(a.bastion.combinedWith)) a.bastion.combinedWith = [];
        if (!Array.isArray(b.bastion.combinedWith)) b.bastion.combinedWith = [];
        if (!a.bastion.combinedWith.includes(b.id)) a.bastion.combinedWith.push(b.id);
        if (!b.bastion.combinedWith.includes(a.id)) b.bastion.combinedWith.push(a.id);
        if (th) { th.messages.push({ from: "__system__", combineEvent: true, text: accName(action.by) + " accepted — " + a.bastion.name + " and " + b.bastion.name + " now share their defense." }); }
      } else {
        pact.status = "declined";
        if (th) th.messages.push({ from: "__system__", combineEvent: true, text: accName(action.by) + " declined the combine." });
      }
      dropNotice((n) => n.type === "combinevote" && n.pactId === action.pactId);
      return s;
    }
    case "UNCOMBINE_BASTIONS": {
      const ch = s.characters[action.charId], other = s.characters[action.withCharId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion) return s;
      if (Array.isArray(ch.bastion.combinedWith)) ch.bastion.combinedWith = ch.bastion.combinedWith.filter((id) => id !== action.withCharId);
      if (other && other.bastion && Array.isArray(other.bastion.combinedWith)) other.bastion.combinedWith = other.bastion.combinedWith.filter((id) => id !== action.charId);
      if (Array.isArray(s.bastionPacts)) {   // close any active pact between them + note it in their channel
        const pact = s.bastionPacts.find((p) => p.status === "active" && ((p.aChar === action.charId && p.bChar === action.withCharId) || (p.aChar === action.withCharId && p.bChar === action.charId)));
        if (pact) { pact.status = "dissolved"; const th = s.threads.find((t) => t.id === pact.threadId); if (th) th.messages.push({ from: "__system__", combineEvent: true, text: accName(action.by) + " dissolved the combine — the keeps defend on their own again." }); }
      }
      return s;
    }
    case "ARM_BASTION": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by) return s;
      // DMG, Armory > Trade: Stock Armory. The Arm button is the off-turn convenience; it and the
      // Trade order both go through stockArmory so cost, guards, and the `armed` flag can't drift.
      stockArmory(s, ch, todayLocal());
      return s;
    }
    case "BUILD_BASTION_WALLS": {
      const ch = s.characters[action.charId];
      if (ch && ch.bastion && bastionFrozenBy(ch.bastion, "build")) return s;   // no masons through a siege, and none through a fair
      if (!ch || ch.ownerId !== action.by || !ch.bastion || ch.bastion.walls) return s;
      if (ch.bastion.wallsBuilding) return s;                    // the masons are already on it
      if ((ch.gp || 0) < BASTION_WALLS_COST) return s;
      ch.gp = (ch.gp || 0) - BASTION_WALLS_COST;
      const { fromBudget: fromBudgetW, owed: owedW } = spendBuildBudget(ch.bastion, BASTION_WALLS_DAYS);   // walls are a "feature" — the ALPG allowance names them
      if (owedW > 0) {
        const nowW = Date.now();
        ch.bastion.wallsBuilding = { days: owedW, issuedAt: nowW, readyAt: nowW + owedW * REAL_MIN_PER_GAME_DAY * 60000 };
        logBastionWork(s, ch.bastion, "began raising the defensive walls");
      } else {
        ch.bastion.walls = true;   // the allowance covered the whole ring — it stood before the first turn
      }
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: todayLocal(), dtSpent: 0, gpSpent: BASTION_WALLS_COST,
        spentOn: ch.name + " — began Defensive Walls around " + ch.bastion.name + " (" + BASTION_WALLS_DAYS + " days" + (fromBudgetW ? "; " + fromBudgetW + " from the first-build allowance" : "") + ")",
        flavor: (bForm(ch.bastion) || {}).id === "vessel"
          ? (owedW > 0
            ? "The shipwrights will be at her past the turn of the season — the hull plated strake by strake and the deck-engines mounted while the boarding-nets hang slack. Ask yourself what comes up on the weather side before the last plate is driven — and whether " + ch.name + " will be aboard to see it."
            : "She was plated and her engines mounted while the keel was barely wet, paid out of the allowance only a fresh commission gets. " + ch.name + " has never seen " + ch.bastion.name + " without her armored hull, and never will.")
          : owedW > 0
          ? "The masons will be here past the turn of the season. Twenty squares of stone, twenty feet high, and every one of them laid by hand while the gate stands open behind them. Ask yourself what comes up the road before the ring closes — and whether " + ch.name + " will be here to see it."
          : "It went up while the ground was still being cleared, paid out of the allowance that only a new keep gets. " + ch.name + " has never seen " + ch.bastion.name + " without its wall, and never will." });
      return s;
    }
    case "SET_BASTION_FORM": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion) return s;
      if (ch.bastion.form) return s;           // the form is chosen ONCE and frozen — every facility is skinned by it,
      if (!action.form) return s;              // so re-forming a built keep would make every stamped facility lie about itself.
      ch.bastion.form = action.form;           // a formless keep may pick a form; after that it can never move.
      return s;
    }
    case "SET_BASTION_MAP": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion) return s;
      ch.bastion.mapImage = putBlob(action.dataURL); sweepBlobs(s);   // handle only — bytes live in BLOBS. null clears it (ALPG log: the bastion "diagram")
      return s;
    }
    case "SET_FACILITY_DESCRIPTION": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion || ch.status === "dead" || ch.bastion.abandoned) return s;   // a fallen/abandoned keep is frozen
      const fac = ch.bastion.facilities.find((f) => f.id === action.facId);
      if (fac) fac.description = action.text || "";
      return s;
    }
    case "SET_FACILITY_IMAGE": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion || ch.status === "dead" || ch.bastion.abandoned) return s;   // a fallen/abandoned keep is frozen
      const fac = ch.bastion.facilities.find((f) => f.id === action.facId);
      if (fac) { fac.image = putBlob(action.dataURL); sweepBlobs(s); }   // handle only
      return s;
    }
    case "UPGRADE_FURNISHING": {
      // You don't buy furniture — the room came furnished (DMG). You buy BETTER furniture, one step at
      // a time, at the DMG's own Art Object prices. Pure flavour: nothing works better for being finer.
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion || ch.status === "dead" || ch.bastion.abandoned) return s;
      const fac = ch.bastion.facilities.find((f) => f.id === action.facId);
      if (!fac) return s;
      const fn = (fac.furnishings || []).find((x) => x.id === action.furnId);
      if (!fn) return s;
      const next = furnNextTier(fn.tier);
      if (!next) return s;                                          // already a masterwork; there's nothing finer
      if ((ch.gp || 0) < next.gp) return s;
      ch.gp = (ch.gp || 0) - next.gp;
      // Rename it as it climbs — a cot becomes a proper bed becomes a carved bedstead — but ONLY if
      // the player never renamed it themselves. The moment they've made it theirs, it stays theirs and
      // I keep my hands off. Their word beats mine; my app's whole contract is that they own the
      // fiction and I hold the ledger.
      const wasStock = furnishingIsStock(fn, bForm(ch.bastion));
      fn.tier = next.id;
      if (wasStock) fn.name = furnishingName(fn.slot, next.id, bForm(ch.bastion), fn.name);
      if (action.name !== undefined) fn.name = String(action.name).slice(0, 80);    // ...or say what it is yourself
      if (action.note !== undefined) fn.note = String(action.note).slice(0, 240);   // a new piece deserves a new description
      s.logEntries.push({
        id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED",
        date: todayLocal(), dtSpent: 0, gpSpent: next.gp,
        spentOn: ch.bastion.name + " — " + next.label.toLowerCase() + " " + (fn.name || fn.slot) + " for the " + ((BASTION_FACILITIES[fac.defId] || {}).name || fac.defId).toLowerCase() + " (" + next.gp + " gp)",
        flavor: "The old one wasn't worn out. It was just the one you started with, and you aren't who you started as.",
      });
      return s;
    }
    case "SELL_FURNISHING": {
      // "It was common in the Middle Ages to sell your furnishings to make ends meet." So: you may.
      //
      // Selling drops the piece ONE RUNG, and pays half of what you're giving up (ALPG -> PH rules for
      // mundane goods), improved by the Storehouse's factor (DMG Storehouse markup). You cannot sell
      // below Serviceable: the DMG guarantees a facility "comes with nonmagical furnishings", so the
      // room always keeps something to sit on. Poverty here means a bare bench, not a bare floor.
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion || ch.status === "dead" || ch.bastion.abandoned) return s;
      const fac = ch.bastion.facilities.find((f) => f.id === action.facId);
      if (!fac) return s;
      const fn = (fac.furnishings || []).find((x) => x.id === action.furnId);
      if (!fn) return s;
      if (fn.gone) return s;                                     // it's already sold; there's nothing there
      const idx = furnTierIndex(fn.tier);
      const paid = furnishingSaleValue(ch, fac, fn);
      const wasLabel = (FURNISHING_TIER_BY_ID[fn.tier] || {}).label || fn.tier;
      const wasDormant = facilityDormant(fac);
      if (idx > 0) {
        fn.tier = furnPrevTier(fn.tier)!.id;                       // sell the fine one, keep the plain one underneath
        fn.note = action.note !== undefined ? String(action.note).slice(0, 240) : "";
      } else {
        fn.gone = true;                                          // there was nothing underneath. Now there's nothing at all.
        fn.note = "";
      }
      ch.gp = (ch.gp || 0) + paid;
      const nowDormant = facilityDormant(fac);
      const roomName = ((BASTION_FACILITIES[fac.defId] || {}).name || fac.defId).toLowerCase();
      s.logEntries.push({
        id: "log" + s.nextId++, charId: ch.id, entryType: "EARNING", status: "APPROVED",
        date: todayLocal(), dtEarned: 0, gpEarned: paid,
        summary: ch.bastion.name + " — sold the " + wasLabel.toLowerCase() + " " + (fn.name || fn.slot) + " for " + paid + " gp",
        note: fn.gone
          ? furnNoneLeft(fn) + (fn.name || fn.slot) + " in the " + roomName + " any more."
          : "The " + (fn.name || fn.slot) + " " + furnIsAre(fn) + " " + (FURNISHING_TIER_BY_ID[fn.tier] || FURNISHING_TIERS[0]).label.toLowerCase() + " now.",   // read the tier it IS now, not one computed off an index
        flavor: "A cart came for it before noon. Nobody in the house said anything, which was worse than if they had.",
      });
      if (nowDormant && !wasDormant) {
        fac.dormant = true;
        s.notices.push({ id: "n" + s.nextId++, type: "facilitydormant", ctx: "player", accountId: ch.ownerId, char: ch.name, bastion: ch.bastion.name, room: (BASTION_FACILITIES[fac.defId] || {}).name || fac.defId });
      }
      return s;
    }
    case "REFURNISH": {
      // You sold it for half. You buy it back for what it's worth. That's what a hard winter costs.
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion || ch.status === "dead" || ch.bastion.abandoned) return s;
      const fac = ch.bastion.facilities.find((f) => f.id === action.facId);
      if (!fac) return s;
      const fn = (fac.furnishings || []).find((x) => x.id === action.furnId);
      if (!fn || !fn.gone) return s;
      const cost = furnishingValue(fac, { slot: fn.slot, tier: "basic" });   // full price for a serviceable replacement
      if ((ch.gp || 0) < cost) return s;
      ch.gp = (ch.gp || 0) - cost;
      fn.gone = false;
      fn.tier = "basic";
      if (action.note !== undefined) fn.note = String(action.note).slice(0, 240);
      if (!facilityDormant(fac)) fac.dormant = false;             // something's back; the room can work again
      s.logEntries.push({
        id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED",
        date: todayLocal(), dtSpent: 0, gpSpent: cost,
        spentOn: ch.bastion.name + " — " + (fn.plural ? "plain " : "a plain ") + (fn.name || fn.slot) + " for the " + ((BASTION_FACILITIES[fac.defId] || {}).name || fac.defId).toLowerCase() + " (" + cost + " gp)",
        flavor: "Bought back at full price what was sold at half. Nobody mentions the arithmetic.",
      });
      return s;
    }
    case "SET_FURNISHING_NOTE": {
      // Describing your own things costs nothing and is the whole point.
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion || ch.status === "dead" || ch.bastion.abandoned) return s;
      const fac = ch.bastion.facilities.find((f) => f.id === action.facId);
      if (!fac) return s;
      const fn = (fac.furnishings || []).find((x) => x.id === action.furnId);
      if (!fn) return s;
      fn.note = String(action.note || "").slice(0, 240);
      return s;
    }
    case "ADD_FACILITY_FURNISHING": {
      // A KEEPSAKE. The room's own fittings came with it and climb the tier ladder (UPGRADE/SELL) —
      // a keepsake is the other kind of thing in a room: a carved figure, a shrine, a trophy, a
      // child's drawing pinned to a beam. It has no slot, it doesn't get "finer", and it is worth
      // exactly what the player put into it. The seed's candle-shrine and training pell ARE these,
      // which is why REBUILD keeps every slot-less piece and tears out the rest. Adding one costs
      // the gold you spent on it — nothing for a thing you made or were given, more for a thing you
      // had made. That is the only door in this system by which a room gains a piece it wasn't born
      // with, and it is deliberately about the fiction, not the mechanics: a keepsake makes nothing
      // work better. It just makes the place yours.
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion || ch.status === "dead" || ch.bastion.abandoned) return s;
      const fac = ch.bastion.facilities.find((f) => f.id === action.facId);
      if (!fac) return s;
      const note = String(action.note || "").trim().slice(0, 240);
      if (!note) return s;                                        // a keepsake IS its description — no words, no keepsake
      const gp = Math.max(0, Math.floor(+(action.gp as any) || 0));
      if ((ch.gp || 0) < gp) return s;                            // you can't put in more than you have
      const KEEPSAKE_CAP = 24;                                    // a room holds a mantelful before it stops being memory and starts being clutter
      if ((fac.furnishings || []).filter((x) => !x.slot && !x.gone).length >= KEEPSAKE_CAP) return s;
      if (gp > 0) ch.gp = (ch.gp || 0) - gp;
      if (!Array.isArray(fac.furnishings)) fac.furnishings = [];
      fac.furnishings.push({ id: "fn" + s.nextId++, slot: null, name: null, note, gp, tier: "basic", keepsake: true });
      const roomName = ((BASTION_FACILITIES[fac.defId] || {}).name || fac.defId).toLowerCase();
      if (gp > 0) s.logEntries.push({
        id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED",
        date: todayLocal(), dtSpent: 0, gpSpent: gp,
        spentOn: ch.bastion.name + " — a keepsake for the " + roomName + ": " + note,
        flavor: "Not a thing the " + roomName + " needed. A thing " + ch.name + " wanted in it. Those are different, and it is the second kind that turns a keep into a home.",
      });
      return s;
    }
    case "REMOVE_FACILITY_FURNISHING": {
      // Only a keepsake (slot-less) can be taken out of a room outright. The room's OWN fittings are
      // never deleted — they are sold DOWN the ladder (SELL_FURNISHING), because the DMG guarantees a
      // facility stays furnished. A keepsake owes the room nothing, so it can simply go. No refund:
      // you didn't sell it, you just don't want it here any more, and the room is a little barer for it.
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion || ch.status === "dead" || ch.bastion.abandoned) return s;
      const fac = ch.bastion.facilities.find((f) => f.id === action.facId);
      if (!fac) return s;
      const fn = (fac.furnishings || []).find((x) => x.id === action.furnId);
      if (!fn || fn.slot) return s;                               // a slotted fitting goes through SELL, not delete
      fac.furnishings = (fac.furnishings || []).filter((x) => x.id !== action.furnId);
      return s;
    }
    case "RENAME_FACILITY_HENCHMAN": {
      // DMG: "A player can assign names and personalities to hirelings in their character's Bastion."
      // Naming them is the player's job. Hiring them is not — they come with the room, and the room pays them.
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion || ch.status === "dead" || ch.bastion.abandoned) return s;
      const fac = ch.bastion.facilities.find((f) => f.id === action.facId);
      if (!fac) return s;
      const h = (fac.henchmen || []).find((x) => x.id === action.henchId);
      if (!h) return s;
      if (action.name !== undefined && String(action.name).trim()) h.name = String(action.name).trim().slice(0, 40);
      if (action.role !== undefined) h.role = String(action.role).slice(0, 40);
      if (action.note !== undefined) h.note = String(action.note).slice(0, 200);
      return s;
    }
    case "TAKE_BASTION_TURN": {
      // Look up, guard, do the one thing, return. The five parts are named above.
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by) return s;
      const leisure = bastionLeisure(ch);
      if (!bastionMayTakeTurn(ch, leisure)) return s;

      const orders = (action.orders || []).filter((o) => o.orderId);
      const maintaining = !!action.maintain;
      const n = ch.bastion!.turns.length + 1;
      if (!bastionOrdersLegal(ch, orders, maintaining, n, leisure)) return s;

      billBastionWeek(ch, n, leisure);
      const turn = openBastionWeek(ch, orders, maintaining, n, leisure);
      tellBastionWeek(s, ch, turn, leisure);
      if (!leisure) s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date: turn.date, dtSpent: BASTION_TURN_DT, gpSpent: 0, spentOn: ch.name + " — Bastion turn (" + ch.bastion!.name + ")" });
      return s;
    }
    case "RESOLVE_BASTION_TURNS": {
      // Completes work whose real-world timer has elapsed. Runs on view load / 1-Hz tick.
      // The fast path above already returned if nothing is due, so by here something IS.
      const now = Date.now();
      // Phase 1c: BATCHED. Sunday night is a thundering herd — weekly cadence clusters, and
      // resolving 12,500 due keeps serially froze the UI for 8.8 s in the 2x-AL measurement.
      // Cap the work per dispatch; the app-shell fast path keeps its watermark at 0 while work
      // remains, so the next 1 Hz tick takes the next batch. Nothing waits more than a few
      // seconds; no single dispatch takes more than a frame's worth of keeps.
      // The scan itself is RAW (no clone): a keep is only drafted when it actually has work.
      const RESOLVE_BATCH = 250;
      let done = 0;
      for (const [chId, raw] of rawEntries(s.characters as any)) {
        if (done >= RESOLVE_BATCH) break;
        const b = raw && raw.bastion;
        if (!b) continue;
        const building = (Array.isArray(b.facilities) && b.facilities.some((f: any) => f.building && f.building.readyAt <= now))
          || (b.wallsBuilding && b.wallsBuilding.readyAt <= now);
        const beat = b.happening && (b.happening.endsAt <= now || (b.happening.beats || []).some((x: any, i: number) => x.at <= now && i >= (b.happening.shown || 0)));
        const turnDue = Array.isArray(b.turns) && b.turns.some((t: any) => !t.resolved && t.readyAt <= now);
        if (!building && !beat && !turnDue) continue;
        const ch: any = s.characters[chId];              // NOW draft it — clone-on-read, this keep only
        done++;
        finishConstruction(s, ch, now);
        advanceBastionHappening(s, ch, now);
        const leisure = bastionLeisure(ch);
        let ticked = false;                                              // only a week that actually CLOSED ages a charm
        ch.bastion.turns.forEach((t) => {
          if (t.resolved || t.readyAt > now) return;
          resolveBastionTurn(s, ch, t, leisure);
          ticked = true;
        });
        if (ticked) expireCharmItemsFor(s, ch, now);                     // Q15: the holder's own clock, bastion side
      }
      return s;
    }
  }
  return undefined;   // not a bastion action
}
