import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('invalid-alternate-alg')) {
  test.serial(rejects(flow()), module, 'unexpected JWT "alg" header parameter')
}
