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

ID Token [`auth\_time`](IDToken.md#auth_time) claim value will be checked to be present and
conform to the `maxAge` value. Use of this option is required if you sent a `max_age` parameter
in an authorization request. Default is [`client.default\_max\_age`](Client.md#default_max_age)
and falls back to [skipAuthTimeCheck](../variables/skipAuthTimeCheck.md).

***

### recognizedTokenTypes?

• `optional` **recognizedTokenTypes**: [`RecognizedTokenTypes`](../type-aliases/RecognizedTokenTypes.md)

See [RecognizedTokenTypes](../type-aliases/RecognizedTokenTypes.md).

***

### requireIdToken?

• `optional` **requireIdToken**: `boolean`

When true this requires [TokenEndpointResponse.id\_token](TokenEndpointResponse.md#id_token) to be present
