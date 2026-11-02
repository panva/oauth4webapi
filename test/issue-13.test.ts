import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
// see https://github.com/panva/oauth4webapi/issues/13
// All browser navigator user-agent strings start with Mozilla/5.0
// It is unlikely to ever change too
// @ts-expect-error
delete globalThis.navigator
// @ts-expect-error
globalThis.navigator = { userAgent: 'Mozilla/5.0 foo' }
const lib = await import('./_lib.js')

import setup, { type Context, teardown, issuer, UA } from './_setup.js'

const context = {} as Context

before(() => setup(context))
after(() => teardown(context))

test('when in browser does not set custom user-agent', async () => {
  const data = { ...issuer }
  context
    .intercept({
      path: '/.well-known/openid-configuration',
      method: 'GET',
      headers(headers) {
        assert.strictEqual(UA.test(headers['user-agent']), false)
        return true
      },
    })
    .reply(200, data)

  await lib.discoveryRequest(new URL(issuer.issuer))
})
