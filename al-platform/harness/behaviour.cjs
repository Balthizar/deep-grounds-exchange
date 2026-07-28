// My behavioural gate. The fingerprint compares DATA; this dispatches ACTIONS. I learned the
// difference the hard way: a refactor left every registry byte-identical and still broke my
// reducer's routing - splitting the cases out of reducerImpl silently disabled my unknown-action
// guard, because buildKnownActions() discovered actions by reading reducerImpl.toString().
const { execSync } = require("child_process");
const fs = require("fs");
// Frank's Windows box, 25 Jul: 'cp' is not a command there, and neither is my B-34 claim that I
// had swept these files — I had read transitions.cjs and generalized. Same fs pattern, no shell.
fs.writeFileSync("src/__b.tsx", fs.readFileSync("src/app.tsx", "utf8") + '\nexport const __b = { reducer, seed };\n');
// I build BOTH ways. The unminified bundle is what most of my checks want; the MINIFIED one
// exists because a guard that reads its own source can pass here and be dead in production -
// which is exactly what I shipped: the minifier rewrites `case "X":` as `case`X`:`, my old
// toString() scan found nothing, and my unknown-action guard switched itself off in the shipped
// bundle only. Future me: any check that depends on built output runs against both. Both.
// Frank's Windows box taught me this: `MINIFIED=1 node ...` is POSIX-only — cmd.exe reads it as a
// command name and dies. The env var still works where it works; the argv flag works everywhere.
const MIN = process.env.MINIFIED === "1" || process.argv.includes("--minified");
execSync('npx --no-install esbuild src/__b.tsx --bundle --format=cjs --outfile=./b.cjs --external:react --external:react-dom --loader:.tsx=tsx --loader:.json=json --jsx=automatic' + (MIN ? ' --minify' : ''), {stdio:'ignore'});
const { reducer, seed } = require(require("path").resolve("b.cjs")).__b;
let fails = 0;
const ok = (name, cond) => { console.log(`  ${cond ? "ok  " : "FAIL"}  ${name}`); if (!cond) fails++; };
const s = seed();
const ch = Object.values(s.characters).find(c => (!c.status || c.status === "active") && !(s.roles[c.ownerId] || []).includes("admin") && !c.retired);
// every domain I delegate to must route
for (const [dom, act] of [
  ["bastion",   { type:"ADD_BASTION_FACILITY", charId:ch.id, by:ch.ownerId, defId:"parlor", size:"cramped" }],
  ["items",     { type:"IMPORT_CHARACTER_ITEM", charId:ch.id, by:ch.ownerId, name:"Probe", itemType:"weapon", rarity:"uncommon" }],
  ["character", { type:"SET_BIO", charId:ch.id, by:ch.ownerId, text:"probe" }],
  ["social",    { type:"MARK_THREAD_READ", threadId:(s.threads[0]||{}).id, by:ch.ownerId }],
  ["org",       { type:"SET_ORG_MEMBERSHIP", by:(Object.keys(s.roles).find(a => (s.roles[a]||[]).includes("admin"))), accountId:ch.ownerId, orgId:(Object.keys(s.organizations||{})[0]), join:true }],
  ["play",      { type:"SUGGEST_ADVENTURE", by:ch.ownerId, advId:"ddal09-01" }],
]) { let good=true; try { reducer(s, act); } catch(e) { good=false; } ok(`${dom} action routes`, good); }
// the unknown-action guard must be live
let caught=false; try { reducer(s, { type:"NONSENSE_ACTION" }); } catch(e){ caught=true; }
ok("unknown action is rejected", caught);
let hint=false; try { reducer(s, { type:"ENLARGE_FACILITY" }); } catch(e){ hint=/Did you mean/.test(e.message); }
ok("near-miss typo gets a suggestion", hint);
fs.rmSync("src/__b.tsx", {force:true}); fs.rmSync("b.cjs", {force:true});
console.log(fails ? `\nBEHAVIOUR${MIN ? " (minified)" : ""}: ${fails} FAILURE(S)` : `\nBEHAVIOUR${MIN ? " (minified)" : ""}: all checks passed`);
process.exit(fails ? 1 : 0);
