# Function: parseWwwAuthenticateChallenges()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **parseWwwAuthenticateChallenges**(`response`): [`WWWAuthenticateChallenge`](../interfaces/WWWAuthenticateChallenge.md)[] \| `undefined`

Parses the `WWW-Authenticate` HTTP Header from a [Response](https://developer.mozilla.org/docs/Web/API/Response) instance.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `response` | [`Response`](https://developer.mozilla.org/docs/Web/API/Response) |

## Returns

[`WWWAuthenticateChallenge`](../interfaces/WWWAuthenticateChallenge.md)[] \| `undefined`

Array of [WWWAuthenticateChallenge](../interfaces/WWWAuthenticateChallenge.md) objects. Their order from the response is
  preserved. `undefined` when there wasn't a `WWW-Authenticate` HTTP Header returned.
