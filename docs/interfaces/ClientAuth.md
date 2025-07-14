# Interface: ClientAuth()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

Implementation of the Client's Authentication Method at the Authorization Server.

## See

 - [ClientSecretPost](../functions/ClientSecretPost.md)
 - [ClientSecretBasic](../functions/ClientSecretBasic.md)
 - [PrivateKeyJwt](../functions/PrivateKeyJwt.md)
 - [None](../functions/None.md)
 - [TlsClientAuth](../functions/TlsClientAuth.md)
 - [AttestationAuth](../functions/AttestationAuth.md)
 - [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)

▸ **ClientAuth**(`as`, `client`, `body`, `headers`): `void` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Implementation of the Client's Authentication Method at the Authorization Server.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `as` | [`AuthorizationServer`](AuthorizationServer.md) |
| `client` | [`Client`](Client.md) |
| `body` | [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) |
| `headers` | [`Headers`](https://developer.mozilla.org/docs/Web/API/Headers) |

## Returns

`void` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

## See

 - [ClientSecretPost](../functions/ClientSecretPost.md)
 - [ClientSecretBasic](../functions/ClientSecretBasic.md)
 - [PrivateKeyJwt](../functions/PrivateKeyJwt.md)
 - [None](../functions/None.md)
 - [TlsClientAuth](../functions/TlsClientAuth.md)
 - [AttestationAuth](../functions/AttestationAuth.md)
 - [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)

## Properties

### afterHeaders()?

• `optional` **afterHeaders**: (`headers`) => `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `headers` | [`Headers`](https://developer.mozilla.org/docs/Web/API/Headers) |

#### Returns

`void`

***

### beforeRequest()?

• `optional` **beforeRequest**: (`as`, `client`, `options`?) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `as` | [`AuthorizationServer`](AuthorizationServer.md) |
| `client` | [`Client`](Client.md) |
| `options`? | [`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)\<[`HttpRequestOptions`](HttpRequestOptions.md)\<`"POST"`, [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams)\>, `"headers"`\> |

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
