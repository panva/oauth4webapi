import anyTest, { type TestFn } from 'ava'
import setup, {
  client,
  endpoint,
  issuer,
  setupJwks,
  teardown,
  type ContextWithAlgs,
} from './_setup.js'
import * as jose from 'jose'
import * as lib from '../src/index.js'
import * as tools from './_tools.js'

const test = anyTest as TestFn<ContextWithAlgs>

test.before(setup)
test.after(teardown)
test.before(setupJwks)

test('validateJwtAuthResponse() error conditions', async (t) => {
  await t.throwsAsync(() => lib.validateJwtAuthResponse(issuer, client, null as any), {
    message: '"parameters" must be an instance of URLSearchParams, or URL',
  })
  await t.throwsAsync(() => lib.validateJwtAuthResponse(issuer, client, new URLSearchParams()), {
    message: '"parameters" does not contain a JARM response',
  })
})

test('validateJwtAuthResponse()', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.RS256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
    code: 'code',
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'RS256' })
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
    t.true(result instanceof URLSearchParams)
    t.deepEqual([...result.keys()], ['iss', 'code'])
  })
})

test('validateJwtAuthResponse() as URL', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.RS256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
    code: 'code',
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'RS256' })
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
    t.true(result instanceof URLSearchParams)
    t.deepEqual([...result.keys()], ['iss', 'code'])
  })
})

test('validateJwtAuthResponse() - state value', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.RS256

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
  const kp = t.context.RS256

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
  const kp = t.context.RS256

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

test('validateJwtAuthResponse() - invalid signature', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
    authorization_signing_alg_values_supported: ['ES256'],
  }
  const kp = t.context.ES256

  const response = tools.mangleJwtSignature(
    await new jose.SignJWT({
      iss: issuer.issuer,
      aud: client.client_id,
    })
      .setExpirationTime('30s')
      .setProtectedHeader({ alg: 'ES256' })
      .sign(kp.privateKey),
  )
  const params = new URLSearchParams({ response })
  await t.throwsAsync(lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState), {
    message: 'JWT signature verification failed',
  })
  await t.throwsAsync(
    lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState, {
      // @ts-expect-error
      skipJwtSignatureCheck: true,
    }),
    {
      message: 'JWT signature verification failed',
    },
  )
})

test('validateJwtAuthResponse() - alg signalled', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
    authorization_signing_alg_values_supported: ['ES256'],
  }
  const kp = t.context.ES256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'ES256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await t.notThrowsAsync(lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState))
})

test('validateJwtAuthResponse() - alg defined', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.ES256

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
  const kp = t.context.RS256

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
      .sign(t.context.ES256.privateKey)
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
      .sign(t.context.ES256.privateKey)
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
      .sign(t.context.ES256.privateKey)
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
