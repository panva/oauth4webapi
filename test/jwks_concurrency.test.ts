import anyTest, { type TestFn } from 'ava'
import * as jose from 'jose'
import setup, { client, endpoint, getResponse, issuer, teardown, type Context } from './_setup.js'
import * as lib from './_lib.js'

const test = anyTest as TestFn<Context>

test.before(setup())
test.after(teardown)

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((resolvePromise) => {
    resolve = () => resolvePromise()
  })
  return { promise, resolve }
}

async function fixture(jwksUri = endpoint('jwks-concurrent')) {
  const key = await lib.generateKeyPair('ES256')
  const as: lib.AuthorizationServer = {
    ...issuer,
    jwks_uri: jwksUri,
    authorization_signing_alg_values_supported: ['ES256'],
  }
  const jwks = { keys: [await jose.exportJWK(key.publicKey)] }
  const jwt = await new jose.SignJWT({ code: 'code' })
    .setProtectedHeader({ alg: 'ES256' })
    .setAudience(client.client_id)
    .setIssuer(as.issuer)
    .setExpirationTime('5m')
    .sign(key.privateKey)
  const parameters = new URLSearchParams({ response: jwt })
  return {
    as,
    jwks,
    parameters,
    response: () => getResponse(JSON.stringify(jwks)),
    validate: (options: lib.ValidateSignatureOptions) =>
      lib.validateJwtAuthResponse(as, client, parameters, undefined, options),
  }
}

for (const withSignal of [false, true]) {
  test(`concurrent JWKS requests share a fetch (signal: ${withSignal})`, async (testContext) => {
    const context = await fixture()
    const signal = withSignal ? new AbortController().signal : undefined
    const caches: lib.JWKSCacheInput[] = Array.from({ length: 8 }, () => ({}))
    let requests = 0
    let signalCalls = 0
    const fetcher: NonNullable<lib.ValidateSignatureOptions[typeof lib.customFetch]> = async (
      _url,
      init,
    ) => {
      requests++
      testContext.is(init.signal, signal)
      testContext.is(init.headers['x-cache-test'], 'value')
      return context.response()
    }

    const results = await Promise.all(
      caches.map((cache, index) =>
        context.validate({
          headers:
            index % 2 === 0
              ? new Headers({ 'X-Cache-Test': 'value' })
              : { 'x-cache-test': 'value' },
          signal: signal
            ? (url) => {
                signalCalls++
                testContext.is(url, context.as.jwks_uri!)
                return signal
              }
            : undefined,
          [lib.customFetch]: fetcher,
          [lib.jwksCache]: cache,
        }),
      ),
    )

    testContext.is(requests, 1)
    testContext.is(signalCalls, withSignal ? 8 : 0)
    for (const result of results) {
      testContext.is(result.get('code'), 'code')
    }
    for (const cache of caches) {
      testContext.deepEqual(cache.jwks, context.jwks)
      testContext.true(Number.isFinite(cache.uat))
      testContext.is(cache.uat, caches[0].uat)
    }
    testContext.not(caches[0].jwks, caches[1].jwks)
    testContext.not(caches[0].jwks?.keys, caches[1].jwks?.keys)

    await testContext.notThrowsAsync(
      context.validate({
        [lib.customFetch]: async () => {
          throw new Error('unexpected warm-cache fetch')
        },
      }),
    )
  })
}

for (const difference of ['headers', 'fetch', 'metadata']) {
  test(`JWKS requests with different ${difference} stay independent`, async (testContext) => {
    const context = await fixture()
    let requests = 0
    const makeFetch = () => async () => {
      requests++
      return context.response()
    }
    const fetcher = makeFetch()
    const firstOptions: lib.ValidateSignatureOptions = {
      headers: difference === 'headers' ? { 'x-cache-test': 'first' } : undefined,
      [lib.customFetch]: fetcher,
    }
    const secondOptions: lib.ValidateSignatureOptions = {
      headers: difference === 'headers' ? { 'x-cache-test': 'second' } : undefined,
      [lib.customFetch]: difference === 'fetch' ? makeFetch() : fetcher,
    }

    const results = await Promise.all([
      context.validate(firstOptions),
      lib.validateJwtAuthResponse(
        difference === 'metadata' ? { ...context.as } : context.as,
        client,
        context.parameters,
        undefined,
        secondOptions,
      ),
      context.validate(firstOptions),
    ])

    testContext.is(requests, 2)
    for (const result of results) {
      testContext.is(result.get('code'), 'code')
    }
  })
}

test('separate abort signals do not cancel other JWKS callers', async (testContext) => {
  const context = await fixture()
  const started = deferred()
  const release = deferred()
  const firstController = new AbortController()
  const secondController = new AbortController()
  const reason = new Error('first request cancelled')
  let requests = 0
  const fetcher: NonNullable<lib.ValidateSignatureOptions[typeof lib.customFetch]> = async (
    _url,
    init,
  ) => {
    requests++
    started.resolve()
    await release.promise
    init.signal?.throwIfAborted()
    return context.response()
  }

  const pending = Promise.allSettled([
    context.validate({ signal: firstController.signal, [lib.customFetch]: fetcher }),
    context.validate({ signal: secondController.signal, [lib.customFetch]: fetcher }),
  ])
  await started.promise
  firstController.abort(reason)
  release.resolve()
  const [first, second] = await pending

  testContext.is(requests, 2)
  testContext.is(first.status, 'rejected')
  testContext.is(second.status, 'fulfilled')
  if (first.status === 'rejected') {
    testContext.is(first.reason, reason)
  }
  if (second.status === 'fulfilled') {
    testContext.is(second.value.get('code'), 'code')
  }
})

test('aborted shared JWKS requests allow a fresh request', async (testContext) => {
  const context = await fixture()
  const started = deferred()
  const release = deferred()
  const controller = new AbortController()
  const reason = new Error('shared request cancelled')
  let requests = 0
  const fetcher: NonNullable<lib.ValidateSignatureOptions[typeof lib.customFetch]> = async (
    _url,
    init,
  ) => {
    requests++
    started.resolve()
    await release.promise
    init.signal?.throwIfAborted()
    return context.response()
  }

  const pending = Promise.allSettled(
    Array.from({ length: 8 }, () =>
      context.validate({ signal: controller.signal, [lib.customFetch]: fetcher }),
    ),
  )
  await started.promise
  controller.abort(reason)
  release.resolve()
  const results = await pending

  testContext.is(requests, 1)
  for (const result of results) {
    testContext.is(result.status, 'rejected')
    if (result.status === 'rejected') {
      testContext.is(result.reason, reason)
    }
  }
  await testContext.notThrowsAsync(
    context.validate({ signal: new AbortController().signal, [lib.customFetch]: fetcher }),
  )
  testContext.is(requests, 2)
})

test('joining a JWKS request still enforces HTTPS', async (testContext) => {
  const context = await fixture('http://op.example.com/jwks-concurrent')
  const started = deferred()
  const release = deferred()
  let requests = 0
  const fetcher = async () => {
    requests++
    started.resolve()
    await release.promise
    return context.response()
  }

  const pending = Promise.allSettled([
    context.validate({ [lib.allowInsecureRequests]: true, [lib.customFetch]: fetcher }),
    context.validate({ [lib.customFetch]: fetcher }),
  ])
  await started.promise
  release.resolve()
  const [allowed, forbidden] = await pending

  testContext.is(requests, 1)
  testContext.is(allowed.status, 'fulfilled')
  testContext.is(forbidden.status, 'rejected')
  if (forbidden.status === 'rejected') {
    testContext.is(forbidden.reason.code, lib.HTTP_REQUEST_FORBIDDEN)
  }
})

for (const failureMode of ['network', 'synchronous', 'jwks']) {
  test(`failed shared JWKS ${failureMode} requests can be retried`, async (testContext) => {
    const context = await fixture()
    const failure = new Error('fetch failed')
    let fail = true
    let requests = 0
    const options: lib.ValidateSignatureOptions = {
      [lib.customFetch]: () => {
        requests++
        if (fail) {
          if (failureMode === 'synchronous') {
            throw failure
          }
          if (failureMode === 'network') {
            return Promise.reject(failure)
          }
          return Promise.resolve(getResponse('{"keys":null}'))
        }
        return Promise.resolve(context.response())
      },
    }

    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () => context.validate(options)),
    )
    testContext.is(requests, 1)
    for (const result of results) {
      testContext.is(result.status, 'rejected')
      if (result.status === 'rejected') {
        if (failureMode !== 'jwks') {
          testContext.is(result.reason, failure)
        } else {
          testContext.is(result.reason.code, lib.INVALID_RESPONSE)
        }
      }
    }

    fail = false
    testContext.is((await context.validate(options)).get('code'), 'code')
    testContext.is(requests, 2)
  })
}
