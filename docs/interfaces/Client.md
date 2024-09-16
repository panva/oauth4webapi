# Interface: Client

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

Recognized Client Metadata that have an effect on the exposed functionality.

## See

[IANA OAuth Client Registration Metadata registry](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#client-metadata)

## Indexable

 \[`metadata`: `string`\]: [`JsonValue`](../type-aliases/JsonValue.md) \| `undefined`

## Properties

### client\_id

• **client\_id**: `string`

Client identifier.

***

### \[clockSkew\]?

• `optional` **\[clockSkew\]**: `number`

See [clockSkew](../variables/clockSkew.md).

***

### \[clockTolerance\]?

• `optional` **\[clockTolerance\]**: `number`

See [clockTolerance](../variables/clockTolerance.md).

***

### \[jweDecrypt\]?

• `optional` **\[jweDecrypt\]**: [`JweDecryptFunction`](JweDecryptFunction.md)

See [jweDecrypt](../variables/jweDecrypt.md).

***

### authorization\_signed\_response\_alg?

• `optional` **authorization\_signed\_response\_alg**: [`JWSAlgorithm`](../type-aliases/JWSAlgorithm.md)

JWS `alg` algorithm required for signing authorization responses. When not configured the
default is to allow only [supported algorithms](../type-aliases/JWSAlgorithm.md) listed in
[`as.authorization_signing_alg_values_supported`](AuthorizationServer.md#authorization_signing_alg_values_supported)
and fall back to `RS256` when the authorization server metadata is not set.

***

### client\_secret?

• `optional` **client\_secret**: `string`

Client secret.

***

### default\_max\_age?

• `optional` **default\_max\_age**: `number`

Default Maximum Authentication Age.

***

### id\_token\_signed\_response\_alg?

• `optional` **id\_token\_signed\_response\_alg**: `string`

JWS `alg` algorithm required for signing the ID Token issued to this Client. When not
configured the default is to allow only algorithms listed in
[`as.id_token_signing_alg_values_supported`](AuthorizationServer.md#id_token_signing_alg_values_supported)
and fall back to `RS256` when the authorization server metadata is not set.

***

### introspection\_signed\_response\_alg?

• `optional` **introspection\_signed\_response\_alg**: `string`

JWS `alg` algorithm REQUIRED for signed introspection responses. When not configured the
default is to allow only algorithms listed in
[`as.introspection_signing_alg_values_supported`](AuthorizationServer.md#introspection_signing_alg_values_supported)
and fall back to `RS256` when the authorization server metadata is not set.

***

### require\_auth\_time?

• `optional` **require\_auth\_time**: `boolean`

Boolean value specifying whether the [`auth_time`](IDToken.md#auth_time) Claim in the ID Token
is REQUIRED. Default is `false`.

***

### token\_endpoint\_auth\_method?

• `optional` **token\_endpoint\_auth\_method**: [`ClientAuthenticationMethod`](../type-aliases/ClientAuthenticationMethod.md)

Client [authentication method](../type-aliases/ClientAuthenticationMethod.md) for the client's authenticated
requests. Default is `client_secret_basic`.

***

### userinfo\_signed\_response\_alg?

• `optional` **userinfo\_signed\_response\_alg**: `string`

JWS `alg` algorithm REQUIRED for signing UserInfo Responses. When not configured the default is
to allow only algorithms listed in
[`as.userinfo_signing_alg_values_supported`](AuthorizationServer.md#userinfo_signing_alg_values_supported)
and fall back to `RS256` when the authorization server metadata is not set.
