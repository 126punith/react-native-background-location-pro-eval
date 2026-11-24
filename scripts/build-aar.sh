#!/usr/bin/env bash
#
# Builds the React-free tracking engine plus its TurboModule bridge into android/libs/bgtrackkit.aar.
# The engine source (../android-engine) never ships to npm; only this R8-obfuscated binary does.
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
ENGINE="$HERE/android-engine"
OUT_DIR="$HERE/android/libs"
OUT="$OUT_DIR/bgtrackkit.aar"
# The R8 mapping de-obfuscates the AAR, so it is kept outside the package directory entirely.
MAPPING_DIR="$HERE/../../build-artifacts/bgtrackkit"
SPEC_PACKAGE="com.bglocationdemo.tracking"
SPEC_DIR="$ENGINE/spec/src/main/java/${SPEC_PACKAGE//.//}"

# react-native resolves from the host repo's node_modules (walks up from the package directory).
RN_DIR="$(cd "$HERE" && node -p "require('path').dirname(require.resolve('react-native/package.json'))")"

# Regenerate the compile-only spec from src/specs so the bridge always matches the JS contract.
# The consumer app regenerates the identical class from codegenConfig at build time.
CODEGEN_TMP="$(mktemp -d)"
trap 'rm -rf "$CODEGEN_TMP"' EXIT
node "$RN_DIR/scripts/generate-codegen-artifacts.js" \
  -p "$HERE" -t android -o "$CODEGEN_TMP" -s library >/dev/null
GENERATED="$(find "$CODEGEN_TMP" -name NativeLocationTrackerSpec.java | head -1)"
[ -n "$GENERATED" ] || { echo "error: codegen produced no NativeLocationTrackerSpec.java" >&2; exit 1; }

mkdir -p "$SPEC_DIR"
# The standalone codegen script ignores codegenConfig.android.javaPackageName (only the Gradle
# plugin honors it), so align the package with what the consumer's build will generate.
sed -E "s/^package [a-zA-Z0-9_.]+;/package ${SPEC_PACKAGE};/" "$GENERATED" > "$SPEC_DIR/NativeLocationTrackerSpec.java"

cd "$ENGINE"
./gradlew :assembleRelease --console=plain -q

mkdir -p "$OUT_DIR" "$MAPPING_DIR"
cp "$ENGINE/build/outputs/aar/bgtrackkit-release.aar" "$OUT"
cp "$ENGINE/build/outputs/mapping/release/mapping.txt" "$MAPPING_DIR/mapping.txt"

# Belt and suspenders: no Kotlin/Java source and no codegen spec may ride along in the binary.
if unzip -l "$OUT" | grep -qE '\.(kt|java)$'; then
  echo "error: source files found in $OUT" >&2; exit 1
fi
unzip -q -o "$OUT" classes.jar -d "$CODEGEN_TMP/aar"
if unzip -l "$CODEGEN_TMP/aar/classes.jar" | grep -q 'NativeLocationTrackerSpec.class'; then
  echo "error: codegen spec leaked into $OUT (it must stay compileOnly)" >&2; exit 1
fi
# License sentence must not sit as one contiguous constant-pool string (search
# uncompressed class files; grepping the jar stream misses deflated entries).
mkdir -p "$CODEGEN_TMP/cls"
unzip -q -o "$CODEGEN_TMP/aar/classes.jar" -d "$CODEGEN_TMP/cls"
if grep -a -R -F 'eval_release_blocked' "$CODEGEN_TMP/cls" >/dev/null; then
  echo "error: contiguous eval_release_blocked string found in $OUT" >&2; exit 1
fi
# Mapping must live outside the package (publish-guard also enforces this).
if [[ -f "$HERE/mapping.txt" || -f "$OUT_DIR/mapping.txt" ]]; then
  echo "error: mapping.txt must stay under build-artifacts/, not next to the AAR" >&2; exit 1
fi
# Resolve paths so ../../build-artifacts is not mistaken for a child of HERE.
PKG_REAL="$(cd "$HERE" && pwd -P)"
MAP_REAL="$(mkdir -p "$MAPPING_DIR" && cd "$MAPPING_DIR" && pwd -P)"
case "$MAP_REAL" in
  "$PKG_REAL"|"$PKG_REAL"/*)
    echo "error: MAPPING_DIR must be outside the package directory ($MAP_REAL)" >&2
    exit 1
    ;;
esac

echo "built: $OUT"
echo "mapping (do not publish): $MAPPING_DIR/mapping.txt"
