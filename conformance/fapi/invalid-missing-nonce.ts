import { test, skipped, modules } from '../runner.js'

for (const module of modules('invalid-missing-nonce')) {
  test.serial(skipped, module)
}
