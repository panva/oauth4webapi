import { test, green, modules } from '../runner'

for (const module of modules('userinfo-signed')) {
  test.serial(green, module)
}
