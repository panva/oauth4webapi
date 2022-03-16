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
