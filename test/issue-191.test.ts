import test from 'node:test'
import assert from 'node:assert/strict'
// see https://github.com/panva/oauth4webapi/issues/191

import { issuer, client, getResponse } from './_setup.js'
import * as lib from './_lib.js'

const questionableResponse = () =>
  getResponse(JSON.stringify({ access_token: 'foo', token_type: 'bearer', scope: '' }), {
    headers: new Headers({
      'content-type': 'application/json',
      'WWW-Authenticate': 'Key realm="kong"',
    }),
  })

const errorResponse = () =>
  getResponse(JSON.stringify({ access_token: 'foo', token_type: 'bearer', scope: '' }), {
    headers: new Headers({
      'content-type': 'application/json',
      'WWW-Authenticate': 'Key realm="kong"',
    }),
    status: 400,
  })

test('only checks www-authenticate when the status code is invalid', async () => {
  for (const req of [
    lib.processAuthorizationCodeResponse(issuer, client, questionableResponse()),
    lib.processDeviceCodeResponse(issuer, client, questionableResponse()),
    lib.processClientCredentialsResponse(issuer, client, questionableResponse()),
    lib.processRefreshTokenResponse(issuer, client, questionableResponse()),
  ]) {
    await assert.doesNotReject(() => req)
  }

  for (const req of [
    lib.processAuthorizationCodeResponse(issuer, client, errorResponse()),
    lib.processDeviceCodeResponse(issuer, client, errorResponse()),
    lib.processClientCredentialsResponse(issuer, client, errorResponse()),
    lib.processRefreshTokenResponse(issuer, client, errorResponse()),
  ]) {
    await assert.rejects(() => req, { code: 'OAUTH_WWW_AUTHENTICATE_CHALLENGE' })
  }
})
