# Interface: CustomFetchOptions\<Method, BodyType\>

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `Method` | - |
| `BodyType` | `undefined` |

## Properties

### body

• **body**: `BodyType`

The request body content to send to the server

***

### headers

• **headers**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

HTTP Headers

***

### method

• **method**: `Method`

The [request method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)

***

### redirect

• **redirect**: `"manual"`

See [Request.redirect](https://developer.mozilla.org/docs/Web/API/Request/redirect)

***

### signal?

• `optional` **signal**: [`AbortSignal`](https://developer.mozilla.org/docs/Web/API/AbortSignal)

Depending on whether [HttpRequestOptions.signal](HttpRequestOptions.md#signal) was used, if so, it is the value passed,
otherwise undefined
