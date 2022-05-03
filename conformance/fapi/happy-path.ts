import { test, green, modules } from '../runner'

for (const module of modules('happy-path')) {
  test.serial(green, module)
}
