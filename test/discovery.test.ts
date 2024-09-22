import anyTest, { type TestFn } from 'ava'
import setup, { type Context, teardown, issuer, getResponse, UA } from './_setup.js'
import * as lib from '../src/index.js'

const test = anyTest as TestFn<Context>

test.before(setup)
test.after(teardown)

test('discoveryRequest()', async (t) => {
  const data = { ...issuer }
  t.context
    .intercept({
      path: '/.well-known/openid-configuration',
      method: 'GET',
      headers: {
        accept: 'application/json',
        'user-agent': UA,
      },
    })
    .reply(200, data)

  const response = await lib.discoveryRequest(new URL(issuer.issuer))
  t.true(response instanceof Response)
})

test('discoveryRequest() w/ Custom Headers', async (t) => {
  const data = { ...issuer }
  t.context
    .intercept({
      path: '/.well-known/openid-configuration',
      method: 'GET',
      headers: {
        'user-agent': 'foo',
        foo: 'bar',
        accept: 'application/json',
      },
    })
    .reply(200, data)
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
    const response = await lib.discoveryRequest(new URL(issuer.issuer), { headers })
    t.true(response instanceof Response)
  }
})

test('discoveryRequest() - oidc with a pathname', async (t) => {
  const data = { issuer: 'https://op.example.com/path' }
  t.context
    .intercept({
      path: '/path/.well-known/openid-configuration',
      method: 'GET',
    })
    .reply(200, data)

  const url = new URL(data.issuer)
  await lib.discoveryRequest(url, { algorithm: 'oidc' })
  t.pass()
})

test('discoveryRequest() - oauth2', async (t) => {
  const data = { ...issuer }
  t.context
    .intercept({
      path: '/.well-known/oauth-authorization-server',
      method: 'GET',
    })
    .reply(200, data)

  const url = new URL(issuer.issuer)
  await lib.discoveryRequest(url, { algorithm: 'oauth2' })
  t.pass()
})

test('discoveryRequest() - oauth2 with a pathname', async (t) => {
  const data = { issuer: 'https://op.example.com/path' }
  t.context
    .intercept({
      path: '/.well-known/oauth-authorization-server/path',
      method: 'GET',
    })
    .reply(200, data)

  const url = new URL(data.issuer)
  await lib.discoveryRequest(url, { algorithm: 'oauth2' })
  t.pass()
})

test('processDiscoveryResponse()', async (t) => {
  const expected = new URL('https://op.example.com')

  await t.throwsAsync(lib.processDiscoveryResponse(expected, null as any), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(lib.processDiscoveryResponse(null as any, new Response()), {
    message: '"expectedIssuer" must be an instance of URL',
  })
  await t.throwsAsync(lib.processDiscoveryResponse(expected, getResponse('', { status: 404 })), {
    message: '"response" is not a conform Authorization Server Metadata response',
  })
  await t.throwsAsync(lib.processDiscoveryResponse(expected, getResponse('{"')), {
    message: 'failed to parse "response" body as JSON',
  })
  await t.throwsAsync(lib.processDiscoveryResponse(expected, getResponse('null')), {
    message: '"response" body must be a top level object',
  })
  await t.throwsAsync(lib.processDiscoveryResponse(expected, getResponse('[]')), {
    message: '"response" body must be a top level object',
  })

  await t.throwsAsync(
    lib.processDiscoveryResponse(expected, getResponse(JSON.stringify({ issuer: null }))),
    {
      message: '"response" body "issuer" property must be a non-empty string',
    },
  )

  await t.throwsAsync(
    lib.processDiscoveryResponse(
      expected,
      getResponse(JSON.stringify({ issuer: 'https://another-op.example.com' })),
    ),
    { message: '"response" body "issuer" does not match "expectedIssuer"' },
  )

  t.deepEqual(
    await lib.processDiscoveryResponse(
      expected,
      getResponse(JSON.stringify({ issuer: 'https://op.example.com' })),
    ),
    {
      issuer: 'https://op.example.com',
    },
  )
})
