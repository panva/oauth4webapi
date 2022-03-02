[@panva/oauth4webapi](../README.md) / IDToken

# Interface: IDToken

## Hierarchy

- `JWTPayload`

  ↳ **`IDToken`**

## Table of contents

### Properties

- [aud](IDToken.md#aud)
- [auth\_time](IDToken.md#auth_time)
- [azp](IDToken.md#azp)
- [exp](IDToken.md#exp)
- [iat](IDToken.md#iat)
- [iss](IDToken.md#iss)
- [jti](IDToken.md#jti)
- [nbf](IDToken.md#nbf)
- [nonce](IDToken.md#nonce)
- [sub](IDToken.md#sub)

## Properties

### aud

• `Readonly` **aud**: `string` \| `string`[]

#### Overrides

JWTPayload.aud

___

### auth\_time

• `Optional` `Readonly` **auth\_time**: `number`

___

### azp

• `Optional` `Readonly` **azp**: `string`

___

### exp

• `Readonly` **exp**: `number`

#### Overrides

JWTPayload.exp

___

### iat

• `Readonly` **iat**: `number`

#### Overrides

JWTPayload.iat

___

### iss

• `Readonly` **iss**: `string`

#### Overrides

JWTPayload.iss

___

### jti

• `Optional` `Readonly` **jti**: `string`

#### Inherited from

JWTPayload.jti

___

### nbf

• `Optional` `Readonly` **nbf**: `number`

#### Inherited from

JWTPayload.nbf

___

### nonce

• `Optional` `Readonly` **nonce**: `string`

___

### sub

• `Readonly` **sub**: `string`

#### Overrides

JWTPayload.sub
