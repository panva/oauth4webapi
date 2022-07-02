import { test, red, modules, plan } from '../runner.js'

// TODO: https://gitlab.com/openid/conformance-suite/-/merge_requests/1173#note_1013999185
if (plan.name.startsWith('fapi2-advanced')) {
  test.todo('invalid-authorization-response-iss')
} else {
  for (const module of modules('invalid-authorization-response-iss')) {
    test.serial(red, module, 'unexpected "iss" issuer parameter value')
  }
}
