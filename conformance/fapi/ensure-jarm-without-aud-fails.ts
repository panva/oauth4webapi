import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('ensure-jarm-without-aud-fails')) {
  test.serial(rejects(flow()), module, 'JWT "aud" (audience) claim missing')
}
