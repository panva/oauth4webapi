import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('ensure-jarm-with-invalid-sig-fails')) {
  test.serial(rejects(flow()), module, 'JWT signature verification failed')
}
