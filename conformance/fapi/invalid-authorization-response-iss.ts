import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-authorization-response-iss')) {
  test.serial(red, module, 'unexpected "iss" (issuer) response parameter value')
}
