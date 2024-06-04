import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('invalid-authorization-response-iss')) {
  test.serial(rejects(flow()), module, 'unexpected "iss" (issuer) response parameter value')
}
