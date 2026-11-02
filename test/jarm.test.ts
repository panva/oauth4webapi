import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'

import setup, {
  client,
  endpoint,
  issuer,
  setupJwks,
  teardown,
  type ContextWithAlgs,
} from './_setup.js'
import * as jose from 'jose'
import * as lib from './_lib.js'
import * as tools from './_tools.js'

const context = {} as ContextWithAlgs

before(() => setup(context))
after(() => teardown(context))
before(() => setupJwks(context))

test('validateJwtAuthResponse() error conditions', async () => {
  await assert.rejects(() => lib.validateJwtAuthResponse(issuer, client, null as any), {
    message: '"parameters" must be an instance of URLSearchParams, or URL',
  })
  await assert.rejects(() => lib.validateJwtAuthResponse(issuer, client, new URLSearchParams()), {
    message: '"parameters" does not contain a JARM response',
  })
})

test('validateJwtAuthResponse()', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = context.RS256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
    code: 'code',
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'RS256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await assert.doesNotReject(async () => {
    const result = await lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState)
    assert.strictEqual(result instanceof URLSearchParams, true)
    assert.deepStrictEqual([...result.keys()], ['iss', 'code'])
  })
})

test('validateJwtAuthResponse() as URL', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = context.RS256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
    code: 'code',
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'RS256' })
    .sign(kp.privateKey)
  const params = new URL(`https://rp.example.com/cb?response=${response}`)
  await assert.doesNotReject(async () => {
    const result = await lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState)
    assert.strictEqual(result instanceof URLSearchParams, true)
    assert.deepStrictEqual([...result.keys()], ['iss', 'code'])
  })
})

test('validateJwtAuthResponse() - state value', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = context.RS256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
    state: 'state',
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'RS256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await assert.doesNotReject(lib.validateJwtAuthResponse(tIssuer, client, params, 'state'))
})

test('validateJwtAuthResponse() - state not present', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = context.RS256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'RS256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await assert.doesNotReject(
    lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState),
  )
})

test('validateJwtAuthResponse() - state ignored', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = context.RS256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
    state: 'some.jwt.value',
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'RS256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await assert.doesNotReject(
    lib.validateJwtAuthResponse(tIssuer, client, params, lib.skipStateCheck),
  )
})

test('validateJwtAuthResponse() - invalid signature', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
    authorization_signing_alg_values_supported: ['ES256'],
  }
  const kp = context.ES256

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
  await assert.rejects(lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState), {
    message: 'JWT signature verification failed',
  })
  await assert.rejects(
    lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState, {
      // @ts-expect-error
      skipJwtSignatureCheck: true,
    }),
    {
      message: 'JWT signature verification failed',
    },
  )
})

test('validateJwtAuthResponse() - alg signalled', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
    authorization_signing_alg_values_supported: ['ES256'],
  }
  const kp = context.ES256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'ES256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await assert.doesNotReject(
    lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState),
  )
})

test('validateJwtAuthResponse() - alg defined', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = context.ES256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'ES256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await assert.doesNotReject(
    lib.validateJwtAuthResponse(
      tIssuer,
      { ...client, authorization_signed_response_alg: 'ES256' },
      params,
      lib.expectNoState,
    ),
  )
})

test('validateJwtAuthResponse() - alg default', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = context.RS256

  const response = await new jose.SignJWT({
    iss: issuer.issuer,
    aud: client.client_id,
  })
    .setExpirationTime('30s')
    .setProtectedHeader({ alg: 'RS256' })
    .sign(kp.privateKey)
  const params = new URLSearchParams({ response })
  await assert.doesNotReject(
    lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState),
  )
})

test('validateJwtAuthResponse() - alg mismatches', async () => {
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
      .sign(context.ES256.privateKey)
    const params = new URLSearchParams({ response })
    await assert.rejects(lib.validateJwtAuthResponse(tIssuer, client, params, lib.expectNoState), {
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
      .sign(context.ES256.privateKey)
    const params = new URLSearchParams({ response })
    await assert.rejects(
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
      .sign(context.ES256.privateKey)
    const params = new URLSearchParams({ response })
    await assert.rejects(
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
