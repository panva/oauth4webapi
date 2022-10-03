import type QUnit from 'qunit'

export default (QUnit: QUnit, done?: (details: QUnit.DoneDetails) => void) => {
  // @ts-ignore
  QUnit.reporters.tap.init(QUnit)
  QUnit.config.autostart = false

  return Promise.all([
    import('./callback.js'),
    import('./code_flow.js'),
    import('./generate.js'),
    import('./modulus_length.js'),
    import('./request_object.js'),
    import('./random.js'),
    import('./thumbprint.js'),
  ])
    .then(async (modules) => {
      for (const { default: module } of modules) {
        await module(QUnit)
      }
    })
    .then(() => {
      QUnit.start()
      if (done) {
        QUnit.done(done)
      }
    })
}
