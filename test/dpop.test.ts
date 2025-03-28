import anyTest, { type TestFn } from 'ava'
import * as crypto from 'crypto'
import setup, { type Context, teardown, client } from './_setup.js'
import * as jose from 'jose'
import * as lib from '../src/index.js'

const test = anyTest as TestFn<Context>

test.before(setup)
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
  t.true(response instanceof Response)
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
  t.true(response instanceof Response)
})
