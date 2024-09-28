import * as oauth from 'oauth4webapi'

// Prerequisites

let getCurrentUrl!: (...args: any) => URL
let issuer!: URL // Authorization server's Issuer Identifier URL
let algorithm!:
  | 'oauth2' /* For .well-known/oauth-authorization-server discovery */
  | 'oidc' /* For .well-known/openid-configuration discovery */
  | undefined /* Defaults to 'oidc' */
let client_id!: string
let client_secret!: string
/**
 * Value used in the authorization request as redirect_uri pre-registered at the Authorization
 * Server.
 */
let redirect_uri!: string

// End of prerequisites

const as = await oauth
  .discoveryRequest(issuer, { algorithm })
  .then((response) => oauth.processDiscoveryResponse(issuer, response))

const client: oauth.Client = { client_id }
const clientAuth = oauth.ClientSecretPost(client_secret)

const code_challenge_method = 'S256'
/**
 * The following MUST be generated for every redirect to the authorization_endpoint. You must store
 * the code_verifier and nonce in the end-user session such that it can be recovered as the user
 * gets redirected from the authorization server back to your application.
 */
const code_verifier = oauth.generateRandomCodeVerifier()
const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)
let state: string | undefined

{
  // redirect user to as.authorization_endpoint
  const authorizationUrl = new URL(as.authorization_endpoint!)
  authorizationUrl.searchParams.set('client_id', client.client_id)
  authorizationUrl.searchParams.set('redirect_uri', redirect_uri)
  authorizationUrl.searchParams.set('response_type', 'code')
  authorizationUrl.searchParams.set('scope', 'api:read')
  authorizationUrl.searchParams.set('code_challenge', code_challenge)
  authorizationUrl.searchParams.set('code_challenge_method', code_challenge_method)

  /**
   * We cannot be sure the AS supports PKCE so we're going to use state too. Use of PKCE is
   * backwards compatible even if the AS doesn't support it which is why we're using it regardless.
   */
  if (as.code_challenge_methods_supported?.includes('S256') !== true) {
    state = oauth.generateRandomState()
    authorizationUrl.searchParams.set('state', state)
  }

  // now redirect the user to authorizationUrl.href
}

// one eternity later, the user lands back on the redirect_uri
// Authorization Code Grant Request & Response
let access_token: string
{
  const currentUrl: URL = getCurrentUrl()
  const params = oauth.validateAuthResponse(as, client, currentUrl, state)

  const response = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    clientAuth,
    params,
    redirect_uri,
    code_verifier,
  )

  const result = await oauth.processAuthorizationCodeResponse(as, client, response)

  console.log('Access Token Response', result)
  ;({ access_token } = result)
}

// Protected Resource Request
{
  const response = await oauth.protectedResourceRequest(
    access_token,
    'GET',
    new URL('https://rs.example.com/api'),
  )

  console.log('Protected Resource Response', await response.json())
}
