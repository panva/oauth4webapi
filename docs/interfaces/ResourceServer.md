# Interface: ResourceServer

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

Protected Resource Server Metadata

## See

[IANA OAuth Protected Resource Server Metadata registry](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#protected-resource-server-metadata)

## Indexable

 \[`metadata`: `string`\]: `undefined` \| [`JsonValue`](../type-aliases/JsonValue.md)

## Properties

### resource

• `readonly` **resource**: `string`

Resource server's Resource Identifier URL.

***

### authorization\_details\_types\_supported?

• `readonly` `optional` **authorization\_details\_types\_supported**: `boolean`

JSON array containing a list of the authorization details type values supported by the resource
server when the authorization_details request parameter is used

***

### authorization\_servers?

• `readonly` `optional` **authorization\_servers**: `string`[]

JSON array containing a list of OAuth authorization server issuer identifiers

***

### bearer\_methods\_supported?

• `readonly` `optional` **bearer\_methods\_supported**: `string`[]

JSON array containing a list of the OAuth 2.0 Bearer Token presentation methods that this
protected resource supports

***

### dpop\_bound\_access\_tokens\_required?

• `readonly` `optional` **dpop\_bound\_access\_tokens\_required**: `boolean`

Boolean value specifying whether the protected resource always requires the use of DPoP-bound
access tokens

***

### dpop\_signing\_alg\_values\_supported?

• `readonly` `optional` **dpop\_signing\_alg\_values\_supported**: `boolean`

JSON array containing a list of the JWS alg values supported by the resource server for
validating DPoP proof JWTs

***

### jwks\_uri?

• `readonly` `optional` **jwks\_uri**: `string`

URL of the protected resource's JWK Set document

***

### resource\_documentation?

• `readonly` `optional` **resource\_documentation**: `string`

URL of a page containing human-readable information that developers might want or need to know
when using the protected resource

***

### resource\_name?

• `readonly` `optional` **resource\_name**: `string`

Human-readable name of the protected resource

***

### resource\_policy\_uri?

• `readonly` `optional` **resource\_policy\_uri**: `string`

URL of a page containing human-readable information about the protected resource's requirements
on how the client can use the data provided by the protected resource

***

### resource\_signing\_alg\_values\_supported?

• `readonly` `optional` **resource\_signing\_alg\_values\_supported**: `string`[]

JSON array containing a list of the JWS signing algorithms (alg values) supported by the
protected resource for signed content

***

### resource\_tos\_uri?

• `readonly` `optional` **resource\_tos\_uri**: `string`

URL of a page containing human-readable information about the protected resource's terms of
service

***

### scopes\_supported?

• `readonly` `optional` **scopes\_supported**: `string`[]

JSON array containing a list of the OAuth 2.0 scope values that are used in authorization
requests to request access to this protected resource

***

### signed\_metadata?

• `readonly` `optional` **signed\_metadata**: `string`

Signed JWT containing metadata parameters about the protected resource as claims

***

### tls\_client\_certificate\_bound\_access\_tokens?

• `readonly` `optional` **tls\_client\_certificate\_bound\_access\_tokens**: `boolean`

Boolean value indicating protected resource support for mutual-TLS client certificate-bound
access tokens
