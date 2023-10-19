import 'https://cdnjs.cloudflare.com/ajax/libs/qunit/2.20.0/qunit.js'
import run from './run.js'

run(QUnit, (stats) => {
  if (stats?.failed !== 0) {
    // @ts-ignore
    Deno.exit(1)
  }
})
