import { test, green, modules } from '../runner'

for (const module of modules('kid-absent-single-jwks')) {
  test.serial(green, module)
}
