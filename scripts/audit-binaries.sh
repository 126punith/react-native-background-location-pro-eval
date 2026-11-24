#!/usr/bin/env bash
#
# Repeatable release audit for the binary evaluation package.
# Verifies AAR / XCFramework / npm pack surface without publishing.
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
AAR="$HERE/android/libs/bgtrackkit.aar"
XCF="$HERE/ios/BgTrackKit.xcframework"
REPORT_DIR="${AUDIT_REPORT_DIR:-$HERE/../../build-artifacts/audit-reports}"
STAMP="$(date +%Y%m%d-%H%M%S)"
REPORT="$REPORT_DIR/audit-$STAMP.txt"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$REPORT_DIR"
exec > >(tee "$REPORT") 2>&1

pass=0
fail=0
warn=0

ok() { echo "[PASS] $*"; pass=$((pass + 1)); }
bad() { echo "[FAIL] $*"; fail=$((fail + 1)); }
note() { echo "[WARN] $*"; warn=$((warn + 1)); }

echo "=== Binary release audit ($STAMP) ==="
echo "package: $HERE"
echo

# --- AAR ---
echo "## Android AAR"
if [[ -f "$AAR" ]]; then
  ok "AAR present ($(wc -c <"$AAR" | tr -d ' ') bytes)"
  echo "  sha256: $(shasum -a 256 "$AAR" | awk '{print $1}')"
  unzip -q -o "$AAR" -d "$TMP/aar"
  if unzip -l "$AAR" | grep -qE '\.(kt|java)$'; then
    bad "AAR contains source (.kt/.java)"
  else
    ok "AAR has no .kt/.java"
  fi
  if [[ -f "$HERE/android/libs/mapping.txt" || -f "$HERE/mapping.txt" ]]; then
    bad "mapping.txt next to package/AAR"
  else
    ok "mapping.txt not in package tree"
  fi
  # Decode binary manifest to text when aapt2 is available; otherwise scan the binary XML.
  MANIFEST_TXT="$TMP/manifest.txt"
  if command -v aapt2 >/dev/null 2>&1; then
    aapt2 dump xmltree "$AAR" AndroidManifest.xml >"$MANIFEST_TXT" 2>/dev/null || true
  fi
  if [[ ! -s "$MANIFEST_TXT" ]]; then
    # Fallback: strings from binary XML (comments may still appear; prefer aapt2 locally).
    strings "$TMP/aar/AndroidManifest.xml" >"$MANIFEST_TXT" || true
  fi
  if grep -E 'WATCHDOG_TICK' "$MANIFEST_TXT" >/dev/null 2>&1 && \
     grep -E 'A: android:name\(.*\)="com.bglocationdemo.WATCHDOG_TICK"|android.intent.action.*WATCHDOG' "$MANIFEST_TXT" >/dev/null 2>&1; then
    bad "WATCHDOG_TICK still declared as an intent-filter action"
  elif grep -a -F 'com.bglocationdemo.WATCHDOG_TICK' "$TMP/aar/AndroidManifest.xml" >/dev/null 2>&1; then
    # Full action string in the binary pool usually means a filter action (comments rarely embed FQCN).
    bad "com.bglocationdemo.WATCHDOG_TICK string still in AAR AndroidManifest.xml"
  else
    ok "WATCHDOG_TICK not declared as a manifest intent-filter action"
  fi
  if grep -a -F 'INTERNAL_RECEIVER' "$TMP/aar/AndroidManifest.xml" >/dev/null 2>&1; then
    ok "INTERNAL_RECEIVER signature permission present in AAR manifest"
  else
    bad "INTERNAL_RECEIVER permission missing from AAR manifest"
  fi
  if grep -a -F 'EvalGate' "$TMP/aar/proguard.txt" >/dev/null 2>&1; then
    bad "consumer proguard still keeps EvalGate by name"
  else
    ok "consumer proguard has no dead EvalGate keep"
  fi
  if grep -a -E 'extends android\.app\.Service|extends android\.content\.BroadcastReceiver' "$TMP/aar/proguard.txt" >/dev/null 2>&1; then
    bad "consumer proguard still has app-wide Service/Receiver keeps"
  else
    ok "consumer proguard has no app-wide Service/Receiver keeps"
  fi
  mkdir -p "$TMP/cls"
  unzip -q -o "$TMP/aar/classes.jar" -d "$TMP/cls"
  if grep -a -R -F 'eval_release_blocked' "$TMP/cls" >/dev/null 2>&1; then
    bad "contiguous eval_release_blocked string in AAR classes"
  else
    ok "no contiguous eval_release_blocked in AAR classes"
  fi
  TOTAL=$(find "$TMP/cls" -name '*.class' | wc -l | tr -d ' ')
  LNT=$(find "$TMP/cls" -name '*.class' -print0 | xargs -0 grep -al 'LineNumberTable' 2>/dev/null | wc -l | tr -d ' ')
  echo "  classes=$TOTAL with_LineNumberTable=$LNT"
  if [[ "$LNT" -gt 0 ]]; then
    note "LineNumberTable still present on $LNT/$TOTAL classes (R8 residual; mapping stays external)"
  fi
else
  bad "AAR missing: $AAR"
fi
echo

# --- XCFramework ---
echo "## iOS XCFramework"
if [[ -d "$XCF" ]]; then
  ok "XCFramework present"
  if find "$XCF" -name '*.swiftinterface' | grep -q .; then
    bad "swiftinterface present in XCFramework"
  else
    ok "no .swiftinterface"
  fi
  if find "$XCF" -name '*.swiftmodule' | grep -q .; then
    bad "swiftmodule present in XCFramework"
  else
    ok "no .swiftmodule"
  fi
  HDR="$XCF/ios-arm64/BgTrackKit.framework/Headers/BgTrackKit-Swift.h"
  if [[ -f "$HDR" ]]; then
    ok "BgTrackKit-Swift.h present"
    if grep -E '\+load|0x6B3D91|drop-in shim' "$HDR" >/dev/null 2>&1; then
      note "Swift.h still mentions unlock-adjacent wording (review comments)"
    else
      ok "Swift.h has no +load / magic / drop-in shim unlock recipe"
    fi
  else
    bad "BgTrackKit-Swift.h missing"
  fi
  BIN="$XCF/ios-arm64/BgTrackKit.framework/BgTrackKit"
  if [[ -f "$BIN" ]]; then
    echo "  device sha256: $(shasum -a 256 "$BIN" | awk '{print $1}')"
    if strings "$BIN" 2>/dev/null | grep -F 'eval_release_blocked' >/dev/null; then
      bad "contiguous eval_release_blocked in device binary"
    else
      ok "no contiguous eval_release_blocked in device binary"
    fi
  fi
else
  bad "XCFramework missing: $XCF"
fi
echo

# --- Shim source ---
echo "## iOS bridge source"
if grep -E '0x6B3D91|0x1C04E2' "$HERE/ios/BgTrackShim.m" >/dev/null 2>&1; then
  bad "BgTrackShim.m still contains plaintext profile magic"
elif grep -E 'applyRuntimeProfile:[0-9]' "$HERE/ios/BgTrackShim.m" >/dev/null 2>&1; then
  bad "BgTrackShim.m still passes a numeric profile literal"
else
  ok "BgTrackShim.m assembles profiles without plaintext magic literals"
fi
echo

# --- npm pack ---
echo "## npm pack dry-run"
cd "$HERE"
if node scripts/assert-no-source-in-tarball.js; then
  ok "publish-guard passed"
else
  bad "publish-guard failed"
fi
# Confirm allowlist is stub-only
if grep -q 'BackgroundLocationProPackage\\.kt' scripts/assert-no-source-in-tarball.js; then
  ok "allowlist targets BackgroundLocationProPackage.kt"
else
  bad "allowlist not narrowed to stub"
fi
echo

echo "## Summary"
echo "pass=$pass warn=$warn fail=$fail"
echo "report: $REPORT"
if [[ "$fail" -gt 0 ]]; then
  exit 1
fi
exit 0
