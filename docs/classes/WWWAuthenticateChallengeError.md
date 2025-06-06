# Class: WWWAuthenticateChallengeError

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

Thrown when a server responds with a parseable WWW-Authenticate challenges, typically because of
expired tokens, or bad client authentication

## Example

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer error="invalid_token", error_description="The access token expired"
```

## Properties

### cause

• **cause**: [`WWWAuthenticateChallenge`](../interfaces/WWWAuthenticateChallenge.md)[]

The parsed WWW-Authenticate HTTP Header challenges

***

### code

• **code**: `"OAUTH_WWW_AUTHENTICATE_CHALLENGE"`

***

### response

• **response**: [`Response`](https://developer.mozilla.org/docs/Web/API/Response)

The [Response](https://developer.mozilla.org/docs/Web/API/Response) that included a WWW-Authenticate HTTP Header challenges, its
[Response.bodyUsed](https://developer.mozilla.org/docs/Web/API/Response/bodyUsed) is `false`

***

### status

• **status**: `number`

HTTP Status Code of the response
