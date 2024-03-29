# Interface: ClientCredentialsGrantResponse

[💗 Help the project](https://github.com/sponsors/panva)

## Indexable

▪ [parameter: `string`]: [`JsonValue`](../types/JsonValue.md) \| `undefined`

## Table of contents

### Properties

- [access\_token](ClientCredentialsGrantResponse.md#access_token)
- [token\_type](ClientCredentialsGrantResponse.md#token_type)
- [authorization\_details](ClientCredentialsGrantResponse.md#authorization_details)
- [expires\_in](ClientCredentialsGrantResponse.md#expires_in)
- [scope](ClientCredentialsGrantResponse.md#scope)

## Properties

### access\_token

• `Readonly` **access\_token**: `string`

___

### token\_type

• `Readonly` **token\_type**: [`Lowercase`]( https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html#lowercasestringtype )\<`string`\>

NOTE: because the value is case insensitive it is always returned lowercased

___

### authorization\_details

• `Optional` `Readonly` **authorization\_details**: [`AuthorizationDetails`](AuthorizationDetails.md)[]

___

### expires\_in

• `Optional` `Readonly` **expires\_in**: `number`

___

### scope

• `Optional` `Readonly` **scope**: `string`
