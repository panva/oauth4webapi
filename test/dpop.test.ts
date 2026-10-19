import anyTest, { type TestFn } from 'ava'
import * as crypto from 'crypto'
import setup, { type Context, teardown, client } from './_setup.js'
import * as jose from 'jose'
import * as lib from './_lib.js'

const test = anyTest as TestFn<Context>

test.before(setup())
test.after(teardown)

test('dpop()', async (t) => {
  const kp = await lib.generateKeyPair('ES256')
  const publicJwk = await jose.exportJWK(kp.publicKey)

  t.context.mock
    .get('https://rs.example.com')
    .intercept({
      path: '/resource?foo',
      method: 'GET',
      headers: {
        authorization: 'DPoP token',
        dpop(dpop) {
          const { jwk, ...protectedHeader } = jose.decodeProtectedHeader(dpop)
          const { iat, jti, ath, ...claims } = jose.decodeJwt(dpop)
          t.deepEqual(protectedHeader, { alg: 'ES256', typ: 'dpop+jwt' })
          t.deepEqual(jwk, publicJwk)
          t.deepEqual(claims, { htu: 'https://rs.example.com/resource', htm: 'GET' })
          t.is(typeof iat, 'number')
          t.is(typeof jti, 'string')
          t.is(ath, crypto.createHash('sha256').update('token').digest('base64url'))
          return true
        },
      },
    })
    .reply(200, '')

  const sign = lib.DPoP(client, kp)
  const url = new URL('https://rs.example.com/resource?foo#bar')
  const response = await lib.protectedResourceRequest('token', 'GET', url, undefined, undefined, {
    DPoP: sign,
  })
  t.true(response instanceof lib.Response)
})

test('dpop() w/ a nonce', async (t) => {
  t.context.mock
    .get('https://rs2.example.com')
    .intercept({
      path: '/resource?foo',
      method: 'GET',
      headers: {
        dpop(dpop) {
          const { nonce } = jose.decodeJwt(dpop)
          t.is(nonce, undefined)
          return true
        },
      },
    })
    .reply(401, '', { headers: { 'DPoP-Nonce': 'foo' } })

  const url = new URL('https://rs2.example.com/resource?foo#bar')
  const sign = lib.DPoP(client, await lib.generateKeyPair('ES256'))
  await lib.protectedResourceRequest('token', 'GET', url, undefined, undefined, {
    DPoP: sign,
  })

  t.context.mock
    .get('https://rs2.example.com')
    .intercept({
      path: '/resource?foo',
      method: 'GET',
      headers: {
        dpop(dpop) {
          const { nonce } = jose.decodeJwt(dpop)
          t.is(nonce, 'foo')
          return true
        },
      },
    })
    .reply(200, '')

  await lib.protectedResourceRequest('token', 'GET', url, undefined, undefined, {
    DPoP: sign,
  })
})

test('externally formed dpop headers', async (t) => {
  t.context.mock
    .get('https://rs.example.com')
    .intercept({
      path: '/resource',
      method: 'GET',
      headers: {
        authorization: (actual) => t.is(actual, 'DPoP token'),
        dpop: (actual) => t.is(actual, 'foo'),
      },
    })
    .reply(200, '')

  const url = new URL('https://rs.example.com/resource')
  const response = await lib.protectedResourceRequest(
    'token',
    'GET',
    url,
    new Headers({ dpop: 'foo' }),
  )
  t.true(response instanceof lib.Response)
})

for (const challenge of [
  'DPoP error="use_dpop_nonce"',
  'Bearer, DPoP error="use_dpop_nonce"',
  'DPoP error="use_dpop_nonce", Bearer',
  String.raw`DPoP error="use_dpop_non\ce"`,
]) {
  test(`isDPoPNonceError() retries ${challenge}`, async (testContext) => {
    const DPoP = lib.DPoP(client, await lib.generateKeyPair('ES256'))
    const url = new URL('https://rs.example.com/nonce')
    let requests = 0
    const request = () =>
      lib.protectedResourceRequest('token', 'GET', url, undefined, undefined, {
        DPoP,
        [lib.customFetch]: async (_url, init) => {
          const proof = new Headers(init.headers).get('dpop')!
          const { nonce } = jose.decodeJwt(proof)
          if (++requests === 1) {
            testContext.is(nonce, undefined)
            return new Response(null, {
              status: 401,
              headers: {
                'www-authenticate': challenge,
                'dpop-nonce': 'server-nonce',
              },
            })
          }
          testContext.is(nonce, 'server-nonce')
          return new Response()
        },
      })

    const response = await request().catch((error) => {
      if (lib.isDPoPNonceError(error)) {
        return request()
      }
      throw error
    })

    testContext.is(response.status, 200)
    testContext.is(requests, 2)
  })
}

for (const challenge of [
  'Bearer error="use_dpop_nonce"',
  'Bearer, DPoP error="invalid_dpop_proof"',
]) {
  test(`isDPoPNonceError() ignores ${challenge}`, async (testContext) => {
    const error = await testContext.throwsAsync(
      lib.protectedResourceRequest(
        'token',
        'GET',
        new URL('https://rs.example.com/nonce'),
        undefined,
        undefined,
        {
          [lib.customFetch]: async () =>
            new Response(null, {
              status: 401,
              headers: { 'www-authenticate': challenge },
            }),
        },
      ),
      { instanceOf: lib.WWWAuthenticateChallengeError },
    )

    testContext.false(lib.isDPoPNonceError(error))
  })
}

test('external DPoP signer preserves proof binding and nonce retries', async (t) => {
  const keys = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
  const publicKey = await jose.importSPKI(
    keys.publicKey.export({ format: 'pem', type: 'spki' }).toString(),
    'ES256',
  )
  const DPoP = lib.DPoP(
    client,
    {
      publicKey,
      sign: async (input) =>
        crypto.sign('sha256', input, { key: keys.privateKey, dsaEncoding: 'ieee-p1363' }),
    },
    {
      [lib.modifyAssertion]: (_header, payload) => {
        payload.custom = 'value'
      },
    },
  )
  const proofs: string[] = []
  const request = () =>
    lib.protectedResourceRequest(
      'token',
      'GET',
      new URL('https://rs.example.com/resource?query#fragment'),
      undefined,
      undefined,
      {
        DPoP,
        [lib.customFetch]: async (_url, init) => {
          proofs.push(new Headers(init.headers).get('dpop')!)
          return proofs.length === 1
            ? new Response(null, {
                status: 401,
                headers: {
                  'www-authenticate': 'DPoP error="use_dpop_nonce"',
                  'dpop-nonce': 'server-nonce',
                },
              })
            : new Response()
        },
      },
    )

  const error = await t.throwsAsync(request(), { instanceOf: lib.WWWAuthenticateChallengeError })
  t.true(lib.isDPoPNonceError(error))
  t.is((await request()).status, 200)

  const first = await jose.jwtVerify(proofs[0], publicKey)
  const second = await jose.jwtVerify(proofs[1], publicKey)
  t.deepEqual(second.protectedHeader, {
    typ: 'dpop+jwt',
    alg: 'ES256',
    jwk: keys.publicKey.export({ format: 'jwk' }),
  })
  const { jti, iat, ...claims } = second.payload
  t.deepEqual(claims, {
    htu: 'https://rs.example.com/resource',
    htm: 'GET',
    nonce: 'server-nonce',
    custom: 'value',
    ath: crypto.createHash('sha256').update('token').digest('base64url'),
  })
  t.is(typeof iat, 'number')
  t.is(typeof jti, 'string')
  t.not(jti, first.payload.jti)
  t.is(first.payload.nonce, undefined)
  t.is(
    await DPoP.calculateThumbprint(),
    await jose.calculateJwkThumbprint(second.protectedHeader.jwk!),
  )
})

for (const failure of ['throw', 'reject']) {
  test(`external DPoP signer ${failure} prevents sending a request`, async (t) => {
    const { publicKey } = await lib.generateKeyPair('ES256')
    const error = new Error('signing unavailable')
    const DPoP = lib.DPoP(client, {
      publicKey,
      sign: () => {
        if (failure === 'throw') throw error
        return Promise.reject(error)
      },
    })
    let sent = false

    await t.throwsAsync(
      lib.protectedResourceRequest(
        'token',
        'GET',
        new URL('https://rs.example.com/resource'),
        undefined,
        undefined,
        {
          DPoP,
          [lib.customFetch]: async () => {
            sent = true
            return new Response()
          },
        },
      ),
      { is: error },
    )
    t.false(sent)
  })
}
