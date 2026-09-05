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
import { mangleJwtSignature } from './_tools.js'

const test = anyTest as TestFn<ContextWithAlgs>

test.before(setup())
test.before(setupJwks)
test.after(teardown)

const as: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }
const jwtClient: lib.Client = { ...client, id_token_signed_response_alg: 'ES256' }
const invalidStrings = [undefined, null, 42, false, [], {}]
const codeHash = createHash('sha256').update('code').digest().subarray(0, 16).toString('base64url')

async function idToken(
  privateKey: CryptoKey,
  subject: unknown,
  hybrid = false,
  claims: jose.JWTPayload = {},
) {
  const now = Math.floor(Date.now() / 1000)
  return new jose.SignJWT({
    iss: as.issuer,
    aud: client.client_id,
    sub: subject as string,
    iat: now,
    exp: now + 300,
    nonce: hybrid ? 'nonce' : undefined,
    c_hash: hybrid ? codeHash : undefined,
    ...claims,
  })
    .setProtectedHeader({ alg: 'ES256' })
    .sign(privateKey)
}

function tokenResponse(id_token: string) {
  return getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer', id_token }))
}

for (const process of [
  lib.processAuthorizationCodeResponse,
  lib.processRefreshTokenResponse,
  lib.processDeviceCodeResponse,
  lib.processBackchannelAuthenticationGrantResponse,
  lib.processClientCredentialsResponse,
  lib.processGenericTokenEndpointResponse,
]) {
  test(`${process.name}() validates required ID Token claims`, async (testContext) => {
    for (const subject of invalidStrings) {
      const token = await idToken(testContext.context.ES256.privateKey, subject)
      await testContext.throwsAsync(process(as, jwtClient, tokenResponse(token)), {
        code: lib.INVALID_RESPONSE,
        message:
          subject === undefined
            ? 'JWT "sub" (subject) claim missing'
            : 'unexpected JWT "sub" (subject) claim type',
      })
    }

    for (const claim of ['aud', 'exp', 'iat', 'iss', 'sub']) {
      const token = await idToken(testContext.context.ES256.privateKey, 'subject', false, {
        [claim]: undefined,
      })
      await testContext.throwsAsync(process(as, jwtClient, tokenResponse(token)), {
        code: lib.INVALID_RESPONSE,
        message: new RegExp(`^JWT "${claim}" .* claim missing$`),
      })
    }

    const token = await idToken(testContext.context.ES256.privateKey, 'subject')
    const result = await process(as, jwtClient, tokenResponse(token))
    testContext.is(lib.getValidatedIdTokenClaims(result)?.sub, 'subject')
  })
}

for (const [name, validate] of [
  ['code id_token', lib.validateCodeIdTokenResponse],
  ['detached signature', lib.validateDetachedSignatureResponse],
] as const) {
  test(`${name} validates required ID Token claims`, async (testContext) => {
    for (const subject of invalidStrings) {
      const token = await idToken(testContext.context.ES256.privateKey, subject, true)
      await testContext.throwsAsync(
        validate(as, jwtClient, new URLSearchParams({ code: 'code', id_token: token }), 'nonce'),
        {
          code: lib.INVALID_RESPONSE,
          message:
            subject === undefined
              ? 'JWT "sub" (subject) claim missing'
              : 'unexpected JWT "sub" (subject) claim type',
        },
      )
    }

    for (const claim of ['aud', 'exp', 'iat', 'iss', 'sub', 'nonce', 'c_hash']) {
      const token = await idToken(testContext.context.ES256.privateKey, 'subject', true, {
        [claim]: undefined,
      })
      await testContext.throwsAsync(
        validate(as, jwtClient, new URLSearchParams({ code: 'code', id_token: token }), 'nonce'),
        {
          code: lib.INVALID_RESPONSE,
          message: new RegExp(`^JWT "${claim}" .* claim missing$`),
        },
      )
    }

    const token = await idToken(testContext.context.ES256.privateKey, 'subject', true)
    const result = await validate(
      as,
      jwtClient,
      new URLSearchParams({ code: 'code', id_token: token }),
      'nonce',
    )
    testContext.is(result.get('code'), 'code')
  })

  test(`${name} ID Token policy checks`, async (testContext) => {
    const privateKey = testContext.context.ES256.privateKey
    const validateClaims = async (claims: jose.JWTPayload) => {
      const token = await idToken(privateKey, 'subject', true, claims)
      return validate(
        as,
        jwtClient,
        new URLSearchParams({ code: 'code', id_token: token }),
        'nonce',
      )
    }

    await testContext.throwsAsync(validateClaims({ nonce: 'other' }), {
      message: 'unexpected ID Token "nonce" claim value',
    })
    await testContext.throwsAsync(validateClaims({ auth_time: 'invalid' }), {
      message: 'ID Token "auth_time" (authentication time) must be a number',
    })
    await testContext.throwsAsync(
      validateClaims({ aud: [client.client_id, 'other'], azp: 'other' }),
      { message: 'unexpected ID Token "azp" (authorized party) claim value' },
    )
    await testContext.notThrowsAsync(
      validateClaims({ aud: [client.client_id, 'other'], azp: client.client_id }),
    )

    const token = await idToken(privateKey, 'subject', true)
    await testContext.throwsAsync(
      validate(
        as,
        jwtClient,
        new URLSearchParams({ code: 'code', id_token: mangleJwtSignature(token) }),
        'nonce',
      ),
      { message: 'JWT signature verification failed' },
    )
    if (validate === lib.validateDetachedSignatureResponse) {
      await testContext.throwsAsync(
        validate(
          as,
          jwtClient,
          new URLSearchParams({ code: 'code', id_token: token, state: 'state' }),
          'nonce',
          'state',
        ),
        { message: 'JWT "s_hash" (state hash) claim missing' },
      )
    }
  })
}

test('DPoP proofs require string jti claims', async (testContext) => {
  const proofKey = await lib.generateKeyPair('ES256')
  const proofJwk = await jose.exportJWK(proofKey.publicKey)
  const now = Math.floor(Date.now() / 1000)
  const accessToken = await new jose.SignJWT({
    iss: as.issuer,
    exp: now + 300,
    aud: 'https://rs.example.com',
    sub: 'subject',
    iat: now,
    jti: 'token',
    client_id: client.client_id,
    cnf: { jkt: await jose.calculateJwkThumbprint(proofJwk) },
  })
    .setProtectedHeader({ alg: 'ES256', typ: 'at+jwt' })
    .sign(testContext.context.ES256.privateKey)

  const validate = async (jti: unknown) => {
    const proof = await new jose.SignJWT({
      iat: now,
      jti: jti as string,
      htm: 'GET',
      htu: 'https://rs.example.com/resource',
      ath: createHash('sha256').update(accessToken).digest('base64url'),
    })
      .setProtectedHeader({ alg: 'ES256', typ: 'dpop+jwt', jwk: proofJwk })
      .sign(proofKey.privateKey)

    return lib.validateJwtAccessToken(
      as,
      new Request('https://rs.example.com/resource', {
        headers: { authorization: `DPoP ${accessToken}`, dpop: proof },
      }),
      'https://rs.example.com',
    )
  }

  for (const jti of invalidStrings) {
    await testContext.throwsAsync(validate(jti), {
      code: lib.INVALID_RESPONSE,
      message:
        jti === undefined
          ? 'JWT "jti" (jwt id) claim missing'
          : 'unexpected JWT "jti" (jwt id) claim type',
    })
  }
  testContext.is((await validate('proof')).sub, 'subject')
})
