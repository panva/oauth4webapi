#!/bin/bash
# Type-checks the emitted declaration standalone, with no src involved, under the module resolution
# modes and library configurations consumers actually use. This catches a broken declaration build
# and any new dependency on an ambient global.
set -e

TSC="./node_modules/.bin/tsc"
BASE="--noEmit --ignoreConfig --strict --skipLibCheck false --target esnext"
ENTRY="build/index.d.ts"

if [ ! -f "$ENTRY" ]; then
  echo "$ENTRY not found - run 'npm run generate-build' first" >&2
  exit 1
fi

run() {
  echo "  $*"
  # shellcheck disable=SC2086
  $TSC $BASE "$@" $ENTRY
}

echo "module resolution modes"
run --module preserve --moduleResolution bundler --lib esnext,dom,dom.iterable
run --module node16 --moduleResolution node16 --lib esnext,dom,dom.iterable
run --module nodenext --moduleResolution nodenext --lib esnext,dom,dom.iterable
run --module commonjs --moduleResolution node10 --ignoreDeprecations 6.0 --lib esnext,dom,dom.iterable

echo "supported consumer lib configurations"
# Browser / bundler: DOM lib, no @types/node
run --module preserve --moduleResolution bundler --lib esnext,dom,dom.iterable --typeRoots /nonexistent
# Node: @types/node, no DOM lib
run --module nodenext --moduleResolution nodenext --lib esnext --types node

# Neither DOM lib nor @types/node. The published types are not expected to be self-contained here,
# but their ambient dependencies are a contract. Pin the exact set so a new dependency surfaces in
# CI rather than in a user's build. `crypto` must not appear: CryptoKey must use its checked fallback.
echo "ambient globals depended on with a bare lib"
EXPECTED="AbortSignal Headers ReadableStream Request Response URL URLSearchParams"
# shellcheck disable=SC2086
ACTUAL=$(
  $TSC $BASE --module preserve --moduleResolution bundler --lib esnext \
    --typeRoots /nonexistent $ENTRY 2>&1 |
    sed -n "s/.*error TS2304: Cannot find name '\([A-Za-z0-9_]*\)'.*/\1/p" | sort -u | tr '\n' ' ' | xargs
)
if [ "$ACTUAL" != "$EXPECTED" ]; then
  echo "  FAIL: the ambient globals the published types depend on changed" >&2
  echo "    expected: $EXPECTED" >&2
  echo "    actual:   $ACTUAL" >&2
  exit 1
fi
echo "  $ACTUAL"

echo "OK"
