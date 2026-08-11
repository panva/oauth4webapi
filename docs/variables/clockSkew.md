# Variable: clockSkew

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• `const` **clockSkew**: unique `symbol`

Adjusts the current time used by protocol validations.

Positive and negative finite values representing seconds are allowed. Default is `0`, so the
current time is not adjusted.

## Examples

When the local clock is mistakenly 1 hour in the past

```ts
let client: oauth.Client = {
  client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
  // ... other metadata
  [oauth.clockSkew]: +(60 * 60),
}
```

When the local clock is mistakenly 1 hour in the future

```ts
let client: oauth.Client = {
  client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
  // ... other metadata
  [oauth.clockSkew]: -(60 * 60),
}
```
