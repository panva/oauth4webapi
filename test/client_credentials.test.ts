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

test('clientCredentialsGrantRequest()', async () => {
  await assert.rejects(
    lib.clientCredentialsGrantRequest(issuer, tClient, lib.None(), new URLSearchParams()),
    {
      message: 'authorization server metadata does not contain a valid "as.token_endpoint"',
      code: 'OAUTH_MISSING_SERVER_METADATA',
    },
  )

  await assert.rejects(
    lib.clientCredentialsGrantRequest(
      { ...issuer, token_endpoint: '' },
      tClient,
      lib.None(),
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
          params.get('grant_type') === 'client_credentials' &&
          params.get('resource') === 'urn:example:resource'
        )
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })
    .times(3)

  await assert.doesNotReject(
    lib.clientCredentialsGrantRequest(
      tIssuer,
      tClient,
      lib.None(),
      new URLSearchParams({ resource: 'urn:example:resource' }),
    ),
  )
  await assert.doesNotReject(
    lib.clientCredentialsGrantRequest(tIssuer, tClient, lib.None(), {
      resource: 'urn:example:resource',
    }),
  )
  await assert.doesNotReject(
    lib.clientCredentialsGrantRequest(tIssuer, tClient, lib.None(), [
      ['resource', 'urn:example:resource'],
    ]),
  )
})

test('clientCredentialsGrantRequest() w/ Extra Parameters', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    token_endpoint: endpoint('token-2'),
  }

  context
    .intercept({
      path: '/token-2',
      method: 'POST',
      body(body) {
        const params = new URLSearchParams(body)
        return params.get('resource') === 'urn:example:resource'
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })

  await assert.doesNotReject(
    lib.clientCredentialsGrantRequest(
      tIssuer,
      tClient,
      lib.None(),
      new URLSearchParams('resource=urn:example:resource'),
    ),
  )
})

test('clientCredentialsGrantRequest() w/ Custom Headers', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    token_endpoint: endpoint('token-headers'),
  }

  context
    .intercept({
      path: '/token-headers',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'user-agent': 'foo',
        foo: 'bar',
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
    await assert.doesNotReject(
      lib.clientCredentialsGrantRequest(tIssuer, tClient, lib.None(), new URLSearchParams(), {
        headers,
      }),
    )
  }
})

test('clientCredentialsGrantRequest() w/ DPoP', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    token_endpoint: endpoint('token-3'),
  }

  context
    .intercept({
      path: '/token-3',
      method: 'POST',
      headers: {
        dpop: /.+/,
      },
    })
    .reply(200, { access_token: 'token', token_type: 'DPoP' })

  const DPoP = lib.DPoP(tClient, await lib.generateKeyPair('ES256'))
  await assert.doesNotReject(
    lib.clientCredentialsGrantRequest(tIssuer, tClient, lib.None(), new URLSearchParams(), {
      DPoP,
    }),
  )
})

test('processClientCredentialsResponse()', async () => {
  await assert.rejects(lib.processClientCredentialsResponse(issuer, client, null as any), {
    message: '"response" must be an instance of Response',
  })
  await assert.rejects(
    lib.processClientCredentialsResponse(issuer, client, getResponse('', { status: 404 })),
    {
      message: '"response" is not a conform Token Endpoint response (unexpected HTTP status code)',
    },
  )
  await assert.rejects(lib.processClientCredentialsResponse(issuer, client, getResponse('{"')), {
    message: 'failed to parse "response" body as JSON',
  })
  await assert.rejects(lib.processClientCredentialsResponse(issuer, client, getResponse('null')), {
    message: '"response" body must be a top level object',
  })
  await assert.rejects(lib.processClientCredentialsResponse(issuer, client, getResponse('[]')), {
    message: '"response" body must be a top level object',
  })
  await assert.rejects(
    lib.processClientCredentialsResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ token_type: 'Bearer' })),
    ),
    {
      message: '"response" body "access_token" property must be a string',
    },
  )
  await assert.rejects(
    lib.processClientCredentialsResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token' })),
    ),
    {
      message: '"response" body "token_type" property must be a string',
    },
  )
  await assert.rejects(
    lib.processClientCredentialsResponse(
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
    await lib.processClientCredentialsResponse(
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
    lib.processClientCredentialsResponse(
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

  await lib.processClientCredentialsResponse(
    issuer,
    client,
    getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer' })),
  )
})
