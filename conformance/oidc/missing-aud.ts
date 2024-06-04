import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('missing-aud')) {
  test.serial(rejects(flow()), module, 'JWT "aud" (audience) claim missing')
}
