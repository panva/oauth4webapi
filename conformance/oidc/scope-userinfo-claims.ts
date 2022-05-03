import { test, green, modules } from '../runner'

for (const module of modules('scope-userinfo-claims')) {
  test.serial(green, module)
}
