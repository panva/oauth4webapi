import anyTest, { type TestFn } from 'ava'
import setup, { client, issuer, endpoint, type Context, teardown } from './_setup.js'
import * as jose from 'jose'
import * as lib from '../src/index.js'

const test = anyTest as TestFn<Context & { [alg: string]: CryptoKeyPair }>

test.before(setup)
test.after(teardown)

test.before(async (t) => {
  for (const alg of ['RS', 'ES', 'PS'].map((s) => [`${s}256`, `${s}384`, `${s}512`]).flat()) {
    t.context[alg] = <CryptoKeyPair>await jose.generateKeyPair(alg)
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

test('private_key_jwt', async (t) => {
  const tIssuer = {
    ...issuer,
    revocation_endpoint: endpoint('test-pkjwt'),
    token_endpoint: endpoint('token'),
  }

  t.context
    .intercept({
      path: '/test-pkjwt',
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
  t.pass()
})

for (const alg of ['RS', 'ES', 'PS'].map((s) => [`${s}256`, `${s}384`, `${s}512`]).flat()) {
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
    token_endpoint_auth_signing_alg_values_supported: ['HS512', 'HS384', 'HS256'],
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
        t.is(alg, 'HS512')
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

for (const alg of <lib.HMACAlgorithms[]>['HS256', 'HS384', 'HS512']) {
  test(`client_secret_jwt using ${alg}`, async (t) => {
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
        client_secret: 'foo',
        token_endpoint_auth_signing_alg: alg,
        token_endpoint_auth_method: 'client_secret_jwt',
      },
      'token',
    )

    await jose.compactVerify(assertion, new TextEncoder().encode('foo'))
    t.pass()
  })
}

test(`client_secret_jwt needing token_endpoint_auth_signing_alg`, async (t) => {
  await t.throwsAsync(
    lib.revocationRequest(
      { ...issuer, revocation_endpoint: endpoint(`test`) },
      {
        ...client,
        client_secret: 'foo',
        token_endpoint_auth_method: 'client_secret_jwt',
      },
      'token',
    ),
    {
      message:
        'could not determine client_secret_jwt JWS "alg" algorithm, client.token_endpoint_auth_signing_alg must be configured',
    },
  )
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
