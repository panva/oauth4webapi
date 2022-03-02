import anyTest, { type TestFn } from 'ava'
import setup, { issuer, endpoint, type Context, teardown, getResponse } from './_setup.js'
import * as lib from '../src/index.js'

const j = JSON.stringify
const test = anyTest as TestFn<Context>

test.before(setup)
test.after(teardown)

test('jwksRequest()', async (t) => {
  const data = { keys: [] }
  t.context
    .intercept({
      path: '/jwks',
      method: 'GET',
      headers: {
        accept: 'application/json, application/jwk-set+json',
        'user-agent': 'uatbd',
      },
    })
    .reply(200, data)

  const response = await lib.jwksRequest({ ...issuer, jwks_uri: endpoint('jwks') })
  t.true(response instanceof Response)
})

test('jwksRequest() requires jwks_uri', async (t) => {
  await t.throwsAsync(lib.jwksRequest({ ...issuer, jwks_uri: undefined }), {
    instanceOf: TypeError,
    message: '"issuer.jwks_uri" must be a string',
  })
})

test('processJwksResponse()', async (t) => {
  await t.throwsAsync(lib.processJwksResponse(<any>null), {
    message: '"response" must be an instance of Response',
  })
  await t.throwsAsync(lib.processJwksResponse(getResponse('{"')), {
    message: 'failed to parsed "response" body as JSON',
  })
  await t.throwsAsync(lib.processJwksResponse(getResponse(j({ keys: [] }), { status: 404 })), {
    message: '"response" is not a conform JSON Web Key Set response',
  })
  await t.throwsAsync(lib.processJwksResponse(getResponse(j([]))), {
    message: '"response" body must be a top level object',
  })
  await t.throwsAsync(lib.processJwksResponse(getResponse(j({ keys: {} }))), {
    message: '"response" body "keys" property must be an array',
  })
  await t.throwsAsync(lib.processJwksResponse(getResponse(j({ keys: [null] }))), {
    message: '"response" body "keys" property members must be JWK formatted objects',
  })
  await t.notThrowsAsync(async () => {
    const response = getResponse(j({ keys: [] }))
    await lib.processJwksResponse(response)
    t.false(response.bodyUsed)
  })
})
