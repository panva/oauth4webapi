import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('ensure-authorization-response-with-invalid-missing-state-fails')) {
  test.serial(rejects(flow({ useState: true })), module, 'response parameter "state" missing')
}
