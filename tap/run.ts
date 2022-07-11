import type QUnit from 'qunit'

export default (QUnit: QUnit, done?: (details: QUnit.DoneDetails) => void) => {
  // @ts-ignore
  QUnit.reporters.tap.init(QUnit)
  QUnit.config.autostart = false

  return Promise.all([
    import('./code_flow.js'),
    import('./generate.js'),
    import('./request_object.js'),
    import('./thumbprint.js'),
  ])
    .then((modules) => {
      for (const { default: module } of modules) {
        module(QUnit)
      }
    })
    .then(() => {
      QUnit.start()
      if (done) {
        QUnit.done(done)
      }
    })
}
