#!/bin/bash

echo "Using edge-runtime $(cat package-lock.json | jq -r '.packages["node_modules/edge-runtime"].version')"

function stop_server {
    if [ ! -z "$node_pid" ]; then
        kill $node_pid
    fi
}

trap stop_server EXIT

DEBUG=oidc-provider:* node tap/server.mjs > server.log 2>&1 &
node_pid=$!
while ! curl -s http://localhost:3000 >/dev/null; do sleep 0; done

./node_modules/.bin/esbuild \
  --log-level=warning \
  --format=esm \
  --bundle \
  --minify-syntax \
  --target=esnext \
  --outfile=tap/run-edge-runtime.js \
  tap/run-edge-runtime.ts

node tap/.edge-runtime.mjs
