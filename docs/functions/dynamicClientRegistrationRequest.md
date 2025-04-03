# Function: dynamicClientRegistrationRequest()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **dynamicClientRegistrationRequest**(`as`, `metadata`, `options`?): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Performs a Dynamic Client Registration at the
[`as.registration_endpoint`](../interfaces/AuthorizationServer.md#registration_endpoint) using the provided
client metadata.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) |
| `metadata` | [`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`OmitSymbolProperties`](../type-aliases/OmitSymbolProperties.md)\<[`Client`](../interfaces/Client.md)\>\> |
| `options`? | [`DynamicClientRegistrationRequestOptions`](../interfaces/DynamicClientRegistrationRequestOptions.md) |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

## See

 - [RFC 7591 - OAuth 2.0 Dynamic Client Registration Protocol (DCR)](https://www.rfc-editor.org/rfc/rfc7591.html#section-3.1)
 - [OpenID Connect Dynamic Client Registration 1.0 (DCR)](https://openid.net/specs/openid-connect-registration-1_0-errata2.html#RegistrationRequest)
 - [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-protected-resource-access)
