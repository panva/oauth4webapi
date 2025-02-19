import * as oauth from 'oauth4webapi'

// Prerequisites

let issuer!: URL // Authorization server's Issuer Identifier URL
let algorithm!:
  | 'oauth2' /* For .well-known/oauth-authorization-server discovery */
  | 'oidc' /* For .well-known/openid-configuration discovery */
  | undefined /* Defaults to 'oidc' */
let client_id!: string
let client_secret!: string

// End of prerequisites

const as = await oauth
  .discoveryRequest(issuer, { algorithm })
  .then((response) => oauth.processDiscoveryResponse(issuer, response))

const client: oauth.Client = { client_id }
const clientAuth = oauth.ClientSecretPost(client_secret)

let auth_req_id: string
let interval: number

// Backchannel Authentication Request & Response
{
  const parameters = new URLSearchParams()
  parameters.set('login_hint', 'someone@example.com')
  parameters.set('scope', 'openid email')

  const response = await oauth.backchannelAuthenticationRequest(as, client, clientAuth, parameters)

  const result = await oauth.processBackchannelAuthenticationResponse(as, client, response)

  console.log('Backchannel Authentication Response', result)
  ;({ auth_req_id, interval = 5 } = result)
}

// Backchannel Authentication Grant Request & Response
let access_token: string
let sub: string
{
  let success: oauth.TokenEndpointResponse | undefined = undefined
  function wait() {
    return new Promise((resolve) => {
      setTimeout(resolve, interval * 1000)
    })
  }

  while (success === undefined) {
    await wait()
    const response = await oauth.backchannelAuthenticationGrantRequest(
      as,
      client,
      clientAuth,
      auth_req_id,
    )

    success = await oauth
      .processBackchannelAuthenticationGrantResponse(as, client, response)
      .catch((err) => {
        if (err instanceof oauth.ResponseBodyError) {
          switch (err.error) {
            case 'slow_down':
              interval += 5
            case 'authorization_pending':
              return undefined
          }
        }
        throw err
      })
  }

  console.log('Access Token Response', success)
  ;({ access_token } = success)
  const claims = oauth.getValidatedIdTokenClaims(success)!
  console.log('ID Token Claims', claims)
  ;({ sub } = claims)
}

// UserInfo Request
{
  const response = await oauth.userInfoRequest(as, client, access_token)

  const result = await oauth.processUserInfoResponse(as, client, sub, response)
  console.log('UserInfo Response', result)
}
