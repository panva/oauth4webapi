import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'

import setup, {
  client,
  endpoint,
  issuer,
  setupContextKeys,
  teardown,
  type ContextWithAlgs,
} from './_setup.js'
import * as jose from 'jose'
import * as lib from './_lib.js'

const context = {} as ContextWithAlgs

before(() => setup(context))
after(() => teardown(context))
before(() => setupContextKeys(context))

test('client_secret_basic', async () => {
  context
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
})

test('client_secret_basic (appendix b)', async () => {
  context
    .intercept({
      path: '/test-basic-encoding',
      method: 'POST',
      headers: {
        authorization(authorization) {
          const [, auth] = authorization.split(' ')
          for (const token of atob(auth).split(':')) {
            assert.strictEqual(/[^a-zA-Z0-9%+]/.test(token), false)
            assert.deepStrictEqual(token, 'client+%25%26%2B%2D%5F%2E%21%7E%2A%27%28%29')
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
})

test('client_secret_post', async () => {
  context
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
})

test('private_key_jwt', async () => {
  const tIssuer = {
    ...issuer,
    revocation_endpoint: endpoint('test-pkjwt-1'),
    token_endpoint: endpoint('token'),
  }

  context
    .intercept({
      path: '/test-pkjwt-1',
      method: 'POST',
      headers(headers) {
        return !('authorization' in headers)
      },
      body(body) {
        const params = new URLSearchParams(body)
        assert.strictEqual(params.has('client_secret'), false)
        assert.strictEqual(params.has('client_assertion'), true)
        assert.strictEqual(params.get('client_id'), client.client_id)
        assert.strictEqual(
          params.get('client_assertion_type'),
          'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        )

        const assertion = jose.decodeJwt(params.get('client_assertion')!)
        assert.strictEqual(assertion.aud, tIssuer.issuer)
        assert.strictEqual(assertion.iss, client.client_id)
        assert.strictEqual(assertion.sub, client.client_id)
        assert.strictEqual(typeof assertion.exp, 'number')
        assert.strictEqual(typeof assertion.iat, 'number')
        assert.strictEqual(typeof assertion.nbf, 'number')
        assert.strictEqual(typeof assertion.jti, 'string')
        const header = jose.decodeProtectedHeader(params.get('client_assertion')!)
        assert.strictEqual(header.kid, undefined)

        return true
      },
    })
    .reply(200, '')
    .times(2)

  await lib.revocationRequest(
    tIssuer,
    client,
    lib.PrivateKeyJwt({ key: context.ES256.privateKey }),
    'token',
  )
  await lib.revocationRequest(tIssuer, client, lib.PrivateKeyJwt(context.ES256.privateKey), 'token')
  assert.throws(() => lib.PrivateKeyJwt({ key: context.ES256.publicKey }), {
    message: '"clientPrivateKey.key" must be a private CryptoKey',
  })
  assert.throws(() => lib.PrivateKeyJwt({ key: null as any }), {
    message: '"clientPrivateKey.key" must be a CryptoKey',
  })
})

test('private_key_jwt ({ key: CryptoKey, kid: string })', async () => {
  const tIssuer = {
    ...issuer,
    revocation_endpoint: endpoint('test-pkjwt-2'),
    token_endpoint: endpoint('token'),
  }

  context
    .intercept({
      path: '/test-pkjwt-2',
      method: 'POST',
      headers(headers) {
        return !('authorization' in headers)
      },
      body(body) {
        const params = new URLSearchParams(body)
        assert.strictEqual(params.has('client_secret'), false)
        assert.strictEqual(params.has('client_assertion'), true)
        assert.strictEqual(params.get('client_id'), client.client_id)
        assert.strictEqual(
          params.get('client_assertion_type'),
          'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        )

        const assertion = jose.decodeJwt(params.get('client_assertion')!)
        assert.strictEqual(assertion.aud, tIssuer.issuer)
        assert.strictEqual(assertion.iss, client.client_id)
        assert.strictEqual(assertion.sub, client.client_id)
        assert.strictEqual(typeof assertion.exp, 'number')
        assert.strictEqual(typeof assertion.iat, 'number')
        assert.strictEqual(typeof assertion.nbf, 'number')
        assert.strictEqual(typeof assertion.jti, 'string')
        const header = jose.decodeProtectedHeader(params.get('client_assertion')!)
        assert.strictEqual(header.kid, 'keyId')

        return true
      },
    })
    .reply(200, '')

  await lib.revocationRequest(
    tIssuer,
    client,
    lib.PrivateKeyJwt({ key: context.ES256.privateKey, kid: 'keyId' }),
    'token',
  )
  assert.throws(() => lib.PrivateKeyJwt({ key: context.ES256.publicKey, kid: 'keyId' }), {
    message: '"clientPrivateKey.key" must be a private CryptoKey',
  })
  assert.throws(() => lib.PrivateKeyJwt({ key: context.ES256.publicKey, kid: 123 as any }), {
    message: '"kid" must be a string',
  })
})

test('none', async () => {
  context
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
})

test('client_secret_jwt', async () => {
  const tIssuer = {
    ...issuer,
    revocation_endpoint: endpoint('test-csjwt-1'),
    token_endpoint: endpoint('token'),
  }

  context
    .intercept({
      path: '/test-csjwt-1',
      method: 'POST',
      headers(headers) {
        return !('authorization' in headers)
      },
      body(body) {
        const params = new URLSearchParams(body)
        assert.strictEqual(params.has('client_secret'), false)
        assert.strictEqual(params.has('client_assertion'), true)
        assert.strictEqual(params.get('client_id'), client.client_id)
        assert.strictEqual(
          params.get('client_assertion_type'),
          'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        )

        const assertion = jose.decodeJwt(params.get('client_assertion')!)
        assert.strictEqual(assertion.aud, tIssuer.issuer)
        assert.strictEqual(assertion.iss, client.client_id)
        assert.strictEqual(assertion.sub, client.client_id)
        assert.strictEqual(typeof assertion.exp, 'number')
        assert.strictEqual(typeof assertion.iat, 'number')
        assert.strictEqual(typeof assertion.nbf, 'number')
        assert.strictEqual(typeof assertion.jti, 'string')
        const header = jose.decodeProtectedHeader(params.get('client_assertion')!)
        assert.strictEqual(header.kid, undefined)
        assert.strictEqual(header.alg, 'HS256')

        return true
      },
    })
    .reply(200, '')

  await lib.revocationRequest(tIssuer, client, lib.ClientSecretJwt('client_secret'), 'token')
})
