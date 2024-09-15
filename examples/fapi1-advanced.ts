import * as undici from 'undici'
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
 * A key corresponding to the mtlsClientCertificate.
 */
let mtlsClientKey!: string
/**
 * A certificate the client has pre-registered at the Authorization Server for use with Mutual-TLS
 * client authentication method.
 */
let mtlsClientCertificate!: string
/**
 * A key that is pre-registered at the Authorization Server that the client is supposed to sign its
 * Request Objects with.
 */
let jarPrivateKey!: CryptoKey
/**
 * A key that the client has pre-registered at the Authorization Server for use with Private Key JWT
 * client authentication method.
 */
let clientPrivateKey!: CryptoKey

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
 * the code_verifier and nonce in the end-user session such that it can be recovered as the user
 * gets redirected from the authorization server back to your application.
 */
const nonce = oauth.generateRandomNonce()
const code_verifier = oauth.generateRandomCodeVerifier()
const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)

let request: string
{
  const params = new URLSearchParams()
  params.set('client_id', client.client_id)
  params.set('code_challenge', code_challenge)
  params.set('code_challenge_method', code_challenge_method)
  params.set('redirect_uri', redirect_uri)
  params.set('response_type', 'code id_token')
  params.set('scope', 'openid api:read')
  params.set('nonce', nonce)

  request = await oauth.issueRequestObject(as, client, params, jarPrivateKey)
}

{
  // redirect user to as.authorization_endpoint
  const authorizationUrl = new URL(as.authorization_endpoint!)
  authorizationUrl.searchParams.set('client_id', client.client_id)
  authorizationUrl.searchParams.set('request', request)

  // now redirect the user to authorizationUrl.href
}

// one eternity later, the user lands back on the redirect_uri
// Detached Signature ID Token Validation
// Authorization Code Grant Request & Response
let access_token: string
{
  // @ts-expect-error
  const authorizationResponse: URLSearchParams | URL = getAuthorizationResponseOrURLWithFragment()
  const params = await oauth.validateDetachedSignatureResponse(
    as,
    client,
    authorizationResponse,
    nonce,
  )
  if (oauth.isOAuth2Error(params)) {
    console.error('Error Response', params)
    throw new Error() // Handle OAuth 2.0 redirect error
  }

  const response = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    params,
    redirect_uri,
    code_verifier,
    {
      clientPrivateKey,
      [oauth.useMtlsAlias]: true,
      // @ts-expect-error
      [oauth.customFetch]: (...args) => {
        // @ts-expect-error
        return undici.fetch(args[0], {
          ...args[1],
          dispatcher: new undici.Agent({
            connect: {
              key: mtlsClientKey,
              cert: mtlsClientCertificate,
            },
          }),
        })
      },
    },
  )

  let challenges: oauth.WWWAuthenticateChallenge[] | undefined
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.error('WWW-Authenticate Challenge', challenge)
    }
    throw new Error() // Handle WWW-Authenticate Challenges as needed
  }

  const result = await oauth.processAuthorizationCodeOpenIDResponse(as, client, response)
  if (oauth.isOAuth2Error(result)) {
    console.error('Error Response', result)
    throw new Error() // Handle OAuth 2.0 response body error
  }

  // Check ID Token signature for non-repudiation purposes
  await oauth.validateIdTokenSignature(as, result)

  console.log('Access Token Response', result)
  ;({ access_token } = result)
}

// Protected Resource Request
{
  const response = await oauth.protectedResourceRequest(
    access_token,
    'GET',
    new URL('https://rs.example.com/api'),
    undefined,
    undefined,
    {
      // @ts-expect-error
      [oauth.customFetch]: (...args) => {
        // @ts-expect-error
        return undici.fetch(args[0], {
          ...args[1],
          dispatcher: new undici.Agent({
            connect: {
              key: mtlsClientKey,
              cert: mtlsClientCertificate,
            },
          }),
        })
      },
    },
  )

  let challenges: oauth.WWWAuthenticateChallenge[] | undefined
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.error('WWW-Authenticate Challenge', challenge)
    }
    throw new Error() // Handle WWW-Authenticate Challenges as needed
  }

  console.log('Protected Resource Response', await response.json())
}
