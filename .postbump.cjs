const { execSync } = require('child_process')
const { readFileSync, writeFileSync } = require('fs')
const { version } = require('./package.json')

const updates = [
  ['./src/index.ts', /const VERSION = 'v\d+\.\d+\.\d+'/gm, `const VERSION = 'v${version}'`],
  ['./README.md', /oauth4webapi@v\d+\.\d+\.\d+/gm, `oauth4webapi@v${version}`],
]

for (const [path, regex, replace] of updates) {
  writeFileSync(path, readFileSync(path, { encoding: 'utf-8' }).replace(regex, replace))
  execSync(`git add ${path}`, { stdio: 'inherit' })
}
