import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'

import setup, { type Context, teardown, issuer, endpoint, client } from './_setup.js'
import * as lib from './_lib.js'
import * as jose from 'jose'
import timekeeper from 'timekeeper'

const context = {} as Context

before(() => setup(context))
after(() => teardown(context))

let cache: lib.JWKSCacheInput = {}
let key: CryptoKeyPair
const now = Date.now()

test('cache is empty at first and set after', async () => {
  key = await lib.generateKeyPair('ES256')
  timekeeper.freeze(now)

  context
    .intercept({
      path: '/jwks-force-refetch-with-cache',
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
    jwks_uri: endpoint('jwks-force-refetch-with-cache'),
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

  await lib.validateJwtAuthResponse(as, c, params, undefined, {
    [lib.jwksCache]: cache,
  })

  assert.ok(cache.uat)
  assert.ok(cache.jwks)
})

test('cache is set and not updated', async () => {
  const before = structuredClone(cache)
  assert.notDeepStrictEqual(before, {})

  const as: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks-force-refetch-with-cache'),
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

  await lib.validateJwtAuthResponse(as, c, params, undefined, {
    [lib.jwksCache]: cache,
  })

  assert.deepStrictEqual(before, cache)
})

test('cache is set and updated', async () => {
  timekeeper.freeze(now + 300 * 1000)
  const before = structuredClone(cache)
  assert.notDeepStrictEqual(before, {})

  context
    .intercept({
      path: '/jwks-force-refetch-with-cache',
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
    jwks_uri: endpoint('jwks-force-refetch-with-cache'),
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

  await lib.validateJwtAuthResponse(as, c, params, undefined, {
    [lib.jwksCache]: cache,
  })

  assert.deepStrictEqual(before.jwks, cache.jwks)
  assert.notStrictEqual(before.uat, cache.uat)
})
