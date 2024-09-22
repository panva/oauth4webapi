# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
