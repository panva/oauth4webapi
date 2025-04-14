import anyTest, { type TestFn } from 'ava'
import setup, {
  client,
  endpoint,
  issuer,
  setupContextKeys,
  teardown,
  type ContextWithAlgs,
} from './_setup.js'
import * as jose from 'jose'
import * as lib from '../src/index.js'

const test = anyTest as TestFn<ContextWithAlgs>

test.before(setup())
test.after(teardown)
test.before(setupContextKeys)

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
    client,
    lib.ClientSecretBasic('foo'),
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
            t.false(/[^a-zA-Z0-9%+]/.test(token))
            t.deepEqual(token, 'client+%25%26%2B%2D%5F%2E%21%7E%2A%27%28%29')
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
    {
      ...client,
      client_id: "client %&+-_.!~*'()",
    },
    lib.ClientSecretBasic("client %&+-_.!~*'()"),
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
    client,
    lib.ClientSecretPost('foo'),
    'token',
  )
  t.pass()
})

test('private_key_jwt', async (t) => {
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
        t.is(assertion.aud, tIssuer.issuer)
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
    .times(2)

  await lib.revocationRequest(
    tIssuer,
    client,
    lib.PrivateKeyJwt({ key: t.context.ES256.privateKey }),
    'token',
  )
  await lib.revocationRequest(
    tIssuer,
    client,
    lib.PrivateKeyJwt(t.context.ES256.privateKey),
    'token',
  )
  t.throws(() => lib.PrivateKeyJwt({ key: t.context.ES256.publicKey }), {
    message: '"clientPrivateKey.key" must be a private CryptoKey',
  })
  t.throws(() => lib.PrivateKeyJwt({ key: null as any }), {
    message: '"clientPrivateKey.key" must be a CryptoKey',
  })
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
        t.is(assertion.aud, tIssuer.issuer)
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
    client,
    lib.PrivateKeyJwt({ key: t.context.ES256.privateKey, kid: 'keyId' }),
    'token',
  )
  t.throws(() => lib.PrivateKeyJwt({ key: t.context.ES256.publicKey, kid: 'keyId' }), {
    message: '"clientPrivateKey.key" must be a private CryptoKey',
  })
  t.throws(() => lib.PrivateKeyJwt({ key: t.context.ES256.publicKey, kid: 123 as any }), {
    message: '"kid" must be a string',
  })
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
    client,
    lib.None(),
    'token',
  )
  t.pass()
})

test('client_secret_jwt', async (t) => {
  const tIssuer = {
    ...issuer,
    revocation_endpoint: endpoint('test-csjwt-1'),
    token_endpoint: endpoint('token'),
  }

  t.context
    .intercept({
      path: '/test-csjwt-1',
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
        t.is(assertion.aud, tIssuer.issuer)
        t.is(assertion.iss, client.client_id)
        t.is(assertion.sub, client.client_id)
        t.is(typeof assertion.exp, 'number')
        t.is(typeof assertion.iat, 'number')
        t.is(typeof assertion.nbf, 'number')
        t.is(typeof assertion.jti, 'string')
        const header = jose.decodeProtectedHeader(params.get('client_assertion')!)
        t.is(header.kid, undefined)
        t.is(header.alg, 'HS256')

        return true
      },
    })
    .reply(200, '')

  await lib.revocationRequest(tIssuer, client, lib.ClientSecretJwt('client_secret'), 'token')
  t.pass()
})
