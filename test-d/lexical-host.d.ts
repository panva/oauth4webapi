export {}

declare global {
  interface AbortSignal {}
  interface Headers {}
  interface ReadableStream<R = any> {}
  interface Request {}
  interface Response {}
  interface URL {}
  interface URLSearchParams {}

  abstract class CryptoKey {
    readonly algorithm: { name: string }
    readonly extractable: boolean
    readonly type: string
    readonly usages: string[]

    // Makes the inferred host branch distinguishable from oauth4webapi's structural fallback.
    readonly hostMarker?: true
  }

  interface CryptoKeyPair {
    privateKey: CryptoKey
    publicKey: CryptoKey
  }

  interface SubtleCrypto {
    generateKey(
      algorithm: string,
      extractable: boolean,
      keyUsages: string[],
    ): Promise<CryptoKey | CryptoKeyPair>
    exportKey(format: string, key: CryptoKey): Promise<ArrayBuffer>
  }

  interface Crypto {
    readonly subtle: SubtleCrypto
  }
}
