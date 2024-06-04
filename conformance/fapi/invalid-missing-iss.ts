import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('invalid-missing-iss')) {
  test.serial(rejects(flow()), module, 'JWT "iss" (issuer) claim missing')
}
