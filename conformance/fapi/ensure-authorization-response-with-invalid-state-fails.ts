import { test, red, modules } from '../runner.js'

for (const module of modules('ensure-authorization-response-with-invalid-state-fails')) {
  test.serial(red, module, 'unexpected "state" response parameter encountered')
}
