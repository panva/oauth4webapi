import { test, skippable, flow, modules } from '../runner.js'

for (const module of modules('invalid-signature')) {
  test.serial(skippable(flow()), module)
}
