const { execSync } = require('child_process')
const { readFileSync, writeFileSync } = require('fs')
const { version } = require('./package.json')

writeFileSync(
  './src/index.ts',
  readFileSync('./src/index.ts', { encoding: 'utf-8' }).replace(
    /const VERSION = 'v\d+\.\d+\.\d+'/gm,
    `const VERSION = 'v${version}'`,
  ),
)
execSync('git add src/index.ts', { stdio: 'inherit' })
writeFileSync(
  './README.md',
  readFileSync('./README.md', { encoding: 'utf-8' }).replace(
    /oauth4webapi@v\d+\.\d+\.\d+/gm,
    `oauth4webapi@v${version}`,
  ),
)
execSync('git add README.md', { stdio: 'inherit' })
