[@panva/oauth4webapi](../README.md) / SignalledRequestOptions

# Interface: SignalledRequestOptions

## Hierarchy

- **`SignalledRequestOptions`**

  ↳ [`DiscoveryRequestOptions`](DiscoveryRequestOptions.md)

  ↳ [`PushedAuthorizationRequestOptions`](PushedAuthorizationRequestOptions.md)

  ↳ [`ProtectedResourceRequestOptions`](ProtectedResourceRequestOptions.md)

  ↳ [`TokenEndpointRequestOptions`](TokenEndpointRequestOptions.md)

  ↳ [`RevocationRequestOptions`](RevocationRequestOptions.md)

  ↳ [`IntrospectionRequestOptions`](IntrospectionRequestOptions.md)

  ↳ [`JwksRequestOptions`](JwksRequestOptions.md)

  ↳ [`DeviceAuthorizationRequestOptions`](DeviceAuthorizationRequestOptions.md)

## Table of contents

### Properties

- [signal](SignalledRequestOptions.md#signal)

## Properties

### signal

• `Optional` **signal**: `AbortSignal`

An [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
instance to abort the underlying fetch requests.

**`example`** Obtain a 5000ms timeout AbortSignal
```js
const signal = AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```
