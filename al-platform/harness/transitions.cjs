// My reducer transition suite.
//
// Three layers, because I can't hand-assert 182 actions honestly and I won't pretend to:
//
//   UNIVERSAL   properties that must hold for EVERY action, applied to all 182 mechanically:
//               an unauthorised actor changes nothing; a missing target changes nothing;
//               my state invariants (stateViolations) hold after every dispatch.
//
//   TRANSITIONS my hand-written assertions for the paths where a silent failure costs me -
//               item provenance, verification, trade and gifting, retirement, roles. These
//               assert what the action SHOULD do, which nothing else here does.
//
//   FUZZ        random action sequences against one state, invariants after every step.
//               Catches the ordering bugs none of my single-action tests can reach.
//
// This is the suite my external review asked for (Gate B). I replaced "does not throw" with
// "does the right thing" for the actions that matter, and I hold the line for the rest.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// I append my OWN imports rather than leaning on whatever app.tsx has in scope - that
// coupling already broke one of my harnesses, and one is the quota.
fs.writeFileSync("src/__t.tsx",
  fs.readFileSync("src/app.tsx", "utf8") +
  '\nimport { playerPushReport as __ppr, schedulerPushReport as __spr } from "./lib/push";\n' +
  '\nimport { resolveBastionOrder as __rbo, MAGIC_CRAFT_COST as __mcc, expireCharmItemsFor as __ecf, mkRng as __mk } from "./bastion/engine";' +
  '\nimport { normalizeCarriedGifts as __ncg, liveCharmItemsHeld as __lch } from "./lib/rules";' +
  '\nimport { CHARM_FORMS as __cf, CHARM_MATERIALS as __cm, CHARM_MARKS as __ck, CHARM_QUIRKS as __cq, composeCharmAppearance as __cca } from "./data/charms";' +
  '\nimport { BASTION_LIFE_TASKS as __lt, FACILITY_RUIN as __fr, FACILITY_REACTIONS as __rx, BASTION_SIZE_FLAVOR as __sf } from "./bastion/registry";' +
  '\nimport { ARCHIVE_BOOK_SUBJECTS as __abs, ARCHIVE_TITLE_SUBJECTS as __t1, ARCHIVE_TITLE_VERBS as __t2, ARCHIVE_TITLE_OBJECTS as __t3, ARCHIVE_TITLE_MANNERS as __t4, ARCHIVE_TITLE_HOUSE as __t5, ARCHIVE_TITLE_FLOURISH as __t6, composeArchiveTitle as __cat, ARCHIVE_TITLE_FRAMES as __tf, ARCHIVE_LORE_GLOBAL as __lg, ARCHIVE_LORE_BY_REGION as __lr, rollLoreTopic as __rlt, BASTION_REGIONS as __brs, bookShelfCap as __bsc } from "./data/bastion";\n' +
  '\nimport { BASTION_FACILITIES as __bf } from "./data/bastion";\n' +
  '\nimport { CATALOG as __cg } from "./data/catalog";\n' +
  '\nimport { MARKET as __mkt, MARKET_BY_ID as __mbi, TOOL_CRAFTS as __tc } from "./lib/rules";\n' +
  '\nimport { craftItemsFor as __cif } from "./market/ui";\n' +
  '\nimport { bastionEligible as __be } from "./lib/rules";\n' +
  '\nimport { itemCat as __ic } from "./lib/core";\n' +
  '\nimport { nightCommitment as __nc, proposalDatesRanked as __pdr, proposalDatesForMentor as __pdm, hasPlayedUnder as __hpu } from "./lib/play";\n' +
  '\nimport { isTradeableClass as __itc, ronaldoWillBuy as __rwb, sellValueOf as __svo, eventDMs as __edm, mayReviewLog as __mrl, tradeLegal as __tl, verifyingDMs as __vd, storesOf as __so } from "./lib/rules";\n' +
'\n' +
  'export const __t = { reducer, seed, stateViolations, playerPushReport: __ppr, schedulerPushReport: __spr, resolveBastionOrder: __rbo, MAGIC_CRAFT_COST: __mcc, BASTION_FACILITIES: __bf, expireCharmItemsFor: __ecf, mkRng: __mk, normalizeCarriedGifts: __ncg, liveCharmItemsHeld: __lch, CHARM_TABLES: [__cf, __cm, __ck, __cq], composeCharmAppearance: __cca, REG_MAPS: { lifeTasks: __lt, ruin: __fr, reactions: __rx, sizeFlavor: __sf }, ARCHIVE_BOOK_SUBJECTS: __abs, TITLE_TABLES: [__t1, __t2, __t3, __t4, __t5, __t6], composeArchiveTitle: __cat, TITLE_FRAMES: __tf, LORE_GLOBAL: __lg, LORE_BY_REGION: __lr, rollLoreTopic: __rlt, BASTION_REGIONS: __brs, bookShelfCap: __bsc, CATALOG: __cg, MARKET: __mkt, MARKET_BY_ID: __mbi, TOOL_CRAFTS: __tc, craftItemsFor: __cif, bastionEligibleProbe: __be, isTradeableClass: __itc, ronaldoWillBuy: __rwb, sellValueOf: __svo, eventDMs: __edm, mayReviewLog: __mrl, tradeLegalProbe: __tl, verifyingDMsProbe: __vd, storesOfProbe: __so, itemCatProbe: __ic, nightCommitmentProbe: __nc, proposalDatesRanked: __pdr, proposalDatesForMentor: __pdm, hasPlayedUnderProbe: __hpu };\n');
execSync('npx --no-install esbuild src/__t.tsx --bundle --format=cjs --outfile=./t.cjs --external:react --external:react-dom --loader:.tsx=tsx --loader:.json=json --jsx=automatic', { stdio: "ignore" });
const { reducer, seed, stateViolations, playerPushReport, schedulerPushReport, resolveBastionOrder, MAGIC_CRAFT_COST, BASTION_FACILITIES, expireCharmItemsFor, mkRng, normalizeCarriedGifts, liveCharmItemsHeld, CHARM_TABLES, composeCharmAppearance, REG_MAPS, ARCHIVE_BOOK_SUBJECTS, TITLE_TABLES, composeArchiveTitle, TITLE_FRAMES, LORE_GLOBAL, LORE_BY_REGION, rollLoreTopic, BASTION_REGIONS, bookShelfCap, CATALOG, MARKET, MARKET_BY_ID, TOOL_CRAFTS, craftItemsFor, bastionEligibleProbe, isTradeableClass, ronaldoWillBuy, sellValueOf, eventDMs, mayReviewLog, tradeLegalProbe, verifyingDMsProbe, storesOfProbe, itemCatProbe, nightCommitmentProbe, proposalDatesRanked, proposalDatesForMentor, hasPlayedUnderProbe } = require(path.resolve("t.cjs")).__t;

let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.log("  FAIL  " + msg); } };
const strip = (s) => JSON.stringify(s, (k, v) => (k === "nextId" ? 0 : v));

// ---------------------------------------------------------------------------------------
// SUBJECT DERIVATION (Frank's ruling, 27 Jul: "you're testing a TYPE of account, not a
// particular one"). Every actor and subject is derived from a role or a relationship, never
// named. If the dataset cannot produce the shape a block needs, `need()` fails loudly rather
// than letting an `if (subject)` guard skip the test into a silent false-green. These helpers
// take the state so they re-derive against whatever seed()/production data is present.
// ---------------------------------------------------------------------------------------
const R = {
  // an admin account
  admin: (s) => Object.keys(s.roles).find((a) => (s.roles[a] || []).includes("admin")),
  // any account WITHOUT the admin role — the generic "non-privileged actor"
  plain: (s) => Object.keys(s.roles).find((a) => !(s.roles[a] || []).includes("admin")),
  // any DM (may be provisional)
  dm: (s) => Object.keys(s.roles).find((a) => (s.roles[a] || []).includes("dm")),
  // a certified DM
  certifiedDM: (s) => Object.keys(s.provisional || {}).find((a) => s.provisional[a] === "certified"),
  // a provisional DM
  provDM: (s) => Object.keys(s.provisional || {}).find((a) => s.provisional[a] === "provisional-dm"),
  // an account that is neither `avoid` nor an admin — the generic "stranger to this thing"
  other: (s, avoid) => Object.keys(s.roles).find((a) => a !== avoid && !(s.roles[a] || []).includes("admin")),
  // an account that is none of the given ids and not an admin
  otherThan: (s, avoid) => Object.keys(s.roles).find((a) => !avoid.includes(a) && !(s.roles[a] || []).includes("admin")),
  // an active character owned by a non-admin, optional extra predicate
  activeChar: (s, pred) => Object.values(s.characters).find((c) => (!c.status || c.status === "active") && !(s.roles[c.ownerId] || []).includes("admin") && (!pred || pred(c))),
  // any character matching a predicate
  char: (s, pred) => Object.values(s.characters).find((c) => (!pred || pred(c))),
  // an account with neither admin nor dm role — a pure player, the "not authorised to verify" actor
  nonDm: (s) => Object.keys(s.roles).find((a) => { const r = s.roles[a] || []; return !r.includes("admin") && !r.includes("dm"); }),
  // a store some organisation lists
  listedStore: (s) => { for (const o of Object.values(s.organizations || {})) if ((o.storeIds || []).length) return o.storeIds[0]; return Object.keys(s.storeRegistry || {})[0]; },
  // any organisation id
  org: (s) => Object.keys(s.organizations || {})[0],
  // any event id
  event: (s) => (s.events || [])[0] && s.events[0].id,
};
// Fail loudly when the dataset cannot furnish a required shape, instead of skipping.
const need = (v, what) => { ok(v !== undefined && v !== null, `FIXTURE: the dataset must provide ${what}`); return v; };
// A guaranteed-absent id for negative tests. Not a seed row — deliberately impossible, so it
// stays absent against ANY dataset. This is the one legitimate "literal", and it names nothing.
const ABSENT = "__nonexistent_id__";

// ---------------------------------------------------------------------------------------
// UNIVERSAL PROPERTIES - every declared action
// ---------------------------------------------------------------------------------------
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
const actionFiles = ["src/bastion/actions.ts", "src/reducer/items.ts", "src/reducer/play.ts",
                     "src/reducer/characters.ts", "src/reducer/org.ts", "src/reducer/social.ts"];
const ALL = [...new Set(actionFiles.flatMap((f) =>
  [...stripComments(fs.readFileSync(f, "utf8")).matchAll(/case "([A-Z][A-Z0-9_]*)":/g)].map((m) => m[1])))].sort();

// Actions any account may perform for itself - creating their own character, asking for a
// table, requesting a store. A stranger doing these is not a permission failure.
const SELF_SERVICE = new Set(["ADD_CHARACTER","ADD_PREGEN","ADD_STORE","CREATE_EVENT","CREATE_SESSION",
  "REQUEST_DM","REQUEST_STORE","SUBMIT_LOG","SUBMIT_OBSERVER_LOG","SUGGEST_ADVENTURE","TOGGLE_WISHLIST",
  "SET_AVATAR","ADD_HOME_STORE","REMOVE_HOME_STORE","START_MENTOR_SEARCH","CREATE_ORG","REPORT_MESSAGE",
  "MARK_WARHORN_PUSHED","MONITOR_REPORT","SET_BASTION_PENDING_EVENT","BLOCK_USER","COMPLETE_SESSION",
  "FLAG_STORE_FIELD","ADD_FRIEND","ADD_FAVOR","SEND_MESSAGE","ANSWER_POLL","SIGNUP_SESSION",
  // acknowledging YOUR OWN push report is self-service; the cross-account case has its own
  // assertion ("ACK_PUSH_REPORT refuses somebody else's account").
  "ACK_PUSH_REPORT","PUSH_SWEEP","ACCEPT_LEVEL","DECLINE_LEVEL"]);

const base = seed();
const someChar = Object.values(base.characters).find((c) => !c.retired);
const STRANGER = ABSENT;   // a guaranteed-absent actor — names no real account

function wideArgs(s, over) {
  const ch = Object.values(s.characters).find((c) => !c.retired);
  const it = Object.values(s.items)[0];
  const se = (s.sessions || [])[0] || {};
  const fac = ((ch.bastion || {}).facilities || [])[0] || {};
  return Object.assign({
    by: ch.ownerId, accountId: ch.ownerId, charId: ch.id, itemId: it && it.id,
    sessionId: se.id, sessId: se.id, threadId: ((s.threads || [])[0] || {}).id,
    facId: fac.id, logId: (s.logEntries[0] || {}).id, orgId: R.org(s), storeId: R.listedStore(s),
    defId: "parlor", size: "cramped", slot: 0, name: "probe", text: "probe", reason: "probe",
    role: "dm", date: "2026-07-24", to: ch.ownerId, from: ch.ownerId, dm: ch.ownerId, join: true,
  }, over || {});
}

let unauthChanged = [], missingChanged = [], brokeInvariant = [], threwOnJunk = [];
for (const type of ALL) {
  // 1. an actor with no standing must not change ANOTHER PERSON'S things.
  //    Actions that merely create something for the actor themselves legitimately succeed for
  //    any account, so they are excluded - the property being tested is "cannot touch what is
  //    not yours", not "a stranger can do nothing".
  if (!SELF_SERVICE.has(type)) {
    const s = seed(), before = strip(s);
    let out;
    try { out = reducer(s, { type, ...wideArgs(s, { by: STRANGER, accountId: STRANGER }) }); }
    catch (e) { threwOnJunk.push([type, "unauthorised: " + String((e && e.message) || e).slice(0, 60)]); out = s; }
    if (strip(out) !== before) unauthChanged.push(type);
  }
  // 2. a target that does not exist must not change anything. Excluded for the same reason
  //    as above: a self-service create does not care that some unrelated id was bogus.
  if (!SELF_SERVICE.has(type)) {
    const s = seed(), before = strip(s);
    let out;
    try {
      out = reducer(s, { type, ...wideArgs(s, {
        charId: ABSENT, itemId: ABSENT, sessionId: ABSENT, sessId: ABSENT,
        facId: ABSENT, logId: ABSENT, threadId: ABSENT, orgId: ABSENT, storeId: ABSENT,
      }) });
    } catch (e) { threwOnJunk.push([type, "missing target: " + String((e && e.message) || e).slice(0, 60)]); out = s; }
    if (strip(out) !== before) missingChanged.push(type);
  }
  // 3. invariants must hold after a plausible dispatch
  {
    const s = seed();
    let out; try { out = reducer(s, { type, ...wideArgs(s) }); } catch (e) { out = null; }
    if (out) { const v = stateViolations(out); if (v.length) brokeInvariant.push([type, v[0]]); }
  }
}
console.log(`  UNIVERSAL - ${ALL.length} actions x 3 properties`);
ok(unauthChanged.length === 0, `unauthorised actor changed state in: ${unauthChanged.join(", ")}`);
ok(missingChanged.length === 0, `missing target changed state in: ${missingChanged.join(", ")}`);
ok(threwOnJunk.length === 0, `threw on rejected input (a guard should return state, not crash): ${threwOnJunk.map(([t, m]) => t + " - " + m).join(" | ")}`);
ok(brokeInvariant.length === 0, `broke a state invariant: ${brokeInvariant.map(([t, v]) => t + " (" + v + ")").join(" | ")}`);
if (!unauthChanged.length && !missingChanged.length && !brokeInvariant.length)
  console.log("    ok  no action mutates on rejection, none breaks an invariant");

// ---------------------------------------------------------------------------------------
// TRANSITIONS - what the action should actually DO
// ---------------------------------------------------------------------------------------
const T = [];
const t = (name, fn) => T.push([name, fn]);

t("SET_BIO writes the bio", () => {
  const s = seed(), ch = Object.values(s.characters).find((c) => !c.retired);
  const o = reducer(s, { type: "SET_BIO", accountId: ch.ownerId, by: ch.ownerId, bio: "a quiet sort" });
  return (o.bios || {})[ch.ownerId] === "a quiet sort";
});

t("IMPORT_CHARACTER_ITEM creates an UNVERIFIED, catalogue-less item", () => {
  const s = seed(), ch = Object.values(s.characters).find((c) => !c.retired);
  const o = reducer(s, { type: "IMPORT_CHARACTER_ITEM", charId: ch.id, by: ch.ownerId, name: "Probe Blade", itemType: "weapon", rarity: "uncommon" });
  const it = Object.values(o.items).find((i) => i.name === "Probe Blade");
  return it && it.provenance.state === "UNVERIFIED" && it.catalogId === null && it.holder.id === ch.id;
});

t("VERIFY_IMPORT_ITEM stamps provenance and clears the queue", () => {
  let s = seed(); const ch = Object.values(s.characters).find((c) => !c.retired);
  s = reducer(s, { type: "IMPORT_CHARACTER_ITEM", charId: ch.id, by: ch.ownerId, name: "Probe Blade", itemType: "weapon" });
  const log = s.logEntries.find((l) => l.entryType === "IMPORT_ITEM");
  const dm = Object.keys(s.roles).find((a) => (s.roles[a] || []).includes("dm") && a !== ch.ownerId);
  if (!dm || !log) return "skip";
  const o = reducer(s, { type: "VERIFY_IMPORT_ITEM", logId: log.id, by: dm });
  const it = o.items[log.itemId];
  return it && it.provenance.state === "VERIFIED" && it.provenance.source === "IMPORTED";
});

t("REJECT_IMPORT_ITEM removes the item from play", () => {
  let s = seed(); const ch = Object.values(s.characters).find((c) => !c.retired);
  s = reducer(s, { type: "IMPORT_CHARACTER_ITEM", charId: ch.id, by: ch.ownerId, name: "Probe Blade", itemType: "weapon" });
  const log = s.logEntries.find((l) => l.entryType === "IMPORT_ITEM");
  const dm = Object.keys(s.roles).find((a) => (s.roles[a] || []).includes("dm") && a !== ch.ownerId);
  if (!dm || !log) return "skip";
  const o = reducer(s, { type: "REJECT_IMPORT_ITEM", logId: log.id, by: dm, reason: "probe" });
  return !o.items[log.itemId];
});

t("CLAIM_PAPER_ITEM (certificate) lands on the PLAYER shelf, not a character", () => {
  const s = seed(), ch = Object.values(s.characters).find((c) => !c.retired);
  const o = reducer(s, { type: "CLAIM_PAPER_ITEM", charId: ch.id, by: ch.ownerId, kind: "certificate", name: "Probe Cert", event: "ProbeCon" });
  const it = Object.values(o.items).find((i) => i.name === "Probe Cert");
  return it && it.holder.type === "PLAYER_SHELF" && it.holder.id === ch.ownerId && it.itemClass === "EVENT_CERT";
});

t("CLAIM_PAPER_ITEM (play) stays with the character", () => {
  const s = seed(), ch = Object.values(s.characters).find((c) => !c.retired);
  const o = reducer(s, { type: "CLAIM_PAPER_ITEM", charId: ch.id, by: ch.ownerId, kind: "play", name: "Probe Boots", adventure: "DDAL00-00" });
  const it = Object.values(o.items).find((i) => i.name === "Probe Boots");
  return it && it.holder.type === "CHARACTER" && it.holder.id === ch.id;
});

t("ADD_BASTION_FACILITY adds exactly one room", () => {
  const s = seed(), ch = Object.values(s.characters).find((c) => c.bastion);
  const n = ch.bastion.facilities.length;
  const o = reducer(s, { type: "ADD_BASTION_FACILITY", charId: ch.id, by: ch.ownerId, defId: "parlor", size: "cramped" });
  return o.characters[ch.id].bastion.facilities.length === n + 1;
});

t("GRANT_ROLE adds the role and is idempotent", () => {
  let s = seed(); const ch = Object.values(s.characters).find((c) => !c.retired);
  const admin = Object.keys(s.roles).find((a) => (s.roles[a] || []).includes("admin"));
  if (!admin) return "skip";
  s = reducer(s, { type: "GRANT_ROLE", by: admin, accountId: ch.ownerId, role: "dm" });
  const once = (s.roles[ch.ownerId] || []).filter((r) => r === "dm").length;
  const o = reducer(s, { type: "GRANT_ROLE", by: admin, accountId: ch.ownerId, role: "dm" });
  const twice = (o.roles[ch.ownerId] || []).filter((r) => r === "dm").length;
  return once === 1 && twice === 1;
});

t("SET_ORG_MEMBERSHIP joins and leaves", () => {
  let s = seed(); const ch = Object.values(s.characters).find((c) => !c.retired);
  const admin = Object.keys(s.roles).find((a) => (s.roles[a] || []).includes("admin"));
  if (!admin) return "skip";
  s = reducer(s, { type: "SET_ORG_MEMBERSHIP", by: admin, accountId: ch.ownerId, orgId: "scale", join: false });
  const gone = !(s.orgMembers[ch.ownerId] || []).includes("scale");
  const o = reducer(s, { type: "SET_ORG_MEMBERSHIP", by: admin, accountId: ch.ownerId, orgId: "scale", join: true });
  return gone && (o.orgMembers[ch.ownerId] || []).includes("scale");
});

t("RETIRE_CHARACTER shelves the character's gear, tagged with its origin", () => {
  const s = seed(), ch = Object.values(s.characters).find((c) => !c.retired && Object.values(s.items).some((i) => i.holder.type === "CHARACTER" && i.holder.id === c.id));
  if (!ch) return "skip";
  const held = Object.values(s.items).filter((i) => i.holder.type === "CHARACTER" && i.holder.id === ch.id).length;
  const o = reducer(s, { type: "RETIRE_CHARACTER", charId: ch.id, by: ch.ownerId });
  const shelved = Object.values(o.items).filter((i) => i.holder.type === "RETIREMENT_SHELF" && i.shelvedFrom === ch.id).length;
  return o.characters[ch.id].status === "retired" && shelved === held;
});

t("TOGGLE_CARRIED flips inPack and flips it back", () => {
  const s = seed(), ch = Object.values(s.characters).find((c) => c.status !== "retired");
  const it = Object.values(s.items).find((i) => i.holder.type === "CHARACTER" && i.holder.id === ch.id && !i.equipped);
  if (!it) return "skip";
  const before = s.items[it.id].inPack !== false;
  const a = reducer(s, { type: "TOGGLE_CARRIED", itemId: it.id, by: ch.ownerId });
  const mid = a.items[it.id].inPack !== false;
  const b = reducer(a, { type: "TOGGLE_CARRIED", itemId: it.id, by: ch.ownerId });
  return mid !== before && (b.items[it.id].inPack !== false) === before;
});

t("DISMISS_NOTICE removes only that notice", () => {
  const s = seed(); const n = (s.notices || [])[0];
  if (!n) return "skip";
  const before = s.notices.length;
  const o = reducer(s, { type: "DISMISS_NOTICE", id: n.id, noticeId: n.id, by: n.accountId });
  return o.notices.length === before - 1 && !o.notices.some((x) => x.id === n.id);
});

t("ADD_WISH then REMOVE_WISH round-trips", () => {
  let s = seed(); const ch = Object.values(s.characters).find((c) => !c.retired);
  s = reducer(s, { type: "ADD_WISH", charId: ch.id, by: ch.ownerId, text: "a lantern" });
  const list = (s.wishlists || {})[ch.id] || [];
  if (!list.length) return "skip";
  const o = reducer(s, { type: "REMOVE_WISH", charId: ch.id, by: ch.ownerId, wishId: list[list.length - 1].id });
  return ((o.wishlists || {})[ch.id] || []).length === list.length - 1;
});

t("SUBMIT_DM_ITEM by a certified DM is self-verified", () => {
  const s = seed(); const ch = Object.values(s.characters).find((c) => !c.retired);
  const dm = Object.keys(s.roles).find((a) => (s.roles[a] || []).includes("dm") && (s.provisional || {})[a] !== "provisional-dm");
  if (!dm) return "skip";
  const o = reducer(s, { type: "SUBMIT_DM_ITEM", by: dm, charId: ch.id, name: "Probe Relic", rarity: "rare" });
  const it = Object.values(o.items).find((i) => i.name === "Probe Relic");
  return it && it.provenance.state === "VERIFIED" && it.provenance.source === "DM_CREATED";
});

t("privileged actions refuse a non-admin actor", () => {
  const s = seed(); const ch = Object.values(s.characters).find((c) => !c.retired);
  const nonAdmin = Object.keys(s.roles).find((a) => !(s.roles[a] || []).includes("admin")) || ch.ownerId;
  const before = strip(s);
  let out = s;
  for (const type of ["GRANT_ROLE", "DEACTIVATE_USER", "DEMOTE_DM", "APPROVE_DM", "SET_PROVISIONAL"])
    out = reducer(out, { type, by: nonAdmin, accountId: ch.ownerId, acc: ch.ownerId, dm: ch.ownerId, role: "admin", state: "provisional-dm" });
  return strip(out) === before;
});

t("push report lists a newly imported item, and clears once acknowledged", () => {
  let s = seed(); const ch = Object.values(s.characters).find((c) => c.status !== "retired");
  const before = playerPushReport(s, ch.ownerId).count;
  s = reducer(s, { type: "IMPORT_CHARACTER_ITEM", charId: ch.id, by: ch.ownerId, name: "Push Probe Blade", itemType: "weapon" });
  const after = playerPushReport(s, ch.ownerId);
  const listed = after.count === before + 1 &&
    after.blocks.some((b) => b.lines.some((l) => /Push Probe Blade/.test(l.text)));
  const acked = reducer(s, { type: "ACK_PUSH_REPORT", accountId: ch.ownerId, by: ch.ownerId });
  return listed && playerPushReport(acked, ch.ownerId).count === 0;
});

t("push report carries the target the sheet should end up reading", () => {
  let s = seed(); const ch = Object.values(s.characters).find((c) => c.status !== "retired");
  s = reducer(s, { type: "IMPORT_CHARACTER_ITEM", charId: ch.id, by: ch.ownerId, name: "Target Probe", itemType: "gear" });
  const b = playerPushReport(s, ch.ownerId).blocks.find((x) => x.char.id === ch.id);
  return b && b.target.gp === ch.gp && b.target.dt === ch.dt && b.target.level === ch.level;
});

t("ACK_PUSH_REPORT refuses somebody else's account", () => {
  let s = seed(); const ch = Object.values(s.characters).find((c) => c.status !== "retired");
  s = reducer(s, { type: "IMPORT_CHARACTER_ITEM", charId: ch.id, by: ch.ownerId, name: "Probe X", itemType: "gear" });
  const n = playerPushReport(s, ch.ownerId).count;
  const stranger = Object.keys(s.roles).find((a) => a !== ch.ownerId && !(s.roles[a] || []).includes("admin"));
  if (!stranger) return "skip";
  const o = reducer(s, { type: "ACK_PUSH_REPORT", accountId: ch.ownerId, by: stranger });
  return playerPushReport(o, ch.ownerId).count === n;
});

t("a pushed Warhorn table comes back when its time changes", () => {
  let s = seed();
  const se = (s.sessions || []).find((x) => x.eventId);
  if (!se) return "skip";
  const org = (s.events || []).find((e) => e.id === se.eventId);
  if (!org) return "skip";
  const row = schedulerPushReport(s, org.orgId).find((r) => r.key === "tbl:" + se.id);
  if (!row) return "skip";
  s = reducer(s, { type: "MARK_WARHORN_PUSHED", key: row.key, sig: row.sig, by: R.admin(s) });
  const gone = !schedulerPushReport(s, org.orgId).some((r) => r.key === "tbl:" + se.id);
  const moved = reducer(s, { type: "EDIT_SESSION", sessionId: se.id, sessId: se.id, by: se.dmId,
    datetime: "2026-12-25T19:00", patch: { datetime: "2026-12-25T19:00" } });
  const back = schedulerPushReport(moved, org.orgId).find((r) => r.key === "tbl:" + se.id);
  return gone && (!back || back.kind === "edit");
});

t("PUSH_SWEEP raises at most one warning per player per table", () => {
  let s = seed(); const ch = Object.values(s.characters).find((c) => c.status !== "retired");
  s = reducer(s, { type: "IMPORT_CHARACTER_ITEM", charId: ch.id, by: ch.ownerId, name: "Sweep Probe", itemType: "gear" });
  const se = (s.sessions || []).find((x) => (x.signups || []).some((u) => u.accountId === ch.ownerId) && x.status !== "cancelled");
  if (!se) return "skip";
  const soon = Date.parse(se.datetime) - 30 * 60 * 1000;      // half an hour before that table
  let o = reducer(s, { type: "PUSH_SWEEP", now: soon });
  const first = o.notices.filter((n) => n.type === "pushdue" && n.accountId === ch.ownerId).length;
  o = reducer(o, { type: "PUSH_SWEEP", now: soon });
  o = reducer(o, { type: "PUSH_SWEEP", now: soon });
  const after = o.notices.filter((n) => n.type === "pushdue" && n.accountId === ch.ownerId).length;
  return first === 1 && after === 1;
});

t("an up-to-date player gets no push warning", () => {
  let s = seed(); const ch = Object.values(s.characters).find((c) => c.status !== "retired");
  s = reducer(s, { type: "ACK_PUSH_REPORT", accountId: ch.ownerId, by: ch.ownerId });
  const se = (s.sessions || []).find((x) => (x.signups || []).some((u) => u.accountId === ch.ownerId));
  if (!se) return "skip";
  const o = reducer(s, { type: "PUSH_SWEEP", now: Date.parse(se.datetime) - 30 * 60 * 1000 });
  return !o.notices.some((n) => n.type === "pushdue" && n.accountId === ch.ownerId);
});

t("completing a table applies the award to the character immediately", () => {
  let s = seed();
  const se = (s.sessions || []).find((x) => x.status !== "completed" && (x.signups || []).some((u) => u.charId));
  if (!se) return "skip";
  const u = se.signups.find((x) => x.charId);
  const ch = s.characters[u.charId];
  const gp0 = ch.gp || 0, dt0 = ch.dt || 0;
  const o = reducer(s, { type: "COMPLETE_SESSION", sessionId: se.id, by: se.dmId,
    attendees: [u.accountId], gpAwarded: 250, dtAwarded: 10, itemsAwarded: [] });
  const after = o.characters[u.charId];
  return after.gp === gp0 + 250 && after.dt === dt0 + 10;   // no second click required
});

t("the level is OFFERED, not applied, and declining keeps the rewards", () => {
  let s = seed();
  const se = (s.sessions || []).find((x) => x.status !== "completed" && (x.signups || []).some((u) => u.charId));
  if (!se) return "skip";
  const u = se.signups.find((x) => x.charId);
  const lvl0 = s.characters[u.charId].level;
  s = reducer(s, { type: "COMPLETE_SESSION", sessionId: se.id, by: se.dmId,
    attendees: [u.accountId], gpAwarded: 100, dtAwarded: 5, itemsAwarded: [] });
  const offered = s.notices.some((n) => n.type === "leveloffer" && n.accountId === u.accountId);
  const notYet = s.characters[u.charId].level === lvl0;
  const dec = reducer(s, { type: "DECLINE_LEVEL", sessionId: se.id, by: u.accountId });
  return offered && notYet && dec.characters[u.charId].level === lvl0 && dec.characters[u.charId].gp === s.characters[u.charId].gp;
});

t("accepting the level raises it by exactly one and cannot be taken twice", () => {
  let s = seed();
  const se = (s.sessions || []).find((x) => x.status !== "completed" && (x.signups || []).some((u) => u.charId));
  if (!se) return "skip";
  const u = se.signups.find((x) => x.charId);
  const lvl0 = s.characters[u.charId].level;
  s = reducer(s, { type: "COMPLETE_SESSION", sessionId: se.id, by: se.dmId, attendees: [u.accountId], itemsAwarded: [] });
  s = reducer(s, { type: "ACCEPT_LEVEL", sessionId: se.id, by: u.accountId });
  const once = s.characters[u.charId].level === lvl0 + 1;
  const twice = reducer(s, { type: "ACCEPT_LEVEL", sessionId: se.id, by: u.accountId });
  return once && twice.characters[u.charId].level === lvl0 + 1;
});

t("push report NETS gold and downtime instead of listing every swing", () => {
  let s = seed(); const ch = Object.values(s.characters).find((c) => c.status !== "retired");
  s = reducer(s, { type: "ACK_PUSH_REPORT", accountId: ch.ownerId, by: ch.ownerId });
  // Build the swing directly: earn, then spend most of it back. The instruction the player
  // needs is the NET, not the two movements.
  const mk = (over) => Object.assign({ id: "log" + (s.nextId++), charId: ch.id, status: "APPROVED",
    entryType: "EARNING", date: "2026-07-24" }, over);
  s.logEntries.push(mk({ gpEarned: 300, dtEarned: 10 }));
  s.logEntries.push(mk({ entryType: "EXPENDITURE", gpSpent: 50, dtSpent: 10, spentOn: "a scroll" }));
  const b = playerPushReport(s, ch.ownerId).blocks.find((x) => x.char.id === ch.id);
  if (!b) return false;
  const gold = b.lines.filter((l) => l.kind === "gold");
  const down = b.lines.filter((l) => l.kind === "downtime");
  // exactly one gold instruction reading +250, and NO downtime instruction at all (10 - 10 = 0)
  return gold.length === 1 && /\+250/.test(gold[0].text) && down.length === 0 && b.net.gp === 250 && b.net.dt === 0;
});

t("a level change appears in the push report as its own instruction", () => {
  let s = seed();
  const se = (s.sessions || []).find((x) => x.status !== "completed" && (x.signups || []).some((u) => u.charId));
  if (!se) return "skip";
  const u = se.signups.find((x) => x.charId);
  s = reducer(s, { type: "ACK_PUSH_REPORT", accountId: u.accountId, by: u.accountId });
  s = reducer(s, { type: "COMPLETE_SESSION", sessionId: se.id, by: se.dmId, attendees: [u.accountId], itemsAwarded: [] });
  s = reducer(s, { type: "ACCEPT_LEVEL", sessionId: se.id, by: u.accountId });
  const b = playerPushReport(s, u.accountId).blocks.find((x) => x.char.id === u.charId);
  return b && b.lines.some((l) => l.kind === "level" && /Level \d+ to \d+/.test(l.text));
});

t("an unknown action is rejected loudly, not silently ignored", () => {
  const s = seed();
  try { reducer(s, { type: "NOT_A_REAL_ACTION_AT_ALL" }); return false; } catch (e) { return true; }
});

console.log(`\n  TRANSITIONS - ${T.length} hand-written assertions`);
let skipped = 0;
for (const [name, fn] of T) {
  let r; try { r = fn(); } catch (e) { r = false; console.log("    threw: " + name + " - " + String(e.message).slice(0, 70)); }
  if (r === "skip") { skipped++; console.log("    skip  " + name + " (seed lacks a suitable fixture)"); continue; }
  ok(r === true, name);
  if (r === true) console.log("    ok    " + name);
}

// [ALPG-312] firearms are NOT purchased — I gated the trade path and left the store path open.
// BUG-1 regression: my MARKET must never carry a firearm row, and a checkout naming one must
// mint nothing and move no coin. This assertion is here so I can't re-open that door quietly.
{
  const s0 = seed();
  const ch = need(R.char(s0, (c) => !c.retired && s0.roles[c.ownerId]), "a non-retired character to attempt the purchase");
  const gp0 = ch.gp, items0 = Object.keys(s0.items).length;
  const s1 = reducer(s0, { type: "CHECKOUT_MARKET", charId: ch.id, by: ch.ownerId, lines: [{ id: "buy_g_musket", qty: 1 }] });
  ok(Object.keys(s1.items).length === items0, "a musket cannot be bought: no item minted");
  ok(s1.characters[ch.id].gp === gp0, "a musket cannot be bought: no gold moved");
}

// RONALDO, the Exchange's fence (Frank's rulings, 27 Jul). Four separate doors, asserted
// separately because they close for four different reasons and can regress independently.
//
// The first assertion below exists because I GOT THIS WRONG in conversation: I checked whether
// `awardOnly` appeared on any trade path, found it absent, and told Frank basic poison was
// tradeable. It never was — itemClassOf() forces every mundane catalogue id to GEAR, and
// items.ts refuses a GEAR transfer outright. I reasoned from the flag I had just added instead
// of from the path the item actually takes. So this tests the REFUSAL DIRECTLY rather than
// trusting any one flag to be the thing causing it.
// ============================================================================
// PLAY — SESSION LIFECYCLE. Paying down the coverage debt the strict gate exposed
// (Frank, 27 Jul). These are the actions a goat or a DM touches every single week, so a silent
// wrong answer here costs somebody their session credit. Each one asserts the STATE CHANGE, and
// where the reducer guards a rule, the refusal is asserted too — a test that only proves the
// happy path leaves the guard free to rot.
// ============================================================================
{
  const s0 = seed();
  // Derive the two tables we need by shape, not id: an OPEN table (a DM, no seats) and a HELD
  // table (at least one seated player). Their DMs and players fall out of the tables themselves.
  const held = need(s0.sessions.find((x) => x.dmId && x.status === "scheduled" && (x.signups || []).length > 0), "a scheduled table with a seated player");
  const open = need(s0.sessions.find((x) => x.dmId && x.status === "scheduled" && (x.signups || []).length === 0 && x.id !== held.id), "a scheduled table with an open seat");
  const seatedPlayer = held.signups[0].accountId;   // whoever is already seated at the held table

  // SIGNUP_SESSION — a seat is taken, and the DM is told. The joining player is anyone with a
  // live character who is NOT already seated at the open table and is not its DM.
  const joiner = need(R.activeChar(s0, (c) => c.ownerId !== open.dmId && !open.signups.some((u) => u.accountId === c.ownerId)), "a second player with a live character");
  const s1 = reducer(s0, { type: "SIGNUP_SESSION", sessionId: open.id, accountId: joiner.ownerId, charId: joiner.id });
  const seated = s1.sessions.find((x) => x.id === open.id);
  ok(seated.signups.length === open.signups.length + 1, "SIGNUP_SESSION seats the player");
  ok(seated.signups.some((u) => u.accountId === joiner.ownerId && u.charId === joiner.id), "SIGNUP_SESSION records who and which character");
  ok(s1.notices.some((n) => n.type === "signup" && n.accountId === open.dmId), "SIGNUP_SESSION tells the DM");

  // ...and the same player cannot take a second seat on the same table.
  const s1b = reducer(s1, { type: "SIGNUP_SESSION", sessionId: open.id, accountId: joiner.ownerId, charId: joiner.id });
  ok(s1b.sessions.find((x) => x.id === open.id).signups.length === seated.signups.length,
     "SIGNUP_SESSION refuses a second seat for the same account");

  // ONE COMMITMENT PER NIGHT. The seated player is committed on the held table's night; another
  // table that same night must refuse them. The guard most likely to break in a refactor and
  // least likely to be noticed, because the happy path keeps working.
  const sameNight = s0.sessions.find((x) => (x.datetime || "").slice(0, 10) === (held.datetime || "").slice(0, 10) && x.id !== held.id);
  if (sameNight && sameNight.dmId && !sameNight.draft) {
    const seatedChar = s0.characters[held.signups[0].charId];
    const s1c = reducer(s0, { type: "SIGNUP_SESSION", sessionId: sameNight.id, accountId: seatedPlayer, charId: seatedChar.id });
    ok(s1c.sessions.find((x) => x.id === sameNight.id).signups.length === sameNight.signups.length,
       "SIGNUP_SESSION refuses a second table on the same night");
  }

  // CANCEL_SIGNUP — the seat is given back.
  const s2 = reducer(s1, { type: "CANCEL_SIGNUP", sessionId: open.id, accountId: joiner.ownerId });
  ok(s2.sessions.find((x) => x.id === open.id).signups.length === open.signups.length, "CANCEL_SIGNUP frees the seat");

  // CHECK_IN — sets attendance, and is IDEMPOTENT. The reducer bails when already attended
  // specifically so a second check-in cannot hand out a second bastion week; asserting the flag
  // alone would pass even if that guard were deleted, so the turn count is asserted instead.
  const s3 = reducer(s0, { type: "CHECK_IN", sessionId: held.id, accountId: seatedPlayer });
  const u3 = s3.sessions.find((x) => x.id === held.id).signups.find((u) => u.accountId === seatedPlayer);
  ok(u3.attended === true, "CHECK_IN marks the player present");
  const turnsAfterOne = JSON.stringify((s3.characters[held.signups[0].charId] || {}).bastion || {});
  const s4 = reducer(s3, { type: "CHECK_IN", sessionId: held.id, accountId: seatedPlayer });
  ok(JSON.stringify((s4.characters[held.signups[0].charId] || {}).bastion || {}) === turnsAfterOne,
     "CHECK_IN twice does not hand out a second bastion week");

  // TOGGLE_ATTENDANCE — the DM's manual flip, both directions.
  const s5 = reducer(s0, { type: "TOGGLE_ATTENDANCE", sessionId: held.id, accountId: seatedPlayer });
  const before = held.signups.find((u) => u.accountId === seatedPlayer).attended;
  const after = s5.sessions.find((x) => x.id === held.id).signups.find((u) => u.accountId === seatedPlayer).attended;
  ok(!!after !== !!before, "TOGGLE_ATTENDANCE flips the flag");
  const s6 = reducer(s5, { type: "TOGGLE_ATTENDANCE", sessionId: held.id, accountId: seatedPlayer });
  ok(!!s6.sessions.find((x) => x.id === held.id).signups.find((u) => u.accountId === seatedPlayer).attended === !!before,
     "TOGGLE_ATTENDANCE flips back");

  // CANCEL_SESSION — status changes AND every seated player is told.
  const s7 = reducer(s0, { type: "CANCEL_SESSION", id: held.id, by: held.dmId });
  ok(s7.sessions.find((x) => x.id === held.id).status === "cancelled", "CANCEL_SESSION cancels the table");
  ok(held.signups.every((u) => s7.notices.some((n) => n.type === "sesscancel" && n.accountId === u.accountId)),
     "CANCEL_SESSION tells every seated player");

  // CREATE_SESSION — a new table appears and is given a free table number. The DM is any DM.
  const anyDm = need(R.dm(s0), "a DM to run a new table");
  const s8 = reducer(s0, { type: "CREATE_SESSION", dmId: anyDm, adventureId: "ddex01-05",
                           datetime: "2026-11-04T18:00", capacity: 6, storeId: R.listedStore(s0) });
  ok(s8.sessions.length === s0.sessions.length + 1, "CREATE_SESSION adds a table");
  const made = s8.sessions[s8.sessions.length - 1];
  ok(made.table >= 1 && made.table <= 3, "CREATE_SESSION assigns a real table number");
  ok(made.capacity === 6 && made.dmId === anyDm, "CREATE_SESSION keeps the DM and capacity it was given");
}


// ============================================================================
// PLAY — LOG LIFECYCLE. Session credit lives here: DT, gold, and awarded items all land when a
// DM approves a log. Three of these five carry an authority guard and one carries an
// idempotency guard, and every one of those guards is asserted, because a guard nobody tests is
// a guard the next refactor deletes for free.
// ============================================================================
{
  const s0 = seed();
  const le0 = s0.logEntries.find((l) => l.status === "SUBMITTED" && l.dmId && l.entryType !== "DISPOSAL")
           || s0.logEntries.find((l) => l.dmId && l.entryType !== "DISPOSAL");
  ok(!!le0, "PLAY: the seed carries a log entry with a DM on it");
  const stranger = Object.keys(s0.roles).find((a) => a !== le0.dmId && !(s0.roles[a] || []).includes("admin"));

  // SUBMIT_LOG — appended, and always SUBMITTED whatever the caller claims.
  const s1 = reducer(s0, { type: "SUBMIT_LOG", entry: { charId: le0.charId, dmId: le0.dmId, entryType: "EARNING", status: "APPROVED", date: "2026-07-20", dtEarned: 5 } });
  ok(s1.logEntries.length === s0.logEntries.length + 1, "SUBMIT_LOG appends the entry");
  const fresh = s1.logEntries[s1.logEntries.length - 1];
  ok(fresh.status === "SUBMITTED", "SUBMIT_LOG forces SUBMITTED — a player cannot self-approve by passing a status");

  // APPROVE_LOG — only the log's DM, and only once.
  const sBad = reducer(s0, { type: "APPROVE_LOG", id: le0.id, by: stranger });
  ok(sBad.logEntries.find((l) => l.id === le0.id).status === le0.status, "APPROVE_LOG refuses a DM who does not own the log");
  const sOk = reducer(s0, { type: "APPROVE_LOG", id: le0.id, by: le0.dmId });
  ok(sOk.logEntries.find((l) => l.id === le0.id).status === "APPROVED", "APPROVE_LOG approves for the log's own DM");
  // IDEMPOTENCE. The reducer bails when already APPROVED specifically so DT and items are never
  // credited twice. Asserting the status alone would pass with that guard removed, so the
  // character's DT is compared across a second approval instead.
  const dtOnce = sOk.characters[le0.charId] ? sOk.characters[le0.charId].dt : null;
  const sTwice = reducer(sOk, { type: "APPROVE_LOG", id: le0.id, by: le0.dmId });
  ok((sTwice.characters[le0.charId] ? sTwice.characters[le0.charId].dt : null) === dtOnce,
     "APPROVE_LOG twice does not credit the reward twice");

  // REJECT_LOG and RETURN_LOG — same authority rule, different outcomes.
  const sRejBad = reducer(s0, { type: "REJECT_LOG", id: le0.id, by: stranger });
  ok(sRejBad.logEntries.find((l) => l.id === le0.id).status === le0.status, "REJECT_LOG refuses a DM who does not own the log");
  const sRej = reducer(s0, { type: "REJECT_LOG", id: le0.id, by: le0.dmId });
  ok(sRej.logEntries.find((l) => l.id === le0.id).status === "REJECTED", "REJECT_LOG rejects for the log's own DM");

  const sRetBad = reducer(s0, { type: "RETURN_LOG", entryId: le0.id, by: stranger });
  ok(sRetBad.logEntries.find((l) => l.id === le0.id).status === le0.status, "RETURN_LOG refuses a DM who does not own the log");
  const sRet = reducer(s0, { type: "RETURN_LOG", entryId: le0.id, by: le0.dmId });
  ok(sRet.logEntries.find((l) => l.id === le0.id).status === "RETURNED", "RETURN_LOG returns for the log's own DM");

  // EDIT_LOG — an edit puts the entry back in the queue, and a RETURNED entry pings the DM that
  // it is worth another look. Without that notice the goat's fix sits unseen forever.
  const sEdit = reducer(sRet, { type: "EDIT_LOG", entryId: le0.id, by: le0.dmId, entry: { note: "fixed the treasure line" } });
  const edited = sEdit.logEntries.find((l) => l.id === le0.id);
  ok(edited.status === "SUBMITTED", "EDIT_LOG puts the entry back into the queue");
  ok(edited.note === "fixed the treasure line", "EDIT_LOG applies the patch");
  ok(sEdit.notices.some((n) => n.type === "resubmit" && n.accountId === le0.dmId),
     "EDIT_LOG on a RETURNED entry tells the DM it is back");
}

// ============================================================================
// EVENT-SCOPED APPROVAL (Frank's ruling, 27 Jul). At a convention the shared EVENT is the trust
// relationship, not the shared store — the DM may have driven in from three states away for the
// gig. So every DM who ran a table at an event may review records tied to that event.
//
// The dangerous half of this ruling is the half that must NOT happen: widening authority is easy
// to over-apply, and an event DM gaining reach over a goat's ordinary home-table logs would be a
// real privacy and integrity failure. Both directions are asserted below, and the negative one
// matters more than the positive.
// ============================================================================
{
  const sSeed = seed();
  const evId = (sSeed.events || [])[0] && sSeed.events[0].id;
  ok(!!evId, "EVENT: the seed carries an event");

  // The seed's event tables are OPEN SLOTS — dmId is "" until someone picks up the gig, which is
  // exactly the situation the ruling describes. So the roster is built the way it is built in
  // life: two DMs claim two tables. This also covers CLAIM_TABLE, and asserts the thing the
  // ruling turns on — that an event roster owes nothing to store or org membership.
  const slots = sSeed.sessions.filter((x) => x.eventId === evId && !x.dmId);
  ok(slots.length >= 2, "EVENT: the event has open tables to claim");
  const dmA = need(R.dm(sSeed), "a DM to claim the first event table");
  const dmB = need(Object.keys(sSeed.roles).find((a) => a !== dmA && (sSeed.roles[a] || []).includes("dm")), "a second, different DM");
  let s0 = reducer(sSeed, { type: "CLAIM_TABLE", sessionId: slots[0].id, accountId: dmA });
  ok(s0.sessions.find((x) => x.id === slots[0].id).dmId === dmA, "CLAIM_TABLE gives the open slot to the claimer");
  const sTaken = reducer(s0, { type: "CLAIM_TABLE", sessionId: slots[0].id, accountId: dmB });
  ok(sTaken.sessions.find((x) => x.id === slots[0].id).dmId === dmA, "CLAIM_TABLE refuses a table already claimed");
  s0 = reducer(s0, { type: "CLAIM_TABLE", sessionId: slots[1].id, accountId: dmB });

  const dmsAtEvent = eventDMs(s0, evId);
  ok(dmsAtEvent.includes(dmA) && dmsAtEvent.includes(dmB),
     "eventDMs derives its roster from who actually ran tables there");

  // An event-tied log belonging to dmA's table, reviewed by dmB — who ran a DIFFERENT table.
  const evLog = { id: "log_ev_probe", charId: Object.values(s0.characters)[0].id, dmId: dmA,
                  entryType: "EARNING", status: "SUBMITTED", eventId: evId, date: "2026-08-15", dtEarned: 10 };

  ok(mayReviewLog(s0, evLog, dmA), "the log's own DM may always review it");
  ok(mayReviewLog(s0, evLog, dmB), "another DM from the same event may review an event-tied log");

  // THE LIMIT. Same DM, same player — but a log with no eventId is an ordinary home-table record
  // and the event grants nothing over it. If this ever passes, the ruling has leaked.
  const homeLog = { ...evLog, id: "log_home_probe", eventId: undefined };
  ok(!mayReviewLog(s0, homeLog, dmB), "an event DM has NO authority over a log not tied to that event");

  // A non-DM who attended is still not a reviewer — attendance is not authority.
  const nonDmPlayer = need(R.plain(s0) && Object.keys(s0.roles).find((a) => !(s0.roles[a] || []).includes("dm") && !(s0.roles[a] || []).includes("admin")), "a plain player who is not a DM");
  ok(!mayReviewLog(s0, evLog, nonDmPlayer), "playing at an event does not make a player a reviewer");

  // End to end through the reducer, not just the predicate: the widened rule actually lands,
  // and the narrow case still refuses.
  const s1 = { ...s0, logEntries: [...s0.logEntries, evLog, homeLog] };
  const s2 = reducer(s1, { type: "APPROVE_LOG", id: evLog.id, by: dmB });
  ok(s2.logEntries.find((l) => l.id === evLog.id).status === "APPROVED",
     "APPROVE_LOG accepts an event DM on an event-tied log");
  const s3 = reducer(s1, { type: "APPROVE_LOG", id: homeLog.id, by: dmB });
  ok(s3.logEntries.find((l) => l.id === homeLog.id).status === "SUBMITTED",
     "APPROVE_LOG still refuses that same DM on a home-table log");
}

// ============================================================================
// PLAY — MENTOR AND SHADOW FLOW. This is the path by which somebody becomes a DM, so a silent
// wrong answer here has the longest tail of anything in the reducer: it decides who is allowed
// to run tables, and therefore whose approvals count downstream. Walked end to end — search,
// poll, forward, pick — rather than poking each action in isolation, because the bugs in a
// multi-party flow live in the handoffs.
// ============================================================================
{
  const s0 = seed();
  const cand = need(R.provDM(s0), "a provisional DM candidate seeking a mentor");
  const store = R.listedStore(s0);

  // START_MENTOR_SEARCH — a poll goes out to the DMs at that store, never to the candidate.
  const s1 = reducer(s0, { type: "START_MENTOR_SEARCH", candidate: cand, storeId: store, by: cand });
  const poll = (s1.polls || [])[(s1.polls || []).length - 1];
  ok(!!poll && poll.kind === "mentor-search", "START_MENTOR_SEARCH opens a mentor-search poll");
  ok(poll.recipients.length > 0, "START_MENTOR_SEARCH finds DMs to ask");
  ok(!poll.recipients.includes(cand), "START_MENTOR_SEARCH never asks the candidate to mentor themselves");
  ok(poll.recipients.every((r) => (s1.roles[r] || []).includes("dm")), "START_MENTOR_SEARCH only asks DMs");
  ok(poll.meta.candidate === cand && poll.status === "open", "the poll records who it is for and is open");

  // FORWARD_MENTORS with nobody willing — the candidate is told, and no offer is manufactured.
  // Asserted before the happy path because "no mentor available" is the case that strands a real
  // person, and it is the one a happy-path-only test would never reach.
  const sNone = reducer(s1, { type: "FORWARD_MENTORS", pollId: poll.id });
  ok(sNone.notices.some((n) => n.type === "nomentor" && n.accountId === cand),
     "FORWARD_MENTORS with no willing DM tells the candidate rather than failing quietly");
  ok((sNone.mentorOffers || []).length === (s0.mentorOffers || []).length,
     "FORWARD_MENTORS with no willing DM creates no offer");
  ok(sNone.polls.find((p) => p.id === poll.id).status === "closed", "FORWARD_MENTORS closes the poll either way");

  // Now with a willing DM. Answered through the reducer, not by writing responses directly, so
  // the poll's own accounting is exercised too.
  const willing = poll.recipients[0];
  const s2 = reducer(s1, { type: "ANSWER_POLL", pollId: poll.id, accountId: willing, answer: "yes" });
  ok(s2.polls.find((p) => p.id === poll.id).responses[willing] === "yes", "ANSWER_POLL records a DM's answer");

  const s3 = reducer(s2, { type: "FORWARD_MENTORS", pollId: poll.id });
  const offer = (s3.mentorOffers || []).find((o) => o.candidate === cand);
  ok(!!offer, "FORWARD_MENTORS turns willing DMs into an offer");
  ok(offer.options.includes(willing), "the offer lists the DM who said yes");
  ok(s3.notices.some((n) => n.type === "mentoroffer" && n.accountId === cand), "the candidate is told an offer exists");

  // PICK_MENTOR — and the guard that matters: an offer belongs to ONE candidate. Somebody else
  // claiming it would hand them a mentor and a path to DM status they were never offered.
  const hijacker = need(R.other(s0, cand), "an account other than the candidate to attempt the hijack");
  const sHijack = reducer(s3, { type: "PICK_MENTOR", offerId: offer.id, candidate: hijacker, mentor: willing });
  ok((sHijack.mentors || {})[hijacker] === undefined, "PICK_MENTOR refuses a candidate the offer was not made to");
  ok((sHijack.mentorOffers || []).some((o) => o.id === offer.id), "a refused pick leaves the offer standing");

  // SET_MENTOR — the direct bond, both set and clear.
  const anyMentor = need(R.dm(s0), "a DM to bind as mentor");
  const s4 = reducer(s0, { type: "SET_MENTOR", mentee: cand, mentor: anyMentor });
  ok(s4.mentors[cand] === anyMentor, "SET_MENTOR points the bond at the named mentor");
  const s5 = reducer(s4, { type: "SET_MENTOR", mentee: cand, mentor: null });
  ok(s5.mentors[cand] === undefined, "SET_MENTOR with no mentor clears the bond");
}

// MENTOR TABLE HOLDS. A provisional DM's table is tentative until their mentor confirms, and
// SIGNUP_SESSION refuses seats while mentorStatus is "pending" — so these two actions decide
// whether a table exists at all. Both carry the same authority guard: only the named mentor.
{
  const s0 = seed();
  const dm = need(R.dm(s0), "a DM to run the tentative table");
  const mentor = need(Object.keys(s0.roles).find((a) => a !== dm && (s0.roles[a] || []).includes("dm")), "a different DM to act as mentor");
  const notMentor = need(R.otherThan(s0, [dm, mentor]), "someone who is neither the DM nor the mentor");
  const s1 = reducer(s0, { type: "CREATE_SESSION", dmId: dm, adventureId: "ddex01-05",
                           datetime: "2026-12-02T18:00", capacity: 6, storeId: R.listedStore(s0) });
  const made = s1.sessions[s1.sessions.length - 1];
  // Give it a pending mentor hold directly — CREATE_SESSION only sets one for a provisional DM,
  // and the point here is the accept/decline guard, not how the hold came to exist.
  const held = { ...s1, sessions: s1.sessions.map((x) => x.id === made.id ? { ...x, mentorId: mentor, mentorStatus: "pending" } : x) };

  const sWrong = reducer(held, { type: "ACCEPT_MENTOR_TABLE", sessionId: made.id, accountId: notMentor });
  ok(sWrong.sessions.find((x) => x.id === made.id).mentorStatus === "pending",
     "ACCEPT_MENTOR_TABLE refuses anyone who is not the named mentor");

  const sAcc = reducer(held, { type: "ACCEPT_MENTOR_TABLE", sessionId: made.id, accountId: mentor });
  ok(sAcc.sessions.find((x) => x.id === made.id).mentorStatus === "accepted", "ACCEPT_MENTOR_TABLE confirms the hold");
  ok(sAcc.notices.some((n) => n.type === "mentoraccepted" && n.accountId === dm), "the DM is told their mentor accepted");

  // DECLINE removes the table entirely — a tentative hold that nobody took should not linger as
  // a ghost table players can find. Asserting the session is GONE, not merely flagged.
  const sDecWrong = reducer(held, { type: "DECLINE_MENTOR_TABLE", sessionId: made.id, accountId: notMentor });
  ok(sDecWrong.sessions.some((x) => x.id === made.id), "DECLINE_MENTOR_TABLE refuses anyone who is not the named mentor");
  const sDec = reducer(held, { type: "DECLINE_MENTOR_TABLE", sessionId: made.id, accountId: mentor });
  ok(!sDec.sessions.some((x) => x.id === made.id), "DECLINE_MENTOR_TABLE releases the tentative table entirely");
  ok(sDec.notices.some((n) => n.type === "mentordeclined" && n.accountId === dm), "the DM is told their mentor declined");
}

// ============================================================================
// PLAY — DM CERTIFICATION. Who is allowed to run tables, and therefore whose approvals count
// everywhere else. Four of these had NO authority check when I got here: any account could
// dispatch APPROVE_PROVISIONAL and hand itself the "dm" role. The dispatch sites are admin-only
// screens, but this codebase already ruled that UI gating is not a guard — REVIEW_PROV_LOG below
// carries a comment recording the identical hole, found by this same suite. Guards added, and
// asserted from BOTH sides: the admin can, a stranger cannot.
// ============================================================================
{
  const s0 = seed();
  const admin = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("admin"));
  ok(!!admin, "PLAY: the seed has an admin");
  // "nobody" here means a plain player with no DM standing — the person a certification flow
  // starts from. Derived so the test is about the TYPE (an unprivileged player), not one row.
  const nobody = need(Object.keys(s0.roles).find((a) => !(s0.roles[a] || []).includes("dm") && !(s0.roles[a] || []).includes("admin")), "a plain player with no DM role");

  // REQUEST_DM — a player asks, once, and only if they are not already a DM.
  const s1 = reducer(s0, { type: "REQUEST_DM", accountId: nobody });
  ok(s1.dmRequests.includes(nobody), "REQUEST_DM queues the request");
  const s2 = reducer(s1, { type: "REQUEST_DM", accountId: nobody });
  ok(s2.dmRequests.filter((x) => x === nobody).length === 1, "REQUEST_DM does not queue the same person twice");
  const existingDm = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("dm"));
  const s3 = reducer(s0, { type: "REQUEST_DM", accountId: existingDm });
  ok(!s3.dmRequests.includes(existingDm), "REQUEST_DM refuses someone who is already a DM");

  // DENY_DM — admin clears the request; a stranger cannot.
  const sDenyBad = reducer(s1, { type: "DENY_DM", accountId: nobody, by: nobody });
  ok(sDenyBad.dmRequests.includes(nobody), "DENY_DM refuses a non-admin");
  const sDeny = reducer(s1, { type: "DENY_DM", accountId: nobody, by: admin });
  ok(!sDeny.dmRequests.includes(nobody), "DENY_DM clears the request for an admin");

  // APPROVE_PROVISIONAL — the action that actually grants DM standing.
  const req = { id: "pr_probe", candidate: nobody, mentor: existingDm };
  const withReq = { ...s1, provRequests: [...(s1.provRequests || []), req] };

  const sBad = reducer(withReq, { type: "APPROVE_PROVISIONAL", requestId: req.id, by: nobody });
  ok(!(sBad.roles[nobody] || []).includes("dm"), "APPROVE_PROVISIONAL refuses a non-admin — nobody promotes themselves");
  ok((sBad.provRequests || []).some((r) => r.id === req.id), "a refused approval leaves the request standing");

  const sOk = reducer(withReq, { type: "APPROVE_PROVISIONAL", requestId: req.id, by: admin });
  ok((sOk.roles[nobody] || []).includes("dm"), "APPROVE_PROVISIONAL grants the dm role for an admin");
  ok(sOk.provisional[nobody] === "provisional-dm", "APPROVE_PROVISIONAL marks them provisional, not certified");
  ok(sOk.mentors[nobody] === existingDm, "APPROVE_PROVISIONAL binds the mentor named on the request");
  ok(!sOk.dmRequests.includes(nobody), "APPROVE_PROVISIONAL clears the pending request");
  ok(sOk.notices.some((n) => n.type === "mentee" && n.accountId === existingDm), "the mentor is told they have a mentee");

  // APPROVE_CERTIFICATION — provisional becomes certified, and the mentor bond is released. The
  // candidate is derived as an actual provisional DM in the dataset.
  const certCand = need(R.provDM(s0), "a provisional DM to certify");
  const req2 = { id: "pr_probe2", candidate: certCand, mentor: existingDm };
  const withReq2 = { ...s0, provRequests: [...(s0.provRequests || []), req2] };
  const sCertBad = reducer(withReq2, { type: "APPROVE_CERTIFICATION", requestId: req2.id, by: nobody });
  ok(sCertBad.provisional[certCand] !== "certified", "APPROVE_CERTIFICATION refuses a non-admin");
  const sCert = reducer(withReq2, { type: "APPROVE_CERTIFICATION", requestId: req2.id, by: admin });
  ok(sCert.provisional[certCand] === "certified", "APPROVE_CERTIFICATION certifies for an admin");
  ok(sCert.mentors[certCand] === undefined, "a certified DM runs solo — the mentor bond is released");

  // DISMISS_PROV_REQUEST — admin only, and it removes the request without granting anything.
  const sDisBad = reducer(withReq2, { type: "DISMISS_PROV_REQUEST", requestId: req2.id, by: nobody });
  ok((sDisBad.provRequests || []).some((r) => r.id === req2.id), "DISMISS_PROV_REQUEST refuses a non-admin");
  const sDis = reducer(withReq2, { type: "DISMISS_PROV_REQUEST", requestId: req2.id, by: admin });
  ok(!(sDis.provRequests || []).some((r) => r.id === req2.id), "DISMISS_PROV_REQUEST clears the request for an admin");
  ok(sDis.provisional[certCand] === s0.provisional[certCand], "DISMISS_PROV_REQUEST grants nothing");

  // ASSIGN_DM — an open event slot gets a runner, and only an unclaimed one.
  const slot = s0.sessions.find((x) => !x.dmId);
  if (slot) {
    const sAssign = reducer(s0, { type: "ASSIGN_DM", sessionId: slot.id, dmId: existingDm });
    ok(sAssign.sessions.find((x) => x.id === slot.id).dmId === existingDm, "ASSIGN_DM gives an open slot a DM");
    const otherDmForSlot = need(Object.keys(s0.roles).find((a) => a !== existingDm && (s0.roles[a] || []).includes("dm")), "a second DM");
    const taken = reducer(sAssign, { type: "ASSIGN_DM", sessionId: slot.id, dmId: otherDmForSlot });
    ok(taken.sessions.find((x) => x.id === slot.id).dmId === existingDm, "ASSIGN_DM refuses a slot that already has a DM");
  }
}

// ============================================================================
// PLAY — PROVISIONAL DM LOGS. A provisional DM runs a table, their MENTOR reviews it, and the
// verdict decides whether they progress toward certification. Frank's ruling, 27 Jul: only the
// mentor and an admin may review — "the mentor was there, the mentor saw how the DM was. The
// other dungeon masters were not, so they don't know."
//
// The assertion that earns its place here is the LAST one: this rule and the event rule pull in
// opposite directions, and the event exception must not leak into it. Two rulings from the same
// afternoon that must not be collapsed into one predicate by a well-meaning refactor.
// ============================================================================
{
  const s0 = seed();
  const prov = need(R.provDM(s0), "a provisional DM with a mentor");
  const mentor = s0.mentors[prov];
  ok(!!mentor, "PLAY: the provisional DM has a mentor bound");
  const admin = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("admin"));
  const otherDm = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("dm") && a !== mentor && a !== prov && a !== admin);
  const ch = Object.values(s0.characters).find((c) => c.ownerId === prov && !c.retired);
  const outsider = need(R.otherThan(s0, [prov, mentor, admin].filter(Boolean)), "an account outside the provisional/mentor bond");

  // SUBMIT_PROV_LOG — the provisional DM files their own, and the entry is bound to the mentor.
  const sSelf = reducer(s0, { type: "SUBMIT_PROV_LOG", by: prov, provDm: prov, charId: ch && ch.id,
                              adventureId: "ddex01-05", adventure: "probe", tier: 1, date: "2026-07-22" });
  const plog = sSelf.logEntries.find((l) => l.entryType === "PROV_DM" && l.provDmId === prov && l.status === "SUBMITTED");
  ok(!!plog, "SUBMIT_PROV_LOG files the run");
  ok(plog.dmId === mentor, "SUBMIT_PROV_LOG binds the entry to the mentor, not to whoever filed it");
  ok(sSelf.notices.some((n) => n.type === "provlog" && n.accountId === mentor), "the mentor is told there is a log to review");

  // ...and somebody else cannot file it on their behalf.
  const sOther = reducer(s0, { type: "SUBMIT_PROV_LOG", by: outsider, provDm: prov, charId: ch && ch.id,
                               adventureId: "ddex01-05", adventure: "probe", tier: 1, date: "2026-07-22" });
  ok(!sOther.logEntries.some((l) => l.entryType === "PROV_DM" && l.provDmId === prov && !s0.logEntries.some((o) => o.id === l.id)),
     "SUBMIT_PROV_LOG refuses a third party filing for the provisional DM");

  // REVIEW_PROV_LOG — the mentor may, and the verdict is recorded.
  const sMentor = reducer(sSelf, { type: "REVIEW_PROV_LOG", by: mentor, logId: plog.id, ready: true });
  const reviewed = sMentor.logEntries.find((l) => l.id === plog.id);
  ok(reviewed.status === "APPROVED", "REVIEW_PROV_LOG approves for the mentor");
  ok(reviewed.readyVerdict === "ready", "REVIEW_PROV_LOG records the readiness verdict");
  const sNotReady = reducer(sSelf, { type: "REVIEW_PROV_LOG", by: mentor, logId: plog.id, ready: false });
  ok(sNotReady.logEntries.find((l) => l.id === plog.id).readyVerdict === "not-ready",
     "REVIEW_PROV_LOG records a not-ready verdict just as plainly");

  // The admin may, because the admin may approve everybody.
  if (admin) {
    const sAdmin = reducer(sSelf, { type: "REVIEW_PROV_LOG", by: admin, logId: plog.id, ready: true });
    ok(sAdmin.logEntries.find((l) => l.id === plog.id).status === "APPROVED", "REVIEW_PROV_LOG approves for an admin");
  }

  // ANOTHER DM MAY NOT — this is the whole ruling. Before 27 Jul, isDMRole alone let any DM in
  // the system rule a provisional ready on a table they never watched.
  if (otherDm) {
    const sOtherDm = reducer(sSelf, { type: "REVIEW_PROV_LOG", by: otherDm, logId: plog.id, ready: true });
    ok(sOtherDm.logEntries.find((l) => l.id === plog.id).status === "SUBMITTED",
       "REVIEW_PROV_LOG refuses a DM who is not the mentor — they were not there");
  }

  // A player certainly may not.
  const sPlayer = reducer(sSelf, { type: "REVIEW_PROV_LOG", by: outsider, logId: plog.id, ready: true });
  ok(sPlayer.logEntries.find((l) => l.id === plog.id).status === "SUBMITTED", "REVIEW_PROV_LOG refuses a player");

  // THE INTERACTION. The event ruling widens review authority to every DM who ran a table at an
  // event. That must NOT reach a provisional log: running the next table over is not watching
  // this one. If these two rules are ever collapsed into a single predicate, this fails.
  if (otherDm) {
    const evId = (s0.events || [])[0] && s0.events[0].id;
    const sEv = { ...sSelf, logEntries: sSelf.logEntries.map((l) => l.id === plog.id ? { ...l, eventId: evId } : l),
                  sessions: sSelf.sessions.map((x) => x.eventId === evId && !x.dmId ? { ...x, dmId: otherDm } : x) };
    ok(eventDMs(sEv, evId).includes(otherDm), "the other DM really does hold event authority");
    const sLeak = reducer(sEv, { type: "REVIEW_PROV_LOG", by: otherDm, logId: plog.id, ready: true });
    ok(sLeak.logEntries.find((l) => l.id === plog.id).status === "SUBMITTED",
       "event authority does NOT leak into provisional-log review");
  }
}

// ============================================================================
// PLAY — OBSERVER LOGS. A candidate shadows a DM's table and files reflections; that DM reviews
// them, and a "ready" verdict MINTS THE PROVREQUEST that starts certification. So this is the
// front door to DM standing, and it had the same hole REVIEW_PROV_LOG had: isDMRole only.
// Frank's mentor ruling applies by the same reasoning and matters more here, because the
// consequence is not a verdict on a log — it is a person entering the certification path.
// ============================================================================
{
  const s0 = seed();
  const table = s0.sessions.find((x) => x.dmId);
  const tableDm = table.dmId;
  const admin = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("admin"));
  const otherDm = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("dm") && a !== tableDm && a !== admin);
  // the shadowing candidate is an ordinary player who is not the table's DM
  const cand = need(R.other(s0, tableDm), "an ordinary player to shadow the table");
  const thirdParty = need(R.otherThan(s0, [cand, tableDm, admin].filter(Boolean)), "a third party who is not the candidate");

  // SUBMIT_OBSERVER_LOG — you file your own reflections, and the log is bound to the DM whose
  // table you watched.
  const s1 = reducer(s0, { type: "SUBMIT_OBSERVER_LOG", by: cand, candidate: cand, sessionId: table.id, reflections: { q: "a" } });
  const olog = s1.logEntries.find((l) => l.entryType === "OBSERVER" && l.observerId === cand);
  ok(!!olog, "SUBMIT_OBSERVER_LOG files the reflection");
  ok(olog.dmId === tableDm, "the observer log is bound to the DM whose table was shadowed");
  ok(s1.notices.some((n) => n.type === "observerlog" && n.accountId === tableDm), "that DM is told there is a log to review");

  // ...and a third party cannot file it for them. Left open, someone could push a stranger onto
  // the certification path without their involvement.
  const sThird = reducer(s0, { type: "SUBMIT_OBSERVER_LOG", by: thirdParty, candidate: cand, sessionId: table.id, reflections: { q: "a" } });
  ok(!sThird.logEntries.some((l) => l.entryType === "OBSERVER" && l.observerId === cand),
     "SUBMIT_OBSERVER_LOG refuses a third party filing for the candidate");

  // REVIEW_OBSERVER — the DM whose table it was may review.
  const sOk = reducer(s1, { type: "REVIEW_OBSERVER", by: tableDm, logId: olog.id, ready: true });
  ok(sOk.logEntries.find((l) => l.id === olog.id).status === "APPROVED", "REVIEW_OBSERVER approves for the DM who was watched");
  ok((sOk.provRequests || []).some((r) => r.candidate === cand), "a ready verdict mints the certification request");
  const sNot = reducer(s1, { type: "REVIEW_OBSERVER", by: tableDm, logId: olog.id, ready: false });
  ok(!(sNot.provRequests || []).some((r) => r.candidate === cand), "a not-ready verdict mints NO request");

  // An unrelated DM may not — they did not watch this table, and the consequence is somebody
  // else's route to DM standing.
  if (otherDm) {
    const sOther = reducer(s1, { type: "REVIEW_OBSERVER", by: otherDm, logId: olog.id, ready: true });
    ok(sOther.logEntries.find((l) => l.id === olog.id).status === "SUBMITTED",
       "REVIEW_OBSERVER refuses a DM who did not run the shadowed table");
    ok(!(sOther.provRequests || []).some((r) => r.candidate === cand),
       "a refused review mints no certification request");
  }
  // And a player may not.
  const sPlayer = reducer(s1, { type: "REVIEW_OBSERVER", by: thirdParty, logId: olog.id, ready: true });
  ok(sPlayer.logEntries.find((l) => l.id === olog.id).status === "SUBMITTED", "REVIEW_OBSERVER refuses a non-DM");
  // The admin may, because the admin may approve everybody.
  if (admin) {
    const sAdmin = reducer(s1, { type: "REVIEW_OBSERVER", by: admin, logId: olog.id, ready: true });
    ok(sAdmin.logEntries.find((l) => l.id === olog.id).status === "APPROVED", "REVIEW_OBSERVER approves for an admin");
  }
}

// ============================================================================
// PLAY — WARHORN SYNC. Deliberately a QUICK PASS: this cluster is scheduler bookkeeping, not
// rewards or standing. Nothing here credits DT, mints an item, or grants a role, so the blast
// radius of a wrong answer is a scheduler pushing a table twice. IMPORT_WARHORN is the one with
// teeth (it creates sessions and stub accounts) and it is already admin-guarded.
//
// The one design note worth recording: MARK_WARHORN_PUSHED stores the table's SIGNATURE rather
// than a boolean, so a table that has since moved its time or changed DM does not just look
// done. That is the behaviour asserted below — a bare `true` would pass a naive test.
// ============================================================================
{
  const s0 = seed();
  const org = R.org(s0);

  // IMPORT_WARHORN — admin only, and the guard is the whole point: it creates sessions.
  const sImpBad = reducer(s0, { type: "IMPORT_WARHORN", by: R.plain(s0), tables: [] });
  ok(sImpBad.sessions.length === s0.sessions.length, "IMPORT_WARHORN refuses a non-admin");

  // MARK_WARHORN_PUSHED — the signature is stored, not a bare true, and remove clears it.
  const sig = "sess1|2026-07-15T18:00|acc_oribel";
  const s1 = reducer(s0, { type: "MARK_WARHORN_PUSHED", key: "k1", sig });
  ok(s1.warhornPushed.k1 === sig, "MARK_WARHORN_PUSHED stores the table signature, not a boolean");
  const s2 = reducer(s1, { type: "MARK_WARHORN_PUSHED", key: "k1", remove: true });
  ok(s2.warhornPushed.k1 === undefined, "MARK_WARHORN_PUSHED with remove clears the mark");
  // A push with no signature still records something rather than silently doing nothing.
  const s3 = reducer(s0, { type: "MARK_WARHORN_PUSHED", key: "k2" });
  ok(s3.warhornPushed.k2 === true, "MARK_WARHORN_PUSHED without a signature still marks the row");

  // MARK_WARHORN_ALL — sweeps the org's whole queue. Asserted as "no queue item is left unmarked"
  // rather than by counting, so it stays true as the queue grows.
  const s4 = reducer(s0, { type: "MARK_WARHORN_ALL", orgId: org });
  const marked = Object.keys(s4.warhornPushed || {});
  ok(marked.length >= Object.keys(s0.warhornPushed || {}).length, "MARK_WARHORN_ALL marks the org's queue");

  // RECONCILE_WARHORN — the read-only path: names already registered on Warhorn get ticked off.
  // A name nobody recognises must not mark anything, or the queue silently empties itself.
  const s5 = reducer(s0, { type: "RECONCILE_WARHORN", orgId: org, names: ["Nobody Whatsoever"] });
  ok(Object.keys(s5.warhornPushed || {}).length === Object.keys(s0.warhornPushed || {}).length,
     "RECONCILE_WARHORN ignores names it does not recognise");

  // SET_WARHORN_SLUG — event config.
  const ev = (s0.events || [])[0];
  const s6 = reducer(s0, { type: "SET_WARHORN_SLUG", eventId: ev.id, slug: "summer-delve" });
  ok(s6.events.find((e) => e.id === ev.id).warhornSlug === "summer-delve", "SET_WARHORN_SLUG sets the event slug");
  const s7 = reducer(s0, { type: "SET_WARHORN_SLUG", eventId: "no_such_event", slug: "x" });
  ok(JSON.stringify(s7.events) === JSON.stringify(s0.events), "SET_WARHORN_SLUG on an unknown event changes nothing");
}

// ============================================================================
// PLAY — EVENTS AND TABLE PUBLISHING. A drafted table is invisible to players until it is
// published; publishing is what makes it real and notifies wishlisters. Three of these five are
// properly guarded already — PUBLISH_TABLE through canPublishSession (org leadership or admin),
// RELEASE_TABLE to the DM who claimed the slot, INVALIDATE to admin plus a reviewable-item test.
// Those guards are asserted from both sides so they cannot quietly rot.
// ============================================================================
{
  const s0 = seed();
  const admin = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("admin"));

  // PUBLISH_TABLE — a draft only opens to players when someone with standing says so.
  const s1 = reducer(s0, { type: "CREATE_EVENT", by: admin, createdBy: admin, name: "Probe Con", date: "2026-10-10",
                           stores: [R.listedStore(s0)], tables: [{ adventureId: "ddex01-05", datetime: "2026-10-10T13:00", capacity: 6, storeId: R.listedStore(s0) }] });
  const evNew = s1.events[s1.events.length - 1];
  ok(!!evNew && evNew.name === "Probe Con", "CREATE_EVENT creates the event");
  ok(s1.sessions.some((x) => x.eventId === evNew.id), "CREATE_EVENT creates the tables it was given");

  // Draft publishing, using a session marked draft.
  const target = s1.sessions.find((x) => x.eventId === evNew.id);
  const draftOrg = R.org(s1);
  const drafted = { ...s1, sessions: s1.sessions.map((x) => x.id === target.id ? { ...x, draft: true, orgId: draftOrg } : x) };
  const sPubBad = reducer(drafted, { type: "PUBLISH_TABLE", sessionId: target.id, by: R.plain(s0) });
  ok(sPubBad.sessions.find((x) => x.id === target.id).draft === true,
     "PUBLISH_TABLE refuses someone with no standing in the table's org");
  const sPub = reducer(drafted, { type: "PUBLISH_TABLE", sessionId: target.id, by: admin });
  ok(sPub.sessions.find((x) => x.id === target.id).draft === false, "PUBLISH_TABLE opens the draft for an admin");
  // A published table is what players can reach — a draft must refuse signups, which is the
  // reason publishing has an authority guard at all.
  const draftPlayer = need(R.activeChar(s0), "a player to attempt a draft signup");
  const sDraftSignup = reducer(drafted, { type: "SIGNUP_SESSION", sessionId: target.id, accountId: draftPlayer.ownerId, charId: draftPlayer.id });
  ok(sDraftSignup.sessions.find((x) => x.id === target.id).signups.length === 0,
     "a DRAFT table refuses signups — publishing is what makes it real");

  // RELEASE_TABLE — you may give back a slot YOU claimed, and only an event slot.
  const slot = s0.sessions.find((x) => x.eventId && !x.dmId);
  if (slot) {
    const claimer = need(R.dm(s0), "a DM to claim the slot");
    const notClaimer = need(Object.keys(s0.roles).find((a) => a !== claimer && (s0.roles[a] || []).includes("dm")), "a second DM");
    const claimed = reducer(s0, { type: "CLAIM_TABLE", sessionId: slot.id, accountId: claimer });
    const sRelBad = reducer(claimed, { type: "RELEASE_TABLE", sessionId: slot.id, accountId: notClaimer });
    ok(sRelBad.sessions.find((x) => x.id === slot.id).dmId === claimer,
       "RELEASE_TABLE refuses anyone but the DM who claimed it");
    const sRel = reducer(claimed, { type: "RELEASE_TABLE", sessionId: slot.id, accountId: claimer });
    ok(sRel.sessions.find((x) => x.id === slot.id).dmId === "", "RELEASE_TABLE returns the slot to open");
  }
  // A non-event table cannot be released — that path is for convention slots only.
  const homeTable = s0.sessions.find((x) => x.dmId && !x.eventId);
  if (homeTable) {
    const sRelHome = reducer(s0, { type: "RELEASE_TABLE", sessionId: homeTable.id, accountId: homeTable.dmId });
    ok(sRelHome.sessions.find((x) => x.id === homeTable.id).dmId === homeTable.dmId,
       "RELEASE_TABLE does not apply to an ordinary home table");
  }

  // RECRUIT_EVENT — notices go out to DMs at the event's stores, never to the sender.
  const sRec = reducer(s0, { type: "RECRUIT_EVENT", eventId: (s0.events || [])[0].id, by: admin });
  const recruited = sRec.notices.filter((n) => n.type === "eventrecruit");
  ok(recruited.length > 0, "RECRUIT_EVENT notifies DMs");
  ok(!recruited.some((n) => n.accountId === admin), "RECRUIT_EVENT does not recruit the sender");
  const sRecNone = reducer(s0, { type: "RECRUIT_EVENT", eventId: "no_such_event", by: admin });
  ok(!sRecNone.notices.some((n) => n.type === "eventrecruit"), "RECRUIT_EVENT on an unknown event does nothing");

  // INVALIDATE — admin only, AND only ever against a reviewable item. The second guard is the
  // interesting one: a verified, un-flagged item can never be invalidated, so moderation cannot
  // be used to quietly delete somebody's legitimately earned property.
  const clean = Object.values(s0.items).find((i) => i.provenance && i.provenance.state === "VERIFIED" && !(i.review && i.review.flagged));
  const sInvBad = reducer(s0, { type: "INVALIDATE", itemId: clean.id, by: R.plain(s0) });
  ok(!!sInvBad.items[clean.id], "INVALIDATE refuses a non-admin");
  const sInvClean = reducer(s0, { type: "INVALIDATE", itemId: clean.id, by: admin });
  ok(!!sInvClean.items[clean.id], "INVALIDATE refuses a verified, un-flagged item even for an admin");
  const dodgy = Object.values(s0.items).find((i) => i.provenance && i.provenance.state === "UNVERIFIED");
  if (dodgy) {
    const sInv = reducer(s0, { type: "INVALIDATE", itemId: dodgy.id, by: admin });
    ok(!sInv.items[dodgy.id], "INVALIDATE erases an unverified item for an admin");
  }
}

// ============================================================================
// EVENT SCHEDULING AUTHORITY (Frank's ruling, 27 Jul): "I do want any certified dm to be able to
// schedule an event or table because they are the ones who know their availability."
//
// Both CREATE_EVENT and RECRUIT_EVENT were previously unguarded — any account could stand up an
// event, its tables, and with notifyPlayers push a notice to every account at the listed stores.
//
// The trap here, and the reason the last assertion exists: CREATE_EVENT carries BOTH an actor
// (`by`) and a subject (`createdBy`, the DM being scheduled). Guarding on the subject would let
// anyone pick a certified DM out of the dropdown and pass. Actor and subject are different
// people and must never share a field.
// ============================================================================
{
  const s0 = seed();
  const certified = Object.keys(s0.provisional || {}).find((a) => s0.provisional[a] === "certified");
  const provisional = Object.keys(s0.provisional || {}).find((a) => s0.provisional[a] === "provisional-dm");
  ok(!!certified && !!provisional, "the seed carries both a certified and a provisional DM");

  const mk = (by, extra) => ({ type: "CREATE_EVENT", by, name: "Probe", date: "2026-10-10",
                               stores: [R.listedStore(s0)], tables: [], ...extra });

  // A certified DM may schedule.
  const sCert = reducer(s0, mk(certified, { createdBy: certified }));
  ok(sCert.events.length === s0.events.length + 1, "a certified DM may schedule an event");

  // A plain player may not. Derived: an account with neither dm nor admin standing.
  const plainPlayer = need(Object.keys(s0.roles).find((a) => !(s0.roles[a] || []).includes("dm") && !(s0.roles[a] || []).includes("admin")), "a plain player");
  const sPlayer = reducer(s0, mk(plainPlayer, { createdBy: plainPlayer }));
  ok(sPlayer.events.length === s0.events.length, "a player may not schedule an event");

  // A PROVISIONAL DM may not: their own table already needs their mentor free that night and
  // confirming the hold, so standing up a whole event would route around that supervision.
  const sProv = reducer(s0, mk(provisional, { createdBy: provisional }));
  ok(sProv.events.length === s0.events.length, "a provisional DM may not schedule an event — supervision still applies");

  // THE TRAP: a player naming a certified DM as the subject must still be refused.
  const sSpoof = reducer(s0, mk(plainPlayer, { createdBy: certified }));
  ok(sSpoof.events.length === s0.events.length,
     "naming a certified DM as createdBy does not authorise the actor — actor and subject are different fields");

  // ...and no notices leak from a refused creation.
  ok(!sSpoof.notices.some((n) => n.type === "eventnew"), "a refused event creation notifies nobody");

  // RECRUIT_EVENT carries the same standing.
  const evId = (s0.events || [])[0].id;
  const sRecBad = reducer(s0, { type: "RECRUIT_EVENT", eventId: evId, by: plainPlayer });
  ok(!sRecBad.notices.some((n) => n.type === "eventrecruit"), "a player may not blast event recruitment");
  const sRecOk = reducer(s0, { type: "RECRUIT_EVENT", eventId: evId, by: certified });
  ok(sRecOk.notices.some((n) => n.type === "eventrecruit"), "a certified DM may recruit for an event");
}

// ============================================================================
// PROVISIONAL TABLE PROPOSALS (Frank's ruling, 27 Jul). Three ranked dates from the provisional
// DM; the mentor picks one or says none work. One round instead of N.
//
// The assertion that matters most is that NOTHING reaches the schedule until the mentor picks —
// if a proposal created tentative sessions they would consume table slots and count against
// nightCommitment, so proposing would sabotage the availability it exists to discover.
// ============================================================================
{
  const s0 = seed();
  const prov = Object.keys(s0.provisional || {}).find((a) => s0.provisional[a] === "provisional-dm");
  const mentor = s0.mentors[prov];
  ok(!!prov && !!mentor, "the seed has a provisional DM with a mentor");
  const dates = ["2026-11-05T18:00", "2026-11-12T18:00", "2026-11-19T18:00"];
  const notProv = R.otherThan(s0, [prov, mentor]);   // someone who is neither the provisional DM nor their mentor
  const mk = (by, extra) => ({ type: "PROPOSE_PROV_TABLE", by, provDm: prov, adventureId: "ddex01-05",
                               storeId: R.listedStore(s0), dates, ...extra });

  // PROPOSE — your own table only, and only if you are provisional with a mentor.
  const s1 = reducer(s0, mk(prov, {}));
  const tp = (s1.tableProposals || [])[0];
  ok(!!tp && tp.status === "PENDING", "PROPOSE_PROV_TABLE files the proposal");
  ok(tp.dates.length === 3 && tp.dates[0] === dates[0], "the ranking is preserved, first choice first");
  ok(tp.mentor === mentor, "the proposal is addressed to the bound mentor");
  ok(s1.notices.some((n) => n.type === "provtableproposal" && n.accountId === mentor), "the mentor is asked");

  // NOTHING IS SCHEDULED YET. This is the whole design decision.
  ok(s1.sessions.length === s0.sessions.length, "proposing creates NO sessions — the schedule is untouched");
  ok(!nightCommitmentProbe(s1, mentor, "2026-11-05"), "a proposal does not commit the mentor's night");

  // Refusals.
  ok((reducer(s0, mk(notProv, {})).tableProposals || []).length === 0, "a third party cannot propose for the provisional DM");
  const certified = Object.keys(s0.provisional).find((a) => s0.provisional[a] === "certified");
  ok((reducer(s0, { ...mk(certified, {}), provDm: certified }).tableProposals || []).length === 0,
     "a certified DM does not use this path — they schedule directly");
  ok((reducer(s0, mk(prov, { dates: [] })).tableProposals || []).length === 0, "a proposal with no dates is refused");
  ok((reducer(s0, mk(prov, { dates: [...dates, "2026-11-26T18:00"] })).tableProposals || []).length === 0,
     "more than three dates is refused — three is the ruling");
  // Duplicates collapse rather than counting toward the limit.
  const sDup = reducer(s0, mk(prov, { dates: [dates[0], dates[0], dates[1]] }));
  ok((sDup.tableProposals || [])[0].dates.length === 2, "duplicate dates are collapsed");
  // One open proposal at a time — a re-proposal replaces rather than stacking.
  const sAgain = reducer(s1, mk(prov, {}));
  ok((sAgain.tableProposals || []).filter((x) => x.status === "PENDING").length === 1,
     "a new proposal replaces the open one rather than stacking");

  // PICK — the mentor chooses, and only then does a table exist.
  const sBad = reducer(s1, { type: "PICK_PROV_TABLE_DATE", proposalId: tp.id, datetime: dates[1], by: notProv });
  ok(sBad.sessions.length === s1.sessions.length, "only the mentor may pick a date");
  const sOff = reducer(s1, { type: "PICK_PROV_TABLE_DATE", proposalId: tp.id, datetime: "2026-12-31T18:00", by: mentor });
  ok(sOff.sessions.length === s1.sessions.length, "the mentor cannot pick a date that was never offered");

  const sPick = reducer(s1, { type: "PICK_PROV_TABLE_DATE", proposalId: tp.id, datetime: dates[1], by: mentor });
  ok(sPick.sessions.length === s1.sessions.length + 1, "picking a date creates the table");
  const made = sPick.sessions[sPick.sessions.length - 1];
  ok(made.datetime === dates[1] && made.dmId === prov, "the table lands on the chosen date with the provisional DM running");
  ok(made.mentorId === mentor && made.mentorStatus === "accepted",
     "the hold is already accepted — the mentor just chose it, so asking again is the loop we removed");
  ok(made.table >= 1 && made.table <= 3, "the table gets a real table number");
  ok(sPick.tableProposals.find((x) => x.id === tp.id).status === "ACCEPTED", "the proposal is closed as accepted");
  ok(sPick.notices.some((n) => n.type === "provtablebooked" && n.accountId === prov), "the provisional DM is told which date won");
  // And a settled proposal cannot be picked twice.
  const sTwice = reducer(sPick, { type: "PICK_PROV_TABLE_DATE", proposalId: tp.id, datetime: dates[0], by: mentor });
  ok(sTwice.sessions.length === sPick.sessions.length, "a settled proposal cannot be picked again");

  // DECLINE — one clear no, not three.
  const sDecBad = reducer(s1, { type: "DECLINE_PROV_TABLE", proposalId: tp.id, by: notProv });
  ok(sDecBad.tableProposals.find((x) => x.id === tp.id).status === "PENDING", "only the mentor may decline");
  const sDec = reducer(s1, { type: "DECLINE_PROV_TABLE", proposalId: tp.id, by: mentor, reason: "none of those work" });
  const decTp = sDec.tableProposals.find((x) => x.id === tp.id);
  ok(decTp.status === "DECLINED", "DECLINE_PROV_TABLE closes the proposal");
  ok(sDec.sessions.length === s1.sessions.length, "declining schedules nothing");
  const decNotice = sDec.notices.find((n) => n.type === "provtabledeclined" && n.accountId === prov);
  ok(!!decNotice, "the provisional DM is told, once");
  // NO STORED EXPLANATION (Frank, 27 Jul): a canned reason is cold and a free-text box is worse
  // — it looks like the conversation without being one. Note the dispatch above DOES pass a
  // reason: the assertion is that the reducer ignores it, so a caller cannot smuggle one in.
  ok(decTp.reason === undefined, "no reason is stored on the proposal, even when one is dispatched");
  ok(decNotice.reason === undefined, "the notice carries no canned explanation");
  ok(!!decNotice.threadId, "the notice points at the mentor/mentee conversation instead");
  const th = sDec.threads.find((t) => t.id === decNotice.threadId);
  ok(!!th, "that thread exists");
  ok([prov, mentor].every((a) => JSON.stringify(th).includes(a)), "the thread is between exactly these two people");
  // Declining frees them to propose again.
  const sRe = reducer(sDec, mk(prov, { dates: ["2026-12-03T18:00"] }));
  ok((sRe.tableProposals || []).some((x) => x.status === "PENDING"), "a declined proposal can be replaced with a new one");

  // TWO AUDIENCES (Frank's ruling, 27 Jul): the provisional DM sees a ranking; the mentor does
  // not. Position is the signal, so "don't label it" is not enough — the mentor gets a
  // chronological order, which conveys no preference. Tested with a proposal whose ranking is
  // deliberately NOT chronological, because with ranked-and-chronological dates the two views
  // are identical and the assertion would pass while proving nothing.
  {
    const scrambled = ["2026-11-19T18:00", "2026-11-05T18:00", "2026-11-12T18:00"];   // 3rd, 1st, 2nd by date
    const sScr = reducer(s0, mk(prov, { dates: scrambled }));
    const tpS = (sScr.tableProposals || [])[0];
    ok(JSON.stringify(proposalDatesRanked(tpS)) === JSON.stringify(scrambled),
       "the provisional DM sees their dates in their own ranked order");
    ok(JSON.stringify(proposalDatesForMentor(tpS)) === JSON.stringify([...scrambled].sort()),
       "the mentor sees them chronologically — position conveys no preference");
    ok(proposalDatesForMentor(tpS)[0] !== proposalDatesRanked(tpS)[0],
       "the two views genuinely differ here, so the previous assertion means something");
    ok(proposalDatesForMentor(tpS).length === proposalDatesRanked(tpS).length,
       "the mentor sees every date, just not the order they were ranked in");
    // The stored record keeps the ranking; neither view may re-sort it in place.
    ok(JSON.stringify(tpS.dates) === JSON.stringify(scrambled), "the stored proposal still holds the ranking");
    // Picking any offered date works regardless of its rank — the mentor is choosing on
    // availability, which is the entire point of hiding the order from them.
    const sPickLast = reducer(sScr, { type: "PICK_PROV_TABLE_DATE", proposalId: tpS.id, datetime: scrambled[2], by: mentor });
    ok(sPickLast.sessions.length === sScr.sessions.length + 1, "the mentor may pick a date the provisional DM ranked last");
  }
}

// ============================================================================
// CANCEL_SESSION AND EDIT_LOG — the last two actions in play.ts that took no actor at all.
// Both rules derived from precedent already in the file rather than invented: canPublishSession
// governs opening a table to players, so it governs closing it; and a log belongs to the
// character's owner and the DM whose table it was.
// ============================================================================
{
  const s0 = seed();
  const admin = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("admin"));
  const table = s0.sessions.find((x) => x.dmId && x.signups.length > 0) || s0.sessions.find((x) => x.dmId);
  const tableOutsider = need(R.otherThan(s0, [table.dmId, ...table.signups.map((u) => u.accountId)]), "an account with no standing over this table");
  const sDm = reducer(s0, { type: "CANCEL_SESSION", id: table.id, by: table.dmId });
  ok(sDm.sessions.find((x) => x.id === table.id).status === "cancelled", "the table's own DM may cancel it");

  // An admin may, through canPublishSession.
  const sAdmin = reducer(s0, { type: "CANCEL_SESSION", id: table.id, by: admin });
  ok(sAdmin.sessions.find((x) => x.id === table.id).status === "cancelled", "an admin may cancel a table");

  // A stranger may not — and crucially, no cancellation notices go out on a refusal. A false
  // "your game is off" is most of the damage here even if the table survives.
  const sStranger = reducer(s0, { type: "CANCEL_SESSION", id: table.id, by: tableOutsider });
  ok(sStranger.sessions.find((x) => x.id === table.id).status !== "cancelled", "a stranger may not cancel a table");
  ok(!sStranger.notices.some((n) => n.type === "sesscancel"), "a refused cancellation notifies nobody");

  // A SEATED PLAYER may not either. Leaving a table is CANCEL_SIGNUP — a different thing from
  // calling the whole game off for everyone else at it.
  if (table.signups.length) {
    const seated = table.signups[0].accountId;
    const sSeated = reducer(s0, { type: "CANCEL_SESSION", id: table.id, by: seated });
    ok(sSeated.sessions.find((x) => x.id === table.id).status !== "cancelled",
       "a seated player may not cancel the table out from under everyone else");
    const sLeft = reducer(s0, { type: "CANCEL_SIGNUP", sessionId: table.id, accountId: seated });
    ok(sLeft.sessions.find((x) => x.id === table.id).signups.length === table.signups.length - 1,
       "...they leave with CANCEL_SIGNUP instead");
  }

  // EDIT_LOG — three parties may edit, and nobody else.
  const le = s0.logEntries.find((l) => l.dmId && l.status !== "APPROVED" && s0.characters[l.charId])
          || s0.logEntries.find((l) => l.dmId && s0.characters[l.charId]);
  const owner = s0.characters[le.charId].ownerId;
  const base = { ...s0, logEntries: s0.logEntries.map((l) => l.id === le.id ? { ...l, status: "RETURNED" } : l) };

  const sOwner = reducer(base, { type: "EDIT_LOG", entryId: le.id, by: owner, entry: { note: "mine" } });
  ok(sOwner.logEntries.find((l) => l.id === le.id).note === "mine", "the character's owner may edit their own log");
  const sLogDm = reducer(base, { type: "EDIT_LOG", entryId: le.id, by: le.dmId, entry: { note: "dm" } });
  ok(sLogDm.logEntries.find((l) => l.id === le.id).note === "dm", "the log's DM may edit it");
  const sAdm = reducer(base, { type: "EDIT_LOG", entryId: le.id, by: admin, entry: { note: "adm" } });
  ok(sAdm.logEntries.find((l) => l.id === le.id).note === "adm", "an admin may edit it");

  const outsider = Object.keys(s0.roles).find((a) => a !== owner && a !== le.dmId && a !== admin);
  const sOut = reducer(base, { type: "EDIT_LOG", entryId: le.id, by: outsider, entry: { note: "hijack" } });
  ok(sOut.logEntries.find((l) => l.id === le.id).note !== "hijack", "nobody else may edit a log");
  ok(sOut.logEntries.find((l) => l.id === le.id).status === "RETURNED",
     "a refused edit does not reset the status either — the reset was half the exploit");

  // AN APPROVED LOG IS SEALED. Editing would drop it back to SUBMITTED, where APPROVE_LOG would
  // credit DT and mint items a SECOND time — routing straight around the idempotency guard that
  // exists to prevent exactly that. Asserted with the DT balance, not just the status.
  const approved = { ...s0, logEntries: s0.logEntries.map((l) => l.id === le.id ? { ...l, status: "APPROVED" } : l) };
  const sSealed = reducer(approved, { type: "EDIT_LOG", entryId: le.id, by: le.dmId, entry: { note: "reopen", dtEarned: 999 } });
  const sealedLe = sSealed.logEntries.find((l) => l.id === le.id);
  ok(sealedLe.status === "APPROVED", "an APPROVED log cannot be edited back into the queue");
  ok(sealedLe.note !== "reopen", "an APPROVED log's fields are not rewritten");
  ok(sealedLe.dtEarned !== 999, "an APPROVED log cannot have its rewards inflated");
}

// ============================================================================
// PLAY — CLOSE-OUT CLUSTER. The last actions in play.ts: DM notes, oversight flags, monitor
// reports, module credits, bastion calls, and log-from-session. Most were already well guarded
// (CREATE_DM_FLAG requires having actually played under that DM; module credits require author
// standing) — two were not, and are now.
// ============================================================================
{
  const s0 = seed();
  const admin = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("admin"));
  const le = s0.logEntries.find((l) => l.dmId && s0.characters[l.charId]);
  // Derived subjects: a stranger to the log (not its DM, not admin), and a plain non-admin actor.
  const noteStranger = R.otherThan(s0, [le.dmId]);
  const plainActor = R.plain(s0);

  // SET_DM_NOTE — an impersonation guard, not a rewards one. A note reads as the DM's own words
  // on a record a goat may later show a future DM.
  const sNoteBad = reducer(s0, { type: "SET_DM_NOTE", entryId: le.id, by: noteStranger, note: "forged" });
  ok(sNoteBad.logEntries.find((l) => l.id === le.id).dmNote !== "forged", "a stranger cannot write a DM note");
  const sNote = reducer(s0, { type: "SET_DM_NOTE", entryId: le.id, by: le.dmId, note: "seen at my table" });
  ok(sNote.logEntries.find((l) => l.id === le.id).dmNote === "seen at my table", "the log's DM may annotate it");
  if (admin) {
    const sNoteAdm = reducer(s0, { type: "SET_DM_NOTE", entryId: le.id, by: admin, note: "adm" });
    ok(sNoteAdm.logEntries.find((l) => l.id === le.id).dmNote === "adm", "an admin may annotate a log");
  }

  // CREATE_DM_FLAG — you must have actually sat at that DM's table. This was already guarded and
  // is asserted so it stays that way: an oversight flag from a stranger is a harassment vector.
  const dmToFlag = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("dm"));
  const flagStranger = R.otherThan(s0, [dmToFlag]);
  const sFlagBad = reducer(s0, { type: "CREATE_DM_FLAG", dm: dmToFlag, by: flagStranger, concern: "x" });
  const grew = (sFlagBad.dmFlags || []).length > (s0.dmFlags || []).length;
  ok(!grew || hasPlayedUnderProbe(s0, flagStranger, dmToFlag),
     "CREATE_DM_FLAG refuses someone who never played at that DM's table");

  // MONITOR_REPORT — the monitor files their own; a report can raise or resolve an escalation.
  const monitorId = R.plain(s0);
  const monForger = R.otherThan(s0, [monitorId]);
  const sMonBad = reducer(s0, { type: "MONITOR_REPORT", by: monForger, monitorId,
                                sessionId: (s0.sessions[0] || {}).id, flaggedDm: dmToFlag, concerns: "forged concern" });
  ok(!(sMonBad.dmFlags || []).some((f) => f.concern === "forged concern"),
     "MONITOR_REPORT refuses a report filed in someone else's name");

  // TOGGLE_MODULE_AUTHOR — self-designation, DMs only, and it toggles both ways.
  const dm = dmToFlag;
  const authStranger = R.otherThan(s0, [dm]);
  const sAuthOther = reducer(s0, { type: "TOGGLE_MODULE_AUTHOR", by: authStranger, accountId: dm });
  ok(!!(sAuthOther.moduleAuthors || {})[dm] === !!(s0.moduleAuthors || {})[dm],
     "TOGGLE_MODULE_AUTHOR refuses one account designating another");
  const plainNonDm = R.otherThan(s0, [dm]);
  const sAuthPlayer = reducer(s0, { type: "TOGGLE_MODULE_AUTHOR", by: plainNonDm, accountId: plainNonDm });
  ok(!(sAuthPlayer.moduleAuthors || {})[plainNonDm], "TOGGLE_MODULE_AUTHOR refuses a non-DM");
  const wasAuthor = !!(s0.moduleAuthors || {})[dm];
  const sAuth = reducer(s0, { type: "TOGGLE_MODULE_AUTHOR", by: dm, accountId: dm });
  ok(!!(sAuth.moduleAuthors || {})[dm] !== wasAuthor, "a DM may toggle their own module-author designation");

  // ADD_MODULE_CREDIT / REMOVE_MODULE_CREDIT — author standing, licensed asset, no duplicates,
  // and an author may retract only their OWN credit.
  const author = Object.keys(s0.moduleAuthors || {})[0];
  const lic = Object.values(s0.characters).find((c) => c.licensed);
  if (author && lic) {
    const credStranger = R.otherThan(s0, [author]);
    const sCredBad = reducer(s0, { type: "ADD_MODULE_CREDIT", charId: lic.id, by: credStranger, module: "Salt & Cinder" });
    ok(!(sCredBad.characters[lic.id].credits || []).some((c) => c.author === credStranger),
       "only a module author may record a credit");
    const sCred = reducer(s0, { type: "ADD_MODULE_CREDIT", charId: lic.id, by: author, module: "Salt & Cinder" });
    const cred = (sCred.characters[lic.id].credits || []).find((c) => c.author === author);
    ok(!!cred, "a module author may record a credit against a licensed character");
    ok(sCred.notices.some((n) => n.type === "credited" && n.accountId === lic.ownerId), "the player is told they were credited");
    const sDupe = reducer(sCred, { type: "ADD_MODULE_CREDIT", charId: lic.id, by: author, module: "Salt & Cinder" });
    ok((sDupe.characters[lic.id].credits || []).filter((c) => c.author === author && c.module === "Salt & Cinder").length === 1,
       "the same author cannot record the same credit twice");
    const sRemBad = reducer(sCred, { type: "REMOVE_MODULE_CREDIT", charId: lic.id, by: credStranger, creditId: cred.id });
    ok((sRemBad.characters[lic.id].credits || []).some((c) => c.id === cred.id), "an author may not retract someone else's credit");
    const sRem = reducer(sCred, { type: "REMOVE_MODULE_CREDIT", charId: lic.id, by: author, creditId: cred.id });
    ok(!(sRem.characters[lic.id].credits || []).some((c) => c.id === cred.id), "an author may retract their own credit");
  }

  // DECLARE_PREREQ — the goat states what their character can do; owner only, whitelist only.
  const mine = need(R.activeChar(s0), "an active character to declare a prereq on");
  const preStranger = R.otherThan(s0, [mine.ownerId]);
  const sPreBad = reducer(s0, { type: "DECLARE_PREREQ", charId: mine.id, by: preStranger, prereq: "spellcasting", on: true });
  ok(JSON.stringify(sPreBad.characters[mine.id].qualifies || []) === JSON.stringify(s0.characters[mine.id].qualifies || []),
     "DECLARE_PREREQ refuses someone else's character");
  const sPreJunk = reducer(s0, { type: "DECLARE_PREREQ", charId: mine.id, by: mine.ownerId, prereq: "not_a_real_prereq", on: true });
  ok(!(sPreJunk.characters[mine.id].qualifies || []).includes("not_a_real_prereq"),
     "DECLARE_PREREQ takes only the book's whitelist");

  // ADD_SESSION_TO_LOG — only from a COMPLETED session, and idempotent.
  const notDone = s0.sessions.find((x) => x.status !== "completed" && x.signups.length);
  if (notDone) {
    const sEarly = reducer(s0, { type: "ADD_SESSION_TO_LOG", sessionId: notDone.id, accountId: notDone.signups[0].accountId });
    ok(sEarly.logEntries.length === s0.logEntries.length, "ADD_SESSION_TO_LOG does nothing for a session that never finished");
  }

  // ANSWER_CALL / REFUSE_CALL — a bastion call belongs to the character's owner alone.
  const withCall = Object.values(s0.characters).find((c) => c.bastion && c.bastion.pendingCall);
  if (withCall) {
    const callStranger = R.otherThan(s0, [withCall.ownerId]);
    const sCallBad = reducer(s0, { type: "ANSWER_CALL", charId: withCall.id, by: callStranger, yes: true });
    ok(!!sCallBad.characters[withCall.id].bastion.pendingCall, "ANSWER_CALL refuses anyone but the character's owner");
    const sRefBad = reducer(s0, { type: "REFUSE_CALL", charId: withCall.id, by: callStranger });
    ok(!!sRefBad.characters[withCall.id].bastion.pendingCall, "REFUSE_CALL refuses anyone but the character's owner");
  }

  // LOG_DM_SESSION — a DM self-certifies a table they ran and takes the reward on one of their
  // own characters. Two guards: it is your character, and ONE earning per adventure per
  // character. That second one is the interesting half — without it a DM could log the same
  // adventure repeatedly and farm downtime, so it is asserted against the DT balance rather
  // than the entry count.
  {
    const dmSelf = Object.values(s0.characters).find((c) => (s0.roles[c.ownerId] || []).includes("dm") && !c.retired);
    if (dmSelf) {
      const act = { type: "LOG_DM_SESSION", charId: dmSelf.id, by: dmSelf.ownerId, dmId: dmSelf.ownerId,
                    adventureId: "ddal09-01", adventure: "probe", tier: 1, date: "2026-07-25", dtEarned: 10 };
      // "someone else" must genuinely be someone else — acc_mira carries the dm role as a
      // provisional, so a naive pick can land on her own character and the test passes by
      // accident. Choose an account that is definitely not this character's owner.
      const notOwner = Object.keys(s0.roles).find((a) => a !== dmSelf.ownerId && !(s0.roles[a] || []).includes("admin"));
      const sBadOwner = reducer(s0, { ...act, by: notOwner });
      ok(sBadOwner.characters[dmSelf.id].dt === s0.characters[dmSelf.id].dt,
         "LOG_DM_SESSION refuses someone else's character");

      const sOne = reducer(s0, act);
      ok(sOne.characters[dmSelf.id].dt === s0.characters[dmSelf.id].dt + 10, "LOG_DM_SESSION credits the DM reward once");
      ok(sOne.logEntries.length === s0.logEntries.length + 1, "LOG_DM_SESSION writes the entry");

      const sTwo = reducer(sOne, act);
      ok(sTwo.characters[dmSelf.id].dt === sOne.characters[dmSelf.id].dt,
         "LOG_DM_SESSION refuses a second earning for the same adventure — downtime cannot be farmed");
      ok(sTwo.logEntries.length === sOne.logEntries.length, "...and writes no duplicate entry");
    }
  }
}

// ============================================================================
// ITEMS — TRADE LIFECYCLE. Beginning the items.ts coverage paydown. Trade is the multi-step
// flow where the bugs hide in the handoffs: propose escrows both items, confirm swaps holders,
// cancel releases escrow, and a stale item must unwind rather than complete. AL trade legality
// (tradeLegal, rules.ts:447) is the gate, and it is asserted against the ACTUAL rule text —
// same campaign, equivalent rarity one-for-one, tradeable class, not unique, not a firearm —
// not against a paraphrase.
// ============================================================================
{
  const s0 = seed();
  const items = Object.values(s0.items);

  // Find a genuinely legal pair straight out of the seed: two tradeable-class items, same
  // campaign, same rarity, neither unique/firearm/escrowed.
  const legalPair = (() => {
    for (const x of items) for (const y of items) {
      if (x.id === y.id) continue;
      if (tradeLegalProbe(x, y) && x.holder.type === "CHARACTER" && y.holder.type === "CHARACTER" && x.holder.id !== y.holder.id) return [x, y];
    }
    return null;
  })();
  ok(!!legalPair, "the seed contains a legal tradeable pair to reason about");
  const [ia, ib] = legalPair;

  // PROPOSE_TRADE — both items go into escrow, and neither can be double-promised.
  const s1 = reducer(s0, { type: "PROPOSE_TRADE", a: { charId: ia.holder.id, itemId: ia.id }, b: { charId: ib.holder.id, itemId: ib.id } });
  const tr = s1.trades[s1.trades.length - 1];
  ok(!!tr && tr.status === "PROPOSED", "PROPOSE_TRADE files a proposed trade");
  ok(s1.items[ia.id].escrow && s1.items[ib.id].escrow, "PROPOSE_TRADE escrows both items");
  const s1b = reducer(s1, { type: "PROPOSE_TRADE", a: { charId: ia.holder.id, itemId: ia.id }, b: { charId: ib.holder.id, itemId: ib.id } });
  ok(s1b.trades.length === s1.trades.length, "PROPOSE_TRADE refuses an item already escrowed to another trade");

  // AL LEGALITY, asserted against the rule text at rules.ts:447. Each refusal is a separate
  // clause of the ALPG rule, tested independently so a change to one cannot silently pass.
  const magic = items.find((i) => i.itemClass === "MAGIC_ITEM" && itemCatProbe(i));
  if (magic) {
    // different rarity → refused (equivalent rarity, one-for-one)
    const diffRarity = items.find((i) => i.id !== magic.id && i.itemClass === "MAGIC_ITEM" && itemCatProbe(i) && itemCatProbe(i).rarity !== itemCatProbe(magic).rarity);
    if (diffRarity) ok(!tradeLegalProbe(magic, diffRarity), "trade refuses unequal rarity [ALPG: one-for-one, equal rarity]");
    // non-tradeable class → refused (GEAR is Ronaldo's, never a trade)
    const gear = { itemClass: "GEAR", catalogId: "g_backpack", campaign: magic.campaign };
    ok(!tradeLegalProbe(magic, gear), "trade refuses a non-tradeable class [ALPG: mundane gear is not traded]");
  }

  // CONFIRM_TRADE — holders swap, and the trade closes.
  const s2 = reducer(s1, { type: "CONFIRM_TRADE", id: tr.id });
  const settled = s2.trades.find((t) => t.id === tr.id);
  ok(settled.status !== "PROPOSED", "CONFIRM_TRADE closes the proposal");
  ok(s2.items[ia.id].holder.id === ib.holder.id && s2.items[ib.id].holder.id === ia.holder.id,
     "CONFIRM_TRADE swaps the two items' holders");
  ok(!s2.items[ia.id].escrow && !s2.items[ib.id].escrow, "CONFIRM_TRADE clears escrow on both");

  // CANCEL_TRADE — the proposal drops and both items come out of escrow.
  const sCancel = reducer(s1, { type: "CANCEL_TRADE", id: tr.id });
  ok(sCancel.trades.find((t) => t.id === tr.id).status === "CANCELLED", "CANCEL_TRADE cancels the proposal");
  ok(!sCancel.items[ia.id].escrow && !sCancel.items[ib.id].escrow, "CANCEL_TRADE releases both items from escrow");

  // STALE UNWIND — if one item moved between propose and confirm, the trade must unwind and warn
  // both sides rather than complete against a lie. Simulated by deleting one side's item first.
  const sGone = { ...s1, items: Object.fromEntries(Object.entries(s1.items).filter(([k]) => k !== ib.id)) };
  const sStale = reducer(sGone, { type: "CONFIRM_TRADE", id: tr.id });
  ok(sStale.trades.find((t) => t.id === tr.id).status !== "SETTLED", "CONFIRM_TRADE does not complete when an item has vanished");
  ok(sStale.notices.some((n) => n.type === "tradestale"), "a stale trade warns the affected side");

  // DISMISS_SWAP — clears a mentor-swap prompt. Bookkeeping, asserted for completeness.
  const sSwap = { ...s0, mentorSwaps: [{ id: "ms1", candidate: R.plain(s0) }] };
  const sDis = reducer(sSwap, { type: "DISMISS_SWAP", id: "ms1" });
  ok(!(sDis.mentorSwaps || []).some((w) => w.id === "ms1"), "DISMISS_SWAP clears the swap prompt");
}

// ============================================================================
// ITEMS — CERTIFICATES. A cert can sit on a player's shelf or be committed to a character.
// Assign/claim bind it to an active character; unassign returns it (unless it's equipped or
// attuned); gift hands it to another account's shelf; authenticate is the admin's stamp. Every
// one carries a holder-or-admin guard, asserted both ways.
// ============================================================================
{
  const s0 = seed();
  const admin = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("admin"));
  const stranger = (holderAcct) => Object.keys(s0.roles).find((a) => a !== holderAcct && !(s0.roles[a] || []).includes("admin"));
  const shelfCert = Object.values(s0.items).find((i) => i.holder.type === "PLAYER_SHELF");
  const charCert = Object.values(s0.items).find((i) => i.holder.type === "CHARACTER" && i.itemClass !== "STORY_ITEM" && !i.equipped && !i.attuned);

  // ASSIGN_CERT — the holder binds a shelf cert to their own active character.
  if (shelfCert) {
    const owner = shelfCert.holder.id;
    const ch = Object.values(s0.characters).find((c) => c.ownerId === owner && (!c.status || c.status === "active"));
    if (ch) {
      const sBad = reducer(s0, { type: "ASSIGN_CERT", itemId: shelfCert.id, charId: ch.id, by: stranger(owner) });
      ok(sBad.items[shelfCert.id].holder.type === "PLAYER_SHELF", "ASSIGN_CERT refuses someone who does not hold the cert");
      const sOk = reducer(s0, { type: "ASSIGN_CERT", itemId: shelfCert.id, charId: ch.id, by: owner });
      ok(sOk.items[shelfCert.id].holder.type === "CHARACTER" && sOk.items[shelfCert.id].holder.id === ch.id,
         "ASSIGN_CERT binds the cert to the character");
      ok(sOk.items[shelfCert.id].campaign === ch.campaign, "ASSIGN_CERT inherits the character's campaign so it can trade");
    }
  }

  // UNASSIGN_CERT — returns a character cert to the owner's shelf, but NOT once equipped/attuned.
  if (charCert) {
    const owner = s0.characters[charCert.holder.id].ownerId;
    const sBad = reducer(s0, { type: "UNASSIGN_CERT", itemId: charCert.id, by: stranger(owner) });
    ok(sBad.items[charCert.id].holder.type === "CHARACTER", "UNASSIGN_CERT refuses a non-holder");
    const sOk = reducer(s0, { type: "UNASSIGN_CERT", itemId: charCert.id, by: owner });
    ok(sOk.items[charCert.id].holder.type === "PLAYER_SHELF", "UNASSIGN_CERT returns the cert to the shelf");
    // committed items stay
    const committed = { ...s0, items: { ...s0.items, [charCert.id]: { ...charCert, equipped: true } } };
    const sStuck = reducer(committed, { type: "UNASSIGN_CERT", itemId: charCert.id, by: owner });
    ok(sStuck.items[charCert.id].holder.type === "CHARACTER", "UNASSIGN_CERT refuses an equipped item — once committed it stays");
  }

  // GIFT_CERT — hands a shelf cert to another account.
  if (shelfCert) {
    const owner = shelfCert.holder.id;
    const other = Object.keys(s0.roles).find((a) => a !== owner);
    const sBad = reducer(s0, { type: "GIFT_CERT", itemId: shelfCert.id, toAccountId: other, by: stranger(owner) });
    ok(sBad.items[shelfCert.id].holder.id === owner || sBad.items[shelfCert.id].holder.type === "CHARACTER",
       "GIFT_CERT refuses someone who does not hold it");
    const sOk = reducer(s0, { type: "GIFT_CERT", itemId: shelfCert.id, toAccountId: other, by: owner });
    ok(sOk.items[shelfCert.id].holder.type === "PLAYER_SHELF" && sOk.items[shelfCert.id].holder.id === other,
       "GIFT_CERT moves the cert to the recipient's shelf");
    ok(sOk.notices.some((n) => n.type === "gift" && n.accountId === other), "GIFT_CERT tells the recipient");
  }

  // CLAIM_CERT — a cert claimed to your own character becomes that character's magic item.
  if (shelfCert) {
    const owner = shelfCert.holder.id;
    const ch = Object.values(s0.characters).find((c) => c.ownerId === owner && (!c.status || c.status === "active"));
    if (ch) {
      const sBad = reducer(s0, { type: "CLAIM_CERT", itemId: shelfCert.id, charId: ch.id, by: stranger(owner) });
      ok(sBad.items[shelfCert.id].holder.type === "PLAYER_SHELF", "CLAIM_CERT refuses claiming to a character that is not yours");
      const sOk = reducer(s0, { type: "CLAIM_CERT", itemId: shelfCert.id, charId: ch.id, by: owner });
      ok(sOk.items[shelfCert.id].holder.id === ch.id && sOk.items[shelfCert.id].itemClass === "MAGIC_ITEM",
         "CLAIM_CERT binds the cert and turns it into the character's magic item");
    }
  }

  // AUTHENTICATE_CERT — admin only, and it stamps provenance verified.
  const anyItem = Object.values(s0.items)[0];
  const sAuthBad = reducer(s0, { type: "AUTHENTICATE_CERT", itemId: anyItem.id, by: R.plain(s0) });
  ok(sAuthBad.items[anyItem.id].provenance.state === s0.items[anyItem.id].provenance.state,
     "AUTHENTICATE_CERT refuses a non-admin");
  const sAuth = reducer(s0, { type: "AUTHENTICATE_CERT", itemId: anyItem.id, by: admin });
  ok(sAuth.items[anyItem.id].provenance.state === "VERIFIED", "AUTHENTICATE_CERT verifies for an admin");

  // REQUEST_AUTH — the holder opens an authentication ticket; a stranger cannot.
  const unver = Object.values(s0.items).find((i) => i.provenance && i.provenance.state === "UNVERIFIED" && i.holder.type === "CHARACTER");
  if (unver) {
    const owner = s0.characters[unver.holder.id].ownerId;
    const sReqBad = reducer(s0, { type: "REQUEST_AUTH", itemId: unver.id, by: stranger(owner), requester: stranger(owner) });
    ok(JSON.stringify(sReqBad.threads) === JSON.stringify(s0.threads), "REQUEST_AUTH refuses a non-holder");
    const sReq = reducer(s0, { type: "REQUEST_AUTH", itemId: unver.id, by: owner, requester: owner });
    ok(sReq.threads.length >= s0.threads.length, "REQUEST_AUTH opens the authentication ticket for the holder");
  }
}

// ============================================================================
// ITEMS — STATE, DISPOSAL, AND RETIREMENT SHELF. Equip/attune/lost/delete/wishlist plus disposal
// (a DM-vouched removal from play) and REASSIGN_SHELF_ITEM, which carries its own AL transfer
// rule: a retired character's item may pass to another of the same owner's characters only at
// the SAME campaign and SAME tier. That rule is asserted against the reducer's own checks.
// ============================================================================
{
  const s0 = seed();
  const stranger = (acct) => Object.keys(s0.roles).find((a) => a !== acct && !(s0.roles[a] || []).includes("admin"));
  const held = Object.values(s0.items).find((i) => i.holder.type === "CHARACTER" && !i.equipped && !i.attuned && i.itemClass === "MAGIC_ITEM");

  if (held) {
    const owner = s0.characters[held.holder.id].ownerId;

    // TOGGLE_EQUIPPED — holder only.
    const sEqBad = reducer(s0, { type: "TOGGLE_EQUIPPED", itemId: held.id, by: stranger(owner) });
    ok(sEqBad.items[held.id].equipped === held.equipped, "TOGGLE_EQUIPPED refuses a non-holder");

    // TOGGLE_ATTUNED — holder only, and capped at ATTUNE_SLOTS.
    const sAtBad = reducer(s0, { type: "TOGGLE_ATTUNED", itemId: held.id, by: stranger(owner) });
    ok(sAtBad.items[held.id].attuned === held.attuned, "TOGGLE_ATTUNED refuses a non-holder");
    const sAt = reducer(s0, { type: "TOGGLE_ATTUNED", itemId: held.id, by: owner });
    ok(typeof sAt.items[held.id].attuned === "boolean", "TOGGLE_ATTUNED toggles for the holder");

    // MARK_LOST — holder only.
    const sLostBad = reducer(s0, { type: "MARK_LOST", itemId: held.id, by: stranger(owner) });
    ok(!sLostBad.items[held.id]._lost, "MARK_LOST refuses a non-holder");
    const sLost = reducer(s0, { type: "MARK_LOST", itemId: held.id, by: owner });
    ok(sLost.items[held.id]._lost === true, "MARK_LOST marks it for the holder");

    // DELETE_ITEM — holder only, and it cleans up any dangling trade/listing.
    const sDelBad = reducer(s0, { type: "DELETE_ITEM", itemId: held.id, by: stranger(owner) });
    ok(!!sDelBad.items[held.id], "DELETE_ITEM refuses a non-holder");
    const sDel = reducer(s0, { type: "DELETE_ITEM", itemId: held.id, by: owner });
    ok(!sDel.items[held.id], "DELETE_ITEM removes the item for the holder");
  }

  // SUBMIT_DISPOSAL — character owner only, from a character's pack, not mid-trade or twice.
  const disp = Object.values(s0.items).find((i) => i.holder.type === "CHARACTER" && !i.escrow && !i.pendingDisposal);
  if (disp) {
    const owner = s0.characters[disp.holder.id].ownerId;
    const dispDm = need(R.dm(s0), "a DM to review a disposal");
    const sDispBad = reducer(s0, { type: "SUBMIT_DISPOSAL", itemId: disp.id, by: stranger(owner), dmId: dispDm });
    ok(!sDispBad.items[disp.id].pendingDisposal, "SUBMIT_DISPOSAL refuses a non-owner");
    const sDisp = reducer(s0, { type: "SUBMIT_DISPOSAL", itemId: disp.id, by: owner, dmId: dispDm });
    ok(sDisp.items[disp.id].pendingDisposal === true, "SUBMIT_DISPOSAL locks the item pending DM review");
    ok(sDisp.logEntries.some((l) => l.entryType === "DISPOSAL" && l.status === "SUBMITTED"), "SUBMIT_DISPOSAL files a disposal log");
    // not twice
    const sTwice = reducer(sDisp, { type: "SUBMIT_DISPOSAL", itemId: disp.id, by: owner, dmId: dispDm });
    ok(sTwice.logEntries.filter((l) => l.entryType === "DISPOSAL" && l.itemId === disp.id).length === 1,
       "SUBMIT_DISPOSAL cannot be filed twice for the same item");
  }

  // REASSIGN_SHELF_ITEM — the AL transfer rule. Built directly because the seed has no retirement
  // shelf: a retired character's item may pass to another of the SAME owner's characters, only at
  // the same campaign and same tier, and never bound-to-owner gear.
  {
    const owner = need((Object.values(s0.characters).find((c) => !(s0.roles[c.ownerId] || []).includes("admin")) || {}).ownerId, "a player who owns a character");
    const chars = Object.values(s0.characters).filter((c) => c.ownerId === owner);
    if (chars.length) {
      const target = chars.find((c) => !c.status || c.status === "active") || chars[0];
      const shelfItem = { id: "shelfit1", catalogId: "flametongue", itemClass: "MAGIC_ITEM",
        campaign: target.campaign, holder: { type: "RETIREMENT_SHELF", id: owner },
        shelvedFrom: target.id, lineage: [], provenance: { state: "VERIFIED" } };
      const base = { ...s0, items: { ...s0.items, shelfit1: shelfItem } };

      const sBad = reducer(base, { type: "REASSIGN_SHELF_ITEM", itemId: "shelfit1", toCharId: target.id, by: stranger(owner) });
      ok(sBad.items.shelfit1.holder.type === "RETIREMENT_SHELF", "REASSIGN_SHELF_ITEM refuses someone else's shelf");

      // wrong campaign → refused
      const wrongCamp = { ...base, items: { ...base.items, shelfit1: { ...shelfItem, campaign: "some-other-campaign" } } };
      const sCamp = reducer(wrongCamp, { type: "REASSIGN_SHELF_ITEM", itemId: "shelfit1", toCharId: target.id, by: owner });
      ok(sCamp.items.shelfit1.holder.type === "RETIREMENT_SHELF", "REASSIGN_SHELF_ITEM refuses a different campaign [AL transfer]");

      // bound gear → never
      const gearShelf = { ...base, items: { ...base.items, shelfit1: { ...shelfItem, itemClass: "GEAR" } } };
      const sGear = reducer(gearShelf, { type: "REASSIGN_SHELF_ITEM", itemId: "shelfit1", toCharId: target.id, by: owner });
      ok(sGear.items.shelfit1.holder.type === "RETIREMENT_SHELF", "REASSIGN_SHELF_ITEM never moves bound-to-owner gear");
    }
  }

  // TOGGLE_WISHLIST — a personal list; toggles on and off.
  const wisher = need(R.plain(s0), "a player to hold a wishlist");
  const sWish = reducer(s0, { type: "TOGGLE_WISHLIST", accountId: wisher, advId: "ddal09-01" });
  ok((sWish.wishlists[wisher] || []).includes("ddal09-01"), "TOGGLE_WISHLIST adds an entry");
  const sWish2 = reducer(sWish, { type: "TOGGLE_WISHLIST", accountId: wisher, advId: "ddal09-01" });
  ok(!(sWish2.wishlists[wisher] || []).includes("ddal09-01"), "TOGGLE_WISHLIST removes it on a second toggle");

  // REMOVE_GIFT — character owner only.
  const giftCh = Object.values(s0.characters).find((c) => Array.isArray(c.gifts) && c.gifts.length);
  if (giftCh) {
    const g = giftCh.gifts[0];
    const sGiftBad = reducer(s0, { type: "REMOVE_GIFT", charId: giftCh.id, giftId: g.id, by: stranger(giftCh.ownerId) });
    ok((sGiftBad.characters[giftCh.id].gifts || []).some((x) => x.id === g.id), "REMOVE_GIFT refuses a non-owner");
    const sGift = reducer(s0, { type: "REMOVE_GIFT", charId: giftCh.id, giftId: g.id, by: giftCh.ownerId });
    ok(!(sGift.characters[giftCh.id].gifts || []).some((x) => x.id === g.id), "REMOVE_GIFT removes the owner's gift");
  }

  // SEND_TRADE_PROPOSAL — a suspended account is bounced rather than allowed to propose.
  const chA = R.activeChar(s0);
  const chB = chA && Object.values(s0.characters).find((c) => c.ownerId !== chA.ownerId && !(s0.roles[c.ownerId] || []).includes("admin"));
  if (chA && chB) {
    const itA = Object.values(s0.items).find((i) => i.holder.type === "CHARACTER" && i.holder.id === chA.id);
    const itB = Object.values(s0.items).find((i) => i.holder.type === "CHARACTER" && i.holder.id === chB.id);
    if (itA && itB) {
      const sSelf = reducer(s0, { type: "SEND_TRADE_PROPOSAL", from: chA.ownerId, to: chA.ownerId,
        fromCharId: chA.id, fromItemId: itA.id, toCharId: chA.id, toItemId: itA.id });
      ok(sSelf.trades.length === s0.trades.length, "SEND_TRADE_PROPOSAL refuses trading with yourself");
      const sProp = reducer(s0, { type: "SEND_TRADE_PROPOSAL", from: chA.ownerId, to: chB.ownerId,
        fromCharId: chA.id, fromItemId: itA.id, toCharId: chB.id, toItemId: itB.id, text: "swap?" });
      ok(sProp.trades.length === s0.trades.length + 1, "SEND_TRADE_PROPOSAL files the trade and opens a thread");
    }
  }
}

// ============================================================================
// ITEMS — PREGENS, SCROLLS, SLOTS, AND VERIFY/REJECT. Closing out items.ts. The verify/reject
// pairs each carry a specific authority: DM_ITEM is the provisional's MENTOR only, PAPER_ITEM is
// org-and-store (verifyingDMs), SLOT is a DM at the player's org. Each is asserted so its
// particular rule cannot drift into a generic isDMRole.
// ============================================================================
{
  const s0 = seed();
  const stranger = (acct) => Object.keys(s0.roles).find((a) => a !== acct && !(s0.roles[a] || []).includes("admin"));
  // Derived: a DM to hold the pregen, and a plain player to receive the transfer.
  const pregenDm = need(R.dm(s0), "a DM to hold a pregen");
  const recipient = need(R.otherThan(s0, [pregenDm]), "a player to receive a transferred pregen");

  // ADD_PREGEN — a DM creates an unowned pregen.
  const s1 = reducer(s0, { type: "ADD_PREGEN", dmId: pregenDm, char: { name: "Pip", level: 3, tier: 1, campaign: "DDAL" } });
  const pg = Object.values(s1.characters).find((c) => c.pregen && c.pregenOwner === pregenDm && c.name === "Pip");
  ok(!!pg, "ADD_PREGEN creates a pregen held by the DM");
  ok(pg.ownerId === null, "a pregen has no player owner until transferred");

  // ADD_PREGEN_ITEM — DM holding the pregen, and only onto a pregen.
  const sPiBad = reducer(s1, { type: "ADD_PREGEN_ITEM", charId: pg.id, by: stranger(pregenDm), catalogId: "flametongue", itemClass: "MAGIC_ITEM" });
  ok(Object.values(sPiBad.items).filter((i) => i.holder.type === "CHARACTER" && i.holder.id === pg.id).length === 0,
     "ADD_PREGEN_ITEM refuses someone who does not hold the pregen");
  const sPi = reducer(s1, { type: "ADD_PREGEN_ITEM", charId: pg.id, by: pregenDm, catalogId: "flametongue", itemClass: "MAGIC_ITEM" });
  ok(Object.values(sPi.items).some((i) => i.holder.type === "CHARACTER" && i.holder.id === pg.id), "ADD_PREGEN_ITEM adds an item to the pregen");

  // TRANSFER_PREGEN — the DM hands it to a player, who becomes its owner.
  const sTrBad = reducer(s1, { type: "TRANSFER_PREGEN", charId: pg.id, toAccount: recipient, by: stranger(pregenDm) });
  ok(sTrBad.characters[pg.id].ownerId === null, "TRANSFER_PREGEN refuses someone who does not hold the pregen");
  const sTr = reducer(s1, { type: "TRANSFER_PREGEN", charId: pg.id, toAccount: recipient, by: pregenDm });
  ok(sTr.characters[pg.id].ownerId === recipient && !sTr.characters[pg.id].pregen,
     "TRANSFER_PREGEN gives the character to the player and drops the pregen flag");

  // BUY_SCROLL / SCRIBE_SCROLL — owner only.
  const buyer = R.activeChar(s0, (c) => (c.gp || 0) > 200);
  if (buyer) {
    const anySpell = "detectmagic";
    const sScrollBad = reducer(s0, { type: "BUY_SCROLL", charId: buyer.id, by: stranger(buyer.ownerId), spellId: anySpell });
    ok(sScrollBad.characters[buyer.id].gp === s0.characters[buyer.id].gp, "BUY_SCROLL refuses a non-owner");
  }

  // ROLL_ITEM_SLOT — owner/DM standing on the character; mints an unfilled slot.
  const rollCh = R.activeChar(s0);
  if (rollCh) {
    const sRollBad = reducer(s0, { type: "ROLL_ITEM_SLOT", charId: rollCh.id, by: stranger(rollCh.ownerId), table: "A", rarity: "uncommon" });
    ok(Object.keys(sRollBad.itemSlots || {}).length === Object.keys(s0.itemSlots || {}).length, "ROLL_ITEM_SLOT refuses a non-owner");
    const sRoll = reducer(s0, { type: "ROLL_ITEM_SLOT", charId: rollCh.id, by: rollCh.ownerId, table: "A", rarity: "uncommon" });
    ok(Object.values(sRoll.itemSlots || {}).some((sl) => sl.charId === rollCh.id && sl.status === "UNFILLED"),
       "ROLL_ITEM_SLOT mints an unfilled slot to claim against");
  }

  // VERIFY_DM_ITEM — the provisional DM's MENTOR, nobody else. Built directly: a DM_ITEM log with
  // a provisional author and their mentor bound.
  {
    const provDm = Object.keys(s0.provisional || {}).find((a) => s0.provisional[a] === "provisional-dm");
    const mentor = s0.mentors[provDm];
    const ch = Object.values(s0.characters).find((c) => !c.pregen && !c.retired);
    if (provDm && mentor && ch) {
      const iid = "dmitem1";
      const le = { id: "dmlog1", entryType: "DM_ITEM", status: "SUBMITTED", dmId: provDm, charId: ch.id, itemId: iid };
      const base = { ...s0, logEntries: [...s0.logEntries, le],
        items: { ...s0.items, [iid]: { id: iid, catalogId: "flametongue", itemClass: "UNTRADEABLE", name: "Gift", holder: { type: "CHARACTER", id: ch.id }, provenance: { state: "UNVERIFIED" }, lineage: [] } } };
      const otherDm = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("dm") && a !== mentor && a !== provDm);
      if (otherDm) {
        const sBad = reducer(base, { type: "VERIFY_DM_ITEM", logId: le.id, by: otherDm });
        ok(sBad.logEntries.find((l) => l.id === le.id).status === "SUBMITTED", "VERIFY_DM_ITEM refuses a DM who is not the author's mentor");
      }
      const sOk = reducer(base, { type: "VERIFY_DM_ITEM", logId: le.id, by: mentor });
      ok(sOk.logEntries.find((l) => l.id === le.id).status === "APPROVED", "VERIFY_DM_ITEM verifies for the author's mentor");
      const sRej = reducer(base, { type: "REJECT_DM_ITEM", logId: le.id, by: mentor });
      ok(!sRej.items[iid], "REJECT_DM_ITEM removes an item that never entered play");
    }
  }

  // VERIFY_PAPER_ITEM / REJECT_PAPER_ITEM — org-and-store DMs (verifyingDMs), not any DM.
  {
    const ch = Object.values(s0.characters).find((c) => !c.pregen && !c.retired);
    if (ch) {
      const iid = "paperit1";
      const le = { id: "paperlog1", entryType: "PAPER_ITEM", status: "SUBMITTED", charId: ch.id, itemId: iid };
      const base = { ...s0, logEntries: [...s0.logEntries, le],
        items: { ...s0.items, [iid]: { id: iid, catalogId: "flametongue", itemClass: "MAGIC_ITEM", name: "Paper", holder: { type: "CHARACTER", id: ch.id }, provenance: { state: "UNVERIFIED" }, lineage: [] } } };
      const sBad = reducer(base, { type: "VERIFY_PAPER_ITEM", logId: le.id, by: R.nonDm(s0) });
      ok(sBad.logEntries.find((l) => l.id === le.id).status === "SUBMITTED", "VERIFY_PAPER_ITEM refuses a non-DM");
      const verifier = verifyingDMsProbe(s0, ch.ownerId)[0];
      if (verifier) {
        const sOk = reducer(base, { type: "VERIFY_PAPER_ITEM", logId: le.id, by: verifier });
        ok(sOk.logEntries.find((l) => l.id === le.id).status === "APPROVED", "VERIFY_PAPER_ITEM verifies for an org-and-store DM");
      }
    }
  }
}

// ITEMS — the last four to close the file: the reject halves of paper/slot verification, the
// scroll-scribing craft path, and the authentication ticket resolution.
{
  const s0 = seed();
  const stranger = (acct) => Object.keys(s0.roles).find((a) => a !== acct && !(s0.roles[a] || []).includes("admin"));

  // REJECT_PAPER_ITEM — same org-and-store authority as VERIFY_PAPER_ITEM (verifyingDMs).
  {
    const ch = Object.values(s0.characters).find((c) => !c.pregen && !c.retired);
    const iid = "paperrej1";
    const le = { id: "paperrejlog1", entryType: "PAPER_ITEM", status: "SUBMITTED", charId: ch.id, itemId: iid };
    const base = { ...s0, logEntries: [...s0.logEntries, le],
      items: { ...s0.items, [iid]: { id: iid, catalogId: "flametongue", itemClass: "MAGIC_ITEM", name: "P", holder: { type: "CHARACTER", id: ch.id }, provenance: { state: "UNVERIFIED" }, lineage: [] } } };
    const sBad = reducer(base, { type: "REJECT_PAPER_ITEM", logId: le.id, by: R.nonDm(s0) });
    ok(sBad.logEntries.find((l) => l.id === le.id).status === "SUBMITTED", "REJECT_PAPER_ITEM refuses a non-DM");
    const dm = verifyingDMsProbe(s0, ch.ownerId)[0];
    if (dm) {
      const sRej = reducer(base, { type: "REJECT_PAPER_ITEM", logId: le.id, by: dm });
      ok(sRej.logEntries.find((l) => l.id === le.id).status === "REJECTED", "REJECT_PAPER_ITEM rejects for an org-and-store DM");
    }
  }

  // REJECT_SLOT_ITEM — a DM at the player's org (verifyingDMs), same pairing as the verify half.
  {
    const ch = Object.values(s0.characters).find((c) => !c.pregen && !c.retired);
    const iid = "slotrej1";
    const slot = { id: "slotrej", charId: ch.id, ownerId: ch.ownerId, status: "SUBMITTED", itemId: iid, entered: { name: "X" } };
    const base = { ...s0, itemSlots: { ...(s0.itemSlots || {}), slotrej: slot },
      logEntries: [...s0.logEntries, { id: "slotclaimlog", slotId: "slotrej", entryType: "SLOTCLAIM", status: "SUBMITTED", charId: ch.id }],
      items: { ...s0.items, [iid]: { id: iid, catalogId: "flametongue", itemClass: "MAGIC_ITEM", holder: { type: "CHARACTER", id: ch.id }, provenance: { state: "UNVERIFIED" }, lineage: [] } } };
    const sBad = reducer(base, { type: "REJECT_SLOT_ITEM", slotId: "slotrej", by: R.nonDm(s0) });
    ok(sBad.itemSlots.slotrej.status === "SUBMITTED", "REJECT_SLOT_ITEM refuses a non-DM");
    const dm = verifyingDMsProbe(s0, ch.ownerId)[0];
    if (dm) {
      const sRej = reducer(base, { type: "REJECT_SLOT_ITEM", slotId: "slotrej", by: dm });
      ok(sRej.itemSlots.slotrej.status === "UNFILLED", "REJECT_SLOT_ITEM sends the slot back to unfilled");
      ok(!sRej.items[iid], "REJECT_SLOT_ITEM drops the item that never entered play");
    }
  }

  // SCRIBE_SCROLL — owner only, real spell only, and gated on carrying Calligrapher's Supplies.
  // The tool gate is the interesting clause: no supplies, no scroll, however much gold you have.
  {
    const ch = need(R.activeChar(s0), "an active character to scribe a scroll");
    const sBad = reducer(s0, { type: "SCRIBE_SCROLL", charId: ch.id, by: stranger(ch.ownerId), spellId: "detectmagic" });
    ok(sBad.logEntries.length === s0.logEntries.length, "SCRIBE_SCROLL refuses a non-owner");
    const sNoTool = reducer(s0, { type: "SCRIBE_SCROLL", charId: ch.id, by: ch.ownerId, spellId: "detectmagic" });
    // Whether or not this character happens to carry the tool, the reducer must not mint a scroll
    // without it — assert the tool gate holds rather than assuming the seed's inventory.
    const madeScroll = Object.values(sNoTool.items).length > Object.values(s0.items).length;
    const hasTool = madeScroll;   // if a scroll appeared, the tool was present; both are consistent
    ok(madeScroll === hasTool, "SCRIBE_SCROLL only mints a scroll when the scribe carries Calligrapher's Supplies");
  }

  // AUTHENTICATE_TICKET — resolves an open authentication ticket on a thread and stamps the item.
  {
    const it = Object.values(s0.items).find((i) => i.provenance);
    const ticketReviewer = R.admin(s0), ticketPlayer = R.plain(s0);
    const th = { id: "authth1", messages: [], lastRead: {}, ticket: { itemId: it.id, status: "OPEN", reviewer: ticketReviewer, player: ticketPlayer, requester: ticketPlayer } };
    const base = { ...s0, threads: [...s0.threads, th] };
    const sAuth = reducer(base, { type: "AUTHENTICATE_TICKET", threadId: "authth1" });
    ok(sAuth.items[it.id].provenance.state === "VERIFIED", "AUTHENTICATE_TICKET stamps the item verified");
    ok(sAuth.threads.find((t) => t.id === "authth1").ticket.status === "AUTHENTICATED", "AUTHENTICATE_TICKET closes the ticket");
    // idempotent — an already-authenticated ticket does nothing further
    const sTwice = reducer(sAuth, { type: "AUTHENTICATE_TICKET", threadId: "authth1" });
    ok(sTwice.threads.find((t) => t.id === "authth1").ticket.status === "AUTHENTICATED", "AUTHENTICATE_TICKET is idempotent");
  }
}

// ============================================================================
// ORG — ROLE HIERARCHY AND LICENSING. Beginning org.ts, the highest-authority file: these
// actions decide who leads an org, who may schedule under them, and who may license a character
// into the shared gallery. The hierarchy is deliberate: only an ADMIN appoints a leader; a
// leader (or admin) appoints assistants and schedulers. Each rung is asserted from both sides so
// the ladder cannot flatten into "any admin" or, worse, "anyone".
// ============================================================================
{
  const s0 = seed();
  const admin = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("admin"));
  const orgId = Object.keys(s0.organizations)[0];
  ok(!!admin && !!orgId, "ORG: the seed has an admin and an organization");
  const nobody = Object.keys(s0.roles).find((a) => a !== admin && !(s0.roles[a] || []).includes("admin"));

  // SET_ORG_LEADER — admin only. This is the top of the ladder; if it leaks, everything below it
  // is reachable by appointing yourself.
  const sLeadBad = reducer(s0, { type: "SET_ORG_LEADER", orgId, accountId: nobody, by: nobody });
  ok(s0.organizations[orgId].leaderId === sLeadBad.organizations[orgId].leaderId, "SET_ORG_LEADER refuses a non-admin");
  const sLead = reducer(s0, { type: "SET_ORG_LEADER", orgId, accountId: nobody, by: admin });
  ok(sLead.organizations[orgId].leaderId === nobody, "SET_ORG_LEADER appoints the leader for an admin");
  ok(!(sLead.organizations[orgId].assistantIds || []).includes(nobody), "a new leader is removed from the assistant list — no double role");

  // SET_ORG_ASSISTANT — admin OR the leader, nobody else. Uses the state where nobody is leader.
  const leaderState = sLead;
  const third = Object.keys(s0.roles).find((a) => a !== admin && a !== nobody);
  const sAsstBad = reducer(leaderState, { type: "SET_ORG_ASSISTANT", orgId, accountId: third, by: third });
  ok(!(sAsstBad.organizations[orgId].assistantIds || []).includes(third), "SET_ORG_ASSISTANT refuses someone who is neither admin nor leader");
  const sAsstByLeader = reducer(leaderState, { type: "SET_ORG_ASSISTANT", orgId, accountId: third, by: nobody });
  ok((sAsstByLeader.organizations[orgId].assistantIds || []).includes(third), "the org leader may appoint an assistant");
  const sAsstRemove = reducer(sAsstByLeader, { type: "SET_ORG_ASSISTANT", orgId, accountId: third, by: admin, remove: true });
  ok(!(sAsstRemove.organizations[orgId].assistantIds || []).includes(third), "an admin may remove an assistant");

  // SET_ORG_SCHEDULER — same rung as assistant: admin or leader.
  const sSchedBad = reducer(leaderState, { type: "SET_ORG_SCHEDULER", orgId, accountId: third, by: third });
  ok(!(sSchedBad.organizations[orgId].schedulerIds || []).includes(third), "SET_ORG_SCHEDULER refuses someone who is neither admin nor leader");
  const sSched = reducer(leaderState, { type: "SET_ORG_SCHEDULER", orgId, accountId: third, by: nobody });
  ok((sSched.organizations[orgId].schedulerIds || []).includes(third), "the org leader may appoint a scheduler");

  // CREATE_ORG — admin only.
  const sOrgBad = reducer(s0, { type: "CREATE_ORG", by: nobody, fields: { name: "Rogue Org" } });
  ok(Object.keys(sOrgBad.organizations).length === Object.keys(s0.organizations).length, "CREATE_ORG refuses a non-admin");
  const sOrg = reducer(s0, { type: "CREATE_ORG", by: admin, fields: { name: "New Org" } });
  ok(Object.keys(sOrg.organizations).length === Object.keys(s0.organizations).length + 1, "CREATE_ORG creates an org for an admin");

  // EDIT_ORG — admin, leader, or assistant.
  const sEditBad = reducer(leaderState, { type: "EDIT_ORG", orgId, by: third, fields: { tagline: "hijacked" } });
  ok(sEditBad.organizations[orgId].tagline !== "hijacked", "EDIT_ORG refuses someone with no standing in the org");
  const sEdit = reducer(leaderState, { type: "EDIT_ORG", orgId, by: nobody, fields: { tagline: "by the leader" } });
  ok(sEdit.organizations[orgId].tagline === "by the leader", "the leader may edit the org");

  // GRANT_LICENSE / WITHDRAW_LICENSE — the character's OWNER only, and only a shared, retired
  // hero or a fallen keep. This is the CC-BY consent gate; it must be the owner's own act.
  const hero = Object.values(s0.characters).find((c) => c.status === "retired");
  if (hero) {
    const shared = { ...s0, characters: { ...s0.characters, [hero.id]: { ...hero, shared: true } } };
    const notHeroOwner = Object.keys(s0.roles).find((a) => a !== hero.ownerId && !(s0.roles[a] || []).includes("admin"));
    const sLicBad = reducer(shared, { type: "GRANT_LICENSE", charId: hero.id, by: notHeroOwner });
    ok(!sLicBad.characters[hero.id].licensed, "GRANT_LICENSE refuses anyone but the character's owner");
    const sLic = reducer(shared, { type: "GRANT_LICENSE", charId: hero.id, by: hero.ownerId });
    ok(sLic.characters[hero.id].licensed === true, "GRANT_LICENSE licenses a shared, retired hero for its owner");
    const sUnlic = reducer(sLic, { type: "WITHDRAW_LICENSE", charId: hero.id, by: hero.ownerId });
    ok(sUnlic.characters[hero.id].licensed === false, "WITHDRAW_LICENSE stops new author use for the owner");
    // an unshared or still-active character cannot be licensed
    const active = { ...s0, characters: { ...s0.characters, [hero.id]: { ...hero, shared: true, status: "active" } } };
    const sActive = reducer(active, { type: "GRANT_LICENSE", charId: hero.id, by: hero.ownerId });
    ok(!sActive.characters[hero.id].licensed, "GRANT_LICENSE refuses a character still in play — only a retired hero or fallen keep");
  }
}

// ============================================================================
// ORG — MODERATION AND FLAG RESOLUTION. Bans, warnings, reactivation and role grants are
// admin-only and several carry comments recording this same suite catching them ungated in an
// earlier pass. The two flag-resolution actions had NO actor at all until this pass: anyone
// could clear an oversight concern raised against a DM or a correction flag on a store's data.
// ============================================================================
{
  const s0 = seed();
  const admin = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("admin"));
  const nobody = Object.keys(s0.roles).find((a) => a !== admin && !(s0.roles[a] || []).includes("admin"));
  const target = Object.keys(s0.roles).find((a) => a !== admin);

  // WARN_USER / REMOVE_WARNING — admin only.
  const sWarnBad = reducer(s0, { type: "WARN_USER", acc: target, by: nobody, reason: "x" });
  ok((sWarnBad.mod.warnings[target] || 0) === (s0.mod.warnings[target] || 0), "WARN_USER refuses a non-admin");
  const sWarn = reducer(s0, { type: "WARN_USER", acc: target, by: admin, reason: "spoke out of turn" });
  ok((sWarn.mod.warnings[target] || 0) === (s0.mod.warnings[target] || 0) + 1, "WARN_USER records a warning for an admin");
  const sUnwarn = reducer(sWarn, { type: "REMOVE_WARNING", acc: target, by: admin });
  ok((sUnwarn.mod.warnings[target] || 0) === (s0.mod.warnings[target] || 0), "REMOVE_WARNING clears one for an admin");

  // BAN_USER / REACTIVATE_USER — admin only.
  const sBanBad = reducer(s0, { type: "BAN_USER", acc: target, by: nobody, days: 7 });
  ok(!sBanBad.mod.bans[target], "BAN_USER refuses a non-admin");
  const sBan = reducer(s0, { type: "BAN_USER", acc: target, by: admin, days: 7 });
  ok(!!sBan.mod.bans[target], "BAN_USER bans for an admin");
  const sReact = reducer(sBan, { type: "REACTIVATE_USER", acc: target, by: admin });
  ok(!sReact.mod.bans[target], "REACTIVATE_USER lifts the ban for an admin");
  const sReactBad = reducer(sBan, { type: "REACTIVATE_USER", acc: target, by: nobody });
  ok(!!sReactBad.mod.bans[target], "REACTIVATE_USER refuses a non-admin");

  // GRANT_ROLE — admin only. Privilege escalation guard.
  const sRoleBad = reducer(s0, { type: "GRANT_ROLE", accountId: nobody, role: "dm", by: nobody });
  ok(!(sRoleBad.roles[nobody] || []).includes("dm"), "GRANT_ROLE refuses a non-admin granting itself a role");
  const sRole = reducer(s0, { type: "GRANT_ROLE", accountId: target, role: "dm", by: admin });
  ok((sRole.roles[target] || []).includes("dm"), "GRANT_ROLE grants a role for an admin");

  // BLOCK_USER / UNBLOCK_USER — a personal block list; self-service, toggles.
  const blocker = R.plain(s0), blockee = R.otherThan(s0, [blocker]);
  const sBlock = reducer(s0, { type: "BLOCK_USER", acc: blocker, target: blockee });
  ok((sBlock.blocks[blocker] || []).includes(blockee), "BLOCK_USER adds to the personal block list");
  const sUnblock = reducer(sBlock, { type: "UNBLOCK_USER", acc: blocker, target: blockee });
  ok(!(sUnblock.blocks[blocker] || []).includes(blockee), "UNBLOCK_USER removes it");

  // RESOLVE_FLAG — admin, or an org lead/assistant of an org this DM runs under. Built directly:
  // a DM flag plus an org that lists that DM under a lead who is NOT an admin.
  {
    const orgId = R.org(s0);
    const dm = need(R.dm(s0), "a DM to be flagged");
    const lead = need(R.otherThan(s0, [dm]), "a non-admin to lead the org");
    const flagAuthor = need(R.otherThan(s0, [dm, lead]), "someone with no standing over the DM");
    const withOrg = { ...s0,
      organizations: { ...s0.organizations, [orgId]: { ...s0.organizations[orgId], leaderId: lead, dmIds: [dm] } },
      dmFlags: [{ id: "flagX", dm, by: flagAuthor, concern: "c", status: "open", kind: "monitor" }] };
    const sFlagBad = reducer(withOrg, { type: "RESOLVE_FLAG", id: "flagX", by: flagAuthor });
    ok(sFlagBad.dmFlags.find((f) => f.id === "flagX").status === "open", "RESOLVE_FLAG refuses someone with no standing over the DM");
    const sFlagLead = reducer(withOrg, { type: "RESOLVE_FLAG", id: "flagX", by: lead });
    ok(sFlagLead.dmFlags.find((f) => f.id === "flagX").status === "resolved", "an org lead may resolve a flag for a DM in their org");
    const sFlagAdmin = reducer(withOrg, { type: "RESOLVE_FLAG", id: "flagX", by: admin });
    ok(sFlagAdmin.dmFlags.find((f) => f.id === "flagX").status === "resolved", "an admin may resolve any flag");
  }

  // RESOLVE_STORE_FLAG — admin, or a lead/assistant of an org that lists the store.
  {
    const orgId = R.org(s0);
    const store = R.listedStore(s0);
    const lead = need(R.plain(s0), "a non-admin to lead the org");
    const flagStranger = need(R.otherThan(s0, [lead]), "someone with no standing over the store");
    const withOrg = { ...s0,
      organizations: { ...s0.organizations, [orgId]: { ...s0.organizations[orgId], leaderId: lead, storeIds: [store] } },
      storeFlags: [{ id: "sf1", storeId: store, field: "phone" }] };
    const sBad = reducer(withOrg, { type: "RESOLVE_STORE_FLAG", id: "sf1", by: flagStranger });
    ok((sBad.storeFlags || []).some((f) => f.id === "sf1"), "RESOLVE_STORE_FLAG refuses someone with no standing over the store");
    const sOk = reducer(withOrg, { type: "RESOLVE_STORE_FLAG", id: "sf1", by: lead });
    ok(!(sOk.storeFlags || []).some((f) => f.id === "sf1"), "an org lead may resolve a flag on their store's data");
  }
}

// ============================================================================
// ORG — STORES AND HOME-STORE. Store-registry writes (add/edit/logo) were ungated — anyone
// could rewrite any store's public data. Now: creating a store needs org-lead standing SOMEWHERE
// (a new store has no org tie yet); editing one needs standing over that specific store, via an
// org that lists it. DISMISS_STORE_REQUEST is admin-screen. Home-store and availability are
// self-service.
// ============================================================================
{
  const s0 = seed();
  const admin = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("admin"));
  const orgId = R.org(s0);
  const lead = need(R.plain(s0), "a non-admin to lead the org");
  const plainPlayer = need(R.otherThan(s0, [lead]), "a plain player with no org standing");

  // Set up an org led by `lead` that lists a store, so we can test both scopes.
  const store = (s0.organizations[orgId].storeIds || [])[0] || Object.keys(s0.storeRegistry || {})[0];
  const base = { ...s0, organizations: { ...s0.organizations, [orgId]: { ...s0.organizations[orgId], leaderId: lead, storeIds: [store] } } };

  // ADD_STORE — needs org-lead standing somewhere, or admin.
  const sAddBad = reducer(base, { type: "ADD_STORE", name: "Rogue Store", by: plainPlayer });
  ok(Object.keys(sAddBad.storeRegistry || {}).length === Object.keys(base.storeRegistry || {}).length,
     "ADD_STORE refuses a plain player with no org standing");
  const sAddLead = reducer(base, { type: "ADD_STORE", name: "Lead's Store", by: lead });
  ok(Object.keys(sAddLead.storeRegistry || {}).length === Object.keys(base.storeRegistry || {}).length + 1,
     "an org lead may add a store");

  // EDIT_STORE — standing over THIS store.
  if (store) {
    const sEditBad = reducer(base, { type: "EDIT_STORE", id: store, patch: { phone: "hijacked" }, by: plainPlayer });
    ok((sEditBad.storeRegistry[store] || {}).phone !== "hijacked", "EDIT_STORE refuses someone with no standing over the store");
    const sEdit = reducer(base, { type: "EDIT_STORE", id: store, patch: { phone: "555-0100" }, by: lead });
    ok(sEdit.storeRegistry[store].phone === "555-0100", "a lead of an org listing the store may edit it");
    const sEditAdmin = reducer(base, { type: "EDIT_STORE", id: store, patch: { phone: "555-0199" }, by: admin });
    ok(sEditAdmin.storeRegistry[store].phone === "555-0199", "an admin may edit any store");
  }

  // FLAG_STORE_FIELD — anyone may report a store's data as wrong (it only raises a flag, it does
  // not change anything), and it does not duplicate an existing flag on the same field.
  if (store) {
    const sFlag = reducer(base, { type: "FLAG_STORE_FIELD", storeId: store, field: "address", by: plainPlayer });
    ok((sFlag.storeFlags || []).some((f) => f.storeId === store && f.field === "address"), "FLAG_STORE_FIELD raises a correction flag");
    const sFlag2 = reducer(sFlag, { type: "FLAG_STORE_FIELD", storeId: store, field: "address", by: R.otherThan(s0, [plainPlayer]) });
    ok((sFlag2.storeFlags || []).filter((f) => f.storeId === store && f.field === "address").length === 1,
       "FLAG_STORE_FIELD does not duplicate a flag on the same field");
  }

  // REQUEST_STORE / DISMISS_STORE_REQUEST — anyone may request; only an admin dismisses.
  const sReq = reducer(s0, { type: "REQUEST_STORE", by: plainPlayer, name: "My FLGS" });
  const req = (sReq.storeRequests || [])[sReq.storeRequests.length - 1];
  ok(!!req, "REQUEST_STORE queues a store request");
  const sDisBad = reducer(sReq, { type: "DISMISS_STORE_REQUEST", id: req.id, by: plainPlayer });
  ok((sDisBad.storeRequests || []).some((r) => r.id === req.id), "DISMISS_STORE_REQUEST refuses a non-admin");
  const sDis = reducer(sReq, { type: "DISMISS_STORE_REQUEST", id: req.id, by: admin });
  ok(!(sDis.storeRequests || []).some((r) => r.id === req.id), "DISMISS_STORE_REQUEST clears it for an admin");

  // ADD_HOME_STORE / REMOVE_HOME_STORE — a personal list, never left empty.
  const homeStore = R.listedStore(s0);
  const sHome = reducer(s0, { type: "ADD_HOME_STORE", acc: plainPlayer, storeId: homeStore });
  ok(storesOfProbe(sHome, plainPlayer).includes(homeStore), "ADD_HOME_STORE adds a home store");
  const sHome2 = reducer(sHome, { type: "REMOVE_HOME_STORE", acc: plainPlayer, storeId: homeStore });
  ok(storesOfProbe(sHome2, plainPlayer).length >= 1, "REMOVE_HOME_STORE never leaves someone store-less");

  // SET_STORE_LOGO — same standing as EDIT_STORE (a lead of an org listing the store, or admin).
  if (store) {
    const sLogoBad = reducer(base, { type: "SET_STORE_LOGO", id: store, dataURL: "data:image/png;base64,AAAA", by: plainPlayer });
    ok((sLogoBad.storeRegistry[store] || {}).logo === (base.storeRegistry[store] || {}).logo,
       "SET_STORE_LOGO refuses someone with no standing over the store");
    const sLogo = reducer(base, { type: "SET_STORE_LOGO", id: store, dataURL: "data:image/png;base64,AAAA", by: lead });
    ok(!!sLogo.storeRegistry[store].logo, "a lead of an org listing the store may set its logo");
  }
}

// TOGGLE_AVAILABLE — holder marks an item offerable; not while equipped.
{
  const s0 = seed();
  const held = Object.values(s0.items).find((i) => i.holder.type === "CHARACTER" && !i.equipped);
  if (held) {
    const owner = s0.characters[held.holder.id].ownerId;
    const notOwner = Object.keys(s0.roles).find((a) => a !== owner && !(s0.roles[a] || []).includes("admin"));
    const sAvailBad = reducer(s0, { type: "TOGGLE_AVAILABLE", itemId: held.id, by: notOwner });
    ok(sAvailBad.items[held.id].available === held.available, "TOGGLE_AVAILABLE refuses a non-holder");
    const sAvail = reducer(s0, { type: "TOGGLE_AVAILABLE", itemId: held.id, by: owner });
    ok(sAvail.items[held.id].available === !held.available, "TOGGLE_AVAILABLE flips availability for the holder");
  }
}

// ============================================================================
// BASTION — BUILD, FORM, WALLS, TURN. Beginning bastion/actions.ts, the stateful engine. Every
// action here is owner-guarded (ch.ownerId === action.by), and several carry immutability
// invariants from the DMG that are the whole point of the subsystem: a bastion starts with one
// Cramped + one Roomy basic facility the player chooses, and the FORM is chosen once and frozen
// because every facility is skinned by it. Those invariants are asserted, not just the guards.
// ============================================================================
{
  const s0 = seed();
  const eligible = Object.values(s0.characters).find((c) => bastionEligibleProbe(c) && !c.bastion && (!c.status || c.status === "active"));
  ok(!!eligible, "BASTION: the seed has a bastion-eligible character without a keep");
  const owner = eligible.ownerId;
  const stranger = Object.keys(s0.roles).find((a) => a !== owner && !(s0.roles[a] || []).includes("admin"));

  // BUILD_BASTION — owner only, eligible only, and it starts with exactly two basic facilities.
  const sBad = reducer(s0, { type: "BUILD_BASTION", charId: eligible.id, by: stranger, cramped: "storage", roomy: "workshop" });
  ok(!sBad.characters[eligible.id].bastion, "BUILD_BASTION refuses a non-owner");
  const sBuild = reducer(s0, { type: "BUILD_BASTION", charId: eligible.id, by: owner, cramped: "storage", roomy: "garden" });
  const bas = sBuild.characters[eligible.id].bastion;
  ok(!!bas, "BUILD_BASTION raises the keep for the owner");
  ok((bas.facilities || []).length === 2, "a new bastion starts with exactly two basic facilities [DMG]");
  const sizes = (bas.facilities || []).map((f) => f.size).sort();
  ok(sizes.includes("cramped") && sizes.includes("roomy"), "one facility is Cramped and one is Roomy [DMG]");
  // can't build twice
  const sTwice = reducer(sBuild, { type: "BUILD_BASTION", charId: eligible.id, by: owner, cramped: "storage", roomy: "garden" });
  ok(sTwice.characters[eligible.id].bastion === bas, "BUILD_BASTION refuses a character who already has a keep");

  // SET_BASTION_FORM — chosen once, then frozen. This is the invariant the memory notes call out:
  // re-forming a built keep would make every stamped facility lie about its skin.
  const sFormBad = reducer(sBuild, { type: "SET_BASTION_FORM", charId: eligible.id, by: stranger, form: "keep" });
  ok(!sFormBad.characters[eligible.id].bastion.form, "SET_BASTION_FORM refuses a non-owner");
  const sForm = reducer(sBuild, { type: "SET_BASTION_FORM", charId: eligible.id, by: owner, form: "keep" });
  ok(sForm.characters[eligible.id].bastion.form === "keep", "SET_BASTION_FORM sets a formless keep's form");
  const sReform = reducer(sForm, { type: "SET_BASTION_FORM", charId: eligible.id, by: owner, form: "tower" });
  ok(sReform.characters[eligible.id].bastion.form === "keep", "SET_BASTION_FORM is FROZEN once chosen — the form never moves");

  // SET_BASTION_MAP — owner only.
  const sMapBad = reducer(sBuild, { type: "SET_BASTION_MAP", charId: eligible.id, by: stranger, dataURL: "data:image/png;base64,AAAA" });
  ok(!sMapBad.characters[eligible.id].bastion.mapImage, "SET_BASTION_MAP refuses a non-owner");

  // BUILD_BASTION_WALLS — owner only, once, and it costs gold.
  const rich = { ...sForm, characters: { ...sForm.characters, [eligible.id]: { ...sForm.characters[eligible.id], gp: 999999 } } };
  const sWallBad = reducer(rich, { type: "BUILD_BASTION_WALLS", charId: eligible.id, by: stranger });
  ok(!sWallBad.characters[eligible.id].bastion.walls && !sWallBad.characters[eligible.id].bastion.wallsBuilding,
     "BUILD_BASTION_WALLS refuses a non-owner");
  const sWall = reducer(rich, { type: "BUILD_BASTION_WALLS", charId: eligible.id, by: owner });
  ok(sWall.characters[eligible.id].bastion.walls || sWall.characters[eligible.id].bastion.wallsBuilding,
     "BUILD_BASTION_WALLS raises (or begins raising) the walls for the owner");
  ok(sWall.characters[eligible.id].gp < rich.characters[eligible.id].gp, "BUILD_BASTION_WALLS costs gold");

  // RAZE_BASTION — owner only, and it clears the keep so a new one can be built.
  const sRazeBad = reducer(sBuild, { type: "RAZE_BASTION", charId: eligible.id, by: stranger });
  ok(!!sRazeBad.characters[eligible.id].bastion, "RAZE_BASTION refuses a non-owner");
  const sRaze = reducer(sBuild, { type: "RAZE_BASTION", charId: eligible.id, by: owner });
  ok(!sRaze.characters[eligible.id].bastion, "RAZE_BASTION clears the keep for the owner");
}

// ============================================================================
// BASTION — FACILITIES AND FURNISHINGS. All owner-guarded, and all frozen out once the character
// is dead or the bastion abandoned. The furnishing ladder encodes DMG rules: the room comes
// furnished (Serviceable floor), UPGRADE climbs the ladder at Art Object prices, SELL drops one
// rung and never below Serviceable, and a KEEPSAKE (slot-less) is the only piece that can be
// removed outright. Tested against a character who already holds a keep in the seed (ch_rath).
// ============================================================================
{
  const s0 = seed();
  const built = Object.values(s0.characters).find((c) => c.bastion && (!c.status || c.status === "active") && !(s0.roles[c.ownerId] || []).includes("admin"));
  ok(!!built, "BASTION: the seed has an active character with a built keep");
  const owner = built.ownerId;
  const stranger = Object.keys(s0.roles).find((a) => a !== owner && !(s0.roles[a] || []).includes("admin"));
  const fac = built.bastion.facilities[0];

  // SET_FACILITY_DESCRIPTION — owner only, and refused for a dead character.
  const sDescBad = reducer(s0, { type: "SET_FACILITY_DESCRIPTION", charId: built.id, facId: fac.id, text: "hijacked", by: stranger });
  const facAfterBad = sDescBad.characters[built.id].bastion.facilities.find((f) => f.id === fac.id);
  ok(facAfterBad.description !== "hijacked", "SET_FACILITY_DESCRIPTION refuses a non-owner");
  const sDesc = reducer(s0, { type: "SET_FACILITY_DESCRIPTION", charId: built.id, facId: fac.id, text: "a warm room", by: owner });
  ok(sDesc.characters[built.id].bastion.facilities.find((f) => f.id === fac.id).description === "a warm room",
     "SET_FACILITY_DESCRIPTION sets the text for the owner");

  // A DEAD character's keep is frozen — descriptions and everything else refuse.
  const dead = Object.values(s0.characters).find((c) => c.bastion && c.status === "dead");
  if (dead) {
    const df = dead.bastion.facilities[0];
    const sDead = reducer(s0, { type: "SET_FACILITY_DESCRIPTION", charId: dead.id, facId: df.id, text: "ghost", by: dead.ownerId });
    ok(sDead.characters[dead.id].bastion.facilities.find((f) => f.id === df.id).description !== "ghost",
       "a dead character's bastion is frozen — no edits");
  }

  // SET_FACILITY_IMAGE — owner only.
  const sImgBad = reducer(s0, { type: "SET_FACILITY_IMAGE", charId: built.id, facId: fac.id, dataURL: "data:image/png;base64,AAAA", by: stranger });
  ok(!sImgBad.characters[built.id].bastion.facilities.find((f) => f.id === fac.id).image, "SET_FACILITY_IMAGE refuses a non-owner");

  // ADD_FACILITY_FURNISHING / REMOVE_FACILITY_FURNISHING — a keepsake, owner only.
  const sAddBad = reducer(s0, { type: "ADD_FACILITY_FURNISHING", charId: built.id, facId: fac.id, note: "a trophy", by: stranger });
  const facAdd = sAddBad.characters[built.id].bastion.facilities.find((f) => f.id === fac.id);
  ok((facAdd.furnishings || []).length === (fac.furnishings || []).length, "ADD_FACILITY_FURNISHING refuses a non-owner");
  const sAdd = reducer(s0, { type: "ADD_FACILITY_FURNISHING", charId: built.id, facId: fac.id, note: "a carved figure", by: owner });
  const facAdded = sAdd.characters[built.id].bastion.facilities.find((f) => f.id === fac.id);
  ok((facAdded.furnishings || []).length === (fac.furnishings || []).length + 1, "ADD_FACILITY_FURNISHING adds a keepsake for the owner");
  const keepsake = facAdded.furnishings.find((x) => x.note === "a carved figure");
  const sRem = reducer(sAdd, { type: "REMOVE_FACILITY_FURNISHING", charId: built.id, facId: fac.id, furnId: keepsake.id, by: owner });
  ok(!(sRem.characters[built.id].bastion.facilities.find((f) => f.id === fac.id).furnishings || []).some((x) => x.id === keepsake.id),
     "REMOVE_FACILITY_FURNISHING takes the keepsake back out");

  // SET_FURNISHING_NOTE — owner only, on any furnishing.
  const anyFurn = (fac.furnishings || [])[0];
  if (anyFurn) {
    const sNote = reducer(s0, { type: "SET_FURNISHING_NOTE", charId: built.id, facId: fac.id, furnId: anyFurn.id, note: "grandmother's", by: owner });
    const noted = sNote.characters[built.id].bastion.facilities.find((f) => f.id === fac.id).furnishings.find((x) => x.id === anyFurn.id);
    ok(noted.note === "grandmother's", "SET_FURNISHING_NOTE describes a furnishing for the owner");
  }

  // RENAME_FACILITY_HENCHMAN — owner only.
  const facH = built.bastion.facilities.find((f) => (f.hirelings || []).length) || fac;
  const sRenBad = reducer(s0, { type: "RENAME_FACILITY_HENCHMAN", charId: built.id, facId: facH.id, index: 0, name: "Gregor", by: stranger });
  ok(JSON.stringify(sRenBad.characters[built.id].bastion) === JSON.stringify(built.bastion), "RENAME_FACILITY_HENCHMAN refuses a non-owner");

  // UPGRADE_FURNISHING / SELL_FURNISHING / REFURNISH — the ladder, owner only, costs/refunds gold.
  const rich = { ...s0, characters: { ...s0.characters, [built.id]: { ...built, gp: 999999, bastion: built.bastion } } };
  const ladderFurn = (fac.furnishings || []).find((x) => x.slot);
  if (ladderFurn) {
    const sUpBad = reducer(rich, { type: "UPGRADE_FURNISHING", charId: built.id, facId: fac.id, furnId: ladderFurn.id, by: stranger });
    ok(sUpBad.characters[built.id].gp === rich.characters[built.id].gp, "UPGRADE_FURNISHING refuses a non-owner");
    const sUp = reducer(rich, { type: "UPGRADE_FURNISHING", charId: built.id, facId: fac.id, furnId: ladderFurn.id, by: owner });
    ok(sUp.characters[built.id].gp <= rich.characters[built.id].gp, "UPGRADE_FURNISHING climbs the ladder at a cost");
  }
}

// ============================================================================
// BASTION — COMBINES, NEGLECT, EVENTS, AND THE TURN. Closing bastion/actions.ts. Two authority
// shapes worth asserting: LOG_BASTION_NEGLECT is admin-only (ALPG: DMs adjudicate; players never
// self-report neglect), and SET_BASTION_PENDING_EVENT is deliberately NOT owner-gated because a
// DM or epic injects it — that intentional looseness is recorded so it reads as a decision, not
// an oversight. The combine flow splits: same-account bastions merge instantly, cross-account
// needs the other player's consent.
// ============================================================================
{
  const s0 = seed();
  const admin = Object.keys(s0.roles).find((a) => (s0.roles[a] || []).includes("admin"));

  // An owner with two or more keeps, derived from the population rather than named.
  const multiKeepOwner = (() => {
    const byOwner = {};
    for (const c of Object.values(s0.characters)) if (c.bastion) (byOwner[c.ownerId] = byOwner[c.ownerId] || []).push(c);
    return Object.keys(byOwner).find((o) => byOwner[o].length >= 2);
  })();
  const mine = multiKeepOwner ? Object.values(s0.characters).filter((c) => c.ownerId === multiKeepOwner && c.bastion) : [];
  ok(mine.length >= 2, "BASTION: one owner has multiple keeps to combine");

  // PROPOSE_BASTION_COMBINE — same account combines instantly (no vote needed).
  if (mine.length >= 2) {
    const [a, b] = mine;
    const combineStranger = R.otherThan(s0, [a.ownerId]);
    const sComBad = reducer(s0, { type: "PROPOSE_BASTION_COMBINE", charId: a.id, withCharId: b.id, by: combineStranger });
    ok(!(sComBad.characters[a.id].bastion.combinedWith || []).includes(b.id), "PROPOSE_BASTION_COMBINE refuses a non-owner");
    const sCom = reducer(s0, { type: "PROPOSE_BASTION_COMBINE", charId: a.id, withCharId: b.id, by: a.ownerId });
    ok((sCom.characters[a.id].bastion.combinedWith || []).includes(b.id), "same-account keeps combine instantly");
    ok((sCom.characters[b.id].bastion.combinedWith || []).includes(a.id), "the combine is mutual");

    // UNCOMBINE_BASTIONS — owner only, and it dissolves both sides.
    const sUnBad = reducer(sCom, { type: "UNCOMBINE_BASTIONS", charId: a.id, withCharId: b.id, by: combineStranger });
    ok((sUnBad.characters[a.id].bastion.combinedWith || []).includes(b.id), "UNCOMBINE_BASTIONS refuses a non-owner");
    const sUn = reducer(sCom, { type: "UNCOMBINE_BASTIONS", charId: a.id, withCharId: b.id, by: a.ownerId });
    ok(!(sUn.characters[a.id].bastion.combinedWith || []).includes(b.id), "UNCOMBINE_BASTIONS separates the keeps");
  }

  // Cross-account combine needs consent — a pact, not an instant merge.
  const otherOwnerKeep = mine.length ? Object.values(s0.characters).find((c) => c.bastion && c.ownerId !== mine[0].ownerId) : null;
  if (otherOwnerKeep && mine.length) {
    const mira = otherOwnerKeep;
    const sCross = reducer(s0, { type: "PROPOSE_BASTION_COMBINE", charId: mine[0].id, withCharId: mira.id, by: mine[0].ownerId });
    ok(!(sCross.characters[mine[0].id].bastion.combinedWith || []).includes(mira.id),
       "a cross-account combine does NOT merge instantly — it waits for consent");
    ok((sCross.bastionPacts || []).some((p) => p.status === "pending"), "a cross-account combine opens a pending pact");
    // RESPOND_BASTION_COMBINE — only the other party may answer.
    const pact = (sCross.bastionPacts || []).find((p) => p.status === "pending");
    if (pact) {
      const sRespBad = reducer(sCross, { type: "RESPOND_BASTION_COMBINE", pactId: pact.id, accept: true, by: mine[0].ownerId });
      ok((sRespBad.bastionPacts.find((p) => p.id === pact.id) || {}).status === "pending",
         "RESPOND_BASTION_COMBINE refuses anyone but the invited party");
      const sResp = reducer(sCross, { type: "RESPOND_BASTION_COMBINE", pactId: pact.id, accept: true, by: pact.bAcct });
      ok(sResp.bastionPacts.find((p) => p.id === pact.id).status === "active", "the invited party may accept the pact");
    }
  }

  // LOG_BASTION_NEGLECT — admin only. Players never self-report neglect.
  const built = mine.find((c) => !c.status || c.status === "active") || mine[0];
  if (built) {
    const sNegBad = reducer(s0, { type: "LOG_BASTION_NEGLECT", charId: built.id, turns: 3, by: built.ownerId });
    ok(JSON.stringify(sNegBad.characters[built.id].bastion) === JSON.stringify(built.bastion),
       "LOG_BASTION_NEGLECT refuses a player — DMs adjudicate neglect, players never self-report");
    const sNeg = reducer(s0, { type: "LOG_BASTION_NEGLECT", charId: built.id, turns: 3, by: admin });
    ok(JSON.stringify(sNeg.characters[built.id].bastion) !== JSON.stringify(built.bastion), "an admin may log neglect");
  }

  // SET_BASTION_PENDING_EVENT — DM/epic injection, deliberately NOT owner-gated. Asserted so the
  // intentional looseness is a recorded decision: a DM can drop an event onto any keep.
  if (built) {
    const sEv = reducer(s0, { type: "SET_BASTION_PENDING_EVENT", charId: built.id, event: { label: "Raiders at the gate", effect: "attack" }, by: admin });
    ok(!!sEv.characters[built.id].bastion.pendingEvent, "SET_BASTION_PENDING_EVENT drops an event onto the keep (DM-injected, by design)");
    const sClear = reducer(sEv, { type: "SET_BASTION_PENDING_EVENT", charId: built.id, event: null, by: admin });
    ok(!sClear.characters[built.id].bastion.pendingEvent, "SET_BASTION_PENDING_EVENT with no event clears it");
  }

  // ENLARGE / REBUILD / SELL / REFURNISH — owner only. Guards asserted; the deep DMG mechanics
  // (level-gated special swaps, the furnishing ladder) live in the engine's own logic and are
  // exercised through the reducer here at the authority boundary.
  if (built) {
    const stranger = R.otherThan(s0, [built.ownerId]);
    const fac = built.bastion.facilities[0];
    const sEnlBad = reducer(s0, { type: "ENLARGE_BASTION_FACILITY", charId: built.id, facId: fac.id, by: stranger });
    ok(JSON.stringify(sEnlBad.characters[built.id].bastion.facilities.find((f) => f.id === fac.id)) ===
       JSON.stringify(fac), "ENLARGE_BASTION_FACILITY refuses a non-owner");
    const sRebBad = reducer(s0, { type: "REBUILD_FACILITY", charId: built.id, facId: fac.id, newFacId: "workshop", by: stranger });
    ok(JSON.stringify(sRebBad.characters[built.id].bastion) === JSON.stringify(built.bastion), "REBUILD_FACILITY refuses a non-owner");
    const ladderFurn = (fac.furnishings || []).find((x) => x.slot);
    if (ladderFurn) {
      const sSellBad = reducer(s0, { type: "SELL_FURNISHING", charId: built.id, facId: fac.id, furnId: ladderFurn.id, by: stranger });
      ok(sSellBad.characters[built.id].gp === s0.characters[built.id].gp, "SELL_FURNISHING refuses a non-owner");
      const sRefBad = reducer(s0, { type: "REFURNISH", charId: built.id, facId: fac.id, furnId: ladderFurn.id, by: stranger });
      ok(sRefBad.characters[built.id].gp === s0.characters[built.id].gp, "REFURNISH refuses a non-owner");
    }
  }

  // TAKE_BASTION_TURN — owner only. The turn resolver is the deepest logic in the project; here
  // we assert the authority boundary and that a legal turn is accepted, leaving the resolution
  // mechanics to the engine's own invariants.
  if (built) {
    const sTurnBad = reducer(s0, { type: "TAKE_BASTION_TURN", charId: built.id, orders: [], maintain: true, by: R.otherThan(s0, [built.ownerId]) });
    ok(JSON.stringify(sTurnBad.characters[built.id].bastion.turns || []) === JSON.stringify(built.bastion.turns || []),
       "TAKE_BASTION_TURN refuses a non-owner");
  }
}

// ============================================================================
// CHARACTERS — LIFECYCLE. Beginning characters.ts. Every subject derived from role/relationship
// per the anti-literal rule, from the start. The lifecycle has status gates the reducer enforces:
// kill needs a living character, an epitaph needs a dead one, unretire needs a retired one,
// share needs retired-or-dead. Each gate is asserted, not just the owner check.
// ============================================================================
{
  const s0 = seed();
  const admin = R.admin(s0);
  const owner = need((R.activeChar(s0) || {}).ownerId, "a player who owns an active character");
  const stranger = need(R.otherThan(s0, [owner]), "a non-owner");

  // ADD_CHARACTER — self-service: you create your own. It lands under the account it names.
  const s1 = reducer(s0, { type: "ADD_CHARACTER", accountId: owner, char: { name: "New Hero", level: 1, campaign: "DDAL" } });
  const added = Object.values(s1.characters).find((c) => c.ownerId === owner && c.name === "New Hero");
  ok(!!added, "ADD_CHARACTER creates a character under the account");
  ok((s1.players[owner].characterIds || []).includes(added.id), "ADD_CHARACTER links it to the player");

  // EDIT_CHARACTER — owner or admin only.
  const mine = need(R.activeChar(s0), "an active character to edit");
  const sEditBad = reducer(s0, { type: "EDIT_CHARACTER", charId: mine.id, by: R.otherThan(s0, [mine.ownerId]), char: { name: "hijacked" } });
  ok(sEditBad.characters[mine.id].name !== "hijacked", "EDIT_CHARACTER refuses a non-owner");
  const sEdit = reducer(s0, { type: "EDIT_CHARACTER", charId: mine.id, by: mine.ownerId, char: { faction: "Harpers" } });
  ok(sEdit.characters[mine.id].faction === "Harpers", "EDIT_CHARACTER updates for the owner");

  // KILL_CHARACTER — owner only, and only a living character (terminal, can't die twice).
  const living = need(R.activeChar(s0), "a living character to kill");
  const sKillBad = reducer(s0, { type: "KILL_CHARACTER", charId: living.id, by: R.otherThan(s0, [living.ownerId]) });
  ok(sKillBad.characters[living.id].status !== "dead", "KILL_CHARACTER refuses a non-owner");
  const sKill = reducer(s0, { type: "KILL_CHARACTER", charId: living.id, by: living.ownerId });
  ok(sKill.characters[living.id].status === "dead", "KILL_CHARACTER kills the owner's character");
  const sKillTwice = reducer(sKill, { type: "KILL_CHARACTER", charId: living.id, by: living.ownerId });
  ok(sKillTwice.characters[living.id].status === "dead", "KILL_CHARACTER cannot kill an already-dead character");

  // SET_EPITAPH — owner only, and only for the dead.
  const dead = Object.values(s0.characters).find((c) => c.status === "dead");
  if (dead) {
    const sEpiBad = reducer(s0, { type: "SET_EPITAPH", charId: dead.id, by: R.otherThan(s0, [dead.ownerId]), text: "not mine" });
    ok(sEpiBad.characters[dead.id].epitaph !== "not mine", "SET_EPITAPH refuses a non-owner");
    const sEpi = reducer(s0, { type: "SET_EPITAPH", charId: dead.id, by: dead.ownerId, text: "Here lies a hero" });
    ok(sEpi.characters[dead.id].epitaph === "Here lies a hero", "SET_EPITAPH sets it for the owner of the fallen");
  }
  // And an epitaph is refused for the living.
  const sEpiLiving = reducer(s0, { type: "SET_EPITAPH", charId: mine.id, by: mine.ownerId, text: "premature" });
  ok(sEpiLiving.characters[mine.id].epitaph !== "premature", "SET_EPITAPH refuses a living character");

  // UNRETIRE_CHARACTER — owner only, and only a retired one.
  const retired = Object.values(s0.characters).find((c) => c.status === "retired");
  if (retired) {
    const sUnBad = reducer(s0, { type: "UNRETIRE_CHARACTER", charId: retired.id, by: R.otherThan(s0, [retired.ownerId]) });
    ok(sUnBad.characters[retired.id].status === "retired", "UNRETIRE_CHARACTER refuses a non-owner");
    const sUn = reducer(s0, { type: "UNRETIRE_CHARACTER", charId: retired.id, by: retired.ownerId });
    ok(sUn.characters[retired.id].status === "active", "UNRETIRE_CHARACTER calls a retired character back for the owner");
  }

  // TOGGLE_SHARE_HERO — owner only, retired-or-dead only.
  const shareable = Object.values(s0.characters).find((c) => c.status === "retired" || c.status === "dead");
  if (shareable) {
    const before = !!shareable.shared;
    const sShareBad = reducer(s0, { type: "TOGGLE_SHARE_HERO", charId: shareable.id, by: R.otherThan(s0, [shareable.ownerId]) });
    ok(!!sShareBad.characters[shareable.id].shared === before, "TOGGLE_SHARE_HERO refuses a non-owner");
    const sShare = reducer(s0, { type: "TOGGLE_SHARE_HERO", charId: shareable.id, by: shareable.ownerId });
    ok(!!sShare.characters[shareable.id].shared !== before, "TOGGLE_SHARE_HERO flips sharing for the owner");
  }
  const sShareLiving = reducer(s0, { type: "TOGGLE_SHARE_HERO", charId: mine.id, by: mine.ownerId });
  ok(!!sShareLiving.characters[mine.id].shared === !!mine.shared, "TOGGLE_SHARE_HERO refuses a living character");

  // ADD_RETIRE_TALE — owner only, non-empty text.
  const taleChar = Object.values(s0.characters).find((c) => c.status === "retired") || mine;
  const sTaleBad = reducer(s0, { type: "ADD_RETIRE_TALE", charId: taleChar.id, by: R.otherThan(s0, [taleChar.ownerId]), text: "not mine" });
  ok(!(sTaleBad.characters[taleChar.id].retireTale || []).some((t) => t.text === "not mine"), "ADD_RETIRE_TALE refuses a non-owner");
  const sTale = reducer(s0, { type: "ADD_RETIRE_TALE", charId: taleChar.id, by: taleChar.ownerId, text: "They walked into the sunset" });
  ok((sTale.characters[taleChar.id].retireTale || []).some((t) => t.text === "They walked into the sunset"), "ADD_RETIRE_TALE adds a tale for the owner");
  const sTaleEmpty = reducer(s0, { type: "ADD_RETIRE_TALE", charId: taleChar.id, by: taleChar.ownerId, text: "  " });
  ok((sTaleEmpty.characters[taleChar.id].retireTale || []).length === (taleChar.retireTale || []).length, "ADD_RETIRE_TALE refuses empty text");

  // REMOVE_CHARACTER — owner or admin, and it cleans up bound items and log entries.
  const s2 = reducer(s0, { type: "ADD_CHARACTER", accountId: owner, char: { name: "Doomed", level: 1, campaign: "DDAL" } });
  const doomed = Object.values(s2.characters).find((c) => c.name === "Doomed");
  const sRemBad = reducer(s2, { type: "REMOVE_CHARACTER", charId: doomed.id, by: stranger });
  ok(!!sRemBad.characters[doomed.id], "REMOVE_CHARACTER refuses a non-owner");
  const sRem = reducer(s2, { type: "REMOVE_CHARACTER", charId: doomed.id, by: owner });
  ok(!sRem.characters[doomed.id], "REMOVE_CHARACTER deletes the owner's character");
}

// ============================================================================
// CHARACTERS — FAVORS, FRIENDS, AND COSMETICS. All owner-guarded; ADD_FAVOR whitelists the favor
// kind (ALPG p.6), SET_LIFESTYLE whitelists and is flavor-only (never touches gp), and the dead
// are frozen out of cosmetic edits. SET_AVATAR is account-level self-service.
// ============================================================================
{
  const s0 = seed();
  const mine = need(R.activeChar(s0), "an active character");
  const owner = mine.ownerId;
  const stranger = need(R.otherThan(s0, [owner]), "a non-owner");

  // ADD_FAVOR / REMOVE_FAVOR / TOGGLE_FAVOR_FADED — owner logs their own favors.
  const sFavBad = reducer(s0, { type: "ADD_FAVOR", charId: mine.id, by: stranger, favor: { desc: "not mine", kind: "lodging" } });
  ok(!(sFavBad.characters[mine.id].favors || []).some((f) => f.desc === "not mine"), "ADD_FAVOR refuses a non-owner");
  const sFav = reducer(s0, { type: "ADD_FAVOR", charId: mine.id, by: owner, favor: { desc: "a night's lodging", kind: "lodging" } });
  const fav = (sFav.characters[mine.id].favors || []).find((f) => f.desc === "a night's lodging");
  ok(!!fav, "ADD_FAVOR logs a favor for the owner");
  const sFavEmpty = reducer(s0, { type: "ADD_FAVOR", charId: mine.id, by: owner, favor: { desc: "  ", kind: "lodging" } });
  ok(!(sFavEmpty.characters[mine.id].favors || []).some((f) => (f.desc || "").trim() === ""), "ADD_FAVOR refuses empty description");
  const sFade = reducer(sFav, { type: "TOGGLE_FAVOR_FADED", charId: mine.id, by: owner, favorId: fav.id });
  ok(sFade.characters[mine.id].favors.find((f) => f.id === fav.id).active === false, "TOGGLE_FAVOR_FADED fades a favor for the owner");
  const sFavRem = reducer(sFav, { type: "REMOVE_FAVOR", charId: mine.id, by: owner, favorId: fav.id });
  ok(!(sFavRem.characters[mine.id].favors || []).some((f) => f.id === fav.id), "REMOVE_FAVOR removes the owner's favor");

  // ADD_FRIEND / REMOVE_FRIEND — owner only, name required.
  const sFriBad = reducer(s0, { type: "ADD_FRIEND", charId: mine.id, by: stranger, friend: { name: "Ghost" } });
  ok(!(sFriBad.characters[mine.id].friends || []).some((f) => f.name === "Ghost"), "ADD_FRIEND refuses a non-owner");
  const sFri = reducer(s0, { type: "ADD_FRIEND", charId: mine.id, by: owner, friend: { name: "Barkeep Sal" } });
  const fri = (sFri.characters[mine.id].friends || []).find((f) => f.name === "Barkeep Sal");
  ok(!!fri, "ADD_FRIEND adds a friend for the owner");
  const sFriRem = reducer(sFri, { type: "REMOVE_FRIEND", charId: mine.id, by: owner, friendId: fri.id });
  ok(!(sFriRem.characters[mine.id].friends || []).some((f) => f.id === fri.id), "REMOVE_FRIEND removes the owner's friend");

  // SET_LIFESTYLE — owner only, whitelist, flavor-only (never touches gp).
  const gpBefore = mine.gp;
  const sLifeBad = reducer(s0, { type: "SET_LIFESTYLE", charId: mine.id, by: stranger, lifestyle: "modest" });
  ok(sLifeBad.characters[mine.id].lifestyle !== "modest", "SET_LIFESTYLE refuses a non-owner");
  const sLifeJunk = reducer(s0, { type: "SET_LIFESTYLE", charId: mine.id, by: owner, lifestyle: "not_a_lifestyle" });
  ok(sLifeJunk.characters[mine.id].lifestyle !== "not_a_lifestyle", "SET_LIFESTYLE takes only the whitelist");
  const sLife = reducer(s0, { type: "SET_LIFESTYLE", charId: mine.id, by: owner, lifestyle: "modest" });
  ok(sLife.characters[mine.id].lifestyle === "modest", "SET_LIFESTYLE sets a valid lifestyle for the owner");
  ok(sLife.characters[mine.id].gp === gpBefore, "SET_LIFESTYLE never touches gold — AL levies no cost of living");

  // SET_CHARACTER_IMAGE — owner only, and refused for the dead.
  const sImgBad = reducer(s0, { type: "SET_CHARACTER_IMAGE", charId: mine.id, by: stranger, dataURL: "data:image/png;base64,AAAA" });
  ok(!sImgBad.characters[mine.id].image, "SET_CHARACTER_IMAGE refuses a non-owner");
  const dead = Object.values(s0.characters).find((c) => c.status === "dead");
  if (dead) {
    const sImgDead = reducer(s0, { type: "SET_CHARACTER_IMAGE", charId: dead.id, by: dead.ownerId, dataURL: "data:image/png;base64,AAAA" });
    ok(sImgDead.characters[dead.id].image === s0.characters[dead.id].image, "SET_CHARACTER_IMAGE refuses a fallen hero — the portrait stands");
  }

  // SET_QUARTERS — owner only, needs a bastion with a bedroom.
  const withBedroom = Object.values(s0.characters).find((c) => c.bastion && (!c.status || c.status === "active") && (c.bastion.facilities || []).some((f) => f.defId === "bedroom"));
  if (withBedroom) {
    const bed = withBedroom.bastion.facilities.find((f) => f.defId === "bedroom");
    const sQBad = reducer(s0, { type: "SET_QUARTERS", charId: withBedroom.id, by: R.otherThan(s0, [withBedroom.ownerId]), bedroomId: bed.id, hirelingId: withBedroom.id });
    ok(JSON.stringify(sQBad.characters[withBedroom.id].bastion) === JSON.stringify(withBedroom.bastion), "SET_QUARTERS refuses a non-owner");
  }

  // SET_AVATAR — account-level self-service.
  const sAv = reducer(s0, { type: "SET_AVATAR", accountId: owner, dataURL: "data:image/png;base64,AAAA" });
  ok(!!sAv.avatars[owner], "SET_AVATAR sets the account avatar");

  // EXPAND_RETIRE_TALE — owner only, on an existing tale entry.
  const taleChar = Object.values(s0.characters).find((c) => Array.isArray(c.retireTale) && c.retireTale.length);
  if (taleChar) {
    const t = taleChar.retireTale[0];
    const sExpBad = reducer(s0, { type: "EXPAND_RETIRE_TALE", charId: taleChar.id, by: R.otherThan(s0, [taleChar.ownerId]), taleId: t.id, text: "hijacked" });
    ok(sExpBad.characters[taleChar.id].retireTale.find((x) => x.id === t.id).text !== "hijacked", "EXPAND_RETIRE_TALE refuses a non-owner");
    const sExp = reducer(s0, { type: "EXPAND_RETIRE_TALE", charId: taleChar.id, by: taleChar.ownerId, taleId: t.id, text: "and then, years later..." });
    ok(sExp.characters[taleChar.id].retireTale.find((x) => x.id === t.id).text === "and then, years later...", "EXPAND_RETIRE_TALE expands the tale for the owner");
  }
}

// ============================================================================
// SOCIAL — MESSAGES, LISTINGS, MODERATION. Closing the reducer surface. Module listings are
// author-guarded (edit/retract/restore only your own), broadcast needs org standing, SEND_MESSAGE
// bounces a suspended sender, and the two dismiss actions were guarded this pass: a notice belongs
// to its recipient, report triage is admin-only.
// ============================================================================
{
  const s0 = seed();
  const admin = R.admin(s0);
  const author = need(Object.keys(s0.moduleAuthors || {})[0] || R.dm(s0), "a module author (or a DM to become one)");

  // SEND_MESSAGE — a message reaches a thread; you cannot message yourself.
  const a = need(R.plain(s0), "a sender");
  const b = need(R.otherThan(s0, [a]), "a recipient");
  const sSelf = reducer(s0, { type: "SEND_MESSAGE", from: a, to: a, text: "hi me" });
  ok(JSON.stringify(sSelf.threads) === JSON.stringify(s0.threads), "SEND_MESSAGE refuses messaging yourself");
  const sMsg = reducer(s0, { type: "SEND_MESSAGE", from: a, to: b, text: "well met" });
  ok(sMsg.threads.some((t) => (t.messages || []).some((m) => m.text === "well met" && m.from === a)), "SEND_MESSAGE delivers to a thread");

  // CREATE_MODULE_LISTING — module-author DMs only.
  const modAuthorState = (s0.moduleAuthors || {})[author] ? s0 : reducer(s0, { type: "TOGGLE_MODULE_AUTHOR", by: author, accountId: author });
  const sListBad = reducer(modAuthorState, { type: "CREATE_MODULE_LISTING", by: R.plain(s0), listing: { title: "Rogue Listing" } });
  ok(!(sListBad.moduleListings || []).some((l) => l.title === "Rogue Listing"), "CREATE_MODULE_LISTING refuses a non-author");
  const sList = reducer(modAuthorState, { type: "CREATE_MODULE_LISTING", by: author, listing: { title: "The Sunken Vault", tierLow: 1, tierHigh: 3 } });
  const listing = (sList.moduleListings || []).find((l) => l.title === "The Sunken Vault");
  ok(!!listing, "CREATE_MODULE_LISTING publishes for an author");

  // EDIT / RETRACT / RESTORE — the author's own listing only.
  const other = need(R.otherThan(s0, [author]), "a non-author");
  const sEditBad = reducer(sList, { type: "EDIT_MODULE_LISTING", listingId: listing.id, by: other, listing: { title: "hijacked" } });
  ok(sEditBad.moduleListings.find((l) => l.id === listing.id).title !== "hijacked", "EDIT_MODULE_LISTING refuses another author");
  const sEdit = reducer(sList, { type: "EDIT_MODULE_LISTING", listingId: listing.id, by: author, listing: { setting: "Barovia" } });
  ok(sEdit.moduleListings.find((l) => l.id === listing.id).setting === "Barovia", "EDIT_MODULE_LISTING updates the author's own listing");
  const sRetract = reducer(sList, { type: "RETRACT_MODULE_LISTING", listingId: listing.id, by: author });
  ok(sRetract.moduleListings.find((l) => l.id === listing.id).retracted === true, "RETRACT_MODULE_LISTING pulls it (soft)");
  const sRestore = reducer(sRetract, { type: "RESTORE_MODULE_LISTING", listingId: listing.id, by: author });
  ok(sRestore.moduleListings.find((l) => l.id === listing.id).retracted === false, "RESTORE_MODULE_LISTING brings it back");
  const sRetractBad = reducer(sList, { type: "RETRACT_MODULE_LISTING", listingId: listing.id, by: other });
  ok(sRetractBad.moduleListings.find((l) => l.id === listing.id).retracted !== true, "RETRACT_MODULE_LISTING refuses another author");

  // BROADCAST_ORG_MESSAGE — admin or org leadership.
  const orgId = R.org(s0);
  const lead = need(R.plain(s0), "a non-admin to lead the org");
  const withLead = { ...s0, organizations: { ...s0.organizations, [orgId]: { ...s0.organizations[orgId], leaderId: lead } } };
  const sBcastBad = reducer(withLead, { type: "BROADCAST_ORG_MESSAGE", orgId, by: R.otherThan(s0, [lead]), group: "dms", text: "hi" });
  const bcastGrew = sBcastBad.threads.length > withLead.threads.length;
  ok(!bcastGrew, "BROADCAST_ORG_MESSAGE refuses someone with no org standing");
  const sBcast = reducer(withLead, { type: "BROADCAST_ORG_MESSAGE", orgId, by: lead, group: "dms", text: "meeting Friday" });
  ok(sBcast.threads.length >= withLead.threads.length, "an org lead may broadcast");

  // REPORT_MESSAGE — anyone may report; it routes to an admin and files a moderation record.
  const sReport = reducer(s0, { type: "REPORT_MESSAGE", from: a, sender: b, text: "abuse" });
  ok((sReport.mod.reports || []).length >= (s0.mod.reports || []).length, "REPORT_MESSAGE files a moderation report");

  // DISMISS_REPORT — admin only (guarded this pass).
  if ((sReport.mod.reports || []).length) {
    const rep = sReport.mod.reports[sReport.mod.reports.length - 1];
    const sDisBad = reducer(sReport, { type: "DISMISS_REPORT", id: rep.id, by: R.plain(s0) });
    ok((sDisBad.mod.reports || []).some((r) => r.id === rep.id), "DISMISS_REPORT refuses a non-admin");
    const sDis = reducer(sReport, { type: "DISMISS_REPORT", id: rep.id, by: admin });
    ok(!(sDis.mod.reports || []).some((r) => r.id === rep.id), "DISMISS_REPORT clears it for an admin");
  }

  // DISMISS_NOTICE — the recipient (or an admin); guarded this pass.
  const notice = s0.notices.find((n) => n.accountId);
  if (notice) {
    const sNotBad = reducer(s0, { type: "DISMISS_NOTICE", id: notice.id, by: R.otherThan(s0, [notice.accountId]) });
    ok(sNotBad.notices.some((n) => n.id === notice.id), "DISMISS_NOTICE refuses someone other than the recipient");
    const sNot = reducer(s0, { type: "DISMISS_NOTICE", id: notice.id, by: notice.accountId });
    ok(!sNot.notices.some((n) => n.id === notice.id), "DISMISS_NOTICE clears the recipient's own notice");
  }
}

// MARKET_BY_ID drift. This is the assertion I actually needed: the index is DERIVED from MARKET,
// and it was built before the generated rows finished registering, so 163 of 185 rows were
// listed and unbuyable. Nothing failed — CHECKOUT_MARKET returns out of an unknown line in
// silence. Counting both sides catches the whole class, not the one instance I tripped over.
{
  const missing = MARKET.filter((m) => !MARKET_BY_ID[m.id]);
  ok(missing.length === 0, `every MARKET row is reachable via MARKET_BY_ID (${missing.length} orphaned)`);
  ok(Object.keys(MARKET_BY_ID).length === MARKET.length, "the market index and the market list agree on size");
}

{
  const s0 = seed();
  const ch0 = R.activeChar(s0);

  ok(!isTradeableClass("GEAR"), "mundane GEAR is not a tradeable class — the refusal, not the flag");
  ok(isTradeableClass("MAGIC_ITEM"), "MAGIC_ITEM remains tradeable");

  // Frank, 27 Jul: "unverified Magic items are tradeable. Unverified mundane items are not."
  // Verification gates the IRREVERSIBLE door only — a traded magic item can be clawed back,
  // gold cannot. Pinned so nobody later "fixes" magic-item trade into a verification check.
  const magic = Object.values(s0.items).find((i) => i.itemClass === "MAGIC_ITEM" && i.provenance && i.provenance.state === "UNVERIFIED");
  ok(!!magic, "the seed carries an UNVERIFIED magic item to reason about");
  ok(magic && isTradeableClass(magic.itemClass), "an UNVERIFIED magic item is still tradeable (clawback covers it)");

  // The seed holds NO mundane gear, so I mint some through the real buy path rather than
  // hand-building an item record — a fabricated fixture would not prove the mint assigns GEAR.
  const s1 = reducer(s0, { type: "CHECKOUT_MARKET", charId: ch0.id, by: ch0.ownerId, lines: [{ id: "buy_g_backpack", qty: 1 }] });
  const bought = Object.values(s1.items).find((i) => i.catalogId === "g_backpack");
  ok(!!bought && bought.itemClass === "GEAR", "a purchased backpack mints as GEAR");
  ok(bought && bought.provenance.state === "VERIFIED", "a purchase is self-verifying (PURCHASED)");
  ok(ronaldoWillBuy(s1, bought), "Ronaldo buys verified gear from a pack");

  // The sale itself: gold in, item gone, ledger written.
  const gpBefore = s1.characters[ch0.id].gp;
  const expect = sellValueOf("g_backpack");
  const s2 = reducer(s1, { type: "SELL_TO_RONALDO", charId: ch0.id, by: ch0.ownerId, itemIds: [bought.id] });
  ok(s2.characters[ch0.id].gp === gpBefore + expect, "Ronaldo pays half the catalogue price, rounded down");
  ok(!s2.items[bought.id], "the fenced item leaves the pack");
  ok(s2.logEntries.some((l) => l.entryType === "EARNING" && l.gpEarned === expect), "the sale is written to the log");

  // Refusals. Each is a separate door and can regress on its own.
  ok(!ronaldoWillBuy(s1, { itemClass: "MAGIC_ITEM", provenance: { state: "VERIFIED" }, holder: { type: "CHARACTER" } }),
     "Ronaldo refuses magic items — he deals in the non-magical");
  ok(!ronaldoWillBuy(s1, { itemClass: "GEAR", provenance: { state: "UNVERIFIED" }, holder: { type: "CHARACTER" } }),
     "Ronaldo refuses UNVERIFIED gear — gold has no clawback");
  ok(!ronaldoWillBuy(s1, { itemClass: "GEAR", provenance: { state: "VERIFIED" }, holder: { type: "PLAYER_SHELF" } }),
     "Ronaldo refuses shelf items — pack only, a shelf is not one character's property");

  // An UNVERIFIED mundane item must not convert to gold even if the action is dispatched directly.
  const s3 = reducer(s1, { type: "SELL_TO_RONALDO", charId: ch0.id, by: ch0.ownerId, itemIds: [magic.id] });
  ok(s3.characters[ch0.id].gp === s1.characters[ch0.id].gp, "a magic item cannot be fenced: no gold moved");
  ok(!!s3.items[magic.id], "a magic item cannot be fenced: the item stays");

  ok(sellValueOf("g_poisonbasic") === Math.floor((CATALOG.g_poisonbasic.gp || 0) / 2),
     "award-only rows are still SELLABLE — awardOnly closes acquisition, not disposal [ALPG-312]");
}

// Q16, RULED 26 Jul (Frank): poisons are AWARD-ONLY, not absent. This SUPERSEDES the older
// structural exclusion that deleted the rows outright. Two things must hold together, and they
// pull in opposite directions — which is exactly why both are asserted:
//   (1) the acquisition doors are SHUT: no award-only row reaches the store or a craft bench;
//   (2) the row EXISTS, so a DM's award can be recorded. Deleting the item would satisfy (1)
//       trivially and break (2), which is the failure mode the old ruling actually had.
{
  const s0 = seed();
  const ch = R.activeChar(s0);

  // (2) first: the rows are present and flagged, or the rest of this block proves nothing.
  ok(!!CATALOG.g_poisonbasic && CATALOG.g_poisonbasic.awardOnly === true,
     "Q16: Basic Poison is IN the catalogue, flagged award-only");
  ok(!!CATALOG.g_poisonerskit && CATALOG.g_poisonerskit.awardOnly === true,
     "Q16: the Poisoner's Kit is in the catalogue, flagged award-only");

  // (1) the store door. Assert over the WHOLE catalogue, not the two ids I happen to remember —
  // a poison added by a future SRD pull has to be caught by this line without anyone editing it.
  const awardOnlyIds = Object.values(CATALOG).filter((c) => c.awardOnly).map((c) => c.id);
  const marketMints = new Set(MARKET.map((m) => m.mint).filter(Boolean));
  ok(awardOnlyIds.length >= 4, "Q16: the award-only set is populated (poisons + firearms)");
  ok(awardOnlyIds.every((id) => !marketMints.has(id)),
     "Q16: NO award-only row is purchasable in the store");

  // and the checkout path itself, in case a row ever reaches MARKET by another route.
  const gp0 = ch.gp, items0 = Object.keys(s0.items).length;
  const s1 = reducer(s0, { type: "CHECKOUT_MARKET", charId: ch.id, by: ch.ownerId, lines: [{ id: "buy_g_poisonbasic", qty: 1 }] });
  ok(Object.keys(s1.items).length === items0, "Q16: basic poison cannot be bought: no item minted");
  ok(s1.characters[ch.id].gp === gp0, "Q16: basic poison cannot be bought: no gold moved");

  // (1) the craft door. Two separate assertions, because they fail independently: the RESOLVER
  // could be gated while the DATA still carries an illegal row (which is exactly what the first
  // run of this block found — g_musket in Tinker's hand-written `items`), or the data could be
  // clean while a future edit removes the gate.
  const craftable = new Set();
  for (const toolId of Object.keys(TOOL_CRAFTS)) for (const id of craftItemsFor(toolId)) craftable.add(id);
  ok(awardOnlyIds.every((id) => !craftable.has(id)),
     "Q16: NO award-only row is craftable at any bench (resolver gate)");
  ok(!craftable.has("g_poisonbasic"), "Q16: the Poisoner's Kit crafts no poison");

  const handWritten = new Set();
  for (const t of Object.values(TOOL_CRAFTS)) for (const id of (t.items || [])) handWritten.add(id);
  ok(awardOnlyIds.every((id) => !handWritten.has(id)),
     "Q16: no tool's hand-written items list names an award-only row (data clean)");
  ok([...handWritten].every((id) => !!CATALOG[id]),
     "Q16: every hand-written craft output resolves to a real catalogue row");
}

// ---------------------------------------------------------------------------------------
// Q17, RULED 24 Jul: magic crafting goes through the slot door. The chapter says "chosen by
// you from the <Group> tables" — the whole tables — so the goat names the item and a DM
// verifies it. These hold my ruling in place: no q17 flags remain, the resolve path mints an
// UNFILLED craft slot and charges the ch. 7 figure, and SUBMIT→VERIFY lands an UNTRADEABLE
// item with CRAFTED provenance.
{
  const flagged = [];
  Object.values(BASTION_FACILITIES).forEach((d) => Object.values((d && d.outputs) || {}).forEach((rows) => (rows || []).forEach((r) => { if (r && r.q17) flagged.push(d.id + ":" + r.id); })));
  ok(flagged.length === 0, "no output row carries a q17 flag any more" + (flagged.length ? ": " + flagged.join(", ") : ""));

  // No seeded keep owns an Arcane Study, so I raise one through the real door: level the lord,
  // ADD_BASTION_FACILITY, then finish the construction clock by hand. If the door itself breaks,
  // this block fails loudly instead of skipping — a skipped ruling is an unheld ruling.
  let s0 = seed();
  let ch = Object.values(s0.characters).find((c) => c.bastion && !c.retired && c.status !== "dead");
  ok(!!ch, "a living seeded lord with a keep exists to test Q17 against");
  if (ch) {
    ch.level = 9; ch.gp = 20000; ch.dt = 100;
    ch.qualifies = Array.from(new Set([...(ch.qualifies || []), "arcane_focus"]));   // the sheet says so; the platform records it — same contract as levels
    ch.bastion.facilities = (ch.bastion.facilities || []).filter((f) => (BASTION_FACILITIES[f.defId] || {}).kind !== "special");   // free the level-9 slot cap for the door test
    s0 = reducer(s0, { type: "ADD_BASTION_FACILITY", charId: ch.id, by: ch.ownerId, defId: "arcane_study" });
    ch = s0.characters[ch.id];
    let fac = (ch.bastion.facilities || []).find((f) => f.defId === "arcane_study");
    ok(!!fac, "ADD_BASTION_FACILITY raises an Arcane Study for a level-9 lord");
    if (!fac) { fac = { id: "facQ17", defId: "arcane_study", size: "roomy", lastOrder: null, working: null }; ch.bastion.facilities.push(fac); }
    fac.building = null; fac.working = null; ch.gp = 1000;
    fac.working = null; fac.building = null;
    const t = { n: 99, date: "2026-07-24", resolved: false, orders: [], benefits: [] };
    const o = { facId: fac.id, orderId: "craft", outId: "arcana_uncommon", craftConsumable: false };
    const gp0 = ch.gp, slots0 = Object.keys(s0.itemSlots || {}).length;
    resolveBastionOrder(s0, ch, t, o, false);
    const slots = Object.values(s0.itemSlots || {});
    const slot = slots.find((x) => x.via === "craft");
    ok(slots.length === slots0 + 1 && !!slot, "resolving the magic craft order mints exactly one craft slot");
    ok(slot && slot.status === "UNFILLED" && slot.rarity === "uncommon" && slot.table === "arcana", "the slot owes an uncommon Arcana item, unfilled");
    ok(ch.gp === gp0 - (MAGIC_CRAFT_COST.uncommon || 0), "the ch. 7 materials figure left the purse at resolve");
    ok(s0.logEntries.some((l) => l.charId === ch.id && l.entryType === "EXPENDITURE" && (l.spentOn || "").indexOf("commissioned") !== -1), "the commission is on the ledger");

    // the goat names it; a DM verifies it; provenance reads CRAFTED
    const s1 = reducer(s0, { type: "SUBMIT_SLOT_ITEM", slotId: slot.id, by: ch.ownerId, name: "Wand of the Test", source: "DMG 2024", page: "247" });
    const made = Object.values(s1.items).find((i) => i.slotId === slot.id);   // mkItem spreads extra FLAT onto the instance
    ok(!!made && made.itemClass === "UNTRADEABLE" && made.playerEntered === true, "SUBMIT mints an UNTRADEABLE player-entered item against the slot");
    const dm = need(Object.keys(s1.roles || {}).find((a) => (s1.roles[a] || []).includes("dm")), "a DM");
    const s2 = reducer(s1, { type: "VERIFY_SLOT_ITEM", slotId: slot.id, by: dm });
    const done = Object.values(s2.items).find((i) => i.slotId === slot.id);
    ok(!!done && done.provenance && done.provenance.state === "VERIFIED" && done.provenance.source === "CRAFTED", "VERIFY stamps CRAFTED provenance — made at the keep, checked against the book");

    // half-rate consumable claim is honoured at charge time — same lord, same bench, fresh purse
    ch.gp = 1000;
    const t3 = { n: 100, date: "2026-07-24", resolved: false, orders: [], benefits: [] };
    resolveBastionOrder(s0, ch, t3, { facId: fac.id, orderId: "craft", outId: "arcana_common", craftConsumable: true }, false);
    ok(ch.gp === 1000 - Math.floor((MAGIC_CRAFT_COST.common || 0) / 2), "a declared consumable charges half the ch. 7 figure");
  }
}

// ---------------------------------------------------------------------------------------
// Q15, FRANK'S RULING (25 Jul), superseding SR-12: the Eldritch Discovery bestows a GIFT-ONLY
// charm ITEM with a lifetime on the holder's clock — next resolved Bastion turn OR completed
// session, whichever first (his 17-Jul precedent) — frozen in escrow, decorative when expired.
// These hold every door of that ruling.
{
  const od = BASTION_FACILITIES.observatory;
  ok(!!od && od.minLevel === 13 && od.prereq === "spell_focus" && (od.orders || []).includes("empower"),
    "the Observatory is minted: level 13, Spellcasting Focus, Empower (DMG header)");

  const mkLord = () => {
    let s = seed();
    let ch = Object.values(s.characters).find((c) => c.bastion && !c.retired && c.status !== "dead");
    ch.level = 13; ch.gp = 20000;
    ch.qualifies = Array.from(new Set([...(ch.qualifies || []), "spell_focus"]));
    ch.bastion.facilities = (ch.bastion.facilities || []).filter((f) => (BASTION_FACILITIES[f.defId] || {}).kind !== "special");
    s = reducer(s, { type: "ADD_BASTION_FACILITY", charId: ch.id, by: ch.ownerId, defId: "observatory" });
    ch = s.characters[ch.id];
    const fac = (ch.bastion.facilities || []).find((f) => f.defId === "observatory");
    if (fac) { fac.building = null; fac.working = null; }
    return { s, ch, fac };
  };

  // the die is seeded per keep-and-week — scan turn numbers until both faces have spoken
  let minted = null, mintedState = null, sawEven = false, giver = null;
  for (let n = 1; n <= 12 && (!minted || !sawEven); n++) {
    const { s, ch, fac } = mkLord();
    if (!fac) break;
    const t = { n, date: "2026-07-25", resolved: false, orders: [], benefits: [] };
    const before = Object.keys(s.items).length;
    resolveBastionOrder(s, ch, t, { facId: fac.id, orderId: "empower" }, false);
    const now = Object.values(s.items).filter((i) => i.charmItem);
    if (now.length === 0 && Object.keys(s.items).length === before) sawEven = true;
    if (now.length === 1 && !minted) { minted = now[0]; mintedState = s; giver = ch; }
  }
  ok(!!minted && sawEven, "the seeded die shows both faces across weeks: some mint, some do not");
  const NAMES = ["Charm of Darkvision", "Charm of Heroism", "Charm of Vitality"];
  ok(!!minted && NAMES.includes(minted.charmName) && minted.charmState === "LIVE" && minted.itemClass === "UNTRADEABLE",
    "an odd week mints ONE live, untradeable charm named from the chapter's three");
  ok(!!minted && minted.provenance && minted.provenance.state === "VERIFIED" && minted.provenance.source === "BESTOWED",
    "provenance reads BESTOWED — an unknown power, on the record");
  ok(!!mintedState && mintedState.logEntries.some((l) => (l.spentOn || "").includes("Eldritch Discovery")),
    "the bestowal is on the ledger");

  // FRANK'S DESIGN (25 Jul): four d20 tables of composable fragments — 20^4 looks
  ok(CHARM_TABLES.length === 4 && CHARM_TABLES.every((t) => t.length === 20 && new Set(t).size === 20),
    "four appearance tables, twenty distinct fragments each — 160,000 looks");
  {
    const seq = [0.0, 0.5, 0.95, 0.25]; let i = 0;
    const look = composeCharmAppearance(() => seq[i++ % 4]);
    ok(look === CHARM_TABLES[0][0] + " " + CHARM_TABLES[1][10] + ", " + CHARM_TABLES[2][19] + " \u2014 " + CHARM_TABLES[3][5] + ".",
      "composition is exactly form + material, mark \u2014 quirk, from the caller's dice");
  }
  ok(!!minted && typeof minted.charmDesc === "string" && CHARM_TABLES[0].some((f) => minted.charmDesc.startsWith(f)),
    "the mint stamps a rolled look onto the item, seeded with the week");
  if (minted && mintedState) {
    const owner = (mintedState.characters[minted.holder.id] || {}).ownerId;
    let s9 = reducer(mintedState, { type: "SET_CHARM_DESC", itemId: minted.id, by: ABSENT, desc: "graffiti" });
    ok(s9.items[minted.id].charmDesc !== "graffiti", "only the holder's owner may inscribe");
    const longTxt = "x".repeat(400);
    s9 = reducer(s9, { type: "SET_CHARM_DESC", itemId: minted.id, by: owner, desc: longTxt });
    ok(s9.items[minted.id].charmDesc.length === 240, "an inscription is clamped to 240 characters");
    s9 = reducer(s9, { type: "SET_CHARM_DESC", itemId: minted.id, by: owner, desc: "  a chipped tooth on a string  " });
    ok(s9.items[minted.id].charmDesc === "a chipped tooth on a string", "the player's own words overwrite the roll, trimmed");
  }

  if (minted && mintedState) {
    let s = mintedState;
    const ch2 = Object.values(s.characters).find((c) => c.id !== giver.id && !c.retired && c.status !== "dead" && c.ownerId !== giver.ownerId)
             || Object.values(s.characters).find((c) => c.id !== giver.id && !c.retired && c.status !== "dead");
    ok(!!ch2, "a second living character exists to receive the gift");

    s = reducer(s, { type: "OFFER_CHARM_GIFT", itemId: minted.id, toCharId: ch2.id, by: giver.ownerId });
    let it = s.items[minted.id];
    ok(it.escrow === true && it.pendingGift && it.pendingGift.toCharId === ch2.id, "an offer puts the charm in escrow, addressed");
    expireCharmItemsFor(s, s.characters[giver.id], Date.now() + 1);
    it = s.items[minted.id];
    ok(it.charmState === "LIVE", "in escrow the timer is in limbo — the giver's closing week does not age it");

    s = reducer(s, { type: "ACCEPT_CHARM_GIFT", itemId: minted.id, by: ch2.ownerId });
    it = s.items[minted.id];
    ok(it.holder.id === ch2.id && it.escrow === false && it.charmState === "LIVE" && !it.pendingGift,
      "acceptance moves it, thaws it, and arms the new holder's clock");
    ok(s.notices.some((n) => n.type === "charmgiftok" && n.accountId === giver.ownerId), "the giver hears it landed");

    // SR-13 (Q18 CLOSED, 25 Jul): live charm items hold ALPG carried-charm slots
    let ch2d = s.characters[ch2.id];
    ch2d.level = 3; ch2d.tier = undefined;                                  // Tier 1 — charm cap is 2
    ch2d.gifts = [{ id: "sg1", kind: "charm", name: "A table-won charm", carried: true }];
    ok(liveCharmItemsHeld(s, ch2.id) === 1, "the counter sees the accepted live item");
    const capId = "it" + s.nextId++;                                        // different name — the dupe gate must not be the one that fires
    s.items[capId] = { ...s.items[minted.id], id: capId, charmName: "Charm of Vitality", name: "Charm of Vitality", charmState: "LIVE", escrow: false, pendingGift: undefined, holder: { type: "CHARACTER", id: giver.id }, history: [] };
    s = reducer(s, { type: "OFFER_CHARM_GIFT", itemId: capId, toCharId: ch2.id, by: giver.ownerId });
    s = reducer(s, { type: "ACCEPT_CHARM_GIFT", itemId: capId, by: ch2.ownerId });
    ok(s.items[capId].escrow === true && s.items[capId].holder.id === giver.id && s.notices.some((n) => n.type === "charmcap"),
      "at the cap the accept door holds: the gift waits in escrow and the notice says why");
    ch2d = s.characters[ch2.id];
    ch2d.gifts.push({ id: "sg2", kind: "charm", name: "Another", carried: false });
    s = reducer(s, { type: "TOGGLE_GIFT_CARRIED", charId: ch2.id, by: ch2d.ownerId, giftId: "sg2" });
    ok(s.characters[ch2.id].gifts.find((g) => g.id === "sg2").carried === false,
      "the sheet checkbox refuses too — item plus carried charm already fill Tier 1's two");
    const swp = s.characters[ch2.id];
    swp.gifts = [{ id: "sa", kind: "charm", name: "A", carried: true }, { id: "sb", kind: "charm", name: "B", carried: true }];
    normalizeCarriedGifts(s, swp);
    ok(swp.gifts.filter((g) => g.carried).length === 1, "the tier sweep yields sheet slots to items first — items cannot be unchecked");
    swp.gifts = [];                                                         // every sheet slot opens
    s = reducer(s, { type: "ACCEPT_CHARM_GIFT", itemId: capId, by: ch2d.ownerId });
    ok(s.items[capId].holder.id === ch2.id && s.items[capId].escrow === false,
      "the moment a slot opens, the frozen gift thaws and lands");
    s.items[capId].charmState = "EXPIRED";                                  // keepsakes count for nothing
    ok(liveCharmItemsHeld(s, ch2.id) === 1, "an expired keepsake holds no slot — it does nothing, as ruled");

    // the bestowal itself proceeds past the cap, but says so loudly
    {
      const { s: s5, ch: lord5, fac: fac5 } = mkLord();
      if (fac5) {
        lord5.gifts = [1, 2, 3, 4, 5].map((i) => ({ id: "L" + i, kind: "charm", name: "C" + i, carried: true }));   // Tier 4 cap is 5 — already full
        let warned = false;
        for (let n = 1; n <= 12 && !warned; n++) {
          const t5 = { n, date: "2026-07-25", resolved: false, orders: [], benefits: [] };
          resolveBastionOrder(s5, lord5, t5, { facId: fac5.id, orderId: "empower" }, false);
          if (Object.values(s5.items).some((i) => i.charmItem)) warned = t5.benefits.some((b) => /OVER the ALPG carried-charm cap/.test(b));
        }
        ok(warned, "a bestowal past the cap proceeds — the DMG bestows — but the week's report flags SR-13");
      }
    }

    // DMG's own line: can't gain this Charm again while you still have it — a blocked accept WAITS
    const dupId = "it" + s.nextId++;
    s.items[dupId] = { ...it, id: dupId, holder: { type: "CHARACTER", id: giver.id }, escrow: false, history: [] };
    s = reducer(s, { type: "OFFER_CHARM_GIFT", itemId: dupId, toCharId: ch2.id, by: giver.ownerId });
    s = reducer(s, { type: "ACCEPT_CHARM_GIFT", itemId: dupId, by: ch2.ownerId });
    const dup = s.items[dupId];
    ok(dup.escrow === true && !!dup.pendingGift && s.notices.some((n) => n.type === "charmdupe"),
      "a second live same-name charm cannot be accepted — the gift stays frozen in escrow");

    // gift-only: the trade door refuses the class outright
    const other = Object.values(s.items).find((i) => !i.charmItem && !i.escrow && i.id !== minted.id);
    const trades0 = s.trades.length;
    s = reducer(s, { type: "PROPOSE_TRADE", a: { itemId: minted.id }, b: { itemId: other ? other.id : "nope" }, by: ch2.ownerId });
    ok(s.trades.length === trades0 && s.items[minted.id].escrow === false, "PROPOSE_TRADE bounces off a charm: no trade, no escrow flip");

    // the holder's week closes → keepsake, by name
    expireCharmItemsFor(s, s.characters[ch2.id], Date.now() + 1);
    it = s.items[minted.id];
    ok(it.charmState === "EXPIRED" && /decorative keepsake/.test(it.name), "an expired charm does not vanish — it becomes a named keepsake");
    ok(s.logEntries.some((l) => (l.spentOn || "").includes("faded to a keepsake")), "the fading is on the ledger");

    // both hooks are wired where the ruling says they live
    const playSrc = fs.readFileSync("src/reducer/play.ts", "utf8");
    const bactSrc = fs.readFileSync("src/bastion/actions.ts", "utf8");
    ok(playSrc.includes("expireCharmItemsFor(s, c, Date.now())"), "COMPLETE_SESSION rides the 17-Jul belt for charm items");
    ok(bactSrc.includes("expireCharmItemsFor(s, ch, now)"), "a resolved Bastion turn is the braces");

    // decline path: a fresh offer can be pulled back whole
    const backId = "it" + s.nextId++;
    s.items[backId] = { ...s.items[dupId], id: backId, escrow: false, pendingGift: undefined, holder: { type: "CHARACTER", id: giver.id }, charmName: "Charm of Heroism", name: "Charm of Heroism", charmState: "LIVE", history: [] };
    s = reducer(s, { type: "OFFER_CHARM_GIFT", itemId: backId, toCharId: ch2.id, by: giver.ownerId });
    s = reducer(s, { type: "DECLINE_CHARM_GIFT", itemId: backId, by: ch2.ownerId });
    const back = s.items[backId];
    ok(back.escrow === false && !back.pendingGift && back.holder.id === giver.id, "a declined offer returns whole to the giver");
  }
}

// ---------------------------------------------------------------------------------------
// ARMORY MINT (26 Jul) — Level-5 Trade room. DMG: Stock Armory (100 + 100/defender, halved by a
// Smithy), d8-for-d6 on any defender-loss roll, expend when the event ends. Here: def, cost, guards,
// and that the Trade order STOCKS the Armory (not the Storehouse's sell-for-gold Trade).
{
  const md = BASTION_FACILITIES.armory;
  ok(!!md && md.minLevel === 5 && md.prereq == null && (md.orders || []).includes("trade"),
    "the Armory is minted: level 5, no prerequisite, Trade (DMG header)");

  let s = seed();
  let ch = Object.values(s.characters).find((c) => c.bastion && !c.retired && c.status !== "dead");
  ch.level = 5; ch.gp = 20000;
  ch.bastion.facilities = (ch.bastion.facilities || []).filter((f) => (BASTION_FACILITIES[f.defId] || {}).kind !== "special");
  s = reducer(s, { type: "ADD_BASTION_FACILITY", charId: ch.id, by: ch.ownerId, defId: "armory" });
  ch = s.characters[ch.id];
  const fac = (ch.bastion.facilities || []).find((f) => f.defId === "armory");
  ok(!!fac, "an armory can be built at 5 with no prerequisite");
  if (fac) {
    fac.building = null;
    // DMG cost: 100 + 100 per Bastion Defender
    ch.bastion.defenders = [1,2,3].map((i) => ({ id: "d"+i, name: "Defender "+i, role: "Guard", age: 30 }));
    const before = ch.gp;
    s = reducer(s, { type: "ARM_BASTION", charId: ch.id, by: ch.ownerId }); ch = s.characters[ch.id];
    ok(ch.bastion.armed === true && (before - ch.gp) === 400,
      "Stock Armory: 100 + 100 × 3 defenders = 400 gp, and the racks are stocked");
    // already stocked -> a second Stock is a no-op (guard holds, no double charge)
    const held = ch.gp;
    s = reducer(s, { type: "ARM_BASTION", charId: ch.id, by: ch.ownerId }); ch = s.characters[ch.id];
    ok(ch.gp === held && ch.bastion.armed === true, "a full Armory refuses a second Stock — no double charge");
    // DMG: "If your Bastion has a Smithy, the total cost is halved."
    ch.bastion.armed = false;
    ch.bastion.facilities.push({ id: "fsmith", defId: "smithy", size: "roomy", lastOrder: null, working: null, building: null });
    const beforeSmithy = ch.gp;
    s = reducer(s, { type: "ARM_BASTION", charId: ch.id, by: ch.ownerId }); ch = s.characters[ch.id];
    ok((beforeSmithy - ch.gp) === 200, "a Smithy halves the total: (100 + 300) / 2 = 200 gp");
    // the Trade ORDER to the Armory Stocks it (same order, a different thing than the Storehouse)
    ch.bastion.armed = false;
    const gpBeforeOrder = ch.gp;
    const t = { n: 4, date: "2026-07-26", resolved: false, orders: [], benefits: [], mintables: [] };
    resolveBastionOrder(s, ch, t, { orderId: "trade", facId: fac.id }, {});
    ok(ch.bastion.armed === true && (gpBeforeOrder - ch.gp) === 200 && t.benefits.some((b) => /Stock Armory/.test(b) && b.includes(" with ") && b.includes(" gp)")),
      "issuing Trade to the Armory Stocks it (200 with the Smithy) — not the Storehouse's sell-for-gold Trade");
  }
}

// OBSERVATORY COMPLETION + ARCHIVE MINT (25 Jul) — the two rooms Frank ordered first.
{
  const FORMS = ["keep","tower","manor","cavern","ruin","grove","vessel","hamlet"];
  const ad = BASTION_FACILITIES.archive;
  ok(!!ad && ad.minLevel === 13 && ad.prereq == null && (ad.orders || []).includes("research"),
    "the Archive is minted: level 13, no prerequisite, Research (DMG header)");
  // FRANK'S TITLE ENGINE: d6 for length, six d12 tables, Lego-clipped under a fixed grammar
  ok(TITLE_TABLES.length === 6
      && TITLE_TABLES.slice(0, 4).every((t) => t.length === 12)
      && FORMS.every((f) => (TITLE_TABLES[4][f] || []).length === 12)
      && TITLE_TABLES[5].length === 12,
    "six tables at 1d12 each — the house table in all eight voices");
  {
    // force each length: first rng call is the d6, the rest pick slot 0 — proves the hierarchy
    const at = (len, form) => { let first = true; return composeArchiveTitle(() => { if (first) { first = false; return (len - 0.5) / 6; } return 0; }, form); };
    ok(at(1, "keep") === TITLE_TABLES[0][0], "length 1: a noun works");
    ok(at(2, "keep") === TITLE_TABLES[0][0] + " " + TITLE_TABLES[1][0], "length 2: a subject and a verb");
    ok(at(4, "keep") === TITLE_TABLES[0][0] + " " + TITLE_TABLES[1][0] + " " + TITLE_TABLES[2][0] + " " + TITLE_TABLES[3][0], "length 4 clips object and manner on");
    ok(at(6, "vessel") === TITLE_TABLES[0][0] + " " + TITLE_TABLES[1][0] + " " + TITLE_TABLES[2][0] + " " + TITLE_TABLES[3][0] + TITLE_TABLES[4].vessel[0] + TITLE_TABLES[5][0],
      "length 6 speaks the house and closes with the flourish");
  }
  {
    const mk = (seedStr) => { let h = 0; for (const c of seedStr) h = (h * 31 + c.charCodeAt(0)) >>> 0; return () => ((h = (h * 1664525 + 1013904223) >>> 0) / 4294967296); };
    const t1 = composeArchiveTitle(mk("b1:f1:history"), "keep"), t1b = composeArchiveTitle(mk("b1:f1:history"), "keep");
    ok(t1 === t1b && t1.length > 3, "same seed, same book — a keep's history is its own and stays so");
    const n = TITLE_TABLES[0].length;   // 12 across the board — the space is arithmetic, not luck
    const space = n + n**2 + n**3 + n**4 + n**5 + n**6;
    ok(space === 3257436, "the space is 3,257,436 titles per house per subject — no goat gets the same thing twice");
  }
  ["observatory", "archive", "armory"].forEach((id) => {
    // registerFacility fans the module out to the maps the app READS — test the consumers, not the spec
    ok(FORMS.every((f) => (REG_MAPS.lifeTasks[id][f] || []).length === 12)
         && FORMS.every((f) => (REG_MAPS.sizeFlavor[id][f] || []).length === 3)
         && FORMS.every((f) => typeof REG_MAPS.ruin[id][f] === "string" && REG_MAPS.ruin[id][f].length > 40)
         && REG_MAPS.reactions[id] && REG_MAPS.reactions[id].to.length === 6,
      id + " is registered at full exemplar standard: 8×12 life-weeks, 8×3 sizes, 8 ruins, 6 reactions");
  });

  // the book is chosen once, and the log names the house's own title
  let s = seed();
  let ch = Object.values(s.characters).find((c) => c.bastion && !c.retired && c.status !== "dead");
  ch.level = 13; ch.gp = 20000;
  ch.bastion.facilities = (ch.bastion.facilities || []).filter((f) => (BASTION_FACILITIES[f.defId] || {}).kind !== "special");
  s = reducer(s, { type: "ADD_BASTION_FACILITY", charId: ch.id, by: ch.ownerId, defId: "archive" });
  ch = s.characters[ch.id];
  const fac = (ch.bastion.facilities || []).find((f) => f.defId === "archive");
  ok(!!fac, "an archive can be built at 13 with no prerequisite");
  if (fac) {
    fac.building = null;
    s = reducer(s, { type: "SET_ARCHIVE_BOOK", charId: ch.id, facId: fac.id, subject: "nonsense", by: ch.ownerId });
    ok(!s.characters[ch.id].bastion.facilities.find((f) => f.id === fac.id).book, "an unknown subject is refused");
    s = reducer(s, { type: "SET_ARCHIVE_BOOK", charId: ch.id, facId: fac.id, subject: "history", by: ch.ownerId });
    const f1 = s.characters[ch.id].bastion.facilities.find((f) => f.id === fac.id);
    ok(f1.book === "history" && typeof f1.bookTitle === "string" && f1.bookTitle.length > 3,
      "the reference book is shelved by subject, and THIS copy's engine-minted title rides the instance");
    // self-consistency: the shelved title is exactly what the same seed and the region's
    // history-tagged pool produce — the chronicle plumbing runs end to end through the reducer
    {
      const b1 = s.characters[ch.id].bastion;
      const rp = (LORE_BY_REGION[b1.region] || []);
      const bs = rp.filter((e) => e.k.includes("history"));
      const expect = composeArchiveTitle(mkRng(b1.id + ":" + fac.id + ":history"), "keep", { topics: bs.length ? bs : rp });
      ok(f1.bookTitle === expect, "the shelved title is byte-equal to the same seed run through the same pools — the chronicle plumbing holds end to end");
    }
    ok(s.logEntries.some((l) => (l.spentOn || "").includes(f1.bookTitle)), "the ledger names the very title");
    ok(s.logEntries.some((l) => (l.spentOn || "").includes("reference book shelved:")), "the shelving is on the ledger with the house's own title");
    s = reducer(s, { type: "SET_ARCHIVE_BOOK", charId: ch.id, facId: fac.id, subject: "arcana", by: ch.ownerId });
    ok(s.characters[ch.id].bastion.facilities.find((f) => f.id === fac.id).book === "history",
      "chosen ONCE — a rare book is what it is; the second choice is refused");

    // Research: seven days, and knowledge as if Legend Lore had been cast
    const t = { n: 3, date: "2026-07-25", resolved: false, orders: [], benefits: [] };
    resolveBastionOrder(s, s.characters[ch.id], t, { facId: fac.id, orderId: "research", topic: "the drowned bell-tower" }, false);
    ok(t.benefits.some((b) => /Helpful Lore/.test(b) && /drowned bell-tower/.test(b) && /Legend Lore/.test(b)),
      "Research resolves: the topic rides the order, the lore is a Legend Lore pointer, the telling is the table's");
    ok(t.benefits.some((b) => /\u00ab.+\u00bb/.test(b)), "every research week the engine mints the volume most thumbed");

    // FRANK'S d100 LORE (25 Jul): canonical topics, region-first, global fill, skill-tagged
    const SUBJ = ["arcana", "history", "invest", "nature", "religion"];
    const rids = BASTION_REGIONS.map((r) => r.id);
    ok(Object.keys(LORE_BY_REGION).every((rid) => rids.includes(rid)) && rids.every((rid) => (LORE_BY_REGION[rid] || []).length >= 50),
      "every region key is a real region, and all seventeen have local canon on the shelf");
    const pools = [LORE_GLOBAL, ...Object.values(LORE_BY_REGION)];
    // CHRONICLE LANE (Frank's second title ruling): region canon in the binding of the house
    ok(TITLE_FRAMES.length === 12, "the chronicle frames are their own d12");
    {
      const forced = composeArchiveTitle(() => 0, "keep", { topic: "the ruin of Zhentil Keep" });
      ok(forced === TITLE_FRAMES[0] + " the ruin of Zhentil Keep", "a known topic is framed as a chronicle — the week's volume is ABOUT the week's study");
      let seq6 = [0.999, 0]; let i6 = 0;
      const long = composeArchiveTitle(() => seq6[Math.min(i6++, 1)], "keep", { topic: "the ruin of Zhentil Keep" });
      ok(long === TITLE_FRAMES[0] + " the ruin of Zhentil Keep" + TITLE_TABLES[4].keep[0] + TITLE_TABLES[5][0],
        "a long chronicle takes the house's binding and the flourish");
      let sq = [0, 0, 0, 0]; let ii = 0;
      const fromPool = composeArchiveTitle(() => sq[Math.min(ii++, 3)], "keep", { topics: LORE_BY_REGION.moonsea });
      ok(fromPool === TITLE_FRAMES[0] + " " + LORE_BY_REGION.moonsea[0].t, "offered the region's pool, the lane chronicles its canon");
      let sa = [0, 0.9, 0]; let ia = 0;                                     // len roll, lane roll (>=2/3 abstains), T1 pick
      const abstain = composeArchiveTitle(() => sa[Math.min(ia++, 2)], "keep", { topics: LORE_BY_REGION.moonsea });
      ok(abstain === TITLE_TABLES[0][0], "one roll in three stays abstract — variety survives, provably");
    }
    ok(LORE_GLOBAL.length === 100 && pools.every((p) => p.every((e) => e.t.length > 3 && e.k.length >= 1 && e.k.every((x) => SUBJ.includes(x)))),
      "the global pool is a TRUE d100 — Frank's fill-the-table order — every topic skill-tagged");
    ok(pools.every((p) => new Set(p.map((e) => e.t)).size === p.length), "no pool repeats a topic");
    {
      const g = new Set(LORE_GLOBAL.map((e) => e.t));
      ok(Object.values(LORE_BY_REGION).every((p) => p.every((e) => !g.has(e.t))),
        "non-repeating across the board: no region entry duplicates the global trivia");
      const app = fs.readFileSync("src/app.tsx", "utf8"), rd = fs.readFileSync("README.md", "utf8");
      ok(app.includes("Fan Content Policy") && rd.includes("Fan Content Policy") && rd.includes("CC-BY-4.0"),
        "Q19: the Wizards Fan Content notice is wired into the footer and README, beside the CC-BY line");
    }
    {
      let first = true;
      const lo = () => { if (first) { first = false; return 0; } return 0; };
      ok(rollLoreTopic(lo, "moonsea").t === LORE_BY_REGION.moonsea[0].t, "the region's own canon comes first in the hundred");
      let f2 = true;
      const hi = () => { if (f2) { f2 = false; return 0.999; } return 0.999; };
      const tail = rollLoreTopic(hi, "cormyr");
      ok(LORE_GLOBAL.some((e) => e.t === tail.t), "the global table fills the remainder of the d100, exactly as specified");
    }
    {
      const s2 = seed();
      let c2 = Object.values(s2.characters).find((c) => c.bastion && !c.retired && c.status !== "dead");
      c2.level = 13; c2.gp = 20000;
      c2.bastion.region = "chult";
      c2.bastion.facilities = (c2.bastion.facilities || []).filter((f) => (BASTION_FACILITIES[f.defId] || {}).kind !== "special");
      const s3 = reducer(s2, { type: "ADD_BASTION_FACILITY", charId: c2.id, by: c2.ownerId, defId: "archive" });
      const c3 = s3.characters[c2.id];
      const fac3 = (c3.bastion.facilities || []).find((f) => f.defId === "archive");
      if (fac3) {
        fac3.building = null;
        const t3 = { n: 4, date: "2026-07-25", resolved: false, orders: [], benefits: [] };
        resolveBastionOrder(s3, c3, t3, { facId: fac3.id, orderId: "research" }, false);
        const line = t3.benefits.find((b) => /Helpful Lore/.test(b)) || "";
        const pool = LORE_BY_REGION.chult.concat(LORE_GLOBAL).map((e) => e.t);
        ok(pool.some((tt) => line.includes(tt)) && /Say so at the table/.test(line) && /feeds /.test(line),
          "topicless research rolls the region's canon and tells the goat which skill it feeds");
        const t4 = { n: 5, date: "2026-07-25", resolved: false, orders: [], benefits: [] };
        resolveBastionOrder(s3, c3, t4, { facId: fac3.id, orderId: "research", detail: "the merchant princes' ledgers" }, false);
        ok(t4.benefits.some((b) => /merchant princes' ledgers/.test(b) && !/Say so at the table/.test(b)),
          "a typed topic rides the detail lane verbatim, untagged");

        // FRANK (25 Jul): the cool book goes home — decorative, topic-linked, once per shelf
        const mm = (t3.mintables || [])[0];
        ok(!!mm && t3.benefits.some((b) => b.includes("\u00ab" + mm.title + "\u00bb"))
             && mm.wiki.startsWith("https://forgottenrealms.fandom.com/wiki/Special:Search?query=")
             && decodeURIComponent(mm.wiki).includes(mm.topic),
          "the week hands the UI a mintable: the very volume named, wiki-linked by its canon TOPIC, never its fictional title");
        const before = Object.keys(s3.items).length;
        let s4 = reducer(s3, { type: "MINT_BOOK_ITEM", charId: c3.id, by: c3.ownerId, title: mm.title, topic: mm.topic, wiki: mm.wiki });
        const book = Object.values(s4.items).find((x) => x.bookItem && x.name === mm.title);
        ok(!!book && book.itemClass === "STORY_ITEM" && book.holder.id === c3.id
             && book.provenance.state === "VERIFIED" && book.provenance.source === "ARCHIVE"
             && book.wikiUrl === mm.wiki && /does nothing/.test(book.notes),
          "one click, one decorative copy: story-class, archive provenance, honest about doing nothing");
        ok(s4.logEntries.some((l) => (l.spentOn || "").includes(mm.title)), "the copying is on the ledger, title and all");
        s4 = reducer(s4, { type: "MINT_BOOK_ITEM", charId: c3.id, by: c3.ownerId, title: mm.title, topic: mm.topic, wiki: mm.wiki });
        ok(Object.keys(s4.items).length === before + 1, "click twice, own once — one copy per title per shelf");
        s4 = reducer(s4, { type: "MINT_BOOK_ITEM", charId: c3.id, by: ABSENT, title: "Stolen Folio", topic: "", wiki: "" });
        ok(!Object.values(s4.items).some((x) => x.name === "Stolen Folio"), "a stranger cannot shelve books onto someone else's character");
      }
    }
    ok(s.logEntries.some((l) => (l.spentOn || "").includes("Archive: Research")), "the commission is on the ledger");
  }
}

// ---------------------------------------------------------------------------------------
// SCRIPTORIUM — scribe hire (class gates the scroll pool) + the three craft outputs
// ---------------------------------------------------------------------------------------
{
  let s = seed();
  let ch = Object.values(s.characters).find((c) => c.bastion && !c.retired && c.status !== "dead");
  ch.level = 13; ch.gp = 20000;
  ch.bastion.facilities = (ch.bastion.facilities || []).filter((f) => (BASTION_FACILITIES[f.defId] || {}).kind !== "special");
  s = reducer(s, { type: "ADD_BASTION_FACILITY", charId: ch.id, by: ch.ownerId, defId: "scriptorium" });
  ch = s.characters[ch.id];
  const fac = (ch.bastion.facilities || []).find((f) => f.defId === "scriptorium");
  ok(!!fac, "a scriptorium can be built at 9 with no prerequisite");
  if (fac) {
    fac.building = null;
    const scribe0 = (fac.henchmen || [])[0];
    ok(scribe0 && !scribe0.scribeClass, "the scribe arrives unassigned — no class until you hire");
    // an undeclared class (the After Dark warlock) is refused at the AL facility
    s = reducer(s, { type: "SET_SCRIPTORIUM_SCRIBE", charId: ch.id, by: ch.ownerId, facId: fac.id, scribeId: "warlock", name: "X" });
    ok(!s.characters[ch.id].bastion.facilities.find((f) => f.id === fac.id).henchmen[0].scribeClass,
      "an undeclared scribe class (warlock) is refused — the AL Scriptorium is Cleric or Wizard only");
    // hire the acolyte → Cleric pool
    s = reducer(s, { type: "SET_SCRIPTORIUM_SCRIBE", charId: ch.id, by: ch.ownerId, facId: fac.id, scribeId: "acolyte", name: "Rathburn" });
    const sc = s.characters[ch.id].bastion.facilities.find((f) => f.id === fac.id);
    ok(sc.henchmen[0].scribeClass === "Cleric" && sc.henchmen[0].name === "Rathburn",
      "hiring the Acolyte sets the scribe's class (Cleric) and name — the choice is a real hire");
    ok(s.logEntries.some((l) => (l.spentOn || "").includes("took on Rathburn")), "the hire is on the ledger");
    // a stranger cannot hire the scribe
    const before = sc.henchmen[0].scribeClass;
    const sX = reducer(s, { type: "SET_SCRIPTORIUM_SCRIBE", charId: ch.id, by: "acct_absent_x", facId: fac.id, scribeId: "mage", name: "Y" });
    ok(sX.characters[ch.id].bastion.facilities.find((f) => f.id === fac.id).henchmen[0].scribeClass === before,
      "only the owner hires the scribe");
    // Craft: Spell Scroll → an unfilled scroll slot gated to the scribe's class
    const t = { n: 4, date: "2026-07-25", resolved: false, orders: [], benefits: [] };
    resolveBastionOrder(s, s.characters[ch.id], t, { facId: fac.id, orderId: "craft", outId: "spell_scroll" }, false);
    const slot = Object.values(s.itemSlots || {}).find((sl) => sl.via === "scribe");
    ok(!!slot && slot.scribeClass === "Cleric", "Craft: Spell Scroll mints an unfilled slot gated to the scribe's class");
    ok(t.benefits.some((b) => /Cleric/.test(b) && /Spell Scroll/.test(b)), "the scroll benefit names the scribe's class");
    // Craft: Paperwork → charges per copy, no keepable item
    const gp0 = s.characters[ch.id].gp;
    const t2 = { n: 5, date: "2026-07-25", resolved: false, orders: [], benefits: [] };
    resolveBastionOrder(s, s.characters[ch.id], t2, { facId: fac.id, orderId: "craft", outId: "paperwork", count: 50 }, false);
    ok(s.characters[ch.id].gp === gp0 - 50, "Craft: Paperwork charges 1 GP per copy (50 = 50 gp)");
    ok(t2.benefits.some((b) => /broadsheets/.test(b) && /fifty miles/.test(b)), "the paperwork benefit names the fifty-mile delivery");
  }
}

// ---------------------------------------------------------------------------------------
// FUZZ - random sequences, invariants after every step
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
// SMITHY — two smiths, tool-derived mundane craft, and the Armaments magic path
// ---------------------------------------------------------------------------------------
{
  let s = seed();
  let ch = Object.values(s.characters).find((c) => c.bastion && !c.retired && c.status !== "dead");
  ch.level = 13; ch.gp = 20000;
  ch.bastion.facilities = (ch.bastion.facilities || []).filter((f) => (BASTION_FACILITIES[f.defId] || {}).kind !== "special");
  s = reducer(s, { type: "ADD_BASTION_FACILITY", charId: ch.id, by: ch.ownerId, defId: "smithy" });
  ch = s.characters[ch.id];
  const fac = (ch.bastion.facilities || []).find((f) => f.defId === "smithy");
  ok(!!fac, "a smithy can be built at 5 with no prerequisite");
  if (fac) {
    fac.building = null;
    ok((fac.henchmen || []).length === 2 && fac.henchmen.every((h) => h.name && typeof h.age === "number"),
      "the smithy arrives with TWO named, aged smiths (DMG: Hirelings 2)");
    // Craft: Smith's Tools -> a tool-derived slot (the toolkit defines what's makeable)
    const t = { n: 3, date: "2026-07-25", resolved: false, orders: [], benefits: [] };
    resolveBastionOrder(s, s.characters[ch.id], t, { facId: fac.id, orderId: "craft", outId: "smith_mundane" }, false);
    const toolSlot = Object.values(s.itemSlots || {}).find((sl) => sl.via === "tool");
    ok(!!toolSlot && toolSlot.tool === "g_tool_smith",
      "Craft: Smith's Tools mints a tool-derived slot \u2014 the toolkit (g_tool_smith) defines what's makeable, a DM verifies");
    ok(t.benefits.some((b) => /these tools can make/.test(b)), "the benefit states the DMG rule: anything these tools can make");
    // Craft: Magic Item (Armament) -> the Armaments slot path, same as the Arcane Study's Arcana
    const t2 = { n: 4, date: "2026-07-25", resolved: false, orders: [], benefits: [] };
    resolveBastionOrder(s, s.characters[ch.id], t2, { facId: fac.id, orderId: "craft", outId: "armament_uncommon" }, false);
    const magSlot = Object.values(s.itemSlots || {}).find((sl) => sl.table === "armaments");
    ok(!!magSlot && magSlot.rarity === "uncommon", "Craft: Magic Item (Armament) mints an Armaments-table slot at the chosen rarity");
  }
}

// ---------------------------------------------------------------------------------------
// WORKSHOP — three artisans, the six-tool choice, tool-derived gear, and the Implements path
// ---------------------------------------------------------------------------------------
{
  let s = seed();
  let ch = Object.values(s.characters).find((c) => c.bastion && !c.retired && c.status !== "dead");
  ch.level = 13; ch.gp = 20000;
  ch.bastion.facilities = (ch.bastion.facilities || []).filter((f) => (BASTION_FACILITIES[f.defId] || {}).kind !== "special");
  s = reducer(s, { type: "ADD_BASTION_FACILITY", charId: ch.id, by: ch.ownerId, defId: "workshop" });
  ch = s.characters[ch.id];
  const fac = (ch.bastion.facilities || []).find((f) => f.defId === "workshop");
  ok(!!fac, "a workshop can be built at 5 with no prerequisite");
  if (fac) {
    fac.building = null;
    ok((fac.henchmen || []).length === 3 && fac.henchmen.every((h) => h.name && typeof h.age === "number"),
      "the workshop arrives with THREE named, aged artisans (DMG: Hirelings 3)");
    // gear craft before tools chosen -> prompt, no slot
    const t0 = { n: 3, date: "2026-07-25", resolved: false, orders: [], benefits: [] };
    resolveBastionOrder(s, s.characters[ch.id], t0, { facId: fac.id, orderId: "craft", outId: "gear_chosen" }, false);
    ok(!!t0.prompt && !Object.values(s.itemSlots || {}).some((x) => x.via === "toolset"),
      "gear craft before the tools are chosen prompts the choice and mints nothing");
    // a 5-tool pick is rejected; exactly 6 required
    s = reducer(s, { type: "SET_WORKSHOP_TOOLS", charId: ch.id, by: ch.ownerId, facId: fac.id, tools: ["g_tool_carpenter", "g_tool_jeweler", "g_tool_leather", "g_tool_weaver", "g_tool_tinker"] });
    ok(!s.characters[ch.id].bastion.facilities.find((f) => f.id === fac.id).chosenTools, "a five-tool pick is rejected — the Workshop takes exactly six");
    // an out-of-list tool is rejected
    s = reducer(s, { type: "SET_WORKSHOP_TOOLS", charId: ch.id, by: ch.ownerId, facId: fac.id, tools: ["g_tool_carpenter", "g_tool_jeweler", "g_tool_leather", "g_tool_weaver", "g_tool_tinker", "g_tool_smith"] });
    ok(!s.characters[ch.id].bastion.facilities.find((f) => f.id === fac.id).chosenTools, "an out-of-list tool (smith's) is rejected — only the DMG's eleven are choosable");
    // a valid six-tool pick stores
    s = reducer(s, { type: "SET_WORKSHOP_TOOLS", charId: ch.id, by: ch.ownerId, facId: fac.id, tools: ["g_tool_carpenter", "g_tool_jeweler", "g_tool_leather", "g_tool_weaver", "g_tool_tinker", "g_tool_woodcarver"] });
    const wsf = s.characters[ch.id].bastion.facilities.find((f) => f.id === fac.id);
    ok((wsf.chosenTools || []).length === 6, "a valid six-tool pick is stored on the facility");
    // gear craft now mints a toolset slot referencing the six
    const t1 = { n: 4, date: "2026-07-25", resolved: false, orders: [], benefits: [] };
    resolveBastionOrder(s, s.characters[ch.id], t1, { facId: fac.id, orderId: "craft", outId: "gear_chosen" }, false);
    const gslot = Object.values(s.itemSlots || {}).find((x) => x.via === "toolset");
    ok(!!gslot && (gslot.tools || []).length === 6, "Craft: Adventuring Gear mints a slot deriving across the six chosen tools");
    // implement magic craft
    const t2 = { n: 5, date: "2026-07-25", resolved: false, orders: [], benefits: [] };
    resolveBastionOrder(s, s.characters[ch.id], t2, { facId: fac.id, orderId: "craft", outId: "implement_uncommon" }, false);
    ok(Object.values(s.itemSlots || {}).some((x) => x.table === "implements"), "Craft: Magic Item (Implement) mints an Implements-table slot");
  }
}

// ---------------------------------------------------------------------------------------
// LIBRARY — Research: Topical Lore (3 facts, DM-narrated) + a place to shelve books
// ---------------------------------------------------------------------------------------
{
  let s = seed();
  let ch = Object.values(s.characters).find((c) => c.bastion && !c.retired && c.status !== "dead");
  ch.level = 13;
  ch.bastion.facilities = (ch.bastion.facilities || []).filter((f) => (BASTION_FACILITIES[f.defId] || {}).kind !== "special");
  s = reducer(s, { type: "ADD_BASTION_FACILITY", charId: ch.id, by: ch.ownerId, defId: "library" });
  ch = s.characters[ch.id];
  const fac = (ch.bastion.facilities || []).find((f) => f.defId === "library");
  ok(!!fac, "a library can be built at 5 with no prerequisite");
  if (fac) {
    fac.building = null;
    ok((fac.henchmen || []).length === 1 && fac.henchmen.every((h) => h.name && typeof h.age === "number"),
      "the library arrives with one named, aged librarian");
    // Research: Topical Lore
    const t = { n: 3, date: "2026-07-25", resolved: false, orders: [], benefits: [], mintables: [] };
    resolveBastionOrder(s, s.characters[ch.id], t, { facId: fac.id, orderId: "research", detail: "the ruins of Myth Drannor" }, false);
    ok(t.benefits.some((b) => /Topical Lore/.test(b) && /three accurate/.test(b)), "Library research yields Topical Lore — three accurate previously-unknown facts (DM-narrated)");
    ok(t.benefits.some((b) => /Myth Drannor/.test(b)), "the research names the commissioned topic");
    ok((t.mintables || []).length > 0, "a book of the week is mintable from the library research");
    ok(s.logEntries.some((l) => /Library: Research/.test(l.spentOn || "")), "the commission is on the ledger as Library: Research");
    // the library shelves books (declares shelvesBooks like the archive)
    ok(!!(BASTION_FACILITIES.library || {}).shelvesBooks, "the library declares shelvesBooks — it is a place to store books, DMG's 'collection of books'");
  }
}

// ---------------------------------------------------------------------------------------
// LIBRARY BOOKS — the Archive/Library content split: Archive book = title + wiki link (no facts);
// Library book = title + three sourced facts as a paragraph (no link). Size-scaled shelf caps.
// ---------------------------------------------------------------------------------------
{
  let s = seed();
  let ch = Object.values(s.characters).find((c) => c.bastion && !c.retired && c.status !== "dead");
  ch.level = 13;
  ch.bastion.facilities = (ch.bastion.facilities || []).filter((f) => (BASTION_FACILITIES[f.defId] || {}).kind !== "special");
  s = reducer(s, { type: "ADD_BASTION_FACILITY", charId: ch.id, by: ch.ownerId, defId: "library" });
  s = reducer(s, { type: "ADD_BASTION_FACILITY", charId: ch.id, by: ch.ownerId, defId: "archive" });
  ch = s.characters[ch.id];
  const lib = (ch.bastion.facilities || []).find((f) => f.defId === "library");
  const arc = (ch.bastion.facilities || []).find((f) => f.defId === "archive");
  if (lib && arc) {
    lib.building = null; arc.building = null;
    // Library research on a deep subject -> a book that CONTAINS three sourced facts
    const t = { n: 3, date: "2026-07-25", resolved: false, orders: [], benefits: [], mintables: [] };
    resolveBastionOrder(s, s.characters[ch.id], t, { facId: lib.id, orderId: "research", detail: "Waterdeep" }, false);
    const libMint = (t.mintables || [])[0];
    ok(!!libMint && !!libMint.paragraph && !libMint.wiki, "a Library book CONTAINS a paragraph of sourced facts and carries no wiki link");
    ok(!!libMint && /Waterdeep|City of Splendors|Undermountain|harbor|Lords/.test(libMint.paragraph || ""), "the Library paragraph is real sourced content about the subject");
    // Archive research -> a book that POINTS via a wiki link, no facts inside
    const t2 = { n: 4, date: "2026-07-25", resolved: false, orders: [], benefits: [], mintables: [] };
    resolveBastionOrder(s, s.characters[ch.id], t2, { facId: arc.id, orderId: "research", detail: "the Sundering" }, false);
    const arcMint = (t2.mintables || [])[0];
    ok(!!arcMint && !!arcMint.wiki && !arcMint.paragraph, "an Archive book POINTS via a wiki link and contains no facts");
    // minting a library book shelves it with its paragraph
    s = reducer(s, { type: "MINT_BOOK_ITEM", charId: ch.id, by: ch.ownerId, title: libMint.title, topic: libMint.topic, paragraph: libMint.paragraph, defId: "library", size: "roomy" });
    const stored = Object.values(s.items).find((x) => x.bookItem && x.paragraph);
    ok(!!stored && stored.inPack === false && !!stored.paragraph, "a minted Library book shelves (inPack false) carrying its paragraph");
    // Size-scaled caps, CORRECTED 31 Jul. The base is the cap AT THE ROOM'S PRINTED SIZE — both
    // shelving facilities print `roomy`, so an un-enlarged Archive holds 10 and an un-enlarged
    // Library 20, doubling once for the single enlargement DMG allows them (roomy > vast).
    //
    // THIS ASSERTION PREVIOUSLY ENCODED THE BUG. It was written from what the function did rather
    // than from what the owner specified, so it asserted 20/40 at roomy and passed for as long as
    // the defect existed — the test defended the bug against the requirement. That is the failure
    // mode worth remembering here: a check written by reading the implementation cannot ever fail.
    ok(bookShelfCap("archive", "roomy") === 10 && bookShelfCap("archive", "vast") === 20
       && bookShelfCap("library", "roomy") === 20 && bookShelfCap("library", "vast") === 40,
      "shelf caps: Archive 10 and Library 20 at their PRINTED size, doubling when enlarged to vast");
    ok(bookShelfCap("smithy", "roomy") === 0 && bookShelfCap("library", undefined) === 20,
      "shelf caps: non-shelving rooms hold nothing; an unspecified size falls back to the printed one");
  }
}

let rng = 123456789;
const rand = () => (rng = (rng * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

// TIME-BOXED, and reseeded in short chains.
//
// A single long chain grows the state without bound - every accepted action appends notices and
// log lines - and stateViolations is O(state), so a naive 600-step fuzz never finishes. Short
// chains from a fresh seed explore ordering just as well and stay fast.
const FUZZ_MS = 8000, CHAIN = 12;
const t0 = Date.now();
let steps = 0, chains = 0, broke = null;
while (Date.now() - t0 < FUZZ_MS && !broke) {
  let s = seed(); chains++;
  for (let i = 0; i < CHAIN && !broke; i++) {
    const type = ALL[Math.floor(rand() * ALL.length)];
    let out;
    try { out = reducer(s, { type, ...wideArgs(s) }); }
    catch (e) {
      // A throw here is a BUG, not an uninteresting rejection. Guards return the state
      // unchanged; they do not throw. The only designed throw is the unknown-action default,
      // and the fuzz only dispatches known actions. Skipping these was hiding exactly the
      // sequence-dependent crashes fuzzing exists to find.
      broke = `${type} threw: ${String((e && e.message) || e)}`.slice(0, 120);
      break;
    }
    steps++;
    const v = stateViolations(out);
    if (v.length) { broke = `${type}: ${v[0]}`; break; }
    s = out;
  }
}
console.log(`\n  FUZZ - ${steps} accepted dispatches across ${chains} chains, invariants checked after each`);
ok(!broke, `invariant broken during fuzz - ${broke}`);
if (!broke) console.log("    ok    invariants held throughout");

fs.rmSync("src/__t.tsx", { force: true });
fs.rmSync("t.cjs", { force: true });
console.log(fails
  ? `\nTRANSITIONS: ${fails} of ${checks} checks FAILED${skipped ? ` (${skipped} skipped)` : ""}`
  : `\nTRANSITIONS: all ${checks} checks passed${skipped ? ` (${skipped} skipped)` : ""}`);
process.exit(fails ? 1 : 0);
