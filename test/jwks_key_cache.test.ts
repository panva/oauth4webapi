import anyTest, { type TestFn } from 'ava'
import * as jose from 'jose'
import timekeeper from 'timekeeper'
import setup, { client, endpoint, getResponse, issuer, teardown, type Context } from './_setup.js'
import * as lib from './_lib.js'
import { mangleJwtSignature } from './_tools.js'

const test = anyTest as TestFn<Context>

test.before(setup())
test.after(teardown)

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

test('issuer verification keys are shared across concurrent and repeated validations', async (testContext) => {
  const context = await fixture()
  const token = await context.sign()
  const invalid = mangleJwtSignature(token)
  const cache: lib.JWKSCacheInput = {}
  const keys = await Promise.all(
    Array.from({ length: 8 }, () => verificationKey(() => context.validate(invalid, cache))),
  )

  testContext.is(context.requests(), 1)
  testContext.is(keys[0].type, 'public')
  for (const key of keys) {
    testContext.is(key, keys[0])
  }
  testContext.is(await verificationKey(() => context.validate(invalid)), keys[0])
  testContext.is((await context.validate(token)).get('code'), 'code')
  testContext.deepEqual(cache.jwks, context.jwks)
  testContext.deepEqual(JSON.parse(JSON.stringify(cache)), cache)
})

test('the same RSA JWK is cached separately for each signing algorithm', async (testContext) => {
  const context = await fixture('RS256')
  const privateJwk = await jose.exportJWK(context.keyPair.privateKey)
  const pssKey = await jose.importJWK(privateJwk, 'PS256')
  const rsaToken = await context.sign()
  const pssToken = await context.sign(pssKey as CryptoKey, 'PS256')
  const rsaInvalid = mangleJwtSignature(rsaToken)
  const pssInvalid = mangleJwtSignature(pssToken)
  const rsaPublic = await verificationKey(() => context.validate(rsaInvalid))
  const pssPublic = await verificationKey(() => context.validate(pssInvalid))

  testContext.not(rsaPublic, pssPublic)
  testContext.is(rsaPublic.algorithm.name, 'RSASSA-PKCS1-v1_5')
  testContext.is(pssPublic.algorithm.name, 'RSA-PSS')
  testContext.is(await verificationKey(() => context.validate(rsaInvalid)), rsaPublic)
  testContext.is(await verificationKey(() => context.validate(pssInvalid)), pssPublic)
  await testContext.notThrowsAsync(context.validate(rsaToken))
  await testContext.notThrowsAsync(context.validate(pssToken))
  testContext.is(context.requests(), 1)
})

test('failed JWK imports are not cached', async (testContext) => {
  const context = await fixture()
  const token = await context.sign()
  const jwk = { ...context.jwks.keys[0], x: 'invalid' }
  const cache: lib.ExportedJWKSCache = {
    uat: Math.floor(Date.now() / 1000),
    jwks: { keys: [jwk] },
  }

  await testContext.throwsAsync(context.validate(token, cache))
  jwk.x = context.jwks.keys[0].x!
  await testContext.notThrowsAsync(context.validate(token, cache))
  testContext.is(context.requests(), 0)
})

test.serial('refreshing JWKS replaces cached verification keys', async (testContext) => {
  const now = Date.now()
  timekeeper.freeze(now)
  testContext.teardown(() => timekeeper.reset())
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

  testContext.not(rotatedKey, originalKey)
  testContext.is(context.requests(), 2)
  await testContext.notThrowsAsync(context.validate(rotatedToken))
  await testContext.throwsAsync(context.validate(originalToken), {
    message: 'JWT signature verification failed',
  })
})
