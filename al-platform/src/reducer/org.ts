import { isAdmin } from "../lib/rules";
import { canManageOrg } from "../lib/rules";
import { ACCOUNTS, accName, putBlob, sweepBlobs } from "../lib/core";

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
export const ORG_ACTION_NAMES: readonly string[] = [
  "ADD_HOME_STORE", "ADD_STORE", "ANSWER_POLL", "BAN_USER",
  "BLOCK_USER", "CREATE_ORG", "DEACTIVATE_USER", "DISMISS_STORE_REQUEST",
  "EDIT_ORG", "EDIT_STORE", "FLAG_STORE_FIELD", "GRANT_LICENSE",
  "GRANT_ROLE", "REACTIVATE_USER", "REMOVE_HOME_STORE", "REMOVE_WARNING",
  "REQUEST_STORE", "RESOLVE_FLAG", "RESOLVE_STORE_FLAG", "SET_ORG_ASSISTANT",
  "SET_ORG_LEADER", "SET_ORG_MEMBERSHIP", "SET_ORG_SCHEDULER", "SET_STORE_LOGO",
  "TOGGLE_AVAILABLE", "UNBLOCK_USER", "WARN_USER", "WITHDRAW_LICENSE",
];


import { mayActOnItem, orgsOfAccount, storesOf } from "../lib/rules";
import { storeName } from "../lib/play";
// ============================================================================
// ORGANISATION REDUCER ACTIONS.
// Organisations and their officers, stores, roles and licences, moderation, polls.
// ============================================================================

import type { AppState } from "../types";

export function orgActions(s: any, action: any, dropNotice: (p: any) => void): AppState | undefined {
  switch (action.type) {
    case "GRANT_LICENSE": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by) return s;
      if (!ch.shared) return s;                                     // two-level: an asset must be shared to the gallery before it can be licensed
      const okHero = ch.status === "retired";                       // retired hero → castable NPC
      const okRuin = ch.status === "dead" && ch.bastion;            // fallen keep → usable location
      if (!okHero && !okRuin) return s;
      ch.licensed = true;                                           // consent captured at the UI (CC BY 4.0)
      return s;
    }
    case "WITHDRAW_LICENSE": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by) return s;
      ch.licensed = false;                                          // stops NEW author use; per CC BY 4.0, uses already made (recorded credits) remain irrevocably valid
      return s;
    }
    case "SET_ORG_MEMBERSHIP": {
      // An admin, or the leadership of the organisation being joined/left, may set this.
      if (!(isAdmin(s, action.by) || canManageOrg(s, action.by, action.orgId))) return s;
      if (!s.orgMembers) s.orgMembers = {};
      const cur = orgsOfAccount(s, action.accountId).filter((o) => o !== action.orgId);
      s.orgMembers[action.accountId] = action.join ? [...cur, action.orgId] : cur;
      return s;
    }
    // ---- verifying an imported item -------------------------------------------------
    // Imports arrive one per item but raise a single notice per character; the notice is only
    // cleared once nothing is left pending for that character.
    case "TOGGLE_AVAILABLE": {
      if (!mayActOnItem(s, action.itemId, action.by)) return s;   // only the holder (or an admin) may touch an item
      const it = s.items[action.itemId];
      if (!it) return s;
      if (it.equipped) return s;         // equipped items can't be offered
      it.available = !it.available;
      return s;
    }
    case "BLOCK_USER": {
      if (!s.blocks) s.blocks = {};
      const w = s.blocks[action.acc] || [];
      if (!w.includes(action.target)) s.blocks[action.acc] = [...w, action.target];
      return s;
    }
    case "UNBLOCK_USER": {
      if (s.blocks && s.blocks[action.acc]) s.blocks[action.acc] = s.blocks[action.acc].filter((x) => x !== action.target);
      return s;
    }
    case "WARN_USER": {
      if (!isAdmin(s, action.by)) return s;   // moderation is admin-only
      s.mod.warnings[action.acc] = (s.mod.warnings[action.acc] || 0) + 1;
      s.notices.push({ id: "n" + s.nextId++, ctx: "player", type: "warn", accountId: action.acc, reason: action.reason || "A message you sent was reported to the administrators." });
      return s;
    }
    case "REMOVE_WARNING": {
      if (!isAdmin(s, action.by)) return s;   // moderation is admin-only
      const cur = s.mod.warnings[action.acc] || 0;
      if (cur <= 1) delete s.mod.warnings[action.acc];
      else s.mod.warnings[action.acc] = cur - 1;
      return s;
    }
    case "BAN_USER": {
      if (!isAdmin(s, action.by)) return s;   // moderation is admin-only
      const until = new Date(Date.now() + (action.days || 7) * 86400000).toISOString();
      s.mod.bans[action.acc] = until;
      s.notices.push({ id: "n" + s.nextId++, ctx: "player", type: "ban", accountId: action.acc, until });
      const bn = accName(action.acc);
      Object.values(s.items).forEach((it: any) => { if (it.provenance.source === "DM_VOUCH" && it.provenance.by === bn) it.review = { flagged: true, reason: "Vouching DM " + bn + " is suspended" }; });
      return s;
    }
    case "DEACTIVATE_USER": {
      // Privileged: an actor without the admin role must not reach this. There was NO check
      // here at all - any account could grant itself a role, deactivate a user, or demote a
      // DM. Latent while my app is single-user and in-memory; a real hole the moment a
      // backend exists. Found by the transition suite's unauthorised-actor property.
      if (!isAdmin(s, action.by)) return s;
      if (!s.mod.deactivated.includes(action.acc)) s.mod.deactivated.push(action.acc);
      const dn = accName(action.acc);
      Object.values(s.items).forEach((it: any) => { if (it.provenance.source === "DM_VOUCH" && it.provenance.by === dn) it.review = { flagged: true, reason: "Vouching DM " + dn + " is deactivated" }; });
      return s;
    }
    case "REACTIVATE_USER": {
      // Privileged: an actor without the admin role must not reach this. There was NO check
      // here at all - any account could grant itself a role, deactivate a user, or demote a
      // DM. Latent while my app is single-user and in-memory; a real hole the moment a
      // backend exists. Found by the transition suite's unauthorised-actor property.
      if (!isAdmin(s, action.by)) return s;
      delete s.mod.bans[action.acc];
      s.mod.deactivated = s.mod.deactivated.filter((x) => x !== action.acc);
      const rn = accName(action.acc);
      Object.values(s.items).forEach((it: any) => { if (it.review && it.provenance.by === rn) delete it.review; });
      return s;
    }
    case "EDIT_ORG": {
      const o = s.organizations[action.orgId];
      if (!o) return s;
      if (!(isAdmin(s, action.by) || o.leaderId === action.by || (o.assistantIds || []).includes(action.by))) return s;   // admin, leader, or assistant
      const f = action.fields || {};
      ["name", "short", "tagline", "region", "blurb", "phone", "email", "facebook"].forEach((k) => { if (f[k] !== undefined) o[k] = f[k]; });
      if (f.highlights !== undefined) o.highlights = f.highlights;
      if (f.eventBased !== undefined) o.eventBased = f.eventBased;
      if (f.storeIds !== undefined) o.storeIds = f.storeIds;
      if (f.preschedule !== undefined) o.preschedule = !!f.preschedule;   // hide new tables until an org lead publishes them
      return s;
    }
    case "SET_ORG_LEADER": {
      if (!isAdmin(s, action.by)) return s;   // only an admin appoints the leader
      const o = s.organizations[action.orgId];
      if (!o) return s;
      if (action.remove) { o.leaderId = null; return s; }
      o.leaderId = action.accountId;
      o.assistantIds = (o.assistantIds || []).filter((id) => id !== action.accountId);   // leader can't also be an assistant
      s.notices.push({ id: "n" + s.nextId++, ctx: "player", type: "orgleader", accountId: action.accountId, org: o.name });
      return s;
    }
    case "SET_ORG_ASSISTANT": {
      const o = s.organizations[action.orgId];
      if (!o) return s;
      if (!(isAdmin(s, action.by) || o.leaderId === action.by)) return s;   // admin or the leader appoints assistants
      if (!o.assistantIds) o.assistantIds = [];
      if (action.remove) {
        o.assistantIds = o.assistantIds.filter((id) => id !== action.accountId);
      } else if (action.accountId !== o.leaderId && !o.assistantIds.includes(action.accountId)) {
        o.assistantIds.push(action.accountId);
        s.notices.push({ id: "n" + s.nextId++, ctx: "player", type: "orgassistant", accountId: action.accountId, org: o.name });
      }
      return s;
    }
    case "SET_ORG_SCHEDULER": {
      const o = s.organizations[action.orgId];
      if (!o) return s;
      if (!(isAdmin(s, action.by) || o.leaderId === action.by)) return s;   // admin or the leader appoints schedulers
      if (!o.schedulerIds) o.schedulerIds = [];
      if (action.remove) {
        o.schedulerIds = o.schedulerIds.filter((id) => id !== action.accountId);
      } else if (!o.schedulerIds.includes(action.accountId)) {
        o.schedulerIds.push(action.accountId);
        s.notices.push({ id: "n" + s.nextId++, ctx: "player", type: "orgscheduler", accountId: action.accountId, org: o.name });
      }
      return s;
    }
    case "CREATE_ORG": {
      if (!isAdmin(s, action.by)) return s;
      const id = "org_" + s.nextId++;
      const f = action.fields || {};
      s.organizations[id] = { id, name: f.name || "New organization", short: f.short || "", tagline: f.tagline || "", region: f.region || "", blurb: f.blurb || "", highlights: [], phone: f.phone || "", email: f.email || "", facebook: f.facebook || "", eventBased: !!f.eventBased, storeIds: f.storeIds || [], leaderId: null, assistantIds: [] };
      return s;
    }
    case "ANSWER_POLL": {
      const p = s.polls.find((x) => x.id === action.pollId);
      if (!p || p.status !== "open" || !p.recipients.includes(action.accountId)) return s;
      p.responses[action.accountId] = action.answer;
      dropNotice((n) => n.type === "poll" && n.pollId === p.id && n.accountId === action.accountId);   // answered → clear the ask
      // monitor recruitment: first "yes" becomes the (invisible) monitor and the poll closes
      if (p.kind === "monitor-recruit" && action.answer === "yes") {
        const se = s.sessions.find((x) => x.id === p.meta.session);
        if (se && !se.signups.some((u) => u.accountId === action.accountId)) {
          const ch: any = Object.values(s.characters).find((c: any) => c.ownerId === action.accountId && !c.pregen);
          se.signups.push({ accountId: action.accountId, charId: ch ? ch.id : null, monitor: true, monitorFor: p.meta.flaggedDm });
        }
        p.status = "closed";
        ACCOUNTS.filter((a) => (s.roles[a.id] || []).includes("admin")).forEach((a) => s.notices.push({ id: "n" + s.nextId++, type: "monitorset", ctx: "admin", accountId: a.id, who: accName(action.accountId), dm: accName(p.meta.flaggedDm) }));
        return s;
      }
      if (Object.keys(p.responses).length >= p.recipients.length) p.status = "closed";
      return s;
    }
    case "ADD_HOME_STORE": {
      if (!s.stores) s.stores = {};
      const cur = storesOf(s, action.acc);
      if (!cur.includes(action.storeId)) s.stores[action.acc] = [...cur, action.storeId];
      return s;
    }
    case "REMOVE_HOME_STORE": {
      const cur = storesOf(s, action.acc).filter((x) => x !== action.storeId);
      s.stores[action.acc] = cur.length ? cur : ["store_dj"]; // never leave someone store-less
      return s;
    }
    case "REQUEST_STORE": {
      if (!s.storeRequests) s.storeRequests = [];
      const srId = "sr" + s.nextId++;
      s.storeRequests.push({ id: srId, by: action.by, name: action.name, note: action.note || "" });
      ACCOUNTS.filter((a) => (s.roles[a.id] || []).includes("admin")).forEach((a) => {
        s.notices.push({ id: "n" + s.nextId++, type: "storereq", ctx: "admin", accountId: a.id, who: accName(action.by), store: action.name, ref: srId });
      });
      return s;
    }
    case "DISMISS_STORE_REQUEST": {
      s.storeRequests = (s.storeRequests || []).filter((r) => r.id !== action.id); dropNotice((n) => n.type === "storereq" && n.ref === action.id);
      return s;
    }
    case "ADD_STORE": {
      if (!s.storeRegistry) s.storeRegistry = {};
      const id = "store_" + s.nextId++;
      s.storeRegistry[id] = { id, name: action.name || "New store", address: action.address || "", phone: action.phone || "", hours: action.hours || "", website: action.website || "", logo: action.logo || null, mapsUrl: action.mapsUrl || "" };
      if (action.fromRequest) { s.storeRequests = (s.storeRequests || []).filter((r) => r.id !== action.fromRequest); dropNotice((n) => n.type === "storereq" && n.ref === action.fromRequest); }
      return s;
    }
    case "EDIT_STORE": {
      const r = s.storeRegistry[action.id];
      if (r) Object.assign(r, action.patch);
      // clear any flags on fields that were just edited
      if (action.patch) s.storeFlags = (s.storeFlags || []).filter((f) => !(f.storeId === action.id && action.patch[f.field] !== undefined));
      return s;
    }
    case "SET_STORE_LOGO": {
      const r = s.storeRegistry[action.id];
      if (r) { r.logo = putBlob(action.dataURL); sweepBlobs(s); }   // handle only
      return s;
    }
    case "FLAG_STORE_FIELD": {
      if (!s.storeFlags) s.storeFlags = [];
      if (!s.storeFlags.some((f) => f.storeId === action.storeId && f.field === action.field)) {
        const sfId = "sf" + s.nextId++;
        s.storeFlags.push({ id: sfId, storeId: action.storeId, field: action.field, by: action.by, note: action.note || "" });
        ACCOUNTS.filter((a) => (s.roles[a.id] || []).includes("admin")).forEach((a) => {
          s.notices.push({ id: "n" + s.nextId++, type: "storeflag", ctx: "admin", accountId: a.id, who: accName(action.by), store: storeName(s, action.storeId), field: action.field, ref: sfId });
        });
      }
      return s;
    }
    case "RESOLVE_STORE_FLAG": {
      s.storeFlags = (s.storeFlags || []).filter((f) => f.id !== action.id); dropNotice((n) => n.type === "storeflag" && n.ref === action.id);
      return s;
    }
    case "RESOLVE_FLAG": {
      const f = (s.dmFlags || []).find((x) => x.id === action.id);
      if (f) {
        f.status = "resolved";
        // if the flagged DM has no other open flags, clear the admin "DM flagged" notices for them
        const stillOpen = (s.dmFlags || []).some((x) => x.dm === f.dm && x.status !== "resolved");
        if (!stillOpen) dropNotice((n) => n.type === "dmflag" && n.dm === f.dm);
      }
      return s;
    }
    case "GRANT_ROLE": {
      // Privileged: an actor without the admin role must not reach this. There was NO check
      // here at all - any account could grant itself a role, deactivate a user, or demote a
      // DM. Latent while my app is single-user and in-memory; a real hole the moment a
      // backend exists. Found by the transition suite's unauthorised-actor property.
      if (!isAdmin(s, action.by)) return s;
      if (!s.roles[action.accountId]) s.roles[action.accountId] = ["player"];
      if (!s.roles[action.accountId].includes(action.role)) s.roles[action.accountId].push(action.role);
      s.dmRequests = s.dmRequests.filter((id) => id !== action.accountId);
      s.notices.push({ id: "n" + s.nextId++, type: "role", ctx: "player", accountId: action.accountId, role: action.role === "admin" ? "Administrator" : "Dungeon Master" });
      return s;
    }
  }
  return undefined;   // not ours
}
