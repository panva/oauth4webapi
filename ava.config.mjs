export default {
  extensions: {
    ts: 'module',
    mjs: true,
  },
  require: './test/_pre.ts',
  files: ['test/**/*.ts', '!test/**/_*.ts'],
  nodeArguments: [
    '--loader=ts-node/esm',
    '--enable-source-maps',
    '--no-warnings',
    '--conditions=browser',
    '--no-experimental-fetch',
  ],
}
