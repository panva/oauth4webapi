import { test, green, modules } from '../runner.js'

for (const module of modules('userinfo-signed')) {
  test.serial(green, module)
}
