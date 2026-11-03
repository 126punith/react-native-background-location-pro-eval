#!/usr/bin/env node
/**
 * Pre-publish guard. Runs on `npm publish` and `npm pack` (prepack), and fails the command if any
 * engine source, build cache, or R8 mapping would ship. The engine is distributed only as a
 * compiled binary, so a leak here is not recoverable by unpublishing.
 */
const {execFileSync} = require('node:child_process');
const path = require('node:path');

const pkgDir = path.resolve(__dirname, '..');

// The only source allowed to ship: the thin autolinking package stub. Autolinking discovers
// modules by scanning source, so this one file cannot be precompiled.
const ALLOWED_SOURCE = /^android\/src\/main\/java\/[A-Za-z0-9_/]*\.kt$/;

// Each rule: what must never appear in the tarball, and why.
const FORBIDDEN = [
  {pattern: /\.swift$/, why: 'native engine source'},
  {pattern: /\.kt$/, why: 'Kotlin engine source'},
  {pattern: /\.java$/, why: 'Java engine source'},
  {pattern: /(^|\/)engine\//, why: 'Swift engine sources'},
  {pattern: /(^|\/)android-engine\//, why: 'Kotlin engine sources'},
  {pattern: /(^|\/)\.build-xcframework\//, why: 'iOS build cache'},
  {pattern: /(^|\/)build\//, why: 'Gradle build output'},
  {pattern: /\.swiftinterface$/, why: 'readable Swift API surface'},
  {pattern: /\.swiftmodule$/, why: 'readable Swift API surface'},
  {pattern: /\.pcm$/, why: 'compiled module cache'},
  {pattern: /mapping\.txt$/, why: 'R8 mapping (de-obfuscates the AAR)'},
  {pattern: /\.map$/, why: 'source map'},
];

// `npm pack --dry-run --json` lists exactly what would be published, without writing a tarball.
const raw = execFileSync(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['pack', '--dry-run', '--json', '--ignore-scripts'],
  {cwd: pkgDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']},
);

const [report] = JSON.parse(raw);
const files = (report.files || []).map(f => f.path);

if (files.length === 0) {
  console.error('[publish-guard] no files resolved for the tarball; refusing to continue.');
  process.exit(1);
}

const violations = [];
for (const file of files) {
  if (ALLOWED_SOURCE.test(file)) continue;
  for (const rule of FORBIDDEN) {
    if (rule.pattern.test(file)) {
      violations.push(`  ${file}  <- ${rule.why}`);
      break;
    }
  }
}

if (violations.length > 0) {
  console.error('[publish-guard] refusing to package: engine source would ship.');
  console.error(violations.join('\n'));
  console.error('\nThe engine must ship only as a compiled binary. Check the "files" list in package.json.');
  process.exit(1);
}

const hasIos = files.some(f => f.startsWith('ios/BgTrackKit.xcframework/'));
const hasAndroid = files.includes('android/libs/bgtrackkit.aar');
if (!hasIos || !hasAndroid) {
  console.error('[publish-guard] refusing to package: a prebuilt binary is missing.');
  console.error(`  iOS xcframework present: ${hasIos}`);
  console.error(`  Android AAR present: ${hasAndroid}`);
  console.error('\nBuild the missing artifact first (scripts/build-xcframework.sh / scripts/build-aar.sh).');
  process.exit(1);
}

console.log(`[publish-guard] ok: ${files.length} files, binaries present, no engine source.`);
