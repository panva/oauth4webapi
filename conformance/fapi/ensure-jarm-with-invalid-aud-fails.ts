import { test, red, modules } from '../runner.js'

for (const module of modules('ensure-jarm-with-invalid-aud-fails')) {
  test.serial(red(), module, 'unexpected JWT "aud" (audience) claim value')
}
