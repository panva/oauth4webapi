# Interface: OAuth2TokenEndpointResponse

[💗 Help the project](https://github.com/sponsors/panva)

## Indexable

▪ [parameter: `string`]: [`JsonValue`](../types/JsonValue.md) \| `undefined`

## Table of contents

### Properties

- [access\_token](OAuth2TokenEndpointResponse.md#access_token)
- [token\_type](OAuth2TokenEndpointResponse.md#token_type)
- [authorization\_details](OAuth2TokenEndpointResponse.md#authorization_details)
- [expires\_in](OAuth2TokenEndpointResponse.md#expires_in)
- [id\_token](OAuth2TokenEndpointResponse.md#id_token)
- [refresh\_token](OAuth2TokenEndpointResponse.md#refresh_token)
- [scope](OAuth2TokenEndpointResponse.md#scope)

## Properties

### access\_token

• `Readonly` **access\_token**: `string`

___

### token\_type

• `Readonly` **token\_type**: ``"dpop"`` \| [`Lowercase`]( https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html#lowercasestringtype )\<`string`\> \| ``"bearer"``

NOTE: because the value is case insensitive it is always returned lowercased

___

### authorization\_details

• `Optional` `Readonly` **authorization\_details**: [`AuthorizationDetails`](AuthorizationDetails.md)[]

___

### expires\_in

• `Optional` `Readonly` **expires\_in**: `number`

___

### id\_token

• `Optional` `Readonly` **id\_token**: `undefined`

___

### refresh\_token

• `Optional` `Readonly` **refresh\_token**: `string`

___

### scope

• `Optional` `Readonly` **scope**: `string`
