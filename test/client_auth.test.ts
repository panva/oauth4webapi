import anyTest, { type TestFn } from 'ava'
import { createPublicKey } from 'node:crypto'
import setup, { client, issuer, endpoint, type Context, teardown } from './_setup.js'
import * as jose from 'jose'
import * as lib from '../src/index.js'

const test = anyTest as TestFn<Context & { [alg: string]: CryptoKeyPair }>

test.before(setup)
test.after(teardown)

const algs: lib.JWSAlgorithm[] = ['RS256', 'ES256', 'PS256', 'EdDSA']

test.before(async (t) => {
  for (const alg of algs) {
    const key = await lib.generateKeyPair(alg)
    t.context[alg] = key
  }
})

test('client_secret_basic', async (t) => {
  t.context
    .intercept({
      path: '/test-basic',
      method: 'POST',
      headers: {
        authorization: (header) => header.startsWith('Basic '),
      },
      body(body) {
        const params = new URLSearchParams(body)
        return !params.has('client_id') && !params.has('client_secret')
      },
    })
    .reply(200, '')

  await lib.revocationRequest(
    { ...issuer, revocation_endpoint: endpoint('test-basic') },
    { ...client, client_secret: 'foo' },
    'token',
  )
  t.pass()
})

test('client_secret_basic (appendix b)', async (t) => {
  t.context
    .intercept({
      path: '/test-basic-encoding',
      method: 'POST',
      headers: {
        authorization(authorization) {
          const [, auth] = authorization.split(' ')
          for (const token of atob(auth).split(':')) {
            t.is(decodeURIComponent(token), '+%&+£€')
          }
          return true
        },
      },
      body(body) {
        const params = new URLSearchParams(body)
        return !params.has('client_id') && !params.has('client_secret')
      },
    })
    .reply(200, '')

  await lib.revocationRequest(
    { ...issuer, revocation_endpoint: endpoint('test-basic-encoding') },
    { ...client, client_id: ' %&+£€', client_secret: ' %&+£€' },
    'token',
  )
  t.pass()
})

test('client_secret_post', async (t) => {
  t.context
    .intercept({
      path: '/test-post',
      method: 'POST',
      headers(headers) {
        return !('authorization' in headers)
      },
      body(body) {
        const params = new URLSearchParams(body)
        return params.get('client_id') === client.client_id && params.get('client_secret') === 'foo'
      },
    })
    .reply(200, '')

  await lib.revocationRequest(
    { ...issuer, revocation_endpoint: endpoint('test-post') },
    { ...client, client_secret: 'foo', token_endpoint_auth_method: 'client_secret_post' },
    'token',
  )
  t.pass()
})

test('private_key_jwt ({ key: CryptoKey })', async (t) => {
  const tIssuer = {
    ...issuer,
    revocation_endpoint: endpoint('test-pkjwt-1'),
    token_endpoint: endpoint('token'),
  }

  t.context
    .intercept({
      path: '/test-pkjwt-1',
      method: 'POST',
      headers(headers) {
        return !('authorization' in headers)
      },
      body(body) {
        const params = new URLSearchParams(body)
        t.false(params.has('client_secret'))
        t.true(params.has('client_assertion'))
        t.is(params.get('client_id'), client.client_id)
        t.is(
          params.get('client_assertion_type'),
          'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        )

        const assertion = jose.decodeJwt(params.get('client_assertion')!)
        t.deepEqual(assertion.aud, [tIssuer.issuer, tIssuer.token_endpoint])
        t.is(assertion.iss, client.client_id)
        t.is(assertion.sub, client.client_id)
        t.is(typeof assertion.exp, 'number')
        t.is(typeof assertion.iat, 'number')
        t.is(typeof assertion.nbf, 'number')
        t.is(typeof assertion.jti, 'string')
        const header = jose.decodeProtectedHeader(params.get('client_assertion')!)
        t.is(header.kid, undefined)

        return true
      },
    })
    .reply(200, '')

  await lib.revocationRequest(
    tIssuer,
    {
      ...client,
      token_endpoint_auth_method: 'private_key_jwt',
    },
    'token',
    {
      clientPrivateKey: { key: t.context.ES256.privateKey },
    },
  )
  await t.throwsAsync(
    lib.revocationRequest(
      { ...issuer, revocation_endpoint: endpoint('test-pkjwt') },
      {
        ...client,
        token_endpoint_auth_method: 'private_key_jwt',
      },
      'token',
      {
        clientPrivateKey: { key: t.context.ES256.publicKey },
      },
    ),
    { message: '"options.clientPrivateKey.key" must be a private CryptoKey' },
  )
  await t.throwsAsync(
    lib.revocationRequest(
      { ...issuer, revocation_endpoint: endpoint('test-pkjwt') },
      {
        ...client,
        token_endpoint_auth_method: 'private_key_jwt',
      },
      'token',
      {
        clientPrivateKey: { key: <any>null },
      },
    ),
    { message: '"options.clientPrivateKey.key" must be a private CryptoKey' },
  )
  t.pass()
})

test('private_key_jwt ({ key: CryptoKey, kid: string })', async (t) => {
  const tIssuer = {
    ...issuer,
    revocation_endpoint: endpoint('test-pkjwt-2'),
    token_endpoint: endpoint('token'),
  }

  t.context
    .intercept({
      path: '/test-pkjwt-2',
      method: 'POST',
      headers(headers) {
        return !('authorization' in headers)
      },
      body(body) {
        const params = new URLSearchParams(body)
        t.false(params.has('client_secret'))
        t.true(params.has('client_assertion'))
        t.is(params.get('client_id'), client.client_id)
        t.is(
          params.get('client_assertion_type'),
          'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        )

        const assertion = jose.decodeJwt(params.get('client_assertion')!)
        t.deepEqual(assertion.aud, [tIssuer.issuer, tIssuer.token_endpoint])
        t.is(assertion.iss, client.client_id)
        t.is(assertion.sub, client.client_id)
        t.is(typeof assertion.exp, 'number')
        t.is(typeof assertion.iat, 'number')
        t.is(typeof assertion.nbf, 'number')
        t.is(typeof assertion.jti, 'string')
        const header = jose.decodeProtectedHeader(params.get('client_assertion')!)
        t.is(header.kid, 'keyId')

        return true
      },
    })
    .reply(200, '')

  await lib.revocationRequest(
    tIssuer,
    {
      ...client,
      token_endpoint_auth_method: 'private_key_jwt',
    },
    'token',
    {
      clientPrivateKey: { key: t.context.ES256.privateKey, kid: 'keyId' },
    },
  )
  await t.throwsAsync(
    lib.revocationRequest(
      { ...issuer, revocation_endpoint: endpoint('test-pkjwt') },
      {
        ...client,
        token_endpoint_auth_method: 'private_key_jwt',
      },
      'token',
      {
        clientPrivateKey: { key: t.context.ES256.publicKey, kid: 'keyId' },
      },
    ),
    { message: '"options.clientPrivateKey.key" must be a private CryptoKey' },
  )
  await t.throwsAsync(
    lib.revocationRequest(
      { ...issuer, revocation_endpoint: endpoint('test-pkjwt') },
      {
        ...client,
        token_endpoint_auth_method: 'private_key_jwt',
      },
      'token',
      {
        clientPrivateKey: { key: t.context.ES256.publicKey, kid: <any>123 },
      },
    ),
    { message: '"kid" must be a non-empty string' },
  )
  t.pass()
})

test('private_key_jwt (CryptoKey)', async (t) => {
  const tIssuer = {
    ...issuer,
    revocation_endpoint: endpoint('test-pkjwt-3'),
    token_endpoint: endpoint('token'),
  }

  t.context
    .intercept({
      path: '/test-pkjwt-3',
      method: 'POST',
      headers(headers) {
        return !('authorization' in headers)
      },
      body(body) {
        const params = new URLSearchParams(body)
        t.false(params.has('client_secret'))
        t.true(params.has('client_assertion'))
        t.is(params.get('client_id'), client.client_id)
        t.is(
          params.get('client_assertion_type'),
          'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        )

        const assertion = jose.decodeJwt(params.get('client_assertion')!)
        t.deepEqual(assertion.aud, [tIssuer.issuer, tIssuer.token_endpoint])
        t.is(assertion.iss, client.client_id)
        t.is(assertion.sub, client.client_id)
        t.is(typeof assertion.exp, 'number')
        t.is(typeof assertion.iat, 'number')
        t.is(typeof assertion.nbf, 'number')
        t.is(typeof assertion.jti, 'string')
        const header = jose.decodeProtectedHeader(params.get('client_assertion')!)
        t.is(header.kid, undefined)

        return true
      },
    })
    .reply(200, '')

  await lib.revocationRequest(
    tIssuer,
    {
      ...client,
      token_endpoint_auth_method: 'private_key_jwt',
    },
    'token',
    {
      clientPrivateKey: t.context.ES256.privateKey,
    },
  )
  await t.throwsAsync(
    lib.revocationRequest(
      { ...issuer, revocation_endpoint: endpoint('test-pkjwt') },
      {
        ...client,
        token_endpoint_auth_method: 'private_key_jwt',
      },
      'token',
      {
        clientPrivateKey: t.context.ES256.publicKey,
      },
    ),
    { message: '"options.clientPrivateKey.key" must be a private CryptoKey' },
  )
  t.pass()
})

for (const alg of algs) {
  test(`private_key_jwt using ${alg}`, async (t) => {
    let assertion!: string
    t.context
      .intercept({
        path: `/test-${alg}`,
        method: 'POST',
        body(body) {
          assertion = new URLSearchParams(body).get('client_assertion')!
          return jose.decodeProtectedHeader(assertion).alg === alg
        },
      })
      .reply(200, '')

    await lib.revocationRequest(
      { ...issuer, revocation_endpoint: endpoint(`test-${alg}`) },
      {
        ...client,
        token_endpoint_auth_method: 'private_key_jwt',
      },
      'token',
      {
        clientPrivateKey: { key: t.context[alg].privateKey },
      },
    )
    await jose.compactVerify(
      assertion,
      createPublicKey({
        format: 'der',
        key: await crypto.subtle.exportKey('spki', t.context[alg].publicKey).then(Buffer.from),
        type: 'spki',
      }),
    )
    t.pass()
  })
}

test('none', async (t) => {
  t.context
    .intercept({
      path: '/test-none',
      method: 'POST',
      headers(headers) {
        return !('authorization' in headers)
      },
      body(body) {
        const params = new URLSearchParams(body)
        return params.has('client_id') && !params.has('client_secret')
      },
    })
    .reply(200, '')

  await lib.revocationRequest(
    { ...issuer, revocation_endpoint: endpoint('test-none') },
    {
      ...client,
      token_endpoint_auth_method: 'none',
    },
    'token',
  )
  t.pass()
})
