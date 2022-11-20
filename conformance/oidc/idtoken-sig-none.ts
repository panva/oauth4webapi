import { test, green, modules } from '../runner.js'

for (const module of modules('idtoken-sig-none')) {
  test.serial(green, module)
}
