// REGISTRY CONFORMANCE — the shape gate, self-discovering.
//
// Frank, 27 Jul: "the harness also should be growing dynamically with the project so that
// everything is tested. Everything is gated everything is reinforced and verified."
//
// The other suites cover CODE that grows: check_actions reads every reducer case, immutability
// dispatches every declared action, render mounts every exported component. Nothing covered the
// DATA REGISTRIES that grow — and those are where this project actually grows. 10 of 29 special
// facilities are minted; 19 are still to come. Before this file, each new mint was verified by
// whoever happened to be looking, against a format doc nobody executes.
//
// THE SPLIT THAT MAKES THIS WORK, and the reason it can't just be "assert 10 facilities exist":
//   - the ROSTER is discovered. Every key in the registry is swept, whatever lands tomorrow.
//   - the RULES are hand-written. They are claims about what a facility must BE.
// Deriving rules from the population instead would be circular: mint one facility missing
// `orders` and the "rule" quietly becomes "orders is optional". The population must be measured
// against a standard it does not get a vote on. Same discipline as the render gate's raw
// second count, and the same reason FACILITY_FORMAT.md exists as prose — this is that prose,
// executable, so it fails at the gate instead of being noticed three mints later.
//
// New registries belong here as they appear (orders, events, charms, regions). The pattern is
// one `sweep(name, registry, rules)` call; adding a registry should cost three lines.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
process.chdir(root);

fs.writeFileSync("src/__cf.tsx", fs.readFileSync("src/app.tsx", "utf8") +
  '\nimport { BASTION_FACILITIES as __bf } from "./data/bastion";\n' +
  'export const __cf = { BASTION_FACILITIES: __bf };\n');
execSync('npx --no-install esbuild src/__cf.tsx --bundle --format=cjs --outfile=./cf.cjs --external:react --external:react-dom --loader:.tsx=tsx --loader:.json=json --jsx=automatic', { stdio: "ignore" });
const { BASTION_FACILITIES } = require(path.resolve("cf.cjs")).__cf;

let fails = 0;
const fail = (msg) => { console.log("  FAIL  " + msg); fails++; };

// Sweep every member of a registry against every rule. A rule returns null when satisfied, or a
// string saying what is wrong. Rules are named so a failure points at the standard, not the row.
function sweep(label, registry, rules) {
  const keys = Object.keys(registry || {});
  if (keys.length === 0) { fail(`${label}: registry is EMPTY — the import is broken, not the data`); return; }
  let bad = 0;
  for (const key of keys) {
    const rec = registry[key];
    for (const [ruleName, check] of rules) {
      let why;
      try { why = check(rec, key, registry); }
      catch (e) { why = "rule threw: " + String((e && e.message) || e).slice(0, 60); }
      if (why) { fail(`${label}.${key} — ${ruleName}: ${why}`); bad++; }
    }
  }
  console.log(`  ${bad === 0 ? "ok   " : "     "} ${label}: ${keys.length} entries x ${rules.length} rules${bad === 0 ? " — all conform" : ""}`);
}

// ---- FACILITY RULES ---------------------------------------------------------------
// Every claim here is a thing a facility MUST be, not a thing today's ten happen to be.
const str = (v) => typeof v === "string" && v.trim().length > 0;

sweep("BASTION_FACILITIES", BASTION_FACILITIES, [
  ["id matches key", (d, k) => d.id === k ? null : `id is "${d.id}" but it is registered under "${k}" — defId lookups go through the KEY, so a mismatch silently resolves to nothing`],
  ["has a name", (d) => str(d.name) ? null : "missing or empty name"],
  ["has a note", (d) => str(d.note) ? null : "missing or empty note — every facility carries its own description"],
  ["kind is basic or special", (d) => d.kind === "basic" || d.kind === "special" ? null : `kind is ${JSON.stringify(d.kind)}`],
  ["minLevel is a real character level", (d) => Number.isInteger(d.minLevel) && d.minLevel >= 1 && d.minLevel <= 20 ? null : `minLevel is ${JSON.stringify(d.minLevel)}`],
  // DMG Bastions: special facilities unlock at 5, 9, 13 and 17. A special at any other level is
  // either a typo or a house rule that has not been declared as one.
  ["special unlocks at a DMG tier", (d) => d.kind !== "special" || [5, 9, 13, 17].includes(d.minLevel) ? null : `special facility at minLevel ${d.minLevel}; the DMG tiers are 5/9/13/17`],
  ["orders is an array", (d) => Array.isArray(d.orders) ? null : `orders is ${typeof d.orders}`],
  ["specials issue at least one order", (d) => d.kind !== "special" || d.orders.length > 0 ? null : "a special facility with no orders can never be used"],
  ["basics issue no orders", (d) => d.kind !== "basic" || d.orders.length === 0 ? null : `basic facility declares orders ${JSON.stringify(d.orders)} — basics are space, not activity`],
  ["orders are unique", (d) => !Array.isArray(d.orders) || new Set(d.orders).size === d.orders.length ? null : "duplicate order in the list"],
  // The three fields that separate a minted special from a stub. Caught here rather than at the
  // 19th mint, which is the entire point of sweeping the roster instead of naming it.
  ["specials declare space", (d) => d.kind !== "special" || str(d.space) ? null : "a special facility must declare its space"],
  ["specials declare hirelings", (d) => d.kind !== "special" || Number.isInteger(d.hirelings) ? null : `hirelings is ${JSON.stringify(d.hirelings)}`],
  ["specials declare a prereq", (d) => d.kind !== "special" || d.prereq !== undefined ? null : "missing prereq"],
  ["basics declare no space", (d) => d.kind !== "basic" || d.space === undefined ? null : "a basic facility must not declare space"],
]);

fs.rmSync("src/__cf.tsx", { force: true });
fs.rmSync("cf.cjs", { force: true });

console.log(fails ? `\nCONFORMANCE: ${fails} violation(s)` : "\nCONFORMANCE: every registry entry conforms");
process.exit(fails ? 1 : 0);
