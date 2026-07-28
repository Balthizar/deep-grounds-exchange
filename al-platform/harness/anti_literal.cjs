// ANTI-LITERAL GATE.
//
// Frank, 27 Jul: "you're not testing a particular account, you're testing a TYPE of account.
// Testing a particular account breaks everything."
//
// The flaw this exists to kill: an assertion that names a seed id — "acc_aldric", "ch_rath",
// "store_dj", "org_xyz" — is a bet that one specific demo row exists. Swap seed() for production
// data, or merely reshuffle the demo, and that assertion either crashes on undefined or, far
// worse, its `if (subject)` guard skips silently and the test passes having verified NOTHING.
// A test that quietly tests nothing is precisely what the strict gate exists to prevent, so a
// literal seed id in a test is not a style nit — it is a latent false-green.
//
// THE RULE: every actor and subject in an assertion must be DERIVED from a role or a
// relationship, never named. Not "acc_aldric" but "an account with no admin role"; not "ch_rath"
// but "an active character whose owner is not an admin"; not "store_dj" but "a store some org
// lists". Then the assertion says what it means and stays true against any dataset that contains
// the shape — and every real dataset does.
//
// This gate greps the harness's own assertion sources for seed-id string literals and fails on
// any hit. It is the same move as every other gate: the machine forbids the regression instead
// of trusting discipline, because discipline demonstrably leaked — the literals were introduced
// across ~500 assertions one convenient shortcut at a time.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
process.chdir(root);

// The id shapes the seed uses. Anything matching these inside a quote is a hardcoded seed row.
// Sourced from the seed's own id prefixes; if the seed adds a new prefix, add it here.
const ID_PATTERNS = [
  /"acc_[a-z0-9_]+"/g,     // accounts
  /"ch_[a-z0-9_]+"/g,      // characters
  /"store_[a-z0-9_]+"/g,   // stores
  /"org_[a-z0-9_]+"/g,     // organizations
  /"sess_[a-z0-9_]+"/g,    // sessions
  /"ev_[a-z0-9_]+"/g,      // events
];

// Files that are ALLOWED to name seed ids: none of the assertion suites are. This list is empty
// on purpose — there is no legitimate reason for a behavioural assertion to name a demo row. If
// a genuine seed-introspection helper ever needs one, it belongs in seed.ts, not in a test.
const EXEMPT = new Set([]);

// The suites this gate polices: everything in harness/ that asserts behaviour. The gate does not
// police itself or the structural scanners (they read source, they don't assert against seed).
const POLICED = ["transitions.cjs", "behaviour.cjs"];

let violations = 0;
const report = [];

for (const file of POLICED) {
  if (EXEMPT.has(file)) continue;
  const full = path.join(root, "harness", file);
  if (!fs.existsSync(full)) continue;
  const lines = fs.readFileSync(full, "utf8").split("\n");
  lines.forEach((line, i) => {
    // Skip comment lines — a comment explaining a seed row is not a test bet on it.
    const code = line.replace(/\/\/.*$/, "");
    for (const pat of ID_PATTERNS) {
      const hits = code.match(pat);
      if (hits) {
        for (const h of hits) {
          violations++;
          report.push(`  ${file}:${i + 1}  ${h}`);
        }
      }
    }
  });
}

if (violations) {
  console.log(`  ANTI-LITERAL: ${violations} hardcoded seed id(s) in assertions — each is a false-green waiting for production data.`);
  console.log("  Derive from a role or relationship instead. A test names a TYPE of account, never a particular one.\n");
  // Group by file for a readable worklist, capped so the output stays usable.
  for (const r of report.slice(0, 200)) console.log(r);
  if (report.length > 200) console.log(`  ...and ${report.length - 200} more`);
  console.log(`\nANTI-LITERAL: ${violations} violation(s)`);
  process.exit(1);
}

console.log("ANTI-LITERAL: no hardcoded seed ids in assertions — every subject is derived");
process.exit(0);
