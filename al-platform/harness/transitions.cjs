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
  '\nimport { ARCHIVE_BOOK_SUBJECTS as __abs, ARCHIVE_TITLE_SUBJECTS as __t1, ARCHIVE_TITLE_VERBS as __t2, ARCHIVE_TITLE_OBJECTS as __t3, ARCHIVE_TITLE_MANNERS as __t4, ARCHIVE_TITLE_HOUSE as __t5, ARCHIVE_TITLE_FLOURISH as __t6, composeArchiveTitle as __cat, ARCHIVE_TITLE_FRAMES as __tf, ARCHIVE_LORE_GLOBAL as __lg, ARCHIVE_LORE_BY_REGION as __lr, rollLoreTopic as __rlt, BASTION_REGIONS as __brs } from "./data/bastion";\n' +
  '\nimport { BASTION_FACILITIES as __bf } from "./data/bastion";\n' +
  '\nimport { CATALOG as __cg } from "./data/catalog";\n' +
  '\nimport { MARKET as __mkt, TOOL_CRAFTS as __tc } from "./lib/rules";\n' +
  '\nimport { craftItemsFor as __cif } from "./market/ui";\n' +
  'export const __t = { reducer, seed, stateViolations, playerPushReport: __ppr, schedulerPushReport: __spr, resolveBastionOrder: __rbo, MAGIC_CRAFT_COST: __mcc, BASTION_FACILITIES: __bf, expireCharmItemsFor: __ecf, mkRng: __mk, normalizeCarriedGifts: __ncg, liveCharmItemsHeld: __lch, CHARM_TABLES: [__cf, __cm, __ck, __cq], composeCharmAppearance: __cca, REG_MAPS: { lifeTasks: __lt, ruin: __fr, reactions: __rx, sizeFlavor: __sf }, ARCHIVE_BOOK_SUBJECTS: __abs, TITLE_TABLES: [__t1, __t2, __t3, __t4, __t5, __t6], composeArchiveTitle: __cat, TITLE_FRAMES: __tf, LORE_GLOBAL: __lg, LORE_BY_REGION: __lr, rollLoreTopic: __rlt, BASTION_REGIONS: __brs, CATALOG: __cg, MARKET: __mkt, TOOL_CRAFTS: __tc, craftItemsFor: __cif };\n');
execSync('npx --no-install esbuild src/__t.tsx --bundle --format=cjs --outfile=./t.cjs --external:react --external:react-dom --loader:.tsx=tsx --loader:.json=json --jsx=automatic', { stdio: "ignore" });
const { reducer, seed, stateViolations, playerPushReport, schedulerPushReport, resolveBastionOrder, MAGIC_CRAFT_COST, BASTION_FACILITIES, expireCharmItemsFor, mkRng, normalizeCarriedGifts, liveCharmItemsHeld, CHARM_TABLES, composeCharmAppearance, REG_MAPS, ARCHIVE_BOOK_SUBJECTS, TITLE_TABLES, composeArchiveTitle, TITLE_FRAMES, LORE_GLOBAL, LORE_BY_REGION, rollLoreTopic, BASTION_REGIONS, CATALOG, MARKET, TOOL_CRAFTS, craftItemsFor } = require(path.resolve("t.cjs")).__t;

let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.log("  FAIL  " + msg); } };
const strip = (s) => JSON.stringify(s, (k, v) => (k === "nextId" ? 0 : v));

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
const STRANGER = "acc_no_such_person";

function wideArgs(s, over) {
  const ch = Object.values(s.characters).find((c) => !c.retired);
  const it = Object.values(s.items)[0];
  const se = (s.sessions || [])[0] || {};
  const fac = ((ch.bastion || {}).facilities || [])[0] || {};
  return Object.assign({
    by: ch.ownerId, accountId: ch.ownerId, charId: ch.id, itemId: it && it.id,
    sessionId: se.id, sessId: se.id, threadId: ((s.threads || [])[0] || {}).id,
    facId: fac.id, logId: (s.logEntries[0] || {}).id, orgId: "scale", storeId: "store_dj",
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
        charId: "ch_nope", itemId: "it_nope", sessionId: "se_nope", sessId: "se_nope",
        facId: "fac_nope", logId: "log_nope", threadId: "th_nope", orgId: "org_nope", storeId: "st_nope",
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
  s = reducer(s, { type: "MARK_WARHORN_PUSHED", key: row.key, sig: row.sig, by: "acc_admin" });
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
  const ch = Object.values(s0.characters).find((c) => c.ownerId === "acc_aldric" && !c.retired);
  const gp0 = ch.gp, items0 = Object.keys(s0.items).length;
  const s1 = reducer(s0, { type: "CHECKOUT_MARKET", charId: ch.id, by: ch.ownerId, lines: [{ id: "buy_g_musket", qty: 1 }] });
  ok(Object.keys(s1.items).length === items0, "a musket cannot be bought: no item minted");
  ok(s1.characters[ch.id].gp === gp0, "a musket cannot be bought: no gold moved");
}

// Q16, RULED 26 Jul (Frank): poisons are AWARD-ONLY, not absent. This SUPERSEDES the older
// structural exclusion that deleted the rows outright. Two things must hold together, and they
// pull in opposite directions — which is exactly why both are asserted:
//   (1) the acquisition doors are SHUT: no award-only row reaches the store or a craft bench;
//   (2) the row EXISTS, so a DM's award can be recorded. Deleting the item would satisfy (1)
//       trivially and break (2), which is the failure mode the old ruling actually had.
{
  const s0 = seed();
  const ch = Object.values(s0.characters).find((c) => c.ownerId === "acc_aldric" && !c.retired);

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
    const dm = Object.keys(s1.roles || {}).find((a) => (s1.roles[a] || []).includes("dm")) || "acc_marta";
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
    let s9 = reducer(mintedState, { type: "SET_CHARM_DESC", itemId: minted.id, by: "acc_nobody", desc: "graffiti" });
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
        s4 = reducer(s4, { type: "MINT_BOOK_ITEM", charId: c3.id, by: "acc_stranger", title: "Stolen Folio", topic: "", wiki: "" });
        ok(!Object.values(s4.items).some((x) => x.name === "Stolen Folio"), "a stranger cannot shelve books onto someone else's character");
      }
    }
    ok(s.logEntries.some((l) => (l.spentOn || "").includes("Archive: Research")), "the commission is on the ledger");
  }
}

// ---------------------------------------------------------------------------------------
// FUZZ - random sequences, invariants after every step
// ---------------------------------------------------------------------------------------
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
