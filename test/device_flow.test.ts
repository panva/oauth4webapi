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

const test = anyTest as TestFn<Context & { es256: CryptoKeyPair; rs256: CryptoKeyPair }>

test.before(setup)
test.after(teardown)

test.before(async (t) => {
  t.context.es256 = await lib.generateKeyPair('ES256')
  t.context.rs256 = await lib.generateKeyPair('RS256')

  t.context
    .intercept({
      path: '/jwks',
      method: 'GET',
    })
    .reply(200, {
      keys: [
        await jose.exportJWK(t.context.es256.publicKey),
        await jose.exportJWK(t.context.rs256.publicKey),
      ],
    })
})

const tClient: lib.Client = { ...client, token_endpoint_auth_method: 'none' }

test('deviceAuthorizationRequest()', async (t) => {
  await t.throwsAsync(lib.deviceAuthorizationRequest(issuer, tClient, new URLSearchParams()), {
    message: '"issuer.device_authorization_endpoint" must be a string',
  })

  await t.throwsAsync(lib.deviceAuthorizationRequest(issuer, tClient, <any>null), {
    message: '"parameters" must be an instance of URLSearchParams',
  })

  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    device_authorization_endpoint: endpoint('device-1'),
  }

  t.context
    .intercept({
      path: '/device-1',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'user-agent': UA,
      },
      body(body) {
        return new URLSearchParams(body).get('client_id') === client.client_id
      },
    })
    .reply(200, '')

  await t.notThrowsAsync(lib.deviceAuthorizationRequest(tIssuer, tClient, new URLSearchParams()))
})

test('deviceAuthorizationRequest() w/ Custom Headers', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    device_authorization_endpoint: endpoint('device-headers'),
  }

  t.context
    .intercept({
      path: '/device-headers',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'user-agent': 'foo',
        foo: 'bar',
      },
    })
    .reply(200, '')

  await t.notThrowsAsync(
    lib.deviceAuthorizationRequest(tIssuer, tClient, new URLSearchParams(), {
      headers: new Headers([
        ['accept', 'will be overwritten'],
        ['user-agent', 'foo'],
        ['foo', 'bar'],
      ]),
    }),
  )
})

test('processDeviceAuthorizationResponse()', async (t) => {
  await t.throwsAsync(lib.processDeviceAuthorizationResponse(issuer, client, <any>null), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(
    lib.processDeviceAuthorizationResponse(issuer, client, getResponse('', { status: 404 })),
    {
      message: '"response" is not a conform Device Authorization Endpoint response',
    },
  )
  await t.throwsAsync(
    lib.processDeviceAuthorizationResponse(issuer, client, getResponse('{"', { status: 200 })),
    {
      message: 'failed to parse "response" body as JSON',
    },
  )
  await t.throwsAsync(
    lib.processDeviceAuthorizationResponse(issuer, client, getResponse('null', { status: 200 })),
    {
      message: '"response" body must be a top level object',
    },
  )
  await t.throwsAsync(
    lib.processDeviceAuthorizationResponse(issuer, client, getResponse('[]', { status: 200 })),
    {
      message: '"response" body must be a top level object',
    },
  )

  const validResponse = {
    device_code: 'device_code',
    user_code: 'user_code',
    verification_uri: 'verification_uri',
    expires_in: 300,
    verification_uri_complete: 'verification_uri_complete',
    interval: 5,
  }

  t.deepEqual(
    await lib.processDeviceAuthorizationResponse(
      issuer,
      client,
      getResponse(JSON.stringify(validResponse), { status: 200 }),
    ),
    validResponse,
  )

  await t.notThrowsAsync(
    lib.processDeviceAuthorizationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ ...validResponse, verification_uri_complete: undefined }), {
        status: 200,
      }),
    ),
  )

  await t.notThrowsAsync(
    lib.processDeviceAuthorizationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ ...validResponse, interval: undefined }), { status: 200 }),
    ),
  )

  await t.throwsAsync(
    lib.processDeviceAuthorizationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ ...validResponse, device_code: undefined }), { status: 200 }),
    ),
    {
      message: '"response" body "device_code" property must be a non-empty string',
    },
  )

  await t.throwsAsync(
    lib.processDeviceAuthorizationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ ...validResponse, user_code: undefined }), { status: 200 }),
    ),
    {
      message: '"response" body "user_code" property must be a non-empty string',
    },
  )

  await t.throwsAsync(
    lib.processDeviceAuthorizationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ ...validResponse, verification_uri: undefined }), {
        status: 200,
      }),
    ),
    {
      message: '"response" body "verification_uri" property must be a non-empty string',
    },
  )

  await t.throwsAsync(
    lib.processDeviceAuthorizationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ ...validResponse, expires_in: undefined }), { status: 200 }),
    ),
    {
      message: '"response" body "expires_in" property must be a positive number',
    },
  )

  await t.throwsAsync(
    lib.processDeviceAuthorizationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ ...validResponse, verification_uri_complete: null }), {
        status: 200,
      }),
    ),
    {
      message: '"response" body "verification_uri_complete" property must be a non-empty string',
    },
  )

  await t.throwsAsync(
    lib.processDeviceAuthorizationResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ ...validResponse, interval: null }), { status: 200 }),
    ),
    {
      message: '"response" body "interval" property must be a positive number',
    },
  )
})

test('deviceCodeGrantRequest()', async (t) => {
  await t.throwsAsync(lib.deviceCodeGrantRequest(issuer, tClient, 'device_code'), {
    message: '"issuer.token_endpoint" must be a string',
  })

  await t.throwsAsync(lib.deviceCodeGrantRequest(issuer, tClient, <any>null), {
    message: '"deviceCode" must be a non-empty string',
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
      },
      body(body) {
        const params = new URLSearchParams(body)
        return (
          params.get('grant_type') === 'urn:ietf:params:oauth:grant-type:device_code' &&
          params.get('device_code') === 'device_code'
        )
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })

  await t.notThrowsAsync(lib.deviceCodeGrantRequest(tIssuer, tClient, 'device_code'))
})

test('deviceCodeGrantRequest() w/ Extra Parameters', async (t) => {
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
    lib.deviceCodeGrantRequest(tIssuer, tClient, 'device_code', {
      additionalParameters: new URLSearchParams('resource=urn:example:resource'),
    }),
  )
})

test('deviceCodeGrantRequest() w/ Custom Headers', async (t) => {
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
    lib.deviceCodeGrantRequest(tIssuer, tClient, 'device_code', {
      headers: new Headers([
        ['accept', 'will be overwritten'],
        ['user-agent', 'foo'],
        ['foo', 'bar'],
      ]),
    }),
  )
})

test('deviceCodeGrantRequest() w/ DPoP', async (t) => {
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
  await t.notThrowsAsync(lib.deviceCodeGrantRequest(tIssuer, tClient, 'device_code', { DPoP }))
})

test('processDeviceCodeResponse() without ID Tokens', async (t) => {
  await t.throwsAsync(lib.processDeviceCodeResponse(issuer, client, <any>null), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(
    lib.processDeviceCodeResponse(issuer, client, getResponse('', { status: 404 })),
    {
      message: '"response" is not a conform Token Endpoint response',
    },
  )
  await t.throwsAsync(lib.processDeviceCodeResponse(issuer, client, getResponse('{"')), {
    message: 'failed to parse "response" body as JSON',
  })
  await t.throwsAsync(lib.processDeviceCodeResponse(issuer, client, getResponse('null')), {
    message: '"response" body must be a top level object',
  })
  await t.throwsAsync(lib.processDeviceCodeResponse(issuer, client, getResponse('[]')), {
    message: '"response" body must be a top level object',
  })
  await t.throwsAsync(
    lib.processDeviceCodeResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ token_type: 'Bearer' })),
    ),
    {
      message: '"response" body "access_token" property must be a non-empty string',
    },
  )
  await t.throwsAsync(
    lib.processDeviceCodeResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token' })),
    ),
    {
      message: '"response" body "token_type" property must be a non-empty string',
    },
  )
  await t.throwsAsync(
    lib.processDeviceCodeResponse(
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
    lib.processDeviceCodeResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer', scope: null })),
    ),
    {
      message: '"response" body "scope" property must be a string',
    },
  )
  await t.throwsAsync(
    lib.processDeviceCodeResponse(
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
  await t.throwsAsync(
    lib.processDeviceCodeResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer', id_token: null })),
    ),
    {
      message: '"response" body "id_token" property must be a non-empty string',
    },
  )

  t.deepEqual(
    await lib.processDeviceCodeResponse(
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
      await lib.processDeviceCodeResponse(
        issuer,
        client,
        getResponse(JSON.stringify({ error: 'invalid_grant' }), { status: 400 }),
      ),
    ),
  )

  t.false(
    lib.isOAuth2Error(
      await lib.processDeviceCodeResponse(
        issuer,
        client,
        getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer' })),
      ),
    ),
  )
})

test('processDeviceCodeResponse() with an ID Token (alg signalled)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }
  await t.throwsAsync(
    lib.processDeviceCodeResponse(
      issuer,
      client,
      getResponse(
        JSON.stringify({ access_token: 'token', token_type: 'Bearer', id_token: 'id_token' }),
      ),
    ),
    {
      message: '"issuer.jwks_uri" must be a string',
    },
  )

  await t.notThrowsAsync(
    lib
      .processDeviceCodeResponse(
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
              .sign(t.context.es256.privateKey),
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

test('processDeviceCodeResponse() with an ID Token (alg specified)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processDeviceCodeResponse(
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
            .sign(t.context.es256.privateKey),
        }),
      ),
    ),
  )
})

test('processDeviceCodeResponse() with an ID Token (alg default)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processDeviceCodeResponse(
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
            .sign(t.context.rs256.privateKey),
        }),
      ),
    ),
  )
})

test('processDeviceCodeResponse() with an ID Token (alg mismatches)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.throwsAsync(
    lib.processDeviceCodeResponse(
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
            .sign(t.context.es256.privateKey),
        }),
      ),
    ),
    { message: 'unexpected JWT "alg" header parameter' },
  )

  await t.throwsAsync(
    lib.processDeviceCodeResponse(
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
            .sign(t.context.es256.privateKey),
        }),
      ),
    ),
    { message: 'unexpected JWT "alg" header parameter' },
  )

  await t.throwsAsync(
    lib.processDeviceCodeResponse(
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
            .sign(t.context.es256.privateKey),
        }),
      ),
    ),
    { message: 'unexpected JWT "alg" header parameter' },
  )
})

test('processDeviceCodeResponse() with an ID Token w/ at_hash', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processDeviceCodeResponse(
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
            .sign(t.context.rs256.privateKey),
        }),
      ),
    ),
  )

  await t.throwsAsync(
    lib.processDeviceCodeResponse(
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
            .sign(t.context.rs256.privateKey),
        }),
      ),
    ),
    { message: 'invalid ID Token "at_hash"' },
  )
})
