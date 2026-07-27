import { BASTION_FORMS, BASTION_REGIONS, REGION_TAGS } from "../data/bastion";
import { ADVENTURE_TAGS } from "../data/adventures";
import { orgRec } from "./core";

// Which notice types demand action (alerts) versus merely inform.
export // Notices whose underlying condition is cleared by the real corrective ACTION (via dropNotice),
// so "Go there" only routes and must NOT clear them. Everything else clears on "Go there".
// My two-class taxonomy — my single source of truth for notice behavior.
//  "alert": an unresolved condition that needs a specific action; cleared ONLY by that corrective
//           action (every alert MUST have a matching dropNotice, or it would get stuck — see p7 test).
//           Pinned to the top of the inbox and summarised in a top-of-screen banner.
//  "notification" (default): informational / routable; clears when you follow its "Go there" link.
const NOTICE_CLASS = {
  poll: "alert", mentortable: "alert", combinevote: "alert", sessioncomplete: "alert", dmflag: "alert",
  disposalreq: "alert", resubmit: "alert", provlog: "alert", observerlog: "alert",
  slotclaim: "alert", slotrejected: "alert", slotnodm: "alert",   // a rolled slot is waiting on someone
  dmitemreq: "alert", dmitemno: "alert", dmitemnomentor: "alert", importreq: "alert", importrejected: "alert", paperreq: "alert", paperno: "alert",
  provreq: "alert", certreq: "alert", storereq: "alert", storeflag: "alert",
  bastionwalkout: "alert", bastionruined: "alert", facilitydormant: "alert",   // your keep is emptying out — you need to see this
};

// Notice classification and org-id helpers, read by the shell and the social package.
export function isOrgId(id) { return typeof id === "string" && id.startsWith("org:"); }

export const isAlert = (type) => NOTICE_CLASS[type] === "alert";

export // Types that render as their own response-demanding card at the top of every view (polls, shadow-mentor
// offers). They stay as banners and are NOT duplicated into the Notifications inbox.
const CARD_NOTICES = new Set(["poll", "mentoroffer"]);

export function unreadFor(th, acc) { return th.messages.slice(th.lastRead[acc] || 0).filter((m) => m.from !== acc).length; }

// Market categories and the treasure allowance - read by more than one section.
export const MARKET_CATS = [["services", "Spellcasting services"], ["consumables", "Potions & scrolls"], ["mundane", "Mundane goods"], ["crafting", "Crafting"], ["advancement", "Advancement & study"]];

export // ALDMG p.3: unspecified treasure allowance per session, by tier (min–max GP)
const TREASURE_ALLOWANCE = { 1: [100, 500], 2: [1000, 5000], 3: [10000, 50000], 4: [50000, 100000] };

// A bastion's form (keep, tower, manor...). Read by the roster card as well as the keep
// screens, so it sits in lib rather than inside the bastion package.
export const bForm = (b) => BASTION_FORMS.find((f) => f.id === (b && b.form)) || null;

export function orgsManagedBy(state: AppState, acc) { return Object.values(state.organizations || {}).filter((o) => o.leaderId === acc || (o.assistantIds || []).includes(acc)).map((o) => o.id); }

export function orgsScheduledBy(state: AppState, acc) { return Object.values(state.organizations || {}).filter((o) => (o.schedulerIds || []).includes(acc)).map((o) => o.id); }



export function orgTabsFor(state: AppState, acc) { return [...new Set([...orgsManagedBy(state, acc), ...orgsScheduledBy(state, acc)])]; }



// itemIds currently locked in a proposed (not-yet-settled) trade — authoritative, independent of the escrow flag
export function itemsInOpenTrades(state: AppState) {
  const s = new Set();
  (state.trades || []).forEach((t) => { if (t.status === "PROPOSED") { s.add(t.a.itemId); s.add(t.b.itemId); } });
  return s;
}



import { ACCOUNTS, catName, itemCat } from "../lib/core";
import type { AppState } from "../types";
import { CATALOG } from "../data/catalog";

// STALE COMMENT, caught in my voice pass: this used to describe an action set derived from
// reducerImpl.toString() at load. I killed that mechanism (the minifier lesson — see
// buildKnownActions in app.tsx) and it now sits nowhere near this function anyway. The
// permission helper below is what actually lives here.
export function isAdmin(state: AppState, acct) { return (state.roles[acct] || []).includes("admin"); }

// Living conditions — pure roleplay flavor. AL levies NO cost of living (verified: ALPG v2026.4 and ALDMG
// contain no lifestyle/upkeep rule, and lifestyle is not on AL's purchase whitelist), so this NEVER touches gold.
// Names/daily figures reference the SRD "Lifestyle Expenses" table (CC-BY-4.0) for flavor only — nothing is charged.
export const LIFESTYLES = [
  { id: "wretched",    name: "Wretched",    note: "Sleeping rough, in squalor and danger — whatever they earn, it isn't spent on comfort." },
  { id: "squalid",     name: "Squalid",     note: "A leaky room in a bad quarter, shared with rats and worse company." },
  { id: "poor",        name: "Poor",        note: "A hard bed, thin soup, and honest walls — few comforts, but a roof." },
  { id: "modest",      name: "Modest",      note: "A clean room in a decent quarter — the life of a working soldier or tradesman." },
  { id: "comfortable", name: "Comfortable", note: "A good inn or a small house, decent clothes, and no worry over the next meal." },
  { id: "wealthy",     name: "Wealthy",     note: "Fine lodgings and finer clothes — a hero who has plainly done well out of it." },
  { id: "aristocratic",name: "Aristocratic",note: "A life among nobles, with servants and silver — and the obligations that come with them." },
];

export function isOrgLeaderOf(state: AppState, acc, orgId) { const o = orgRec(state, orgId); return !!o && o.leaderId === acc; }

export function isOrgAssistantOf(state: AppState, acc, orgId) { const o = orgRec(state, orgId); return !!o && (o.assistantIds || []).includes(acc); }



export const LIFESTYLE_BY_ID: Record<string, any> = {}; LIFESTYLES.forEach((l) => { LIFESTYLE_BY_ID[l.id] = l; });

// A call with no kind is a summons — that's what my field meant before there were three of them,
// and my seed still writes one. Future me: read the kind THROUGH here, never off the raw field,
// or a call written before this existed silently renders as nothing at all.
export const callKind = (b) => (b && b.pendingCall && b.pendingCall.kind) || "summons";

export function isBlockedBy(state: AppState, target, sender) { return !!(state.blocks && state.blocks[target] && state.blocks[target].includes(sender)); }

export function canManageOrg(state: AppState, acc, orgId) { return isAdmin(state, acc) || isOrgLeaderOf(state, acc, orgId) || isOrgAssistantOf(state, acc, orgId); }

// ALPG p.1: creating a level-5 character grants 500 GP, 40 DT, and one of these starting magic items.
export const L5_STARTING_ITEMS = ["l5_alltool", "l5_amulet", "l5_grimoire", "bagholding", "l5_bloodwell", "l5_dragonbelt", "l5_moonsickle", "l5_drum", "l5_rodpact", "l5_shield1", "wandwarmage", "l5_weapon1", "l5_wraps"];


// ============================================================================
// MY RULES - the constraints that govern items, trade, and who may act.
// Carry and attunement limits, tier gates, trade legality and cost, gift limits,
// permission checks. My reducer AND my UI share these (a component needs the same
// answer the reducer will give), so they sit below both.
// ============================================================================

// SRD 5.2 Spell Scroll Costs (## Scribing Spell Scrolls). Level 0 = cantrip. gp is the scribing
// cost; days is inscription time (8 hrs/day). The scroll dropdown quotes SCROLL_COST[level].gp.

export const ATTUNE_SLOTS = 3;

// ALPG: "Legendary items may not be carried into a session for use until tier 4; lower rarity
// items may be carried into any tier."
//
// ONLY legendary is gated. Do NOT generalise this to RARITY[x].tier — that column serves the
// separate "Tier-Appropriate Rarities" table (awards / player choice / random rolls), not a
// usage gate. The two rules share numbers and mean different things; conflating them would
// invent a restriction the ALPG explicitly denies.

// ALPG v2026.4 "Carried Magic Items by Tier"
export const CARRIED_LIMITS = { 1: { unc: 1, com: 5, con: 5 }, 2: { unc: 3, com: 5, con: 10 }, 3: { unc: 6, com: 5, con: 10 }, 4: { unc: 10, com: 5, con: 15 } };

export const GIFT_KINDS = [{ id: "blessing", name: "Blessing", plural: "Blessings" }, { id: "boon", name: "Boon", plural: "Boons" }, { id: "charm", name: "Charm", plural: "Charms" }];

export const GIFT_LIMITS = { 1: { boon: 0, blessing: 1, charm: 2 }, 2: { boon: 0, blessing: 1, charm: 5 }, 3: { boon: 0, blessing: 1, charm: 5 }, 4: { boon: 1, blessing: 1, charm: 5 } };   // ALPG: carried-into-session caps by tier

// ALPG: "Legendary items may not be carried into a session for use until tier 4; lower rarity
// items may be carried into any tier."
//
// ONLY legendary is gated. Do NOT generalise this to RARITY[x].tier — that column serves the
// separate "Tier-Appropriate Rarities" table (awards / player choice / random rolls), not a
// usage gate. The two rules share numbers and mean different things; conflating them would
// invent a restriction the ALPG explicitly denies.
export const LEGENDARY_TIER = 4;

// ---- Downtime & gold "market" catalogue (services verbatim from ALDMG; item prices are sample placeholders) ----
export const MARKET: any[] = [
  { id: "svc_cure",         name: "Cure Wounds",         cat: "services", gp: 10,    output: "service" },
  { id: "svc_identify",     name: "Identify",            cat: "services", gp: 20,    output: "service" },
  { id: "svc_lesser_rest",  name: "Lesser Restoration",  cat: "services", gp: 40,    output: "service" },
  { id: "svc_prayer",       name: "Prayer of Healing",   cat: "services", gp: 40,    output: "service" },
  { id: "svc_dispel",       name: "Dispel Magic",        cat: "services", gp: 90,    output: "service" },
  { id: "svc_remove_curse", name: "Remove Curse",        cat: "services", gp: 90,    output: "service" },
  { id: "svc_speak_dead",   name: "Speak with Dead",     cat: "services", gp: 90,    output: "service" },
  { id: "svc_divination",   name: "Divination",          cat: "services", gp: 210,   output: "service" },
  { id: "svc_greater_rest", name: "Greater Restoration", cat: "services", gp: 450,   output: "service" },
  { id: "svc_raise_dead",   name: "Raise Dead",          cat: "services", gp: 1000,  output: "service" },
  { id: "svc_resurrection", name: "Resurrection",        cat: "services", gp: 3000,  output: "service" },
  { id: "svc_true_res",     name: "True Resurrection",   cat: "services", gp: 30000, output: "service" },
  { id: "adv_catchup",   name: "Catching Up (gain a level)", cat: "advancement", dt: 10, output: "level", note: "Bumps this character's level — update your D&D Beyond or paper sheet to match; a DM may spot-check at any time." },
  { id: "adv_copy_low",  name: "Copy a spell (levels 1–4)",  cat: "advancement", dt: 1,  output: "spend", prereq: "Spell found in an adventure, or copied from a character's book right after a shared session." },
  { id: "adv_copy_high", name: "Copy a spell (levels 5–9)",  cat: "advancement", dt: 2,  output: "spend", prereq: "Spell found in an adventure, or copied from a character's book right after a shared session." },
  { id: "craft_ammo",   name: "Craft ammunition (20 arrows)",       cat: "crafting", dt: 1, gp: 1,  output: "item", mint: "arrows20",      mintClass: "UNTRADEABLE", sample: true, note: "Character-created — not tradeable." },
  { id: "craft_scribe", name: "Scribe a scroll (Cure Wounds, 1st)", cat: "crafting", dt: 1, gp: 15, output: "item", mint: "scroll_cure1",   mintClass: "UNTRADEABLE", sample: true, note: "Lowest spell level only. Counts toward the carry limit. Character-created — not tradeable." },
  { id: "craft_brew",   name: "Brew a Potion of Healing",           cat: "crafting", dt: 1, gp: 25, output: "item", mint: "potion_healing", mintClass: "UNTRADEABLE", sample: true, prereq: "Requires a brewing unlock (e.g., an adventure ritual).", note: "May not be sold. Counts toward the carry limit." },
  { id: "buy_potion",  name: "Buy a Potion of Healing",               cat: "consumables", gp: 50,  output: "item", mint: "potion_healing",         mintClass: "MAGIC_ITEM", sample: true, note: "Sample price — verify vs DMG in production. Counts toward the carry limit." },
  { id: "buy_potion2", name: "Buy a Potion of Greater Healing",       cat: "consumables", gp: 150, output: "item", mint: "potion_greater_healing", mintClass: "MAGIC_ITEM", sample: true, note: "Sample price — verify vs DMG." },
  { id: "buy_scroll",  name: "Buy a Spell Scroll (Cure Wounds, 1st)", cat: "consumables", gp: 60,  output: "item", mint: "scroll_cure1",           mintClass: "MAGIC_ITEM", sample: true, note: "Sample price — scrolls are 2× the PH Spell Scroll cost + components." },
  { id: "buy_arrows",  name: "Buy Arrows (20)",                       cat: "mundane",     gp: 1,   output: "item", mint: "arrows20",              mintClass: "GEAR", note: "Mundane equipment." },
];

export const MARKET_BY_ID = Object.fromEntries(MARKET.map((m) => [m.id, m]));

// Carry-count contribution of n packed units of a consumable. ALPG: magic ammunition/smokepowder
// count as one per 5 shots (rounded up); potions/scrolls count one each.

// ---------------------------------------------------------------------------
// ITEM INDEX — "what does THIS character hold?"
//
// The item table is flat: items[] with a holder on each. So every question about one
// character ("what are they carrying?", "how many attuned?") scanned EVERY item in the
// world — O(items) per call, and the character sheet asks several times per render.
// Harmless at 60 items, wrong on its face at 4,000, and it's the kind of wrong that
// quietly becomes a bug the day someone's store gets busy.
//
// The index is memoised on STATE IDENTITY, which costs nothing to maintain. The reducer
// already guarantees exactly what a cache needs: a brand-new state object whenever anything
// changes, and the SAME object when nothing does. So `_itemIdxFor !== state` IS the
// invalidation signal — no dirty flags, no bookkeeping, no way to forget.
// Rebuild: one O(items) pass per state change. Lookups: O(1).
// ---------------------------------------------------------------------------
export const NO_ITEMS: any[] = [];              // shared empty result — never mutated
let _itemIdxFor: any = null;           // the state object this index was built from
let _itemIdx: any = null;              // charId -> item[]

// Which lanes are legal for this item (compliance by construction)

export const SCROLL_COST = {
  0: { gp: 15, days: 1 },
  1: { gp: 25, days: 1 },
  2: { gp: 100, days: 3 },
  3: { gp: 150, days: 5 },
  4: { gp: 1000, days: 10 },
  5: { gp: 1500, days: 25 },
  6: { gp: 10000, days: 40 },
  7: { gp: 12500, days: 50 },
  8: { gp: 15000, days: 60 },
  9: { gp: 50000, days: 120 },
};

// The specialized capabilities a tool opens (["scroll"], ["potion"], …) — the SRD Craft entries
// B-33 keeps out of the mundane list but that are real. The workbench turns these into frames.

export const TOOL_CRAFTS = {
  // ================================================================================================
  //  SRD 5.2 TOOL CRAFTS — GENERATED. Do not hand-edit; run `python3 harness/make_srd_tools.py`.
  //
  //  toolCatalogId -> what that artisan's tool can make. Three fields:
  //    items    concrete mundane catalogue ids this tool crafts (Smith -> chain, Carpenter -> barrel)
  //    rules    {category, except} the workbench evaluates against the catalogue at render time —
  //             Smith's 'Any Melee weapon except Club/Greatclub/Quarterstaff/Whip', etc. A rule, not
  //             a frozen list, so a new weapon row is craftable the day it lands.
  //    special  capabilities that mint through a SPECIALIZED frame, not the gear catalogue:
  //             'scroll' (Calligrapher -> SCROLL_CATALOG + spell picker, class-filtered) and
  //             'potion' (Herbalism, later). These are the SRD's own Craft entries that B-33 drops
  //             from `items` because a scroll/potion is not mundane gear — but the CAPABILITY is
  //             real, so it survives here. Poison is NOT a capability: under Q16 (Frank, 26 Jul)
  //             poisons are AWARD-ONLY — the craft door is shut, so the Poisoner's Kit stays in
  //             the table with an empty `items` list. It is a legal tool that makes nothing here.
  //
  //  This is the shared craft spine: the character workbench gates it on 'holds this toolkit', a
  //  bastion facility gates it on 'grants this tool'. Same table, two gates.
  // ================================================================================================
  g_disguisekit:     { items: ["g_costume"] },
  g_poisonerskit:    { items: [] },
  g_tool_alchemist:  { items: ["g_acid", "g_alchemistsfire", "g_componentpouch", "g_oil", "g_paper", "g_perfume"] },
  g_tool_brewer:     { items: ["g_antitoxin"] },
  g_tool_calligraph: { items: ["g_ink"], special: ["scroll"] },
  g_tool_carpenter:  { items: ["g_barrel", "g_chest", "g_club", "g_greatclub", "g_ladder", "g_pole", "g_quarterstaff", "g_ramportable", "g_torch"] },
  g_tool_cartograph: { items: ["g_map"] },
  g_tool_cobbler:    { items: ["g_climberskit"] },
  g_tool_cook:       { items: ["g_rations"] },
  g_tool_glassblow:  { items: ["g_bottleglass", "g_magnifyingglass", "g_spyglass", "g_vial"] },
  g_tool_herbalism:  { items: ["g_antitoxin", "g_candle", "g_healerkit"], special: ["potion"] },
  g_tool_jeweler:    { items: ["g_amuletwornorheld", "g_crystal", "g_emblemborneonfabricora", "g_orb", "g_reliquaryheld", "g_rod", "g_staffalsoaquarterstaff", "g_wand"] },
  g_tool_leather:    { items: ["g_backpack", "g_casecrossbowbolt", "g_casemaporscroll", "g_hidearmor", "g_leather", "g_parchment", "g_pouch", "g_quiver", "g_sling", "g_studded", "g_waterskin", "g_whip"] },
  g_tool_mason:      { items: ["g_blockandtackle"] },
  g_tool_painter:    { items: ["g_amuletwornorheld", "g_emblemborneonfabricora", "g_reliquaryheld", "g_sprigofmistletoe", "g_woodenstaffalsoaquarte", "g_yewwand"] },
  g_tool_potter:     { items: ["g_jug", "g_lamp"] },
  g_tool_smith:      { items: ["g_ballbearings", "g_bucket", "g_bulletsfirearm", "g_bulletssling", "g_caltrops", "g_chain", "g_crowbar", "g_grapplinghook", "g_potiron", "g_spikesiron"], rules: [{"category": "melee weapon", "except": ["club", "greatclub", "quarterstaff", "whip"]}, {"category": "medium armor", "except": ["hide"]}, {"category": "heavy armor", "except": []}] },
  // [ALPG-312] firearms are NOT crafted. This row carried "g_musket" and "pistol" until the Q16
  // sweep (26 Jul) found them: the first was a live rule violation, the second a malformed id that
  // never resolved to anything and so hid the first by looking like a handled pair. Both gone.
  g_tool_tinker:     { items: ["g_bell", "g_flask", "g_huntingtrap", "g_lantern", "g_lanternbullseye", "g_lock", "g_manacles", "g_mirror", "g_shovel", "g_signalwhistle", "g_tinderbox"] },
  g_tool_weaver:     { items: ["g_basket", "g_bedroll", "g_blanket", "g_clothesfine", "g_clothestravelers", "g_net", "g_paddedarmor", "g_robe", "g_rope", "g_sack", "g_string", "g_tent"] },
  g_tool_woodcarver: { items: ["arrows20", "g_bolts", "g_club", "g_crystal", "g_greatclub", "g_inkpen", "g_needles", "g_orb", "g_quarterstaff", "g_rod", "g_sprigofmistletoe", "g_staffalsoaquarterstaff", "g_wand", "g_woodenstaffalsoaquarte", "g_yewwand"], rules: [{"category": "ranged weapon", "except": ["pistol", "musket", "sling"]}] },
};
// ================================================================================================
// THE SHARED CRAFT SPINE. Both the character workbench and the bastion facilities call these. The
// only difference between them is the GATE: a workbench gates on "this character carries the
// toolkit in their pack"; a facility gates on "this facility grants the tool". Everything past the
// gate — what the tool can make, how a rule resolves, how a scroll is offered — is identical, and
// lives here so the two consumers cannot drift apart.

// ---------------------------------------------------------------------------
// Trade settlement. Called only from the trade cases, after the reducer's clone.
// ---------------------------------------------------------------------------
export const TRADE_DT = 5;   // ALPG, "Trading Magic Items": 5 DT per permanent magic item traded

// Has an item moved (traded away, deleted) since this trade was proposed?

// I unwind a trade that can't complete: release whatever escrow is still mine to hold.
export function cancelTradeItems(tr, itA, itB) {
  tr.status = "CANCELLED";
  if (itA && itA.holder.id === tr.a.charId) itA.escrow = false;   // only release if still ours
  if (itB && itB.holder.id === tr.b.charId) itB.escrow = false;
}

// Move one item across: the same six steps each side of a trade performs.

export const carriedCount = (ch, kind) => ((ch && ch.gifts) || []).filter((g) => g.kind === kind && g.carried).length;

// The gate, workbench side: which craft-tools a character is carrying in their pack. An item counts
// if it is held by the character and its catalogue row is one of the artisan's tools TOOL_CRAFTS
// knows. Returns the tool catalogIds, deduped — a character with two of a tool still lists it once.
export function carriedCraftTools(state: AppState, charId: string) {
  const held = new Set();
  Object.values(state.items || {}).forEach((it) => {
    if (it.holder && it.holder.type === "CHARACTER" && it.holder.id === charId &&
        TOOL_CRAFTS[it.catalogId]) held.add(it.catalogId);
  });
  return [...held];
}

// Carry-count contribution of n packed units of a consumable. ALPG: magic ammunition/smokepowder
// count as one per 5 shots (rounded up); potions/scrolls count one each.
export function consumableUnitCount(cat, n) {
  if (!n) return 0;
  if (cat && cat.itemType === "ammunition") return Math.ceil(n / 5);
  return n;
}

export const giftLimit = (tier, kind) => (GIFT_LIMITS[tier] || GIFT_LIMITS[4])[kind] || 0;

// Move one item across: the same six steps each side of a trade performs.
export function handOverItem(it, from, to, tradeId) {
  it.holder = { type: "CHARACTER", id: to.id };
  it.escrow = false;
  it.history.push(tradeId);
  it.lineage.push({ holder: to.name, note: "Traded from " + from.name });
  it.available = false;
  it.equipped = false; it.attuned = false;   // the new owner re-equips and re-attunes for themselves
}

// The AL downtime cost, logged against the character who paid it.

// The account that originally entered an item into the system (not necessarily its current holder).
export function inputterOf(state: AppState, it) {
  if (!it) return null;
  if (it.origin && it.origin.by) return it.origin.by;                       // explicit account, when recorded
  const firstName = (it.lineage && it.lineage[0] && it.lineage[0].holder) || (it.origin && it.origin.holder);
  if (firstName) { const ch = Object.values(state.characters).find((c) => c.name === firstName); if (ch) return ch.ownerId; }
  if (it.holder && it.holder.type === "CHARACTER" && state.characters[it.holder.id]) return state.characters[it.holder.id].ownerId;
  if (it.holder && it.holder.type === "PLAYER_SHELF") return it.holder.id;
  if (it.holder && it.holder.type === "RETIREMENT_SHELF") return it.holder.id;
  return null;
}

// Which lanes are legal for this item (compliance by construction)
export function isTradeableClass(c) { return c === "MAGIC_ITEM" || c === "EVENT_CERT"; }

// The AL downtime cost, logged against the character who paid it.
export function logTradeCost(s: AppState, ch, gave, got, date) {
  s.logEntries.push({
    id: "log" + s.nextId++, charId: ch.id, entryType: "EXPENDITURE", status: "APPROVED",
    date, dtSpent: TRADE_DT,
    spentOn: "Trading Magic Items: " + catName(gave.catalogId) + " for " + catName(got.catalogId),
  });
}

// ---------------------------------------------------------------------------
// Invalidation: unwinding an item that should never have existed.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// AUTHORISATION — one door for "may this account act on this thing?"
//
// Every mutating case asks before it touches anything. Today the client is trusted (one
// browser, no network), so these always pass — but the moment there's a server, an action
// is just a JSON body a stranger can POST. A reducer that trusts action.charId is a reducer
// that lets anyone delete anyone's character. Guard at the door, not at the caller.
//
// An admin passes everything — that is what the role is for, and it's how the demo's owner
// account gets full access without punching holes in the rules for everyone else.
// ---------------------------------------------------------------------------
export function mayActOnChar(s: AppState, charId, by) {
  const ch = s.characters[charId];
  if (!ch) return false;
  return ch.ownerId === by || isAdmin(s, by);
}

// Item use-restrictions: a character must meet the item's race/class requirement to equip or attune it.
export function meetsReq(cat, ch) {
  const r = cat && cat.req;
  if (!r || !ch) return true;
  if (r.races && r.races.length) { const race = (ch.race || "").toLowerCase(); if (!r.races.some((x) => race.includes(x.toLowerCase()))) return false; }
  if (r.classes && r.classes.length) { const cls = (ch.cls || "").toLowerCase(); if (!r.classes.some((x) => cls.includes(x.toLowerCase()))) return false; }
  return true;
}

// ALPG "Trading Magic Items": same assigned campaign, one-for-one equivalent rarity,
// tradeable class only, and NOT Unique rarity / character-created / firearms. (No same-tier rule.)

// Legacy fallback only: the org that ran a table this account signed up for (or ran).
export function orgsFromSessions(state: AppState, acct) {
  const ids = new Set<string>();
  (state.sessions || []).forEach((se) => {
    if (!se.orgId) return;
    if (se.dmId === acct) { ids.add(se.orgId); return; }
    if ((se.signups || []).some((g) => (g && g.accountId) === acct)) ids.add(se.orgId);
  });
  return [...ids];
}

// Who should be asked to verify something a player entered. A store can host more than one
// organisation, so "every DM at the store" can reach strangers. Narrow to DMs who share BOTH
// the store AND an organisation with the player - someone they're likely to know.
// Falls back to store-wide rather than notifying nobody: an unverifiable item helps no one.

// ---- ORGANISATION MEMBERSHIP ------------------------------------------------------
// state.orgMembers maps an ACCOUNT to the organisation(s) it belongs to. This is the
// authoritative record: every account carries its own membership rather than the system
// guessing. It is also what the reporting side reads - who is a DM, who is a player, and
// how many of each an organisation has.
//   state.orgMembers = { acc_aldric: ["org_scale"], ... }
export function orgsOfAccount(state: AppState, acct) {
  const m = state.orgMembers && state.orgMembers[acct];
  if (Array.isArray(m)) return m;              // an EXPLICIT list wins - including an empty one.
  if (typeof m === "string" && m) return [m];  // "belongs to nothing" must not be re-guessed.
  // Only when NO flag exists at all (legacy account) do I fall back to what I can observe:
  // org-side affiliation first, then the tables they've sat at.
  const fromOrgSide = dmOrgList(state, acct);
  if (fromOrgSide.length) return fromOrgSide;
  return orgsFromSessions(state, acct);
}

// Legacy fallback only: the org that ran a table this account signed up for (or ran).

// Every DM who shares a store with this account.
export function storeDMs(state: AppState, acct) {
  return ACCOUNTS.filter((a) => a.id !== acct && isDMRole(state, a.id) && sharesStore(state, a.id, acct)).map((a) => a.id);
}

// ---- ORGANISATION MEMBERSHIP ------------------------------------------------------
// state.orgMembers maps an ACCOUNT to the organisation(s) it belongs to. This is the
// authoritative record: every account carries its own membership rather than the system
// guessing. It is also what the reporting side reads - who is a DM, who is a player, and
// how many of each an organisation has.
//   state.orgMembers = { acc_aldric: ["org_scale"], ... }

// The specialized capabilities a tool opens (["scroll"], ["potion"], …) — the SRD Craft entries
// B-33 keeps out of the mundane list but that are real. The workbench turns these into frames.
export function toolSpecials(toolId) {
  return (TOOL_CRAFTS[toolId] && TOOL_CRAFTS[toolId].special) || [];
}

// The gate, workbench side: which craft-tools a character is carrying in their pack. An item counts
// if it is held by the character and its catalogue row is one of the artisan's tools TOOL_CRAFTS
// knows. Returns the tool catalogIds, deduped — a character with two of a tool still lists it once.

// ALPG "Trading Magic Items": same assigned campaign, one-for-one equivalent rarity,
// tradeable class only, and NOT Unique rarity / character-created / firearms. (No same-tier rule.)
export function tradeLegal(itA, itB) {
  if (!itA || !itB) return false;
  const cA = itemCat(itA), cB = itemCat(itB);
  if (!cA || !cB) return false;
  if (!isTradeableClass(itA.itemClass) || isFirearm(itA.catalogId)) return false;
  if (!isTradeableClass(itB.itemClass) || isFirearm(itB.catalogId)) return false;
  if (cA.rarity === "unique" || cB.rarity === "unique") return false;   // Unique may not be traded
  if (itA.campaign !== itB.campaign) return false;                       // same assigned campaign
  if (cA.rarity !== cB.rarity) return false;                             // equivalent rarity, one-for-one
  return true;
}

// ---- Downtime & gold "market" catalogue (services verbatim from ALDMG; item prices are sample placeholders) ----

// Has an item moved (traded away, deleted) since this trade was proposed?
export function tradeSideStale(item, charId) {
  return !item || item.holder.type !== "CHARACTER" || item.holder.id !== charId;
}

// I unwind a trade that can't complete: release whatever escrow is still mine to hold.

// Who should be asked to verify something a player entered. A store can host more than one
// organisation, so "every DM at the store" can reach strangers. Narrow to DMs who share BOTH
// the store AND an organisation with the player - someone they're likely to know.
// Falls back to store-wide rather than notifying nobody: an unverifiable item helps no one.
export function verifyingDMs(state: AppState, acct) {
  const atStore = storeDMs(state, acct);
  const mine = new Set(orgsOfAccount(state, acct));
  if (!mine.size || !atStore.length) return atStore;
  const shared = atStore.filter((dm) => orgsOfAccount(state, dm).some((o) => mine.has(o)));
  return shared.length ? shared : atStore;
}

export function attunedCount(state: AppState, charId) { return itemsOf(state, charId).filter((x) => x.attuned).length; }

// Item use-restrictions: a character must meet the item's race/class requirement to equip or attune it.

export function canTradeAcct(state: AppState, acct) { return !isSuspended(state, acct) && !isDeactivated(state, acct); }

export function carriedCounts(state: AppState, charId) {
  const c = { unc: 0, com: 0, con: 0 };
  const conPacked: Record<string, any> = {};   // catalogId -> packed (in-pack) unit count
  itemsOf(state, charId).forEach((it) => {   // the index already guarantees this character holds it
    if (it.itemClass === "STORY_ITEM" || isFirearm(it.catalogId)) return;   // ALPG: story items & mundane firearms don't count toward the magic-item carry limit
    const cat = itemCat(it);
    if (cat && cat.mundane) return;   // mundane gear is unlimited — never counts toward the magic-item limits
    if (it.available) return;         // marked for trade → sitting on the market, not carried on an adventure
    if (cat && cat.consumable) { if (it.equipped) conPacked[it.catalogId] = (conPacked[it.catalogId] || 0) + 1; return; }   // consumables count by what's in the pack
    if (it.equipped || it.inPack !== false) c[itemBucket(it.catalogId, it.itemClass)]++;   // only items you BRING count — left-behind (at the bastion) items don't
  });
  Object.keys(conPacked).forEach((cid) => { c.con += consumableUnitCount(CATALOG[cid], conPacked[cid]); });
  return c;
}

// ---------------------------------------------------------------------------
// AUTHORISATION — one door for "may this account act on this thing?"
//
// Every mutating case asks before it touches anything. Today the client is trusted (one
// browser, no network), so these always pass — but the moment there's a server, an action
// is just a JSON body a stranger can POST. A reducer that trusts action.charId is a reducer
// that lets anyone delete anyone's character. Guard at the door, not at the caller.
//
// An admin passes everything — that is what the role is for, and it's how the demo's owner
// account gets full access without punching holes in the rules for everyone else.
// ---------------------------------------------------------------------------

export function dmOrgList(state: AppState, acc) {   // orgs a DM may schedule under: leadership + explicit affiliation
  const orgs = state.organizations || {};
  return Object.keys(orgs).filter((k) => { const o = orgs[k]; return o.leaderId === acc || (o.assistantIds || []).includes(acc) || (o.schedulerIds || []).includes(acc) || (o.dmIds || []).includes(acc); });
}

export function equipSlot(cat) {
  const t = cat.itemType;
  if (t === "weapon" || t === "wand" || t === "staff") return { slot: "hand", max: 2 }; // up to two one-handed
  const c = ((cat.category || "") + " " + (cat.name || "")).toLowerCase();
  if (c.includes("cloak") || c.includes("cape") || c.includes("mantle")) return { slot: "back", max: 1 };
  if (c.includes("boots") || c.includes("shoes") || c.includes("slippers")) return { slot: "feet", max: 1 };
  if (c.includes("belt") || c.includes("girdle")) return { slot: "belt", max: 1 };
  if (c.includes("amulet") || c.includes("necklace") || c.includes("periapt") || c.includes("medallion") || c.includes("brooch") || c.includes("scarab") || c.includes("talisman")) return { slot: "neck", max: 1 };
  if (c.includes("gauntlet") || c.includes("glove")) return { slot: "hands", max: 1 };
  if (c.includes("bracers") || c.includes("bracelet")) return { slot: "wrists", max: 1 };
  if (c.includes("headband") || c.includes("helm") || c.includes("hat") || c.includes("circlet") || c.includes("crown") || c.includes("goggles") || c.includes("lenses") || c.includes("eyes of") || c.includes("mask")) return { slot: "head", max: 1 };
  if (c.includes("ring")) return { slot: "ring", max: 2 };            // 5e: one per hand
  if (c.includes("robe") || c.includes("vestment")) return { slot: "body", max: 1 };
  if (c.includes("bag") || c.includes("haversack")) return { slot: "carried", max: 99 };
  if (t === "armor") return { slot: "body", max: 1 };
  return { slot: "wondrous:" + cat.id, max: 1 };                       // non-worn wondrous: only blocks duplicates of the same item
}

// ---------------------------------------------------------------------------
// Trade settlement. Called only from the trade cases, after the reducer's clone.
// ---------------------------------------------------------------------------

export function isDMRole(state: AppState, acct) { return (state.roles[acct] || []).includes("dm"); }

export function isDeactivated(state: AppState, acct) { return !!(state.mod && state.mod.deactivated && state.mod.deactivated.includes(acct)); }

export function isFirearm(catalogId) { const c = CATALOG[catalogId]; return !!(c && c.firearm); }   // ALPG: firearms are kept but not traded/crafted/replicated

// Q16 (Frank, 26 Jul). ONE acquisition door for firearms and poisons alike: "if you cannot buy it
// and you cannot make it then you wait for a DM to issue it." This gates the STORE and the CRAFT
// BENCH only. It deliberately does NOT gate holding, logging, or carrying — an awarded item is a
// legitimate possession, and the whole point of keeping the row (rather than deleting it, as the
// superseded structural exclusion did) is that a goat can record what a DM handed them.
export function isAwardOnly(catalogId) { const c = CATALOG[catalogId]; return !!(c && c.awardOnly); }

// ---------------------------------------------------------------------------
// ITEM INDEX — "what does THIS character hold?"
//
// The item table is flat: items[] with a holder on each. So every question about one
// character ("what are they carrying?", "how many attuned?") scanned EVERY item in the
// world — O(items) per call, and the character sheet asks several times per render.
// Harmless at 60 items, wrong on its face at 4,000, and it's the kind of wrong that
// quietly becomes a bug the day someone's store gets busy.
//
// The index is memoised on STATE IDENTITY, which costs nothing to maintain. The reducer
// already guarantees exactly what a cache needs: a brand-new state object whenever anything
// changes, and the SAME object when nothing does. So `_itemIdxFor !== state` IS the
// invalidation signal — no dirty flags, no bookkeeping, no way to forget.
// Rebuild: one O(items) pass per state change. Lookups: O(1).
// ---------------------------------------------------------------------------

export function isSuspended(state: AppState, acct) { const u = state.mod && state.mod.bans && state.mod.bans[acct]; return u ? (new Date(u).getTime() > Date.now()) : false; }

export function itemBucket(catalogId, itemClass) {
  const cat = CATALOG[catalogId];
  if (cat && cat.mundane) return "gear";   // mundane equipment is unlimited — it belongs to no magic-item bucket
  if (itemClass === "CONSUMABLE") return "con";
  if (cat && cat.consumable) return "con";
  if (itemClass === "EVENT_CERT") return "com"; // event award carried as a Common item
  if (cat && cat.rarity === "common") return "com";
  return "unc"; // uncommon, rare, very rare, legendary
}

export function itemIndex(state: AppState) {
  if (_itemIdxFor === state && _itemIdx) return _itemIdx;
  const idx = new Map();
  Object.values(state.items).forEach((it) => {
    if (!it.holder || it.holder.type !== "CHARACTER") return;
    const bucket = idx.get(it.holder.id);
    if (bucket) bucket.push(it); else idx.set(it.holder.id, [it]);
  });
  _itemIdxFor = state; _itemIdx = idx;
  return idx;
}

export function itemsOf(state: AppState, charId) { return itemIndex(state).get(charId) || NO_ITEMS; }

export function legendaryTierBlocked(catalogId, tier) {
  const cat = CATALOG[catalogId];
  return !!(cat && cat.rarity === "legendary" && (tier || 1) < LEGENDARY_TIER);
}

export function matchWish(w, item) {
  const cat = itemCat(item);
  // A player-entered item has no catalogue row and carries only what its owner typed, so there
  // is nothing dependable to match a wish against. (The old `if (!cat)` here was dead code:
  // itemCat falls back to the item itself and never returns falsy.)
  if (!item || !item.catalogId) return false;
  if (w.mode === "SPECIFIC") {
    if (w.catalogId === item.catalogId) return true;
    if (w.acceptVariants) {
      const wantBase = itemCat(w)?.base || w.catalogId;
      const haveBase = cat.base || cat.id;
      return wantBase === haveBase;
    }
    return false;
  }
  // A malformed wish must not be able to throw. satisfyWishlist runs on every item award, so a
  // crash here does not just fail the match - it takes down the award. The fuzz found exactly
  // that: ADD_WISH with no `desired` block, then any award, and matchWish died on d.rarity.
  const d = w.desired || {};
  if (d.rarity && d.rarity !== cat.rarity) return false;
  if (d.itemType && d.itemType !== cat.itemType) return false;
  if (d.tags && !d.tags.every((x) => (cat.props || []).includes(x))) return false;
  return true;
}

export function mayActOnItem(s: AppState, itemId, by) {
  const it = s.items[itemId];
  if (!it) return false;
  if (it.holder.type === "CHARACTER") return mayActOnChar(s, it.holder.id, by);
  if (it.holder.type === "PLAYER_SHELF") return it.holder.id === by || isAdmin(s, by);   // a cert on your own player-shelf is yours to assign or gift, as it is an admin's
  return isAdmin(s, by);   // a truly unheld item (a cert in the pool, an escrowed piece) is admin territory
}

// SR-13 (Frank, 25 Jul, closing Q18): a LIVE charm ITEM counts against the ALPG carried-charm
// cap — the item is the delivery mechanism, not a way around the ceiling. Possession is what
// counts: it is on the character who holds it, escrowed-away or not, pack or no pack — a Charm
// sits on the creature, not in luggage. Expired keepsakes count for nothing; they do nothing.
export const liveCharmItemsHeld = (state: AppState, charId) =>
  Object.values((state && state.items) || {}).filter((i: any) => i && i.charmItem && i.charmState === "LIVE"
    && i.holder && i.holder.type === "CHARACTER" && i.holder.id === charId).length;

export function normalizeCarriedGifts(s: AppState, ch) {   // after a tier change, uncarry any gifts now beyond the tier's carry limit
  if (!ch || !Array.isArray(ch.gifts)) return;
  const tier = ch.tier || tierFromLevel(ch.level);
  GIFT_KINDS.forEach((k) => {
    // SR-13: charm ITEMS eat slots first — they cannot be unchecked, so the sheet yields.
    const taken = k.id === "charm" ? liveCharmItemsHeld(s, ch.id) : 0;
    const limit = Math.max(0, giftLimit(tier, k.id) - taken);
    ch.gifts.filter((g) => g.kind === k.id && g.carried).slice(limit).forEach((g) => { g.carried = false; });
  });
}

// ALPG v2026.4 "Carried Magic Items by Tier"

export function provOf(state: AppState, acct) { return (state.provisional && state.provisional[acct]) || "none"; }

// Every DM who shares a store with this account.

export function satisfyWishlist(s: AppState, charId, item) {
  const ch = s.characters[charId];
  if (!ch || !ch.wishlist) return;
  // once the character actually has it, the wish is done — drop it entirely
  ch.wishlist = ch.wishlist.filter((w) => !(w.status === "OPEN" && matchWish(w, item)));
}

// The account that originally entered an item into the system (not necessarily its current holder).

export function sharesStore(state: AppState, a, b) { const sa = storesOf(state, a); return storesOf(state, b).some((x) => sa.includes(x)); }

export function storesOf(state: AppState, acct) { const v = state.stores && state.stores[acct]; return Array.isArray(v) ? v : v ? [v] : ["store_dj"]; }

export function tierFromLevel(l) { const n = +l || 1; return n <= 4 ? 1 : n <= 10 ? 2 : n <= 16 ? 3 : 4; }

// Invalidates the item index. Lives here because the cache it clears is module-private.
export function invalidateItemIndex() { _itemIdxFor = null; _itemIdx = null; }
// Phase 1c: when a dispatch did NOT touch items, its buckets are still true — the records are
// the same objects — so the index follows the new state identity instead of being rebuilt.
export function retargetItemIndex(st: any) { if (_itemIdx) _itemIdxFor = st; }

// A character may hold a bastion from level 5. A CHARACTER rule, not bastion machinery -
// the shared roster card needs it, and lib must not reach up into a feature package.
export const bastionEligible = (ch) => ch && (ch.level || 1) >= 5;

// Regions a character has earned, read from their approved log. Adventure/character data,
// used by both the roster card and the bastion screens.
// Where has this character actually spent their adventuring life? Reads their APPROVED log only —
// so the answer is earned, not asserted. Weighted by downtime days spent there, plus the sessions themselves.
export function earnedRegions(state: AppState, ch) {
  if (!ch) return [];
  const tally: Record<string, any> = {};
  (state.logEntries || []).forEach((l) => {
    if (l.charId !== ch.id || l.status !== "APPROVED") return;
    const tags = ADVENTURE_TAGS[l.adventureId] || [];
    if (!tags.length) return;
    const hits = Object.keys(REGION_TAGS).filter((rid) => REGION_TAGS[rid].some((t) => tags.includes(t)));
    if (!hits.length) return;
    hits.forEach((rid) => {   // an adventure can touch two regions; each gets the credit
      if (!tally[rid]) tally[rid] = { id: rid, days: 0, sessions: 0 };
      tally[rid].days += (l.dtEarned || 0);
      tally[rid].sessions += 1;
    });
  });
  const REG_BY_ID: Record<string, any> = {}; BASTION_REGIONS.forEach((r) => { REG_BY_ID[r.id] = r; });
  return Object.keys(tally)
    .filter((rid) => REG_BY_ID[rid])
    .map((rid) => ({ ...tally[rid], name: REG_BY_ID[rid].name, note: REG_BY_ID[rid].note, score: tally[rid].days + tally[rid].sessions * 5 }))
    .sort((a, b) => (b.score - a.score) || (b.sessions - a.sessions) || a.id.localeCompare(b.id));   // deterministic
}
