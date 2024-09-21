import type QUnit from 'qunit'
import * as jose from 'jose'

import { isDpopNonceError, setup, random } from './helper.js'
import * as lib from '../src/index.js'
import { keys } from './keys.js'

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('end2end-client-credentials.ts')

  const alg = 'ES256'

  const authMethodOptions: lib.ClientAuthenticationMethod[] = [
    'client_secret_basic',
    'client_secret_post',
    'private_key_jwt',
    'none',
  ]

  const options = (
    authMethod: lib.ClientAuthenticationMethod,
    ...flags: Array<'dpop' | 'jwtIntrospection' | 'encryption'>
  ) => {
    const conf = { authMethod, dpop: false, jwtIntrospection: false, encryption: false }
    for (const flag of flags) {
      conf[flag] = true
    }
    return conf
  }

  // - every auth method with all options off
  // - dpop alone
  // - jwtIntrospection alone
  // - jwtIntrospection & encryption
  const testCases = [
    ...authMethodOptions.map((authMethod) => options(authMethod)),
    options(authMethodOptions[0], 'dpop'),
    options(authMethodOptions[0], 'jwtIntrospection'),
    options(authMethodOptions[0], 'jwtIntrospection', 'encryption'),
  ]

  for (const config of testCases) {
    const { authMethod, dpop, jwtIntrospection, encryption } = config

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
        encryption,
      )
      const DPoP = dpop ? await lib.generateKeyPair(alg as lib.JWSAlgorithm) : undefined

      const authenticated: lib.AuthenticatedRequestOptions = {
        clientPrivateKey: authMethod === 'private_key_jwt' ? clientPrivateKey : undefined,
      }

      const as = await lib
        .discoveryRequest(issuerIdentifier, { [lib.allowInsecureRequests]: true })
        .then((response) => lib.processDiscoveryResponse(issuerIdentifier, response))

      const params = new URLSearchParams()
      const resource = 'urn:example:resource:opaque'
      params.set('resource', resource)
      params.set('scope', 'api:write')

      {
        let clientCredentialsGrantRequest: () => ReturnType<
          typeof lib.clientCredentialsGrantRequest
        >

        if (random()) {
          clientCredentialsGrantRequest = () =>
            lib.clientCredentialsGrantRequest(as, client, params, {
              DPoP,
              [lib.allowInsecureRequests]: true,
              ...authenticated,
            })
        } else {
          clientCredentialsGrantRequest = () =>
            lib.genericTokenEndpointRequest(as, client, 'client_credentials', params, {
              DPoP,
              [lib.allowInsecureRequests]: true,
              ...authenticated,
            })
        }
        let response = await clientCredentialsGrantRequest()

        const processClientCredentialsResponse = () =>
          lib.processClientCredentialsResponse(as, client, response)
        let result = await processClientCredentialsResponse().catch(async (err) => {
          if (isDpopNonceError(t, err)) {
            response = await clientCredentialsGrantRequest()
            return processClientCredentialsResponse()
          }

          throw err
        })

        const { access_token, token_type } = result
        t.equal(token_type, dpop ? 'dpop' : 'bearer')

        {
          let response = await lib.introspectionRequest(as, client, access_token, {
            clientPrivateKey: authenticated.clientPrivateKey
              ? {
                  ...clientPrivateKey,
                  [lib.modifyAssertion](h, p) {
                    t.equal(h.alg, 'ES256')
                    p.foo = 'bar'
                  },
                }
              : undefined,
            [lib.allowInsecureRequests]: true,
            async [lib.customFetch](...params: Parameters<typeof fetch>) {
              if (authMethod === 'private_key_jwt') {
                if (params[1]?.body instanceof URLSearchParams) {
                  t.propContains(await jose.decodeJwt(params[1].body.get('client_assertion')!), {
                    foo: 'bar',
                  })
                } else {
                  throw new Error()
                }
              }
              return fetch(...params)
            },
          })

          const result = await lib.processIntrospectionResponse(as, client, response)

          if (jwtIntrospection) {
            await lib.validateJwtIntrospectionSignature(as, response, {
              [lib.allowInsecureRequests]: true,
            })
          }

          t.propContains(result, {
            active: true,
            scope: 'api:write',
            aud: resource,
            token_type: dpop ? 'DPoP' : 'Bearer',
          })
        }

        {
          let response = await lib.revocationRequest(as, client, access_token, {
            [lib.allowInsecureRequests]: true,
            ...authenticated,
          })
          await lib.processRevocationResponse(response)
        }
      }

      t.ok(1)
    })
  }
}
