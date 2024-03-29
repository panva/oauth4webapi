# Interface: MTLSEndpointAliases

[💗 Help the project](https://github.com/sponsors/panva)

## Indexable

▪ [metadata: `string`]: [`JsonValue`](../types/JsonValue.md) \| `undefined`

## Table of contents

### Properties

- [device\_authorization\_endpoint](MTLSEndpointAliases.md#device_authorization_endpoint)
- [introspection\_endpoint](MTLSEndpointAliases.md#introspection_endpoint)
- [pushed\_authorization\_request\_endpoint](MTLSEndpointAliases.md#pushed_authorization_request_endpoint)
- [revocation\_endpoint](MTLSEndpointAliases.md#revocation_endpoint)
- [token\_endpoint](MTLSEndpointAliases.md#token_endpoint)
- [userinfo\_endpoint](MTLSEndpointAliases.md#userinfo_endpoint)

## Properties

### device\_authorization\_endpoint

• `Optional` `Readonly` **device\_authorization\_endpoint**: `string`

URL of the authorization server's device authorization endpoint.

___

### introspection\_endpoint

• `Optional` `Readonly` **introspection\_endpoint**: `string`

URL of the authorization server's introspection endpoint.

___

### pushed\_authorization\_request\_endpoint

• `Optional` `Readonly` **pushed\_authorization\_request\_endpoint**: `string`

URL of the authorization server's pushed authorization request endpoint.

___

### revocation\_endpoint

• `Optional` `Readonly` **revocation\_endpoint**: `string`

URL of the authorization server's revocation endpoint.

___

### token\_endpoint

• `Optional` `Readonly` **token\_endpoint**: `string`

URL of the authorization server's token endpoint.

___

### userinfo\_endpoint

• `Optional` `Readonly` **userinfo\_endpoint**: `string`

URL of the authorization server's UserInfo Endpoint.

## Hierarchy

- [`Pick`]( https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys )\<[`AuthorizationServer`](AuthorizationServer.md), ``"token_endpoint"`` \| ``"revocation_endpoint"`` \| ``"introspection_endpoint"`` \| ``"device_authorization_endpoint"`` \| ``"userinfo_endpoint"`` \| ``"pushed_authorization_request_endpoint"``\>

  ↳ **`MTLSEndpointAliases`**
