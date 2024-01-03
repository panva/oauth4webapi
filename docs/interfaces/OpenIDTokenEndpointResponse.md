# Interface: OpenIDTokenEndpointResponse

[💗 Help the project](https://github.com/sponsors/panva)

## Indexable

▪ [parameter: `string`]: [`JsonValue`](../types/JsonValue.md) \| `undefined`

## Table of contents

### Properties

- [access\_token](OpenIDTokenEndpointResponse.md#access_token)
- [id\_token](OpenIDTokenEndpointResponse.md#id_token)
- [token\_type](OpenIDTokenEndpointResponse.md#token_type)
- [expires\_in](OpenIDTokenEndpointResponse.md#expires_in)
- [refresh\_token](OpenIDTokenEndpointResponse.md#refresh_token)
- [scope](OpenIDTokenEndpointResponse.md#scope)

## Properties

### access\_token

• `Readonly` **access\_token**: `string`

___

### id\_token

• `Readonly` **id\_token**: `string`

___

### token\_type

• `Readonly` **token\_type**: ``"dpop"`` \| [`Lowercase`]( https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html#lowercasestringtype )\<`string`\> \| ``"bearer"``

NOTE: because the value is case insensitive it is always returned lowercased

___

### expires\_in

• `Optional` `Readonly` **expires\_in**: `number`

___

### refresh\_token

• `Optional` `Readonly` **refresh\_token**: `string`

___

### scope

• `Optional` `Readonly` **scope**: `string`
