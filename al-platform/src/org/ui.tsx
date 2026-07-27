import { StatRow, tierLabel } from "../lib/ui";
import { StoreLogo, StorePicker } from "../lib/ui";
import { storeRec } from "../lib/play";
import { ACCOUNTS, accName, orgRec } from "../lib/core";
import { ADV_BY_ID } from "../data/adventures";
import type { Action, AppState } from "../types";
import { Avatar, Empty, OrgChip, OrgLogo, ProvBadge, SectionHead, StoreChip, activeListings, listingTierLabel, orgsForStore } from "../lib/ui";
import { BASTION_EVENTS } from "../data/bastion";
import { canManageOrg, isAdmin, isOrgAssistantOf, isOrgLeaderOf, orgTabsFor, provOf, storesOf } from "../lib/rules";
import { dmSeniority, normName, warhornQueueFor } from "../lib/play";

// Licence terms text.
// PHASE 4 LEGAL GATE — flip to true only after the CC BY 4.0 consent copy below has been reviewed by qualified counsel.
// While false, the grant flow is fully wired and testable, but every consent screen is stamped SAMPLE so no one mistakes placeholder wording for deployable license language.
export const LICENSE_TERMS_REVIEWED = false;


// ============================================================================
// ORGANISATION UI - the guild and its people.
// The organisation page (officers, stores, DMs and their standing) and the community
// view (who is around, what they have published, who is looking for a table).
// ============================================================================

import React, { useState, useMemo } from "react";

export function parseCsvLine(line) {
  const out: any[] = []; let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') { q = false; } else cur += c; }
    else { if (c === '"') q = true; else if (c === ",") { out.push(cur); cur = ""; } else cur += c; }
  }
  out.push(cur);
  return out.map((x) => x.trim());
}

export function canAppointFor(state: AppState, acc, orgId) { return isAdmin(state, acc) || isOrgLeaderOf(state, acc, orgId); }   // leader (or admin) appoints assistants & schedulers

export function isOrgSchedulerOf(state: AppState, acc, orgId) { const o = orgRec(state, orgId); return !!o && (o.schedulerIds || []).includes(acc); }

// DM directory helpers: what a DM has run, and their most-run ("favorite") adventure.
export function dmAdventuresRun(state: AppState, acct) {
  const counts: Record<string, any> = {};
  (state.sessions || []).forEach((se) => { if (se.dmId === acct && se.adventureId) counts[se.adventureId] = (counts[se.adventureId] || 0) + 1; });
  (state.logEntries || []).forEach((l) => { if (l.entryType === "DM_REWARD" && l.dmId === acct && l.adventureId) counts[l.adventureId] = (counts[l.adventureId] || 0) + 1; });
  return counts;
}

export function dmFavoriteAdventure(state: AppState, acct) {
  const counts = dmAdventuresRun(state, acct);
  let best: any = null, n = 1;
  Object.keys(counts).forEach((id) => { if (counts[id] > n) { n = counts[id]; best = id; } });
  return best ? { adventureId: best, times: n } : null;
}

// forgiving listing search: AND across terms over title + blurb + tags + setting
export function listingMatchesQuery(l, q) {
  if (!q || !q.trim()) return true;
  const hay = [l.title, l.blurb, (l.tags || []).join(" "), l.setting].filter(Boolean).join(" ").toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((t) => hay.includes(t));
}

// ---------------------- Schedule ----------------------
export function dmStatusLabel(state: AppState, acct) {
  const p = provOf(state, acct);
  if (p === "certified") return "Certified DM";
  if (p === "provisional-dm") return "Provisional DM";
  if (p === "provisional-mentee") return "DM in training";
  return "Dungeon Master";
}

export function OrganizationView({ state, dispatch, setModal, accountId }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const tabIds = orgTabsFor(state, accountId);
  const [orgId, setOrgId] = useState(tabIds[0] || "");
  const [group, setGroup] = useState("all");
  const [text, setText] = useState("");
  const [allowReplies, setAllowReplies] = useState(false);
  const [sent, setSent] = useState(false);
  const [addAsst, setAddAsst] = useState("");
  const [addSched, setAddSched] = useState("");
  const [copied, setCopied] = useState(false);
  const [whText, setWhText] = useState("");
  const [whResult, setWhResult] = useState<any>(null);
  const [queryCopied, setQueryCopied] = useState(false);
  const [beChars, setBeChars] = useState<Record<string, any>>({});
  const [beLoc, setBeLoc] = useState("all");
  const [beEvent, setBeEvent] = useState("");
  const [beCustom, setBeCustom] = useState("");
  const [beAttack, setBeAttack] = useState(false);
  const [beSent, setBeSent] = useState<number | false>(false);
  const o = orgRec(state, orgId) || (tabIds[0] ? orgRec(state, tabIds[0]) : null);
  if (!o) return <Empty title="No organization to manage" body="You're not a leader, assistant, or scheduler of any organization yet." />;
  const manage = canManageOrg(state, accountId, o.id);
  const appoint = canAppointFor(state, accountId, o.id);
  const sched = isOrgSchedulerOf(state, accountId, o.id);
  const role = o.leaderId === accountId ? "leader" : isOrgAssistantOf(state, accountId, o.id) ? "assistant" : "scheduler";
  const groupLabel = { all: "Everyone", dms: "all Dungeon Masters", players: "all players", assistants: "the assistants" };
  const send = () => { if (!text.trim()) return; dispatch({ type: "BROADCAST_ORG_MESSAGE", by: accountId, orgId: o.id, group, text: text.trim(), allowReplies }); setText(""); setSent(true); setTimeout(() => setSent(false), 2500); };
  const orgEvents = (state.events || []).filter((e) => e.orgId === o.id);
  const queue = warhornQueueFor(state, o.id);
  // The scheduler's push report: everything the calendar has changed that Warhorn has not
  // been told about. On demand, because you open it when you sit down to do the typing.
  const canPush = isOrgLeaderOf(state, accountId, o.id) || isOrgAssistantOf(state, accountId, o.id) || isOrgSchedulerOf(state, accountId, o.id);
  const reportText = queue.length ? queue.map((q, i) => (i + 1) + ". " + q.label + "  [" + (q.event ? q.event.name : "") + " · " + (q.session.datetime || "").slice(0, 10) + "]").join("\n") : "";
  const copyReport = () => { try { if (navigator.clipboard) navigator.clipboard.writeText(reportText); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const WH_QUERY = "query ($slug: String!) {\n  event(slug: $slug) {\n    registrations {\n      nodes { registrant { name email activationState } }\n    }\n  }\n}";
  const parseRegistrants = (txt) => {
    const trimmed = (txt || "").trim();
    // 1) GraphQL JSON response
    try {
      const j = JSON.parse(trimmed);
      let nodes = (j && j.data && j.data.event && j.data.event.registrations && j.data.event.registrations.nodes)
        || (j && j.event && j.event.registrations && j.event.registrations.nodes)
        || (j && j.registrations && j.registrations.nodes)
        || (j && j.nodes) || (Array.isArray(j) ? j : []);
      const rows = nodes.map((n) => n.registrant || n).map((r) => ({ name: r.name, email: r.email })).filter((r) => r.name || r.email);
      if (rows.length) return rows;
    } catch (e) { /* not JSON — try CSV / names */ }
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim());
    // 2) CSV export from Warhorn (header row with a name / email column)
    if (lines.length && lines[0].includes(",")) {
      const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
      const nameIdx = header.findIndex((h) => h === "name" || h.includes("name"));
      const emailIdx = header.findIndex((h) => h === "email" || h.includes("e-mail"));
      if (nameIdx >= 0 || emailIdx >= 0) {
        return lines.slice(1).map((line) => { const c = parseCsvLine(line); return { name: nameIdx >= 0 ? c[nameIdx] : undefined, email: emailIdx >= 0 ? c[emailIdx] : undefined }; }).filter((r) => r.name || r.email);
      }
    }
    // 3) plain: one registrant name per line
    return lines.map((x) => x.trim()).filter(Boolean).map((name) => ({ name }));
  };
  const reconcile = () => {
    const regs = parseRegistrants(whText);
    const regNames = new Set(regs.map((r) => normName(r.name)));
    const pendingSignups = queue.filter((q) => q.kind === "signup");
    const matched = pendingSignups.filter((q) => regNames.has(normName(accName(q.accountId))));
    const stillMissing = pendingSignups.filter((q) => !regNames.has(normName(accName(q.accountId))));
    const appNames = new Set(pendingSignups.map((q) => normName(accName(q.accountId))));
    const extra = regs.filter((r) => r.name && !appNames.has(normName(r.name)));
    dispatch({ type: "RECONCILE_WARHORN", orgId: o.id, names: regs.map((r) => r.name).filter(Boolean) });
    setWhResult({ matched: matched.length, missing: stillMissing.map((q) => accName(q.accountId)), extra: extra.map((r) => r.name) });
  };

  return (
    <div className="dg-stack">
      <SectionHead eyebrow="Organization" title={o.name} note={"You act on behalf of this organization as its " + role + "."} />
      {tabIds.length > 1 && (
        <label className="dg-field"><span>Managing</span>
          <select value={orgId} onChange={(e) => setOrgId(e.target.value)}>{tabIds.map((oid) => <option key={oid} value={oid}>{orgRec(state, oid).name}</option>)}</select>
        </label>
      )}
      <div className="dg-orghead"><OrgLogo org={o} size={44} /><div><div className="dg-item-name">{o.name}</div><div className="dg-muted sm">{o.short ? o.short + " · " : ""}{o.region}</div></div></div>
      {manage && (
        <div className="dg-row-actions">
          <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "orgedit", orgId: o.id })}>✎ Edit organization</button>
          <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "eventbuild", orgId: o.id })}>✦ Build an event</button>
        </div>
      )}

      {manage && (<>
        <div className="dg-insp-sec">People</div>
        <div className="dg-muted sm">Leader: <b>{o.leaderId ? accName(o.leaderId) : "—"}</b></div>
        <div className="dg-subhead" style={{ marginTop: 8 }}>Assistants <span className="dg-muted sm">— help edit the page and run events</span></div>
        {(o.assistantIds || []).length === 0 ? <div className="dg-muted sm">None yet.</div> : (o.assistantIds || []).map((id) => (
          <div key={id} className="dg-admin-row"><span>{accName(id)}</span>{appoint && <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "SET_ORG_ASSISTANT", by: accountId, orgId: o.id, accountId: id, remove: true })}>Remove</button>}</div>
        ))}
        {appoint && (
          <div className="dg-field2" style={{ marginTop: 6 }}>
            <label className="dg-field"><span>Add an assistant</span>
              <select value={addAsst} onChange={(e) => setAddAsst(e.target.value)}><option value="">Choose…</option>{ACCOUNTS.filter((a) => a.id !== o.leaderId && !(o.assistantIds || []).includes(a.id)).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
            </label>
            <button className="dg-btn sm" disabled={!addAsst} onClick={() => { dispatch({ type: "SET_ORG_ASSISTANT", by: accountId, orgId: o.id, accountId: addAsst }); setAddAsst(""); }}>Add</button>
          </div>
        )}
        <div className="dg-subhead" style={{ marginTop: 10 }}>Schedulers <span className="dg-muted sm">— handle the Warhorn worklist</span></div>
        {(o.schedulerIds || []).length === 0 ? <div className="dg-muted sm">None yet.</div> : (o.schedulerIds || []).map((id) => (
          <div key={id} className="dg-admin-row"><span>{accName(id)}</span>{appoint && <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "SET_ORG_SCHEDULER", by: accountId, orgId: o.id, accountId: id, remove: true })}>Remove</button>}</div>
        ))}
        {appoint && (
          <div className="dg-field2" style={{ marginTop: 6 }}>
            <label className="dg-field"><span>Add a scheduler</span>
              <select value={addSched} onChange={(e) => setAddSched(e.target.value)}><option value="">Choose…</option>{ACCOUNTS.filter((a) => !(o.schedulerIds || []).includes(a.id)).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
            </label>
            <button className="dg-btn sm" disabled={!addSched} onClick={() => { dispatch({ type: "SET_ORG_SCHEDULER", by: accountId, orgId: o.id, accountId: addSched }); setAddSched(""); }}>Add</button>
          </div>
        )}
      </>)}

      {manage && (<>
        <div className="dg-insp-sec">Events</div>
        {orgEvents.length === 0 ? <div className="dg-muted sm">No events yet. Build one to post its tables for sign-up.</div> : orgEvents.map((ev) => {
          const tables = (state.sessions || []).filter((se) => se.eventId === ev.id && se.status !== "cancelled");
          const signCount = tables.reduce((n, se) => n + (se.signups || []).length, 0);
          return (
            <div key={ev.id} className="dg-eventblock">
              <div className="dg-admin-row">
                <span><b>{ev.name}</b> <span className="dg-muted sm">· {ev.date} · {tables.length} table{tables.length !== 1 ? "s" : ""} · {signCount} signed up</span></span>
                <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "eventmanage", eventId: ev.id })}>Manage</button>
              </div>
              <label className="dg-field" style={{ marginTop: 4 }}><span>Warhorn event slug <span className="dg-muted sm">(from the Warhorn event URL, for reconciling registrations)</span></span>
                <input type="text" value={ev.warhornSlug || ""} placeholder="e.g. summer-delve-2026" onChange={(e) => dispatch({ type: "SET_WARHORN_SLUG", eventId: ev.id, slug: e.target.value })} />
              </label>
            </div>
          );
        })}
        <div className="dg-insp-sec">Bastion events</div>
        <div className="dg-muted sm" style={{ marginBottom: 8 }}>Push an event onto one or many bastions — for an epic module with a bastion impact, or an org-run storyline. It overrides each bastion's next table roll and resolves on their next turn.</div>
        {(() => {
          const allBast = Object.values(state.characters).filter((c) => c.bastion && !c.bastion.abandoned);
          if (!allBast.length) return <div className="dg-muted sm">No active bastions in play yet.</div>;
          const locs = [...new Set(allBast.map((c) => c.bastion!.location || "Unspecified"))].sort();
          const shown = beLoc === "all" ? allBast : allBast.filter((c) => (c.bastion!.location || "Unspecified") === beLoc);
          const selectedIds = Object.keys(beChars).filter((k) => beChars[k]);
          const shownSelected = shown.filter((c) => beChars[c.id]).length;
          const allShownSelected = shown.length > 0 && shownSelected === shown.length;
          const isCustom = beEvent === "__custom";
          const label = isCustom ? beCustom.trim() : (BASTION_EVENTS.find((e) => e.id === beEvent) || {}).label;
          const effect = isCustom ? (beAttack ? "attack" : "none") : (BASTION_EVENTS.find((e) => e.id === beEvent) || {}).effect;
          const ready = selectedIds.length > 0 && label;
          const toggleAllShown = () => { const next = { ...beChars }; shown.forEach((c) => { next[c.id] = !allShownSelected; }); setBeChars(next); setBeSent(false); };
          const send = () => { selectedIds.forEach((cid) => dispatch({ type: "SET_BASTION_PENDING_EVENT", charId: cid, by: accountId, event: { label, effect } })); setBeSent(selectedIds.length); setBeCustom(""); setBeEvent(""); setBeAttack(false); setBeChars({}); };
          return (<>
            <div className="dg-bastorderrow">
              <select value={beLoc} onChange={(e) => setBeLoc(e.target.value)}>
                <option value="all">All regions ({allBast.length})</option>
                {locs.map((l) => <option key={l} value={l}>{l} ({allBast.filter((c) => (c.bastion!.location || "Unspecified") === l).length})</option>)}
              </select>
              <button className="dg-btn ghost sm" onClick={toggleAllShown}>{allShownSelected ? "Clear shown" : "Select all shown"}</button>
            </div>
            <div className="dg-batchlist">
              {shown.map((c) => (
                <label key={c.id} className="dg-batchrow">
                  <input type="checkbox" checked={!!beChars[c.id]} onChange={(e) => { setBeChars((m) => ({ ...m, [c.id]: e.target.checked })); setBeSent(false); }} />
                  <span><b>{c.bastion!.name}</b> <span className="dg-muted sm">· {c.name} ({accName(c.ownerId)}) · {c.bastion!.location || "Unspecified"}{c.bastion!.pendingEvent ? " · event queued" : ""}</span></span>
                </label>
              ))}
            </div>
            <div className="dg-bastorderrow" style={{ marginTop: 6 }}>
              <select value={beEvent} onChange={(e) => { setBeEvent(e.target.value); setBeSent(false); }}>
                <option value="">Choose an event…</option>
                {BASTION_EVENTS.map((e) => <option key={e.id} value={e.id}>{e.label}{e.effect === "attack" ? " (attack)" : ""}</option>)}
                <option value="__custom">Custom…</option>
              </select>
            </div>
            {isCustom && (
              <div className="dg-bastorderrow" style={{ marginTop: 6 }}>
                <input type="text" placeholder="Custom event text" value={beCustom} onChange={(e) => setBeCustom(e.target.value)} style={{ flex: 1 }} />
                <label className="dg-muted sm" style={{ display: "flex", alignItems: "center", gap: 4 }}><input type="checkbox" checked={beAttack} onChange={(e) => setBeAttack(e.target.checked)} /> disables a facility</label>
              </div>
            )}
            <button className="dg-btn ghost sm" style={{ marginTop: 6 }} disabled={!ready} onClick={send}>Send event to {selectedIds.length || "0"} bastion{selectedIds.length === 1 ? "" : "s"}</button>
            {beSent && <div className="dg-suggestbanner" style={{ marginTop: 8 }}>✓ Event queued for {beSent} bastion{beSent === 1 ? "" : "s"} — lands on each keep's next turn.</div>}
          </>);
        })()}
      </>)}

      {manage && (<>
        <div className="dg-insp-sec">Send a broadcast</div>
        <div className="dg-muted sm" style={{ marginBottom: 8 }}>Word lands in each recipient's message channel. Replies (if allowed) come back to this Organization's Messages tab.</div>
        <label className="dg-field"><span>Send to</span>
          <select value={group} onChange={(e) => { setGroup(e.target.value); setAllowReplies(false); }}>
            <option value="all">Everyone</option><option value="dms">All Dungeon Masters</option><option value="players">All players</option><option value="assistants">Assistants</option>
          </select>
        </label>
        <label className="dg-field"><span>Message</span><textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Summer Delve DMs, please arrive by 12:30 for setup." /></label>
        <label className="dg-check"><input type="checkbox" checked={allowReplies} onChange={(e) => setAllowReplies(e.target.checked)} /><span>Allow one-on-one replies to the organization</span></label>
        <div className="dg-muted sm" style={{ marginBottom: 8 }}>{allowReplies ? "Recipients can reply privately." : "Goes out as an announcement — read-only."}</div>
        <button className="dg-btn" disabled={!text.trim()} onClick={send}>Send to {groupLabel[group]}</button>
        {sent && <div className="dg-suggestbanner" style={{ marginTop: 8 }}>✓ Broadcast sent.</div>}
      </>)}

      {(manage || sched) && (<>
        <div className="dg-insp-sec">Warhorn worklist {queue.length > 0 && <span className="dg-badge">{queue.length}</span>}</div>
        <div className="dg-muted sm" style={{ marginBottom: 8 }}>Until a Warhorn API is wired up, sign-ups and tables on this org's events are collected here for the scheduler to enter by hand. Mark each one off as you add it to Warhorn.</div>
        {canPush && <button className="dg-btn sm" onClick={() => setModal({ kind: "pushreport", mode: "scheduler", orgId: o.id })}>Warhorn push report{queue.length ? " (" + queue.length + ")" : ""}</button>}
        {queue.length === 0 ? <div className="dg-muted sm">Nothing waiting — everything on this org's events has been pushed.</div> : (<>
          {queue.map((q) => (
            <div key={q.key} className="dg-admin-row">
              <span>{q.kind === "signup" ? "➕ " : "🗓 "}{q.label} <span className="dg-muted sm">· {q.event ? q.event.name : ""} · {(q.session.datetime || "").slice(0, 10)}</span></span>
              <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "MARK_WARHORN_PUSHED", key: q.key })}>✓ Pushed</button>
            </div>
          ))}
          <div className="dg-row-actions" style={{ marginTop: 8 }}>
            <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "MARK_WARHORN_ALL", orgId: o.id })}>✓ Mark all pushed</button>
            <button className="dg-btn ghost sm" onClick={copyReport}>{copied ? "✓ Copied" : "⧉ Copy worklist"}</button>
          </div>
          <label className="dg-field" style={{ marginTop: 8 }}><span>Worklist (copy into Warhorn)</span><textarea rows={4} readOnly value={reportText} onClick={(e) => (e.target as HTMLInputElement).select()} /></label>
        </>)}

        <div className="dg-subhead" style={{ marginTop: 14 }}>Reconcile with Warhorn <span className="dg-muted sm">— read-only</span></div>
        <div className="dg-muted sm" style={{ marginBottom: 8 }}>Warhorn can't be written to from here (its API is read-only, and there's no schedule import) — but it <i>can</i> tell you who's already registered. Two ways to get that: <b>export</b> your event's registration data from Warhorn as a spreadsheet, or run the API query below. Paste either one in and anyone found on Warhorn gets ticked off automatically.</div>
        <label className="dg-field"><span>Option A — API query · POST to https://warhorn.net/graphql with your Bearer token{orgEvents.some((e) => e.warhornSlug) ? " · slug: " + orgEvents.filter((e) => e.warhornSlug).map((e) => e.warhornSlug).join(", ") : ""}</span>
          <textarea rows={6} readOnly value={WH_QUERY} onClick={(e) => (e.target as HTMLInputElement).select()} />
        </label>
        <button className="dg-btn ghost sm" onClick={() => { try { if (navigator.clipboard) navigator.clipboard.writeText(WH_QUERY); } catch (e) {} setQueryCopied(true); setTimeout(() => setQueryCopied(false), 2000); }}>{queryCopied ? "✓ Copied" : "⧉ Copy query"}</button>
        <label className="dg-field" style={{ marginTop: 8 }}><span>Option B — paste Warhorn's registration export (CSV), the API's JSON response, or one name per line</span>
          <textarea rows={4} value={whText} onChange={(e) => setWhText(e.target.value)} placeholder={"name,email\nAldric,aldric@example.com\n…  — or the GraphQL JSON, or just names"} />
        </label>
        <button className="dg-btn" disabled={!whText.trim()} onClick={reconcile}>Reconcile — tick off who's on Warhorn</button>
        {whResult && (
          <div className="dg-suggestbanner" style={{ marginTop: 8 }}>
            ✓ Ticked off {whResult.matched} already on Warhorn.
            {whResult.missing.length > 0 && <div className="dg-muted sm" style={{ marginTop: 4 }}>Still to add on Warhorn: {whResult.missing.join(", ")}.</div>}
            {whResult.extra.length > 0 && <div className="dg-muted sm" style={{ marginTop: 4 }}>On Warhorn but not signed up here: {whResult.extra.join(", ")}.</div>}
          </div>
        )}
      </>)}
    </div>
  );
}

export function DMCard({ acct, state, setModal }: { state: AppState; [k: string]: any }) {
  const bio = (state.bios || {})[acct];
  const fav = dmFavoriteAdventure(state, acct);
  const runCount = dmSeniority(state, acct);
  return (
    <div className="dg-card">
      <div className="dg-profilehead">
        <Avatar src={state.avatars && state.avatars[acct]} size={44} />
        <div>
          <div className="dg-item-name">{accName(acct)} <ProvBadge state={state} acct={acct} /></div>
          <div className="dg-muted sm">{dmStatusLabel(state, acct)} · {runCount} table{runCount !== 1 ? "s" : ""} run</div>
        </div>
      </div>
      {bio && <p className="dg-bio">{bio}</p>}
      {fav && ADV_BY_ID[fav.adventureId] && <div className="dg-fav">★ Favorite to run: <b>{ADV_BY_ID[fav.adventureId].label}</b> <span className="dg-muted sm">(run {fav.times}×)</span></div>}
    </div>
  );
}

export function CommunityView({ state, accountId, dispatch, setModal }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const [mq, setMq] = useState("");
  const [mSetting, setMSetting] = useState("all");
  const [mTier, setMTier] = useState("all");
  const orgs = Object.values(state.organizations || {});
  const stores = Object.values(state.storeRegistry || {});
  const dmAccts = ACCOUNTS.filter((a) => (state.roles[a.id] || []).includes("dm"));
  const listings = activeListings(state);
  const listingSettings: any[] = [...new Set(listings.map((l) => l.setting).filter(Boolean))].sort();
  const shownListings = listings.filter((l) => (mSetting === "all" || l.setting === mSetting) && (mTier === "all" || (l.tierLow <= +mTier && l.tierHigh >= +mTier)) && listingMatchesQuery(l, mq));
  const heroName = (id) => (state.characters[id] || {}).name;
  const ruinName = (id) => ((state.characters[id] || {}).bastion || {}).name;
  return (
    <div className="dg-stack">
      <SectionHead eyebrow="Community" title="Organizations & Dungeon Masters" note="The groups that run play here, the DMs who run the tables, and community modules to run at them." />

      <div className="dg-insp-sec">Community modules</div>
      <p className="dg-muted sm" style={{ marginTop: -2 }}>Adventures written by the community. Every listing links out to where the module is sold — nothing is bought or sold in-app.</p>
      <div className="dg-catsettingrow">
        <label className="dg-catsettinglbl">Setting</label>
        <select className="dg-catsetting" value={mSetting} onChange={(e) => setMSetting(e.target.value)}>
          <option value="all">All settings</option>
          {listingSettings.map((sName) => <option key={sName} value={sName}>{sName}</option>)}
        </select>
      </div>
      <div className="dg-marketsearch"><input className="dg-searchbar" value={mq} onChange={(e) => setMq(e.target.value)} placeholder="Search community modules — title, tag, blurb…" />{mq && <button className="dg-searchclear" title="Clear" onClick={() => setMq("")}>×</button>}</div>
      <div className="dg-chips">
        {[["all", "All"], ["1", "T1"], ["2", "T2"], ["3", "T3"], ["4", "T4"]].map(([v, l]) => <button key={v} className={"dg-chip" + (mTier === v ? " on" : "")} onClick={() => setMTier(v)}>{l}</button>)}
      </div>
      {listings.length === 0 ? <Empty title="No community modules yet" body="When authors list their published modules, they'll appear here for you to discover and buy." /> :
        shownListings.length === 0 ? <Empty title="Nothing matches" body="Try a broader search, a different tier, or another setting." /> :
        <div className="dg-grid">{shownListings.map((l) => (
          <div key={l.id} className="dg-card">
            <div className="dg-card-h"><div>
              <span className="dg-item-name">{l.title}</span>
              <div className="dg-item-sub">{l.setting} · {listingTierLabel(l)} · by {accName(l.authorId)}</div>
            </div></div>
            {l.blurb && <p className="dg-muted sm" style={{ margin: "4px 0" }}>{l.blurb}</p>}
            {l.tags.length > 0 && <div className="dg-tagrow">{l.tags.map((t) => <button key={t} className="dg-tag" onClick={() => setMq(t)}>{t}</button>)}</div>}
            {(l.heroes.length + l.ruins.length) > 0 && <div className="dg-muted sm" style={{ marginTop: 4 }}>Features {[...l.heroes.map((id) => ({ id, kind: "herohall", name: heroName(id) })), ...l.ruins.map((id) => ({ id, kind: "ruin", name: ruinName(id) }))].filter((x) => x.name).map((x, i, arr) => <span key={x.id}><button className="dg-linkbtn" onClick={() => setModal({ kind: x.kind, charId: x.id })}>{x.name}</button>{i < arr.length - 1 ? ", " : ""}</span>)}</div>}
            {l.buyLink
              ? <a className="dg-btn full sm" href={l.buyLink} target="_blank" rel="noopener noreferrer" style={{ marginTop: 6 }}>Where to buy ↗</a>
              : <div className="dg-muted sm" style={{ marginTop: 6 }}>No buy-link provided.</div>}
          </div>
        ))}</div>}

      <div className="dg-insp-sec">Organizations</div>
      <div className="dg-orggrid">
        {orgs.length === 0 ? <Empty title="No organizations yet" body="Organized-play groups will appear here." /> : orgs.map((o) => (
          <button key={o.id} className="dg-orgcard" onClick={() => setModal({ kind: "org", orgId: o.id })}>
            <OrgLogo org={o} size={44} />
            <span className="dg-orgcard-body">
              <span className="dg-orgcard-name">{o.name}{o.leaderId === accountId ? <span className="dg-factiontag">You lead this</span> : (o.assistantIds || []).includes(accountId) ? <span className="dg-factiontag">You help run this</span> : null}</span>
              {o.tagline && <span className="dg-orgcard-tag">{o.tagline}</span>}
              <span className="dg-muted sm">{o.region ? o.region + " · " : ""}{(o.storeIds || []).length > 0 ? (o.storeIds || []).length + " location" + ((o.storeIds || []).length !== 1 ? "s" : "") : (o.eventBased ? "Event-based" : "No venues yet")}</span>
            </span>
          </button>
        ))}
      </div>
      {isAdmin(state, accountId) && <button className="dg-btn ghost full" style={{ marginTop: 8 }} onClick={() => setModal({ kind: "orgedit", orgId: "__new__" })}>+ Add an organization</button>}

      <div className="dg-insp-sec">Dungeon Masters by location</div>
      {stores.map((st) => {
        const dms = dmAccts.filter((a) => storesOf(state, a.id).includes(st.id));
        if (!dms.length) return null;
        return (
          <div key={st.id} className="dg-daygroup">
            <div className="dg-dayhead"><StoreChip state={state} storeId={st.id} setModal={setModal} /><span className="dg-daycount">{dms.length} DM{dms.length !== 1 ? "s" : ""}</span></div>
            {orgsForStore(state, st.id).length > 0 && <div className="dg-orgrow">{orgsForStore(state, st.id).map((o) => <OrgChip key={o.id} state={state} orgId={o.id} setModal={setModal} />)}</div>}
            {dms.map((a) => <DMCard key={a.id} acct={a.id} state={state} setModal={setModal} />)}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Organisation modals - editing an org, its stores, and module listings.
// ---------------------------------------------------------------------------

// ---- Phase 5: community module listings ----
// A curated tag palette so authors converge on shared terms instead of fragmenting (scary/horror/spooky…). Free entry still allowed.
export const MODULE_TAGS = ["One-shot", "Campaign", "Beginner-friendly", "Combat-heavy", "Roleplay-heavy", "Puzzle", "Dungeon crawl", "Urban", "Wilderness", "Seafaring", "Horror", "Mystery", "Intrigue", "Planar"];

// Settings offered in the listing form; free entry still allowed. Homebrew/Original is the legally-correct home for user-built worlds.
export const MODULE_SETTINGS = ["Forgotten Realms", "Greyhawk", "Eberron", "Dragonlance", "Ravenloft", "Spelljammer", "Planescape", "Dark Sun", "Homebrew / Original Setting"];

export function StoreModal({ modal, state, dispatch, accountId, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const adding = !!modal.add;
  const r = adding ? null : storeRec(state, modal.storeId);
  const admin = isAdmin(state, accountId);
  const [edit, setEdit] = useState(adding);
  const base = r || { name: modal.prefillName || "", address: "", phone: "", hours: "", website: "", mapsUrl: "" };
  const [f, setF] = useState({ name: base.name, address: base.address, phone: base.phone, hours: base.hours, website: base.website, mapsUrl: base.mapsUrl || "" });
  const [reported, setReported] = useState<any[]>([]);
  if (!adding && !r) return (<><h3 className="dg-modal-h">Store not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  const flags = r ? (state.storeFlags || []).filter((x) => x.storeId === r.id) : [];
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = () => {
    if (adding) { dispatch({ type: "ADD_STORE", ...f, fromRequest: modal.fromRequest }); close(); }
    else { dispatch({ type: "EDIT_STORE", id: r.id, patch: f }); setEdit(false); }
  };
  const onLogo = (e) => { const file = e.target.files && e.target.files[0]; if (!file) return; const rd = new FileReader(); rd.onload = () => dispatch({ type: "SET_STORE_LOGO", id: r.id, dataURL: rd.result }); rd.readAsDataURL(file); };
  const flag = (field) => { dispatch({ type: "FLAG_STORE_FIELD", storeId: r.id, field, by: accountId }); setReported([...reported, field]); };
  const FlagBtn = ({ field }) => (!admin && r ? (reported.includes(field) ? <span className="dg-flagged">reported</span> : <button className="dg-flagbtn" title="Report this as wrong" onClick={() => flag(field)}>⚑</button>) : null);

  if (edit) {
    return (
      <>
        <h3 className="dg-modal-h">{adding ? "Add a store" : "Edit store"}</h3>
        <label className="dg-field"><span>Name</span><input type="text" value={f.name} onChange={set("name")} /></label>
        <label className="dg-field"><span>Address</span><input type="text" value={f.address} onChange={set("address")} /></label>
        <label className="dg-field"><span>Phone</span><input type="text" value={f.phone} onChange={set("phone")} /></label>
        <label className="dg-field"><span>Hours</span><textarea rows={2} value={f.hours} onChange={set("hours")} /></label>
        <label className="dg-field"><span>Website</span><input type="text" value={f.website} onChange={set("website")} placeholder="https://…" /></label>
        <label className="dg-field"><span>Google Maps link</span><input type="text" value={f.mapsUrl} onChange={set("mapsUrl")} placeholder="https://maps.google.com/…" /></label>
        <div className="dg-row-actions">
          <button className="dg-btn" onClick={save} disabled={!f.name.trim()}>{adding ? "Add store" : "Save changes"}</button>
          <button className="dg-btn ghost" onClick={() => adding ? close() : setEdit(false)}>Cancel</button>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="dg-storecardhead">
        <StoreLogo store={r} size={56} />
        <div>
          <h3 className="dg-modal-h" style={{ margin: 0 }}>{r.name}</h3>
          {admin && <label className="dg-photobtn">Change logo<input type="file" accept="image/*" style={{ display: "none" }} onChange={onLogo} /></label>}
        </div>
      </div>
      <div className="dg-bizrow"><div className="dg-bizmain"><div className="dg-bizk">Address</div><div>{r.address || "—"}</div>{r.mapsUrl && <a className="dg-bizlink" href={r.mapsUrl} target="_blank" rel="noreferrer">Open in Maps ↗</a>}</div><FlagBtn field="address" /></div>
      <div className="dg-bizrow"><div className="dg-bizmain"><div className="dg-bizk">Phone</div>{r.phone ? <a className="dg-bizlink" href={"tel:" + r.phone.replace(/[^+\d]/g, "")}>{r.phone}</a> : <div>—</div>}</div><FlagBtn field="phone" /></div>
      <div className="dg-bizrow"><div className="dg-bizmain"><div className="dg-bizk">Hours</div><div>{r.hours || "—"}</div></div><FlagBtn field="hours" /></div>
      <div className="dg-bizrow"><div className="dg-bizmain"><div className="dg-bizk">Website</div>{r.website ? <a className="dg-bizlink" href={r.website} target="_blank" rel="noreferrer">{r.website} ↗</a> : <div>—</div>}</div><FlagBtn field="website" /></div>
      {admin && flags.length > 0 && (
        <div className="dg-storeflags">
          <div className="dg-insp-sec">Reported fields</div>
          {flags.map((fl) => <div key={fl.id} className="dg-admin-row"><span>⚠ <b>{fl.field}</b> flagged by {accName(fl.by)}</span><button className="dg-btn ghost sm" onClick={() => dispatch({ type: "RESOLVE_STORE_FLAG", id: fl.id })}>Mark resolved</button></div>)}
        </div>
      )}
      <div className="dg-row-actions">
        {admin && <button className="dg-btn ghost" onClick={() => setEdit(true)}>Edit store</button>}
        <button className="dg-btn ghost" onClick={close}>Close</button>
      </div>
    </>
  );
}

export function OrgEditModal({ modal, state, dispatch, accountId, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const creating = modal.orgId === "__new__";
  const o = creating ? null : orgRec(state, modal.orgId);
  const admin = isAdmin(state, accountId);
  const [name, setName] = useState(o ? o.name : "");
  const [short, setShort] = useState(o ? (o.short || "") : "");
  const [tagline, setTagline] = useState(o ? (o.tagline || "") : "");
  const [region, setRegion] = useState(o ? (o.region || "") : "");
  const [blurb, setBlurb] = useState(o ? (o.blurb || "") : "");
  const [highlights, setHighlights] = useState(o ? (o.highlights || []).join("\n") : "");
  const [phone, setPhone] = useState(o ? (o.phone || "") : "");
  const [email, setEmail] = useState(o ? (o.email || "") : "");
  const [facebook, setFacebook] = useState(o ? (o.facebook || "") : "");
  const [eventBased, setEventBased] = useState(o ? !!o.eventBased : false);
  const [storeIds, setStoreIds] = useState(o ? (o.storeIds || []) : []);
  const [addLeader, setAddLeader] = useState("");
  const [addAsst, setAddAsst] = useState("");
  if (!creating && !o) return (<><h3 className="dg-modal-h">Organization not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  const fields = () => ({ name: name.trim(), short: short.trim(), tagline: tagline.trim(), region: region.trim(), blurb: blurb.trim(), highlights: highlights.split("\n").map((x) => x.trim()).filter(Boolean), phone: phone.trim(), email: email.trim(), facebook: facebook.trim(), eventBased, storeIds });
  const save = () => {
    if (!name.trim()) return;
    if (creating) dispatch({ type: "CREATE_ORG", by: accountId, fields: fields() });
    else dispatch({ type: "EDIT_ORG", by: accountId, orgId: o.id, fields: fields() });
    close();
  };
  const storeName = (sid) => (state.storeRegistry && state.storeRegistry[sid] ? state.storeRegistry[sid].name : sid);
  return (
    <>
      <h3 className="dg-modal-h">{creating ? "Add an organization" : "Edit " + o.name}</h3>
      <div className="dg-field2">
        <label className="dg-field"><span>Name</span><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></label>
        <label className="dg-field"><span>Short name</span><input type="text" value={short} onChange={(e) => setShort(e.target.value)} placeholder="e.g. SCALE" /></label>
      </div>
      <label className="dg-field"><span>Tagline</span><input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One line — what they do" /></label>
      <label className="dg-field"><span>Region</span><input type="text" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Southern Colorado · events & conventions" /></label>
      <label className="dg-field"><span>About</span><textarea rows={3} value={blurb} onChange={(e) => setBlurb(e.target.value)} /></label>
      <label className="dg-field"><span>Known for (one per line)</span><textarea rows={4} value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder={"Runs conventions\nHosts Epics\nRaises money for charity"} /></label>
      <div className="dg-insp-sec">Get in touch</div>
      <label className="dg-field"><span>Facebook / website</span><input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://…" /></label>
      <div className="dg-field2">
        <label className="dg-field"><span>Email</span><input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></label>
        <label className="dg-field"><span>Phone</span><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(000) 000-0000" /></label>
      </div>
      <div className="dg-insp-sec">Where they play</div>
      <label className="dg-check"><input type="checkbox" checked={eventBased} onChange={(e) => setEventBased(e.target.checked)} /><span>Event-based — runs tables at conventions/stores rather than a home venue</span></label>
      {storeIds.map((sid) => <div key={sid} className="dg-admin-row"><span>{storeName(sid)}</span><button className="dg-btn ghost sm" onClick={() => setStoreIds(storeIds.filter((x) => x !== sid))}>Remove</button></div>)}
      <StorePicker state={state} exclude={storeIds} placeholder="+ Add a venue…" onPick={(sid) => setStoreIds([...new Set([...storeIds, sid])])} />

      {!creating && (<>
        <div className="dg-insp-sec">Scheduling</div>
        <label className="dg-check"><input type="checkbox" checked={!!o.preschedule} onChange={(e) => dispatch({ type: "EDIT_ORG", by: accountId, orgId: o.id, fields: { preschedule: e.target.checked } })} /><span>Pre-schedule — new tables stay hidden from players until a leader, assistant, or scheduler publishes them. Off means tables go public the moment a DM builds one.</span></label>
      </>)}

      {admin && !creating && (<>
        <div className="dg-insp-sec">Organization leader</div>
        <div className="dg-muted sm" style={{ marginBottom: 6 }}>One head of the organization. The leader can edit this page, run its events, and appoint assistants — without being a DM or admin.</div>
        {o.leaderId
          ? <div className="dg-admin-row"><span><b>{accName(o.leaderId)}</b> · leader</span><button className="dg-btn ghost sm" onClick={() => dispatch({ type: "SET_ORG_LEADER", by: accountId, orgId: o.id, remove: true })}>Remove</button></div>
          : <div className="dg-muted sm">No leader appointed yet.</div>}
        <div className="dg-field2" style={{ marginTop: 6 }}>
          <label className="dg-field"><span>{o.leaderId ? "Replace leader" : "Appoint leader"}</span>
            <select value={addLeader} onChange={(e) => setAddLeader(e.target.value)}>
              <option value="">Choose an account…</option>
              {ACCOUNTS.filter((a) => a.id !== o.leaderId).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <button className="dg-btn sm" disabled={!addLeader} onClick={() => { dispatch({ type: "SET_ORG_LEADER", by: accountId, orgId: o.id, accountId: addLeader }); setAddLeader(""); }}>{o.leaderId ? "Replace" : "Appoint"}</button>
        </div>
      </>)}

      {!creating && o && canAppointFor(state, accountId, o.id) && (<>
        <div className="dg-insp-sec">Assistants</div>
        <div className="dg-muted sm" style={{ marginBottom: 6 }}>Helpers who can edit this page and run its events. They can't appoint others or change leadership.</div>
        {(o.assistantIds || []).length === 0 ? <div className="dg-muted sm">No assistants yet.</div> : (o.assistantIds || []).map((id) => (
          <div key={id} className="dg-admin-row"><span>{accName(id)} · assistant</span><button className="dg-btn ghost sm" onClick={() => dispatch({ type: "SET_ORG_ASSISTANT", by: accountId, orgId: o.id, accountId: id, remove: true })}>Remove</button></div>
        ))}
        <div className="dg-field2" style={{ marginTop: 6 }}>
          <label className="dg-field"><span>Add an assistant</span>
            <select value={addAsst} onChange={(e) => setAddAsst(e.target.value)}>
              <option value="">Choose an account…</option>
              {ACCOUNTS.filter((a) => a.id !== o.leaderId && !(o.assistantIds || []).includes(a.id)).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <button className="dg-btn sm" disabled={!addAsst} onClick={() => { dispatch({ type: "SET_ORG_ASSISTANT", by: accountId, orgId: o.id, accountId: addAsst }); setAddAsst(""); }}>Add</button>
        </div>
      </>)}

      <div className="dg-row-actions" style={{ marginTop: 12 }}>
        <button className="dg-btn" onClick={save} disabled={!name.trim()}>{creating ? "Create organization" : "Save changes"}</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

export function ModuleEditModal({ modal, state, dispatch, accountId, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const editing = modal.listingId !== "__new__";
  const existing = editing ? (state.moduleListings || []).find((l) => l.id === modal.listingId) : null;
  const [title, setTitle] = useState(existing ? existing.title : "");
  const [setting, setSetting] = useState(existing ? existing.setting : "Forgotten Realms");
  const [tierLow, setTierLow] = useState(existing ? existing.tierLow : 1);
  const [tierHigh, setTierHigh] = useState(existing ? existing.tierHigh : 1);
  const [blurb, setBlurb] = useState(existing ? existing.blurb : "");
  const [buyLink, setBuyLink] = useState(existing ? existing.buyLink : "");
  const [tags, setTags] = useState(existing ? existing.tags : []);
  const [freeTag, setFreeTag] = useState("");
  const [heroes, setHeroes] = useState(existing ? existing.heroes : []);
  const [ruins, setRuins] = useState(existing ? existing.ruins : []);
  const licensedHeroes = Object.values(state.characters).filter((c) => c.licensed && c.status === "retired");
  const licensedRuins = Object.values(state.characters).filter((c) => c.licensed && c.status === "dead" && c.bastion);
  if (editing && !existing) return (<><h3 className="dg-modal-h">Listing not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const addFree = () => { const t = freeTag.trim(); if (t && !tags.includes(t)) setTags([...tags, t]); setFreeTag(""); };
  const custom = tags.filter((t) => !MODULE_TAGS.includes(t));
  const save = () => {
    if (!title.trim()) return;
    const payload = { title, setting, tierLow, tierHigh: Math.max(tierLow, tierHigh), blurb, buyLink, tags, heroes, ruins };
    if (editing) dispatch({ type: "EDIT_MODULE_LISTING", by: accountId, listingId: modal.listingId, listing: payload });
    else dispatch({ type: "CREATE_MODULE_LISTING", by: accountId, listing: payload });
    close();
  };
  return (<>
    <h3 className="dg-modal-h">{editing ? "Edit listing" : "New listing"}</h3>
    <label className="dg-field"><span>Title</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your module's title" /></label>
    <label className="dg-field"><span>Campaign setting</span>
      <input list="dg-modsettings" value={setting} onChange={(e) => setSetting(e.target.value)} placeholder="Setting of origin" />
      <datalist id="dg-modsettings">{MODULE_SETTINGS.map((sName) => <option key={sName} value={sName} />)}</datalist>
    </label>
    <div className="dg-field2">
      <label className="dg-field"><span>Tier from</span><select value={tierLow} onChange={(e) => setTierLow(+e.target.value)}>{[1, 2, 3, 4].map((t) => <option key={t} value={t}>Tier {t}</option>)}</select></label>
      <label className="dg-field"><span>to</span><select value={tierHigh} onChange={(e) => setTierHigh(+e.target.value)}>{[1, 2, 3, 4].map((t) => <option key={t} value={t}>Tier {t}</option>)}</select></label>
    </div>
    <label className="dg-field"><span>Blurb</span><textarea rows={3} value={blurb} onChange={(e) => setBlurb(e.target.value)} placeholder="A sentence or two — the hook that tells a DM what this is." /></label>
    <label className="dg-field"><span>Buy-link <span className="dg-muted sm">— where it's sold (DMs Guild, DriveThruRPG, itch…)</span></span><input value={buyLink} onChange={(e) => setBuyLink(e.target.value)} placeholder="https://…" /></label>
    <div className="dg-field"><span>Tags</span>
      <div className="dg-tagrow">{MODULE_TAGS.map((t) => <button key={t} type="button" className={"dg-tag" + (tags.includes(t) ? " on" : "")} onClick={() => toggle(tags, setTags, t)}>{t}</button>)}</div>
      <div className="dg-inlineadd"><input value={freeTag} onChange={(e) => setFreeTag(e.target.value)} placeholder="Add your own tag" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFree(); } }} /><button type="button" className="dg-btn ghost sm" onClick={addFree}>Add</button></div>
      {custom.length > 0 && <div className="dg-tagrow">{custom.map((t) => <button key={t} type="button" className="dg-tag on" onClick={() => toggle(tags, setTags, t)}>{t} ×</button>)}</div>}
    </div>
    {(licensedHeroes.length > 0 || licensedRuins.length > 0) && <div className="dg-field"><span>Features licensed heroes / ruins <span className="dg-muted sm">— credits them and links back to their card</span></span>
      <div className="dg-checklist">
        {licensedHeroes.map((c) => <label key={c.id} className="dg-checkrow"><input type="checkbox" checked={heroes.includes(c.id)} onChange={() => toggle(heroes, setHeroes, c.id)} /><span>{c.name} <span className="dg-muted sm">· hero</span></span></label>)}
        {licensedRuins.map((c) => <label key={c.id} className="dg-checkrow"><input type="checkbox" checked={ruins.includes(c.id)} onChange={() => toggle(ruins, setRuins, c.id)} /><span>{(c.bastion || {}).name} <span className="dg-muted sm">· ruin</span></span></label>)}
      </div>
    </div>}
    <div className="dg-row-actions">
      <button className="dg-btn ghost" onClick={close}>Cancel</button>
      <button className="dg-btn" disabled={!title.trim()} onClick={save}>{editing ? "Save changes" : "Publish listing"}</button>
    </div>
  </>);
}

// ---------------------------------------------------------------------------
// Organisation-side modals: org and module detail, store requests, licences, and polls.
// ---------------------------------------------------------------------------

export function PollCard({ poll, accountId, dispatch }) {
  return (
    <div className="dg-pollcard">
      <div className="dg-poll-h">📣 {poll.question || "Quick poll"}</div>
      {poll.meta && poll.meta.sub && <div className="dg-muted sm" style={{ marginBottom: 6 }}>{poll.meta.sub}</div>}
      <div className="dg-pollopts">
        {poll.options.map((o) => <button key={o.value} className="dg-btn sm" onClick={() => dispatch({ type: "ANSWER_POLL", pollId: poll.id, accountId, answer: o.value })}>{o.label}</button>)}
      </div>
    </div>
  );
}

export function LicenseModal({ modal, state, accountId, dispatch, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const ch = state.characters[modal.charId];
  if (!ch) return null;
  const isLoc = modal.assetType === "location";
  const what = isLoc ? (ch.bastion ? ch.bastion.name : "this keep") : ch.name;
  const useAs = isLoc ? "a location — its map, halls, and the ghost of " + ch.name : "an NPC";
  const already = !!ch.licensed;
  return (
    <div className="dg-licensemodal">
      <div className="dg-confirm-title">{already ? "Withdraw the license offer?" : "License " + what + " for author use?"}</div>
      {!already && !LICENSE_TERMS_REVIEWED && <div className="dg-samplewarn">⚠ SAMPLE license text. This consent wording must be reviewed by qualified counsel before this feature is enabled in production — do not treat the copy below as final or deployable.</div>}
      {already ? (
        <div className="dg-confirm-body">
          <p>Withdrawing removes <b>{what}</b> from authors&rsquo; browsing, so it can&rsquo;t be picked up for <b>new</b> modules. But per CC BY 4.0, any use already made under this license is <b>permanent</b> — a module that already credits {what} keeps its rights, and this can&rsquo;t undo that.</p>
          <div className="dg-row-actions" style={{ marginTop: 14 }}>
            <button className="dg-btn danger" onClick={() => { dispatch({ type: "WITHDRAW_LICENSE", charId: ch.id, by: accountId }); close(); }}>Withdraw the offer</button>
            <button className="dg-btn ghost" onClick={close}>Keep it licensed</button>
          </div>
        </div>
      ) : (
        <div className="dg-confirm-body">
          <p>You grant module authors a <b>Creative Commons Attribution 4.0 (CC BY 4.0)</b> license to use {what} as {useAs} in their adventures — the same license the SRD itself uses.</p>
          <p>An author may use, adapt, and publish {what}, and must credit it (a &ldquo;Featured in…&rdquo; attribution). You may <b>withdraw the offer for future use</b> at any time — but grants already made are <b>irrevocable</b>: a module that already credits {what} keeps its license forever. That permanence is the point — no disputes over what&rsquo;s already published.</p>
          <p className="dg-muted sm"><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">↗ Read the full CC BY 4.0 terms</a></p>
          <div className="dg-row-actions" style={{ marginTop: 14 }}>
            <button className="dg-btn" onClick={() => { dispatch({ type: "GRANT_LICENSE", charId: ch.id, by: accountId }); close(); }}>I grant this license</button>
            <button className="dg-btn ghost" onClick={close}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function StoreReqModal({ modal, state, dispatch, accountId, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  return (
    <>
      <h3 className="dg-modal-h">Request a new store</h3>
      <p className="dg-muted sm">Send this to the admin, who'll look up the details and add it. You can't add stores directly.</p>
      <label className="dg-field"><span>Store name</span><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Golden King" /></label>
      <label className="dg-field"><span>Where is it? (optional)</span><input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="City / cross-streets to help the admin find it" /></label>
      <div className="dg-row-actions">
        <button className="dg-btn" disabled={!name.trim()} onClick={() => { dispatch({ type: "REQUEST_STORE", by: accountId, name: name.trim(), note: note.trim() }); close(); }}>Send request</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

export function OrgModal({ modal, state, close, setModal, accountId, dispatch }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const o = orgRec(state, modal.orgId);
  if (!o) return (<><h3 className="dg-modal-h">Organization not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  return (
    <>
      <div className="dg-orghead"><OrgLogo org={o} size={44} /><div><h3 className="dg-modal-h" style={{ margin: 0 }}>{o.name}</h3><div className="dg-muted sm">{o.short ? o.short + " · " : ""}{o.region}</div></div></div>
      {o.tagline && <div className="dg-orgtag">{o.tagline}</div>}
      <div className="dg-insp-desc">{o.blurb}</div>
      {(o.highlights || []).length > 0 && (<>
        <div className="dg-insp-sec">Known for</div>
        <ul className="dg-orghighlights">{o.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
      </>)}
      {(o.phone || o.email || o.facebook) && (<>
        <div className="dg-insp-sec">Get in touch</div>
        <div className="dg-doclinks">
          {o.facebook && <a className="dg-doclink" href={o.facebook} target="_blank" rel="noreferrer">◆ Facebook</a>}
          {o.email && <a className="dg-doclink" href={"mailto:" + o.email}>✉ {o.email}</a>}
          {o.phone && <a className="dg-doclink" href={"tel:" + o.phone.replace(/[^0-9+]/g, "")}>☎ {o.phone}</a>}
        </div>
      </>)}
      <div className="dg-insp-sec">Where they play</div>
      {(o.storeIds || []).length > 0
        ? <div className="dg-storelist">{(o.storeIds || []).map((sid) => <StoreChip key={sid} state={state} storeId={sid} setModal={setModal} />)}</div>
        : <div className="dg-muted sm">{o.eventBased ? "Event-based — SCALE runs tables at conventions and game stores around Colorado. Check their Facebook for upcoming games." : "No listed venues yet."}</div>}
      {(o.leaderId || (o.assistantIds || []).length > 0) && (<>
        <div className="dg-insp-sec">Who runs it</div>
        {o.leaderId && <div className="dg-muted sm"><b>{accName(o.leaderId)}</b> · leader</div>}
        {(o.assistantIds || []).length > 0 && <div className="dg-muted sm">Assistants: {o.assistantIds.map(accName).join(", ")}</div>}
      </>)}
      {accountId && canManageOrg(state, accountId, o.id) && setModal && (
        <div className="dg-row-actions" style={{ marginTop: 12 }}>
          <button className="dg-btn" onClick={() => setModal({ kind: "orgedit", orgId: o.id })}>✎ Edit organization</button>
          <button className="dg-btn ghost" onClick={() => setModal({ kind: "eventbuild", orgId: o.id })}>✦ Build an event</button>
        </div>
      )}
      <div className="dg-row-actions" style={{ marginTop: 12 }}><button className="dg-btn ghost" onClick={close}>Close</button></div>
    </>
  );
}

export function ModuleModal({ modal, state, close }: { state: AppState; [k: string]: any }) {
  const adv = ADV_BY_ID[modal.advId];
  if (!adv) return (<><h3 className="dg-modal-h">Module not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  const code = adv.label.split("·")[0].trim();
  const upcoming = state.sessions.filter((s) => s.status !== "cancelled" && !s.draft && s.adventureId === modal.advId).sort((a, b) => (a.datetime < b.datetime ? -1 : 1));
  const fmt = (d) => { const x = new Date(d); return isNaN(x.getTime()) ? d : x.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); };
  return (
    <>
      <h3 className="dg-modal-h">{adv.label}</h3>
      <div className="dg-item-sub">{tierLabel(adv.tier)}{adv.levels ? " · Levels " + adv.levels : ""}{adv.dt ? " · " + adv.dt + " DT" : ""}</div>
      <div className="dg-insp-desc">{adv.summary}</div>
      <div className="dg-insp-stats">
        <StatRow k="Code" v={code} />
        <StatRow k="Tier" v={tierLabel(adv.tier)} />
        {adv.levels && <StatRow k="Recommended levels" v={adv.levels} />}
        {adv.dt && <StatRow k="Downtime awarded" v={adv.dt + " DT"} />}
      </div>
      <div className="dg-insp-sec">On the schedule</div>
      {upcoming.length === 0 ? <div className="dg-muted sm">Not currently scheduled.</div> :
        upcoming.map((s) => (
          <div key={s.id} className="dg-muted sm">{fmt(s.datetime)} · {s.dmId ? "DM " + accName(s.dmId) : "🎲 open table"}{s.seriesPart ? " · " + s.seriesPart : ""} · {s.signups.length}/{s.capacity} seats</div>
        ))}
      <div className="dg-srd">Catalog entry · D&amp;D Adventurers League</div>
      <div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div>
    </>
  );
}


