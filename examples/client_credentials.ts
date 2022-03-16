import * as lib from '../src/index.js'

const issuer = new URL('https://op.panva.cz')
const as = await lib
  .discoveryRequest(issuer)
  .then((response) => lib.processDiscoveryResponse(issuer, response))

const client: lib.Client = {
  client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
  client_secret:
    'ddce41c3d7618bb30e8a5e5e423fce223427426265ebc96fd9dd5713a6d4fc58bc523c45af42274c210ab18d4a93b5b7169edf6236ed2657f6be64ec41b72f87',
  token_endpoint_auth_method: 'client_secret_basic',
}

const response = await lib.clientCredentialsGrantRequest(as, client)

let challenges: lib.WWWAuthenticateChallenge[] | undefined
if ((challenges = lib.parseWwwAuthenticateChallenges(response))) {
  for (const challenge of challenges) {
    console.log('challenge', challenge)
  }
  throw new Error() // Handle www-authenticate challenges as needed
}

const result = await lib.processClientCredentialsResponse(as, client, response)
if (lib.isOAuth2Error(result)) {
  console.log('error', result)
  throw new Error() // Handle OAuth 2.0 response body error
}

console.log('result', result)
