import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('missing-iat')) {
  test.serial(rejects(flow()), module, 'JWT "iat" (issued at) claim missing')
}
