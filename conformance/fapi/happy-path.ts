import { test, green, modules } from '../runner.js'

for (const module of modules('happy-path')) {
  test.serial(green, module)
}
