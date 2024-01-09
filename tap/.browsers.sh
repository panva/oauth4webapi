#!/bin/bash

./node_modules/.bin/esbuild \
  --log-level=warning \
  --format=esm \
  --bundle \
  --minify \
  --target=esnext \
  --outfile=tap/run-browser.js \
  tap/run-browser.ts

: "${BROWSER:=chrome:headless}"

function stop_server {
    if [ ! -z "$node_pid" ]; then
        kill $node_pid
    fi
}

trap stop_server EXIT

DEBUG=oidc-provider:* node tap/server.mjs > server.log 2>&1 &
node_pid=$!
while ! curl -s http://localhost:3000 >/dev/null; do sleep 0; done

testcafe "$BROWSER" --hostname localhost tap/.browser.ts
