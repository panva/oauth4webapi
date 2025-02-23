#!/bin/bash

. ./tap/.server.sh

echo "Using $(netlify version)"

./node_modules/.bin/esbuild \
  --log-level=warning \
  --format=esm \
  --bundle \
  --minify-syntax \
  --target=esnext \
  --outfile=tap/netlify/functions/run-netlify.mjs \
  tap/run-netlify.ts

function stop_server {
    if [ ! -z "$netlify_pid" ]; then
        kill $netlify_pid
    fi
}

trap stop_server EXIT

netlify functions:serve --functions tap/netlify/functions &
netlify_pid=$!
while ! curl -s http://localhost:9999 >/dev/null; do sleep 0; done

response=$(curl -s http://localhost:9999/test)
failed=$(echo $response | jq -r '.failed')

if [ "$failed" -ne 0 ]; then
  exit 1
fi
