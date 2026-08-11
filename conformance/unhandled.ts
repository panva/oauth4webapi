import { missingHandlerMessage } from './report.js'
import { test, unhandledModules } from './runner.js'

for (const { name, path } of unhandledModules) {
  test(`missing conformance handler: ${name}`, (t) => {
    t.fail(missingHandlerMessage(name, path))
  })
}
