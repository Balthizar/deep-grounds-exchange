import type { AppState } from "../types";

// Thread context label. Messaging is app-wide, not bastion machinery.
export function threadCtx(th, acc) { return th.ctx && th.ctx[acc] ? th.ctx[acc] : "player"; }
// ============================================================================
// MY CORE PRIMITIVES - accounts, item construction, provenance, and small dice.
// app.tsx AND my bastion engine both share these, so I keep them below both. That's
// what lets my bastion modules avoid importing from app.tsx at all.
// ============================================================================

import { CATALOG } from "../data/catalog";

export const evHostility = (ev) => (ev && ev.hostility) || "neutral";

export const evIsHostile = (ev) => evHostility(ev) === "hostile";

export const BATTLE_BEAT_SEC = 90;              // one beat every 90 real seconds — a clean repel ~5 min, a bad siege ~12

export const BATTLE_JITTER = 0.25;              // ±25%, so the rhythm is a person talking and not a metronome

export const d6 = () => 1 + Math.floor(Math.random() * 6);

export const d6x100 = () => d6() * 100;                                  // the DMG's favourite bastion payout

// ---- Accounts (one may be both player & DM; separate accounts differ) ----
// Accounts carry `createdAt` (for cohort stratification in the test sampler) and `testingOptIn`
// (consent to be used as a live-data test fixture). testingOptIn is OFF by default — an account
// is never sampled unless the person affirmatively turned it on. The demo accounts are opted in
// so the sampler has data to exercise against; a real signup starts false and shows a notice
// explaining why opting in helps the platform.
export const ACCOUNTS: any[] = [
  { id: "acc_aldric", name: "Aldric",  kind: "player", device: "dev-01", createdAt: "2025-11-04", testingOptIn: true },
  { id: "acc_mira",   name: "Mira",    kind: "player", device: "dev-02", createdAt: "2025-12-18", testingOptIn: true },
  { id: "acc_oribel", name: "Mother Oribel", kind: "dm", device: "dev-03", createdAt: "2026-01-09", testingOptIn: true },
  { id: "acc_admin",  name: "Guildmaster (Admin)", kind: "admin", device: "dev-04", createdAt: "2025-10-01", testingOptIn: true },
  { id: "acc_frank",  name: "Frank Pettingill", kind: "dm", device: "dev-05", createdAt: "2025-10-01", testingOptIn: true },
];

// An item either points at MY CATALOGUE row or carries its own facts. Player-entered items
// (rolled slots, character imports, paper claims) deliberately get NO catalogue row - I ship
// no item text I'm not licensed for - so they carry name/rarity/itemType/attune on the
// instance instead. Future me: anything reading an item's properties goes through here, or it
// reads undefined off a catalogue that was never going to have the row.
export function itemCat(it): any { return (it && CATALOG[it.catalogId]) || it || {}; }

export function mkItem(id, catalogId, itemClass, campaign, provenance, holder, extra?) {
  const consumable = !!(CATALOG[catalogId] && CATALOG[catalogId].consumable);
  const base = { id, catalogId, itemClass, campaign, provenance, holder, escrow: false, history: [], origin: null, lineage: [], available: false, equipped: consumable, attuned: false };
  // `extra` carries per-INSTANCE facts my catalogue row can't hold because they vary per item:
  // a scroll's { spellId, spellName } (which spell THIS scroll bears), a future engraving, etc.
  // The catalogue stays my single shared copy (scroll_L3 is every level-3 scroll); the instance
  // says which one. My "point at the catalogue until you need a static instance" model — extra
  // IS the static instance. Undefined for every existing call, so nothing else changed.
  return extra ? { ...base, ...extra } : base;
}

export function verified(source, by) { return { state: "VERIFIED", source, by }; }

export function unverified() { return { state: "UNVERIFIED", source: null, by: null }; }

export function accName(id) { return ACCOUNTS.find((a) => a.id === id)?.name || id; }

export function catName(id) { return CATALOG[id]?.name || id; }

// My catalog is the truth about what a thing IS. Mundane equipment is gear — never a magic item, and it has
// no rarity at all ("Common" is a MAGIC rarity in AL, and implies a carry slot mundane gear doesn't take).
// I route every item row through these so the labels can't drift apart on me again.
export function isMundaneCat(catalogId) { const c = CATALOG[catalogId]; return !!(c && c.mundane); }

export function itemClassOf(catalogId, proposed) { return isMundaneCat(catalogId) ? "GEAR" : (proposed || "MAGIC_ITEM"); }

// Organisation lookup. I keep it here, below both rules and play, so neither imports the
// other for it - that pairing was the one import cycle I ever let into my tree.
export function orgRec(state: AppState, id) { return (state.organizations || {})[id] || null; }

// ============================================================================
// PLAY RULES - the constraints around sessions, tables, and DM standing.
// Table counts, publishing eligibility, DM seniority and oversight limits,
// Warhorn matching. Shared by the reducer and the UI, so it sits below both.
// ============================================================================

// ---- A CALL ------------------------------------------------
// Something arrives that needs an ANSWER, and waits for one. A pending call can be
// triggered by a DM, an Event, or a Bastion event when calling for aid." A retired hero's summons
// (bastion.pendingCall + REFUSE_CALL) is the first instance, and it already renders in TWO places —
// the bastion screen and the roster frame — because a thing that waits for you has to FIND you.
// That is the pattern the rest should copy rather than reinvent.
//
// It exists because the DMG puts real decisions in two events and this app makes both of them FOR
// the player. Both deviations are live today and labelled where they happen:
//   Extraordinary Opportunity: "IF YOU SEIZE the opportunity, you must pay 500 GP... IF YOU DECLINE
//     the opportunity, you don't pay the money and nothing else happens."  -> resolveOpportunity
//     always seizes when you can afford it. Declining is unreachable; 500 gp leaves without a click.
//   Request for Aid: "you must dispatch ONE OR MORE Bastion Defenders. Roll 1d6 FOR EACH Bastion
//     Defender you send."  -> resolveRequestForAid sends the entire garrison, every time.
// Sending three of twelve rather than twelve is the whole risk. Paying 500 gp is the whole cost.
// Neither decision is reachable, so neither exists.
//
// Three kinds now, one shape: something arrives, it FINDS you (BastionAlerts, on every screen), and
// it waits. ANSWER_CALL is the one door. Whitelist: an unknown kind answers nothing.

export function blobHash(str) {          // FNV-1a, 32-bit — cheap and good enough to name a picture
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36) + "_" + str.length.toString(36);   // hash + length: collisions need both to match
}

// ---- image blob store. Generic, not bastion-specific: it belongs below every feature. ----
// ---------------------------------------------------------------------------
// BLOB STORE — image data lives HERE, not in reducer state.
//
// Why: my reducer structuredClones whole records on every action. A base64
// portrait is ~60KB; a bastion map ~46KB. Left in state, a loaded account is
// ~1MB and 96% of it is pixels — so every button press deep-copies a megabyte
// of image data to change one integer (measured: 4.4ms/action, 99MB per 100
// actions). Images are write-once, read-many, and never transactional: nothing
// about them needs undo, diffing, or cloning. So state holds a 7-byte handle
// and the bytes live in a module-level Map the cloner never sees.
//
// Copy the handle, not the payload. State drops to ~40KB and STOPS growing
// with the number of pictures.
// ---------------------------------------------------------------------------
export const BLOBS = new Map();          // blobId -> data URL

export function putBlob(dataURL) {       // CONTENT-ADDRESSED: same bytes -> same handle, always.
  if (!dataURL) return null;      // This makes the call idempotent, so a double-invoked reducer
  if (typeof dataURL === "string" && dataURL.startsWith("blob_")) return dataURL;   // (React StrictMode) can't orphan a blob — and two characters sharing
  const id = "blob_" + blobHash(dataURL);                                            // the same portrait share one copy of the bytes.
  if (!BLOBS.has(id)) BLOBS.set(id, dataURL);
  return id;
}

// Mark-and-sweep: walk the state, keep what's referenced, drop the rest. Called after any action that
// clears or replaces an image. O(state), and state is ~40KB by design — cheaper than refcounting, and
// it cannot double-free or leak on a rejected action.

// Mark-and-sweep: walk the state, keep what's referenced, drop the rest. Called after any action that
// clears or replaces an image. O(state), and state is ~40KB by design — cheaper than refcounting, and
// it cannot double-free or leak on a rejected action.
export function sweepBlobs(s: AppState) {
  const live = new Set();
  const walk = (v) => {
    if (!v) return;
    if (typeof v === "string") { if (v.startsWith("blob_")) live.add(v); return; }
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (typeof v === "object") { for (const k in v) walk(v[k]); }
  };
  walk(s);
  BLOBS.forEach((_, id) => { if (!live.has(id)) BLOBS.delete(id); });
}

// ---- moved from lib/play.ts: these need engine internals, and lib sits BELOW bastion ----
