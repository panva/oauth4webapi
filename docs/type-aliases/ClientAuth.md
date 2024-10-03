# Type Alias: ClientAuth()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• **ClientAuth**: (`as`, `client`, `body`, `headers`) => `void` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Implementation of the Client's Authentication Method at the Authorization Server.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) |
| `client` | [`Client`](../interfaces/Client.md) |
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
 - [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
