import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { captureRejection } from './_errors.js'

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
import * as lib from './_lib.js'
import * as tools from './_tools.js'

const context = {} as ContextWithAlgs

before(() => setup(context))
after(() => teardown(context))
before(() => setupJwks(context))

const tClient: lib.Client = { ...client }

test('refreshTokenGrantRequest()', async () => {
  await assert.rejects(lib.refreshTokenGrantRequest(issuer, tClient, lib.None(), 'refresh_token'), {
    message: 'authorization server metadata does not contain a valid "as.token_endpoint"',
  })

  await assert.rejects(lib.refreshTokenGrantRequest(issuer, tClient, lib.None(), null as any), {
    message: '"refreshToken" must be a string',
  })

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
          params.get('grant_type') === 'refresh_token' &&
          params.get('refresh_token') === 'refresh_token'
        )
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })

  await assert.doesNotReject(
    lib.refreshTokenGrantRequest(tIssuer, tClient, lib.None(), 'refresh_token'),
  )
})

test('refreshTokenGrantRequest() w/ Extra Parameters', async () => {
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
    .times(3)

  await assert.doesNotReject(
    lib.refreshTokenGrantRequest(tIssuer, tClient, lib.None(), 'refresh_token', {
      additionalParameters: new URLSearchParams('resource=urn:example:resource'),
    }),
  )

  await assert.doesNotReject(
    lib.refreshTokenGrantRequest(tIssuer, tClient, lib.None(), 'refresh_token', {
      additionalParameters: {
        resource: 'urn:example:resource',
      },
    }),
  )

  await assert.doesNotReject(
    lib.refreshTokenGrantRequest(tIssuer, tClient, lib.None(), 'refresh_token', {
      additionalParameters: [['resource', 'urn:example:resource']],
    }),
  )
})

test('refreshTokenGrantRequest() w/ Custom Headers', async () => {
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
      lib.refreshTokenGrantRequest(tIssuer, tClient, lib.None(), 'refresh_token', { headers }),
    )
  }
})

test('refreshTokenGrantRequest() w/ DPoP', async () => {
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
    lib.refreshTokenGrantRequest(tIssuer, tClient, lib.None(), 'refresh_token', { DPoP }),
  )
})

test('processRefreshTokenResponse() without ID Tokens', async () => {
  await assert.rejects(lib.processRefreshTokenResponse(issuer, client, null as any), {
    message: '"response" must be an instance of Response',
  })
  await assert.rejects(
    lib.processRefreshTokenResponse(issuer, client, getResponse('', { status: 404 })),
    {
      message: '"response" is not a conform Token Endpoint response (unexpected HTTP status code)',
    },
  )
  await assert.rejects(lib.processRefreshTokenResponse(issuer, client, getResponse('{"')), {
    message: 'failed to parse "response" body as JSON',
  })
  await assert.rejects(lib.processRefreshTokenResponse(issuer, client, getResponse('null')), {
    message: '"response" body must be a top level object',
  })
  await assert.rejects(lib.processRefreshTokenResponse(issuer, client, getResponse('[]')), {
    message: '"response" body must be a top level object',
  })
  await assert.rejects(
    lib.processRefreshTokenResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ token_type: 'Bearer' })),
    ),
    {
      message: '"response" body "access_token" property must be a string',
    },
  )
  await assert.rejects(
    lib.processRefreshTokenResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token' })),
    ),
    {
      message: '"response" body "token_type" property must be a string',
    },
  )
  await assert.rejects(
    lib.processRefreshTokenResponse(
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
  await assert.rejects(
    lib.processRefreshTokenResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer', scope: null })),
    ),
    {
      message: '"response" body "scope" property must be a string',
    },
  )
  await assert.rejects(
    lib.processRefreshTokenResponse(
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
  await assert.rejects(
    lib.processRefreshTokenResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer', id_token: null })),
    ),
    {
      message: '"response" body "id_token" property must be a string',
    },
  )

  const response = await lib.processRefreshTokenResponse(
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

  assert.deepStrictEqual(response, {
    access_token: 'token',
    token_type: 'bearer',
    expires_in: 60,
    scope: 'api:read',
    refresh_token: 'refresh_token',
  })

  assert.strictEqual(lib.getValidatedIdTokenClaims(response), undefined)

  const err = await captureRejection(
    lib.processRefreshTokenResponse(
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

  await lib.processRefreshTokenResponse(
    issuer,
    client,
    getResponse(JSON.stringify({ access_token: 'token', token_type: 'Bearer' })),
  )
})

test('processRefreshTokenResponse() - ignores signatures', async () => {
  await assert.doesNotReject(
    lib
      .processRefreshTokenResponse(
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
                .sign(context.ES256.privateKey),
            ),
          }),
        ),
      )
      .then(async (result) => {
        assert.ok(lib.getValidatedIdTokenClaims(result))
      }),
  )
})

test('processRefreshTokenResponse() with an ID Token (alg signalled)', async () => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await assert.doesNotReject(
    lib
      .processRefreshTokenResponse(
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
              .sign(context.ES256.privateKey),
          }),
        ),
      )
      .then(async (result) => {
        assert.ok(lib.getValidatedIdTokenClaims(result))
        assert.throws(() => lib.getValidatedIdTokenClaims({ ...result }), {
          name: 'TypeError',
          message: '"ref" was already garbage collected or did not resolve from the proper sources',
        })
      }),
  )
})

test('processRefreshTokenResponse() with an ID Token (alg specified)', async () => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await assert.doesNotReject(
    lib.processRefreshTokenResponse(
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
            .sign(context.ES256.privateKey),
        }),
      ),
    ),
  )
})

test('processRefreshTokenResponse() with an ID Token (alg default)', async () => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await assert.doesNotReject(
    lib.processRefreshTokenResponse(
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
            .sign(context.RS256.privateKey),
        }),
      ),
    ),
  )
})

test('processRefreshTokenResponse() with an ID Token (alg mismatches)', async () => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, jwks_uri: endpoint('jwks') }

  await assert.rejects(
    lib.processRefreshTokenResponse(
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
            .sign(context.ES256.privateKey),
        }),
      ),
    ),
    {
      message: 'unexpected JWT "alg" header parameter',
    },
  )

  await assert.rejects(
    lib.processRefreshTokenResponse(
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
            .sign(context.ES256.privateKey),
        }),
      ),
    ),
    {
      message: 'unexpected JWT "alg" header parameter',
    },
  )

  await assert.rejects(
    lib.processRefreshTokenResponse(
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
            .sign(context.ES256.privateKey),
        }),
      ),
    ),
    {
      message: 'unexpected JWT "alg" header parameter',
    },
  )
})
