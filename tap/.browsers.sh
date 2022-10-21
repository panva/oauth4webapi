#!/bin/bash
./node_modules/.bin/esbuild \
  --log-level=warning \
  --format=esm \
  --bundle \
  --minify-syntax \
  --target=esnext \
  --outfile=tap/run-browser.js \
  tap/run-browser.ts

HOSTNAME="localhost"
SSL=""

if [[ -z $CI ]]; then
  BROWSER="chrome:headless"
else
  if [[ "$BROWSER" == "browserstack"* ]]; then
    if [[ "$BROWSER" != "browserstack:android"* ]]; then
      HOSTNAME="oauth4webapi.panva.me"
      SSL="key=./letsencrypt/config/live/oauth4webapi.panva.me/privkey.pem;cert=./letsencrypt/config/live/oauth4webapi.panva.me/cert.pem;rejectUnauthorized=true;"
    fi
    BROWSER=$(node ./tap/browserstack.mjs $BROWSER)
  fi
fi

./node_modules/.bin/testcafe "$BROWSER" --skip-js-errors --ssl "$SSL" --hostname "$HOSTNAME" tap/.browser.ts
