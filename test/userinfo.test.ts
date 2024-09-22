import anyTest, { type TestFn } from 'ava'
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
import * as lib from '../src/index.js'
import * as jose from 'jose'
import * as tools from './_tools.js'

const test = anyTest as TestFn<ContextWithAlgs>

test.before(setup)
test.after(teardown)
test.before(setupJwks)

test('userInfoRequest()', async (t) => {
  const data = { sub: 'urn:example:subject' }
  t.context
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
  t.true(response instanceof Response)
})

test('userInfoRequest() w/ Custom Headers', async (t) => {
  const data = { sub: 'urn:example:subject' }
  t.context
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
    t.true(response instanceof Response)
  }
})

test('userInfoRequest() w/ jwt signal', async (t) => {
  const data = { sub: 'urn:example:subject' }
  t.context
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
  t.pass()
})

test('userInfoRequest() requires userinfo_endpoint', async (t) => {
  await t.throwsAsync(lib.userInfoRequest(issuer, client, 'token'), {
    name: 'TypeError',
    message: '"as.userinfo_endpoint" must be a string',
  })
})

test('processUserInfoResponse() - json', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, userinfo_endpoint: endpoint('userinfo') }
  await t.throwsAsync(lib.processUserInfoResponse(tIssuer, client, 'sub', null as any), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(lib.processUserInfoResponse(tIssuer, client, 'sub', getResponse('{"')), {
    message: 'failed to parse "response" body as JSON',
  })
  await t.throwsAsync(
    lib.processUserInfoResponse(
      tIssuer,
      client,
      'sub',
      getResponse(JSON.stringify({ sub: 'urn:example:subject' }), { status: 404 }),
    ),
    {
      message: '"response" is not a conform UserInfo Endpoint response',
    },
  )
  await t.throwsAsync(
    lib.processUserInfoResponse(tIssuer, client, 'sub', getResponse(JSON.stringify([]))),
    {
      message: '"response" body must be a top level object',
    },
  )
  await t.throwsAsync(
    lib.processUserInfoResponse(
      tIssuer,
      client,
      'sub',
      getResponse(JSON.stringify({ sub: 2321678 })),
    ),
    {
      message: '"response" body "sub" property must be a non-empty string',
    },
  )
  await t.notThrowsAsync(async () => {
    const response = getResponse(JSON.stringify({ sub: 'urn:example:subject' }))
    await lib.processUserInfoResponse(tIssuer, client, 'urn:example:subject', response)
  })
  await t.notThrowsAsync(async () => {
    const response = getResponse(JSON.stringify({ sub: 'urn:example:subject' }))
    await lib.processUserInfoResponse(tIssuer, client, lib.skipSubjectCheck, response)
  })
  await t.throwsAsync(
    async () => {
      const response = getResponse(JSON.stringify({ sub: 'urn:example:subject' }))
      await lib.processUserInfoResponse(tIssuer, client, null as any, response)
    },
    { message: '"expectedSubject" must be a non-empty string' },
  )
  await t.throwsAsync(
    async () => {
      const response = getResponse(JSON.stringify({ sub: 'urn:example:different-subject' }))
      await lib.processUserInfoResponse(tIssuer, client, 'urn:example:subject', response)
    },
    { message: 'unexpected "response" body "sub" value' },
  )
  await t.throwsAsync(
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

test('processUserInfoResponse() - ignores signatures', async (t) => {
  const kp = t.context.ES256

  await t.notThrowsAsync(async () => {
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

test('processUserInfoResponse() - jwt (alg signalled)', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
    userinfo_signing_alg_values_supported: ['ES256'],
  }
  const kp = t.context.ES256

  await t.notThrowsAsync(async () => {
    const response = getResponse(
      await new jose.SignJWT({ sub: 'urn:example:subject' })
        .setProtectedHeader({ alg: 'ES256' })
        .sign(kp.privateKey),
      { headers: new Headers({ 'content-type': 'application/jwt' }) },
    )
    await lib.processUserInfoResponse(tIssuer, client, 'urn:example:subject', response)
  })
})

test('processUserInfoResponse() - jwt (alg defined)', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.ES256

  await t.notThrowsAsync(async () => {
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

test('processUserInfoResponse() - jwt (alg default)', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.RS256

  await t.notThrowsAsync(async () => {
    const response = getResponse(
      await new jose.SignJWT({ sub: 'urn:example:subject' })
        .setProtectedHeader({ alg: 'RS256' })
        .sign(kp.privateKey),
      { headers: new Headers({ 'content-type': 'application/jwt' }) },
    )
    await lib.processUserInfoResponse(tIssuer, client, 'urn:example:subject', response)
  })
})

test('processUserInfoResponse() - alg mismatches', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }

  await t.throwsAsync(
    async () => {
      const response = getResponse(
        await new jose.SignJWT({ sub: 'urn:example:subject' })
          .setProtectedHeader({ alg: 'ES256' })
          .sign(t.context.ES256.privateKey),
        { headers: new Headers({ 'content-type': 'application/jwt' }) },
      )
      await lib.processUserInfoResponse(tIssuer, client, 'urn:example:subject', response)
    },
    { message: 'unexpected JWT "alg" header parameter' },
  )

  await t.throwsAsync(
    async () => {
      const response = getResponse(
        await new jose.SignJWT({ sub: 'urn:example:subject' })
          .setProtectedHeader({ alg: 'ES256' })
          .sign(t.context.ES256.privateKey),
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

  await t.throwsAsync(
    async () => {
      const response = getResponse(
        await new jose.SignJWT({ sub: 'urn:example:subject' })
          .setProtectedHeader({ alg: 'ES256' })
          .sign(t.context.ES256.privateKey),
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
