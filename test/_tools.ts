import * as jose from 'jose'

export function mangleJwtSignature(jwt: string) {
  const parts = jwt.split('.')

  const decoded = jose.base64url.decode(parts.pop()!)
  const random = new Uint8Array(decoded.length)
  crypto.getRandomValues(random)
  parts.push(jose.base64url.encode(random))

  return parts.join('.')
}
