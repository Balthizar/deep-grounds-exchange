import { todayLocal } from "../lib/util";
import { L5_STARTING_ITEMS, LIFESTYLE_BY_ID, callKind } from "../lib/rules";
import { BASTION_BEDS_BY_SIZE, BASTION_FACILITIES } from "../data/bastion";
import { CATALOG } from "../data/catalog";
import { accName, itemCat, itemClassOf, mkItem, putBlob, sweepBlobs, verified } from "../lib/core";
import { mayActOnChar, normalizeCarriedGifts } from "../lib/rules";
import { severBastionCombines } from "../bastion/engine";

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
export const CHARACTER_ACTION_NAMES: readonly string[] = [
  "ADD_CHARACTER", "ADD_FAVOR", "ADD_FRIEND", "ADD_RETIRE_TALE",
  "EDIT_CHARACTER", "EXPAND_RETIRE_TALE", "KILL_CHARACTER", "REMOVE_CHARACTER",
  "REMOVE_FAVOR", "REMOVE_FRIEND", "RETIRE_CHARACTER", "SET_AVATAR",
  "SET_BIO", "SET_CHARACTER_IMAGE", "SET_EPITAPH", "SET_LIFESTYLE",
  "SET_QUARTERS", "TOGGLE_FAVOR_FADED", "TOGGLE_SHARE_HERO", "UNRETIRE_CHARACTER",
];

// ============================================================================
// CHARACTER REDUCER ACTIONS.
// Creation and import, editing, retirement and death, favours, friends, profile.
// ============================================================================

import type { AppState } from "../types";

export function characterActions(s: any, action: any, dropNotice: (p: any) => void): AppState | undefined {
  switch (action.type) {
    case "ADD_CHARACTER": {
      const id = "ch_" + s.nextId++;
      s.characters[id] = { id, ownerId: action.accountId, wishlist: [], dt: 0, gp: 0, ...action.char };
      if (!s.players[action.accountId]) s.players[action.accountId] = { characterIds: [], shelf: [] };
      s.players[action.accountId].characterIds.push(id);
      // ALPG level-5 start: mint the one chosen starting magic item (500 GP + 40 DT are set on the char by the creation form)
      if (action.startingItem && CATALOG[action.startingItem] && L5_STARTING_ITEMS.includes(action.startingItem)) {
        const iid = "item_" + s.nextId++;
        s.items[iid] = mkItem(iid, action.startingItem, itemClassOf(action.startingItem, "MAGIC_ITEM"), s.characters[id].campaign, verified("L5_START", accName(action.accountId)), { type: "CHARACTER", id });
      }
      return s;
    }
    case "EDIT_CHARACTER": {
      if (!mayActOnChar(s, action.charId, action.by)) return s;   // only the owner (or an admin) may touch a character
      const ch = s.characters[action.charId];
      if (ch) { Object.assign(ch, action.char); normalizeCarriedGifts(s, ch); }   // tier may have changed → drop now-illegal carries
      return s;
    }
    case "REMOVE_CHARACTER": {
      if (!mayActOnChar(s, action.charId, action.by)) return s;   // only the owner (or an admin) may touch a character
      const ch = s.characters[action.charId];
      if (!ch) return s;
      // delete the character's bound items and its log entries, then the character
      Object.values(s.items).forEach((it: any) => { if (it.holder.type === "CHARACTER" && it.holder.id === action.charId) delete s.items[it.id]; });
      severBastionCombines(s, action.charId);   // and dissolve any bastion combines it was part of
      s.logEntries = s.logEntries.filter((l) => l.charId !== action.charId);
      s.sessions.forEach((ss) => { ss.signups = ss.signups.filter((u) => u.charId !== action.charId); });
      if (s.players[ch.ownerId]) s.players[ch.ownerId].characterIds = s.players[ch.ownerId].characterIds.filter((x) => x !== action.charId);
      delete s.characters[action.charId];
      return s;
    }
    case "RETIRE_CHARACTER": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || (ch.status && ch.status !== "active")) return s;
      ch.status = "retired";
      s.sessions.forEach((ss) => { if (ss.status !== "completed") ss.signups = ss.signups.filter((u) => u.charId !== ch.id); });   // pull from any upcoming tables
      // bound gear moves to the retirement shelf, tagged with the character it came from
      Object.values(s.items).forEach((it: any) => {
        if (it.holder.type === "CHARACTER" && it.holder.id === ch.id) { it.holder = { type: "RETIREMENT_SHELF", id: ch.ownerId }; it.shelvedFrom = ch.id; }
      });
      return s;
    }
    case "UNRETIRE_CHARACTER": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || ch.status !== "retired") return s;   // only a retired character can be called back
      ch.status = "active";
      // The summons is ANSWERED — clear it. It used to stay at the gate: Bram went active and the call
      // stood there forever, and the retirement page could no longer show it because he wasn't retired.
      // A call is a thing that waits for an answer; this IS the answer.
      if (ch.bastion && ch.bastion.pendingCall && callKind(ch.bastion) === "summons") ch.bastion.pendingCall = null;
      // reclaim any shelved gear still tagged to this character (not reassigned elsewhere)
      Object.values(s.items).forEach((it: any) => {
        if (it.holder.type === "RETIREMENT_SHELF" && it.holder.id === ch.ownerId && it.shelvedFrom === ch.id) { it.holder = { type: "CHARACTER", id: ch.id }; delete it.shelvedFrom; }
      });
      return s;
    }
    case "KILL_CHARACTER": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || ch.status === "dead") return s;   // terminal; can't die twice
      ch.status = "dead";
      s.sessions.forEach((ss) => { if (ss.status !== "completed") ss.signups = ss.signups.filter((u) => u.charId !== ch.id); });   // pull from any upcoming tables
      // permanent death — carried/worn gear is lost; magic items LEFT AT THE BASTION are sealed in the ruin
      // as relics: a fallen hero's legacy, never reclaimable by the owner, but material a writer can build on.
      const relics: any[] = [];
      Object.values(s.items).forEach((it: any) => {
        const held = it.holder.type === "CHARACTER" && it.holder.id === ch.id;
        const shelved = it.holder.type === "RETIREMENT_SHELF" && it.shelvedFrom === ch.id;
        if (!held && !shelved) return;
        const rcat = itemCat(it);
        if (held && ch.bastion && it.inPack === false && !it.equipped && !it.available && rcat && !rcat.mundane && !rcat.consumable) {
          relics.push({ catalogId: it.catalogId, name: rcat.name, rarity: rcat.rarity, itemClass: it.itemClass, provenance: it.provenance, history: it.history || [] });
        }
        delete s.items[it.id];   // it leaves the live economy either way — the player never gets it back
      });
      if (ch.bastion) {
        // A fallen lord's keep does not keep working. Any week still in flight is closed with the
        // lord, not left running - stateViolations enforces this ("dead, with a turn still
        // running") and the fuzz caught KILL_CHARACTER leaving it open.
        (ch.bastion.turns || []).forEach((t: any) => { if (t && !t.resolved) { t.resolved = true; t.abandoned = true; } });
        if (ch.bastion.wallsBuilding) ch.bastion.wallsBuilding = null;
        (ch.bastion.facilities || []).forEach((f: any) => { if (f && f.building) f.building = null; });
        ch.bastion.abandoned = true;   // the keep falls to ruin and remains a ruin — a memorial location (its ghost + fallen defenders endure)
        ch.bastion.fallenLord = { name: ch.name, race: ch.race || "", cls: ch.cls || "", level: ch.level || null, tier: ch.tier || null, faction: ch.faction || "" };   // the ruin keeps a copy of its lord — a ghost for an author to raise
        if (relics.length) ch.bastion.relics = (ch.bastion.relics || []).concat(relics);   // and whatever they left stored here, sealed forever
        severBastionCombines(s, ch.id);   // a ruin defends no one — dissolve its combines
      }
      return s;
    }
    case "SET_EPITAPH": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || ch.status !== "dead") return s;   // an epitaph is for the fallen
      ch.epitaph = (action.text || "").trim();
      return s;
    }
    case "ADD_RETIRE_TALE": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !(action.text || "").trim()) return s;
      if (!Array.isArray(ch.retireTale)) ch.retireTale = [];
      ch.retireTale.push({ id: "tale" + s.nextId++, date: todayLocal(), text: action.text.trim(), seed: action.seed || null });
      return s;
    }
    case "EXPAND_RETIRE_TALE": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !Array.isArray(ch.retireTale)) return s;
      const t = ch.retireTale.find((x) => x.id === action.taleId);   // add to the story (or clear it back to just the prompt)
      if (t) t.text = (action.text || "").trim();
      return s;
    }
    case "TOGGLE_SHARE_HERO": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || (ch.status !== "retired" && ch.status !== "dead")) return s;   // only a retired or fallen hero can be enshrined
      ch.shared = !ch.shared;
      return s;
    }
    case "ADD_FAVOR": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by) return s;   // the character's owner logs their own favors
      if (!ch.favors) ch.favors = [];
      const f = action.favor || {};
      if (!(f.desc || "").trim()) return s;
      const kind = ["rare-gear", "paid-debt", "lodging", "spellcasting"].includes(f.kind) ? f.kind : "rare-gear";
      let value = Math.max(0, +f.value || 0);
      if (kind === "spellcasting") value = Math.min(500, value);   // ALPG p.4: spellcasting favor is capped at 500 GP
      ch.favors.push({ id: "fv" + s.nextId++, kind, desc: f.desc.trim(), value, fromAdventure: (f.fromAdventure || "").trim(), active: true });
      return s;
    }
    case "REMOVE_FAVOR": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !Array.isArray(ch.favors)) return s;
      ch.favors = ch.favors.filter((f) => f.id !== action.favorId);
      return s;
    }
    case "TOGGLE_FAVOR_FADED": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !Array.isArray(ch.favors)) return s;
      const f = ch.favors.find((x) => x.id === action.favorId);
      if (f && f.kind !== "paid-debt" && f.kind !== "spellcasting") f.active = f.active === false;   // ALPG p.6: paid debts & rendered spellcasting don't fade
      return s;
    }
    case "ADD_FRIEND": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by) return s;
      if (!ch.friends) ch.friends = [];
      const fr = action.friend || {};
      if (!(fr.name || "").trim()) return s;
      ch.friends.push({ id: "fr" + s.nextId++, name: fr.name.trim(), adventure: (fr.adventure || "").trim(), note: (fr.note || "").trim() });
      return s;
    }
    case "REMOVE_FRIEND": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !Array.isArray(ch.friends)) return s;
      ch.friends = ch.friends.filter((f) => f.id !== action.friendId);
      return s;
    }
    case "SET_LIFESTYLE": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by) return s;
      if (ch.status === "dead") return s;   // the fallen keep whatever life they had
      if (action.lifestyle && !LIFESTYLE_BY_ID[action.lifestyle]) return s;   // whitelist
      ch.lifestyle = action.lifestyle || null;   // FLAVOR ONLY — never touches gp; AL levies no cost of living
      return s;
    }
    case "SET_CHARACTER_IMAGE": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by) return s;
      if (ch.status === "dead") return s;   // a fallen hero's portrait stands as it was
      ch.image = putBlob(action.dataURL); sweepBlobs(s);   // handle only — the bytes never enter cloned state
      return s;
    }
    case "SET_QUARTERS": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !ch.bastion || ch.status === "dead" || ch.bastion.abandoned) return s;
      const bedroom = ch.bastion.facilities.find((f) => f.id === action.bedroomId && f.defId === "bedroom");
      if (!bedroom) return s;
      if (!Array.isArray(bedroom.occupants)) bedroom.occupants = [];
      const isHero = action.hirelingId === ch.id;                  // the hero's own bedroom — the DMG's "where the hero sleeps"
      const onSpecial = ch.bastion.facilities.some((f) => (BASTION_FACILITIES[f.defId] || {}).kind === "special" && (f.henchmen || []).some((h) => h.id === action.hirelingId));
      if (action.assign) {
        if (!isHero && !onSpecial) return s;                        // the hero, or a working hireling
        ch.bastion.facilities.filter((f) => f.defId === "bedroom").forEach((f) => { if (Array.isArray(f.occupants)) f.occupants = f.occupants.filter((id) => id !== action.hirelingId); });
        const cap = BASTION_BEDS_BY_SIZE[bedroom.size] || 2;
        if (bedroom.occupants.length >= cap) return s;              // the room is full
        bedroom.occupants.push(action.hirelingId);
      } else {
        bedroom.occupants = bedroom.occupants.filter((id) => id !== action.hirelingId);
      }
      return s;
    }
    case "SET_BIO": {
      if (!s.bios) s.bios = {};
      s.bios[action.accountId] = action.bio;
      return s;
    }
    case "SET_AVATAR": {
      if (!s.avatars) s.avatars = {};
      s.avatars[action.accountId] = putBlob(action.dataURL); sweepBlobs(s);   // handle only
      return s;
    }
  }
  return undefined;   // not ours
}
