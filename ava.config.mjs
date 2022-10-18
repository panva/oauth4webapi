export default {
  extensions: {
    ts: 'module',
    mjs: true,
  },
  files: ['test/**/*.ts', '!test/**/_*.ts'],
  nodeArguments: [
    '--enable-source-maps',
  ],
}
