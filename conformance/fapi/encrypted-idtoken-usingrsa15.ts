import { test, red, modules } from '../runner.js'

for (const module of modules('encrypted-idtoken-usingrsa15')) {
  test.serial(red(), module, 'failed to decrypt ID Token')
}
