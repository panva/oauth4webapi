#!/bin/bash

echo "Using $(deno --version | head -1)"

function stop_server {
    if [ ! -z "$node_pid" ]; then
        kill $node_pid
    fi
}

trap stop_server EXIT

DEBUG=oidc-provider:* node tap/server.mjs > server.log 2>&1 &
node_pid=$!
while ! curl -s http://localhost:3000 >/dev/null; do sleep 0; done

deno run --allow-read --allow-net --import-map tap/import_map.json --no-npm tap/run-deno.ts
