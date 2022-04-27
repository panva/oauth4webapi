import anyTest, { type TestFn } from 'ava'
import setup, { type Context, teardown, issuer, getResponse, endpoint, client } from './_setup.js'
import * as lib from '../src/index.js'
import * as jose from 'jose'
import timekeeper from 'timekeeper'

const test = anyTest as TestFn<Context>

test.before(setup)
test.after(teardown)

test.serial('jwks_uri force refetch', async (t) => {
  const now = Date.now()
  timekeeper.freeze(now)

  let key = <CryptoKeyPair>await jose.generateKeyPair('ES256')

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
    userinfo_signing_alg_values_supported: ['ES256'],
  }
  const c: lib.Client = {
    ...client,
  }

  let jwt = await new jose.SignJWT({ sub: 'subject' })
    .setProtectedHeader({ alg: 'ES256' })
    .sign(key.privateKey)

  let response = getResponse(jwt, { headers: new Headers({ 'content-type': 'application/jwt' }) })

  await lib.processUserInfoResponse(as, c, lib.skipSubjectCheck, response)
  await lib.processUserInfoResponse(as, c, lib.skipSubjectCheck, response)

  timekeeper.travel(now + 299 * 1000)
  await lib.processUserInfoResponse(as, c, lib.skipSubjectCheck, response)
  timekeeper.travel(now + 300 * 1000)

  // re-fetch forced
  await t.throwsAsync(() => lib.processUserInfoResponse(as, c, lib.skipSubjectCheck, response))
})

test.serial('jwks_uri refetch if off cooldown and needed', async (t) => {
  const now = Date.now()
  timekeeper.freeze(now)

  let key = <CryptoKeyPair>await jose.generateKeyPair('ES256')

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
    userinfo_signing_alg_values_supported: ['ES256'],
  }
  const c: lib.Client = {
    ...client,
  }

  let jwt = await new jose.SignJWT({ sub: 'subject' })
    .setProtectedHeader({ alg: 'ES256', kid: 'foo' })
    .sign(key.privateKey)

  let response = getResponse(jwt, { headers: new Headers({ 'content-type': 'application/jwt' }) })

  await lib.processUserInfoResponse(as, c, lib.skipSubjectCheck, response)

  jwt = await new jose.SignJWT({ sub: 'subject' })
    .setProtectedHeader({ alg: 'ES256', kid: 'foo2' })
    .sign(key.privateKey)

  response = getResponse(jwt, { headers: new Headers({ 'content-type': 'application/jwt' }) })

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
  await t.throwsAsync(() => lib.processUserInfoResponse(as, c, lib.skipSubjectCheck, response), {
    message: 'error when selecting a JWT verification key, no applicable keys found',
  })
  timekeeper.travel(now + 59 * 1000)
  await t.throwsAsync(() => lib.processUserInfoResponse(as, c, lib.skipSubjectCheck, response), {
    message: 'error when selecting a JWT verification key, no applicable keys found',
  })

  timekeeper.travel(now + 60 * 1000)

  await t.notThrowsAsync(() => lib.processUserInfoResponse(as, c, lib.skipSubjectCheck, response))
})
