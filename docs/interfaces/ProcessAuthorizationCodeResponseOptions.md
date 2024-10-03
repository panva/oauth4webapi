# Interface: ProcessAuthorizationCodeResponseOptions

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

## Properties

### \[jweDecrypt\]?

• `optional` **\[jweDecrypt\]**: [`JweDecryptFunction`](../type-aliases/JweDecryptFunction.md)

See [jweDecrypt](../variables/jweDecrypt.md).

***

### expectedNonce?

• `optional` **expectedNonce**: `string` \| *typeof* [`expectNoNonce`](../variables/expectNoNonce.md)

Expected ID Token `nonce` claim value. Default is [expectNoNonce](../variables/expectNoNonce.md).

***

### maxAge?

• `optional` **maxAge**: `number` \| *typeof* [`skipAuthTimeCheck`](../variables/skipAuthTimeCheck.md)

ID Token [`auth_time`](IDToken.md#auth_time) claim value will be checked to be present and
conform to the `maxAge` value. Use of this option is required if you sent a `max_age` parameter
in an authorization request. Default is [`client.default_max_age`](Client.md#default_max_age)
and falls back to [skipAuthTimeCheck](../variables/skipAuthTimeCheck.md).

***

### requireIdToken?

• `optional` **requireIdToken**: `boolean`

When true this requires [TokenEndpointResponse.id_token](TokenEndpointResponse.md#id_token) to be present
