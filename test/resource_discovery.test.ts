import anyTest, { type TestFn } from 'ava'
import setup, { type Context, teardown, getResponse, UA } from './_setup.js'
import * as lib from '../src/index.js'

const test = anyTest as TestFn<Context>

const resource = 'https://rs.example.com'

test.before(setup(resource))
test.after(teardown)
const data = { resource }

test('resourceDiscoveryRequest()', async (t) => {
  t.context
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
  t.true(response instanceof Response)
})

test('resourceDiscoveryRequest() w/ Custom Headers', async (t) => {
  t.context
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
    t.true(response instanceof Response)
  }
})

test('resourceDiscoveryRequest() with a pathname', async (t) => {
  const data = { resource: 'https://rs.example.com/path' }
  t.context
    .intercept({
      path: '/.well-known/oauth-protected-resource/path',
      method: 'GET',
    })
    .reply(200, data)

  const url = new URL(data.resource)
  await lib.resourceDiscoveryRequest(url)
  t.pass()
})

test('resourceDiscoveryRequest() with a pathname and terminating "/"', async (t) => {
  const data = { resource: 'https://rs.example.com/path/' }
  t.context
    .intercept({
      path: '/.well-known/oauth-protected-resource/path/',
      method: 'GET',
    })
    .reply(200, data)

  const url = new URL(data.resource)
  await lib.resourceDiscoveryRequest(url)
  t.pass()
})

test('processResourceDiscoveryResponse()', async (t) => {
  const expected = new URL(resource)

  await t.throwsAsync(lib.processResourceDiscoveryResponse(expected, null as any), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(lib.processResourceDiscoveryResponse(null as any, new Response()), {
    message: '"expectedResourceIdentifier" must be an instance of URL',
  })
  await t.throwsAsync(
    lib.processResourceDiscoveryResponse(expected, getResponse('', { status: 404 })),
    {
      message:
        '"response" is not a conform Resource Server Metadata response (unexpected HTTP status code)',
    },
  )
  await t.throwsAsync(lib.processResourceDiscoveryResponse(expected, getResponse('{"')), {
    message: 'failed to parse "response" body as JSON',
  })
  await t.throwsAsync(lib.processResourceDiscoveryResponse(expected, getResponse('null')), {
    message: '"response" body must be a top level object',
  })
  await t.throwsAsync(lib.processResourceDiscoveryResponse(expected, getResponse('[]')), {
    message: '"response" body must be a top level object',
  })

  await t.throwsAsync(
    lib.processResourceDiscoveryResponse(expected, getResponse(JSON.stringify({ resource: null }))),
    {
      message: '"response" body "resource" property must be a string',
    },
  )

  await t.throwsAsync(
    lib.processResourceDiscoveryResponse(
      expected,
      getResponse(JSON.stringify({ resource: 'https://another-rs.example.com' })),
    ),
    { message: '"response" body "resource" property does not match the expected value' },
  )

  t.deepEqual(
    await lib.processResourceDiscoveryResponse(
      expected,
      getResponse(JSON.stringify({ resource: 'https://rs.example.com' })),
    ),
    {
      resource: 'https://rs.example.com',
    },
  )
})
