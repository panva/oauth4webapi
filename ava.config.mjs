export default {
  extensions: {
    ts: 'module',
  },
  require: './test/_pre.ts',
  files: [
    'test/**/*.ts',
    '!test/**/_*.ts'
  ],
  nodeArguments: [
    '--loader=ts-node/esm',
    '--experimental-fetch',
    '--experimental-global-webcrypto',
    '--enable-source-maps',
    '--no-warnings',
    '--conditions=browser',
  ],
}
