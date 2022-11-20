import { test, skipped, modules } from '../runner.js'

for (const module of modules('invalid-signature')) {
  test.serial(skipped, module)
}
