import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('ensure-jarm-signature-is-not-none')) {
  test.serial(rejects(flow()), module, 'unexpected JWT "alg" header parameter')
}
