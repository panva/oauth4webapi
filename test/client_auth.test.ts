import anyTest, { type TestFn } from 'ava'
import setup, { client, issuer, endpoint, type Context, teardown } from './_setup.js'
import * as jose from 'jose'
import * as lib from '../src/index.js'

const test = anyTest as TestFn<Context & { [alg: string]: CryptoKeyPair }>

test.before(setup)
test.after(teardown)

test.before(async (t) => {
  for (const alg of ['RS', 'ES', 'PS'].map((s) => [`${s}256`]).flat()) {
    t.context[alg] = await lib.generateKeyPair(<lib.JWSAlgorithm>alg)
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

for (const alg of ['RS', 'ES', 'PS'].map((s) => [`${s}256`]).flat()) {
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
    await jose.compactVerify(assertion, t.context[alg].publicKey)
    t.pass()
  })
}

test('client_secret_jwt', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    revocation_endpoint: endpoint('test-csjwt'),
    token_endpoint: endpoint('token'),
  }

  t.context
    .intercept({
      path: '/test-csjwt',
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

        const { alg } = jose.decodeProtectedHeader(params.get('client_assertion')!)
        t.is(alg, 'HS256')
        const assertion = jose.decodeJwt(params.get('client_assertion')!)
        t.deepEqual(assertion.aud, [tIssuer.issuer, tIssuer.token_endpoint])
        t.is(assertion.iss, client.client_id)
        t.is(assertion.sub, client.client_id)
        t.is(typeof assertion.exp, 'number')
        t.is(typeof assertion.iat, 'number')
        t.is(typeof assertion.nbf, 'number')
        t.is(typeof assertion.jti, 'string')

        return true
      },
    })
    .reply(200, '')

  await lib.revocationRequest(
    tIssuer,
    {
      ...client,
      client_secret: 'foo',
      token_endpoint_auth_method: 'client_secret_jwt',
    },
    'token',
  )
  await t.throwsAsync(
    lib.revocationRequest(
      { ...issuer, revocation_endpoint: endpoint('test-csjwt') },
      {
        ...client,
        token_endpoint_auth_method: 'client_secret_jwt',
      },
      'token',
    ),
    { message: '"client.client_secret" property must be a non-empty string' },
  )
  t.pass()
})

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
