import * as oauth from '../src/index.js' // replace with an import of oauth4webapi

// Prerequisites

let issuer!: URL // Authorization server's Issuer Identifier URL
let client_id!: string
let client_secret!: string
/**
 * Value used in the authorization request as redirect_uri pre-registered at the Authorization
 * Server.
 */
let redirect_uri!: string

// End of prerequisites

const as = await oauth
  .discoveryRequest(issuer)
  .then((response) => oauth.processDiscoveryResponse(issuer, response))

const client: oauth.Client = {
  client_id,
  client_secret,
  token_endpoint_auth_method: 'client_secret_basic',
}

const code_challenge_method = 'S256'
/**
 * The following MUST be generated for every redirect to the authorization_endpoint. You must store
 * the code_verifier and nonce in the end-user session such that it can be recovered as the user
 * gets redirected from the authorization server back to your application.
 */
const code_verifier = oauth.generateRandomCodeVerifier()
const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)
let nonce: string | undefined

let request_uri: string
{
  const params = new URLSearchParams()
  params.set('client_id', client.client_id)
  params.set('redirect_uri', redirect_uri)
  params.set('response_type', 'code')
  params.set('scope', 'openid email')
  params.set('code_challenge', code_challenge)
  params.set('code_challenge_method', code_challenge_method)

  /**
   * We cannot be sure the AS supports PKCE so we're going to use nonce too. Use of PKCE is
   * backwards compatible even if the AS doesn't support it which is why we're using it regardless.
   */
  if (as.code_challenge_methods_supported?.includes('S256') !== true) {
    nonce = oauth.generateRandomNonce()
    params.set('nonce', nonce)
  }

  const response = await oauth.pushedAuthorizationRequest(as, client, params)
  let challenges: oauth.WWWAuthenticateChallenge[] | undefined
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.log('challenge', challenge)
    }
    throw new Error() // Handle www-authenticate challenges as needed
  }

  const result = await oauth.processPushedAuthorizationResponse(as, client, response)
  if (oauth.isOAuth2Error(result)) {
    console.log('error', result)
    throw new Error() // Handle OAuth 2.0 response body error
  }

  console.log('result', result)
  ;({ request_uri } = result)
}

{
  // redirect user to as.authorization_endpoint
  const authorizationUrl = new URL(as.authorization_endpoint!)
  authorizationUrl.searchParams.set('client_id', client.client_id)
  authorizationUrl.searchParams.set('request_uri', request_uri)
}

// one eternity later, the user lands back on the redirect_uri
let sub: string
let access_token: string
{
  // @ts-expect-error
  const currentUrl: URL = getCurrentUrl()
  const params = oauth.validateAuthResponse(as, client, currentUrl)
  if (oauth.isOAuth2Error(params)) {
    console.log('error', params)
    throw new Error() // Handle OAuth 2.0 redirect error
  }

  const response = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    params,
    redirect_uri,
    code_verifier,
  )

  let challenges: oauth.WWWAuthenticateChallenge[] | undefined
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.log('challenge', challenge)
    }
    throw new Error() // Handle www-authenticate challenges as needed
  }

  const result = await oauth.processAuthorizationCodeOpenIDResponse(as, client, response, nonce)
  if (oauth.isOAuth2Error(result)) {
    console.log('error', result)
    throw new Error() // Handle OAuth 2.0 response body error
  }

  console.log('result', result)
  ;({ access_token } = result)
  const claims = oauth.getValidatedIdTokenClaims(result)
  console.log('ID Token Claims', claims)
  ;({ sub } = claims)
}

// fetch userinfo response
{
  const response = await oauth.userInfoRequest(as, client, access_token)

  let challenges: oauth.WWWAuthenticateChallenge[] | undefined
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.log('challenge', challenge)
    }
    throw new Error() // Handle www-authenticate challenges as needed
  }

  const result = await oauth.processUserInfoResponse(as, client, sub, response)
  console.log('result', result)
}
