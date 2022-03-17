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
    '--enable-source-maps',
    '--no-warnings',
    '--conditions=browser',
  ],
}
