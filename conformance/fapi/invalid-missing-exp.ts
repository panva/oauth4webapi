import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('invalid-missing-exp')) {
  test.serial(rejects(flow()), module, 'JWT "exp" (expiration time) claim missing')
}
