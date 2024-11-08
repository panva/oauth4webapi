import anyTest from 'ava'
import type { Macro, TestFn } from 'ava'
import { importJWK, type JWK, calculateJwkThumbprint, exportJWK, compactDecrypt } from 'jose'
import * as undici from 'undici'
import { inspect } from 'node:util'

export const test = anyTest as TestFn<{ instance: Test }>

import { getScope } from './ava.config.js'
import * as oauth from '../src/index.js'
import {
  createTestFromPlan,
  waitForState,
  getTestExposed,
  type ModulePrescription,
  type Plan,
  type Test,
} from './api.js'

const conformance = JSON.parse(process.env.CONFORMANCE!)

const configuration: {
  alias: string
  client: {
    client_id: string
    client_secret?: string
    redirect_uri: string
    use_mtls_endpoint_aliases: boolean
    jwks: {
      keys: Array<JWK & { kid: string }>
    }
  }
} = conformance.configuration

function random() {
  return Math.random() < 0.5
}

const ALG = conformance.ALG as string
export const plan: Plan = conformance.plan
export const variant: Record<string, string> = conformance.variant
export const mtls: { key: string; cert: string } = conformance.mtls || {}

let prefix = ''

switch (plan.name) {
  case 'fapi1-advanced-final-client-test-plan':
  case 'fapi2-security-profile-id2-client-test-plan':
    prefix = plan.name.slice(0, -4)
    break
  case 'fapi2-message-signing-id1-client-test-plan':
    prefix = 'fapi2-security-profile-id2-client-test-'
    break
  case 'oidcc-client-test-plan':
  case 'oidcc-client-basic-certification-test-plan':
  case 'oidcc-client-hybrid-certification-test-plan':
    prefix = 'oidcc-client-test-'
    break
  default:
    throw new Error()
}

async function importPrivateKey(alg: string, jwk: JWK) {
  const key = await importJWK<CryptoKey>(jwk, alg)
  if (!('type' in key)) {
    throw new Error()
  }
  return key
}

export function modules(name: string): ModulePrescription[] {
  return conformance.plan.modules.filter((x: ModulePrescription) => {
    switch (x.variant?.response_type) {
      case 'code token':
      case 'code id_token token':
        return false
    }

    return x.testModule === (name === prefix.slice(0, -1) ? name : `${prefix}${name}`)
  })
}

function usesJarm(variant: Record<string, string>) {
  return variant.fapi_response_mode === 'jarm'
}

function usesDpop(variant: Record<string, string>) {
  return variant.sender_constrain === 'dpop'
}

function usesPar(plan: Plan) {
  return plan.name.startsWith('fapi2') || variant.fapi_auth_request_method === 'pushed'
}

export function nonRepudiation(plan: Plan, variant: Record<string, string>) {
  return (
    variant.fapi_client_type === 'oidc' &&
    (plan.name.startsWith('fapi2-message-signing') || plan.name.startsWith('fapi1'))
  )
}

function usesRequestObject(planName: string, variant: Record<string, string>) {
  if (planName.startsWith('fapi1')) {
    return true
  }

  if (planName.startsWith('fapi2-message-signing')) {
    return true
  }

  if (variant.request_type === 'request_object') {
    return true
  }

  return false
}

function requiresNonce(planName: string, variant: Record<string, string>) {
  return (
    responseType(planName, variant).includes('id_token') ||
    (planName.startsWith('fapi1') && getScope(variant).includes('openid'))
  )
}

function requiresState(planName: string, variant: Record<string, string>) {
  return planName.startsWith('fapi1') && !getScope(variant).includes('openid')
}

function responseType(planName: string, variant: Record<string, string>) {
  if (variant.response_type) {
    return variant.response_type
  }

  if (!planName.startsWith('fapi1')) {
    return 'code'
  }

  return variant.fapi_response_mode === 'jarm' ? 'code' : 'code id_token'
}

interface MacroOptions {
  useNonce?: boolean
  useState?: boolean
}

export const flow = (options?: MacroOptions) => {
  return test.macro({
    async exec(t, module: ModulePrescription) {
      t.timeout(15000)

      const instance = await createTestFromPlan(plan, module)
      t.context.instance = instance

      t.log('Test ID', instance.id)
      t.log('Test Name', instance.name)

      const variant: Record<string, string> = {
        ...conformance.variant,
        ...module.variant,
      }
      t.log('variant', variant)

      const { issuer: issuerIdentifier, accounts_endpoint } = await getTestExposed(instance)

      if (!issuerIdentifier) {
        throw new Error()
      }

      const issuer = new URL(issuerIdentifier)

      const as = await oauth
        .discoveryRequest(issuer)
        .then((response) => oauth.processDiscoveryResponse(issuer, response))

      t.log('AS Metadata discovered for', as.issuer)

      const decoder = new TextDecoder()
      const decrypt: oauth.JweDecryptFunction = async (jwe) => {
        const { plaintext } = await compactDecrypt(
          jwe,
          await importPrivateKey('RSA-OAEP', configuration.client.jwks.keys[0]),
          { keyManagementAlgorithms: ['RSA-OAEP'] },
        ).catch((cause) => {
          throw new oauth.OperationProcessingError('failed to decrypt', { cause })
        })
        return decoder.decode(plaintext)
      }
      const client: oauth.Client = {
        client_id: configuration.client.client_id,
        use_mtls_endpoint_aliases: configuration.client.use_mtls_endpoint_aliases,
      }

      let clientAuth: oauth.ClientAuth
      switch (variant.client_auth_type) {
        case 'mtls':
          clientAuth = oauth.TlsClientAuth()
          break
        case 'none':
          clientAuth = oauth.None()
          break
        case 'private_key_jwt':
          const [jwk] = configuration.client.jwks.keys
          clientAuth = oauth.PrivateKeyJwt({
            kid: jwk.kid,
            key: await importPrivateKey(ALG, jwk),
          })
          break
        case 'client_secret_basic':
          clientAuth = oauth.ClientSecretBasic(configuration.client.client_secret!)
          break
        case 'client_secret_post':
          clientAuth = oauth.ClientSecretPost(configuration.client.client_secret!)
          break
        default:
          clientAuth = oauth.ClientSecretPost(configuration.client.client_secret!)
          break
      }

      if (instance.name.includes('client-secret-basic')) {
        clientAuth = oauth.ClientSecretBasic(configuration.client.client_secret!)
      }

      const mtlsFetch = (...args: Parameters<typeof fetch>) => {
        // @ts-expect-error
        return undici.fetch(args[0], {
          ...args[1],
          dispatcher: new undici.Agent({
            connect: {
              key: mtls.key,
              cert: mtls.cert,
            },
          }),
        })
      }

      function clientAuthOptions(endpoint: 'token'): oauth.TokenEndpointRequestOptions
      function clientAuthOptions(endpoint: 'par'): oauth.PushedAuthorizationRequestOptions
      function clientAuthOptions(endpoint: 'userinfo'): oauth.UserInfoRequestOptions
      function clientAuthOptions(endpoint: 'resource'): oauth.ProtectedResourceRequestOptions
      function clientAuthOptions(endpoint: 'token' | 'par' | 'userinfo' | 'resource') {
        const mtlsAuth = variant.client_auth_type === 'mtls'
        const mtlsConstrain = plan.name.startsWith('fapi1') || variant.sender_constrain === 'mtls'

        switch (endpoint) {
          case 'token':
            return {
              [oauth.customFetch]: mtlsAuth || mtlsConstrain ? mtlsFetch : undefined,
            } as oauth.TokenEndpointRequestOptions as oauth.TokenEndpointRequestOptions
          case 'par':
            return {
              [oauth.customFetch]: mtlsAuth ? mtlsFetch : undefined,
            } as oauth.PushedAuthorizationRequestOptions as oauth.PushedAuthorizationRequestOptions
          case 'userinfo':
            return {
              [oauth.customFetch]: mtlsConstrain ? mtlsFetch : undefined,
            } as oauth.UserInfoRequestOptions as oauth.UserInfoRequestOptions
          case 'resource':
            return {
              [oauth.customFetch]: mtlsConstrain ? mtlsFetch : undefined,
            } as oauth.ProtectedResourceRequestOptions
          default:
            throw new Error()
        }
      }

      const response_type = responseType(plan.name, variant)
      const scope = getScope(variant)
      const code_verifier = oauth.generateRandomCodeVerifier()
      const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)
      const code_challenge_method = 'S256'
      let nonce =
        options?.useNonce || requiresNonce(plan.name, variant)
          ? oauth.generateRandomNonce()
          : oauth.expectNoNonce
      let state =
        options?.useState || requiresState(plan.name, variant)
          ? oauth.generateRandomState()
          : oauth.expectNoState

      let authorizationUrl = new URL(as.authorization_endpoint!)
      if (!usesRequestObject(plan.name, variant)) {
        authorizationUrl.searchParams.set('client_id', client.client_id)
        authorizationUrl.searchParams.set('code_challenge', code_challenge)
        authorizationUrl.searchParams.set('code_challenge_method', code_challenge_method)
        authorizationUrl.searchParams.set('redirect_uri', configuration.client.redirect_uri)
        authorizationUrl.searchParams.set('response_type', response_type)
        authorizationUrl.searchParams.set('scope', scope)
        if (typeof nonce === 'string') {
          authorizationUrl.searchParams.set('nonce', nonce)
        }
        if (typeof state === 'string') {
          authorizationUrl.searchParams.set('state', state)
        }
      } else {
        authorizationUrl.searchParams.set('client_id', client.client_id)
        const params = new URLSearchParams()
        params.set('code_challenge', code_challenge)
        params.set('code_challenge_method', code_challenge_method)
        params.set('redirect_uri', configuration.client.redirect_uri)
        params.set('response_type', response_type)
        params.set('scope', scope)
        if (typeof nonce === 'string') {
          params.set('nonce', nonce)
        }
        if (typeof state === 'string') {
          params.set('state', state)
        }

        const [jwk] = configuration.client.jwks.keys
        const privateKey = await importPrivateKey(ALG, jwk)

        authorizationUrl.searchParams.set(
          'request',
          await oauth.issueRequestObject(as, client, params, { kid: jwk.kid, key: privateKey }),
        )
        authorizationUrl.searchParams.set('scope', scope)
        authorizationUrl.searchParams.set('response_type', response_type)
      }

      let DPoPKeyPair!: oauth.CryptoKeyPair
      let DPoP!: oauth.DPoPRequestOptions['DPoP']
      if (usesDpop(variant)) {
        DPoPKeyPair = await oauth.generateKeyPair(ALG)
        DPoP = oauth.DPoP(client, DPoPKeyPair)
        authorizationUrl.searchParams.set(
          'dpop_jkt',
          await calculateJwkThumbprint(await exportJWK(DPoPKeyPair.publicKey)),
        )
      }

      if (usesPar(plan)) {
        t.log('PAR request with', Object.fromEntries(authorizationUrl.searchParams.entries()))
        const request = () =>
          oauth.pushedAuthorizationRequest(as, client, clientAuth, authorizationUrl.searchParams, {
            ...clientAuthOptions('par'),
            DPoP,
          })
        let par = await request()

        let result: oauth.PushedAuthorizationResponse
        try {
          result = await oauth.processPushedAuthorizationResponse(as, client, par)
        } catch (err) {
          if (DPoPKeyPair && oauth.isDPoPNonceError(err)) {
            t.log('error', inspect(err, { depth: Infinity }))
            t.log('retrying with a newly obtained dpop nonce')
            par = await request()
            result = await oauth.processPushedAuthorizationResponse(as, client, par)
          } else {
            throw err
          }
        }

        t.log('PAR response', { ...result })
        authorizationUrl = new URL(as.authorization_endpoint!)
        authorizationUrl.searchParams.set('client_id', client.client_id)
        authorizationUrl.searchParams.set('request_uri', result.request_uri)
      }

      await Promise.allSettled([fetch(authorizationUrl.href, { redirect: 'manual' })])

      t.log('redirect with', Object.fromEntries(authorizationUrl.searchParams.entries()))

      const { authorization_endpoint_response_redirect } = await getTestExposed(instance)
      if (!authorization_endpoint_response_redirect) {
        throw new Error()
      }

      let currentUrl = new URL(authorization_endpoint_response_redirect)

      let sub: string | undefined
      let access_token: string
      {
        let params: ReturnType<typeof oauth.validateAuthResponse>

        if (usesJarm(variant)) {
          params = await oauth.validateJwtAuthResponse(
            as,
            client,
            random() ? currentUrl : currentUrl.searchParams,
            state,
            {
              [oauth.jweDecrypt]: decrypt,
            },
          )
        } else if (response_type === 'code id_token') {
          let input: URLSearchParams | URL | Request
          switch ([URLSearchParams, URL, Request][Math.floor(Math.random() * 3)]) {
            case URL:
              input = currentUrl
              break
            case URLSearchParams:
              input = new URLSearchParams(currentUrl.hash.slice(1))
              break
            case Request:
              input = new Request(
                `${currentUrl.protocol}//${currentUrl.host}${currentUrl.pathname}`,
                {
                  method: 'POST',
                  headers: { 'content-type': 'application/x-www-form-urlencoded' },
                  body: currentUrl.hash.slice(1),
                },
              )
              break
            default:
              throw new Error('unreachable')
          }
          params = await (
            plan.name.startsWith('fapi1')
              ? oauth.validateDetachedSignatureResponse
              : oauth.validateCodeIdTokenResponse
          )(as, client, currentUrl, nonce as string, state, undefined, {
            [oauth.jweDecrypt]: decrypt,
          })
        } else {
          params = oauth.validateAuthResponse(
            as,
            client,
            random() ? currentUrl : currentUrl.searchParams,
            state,
          )
        }

        t.log('parsed callback parameters', Object.fromEntries(params.entries()))

        const request = () =>
          oauth.authorizationCodeGrantRequest(
            as,
            client,
            clientAuth,
            params,
            configuration.client.redirect_uri,
            code_verifier,
            {
              ...clientAuthOptions('token'),
              DPoP,
            },
          )
        let response = await request()

        let result: oauth.TokenEndpointResponse

        try {
          result = await oauth.processAuthorizationCodeResponse(as, client, response, {
            [oauth.jweDecrypt]: decrypt,
            expectedNonce: nonce,
            requireIdToken: scope.includes('openid'),
          })
        } catch (err) {
          if (DPoPKeyPair && oauth.isDPoPNonceError(err)) {
            t.log('error', inspect(err, { depth: Infinity }))
            t.log('retrying with a newly obtained dpop nonce')
            response = await request()
            result = await oauth.processAuthorizationCodeResponse(as, client, response, {
              [oauth.jweDecrypt]: decrypt,
              expectedNonce: nonce,
              requireIdToken: scope.includes('openid'),
            })
          } else {
            throw err
          }
        }

        if (nonRepudiation(plan, variant)) {
          await oauth.validateApplicationLevelSignature(as, response)
        }

        t.log('token endpoint response body', { ...result })
        ;({ access_token } = result)
        const claims = oauth.getValidatedIdTokenClaims(result)
        if (claims) {
          t.log('ID Token Claims', claims)
          ;({ sub } = claims)
        }
      }

      if (!plan.name.startsWith('fapi1') && scope.includes('openid') && as.userinfo_endpoint) {
        // fetch userinfo response
        const request = () => {
          t.log('fetching', as.userinfo_endpoint)
          return oauth.userInfoRequest(as, client, access_token, {
            ...clientAuthOptions('userinfo'),
            DPoP,
          })
        }
        let response = await request()
        let result: oauth.UserInfoResponse
        try {
          result = await oauth.processUserInfoResponse(as, client, sub!, response, {
            [oauth.jweDecrypt]: decrypt,
          })
          t.log('userinfo endpoint response', { ...result })
        } catch (err) {
          t.log('error', inspect(err, { depth: Infinity }))
          if (DPoPKeyPair && oauth.isDPoPNonceError(err)) {
            t.log('retrying with a newly obtained dpop nonce')
            response = await request()
            result = await oauth.processUserInfoResponse(as, client, sub!, response, {
              [oauth.jweDecrypt]: decrypt,
            })
            t.log('userinfo endpoint response', { ...result })
          } else {
            throw err
          }
        }
      }

      if (accounts_endpoint) {
        const request = () => {
          t.log('fetching', accounts_endpoint)
          return oauth.protectedResourceRequest(
            access_token,
            'GET',
            new URL(accounts_endpoint),
            undefined,
            undefined,
            {
              ...clientAuthOptions('resource'),
              DPoP,
            },
          )
        }

        let accounts: Response

        try {
          accounts = await request()
        } catch (err) {
          t.log('error', inspect(err, { depth: Infinity }))
          if (DPoPKeyPair && oauth.isDPoPNonceError(err)) {
            t.log('retrying with a newly obtained dpop nonce')
            accounts = await request()
          } else {
            throw err
          }
        }

        const result = await accounts.text()
        try {
          t.log('accounts endpoint response', JSON.parse(result))
        } catch {
          t.log('accounts endpoint response body', result)
        }
      }

      await waitForState(instance)
      if (module.skipLogTestFinished !== true) {
        t.log('Test Finished')
      }
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
}

export const rejects = (macro: Macro<[module: ModulePrescription], { instance: Test }>) => {
  return test.macro({
    async exec(
      t,
      module: ModulePrescription,
      expectedMessage?: string | RegExp,
      expectedErrorName: string = 'OperationProcessingError',
    ) {
      await t
        .throwsAsync(() => macro.exec(t, { ...module, skipLogTestFinished: true }) as any, {
          message: expectedMessage,
          name: expectedErrorName,
        })
        .then((err) => {
          if (err) {
            t.log('rejected with', inspect(err, { depth: Infinity }))
          }
        })

      await waitForState(t.context.instance)
      t.log('Test Finished')
      t.pass()
    },
    title: macro.title as any,
  })
}

export const skippable = (macro: Macro<[module: ModulePrescription], { instance: Test }>) => {
  return test.macro({
    async exec(t, module: ModulePrescription) {
      await Promise.allSettled([macro.exec(t, { ...module, skipLogTestFinished: true })])

      await waitForState(t.context.instance, { results: new Set(['SKIPPED', 'PASSED']) })
      t.log('Test Finished')
      t.pass()
    },
    title: macro.title as any,
  })
}
