import { spawn } from 'node:child_process'
import { createDemoApi } from '../mock/server.js'
import { resolve } from 'node:path'

const api = createDemoApi(
  resolve(process.env.DEMO_DB_PATH || 'mock/db.local.json'),
)
api.listen(Number(process.env.API_PORT || 3001), '127.0.0.1', () => {
  console.log('Demo API started; launching Vite at http://127.0.0.1:5174')
})
const frontend = spawn(
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
function stop() {
  frontend.kill()
  api.close(() => process.exit())
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
frontend.on('exit', () => api.close())
api.on('error', (error) => {
  console.error(error.message)
  frontend.kill()
  process.exitCode = 1
})
