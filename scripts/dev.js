import { spawn } from 'node:child_process'
import { createApi } from '../server/index.js'
import { resolve } from 'node:path'

const api = createApi(
  resolve(
    process.env.API_DB_PATH || process.env.DEMO_DB_PATH || 'mock/db.local.json',
  ),
)
let frontend
let stopping = false
function stop(code = 0) {
  if (stopping) return
  stopping = true
  process.exitCode = code
  frontend?.kill()
  api.close()
}
api.on('error', (error) => {
  console.error(error.message)
  stop(1)
})
api.listen(Number(process.env.API_PORT || 3001), '127.0.0.1', () => {
  console.log(`Express API: http://127.0.0.1:${api.address().port}`)
  // Launch Node directly instead of an npm shell: compatible with Windows.
  frontend = spawn(
    process.execPath,
    [
      'node_modules/vite/bin/vite.js',
      '--host',
      '127.0.0.1',
      '--port',
      '5174',
      '--strictPort',
    ],
    { stdio: 'inherit' },
  )
  frontend.on('error', (error) => {
    console.error(error.message)
    stop(1)
  })
  frontend.on('exit', (code) => stop(code ?? 1))
})
process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())
