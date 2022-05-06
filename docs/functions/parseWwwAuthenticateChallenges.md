# Function: parseWwwAuthenticateChallenges

[💗 Help the project](https://github.com/sponsors/panva)

▸ **parseWwwAuthenticateChallenges**(`response`): [`WWWAuthenticateChallenge`](../interfaces/WWWAuthenticateChallenge.md)[] \| `undefined`

Parses the `WWW-Authenticate` HTTP Header from a
[Fetch API Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `response` | `Response` | [Fetch API Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) |

#### Returns

[`WWWAuthenticateChallenge`](../interfaces/WWWAuthenticateChallenge.md)[] \| `undefined`

Array of [WWWAuthenticateChallenge](../interfaces/WWWAuthenticateChallenge.md) objects. Their order from
the response is preserved.
