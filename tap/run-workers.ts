import QUnit from 'qunit'
import run from './run.js'

addEventListener('fetch', (event) => {
  // @ts-ignore
  event.respondWith(
    new Promise((resolve) => {
      run(QUnit, (results) => {
        // @ts-ignore
        resolve(Response.json({ ...results }))
      })
    }),
  )
})
