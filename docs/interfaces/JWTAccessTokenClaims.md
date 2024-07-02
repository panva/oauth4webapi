# Interface: JWTAccessTokenClaims

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

## Indexable

 \[`claim`: `string`\]: [`JsonValue`](../type-aliases/JsonValue.md) \| `undefined`

## Properties

### aud

• `readonly` **aud**: `string` \| `string`[]

***

### client\_id

• `readonly` **client\_id**: `string`

***

### exp

• `readonly` **exp**: `number`

***

### iat

• `readonly` **iat**: `number`

***

### iss

• `readonly` **iss**: `string`

***

### jti

• `readonly` **jti**: `string`

***

### sub

• `readonly` **sub**: `string`

***

### authorization\_details?

• `readonly` `optional` **authorization\_details**: [`AuthorizationDetails`](AuthorizationDetails.md)[]

***

### cnf?

• `readonly` `optional` **cnf**: [`ConfirmationClaims`](ConfirmationClaims.md)

***

### nbf?

• `readonly` `optional` **nbf**: `number`

***

### scope?

• `readonly` `optional` **scope**: `string`
