import { test, red, modules } from './runner'

const name = import.meta.url.split('/').reverse()[0].split('.')[0]

for (const module of modules(name)) {
  test.serial(red, module, 'unsupported JWS "alg" identifier', 'UnsupportedOperationError')
}
