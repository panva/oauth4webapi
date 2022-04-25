import anyTest, { type TestFn } from 'ava'
import { client, issuer } from './_setup.js'
import * as jose from 'jose'

import * as lib from '../src/index.js'

const test = anyTest as TestFn<{ [alg: string]: CryptoKeyPair }>

test.before(async (t) => {
  for (const alg of ['RS', 'ES', 'PS']
    .map((s) => [`${s}256`])
    .flat()
    .concat(['RSA-OAEP', 'RSA-OAEP-256'])) {
    t.context[alg] = <CryptoKeyPair>await jose.generateKeyPair(alg)
  }
  for (const namedCurve of ['P-256']) {
    t.context[`ECDH-ES+${namedCurve}`] = <CryptoKeyPair>(
      await jose.generateKeyPair('ECDH-ES', { crv: namedCurve })
    )
  }
})

test('issueRequestObject()', async (t) => {
  const sign = t.context.ES256
  const encrypt = t.context['RSA-OAEP-256']
  const jwe = await lib.issueRequestObject(
    issuer,
    client,
    new URLSearchParams({ response_type: 'code', resource: 'urn:example:resource' }),
    { key: sign.privateKey },
    { key: encrypt.publicKey },
  )

  let jwt: string
  {
    const {
      plaintext,
      protectedHeader: { iss, sub, alg, enc, cty, aud },
    } = await jose.compactDecrypt(jwe, encrypt.privateKey)
    t.deepEqual(
      { iss, sub, alg, enc, cty, aud },
      {
        iss: client.client_id,
        sub: client.client_id,
        alg: 'RSA-OAEP-256',
        enc: 'A128CBC-HS256',
        aud: issuer.issuer,
        cty: 'oauth-authz-req+jwt',
      },
    )
    jwt = new TextDecoder().decode(plaintext)
  }

  {
    const { payload, protectedHeader } = await jose.jwtVerify(jwt, sign.publicKey)
    t.deepEqual(protectedHeader, { alg: 'ES256', typ: 'oauth-authz-req+jwt' })
    const { exp, iat, nbf, jti, ...claims } = payload
    t.is(typeof exp, 'number')
    t.is(typeof nbf, 'number')
    t.is(typeof iat, 'number')
    t.is(typeof jti, 'string')
    t.deepEqual(claims, {
      iss: client.client_id,
      sub: client.client_id,
      aud: issuer.issuer,
      response_type: 'code',
      resource: 'urn:example:resource',
      client_id: client.client_id,
    })
  }
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

for (const alg of ['RS', 'ES', 'PS'].map((s) => [`${s}256`]).flat()) {
  test(`issueRequestObject() signed using ${alg}`, async (t) => {
    const sign = t.context[alg]
    const jwt = await lib.issueRequestObject(issuer, client, new URLSearchParams(), {
      key: sign.privateKey,
    })
    const protectedHeader = jose.decodeProtectedHeader(jwt)
    t.is(protectedHeader.alg, alg)
  })
}

for (const alg of <lib.KeyManagementAlgorithm[]>['RSA-OAEP', 'RSA-OAEP-256']) {
  for (const enc of <lib.ContentEncryptionAlgorithm[]>[
    'A128GCM',
    'A256GCM',
    'A128CBC-HS256',
    'A256CBC-HS512',
  ]) {
    test(`issueRequestObject() encrypted using alg: ${alg}, enc: ${enc}`, async (t) => {
      const sign = t.context.ES256
      const encrypt = t.context[alg]
      const jwe = await lib.issueRequestObject(
        issuer,
        { ...client, request_object_encryption_enc: enc },
        new URLSearchParams(),
        { key: sign.privateKey },
        { key: encrypt.publicKey },
      )
      const protectedHeader = jose.decodeProtectedHeader(jwe)
      t.is(protectedHeader.alg, alg)
      await t.notThrowsAsync(jose.compactDecrypt(jwe, encrypt.privateKey))
    })
  }
}

for (const namedCurve of ['P-256']) {
  for (const enc of <lib.ContentEncryptionAlgorithm[]>[
    'A128GCM',
    'A256GCM',
    'A128CBC-HS256',
    'A256CBC-HS512',
  ]) {
    test(`issueRequestObject() encrypted using alg: ECDH-ES, crv: ${namedCurve}, enc: ${enc}`, async (t) => {
      const sign = t.context.ES256
      const encrypt = t.context[`ECDH-ES+${namedCurve}`]
      const jwe = await lib.issueRequestObject(
        issuer,
        { ...client, request_object_encryption_enc: enc },
        new URLSearchParams(),
        { key: sign.privateKey },
        { key: encrypt.publicKey },
      )
      const protectedHeader = jose.decodeProtectedHeader(jwe)
      t.is(protectedHeader.alg, 'ECDH-ES')
      await t.notThrowsAsync(jose.compactDecrypt(jwe, encrypt.privateKey))
    })
  }
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

test('issueRequestObject() encryption kid', async (t) => {
  const sign = t.context.ES256
  const encrypt = t.context['RSA-OAEP-256']
  const jwe = await lib.issueRequestObject(
    issuer,
    client,
    new URLSearchParams(),
    { key: sign.privateKey },
    {
      key: encrypt.publicKey,
      kid: 'kid-1',
    },
  )
  const protectedHeader = jose.decodeProtectedHeader(jwe)
  t.is(protectedHeader.kid, 'kid-1')
})
