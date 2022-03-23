import * as oauth from '../src/index.js'

const issuer = new URL('https://op.panva.cz')
const as = await oauth
  .discoveryRequest(issuer)
  .then((response) => oauth.processDiscoveryResponse(issuer, response))

const client: oauth.Client = {
  client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
  client_secret:
    'ddce41c3d7618bb30e8a5e5e423fce223427426265ebc96fd9dd5713a6d4fc58bc523c45af42274c210ab18d4a93b5b7169edf6236ed2657f6be64ec41b72f87',
  token_endpoint_auth_method: 'client_secret_basic',
}

const redirect_uri = 'https://rp.example.com/cb'

const code_verifier = oauth.generateRandomCodeVerifier()
const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)
const code_challenge_method = 'S256'

{
  // redirect user to as.authorization_endpoint

  if (!as.authorization_endpoint) throw new Error()

  const authorizationUrl = new URL(as.authorization_endpoint)
  authorizationUrl.searchParams.set('client_id', client.client_id)
  authorizationUrl.searchParams.set('code_challenge', code_challenge)
  authorizationUrl.searchParams.set('code_challenge_method', code_challenge_method)
  authorizationUrl.searchParams.set('redirect_uri', redirect_uri)
  authorizationUrl.searchParams.set('response_type', 'code')
  authorizationUrl.searchParams.set('scope', 'openid email')
}

// one eternity later, the user lands back on the redirect_uri
let sub: string
let access_token: string
{
  // @ts-ignore
  const currentUrl: URL = getCurrentUrl()
  const params = oauth.validateAuthResponse(as, client, currentUrl, oauth.expectNoState)
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

  const result = await oauth.processAuthorizationCodeOpenIDResponse(as, client, response)
  if (oauth.isOAuth2Error(result)) {
    console.log('error', result)
    throw new Error() // Handle OAuth 2.0 response body error
  }

  console.log('result', result)
  ;({ access_token } = result)
  const claims = oauth.getValidatedIdTokenClaims(result)!
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
