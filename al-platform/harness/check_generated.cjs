// My generated-data drift check.
//
// srd-source/ is my source of truth; scripts/ compose the lean data I ship in src/data/srd/.
// Nothing used to stop those outputs from drifting out of sync with their sources - a hand-edit
// or a stale commit of mine would sail through unnoticed. So I regenerate into a temp directory
// and compare: drift fails my build instead of shipping.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const out = path.join(root, "src", "data", "srd");
const backup = fs.mkdtempSync(path.join(require("os").tmpdir(), "srdchk-"));

const files = fs.readdirSync(out).filter((f) => f.endsWith(".json"));
for (const f of files) fs.copyFileSync(path.join(out, f), path.join(backup, f));

let fails = 0;
try {
  execSync("node scripts/gen-srd.mjs", { cwd: root, stdio: "ignore" });
  for (const f of files) {
    const before = fs.readFileSync(path.join(backup, f), "utf8");
    const after = fs.readFileSync(path.join(out, f), "utf8");
    if (before === after) { console.log(`  ok    ${f} matches its source`); }
    else { console.log(`  FAIL  ${f} DRIFTED from srd-source - run: npm run generate`); fails++; }
  }
} finally {
  // restore whatever was there, so a failing check never leaves the tree half-regenerated
  for (const f of files) fs.copyFileSync(path.join(backup, f), path.join(out, f));
  fs.rmSync(backup, { recursive: true, force: true });
}
console.log(fails ? `\nGENERATED DATA: ${fails} file(s) drifted` : "\nGENERATED DATA: in sync with srd-source");
process.exit(fails ? 1 : 0);
