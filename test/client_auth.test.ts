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
        'user-agent': 'uatbd',
        authorization: (header) => header.startsWith('Basic '),
      },
      body(body) {
        return !new URLSearchParams(body).has('client_id')
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
      clientPrivateKey: { key: <CryptoKey>t.context.ES256.privateKey },
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
        clientPrivateKey: { key: <CryptoKey>t.context.ES256.publicKey },
      },
    ),
    { message: '"options.clientPrivateKey" must be a private CryptoKey' },
  )
  t.pass()
})

for (const alg of ['RS', 'ES', 'PS'].map((s) => [`${s}256`, `${s}384`, `${s}512`]).flat()) {
  test(`private_key_jwt using ${alg}`, async (t) => {
    t.context
      .intercept({
        path: `/test-${alg}`,
        method: 'POST',
        body(body) {
          return (
            jose.decodeProtectedHeader(new URLSearchParams(body).get('client_assertion')!).alg ===
            alg
          )
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
        clientPrivateKey: { key: <CryptoKey>t.context[alg].privateKey },
      },
    )
    t.pass()
  })
}

test('none', async (t) => {
  t.context
    .intercept({
      path: '/test-none',
      method: 'POST',
      headers: {
        'user-agent': 'uatbd',
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
