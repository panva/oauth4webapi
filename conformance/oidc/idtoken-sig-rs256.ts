import { test, green, modules } from '../runner.js'

for (const module of modules('idtoken-sig-rs256')) {
  test.serial(green(), module)
}
