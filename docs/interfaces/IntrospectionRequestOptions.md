# Interface: IntrospectionRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Experimental

- [[experimental\_customFetch]](IntrospectionRequestOptions.md#experimental_customfetch)
- [[experimental\_useMtlsAlias]](IntrospectionRequestOptions.md#experimental_usemtlsalias)

### Properties

- [additionalParameters](IntrospectionRequestOptions.md#additionalparameters)
- [clientPrivateKey](IntrospectionRequestOptions.md#clientprivatekey)
- [headers](IntrospectionRequestOptions.md#headers)
- [requestJwtResponse](IntrospectionRequestOptions.md#requestjwtresponse)
- [signal](IntrospectionRequestOptions.md#signal)

## Experimental

### [experimental\_customFetch]

• `Optional` **[experimental\_customFetch]**: (`input`: `RequestInfo` \| [`URL`]( https://developer.mozilla.org/docs/Web/API/URL ), `init?`: `RequestInit`) => [`Promise`]( https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<[`Response`]( https://developer.mozilla.org/docs/Web/API/Response )\>

This is an experimental feature, it is not subject to semantic versioning rules. Non-backward
compatible changes or removal may occur in any future release.

See [experimental_customFetch](../variables/experimental_customFetch.md) for its documentation.

___

### [experimental\_useMtlsAlias]

• `Optional` **[experimental\_useMtlsAlias]**: `boolean`

This is an experimental feature, it is not subject to semantic versioning rules. Non-backward
compatible changes or removal may occur in any future release.

See [experimental_useMtlsAlias](../variables/experimental_useMtlsAlias.md) for its documentation.

## Properties

### additionalParameters

• `Optional` **additionalParameters**: [`Record`]( https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type )\<`string`, `string`\> \| [`URLSearchParams`]( https://developer.mozilla.org/docs/Web/API/URLSearchParams ) \| `string`[][]

Any additional parameters to send. This cannot override existing parameter values.

___

### clientPrivateKey

• `Optional` **clientPrivateKey**: [`CryptoKey`]( https://developer.mozilla.org/docs/Web/API/CryptoKey ) \| [`PrivateKey`](PrivateKey.md)

Private key to use for `private_key_jwt`
[client authentication](../types/ClientAuthenticationMethod.md). Its algorithm must be compatible with
a supported [JWS `alg` Algorithm](../types/JWSAlgorithm.md).

___

### headers

• `Optional` **headers**: [`Record`]( https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type )\<`string`, `string`\> \| [`string`, `string`][] \| [`Headers`]( https://developer.mozilla.org/docs/Web/API/Headers )

Headers to additionally send with the HTTP Request(s) triggered by this function's invocation.

___

### requestJwtResponse

• `Optional` **requestJwtResponse**: `boolean`

Request a JWT Response from the
[`as.introspection_endpoint`](AuthorizationServer.md#introspection_endpoint). Default is

- True when
  [`client.introspection_signed_response_alg`](Client.md#introspection_signed_response_alg) is
  set
- False otherwise

___

### signal

• `Optional` **signal**: [`AbortSignal`]( https://developer.mozilla.org/docs/Web/API/AbortSignal ) \| () => [`AbortSignal`]( https://developer.mozilla.org/docs/Web/API/AbortSignal )

An AbortSignal instance, or a factory returning one, to abort the HTTP Request(s) triggered by
this function's invocation.

**`Example`**

A 5000ms timeout AbortSignal for every request

```js
const signal = () => AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```

## Hierarchy

- [`HttpRequestOptions`](HttpRequestOptions.md)

- [`AuthenticatedRequestOptions`](AuthenticatedRequestOptions.md)

  ↳ **`IntrospectionRequestOptions`**
