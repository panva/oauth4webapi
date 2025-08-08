// see https://github.com/panva/oauth4webapi/issues/191

import test from 'ava'
import { issuer, client, getResponse } from './_setup.js'
import * as lib from '../src/index.js'

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

test('only checks www-authenticate when the status code is invalid', async (t) => {
  for (const req of [
    lib.processAuthorizationCodeResponse(issuer, client, questionableResponse()),
    lib.processDeviceCodeResponse(issuer, client, questionableResponse()),
    lib.processClientCredentialsResponse(issuer, client, questionableResponse()),
    lib.processRefreshTokenResponse(issuer, client, questionableResponse()),
  ]) {
    await t.notThrowsAsync(() => req)
  }

  for (const req of [
    lib.processAuthorizationCodeResponse(issuer, client, errorResponse()),
    lib.processDeviceCodeResponse(issuer, client, errorResponse()),
    lib.processClientCredentialsResponse(issuer, client, errorResponse()),
    lib.processRefreshTokenResponse(issuer, client, errorResponse()),
  ]) {
    await t.throwsAsync(() => req, { code: 'OAUTH_WWW_AUTHENTICATE_CHALLENGE' })
  }
})
