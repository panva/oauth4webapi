import * as oauth from '../src/index.js'

// in order to take full advantage of DPoP you shall generate a random private key for every session
const DPoP = await oauth.generateKeyPair('ES256')

// a random client private key is generated here for the example's sake, you would however
// use crypto.subtle.importKey to import a private key that is pre-registered on the AS
const clientPrivateKey = {
  key: (await oauth.generateKeyPair('ES256')).privateKey,
  kid: 'a52faab2-f688-44b6-bde8-f493aeb526fb', // the `kid` the authorization server expects, or undefined if not applicable
}

const issuer = new URL('https://example.as.com')
const as = await oauth
  .discoveryRequest(issuer)
  .then((response) => oauth.processDiscoveryResponse(issuer, response))

const client: oauth.Client = {
  client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
  token_endpoint_auth_method: 'private_key_jwt',
}

const redirect_uri = 'https://example.rp.com/cb'

const code_verifier = oauth.generateRandomCodeVerifier()
const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)
const code_challenge_method = 'S256'

let request_uri: string
{
  const params = new URLSearchParams()
  params.set('client_id', client.client_id)
  params.set('code_challenge', code_challenge)
  params.set('code_challenge_method', code_challenge_method)
  params.set('redirect_uri', redirect_uri)
  params.set('response_type', 'code')
  params.set('scope', 'openid email')

  const response = await oauth.pushedAuthorizationRequest(as, client, params, {
    DPoP,
    clientPrivateKey,
  })
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
    if (result.error === 'use_dpop_nonce') {
      // the AS-signalled nonce is now cached, you should retry
    }
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
{
  // @ts-expect-error
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
    {
      DPoP,
      clientPrivateKey,
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
    if (result.error === 'use_dpop_nonce') {
      // the AS-signalled nonce is now cached, you should retry
    }
    throw new Error() // Handle OAuth 2.0 response body error
  }

  console.log('result', result)
  const claims = oauth.getValidatedIdTokenClaims(result)
  console.log('ID Token Claims', claims)
}
