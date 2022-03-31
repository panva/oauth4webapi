import { test, red, modules } from './runner'

const name = import.meta.url.split('/').reverse()[0].split('.')[0]

for (const module of modules(name)) {
  test.serial(
    red,
    module,
    'error when selecting a JWT verification key, multiple applicable keys found, a "kid" JWT Header Parameter is required',
  )
}
