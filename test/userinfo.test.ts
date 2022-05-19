import anyTest, { type TestFn } from 'ava'
import setup, {
  type Context,
  teardown,
  client,
  issuer,
  endpoint,
  getResponse,
  UA,
} from './_setup.js'
import * as lib from '../src/index.js'
import * as jose from 'jose'

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

  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    userinfo_endpoint: endpoint('userinfo-headers'),
  }
  const tClient: lib.Client = { ...client }
  const response = await lib.userInfoRequest(tIssuer, tClient, 'token', {
    headers: new Headers([
      ['accept', 'will be overwritten'],
      ['user-agent', 'foo'],
      ['foo', 'bar'],
    ]),
  })
  t.true(response instanceof Response)
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
    message: '"issuer.userinfo_endpoint" must be a string',
  })
})

test('processUserInfoResponse() - json', async (t) => {
  const tIssuer: lib.AuthorizationServer = { ...issuer, userinfo_endpoint: endpoint('userinfo') }
  await t.throwsAsync(lib.processUserInfoResponse(tIssuer, client, 'sub', <any>null), {
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
    t.false(response.bodyUsed)
  })
  await t.notThrowsAsync(async () => {
    const response = getResponse(JSON.stringify({ sub: 'urn:example:subject' }))
    await lib.processUserInfoResponse(tIssuer, client, lib.skipSubjectCheck, response)
  })
  await t.throwsAsync(
    async () => {
      const response = getResponse(JSON.stringify({ sub: 'urn:example:subject' }))
      await lib.processUserInfoResponse(tIssuer, client, <any>null, response)
      t.false(response.bodyUsed)
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

test('processUserInfoResponse() - jwt (alg signalled)', async (t) => {
  await t.throwsAsync(
    lib.processUserInfoResponse(
      issuer,
      client,
      'sub',
      getResponse('', { headers: new Headers({ 'content-type': 'application/jwt' }) }),
    ),
    {
      message: '"issuer.jwks_uri" must be a string',
    },
  )

  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
    userinfo_signing_alg_values_supported: ['ES256'],
  }
  const kp = t.context.es256

  await t.notThrowsAsync(async () => {
    const response = getResponse(
      await new jose.SignJWT({ sub: 'urn:example:subject' })
        .setProtectedHeader({ alg: 'ES256' })
        .sign(kp.privateKey),
      { headers: new Headers({ 'content-type': 'application/jwt' }) },
    )
    await lib.processUserInfoResponse(tIssuer, client, 'urn:example:subject', response)
    t.false(response.bodyUsed)
  })
})

test('processUserInfoResponse() - jwt (alg defined)', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.es256

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
    t.false(response.bodyUsed)
  })
})

test('processUserInfoResponse() - jwt (alg default)', async (t) => {
  const tIssuer: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: endpoint('jwks'),
  }
  const kp = t.context.rs256

  await t.notThrowsAsync(async () => {
    const response = getResponse(
      await new jose.SignJWT({ sub: 'urn:example:subject' })
        .setProtectedHeader({ alg: 'RS256' })
        .sign(kp.privateKey),
      { headers: new Headers({ 'content-type': 'application/jwt' }) },
    )
    await lib.processUserInfoResponse(tIssuer, client, 'urn:example:subject', response)
    t.false(response.bodyUsed)
  })
})
