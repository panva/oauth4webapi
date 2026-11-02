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

const tClient: lib.Client = { ...client, client_secret: 'foo' }

test('genericTokenEndpointRequest()', async () => {
  await assert.rejects(
    lib.genericTokenEndpointRequest(
      issuer,
      tClient,
      lib.None(),
      'urn:ietf:params:oauth:grant-type:token-exchange',
      new URLSearchParams(),
    ),
    {
      message: 'authorization server metadata does not contain a valid "as.token_endpoint"',
      code: 'OAUTH_MISSING_SERVER_METADATA',
    },
  )

  await assert.rejects(
    lib.genericTokenEndpointRequest(
      { ...issuer, token_endpoint: '' },
      tClient,
      lib.None(),
      'urn:ietf:params:oauth:grant-type:token-exchange',
      new URLSearchParams(),
    ),
    {
      message: 'authorization server metadata does not contain a valid "as.token_endpoint"',
      code: 'OAUTH_INVALID_SERVER_METADATA',
    },
  )

  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    token_endpoint: endpoint('token-1'),
  }

  context
    .intercept({
      path: '/token-1',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'user-agent': UA,
      },
      body(body) {
        const params = new URLSearchParams(body)
        return (
          params.get('grant_type') === 'urn:ietf:params:oauth:grant-type:token-exchange' &&
          params.get('subject_token') === 'foo' &&
          params.get('subject_token_type') === 'urn:ietf:params:oauth:token-type:access_token'
        )
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })
    .times(1)

  await assert.doesNotReject(
    lib.genericTokenEndpointRequest(
      tIssuer,
      tClient,
      lib.None(),
      'urn:ietf:params:oauth:grant-type:token-exchange',
      {
        subject_token: 'foo',
        subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      },
    ),
  )
})

test('processGenericTokenEndpointResponse()', async () => {
  await assert.rejects(lib.processGenericTokenEndpointResponse(issuer, client, null as any), {
    message: '"response" must be an instance of Response',
  })
  await assert.rejects(
    lib.processGenericTokenEndpointResponse(issuer, client, getResponse('', { status: 404 })),
    {
      message: '"response" is not a conform Token Endpoint response (unexpected HTTP status code)',
    },
  )
  await assert.rejects(lib.processGenericTokenEndpointResponse(issuer, client, getResponse('{"')), {
    message: 'failed to parse "response" body as JSON',
  })
  await assert.rejects(
    lib.processGenericTokenEndpointResponse(issuer, client, getResponse('null')),
    {
      message: '"response" body must be a top level object',
    },
  )
  await assert.rejects(lib.processGenericTokenEndpointResponse(issuer, client, getResponse('[]')), {
    message: '"response" body must be a top level object',
  })
  await assert.rejects(
    lib.processGenericTokenEndpointResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ token_type: 'Bearer' })),
    ),
    {
      message: '"response" body "access_token" property must be a string',
    },
  )
  await assert.rejects(
    lib.processGenericTokenEndpointResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token' })),
    ),
    {
      message: '"response" body "token_type" property must be a string',
    },
  )
  await assert.rejects(
    lib.processGenericTokenEndpointResponse(
      issuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          expires_in: new Date().toUTCString(),
        }),
      ),
    ),
    {
      message: '"response" body "expires_in" property must be a number',
    },
  )

  assert.deepStrictEqual(
    await lib.processGenericTokenEndpointResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer', expires_in: 60 })),
    ),
    {
      access_token: 'token',
      token_type: 'bearer',
      expires_in: 60,
    },
  )

  const err = await captureRejection(
    lib.processGenericTokenEndpointResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ error: 'invalid_grant' }), { status: 400 }),
    ),
    Error,
  )

  assert.strictEqual(
    err instanceof lib.ResponseBodyError &&
      err.error === 'invalid_grant' &&
      err.status === 400 &&
      err.response.bodyUsed === true,
    true,
  )

  await lib.processGenericTokenEndpointResponse(
    issuer,
    client,
    getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer' })),
  )
  await assert.rejects(
    lib.processGenericTokenEndpointResponse(
      issuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'N_A',
        }),
      ),
    ),
    {
      message: 'unsupported `token_type` value',
    },
  )

  assert.deepStrictEqual(
    await lib.processGenericTokenEndpointResponse(
      issuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'N_A',
        }),
      ),
      {
        recognizedTokenTypes: {
          n_a: (response, body) => {
            assert.strictEqual(response instanceof Response, true)
            assert.deepStrictEqual(body, { access_token: 'token', token_type: 'n_a' })
          },
        },
      },
    ),
    {
      access_token: 'token',
      token_type: 'n_a',
    },
  )
})
