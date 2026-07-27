import { ACCOUNTS, accName, catName } from "../lib/core";
import type { Action, AppState } from "../types";
import { Avatar, RulesLinks, SectionHead, StoreChip, holderName } from "../lib/ui";
import { distinctFlaggers, openFlagsFor, storeName } from "../lib/play";
import { isDeactivated, isSuspended, storesOf } from "../lib/rules";
// ============================================================================
// ADMIN UI - the guildmaster's desk.
// Oversight across the whole platform: accounts under review, DM certification and
// mentor searches, store and organisation requests, the Warhorn import panel.
// Nothing here is reachable without the admin role - see isAdmin in lib/rules.
// ============================================================================

import React, { useState } from "react";

export function MentorSearchBtn({ state, dispatch, accountId, candidate }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const stores = storesOf(state, candidate);
  const [store, setStore] = useState(stores[0]);
  const active = (state.polls || []).some((p) => p.kind === "mentor-search" && !p.forwarded && p.meta && p.meta.candidate === candidate);
  const offered = (state.mentorOffers || []).some((o) => o.candidate === candidate);
  if (active) return <span className="dg-muted sm">Mentor search in progress</span>;
  if (offered) return <span className="dg-muted sm">Options sent to player</span>;
  return (
    <>
      {stores.length > 1 && <select value={store} onChange={(e) => setStore(e.target.value)}>{stores.map((sid) => <option key={sid} value={sid}>{storeName(state, sid)}</option>)}</select>}
      <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "START_MENTOR_SEARCH", candidate, storeId: store, by: accountId })}>Find a shadow mentor</button>
    </>
  );
}

export function underReview(state: AppState, acct) {
  const m = state.mod || {};
  const rep = (m.reports || []).some((r) => r.sender === acct);
  return rep || (m.warnings && m.warnings[acct] > 0) || isSuspended(state, acct) || isDeactivated(state, acct);
}

export function WarhornImportPanel({ state, dispatch, accountId }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const [txt, setTxt] = useState("");
  const [err, setErr] = useState("");
  const sample = JSON.stringify({ tables: [
    { system: "D&D Adventurers League", adventure: "DDEX01-01 Defiance in Phlan", code: "ddex01-01a", datetime: "2026-08-20T18:00", store: "Dungeons & Javas", gm: "Wren of the Wood", capacity: 6, players: [{ name: "Aldric", email: "" }, { name: "Jane Newcomer", email: "jane@example.com" }] },
    { system: "Pathfinder Society", adventure: "PFS 1-01", datetime: "2026-08-20T18:00", store: "Dungeons & Javas", players: [{ name: "Someone Else" }] },
  ] }, null, 2);
  const run = () => {
    setErr("");
    let parsed;
    try { parsed = JSON.parse(txt); } catch (e) { setErr("That isn't valid JSON. Paste the Warhorn response (or the { tables: [...] } shape)."); return; }
    const tables = Array.isArray(parsed) ? parsed : (parsed.tables || []);
    if (!tables.length) { setErr("No tables found in that data."); return; }
    dispatch({ type: "IMPORT_WARHORN", by: accountId, tables });
  };
  const r = state.lastWarhornSync;
  return (
    <div className="dg-panel">
      <div className="dg-panel-h">↧ Import from Warhorn <span className="dg-muted sm">— read-only</span></div>
      <div className="dg-muted sm" style={{ marginBottom: 8 }}>Pulls games from Warhorn into the schedule for stores in your registry. Only <b>Adventurers League</b> tables are imported; a table already on the schedule is updated, not duplicated. Warhorn players are matched to Exchange accounts by email then name — anyone not found gets a lightweight stub so their seat shows as taken under their Warhorn name.</div>
      <label className="dg-field"><span>Warhorn data (JSON)</span><textarea rows={5} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder='{ "tables": [ { "system": "D&D Adventurers League", … } ] }' /></label>
      {err && <div className="dg-muted sm" style={{ color: "var(--maroon)" }}>{err}</div>}
      <div className="dg-row-actions">
        <button className="dg-btn" disabled={!txt.trim()} onClick={run}>Import AL tables</button>
        <button className="dg-btn ghost sm" onClick={() => setTxt(sample)}>Load sample</button>
      </div>
      {r && (
        <div className="dg-suggestbanner" style={{ marginTop: 8 }}>
          <b>Last import · {r.at}</b>
          <div className="dg-muted sm" style={{ marginTop: 4 }}>{r.tablesImported} table{r.tablesImported !== 1 ? "s" : ""} imported · {r.tablesUpdated} updated · {r.seatsFilled} seat{r.seatsFilled !== 1 ? "s" : ""} filled · {r.stubsCreated} stub{r.stubsCreated !== 1 ? "s" : ""} created.</div>
          {r.skippedNonAL > 0 && <div className="dg-muted sm">Skipped {r.skippedNonAL} non-AL table{r.skippedNonAL !== 1 ? "s" : ""}.</div>}
          {r.unmatchedStore > 0 && <div className="dg-muted sm">{r.unmatchedStore} table{r.unmatchedStore !== 1 ? "s" : ""} at unknown store{r.unmatchedStore !== 1 ? "s" : ""}: {(r.unmatchedStoreNames || []).join(", ")}. Add the store to the registry to import these.</div>}
          {r.unmatchedAdv > 0 && <div className="dg-muted sm">{r.unmatchedAdv} table{r.unmatchedAdv !== 1 ? "s" : ""} whose adventure couldn't be matched to the catalogue.</div>}
        </div>
      )}
    </div>
  );
}

export function AdminView({ state, dispatch, setModal, accountId, setTab }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const unverified = Object.values(state.items).filter((it) => it.provenance.state === "UNVERIFIED");
  const traded = state.trades.filter((t) => t.status === "SETTLED");
  const adminTickets = state.threads.filter((t) => t.ticket && t.ticket.status === "PENDING" && t.ticket.reviewer === "acc_admin");
  return (
    <div className="dg-stack">
      <SectionHead eyebrow="Guild admin" title="Guild administration" note="Approve Dungeon Masters, authenticate items, and manage records — admin-only functions." />

      <WarhornImportPanel state={state} dispatch={dispatch} accountId={accountId} />

      <div className="dg-panel">
        <div className="dg-panel-h">User approvals</div>
        <div className="dg-muted sm" style={{ marginBottom: 8 }}>Dungeon Master requests</div>
        {state.dmRequests.length === 0 ? <div className="dg-muted sm">No pending Dungeon Master requests.</div> :
          state.dmRequests.map((id) => {
            const rev = underReview(state, id);
            return (
              <div key={id} className="dg-admin-row">
                <span>{accName(id)} — requesting Dungeon Master status</span>
                <span className="dg-row-actions">
                  {rev ? <span className="dg-muted sm">Under review — resolve first</span> : <button className="dg-btn sm" onClick={() => dispatch({ type: "APPROVE_DM", by: accountId, accountId: id })}>Approve as DM</button>}
                  {!rev && <MentorSearchBtn state={state} dispatch={dispatch} accountId={accountId} candidate={id} />}
                  <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "DENY_DM", accountId: id })}>Deny</button>
                </span>
              </div>
            );
          })}
        {(() => {
          const searches = (state.polls || []).filter((p) => p.kind === "mentor-search" && !p.forwarded);
          if (!searches.length) return null;
          return (
            <>
              <div className="dg-muted sm" style={{ margin: "12px 0 8px" }}>Active shadow-mentor searches</div>
              {searches.map((p) => {
                const willing = p.recipients.filter((r) => p.responses[r] === "yes");
                const answered = Object.keys(p.responses).length;
                const pending = p.recipients.length - answered;
                return (
                  <div key={p.id} className="dg-card">
                    <div className="dg-item-name">{p.meta.candidateName} · {storeName(state, p.storeId)}</div>
                    <div className="dg-muted sm">Willing: {willing.length ? willing.map(accName).join(", ") : "none yet"} · {pending > 0 ? pending + " DM" + (pending !== 1 ? "s" : "") + " still to answer" : "all answered"}</div>
                    <div className="dg-row-actions">
                      <button className="dg-btn sm" onClick={() => dispatch({ type: "FORWARD_MENTORS", pollId: p.id })}>{willing.length ? "Forward " + willing.length + " willing to " + p.meta.candidateName : "Close — no mentors available"}</button>
                    </div>
                  </div>
                );
              })}
            </>
          );
        })()}

        {(state.provRequests || []).length > 0 && (
          <>
            <div className="dg-muted sm" style={{ margin: "12px 0 8px" }}>Provisional DM pipeline (mentor-recommended)</div>
            {(state.provRequests || []).map((req) => (
              <div key={req.id} className="dg-admin-row">
                <span><b>{accName(req.candidate)}</b> — {accName(req.mentor)} {req.kind === "to-certified" ? "vouches they're ready to run a table alone" : "vouches they're ready to run a shadowed table"}</span>
                <span className="dg-row-actions">
                  {req.kind === "to-certified"
                    ? <button className="dg-btn sm" onClick={() => dispatch({ type: "APPROVE_CERTIFICATION", requestId: req.id })}>Certify as full DM</button>
                    : <button className="dg-btn sm" onClick={() => dispatch({ type: "APPROVE_PROVISIONAL", requestId: req.id })}>Promote to provisional DM</button>}
                  <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "DISMISS_PROV_REQUEST", requestId: req.id })}>Dismiss</button>
                </span>
              </div>
            ))}
          </>
        )}
        {(state.mentorSwaps || []).length > 0 && (
          <>
            <div className="dg-muted sm" style={{ margin: "12px 0 8px" }}>Provisional DMs needing a new mentor</div>
            {(state.mentorSwaps || []).map((w) => {
              const active = (state.polls || []).some((p) => p.kind === "mentor-search" && !p.forwarded && p.meta && p.meta.candidate === w.candidate);
              const offered = (state.mentorOffers || []).some((o) => o.candidate === w.candidate);
              return (
                <div key={w.id} className="dg-admin-row">
                  <span><b>{accName(w.candidate)}</b> — 3 "not ready" reviews with {accName(w.oldMentor)}. Find them fresh eyes.</span>
                  <span className="dg-row-actions">
                    {active ? <span className="dg-muted sm">Search in progress</span> : offered ? <span className="dg-muted sm">Options sent</span> : <button className="dg-btn sm" onClick={() => dispatch({ type: "START_MENTOR_SEARCH", candidate: w.candidate, storeId: w.storeId, by: accountId, swap: true, excludeExtra: [w.oldMentor] })}>Find a new mentor</button>}
                    <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "DISMISS_SWAP", id: w.id })}>Dismiss</button>
                  </span>
                </div>
              );
            })}
          </>
        )}

        <div className="dg-muted sm" style={{ margin: "12px 0 8px" }}>Under review</div>
        {(() => {
          const reviewed = ACCOUNTS.filter((a) => underReview(state, a.id));
          if (!reviewed.length) return <div className="dg-muted sm">No players under review.</div>;
          return reviewed.map((a) => {
            const w = state.mod.warnings[a.id] || 0, susp = isSuspended(state, a.id), deact = isDeactivated(state, a.id);
            const reps = (state.mod.reports || []).filter((r) => r.sender === a.id);
            const status = deact ? "Deactivated" : susp ? "Suspended until " + new Date(state.mod.bans[a.id]).toLocaleDateString() : w ? w + " warning" + (w !== 1 ? "s" : "") : reps.length ? "Reported — no action yet" : "Active";
            return (
              <div key={a.id} className={"dg-card" + (deact ? " dg-mgd-deact" : susp ? " dg-mgd-susp" : "")}>
                <div className="dg-card-h"><div className="dg-mgdhead">
                  <Avatar src={state.avatars && state.avatars[a.id]} size={40} />
                  <div>
                    <div className="dg-item-name">{a.name}</div>
                    <div className="dg-item-sub">{(state.roles[a.id] || ["player"]).join(", ")} · {status}</div>
                  </div>
                </div></div>
                {reps.map((r) => (
                  <div key={r.id} className="dg-reviewrep">
                    <div className="dg-reviewrep-q">“{r.text}”</div>
                    <div className="dg-reviewrep-m">Reported by {accName(r.reporter)}</div>
                    <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "DISMISS_REPORT", id: r.id })}>Dismiss this report</button>
                  </div>
                ))}
                <div className="dg-row-actions">
                  <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "WARN_USER", acc: a.id, by: accountId })}>+ Warn</button>
                  {w > 0 && <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "REMOVE_WARNING", acc: a.id, by: accountId })}>− Remove warning</button>}
                  {!susp && !deact && <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "BAN_USER", acc: a.id, days: 7, by: accountId })}>Suspend 7 days</button>}
                  {!deact && <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "DEACTIVATE_USER", by: accountId, acc: a.id })}>Deactivate</button>}
                  {(susp || deact) && <button className="dg-btn sm" onClick={() => dispatch({ type: "REACTIVATE_USER", by: accountId, acc: a.id })}>Reinstate</button>}
                </div>
              </div>
            );
          });
        })()}
      </div>

      <div className="dg-panel">
        <div className="dg-panel-h">Item approvals</div>
        <div className="dg-muted sm" style={{ marginBottom: 8 }}>Requests routed to the guild (event awards, or items whose DM has no profile)</div>
        {adminTickets.length === 0 ? <div className="dg-muted sm">No item authentication requests.</div> :
          adminTickets.map((th) => {
            const it = state.items[th.ticket.itemId];
            return (
              <div key={th.id} className="dg-ticket">
                <div className="dg-ticket-h">{it ? catName(it.catalogId) : "(item)"} — requested by {accName(th.ticket.requester)}</div>
                <div className="dg-muted sm">Log entry: {it && it.origin ? `from ${it.origin.adventure}` : "—"}</div>
                <div className="dg-row-actions">
                  <button className="dg-btn sm" onClick={() => setTab && setTab("messages")}>Review in Messages</button>
                </div>
              </div>
            );
          })}
        <div className="dg-muted sm" style={{ margin: "12px 0 8px" }}>Other unverified items (admin override)</div>
        {unverified.length === 0 ? <div className="dg-muted sm">All items are verified.</div> :
          unverified.map((it) => (
            <div key={it.id} className="dg-admin-row">
              <span>{catName(it.catalogId)} — held by {holderName(state, it)}</span>
              <button className="dg-btn sm" onClick={() => dispatch({ type: "AUTHENTICATE_CERT", itemId: it.id, by: accountId })}>Authenticate</button>
            </div>
          ))}
      </div>

      <div className="dg-panel warn">
        <div className="dg-panel-h">Items under review</div>
        <p className="dg-muted sm">Only <b>unverified</b> items, or items flagged for review (for example, when a DM who vouched them is suspended), can be invalidated — a verified item can never be invalidated. Invalidation erases the item, reverses every trade it touched, returns all items and DT to their original owners, recreates anything lost in play, and notifies everyone affected.</p>
        {(() => {
          const review = Object.values(state.items).filter((it) => it.provenance.state === "UNVERIFIED" || (it.review && it.review.flagged));
          if (!review.length) return <div className="dg-muted sm">No items are under review. Items appear here when they're unverified, or when a DM who vouched them is suspended in User approvals.</div>;
          return review.map((it) => (
            <div key={it.id} className="dg-admin-row">
              <span>{catName(it.catalogId)} — held by {holderName(state, it)}<br /><span className="dg-muted sm">{it.review ? it.review.reason : "Unverified — never authenticated"}{it._lost ? " · lost in play" : ""}</span></span>
              <span className="dg-row-actions">
                {!it._lost && <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "MARK_LOST", itemId: it.id, by: accountId })}>Mark lost in play</button>}
                <button className="dg-btn danger sm" onClick={() => dispatch({ type: "INVALIDATE", itemId: it.id, by: accountId })}>Invalidate</button>
              </span>
            </div>
          ));
        })()}
      </div>
      {(state.events || []).length > 0 && (
        <div className="dg-panel">
          <div className="dg-panel-h">Events</div>
          <div className="dg-muted sm" style={{ marginBottom: 8 }}>Recruit DMs to open tables (broadcast or invite specific DMs), or assign DMs directly.</div>
          {(state.events || []).map((ev) => {
            const tbls = state.sessions.filter((x) => x.eventId === ev.id && x.status !== "cancelled" && !x.draft);
            const open = tbls.filter((x) => !x.dmId).length;
            return (
              <div key={ev.id} className="dg-admin-row">
                <span><b>{ev.name}</b> · {ev.date}<br /><span className="dg-muted sm">{tbls.length} table{tbls.length !== 1 ? "s" : ""}{open ? " · " + open + " open" : " · all claimed"}</span></span>
                <button className="dg-btn sm" onClick={() => setModal({ kind: "eventmanage", eventId: ev.id })}>Manage</button>
              </div>
            );
          })}
        </div>
      )}

      {(() => {
        const flaggedDms: any[] = [...new Set((state.dmFlags || []).filter((f) => f.status === "open").map((f) => f.dm))];
        if (!flaggedDms.length) return null;
        return (
          <div className="dg-panel">
            <div className="dg-panel-h">DM oversight</div>
            <div className="dg-muted sm" style={{ marginBottom: 8 }}>Warning flags from peers and quiet check-ins. Three <b>distinct</b> flaggers unresolved is the demotion threshold — but resolving or demoting is your judgment. Demotion sends the DM anonymized, pooled concerns and routes them back into mentorship.</div>
            {flaggedDms.map((dm) => {
              const flags = openFlagsFor(state, dm);
              const distinct = distinctFlaggers(state, dm);
              return (
                <div key={dm} className="dg-card">
                  <div className="dg-item-name">{accName(dm)} · {distinct} distinct flagger{distinct !== 1 ? "s" : ""}{distinct >= 3 ? " · ⚠ at threshold" : ""}</div>
                  {flags.map((f) => (
                    <div key={f.id} className="dg-admin-row">
                      <span className="dg-muted sm">{f.kind === "monitor" ? "check-in" : "peer"} · {accName(f.by)} · {f.date}: {f.concern}</span>
                      <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "RESOLVE_FLAG", id: f.id })}>Resolve</button>
                    </div>
                  ))}
                  <div className="dg-row-actions">
                    <button className={"dg-btn sm" + (distinct >= 3 ? "" : " ghost")} onClick={() => dispatch({ type: "DEMOTE_DM", by: accountId, dm })}>Demote to provisional</button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      <div className="dg-panel">
        <div className="dg-panel-h">Stores</div>
        <button className="dg-btn full" onClick={() => setModal({ kind: "store", add: true })}>+ Add a store</button>
        {(state.storeRequests || []).length > 0 && (
          <>
            <div className="dg-muted sm" style={{ margin: "10px 0 6px" }}>Requested by players</div>
            {(state.storeRequests || []).map((rq) => (
              <div key={rq.id} className="dg-admin-row">
                <span><b>{rq.name}</b>{rq.note ? " — " + rq.note : ""}<br /><span className="dg-muted sm">requested by {accName(rq.by)}</span></span>
                <span className="dg-row-actions">
                  <button className="dg-btn sm" onClick={() => setModal({ kind: "store", add: true, prefillName: rq.name, fromRequest: rq.id })}>Look up &amp; add</button>
                  <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "DISMISS_STORE_REQUEST", id: rq.id })}>Dismiss</button>
                </span>
              </div>
            ))}
          </>
        )}
        <div className="dg-muted sm" style={{ margin: "10px 0 6px" }}>Registry</div>
        {Object.values(state.storeRegistry || {}).map((st) => {
          const fl = (state.storeFlags || []).filter((f) => f.storeId === st.id);
          return (
            <div key={st.id} className="dg-admin-row">
              <span><StoreChip state={state} storeId={st.id} setModal={setModal} />{fl.length > 0 && <span className="dg-flagcount"> · {fl.length} reported field{fl.length !== 1 ? "s" : ""}</span>}</span>
              <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "store", storeId: st.id })}>Open card</button>
            </div>
          );
        })}
      </div>
      <RulesLinks docs={["alag", "aldmg", "alpg", "hub"]} />
    </div>
  );
}

