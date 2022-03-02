[@panva/oauth4webapi](../README.md) / AuthenticatedRequestOptions

# Interface: AuthenticatedRequestOptions

## Hierarchy

- **`AuthenticatedRequestOptions`**

  ↳ [`PushedAuthorizationRequestOptions`](PushedAuthorizationRequestOptions.md)

  ↳ [`TokenEndpointRequestOptions`](TokenEndpointRequestOptions.md)

  ↳ [`RevocationRequestOptions`](RevocationRequestOptions.md)

  ↳ [`IntrospectionRequestOptions`](IntrospectionRequestOptions.md)

  ↳ [`DeviceAuthorizationRequestOptions`](DeviceAuthorizationRequestOptions.md)

## Table of contents

### Properties

- [clientPrivateKey](AuthenticatedRequestOptions.md#clientprivatekey)

## Properties

### clientPrivateKey

• `Optional` **clientPrivateKey**: [`PrivateKey`](PrivateKey.md)

Private key to use for `private_key_jwt`
[client authentication](../types/TokenEndpointAuthMethod.md).
