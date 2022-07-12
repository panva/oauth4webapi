import anyTest, { type TestFn } from 'ava'
import setup, { type Context, teardown, client, issuer, endpoint } from './_setup.js'
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
        {
          kid: 'es256',
          ...(await jose.exportJWK(t.context.es256.publicKey)),
          use: 'sig',
        },
        {
          kid: 'rs256',
          ...(await jose.exportJWK(t.context.rs256.publicKey)),
          key_ops: ['verify'],
        },
      ],
    })
})

test('validateJwtAuthResponse() error conditions', async (t) => {
  await t.throwsAsync(() => lib.validateJwtAuthResponse(issuer, client, <any>null), {
    message: '"parameters" must be an instance of URLSearchParams, or URL',
  })
  await t.throwsAsync(() => lib.validateJwtAuthResponse(issuer, client, new URLSearchParams()), {
    message: '"parameters" does not contain a JARM response',
  })
  await t.throwsAsync(
    () => lib.validateJwtAuthResponse(issuer, client, new URLSearchParams('response=foo')),
    {
      message: '"issuer.jwks_uri" must be a string',
    },
  )
})

test('validateJwtAuthResponse()', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.rs256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
    code: 'code',
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'RS256', kid: 'rs256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await t.notThrowsAsync(async () => {
    const result = await lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState)
    t.true(result instanceof URLSearchParams)
    const isError = lib.isOAuth2Error(result)
    if (isError) {
      t.fail()
      throw new Error()
    }
    t.is(result.constructor.name, 'CallbackParameters')
    t.deepEqual([...result.keys()], ['iss', 'code'])
  })
})

test('validateJwtAuthResponse() as URL', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.rs256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
    code: 'code',
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'RS256', kid: 'rs256' })
    .sign(kp.privateKey)
  const params = new URL(`https://rp.example.com/cb?response=${response}`)
  await t.notThrowsAsync(async () => {
    const result = await lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState)
    t.true(result instanceof URLSearchParams)
    const isError = lib.isOAuth2Error(result)
    if (isError) {
      t.fail()
      throw new Error()
    }
    t.is(result.constructor.name, 'CallbackParameters')
    t.deepEqual([...result.keys()], ['iss', 'code'])
  })
})

test('validateJwtAuthResponse() - state value', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.rs256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
    state: 'state',
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'RS256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await t.notThrowsAsync(lib.validateJwtAuthResponse(tIssuer, client, params, 'state'))
})

test('validateJwtAuthResponse() - state not present', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.rs256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'RS256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await t.notThrowsAsync(lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState))
})

test('validateJwtAuthResponse() - state ignored', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.rs256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
    state: 'some.jwt.value',
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'RS256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await t.notThrowsAsync(lib.validateJwtAuthResponse(tIssuer, client, params, lib.skipStateCheck))
})

test('validateJwtAuthResponse() - alg signalled', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
    authorization_signing_alg_values_supported: ['ES256'],
  }
  const kp = t.context.es256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'ES256', kid: 'es256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await t.notThrowsAsync(lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState))
})

test('validateJwtAuthResponse() - alg defined', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.es256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'ES256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await t.notThrowsAsync(
    lib.validateJwtAuthResponse(
      tIssuer,
      { ...client, authorization_signed_response_alg: 'ES256' },
      params,
      lib.expectNoState,
    ),
  )
})

test('validateJwtAuthResponse() - alg default', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.rs256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'RS256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await t.notThrowsAsync(lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState))
})

test('validateJwtAuthResponse() - alg mismatches', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }

  {
    const response = await new jose.SignJWT({
      iss: issuer.issuer,
      aud: client.client_id,
    })
      .setExpirationTime('30s')
      .setProtectedHeader({ alg: 'ES256' })
      .sign(t.context.es256.privateKey)
    const params = new URLSearchParams({ response })
    await t.throwsAsync(lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState), {
      message: 'unexpected JWT "alg" header parameter',
    })
  }

  {
    const response = await new jose.SignJWT({
      iss: issuer.issuer,
      aud: client.client_id,
    })
      .setExpirationTime('30s')
      .setProtectedHeader({ alg: 'ES256' })
      .sign(t.context.es256.privateKey)
    const params = new URLSearchParams({ response })
    await t.throwsAsync(
      lib.validateJwtAuthResponse(
        {
          ...tIssuer,
          authorization_signing_alg_values_supported: ['RS256'],
        },
        client,
        params,
        lib.expectNoState,
      ),
      {
        message: 'unexpected JWT "alg" header parameter',
      },
    )
  }

  {
    const response = await new jose.SignJWT({
      iss: issuer.issuer,
      aud: client.client_id,
    })
      .setExpirationTime('30s')
      .setProtectedHeader({ alg: 'ES256' })
      .sign(t.context.es256.privateKey)
    const params = new URLSearchParams({ response })
    await t.throwsAsync(
      lib.validateJwtAuthResponse(
        tIssuer,
        { ...client, authorization_signed_response_alg: 'RS256' },
        params,
        lib.expectNoState,
      ),
      {
        message: 'unexpected JWT "alg" header parameter',
      },
    )
  }
})
