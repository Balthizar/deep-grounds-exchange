import { playerPushReport, schedulerPushReport } from "./push";
import { isModuleAuthor } from "./play";
import { CATALOG } from "../data/catalog";
import SPELLS from "../data/srd/spells.json";
import MUNDANE_GEAR from "../data/srd/mundane_gear.json";
import { ATTUNE_SLOTS, CARRIED_LIMITS, GIFT_KINDS, LIFESTYLES, LIFESTYLE_BY_ID, MARKET, SCROLL_COST, attunedCount, bastionEligible, callKind, carriedCounts, liveCharmItemsHeld, carriedCraftTools, consumableUnitCount, earnedRegions, equipSlot, giftLimit, isFirearm, isTradeableClass, legendaryTierBlocked, meetsReq, provOf, tierFromLevel } from "../lib/rules";
import type { Action, CharacterRecord, ItemRecord } from "../types";
import { accName, catName, isMundaneCat, itemCat, orgRec } from "../lib/core";

// Human label for a provenance source. Shared by every screen that shows an item.
export function labelSource(s: string) { return { DM_VOUCH: "DM vouch", ADMIN_AUTHENTICATED: "admin-authenticated", DM_ACCEPTED_AT_TABLE: "DM accepted at table", PURCHASED: "purchased", CRAFTED: "character-created", BESTOWED: "bestowed", ARCHIVE: "archive copy" }[s] || s; }

// Provenance trail for an item - shown wherever an item is inspected.
export function CreditTrail({ ch, state, accountId, dispatch }: { dispatch: React.Dispatch<Action>; state: AppState; ch: CharacterRecord; [k: string]: any }) {
  const [mod, setMod] = useState("");
  const credits = ch.credits || [];
  const listedIn = activeListings(state).filter((l) => (l.heroes || []).includes(ch.id) || (l.ruins || []).includes(ch.id));
  const canCredit = isModuleAuthor(state, accountId) && ch.licensed;
  if (credits.length === 0 && listedIn.length === 0 && !canCredit) return null;
  return (
    <div>
      <div className="dg-halldiary-h">✍ Featured in</div>
      {credits.length === 0 ? <div className="dg-muted sm">Not yet credited in a module.</div> : credits.map((c) => (
        <div key={c.id} className="dg-credit"><span><b>{c.module}</b> <span className="dg-muted sm">· {accName(c.author)} · {c.date}</span></span>{c.author === accountId && <button className="dg-linkbtn" title="Retract this credit" onClick={() => dispatch({ type: "REMOVE_MODULE_CREDIT", charId: ch.id, by: accountId, creditId: c.id })}>✕</button>}</div>
      ))}
      {listedIn.length > 0 && (<>
        <div className="dg-halldiary-h" style={{ marginTop: 10 }}>📓 On the community shelf</div>
        {listedIn.map((l) => (
          <div key={l.id} className="dg-credit"><span><b>{l.title}</b> <span className="dg-muted sm">· {accName(l.authorId)} · {l.setting}</span></span>{l.buyLink && <a className="dg-linkbtn" href={l.buyLink} target="_blank" rel="noopener noreferrer">buy ↗</a>}</div>
        ))}
      </>)}
      {canCredit && (
        <div className="dg-diaryadd" style={{ marginTop: 8 }}>
          <input className="dg-draft-title" style={{ fontSize: 14 }} value={mod} onChange={(e) => setMod(e.target.value)} placeholder="Module title where you used them…" />
          <button className="dg-btn sm" disabled={!mod.trim()} onClick={() => { dispatch({ type: "ADD_MODULE_CREDIT", charId: ch.id, by: accountId, module: mod }); setMod(""); }}>Add credit (CC BY attribution)</button>
        </div>
      )}
    </div>
  );
}

// Rarity label helper, used by the item summary line.
export function itemRarityLabel(catalogId) {
  if (isMundaneCat(catalogId)) return "";   // mundane gear has no rarity
  const c = CATALOG[catalogId];
  return (c && RARITY[c.rarity]) ? RARITY[c.rarity].label : "";
}

// Shared across feature packages: a store picker and the one-line item summary.
export function itemMetaLine(catalogId, itemClass) {   // "Uncommon · magic item" | "gear"
  return [itemRarityLabel(catalogId), itemClassLabel(catalogId, itemClass)].filter(Boolean).join(" · ");
}

// Shared across feature packages: a store picker and the one-line item summary.
export function StorePicker({ state, onPick, setModal, exclude, placeholder }: { state: AppState; [k: string]: any }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ex = exclude || [];
  const matches = Object.values(state.storeRegistry || {}).filter((st) => !ex.includes(st.id) && st.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="dg-storepicker">
      <input type="text" value={q} placeholder={placeholder || "Type a store name…"} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} />
      {open && (
        <div className="dg-suggest">
          {matches.map((st) => (
            <button key={st.id} className="dg-suggest-item" onClick={() => { onPick(st.id); setQ(""); setOpen(false); }}>
              <div className="dg-suggest-title">{st.name}</div>
              <div className="dg-suggest-sub">{st.address || "—"}</div>
            </button>
          ))}
          {setModal && <button className="dg-suggest-item" onClick={() => { setOpen(false); setQ(""); setModal({ kind: "storereq" }); }}><div className="dg-suggest-title">+ Request a new store…</div><div className="dg-suggest-sub">Sends the details to the admin to add</div></button>}
        </div>
      )}
    </div>
  );
}

// Fallback epitaph text. Character prose, shown on the retirement screen.
export function defaultEpitaph(ch) {
  const who = [ch.race, ch.cls].filter(Boolean).join(" ") || "adventurer";
  return "Here lies " + (ch.name || "a fallen hero") + ", " + who + " — who fell as heroes do, that others might live.";
}


import { storeRec } from "../lib/play";
import type { AppState } from "../types";
import { BLOBS } from "../lib/core";

// ============================================================================
// SHARED UI.
//
// Everything used by MORE THAN ONE section. Small chips (StoreChip, OrgLogo, Seal,
// ProvBadge, tierLabel) plus the genuinely cross-cutting components:
//   CharacterCard   - the roster card, shown on the profile AND the retirement screen
//   ItemEntryModal  - one form, three callers: bastion slots, character import,
//                     and claims for items earned at outside tables
//   ScrollPicker    - scroll selection, used from more than one place
//
// Anything here is shared BY DEFINITION: if a declaration ends up used by only one
// section again, move it back into that section. This module is the seam between
// sections, so keeping it honest is what stops the sections re-tangling.
// ============================================================================

// the dropdown index: level -> [spell, ...], built once from SPELLS.
export const SPELLS_BY_LEVEL = Object.values(SPELLS).reduce((m, s) => ((m[s.level] = m[s.level] || []).push(s), m), {});

// Which spells a character may scribe onto a scroll: SRD/ALPG rule — the spell must be on the
// character's class list. A Fighter or Rogue (no class in the spell vocabulary) yields an empty
// list, which the workbench must SAY rather than show an empty box. Level 0 = cantrips included.
export function scribableSpells(char) {
  const cls = char && char.cls;
  if (!cls) return [];
  return Object.values(SPELLS).filter((sp) => (sp.classes || []).includes(cls));
}

export function scribableByLevel(char) {
  const out: Record<string, any> = {};
  scribableSpells(char).forEach((sp) => { (out[sp.level] = out[sp.level] || []).push(sp); });
  return out;
}
// ================================================================================================
// [ALPG-312] Firearms are "NOT purchased" — kept only if awarded in encounter text. I gated
// the trade path (isFirearm) and left the PURCHASE path open, and my store sold the Musket
// for 500 gp. My own 2x-AL review caught it; the row's own alNote already said so. I don't
// get to miss a rule my own data annotates. [FINDINGS: BUG-1]
// Q16 (Frank, 26 Jul): the guard is now `awardOnly`, which the generator sets on firearms AND
// poisons alike. Reading the flag rather than naming the categories means a poison added by a
// future SRD pull is out of the store the moment it is generated, without touching this line.
Object.values(MUNDANE_GEAR).forEach((g) => { if (g.id !== "arrows20" && !(g as any).awardOnly) MARKET.push({ id: "buy_" + g.id, name: g.name, cat: "mundane", gp: g.gp, output: "item", mint: g.id, mintClass: "GEAR" }); });

// A tiny purse of coins from a gp decimal, exact. Money is stored as ONE number — gp, a decimal —
// and this is how it reads out: work in COPPER (integer) so no float drift ever mints or eats a
// coin. 1 gp = 10 sp = 100 cp. The roster shows the decimal; the opened purse shows g/s/c.
export function coinsFromGp(gp) {
  const totalCp = Math.round((gp || 0) * 100);
  return { gp: Math.floor(totalCp / 100), sp: Math.floor((totalCp % 100) / 10), cp: totalCp % 10 };
}

export const SLOT_LABEL = { belt: "belt", neck: "amulet", head: "headpiece", hand: "weapon", back: "cloak", feet: "boots", hands: "gloves", wrists: "bracers", ring: "ring", body: "body" };

// ── Canonical log-entry taxonomy ──────────────────────────────────────────────
// One source of truth. Add a new entry type HERE and every filter stays correct.
//   char:     entry lives on a character's log sheet (has a valid charId)
//   approver: who must approve it — "dm" (player→DM), "mentor" (trainee→mentor), or null (auto/self)
export const LOG_KINDS = {
  EARNING:     { char: true,  approver: "dm"     }, // player session log
  EXPENDITURE: { char: true,  approver: null     }, // downtime spend (e.g. trades)
  DM_REWARD:   { char: true,  approver: null     }, // certified-DM self-certified reward
  PROV_DM:     { char: true,  approver: "mentor" }, // provisional-DM run → mentor reviews
  OBSERVER:    { char: false, approver: "mentor" }, // shadow reflection → mentor reviews (no character)
  DISPOSAL:    { char: true,  approver: "dm"     }, // player releases an item → DM records it leaving play
  SLOTCLAIM:   { char: true,  approver: "dm"     }, // player fills a rolled item slot from their own book
  DM_ITEM:     { char: true,  approver: "mentor" }, // DM-authored adventure item; certified self-certifies, provisional goes to their mentor
  IMPORT_ITEM: { char: true,  approver: "dm"     }, // item typed in during character import; a store DM checks it
  PAPER_ITEM:  { char: true,  approver: "dm"     }, // item earned on paper elsewhere - certificate or an outside AL table
};

export const logHasChar = (l) => !!(LOG_KINDS[l.entryType] && LOG_KINDS[l.entryType].char);

export function monogram(name) { return (name || "").split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join(""); }

export function StoreLogo({ store, size }) {
  const s = size || 40;
  const style = { width: s, height: s, borderRadius: 8, flex: "0 0 auto" };
  if (store && store.logo) return <img src={getBlob(store.logo)} alt="" style={{ ...style, objectFit: "cover" }} />;
  if (store && store.name) return <div className="dg-storelogo mono" style={{ ...style, fontSize: s * 0.36 }}>{monogram(store.name)}</div>;
  return <div className="dg-storelogo glyph" style={{ ...style, fontSize: s * 0.5 }}>🏪</div>;
}

export function StoreChip({ state, storeId, setModal }: { state: AppState; [k: string]: any }) {
  const r = storeRec(state, storeId);
  if (!r) return null;
  return <button className="dg-storechip" onClick={() => setModal && setModal({ kind: "store", storeId })}><StoreLogo store={r} size={18} /><span>{r.name}</span></button>;
}

export function OrgLogo({ org, size }) {
  const s = size || 20, style = { width: s, height: s, borderRadius: s * 0.28, flex: "0 0 auto", objectFit: "cover" };
  if (org && org.logo) return <img src={getBlob(org.logo)} alt="" style={style as React.CSSProperties} />;
  return <span className="dg-orgmono" style={{ width: s, height: s, fontSize: s * 0.42 }}>{monogram(org ? (org.short || org.name) : "?")}</span>;
}

export function orgsForStore(state: AppState, storeId) { return Object.values(state.organizations || {}).filter((o) => (o.storeIds || []).includes(storeId)); }

export function OrgChip({ state, orgId, setModal }: { state: AppState; [k: string]: any }) {
  const o = orgRec(state, orgId);
  if (!o) return null;
  return <button className="dg-orgchip" onClick={() => setModal && setModal({ kind: "org", orgId })}><OrgLogo org={o} size={20} /><span>{o.short || o.name}</span></button>;
}

export const PROV_LABEL = { none: "", "provisional-mentee": "Provisional · Mentee", "provisional-dm": "Provisional DM · in training", certified: "Certified DM" };

export function ProvBadge({ state, acct }: { state: AppState; [k: string]: any }) {
  const p = provOf(state, acct);
  if (!p || p === "none") return null;
  return <span className={"dg-provbadge " + p}>{PROV_LABEL[p]}</span>;
}

export function tierLabel(t) { return typeof t === "number" ? "Tier " + t : t; }

// ALPG p.4/p.6: party favors. rare-gear & lodging can fade (leaving an incomplete adventure or the giver's domain); paid debts & rendered spellcasting don't.
export const FAVOR_KINDS = { "rare-gear": "Rare gear", "paid-debt": "Paid debt", "lodging": "Lodging", "spellcasting": "Spellcasting (≤500 GP)" };

export const FAVOR_FADES = { "rare-gear": true, "lodging": true, "paid-debt": false, "spellcasting": false };

// Official AL documents (links maintained by the AL team on the D&D Beyond resources thread)
export const AL_DOCS = {
  alpg: { label: "Player's Guide — ALPG v2026.4", url: "https://www.dndbeyond.com/linkout?remoteUrl=https%253a%252f%252fwizardsprod.a.bigcontent.io%252fv1%252fstatic%252fD%2526D%2bAdventurers%2bLeague%2bPlayers%2bGuide%2bv2026.4" },
  aldmg: { label: "Dungeon Master's Guide — ALDMG v2026.2", url: "https://www.dndbeyond.com/linkout?remoteUrl=https%253a%252f%252fwizardsprod.a.bigcontent.io%252fv1%252fstatic%252fD%2526D%2bAdventurers%2bLeague%2bDungeon%2bMasters%2bGuide%2bv2026.2" },
  alag: { label: "Adaptation Guide — ALAG v2026.2", url: "https://www.dndbeyond.com/linkout?remoteUrl=https%253a%252f%252fwizardsprod.a.bigcontent.io%252fv1%252fstatic%252fD%2526D%2bAdventurers%2bLeague%2bAdaptation%2bGuide%2bv2026.2" },
  hub: { label: "All AL documents (resources hub)", url: "https://www.dndbeyond.com/forums/dungeons-dragons-discussion/d-d-organized-play/192532-d-d-adventurers-league-resources-links-updated-12" },
};

export function RulesLinks({ docs }) {
  return (
    <div className="dg-panel">
      <div className="dg-panel-h">Rules &amp; documents</div>
      <div className="dg-doclinks">
        {docs.map((k) => <a key={k} className="dg-doclink" href={AL_DOCS[k].url} target="_blank" rel="noreferrer">📄 {AL_DOCS[k].label}</a>)}
      </div>
      <div className="dg-muted sm">Official documents, hosted by Wizards of the Coast via D&amp;D Beyond.</div>
    </div>
  );
}

export function listingTierLabel(l) { return l.tierLow === l.tierHigh ? "Tier " + l.tierLow : "Tiers " + l.tierLow + "–" + l.tierHigh; }

export function GiftsSection({ ch, dispatch, accountId, setModal, state }: { dispatch: React.Dispatch<Action>; ch: CharacterRecord; [k: string]: any }) {
  const gifts = ch.gifts || [];
  const tier = ch.tier || tierFromLevel(ch.level);
  const owner = ch.ownerId === accountId;
  if (!gifts.length && !owner) return null;
  return (
    <div className="dg-gifts">
      <div className="dg-gifts-h"><span>Supernatural Gifts</span></div>
      {gifts.length === 0 ? <div className="dg-muted sm">None yet — Blessings, Boons, and Charms are awarded by your DM at a table's end.</div> :
        GIFT_KINDS.map((k) => {
          const of = gifts.filter((g) => g.kind === k.id);
          if (!of.length) return null;
          const limit = giftLimit(tier, k.id), carried = of.filter((g) => g.carried).length;
          const itemsN = k.id === "charm" && state ? liveCharmItemsHeld(state, ch.id) : 0;   // SR-13: live charm items hold their slots
          const used = carried + itemsN;
          return (
            <div key={k.id} className="dg-giftgroup">
              <div className="dg-giftgroup-h">{k.plural} <span className="dg-muted sm">· {limit === 0 ? "earned, but not carryable until Tier 4" : "carried " + used + "/" + limit + (itemsN ? " (incl. " + itemsN + " charm item" + (itemsN > 1 ? "s" : "") + ")" : "")}</span></div>
              {of.map((g) => (
                <div key={g.id} className="dg-giftrow">
                  <div className="dg-giftline1">
                    <input type="checkbox" className="dg-giftcarry" checked={!!g.carried} disabled={!owner || (!g.carried && used >= limit)} title={g.carried ? "Carried into sessions" : (limit === 0 ? "Boons aren't carryable until Tier 4" : used >= limit ? "Tier " + tier + " carry limit reached" + (itemsN ? " (live charm items count — SR-13)" : "") + " — stays in inventory" : "Carry into sessions")} onChange={() => dispatch({ type: "TOGGLE_GIFT_CARRIED", charId: ch.id, by: accountId, giftId: g.id })} />
                    <span className="dg-giftname">{g.name}{g.epicBoon && <span className="dg-giftbadge">⭐ Epic Boon Feat</span>}{!g.carried && <span className="dg-giftbench"> · in inventory</span>}</span>
                    {owner && g.realm && <button className="dg-giftfade" title={"Fades as the character leaves " + g.realm} onClick={() => setModal({ kind: "confirm", title: g.name + " fades?", body: "It fades as the character leaves " + g.realm + ", and can only be reacquired through play.", confirmLabel: "Remove", danger: true, action: { type: "REMOVE_GIFT", charId: ch.id, by: accountId, giftId: g.id } })}>🌒</button>}
                  </div>
                  <div className="dg-giftline2">
                    <span className="dg-giftsource">{g.source || "—"}{g.realm ? " · bound to " + g.realm : ""}</span>
                    {owner && <button className="dg-giftgiveup" title="Give up this gift — also how a gift is lost when you abandon an adventure. Reacquirable only through play." onClick={() => setModal({ kind: "confirm", title: "Give up " + g.name + "?", body: "It can only be reacquired through play.", confirmLabel: "Give up", danger: true, action: { type: "REMOVE_GIFT", charId: ch.id, by: accountId, giftId: g.id } })}>Give up</button>}
                  </div>
                  {g.desc && <div className="dg-giftdesc">{g.desc}</div>}
                </div>
              ))}
            </div>
          );
        })}
    </div>
  );
}

// ---- ITEM ENTRY -------------------------------------------------------------------
// One form, three callers: character import (retyping an existing sheet), a DM authoring an
// adventure item, and filling a rolled bastion slot. I can't ship item text I have no
// licence for, so the player types what their own book says and a DM checks it.
export const BLANK_ITEM = {
  name: "", quantity: "1", itemType: "", category: "", rarity: "", weight: "", gp: "",
  damage: "", damageType: "", range: "", props: "", attune: false, req: "", charges: "",
  consumable: false, desc: "", traits: "", notes: "", source: "", page: "",
  // evidence, for an item earned on paper somewhere else [ALPG-296]
  awardKind: "play", adventure: "", playedOn: "", dmName: "", dmNumber: "", venue: "",
  event: "", certSerial: "",
};

export const ITEM_TYPES = ["weapon", "ammunition", "armor", "shield", "potion", "scroll", "wand",
  "staff", "rod", "ring", "wondrous", "tool", "gear"];

export const ITEM_RARITIES = ["mundane", "common", "uncommon", "rare", "very rare", "legendary", "artifact"];

export function ItemEntryModal({ modal, state, accountId, dispatch, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const [f, setF] = useState<any>({ ...BLANK_ITEM });
  const [added, setAdded] = useState<string[]>([]);
  const [asking, setAsking] = useState(false);
  const ch = state.characters[modal.charId];
  if (!ch) return null;
  const paper = modal.context === "paper";      // claiming something earned elsewhere
  const slotMode = modal.context === "slot";   // filling a slot a bastion roll owes them
  const slot = slotMode ? (state.itemSlots || {})[modal.slotId] : null;
  const cert = paper && f.awardKind === "certificate";
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const chk = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.checked }));
  const martial = f.itemType === "weapon" || f.itemType === "ammunition";
  const magical = !!f.rarity && f.rarity !== "mundane";
  const qty = Math.max(1, parseInt(f.quantity, 10) || 1);

  const submit = () => {
    if (!f.name.trim()) return;
    if (slotMode) dispatch({ type: "SUBMIT_SLOT_ITEM", slotId: modal.slotId, by: accountId, ...f } as any);
    else dispatch({ type: paper ? "CLAIM_PAPER_ITEM" : "IMPORT_CHARACTER_ITEM",
      charId: ch.id, by: accountId, kind: f.awardKind, ...f } as any);
    setAdded((a) => [...a, (qty > 1 ? qty + "x " : "") + f.name.trim()]);
    setAsking(true);
  };
  const another = () => { setF({ ...BLANK_ITEM }); setAsking(false); };

  // ---- the "one more?" step ----
  if (asking && slotMode) return (
    <div className="dg-confirmmodal">
      <div className="dg-confirm-title">Claimed {added[added.length - 1]}</div>
      <div className="dg-confirm-body">
        <p>It's on <b>{ch.name}</b>'s sheet, unverified, and a DM at your store has been asked
        to check it against the book.</p>
      </div>
      <div className="dg-row-actions" style={{ marginTop: 16 }}>
        <button className="dg-btn" onClick={close}>Done</button>
      </div>
    </div>
  );
  if (asking) return (
    <div className="dg-confirmmodal">
      <div className="dg-confirm-title">{paper ? "Claimed" : "Added"} {added[added.length - 1]}</div>
      <div className="dg-confirm-body">
        <p>{added.length} item{added.length === 1 ? "" : "s"} entered for <b>{ch.name}</b>. They're on the sheet
        and marked unverified until a DM at your store checks them{paper ? " against your paperwork" : ""}.</p>
        {added.length > 1 && <p className="dg-muted sm">{added.join(" · ")}</p>}
        <p>Do you need to {paper ? "claim" : "import"} another item?</p>
      </div>
      <div className="dg-row-actions" style={{ marginTop: 16 }}>
        <button className="dg-btn" onClick={another}>Yes — add another</button>
        <button className="dg-btn ghost" onClick={close}>No, I'm done</button>
      </div>
    </div>
  );

  // ---- the item block ----
  return (
    <div className="dg-confirmmodal">
      <div className="dg-confirm-title">{slotMode ? "Fill the slot you rolled" : paper ? "Claim an item earned elsewhere" : "Import an item"} for {ch.name}</div>
      <div className="dg-confirm-body">
        {slotMode && slot && (
          <div className="dg-l5pack" style={{ marginBottom: 8 }}>
            <div className="dg-l5pack-h">You're owed: {slot.label || [slot.rarity, slot.cat, slot.sub].filter(Boolean).join(" · ")}</div>
            <div className="dg-muted sm">
              {slot.roll ? "Rolled " + slot.roll + " on the " + String(slot.table || "").toLowerCase() + " table. " : ""}
              Pick something from your own books that fits, and enter it below. A DM checks it against
              what the roll owed you.
            </div>
          </div>
        )}
        <p className="dg-muted sm">{slotMode ? "Copy it exactly as your book prints it." : paper
          ? "Earned at a table the Exchange doesn't cover, or holding an event certificate? Claim it here so it isn't lost. A DM at your store checks it against your paperwork."
          : "Copy the item exactly as your book prints it. Everything here — mundane gear, potions, arrows, magic items — goes in the same way."}
        {added.length > 0 && <> So far: <b>{added.length}</b> entered.</>}</p>

        {paper && (
          <label className="dg-field"><span>Where did it come from?</span>
            <select value={f.awardKind} onChange={set("awardKind")}>
              <option value="play">Earned in play at another AL table</option>
              <option value="certificate">An event award certificate</option>
            </select></label>
        )}

        <label className="dg-field"><span>Item name</span>
          <input value={f.name} onChange={set("name")} placeholder="e.g. Longsword, +1" autoFocus /></label>

        <div className="dg-tagrow">
          <label className="dg-field" style={{ flex: 1 }}><span>Quantity</span>
            <input type="number" min={1} value={f.quantity} onChange={set("quantity")} /></label>
          <label className="dg-field" style={{ flex: 2 }}><span>Type</span>
            <select value={f.itemType} onChange={set("itemType")}>
              <option value="">—</option>
              {ITEM_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select></label>
          <label className="dg-field" style={{ flex: 2 }}><span>Rarity</span>
            <select value={f.rarity} onChange={set("rarity")}>
              <option value="">—</option>
              {ITEM_RARITIES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select></label>
        </div>

        <label className="dg-field"><span>Category as printed</span>
          <input value={f.category} onChange={set("category")} placeholder="e.g. Martial melee weapon / Wondrous item (requires attunement)" /></label>

        <div className="dg-tagrow">
          <label className="dg-field" style={{ flex: 1 }}><span>Weight</span>
            <input value={f.weight} onChange={set("weight")} placeholder="3 lb." /></label>
          <label className="dg-field" style={{ flex: 1 }}><span>Cost</span>
            <input value={f.gp} onChange={set("gp")} placeholder="15 GP" /></label>
        </div>

        {martial && (
          <>
            <div className="dg-tagrow">
              <label className="dg-field" style={{ flex: 1 }}><span>Damage</span>
                <input value={f.damage} onChange={set("damage")} placeholder="1d8" /></label>
              <label className="dg-field" style={{ flex: 1 }}><span>Damage type</span>
                <input value={f.damageType} onChange={set("damageType")} placeholder="Slashing" /></label>
              <label className="dg-field" style={{ flex: 1 }}><span>Range</span>
                <input value={f.range} onChange={set("range")} placeholder="20/60" /></label>
            </div>
            <label className="dg-field"><span>Properties</span>
              <input value={f.props} onChange={set("props")} placeholder="Finesse, Light, Thrown" /></label>
          </>
        )}

        {magical && (
          <div className="dg-tagrow">
            <label className="dg-field" style={{ flex: 2 }}><span>Charges</span>
              <input value={f.charges} onChange={set("charges")} placeholder="7 charges, regains 1d6+1 at dawn" /></label>
            <label className="dg-field" style={{ flex: 1, alignSelf: "end" }}>
              <span><input type="checkbox" checked={f.attune} onChange={chk("attune")} /> Attunement</span></label>
            <label className="dg-field" style={{ flex: 1, alignSelf: "end" }}>
              <span><input type="checkbox" checked={f.consumable} onChange={chk("consumable")} /> Consumable</span></label>
          </div>
        )}
        {magical && f.attune && (
          <label className="dg-field"><span>Attunement requirement</span>
            <input value={f.req} onChange={set("req")} placeholder="by a spellcaster" /></label>
        )}

        <label className="dg-field"><span>Description</span>
          <textarea rows={3} value={f.desc} onChange={set("desc")} placeholder="What the entry says the item does." /></label>
        <label className="dg-field"><span>Traits / properties in short</span>
          <input value={f.traits} onChange={set("traits")} placeholder="+1 to attack and damage rolls" /></label>

        {paper && (
          <>
            <div className="dg-panel-h" style={{ marginTop: 10 }}>Your paperwork</div>
            <div className="dg-muted sm" style={{ marginBottom: 4 }}>
              A DM checks this against what your log should show — adventure, date, and who ran it.
            </div>
            {cert ? (
              <>
                <div className="dg-tagrow">
                  <label className="dg-field" style={{ flex: 2 }}><span>Event</span>
                    <input value={f.event} onChange={set("event")} placeholder="GenghisCon 2026" /></label>
                  <label className="dg-field" style={{ flex: 1 }}><span>Date</span>
                    <input value={f.playedOn} onChange={set("playedOn")} placeholder="2026-02-14" /></label>
                </div>
                <label className="dg-field"><span>Certificate serial or code</span>
                  <input value={f.certSerial} onChange={set("certSerial")} placeholder="if the certificate carries one" /></label>
                <div className="dg-muted sm">An event award attaches to <b>you</b>, not to one character [ALPG-196].</div>
              </>
            ) : (
              <>
                <div className="dg-tagrow">
                  <label className="dg-field" style={{ flex: 2 }}><span>Adventure title or code</span>
                    <input value={f.adventure} onChange={set("adventure")} placeholder="DDEX01-05, or the one-shot's name" /></label>
                  <label className="dg-field" style={{ flex: 1 }}><span>Date played</span>
                    <input value={f.playedOn} onChange={set("playedOn")} placeholder="2026-02-14" /></label>
                </div>
                <div className="dg-tagrow">
                  <label className="dg-field" style={{ flex: 2 }}><span>DM who ran it</span>
                    <input value={f.dmName} onChange={set("dmName")} placeholder="their name" /></label>
                  <label className="dg-field" style={{ flex: 1 }}><span>Their DCI / AL number</span>
                    <input value={f.dmNumber} onChange={set("dmNumber")} placeholder="if you have it" /></label>
                </div>
                <label className="dg-field"><span>Where you played</span>
                  <input value={f.venue} onChange={set("venue")} placeholder="store, convention, or online" /></label>
              </>
            )}
          </>
        )}

        <div className="dg-tagrow">
          <label className="dg-field" style={{ flex: 2 }}><span>Source book</span>
            <input value={f.source} onChange={set("source")} placeholder="PH 2024 / DMG" /></label>
          <label className="dg-field" style={{ flex: 1 }}><span>Page</span>
            <input value={f.page} onChange={set("page")} placeholder="244" /></label>
        </div>
        <label className="dg-field"><span>Notes for your DM</span>
          <input value={f.notes} onChange={set("notes")} placeholder="Anything the DM should know" /></label>
      </div>

      <div className="dg-row-actions" style={{ marginTop: 16 }}>
        <button className="dg-btn" disabled={!f.name.trim()} onClick={submit}>{slotMode ? "Fill the slot" : paper ? "Submit claim" : "Submit item"}</button>
        <button className="dg-btn ghost" onClick={close}>{added.length ? "Finish" : "Cancel"}</button>
      </div>
      <div className="dg-muted" style={{ fontSize: "0.72rem", opacity: 0.55, marginTop: 10, textAlign: "center" }}>
        Due to the missing API between D&amp;D Beyond and the outside world, all items must be added by hand.
      </div>
    </div>
  );
}

export function CharacterCard({ ch, state, accountId, dispatch, setModal, goBastion, retired }: { dispatch: React.Dispatch<Action>; state: AppState; ch: CharacterRecord; [k: string]: any }) {
  const inv = Object.values(state.items).filter((it) => it.holder.type === "CHARACTER" && it.holder.id === ch.id);
  const [packView, setPackView] = useState(false);
  const gearCount = inv.filter((it) => { const c = itemCat(it); return c && c.mundane && !c.consumable; }).length;
  const pending = state.logEntries.filter((l) => l.charId === ch.id && (l.status === "SUBMITTED" || l.status === "RETURNED") && l.entryType !== "EXPENDITURE");
  const dead = ch.status === "dead";
  return (
    <div className={"dg-card char" + (retired ? " dg-retired" : "")}>
      <div className="dg-card-h">
        <div className="dg-charident">
          {(() => {
            const owner = accountId === ch.ownerId && !dead;
            if (!ch.image && !owner) return null;
            const pic = ch.image
              ? <img src={getBlob(ch.image)} alt={ch.name} />
              : <div className="dg-portrait-empty"><svg viewBox="0 0 24 24" width="40" height="40"><circle cx="12" cy="8" r="4" fill="currentColor" /><path d="M4 21v-1c0-3.4 3.6-5 8-5s8 1.6 8 5v1z" fill="currentColor" /></svg></div>;
            if (!owner) return <div className="dg-portrait">{pic}</div>;
            return (
              <label className="dg-portrait owner" title={ch.image ? "Tap to change " + ch.name + "'s picture" : "Tap to add a picture of " + ch.name}>
                {pic}
                <span className="dg-portrait-hint">{ch.image ? "change" : "add"}</span>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files![0]; if (!f) return; const r = new FileReader(); r.onload = () => dispatch({ type: "SET_CHARACTER_IMAGE", charId: ch.id, by: accountId, dataURL: r.result }); r.readAsDataURL(f); e.target.value = ""; }} />
              </label>
            );
          })()}
        <div>
          <div className="dg-char-name">{ch.name}{retired && <span className="dg-retbadge">{dead ? "☠ Fallen" : "🪦 Retired"}</span>}{accountId === ch.ownerId && !dead && <button className="dg-nameedit" title={"Edit " + ch.name} onClick={() => setModal({ kind: "charedit", accountId, charId: ch.id })}>✎</button>}</div>
          <div className="dg-char-meta">{[ch.race, ch.cls].filter(Boolean).join(" ")}{ch.level ? " · Level " + ch.level : ""} · Tier {ch.tier}</div>
          <div className="dg-chartags">
          <div className="dg-factiontag">{ch.faction || "Unaffiliated"}</div>
          {(() => {
            const cur = ch.lifestyle ? LIFESTYLE_BY_ID[ch.lifestyle] : null;
            const owner = accountId === ch.ownerId && !dead;
            if (!cur && !owner) return null;   // nothing to show a visitor
            const cycle = () => {
              const i = ch.lifestyle ? LIFESTYLES.findIndex((l) => l.id === ch.lifestyle) : -1;
              const next = i + 1 >= LIFESTYLES.length ? null : LIFESTYLES[i + 1].id;   // last tap clears it
              dispatch({ type: "SET_LIFESTYLE", charId: ch.id, by: accountId, lifestyle: next });
            };
            const label = cur ? "🏠 " + cur.name : "🏠 Set a living condition…";
            const title = cur ? cur.note + " — flavor only; no gold is charged." : "Tap to choose how this hero lives between adventures. Flavor only — AL charges no cost of living.";
            return owner
              ? <button className={"dg-lifepill" + (cur ? " on" : "")} title={title} onClick={cycle}>{label}</button>
              : <span className="dg-lifepill on" title={cur.note}>{label}</span>;
          })()}
          </div>
        </div>
        </div>
        <div className="dg-counters">
          <button className="dg-dt" title="Downtime Days" onClick={() => setModal({ kind: "market", charId: ch.id, currency: "dt" })}><b>{ch.dt}</b><span>DT</span></button>
          <button className="dg-gp" title={(() => { const c = coinsFromGp(ch.gp || 0); return c.gp + " gold, " + c.sp + " silver, " + c.cp + " copper"; })()} onClick={() => setModal({ kind: "market", charId: ch.id, currency: "gp" })}><b>{Number.isInteger(ch.gp || 0) ? (ch.gp || 0) : (ch.gp || 0).toFixed(2)}</b><span>GP</span></button>
        </div>
      </div>
      {retired && (ch.credits || []).length > 0 && <div className="dg-muted sm" style={{ marginTop: 4 }}>✍ Featured in {(ch.credits || []).map((c) => c.module).join(", ")}</div>}
      {retired ? (<>
        <div className="dg-charbtns">
          <button className="dg-logbtn" onClick={() => setModal({ kind: "logsheet", charId: ch.id })}>📜 Log sheet</button>
          <button className="dg-logbtn" title="Their retirement diary" onClick={() => setModal({ kind: "retirediary", charId: ch.id })}>📖 Diary</button>
          {bastionEligible(ch) && <button className="dg-logbtn" title={ch.bastion ? "Go to " + ch.bastion.name : "Go to bastions"} onClick={() => goBastion(ch.id)}>🏰 Bastion</button>}
        </div>
        <div className="dg-charbtns">
          <button className="dg-logbtn" style={{ color: "var(--maroon)", fontWeight: 600 }} title="Call this hero back to active play — their shelved gear returns" onClick={() => setModal({ kind: "confirm", title: "Call " + ch.name + " out of retirement?", body: "Any of their gear still on the shelf returns to them.", confirmLabel: "⚔ Call to adventure", action: { type: "UNRETIRE_CHARACTER", charId: ch.id, by: accountId } })}>⚔ Call to adventure</button>
          {accountId === ch.ownerId && <button className="dg-logbtn" title={ch.shared ? "In the Hall of Heroes — tap to make private" : "Share this hero to the community Hall of Heroes"} onClick={() => dispatch({ type: "TOGGLE_SHARE_HERO", charId: ch.id, by: accountId })}>{ch.shared ? "★ Hall" : "☆ Share"}</button>}
          {accountId === ch.ownerId && ch.shared && <button className="dg-logbtn" style={(ch.licensed ? { color: "#2e5e2e", fontWeight: 600 } : null) as React.CSSProperties} title={ch.licensed ? "Licensed to authors as an NPC — tap to withdraw the offer" : "License this hero for authors to cast as an NPC (CC BY 4.0)"} onClick={() => setModal({ kind: "license", charId: ch.id, assetType: "npc" })}>{ch.licensed ? "✓ Licensed" : "✍ License"}</button>}
        </div>
      </>) : (<>
        <div className="dg-charbtns">
          <button className="dg-logbtn" onClick={() => setModal({ kind: "logsheet", charId: ch.id })}>📜 Log sheet{pending.length > 0 && <span className="dg-badge">{pending.length}</span>}</button>
          {accountId === ch.ownerId && <button className="dg-logbtn" title="Claim an item you earned at a table outside the Exchange, or hold on an event certificate" onClick={() => setModal({ kind: "itementry", context: "paper", charId: ch.id })}>🧾 Claim item</button>}
          {ch.ddb ? <a className="dg-logbtn" title="Open this character on D&amp;D Beyond" href={ch.ddb} target="_blank" rel="noreferrer">↗ D&amp;D Beyond</a> : null}
          {bastionEligible(ch) && <button className="dg-logbtn" title={ch.bastion ? "Go to " + ch.bastion.name : "Go to bastions"} onClick={() => goBastion(ch.id)}>🏰</button>}
          {accountId === ch.ownerId && <button className={"dg-logbtn" + (packView ? " on" : "")} title={packView ? "Showing your pack — tap to show AL-tracked magic items" : "Show your pack (non-magical gear)"} onClick={() => setPackView((v) => !v)}>🎒{!packView && gearCount > 0 && <span className="dg-badge">{gearCount}</span>}</button>}
          {accountId === ch.ownerId && carriedCraftTools(state, ch.id).length > 0 && <button className="dg-logbtn" title="Craft with a toolkit from your pack" onClick={() => setModal({ kind: "workbench", charId: ch.id })}>🛠 Craft</button>}
        </div>
        {accountId === ch.ownerId && <OwedSlots state={state} charId={ch.id} accountId={accountId} setModal={setModal} />}
      </>)}

      {retired && !dead && ch.bastion && ch.bastion.pendingCall && callKind(ch.bastion) === "summons" && ch.bastion.pendingCall.by && (() => {
        const first = ch.name || "";
        return (
          <div className="dg-summons">
            <div className="dg-summons-h">⚔ A call reaches {first}</div>
            <div className="dg-summons-body">At {ch.bastion.name}: <i>{ch.bastion.pendingCall.label}</i> — word travels far. Does {first} take up arms again?</div>
            <div className="dg-row-actions" style={{ marginTop: 8 }}>
              <button className="dg-btn sm" onClick={() => setModal({ kind: "confirm", title: "Answer the call?", body: ch.name + " returns to active play, and any gear still on the shelf comes back to hand.", confirmLabel: "⚔ Answer the call", action: { type: "UNRETIRE_CHARACTER", charId: ch.id, by: accountId } })}>⚔ Answer the call</button>
              <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "confirm", title: "Refuse the call?", body: ch.name + " stays in retirement. The refusal is written into their diary, and the summons fades.", confirmLabel: "Refuse", action: { type: "REFUSE_CALL", charId: ch.id, by: accountId } })}>Refuse</button>
            </div>
            <div className="dg-muted sm" style={{ marginTop: 6 }}>Answer to return to play, or refuse to stay retired — either way it becomes part of their story.</div>
          </div>
        );
      })()}

      {!retired && accountId === ch.ownerId && bastionEligible(ch) && !ch.bastion && (() => {
        const rs = earnedRegions(state, ch);
        const top = rs[0];
        return (
          <div className="dg-grantbanner">
            <div className="dg-grantbanner-h">🏰 A parcel of land awaits</div>
            {top
              ? <p>Your adventuring life has left an impression on <b>{top.name}</b> — {top.days} downtime {top.days === 1 ? "day" : "days"} across {top.sessions} {top.sessions === 1 ? "adventure" : "adventures"} spent in its service. Its people have chosen to gift you a parcel of land on which you may build your home.</p>
              : <p>Word of {ch.name}&rsquo;s deeds has spread, and a benefactor has chosen to gift you a parcel of land on which you may build your home. Choose where it lies.</p>}
            <button className="dg-btn sm" onClick={() => setModal({ kind: "bastionbuild", charId: ch.id })}>Build my bastion</button>
          </div>
        );
      })()}

      <div className="dg-inv">
        {retired
          ? <div className="dg-muted sm">{dead ? "Their gear was lost with them." : "Their gear rests on the Retirement Shelf below."}</div>
          : (<>
            {!packView && (() => {
              const tier = ch.tier || tierFromLevel(ch.level);
              const lim = CARRIED_LIMITS[tier] || CARRIED_LIMITS[1];
              const cc = carriedCounts(state, ch.id);
              const n = attunedCount(state, ch.id);
              const pill = (label, cur, max) => <span className={"dg-carrypill" + (cur > max ? " over" : cur >= max ? " full" : "")}>{label} <b>{cur}/{max}</b></span>;
              return (
                <div className="dg-carryframe">
                  <div className="dg-carryframe-h">AL carry limits · Tier {tier}</div>
                  <div className="dg-carrypills">
                    {pill("Permanent magic (uncommon+)", cc.unc, lim.unc)}
                    {pill("Common magic", cc.com, lim.com)}
                    {pill("Consumables", cc.con, lim.con)}
                    {pill("✦ Attunement", n, ATTUNE_SLOTS)}
                  </div>
                  <div className="dg-muted sm">Mundane gear is unlimited and not tracked — tap 🎒 Pack to view it.</div>
                </div>
              );
            })()}
            {(() => {
              const catOf = (it) => itemCat(it) || {};
              const isCon = (it) => !!catOf(it).consumable;
              const isMundane = (it) => catOf(it).mundane && !catOf(it).consumable;
              if (packView) {
                const gearGroups: Record<string, any> = {};
                inv.filter(isMundane).forEach((it) => { (gearGroups[it.catalogId] = gearGroups[it.catalogId] || []).push(it); });
                const keys = Object.keys(gearGroups);
                return <>
                  <div className="dg-gearhead">🎒 Pack · non-magical gear — AL doesn't track this; use it to update your own sheet</div>
                  {keys.length === 0
                    ? <div className="dg-muted sm">Your pack is empty. Tap <b>GP</b> above to buy equipment from the gold store.</div>
                    : keys.map((k) => <GearStack key={gearGroups[k][0].id} items={gearGroups[k]} setModal={setModal} />)}
                </>;
              }
              const others = inv.filter((it) => !isCon(it) && !isMundane(it));
              const conGroups: Record<string, any[]> = {};
              inv.filter(isCon).forEach((it) => { const kk = it.catalogId + "|" + it.provenance.state; (conGroups[kk] = conGroups[kk] || []).push(it); });
              if (others.length === 0 && Object.keys(conGroups).length === 0) return <div className="dg-muted sm">No magic items or consumables yet.</div>;
              return <>
                {others.map((it) => <ItemRow key={it.id} it={it} ch={ch} state={state} accountId={accountId} dispatch={dispatch} setModal={setModal} />)}
                {Object.values(conGroups).map((g) => <ConsumableStack key={g[0].id} items={g} state={state} dispatch={dispatch} setModal={setModal} accountId={accountId} />)}
              </>;
            })()}
          </>)}
      </div>

      {pending.length > 0 && (
        <div className="dg-pendingblock">
          <div className="dg-pending-h">Session logs in progress</div>
          {pending.map((l) => (
            <div key={l.id} className="dg-pendingrow">
              <span>{l.itemsEarned && l.itemsEarned.length > 0 ? l.itemsEarned.map((ie) => catName(ie.catalogId) + (ie.qty > 1 ? " ×" + ie.qty : "")).join(", ") : l.adventure} · +{l.dtEarned} DT</span>
              <span className="dg-pendingrow-r">
                <span className={"dg-pendingtag" + (l.status === "RETURNED" ? " fix" : "")}>{l.status === "RETURNED" ? "needs correction" : "pending"}</span>
                <button className="dg-pencil" title="Edit & resubmit" onClick={() => setModal({ kind: "log", charId: ch.id, editId: l.id })}>✎</button>
              </span>
            </div>
          ))}
        </div>
      )}

      {!retired && <Wishlist ch={ch} dispatch={dispatch} setModal={setModal} accountId={accountId} />}
      {!retired && <GiftsSection ch={ch} state={state} dispatch={dispatch} accountId={accountId} setModal={setModal} />}
      {!retired && <FavorsSection ch={ch} dispatch={dispatch} accountId={accountId} />}
      {!retired && <FriendsSection ch={ch} dispatch={dispatch} accountId={accountId} />}
    </div>
  );
}

export function GearStack({ items, setModal }) {
  const cat = itemCat(items[0]);
  return (
    <div className="dg-card dg-gearrow">
      <button className="dg-item-name link" onClick={() => setModal({ kind: "inspect", itemId: items[0].id })}>{cat.name}</button>
      {items.length > 1 && <span className="dg-qty">×{items.length}</span>}
      <span className="dg-muted sm">{cat.category}</span>
    </div>
  );
}

export function ConsumableStack({ items, state, dispatch, setModal, accountId }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const cat = itemCat(items[0]);
  const total = items.length;
  const packed = items.filter((it) => it.equipped).length;
  const unverified = items[0].provenance.state === "UNVERIFIED";
  const step = (up) => {
    if (up) { const c = items.find((it) => !it.equipped); if (c) dispatch({ type: "TOGGLE_EQUIPPED", itemId: c.id, by: accountId }); }
    else { const c = items.find((it) => it.equipped); if (c) dispatch({ type: "TOGGLE_EQUIPPED", itemId: c.id, by: accountId }); }
  };
  const isAmmo = cat.itemType === "ammunition";
  const carryUnits = consumableUnitCount(cat, packed);
  return (
    <div className="dg-card dg-constack">
      <div className="dg-item-line">
        <button className="dg-item-name link" onClick={() => setModal({ kind: "inspect", itemId: items[0].id })}>{cat.name}</button>
        <span className="dg-qty">×{total}</span>
        <span className="dg-dot">·</span><span className="dg-muted sm">{RARITY[cat.rarity] ? RARITY[cat.rarity].label : ""} consumable{unverified ? " · unverified" : ""}</span>
      </div>
      <div className="dg-itemrow-actions">
        <div className="dg-packstep">
          <span className="dg-muted sm">🎒 in pack</span>
          <button className="dg-stepbtn" disabled={packed <= 0} onClick={() => step(false)}>−</button>
          <b>{packed}</b><span className="dg-muted sm">/ {total}</span>
          <button className="dg-stepbtn" disabled={packed >= total} onClick={() => step(true)}>+</button>
        </div>
        {isAmmo && <span className="dg-muted sm">counts as {carryUnits} toward the limit (1 per 5)</span>}
      </div>
    </div>
  );
}

export function ItemRow({ it, ch, state, accountId, dispatch, setModal }: { dispatch: React.Dispatch<Action>; state: AppState; ch: CharacterRecord; it: ItemRecord; [k: string]: any }) {
  const [charmEdit, setCharmEdit] = useState(false);
  const [charmTxt, setCharmTxt] = useState("");
  const cat = itemCat(it);
  const stashWhere = (ch && ch.bastion) ? "your bastion" : "the inn";
  const stashLabel = (ch && ch.bastion) ? "🏰 at bastion" : "🏨 at the inn";
  const { slot, max } = equipSlot(cat);
  const sameSlotEquipped = Object.values(state.items).filter((x) => x.holder.type === "CHARACTER" && x.holder.id === ch.id && x.equipped && x.id !== it.id && equipSlot(itemCat(x)).slot === slot).length;
  const needsAttune = !!cat.attune;
  const attunedElsewhere = Object.values(state.items).filter((x) => x.holder.type === "CHARACTER" && x.holder.id === ch.id && x.attuned && x.id !== it.id).length;
  const attuneFull = attunedElsewhere >= ATTUNE_SLOTS;
  const attuneBlocked = needsAttune && !it.attuned && attuneFull;
  const legendaryBlocked = !it.equipped && legendaryTierBlocked(it.catalogId, ch.tier);
  const slotFull = !it.equipped && sameSlotEquipped >= max;
  const equipBlocked = slotFull || attuneBlocked || legendaryBlocked;
  const tradeable = isTradeableClass(it.itemClass) && !isFirearm(it.catalogId);   // ALPG: firearms can't be traded
  const physical = tradeable || it.itemClass === "UNTRADEABLE";
  const isEventCert = it.itemClass === "EVENT_CERT";
  const notTradeable = it.itemClass === "UNTRADEABLE";
  const unverified = it.provenance.state === "UNVERIFIED";
  const reviewThread = it.reviewThreadId ? (state.threads.find((t) => t.id === it.reviewThreadId && t.ticket && t.ticket.status !== "AUTHENTICATED")) : null;
  const disposalEntry = it.pendingDisposal ? state.logEntries.find((l) => l.entryType === "DISPOSAL" && l.itemId === it.id && l.status === "SUBMITTED") : null;
  return (
    <div className="dg-itemrow" style={{ "--rarity": RARITY[cat.rarity].color }}>
      <Seal prov={it.provenance} isEvent={it.itemClass === "EVENT_CERT"} review={it.review} />
      <div className="dg-itemrow-body">
        <button className="dg-item-name link" onClick={() => setModal({ kind: "inspect", itemId: it.id })}>{cat.name}{cat.variant && <span className="dg-variant">variant</span>}</button>
        <div className="dg-item-sub">
          <span className="dg-rarity" style={{ color: RARITY[cat.rarity].color }}>{RARITY[cat.rarity].label}</span>
          <span className="dg-dot">·</span><span>{cat.itemType}</span>
          {it.holder.type === "CHARACTER" && !it.equipped && <><span className="dg-dot">·</span><span className="dg-carriedtag">carried</span></>}
          {it.escrow && <><span className="dg-dot">·</span><span className="dg-escrow">in escrow</span></>}
        </div>
      </div>
      <div className="dg-itemrow-actions">
        {tradeable && (
          <label className={"dg-avail" + (it.equipped ? " disabled" : "")} title={it.equipped ? "Unequip to offer it" : "Offer this item on the market"}>
            <input type="checkbox" checked={!!it.available} disabled={it.equipped} onChange={() => dispatch({ type: "TOGGLE_AVAILABLE", itemId: it.id, by: accountId })} />
            <span>Available for trade</span>
          </label>
        )}
        {cat.consumable ? (
          <button className={"dg-equip" + (it.equipped ? " on" : "")} title={it.equipped ? "Carried and ready to use" : "Carry this in your pack"} onClick={() => dispatch({ type: "TOGGLE_EQUIPPED", itemId: it.id, by: accountId })}>{it.equipped ? "🎒 in pack" : "🎒 place in pack"}</button>
        ) : physical && meetsReq(cat, ch) ? (
          (it.equipped || it.inPack !== false) ? (
            <>
              {it.equipped
                ? <button className="dg-equip on" onClick={() => dispatch({ type: "TOGGLE_EQUIPPED", itemId: it.id, by: accountId })}>★ equipped</button>
                : (equipBlocked || unverified)
                  ? <span className="dg-equipflag">⚑ {unverified ? "verify first" : legendaryBlocked ? "not until Tier 4" : slotFull ? ((SLOT_LABEL[slot] || "slot") + " slot full") : "attunement full"}</span>
                  : <button className="dg-equip" onClick={() => dispatch({ type: "TOGGLE_EQUIPPED", itemId: it.id, by: accountId })}>☆ equip</button>}
              {attuneReq(cat) && !unverified && (it.equipped
                ? <span className="dg-attuned" title="Equipped — assumed attuned">✦ attuned</span>
                : <button className={"dg-attunebtn" + (it.attuned ? " on" : "")} disabled={attuneBlocked} title={attuneBlocked ? "All 3 attunement slots are in use" : ""} onClick={() => dispatch({ type: "TOGGLE_ATTUNED", itemId: it.id, by: accountId })}>{it.attuned ? "✦ attuned" : "○ attune"}</button>)}
              {!it.available && <button className="dg-carrytoggle on" title={"Carried — counts toward your limit. Tap to leave it at " + stashWhere + "."} onClick={() => dispatch({ type: "TOGGLE_CARRIED", itemId: it.id, by: accountId })}>🎒 carried</button>}
              {(it as any).bookItem && (
                <span className="dg-muted sm"><i>{(it as any).notes}</i>{(it as any).wikiUrl && <> <a className="dg-linklike" href={(it as any).wikiUrl} target="_blank" rel="noreferrer">🔗 wiki</a></>}</span>
              )}
              {(it as any).charmItem && (it as any).charmDesc && !charmEdit && (
                <span className="dg-muted sm"><i>{(it as any).charmDesc}</i>{ch && ch.ownerId === accountId && <button className="dg-linklike" title="Write your own description — 240 characters, flavor only" onClick={() => { setCharmTxt((it as any).charmDesc || ""); setCharmEdit(true); }}> ✎</button>}</span>
              )}
              {(it as any).charmItem && charmEdit && (
                <span className="dg-charminscribe">
                  <input className="dg-input sm" maxLength={240} value={charmTxt} onChange={(e) => setCharmTxt(e.target.value)} placeholder="what does it look like?" />
                  <button className="dg-linklike" onClick={() => { dispatch({ type: "SET_CHARM_DESC", itemId: it.id, by: accountId, desc: charmTxt }); setCharmEdit(false); }}>save</button>
                  <button className="dg-linklike" onClick={() => setCharmEdit(false)}>cancel</button>
                </span>
              )}
              {(it as any).charmItem && (it as any).charmState === "LIVE" && ch && ch.ownerId === accountId && (
                (it as any).pendingGift
                  ? <button className="dg-carrytoggle" title="The offer is in escrow — frozen, unclaimed. Tap to withdraw it." onClick={() => dispatch({ type: "DECLINE_CHARM_GIFT", itemId: it.id, by: accountId })}>↩ withdraw gift ({(state.characters[(it as any).pendingGift.toCharId] || {}).name || "…"})</button>
                  : (() => {
                      // Frank's ordering (25 Jul): every player profile populates the list, and the
                      // accounts you have ACTUALLY interacted with float to the top. A sort, not a
                      // gate — findability stays emergent; this only saves the scroll.
                      const known = new Set([accountId]);
                      (state.sessions || []).forEach((ss: any) => { const ids = (ss.signups || []).map((u: any) => u.accountId).concat(ss.dmId ? [ss.dmId] : []); if (ids.includes(accountId)) ids.forEach((a: string) => known.add(a)); });
                      (state.trades || []).forEach((tr: any) => { const oa = tr.a && state.characters[tr.a.charId], ob = tr.b && state.characters[tr.b.charId]; if (oa && ob && (oa.ownerId === accountId || ob.ownerId === accountId)) { known.add(oa.ownerId); known.add(ob.ownerId); } });
                      (state.threads || []).forEach((t: any) => { if ((t.participants || []).includes(accountId)) (t.participants || []).forEach((a: string) => known.add(a)); });
                      Object.entries(state.mentors || {}).forEach(([dm, m]: any) => { if (dm === accountId) known.add(m); if (m === accountId) known.add(dm); });
                      const alive = Object.values(state.characters).filter((c) => c.id !== ch.id && !c.retired && c.status !== "dead");
                      const byName = (a: any, b: any) => a.name.localeCompare(b.name);
                      const mine = alive.filter((c) => c.ownerId === accountId).sort(byName);
                      const met = alive.filter((c) => c.ownerId !== accountId && known.has(c.ownerId)).sort(byName);
                      const rest = alive.filter((c) => c.ownerId !== accountId && !known.has(c.ownerId)).sort(byName);
                      return (
                        <select className="dg-charmgift" value="" title="Gift-only, by ruling. It does not age in escrow — they should accept just before sitting down at a table." onChange={(e) => { if (e.target.value) dispatch({ type: "OFFER_CHARM_GIFT", itemId: it.id, toCharId: e.target.value, by: accountId }); }}>
                          <option value="">✹ gift to…</option>
                          {mine.length > 0 && <optgroup label="Your characters">{mine.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>}
                          {met.length > 0 && <optgroup label="People you've played, traded, or talked with">{met.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>}
                          {rest.length > 0 && <optgroup label="Everyone else">{rest.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>}
                        </select>
                      );
                    })()
              )}
            </>
          ) : (            <button className="dg-carrytoggle" title={"Left at " + stashWhere + " — doesn't count toward your limit. Tap to bring it."} onClick={() => dispatch({ type: "TOGGLE_CARRIED", itemId: it.id, by: accountId })}>{stashLabel}</button>
          )
        ) : (ch && ch.ownerId === accountId && !it.available) ? (
          (it.equipped || it.inPack !== false)
            ? <button className="dg-carrytoggle on" title={"Carried. Tap to leave it at " + stashWhere + "."} onClick={() => dispatch({ type: "TOGGLE_CARRIED", itemId: it.id, by: accountId })}>🎒 carried</button>
            : <button className="dg-carrytoggle" title={"Left at " + stashWhere + ". Tap to bring it."} onClick={() => dispatch({ type: "TOGGLE_CARRIED", itemId: it.id, by: accountId })}>{stashLabel}</button>
        ) : null}
        {unverified && (
          reviewThread
            ? <span className="dg-authpending" title="Under review in Messages">⏳ under review — see Messages</span>
            : <button className="dg-authbtn" onClick={() => setModal({ kind: "reqauth", itemId: it.id })}>request authentication</button>
        )}
        {isEventCert && !it.equipped && !it.attuned && <button className="dg-attunebtn" title="Return this event award to your shelf" onClick={() => dispatch({ type: "UNASSIGN_CERT", itemId: it.id, by: accountId })}>↩ to shelf</button>}
        {notTradeable && <span className="dg-locked" title="Not tradeable">⛉ not tradeable</span>}
        {physical && it.holder.type === "CHARACTER" && ch && ch.ownerId === accountId && !it.escrow && !it.pendingDisposal && (
          <button className="dg-releasebtn" title="If this item left play — destroyed, lost, given away, or sold — record it so it comes off the sheet" onClick={() => setModal({ kind: "disposal", itemId: it.id })}>↩ release…</button>
        )}
      </div>
      {it.provenance.state === "UNVERIFIED" && (
        <div className="dg-clawback dg-clawback-full">Unverified — pending verification. May be removed if found invalid.</div>
      )}
      {physical && !meetsReq(cat, ch) && !it.pendingDisposal && (
        <div className="dg-reqline">
          <span className="dg-reqlock" title="This character can't use this item">⚠ Requires {cat.req.text}</span>
        </div>
      )}
      {it.pendingDisposal && (
        <div className="dg-pendingrelease dg-clawback-full">⏳ Release requested{disposalEntry && disposalEntry.dmId ? " — " + accName(disposalEntry.dmId) + " is reviewing" : ""}. This item stays on your roster until the DM approves; if they decline, it simply stays. Nothing to chase down.</div>
      )}
    </div>
  );
}

export function FavorsSection({ ch, dispatch, accountId }: { dispatch: React.Dispatch<Action>; ch: CharacterRecord; [k: string]: any }) {
  const favors = ch.favors || [];
  const owner = ch.ownerId === accountId;
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("rare-gear");
  const [desc, setDesc] = useState("");
  const [value, setValue] = useState("");
  const [adv, setAdv] = useState("");
  if (!favors.length && !owner) return null;
  const add = () => {
    if (!desc.trim()) return;
    dispatch({ type: "ADD_FAVOR", charId: ch.id, by: accountId, favor: { kind, desc, value, fromAdventure: adv } });
    setDesc(""); setValue(""); setAdv(""); setKind("rare-gear"); setOpen(false);
  };
  return (
    <div className="dg-gifts">
      <div className="dg-gifts-h"><span>Favors</span>{owner && <button className="dg-linkbtn" onClick={() => setOpen(!open)}>{open ? "Cancel" : "+ Add"}</button>}</div>
      {favors.length === 0 ? <div className="dg-muted sm">None yet — Favors are granted to the party by your DM (Rare gear, a paid debt, lodging, or spellcasting up to 500 GP).</div> :
        favors.map((f) => (
          <div key={f.id} className={"dg-favorrow" + (f.active === false ? " faded" : "")}>
            <div className="dg-favorline"><span className="dg-favorkind">{FAVOR_KINDS[f.kind] || "Favor"}</span><span className="dg-favordesc">{f.desc}{f.value ? " · " + f.value + " GP" : ""}{f.active === false ? " · faded" : ""}</span></div>
            {f.fromAdventure && <div className="dg-muted sm">from {f.fromAdventure}</div>}
            {owner && <div className="dg-favoractions">
              {FAVOR_FADES[f.kind] && <button className="dg-linkbtn" title="Favors fade if you leave an incomplete adventure or the giver's domain" onClick={() => dispatch({ type: "TOGGLE_FAVOR_FADED", charId: ch.id, by: accountId, favorId: f.id })}>{f.active === false ? "Restore" : "Mark faded"}</button>}
              <button className="dg-linkbtn" onClick={() => dispatch({ type: "REMOVE_FAVOR", charId: ch.id, by: accountId, favorId: f.id })}>Remove</button>
            </div>}
          </div>
        ))}
      {open && owner && (
        <div className="dg-favoradd">
          <select value={kind} onChange={(e) => setKind(e.target.value)}>{Object.entries(FAVOR_KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What the favor is" />
          {(kind === "spellcasting" || kind === "paid-debt" || kind === "rare-gear") && <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder={kind === "spellcasting" ? "GP value (≤500)" : "GP value (optional)"} />}
          <input value={adv} onChange={(e) => setAdv(e.target.value)} placeholder="From which adventure (optional)" />
          <button className="dg-btn sm" disabled={!desc.trim()} onClick={add}>Add favor</button>
        </div>
      )}
    </div>
  );
}

export function FriendsSection({ ch, dispatch, accountId }: { dispatch: React.Dispatch<Action>; ch: CharacterRecord; [k: string]: any }) {
  const friends = ch.friends || [];
  const owner = ch.ownerId === accountId;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [adv, setAdv] = useState("");
  const [note, setNote] = useState("");
  if (!friends.length && !owner) return null;
  const add = () => {
    if (!name.trim()) return;
    dispatch({ type: "ADD_FRIEND", charId: ch.id, by: accountId, friend: { name, adventure: adv, note } });
    setName(""); setAdv(""); setNote(""); setOpen(false);
  };
  return (
    <div className="dg-gifts">
      <div className="dg-gifts-h"><span>Friends</span>{owner && <button className="dg-linkbtn" onClick={() => setOpen(!open)}>{open ? "Cancel" : "+ Add"}</button>}</div>
      {friends.length === 0 ? <div className="dg-muted sm">None yet — an NPC you've befriended in play. Only one character per party may befriend a given NPC; no stat block.</div> :
        friends.map((f) => (
          <div key={f.id} className="dg-favorrow">
            <div className="dg-favorline"><span className="dg-favorkind">🤝 Friend</span><span className="dg-favordesc">{f.name}{f.adventure ? " · " + f.adventure : ""}</span></div>
            {f.note && <div className="dg-muted sm">{f.note}</div>}
            {owner && <div className="dg-favoractions"><button className="dg-linkbtn" onClick={() => dispatch({ type: "REMOVE_FRIEND", charId: ch.id, by: accountId, friendId: f.id })}>Remove</button></div>}
          </div>
        ))}
      {open && owner && (
        <div className="dg-favoradd">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="The NPC's name" />
          <input value={adv} onChange={(e) => setAdv(e.target.value)} placeholder="From which adventure (optional)" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="A note (optional)" />
          <button className="dg-btn sm" disabled={!name.trim()} onClick={add}>Add friend</button>
        </div>
      )}
    </div>
  );
}

export function Wishlist({ ch, dispatch, setModal, accountId }: { dispatch: React.Dispatch<Action>; ch: CharacterRecord; [k: string]: any }) {
  return (
    <div className="dg-wish">
      <div className="dg-wish-head">
        <div className="dg-wish-h">Wish list</div>
        <button className="dg-addwish" onClick={() => setModal({ kind: "wish", charId: ch.id })}>+ Add</button>
      </div>
      {ch.wishlist.length === 0 ? (
        <div className="dg-muted sm">Nothing wanted yet — add items {ch.name} is looking for and the market will hunt for matches.</div>
      ) : ch.wishlist.map((w) => (
        <div key={w.id} className="dg-wish-item">
          <span className="dg-wish-dot" />
          <span className="dg-wish-txt">{describeWish(w)}</span>
          <button className="dg-wish-x" title="Remove from wish list" onClick={() => dispatch({ type: "REMOVE_WISH", charId: ch.id, wishId: w.id, by: accountId })}>×</button>
        </div>
      ))}
    </div>
  );
}

export function describeWish(w) {
  if (w.mode === "SPECIFIC") return catName(w.catalogId) + (w.acceptVariants ? " (or a variant)" : "");
  const d = w.desired;
  return [d.rarity && RARITY[d.rarity].label, d.itemType, ...(d.tags || [])].filter(Boolean).join(" · ");
}

export function classLabel(c) {
  return { MAGIC_ITEM: "magic item", EVENT_CERT: "event certificate", UNNAMED_CERT: "blank certificate", UNTRADEABLE: "untradeable", STORY_ITEM: "story item", GEAR: "gear" }[c] || c;
}

export function itemClassLabel(catalogId, itemClass) { return isMundaneCat(catalogId) ? "gear" : classLabel(itemClass); }

// A bastion roll can owe a character a TYPE of item rather than a named one - the Exchange
// ships no licensed item text. Until the player fills it from their own books, the slot sits
// here, unmissable, on the character it belongs to.
export function OwedSlots({ state, charId, accountId, setModal }: { state: AppState; [k: string]: any }) {
  const slots = Object.values(state.itemSlots || {}).filter((sl: any) =>
    sl.charId === charId && sl.status === "UNFILLED");
  if (!slots.length) return null;
  return (
    <div className="dg-l5pack" style={{ marginTop: 6 }}>
      <div className="dg-l5pack-h">
        {slots.length === 1 ? "An item you haven't claimed yet" : slots.length + " items you haven't claimed yet"}
      </div>
      {slots.map((sl: any) => (
        <div key={sl.id} className="dg-admin-row">
          <span className="dg-muted sm">
            {sl.label || [sl.rarity, sl.cat, sl.sub].filter(Boolean).join(" · ")}
            {sl.roll ? " (rolled " + sl.roll + ")" : ""}
          </span>
          <button className="dg-btn sm" onClick={() => setModal({ kind: "itementry", context: "slot", charId, slotId: sl.id })}>
            Fill it in
          </button>
        </div>
      ))}
      <div className="dg-muted sm" style={{ marginTop: 4 }}>
        Choose something from your own books that fits, and a DM will check it.
      </div>
    </div>
  );
}

export function holderName(state: AppState, it) {
  if (it.holder.type === "CHARACTER") return state.characters[it.holder.id]?.name;
  return accName(it.holder.id) + " (shelf)";
}

// ================================================================================================
// ScrollPicker — the shared spell-scroll frame. Two modes, one component:
//   mode="buy"     the merchant. Every spell at the level (SPELLS_BY_LEVEL). Dispatches BUY_SCROLL.
//   mode="scribe"  the workbench. Only spells on the character's class list (scribableByLevel).
//                  Dispatches SCRIBE_SCROLL. Requires the toolkit — the caller only mounts it then.
// The flow is the one the owner specified: pick a LEVEL, then pick a SPELL from the dropdown
// pre-populated for that level; the price falls out of the level (SCROLL_COST) and the button mints.
export function ScrollPicker({ ch, mode, accountId, dispatch }: { dispatch: React.Dispatch<Action>; ch: CharacterRecord; [k: string]: any }) {
  const byLevel = mode === "scribe" ? scribableByLevel(ch) : SPELLS_BY_LEVEL;
  const levels = Object.keys(byLevel).map(Number).sort((a, b) => a - b);
  const [level, setLevel] = useState(levels[0] != null ? levels[0] : 0);
  const spellsAtLevel = (byLevel[level] || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  const [spellId, setSpellId] = useState(spellsAtLevel[0] ? spellsAtLevel[0].id : "");
  // keep the selected spell valid when the level changes
  const onLevel = (lv) => { setLevel(lv); const first = (byLevel[lv] || [])[0]; setSpellId(first ? first.id : ""); };

  // scribe on a character who can cast nothing (Fighter/Rogue) — say so, don't show an empty box
  if (mode === "scribe" && levels.length === 0) {
    return <div className="dg-muted sm">{ch.name} has no spells to scribe — a scroll can only carry a spell from the scriber's own class list.</div>;
  }
  const cost = SCROLL_COST[level] ? SCROLL_COST[level].gp : 0;
  const days = SCROLL_COST[level] ? SCROLL_COST[level].days : 0;
  const levelLabel = (lv) => (lv === 0 ? "Cantrip" : "Level " + lv);
  const enough = (ch.gp || 0) >= cost && (mode === "buy" || (ch.dt || 0) >= days);
  const act = () => {
    if (!spellId) return;
    dispatch({ type: mode === "scribe" ? "SCRIBE_SCROLL" : "BUY_SCROLL", charId: ch.id, by: accountId, spellId });
  };
  return (
    <div className="dg-scrollpicker">
      <div className="dg-selrow">
        <label className="dg-muted sm">Level
          <select value={level} onChange={(e) => onLevel(Number(e.target.value))}>
            {levels.map((lv) => <option key={lv} value={lv}>{levelLabel(lv)}</option>)}
          </select>
        </label>
        <label className="dg-muted sm">Spell
          <select value={spellId} onChange={(e) => setSpellId(e.target.value)}>
            {spellsAtLevel.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
          </select>
        </label>
      </div>
      <div className="dg-muted sm">
        {mode === "scribe"
          ? <>Scribing costs <b>{cost} gp</b> and <b>{days} day{days !== 1 ? "s" : ""}</b>. The scroll is character-made — it counts toward the carry limit and can't be sold.</>
          : <>A scribed scroll from a merchant costs <b>{cost} gp</b>. It's a magic item — tradeable, and it counts toward the carry limit.</>}
      </div>
      {!enough && <div className="dg-muted sm" style={{ color: "var(--maroon)" }}>
        {mode === "scribe" && (ch.dt || 0) < days ? "Not enough downtime — scribing a level " + level + " scroll takes " + days + " days." : "Not enough gold on hand."}
      </div>}
      <button className="dg-btn sm" disabled={!spellId || !enough} onClick={act}>
        {mode === "scribe" ? "Scribe" : "Buy"} {spellsAtLevel.find((sp) => sp.id === spellId) ? "\u201C" + spellsAtLevel.find((sp) => sp.id === spellId).name + "\u201D" : "scroll"} — {cost} gp
      </button>
    </div>
  );
}

export function StatRow({ k, v }: { [k: string]: any }) { return <div className="dg-statrow"><span className="dg-statk">{k}</span><span className="dg-statv">{v}</span></div>; }

export function attuneReq(cat) {
  if (!cat.attune) return null;
  return typeof cat.attune === "string" ? "requires attunement " + cat.attune : "requires attunement";
}

// ---------------------- small pieces ----------------------
export function Seal({ prov, isEvent, review }: { [k: string]: any }) {
  if (review && review.flagged) return <div className="dg-seal review" title={"Under review — " + review.reason}>⚑</div>;
  if (prov.state === "UNVERIFIED") return <div className="dg-seal pending" title="Unverified — pending">?</div>;
  return <div className={"dg-seal" + (isEvent ? " admin" : "")} title={isEvent ? "Event award — verified" : "Earned in play — verified"}>✓</div>;
}



export function activeListings(state: AppState) { return (state.moduleListings || []).filter((l) => !l.retracted); }


// ============================================================================
// SHARED UI PRIMITIVES.
// The small presentational pieces every feature package needs: empty states,
// section headings, rarity styling, avatars, stored-image access.
// Sits below the feature UI packages so they can all import it without importing
// one another.
// ============================================================================

import React, { useState } from "react";

export const RARITY = {
  common:    { label: "Common",    tier: 0, color: "#7a736a" },
  uncommon:  { label: "Uncommon",  tier: 1, color: "#3f7d46" },
  rare:      { label: "Rare",      tier: 2, color: "#2a5d9e" },
  very_rare: { label: "Very Rare", tier: 3, color: "#7b3fa0" },
  legendary: { label: "Legendary", tier: 4, color: "#c8791a" },
  unique:    { label: "Unique",    tier: 9, color: "#8a1c2b" },
};

export function Avatar({ src, size = 40 }) {
  const url = getBlob(src);   // src may be a blob handle — resolve to the real bytes
  if (url) return <img src={url} alt="" className="dg-avatar" style={{ width: size, height: size }} />;
  return (
    <span className="dg-avatar silhouette" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size * 0.7} height={size * 0.7}><circle cx="12" cy="8" r="4" fill="currentColor" /><path d="M4 21v-1c0-3.4 3.6-5 8-5s8 1.6 8 5v1z" fill="currentColor" /></svg>
    </span>
  );
}

export function getBlob(handle) {        // tolerates a raw data URL so local previews still render
  if (!handle) return null;
  if (typeof handle === "string" && !handle.startsWith("blob_")) return handle;
  return BLOBS.get(handle) || null;
}

export function SectionHead({ eyebrow, title, note }: { [k: string]: any }) {
  return (
    <div className="dg-sechead">
      <div className="dg-eyebrow">{eyebrow}</div>
      <h2 className="dg-h2">{title}</h2>
      {note && <p className="dg-note">{note}</p>}
    </div>
  );
}

export function Empty({ title, body }: { [k: string]: any }) {
  return <div className="dg-empty"><div className="dg-empty-t">{title}</div><div className="dg-empty-b">{body}</div></div>;
}

// ---------------------- styles ----------------------

// ---------------------------------------------------------------------------
// PUSH REPORT MODAL
//
// One component, two audiences, because the job is identical: a checklist you work down with
// another browser tab open. Neither D&D Beyond nor Warhorn accepts a write from anything, so
// this is the handover point between what the Exchange knows and what a human has to re-type.
//
// Deliberately plain. It is read while doing something else.
// ---------------------------------------------------------------------------
export function PushReportModal({ modal, state, dispatch, accountId, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const mode = modal.mode === "scheduler" ? "scheduler" : "player";
  const [done, setDone] = useState<Record<string, boolean>>({});

  if (mode === "scheduler") {
    const orgId = modal.orgId;
    const rows = schedulerPushReport(state, orgId);
    const push = (r) => dispatch({ type: "MARK_WARHORN_PUSHED", key: r.key, sig: r.sig, by: accountId } as any);
    return (
      <div className="dg-confirmmodal">
        <div className="dg-confirm-title">Warhorn push report</div>
        <div className="dg-confirm-body">
          {!rows.length ? (
            <p>Warhorn is up to date. Nothing on this organisation's calendar has changed since it was last pushed.</p>
          ) : (
            <>
              <p className="dg-muted sm">
                {rows.length} change{rows.length === 1 ? "" : "s"} to enter on Warhorn. Open Warhorn beside this and
                tick each line as you go — ticking records it as pushed, so it will not come back.
              </p>
              {rows.map((r) => (
                <div key={r.key} className="dg-admin-row">
                  <span>
                    <span className={"dg-tag " + (r.kind === "cancel" || r.kind === "drop" ? "danger" : "")}>{r.kind}</span>{" "}
                    {r.label}
                    {r.detail ? <div className="dg-muted sm">{r.detail}</div> : null}
                  </span>
                  <button className="dg-btn sm" onClick={() => push(r)}>Done on Warhorn</button>
                </div>
              ))}
              <div className="dg-row-actions" style={{ marginTop: 10 }}>
                <button className="dg-btn ghost sm" onClick={() => rows.forEach(push)}>Mark all pushed</button>
              </div>
            </>
          )}
        </div>
        <div className="dg-row-actions" style={{ marginTop: 14 }}>
          <button className="dg-btn" onClick={close}>Close</button>
        </div>
      </div>
    );
  }

  const rep = playerPushReport(state, accountId);
  const ack = () => { dispatch({ type: "ACK_PUSH_REPORT", accountId, by: accountId } as any); close(); };
  return (
    <div className="dg-confirmmodal">
      <div className="dg-confirm-title">Character sheet push report</div>
      <div className="dg-confirm-body">
        {!rep.count ? (
          <p>Nothing to copy across. Your sheet matches what the Exchange has recorded.</p>
        ) : (
          <>
            <p className="dg-muted sm">
              These changes happened here and have <b>not</b> been made on your character sheet. D&amp;D Beyond has no
              way to accept them from us, so they have to be entered by hand — do it before you next sit at a table.
            </p>
            {rep.blocks.map((b) => (
              <div key={b.char.id} className="dg-card">
                <div className="dg-card-h"><div>
                  <span className="dg-item-name">{b.char.name}</span>
                  <div className="dg-item-sub">
                    level {b.target.level} · {b.char.race} {b.char.cls}
                    {b.ddb ? <> · <a href={b.ddb} target="_blank" rel="noreferrer">open the sheet</a></> : null}
                  </div>
                </div></div>
                {b.lines.map((l, i) => {
                  const k = b.char.id + ":" + i;
                  return (
                    <label key={k} className="dg-admin-row" style={{ cursor: "pointer" }}>
                      <span style={{ opacity: done[k] ? 0.45 : 1, textDecoration: done[k] ? "line-through" : "none" }}>
                        <input type="checkbox" checked={!!done[k]} onChange={() => setDone((p) => ({ ...p, [k]: !p[k] }))} />{" "}
                        {l.text}
                        {l.pending ? <span className="dg-tag" style={{ marginLeft: 6 }}>awaiting a DM</span> : null}
                        {l.detail ? <div className="dg-muted sm" style={{ marginLeft: 22 }}>{l.detail}</div> : null}
                      </span>
                    </label>
                  );
                })}
                {/* The target matters more than the list. Lose your place halfway down and this
                    still gets the sheet right. */}
                <div className="dg-muted sm" style={{ marginTop: 6 }}>
                  <b>When you are finished the sheet should read:</b> {b.target.gp} gp · {b.target.dt} downtime days ·
                  level {b.target.level}{b.target.lifestyle ? " · " + b.target.lifestyle + " lifestyle" : ""}
                </div>
                {b.pending ? (
                  <div className="dg-muted sm">
                    {b.pending} line{b.pending === 1 ? " is" : "s are"} still waiting on a DM. Copy {b.pending === 1 ? "it" : "them"} once approved.
                  </div>
                ) : null}
              </div>
            ))}
          </>
        )}
      </div>
      <div className="dg-row-actions" style={{ marginTop: 14 }}>
        {rep.count ? <button className="dg-btn" onClick={ack}>My sheet is updated</button> : null}
        <button className="dg-btn ghost" onClick={close}>{rep.count ? "Later" : "Close"}</button>
      </div>
    </div>
  );
}
