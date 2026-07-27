// I capture a fingerprint of everything my app exposes, so a refactor gets PROVEN faithful
// instead of assumed. I compare runtime VALUES, not source text - text-level comparison already
// produced nonsense on me once, and once was enough.
import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
const out = process.argv[2];
if (!out) { console.error("usage: node harness/snapshot.mjs <out.json>"); process.exit(1); }
