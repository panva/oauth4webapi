#!/usr/bin/env node
import 'zx/globals'

const diffable = [
  ['code', 'dpop'],
  ['code', 'jarm'],
  ['code', 'par'],
  ['code', 'private_key_jwt']
]

await Promise.all(diffable.map(([from, to]) => $`git diff HEAD:examples/${from}.ts examples/${to}.ts > examples/${to}.diff`))
// TODO: exit 0 or 1 depending on updated or not and run update-diffs in CI format job
