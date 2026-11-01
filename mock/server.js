// Minimal local teaching API. No production backend or payment integration.
import { createServer } from 'node:http'
import {
  existsSync,
  readFileSync,
  writeFileSync,
  renameSync,
  mkdirSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { removeLegacySeed } from './migrations/remove-legacy-seed.js'
import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto'
import {
  PRICE_PER_TREE,
  REGIONS,
  plantingCoordinates,
  validateCredentials,
  validatePlanting,
} from '../src/utils/trees.js'

const seedPath = fileURLToPath(new URL('./seed.json', import.meta.url))
const hash = (password, salt) => scryptSync(password, salt, 64).toString('hex')
const publicUser = ({ id, name, email }) => ({ id, name, email })
const publicTree = (tree) => {
  const { requestKey, ...data } = tree
  void requestKey
  return data
}
const apiError = (status, message) =>
  Object.assign(new Error(message), { status })

async function readBody(req) {
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (Buffer.byteLength(body) > 16384)
      throw apiError(413, 'Request is too large.')
  }
  try {
    return JSON.parse(body || '{}')
  } catch {
    throw apiError(400, 'Invalid JSON request.')
  }
}

export function createDemoApi(databasePath) {
  mkdirSync(dirname(databasePath), { recursive: true })
  const db = JSON.parse(
    readFileSync(
      existsSync(databasePath) ? databasePath : seedPath,
      'utf8',
    ).replace(/^\uFEFF/, ''),
  )
  const sessions = new Map()
  if (existsSync(databasePath)) removeLegacySeed(db, databasePath)
  function persist() {
    const temporaryPath = `${databasePath}.tmp`
    writeFileSync(temporaryPath, JSON.stringify(db, null, 2))
    renameSync(temporaryPath, databasePath)
  }
  if (!db.users.some((user) => user.id === 'demo')) {
    const salt = randomBytes(16).toString('hex')
    db.users.push({
      id: 'demo',
      name: 'Demo Gardener',
      email: 'demo@example.com',
      salt,
      passwordHash: hash('DemoTree2026!', salt),
    })
  }
  persist()
  function currentUser(req) {
    const token = req.headers.authorization?.replace(/^Bearer /, '')
    const session = sessions.get(token)
    if (!session || session.expires < Date.now()) {
      sessions.delete(token)
      throw apiError(401, 'Your session has expired. Please log in again.')
    }
    const user = db.users.find((item) => item.id === session.userId)
    if (!user) throw apiError(401, 'Please log in again.')
    return user
  }
  function startSession(user) {
    for (const [key, session] of sessions)
      if (session.expires < Date.now()) sessions.delete(key)
    const token = randomBytes(32).toString('hex')
    sessions.set(token, { userId: user.id, expires: Date.now() + 86400000 })
    return { user: publicUser(user), token }
  }
  return createServer(async (req, res) => {
    const origin = req.headers.origin
    if (origin && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) {
      res.writeHead(403)
      res.end()
      return
    }
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Vary', 'Origin')
    }
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Idempotency-Key',
    )
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    function send(data, status = 200) {
      res.writeHead(status)
      res.end(JSON.stringify(data))
    }
    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }
    try {
      const url = new URL(req.url, 'http://127.0.0.1')
      const path = url.pathname
      if (req.method === 'GET' && path === '/trees')
        return send(db.trees.map(publicTree))
      if (req.method === 'GET' && path.startsWith('/trees/')) {
        const tree = db.trees.find(
          (item) => item.id === decodeURIComponent(path.slice(7)),
        )
        if (!tree) throw apiError(404, 'Tree not found.')
        return send(publicTree(tree))
      }
      if (req.method === 'GET' && path === '/auth/me')
        return send(publicUser(currentUser(req)))
      if (req.method === 'GET' && path === '/my-trees') {
        const user = currentUser(req)
        return send(
          db.trees.filter((tree) => tree.userId === user.id).map(publicTree),
        )
      }
      if (req.method !== 'POST') throw apiError(404, 'API endpoint not found.')
      const body = await readBody(req)
      if (path === '/auth/register' || path === '/auth/login') {
        const signup = path === '/auth/register'
        const error = validateCredentials(body ?? {}, signup)
        if (error) throw apiError(400, error)
        const email = body.email.trim().toLowerCase()
        let user = db.users.find((item) => item.email === email)
        if (signup) {
          if (user) throw apiError(409, 'This email is already registered.')
          const salt = randomBytes(16).toString('hex')
          user = {
            id: randomUUID(),
            name: body.name.trim(),
            email,
            salt,
            passwordHash: hash(body.password, salt),
          }
          db.users.push(user)
          try {
            persist()
          } catch (error) {
            db.users.pop()
            throw error
          }
        } else if (
          !user ||
          !timingSafeEqual(
            Buffer.from(hash(body.password, user.salt), 'hex'),
            Buffer.from(user.passwordHash, 'hex'),
          )
        ) {
          throw apiError(401, 'Incorrect email or password.')
        }
        return send(startSession(user), signup ? 201 : 200)
      }
      if (path === '/auth/logout') {
        sessions.delete(req.headers.authorization?.replace(/^Bearer /, ''))
        return send({ success: true })
      }
      if (path === '/trees') {
        const user = currentUser(req)
        const error = validatePlanting(body ?? {})
        if (error) throw apiError(400, error)
        const requestKey = req.headers['idempotency-key']
        if (
          typeof requestKey !== 'string' ||
          requestKey.length < 8 ||
          requestKey.length > 100
        )
          throw apiError(400, 'A valid planting request key is required.')
        const existing = db.trees.find(
          (tree) => tree.userId === user.id && tree.requestKey === requestKey,
        )
        if (existing) {
          if (
            ['quantity', 'species', 'region'].some(
              (field) => existing[field] !== body[field],
            )
          )
            throw apiError(
              409,
              'This request key was already used for different planting parameters.',
            )
          return send(publicTree(existing))
        }
        const { quantity, species, region } = body
        const place = REGIONS.find((item) => item.id === region)
        const coordinates = plantingCoordinates(
          region,
          db.trees.filter((tree) => tree.region === region).length,
        )
        const tree = {
          id: randomUUID(),
          userId: user.id,
          quantity,
          species,
          region,
          location: place.location,
          coordinates,
          total: quantity * PRICE_PER_TREE,
          plantedAt: new Date().toISOString().slice(0, 10),
          requestKey,
        }
        db.trees.push(tree)
        try {
          persist()
        } catch (error) {
          db.trees.pop()
          throw error
        }
        return send(publicTree(tree), 201)
      }
      throw apiError(404, 'API endpoint not found.')
    } catch (error) {
      send(
        {
          message: error.status
            ? error.message
            : 'The demo API could not save or read data.',
        },
        error.status || 500,
      )
    }
  })
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.API_PORT || 3001)
  createDemoApi(
    resolve(process.env.DEMO_DB_PATH || 'mock/db.local.json'),
  ).listen(port, '127.0.0.1', () => {
    console.log(`Demo API: http://127.0.0.1:${port}`)
  })
}
