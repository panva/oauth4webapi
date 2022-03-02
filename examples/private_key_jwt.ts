import * as lib from '../src/index.js'

// a random key is generated here for the example's sake, you would however
// use crypto.subtle.importKey to import your private key that is pre-registered on the AS
const algorithm: EcKeyGenParams = { name: 'ECDSA', namedCurve: 'P-256' }
const privateKey = (await crypto.subtle.generateKey(algorithm, false, ['sign'])).privateKey
const keyID = 'a52faab2-f688-44b6-bde8-f493aeb526fb' // the `kid` your authorization server expects, or undefined if not applicable

const issuer = new URL('https://op.panva.cz')
const as = await lib
  .discoveryRequest(issuer)
  .then((response) => lib.processDiscoveryResponse(issuer, response))

const client: lib.Client = {
  client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
  token_endpoint_auth_method: 'private_key_jwt',
}

const redirect_uri = 'https://rp.example.com/cb'

const code_verifier = lib.generateRandomCodeVerifier()
const code_challenge = await lib.calculatePKCECodeChallenge(code_verifier)
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
  const parameters = lib.validateAuthResponse(as, client, currentUrl, lib.expectNoState)
  if (lib.isOAuth2Error(parameters)) {
    console.log('error', parameters)
    throw new Error() // Handle OAuth 2.0 redirect error
  }

  const response = await lib.authorizationCodeGrantRequest(
    as,
    client,
    parameters,
    redirect_uri,
    code_verifier,
    {
      clientPrivateKey: {
        key: privateKey,
        kid: keyID,
      },
    },
  )

  let challenges: lib.WWWAuthenticateChallenge[] | undefined
  if ((challenges = lib.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.log('challenge', challenge)
    }
    throw new Error() // Handle www-authenticate challenges as needed
  }

  const result = await lib.processAuthorizationCodeOpenIDResponse(as, client, response)
  if (lib.isOAuth2Error(result)) {
    console.log('error', result)
    throw new Error() // Handle OAuth 2.0 response body error
  }

  console.log('result', result)
  ;({ access_token } = result)
  const claims = lib.getValidatedIdTokenClaims(result)!
  console.log('ID Token Claims', claims)
  ;({ sub } = claims)
}

// fetch userinfo response
{
  const response = await lib.userInfoRequest(as, client, access_token)

  let challenges: lib.WWWAuthenticateChallenge[] | undefined
  if ((challenges = lib.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.log('challenge', challenge)
    }
    throw new Error() // Handle www-authenticate challenges as needed
  }

  const result = await lib.processUserInfoResponse(as, client, sub, response)
  console.log('result', result)
}
