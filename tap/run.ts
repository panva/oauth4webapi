import type QUnit from 'qunit'

export default async (QUnit: QUnit, done: (details: QUnit.DoneDetails) => void) => {
  // @ts-ignore
  QUnit.reporters.tap.init(QUnit)
  QUnit.config.autostart = false

  const modules = await Promise.all([
    import('./callback.js'),
    import('./code_flow.js'),
    import('./generate.js'),
    import('./modulus_length.js'),
    import('./request_object.js'),
    import('./random.js'),
    import('./thumbprint.js'),
  ])
  for (const { default: module } of modules) {
    await module(QUnit)
  }
  QUnit.start()
  QUnit.done(done)
}
