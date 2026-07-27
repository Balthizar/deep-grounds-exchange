import { SRD_ATTRIBUTION } from "../data/catalog";
import type { Action, AppState } from "../types";
import { Empty, SectionHead, listingTierLabel } from "../lib/ui";
import { accName } from "../lib/core";
// ============================================================================
// AUTHORS' DESK - the writer's tools.
//
// Everything an adventure author needs while writing: reference material, the
// draft pad, and (planned) the dungeon generator described in IDEAS.md.
//
// NOTE ON THE NAME: the in-app tab is still labelled "Resources", and the root
// component is still ResourcesView. This package is where the writing tools live
// and will grow, so it is named for that. Renaming the tab and the component is a
// one-line change in each place whenever you settle on "Authors' Desk", "Writers'
// Room", or something else - the package boundary is already correct.
// ============================================================================

import React, { useState } from "react";

// ---------------------- Resources (module authors) ----------------------
export function ResourcesView({ state, accountId, dispatch, setModal }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const [section, setSection] = useState("home");
  const licensedHeroes = Object.values(state.characters).filter((c) => c.licensed && c.status === "retired").sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  const licensedRuins = Object.values(state.characters).filter((c) => c.licensed && c.status === "dead" && c.bastion).sort((a, b) => ((a.bastion || {}).name || "").localeCompare((b.bastion || {}).name || ""));
  const groupByCampaign = (list) => { const g: Record<string, any> = {}; list.forEach((c) => { const k = c.campaign || "the Realms"; (g[k] = g[k] || []).push(c); }); return g; };
  const myListings = (state.moduleListings || []).filter((l) => l.authorId === accountId);

  if (section === "listings") {
    const active = myListings.filter((l) => !l.retracted);
    const retracted = myListings.filter((l) => l.retracted);
    const heroName = (id) => (state.characters[id] || {}).name || "a hero";
    const ruinName = (id) => ((state.characters[id] || {}).bastion || {}).name || "a ruin";
    const ListCard = ({ l, off }: { l: any; off?: any }) => (
      <div className={"dg-card" + (off ? " dg-listcard-off" : "")}>
        <div className="dg-card-h"><div>
          <span className="dg-item-name">{l.title}</span>
          <div className="dg-item-sub">{l.setting} · {listingTierLabel(l)}{off ? " · retracted" : ""}</div>
        </div></div>
        {l.blurb && <p className="dg-muted sm" style={{ margin: "4px 0" }}>{l.blurb}</p>}
        {l.tags.length > 0 && <div className="dg-tagrow">{l.tags.map((t) => <span key={t} className="dg-tag">{t}</span>)}</div>}
        {(l.heroes.length + l.ruins.length) > 0 && <div className="dg-muted sm" style={{ marginTop: 4 }}>Features {[...l.heroes.map(heroName), ...l.ruins.map(ruinName)].join(", ")}</div>}
        <div className="dg-row-actions" style={{ marginTop: 6 }}>
          {!off && l.buyLink && <a className="dg-btn ghost sm" href={l.buyLink} target="_blank" rel="noopener noreferrer">Buy-link ↗</a>}
          <button className="dg-btn ghost sm" onClick={() => setModal({ kind: "moduleedit", listingId: l.id })}>Edit</button>
          {off
            ? <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "RESTORE_MODULE_LISTING", by: accountId, listingId: l.id })}>Restore</button>
            : <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "RETRACT_MODULE_LISTING", by: accountId, listingId: l.id })}>Retract</button>}
        </div>
      </div>
    );
    return (<div className="dg-stack">
      <button className="dg-btn ghost sm" onClick={() => setSection("home")}>← Resources</button>
      <SectionHead eyebrow="Module Author" title="My Listings" note="Your community modules on the discovery shelf. A listing points buyers to where the module is sold — the app never sells anything itself." />
      <button className="dg-btn full" onClick={() => setModal({ kind: "moduleedit", listingId: "__new__" })}>+ New listing</button>
      {active.length === 0 && retracted.length === 0 && <Empty title="No listings yet" body="List a module you've published to point AL DMs to it. You choose the buy-link; nothing is sold here." />}
      <div className="dg-grid">{active.map((l) => <ListCard key={l.id} l={l} />)}</div>
      {retracted.length > 0 && <><div className="dg-insp-sec">Retracted</div><div className="dg-grid">{retracted.map((l) => <ListCard key={l.id} l={l} off />)}</div></>}
    </div>);
  }

  if (section === "heroes") {
    const g = groupByCampaign(licensedHeroes);
    return (<div className="dg-stack">
      <button className="dg-btn ghost sm" onClick={() => setSection("home")}>← Resources</button>
      {licensedHeroes.length === 0 ? <Empty title="No heroes licensed yet" body="When a player licenses a retired hero for author use, they'll appear here to cast as NPCs." /> :
        Object.keys(g).sort().map((camp) => (<div key={camp}>
          <SectionHead eyebrow="Licensed for your modules" title={"Heroes of " + camp} note="Retired heroes players have licensed (CC BY 4.0) for use as NPCs. Credit them when they appear." />
          <div className="dg-grid">{g[camp].map((c) => (
            <button key={c.id} className="dg-hallcard" onClick={() => setModal({ kind: "herohall", charId: c.id })}>
              <div className="dg-hallname">{c.name}</div>
              <div className="dg-muted sm">{[c.race, c.cls].filter(Boolean).join(" ")} · Tier {c.tier} · {c.faction || "Unaffiliated"}</div>
              <div className="dg-muted sm">Played by {accName(c.ownerId)}</div>
            </button>))}</div>
        </div>))}
    </div>);
  }
  if (section === "ruins") {
    const g = groupByCampaign(licensedRuins);
    return (<div className="dg-stack">
      <button className="dg-btn ghost sm" onClick={() => setSection("home")}>← Resources</button>
      {licensedRuins.length === 0 ? <Empty title="No ruins licensed yet" body="When a player licenses a fallen keep for author use, it'll appear here as a location." /> :
        Object.keys(g).sort().map((camp) => (<div key={camp}>
          <SectionHead eyebrow="Licensed for your modules" title={"The Ruins of " + camp} note="Fallen keeps players have licensed (CC BY 4.0) for use as locations." />
          <div className="dg-grid">{g[camp].map((c) => { const b = c.bastion; const fell = (b.defenderGraveyard || []).length; return (
            <button key={c.id} className="dg-hallcard dg-ruincard" onClick={() => setModal({ kind: "ruin", charId: c.id })}>
              <div className="dg-hallname">🏚 {b.name}</div>
              <div className="dg-muted sm">{[b.location, "the fallen keep of " + c.name].filter(Boolean).join(" · ")}</div>
              <div className="dg-muted sm">{(b.facilities || []).length} hall{(b.facilities || []).length === 1 ? "" : "s"}{fell ? " · " + fell + " in the ground" : ""}</div>
            </button>); })}</div>
        </div>))}
    </div>);
  }
  if (section === "writing") return <WritingResources back={() => setSection("home")} />;
  if (section === "draft") return <DraftPad back={() => setSection("home")} />;

  return (<div className="dg-stack">
    <SectionHead eyebrow="Module Author" title="Resources" note="Your workshop — the heroes and locations players have licensed for your modules, plus writing tools." />
    <div className="dg-grid">
      <button className="dg-rescard" onClick={() => setSection("heroes")}>
        <div className="dg-resicon">🦸</div><div className="dg-resname">Heroes of the Realms</div>
        <div className="dg-muted sm">{licensedHeroes.length} licensed hero{licensedHeroes.length === 1 ? "" : "es"} to cast as NPCs.</div>
      </button>
      <button className="dg-rescard" onClick={() => setSection("ruins")}>
        <div className="dg-resicon">🏚</div><div className="dg-resname">The Ruins</div>
        <div className="dg-muted sm">{licensedRuins.length} licensed keep{licensedRuins.length === 1 ? "" : "s"} to use as locations.</div>
      </button>
      <button className="dg-rescard" onClick={() => setSection("listings")}>
        <div className="dg-resicon">📓</div><div className="dg-resname">My Listings</div>
        <div className="dg-muted sm">{myListings.filter((l) => !l.retracted).length} module{myListings.filter((l) => !l.retracted).length === 1 ? "" : "s"} on the community shelf.</div>
      </button>
      <button className="dg-rescard" onClick={() => setSection("writing")}>
        <div className="dg-resicon">✍</div><div className="dg-resname">Writing resources</div>
        <div className="dg-muted sm">Links out to tools &amp; references for building adventures.</div>
      </button>
      <button className="dg-rescard" onClick={() => setSection("draft")}>
        <div className="dg-resicon">📝</div><div className="dg-resname">Drafting</div>
        <div className="dg-muted sm">A scratch pad for drafting module text.</div>
      </button>
    </div>
  </div>);
}

export function WritingResources({ back }) {
  const official = [
    { name: "System Reference Document (SRD 5.2)", url: "https://www.dndbeyond.com/srd", note: "The 2024 rules content you can legally build on, under CC BY 4.0. Includes the conversion guide and Creator FAQ." },
    { name: "Creative Commons BY 4.0 License", url: "https://creativecommons.org/licenses/by/4.0/", note: "The license the SRD — and your shared heroes and ruins — use. The attribution terms in full." },
    { name: "WotC Fan Content Policy", url: "https://company.wizards.com/en/legal/fancontentpolicy", note: "What you may do with D&D IP in free, unofficial fan content, and the required unofficial-content notice." },
    { name: "Dungeon Masters Guild", url: "https://www.dmsguild.com", note: "Publish adventures using official D&D settings, lore, and monsters under the Community Content Agreement." },
    { name: "DMs Guild — Content & Format Guidelines", url: "https://help.dmsguild.com/hc/en-us/articles/12776888583319-Content-Format-Logo-Artwork-Guidelines", note: "Formatting, logo, and artwork rules for Guild titles." },
    { name: "D&D Adventurers League", url: "https://dnd.wizards.com/adventurers-league", note: "The official organized-play rules your tables run under." },
  ];
  const tools = [
    { name: "The Homebrewery", url: "https://homebrewery.naturalcrit.com", note: "Format your module in the official 5e look (Markdown → PDF). Free." },
    { name: "GM Binder", url: "https://www.gmbinder.com", note: "Like the Homebrewery, with more styling options and templates." },
    { name: "Homebrew Creation", url: "https://homebrewcreation.com", note: "Free adventure templates and step-by-step outlining tools." },
    { name: "donjon", url: "https://donjon.bin.sh", note: "Generators for names, NPCs, dungeons, treasure, encounters, and more." },
    { name: "DriveThruRPG", url: "https://www.drivethrurpg.com", note: "Marketplace to publish and sell your finished PDFs." },
  ];
  const Card = (l, i) => <a key={i} className="dg-rescard" href={l.url} target="_blank" rel="noreferrer"><div className="dg-resname">↗ {l.name}</div><div className="dg-muted sm">{l.note}</div></a>;
  return (<div className="dg-stack">
    <button className="dg-btn ghost sm" onClick={back}>← Resources</button>
    {/* The equipment catalogue, the tools, the diseases: SRD 5.2, CC BY 4.0. The licence asks that
        attribution travel WITH the material, and Wizards prescribes this sentence exactly and forbids
        adding any other attribution to them — so it is quoted whole and nothing is added to it. */}
    <p className="dg-muted sm" style={{ borderLeft: "2px solid var(--dg-rule, #444)", paddingLeft: 10 }}>{SRD_ATTRIBUTION}</p>
    <SectionHead eyebrow="Writing resources" title="Official references" note="The authoritative sources for writing and publishing D&D content." />
    <div className="dg-grid">{official.map(Card)}</div>
    <SectionHead eyebrow="Writing resources" title="Popular tools" note="Community tools for drafting, formatting, and generating adventure content." />
    <div className="dg-grid">{tools.map(Card)}</div>
    <div className="dg-muted sm" style={{ marginTop: 8 }}>Want more of your own tools here? Tell me which you use and I&rsquo;ll add them.</div>
  </div>);
}

export function DraftPad({ back }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const copy = () => { try { navigator.clipboard.writeText((title ? title + "\n\n" : "") + body); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) {} };
  return (<div className="dg-stack">
    <button className="dg-btn ghost sm" onClick={back}>← Resources</button>
    <SectionHead eyebrow="Drafting" title="Scratch pad" note="A quick place to draft module text. Copy it out before you leave — this pad doesn't save across reloads yet." />
    <input className="dg-draft-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Working title…" />
    <textarea className="dg-draft-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Draft your adventure here…" rows={16} />
    <div className="dg-row-actions"><span className="dg-muted sm">{words} word{words === 1 ? "" : "s"}</span><button className="dg-btn sm" onClick={copy}>{copied ? "Copied ✓" : "Copy draft"}</button></div>
  </div>);
}

