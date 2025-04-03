import anyTest, { type TestFn } from 'ava'
import * as crypto from 'crypto'
import setup, { type Context, teardown, issuer, getResponse, UA } from './_setup.js'
import * as jose from 'jose'
import * as lib from '../src/index.js'

const test = anyTest as TestFn<Context>

test.before(setup)
test.after(teardown)

const as = { ...issuer, registration_endpoint: 'https://op.example.com/dcr' }

test('dynamicClientRegistrationRequest()', async (t) => {
  const data = { client_id: 'foo' }
  t.context
    .intercept({
      path: 'dcr',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'user-agent': UA,
      },
    })
    .reply(201, data)

  const response = await lib.dynamicClientRegistrationRequest(as, {})
  t.true(response instanceof Response)
})

test('dynamicClientRegistrationRequest() w/ initial access token', async (t) => {
  const data = { client_id: 'foo' }
  t.context
    .intercept({
      path: 'dcr',
      method: 'POST',
      headers: {
        authorization: 'Bearer token',
        accept: 'application/json',
        'content-type': 'application/json',
        'user-agent': UA,
      },
    })
    .reply(201, data)

  const response = await lib.dynamicClientRegistrationRequest(
    as,
    {},
    { initialAccessToken: 'token' },
  )
  t.true(response instanceof Response)
})

test('dynamicClientRegistrationRequest() w/ initial access token and DPoP', async (t) => {
  const kp = await lib.generateKeyPair('ES256')
  const publicJwk = await jose.exportJWK(kp.publicKey)
  const data = { client_id: 'foo' }
  t.context
    .intercept({
      path: 'dcr',
      method: 'POST',
      headers: {
        authorization: 'DPoP token',
        accept: 'application/json',
        'content-type': 'application/json',
        'user-agent': UA,
        dpop(dpop) {
          const { jwk, ...protectedHeader } = jose.decodeProtectedHeader(dpop)
          const { iat, jti, ath, ...claims } = jose.decodeJwt(dpop)
          t.deepEqual(protectedHeader, { alg: 'ES256', typ: 'dpop+jwt' })
          t.deepEqual(jwk, publicJwk)
          t.deepEqual(claims, { htu: 'https://op.example.com/dcr', htm: 'POST' })
          t.is(typeof iat, 'number')
          t.is(typeof jti, 'string')
          t.is(ath, crypto.createHash('sha256').update('token').digest('base64url'))
          return true
        },
      },
    })
    .reply(201, data)

  const response = await lib.dynamicClientRegistrationRequest(
    as,
    {},
    {
      initialAccessToken: 'token',
      DPoP: lib.DPoP({}, kp),
    },
  )
  t.true(response instanceof Response)
})

test('dynamicClientRegistrationRequest() w/o initial access token and DPoP', async (t) => {
  const kp = await lib.generateKeyPair('ES256')
  const publicJwk = await jose.exportJWK(kp.publicKey)
  const data = { client_id: 'foo' }
  t.context
    .intercept({
      path: 'dcr',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'user-agent': UA,
        dpop(dpop) {
          const { jwk, ...protectedHeader } = jose.decodeProtectedHeader(dpop)
          const { iat, jti, ath, ...claims } = jose.decodeJwt(dpop)
          t.deepEqual(protectedHeader, { alg: 'ES256', typ: 'dpop+jwt' })
          t.deepEqual(jwk, publicJwk)
          t.deepEqual(claims, { htu: 'https://op.example.com/dcr', htm: 'POST' })
          t.is(typeof iat, 'number')
          t.is(typeof jti, 'string')
          t.is(ath, undefined)
          return true
        },
      },
    })
    .reply(201, data)

  const response = await lib.dynamicClientRegistrationRequest(
    as,
    {},
    {
      DPoP: lib.DPoP({}, kp),
    },
  )
  t.true(response instanceof Response)
})

test('dynamicClientRegistrationRequest() w/ initial access token and externally formed DPoP', async (t) => {
  const data = { client_id: 'foo' }
  t.context
    .intercept({
      path: 'dcr',
      method: 'POST',
      headers: {
        dpop: 'foo',
        authorization: 'DPoP token',
        accept: 'application/json',
        'content-type': 'application/json',
        'user-agent': UA,
      },
    })
    .reply(201, data)

  const response = await lib.dynamicClientRegistrationRequest(
    as,
    {},
    {
      initialAccessToken: 'token',
      headers: {
        dpop: 'foo',
      },
    },
  )
  t.true(response instanceof Response)
})

test('dynamicClientRegistrationRequest() w/ Custom Headers', async (t) => {
  const data = { client_id: 'foo' }
  t.context
    .intercept({
      path: 'dcr',
      method: 'POST',
      headers: {
        'user-agent': 'foo',
        foo: 'bar',
        accept: 'application/json',
      },
    })
    .reply(201, data)
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
    const response = await lib.dynamicClientRegistrationRequest(as, {}, { headers })
    t.true(response instanceof Response)
  }
})

test('processDynamicClientRegistrationResponse()', async (t) => {
  await t.throwsAsync(lib.processDynamicClientRegistrationResponse(null as any), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(
    lib.processDynamicClientRegistrationResponse(getResponse('', { status: 404 })),
    {
      message:
        '"response" is not a conform Dynamic Client Registration Endpoint response (unexpected HTTP status code)',
    },
  )
  await t.throwsAsync(
    lib.processDynamicClientRegistrationResponse(getResponse('{"', { status: 201 })),
    {
      message: 'failed to parse "response" body as JSON',
    },
  )
  await t.throwsAsync(
    lib.processDynamicClientRegistrationResponse(getResponse('null', { status: 201 })),
    {
      message: '"response" body must be a top level object',
    },
  )
  await t.throwsAsync(
    lib.processDynamicClientRegistrationResponse(getResponse('[]', { status: 201 })),
    {
      message: '"response" body must be a top level object',
    },
  )

  await t.throwsAsync(
    lib.processDynamicClientRegistrationResponse(
      getResponse(JSON.stringify({ client_id: null }), { status: 201 }),
    ),
    {
      message: '"response" body "client_id" property must be a string',
    },
  )

  await t.throwsAsync(
    lib.processDynamicClientRegistrationResponse(
      getResponse(JSON.stringify({ client_id: 'foo', client_secret: null }), { status: 201 }),
    ),
    {
      message: '"response" body "client_secret" property must be a string',
    },
  )

  await t.throwsAsync(
    lib.processDynamicClientRegistrationResponse(
      getResponse(JSON.stringify({ client_id: 'foo', client_secret: 'foo' }), { status: 201 }),
    ),
    {
      message: '"response" body "client_secret_expires_at" property must be a number',
    },
  )

  t.deepEqual(
    await lib.processDynamicClientRegistrationResponse(
      getResponse(JSON.stringify({ client_id: 'foo', bar: 'baz' }), { status: 201 }),
    ),
    {
      client_id: 'foo',
      bar: 'baz',
    },
  )

  t.deepEqual(
    await lib.processDynamicClientRegistrationResponse(
      getResponse(
        JSON.stringify({ client_id: 'foo', client_secret: 'foo', client_secret_expires_at: 0 }),
        { status: 201 },
      ),
    ),
    {
      client_id: 'foo',
      client_secret: 'foo',
      client_secret_expires_at: 0,
    },
  )

  t.deepEqual(
    await lib.processDynamicClientRegistrationResponse(
      getResponse(
        JSON.stringify({ client_id: 'foo', client_secret: 'foo', client_secret_expires_at: 1 }),
        { status: 201 },
      ),
    ),
    {
      client_id: 'foo',
      client_secret: 'foo',
      client_secret_expires_at: 1,
    },
  )
})
