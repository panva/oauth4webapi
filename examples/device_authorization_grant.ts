import * as oauth from '../src/index.js'

const issuer = new URL('https://op.panva.cz')
const as = await oauth
  .discoveryRequest(issuer)
  .then((response) => oauth.processDiscoveryResponse(issuer, response))

const client: oauth.Client = {
  client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
  token_endpoint_auth_method: 'none',
}

let device_code: string
let interval: number
let verification_uri: string
let user_code: string
let verification_uri_complete: string | undefined

{
  const response = await oauth.deviceAuthorizationRequest(
    as,
    client,
    new URLSearchParams({ scope: 'openid email' }),
  )
  let challenges: oauth.WWWAuthenticateChallenge[] | undefined
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.log('challenge', challenge)
    }
    throw new Error() // Handle www-authenticate challenges as needed
  }

  const result = await oauth.processDeviceAuthorizationResponse(as, client, response)
  if (oauth.isOAuth2Error(result)) {
    console.log('error', result)
    throw new Error() // Handle OAuth 2.0 response body error
  }

  ;({ device_code, verification_uri, verification_uri_complete, user_code, interval = 5 } = result)
}

// user gets shown the verification_uri and user_code, or scans a qr code formed from verification_uri_complete as input
// user starts authenticating on his other device
console.log({ verification_uri, verification_uri_complete, user_code })

function wait() {
  return new Promise((resolve) => {
    setTimeout(resolve, interval * 1000)
  })
}

let success: oauth.TokenEndpointResponse | undefined = undefined

while (success === undefined) {
  await wait()
  const response = await oauth.deviceCodeGrantRequest(as, client, device_code)
  let challenges: oauth.WWWAuthenticateChallenge[] | undefined
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.log('challenge', challenge)
    }
    throw new Error() // Handle www-authenticate challenges as needed
  }

  const result = await oauth.processDeviceCodeResponse(as, client, response)
  if (oauth.isOAuth2Error(result)) {
    console.log('error', result)
    throw new Error() // Handle OAuth 2.0 response body error
  }

  if (oauth.isOAuth2Error(result)) {
    // response is oauth style error object
    switch (result.error) {
      case 'slow_down':
        interval += 5
      case 'authorization_pending':
        continue
      default:
        console.log('error', result)
        throw new Error() // Handle OAuth 2.0 response body error
    }
  } else {
    success = result
  }
}

console.log('result', success)

if (success.id_token) {
  console.log('ID Token Claims', oauth.getValidatedIdTokenClaims(success))
}
