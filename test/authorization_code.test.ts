import anyTest, { type TestFn } from 'ava'
import { createPrivateKey } from 'node:crypto'
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

const test = anyTest as TestFn<Context & { [alg: string]: CryptoKeyPair }>

test.before(setup)
test.after(teardown)

const algs: lib.JWSAlgorithm[] = ['RS256', 'ES256', 'PS256', 'EdDSA']

test.before(async (t) => {
  const keys = []
  for (const alg of algs) {
    const key = await lib.generateKeyPair(alg, { extractable: true })
    t.context[alg] = key
    keys.push(await crypto.subtle.exportKey('jwk', key.publicKey))
  }

  t.context
    .intercept({
      path: '/jwks',
      method: 'GET',
    })
    .reply(200, { keys })
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
  // @ts-expect-error
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
      message: '"as.token_endpoint" must be a string',
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

test('processAuthorizationCodeOAuth2Response()', async (t) => {
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

test('processAuthorizationCodeOpenIDResponse() with an ID Token (alg signalled)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }
  await t.throwsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
      issuer,
      client,
      getResponse(
        JSON.stringify({ access_token: 'token', token_type: 'Bearer', id_token: 'id_token' }),
      ),
    ),
    {
      message: '"as.jwks_uri" must be a string',
    },
  )

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

for (const alg of algs) {
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
      case 'EdDSA':
        at_hash = 'p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY'
        break
      default:
        throw new Error('not implemented')
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
            id_token: await new jose.SignJWT({ at_hash })
              .setProtectedHeader({ alg })
              .setIssuer(issuer.issuer)
              .setSubject('urn:example:subject')
              .setAudience(client.client_id)
              .setExpirationTime('5m')
              .setIssuedAt()
              .sign(
                createPrivateKey({
                  key: await crypto.subtle
                    .exportKey('pkcs8', t.context[alg].privateKey)
                    .then(Buffer.from),
                  format: 'der',
                  type: 'pkcs8',
                }),
              ),
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
        JSON.stringify({
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
        JSON.stringify({
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
    { message: 'unexpected ID Token "at_hash" (access token hash) claim value' },
  )
})

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

  await t.throwsAsync(
    lib.processAuthorizationCodeOpenIDResponse(
      tIssuer,
      {
        ...client,
        require_auth_time: true,
      },
      getResponse(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          id_token: await new jose.SignJWT({
            auth_time: '0',
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
    { message: 'unexpected ID Token "auth_time" (authentication time) claim value' },
  )
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
