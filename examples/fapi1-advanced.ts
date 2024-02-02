import * as undici from 'undici'
import * as oauth from '../src/index.js' // replace with an import of oauth4webapi

// Prerequisites

let issuer!: URL // Authorization server's Issuer Identifier URL
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
  .discoveryRequest(issuer)
  .then((response) => oauth.processDiscoveryResponse(issuer, response))

const client: oauth.Client = {
  client_id,
  token_endpoint_auth_method: 'private_key_jwt',
}

const nonce = oauth.generateRandomNonce()
const code_verifier = oauth.generateRandomCodeVerifier()
const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)
const code_challenge_method = 'S256'

let request: string
{
  const params = new URLSearchParams()
  params.set('client_id', client.client_id)
  params.set('code_challenge', code_challenge)
  params.set('code_challenge_method', code_challenge_method)
  params.set('redirect_uri', redirect_uri)
  params.set('response_type', 'code id_token')
  params.set('scope', 'openid email')
  params.set('nonce', nonce)

  request = await oauth.issueRequestObject(as, client, params, jarPrivateKey)
}

{
  // redirect user to as.authorization_endpoint
  const authorizationUrl = new URL(as.authorization_endpoint!)
  authorizationUrl.searchParams.set('client_id', client.client_id)
  authorizationUrl.searchParams.set('request', request)
}

// one eternity later, the user lands back on the redirect_uri
{
  // @ts-expect-error
  const authorizationResponse: URLSearchParams | URL = getAuthorizationResponseOrURLWithFragment()
  const params = await oauth.experimental_validateDetachedSignatureResponse(
    as,
    client,
    authorizationResponse,
    nonce,
  )
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
    {
      clientPrivateKey,
      [oauth.experimental_useMtlsAlias]: true,
      // @ts-expect-error
      [oauth.experimental_customFetch]: (...args) => {
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
      console.log('challenge', challenge)
    }
    throw new Error() // Handle www-authenticate challenges as needed
  }

  const result = await oauth.processAuthorizationCodeOpenIDResponse(as, client, response)
  if (oauth.isOAuth2Error(result)) {
    console.log('error', result)
    throw new Error() // Handle OAuth 2.0 response body error
  }

  console.log('result', result)
  const claims = oauth.getValidatedIdTokenClaims(result)
  console.log('ID Token Claims', claims)
}
