import { test, red, modules } from '../runner.js'

for (const module of modules('userinfo-invalid-sub')) {
  test.serial(red, module, 'unexpected "response" body "sub" value')
}
