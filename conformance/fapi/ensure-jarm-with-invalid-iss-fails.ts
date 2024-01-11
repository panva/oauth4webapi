import { test, red, modules } from '../runner.js'

for (const module of modules('ensure-jarm-with-invalid-iss-fails')) {
  test.serial(red(), module, 'unexpected JWT "iss" (issuer) claim value')
}
