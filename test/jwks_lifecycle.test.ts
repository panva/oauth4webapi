import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'

import setup, { type Context, teardown, issuer, endpoint, client } from './_setup.js'
import * as lib from './_lib.js'
import * as jose from 'jose'
import timekeeper from 'timekeeper'

const context = {} as Context

before(() => setup(context))
after(() => teardown(context))

test('jwks_uri force refetch', async () => {
  const now = Date.now()
  timekeeper.freeze(now)

  let key = await lib.generateKeyPair('ES256')

  context
    .intercept({
      path: '/jwks-force-refetch',
      method: 'GET',
    })
    .reply(
      200,
      {
        keys: [await jose.exportJWK(key.publicKey)],
      },
      { headers: { 'content-type': 'application/json' } },
    )

  const as: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks-force-refetch'),
    authorization_signing_alg_values_supported: ['ES256'],
  }
  const c: lib.Client = {
    ...client,
  }

  let jwt = await new jose.SignJWT({})
    .setProtectedHeader({ alg: 'ES256' })
    .setAudience(c.client_id)
    .setExpirationTime('5m')
    .setIssuer(as.issuer)
    .sign(key.privateKey)

  let params = new URLSearchParams({ response: jwt })

  await lib.validateJwtAuthResponse(as, c, params)
  await lib.validateJwtAuthResponse(as, c, params)

  timekeeper.travel(now + 299 * 1000)
  await lib.validateJwtAuthResponse(as, c, params)
  timekeeper.travel(now + 300 * 1000)

  // re-fetch forced
  await assert.rejects(() => lib.validateJwtAuthResponse(as, c, params), Error)
})

test('jwks_uri refetch if off cooldown and needed', async () => {
  const now = Date.now()
  timekeeper.freeze(now)

  let key = await lib.generateKeyPair('ES256')

  context
    .intercept({
      path: '/jwks-refetch-off-cooldown',
      method: 'GET',
    })
    .reply(
      200,
      {
        keys: [
          {
            ...(await jose.exportJWK(key.publicKey)),
            kid: 'foo',
          },
        ],
      },
      { headers: { 'content-type': 'application/json' } },
    )

  const as: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks-refetch-off-cooldown'),
    authorization_signing_alg_values_supported: ['ES256'],
  }
  const c: lib.Client = {
    ...client,
  }

  let jwt = await new jose.SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: 'foo' })
    .setAudience(c.client_id)
    .setExpirationTime('5m')
    .setIssuer(as.issuer)
    .sign(key.privateKey)

  let params = new URLSearchParams({ response: jwt })

  await lib.validateJwtAuthResponse(as, c, params)

  jwt = await new jose.SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: 'foo2' })
    .setAudience(c.client_id)
    .setExpirationTime('5m')
    .setIssuer(as.issuer)
    .sign(key.privateKey)

  params = new URLSearchParams({ response: jwt })

  context
    .intercept({
      path: '/jwks-refetch-off-cooldown',
      method: 'GET',
    })
    .reply(
      200,
      {
        keys: [
          {
            ...(await jose.exportJWK(key.publicKey)),
            kid: 'foo2',
          },
        ],
      },
      { headers: { 'content-type': 'application/json' } },
    )

  // re-fetch not allowed yet
  await assert.rejects(() => lib.validateJwtAuthResponse(as, c, params), {
    message: 'error when selecting a JWT verification key, no applicable keys found',
  })
  timekeeper.travel(now + 59 * 1000)
  await assert.rejects(() => lib.validateJwtAuthResponse(as, c, params), {
    message: 'error when selecting a JWT verification key, no applicable keys found',
  })

  timekeeper.travel(now + 60 * 1000)

  await assert.doesNotReject(() => lib.validateJwtAuthResponse(as, c, params))
})
