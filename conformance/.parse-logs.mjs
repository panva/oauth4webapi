import * as events from 'node:events'
import * as fs from 'node:fs'
import * as readline from 'node:readline'

const input = process.argv.reverse()[0]

const rl = readline.createInterface({
  input: fs.createReadStream(input),
  crlfDelay: Infinity,
})

let currentFile
let testName
let testId

rl.on('line', (line) => {
  line = line.substring(4)
  if (currentFile && line.includes('Test ID')) {
    throw new Error()
  }

  if (line.includes('Test ID')) {
    testId = line.split(' ').reverse()[0]
    currentFile = `${testId}.txt`
    if (fs.existsSync(currentFile)) {
      fs.unlinkSync(currentFile)
    }
  }

  if (line.includes('Test Name')) {
    testName = line.split(' ').reverse()[0]
  }

  if (!currentFile) {
    return
  }

  fs.writeFileSync(currentFile, `${line}\n`, { flag: 'a' })

  if (line.includes('Test Finished')) {
    fs.renameSync(currentFile, `${testName}-${testId}.txt`)
    currentFile = testName = testId = null
  }
})

await events.once(rl, 'close')
