# Interface: AuthenticatedRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [[experimentalUseMtlsAlias]](AuthenticatedRequestOptions.md#[experimentalusemtlsalias])
- [clientPrivateKey](AuthenticatedRequestOptions.md#clientprivatekey)

## Properties

### [experimentalUseMtlsAlias]

• `Optional` **[experimentalUseMtlsAlias]**: `boolean`

This is an experimental feature, it is not subject to semantic versioning rules. Non-backward
compatible changes or removal may occur in any future release.

See [experimentalUseMtlsAlias](../variables/experimentalUseMtlsAlias.md) for its documentation.

___

### clientPrivateKey

• `Optional` **clientPrivateKey**: [`CryptoKey`]( https://developer.mozilla.org/docs/Web/API/CryptoKey ) \| [`PrivateKey`](PrivateKey.md)

Private key to use for `private_key_jwt`
[client authentication](../types/ClientAuthenticationMethod.md). Its algorithm must be compatible with
a supported [JWS `alg` Algorithm](../types/JWSAlgorithm.md).

## Hierarchy

- [`ExperimentalUseMTLSAliasOptions`](ExperimentalUseMTLSAliasOptions.md)

  ↳ **`AuthenticatedRequestOptions`**

  ↳↳ [`PushedAuthorizationRequestOptions`](PushedAuthorizationRequestOptions.md)

  ↳↳ [`TokenEndpointRequestOptions`](TokenEndpointRequestOptions.md)

  ↳↳ [`ClientCredentialsGrantRequestOptions`](ClientCredentialsGrantRequestOptions.md)

  ↳↳ [`RevocationRequestOptions`](RevocationRequestOptions.md)

  ↳↳ [`IntrospectionRequestOptions`](IntrospectionRequestOptions.md)

  ↳↳ [`DeviceAuthorizationRequestOptions`](DeviceAuthorizationRequestOptions.md)
