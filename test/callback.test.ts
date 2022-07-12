import test from 'ava'
import { client, issuer } from './_setup.js'

import * as lib from '../src/index.js'

test('validateAuthResponse()', (t) => {
  lib.validateAuthResponse(
    issuer,
    client,
    new URL('https://rp.example.com/cb?code=foo'),
    lib.expectNoState,
  )
  lib.validateAuthResponse(issuer, client, new URL('https://rp.example.com/cb?code=foo'))
  lib.validateAuthResponse(
    issuer,
    client,
    new URL('https://rp.example.com/cb?code=foo&state=foo'),
    'foo',
  )
  lib.validateAuthResponse(issuer, client, new URLSearchParams('code=foo'), lib.expectNoState)
  lib.validateAuthResponse(issuer, client, new URLSearchParams('code=foo&state=foo'), 'foo')
  lib.validateAuthResponse(
    issuer,
    client,
    new URLSearchParams('code=foo&state=foo'),
    lib.skipStateCheck,
  )

  t.true(
    lib.isOAuth2Error(
      lib.validateAuthResponse(
        issuer,
        client,
        new URLSearchParams('error=access_denied'),
        lib.expectNoState,
      ),
    ),
  )

  t.false(
    lib.isOAuth2Error(
      lib.validateAuthResponse(issuer, client, new URLSearchParams('code=foo'), lib.expectNoState),
    ),
  )

  t.pass()
})

test('validateAuthResponse() error conditions', (t) => {
  t.throws(() => lib.validateAuthResponse(issuer, client, <any>null, lib.expectNoState), {
    message: '"parameters" must be an instance of URLSearchParams, or URL',
  })
  t.throws(
    () =>
      lib.validateAuthResponse(
        issuer,
        client,
        new URL('https://rp.example.com/cb?response=foo'),
        lib.expectNoState,
      ),
    {
      message:
        '"parameters" contains a JARM response, use validateJwtAuthResponse() instead of validateAuthResponse()',
    },
  )
  t.throws(
    () =>
      lib.validateAuthResponse(
        { ...issuer, authorization_response_iss_parameter_supported: true },
        client,
        new URL('https://rp.example.com/cb?code=foo'),
        lib.expectNoState,
      ),
    { message: 'response parameter "iss" (issuer) missing' },
  )
  t.throws(
    () =>
      lib.validateAuthResponse(
        issuer,
        client,
        new URL('https://rp.example.com/cb?code=foo&iss=foo'),
        lib.expectNoState,
      ),
    { message: 'unexpected "iss" (issuer) response parameter value' },
  )
  t.throws(
    () =>
      lib.validateAuthResponse(
        issuer,
        client,
        new URL('https://rp.example.com/cb?code=foo&state=bar'),
        'foo',
      ),
    { message: 'unexpected "state" response parameter value' },
  )
  t.throws(
    () =>
      lib.validateAuthResponse(
        issuer,
        client,
        new URLSearchParams('code=foo&state=foo'),
        lib.expectNoState,
      ),
    { message: 'unexpected "state" response parameter encountered' },
  )
  t.throws(
    () =>
      lib.validateAuthResponse(
        issuer,
        client,
        new URLSearchParams('code=foo&state=foo'),
        <any>null,
      ),
    { message: '"expectedState" must be a non-empty string' },
  )
  t.throws(() => lib.validateAuthResponse(issuer, client, new URLSearchParams('code=foo'), 'foo'), {
    message: 'response parameter "state" missing',
  })
  t.throws(
    () =>
      lib.validateAuthResponse(
        issuer,
        client,
        new URLSearchParams('code=foo&id_token=foo'),
        lib.expectNoState,
      ),
    { message: 'implicit and hybrid flows are not supported' },
  )
  t.throws(
    () =>
      lib.validateAuthResponse(
        issuer,
        client,
        new URLSearchParams('code=foo&token=foo'),
        lib.expectNoState,
      ),
    { message: 'implicit and hybrid flows are not supported' },
  )
  t.throws(
    () =>
      lib.validateAuthResponse(
        issuer,
        client,
        new URLSearchParams('id_token=foo&token=foo'),
        lib.expectNoState,
      ),
    { message: 'implicit and hybrid flows are not supported' },
  )
  t.throws(
    () =>
      lib.validateAuthResponse(
        issuer,
        client,
        new URLSearchParams('code=foo&id_token=foo&token=foo'),
        lib.expectNoState,
      ),
    { message: 'implicit and hybrid flows are not supported' },
  )
  t.throws(
    () =>
      lib.validateAuthResponse(issuer, client, new URLSearchParams('state=foo&state=foo'), 'foo'),
    { message: '"state" parameter must be provided only once' },
  )
})
