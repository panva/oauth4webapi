#!/bin/bash
npx esbuild --format=esm --bundle --target=esnext tap/run-browser.ts > tap/run-browser.js

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

npx testcafe "$BROWSER" --skip-js-errors --ssl "$SSL" --hostname "$HOSTNAME" tap/.browser.ts
