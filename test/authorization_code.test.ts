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
import * as jose from 'jose'
import * as lib from '../src/index.js'

const j = JSON.stringify
const test = anyTest as TestFn<Context & { [alg: string]: CryptoKeyPair }>

test.before(setup)
test.after(teardown)

test.before(async (t) => {
  for (const alg of ['RS', 'ES', 'PS'].map((s) => [`${s}256`]).flat()) {
    t.context[alg] = await lib.generateKeyPair(<lib.JWSAlgorithm>alg)
  }

  t.context
    .intercept({
      path: '/jwks',
      method: 'GET',
    })
    .reply(200, {
      keys: await Promise.all(
        ['RS', 'ES', 'PS']
          .map((s) => [`${s}256`])
          .flat()
          .map((alg) =>
            jose.exportJWK(t.context[alg].publicKey).then((jwk) => {
              if (alg.startsWith('RS') || alg.startsWith('PS')) {
                jwk.alg = alg
              }
              return jwk
            }),
          ),
      ),
    })
})

const tClient: lib.Client = { ...client, client_secret: 'foo' }

const callbackParameters = lib.validateAuthResponse(
  { issuer: 'foo' },
  { client_id: 'foo' },
  new URLSearchParams(),
  lib.expectNoState,
)
if (lib.isOAuth2Error(callbackParameters)) throw new Error()

function cb(arg: any): Exclude<ReturnType<typeof lib.validateAuthResponse>, lib.OAuth2Error> {
  // @ts-ignore
  return new callbackParameters.constructor(arg)
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
      message: '"issuer.token_endpoint" must be a string',
    },
  )

  await t.throwsAsync(
    lib.authorizationCodeGrantRequest(issuer, tClient, <any>null, 'redirect_uri', 'verifier'),
    {
      message:
        '"callbackParameters" must be an instance of CallbackParameters obtained from "validateAuthResponse()", or "validateJwtAuthResponse()',
    },
  )

  await t.throwsAsync(
    lib.authorizationCodeGrantRequest(
      issuer,
      tClient,
      cb('code=authorization_code'),
      <any>null,
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
      <any>null,
    ),
    {
      message: '"codeVerifier" must be a non-empty string',
    },
  )

  await t.throwsAsync(
    lib.authorizationCodeGrantRequest(issuer, tClient, cb(''), 'redirect_uri', 'veirfier'),
    {
      message: 'no authorization code received',
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
        const params = new URLSearchParams(body)
        return params.get('resource') === 'urn:example:resource'
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
      {
        additionalParameters: new URLSearchParams('resource=urn:example:resource'),
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

  await t.notThrowsAsync(
    lib.authorizationCodeGrantRequest(
      tIssuer,
      tClient,
      cb('code=authorization_code'),
      'redirect_uri',
      'verifier',
      {
        headers: new Headers([
          ['accept', 'will be overwritten'],
          ['user-agent', 'foo'],
          ['foo', 'bar'],
        ]),
      },
    ),
  )
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

test('processAuthorizationCodeOAuth2Response() without ID Tokens', async (t) => {
  await t.throwsAsync(lib.processAuthorizationCodeOAuth2Response(issuer, client, <any>null), {
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
      getResponse(j({ token_type: 'Bearer' })),
    ),
    {
      message: '"response" body "access_token" property must be a non-empty string',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeOAuth2Response(
      issuer,
      client,
      getResponse(j({ access_token: 'token' })),
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
        j({ access_token: 'token', token_type: 'Bearer', expires_in: new Date().toUTCString() }),
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
      getResponse(j({ access_token: 'token', token_type: 'Bearer', scope: null })),
    ),
    {
      message: '"response" body "scope" property must be a non-empty string',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeOAuth2Response(
      issuer,
      client,
      getResponse(j({ access_token: 'token', token_type: 'Bearer', refresh_token: null })),
    ),
    {
      message: '"response" body "refresh_token" property must be a non-empty string',
    },
  )
  await t.throwsAsync(
    lib.processAuthorizationCodeOAuth2Response(
      issuer,
      client,
      getResponse(j({ access_token: 'token', token_type: 'Bearer', id_token: null })),
    ),
    {
      message: '"response" body "id_token" property must be a non-empty string',
    },
  )

  t.deepEqual(
    await lib.processAuthorizationCodeOAuth2Response(
      issuer,
      client,
      getResponse(
        j({
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
        getResponse(j({ error: 'invalid_grant' }), { status: 400 }),
      ),
    ),
  )

  t.false(
    lib.isOAuth2Error(
      await lib.processAuthorizationCodeOAuth2Response(
        issuer,
        client,
        getResponse(j({ access_token: 'token', token_type: 'Bearer' })),
      ),
    ),
  )
})

test('processAuthorizationCodeOpenIDResponse() with an ID Token (alg signalled)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }
  await t.throwsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
      issuer,
      client,
      getResponse(j({ access_token: 'token', token_type: 'Bearer', id_token: 'id_token' })),
    ),
    {
      message: '"issuer.jwks_uri" must be a string',
    },
  )

  await t.notThrowsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
      { ...tIssuer, id_token_signing_alg_values_supported: ['ES256'] },
      client,
      getResponse(
        j({
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

test('processAuthorizationCodeOpenIDResponse() with an ID Token (alg specified)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
      tIssuer,
      { ...client, id_token_signed_response_alg: 'ES256' },
      getResponse(
        j({
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
        j({
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

test('processAuthorizationCodeOpenIDResponse() with an ID Token typ: "JWT"', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
      tIssuer,
      client,
      getResponse(
        j({
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
        j({
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

for (const alg of ['RS', 'ES', 'PS'].map((s) => [`${s}256`]).flat()) {
  test(`processAuthorizationCodeOpenIDResponse() with an ${alg} ID Token`, async (t) => {
    const tIssuer: lib.AuthorizationServer = {
      ...issuer,
      id_token_signing_alg_values_supported: [alg],
      jwks_uri: endpoint('jwks'),
    }

    let at_hash: string
    switch (alg) {
      case 'RS256':
      case 'PS256':
      case 'ES256':
        at_hash = 'xsZZrUssMXjL3FBlzoSh2g'
        break
      default:
        throw new Error('not implemented')
    }

    await t.notThrowsAsync(
      lib.processAuthorizationCodeOpenIDResponse(
        tIssuer,
        client,
        getResponse(
          j({
            access_token:
              'YmJiZTAwYmYtMzgyOC00NzhkLTkyOTItNjJjNDM3MGYzOWIy9sFhvH8K_x8UIHj1osisS57f5DduL',
            token_type: 'Bearer',
            id_token: await new jose.SignJWT({ at_hash })
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

test('processAuthorizationCodeOpenIDResponse() with an ID Token w/ at_hash', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
      tIssuer,
      client,
      getResponse(
        j({
          access_token:
            'YmJiZTAwYmYtMzgyOC00NzhkLTkyOTItNjJjNDM3MGYzOWIy9sFhvH8K_x8UIHj1osisS57f5DduL-ar_qw5jl3lthwpMjm283aVMQXDmoqqqydDSqJfbhptzw8rUVwkuQbolw',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({
            at_hash: 'x7vk7f6BvQj0jQHYFIk4ag',
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
  )

  await t.throwsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
      tIssuer,
      client,
      getResponse(
        j({
          access_token:
            'YmJiZTAwYmYtMzgyOC00NzhkLTkyOTItNjJjNDM3MGYzOWIy9sFhvH8K_x8UIHj1osisS57f5DduL-ar_qw5jl3lthwpMjm283aVMQXDmoqqqydDSqJfbhptzw8rUVwkuQbolw',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({
            at_hash: 'x7vk7f6BvQj0jQHYFIk4ag-invalid',
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
    { message: 'invalid ID Token "at_hash"' },
  )
})

test('processAuthorizationCodeOpenIDResponse() nonce checks', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.throwsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
      tIssuer,
      client,
      getResponse(
        j({
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
    { message: 'unexpected ID Token "nonce" claim value received' },
  )

  await t.throwsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
      tIssuer,
      client,
      getResponse(
        j({
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
    { message: 'unexpected ID Token "nonce" claim value received' },
  )

  await t.throwsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
      tIssuer,
      client,
      getResponse(
        j({
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
          j({
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
        <any>nonce,
      ),
      { message: '"expectedNonce" must be a non-empty string', name: 'TypeError' },
    )
  }

  await t.notThrowsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
      tIssuer,
      client,
      getResponse(
        j({
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
