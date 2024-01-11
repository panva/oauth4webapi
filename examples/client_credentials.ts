import * as oauth from '../src/index.js' // replace with an import of oauth4webapi

// Prerequisites

let issuer!: URL // Authorization server's Issuer Identifier URL
let client_id!: string
let client_secret!: string

// End of prerequisites

const as = await oauth
  .discoveryRequest(issuer)
  .then((response) => oauth.processDiscoveryResponse(issuer, response))

const client: oauth.Client = {
  client_id,
  client_secret,
  token_endpoint_auth_method: 'client_secret_basic',
}

const parameters = new URLSearchParams()
parameters.set('scope', 'api:read api:write')
parameters.set('resource', 'urn:example:api')

const response = await oauth.clientCredentialsGrantRequest(as, client, parameters)

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
