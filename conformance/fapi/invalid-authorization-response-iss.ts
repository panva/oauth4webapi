import { test, red, modules } from '../runner'

for (const module of modules('invalid-authorization-response-iss')) {
  test.serial(red, module, 'unexpected "iss" issuer parameter value')
}
