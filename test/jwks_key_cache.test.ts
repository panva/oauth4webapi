import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'

import * as jose from 'jose'
import timekeeper from 'timekeeper'
import setup, { client, endpoint, getResponse, issuer, teardown, type Context } from './_setup.js'
import * as lib from './_lib.js'
import { mangleJwtSignature } from './_tools.js'

const context = {} as Context

before(() => setup(context))
after(() => teardown(context))

async function fixture(alg = 'ES256') {
  const keyPair = await lib.generateKeyPair(alg, { extractable: true })
  const as: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks-key-cache'),
    authorization_signing_alg_values_supported: [alg, 'PS256'],
  }
  const jwks = { keys: [await jose.exportJWK(keyPair.publicKey)] }
  let requests = 0
  const options: lib.ValidateSignatureOptions = {
    [lib.customFetch]: async () => {
      requests++
      return getResponse(JSON.stringify(jwks))
    },
  }
  return {
    keyPair,
    jwks,
    requests: () => requests,
    sign: (privateKey = keyPair.privateKey, algorithm = alg) =>
      new jose.SignJWT({ code: 'code' })
        .setProtectedHeader({ alg: algorithm })
        .setAudience(client.client_id)
        .setIssuer(as.issuer)
        .setExpirationTime('10m')
        .sign(privateKey),
    validate: (jwt: string, cache?: lib.JWKSCacheInput) =>
      lib.validateJwtAuthResponse(as, client, new URLSearchParams({ response: jwt }), undefined, {
        ...options,
        [lib.jwksCache]: cache,
      }),
  }
}

async function verificationKey(verify: () => Promise<unknown>): Promise<lib.CryptoKey> {
  try {
    await verify()
  } catch (error) {
    if (
      error instanceof lib.OperationProcessingError &&
      error.message === 'JWT signature verification failed'
    ) {
      return (error.cause as { key: lib.CryptoKey }).key
    }
    throw error
  }
  throw new Error('expected signature verification to fail')
}

test('issuer verification keys are shared across concurrent and repeated validations', async () => {
  const context = await fixture()
  const token = await context.sign()
  const invalid = mangleJwtSignature(token)
  const cache: lib.JWKSCacheInput = {}
  const keys = await Promise.all(
    Array.from({ length: 8 }, () => verificationKey(() => context.validate(invalid, cache))),
  )

  assert.strictEqual(context.requests(), 1)
  assert.strictEqual(keys[0].type, 'public')
  for (const key of keys) {
    assert.strictEqual(key, keys[0])
  }
  assert.strictEqual(await verificationKey(() => context.validate(invalid)), keys[0])
  assert.strictEqual((await context.validate(token)).get('code'), 'code')
  assert.deepStrictEqual(cache.jwks, context.jwks)
  assert.deepStrictEqual(JSON.parse(JSON.stringify(cache)), cache)
})

test('the same RSA JWK is cached separately for each signing algorithm', async () => {
  const context = await fixture('RS256')
  const privateJwk = await jose.exportJWK(context.keyPair.privateKey)
  const pssKey = await jose.importJWK(privateJwk, 'PS256')
  const rsaToken = await context.sign()
  const pssToken = await context.sign(pssKey as CryptoKey, 'PS256')
  const rsaInvalid = mangleJwtSignature(rsaToken)
  const pssInvalid = mangleJwtSignature(pssToken)
  const rsaPublic = await verificationKey(() => context.validate(rsaInvalid))
  const pssPublic = await verificationKey(() => context.validate(pssInvalid))

  assert.notStrictEqual(rsaPublic, pssPublic)
  assert.strictEqual(rsaPublic.algorithm.name, 'RSASSA-PKCS1-v1_5')
  assert.strictEqual(pssPublic.algorithm.name, 'RSA-PSS')
  assert.strictEqual(await verificationKey(() => context.validate(rsaInvalid)), rsaPublic)
  assert.strictEqual(await verificationKey(() => context.validate(pssInvalid)), pssPublic)
  await assert.doesNotReject(context.validate(rsaToken))
  await assert.doesNotReject(context.validate(pssToken))
  assert.strictEqual(context.requests(), 1)
})

test('failed JWK imports are not cached', async () => {
  const context = await fixture()
  const token = await context.sign()
  const jwk = { ...context.jwks.keys[0], x: 'invalid' }
  const cache: lib.ExportedJWKSCache = {
    uat: Math.floor(Date.now() / 1000),
    jwks: { keys: [jwk] },
  }

  await assert.rejects(context.validate(token, cache), (error) => {
    assert.ok(error instanceof DOMException)
    assert.strictEqual(error.name, 'DataError')
    return true
  })
  jwk.x = context.jwks.keys[0].x!
  await assert.doesNotReject(context.validate(token, cache))
  assert.strictEqual(context.requests(), 0)
})

test('refreshing JWKS replaces cached verification keys', async (testContext) => {
  const now = Date.now()
  timekeeper.freeze(now)
  testContext.after(() => timekeeper.reset())
  const context = await fixture()
  const originalToken = await context.sign()
  const originalKey = await verificationKey(() =>
    context.validate(mangleJwtSignature(originalToken)),
  )

  const rotated = await lib.generateKeyPair('ES256')
  context.jwks.keys = [await jose.exportJWK(rotated.publicKey)]
  timekeeper.travel(now + 300_000)
  const rotatedToken = await context.sign(rotated.privateKey)
  const rotatedKey = await verificationKey(() => context.validate(mangleJwtSignature(rotatedToken)))

  assert.notStrictEqual(rotatedKey, originalKey)
  assert.strictEqual(context.requests(), 2)
  await assert.doesNotReject(context.validate(rotatedToken))
  await assert.rejects(context.validate(originalToken), {
    message: 'JWT signature verification failed',
  })
})
