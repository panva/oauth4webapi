import type QUnit from 'qunit'
import * as lib from '../src/index.js'
import * as jose from 'jose'

const issuer = { issuer: 'https://op.example.com' }
const client = { client_id: 'client_id' }
const rsa = {
  hash: { name: 'SHA-256' },
  modulusLength: 2048,
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
}
const usages: KeyUsage[] = ['sign', 'verify']

const keys: Record<string, CryptoKeyPair> = {
  RS256: await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      ...rsa,
    },
    false,
    usages,
  ),
  PS256: await crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      ...rsa,
    },
    false,
    usages,
  ),
  ES256: await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, usages),
}

// @ts-ignore
if (typeof Deno !== 'undefined' || typeof process !== 'undefined') {
  keys.EdDSA = <CryptoKeyPair>await crypto.subtle.generateKey({ name: 'Ed25519' }, false, usages)
}

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('request_object.ts')

  test('issueRequestObject()', async (t) => {
    const kp = keys.ES256
    const jwt = await lib.issueRequestObject(
      issuer,
      client,
      new URLSearchParams({ response_type: 'code', resource: 'urn:example:resource' }),
      { key: kp.privateKey },
    )

    const { payload, protectedHeader } = await jose.jwtVerify(jwt, kp.publicKey)
    t.propEqual(protectedHeader, { alg: 'ES256', typ: 'oauth-authz-req+jwt' })
    const { exp, iat, nbf, jti, ...claims } = payload
    t.equal(typeof exp, 'number')
    t.equal(typeof nbf, 'number')
    t.equal(typeof iat, 'number')
    t.equal(typeof jti, 'string')
    t.propEqual(claims, {
      iss: client.client_id,
      aud: issuer.issuer,
      response_type: 'code',
      resource: 'urn:example:resource',
      client_id: client.client_id,
    })
  })

  test('issueRequestObject() - multiple resource parameters', async (t) => {
    const kp = keys.ES256
    const jwt = await lib.issueRequestObject(
      issuer,
      client,
      new URLSearchParams([
        ['resource', 'urn:example:resource'],
        ['resource', 'urn:example:resource-2'],
      ]),
      { key: kp.privateKey },
    )

    const { payload, protectedHeader } = await jose.jwtVerify(jwt, kp.publicKey)
    t.propEqual(protectedHeader, { alg: 'ES256', typ: 'oauth-authz-req+jwt' })
    const { resource } = payload
    t.propEqual(resource, ['urn:example:resource', 'urn:example:resource-2'])
  })

  for (const alg of Object.keys(keys)) {
    test(`issueRequestObject() signed using ${alg}`, async (t) => {
      const kp = keys[alg]
      const jwt = await lib.issueRequestObject(issuer, client, new URLSearchParams(), {
        key: kp.privateKey,
      })
      const protectedHeader = jose.decodeProtectedHeader(jwt)
      t.equal(protectedHeader.alg, alg)
    })
  }

  test('issueRequestObject() signature kid', async (t) => {
    const kp = keys.ES256
    const jwt = await lib.issueRequestObject(issuer, client, new URLSearchParams(), {
      key: kp.privateKey,
      kid: 'kid-1',
    })
    const protectedHeader = jose.decodeProtectedHeader(jwt)
    t.equal(protectedHeader.kid, 'kid-1')
  })
}
