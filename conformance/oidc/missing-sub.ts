import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('missing-sub')) {
  test.serial(rejects(flow()), module, 'JWT "sub" (subject) claim missing')
}
