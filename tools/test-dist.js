// Validates the exact npm artifact rather than only the working-tree source. The tarball is installed
// in isolation so missing files, undeclared runtime imports, and unusable exports fail before
// publication.
//
// With no arguments, the publishable build is generated, packed from the working tree, and checked.
// The release workflow instead supplies its already-created tarball and the package manifest
// directory, ensuring the artifact that passes this check is the one that gets published.
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const packageName = 'oauth4webapi'
const expectedFiles = [
  'LICENSE.md',
  'README.md',
  'build/index.d.ts',
  'build/index.js',
  'build/index.js.map',
  'package.json',
]

function run(command, args, cwd = root) {
  execFileSync(command, args, { cwd, stdio: 'inherit' })
}

function manifest(directory) {
  return JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'))
}

function createTarball(destination) {
  mkdirSync(destination, { recursive: true })
  run(npm, [
    'pack',
    root,
    '--pack-destination',
    destination,
    '--cache',
    join(destination, 'npm-cache'),
  ])
  const tarballs = readdirSync(destination).filter((entry) => entry.endsWith('.tgz'))
  if (tarballs.length !== 1) {
    throw new Error(`npm pack produced ${tarballs.length} tarballs`)
  }
  return join(destination, tarballs[0])
}

function listPackageFiles(directory, prefix = '') {
  const files = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    // Dependencies are installed only for the runtime smoke test and are not part of the tarball's
    // own file contract.
    if (prefix === '' && entry.name === 'node_modules') continue
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      files.push(...listPackageFiles(join(directory, entry.name), relative))
    } else {
      files.push(relative)
    }
  }
  return files
}

function validateTarball(tarball, manifestDirectory, staging, checkTag = false) {
  if (manifestDirectory !== root) {
    throw new Error(`unsupported package manifest: ${manifestDirectory}`)
  }

  const source = manifest(manifestDirectory)
  if (source.name !== packageName) {
    throw new Error(`unexpected package name in source manifest: ${source.name}`)
  }

  const isolated = join(staging, 'installed')
  mkdirSync(isolated)
  writeFileSync(
    join(isolated, 'package.json'),
    JSON.stringify({ name: 'oauth4webapi-artifact-validation', private: true, type: 'module' }),
  )
  run(
    npm,
    [
      'install',
      '--install-strategy=hoisted',
      '--omit=dev',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--cache',
      join(staging, 'npm-cache'),
      tarball,
    ],
    isolated,
  )

  const installed = join(isolated, 'node_modules', packageName)
  const packed = manifest(installed)
  if (packed.name !== source.name || packed.version !== source.version) {
    throw new Error('the package tarball does not match the checked-out package name and version')
  }

  if (
    checkTag &&
    process.env.GITHUB_REF_NAME !== undefined &&
    process.env.GITHUB_REF_NAME !== `v${packed.version}`
  ) {
    throw new Error(
      `release tag ${process.env.GITHUB_REF_NAME} does not match ${packed.name}@${packed.version}`,
    )
  }

  const actualFiles = listPackageFiles(installed).sort()
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error(
      `packed files differ for ${source.name}\n` +
        `expected: ${expectedFiles.join(', ')}\n` +
        `actual:   ${actualFiles.join(', ')}`,
    )
  }

  writeFileSync(
    join(isolated, 'smoke.mjs'),
    `import * as oauth from ${JSON.stringify(packageName)}

for (const name of ${JSON.stringify([
      'AuthorizationResponseError',
      'authorizationCodeGrantRequest',
      'discoveryRequest',
      'generateKeyPair',
      'processAuthorizationCodeResponse',
      'validateJwtAccessToken',
    ])}) {
  if (typeof oauth[name] !== 'function') throw new Error(\`missing function export \${name}\`)
}
if (typeof oauth.customFetch !== 'symbol') throw new Error('missing customFetch symbol export')

const { privateKey, publicKey } = await oauth.generateKeyPair('ES256')
if (privateKey.type !== 'private' || publicKey.type !== 'public') {
  throw new Error('generateKeyPair did not return an asymmetric CryptoKey pair')
}

const data = new TextEncoder().encode('oauth4webapi packed artifact smoke test')
const algorithm = { name: 'ECDSA', hash: 'SHA-256' }
const signature = await crypto.subtle.sign(algorithm, privateKey, data)
if (!(await crypto.subtle.verify(algorithm, publicKey, signature, data))) {
  throw new Error('packed artifact WebCrypto round trip failed')
}
`,
  )
  run(process.execPath, ['smoke.mjs'], isolated)
  console.log(
    `validated ${basename(tarball)} as ${packed.name}@${packed.version} containing ${actualFiles.join(', ')}`,
  )
}

const args = process.argv.slice(2)
if (args.length !== 0 && args.length !== 2) {
  throw new Error('expected no arguments, or a package tarball followed by its manifest directory')
}

const staging = mkdtempSync(join(tmpdir(), 'oauth4webapi-dist-'))
try {
  if (args.length === 2) {
    validateTarball(resolve(root, args[0]), resolve(root, args[1]), staging, true)
  } else {
    run(npm, ['run', 'generate-build'])
    validateTarball(createTarball(join(staging, 'pack')), root, staging)
  }
} finally {
  rmSync(staging, { recursive: true, force: true })
}
