import type QUnit from 'qunit'
import * as jose from 'jose'

import {
  assertNoWwwAuthenticateChallenges,
  isDpopNonceError,
  assertNotOAuth2Error,
  setup,
  unexpectedAuthorizationServerError,
} from './helper.js'
import * as lib from '../src/index.js'
import { keys } from './keys.js'

const coinflip = () => !Math.floor(Math.random() * 2)

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('end2end-client-credentials.ts')

  const alg = 'ES256'

  const authMethodOptions: lib.ClientAuthenticationMethod[] = [
    'none',
    'private_key_jwt',
    'client_secret_basic',
    'client_secret_post',
  ]
  const dpopOptions = [false, true]
  const jwtIntrospectionOptions = [false, true]

  const cartesianMatrix = []

  for (const authMethod of authMethodOptions) {
    for (const dpop of dpopOptions) {
      for (const jwtIntrospection of jwtIntrospectionOptions) {
        cartesianMatrix.push({
          authMethod,
          dpop,
          jwtIntrospection,
        })
      }
    }
  }

  function trueCount(a: (boolean | string)[]) {
    return a.reduce((c, x) => (x === true ? ++c : c), 0)
  }

  for (const config of cartesianMatrix) {
    const { authMethod, dpop, jwtIntrospection } = config
    const options = [authMethod, dpop, jwtIntrospection]

    // Test
    // - every auth method with all options off
    // - individual options
    switch (trueCount(options)) {
      case 0:
        break
      case 1:
        if (authMethod === 'client_secret_basic') {
          break
        }
      default:
        continue
    }

    function label(config: Record<string, string | boolean>) {
      const keys = Object.keys(
        Object.fromEntries(Object.entries(config).filter(([, v]) => v === true)),
      )
      return keys.length ? `${config.authMethod} w/ ${keys.join(', ')}` : config.authMethod
    }

    test(`end-to-end client auth, client credentials, introspection, revocation ${label(
      config,
    )}`, async (t) => {
      const kp = await keys[alg]
      const { client, issuerIdentifier, clientPrivateKey } = await setup(
        alg,
        kp,
        authMethod,
        false,
        false,
        jwtIntrospection,
        ['client_credentials'],
      )
      const DPoP = dpop ? await lib.generateKeyPair(<lib.JWSAlgorithm>alg) : undefined

      const authenticated: lib.AuthenticatedRequestOptions = {
        clientPrivateKey: authMethod === 'private_key_jwt' ? clientPrivateKey : undefined,
      }

      const as = await lib
        .discoveryRequest(issuerIdentifier)
        .then((response) => lib.processDiscoveryResponse(issuerIdentifier, response))

      const params = new URLSearchParams()
      const resource = 'urn:example:resource:opaque'
      params.set('resource', resource)
      params.set('scope', 'api:write')

      {
        let clientCredentialsGrantRequest: () => ReturnType<
          typeof lib.clientCredentialsGrantRequest
        >

        if (coinflip()) {
          clientCredentialsGrantRequest = () =>
            lib.clientCredentialsGrantRequest(as, client, params, {
              DPoP,
              ...authenticated,
            })
        } else {
          clientCredentialsGrantRequest = () =>
            lib.genericTokenEndpointRequest(as, client, 'client_credentials', params, {
              DPoP,
              ...authenticated,
            })
        }
        let response = await clientCredentialsGrantRequest()

        assertNoWwwAuthenticateChallenges(response)

        const processClientCredentialsResponse = () =>
          lib.processClientCredentialsResponse(as, client, response)
        let result = await processClientCredentialsResponse()
        if (lib.isOAuth2Error(result)) {
          if (isDpopNonceError(result)) {
            response = await clientCredentialsGrantRequest()
            result = await processClientCredentialsResponse()
            if (!assertNotOAuth2Error(result)) return
          } else {
            throw unexpectedAuthorizationServerError(result)
          }
        }

        const { access_token, token_type } = result
        t.equal(token_type, dpop ? 'dpop' : 'bearer')

        {
          let response = await lib.introspectionRequest(as, client, access_token, authenticated)

          const clone = await response.clone().text()
          if (jwtIntrospection) {
            t.ok(jose.decodeJwt(clone))
          } else {
            t.ok(JSON.parse(clone))
          }

          assertNoWwwAuthenticateChallenges(response)

          const result = await lib.processIntrospectionResponse(as, client, response)

          if (!assertNotOAuth2Error(result)) return

          if (jwtIntrospection) {
            await lib.validateJwtIntrospectionSignature(as, response)
          }

          t.propContains(result, {
            active: true,
            scope: 'api:write',
            aud: resource,
            token_type: dpop ? 'DPoP' : 'Bearer',
          })
        }

        {
          let response = await lib.revocationRequest(as, client, access_token, authenticated)

          assertNoWwwAuthenticateChallenges(response)

          const result = await lib.processRevocationResponse(response)
          if (!assertNotOAuth2Error(result)) return
        }
      }

      t.ok(1)
    })
  }
}
