// see https://github.com/panva/oauth4webapi/issues/13
// All browser navigator user-agent strings start with Mozilla/5.0
// It is unlikely to ever change too
// @ts-expect-error
globalThis.navigator = { userAgent: 'Mozilla/5.0 foo' }
const lib = await import('../src/index.js')

import anyTest, { type TestFn } from 'ava'
import setup, { type Context, teardown, issuer, UA } from './_setup.js'

const test = anyTest as TestFn<Context>

test.before(setup)
test.after(teardown)

test('when in browser does not set custom user-agent', async (t) => {
  const data = { ...issuer }
  t.context
    .intercept({
      path: '/.well-known/openid-configuration',
      method: 'GET',
      headers(headers) {
        if (UA.test(headers['user-agent'])) {
          t.fail()
        } else {
          t.pass()
        }
        return true
      },
    })
    .reply(200, data)

  await lib.discoveryRequest(new URL(issuer.issuer))
})
