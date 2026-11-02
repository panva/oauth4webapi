import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { captureRejection } from './_errors.js'

import setup, {
  client,
  endpoint,
  getResponse,
  issuer,
  teardown,
  type ContextWithAlgs,
  UA,
} from './_setup.js'
import * as lib from './_lib.js'

const context = {} as ContextWithAlgs

before(() => setup(context))
after(() => teardown(context))

const tClient: lib.Client = { ...client, client_secret: 'foo' }

test('pushedAuthorizationRequest()', async () => {
  await assert.rejects(
    lib.pushedAuthorizationRequest(issuer, tClient, lib.None(), new URLSearchParams()),
    {
      message:
        'authorization server metadata does not contain a valid "as.pushed_authorization_request_endpoint"',
    },
  )

  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    pushed_authorization_request_endpoint: endpoint('par-1'),
  }

  context
    .intercept({
      path: '/par-1',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'user-agent': UA,
      },
      body(body) {
        const params = new URLSearchParams(body)
        return (
          params.get('client_id') === client.client_id && params.get('response_type') === 'code'
        )
      },
    })
    .reply(200, { request_uri: 'urn:example:uri', expires_in: 60 })
    .times(3)

  await assert.doesNotReject(
    lib.pushedAuthorizationRequest(
      tIssuer,
      tClient,
      lib.None(),
      new URLSearchParams({ response_type: 'code' }),
    ),
  )
  await assert.doesNotReject(
    lib.pushedAuthorizationRequest(tIssuer, tClient, lib.None(), { response_type: 'code' }),
  )
  await assert.doesNotReject(
    lib.pushedAuthorizationRequest(tIssuer, tClient, lib.None(), [['response_type', 'code']]),
  )
})

test('pushedAuthorizationRequest() w/ Custom Headers', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    pushed_authorization_request_endpoint: endpoint('par-headers'),
  }

  context
    .intercept({
      path: '/par-headers',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'user-agent': 'foo',
        foo: 'bar',
      },
    })
    .reply(200, { request_uri: 'urn:example:uri', expires_in: 60 })
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
    await assert.doesNotReject(
      lib.pushedAuthorizationRequest(tIssuer, tClient, lib.None(), new URLSearchParams(), {
        headers,
      }),
    )
  }
})

test('pushedAuthorizationRequest() w/ DPoP', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    pushed_authorization_request_endpoint: endpoint('par-2'),
  }

  context
    .intercept({
      path: '/par-2',
      method: 'POST',
      headers: {
        accept: 'application/json',
        dpop: /.+/,
      },
    })
    .reply(200, { request_uri: 'urn:example:uri', expires_in: 60 })

  const DPoP = lib.DPoP(tClient, await lib.generateKeyPair('ES256'))
  await assert.doesNotReject(
    lib.pushedAuthorizationRequest(tIssuer, tClient, lib.None(), new URLSearchParams(), { DPoP }),
  )
})

test('pushedAuthorizationRequest() w/ Request Object', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    pushed_authorization_request_endpoint: endpoint('par-3'),
  }

  context
    .intercept({
      path: '/par-3',
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
      body(body) {
        const params = new URLSearchParams(body)
        return params.has('client_id') && params.has('request')
      },
    })
    .reply(200, { request_uri: 'urn:example:uri', expires_in: 60 })

  const sign = await lib.generateKeyPair('ES256')
  const request = await lib.issueRequestObject(tIssuer, tClient, new URLSearchParams(), {
    key: sign.privateKey,
  })

  await assert.doesNotReject(
    lib.pushedAuthorizationRequest(tIssuer, tClient, lib.None(), new URLSearchParams({ request })),
  )
})

test('processPushedAuthorizationResponse()', async () => {
  await assert.rejects(lib.processPushedAuthorizationResponse(issuer, client, null as any), {
    message: '"response" must be an instance of Response',
  })
  await assert.rejects(
    lib.processPushedAuthorizationResponse(issuer, client, getResponse('', { status: 404 })),
    {
      message:
        '"response" is not a conform Pushed Authorization Request Endpoint response (unexpected HTTP status code)',
    },
  )
  await assert.rejects(
    lib.processPushedAuthorizationResponse(issuer, client, getResponse('{"', { status: 201 })),
    {
      message: 'failed to parse "response" body as JSON',
    },
  )
  await assert.rejects(
    lib.processPushedAuthorizationResponse(issuer, client, getResponse('null', { status: 201 })),
    {
      message: '"response" body must be a top level object',
    },
  )
  await assert.rejects(
    lib.processPushedAuthorizationResponse(issuer, client, getResponse('[]', { status: 201 })),
    {
      message: '"response" body must be a top level object',
    },
  )

  await assert.rejects(
    lib.processPushedAuthorizationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ request_uri: null, expires_in: 60 }), { status: 201 }),
    ),
    {
      message: '"response" body "request_uri" property must be a string',
    },
  )

  await assert.rejects(
    lib.processPushedAuthorizationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ request_uri: 'urn:example:uri', expires_in: null }), {
        status: 201,
      }),
    ),
    {
      message: '"response" body "expires_in" property must be a number',
    },
  )

  assert.deepStrictEqual(
    await lib.processPushedAuthorizationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ request_uri: 'urn:example:uri', expires_in: 60 }), {
        status: 201,
      }),
    ),
    { request_uri: 'urn:example:uri', expires_in: 60 },
  )

  const err = await captureRejection(
    lib.processPushedAuthorizationResponse(
      issuer,
      client,
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

  await lib.processPushedAuthorizationResponse(
    issuer,
    client,
    getResponse(JSON.stringify({ request_uri: 'urn:example:uri', expires_in: 60 }), {
      status: 201,
    }),
  )
})
