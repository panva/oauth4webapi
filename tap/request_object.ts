import type QUnit from 'qunit'
import * as lib from '../src/index.js'
import * as jose from 'jose'

const issuer = { issuer: 'https://op.example.com' }
const client = { client_id: 'client_id' }

const keys: Record<string, CryptoKeyPair> = {
  RS256: await lib.generateKeyPair('RS256'),
  PS256: await lib.generateKeyPair('PS256'),
  ES256: await lib.generateKeyPair('ES256'),
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
