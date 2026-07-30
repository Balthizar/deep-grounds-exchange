import { todayLocal } from "../lib/util";
import { bookShelfCap } from "../data/bastion";
import { isAdmin } from "../lib/rules";
import SPELLS from "../data/srd/spells.json";

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
export const ITEM_ACTION_NAMES: readonly string[] = [
  "ACCEPT_CHARM_GIFT", "ADD_PREGEN", "ADD_PREGEN_ITEM", "ADD_WISH", "ASSIGN_CERT",
  "AUTHENTICATE_CERT", "AUTHENTICATE_TICKET", "BUY_SCROLL", "CANCEL_TRADE",
  "CHECKOUT_MARKET", "CLAIM_CERT", "CLAIM_PAPER_ITEM", "CONFIRM_TRADE",
  "DECLINE_CHARM_GIFT", "DELETE_ITEM", "DISMISS_SWAP", "GIFT_CERT", "IMPORT_CHARACTER_ITEM",
  "MARK_LOST", "MINT_BOOK_ITEM", "OFFER_CHARM_GIFT", "PROPOSE_TRADE", "REASSIGN_SHELF_ITEM", "REJECT_DM_ITEM",
  "REJECT_IMPORT_ITEM", "REJECT_PAPER_ITEM", "REJECT_SLOT_ITEM", "REMOVE_GIFT",
  "REMOVE_WISH", "REQUEST_AUTH", "ROLL_ITEM_SLOT", "SCRIBE_SCROLL",
  "SELL_TO_RONALDO",
  "SEND_TRADE_PROPOSAL", "SET_CHARM_DESC", "SUBMIT_DISPOSAL", "SUBMIT_DM_ITEM", "SUBMIT_SLOT_ITEM",
  "TOGGLE_ATTUNED", "TOGGLE_CARRIED", "TOGGLE_EQUIPPED", "TOGGLE_GIFT_CARRIED",
  "TOGGLE_WISHLIST", "TRANSFER_PREGEN", "UNASSIGN_CERT", "VERIFY_DM_ITEM",
  "VERIFY_IMPORT_ITEM", "VERIFY_PAPER_ITEM", "VERIFY_SLOT_ITEM",
];

// ============================================================================
// ITEM REDUCER ACTIONS - the item lifecycle.
// Acquisition (market, scrolls, pregens, player-entered claims), verification,
// trade and gifting, certificates, equipment state, wishlists, disposal.
// reducerImpl calls me with its draft state; I return undefined when the action
// belongs to some other part of my app.
// ============================================================================

import type { AppState } from "../types";
import { ATTUNE_SLOTS, CARRIED_LIMITS, MARKET_BY_ID, SCROLL_COST, TRADE_DT, sellValueOf, attunedCount, canTradeAcct, cancelTradeItems, carriedCount, carriedCounts, carriedCraftTools, equipSlot, giftLimit, handOverItem, inputterOf, isDMRole, itemBucket, legendaryTierBlocked, logTradeCost, liveCharmItemsHeld, mayActOnChar, mayActOnItem, meetsReq, normalizeCarriedGifts, provOf, satisfyWishlist, tierFromLevel, toolSpecials, tradeLegal, tradeSideStale, verifyingDMs } from "../lib/rules";
import { ACCOUNTS, accName, catName, itemCat, itemClassOf, mkItem, putBlob, unverified, verified } from "../lib/core";
import { findOrCreateThread } from "../bastion/engine";

export function itemActions(s: any, action: any, dropNotice: (p: any) => void): AppState | undefined {
  switch (action.type) {
    case "ADD_PREGEN": {
      const id = "ch_" + s.nextId++;
      s.characters[id] = { id, pregen: true, pregenOwner: action.dmId, ownerId: null, wishlist: [], dt: 0, gp: 0, ...action.char };
      return s;
    }
    case "ADD_PREGEN_ITEM": {
      if (!mayActOnChar(s, action.charId, action.by)) return s;   // only the owner (or an admin) may touch a character
      const ch = s.characters[action.charId];
      if (!ch || !ch.pregen) return s;
      const tier = ch.tier || tierFromLevel(ch.level);
      const bucket = itemBucket(action.catalogId, action.itemClass || "MAGIC_ITEM");
      const lim = CARRIED_LIMITS[tier] || CARRIED_LIMITS[1];
      const counts = carriedCounts(s, ch.id);
      if (bucket !== "gear" && counts[bucket] >= lim[bucket]) return s;  // AL tier carry limit reached (mundane gear is unlimited)
      if (legendaryTierBlocked(action.catalogId, tier)) return s;
      const nid = "it_" + s.nextId++;
      s.items[nid] = mkItem(nid, action.catalogId, itemClassOf(action.catalogId, action.itemClass), ch.campaign || "Forgotten Realms", verified("DM_VOUCH", accName(ch.pregenOwner)), { type: "CHARACTER", id: ch.id });
      const advn = itemCat(action).adventure || "Pre-generated character";
      s.items[nid].origin = { holder: ch.name, adventure: advn, note: "Issued with pre-generated character by " + accName(ch.pregenOwner), dmId: ch.pregenOwner };
      s.items[nid].lineage = [{ holder: ch.name, note: "Issued with pre-generated character", adventure: advn }];
      return s;
    }
    case "SELL_TO_RONALDO": {
      // RONALDO, the Exchange's fence. HOUSE MECHANISM — see the rate note below for what is
      // AL and what is ours. Frank's rulings, 27 Jul:
      //   scope    — "Ronaldo deals in the non magical", so itemClass GEAR and nothing else.
      //              GEAR is exactly ALDMG:157's "mundane non-story", and it is also the precise
      //              complement of the trade path (isTradeableClass = MAGIC_ITEM | EVENT_CERT),
      //              so nothing can be both traded and fenced.
      //   approval — "unverified Magic items are tradeable. Unverified mundane items are not."
      //              Verification gates the IRREVERSIBLE door only. A traded magic item is still
      //              an item and can be clawed back if it proves invalid; gold cannot. Once a
      //              mundane item becomes coin there is nothing left to remove, so the check has
      //              to happen here or it never happens at all.
      //   pack     — "it should only be pack because the pack that the player character has is
      //              specific to that one character." Holder must be this CHARACTER. Shelf items
      //              are deliberately out of reach: a shelf is not one character's property.
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by) return s;
      const ids = action.itemIds || [];
      if (!ids.length) return s;

      // Price first, and ALL-OR-NOTHING like CHECKOUT_MARKET: if any line is ineligible the whole
      // sale is refused rather than silently fencing the subset. A partial sale would leave the
      // player guessing which item Ronaldo took, and the gold is unrecoverable once moved.
      let total = 0;
      for (const id of ids) {
        const it = s.items[id];
        if (!it) return s;
        if (it.itemClass !== "GEAR") return s;                                  // non-magical only
        if (!it.provenance || it.provenance.state !== "VERIFIED") return s;      // unapproved gear is not sellable
        if (it.holder.type !== "CHARACTER" || it.holder.id !== ch.id) return s;  // out of this character's pack
        if (it.escrow) return s;                                                 // mid-trade, not his to take
        if (it.review && it.review.flagged) return s;                            // under review: still the DM's business
        total += sellValueOf(it.catalogId);
      }

      ch.gp = (ch.gp || 0) + total;
      const date = todayLocal();
      const names = ids.map((id) => catName(s.items[id].catalogId)).join(", ");
      for (const id of ids) {
        s.trades = s.trades.filter((t) => !(t.status === "PROPOSED" && (t.a.itemId === id || t.b.itemId === id)));
        if (s.listings) s.listings = s.listings.filter((l) => l.itemId !== id);
        delete s.items[id];
      }
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EARNING", status: "APPROVED",
        date, dtEarned: 0, gpEarned: total,
        note: "Sold to Ronaldo — " + names + " (half price, ALDMG:157)" });
      return s;
    }


    case "DELETE_ITEM": {
      if (!mayActOnItem(s, action.itemId, action.by)) return s;   // only the holder (or an admin) may touch an item
      // I drop any pending trades that referenced this item — no orphan proposals left behind
      s.trades = s.trades.filter((t) => !(t.status === "PROPOSED" && (t.a.itemId === action.itemId || t.b.itemId === action.itemId)));
      // clear any open market listing for it
      if (s.listings) s.listings = s.listings.filter((l) => l.itemId !== action.itemId);
      delete s.items[action.itemId];
      return s;
    }
    case "TRANSFER_PREGEN": {
      if (!mayActOnChar(s, action.charId, action.by)) return s;   // only the DM holding the pre-gen (or an admin) may transfer it
      const ch = s.characters[action.charId];
      if (!ch || !ch.pregen) return s;
      const from = ch.pregenOwner;
      ch.ownerId = action.toAccount;
      delete ch.pregen; delete ch.pregenOwner;
      if (!s.players[action.toAccount]) s.players[action.toAccount] = { characterIds: [], shelf: [] };
      if (!s.players[action.toAccount].characterIds.includes(ch.id)) s.players[action.toAccount].characterIds.push(ch.id);
      s.notices.push({ id: "n" + s.nextId++, ctx: "player", type: "pregen", accountId: action.toAccount, char: ch.name, from: accName(from) });
      return s;
    }
    case "REASSIGN_SHELF_ITEM": {
      const it = s.items[action.itemId];
      if (!it || it.holder.type !== "RETIREMENT_SHELF" || it.holder.id !== action.by) return s;
      if (it.itemClass === "UNTRADEABLE" || it.itemClass === "GEAR") return s;   // bound-to-owner gear can't move to a different character. Mundane gear likewise: AL's trade rule covers *magic* items ("Trading Magic Items", 5 DT each) — mundane equipment isn't on it, so it may be bought and sold per the PH, never traded across characters.
      const target = s.characters[action.toCharId];
      if (!target || target.ownerId !== action.by || (target.status && target.status !== "active")) return s;
      const src = s.characters[it.shelvedFrom || ""];
      if (it.campaign && target.campaign !== it.campaign) return s;   // AL transfer: same campaign…
      if (src && target.tier !== src.tier) return s;                  // …and same tier as the source character
      it.holder = { type: "CHARACTER", id: target.id };
      delete it.shelvedFrom;
      return s;
    }
    // ---- Q15, FRANK'S RULING (25 Jul): the Eldritch charm is GIFT-ONLY -----------------------
    // One door in, and it isn't the trade door. UNTRADEABLE walls off the market and the trade
    // lanes; these three actions are the only way a charm item changes hands. The offer puts it
    // in escrow, where it does not age — his words: the timer is in limbo until claimed — so a
    // friend should accept it just before they sit down at a table. Acceptance checks the DMG's
    // own uniqueness line ("you can't gain this Charm again while you still have it"): a blocked
    // accept leaves the gift waiting in escrow, still frozen, still theirs to claim later.
    case "MINT_BOOK_ITEM": {
      // FRANK'S RULING (25 Jul): "a decorative item going into the inventory as a point of
      // reference because a player thinks a book is cool." Flavor only — it does nothing, and
      // says so. The weekly volumes are ordinary archive books; THE rare Reference Book stays
      // un-copyable under the DMG's one-copy clause (his to overrule).
      const ch = s.characters[action.charId];
      if (!ch || !mayActOnChar(s, ch.id, action.by)) return s;
      const title = String(action.title || "").trim().slice(0, 140);
      if (!title) return s;
      const dupe = Object.values(s.items).find((x: any) => x.bookItem && x.name === title
        && x.holder && x.holder.type === "CHARACTER" && x.holder.id === ch.id);
      if (dupe) return s;                                             // one copy per shelf — click twice, own once
      // Size-scaled shelf cap (Frank, 29 Jul): Archive 10, Library 20, doubling per size tier. Count
      // the character's books of THIS kind (a library book carries a paragraph; an archive book a
      // link) against the minting facility's cap. At the cap, the shelf is full.
      const cap = bookShelfCap(String(action.defId || "archive"), String(action.size || "roomy"));
      if (cap > 0) {
        const isLibraryBook = !!String(action.paragraph || "").trim();
        const held = Object.values(s.items).filter((x: any) => x.bookItem && x.holder && x.holder.type === "CHARACTER" && x.holder.id === ch.id && (!!x.paragraph === isLibraryBook)).length;
        if (held >= cap) return s;                                     // the shelf is full — cap reached
      }
      const topic = String(action.topic || "").trim().slice(0, 140);
      const paragraph = String(action.paragraph || "").trim().slice(0, 900);   // Library books CONTAIN their three sourced facts as a paragraph; Archive books carry a wiki link instead
      const iid = "it" + s.nextId++;
      s.items[iid] = mkItem(iid, null, "STORY_ITEM", ch.campaign,
        verified("ARCHIVE", "the Archive at " + ((ch.bastion && ch.bastion.name) || "the keep")),
        { type: "CHARACTER", id: ch.id },
        { name: title, bookItem: true, inPack: false,   // lands on the shelf, not the pack — the player packs it when they want it at the table (Frank, 28 Jul: a pack full of every book is clutter)
          source: "The Deep Grounds Exchange \u2014 " + (paragraph ? "Library" : "Archive"),
          notes: paragraph
            ? "The librarian's gathered notes \u2014 three things worth knowing, bound together."
            : "A decorative copy, bound the week it was most thumbed" + (topic ? " \u2014 consulted on the matter of " + topic : "") + ". Flavor only; it does nothing.",
          topic: topic || null, wikiUrl: paragraph ? null : (action.wiki || null), paragraph: paragraph || null });
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED",
        date: todayLocal(), dtSpent: 0, gpSpent: 0,
        spentOn: "copied from the Archive: \u00ab" + title + "\u00bb",
        flavor: "Because the goat thought the book was cool, which is reason enough." });
      return s;
    }
    case "OFFER_CHARM_GIFT": {
      const it: any = s.items[action.itemId];
      if (!it || !it.charmItem || it.charmState !== "LIVE" || it.escrow) return s;
      if (!it.holder || it.holder.type !== "CHARACTER") return s;
      const from = s.characters[it.holder.id];
      if (!from || !mayActOnChar(s, from.id, action.by)) return s;
      const to = s.characters[action.toCharId];
      if (!to || to.id === from.id || to.status === "dead" || to.retired) return s;
      it.escrow = true;
      it.pendingGift = { toCharId: to.id, fromCharId: from.id, at: Date.now() };
      it.history.push({ at: Date.now(), what: "offered as a gift", from: from.name, to: to.name });
      s.notices.push({ id: "n" + s.nextId++, type: "charmgift", ctx: "player", accountId: to.ownerId,
        from: from.name, item: it.charmName, char: to.name, itemId: it.id });
      return s;
    }
    case "ACCEPT_CHARM_GIFT": {
      const it: any = s.items[action.itemId];
      if (!it || !it.charmItem || !it.escrow || !it.pendingGift) return s;
      const to = s.characters[it.pendingGift.toCharId];
      if (!to || !mayActOnChar(s, to.id, action.by)) return s;
      const dupe = Object.values(s.items).find((x: any) => x !== it && x.charmItem && x.charmState === "LIVE"
        && x.charmName === it.charmName && x.holder && x.holder.type === "CHARACTER" && x.holder.id === to.id);
      if (dupe) {
        // DMG, on the Charm itself: can't gain it again while you still have it. The gift STAYS in
        // escrow — frozen, unclaimed, waiting for the first one to be spent or to fade.
        s.notices.push({ id: "n" + s.nextId++, type: "charmdupe", ctx: "player", accountId: to.ownerId,
          item: it.charmName, char: to.name });
        return s;
      }
      // SR-13: the cap gates the only VOLUNTARY door. At the ceiling, the gift waits in escrow —
      // frozen, addressed, claimable the moment a slot opens (a charm spent, faded, or unchecked).
      const capTier = to.tier || tierFromLevel(to.level);
      const capLimit = giftLimit(capTier, "charm");
      const capTaken = carriedCount(to, "charm") + liveCharmItemsHeld(s, to.id);
      if (capTaken >= capLimit) {
        s.notices.push({ id: "n" + s.nextId++, type: "charmcap", ctx: "player", accountId: to.ownerId,
          item: it.charmName, char: to.name, limit: capLimit, tier: capTier });
        return s;
      }
      const giver = s.characters[it.pendingGift.fromCharId];
      it.holder = { type: "CHARACTER", id: to.id };
      it.escrow = false;
      it.charmArmedAt = Date.now();                                   // the clock starts NOW — this is why you accept just before the table
      it.history.push({ at: Date.now(), what: "gift accepted", by: to.name });
      delete it.pendingGift;
      dropNotice((n) => n.type === "charmgift" && n.itemId === it.id);
      if (giver) s.notices.push({ id: "n" + s.nextId++, type: "charmgiftok", ctx: "player", accountId: giver.ownerId,
        item: it.charmName, char: to.name });
      s.logEntries.push({ id: "log" + s.nextId++, charId: to.id, entryType: "EXPENDITURE", status: "APPROVED",
        date: todayLocal(), dtSpent: 0, gpSpent: 0,
        spentOn: it.charmName + " \u2014 received as a gift" + (giver ? " from " + giver.name : ""),
        flavor: "Gift-only, by ruling. Its week runs on YOUR clock now \u2014 the next Bastion turn you resolve or the next session you complete, whichever comes first." });
      return s;
    }
    case "DECLINE_CHARM_GIFT": {
      const it: any = s.items[action.itemId];
      if (!it || !it.charmItem || !it.escrow || !it.pendingGift) return s;
      const to = s.characters[it.pendingGift.toCharId];
      const from = s.characters[it.pendingGift.fromCharId];
      const mayTo = to && mayActOnChar(s, to.id, action.by);
      const mayFrom = from && mayActOnChar(s, from.id, action.by);   // the giver can pull an offer back through the same door
      if (!mayTo && !mayFrom) return s;
      it.escrow = false;
      it.history.push({ at: Date.now(), what: mayTo ? "gift declined" : "offer withdrawn", by: mayTo ? (to && to.name) : (from && from.name) });
      delete it.pendingGift;
      dropNotice((n) => n.type === "charmgift" && n.itemId === it.id);
      const other = mayTo ? (from && from.ownerId) : (to && to.ownerId);
      if (other) s.notices.push({ id: "n" + s.nextId++, type: "charmgiftno", ctx: "player", accountId: other,
        item: it.charmName, char: mayTo ? (to && to.name) : (from && from.name) });
      return s;
    }
    case "SET_CHARM_DESC": {
      // Frank's design: the player may write the charm's look in their own words — including on
      // an expired keepsake, which is exactly the kind of thing one inscribes. Overwrites the
      // rolled appearance; flavor only, never rules text.
      const it: any = s.items[action.itemId];
      if (!it || !it.charmItem) return s;
      if (!it.holder || it.holder.type !== "CHARACTER" || !mayActOnChar(s, it.holder.id, action.by)) return s;
      const txt = String(action.desc || "").trim().slice(0, 240);
      if (!txt) return s;
      it.charmDesc = txt;
      it.history.push({ at: Date.now(), what: "description inscribed", by: action.by });
      return s;
    }
    case "REMOVE_GIFT": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !Array.isArray(ch.gifts)) return s;
      ch.gifts = ch.gifts.filter((g) => g.id !== action.giftId);
      return s;
    }
    case "TOGGLE_GIFT_CARRIED": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by || !Array.isArray(ch.gifts)) return s;
      const g = ch.gifts.find((x) => x.id === action.giftId);
      if (!g) return s;
      if (!g.carried) {   // turning ON — enforce the ALPG tier cap; over-limit gifts stay in inventory
        const taken = carriedCount(ch, g.kind) + (g.kind === "charm" ? liveCharmItemsHeld(s, ch.id) : 0);   // SR-13: live charm items hold their slots
        if (taken >= giftLimit(ch.tier || tierFromLevel(ch.level), g.kind)) return s;
      }
      g.carried = !g.carried;
      return s;
    }
    case "CHECKOUT_MARKET": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by) return s;
      const lines = action.lines || [];
      let totalDt = 0, totalGp = 0;
      lines.forEach((l) => { const m = MARKET_BY_ID[l.id]; if (!m) return; const q = l.qty || 1; totalDt += (m.dt || 0) * q; totalGp += (m.gp || 0) * q; });
      if (totalDt > (ch.dt || 0) || totalGp > (ch.gp || 0)) return s;   // all-or-nothing: can't overspend either track
      ch.dt = (ch.dt || 0) - totalDt;
      ch.gp = (ch.gp || 0) - totalGp;
      const date = todayLocal();
      let leveled = false;
      lines.forEach((l) => {
        const m = MARKET_BY_ID[l.id]; if (!m) return;
        const q = l.qty || 1;
        for (let i = 0; i < q; i++) {
          const spentOn = (l.note && l.note.trim()) || (ch.name + " — " + m.name);
          s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED", date, dtSpent: m.dt || 0, gpSpent: m.gp || 0, spentOn });
          if (m.output === "level") { ch.level = (ch.level || 1) + 1; ch.tier = tierFromLevel(ch.level); normalizeCarriedGifts(s, ch); leveled = true; }   // keep tier in sync with level; re-check gift carries
          if (m.output === "item" && m.mint) {
            const iid = "it" + s.nextId++;
            const prov = verified(m.cat === "crafting" ? "CRAFTED" : "PURCHASED", ch.name);
            s.items[iid] = mkItem(iid, m.mint, itemClassOf(m.mint, m.mintClass), ch.campaign, prov, { type: "CHARACTER", id: ch.id });
          }
        }
      });
      if (leveled) s.notices.push({ id: "n" + s.nextId++, type: "levelup", ctx: "player", accountId: ch.ownerId, char: ch.name, level: ch.level });
      return s;
    }
    // --- SCROLLS ---------------------------------------------------------------------------------
    // Two doors to a scroll, both mint the SAME item shape (points at scroll_L{level}, carries its
    // own { spellId, spellName }); they differ only in gate, cost, provenance and tradeability.
    //
    //   SCRIBE_SCROLL  the workbench. The goat makes their own with a toolkit in their pack.
    //                  Gated on: carries Calligrapher's Supplies AND the spell is on their class
    //                  list. Costs SCROLL_COST gp + days. CRAFTED, UNTRADEABLE.
    //   BUY_SCROLL     the merchant. Any spell at the level — you're buying, not scribing. No class
    //                  gate, no toolkit. Costs SCROLL_COST gp (no days). PURCHASED, MAGIC_ITEM.
    //
    // The item is minted ONCE PAID FOR — gp/dt debited all-or-nothing first, then the scroll exists.
    case "SCRIBE_SCROLL": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by) return s;                       // owner only
      const sp = SPELLS[action.spellId];
      if (!sp) return s;                                                    // real spell only
      // gate 1: the character must carry Calligrapher's Supplies (the scroll tool)
      const hasTool = carriedCraftTools(s, ch.id).some((tid) => toolSpecials(tid).includes("scroll"));
      if (!hasTool) return s;
      // gate 2: ALPG — the spell must be on the character's class list
      if (!(sp.classes || []).includes(ch.cls)) return s;
      const cost = SCROLL_COST[sp.level]; if (!cost) return s;
      if ((cost.gp || 0) > (ch.gp || 0) || (cost.days || 0) > (ch.dt || 0)) return s;   // pay first
      ch.gp = (ch.gp || 0) - cost.gp; ch.dt -= cost.days;
      const date = todayLocal();
      const catId = "scroll_L" + sp.level;
      const iid = "it" + s.nextId++;
      s.items[iid] = mkItem(iid, catId, itemClassOf(catId, "UNTRADEABLE"), ch.campaign,
        verified("CRAFTED", ch.name), { type: "CHARACTER", id: ch.id },
        { spellId: sp.id, spellName: sp.name });                           // <- the instance identity
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED",
        date, dtSpent: cost.days, gpSpent: cost.gp, spentOn: ch.name + " scribed a Spell Scroll (" + sp.name + ")" });
      return s;
    }
    case "BUY_SCROLL": {
      const ch = s.characters[action.charId];
      if (!ch || ch.ownerId !== action.by) return s;
      const sp = SPELLS[action.spellId];
      if (!sp) return s;
      const cost = SCROLL_COST[sp.level]; if (!cost) return s;
      if ((cost.gp || 0) > (ch.gp || 0)) return s;                          // gp only — no scribing days
      ch.gp = (ch.gp || 0) - cost.gp;
      const date = todayLocal();
      const catId = "scroll_L" + sp.level;
      const iid = "it" + s.nextId++;
      s.items[iid] = mkItem(iid, catId, itemClassOf(catId, "MAGIC_ITEM"), ch.campaign,
        verified("PURCHASED", ch.name), { type: "CHARACTER", id: ch.id },
        { spellId: sp.id, spellName: sp.name });
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED",
        date, dtSpent: 0, gpSpent: cost.gp, spentOn: ch.name + " bought a Spell Scroll (" + sp.name + ")" });
      return s;
    }
    // ---- PLAYER-ENTERED ITEM SLOTS -------------------------------------------------
    // A roll yields a SLOT (rarity + table), never a named item: I ship no
    // item text it doesn't hold a licence for. The player reads the item out of the book
    // THEY own and types it in. It lands UNVERIFIED and untradeable, and every DM at the
    // player's store is asked to confirm it against the book before it becomes real.
    case "ROLL_ITEM_SLOT": {
      const ch = s.characters[action.charId];
      if (!ch || !mayActOnChar(s, action.charId, action.by)) return s;
      if (!s.itemSlots) s.itemSlots = {};
      const sid = "slot" + s.nextId++;
      s.itemSlots[sid] = { id: sid, charId: ch.id, ownerId: ch.ownerId, table: action.table,
        rarity: action.rarity, status: "UNFILLED", rolledAt: action.date || "", entered: null, itemId: null,
        // what the roll OWES the player - the verifying DM checks the entry against this
        cat: action.cat || "", sub: action.sub || "", label: action.label || "", roll: action.roll || null };
      return s;
    }
    case "SUBMIT_SLOT_ITEM": {
      const slot = s.itemSlots && s.itemSlots[action.slotId];
      if (!slot || slot.status !== "UNFILLED") return s;
      const ch = s.characters[slot.charId];
      if (!ch || !mayActOnChar(s, slot.charId, action.by)) return s;
      const nm = (action.name || "").trim();
      if (!nm) return s;
      // The instance carries its own identity — there is no catalogue row to point at, which is
      // the whole point: the text stays in the player's book, not in this software.
      const iid = "it" + s.nextId++;
      s.items[iid] = mkItem(iid, null, "UNTRADEABLE", ch.campaign, unverified(),
        { type: "CHARACTER", id: ch.id },
        { name: nm, rarity: slot.rarity, playerEntered: true, slotId: slot.id,
          source: (action.source || "").trim(), page: (action.page || "").trim(),
          attunement: !!action.attunement, notes: (action.notes || "").trim() });
      slot.status = "SUBMITTED"; slot.itemId = iid;
      slot.entered = { name: nm, source: (action.source || "").trim(), page: (action.page || "").trim() };
      const lid = "log" + s.nextId++;
      s.logEntries.push({ id: lid, charId: ch.id, entryType: "SLOTCLAIM", status: "SUBMITTED",
        itemId: iid, slotId: slot.id, date: action.date || "",
        spentOn: nm + " (" + slot.rarity + " " + slot.table + ")",
        flavor: (slot.via === "craft"
          ? "Commissioned at " + (slot.facName || "the bastion") + " \u2014 crafted by " + (slot.maker || "the household") + "; entered from " + (action.source || "the player's own book") + "."
          : "Rolled a " + slot.rarity + " " + slot.table + " slot; entered from " + (action.source || "the player's own book") + ".") });
      // notify every DM at this player's store
      const dms = verifyingDMs(s, ch.ownerId);
      dms.forEach((dm) => s.notices.push({ id: "n" + s.nextId++, type: "slotclaim", ctx: "dm", accountId: dm,
        ref: lid, slotId: slot.id, char: ch.name, item: nm, rarity: slot.rarity, table: slot.table,
        source: (action.source || ""), page: (action.page || "") }));
      if (!dms.length) s.notices.push({ id: "n" + s.nextId++, type: "slotnodm", ctx: "player",
        accountId: ch.ownerId, char: ch.name, item: nm });
      return s;
    }
    case "VERIFY_SLOT_ITEM": {
      const slot = s.itemSlots && s.itemSlots[action.slotId];
      if (!slot || slot.status !== "SUBMITTED") return s;
      // Frank's ruling, 27 Jul: "all items that were added by a player must be approved by a dm of
      // the same organization and store." A slot fill IS a player entry, so it belongs here.
      // verifyingDMs() already encodes exactly that pairing and was already enforced on the paper
      // and import paths — the slot path was the one that only ever checked the DM role, so any
      // DM in the system could approve any player's entry. Consistency, not a new rule.
      // DELIBERATELY NOT applied to VERIFY_DM_ITEM: that item is DM-authored, and its verifier is
      // the provisional DM's MENTOR, a different relationship the ruling does not speak to.
      if (!isDMRole(s, action.by)) return s;                       // only a DM may verify
      const it = s.items[slot.itemId]; if (!it) return s;
      const ch = s.characters[slot.charId];
      if (!ch || !verifyingDMs(s, ch.ownerId).includes(action.by)) return s;
      const who = (ACCOUNTS.find((a) => a.id === action.by) || {} as any).name || "a DM";
      it.provenance = slot.via === "craft"
        ? verified("CRAFTED", slot.maker || who)                   // made at the keep; the DM checked it against the book
        : verified("PLAYER_ENTRY", who);                           // checked against the book
      slot.status = "VERIFIED"; slot.verifiedBy = action.by;
      const le = s.logEntries.find((l) => l.slotId === slot.id && l.entryType === "SLOTCLAIM");
      if (le) { le.status = "APPROVED"; le.dmId = action.by; }
      dropNotice((n) => n.type === "slotclaim" && n.slotId === slot.id);
      if (ch) s.notices.push({ id: "n" + s.nextId++, type: "slotverified", ctx: "player",
        accountId: ch.ownerId, char: ch.name, item: it.name, by: who });
      return s;
    }
    case "REJECT_SLOT_ITEM": {
      const slot = s.itemSlots && s.itemSlots[action.slotId];
      if (!slot || slot.status !== "SUBMITTED") return s;
      if (!isDMRole(s, action.by)) return s;
      const ch = s.characters[slot.charId];
      // Same pairing as VERIFY_SLOT_ITEM. Rejection is gated too: the power to send a player's
      // entry back is the same authority as approving it, and leaving it open would let any DM
      // in the system bounce a claim they have no standing over.
      if (!ch || !verifyingDMs(s, ch.ownerId).includes(action.by)) return s;
      const who = (ACCOUNTS.find((a) => a.id === action.by) || {} as any).name || "a DM";
      const nm = slot.entered ? slot.entered.name : "the item";
      if (slot.itemId) delete s.items[slot.itemId];                // it never entered play
      slot.status = "UNFILLED"; slot.itemId = null; slot.entered = null;   // the slot stays; try again
      const le = s.logEntries.find((l) => l.slotId === slot.id && l.entryType === "SLOTCLAIM");
      if (le) { le.status = "REJECTED"; le.dmId = action.by; le.dmNote = action.reason || ""; }
      dropNotice((n) => n.type === "slotclaim" && n.slotId === slot.id);
      if (ch) s.notices.push({ id: "n" + s.nextId++, type: "slotrejected", ctx: "player",
        accountId: ch.ownerId, char: ch.name, item: nm, by: who, reason: action.reason || "" });
      return s;
    }
    // ---- DM-AUTHORED ADVENTURE ITEMS -----------------------------------------------
    // A DM writing an adventure-specific version of an item enters it here. A CERTIFIED DM
    // self-certifies (their word is the record, as with DM_REWARD). A PROVISIONAL DM does not:
    // their entry waits on THEIR MENTOR specifically, mirroring PROV_DM session logs.
    case "SUBMIT_DM_ITEM": {
      if (!isDMRole(s, action.by)) return s;
      const ch = s.characters[action.charId];
      if (!ch) return s;
      const nm = (action.name || "").trim();
      if (!nm) return s;
      const prov = provOf(s, action.by) === "provisional-dm";
      const mentorId = prov && s.mentors ? s.mentors[action.by] : null;
      const who = (ACCOUNTS.find((a) => a.id === action.by) || {} as any).name || "a DM";
      const iid = "it" + s.nextId++;
      s.items[iid] = mkItem(iid, null, "UNTRADEABLE", ch.campaign,
        prov ? unverified() : verified("DM_CREATED", who),
        { type: "CHARACTER", id: ch.id },
        { name: nm, rarity: (action.rarity || "").trim(), dmAuthored: true, authoredBy: action.by,
          adventure: (action.adventure || "").trim(), base: (action.base || "").trim(),
          notes: (action.notes || "").trim() });
      const lid = "log" + s.nextId++;
      s.logEntries.push({ id: lid, charId: ch.id, entryType: "DM_ITEM",
        status: prov ? "SUBMITTED" : "APPROVED", dmId: action.by, itemId: iid,
        mentorId: mentorId || null, date: action.date || "",
        spentOn: nm + (action.adventure ? " (" + action.adventure + ")" : ""),
        flavor: prov ? "Provisional DM entry - awaiting mentor review."
                     : "Adventure item authored and self-certified by " + who + "." });
      if (prov && mentorId) {
        s.notices.push({ id: "n" + s.nextId++, type: "dmitemreq", ctx: "dm", accountId: mentorId,
          ref: lid, itemId: iid, who, char: ch.name, item: nm,
          adventure: (action.adventure || ""), rarity: (action.rarity || "") });
      } else if (prov && !mentorId) {
        s.notices.push({ id: "n" + s.nextId++, type: "dmitemnomentor", ctx: "dm", accountId: action.by, item: nm });
      }
      return s;
    }
    case "VERIFY_DM_ITEM": {
      const le = s.logEntries.find((l) => l.id === action.logId && l.entryType === "DM_ITEM");
      if (!le || le.status !== "SUBMITTED") return s;
      if (!s.mentors || s.mentors[le.dmId] !== action.by) return s;   // THEIR mentor, nobody else
      const it = s.items[le.itemId]; if (!it) return s;
      const who = (ACCOUNTS.find((a) => a.id === action.by) || {} as any).name || "a mentor";
      it.provenance = verified("DM_CREATED", who);
      le.status = "APPROVED"; le.mentorId = action.by;
      dropNotice((n) => n.type === "dmitemreq" && n.ref === le.id);
      s.notices.push({ id: "n" + s.nextId++, type: "dmitemok", ctx: "dm", accountId: le.dmId,
        item: it.name, by: who });
      return s;
    }
    case "REJECT_DM_ITEM": {
      const le = s.logEntries.find((l) => l.id === action.logId && l.entryType === "DM_ITEM");
      if (!le || le.status !== "SUBMITTED") return s;
      if (!s.mentors || s.mentors[le.dmId] !== action.by) return s;
      const it = s.items[le.itemId];
      const nm = it ? it.name : "the item";
      const who = (ACCOUNTS.find((a) => a.id === action.by) || {} as any).name || "a mentor";
      if (le.itemId) delete s.items[le.itemId];        // it never entered play
      le.status = "REJECTED"; le.mentorId = action.by; le.dmNote = action.reason || "";
      dropNotice((n) => n.type === "dmitemreq" && n.ref === le.id);
      s.notices.push({ id: "n" + s.nextId++, type: "dmitemno", ctx: "dm", accountId: le.dmId,
        item: nm, by: who, reason: action.reason || "" });
      return s;
    }
    // ---- CHARACTER IMPORT: an item typed in from the player's own sheet ----------------
    // There is no items API to import from, so the player retypes their inventory. Everything
    // lands UNVERIFIED and a DM at their store checks it against the books. One notice per
    // character, not per item - importing a full inventory must not bury a DM in alerts.
    case "IMPORT_CHARACTER_ITEM": {
      const ch = s.characters[action.charId];
      if (!ch || !mayActOnChar(s, action.charId, action.by)) return s;
      const nm = (action.name || "").trim();
      if (!nm) return s;
      const str = (k) => (action[k] === undefined || action[k] === null) ? "" : String(action[k]).trim();
      const qty = Math.max(1, parseInt(action.quantity, 10) || 1);
      const iid = "it" + s.nextId++;
      s.items[iid] = mkItem(iid, null, "UNTRADEABLE", ch.campaign, unverified(),
        { type: "CHARACTER", id: ch.id },
        { name: nm, imported: true, quantity: qty,
          itemType: str("itemType"), category: str("category"), rarity: str("rarity"),
          weight: str("weight"), gp: str("gp"),
          damage: str("damage"), damageType: str("damageType"), range: str("range"), props: str("props"),
          attune: !!action.attune, req: str("req"), charges: str("charges"), consumable: !!action.consumable,
          desc: str("desc"), traits: str("traits"), notes: str("notes"),
          source: str("source"), page: str("page") });
      s.logEntries.push({ id: "log" + s.nextId++, charId: ch.id, entryType: "IMPORT_ITEM",
        status: "SUBMITTED", itemId: iid, date: action.date || "",
        spentOn: (qty > 1 ? qty + "x " : "") + nm,
        flavor: "Entered by hand during character import" + (str("source") ? " from " + str("source") : "") + "." });
      // one standing notice per character - the DM's queue shows every pending item
      const already = s.notices.some((n) => n.type === "importreq" && n.charId === ch.id);
      if (!already) verifyingDMs(s, ch.ownerId).forEach((dm) => s.notices.push({
        id: "n" + s.nextId++, type: "importreq", ctx: "dm", accountId: dm,
        charId: ch.id, char: ch.name, who: ch.ownerId }));
      return s;
    }
    case "VERIFY_IMPORT_ITEM": {
      const le = s.logEntries.find((l) => l.id === action.logId && l.entryType === "IMPORT_ITEM");
      if (!le || le.status !== "SUBMITTED") return s;
      const ch = s.characters[le.charId];
      if (!ch || !isDMRole(s, action.by)) return s;
      if (!verifyingDMs(s, ch.ownerId).includes(action.by)) return s;   // must be one of theirs
      const it = s.items[le.itemId]; if (!it) return s;
      const who = (ACCOUNTS.find((a) => a.id === action.by) || {} as any).name || "a DM";
      it.provenance = verified("IMPORTED", who);
      le.status = "APPROVED"; le.dmId = action.by;
      const stillPending = s.logEntries.some((l) => l.entryType === "IMPORT_ITEM" && l.charId === le.charId && l.status === "SUBMITTED");
      if (!stillPending) dropNotice((n) => n.type === "importreq" && n.charId === le.charId);
      return s;
    }
    case "REJECT_IMPORT_ITEM": {
      const le = s.logEntries.find((l) => l.id === action.logId && l.entryType === "IMPORT_ITEM");
      if (!le || le.status !== "SUBMITTED") return s;
      const ch = s.characters[le.charId];
      if (!ch || !isDMRole(s, action.by)) return s;
      if (!verifyingDMs(s, ch.ownerId).includes(action.by)) return s;
      const it = s.items[le.itemId];
      const nm = it ? it.name : "the item";
      const who = (ACCOUNTS.find((a) => a.id === action.by) || {} as any).name || "a DM";
      if (le.itemId) delete s.items[le.itemId];        // it never entered play
      le.status = "REJECTED"; le.dmId = action.by; le.dmNote = action.reason || "";
      const stillPending = s.logEntries.some((l) => l.entryType === "IMPORT_ITEM" && l.charId === le.charId && l.status === "SUBMITTED");
      if (!stillPending) dropNotice((n) => n.type === "importreq" && n.charId === le.charId);
      s.notices.push({ id: "n" + s.nextId++, type: "importrejected", ctx: "player",
        accountId: ch.ownerId, char: ch.name, item: nm, by: who, reason: action.reason || "" });
      return s;
    }
    // ---- ITEMS EARNED ON PAPER, ELSEWHERE ------------------------------------------
    // [ALPG-214] "Magic items are earned through play or certificate ... or traded." A player
    // who earned something at an AL-legal table this system doesn't cover, or holds an event
    // certificate, must be able to bring it in - otherwise the Exchange quietly loses rewards
    // they legitimately hold. The DM checks it against the evidence the log is meant to carry:
    // [ALPG-296] "adventures' titles or one-shot codes, session dates, DMs, levels, inventory
    // changes". Nothing about the item text ships with this software.
    case "CLAIM_PAPER_ITEM": {
      const ch = s.characters[action.charId];
      if (!ch || !mayActOnChar(s, action.charId, action.by)) return s;
      const nm = (action.name || "").trim();
      if (!nm) return s;
      const str = (k) => (action[k] === undefined || action[k] === null) ? "" : String(action[k]).trim();
      const isCert = action.kind === "certificate";
      const qty = Math.max(1, parseInt(action.quantity, 10) || 1);
      const iid = "it" + s.nextId++;
      // [ALPG-196] An event award "attaches to the player, not a character", so a certificate
      // goes to that player's SHELF as an EVENT_CERT with no campaign - the existing shelf
      // mechanics then apply unchanged: ASSIGN_CERT sends it to one of their characters, and
      // GIFT_CERT passes it to another player. Anything earned in play is held by the character.
      s.items[iid] = mkItem(iid, null,
        isCert ? "EVENT_CERT" : "UNTRADEABLE",
        isCert ? null : ch.campaign,
        unverified(),
        isCert ? { type: "PLAYER_SHELF", id: ch.ownerId } : { type: "CHARACTER", id: ch.id },
        { name: nm, quantity: qty, paperAward: true, awardKind: isCert ? "certificate" : "play",
          itemType: str("itemType"), category: str("category"), rarity: str("rarity"),
          weight: str("weight"), gp: str("gp"), damage: str("damage"), damageType: str("damageType"),
          range: str("range"), props: str("props"), attune: !!action.attune, req: str("req"),
          charges: str("charges"), consumable: !!action.consumable, desc: str("desc"),
          traits: str("traits"), notes: str("notes"), source: str("source"), page: str("page"),
          // the evidence a DM checks, per [ALPG-296]
          adventure: str("adventure"), playedOn: str("playedOn"), dmName: str("dmName"),
          dmNumber: str("dmNumber"), venue: str("venue"), event: str("event"),
          certSerial: str("certSerial"),
          claimedVia: ch.id });   // which character's screen the claim was made from
      const lid = "log" + s.nextId++;
      s.logEntries.push({ id: lid, charId: ch.id, entryType: "PAPER_ITEM", status: "SUBMITTED",
        itemId: iid, date: str("playedOn") || action.date || "",
        spentOn: (qty > 1 ? qty + "x " : "") + nm,
        flavor: isCert ? "Event certificate brought in by hand." + (str("event") ? " " + str("event") : "")
                       : "Earned at an outside table" + (str("adventure") ? " - " + str("adventure") : "") + "." });
      verifyingDMs(s, ch.ownerId).forEach((dm) => s.notices.push({
        id: "n" + s.nextId++, type: "paperreq", ctx: "dm", accountId: dm, ref: lid,
        char: ch.name, item: nm, kind: isCert ? "certificate" : "outside table",
        adventure: str("adventure") || str("event") }));
      return s;
    }
    case "VERIFY_PAPER_ITEM": {
      const le = s.logEntries.find((l) => l.id === action.logId && l.entryType === "PAPER_ITEM");
      if (!le || le.status !== "SUBMITTED") return s;
      const ch = s.characters[le.charId];
      if (!ch || !isDMRole(s, action.by) || !verifyingDMs(s, ch.ownerId).includes(action.by)) return s;
      const it = s.items[le.itemId]; if (!it) return s;
      const who = (ACCOUNTS.find((a) => a.id === action.by) || {} as any).name || "a DM";
      it.provenance = verified(it.awardKind === "certificate" ? "CERTIFICATE" : "OUTSIDE_TABLE", who);
      le.status = "APPROVED"; le.dmId = action.by;
      dropNotice((n) => n.type === "paperreq" && n.ref === le.id);
      s.notices.push({ id: "n" + s.nextId++, type: "paperok", ctx: "player",
        accountId: ch.ownerId, char: ch.name, item: it.name, by: who });
      return s;
    }
    case "REJECT_PAPER_ITEM": {
      const le = s.logEntries.find((l) => l.id === action.logId && l.entryType === "PAPER_ITEM");
      if (!le || le.status !== "SUBMITTED") return s;
      const ch = s.characters[le.charId];
      if (!ch || !isDMRole(s, action.by) || !verifyingDMs(s, ch.ownerId).includes(action.by)) return s;
      const it = s.items[le.itemId];
      const nm = it ? it.name : "the item";
      const who = (ACCOUNTS.find((a) => a.id === action.by) || {} as any).name || "a DM";
      if (le.itemId) delete s.items[le.itemId];
      le.status = "REJECTED"; le.dmId = action.by; le.dmNote = action.reason || "";
      dropNotice((n) => n.type === "paperreq" && n.ref === le.id);
      s.notices.push({ id: "n" + s.nextId++, type: "paperno", ctx: "player",
        accountId: ch.ownerId, char: ch.name, item: nm, by: who, reason: action.reason || "" });
      return s;
    }
    case "SUBMIT_DISPOSAL": {
      const it = s.items[action.itemId];
      if (!it || it.holder.type !== "CHARACTER") return s;
      const ch = s.characters[it.holder.id];
      if (!ch || ch.ownerId !== action.by) return s;
      const cat = itemCat(it);
      if (it.escrow || it.pendingDisposal) return s;   // can't dispose mid-trade or twice; anything else can leave play (destroyed/lost/given)
      it.pendingDisposal = true;                        // lock it while the DM reviews
      const dlogId = "log" + s.nextId++;
      s.logEntries.push({ id: dlogId, charId: ch.id, dmId: action.dmId, entryType: "DISPOSAL", status: "SUBMITTED", itemId: it.id, itemName: cat ? cat.name : it.catalogId, explanation: action.explanation || "", date: todayLocal() });
      if (action.dmId) s.notices.push({ id: "n" + s.nextId++, type: "disposalreq", ctx: "dm", accountId: action.dmId, char: ch.name, item: cat ? cat.name : it.catalogId, ref: dlogId });
      return s;
    }
    case "ASSIGN_CERT": {
      if (!mayActOnItem(s, action.itemId, action.by)) return s;   // only the holder (or an admin) may assign a certificate
      const it = s.items[action.itemId];
      const ch = s.characters[action.charId];
      if (!it || !ch || (ch.status && ch.status !== "active")) return s;   // certs go only to an active character
      it.holder = { type: "CHARACTER", id: action.charId };
      it.campaign = s.characters[action.charId].campaign; // inherit campaign so it can be traded/matched
      it.lineage.push({ holder: s.characters[action.charId].name, note: "Assigned to character" });
      // satisfy any matching wishlist entry
      satisfyWishlist(s, action.charId, it);
      return s;
    }
    case "GIFT_CERT": {
      if (!mayActOnItem(s, action.itemId, action.by)) return s;   // you can only gift what is yours
      const it = s.items[action.itemId];
      if (!it) return s;
      const fromName = it.holder.type === "PLAYER_SHELF" ? accName(it.holder.id) : "—";
      it.holder = { type: "PLAYER_SHELF", id: action.toAccountId };
      it.lineage.push({ holder: accName(action.toAccountId), note: "Gifted from " + fromName });
      s.notices.push({ id: "n" + s.nextId++, type: "gift", ctx: "player", accountId: action.toAccountId, from: fromName, item: catName(it.catalogId) });
      return s;
    }
    case "ADD_WISH": {
      if (!mayActOnChar(s, action.charId, action.by)) return s;   // only the owner (or an admin) may touch a character
      const ch = s.characters[action.charId];
      if (!ch) return s;
      if (!Array.isArray(ch.wishlist)) ch.wishlist = [];
      const w = action.mode === "SPECIFIC"
        ? { id: "w" + s.nextId++, mode: "SPECIFIC", catalogId: action.catalogId, acceptVariants: !!action.acceptVariants, status: "OPEN" }
        : { id: "w" + s.nextId++, mode: "PROPERTY", desired: action.desired || {}, status: "OPEN" };
      // a PROPERTY wish with nothing desired matches everything and means nothing - refuse it
      if (w.mode === "PROPERTY" && !Object.keys(w.desired).length) return s;
      ch.wishlist.push(w);
      return s;
    }
    case "REMOVE_WISH": {
      if (!mayActOnChar(s, action.charId, action.by)) return s;   // only the owner (or an admin) may touch a character
      const ch = s.characters[action.charId];
      if (!ch || !Array.isArray(ch.wishlist)) return s;
      ch.wishlist = ch.wishlist.filter((w) => w.id !== action.wishId);
      return s;
    }
    case "TOGGLE_EQUIPPED": {
      if (!mayActOnItem(s, action.itemId, action.by)) return s;   // only the holder (or an admin) may touch an item
      const it = s.items[action.itemId];
      if (!it) return s;
      const catE = itemCat(it);
      if (catE && catE.consumable) { it.equipped = !it.equipped; if (it.equipped) it.available = false; return s; }   // consumables: pack/unpack freely — no slot/attune/tier limits
      if (!it.equipped) {
        if (it.holder.type === "CHARACTER" && !meetsReq(itemCat(it), s.characters[it.holder.id])) return s; // character doesn't meet the item's requirement
        if (it.holder.type === "CHARACTER" && legendaryTierBlocked(it.catalogId, s.characters[it.holder.id].tier)) return s;
        const { slot, max } = equipSlot(itemCat(it));
        const count = Object.values(s.items).filter((x: any) => x.holder.type === "CHARACTER" && x.holder.id === it.holder.id && x.equipped && equipSlot(itemCat(x)).slot === slot).length;
        if (count >= max) return s; // that slot is full — can't wear a duplicate of this type
        if (itemCat(it).attune && !it.attuned && attunedCount(s, it.holder.id) >= ATTUNE_SLOTS) return s; // equipping auto-attunes — respect the 3-slot cap
      }
      it.equipped = !it.equipped;
      if (it.equipped) {
        it.available = false;
        if (itemCat(it).attune) it.attuned = true; // an equipped attunement item is assumed attuned
      }
      return s;
    }
    case "TOGGLE_CARRIED": {
      if (!mayActOnItem(s, action.itemId, action.by)) return s;   // only the holder (or an admin) may touch an item
      const it = s.items[action.itemId];
      if (!it) return s;
      const brought = it.equipped || it.inPack !== false;
      if (brought) { it.inPack = false; it.equipped = false; it.attuned = false; }   // leave it at the bastion → not worn, not attuned, doesn't count
      else { it.inPack = true; }                                                      // bring it back into the pack
      return s;
    }
    case "TOGGLE_ATTUNED": {
      if (!mayActOnItem(s, action.itemId, action.by)) return s;   // only the holder (or an admin) may touch an item
      const it = s.items[action.itemId];
      if (!it || it.equipped) return s; // equipped implies attuned — can't clear while equipped
      if (!it.attuned && it.holder.type === "CHARACTER" && !meetsReq(itemCat(it), s.characters[it.holder.id])) return s; // requirement not met
      if (!it.attuned && attunedCount(s, it.holder.id) >= ATTUNE_SLOTS) return s; // only 3 attunement slots
      it.attuned = !it.attuned;
      return s;
    }
    case "UNASSIGN_CERT": {
      if (!mayActOnItem(s, action.itemId, action.by)) return s;
      const it = s.items[action.itemId];
      if (!it || it.equipped || it.attuned) return s;                 // once committed to the character, it stays
      const ownerId = it.holder.type === "CHARACTER" ? s.characters[it.holder.id].ownerId : it.holder.id;
      it.holder = { type: "PLAYER_SHELF", id: ownerId };
      it.equipped = false; it.attuned = false; it.available = false;
      it.lineage.push({ holder: accName(ownerId), note: "Returned to shelf" });
      return s;
    }
    case "CLAIM_CERT": {
      if (!mayActOnChar(s, action.charId, action.by)) return s;   // you may only claim a certificate to your own character
      const it = s.items[action.itemId];
      const ch = s.characters[action.charId];
      if (!it || !ch || (ch.status && ch.status !== "active")) return s;   // certs go only to an active character
      it.holder = { type: "CHARACTER", id: action.charId };
      it.itemClass = "MAGIC_ITEM";        // a claimed certificate becomes that character's item
      it.campaign = ch.campaign;
      it.lineage.push({ holder: ch.name, note: "Claimed to character" });
      satisfyWishlist(s, action.charId, it);
      return s;
    }
    case "PROPOSE_TRADE": {
      if (!action.a || !action.b) return s;
      const pA = s.items[action.a.itemId], pB = s.items[action.b.itemId];
      if (!pA || !pB) return s;
      if (pA.escrow || pB.escrow) return s;   // an item can only be promised to one trade at a time
      if (!tradeLegal(pA, pB)) return s;       // ALPG trade legality: same campaign, equivalent rarity, tradeable class, not unique/firearm
      s.trades.push({
        id: "tr" + s.nextId++,
        a: action.a, b: action.b, status: "PROPOSED",
        snapshot: null,
      });
      pA.escrow = true;
      pB.escrow = true;
      return s;
    }
    case "CONFIRM_TRADE": {
      const tr = s.trades.find((t) => t.id === action.id);
      if (!tr || tr.status !== "PROPOSED") return s;      // already settled/cancelled — ignore
      const A = s.characters[tr.a.charId], B = s.characters[tr.b.charId];
      const itA = s.items[tr.a.itemId], itB = s.items[tr.b.itemId];

      // An item may have moved since this was proposed. Unwind and tell both sides.
      if (!A || !B || tradeSideStale(itA, tr.a.charId) || tradeSideStale(itB, tr.b.charId)) {
        cancelTradeItems(tr, itA, itB);
        [tr.a.charId, tr.b.charId].forEach((cid) => {
          const c = s.characters[cid];
          if (c) s.notices.push({ id: "n" + s.nextId++, ctx: "player", type: "tradestale", accountId: c.ownerId });
        });
        return s;
      }
      if (!canTradeAcct(s, A.ownerId) || !canTradeAcct(s, B.ownerId)) return s;
      if (!tradeLegal(itA, itB)) { cancelTradeItems(tr, itA, itB); return s; }   // legality may have shifted since the proposal

      tr.status = "SETTLED";
      tr.snapshot = { aChar: tr.a.charId, aItem: tr.a.itemId, bChar: tr.b.charId, bItem: tr.b.itemId };   // for reversal
      A.dt -= TRADE_DT; B.dt -= TRADE_DT;
      handOverItem(itA, A, B, tr.id);
      handOverItem(itB, B, A, tr.id);
      satisfyWishlist(s, A.id, itB);
      satisfyWishlist(s, B.id, itA);
      const td = todayLocal();
      logTradeCost(s, A, itA, itB, td);
      logTradeCost(s, B, itB, itA, td);
      return s;
    }
    case "CANCEL_TRADE": {
      const tr = s.trades.find((t) => t.id === action.id);
      if (tr && tr.status === "PROPOSED") {
        tr.status = "CANCELLED";
        s.items[tr.a.itemId].escrow = false;
        s.items[tr.b.itemId].escrow = false;
      }
      return s;
    }
    case "AUTHENTICATE_CERT": {
      if (!isAdmin(s, action.by)) return s;   // moderation is admin-only
      const it = s.items[action.itemId];
      if (!it) return s;
      it.provenance = verified("ADMIN_AUTHENTICATED", "Guildmaster");
      return s;
    }
    case "MARK_LOST": {
      if (!mayActOnItem(s, action.itemId, action.by)) return s;   // only the holder (or an admin) may touch an item
      const it = s.items[action.itemId];
      if (!it) return s;
      it._lost = true;
      return s;
    }
    case "SEND_TRADE_PROPOSAL": {
      if (action.from === action.to) return s;
      if (!canTradeAcct(s, action.from) || !canTradeAcct(s, action.to)) {
        const reason = !canTradeAcct(s, action.from) ? "Your account is suspended, so you can't propose trades right now." : accName(action.to) + " isn't able to trade right now.";
        const thb = findOrCreateThread(s, action.from, action.to, "player", "player");
        thb.messages.push({ from: "__system__", bounce: true, forAcct: action.from, text: action.text || "", reason });
        thb.lastRead[action.from] = thb.messages.length;
        return s;
      }
      const trId = "tr" + s.nextId++;
      s.trades.push({ id: trId, a: { charId: action.fromCharId, itemId: action.fromItemId }, b: { charId: action.toCharId, itemId: action.toItemId }, status: "PROPOSED", snapshot: null });
      s.items[action.fromItemId].escrow = true;
      s.items[action.toItemId].escrow = true;
      const th = findOrCreateThread(s, action.from, action.to, "player", "player");
      th.messages.push({ from: action.from, text: action.text || "", proposal: { tradeId: trId } });
      th.lastRead[action.from] = th.messages.length;
      return s;
    }
    case "REQUEST_AUTH": {
      if (!mayActOnItem(s, action.itemId, action.by)) return s;   // only the holder (or an admin) may touch an item
      const it = s.items[action.itemId];
      if (!it) return s;
      const isEvent = it.itemClass === "EVENT_CERT";
      // Regular items go to the DM named in the log entry; if that DM has no profile, fall back to admin. Event items go to admin first.
      const logDm = it.origin && it.origin.dmId;
      const dmHasProfile = logDm && (s.roles[logDm] || []).includes("dm");
      const reviewer = isEvent ? "acc_admin" : (dmHasProfile ? logDm : "acc_admin");
      const player = inputterOf(s, it) || action.requester;      // the person who can speak to the item's origin
      const revCtx = reviewer === "acc_admin" ? "admin" : "dm";
      // the ticket lives as a message thread; the item only keeps a pointer + its unverified flag
      const th = findOrCreateThread(s, reviewer, player, revCtx, "player");
      th.ticket = { itemId: action.itemId, status: "PENDING", reviewer, player, requester: action.requester, isEvent, turn: "reviewer" };
      th.messages.push({ from: player, text: "Requesting authentication of " + catName(it.catalogId) + "." + (action.note ? " " + action.note : ""), photo: putBlob(action.photo), ticketEvent: "opened" });
      th.lastRead[player] = th.messages.length;
      it.reviewThreadId = th.id;
      s.notices.push({ id: "n" + s.nextId++, type: "authreq", ctx: revCtx, accountId: reviewer, item: catName(it.catalogId), who: accName(action.requester), threadId: th.id });
      return s;
    }
    case "AUTHENTICATE_TICKET": {
      const th = s.threads.find((t) => t.id === action.threadId);
      if (!th || !th.ticket || th.ticket.status === "AUTHENTICATED") return s;
      const it = s.items[th.ticket.itemId];
      if (it) { it.provenance = th.ticket.reviewer === "acc_admin" ? verified("ADMIN_AUTHENTICATED", "Guildmaster") : verified("DM_VOUCH", accName(th.ticket.reviewer)); delete it.reviewThreadId; }
      th.ticket.status = "AUTHENTICATED";
      th.messages.push({ from: "__system__", ticketEvent: "authenticated", text: catName(it ? it.catalogId : "") + " authenticated by " + accName(th.ticket.reviewer) + "." });
      dropNotice((n) => n.threadId === th.id);
      const targets = [...new Set([th.ticket.player, th.ticket.requester])];
      targets.forEach((acc) => s.notices.push({ id: "n" + s.nextId++, type: "auth", ctx: "player", accountId: acc, item: it ? catName(it.catalogId) : "item", by: accName(th.ticket.reviewer) }));
      return s;
    }
    case "TOGGLE_WISHLIST": {
      if (!s.wishlists) s.wishlists = {};
      const w = s.wishlists[action.accountId] || [];
      s.wishlists[action.accountId] = w.includes(action.advId) ? w.filter((x) => x !== action.advId) : [...w, action.advId];
      return s;
    }
    case "DISMISS_SWAP": {
      s.mentorSwaps = (s.mentorSwaps || []).filter((w) => w.id !== action.id);
      return s;
    }
  }
  return undefined;   // not ours
}
