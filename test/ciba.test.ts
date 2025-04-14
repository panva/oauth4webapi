import anyTest, { type TestFn } from 'ava'
import setup, {
  client,
  endpoint,
  getResponse,
  issuer,
  setupJwks,
  teardown,
  type ContextWithAlgs,
  UA,
} from './_setup.js'
import * as jose from 'jose'
import * as lib from '../src/index.js'
import * as tools from './_tools.js'

const test = anyTest as TestFn<ContextWithAlgs>

test.before(setup())
test.after(teardown)
test.before(setupJwks)

const tClient: lib.Client = { ...client, token_endpoint_auth_method: 'none' }

test('backchannelAuthenticationRequest()', async (t) => {
  await t.throwsAsync(
    lib.backchannelAuthenticationRequest(issuer, tClient, lib.None(), new URLSearchParams()),
    {
      message:
        'authorization server metadata does not contain a valid "as.backchannel_authentication_endpoint"',
    },
  )

  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    backchannel_authentication_endpoint: endpoint('ciba-1'),
  }

  t.context
    .intercept({
      path: '/ciba-1',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'user-agent': UA,
      },
      body(body) {
        const params = new URLSearchParams(body)
        return (
          params.get('client_id') === client.client_id &&
          params.get('resource') === 'urn:example:resource'
        )
      },
    })
    .reply(200, '')
    .times(3)

  await t.notThrowsAsync(
    lib.backchannelAuthenticationRequest(
      tIssuer,
      tClient,
      lib.None(),
      new URLSearchParams({ resource: 'urn:example:resource' }),
    ),
  )
  await t.notThrowsAsync(
    lib.backchannelAuthenticationRequest(tIssuer, tClient, lib.None(), {
      resource: 'urn:example:resource',
    }),
  )
  await t.notThrowsAsync(
    lib.backchannelAuthenticationRequest(tIssuer, tClient, lib.None(), [
      ['resource', 'urn:example:resource'],
    ]),
  )
})

test('backchannelAuthenticationRequest() w/ Custom Headers', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    backchannel_authentication_endpoint: endpoint('ciba-headers'),
  }

  t.context
    .intercept({
      path: '/ciba-headers',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'user-agent': 'foo',
        foo: 'bar',
      },
    })
    .reply(200, '')
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
      lib.backchannelAuthenticationRequest(tIssuer, tClient, lib.None(), new URLSearchParams(), {
        headers,
      }),
    )
  }
})

test('processBackchannelAuthenticationResponse()', async (t) => {
  await t.throwsAsync(lib.processBackchannelAuthenticationResponse(issuer, client, null as any), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(
    lib.processBackchannelAuthenticationResponse(issuer, client, getResponse('', { status: 404 })),
    {
      message:
        '"response" is not a conform Backchannel Authentication Endpoint response (unexpected HTTP status code)',
    },
  )
  await t.throwsAsync(
    lib.processBackchannelAuthenticationResponse(
      issuer,
      client,
      getResponse('{"', { status: 200 }),
    ),
    {
      message: 'failed to parse "response" body as JSON',
    },
  )
  await t.throwsAsync(
    lib.processBackchannelAuthenticationResponse(
      issuer,
      client,
      getResponse('null', { status: 200 }),
    ),
    {
      message: '"response" body must be a top level object',
    },
  )
  await t.throwsAsync(
    lib.processBackchannelAuthenticationResponse(
      issuer,
      client,
      getResponse('[]', { status: 200 }),
    ),
    {
      message: '"response" body must be a top level object',
    },
  )

  const validResponse = {
    auth_req_id: 'auth_req_id',
    expires_in: 300,
    interval: 5,
  }

  t.deepEqual(
    await lib.processBackchannelAuthenticationResponse(
      issuer,
      client,
      getResponse(JSON.stringify(validResponse), { status: 200 }),
    ),
    validResponse,
  )

  await t.notThrowsAsync(
    lib.processBackchannelAuthenticationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ ...validResponse, verification_uri_complete: undefined }), {
        status: 200,
      }),
    ),
  )

  await t.notThrowsAsync(
    lib.processBackchannelAuthenticationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ ...validResponse, interval: undefined }), { status: 200 }),
    ),
  )

  await t.throwsAsync(
    lib.processBackchannelAuthenticationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ ...validResponse, auth_req_id: undefined }), { status: 200 }),
    ),
    {
      message: '"response" body "auth_req_id" property must be a string',
    },
  )

  await t.throwsAsync(
    lib.processBackchannelAuthenticationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ ...validResponse, expires_in: undefined }), { status: 200 }),
    ),
    {
      message: '"response" body "expires_in" property must be a number',
    },
  )

  await t.throwsAsync(
    lib.processBackchannelAuthenticationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ ...validResponse, interval: null }), { status: 200 }),
    ),
    {
      message: '"response" body "interval" property must be a number',
    },
  )
})

test('backchannelAuthenticationGrantRequest()', async (t) => {
  await t.throwsAsync(
    lib.backchannelAuthenticationGrantRequest(issuer, tClient, lib.None(), 'auth_req_id'),
    {
      message: 'authorization server metadata does not contain a valid "as.token_endpoint"',
    },
  )

  await t.throwsAsync(
    lib.backchannelAuthenticationGrantRequest(issuer, tClient, lib.None(), null as any),
    {
      message: '"authReqId" must be a string',
    },
  )

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
      },
      body(body) {
        const params = new URLSearchParams(body)
        return (
          params.get('grant_type') === 'urn:openid:params:grant-type:ciba' &&
          params.get('auth_req_id') === 'auth_req_id'
        )
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })

  await t.notThrowsAsync(
    lib.backchannelAuthenticationGrantRequest(tIssuer, tClient, lib.None(), 'auth_req_id'),
  )
})

test('backchannelAuthenticationGrantRequest() w/ Extra Parameters', async (t) => {
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
    .times(3)

  await t.notThrowsAsync(
    lib.backchannelAuthenticationGrantRequest(tIssuer, tClient, lib.None(), 'auth_req_id', {
      additionalParameters: new URLSearchParams('resource=urn:example:resource'),
    }),
  )

  await t.notThrowsAsync(
    lib.backchannelAuthenticationGrantRequest(tIssuer, tClient, lib.None(), 'auth_req_id', {
      additionalParameters: {
        resource: 'urn:example:resource',
      },
    }),
  )

  await t.notThrowsAsync(
    lib.backchannelAuthenticationGrantRequest(tIssuer, tClient, lib.None(), 'auth_req_id', {
      additionalParameters: [['resource', 'urn:example:resource']],
    }),
  )
})

test('backchannelAuthenticationGrantRequest() w/ Custom Headers', async (t) => {
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
      lib.backchannelAuthenticationGrantRequest(tIssuer, tClient, lib.None(), 'auth_req_id', {
        headers,
      }),
    )
  }
})

test('backchannelAuthenticationGrantRequest() w/ DPoP', async (t) => {
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

  const DPoP = lib.DPoP(tClient, await lib.generateKeyPair('ES256'))
  await t.notThrowsAsync(
    lib.backchannelAuthenticationGrantRequest(tIssuer, tClient, lib.None(), 'auth_req_id', {
      DPoP,
    }),
  )
})

test('processBackchannelAuthenticationGrantResponse() without ID Tokens', async (t) => {
  await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(issuer, client, null as any),
    {
      message: '"response" must be an instance of Response',
    },
  )
  await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(
      issuer,
      client,
      getResponse('', { status: 404 }),
    ),
    {
      message: '"response" is not a conform Token Endpoint response (unexpected HTTP status code)',
    },
  )
  await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(issuer, client, getResponse('{"')),
    {
      message: 'failed to parse "response" body as JSON',
    },
  )
  await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(issuer, client, getResponse('null')),
    {
      message: '"response" body must be a top level object',
    },
  )
  await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(issuer, client, getResponse('[]')),
    {
      message: '"response" body must be a top level object',
    },
  )
  await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ token_type: 'Bearer' })),
    ),
    {
      message: '"response" body "access_token" property must be a string',
    },
  )
  await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token' })),
    ),
    {
      message: '"response" body "token_type" property must be a string',
    },
  )
  await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(
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
  await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer', scope: null })),
    ),
    {
      message: '"response" body "scope" property must be a string',
    },
  )
  await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(
      issuer,
      client,
      getResponse(
        JSON.stringify({ access_token: 'token', token_type: 'Bearer', refresh_token: null }),
      ),
    ),
    {
      message: '"response" body "refresh_token" property must be a string',
    },
  )
  await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer', id_token: null })),
    ),
    {
      message: '"response" body "id_token" property must be a string',
    },
  )

  const response = await lib.processBackchannelAuthenticationGrantResponse(
    issuer,
    client,
    getResponse(
      JSON.stringify({
        access_token: 'token',
        token_type: 'Bearer',
        expires_in: 60,
        scope: 'api:read',
        refresh_token: 'refresh_token',
      }),
    ),
  )

  t.deepEqual(response, {
    access_token: 'token',
    token_type: 'bearer',
    expires_in: 60,
    scope: 'api:read',
    refresh_token: 'refresh_token',
  })

  t.is(lib.getValidatedIdTokenClaims(response), undefined)

  const err = await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ error: 'invalid_grant' }), { status: 400 }),
    ),
  )

  t.true(
    err instanceof lib.ResponseBodyError &&
      err.error === 'invalid_grant' &&
      err.status === 400 &&
      err.response.bodyUsed === true,
  )

  await lib.processBackchannelAuthenticationGrantResponse(
    issuer,
    client,
    getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer' })),
  )
})

test('processBackchannelAuthenticationGrantResponse() - ignores signatures', async (t) => {
  await t.notThrowsAsync(
    lib
      .processBackchannelAuthenticationGrantResponse(
        { ...issuer, id_token_signing_alg_values_supported: ['ES256'] },
        client,
        getResponse(
          JSON.stringify({
            access_token: 'token',
            token_type: 'Bearer',
            id_token: tools.mangleJwtSignature(
              await new jose.SignJWT({})
                .setProtectedHeader({ alg: 'ES256' })
                .setIssuer(issuer.issuer)
                .setSubject('urn:example:subject')
                .setAudience(client.client_id)
                .setExpirationTime('5m')
                .setIssuedAt()
                .sign(t.context.ES256.privateKey),
            ),
          }),
        ),
      )
      .then(async (result) => {
        t.assert(lib.getValidatedIdTokenClaims(result))
      }),
  )
})

test('processBackchannelAuthenticationGrantResponse() with an ID Token (alg signalled)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib
      .processBackchannelAuthenticationGrantResponse(
        { ...tIssuer, id_token_signing_alg_values_supported: ['ES256'] },
        client,
        getResponse(
          JSON.stringify({
            access_token: 'token',
            token_type: 'Bearer',
            id_token: await new jose.SignJWT({})
              .setProtectedHeader({ alg: 'ES256' })
              .setIssuer(issuer.issuer)
              .setSubject('urn:example:subject')
              .setAudience(client.client_id)
              .setExpirationTime('5m')
              .setIssuedAt()
              .sign(t.context.ES256.privateKey),
          }),
        ),
      )
      .then(async (result) => {
        t.assert(lib.getValidatedIdTokenClaims(result))
        t.throws(() => lib.getValidatedIdTokenClaims({ ...result }), {
          name: 'TypeError',
          message: '"ref" was already garbage collected or did not resolve from the proper sources',
        })
      }),
  )
})

test('processBackchannelAuthenticationGrantResponse() with an ID Token (alg specified)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processBackchannelAuthenticationGrantResponse(
      tIssuer,
      { ...client, id_token_signed_response_alg: 'ES256' },
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({})
            .setProtectedHeader({ alg: 'ES256' })
            .setIssuer(issuer.issuer)
            .setSubject('urn:example:subject')
            .setAudience(client.client_id)
            .setExpirationTime('5m')
            .setIssuedAt()
            .sign(t.context.ES256.privateKey),
        }),
      ),
    ),
  )
})

test('processBackchannelAuthenticationGrantResponse() with an ID Token (alg default)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processBackchannelAuthenticationGrantResponse(
      tIssuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({})
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuer(issuer.issuer)
            .setSubject('urn:example:subject')
            .setAudience(client.client_id)
            .setExpirationTime('5m')
            .setIssuedAt()
            .sign(t.context.RS256.privateKey),
        }),
      ),
    ),
  )
})

test('processBackchannelAuthenticationGrantResponse() with an ID Token (alg mismatches)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(
      tIssuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({})
            .setProtectedHeader({ alg: 'ES256' })
            .setIssuer(issuer.issuer)
            .setSubject('urn:example:subject')
            .setAudience(client.client_id)
            .setExpirationTime('5m')
            .setIssuedAt()
            .sign(t.context.ES256.privateKey),
        }),
      ),
    ),
    { message: 'unexpected JWT "alg" header parameter' },
  )

  await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(
      {
        ...tIssuer,
        id_token_signing_alg_values_supported: ['RS256'],
      },
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({})
            .setProtectedHeader({ alg: 'ES256' })
            .setIssuer(issuer.issuer)
            .setSubject('urn:example:subject')
            .setAudience(client.client_id)
            .setExpirationTime('5m')
            .setIssuedAt()
            .sign(t.context.ES256.privateKey),
        }),
      ),
    ),
    { message: 'unexpected JWT "alg" header parameter' },
  )

  await t.throwsAsync(
    lib.processBackchannelAuthenticationGrantResponse(
      tIssuer,
      {
        ...client,
        id_token_signed_response_alg: 'RS256',
      },
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({})
            .setProtectedHeader({ alg: 'ES256' })
            .setIssuer(issuer.issuer)
            .setSubject('urn:example:subject')
            .setAudience(client.client_id)
            .setExpirationTime('5m')
            .setIssuedAt()
            .sign(t.context.ES256.privateKey),
        }),
      ),
    ),
    { message: 'unexpected JWT "alg" header parameter' },
  )
})
