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
  app.renderer.addUnknownSymbolResolver('@typescript/lib-dom', (name) => {
    if (doms.has(name)) {
      return `https://developer.mozilla.org/en-US/docs/Web/API/${name}`
    }
  })
}
