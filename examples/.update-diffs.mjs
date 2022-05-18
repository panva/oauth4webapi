#!/usr/bin/env node
import 'zx/globals'

const diffable = [
  ['code', 'dpop'],
  ['code', 'par'],
  ['code', 'private_key_jwt'],
  ['code', 'public'],
  ['fapi2', 'fapi2-message-signing'],
]

await Promise.all(
  diffable.map(
    ([from, to]) => $`git diff HEAD:examples/${from}.ts examples/${to}.ts > examples/${to}.diff`,
  ),
)
