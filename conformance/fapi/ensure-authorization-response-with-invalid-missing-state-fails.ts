import { test, skippable, modules } from '../runner.js'

for (const module of modules('ensure-authorization-response-with-invalid-missing-state-fails')) {
  test.serial(skippable, module)
}
