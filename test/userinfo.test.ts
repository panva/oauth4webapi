import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'

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
import * as lib from './_lib.js'
import * as jose from 'jose'
import * as tools from './_tools.js'

const context = {} as ContextWithAlgs

before(() => setup(context))
after(() => teardown(context))
before(() => setupJwks(context))

test('userInfoRequest()', async () => {
  const data = { sub: 'urn:example:subject' }
  context
    .intercept({
      path: '/userinfo',
      method: 'GET',
      headers: {
        'user-agent': UA,
        accept: 'application/json, application/jwt',
      },
    })
    .reply(200, data)

  const tIssuer: lib.AuthorizationServer = { ...issuer, userinfo_endpoint: endpoint('userinfo') }
  const tClient: lib.Client = { ...client }
  const response = await lib.userInfoRequest(tIssuer, tClient, 'token')
  assert.strictEqual(response instanceof lib.Response, true)
})

test('userInfoRequest() w/ Custom Headers', async () => {
  const data = { sub: 'urn:example:subject' }
  context
    .intercept({
      path: '/userinfo-headers',
      method: 'GET',
      headers: {
        accept: 'application/json, application/jwt',
        'user-agent': 'foo',
        foo: 'bar',
      },
    })
    .reply(200, data)
    .times(3)

  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    userinfo_endpoint: endpoint('userinfo-headers'),
  }
  const tClient: lib.Client = { ...client }
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
    const response = await lib.userInfoRequest(tIssuer, tClient, 'token', { headers })
    assert.strictEqual(response instanceof lib.Response, true)
  }
})

test('userInfoRequest() w/ jwt signal', async () => {
  const data = { sub: 'urn:example:subject' }
  context
    .intercept({
      path: '/userinfo-2',
      method: 'GET',
      headers: {
        accept: 'application/jwt',
      },
    })
    .reply(200, data)

  const tIssuer: lib.AuthorizationServer = { ...issuer, userinfo_endpoint: endpoint('userinfo-2') }
  const tClient: lib.Client = { ...client, userinfo_signed_response_alg: 'ES256' }
  await lib.userInfoRequest(tIssuer, tClient, 'token')
})

test('userInfoRequest() requires userinfo_endpoint', async () => {
  await assert.rejects(lib.userInfoRequest(issuer, client, 'token'), {
    message: 'authorization server metadata does not contain a valid "as.userinfo_endpoint"',
  })
})

test('processUserInfoResponse() - json', async () => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, userinfo_endpoint: endpoint('userinfo') }
  await assert.rejects(lib.processUserInfoResponse(tIssuer, client, 'sub', null as any), {
    message: '"response" must be an instance of Response',
  })
  await assert.rejects(lib.processUserInfoResponse(tIssuer, client, 'sub', getResponse('{"')), {
    message: 'failed to parse "response" body as JSON',
  })
  await assert.rejects(
    lib.processUserInfoResponse(
      tIssuer,
      client,
      'sub',
      getResponse(JSON.stringify({ sub: 'urn:example:subject' }), { status: 404 }),
    ),
    {
      message:
        '"response" is not a conform UserInfo Endpoint response (unexpected HTTP status code)',
    },
  )
  await assert.rejects(
    lib.processUserInfoResponse(tIssuer, client, 'sub', getResponse(JSON.stringify([]))),
    {
      message: '"response" body must be a top level object',
    },
  )
  await assert.rejects(
    lib.processUserInfoResponse(
      tIssuer,
      client,
      'sub',
      getResponse(JSON.stringify({ sub: 2321678 })),
    ),
    {
      message: '"response" body "sub" property must be a string',
    },
  )
  await assert.doesNotReject(async () => {
    const response = getResponse(JSON.stringify({ sub: 'urn:example:subject' }))
    await lib.processUserInfoResponse(tIssuer, client, 'urn:example:subject', response)
  })
  await assert.doesNotReject(async () => {
    const response = getResponse(JSON.stringify({ sub: 'urn:example:subject' }))
    await lib.processUserInfoResponse(tIssuer, client, lib.skipSubjectCheck, response)
  })
  await assert.rejects(
    async () => {
      const response = getResponse(JSON.stringify({ sub: 'urn:example:subject' }))
      await lib.processUserInfoResponse(tIssuer, client, null as any, response)
    },
    { message: '"expectedSubject" must be a string' },
  )
  await assert.rejects(
    async () => {
      const response = getResponse(JSON.stringify({ sub: 'urn:example:different-subject' }))
      await lib.processUserInfoResponse(tIssuer, client, 'urn:example:subject', response)
    },
    { message: 'unexpected "response" body "sub" property value' },
  )
  await assert.rejects(
    async () => {
      const response = getResponse(JSON.stringify({ sub: 'urn:example:subject' }))
      await lib.processUserInfoResponse(
        tIssuer,
        { ...client, userinfo_signed_response_alg: 'ES256' },
        'urn:example:subject',
        response,
      )
    },
    { message: 'JWT UserInfo Response expected' },
  )
})

test('processUserInfoResponse() - ignores signatures', async () => {
  const kp = context.ES256

  await assert.doesNotReject(async () => {
    const response = getResponse(
      tools.mangleJwtSignature(
        await new jose.SignJWT({ sub: 'urn:example:subject' })
          .setProtectedHeader({ alg: 'ES256' })
          .sign(kp.privateKey),
      ),
      { headers: new Headers({ 'content-type': 'application/jwt' }) },
    )
    await lib.processUserInfoResponse(
      { ...issuer, userinfo_signing_alg_values_supported: ['ES256'] },
      client,
      'urn:example:subject',
      response,
    )
  })
})

test('processUserInfoResponse() - jwt (alg signalled)', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
    userinfo_signing_alg_values_supported: ['ES256'],
  }
  const kp = context.ES256

  await assert.doesNotReject(async () => {
    const response = getResponse(
      await new jose.SignJWT({ sub: 'urn:example:subject' })
        .setProtectedHeader({ alg: 'ES256' })
        .sign(kp.privateKey),
      { headers: new Headers({ 'content-type': 'application/jwt' }) },
    )
    await lib.processUserInfoResponse(tIssuer, client, 'urn:example:subject', response)
  })
})

test('processUserInfoResponse() - jwt (alg defined)', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = context.ES256

  await assert.doesNotReject(async () => {
    const response = getResponse(
      await new jose.SignJWT({ sub: 'urn:example:subject' })
        .setProtectedHeader({ alg: 'ES256' })
        .sign(kp.privateKey),
      { headers: new Headers({ 'content-type': 'application/jwt' }) },
    )
    await lib.processUserInfoResponse(
      tIssuer,
      { ...client, userinfo_signed_response_alg: 'ES256' },
      'urn:example:subject',
      response,
    )
  })
})

test('processUserInfoResponse() - jwt (alg default)', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = context.RS256

  await assert.rejects(
    async () => {
      const response = getResponse(
        await new jose.SignJWT({ sub: 'urn:example:subject' })
          .setProtectedHeader({ alg: 'RS256' })
          .sign(kp.privateKey),
        { headers: new Headers({ 'content-type': 'application/jwt' }) },
      )
      await lib.processUserInfoResponse(tIssuer, client, 'urn:example:subject', response)
    },
    {
      message: 'missing client or server configuration to verify used JWT "alg" header parameter',
    },
  )
})

test('processUserInfoResponse() - alg mismatches', async () => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }

  await assert.rejects(
    async () => {
      const response = getResponse(
        await new jose.SignJWT({ sub: 'urn:example:subject' })
          .setProtectedHeader({ alg: 'ES256' })
          .sign(context.ES256.privateKey),
        { headers: new Headers({ 'content-type': 'application/jwt' }) },
      )
      await lib.processUserInfoResponse(
        tIssuer,
        { ...client, userinfo_signed_response_alg: 'PS256' },
        'urn:example:subject',
        response,
      )
    },
    { message: 'unexpected JWT "alg" header parameter' },
  )

  await assert.rejects(
    async () => {
      const response = getResponse(
        await new jose.SignJWT({ sub: 'urn:example:subject' })
          .setProtectedHeader({ alg: 'ES256' })
          .sign(context.ES256.privateKey),
        { headers: new Headers({ 'content-type': 'application/jwt' }) },
      )
      await lib.processUserInfoResponse(
        {
          ...tIssuer,
          userinfo_signing_alg_values_supported: ['RS256'],
        },
        client,
        'urn:example:subject',
        response,
      )
    },
    { message: 'unexpected JWT "alg" header parameter' },
  )

  await assert.rejects(
    async () => {
      const response = getResponse(
        await new jose.SignJWT({ sub: 'urn:example:subject' })
          .setProtectedHeader({ alg: 'ES256' })
          .sign(context.ES256.privateKey),
        { headers: new Headers({ 'content-type': 'application/jwt' }) },
      )
      await lib.processUserInfoResponse(
        tIssuer,
        { ...client, userinfo_signed_response_alg: 'RS256' },
        'urn:example:subject',
        response,
      )
    },
    { message: 'unexpected JWT "alg" header parameter' },
  )
})
