import QUnit from 'qunit'
import run from './run.js'

export default async () => {
  const stats = await new Promise((resolve, reject) => {
    try {
      run(QUnit, resolve)
    } catch {
      reject()
    }
  })

  return Response.json(stats);
};

export const config = {
  path: "/test"
};
