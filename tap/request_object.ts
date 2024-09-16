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
    test(`issueRequestObject() w/ ${alg}`, async (t) => {
      const { privateKey, publicKey } = await kp
      for (const parameters of [
        new URLSearchParams({ response_type: 'code', resource: 'urn:example:resource' }),
        { response_type: 'code', resource: 'urn:example:resource' },
        [
          ['response_type', 'code'],
          ['resource', 'urn:example:resource'],
        ],
      ]) {
        const jwt = await lib.issueRequestObject(issuer, client, parameters, { key: privateKey })

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
      }
    })
  }

  test('issueRequestObject() multiple resource parameters', async (t) => {
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

    const { payload } = await jose.jwtVerify(jwt, kp.publicKey)
    const { resource } = payload
    t.propEqual(resource, ['urn:example:resource', 'urn:example:resource-2'])
  })

  test('issueRequestObject() with customization', async (t) => {
    const kp = await keys.ES256

    const jwt = await lib.issueRequestObject(
      issuer,
      client,
      {
        foo: 'bar',
      },
      {
        key: kp.privateKey,
        [lib.modifyAssertion](h, p) {
          t.equal(h.alg, 'ES256')
          delete h.typ
          p.foo = 'baz'
        },
      },
    )

    const { protectedHeader, payload } = await jose.jwtVerify(jwt, kp.publicKey)
    t.propEqual(protectedHeader, { alg: 'ES256' })
    t.propContains(payload, { foo: 'baz' })
  })

  test('issueRequestObject() claims parameter', async (t) => {
    const kp = await keys.ES256

    await t.rejects(
      lib.issueRequestObject(issuer, client, new URLSearchParams([['claims', '"']]), {
        key: kp.privateKey,
      }),
      /failed to parse the "claims" parameter as JSON/,
    )

    await t.rejects(
      lib.issueRequestObject(issuer, client, new URLSearchParams([['claims', 'null']]), {
        key: kp.privateKey,
      }),
      /parameter must be a JSON with a top level object/,
    )

    const jwt = await lib.issueRequestObject(
      issuer,
      client,
      new URLSearchParams([
        [
          'claims',
          JSON.stringify({
            userinfo: { nickname: null },
            id_token: { email: null },
          }),
        ],
      ]),
      { key: kp.privateKey },
    )

    const { payload } = await jose.jwtVerify(jwt, kp.publicKey)
    const { claims } = payload
    t.propEqual(claims, {
      userinfo: { nickname: null },
      id_token: { email: null },
    })
  })

  test('issueRequestObject() authorization_details parameter', async (t) => {
    const kp = await keys.ES256

    await t.rejects(
      lib.issueRequestObject(
        issuer,
        client,
        new URLSearchParams([['authorization_details', '"']]),
        {
          key: kp.privateKey,
        },
      ),
      /failed to parse the "authorization_details" parameter as JSON/,
    )

    await t.rejects(
      lib.issueRequestObject(
        issuer,
        client,
        new URLSearchParams([['authorization_details', 'null']]),
        {
          key: kp.privateKey,
        },
      ),
      /parameter must be a JSON with a top level array/,
    )

    const jwt = await lib.issueRequestObject(
      issuer,
      client,
      new URLSearchParams([['authorization_details', JSON.stringify([{ type: 'foo' }])]]),
      { key: kp.privateKey },
    )

    const { payload } = await jose.jwtVerify(jwt, kp.publicKey)
    const { authorization_details } = payload
    t.propEqual(authorization_details, [{ type: 'foo' }])
  })

  test('issueRequestObject() max_age parameter', async (t) => {
    const kp = await keys.ES256

    await t.rejects(
      lib.issueRequestObject(issuer, client, new URLSearchParams([['max_age', 'null']]), {
        key: kp.privateKey,
      }),
      /parameter must be a number/,
    )

    const jwt = await lib.issueRequestObject(
      issuer,
      client,
      new URLSearchParams([['max_age', '10']]),
      { key: kp.privateKey },
    )

    const { payload } = await jose.jwtVerify(jwt, kp.publicKey)
    const { max_age } = payload
    t.propEqual(max_age, 10)
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
