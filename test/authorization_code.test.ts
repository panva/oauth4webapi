import anyTest, { type TestFn } from 'ava'
import * as querystring from 'node:querystring'
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

const tClient: lib.Client = { ...client, client_secret: 'foo' }

function cb(params: string) {
  const callbackParameters = lib.validateAuthResponse(
    { issuer: 'foo' },
    { client_id: 'foo' },
    new URLSearchParams(),
    lib.expectNoState,
  )
  for (const param of callbackParameters.keys()) {
    callbackParameters.delete(param)
  }
  for (const [key, value] of Object.entries(querystring.parse(params))) {
    if (Array.isArray(value)) {
      for (const v of value) {
        callbackParameters.append(key, v)
      }
    } else if (typeof value === 'string') {
      callbackParameters.set(key, value)
    }
  }
  return callbackParameters
}

test('authorizationCodeGrantRequest()', async (t) => {
  await t.throwsAsync(
    lib.authorizationCodeGrantRequest(
      issuer,
      tClient,
      lib.None(),
      cb('code=authorization_code'),
      'redirect_uri',
      'verifier',
    ),
    {
      message: 'authorization server metadata does not contain a valid "as.token_endpoint"',
    },
  )

  await t.throwsAsync(
    lib.authorizationCodeGrantRequest(
      issuer,
      tClient,
      lib.None(),
      null as any,
      'redirect_uri',
      'verifier',
    ),
    {
      message:
        '"callbackParameters" must be an instance of URLSearchParams obtained from "validateAuthResponse()", or "validateJwtAuthResponse()',
    },
  )

  await t.throwsAsync(
    lib.authorizationCodeGrantRequest(
      issuer,
      tClient,
      lib.None(),
      cb(''),
      'redirect_uri',
      'veirfier',
    ),
    {
      message: 'no authorization code in "callbackParameters"',
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
        'user-agent': UA,
      },
      body(body) {
        const params = new URLSearchParams(body)
        return (
          params.get('grant_type') === 'authorization_code' &&
          params.get('code') === 'authorization_code' &&
          params.get('code_verifier') === 'verifier' &&
          params.get('redirect_uri') === 'redirect_uri'
        )
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })

  await t.notThrowsAsync(
    lib.authorizationCodeGrantRequest(
      tIssuer,
      tClient,
      lib.None(),
      cb('code=authorization_code'),
      'redirect_uri',
      'verifier',
    ),
  )
})

test('authorizationCodeGrantRequest() w/ Extra Parameters', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    token_endpoint: endpoint('token-2'),
  }

  t.context
    .intercept({
      path: '/token-2',
      method: 'POST',
      body(body) {
        return new URLSearchParams(body).get('resource') === 'urn:example:resource'
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })
    .times(3)

  await t.notThrowsAsync(
    lib.authorizationCodeGrantRequest(
      tIssuer,
      tClient,
      lib.None(),
      cb('code=authorization_code'),
      'redirect_uri',
      'verifier',
      {
        additionalParameters: new URLSearchParams('resource=urn:example:resource'),
      },
    ),
  )

  await t.notThrowsAsync(
    lib.authorizationCodeGrantRequest(
      tIssuer,
      tClient,
      lib.None(),
      cb('code=authorization_code'),
      'redirect_uri',
      'verifier',
      {
        additionalParameters: {
          resource: 'urn:example:resource',
        },
      },
    ),
  )

  await t.notThrowsAsync(
    lib.authorizationCodeGrantRequest(
      tIssuer,
      tClient,
      lib.None(),
      cb('code=authorization_code'),
      'redirect_uri',
      'verifier',
      {
        additionalParameters: [['resource', 'urn:example:resource']],
      },
    ),
  )
})

test('authorizationCodeGrantRequest() w/ Custom Headers', async (t) => {
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
      lib.authorizationCodeGrantRequest(
        tIssuer,
        tClient,
        lib.None(),
        cb('code=authorization_code'),
        'redirect_uri',
        'verifier',
        { headers },
      ),
    )
  }
})

test('authorizationCodeGrantRequest() w/ DPoP', async (t) => {
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
    lib.authorizationCodeGrantRequest(
      tIssuer,
      tClient,
      lib.None(),
      cb('code=authorization_code'),
      'redirect_uri',
      'verifier',
      { DPoP },
    ),
  )
})

test('processAuthorizationCodeResponse()', async (t) => {
  await t.throwsAsync(lib.processAuthorizationCodeResponse(issuer, client, null as any), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(
    lib.processAuthorizationCodeResponse(issuer, client, getResponse('', { status: 404 })),
    {
      message: '"response" is not a conform Token Endpoint response (unexpected HTTP status code)',
    },
  )
  await t.throwsAsync(lib.processAuthorizationCodeResponse(issuer, client, getResponse('{"')), {
    message: 'failed to parse "response" body as JSON',
  })
  await t.throwsAsync(lib.processAuthorizationCodeResponse(issuer, client, getResponse('null')), {
    message: '"response" body must be a top level object',
  })
  await t.throwsAsync(lib.processAuthorizationCodeResponse(issuer, client, getResponse('[]')), {
    message: '"response" body must be a top level object',
  })
  await t.throwsAsync(
    lib.processAuthorizationCodeResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ token_type: 'Bearer' })),
    ),
    {
      message: '"response" body "access_token" property must be a string',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token' })),
    ),
    {
      message: '"response" body "token_type" property must be a string',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeResponse(
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
    lib.processAuthorizationCodeResponse(
      issuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'unrecognized',
        }),
      ),
    ),
    {
      message: 'unsupported `token_type` value',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer', scope: null })),
    ),
    {
      message: '"response" body "scope" property must be a string',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeResponse(
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
    lib.processAuthorizationCodeResponse(
      issuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          id_token: 'something.resembling.anid_token',
        }),
      ),
    ),
    {
      code: 'OAUTH_PARSE_ERROR',
    },
  )

  t.deepEqual(
    await lib.processAuthorizationCodeResponse(
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
    ),
    {
      access_token: 'token',
      token_type: 'bearer',
      expires_in: 60,
      scope: 'api:read',
      refresh_token: 'refresh_token',
    },
  )

  let err = await t.throwsAsync(
    lib.processAuthorizationCodeResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ error: 'invalid_grant' }), { status: 400 }),
    ),
  )

  if (err instanceof lib.ResponseBodyError) {
    t.is(err.error, 'invalid_grant')
  } else {
    t.fail()
  }
})

test('processAuthorizationCodeResponse() - ignores signatures', async (t) => {
  await t.notThrowsAsync(
    lib
      .processAuthorizationCodeResponse(
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

test('processAuthorizationCodeResponse() with an ID Token (alg signalled)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }
  await t.notThrowsAsync(
    lib
      .processAuthorizationCodeResponse(
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

test('processAuthorizationCodeResponse() with an ID Token (alg specified)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processAuthorizationCodeResponse(
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

test('processAuthorizationCodeResponse() with an ID Token (alg default)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processAuthorizationCodeResponse(
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

test('processAuthorizationCodeResponse() with an ID Token (alg mismatches)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.throwsAsync(
    lib.processAuthorizationCodeResponse(
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
    lib.processAuthorizationCodeResponse(
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
    lib.processAuthorizationCodeResponse(
      tIssuer,
      { ...client, id_token_signed_response_alg: 'RS256' },
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

test('processAuthorizationCodeResponse() with an ID Token typ: "JWT"', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processAuthorizationCodeResponse(
      tIssuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({})
            .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
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

test('processAuthorizationCodeResponse() with an ID Token typ: "application/jwt"', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processAuthorizationCodeResponse(
      tIssuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({})
            .setProtectedHeader({ alg: 'RS256', typ: 'application/jwt' })
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

test(`processAuthorizationCodeResponse() with an ID Token`, async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    id_token_signing_alg_values_supported: ['ES256'],
    jwks_uri: endpoint('jwks'),
  }

  await t.notThrowsAsync(
    lib.processAuthorizationCodeResponse(
      tIssuer,
      client,
      getResponse(
        JSON.stringify({
          access_token:
            'YmJiZTAwYmYtMzgyOC00NzhkLTkyOTItNjJjNDM3MGYzOWIy9sFhvH8K_x8UIHj1osisS57f5DduL',
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

test('processAuthorizationCodeResponse() nonce checks', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.throwsAsync(
    lib.processAuthorizationCodeResponse(
      tIssuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({
            nonce: 'randomvalue',
          })
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
    { message: 'unexpected ID Token "nonce" claim value' },
  )

  await t.throwsAsync(
    lib.processAuthorizationCodeResponse(
      tIssuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({
            nonce: 'randomvalue',
          })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuer(issuer.issuer)
            .setSubject('urn:example:subject')
            .setAudience(client.client_id)
            .setExpirationTime('5m')
            .setIssuedAt()
            .sign(t.context.RS256.privateKey),
        }),
      ),
      { expectedNonce: 'anotherrandom-value' },
    ),
    { message: 'unexpected ID Token "nonce" claim value' },
  )

  await t.throwsAsync(
    lib.processAuthorizationCodeResponse(
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
      {
        expectedNonce: 'anotherrandom-value',
      },
    ),
    { message: 'JWT "nonce" (nonce) claim missing' },
  )

  await t.notThrowsAsync(
    lib.processAuthorizationCodeResponse(
      tIssuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({ nonce: 'random-value' })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuer(issuer.issuer)
            .setSubject('urn:example:subject')
            .setAudience(client.client_id)
            .setExpirationTime('5m')
            .setIssuedAt()
            .sign(t.context.RS256.privateKey),
        }),
      ),
      {
        expectedNonce: 'random-value',
      },
    ),
  )
})

test('processAuthorizationCodeResponse() auth_time checks', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  for (const auth_time of [-1, null, '1', [], {}, true]) {
    await t.throwsAsync(
      lib.processAuthorizationCodeResponse(
        tIssuer,
        client,
        getResponse(
          JSON.stringify({
            access_token: 'token',
            token_type: 'Bearer',
            id_token: await new jose.SignJWT({ auth_time })
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
      {
        message:
          /ID Token "auth_time" \(authentication time\) must be a (?:positive|non-negative)? ?number/,
      },
    )
  }
})

test('processAuthorizationCodeResponse() azp checks', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.throwsAsync(
    lib.processAuthorizationCodeResponse(
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
            .setAudience([client.client_id, 'other-aud'])
            .setExpirationTime('5m')
            .setIssuedAt()
            .sign(t.context.RS256.privateKey),
        }),
      ),
    ),
    { message: 'ID Token "aud" (audience) claim includes additional untrusted audiences' },
  )

  await t.throwsAsync(
    lib.processAuthorizationCodeResponse(
      tIssuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({ azp: 'not-my-client_id' })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuer(issuer.issuer)
            .setSubject('urn:example:subject')
            .setAudience([client.client_id, 'other-aud'])
            .setExpirationTime('5m')
            .setIssuedAt()
            .sign(t.context.RS256.privateKey),
        }),
      ),
    ),
    { message: 'unexpected ID Token "azp" (authorized party) claim value' },
  )

  await t.notThrowsAsync(
    lib.processAuthorizationCodeResponse(
      tIssuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({
            azp: client.client_id,
          })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuer(issuer.issuer)
            .setSubject('urn:example:subject')
            .setAudience([client.client_id, 'other-aud'])
            .setExpirationTime('5m')
            .setIssuedAt()
            .sign(t.context.RS256.privateKey),
        }),
      ),
    ),
  )
})
