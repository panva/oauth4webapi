import * as oauth from '../src/index.js' // replace with an import of oauth4webapi

// Prerequisites

let issuer!: URL // Authorization server's Issuer Identifier URL
let algorithm!:
  | 'oauth2' /* For .well-known/oauth-authorization-server discovery */
  | 'oidc' /* For .well-known/openid-configuration discovery */
  | undefined /* Defaults to 'oidc' */
let client_id!: string
/**
 * Value used in the authorization request as redirect_uri pre-registered at the Authorization
 * Server.
 */
let redirect_uri!: string
/**
 * In order to take full advantage of DPoP you shall generate a random private key for every
 * session. In the browser environment you shall use IndexedDB to persist the generated
 * CryptoKeyPair.
 */
let DPoP!: CryptoKeyPair
/**
 * A key that the client has pre-registered at the Authorization Server for use with Private Key JWT
 * client authentication method.
 */
let clientPrivateKey!: CryptoKey
/**
 * A key that is pre-registered at the Authorization Server that the client is supposed to sign its
 * Request Objects with.
 */
let jarPrivateKey!: CryptoKey

// End of prerequisites

const as = await oauth
  .discoveryRequest(issuer, { algorithm })
  .then((response) => oauth.processDiscoveryResponse(issuer, response))

const client: oauth.Client = {
  client_id,
  token_endpoint_auth_method: 'private_key_jwt',
}

const code_challenge_method = 'S256'
/**
 * The following MUST be generated for every redirect to the authorization_endpoint. You must store
 * the code_verifier in the end-user session such that it can be recovered as the user gets
 * redirected from the authorization server back to your application.
 */
const code_verifier = oauth.generateRandomCodeVerifier()
const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)

// Signed Request Object (JAR)
let request: string
{
  const params = new URLSearchParams()
  params.set('client_id', client.client_id)
  params.set('code_challenge', code_challenge)
  params.set('code_challenge_method', code_challenge_method)
  params.set('redirect_uri', redirect_uri)
  params.set('response_type', 'code')
  params.set('scope', 'openid api:read')
  params.set('response_mode', 'jwt')

  request = await oauth.issueRequestObject(as, client, params, jarPrivateKey)
}

// Pushed Authorization Request & Response (PAR)
let request_uri: string
{
  const params = new URLSearchParams()
  params.set('client_id', client.client_id)
  params.set('request', request)

  const pushedAuthorizationRequest = () =>
    oauth.pushedAuthorizationRequest(as, client, params, {
      DPoP,
      clientPrivateKey,
    })
  let response = await pushedAuthorizationRequest()
  let challenges: oauth.WWWAuthenticateChallenge[] | undefined
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.error('WWW-Authenticate Challenge', challenge)
    }
    throw new Error() // Handle WWW-Authenticate Challenges as needed
  }

  const processPushedAuthorizationResponse = () =>
    oauth.processPushedAuthorizationResponse(as, client, response)
  let result = await processPushedAuthorizationResponse()
  if (oauth.isOAuth2Error(result)) {
    console.error('Error Response', result)
    if (result.error === 'use_dpop_nonce') {
      // the AS-signalled nonce is now cached, retrying
      response = await pushedAuthorizationRequest()
      result = await processPushedAuthorizationResponse()
      if (oauth.isOAuth2Error(result)) {
        throw new Error() // Handle OAuth 2.0 response body error
      }
    } else {
      throw new Error() // Handle OAuth 2.0 response body error
    }
  }

  ;({ request_uri } = result)
}

{
  // redirect user to as.authorization_endpoint
  const authorizationUrl = new URL(as.authorization_endpoint!)
  authorizationUrl.searchParams.set('client_id', client.client_id)
  authorizationUrl.searchParams.set('request_uri', request_uri)

  // now redirect the user to authorizationUrl.href
}

// one eternity later, the user lands back on the redirect_uri
// Authorization Code Grant Request & Response
let access_token: string
{
  // @ts-expect-error
  const currentUrl: URL = getCurrentUrl()
  const params = await oauth.validateJwtAuthResponse(as, client, currentUrl)
  if (oauth.isOAuth2Error(params)) {
    console.error('Error Response', params)
    throw new Error() // Handle OAuth 2.0 redirect error
  }

  const authorizationCodeGrantRequest = () =>
    oauth.authorizationCodeGrantRequest(as, client, params, redirect_uri, code_verifier, { DPoP })

  let response = await authorizationCodeGrantRequest()

  let challenges: oauth.WWWAuthenticateChallenge[] | undefined
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.error('WWW-Authenticate Challenge', challenge)
    }
    throw new Error() // Handle WWW-Authenticate Challenges as needed
  }

  const processAuthorizationCodeOpenIDResponse = () =>
    oauth.processAuthorizationCodeOpenIDResponse(as, client, response)

  let result = await processAuthorizationCodeOpenIDResponse()
  if (oauth.isOAuth2Error(result)) {
    console.error('Error Response', result)
    if (result.error === 'use_dpop_nonce') {
      // the AS-signalled nonce is now cached, retrying
      response = await authorizationCodeGrantRequest()
      result = await processAuthorizationCodeOpenIDResponse()
      if (oauth.isOAuth2Error(result)) {
        throw new Error() // Handle OAuth 2.0 response body error
      }
    } else {
      throw new Error() // Handle OAuth 2.0 response body error
    }
  }

  // Check ID Token signature for non-repudiation purposes
  await oauth.validateIdTokenSignature(as, result)

  console.log('Access Token Response', result)
  ;({ access_token } = result)
}

// Protected Resource Request
{
  const protectedResourceRequest = () =>
    oauth.protectedResourceRequest(
      access_token,
      'GET',
      new URL('https://rs.example.com/api'),
      undefined,
      undefined,
      { DPoP },
    )
  let response = await protectedResourceRequest()

  let challenges: oauth.WWWAuthenticateChallenge[] | undefined
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    const { 0: challenge, length } = challenges
    if (
      length === 1 &&
      challenge.scheme === 'dpop' &&
      challenge.parameters.error === 'use_dpop_nonce'
    ) {
      // the AS-signalled nonce is now cached, retrying
      response = await protectedResourceRequest()
    } else {
      for (const challenge of challenges) {
        console.error('WWW-Authenticate Challenge', challenge)
      }
      throw new Error() // Handle WWW-Authenticate Challenges as needed
    }
  }

  console.log('Protected Resource Response', await response.json())
}
