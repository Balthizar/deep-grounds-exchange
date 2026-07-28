import { todayLocal } from "../lib/util";
import { isAdmin } from "../lib/rules";
import { isBlockedBy } from "../lib/rules";
import { ACCOUNTS, accName, putBlob } from "../lib/core";
import { findOrCreateThread } from "../bastion/engine";
import { isDeactivated, isSuspended } from "../lib/rules";
import { isModuleAuthor } from "../lib/play";

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
export const SOCIAL_ACTION_NAMES: readonly string[] = [
  "BROADCAST_ORG_MESSAGE", "CREATE_MODULE_LISTING", "DISMISS_NOTICE", "DISMISS_REPORT",
  "EDIT_MODULE_LISTING", "MARK_THREAD_READ", "REPORT_MESSAGE", "RESTORE_MODULE_LISTING",
  "RETRACT_MODULE_LISTING", "SEND_MESSAGE",
];

// ============================================================================
// SOCIAL REDUCER ACTIONS.
// Messages and threads, notices, module listings, reports.
// ============================================================================

import type { AppState } from "../types";

export function socialActions(s: any, action: any, dropNotice: (p: any) => void): AppState | undefined {
  switch (action.type) {
    case "CREATE_MODULE_LISTING": {
      if (!isModuleAuthor(s, action.by)) return s;                    // module-author DMs only
      if (!s.moduleListings) s.moduleListings = [];
      const t = action.listing || {};
      const title = (t.title || "").trim();
      if (!title) return s;
      const lo = Math.min(4, Math.max(1, +t.tierLow || 1));
      const hi = Math.min(4, Math.max(lo, +t.tierHigh || lo));
      s.moduleListings.push({
        id: "ml" + s.nextId++, authorId: action.by, title,
        setting: (t.setting || "Homebrew / Original Setting").trim(),
        tierLow: lo, tierHigh: hi,
        blurb: (t.blurb || "").trim(), buyLink: (t.buyLink || "").trim(),
        tags: Array.isArray(t.tags) ? [...new Set(t.tags.map((x) => (x || "").trim()).filter(Boolean))].slice(0, 12) : [],
        heroes: Array.isArray(t.heroes) ? t.heroes.filter((id) => s.characters[id] && s.characters[id].licensed) : [],   // only genuinely CC-licensed assets
        ruins: Array.isArray(t.ruins) ? t.ruins.filter((id) => s.characters[id] && s.characters[id].licensed) : [],
        retracted: false, createdAt: todayLocal(),
      });
      return s;
    }
    case "EDIT_MODULE_LISTING": {
      const l = (s.moduleListings || []).find((x) => x.id === action.listingId);
      if (!l || l.authorId !== action.by) return s;                  // author edits only their own
      const t = action.listing || {};
      if (t.title != null) { const tt = t.title.trim(); if (tt) l.title = tt; }
      if (t.setting != null) l.setting = t.setting.trim() || l.setting;
      if (t.tierLow != null) l.tierLow = Math.min(4, Math.max(1, +t.tierLow || 1));
      if (t.tierHigh != null) l.tierHigh = Math.min(4, Math.max(l.tierLow, +t.tierHigh || l.tierLow));
      if (t.blurb != null) l.blurb = t.blurb.trim();
      if (t.buyLink != null) l.buyLink = t.buyLink.trim();
      if (t.tags != null) l.tags = [...new Set(t.tags.map((x) => (x || "").trim()).filter(Boolean))].slice(0, 12);
      if (t.heroes != null) l.heroes = t.heroes.filter((id) => s.characters[id] && s.characters[id].licensed);
      if (t.ruins != null) l.ruins = t.ruins.filter((id) => s.characters[id] && s.characters[id].licensed);
      return s;
    }
    case "RETRACT_MODULE_LISTING": {
      const l = (s.moduleListings || []).find((x) => x.id === action.listingId);
      if (!l || l.authorId !== action.by) return s;
      l.retracted = true;                                            // soft, reversible pull
      return s;
    }
    case "RESTORE_MODULE_LISTING": {
      const l = (s.moduleListings || []).find((x) => x.id === action.listingId);
      if (!l || l.authorId !== action.by) return s;
      l.retracted = false;
      return s;
    }
    case "DISMISS_NOTICE": {
      // AUTHORITY (added 27 Jul, social.ts close-out). A notice carries its recipient in
      // accountId; dismissing it belongs to that recipient (or an admin). Left open, one account
      // could clear another's notifications. Low-stakes, but it is still someone else's inbox.
      const n = s.notices.find((x) => x.id === action.id);
      if (n && action.by && n.accountId && n.accountId !== action.by && !isAdmin(s, action.by)) return s;
      s.notices = s.notices.filter((x) => x.id !== action.id);
      return s;
    }
    case "SEND_MESSAGE": {
      if (action.from === action.to) return s;
      const senderAdmin = isAdmin(s, action.from);
      // sender suspended/deactivated → bounce to self (admins exempt)
      if (!senderAdmin && (isSuspended(s, action.from) || isDeactivated(s, action.from))) {
        const th0 = findOrCreateThread(s, action.from, action.to, action.fromCtx || "player", action.toCtx || "player");
        th0.messages.push({ from: "__system__", bounce: true, forAcct: action.from, text: action.text, reason: "Your account is currently suspended, so this message was not delivered." });
        th0.lastRead[action.from] = th0.messages.length;
        return s;
      }
      // recipient has blocked sender → bounce (admins bypass blocks)
      if (!senderAdmin && isBlockedBy(s, action.to, action.from)) {
        const th1 = findOrCreateThread(s, action.from, action.to, action.fromCtx || "player", action.toCtx || "player");
        th1.messages.push({ from: "__system__", bounce: true, forAcct: action.from, text: action.text, reason: `${accName(action.to)} is not currently accepting messages from you.` });
        th1.lastRead[action.from] = th1.messages.length;
        return s;
      }
      const th = findOrCreateThread(s, action.from, action.to, action.fromCtx || "player", action.toCtx || "player");
      th.messages.push({ from: action.from, text: action.text, photo: putBlob(action.photo), aboutItem: action.aboutItem || null });
      th.lastRead[action.from] = th.messages.length;
      return s;
    }
    case "BROADCAST_ORG_MESSAGE": {
      const o = s.organizations[action.orgId];
      if (!o) return s;
      if (!(isAdmin(s, action.by) || o.leaderId === action.by || (o.assistantIds || []).includes(action.by))) return s;
      const orgPid = "org:" + o.id;
      // resolve recipients + the channel the message should land in
      let recipients: any[] = [], toCtx = "player";
      if (action.group === "dms") { recipients = ACCOUNTS.filter((a) => (s.roles[a.id] || []).includes("dm")).map((a) => a.id); toCtx = "dm"; }
      else if (action.group === "players") { recipients = ACCOUNTS.filter((a) => (s.roles[a.id] || []).includes("player")).map((a) => a.id); toCtx = "player"; }
      else if (action.group === "assistants") { recipients = [...(o.assistantIds || [])]; toCtx = "player"; }
      else { recipients = ACCOUNTS.map((a) => a.id); toCtx = "player"; }   // "all"
      recipients = [...new Set(recipients)].filter((r) => r !== action.by);   // don't message yourself
      const noReply = !action.allowReplies;
      recipients.forEach((r) => {
        const th = findOrCreateThread(s, orgPid, r, "org", toCtx);
        th.messages.push({ from: orgPid, text: action.text, broadcast: true, noReply, group: action.group });
        th.lastRead[orgPid] = th.messages.length;   // sender side is caught up
      });
      return s;
    }
    case "MARK_THREAD_READ": {
      const th = s.threads.find((t) => t.id === action.id);
      if (th) th.lastRead[action.acc] = th.messages.length;
      return s;
    }
    case "REPORT_MESSAGE": {
      const admins = ACCOUNTS.filter((a) => (s.roles[a.id] || []).includes("admin")).map((a) => a.id);
      const target = admins.find((id) => id !== action.from) || admins[0];
      if (!target) return s;
      const th = findOrCreateThread(s, action.from, target, action.fromCtx || "player", "admin");
      th.messages.push({ from: action.from, text: "", report: { sender: action.sender, senderName: accName(action.sender), text: action.text } });
      th.lastRead[action.from] = th.messages.length;
      if (!s.mod.reports) s.mod.reports = [];
      s.mod.reports.push({ id: "rep" + s.nextId++, reporter: action.from, sender: action.sender, text: action.text });
      s.notices.push({ id: "n" + s.nextId++, ctx: "admin", type: "report", accountId: target, who: accName(action.from), about: accName(action.sender) });
      return s;
    }
    case "DISMISS_REPORT": {
      if (!isAdmin(s, action.by)) return s;   // report triage is admin-only
      if (s.mod.reports) s.mod.reports = s.mod.reports.filter((r) => r.id !== action.id);
      return s;
    }
  }
  return undefined;   // not ours
}
