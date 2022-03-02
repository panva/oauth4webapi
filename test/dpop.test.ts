import anyTest, { type TestFn } from 'ava'
import * as crypto from 'crypto'
import setup, { type Context, teardown } from './_setup.js'
import * as jose from 'jose'
import * as lib from '../src/index.js'

const test = anyTest as TestFn<Context>

test.before(setup)
test.after(teardown)

test('dpop()', async (t) => {
  const sign = <CryptoKeyPair>await jose.generateKeyPair('ES256')
  const publicJwk = await jose.exportJWK(sign.publicKey)

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
        'user-agent': 'uatbd',
      },
    })
    .reply(200, '')

  const url = new URL('https://rs.example.com/resource?foo#bar')
  const response = await lib.protectedResourceRequest('token', 'GET', url, new Headers(), null, {
    DPoP: sign,
  })
  t.true(response instanceof Response)
})

test('dpop() w/ a nonce', async (t) => {
  const sign = <CryptoKeyPair>await jose.generateKeyPair('ES256')

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
  await lib.protectedResourceRequest('token', 'GET', url, new Headers(), null, {
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

  await lib.protectedResourceRequest('token', 'GET', url, new Headers(), null, {
    DPoP: sign,
  })
})
