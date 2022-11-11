import type QUnit from 'qunit'
import * as lib from '../src/index.js'
import * as jose from 'jose'

const issuer = { issuer: 'https://op.example.com' }
const client = { client_id: 'client_id' }
import { keys } from './keys.js'

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('request_object.ts')

  for (const [alg, kp] of Object.entries(keys)) {
    test(`issueRequestObject() - ${alg}`, async (t) => {
      const { privateKey, publicKey } = await kp
      const jwt = await lib.issueRequestObject(
        issuer,
        client,
        new URLSearchParams({ response_type: 'code', resource: 'urn:example:resource' }),
        { key: privateKey },
      )

      const { payload, protectedHeader } = await jose.jwtVerify(jwt, publicKey)
      t.propEqual(protectedHeader, { alg, typ: 'oauth-authz-req+jwt' })
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
  }

  test('issueRequestObject() - multiple resource parameters', async (t) => {
    const kp = await keys.ES256
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

  test('issueRequestObject() signature kid', async (t) => {
    const kp = await keys.ES256
    const jwt = await lib.issueRequestObject(issuer, client, new URLSearchParams(), {
      key: kp.privateKey,
      kid: 'kid-1',
    })
    const protectedHeader = jose.decodeProtectedHeader(jwt)
    t.equal(protectedHeader.kid, 'kid-1')
  })
}
