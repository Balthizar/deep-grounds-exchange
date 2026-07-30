# Full project swap — safe procedure (READ BEFORE COPYING)

## Verified facts
- Your GitHub `origin/main` (793bcbd) is BEHIND this tree. It does NOT have the workshop/scriptorium
  tooling, the library work, or the new harness tools. That's why your partial file-copy broke tsc:
  you brought this tree's bastion/ui.tsx without its matching types.ts / registry.ts.
- This tree is internally consistent and passes `npm run check` fully GREEN: tsc clean, 198 actions,
  reachability passing, coverage 198/198.
- This tree is a clean SUPERSET of GitHub EXCEPT for 12 files it does not contain (below). Those must
  be restored from git after the swap, or they'll be lost.

## THE 12 FILES THIS TREE DOES NOT HAVE (restore from git after swapping):
  srd-source/animals.json, backgrounds.json, classes.json, feats.json, glossary.json,
  manifest.json, rules.json, species.json
  harness/srd_kb_lint.py
  EXCHANGE_PRODUCTION_STANDARD.md, FACILITY_FORMAT.md, FACILITY_SPEC.md

## PROCEDURE (Windows)
1. Undo tonight's broken partial copy — get back to clean 793bcbd:
     cd "C:\Users\user\Desktop\Deep Grounds Exchange\al-platform"
     git checkout -- .
     git clean -fd
   (Confirm: `git status` shows clean, `npm run check` fails ONLY at reachability with 5 actions.)

2. Copy THIS bundle's contents over your working tree, overwriting. (Everything except the 12 files
   above, which aren't in this bundle — so they stay untouched on your disk from step 1.)
   NOTE: because step 1 restored them and this bundle doesn't contain them, they are already safe.
   But if you copied into a CLEANED folder, restore them explicitly:
     git checkout 793bcbd -- srd-source/ harness/srd_kb_lint.py EXCHANGE_PRODUCTION_STANDARD.md FACILITY_FORMAT.md FACILITY_SPEC.md

3. Verify:
     npm run check
   EXPECT: tsc clean, 198 actions, reachability PASS, coverage 198/198, EXIT 0.
   (Ignore the npm "new version" notice and lint warnings — 0 errors is what matters.)

4. If green, commit as ONE coherent commit and push:
     git add -A
     git commit -m "Library book generator, workshop/scriptorium tooling, harness self-check/report/next"
     git push origin main

## If check FAILS after the swap
Do NOT push. The most likely cause is a file that didn't copy. Compare `git status` — if any src/ or
harness/ file is unexpectedly unchanged, re-copy it. If stuck, next session: clone your repo into the
container so we work against the identical tree and rebuild the delta cleanly.
