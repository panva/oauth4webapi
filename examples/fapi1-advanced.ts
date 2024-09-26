import * as undici from 'undici'
import * as oauth from 'oauth4webapi'

// Prerequisites

let getAuthorizationResponseOrURLWithFragment!: (...args: any) => URL
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
let jarPrivateKey!: oauth.CryptoKey
/**
 * A key that the client has pre-registered at the Authorization Server for use with Private Key JWT
 * client authentication method.
 */
let clientPrivateKey!: oauth.CryptoKey

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
  const authorizationResponse: URLSearchParams | URL = getAuthorizationResponseOrURLWithFragment()
  const params = await oauth.validateDetachedSignatureResponse(
    as,
    client,
    authorizationResponse,
    nonce,
  )

  const response = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    params,
    redirect_uri,
    code_verifier,
    {
      clientPrivateKey,
      [oauth.customFetch]: (url, init) => {
        return undici.fetch(url, {
          ...init,
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

  const result = await oauth.processAuthorizationCodeResponse(as, client, response, true)

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
      [oauth.customFetch]: (url, init) => {
        return undici.fetch(url, {
          ...init,
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

  console.log('Protected Resource Response', await response.json())
}
