# Variable: experimental\_customFetch

[💗 Help the project](https://github.com/sponsors/panva)

• `Const` **experimental\_customFetch**: typeof [`experimental_customFetch`](experimental_customFetch.md)

This is an experimental feature, it is not subject to semantic versioning rules. Non-backward
compatible changes or removal may occur in any future release.

When configured on an interface that extends [HttpRequestOptions](../interfaces/HttpRequestOptions.md), that's every `options`
parameter for functions that trigger HTTP Requests, this replaces the use of global fetch. As a
fetch replacement the arguments and expected return are the same as fetch.

In theory any module that claims to be compatible with the Fetch API can be used but your mileage
may vary. No workarounds to allow use of non-conform Responses will be considered.

If you only need to update the Request properties you do not need to use a Fetch API
module, just change what you need and pass it to globalThis.fetch just like this module would
normally do.

Its intended use cases are:

- Request/Response tracing and logging
- Custom caching strategies for responses of Authorization Server Metadata and JSON Web Key Set
  (JWKS) endpoints
- Changing the Request properties like headers, body, credentials, mode before it is passed
  to fetch

Known caveats:

- Expect Type-related issues when passing the inputs through to fetch-like modules, they hardly
  ever get their typings inline with actual fetch, you should `@ts-expect-error` them.
- Returning self-constructed Response instances prohibits AS-signalled DPoP Nonce caching.

**`Example`**

Using [sindresorhus/ky](https://github.com/sindresorhus/ky) hooks feature for logging outgoing
requests and their responses.

```js
import ky from 'ky'
import * as oauth from 'oauth4webapi'

// example use
await oauth.discoveryRequest(new URL('https://as.example.com'), {
  [oauth.experimental_customFetch]: (...args) =>
    ky(args[0], {
      ...args[1],
      hooks: {
        beforeRequest: [
          (request) => {
            logRequest(request)
          },
        ],
        beforeRetry: [
          ({ request, error, retryCount }) => {
            logRetry(request, error, retryCount)
          },
        ],
        afterResponse: [
          (request, _, response) => {
            logResponse(request, response)
          },
        ],
      },
    }),
})
```

**`Example`**

Using [nodejs/undici](https://github.com/nodejs/undici) for mocking.

```js
import * as undici from 'undici'
import * as oauth from 'oauth4webapi'

const mockAgent = new undici.MockAgent()
mockAgent.disableNetConnect()
undici.setGlobalDispatcher(mockAgent)

// continue as per undici documentation
// https://github.com/nodejs/undici/blob/v6.2.1/docs/api/MockAgent.md#example---basic-mocked-request

// example use
await oauth.discoveryRequest(new URL('https://as.example.com'), {
  [oauth.experimental_customFetch]: undici.fetch,
})
```
