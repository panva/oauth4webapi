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

const tClient: lib.Client = { ...client, client_secret: 'foo' }

test('refreshTokenGrantRequest()', async (t) => {
  await t.throwsAsync(lib.refreshTokenGrantRequest(issuer, tClient, 'refresh_token'), {
    message: '"issuer.token_endpoint" must be a string',
  })

  await t.throwsAsync(lib.refreshTokenGrantRequest(issuer, tClient, <any>null), {
    message: '"refreshToken" must be a non-empty string',
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
          params.get('grant_type') === 'refresh_token' &&
          params.get('refresh_token') === 'refresh_token'
        )
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })

  await t.notThrowsAsync(lib.refreshTokenGrantRequest(tIssuer, tClient, 'refresh_token'))
})

test('refreshTokenGrantRequest() w/ Extra Parameters', async (t) => {
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
    lib.refreshTokenGrantRequest(tIssuer, tClient, 'refresh_token', {
      additionalParameters: new URLSearchParams('resource=urn:example:resource'),
    }),
  )
})

test('refreshTokenGrantRequest() w/ Custom Headers', async (t) => {
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
    lib.refreshTokenGrantRequest(tIssuer, tClient, 'refresh_token', {
      headers: new Headers([
        ['accept', 'will be overwritten'],
        ['user-agent', 'foo'],
        ['foo', 'bar'],
      ]),
    }),
  )
})

test('refreshTokenGrantRequest() w/ DPoP', async (t) => {
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
  await t.notThrowsAsync(lib.refreshTokenGrantRequest(tIssuer, tClient, 'refresh_token', { DPoP }))
})

test('processRefreshTokenResponse() without ID Tokens', async (t) => {
  await t.throwsAsync(lib.processRefreshTokenResponse(issuer, client, <any>null), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(
    lib.processRefreshTokenResponse(issuer, client, getResponse('', { status: 404 })),
    {
      message: '"response" is not a conform Token Endpoint response',
    },
  )
  await t.throwsAsync(lib.processRefreshTokenResponse(issuer, client, getResponse('{"')), {
    message: 'failed to parsed "response" body as JSON',
  })
  await t.throwsAsync(lib.processRefreshTokenResponse(issuer, client, getResponse('null')), {
    message: '"response" body must be a top level object',
  })
  await t.throwsAsync(lib.processRefreshTokenResponse(issuer, client, getResponse('[]')), {
    message: '"response" body must be a top level object',
  })
  await t.throwsAsync(
    lib.processRefreshTokenResponse(issuer, client, getResponse(j({ token_type: 'Bearer' }))),
    {
      message: '"response" body "access_token" property must be a non-empty string',
    },
  )
  await t.throwsAsync(
    lib.processRefreshTokenResponse(issuer, client, getResponse(j({ access_token: 'token' }))),
    {
      message: '"response" body "token_type" property must be a non-empty string',
    },
  )
  await t.throwsAsync(
    lib.processRefreshTokenResponse(
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
    lib.processRefreshTokenResponse(
      issuer,
      client,
      getResponse(j({ access_token: 'token', token_type: 'Bearer', scope: null })),
    ),
    {
      message: '"response" body "scope" property must be a non-empty string',
    },
  )
  await t.throwsAsync(
    lib.processRefreshTokenResponse(
      issuer,
      client,
      getResponse(j({ access_token: 'token', token_type: 'Bearer', refresh_token: null })),
    ),
    {
      message: '"response" body "refresh_token" property must be a non-empty string',
    },
  )
  await t.throwsAsync(
    lib.processRefreshTokenResponse(
      issuer,
      client,
      getResponse(j({ access_token: 'token', token_type: 'Bearer', id_token: null })),
    ),
    {
      message: '"response" body "id_token" property must be a non-empty string',
    },
  )

  t.deepEqual(
    await lib.processRefreshTokenResponse(
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
      await lib.processRefreshTokenResponse(
        issuer,
        client,
        getResponse(j({ error: 'invalid_grant' }), { status: 400 }),
      ),
    ),
  )

  t.false(
    lib.isOAuth2Error(
      await lib.processRefreshTokenResponse(
        issuer,
        client,
        getResponse(j({ access_token: 'token', token_type: 'Bearer' })),
      ),
    ),
  )
})

test('processRefreshTokenResponse() with an ID Token (alg signalled)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }
  await t.throwsAsync(
    lib.processRefreshTokenResponse(
      issuer,
      client,
      getResponse(j({ access_token: 'token', token_type: 'Bearer', id_token: 'id_token' })),
    ),
    {
      message: '"issuer.jwks_uri" must be a string',
    },
  )

  await t.notThrowsAsync(
    lib.processRefreshTokenResponse(
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
            .sign(t.context.es256.privateKey),
        }),
      ),
    ),
  )
})

test('processRefreshTokenResponse() with an ID Token (alg specified)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processRefreshTokenResponse(
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
            .sign(t.context.es256.privateKey),
        }),
      ),
    ),
  )
})

test('processRefreshTokenResponse() with an ID Token (alg default)', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processRefreshTokenResponse(
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
            .sign(t.context.rs256.privateKey),
        }),
      ),
    ),
  )
})

test('processRefreshTokenResponse() with an ID Token w/ at_hash', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await t.notThrowsAsync(
    lib.processRefreshTokenResponse(
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
            .sign(t.context.rs256.privateKey),
        }),
      ),
    ),
  )

  await t.throwsAsync(
    lib.processRefreshTokenResponse(
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
            .sign(t.context.rs256.privateKey),
        }),
      ),
    ),
    { message: 'invalid ID Token "at_hash"' },
  )
})
