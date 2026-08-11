import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  test.serial(
    rejects(flow()),
    module,
    '"response" body "issuer" property does not match the expected value',
  )
}
