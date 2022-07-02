import { test, red, modules } from '../runner.js'

for (const module of modules('ensure-jarm-without-iss-fails')) {
  test.serial(red, module, 'missing JWT "iss" (issuer)')
}
