import type QUnit from 'qunit'

import { setup } from './helper.js'
import * as lib from '../src/index.js'
import { keys } from './keys.js'
import * as jose from 'jose'

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('end2end-ciba.ts')

  const alg = 'ES256'

  for (const dpop of [true, false]) {
    test(`end-to-end CIBA flow ${dpop ? 'w/ dpop' : ''}`, async (t) => {
      const kp = await keys[alg]
      const { client, issuerIdentifier } = await setup(
        alg,
        kp,
        'client_secret_post',
        false,
        false,
        false,
        ['refresh_token', 'urn:openid:params:grant-type:ciba'],
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
      params.set('login_hint', 'user')

      let response = await lib.backchannelAuthenticationRequest(as, client, clientAuth, params, {
        [lib.allowInsecureRequests]: true,
      })

      let result = await lib.processBackchannelAuthenticationResponse(as, client, response)
      const { auth_req_id, interval = 5 } = result

      await fetch('http://localhost:3000/ciba-sim', {
        method: 'POST',
        body: new URLSearchParams({
          action: 'allow',
          auth_req_id,
        }),
      })

      {
        const backchannelAuthenticationGrantRequest = () =>
          lib.backchannelAuthenticationGrantRequest(as, client, clientAuth, auth_req_id, {
            DPoP,
            [lib.allowInsecureRequests]: true,
          })
        let response = await backchannelAuthenticationGrantRequest()

        const processBackchannelAuthenticationGrantResponse = () =>
          lib.processBackchannelAuthenticationGrantResponse(as, client, response)
        let result: lib.TokenEndpointResponse | undefined
        while (!result) {
          try {
            result = await processBackchannelAuthenticationGrantResponse()
          } catch {
            await new Promise((resolve) => setTimeout(resolve, interval * 1000))
            response = await backchannelAuthenticationGrantRequest()
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
