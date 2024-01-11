import { test, green, modules } from '../runner.js'

for (const module of modules('userinfo-bearer-header')) {
  test.serial(green(), module)
}
