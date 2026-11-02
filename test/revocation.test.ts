import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { captureRejection } from './_errors.js'

import setup, {
  type Context,
  teardown,
  issuer,
  endpoint,
  client,
  getResponse,
  UA,
} from './_setup.js'
import * as lib from './_lib.js'

const context = {} as Context

before(() => setup(context))
after(() => teardown(context))

const tClient: lib.Client = { ...client }
const auth = lib.None()

test('revocationRequest()', async () => {
  await assert.rejects(lib.revocationRequest(issuer, tClient, auth, 'token'), {
    message: 'authorization server metadata does not contain a valid "as.revocation_endpoint"',
  })

  await assert.rejects(lib.revocationRequest(issuer, tClient, auth, null as any), {
    message: '"token" must be a string',
  })

  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    revocation_endpoint: endpoint('revoke-1'),
  }

  context
    .intercept({
      path: '/revoke-1',
      method: 'POST',
      headers: {
        accept: '*/*',
        'user-agent': UA,
      },
      body(body) {
        return new URLSearchParams(body).get('token') === 'token'
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })

  await assert.doesNotReject(lib.revocationRequest(tIssuer, tClient, auth, 'token'))
})

test('revocationRequest() w/ Extra Parameters', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    revocation_endpoint: endpoint('revoke-2'),
  }

  context
    .intercept({
      path: '/revoke-2',
      method: 'POST',
      body(body) {
        return new URLSearchParams(body).get('token_type_hint') === 'access_token'
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })
    .times(3)

  await assert.doesNotReject(
    lib.revocationRequest(tIssuer, tClient, auth, 'token', {
      additionalParameters: new URLSearchParams('token_type_hint=access_token'),
    }),
  )

  await assert.doesNotReject(
    lib.revocationRequest(tIssuer, tClient, auth, 'token', {
      additionalParameters: {
        token_type_hint: 'access_token',
      },
    }),
  )

  await assert.doesNotReject(
    lib.revocationRequest(tIssuer, tClient, auth, 'token', {
      additionalParameters: [['token_type_hint', 'access_token']],
    }),
  )
})

test('revocationRequest() w/ Custom Headers', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    revocation_endpoint: endpoint('revoke-headers'),
  }

  context
    .intercept({
      path: '/revoke-headers',
      method: 'POST',
      headers(headers) {
        assert.strictEqual(headers['user-agent'], 'foo')
        assert.strictEqual(headers.foo, 'bar')
        assert.strictEqual(headers.accept, '*/*')
        return true
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })
    .times(3)

  const entries = [
    ['accept', 'will be overwritten'],
    ['user-agent', 'foo'],
    ['foo', 'bar'],
  ]
  for (const headers of [
    entries,
    Object.fromEntries(entries),
    new Headers(Object.fromEntries(entries)),
  ]) {
    await assert.doesNotReject(lib.revocationRequest(tIssuer, tClient, auth, 'token', { headers }))
  }
})

test('processRevocationResponse()', async () => {
  await assert.rejects(lib.processRevocationResponse(null as any), {
    message: '"response" must be an instance of Response',
  })
  await assert.rejects(lib.processRevocationResponse(getResponse('', { status: 404 })), {
    message:
      '"response" is not a conform Revocation Endpoint response (unexpected HTTP status code)',
  })

  assert.strictEqual(await lib.processRevocationResponse(getResponse('')), undefined)

  const err = await captureRejection(
    lib.processRevocationResponse(
      getResponse(JSON.stringify({ error: 'invalid_client' }), { status: 401 }),
    ),
    Error,
  )

  assert.strictEqual(
    err instanceof lib.ResponseBodyError &&
      err.error === 'invalid_client' &&
      err.status === 401 &&
      err.response.bodyUsed === true,
    true,
  )
})
