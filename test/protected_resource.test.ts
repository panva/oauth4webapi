import anyTest, { type TestFn } from 'ava'
import setup, { type Context, teardown } from './_setup.js'
import * as lib from '../src/index.js'

const test = anyTest as TestFn<Context>

test.before(setup)
test.after(teardown)

test('protectedResource()', async (t) => {
  t.context.mock
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
  t.true(response instanceof Response)
})
