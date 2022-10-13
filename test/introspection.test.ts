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
import * as tools from './_tools.js'

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
        {
          ...(await jose.exportJWK(
            (
              await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, [
                'deriveBits',
              ])
            ).publicKey,
          )),
          use: 'enc',
        },
        {
          ...(await jose.exportJWK(
            (
              await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, [
                'sign',
                'verify',
              ])
            ).publicKey,
          )),
          key_ops: [],
        },
        await jose.exportJWK(
          (
            await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-384' }, false, [
              'sign',
              'verify',
            ])
          ).publicKey,
        ),
        await jose.exportJWK(t.context.es256.publicKey),
        await jose.exportJWK(t.context.rs256.publicKey),
      ],
    })
})

const tClient: lib.Client = { ...client, client_secret: 'foo' }

test('introspectionRequest()', async (t) => {
  await t.throwsAsync(lib.introspectionRequest(issuer, tClient, 'token'), {
    message: '"as.introspection_endpoint" must be a string',
  })

  await t.throwsAsync(lib.introspectionRequest(issuer, tClient, <any>null), {
    message: '"token" must be a non-empty string',
  })

  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    introspection_endpoint: endpoint('introspect-1'),
  }

  t.context
    .intercept({
      path: '/introspect-1',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'user-agent': UA,
      },
      body(body) {
        return new URLSearchParams(body).get('token') === 'token'
      },
    })
    .reply(200, { active: false })

  await t.notThrowsAsync(lib.introspectionRequest(tIssuer, tClient, 'token'))
})

test('introspectionRequest() w/ Extra Parameters', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    introspection_endpoint: endpoint('introspect-2'),
  }

  t.context
    .intercept({
      path: '/introspect-2',
      method: 'POST',
      body(body) {
        return new URLSearchParams(body).get('token_type_hint') === 'access_token'
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })

  await t.notThrowsAsync(
    lib.introspectionRequest(tIssuer, tClient, 'token', {
      additionalParameters: new URLSearchParams('token_type_hint=access_token'),
    }),
  )
})

test('introspectionRequest() w/ Custom Headers', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    introspection_endpoint: endpoint('introspect-headers'),
  }

  t.context
    .intercept({
      path: '/introspect-headers',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'user-agent': 'foo',
        foo: 'bar',
      },
    })
    .reply(200, { access_token: 'token', token_type: 'Bearer' })

  await t.notThrowsAsync(
    lib.introspectionRequest(tIssuer, tClient, 'token', {
      headers: new Headers([
        ['accept', 'will be overwritten'],
        ['user-agent', 'foo'],
        ['foo', 'bar'],
      ]),
    }),
  )
})

test('introspectionRequest() forced jwt', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    introspection_endpoint: endpoint('introspect-3'),
  }

  t.context
    .intercept({
      path: '/introspect-3',
      method: 'POST',
      headers: {
        accept: 'application/token-introspection+jwt',
      },
      body(body) {
        return new URLSearchParams(body).get('token') === 'token'
      },
    })
    .reply(200, { active: false })

  await t.notThrowsAsync(
    lib.introspectionRequest(tIssuer, tClient, 'token', { requestJwtResponse: true }),
  )
})

test('introspectionRequest() jwt through client metadata', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    introspection_endpoint: endpoint('introspect-3'),
  }

  t.context
    .intercept({
      path: '/introspect-3',
      method: 'POST',
      headers: {
        accept: 'application/token-introspection+jwt',
      },
      body(body) {
        return new URLSearchParams(body).get('token') === 'token'
      },
    })
    .reply(200, { active: false })

  await t.notThrowsAsync(
    lib.introspectionRequest(
      tIssuer,
      { ...tClient, introspection_signed_response_alg: 'ES256' },
      'token',
    ),
  )
})

test('introspectionRequest() forced json', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    introspection_endpoint: endpoint('introspect-4'),
  }

  t.context
    .intercept({
      path: '/introspect-4',
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
      body(body) {
        return new URLSearchParams(body).get('token') === 'token'
      },
    })
    .reply(200, { active: false })

  await t.notThrowsAsync(
    lib.introspectionRequest(
      tIssuer,
      { ...tClient, introspection_signed_response_alg: 'ES256' },
      'token',
      { requestJwtResponse: false },
    ),
  )
})

test('processIntrospectionResponse()', async (t) => {
  await t.throwsAsync(lib.processIntrospectionResponse(issuer, client, <any>null), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(
    lib.processIntrospectionResponse(issuer, client, getResponse('', { status: 404 })),
    {
      message: '"response" is not a conform Introspection Endpoint response',
    },
  )
  await t.throwsAsync(lib.processIntrospectionResponse(issuer, client, getResponse('{"')), {
    message: 'failed to parse "response" body as JSON',
  })
  await t.throwsAsync(lib.processIntrospectionResponse(issuer, client, getResponse('null')), {
    message: '"response" body must be a top level object',
  })
  await t.throwsAsync(lib.processIntrospectionResponse(issuer, client, getResponse('[]')), {
    message: '"response" body must be a top level object',
  })

  await t.throwsAsync(
    lib.processIntrospectionResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ token_type: 'Bearer' })),
    ),
    {
      message: '"response" body "active" property must be a boolean',
    },
  )

  t.deepEqual(
    await lib.processIntrospectionResponse(
      issuer,
      client,
      getResponse(JSON.stringify({ active: false })),
    ),
    {
      active: false,
    },
  )

  t.true(
    lib.isOAuth2Error(
      await lib.processIntrospectionResponse(
        issuer,
        client,
        getResponse(JSON.stringify({ error: 'invalid_client' }), { status: 401 }),
      ),
    ),
  )

  t.false(
    lib.isOAuth2Error(
      await lib.processIntrospectionResponse(
        issuer,
        client,
        getResponse(JSON.stringify({ active: false })),
      ),
    ),
  )
})

test('processIntrospectionResponse() - invalid signature', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
    introspection_signing_alg_values_supported: ['ES256'],
  }

  await t.throwsAsync(
    lib.processIntrospectionResponse(
      tIssuer,
      client,
      getResponse(
        tools.mangleJwtSignature(
          await new jose.SignJWT({ token_introspection: { active: false } })
            .setProtectedHeader({ alg: 'ES256', typ: 'token-introspection+jwt' })
            .setIssuer(issuer.issuer)
            .setAudience(client.client_id)
            .setIssuedAt()
            .sign(t.context.es256.privateKey),
        ),
        {
          headers: new Headers({
            'content-type': 'application/token-introspection+jwt',
          }),
        },
      ),
    ),
    { message: 'JWT signature verification failed' },
  )
})

test('processIntrospectionResponse() - ignore signatures', async (t) => {
  await t.notThrowsAsync(
    lib.processIntrospectionResponse(
      { ...issuer, introspection_signing_alg_values_supported: ['ES256'] },
      client,
      getResponse(
        tools.mangleJwtSignature(
          await new jose.SignJWT({ token_introspection: { active: false } })
            .setProtectedHeader({ alg: 'ES256', typ: 'token-introspection+jwt' })
            .setIssuer(issuer.issuer)
            .setAudience(client.client_id)
            .setIssuedAt()
            .sign(t.context.es256.privateKey),
        ),
        {
          headers: new Headers({
            'content-type': 'application/token-introspection+jwt',
          }),
        },
      ),
      { skipJwtSignatureCheck: true },
    ),
  )
})

test('processIntrospectionResponse() - alg signalled', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
    introspection_signing_alg_values_supported: ['ES256'],
  }

  await t.notThrowsAsync(
    lib.processIntrospectionResponse(
      tIssuer,
      client,
      getResponse(
        await new jose.SignJWT({ token_introspection: { active: false } })
          .setProtectedHeader({ alg: 'ES256', typ: 'token-introspection+jwt' })
          .setIssuer(issuer.issuer)
          .setAudience(client.client_id)
          .setIssuedAt()
          .sign(t.context.es256.privateKey),
        {
          headers: new Headers({
            'content-type': 'application/token-introspection+jwt',
          }),
        },
      ),
    ),
  )
})

test('processIntrospectionResponse() - alg defined', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }

  await t.notThrowsAsync(
    lib.processIntrospectionResponse(
      tIssuer,
      { ...client, introspection_signed_response_alg: 'ES256' },
      getResponse(
        await new jose.SignJWT({ token_introspection: { active: false } })
          .setProtectedHeader({ alg: 'ES256', typ: 'token-introspection+jwt' })
          .setIssuer(issuer.issuer)
          .setAudience(client.client_id)
          .setIssuedAt()
          .sign(t.context.es256.privateKey),
        {
          headers: new Headers({
            'content-type': 'application/token-introspection+jwt',
          }),
        },
      ),
    ),
  )
})

test('processIntrospectionResponse() - alg default', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }

  await t.notThrowsAsync(
    lib.processIntrospectionResponse(
      tIssuer,
      client,
      getResponse(
        await new jose.SignJWT({ token_introspection: { active: false } })
          .setProtectedHeader({ alg: 'RS256', typ: 'token-introspection+jwt' })
          .setIssuer(issuer.issuer)
          .setAudience(client.client_id)
          .setIssuedAt()
          .sign(t.context.rs256.privateKey),
        {
          headers: new Headers({
            'content-type': 'application/token-introspection+jwt',
          }),
        },
      ),
    ),
  )
})

test('processIntrospectionResponse() - alg mismatches', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }

  await t.throwsAsync(
    lib.processIntrospectionResponse(
      tIssuer,
      client,
      getResponse(
        await new jose.SignJWT({ token_introspection: { active: false } })
          .setProtectedHeader({ alg: 'ES256', typ: 'token-introspection+jwt' })
          .setIssuer(issuer.issuer)
          .setAudience(client.client_id)
          .setIssuedAt()
          .sign(t.context.es256.privateKey),
        {
          headers: new Headers({
            'content-type': 'application/token-introspection+jwt',
          }),
        },
      ),
    ),
    { message: 'unexpected JWT "alg" header parameter' },
  )

  await t.throwsAsync(
    lib.processIntrospectionResponse(
      {
        ...tIssuer,
        introspection_signing_alg_values_supported: ['RS256'],
      },
      client,
      getResponse(
        await new jose.SignJWT({ token_introspection: { active: false } })
          .setProtectedHeader({ alg: 'ES256', typ: 'token-introspection+jwt' })
          .setIssuer(issuer.issuer)
          .setAudience(client.client_id)
          .setIssuedAt()
          .sign(t.context.es256.privateKey),
        {
          headers: new Headers({
            'content-type': 'application/token-introspection+jwt',
          }),
        },
      ),
    ),
    { message: 'unexpected JWT "alg" header parameter' },
  )

  await t.throwsAsync(
    lib.processIntrospectionResponse(
      tIssuer,
      {
        ...client,
        introspection_signed_response_alg: 'RS256',
      },
      getResponse(
        await new jose.SignJWT({ token_introspection: { active: false } })
          .setProtectedHeader({ alg: 'ES256', typ: 'token-introspection+jwt' })
          .setIssuer(issuer.issuer)
          .setAudience(client.client_id)
          .setIssuedAt()
          .sign(t.context.es256.privateKey),
        {
          headers: new Headers({
            'content-type': 'application/token-introspection+jwt',
          }),
        },
      ),
    ),
    { message: 'unexpected JWT "alg" header parameter' },
  )
})

test('processIntrospectionResponse() - typ w/ application/ prefix', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }

  await t.notThrowsAsync(
    lib.processIntrospectionResponse(
      tIssuer,
      client,
      getResponse(
        await new jose.SignJWT({ token_introspection: { active: false } })
          .setProtectedHeader({ alg: 'RS256', typ: 'application/token-introspection+jwt' })
          .setIssuer(issuer.issuer)
          .setAudience(client.client_id)
          .setIssuedAt()
          .sign(t.context.rs256.privateKey),
        {
          headers: new Headers({
            'content-type': 'application/token-introspection+jwt',
          }),
        },
      ),
    ),
  )
})
