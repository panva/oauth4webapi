import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('remove-authorization-response-iss')) {
  test.serial(rejects(flow()), module, 'response parameter "iss" (issuer) missing')
}
