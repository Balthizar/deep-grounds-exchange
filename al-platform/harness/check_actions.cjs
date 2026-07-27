// My action-contract check. I read SOURCE FILES, never compiled function text — I paid for
// that lesson once already (the minified toString scan).
//
// Three things must agree, and nothing at runtime can verify them for me:
//   1. each reducer module's declared *_ACTION_NAMES list  ==  its actual `case "X":` labels
//   2. the union of those lists                            ==  ActionType in types.ts
//   3. no action declared without a case, none handled without a declaration
//
// This exists because the previous approach - discovering action names at runtime via
// reducerImpl.toString() and a `case "X":` regex - passed every development check and was
// DEAD in the production bundle, where the minifier emits `case`X`:`. A declared action with
// no reducer case is a false contract: TypeScript accepts the dispatch and the runtime
// silently does nothing.
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
// Strip comments before scanning. Prose describing the scan would otherwise match it - the
// first run of this check flagged an action called "X", which came from a comment containing
// the literal text `case "X":`. A comment is not code.
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");

const MODULES = [
  ["src/bastion/actions.ts", "BASTION_ACTION_NAMES"],
  ["src/reducer/items.ts", "ITEM_ACTION_NAMES"],
  ["src/reducer/play.ts", "PLAY_ACTION_NAMES"],
  ["src/reducer/characters.ts", "CHARACTER_ACTION_NAMES"],
  ["src/reducer/org.ts", "ORG_ACTION_NAMES"],
  ["src/reducer/social.ts", "SOCIAL_ACTION_NAMES"],
];

let fails = 0;
const fail = (msg) => { console.log("  FAIL  " + msg); fails++; };
const ok = (msg) => console.log("  ok    " + msg);

const union = new Set();

for (const [file, constName] of MODULES) {
  const src = read(file);

  // the labels actually handled by the switch
  const cases = new Set([...stripComments(src).matchAll(/case "([A-Z][A-Z0-9_]*)":/g)].map((m) => m[1]));

  // the labels the module claims to handle
  const block = new RegExp(`export const ${constName}[^=]*=\\s*\\[([\\s\\S]*?)\\]`).exec(src);
  if (!block) { fail(`${file}: no ${constName} export found`); continue; }
  const declared = new Set([...block[1].matchAll(/"([A-Z][A-Z0-9_]*)"/g)].map((m) => m[1]));

  const missing = [...cases].filter((c) => !declared.has(c));
  const extra = [...declared].filter((d) => !cases.has(d));
  if (missing.length) fail(`${constName} is missing handled actions: ${missing.join(", ")}`);
  if (extra.length) fail(`${constName} lists actions with no case: ${extra.join(", ")}`);
  if (!missing.length && !extra.length) ok(`${constName} matches its ${cases.size} cases`);

  for (const d of declared) union.add(d);
}

// the union must equal the declared ActionType
const types = read("src/types.ts");
const atBlock = /export type ActionType =([\s\S]*?);\n/.exec(types);
if (!atBlock) { fail("types.ts: could not find ActionType"); }
else {
  const declaredTypes = new Set([...atBlock[1].matchAll(/"([A-Z][A-Z0-9_]*)"/g)].map((m) => m[1]));
  const noCase = [...declaredTypes].filter((d) => !union.has(d));
  const noType = [...union].filter((u) => !declaredTypes.has(u));
  if (noCase.length) fail(`declared in ActionType but NO REDUCER CASE: ${noCase.join(", ")}`);
  if (noType.length) fail(`handled by a reducer but NOT in ActionType: ${noType.join(", ")}`);
  if (!noCase.length && !noType.length) ok(`ActionType matches the reducers exactly (${union.size} actions)`);
}

console.log(fails ? `\nACTION CONTRACT: ${fails} failure(s)` : "\nACTION CONTRACT: all checks passed");
process.exit(fails ? 1 : 0);
