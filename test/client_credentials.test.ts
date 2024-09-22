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

const tClient: lib.Client = { ...client, client_secret: 'foo' }

test('clientCredentialsGrantRequest()', async (t) => {
  await t.throwsAsync(lib.clientCredentialsGrantRequest(issuer, tClient, new URLSearchParams()), {
    message: '"as.token_endpoint" must be a string',
  })

  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    token_endpoint: endpoint('token-1'),
  }

  t.context
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

  await t.notThrowsAsync(
    lib.clientCredentialsGrantRequest(
      tIssuer,
      tClient,
      new URLSearchParams({ resource: 'urn:example:resource' }),
    ),
  )
  await t.notThrowsAsync(
    lib.clientCredentialsGrantRequest(tIssuer, tClient, { resource: 'urn:example:resource' }),
  )
  await t.notThrowsAsync(
    lib.clientCredentialsGrantRequest(tIssuer, tClient, [['resource', 'urn:example:resource']]),
  )
})

test('clientCredentialsGrantRequest() w/ Extra Parameters', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    token_endpoint: endpoint('token-2'),
  }

  t.context
    .intercept({
      path: '/token-2',
      method: 'POST',
      body(body) {
        const params = new URLSearchParams(body)
        return params.get('resource') === 'urn:example:resource'
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })

  await t.notThrowsAsync(
    lib.clientCredentialsGrantRequest(
      tIssuer,
      tClient,
      new URLSearchParams('resource=urn:example:resource'),
    ),
  )
})

test('clientCredentialsGrantRequest() w/ Custom Headers', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    token_endpoint: endpoint('token-headers'),
  }

  t.context
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
    await t.notThrowsAsync(
      lib.clientCredentialsGrantRequest(tIssuer, tClient, new URLSearchParams(), { headers }),
    )
  }
})

test('clientCredentialsGrantRequest() w/ DPoP', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    token_endpoint: endpoint('token-3'),
  }

  t.context
    .intercept({
      path: '/token-3',
      method: 'POST',
      headers: {
        dpop: /.+/,
      },
    })
    .reply(200, { access_token: 'token', token_type: 'DPoP' })

  const DPoP = await lib.generateKeyPair('ES256')
  await t.notThrowsAsync(
    lib.clientCredentialsGrantRequest(tIssuer, tClient, new URLSearchParams(), { DPoP }),
  )
})

test('processClientCredentialsResponse()', async (t) => {
  await t.throwsAsync(lib.processClientCredentialsResponse(issuer, client, null as any), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(
    lib.processClientCredentialsResponse(issuer, client, getResponse('', { status: 404 })),
    {
      message: '"response" is not a conform Token Endpoint response',
    },
  )
  await t.throwsAsync(lib.processClientCredentialsResponse(issuer, client, getResponse('{"')), {
    message: 'failed to parse "response" body as JSON',
  })
  await t.throwsAsync(lib.processClientCredentialsResponse(issuer, client, getResponse('null')), {
    message: '"response" body must be a top level object',
  })
  await t.throwsAsync(lib.processClientCredentialsResponse(issuer, client, getResponse('[]')), {
    message: '"response" body must be a top level object',
  })
  await t.throwsAsync(
    lib.processClientCredentialsResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ token_type: 'Bearer' })),
    ),
    {
      message: '"response" body "access_token" property must be a non-empty string',
    },
  )
  await t.throwsAsync(
    lib.processClientCredentialsResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token' })),
    ),
    {
      message: '"response" body "token_type" property must be a non-empty string',
    },
  )
  await t.throwsAsync(
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
      message: '"response" body "expires_in" property must be a positive number',
    },
  )

  t.deepEqual(
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

  t.true(
    lib.isOAuth2Error(
      await lib.processClientCredentialsResponse(
        issuer,
        client,
        getResponse(JSON.stringify({ error: 'invalid_grant' }), { status: 400 }),
      ),
    ),
  )

  t.false(
    lib.isOAuth2Error(
      await lib.processClientCredentialsResponse(
        issuer,
        client,
        getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer' })),
      ),
    ),
  )
})
