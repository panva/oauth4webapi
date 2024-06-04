import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('ensure-jarm-with-invalid-aud-fails')) {
  test.serial(rejects(flow()), module, 'unexpected JWT "aud" (audience) claim value')
}
