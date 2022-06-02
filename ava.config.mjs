export default {
  extensions: {
    ts: 'module',
    mjs: true,
  },
  files: ['test/**/*.ts', '!test/**/_*.ts'],
  nodeArguments: [
    '--conditions=browser',
    '--enable-source-maps',
    '--experimental-global-webcrypto',
    '--loader=ts-node/esm',
    '--no-warnings',
  ],
}
