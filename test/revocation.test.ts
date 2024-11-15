import anyTest, { type TestFn } from 'ava'
import setup, {
  type Context,
  teardown,
  issuer,
  endpoint,
  client,
  getResponse,
  UA,
} from './_setup.js'
import * as lib from '../src/index.js'

const test = anyTest as TestFn<Context>

test.before(setup)
test.after(teardown)

const tClient: lib.Client = { ...client }
const auth = lib.None()

test('revocationRequest()', async (t) => {
  await t.throwsAsync(lib.revocationRequest(issuer, tClient, auth, 'token'), {
    message: 'authorization server metadata does not contain a valid "as.revocation_endpoint"',
  })

  await t.throwsAsync(lib.revocationRequest(issuer, tClient, auth, null as any), {
    message: '"token" must be a string',
  })

  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    revocation_endpoint: endpoint('revoke-1'),
  }

  t.context
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

  await t.notThrowsAsync(lib.revocationRequest(tIssuer, tClient, auth, 'token'))
})

test('revocationRequest() w/ Extra Parameters', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    revocation_endpoint: endpoint('revoke-2'),
  }

  t.context
    .intercept({
      path: '/revoke-2',
      method: 'POST',
      body(body) {
        return new URLSearchParams(body).get('token_type_hint') === 'access_token'
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })
    .times(3)

  await t.notThrowsAsync(
    lib.revocationRequest(tIssuer, tClient, auth, 'token', {
      additionalParameters: new URLSearchParams('token_type_hint=access_token'),
    }),
  )

  await t.notThrowsAsync(
    lib.revocationRequest(tIssuer, tClient, auth, 'token', {
      additionalParameters: {
        token_type_hint: 'access_token',
      },
    }),
  )

  await t.notThrowsAsync(
    lib.revocationRequest(tIssuer, tClient, auth, 'token', {
      additionalParameters: [['token_type_hint', 'access_token']],
    }),
  )
})

test('revocationRequest() w/ Custom Headers', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    revocation_endpoint: endpoint('revoke-headers'),
  }

  t.context
    .intercept({
      path: '/revoke-headers',
      method: 'POST',
      headers(headers) {
        t.is(headers['user-agent'], 'foo')
        t.is(headers.foo, 'bar')
        t.is(headers.accept, '*/*')
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
    await t.notThrowsAsync(lib.revocationRequest(tIssuer, tClient, auth, 'token', { headers }))
  }
})

test('processRevocationResponse()', async (t) => {
  await t.throwsAsync(lib.processRevocationResponse(null as any), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(lib.processRevocationResponse(getResponse('', { status: 404 })), {
    message:
      '"response" is not a conform Revocation Endpoint response (unexpected HTTP status code)',
  })

  t.is(await lib.processRevocationResponse(getResponse('')), undefined)

  const err = await t.throwsAsync(
    lib.processRevocationResponse(
      getResponse(JSON.stringify({ error: 'invalid_client' }), { status: 401 }),
    ),
  )

  t.true(
    err instanceof lib.ResponseBodyError && err.error === 'invalid_client' && err.status === 401,
  )
})
