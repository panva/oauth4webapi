import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'

import setup, { type Context, teardown } from './_setup.js'
import * as lib from './_lib.js'

const context = {} as Context

before(() => setup(context))
after(() => teardown(context))

test('protectedResource()', async () => {
  context.mock
    .get('https://rs.example.com')
    .intercept({
      path: '/resource',
      method: 'GET',
      headers: {
        authorization: 'Bearer token',
      },
    })
    .reply(200, '')
  const url = new URL('https://rs.example.com/resource')
  const response = await lib.protectedResourceRequest('token', 'GET', url)
  assert.strictEqual(response instanceof lib.Response, true)
})

test('protectedResource() w/ POST and ReadableStream body', async () => {
  const payload = 'stream body content'
  context.mock
    .get('https://rs.example.com')
    .intercept({
      path: '/resource',
      method: 'POST',
      headers: {
        authorization: 'Bearer token',
      },
    })
    .reply(200, '')
  const url = new URL('https://rs.example.com/resource')
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(payload))
      controller.close()
    },
  })
  const response = await lib.protectedResourceRequest('token', 'POST', url, undefined, body)
  assert.strictEqual(response instanceof lib.Response, true)
})

test('protectedResource() exposes duplex to custom fetch for ReadableStream bodies', async () => {
  const body = new ReadableStream()

  const response = await lib.protectedResourceRequest(
    'token',
    'POST',
    new URL('https://rs.example.com/resource'),
    undefined,
    body,
    {
      [lib.customFetch]: async (_url, options) => {
        assert.strictEqual(options.body, body)
        assert.strictEqual(options.duplex, 'half')
        return new lib.Response()
      },
    },
  )

  assert.strictEqual(response instanceof lib.Response, true)
})
