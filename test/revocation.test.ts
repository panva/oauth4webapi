import anyTest, { type TestFn } from 'ava'
import setup, { type Context, teardown, issuer, endpoint, client, getResponse } from './_setup.js'
import * as lib from '../src/index.js'

const j = JSON.stringify
const test = anyTest as TestFn<Context>

test.before(setup)
test.after(teardown)

const tClient: lib.Client = { ...client, client_secret: 'foo' }

test('revocationRequest()', async (t) => {
  await t.throwsAsync(lib.revocationRequest(issuer, tClient, 'token'), {
    message: '"issuer.revocation_endpoint" must be a string',
  })

  await t.throwsAsync(lib.revocationRequest(issuer, tClient, <any>null), {
    message: '"token" must be a non-empty string',
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
        'user-agent': 'uatbd',
      },
      body(body) {
        return new URLSearchParams(body).get('token') === 'token'
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })

  await t.notThrowsAsync(lib.revocationRequest(tIssuer, tClient, 'token'))
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

  await t.notThrowsAsync(
    lib.revocationRequest(tIssuer, tClient, 'token', {
      additionalParameters: new URLSearchParams('token_type_hint=access_token'),
    }),
  )
})

test('processRevocationResponse()', async (t) => {
  await t.throwsAsync(lib.processRevocationResponse(<any>null), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(lib.processRevocationResponse(getResponse('', { status: 404 })), {
    message: '"response" is not a conform Revocation Endpoint response',
  })

  t.is(await lib.processRevocationResponse(getResponse('')), undefined)

  t.true(
    lib.isOAuth2Error(
      await lib.processRevocationResponse(
        getResponse(j({ error: 'invalid_client' }), { status: 401 }),
      ),
    ),
  )
})
