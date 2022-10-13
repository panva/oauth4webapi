# Interface: ProcessRefreshTokenResponseOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [headers](ProcessRefreshTokenResponseOptions.md#headers)
- [signal](ProcessRefreshTokenResponseOptions.md#signal)
- [skipJwtSignatureCheck](ProcessRefreshTokenResponseOptions.md#skipjwtsignaturecheck)

## Properties

### headers

• `Optional` **headers**: [`Headers`]( https://developer.mozilla.org/en-US/docs/Web/API/Headers )

A Headers instance to additionally send with the HTTP Request(s) triggered by this function's
invocation.

___

### signal

• `Optional` **signal**: [`AbortSignal`]( https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal ) \| () => [`AbortSignal`]( https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal )

An AbortSignal instance, or a factory returning one, to abort the HTTP Request(s) triggered by
this function's invocation.

**`example`** A 5000ms timeout AbortSignal for every request

```js
const signal = () => AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```

___

### skipJwtSignatureCheck

• `Optional` **skipJwtSignatureCheck**: `boolean`

DANGER ZONE

When JWT assertions are received via direct communication between the Client and the
Token/UserInfo/Introspection endpoint (which they are in this library's supported profiles and
exposed functions) the TLS server validation MAY be used to validate the issuer in place of
checking the assertion's signature.

Set this to `true` to omit verifying the JWT assertion's signature (e.g. ID Token, JWT Signed
Introspection, or JWT Signed UserInfo Response).

Setting this to `true` also means that:

- The Authorization Server's JSON Web Key Set will not be requested. That is useful for
  javascript runtimes that execute on the edge and cannot reliably share an in-memory cache of
  the JSON Web Key Set in between invocations.
- Any JWS Algorithm may be used, not just the [supported ones](../types/JWSAlgorithm.md).

Default is `false`.
