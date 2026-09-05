import { createHash } from 'node:crypto'
import anyTest, { type TestFn } from 'ava'
import * as jose from 'jose'
import setup, {
  client,
  endpoint,
  getResponse,
  issuer,
  setupJwks,
  teardown,
  type ContextWithAlgs,
} from './_setup.js'
import * as lib from './_lib.js'

const test = anyTest as TestFn<ContextWithAlgs>

test.before(setup())
test.before(setupJwks)
test.after(teardown)

const as: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }
const ageClient: lib.Client = {
  ...client,
  id_token_signed_response_alg: 'ES256',
  default_max_age: 60,
}

async function idToken(privateKey: CryptoKey, claims: jose.JWTPayload = {}) {
  const now = Math.floor(Date.now() / 1000)
  return new jose.SignJWT({
    iss: as.issuer,
    aud: client.client_id,
    sub: 'subject',
    iat: now,
    exp: now + 300,
    auth_time: now - 7200,
    ...claims,
  })
    .setProtectedHeader({ alg: 'ES256' })
    .sign(privateKey)
}

function tokenResponse(id_token?: string) {
  return getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer', id_token }))
}

for (const options of [
  {},
  { requireIdToken: true },
  { expectedNonce: 'nonce' },
] satisfies lib.ProcessAuthorizationCodeResponseOptions[]) {
  test(`authorization code auth_time with ${JSON.stringify(options)}`, async (testContext) => {
    const token = await idToken(testContext.context.ES256.privateKey, {
      nonce: options.expectedNonce,
    })

    await testContext.throwsAsync(
      lib.processAuthorizationCodeResponse(as, ageClient, tokenResponse(token), options),
      { code: lib.JWT_TIMESTAMP_CHECK },
    )
    await testContext.notThrowsAsync(
      lib.processAuthorizationCodeResponse(as, ageClient, tokenResponse(token), {
        ...options,
        maxAge: lib.skipAuthTimeCheck,
      }),
    )
    await testContext.throwsAsync(
      lib.processAuthorizationCodeResponse(as, ageClient, tokenResponse(token), {
        ...options,
        maxAge: 0,
      }),
      { code: lib.JWT_TIMESTAMP_CHECK },
    )
  })
}

test('skipping auth_time does not require an optional ID Token', async (testContext) => {
  await testContext.notThrowsAsync(
    lib.processAuthorizationCodeResponse(as, ageClient, tokenResponse(), {
      maxAge: lib.skipAuthTimeCheck,
    }),
  )
  await testContext.throwsAsync(
    lib.processAuthorizationCodeResponse(as, ageClient, tokenResponse(), {
      maxAge: lib.skipAuthTimeCheck,
      requireIdToken: true,
    }),
    { code: lib.INVALID_RESPONSE },
  )
})

test('skipping auth_time still enforces require_auth_time', async (testContext) => {
  const token = await idToken(testContext.context.ES256.privateKey, { auth_time: undefined })
  await testContext.throwsAsync(
    lib.processAuthorizationCodeResponse(
      as,
      { ...ageClient, default_max_age: undefined, require_auth_time: true },
      tokenResponse(token),
      { maxAge: lib.skipAuthTimeCheck },
    ),
    { message: 'JWT "auth_time" (authentication time) claim missing' },
  )
})

for (const [name, validate] of [
  ['code id_token', lib.validateCodeIdTokenResponse],
  ['detached signature', lib.validateDetachedSignatureResponse],
] as const) {
  test(`${name} rejects invalid maxAge values`, async (testContext) => {
    const token = await idToken(testContext.context.ES256.privateKey, {
      nonce: 'nonce',
      c_hash: 'hash',
    })
    const parameters = new URLSearchParams({ code: 'code', id_token: token })
    for (const maxAge of [null, '60', -1, NaN, Infinity]) {
      await testContext.throwsAsync(
        validate(as, ageClient, parameters, 'nonce', undefined, maxAge as number),
        {
          instanceOf: TypeError,
          message: /"maxAge" argument must be (?:a number|a non-negative number)/,
        },
      )
    }
  })

  test(`${name} auth_time defaults and explicit skip`, async (testContext) => {
    const code = 'code'
    const token = await idToken(testContext.context.ES256.privateKey, {
      nonce: 'nonce',
      c_hash: createHash('sha256').update(code).digest().subarray(0, 16).toString('base64url'),
    })
    const parameters = new URLSearchParams({ code, id_token: token })

    await testContext.throwsAsync(validate(as, ageClient, parameters, 'nonce'), {
      code: lib.JWT_TIMESTAMP_CHECK,
    })
    await testContext.notThrowsAsync(
      validate(as, ageClient, parameters, 'nonce', undefined, lib.skipAuthTimeCheck),
    )
    await testContext.throwsAsync(validate(as, ageClient, parameters, 'nonce', undefined, 0), {
      code: lib.JWT_TIMESTAMP_CHECK,
    })
  })

  test(`${name} explicit skip still enforces require_auth_time`, async (testContext) => {
    const token = await idToken(testContext.context.ES256.privateKey, {
      auth_time: undefined,
      nonce: 'nonce',
      c_hash: 'hash',
    })
    await testContext.throwsAsync(
      validate(
        as,
        { ...ageClient, default_max_age: undefined, require_auth_time: true },
        new URLSearchParams({ code: 'code', id_token: token }),
        'nonce',
        undefined,
        lib.skipAuthTimeCheck,
      ),
      { message: 'JWT "auth_time" (authentication time) claim missing' },
    )
  })
}
