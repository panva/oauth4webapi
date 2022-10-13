import * as jose from 'jose'

export function mangleJwtSignature(jwt: string) {
  const parts = jwt.split('.')

  parts.push(jose.base64url.encode(crypto.getRandomValues(jose.base64url.decode(parts.pop()!))))

  return parts.join('.')
}
