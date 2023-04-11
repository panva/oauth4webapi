const doms = new Set([
  'AbortSignal',
  'CryptoKey',
  'CryptoKeyPair',
  'Headers',
  'Response',
  'URL',
  'URLSearchParams',
])

module.exports.load = function load(app) {
  app.converter.addUnknownSymbolResolver((ref) => {
    if (ref.moduleSource === 'typescript') {
      const name = ref.symbolReference.path[0].path;
      if (doms.has(name)) {
        return `https://developer.mozilla.org/en-US/docs/Web/API/${name}`
      }
    }
  })
}
