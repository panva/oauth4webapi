import anyTest, { type TestFn } from 'ava'
import setup, { type Context, teardown, issuer, endpoint, client } from './_setup.js'
import * as lib from '../src/index.js'
import * as jose from 'jose'
import timekeeper from 'timekeeper'

const test = anyTest as TestFn<Context>

test.before(setup)
test.after(teardown)

test.serial('jwks_uri force refetch', async (t) => {
  const now = Date.now()
  timekeeper.freeze(now)

  let key = await lib.generateKeyPair('ES256')

  t.context
    .intercept({
      path: '/jwks-force-refetch',
      method: 'GET',
    })
    .reply(200, {
      keys: [await jose.exportJWK(key.publicKey)],
    })

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
  await t.throwsAsync(() => lib.validateJwtAuthResponse(as, c, params))
})

test.serial('jwks_uri refetch if off cooldown and needed', async (t) => {
  const now = Date.now()
  timekeeper.freeze(now)

  let key = await lib.generateKeyPair('ES256')

  t.context
    .intercept({
      path: '/jwks-refetch-off-cooldown',
      method: 'GET',
    })
    .reply(200, {
      keys: [
        {
          ...(await jose.exportJWK(key.publicKey)),
          kid: 'foo',
        },
      ],
    })

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

  t.context
    .intercept({
      path: '/jwks-refetch-off-cooldown',
      method: 'GET',
    })
    .reply(200, {
      keys: [
        {
          ...(await jose.exportJWK(key.publicKey)),
          kid: 'foo2',
        },
      ],
    })

  // re-fetch not allowed yet
  await t.throwsAsync(() => lib.validateJwtAuthResponse(as, c, params), {
    message: 'error when selecting a JWT verification key, no applicable keys found',
  })
  timekeeper.travel(now + 59 * 1000)
  await t.throwsAsync(() => lib.validateJwtAuthResponse(as, c, params), {
    message: 'error when selecting a JWT verification key, no applicable keys found',
  })

  timekeeper.travel(now + 60 * 1000)

  await t.notThrowsAsync(() => lib.validateJwtAuthResponse(as, c, params))
})
