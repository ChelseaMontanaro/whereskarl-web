#!/usr/bin/env bash
# Phase 22 / Universal iOS QA — launch the Expo Universal app, NOT legacy Swift.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
UNIVERSAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cat <<'EOF'
============================================================
Phase 22 iOS QA target: apps/universal (Expo)
============================================================

DO NOT open or rebuild:
  ~/Documents/Development/WheresKarl-iOS/.../WheresKarl.xcodeproj

That legacy Swift MapView still renders:
  "Karl Map" / "Track Karl across the Bay" / "AROUND THE BAY"
  / "Search Bay Area spots" / "Live conditions"

Phase 22 immersive Map lives only in:
  whereskarl-web/apps/universal

This script runs Expo Universal on the iOS Simulator.
After launch, confirm Accessibility / testID:
  universal-map-screen
============================================================
EOF

if [[ ! -f "$UNIVERSAL_DIR/package.json" ]]; then
  echo "error: expected Universal app at $UNIVERSAL_DIR" >&2
  exit 1
fi

if [[ -d "$ROOT_DIR/../WheresKarl-iOS" ]]; then
  echo "note: legacy WheresKarl-iOS is present nearby — ignore it for Phase 22."
fi

cd "$UNIVERSAL_DIR"
exec npx expo run:ios "$@"
