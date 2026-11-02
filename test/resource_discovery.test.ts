import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'

import setup, { type Context, teardown, getResponse, UA } from './_setup.js'
import * as lib from './_lib.js'

const context = {} as Context

const resource = 'https://rs.example.com'

before(() => setup(context, resource))
after(() => teardown(context))
const data = { resource }

test('resourceDiscoveryRequest()', async () => {
  context
    .intercept({
      path: '/.well-known/oauth-protected-resource',
      method: 'GET',
      headers: {
        accept: 'application/json',
        'user-agent': UA,
      },
    })
    .reply(200, data)

  const response = await lib.resourceDiscoveryRequest(new URL(resource))
  assert.strictEqual(response instanceof lib.Response, true)
})

test('resourceDiscoveryRequest() w/ Custom Headers', async () => {
  context
    .intercept({
      path: '/.well-known/oauth-protected-resource',
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
    const response = await lib.resourceDiscoveryRequest(new URL(resource), { headers })
    assert.strictEqual(response instanceof lib.Response, true)
  }
})

test('resourceDiscoveryRequest() with a pathname', async () => {
  const data = { resource: 'https://rs.example.com/path' }
  context
    .intercept({
      path: '/.well-known/oauth-protected-resource/path',
      method: 'GET',
    })
    .reply(200, data)

  const url = new URL(data.resource)
  await lib.resourceDiscoveryRequest(url)
})

test('resourceDiscoveryRequest() with a pathname and terminating "/"', async () => {
  const data = { resource: 'https://rs.example.com/path/' }
  context
    .intercept({
      path: '/.well-known/oauth-protected-resource/path/',
      method: 'GET',
    })
    .reply(200, data)

  const url = new URL(data.resource)
  await lib.resourceDiscoveryRequest(url)
})

test('ResourceServer array metadata typings', () => {
  const metadata: lib.ResourceServer = {
    resource,
    authorization_details_types_supported: ['payment_initiation'],
    dpop_signing_alg_values_supported: ['ES256'],
  }

  assert.deepStrictEqual(metadata.authorization_details_types_supported, ['payment_initiation'])
  assert.deepStrictEqual(metadata.dpop_signing_alg_values_supported, ['ES256'])
})

test('processResourceDiscoveryResponse()', async () => {
  const expected = new URL(resource)

  await assert.rejects(lib.processResourceDiscoveryResponse(expected, null as any), {
    message: '"response" must be an instance of Response',
  })
  await assert.rejects(lib.processResourceDiscoveryResponse(null as any, new Response()), {
    message: '"expectedResourceIdentifier" must be an instance of URL',
  })
  await assert.rejects(
    lib.processResourceDiscoveryResponse(expected, getResponse('', { status: 404 })),
    {
      message:
        '"response" is not a conform Resource Server Metadata response (unexpected HTTP status code)',
    },
  )
  await assert.rejects(lib.processResourceDiscoveryResponse(expected, getResponse('{"')), {
    message: 'failed to parse "response" body as JSON',
  })
  await assert.rejects(lib.processResourceDiscoveryResponse(expected, getResponse('null')), {
    message: '"response" body must be a top level object',
  })
  await assert.rejects(lib.processResourceDiscoveryResponse(expected, getResponse('[]')), {
    message: '"response" body must be a top level object',
  })

  await assert.rejects(
    lib.processResourceDiscoveryResponse(expected, getResponse(JSON.stringify({ resource: null }))),
    {
      message: '"response" body "resource" property must be a string',
    },
  )

  await assert.rejects(
    lib.processResourceDiscoveryResponse(
      expected,
      getResponse(JSON.stringify({ resource: 'https://another-rs.example.com' })),
    ),
    { message: '"response" body "resource" property does not match the expected value' },
  )

  assert.deepStrictEqual(
    await lib.processResourceDiscoveryResponse(
      expected,
      getResponse(JSON.stringify({ resource: 'https://rs.example.com' })),
    ),
    {
      resource: 'https://rs.example.com',
    },
  )
})
