# Interface: AuthenticatedRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [[useMtlsAlias]](AuthenticatedRequestOptions.md#usemtlsalias)
- [clientPrivateKey](AuthenticatedRequestOptions.md#clientprivatekey)

## Properties

### [useMtlsAlias]

• `Optional` **[useMtlsAlias]**: `boolean`

See [useMtlsAlias](../variables/useMtlsAlias.md).

___

### clientPrivateKey

• `Optional` **clientPrivateKey**: [`CryptoKey`]( https://developer.mozilla.org/docs/Web/API/CryptoKey ) \| [`PrivateKey`](PrivateKey.md)

Private key to use for `private_key_jwt`
[client authentication](../types/ClientAuthenticationMethod.md). Its algorithm must be compatible with
a supported [JWS `alg` Algorithm](../types/JWSAlgorithm.md).

## Hierarchy

- [`UseMTLSAliasOptions`](UseMTLSAliasOptions.md)

  ↳ **`AuthenticatedRequestOptions`**

  ↳↳ [`PushedAuthorizationRequestOptions`](PushedAuthorizationRequestOptions.md)

  ↳↳ [`TokenEndpointRequestOptions`](TokenEndpointRequestOptions.md)

  ↳↳ [`ClientCredentialsGrantRequestOptions`](ClientCredentialsGrantRequestOptions.md)

  ↳↳ [`RevocationRequestOptions`](RevocationRequestOptions.md)

  ↳↳ [`IntrospectionRequestOptions`](IntrospectionRequestOptions.md)

  ↳↳ [`DeviceAuthorizationRequestOptions`](DeviceAuthorizationRequestOptions.md)
