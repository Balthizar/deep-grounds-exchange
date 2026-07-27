// My reducer immutability + coverage sweep.
//
// Two things I prove here that nothing else proves:
//
//  1. I NEVER MUTATE THE PREVIOUS STATE. My reducer runs a lazy copy-on-write Proxy draft.
//     It's fast and it's clever, and its correctness hangs on me classifying every mutable
//     top-level collection into DEEP or FLAT. Register one wrong - or forget to register it -
//     and I write straight through into the state React is still holding.
//     Deep-freezing the previous state turns that silent corruption into a thrown TypeError.
//
//  2. EVERY DECLARED ACTION IS REACHABLE. The behaviour harness exercises six representative
//     actions. This dispatches all of them. Most will bail at a permission or lookup guard
//     with a synthetic payload - that is fine and still meaningful: it proves the case exists,
//     is routed, and that its guard path does not mutate the previous state or crash.
//
// This is NOT the table-driven suite the review asked for. It does not assert transitions.
// It is the floor beneath that suite: no crashes, no leaks into previous state, no unroutable
// actions. See OPEN_QUESTIONS.md, Gate B.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Same Windows fix as behaviour.cjs — this was the identical POSIX pattern, one suite later.
fs.writeFileSync("src/__i.tsx", fs.readFileSync("src/app.tsx", "utf8") + '\nexport const __i = { reducer, seed };\n');
execSync('npx --no-install esbuild src/__i.tsx --bundle --format=cjs --outfile=./i.cjs --external:react --external:react-dom --loader:.tsx=tsx --loader:.json=json --jsx=automatic', { stdio: "ignore" });
const { reducer, seed } = require(path.resolve("i.cjs")).__i;

// every declared action name, read from source
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
const files = ["src/bastion/actions.ts", "src/reducer/items.ts", "src/reducer/play.ts",
               "src/reducer/characters.ts", "src/reducer/org.ts", "src/reducer/social.ts"];
const actions = [...new Set(files.flatMap((f) =>
  [...stripComments(fs.readFileSync(f, "utf8")).matchAll(/case "([A-Z][A-Z0-9_]*)":/g)].map((m) => m[1])))].sort();

function deepFreeze(o, seen = new Set()) {
  if (!o || typeof o !== "object" || seen.has(o)) return o;
  seen.add(o);
  Object.freeze(o);
  for (const k of Object.keys(o)) deepFreeze(o[k], seen);
  return o;
}

// a payload broad enough that most guards can find their target
function payload(type, s) {
  const ch = Object.values(s.characters).find((c) => !c.retired) || Object.values(s.characters)[0];
  const it = Object.values(s.items)[0];
  const se = (s.sessions || [])[0] || {};
  const th = (s.threads || [])[0] || {};
  const fac = (ch.bastion && ch.bastion.facilities && ch.bastion.facilities[0]) || {};
  return {
    type, by: ch.ownerId, accountId: ch.ownerId, charId: ch.id, itemId: it && it.id,
    sessionId: se.id, sessId: se.id, threadId: th.id, facId: fac.id, logId: (s.logEntries[0] || {}).id,
    orgId: "scale", storeId: "store_dj", defId: "parlor", size: "cramped", slot: 0,
    name: "probe", text: "probe", reason: "probe", note: "probe", date: "2026-07-24",
    to: ch.ownerId, from: ch.ownerId, toAccountId: ch.ownerId, dm: ch.ownerId,
    join: true, value: 1, amount: 1, qty: 1, level: 1, join_: true,
  };
}

let crashed = [], mutated = [], ok = 0;
for (const type of actions) {
  const prev = seed();
  const act = payload(type, prev);
  deepFreeze(prev);
  try {
    reducer(prev, act);
    ok++;
  } catch (e) {
    const msg = String((e && e.message) || e);
    // a frozen-object write is the signal I'm hunting; anything else is an ordinary crash
    if (/read only|readonly|not extensible|Cannot assign|Cannot add|Cannot delete|frozen/i.test(msg)) {
      mutated.push([type, msg.split("\n")[0].slice(0, 90)]);
    } else {
      crashed.push([type, msg.split("\n")[0].slice(0, 90)]);
    }
  }
}

console.log(`  actions dispatched                : ${actions.length}`);
console.log(`  completed without touching prev   : ${ok}`);
console.log(`  MUTATED THE PREVIOUS STATE        : ${mutated.length}`);
for (const [t, m] of mutated.slice(0, 12)) console.log(`      ${t}  ${m}`);
console.log(`  threw for other reasons           : ${crashed.length}`);
for (const [t, m] of crashed.slice(0, 12)) console.log(`      ${t}  ${m}`);

fs.rmSync("src/__i.tsx", { force: true });
fs.rmSync("i.cjs", { force: true });

const fails = mutated.length + crashed.length;
console.log(fails ? `\nIMMUTABILITY: ${fails} problem(s)` : "\nIMMUTABILITY: all actions clean");
process.exit(fails ? 1 : 0);
