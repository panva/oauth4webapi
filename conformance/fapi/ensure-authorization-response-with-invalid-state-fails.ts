import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('ensure-authorization-response-with-invalid-state-fails')) {
  test.serial(rejects(flow()), module, 'unexpected "state" response parameter encountered')
}
