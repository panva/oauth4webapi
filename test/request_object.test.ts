import anyTest, { type TestFn } from 'ava'
import { client, issuer } from './_setup.js'
import * as jose from 'jose'

import * as lib from '../src/index.js'

const test = anyTest as TestFn<{ [alg: string]: CryptoKeyPair }>

const algs: lib.JWSAlgorithm[] = ['RS256', 'ES256', 'PS256', 'EdDSA']

test.before(async (t) => {
  for (const alg of algs) {
    const key = await lib.generateKeyPair(alg)
    t.context[alg] = key
  }
})

test('issueRequestObject()', async (t) => {
  const sign = t.context.ES256
  const jwt = await lib.issueRequestObject(
    issuer,
    client,
    new URLSearchParams({ response_type: 'code', resource: 'urn:example:resource' }),
    { key: sign.privateKey },
  )

  const { payload, protectedHeader } = await jose.jwtVerify(jwt, sign.publicKey)
  t.deepEqual(protectedHeader, { alg: 'ES256', typ: 'oauth-authz-req+jwt' })
  const { exp, iat, nbf, jti, ...claims } = payload
  t.is(typeof exp, 'number')
  t.is(typeof nbf, 'number')
  t.is(typeof iat, 'number')
  t.is(typeof jti, 'string')
  t.deepEqual(claims, {
    iss: client.client_id,
    aud: issuer.issuer,
    response_type: 'code',
    resource: 'urn:example:resource',
    client_id: client.client_id,
  })
})

test('issueRequestObject() - multiple resource parameters', async (t) => {
  const sign = t.context.ES256
  const jwt = await lib.issueRequestObject(
    issuer,
    client,
    new URLSearchParams([
      ['resource', 'urn:example:resource'],
      ['resource', 'urn:example:resource-2'],
    ]),
    { key: sign.privateKey },
  )

  const { payload, protectedHeader } = await jose.jwtVerify(jwt, sign.publicKey)
  t.deepEqual(protectedHeader, { alg: 'ES256', typ: 'oauth-authz-req+jwt' })
  const { resource } = payload
  t.deepEqual(resource, ['urn:example:resource', 'urn:example:resource-2'])
})

for (const alg of algs) {
  test(`issueRequestObject() signed using ${alg}`, async (t) => {
    const sign = t.context[alg]
    const jwt = await lib.issueRequestObject(issuer, client, new URLSearchParams(), {
      key: sign.privateKey,
    })
    const protectedHeader = jose.decodeProtectedHeader(jwt)
    t.is(protectedHeader.alg, alg)
  })
}

test('issueRequestObject() signature kid', async (t) => {
  const sign = t.context.ES256
  const jwt = await lib.issueRequestObject(issuer, client, new URLSearchParams(), {
    key: sign.privateKey,
    kid: 'kid-1',
  })
  const protectedHeader = jose.decodeProtectedHeader(jwt)
  t.is(protectedHeader.kid, 'kid-1')
})
