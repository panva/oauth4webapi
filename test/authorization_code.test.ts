import anyTest, { type TestFn } from 'ava'
import * as querystring from 'node:querystring'
import setup, {
  ALGS,
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

test.before(setup)
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
  if (lib.isOAuth2Error(callbackParameters)) throw new Error()
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
      cb('code=authorization_code'),
      'redirect_uri',
      'verifier',
    ),
    {
      message: '"as.token_endpoint" must be a string',
    },
  )

  await t.throwsAsync(
    lib.authorizationCodeGrantRequest(issuer, tClient, null as any, 'redirect_uri', 'verifier'),
    {
      message:
        '"callbackParameters" must be an instance of URLSearchParams obtained from "validateAuthResponse()", or "validateJwtAuthResponse()',
    },
  )

  await t.throwsAsync(
    lib.authorizationCodeGrantRequest(
      issuer,
      tClient,
      cb('code=authorization_code'),
      null as any,
      'verifier',
    ),
    {
      message: '"redirectUri" must be a non-empty string',
    },
  )

  await t.throwsAsync(
    lib.authorizationCodeGrantRequest(
      issuer,
      tClient,
      cb('code=authorization_code'),
      'redirect_uri',
      null as any,
    ),
    {
      message: '"codeVerifier" must be a non-empty string',
    },
  )

  await t.throwsAsync(
    lib.authorizationCodeGrantRequest(issuer, tClient, cb(''), 'redirect_uri', 'veirfier'),
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

  const DPoP = t.context.ES256
  await t.notThrowsAsync(
    lib.authorizationCodeGrantRequest(
      tIssuer,
      tClient,
      cb('code=authorization_code'),
      'redirect_uri',
      'verifier',
      { DPoP },
    ),
  )
})

test('processAuthorizationCodeOAuth2Response()', async (t) => {
  await t.throwsAsync(lib.processAuthorizationCodeOAuth2Response(issuer, client, null as any), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(
    lib.processAuthorizationCodeOAuth2Response(issuer, client, getResponse('', { status: 404 })),
    {
      message: '"response" is not a conform Token Endpoint response',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeOAuth2Response(issuer, client, getResponse('{"')),
    {
      message: 'failed to parse "response" body as JSON',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeOAuth2Response(issuer, client, getResponse('null')),
    {
      message: '"response" body must be a top level object',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeOAuth2Response(issuer, client, getResponse('[]')),
    {
      message: '"response" body must be a top level object',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeOAuth2Response(
      issuer,
      client,
      getResponse(JSON.stringify({ token_type: 'Bearer' })),
    ),
    {
      message: '"response" body "access_token" property must be a non-empty string',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeOAuth2Response(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token' })),
    ),
    {
      message: '"response" body "token_type" property must be a non-empty string',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeOAuth2Response(
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
  await t.throwsAsync(
    lib.processAuthorizationCodeOAuth2Response(
      issuer,
      client,
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'unrecognized',
          expires_in: new Date().toUTCString(),
        }),
      ),
    ),
    {
      message: 'unsupported `token_type` value',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeOAuth2Response(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer', scope: null })),
    ),
    {
      message: '"response" body "scope" property must be a string',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeOAuth2Response(
      issuer,
      client,
      getResponse(
        JSON.stringify({ access_token: 'token', token_type: 'Bearer', refresh_token: null }),
      ),
    ),
    {
      message: '"response" body "refresh_token" property must be a non-empty string',
    },
  )
  for (const id_token of [null, 1, '', false, {}]) {
    t.deepEqual(
      await lib.processAuthorizationCodeOAuth2Response(
        issuer,
        client,
        getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer', id_token })),
      ),
      {
        access_token: 'token',
        token_type: 'bearer',
      },
    )
  }

  t.deepEqual(
    await lib.processAuthorizationCodeOAuth2Response(
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

  t.true(
    lib.isOAuth2Error(
      await lib.processAuthorizationCodeOAuth2Response(
        issuer,
        client,
        getResponse(JSON.stringify({ error: 'invalid_grant' }), { status: 400 }),
      ),
    ),
  )

  t.false(
    lib.isOAuth2Error(
      await lib.processAuthorizationCodeOAuth2Response(
        issuer,
        client,
        getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer' })),
      ),
    ),
  )
})

test('processAuthorizationCodeOpenIDResponse() - ignores signatures', async (t) => {
  await t.notThrowsAsync(
    lib
      .processAuthorizationCodeOpenIDResponse(
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
        if (lib.isOAuth2Error(result)) {
          t.fail()
        } else {
          t.assert(lib.getValidatedIdTokenClaims(result))
        }
      }),
  )
})

test('processAuthorizationCodeOpenIDResponse() with an ID Token (alg signalled)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }
  await t.notThrowsAsync(
    lib
      .processAuthorizationCodeOpenIDResponse(
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
        if (lib.isOAuth2Error(result)) {
          t.fail()
        } else {
          t.assert(lib.getValidatedIdTokenClaims(result))
          t.throws(() => lib.getValidatedIdTokenClaims({ ...result }), {
            name: 'TypeError',
            message:
              '"ref" was already garbage collected or did not resolve from the proper sources',
          })
        }
      }),
  )
})

test('processAuthorizationCodeOpenIDResponse() with an ID Token (alg specified)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
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

test('processAuthorizationCodeOpenIDResponse() with an ID Token (alg default)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
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

test('processAuthorizationCodeOpenIDResponse() with an ID Token (alg mismatches)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.throwsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
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
    lib.processAuthorizationCodeOpenIDResponse(
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
    lib.processAuthorizationCodeOpenIDResponse(
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

test('processAuthorizationCodeOpenIDResponse() with an ID Token typ: "JWT"', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
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

test('processAuthorizationCodeOpenIDResponse() with an ID Token typ: "application/jwt"', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
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

for (const alg of ALGS) {
  test(`processAuthorizationCodeOpenIDResponse() with an ${alg} ID Token`, async (t) => {
    const tIssuer: lib.AuthorizationServer = {
      ...issuer,
      id_token_signing_alg_values_supported: [alg],
      jwks_uri: endpoint('jwks'),
    }

    await t.notThrowsAsync(
      lib.processAuthorizationCodeOpenIDResponse(
        tIssuer,
        client,
        getResponse(
          JSON.stringify({
            access_token:
              'YmJiZTAwYmYtMzgyOC00NzhkLTkyOTItNjJjNDM3MGYzOWIy9sFhvH8K_x8UIHj1osisS57f5DduL',
            token_type: 'Bearer',
            id_token: await new jose.SignJWT({})
              .setProtectedHeader({ alg })
              .setIssuer(issuer.issuer)
              .setSubject('urn:example:subject')
              .setAudience(client.client_id)
              .setExpirationTime('5m')
              .setIssuedAt()
              .sign(t.context[alg].privateKey),
          }),
        ),
      ),
    )
  })
}

test('processAuthorizationCodeOpenIDResponse() nonce checks', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.throwsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
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
    lib.processAuthorizationCodeOpenIDResponse(
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
      'anotherrandom-value',
    ),
    { message: 'unexpected ID Token "nonce" claim value' },
  )

  await t.throwsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
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
      'anotherrandom-value',
    ),
    { message: 'ID Token "nonce" claim missing' },
  )

  for (const nonce of [null, '']) {
    await t.throwsAsync(
      lib.processAuthorizationCodeOpenIDResponse(
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
        nonce as any,
      ),
      { message: '"expectedNonce" must be a non-empty string', name: 'TypeError' },
    )
  }

  await t.notThrowsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
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
      'random-value',
    ),
  )
})

test('processAuthorizationCodeOpenIDResponse() auth_time checks', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  for (const auth_time of [0, -1, null, '1', [], {}, true]) {
    await t.throwsAsync(
      lib.processAuthorizationCodeOpenIDResponse(
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
      { message: 'ID Token "auth_time" (authentication time) must be a positive number' },
    )
  }
})

test('processAuthorizationCodeOpenIDResponse() azp checks', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.throwsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
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
    lib.processAuthorizationCodeOpenIDResponse(
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
    lib.processAuthorizationCodeOpenIDResponse(
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
