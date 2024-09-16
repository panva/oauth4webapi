import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('encrypted-idtoken-usingrsa15')) {
  test.serial(rejects(flow()), module, 'failed to decrypt')
}
