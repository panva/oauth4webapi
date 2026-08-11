import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  test.serial(rejects(flow()), module, 'unexpected "response" body "sub" property value')
}
