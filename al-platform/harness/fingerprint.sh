#!/bin/bash
# Fingerprint the app's RUNTIME behaviour. Usage: harness/fingerprint.sh <out.json>
set -e
cd "$(dirname "$0")/.."
OUT="${1:-/tmp/fp.json}"
cp src/app.tsx src/__fp.tsx
cat harness/probe.ts >> src/__fp.tsx
npx esbuild src/__fp.tsx --bundle --format=cjs --outfile=./fp.cjs \
  --external:react --external:react-dom --loader:.tsx=tsx --loader:.json=json --jsx=automatic >/dev/null 2>&1
node -e '
const p = require("./fp.cjs").__probe;
const out = { registries:{}, data:{}, behaviour:{} };
for (const [k,v] of Object.entries(p.registries)) out.registries[k] = v;
for (const [k,v] of Object.entries(p.data))       out.data[k] = v;
// behavioural fingerprint: deterministic generators must produce identical output
const rng = p.fns.mkRng("fingerprint-seed");
out.behaviour.rng = Array.from({length:12}, () => rng());
out.behaviour.rolls = [];
for (const t of ["arcana","armaments","implements","relics"])
  for (const r of ["common","uncommon","rare","very_rare","legendary"]) {
    // deterministic sample of every table row, not a random roll
    const tbl = require("./fp.cjs").__probe.data[t.toUpperCase()];
    if (tbl && tbl[r]) out.behaviour.rolls.push(t+"."+r+"="+JSON.stringify(tbl[r]));
  }
// the seed state itself is the deepest fingerprint of the engine
const s = p.seed();
out.behaviour.seedShape = Object.fromEntries(Object.entries(s).map(([k,v]) =>
  [k, Array.isArray(v) ? "array:"+v.length : (v && typeof v==="object") ? "obj:"+Object.keys(v).length : typeof v]));
out.behaviour.seedItems      = Object.keys(s.items).sort();
out.behaviour.seedCharacters = Object.keys(s.characters).sort();
out.behaviour.seedJSON       = JSON.stringify(s).length;
require("fs").writeFileSync(process.argv[1], JSON.stringify(out, null, 1));
' "$OUT"
rm -f src/__fp.tsx fp.cjs
echo "fingerprint -> $OUT ($(wc -c < "$OUT") bytes)"
