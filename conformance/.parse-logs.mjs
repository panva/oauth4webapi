import * as events from 'node:events'
import * as fs from 'node:fs'
import * as readline from 'node:readline'

const input = process.argv.reverse()[0]

const rl = readline.createInterface({
  input: fs.createReadStream(input),
  crlfDelay: Infinity,
})

let currentFile

rl.on('line', (line) => {
  if (currentFile && line.includes('Test ID')) {
    throw new Error()
  }

  if (line.includes('Test ID')) {
    currentFile = `${line.split(' ').reverse()[0]}.txt`
    if (fs.existsSync(currentFile)) {
      fs.unlinkSync(currentFile)
    }
  }

  if (!currentFile) {
    return
  }

  fs.writeFileSync(currentFile, `${line}\n`, { flag: 'a' })

  if (line.includes('Test Finished')) {
    currentFile = null
  }
})

await events.once(rl, 'close')
