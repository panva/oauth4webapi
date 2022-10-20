#!/bin/bash
./node_modules/.bin/esbuild \
  --format=esm \
  --bundle \
  --minify-syntax \
  --target=esnext \
  --outfile=tap/run-edge-runtime.js \
  tap/run-edge-runtime.ts

node tap/.edge-runtime.mjs
