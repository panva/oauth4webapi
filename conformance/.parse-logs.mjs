import * as events from 'node:events'
import * as fs from 'node:fs'
import * as readline from 'node:readline'
import { parseArgs } from 'node:util'

import archiver from 'archiver'
import * as pdf from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

const {
  values: params,
  positionals: [input],
} = parseArgs({
  options: {
    submission: {
      type: 'boolean',
      default: false,
    },
    debug: {
      type: 'boolean',
      default: false,
    },
    name: {
      type: 'string',
    },
    software: {
      type: 'string',
      default: 'oauth4webapi',
    },
    version: {
      type: 'string',
    },
    conformanceVersion: {
      type: 'string',
    },
    phoneNumber: {
      type: 'string',
    },
    phoneNumber: {
      type: 'string',
    },
    address: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    city: {
      type: 'string',
    },
    zipCode: {
      type: 'string',
    },
    country: {
      type: 'string',
    },
    url: {
      type: 'string',
      default: 'https://github.com/panva/oauth4webapi',
    },
    runtime: {
      type: 'string',
      default:
        'JavaScript with a common set of Web Platform APIs (Browsers, Node.js, Deno, Bun, Cloudflare Workers, etc..)',
    },
    license: {
      type: 'string',
      default: 'MIT',
    },
    description: {
      type: 'string',
      default: 'Low-Level OAuth 2 / OpenID Connect Client API for JavaScript Runtimes',
    },
  },
  allowPositionals: true,
})

const rl = readline.createInterface({
  input: fs.createReadStream(input),
  crlfDelay: Infinity,
})

let planName
let planId
let currentFile
let testName
let testId
let conformanceProfile

const files = []

rl.on('line', (line) => {
  if (line.includes('- ID')) {
    planId = line.slice(6)
    return
  }
  if (line.includes('- Name')) {
    planName = line.slice(8)
    return
  }
  if (line.includes('- Certification Profile Name')) {
    conformanceProfile = line.slice(30)
    return
  }

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
    const fullname = `${testName}-${testId}.txt`
    files.push(fullname)
    fs.renameSync(currentFile, fullname)
    currentFile = testName = testId = null
  }
})

await events.once(rl, 'close')

if (params.submission) {
  const archive = archiver('zip')
  const dir = `./submissions/${planId}`
  await fs.promises.mkdir(dir, { recursive: true })
  const zip = fs.createWriteStream(`${dir}/client-data.zip`)
  archive.pipe(zip)
  for (const file of files) {
    archive.file(file, { name: file })
  }

  const fontUrl = 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf'
  const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer())

  const pdfDoc = await pdf.PDFDocument.load(
    await fs.promises.readFile('./conformance/template-OpenID-Certification-of-Conformance.pdf'),
  )
  pdfDoc.registerFontkit(fontkit)
  const ubuntuFont = await pdfDoc.embedFont(fontBytes)

  const form = pdfDoc.getForm()

  const date = Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
  }).format(new Date())

  const values = {
    0: params.name,
    2: params.name,
    3: `${params.software} ${params.version}`,
    4: conformanceProfile,
    5: `www.certification.openid.net (${params.conformanceVersion})`,
    6: params.name,
    8: params.phoneNumber,
    9: params.email,
    10: params.address,
    11: `${params.city}, ${params.zipCode}`,
    12: params.country,
    20: params.url,
    21: params.runtime,
    22: params.license,
    23: date,
    24: date,
  }

  form.getFields().forEach((field, i) => {
    field.setText(params.debug ? `(${i})${values[i] || ''}` : values[i] || '')
  })
  form.updateFieldAppearances(ubuntuFont)

  const pages = pdfDoc.getPages()
  pages[2].drawText(params.description, { x: 80, y: 565, size: 13, font: ubuntuFont })
  const signature = await fs.promises.readFile('./conformance/signature.png')
  const image = await pdfDoc.embedPng(signature)
  pages[0].drawImage(image, {
    x: 200,
    y: 160,
    ...image.scale(0.5),
  })

  await fs.promises.writeFile(`${dir}/OpenID-Certification-of-Conformance.pdf`, await pdfDoc.save())
  await fs.promises.writeFile(
    `${dir}/metadata.json`,
    JSON.stringify({
      conformanceProfile,
      planId,
      planName,
    }, null, 4),
  )

  await archive.finalize()
  for (const file of files) {
    fs.unlinkSync(file)
  }
  await events.once(zip, 'close')
}

fs.unlinkSync(input)
