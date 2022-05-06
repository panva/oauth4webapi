# Interface: AuthorizationServer

[💗 Help the project](https://github.com/sponsors/panva)

Authorization Server Metadata

**`see`** [IANA OAuth Authorization Server Metadata registry](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#authorization-server-metadata)

## Table of contents

### Properties

- [acr\_values\_supported](AuthorizationServer.md#acr_values_supported)
- [authorization\_encryption\_alg\_values\_supported](AuthorizationServer.md#authorization_encryption_alg_values_supported)
- [authorization\_encryption\_enc\_values\_supported](AuthorizationServer.md#authorization_encryption_enc_values_supported)
- [authorization\_endpoint](AuthorizationServer.md#authorization_endpoint)
- [authorization\_response\_iss\_parameter\_supported](AuthorizationServer.md#authorization_response_iss_parameter_supported)
- [authorization\_signing\_alg\_values\_supported](AuthorizationServer.md#authorization_signing_alg_values_supported)
- [backchannel\_authentication\_endpoint](AuthorizationServer.md#backchannel_authentication_endpoint)
- [backchannel\_authentication\_request\_signing\_alg\_values\_supported](AuthorizationServer.md#backchannel_authentication_request_signing_alg_values_supported)
- [backchannel\_logout\_session\_supported](AuthorizationServer.md#backchannel_logout_session_supported)
- [backchannel\_logout\_supported](AuthorizationServer.md#backchannel_logout_supported)
- [backchannel\_token\_delivery\_modes\_supported](AuthorizationServer.md#backchannel_token_delivery_modes_supported)
- [backchannel\_user\_code\_parameter\_supported](AuthorizationServer.md#backchannel_user_code_parameter_supported)
- [check\_session\_iframe](AuthorizationServer.md#check_session_iframe)
- [claim\_types\_supported](AuthorizationServer.md#claim_types_supported)
- [claims\_locales\_supported](AuthorizationServer.md#claims_locales_supported)
- [claims\_parameter\_supported](AuthorizationServer.md#claims_parameter_supported)
- [claims\_supported](AuthorizationServer.md#claims_supported)
- [code\_challenge\_methods\_supported](AuthorizationServer.md#code_challenge_methods_supported)
- [device\_authorization\_endpoint](AuthorizationServer.md#device_authorization_endpoint)
- [display\_values\_supported](AuthorizationServer.md#display_values_supported)
- [dpop\_signing\_alg\_values\_supported](AuthorizationServer.md#dpop_signing_alg_values_supported)
- [end\_session\_endpoint](AuthorizationServer.md#end_session_endpoint)
- [frontchannel\_logout\_session\_supported](AuthorizationServer.md#frontchannel_logout_session_supported)
- [frontchannel\_logout\_supported](AuthorizationServer.md#frontchannel_logout_supported)
- [grant\_types\_supported](AuthorizationServer.md#grant_types_supported)
- [id\_token\_encryption\_alg\_values\_supported](AuthorizationServer.md#id_token_encryption_alg_values_supported)
- [id\_token\_encryption\_enc\_values\_supported](AuthorizationServer.md#id_token_encryption_enc_values_supported)
- [id\_token\_signing\_alg\_values\_supported](AuthorizationServer.md#id_token_signing_alg_values_supported)
- [introspection\_encryption\_alg\_values\_supported](AuthorizationServer.md#introspection_encryption_alg_values_supported)
- [introspection\_encryption\_enc\_values\_supported](AuthorizationServer.md#introspection_encryption_enc_values_supported)
- [introspection\_endpoint](AuthorizationServer.md#introspection_endpoint)
- [introspection\_endpoint\_auth\_methods\_supported](AuthorizationServer.md#introspection_endpoint_auth_methods_supported)
- [introspection\_endpoint\_auth\_signing\_alg\_values\_supported](AuthorizationServer.md#introspection_endpoint_auth_signing_alg_values_supported)
- [introspection\_signing\_alg\_values\_supported](AuthorizationServer.md#introspection_signing_alg_values_supported)
- [issuer](AuthorizationServer.md#issuer)
- [jwks\_uri](AuthorizationServer.md#jwks_uri)
- [mtls\_endpoint\_aliases](AuthorizationServer.md#mtls_endpoint_aliases)
- [op\_policy\_uri](AuthorizationServer.md#op_policy_uri)
- [op\_tos\_uri](AuthorizationServer.md#op_tos_uri)
- [pushed\_authorization\_request\_endpoint](AuthorizationServer.md#pushed_authorization_request_endpoint)
- [registration\_endpoint](AuthorizationServer.md#registration_endpoint)
- [request\_object\_encryption\_alg\_values\_supported](AuthorizationServer.md#request_object_encryption_alg_values_supported)
- [request\_object\_encryption\_enc\_values\_supported](AuthorizationServer.md#request_object_encryption_enc_values_supported)
- [request\_object\_signing\_alg\_values\_supported](AuthorizationServer.md#request_object_signing_alg_values_supported)
- [request\_parameter\_supported](AuthorizationServer.md#request_parameter_supported)
- [request\_uri\_parameter\_supported](AuthorizationServer.md#request_uri_parameter_supported)
- [require\_pushed\_authorization\_requests](AuthorizationServer.md#require_pushed_authorization_requests)
- [require\_request\_uri\_registration](AuthorizationServer.md#require_request_uri_registration)
- [require\_signed\_request\_object](AuthorizationServer.md#require_signed_request_object)
- [response\_modes\_supported](AuthorizationServer.md#response_modes_supported)
- [response\_types\_supported](AuthorizationServer.md#response_types_supported)
- [revocation\_endpoint](AuthorizationServer.md#revocation_endpoint)
- [revocation\_endpoint\_auth\_methods\_supported](AuthorizationServer.md#revocation_endpoint_auth_methods_supported)
- [revocation\_endpoint\_auth\_signing\_alg\_values\_supported](AuthorizationServer.md#revocation_endpoint_auth_signing_alg_values_supported)
- [scopes\_supported](AuthorizationServer.md#scopes_supported)
- [service\_documentation](AuthorizationServer.md#service_documentation)
- [signed\_metadata](AuthorizationServer.md#signed_metadata)
- [subject\_types\_supported](AuthorizationServer.md#subject_types_supported)
- [tls\_client\_certificate\_bound\_access\_tokens](AuthorizationServer.md#tls_client_certificate_bound_access_tokens)
- [token\_endpoint](AuthorizationServer.md#token_endpoint)
- [token\_endpoint\_auth\_methods\_supported](AuthorizationServer.md#token_endpoint_auth_methods_supported)
- [token\_endpoint\_auth\_signing\_alg\_values\_supported](AuthorizationServer.md#token_endpoint_auth_signing_alg_values_supported)
- [ui\_locales\_supported](AuthorizationServer.md#ui_locales_supported)
- [userinfo\_encryption\_alg\_values\_supported](AuthorizationServer.md#userinfo_encryption_alg_values_supported)
- [userinfo\_encryption\_enc\_values\_supported](AuthorizationServer.md#userinfo_encryption_enc_values_supported)
- [userinfo\_endpoint](AuthorizationServer.md#userinfo_endpoint)
- [userinfo\_signing\_alg\_values\_supported](AuthorizationServer.md#userinfo_signing_alg_values_supported)

## Properties

### acr\_values\_supported

• `Optional` `Readonly` **acr\_values\_supported**: `string`[]

JSON array containing a list of the Authentication Context Class References
that this authorization server supports.

___

### authorization\_encryption\_alg\_values\_supported

• `Optional` `Readonly` **authorization\_encryption\_alg\_values\_supported**: `string`[]

JSON array containing a list of algorithms supported by the authorization
server for introspection response encryption (alg value).

___

### authorization\_encryption\_enc\_values\_supported

• `Optional` `Readonly` **authorization\_encryption\_enc\_values\_supported**: `string`[]

JSON array containing a list of algorithms supported by the authorization
server for introspection response encryption (enc value).

___

### authorization\_endpoint

• `Optional` `Readonly` **authorization\_endpoint**: `string`

URL of the authorization server's authorization endpoint.

___

### authorization\_response\_iss\_parameter\_supported

• `Optional` `Readonly` **authorization\_response\_iss\_parameter\_supported**: `boolean`

Boolean value indicating whether the authorization server provides the
"iss" parameter in the authorization response.

___

### authorization\_signing\_alg\_values\_supported

• `Optional` `Readonly` **authorization\_signing\_alg\_values\_supported**: `string`[]

JSON array containing a list of algorithms supported by the authorization
server for introspection response signing.

___

### backchannel\_authentication\_endpoint

• `Optional` `Readonly` **backchannel\_authentication\_endpoint**: `string`

CIBA Backchannel Authentication Endpoint.

___

### backchannel\_authentication\_request\_signing\_alg\_values\_supported

• `Optional` `Readonly` **backchannel\_authentication\_request\_signing\_alg\_values\_supported**: `string`[]

JSON array containing a list of the JWS signing algorithms supported for
validation of signed CIBA authentication requests.

___

### backchannel\_logout\_session\_supported

• `Optional` `Readonly` **backchannel\_logout\_session\_supported**: `boolean`

Boolean value specifying whether the authorization server can pass a sid
(session ID) Claim in the Logout Token to identify the RP session with the
OP.

___

### backchannel\_logout\_supported

• `Optional` `Readonly` **backchannel\_logout\_supported**: `boolean`

Boolean value specifying whether the authorization server supports
back-channel logout.

___

### backchannel\_token\_delivery\_modes\_supported

• `Optional` `Readonly` **backchannel\_token\_delivery\_modes\_supported**: `string`[]

Supported CIBA authentication result delivery modes.

___

### backchannel\_user\_code\_parameter\_supported

• `Optional` `Readonly` **backchannel\_user\_code\_parameter\_supported**: `boolean`

Indicates whether the authorization server supports the use of the CIBA
user_code parameter.

___

### check\_session\_iframe

• `Optional` `Readonly` **check\_session\_iframe**: `string`

URL of an authorization server iframe that supports cross-origin
communications for session state information with the RP Client, using the
HTML5 postMessage API.

___

### claim\_types\_supported

• `Optional` `Readonly` **claim\_types\_supported**: `string`[]

JSON array containing a list of the Claim Types that the authorization
server supports.

___

### claims\_locales\_supported

• `Optional` `Readonly` **claims\_locales\_supported**: `string`[]

Languages and scripts supported for values in Claims being returned,
represented as a JSON array of RFC 5646 language tag values.

___

### claims\_parameter\_supported

• `Optional` `Readonly` **claims\_parameter\_supported**: `boolean`

Boolean value specifying whether the authorization server supports use of
the "claims" parameter.

___

### claims\_supported

• `Optional` `Readonly` **claims\_supported**: `string`[]

JSON array containing a list of the Claim Names of the Claims that the
authorization server MAY be able to supply values for.

___

### code\_challenge\_methods\_supported

• `Optional` `Readonly` **code\_challenge\_methods\_supported**: `string`[]

PKCE code challenge methods supported by this authorization server.

___

### device\_authorization\_endpoint

• `Optional` `Readonly` **device\_authorization\_endpoint**: `string`

URL of the authorization server's device authorization endpoint.

___

### display\_values\_supported

• `Optional` `Readonly` **display\_values\_supported**: `string`[]

JSON array containing a list of the "display" parameter values that the
authorization server supports.

___

### dpop\_signing\_alg\_values\_supported

• `Optional` `Readonly` **dpop\_signing\_alg\_values\_supported**: `string`[]

JSON array containing a list of the JWS algorithms supported for DPoP proof
JWTs.

___

### end\_session\_endpoint

• `Optional` `Readonly` **end\_session\_endpoint**: `string`

URL at the authorization server to which an RP can perform a redirect to
request that the End-User be logged out at the authorization server.

___

### frontchannel\_logout\_session\_supported

• `Optional` `Readonly` **frontchannel\_logout\_session\_supported**: `boolean`

Boolean value specifying whether the authorization server can pass "iss"
(issuer) and "sid" (session ID) query parameters to identify the RP session
with the authorization server when the "frontchannel_logout_uri" is used.

___

### frontchannel\_logout\_supported

• `Optional` `Readonly` **frontchannel\_logout\_supported**: `boolean`

Boolean value specifying whether the authorization server supports
HTTP-based logout.

___

### grant\_types\_supported

• `Optional` `Readonly` **grant\_types\_supported**: `string`[]

JSON array containing a list of the "grant_type" values that this
authorization server supports.

___

### id\_token\_encryption\_alg\_values\_supported

• `Optional` `Readonly` **id\_token\_encryption\_alg\_values\_supported**: `string`[]

JSON array containing a list of the JWE "alg" values supported by the
authorization server for the ID Token.

___

### id\_token\_encryption\_enc\_values\_supported

• `Optional` `Readonly` **id\_token\_encryption\_enc\_values\_supported**: `string`[]

JSON array containing a list of the JWE "enc" values supported by the
authorization server for the ID Token.

___

### id\_token\_signing\_alg\_values\_supported

• `Optional` `Readonly` **id\_token\_signing\_alg\_values\_supported**: `string`[]

JSON array containing a list of the JWS "alg" values supported by the
authorization server for the ID Token.

___

### introspection\_encryption\_alg\_values\_supported

• `Optional` `Readonly` **introspection\_encryption\_alg\_values\_supported**: `string`[]

JSON array containing a list of algorithms supported by the authorization
server for introspection response content key encryption (alg value).

___

### introspection\_encryption\_enc\_values\_supported

• `Optional` `Readonly` **introspection\_encryption\_enc\_values\_supported**: `string`[]

JSON array containing a list of algorithms supported by the authorization
server for introspection response content encryption (enc value).

___

### introspection\_endpoint

• `Optional` `Readonly` **introspection\_endpoint**: `string`

URL of the authorization server's introspection endpoint.

___

### introspection\_endpoint\_auth\_methods\_supported

• `Optional` `Readonly` **introspection\_endpoint\_auth\_methods\_supported**: `string`[]

JSON array containing a list of client authentication methods supported by
this introspection endpoint.

___

### introspection\_endpoint\_auth\_signing\_alg\_values\_supported

• `Optional` `Readonly` **introspection\_endpoint\_auth\_signing\_alg\_values\_supported**: `string`[]

JSON array containing a list of the JWS signing algorithms supported by the
introspection endpoint for the signature on the JWT used to authenticate
the client at the introspection endpoint.

___

### introspection\_signing\_alg\_values\_supported

• `Optional` `Readonly` **introspection\_signing\_alg\_values\_supported**: `string`[]

JSON array containing a list of algorithms supported by the authorization
server for introspection response signing.

___

### issuer

• `Readonly` **issuer**: `string`

Authorization server's issuer identifier URL.

___

### jwks\_uri

• `Optional` `Readonly` **jwks\_uri**: `string`

URL of the authorization server's JWK Set document.

___

### mtls\_endpoint\_aliases

• `Optional` `Readonly` **mtls\_endpoint\_aliases**: [`MTLSEndpointAliases`](MTLSEndpointAliases.md)

JSON object containing alternative authorization server endpoints, which a
client intending to do mutual TLS will use in preference to the
conventional endpoints.

___

### op\_policy\_uri

• `Optional` `Readonly` **op\_policy\_uri**: `string`

URL that the authorization server provides to the person registering the
client to read about the authorization server's requirements on how the
client can use the data provided by the authorization server.

___

### op\_tos\_uri

• `Optional` `Readonly` **op\_tos\_uri**: `string`

URL that the authorization server provides to the person registering the
client to read about the authorization server's terms of service.

___

### pushed\_authorization\_request\_endpoint

• `Optional` `Readonly` **pushed\_authorization\_request\_endpoint**: `string`

URL of the authorization server's pushed authorization request endpoint.

___

### registration\_endpoint

• `Optional` `Readonly` **registration\_endpoint**: `string`

URL of the authorization server's Dynamic Client Registration Endpoint.

___

### request\_object\_encryption\_alg\_values\_supported

• `Optional` `Readonly` **request\_object\_encryption\_alg\_values\_supported**: `string`[]

JSON array containing a list of the JWE "alg" values supported by the
authorization server for Request Objects.

___

### request\_object\_encryption\_enc\_values\_supported

• `Optional` `Readonly` **request\_object\_encryption\_enc\_values\_supported**: `string`[]

JSON array containing a list of the JWE "enc" values supported by the
authorization server for Request Objects.

___

### request\_object\_signing\_alg\_values\_supported

• `Optional` `Readonly` **request\_object\_signing\_alg\_values\_supported**: `string`[]

JSON array containing a list of the JWS "alg" values supported by the
authorization server for Request Objects.

___

### request\_parameter\_supported

• `Optional` `Readonly` **request\_parameter\_supported**: `boolean`

Boolean value specifying whether the authorization server supports use of
the "request" parameter.

___

### request\_uri\_parameter\_supported

• `Optional` `Readonly` **request\_uri\_parameter\_supported**: `boolean`

Boolean value specifying whether the authorization server supports use of
the "request_uri" parameter.

___

### require\_pushed\_authorization\_requests

• `Optional` `Readonly` **require\_pushed\_authorization\_requests**: `boolean`

Indicates whether the authorization server accepts authorization requests
only via PAR.

___

### require\_request\_uri\_registration

• `Optional` `Readonly` **require\_request\_uri\_registration**: `boolean`

Boolean value specifying whether the authorization server requires any
"request_uri" values used to be pre-registered.

___

### require\_signed\_request\_object

• `Optional` `Readonly` **require\_signed\_request\_object**: `boolean`

Indicates where authorization request needs to be protected as Request
Object and provided through either request or request_uri parameter.

___

### response\_modes\_supported

• `Optional` `Readonly` **response\_modes\_supported**: `string`[]

JSON array containing a list of the "response_mode" values that this
authorization server supports.

___

### response\_types\_supported

• `Optional` `Readonly` **response\_types\_supported**: `string`[]

JSON array containing a list of the "response_type" values that this
authorization server supports.

___

### revocation\_endpoint

• `Optional` `Readonly` **revocation\_endpoint**: `string`

URL of the authorization server's revocation endpoint.

___

### revocation\_endpoint\_auth\_methods\_supported

• `Optional` `Readonly` **revocation\_endpoint\_auth\_methods\_supported**: `string`[]

JSON array containing a list of client authentication methods supported by
this revocation endpoint.

___

### revocation\_endpoint\_auth\_signing\_alg\_values\_supported

• `Optional` `Readonly` **revocation\_endpoint\_auth\_signing\_alg\_values\_supported**: `string`[]

JSON array containing a list of the JWS signing algorithms supported by the
revocation endpoint for the signature on the JWT used to authenticate the
client at the revocation endpoint.

___

### scopes\_supported

• `Optional` `Readonly` **scopes\_supported**: `string`[]

JSON array containing a list of the "scope" values that this authorization
server supports.

___

### service\_documentation

• `Optional` `Readonly` **service\_documentation**: `string`

URL of a page containing human-readable information that developers might
want or need to know when using the authorization server.

___

### signed\_metadata

• `Optional` `Readonly` **signed\_metadata**: `string`

Signed JWT containing metadata values about the authorization server as
claims.

___

### subject\_types\_supported

• `Optional` `Readonly` **subject\_types\_supported**: `string`[]

JSON array containing a list of the Subject Identifier types that this
authorization server supports.

___

### tls\_client\_certificate\_bound\_access\_tokens

• `Optional` `Readonly` **tls\_client\_certificate\_bound\_access\_tokens**: `boolean`

Indicates authorization server support for mutual-TLS client
certificate-bound access tokens.

___

### token\_endpoint

• `Optional` `Readonly` **token\_endpoint**: `string`

URL of the authorization server's token endpoint.

___

### token\_endpoint\_auth\_methods\_supported

• `Optional` `Readonly` **token\_endpoint\_auth\_methods\_supported**: `string`[]

JSON array containing a list of client authentication methods supported by
this token endpoint.

___

### token\_endpoint\_auth\_signing\_alg\_values\_supported

• `Optional` `Readonly` **token\_endpoint\_auth\_signing\_alg\_values\_supported**: `string`[]

JSON array containing a list of the JWS signing algorithms supported by the
token endpoint for the signature on the JWT used to authenticate the client
at the token endpoint.

___

### ui\_locales\_supported

• `Optional` `Readonly` **ui\_locales\_supported**: `string`[]

Languages and scripts supported for the user interface, represented as a
JSON array of language tag values from RFC 5646.

___

### userinfo\_encryption\_alg\_values\_supported

• `Optional` `Readonly` **userinfo\_encryption\_alg\_values\_supported**: `string`[]

JSON array containing a list of the JWE "alg" values supported by the
UserInfo Endpoint.

___

### userinfo\_encryption\_enc\_values\_supported

• `Optional` `Readonly` **userinfo\_encryption\_enc\_values\_supported**: `string`[]

JSON array containing a list of the JWE "enc" values supported by the
UserInfo Endpoint.

___

### userinfo\_endpoint

• `Optional` `Readonly` **userinfo\_endpoint**: `string`

URL of the authorization server's UserInfo Endpoint.

___

### userinfo\_signing\_alg\_values\_supported

• `Optional` `Readonly` **userinfo\_signing\_alg\_values\_supported**: `string`[]

JSON array containing a list of the JWS "alg" values supported by the
UserInfo Endpoint.
