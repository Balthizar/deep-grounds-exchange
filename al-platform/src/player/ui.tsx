import { playerPushReport } from "../lib/push";
// The one intentional cross-feature import in the app: the profile page shows a
// character's bastion region, so it renders the bastion package's own component rather
// than duplicating it. Everything else two packages share lives in lib/.
import { BastionRegionLine } from "../bastion/ui";
import { CARRIED_LIMITS, L5_STARTING_ITEMS, carriedCounts, itemBucket, legendaryTierBlocked, tierFromLevel, provOf, orgsOfAccount } from "../lib/rules";
import { CATALOG } from "../data/catalog";
import { CreditTrail, ItemEntryModal, StatRow, StorePicker, itemMetaLine, rarityOf } from "../lib/ui";
import { catName, isMundaneCat } from "../lib/core";
import { bForm } from "../lib/rules";
import { ACCOUNTS, accName, itemCat, orgRec } from "../lib/core";
import type { Action, AppState, CharacterRecord, ItemRecord } from "../types";
import { CharacterCard, Empty, OrgChip, ProvBadge, RARITY, RulesLinks, Seal, SectionHead, StoreChip, defaultEpitaph, getBlob, itemClassLabel, orgsForStore } from "../lib/ui";


import { orgsManagedBy, storesOf } from "../lib/rules";
// ============================================================================
// PLAYER UI - the roster and the people behind it.
// The profile page (a player and their characters, stores, bio) and the retirement
// screen (retired and fallen characters, their shelved gear, epitaphs and tales).
// The shared roster card itself lives in lib/ui - it is used from both.
// ============================================================================

import React, { useState } from "react";

// The account profile PAGE — its own tab, separate from the character roster (Frank, 27 Jul:
// "the account profile page should be its own separate page"). For now it is a basic profile:
// the associations strip. Settings, profile details, and friends lists will live here later.
export function AccountView({ state, accountId, dispatch }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  return (
    <div className="dg-stack">
      <AccountAssociations state={state} accountId={accountId} dispatch={dispatch} />
    </div>
  );
}

// ACCOUNT ASSOCIATIONS SURFACE (Frank's design, 27 Jul). A plain account-level strip — "who your
// account is associated with in the system" — on the profile page, NOT the character roster. It
// shows the reader their standing (mentor, provisional pipeline status, roles, org memberships)
// and, where the reader is an admin or org lead, lets them set the things those roles govern.
//
// This is the screen the reachability gate flagged as PENDING for SET_MENTOR, SET_PROVISIONAL,
// GRANT_ROLE, and SET_ORG_MEMBERSHIP. When it ships, those four drop off the worklist — and the
// gate confirms the dispatch actually happens rather than trusting that it does.
export function AccountAssociations({ state, accountId, dispatch }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const isAdmin = (state.roles[accountId] || []).includes("admin");
  const roles = state.roles[accountId] || ["player"];
  const mentor = state.mentors ? state.mentors[accountId] : null;
  const prov = provOf(state, accountId);
  const myOrgs = orgsOfAccount(state, accountId);

  const provLabel = { "none": "—", "provisional-dm": "Provisional DM (under supervision)", "certified": "Certified DM" };

  // Admin target selector for the two admin-gated controls (grant role, provisional status).
  const [target, setTarget] = useState("");
  const [roleToGrant, setRoleToGrant] = useState("dm");
  const [provState, setProvState] = useState("provisional-dm");
  const others = ACCOUNTS.filter((a) => a.id !== accountId);

  return (
    <div className="dg-assoc">
      <h3 className="dg-assoc-h">Your account</h3>

      {/* READ-ONLY STATUS — who you are in the system. */}
      <div className="dg-assoc-row"><span className="dg-assoc-k">Roles</span>
        <span className="dg-assoc-v">{roles.join(", ")}</span></div>

      <div className="dg-assoc-row"><span className="dg-assoc-k">Mentor</span>
        <span className="dg-assoc-v">{mentor ? accName(mentor) : "none assigned"}</span></div>

      <div className="dg-assoc-row"><span className="dg-assoc-k">DM pipeline</span>
        <span className="dg-assoc-v">{provLabel[prov] || prov}</span></div>

      <div className="dg-assoc-row"><span className="dg-assoc-k">Organizations</span>
        <span className="dg-assoc-v">{myOrgs.length ? myOrgs.map((o) => (orgRec(state, o) || {}).name || o).join(", ") : "none"}</span></div>

      {/* If a mentor was assigned to you, you may step away from the pairing (mentee-side). */}
      {mentor && (
        <div className="dg-assoc-actions">
          <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "SET_MENTOR", mentee: accountId, mentor: null })}>
            End mentorship with {accName(mentor)}
          </button>
        </div>
      )}

      {/* ADMIN CONTROLS — role grants and provisional status. These actions are admin-gated in the
          reducer; the surface simply exposes them to an admin who is already permitted. */}
      {isAdmin && (
        <div className="dg-assoc-admin">
          <h4 className="dg-assoc-subh">Admin: set another account's standing</h4>
          <label className="dg-field"><span>Account</span>
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">Choose an account…</option>
              {others.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>

          <div className="dg-assoc-ctl">
            <label className="dg-field"><span>Grant role</span>
              <select value={roleToGrant} onChange={(e) => setRoleToGrant(e.target.value)}>
                <option value="dm">DM</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button className="dg-btn sm" disabled={!target} onClick={() => dispatch({ type: "GRANT_ROLE", accountId: target, role: roleToGrant, by: accountId })}>
              Grant
            </button>
          </div>

          <div className="dg-assoc-ctl">
            <label className="dg-field"><span>Provisional status</span>
              <select value={provState} onChange={(e) => setProvState(e.target.value)}>
                <option value="provisional-dm">Provisional DM</option>
                <option value="certified">Certified DM</option>
                <option value="none">None</option>
              </select>
            </label>
            <button className="dg-btn sm" disabled={!target} onClick={() => dispatch({ type: "SET_PROVISIONAL", acc: target, state: provState, by: accountId })}>
              Set
            </button>
          </div>
        </div>
      )}

      {/* ORG LEADERSHIP — add or remove an account's org membership. Reducer-gated to admin or the
          org's leadership; shown when the reader leads at least one org. */}
      {orgsManagedBy(state, accountId).length > 0 && (
        <div className="dg-assoc-admin">
          <h4 className="dg-assoc-subh">Org leadership: membership</h4>
          <OrgMembershipControl state={state} accountId={accountId} dispatch={dispatch} />
        </div>
      )}
    </div>
  );
}

function OrgMembershipControl({ state, accountId, dispatch }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const managed = orgsManagedBy(state, accountId);
  const [org, setOrg] = useState(managed[0] || "");
  const [acct, setAcct] = useState("");
  const accts = ACCOUNTS.filter((a) => a.id !== accountId);
  return (
    <>
      <label className="dg-field"><span>Organization</span>
        <select value={org} onChange={(e) => setOrg(e.target.value)}>
          {managed.map((o) => <option key={o} value={o}>{(orgRec(state, o) || {}).name || o}</option>)}
        </select>
      </label>
      <label className="dg-field"><span>Account</span>
        <select value={acct} onChange={(e) => setAcct(e.target.value)}>
          <option value="">Choose an account…</option>
          {accts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </label>
      <div className="dg-assoc-ctl">
        <button className="dg-btn sm" disabled={!org || !acct} onClick={() => dispatch({ type: "SET_ORG_MEMBERSHIP", accountId: acct, orgId: org, join: true, by: accountId })}>Add to org</button>
        <button className="dg-btn ghost sm" disabled={!org || !acct} onClick={() => dispatch({ type: "SET_ORG_MEMBERSHIP", accountId: acct, orgId: org, join: false, by: accountId })}>Remove</button>
      </div>
    </>
  );
}

export function ProfileView({ state, accountId, dispatch, setModal, goBastion }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  // What has not been copied onto a sheet yet. Shown on the player's own profile so the
  // checklist is one click from the character it applies to.
  const pushCount = playerPushReport(state, accountId).count;
  const player = state.players[accountId];
  const chars = player ? player.characterIds.map((id) => state.characters[id]) : [];
  const shelf = Object.values(state.items).filter((it) => it.holder.type === "PLAYER_SHELF" && it.holder.id === accountId);
  const activeChars = chars.filter((c) => !c.status || c.status === "active");
  const myOrgs = [...new Set(storesOf(state, accountId).flatMap((sid) => orgsForStore(state, sid).map((o) => o.id)))];
  const [optsOpen, setOptsOpen] = useState(false);

  return (
    <div className="dg-stack">
      <SectionHead eyebrow="Player" title="My Roster" />
      <div className="dg-profilehead">
        <label className="dg-portrait owner" style={{ "--pfs": "64px" }} title={state.avatars && state.avatars[accountId] ? "Tap to change your photo" : "Tap to add a photo"}>
          {state.avatars && state.avatars[accountId]
            ? <img src={getBlob(state.avatars[accountId])} alt="" />
            : <div className="dg-portrait-empty"><svg viewBox="0 0 24 24" width="32" height="32"><circle cx="12" cy="8" r="4" fill="currentColor" /><path d="M4 21v-1c0-3.4 3.6-5 8-5s8 1.6 8 5v1z" fill="currentColor" /></svg></div>}
          <span className="dg-portrait-hint">{state.avatars && state.avatars[accountId] ? "change" : "add"}</span>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files![0]; if (!f) return; const r = new FileReader(); r.onload = () => dispatch({ type: "SET_AVATAR", accountId, dataURL: r.result }); r.readAsDataURL(f); e.target.value = ""; }} />
        </label>
        <div>
          <div className="dg-profilename">{accName(accountId)} <ProvBadge state={state} acct={accountId} /></div>
          <button className="dg-profileopts-toggle" onClick={() => setOptsOpen(!optsOpen)}>⚙ Profile &amp; settings {optsOpen ? "▴" : "▾"}</button>
          <div className={"dg-profileopts" + (optsOpen ? " open" : "")}>
          {state.avatars && state.avatars[accountId] && (
            <div className="dg-admin-row">
              <span>Your photo <span className="dg-muted sm">— tap it above to change</span></span>
              <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "SET_AVATAR", accountId, dataURL: null })}>Remove</button>
            </div>
          )}
          <div className="dg-storefield"><span>Home stores</span>
            <div className="dg-storelist">
              {storesOf(state, accountId).map((sid) => (
                <span key={sid} className="dg-storechipwrap">
                  <StoreChip state={state} storeId={sid} setModal={setModal} />
                  {storesOf(state, accountId).length > 1 && <button className="dg-chipx" title="Remove" onClick={() => dispatch({ type: "REMOVE_HOME_STORE", acc: accountId, storeId: sid })}>✕</button>}
                </span>
              ))}
            </div>
            <StorePicker state={state} setModal={setModal} exclude={storesOf(state, accountId)} placeholder="+ Add a store you play at…" onPick={(sid) => dispatch({ type: "ADD_HOME_STORE", acc: accountId, storeId: sid })} />
          </div>
          {myOrgs.length > 0 && <div className="dg-storefield"><span>Organizations</span><div className="dg-orgrow">{myOrgs.map((oid) => <OrgChip key={oid} state={state} orgId={oid} setModal={setModal} />)}</div></div>}
          {(() => {
            const managed = orgsManagedBy(state, accountId);
            if (managed.length === 0) return null;
            return <div className="dg-storefield"><span>You manage</span><div className="dg-orgrow" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>{managed.map((oid) => { const o = orgRec(state, oid); const role = o.leaderId === accountId ? "leader" : "assistant"; return (
              <div key={oid} className="dg-managed-org">
                <OrgChip state={state} orgId={oid} setModal={setModal} /> <span className="dg-factiontag">{role}</span>
                <div className="dg-row-actions" style={{ marginTop: 4 }}>
                  <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "orgedit", orgId: oid })}>✎ Edit</button>
                  <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "eventbuild", orgId: oid })}>✦ Build an event</button>
                </div>
              </div>
            ); })}</div></div>;
          })()}
          <div className="dg-storefield"><span>About me</span><BioBlock state={state} accountId={accountId} dispatch={dispatch} /></div>
          </div>
        </div>
      </div>
      {(() => {
        const r = state.roles[accountId] || ["player"];
        if (r.includes("dm") || r.includes("admin")) return null;
        return state.dmRequests.includes(accountId)
          ? <div className="dg-dminfo">Your Dungeon Master request is pending admin approval.</div>
          : <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "REQUEST_DM", accountId })}>Request Dungeon Master status</button>;
      })()}
      {!player ? <Empty title="No characters here" body="This account runs tables — switch to Player mode elsewhere, or add a character below." /> : (<>
      <div className="dg-chargrid">
        {activeChars.map((ch) => <CharacterCard key={ch.id} ch={ch} state={state} accountId={accountId} dispatch={dispatch} setModal={setModal} goBastion={goBastion} />)}
      </div>
      <button className="dg-btn ghost full" onClick={() => setModal({ kind: "charedit", accountId })}>+ Add a character</button>

      <SectionHead eyebrow="Player-attached" title="Shelf" note="Event & unclaimed certificates. Not bound to a character." />
      {shelf.length === 0 ? <Empty title="Your shelf gathers dust" body="Event awards and unclaimed certificates rest here, awaiting a hero to bear them." /> : (
        <div className="dg-grid">
          {shelf.map((it) => <ItemCard key={it.id} it={it} state={state} accountId={accountId} dispatch={dispatch} setModal={setModal} context="shelf" />)}
        </div>
      )}
      </>)}
      <RulesLinks docs={["alpg", "hub"]} />
    </div>
  );
}

export function RetirementView({ state, accountId, dispatch, setModal, goBastion }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const player = state.players[accountId];
  const chars = player ? player.characterIds.map((id) => state.characters[id]) : [];
  const retiredChars = chars.filter((c) => c.status === "retired");
  const fallenChars = chars.filter((c) => c.status === "dead");
  const activeChars = chars.filter((c) => !c.status || c.status === "active");
  const retShelf = Object.values(state.items).filter((it) => it.holder.type === "RETIREMENT_SHELF" && it.holder.id === accountId);
  // Keeps lost to neglect. Their owner is alive — this isn't a memorial, it's a consequence.
  const lostKeeps = chars.filter((c) => c.bastion && c.bastion.ruined && c.status !== "dead");
  return (
    <div className="dg-stack">
      <SectionHead eyebrow="Player" title="Retirement Roster" note="Heroes who've hung up their swords. They no longer take the field, but their tale goes on." />
      {retiredChars.length === 0 ? <Empty title="No retired heroes yet" body="When a character hangs up their sword, they'll rest here — gear on the shelf, story still being written." /> : (
        <div className="dg-chargrid">
          {retiredChars.map((ch) => <CharacterCard key={ch.id} ch={ch} state={state} accountId={accountId} dispatch={dispatch} setModal={setModal} goBastion={goBastion} retired />)}
        </div>
      )}
      {lostKeeps.length > 0 && (<>
        <SectionHead eyebrow="Nobody died here" title="Lost Keeps" note="Halls that emptied out while their lord was elsewhere. These heroes are alive and well — they simply have nowhere to go home to. What they left inside is gone: abandoned gear leaves your sheet for good and is never reacquired unless earned again in play (ALPG)." />
        <div className="dg-grid">
          {lostKeeps.map((ch) => (
            <div key={ch.id} className="dg-card dg-lostkeep">
              <div className="dg-card-h">
                <div>
                  <div className="dg-char-name">🏚 {ch.bastion.name}<span className="dg-retbadge">lost</span></div>
                  <div className="dg-char-meta">{ch.name} · {[bForm(ch.bastion)?.name, ch.bastion.location].filter(Boolean).join(" · ")}</div>
                </div>
              </div>
              <p className="dg-muted sm" style={{ marginTop: 6 }}>
                The household gave up on <b>{ch.name}</b> after {ch.level} weeks with nobody home, and then left one by one until the doors stood open.
                {(ch.bastion.relics || []).length > 0
                  ? <> The <b>{ch.bastion.relics.length}</b> {ch.bastion.relics.length === 1 ? "thing" : "things"} left inside {ch.bastion.relics.length === 1 ? "is" : "are"} out there somewhere now — off the sheet, but not gone from the world.</>
                  : <> There was nothing inside worth looting.</>}
              </p>
              {(ch.bastion.relics || []).length > 0 && (
                <div className="dg-relics" style={{ marginTop: 6 }}>
                  {(ch.bastion.relics || []).map((r, i) => <div key={i} className="dg-relic-line"><b>{r.name}</b> <span className="dg-muted sm">· {RARITY[r.rarity] ? RARITY[r.rarity].label : r.rarity}</span></div>)}
                </div>
              )}
              <div className="dg-charbtns">
                <button className="dg-logbtn" onClick={() => goBastion(ch.id)}>🏚 Walk the ruins</button>
                {accountId === ch.ownerId && <button className="dg-logbtn" title="Per the DMG, a hero can raise a new bastion — perhaps amid the ruins of the old one" onClick={() => setModal({ kind: "confirm", title: "Clear " + ch.bastion.name + "?", body: "The old keep is razed for good. " + ch.name + " can raise a new one — perhaps amid these very ruins. Anything sealed inside stays sealed.", confirmLabel: "Raze it", action: { type: "RAZE_BASTION", charId: ch.id, by: accountId } })}>Raze &amp; start again</button>}
              </div>
            </div>
          ))}
        </div>
      </>)}
      {fallenChars.length > 0 && (<>
        <SectionHead eyebrow="In memoriam" title="Graveyard" note="Heroes who fell and did not return. What they carried was lost with them; what they left stored at their bastion endures there as relics of the ruin." />
        <div className="dg-chargrid">
          {fallenChars.map((ch) => <GravestoneCard key={ch.id} ch={ch} state={state} accountId={accountId} dispatch={dispatch} setModal={setModal} goBastion={goBastion} />)}
        </div>
      </>)}
      <SectionHead eyebrow="Retired heroes' gear" title="Retirement Shelf" note="Gear from retired characters. It returns to them if they're called back — or you may hand it to another hero of the same campaign and tier." />
      {retShelf.length === 0 ? <Empty title="The armory stands empty" body="Gear from retired heroes waits here, ready to return to their hands or pass to another." /> : (
        <div className="dg-grid">
          {retShelf.map((it) => {
            const src = state.characters[it.shelvedFrom || ""];
            const cat = itemCat(it);
            const bound = it.itemClass === "UNTRADEABLE";
            const eligible = bound ? [] : activeChars.filter((c) => (!it.campaign || c.campaign === it.campaign) && (!src || c.tier === src.tier));
            return (
              <div key={it.id} className="dg-card">
                <div className="dg-item-name">{cat ? cat.name : it.catalogId}</div>
                <div className="dg-muted sm">From <b>{src ? src.name : "a retired hero"}</b>{bound ? " · bound — returns only to them" : ""}</div>
                {!bound && (eligible.length > 0
                  ? <select value="" onChange={(e) => e.target.value && dispatch({ type: "REASSIGN_SHELF_ITEM", itemId: it.id, toCharId: e.target.value, by: accountId })} style={{ marginTop: 8 }}>
                      <option value="">Hand to another hero…</option>
                      {eligible.map((c) => <option key={c.id} value={c.id}>{c.name} · Tier {c.tier}</option>)}
                    </select>
                  : <div className="dg-muted sm" style={{ marginTop: 6 }}>No eligible hero (needs same campaign &amp; tier).</div>)}
              </div>
            );
          })}
        </div>
      )}

      {(() => {
        const hall = Object.values(state.characters).filter((c) => c.shared && c.status === "retired").sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        return (<>
          <SectionHead eyebrow="The community remembers" title="Hall of Heroes" note="Retired heroes their players have shared — living legends an author might one day cast as an NPC. Open one to read what became of them." />
          {hall.length === 0 ? <Empty title="The hall stands quiet" body="No retired heroes have been enshrined yet. Share one of your own with the ☆ button on their card." /> : (
            <div className="dg-grid">
              {hall.map((c) => {
                const tales = (c.retireTale || []).filter((t) => t.text).length;
                return (
                  <button key={c.id} className="dg-hallcard" onClick={() => setModal({ kind: "herohall", charId: c.id })}>
                    <div className="dg-hallname">{c.name}<span className="dg-retbadge">🪦 Retired</span></div>
                    <div className="dg-muted sm">{[c.race, c.cls].filter(Boolean).join(" ")} · Tier {c.tier} · {c.faction || "Unaffiliated"}</div>
                    <div className="dg-muted sm">Played by {accName(c.ownerId)}{c.bastion ? " · keeps " + c.bastion.name : ""}{tales ? " · " + tales + " tale" + (tales !== 1 ? "s" : "") : ""}</div>
                  </button>
                );
              })}
            </div>
          )}
        </>);
      })()}

      {(() => {
        const ruins = Object.values(state.characters).filter((c) => c.shared && c.status === "dead" && c.bastion).sort((a, b) => ((a.bastion || {}).name || "").localeCompare((b.bastion || {}).name || ""));
        if (ruins.length === 0) return null;
        const byCampaign: Record<string, any> = {};
        ruins.forEach((c) => { const k = c.campaign || "the Realms"; (byCampaign[k] = byCampaign[k] || []).push(c); });
        return Object.keys(byCampaign).sort().map((camp) => (
          <div key={camp}>
            <SectionHead eyebrow="The community remembers" title={"The Ruins of " + camp} note="Fallen keeps their players have shared — haunted, decaying locations, each with its ghost and its dead. Open one to walk its halls." />
            <div className="dg-grid">
              {byCampaign[camp].map((c) => {
                const b = c.bastion;
                const fell = (b.defenderGraveyard || []).length;
                return (
                  <button key={c.id} className="dg-hallcard dg-ruincard" onClick={() => setModal({ kind: "ruin", charId: c.id })}>
                    <div className="dg-hallname">🏚 {b.name}</div>
                    <div className="dg-muted sm">{[b.location, "the fallen keep of " + c.name].filter(Boolean).join(" · ")}</div>
                    <div className="dg-muted sm">{(b.facilities || []).length} hall{(b.facilities || []).length === 1 ? "" : "s"}{fell ? " · " + fell + " defender" + (fell === 1 ? "" : "s") + " in the ground" : ""} · shared by {accName(c.ownerId)}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ));
      })()}
    </div>
  );
}

export function GravestoneCard({ ch, state, accountId, dispatch, setModal, goBastion }: { dispatch: React.Dispatch<Action>; state: AppState; ch: CharacterRecord; [k: string]: any }) {
  const canEdit = accountId === ch.ownerId;
  const [epi, setEpi] = useState(ch.epitaph || "");
  const [editing, setEditing] = useState(false);
  const epitaph = ch.epitaph || defaultEpitaph(ch);
  return (
    <div className="dg-grave">
      <div className="dg-grave-top">
        <div className="dg-grave-mark">✝</div>
        <div>
          <div className="dg-grave-name">{ch.name}</div>
          <div className="dg-muted sm">{[ch.race, ch.cls].filter(Boolean).join(" ")}{ch.level ? " · Level " + ch.level : ""} · Tier {ch.tier} · {ch.faction || "Unaffiliated"}</div>
          {(ch.credits || []).length > 0 && <div className="dg-muted sm" style={{ marginTop: 3 }}>✍ Featured in {(ch.credits || []).map((c) => c.module).join(", ")}</div>}
        </div>
      </div>
      {editing && canEdit ? (
        <div className="dg-graveedit">
          <textarea value={epi} onChange={(e) => setEpi(e.target.value)} rows={2} placeholder={defaultEpitaph(ch)} />
          <div className="dg-row-actions" style={{ marginTop: 6 }}>
            <button className="dg-btn sm" onClick={() => { dispatch({ type: "SET_EPITAPH", charId: ch.id, by: accountId, text: epi }); setEditing(false); }}>Set epitaph</button>
            <button className="dg-btn ghost sm" onClick={() => { setEpi(ch.epitaph || ""); setEditing(false); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="dg-epitaph">&ldquo;{epitaph}&rdquo;{canEdit && <button className="dg-linkbtn" title="Write the epitaph" onClick={() => { setEpi(ch.epitaph || ""); setEditing(true); }}> ✎</button>}</div>
      )}
      <div className="dg-charbtns">
        <button className="dg-logbtn" onClick={() => setModal({ kind: "logsheet", charId: ch.id })}>📜 Log sheet</button>
        {canEdit && <button className="dg-logbtn" title={ch.shared ? "Shared to the community Ruins — tap to make private" : "Share this ruin to the community (The Ruins of your campaign)"} onClick={() => dispatch({ type: "TOGGLE_SHARE_HERO", charId: ch.id, by: accountId })}>{ch.shared ? "★ Shared ruin" : "☆ Share the ruin"}</button>}
        {canEdit && ch.shared && <button className="dg-logbtn" style={(ch.licensed ? { color: "#2e5e2e", fontWeight: 600 } : null) as React.CSSProperties} title={ch.licensed ? "Licensed to authors as a location — tap to withdraw the offer" : "License this ruin for authors to use as a location (CC BY 4.0)"} onClick={() => setModal({ kind: "license", charId: ch.id, assetType: "location" })}>{ch.licensed ? "✓ Licensed (location)" : "✍ License as location"}</button>}
      </div>
      {ch.bastion && (
        <div className="dg-ruin">
          <div>🏚 <button className="dg-linkbtn" onClick={() => goBastion && goBastion(ch.id)}><b>{ch.bastion.name}</b></button> lies in ruin. <span className="dg-muted sm">— tap to walk its halls</span></div>
          <div className="dg-muted sm" style={{ marginTop: 3, fontStyle: "italic" }}>After {ch.name} fell, the folk of {ch.bastion.name} drifted away, and its halls were left to slow decay.</div>
          <div className="dg-muted sm" style={{ marginTop: 3, fontStyle: "italic" }}>Its halls are said to be haunted by {ch.name}&rsquo;s restless shade.</div>
          {(ch.bastion!.defenderGraveyard || []).length > 0 && <div className="dg-muted sm" style={{ marginTop: 3 }}>✝ {ch.bastion!.defenderGraveyard!.length} defender{ch.bastion!.defenderGraveyard!.length === 1 ? "" : "s"} fell defending it, and lie there still.</div>}
        </div>
      )}
    </div>
  );
}

export function lanesFor(it, state) {
  if (it.itemClass === "MAGIC_ITEM")   return { trade: true };
  if (it.itemClass === "EVENT_CERT")   return { assign: true };
  if (it.itemClass === "UNNAMED_CERT") return { gift: true };
  if (it.itemClass === "UNTRADEABLE")  return { reason: "not tradeable" };
  return {};
}

export function ItemCard({ it, state, accountId, dispatch, setModal, context }: { dispatch: React.Dispatch<Action>; state: AppState; it: ItemRecord; [k: string]: any }) {
  const cat = itemCat(it);
  const lanes = lanesFor(it, state);
  const player = state.players[accountId];
  return (
    <div className="dg-card item" style={{ "--rarity": rarityOf(cat).color }}>
      <div className="dg-card-h">
        <div>
          <button className="dg-item-name link" onClick={() => setModal({ kind: "inspect", itemId: it.id })}>{cat.name}</button>
          <div className="dg-item-sub"><span className="dg-rarity" style={{ color: rarityOf(cat).color }}>{rarityOf(cat).label}</span>
            <span className="dg-dot">·</span>{itemClassLabel(it.catalogId, it.itemClass)}</div>
        </div>
        <Seal prov={it.provenance} isEvent={it.itemClass === "EVENT_CERT"} review={it.review} />
      </div>
      {lanes.assign && (
        <div className="dg-lane">
          <div className="dg-lane-h">Assign to a character <span className="dg-free">free</span></div>
          <div className="dg-chips">
            {player.characterIds.filter((cid) => { const c = state.characters[cid]; return c && (!c.status || c.status === "active"); }).map((cid) => (
              <button key={cid} className="dg-chip" onClick={() => dispatch({ type: "ASSIGN_CERT", itemId: it.id, charId: cid, by: accountId })}>{state.characters[cid].name}</button>
            ))}
          </div>
        </div>
      )}
      {it.itemClass === "UNNAMED_CERT" && (
        <div className="dg-lane">
          <div className="dg-lane-h">Claim to a character <span className="dg-free">makes it theirs</span></div>
          <div className="dg-chips">
            {player.characterIds.filter((cid) => { const c = state.characters[cid]; return c && (!c.status || c.status === "active"); }).map((cid) => (
              <button key={cid} className="dg-chip" onClick={() => dispatch({ type: "CLAIM_CERT", itemId: it.id, charId: cid })}>{state.characters[cid].name}</button>
            ))}
          </div>
        </div>
      )}
      {lanes.gift && (
        <div className="dg-lane">
          <div className="dg-lane-h">Gift this certificate <span className="dg-free">one-way</span></div>
          <div className="dg-chips">
            {ACCOUNTS.filter((a) => a.kind === "player" && a.id !== accountId).map((a) => (
              <button key={a.id} className="dg-chip" onClick={() => dispatch({ type: "GIFT_CERT", itemId: it.id, toAccountId: a.id, by: accountId })}>to {a.name}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BioBlock({ state, accountId, dispatch }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const bio = (state.bios || {})[accountId] || "";
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(bio);
  if (editing) return (
    <div className="dg-bioedit">
      <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Who are you at the table? A sentence or two." />
      <div className="dg-row-actions">
        <button className="dg-btn sm" onClick={() => { dispatch({ type: "SET_BIO", accountId, bio: text.trim() }); setEditing(false); }}>Save</button>
        <button className="dg-btn ghost sm" onClick={() => { setText(bio); setEditing(false); }}>Cancel</button>
      </div>
    </div>
  );
  return (
    <div className="dg-bioblock">
      {bio ? <p className="dg-bio">{bio}</p> : <span className="dg-muted sm">No bio yet.</span>}
      <button className="dg-linkbtn" onClick={() => { setText(bio); setEditing(true); }}>{bio ? "Edit bio" : "Add a bio"}</button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Character modals - creating or importing a character, pregens, and the character sheet view.
// ---------------------------------------------------------------------------

// ALPG, "STARTING PLAY AT LEVEL 5": "Receive standard starting gear for your class and
// background, 500 GP, 40 Downtime Days (DT), and choose one of these starting magic item."
export const L5_START_GP = 500;

export const L5_START_DT = 40;

export function CharModal({ modal, state, close }: { state: AppState; [k: string]: any }) {
  const ch = state.characters[modal.charId];
  if (!ch) return (<><h3 className="dg-modal-h">Character not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  const inv = Object.values(state.items).filter((it) => it.holder.type === "CHARACTER" && it.holder.id === ch.id);
  return (
    <>
      <h3 className="dg-modal-h">{ch.name}</h3>
      <div className="dg-item-sub">{[ch.race, ch.cls].filter(Boolean).join(" ")}{ch.level ? " · Level " + ch.level : ""} · Tier {ch.tier}</div>
      <div className="dg-factiontag" style={{ marginTop: 6, display: "inline-block" }}>{ch.faction || "Unaffiliated"}</div>
      <div className="dg-insp-stats" style={{ marginTop: 10 }}>
        {ch.race && <StatRow k="Race" v={ch.race} />}
        <StatRow k="Class" v={ch.cls} />
        {ch.level && <StatRow k="Level" v={String(ch.level)} />}
        <StatRow k="Tier" v={"Tier " + ch.tier} />
        <StatRow k="Faction" v={ch.faction || "Unaffiliated"} />
        {ch.campaign && <StatRow k="Campaign" v={ch.campaign} />}
        <StatRow k="Downtime" v={ch.dt + " DT"} />
        <StatRow k="Items earned" v={String(inv.length)} />
      </div>
      {ch.ddb && <div style={{ marginTop: 10 }}><a className="dg-btn ghost sm" href={ch.ddb} target="_blank" rel="noreferrer">↗ Open on D&amp;D Beyond</a></div>}
      <div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div>
    </>
  );
}

export function CharEditModal({ modal, state, dispatch, close, accountId }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const existing = modal.charId ? state.characters[modal.charId] : null;
  const [name, setName] = useState(existing ? existing.name : "");
  const [race, setRace] = useState(existing ? existing.race || "" : "");
  const [cls, setCls] = useState(existing ? existing.cls || "" : "");
  const [level, setLevel] = useState(existing && existing.level ? String(existing.level) : "1");
  const [faction, setFaction] = useState(existing ? existing.faction || "" : "");
  const [campaign, setCampaign] = useState(existing ? existing.campaign || "Forgotten Realms" : "Forgotten Realms");
  const [ddb, setDdb] = useState(existing ? existing.ddb || "" : "");
  const [confirmDel, setConfirmDel] = useState(false);
  const [confirmRet, setConfirmRet] = useState(false);
  const [confirmKill, setConfirmKill] = useState(false);
  const [l5item, setL5item] = useState("l5_alltool");
  // Creating a character forks first: a brand-new one, or one they already play elsewhere.
  // "existing" means everything is carried in by hand - there is no items API to import from.
  const [mode, setMode] = useState<"ask" | "new" | "import">(modal.charId ? "new" : "ask");
  const [gp, setGp] = useState("0");
  const [dt, setDt] = useState("0");
  const [itemsFor, setItemsFor] = useState<string | null>(null);   // chain into the item loop
  const tier = tierFromLevel(level);
  const canSave = name.trim() && cls.trim();
  const FACTIONS = ["", "The Harpers", "Order of the Gauntlet", "Emerald Enclave", "Lords' Alliance", "Zhentarim"];
  const save = () => {
    if (!canSave) return;
    const char: any = { name: name.trim(), race: race.trim(), cls: cls.trim(), level: +level || 1, tier, faction, campaign: campaign.trim(), ddb: ddb.trim() };
    if (existing) dispatch({ type: "EDIT_CHARACTER", charId: existing.id, char, by: accountId });
    else {
      const l5 = (+level || 1) === 5;
      if (l5) { char.gp = L5_START_GP; char.dt = L5_START_DT; }   // ALPG: "Starting Play at Level 5"
      if (mode === "import") { char.gp = +gp || 0; char.dt = +dt || 0; char.imported = true; }
      dispatch({ type: "ADD_CHARACTER", accountId: modal.accountId, char, startingItem: (l5 && mode !== "import") ? l5item : undefined });
      if (mode === "import") { setItemsFor("PENDING"); return; }   // stay open - items come next
    }
    close();
  };
  // The character was just created by import - hand straight over to the item loop. The new
  // character is the last one added to this account, so no id needs inventing.
  if (itemsFor) {
    const ids = ((state.players || {})[modal.accountId] || {}).characterIds || [];
    const newId = ids[ids.length - 1];
    if (newId) return <ItemEntryModal modal={{ charId: newId, imported: true }} state={state}
      accountId={modal.accountId} dispatch={dispatch} close={close} />;
  }

  // Step one: which kind of character is this?
  if (mode === "ask") return (
    <>
      <h3 className="dg-modal-h">Add a character</h3>
      <p className="dg-muted sm">Is this someone new, or a character you already play?</p>
      <div className="dg-stack" style={{ marginTop: 10 }}>
        <button className="dg-btn full" onClick={() => setMode("new")}>
          A brand-new character
          <div className="dg-muted sm" style={{ fontWeight: 400 }}>Starts at level 1 - or level 5 with the starting package.</div>
        </button>
        <button className="dg-btn full ghost" onClick={() => setMode("import")}>
          A character I already play
          <div className="dg-muted sm" style={{ fontWeight: 400 }}>Bring them in as they stand - level, gold, downtime, then their inventory item by item.</div>
        </button>
      </div>
      <div className="dg-row-actions" style={{ marginTop: 14 }}>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );

  return (
    <>
      <h3 className="dg-modal-h">{existing ? "Edit character" : mode === "import" ? "Import a character" : "Add a character"}</h3>
      {mode === "import" && !existing && (
        <p className="dg-muted sm" style={{ marginBottom: 6 }}>
          Copy them across from your sheet exactly as they stand. Items come next, one at a time.
        </p>
      )}
      {existing && existing.image && existing.ownerId === modal.accountId && (
        <div className="dg-admin-row" style={{ marginBottom: 6 }}>
          <span><img src={getBlob(existing.image)} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", verticalAlign: "middle", marginRight: 8 }} />Their picture <span className="dg-muted sm">— tap the portrait on their card to change it</span></span>
          <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "SET_CHARACTER_IMAGE", charId: existing.id, by: modal.accountId, dataURL: null })}>Remove</button>
        </div>
      )}
      <label className="dg-field"><span>Name</span><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Character name" /></label>
      <div className="dg-field2">
        <label className="dg-field"><span>Race</span><input type="text" value={race} onChange={(e) => setRace(e.target.value)} placeholder="e.g. Human" /></label>
        <label className="dg-field"><span>Class</span><input type="text" value={cls} onChange={(e) => setCls(e.target.value)} placeholder="e.g. Fighter" /></label>
      </div>
      <div className="dg-field2">
        <label className="dg-field"><span>Level</span><input type="number" min="1" max="20" value={level} onChange={(e) => setLevel(e.target.value)} /></label>
        <label className="dg-field"><span>Tier (from level)</span><input type="text" value={"Tier " + tier} readOnly /></label>
      </div>
      {mode === "import" && !existing && (
        <div className="dg-field2">
          <label className="dg-field"><span>Gold on hand (GP)</span>
            <input type="number" min="0" value={gp} onChange={(e) => setGp(e.target.value)} /></label>
          <label className="dg-field"><span>Downtime banked (DT)</span>
            <input type="number" min="0" value={dt} onChange={(e) => setDt(e.target.value)} /></label>
        </div>
      )}
      {!existing && mode !== "import" && (+level || 1) === 5 && (
        <div className="dg-l5pack">
          <div className="dg-l5pack-h">✦ Level-5 starting package</div>
          <div className="dg-muted sm">Starting at level 5 grants <b>500 GP</b>, <b>40 DT</b>, and one starting magic item (ALPG):</div>
          <select value={l5item} onChange={(e) => setL5item(e.target.value)} style={{ marginTop: 6, width: "100%" }}>
            {L5_STARTING_ITEMS.map((cid) => <option key={cid} value={cid}>{CATALOG[cid] ? CATALOG[cid].name : cid}</option>)}
          </select>
        </div>
      )}
      <label className="dg-field"><span>Faction</span>
        <select value={faction} onChange={(e) => setFaction(e.target.value)}>
          {FACTIONS.map((f) => <option key={f} value={f}>{f || "— none —"}</option>)}
        </select>
      </label>
      <label className="dg-field"><span>Campaign</span><input type="text" value={campaign} onChange={(e) => setCampaign(e.target.value)} /></label>
      <label className="dg-field"><span>D&amp;D Beyond sheet link (optional)</span><input type="text" value={ddb} onChange={(e) => setDdb(e.target.value)} placeholder="https://www.dndbeyond.com/characters/…" /></label>
      <div className="dg-row-actions">
        <button className="dg-btn" onClick={save} disabled={!canSave}>{existing ? "Save changes" : "Add character"}</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
      {existing && (!existing.status || existing.status === "active") && !existing.pregen && (
        <div className="dg-delblock">
          {!confirmRet ? <button className="dg-btn ghost sm" onClick={() => setConfirmRet(true)}>🪦 Retire this character</button> : (
            <div className="dg-rulewarn">
              <div><b>Retire {existing.name}?</b> They hang up their sword and move to the Retirement Roster. Their gear goes to the Retirement Shelf — it returns if you call them back, or you can hand it to another hero of the same campaign &amp; tier.</div>
              <div className="dg-row-actions"><button className="dg-btn sm" onClick={() => { dispatch({ type: "RETIRE_CHARACTER", charId: existing.id, by: existing.ownerId }); close(); }}>Yes, retire</button><button className="dg-btn ghost sm" onClick={() => setConfirmRet(false)}>Keep adventuring</button></div>
            </div>
          )}
        </div>
      )}
      {existing && (!existing.status || existing.status === "active") && !existing.pregen && (
        <div className="dg-delblock">
          {!confirmKill ? <button className="dg-btn ghost sm" onClick={() => setConfirmKill(true)}>☠ Mark as fallen (permanent death)</button> : (
            <div className="dg-rulewarn">
              <div><b>Mark {existing.name} as fallen?</b> Use this only for a permanent-death adventure (e.g. Tomb of Annihilation). The character is lost for good and <b>all their gear is destroyed</b>. This is terminal — they can't be called back.</div>
              <div className="dg-row-actions"><button className="dg-btn danger sm" onClick={() => { dispatch({ type: "KILL_CHARACTER", charId: existing.id, by: existing.ownerId }); close(); }}>Yes — they have fallen</button><button className="dg-btn ghost sm" onClick={() => setConfirmKill(false)}>They live</button></div>
            </div>
          )}
        </div>
      )}
      {existing && (
        <div className="dg-delblock">
          {!confirmDel ? <button className="dg-btn ghost sm" onClick={() => setConfirmDel(true)}>Remove this character</button> : (
            <div className="dg-rulewarn">
              <div><b>Remove {existing.name}?</b> This permanently deletes the character along with its earned items and log history, and removes it from any table sign-ups. This can't be undone.</div>
              <div className="dg-row-actions"><button className="dg-btn danger sm" onClick={() => { dispatch({ type: "REMOVE_CHARACTER", charId: existing.id, accountId: existing.ownerId, by: accountId }); close(); }}>Yes, remove</button><button className="dg-btn ghost sm" onClick={() => setConfirmDel(false)}>Keep character</button></div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function PregenModal({ modal, state, dispatch, close, accountId }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const existing = modal.charId ? state.characters[modal.charId] : null;
  const [name, setName] = useState(existing ? existing.name : "");
  const [race, setRace] = useState(existing ? existing.race || "" : "");
  const [cls, setCls] = useState(existing ? existing.cls || "" : "");
  const [level, setLevel] = useState(existing && existing.level ? String(existing.level) : "1");
  const [faction, setFaction] = useState(existing ? existing.faction || "" : "");
  const [campaign, setCampaign] = useState(existing ? existing.campaign || "Forgotten Realms" : "Forgotten Realms");
  const [ddb, setDdb] = useState(existing ? existing.ddb || "" : "");
  const [confirmDel, setConfirmDel] = useState(false);
  const [addCat, setAddCat] = useState("bagholding");
  const [addCls, setAddCls] = useState("MAGIC_ITEM");
  const tier = tierFromLevel(level);
  const canSave = name.trim() && cls.trim();
  const FACTIONS = ["", "The Harpers", "Order of the Gauntlet", "Emerald Enclave", "Lords' Alliance", "Zhentarim"];
  const items = existing ? Object.values(state.items).filter((it) => it.holder.type === "CHARACTER" && it.holder.id === existing.id) : [];
  const save = () => {
    if (!canSave) return;
    const char: any = { name: name.trim(), race: race.trim(), cls: cls.trim(), level: +level || 1, tier, faction, campaign: campaign.trim(), ddb: ddb.trim() };
    if (existing) dispatch({ type: "EDIT_CHARACTER", charId: existing.id, char, by: accountId });
    else dispatch({ type: "ADD_PREGEN", dmId: modal.dmId, char });
    close();
  };
  return (
    <>
      <h3 className="dg-modal-h">{existing ? "Edit pre-gen" : "New pre-generated character"}</h3>
      <p className="dg-muted sm">A pre-gen can't be played, logged, or signed up — it exists to be stocked with items and handed to a player.</p>
      <label className="dg-field"><span>Name</span><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Character name" /></label>
      <div className="dg-field2">
        <label className="dg-field"><span>Race</span><input type="text" value={race} onChange={(e) => setRace(e.target.value)} placeholder="e.g. Human" /></label>
        <label className="dg-field"><span>Class</span><input type="text" value={cls} onChange={(e) => setCls(e.target.value)} placeholder="e.g. Fighter" /></label>
      </div>
      <div className="dg-field2">
        <label className="dg-field"><span>Level</span><input type="number" min="1" max="20" value={level} onChange={(e) => setLevel(e.target.value)} /></label>
        <label className="dg-field"><span>Tier (from level)</span><input type="text" value={"Tier " + tier} readOnly /></label>
      </div>
      <label className="dg-field"><span>Faction</span>
        <select value={faction} onChange={(e) => setFaction(e.target.value)}>
          {FACTIONS.map((f) => <option key={f} value={f}>{f || "— none —"}</option>)}
        </select>
      </label>
      <label className="dg-field"><span>Campaign</span><input type="text" value={campaign} onChange={(e) => setCampaign(e.target.value)} /></label>
      <label className="dg-field"><span>D&amp;D Beyond sheet link</span><input type="text" value={ddb} onChange={(e) => setDdb(e.target.value)} placeholder="https://www.dndbeyond.com/characters/…" /></label>
      {existing ? (
        <>
          <div className="dg-insp-sec">Items on this pre-gen</div>
          {(() => {
            const lim = CARRIED_LIMITS[existing.tier] || CARRIED_LIMITS[1];
            const counts = carriedCounts(state, existing.id);
            const addBucket = itemBucket(addCat, addCls);
            const addRarity = CATALOG[addCat] && CATALOG[addCat].rarity;
            const legBlocked = legendaryTierBlocked(addCat, existing.tier);
            const bucketFull = counts[addBucket] >= lim[addBucket];
            const bucketName = { unc: "Uncommon+", com: "Common", con: "Consumables" };
            return (
              <>
                <div className="dg-limline">AL carry limits (Tier {existing.tier}): Uncommon+ {counts.unc}/{lim.unc} · Common {counts.com}/{lim.com} · Consumables {counts.con}/{lim.con}</div>
                {items.length === 0 ? <div className="dg-muted sm">No items yet.</div> :
                  items.map((it) => (
                    <div key={it.id} className="dg-admin-row">
                      <span>{catName(it.catalogId)} · <span className="dg-muted sm">{itemMetaLine(it.catalogId, it.itemClass)}</span></span>
                      <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "DELETE_ITEM", itemId: it.id, by: accountId })}>Remove</button>
                    </div>
                  ))}
                <div className="dg-field2" style={{ marginTop: 8 }}>
                  <label className="dg-field"><span>Add item</span>
                    <select value={addCat} onChange={(e) => setAddCat(e.target.value)}>
                      {Object.values(CATALOG).filter((c) => c.rarity !== "unique").map((c) => <option key={c.id} value={c.id}>{c.name} · {rarityOf(c).label}</option>)}
                    </select>
                  </label>
                  <label className="dg-field"><span>Class</span>
                    {isMundaneCat(addCat)
                      ? <div className="dg-muted sm">Gear — mundane equipment. Not a magic item, no rarity, no carry slot.</div>
                      : <select value={addCls} onChange={(e) => setAddCls(e.target.value)}>
                      <option value="MAGIC_ITEM">Magic item</option>
                      <option value="UNTRADEABLE">Untradeable</option>
                      <option value="EVENT_CERT">Event certificate</option><option value="STORY_ITEM">Story item</option>
                    </select>}
                  </label>
                </div>
                {legBlocked ? <div className="dg-limwarn">Legendary items can't be carried until Tier 4.</div> :
                  bucketFull ? <div className="dg-limwarn">Tier {existing.tier} allows only {lim[addBucket]} {bucketName[addBucket]} item{lim[addBucket] !== 1 ? "s" : ""} — remove one first.</div> :
                  <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "ADD_PREGEN_ITEM", charId: existing.id, catalogId: addCat, itemClass: addCls, by: accountId })}>+ Add this item</button>}
              </>
            );
          })()}
        </>
      ) : <div className="dg-muted sm" style={{ marginTop: 6 }}>Save first, then re-open the pre-gen to stock it with items.</div>}
      <div className="dg-row-actions">
        <button className="dg-btn" onClick={save} disabled={!canSave}>{existing ? "Save changes" : "Create pre-gen"}</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
      {existing && (
        <div className="dg-delblock">
          {!confirmDel ? <button className="dg-btn ghost sm" onClick={() => setConfirmDel(true)}>Delete this pre-gen</button> : (
            <div className="dg-rulewarn">
              <div><b>Delete {existing.name}?</b> This removes the pre-gen and its items. This can't be undone.</div>
              <div className="dg-row-actions"><button className="dg-btn danger sm" onClick={() => { dispatch({ type: "REMOVE_CHARACTER", charId: existing.id, by: accountId }); close(); }}>Yes, delete</button><button className="dg-btn ghost sm" onClick={() => setConfirmDel(false)}>Keep</button></div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Character-side modals: the hall of heroes, retirement diaries, and pregen transfer.
// ---------------------------------------------------------------------------

export function HeroHallModal({ modal, state, accountId, dispatch, close }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const ch = state.characters[modal.charId];
  if (!ch) return null;
  const dead = ch.status === "dead";
  const tales = (ch.retireTale || []).filter((t) => t.text);
  const b = ch.bastion;
  const form = b && typeof bForm === "function" ? bForm(b) : null;
  return (
    <div className="dg-herohall">
      <div className="dg-hallhero-name">{ch.name}<span className="dg-retbadge">{dead ? "☠ Fallen" : "🪦 Retired"}</span></div>
      <div className="dg-muted">{[ch.race, ch.cls].filter(Boolean).join(" ")}{ch.level ? " · Level " + ch.level : ""} · Tier {ch.tier} · {ch.faction || "Unaffiliated"}</div>
      <div className="dg-muted sm" style={{ marginTop: 2 }}>Played by {accName(ch.ownerId)}</div>
      {b && !b.abandoned && (
        <div className="dg-hallkeep">
          <div className="dg-hallkeep-h">🏰 {b.name}</div>
          <div className="dg-muted sm">{[form && form.name, b.location, b.builtAtLevel ? "Built at level " + b.builtAtLevel : null].filter(Boolean).join(" · ")}</div>
          <BastionRegionLine b={b} ch={ch} dispatch={dispatch} accountId={accountId} />
          <div className="dg-muted sm">{(b.facilities || []).length} facilit{(b.facilities || []).length === 1 ? "y" : "ies"} · {(b.turns || []).length} turn{(b.turns || []).length !== 1 ? "s" : ""} tended</div>
        </div>
      )}
      {dead ? (<>
        <div className="dg-halldiary-h">✝ Their epitaph</div>
        <div className="dg-epitaph">&ldquo;{ch.epitaph || defaultEpitaph(ch)}&rdquo;</div>
      </>) : (<>
      <div className="dg-halldiary-h">📖 Their tale</div>
      {tales.length === 0 ? <div className="dg-muted sm">No tales have been written yet.</div> : tales.map((t) => (
        <div key={t.id} className="dg-tale">
          {t.seed && <div className="dg-taleseed">✦ {t.seed}</div>}
          <div className="dg-taletext">{t.text}</div>
          <div className="dg-muted sm" style={{ marginTop: 4 }}>{t.date}</div>
        </div>
      ))}
      </>)}
      <CreditTrail ch={ch} state={state} accountId={accountId} dispatch={dispatch} />
    </div>
  );
}

export function RetireDiary({ ch, accountId, dispatch }: { dispatch: React.Dispatch<Action>; ch: CharacterRecord; [k: string]: any }) {
  const [text, setText] = useState("");
  const tales = ch.retireTale || [];
  const canEdit = accountId === ch.ownerId;
  const first = ch.name || "";
  return (
    <div className="dg-diary">
      {tales.length === 0 && <div className="dg-muted sm">No entries yet. As {first} tends the keep, its doings appear here — each a prompt you can expand into a tale.</div>}
      {tales.map((t) => <DiaryEntry key={t.id} ch={ch} entry={t} accountId={accountId} dispatch={dispatch} canEdit={canEdit} />)}
      {canEdit && (
        <div className="dg-diaryadd">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={"Add a tale of " + first + "'s retirement…"} />
          <button className="dg-btn sm" disabled={!text.trim()} onClick={() => { dispatch({ type: "ADD_RETIRE_TALE", charId: ch.id, by: accountId, text }); setText(""); }}>Add a tale</button>
        </div>
      )}
    </div>
  );
}

export function DiaryEntry({ ch, entry, accountId, dispatch, canEdit }: { dispatch: React.Dispatch<Action>; ch: CharacterRecord; [k: string]: any }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.text || "");
  return (
    <div className={"dg-tale" + (entry.text ? "" : " prompt")}>
      {entry.seed && <div className="dg-taleseed">✦ {entry.seed}</div>}
      {editing && canEdit ? (
        <div>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder="Add to the story…" autoFocus />
          <div className="dg-row-actions" style={{ marginTop: 6 }}>
            <button className="dg-btn sm" onClick={() => { dispatch({ type: "EXPAND_RETIRE_TALE", charId: ch.id, by: accountId, taleId: entry.id, text: draft }); setEditing(false); }}>Save</button>
            <button className="dg-btn ghost sm" onClick={() => { setDraft(entry.text || ""); setEditing(false); }}>Cancel</button>
          </div>
        </div>
      ) : (<>
        {entry.text ? <div className="dg-taletext">{entry.text}</div> : <div className="dg-muted sm">A moment at the keep, awaiting its tale.</div>}
        <div className="dg-talefoot">
          <span className="dg-muted sm">{entry.date}</span>
          {canEdit && <button className="dg-linkbtn" onClick={() => { setDraft(entry.text || ""); setEditing(true); }}>✎ {entry.text ? "Add to the story" : "Tell this tale"}</button>}
        </div>
      </>)}
    </div>
  );
}

export function RetireDiaryModal({ modal, state, accountId, dispatch }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const ch = state.characters[modal.charId];
  if (!ch) return null;
  return (
    <div className="dg-diarymodal">
      <div className="dg-hallhero-name">📖 {ch.name}&rsquo;s Retirement Diary</div>
      <div className="dg-muted sm" style={{ marginBottom: 10 }}>Each entry is a moment at the keep — expand any of them into a tale, or add your own. Nothing here is ever lost.</div>
      <RetireDiary ch={ch} accountId={accountId} dispatch={dispatch} />
    </div>
  );
}

export function PregenTransferModal({ modal, state, dispatch, close, accountId }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const ch = state.characters[modal.charId];
  const [to, setTo] = useState("");
  if (!ch) return (<><h3 className="dg-modal-h">Not found</h3><div className="dg-row-actions"><button className="dg-btn ghost" onClick={close}>Close</button></div></>);
  const items = Object.values(state.items).filter((it) => it.holder.type === "CHARACTER" && it.holder.id === ch.id);
  const targets = ACCOUNTS.filter((a) => a.id !== ch.pregenOwner);
  return (
    <>
      <h3 className="dg-modal-h">Transfer {ch.name}</h3>
      <p className="dg-muted sm">Hand this pre-generated character — with its {items.length} item{items.length !== 1 ? "s" : ""} — to a player. It becomes a normal, playable character on their roster and leaves your pre-gen list.</p>
      <label className="dg-field"><span>Give to</span>
        <select value={to} onChange={(e) => setTo(e.target.value)}>
          <option value="">— choose a player —</option>
          {targets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </label>
      <div className="dg-row-actions">
        <button className="dg-btn" disabled={!to} onClick={() => { dispatch({ type: "TRANSFER_PREGEN", charId: ch.id, toAccount: to, by: accountId }); close(); }}>Transfer character</button>
        <button className="dg-btn ghost" onClick={close}>Cancel</button>
      </div>
    </>
  );
}


