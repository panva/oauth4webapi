# Interface: JWTAccessTokenClaims

[💗 Help the project](https://github.com/sponsors/panva)

## Indexable

▪ [claim: `string`]: [`JsonValue`](../types/JsonValue.md) \| `undefined`

## Table of contents

### Properties

- [aud](JWTAccessTokenClaims.md#aud)
- [client\_id](JWTAccessTokenClaims.md#client_id)
- [exp](JWTAccessTokenClaims.md#exp)
- [iat](JWTAccessTokenClaims.md#iat)
- [iss](JWTAccessTokenClaims.md#iss)
- [jti](JWTAccessTokenClaims.md#jti)
- [sub](JWTAccessTokenClaims.md#sub)
- [authorization\_details](JWTAccessTokenClaims.md#authorization_details)
- [cnf](JWTAccessTokenClaims.md#cnf)
- [nbf](JWTAccessTokenClaims.md#nbf)
- [scope](JWTAccessTokenClaims.md#scope)

## Properties

### aud

• `Readonly` **aud**: `string` \| `string`[]

___

### client\_id

• `Readonly` **client\_id**: `string`

___

### exp

• `Readonly` **exp**: `number`

___

### iat

• `Readonly` **iat**: `number`

___

### iss

• `Readonly` **iss**: `string`

___

### jti

• `Readonly` **jti**: `string`

___

### sub

• `Readonly` **sub**: `string`

___

### authorization\_details

• `Optional` `Readonly` **authorization\_details**: [`AuthorizationDetails`](AuthorizationDetails.md)[]

___

### cnf

• `Optional` `Readonly` **cnf**: [`ConfirmationClaims`](ConfirmationClaims.md)

___

### nbf

• `Optional` `Readonly` **nbf**: `number`

___

### scope

• `Optional` `Readonly` **scope**: `string`

## Hierarchy

- `JWTPayload`

  ↳ **`JWTAccessTokenClaims`**
