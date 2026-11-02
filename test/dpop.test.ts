import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { captureRejection } from './_errors.js'

import * as crypto from 'crypto'
import setup, { type Context, teardown, client } from './_setup.js'
import * as jose from 'jose'
import * as lib from './_lib.js'

const context = {} as Context

before(() => setup(context))
after(() => teardown(context))

test('dpop()', async () => {
  const kp = await lib.generateKeyPair('ES256')
  const publicJwk = await jose.exportJWK(kp.publicKey)

  context.mock
    .get('https://rs.example.com')
    .intercept({
      path: '/resource?foo',
      method: 'GET',
      headers: {
        authorization: 'DPoP token',
        dpop(dpop) {
          const { jwk, ...protectedHeader } = jose.decodeProtectedHeader(dpop)
          const { iat, jti, ath, ...claims } = jose.decodeJwt(dpop)
          assert.deepStrictEqual(protectedHeader, { alg: 'ES256', typ: 'dpop+jwt' })
          assert.deepStrictEqual(jwk, publicJwk)
          assert.deepStrictEqual(claims, { htu: 'https://rs.example.com/resource', htm: 'GET' })
          assert.strictEqual(typeof iat, 'number')
          assert.strictEqual(typeof jti, 'string')
          assert.strictEqual(ath, crypto.createHash('sha256').update('token').digest('base64url'))
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
  assert.strictEqual(response instanceof lib.Response, true)
})

test('dpop() w/ a nonce', async () => {
  context.mock
    .get('https://rs2.example.com')
    .intercept({
      path: '/resource?foo',
      method: 'GET',
      headers: {
        dpop(dpop) {
          const { nonce } = jose.decodeJwt(dpop)
          assert.strictEqual(nonce, undefined)
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

  context.mock
    .get('https://rs2.example.com')
    .intercept({
      path: '/resource?foo',
      method: 'GET',
      headers: {
        dpop(dpop) {
          const { nonce } = jose.decodeJwt(dpop)
          assert.strictEqual(nonce, 'foo')
          return true
        },
      },
    })
    .reply(200, '')

  await lib.protectedResourceRequest('token', 'GET', url, undefined, undefined, {
    DPoP: sign,
  })
})

test('externally formed dpop headers', async () => {
  context.mock
    .get('https://rs.example.com')
    .intercept({
      path: '/resource',
      method: 'GET',
      headers: {
        authorization: (actual) => {
          assert.strictEqual(actual, 'DPoP token')
          return true
        },
        dpop: (actual) => {
          assert.strictEqual(actual, 'foo')
          return true
        },
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
  assert.strictEqual(response instanceof lib.Response, true)
})

for (const challenge of [
  'DPoP error="use_dpop_nonce"',
  'Bearer, DPoP error="use_dpop_nonce"',
  'DPoP error="use_dpop_nonce", Bearer',
  String.raw`DPoP error="use_dpop_non\ce"`,
]) {
  test(`isDPoPNonceError() retries ${challenge}`, async () => {
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
            assert.strictEqual(nonce, undefined)
            return new Response(null, {
              status: 401,
              headers: {
                'www-authenticate': challenge,
                'dpop-nonce': 'server-nonce',
              },
            })
          }
          assert.strictEqual(nonce, 'server-nonce')
          return new Response()
        },
      })

    const response = await request().catch((error) => {
      if (lib.isDPoPNonceError(error)) {
        return request()
      }
      throw error
    })

    assert.strictEqual(response.status, 200)
    assert.strictEqual(requests, 2)
  })
}

for (const challenge of [
  'Bearer error="use_dpop_nonce"',
  'Bearer, DPoP error="invalid_dpop_proof"',
]) {
  test(`isDPoPNonceError() ignores ${challenge}`, async () => {
    const error = await captureRejection(
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
      (error) => {
        assert.ok(error instanceof lib.WWWAuthenticateChallengeError)
        return true
      },
    )

    assert.strictEqual(lib.isDPoPNonceError(error), false)
  })
}
