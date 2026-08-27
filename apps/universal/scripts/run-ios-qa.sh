#!/usr/bin/env bash
# Phase 22 / Universal iOS QA — launch Expo Universal ONLY (never legacy Swift).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
UNIVERSAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
UNIVERSAL_BUNDLE_ID="com.anonymous.whereskarl-universal"
LEGACY_SWIFT_BUNDLE_ID="live.whereskarl.WheresKarl"

cat <<'EOF'
============================================================
Phase 22 iOS QA target: apps/universal (Expo)
============================================================

PROOF (source + Metro bundle at afb75f4+):
  The strings "Karl Map", "AROUND THE BAY", and
  "Search Bay Area spots" do NOT exist in Universal.
  They exist only in legacy Swift:
    WheresKarl-iOS/.../MapView.swift

If the simulator shows that chrome, you are running
  live.whereskarl.WheresKarl  (legacy Swift)
NOT
  com.anonymous.whereskarl-universal  (Expo Universal)

Universal Map identity (Accessibility):
  testID: universal-map-screen
  label: Where's Karl Universal Map
  expected chrome: Search locations… + region chips
============================================================
EOF

if [[ ! -f "$UNIVERSAL_DIR/package.json" ]]; then
  echo "error: expected Universal app at $UNIVERSAL_DIR" >&2
  exit 1
fi

if [[ -d "$ROOT_DIR/../WheresKarl-iOS" ]]; then
  echo "note: legacy WheresKarl-iOS is present nearby — this script will terminate it on the simulator."
fi

export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:${PATH:-}"

terminate_legacy_swift_if_present() {
  local udid=""
  udid="$(xcrun simctl list devices booted 2>/dev/null | sed -nE 's/.*\(([A-F0-9-]+)\).*/\1/p' | head -1 || true)"
  if [[ -z "$udid" ]]; then
    echo "note: no booted simulator yet — legacy Swift terminate will run after install."
    return 0
  fi

  if xcrun simctl get_app_container "$udid" "$LEGACY_SWIFT_BUNDLE_ID" >/dev/null 2>&1; then
    echo "terminating legacy Swift app ($LEGACY_SWIFT_BUNDLE_ID) on $udid"
    xcrun simctl terminate "$udid" "$LEGACY_SWIFT_BUNDLE_ID" >/dev/null 2>&1 || true
  else
    echo "note: legacy Swift app not installed on booted simulator."
  fi
}

assert_universal_installed() {
  local udid=""
  udid="$(xcrun simctl list devices booted 2>/dev/null | sed -nE 's/.*\(([A-F0-9-]+)\).*/\1/p' | head -1 || true)"
  if [[ -z "$udid" ]]; then
    echo "warning: no booted simulator to verify bundle id." >&2
    return 0
  fi

  if ! xcrun simctl get_app_container "$udid" "$UNIVERSAL_BUNDLE_ID" >/dev/null 2>&1; then
    echo "error: Universal app ($UNIVERSAL_BUNDLE_ID) is not installed on $udid" >&2
    exit 1
  fi

  echo "verified Universal installed: $UNIVERSAL_BUNDLE_ID"
  echo "launching Universal (not legacy Swift)…"
  xcrun simctl terminate "$udid" "$UNIVERSAL_BUNDLE_ID" >/dev/null 2>&1 || true
  xcrun simctl launch "$udid" "$UNIVERSAL_BUNDLE_ID" >/dev/null
}

terminate_legacy_swift_if_present

cd "$UNIVERSAL_DIR"
npx expo run:ios "$@"

# After install/open, force-identity again (expo may leave Simulator focused on another app).
terminate_legacy_swift_if_present
assert_universal_installed

echo
echo "QA checklist: Home-screen icon should say Where's Karl Universal (not WheresKarl)."
echo "Open Map tab and confirm Accessibility label: Where's Karl Universal Map"
echo "If you still see \"Karl Map\" / \"AROUND THE BAY\", you are in legacy Swift."
