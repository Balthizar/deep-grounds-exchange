// THE RENDER GATE — self-discovering.
//
// Why this exists: until 27 Jul the check ran `tsc -b`, four logic suites, and `vite build`, and
// NONE of them proved a component actually runs. A build proves the bundle links. tsc proves the
// types agree. Neither catches a null dereference on first paint. On the day this file was
// written it immediately found one that had been live for weeks: every dropdown doing
// `RARITY[c.rarity].label` over the whole CATALOG threw on the first mundane row, because
// generated gear carries no rarity field. A DM opening the award-item picker took the app down.
//
// WHY IT DISCOVERS RATHER THAN LISTS (Frank, 27 Jul: "should be dynamically growing with the
// project"): a hand-maintained list of components rots exactly the way ITEM_ACTION_NAMES would
// rot without check_actions.cjs. The first version of this file named two components, passed,
// and printed "all components mounted" while covering 2 of 108 — which is worse than no gate,
// because it reads as coverage. So the roster is READ FROM SOURCE on every run. A component
// added tomorrow is covered tomorrow, by nobody's diligence.
//
// Two traps, kept because they cost real time:
//   1. TWO COPIES OF REACT. Requiring "react-dom/server" plainly resolves whatever npm-global
//      copy is on the path while the bundle carries its own. The symptom is a baffling
//      "Cannot read properties of null (reading 'useState')" that looks like a bug in the
//      component and is not. Both requires below are path.resolve'd into LOCAL node_modules.
//   2. A MODAL IS NOT ITS PANELS. Rendering a container exercises the container. Anything that
//      only mounts on a click is NOT covered by rendering its parent. Discovery sidesteps this
//      entirely: every exported component is mounted directly, whatever hides it in the UI.
//
// This is a SMOKE test by design: does it mount without throwing, against real seed() state.
// A smoke test that runs on every commit beats a thorough one nobody writes.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
process.chdir(root);

// ---- DISCOVERY -------------------------------------------------------------------
// Exported functions whose names start uppercase, read from source.
//
// LINE COMMENTS ONLY — do NOT also strip /* */ here. check_actions.cjs strips both, and copying
// that was a bug: src/lib/ui.tsx contains `accept="image/*"`, and the `/*` inside that STRING
// opens a fake block comment which the non-greedy match then runs 699 lines to close, swallowing
// 21 component definitions. The gate printed "all 87 components mounted" — a confident green over
// a roster missing a fifth of the app, which is the exact failure this file was written to stop.
// Stripping line comments is enough: the risk being guarded against is a comment that CONTAINS
// something matching the scan, and `^export function X(` at column zero inside a // line is not
// a thing that happens. Correctly lexing TSX is not worth it for a discovery pass.
const stripLineComments = (s) => s.replace(/^[ \t]*\/\/.*$/gm, "");
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".tsx") && !e.name.startsWith("__")) out.push(p);
  }
  return out;
};

const found = [];
for (const file of walk(path.join(root, "src")).sort()) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  const src = stripLineComments(fs.readFileSync(file, "utf8"));
  for (const m of src.matchAll(/^export function ([A-Z][A-Za-z0-9_]*)\s*\(/gm)) {
    found.push({ name: m[1], rel, mod: "./" + rel.slice("src/".length).replace(/\.tsx$/, "") });
  }
}
if (found.length === 0) { console.log("  FAIL  discovery found no components — the scan is broken"); process.exit(1); }

// COUNT IT A SECOND WAY, against RAW source, and refuse to run if the two disagree.
// This is the check that would have caught the `accept="image/*"` bug above on its first run
// instead of after a hand count: a stripper that silently eats source shows up here as a
// shortfall, and a shortfall is a hard stop, not a warning. Any future change to the stripping
// or the walk gets measured against a number it does not control.
let rawCount = 0;
for (const file of walk(path.join(root, "src"))) {
  rawCount += [...fs.readFileSync(file, "utf8").matchAll(/^export function [A-Z][A-Za-z0-9_]*\s*\(/gm)].length;
}
if (rawCount !== found.length) {
  console.log(`  FAIL  discovery disagrees with itself: raw source has ${rawCount} exported components, the scan found ${found.length}.`);
  console.log("        Something is eating source before the scan sees it. Fix the scan; do not adjust this check.");
  process.exit(1);
}

// ---- BUILD A BARREL AND BUNDLE IT ------------------------------------------------
const imports = found.map((c, i) => `import { ${c.name} as __X${i} } from "${c.mod}";`).join("\n");
const table = found.map((c, i) => `["${c.name}","${c.rel}",__X${i}]`).join(",");
fs.writeFileSync("src/__rn.tsx",
  fs.readFileSync("src/app.tsx", "utf8") + "\n" + imports +
  `\nexport const __rn = { seed, roster: [${table}] };\n`);
execSync('npx --no-install esbuild src/__rn.tsx --bundle --format=cjs --outfile=./rn.cjs --loader:.tsx=tsx --loader:.json=json --jsx=automatic --external:react --external:react-dom --external:react-dom/server', { stdio: "ignore" });

const React = require(path.resolve("node_modules/react"));
const RDS = require(path.resolve("node_modules/react-dom/server"));
const { seed, roster } = require(path.resolve("rn.cjs")).__rn;

// ---- ONE SHOTGUN PROP BAG --------------------------------------------------------
// Same tactic as immutability.cjs: a payload broad enough that most components find their props,
// rather than 108 hand-written fixtures that would rot. Every key here was added because a real
// component asked for it. If a NEW component throws for want of a prop, widen this — do not
// exempt the component, or the gate starts lying again.
const s = seed();
const ch = Object.values(s.characters).find((c) => c.ownerId === "acc_aldric" && !c.retired);
const it = Object.values(s.items)[0];
const noop = () => {};
const props = {
  state: s, ch, char: ch, character: ch, accountId: ch.ownerId, acct: ch.ownerId, by: ch.ownerId,
  dispatch: noop, close: noop, onClose: noop, onDone: noop, setModal: noop, onChange: noop,
  modal: { charId: ch.id, currency: "gp", id: it && it.id, itemId: it && it.id, label: "x",
           kind: "slot", entryType: "EARNING", advId: "ddex01-05",
           mine: { itemId: it && it.id }, theirs: { itemId: it && it.id } },
  item: it, it, items: Object.values(s.items),
  session: (s.sessions || [])[0], sess: (s.sessions || [])[0],
  org: { id: "scale" }, orgId: "scale",
  d: { name: "a grave", date: "2026-07-01" }, bastionName: "Ravenhold", docs: [],
  prov: { state: "VERIFIED", source: "DM_VOUCH", by: "a DM" }, isEvent: false, review: null,
  poll: { id: "p1", question: "?", options: [], votes: {} },
  entry: { id: "e1", text: "x", date: "2026-07-01" },
  row: { kind: "slot", log: { slotId: "sl1", id: "lg1" }, item: it, slot: { label: "Uncommon slot", rarity: "uncommon" } },
  offer: { id: "o1", storeId: "store_dj", options: ["acc_oribel"] },
  proposal: { id: "tp1", provDm: "acc_mira", mentor: "acc_oribel", adventureId: "ddex01-05",
              storeId: "store_dj", capacity: 6, dates: ["2026-11-05T18:00", "2026-11-12T18:00"],
              status: "PENDING", chosen: null },
  canEdit: false, mode: "buy", value: "", label: "x", title: "x", children: null,
};

let fails = 0;
const bad = [];
for (const [name, rel, C] of roster) {
  try { RDS.renderToString(React.createElement(C, props)); }
  catch (e) { fails++; bad.push([name, rel, String((e && e.message) || e).split("\n")[0].slice(0, 80)]); }
}

console.log(`  components discovered : ${roster.length}`);
console.log(`  mounted clean         : ${roster.length - fails}`);
console.log(`  THREW ON MOUNT        : ${fails}`);
for (const [n, r, m] of bad) console.log(`      ${n}  (${r})  ${m}`);

fs.rmSync("src/__rn.tsx", { force: true });
fs.rmSync("rn.cjs", { force: true });

console.log(fails ? `\nRENDER: ${fails} component(s) threw` : `\nRENDER: all ${roster.length} components mounted`);
process.exit(fails ? 1 : 0);
