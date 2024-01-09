import type QUnit from 'qunit'

export default async (QUnit: QUnit, done: (details: QUnit.DoneDetails) => void) => {
  // @ts-ignore
  QUnit.reporters.tap.init(QUnit)
  QUnit.config.autostart = false

  // TODO: figure out fetch calls to localhost in workerd
  const modules = await Promise.all([
    import('./callback.js'),
    ...(typeof navigator === 'undefined' || navigator.userAgent !== 'Cloudflare-Workers'
      ? [
          import('./end2end-client-credentials.js'),
          import('./end2end-device-code.js'),
          import('./end2end.js'),
        ]
      : []),
    import('./generate.js'),
    import('./modulus_length.js'),
    import('./random.js'),
    import('./request_object.js'),
  ])
  for (const { default: module } of modules) {
    await module(QUnit)
  }
  QUnit.start()
  QUnit.done(done)
}
