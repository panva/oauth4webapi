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

const parameters = new URLSearchParams()
parameters.set('scope', 'api:read api:write')
parameters.set('resource', 'urn:example:api')

const response = await oauth.clientCredentialsGrantRequest(as, client, {
  additionalParameters: parameters,
})

let challenges: oauth.WWWAuthenticateChallenge[] | undefined
if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
  for (const challenge of challenges) {
    console.log('challenge', challenge)
  }
  throw new Error() // Handle www-authenticate challenges as needed
}

const result = await oauth.processClientCredentialsResponse(as, client, response)
if (oauth.isOAuth2Error(result)) {
  console.log('error', result)
  throw new Error() // Handle OAuth 2.0 response body error
}

console.log('result', result)
