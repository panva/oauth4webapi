import type QUnit from 'qunit'

import { setup } from './helper.js'
import * as lib from '../src/index.js'
import { keys } from './keys.js'
import * as jose from 'jose'

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('end2end-device-code.ts')

  const alg = 'ES256'

  for (const dpop of [true, false]) {
    test(`end-to-end device flow ${dpop ? 'w/ dpop' : ''}`, async (t) => {
      const kp = await keys[alg]
      const { client, issuerIdentifier } = await setup(
        alg,
        kp,
        'client_secret_post',
        false,
        false,
        false,
        ['refresh_token', 'urn:ietf:params:oauth:grant-type:device_code'],
        false,
      )
      const DPoPKeyPair = await lib.generateKeyPair(alg)
      const DPoP = dpop
        ? lib.DPoP(client, DPoPKeyPair, {
            [lib.modifyAssertion](h, p) {
              t.equal(h.alg, 'ES256')
              p.foo = 'bar'
            },
          })
        : undefined

      const clientAuth = lib.ClientSecretBasic(client.client_secret as string)

      const as = await lib
        .discoveryRequest(issuerIdentifier, { [lib.allowInsecureRequests]: true })
        .then((response) => lib.processDiscoveryResponse(issuerIdentifier, response))

      const resource = 'urn:example:resource:jwt'
      const params = new URLSearchParams()
      params.set('resource', resource)
      params.set('scope', 'openid api:write')

      let response = await lib.deviceAuthorizationRequest(as, client, clientAuth, params, {
        [lib.allowInsecureRequests]: true,
      })

      let result = await lib.processDeviceAuthorizationResponse(as, client, response)
      const { verification_uri_complete, device_code, interval = 5 } = result

      await fetch('http://localhost:3000/drive', {
        method: 'POST',
        body: new URLSearchParams({
          goto: verification_uri_complete!,
        }),
      })

      {
        const deviceCodeGrantRequest = () =>
          lib.deviceCodeGrantRequest(as, client, clientAuth, device_code, {
            DPoP,
            [lib.allowInsecureRequests]: true,
          })
        let response = await deviceCodeGrantRequest()

        const processDeviceCodeResponse = () => lib.processDeviceCodeResponse(as, client, response)
        let result: lib.TokenEndpointResponse | undefined
        while (!result) {
          try {
            result = await processDeviceCodeResponse()
          } catch {
            await new Promise((resolve) => setTimeout(resolve, interval * 1000))
            response = await deviceCodeGrantRequest()
          }
        }

        const { access_token, token_type } = result
        t.ok(access_token)
        t.equal(token_type, dpop ? 'dpop' : 'bearer')

        const verb = ['GET', 'POST', 'PATCH'][Math.floor(Math.random() * 3)]

        await lib.protectedResourceRequest(
          access_token,
          verb,
          new URL('http://localhost:3001/resource'),
          undefined,
          undefined,
          {
            DPoP,
            [lib.allowInsecureRequests]: true,
            // @ts-ignore
            async [lib.customFetch](...params: Parameters<typeof fetch>) {
              const url = new URL(params[0] as string)
              const { headers, method } = params[1]!
              const request = new Request(url, { headers, method })

              const jwtAccessToken = await lib.validateJwtAccessToken(as, request, resource, {
                [lib.allowInsecureRequests]: true,
              })

              t.propContains(jwtAccessToken, {
                client_id: client.client_id,
                iss: as.issuer,
                aud: resource,
              })

              if (DPoP) {
                t.equal(
                  jwtAccessToken.cnf!.jkt,
                  await jose.calculateJwkThumbprint(await jose.exportJWK(DPoPKeyPair.publicKey)),
                )

                t.propContains(await jose.decodeJwt(request.headers.get('dpop')!), { foo: 'bar' })
              } else {
                t.equal(jwtAccessToken.cnf, undefined)
              }

              return new Response()
            },
          },
        )
      }

      t.ok(1)
    })
  }
}
