# Function: validateAuthResponse()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **validateAuthResponse**(`as`, `client`, `parameters`, `expectedState`?): [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)

Validates an OAuth 2.0 Authorization Response or Authorization Error Response message returned
from the authorization server's
[`as.authorization_endpoint`](../interfaces/AuthorizationServer.md#authorization_endpoint).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `parameters` | [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) \| [`URL`](https://developer.mozilla.org/docs/Web/API/URL) | Authorization response. |
| `expectedState`? | `string` \| *typeof* [`expectNoState`](../variables/expectNoState.md) \| *typeof* [`skipStateCheck`](../variables/skipStateCheck.md) | Expected `state` parameter value. Default is [expectNoState](../variables/expectNoState.md). |

## Returns

[`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)

Validated Authorization Response parameters or Authorization Error Response.

## See

 - [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.2)
 - [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication)
 - [RFC 9207 - OAuth 2.0 Authorization Server Issuer Identification](https://www.rfc-editor.org/rfc/rfc9207.html)
