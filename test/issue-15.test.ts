import test from 'node:test'
import assert from 'node:assert/strict'
// see https://github.com/panva/oauth4webapi/issues/15

import { issuer, client, getResponse } from './_setup.js'
import * as lib from './_lib.js'

const response = () =>
  getResponse(JSON.stringify({ access_token: 'foo', token_type: 'bearer', scope: '' }))

test('handles empty scope from the Token Endpoint', async () => {
  await assert.doesNotReject(() =>
    Promise.all([
      lib.processAuthorizationCodeResponse(issuer, client, response()),
      lib.processDeviceCodeResponse(issuer, client, response()),
      lib.processClientCredentialsResponse(issuer, client, response()),
      lib.processRefreshTokenResponse(issuer, client, response()),
    ]),
  )
})
