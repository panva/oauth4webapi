import type QUnit from 'qunit'
import * as lib from '../src/index.js'

const client = <lib.Client>{
  client_id: 'urn:example:client_id',
}
const identifier = 'https://op.example.com'
const issuer = <lib.AuthorizationServer>{
  issuer: identifier,
}

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('callback.ts')
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
        lib.validateAuthResponse(
          issuer,
          client,
          new URLSearchParams('code=foo'),
          lib.expectNoState,
        ),
      ),
    )
  })

  test('validateAuthResponse() error conditions', (t) => {
    t.throws(
      () => lib.validateAuthResponse(issuer, client, <any>null, lib.expectNoState),
      (err: Error) => {
        t.propContains(err, {
          message: '"parameters" must be an instance of URLSearchParams, or URL',
        })
        return true
      },
    )
    t.throws(
      () =>
        lib.validateAuthResponse(
          issuer,
          client,
          new URL('https://rp.example.com/cb?response=foo'),
          lib.expectNoState,
        ),
      (err: Error) => {
        t.propContains(err, {
          message:
            '"parameters" contains a JARM response, use validateJwtAuthResponse() instead of validateAuthResponse()',
        })
        return true
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
      (err: Error) => {
        t.propContains(err, { message: 'response parameter "iss" (issuer) missing' })
        return true
      },
    )
    t.throws(
      () =>
        lib.validateAuthResponse(
          issuer,
          client,
          new URL('https://rp.example.com/cb?code=foo&iss=foo'),
          lib.expectNoState,
        ),
      (err: Error) => {
        t.propContains(err, { message: 'unexpected "iss" (issuer) response parameter value' })
        return true
      },
    )
    t.throws(
      () =>
        lib.validateAuthResponse(
          issuer,
          client,
          new URL('https://rp.example.com/cb?code=foo&state=bar'),
          'foo',
        ),
      (err: Error) => {
        t.propContains(err, { message: 'unexpected "state" response parameter value' })
        return true
      },
    )
    t.throws(
      () =>
        lib.validateAuthResponse(
          issuer,
          client,
          new URLSearchParams('code=foo&state=foo'),
          lib.expectNoState,
        ),
      (err: Error) => {
        t.propContains(err, { message: 'unexpected "state" response parameter encountered' })
        return true
      },
    )
    t.throws(
      () =>
        lib.validateAuthResponse(
          issuer,
          client,
          new URLSearchParams('code=foo&state=foo'),
          <any>null,
        ),
      (err: Error) => {
        t.propContains(err, { message: '"expectedState" must be a non-empty string' })
        return true
      },
    )
    t.throws(
      () => lib.validateAuthResponse(issuer, client, new URLSearchParams('code=foo'), 'foo'),
      (err: Error) => {
        t.propContains(err, {
          message: 'response parameter "state" missing',
        })
        return true
      },
    )
    t.throws(
      () =>
        lib.validateAuthResponse(
          issuer,
          client,
          new URLSearchParams('code=foo&id_token=foo'),
          lib.expectNoState,
        ),
      (err: Error) => {
        t.propContains(err, { message: 'implicit and hybrid flows are not supported' })
        return true
      },
    )
    t.throws(
      () =>
        lib.validateAuthResponse(
          issuer,
          client,
          new URLSearchParams('code=foo&token=foo'),
          lib.expectNoState,
        ),
      (err: Error) => {
        t.propContains(err, { message: 'implicit and hybrid flows are not supported' })
        return true
      },
    )
    t.throws(
      () =>
        lib.validateAuthResponse(
          issuer,
          client,
          new URLSearchParams('id_token=foo&token=foo'),
          lib.expectNoState,
        ),
      (err: Error) => {
        t.propContains(err, { message: 'implicit and hybrid flows are not supported' })
        return true
      },
    )
    t.throws(
      () =>
        lib.validateAuthResponse(
          issuer,
          client,
          new URLSearchParams('code=foo&id_token=foo&token=foo'),
          lib.expectNoState,
        ),
      (err: Error) => {
        t.propContains(err, { message: 'implicit and hybrid flows are not supported' })
        return true
      },
    )
    t.throws(
      () =>
        lib.validateAuthResponse(issuer, client, new URLSearchParams('state=foo&state=foo'), 'foo'),
      (err: Error) => {
        t.propContains(err, { message: '"state" parameter must be provided only once' })
        return true
      },
    )
  })
}
