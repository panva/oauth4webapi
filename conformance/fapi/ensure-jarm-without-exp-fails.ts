import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('ensure-jarm-without-exp-fails')) {
  test.serial(rejects(flow()), module, 'JWT "exp" (expiration time) claim missing')
}
