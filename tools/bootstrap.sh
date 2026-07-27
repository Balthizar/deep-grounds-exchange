#!/usr/bin/env bash
# Restore a working session. Run from the repo root.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "== repo: $(pwd)"
cd al-platform
echo "== installing deps (no audit/fund)"
npm install --no-audit --no-fund >/dev/null 2>&1
echo "== running the gate"
if npm run check; then
  echo "== GATE GREEN"
else
  echo "== GATE RED - stop and report before changing anything" >&2
  exit 1
fi
