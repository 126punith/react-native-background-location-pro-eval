#!/usr/bin/env bash
#
# Builds the React-free tracking engine into ios/BgTrackKit.xcframework (device + simulator).
# The engine source (../engine) never ships to npm; only this binary does.
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
ENGINE="$HERE/engine"
BUILD="$HERE/.build-xcframework"
OUT="$HERE/ios/BgTrackKit.xcframework"
SCHEME="BgTrackKit"

rm -rf "$BUILD" "$OUT"
mkdir -p "$BUILD"

archive() {
  local sdk="$1" tag="$2"
  xcodebuild archive -quiet \
    -scheme "$SCHEME" \
    -destination "generic/platform=$sdk" \
    -archivePath "$BUILD/$tag.xcarchive" \
    -derivedDataPath "$BUILD/dd-$tag" \
    SKIP_INSTALL=NO \
    BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
    SWIFT_OPTIMIZATION_LEVEL=-Osize \
    SWIFT_COMPILATION_MODE=wholemodule \
    GCC_GENERATE_DEBUGGING_SYMBOLS=NO \
    DEPLOYMENT_POSTPROCESSING=YES \
    STRIP_INSTALLED_PRODUCT=YES \
    STRIP_STYLE=non-global \
    COPY_PHASE_STRIP=YES \
    SWIFT_REFLECTION_METADATA_LEVEL=none \
    ONLY_ACTIVE_ARCH=NO
}

cd "$ENGINE"
archive "iOS" "ios"
archive "iOS Simulator" "sim"

fw_path() {
  # SwiftPM static-library archives place the framework under Products.
  find "$BUILD/$1.xcarchive/Products" -name "$SCHEME.framework" -maxdepth 4 | head -1
}

# SwiftPM archives a pure-Swift framework without Headers/Modules; the ObjC++ bridge needs the
# generated `BgTrackKit-Swift.h` and a modulemap, so inject them (binary .swiftmodule only - never
# the textual .swiftinterface, which would ship a readable API surface).
inject() {
  local tag="$1" fw header
  fw="$(fw_path "$tag")"
  [ -n "$fw" ] || { echo "error: no framework for $tag" >&2; exit 1; }
  header="$(find "$BUILD/dd-$tag" -path '*GeneratedModuleMaps*/BgTrackKit-Swift.h' | head -1)"
  [ -n "$header" ] || header="$(find "$BUILD/dd-$tag" -name 'BgTrackKit-Swift.h' | head -1)"

  # Ship as an ObjC-consumable framework: the bridge imports the generated header only. No
  # .swiftmodule / .swiftinterface is included, so no Swift API surface is distributed.
  rm -rf "$fw/Modules/BgTrackKit.swiftmodule"
  mkdir -p "$fw/Headers" "$fw/Modules"
  cp "$header" "$fw/Headers/BgTrackKit-Swift.h"
  cat > "$fw/Modules/module.modulemap" <<'EOF'
framework module BgTrackKit {
  header "BgTrackKit-Swift.h"
  requires objc
  export *
}
EOF

  # Strip local symbols and debug info from the installed binary before packaging.
  local bin="$fw/$SCHEME"
  if [[ -f "$bin" ]]; then
    xcrun strip -x -S "$bin" 2>/dev/null || xcrun strip -x "$bin"
  fi
}

inject ios
inject sim

DEVICE_FW="$(fw_path ios)"
SIM_FW="$(fw_path sim)"

xcodebuild -create-xcframework \
  -framework "$DEVICE_FW" \
  -framework "$SIM_FW" \
  -output "$OUT"

# Belt and suspenders: ensure no textual interface slipped into the shipped artifact.
find "$OUT" -name "*.swiftinterface" -delete || true
find "$OUT" -name "*.swiftmodule" -delete || true
find "$OUT" -name "*.swiftdoc" -delete || true

echo "built: $OUT"
