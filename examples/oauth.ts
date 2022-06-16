import * as oauth from '../src/index.js'

const issuer = new URL('https://example.as.com')
const as = await oauth
  .discoveryRequest(issuer)
  .then((response) => oauth.processDiscoveryResponse(issuer, response))

const client: oauth.Client = {
  client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
  client_secret:
    'ddce41c3d7618bb30e8a5e5e423fce223427426265ebc96fd9dd5713a6d4fc58bc523c45af42274c210ab18d4a93b5b7169edf6236ed2657f6be64ec41b72f87',
  token_endpoint_auth_method: 'client_secret_basic',
}

const redirect_uri = 'https://example.rp.com/cb'

if (as.code_challenge_methods_supported?.includes('S256') !== true) {
  // This example assumes S256 PKCE is supported and signalled to be supported
  // If it isn't supported, random `state` should be used for CSRF protection.
  throw new Error()
}

const code_verifier = oauth.generateRandomCodeVerifier()
const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)
const code_challenge_method = 'S256'

{
  // redirect user to as.authorization_endpoint

  const authorizationUrl = new URL(as.authorization_endpoint!)
  authorizationUrl.searchParams.set('client_id', client.client_id)
  authorizationUrl.searchParams.set('code_challenge', code_challenge)
  authorizationUrl.searchParams.set('code_challenge_method', code_challenge_method)
  authorizationUrl.searchParams.set('redirect_uri', redirect_uri)
  authorizationUrl.searchParams.set('response_type', 'code')
  authorizationUrl.searchParams.set('scope', 'api:read')
}

// one eternity later, the user lands back on the redirect_uri

// @ts-expect-error
const currentUrl: URL = getCurrentUrl()
const parameters = oauth.validateAuthResponse(as, client, currentUrl, oauth.expectNoState)
if (oauth.isOAuth2Error(parameters)) {
  console.log('error', parameters)
  throw new Error() // Handle OAuth 2.0 redirect error
}

const response = await oauth.authorizationCodeGrantRequest(
  as,
  client,
  parameters,
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

const result = await oauth.processAuthorizationCodeOAuth2Response(as, client, response)
if (oauth.isOAuth2Error(result)) {
  console.log('error', result)
  throw new Error() // Handle OAuth 2.0 response body error
}

console.log('result', result)
