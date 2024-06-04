import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('ensure-jarm-with-invalid-iss-fails')) {
  test.serial(rejects(flow()), module, 'unexpected JWT "iss" (issuer) claim value')
}
