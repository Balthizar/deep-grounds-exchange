// I deep-compare two fingerprints and exit non-zero on ANY difference. No judgement calls.
import { readFileSync } from "node:fs";
const [a, b] = process.argv.slice(2).map((f) => JSON.parse(readFileSync(f, "utf8")));
let bad = 0;
const walk = (pa, pb, path) => {
  const ka = Object.keys(pa || {}), kb = Object.keys(pb || {});
  const missing = ka.filter((k) => !kb.includes(k)), added = kb.filter((k) => !ka.includes(k));
  if (missing.length) { console.log(`  MISSING at ${path}: ${missing.join(", ")}`); bad++; }
  if (added.length)   { console.log(`  ADDED   at ${path}: ${added.join(", ")}`); bad++; }
  for (const k of ka.filter((k) => kb.includes(k))) {
    const sa = JSON.stringify(pa[k]), sb = JSON.stringify(pb[k]);
    if (sa !== sb) { console.log(`  CHANGED ${path}.${k}  (${sa.length} -> ${sb.length} chars)`); bad++; }
  }
};
for (const sec of ["registries", "data", "behaviour"]) walk(a[sec], b[sec], sec);
console.log(bad ? `\nFAITHFULNESS: ${bad} difference(s)` : "\nFAITHFULNESS: IDENTICAL");
process.exit(bad ? 1 : 0);
