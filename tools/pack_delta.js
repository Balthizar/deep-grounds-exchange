#!/usr/bin/env node
// ================================================================================================
// DELTA PACKER — builds a delta zip with repo-relative paths, and enforces the packing rule from
// COMPILER_PRINCIPLES ("the file that declares the work is part of the work").
//
// ORIGINATING BUG (B-44). The batch 9-10 delta shipped harness/ledger.cjs without the package.json
// that gates it. The receiving end reconstructed a gate that was silently one suite short.
//
// THE GUARD. If the delta touches anything under al-platform/harness/, then al-platform/package.json
// must be in the same delta. Structural and dumb on purpose: it does not try to decide whether THIS
// harness file needed wiring. Shipping an unchanged manifest costs nothing; omitting a changed one
// costs a green gate that is lying.
//
// USAGE (from the repo root):
//   node tools/pack_delta.js <out-name> <file> [file ...]
//   node tools/pack_delta.js --since-head <out-name>      (uses `git status` to find changed files)
//
// Windows-safe: no shell scripts, path.join throughout, zip written with Node only.
// ================================================================================================
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const zlib = require("zlib");

const ROOT = path.join(__dirname, "..");
const OUTDIR = path.join(ROOT, "dist-delta");

const GUARDS = [
  {
    when: (f) => f.split(path.sep).join("/").startsWith("al-platform/harness/"),
    require: "al-platform/package.json",
    why: "a delta that adds or changes a gating suite must carry the manifest that gates it (B-44)",
  },
];

function changedFiles() {
  const raw = execSync("git status --porcelain", { cwd: ROOT, encoding: "utf8" });
  return raw.split("\n").map((l) => l.slice(3).trim()).filter(Boolean).filter((f) => !f.endsWith("/"));
}

// ---- minimal store-only + deflate zip writer ----------------------------------------------------
function crc32(buf) {
  let c, table = [];
  for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function writeZip(outPath, entries) {
  const chunks = [], central = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, "utf8");
    const comp = zlib.deflateRawSync(e.data);
    const crc = crc32(e.data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(8, 8); lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(e.data.length, 22);
    lh.writeUInt16LE(name.length, 26); lh.writeUInt16LE(0, 28);
    chunks.push(lh, name, comp);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0, 8); ch.writeUInt16LE(8, 10); ch.writeUInt16LE(0, 12); ch.writeUInt16LE(0, 14);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(e.data.length, 24);
    ch.writeUInt16LE(name.length, 28); ch.writeUInt32LE(0, 38); ch.writeUInt32LE(offset, 42);
    central.push(ch, name);
    offset += lh.length + name.length + comp.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, Buffer.concat([...chunks, cd, end]));
}

// ---- main ---------------------------------------------------------------------------------------
const argv = process.argv.slice(2);
let files, outName;
if (argv[0] === "--since-head") { outName = argv[1]; files = changedFiles(); }
else { outName = argv[0]; files = argv.slice(1); }

if (!outName || !files.length) {
  console.error("usage: node tools/pack_delta.js <out-name> <file>...  |  --since-head <out-name>");
  process.exit(2);
}
files = [...new Set(files.map((f) => f.split("\\").join("/")))].sort();

const missing = files.filter((f) => !fs.existsSync(path.join(ROOT, f)));
if (missing.length) { missing.forEach((f) => console.error(`  x not found: ${f}`)); process.exit(1); }

let violations = 0;
for (const g of GUARDS) {
  const triggers = files.filter(g.when);
  if (triggers.length && !files.includes(g.require)) {
    violations++;
    console.error(`\n  GUARD FAILED — ${g.require} is missing from this delta.`);
    console.error(`  Reason: ${g.why}`);
    triggers.forEach((t) => console.error(`     triggered by: ${t}`));
  }
}
if (violations) { console.error(`\nPACK REFUSED — ${violations} guard violation(s). Add the file(s) above and re-run.\n`); process.exit(1); }

const entries = files.map((f) => ({ name: f, data: fs.readFileSync(path.join(ROOT, f)) }));
const outPath = path.join(OUTDIR, outName.endsWith(".zip") ? outName : `${outName}.zip`);
writeZip(outPath, entries);
console.log(`\nPACK OK — ${entries.length} file(s) -> ${path.relative(ROOT, outPath)}`);
entries.forEach((e) => console.log(`   ${e.name}`));
console.log("");
