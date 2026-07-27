import { threadCtx } from "../lib/core";
import type { Action, AppState } from "../types";
import { Empty, RARITY, SectionHead, getBlob } from "../lib/ui";
import { accName, catName, itemCat, orgRec } from "../lib/core";
import {
  CARD_NOTICES,
  canTradeAcct,
  isAdmin,
  isAlert,
  isBlockedBy,
  isOrgId,
  isTradeableClass,
  orgsManagedBy,
  unreadFor,
} from "../lib/rules";

// ============================================================================
// SOCIAL UI - messages and notifications.
// Player-to-player and player-to-DM threads, trade proposals in conversation, and
// the notification inbox with its per-notice rendering.
// ============================================================================

import React, { useState } from "react";

export function orgIdOf(pid) { return isOrgId(pid) ? pid.slice(4) : null; }

export function partyName(state: AppState, id) { if (isOrgId(id)) { const o = orgRec(state, orgIdOf(id)); return o ? (o.short || o.name) : "Organization"; } return accName(id); }

// ── Notice render dispatch table (O(1) lookup vs. a 40-branch ternary) ─────────
// Add a notice type: add one entry here. Unknown types fall through to _default.
export const NH = ({ children }) => <div className="dg-notice-h">{children}</div>;

export const NOTICE_VIEW = {
  charmgift: (n) => <><NH>✹ A Charm is offered to you</NH><p><b>{n.from}</b> offers <b>{n.char}</b> a <b>{n.item}</b>. It is waiting in escrow and does not age there — its week starts the moment you accept. If you are sitting down at a table soon, accept it just before you play. Gift-only; it cannot be traded or sold.</p></>,
  charmgiftok: (n) => <><NH>✹ Your gift was accepted</NH><p><b>{n.char}</b> accepted the <b>{n.item}</b>. Its week now runs on their clock.</p></>,
  charmgiftno: (n) => <><NH>A Charm offer was closed</NH><p>The <b>{n.item}</b> offer involving <b>{n.char}</b> was declined or withdrawn. The charm stays where it was, still live, no longer frozen.</p></>,
  charmcap: (n) => <><NH>At the carried-charm cap</NH><p><b>{n.char}</b> is at the ALPG Tier {n.tier} carried-charm limit ({n.limit}) — live charm items count against it (SR-13). The gift stays waiting in escrow, frozen; accept it the moment a slot opens — a charm spent, faded, or unchecked.</p></>,
  charmdupe: (n) => <><NH>Already carrying that Charm</NH><p><b>{n.char}</b> already holds a live <b>{n.item}</b> — the DMG says you can't gain this Charm again while you still have it. The gift stays waiting in escrow; accept it once the first one is spent or fades.</p></>,
  gift: (n) => <><NH>Gift received</NH><p><b>{n.from}</b> gifted you <b>{n.item}</b>. It's on your shelf under My Roster — claim it to a character when you like.</p></>,
  auth: (n) => <><NH>Item authenticated</NH><p>Your <b>{n.item}</b> was authenticated by <b>{n.by}</b>. It's now verified — you can equip it.</p></>,
  resubmit: (n) => <><NH>Log resubmitted</NH><p><b>{n.char}</b>'s “{n.adventure}” log was corrected and resubmitted — it's back on your DM Desk for review.</p></>,
  role: (n) => <><NH>Role granted</NH><p>You've been granted <b>{n.role}</b> status. Use the mode toggle at the top to switch into it.</p></>,
  signup: (n) => <><NH>New sign-up</NH><p><b>{n.who}</b> signed up for your table — {n.adv}.</p></>,
  sesscancel: (n) => <><NH>Session cancelled</NH><p>A session you'd signed up for — {n.adv} — was cancelled by the DM.</p></>,
  sessionedited: (n) => <><NH>A table you're in was updated</NH><p>The DM changed your {n.when} table{n.changed ? " (now " + n.adv + ", was " + n.changed + ")" : " — " + n.adv}. Check the schedule for the details.</p></>,
  tradestale: (n) => <><NH>A trade couldn't complete</NH><p>One of the items had already moved on to another trade, so this proposal was cancelled. Nothing was charged. If you still want to swap, propose it fresh.</p></>,
  orgleader: (n) => <><NH>✦ You now lead {n.org}</NH><p>An admin named you the leader of <b>{n.org}</b>. You can edit its page, run its events, and appoint assistants from the Community tab — no DM or admin role needed.</p></>,
  orgassistant: (n) => <><NH>✦ You're now an assistant for {n.org}</NH><p>The leader of <b>{n.org}</b> named you an assistant. You can help edit its page and run its events from the Community tab.</p></>,
  orgscheduler: (n) => <><NH>✦ You're now a scheduler for {n.org}</NH><p>You'll handle the Warhorn worklist for <b>{n.org}</b>. Open the <b>Organization</b> mode to see sign-ups and tables waiting to be entered.</p></>,
  warhornsignup: (n) => <><NH>➕ Warhorn: add a player</NH><p><b>{n.who}</b> signed up for {n.adv} at <b>{n.event}</b>. Add them on Warhorn, then check it off in the Organization tab's worklist.</p></>,
  report: (n) => <><NH>⚑ Message reported</NH><p><b>{n.who}</b> reported a message from <b>{n.about}</b>. Open your Messages to review it.</p></>,
  warn: (n) => <><NH>⚠ Administrator warning</NH><p>{n.reason} Please keep messages respectful — continued harassment may lead to suspension.</p></>,
  ban: (n) => <><NH>Account suspended</NH><p>An administrator has suspended your account until {new Date(n.until).toLocaleString()}.</p></>,
  pregen: (n) => <><NH>New character received</NH><p>{n.from} transferred a pre-generated character — <b>{n.char}</b> — to your roster. It's ready to play.</p></>,
  authreq: (n) => <><NH>Authentication requested</NH><p><b>{n.who}</b> asked you to authenticate <b>{n.item}</b>. Open <b>Messages</b> to review it and authenticate — or ask for more detail.</p></>,
  disposalreq: (n) => <><NH>Item disposal to review</NH><p><b>{n.char}</b> wants to release <b>{n.item}</b>. Review it under <b>DM Desk → Item disposals</b> and approve or reject.</p></>,
  disposalok: (n) => <><NH>Disposal recorded</NH><p><b>{n.by}</b> approved letting go of your <b>{n.item}</b>. It's left play and is recorded on your logsheet.</p></>,
  slotclaim: (n) => <><NH>Item to verify</NH><p><b>{n.char}</b> rolled a <b>{n.rarity} {String(n.table || "").toLowerCase()}</b> slot and entered <b>{n.item}</b>{n.source ? <> from <i>{n.source}</i>{n.page ? " p." + n.page : ""}</> : null}. Check it against the book, then verify or send it back.</p></>,
  slotverified: (n) => <><NH>Item verified</NH><p><b>{n.by}</b> checked <b>{n.item}</b> against the book. It's on <b>{n.char}</b>'s sheet now.</p></>,
  slotrejected: (n) => <><NH>Item sent back</NH><p><b>{n.by}</b> couldn't verify <b>{n.item}</b> for <b>{n.char}</b>{n.reason ? <> — {n.reason}</> : null}. The slot is open again; re-enter it from the book.</p></>,
  slotnodm: (n) => <><NH>Waiting on a DM</NH><p><b>{n.char}</b>'s <b>{n.item}</b> is recorded but no DM at your store could be notified. Ask a DM to verify it.</p></>,
  dmitemreq: (n) => <><NH>Mentee authored an item</NH><p><b>{n.who}</b> created <b>{n.item}</b>{n.rarity ? " (" + n.rarity + ")" : ""}{n.adventure ? <> for <i>{n.adventure}</i></> : null} on <b>{n.char}</b>'s sheet. Review it before it becomes real.</p></>,
  dmitemok: (n) => <><NH>Item approved</NH><p><b>{n.by}</b> approved your <b>{n.item}</b>. It's on the character's sheet.</p></>,
  dmitemno: (n) => <><NH>Item sent back</NH><p><b>{n.by}</b> didn't approve <b>{n.item}</b>{n.reason ? <> — {n.reason}</> : null}. It hasn't entered play.</p></>,
  dmitemnomentor: (n) => <><NH>No mentor assigned</NH><p>Your <b>{n.item}</b> is waiting, but you have no mentor on record. Ask an organiser to assign one.</p></>,
  importreq: (n) => <><NH>Imported inventory to check</NH><p><b>{n.char}</b> typed in an existing character's items by hand. Check them against the books and verify each one.</p></>,
  importrejected: (n) => <><NH>An imported item was sent back</NH><p><b>{n.by}</b> couldn't verify <b>{n.item}</b> on <b>{n.char}</b>{n.reason ? <> — {n.reason}</> : null}. Re-enter it from the book.</p></>,
  pushdue: (n) => <><NH>Your character sheet is behind</NH><p>You play in under an hour{n.at ? <> — <b>{n.at.replace("T", " ")}</b></> : null}, and <b>{n.count}</b> change{n.count === 1 ? "" : "s"} from the Exchange {n.count === 1 ? "has" : "have"} not been copied onto your sheet yet. Open the push report and work down it.</p></>,
  leveloffer: (n) => <><NH>Level up?</NH><p>Your table is complete. <b>{n.char}</b> may take a level, or decline it — you keep everything else either way [ALPG-316]. At levelling, take the fixed hit points for your class plus modifiers.</p><div className="dg-row-actions"><button className="dg-btn sm" onClick={() => n.dispatch({ type: "ACCEPT_LEVEL", sessionId: n.sessionId, by: n.accountId })}>Take the level</button><button className="dg-btn ghost sm" onClick={() => n.dispatch({ type: "DECLINE_LEVEL", sessionId: n.sessionId, by: n.accountId })}>Stay at {n.level}</button></div></>,
  paperreq: (n) => <><NH>Item earned elsewhere</NH><p><b>{n.char}</b> is claiming <b>{n.item}</b> from {n.kind === "certificate" ? "an event certificate" : "a table outside the Exchange"}{n.adventure ? <> — <i>{n.adventure}</i></> : null}. Check the paperwork before it counts.</p></>,
  paperok: (n) => <><NH>Claim verified</NH><p><b>{n.by}</b> verified <b>{n.item}</b> for <b>{n.char}</b>. It's on the sheet.</p></>,
  paperno: (n) => <><NH>Claim sent back</NH><p><b>{n.by}</b> couldn't verify <b>{n.item}</b> for <b>{n.char}</b>{n.reason ? <> — {n.reason}</> : null}.</p></>,
  levelup: (n) => <><NH>{n.char} reached level {n.level}</NH><p>You spent downtime to catch up. <b>Update your D&D Beyond or paper sheet</b> to match — a DM may spot-check it at any time.</p></>,
  sheetsync: (n) => <><NH>Update {n.char}'s sheet</NH><p>You collected rewards from {n.adventure}. <b>Update your D&D Beyond or paper sheet</b> to match: {n.updates.join(", ")}. A DM may spot-check it at any time.</p></>,
  bastionneglect: (n) => <><NH>{n.urgent ? "⚠ Your bastion is nearly lost" : "Your bastion is being neglected"}</NH><p><b>{n.bastion}</b> has gone <b>{n.neglect}</b> of <b>{n.threshold}</b> turns untended. {n.urgent ? "One more lapsed turn and the hirelings abandon it — take a bastion turn now." : "Take a bastion turn to tend it before it's abandoned."}</p></>,
  bastionabandoned: (n) => <><NH>🏚 {n.bastion} has been abandoned</NH><p>After too many untended turns, the hirelings left and the site was looted. You can start a new bastion — perhaps amid the ruins of the old.</p></>,
  facilitydormant: (n) => (
    <>
      <NH>The {n.room.toLowerCase()} at {n.bastion} has gone quiet</NH>
      <div className="dg-letter">
        <p>The last of it went out on the cart this morning. There&rsquo;s nothing in there now but the floor.</p>
        <p>Nobody can work a room with nothing in it. Put something back and we&rsquo;ll open it again.</p>
        <div className="dg-letter-sign">— the household</div>
      </div>
    </>
  ),
  bastionwalkout: (n) => {
    const first = (n.who || "").split(" ")[0];
    // "There are 1 of us left" is how you can tell a machine wrote it. Count properly.
    const howMany = n.left > 1 ? "There are " + n.left + " of us left." : n.left === 1 ? "There's just me now." : "That was the last of us.";
    return (
      <>
        <NH>{n.fate === "dead" ? "A letter from " + n.bastion : "A note from " + n.bastion}</NH>
        <div className="dg-letter">
          <p>{n.selfSigned
            ? <>I&rsquo;m the last one, and I&rsquo;m going too. I&rsquo;ve pulled the door to; it won&rsquo;t hold long. I waited longer than the others did &mdash; I want you to know that.</>
            /* NB: the reason tables are written in the third person ("...their tools are still on the
               rack"), so the last one out never recites theirs. They just say goodbye. */
            : n.fate === "dead"
              ? <>{n.who} {n.why}. We buried {first} by the wall. {n.left > 0 ? howMany : "There is nobody left to sit with " + first + "."}</>
              : <>{n.who} {n.why}. {howMany}</>}</p>
          <p>{n.left > 0 ? "Come home." : "Don't hurry."}</p>
          <div className="dg-letter-sign">{n.from ? "— " + n.from + (n.fromRole ? ", " + n.fromRole : "") : "— unsigned. Found nailed to the door."}</div>
        </div>
      </>
    );
  },
  bastionruined: (n) => (
    <>
      <NH>{n.bastion} stands open</NH>
      <div className="dg-letter">
        <p>Nobody has been by in some time. The gate is off its hinges and the road has taken what it wanted.{n.relics > 0 ? " What you left inside is not inside any more." : ""}</p>
        <p>You can build again here, if you like. The stone doesn&rsquo;t hold it against you.</p>
        <div className="dg-letter-sign">— no one. There is no one left to write.</div>
      </div>
    </>
  ),
  credited: (n) => <><NH>✍ {n.who} is now canon</NH><p>An author credited your {n.assetType} <b>{n.who}</b> in their module <b>“{n.module}”</b>{n.author ? " (" + accName(n.author) + ")" : ""}. A retired hero — or a fallen keep — becomes part of a published adventure.</p></>,
  combinevote: (n) => <><NH>🤝 Combine bastions?</NH><p><b>{n.who}</b> proposes combining <b>{n.aBast}</b> with your <b>{n.bBast}</b> so your garrisons defend each other. Open <b>Messages</b> to cast your vote and chat it over.</p></>,
  storereq: (n) => <><NH>New store requested</NH><p><b>{n.who}</b> asked to add <b>{n.store}</b>. Look it up and add it in Guild Admin → Stores.</p></>,
  storeflag: (n) => <><NH>Store info reported</NH><p><b>{n.who}</b> flagged the <b>{n.field}</b> for <b>{n.store}</b> as wrong. Re-check and update it in Guild Admin → Stores.</p></>,
  poll: (n) => <><NH>📣 A poll needs your answer</NH><p>{n.question || "A poll is waiting for your response."} Answer it from the card at the top of the screen.</p></>,
  mentoroffer: (n) => <><NH>🎓 Shadow mentors found</NH><p>{n.count} DM{n.count !== 1 ? "s are" : " is"} willing to mentor you. Choose one from the card at the top of the screen to schedule your shadow session.</p></>,
  nomentor: (n) => <><NH>No mentor available right now</NH><p>No DM at {n.store} is available to shadow you at the moment. This isn't about your readiness — there's simply no mentor free right now. Please check back, or ask an admin to try again later.</p></>,
  shadowset: (n) => <><NH>You have a shadow</NH><p><b>{n.who}</b> will shadow one of your tables{n.when ? " on " + n.when : ""} as a trainee DM. They'll observe and file a reflection afterward.</p></>,
  observerlog: (n) => <><NH>Shadow reflection filed</NH><p><b>{n.who}</b> submitted their observer reflection. Review it on your DM Desk and decide if they're ready to run their own table.</p></>,
  provreq: (n) => <><NH>🎓 Provisional DM recommendation</NH><p><b>{n.mentor}</b> vouches that <b>{n.who}</b> is ready to run a shadowed table. Promote them in User approvals.</p></>,
  needmentor: (n) => <><NH>Trainee needs another mentor</NH><p><b>{n.who}</b>'s mentor felt they need more time. Run "Find a shadow mentor" again — the DM who passed is now excluded.</p></>,
  mentee: (n) => <><NH>You have a mentee</NH><p><b>{n.who}</b> is now your provisional DM mentee. They'll bring their questions to you first and schedule a table for you to shadow. You can suggest their first adventure from the catalogue.</p></>,
  mentortable: (n) => <><NH>Your mentee scheduled a table</NH><p><b>{n.who}</b> scheduled a table on {n.when} for you to supervise. Confirm you're available on the schedule — it won't open for sign-ups until you accept.</p></>,
  mentoraccepted: (n) => <><NH>Mentor confirmed</NH><p><b>{n.who}</b> confirmed they'll supervise your table on {n.when}. It's now open for sign-ups.</p></>,
  mentordeclined: (n) => <><NH>Mentor can't make it</NH><p><b>{n.who}</b> isn't available for your {n.when} table, so it was released — no harm done. Pick another night your mentor is free.</p></>,
  provdm: (n) => <><NH>You're a provisional DM</NH><p>You've been promoted to provisional DM under <b>{n.mentor}</b>. Your DM tab is unlocked (marked provisional) — every table you run will be shadowed by your mentor.</p></>,
  provlog: (n) => <><NH>Mentee logged a session</NH><p><b>{n.who}</b> filed a provisional DM log for a table you supervised. Review it on your DM Desk and decide if they're ready to run alone.</p></>,
  certreq: (n) => <><NH>🎓 Certification recommendation</NH><p><b>{n.mentor}</b> says <b>{n.who}</b> is ready to run a table on their own. Certify them in User approvals.</p></>,
  certready: (n) => <><NH>Recommended for certification</NH><p><b>{n.mentor}</b> approved your session and recommended you to run tables solo. The admin will make it official.</p></>,
  certified: () => <><NH>🏅 You're a certified DM</NH><p>You've been certified. You now run tables on your own — no mentor ride-along, and your session logs self-certify. Welcome to the roster.</p></>,
  menteecert: (n) => <><NH>Your mentee graduated</NH><p><b>{n.who}</b> was certified as a full DM. Nicely mentored — that's the whole point.</p></>,
  provnotready: (n) => <><NH>Keep working with your mentor</NH><p>Your mentor felt you're not quite ready to run alone yet ({n.n} of 3). Keep running shadowed tables — you'll get there.</p></>,
  swapneeded: (n) => <><NH>Provisional DM needs a new mentor</NH><p><b>{n.who}</b> has had three "not ready" reviews in a row. Find them a new mentor in User approvals — the current one is excluded.</p></>,
  swapmentee: () => <><NH>Getting you a fresh perspective</NH><p>After a few reviews, we're pairing you with a new mentor so you get fresh eyes. The admin is setting that up — you'll get options to choose from.</p></>,
  mentorswapped: (n) => <><NH>New mentor assigned</NH><p><b>{n.mentor}</b> is now your mentor. Bring your questions to them, and they'll supervise your next tables.</p></>,
  advsuggest: (n) => <><NH>🎓 Mentor suggests an adventure</NH><p>Your mentor <b>{n.mentor}</b> suggests <b>{n.adv}</b> for your first table. You'll see it offered when you schedule.</p></>,
  wishtable: (n) => <><NH>⭐ A wishlisted adventure is on the schedule</NH><p><b>{n.adv}</b>{n.dm ? <> is being run by <b>{n.dm}</b></> : null}{n.when ? <> on {n.when}</> : null} — one you starred in the Catalogue. Head to the Schedule to grab a seat.</p></>,
  eventnew: (n) => <><NH>✦ New event</NH><p><b>{n.event}</b> is happening on {n.date}{n.price ? " · " + n.price : ""}. Find its tables on the schedule and sign up once a DM claims one.</p></>,
  eventrecruit: (n) => <><NH>✦ DMs wanted for an event</NH><p><b>{n.event}</b> on {n.date} has open tables. Head to the schedule (filter by the event) and claim one to run.</p></>,
  eventassign: (n) => <><NH>✦ You've been assigned a table</NH><p>You've been assigned to run a table at <b>{n.event}</b> on {n.when}. It's on your schedule — pick your prep and it's ready for sign-ups.</p></>,
  sessioncomplete: (n) => <><NH>✓ Session complete — add your rewards</NH><p><b>{n.dm}</b> marked <b>{n.adv}</b> complete and confirmed the treasure. Open it on the schedule and tap “Add rewards to my log sheet.”</p></>,
  dmflag: (n) => <><NH>A DM was flagged</NH><p>A peer raised a concern about <b>{n.who}</b>'s table. It's on your DM oversight panel. Their next tables will quietly recruit a check-in.</p></>,
  monitorset: (n) => <><NH>Check-in in place</NH><p><b>{n.who}</b> will quietly sit in at <b>{n.dm}</b>'s next table and report back.</p></>,
  monitorverdict: (n) => <><NH>Check-in report</NH><p>A check-in on <b>{n.dm}</b>'s table came in — {n.corrected ? "the concern was addressed" : "the concern is still open"}{n.more ? ", with additional notes" : ""}. See DM oversight.</p></>,
  oversightthreshold: (n) => <><NH>⚠ Oversight threshold reached</NH><p><b>{n.who}</b> now has three distinct unresolved flags. You can demote them to provisional from DM oversight — they'll be re-paired with a mentor.</p></>,
  demoted: (n) => <><NH>You've been moved to provisional</NH><p>After several concerns, you've been moved back to provisional DM status so a mentor can support you. This is about growth, not punishment — here's what came up:</p>
    {(n.attributed || []).map((a, i) => <p key={i} className="dg-reflect"><span className="dg-reflect-q">{a.by} · {a.date}</span><br />{a.concern}</p>)}
    {(n.anon || []).length > 0 && <p className="dg-reflect"><span className="dg-reflect-q">Additional concerns observed</span><br />{n.anon.join("; ")}</p>}
    {(n.mentors || []).length > 0 && <p><b>Available mentors:</b> {n.mentors.join(", ")}. The admin will help you choose one.</p>}</>,
  obsready: (n) => <><NH>Your mentor recommended you</NH><p><b>{n.mentor}</b> approved your reflection and recommended you for provisional DM. The admin will make it official.</p></>,
  obsnotready: () => <><NH>Keep going</NH><p>Your mentor felt you're not quite ready to run your own table yet. You can shadow another DM — the admin will help set that up.</p></>,
  invalidate: (n) => <><NH>Reversal notice</NH><p>{n.reason}. This unwound {(n.trades || []).length} trade{(n.trades || []).length !== 1 ? "s" : ""}.</p>
    <p><b>Returned to you:</b> {(n.items || []).join(", ") || "—"}{(n.recreated || []).length > 0 && <span className="dg-recreated"> (recreated: {n.recreated.join(", ")})</span>}</p>
    <p><b>Downtime refunded:</b> {n.dt || 0} DT</p></>,
  _default: (n) => <><NH>Notice</NH><p>{n.reason || n.question || "You have a new notification."}</p></>,
};

// Deep-link target per notice type → { tab, session?, bastion? }. Routes the user to where the
// notification is actually resolved, instead of leaving them to hunt for it.
export const NOTICE_TARGET = {
  // Schedule (I focus the specific table when I know it)
  wishtable:     (n) => ({ tab: "schedule", session: n.sessionId }),
  sessioncomplete:(n) => ({ tab: "schedule", session: n.sessionId }),
  mentortable:   (n) => ({ tab: "schedule", session: n.sessionId }),
  mentoraccepted:(n) => ({ tab: "schedule", session: n.sessionId }),
  mentordeclined:(n) => ({ tab: "schedule" }),
  sessionedited: (n) => ({ tab: "schedule", session: n.sessionId }),
  sesscancel:    ()  => ({ tab: "schedule" }),
  advsuggest:    ()  => ({ tab: "schedule" }),
  eventnew:      ()  => ({ tab: "schedule" }),
  eventrecruit:  ()  => ({ tab: "schedule" }),
  eventassign:   (n) => ({ tab: "schedule", session: n.sessionId }),
  signup:        (n) => ({ tab: "schedule", session: n.sessionId }),
  // Market
  auth:          ()  => ({ tab: "market" }),
  tradestale:    ()  => ({ tab: "market" }),
  invalidate:    ()  => ({ tab: "market" }),
  // Roster / player sheet
  gift:          ()  => ({ tab: "profile" }),
  pregen:        ()  => ({ tab: "profile" }),
  disposalok:    ()  => ({ tab: "profile" }),
  slotclaim:     ()  => ({ tab: "dm" }),
  slotverified:  ()  => ({ tab: "profile" }),
  slotrejected:  ()  => ({ tab: "profile" }),
  slotnodm:      ()  => ({ tab: "profile" }),
  dmitemreq:     ()  => ({ tab: "dm" }),
  dmitemok:      ()  => ({ tab: "dm" }),
  dmitemno:      ()  => ({ tab: "dm" }),
  dmitemnomentor:()  => ({ tab: "dm" }),
  importreq:     ()  => ({ tab: "dm" }),
  importrejected:()  => ({ tab: "profile" }),
  pushdue:       ()  => ({ tab: "profile" }),
  leveloffer:    ()  => ({ tab: "profile" }),
  paperreq:      ()  => ({ tab: "dm" }),
  paperok:       ()  => ({ tab: "profile" }),
  paperno:       ()  => ({ tab: "profile" }),
  levelup:       ()  => ({ tab: "profile" }),
  sheetsync:     ()  => ({ tab: "profile" }),
  role:          ()  => ({ tab: "profile" }),
  poll:          ()  => ({ tab: "profile" }),      // interactive card sits atop every view
  mentoroffer:   ()  => ({ tab: "profile" }),
  warn:          ()  => ({ tab: "messages" }),
  ban:           ()  => ({ tab: "messages" }),
  // Bastions (focus the keep)
  bastionneglect:  (n) => ({ tab: "bastions", bastion: n.charId }),
  bastionabandoned:(n) => ({ tab: "bastions", bastion: n.charId }),
  // Community
  credited:      ()  => ({ tab: "community" }),
  orgleader:     ()  => ({ tab: "community" }),
  orgassistant:  ()  => ({ tab: "community" }),
  // Organization mode
  orgscheduler:  ()  => ({ tab: "org" }),
  warhornsignup: ()  => ({ tab: "org" }),
  // Messages
  combinevote:   ()  => ({ tab: "messages" }),
  authreq:       ()  => ({ tab: "messages" }),
  report:        ()  => ({ tab: "messages" }),
  // DM Desk
  disposalreq:   ()  => ({ tab: "dm" }),
  resubmit:      ()  => ({ tab: "dm" }),
  provlog:       ()  => ({ tab: "dm" }),
  observerlog:   ()  => ({ tab: "dm" }),
  shadowset:     ()  => ({ tab: "dm" }),
  mentee:        ()  => ({ tab: "dm" }),
  provdm:        ()  => ({ tab: "dm" }),
  certified:     ()  => ({ tab: "dm" }),
  certready:     ()  => ({ tab: "dm" }),
  menteecert:    ()  => ({ tab: "dm" }),
  provnotready:  ()  => ({ tab: "dm" }),
  mentorswapped: ()  => ({ tab: "dm" }),
  swapmentee:    ()  => ({ tab: "dm" }),
  obsready:      ()  => ({ tab: "dm" }),
  obsnotready:   ()  => ({ tab: "dm" }),
  nomentor:      ()  => ({ tab: "dm" }),
  demoted:       ()  => ({ tab: "dm" }),
  // Guild Admin
  provreq:       ()  => ({ tab: "admin" }),
  certreq:       ()  => ({ tab: "admin" }),
  swapneeded:    ()  => ({ tab: "admin" }),
  needmentor:    ()  => ({ tab: "admin" }),
  storereq:      ()  => ({ tab: "admin" }),
  storeflag:     ()  => ({ tab: "admin" }),
  dmflag:        ()  => ({ tab: "admin" }),
  monitorset:    ()  => ({ tab: "admin" }),
  monitorverdict:()  => ({ tab: "admin" }),
  oversightthreshold:() => ({ tab: "admin" }),
};

export function noticeTarget(n) {
  const f = NOTICE_TARGET[n.type];
  if (f) return f(n);
  return { tab: (n.ctx === "admin" ? "admin" : n.ctx === "dm" ? "dm" : n.ctx === "org" ? "org" : "profile") };
}

export function NotificationsView({ state, accountId, mode, dispatch, setTab, goSchedule, goBastion }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const mine = state.notices.filter((n) => n.accountId === accountId && (n.ctx || "player") === mode && !CARD_NOTICES.has(n.type));
  const alerts = mine.filter((n) => isAlert(n.type));
  const infos = mine.filter((n) => !isAlert(n.type));
  const go = (n) => {
    const t = noticeTarget(n);
    if (t.session && state.sessions.some((se) => se.id === t.session)) goSchedule(t.session);
    else if (t.bastion && state.characters[t.bastion] && state.characters[t.bastion].bastion) goBastion(t.bastion);
    else setTab(t.tab);
    if (!isAlert(n.type)) dispatch({ type: "DISMISS_NOTICE", id: n.id });   // informational → following the link handles it; alerts clear only on their action
  };
  if (!mine.length) return <Empty title="You're all caught up" body="Notifications land here as things happen — sign-ups, rewards, mentor requests, scheduled tables, and more. Follow one to go straight to where it's handled." />;
  const row = (n) => (
    <div key={n.id} className="dg-notice">
      {(NOTICE_VIEW[n.type] || NOTICE_VIEW._default)(n)}
      <button className="dg-btn sm" onClick={() => go(n)}>Go there →</button>
    </div>
  );
  return (
    <div>
      {alerts.length > 0 && (
        <>
          <SectionHead eyebrow="Needs a response" title="Action needed" note="These stay until you resolve them — follow each to where it's handled." />
          <div className="dg-notices flush dg-alerts">{alerts.map(row)}</div>
        </>
      )}
      <SectionHead eyebrow="Your inbox" title="Notifications" note="Informational — following the link clears each one." />
      {infos.length > 0 ? <div className="dg-notices flush">{infos.map(row)}</div> : <div className="dg-muted sm" style={{ marginTop: 8 }}>Nothing new to read.</div>}
    </div>
  );
}

// ---------------------- Messages ----------------------
export function MessagesView({ state, accountId, dispatch, mode }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const [selId, setSelId] = useState(null);
  const [draft, setDraft] = useState("");
  const [showProp, setShowProp] = useState(false);
  const [wantId, setWantId] = useState("");
  const [giveId, setGiveId] = useState("");
  const [reported, setReported] = useState<any[]>([]);
  const managedOrgPs = mode === "org" ? orgsManagedBy(state, accountId).map((oid) => "org:" + oid) : [];
  const selfOf = (t) => mode === "org" ? (t.participants.find((p) => managedOrgPs.includes(p)) || accountId) : accountId;
  const myThreads = mode === "org"
    ? (state.threads || []).filter((t) => t.participants.some((p) => managedOrgPs.includes(p)))
    : state.threads.filter((t) => t.participants.includes(accountId) && threadCtx(t, accountId) === mode);
  const sel = myThreads.find((t) => t.id === selId);
  const canTrade = mode === "player" && canTradeAcct(state, accountId) && Object.values(state.characters).some((c) => c.ownerId === accountId);

  const send = (fromId, to, ctxA, ctxB) => {
    if (!draft.trim()) return;
    dispatch({ type: "SEND_MESSAGE", from: fromId, to, text: draft.trim(), fromCtx: ctxA || "player", toCtx: ctxB || "player" });
    setDraft("");
  };

  if (sel) {
    const meId = selfOf(sel);
    const other = sel.participants.find((p) => p !== meId);
    const otherIsOrg = isOrgId(other);
    const meIsOrg = isOrgId(meId);
    const otherCanTrade = !otherIsOrg && Object.values(state.characters).some((c) => c.ownerId === other);
    const theirItems = Object.values(state.items).filter((it) => isTradeableClass(it.itemClass) && it.holder.type === "CHARACTER" && state.characters[it.holder.id] && state.characters[it.holder.id].ownerId === other && !it.escrow);
    const wantItem = wantId ? state.items[wantId] : null;
    const myEligible = wantItem ? Object.values(state.items).filter((it) => isTradeableClass(it.itemClass) && it.holder.type === "CHARACTER" && state.characters[it.holder.id] && state.characters[it.holder.id].ownerId === accountId && !it.escrow && itemCat(it).rarity === itemCat(wantItem).rarity && it.campaign === wantItem.campaign) : [];
    // if the org's latest word to me is a no-reply announcement, I can't write back
    const lastMsg = sel.messages[sel.messages.length - 1];
    const replyLocked = !meIsOrg && otherIsOrg && lastMsg && lastMsg.from === other && lastMsg.noReply;

    const sendProposal = () => {
      const give = state.items[giveId], want = state.items[wantId];
      if (!give || !want) return;
      dispatch({ type: "SEND_TRADE_PROPOSAL", from: accountId, to: other, fromCharId: give.holder.id, fromItemId: giveId, toCharId: want.holder.id, toItemId: wantId, text: draft.trim() });
      setDraft(""); setShowProp(false); setWantId(""); setGiveId("");
    };

    return (
      <div className="dg-stack">
        <button className="dg-btn ghost sm" onClick={() => { setSelId(null); setShowProp(false); }}>‹ All conversations</button>
        <SectionHead eyebrow={meIsOrg ? partyName(state, meId) + " · conversation" : "Conversation"} title={partyName(state, other)} />
        {other && !otherIsOrg && !meIsOrg && !sel.ticket && !isAdmin(state, other) && mode !== "admin" && (
          <div className="dg-blockrow">
            {isBlockedBy(state, accountId, other)
              ? <><span className="dg-blocknote">You've blocked {accName(other)} — their messages to you will bounce.</span><button className="dg-btn ghost sm" onClick={() => dispatch({ type: "UNBLOCK_USER", acc: accountId, target: other })}>Unblock</button></>
              : <button className="dg-btn ghost sm" onClick={() => dispatch({ type: "BLOCK_USER", acc: accountId, target: other })}>⊘ Block {accName(other)}</button>}
          </div>
        )}
        {sel.ticket && (() => {
          const tit = state.items[sel.ticket.itemId];
          const done = sel.ticket.status === "AUTHENTICATED";
          return (
            <div className="dg-ticketpanel">
              <div className="dg-ticket-h">🔎 Item authentication — {tit ? catName(tit.catalogId) : "item"}</div>
              <div className="dg-muted sm">{done ? "✓ Authenticated by " + accName(sel.ticket.reviewer) : "Pending review by " + accName(sel.ticket.reviewer) + ". Talk it through below."}</div>
              {!done && accountId === sel.ticket.reviewer && (
                <div className="dg-row-actions" style={{ marginTop: 6 }}>
                  <button className="dg-btn sm" onClick={() => dispatch({ type: "AUTHENTICATE_TICKET", threadId: sel.id })}>✓ Authenticate this item</button>
                  <span className="dg-muted sm">— or ask for more detail in a message</span>
                </div>
              )}
              {!done && accountId === sel.ticket.player && (
                <label className="dg-photobtn2" style={{ marginTop: 6 }}>📷 Attach certificate photo
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files![0]; if (!f) return; const r = new FileReader(); r.onload = () => dispatch({ type: "SEND_MESSAGE", from: accountId, to: sel.ticket.reviewer, text: "Certificate photo attached.", photo: r.result, fromCtx: threadCtx(sel, meId), toCtx: threadCtx(sel, other) }); r.readAsDataURL(f); }} />
                </label>
              )}
            </div>
          );
        })()}
        <div className="dg-chatbox">
          {(() => { let lastMine = -1; sel.messages.forEach((m, i) => { if (m.from === meId && !m.bounce) lastMine = i; }); const otherRead = sel.lastRead[other] || 0; return sel.messages.map((m, i) => {
            const key = sel.id + ":" + i;
            return (
            <div key={i} className={"dg-msg" + (m.from === meId ? " mine" : "")}>
              {m.bounce && m.forAcct === accountId && (
                <div className="dg-bounce">
                  <div className="dg-bounce-h">⛔ Message not delivered</div>
                  <div>{m.reason}</div>
                  {m.text && <div className="dg-bounce-quote">“{m.text}”</div>}
                </div>
              )}
              {m.report && (
                <div className="dg-reportcard">
                  <div className="dg-report-h">⚑ Reported message</div>
                  <div className="dg-report-meta">{accName(m.from)} reported a message from {m.report.senderName}</div>
                  <div className="dg-report-quote">“{m.report.text}”</div>
                  {mode === "admin" && (
                    <div className="dg-modhint">This player is now listed under <b>Guild Admin → User approvals → Under review</b>, where you can warn, suspend, or deactivate them.</div>
                  )}
                </div>
              )}
              {m.from === "__system__" && (m.ticketEvent === "authenticated" || m.combineEvent) ? (
                <div className="dg-sysnote">{m.combineEvent ? "🤝 " : "✓ "}{m.text}</div>
              ) : (m.text || m.photo) && !m.bounce && (
                <div className={"dg-bubble" + (m.from === meId ? " mine" : "")}>
                  <div className="dg-bubble-who">{partyName(state, m.from)}{m.broadcast ? " · announcement" : ""}{m.ticketEvent === "opened" ? " · authentication request" : ""}</div>
                  {m.text && <div>{m.text}</div>}
                  {m.photo && <img className="dg-certthumb" src={getBlob(m.photo)} alt="attachment" style={{ marginTop: 6, maxWidth: 200, borderRadius: 8 }} />}
                </div>
              )}
              {m.proposal && <ProposalCard msg={m} state={state} accountId={accountId} dispatch={dispatch} mode={mode} />}
              {m.combine && <CombineProposalCard msg={m} state={state} accountId={accountId} dispatch={dispatch} />}
              {m.text && !m.bounce && m.from !== meId && !isOrgId(m.from) && mode !== "admin" && mode !== "org" && (
                reported.includes(key)
                  ? <div className="dg-reported">✓ Reported to an admin</div>
                  : <button className="dg-reportbtn" onClick={() => { dispatch({ type: "REPORT_MESSAGE", from: accountId, sender: m.from, text: m.text, fromCtx: mode }); setReported((r) => [...r, key]); }}>⚑ Report to admin</button>
              )}
              {i === lastMine && <div className={"dg-receipt" + (otherRead > lastMine ? " read" : "")}>{otherRead > lastMine ? "✓✓ Read" : "✓ Sent"}</div>}
            </div>
          ); }); })()}
        </div>

        {canTrade && !sel.ticket && !otherIsOrg && !meIsOrg && otherCanTrade && (!showProp ? (
          <button className="dg-btn ghost sm" onClick={() => setShowProp(true)}>⇄ Propose a trade</button>
        ) : canTrade && !sel.ticket && !otherIsOrg && !meIsOrg && otherCanTrade ? (
          <div className="dg-propform">
            <div className="dg-prop-h">Propose a trade</div>
            <label className="dg-field"><span>You want (their item)</span>
              <select value={wantId} onChange={(e) => { setWantId(e.target.value); setGiveId(""); }}>
                <option value="">Select an item…</option>
                {theirItems.map((it) => <option key={it.id} value={it.id}>{itemCat(it).name} · {RARITY[itemCat(it).rarity].label} · {state.characters[it.holder.id].name}</option>)}
              </select>
            </label>
            <label className="dg-field"><span>You give (equal rarity, same campaign)</span>
              <select value={giveId} onChange={(e) => setGiveId(e.target.value)} disabled={!wantId}>
                <option value="">Select an item…</option>
                {myEligible.map((it) => <option key={it.id} value={it.id}>{itemCat(it).name} · {state.characters[it.holder.id].name}</option>)}
              </select>
            </label>
            {wantId && myEligible.length === 0 && <p className="dg-muted sm">You have no equal-rarity items in that campaign to offer.</p>}
            <div className="dg-row-actions">
              <button className="dg-btn" disabled={!wantId || !giveId} onClick={sendProposal}>Send proposal</button>
              <button className="dg-btn ghost" onClick={() => { setShowProp(false); setWantId(""); setGiveId(""); }}>Cancel</button>
            </div>
          </div>
        ) : null)}

        {replyLocked
          ? <div className="dg-muted sm" style={{ padding: "8px 2px", fontStyle: "italic" }}>This was sent as an announcement — replies are turned off.</div>
          : (
            <div className="dg-chatinput">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={meIsOrg ? "Reply as " + partyName(state, meId) + "…" : "Write a message…"}
                onKeyDown={(e) => { if (e.key === "Enter") send(meId, other, threadCtx(sel, meId), threadCtx(sel, other)); }} />
              <button className="dg-btn" onClick={() => send(meId, other, threadCtx(sel, meId), threadCtx(sel, other))}>Send</button>
            </div>
          )}
      </div>
    );
  }

  return (
    <div className="dg-stack">
      <SectionHead eyebrow="Inbox" title={mode === "org" ? "Organization messages" : "Messages"} note={mode === "org" ? "Broadcasts you've sent and replies from members come here." : "Reach out about items — arrange a trade even when something isn't marked available yet."} />
      {myThreads.length === 0 ? <Empty title="No word has passed" body={mode === "org" ? "Send a broadcast from the Organization tab to start a conversation." : "Send a message from the Market to open a conversation."} /> :
        myThreads.map((t) => {
          const me = selfOf(t);
          const other = t.participants.find((p) => p !== me);
          const last = t.messages[t.messages.length - 1];
          const unread = unreadFor(t, me);
          return (
            <button key={t.id} className="dg-thread" onClick={() => { setSelId(t.id); dispatch({ type: "MARK_THREAD_READ", id: t.id, acc: me }); }}>
              <div className="dg-thread-h"><b>{partyName(state, other)}</b>{unread > 0 && <span className="dg-badge">{unread}</span>}</div>
              <div className="dg-thread-last">{last ? (last.from === me ? "You: " : "") + (last.text || "(trade proposal)") : ""}</div>
            </button>
          );
        })}
    </div>
  );
}

export function CombineProposalCard({ msg, state, accountId, dispatch }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const pact = (state.bastionPacts || []).find((p) => p.id === msg.combine.pactId);
  if (!pact) return null;
  const a = state.characters[pact.aChar], b = state.characters[pact.bChar];
  const nm = (c) => c ? (c.bastion ? c.bastion.name : c.name) : "(gone)";
  const iAmRecipient = accountId === pact.bAcct;
  return (
    <div className="dg-proposalcard">
      <div className="dg-prop-h">🤝 Combine bastions</div>
      <div className="dg-prop-line"><b>{nm(a)}</b> <span className="dg-swap">⇄</span> <b>{nm(b)}</b> — pool garrisons for collective defense</div>
      <div className="dg-prop-status">
        {pact.status === "active" ? <span className="dg-prop-done">✓ Combined — the garrisons now defend each other.</span> :
         pact.status === "declined" ? <span className="dg-prop-declined">Declined.</span> :
         pact.status === "dissolved" ? <span className="dg-prop-declined">Dissolved.</span> :
         iAmRecipient ? (
           <div className="dg-row-actions">
             <button className="dg-btn" onClick={() => dispatch({ type: "RESPOND_BASTION_COMBINE", pactId: pact.id, by: accountId, accept: true })}>Accept (vote yes)</button>
             <button className="dg-btn ghost" onClick={() => dispatch({ type: "RESPOND_BASTION_COMBINE", pactId: pact.id, by: accountId, accept: false })}>Decline</button>
           </div>
         ) : <span className="dg-muted sm">Awaiting their vote…</span>}
      </div>
    </div>
  );
}

export function ProposalCard({ msg, state, accountId, dispatch, mode }: { dispatch: React.Dispatch<Action>; state: AppState; [k: string]: any }) {
  const tr = state.trades.find((t) => t.id === msg.proposal.tradeId);
  if (!tr) return null;
  const giveIt = state.items[tr.a.itemId], wantIt = state.items[tr.b.itemId];
  const aChar = state.characters[tr.a.charId], bChar = state.characters[tr.b.charId];
  const iAmRecipient = mode === "player" && canTradeAcct(state, accountId) && accountId === (bChar && bChar.ownerId);
  const giveName = giveIt ? itemCat(giveIt).name : "(removed)";
  const wantName = wantIt ? itemCat(wantIt).name : "(removed)";
  return (
    <div className="dg-proposalcard">
      <div className="dg-prop-h">Trade proposal</div>
      <div className="dg-prop-line"><b>{aChar && aChar.name}</b> gives {giveName} <span className="dg-swap">⇄</span> <b>{bChar && bChar.name}</b> gives {wantName}</div>
      <div className="dg-prop-status">
        {tr.status === "SETTLED" ? <span className="dg-prop-done">✓ Trade completed — items swapped, 5 DT each side.</span> :
         tr.status === "CANCELLED" ? <span className="dg-prop-declined">Declined.</span> :
         iAmRecipient ? (
           <div className="dg-row-actions">
             <button className="dg-btn" onClick={() => dispatch({ type: "CONFIRM_TRADE", id: tr.id })}>Accept trade</button>
             <button className="dg-btn ghost" onClick={() => dispatch({ type: "CANCEL_TRADE", id: tr.id })}>Decline</button>
           </div>
         ) : <span className="dg-muted sm">Awaiting their response…</span>}
      </div>
    </div>
  );
}

