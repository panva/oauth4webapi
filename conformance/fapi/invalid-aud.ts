import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('invalid-aud')) {
  test.serial(rejects(flow()), module, 'unexpected JWT "aud" (audience) claim value')
}
