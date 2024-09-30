import type QUnit from 'qunit'
import * as jose from 'jose'

import { isDpopNonceError, setup, random } from './helper.js'
import * as lib from '../src/index.js'
import { keys } from './keys.js'

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('end2end-client-credentials.ts')

  const alg = 'ES256'

  const authMethodOptions: string[] = [
    'client_secret_post',
    'client_secret_basic',
    'client_secret_jwt',
    'private_key_jwt',
    'none',
  ]

  const options = (
    authMethod: string,
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
      const DPoP = dpop ? lib.DPoP(client, await lib.generateKeyPair(alg)) : undefined

      let clientAuth: lib.ClientAuth
      switch (authMethod) {
        case 'client_secret_basic':
          clientAuth = lib.ClientSecretBasic(client.client_secret as string)
          break
        case 'client_secret_post':
          clientAuth = lib.ClientSecretPost(client.client_secret as string)
          break
        case 'client_secret_jwt':
          clientAuth = lib.ClientSecretJwt(client.client_secret as string)
          break
        case 'private_key_jwt':
          clientAuth = lib.PrivateKeyJwt({
            ...clientPrivateKey,
            [lib.modifyAssertion](h, p) {
              t.equal(h.alg, 'ES256')
              p.foo = 'bar'
            },
          })
          break
        case 'none':
          clientAuth = lib.None()
          break
        default:
          throw new Error('unreachable')
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
        > = async () => {
          if (random()) {
            return lib.clientCredentialsGrantRequest(as, client, clientAuth, params, {
              DPoP,
              [lib.allowInsecureRequests]: true,
            })
          }

          return lib.genericTokenEndpointRequest(
            as,
            client,
            clientAuth,
            'client_credentials',
            params,
            {
              DPoP,
              [lib.allowInsecureRequests]: true,
            },
          )
        }
        let response = await clientCredentialsGrantRequest()

        const processClientCredentialsResponse = () => {
          if (random()) {
            return lib.processClientCredentialsResponse(as, client, response)
          }

          return lib.processGenericTokenEndpointResponse(as, client, response)
        }

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
          let response = await lib.introspectionRequest(as, client, clientAuth, access_token, {
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
            await lib.validateApplicationLevelSignature(as, response, {
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
          let response = await lib.revocationRequest(as, client, clientAuth, access_token, {
            [lib.allowInsecureRequests]: true,
          })
          await lib.processRevocationResponse(response)
        }
      }

      t.ok(1)
    })
  }
}
