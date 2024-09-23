import * as oauth from 'oauth4webapi'

// Prerequisites

let issuer!: URL // Authorization server's Issuer Identifier URL
let algorithm!:
  | 'oauth2' /* For .well-known/oauth-authorization-server discovery */
  | 'oidc' /* For .well-known/openid-configuration discovery */
  | undefined /* Defaults to 'oidc' */
let client_id!: string

// End of prerequisites

const as = await oauth
  .discoveryRequest(issuer, { algorithm })
  .then((response) => oauth.processDiscoveryResponse(issuer, response))

const client: oauth.Client = {
  client_id,
  token_endpoint_auth_method: 'none',
}

let device_code: string
let interval: number
let verification_uri: string
let user_code: string
let verification_uri_complete: string | undefined

// Device Authorization Request & Response
{
  const parameters = new URLSearchParams()
  parameters.set('scope', 'api:read')

  const response = await oauth.deviceAuthorizationRequest(as, client, parameters)

  const result = await oauth.processDeviceAuthorizationResponse(as, client, response)

  console.log('Device Authorization Response', result)
  ;({ device_code, verification_uri, verification_uri_complete, user_code, interval = 5 } = result)
}

/**
 * User gets shown the verification_uri and user_code, or scans a qr code formed from
 * verification_uri_complete as input.
 *
 * User starts authenticating on his other device.
 */
console.table({ verification_uri, verification_uri_complete, user_code })

// Device Authorization Grant Request & Response
let access_token: string
{
  let success: oauth.TokenEndpointResponse | undefined = undefined
  function wait() {
    return new Promise((resolve) => {
      setTimeout(resolve, interval * 1000)
    })
  }

  while (success === undefined) {
    await wait()
    const response = await oauth.deviceCodeGrantRequest(as, client, device_code)

    success = await oauth.processDeviceCodeResponse(as, client, response).catch((err) => {
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

  ;({ access_token } = success)
  console.log('Access Token Response', success)
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
