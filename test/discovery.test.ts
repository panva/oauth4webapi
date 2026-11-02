import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'

import setup, { type Context, teardown, issuer, getResponse, UA } from './_setup.js'
import * as lib from './_lib.js'

const context = {} as Context

before(() => setup(context))
after(() => teardown(context))

test('discoveryRequest()', async () => {
  const data = { ...issuer }
  context
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
  assert.strictEqual(response instanceof lib.Response, true)
})

test('discoveryRequest() w/ Custom Headers', async () => {
  const data = { ...issuer }
  context
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
    assert.strictEqual(response instanceof lib.Response, true)
  }
})

test('discoveryRequest() - oidc with a pathname', async () => {
  const data = { issuer: 'https://op.example.com/path' }
  context
    .intercept({
      path: '/path/.well-known/openid-configuration',
      method: 'GET',
    })
    .reply(200, data)

  const url = new URL(data.issuer)
  await lib.discoveryRequest(url, { algorithm: 'oidc' })
})

test('discoveryRequest() - oauth2', async () => {
  const data = { ...issuer }
  context
    .intercept({
      path: '/.well-known/oauth-authorization-server',
      method: 'GET',
    })
    .reply(200, data)

  const url = new URL(issuer.issuer)
  await lib.discoveryRequest(url, { algorithm: 'oauth2' })
})

test('discoveryRequest() - oauth2 with a pathname', async () => {
  const data = { issuer: 'https://op.example.com/path' }
  context
    .intercept({
      path: '/.well-known/oauth-authorization-server/path',
      method: 'GET',
    })
    .reply(200, data)

  const url = new URL(data.issuer)
  await lib.discoveryRequest(url, { algorithm: 'oauth2' })
})

test('discoveryRequest() - oauth2 with a pathname and issuer terminating "/"', async () => {
  const data = { issuer: 'https://op.example.com/path/' }
  context
    .intercept({
      path: '/.well-known/oauth-authorization-server/path',
      method: 'GET',
    })
    .reply(200, data)

  const url = new URL(data.issuer)
  await lib.discoveryRequest(url, { algorithm: 'oauth2' })
})

test('processDiscoveryResponse()', async () => {
  const expected = new URL('https://op.example.com')

  await assert.rejects(lib.processDiscoveryResponse(expected, null as any), {
    message: '"response" must be an instance of Response',
  })
  await assert.rejects(lib.processDiscoveryResponse(null as any, new Response()), {
    message: '"expectedIssuerIdentifier" must be an instance of URL',
  })
  await assert.rejects(lib.processDiscoveryResponse(expected, getResponse('', { status: 404 })), {
    message:
      '"response" is not a conform Authorization Server Metadata response (unexpected HTTP status code)',
  })
  await assert.rejects(lib.processDiscoveryResponse(expected, getResponse('{"')), {
    message: 'failed to parse "response" body as JSON',
  })
  await assert.rejects(lib.processDiscoveryResponse(expected, getResponse('null')), {
    message: '"response" body must be a top level object',
  })
  await assert.rejects(lib.processDiscoveryResponse(expected, getResponse('[]')), {
    message: '"response" body must be a top level object',
  })

  await assert.rejects(
    lib.processDiscoveryResponse(expected, getResponse(JSON.stringify({ issuer: null }))),
    {
      message: '"response" body "issuer" property must be a string',
    },
  )

  await assert.rejects(
    lib.processDiscoveryResponse(
      expected,
      getResponse(JSON.stringify({ issuer: 'https://another-op.example.com' })),
    ),
    { message: '"response" body "issuer" property does not match the expected value' },
  )

  assert.deepStrictEqual(
    await lib.processDiscoveryResponse(
      expected,
      getResponse(JSON.stringify({ issuer: 'https://op.example.com' })),
    ),
    {
      issuer: 'https://op.example.com',
    },
  )
})
