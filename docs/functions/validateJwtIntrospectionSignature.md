# Function: validateJwtIntrospectionSignature()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **validateJwtIntrospectionSignature**(`as`, `ref`, `options`?): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Validates the JWS Signature of an JWT [Response](https://developer.mozilla.org/docs/Web/API/Response) body of responses previously processed by
[processIntrospectionResponse](processIntrospectionResponse.md) for non-repudiation purposes.

Note: Validating signatures of JWTs received via direct communication between the Client and a
TLS-secured Endpoint (which it is here) is not mandatory since the TLS server validation is used
to validate the issuer instead of checking the token signature. You only need to use this method
for non-repudiation purposes.

Note: Supports only digital signatures.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `ref` | [`Response`](https://developer.mozilla.org/docs/Web/API/Response) | Response previously processed by [processIntrospectionResponse](processIntrospectionResponse.md). |
| `options`? | [`ValidateSignatureOptions`](../interfaces/ValidateSignatureOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Resolves if the signature validates, rejects otherwise.

## See

[draft-ietf-oauth-jwt-introspection-response-12 - JWT Response for OAuth Token Introspection](https://www.ietf.org/archive/id/draft-ietf-oauth-jwt-introspection-response-12.html#section-5)
