[@panva/oauth4webapi](../README.md) / Client

# Interface: Client

Recognized Client Metadata that have an effect on the exposed functionality.

## Indexable

▪ [parameter: `string`]: `unknown`

## Table of contents

### Properties

- [authorization\_signed\_response\_alg](Client.md#authorization_signed_response_alg)
- [client\_id](Client.md#client_id)
- [client\_secret](Client.md#client_secret)
- [default\_max\_age](Client.md#default_max_age)
- [id\_token\_signed\_response\_alg](Client.md#id_token_signed_response_alg)
- [introspection\_signed\_response\_alg](Client.md#introspection_signed_response_alg)
- [request\_object\_encryption\_enc](Client.md#request_object_encryption_enc)
- [require\_auth\_time](Client.md#require_auth_time)
- [token\_endpoint\_auth\_method](Client.md#token_endpoint_auth_method)
- [token\_endpoint\_auth\_signing\_alg](Client.md#token_endpoint_auth_signing_alg)
- [userinfo\_signed\_response\_alg](Client.md#userinfo_signed_response_alg)

## Properties

### authorization\_signed\_response\_alg

• `Optional` **authorization\_signed\_response\_alg**: `string`

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

• `Optional` **id\_token\_signed\_response\_alg**: `string`

JWS "alg" algorithm required for signing the ID Token issued to this
Client.

___

### introspection\_signed\_response\_alg

• `Optional` **introspection\_signed\_response\_alg**: `string`

JWS "alg" algorithm REQUIRED for signed introspection responses.

___

### request\_object\_encryption\_enc

• `Optional` **request\_object\_encryption\_enc**: `string`

JWE "enc" algorithm the RP is declaring that it may use for encrypting
Request Objects sent to the authorization server.

___

### require\_auth\_time

• `Optional` **require\_auth\_time**: `boolean`

Boolean value specifying whether the [auth_time](IDToken.md#auth_time)
Claim in the ID Token is REQUIRED.

___

### token\_endpoint\_auth\_method

• `Optional` **token\_endpoint\_auth\_method**: `string`

Client [authentication method](../types/TokenEndpointAuthMethod.md) for the
client's authenticated requests.

___

### userinfo\_signed\_response\_alg

• `Optional` **userinfo\_signed\_response\_alg**: `string`

JWS "alg" algorithm REQUIRED for signing UserInfo Responses.
