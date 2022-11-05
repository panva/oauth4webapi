#!/bin/bash
./node_modules/.bin/esbuild \
  --log-level=warning \
  --format=esm \
  --bundle \
  --external:electron \
  --minify-syntax \
  --target=esnext \
  --outfile=tap/run-electron.cjs \
  tap/run-electron.ts

source .electron_flags.sh
electron tap/run-electron.cjs
