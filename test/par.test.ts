import anyTest, { type TestFn } from 'ava'
import setup, { type Context, teardown, issuer, endpoint, client, getResponse } from './_setup.js'
import * as jose from 'jose'
import * as lib from '../src/index.js'

const j = JSON.stringify
const test = anyTest as TestFn<Context & { es256: CryptoKeyPair; rs256: CryptoKeyPair }>

test.before(setup)
test.after(teardown)

const tClient: lib.Client = { ...client, client_secret: 'foo' }

test('pushedAuthorizationRequest()', async (t) => {
  await t.throwsAsync(lib.pushedAuthorizationRequest(issuer, tClient, new URLSearchParams()), {
    message: '"issuer.pushed_authorization_request_endpoint" must be a string',
  })

  await t.throwsAsync(lib.pushedAuthorizationRequest(issuer, tClient, <any>null), {
    message: '"parameters" must be an instance of URLSearchParams',
  })

  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    pushed_authorization_request_endpoint: endpoint('par-1'),
  }

  t.context
    .intercept({
      path: '/par-1',
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
      body(body) {
        return new URLSearchParams(body).get('client_id') === client.client_id
      },
    })
    .reply(200, { request_uri: 'urn:example:uri', expires_in: 60 })

  await t.notThrowsAsync(lib.pushedAuthorizationRequest(tIssuer, tClient, new URLSearchParams()))
})

test('pushedAuthorizationRequest() w/ DPoP', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    pushed_authorization_request_endpoint: endpoint('par-2'),
  }

  t.context
    .intercept({
      path: '/par-2',
      method: 'POST',
      headers: {
        accept: 'application/json',
        dpop: /.+/,
      },
      body(body) {
        return new URLSearchParams(body).get('client_id') === client.client_id
      },
    })
    .reply(200, { request_uri: 'urn:example:uri', expires_in: 60 })

  const DPoP = <CryptoKeyPair>await jose.generateKeyPair('ES256')
  await t.notThrowsAsync(
    lib.pushedAuthorizationRequest(tIssuer, tClient, new URLSearchParams(), { DPoP }),
  )
})

test('pushedAuthorizationRequest() w/ Request Object', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    pushed_authorization_request_endpoint: endpoint('par-3'),
  }

  t.context
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

  const sign = <CryptoKeyPair>await jose.generateKeyPair('ES256')
  await t.notThrowsAsync(
    lib.pushedAuthorizationRequest(
      tIssuer,
      tClient,
      new URLSearchParams({
        request: await lib.issueRequestObject(tIssuer, tClient, new URLSearchParams(), {
          key: sign.privateKey,
        }),
      }),
    ),
  )
})

test('processPushedAuthorizationResponse()', async (t) => {
  await t.throwsAsync(lib.processPushedAuthorizationResponse(issuer, client, <any>null), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(
    lib.processPushedAuthorizationResponse(issuer, client, getResponse('', { status: 404 })),
    {
      message: '"response" is not a conform Pushed Authorization Request Endpoint response',
    },
  )
  await t.throwsAsync(
    lib.processPushedAuthorizationResponse(issuer, client, getResponse('{"', { status: 201 })),
    {
      message: 'failed to parsed "response" body as JSON',
    },
  )
  await t.throwsAsync(
    lib.processPushedAuthorizationResponse(issuer, client, getResponse('null', { status: 201 })),
    {
      message: '"response" body must be a top level object',
    },
  )
  await t.throwsAsync(
    lib.processPushedAuthorizationResponse(issuer, client, getResponse('[]', { status: 201 })),
    {
      message: '"response" body must be a top level object',
    },
  )

  await t.throwsAsync(
    lib.processPushedAuthorizationResponse(
      issuer,
      client,
      getResponse(j({ request_uri: null, expires_in: 60 }), { status: 201 }),
    ),
    {
      message: '"response" body "request_uri" property must be a non-empty string',
    },
  )

  await t.throwsAsync(
    lib.processPushedAuthorizationResponse(
      issuer,
      client,
      getResponse(j({ request_uri: 'urn:example:uri', expires_in: null }), { status: 201 }),
    ),
    {
      message: '"response" body "expires_in" property must be a positive number',
    },
  )

  t.deepEqual(
    await lib.processPushedAuthorizationResponse(
      issuer,
      client,
      getResponse(j({ request_uri: 'urn:example:uri', expires_in: 60 }), { status: 201 }),
    ),
    { request_uri: 'urn:example:uri', expires_in: 60 },
  )

  t.true(
    lib.isOAuth2Error(
      await lib.processPushedAuthorizationResponse(
        issuer,
        client,
        getResponse(j({ error: 'invalid_client' }), { status: 401 }),
      ),
    ),
  )

  t.false(
    lib.isOAuth2Error(
      await lib.processPushedAuthorizationResponse(
        issuer,
        client,
        getResponse(j({ request_uri: 'urn:example:uri', expires_in: 60 }), { status: 201 }),
      ),
    ),
  )
})
