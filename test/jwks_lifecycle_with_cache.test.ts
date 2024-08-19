import anyTest, { type TestFn } from 'ava'
import setup, { type Context, teardown, issuer, endpoint, client } from './_setup.js'
import * as lib from '../src/index.js'
import * as jose from 'jose'
import timekeeper from 'timekeeper'

const test = anyTest as TestFn<Context>

test.before(setup)
test.after(teardown)

let cache: lib.JWKSCacheInput = {}
let key: CryptoKeyPair
const now = Date.now()

test.serial('cache is empty at first and set after', async (t) => {
  key = await lib.generateKeyPair('ES256')
  timekeeper.freeze(now)

  t.context
    .intercept({
      path: '/jwks-force-refetch-with-cache',
      method: 'GET',
    })
    .reply(200, {
      keys: [await jose.exportJWK(key.publicKey)],
    })

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

  t.truthy(cache.uat)
  t.truthy(cache.jwks)
})

test.serial('cache is set and not updated', async (t) => {
  const before = structuredClone(cache)
  t.notDeepEqual(before, {})

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

  t.deepEqual(before, cache)
})

test.serial('cache is set and updated', async (t) => {
  timekeeper.freeze(now + 300 * 1000)
  const before = structuredClone(cache)
  t.notDeepEqual(before, {})

  t.context
    .intercept({
      path: '/jwks-force-refetch-with-cache',
      method: 'GET',
    })
    .reply(200, {
      keys: [await jose.exportJWK(key.publicKey)],
    })

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

  t.deepEqual(before.jwks, cache.jwks)
  t.not(before.uat, cache.uat)
})
