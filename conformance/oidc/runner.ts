import anyTest, { type TestFn } from 'ava'

export const test = anyTest as TestFn<{ instance: Test }>

import * as jose from 'jose'
import * as oauth from '../../src/index.js'
import {
  createTestFromPlan,
  waitForState,
  type ModulePrescription,
  type Plan,
  type Test,
} from '../api'

import { JWS_ALGORITHM } from '../env'
const conformance = JSON.parse(process.env.CONFORMANCE!)

const configuration: {
  alias: string
  client: {
    client_id: string
    client_secret?: string
    redirect_uri: string
    jwks: {
      keys: jose.JWK[]
    }
  }
} = conformance.configuration

export const plan: Plan = conformance.plan

export function modules(name: string): ModulePrescription[] {
  return conformance.plan.modules.filter((x: ModulePrescription) => x.testModule === name)
}

export const green = test.macro({
  async exec(t, module: ModulePrescription) {
    t.timeout(10000)

    const instance = await createTestFromPlan(plan, module)
    t.context.instance = instance

    t.log('Test ID', instance.id)
    t.log('Test Name', instance.name)

    const variant = {
      ...conformance.variant,
      ...module.variant,
    }
    t.log('variant', variant)

    const issuer = new URL(`${instance.url}/`)

    const as = await oauth
      .discoveryRequest(issuer)
      .then((response) => oauth.processDiscoveryResponse(issuer, response))

    t.log('AS Metadata', as)

    const client: oauth.Client = {
      client_id: configuration.client.client_id,
      client_secret: configuration.client.client_secret,
    }

    client.token_endpoint_auth_method = variant.client_auth_type || 'client_secret_basic'
    if (instance.name.includes('client-secret-basic')) {
      client.token_endpoint_auth_method = 'client_secret_basic'
    }

    let clientPrivateKey!: oauth.PrivateKey

    switch (client.token_endpoint_auth_method) {
      case 'none':
        delete client.client_secret
        break
      case 'private_key_jwt':
        delete client.client_secret
        const jwk = configuration.client.jwks.keys.find((key) => key.alg === JWS_ALGORITHM)!
        clientPrivateKey = {
          kid: jwk.kid,
          key: <CryptoKey>await jose.importJWK(jwk, JWS_ALGORITHM),
        }
    }

    const scope = 'openid email'

    const code_verifier = oauth.generateRandomCodeVerifier()
    const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)
    const code_challenge_method = 'S256'

    const authorizationUrl = new URL(as.authorization_endpoint!)
    switch (variant.request_type) {
      case undefined:
      case 'plain_http_request': {
        authorizationUrl.searchParams.set('client_id', client.client_id)
        authorizationUrl.searchParams.set('code_challenge', code_challenge)
        authorizationUrl.searchParams.set('code_challenge_method', code_challenge_method)
        authorizationUrl.searchParams.set('redirect_uri', configuration.client.redirect_uri)
        authorizationUrl.searchParams.set('response_type', 'code')
        authorizationUrl.searchParams.set('scope', scope)
        break
      }
      case 'request_object': {
        authorizationUrl.searchParams.set('client_id', client.client_id)
        const params = new URLSearchParams()
        params.set('code_challenge', code_challenge)
        params.set('code_challenge_method', code_challenge_method)
        params.set('redirect_uri', configuration.client.redirect_uri)
        params.set('response_type', 'code')
        params.set('scope', scope)

        const jwk = configuration.client.jwks.keys.find((key) => key.alg === JWS_ALGORITHM)!
        const privateKey = <CryptoKey>await jose.importJWK(jwk, JWS_ALGORITHM)

        authorizationUrl.searchParams.set(
          'request',
          await oauth.issueRequestObject(as, client, params, { kid: jwk.kid, key: privateKey }),
        )
        authorizationUrl.searchParams.set('scope', scope)
        authorizationUrl.searchParams.set('response_type', 'code')
        break
      }
      default:
        throw new Error()
    }

    const response = await fetch(authorizationUrl.href, { redirect: 'manual' })

    t.log('redirect with', Object.fromEntries(authorizationUrl.searchParams.entries()))

    const currentUrl = new URL(response.headers.get('location')!)

    let sub: string
    let access_token: string
    {
      const params = oauth.validateAuthResponse(as, client, currentUrl, oauth.expectNoState)
      if (oauth.isOAuth2Error(params)) {
        t.log('error', params)
        throw new Error() // Handle OAuth 2.0 redirect error
      }

      t.log('parsed callback parameters', Object.fromEntries(params.entries()))

      const response = await oauth.authorizationCodeGrantRequest(
        as,
        client,
        params,
        configuration.client.redirect_uri,
        code_verifier,
        { clientPrivateKey },
      )

      let challenges: oauth.WWWAuthenticateChallenge[] | undefined
      if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
        for (const challenge of challenges) {
          t.log('challenge', challenge)
        }
        throw new Error() // Handle www-authenticate challenges as needed
      }

      t.log('token endpoint response body', await response.clone().json())

      const result = await oauth.processAuthorizationCodeOpenIDResponse(as, client, response)
      if (oauth.isOAuth2Error(result)) {
        t.log('error', result)
        throw new Error() // Handle OAuth 2.0 response body error
      }

      t.log('token endpoint response passed validation')
      ;({ access_token } = result)
      const claims = oauth.getValidatedIdTokenClaims(result)!
      t.log('ID Token Claims', claims)
      ;({ sub } = claims)
    }

    // fetch userinfo response
    {
      const response = await oauth.userInfoRequest(as, client, access_token)

      let challenges: oauth.WWWAuthenticateChallenge[] | undefined
      if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
        for (const challenge of challenges) {
          t.log('challenge', challenge)
        }
        throw new Error() // Handle www-authenticate challenges as needed
      }

      try {
        t.log('userinfo endpoint response body', await response.clone().json())
      } catch {
        t.log('userinfo endpoint response body', await response.clone().text())
      }

      await oauth.processUserInfoResponse(as, client, sub, response)
      t.log('userinfo response passed validation')
    }

    await waitForState(instance)

    t.log('Test Finished')
    t.pass()
  },
  title(providedTitle = '', module: ModulePrescription) {
    if (module.variant) {
      return `${providedTitle}${plan.name} (${plan.id}) - ${module.testModule} - ${JSON.stringify(
        module.variant,
      )}`
    }
    return `${providedTitle}${plan.name} (${plan.id}) - ${module.testModule}`
  },
})

export const red = test.macro({
  async exec(
    t,
    module: ModulePrescription,
    expectedMessage?: string | RegExp,
    expectedErrorName: string = 'OperationProcessingError',
  ) {
    await t
      .throwsAsync(() => <any>green.exec(t, module), {
        message: expectedMessage,
        name: expectedErrorName,
      })
      .then((ok) => {
        if (ok) {
          t.log('rejected with', {
            message: expectedMessage,
            name: expectedErrorName,
          })
        }
      })

    await waitForState(t.context.instance)
    t.log('Test Finished')
    t.pass()
  },
  title(providedTitle = '', module: ModulePrescription) {
    if (module.variant) {
      return `${providedTitle}${plan.name} (${plan.id}) - ${module.testModule} - ${JSON.stringify(
        module.variant,
      )}`
    }
    return `${providedTitle}${plan.name} (${plan.id}) - ${module.testModule}`
  },
})
