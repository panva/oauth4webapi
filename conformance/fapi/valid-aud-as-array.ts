import { test, green, modules } from '../runner.js'

for (const module of modules('valid-aud-as-array')) {
  test.serial(green(), module)
}
