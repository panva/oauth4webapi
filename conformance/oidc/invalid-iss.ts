import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('invalid-iss')) {
  test.serial(rejects(flow()), module, 'unexpected JWT "iss" (issuer) claim value')
}
