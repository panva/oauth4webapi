#!/bin/bash

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
  --external:electron \
  --minify-syntax \
  --target=esnext \
  --outfile=tap/run-electron.cjs \
  tap/run-electron.ts

source .electron_flags.sh
electron tap/run-electron.cjs
