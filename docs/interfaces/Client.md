# Interface: Client

Recognized Client Metadata that have an effect on the exposed functionality.

**`see`** [IANA OAuth Client Registration Metadata registry](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#client-metadata)

## Table of contents

### Properties

- [authorization\_signed\_response\_alg](Client.md#authorization_signed_response_alg)
- [client\_id](Client.md#client_id)
- [client\_secret](Client.md#client_secret)
- [default\_max\_age](Client.md#default_max_age)
- [id\_token\_signed\_response\_alg](Client.md#id_token_signed_response_alg)
- [introspection\_signed\_response\_alg](Client.md#introspection_signed_response_alg)
- [require\_auth\_time](Client.md#require_auth_time)
- [token\_endpoint\_auth\_method](Client.md#token_endpoint_auth_method)
- [userinfo\_signed\_response\_alg](Client.md#userinfo_signed_response_alg)

## Properties

### authorization\_signed\_response\_alg

• `Optional` **authorization\_signed\_response\_alg**: [`JWSAlgorithm`](../types/JWSAlgorithm.md)

JWS "alg" algorithm required for signing authorization responses.

___

### client\_id

• **client\_id**: `string`

Client identifier.

___

### client\_secret

• `Optional` **client\_secret**: `string`

Client secret.

___

### default\_max\_age

• `Optional` **default\_max\_age**: `number`

Default Maximum Authentication Age.

___

### id\_token\_signed\_response\_alg

• `Optional` **id\_token\_signed\_response\_alg**: [`JWSAlgorithm`](../types/JWSAlgorithm.md)

JWS "alg" algorithm required for signing the ID Token issued to this
Client.

___

### introspection\_signed\_response\_alg

• `Optional` **introspection\_signed\_response\_alg**: [`JWSAlgorithm`](../types/JWSAlgorithm.md)

JWS "alg" algorithm REQUIRED for signed introspection responses.

___

### require\_auth\_time

• `Optional` **require\_auth\_time**: `boolean`

Boolean value specifying whether the [auth_time](IDToken.md#auth_time)
Claim in the ID Token is REQUIRED. Default is `false`.

___

### token\_endpoint\_auth\_method

• `Optional` **token\_endpoint\_auth\_method**: [`TokenEndpointAuthMethod`](../types/TokenEndpointAuthMethod.md)

Client [authentication method](../types/TokenEndpointAuthMethod.md) for the
client's authenticated requests. Default is `client_secret_basic`.

___

### userinfo\_signed\_response\_alg

• `Optional` **userinfo\_signed\_response\_alg**: [`JWSAlgorithm`](../types/JWSAlgorithm.md)

JWS "alg" algorithm REQUIRED for signing UserInfo Responses.
