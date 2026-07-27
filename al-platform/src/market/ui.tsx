import { TOOL_CRAFTS } from "../lib/rules";
import { ACCOUNTS, accName } from "../lib/core";
import { StatRow, attuneReq, labelSource } from "../lib/ui";
import { carriedCraftTools, meetsReq, provOf, toolSpecials } from "../lib/rules";

import { CATALOG } from "../data/catalog";
import { MARKET, MARKET_BY_ID, MARKET_CATS } from "../lib/rules";
import { ScrollPicker, coinsFromGp } from "../lib/ui";
import type { Action, AppState, ItemRecord } from "../types";
import { Empty, RARITY, Seal, SectionHead } from "../lib/ui";
import { canTradeAcct, isFirearm, isTradeableClass, itemsInOpenTrades, matchWish } from "../lib/rules";
import { catName, itemCat } from "../lib/core";

// Does a craft rule match this tool/item pairing?
// Resolve a {category, except} rule to the mundane catalogue ids it covers. A rule is a LIVE query,
// not a frozen list: Smith's "any Melee weapon except Club/Greatclub/Quarterstaff/Whip" is matched
// against the catalogue at call time, so a weapon row added tomorrow is craftable tomorrow. The
// `mundane` guard is load-bearing — it keeps a magic item (Flame Tongue, category "Weapon (any
// sword)") from being swept into "any melee weapon". A smith makes mundane steel, not artifacts.
export function craftRuleMatches(rule) {
  const cat = (rule.category || "").toLowerCase();
  const except = new Set((rule.except || []).map((x) => x.toLowerCase()));
  return Object.values(CATALOG).filter((it) =>
    it.mundane &&
    !(it as any).awardOnly &&   // Q16: award-only rows (firearms, poisons) are never craftable
    (it.category || "").toLowerCase().includes(cat) &&
    !except.has((it.name || "").toLowerCase())
  ).map((it) => it.id);
}



// Whether an item class may be released.
// Whether an item may leave a roster via a logged, DM-approved disposal. Default yes; the catalogue marks bound/cursed items (whose own text forbids it) as disposable:false.
export function catDisposable(cat) { return !cat || cat.disposable !== false; }



// What a workbench can craft.
// Everything a tool can make, as catalogue ids: its explicit items plus every id its rules resolve
// to, de-duplicated. Does NOT include `special` outputs (scroll/potion) — those mint through their
// own frame, not the gear catalogue, and are surfaced separately by toolSpecials().
//
// Q16 (Frank, 26 Jul): the award-only filter sits HERE, at the one place both halves converge,
// rather than only inside craftRuleMatches. That placement is deliberate and was earned — the
// harness caught `g_musket` sitting in Tinker's Tools' hand-written `items` list, which a
// rules-only guard sailed straight past. A structural gate has to cover the hand-written half too,
// or it only guards the door somebody already remembered to lock.
export function craftItemsFor(toolId) {
  const t = TOOL_CRAFTS[toolId];
  if (!t) return [];
  const ids = new Set<string>(t.items || []);
  (t.rules || []).forEach((r) => craftRuleMatches(r).forEach((id) => ids.add(id)));
  return [...ids].filter((id) => !(CATALOG[id] || {}).awardOnly);
}


// ============================================================================
// MARKET UI - listings, matching, and trades in flight.
// The market floor: what is on offer, who wants what, near-misses worth a nudge,
// and the trade proposals currently open.
// ============================================================================

import React, { useState, useMemo } from "react";

// forgiving marketplace search: AND across terms, case-insensitive substring over every meaningful field (incl. tags/props)
export function itemMatchesQuery(cat, q) {
  if (!q || !q.trim()) return true;
  const hay = [cat.name, cat.category, cat.itemType, (cat.props || []).join(" "), cat.adventure, (RARITY[cat.rarity] || {}).label, cat.rarity, cat.desc, cat.attune ? "attunement attune" : "", cat.srd ? "srd" : "", cat.variant ? "variant" : ""].filter(Boolean).join(" ").toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((t) => hay.includes(t));
}

export function MarketView({ state, accountId, dispatch, setModal }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const [rarity, setRarity] = useState("all");
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const player = state.players[accountId];
  const myCharIds = player ? player.characterIds : [];

  const matches = useMemo(() => findMatches(state, myCharIds).filter((m) => canTradeAcct(state, m.theirChar.ownerId)), [state, myCharIds.join()]);
  const messagedItems = useMemo(() => {
    const set = new Set();
    (state.threads || []).forEach((th) => { if (th.participants.includes(accountId)) th.messages.forEach((msg) => { if (msg.from === accountId && msg.aboutItem) set.add(msg.aboutItem); }); });
    return set;
  }, [state.threads, accountId]);
  const soft = useMemo(() => findSoftMatches(state, myCharIds).filter((m) => canTradeAcct(state, m.theirChar.ownerId)), [state, myCharIds.join()]);
  const interest = useMemo(() => findInterest(state, myCharIds).filter((m) => canTradeAcct(state, m.wanterAccount)), [state, myCharIds.join()]);

  // browse: every magic item other adventurers have marked available (excluding suspended holders and items under review)
  const available = Object.values(state.items).filter((it) => it.available && isTradeableClass(it.itemClass) && !isFirearm(it.catalogId) && it.holder.type === "CHARACTER" && !(it.review && it.review.flagged) && state.characters[it.holder.id] && canTradeAcct(state, state.characters[it.holder.id].ownerId));
  const types = [...new Set(available.map((it) => (itemCat(it) || {}).itemType).filter(Boolean))].sort();
  const rarities = [...new Set(available.map((it) => (itemCat(it) || {}).rarity).filter(Boolean))].sort((a, b) => (RARITY[a] ? RARITY[a].tier : 99) - (RARITY[b] ? RARITY[b].tier : 99));
  const shown = available.filter((it) => {
    const cat = itemCat(it); if (!cat) return false;
    return (rarity === "all" || cat.rarity === rarity) && (typeFilter === "all" || cat.itemType === typeFilter) && itemMatchesQuery(cat, q);
  });

  return (
    <div className="dg-stack">
      <SectionHead eyebrow="Exchange" title="The Market" note="Items other adventurers have marked available. Anything matching your characters' wish lists rises to the top." />

      {matches.length > 0 && (
        <div className="dg-matchband">
          <div className="dg-match-h">✦ {matches.length === 1 ? "There is a match available" : `There are ${matches.length} matches available`}</div>
          {matches.map((m) => (
            <div key={m.myItem.id + m.theirItem.id} className="dg-match">
              <span><b>{itemCat(m.theirItem).name}</b> ({m.theirChar.name}) fills {m.myChar.name}'s wish list</span>
              <span className="dg-swap">⇄</span>
              <span>your <b>{itemCat(m.myItem).name}</b> ({m.myChar.name})</span>
              <button className="dg-btn sm" onClick={() => setModal({ kind: "trade-propose", mine: { byCharId: m.myChar.id, itemId: m.myItem.id }, theirs: { byCharId: m.theirChar.id, itemId: m.theirItem.id } })}>Propose trade</button>
            </div>
          ))}
        </div>
      )}

      {soft.length > 0 && (
        <div className="dg-softband">
          <div className="dg-soft-h">⚑ On your wish list — not yet offered</div>
          <p className="dg-muted sm">These match a character's wish list but their holder hasn't marked them for trade. You could reach out and ask.</p>
          {soft.map((m) => (
            <div className="dg-soft" key={m.myChar.id + m.theirItem.id}>
              <button className="dg-item-name link" onClick={() => setModal({ kind: "inspect", itemId: m.theirItem.id })}>{itemCat(m.theirItem).name}</button>
              <span className="dg-muted sm">held by {m.theirChar.name} · matches {m.myChar.name}'s wish list</span>
              {messagedItems.has(m.theirItem.id)
                ? <span className="dg-awaitflag sm" title="You've asked the holder — continue in Messages">✓ asked · awaiting reply</span>
                : <button className="dg-btn sm" onClick={() => setModal({ kind: "message", to: m.theirChar.ownerId, item: itemCat(m.theirItem).name, holder: m.theirChar.name, itemId: m.theirItem.id })}>Message holder</button>}
            </div>
          ))}
        </div>
      )}

      {interest.length > 0 && (
        <div className="dg-interestband">
          <div className="dg-interest-h">◆ Wanted by others — items you're not using</div>
          <p className="dg-muted sm">Someone's wish list matches an item of yours that you haven't equipped or offered. Mark it available, or reach out to them.</p>
          {interest.map((m) => (
            <div className="dg-interest" key={m.myItem.id + m.wanterChar.id}>
              <button className="dg-item-name link" onClick={() => setModal({ kind: "inspect", itemId: m.myItem.id })}>{itemCat(m.myItem).name}</button>
              <span className="dg-muted sm">your {m.myChar.name}'s · wanted by {m.wanterChar.name}</span>
              <span className="dg-interest-actions">
                <button className="dg-btn sm" onClick={() => dispatch({ type: "TOGGLE_AVAILABLE", itemId: m.myItem.id, by: accountId })}>Mark available</button>
                <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "message", to: m.wanterAccount, item: itemCat(m.myItem).name, wanterChar: m.wanterChar.name, offering: true })}>Message {m.wanterChar.name}</button>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="dg-marketsearch">
        <input className="dg-searchbar" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the market — name, type, tag (e.g. fire), rarity, adventure…" />
        {q && <button className="dg-searchclear" title="Clear" onClick={() => setQ("")}>×</button>}
      </div>

      {types.length > 0 && (
        <div className="dg-filters">
          <button className={"dg-filter" + (typeFilter === "all" ? " on" : "")} onClick={() => setTypeFilter("all")}>All types</button>
          {types.map((t) => (
            <button key={t} className={"dg-filter" + (typeFilter === t ? " on" : "")} onClick={() => setTypeFilter(typeFilter === t ? "all" : t)}>{t}</button>
          ))}
        </div>
      )}

      {rarities.length > 0 && (
        <div className="dg-filters">
          <button className={"dg-filter" + (rarity === "all" ? " on" : "")} onClick={() => setRarity("all")}>All rarities</button>
          {rarities.map((r) => (
            <button key={r} className={"dg-filter" + (rarity === r ? " on" : "")} style={{ "--rarity": RARITY[r].color }} onClick={() => setRarity(rarity === r ? "all" : r)}>{RARITY[r].label}</button>
          ))}
        </div>
      )}

      {(q || typeFilter !== "all" || rarity !== "all") && <div className="dg-muted sm" style={{ marginTop: -4 }}>{shown.length} of {available.length} item{available.length === 1 ? "" : "s"} match{shown.length === 1 ? "es" : ""}.{(q || typeFilter !== "all" || rarity !== "all") && <button className="dg-linkbtn" style={{ marginLeft: 6 }} onClick={() => { setQ(""); setTypeFilter("all"); setRarity("all"); }}>Clear filters</button>}</div>}

      <div className="dg-grid">
        {shown.length === 0 ? <Empty title={q || typeFilter !== "all" || rarity !== "all" ? "Nothing on the table matches" : "The stalls stand empty"} body={q || typeFilter !== "all" || rarity !== "all" ? "Try a broader search or clear the filters." : "No relics are laid out. Set one on the table from a character's roster."} /> :
          shown.map((it) => <ListingCard key={it.id} it={it} state={state} setModal={setModal} accountId={accountId} onTag={(t) => setQ(t)} />)}
      </div>

      <PendingTrades state={state} accountId={accountId} dispatch={dispatch} />
    </div>
  );
}

export function findMatches(state: AppState, myCharIds) {
  const out: any[] = [];
  const inTrade = itemsInOpenTrades(state);
  const avail = Object.values(state.items).filter((it) => it.available && isTradeableClass(it.itemClass) && !isFirearm(it.catalogId) && !it.escrow && !inTrade.has(it.id) && it.holder.type === "CHARACTER");
  const mineItems = avail.filter((it) => myCharIds.includes(it.holder.id));
  const theirItems = avail.filter((it) => !myCharIds.includes(it.holder.id));
  mineItems.forEach((mIt) => {
    const myCh = state.characters[mIt.holder.id];
    theirItems.forEach((tIt) => {
      const theirCh = state.characters[tIt.holder.id];
      const mCat = itemCat(mIt), tCat = itemCat(tIt);
      if (mIt.campaign !== tIt.campaign) return;      // same campaign
      if (mCat.rarity !== tCat.rarity) return;        // equal rarity
      const iWantTheirs = myCh.wishlist.some((w) => w.status === "OPEN" && matchWish(w, tIt));
      const theyWantMine = theirCh.wishlist.some((w) => w.status === "OPEN" && matchWish(w, mIt));
      if (iWantTheirs && theyWantMine) out.push({ myItem: mIt, myChar: myCh, theirItem: tIt, theirChar: theirCh });
    });
  });
  return out;
}

// Items that satisfy a character's wish list but their holder hasn't marked available.
export function findSoftMatches(state: AppState, myCharIds) {
  const out: any[] = [];
  const seen = new Set();
  const inTrade = itemsInOpenTrades(state);
  const others = Object.values(state.items).filter((it) => isTradeableClass(it.itemClass) && it.holder.type === "CHARACTER" && !myCharIds.includes(it.holder.id) && !it.available && !it.equipped && !it.escrow && !it._lost && !inTrade.has(it.id));
  myCharIds.forEach((cid) => {
    const ch = state.characters[cid];
    ch.wishlist.filter((w) => w.status === "OPEN").forEach((w) => {
      others.forEach((it) => {
        if (it.campaign !== ch.campaign) return;
        if (!matchWish(w, it)) return;
        const key = cid + it.id;
        if (seen.has(key)) return;
        seen.add(key);
        out.push({ myChar: ch, theirItem: it, theirChar: state.characters[it.holder.id] });
      });
    });
  });
  return out;
}

// Other players whose wish list matches an item you hold but aren't using (not equipped, not offered).
export function findInterest(state: AppState, myCharIds) {
  const out: any[] = [];
  const seen = new Set();
  const inTrade = itemsInOpenTrades(state);
  const myItems = Object.values(state.items).filter((it) => isTradeableClass(it.itemClass) && it.holder.type === "CHARACTER" && myCharIds.includes(it.holder.id) && !it.equipped && !it.available && !it.escrow && !it._lost && !inTrade.has(it.id));
  myItems.forEach((it) => {
    Object.values(state.characters).forEach((ch) => {
      if (myCharIds.includes(ch.id)) return;
      if (ch.campaign !== it.campaign) return;
      if (!ch.wishlist.some((w) => w.status === "OPEN" && matchWish(w, it))) return;
      const key = it.id + ch.id;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ myItem: it, myChar: state.characters[it.holder.id], wanterChar: ch, wanterAccount: ch.ownerId });
    });
  });
  return out;
}

export function ListingCard({ it, state, setModal, accountId, onTag }: { state: AppState; it: ItemRecord; [k: string]: any }) {
  const cat = itemCat(it);
  const ch = state.characters[it.holder.id];
  const isMine = ch && ch.ownerId === accountId;
  const tags = [cat.itemType, ...(cat.props || [])].filter((t, i, a) => t && a.indexOf(t) === i).slice(0, 4);
  return (
    <div className="dg-card item" style={{ "--rarity": RARITY[cat.rarity].color }}>
      <div className="dg-card-h">
        <div>
          <button className="dg-item-name link" onClick={() => setModal({ kind: "inspect", itemId: it.id })}>{cat.name}</button>
          <div className="dg-item-sub"><span className="dg-rarity" style={{ color: RARITY[cat.rarity].color }}>{RARITY[cat.rarity].label}</span>
            <span className="dg-dot">·</span>{ch.name} · {it.campaign}</div>
        </div>
        <Seal prov={it.provenance} isEvent={it.itemClass === "EVENT_CERT"} review={it.review} />
      </div>
      {tags.length > 0 && (
        <div className="dg-tagrow">
          {tags.map((t) => <button key={t} className="dg-tag" title={onTag ? "Filter the market by " + t : t} onClick={onTag ? () => onTag(t) : undefined}>{t}</button>)}
          {cat.attune && <span className="dg-tag attune" title="Requires attunement">attunement</span>}
        </div>
      )}
      <div className="dg-availtag">available for trade</div>
      {it.provenance.state === "UNVERIFIED" && <div className="dg-clawback">Unverified — may be removed if found invalid.</div>}
      {isMine
        ? <div className="dg-mine-tag">your listing</div>
        : <button className="dg-btn ghost sm full" onClick={() => setModal({ kind: "message", to: ch.ownerId, item: cat.name, holder: ch.name })}>Message {ch.name}'s player</button>}
    </div>
  );
}

export function PendingTrades({ state, accountId, dispatch }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const player = state.players[accountId];
  if (!player) return null;
  const mine = player.characterIds;
  const valid = (t) => state.items[t.a.itemId] && state.items[t.b.itemId] && state.characters[t.a.charId] && state.characters[t.b.charId];
  const pend = state.trades.filter((t) => t.status === "PROPOSED" && valid(t) && (mine.includes(t.a.charId) || mine.includes(t.b.charId)));
  if (!pend.length) return null;
  const incoming = pend.filter((t) => mine.includes(t.b.charId));                          // proposed TO me — my move
  const outgoing = pend.filter((t) => mine.includes(t.a.charId) && !mine.includes(t.b.charId)); // I proposed — awaiting their reply
  const line = (tr) => (
    <div className="dg-trade-line">
      <b>{state.characters[tr.a.charId].name}</b> offers {catName(state.items[tr.a.itemId].catalogId)}
      <span className="dg-swap">⇄</span>
      <b>{state.characters[tr.b.charId].name}</b> offers {catName(state.items[tr.b.itemId].catalogId)}
    </div>
  );
  return (
    <div className="dg-stack">
      {incoming.length > 0 && (<>
        <SectionHead eyebrow="Your move" title="Trade offers to answer" />
        {incoming.map((tr) => (
          <div key={tr.id} className="dg-card">
            <TradeSteps status={tr.status} />
            {line(tr)}
            <div className="dg-trade-note">Settling debits 5 DT from each side and swaps the items with their provenance.</div>
            <div className="dg-row-actions">
              <button className="dg-btn" onClick={() => dispatch({ type: "CONFIRM_TRADE", id: tr.id })}>Confirm &amp; settle</button>
              <button className="dg-btn ghost" onClick={() => dispatch({ type: "CANCEL_TRADE", id: tr.id })}>Decline</button>
            </div>
          </div>
        ))}
      </>)}
      {outgoing.length > 0 && (<>
        <SectionHead eyebrow="Sent" title="Awaiting reply" note="Proposals you've sent. The item is held in escrow until the other player answers — you can cancel to release it." />
        {outgoing.map((tr) => (
          <div key={tr.id} className="dg-card">
            <TradeSteps status={tr.status} />
            {line(tr)}
            <div className="dg-row-actions">
              <span className="dg-awaitflag">⏳ Awaiting {state.characters[tr.b.charId].name}'s player</span>
              <button className="dg-btn ghost" onClick={() => dispatch({ type: "CANCEL_TRADE", id: tr.id })}>Cancel proposal</button>
            </div>
          </div>
        ))}
      </>)}
    </div>
  );
}

export function TradeSteps({ status }) {
  const steps = ["Proposed", "Escrowed", "Settled"];
  // A pending (PROPOSED) trade holds both items in escrow while it waits for the other party —
  // so a live proposal sits at the Escrowed stage; only a completed trade reaches Settled.
  const idx = status === "SETTLED" ? 2 : 1;
  return (
    <div className="dg-steps">
      {steps.map((st, i) => (
        <div key={st} className={"dg-step" + (i <= idx ? " on" : "")}>{st.toLowerCase()}</div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Market modals - listing an item and recording a wish.
// ---------------------------------------------------------------------------

export function MarketModal({ modal, state, dispatch, accountId, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const ch = state.characters[modal.charId];
  const [cat, setCat] = useState(modal.currency === "gp" ? "mundane" : "advancement");
  const [cart, setCart] = useState<any[]>([]);
  if (!ch) return (<><h3 className="dg-modal-h">Character not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  const defaultNote = (m) => {
    const made = CATALOG[m.mint] ? CATALOG[m.mint].name : m.name;
    if (m.output === "level") return `${ch.name} spent downtime training to reach level ${(ch.level || 1) + 1}.`;
    if (m.output === "service") return `${ch.name} paid ${m.gp} gp for ${m.name}.`;
    if (m.cat === "crafting") return `${ch.name} spent ${m.dt} day${m.dt !== 1 ? "s" : ""} crafting ${made}.`;
    if (m.output === "item") return `${ch.name} bought ${made}.`;
    if (m.id.startsWith("adv_copy")) return `${ch.name} spent downtime copying a spell into their book.`;
    return `${ch.name}: ${m.name}.`;
  };
  const add = (m) => setCart((c) => [...c, { uid: "c" + Date.now() + Math.random(), id: m.id, note: defaultNote(m), qty: 1 }]);
  const setNote = (uid, v) => setCart((c) => c.map((x) => x.uid === uid ? { ...x, note: v } : x));
  const bump = (uid, d) => setCart((c) => c.map((x) => x.uid === uid ? { ...x, qty: Math.max(1, x.qty + d) } : x));
  const remove = (uid) => setCart((c) => c.filter((x) => x.uid !== uid));
  const totalDt = cart.reduce((s, c) => s + (MARKET_BY_ID[c.id].dt || 0) * c.qty, 0);
  const totalGp = cart.reduce((s, c) => s + (MARKET_BY_ID[c.id].gp || 0) * c.qty, 0);
  const remDt = (ch.dt || 0) - totalDt, remGp = (ch.gp || 0) - totalGp;
  const over = remDt < 0 || remGp < 0;
  const checkout = () => { dispatch({ type: "CHECKOUT_MARKET", charId: ch.id, by: accountId, lines: cart.map((c) => ({ id: c.id, note: c.note, qty: c.qty })) }); close(); };
  const list = MARKET.filter((m) => m.cat === cat);
  const cost = (m, mult?) => [m.dt ? (m.dt * (mult || 1)) + " DT" : null, m.gp ? (m.gp * (mult || 1)) + " GP" : null].filter(Boolean).join(" + ") || "free";
  return (
    <div className="dg-market">
      <h3 className="dg-modal-h">The Market — {ch.name}</h3>
      <p className="dg-muted sm">Plan {ch.name}'s downtime and spending, then check out. Each line becomes a self-logged entry on their sheet. On hand: <b>{ch.dt} DT</b> · {(() => { const c = coinsFromGp(ch.gp || 0); return <b title={(ch.gp || 0).toFixed(2) + " gp"}>{c.gp} gp · {c.sp} sp · {c.cp} cp</b>; })()}.</p>
      <div className="dg-catlabel">Browse by category — tap one:</div>
      <div className="dg-rarityfilter">{MARKET_CATS.map(([id, label]) => <button key={id} className={"dg-rarpill" + (cat === id ? " on" : "")} onClick={() => setCat(id)}>{label}</button>)}</div>
      <div className="dg-insp-sec">Available</div>
      {cat === "consumables" && (
        <div className="dg-admin-row" style={{ display: "block" }}>
          <b>Spell Scroll — any spell</b>
          <div className="dg-muted sm" style={{ marginBottom: 6 }}>Buy a scroll of any spell at a merchant. Pick the level, then the spell; the price is set by the spell's level.</div>
          <ScrollPicker ch={ch} mode="buy" accountId={accountId} dispatch={dispatch} />
        </div>
      )}
      {list.map((m) => (
        <div key={m.id} className="dg-admin-row">
          <span>
            <b>{m.name}</b>{m.sample ? <span className="dg-samplebadge"> sample price</span> : ""}
            <span className="dg-muted sm"> · {cost(m)}</span>
            {m.prereq && <div className="dg-muted sm">Prereq: {m.prereq}</div>}
            {m.note && <div className="dg-muted sm">{m.note}</div>}
          </span>
          <button className="dg-btn ghost sm" onClick={() => add(m)}>+ Add</button>
        </div>
      ))}
      <div className="dg-insp-sec">Your cart {cart.length > 0 && <span className="dg-badge">{cart.length}</span>}</div>
      {cart.length === 0 ? <div className="dg-muted sm">Nothing in the cart yet — add activities above to plan a downtime spend.</div> : cart.map((c) => {
        const m = MARKET_BY_ID[c.id];
        return (
          <div key={c.uid} className="dg-cartline">
            <div className="dg-cartline-h"><b>{m.name}</b> <span className="dg-muted sm">{cost(m, c.qty)}</span>
              <div className="dg-qtyrow"><button className="dg-btn ghost sm" onClick={() => bump(c.uid, -1)}>−</button><span>×{c.qty}</span><button className="dg-btn ghost sm" onClick={() => bump(c.uid, 1)}>+</button><button className="dg-linkbtn" onClick={() => remove(c.uid)}>remove</button></div>
            </div>
            <input className="dg-cartnote" type="text" value={c.note} onChange={(e) => setNote(c.uid, e.target.value)} placeholder="Note for the log entry" />
          </div>
        );
      })}
      <div className="dg-carttotals">
        <div className={remDt < 0 ? "neg" : ""}>Downtime: {totalDt} DT · {remDt} left</div>
        <div className={remGp < 0 ? "neg" : ""}>Gold: {totalGp} GP · {remGp} left</div>
      </div>
      {over && <div className="dg-muted sm" style={{ color: "var(--maroon)" }}>Over budget — remove items or reduce quantities before checking out.</div>}
      <div className="dg-row-actions">
        <button className="dg-btn" disabled={cart.length === 0 || over} onClick={checkout}>Check out</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </div>
  );
}

// ---------------------- Wish builder ----------------------
export function WishModal({ modal, dispatch, close, accountId }) {
  const [mode, setMode] = useState("PROPERTY");
  const [catId, setCatId] = useState("flametongue");
  const [acceptVar, setAcceptVar] = useState(true);
  const [rarity, setRarity] = useState("rare");
  const [itemType, setItemType] = useState("weapon");
  const [tags, setTags] = useState<Record<string, any>>({});
  const allTags = ["fire", "finesse", "stealth", "+1", "nature", "movement", "storage", "arcane"];
  const toggle = (t) => setTags((x) => ({ ...x, [t]: !x[t] }));
  const submit = () => {
    if (mode === "SPECIFIC") dispatch({ type: "ADD_WISH", charId: modal.charId, mode: "SPECIFIC", catalogId: catId, acceptVariants: acceptVar, by: accountId });
    else dispatch({ type: "ADD_WISH", charId: modal.charId, mode: "PROPERTY", desired: { rarity, itemType, tags: Object.keys(tags).filter((t) => tags[t]) }, by: accountId });
    close();
  };
  return (
    <>
      <h3 className="dg-modal-h">Add to wish list</h3>
      <div className="dg-modeswitch">
        <button className={"dg-modebtn" + (mode === "PROPERTY" ? " on" : "")} onClick={() => setMode("PROPERTY")}>By properties</button>
        <button className={"dg-modebtn" + (mode === "SPECIFIC" ? " on" : "")} onClick={() => setMode("SPECIFIC")}>A specific item</button>
      </div>
      {mode === "SPECIFIC" ? (
        <>
          <label className="dg-field"><span>Item wanted</span>
            <select value={catId} onChange={(e) => setCatId(e.target.value)}>
              {Object.values(CATALOG).map((c) => <option key={c.id} value={c.id}>{c.name} · {RARITY[c.rarity].label}</option>)}
            </select>
          </label>
          <label className="dg-check"><input type="checkbox" checked={acceptVar} onChange={(e) => setAcceptVar(e.target.checked)} /> Also accept adventure variants of this item</label>
        </>
      ) : (
        <>
          <label className="dg-field"><span>Rarity</span>
            <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
              {["common", "uncommon", "rare", "very_rare", "legendary"].map((r) => <option key={r} value={r}>{RARITY[r].label}</option>)}
            </select>
          </label>
          <label className="dg-field"><span>Item type</span>
            <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
              {["weapon", "wondrous", "wand", "staff", "armor"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <div className="dg-field"><span>Properties (optional)</span>
            <div className="dg-tagpick">
              {allTags.map((t) => <button key={t} className={"dg-tag" + (tags[t] ? " on" : "")} onClick={() => toggle(t)}>{t}</button>)}
            </div>
          </div>
        </>
      )}
      <p className="dg-muted sm">The market auto-matches this against what other players offer — equal rarity, same campaign, and a mutual want.</p>
      <div className="dg-row-actions">
        <button className="dg-btn" onClick={submit}>Add to wish list</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Item-side modals: proposing a trade, releasing an item, requesting authentication, the workbench, and item inspection.
// ---------------------------------------------------------------------------

// The workbench — character-side crafting, gated on carrying the toolkit. Same TOOL_CRAFTS spine a
// bastion facility will read; here the gate is "it's in your pack." One frame per toolkit held,
// each showing what that tool can make: its mundane items, and any `special` frame (scrolls today).
export function WorkbenchModal({ modal, state, dispatch, accountId, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const ch = state.characters[modal.charId];
  if (!ch) return (<><h3 className="dg-modal-h">Character not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  const tools = carriedCraftTools(state, ch.id);
  return (
    <div className="dg-market">
      <h3 className="dg-modal-h">The Workbench — {ch.name}</h3>
      <p className="dg-muted sm">Craft with the tools in {ch.name}'s pack. Character-made items are logged on their sheet, count toward the carry limit, and can't be sold. On hand: <b>{ch.dt} DT</b> · {(() => { const c = coinsFromGp(ch.gp || 0); return <b title={(ch.gp || 0).toFixed(2) + " gp"}>{c.gp} gp · {c.sp} sp · {c.cp} cp</b>; })()}.</p>
      {tools.length === 0 && <div className="dg-muted sm">No toolkit in the pack. Carry an artisan's tool to craft with it.</div>}
      {tools.map((tid: any) => {
        const tool = CATALOG[tid || ""];
        const specials = toolSpecials(tid);
        const itemIds = craftItemsFor(tid);
        return (
          <div key={tid}>
            <div className="dg-insp-sec">{tool ? tool.name : tid}</div>
            {specials.includes("scroll") && (
              <div className="dg-admin-row" style={{ display: "block" }}>
                <b>Scribe a Spell Scroll</b>
                <div className="dg-muted sm" style={{ marginBottom: 6 }}>Only spells on {ch.name}'s own class list can be scribed. Pick a level, then a spell.</div>
                <ScrollPicker ch={ch} mode="scribe" accountId={accountId} dispatch={dispatch} />
              </div>
            )}
            {itemIds.length > 0 && (
              <div className="dg-muted sm" style={{ marginTop: 4 }}>
                This tool can also make: {itemIds.map((id: any) => (CATALOG[id] || {}).name).filter(Boolean).sort().slice(0, 12).join(", ")}{itemIds.length > 12 ? ", …" : ""}. <span style={{ fontStyle: "italic" }}>(Item crafting from the workbench is coming next — scrolls first.)</span>
              </div>
            )}
          </div>
        );
      })}
      <div className="dg-row-actions">
        <button className="dg-btn ghost" onClick={close}>Close</button>
      </div>
    </div>
  );
}

export function DisposalModal({ modal, state, dispatch, accountId, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const it = state.items[modal.itemId];
  const [explanation, setExplanation] = useState("");
  const [dmId, setDmId] = useState("");
  if (!it) return (<><h3 className="dg-modal-h">Item not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  const cat = itemCat(it);
  const ch = it.holder.type === "CHARACTER" ? state.characters[it.holder.id] : null;
  const dms = ACCOUNTS.filter((a) => (state.roles[a.id] || []).includes("dm") && provOf(state, a.id) === "certified");
  const bound = !catDisposable(cat);
  return (
    <>
      <h3 className="dg-modal-h">Release {cat.name}</h3>
      <p className="dg-muted sm">Say what became of it — sold, given away, lost, or destroyed in play (disintegrated, dissolved in acid, and so on). A DM records it on {ch ? ch.name + "'s" : "the"} log; nothing leaves a sheet without a name attached. Permanent magic items can't be sold for gold under AL, but they can pass out of play by any of these routes.</p>
      {bound && <div className="dg-reqbanner unmet" style={{ marginBottom: 8 }}>By its own nature this item can't be sold, given away, or traded — it can only leave through <b>loss or destruction in play</b>. Describe what happened; your DM decides.</div>}
      <label className="dg-field"><span>What happened to it?</span>
        <textarea rows={3} value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder={bound ? "e.g. Shattered by the beholder's disintegration ray · lost when the tomb collapsed" : "e.g. Gave it to the temple of Tyr · dissolved in a black pudding · sold in Neverwinter"} />
      </label>
      <label className="dg-field"><span>DM to vouch the disposal</span>
        <select value={dmId} onChange={(e) => setDmId(e.target.value)}>
          <option value="">Choose a DM…</option>
          {dms.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </label>
      {dms.length === 0 && <p className="dg-muted sm">No certified DMs are available to vouch right now.</p>}
      <div className="dg-row-actions">
        <button className="dg-btn" disabled={!explanation.trim() || !dmId} onClick={() => { dispatch({ type: "SUBMIT_DISPOSAL", itemId: it.id, by: accountId, dmId, explanation: explanation.trim() }); close(); }}>Submit for DM approval</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

export function ReqAuthModal({ modal, state, dispatch, accountId, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const it = state.items[modal.itemId];
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<any>(null);
  if (!it) return (<><h3 className="dg-modal-h">Item not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  const cat = itemCat(it);
  const isEvent = it.itemClass === "EVENT_CERT";
  const logDm = it.origin && it.origin.dmId;
  const dmHasProfile = logDm && (state.roles[logDm] || []).includes("dm");
  const target = isEvent ? "the Guild admin" : (dmHasProfile ? accName(logDm) : "the Guild admin");
  const pick = (e) => { const f = (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files![0]; if (!f) return; const r = new FileReader(); r.onload = () => setPhoto(r.result); r.readAsDataURL(f); };
  return (
    <>
      <h3 className="dg-modal-h">Request authentication</h3>
      <p className="dg-muted sm">This sends <b>{cat.name}</b> to {target} to verify. Attach a photo of the physical certificate and add any context that helps.</p>
      <label className="dg-field"><span>Note for the reviewer (optional)</span><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Where/how you earned it, DM name, session date…" /></label>
      <div className="dg-field"><span>Certificate photo (optional)</span>
        {photo && <img className="dg-certfull" src={photo} alt="certificate" />}
        <label className="dg-photobtn2">{photo ? "Replace photo" : "📷 Upload photo"}<input type="file" accept="image/*" style={{ display: "none" }} onChange={pick} /></label>
      </div>
      <div className="dg-row-actions">
        <button className="dg-btn" onClick={() => { dispatch({ type: "REQUEST_AUTH", itemId: it.id, requester: accountId, note: note.trim(), photo, by: accountId }); close(); }}>Send request</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

export function ProposeModal({ modal, state, dispatch, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const mineIt = state.items[modal.mine.itemId];
  const theirsIt = state.items[modal.theirs.itemId];
  return (
    <>
      <h3 className="dg-modal-h">Propose this trade</h3>
      <div className="dg-swapbox">
        <div className="dg-swapcol"><div className="dg-swaplabel">You give</div><div className="dg-swapitem" style={{ "--rarity": RARITY[itemCat(mineIt).rarity].color }}>{catName(mineIt.catalogId)}</div></div>
        <div className="dg-swap">⇄</div>
        <div className="dg-swapcol"><div className="dg-swaplabel">You receive</div><div className="dg-swapitem" style={{ "--rarity": RARITY[itemCat(theirsIt).rarity].color }}>{catName(theirsIt.catalogId)}</div></div>
      </div>
      <p className="dg-muted sm">Both sides must confirm. Nothing moves until the other player accepts; then 5 DT is debited from each and the items swap atomically.</p>
      <div className="dg-row-actions">
        <button className="dg-btn" onClick={() => { dispatch({ type: "PROPOSE_TRADE", a: { charId: modal.mine.byCharId, itemId: modal.mine.itemId }, b: { charId: modal.theirs.byCharId, itemId: modal.theirs.itemId } }); close(); }}>Send proposal</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

// ---------------------- Item inspector ----------------------
export function InspectModal({ modal, state, close, setModal, accountId }: { state: AppState; [k: string]: any }) {
  const it = state.items[modal.itemId];
  if (!it) return (
    <>
      <h3 className="dg-modal-h">Item not found</h3>
      <p className="dg-muted sm">This item was erased by an invalidation and no longer exists.</p>
      <div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div>
    </>
  );
  const cat = itemCat(it);
  const rc = RARITY[cat.rarity].color;
  const holderName = it.holder.type === "CHARACTER" ? (state.characters[it.holder.id]?.name || "—") : accName(it.holder.id) + " (shelf)";
  const timesTraded = it.lineage.filter((l) => (l.note || "").startsWith("Traded")).length;
  const prov = it.provenance;
  const req = attuneReq(cat);
  return (
    <div className="dg-inspect" style={{ "--rarity": rc }}>
      <div className="dg-insp-head">
        <div className="dg-insp-name" style={{ color: rc }}>{cat.name}{cat.variant && <span className="dg-variant">adventure variant</span>}</div>
        <div className="dg-insp-type">{cat.category} · <span style={{ color: rc }}>{RARITY[cat.rarity].label}</span>{req ? " · " + req : ""}</div>
      </div>

      {req && (
        <div className={"dg-attune-banner" + (it.attuned ? " on" : "")}>
          <span>{req}</span>
          <span className="dg-attune-state">{it.attuned ? `Attuned to ${it.holder.type === "CHARACTER" ? (state.characters[it.holder.id]?.name || "—") : "—"}` : "Not attuned"}</span>
        </div>
      )}
      {cat.req && (
        <div className={"dg-reqbanner" + (it.holder.type === "CHARACTER" && !meetsReq(cat, state.characters[it.holder.id]) ? " unmet" : "")}>
          Restricted to {cat.req.text}{it.holder.type === "CHARACTER" ? (meetsReq(cat, state.characters[it.holder.id]) ? " — this character qualifies." : " — this character can't equip or attune it.") : "."}
        </div>
      )}

      <div className="dg-insp-stats">
        {cat.damage && <StatRow k="Damage" v={cat.damage} />}
        {cat.damageType && <StatRow k="Damage type" v={cat.damageType} />}
        {cat.charges && <StatRow k="Charges" v={String(cat.charges)} />}
        {cat.weight && <StatRow k="Weight" v={cat.weight} />}
      </div>

      {cat.desc && <div className="dg-insp-desc">{cat.desc}</div>}
      {cat.traits && cat.traits.length > 0 && (
        <ul className="dg-insp-traits">{cat.traits.map((t, i) => <li key={i}>{t}</li>)}</ul>
      )}

      <div className="dg-insp-sec">Provenance</div>
      <div className="dg-insp-stats">
        <StatRow k="Verification" v={it.review && it.review.flagged ? "Under review — " + it.review.reason : prov.state === "VERIFIED" ? `Verified · ${labelSource(prov.source)}${prov.by ? " · " + prov.by : ""}` : "Unverified — pending"} />
        {it.origin && <StatRow k="Origin" v={it.origin.adventure} />}
        {cat.variant && <StatRow k="Source adventure" v={cat.adventure} />}
        <StatRow k="Current holder" v={holderName} />
        <StatRow k="Times traded" v={String(timesTraded)} />
      </div>

      <div className="dg-insp-sec">Chain of custody</div>
      <ol className="dg-lineage">
        {it.lineage.map((l, i) => (
          <li key={i}><b>{l.holder}</b> — {l.note}{l.adventure ? " · " + l.adventure : ""}</li>
        ))}
      </ol>

      <div className="dg-srd">{cat.srd ? "Rules text: SRD 5.2 · CC BY 4.0" : "Custom / adventure item"}</div>
      {(() => {
        const owned = it.holder.type === "CHARACTER" && state.characters[it.holder.id] && state.characters[it.holder.id].ownerId === accountId;
        if (!owned || !setModal) return null;
        if (it.pendingDisposal) return <div className="dg-pendingrelease" style={{ marginTop: 10 }}>⏳ Release already requested — a DM is reviewing. It stays until they approve.</div>;
        if (it.escrow) return <div className="dg-muted sm" style={{ marginTop: 10 }}>This item is in an open trade — cancel the trade before releasing it.</div>;
        return (
          <div style={{ marginTop: 10 }}>
            <div className="dg-muted sm" style={{ marginBottom: 6 }}>If this item left play — destroyed, lost, given away, or sold — record it so it comes off {state.characters[it.holder.id].name}'s sheet.</div>
            <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "disposal", itemId: it.id })}>↩ Release this item…</button>
          </div>
        );
      })()}
      <div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div>
    </div>
  );
}// Reducer action registry. Belongs beside the reducer, not in a feature package - it reads the


