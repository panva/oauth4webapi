import { test, skippable, flow, modules } from '../runner.js'

for (const module of modules('invalid-sig-rs256')) {
  test.serial(skippable(flow()), module)
}
