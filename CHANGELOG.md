# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.8.5](https://github.com/panva/oauth4webapi/compare/v3.8.4...v3.8.5) (2026-02-16)


### Refactor

* account for an upcoming Web Cryptography change ([ac13290](https://github.com/panva/oauth4webapi/commit/ac1329027a798d96ea8f6c243aac1c70d009ff05))

## [3.8.4](https://github.com/panva/oauth4webapi/compare/v3.8.3...v3.8.4) (2026-02-07)


### Fixes

* use duplex: half for resourceRequest with ReadableStream body input ([34f01d4](https://github.com/panva/oauth4webapi/commit/34f01d48405b25bdfe5381729450df52f9d3b198))

## [3.8.3](https://github.com/panva/oauth4webapi/compare/v3.8.2...v3.8.3) (2025-11-20)


### Refactor

* relax www-authenticate auth-param presence requirement ([35d4622](https://github.com/panva/oauth4webapi/commit/35d4622ad02598198039cf0f7f5ef10bc5e9448a))

## [3.8.2](https://github.com/panva/oauth4webapi/compare/v3.8.1...v3.8.2) (2025-09-27)


### Documentation

* remove mention of Edge Runtime from the readme ([313c263](https://github.com/panva/oauth4webapi/commit/313c26315cc3422162148531f48c919b0d2fa5af))


### Refactor

* workaround dpop nonce caching caveats with customFetch ([e201d3a](https://github.com/panva/oauth4webapi/commit/e201d3a3b620d95b5d874fd2a232abad42afca37))

## [3.8.1](https://github.com/panva/oauth4webapi/compare/v3.8.0...v3.8.1) (2025-08-29)


### Fixes

* **DPoP:** add header JWK alg and pub when using ML-DSA keys ([90a702e](https://github.com/panva/oauth4webapi/commit/90a702ed57fb5280416dcf509c738d3ac8b2dac7))

## [3.8.0](https://github.com/panva/oauth4webapi/compare/v3.7.0...v3.8.0) (2025-08-27)


### Features

* support ML-DSA JWS Algorithm Identifiers ([5e9e629](https://github.com/panva/oauth4webapi/commit/5e9e6293d97db96942019b72d860a746293fc20b))

## [3.7.0](https://github.com/panva/oauth4webapi/compare/v3.6.2...v3.7.0) (2025-08-12)


### Features

* optional recognition of proprietary or unrecognized token types ([c875d5a](https://github.com/panva/oauth4webapi/commit/c875d5ab758ec4d40184607704251483722842ff))

## [3.6.2](https://github.com/panva/oauth4webapi/compare/v3.6.1...v3.6.2) (2025-08-08)


### Refactor

* skip checking www-authenticate if expected status is received ([596ae33](https://github.com/panva/oauth4webapi/commit/596ae332840870561fc0c204e9226a17344a7b33)), closes [#191](https://github.com/panva/oauth4webapi/issues/191)

## [3.6.1](https://github.com/panva/oauth4webapi/compare/v3.6.0...v3.6.1) (2025-08-01)


### Fixes

* allow 0 in auth_time ([3b9db46](https://github.com/panva/oauth4webapi/commit/3b9db46c69c2cca069e439ffc62ee9c64e44e3db))

## [3.6.0](https://github.com/panva/oauth4webapi/compare/v3.5.5...v3.6.0) (2025-07-16)


### Features

* add request's url as a signal function option argument ([aab6c30](https://github.com/panva/oauth4webapi/commit/aab6c30b78301b0cb47ead6729fb2c627a8aec9c))


### Fixes

* allow 0 in max_age and expires_in ([15c0c50](https://github.com/panva/oauth4webapi/commit/15c0c50f41c8bc2be3b762cde1c7b4df1b9a7d9f)), closes [#182](https://github.com/panva/oauth4webapi/issues/182)


### Refactor

* update signal() resolver for new Deno check rules ([4791e9c](https://github.com/panva/oauth4webapi/commit/4791e9cdda3a43931a6ccabfc83329400327e0af))

## [3.5.5](https://github.com/panva/oauth4webapi/compare/v3.5.4...v3.5.5) (2025-07-01)


### Fixes

* **RFC9728:** keep any terminating "/" when pathname is present ([f951e73](https://github.com/panva/oauth4webapi/commit/f951e7344848abc5b00f0fa6013431db18cf9dd0))

## [3.5.4](https://github.com/panva/oauth4webapi/compare/v3.5.3...v3.5.4) (2025-07-01)


### Fixes

* **RFC8414:** strip any terminating "/" when pathname is present ([50d8307](https://github.com/panva/oauth4webapi/commit/50d8307a8745ed9cdf836974e0cad39f7f76b031))

## [3.5.3](https://github.com/panva/oauth4webapi/compare/v3.5.2...v3.5.3) (2025-06-17)


### Refactor

* expose internal symbol to skip use of PKCE for authorization code flow ([d5748d0](https://github.com/panva/oauth4webapi/commit/d5748d078f49d2c8d9a03e869193d3de0b6bc96b)), closes [#176](https://github.com/panva/oauth4webapi/issues/176)
* handle older WebOS runtimes' Header constructors ([b37330f](https://github.com/panva/oauth4webapi/commit/b37330ffab5ac3a9468c1e5f94c482326fc20e3a)), closes [#178](https://github.com/panva/oauth4webapi/issues/178)

## [3.5.2](https://github.com/panva/oauth4webapi/compare/v3.5.1...v3.5.2) (2025-06-08)


### Documentation

* use GitHub Flavored Markdown for notes and warnings ([d82e083](https://github.com/panva/oauth4webapi/commit/d82e08356a1f8d70322a0fdddfd17fecc411876a))


### Refactor

* use native Uint8Array<->base64 when available in the runtime ([456ba67](https://github.com/panva/oauth4webapi/commit/456ba6796dacdde287c0f2f875dd6c4996a645c9))

## [3.5.1](https://github.com/panva/oauth4webapi/compare/v3.5.0...v3.5.1) (2025-05-06)


### Documentation

* correct note about bodyUsed in ResponseBodyError and WWWAuthenticateChallengeError ([adaa6fe](https://github.com/panva/oauth4webapi/commit/adaa6fef6a9c93e1d1204185e7f337da4f71338e))
* fix url to IANA OAuth Protected Resource Metadata registry ([d7baf99](https://github.com/panva/oauth4webapi/commit/d7baf99efff89538fba14ef3795f80c5d4ae535b))
* fix WWWAuthenticateChallengeParameters.algs description to be space-delimited ([adae79f](https://github.com/panva/oauth4webapi/commit/adae79f66213db069c5249040487794a794036af))
* remove newline from www-authenticate http example ([9234699](https://github.com/panva/oauth4webapi/commit/923469964425daca328b6a20595c45fcfdfff2ae))
* update Protected Resource Metadata spec links to RFC 9728 ([1836968](https://github.com/panva/oauth4webapi/commit/183696807f153dd962f4cfd63e1849a508d7f4a1))


### Refactor

* expose more internal helpers for openid-client to use ([dc00001](https://github.com/panva/oauth4webapi/commit/dc00001d2f6573537bf4921a72e4d59c2f6cdd2f))

## [3.5.0](https://github.com/panva/oauth4webapi/compare/v3.4.1...v3.5.0) (2025-04-14)


### Features

* support for RFC-to-be 9728 - OAuth 2.0 Protected Resource Metadata ([eef0d7d](https://github.com/panva/oauth4webapi/commit/eef0d7d57899ad5741b9ddfbbf41ce598797e2bb))


### Documentation

* add descriptions to dynamicClientRegistrationRequest params ([1244b00](https://github.com/panva/oauth4webapi/commit/1244b001df1f676d4dce49ffa9d78becef5e71a5))
* add mentions of the respective process* method for Response-resolving methods ([545f9ea](https://github.com/panva/oauth4webapi/commit/545f9ead8fc92d57763f8beacca696de4beda173))
* add Protected Resource Metadata related AS Metadata and WWWAuthenticate params ([1644494](https://github.com/panva/oauth4webapi/commit/1644494d995629e11dae3f773c46ddb02ee11aa3))
* fixup DPoP references, add WWW-Authenticate parameter descriptions ([fedb5cd](https://github.com/panva/oauth4webapi/commit/fedb5cd4e2267f14984cdf512807dc5a98338887))


### Refactor

* DRY Response JSON parsing ([8a3e554](https://github.com/panva/oauth4webapi/commit/8a3e5548a4cbb95b050e8007962552840b62e5b5))

## [3.4.1](https://github.com/panva/oauth4webapi/compare/v3.4.0...v3.4.1) (2025-04-10)


### Documentation

* hardcode spec revision links (e.g. final or errata) ([b6911c4](https://github.com/panva/oauth4webapi/commit/b6911c4f54f990d761bb88875dca11f63be56519))


### Fixes

* properly handle a number of edge-cases in www-authenticate header parsing ([c380dd2](https://github.com/panva/oauth4webapi/commit/c380dd2ed6612edaae9e36611f40f24ca1056166))

## [3.4.0](https://github.com/panva/oauth4webapi/compare/v3.3.2...v3.4.0) (2025-04-03)


### Features

* add support for Dynamic Client Registration ([461c101](https://github.com/panva/oauth4webapi/commit/461c1012d81efb1ca073dac750be7be169d4507f))


### Refactor

* remove private API from exported types ([847046b](https://github.com/panva/oauth4webapi/commit/847046b993c55cc19349813c2a2b2e06c349f750))


### Fixes

* handle max_age=0 in issueRequestObject() ([b802645](https://github.com/panva/oauth4webapi/commit/b80264516e8543ea197db1322cae76a718257f27))

## [3.3.2](https://github.com/panva/oauth4webapi/compare/v3.3.1...v3.3.2) (2025-03-28)


### Documentation

* consistent DPoP Proof capitalization ([7eff4c5](https://github.com/panva/oauth4webapi/commit/7eff4c51cb36859a85d4e46d074b96de8fc15014))
* drop cdnjs and denoland/x links in README ([63acb25](https://github.com/panva/oauth4webapi/commit/63acb25992e0fa40a108c2469db4467b984264a9))


### Refactor

* allow externally formed DPoP headers ([5b5064d](https://github.com/panva/oauth4webapi/commit/5b5064d42f51a8e23a7e9404455937a73cd61e1c))
* remove an always false switch case ([4096393](https://github.com/panva/oauth4webapi/commit/4096393a57396c98d20cdf523e66fc8647ad2c65))

## [3.3.1](https://github.com/panva/oauth4webapi/compare/v3.3.0...v3.3.1) (2025-03-10)


### Documentation

* add note about minimal Node.js version to README.md ([1d4e703](https://github.com/panva/oauth4webapi/commit/1d4e703ee3faf9fce23ac20f1f178d0cd5c58d43))
* bump typedoc ([589409a](https://github.com/panva/oauth4webapi/commit/589409afa56dafbed59cbbfa54561d54f12d5d37))


### Refactor

* reusable error handling routines ([1d1e23b](https://github.com/panva/oauth4webapi/commit/1d1e23bfbe7886a654f79c05a891bd65ea74ac82))
* **types:** update overload signature of b64u ([bd28fcb](https://github.com/panva/oauth4webapi/commit/bd28fcbd764b12981809ebf235bb25160153ac89))

## [3.3.0](https://github.com/panva/oauth4webapi/compare/v3.2.0...v3.3.0) (2025-02-18)


### Features

* add a helper to DPoPHandle to calculate dpop_jkt ([2b8d9e7](https://github.com/panva/oauth4webapi/commit/2b8d9e70533f1de90f622f9c4f8915ac1c6350fd))


### Documentation

* update CIBA group tags ([318edce](https://github.com/panva/oauth4webapi/commit/318edce60377cd32bf2b09f9ade74cc372315606))
* update getValidatedIdTokenClaims description ([15836c5](https://github.com/panva/oauth4webapi/commit/15836c5c9c4545f68b97ca218d211ab34e7affa8))
* update getValidatedIdTokenClaims description ([9e13fb6](https://github.com/panva/oauth4webapi/commit/9e13fb60a476fc9e0d596c2b95c56fb0e5d83f3d))
* update getValidatedIdTokenClaims group tags ([ea30884](https://github.com/panva/oauth4webapi/commit/ea308848afec7dd28f996db762a0e5c8cb50e602))
* update JWT Introspection Response references to RFC 9701 ([1cf0cca](https://github.com/panva/oauth4webapi/commit/1cf0cca63e290afb3bc4261a820559dbc0ecf54d))

## [3.2.0](https://github.com/panva/oauth4webapi/compare/v3.1.5...v3.2.0) (2025-02-17)


### Features

* add Client-Initiated Backchannel Authentication ([3af0ec3](https://github.com/panva/oauth4webapi/commit/3af0ec3c2c4e13ea2915731fcd79103bdb3c5d9c))


### Documentation

* update deviceCodeGrantRequest ([f947b47](https://github.com/panva/oauth4webapi/commit/f947b473cdf259474d541aaa9bfb131b615878b6))

## [3.1.5](https://github.com/panva/oauth4webapi/compare/v3.1.4...v3.1.5) (2025-02-15)


### Refactor

* assert success content-type only if JSON parsing fails ([1fe8f48](https://github.com/panva/oauth4webapi/commit/1fe8f48d8b10848206b8f51c2f9eb1c4afb574b0))

## [3.1.4](https://github.com/panva/oauth4webapi/compare/v3.1.3...v3.1.4) (2024-12-02)


### Refactor

* **types:** move customFetch options into its own interface ([21c7d0a](https://github.com/panva/oauth4webapi/commit/21c7d0a0b9dc4375c05d5334777e939b3da8514f))

## [3.1.3](https://github.com/panva/oauth4webapi/compare/v3.1.2...v3.1.3) (2024-11-15)


### Refactor

* more descriptive "not a conform" message ([0295887](https://github.com/panva/oauth4webapi/commit/02958874d0e03f13bbf95e9ef2a78cea3241a4bd))

## [3.1.2](https://github.com/panva/oauth4webapi/compare/v3.1.1...v3.1.2) (2024-10-24)


### Refactor

* shake the supported function when not needed ([c390093](https://github.com/panva/oauth4webapi/commit/c390093beea6ee6e0ed1cf0276ea43c0758c6555))
* **types:** update indexable on MTLSEndpointAliases to be a string ([a405c89](https://github.com/panva/oauth4webapi/commit/a405c898a11110527a771ac41d1e6c1c289ec85e))

## [3.1.1](https://github.com/panva/oauth4webapi/compare/v3.1.0...v3.1.1) (2024-10-14)


### Refactor

* simpler consume of Request bodies ([bcf0b86](https://github.com/panva/oauth4webapi/commit/bcf0b86d61080892a7de1ddb10df037da0cfb893))

## [3.1.0](https://github.com/panva/oauth4webapi/compare/v3.0.1...v3.1.0) (2024-10-14)


### Features

* add support for form_post Request instance in hybrid response mode validate response functions ([5e22d9d](https://github.com/panva/oauth4webapi/commit/5e22d9d1afb45d1ffe4f9199b1ff8895392f92c0))

## [3.0.1](https://github.com/panva/oauth4webapi/compare/v3.0.0...v3.0.1) (2024-10-13)


### Refactor

* gracefully handle non-number expires_in ([c7cc858](https://github.com/panva/oauth4webapi/commit/c7cc8588bd77cffc70b25c91b1f2d3c2cc006aa2)), closes [#47](https://github.com/panva/oauth4webapi/issues/47) [#71](https://github.com/panva/oauth4webapi/issues/71) [#77](https://github.com/panva/oauth4webapi/issues/77) [#112](https://github.com/panva/oauth4webapi/issues/112)
* update assertCryptoKey error message ([999a373](https://github.com/panva/oauth4webapi/commit/999a373c7ac2fd5c325f44156f0b23853542daec))

## [3.0.0](https://github.com/panva/oauth4webapi/compare/v2.17.0...v3.0.0) (2024-10-07)


### ⚠ BREAKING CHANGES

* build target is now ES2022
* jweDecrypt is no longer an allowed symbol on the Client
interface, it is instead an option passed to functions that may
encounter encrypted assertions
* specifying Ed448 curve for EdDSA is no longer
supported, EdDSA is now just an alias for the fully-specified Ed25519
JWS algorithm
* assertions signed with an Ed25519 CryptoKey will now
use the Ed25519 JWS alg value instead of EdDSA. This can be reverted
using the modifyAssertion symbol export
* the audience of a Private Key JWT and Client Secret JWT
client assertions is now just the issuer identifier
* remove modifyAssertion from the PrivateKey interface
* optional (non-repudiation) signature validation of
ID Token JWS Signatures is now done the same way as JWT UserInfo and
JWT Introspection is done, with a Response instance rather than a
TokenEndpointResponse object
* validateJwtIntrospectionSignature is now validateApplicationLevelSignature
* validateJwtUserInfoSignature is now validateApplicationLevelSignature
* validateIdTokenSignature is now validateApplicationLevelSignature
* DPoP request options are now obtained by calling the
`DPoP()` exported function. This returns a handle that also maintains
its own LRU nonce caches
* client authentication is now an explicit argument to authenticated functions
* `processAuthorizationCodeOpenIDResponse()` method was
removed in favour of `processAuthorizationCodeResponse()`
* `processAuthorizationCodeOAuth2Response()` method was
removed in favour of `processAuthorizationCodeResponse()`
* All grant functions that execute against the Token
Endpoint will now validate ID Token when there is one in the response.
This has already been the behaviour of functions such as `processRefreshTokenResponse()`
or `processDeviceCodeResponse()`
* Presence of `auth_time` is now required in all
ID Tokens if client.default_auth_time is set
* encode client_secret_basic - _ . ! ~ * ' ( ) characters
* remove all deprecated options
* remove the useMtlsAlias symbol and options
* all functions now reject interacting with non-TLS HTTP
endpoints. You can use the `allowInsecureRequests` in the
`HttpRequestOptions` interface to revert this behaviour.
* removed the `isOAuth2Error()` helper, all functions that
used to possibly return an OAuth2Error now reject with
ResponseBodyError or AuthorizationResponseError instead
* removed `parseWwwAuthenticateChallenges()`, all
functions verify process `Response` now reject with
`WWWAuthenticateChallengeError` instead
* removed `protectedResourceRequest()` now rejects with
`WWWAuthenticateChallengeError` when the Response has one

### Features

* add a counterpart process method to genericTokenEndpointRequest ([848f3f6](https://github.com/panva/oauth4webapi/commit/848f3f62a2bd679f5bb1dce074b0ec9aec410950))
* add a helper function for DPoP retry management ([06493e3](https://github.com/panva/oauth4webapi/commit/06493e366c423fc5e8957199c09d06d40d0fdd6d))
* add support for client_secret_jwt ([cf85fd6](https://github.com/panva/oauth4webapi/commit/cf85fd6c23dea46d6e48f973fe7bb8601f034d6b))
* add support for code id_token response without FAPI 1.0 s_hash ([eebb4f1](https://github.com/panva/oauth4webapi/commit/eebb4f1e884bf229975729f6d7cc96441331e3bb))
* add unified authorization code method ([07d4ff9](https://github.com/panva/oauth4webapi/commit/07d4ff963fdd8c479fbfea30ce2cd1c70c9669f5))
* allow setting expected JWT algorithms in validateJwtAccessToken ([8f20f91](https://github.com/panva/oauth4webapi/commit/8f20f9158074bca540a407bbcadd7b1815411a94))


### Fixes

* encode client_secret_basic - _ . ! ~ * ' ( ) characters ([cd5bbc1](https://github.com/panva/oauth4webapi/commit/cd5bbc1efce400ef70b26c660d10440b6bdbb268))
* **types:** infer CryptoKey type for @types/node types' sake ([d126f1f](https://github.com/panva/oauth4webapi/commit/d126f1f825185aec1118a7e80479d0489c5f0bcc))


### Documentation

* add more examples ([dcaf056](https://github.com/panva/oauth4webapi/commit/dcaf056d4e7f20c2df06d96ede3a74c64fec833b))
* export and document error codes ([364cbd8](https://github.com/panva/oauth4webapi/commit/364cbd894a7c38552204ba98787b1d3bac2ad610))
* hide the error constructors ([a1cb7f8](https://github.com/panva/oauth4webapi/commit/a1cb7f8f0704455f7890f95e9f058b6834fe1399))
* minor touch ups ([fee6790](https://github.com/panva/oauth4webapi/commit/fee6790014a65a09269089f8ef40bb7f68e1f3e5))
* re-generate API reference docs ([c4a7f64](https://github.com/panva/oauth4webapi/commit/c4a7f64abaa508eb3ab0f9c0f50d977899c4f95f))
* update client auth method docs ([ef8fe9f](https://github.com/panva/oauth4webapi/commit/ef8fe9f4d51b178d86f1fecf7c727e5542ee5052))
* update examples due to changes ([f24b39d](https://github.com/panva/oauth4webapi/commit/f24b39d945087ed9d9753cd1b801fd3ad541e7c5))
* update examples due to changes ([fcd3c3e](https://github.com/panva/oauth4webapi/commit/fcd3c3e57e45d95b5c5b59f300003f6f1a1bb3a4))
* update groups, properties ([329876a](https://github.com/panva/oauth4webapi/commit/329876a61c2751a9f36ac10884983fc56c2fa2fb))
* update inline examples ([33ee2b0](https://github.com/panva/oauth4webapi/commit/33ee2b0e56a50f3464ee70f9bde2d2e9b8a1fd40))
* update README.md ([0bd2e56](https://github.com/panva/oauth4webapi/commit/0bd2e569940491fb66263ce8058e8a79e297c190))
* update several examples and add descriptions to DAG ([dd99b9a](https://github.com/panva/oauth4webapi/commit/dd99b9a2a676cc5b93c1fddde28f3c3df26099bd))


### Refactor

* add a source map, update pkg exports ([0232cf2](https://github.com/panva/oauth4webapi/commit/0232cf29f2a62a1ef4e59b46726160ef4c0c471b))
* add causes and codes to "is not a conform" errors ([a0b19c5](https://github.com/panva/oauth4webapi/commit/a0b19c5e9601d3c55630068c6f52ddd019c20097))
* add claim/attribute names to error reasons ([fe11bdc](https://github.com/panva/oauth4webapi/commit/fe11bdcea1b8398342bcbbbc52401fc609128eb5))
* add more error messages and update codes ([038b44a](https://github.com/panva/oauth4webapi/commit/038b44aa27a25a6869d3d25cff767b29d8b9724f))
* add OperationProcessingError code and cause when wrong callback method is used ([9d4c546](https://github.com/panva/oauth4webapi/commit/9d4c546da4fee17e732507ed8dc25901919767b1))
* added codes and reasons to as many errors as possible ([bce81b4](https://github.com/panva/oauth4webapi/commit/bce81b423c85746ff5a18a0abd6d2d85aeb2088e))
* allow and document tls client auth methods ([f0e7919](https://github.com/panva/oauth4webapi/commit/f0e791936f7e4b2bc235e956451a467abf41ac45))
* better type for oauth.customFetch implementations, updated examples ([a06efb5](https://github.com/panva/oauth4webapi/commit/a06efb558db60a714737887e3eb62898db08d1ed))
* build target is now ES2022 ([8af3e9f](https://github.com/panva/oauth4webapi/commit/8af3e9f30a5e01ce25dad5e310830b04fb0a5d24))
* changed the default client authentication ([4fe3f2c](https://github.com/panva/oauth4webapi/commit/4fe3f2cf08ab0a3a6a2f1c32deb332dbfca9eded))
* client authentication is now an explicit argument to authenticated functions ([cefcf32](https://github.com/panva/oauth4webapi/commit/cefcf32eb26ca135b35ef39267e4e57da2fee2cd))
* future proof Ed25519 ([ac0550d](https://github.com/panva/oauth4webapi/commit/ac0550de0ca589f04edffa864b6bdb9cf7a102ba))
* improve tree-shaking of JWT claims verification ([60b7dcf](https://github.com/panva/oauth4webapi/commit/60b7dcf204e4fbb42e2851e94275f46a8573e394))
* jweDecrypt is now an option on the functions that support it ([d7e8482](https://github.com/panva/oauth4webapi/commit/d7e84822d58cb2581db87a9d950bc8f1701cc81c))
* keep all OAuthError properties ([fce528e](https://github.com/panva/oauth4webapi/commit/fce528eedbef9f0e0482ed4f0791f2c6398bbb4e))
* make DPoP implementation tree-shakeable ([1fca2a3](https://github.com/panva/oauth4webapi/commit/1fca2a30ea8a20e48f3a7f64f6917cb4c7502753))
* private_key_jwt audience is now only the issuer identifier ([f388ba8](https://github.com/panva/oauth4webapi/commit/f388ba8c890f6227ef0b7d7fc42a4e0ba35c6bf9))
* push id token required claims straight to jwt validation ([ec45b61](https://github.com/panva/oauth4webapi/commit/ec45b61d8ada300845b56c0b9c413fb76a7b48a2))
* reject requests to non-HTTPS endpoints by default ([4829da6](https://github.com/panva/oauth4webapi/commit/4829da646e930f225732ec6a8e57721c103299b3))
* remove all deprecated options ([137a547](https://github.com/panva/oauth4webapi/commit/137a5478a5e9e1b12cf9db81df4b6fccdf219481))
* remove modifyAssertion from the PrivateKey interface ([4d8b9e8](https://github.com/panva/oauth4webapi/commit/4d8b9e8929faa44ca44bb41a80573ac6599c706a))
* remove the useMtlsAlias symbol and options ([cd5ed0d](https://github.com/panva/oauth4webapi/commit/cd5ed0d6af36dc470c692029b8f9d0e87f85cc36))
* remove the weird use of JWSAlgorithm type ([970e3b6](https://github.com/panva/oauth4webapi/commit/970e3b6fc5bfc624e569a1c782b05d6d845220d7))
* removed the parseWwwAuthenticateChallenges export ([5fa774d](https://github.com/panva/oauth4webapi/commit/5fa774dac7c19bdf1af512de887423738e0ee39a))
* resolve only successful responses ([0f8bcc3](https://github.com/panva/oauth4webapi/commit/0f8bcc30bec35b6fc9cdb4639448d3bfc18888be))
* unify validating endpoints and checking their protocols ([e16254f](https://github.com/panva/oauth4webapi/commit/e16254f154a64ecf9e78f94bc6285b6f630b3b84))
* update the CryptoKey workarounds without affecting docs ([0d3b05a](https://github.com/panva/oauth4webapi/commit/0d3b05a01d994507a82c703d27401bf1b428ec09))
* userInfoRequest should not reject www-authenticate ([e373ec3](https://github.com/panva/oauth4webapi/commit/e373ec3a9616f5ce5c5264293cc398b2537b676b))
* validating ID Token signatures is now done with a Response ([d71bc2c](https://github.com/panva/oauth4webapi/commit/d71bc2cc5777c5b261164ee23e9a04854daf5996))

## [2.17.0](https://github.com/panva/oauth4webapi/compare/v2.16.0...v2.17.0) (2024-09-22)


### Features

* support client use_mtls_endpoint_aliases metadata ([60c9df4](https://github.com/panva/oauth4webapi/commit/60c9df480bf0bac4d064f9ae8867e65a30ae8e8a))


### Documentation

* fix calculatePKCECodeChallenge description ([ac014f2](https://github.com/panva/oauth4webapi/commit/ac014f2882a82e1ef688c8542b09a0cab76dcffd))


### Refactor

* deprecate the useMtlsAlias symbol and options ([d2b7cb0](https://github.com/panva/oauth4webapi/commit/d2b7cb04481c6abaca9f22befa55b8a4ac355a41))
* use as Type for type assertions instead of <Type> ([a0ccf56](https://github.com/panva/oauth4webapi/commit/a0ccf568e6fcc11bc005a97b86e3b429ac3e86b4))

## [2.16.0](https://github.com/panva/oauth4webapi/compare/v2.15.0...v2.16.0) (2024-09-16)


### Features

* add a hook for decrypting JWE assertions ([62795a6](https://github.com/panva/oauth4webapi/commit/62795a6c1905cfbcbb19b4bd86e1eef2d773baa5))
* allow to modify issued JWT headers and payloads before signing ([30931ba](https://github.com/panva/oauth4webapi/commit/30931ba3cec58c6eaa6139734f1a399b34885a7c))


### Documentation

* update docs on useMtlsAlias ([006db55](https://github.com/panva/oauth4webapi/commit/006db55b3ddf6c4414edc21a5a9fbf358301192d))

## [2.15.0](https://github.com/panva/oauth4webapi/compare/v2.14.0...v2.15.0) (2024-09-15)


### Features

* support generic token endpoint grant requests ([2f454b5](https://github.com/panva/oauth4webapi/commit/2f454b5b304039d341e06c9cdd9d6cf63663648f))

## [2.14.0](https://github.com/panva/oauth4webapi/compare/v2.13.0...v2.14.0) (2024-09-15)


### Features

* add non-repudiation signature validation methods ([0916de2](https://github.com/panva/oauth4webapi/commit/0916de23c6daf93434592b1c181b27b4ed13a277))


### Documentation

* update JSDoc to use more link syntax ([d78f090](https://github.com/panva/oauth4webapi/commit/d78f090d430e7f351e33d55ac05db8e2c103d130))
* update various comments and documentation ([9c3f1ed](https://github.com/panva/oauth4webapi/commit/9c3f1ed50df50d10d098b0168fb1a481a0f713a0))

## [2.13.0](https://github.com/panva/oauth4webapi/compare/v2.12.2...v2.13.0) (2024-09-10)


### Features

* **build:** add jsr.io distribution ([dc6157f](https://github.com/panva/oauth4webapi/commit/dc6157fb24595b191a7fb3d2113c0db146798aad))

## [2.12.2](https://github.com/panva/oauth4webapi/compare/v2.12.1...v2.12.2) (2024-09-09)


### Refactor

* error msg when ID Token aud is an array and azp is missing ([68e0338](https://github.com/panva/oauth4webapi/commit/68e03389176c03bad9441767fc899e3d1ec98540))
* remove redundant checks ([763b3d0](https://github.com/panva/oauth4webapi/commit/763b3d021deaf1641d29964f865b101097973c86))


### Documentation

* remove non-described parameter JSDoc tags ([b1507b9](https://github.com/panva/oauth4webapi/commit/b1507b97e6d7bb443f8ff291a6bde4c1b15f8aee))
* update README.md ([9d1377b](https://github.com/panva/oauth4webapi/commit/9d1377b532008b502df8e9a9158c9315997ebf9a))

## [2.12.1](https://github.com/panva/oauth4webapi/compare/v2.12.0...v2.12.1) (2024-09-03)


### Fixes

* use correct "htm" in DPoP Proof via protectedResourceRequest ([3ce3be2](https://github.com/panva/oauth4webapi/commit/3ce3be2584f483feff49eebdf9225676af2c2182)), closes [#132](https://github.com/panva/oauth4webapi/issues/132)

## [2.12.0](https://github.com/panva/oauth4webapi/compare/v2.11.1...v2.12.0) (2024-08-19)


### Features

* graduate jwksCache to stable API ([0e0e1d2](https://github.com/panva/oauth4webapi/commit/0e0e1d2adf7f045ac29ad5df2db65496c95a88a0))


### Documentation

* move clockSkew and clockTolerance docs to the symbol ([3b5d2ea](https://github.com/panva/oauth4webapi/commit/3b5d2eacfa9c7606467507b4e2054655e4813cbb))
* update clockSkew and clockTolerance docs ([c97313a](https://github.com/panva/oauth4webapi/commit/c97313adc954890b6b292ce794bcb39ed0a8eac8))

## [2.11.1](https://github.com/panva/oauth4webapi/compare/v2.11.0...v2.11.1) (2024-06-20)


### Fixes

* allow ID Token auth_time to be present even if client.require_auth_time is false ([caa9ab3](https://github.com/panva/oauth4webapi/commit/caa9ab3233942faec8d1fcadcb26cd75bb3854cd))

## [2.11.0](https://github.com/panva/oauth4webapi/compare/v2.10.4...v2.11.0) (2024-06-19)


### Features

* add experimental support for edge compute runtimes JWKS caching ([15b7aff](https://github.com/panva/oauth4webapi/commit/15b7aff4575dc0f784f945ab3cfe7ada66c591a7))


### Refactor

* update maxAge option type check error message ([7fe3454](https://github.com/panva/oauth4webapi/commit/7fe34547e03b097d4ee9d59690033111c8df2549))


### Documentation

* clarify documentation is more an API Reference ([c96c8e0](https://github.com/panva/oauth4webapi/commit/c96c8e04065a16282dadde82828e77c23bb92c49))
* update example import ([651e8ea](https://github.com/panva/oauth4webapi/commit/651e8ea4edee5c1dba731615ffabb8fc2bc8b36e))
* updates for readability and consistency ([b1b8b7d](https://github.com/panva/oauth4webapi/commit/b1b8b7d35f6bedfd68f24d35b029ac474efa4608))

## [2.10.4](https://github.com/panva/oauth4webapi/compare/v2.10.3...v2.10.4) (2024-03-29)


### Refactor

* **types:** add explicit type to all exported functions ([76e8d19](https://github.com/panva/oauth4webapi/commit/76e8d19071733e65aae323232391a5716c34d401))
* **types:** add explicit type to all exported symbols ([c66c595](https://github.com/panva/oauth4webapi/commit/c66c595dcd57feae5d4184331b5ed1eb9cfa36fd))
* **types:** protectedResourceRequest method argument is just a string ([a15d76c](https://github.com/panva/oauth4webapi/commit/a15d76cdce58afaf4b65a0cdb95e1fb190927936))


### Documentation

* mention RFC 6750 in validateJwtAccessToken ([f61b68e](https://github.com/panva/oauth4webapi/commit/f61b68ef0971d8bfdff3bdd8a8fac3c85f7a1e08)), closes [#115](https://github.com/panva/oauth4webapi/issues/115)

## [2.10.3](https://github.com/panva/oauth4webapi/compare/v2.10.2...v2.10.3) (2024-02-07)


### Refactor

* make protectedResourceRequest headers argument optional ([bcbc872](https://github.com/panva/oauth4webapi/commit/bcbc8726265e98d8db87c3564e3725183dd8c9ee))


### Documentation

* update all examples ([cdcbbde](https://github.com/panva/oauth4webapi/commit/cdcbbdef6d94da9420b906d3dfb68bb618e4f9d7))

## [2.10.2](https://github.com/panva/oauth4webapi/compare/v2.10.0...v2.10.2) (2024-02-05)


### Fixes

* normalize authorization_details and max_age in issueRequestObject ([f8d267e](https://github.com/panva/oauth4webapi/commit/f8d267e2a876de01676d42d67a919044542fb13a))

## [2.10.0](https://github.com/panva/oauth4webapi/compare/v2.9.0...v2.10.0) (2024-02-04)


### Features

* **types:** add interfaces for RFC 9396 (Rich Authorization Requests) ([1c606ea](https://github.com/panva/oauth4webapi/commit/1c606eaf67707e05c71c2defa292d3e9d28b2e3a))


### Refactor

* some biome identified smells and less non-null assertions ([bc508f6](https://github.com/panva/oauth4webapi/commit/bc508f62725f7bea1a2bd5150434aed0764cbc13))


### Documentation

* update customFetch and useMtlsAlias a bit ([627e716](https://github.com/panva/oauth4webapi/commit/627e71689fa537293b0ce8538d7ed583f1783826))


### Fixes

* **types:** add missing and optional scope to interfaces ([5dc6d17](https://github.com/panva/oauth4webapi/commit/5dc6d17f78a94e29da7c4e950c0e9781cd4e025d))

## [2.9.0](https://github.com/panva/oauth4webapi/compare/v2.8.1...v2.9.0) (2024-02-02)


### Features

* graduate recently added experimental features to stable API ([94da0c9](https://github.com/panva/oauth4webapi/commit/94da0c940096ccc48d01d0998ae4326f7c209110))

## [2.8.1](https://github.com/panva/oauth4webapi/compare/v2.8.0...v2.8.1) (2024-01-24)


### Fixes

* check that DPoP Proof iat is recent enough ([a6159e3](https://github.com/panva/oauth4webapi/commit/a6159e3d35720e09d43735d13818bea69b399d26))

## [2.8.0](https://github.com/panva/oauth4webapi/compare/v2.7.0...v2.8.0) (2024-01-23)


### Features

* add experimental support for validating JWT Access Tokens ([f65deae](https://github.com/panva/oauth4webapi/commit/f65deae3a7a970f2808fa54896deac335f62d11b))

## [2.7.0](https://github.com/panva/oauth4webapi/compare/v2.6.0...v2.7.0) (2024-01-18)


### Features

* allow fragment response as URL in validateDetachedSignatureResponse ([bcbe2f5](https://github.com/panva/oauth4webapi/commit/bcbe2f5a58db2071b8dfa7f200b476ec99f18da4))

## [2.6.0](https://github.com/panva/oauth4webapi/compare/v2.5.0...v2.6.0) (2024-01-11)


### Features

* add experimental support for FAPI 1.0 ([6b6b496](https://github.com/panva/oauth4webapi/commit/6b6b4967bfd04d7c4193469f27e0fc5ffeaaf5b9))


### Refactor

* reorganize experimental features ([c8479b4](https://github.com/panva/oauth4webapi/commit/c8479b46f5ea154cfc25b8d4fc2bb3fb80860f32))


### Documentation

* update examples ([779cf60](https://github.com/panva/oauth4webapi/commit/779cf6063b8e4c58223c3904638b80e3930fac1a))

## [2.5.0](https://github.com/panva/oauth4webapi/compare/v2.4.5...v2.5.0) (2024-01-10)


### Features

* add experimental customize fetch option ([e98c1aa](https://github.com/panva/oauth4webapi/commit/e98c1aa02652a6deb9e07d9360070fba6d6aa85a)), closes [#94](https://github.com/panva/oauth4webapi/issues/94)
* add experimental support for mtls_endpoint_aliases ([f1cb365](https://github.com/panva/oauth4webapi/commit/f1cb365dbd1e0f74d88da4fe0a9f57d2112f5698))
* allow all of HeadersInit for HttpRequestOptions.headers ([a5fe73c](https://github.com/panva/oauth4webapi/commit/a5fe73cc56dcf0b3c9ec58f86019bb7d4afaeca2))


### Refactor

* fetch url resolution and validation ([b2e62a6](https://github.com/panva/oauth4webapi/commit/b2e62a6ce57f5a63cf09b5ce8a7cd062f1d370be))


### Documentation

* fix ToC anchors to symbol properties ([ed01dcf](https://github.com/panva/oauth4webapi/commit/ed01dcf75837566f00073c5ed3a87c446fa60d1d))
* return hierarchy to markdown docs ([7d3b414](https://github.com/panva/oauth4webapi/commit/7d3b41498a74c3e7b69d936e01ab30579aa5805d))

## [2.4.5](https://github.com/panva/oauth4webapi/compare/v2.4.4...v2.4.5) (2024-01-09)


### Fixes

* **DPoP:** clockSkew in ProtectedResourceRequestOptions is a unique Symbol ([1708f21](https://github.com/panva/oauth4webapi/commit/1708f215aa7a080f048b1b2f7eb2bc918dc130da))


### Documentation

* expose clock skew and tolerance documentation ([2d90c49](https://github.com/panva/oauth4webapi/commit/2d90c49cd8c4b76274516b580ed30111ae743ea6))

## [2.4.4](https://github.com/panva/oauth4webapi/compare/v2.4.3...v2.4.4) (2024-01-09)


### Fixes

* handle Response objects with empty string url in processDpopNonce ([f2c9415](https://github.com/panva/oauth4webapi/commit/f2c9415df06fbef4f4da9d5cfaee9e5336fb5eed))

## [2.4.3](https://github.com/panva/oauth4webapi/compare/v2.4.2...v2.4.3) (2024-01-06)

## [2.4.2](https://github.com/panva/oauth4webapi/compare/v2.4.1...v2.4.2) (2024-01-05)


### Documentation

* add distribution links to README.md ([29bb947](https://github.com/panva/oauth4webapi/commit/29bb947081fd533ad0562b0c219a231794663162))


### Fixes

* encode client_secret_basic - _ . ! ~ * ' ( ) characters ([f926175](https://github.com/panva/oauth4webapi/commit/f926175cdf6caa467029a57e76375054fff7c57b))

## [2.4.1](https://github.com/panva/oauth4webapi/compare/v2.4.0...v2.4.1) (2024-01-03)


### Refactor

* create Request instances before passing them to fetch ([02ab110](https://github.com/panva/oauth4webapi/commit/02ab1104cb334e27a10adcbd4f299e6622c134dd))
* **types:** mark always lowercased values and keys as Lowercase<string> ([89e7a77](https://github.com/panva/oauth4webapi/commit/89e7a77738f6069bf79b4ce9cbfdca99bdde0807))


### Documentation

* categorize APIs in docs/README.md ([c28efda](https://github.com/panva/oauth4webapi/commit/c28efda48a2632d3cd0bcf3ae676e5dc4dce2896))
* expose Indexed Access Types ([54c4393](https://github.com/panva/oauth4webapi/commit/54c4393f4da219c54e30539874a5aae61a53937a))
* update EdDSA description ([9765e7a](https://github.com/panva/oauth4webapi/commit/9765e7a9a0706f8e1ea8399b1cbe2ea9a1cf25f2))

## [2.4.0](https://github.com/panva/oauth4webapi/compare/v2.3.0...v2.4.0) (2023-11-15)


### Features

* add the cause property to errors where possible ([07c95f7](https://github.com/panva/oauth4webapi/commit/07c95f735a84ff614ad77f0ccaeb96df79720d6c))


### Refactor

* use AlgorithmIdentifier instead of Algorithm where possible ([e2ae2f3](https://github.com/panva/oauth4webapi/commit/e2ae2f3824bb5d0d98557c6ec30ff96353f538e8))


### Fixes

* base64url decode errors are OperationProcessingError ([7f4a878](https://github.com/panva/oauth4webapi/commit/7f4a8783f3db20fd44b027e30fa828fed5c7b753))

## [2.3.0](https://github.com/panva/oauth4webapi/compare/v2.2.4...v2.3.0) (2023-04-26)


### Features

* allow Record<string, string> and string[][] as parameter arguments ([021b85f](https://github.com/panva/oauth4webapi/commit/021b85fe27346089aa2380caf1073f2b1310de9b))

## [2.2.4](https://github.com/panva/oauth4webapi/compare/v2.2.3...v2.2.4) (2023-04-24)


### Refactor

* brand URLSearchParams instead of extending URLSearchParams ([8e62c8a](https://github.com/panva/oauth4webapi/commit/8e62c8ab70d059e26975bbf20f986c3f6ebfaea6))

## [2.2.3](https://github.com/panva/oauth4webapi/compare/v2.2.2...v2.2.3) (2023-04-21)

## [2.2.2](https://github.com/panva/oauth4webapi/compare/v2.2.1...v2.2.2) (2023-04-21)


### Refactor

* **types:** enforce flat interfaces ([c958d61](https://github.com/panva/oauth4webapi/commit/c958d61885f67078998d7f4c214627d2323ba206))

## [2.2.1](https://github.com/panva/oauth4webapi/compare/v2.2.0...v2.2.1) (2023-04-13)


### Fixes

* return undefined from getValidatedIdTokenClaims as documented ([678b12d](https://github.com/panva/oauth4webapi/commit/678b12d4e113b4b5d599590a9b104330bf82ee56))

## [2.2.0](https://github.com/panva/oauth4webapi/compare/v2.1.0...v2.2.0) (2023-03-10)


### Features

* allow the client's assumed current time to be adjusted ([5051a5d](https://github.com/panva/oauth4webapi/commit/5051a5d06344c6721d074d67c47a5f3ec3a1ff4a)), closes [#49](https://github.com/panva/oauth4webapi/issues/49) [#50](https://github.com/panva/oauth4webapi/issues/50)
* allow the client's DateTime claims tolerance to be adjusted ([3936a56](https://github.com/panva/oauth4webapi/commit/3936a561f9f55ecd8bdd4fcd9ec6fa28e97f3114)), closes [#49](https://github.com/panva/oauth4webapi/issues/49) [#50](https://github.com/panva/oauth4webapi/issues/50)

## [2.1.0](https://github.com/panva/oauth4webapi/compare/v2.0.6...v2.1.0) (2023-02-09)


### Features

* add more asymmetric JWS algorithms ([af43ec7](https://github.com/panva/oauth4webapi/commit/af43ec710bd03b1c72315d5058bf932528f15940))

## [2.0.6](https://github.com/panva/oauth4webapi/compare/v2.0.5...v2.0.6) (2022-12-16)


### Fixes

* **build:** fixup user agent version after version bump ([e1c3ed8](https://github.com/panva/oauth4webapi/commit/e1c3ed876c6e1f1baf9b260661ba33688f89b31c))

## [2.0.5](https://github.com/panva/oauth4webapi/compare/v2.0.4...v2.0.5) (2022-12-11)

## [2.0.4](https://github.com/panva/oauth4webapi/compare/v2.0.3...v2.0.4) (2022-11-27)


### Refactor

* weak maps instead of symbols ([e551edc](https://github.com/panva/oauth4webapi/commit/e551edc7f1a43df01895161fd27d0b19e5a827d4))

## [2.0.3](https://github.com/panva/oauth4webapi/compare/v2.0.1...v2.0.3) (2022-11-25)


### Fixes

* omit zealous response cloning() to reduce edge compute memory bills ([a785223](https://github.com/panva/oauth4webapi/commit/a78522393e7b7f4ac38a35a055375dfeb645c02f)), closes [#37](https://github.com/panva/oauth4webapi/issues/37)

## [2.0.1](https://github.com/panva/oauth4webapi/compare/v2.0.0...v2.0.1) (2022-11-21)


### Fixes

* claims parameter encoding in issued request objects ([3eb165a](https://github.com/panva/oauth4webapi/commit/3eb165a425212a12cf9e48f899a999d32dd9ec86))


### Performance

* cache public DPoP CryptoKey's JWK representation for re-use ([2858d06](https://github.com/panva/oauth4webapi/commit/2858d069325da31d72bfb45dad637b5ec54e4850))

## [2.0.0](https://github.com/panva/oauth4webapi/compare/v1.4.1...v2.0.0) (2022-11-20)


### ⚠ BREAKING CHANGES

* Use the TLS server validation in `processAuthorizationCodeOpenIDResponse` to validate the issuer instead of checking the ID Token's signature. The function's `options` argument was removed.
* Use the TLS server validation in `processDeviceCodeResponse` to validate the issuer instead of checking the optional ID Token's signature. The function's `options` argument was removed.
* Use the TLS server validation in `processIntrospectionResponse` to validate the issuer instead of checking the optional JWT Introspection Response signature. The function's `options` argument was removed.
* Use the TLS server validation in `processRefreshTokenResponse` to validate the issuer instead of checking the optional ID Token's signature. The function's `options` argument was removed.
* Use the TLS server validation in `processUserInfoResponse` to validate the issuer instead of checking the optional JWT UserInfo Response signature. The function's `options` argument was removed.
* PAR w/ DPoP no longer automatically adds `dpop_jkt` to the authorization request.
* Removed `calculateJwkThumbprint` function export.
* Removed `jwksRequest` function export.
* Removed `processJwksResponse` function export.

### Refactor

* remove ignored and unused exports ([4a545df](https://github.com/panva/oauth4webapi/commit/4a545df452840c183b377809cd5ac9f5b87c2aed))
* use TLS server validation instead of jwt signature validations ([f728110](https://github.com/panva/oauth4webapi/commit/f72811023f8816e3e1a5915a99a0fa7de9163069))

## [1.4.1](https://github.com/panva/oauth4webapi/compare/v1.4.0...v1.4.1) (2022-11-20)


### Refactor

* **deno:** add mod.ts to deno.land/x ([0778278](https://github.com/panva/oauth4webapi/commit/07782786053da9a2f58fbac933832a14fdf7c613))
* use RsaHashedKeyAlgorithm in checkRsaKeyAlgorithm ([94aa31c](https://github.com/panva/oauth4webapi/commit/94aa31c7ef7729ecddb52e6e47a6edc3db3c961d))

## [1.4.0](https://github.com/panva/oauth4webapi/compare/v1.3.0...v1.4.0) (2022-11-08)


### Features

* add bun as a supported runtime ([707efd1](https://github.com/panva/oauth4webapi/commit/707efd13046cf5297427f8a8acc5282c99fd3e48))

## [1.3.0](https://github.com/panva/oauth4webapi/compare/v1.2.2...v1.3.0) (2022-10-31)


### Features

* allow to skip JWT signature validation on select responses ([44d9114](https://github.com/panva/oauth4webapi/commit/44d9114e72e8c26e9ece195d5f92e776c7efef7e))

## [1.2.2](https://github.com/panva/oauth4webapi/compare/v1.2.1...v1.2.2) (2022-10-20)


### Refactor

* add a type check on AbortSignal ([b013fef](https://github.com/panva/oauth4webapi/commit/b013fef2a4bcbee9da558748b13a022182ebe214))
* align argument and function names in assert functions ([8ea65f6](https://github.com/panva/oauth4webapi/commit/8ea65f6a22af523ca1a75565d0ce28e05b1224b9))
* update "as" error messages ([3e894f5](https://github.com/panva/oauth4webapi/commit/3e894f59e573588c0608c95cc4e2d3465a7d08f3))

## [1.2.1](https://github.com/panva/oauth4webapi/compare/v1.2.0...v1.2.1) (2022-10-10)

## [1.2.0](https://github.com/panva/oauth4webapi/compare/v1.1.4...v1.2.0) (2022-09-14)


### Features

* add experimental EdDSA (Ed25519) JWS algorithm support ([f70d4d5](https://github.com/panva/oauth4webapi/commit/f70d4d52fb5473644c2c4b4c01cb4c8938f83f4d))

## [1.1.4](https://github.com/panva/oauth4webapi/compare/v1.1.3...v1.1.4) (2022-08-26)


### Fixes

* **typescript:** resolve ts4.8 issue ([572c6de](https://github.com/panva/oauth4webapi/commit/572c6dec99915fd52c958725d1cf15b8bbea4ab4))

## [1.1.3](https://github.com/panva/oauth4webapi/compare/v1.1.2...v1.1.3) (2022-07-20)

## [1.1.2](https://github.com/panva/oauth4webapi/compare/v1.1.1...v1.1.2) (2022-07-12)

## [1.1.1](https://github.com/panva/oauth4webapi/compare/v1.1.0...v1.1.1) (2022-07-04)


### Fixes

* processing pure oauth2 code response ignores invalid ID tokens ([282705a](https://github.com/panva/oauth4webapi/commit/282705a846a5d17c3d58f566a6e9e816ee753131))

## [1.1.0](https://github.com/panva/oauth4webapi/compare/v1.0.5...v1.1.0) (2022-06-28)


### Features

* allow AbortSignal-returning function as well as an instance ([90d21b8](https://github.com/panva/oauth4webapi/commit/90d21b871c00e74fbea584c700260067edea350b))

## [1.0.5](https://github.com/panva/oauth4webapi/compare/v1.0.4...v1.0.5) (2022-06-17)


### Fixes

* allow zero-length scope in token endpoint responses ([#15](https://github.com/panva/oauth4webapi/issues/15)) ([d54c821](https://github.com/panva/oauth4webapi/commit/d54c821aeb578dea93690801282d3e3d44bda8b8))

## [1.0.4](https://github.com/panva/oauth4webapi/compare/v1.0.3...v1.0.4) (2022-06-09)


### Fixes

* do not set a user-agent in CORS-enabled runtimes ([8899a6b](https://github.com/panva/oauth4webapi/commit/8899a6b58bd8ff7784db52264bb50623b2ffa07e)), closes [#13](https://github.com/panva/oauth4webapi/issues/13)

## [1.0.3](https://github.com/panva/oauth4webapi/compare/v1.0.2...v1.0.3) (2022-05-23)


### Fixes

* skip recalculating dpop_jkt in PAR if already set ([9499ccd](https://github.com/panva/oauth4webapi/commit/9499ccd45471b2404a9894f0411352ea36395ac7))

## [1.0.2](https://github.com/panva/oauth4webapi/compare/v1.0.1...v1.0.2) (2022-05-19)

## [1.0.1](https://github.com/panva/oauth4webapi/compare/v1.0.0...v1.0.1) (2022-05-18)


### Fixes

* reject unsupported token_type values ([3d2cc0c](https://github.com/panva/oauth4webapi/commit/3d2cc0cbcd53c9d33fe0c8cae44675736459ed1a))

## [1.0.0](https://github.com/panva/oauth4webapi/compare/v0.9.0...v1.0.0) (2022-05-13)

## [0.9.0](https://github.com/panva/oauth4webapi/compare/v0.8.0...v0.9.0) (2022-05-13)


### ⚠ BREAKING CHANGES

* **types:** rename TokenEndpointAuthMethod type to ClientAuthenticationMethod

### Refactor

* **types:** rename TokenEndpointAuthMethod type to ClientAuthenticationMethod ([6028fd8](https://github.com/panva/oauth4webapi/commit/6028fd85be4489eb999c934792d0cf3baaf88af3))

## [0.8.0](https://github.com/panva/oauth4webapi/compare/v0.7.0...v0.8.0) (2022-05-06)


### ⚠ BREAKING CHANGES

* getValidatedIdTokenClaims throws if ref isnt weak referenced
* remove client_secret_jwt

### Refactor

* getValidatedIdTokenClaims throws if ref isnt weak referenced ([1ee5485](https://github.com/panva/oauth4webapi/commit/1ee54858402d3099258f78e746ee14f6185f5cdf))
* remove client_secret_jwt ([7611169](https://github.com/panva/oauth4webapi/commit/7611169deb68cd9f8283ce8356a75bf8b5ab0f7f))

## [0.7.0](https://github.com/panva/oauth4webapi/compare/v0.6.4...v0.7.0) (2022-05-05)


### ⚠ BREAKING CHANGES

* ensure supported key in calculateJwkThumbprint
* clientCredentialsGrantRequest now requires parameters

### Features

* explicitly add dpop_jkt to par request when using dpop ([e6acd99](https://github.com/panva/oauth4webapi/commit/e6acd99220188b1f13a97e9a6e8f315ba0a2dfc9))


### Refactor

* clientCredentialsGrantRequest now requires parameters ([76e4fea](https://github.com/panva/oauth4webapi/commit/76e4fea3f1f9ec19dd1e24e51d29a91f91379837))
* ensure supported key in calculateJwkThumbprint ([540f6cf](https://github.com/panva/oauth4webapi/commit/540f6cfca4ae5757757542432e543430429391a7))

## [0.6.4](https://github.com/panva/oauth4webapi/compare/v0.6.3...v0.6.4) (2022-05-04)


### Features

* add utility for calculating dpop_jkt from a crypto key ([045dd10](https://github.com/panva/oauth4webapi/commit/045dd102e0886d01d41a28ec0a338da0e3e8ebe4))

## [0.6.3](https://github.com/panva/oauth4webapi/compare/v0.6.2...v0.6.3) (2022-05-04)

## [0.6.2](https://github.com/panva/oauth4webapi/compare/v0.6.1...v0.6.2) (2022-05-03)


### Features

* add utility for generating crypto key pairs ([d8f3e90](https://github.com/panva/oauth4webapi/commit/d8f3e90d001897587b8f7b496db43080e16ac1d5))

## [0.6.1](https://github.com/panva/oauth4webapi/compare/v0.6.0...v0.6.1) (2022-05-02)


### Fixes

* **types:** validateJwtAuthResponse expectedState is optional ([e618089](https://github.com/panva/oauth4webapi/commit/e61808900805813aed59197fa8b821eb48ecc526))

## [0.6.0](https://github.com/panva/oauth4webapi/compare/v0.5.2...v0.6.0) (2022-04-28)


### ⚠ BREAKING CHANGES

* remove encrypted JAR support

### Refactor

* remove encrypted JAR support ([4352049](https://github.com/panva/oauth4webapi/commit/435204953f80567f8b1711cb5796d1c1dd8f8d40))


### Fixes

* remove sub from request object ([41d49fa](https://github.com/panva/oauth4webapi/commit/41d49fa71707c9467219670b52d44d1e1e331870))
* signed userinfo aud and iss expected values ([38edd37](https://github.com/panva/oauth4webapi/commit/38edd37ea87f6d04446ea00507167920bf494ded))

## [0.5.2](https://github.com/panva/oauth4webapi/compare/v0.5.1...v0.5.2) (2022-04-27)


### Features

* force jwks refetch every 10 minutes ([ae35bae](https://github.com/panva/oauth4webapi/commit/ae35bae4e84a66c606eb6b40f2588a1aa1955b77))


### Fixes

* correct jwks refetch minimal interval ([8af6f85](https://github.com/panva/oauth4webapi/commit/8af6f85010f415ca519c668dbf8c3bcf5961d270))

## [0.5.1](https://github.com/panva/oauth4webapi/compare/v0.5.0...v0.5.1) (2022-04-27)


### Fixes

* assert no client private key is provided unless needed ([ac6be64](https://github.com/panva/oauth4webapi/commit/ac6be64ee4160a8c8d77577a2deb02a9a0388654))
* assert no client secret is provided unless needed ([604d8f3](https://github.com/panva/oauth4webapi/commit/604d8f36071912d064b1acacac38e5cf6bd6eb7c))
* ensure issueRequestObject does not mutate input parameters ([7b62b82](https://github.com/panva/oauth4webapi/commit/7b62b8211cad052f79eba61391d61ed24af69a3b))

## [0.5.0](https://github.com/panva/oauth4webapi/compare/v0.4.0...v0.5.0) (2022-04-27)


### ⚠ BREAKING CHANGES

* **deno:** support deno ^1.21.0 (removed 1.20.x from CI)
* **types:** rename SignalledRequestOptions interface to HttpRequestOptions

### Features

* option to add headers to http requests ([94a2ecb](https://github.com/panva/oauth4webapi/commit/94a2ecb2a5f7c17c84ff3fa39bc855e2c48466d6))


### Refactor

* **deno:** support deno ^1.21.0 (removed 1.20.x from CI) ([764db58](https://github.com/panva/oauth4webapi/commit/764db587cb83e2be0a6a085f5d75d97e5841ad55))
* **types:** rename SignalledRequestOptions interface to HttpRequestOptions ([e4058d8](https://github.com/panva/oauth4webapi/commit/e4058d82c79ca17216dbaabb306a8487211952c4))

## [0.4.0](https://github.com/panva/oauth4webapi/compare/v0.3.3...v0.4.0) (2022-04-25)


### ⚠ BREAKING CHANGES

* trim down the supported JOSE algorithms

### Refactor

* trim down the supported JOSE algorithms ([3a9e9a5](https://github.com/panva/oauth4webapi/commit/3a9e9a57a6b752c9789792364baf22e577377c5c))

## [0.3.3](https://github.com/panva/oauth4webapi/compare/v0.3.2...v0.3.3) (2022-04-14)

## [0.3.2](https://github.com/panva/oauth4webapi/compare/v0.3.1...v0.3.2) (2022-04-11)


### Features

* allow all key inputs to be CryptoKey instances ([f405719](https://github.com/panva/oauth4webapi/commit/f40571911856ffed541503d16d95fd724a980639))

## [0.3.1](https://github.com/panva/oauth4webapi/compare/v0.3.0...v0.3.1) (2022-04-10)

## [0.3.0](https://github.com/panva/oauth4webapi/compare/v0.2.2...v0.3.0) (2022-04-10)


### ⚠ BREAKING CHANGES

* **types:** force types without string defaults

### Refactor

* **types:** force types without string defaults ([188b252](https://github.com/panva/oauth4webapi/commit/188b25240a542a40044373f2696c0a2ef49964fa))

## [0.2.2](https://github.com/panva/oauth4webapi/compare/v0.2.1...v0.2.2) (2022-04-07)


### Features

* add generateRandomNonce ([ad60b2c](https://github.com/panva/oauth4webapi/commit/ad60b2c32b856b08b105372a201127669e344b74))
* add generateRandomState ([a39cc6b](https://github.com/panva/oauth4webapi/commit/a39cc6b2946c7824a7fbe169d49899e3ecaf5ec0))

## [0.2.1](https://github.com/panva/oauth4webapi/compare/v0.2.0...v0.2.1) (2022-04-05)

## [0.2.0](https://github.com/panva/oauth4webapi/compare/v0.1.0...v0.2.0) (2022-04-01)


### ⚠ BREAKING CHANGES

* ensure 2048 RSA keys are used for RSA-OAEP too

### Fixes

* ensure 2048 RSA keys are used for RSA-OAEP too ([f4eda79](https://github.com/panva/oauth4webapi/commit/f4eda799b6e461c121f365af213de8bc1379dadf))

## [0.1.0](https://github.com/panva/oauth4webapi/compare/v0.0.11...v0.1.0) (2022-04-01)


### ⚠ BREAKING CHANGES

* ensure 2048 RSA keys are used

### Fixes

* ensure 2048 RSA keys are used ([ad707c0](https://github.com/panva/oauth4webapi/commit/ad707c0e22651b45972aa14d797bcb36f14cd9f3))

## [0.0.11](https://github.com/panva/oauth4webapi/compare/v0.0.10...v0.0.11) (2022-04-01)

## [0.0.10](https://github.com/panva/oauth4webapi/compare/v0.0.9...v0.0.10) (2022-03-29)


### Fixes

* remove off-spec "default optional JWT typ" checks ([34e524a](https://github.com/panva/oauth4webapi/commit/34e524a8df08e9dfce5bce724ff7061aacd8a095))

## [0.0.9](https://github.com/panva/oauth4webapi/compare/v0.0.8...v0.0.9) (2022-03-28)


### Fixes

* normalize jwt typ when one is expected ([e161ee3](https://github.com/panva/oauth4webapi/commit/e161ee37be948d5b82e216e849a3a31c19ea02da))

## [0.0.8](https://github.com/panva/oauth4webapi/compare/v0.0.7...v0.0.8) (2022-03-28)

## [0.0.7](https://github.com/panva/oauth4webapi/compare/v0.0.6...v0.0.7) (2022-03-23)

## [0.0.6](https://github.com/panva/oauth4webapi/compare/v0.0.5...v0.0.6) (2022-03-18)

## [0.0.5](https://github.com/panva/oauth4webapi/compare/v0.0.4...v0.0.5) (2022-03-17)


### Fixes

* **jarm:** correct message when jarm response is passed to validateAuthResponse ([9ef7ce8](https://github.com/panva/oauth4webapi/commit/9ef7ce8526ef45e5944881f57353495681249c19))

## [0.0.4](https://github.com/panva/oauth4webapi/compare/v0.0.3...v0.0.4) (2022-03-17)

## [0.0.3](https://github.com/panva/oauth4webapi/compare/v0.0.2...v0.0.3) (2022-03-16)


### Features

* client_secret_jwt authentication method ([93fc723](https://github.com/panva/oauth4webapi/commit/93fc723d78e6e63de0c6bf87d028c8dc0559b313))


### Fixes

* **typescript:** allow any string into "alg" and "enc" client fields ([e6a8649](https://github.com/panva/oauth4webapi/commit/e6a86493cc8039d459f0d8de03c46f3918bccd8e))

## [0.0.2](https://github.com/panva/oauth4webapi/compare/v0.0.1...v0.0.2) (2022-03-16)


### Fixes

* set a proper user-agent string ([1fbb173](https://github.com/panva/oauth4webapi/commit/1fbb1733021b286cf242292c1b61a1336d0aed72))

### 0.0.1 (2022-03-16)
