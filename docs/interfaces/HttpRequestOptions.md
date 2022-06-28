# Interface: HttpRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [headers](HttpRequestOptions.md#headers)
- [signal](HttpRequestOptions.md#signal)

## Properties

### headers

• `Optional` **headers**: `Headers`

A [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers)
instance to additionally send with the HTTP Request(s) triggered by this
functions invocation.

___

### signal

• `Optional` **signal**: `AbortSignal` \| () => `AbortSignal`

An [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
instance, or a factory returning one, to abort the underlying fetch requests.

**`example`** A 5000ms timeout AbortSignal for every request
```js
const signal = () => AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```
