import anyTest, { type TestFn } from 'ava'

export const test = anyTest as TestFn<{ instance: Test }>

import { getScope } from './ava.config.js'
import * as oauth from '../src/index.js'
import {
  createTestFromPlan,
  waitForState,
  type ModulePrescription,
  type Plan,
  type Test,
} from './api.js'

import { JWS_ALGORITHM } from './env.js'
const conformance = JSON.parse(process.env.CONFORMANCE!)

const configuration: {
  alias: string
  client: {
    client_id: string
    client_secret?: string
    redirect_uri: string
    jwks: {
      keys: Array<JsonWebKey & { kid: string }>
    }
  }
} = conformance.configuration

export const plan: Plan = conformance.plan
export const variant: Record<string, string> = conformance.variant

let prefix = ''

switch (plan.name) {
  case 'fapi2-baseline-id2-client-test-plan':
    prefix = 'fapi2-baseline-id2-client-test-'
    break
  case 'fapi2-advanced-id1-client-test-plan':
    // TODO: https://gitlab.com/openid/conformance-suite/-/merge_requests/1173#note_1014001397
    prefix = 'fapi2-baseline-id2-client-test-'
    break
  case 'oidcc-client-test-plan':
  case 'oidcc-client-basic-certification-test-plan':
    prefix = 'oidcc-client-test-'
    break
  default:
    throw new Error()
}

const algorithms: Map<string, RsaHashedImportParams | EcKeyImportParams> = new Map([
  [
    'PS256',
    {
      name: 'RSA-PSS',
      hash: { name: 'SHA-256' },
    },
  ],
  [
    'ES256',
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
  ],
  [
    'RS256',
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
  ],
])

function importPrivateKey(alg: string, jwk: JsonWebKey) {
  return crypto.subtle.importKey('jwk', jwk, algorithms.get(alg)!, false, ['sign'])
}

export function modules(name: string): ModulePrescription[] {
  if (name === prefix.slice(0, -1)) {
    return conformance.plan.modules.filter((x: ModulePrescription) => x.testModule === name)
  }

  return conformance.plan.modules.filter(
    (x: ModulePrescription) => x.testModule === `${prefix}${name}`,
  )
}

function usesJarm(plan: Plan) {
  return plan.name.startsWith('fapi2-advanced')
}

function usesDpop(variant: Record<string, string>) {
  return variant.sender_constrain === 'dpop'
}

function usesPar(plan: Plan) {
  return plan.name.startsWith('fapi2')
}

function usesRequestObject(planName: string, variant: Record<string, string>) {
  if (planName.startsWith('fapi2-advanced')) {
    return true
  }

  if (variant.request_type === 'request_object') {
    return true
  }

  return false
}

interface TestOptions {
  useState?: boolean
  useNonce?: boolean
}

export const green = test.macro({
  async exec(t, module: ModulePrescription, options?: TestOptions) {
    t.timeout(15000)

    const instance = await createTestFromPlan(plan, module)
    t.context.instance = instance

    t.log('Test ID', instance.id)
    t.log('Test Name', instance.name)

    const variant = {
      ...conformance.variant,
      ...module.variant,
    }
    t.log('variant', variant)

    const issuer = new URL(instance.issuer)

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
          key: await importPrivateKey(JWS_ALGORITHM, jwk),
        }
    }

    const scope = getScope(variant)
    const code_verifier = oauth.generateRandomCodeVerifier()
    const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)
    const code_challenge_method = 'S256'

    const state = options?.useState ? oauth.generateRandomState() : oauth.expectNoState
    const nonce = options?.useNonce ? oauth.generateRandomNonce() : oauth.expectNoNonce

    let authorizationUrl = new URL(as.authorization_endpoint!)
    if (usesRequestObject(plan.name, variant) === false) {
      authorizationUrl.searchParams.set('client_id', client.client_id)
      authorizationUrl.searchParams.set('code_challenge', code_challenge)
      authorizationUrl.searchParams.set('code_challenge_method', code_challenge_method)
      authorizationUrl.searchParams.set('redirect_uri', configuration.client.redirect_uri)
      authorizationUrl.searchParams.set('response_type', 'code')
      authorizationUrl.searchParams.set('scope', scope)
      if (typeof state === 'string') {
        authorizationUrl.searchParams.set('state', state)
      }
      if (typeof nonce === 'string') {
        authorizationUrl.searchParams.set('nonce', nonce)
      }
    } else {
      authorizationUrl.searchParams.set('client_id', client.client_id)
      const params = new URLSearchParams()
      params.set('code_challenge', code_challenge)
      params.set('code_challenge_method', code_challenge_method)
      params.set('redirect_uri', configuration.client.redirect_uri)
      params.set('response_type', 'code')
      params.set('scope', scope)
      if (typeof state === 'string') {
        params.set('state', state)
      }
      if (typeof nonce === 'string') {
        params.set('nonce', nonce)
      }

      const jwk = configuration.client.jwks.keys.find((key) => key.alg === JWS_ALGORITHM)!
      const privateKey = await importPrivateKey(JWS_ALGORITHM, jwk)

      authorizationUrl.searchParams.set(
        'request',
        await oauth.issueRequestObject(as, client, params, { kid: jwk.kid, key: privateKey }),
      )
      authorizationUrl.searchParams.set('scope', scope)
      authorizationUrl.searchParams.set('response_type', 'code')
    }

    let DPoP!: CryptoKeyPair
    if (usesDpop(variant)) {
      DPoP = await oauth.generateKeyPair(<oauth.JWSAlgorithm>JWS_ALGORITHM)
      authorizationUrl.searchParams.set(
        'dpop_jkt',
        await oauth.calculateJwkThumbprint(DPoP.publicKey),
      )
    }

    if (usesPar(plan)) {
      t.log('PAR request with', Object.fromEntries(authorizationUrl.searchParams.entries()))
      const request = () =>
        oauth.pushedAuthorizationRequest(as, client, authorizationUrl.searchParams, {
          DPoP,
          clientPrivateKey,
        })
      let par = await request()

      let challenges: oauth.WWWAuthenticateChallenge[] | undefined
      if ((challenges = oauth.parseWwwAuthenticateChallenges(par))) {
        for (const challenge of challenges) {
          t.log('challenge', challenge)
        }
        throw new Error()
      }

      let result = await oauth.processPushedAuthorizationResponse(as, client, par)
      if (oauth.isOAuth2Error(result)) {
        t.log('error', result)
        if (result.error === 'use_dpop_nonce') {
          t.log('retrying with a newly obtained dpop nonce')
          par = await request()
          result = await oauth.processPushedAuthorizationResponse(as, client, par)
        }
        throw new Error() // Handle OAuth 2.0 response body error
      }
      t.log('PAR response', await par.clone().json())
      authorizationUrl = new URL(as.authorization_endpoint!)
      authorizationUrl.searchParams.set('client_id', client.client_id)
      authorizationUrl.searchParams.set('request_uri', result.request_uri)
    }

    const response = await fetch(authorizationUrl.href, { redirect: 'manual' })

    t.log('redirect with', Object.fromEntries(authorizationUrl.searchParams.entries()))

    const currentUrl = new URL(response.headers.get('location')!)

    let sub: string
    let access_token: string
    {
      let params: ReturnType<typeof oauth.validateAuthResponse>

      if (usesJarm(plan)) {
        params = await oauth.validateJwtAuthResponse(as, client, currentUrl, state)
      } else {
        params = oauth.validateAuthResponse(as, client, currentUrl, state)
      }

      if (oauth.isOAuth2Error(params)) {
        t.log('error', params)
        throw new Error() // Handle OAuth 2.0 redirect error
      }

      t.log('parsed callback parameters', Object.fromEntries(params.entries()))

      const request = () =>
        oauth.authorizationCodeGrantRequest(
          as,
          client,
          <Exclude<typeof params, oauth.OAuth2Error>>params,
          configuration.client.redirect_uri,
          code_verifier,
          { clientPrivateKey, DPoP },
        )
      let response = await request()

      let challenges: oauth.WWWAuthenticateChallenge[] | undefined
      if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
        for (const challenge of challenges) {
          t.log('challenge', challenge)
        }
        throw new Error()
      }

      let result:
        | oauth.OAuth2TokenEndpointResponse
        | oauth.OpenIDTokenEndpointResponse
        | oauth.OAuth2Error
      if (scope.includes('openid')) {
        result = await oauth.processAuthorizationCodeOpenIDResponse(as, client, response, nonce)
      } else {
        result = await oauth.processAuthorizationCodeOAuth2Response(as, client, response)
      }

      if (oauth.isOAuth2Error(result)) {
        t.log('error', result)
        if (result.error === 'use_dpop_nonce') {
          t.log('retrying with a newly obtained dpop nonce')
          response = await request()
          if (scope.includes('openid')) {
            result = await oauth.processAuthorizationCodeOpenIDResponse(as, client, response, nonce)
          } else {
            result = await oauth.processAuthorizationCodeOAuth2Response(as, client, response)
          }
        }
        throw new Error() // Handle OAuth 2.0 response body error
      }

      t.log('token endpoint response body', await response.clone().json())
      ;({ access_token } = result)
      if (result.id_token) {
        const claims = oauth.getValidatedIdTokenClaims(result)
        t.log('ID Token Claims', claims)
        ;({ sub } = claims)
      }
    }

    if (scope.includes('openid') && as.userinfo_endpoint) {
      // fetch userinfo response
      const request = () => {
        t.log('fetching', as.userinfo_endpoint)
        return oauth.userInfoRequest(as, client, access_token, { DPoP })
      }
      let response = await request()

      let challenges: oauth.WWWAuthenticateChallenge[] | undefined
      if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
        let retried = false
        for (const challenge of challenges) {
          t.log('challenge', challenge)
          if (challenge.scheme === 'dpop' && challenge.parameters.error === 'use_dpop_nonce') {
            t.log('retrying with a newly obtained dpop nonce')
            response = await request()
            retried = true
          }
        }
        if (!retried) {
          throw new Error()
        }
      }

      try {
        t.log('userinfo endpoint response body', await response.clone().json())
      } catch {
        t.log('userinfo endpoint response body', await response.clone().text())
      }

      await oauth.processUserInfoResponse(as, client, sub!, response)
      t.log('userinfo response passed validation')
    }

    if (instance.accounts_endpoint) {
      const request = () => {
        t.log('fetching', instance.accounts_endpoint)
        return oauth.protectedResourceRequest(
          access_token,
          'GET',
          new URL(instance.accounts_endpoint!),
          new Headers(),
          null,
          { DPoP },
        )
      }
      let accounts = await request()

      let challenges: oauth.WWWAuthenticateChallenge[] | undefined
      if ((challenges = oauth.parseWwwAuthenticateChallenges(accounts))) {
        let retried = false
        for (const challenge of challenges) {
          t.log('challenge', challenge)
          if (challenge.scheme === 'dpop' && challenge.parameters.error === 'use_dpop_nonce') {
            t.log('retrying with a newly obtained dpop nonce')
            accounts = await request()
            retried = true
          }
        }
        if (!retried) {
          throw new Error()
        }
      }

      try {
        t.log('accounts endpoint response body', await accounts.clone().json())
      } catch {
        t.log('accounts endpoint response body', await accounts.clone().text())
      }
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
    options?: TestOptions,
  ) {
    await t
      .throwsAsync(() => <any>green.exec(t, module, options), {
        message: expectedMessage,
        name: expectedErrorName,
      })
      .then((err) => {
        if (err) {
          t.log('rejected with', {
            message: err.message,
            name: err.name,
          })
        }
      })

    await waitForState(t.context.instance)
    t.log('Test Finished')
    t.pass()
  },
  title: <any>green.title,
})
